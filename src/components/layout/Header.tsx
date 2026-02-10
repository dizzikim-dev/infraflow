'use client';

import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  LayoutGrid,
  Download,
  Sparkles,
  Columns2,
  Save,
  Check,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Cloud,
  ClipboardCheck,
  BarChart3,
  Undo2,
  Redo2,
} from 'lucide-react';
import type { ParseResultInfo } from '@/hooks';
import { UserMenu } from '@/components/auth/UserMenu';

function formatTimeSince(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return '방금';
  if (seconds < 60) return `${seconds}초 전`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}분 전`;
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

export interface HeaderProps {
  hasNodes: boolean;
  lastResult: ParseResultInfo | null;
  onAnimateClick: () => void;
  onTemplatesClick: () => void;
  onExportClick: () => void;
  onCompareClick?: () => void;
  onHealthCheckClick?: () => void;
  onInsightsClick?: () => void;
  onVulnerabilityClick?: () => void;
  onCloudCatalogClick?: () => void;
  onComplianceClick?: () => void;
  onBenchmarkClick?: () => void;
  // Undo/Redo
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  // Save/title props
  isSaving?: boolean;
  lastSavedAt?: Date | null;
  title?: string;
  onTitleChange?: (title: string) => void;
  onSave?: () => void;
}

export const Header = memo(function Header({
  hasNodes,
  lastResult,
  onAnimateClick,
  onTemplatesClick,
  onExportClick,
  onCompareClick,
  onHealthCheckClick,
  onInsightsClick,
  onVulnerabilityClick,
  onCloudCatalogClick,
  onComplianceClick,
  onBenchmarkClick,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isSaving,
  lastSavedAt,
  title,
  onTitleChange,
  onSave,
}: HeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(title || '');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [savedTimeText, setSavedTimeText] = useState('');

  // Update editTitle when title prop changes
  useEffect(() => {
    if (!isEditingTitle) setEditTitle(title || '');
  }, [title, isEditingTitle]);

  // Update saved time display
  useEffect(() => {
    if (!lastSavedAt) { setSavedTimeText(''); return; }
    setSavedTimeText(formatTimeSince(lastSavedAt));
    const interval = setInterval(() => {
      setSavedTimeText(formatTimeSince(lastSavedAt));
    }, 10000);
    return () => clearInterval(interval);
  }, [lastSavedAt]);

  // Focus input when editing
  useEffect(() => {
    if (isEditingTitle) titleInputRef.current?.focus();
  }, [isEditingTitle]);

  const handleTitleSubmit = useCallback(() => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== title) {
      onTitleChange?.(trimmed);
    } else {
      setEditTitle(title || '');
    }
    setIsEditingTitle(false);
  }, [editTitle, title, onTitleChange]);

  return (
    <header className="absolute top-0 left-0 right-0 z-10">
      <div className="mx-4 mt-4">
        <div className="
          flex items-center justify-between
          px-4 py-2.5
          bg-zinc-900/70 backdrop-blur-xl
          border border-zinc-800/50
          rounded-2xl
          shadow-2xl shadow-black/20
        ">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="
              w-8 h-8 rounded-lg
              bg-gradient-to-br from-blue-500 to-indigo-600
              flex items-center justify-center
              shadow-lg shadow-blue-500/20
            ">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">InfraFlow</h1>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">AI Infrastructure</span>
            </div>

            {/* Editable Title */}
            {title !== undefined && (
              <div className="hidden md:flex items-center gap-2 ml-2 pl-3 border-l border-zinc-700/50">
                {isEditingTitle ? (
                  <input
                    ref={titleInputRef}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={handleTitleSubmit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTitleSubmit();
                      if (e.key === 'Escape') { setEditTitle(title || ''); setIsEditingTitle(false); }
                    }}
                    className="bg-zinc-800 text-sm text-white px-2 py-0.5 rounded border border-zinc-600 outline-none focus:border-blue-500 w-48"
                    maxLength={100}
                  />
                ) : (
                  <button
                    onClick={() => onTitleChange && setIsEditingTitle(true)}
                    className="text-sm text-zinc-300 hover:text-white transition-colors truncate max-w-48"
                    title={onTitleChange ? '클릭하여 제목 편집' : undefined}
                  >
                    {title || '제목 없음'}
                  </button>
                )}
              </div>
            )}

            {/* Save Status Badge */}
            {isSaving !== undefined && (
              <div className="hidden md:flex items-center">
                {isSaving ? (
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    저장 중...
                  </span>
                ) : lastSavedAt ? (
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    저장됨 · {savedTimeText}
                  </span>
                ) : null}
              </div>
            )}
          </div>

          {/* Status Badge */}
          {lastResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="
                hidden md:flex items-center gap-2
                px-3 py-1.5 rounded-full
                bg-zinc-800/50 border border-zinc-700/50
              "
            >
              <div className={`
                w-2 h-2 rounded-full
                ${lastResult.confidence > 0.7 ? 'bg-emerald-500' : 'bg-amber-500'}
              `} />
              <span className="text-xs text-zinc-400">
                {lastResult.templateUsed && (
                  <span className="text-zinc-300">{lastResult.templateUsed}</span>
                )}
                {lastResult.templateUsed && ' · '}
                {Math.round(lastResult.confidence * 100)}%
              </span>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {/* Undo/Redo */}
            {onUndo && (
              <div className="flex items-center gap-0.5 mr-1">
                <button
                  onClick={onUndo}
                  disabled={!canUndo}
                  title="실행 취소 (Ctrl+Z)"
                  className={`
                    p-2 rounded-lg transition-all duration-200
                    ${canUndo
                      ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                      : 'text-zinc-700 cursor-not-allowed'
                    }
                  `}
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onRedo}
                  disabled={!canRedo}
                  title="다시 실행 (Ctrl+Shift+Z)"
                  className={`
                    p-2 rounded-lg transition-all duration-200
                    ${canRedo
                      ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                      : 'text-zinc-700 cursor-not-allowed'
                    }
                  `}
                >
                  <Redo2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Animation Button */}
            <button
              onClick={onAnimateClick}
              disabled={!hasNodes}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                transition-all duration-200
                ${hasNodes
                  ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20'
                  : 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed border border-transparent'
                }
              `}
            >
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">Animate</span>
            </button>

            {/* Compare Button */}
            {onCompareClick && (
              <button
                onClick={onCompareClick}
                disabled={!hasNodes}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${hasNodes
                    ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20'
                    : 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed border border-transparent'
                  }
                `}
              >
                <Columns2 className="w-4 h-4" />
                <span className="hidden sm:inline">Compare</span>
              </button>
            )}

            {/* Health Check Button */}
            {onHealthCheckClick && (
              <button
                onClick={onHealthCheckClick}
                disabled={!hasNodes}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${hasNodes
                    ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20'
                    : 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed border border-transparent'
                  }
                `}
              >
                <AlertCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Diagnose</span>
              </button>
            )}

            {/* Insights Button */}
            {onInsightsClick && (
              <button
                onClick={onInsightsClick}
                disabled={!hasNodes}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${hasNodes
                    ? 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20'
                    : 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed border border-transparent'
                  }
                `}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">Insights</span>
              </button>
            )}

            {/* Vulnerability Button */}
            {onVulnerabilityClick && (
              <button
                onClick={onVulnerabilityClick}
                disabled={!hasNodes}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${hasNodes
                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                    : 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed border border-transparent'
                  }
                `}
              >
                <ShieldAlert className="w-4 h-4" />
                <span className="hidden lg:inline">CVE</span>
              </button>
            )}

            {/* Cloud Catalog Button */}
            {onCloudCatalogClick && (
              <button
                onClick={onCloudCatalogClick}
                disabled={!hasNodes}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${hasNodes
                    ? 'bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/20'
                    : 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed border border-transparent'
                  }
                `}
              >
                <Cloud className="w-4 h-4" />
                <span className="hidden lg:inline">Cloud</span>
              </button>
            )}

            {/* Compliance Button */}
            {onComplianceClick && (
              <button
                onClick={onComplianceClick}
                disabled={!hasNodes}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${hasNodes
                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                    : 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed border border-transparent'
                  }
                `}
              >
                <ClipboardCheck className="w-4 h-4" />
                <span className="hidden lg:inline">Comply</span>
              </button>
            )}

            {/* Benchmark Button */}
            {onBenchmarkClick && (
              <button
                onClick={onBenchmarkClick}
                disabled={!hasNodes}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${hasNodes
                    ? 'bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20'
                    : 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed border border-transparent'
                  }
                `}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden lg:inline">Bench</span>
              </button>
            )}

            {/* Templates Button */}
            <button
              onClick={onTemplatesClick}
              className="
                flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                bg-zinc-800/50 text-zinc-300
                hover:bg-zinc-700/50 hover:text-white
                border border-zinc-700/30
                transition-all duration-200
              "
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
            </button>

            {/* Export Button */}
            <button
              onClick={onExportClick}
              disabled={!hasNodes}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                transition-all duration-200
                ${hasNodes
                  ? 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50 hover:text-white border border-zinc-700/30'
                  : 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed border border-transparent'
                }
              `}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Save Button (for unsaved diagrams) */}
            {onSave && (
              <button
                onClick={onSave}
                disabled={!hasNodes}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${hasNodes
                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                    : 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed border border-transparent'
                  }
                `}
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">Save</span>
              </button>
            )}

            {/* User Menu */}
            <div className="ml-1 border-l border-zinc-700/50 pl-2">
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});
