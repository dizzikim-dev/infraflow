/**
 * Knowledge Cloud Service API - 단일 조회 / 수정 / 삭제
 */

import { createKnowledgeDetailRoute } from '@/lib/api/knowledgeRouteFactory';
import {
  CloudServiceQuerySchema,
  CreateCloudServiceSchema,
  UpdateCloudServiceSchema,
} from '@/lib/validations/knowledge';

export const { GET, PUT, DELETE } = createKnowledgeDetailRoute({
  modelName: 'knowledgeCloudService',
  resourceNameKo: '클라우드 서비스',
  loggerName: 'CloudService',
  querySchema: CloudServiceQuerySchema,
  createSchema: CreateCloudServiceSchema,
  updateSchema: UpdateCloudServiceSchema,
  filters: [],
  searchFields: [],
  uniqueKey: { field: 'serviceId' },
  semanticIdField: 'serviceId',
  jsonFields: ['trustMetadata'],
});
