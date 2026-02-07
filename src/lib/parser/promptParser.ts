/**
 * Prompt Parser
 *
 * @deprecated Use UnifiedParser instead for new code.
 * This file is maintained for backwards compatibility.
 */

import { InfraSpec } from '@/types';
import {
  parsePrompt as unifiedParsePrompt,
  getAvailableTemplates as unifiedGetTemplates,
  getTemplate as unifiedGetTemplate,
  type ParseResult,
} from './UnifiedParser';

export type { ParseResult };

/**
 * Parse a natural language prompt and return an infrastructure specification.
 * @deprecated Use UnifiedParser.parseSimple() instead.
 */
export function parsePrompt(prompt: string): ParseResult {
  return unifiedParsePrompt(prompt);
}

/**
 * Get a list of available template names
 */
export function getAvailableTemplates(): string[] {
  return unifiedGetTemplates();
}

/**
 * Get a specific template by name
 */
export function getTemplate(name: string): InfraSpec | null {
  return unifiedGetTemplate(name);
}
