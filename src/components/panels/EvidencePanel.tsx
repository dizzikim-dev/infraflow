'use client';

/**
 * Evidence Panel Component
 *
 * Shows "why this configuration" for a selected node — relationships,
 * recommendation reasoning, validation results, and source citations.
 * Four tabs: Relationships, Recommendations, Validation, Sources.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  FileCheck2,
  Link2,
  Package,
  ShieldAlert,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import type { InfraNodeType, InfraSpec } from '@/types';
import { useEvidence } from '@/hooks/useEvidence';
import type { EvidenceData, VendorGroup } from '@/hooks/useEvidence';
import type { TraceSummary } from '@/lib/rag/types';

// ============================================================
// Types
// ============================================================

interface EvidencePanelProps {
  nodeId: string | null;
  nodeType: InfraNodeType | null;
  nodeLabel: string | null;
  spec: InfraSpec | null;
  onClose: () => void;
  /** Trace summary from the LLM pipeline (optional) */
  traceSummary?: TraceSummary | null;
  /** Trace ID for linking to admin detail page */
  traceId?: string | null;
  /** Post-verification result (Phase 2) */
  verification?: {
    score: number;
    missingRequired: number;
    missingRecommended: number;
    conflicts: number;
  } | null;
}

type TabType = 'relationships' | 'recommendations' | 'validation' | 'sources' | 'trace';

// ============================================================
// Constants
// ============================================================

const RELATIONSHIP_TYPE_LABELS: Record<string, { en: string; ko: string; icon: string }> = {
  requires: { en: 'Requires', ko: '필수', icon: '🔴' },
  recommends: { en: 'Recommends', ko: '권장', icon: '🟡' },
  conflicts: { en: 'Conflicts', ko: '충돌', icon: '⚠️' },
  enhances: { en: 'Enhances', ko: '강화', icon: '🟢' },
  protects: { en: 'Protects', ko: '보호', icon: '🛡️' },
};

const SOURCE_TYPE_LABELS: Record<string, { en: string; ko: string }> = {
  rfc: { en: 'IETF RFC', ko: 'IETF RFC' },
  nist: { en: 'NIST', ko: 'NIST' },
  cis: { en: 'CIS', ko: 'CIS' },
  owasp: { en: 'OWASP', ko: 'OWASP' },
  vendor: { en: 'Vendor', ko: '벤더' },
  academic: { en: 'Academic', ko: '학술' },
  industry: { en: 'Industry', ko: '산업' },
  user_verified: { en: 'Verified', ko: '검증됨' },
  user_unverified: { en: 'Unverified', ko: '미검증' },
};

// ============================================================
// Component
// ============================================================

