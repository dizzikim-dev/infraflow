'use client';

import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { smartParse, ConversationContext, type SmartParseResult } from '@/lib/parser';
import { specToFlow } from '@/lib/layout';
import { Template } from '@/lib/templates';
import { InfraSpec, InfraNodeData } from '@/types';
import { LOADING_DELAY_MS } from '@/lib/constants';
import { createLogger } from '@/lib/utils/logger';
import { trackActivity } from '@/lib/activity/trackActivity';
import { parseWithLLM, type LLMParseResult } from '@/lib/llm/llmParser';
import type { ParseResultInfo } from './usePromptParser';
import type { RoutePromptResponse } from '@/app/api/route-prompt/route';

const log = createLogger('useLocalParser');

// ---------------------------------------------------------------------------
// Routing thresholds
// ---------------------------------------------------------------------------

/** Confidence >= this value → use template directly (no router needed) */
const HIGH_CONFIDENCE_THRESHOLD = 0.9;
/** Confidence < this value → go directly to LLM (skip router) */
const LOW_CONFIDENCE_THRESHOLD = 0.5;

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
  onDiagramGenerated?: (spec: InfraSpec, source: 'local-parser' | 'llm-generate' | 'template', prompt?: string) => void;
  /** Whether the LLM API is available (API key configured) */
  llmAvailable?: boolean;
}

/**
 * Return type for useLocalParser hook
 */
export interface UseLocalParserReturn {
  handlePromptSubmit: (prompt: string) => Promise<void>;
  handleTemplateSelect: (template: Template) => void;
}

// ---------------------------------------------------------------------------
// Helper: Call the router API
// ---------------------------------------------------------------------------

