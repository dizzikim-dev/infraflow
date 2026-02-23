'use client';

/**
 * HealthCheck Panel Component
 *
 * Analyzes the current diagram against the knowledge graph in real-time.
 * Three tabs: Anti-patterns, Dependencies, Failure Risks.
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, ShieldAlert, Link2, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { InfraSpec, InfraNodeType } from '@/types';
import {
  getMandatoryDependencies,
  getRecommendations,
  getFailuresForComponent,
} from '@/lib/knowledge';
import type { FailureScenario, ComponentRelationship } from '@/lib/knowledge';
import { useCalibration } from '@/hooks/useCalibration';
import type { CalibratedAntiPattern } from '@/lib/learning/types';

// ============================================================
// Types
// ============================================================

interface HealthCheckPanelProps {
  spec: InfraSpec | null;
  onClose: () => void;
}

type TabType = 'antipatterns' | 'dependencies' | 'failures';

interface MissingDependency {
  sourceType: InfraNodeType;
  relationship: ComponentRelationship;
  kind: 'mandatory' | 'recommended';
}

// ============================================================
// Component
// ============================================================

export function HealthCheckPanel({ spec, onClose }: HealthCheckPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('antipatterns');
  const [calibratedViolations, setCalibratedViolations] = useState<CalibratedAntiPattern[]>([]);
  const [fpRate, setFpRate] = useState<number | null>(null);
  const calibration = useCalibration();

  // Anti-pattern detection with calibration
  useEffect(() => {
    if (!spec) {
      setCalibratedViolations([]); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    calibration.getCalibratedAntiPatterns(spec).then((results) => {
      setCalibratedViolations(results);
      // Record shown for each detected anti-pattern
      for (const ap of results) {
        calibration.recordShown(ap.id);
      }
    });
    calibration.getFalsePositiveRate().then(setFpRate);
  }, [spec]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleIgnore = useCallback((apId: string) => {
    calibration.recordIgnored(apId);
    setCalibratedViolations((prev) => prev.filter((v) => v.id !== apId));
  }, [calibration]);

  const handleFixed = useCallback((apId: string) => {
    calibration.recordFixed(apId);
    setCalibratedViolations((prev) => prev.filter((v) => v.id !== apId));
  }, [calibration]);

  // Use calibrated violations
  const violations = calibratedViolations;

  // Dependency analysis
  const missingDeps = useMemo<MissingDependency[]>(() => {
    if (!spec) return [];
    const allTypes = new Set(spec.nodes.map((n) => n.type));
    const deps: MissingDependency[] = [];
    const seen = new Set<string>();

    for (const nodeType of allTypes) {
      for (const rel of getMandatoryDependencies(nodeType)) {
        if (!allTypes.has(rel.target)) {
          const key = `${rel.source}-${rel.target}`;
          if (!seen.has(key)) {
            seen.add(key);
            deps.push({ sourceType: nodeType, relationship: rel, kind: 'mandatory' });
          }
        }
      }
      for (const rel of getRecommendations(nodeType)) {
        if (!allTypes.has(rel.target)) {
          const key = `${rel.source}-${rel.target}`;
          if (!seen.has(key)) {
            seen.add(key);
            deps.push({ sourceType: nodeType, relationship: rel, kind: 'recommended' });
          }
        }
      }
    }

    // Sort mandatory first
    return deps.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'mandatory' ? -1 : 1;
      return 0;
    });
  }, [spec]);

  // Failure risk analysis
  const risks = useMemo<FailureScenario[]>(() => {
    if (!spec) return [];
    const allTypes = new Set(spec.nodes.map((n) => n.type));
    const scenarios: FailureScenario[] = [];
    const seen = new Set<string>();

    for (const nodeType of allTypes) {
      for (const failure of getFailuresForComponent(nodeType)) {
        if (!seen.has(failure.id)) {
          seen.add(failure.id);
          scenarios.push(failure);
        }
      }
    }

    // Sort by impact severity
    const impactOrder: Record<string, number> = {
      'service-down': 0,
      'data-loss': 1,
      'security-breach': 2,
      'degraded': 3,
    };
    return scenarios.sort((a, b) => (impactOrder[a.impact] ?? 9) - (impactOrder[b.impact] ?? 9)).slice(0, 10);
  }, [spec]);

  // Count stats
  const criticalCount = violations.filter((v) => v.calibratedSeverity === 'critical').length;
  const highCount = violations.filter((v) => v.calibratedSeverity === 'high').length;
  const mandatoryCount = missingDeps.filter((d) => d.kind === 'mandatory').length;

  const tabs: { key: TabType; label: string; count: number; Icon: typeof ShieldAlert }[] = [
    { key: 'antipatterns', label: '안티패턴', count: violations.length, Icon: ShieldAlert },
    { key: 'dependencies', label: '의존성', count: missingDeps.length, Icon: Link2 },
    { key: 'failures', label: '장애 위험', count: risks.length, Icon: Zap },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed top-[4.5rem] right-0 h-[calc(100vh-4.5rem)] w-[480px] bg-zinc-900/95 backdrop-blur-sm border-l border-white/10 z-40 flex flex-col rounded-tl-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-white">아키텍처 진단</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {tabs.map(({ key, label, count, Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
              activeTab === key
                ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-500/10'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === key ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-zinc-400'
                }`}>
                  {count}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!spec && (
          <div className="text-center text-zinc-500 py-12">
            <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>다이어그램을 먼저 생성해주세요.</p>
          </div>
        )}

        {spec && activeTab === 'antipatterns' && (
          <>
            {violations.length === 0 ? (
              <div className="text-center text-zinc-500 py-12">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-500/50" />
                <p>안티패턴이 감지되지 않았습니다.</p>
              </div>
            ) : (
              violations.map((v) => {
                const sev = v.calibratedSeverity;
                return (
                  <div key={v.id} className="bg-zinc-800/50 rounded-lg p-3 border border-white/5">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5">
                        {sev === 'critical' ? '🔴' : sev === 'high' ? '🟠' : '🟡'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                            sev === 'critical' ? 'bg-red-500/20 text-red-300' :
                            sev === 'high' ? 'bg-orange-500/20 text-orange-300' :
                            'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {sev.toUpperCase()}
                          </span>
                          <span className="text-sm font-medium text-white truncate">{v.nameKo}</span>
                          {v.wasCalibrated && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              원래: {v.originalSeverity.toUpperCase()} → 조정됨 (무시율 {Math.round(v.ignoreRate * 100)}%)
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => handleIgnore(v.id)}
                            className="text-[11px] px-2 py-1 rounded bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
                            data-testid={`ignore-${v.id}`}
                          >
                            무시
                          </button>
                          <button
                            onClick={() => handleFixed(v.id)}
                            className="text-[11px] px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            data-testid={`fix-${v.id}`}
                          >
                            수정 완료
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {spec && activeTab === 'dependencies' && (
          <>
            {missingDeps.length === 0 ? (
              <div className="text-center text-zinc-500 py-12">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-500/50" />
                <p>모든 의존성이 충족되었습니다.</p>
              </div>
            ) : (
              missingDeps.map((dep, i) => (
                <div key={`${dep.relationship.id}-${i}`} className="bg-zinc-800/50 rounded-lg p-3 border border-white/5">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5">{dep.kind === 'mandatory' ? '🔴' : '🟡'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                          dep.kind === 'mandatory' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {dep.kind === 'mandatory' ? '필수' : '권장'}
                        </span>
                        <span className="text-sm text-white">
                          <span className="text-zinc-400">{dep.relationship.source}</span>
                          {' → '}
                          <span className="text-amber-300">{dep.relationship.target}</span>
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1.5">{dep.relationship.reasonKo}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {spec && activeTab === 'failures' && (
          <>
            {risks.length === 0 ? (
              <div className="text-center text-zinc-500 py-12">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-500/50" />
                <p>장애 시나리오가 없습니다.</p>
              </div>
            ) : (
              risks.map((risk) => {
                const impactIcon =
                  risk.impact === 'service-down' ? '🔴' :
                  risk.impact === 'data-loss' ? '🟣' :
                  risk.impact === 'security-breach' ? '🔶' : '🟡';
                const impactLabel =
                  risk.impact === 'service-down' ? '서비스 중단' :
                  risk.impact === 'data-loss' ? '데이터 손실' :
                  risk.impact === 'security-breach' ? '보안 침해' : '성능 저하';
                return (
                  <div key={risk.id} className="bg-zinc-800/50 rounded-lg p-3 border border-white/5">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5">{impactIcon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-300">
                            {impactLabel}
                          </span>
                          <span className="text-sm font-medium text-white">{risk.titleKo}</span>
                          <span className="text-xs text-zinc-500 ml-auto">MTTR: {risk.estimatedMTTR}</span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1.5">{risk.scenarioKo}</p>
                        {risk.preventionKo.length > 0 && (
                          <p className="text-xs text-blue-400/80 mt-1">
                            <span className="text-zinc-500">예방:</span> {risk.preventionKo[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>

      {/* Footer summary */}
      {spec && (
        <div className="border-t border-white/10 px-4 py-3 text-xs text-zinc-400">
          <div className="flex items-center justify-between">
            <span>
              진단 결과: {violations.length}개 위반
              {criticalCount > 0 && <span className="text-red-400 ml-1">(Critical: {criticalCount})</span>}
              {highCount > 0 && <span className="text-orange-400 ml-1">(High: {highCount})</span>}
            </span>
            {mandatoryCount > 0 && (
              <span className="text-red-400">필수 누락: {mandatoryCount}</span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
