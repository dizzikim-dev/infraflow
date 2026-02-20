'use client';

/**
 * Knowledge Graph Visualization Page
 *
 * Visualizes the Infrastructure Knowledge Graph using React Flow.
 * Shows infrastructure components as nodes and their relationships as edges,
 * with rich detail panels for filtering and node inspection.
 */

import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  type NodeProps,
  type EdgeProps,
  BaseEdge,
  getSmoothStepPath,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Link from 'next/link';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('KnowledgeGraphPage');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface KnowledgeGraphNode {
  id: string;
  label: string;
  labelKo: string;
  category: string;
  tier: string;
  patternCount: number;
  antipatternCount: number;
  failureCount: number;
  hasPerformanceProfile: boolean;
  vendorProductCount: number;
  relationshipCount: number;
}

interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  relationshipType: 'requires' | 'recommends' | 'conflicts' | 'enhances' | 'protects';
  strength: 'mandatory' | 'strong' | 'weak';
  direction: 'upstream' | 'downstream' | 'bidirectional';
  reason: string;
  reasonKo: string;
}

interface GraphStats {
  totalNodes: number;
  totalEdges: number;
  byCategory: Record<string, number>;
  byRelationshipType: Record<string, number>;
  byTier: Record<string, number>;
}

interface GraphApiResponse {
  success: boolean;
  data: {
    nodes: KnowledgeGraphNode[];
    edges: KnowledgeGraphEdge[];
    stats: GraphStats;
  };
  error?: string;
}

interface NodeDetailData {
  node: KnowledgeGraphNode;
  relationships: KnowledgeGraphEdge[];
  patterns: { id: string; name: string; nameKo: string; complexity: number }[];
  antipatterns: { id: string; name: string; nameKo: string; severity: string }[];
  failures: { id: string; titleKo: string; impact: string; likelihood: string }[];
  performanceProfile: {
    nameKo: string;
    latencyRange: string;
    throughputRange: string;
    scalingStrategy: string;
  } | null;
  vendorProducts: {
    vendorId: string;
    vendorName: string;
    products: { nodeId: string; name: string; nameKo: string }[];
  }[];
}

