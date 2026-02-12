'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Sparkles } from 'lucide-react';
import { DiagramHistoryItem } from './DiagramHistoryItem';

/** Minimal entry shape accepted by the sidebar — both localStorage and DB entries satisfy this */
export interface HistoryEntry {
  id: string;
  title: string;
  updatedAt: string;
}

interface HistorySidebarProps {
  entries: HistoryEntry[];
  activeId: string | null;
  loading?: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewDiagram: () => void;
}

interface DiagramGroup {
  label: string;
  items: HistoryEntry[];
}

function groupByDate(entries: HistoryEntry[]): DiagramGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const weekAgo = today - 7 * 86400000;

  const groups: Record<string, HistoryEntry[]> = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  };

  for (const d of entries) {
    const t = new Date(d.updatedAt).getTime();
    if (t >= today) groups.today.push(d);
    else if (t >= yesterday) groups.yesterday.push(d);
    else if (t >= weekAgo) groups.thisWeek.push(d);
    else groups.older.push(d);
  }

  const result: DiagramGroup[] = [];
  if (groups.today.length) result.push({ label: '오늘', items: groups.today });
  if (groups.yesterday.length) result.push({ label: '어제', items: groups.yesterday });
  if (groups.thisWeek.length) result.push({ label: '이번 주', items: groups.thisWeek });
  if (groups.older.length) result.push({ label: '이전', items: groups.older });
  return result;
}

export function HistorySidebar({
  entries,
  activeId,
  loading,
  onClose,
  onSelect,
  onDelete,
  onNewDiagram,
}: HistorySidebarProps) {
  const groups = useMemo(() => groupByDate(entries), [entries]);

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      exit={{ x: -280 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="
        fixed top-0 left-0 h-screen w-[280px] z-40
        bg-zinc-900/95 backdrop-blur-xl
        border-r border-zinc-800
        flex flex-col
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800/50">
        <div className="flex items-center gap-2">
          <div className="
            w-7 h-7 rounded-lg
            bg-gradient-to-br from-blue-500 to-indigo-600
            flex items-center justify-center
            shadow-lg shadow-blue-500/20
          ">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight">InfraFlow</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800/70 transition-colors"
          title="사이드바 닫기 (Ctrl+B)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* New Diagram Button */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={onNewDiagram}
          className="
            w-full flex items-center justify-center gap-2
            px-4 py-2.5 rounded-xl
            bg-zinc-800 hover:bg-zinc-700
            text-sm font-medium text-zinc-200
            border border-zinc-700/50 hover:border-zinc-600
            transition-all duration-200
          "
        >
          <Plus className="w-4 h-4" />
          새 다이어그램
        </button>
      </div>

      {/* Diagram List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin">
        {loading ? (
          <div className="flex flex-col items-center py-12 gap-2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-zinc-500">불러오는 중...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <div className="text-2xl mb-2">📋</div>
            <p className="text-xs">아직 다이어그램이 없습니다</p>
            <p className="text-[11px] mt-1 text-zinc-600">프롬프트를 입력하면 자동 저장됩니다</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="mb-3">
              <div className="px-3 py-1.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                {group.label}
              </div>
              {group.items.map((d) => (
                <DiagramHistoryItem
                  key={d.id}
                  id={d.id}
                  title={d.title}
                  updatedAt={d.updatedAt}
                  isActive={d.id === activeId}
                  onSelect={onSelect}
                  onDelete={onDelete}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </motion.aside>
  );
}
