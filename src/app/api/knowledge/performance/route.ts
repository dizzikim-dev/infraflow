/**
 * Knowledge Performance API - 목록 조회 / 생성
 */

import { createKnowledgeListRoute } from '@/lib/api/knowledgeRouteFactory';
import {
  PerformanceQuerySchema,
  CreatePerformanceSchema,
  UpdatePerformanceSchema,
} from '@/lib/validations/knowledge';

export const { GET, POST } = createKnowledgeListRoute({
  modelName: 'knowledgePerformance',
  resourceNameKo: '성능 프로파일',
  loggerName: 'Performance',
  querySchema: PerformanceQuerySchema,
  createSchema: CreatePerformanceSchema,
  updateSchema: UpdatePerformanceSchema,
  filters: [
    { param: 'component' },
    { param: 'scalingStrategy' },
  ],
  searchFields: ['performanceId', 'component', 'nameKo'],
  uniqueKey: { field: 'performanceId' },
  semanticIdField: 'performanceId',
  jsonFields: ['latencyRange', 'throughputRange', 'trustMetadata'],
  extraQueryParams: ['component', 'scalingStrategy'],
});
