/**
 * Knowledge Cloud Service API - 목록 조회 / 생성
 */

import { createKnowledgeListRoute } from '@/lib/api/knowledgeRouteFactory';
import {
  CloudServiceQuerySchema,
  CreateCloudServiceSchema,
  UpdateCloudServiceSchema,
} from '@/lib/validations/knowledge';

export const { GET, POST } = createKnowledgeListRoute({
  modelName: 'knowledgeCloudService',
  resourceNameKo: '클라우드 서비스',
  loggerName: 'CloudServices',
  querySchema: CloudServiceQuerySchema,
  createSchema: CreateCloudServiceSchema,
  updateSchema: UpdateCloudServiceSchema,
  filters: [
    { param: 'provider' },
    { param: 'componentType' },
    { param: 'status' },
    { param: 'pricingTier' },
  ],
  searchFields: ['serviceId', 'serviceName', 'serviceNameKo', 'componentType'],
  uniqueKey: { field: 'serviceId' },
  semanticIdField: 'serviceId',
  jsonFields: ['trustMetadata'],
  extraQueryParams: ['provider', 'componentType', 'status', 'pricingTier'],
});
