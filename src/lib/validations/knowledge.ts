/**
 * Knowledge DB Zod 검증 스키마
 *
 * API 요청/응답 유효성 검사에 사용됩니다.
 */

import { z } from 'zod';

// ============================================
// Shared Enums
// ============================================

export const RelationshipTypeSchema = z.enum(['requires', 'recommends', 'conflicts', 'enhances', 'protects']);
export const RelationshipStrengthSchema = z.enum(['mandatory', 'strong', 'weak']);
export const RelationshipDirectionSchema = z.enum(['upstream', 'downstream', 'bidirectional']);
export const AntiPatternSeveritySchema = z.enum(['critical', 'high', 'medium']);
export const FailureImpactSchema = z.enum(['service_down', 'degraded', 'data_loss', 'security_breach']);
export const LikelihoodSchema = z.enum(['high', 'medium', 'low']);
export const ScalingStrategySchema = z.enum(['horizontal', 'vertical', 'both']);
export const CloudProviderSchema = z.enum(['aws', 'azure', 'gcp']);
export const ServiceStatusSchema = z.enum(['active', 'deprecated', 'preview', 'end_of_life']);
export const PricingTierSchema = z.enum(['free', 'low', 'medium', 'high', 'enterprise']);
export const TrafficTierSchema = z.enum(['small', 'medium', 'large', 'enterprise']);
export const IndustryTypeSchema = z.enum(['financial', 'healthcare', 'government', 'ecommerce', 'general']);
export const SecurityLevelSchema = z.enum(['basic', 'standard', 'enhanced', 'maximum']);
export const SourceTypeSchema = z.enum([
  'rfc', 'nist', 'cis', 'owasp', 'vendor', 'academic', 'industry', 'user_verified', 'user_unverified',
]);
export const VulnSeveritySchema = z.enum(['critical', 'high', 'medium', 'low']);

// ============================================
// Trust Metadata (shared JSON field)
// ============================================

export const KnowledgeSourceSchema = z.object({
  type: SourceTypeSchema,
  title: z.string().min(1),
  url: z.string().optional(),
  section: z.string().optional(),
  publishedDate: z.string().optional(),
  accessedDate: z.string(),
});

export const ModificationRecordSchema = z.object({
  action: z.enum(['created', 'updated', 'reviewed', 'voted']),
  by: z.string().min(1),
  at: z.string(),
  reason: z.string().optional(),
});

export const TrustMetadataSchema = z.object({
  confidence: z.number().min(0).max(1),
  sources: z.array(KnowledgeSourceSchema).min(1),
  lastReviewedAt: z.string(),
  contributedBy: z.string().optional(),
  contributedAt: z.string().optional(),
  verifiedBy: z.string().optional(),
  verifiedAt: z.string().optional(),
  upvotes: z.number().int().min(0).default(0),
  downvotes: z.number().int().min(0).default(0),
  derivedFrom: z.array(z.string()).optional(),
  lastModifiedBy: z.string().optional(),
  modificationHistory: z.array(ModificationRecordSchema).optional(),
});

// ============================================
// Knowledge Relationship
// ============================================

export const CreateRelationshipSchema = z.object({
  knowledgeId: z.string().min(1, 'Knowledge ID 필수'),
  sourceComponent: z.string().min(1, '소스 컴포넌트 필수'),
  targetComponent: z.string().min(1, '타겟 컴포넌트 필수'),
  relationshipType: RelationshipTypeSchema,
  strength: RelationshipStrengthSchema,
  direction: RelationshipDirectionSchema,
  reason: z.string().min(1, '영문 사유 필수'),
  reasonKo: z.string().min(1, '한국어 사유 필수'),
  tags: z.array(z.string()).default([]),
  trustMetadata: TrustMetadataSchema,
});

export const UpdateRelationshipSchema = CreateRelationshipSchema.partial();

// ============================================
// Knowledge Pattern
// ============================================

