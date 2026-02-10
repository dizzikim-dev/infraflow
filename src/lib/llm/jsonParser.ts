/**
 * JSON parsing utilities for LLM responses.
 *
 * LLM responses may contain JSON in various formats (direct, markdown blocks,
 * embedded in text). This module provides robust parsing for all these cases.
 *
 * @module lib/llm/jsonParser
 */

import type { InfraSpec } from '@/types';
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
