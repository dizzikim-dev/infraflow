'use client';

import { useState, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';

interface PromptPanelProps {
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
}

const examplePrompts = [
  '3티어 웹 아키텍처 보여줘',
  'WAF + 로드밸런서 + 웹서버 구조',
  'VPN으로 내부망 접속하는 구조',
  '쿠버네티스 클러스터 아키텍처',
];

export function PromptPanel({ onSubmit, isLoading = false }: PromptPanelProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = () => {
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim());
      setPrompt('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4"
    >
      <div className="bg-zinc-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-zinc-700 p-4">
        {/* Example Prompts */}
        <div className="flex flex-wrap gap-2 mb-3">
          {examplePrompts.map((example) => (
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
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="인프라 아키텍처를 설명해주세요..."
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
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
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
            ) : (
              '생성'
            )}
          </button>
        </div>

        {/* Hint */}
        <div className="mt-2 text-xs text-zinc-500 text-center">
          Enter로 전송 | Shift+Enter로 줄바꿈
        </div>
      </div>
    </motion.div>
  );
}
