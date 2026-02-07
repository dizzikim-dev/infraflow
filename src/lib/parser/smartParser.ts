/**
 * Smart Parser
 *
 * @deprecated Use UnifiedParser instead for new code.
 * This file is maintained for backwards compatibility.
 */

import {
  smartParse as unifiedSmartParse,
  createContext as unifiedCreateContext,
  updateContext as unifiedUpdateContext,
  type ConversationContext,
  type SmartParseResult,
  type SpecModification,
} from './UnifiedParser';

// Re-export types
export type { ConversationContext, SmartParseResult, SpecModification };

// Re-export PromptHistoryItem for backwards compatibility
export interface PromptHistoryItem {
  prompt: string;
  result: SmartParseResult;
  timestamp: number;
}

/**
 * Smart parser that understands context and modification commands
 * @deprecated Use UnifiedParser.parse() instead.
 */
export function smartParse(
  prompt: string,
  context: ConversationContext
): SmartParseResult {
  return unifiedSmartParse(prompt, context);
}

/**
 * Create a new conversation context
 */
export function createContext(): ConversationContext {
  return unifiedCreateContext();
}

/**
 * Update context with new result
 */
export function updateContext(
  context: ConversationContext,
  prompt: string,
  result: SmartParseResult
): ConversationContext {
  return unifiedUpdateContext(context, prompt, result);
}
