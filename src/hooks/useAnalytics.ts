'use client';

import { useState, useCallback, useMemo } from 'react';
import type {
  CoOccurrenceInsight,
  PatternFrequencyInsight,
  FailedPromptInsight,
  PlacementCorrection,
  RelationshipSuggestion,
} from '@/lib/learning/types';
import { getFeedbackStore } from '@/lib/learning/feedbackStore';
import { getUsageStore } from '@/lib/learning/usageStore';
import {
  analyzeCoOccurrences,
  analyzePatternFrequency,
  analyzeFailedPrompts,
  analyzePlacementCorrections,
  suggestNewRelationships,
} from '@/lib/learning/analyticsEngine';
import { PATTERNS, RELATIONSHIPS } from '@/lib/knowledge';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('useAnalytics');

export interface AnalyticsData {
  coOccurrences: CoOccurrenceInsight[];
  patternFrequency: PatternFrequencyInsight[];
  failedPrompts: FailedPromptInsight[];
  placementCorrections: PlacementCorrection[];
  relationshipSuggestions: RelationshipSuggestion[];
}

export interface UseAnalyticsReturn {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const EMPTY_DATA: AnalyticsData = {
  coOccurrences: [],
  patternFrequency: [],
  failedPrompts: [],
  placementCorrections: [],
  relationshipSuggestions: [],
};

/**
 * Hook for accessing analytics data.
 * Performs lazy computation — only fetches/analyzes when refresh() is called.
 */
export function useAnalytics(): UseAnalyticsReturn {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build pattern lookup map
  const patternLookup = useMemo(() => {
    const map = new Map<string, { name: string; nameKo: string }>();
    for (const p of PATTERNS) {
      map.set(p.id, { name: p.name, nameKo: p.nameKo });
    }
    return map;
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const feedbackStore = getFeedbackStore();
      const usageStore = getUsageStore();

      const [feedbacks, events] = await Promise.all([
        feedbackStore.getAll(),
        usageStore.getAll(),
      ]);

      if (feedbacks.length === 0 && events.length === 0) {
        setData(EMPTY_DATA);
        return;
      }

      const coOccurrences = analyzeCoOccurrences(feedbacks);
      const patternFrequency = analyzePatternFrequency(events, feedbacks, patternLookup);
      const failedPrompts = analyzeFailedPrompts(events);
      const placementCorrections = analyzePlacementCorrections(feedbacks);
      const relationshipSuggestions = suggestNewRelationships(coOccurrences, [...RELATIONSHIPS]);

      setData({
        coOccurrences,
        patternFrequency,
        failedPrompts,
        placementCorrections,
        relationshipSuggestions,
      });

      log.info('Analytics refreshed', {
        feedbacks: feedbacks.length,
        events: events.length,
        coOccurrences: coOccurrences.length,
        patternFrequency: patternFrequency.length,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analytics computation failed';
      log.error('Analytics error', err instanceof Error ? err : new Error(String(err)));
      setError(message);
      setData(EMPTY_DATA);
    } finally {
      setIsLoading(false);
    }
  }, [patternLookup]);

  return { data, isLoading, error, refresh };
}
