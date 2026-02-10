'use client';

import { useState, useCallback, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { specToFlow, flowToSpec } from '@/lib/layout';
import type { SmartParseResult } from '@/lib/parser';
import { InfraSpec, InfraNodeData } from '@/types';
import type { Operation } from '@/lib/parser/diffApplier';
import type { ModifyResponse } from '@/app/api/modify/route';
import { createLogger } from '@/lib/utils/logger';
import { withRetry, isRetryableError } from '@/lib/utils/retry';
import type { ParseResultInfo } from './usePromptParser';

const log = createLogger('useLLMModifier');

interface UseLLMModifierConfig {
  currentSpec: InfraSpec | null;
  currentNodes: Node<InfraNodeData>[];
  currentEdges: Edge[];
  onNodesUpdate: React.Dispatch<React.SetStateAction<Node[]>>;
  onEdgesUpdate: React.Dispatch<React.SetStateAction<Edge[]>>;
  onSpecUpdate: React.Dispatch<React.SetStateAction<InfraSpec | null>>;
  onResultUpdate: (result: ParseResultInfo | null) => void;
  onContextUpdate: (prompt: string, result: SmartParseResult) => void;
  onLoadingChange: (loading: boolean) => void;
  requestIdRef: React.MutableRefObject<number>;
  abortControllerRef: React.MutableRefObject<AbortController | null>;
  /** Called when a diagram is successfully modified (for feedback collection) */
  onDiagramGenerated?: (spec: InfraSpec, source: 'llm-modify', prompt?: string) => void;
}

/**
 * Return type for useLLMModifier hook
 */
export interface UseLLMModifierReturn {
  handleLLMModify: (prompt: string) => Promise<void>;
  llmAvailable: boolean;
}

/**
 * Hook for LLM-based diagram modification.
 *
 * Handles:
 * - Checking LLM API availability
 * - Sending modification requests to /api/modify
 * - AbortController management for cancellation
 * - Race condition prevention via shared request ID
 * - Merging node positions from the existing diagram
 */
export function useLLMModifier(config: UseLLMModifierConfig): UseLLMModifierReturn {
  const {
    currentSpec,
    currentNodes,
    currentEdges,
    onNodesUpdate,
    onEdgesUpdate,
    onSpecUpdate,
    onResultUpdate,
    onContextUpdate,
    onLoadingChange,
    requestIdRef,
    abortControllerRef,
    onDiagramGenerated,
  } = config;

  const [llmAvailable, setLlmAvailable] = useState(false);

  // Check if LLM modification API is available
  useEffect(() => {
    fetch('/api/modify')
      .then((res) => res.json())
      .then((data) => setLlmAvailable(data.available))
      .catch(() => setLlmAvailable(false));
  }, []);

  /**
   * Handle LLM-based diagram modification
   * Uses Claude Sonnet to interpret natural language modifications
   */
  const handleLLMModify = useCallback(
    async (prompt: string) => {
      // Validate input
      if (!prompt || typeof prompt !== 'string') {
        onResultUpdate({
          confidence: 0,
          error: '유효한 프롬프트를 입력해주세요.',
        });
        return;
      }

      const trimmedPrompt = prompt.trim();
      if (trimmedPrompt.length === 0) {
        onResultUpdate({
          confidence: 0,
          error: '프롬프트가 비어있습니다.',
        });
        return;
      }

      // Check if there's a diagram to modify
      if (!currentNodes || currentNodes.length === 0) {
        onResultUpdate({
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

      onLoadingChange(true);

      try {
        const retryResult = await withRetry(
          async () => {
            const res = await fetch('/api/modify', {
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
            if (!res.ok && res.status >= 500) {
              throw new Error(`Server error: ${res.status}`);
            }
            return res;
          },
          {
            maxAttempts: 3,
            initialDelayMs: 1000,
            maxDelayMs: 5000,
            isRetryable: (error) => {
              if (error instanceof Error && error.name === 'AbortError') return false;
              return isRetryableError(error);
            },
            onRetry: (attempt, error, delayMs) => {
              log.warn(`LLM retry attempt ${attempt}, waiting ${delayMs}ms`, {
                error: error instanceof Error ? error.message : String(error),
              });
            },
          }
        );

        // Race condition check
        if (currentRequestId !== requestIdRef.current) {
          log.debug('LLM request superseded, ignoring result');
          return;
        }

        if (!retryResult.success || !retryResult.data) {
          throw retryResult.error || new Error('LLM 요청이 모든 재시도 후 실패했습니다.');
        }

        const response = retryResult.data;
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
          onResultUpdate({
            confidence: 1,
            commandType: 'llm-modify',
            reasoning: result.reasoning,
            operations: result.operations,
          });

          // Notify feedback system
          onDiagramGenerated?.(result.spec, 'llm-modify', trimmedPrompt);

          // Update conversation context
          onContextUpdate(trimmedPrompt, {
            success: true,
            spec: result.spec,
            confidence: 1,
            commandType: 'llm-modify',
          });
        } else {
          // Handle API error
          const errorMessage = result.error?.userMessage || '다이어그램 수정에 실패했습니다.';

          // Race condition check
          if (currentRequestId !== requestIdRef.current) {
            return;
          }

          onResultUpdate({
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
        onResultUpdate({
          confidence: 0,
          error: errorMessage,
        });
      } finally {
        // Only clear loading state if this is still the current request
        if (currentRequestId === requestIdRef.current) {
          onLoadingChange(false);
          abortControllerRef.current = null;
        }
      }
    },
    [currentSpec, currentNodes, currentEdges, onNodesUpdate, onEdgesUpdate, onSpecUpdate, onResultUpdate, onContextUpdate, onLoadingChange, requestIdRef, abortControllerRef, onDiagramGenerated]
  );

  return {
    handleLLMModify,
    llmAvailable,
  };
}
