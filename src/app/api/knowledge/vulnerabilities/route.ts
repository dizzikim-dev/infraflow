/**
 * Knowledge Vulnerability API - 목록 조회 / 생성
 */

import { createKnowledgeListRoute } from '@/lib/api/knowledgeRouteFactory';
import {
  VulnerabilityQuerySchema,
  CreateVulnerabilitySchema,
  UpdateVulnerabilitySchema,
} from '@/lib/validations/knowledge';

export const { GET, POST } = createKnowledgeListRoute({
  modelName: 'knowledgeVulnerability',
  resourceNameKo: '취약점',
  loggerName: 'Vulnerabilities',
  querySchema: VulnerabilityQuerySchema,
  createSchema: CreateVulnerabilitySchema,
  updateSchema: UpdateVulnerabilitySchema,
  filters: [
    { param: 'severity' },
    { param: 'component', field: 'affectedComponents', mode: 'has' },
  ],
  searchFields: ['vulnId', 'cveId', 'title', 'titleKo', 'description', 'descriptionKo'],
  uniqueKey: { field: 'vulnId' },
  semanticIdField: 'vulnId',
  jsonFields: ['trustMetadata'],
  extraQueryParams: ['severity', 'component'],
});
