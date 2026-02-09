'use client';

/**
 * Security Audit Panel Component
 *
 * 보안 감사 패널 오케스트레이터
 * - 보안 감사 탭
 * - 규정 준수 탭
 * - What-If 시뮬레이션 탭
 *
 * Sub-components:
 * - AuditResultsTab: 감사 결과 표시 (SecurityAuditResults.tsx)
 * - ComplianceResultsTab: 규정 준수 표시 (SecurityAuditResults.tsx)
 * - WhatIfSimulator: What-If 시뮬레이션 (WhatIfSimulator.tsx)
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, FileText, RefreshCw } from 'lucide-react';
import { runSecurityAudit, checkAllCompliance } from '@/lib/audit';
import type { InfraSpec } from '@/types';
import { AuditResultsTab, ComplianceResultsTab } from './SecurityAuditResults';
import { WhatIfSimulator } from './WhatIfSimulator';

// ============================================================
// Types
// ============================================================

interface SecurityAuditPanelProps {
  spec: InfraSpec;
  onClose: () => void;
}

type TabType = 'audit' | 'compliance' | 'whatif';

// ============================================================
// Component
// ============================================================

export function SecurityAuditPanel({ spec, onClose }: SecurityAuditPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('audit');

  // Run security audit
  const auditResult = useMemo(() => runSecurityAudit(spec), [spec]);

  // Run all compliance checks
  const complianceReports = useMemo(() => checkAllCompliance(spec), [spec]);

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
          className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
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
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
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
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
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
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
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
          {activeTab === 'audit' && <AuditResultsTab auditResult={auditResult} />}
          {activeTab === 'compliance' && <ComplianceResultsTab complianceReports={complianceReports} />}
          {activeTab === 'whatif' && <WhatIfSimulator spec={spec} />}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-zinc-500 text-center">
          마지막 분석: {new Date().toLocaleString('ko-KR')}
        </p>
      </div>
    </motion.div>
  );
}
