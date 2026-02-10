'use client';

import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { smartParse, ConversationContext, type SmartParseResult } from '@/lib/parser';
import { specToFlow } from '@/lib/layout';
import { Template } from '@/lib/templates';
import { InfraSpec, InfraNodeData } from '@/types';
import { LOADING_DELAY_MS } from '@/lib/constants';
import { createLogger } from '@/lib/utils/logger';
import type { ParseResultInfo } from './usePromptParser';

const log = createLogger('useLocalParser');

interface UseLocalParserConfig {
  currentSpec: InfraSpec | null;
  context: ConversationContext;
  onNodesUpdate: React.Dispatch<React.SetStateAction<Node[]>>;
  onEdgesUpdate: React.Dispatch<React.SetStateAction<Edge[]>>;
  onSpecUpdate: React.Dispatch<React.SetStateAction<InfraSpec | null>>;
  onAnimationReset?: () => void;
  onPolicyReset?: () => void;
  onResultUpdate: (result: ParseResultInfo | null) => void;
  onContextUpdate: (prompt: string, result: SmartParseResult) => void;
  onLoadingChange: (loading: boolean) => void;
  requestIdRef: React.MutableRefObject<number>;
  abortControllerRef: React.MutableRefObject<AbortController | null>;
  /** Called when a diagram is successfully generated (for feedback collection) */
  onDiagramGenerated?: (spec: InfraSpec, source: 'local-parser' | 'template', prompt?: string) => void;
}

/**
 * Return type for useLocalParser hook
 */
export interface UseLocalParserReturn {
  handlePromptSubmit: (prompt: string) => Promise<void>;
  handleTemplateSelect: (template: Template) => void;
}

/**
 * Hook for local (non-LLM) prompt parsing and template selection.
 *
 * Handles:
 * - smartParse-based prompt parsing
 * - Template selection and application
 * - Race condition prevention via shared request ID
 * - Loading delay support
 */
export function useLocalParser(config: UseLocalParserConfig): UseLocalParserReturn {
  const {
    currentSpec,
    context,
    onNodesUpdate,
    onEdgesUpdate,
    onSpecUpdate,
    onAnimationReset,
    onPolicyReset,
    onResultUpdate,
    onContextUpdate,
    onLoadingChange,
    requestIdRef,
    abortControllerRef,
    onDiagramGenerated,
  } = config;

  /**
   * Handle prompt submission and parsing
   * Includes race condition prevention - only processes the latest request
   */
  const handlePromptSubmit = useCallback(
    async (prompt: string) => {
      // Validate input
      if (!prompt || typeof prompt !== 'string') {
        log.warn('Invalid prompt provided');
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

      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller and increment request ID
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      const currentRequestId = ++requestIdRef.current;

      onLoadingChange(true);
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
          onResultUpdate({
            templateUsed: result.templateUsed,
            confidence: result.confidence,
            commandType: result.commandType,
            warnings: result.warnings,
            suggestions: result.suggestions,
          });

          // Update conversation context
          onContextUpdate(trimmedPrompt, result);

          // Notify feedback system
          onDiagramGenerated?.(result.spec, 'local-parser', trimmedPrompt);
        } else {
          // Handle parse failure
          const errorMessage = result.error || '프롬프트를 해석할 수 없습니다.';
          log.warn('Parse warning', { error: errorMessage });

          // Race condition check
          if (currentRequestId !== requestIdRef.current) {
            return;
          }

          onResultUpdate({
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
    [context, currentSpec, onNodesUpdate, onEdgesUpdate, onSpecUpdate, onPolicyReset, onResultUpdate, onContextUpdate, onLoadingChange, requestIdRef, abortControllerRef, onDiagramGenerated]
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
        onResultUpdate({
          templateUsed: template.id,
          confidence: 1,
          commandType: 'template',
        });

        // Notify feedback system
        onDiagramGenerated?.(template.spec, 'template');

        // Reset animation
        onAnimationReset?.();
      } catch (error) {
        log.error('Failed to apply template', error instanceof Error ? error : new Error(String(error)));
        onResultUpdate({
          confidence: 0,
          error: '템플릿을 적용하는데 실패했습니다.',
        });
      }
    },
    [onNodesUpdate, onEdgesUpdate, onSpecUpdate, onAnimationReset, onResultUpdate, onDiagramGenerated]
  );

  return {
    handlePromptSubmit,
    handleTemplateSelect,
  };
}
