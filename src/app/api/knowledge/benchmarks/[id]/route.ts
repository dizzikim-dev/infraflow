/**
 * Knowledge Benchmark API - 단일 조회 / 수정 / 삭제
 *
 * Note: No semantic ID fallback (composite unique key)
 */

import { createKnowledgeDetailRoute } from '@/lib/api/knowledgeRouteFactory';
import {
  BenchmarkQuerySchema,
  CreateBenchmarkSchema,
  UpdateBenchmarkSchema,
} from '@/lib/validations/knowledge';

export const { GET, PUT, DELETE } = createKnowledgeDetailRoute({
  modelName: 'knowledgeBenchmark',
  resourceNameKo: '벤치마크',
  loggerName: 'Benchmark',
  querySchema: BenchmarkQuerySchema,
  createSchema: CreateBenchmarkSchema,
  updateSchema: UpdateBenchmarkSchema,
  filters: [],
  searchFields: [],
  uniqueKey: { compositeKey: 'componentType_trafficTier', fields: ['componentType', 'trafficTier'] },
  semanticIdField: null,
  jsonFields: ['trustMetadata'],
});
