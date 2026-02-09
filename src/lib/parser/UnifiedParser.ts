/**
 * Unified Parser
 *
 * Single entry point for all parsing operations.
 * Unified parser module for all parsing functionality.
 *
 * Plugin support:
 * - Dynamic pattern/template loading from plugin registry
 * - Plugin command handler chain
 * - Backwards compatible with existing features
 */

import type { InfraSpec } from '@/types';
import { infraTemplates } from './templates';
import {
  nodeTypePatterns as defaultNodeTypePatterns,
  detectCommandType,
  type CommandType,
  type NodeTypePattern,
} from './patterns';

// Import from modular files
import {
  getNodeTypePatternsFromRegistry,
  getTemplatesFromRegistry,
} from './pluginIntegration';

import {
  parsePromptLocal,
  getAvailableTemplates,
  getTemplate,
  type ParseResult,
} from './templateMatcher';

import {
  createContext,
  updateContext,
  handleCreate,
  handleAdd,
  handleRemove,
  handleModify,
  handleConnect,
  handleDisconnect,
  handleQuery,
  type SmartParseResult,
  type SpecModification,
  type ConversationContext,
  type PromptHistoryItem,
} from './specBuilder';

// ============================================================
// Re-export Types
// ============================================================

export type {
  ParseResult,
  SmartParseResult,
  SpecModification,
  ConversationContext,
  PromptHistoryItem,
};

export interface ParseOptions {
  /** Use template matching */
  useTemplates?: boolean;
  /** Use component detection */
  useComponentDetection?: boolean;
  /** Minimum confidence threshold */
  minConfidence?: number;
}

// Backwards compatibility: re-export nodeTypePatterns
export { nodeTypePatterns } from './patterns';

// ============================================================
// Unified Parser Class
// ============================================================

export class UnifiedParser {
  private context: ConversationContext;
  private usePluginPatterns: boolean;

  constructor(initialContext?: ConversationContext, usePluginPatterns = true) {
    this.context = initialContext || createContext();
    this.usePluginPatterns = usePluginPatterns;
  }

  /**
   * Set plugin patterns usage
   */
  setUsePluginPatterns(use: boolean): void {
    this.usePluginPatterns = use;
  }

  /**
   * Get currently used patterns
   */
  getPatterns(): NodeTypePattern[] {
    return this.usePluginPatterns
      ? getNodeTypePatternsFromRegistry()
      : defaultNodeTypePatterns;
  }

  /**
   * Get currently used templates
   */
  getTemplates(): Record<string, InfraSpec> {
    return this.usePluginPatterns
      ? getTemplatesFromRegistry()
      : infraTemplates;
  }

  /**
   * Main parse method - automatically selects best parsing strategy
   */
  parse(prompt: string, options: ParseOptions = {}): SmartParseResult {
    const {
      useTemplates = true,
      useComponentDetection = true,
    } = options;

    const normalizedPrompt = prompt.trim().toLowerCase();
    const commandType = detectCommandType(normalizedPrompt);

    // If no current spec and not a create command, treat as create
    if (!this.context.currentSpec && commandType !== 'create') {
      return handleCreate(prompt, { useTemplates, useComponentDetection });
    }

    // Handle different command types
    switch (commandType) {
      case 'add':
        return handleAdd(prompt, this.context.currentSpec);
      case 'remove':
        return handleRemove(prompt, this.context.currentSpec);
      case 'modify':
        return handleModify(prompt, this.context.currentSpec);
      case 'connect':
        return handleConnect(prompt, this.context.currentSpec);
      case 'disconnect':
        return handleDisconnect(prompt, this.context.currentSpec);
      case 'query':
        return handleQuery(prompt, this.context.currentSpec);
      case 'create':
      default:
        return handleCreate(prompt, { useTemplates, useComponentDetection });
    }
  }

  /**
   * Simple parse without context
   */
  parseSimple(prompt: string): ParseResult {
    return parsePromptLocal(prompt);
  }

  /**
   * Get current context
   */
  getContext(): ConversationContext {
    return this.context;
  }

  /**
   * Update context with result
   */
  updateContext(prompt: string, result: SmartParseResult): void {
    this.context = updateContext(this.context, prompt, result);
  }

  /**
   * Reset context
   */
  resetContext(): void {
    this.context = createContext();
  }

  /**
   * Set current spec directly
   */
  setCurrentSpec(spec: InfraSpec): void {
    this.context.currentSpec = spec;
  }
}

// ============================================================
// Backwards Compatibility Exports
// ============================================================

/**
 * Simple parse function (backwards compatible).
 *
 * @deprecated Use `parsePromptLocal()` from `templateMatcher.ts` directly,
 *   or `UnifiedParser.parseSimple()` for instance-based usage.
 * @see {@link parsePromptLocal} for the actual implementation
 * @see {@link UnifiedParser.parseSimple} for instance-based equivalent
 */
export function parsePrompt(prompt: string): ParseResult {
  return parsePromptLocal(prompt);
}

/**
 * Context-aware parse using UnifiedParser.
 *
 * Pipeline: `smartParse()` → `UnifiedParser.parse()` → command routing → `parsePromptLocal()`
 *
 * @see {@link UnifiedParser.parse} for the core parsing logic
 * @see {@link parsePromptLocal} for the template/component detection step
 */
export function smartParse(
  prompt: string,
  context: ConversationContext
): SmartParseResult {
  const parser = new UnifiedParser(context);
  return parser.parse(prompt);
}

// Re-export utility functions
export { createContext, updateContext, getAvailableTemplates, getTemplate };

/**
 * Pre-initialized UnifiedParser instance for stateless usage.
 *
 * @see {@link UnifiedParser} for the class definition
 */
export const defaultParser = new UnifiedParser();
