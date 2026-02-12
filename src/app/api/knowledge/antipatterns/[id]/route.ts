/**
 * Knowledge AntiPattern API - 단일 조회 / 수정 / 삭제
 */

import { createKnowledgeDetailRoute } from '@/lib/api/knowledgeRouteFactory';
import {
  AntiPatternQuerySchema,
  CreateAntiPatternSchema,
  UpdateAntiPatternSchema,
} from '@/lib/validations/knowledge';

export const { GET, PUT, DELETE } = createKnowledgeDetailRoute({
  modelName: 'knowledgeAntiPattern',
  resourceNameKo: '안티패턴',
  loggerName: 'AntiPattern',
  querySchema: AntiPatternQuerySchema,
  createSchema: CreateAntiPatternSchema,
  updateSchema: UpdateAntiPatternSchema,
  filters: [],
  searchFields: [],
  uniqueKey: { field: 'antiPatternId' },
  semanticIdField: 'antiPatternId',
  jsonFields: ['trustMetadata'],
});
