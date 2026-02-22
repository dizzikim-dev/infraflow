'use client';

import { useState, useCallback, useRef } from 'react';
import { Node, Edge } from '@xyflow/react';
import { specToFlow, flowToSpec } from '@/lib/layout';
import { InfraSpec } from '@/types';
import type { Operation } from '@/lib/parser/diffApplier';
import { createLogger } from '@/lib/utils/logger';
import { withRetry, isRetryableError } from '@/lib/utils/retry';
import type { PanelState } from './useComparisonMode';

const log = createLogger('useComparisonPrompt');

interface UseComparisonPromptConfig {
  panel: PanelState;
  onPanelUpdate: (spec: InfraSpec | null, nodes: Node[], edges: Edge[]) => void;
}

interface ModificationInfo {
  reasoning?: string;
  operations?: Operation[];
}

interface UseComparisonPromptReturn {
  isLoading: boolean;
  error: string | null;
  lastModification: ModificationInfo | null;
  handleSubmit: (prompt: string) => Promise<void>;
  cancel: () => void;
}

export function useComparisonPrompt(config: UseComparisonPromptConfig): UseComparisonPromptReturn {
  const { panel, onPanelUpdate } = config;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastModification, setLastModification] = useState<ModificationInfo | null>(null);

  const requestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSubmit = useCallback(
    async (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed) return;

      if (!panel.nodes || panel.nodes.length === 0) {
        setError('수정할 다이어그램이 없습니다.');
        return;
      }

      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      const currentRequestId = ++requestIdRef.current;

      setIsLoading(true);
      setError(null);

      try {
        const currentSpec = panel.spec || flowToSpec(panel.nodes, panel.edges);

        const retryResult = await withRetry(
          async () => {
            const res = await fetch('/api/modify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt: trimmed,
                currentSpec,
                nodes: panel.nodes,
                edges: panel.edges,
              }),
              signal: abortController.signal,
            });
            if (!res.ok && res.status >= 500) {
              throw new Error(`Server error: ${res.status}`);
            }
            return res;
          },
          {
            maxAttempts: 2,
            initialDelayMs: 1000,
            maxDelayMs: 3000,
            isRetryable: (err) => {
              if (err instanceof Error && err.name === 'AbortError') return false;
              return isRetryableError(err);
            },
          }
        );

        if (currentRequestId !== requestIdRef.current) return;

        if (!retryResult.success || !retryResult.data) {
          throw retryResult.error || new Error('LLM 요청 실패');
        }

        const result = await retryResult.data.json();

        if (result.success && result.spec) {
          const { nodes: newNodes, edges: newEdges } = specToFlow(result.spec);

          // Merge positions from existing nodes
          const mergedNodes = newNodes.map((newNode: Node) => {
            const oldNode = panel.nodes.find((n) => n.id === newNode.id);
            return oldNode ? { ...newNode, position: oldNode.position } : newNode;
          });

          if (currentRequestId !== requestIdRef.current) return;

          onPanelUpdate(result.spec, mergedNodes, newEdges);
          setLastModification({
            reasoning: result.reasoning,
            operations: result.operations,
          });
        } else {
          const errorMessage = result.error?.userMessage || '다이어그램 수정에 실패했습니다.';
          setError(errorMessage);
        }
      } catch (err) {
        if (currentRequestId !== requestIdRef.current) return;
        if (err instanceof Error && err.name === 'AbortError') return;

        const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
        log.error('Comparison prompt failed', err instanceof Error ? err : new Error(String(err)));
        setError(errorMessage);
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false);
          abortControllerRef.current = null;
        }
      }
    },
    [panel, onPanelUpdate]
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    requestIdRef.current++;
    setIsLoading(false);
  }, []);

  return { isLoading, error, lastModification, handleSubmit, cancel };
}