export const RequiredComponentSchema = z.object({
  type: z.string().min(1),
  minCount: z.number().int().min(1),
});

export const OptionalComponentSchema = z.object({
  type: z.string().min(1),
  benefit: z.string().min(1),
  benefitKo: z.string().min(1),
});

export const CreatePatternSchema = z.object({
  patternId: z.string().min(1, 'Pattern ID 필수'),
  name: z.string().min(1, '영문명 필수'),
  nameKo: z.string().min(1, '한국어명 필수'),
  description: z.string().min(1, '영문 설명 필수'),
  descriptionKo: z.string().min(1, '한국어 설명 필수'),
  requiredComponents: z.array(RequiredComponentSchema),
  optionalComponents: z.array(OptionalComponentSchema),
  scalability: z.enum(['low', 'medium', 'high', 'auto']),
  complexity: z.number().int().min(1).max(5),
  bestForKo: z.array(z.string()).default([]),
  notSuitableForKo: z.array(z.string()).default([]),
  evolvesTo: z.array(z.string()).default([]),
  evolvesFrom: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  trustMetadata: TrustMetadataSchema,
});

export const UpdatePatternSchema = CreatePatternSchema.partial();

// ============================================
// Knowledge AntiPattern
// ============================================

export const CreateAntiPatternSchema = z.object({
  antiPatternId: z.string().min(1, 'AntiPattern ID 필수'),
  name: z.string().min(1, '영문명 필수'),
  nameKo: z.string().min(1, '한국어명 필수'),
  severity: AntiPatternSeveritySchema,
  detectionRuleId: z.string().min(1, 'Detection Rule ID 필수'),
  detectionDescriptionKo: z.string().min(1, '탐지 설명 필수'),
  problemKo: z.string().min(1, '문제 설명 필수'),
  impactKo: z.string().min(1, '영향 설명 필수'),
  solutionKo: z.string().min(1, '해결책 설명 필수'),
  tags: z.array(z.string()).default([]),
  trustMetadata: TrustMetadataSchema,
});

export const UpdateAntiPatternSchema = CreateAntiPatternSchema.partial();

// ============================================
// Knowledge Failure
// ============================================

export const CreateFailureSchema = z.object({
  failureId: z.string().min(1, 'Failure ID 필수'),
  component: z.string().min(1, '컴포넌트 필수'),
  titleKo: z.string().min(1, '제목 필수'),
  scenarioKo: z.string().min(1, '시나리오 필수'),
  impact: FailureImpactSchema,
  likelihood: LikelihoodSchema,
  affectedComponents: z.array(z.string()),
  preventionKo: z.array(z.string()),
  mitigationKo: z.array(z.string()),
  estimatedMTTR: z.string().min(1, 'MTTR 필수'),
  tags: z.array(z.string()).default([]),
  trustMetadata: TrustMetadataSchema,
});

export const UpdateFailureSchema = CreateFailureSchema.partial();

// ============================================
// Knowledge Performance
// ============================================

export const LatencyRangeSchema = z.object({
  min: z.number().min(0),
  max: z.number().min(0),
  unit: z.enum(['ms', 'us']),
});

export const ThroughputRangeSchema = z.object({
  typical: z.string().min(1),
  max: z.string().min(1),
});

export const CreatePerformanceSchema = z.object({
  performanceId: z.string().min(1, 'Performance ID 필수'),
  component: z.string().min(1, '컴포넌트 필수'),
  nameKo: z.string().min(1, '한국어명 필수'),
  latencyRange: LatencyRangeSchema,
  throughputRange: ThroughputRangeSchema,
  scalingStrategy: ScalingStrategySchema,
  bottleneckIndicators: z.array(z.string()),
  bottleneckIndicatorsKo: z.array(z.string()),
  optimizationTipsKo: z.array(z.string()),
  tags: z.array(z.string()).default([]),
  trustMetadata: TrustMetadataSchema,
});

export const UpdatePerformanceSchema = CreatePerformanceSchema.partial();

