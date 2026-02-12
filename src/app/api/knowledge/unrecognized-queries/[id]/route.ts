/**
 * Unrecognized Queries API - 단일 조회 / 수정 / 삭제 (Admin)
 */

import { createKnowledgeDetailRoute } from '@/lib/api/knowledgeRouteFactory';
import {
  unrecognizedQuerySchema,
  createUnrecognizedQuerySchema,
  updateUnrecognizedQuerySchema,
} from '@/lib/validations/unrecognizedQuery';

export const { GET, PUT, DELETE } = createKnowledgeDetailRoute({
  modelName: 'unrecognizedQuery',
  resourceNameKo: '미인식 쿼리',
  loggerName: 'UnrecognizedQuery',
  querySchema: unrecognizedQuerySchema,
  createSchema: createUnrecognizedQuerySchema,
  updateSchema: updateUnrecognizedQuerySchema,
  filters: [],
  searchFields: [],
  uniqueKey: { field: 'id' },
  jsonFields: [],
});
