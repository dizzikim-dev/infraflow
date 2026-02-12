/**
 * Template Matcher Module
 *
 * Handles template matching logic for infrastructure prompts.
 */

import type { InfraSpec } from '@/types';
import { infraTemplates, templateKeywords } from './templates';
import { getTemplatesFromRegistry } from './pluginIntegration';
import { parseCustomPrompt } from './componentDetector';
import { buildExplanation } from './explanationBuilder';

export interface ParseResult {
  success: boolean;
  spec?: InfraSpec;
  templateUsed?: string;
  error?: string;
  confidence: number;
  /** True when the result is a low-confidence fallback (confidence ≤ 0.3) */
  isFallback?: boolean;
  /** Human-readable explanation of why this infrastructure was generated */
  explanation?: string;
}

export interface ParseLocalOptions {
  /** Use template matching */
  useTemplates?: boolean;
  /** Use component detection */
  useComponentDetection?: boolean;
  /** Use plugin patterns and templates */
  usePlugins?: boolean;
}

/**
 * Parse prompt using local logic (no LLM).
 *
 * This is the core rule-based parser. Pipeline:
 * 1. Template keyword matching (via `infraTemplates` or plugin templates)
 * 2. Template ID matching
 * 3. Component detection (via `parseCustomPrompt()`)
 * 4. Fallback to default template
 *
 * @see {@link parseCustomPrompt} for the component detection step
 * @see {@link UnifiedParser.parse} which calls this for 'create' commands
 * @see {@link smartParse} which creates a UnifiedParser and delegates here
 */
export function parsePromptLocal(
  prompt: string,
  options: ParseLocalOptions = {}
): ParseResult {
  const { useTemplates = true, useComponentDetection = true, usePlugins = true } = options;
  const normalizedPrompt = prompt.toLowerCase().trim();

  // Determine which templates to use (plugins first)
  const templates = usePlugins ? getTemplatesFromRegistry() : infraTemplates;

  // Try to match templates by keywords
  if (useTemplates) {
    const result = matchTemplateByKeywords(normalizedPrompt, templates);
    if (result) {
      return result;
    }

    // Match by template ID directly
    const directMatch = matchTemplateById(normalizedPrompt, templates);
    if (directMatch) {
      return directMatch;
    }
  }

  // Parse components from prompt
  if (useComponentDetection) {
    const parsedSpec = parseCustomPrompt(normalizedPrompt, usePlugins);
    if (parsedSpec) {
      return {
        success: true,
        spec: parsedSpec,
        confidence: 0.5,
        explanation: buildExplanation(normalizedPrompt, parsedSpec),
      };
    }
  }

  // Default fallback — low confidence, flagged as fallback
  return {
    success: false,
    isFallback: true,
    spec: templates['simple-waf'] || infraTemplates['simple-waf'],
    templateUsed: 'simple-waf',
    confidence: 0.3,
    error: '입력하신 내용을 정확히 인식하지 못했습니다.',
  };
}

/**
 * Match template by keywords
 */
function matchTemplateByKeywords(
  normalizedPrompt: string,
  templates: Record<string, InfraSpec>
): ParseResult | null {
  for (const [templateId, keywords] of Object.entries(templateKeywords)) {
    for (const keyword of keywords) {
      if (normalizedPrompt.includes(keyword.toLowerCase())) {
        const template = templates[templateId];
        if (template) {
          return {
            success: true,
            spec: template,
            templateUsed: templateId,
            confidence: 0.8,
            explanation: buildExplanation(normalizedPrompt, template, templateId),
          };
        }
      }
    }
  }
  return null;
}

/**
 * Match template by ID directly
 */
function matchTemplateById(
  normalizedPrompt: string,
  templates: Record<string, InfraSpec>
): ParseResult | null {
  for (const templateId of Object.keys(templates)) {
    if (normalizedPrompt.includes(templateId.toLowerCase())) {
      const template = templates[templateId];
      return {
        success: true,
        spec: template,
        templateUsed: templateId,
        confidence: 0.8,
        explanation: buildExplanation(normalizedPrompt, template, templateId),
      };
    }
  }
  return null;
}

/**
 * Get available templates
 */
export function getAvailableTemplates(): string[] {
  return Object.keys(infraTemplates);
}

/**
 * Get a specific template by name
 */
export function getTemplate(name: string): InfraSpec | null {
  return infraTemplates[name] || null;
}
