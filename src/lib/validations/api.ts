/**
 * API Request Validation Schemas
 *
 * Zod schemas for validating API route request bodies.
 */

import { z } from 'zod';
import type { InfraSpec } from '@/types';

// ============================================================
// /api/parse - Smart Parse Request
// ============================================================

const InfraSpecSchema: z.ZodType<InfraSpec> = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  nodes: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      label: z.string(),
      tier: z.string().optional(),
      zone: z.string().optional(),
      description: z.string().optional(),
    })
  ),
  connections: z.array(
    z.object({
      source: z.string(),
      target: z.string(),
      flowType: z.string().optional(),
      label: z.string().optional(),
      bidirectional: z.boolean().optional(),
    })
  ),
  zones: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        type: z.enum(['dmz', 'internal', 'external', 'db', 'custom']),
        color: z.string().optional(),
      })
    )
    .optional(),
  policies: z.array(z.any()).optional(),
}) as z.ZodType<InfraSpec>;

export const ParseRequestSchema = z.object({
  prompt: z
    .string()
    .min(1, '프롬프트를 입력하세요')
    .max(5000, '프롬프트는 최대 5000자까지 입력할 수 있습니다'),
  context: z
    .object({
      currentSpec: InfraSpecSchema.nullable().optional(),
      history: z
        .array(
          z.object({
            prompt: z.string(),
            timestamp: z.number(),
          })
        )
        .optional(),
    })
    .optional(),
  provider: z.enum(['claude', 'openai']).default('claude'),
  model: z.string().optional(),
  useLLM: z.boolean().default(true),
});

export type ParseRequest = z.infer<typeof ParseRequestSchema>;

// ============================================================
// /api/llm - LLM Generation Request
// ============================================================

export const LLMRequestSchema = z.object({
  prompt: z
    .string()
    .min(1, '프롬프트를 입력하세요')
    .max(5000, '프롬프트는 최대 5000자까지 입력할 수 있습니다'),
  provider: z.enum(['claude', 'openai']),
  model: z.string().optional(),
  useFallback: z.boolean().default(true),
});

export type LLMRequest = z.infer<typeof LLMRequestSchema>;
