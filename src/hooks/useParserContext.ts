'use client';

import { useState, useCallback } from 'react';
import {
  createContext,
  updateContext,
  ConversationContext,
  type SmartParseResult,
} from '@/lib/parser';

/**
 * Return type for useParserContext hook
 */
export interface UseParserContextReturn {
  context: ConversationContext;
  updateConversationContext: (prompt: string, result: SmartParseResult) => void;
}

/**
 * Hook for managing conversation context in the prompt parser pipeline.
 *
 * Handles:
 * - Creating initial conversation context
 * - Updating context after each parse/LLM result
 * - Maintaining prompt history
 */
export function useParserContext(): UseParserContextReturn {
  const [context, setContext] = useState<ConversationContext>(createContext());

  /**
   * Update conversation context with a new prompt and its result
   */
  const updateConversationContext = useCallback(
    (prompt: string, result: SmartParseResult) => {
      setContext((prev) => updateContext(prev, prompt, result));
    },
    []
  );

  return {
    context,
    updateConversationContext,
  };
}