// ============================================
// Knowledge Vulnerability
// ============================================

export const CreateVulnerabilitySchema = z.object({
  vulnId: z.string().min(1, 'Vulnerability ID 필수'),
  cveId: z.string().optional(),
  affectedComponents: z.array(z.string()).min(1, '영향 컴포넌트 필수'),
  severity: VulnSeveritySchema,
  cvssScore: z.number().min(0).max(10).optional(),
  title: z.string().min(1, '영문 제목 필수'),
  titleKo: z.string().min(1, '한국어 제목 필수'),
  description: z.string().min(1, '영문 설명 필수'),
  descriptionKo: z.string().min(1, '한국어 설명 필수'),
  mitigation: z.string().min(1, '영문 완화책 필수'),
  mitigationKo: z.string().min(1, '한국어 완화책 필수'),
  publishedDate: z.string().min(1, '게시일 필수'),
  references: z.array(z.string()).default([]),
  trustMetadata: TrustMetadataSchema,
});

export const UpdateVulnerabilitySchema = CreateVulnerabilitySchema.partial();

// ============================================
// Knowledge Cloud Service
// ============================================

export const CreateCloudServiceSchema = z.object({
  serviceId: z.string().min(1, 'Service ID 필수'),
  provider: CloudProviderSchema,
  componentType: z.string().min(1, '컴포넌트 유형 필수'),
  serviceName: z.string().min(1, '영문 서비스명 필수'),
  serviceNameKo: z.string().min(1, '한국어 서비스명 필수'),
  status: ServiceStatusSchema,
  successor: z.string().optional(),
  features: z.array(z.string()).default([]),
  featuresKo: z.array(z.string()).default([]),
  pricingTier: PricingTierSchema,
  trustMetadata: TrustMetadataSchema,
});

export const UpdateCloudServiceSchema = CreateCloudServiceSchema.partial();

// ============================================
// Knowledge Benchmark
// ============================================

export const CreateBenchmarkSchema = z.object({
  componentType: z.string().min(1, '컴포넌트 유형 필수'),
  trafficTier: TrafficTierSchema,
  recommendedInstanceCount: z.number().int().min(1),
  recommendedSpec: z.string().min(1, '권장 사양 필수'),
  recommendedSpecKo: z.string().min(1, '한국어 권장 사양 필수'),
  minimumInstanceCount: z.number().int().min(1),
  minimumSpec: z.string().min(1, '최소 사양 필수'),
  minimumSpecKo: z.string().min(1, '한국어 최소 사양 필수'),
  scalingNotes: z.string().min(1, '스케일링 노트 필수'),
  scalingNotesKo: z.string().min(1, '한국어 스케일링 노트 필수'),
  estimatedMonthlyCost: z.number().min(0).optional(),
  maxRPS: z.number().int().min(0),
  trustMetadata: TrustMetadataSchema,
});

export const UpdateBenchmarkSchema = CreateBenchmarkSchema.partial();

// ============================================
// Knowledge Industry Preset
// ============================================

export const CreateIndustryPresetSchema = z.object({
  industryType: IndustryTypeSchema,
  name: z.string().min(1, '영문명 필수'),
  nameKo: z.string().min(1, '한국어명 필수'),
  description: z.string().min(1, '영문 설명 필수'),
  descriptionKo: z.string().min(1, '한국어 설명 필수'),
  requiredFrameworks: z.array(z.string()),
  requiredComponents: z.array(z.string()),
  recommendedComponents: z.array(z.string()),
  minimumSecurityLevel: SecurityLevelSchema,
});

export const UpdateIndustryPresetSchema = CreateIndustryPresetSchema.partial();

// ============================================
// Knowledge Source Entry
// ============================================

export const CreateSourceEntrySchema = z.object({
  sourceId: z.string().min(1, 'Source ID 필수'),
  sourceType: SourceTypeSchema,
  title: z.string().min(1, '제목 필수'),
  url: z.string().optional(),
  section: z.string().optional(),
  publishedDate: z.string().optional(),
  accessedDate: z.string().min(1, '접근일 필수'),
});

