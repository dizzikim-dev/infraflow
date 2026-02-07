'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AnimationEngine,
  AnimationState,
  AnimationEvent,
  FlowParticle,
} from '@/lib/animation/animationEngine';
import { useAnimationEngine } from '@/contexts/AnimationContext';
import { AnimationSequence } from '@/types';

export interface UseAnimationReturn {
  // State
  isPlaying: boolean;
  currentStepIndex: number;
  speed: number;
  particles: FlowParticle[];
  activeEdges: string[];

  // Controls
  play: () => void;
  pause: () => void;
  stop: () => void;
  togglePlay: () => void;
  setSpeed: (speed: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  loadSequence: (sequence: AnimationSequence) => void;
}

export function useAnimation(): UseAnimationReturn {
  // Get engine from context (dependency injection)
  const contextEngine = useAnimationEngine();
  const engineRef = useRef<AnimationEngine | null>(null);
  const [state, setState] = useState<AnimationState>({
    isPlaying: false,
    currentSequence: null,
    currentStepIndex: -1,
    speed: 1,
    activeEdges: new Set(),
    activeFlows: new Map(),
  });
  const [particles, setParticles] = useState<FlowParticle[]>([]);

  // Update ref when context engine changes
  useEffect(() => {
    engineRef.current = contextEngine;
  }, [contextEngine]);

  // Subscribe to engine events
  useEffect(() => {
    const engine = contextEngine;
    if (!engine) {
      console.warn('Animation engine not available from context');
      return;
    }

    const handleEvent = (event: AnimationEvent) => {
      // Re-check engine existence in event handler
      if (!engineRef.current) return;

      try {
        setState(engineRef.current.getState());

        if (event.type === 'particle-update' && event.particles) {
          setParticles([...event.particles]);
        }

        if (event.type === 'stop') {
          setParticles([]);
        }
      } catch (error) {
        console.error('Error handling animation event:', error);
      }
    };

    const unsubscribe = engine.subscribe(handleEvent);

    return () => {
      unsubscribe();
    };
  }, [contextEngine]);

  const play = useCallback(() => {
    engineRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    engineRef.current?.pause();
  }, []);

  const stop = useCallback(() => {
    engineRef.current?.stop();
  }, []);

  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  const setSpeed = useCallback((speed: number) => {
    engineRef.current?.setSpeed(speed);
    setState((prev) => ({ ...prev, speed }));
  }, []);

  const nextStep = useCallback(() => {
    engineRef.current?.nextStep();
  }, []);

  const prevStep = useCallback(() => {
    engineRef.current?.prevStep();
  }, []);

  const loadSequence = useCallback((sequence: AnimationSequence) => {
    const engine = engineRef.current;
    if (!engine) {
      console.warn('Cannot load sequence: Animation engine not initialized');
      return;
    }

    try {
      engine.loadSequence(sequence);
      setState(engine.getState());
    } catch (error) {
      console.error('Failed to load animation sequence:', error);
    }
  }, []);

  return {
    isPlaying: state.isPlaying,
    currentStepIndex: state.currentStepIndex,
    speed: state.speed,
    particles,
    activeEdges: Array.from(state.activeEdges),

    play,
    pause,
    stop,
    togglePlay,
    setSpeed,
    nextStep,
    prevStep,
    loadSequence,
  };
}
