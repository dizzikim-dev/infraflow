'use client';

/**
 * What-If Simulator Component
 *
 * What-If 탭 콘텐츠: 구성요소 추가 시뮬레이션
 * Extracted from SecurityAuditPanel for component modularity.
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, RefreshCw } from 'lucide-react';
import { analyzeWhatIfAdd, type WhatIfResult } from '@/lib/audit';
import type { InfraSpec, InfraNodeType } from '@/types';

// ============================================================
// Constants
// ============================================================

export const WHAT_IF_NODE_TYPES: Array<{ type: InfraNodeType; label: string; category: string }> = [
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

// ============================================================
// Types
// ============================================================

export interface WhatIfSimulatorProps {
  spec: InfraSpec;
}

// ============================================================
// Component
// ============================================================

export function WhatIfSimulator({ spec }: WhatIfSimulatorProps) {
  const [selectedWhatIfNode, setSelectedWhatIfNode] = useState<InfraNodeType | null>(null);

  const whatIfResult = useMemo<WhatIfResult | null>(() => {
    if (!selectedWhatIfNode) return null;
    return analyzeWhatIfAdd(spec, selectedWhatIfNode);
  }, [spec, selectedWhatIfNode]);

  return (
    <motion.div
      key="whatif"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 space-y-4"
    >
      {/* Node Selection */}
      <div>
        <h3 className="text-sm font-medium text-zinc-300 mb-3">구성요소 추가 시뮬레이션</h3>
        <div className="grid grid-cols-3 gap-2">
          {WHAT_IF_NODE_TYPES.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => setSelectedWhatIfNode(type)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                selectedWhatIfNode === type
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10 border border-transparent'
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
                <p className="text-xs text-zinc-400">{whatIfResult.change.description}</p>
              </div>
            </div>
          </div>

          {/* Impacts */}
          {whatIfResult.impacts.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-zinc-300 mb-2">영향 분석</h4>
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
                      <span className="text-xs text-zinc-500">• {impact.severity}</span>
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
              <h4 className="text-sm font-medium text-zinc-300 mb-2">권장 사항</h4>
              <ul className="space-y-1">
                {whatIfResult.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-zinc-400">
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
        <div className="text-center py-8 text-zinc-500">
          <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>구성요소를 선택하여 추가 시</p>
          <p>보안 영향을 분석합니다</p>
        </div>
      )}
    </motion.div>
  );
}
