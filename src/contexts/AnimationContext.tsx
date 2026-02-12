'use client';

import React, { createContext, useContext, useRef, useEffect, useMemo } from 'react';
import { AnimationEngine } from '@/lib/animation/animationEngine';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('AnimationContext');

interface AnimationContextValue {
  engine: AnimationEngine | null;
}

const AnimationContext = createContext<AnimationContextValue | null>(null);

interface AnimationProviderProps {
  children: React.ReactNode;
  engine?: AnimationEngine;
}

/**
 * AnimationProvider - Provides AnimationEngine via React Context
 * Replaces singleton pattern with dependency injection
 */
export function AnimationProvider({ children, engine: injectedEngine }: AnimationProviderProps) {
  const engineRef = useRef<AnimationEngine | null>(null);

  // Initialize or use injected engine
  useEffect(() => {
    if (injectedEngine) {
      engineRef.current = injectedEngine;
    } else if (!engineRef.current) {
      engineRef.current = new AnimationEngine();
    }

    return () => {
      // Only destroy if we created the engine ourselves
      if (!injectedEngine && engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, [injectedEngine]);

  const value = useMemo<AnimationContextValue>(
    () => ({
      engine: injectedEngine || engineRef.current,
    }),
    [injectedEngine]
  );

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
}

/**
 * Hook to access AnimationEngine from context
 */
export function useAnimationEngine(): AnimationEngine | null {
  const context = useContext(AnimationContext);

  if (!context) {
    log.warn(
      'useAnimationEngine must be used within an AnimationProvider. ' +
      'Falling back to creating a new engine instance.'
    );
    return null;
  }

  return context.engine;
}

/**
 * Hook to ensure AnimationEngine is available (throws if not)
 */
export function useAnimationEngineRequired(): AnimationEngine {
  const engine = useAnimationEngine();

  if (!engine) {
    throw new Error(
      'AnimationEngine is required but not available. ' +
      'Make sure to wrap your component tree with AnimationProvider.'
    );
  }

  return engine;
}
