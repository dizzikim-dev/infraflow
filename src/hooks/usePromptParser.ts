'use client';

import { useState, useCallback, useRef } from 'react';
import { Node, Edge } from '@xyflow/react';
import { ConversationContext } from '@/lib/parser';
import { InfraSpec, InfraNodeData } from '@/types';
import type { Operation } from '@/lib/parser/diffApplier';
import { useParserContext } from './useParserContext';
import { useLocalParser } from './useLocalParser';
import { useLLMModifier } from './useLLMModifier';
import type { Template } from '@/lib/templates';

export interface ParseResultInfo {
  templateUsed?: string;
  confidence: number;
  commandType?: string;
  error?: string;
  /** AI reasoning for modifications */
  reasoning?: string;
  /** Applied operations */
  operations?: Operation[];
}

export interface UsePromptParserReturn {
  isLoading: boolean;
  lastResult: ParseResultInfo | null;
  context: ConversationContext;
  handlePromptSubmit: (prompt: string) => Promise<void>;
  handleTemplateSelect: (template: Template) => void;
  setLastResult: React.Dispatch<React.SetStateAction<ParseResultInfo | null>>;
  /** Cancel any pending parse operation */
  cancelParsing: () => void;
  /** LLM-based modification of existing diagram */
  handleLLMModify: (prompt: string) => Promise<void>;
  /** Whether LLM modification is available */
  llmAvailable: boolean;
}

interface UsePromptParserConfig {
  currentSpec: InfraSpec | null;
  currentNodes: Node<InfraNodeData>[];
  currentEdges: Edge[];
  onNodesUpdate: React.Dispatch<React.SetStateAction<Node[]>>;
  onEdgesUpdate: React.Dispatch<React.SetStateAction<Edge[]>>;
  onSpecUpdate: React.Dispatch<React.SetStateAction<InfraSpec | null>>;
  onAnimationReset?: () => void;
  onPolicyReset?: () => void;
}

/**
 * Hook for managing prompt parsing, template selection, and LLM modification.
 *
 * Composes three specialized hooks:
 * - useParserContext: conversation context management
 * - useLocalParser: local prompt parsing + template selection
 * - useLLMModifier: LLM-based diagram modification
 *
 * Includes race condition prevention via shared request ID tracking.
 */
export function usePromptParser(config: UsePromptParserConfig): UsePromptParserReturn {
  const {
    currentSpec,
    currentNodes,
    currentEdges,
    onNodesUpdate,
    onEdgesUpdate,
    onSpecUpdate,
    onAnimationReset,
    onPolicyReset,
  } = config;

  // Shared state
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<ParseResultInfo | null>(null);

  // Shared refs for race condition prevention across local parser and LLM modifier
  const requestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Conversation context
  const { context, updateConversationContext } = useParserContext();

  // Local parser (prompt parsing + template selection)
  const { handlePromptSubmit, handleTemplateSelect } = useLocalParser({
    currentSpec,
    context,
    onNodesUpdate,
    onEdgesUpdate,
    onSpecUpdate,
    onAnimationReset,
    onPolicyReset,
    onResultUpdate: setLastResult,
    onContextUpdate: updateConversationContext,
    onLoadingChange: setIsLoading,
    requestIdRef,
    abortControllerRef,
  });

  // LLM modifier (diagram modification via API)
  const { handleLLMModify, llmAvailable } = useLLMModifier({
    currentSpec,
    currentNodes,
    currentEdges,
    onNodesUpdate,
    onEdgesUpdate,
    onSpecUpdate,
    onResultUpdate: setLastResult,
    onContextUpdate: updateConversationContext,
    onLoadingChange: setIsLoading,
    requestIdRef,
    abortControllerRef,
  });

  /**
   * Cancel any pending parse operation
   */
  const cancelParsing = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    requestIdRef.current++;
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    lastResult,
    context,
    handlePromptSubmit,
    handleTemplateSelect,
    setLastResult,
    cancelParsing,
    handleLLMModify,
    llmAvailable,
  };
}
