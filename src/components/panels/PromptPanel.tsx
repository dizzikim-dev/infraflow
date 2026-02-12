'use client';

import { useState, useMemo, KeyboardEvent, RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Operation } from '@/lib/parser/diffApplier';
import { recommendTemplates } from '@/lib/templates/templateRecommender';
import type { ParseResultInfo } from '@/hooks/usePromptParser';
import type { InfraSpec } from '@/types';

interface PromptPanelProps {
  onSubmit: (prompt: string) => void;
  onModify?: (prompt: string) => void;
  isLoading?: boolean;
  hasExistingDiagram?: boolean;
  lastReasoning?: string | null;
  lastOperations?: Operation[] | null;
  llmAvailable?: boolean;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
  sidebarOpen?: boolean;
  /** Latest parse result for fallback detection */
  lastResult?: ParseResultInfo | null;
  /** Called when user accepts the fallback spec */
  onAcceptFallback?: (spec: InfraSpec) => void;
  /** Called when user wants to clear the fallback and retry */
  onDismissFallback?: () => void;
}

const modifyExamples = [
  'firewall 대신 VPN으로 바꿔줘',
  'WAF 추가해줘',
  '보안 강화해줘',
  'DB 이중화 구성해줘',
  '로드밸런서 제거해줘',
];

