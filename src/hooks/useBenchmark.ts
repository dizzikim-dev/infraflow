/**
 * useBenchmark Hook
 *
 * Provides traffic-based sizing recommendations and capacity estimation via server-side API.
 * Data processing runs server-side to reduce client bundle size.
 */

import { useState, useEffect, useRef } from 'react';
import type { InfraSpec } from '@/types/infra';
import type {
  TrafficTier,
  SizingRecommendation,
  CapacityEstimate,
  BottleneckInfo,
} from '@/lib/knowledge/benchmarks';

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
  const [recommendations, setRecommendations] = useState<SizingRecommendation[]>([]);
  const [capacity, setCapacity] = useState<CapacityEstimate | null>(null);
  const [bottlenecks, setBottlenecks] = useState<BottleneckInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!spec || spec.nodes.length === 0) {
      setRecommendations([]);
      setCapacity(null);
      setBottlenecks([]);
      return;
    }

    const currentId = ++requestIdRef.current;
    setIsLoading(true);

    fetch('/api/analyze/benchmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spec, tier: selectedTier }),
    })
      .then(res => res.json())
      .then(data => {
        if (currentId !== requestIdRef.current) return;
        setRecommendations(data.recommendations ?? []);
        setCapacity(data.capacity ?? null);
        setBottlenecks(data.bottlenecks ?? []);
        setIsLoading(false);
      })
      .catch(() => {
        if (currentId !== requestIdRef.current) return;
        setIsLoading(false);
      });
  }, [spec, selectedTier]);

  return { selectedTier, setTier, recommendations, capacity, bottlenecks, isLoading };
}
