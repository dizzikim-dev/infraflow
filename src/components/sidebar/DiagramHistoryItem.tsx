'use client';

import { memo } from 'react';
import { Trash2 } from 'lucide-react';

interface DiagramHistoryItemProps {
  id: string;
  title: string;
  updatedAt: string;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export const DiagramHistoryItem = memo(function DiagramHistoryItem({
  id,
  title,
  updatedAt,
  isActive,
  onSelect,
  onDelete,
}: DiagramHistoryItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(id); } }}
      className={`
        group w-full flex items-center gap-2 px-3 py-2.5 text-left cursor-pointer
        rounded-lg transition-colors duration-150
        ${isActive
          ? 'bg-zinc-800/80 border-l-2 border-blue-500 pl-[10px]'
          : 'hover:bg-zinc-800/50 border-l-2 border-transparent pl-[10px]'
        }
      `}
    >
      <div className="flex-1 min-w-0">
        <div className={`text-sm truncate ${isActive ? 'text-white font-medium' : 'text-zinc-300'}`}>
          {title || '제목 없음'}
        </div>
        <div className="text-[11px] text-zinc-500 mt-0.5">
          {formatRelativeTime(updatedAt)}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(id);
        }}
        className="
          opacity-0 group-hover:opacity-100
          p-1 rounded-md
          text-zinc-500 hover:text-red-400 hover:bg-zinc-700/50
          transition-all duration-150
        "
        title="삭제"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
});
