/**
 * Knowledge Pattern API - 단일 조회 / 수정 / 삭제
 */

import { createKnowledgeDetailRoute } from '@/lib/api/knowledgeRouteFactory';
import {
  KnowledgeListQuerySchema,
  CreatePatternSchema,
  UpdatePatternSchema,
} from '@/lib/validations/knowledge';

export const { GET, PUT, DELETE } = createKnowledgeDetailRoute({
  modelName: 'knowledgePattern',
  resourceNameKo: '패턴',
  loggerName: 'Pattern',
  querySchema: KnowledgeListQuerySchema,
  createSchema: CreatePatternSchema,
  updateSchema: UpdatePatternSchema,
  filters: [],
  searchFields: [],
  uniqueKey: { field: 'patternId' },
  semanticIdField: 'patternId',
  jsonFields: ['requiredComponents', 'optionalComponents', 'trustMetadata'],
});