interface NodeDetailApiResponse {
  success: boolean;
  data: NodeDetailData;
  error?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  security:  { bg: 'bg-red-50',    border: 'border-red-500',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700' },
  network:   { bg: 'bg-blue-50',   border: 'border-blue-500',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-700' },
  compute:   { bg: 'bg-green-50',  border: 'border-green-500',  text: 'text-green-700',  badge: 'bg-green-100 text-green-700' },
  cloud:     { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
  storage:   { bg: 'bg-amber-50',  border: 'border-amber-500',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700' },
  auth:      { bg: 'bg-pink-50',   border: 'border-pink-500',   text: 'text-pink-700',   badge: 'bg-pink-100 text-pink-700' },
  external:  { bg: 'bg-gray-50',   border: 'border-gray-500',   text: 'text-gray-700',   badge: 'bg-gray-100 text-gray-700' },
  telecom:   { bg: 'bg-indigo-50', border: 'border-indigo-500', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700' },
  wan:       { bg: 'bg-teal-50',   border: 'border-teal-500',   text: 'text-teal-700',   badge: 'bg-teal-100 text-teal-700' },
};

const CATEGORY_HEX: Record<string, string> = {
  security: '#ef4444',
  network: '#3b82f6',
  compute: '#22c55e',
  cloud: '#a855f7',
  storage: '#f59e0b',
  auth: '#ec4899',
  external: '#6b7280',
  telecom: '#6366f1',
  wan: '#14b8a6',
};

const CATEGORY_LABELS: Record<string, string> = {
  security: '보안',
  network: '네트워크',
  compute: '컴퓨팅',
  cloud: '클라우드',
  storage: '스토리지',
  auth: '인증',
  external: '외부',
  telecom: '통신',
  wan: 'WAN',
};

const RELATIONSHIP_COLORS: Record<string, { color: string; label: string }> = {
  requires:   { color: '#3b82f6', label: '필수' },
  recommends: { color: '#22c55e', label: '권장' },
  conflicts:  { color: '#ef4444', label: '충돌' },
  enhances:   { color: '#a855f7', label: '강화' },
  protects:   { color: '#f59e0b', label: '보호' },
};

const TIER_Y_POSITIONS: Record<string, number> = {
  external: 0,
  dmz: 250,
  internal: 500,
  data: 750,
};

const TIER_LABELS: Record<string, string> = {
  external: 'External',
  dmz: 'DMZ',
  internal: 'Internal',
  data: 'Data',
};

const CATEGORY_ICONS: Record<string, string> = {
  security: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  network: 'M5 12h14M12 5l7 7-7 7',
  compute: 'M4 4h16v12H4zM4 20h16M8 16v4m8-4v4',
  cloud: 'M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z',
  storage: 'M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4',
  auth: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z',
  external: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  telecom: 'M2 12l5-5v3h6V7l5 5-5 5v-3H7v3z',
  wan: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12h16M12 4c2.5 3 4 6 4 8s-1.5 5-4 8c-2.5-3-4-6-4-8s1.5-5 4-8z',
};

const ALL_CATEGORIES = ['security', 'network', 'compute', 'cloud', 'storage', 'auth', 'external', 'telecom', 'wan'];
const ALL_RELATIONSHIP_TYPES = ['requires', 'recommends', 'conflicts', 'enhances', 'protects'];

// ---------------------------------------------------------------------------
// Custom Node Component
// ---------------------------------------------------------------------------

type KnowledgeNodeData = {
  labelKo: string;
  label: string;
  category: string;
  patternCount: number;
  failureCount: number;
  vendorProductCount: number;
};

const KnowledgeNodeComponent = memo(function KnowledgeNodeComponent({
  data,
}: NodeProps<Node<KnowledgeNodeData>>) {
  const colors = CATEGORY_COLORS[data.category] || CATEGORY_COLORS.external;
  const iconPath = CATEGORY_ICONS[data.category] || CATEGORY_ICONS.external;

  return (
    <div
      className={`
        px-3 py-2 rounded-lg border-l-4 bg-white shadow-md
        min-w-[140px] max-w-[180px]
        ${colors.border}
        hover:shadow-lg transition-shadow cursor-pointer
      `}
    >
      <div className="flex items-center gap-2 mb-1">
        <svg
          className={`w-4 h-4 flex-shrink-0 ${colors.text}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={iconPath} />
        </svg>
        <span className="text-xs font-semibold text-gray-900 truncate">
          {data.labelKo}
        </span>
      </div>

      <div className="flex items-center gap-1 mb-1">
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${colors.badge}`}>
          {CATEGORY_LABELS[data.category] || data.category}
        </span>
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        {data.patternCount > 0 && (
          <span className="text-[9px] px-1 py-0.5 rounded bg-green-100 text-green-700 font-medium">
            P:{data.patternCount}
          </span>
        )}
        {data.failureCount > 0 && (
          <span className="text-[9px] px-1 py-0.5 rounded bg-orange-100 text-orange-700 font-medium">
            F:{data.failureCount}
          </span>
        )}
        {data.vendorProductCount > 0 && (
          <span className="text-[9px] px-1 py-0.5 rounded bg-cyan-100 text-cyan-700 font-medium">
            V:{data.vendorProductCount}
          </span>
        )}
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Custom Edge Component
// ---------------------------------------------------------------------------

type KnowledgeEdgeData = {
  relationshipType: string;
  strength: string;
  reasonKo: string;
};

const KnowledgeEdgeComponent = memo(function KnowledgeEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<Edge<KnowledgeEdgeData>>) {
  const relType = data?.relationshipType || 'requires';
  const relConfig = RELATIONSHIP_COLORS[relType] || RELATIONSHIP_COLORS.requires;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  const isConflicts = relType === 'conflicts';
  const isRecommends = relType === 'recommends';
  const strokeWidth = isConflicts ? 2.5 : 1.5;
  const strokeDasharray = isRecommends ? '6 3' : isConflicts ? '3 3' : undefined;
  const animated = relType === 'requires';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: relConfig.color,
          strokeWidth,
          strokeDasharray,
        }}
        className={animated ? 'react-flow__edge-path-animated' : ''}
      />
      {data?.reasonKo && (
        <title>{data.reasonKo}</title>
      )}
    </>
  );
});

// ---------------------------------------------------------------------------
// Register custom types
// ---------------------------------------------------------------------------

const knowledgeNodeTypes: NodeTypes = {
  knowledge: KnowledgeNodeComponent as NodeTypes['default'],
};

const knowledgeEdgeTypes: EdgeTypes = {
  knowledge: KnowledgeEdgeComponent as EdgeTypes['default'],
};

// ---------------------------------------------------------------------------
// Layout helper: tier-based hierarchical positioning
// ---------------------------------------------------------------------------

function layoutNodes(graphNodes: KnowledgeGraphNode[]): Node<KnowledgeNodeData>[] {
  // Group nodes by tier
  const tierGroups: Record<string, KnowledgeGraphNode[]> = {};
  for (const node of graphNodes) {
    const tier = node.tier || 'internal';
    if (!tierGroups[tier]) tierGroups[tier] = [];
    tierGroups[tier].push(node);
  }

  const result: Node<KnowledgeNodeData>[] = [];
  const NODE_WIDTH = 180;
  const NODE_GAP = 40;

  for (const [tier, nodes] of Object.entries(tierGroups)) {
    const y = TIER_Y_POSITIONS[tier] ?? 500;
    const totalWidth = nodes.length * NODE_WIDTH + (nodes.length - 1) * NODE_GAP;
    const startX = -totalWidth / 2;

    nodes.forEach((node, index) => {
      result.push({
        id: node.id,
        type: 'knowledge',
        position: {
          x: startX + index * (NODE_WIDTH + NODE_GAP),
          y,
        },
        data: {
          labelKo: node.labelKo,
          label: node.label,
          category: node.category,
          patternCount: node.patternCount,
          failureCount: node.failureCount,
          vendorProductCount: node.vendorProductCount,
        },
      });
    });
  }

  return result;
}

function buildEdges(graphEdges: KnowledgeGraphEdge[]): Edge<KnowledgeEdgeData>[] {
  return graphEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'knowledge',
    data: {
      relationshipType: edge.relationshipType,
      strength: edge.strength,
      reasonKo: edge.reasonKo,
    },
  }));
}

// ---------------------------------------------------------------------------
// Filter Sidebar Component
// ---------------------------------------------------------------------------

interface FilterSidebarProps {
  categories: Set<string>;
  relationshipTypes: Set<string>;
  includeIsolated: boolean;
  stats: GraphStats | null;
  isCollapsed: boolean;
  onToggleCategory: (category: string) => void;
  onToggleRelationshipType: (type: string) => void;
  onToggleIncludeIsolated: () => void;
  onToggleCollapsed: () => void;
}

function FilterSidebar({
  categories,
  relationshipTypes,
  includeIsolated,
  stats,
  isCollapsed,
  onToggleCategory,
  onToggleRelationshipType,
  onToggleIncludeIsolated,
  onToggleCollapsed,
}: FilterSidebarProps) {
  if (isCollapsed) {
    return (
      <div className="w-10 bg-white border-r border-gray-200 flex flex-col items-center pt-2">
        <button
          onClick={onToggleCollapsed}
          className="p-1.5 rounded hover:bg-gray-100 transition text-gray-500"
          title="필터 패널 열기"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">필터</h3>
        <button
          onClick={onToggleCollapsed}
          className="p-1 rounded hover:bg-gray-100 transition text-gray-400"
          title="필터 패널 닫기"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Stats summary */}
      {stats && (
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex gap-4 text-xs text-gray-600">
            <div>
              <span className="font-bold text-gray-900 text-sm">{stats.totalNodes}</span>
              <span className="ml-1">컴포넌트</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">{stats.totalEdges}</span>
              <span className="ml-1">관계</span>
            </div>
          </div>
        </div>
      )}

      {/* Category filters */}
      <div className="px-4 py-3 border-b border-gray-100">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          카테고리
        </h4>
        <div className="space-y-1.5">
          {ALL_CATEGORIES.map((cat) => {
            const color = CATEGORY_HEX[cat] || '#6b7280';
            return (
              <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={categories.has(cat)}
                  onChange={() => onToggleCategory(cat)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-700 group-hover:text-gray-900">
                  {CATEGORY_LABELS[cat] || cat}
                </span>
                {stats?.byCategory[cat] != null && (
                  <span className="ml-auto text-[10px] text-gray-400">
                    {stats.byCategory[cat]}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Relationship type filters */}
      <div className="px-4 py-3 border-b border-gray-100">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          관계 유형
        </h4>
        <div className="space-y-1.5">
          {ALL_RELATIONSHIP_TYPES.map((type) => {
            const config = RELATIONSHIP_COLORS[type];
            return (
              <label key={type} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={relationshipTypes.has(type)}
                  onChange={() => onToggleRelationshipType(type)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-xs text-gray-700 group-hover:text-gray-900">
                  {config.label}
                </span>
                {stats?.byRelationshipType[type] != null && (
                  <span className="ml-auto text-[10px] text-gray-400">
                    {stats.byRelationshipType[type]}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Options */}
      <div className="px-4 py-3">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          옵션
        </h4>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeIsolated}
            onChange={onToggleIncludeIsolated}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
          />
          <span className="text-xs text-gray-700">고립된 노드 포함</span>
        </label>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail Panel Component
// ---------------------------------------------------------------------------

interface DetailPanelProps {
  detail: NodeDetailData | null;
  isLoading: boolean;
  onClose: () => void;
}

function DetailPanel({ detail, isLoading, onClose }: DetailPanelProps) {
  if (!detail && !isLoading) return null;

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-y-auto flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">노드 상세</h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 transition text-gray-400"
          title="닫기"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {isLoading && (
        <div className="p-4 space-y-3 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-20 bg-gray-200 rounded" />
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      )}

      {detail && !isLoading && (
        <div className="flex-1 overflow-y-auto">
          {/* Node header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <h4 className="text-base font-bold text-gray-900">{detail.node.labelKo}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{detail.node.label}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[detail.node.category]?.badge || 'bg-gray-100 text-gray-700'}`}>
                {CATEGORY_LABELS[detail.node.category] || detail.node.category}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700">
                {TIER_LABELS[detail.node.tier] || detail.node.tier}
              </span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="px-4 py-3 border-b border-gray-100">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              통계
            </h5>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-sm font-bold text-gray-900">{detail.node.patternCount}</p>
                <p className="text-[10px] text-gray-500">패턴</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-sm font-bold text-gray-900">{detail.node.antipatternCount}</p>
                <p className="text-[10px] text-gray-500">안티패턴</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-sm font-bold text-gray-900">{detail.node.failureCount}</p>
                <p className="text-[10px] text-gray-500">장애</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-sm font-bold text-gray-900">
                  {detail.node.hasPerformanceProfile ? 'O' : '-'}
                </p>
                <p className="text-[10px] text-gray-500">성능 프로파일</p>
              </div>
            </div>
          </div>

          {/* Patterns */}
          {detail.patterns.length > 0 && (
            <div className="px-4 py-3 border-b border-gray-100">
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                관련 패턴
              </h5>
              <div className="space-y-1.5">
                {detail.patterns.map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">{p.nameKo}</span>
                    <span className="text-[10px] text-amber-600">
                      {'*'.repeat(p.complexity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Failures */}
          {detail.failures.length > 0 && (
            <div className="px-4 py-3 border-b border-gray-100">
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                장애 시나리오
              </h5>
              <div className="space-y-1.5">
                {detail.failures.map((f) => (
                  <div key={f.id} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-700 truncate flex-1">{f.titleKo}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <ImpactBadge impact={f.impact} />
                      <LikelihoodBadge likelihood={f.likelihood} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Profile */}
          {detail.performanceProfile && (
            <div className="px-4 py-3 border-b border-gray-100">
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                성능 프로파일
              </h5>
              <div className="space-y-1.5 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">지연</span>
                  <span>{detail.performanceProfile.latencyRange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">처리량</span>
                  <span className="text-right max-w-[160px] truncate">{detail.performanceProfile.throughputRange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">스케일링</span>
                  <span>{detail.performanceProfile.scalingStrategy}</span>
                </div>
              </div>
            </div>
          )}

          {/* Vendor Products */}
          {detail.vendorProducts.length > 0 && (
            <div className="px-4 py-3">
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                벤더 제품
              </h5>
              <div className="space-y-3">
                {detail.vendorProducts.map((vp) => (
                  <div key={vp.vendorId}>
                    <Link
                      href={`/admin/knowledge/vendor-catalog/${vp.vendorId}`}
                      className="text-xs font-medium text-cyan-600 hover:text-cyan-800 hover:underline transition"
                    >
                      {vp.vendorName}
                    </Link>
                    <ul className="mt-1 space-y-0.5">
                      {vp.products.map((prod) => (
                        <li key={prod.nodeId} className="text-[11px] text-gray-600 pl-2 border-l border-gray-200">
                          {prod.nameKo}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Antipatterns */}
          {detail.antipatterns.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100">
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                안티패턴
              </h5>
              <div className="space-y-1.5">
                {detail.antipatterns.map((ap) => (
                  <div key={ap.id} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-700 truncate flex-1">{ap.nameKo}</span>
                    <SeverityBadge severity={ap.severity} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Badge sub-components
// ---------------------------------------------------------------------------

function ImpactBadge({ impact }: { impact: string }) {
  const styles: Record<string, string> = {
    'service-down': 'bg-red-100 text-red-700',
    'degraded': 'bg-yellow-100 text-yellow-700',
    'data-loss': 'bg-orange-100 text-orange-700',
    'security-breach': 'bg-purple-100 text-purple-700',
  };
  return (
    <span className={`text-[9px] px-1 py-0.5 rounded font-medium ${styles[impact] || 'bg-gray-100 text-gray-600'}`}>
      {impact}
    </span>
  );
}

function LikelihoodBadge({ likelihood }: { likelihood: string }) {
  const styles: Record<string, string> = {
    high: 'bg-red-50 text-red-600',
    medium: 'bg-yellow-50 text-yellow-600',
    low: 'bg-green-50 text-green-600',
  };
  return (
    <span className={`text-[9px] px-1 py-0.5 rounded font-medium ${styles[likelihood] || 'bg-gray-100 text-gray-600'}`}>
      {likelihood}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    critical: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-yellow-100 text-yellow-700',
  };
  return (
    <span className={`text-[9px] px-1 py-0.5 rounded font-medium ${styles[severity] || 'bg-gray-100 text-gray-600'}`}>
      {severity}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Tier Lane Labels (rendered as annotation nodes)
// ---------------------------------------------------------------------------

function buildTierLabelNodes(): Node[] {
  return Object.entries(TIER_Y_POSITIONS).map(([tier, y]) => ({
    id: `tier-label-${tier}`,
    type: 'default',
    position: { x: -550, y: y - 10 },
    data: { label: `${TIER_LABELS[tier] || tier}` },
    draggable: false,
    selectable: false,
    connectable: false,
    style: {
      background: 'transparent',
      border: 'none',
      fontSize: '12px',
      fontWeight: 700,
      color: '#94a3b8',
      width: 80,
      textAlign: 'center' as const,
      pointerEvents: 'none' as const,
    },
  }));
}

// ---------------------------------------------------------------------------
// Inner Canvas Component (uses useReactFlow)
// ---------------------------------------------------------------------------

interface CanvasProps {
  graphNodes: KnowledgeGraphNode[];
  graphEdges: KnowledgeGraphEdge[];
  onNodeClick: (nodeId: string) => void;
}

const KnowledgeGraphCanvas = memo(function KnowledgeGraphCanvas({
  graphNodes,
  graphEdges,
  onNodeClick,
}: CanvasProps) {
  const { fitView } = useReactFlow();

  const nodes = useMemo(() => {
    const dataNodes = layoutNodes(graphNodes);
    const tierLabels = buildTierLabelNodes();
    return [...tierLabels, ...dataNodes];
  }, [graphNodes]);

  const edges = useMemo(() => buildEdges(graphEdges), [graphEdges]);

  // Fit view when data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.1, duration: 300 });
    }, 100);
    return () => clearTimeout(timer);
  }, [graphNodes.length, fitView]);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      // Ignore tier label nodes
      if (node.id.startsWith('tier-label-')) return;
      onNodeClick(node.id);
    },
    [onNodeClick],
  );

  const minimapNodeColor = useCallback((node: Node) => {
    if (node.id.startsWith('tier-label-')) return 'transparent';
    const category = node.data?.category as string | undefined;
    return (category && CATEGORY_HEX[category]) || '#71717a';
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={knowledgeNodeTypes}
      edgeTypes={knowledgeEdgeTypes}
      onNodeClick={handleNodeClick}
      fitView
      attributionPosition="bottom-left"
      className="bg-slate-900"
      minZoom={0.2}
      maxZoom={2}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable
      panOnScroll
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={20}
        size={1}
        color="rgba(255, 255, 255, 0.06)"
      />
      <Controls
        className="bg-white border border-gray-200 rounded-lg shadow"
        showInteractive={false}
      />
      <MiniMap
        nodeColor={minimapNodeColor}
        className="bg-slate-800 border border-slate-700 rounded"
        maskColor="rgba(0,0,0,0.6)"
      />
    </ReactFlow>
  );
});

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

function KnowledgeGraphPageInner() {
  // Filter state
  const [categories, setCategories] = useState<Set<string>>(
    () => new Set(ALL_CATEGORIES),
  );
  const [relationshipTypes, setRelationshipTypes] = useState<Set<string>>(
    () => new Set(ALL_RELATIONSHIP_TYPES),
  );
  const [includeIsolated, setIncludeIsolated] = useState(true);
  const [filterCollapsed, setFilterCollapsed] = useState(false);

  // Data state
  const [graphNodes, setGraphNodes] = useState<KnowledgeGraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<KnowledgeGraphEdge[]>([]);
  const [stats, setStats] = useState<GraphStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail panel state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodeDetail, setNodeDetail] = useState<NodeDetailData | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Abort controller ref for canceling in-flight requests
  const abortRef = useRef<AbortController | null>(null);

  // Fetch graph data
  useEffect(() => {
    async function fetchGraph() {
      setIsLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      if (categories.size < ALL_CATEGORIES.length) {
        params.set('categories', [...categories].join(','));
      }
      if (relationshipTypes.size < ALL_RELATIONSHIP_TYPES.length) {
        params.set('relationshipTypes', [...relationshipTypes].join(','));
      }
      params.set('includeIsolated', String(includeIsolated));

      try {
        const url = `/api/knowledge/graph${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('데이터를 가져오는데 실패했습니다');
        }
        const json: GraphApiResponse = await response.json();
        if (!json.success) {
          throw new Error(json.error || '데이터를 가져오는데 실패했습니다');
        }
        setGraphNodes(json.data.nodes);
        setGraphEdges(json.data.edges);
        setStats(json.data.stats);
      } catch (err) {
        const message = err instanceof Error ? err.message : '오류가 발생했습니다';
        setError(message);
        log.error('Knowledge Graph 데이터 조회 실패');
      } finally {
        setIsLoading(false);
      }
    }

    fetchGraph();
  }, [categories, relationshipTypes, includeIsolated]);

  // Fetch node detail
  useEffect(() => {
    if (!selectedNodeId) {
      setNodeDetail(null);
      return;
    }

    async function fetchDetail() {
      // Cancel previous request
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      setIsDetailLoading(true);
      try {
        const response = await fetch(`/api/knowledge/graph/${selectedNodeId}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error('노드 상세 데이터를 가져오는데 실패했습니다');
        }
        const json: NodeDetailApiResponse = await response.json();
        if (!json.success) {
          throw new Error(json.error || '노드 상세 데이터를 가져오는데 실패했습니다');
        }
        setNodeDetail(json.data);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        log.error('Knowledge Graph 노드 상세 조회 실패');
        setNodeDetail(null);
      } finally {
        setIsDetailLoading(false);
      }
    }

    fetchDetail();

    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [selectedNodeId]);

  // Filter handlers
  const handleToggleCategory = useCallback((cat: string) => {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }, []);

  const handleToggleRelationshipType = useCallback((type: string) => {
    setRelationshipTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const handleToggleIncludeIsolated = useCallback(() => {
    setIncludeIsolated((prev) => !prev);
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedNodeId(null);
    setNodeDetail(null);
  }, []);

  return (
    <div className="-m-6 flex flex-col h-[calc(100vh)]">
      {/* Toolbar / Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/knowledge"
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Knowledge Graph</h1>
          {stats && (
            <span className="text-xs text-gray-500 ml-2">
              {stats.totalNodes}개 컴포넌트, {stats.totalEdges}개 관계
            </span>
          )}
        </div>

        {/* Layout toggle placeholder */}
        <div className="flex items-center gap-1">
          <button className="px-2.5 py-1 text-xs font-medium rounded bg-blue-600 text-white">
            계층형
          </button>
          <button
            className="px-2.5 py-1 text-xs font-medium rounded text-gray-500 hover:bg-gray-100 transition"
            title="방사형 레이아웃 (준비 중)"
            disabled
          >
            방사형
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 min-h-0">
        {/* Left sidebar: Filters */}
        <FilterSidebar
          categories={categories}
          relationshipTypes={relationshipTypes}
          includeIsolated={includeIsolated}
          stats={stats}
          isCollapsed={filterCollapsed}
          onToggleCategory={handleToggleCategory}
          onToggleRelationshipType={handleToggleRelationshipType}
          onToggleIncludeIsolated={handleToggleIncludeIsolated}
          onToggleCollapsed={() => setFilterCollapsed((v) => !v)}
        />

        {/* Center: Canvas */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-slate-400">그래프 데이터 로드 중...</p>
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-10">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-sm">
                <p className="text-sm font-medium text-red-800 mb-1">오류 발생</p>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            </div>
          )}

          {!isLoading && !error && graphNodes.length === 0 && (
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-10">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto text-slate-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-sm text-slate-400">표시할 노드가 없습니다</p>
                <p className="text-xs text-slate-500 mt-1">필터를 조정해 보세요</p>
              </div>
            </div>
          )}

          {!isLoading && !error && graphNodes.length > 0 && (
            <KnowledgeGraphCanvas
              graphNodes={graphNodes}
              graphEdges={graphEdges}
              onNodeClick={handleNodeClick}
            />
          )}

          {/* Edge legend overlay */}
          <div className="absolute bottom-3 left-14 bg-white/90 backdrop-blur-sm rounded-lg shadow px-3 py-2 z-10">
            <div className="flex items-center gap-3 text-[10px]">
              {ALL_RELATIONSHIP_TYPES.map((type) => {
                const config = RELATIONSHIP_COLORS[type];
                return (
                  <div key={type} className="flex items-center gap-1">
                    <div
                      className="w-4 h-0.5"
                      style={{ backgroundColor: config.color }}
                    />
                    <span className="text-gray-600">{config.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right sidebar: Detail Panel */}
        {(selectedNodeId || isDetailLoading) && (
          <DetailPanel
            detail={nodeDetail}
            isLoading={isDetailLoading}
            onClose={handleCloseDetail}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Exported Page with ReactFlowProvider
// ---------------------------------------------------------------------------

export default function KnowledgeGraphPage() {
  return (
    <ReactFlowProvider>
      <KnowledgeGraphPageInner />
    </ReactFlowProvider>
  );
}
