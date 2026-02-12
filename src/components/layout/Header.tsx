'use client';

import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Search,
  ChevronDown,
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
  sidebarOpen?: boolean;
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
  sidebarOpen,
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
  const [analyzeOpen, setAnalyzeOpen] = useState(false);
  const analyzeRef = useRef<HTMLDivElement>(null);

  // Close analyze dropdown on outside click
  useEffect(() => {
    if (!analyzeOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (analyzeRef.current && !analyzeRef.current.contains(e.target as Node)) {
        setAnalyzeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [analyzeOpen]);

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
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className={`mt-4 mr-4 transition-[margin] duration-300 ${sidebarOpen ? 'ml-[296px]' : 'ml-16'}`}>
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

            {/* Animate */}
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

            {/* Compare */}
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

            {/* Analyze Dropdown */}
            <div ref={analyzeRef} className="relative">
              <button
                onClick={() => setAnalyzeOpen(prev => !prev)}
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
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Analyze</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${analyzeOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {analyzeOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="
                      absolute right-0 top-full mt-2 z-50
                      w-56 py-1.5
                      bg-zinc-900/95 backdrop-blur-xl
                      border border-zinc-700/50
                      rounded-xl shadow-2xl shadow-black/40
                    "
                  >
                    {([
                      { onClick: onHealthCheckClick, icon: AlertCircle, label: 'Diagnose', desc: '안티패턴 탐지 · 헬스체크', color: 'amber' },
                      { onClick: onInsightsClick, icon: CheckCircle2, label: 'Insights', desc: '패턴 사용 빈도 분석', color: 'cyan' },
                      { onClick: onVulnerabilityClick, icon: ShieldAlert, label: 'CVE', desc: '취약점 DB 조회', color: 'red' },
                      { onClick: onCloudCatalogClick, icon: Cloud, label: 'Cloud', desc: '클라우드 서비스 카탈로그', color: 'sky' },
                      { onClick: onComplianceClick, icon: ClipboardCheck, label: 'Comply', desc: '산업별 컴플라이언스', color: 'emerald' },
                      { onClick: onBenchmarkClick, icon: BarChart3, label: 'Bench', desc: '컴포넌트 사이징 벤치마크', color: 'violet' },
                    ]).filter(item => item.onClick).map(({ onClick, icon: Icon, label, desc, color }) => (
                      <button
                        key={label}
                        onClick={() => { onClick?.(); setAnalyzeOpen(false); }}
                        className="
                          w-full flex items-center gap-3 px-3 py-2.5
                          text-left text-sm
                          hover:bg-zinc-800/70 transition-colors duration-150
                        "
                      >
                        <Icon className={`w-4 h-4 text-${color}-400 shrink-0`} />
                        <div>
                          <div className="text-zinc-200 font-medium">{label}</div>
                          <div className="text-[11px] text-zinc-500">{desc}</div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
