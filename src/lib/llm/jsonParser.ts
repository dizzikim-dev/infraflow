/**
 * JSON parsing utilities for LLM responses.
 *
 * LLM responses may contain JSON in various formats (direct, markdown blocks,
 * embedded in text). This module provides robust parsing for all these cases.
 *
 * @module lib/llm/jsonParser
 */

import type { InfraSpec } from '@/types';
import type { StructuredResponseMeta } from '@/types/structuredResponse';
import { isInfraSpec } from '@/types/guards';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('JSONParser');

/**
 * Parses JSON from LLM response, handling various formats.
 *
 * LLM responses may contain JSON in different formats:
 * - Direct JSON object
 * - JSON wrapped in markdown code blocks (```json ... ```)
 * - JSON embedded within other text
 *
 * @param content - Raw LLM response content
 * @returns Parsed infrastructure spec or null if parsing fails
 */
export function parseJSONFromLLMResponse(content: string): InfraSpec | null {
  const tryParse = (jsonStr: string): unknown => {
    try {
      return JSON.parse(jsonStr);
    } catch (error) {
      log.debug('JSON parse attempt failed', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  };

  // Try direct parse first
  let parsed = tryParse(content);
  if (parsed && isInfraSpec(parsed)) {
    return parsed;
  }

  // Try to extract JSON from markdown code block
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    parsed = tryParse(jsonMatch[1].trim());
    if (parsed && isInfraSpec(parsed)) {
      return parsed;
    }
  }

  // Try to find JSON object in response
  const objectMatch = content.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    parsed = tryParse(objectMatch[0]);
    if (parsed && isInfraSpec(parsed)) {
      return parsed;
    }
  }

  return null;
}

// --- Enhanced structured response parsing ---

export interface EnhancedParseResult {
  spec: InfraSpec | null;
  meta: StructuredResponseMeta | null;
}

/**
 * Parses an enhanced LLM response that may contain both spec and meta.
 *
 * Supports two formats:
 * - Legacy: `{ nodes: [...], connections: [...] }` (spec only)
 * - Enhanced: `{ spec: { nodes, connections }, meta: { summary, assumptions, ... } }`
 *
 * Also handles markdown code blocks wrapping the JSON.
 * Gracefully degrades: if meta parsing fails, returns null meta with valid spec.
 *
 * @param content - Raw LLM response content
 * @returns Object with spec (InfraSpec | null) and meta (StructuredResponseMeta | null)
 */
export function parseEnhancedLLMResponse(content: string): EnhancedParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    // Try to extract JSON from markdown code block
    const mdMatch = content.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
    if (mdMatch) {
      try {
        parsed = JSON.parse(mdMatch[1]);
      } catch {
        /* fall through */
      }
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return { spec: null, meta: null };
  }

  const obj = parsed as Record<string, unknown>;

  // Case 1: { spec: {...}, meta: {...} } — new enhanced format
  if (obj.spec && typeof obj.spec === 'object') {
    const spec = parseJSONFromLLMResponse(JSON.stringify(obj.spec));
    const meta = parseMetaSafe(obj.meta);
    return { spec, meta };
  }

  // Case 2: { nodes: [...], connections: [...] } — legacy format
  const spec = parseJSONFromLLMResponse(content);
  return { spec, meta: null };
}

/**
 * Safely parses meta object with type validation.
 * Returns null if any required field is missing or has wrong type.
 */
function parseMetaSafe(raw: unknown): StructuredResponseMeta | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;

  if (typeof obj.summary !== 'string') return null;
  if (!Array.isArray(obj.assumptions)) return null;
  if (!Array.isArray(obj.options)) return null;
  if (!Array.isArray(obj.tradeoffs)) return null;
  if (!Array.isArray(obj.artifacts)) return null;

  return {
    summary: obj.summary,
    assumptions: obj.assumptions.filter((a): a is string => typeof a === 'string'),
    options: obj.options.filter(
      (o): o is StructuredResponseMeta['options'][0] =>
        typeof o === 'object' && o !== null && 'name' in o
    ),
    tradeoffs: obj.tradeoffs.filter((t): t is string => typeof t === 'string'),
    artifacts: obj.artifacts.filter((a): a is string => typeof a === 'string'),
  };
}
