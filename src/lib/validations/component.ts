/**
 * 인프라 컴포넌트 Zod 검증 스키마
 *
 * API 요청/응답 유효성 검사에 사용됩니다.
 */

import { z } from 'zod';

// ============================================
// Enums
// ============================================

export const ComponentCategorySchema = z.enum([
  'security',
  'network',
  'compute',
  'cloud',
  'storage',
  'auth',
  'external',
]);

export const TierTypeSchema = z.enum([
  'external',
  'dmz',
  'internal',
  'data',
]);

export const PolicyPrioritySchema = z.enum([
  'critical',
  'high',
  'medium',
  'low',
]);

export const PolicyCategorySchema = z.enum([
  'access',
  'security',
  'monitoring',
  'compliance',
  'performance',
]);

// ============================================
// Policy Schemas
// ============================================

export const CreatePolicySchema = z.object({
  name: z.string().min(1, '영문 정책명을 입력하세요').max(100),
  nameKo: z.string().min(1, '한국어 정책명을 입력하세요').max(100),
  description: z.string().min(1, '설명을 입력하세요'),
  priority: PolicyPrioritySchema,
  category: PolicyCategorySchema,
});

export const UpdatePolicySchema = CreatePolicySchema.partial();

export const PolicyResponseSchema = CreatePolicySchema.extend({
  id: z.string(),
  componentId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================
// Component Schemas
// ============================================

// 컴포넌트 ID 규칙: kebab-case, 영문 소문자, 최대 50자
const componentIdRegex = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

export const CreateComponentSchema = z.object({
  componentId: z
    .string()
    .min(1, '컴포넌트 ID를 입력하세요')
    .max(50, '컴포넌트 ID는 50자 이하여야 합니다')
    .regex(componentIdRegex, 'kebab-case 형식 (예: load-balancer, web-server)'),

  name: z.string().min(1, '영문명을 입력하세요').max(100),
  nameKo: z.string().min(1, '한국어명을 입력하세요').max(100),

  category: ComponentCategorySchema,
  tier: TierTypeSchema,

  description: z.string().min(1, '영문 설명을 입력하세요'),
  descriptionKo: z.string().min(1, '한국어 설명을 입력하세요'),

  functions: z.array(z.string()).default([]),
  functionsKo: z.array(z.string()).default([]),

  features: z.array(z.string()).default([]),
  featuresKo: z.array(z.string()).default([]),

  ports: z.array(z.string()).default([]),
  protocols: z.array(z.string()).default([]),
  vendors: z.array(z.string()).default([]),
});

export const UpdateComponentSchema = CreateComponentSchema.partial();

export const ComponentResponseSchema = CreateComponentSchema.extend({
  id: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  policies: z.array(PolicyResponseSchema).optional(),
});

// ============================================
// Query Schemas
// ============================================

export const ListQuerySchema = z.object({
  category: ComponentCategorySchema.optional(),
  tier: TierTypeSchema.optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'nameKo', 'category', 'tier', 'createdAt', 'updatedAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const SearchQuerySchema = z.object({
  q: z.string().min(1, '검색어를 입력하세요'),
  category: ComponentCategorySchema.optional(),
  tier: TierTypeSchema.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

// ============================================
// Response Schemas
// ============================================

export const PaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export const ListResponseSchema = z.object({
  data: z.array(ComponentResponseSchema),
  pagination: PaginationSchema,
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.any().optional(),
});

// ============================================
// Type Exports
// ============================================

export type ComponentCategory = z.infer<typeof ComponentCategorySchema>;
export type TierType = z.infer<typeof TierTypeSchema>;
export type PolicyPriority = z.infer<typeof PolicyPrioritySchema>;
export type PolicyCategory = z.infer<typeof PolicyCategorySchema>;

export type CreateComponentInput = z.infer<typeof CreateComponentSchema>;
export type UpdateComponentInput = z.infer<typeof UpdateComponentSchema>;
export type ComponentResponse = z.infer<typeof ComponentResponseSchema>;

export type CreatePolicyInput = z.infer<typeof CreatePolicySchema>;
export type UpdatePolicyInput = z.infer<typeof UpdatePolicySchema>;
export type PolicyResponse = z.infer<typeof PolicyResponseSchema>;

export type ListQuery = z.infer<typeof ListQuerySchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type ListResponse = z.infer<typeof ListResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
