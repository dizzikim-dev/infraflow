'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { nanoid } from 'nanoid';
import type { InfraSpec } from '@/types/infra';
import type {
  FeedbackRecord,
  DiagramSource,
  SpecDiff,
} from '@/lib/learning/types';
import { getFeedbackStore } from '@/lib/learning/feedbackStore';
import { computeSpecDiff } from '@/lib/learning/specDiffer';
import { detectPatterns, detectAntiPatterns } from '@/lib/knowledge';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('useFeedback');

const SESSION_ID = nanoid(8);

export interface UseFeedbackReturn {
  /** Call when a new diagram is generated to capture the original spec */
  captureOriginalSpec: (spec: InfraSpec, source: DiagramSource, prompt?: string) => void;
  /** Submit a star rating (1-5) for the current diagram */
  submitRating: (rating: number) => Promise<void>;
  /** Call when user manually modifies the diagram to capture the diff */
  captureUserModification: (modifiedSpec: InfraSpec) => void;
  /** Whether feedback collection is available */
  isAvailable: boolean;
  /** Whether a diagram is pending feedback */
  hasPendingFeedback: boolean;
  /** Whether the rating has been submitted */
  ratingSubmitted: boolean;
  /** The current pending rating (if submitted) */
  currentRating: number | null;
}

/**
 * Hook for collecting user feedback on generated diagrams.
 *
 * Workflow:
 * 1. captureOriginalSpec() — called when a diagram is generated
 * 2. User interacts with the diagram (optional modifications)
 * 3. submitRating() — user rates the result (triggers save)
 *
 * The feedback record is saved to IndexedDB via FeedbackStore.
 */
export function useFeedback(): UseFeedbackReturn {
  const [isAvailable, setIsAvailable] = useState(true);
  const [hasPendingFeedback, setHasPendingFeedback] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [currentRating, setCurrentRating] = useState<number | null>(null);

  // Refs to avoid stale closures
  const originalSpecRef = useRef<InfraSpec | null>(null);
  const sourceRef = useRef<DiagramSource>('local-parser');
  const promptRef = useRef<string | undefined>(undefined);
  const modifiedSpecRef = useRef<InfraSpec | null>(null);
  const feedbackIdRef = useRef<string>('');

  // Check store availability on mount
  useEffect(() => {
    try {
      getFeedbackStore();
      setIsAvailable(true);
    } catch {
      setIsAvailable(false);
      log.warn('Feedback store not available');
    }
  }, []);

  const captureOriginalSpec = useCallback(
    (spec: InfraSpec, source: DiagramSource, prompt?: string) => {
      originalSpecRef.current = structuredClone(spec);
      sourceRef.current = source;
      promptRef.current = prompt;
      modifiedSpecRef.current = null;
      feedbackIdRef.current = nanoid(8);
      setHasPendingFeedback(true);
      setRatingSubmitted(false);
      setCurrentRating(null);
      log.debug('Captured original spec for feedback', { source, prompt: prompt?.slice(0, 50) });
    },
    []
  );

  const captureUserModification = useCallback((modifiedSpec: InfraSpec) => {
    if (!originalSpecRef.current) return;
    modifiedSpecRef.current = structuredClone(modifiedSpec);
    log.debug('Captured user modification');
  }, []);

  const submitRating = useCallback(async (rating: number) => {
    if (!originalSpecRef.current || !isAvailable) return;

    const clampedRating = Math.max(1, Math.min(5, Math.round(rating)));
    setCurrentRating(clampedRating);
    setRatingSubmitted(true);

    try {
      const store = getFeedbackStore();
      const originalSpec = originalSpecRef.current;
      const modifiedSpec = modifiedSpecRef.current;

      // Compute diff if user modified the diagram
      let specDiff: SpecDiff = {
        operations: [],
        nodesAdded: 0,
        nodesRemoved: 0,
        nodesModified: 0,
        connectionsAdded: 0,
        connectionsRemoved: 0,
        placementChanges: [],
      };

      if (modifiedSpec) {
        specDiff = computeSpecDiff(originalSpec, modifiedSpec);
      }

      // Detect patterns and anti-patterns on the original spec
      const patterns = detectPatterns(originalSpec);
      const antiPatterns = detectAntiPatterns(originalSpec);

      const record: FeedbackRecord = {
        id: feedbackIdRef.current,
        timestamp: new Date().toISOString(),
        diagramSource: sourceRef.current,
        prompt: promptRef.current,
        originalSpec,
        userModifiedSpec: modifiedSpec ?? undefined,
        userRating: clampedRating,
        specDiff,
        placementChanges: specDiff.placementChanges,
        patternsDetected: patterns.map((p) => p.id),
        antiPatternsDetected: antiPatterns.map((a) => a.id),
        antiPatternsIgnored: [],
        antiPatternsFixed: [],
        sessionId: SESSION_ID,
      };

      await store.save(record);
      log.info('Feedback saved', { id: record.id, rating: clampedRating, source: record.diagramSource });
    } catch (error) {
      log.error('Failed to save feedback', error instanceof Error ? error : new Error(String(error)));
    }
  }, [isAvailable]);

  return {
    captureOriginalSpec,
    submitRating,
    captureUserModification,
    isAvailable,
    hasPendingFeedback,
    ratingSubmitted,
    currentRating,
  };
}
