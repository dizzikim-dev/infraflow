/**
 * useBenchmark Hook
 *
 * Provides traffic-based sizing recommendations and capacity estimation via server-side API.
 * Data processing runs server-side to reduce client bundle size.
 */

import { useState } from 'react';
import type { InfraSpec } from '@/types/infra';
import type {
  TrafficTier,
  SizingRecommendation,
  CapacityEstimate,
  BottleneckInfo,
} from '@/lib/knowledge/benchmarks';
import { useFetchAnalysis } from './useFetchAnalysis';

interface BenchmarkData {
  recommendations: SizingRecommendation[];
  capacity: CapacityEstimate | null;
  bottlenecks: BottleneckInfo[];
}

const DEFAULT_BENCHMARK: BenchmarkData = {
  recommendations: [],
  capacity: null,
  bottlenecks: [],
};

export interface UseBenchmarkResult {
  selectedTier: TrafficTier;
  setTier: (tier: TrafficTier) => void;
  recommendations: SizingRecommendation[];
  capacity: CapacityEstimate | null;
  bottlenecks: BottleneckInfo[];
  isLoading: boolean;
}

export function useBenchmark(spec: InfraSpec | null): UseBenchmarkResult {
  const [selectedTier, setTier] = useState<TrafficTier>('medium');

  const { result, isLoading } = useFetchAnalysis<BenchmarkData>(
    spec,
    {
      endpoint: '/api/analyze/benchmarks',
      buildBody: () => ({ spec, tier: selectedTier }),
      extractResult: (data) => ({
        recommendations: (data.recommendations as SizingRecommendation[]) ?? [],
        capacity: (data.capacity as CapacityEstimate) ?? null,
        bottlenecks: (data.bottlenecks as BottleneckInfo[]) ?? [],
      }),
      defaultResult: DEFAULT_BENCHMARK,
    },
    [selectedTier],
  );

  return {
    selectedTier,
    setTier,
    recommendations: result.recommendations,
    capacity: result.capacity,
    bottlenecks: result.bottlenecks,
    isLoading,
  };
}
