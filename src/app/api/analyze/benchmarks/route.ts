import { createAnalyzeRoute } from '@/lib/api/analyzeRouteFactory';
import { recommendSizing, estimateCapacity, findBottlenecks, type TrafficTier } from '@/lib/knowledge/benchmarks';

export const POST = createAnalyzeRoute({
  name: 'Benchmark',
  handler: (spec, params) => {
    const tier = (params.tier as TrafficTier) || 'medium';
    const recommendations = recommendSizing(spec, tier);
    const capacity = estimateCapacity(spec);
    const bottlenecks = findBottlenecks(spec);
    return { recommendations, capacity, bottlenecks };
  },
});
