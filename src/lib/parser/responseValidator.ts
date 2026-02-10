/**
 * Response Validator - Validates LLM responses using Zod schemas
 */

import { z } from 'zod';
import type { Operation } from './diffApplier';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('ResponseValidator');

// Flow types
const flowTypeSchema = z.enum(['request', 'response', 'sync', 'blocked', 'encrypted']);

// Replace operation schema
const replaceOperationSchema = z.object({
  type: z.literal('replace'),
  target: z.string().min(1, '타겟 노드 ID가 필요합니다'),
  data: z.object({
    newType: z.string().min(1, '새 노드 타입이 필요합니다'),
    label: z.string().optional(),
    description: z.string().optional(),
    preserveConnections: z.boolean().optional().default(true),
  }),
});

// Add operation schema
const addOperationSchema = z.object({
  type: z.literal('add'),
  target: z.string().min(1, '추가할 노드 타입이 필요합니다'),
  data: z
    .object({
      label: z.string().optional(),
      description: z.string().optional(),
      tier: z.enum(['external', 'dmz', 'internal', 'data']).optional(),
      afterNode: z.string().optional(),
      beforeNode: z.string().optional(),
      betweenNodes: z.tuple([z.string(), z.string()]).optional(),
    })
    .optional()
    .default({}),
});

// Remove operation schema
const removeOperationSchema = z.object({
  type: z.literal('remove'),
  target: z.string().min(1, '삭제할 노드 ID가 필요합니다'),
});

// Modify operation schema
const modifyOperationSchema = z.object({
  type: z.literal('modify'),
  target: z.string().min(1, '수정할 노드 ID가 필요합니다'),
  data: z.object({
    label: z.string().optional(),
    description: z.string().optional(),
    tier: z.enum(['external', 'dmz', 'internal', 'data']).optional(),
  }),
});

// Connect operation schema
const connectOperationSchema = z.object({
  type: z.literal('connect'),
  data: z.object({
    source: z.string().min(1, '소스 노드 ID가 필요합니다'),
    target: z.string().min(1, '타겟 노드 ID가 필요합니다'),
    flowType: flowTypeSchema.optional(),
    label: z.string().optional(),
  }),
});

// Disconnect operation schema
const disconnectOperationSchema = z.object({
  type: z.literal('disconnect'),
  data: z.object({
    source: z.string().min(1, '소스 노드 ID가 필요합니다'),
    target: z.string().min(1, '타겟 노드 ID가 필요합니다'),
  }),
});

// Combined operation schema
const operationSchema = z.discriminatedUnion('type', [
  replaceOperationSchema,
  addOperationSchema,
  removeOperationSchema,
  modifyOperationSchema,
  connectOperationSchema,
  disconnectOperationSchema,
]);

// Full LLM response schema
const llmResponseSchema = z.object({
  reasoning: z.string().min(1, '변경 이유 설명이 필요합니다'),
  operations: z.array(operationSchema).min(1, '최소 하나의 작업이 필요합니다'),
});

// Export types
export type LLMResponse = z.infer<typeof llmResponseSchema>;
export type ValidatedOperation = z.infer<typeof operationSchema>;

/**
 * Validate LLM response
 */
export function validateLLMResponse(data: unknown): LLMResponse {
  const result = llmResponseSchema.safeParse(data);

  if (!result.success) {
    const errorMessages = result.error.issues
      .map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`)
      .join(', ');

    throw new LLMValidationError(
      `LLM 응답 검증 실패: ${errorMessages}`,
      result.error.issues
    );
  }

  return result.data;
}

/**
 * Find the first balanced JSON object in a string using bracket counting.
 * Returns the substring from the first '{' to its matching '}', or null if not found.
 */
function findFirstBalancedJSON(text: string): string | null {
  const startIdx = text.indexOf('{');
  if (startIdx === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = startIdx; i < text.length; i++) {
    const ch = text[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (ch === '\\' && inString) {
      escape = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return text.substring(startIdx, i + 1);
      }
    }
  }

  return null;
}

/**
 * Parse JSON from LLM text response
 */
export function parseJSONFromText(text: string): unknown {
  // Try to extract JSON from markdown code block
  const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch) {
    try {
      return JSON.parse(jsonBlockMatch[1]);
    } catch (error) {
      log.debug('JSON code block parse failed, trying next method', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  // Try to find the first balanced JSON object using bracket counting
  const balanced = findFirstBalancedJSON(text);
  if (balanced) {
    try {
      return JSON.parse(balanced);
    } catch (error) {
      log.debug('Balanced JSON parse failed, trying next method', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  throw new LLMValidationError('JSON을 찾을 수 없습니다', []);
}

/**
 * Parse and validate LLM response
 */
export function parseAndValidateLLMResponse(text: string): LLMResponse {
  const parsed = parseJSONFromText(text);
  return validateLLMResponse(parsed);
}

/**
 * Convert validated response to Operation array
 */
export function toOperations(response: LLMResponse): Operation[] {
  return response.operations as Operation[];
}

/**
 * Custom validation error
 */
export class LLMValidationError extends Error {
  constructor(
    message: string,
    public errors: z.ZodIssue[]
  ) {
    super(message);
    this.name = 'LLMValidationError';
  }
}
