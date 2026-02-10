'use client';

/**
 * Industry Compliance Panel Component
 *
 * Industry preset selector with gap analysis and score visualization.
 */

import { motion } from 'framer-motion';
import { X, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { InfraSpec } from '@/types';
import { useIndustryCompliance } from '@/hooks/useIndustryCompliance';
import { getAllIndustryPresets, type IndustryType, type ComplianceGap } from '@/lib/audit/industryCompliance';

// ============================================================
// Types
// ============================================================

interface IndustryCompliancePanelProps {
  spec: InfraSpec | null;
  onClose: () => void;
}

// ============================================================
// Component
// ============================================================

export function IndustryCompliancePanel({ spec, onClose }: IndustryCompliancePanelProps) {
  const { report, selectedIndustry, setIndustry } = useIndustryCompliance(spec);
  const presets = getAllIndustryPresets();

  const scoreColor = report
    ? report.overallScore >= 80 ? 'text-green-400' :
      report.overallScore >= 60 ? 'text-yellow-400' :
      report.overallScore >= 40 ? 'text-orange-400' : 'text-red-400'
    : 'text-zinc-500';

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
          <Shield className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">산업별 컴플라이언스</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Industry Selector */}
      <div className="p-4 border-b border-white/10">
        <label className="text-xs text-zinc-400 mb-2 block">산업 분류 선택</label>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => setIndustry(p.id as IndustryType)}
              className={`text-xs px-2.5 py-1.5 rounded transition-colors ${
                selectedIndustry === p.id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-zinc-800 text-zinc-400 border border-white/5 hover:bg-zinc-700'
              }`}
            >
              {p.nameKo}
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

        {spec && report && (
          <>
            {/* Overall Score */}
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-white/5 text-center">
              <div className={`text-4xl font-bold ${scoreColor}`}>
                {report.overallScore}
                <span className="text-lg text-zinc-500">/100</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {report.preset.nameKo} 컴플라이언스 점수
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                프레임워크: {report.preset.requiredFrameworks.join(', ').toUpperCase()}
              </p>
            </div>

            {/* Missing Required */}
            {report.missingRequired.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-red-400 mb-2">
                  필수 누락 컴포넌트 ({report.missingRequired.length}개)
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {report.missingRequired.map((comp) => (
                    <span key={comp} className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-300 border border-red-500/20">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Recommended */}
            {report.missingRecommended.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-yellow-400 mb-2">
                  권장 컴포넌트 ({report.missingRecommended.length}개)
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {report.missingRecommended.map((comp) => (
                    <span key={comp} className="text-xs px-2 py-1 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Compliance Gaps */}
            <div>
              <h3 className="text-xs font-medium text-zinc-300 mb-2">
                컴플라이언스 갭 분석 ({report.gaps.length}개)
              </h3>
              {report.gaps.length === 0 ? (
                <div className="text-center text-zinc-500 py-6">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500/50" />
                  <p className="text-xs">모든 요구사항이 충족되었습니다.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {report.gaps.map((gap, i) => (
                    <GapCard key={`gap-${i}`} gap={gap} />
                  ))}
                </div>
              )}
            </div>

            {/* Framework Reports */}
            {report.complianceReports.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-zinc-300 mb-2">프레임워크별 점수</h3>
                <div className="space-y-2">
                  {report.complianceReports.map(({ framework, report: fwReport }) => {
                    const fwScoreColor =
                      fwReport.score >= 80 ? 'text-green-400' :
                      fwReport.score >= 60 ? 'text-yellow-400' :
                      fwReport.score >= 40 ? 'text-orange-400' : 'text-red-400';
                    return (
                      <div key={framework} className="bg-zinc-800/50 rounded-lg p-3 border border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white font-medium">{framework.toUpperCase()}</span>
                          <span className={`text-sm font-bold ${fwScoreColor}`}>{fwReport.score}점</span>
                        </div>
                        <div className="mt-1.5 w-full bg-zinc-700 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              fwReport.score >= 80 ? 'bg-green-500' :
                              fwReport.score >= 60 ? 'bg-yellow-500' :
                              fwReport.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${fwReport.score}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-[10px] text-zinc-500">
                          <span>통과: {fwReport.passed}/{fwReport.totalChecks}</span>
                          <span>실패: {fwReport.failed}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {spec && report && (
        <div className="border-t border-white/10 px-4 py-3 text-xs text-zinc-400">
          <span>
            보안 수준: {report.preset.minimumSecurityLevel} |
            필수 프레임워크: {report.preset.requiredFrameworks.length}개
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function GapCard({ gap }: { gap: ComplianceGap }) {
  const priorityConfig: Record<string, { icon: string; badgeClass: string }> = {
    critical: { icon: '🔴', badgeClass: 'bg-red-500/20 text-red-300' },
    high: { icon: '🟠', badgeClass: 'bg-orange-500/20 text-orange-300' },
    medium: { icon: '🟡', badgeClass: 'bg-yellow-500/20 text-yellow-300' },
    low: { icon: '🟢', badgeClass: 'bg-green-500/20 text-green-300' },
  };
  const config = priorityConfig[gap.priority] ?? priorityConfig.medium;

  return (
    <div className="bg-zinc-800/50 rounded-lg p-3 border border-white/5">
      <div className="flex items-start gap-2">
        <span className="mt-0.5">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${config.badgeClass}`}>
              {gap.priority.toUpperCase()}
            </span>
            <span className="text-xs text-zinc-500">{gap.frameworkKo}</span>
            <span className="text-xs text-zinc-500 ml-auto">{gap.estimatedEffortKo}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {gap.missingComponents.map((comp) => (
              <span key={comp} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700/50 text-zinc-300">
                {comp}
              </span>
            ))}
          </div>
          <p className="text-xs text-zinc-400 mt-1.5">{gap.remediationKo}</p>
        </div>
      </div>
    </div>
  );
}
