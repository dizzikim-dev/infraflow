/**
 * Knowledge Vulnerability API - 단일 조회 / 수정 / 삭제
 */

import { createKnowledgeDetailRoute } from '@/lib/api/knowledgeRouteFactory';
import {
  CreateVulnerabilitySchema,
  UpdateVulnerabilitySchema,
  VulnerabilityQuerySchema,
} from '@/lib/validations/knowledge';

export const { GET, PUT, DELETE } = createKnowledgeDetailRoute({
  modelName: 'knowledgeVulnerability',
  resourceNameKo: '취약점',
  loggerName: 'Vulnerability',
  querySchema: VulnerabilityQuerySchema,
  createSchema: CreateVulnerabilitySchema,
  updateSchema: UpdateVulnerabilitySchema,
  filters: [],
  searchFields: [],
  uniqueKey: { field: 'vulnId' },
  semanticIdField: 'vulnId',
  jsonFields: ['trustMetadata'],
});