export function PromptPanel({
  onSubmit,
  onModify,
  isLoading = false,
  hasExistingDiagram = false,
  lastReasoning = null,
  lastOperations = null,
  llmAvailable = false,
  textareaRef,
  sidebarOpen = false,
  lastResult = null,
  onAcceptFallback,
  onDismissFallback,
}: PromptPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'create' | 'modify'>('create');
  const [lastSubmittedPrompt, setLastSubmittedPrompt] = useState('');

  // Auto-switch to modify mode if there's an existing diagram and LLM is available
  const effectiveMode = hasExistingDiagram && llmAvailable && mode === 'modify' ? 'modify' : 'create';
  const canModify = hasExistingDiagram && llmAvailable && onModify;

  const handleSubmit = () => {
    if (!prompt.trim() || isLoading) return;
    const trimmed = prompt.trim();
    setLastSubmittedPrompt(trimmed);

    if (effectiveMode === 'modify' && onModify) {
      onModify(trimmed);
    } else {
      onSubmit(trimmed);
    }
    setPrompt('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Template recommendations based on current input
  const recommendations = useMemo(() => {
    if (effectiveMode !== 'create' || prompt.trim().length < 2) return [];
    return recommendTemplates(prompt.trim(), 2);
  }, [prompt, effectiveMode]);

  // Suggestions for fallback (when recognition fails)
  const fallbackSuggestions = useMemo(() => {
    if (!lastResult?.isFallback || !lastSubmittedPrompt) return [];
    return recommendTemplates(lastSubmittedPrompt, 3);
  }, [lastResult?.isFallback, lastSubmittedPrompt]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`absolute bottom-6 w-full max-w-2xl px-4 transition-[left] duration-300 ${
        sidebarOpen ? 'left-[calc(50%+140px)] -translate-x-1/2' : 'left-1/2 -translate-x-1/2'
      }`}
    >
      <div className="bg-zinc-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-zinc-700 p-4">
        {/* AI Response Display */}
        <AnimatePresence>
          {lastReasoning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 p-3 bg-zinc-700/50 rounded-xl border border-zinc-600"
            >
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-4 h-4 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="text-xs font-medium text-purple-400">AI 응답</span>
              </div>
              <p className="text-sm text-zinc-300">{lastReasoning}</p>
              {lastOperations && lastOperations.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {lastOperations.map((op, idx) => {
                    const target = 'target' in op ? op.target : '';
                    const source = 'data' in op && op.data && 'source' in op.data ? op.data.source : '';
                    return (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-xs bg-zinc-600 text-zinc-300 rounded"
                      >
                        {op.type}: {target || source}
                      </span>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fallback Warning Banner */}
        <AnimatePresence>
          {lastResult?.isFallback && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 p-3 bg-amber-900/30 rounded-xl border border-amber-500/40"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm font-medium text-amber-400">인식 실패</span>
              </div>
              <p className="text-sm text-zinc-300 mb-2">
                {lastResult.error || '입력하신 내용을 정확히 인식하지 못했습니다.'}
              </p>
              <p className="text-xs text-zinc-400 mb-3">
                지원 유형: 보안, 네트워크, 컴퓨팅, 클라우드, 스토리지, 인증, 통신, WAN, CCTV/물리보안
              </p>
              <div className="flex gap-2">
                {lastResult.fallbackSpec && onAcceptFallback && (
                  <button
                    onClick={() => onAcceptFallback(lastResult.fallbackSpec!)}
                    className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-lg transition-colors"
                  >
                    기본 다이어그램 사용
                  </button>
                )}
                {onDismissFallback && (
                  <button
                    onClick={onDismissFallback}
                    className="px-3 py-1.5 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg transition-colors"
                  >
                    다시 입력
                  </button>
                )}
              </div>
              {fallbackSuggestions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-amber-500/20">
                  <p className="text-xs text-zinc-400 mb-2">혹시 이런 템플릿을 찾으셨나요?</p>
                  <div className="flex flex-wrap gap-2">
                    {fallbackSuggestions.map((rec) => (
                      <button
                        key={rec.template.id}
                        onClick={() => onSubmit(rec.template.name)}
                        className="px-3 py-1.5 text-xs bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/20 rounded-full transition-colors"
                      >
                        {rec.template.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generation Explanation Display */}
        <AnimatePresence>
          {lastResult?.explanation && !lastReasoning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 p-3 bg-blue-900/20 rounded-xl border border-blue-500/30"
            >
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <span className="text-xs font-medium text-blue-400">생성 설명</span>
              </div>
              <p className="text-sm text-zinc-300 whitespace-pre-line">
                {lastResult.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mode Toggle (only show if can modify) */}
        {canModify && (
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setMode('create')}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                mode === 'create'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
              }`}
            >
              새로 생성
            </button>
            <button
              onClick={() => setMode('modify')}
              className={`px-3 py-1 text-xs rounded-full transition-colors flex items-center gap-1 ${
                mode === 'modify'
                  ? 'bg-purple-500 text-white'
                  : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
              }`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              AI 수정
            </button>
          </div>
        )}

        {/* Template Recommendations */}
        <AnimatePresence>
          {recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3"
            >
              <div className="text-[10px] text-zinc-500 mb-1.5">추천 템플릿</div>
              <div className="flex flex-wrap gap-2">
                {recommendations.map((rec) => (
                  <button
                    key={rec.template.id}
                    onClick={() => onSubmit(rec.template.description)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 rounded-full transition-colors"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {rec.template.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Example Prompts (modify mode only) */}
        {effectiveMode === 'modify' && (
          <div className="flex flex-wrap gap-2 mb-3">
            {modifyExamples.map((example) => (
              <button
                key={example}
                onClick={() => setPrompt(example)}
                className="px-3 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-full transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-3">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              effectiveMode === 'modify'
                ? '다이어그램을 어떻게 수정할까요?...'
                : '인프라 아키텍처를 설명해주세요...'
            }
            className="flex-1 bg-zinc-900 text-white rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-500"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
            className={`
              px-6 rounded-xl font-medium transition-all
              ${
                prompt.trim() && !isLoading
                  ? effectiveMode === 'modify'
                    ? 'bg-purple-500 hover:bg-purple-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
              }
            `}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : effectiveMode === 'modify' ? (
              '수정'
            ) : (
              '생성'
            )}
          </button>
        </div>

        {/* Hint */}
        <div className="mt-2 text-xs text-zinc-500 text-center">
          Enter로 전송 | Shift+Enter로 줄바꿈
          {effectiveMode === 'modify' && (
            <span className="ml-2 text-purple-400">
              | AI가 다이어그램을 분석하여 수정합니다
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
