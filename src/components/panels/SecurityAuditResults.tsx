'use client';

/**
 * Security Audit Results Component
 *
 * 보안 감사 결과 표시 (audit 탭 + compliance 탭)
 * Extracted from SecurityAuditPanel for component modularity.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  MinusCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import type {
  SecurityAuditResult,
  ComplianceReport,
  ComplianceFramework,
} from '@/lib/audit';

// ============================================================
// Constants
// ============================================================

export const STATUS_ICONS: Record<string, React.ReactNode> = {
  pass: <CheckCircle className="w-4 h-4 text-green-400" />,
  fail: <XCircle className="w-4 h-4 text-red-400" />,
  partial: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
  'not-applicable': <MinusCircle className="w-4 h-4 text-zinc-400" />,
};

export const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

// ============================================================
// Utility Functions
// ============================================================

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-500/20';
  if (score >= 60) return 'bg-yellow-500/20';
  return 'bg-red-500/20';
}

// ============================================================
// Audit Tab Types & Component
// ============================================================

export interface AuditResultsTabProps {
  auditResult: SecurityAuditResult;
}

export function AuditResultsTab({ auditResult }: AuditResultsTabProps) {
  return (
    <motion.div
      key="audit"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 space-y-4"
    >
      {/* Summary Card */}
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/20">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">감사 요약</h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">{auditResult.summary.critical}</p>
            <p className="text-xs text-zinc-400">심각</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-400">{auditResult.summary.high}</p>
            <p className="text-xs text-zinc-400">높음</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">{auditResult.summary.medium}</p>
            <p className="text-xs text-zinc-400">중간</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{auditResult.summary.low}</p>
            <p className="text-xs text-zinc-400">낮음</p>
          </div>
        </div>
      </div>

      {/* Findings */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-zinc-300">발견 사항</h3>
        {auditResult.findings.length === 0 ? (
          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20 text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-green-400 font-medium">보안 이슈가 발견되지 않았습니다</p>
          </div>
        ) : (
          auditResult.findings.map((finding, index) => (
            <div
              key={index}
              className={`rounded-lg p-3 border ${SEVERITY_COLORS[finding.severity]}`}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium uppercase">{finding.severity}</span>
                    <span className="text-xs text-zinc-400">{finding.category}</span>
                  </div>
                  <p className="text-sm font-medium">{finding.title}</p>
                  <p className="text-xs text-zinc-400 mt-1">{finding.description}</p>
                  {finding.recommendation && (
                    <p className="text-xs mt-2 text-zinc-300">
                      <span className="font-medium">권장 조치:</span> {finding.recommendation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

// ============================================================
// Compliance Tab Types & Component
// ============================================================

export interface ComplianceResultsTabProps {
  complianceReports: ComplianceReport[];
}

export function ComplianceResultsTab({ complianceReports }: ComplianceResultsTabProps) {
  const [expandedFrameworks, setExpandedFrameworks] = useState<Set<ComplianceFramework>>(new Set());

  const toggleFramework = (framework: ComplianceFramework) => {
    setExpandedFrameworks((prev) => {
      const next = new Set(prev);
      if (next.has(framework)) {
        next.delete(framework);
      } else {
        next.add(framework);
      }
      return next;
    });
  };

  return (
    <motion.div
      key="compliance"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 space-y-3"
    >
      {complianceReports.map((report) => {
        const isExpanded = expandedFrameworks.has(report.framework);
        return (
          <div
            key={report.framework}
            className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
          >
            {/* Framework Header */}
            <button
              onClick={() => toggleFramework(report.framework)}
              className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getScoreBgColor(report.score)}`}>
                <span className={`text-xl font-bold ${getScoreColor(report.score)}`}>
                  {report.score}
                </span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium">{report.frameworkName}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    {report.passed}
                  </span>
                  <span className="flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-red-400" />
                    {report.failed}
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-yellow-400" />
                    {report.partial}
                  </span>
                </div>
              </div>
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-zinc-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-zinc-400" />
              )}
            </button>

            {/* Checks */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-white/10 p-3 space-y-2">
                    {report.checks.map((check) => (
                      <div
                        key={check.id}
                        className="flex items-start gap-2 p-2 rounded-lg bg-white/5"
                      >
                        {STATUS_ICONS[check.status]}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500">{check.id}</span>
                            <span className="text-sm text-white font-medium">{check.requirement}</span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5">{check.details}</p>
                          {check.remediation && (
                            <p className="text-xs text-yellow-400 mt-1">{check.remediation}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </motion.div>
  );
}
