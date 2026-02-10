/**
 * useVulnerabilities Hook
 *
 * Analyzes the current InfraSpec for known vulnerabilities
 * and returns aggregated results with severity counts.
 */

import { useMemo } from 'react';
import type { InfraSpec } from '@/types/infra';
import {
  getVulnerabilitiesForSpec,
  getVulnerabilityStats,
  type VulnerabilityEntry,
  type VulnerabilityStats,
} from '@/lib/knowledge/vulnerabilities';

export interface UseVulnerabilitiesResult {
  vulnerabilities: VulnerabilityEntry[];
  criticalCount: number;
  highCount: number;
  stats: VulnerabilityStats;
}

export function useVulnerabilities(spec: InfraSpec | null): UseVulnerabilitiesResult {
  return useMemo(() => {
    if (!spec || spec.nodes.length === 0) {
      return {
        vulnerabilities: [],
        criticalCount: 0,
        highCount: 0,
        stats: { total: 0, critical: 0, high: 0, medium: 0, low: 0, affectedComponentTypes: 0 },
      };
    }

    const vulnerabilities = getVulnerabilitiesForSpec(spec);
    const stats = getVulnerabilityStats(vulnerabilities);

    return {
      vulnerabilities,
      criticalCount: stats.critical,
      highCount: stats.high,
      stats,
    };
  }, [spec]);
}
