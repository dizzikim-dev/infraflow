'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AnimationEngine,
  AnimationState,
  AnimationEvent,
  FlowParticle,
  getAnimationEngine,
} from '@/lib/animation/animationEngine';
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

  // Initialize engine
  useEffect(() => {
    engineRef.current = getAnimationEngine();
    const engine = engineRef.current;

    const handleEvent = (event: AnimationEvent) => {
      setState(engine.getState());

      if (event.type === 'particle-update' && event.particles) {
        setParticles([...event.particles]);
      }

      if (event.type === 'stop') {
        setParticles([]);
      }
    };

    const unsubscribe = engine.subscribe(handleEvent);

    return () => {
      unsubscribe();
    };
  }, []);

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
    engineRef.current?.loadSequence(sequence);
    setState(engineRef.current?.getState() || state);
  }, [state]);

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
