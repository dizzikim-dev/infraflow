/**
 * Knowledge Relationship API - 목록 조회 / 생성
 */

import { createKnowledgeListRoute } from '@/lib/api/knowledgeRouteFactory';
import {
  RelationshipQuerySchema,
  CreateRelationshipSchema,
  UpdateRelationshipSchema,
} from '@/lib/validations/knowledge';

export const { GET, POST } = createKnowledgeListRoute({
  modelName: 'knowledgeRelationship',
  resourceNameKo: '관계',
  loggerName: 'Relationships',
  querySchema: RelationshipQuerySchema,
  createSchema: CreateRelationshipSchema,
  updateSchema: UpdateRelationshipSchema,
  filters: [
    { param: 'sourceComponent' },
    { param: 'targetComponent' },
    { param: 'relationshipType' },
    { param: 'strength' },
  ],
  searchFields: ['knowledgeId', 'sourceComponent', 'targetComponent', 'reason', 'reasonKo'],
  uniqueKey: { field: 'knowledgeId' },
  semanticIdField: 'knowledgeId',
  jsonFields: ['trustMetadata'],
  extraQueryParams: ['sourceComponent', 'targetComponent', 'relationshipType', 'strength'],
});
