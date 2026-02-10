'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAnalytics, type AnalyticsData } from '@/hooks/useAnalytics';
import { useCalibration } from '@/hooks/useCalibration';
import type { CalibratedAntiPattern } from '@/lib/learning/types';

type TabType = 'patterns' | 'cooccurrence' | 'parser' | 'calibration';

const CloseIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

export interface InsightsPanelProps {
  onClose: () => void;
}

export function InsightsPanel({ onClose }: InsightsPanelProps) {
  const { data, isLoading, error, refresh } = useAnalytics();
  const calibration = useCalibration();
  const [activeTab, setActiveTab] = useState<TabType>('patterns');
  const [fpRate, setFpRate] = useState<number | null>(null);
  const [calibrationStats, setCalibrationStats] = useState<{
    total: number;
    calibrated: number;
    suppressed: number;
    items: CalibratedAntiPattern[];
  } | null>(null);

  // Load data on mount
  useEffect(() => {
    refresh();
    calibration.getFalsePositiveRate().then(setFpRate);
  }, [refresh]); // eslint-disable-line react-hooks/exhaustive-deps

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'patterns', label: '패턴 빈도', count: data?.patternFrequency.length ?? 0 },
    { key: 'cooccurrence', label: '컴포넌트 조합', count: data?.coOccurrences.length ?? 0 },
    { key: 'parser', label: '파서 개선', count: data?.failedPrompts.length ?? 0 },
    { key: 'calibration', label: '보정 현황', count: calibrationStats?.calibrated ?? 0 },
  ];

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 h-full w-[480px] z-50 flex flex-col bg-zinc-900/95 backdrop-blur-xl border-l border-zinc-800"
      data-testid="insights-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
        <div>
          <h2 className="text-lg font-bold text-white">인사이트</h2>
          <p className="text-xs text-zinc-500 mt-0.5">사용 패턴 분석</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
            aria-label="새로고침"
          >
            <RefreshIcon />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            aria-label="닫기"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-3 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === tab.key
                ? 'text-blue-400'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-zinc-800 text-zinc-400">
                {tab.count}
              </span>
            )}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {isLoading && (
          <div className="flex items-center justify-center py-12 text-zinc-500">
            <div className="w-6 h-6 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
            <span className="ml-3 text-sm">분석 중...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {!isLoading && !error && data && (
          <>
            {activeTab === 'patterns' && <PatternFrequencyTab data={data} />}
            {activeTab === 'cooccurrence' && <CoOccurrenceTab data={data} />}
            {activeTab === 'parser' && <ParserTab data={data} />}
            {activeTab === 'calibration' && <CalibrationTab fpRate={fpRate} />}
          </>
        )}

        {!isLoading && !error && data && data.patternFrequency.length === 0 && data.coOccurrences.length === 0 && data.failedPrompts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-500 text-sm">아직 분석할 데이터가 없습니다.</p>
            <p className="text-zinc-600 text-xs mt-1">다이어그램을 생성하면 인사이트가 나타납니다.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {data && (
        <div className="px-5 py-3 border-t border-zinc-800 text-xs text-zinc-600">
          패턴 {data.patternFrequency.length}개 · 조합 {data.coOccurrences.length}개 · 제안 {data.relationshipSuggestions.length}개
        </div>
      )}
    </motion.div>
  );
}

// ─── Tab Components ────────────────────────────────────────────────────

function PatternFrequencyTab({ data }: { data: AnalyticsData }) {
  if (data.patternFrequency.length === 0) {
    return <EmptyMessage message="감지된 패턴이 없습니다." />;
  }

  const maxCount = Math.max(...data.patternFrequency.map((p) => p.count));

  return (
    <div className="space-y-3">
      {data.patternFrequency.map((p) => (
        <div key={p.patternId} className="bg-zinc-800/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-200">{p.patternNameKo}</span>
            <span className="text-xs text-zinc-500">{p.count}회</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${(p.count / maxCount) * 100}%` }}
            />
          </div>
          {p.averageRating != null && (
            <div className="mt-1.5 text-xs text-zinc-500">
              평균 평점: {'★'.repeat(Math.round(p.averageRating))}{'☆'.repeat(5 - Math.round(p.averageRating))} ({p.averageRating.toFixed(1)})
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CoOccurrenceTab({ data }: { data: AnalyticsData }) {
  if (data.coOccurrences.length === 0) {
    return <EmptyMessage message="충분한 데이터가 없습니다." />;
  }

  return (
    <div className="space-y-4">
      {/* Suggestions badge */}
      {data.relationshipSuggestions.length > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
          <span className="text-xs font-medium text-emerald-400">
            새 관계 제안 {data.relationshipSuggestions.length}건
          </span>
          <div className="mt-2 space-y-1">
            {data.relationshipSuggestions.slice(0, 5).map((s, i) => (
              <div key={i} className="text-xs text-zinc-400">
                {s.source} → {s.target} ({s.suggestedType}, {Math.round(s.confidence * 100)}%)
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Co-occurrence table */}
      <div className="space-y-2">
        {data.coOccurrences.slice(0, 15).map((co, i) => (
          <div key={i} className="flex items-center justify-between bg-zinc-800/50 rounded-lg px-3 py-2">
            <div className="text-sm text-zinc-300">
              <span className="text-blue-400">{co.typeA}</span>
              {' + '}
              <span className="text-purple-400">{co.typeB}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">{co.coOccurrenceCount}회</span>
              <span className="text-xs text-zinc-600">({Math.round(co.confidence * 100)}%)</span>
              {co.isExistingRelationship && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-400">기존</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Placement corrections */}
      {data.placementCorrections.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs uppercase text-zinc-500 tracking-wider mb-2">배치 수정 패턴</h3>
          <div className="space-y-1">
            {data.placementCorrections.slice(0, 5).map((pc, i) => (
              <div key={i} className="text-xs text-zinc-400 bg-zinc-800/30 rounded px-3 py-2">
                <span className="text-amber-400">{pc.nodeType}</span>: {pc.fromTier} → {pc.toTier} ({pc.count}회, {Math.round(pc.correctionRate * 100)}%)
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ParserTab({ data }: { data: AnalyticsData }) {
  if (data.failedPrompts.length === 0) {
    return <EmptyMessage message="실패한 프롬프트가 없습니다." />;
  }

  return (
    <div className="space-y-3">
      {data.failedPrompts.map((fp, i) => (
        <div key={i} className="bg-zinc-800/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-red-400">&quot;{fp.keyword}&quot;</span>
            <span className="text-xs text-zinc-500">
              실패율 {Math.round(fp.failureRate * 100)}%
            </span>
          </div>
          <div className="text-xs text-zinc-500 mb-2">
            {fp.failureCount}회 실패 / {fp.totalAttempts}회 시도
          </div>
          {fp.samplePrompts.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] uppercase text-zinc-600">예시 프롬프트:</span>
              {fp.samplePrompts.slice(0, 3).map((sp, j) => (
                <div key={j} className="text-xs text-zinc-400 truncate">
                  · {sp}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CalibrationTab({ fpRate }: { fpRate: number | null }) {
  const fpPercent = fpRate != null ? Math.round(fpRate * 100) : null;
  const isHealthy = fpPercent != null && fpPercent < 20;

  return (
    <div className="space-y-4">
      {/* FP Rate Card */}
      <div className={`rounded-lg p-4 border ${
        isHealthy
          ? 'bg-emerald-500/10 border-emerald-500/20'
          : fpPercent != null
            ? 'bg-amber-500/10 border-amber-500/20'
            : 'bg-zinc-800/50 border-zinc-700'
      }`}>
        <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">False Positive Rate</div>
        <div className="flex items-end gap-2">
          <span className={`text-2xl font-bold ${
            isHealthy ? 'text-emerald-400' : fpPercent != null ? 'text-amber-400' : 'text-zinc-400'
          }`}>
            {fpPercent != null ? `${fpPercent}%` : '-'}
          </span>
          <span className="text-xs text-zinc-500 mb-1">
            {isHealthy ? '목표 달성 (<20%)' : fpPercent != null ? '목표: <20%' : '데이터 없음'}
          </span>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-zinc-800/30 rounded-lg p-3">
        <h4 className="text-xs font-medium text-zinc-400 mb-2">보정 규칙</h4>
        <div className="space-y-1.5 text-xs text-zinc-500">
          <p>• 무시율 ≥ 70% (10회+) → 심각도 1단계 하향</p>
          <p>• 무시율 ≥ 90% (20회+) → 심각도 2단계 하향/억제</p>
          <p>• 수정율 ≥ 50% (10회+) → 심각도 유지/상향</p>
          <p className="text-amber-500/70">• Critical은 Medium까지만 하향 (억제 불가)</p>
        </div>
      </div>

      <div className="text-center py-4 text-xs text-zinc-600">
        안티패턴 진단 패널에서 &quot;무시&quot; / &quot;수정 완료&quot; 버튼을 통해 보정 데이터가 수집됩니다.
      </div>
    </div>
  );
}

function EmptyMessage({ message }: { message: string }) {
  return (
    <div className="text-center py-8 text-zinc-500 text-sm">{message}</div>
  );
}
