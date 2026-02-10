/**
 * useBenchmark Hook
 *
 * Provides traffic-based sizing recommendations and capacity estimation.
 */

import { useState, useMemo } from 'react';
import type { InfraSpec } from '@/types/infra';
import {
  recommendSizing,
  estimateCapacity,
  findBottlenecks,
  type TrafficTier,
  type SizingRecommendation,
  type CapacityEstimate,
  type BottleneckInfo,
} from '@/lib/knowledge/benchmarks';

export interface UseBenchmarkResult {
  selectedTier: TrafficTier;
  setTier: (tier: TrafficTier) => void;
  recommendations: SizingRecommendation[];
  capacity: CapacityEstimate | null;
  bottlenecks: BottleneckInfo[];
}

export function useBenchmark(spec: InfraSpec | null): UseBenchmarkResult {
  const [selectedTier, setTier] = useState<TrafficTier>('medium');

  const recommendations = useMemo(() => {
    if (!spec || spec.nodes.length === 0) return [];
    return recommendSizing(spec, selectedTier);
  }, [spec, selectedTier]);

  const capacity = useMemo(() => {
    if (!spec || spec.nodes.length === 0) return null;
    return estimateCapacity(spec);
  }, [spec]);

  const bottlenecks = useMemo(() => {
    if (!spec || spec.nodes.length === 0) return [];
    return findBottlenecks(spec);
  }, [spec]);

  return {
    selectedTier,
    setTier,
    recommendations,
    capacity,
    bottlenecks,
  };
}