export const UpdateSourceEntrySchema = CreateSourceEntrySchema.partial();

// ============================================
// List Query Schema (공통)
// ============================================

export const KnowledgeListQuerySchema = z.object({
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  tags: z.string().optional(), // comma-separated
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Type-specific query extensions
export const RelationshipQuerySchema = KnowledgeListQuerySchema.extend({
  sourceComponent: z.string().optional(),
  targetComponent: z.string().optional(),
  relationshipType: RelationshipTypeSchema.optional(),
  strength: RelationshipStrengthSchema.optional(),
});

export const AntiPatternQuerySchema = KnowledgeListQuerySchema.extend({
  severity: AntiPatternSeveritySchema.optional(),
});

export const FailureQuerySchema = KnowledgeListQuerySchema.extend({
  component: z.string().optional(),
  impact: FailureImpactSchema.optional(),
  likelihood: LikelihoodSchema.optional(),
});

export const PerformanceQuerySchema = KnowledgeListQuerySchema.extend({
  component: z.string().optional(),
  scalingStrategy: ScalingStrategySchema.optional(),
});

export const VulnerabilityQuerySchema = KnowledgeListQuerySchema.extend({
  severity: VulnSeveritySchema.optional(),
  component: z.string().optional(),
});

export const CloudServiceQuerySchema = KnowledgeListQuerySchema.extend({
  provider: CloudProviderSchema.optional(),
  componentType: z.string().optional(),
  status: ServiceStatusSchema.optional(),
  pricingTier: PricingTierSchema.optional(),
});

export const BenchmarkQuerySchema = KnowledgeListQuerySchema.extend({
  componentType: z.string().optional(),
  trafficTier: TrafficTierSchema.optional(),
});

// ============================================
// Type Exports
// ============================================

export type CreateRelationshipInput = z.infer<typeof CreateRelationshipSchema>;
export type UpdateRelationshipInput = z.infer<typeof UpdateRelationshipSchema>;
export type CreatePatternInput = z.infer<typeof CreatePatternSchema>;
export type UpdatePatternInput = z.infer<typeof UpdatePatternSchema>;
export type CreateAntiPatternInput = z.infer<typeof CreateAntiPatternSchema>;
export type UpdateAntiPatternInput = z.infer<typeof UpdateAntiPatternSchema>;
export type CreateFailureInput = z.infer<typeof CreateFailureSchema>;
export type UpdateFailureInput = z.infer<typeof UpdateFailureSchema>;
export type CreatePerformanceInput = z.infer<typeof CreatePerformanceSchema>;
export type UpdatePerformanceInput = z.infer<typeof UpdatePerformanceSchema>;
export type CreateVulnerabilityInput = z.infer<typeof CreateVulnerabilitySchema>;
export type UpdateVulnerabilityInput = z.infer<typeof UpdateVulnerabilitySchema>;
export type CreateCloudServiceInput = z.infer<typeof CreateCloudServiceSchema>;
export type UpdateCloudServiceInput = z.infer<typeof UpdateCloudServiceSchema>;
export type CreateBenchmarkInput = z.infer<typeof CreateBenchmarkSchema>;
export type UpdateBenchmarkInput = z.infer<typeof UpdateBenchmarkSchema>;
export type CreateIndustryPresetInput = z.infer<typeof CreateIndustryPresetSchema>;
export type UpdateIndustryPresetInput = z.infer<typeof UpdateIndustryPresetSchema>;
export type CreateSourceEntryInput = z.infer<typeof CreateSourceEntrySchema>;
export type UpdateSourceEntryInput = z.infer<typeof UpdateSourceEntrySchema>;
export type KnowledgeListQuery = z.infer<typeof KnowledgeListQuerySchema>;
export type TrustMetadataInput = z.infer<typeof TrustMetadataSchema>;
