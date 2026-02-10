'use client';

import { useState, useMemo, KeyboardEvent, RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Operation } from '@/lib/parser/diffApplier';
import { recommendTemplates } from '@/lib/templates/templateRecommender';

interface PromptPanelProps {
  onSubmit: (prompt: string) => void;
  onModify?: (prompt: string) => void;
  isLoading?: boolean;
  hasExistingDiagram?: boolean;
  lastReasoning?: string | null;
  lastOperations?: Operation[] | null;
  llmAvailable?: boolean;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
}

const createExamples = [
  '3티어 웹 아키텍처 보여줘',
  'WAF + 로드밸런서 + 웹서버 구조',
  'VPN으로 내부망 접속하는 구조',
  '쿠버네티스 클러스터 아키텍처',
];

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
}: PromptPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'create' | 'modify'>('create');

  // Auto-switch to modify mode if there's an existing diagram and LLM is available
  const effectiveMode = hasExistingDiagram && llmAvailable && mode === 'modify' ? 'modify' : 'create';
  const canModify = hasExistingDiagram && llmAvailable && onModify;

  const handleSubmit = () => {
    if (!prompt.trim() || isLoading) return;

    if (effectiveMode === 'modify' && onModify) {
      onModify(prompt.trim());
    } else {
      onSubmit(prompt.trim());
    }
    setPrompt('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const examples = effectiveMode === 'modify' ? modifyExamples : createExamples;

  // Template recommendations based on current input
  const recommendations = useMemo(() => {
    if (effectiveMode !== 'create' || prompt.trim().length < 2) return [];
    return recommendTemplates(prompt.trim(), 2);
  }, [prompt, effectiveMode]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4"
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

        {/* Example Prompts */}
        <div className="flex flex-wrap gap-2 mb-3">
          {examples.map((example) => (
            <button
              key={example}
              onClick={() => setPrompt(example)}
              className="px-3 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-full transition-colors"
            >
              {example}
            </button>
          ))}
        </div>

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
