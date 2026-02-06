'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

// SVG Icons
const LayoutIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
    <path d="M5 19l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1z" />
    <path d="M19 13l1 2 1-2 2-1-2-1-1-2-1 2-2 1 2 1z" />
  </svg>
);

const CubeIcon = () => (
  <svg className="w-10 h-10 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

export interface EmptyStateProps {
  onTemplatesClick: () => void;
  onPromptFocus: () => void;
}

export const EmptyState = memo(function EmptyState({
  onTemplatesClick,
  onPromptFocus,
}: EmptyStateProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg px-6"
      >
        {/* Animated Icon */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="
            w-20 h-20 mx-auto mb-6 rounded-2xl
            bg-gradient-to-br from-blue-500/20 to-indigo-600/20
            border border-blue-500/20
            flex items-center justify-center
          "
        >
          <CubeIcon />
        </motion.div>

        <h2 className="text-2xl font-bold text-white mb-3">
          인프라를 시각화해보세요
        </h2>
        <p className="text-zinc-400 mb-6 leading-relaxed">
          자연어로 인프라 구조를 설명하면 자동으로 다이어그램이 생성됩니다.
          <br />
          <span className="text-zinc-500">예: "3티어 웹 아키텍처", "VDI + OpenClaw 비서AI"</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pointer-events-auto">
          <button
            onClick={onTemplatesClick}
            className="
              px-5 py-2.5 rounded-xl text-sm font-medium
              bg-gradient-to-r from-blue-500 to-indigo-600
              hover:from-blue-600 hover:to-indigo-700
              text-white shadow-lg shadow-blue-500/25
              transition-all duration-200
              flex items-center justify-center gap-2
            "
          >
            <LayoutIcon />
            템플릿에서 시작하기
          </button>
          <button
            onClick={onPromptFocus}
            className="
              px-5 py-2.5 rounded-xl text-sm font-medium
              bg-zinc-800/50 hover:bg-zinc-700/50
              text-zinc-300 hover:text-white
              border border-zinc-700/50
              transition-all duration-200
              flex items-center justify-center gap-2
            "
          >
            <SparklesIcon />
            직접 입력하기
          </button>
        </div>
      </motion.div>
    </div>
  );
});
