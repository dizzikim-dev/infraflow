'use client';

/**
 * Benchmark Panel Component
 *
 * Traffic tier selection, capacity estimation, bottleneck detection,
 * and sizing recommendations.
 */

import { motion } from 'framer-motion';
import { X, Gauge, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import type { InfraSpec } from '@/types';
import { useBenchmark } from '@/hooks/useBenchmark';
import { TRAFFIC_PROFILES, type TrafficTier } from '@/lib/knowledge/benchmarks';

// ============================================================
// Types
// ============================================================

interface BenchmarkPanelProps {
  spec: InfraSpec | null;
  onClose: () => void;
}

// ============================================================
// Component
// ============================================================

export function BenchmarkPanel({ spec, onClose }: BenchmarkPanelProps) {
  const { selectedTier, setTier, recommendations, capacity, bottlenecks } = useBenchmark(spec);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed top-0 right-0 h-full w-[480px] bg-zinc-900/95 backdrop-blur-sm border-l border-white/10 z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-white">성능 벤치마크</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Traffic Tier Selector */}
      <div className="p-4 border-b border-white/10">
        <label className="text-xs text-zinc-400 mb-2 block">트래픽 프로필 선택</label>
        <div className="grid grid-cols-2 gap-2">
          {TRAFFIC_PROFILES.map((profile) => (
            <button
              key={profile.tier}
              onClick={() => setTier(profile.tier)}
              className={`text-left p-2.5 rounded-lg border transition-colors ${
                selectedTier === profile.tier
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                  : 'bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-700/50'
              }`}
            >
              <div className="text-xs font-medium">{profile.nameKo}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">
                {profile.requestsPerSecond.min.toLocaleString()}–{profile.requestsPerSecond.max.toLocaleString()} RPS
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!spec && (
          <div className="text-center text-zinc-500 py-12">
            <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>다이어그램을 먼저 생성해주세요.</p>
          </div>
        )}

        {spec && capacity && (
          <>
            {/* Current Capacity Card */}
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-white/5">
              <h3 className="text-xs font-medium text-zinc-400 mb-2">현재 용량 추정</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">
                  {capacity.maxRPS > 0 ? `~${capacity.maxRPS.toLocaleString()}` : '0'}
                </span>
                <span className="text-sm text-zinc-500">RPS</span>
                <span className={`ml-auto text-xs px-2 py-1 rounded ${
                  capacity.currentTier === 'enterprise' ? 'bg-purple-500/20 text-purple-300' :
                  capacity.currentTier === 'large' ? 'bg-blue-500/20 text-blue-300' :
                  capacity.currentTier === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-zinc-700 text-zinc-300'
                }`}>
                  {capacity.currentTier}
                </span>
              </div>
              {/* Tier compatibility */}
              <div className="flex gap-1.5 mt-3">
                {(['small', 'medium', 'large', 'enterprise'] as TrafficTier[]).map((tier) => (
                  <div
                    key={tier}
                    className={`flex-1 text-center text-[10px] py-1 rounded ${
                      capacity.canHandle[tier]
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {tier}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottlenecks */}
            {bottlenecks.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-red-400 mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  병목 컴포넌트 ({bottlenecks.length}개)
                </h3>
                <div className="space-y-2">
                  {bottlenecks.map((b) => (
                    <div key={b.componentType} className="bg-red-500/5 rounded-lg p-3 border border-red-500/10">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">{b.componentType}</span>
                        <span className="text-xs text-red-400">{b.maxRPS.toLocaleString()} RPS</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">{b.reasonKo}</p>
                      <p className="text-xs text-cyan-400/80 mt-1">
                        <span className="text-zinc-500">권장:</span> {b.recommendationKo}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sizing Recommendations */}
            <div>
              <h3 className="text-xs font-medium text-zinc-300 mb-2 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                {selectedTier} 티어 사이징 추천
              </h3>
              {recommendations.length === 0 ? (
                <div className="text-center text-zinc-500 py-6">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500/50" />
                  <p className="text-xs">매칭되는 벤치마크 데이터가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recommendations.map((rec) => (
                    <div key={rec.componentType} className="bg-zinc-800/50 rounded-lg p-3 border border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">{rec.componentType}</span>
                        {rec.estimatedMonthlyCost && (
                          <span className="text-xs text-zinc-500">~${rec.estimatedMonthlyCost.toLocaleString()}/mo</span>
                        )}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className="p-2 rounded bg-cyan-500/5 border border-cyan-500/10">
                          <div className="text-[10px] text-cyan-400">추천</div>
                          <div className="text-xs text-white mt-0.5">{rec.recommended.instanceCount}x {rec.recommended.specKo}</div>
                        </div>
                        <div className="p-2 rounded bg-zinc-700/30 border border-white/5">
                          <div className="text-[10px] text-zinc-500">최소</div>
                          <div className="text-xs text-zinc-300 mt-0.5">{rec.minimum.instanceCount}x {rec.minimum.specKo}</div>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400 mt-2">{rec.scalingNotesKo}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total estimated cost */}
            {recommendations.length > 0 && (
              <div className="bg-zinc-800/50 rounded-lg p-3 border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">추정 총 월 비용 ({selectedTier} 티어)</span>
                  <span className="text-sm font-bold text-white">
                    ~${recommendations.reduce((sum, r) => sum + (r.estimatedMonthlyCost ?? 0), 0).toLocaleString()}/mo
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {spec && (
        <div className="border-t border-white/10 px-4 py-3 text-xs text-zinc-400">
          <span>벤치마크 데이터는 일반적인 클라우드 환경 기준이며 실제와 다를 수 있습니다.</span>
        </div>
      )}
    </motion.div>
  );
}
