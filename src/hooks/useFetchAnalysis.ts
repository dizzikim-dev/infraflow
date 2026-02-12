/**
 * useFetchAnalysis — Generic fetch hook factory for analysis endpoints.
 *
 * Abstracts the common pattern shared by useCloudCatalog, useBenchmark,
 * and useIndustryCompliance:
 *   - Race condition prevention via requestIdRef
 *   - Loading state management
 *   - Null/empty spec guard with default reset
 *   - JSON POST fetch with error handling
 *
 * Each consumer hook supplies only the endpoint, body builder,
 * result extractor, and default result value.
 */

import { useState, useEffect, useRef } from 'react';
import type { InfraSpec } from '@/types/infra';

export interface UseFetchAnalysisOptions<TResult> {
  /** API endpoint to POST to */
  endpoint: string;
  /** Build the JSON body for the request (spec is always included by the hook) */
  buildBody: () => Record<string, unknown>;
  /** Extract the typed result from the response JSON */
  extractResult: (data: Record<string, unknown>) => TResult;
  /** Default/empty value returned when spec is null or nodes are empty */
  defaultResult: TResult;
  /** Whether the fetch is enabled; defaults to true */
  enabled?: boolean;
}

export interface UseFetchAnalysisReturn<TResult> {
  result: TResult;
  isLoading: boolean;
}

/**
 * Generic analysis fetch hook.
 *
 * @param spec      The current infrastructure spec (null when no diagram)
 * @param options   Configuration for the specific analysis endpoint
 * @param deps      Extra dependency values that should trigger a re-fetch
 *                  (beyond spec itself — e.g. selectedTier, selectedIndustry)
 */
export function useFetchAnalysis<TResult>(
  spec: InfraSpec | null,
  options: UseFetchAnalysisOptions<TResult>,
  deps: unknown[] = [],
): UseFetchAnalysisReturn<TResult> {
  const { endpoint, buildBody, extractResult, defaultResult, enabled = true } = options;

  const [result, setResult] = useState<TResult>(defaultResult);
  const [isLoading, setIsLoading] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!enabled || !spec || spec.nodes.length === 0) {
      setResult(defaultResult);
      return;
    }

    const currentId = ++requestIdRef.current;
    setIsLoading(true);

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildBody()),
    })
      .then(res => res.json())
      .then(data => {
        if (currentId !== requestIdRef.current) return;
        setResult(extractResult(data));
        setIsLoading(false);
      })
      .catch(() => {
        if (currentId !== requestIdRef.current) return;
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec, enabled, ...deps]);

  return { result, isLoading };
}
