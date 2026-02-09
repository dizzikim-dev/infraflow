import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AnimationEngine,
  type AnimationEvent,
  type AnimationState,
} from '@/lib/animation/animationEngine';
import type { AnimationSequence, AnimationStep } from '@/types';

describe('AnimationEngine', () => {
  let engine: AnimationEngine;

  // Mock requestAnimationFrame and cancelAnimationFrame
  beforeEach(() => {
    engine = new AnimationEngine();
    vi.useFakeTimers();

    // Mock performance.now
    let time = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => time);

    // Mock requestAnimationFrame
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      time += 16; // ~60fps
      setTimeout(() => cb(time), 16);
      return time as number;
    });

    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    engine.destroy();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // Helper to create a test sequence
  const createTestSequence = (options?: Partial<AnimationSequence>): AnimationSequence => ({
    id: 'test-sequence',
    name: 'Test Sequence',
    steps: [
      { from: 'node-a', to: 'node-b', delay: 0, duration: 500, type: 'request' },
      { from: 'node-b', to: 'node-c', delay: 100, duration: 500, type: 'response' },
    ],
    loop: false,
    ...options,
  });

  describe('Initial State', () => {
    it('should start with default state', () => {
      const state = engine.getState();

      expect(state.isPlaying).toBe(false);
      expect(state.currentSequence).toBeNull();
      expect(state.currentStepIndex).toBe(-1);
      expect(state.speed).toBe(1);
      expect(state.activeEdges.size).toBe(0);
      expect(state.activeFlows.size).toBe(0);
    });

    it('should return a copy of state, not the original', () => {
      const state1 = engine.getState();
      const state2 = engine.getState();

      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });
  });

  describe('loadSequence', () => {
    it('should load a sequence', () => {
      const sequence = createTestSequence();
      engine.loadSequence(sequence);

      const state = engine.getState();
      expect(state.currentSequence).toEqual(sequence);
      expect(state.currentStepIndex).toBe(-1);
    });

    it('should stop any playing animation when loading new sequence', () => {
      const sequence1 = createTestSequence({ id: 'seq-1' });
      const sequence2 = createTestSequence({ id: 'seq-2' });

      engine.loadSequence(sequence1);
      engine.play();
      expect(engine.getState().isPlaying).toBe(true);

      engine.loadSequence(sequence2);
      expect(engine.getState().isPlaying).toBe(false);
      expect(engine.getState().currentSequence?.id).toBe('seq-2');
    });
  });

  describe('play', () => {
    it('should not play without a loaded sequence', () => {
      engine.play();
      expect(engine.getState().isPlaying).toBe(false);
    });

    it('should start playing a loaded sequence', () => {
      const sequence = createTestSequence();
      engine.loadSequence(sequence);
      engine.play();

      expect(engine.getState().isPlaying).toBe(true);
      expect(engine.getState().currentStepIndex).toBe(0);
    });

    it('should emit play event', () => {
      const listener = vi.fn();
      engine.subscribe(listener);

      const sequence = createTestSequence();
      engine.loadSequence(sequence);
      engine.play();

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'play' })
      );
    });

    it('should emit step-start event for first step', () => {
      const listener = vi.fn();
      engine.subscribe(listener);

      const sequence = createTestSequence();
      engine.loadSequence(sequence);
      engine.play();

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'step-start',
          stepIndex: 0,
          step: sequence.steps[0],
        })
      );
    });
  });

  describe('pause', () => {
    it('should pause a playing animation', () => {
      const sequence = createTestSequence();
      engine.loadSequence(sequence);
      engine.play();
      engine.pause();

      expect(engine.getState().isPlaying).toBe(false);
    });

    it('should emit pause event', () => {
      const listener = vi.fn();
      engine.subscribe(listener);

      const sequence = createTestSequence();
      engine.loadSequence(sequence);
      engine.play();
      engine.pause();

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'pause' })
      );
    });
  });

  describe('stop', () => {
    it('should stop and reset animation', () => {
      const sequence = createTestSequence();
      engine.loadSequence(sequence);
      engine.play();

      vi.advanceTimersByTime(100);

      engine.stop();

      const state = engine.getState();
      expect(state.isPlaying).toBe(false);
      expect(state.currentStepIndex).toBe(-1);
      expect(state.activeEdges.size).toBe(0);
      expect(state.activeFlows.size).toBe(0);
    });

    it('should emit stop event', () => {
      const listener = vi.fn();
      engine.subscribe(listener);

      const sequence = createTestSequence();
      engine.loadSequence(sequence);
      engine.play();
      engine.stop();

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'stop' })
      );
    });
  });

  describe('setSpeed', () => {
    it('should set playback speed', () => {
      engine.setSpeed(2);
      expect(engine.getState().speed).toBe(2);
    });

    it('should clamp speed to minimum 0.25', () => {
      engine.setSpeed(0.1);
      expect(engine.getState().speed).toBe(0.25);
    });

    it('should clamp speed to maximum 4', () => {
      engine.setSpeed(10);
      expect(engine.getState().speed).toBe(4);
    });
  });

  describe('nextStep / prevStep', () => {
    it('should advance to next step', () => {
      const sequence = createTestSequence();
      engine.loadSequence(sequence);
      engine.play();

      expect(engine.getState().currentStepIndex).toBe(0);

      engine.nextStep();
      expect(engine.getState().currentStepIndex).toBe(1);
    });

    it('should not go beyond last step (non-looping)', () => {
      const sequence = createTestSequence({ loop: false });
      engine.loadSequence(sequence);
      engine.play();

      engine.nextStep(); // index 1
      engine.nextStep(); // should stay at 1

      expect(engine.getState().currentStepIndex).toBe(1);
    });

    it('should loop back to first step when looping enabled', () => {
      const sequence = createTestSequence({ loop: true });
      engine.loadSequence(sequence);
      engine.play();

      engine.nextStep(); // index 1
      engine.nextStep(); // should loop to 0

      expect(engine.getState().currentStepIndex).toBe(0);
    });

    it('should go to previous step', () => {
      const sequence = createTestSequence();
      engine.loadSequence(sequence);
      engine.play();

      engine.nextStep(); // index 1
      engine.prevStep(); // index 0

      expect(engine.getState().currentStepIndex).toBe(0);
    });

    it('should not go below step 0', () => {
      const sequence = createTestSequence();
      engine.loadSequence(sequence);
      engine.play();

      engine.prevStep(); // should stay at 0

      expect(engine.getState().currentStepIndex).toBe(0);
    });
  });

  describe('subscribe / unsubscribe', () => {
    it('should subscribe to events', () => {
      const listener = vi.fn();
      engine.subscribe(listener);

      const sequence = createTestSequence();
      engine.loadSequence(sequence);
      engine.play();

      expect(listener).toHaveBeenCalled();
    });

    it('should unsubscribe from events', () => {
      const listener = vi.fn();
      const unsubscribe = engine.subscribe(listener);
      unsubscribe();

      const sequence = createTestSequence();
      engine.loadSequence(sequence);
      engine.play();

      expect(listener).not.toHaveBeenCalled();
    });

    it('should support multiple listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      engine.subscribe(listener1);
      engine.subscribe(listener2);

      const sequence = createTestSequence();
      engine.loadSequence(sequence);
      engine.play();

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('should stop animation and clear listeners', () => {
      const listener = vi.fn();
      engine.subscribe(listener);

      const sequence = createTestSequence();
      engine.loadSequence(sequence);
      engine.play();

      expect(engine.getState().isPlaying).toBe(true);

      engine.destroy();

      // After destroy, animation should be stopped
      expect(engine.getState().isPlaying).toBe(false);

      // Listeners should be cleared - new events should not trigger old listener
      listener.mockClear();
      engine.loadSequence(sequence);
      engine.play();

      // Listener should not have been called after destroy
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Edge Flow Types', () => {
    it('should handle request flow type', () => {
      const sequence = createTestSequence({
        steps: [{ from: 'a', to: 'b', delay: 0, duration: 100, type: 'request' }],
      });

      engine.loadSequence(sequence);
      engine.play();

      expect(engine.getState().currentStepIndex).toBe(0);
    });

    it('should handle response flow type', () => {
      const sequence = createTestSequence({
        steps: [{ from: 'a', to: 'b', delay: 0, duration: 100, type: 'response' }],
      });

      engine.loadSequence(sequence);
      engine.play();

      expect(engine.getState().currentStepIndex).toBe(0);
    });

    it('should handle blocked flow type', () => {
      const sequence = createTestSequence({
        steps: [{ from: 'a', to: 'b', delay: 0, duration: 100, type: 'blocked' }],
      });

      engine.loadSequence(sequence);
      engine.play();

      expect(engine.getState().currentStepIndex).toBe(0);
    });

    it('should handle encrypted flow type', () => {
      const sequence = createTestSequence({
        steps: [{ from: 'a', to: 'b', delay: 0, duration: 100, type: 'encrypted' }],
      });

      engine.loadSequence(sequence);
      engine.play();

      expect(engine.getState().currentStepIndex).toBe(0);
    });
  });
});

