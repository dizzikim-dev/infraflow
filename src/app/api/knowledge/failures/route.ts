/**
 * Knowledge Failure API - 목록 조회 / 생성
 */

import { createKnowledgeListRoute } from '@/lib/api/knowledgeRouteFactory';
import {
  FailureQuerySchema,
  CreateFailureSchema,
  UpdateFailureSchema,
} from '@/lib/validations/knowledge';

export const { GET, POST } = createKnowledgeListRoute({
  modelName: 'knowledgeFailure',
  resourceNameKo: '장애 시나리오',
  loggerName: 'Failures',
  querySchema: FailureQuerySchema,
  createSchema: CreateFailureSchema,
  updateSchema: UpdateFailureSchema,
  filters: [
    { param: 'component' },
    { param: 'impact' },
    { param: 'likelihood' },
  ],
  searchFields: ['failureId', 'component', 'titleKo', 'scenarioKo'],
  uniqueKey: { field: 'failureId' },
  semanticIdField: 'failureId',
  jsonFields: ['trustMetadata'],
  extraQueryParams: ['component', 'impact', 'likelihood'],
});
