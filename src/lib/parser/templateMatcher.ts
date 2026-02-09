/**
 * Template Matcher Module
 *
 * Handles template matching logic for infrastructure prompts.
 */

import type { InfraSpec } from '@/types';
import { infraTemplates, templateKeywords } from './templates';
import { getTemplatesFromRegistry } from './pluginIntegration';
import { parseCustomPrompt } from './componentDetector';

export interface ParseResult {
  success: boolean;
  spec?: InfraSpec;
  templateUsed?: string;
  error?: string;
  confidence: number;
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
      };
    }
  }

  // Default fallback
  return {
    success: true,
    spec: templates['simple-waf'] || infraTemplates['simple-waf'],
    templateUsed: 'simple-waf',
    confidence: 0.3,
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
      return {
        success: true,
        spec: templates[templateId],
        templateUsed: templateId,
        confidence: 0.8,
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
