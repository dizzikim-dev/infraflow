'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MinusCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  Download,
  Plus,
  Minus,
  RefreshCw,
} from 'lucide-react';
import {
  runSecurityAudit,
  checkAllCompliance,
  analyzeWhatIfAdd,
  getAvailableFrameworks,
  type SecurityAuditResult,
  type ComplianceReport,
  type ComplianceFramework,
  type WhatIfResult,
} from '@/lib/audit';
import type { InfraSpec, InfraNodeType } from '@/types';

interface SecurityAuditPanelProps {
  spec: InfraSpec;
  onClose: () => void;
}

type TabType = 'audit' | 'compliance' | 'whatif';

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pass: <CheckCircle className="w-4 h-4 text-green-400" />,
  fail: <XCircle className="w-4 h-4 text-red-400" />,
  partial: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
  'not-applicable': <MinusCircle className="w-4 h-4 text-gray-400" />,
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const WHAT_IF_NODE_TYPES: Array<{ type: InfraNodeType; label: string; category: string }> = [
  { type: 'firewall', label: '방화벽', category: 'security' },
  { type: 'waf', label: 'WAF', category: 'security' },
  { type: 'ids-ips', label: 'IDS/IPS', category: 'security' },
  { type: 'nac', label: 'NAC', category: 'security' },
  { type: 'dlp', label: 'DLP', category: 'security' },
  { type: 'mfa', label: 'MFA', category: 'auth' },
  { type: 'sso', label: 'SSO', category: 'auth' },
  { type: 'ldap-ad', label: 'LDAP/AD', category: 'auth' },
  { type: 'iam', label: 'IAM', category: 'auth' },
  { type: 'load-balancer', label: '로드밸런서', category: 'availability' },
  { type: 'backup', label: '백업', category: 'availability' },
  { type: 'cdn', label: 'CDN', category: 'availability' },
];

export function SecurityAuditPanel({ spec, onClose }: SecurityAuditPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('audit');
  const [expandedFrameworks, setExpandedFrameworks] = useState<Set<ComplianceFramework>>(new Set());
  const [selectedWhatIfNode, setSelectedWhatIfNode] = useState<InfraNodeType | null>(null);

  // Run security audit
  const auditResult = useMemo(() => runSecurityAudit(spec), [spec]);

  // Run all compliance checks
  const complianceReports = useMemo(() => checkAllCompliance(spec), [spec]);

  // What-if analysis
  const whatIfResult = useMemo<WhatIfResult | null>(() => {
    if (!selectedWhatIfNode) return null;
    return analyzeWhatIfAdd(spec, selectedWhatIfNode);
  }, [spec, selectedWhatIfNode]);

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20';
    if (score >= 60) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed top-0 right-0 h-full w-[500px] bg-zinc-900/95 backdrop-blur-sm border-l border-white/10 z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">보안 감사</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'audit'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            보안 감사
          </div>
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'compliance'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" />
            규정 준수
          </div>
        </button>
        <button
          onClick={() => setActiveTab('whatif')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'whatif'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" />
            What-If
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Security Audit Tab */}
          {activeTab === 'audit' && (
            <motion.div
              key="audit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 space-y-4"
            >
              {/* Summary Card */}
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/20">
                <h3 className="text-sm font-medium text-gray-300 mb-3">감사 요약</h3>
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-400">{auditResult.summary.critical}</p>
                    <p className="text-xs text-gray-400">심각</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-400">{auditResult.summary.high}</p>
                    <p className="text-xs text-gray-400">높음</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">{auditResult.summary.medium}</p>
                    <p className="text-xs text-gray-400">중간</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">{auditResult.summary.low}</p>
                    <p className="text-xs text-gray-400">낮음</p>
                  </div>
                </div>
              </div>

              {/* Findings */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-300">발견 사항</h3>
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
                            <span className="text-xs text-gray-400">{finding.category}</span>
                          </div>
                          <p className="text-sm font-medium">{finding.title}</p>
                          <p className="text-xs text-gray-400 mt-1">{finding.description}</p>
                          {finding.recommendation && (
                            <p className="text-xs mt-2 text-gray-300">
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
          )}

          {/* Compliance Tab */}
          {activeTab === 'compliance' && (
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
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
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
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
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
                                    <span className="text-xs text-gray-500">{check.id}</span>
                                    <span className="text-sm text-white font-medium">{check.requirement}</span>
                                  </div>
                                  <p className="text-xs text-gray-400 mt-0.5">{check.details}</p>
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
          )}

          {/* What-If Tab */}
          {activeTab === 'whatif' && (
            <motion.div
              key="whatif"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 space-y-4"
            >
              {/* Node Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">구성요소 추가 시뮬레이션</h3>
                <div className="grid grid-cols-3 gap-2">
                  {WHAT_IF_NODE_TYPES.map(({ type, label }) => (
                    <button
                      key={type}
                      onClick={() => setSelectedWhatIfNode(type)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        selectedWhatIfNode === type
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <Plus className="w-3 h-3 inline mr-1" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Analysis Result */}
              {whatIfResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Risk Delta */}
                  <div className={`rounded-xl p-4 border ${
                    whatIfResult.riskDelta >= 0
                      ? 'bg-green-500/10 border-green-500/20'
                      : 'bg-red-500/10 border-red-500/20'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        whatIfResult.riskDelta >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        <span className={`text-xl font-bold ${
                          whatIfResult.riskDelta >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {whatIfResult.riskDelta >= 0 ? '+' : ''}{whatIfResult.riskDelta}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">보안 점수 변화</p>
                        <p className="text-xs text-gray-400">{whatIfResult.change.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Impacts */}
                  {whatIfResult.impacts.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">영향 분석</h4>
                      <div className="space-y-2">
                        {whatIfResult.impacts.map((impact, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border ${
                              impact.severity === 'high'
                                ? 'bg-orange-500/10 border-orange-500/20'
                                : impact.severity === 'medium'
                                ? 'bg-yellow-500/10 border-yellow-500/20'
                                : 'bg-blue-500/10 border-blue-500/20'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-medium capitalize ${
                                impact.severity === 'high'
                                  ? 'text-orange-400'
                                  : impact.severity === 'medium'
                                  ? 'text-yellow-400'
                                  : 'text-blue-400'
                              }`}>
                                {impact.category}
                              </span>
                              <span className="text-xs text-gray-500">• {impact.severity}</span>
                            </div>
                            <p className="text-sm text-white">{impact.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {whatIfResult.recommendations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">권장 사항</h4>
                      <ul className="space-y-1">
                        {whatIfResult.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-400">
                            <span className="text-blue-400">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}

              {!whatIfResult && (
                <div className="text-center py-8 text-gray-500">
                  <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>구성요소를 선택하여 추가 시</p>
                  <p>보안 영향을 분석합니다</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-gray-500 text-center">
          마지막 분석: {new Date().toLocaleString('ko-KR')}
        </p>
      </div>
    </motion.div>
  );
}
