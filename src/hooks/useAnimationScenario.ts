'use client';

import { useState, useCallback } from 'react';
import { generateFlowSequence, ScenarioType } from '@/lib/animation';
import { InfraSpec, AnimationSequence } from '@/types';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('useAnimationScenario');

export interface UseAnimationScenarioReturn {
  currentScenario: ScenarioType | null;
  animationSequence: AnimationSequence | null;
  handleScenarioSelect: (type: ScenarioType) => void;
  resetAnimation: () => void;
}

interface UseAnimationScenarioConfig {
  currentSpec: InfraSpec | null;
}

/**
 * Hook for managing animation scenario selection
 * Generates flow sequences based on selected scenarios
 */
export function useAnimationScenario(
  config: UseAnimationScenarioConfig
): UseAnimationScenarioReturn {
  const { currentSpec } = config;

  const [currentScenario, setCurrentScenario] = useState<ScenarioType | null>(null);
  const [animationSequence, setAnimationSequence] = useState<AnimationSequence | null>(null);

  /**
   * Handle scenario selection for animation
   */
  const handleScenarioSelect = useCallback(
    (type: ScenarioType) => {
      if (!currentSpec) {
        log.warn('Cannot select scenario: No current spec');
        return;
      }

      try {
        const sequence = generateFlowSequence(currentSpec, type);
        setAnimationSequence(sequence);
        setCurrentScenario(type);
      } catch (error) {
        log.error('Failed to generate flow sequence', error instanceof Error ? error : undefined);
        setAnimationSequence(null);
        setCurrentScenario(null);
      }
    },
    [currentSpec]
  );

  /**
   * Reset animation state
   */
  const resetAnimation = useCallback(() => {
    setCurrentScenario(null);
    setAnimationSequence(null);
  }, []);

  return {
    currentScenario,
    animationSequence,
    handleScenarioSelect,
    resetAnimation,
  };
}
