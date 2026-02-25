'use client';

/**
 * Inline Reference Box — collapsed summary with expandable source list.
 *
 * Shows "▸ 참조 출처 (N) · 검증 PASS · 경고 M" in collapsed state.
 * Expands to show aggregated sources with usedInSteps tags.
 * "자세히 보기" opens the full EvidencePanel.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnswerEvidence } from '@/lib/rag/sourceAggregator';

interface ReferenceBoxProps {
  evidence: AnswerEvidence | null;
  onOpenEvidence?: () => void;
}

const BADGE_STYLES = {
  pass: 'bg-emerald-500/20 text-emerald-300',
  warning: 'bg-amber-500/20 text-amber-300',
  fail: 'bg-red-500/20 text-red-300',
};

const BADGE_LABELS = { pass: 'PASS', warning: 'WARNING', fail: 'FAIL' };

const STEP_COLORS: Record<string, string> = {
  rag: 'bg-blue-500/20 text-blue-300',
  enrichment: 'bg-emerald-500/20 text-emerald-300',
  verify: 'bg-purple-500/20 text-purple-300',
  'live-augment': 'bg-orange-500/20 text-orange-300',
};

export function ReferenceBox({ evidence, onOpenEvidence }: ReferenceBoxProps) {
  const [expanded, setExpanded] = useState(false);

  if (!evidence) return null;

  const { sources, verificationBadge, openIssues } = evidence;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-3"
    >
      {/* Collapsed header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs bg-zinc-700/50 hover:bg-zinc-700/70 rounded-xl border border-zinc-600/50 transition-colors"
      >
        <span className="text-zinc-400">{expanded ? '▾' : '▸'}</span>
        <span className="text-zinc-300">참조 출처</span>
        <span className="px-1.5 py-0.5 rounded-full bg-zinc-600 text-zinc-300">{sources.length}</span>
        <span className="text-zinc-600">·</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${BADGE_STYLES[verificationBadge]}`}>
          검증 {BADGE_LABELS[verificationBadge]}
        </span>
        {openIssues.length > 0 && (
          <>
            <span className="text-zinc-600">·</span>
            <span className="text-amber-400">경고 {openIssues.length}</span>
          </>
        )}
        <span className="ml-auto text-zinc-500">References</span>
      </button>

      {/* Expanded source list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 space-y-1"
          >
            {sources.map((src) => (
              <div
                key={src.id}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 rounded-lg border border-white/5 text-xs"
              >
                <span className="text-zinc-300 flex-1 truncate">{src.title}</span>
                <span className="text-[10px] text-zinc-500">{(src.score * 100).toFixed(0)}%</span>
                <div className="flex gap-1">
                  {src.usedInSteps.map((step) => (
                    <span
                      key={step}
                      className={`text-[9px] px-1 py-0.5 rounded ${STEP_COLORS[step] ?? 'bg-zinc-600 text-zinc-400'}`}
                    >
                      {step}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {onOpenEvidence && (
              <button
                onClick={onOpenEvidence}
                className="w-full text-center text-[10px] text-emerald-400/70 hover:text-emerald-400 py-1.5 transition-colors"
              >
                자세히 보기 / View Details →
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
