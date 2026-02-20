'use client';

/**
 * Vendor Recommendation Panel Component
 *
 * Shows vendor product recommendations for the current diagram spec.
 * Uses the recommendation engine (matchVendorProducts) to match vendor products
 * to each node in the diagram.
 *
 * Tabs: Recommendations | Summary
 */

import { useState, useMemo } from 'react';
import { Package, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import type { InfraSpec } from '@/types';
import { matchVendorProducts } from '@/lib/recommendation';
import type {
  RecommendationResult,
  NodeRecommendation,
  ProductRecommendation,
} from '@/lib/recommendation';
import { getCategoryForType } from '@/lib/data/infrastructureDB';
import { PanelContainer } from './PanelContainer';
import { PanelHeader } from './PanelHeader';
import { PanelTabs } from './PanelTabs';

// ============================================================
// Types
// ============================================================

interface VendorRecommendationPanelProps {
  spec: InfraSpec | null;
  onClose: () => void;
}

type TabKey = 'recommendations' | 'summary';

// ============================================================
// Constants
// ============================================================

const CATEGORY_BADGE: Record<string, string> = {
  security: 'bg-red-500/20 text-red-300',
  network: 'bg-blue-500/20 text-blue-300',
  compute: 'bg-emerald-500/20 text-emerald-300',
  cloud: 'bg-purple-500/20 text-purple-300',
  storage: 'bg-amber-500/20 text-amber-300',
  auth: 'bg-pink-500/20 text-pink-300',
  external: 'bg-zinc-500/20 text-zinc-300',
};

// ============================================================
// Component
// ============================================================

export function VendorRecommendationPanel({ spec, onClose }: VendorRecommendationPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('recommendations');

  const result: RecommendationResult | null = useMemo(() => {
    if (!spec || spec.nodes.length === 0) return null;
    return matchVendorProducts(spec);
  }, [spec]);

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'recommendations', label: '추천', count: result?.totalMatches ?? 0 },
    { key: 'summary', label: '요약' },
  ];

  return (
    <PanelContainer>
      <PanelHeader icon={Package} iconColor="text-orange-400" title="벤더 제품 추천" onClose={onClose} />

      {/* Tabs */}
      <PanelTabs
        tabs={tabs}
        active={activeTab}
        onChange={setActiveTab}
        activeClassName="text-orange-400 border-b-2 border-orange-400 bg-orange-500/10"
        activeBadgeClassName="bg-orange-500/20 text-orange-300"
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Empty state: no spec or no nodes */}
        {(!spec || spec.nodes.length === 0) && (
          <div className="text-center text-zinc-500 py-12">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>다이어그램에 노드를 추가하면 벤더 제품을 추천해 드립니다.</p>
          </div>
        )}

        {/* Recommendations Tab */}
        {spec && result && activeTab === 'recommendations' && (
          <RecommendationsTab result={result} />
        )}

        {/* Summary Tab */}
        {spec && result && activeTab === 'summary' && (
          <SummaryTab result={result} />
        )}
      </div>

      {/* Footer */}
      {spec && result && (
        <div className="border-t border-white/10 px-4 py-3 text-xs text-zinc-400">
          <div className="flex items-center justify-between">
            <span>
              총 {result.totalMatches}개 추천 ({result.nodeRecommendations.length}개 노드)
            </span>
            <span className="text-zinc-500">벤더 카탈로그 기반</span>
          </div>
        </div>
      )}
    </PanelContainer>
  );
}

// ============================================================
// Recommendations Tab
// ============================================================

