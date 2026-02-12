/**
 * Knowledge Relationship API - 단일 조회 / 수정 / 삭제
 */

import { createKnowledgeDetailRoute } from '@/lib/api/knowledgeRouteFactory';
import {
  RelationshipQuerySchema,
  CreateRelationshipSchema,
  UpdateRelationshipSchema,
} from '@/lib/validations/knowledge';

export const { GET, PUT, DELETE } = createKnowledgeDetailRoute({
  modelName: 'knowledgeRelationship',
  resourceNameKo: '관계',
  loggerName: 'Relationship',
  querySchema: RelationshipQuerySchema,
  createSchema: CreateRelationshipSchema,
  updateSchema: UpdateRelationshipSchema,
  filters: [],
  searchFields: [],
  uniqueKey: { field: 'knowledgeId' },
  semanticIdField: 'knowledgeId',
  jsonFields: ['trustMetadata'],
});
