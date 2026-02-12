/**
 * Knowledge Benchmark API - 목록 조회 / 생성
 *
 * Note: Composite unique key [componentType, trafficTier]
 */

import { createKnowledgeListRoute } from '@/lib/api/knowledgeRouteFactory';
import {
  BenchmarkQuerySchema,
  CreateBenchmarkSchema,
  UpdateBenchmarkSchema,
} from '@/lib/validations/knowledge';

export const { GET, POST } = createKnowledgeListRoute({
  modelName: 'knowledgeBenchmark',
  resourceNameKo: '벤치마크',
  loggerName: 'Benchmarks',
  querySchema: BenchmarkQuerySchema,
  createSchema: CreateBenchmarkSchema,
  updateSchema: UpdateBenchmarkSchema,
  filters: [
    { param: 'componentType' },
    { param: 'trafficTier' },
  ],
  searchFields: ['componentType', 'recommendedSpec', 'recommendedSpecKo', 'scalingNotes', 'scalingNotesKo'],
  uniqueKey: { compositeKey: 'componentType_trafficTier', fields: ['componentType', 'trafficTier'] },
  jsonFields: ['trustMetadata'],
  extraQueryParams: ['componentType', 'trafficTier'],
});