function RecommendationsTab({ result }: { result: RecommendationResult }) {
  if (result.nodeRecommendations.length === 0 && result.unmatchedNodes.length === 0) {
    return (
      <div className="text-center text-zinc-500 py-12">
        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-xs">매칭되는 벤더 제품이 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      {result.nodeRecommendations.map((nodeRec) => (
        <NodeRecommendationCard key={nodeRec.nodeId} nodeRec={nodeRec} />
      ))}

      {/* Unmatched Nodes */}
      {result.unmatchedNodes.length > 0 && (
        <div className="mt-2">
          <h3 className="text-xs font-medium text-zinc-500 mb-2 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            매칭 없음 ({result.unmatchedNodes.length}개)
          </h3>
          <div className="space-y-1.5">
            {result.unmatchedNodes.map((node) => {
              const category = getCategoryForType(node.nodeType);
              return (
                <div
                  key={node.nodeId}
                  className="bg-zinc-800/30 rounded-lg p-3 border border-white/5 flex items-center gap-2"
                >
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${CATEGORY_BADGE[category] ?? CATEGORY_BADGE.external}`}>
                    {node.nodeType}
                  </span>
                  <span className="text-sm text-zinc-400">{node.nodeLabel}</span>
                  <span className="ml-auto text-xs text-zinc-600">매칭 제품 없음</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================
// Node Recommendation Card
// ============================================================

function NodeRecommendationCard({ nodeRec }: { nodeRec: NodeRecommendation }) {
  const category = getCategoryForType(nodeRec.nodeType);

  return (
    <div className="space-y-2">
      {/* Node Header */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-white">{nodeRec.nodeLabel}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${CATEGORY_BADGE[category] ?? CATEGORY_BADGE.external}`}>
          {nodeRec.nodeType}
        </span>
        <span className="ml-auto text-xs text-zinc-500">{nodeRec.recommendations.length}개 추천</span>
      </div>

      {/* Product Cards */}
      <div className="space-y-2">
        {nodeRec.recommendations.map((rec) => (
          <ProductCard key={`${nodeRec.nodeId}-${rec.product.nodeId}`} rec={rec} />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Product Card
// ============================================================

function ProductCard({ rec }: { rec: ProductRecommendation }) {
  const [expanded, setExpanded] = useState(false);
  const score = rec.score.overall;

  return (
    <div className="bg-zinc-800/50 rounded-lg p-3 border border-white/5">
      {/* Product Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-white">{rec.product.name}</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300">
              {rec.vendorName}
            </span>
          </div>
          {rec.product.nameKo !== rec.product.name && (
            <p className="text-xs text-zinc-500 mt-0.5">{rec.product.nameKo}</p>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white flex-shrink-0"
          aria-label={expanded ? '접기' : '펼치기'}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Score Bar */}
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 h-2 rounded-full bg-zinc-700 overflow-hidden">
          <div
            className={`h-full rounded-full ${score > 70 ? 'bg-green-500' : score > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className={`text-xs font-mono ${score > 70 ? 'text-green-400' : score > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
          {score}
        </span>
      </div>

      {/* Breadcrumb Path */}
      {rec.path.length > 0 && (
        <p className="text-[10px] text-zinc-500 mt-1.5">
          {rec.path.join(' > ')}
        </p>
      )}

      {/* Reason */}
      <p className="text-xs text-zinc-400 mt-1.5">{rec.reasonKo}</p>

      {/* Expanded: Score Breakdown */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
          <ScoreBreakdownRow label="타입 일치" value={rec.score.breakdown.typeMatch} max={40} />
          <ScoreBreakdownRow label="아키텍처 적합도" value={rec.score.breakdown.architectureRoleFit} max={25} />
          <ScoreBreakdownRow label="사용 사례 일치" value={rec.score.breakdown.useCaseOverlap} max={20} />
          <ScoreBreakdownRow label="HA 기능 일치" value={rec.score.breakdown.haFeatureMatch} max={15} />

          {/* Additional product info */}
          {rec.product.architectureRole && (
            <div className="mt-2 p-2 rounded bg-orange-500/5 border border-orange-500/10">
              <p className="text-[10px] text-orange-300">
                <span className="text-zinc-500">아키텍처 역할:</span>{' '}
                {rec.product.architectureRoleKo ?? rec.product.architectureRole}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Score Breakdown Row
// ============================================================

function ScoreBreakdownRow({ label, value, max }: { label: string; value: number; max: number }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-zinc-500 w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-zinc-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-orange-500/70"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-[10px] text-zinc-400 font-mono w-10 text-right">{value}/{max}</span>
    </div>
  );
}

// ============================================================
// Summary Tab
// ============================================================

function SummaryTab({ result }: { result: RecommendationResult }) {
  // Compute score distribution
  const allRecommendations = result.nodeRecommendations.flatMap((n) => n.recommendations);
  const highScore = allRecommendations.filter((r) => r.score.overall > 70).length;
  const mediumScore = allRecommendations.filter((r) => r.score.overall > 40 && r.score.overall <= 70).length;
  const lowScore = allRecommendations.filter((r) => r.score.overall <= 40).length;

  // Compute vendor distribution
  const vendorCounts: Record<string, number> = {};
  for (const rec of allRecommendations) {
    vendorCounts[rec.vendorName] = (vendorCounts[rec.vendorName] ?? 0) + 1;
  }
  const vendorEntries = Object.entries(vendorCounts).sort((a, b) => b[1] - a[1]);

  const VENDOR_COLORS = [
    'bg-orange-500',
    'bg-blue-500',
    'bg-emerald-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-cyan-500',
    'bg-amber-500',
  ];

  const totalNodes = result.nodeRecommendations.length + result.unmatchedNodes.length;
  const matchedNodes = result.nodeRecommendations.length;

  return (
    <div className="space-y-4">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="평가된 제품 수" value={result.totalProductsEvaluated} />
        <StatCard label="매칭 결과" value={result.totalMatches} />
        <StatCard
          label="추천 노드"
          value={`${matchedNodes}/${totalNodes}`}
          subtext={`${result.unmatchedNodes.length}개 미매칭`}
        />
        <StatCard
          label="평균 점수"
          value={
            allRecommendations.length > 0
              ? Math.round(
                  allRecommendations.reduce((sum, r) => sum + r.score.overall, 0) /
                    allRecommendations.length,
                )
              : 0
          }
        />
      </div>

      {/* Score Distribution */}
      <div className="bg-zinc-800/50 rounded-lg p-4 border border-white/5">
        <h3 className="text-xs font-medium text-zinc-400 mb-3">점수 분포</h3>
        <div className="space-y-2">
          <DistributionRow
            label="70점 이상"
            count={highScore}
            total={allRecommendations.length}
            barClass="bg-green-500"
            labelClass="text-green-400"
          />
          <DistributionRow
            label="41~70점"
            count={mediumScore}
            total={allRecommendations.length}
            barClass="bg-yellow-500"
            labelClass="text-yellow-400"
          />
          <DistributionRow
            label="40점 이하"
            count={lowScore}
            total={allRecommendations.length}
            barClass="bg-red-500"
            labelClass="text-red-400"
          />
        </div>
      </div>

      {/* Vendor Distribution */}
      {vendorEntries.length > 0 && (
        <div className="bg-zinc-800/50 rounded-lg p-4 border border-white/5">
          <h3 className="text-xs font-medium text-zinc-400 mb-3">벤더별 분포</h3>
          <div className="space-y-2">
            {vendorEntries.map(([vendor, count], idx) => (
              <DistributionRow
                key={vendor}
                label={vendor}
                count={count}
                total={allRecommendations.length}
                barClass={VENDOR_COLORS[idx % VENDOR_COLORS.length]}
                labelClass="text-zinc-300"
              />
            ))}
          </div>
        </div>
      )}

      {/* Unmatched Node Types */}
      {result.unmatchedNodes.length > 0 && (
        <div className="bg-zinc-800/50 rounded-lg p-4 border border-white/5">
          <h3 className="text-xs font-medium text-zinc-400 mb-3">미매칭 노드 타입</h3>
          <div className="flex flex-wrap gap-1.5">
            {result.unmatchedNodes.map((node) => {
              const category = getCategoryForType(node.nodeType);
              return (
                <span
                  key={node.nodeId}
                  className={`text-[10px] px-2 py-1 rounded ${CATEGORY_BADGE[category] ?? CATEGORY_BADGE.external}`}
                >
                  {node.nodeType}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Stat Card
// ============================================================

function StatCard({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string | number;
  subtext?: string;
}) {
  return (
    <div className="bg-zinc-800/50 rounded-lg p-3 border border-white/5">
      <div className="text-[10px] text-zinc-500">{label}</div>
      <div className="text-lg font-bold text-white mt-0.5">{value}</div>
      {subtext && <div className="text-[10px] text-zinc-500 mt-0.5">{subtext}</div>}
    </div>
  );
}

// ============================================================
// Distribution Row
// ============================================================

function DistributionRow({
  label,
  count,
  total,
  barClass,
  labelClass,
}: {
  label: string;
  count: number;
  total: number;
  barClass: string;
  labelClass: string;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs w-20 flex-shrink-0 ${labelClass}`}>{label}</span>
      <div className="flex-1 h-2 rounded-full bg-zinc-700 overflow-hidden">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-xs text-zinc-400 font-mono w-8 text-right">{count}</span>
    </div>
  );
}
