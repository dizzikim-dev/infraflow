/**
 * Knowledge Performance API - 단일 조회 / 수정 / 삭제
 */

import { createKnowledgeDetailRoute } from '@/lib/api/knowledgeRouteFactory';
import {
  PerformanceQuerySchema,
  CreatePerformanceSchema,
  UpdatePerformanceSchema,
} from '@/lib/validations/knowledge';

export const { GET, PUT, DELETE } = createKnowledgeDetailRoute({
  modelName: 'knowledgePerformance',
  resourceNameKo: '성능 프로파일',
  loggerName: 'PerformanceDetail',
  querySchema: PerformanceQuerySchema,
  createSchema: CreatePerformanceSchema,
  updateSchema: UpdatePerformanceSchema,
  filters: [],
  searchFields: [],
  uniqueKey: { field: 'performanceId' },
  semanticIdField: 'performanceId',
  jsonFields: ['latencyRange', 'throughputRange', 'trustMetadata'],
});
