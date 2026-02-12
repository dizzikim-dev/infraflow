/**
 * Knowledge Source Entry API - 단일 조회 / 수정 / 삭제
 */

import { createKnowledgeDetailRoute } from '@/lib/api/knowledgeRouteFactory';
import {
  KnowledgeListQuerySchema,
  CreateSourceEntrySchema,
  UpdateSourceEntrySchema,
} from '@/lib/validations/knowledge';

export const { GET, PUT, DELETE } = createKnowledgeDetailRoute({
  modelName: 'knowledgeSourceEntry',
  resourceNameKo: '출처',
  loggerName: 'Source',
  querySchema: KnowledgeListQuerySchema,
  createSchema: CreateSourceEntrySchema,
  updateSchema: UpdateSourceEntrySchema,
  filters: [],
  searchFields: [],
  uniqueKey: { field: 'sourceId' },
  semanticIdField: 'sourceId',
  jsonFields: [],
});
