/**
 * Knowledge Industry Preset API - 목록 조회 / 생성
 */

import { createKnowledgeListRoute } from '@/lib/api/knowledgeRouteFactory';
import {
  KnowledgeListQuerySchema,
  CreateIndustryPresetSchema,
  UpdateIndustryPresetSchema,
} from '@/lib/validations/knowledge';

export const { GET, POST } = createKnowledgeListRoute({
  modelName: 'knowledgeIndustryPreset',
  resourceNameKo: '업종 프리셋',
  loggerName: 'IndustryPresets',
  querySchema: KnowledgeListQuerySchema,
  createSchema: CreateIndustryPresetSchema,
  updateSchema: UpdateIndustryPresetSchema,
  filters: [],
  searchFields: ['name', 'nameKo', 'description', 'descriptionKo'],
  uniqueKey: { field: 'industryType' },
  semanticIdField: null,
  jsonFields: [],
});
