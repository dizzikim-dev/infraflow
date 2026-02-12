/**
 * Knowledge Source Entry API - 목록 조회 / 생성
 */

import { createKnowledgeListRoute } from '@/lib/api/knowledgeRouteFactory';
import {
  KnowledgeListQuerySchema,
  CreateSourceEntrySchema,
  UpdateSourceEntrySchema,
} from '@/lib/validations/knowledge';

export const { GET, POST } = createKnowledgeListRoute({
  modelName: 'knowledgeSourceEntry',
  resourceNameKo: '출처',
  loggerName: 'Sources',
  querySchema: KnowledgeListQuerySchema,
  createSchema: CreateSourceEntrySchema,
  updateSchema: UpdateSourceEntrySchema,
  filters: [],
  searchFields: ['sourceId', 'title', 'url', 'section'],
  uniqueKey: { field: 'sourceId' },
  semanticIdField: 'sourceId',
  jsonFields: [],
});
