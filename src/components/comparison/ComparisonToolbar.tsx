'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  ArrowLeftRight,
  Copy,
  Eye,
  EyeOff,
  Link,
  Unlink,
  Layers,
} from 'lucide-react';
import { ComparisonMode } from '@/hooks/useComparisonMode';

interface ComparisonToolbarProps {
  mode: ComparisonMode;
  showDiff: boolean;
  syncViewport: boolean;
  onExit: () => void;
  onModeChange: (mode: ComparisonMode) => void;
  onSwapPanels: () => void;
  onCopyToRight: () => void;
  onCopyToLeft: () => void;
  onToggleDiff: () => void;
  onToggleSyncViewport: () => void;
}

/**
 * Toolbar for comparison mode controls
 */
export const ComparisonToolbar = memo(function ComparisonToolbar({
  mode,
  showDiff,
  syncViewport,
  onExit,
  onModeChange,
  onSwapPanels,
  onCopyToRight,
  onCopyToLeft,
  onToggleDiff,
  onToggleSyncViewport,
}: ComparisonToolbarProps) {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      className="absolute top-0 left-0 right-0 z-50 bg-zinc-900/95 border-b border-zinc-700 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left section - Exit and Mode */}
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
          >
            <X size={16} />
            비교 종료
          </button>

          <div className="h-6 w-px bg-zinc-700" />

          {/* Mode selector */}
          <div className="flex items-center bg-zinc-800 rounded-md p-0.5">
            <button
              onClick={() => onModeChange('before-after')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                mode === 'before-after'
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              전후 비교
            </button>
            <button
              onClick={() => onModeChange('independent')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                mode === 'independent'
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              독립 비교
            </button>
          </div>
        </div>

        {/* Center section - Actions */}
        <div className="flex items-center gap-2">
          <ToolbarButton
            icon={<ArrowLeftRight size={16} />}
            label="패널 스왑"
            onClick={onSwapPanels}
          />

          <div className="h-6 w-px bg-zinc-700" />

          <ToolbarButton
            icon={<Copy size={16} className="scale-x-[-1]" />}
            label="왼쪽 → 오른쪽"
            onClick={onCopyToRight}
          />
          <ToolbarButton
            icon={<Copy size={16} />}
            label="오른쪽 → 왼쪽"
            onClick={onCopyToLeft}
          />
        </div>

        {/* Right section - View options */}
        <div className="flex items-center gap-2">
          <ToolbarButton
            icon={showDiff ? <Eye size={16} /> : <EyeOff size={16} />}
            label={showDiff ? 'Diff 숨기기' : 'Diff 표시'}
            onClick={onToggleDiff}
            active={showDiff}
          />
          <ToolbarButton
            icon={syncViewport ? <Link size={16} /> : <Unlink size={16} />}
            label={syncViewport ? '뷰포트 동기화 해제' : '뷰포트 동기화'}
            onClick={onToggleSyncViewport}
            active={syncViewport}
          />
        </div>
      </div>

      {/* Diff Legend */}
      {showDiff && (
        <div className="flex items-center justify-center gap-6 py-1.5 text-xs border-t border-zinc-800">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-green-500/30 border border-green-500" />
            <span className="text-zinc-400">추가됨</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-red-500/30 border border-red-500" />
            <span className="text-zinc-400">삭제됨</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-yellow-500/30 border border-yellow-500" />
            <span className="text-zinc-400">수정됨</span>
          </div>
        </div>
      )}
    </motion.div>
  );
});

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}

const ToolbarButton = memo(function ToolbarButton({
  icon,
  label,
  onClick,
  active = false,
  disabled = false,
}: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`
        flex items-center gap-1.5 px-2.5 py-1.5 text-sm rounded-md transition-colors
        ${disabled
          ? 'text-zinc-600 cursor-not-allowed'
          : active
            ? 'text-blue-400 bg-blue-500/20 hover:bg-blue-500/30'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
        }
      `}
    >
      {icon}
      <span className="hidden lg:inline">{label}</span>
    </button>
  );
});

export default ComparisonToolbar;
