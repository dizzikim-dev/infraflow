/**
 * useVulnerabilities Hook
 *
 * Analyzes the current InfraSpec for known vulnerabilities via server-side API.
 * Data processing runs server-side to reduce client bundle size.
 */

import { useState, useEffect, useRef } from 'react';
import type { InfraSpec } from '@/types/infra';
import type { VulnerabilityEntry, VulnerabilityStats } from '@/lib/knowledge/vulnerabilities';

export interface UseVulnerabilitiesResult {
  vulnerabilities: VulnerabilityEntry[];
  criticalCount: number;
  highCount: number;
  stats: VulnerabilityStats;
  isLoading: boolean;
}

const EMPTY_STATS: VulnerabilityStats = { total: 0, critical: 0, high: 0, medium: 0, low: 0, affectedComponentTypes: 0 };

export function useVulnerabilities(spec: InfraSpec | null): UseVulnerabilitiesResult {
  const [result, setResult] = useState<UseVulnerabilitiesResult>({
    vulnerabilities: [],
    criticalCount: 0,
    highCount: 0,
    stats: EMPTY_STATS,
    isLoading: false,
  });
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!spec || spec.nodes.length === 0) {
      setResult({ vulnerabilities: [], criticalCount: 0, highCount: 0, stats: EMPTY_STATS, isLoading: false });
      return;
    }

    const currentId = ++requestIdRef.current;
    setResult(prev => ({ ...prev, isLoading: true }));

    fetch('/api/analyze/vulnerabilities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spec }),
    })
      .then(res => res.json())
      .then(data => {
        if (currentId !== requestIdRef.current) return;
        const vulns: VulnerabilityEntry[] = data.vulnerabilities ?? [];
        const stats: VulnerabilityStats = data.stats ?? EMPTY_STATS;
        setResult({
          vulnerabilities: vulns,
          criticalCount: stats.critical,
          highCount: stats.high,
          stats,
          isLoading: false,
        });
      })
      .catch(() => {
        if (currentId !== requestIdRef.current) return;
        setResult(prev => ({ ...prev, isLoading: false }));
      });
  }, [spec]);

  return result;
}