export function EvidencePanel({
  nodeId,
  nodeType,
  nodeLabel,
  spec,
  onClose,
  traceSummary,
  traceId,
  verification,
}: EvidencePanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('relationships');
  const evidence = useEvidence(nodeId, nodeType, spec);

  const tabs: { key: TabType; label: string; count: number; Icon: typeof Link2; badge?: string }[] = [
    { key: 'relationships', label: '연결 관계', count: evidence?.counts.relationships ?? 0, Icon: Link2 },
    { key: 'recommendations', label: '제품 추천', count: evidence?.counts.recommendations ?? 0, Icon: Package },
    { key: 'validation', label: '검증', count: evidence?.counts.validationIssues ?? 0, Icon: ShieldAlert },
    { key: 'sources', label: '근거', count: evidence?.counts.sources ?? 0, Icon: BookOpen },
  ];

  // Add trace tab when traceSummary is available
  if (traceSummary) {
    const hasWarning = verification && (verification.score < 70 || verification.missingRequired > 0 || verification.conflicts > 0);
    tabs.push({
      key: 'trace',
      label: '추론',
      count: traceSummary.ragDocumentsUsed,
      Icon: FileCheck2,
      badge: hasWarning ? '!' : undefined,
    });
  }

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
          <FileCheck2 className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-lg font-semibold text-white">Evidence</h2>
            {nodeLabel && (
              <p className="text-xs text-zinc-400">{nodeLabel} ({nodeType})</p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {tabs.map(({ key, label, count, Icon, badge }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
              activeTab === key
                ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/10'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {badge && (
                <span className="text-[10px] px-1 py-0.5 rounded-full bg-red-500 text-white font-bold leading-none">
                  {badge}
                </span>
              )}
              {count > 0 && !badge && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === key ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-zinc-400'
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
        {!evidence && (
          <div className="text-center text-zinc-500 py-12">
            <FileCheck2 className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>노드를 선택하면 근거 정보가 표시됩니다.</p>
            <p className="text-xs mt-1">Select a node to view evidence.</p>
          </div>
        )}

        {evidence && activeTab === 'relationships' && (
          <RelationshipsTab evidence={evidence} nodeType={nodeType!} />
        )}

        {evidence && activeTab === 'recommendations' && (
          <RecommendationsTab evidence={evidence} />
        )}

        {evidence && activeTab === 'validation' && (
          <ValidationTab evidence={evidence} />
        )}

        {evidence && activeTab === 'sources' && (
          <SourcesTab evidence={evidence} />
        )}

        {activeTab === 'trace' && traceSummary && (
          <TraceTab traceSummary={traceSummary} traceId={traceId} verification={verification} />
        )}
      </div>

      {/* Footer summary */}
      {evidence && (
        <div className="border-t border-white/10 px-4 py-3 text-xs text-zinc-400">
          <div className="flex items-center justify-between">
            <span>
              {evidence.counts.relationships} relationships, {evidence.counts.recommendations} products ({evidence.counts.vendors} vendors)
            </span>
            {evidence.counts.validationIssues > 0 && (
              <span className="text-amber-400">
                {evidence.counts.validationIssues} issues
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ============================================================
// Tab: Relationships
// ============================================================

function RelationshipsTab({ evidence, nodeType }: { evidence: EvidenceData; nodeType: InfraNodeType }) {
  const allRels = [...evidence.relationships, ...evidence.suggestions];

  if (allRels.length === 0) {
    return (
      <div className="text-center text-zinc-500 py-12">
        <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-500/50" />
        <p>이 노드에 연결된 관계가 없습니다.</p>
        <p className="text-xs mt-1">No relationships found for this node.</p>
      </div>
    );
  }

  return (
    <>
      {allRels.map((rel) => {
        const typeInfo = RELATIONSHIP_TYPE_LABELS[rel.relationshipType] ?? {
          en: rel.relationshipType,
          ko: rel.relationshipType,
          icon: '🔗',
        };
        const isSource = rel.source === nodeType;
        const otherType = isSource ? rel.target : rel.source;
        const confidence = Math.round(rel.trust.confidence * 100);

        return (
          <div key={rel.id} className="bg-zinc-800/50 rounded-lg p-3 border border-white/5">
            <div className="flex items-start gap-2">
              <span className="mt-0.5">{typeInfo.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {typeInfo.ko}
                  </span>
                  <span className="text-sm text-white flex items-center gap-1">
                    <span className="text-zinc-400">{rel.source}</span>
                    <ArrowRight className="w-3 h-3 text-zinc-500" />
                    <span className={otherType === nodeType ? 'text-zinc-400' : 'text-emerald-300'}>
                      {rel.target}
                    </span>
                  </span>
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-500">
                    {confidence}%
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1.5">{rel.reasonKo}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{rel.reason}</p>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

// ============================================================
// Tab: Recommendations
// ============================================================

type RecViewMode = 'byScore' | 'byVendor';

function RecommendationsTab({ evidence }: { evidence: EvidenceData }) {
  const [viewMode, setViewMode] = useState<RecViewMode>('byScore');

  if (evidence.recommendations.length === 0) {
    return (
      <div className="text-center text-zinc-500 py-12">
        <Package className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p>이 노드에 추천 제품이 없습니다.</p>
        <p className="text-xs mt-1">No product recommendations for this node.</p>
      </div>
    );
  }

  return (
    <>
      {/* View mode toggle */}
      <div className="flex items-center gap-1 mb-3 bg-zinc-800/50 rounded-lg p-1">
        <button
          onClick={() => setViewMode('byScore')}
          className={`flex-1 text-xs py-1.5 px-2 rounded-md transition-colors ${
            viewMode === 'byScore'
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          점수순 / By Score
        </button>
        <button
          onClick={() => setViewMode('byVendor')}
          className={`flex-1 text-xs py-1.5 px-2 rounded-md transition-colors ${
            viewMode === 'byVendor'
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          벤더별 비교 / By Vendor
        </button>
      </div>

      {viewMode === 'byScore' && (
        <ByScoreView recommendations={evidence.recommendations} />
      )}

      {viewMode === 'byVendor' && (
        <ByVendorView vendorGrouped={evidence.vendorGrouped} />
      )}
    </>
  );
}

function ByScoreView({ recommendations }: { recommendations: EvidenceData['recommendations'] }) {
  return (
    <>
      {recommendations.slice(0, 5).map((rec) => (
        <ProductCard key={rec.product.nodeId} rec={rec} />
      ))}
    </>
  );
}

function ByVendorView({ vendorGrouped }: { vendorGrouped: VendorGroup[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (vendorId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(vendorId)) next.delete(vendorId);
      else next.add(vendorId);
      return next;
    });
  };

  return (
    <>
      {vendorGrouped.map((group) => {
        const isExpanded = expanded.has(group.vendorId);
        const hasAlts = group.alternatives.length > 0;

        return (
          <div key={group.vendorId} className="space-y-2">
            {/* Vendor header */}
            <button
              onClick={() => hasAlts && toggleExpand(group.vendorId)}
              className="w-full flex items-center gap-2 text-left"
            >
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {group.vendorName}
              </span>
              <span className="text-[10px] text-zinc-500">
                Best: {group.best.score.overall}점
              </span>
              {hasAlts && (
                <span className="text-[10px] text-zinc-500 ml-auto flex items-center gap-0.5">
                  +{group.alternatives.length}
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </span>
              )}
            </button>

            {/* Best product */}
            <ProductCard rec={group.best} />

            {/* Expandable alternatives */}
            {isExpanded && group.alternatives.map((alt) => (
              <div key={alt.product.nodeId} className="ml-3 border-l-2 border-zinc-700 pl-2">
                <ProductCard rec={alt} compact />
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
}

function ProductCard({ rec, compact }: { rec: EvidenceData['recommendations'][0]; compact?: boolean }) {
  const { breakdown } = rec.score;
  const maxScore = { type: 40, role: 25, useCase: 20, ha: 15 };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-3 border border-white/5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">
            {rec.product.name}
          </div>
          <div className="text-xs text-zinc-400 truncate">
            {rec.product.nameKo}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">
            {rec.vendorName} &middot; {rec.path.join(' > ')}
          </div>
        </div>
        <span className="text-sm font-bold text-emerald-400 ml-2">
          {rec.score.overall}
        </span>
      </div>

      {!compact && (
        <>
          {/* Score breakdown bars */}
          <div className="mt-2 space-y-1">
            <ScoreBar label="Type" value={breakdown.typeMatch} max={maxScore.type} />
            <ScoreBar label="Role" value={breakdown.architectureRoleFit} max={maxScore.role} />
            <ScoreBar label="Use Case" value={breakdown.useCaseOverlap} max={maxScore.useCase} />
            <ScoreBar label="HA" value={breakdown.haFeatureMatch} max={maxScore.ha} />
          </div>

          <p className="text-xs text-zinc-400 mt-2">{rec.reasonKo}</p>
        </>
      )}
    </div>
  );
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="w-12 text-zinc-500 text-right">{label}</span>
      <div className="flex-1 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-zinc-500">{value}/{max}</span>
    </div>
  );
}

// ============================================================
// Tab: Validation
// ============================================================

function ValidationTab({ evidence }: { evidence: EvidenceData }) {
  const hasIssues =
    evidence.violations.length > 0 ||
    evidence.vulnerabilities.length > 0 ||
    evidence.complianceGaps.length > 0;

  if (!hasIssues) {
    return (
      <div className="text-center text-zinc-500 py-12">
        <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-500/50" />
        <p>검증 이슈가 없습니다.</p>
        <p className="text-xs mt-1">No validation issues found.</p>
      </div>
    );
  }

  return (
    <>
      {/* Anti-pattern violations */}
      {evidence.violations.map((v) => {
        const sev = v.severity;
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
                </div>
                <p className="text-xs text-zinc-400 mt-1.5">{v.problemKo}</p>
                <p className="text-xs text-emerald-400/80 mt-1">
                  <span className="text-zinc-500">Solution: </span>{v.solutionKo}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Vulnerabilities */}
      {evidence.vulnerabilities.map((v) => (
        <div key={v.id} className="bg-zinc-800/50 rounded-lg p-3 border border-white/5">
          <div className="flex items-start gap-2">
            <span className="mt-0.5">
              {v.severity === 'critical' ? '🔴' : v.severity === 'high' ? '🟠' : '🟡'}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                  v.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                  v.severity === 'high' ? 'bg-orange-500/20 text-orange-300' :
                  'bg-yellow-500/20 text-yellow-300'
                }`}>
                  VULN
                </span>
                {v.cveId && (
                  <span className="text-[10px] font-mono text-zinc-500">{v.cveId}</span>
                )}
                <span className="text-sm font-medium text-white truncate">{v.titleKo}</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1.5">{v.descriptionKo}</p>
              <p className="text-xs text-blue-400/80 mt-1">
                <span className="text-zinc-500">Mitigation: </span>{v.mitigationKo}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Compliance gaps */}
      {evidence.complianceGaps.map((gap, i) => (
        <div key={`gap-${i}`} className="bg-zinc-800/50 rounded-lg p-3 border border-white/5">
          <div className="flex items-start gap-2">
            <span className="mt-0.5">
              {gap.priority === 'critical' ? '🔴' : gap.priority === 'high' ? '🟠' : '🟡'}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                  {gap.frameworkKo}
                </span>
                <span className="text-sm text-white">
                  Missing: {gap.missingComponents.join(', ')}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1.5">{gap.remediationKo}</p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

// ============================================================
// Tab: Trace (Reasoning Summary)
// ============================================================

function TraceTab({
  traceSummary,
  traceId,
  verification,
}: {
  traceSummary: TraceSummary;
  traceId?: string | null;
  verification?: { score: number; missingRequired: number; missingRecommended: number; conflicts: number } | null;
}) {
  const items = [
    { label: 'RAG 문서', labelEn: 'RAG Documents', value: traceSummary.ragDocumentsUsed },
    { label: '최고 점수', labelEn: 'Max Score', value: traceSummary.maxScore.toFixed(2) },
    { label: '관계 매칭', labelEn: 'Relationships', value: traceSummary.relationshipsMatched },
    { label: '갭 탐지', labelEn: 'Gaps', value: traceSummary.gapsDetected },
  ];

  return (
    <>
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item.labelEn} className="bg-zinc-800/50 rounded-lg p-3 border border-white/5 text-center">
            <p className="text-lg font-bold text-white">{item.value}</p>
            <p className="text-[10px] text-zinc-500">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2 mt-3">
        <span className={`text-xs px-2 py-1 rounded-full ${
          traceSummary.liveAugmentTriggered
            ? 'bg-orange-500/20 text-orange-300'
            : 'bg-zinc-800 text-zinc-500'
        }`}>
          Live Augment: {traceSummary.liveAugmentTriggered ? 'Yes' : 'No'}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full ${
          traceSummary.enrichmentCacheHit
            ? 'bg-green-500/20 text-green-300'
            : 'bg-zinc-800 text-zinc-500'
        }`}>
          Cache: {traceSummary.enrichmentCacheHit ? 'Hit' : 'Miss'}
        </span>
      </div>

      {/* Verification warnings (Phase 2) */}
      {verification && (
        <div className="mt-3 space-y-2">
          {verification.score < 70 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <p className="text-xs text-amber-300">
                검증 점수 낮음: {verification.score}/100
              </p>
            </div>
          )}
          {verification.missingRequired > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-xs text-red-300">
                필수 컴포넌트 누락 감지: {verification.missingRequired}건
              </p>
            </div>
          )}
          {verification.conflicts > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
              <p className="text-xs text-orange-300">
                충돌 감지: {verification.conflicts}건
              </p>
            </div>
          )}
        </div>
      )}

      {/* Link to admin trace detail */}
      {traceId && (
        <div className="mt-3">
          <a
            href={`/admin/rag?trace=${traceId}`}
            className="text-xs text-emerald-400/70 hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            관리자 트레이스 상세 보기
          </a>
        </div>
      )}
    </>
  );
}

// ============================================================
// Tab: Sources
// ============================================================

function SourcesTab({ evidence }: { evidence: EvidenceData }) {
  if (evidence.sources.length === 0) {
    return (
      <div className="text-center text-zinc-500 py-12">
        <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p>참조 출처가 없습니다.</p>
        <p className="text-xs mt-1">No source references available.</p>
      </div>
    );
  }

  // Group by source type
  const grouped = new Map<string, typeof evidence.sources>();
  for (const src of evidence.sources) {
    const list = grouped.get(src.type) ?? [];
    list.push(src);
    grouped.set(src.type, list);
  }

  return (
    <>
      {[...grouped.entries()].map(([type, sources]) => {
        const typeInfo = SOURCE_TYPE_LABELS[type] ?? { en: type, ko: type };
        return (
          <div key={type} className="space-y-2">
            <h4 className="text-xs uppercase text-zinc-500 tracking-wider flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                {typeInfo.ko}
              </span>
              <span>{sources.length} sources</span>
            </h4>
            {sources.map((src, i) => (
              <div key={`${type}-${i}`} className="bg-zinc-800/50 rounded-lg p-3 border border-white/5">
                <div className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium">{src.title}</div>
                    {src.section && (
                      <div className="text-xs text-zinc-400 mt-0.5">{src.section}</div>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500">
                      {src.publishedDate && <span>Published: {src.publishedDate}</span>}
                      <span>Accessed: {src.accessedDate}</span>
                    </div>
                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 text-[10px] text-emerald-400/70 hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {src.url}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
}
