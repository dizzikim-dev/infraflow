/**
 * Knowledge Pattern API - 목록 조회 / 생성
 */

import { createKnowledgeListRoute } from '@/lib/api/knowledgeRouteFactory';
import {
  KnowledgeListQuerySchema,
  CreatePatternSchema,
  UpdatePatternSchema,
} from '@/lib/validations/knowledge';

export const { GET, POST } = createKnowledgeListRoute({
  modelName: 'knowledgePattern',
  resourceNameKo: '패턴',
  loggerName: 'Patterns',
  querySchema: KnowledgeListQuerySchema,
  createSchema: CreatePatternSchema,
  updateSchema: UpdatePatternSchema,
  filters: [],
  searchFields: ['patternId', 'name', 'nameKo', 'description', 'descriptionKo'],
  uniqueKey: { field: 'patternId' },
  semanticIdField: 'patternId',
  jsonFields: ['requiredComponents', 'optionalComponents', 'trustMetadata'],
});
