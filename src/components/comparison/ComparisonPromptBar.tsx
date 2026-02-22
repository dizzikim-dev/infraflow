'use client';

import { useState, useCallback, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Node, Edge } from '@xyflow/react';
import { InfraSpec } from '@/types';
import { useComparisonPrompt } from '@/hooks/useComparisonPrompt';
import type { PanelState } from '@/hooks/useComparisonMode';

interface ComparisonPromptBarProps {
  side: 'left' | 'right';
  panel: PanelState;
  onPanelUpdate: (spec: InfraSpec | null, nodes: Node[], edges: Edge[]) => void;
}

const placeholders = {
  left: '왼쪽 다이어그램 수정...',
  right: '오른쪽 다이어그램 수정...',
};

export function ComparisonPromptBar({ side, panel, onPanelUpdate }: ComparisonPromptBarProps) {
  const [prompt, setPrompt] = useState('');
  const { isLoading, error, lastModification, handleSubmit, cancel } = useComparisonPrompt({
    panel,
    onPanelUpdate,
  });

  const onSubmit = useCallback(() => {
    if (!prompt.trim() || isLoading) return;
    handleSubmit(prompt.trim());
    setPrompt('');
  }, [prompt, isLoading, handleSubmit]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSubmit();
      } else if (e.key === 'Escape') {
        cancel();
      }
    },
    [onSubmit, cancel]
  );

  return (
    <div className="border-t border-zinc-700 bg-zinc-800/90 backdrop-blur-sm px-3 py-2">
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-red-400 mb-1.5 px-1"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Last modification indicator */}
      <AnimatePresence>
        {lastModification && !isLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-zinc-500 mb-1.5 px-1 flex items-center gap-1"
          >
            <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>
              수정 적용됨
              {lastModification.operations && lastModification.operations.length > 0 && (
                <span className="text-zinc-600 ml-1">
                  ({lastModification.operations.length}개 작업)
                </span>
              )}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholders[side]}
            disabled={isLoading || panel.nodes.length === 0}
            className={`w-full bg-zinc-900/80 border border-zinc-600 rounded-lg px-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
              side === 'left'
                ? 'focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30'
                : 'focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30'
            }`}
          />
        </div>

        <button
          onClick={onSubmit}
          disabled={!prompt.trim() || isLoading || panel.nodes.length === 0}
          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
            !prompt.trim() || isLoading
              ? 'bg-zinc-700/50 text-zinc-500 cursor-not-allowed'
              : side === 'left'
                ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
          }`}
          aria-label="수정 적용"
        >
          {isLoading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
