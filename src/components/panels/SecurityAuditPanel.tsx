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
import { AnimatePresence } from 'framer-motion';
import { Shield, FileText, RefreshCw } from 'lucide-react';
import { runSecurityAudit, checkAllCompliance } from '@/lib/audit';
import type { InfraSpec } from '@/types';
import { AuditResultsTab, ComplianceResultsTab } from './SecurityAuditResults';
import { WhatIfSimulator } from './WhatIfSimulator';
import { PanelContainer } from './PanelContainer';
import { PanelHeader } from './PanelHeader';
import { PanelTabs } from './PanelTabs';

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

  const tabs: { key: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'audit', label: '보안 감사', icon: Shield },
    { key: 'compliance', label: '규정 준수', icon: FileText },
    { key: 'whatif', label: 'What-If', icon: RefreshCw },
  ];

  return (
    <PanelContainer widthClass="w-[500px]">
      <PanelHeader icon={Shield} iconColor="text-blue-400" title="보안 감사" onClose={onClose} />

      {/* Tabs */}
      <PanelTabs
        tabs={tabs}
        active={activeTab}
        onChange={setActiveTab}
      />

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
    </PanelContainer>
  );
}
