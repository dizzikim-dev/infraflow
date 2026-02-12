/**
 * Knowledge AntiPattern API - 목록 조회 / 생성
 */

import { createKnowledgeListRoute } from '@/lib/api/knowledgeRouteFactory';
import {
  AntiPatternQuerySchema,
  CreateAntiPatternSchema,
  UpdateAntiPatternSchema,
} from '@/lib/validations/knowledge';

export const { GET, POST } = createKnowledgeListRoute({
  modelName: 'knowledgeAntiPattern',
  resourceNameKo: '안티패턴',
  loggerName: 'AntiPatterns',
  querySchema: AntiPatternQuerySchema,
  createSchema: CreateAntiPatternSchema,
  updateSchema: UpdateAntiPatternSchema,
  filters: [
    { param: 'severity' },
  ],
  searchFields: ['antiPatternId', 'name', 'nameKo', 'problemKo', 'solutionKo'],
  uniqueKey: { field: 'antiPatternId' },
  semanticIdField: 'antiPatternId',
  jsonFields: ['trustMetadata'],
  extraQueryParams: ['severity'],
});
