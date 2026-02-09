'use client';

/**
 * Plugin Card Component
 *
 * Individual plugin card displaying plugin info, status, and actions.
 * Extracted from PluginManager for component modularity.
 */

import { useState } from 'react';
import type { PluginState } from '@/types/plugin';

// ============================================================
// Types
// ============================================================

export interface PluginCardProps {
  state: PluginState;
  onActivate: (id: string) => Promise<void>;
  onDeactivate: (id: string) => Promise<void>;
}

// ============================================================
// Status Maps
// ============================================================

const STATUS_COLOR: Record<string, string> = {
  installed: 'bg-blue-500',
  active: 'bg-green-500',
  inactive: 'bg-zinc-500',
  error: 'bg-red-500',
};

const STATUS_TEXT: Record<string, string> = {
  installed: '설치됨',
  active: '활성',
  inactive: '비활성',
  error: '오류',
};

// ============================================================
// Component
// ============================================================

export function PluginCard({ state, onActivate, onDeactivate }: PluginCardProps) {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { plugin, status, error, loadedAt } = state;
  const { metadata } = plugin;

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (status === 'active') {
        await onDeactivate(metadata.id);
      } else {
        await onActivate(metadata.id);
      }
    } finally {
      setLoading(false);
    }
  };

  const statusColor = STATUS_COLOR[status];
  const statusText = STATUS_TEXT[status];

  return (
    <div className="bg-zinc-800 rounded-lg shadow-md overflow-hidden border border-zinc-700">
      {/* Header */}
      <div className="p-4 border-b border-zinc-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-zinc-100">{metadata.name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs text-white ${statusColor}`}>
                {statusText}
              </span>
            </div>
            <p className="text-sm text-zinc-400 mt-1">{metadata.description}</p>
          </div>
          <button
            onClick={handleToggle}
            disabled={loading || metadata.id === 'core'}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}
              ${metadata.id === 'core' ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed' : ''}
              ${status === 'active' && metadata.id !== 'core'
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'}
            `}
          >
            {loading ? '처리 중...' : status === 'active' ? '비활성화' : '활성화'}
          </button>
        </div>
      </div>

      {/* Meta Info */}
      <div className="px-4 py-3 bg-zinc-800/50 text-sm">
        <div className="flex flex-wrap gap-4">
          <span className="text-zinc-400">
            <strong>버전:</strong> {metadata.version}
          </span>
          {metadata.author && (
            <span className="text-zinc-400">
              <strong>제작자:</strong> {metadata.author}
            </span>
          )}
          <span className="text-zinc-400">
            <strong>ID:</strong> {metadata.id}
          </span>
        </div>
        {loadedAt && (
          <div className="mt-2 text-zinc-500 text-xs">
            로드: {new Date(loadedAt).toLocaleString('ko-KR')}
          </div>
        )}
        {error && (
          <div className="mt-2 text-red-400 text-xs">
            오류: {error}
          </div>
        )}
      </div>

      {/* Expand/Collapse */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2 text-sm text-blue-400 hover:bg-zinc-700/50 transition flex items-center justify-center gap-1"
      >
        {expanded ? '접기' : '상세 보기'}
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 py-3 border-t border-zinc-700 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-zinc-300 mb-2">노드 확장</h4>
              <p className="text-zinc-500">
                {plugin.nodes?.length || 0}개 노드
              </p>
            </div>
            <div>
              <h4 className="font-medium text-zinc-300 mb-2">익스포터</h4>
              <p className="text-zinc-500">
                {plugin.exporters?.length || 0}개 형식
              </p>
            </div>
            <div>
              <h4 className="font-medium text-zinc-300 mb-2">패널</h4>
              <p className="text-zinc-500">
                {plugin.panels?.length || 0}개 패널
              </p>
            </div>
            <div>
              <h4 className="font-medium text-zinc-300 mb-2">테마</h4>
              <p className="text-zinc-500">
                {plugin.themes?.length || 0}개 테마
              </p>
            </div>
          </div>
          {plugin.parsers && (
            <div className="mt-3">
              <h4 className="font-medium text-zinc-300 mb-2">파서 확장</h4>
              <p className="text-zinc-500">
                {plugin.parsers.patterns?.length || 0}개 패턴,{' '}
                {Object.keys(plugin.parsers.templates || {}).length}개 템플릿
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
