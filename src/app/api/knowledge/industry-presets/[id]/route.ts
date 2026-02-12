/**
 * Knowledge Industry Preset API - 단일 조회 / 수정 / 삭제
 *
 * Note: No semantic ID fallback (industryType is not used for lookup by ID param)
 */

import { createKnowledgeDetailRoute } from '@/lib/api/knowledgeRouteFactory';
import {
  KnowledgeListQuerySchema,
  CreateIndustryPresetSchema,
  UpdateIndustryPresetSchema,
} from '@/lib/validations/knowledge';

export const { GET, PUT, DELETE } = createKnowledgeDetailRoute({
  modelName: 'knowledgeIndustryPreset',
  resourceNameKo: '업종 프리셋',
  loggerName: 'IndustryPreset',
  querySchema: KnowledgeListQuerySchema,
  createSchema: CreateIndustryPresetSchema,
  updateSchema: UpdateIndustryPresetSchema,
  filters: [],
  searchFields: [],
  uniqueKey: { field: 'industryType' },
  semanticIdField: null,
  jsonFields: [],
});
