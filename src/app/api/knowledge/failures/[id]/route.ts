/**
 * Knowledge Failure API - 단일 조회 / 수정 / 삭제
 */

import { createKnowledgeDetailRoute } from '@/lib/api/knowledgeRouteFactory';
import {
  FailureQuerySchema,
  CreateFailureSchema,
  UpdateFailureSchema,
} from '@/lib/validations/knowledge';

export const { GET, PUT, DELETE } = createKnowledgeDetailRoute({
  modelName: 'knowledgeFailure',
  resourceNameKo: '장애 시나리오',
  loggerName: 'Failure',
  querySchema: FailureQuerySchema,
  createSchema: CreateFailureSchema,
  updateSchema: UpdateFailureSchema,
  filters: [],
  searchFields: [],
  uniqueKey: { field: 'failureId' },
  semanticIdField: 'failureId',
  jsonFields: ['trustMetadata'],
});
