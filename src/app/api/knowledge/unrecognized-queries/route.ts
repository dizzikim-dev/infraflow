/**
 * Unrecognized Queries API - 목록 조회 / 생성 (Admin)
 */

import { createKnowledgeListRoute } from '@/lib/api/knowledgeRouteFactory';
import {
  unrecognizedQuerySchema,
  createUnrecognizedQuerySchema,
  updateUnrecognizedQuerySchema,
} from '@/lib/validations/unrecognizedQuery';

export const { GET, POST } = createKnowledgeListRoute({
  modelName: 'unrecognizedQuery',
  resourceNameKo: '미인식 쿼리',
  loggerName: 'UnrecognizedQueries',
  querySchema: unrecognizedQuerySchema,
  createSchema: createUnrecognizedQuerySchema,
  updateSchema: updateUnrecognizedQuerySchema,
  filters: [
    { param: 'isResolved' },
  ],
  searchFields: ['query', 'adminNotes', 'suggestedType'],
  uniqueKey: { field: 'id' },
  jsonFields: [],
  extraQueryParams: ['isResolved'],
});