async function callRouterAPI(
  prompt: string,
  templateId: string,
  nodeTypes: string[],
  confidence: number,
  signal: AbortSignal,
): Promise<RoutePromptResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  // Chain abort signals: if the parent signal aborts, abort the router too
  const onAbort = () => controller.abort();
  signal.addEventListener('abort', onAbort, { once: true });

  try {
    const res = await fetch('/api/route-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        templateMatch: { templateId, nodeTypes, confidence },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Router API error: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    // Timeout or network error → fallback to template
    log.warn('Router API call failed, defaulting to template', {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      decision: 'use_template',
      reason: '라우터 호출 실패로 템플릿을 사용합니다.',
    };
  } finally {
    clearTimeout(timeoutId);
    signal.removeEventListener('abort', onAbort);
  }
}

// ---------------------------------------------------------------------------
// Helper: Call LLM for full generation
// ---------------------------------------------------------------------------

async function callLLMGenerate(prompt: string): Promise<LLMParseResult> {
  // Detect provider: check /api/llm for available providers
  let provider: 'claude' | 'openai' = 'claude';
  try {
    const statusRes = await fetch('/api/llm');
    const status = await statusRes.json();
    if (status.providers?.openai) {
      provider = 'openai';
    }
  } catch {
    // Default to claude
  }

  return parseWithLLM(prompt, { provider });
}

/**
 * Hook for local (non-LLM) prompt parsing and template selection.
 *
 * Handles:
 * - smartParse-based prompt parsing
 * - Smart routing: confidence-based 3-tier routing to template/router/LLM
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
    llmAvailable = false,
  } = config;

  /**
   * Apply a successful spec result to the canvas.
   * Shared between template-path and LLM-path.
   */
  const applySpec = useCallback(
    (
      spec: InfraSpec,
      resultInfo: ParseResultInfo,
      prompt: string,
      source: 'local-parser' | 'llm-generate' | 'template',
      parseResult?: SmartParseResult,
    ) => {
      const { nodes: newNodes, edges: newEdges } = specToFlow(spec);
      onNodesUpdate(newNodes);
      onEdgesUpdate(newEdges);
      onSpecUpdate(spec);
      onResultUpdate(resultInfo);

      if (parseResult) {
        onContextUpdate(prompt, parseResult);
      }

      onDiagramGenerated?.(spec, source, prompt);
    },
    [onNodesUpdate, onEdgesUpdate, onSpecUpdate, onResultUpdate, onContextUpdate, onDiagramGenerated],
  );

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

        // ── Smart Routing Decision ──
        // When LLM is available, route based on confidence:
        // - ≥0.9: Direct template use (high confidence, no need for router)
        // - 0.5~0.89: Ask Haiku router if template is semantically appropriate
        // - <0.5: Direct LLM generation (too low confidence for template)
        //
        // When LLM is NOT available: use original local-parser logic (no routing)

        if (result.isFallback) {
          // ── Fallback Path (confidence very low, typically ≤ 0.3) ──
          if (llmAvailable) {
            // LLM available → try full LLM generation instead of showing fallback
            log.info('Fallback triggered with LLM available, routing to LLM', {
              confidence: result.confidence,
            });
            const llmResult = await callLLMGenerate(trimmedPrompt);

            if (currentRequestId !== requestIdRef.current) return;

            if (llmResult.success && llmResult.spec) {
              if (!llmResult.spec.nodes || !Array.isArray(llmResult.spec.nodes)) {
                throw new Error('Invalid spec from LLM: nodes array is missing');
              }

              applySpec(
                llmResult.spec,
                {
                  confidence: 1,
                  commandType: 'create',
                  routingDecision: 'llm-direct',
                  traceSummary: llmResult.traceSummary,
                  traceId: llmResult.traceId,
                  verification: llmResult.verification,
                  answerEvidence: llmResult.answerEvidence,
                },
                trimmedPrompt,
                'llm-generate',
              );

              trackActivity('prompt_submit', {
                prompt: trimmedPrompt,
                detail: {
                  confidence: 1,
                  nodeCount: llmResult.spec.nodes?.length ?? 0,
                  routingDecision: 'llm-direct',
                },
              });
              return;
            }
            // LLM failed → show fallback warning as usual
          }

          log.warn('Fallback triggered', { confidence: result.confidence, prompt: trimmedPrompt });

          if (currentRequestId !== requestIdRef.current) return;

          onResultUpdate({
            confidence: result.confidence,
            commandType: result.commandType,
            error: result.error || '입력하신 내용을 정확히 인식하지 못했습니다.',
            isFallback: true,
            fallbackSpec: result.spec,
          });

          // Fire-and-forget: log unrecognized query for admin review
          try {
            fetch('/api/log-unrecognized', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: trimmedPrompt,
                confidence: result.confidence,
              }),
            }).catch(() => {/* ignore logging failures */});
          } catch {
            // Ignore — logging is best-effort
          }
        } else if (result.success && result.spec) {
          // ── Success Path: Route based on confidence ──
          if (!result.spec.nodes || !Array.isArray(result.spec.nodes)) {
            throw new Error('Invalid spec: nodes array is missing');
          }

          if (currentRequestId !== requestIdRef.current) return;

          const confidence = result.confidence;

          // Tier 1: High confidence (≥0.9) → Direct template use
          if (confidence >= HIGH_CONFIDENCE_THRESHOLD || !llmAvailable) {
            applySpec(
              result.spec,
              {
                templateUsed: result.templateUsed,
                confidence: result.confidence,
                commandType: result.commandType,
                warnings: result.warnings,
                suggestions: result.suggestions,
                explanation: result.explanation,
                routingDecision: 'template-direct',
              },
              trimmedPrompt,
              'local-parser',
              result,
            );

            trackActivity('prompt_submit', {
              prompt: trimmedPrompt,
              detail: {
                confidence: result.confidence,
                nodeCount: result.spec.nodes?.length ?? 0,
                templateUsed: result.templateUsed ?? null,
                routingDecision: 'template-direct',
              },
            });
          }
          // Tier 3: Low confidence (<0.5) → Direct LLM
          else if (confidence < LOW_CONFIDENCE_THRESHOLD) {
            log.info('Low confidence, routing to LLM', { confidence });
            const llmResult = await callLLMGenerate(trimmedPrompt);

            if (currentRequestId !== requestIdRef.current) return;

            if (llmResult.success && llmResult.spec) {
              if (!llmResult.spec.nodes || !Array.isArray(llmResult.spec.nodes)) {
                throw new Error('Invalid spec from LLM: nodes array is missing');
              }

              applySpec(
                llmResult.spec,
                {
                  confidence: 1,
                  commandType: 'create',
                  routingDecision: 'llm-direct',
                  traceSummary: llmResult.traceSummary,
                  traceId: llmResult.traceId,
                  verification: llmResult.verification,
                  answerEvidence: llmResult.answerEvidence,
                },
                trimmedPrompt,
                'llm-generate',
              );

              trackActivity('prompt_submit', {
                prompt: trimmedPrompt,
                detail: {
                  confidence: 1,
                  nodeCount: llmResult.spec.nodes?.length ?? 0,
                  routingDecision: 'llm-direct',
                },
              });
            } else {
              // LLM failed → fallback to local parse result
              log.warn('LLM generation failed, using local parse result', {
                error: llmResult.error,
              });
              applySpec(
                result.spec,
                {
                  templateUsed: result.templateUsed,
                  confidence: result.confidence,
                  commandType: result.commandType,
                  warnings: result.warnings,
                  suggestions: result.suggestions,
                  explanation: result.explanation,
                  routingDecision: 'template-direct',
                },
                trimmedPrompt,
                'local-parser',
                result,
              );
            }
          }
          // Tier 2: Medium confidence (0.5–0.89) → Ask Haiku router
          else {
            log.info('Medium confidence, asking router', {
              confidence,
              templateUsed: result.templateUsed,
            });

            const nodeTypes = result.spec.nodes.map((n) => n.type);
            const routerResponse = await callRouterAPI(
              trimmedPrompt,
              result.templateUsed || 'unknown',
              nodeTypes,
              confidence,
              abortController.signal,
            );

            if (currentRequestId !== requestIdRef.current) return;

            if (routerResponse.decision === 'use_template') {
              // Router says template is appropriate
              applySpec(
                result.spec,
                {
                  templateUsed: result.templateUsed,
                  confidence: result.confidence,
                  commandType: result.commandType,
                  warnings: result.warnings,
                  suggestions: result.suggestions,
                  explanation: result.explanation,
                  routingDecision: 'router-template',
                  routingReason: routerResponse.reason,
                },
                trimmedPrompt,
                'local-parser',
                result,
              );

              trackActivity('prompt_submit', {
                prompt: trimmedPrompt,
                detail: {
                  confidence: result.confidence,
                  nodeCount: result.spec.nodes?.length ?? 0,
                  templateUsed: result.templateUsed ?? null,
                  routingDecision: 'router-template',
                },
              });
            } else {
              // Router says use LLM
              log.info('Router decided to use LLM', { reason: routerResponse.reason });
              const llmResult = await callLLMGenerate(trimmedPrompt);

              if (currentRequestId !== requestIdRef.current) return;

              if (llmResult.success && llmResult.spec) {
                if (!llmResult.spec.nodes || !Array.isArray(llmResult.spec.nodes)) {
                  throw new Error('Invalid spec from LLM: nodes array is missing');
                }

                applySpec(
                  llmResult.spec,
                  {
                    confidence: 1,
                    commandType: 'create',
                    routingDecision: 'router-llm',
                    routingReason: routerResponse.reason,
                    traceSummary: llmResult.traceSummary,
                    traceId: llmResult.traceId,
                    verification: llmResult.verification,
                  },
                  trimmedPrompt,
                  'llm-generate',
                );

                trackActivity('prompt_submit', {
                  prompt: trimmedPrompt,
                  detail: {
                    confidence: 1,
                    nodeCount: llmResult.spec.nodes?.length ?? 0,
                    routingDecision: 'router-llm',
                  },
                });
              } else {
                // LLM failed → fallback to local parse result
                log.warn('LLM generation failed after router, using local result', {
                  error: llmResult.error,
                });
                applySpec(
                  result.spec!,
                  {
                    templateUsed: result.templateUsed,
                    confidence: result.confidence,
                    commandType: result.commandType,
                    warnings: result.warnings,
                    suggestions: result.suggestions,
                    explanation: result.explanation,
                    routingDecision: 'router-template',
                    routingReason: `LLM 실패로 템플릿 사용: ${llmResult.error}`,
                  },
                  trimmedPrompt,
                  'local-parser',
                  result,
                );
              }
            }
          }
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
    [context, currentSpec, onNodesUpdate, onEdgesUpdate, onSpecUpdate, onPolicyReset, onResultUpdate, onContextUpdate, onLoadingChange, requestIdRef, abortControllerRef, onDiagramGenerated, llmAvailable, applySpec]
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
          routingDecision: 'template-direct',
        });

        // Notify feedback system
        onDiagramGenerated?.(template.spec, 'template');

        trackActivity('template_select', {
          detail: {
            templateId: template.id,
            templateName: template.name,
            nodeCount: template.spec.nodes?.length ?? 0,
          },
        });

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
