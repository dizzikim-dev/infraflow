'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import {
  smartParse,
  createContext,
  updateContext,
  ConversationContext,
} from '@/lib/parser';
import { specToFlow, flowToSpec } from '@/lib/layout';
import { Template } from '@/lib/templates';
import { InfraSpec, InfraNodeData } from '@/types';
import { LOADING_DELAY_MS } from '@/lib/constants';
import type { Operation } from '@/lib/parser/diffApplier';
import type { ModifyResponse } from '@/app/api/modify/route';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('usePromptParser');

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
 * Hook for managing prompt parsing and template selection
 * Includes race condition prevention via request ID tracking
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

  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<ParseResultInfo | null>(null);
  const [context, setContext] = useState<ConversationContext>(createContext());
  const [llmAvailable, setLlmAvailable] = useState(false);

  // Race condition prevention: track current request ID
  const requestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check if LLM modification API is available
  useEffect(() => {
    fetch('/api/modify')
      .then((res) => res.json())
      .then((data) => setLlmAvailable(data.available))
      .catch(() => setLlmAvailable(false));
  }, []);

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

  /**
   * Handle prompt submission and parsing
   * Includes race condition prevention - only processes the latest request
   */
  const handlePromptSubmit = useCallback(
    async (prompt: string) => {
      // Validate input
      if (!prompt || typeof prompt !== 'string') {
        log.warn('Invalid prompt provided');
        setLastResult({
          confidence: 0,
          error: '유효한 프롬프트를 입력해주세요.',
        });
        return;
      }

      const trimmedPrompt = prompt.trim();
      if (trimmedPrompt.length === 0) {
        setLastResult({
          confidence: 0,
          error: '프롬프트가 비어있습니다.',
        });
        return;
      }

      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller and increment request ID
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      const currentRequestId = ++requestIdRef.current;

      setIsLoading(true);
      onPolicyReset?.();

      // Optional loading delay (configurable, default 0)
      if (LOADING_DELAY_MS > 0) {
        await new Promise((resolve) => setTimeout(resolve, LOADING_DELAY_MS));
        // Check if this request was cancelled during delay
        if (abortController.signal.aborted || currentRequestId !== requestIdRef.current) {
          return;
        }
      }

      try {
        const result = smartParse(trimmedPrompt, {
          ...context,
          currentSpec,
        });

        // Race condition check: only process if this is still the latest request
        if (currentRequestId !== requestIdRef.current) {
          log.debug('Request superseded, ignoring result');
          return;
        }

        if (result.success && result.spec) {
          // Validate spec before using
          if (!result.spec.nodes || !Array.isArray(result.spec.nodes)) {
            throw new Error('Invalid spec: nodes array is missing');
          }

          const { nodes: newNodes, edges: newEdges } = specToFlow(result.spec);

          // Final race condition check before updating state
          if (currentRequestId !== requestIdRef.current) {
            return;
          }

          onNodesUpdate(newNodes);
          onEdgesUpdate(newEdges);
          onSpecUpdate(result.spec);
          setLastResult({
            templateUsed: result.templateUsed,
            confidence: result.confidence,
            commandType: result.commandType,
          });

          // Update conversation context
          setContext(updateContext(context, trimmedPrompt, result));
        } else {
          // Handle parse failure
          const errorMessage = result.error || '프롬프트를 해석할 수 없습니다.';
          log.warn('Parse warning', { error: errorMessage });

          // Race condition check
          if (currentRequestId !== requestIdRef.current) {
            return;
          }

          setLastResult({
            confidence: result.confidence,
            commandType: result.commandType,
            error: errorMessage,
          });
        }
      } catch (error) {
        // Race condition check
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        const errorMessage =
          error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
        log.error('Failed to parse prompt', error instanceof Error ? error : new Error(String(error)));
        setLastResult({
          confidence: 0,
          error: errorMessage,
        });
      } finally {
        // Only clear loading state if this is still the current request
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false);
          abortControllerRef.current = null;
        }
      }
    },
    [context, currentSpec, onNodesUpdate, onEdgesUpdate, onSpecUpdate, onPolicyReset]
  );

  /**
   * Handle template selection
   */
  const handleTemplateSelect = useCallback(
    (template: Template) => {
      if (!template || !template.spec) {
        log.warn('Invalid template provided');
        return;
      }

      try {
        const { nodes: newNodes, edges: newEdges } = specToFlow(template.spec);

        onNodesUpdate(newNodes);
        onEdgesUpdate(newEdges);
        onSpecUpdate(template.spec);
        setLastResult({
          templateUsed: template.id,
          confidence: 1,
          commandType: 'template',
        });

        // Reset animation
        onAnimationReset?.();
      } catch (error) {
        log.error('Failed to apply template', error instanceof Error ? error : new Error(String(error)));
        setLastResult({
          confidence: 0,
          error: '템플릿을 적용하는데 실패했습니다.',
        });
      }
    },
    [onNodesUpdate, onEdgesUpdate, onSpecUpdate, onAnimationReset]
  );

  /**
   * Handle LLM-based diagram modification
   * Uses Claude Sonnet to interpret natural language modifications
   */
  const handleLLMModify = useCallback(
    async (prompt: string) => {
      // Validate input
      if (!prompt || typeof prompt !== 'string') {
        setLastResult({
          confidence: 0,
          error: '유효한 프롬프트를 입력해주세요.',
        });
        return;
      }

      const trimmedPrompt = prompt.trim();
      if (trimmedPrompt.length === 0) {
        setLastResult({
          confidence: 0,
          error: '프롬프트가 비어있습니다.',
        });
        return;
      }

      // Check if there's a diagram to modify
      if (!currentNodes || currentNodes.length === 0) {
        setLastResult({
          confidence: 0,
          error: '수정할 다이어그램이 없습니다. 먼저 다이어그램을 생성해주세요.',
        });
        return;
      }

      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller and increment request ID
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      const currentRequestId = ++requestIdRef.current;

      setIsLoading(true);

      try {
        const response = await fetch('/api/modify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: trimmedPrompt,
            currentSpec: currentSpec || flowToSpec(currentNodes, currentEdges),
            nodes: currentNodes,
            edges: currentEdges,
          }),
          signal: abortController.signal,
        });

        // Race condition check
        if (currentRequestId !== requestIdRef.current) {
          log.debug('LLM request superseded, ignoring result');
          return;
        }

        const result: ModifyResponse = await response.json();

        if (result.success && result.spec) {
          const { nodes: newNodes, edges: newEdges } = specToFlow(result.spec);

          // Merge positions from old nodes to preserve layout
          const mergedNodes = newNodes.map((newNode) => {
            const oldNode = currentNodes.find((n) => n.id === newNode.id);
            if (oldNode) {
              return { ...newNode, position: oldNode.position };
            }
            return newNode;
          });

          // Final race condition check before updating state
          if (currentRequestId !== requestIdRef.current) {
            return;
          }

          onNodesUpdate(mergedNodes);
          onEdgesUpdate(newEdges);
          onSpecUpdate(result.spec);
          setLastResult({
            confidence: 1,
            commandType: 'llm-modify',
            reasoning: result.reasoning,
            operations: result.operations,
          });

          // Update conversation context
          setContext(
            updateContext(context, trimmedPrompt, {
              success: true,
              spec: result.spec,
              confidence: 1,
              commandType: 'llm-modify',
            })
          );
        } else {
          // Handle API error
          const errorMessage = result.error?.userMessage || '다이어그램 수정에 실패했습니다.';

          // Race condition check
          if (currentRequestId !== requestIdRef.current) {
            return;
          }

          setLastResult({
            confidence: 0,
            error: errorMessage,
            reasoning: result.reasoning,
            operations: result.operations,
          });
        }
      } catch (error) {
        // Race condition check
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        // Handle abort
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }

        const errorMessage =
          error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
        log.error('Failed to modify diagram', error instanceof Error ? error : new Error(String(error)));
        setLastResult({
          confidence: 0,
          error: errorMessage,
        });
      } finally {
        // Only clear loading state if this is still the current request
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false);
          abortControllerRef.current = null;
        }
      }
    },
    [context, currentSpec, currentNodes, currentEdges, onNodesUpdate, onEdgesUpdate, onSpecUpdate]
  );

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
