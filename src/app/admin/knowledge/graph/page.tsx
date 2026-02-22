'use client';

/**
 * Knowledge Graph Visualization Page
 *
 * Visualizes the Infrastructure Knowledge Graph using React Flow.
 * Shows infrastructure components as nodes and their relationships as edges,
 * with rich detail panels for filtering and node inspection.
 *
 * Sub-components are extracted into `./components/`.
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
import {
  type KnowledgeGraphNode,
  type KnowledgeGraphEdge,
  type GraphStats,
  type GraphApiResponse,
  type NodeDetailData,
  type NodeDetailApiResponse,
  CATEGORY_COLORS,
  CATEGORY_HEX,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  RELATIONSHIP_COLORS,
  TIER_Y_POSITIONS,
  TIER_LABELS,
  ALL_CATEGORIES,
  ALL_RELATIONSHIP_TYPES,
} from './components/types';
import { GraphFilterPanel } from './components/GraphFilterPanel';
import { GraphNodeDetailPanel } from './components/GraphNodeDetail';

const log = createLogger('KnowledgeGraphPage');

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
        <GraphFilterPanel
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
          <GraphNodeDetailPanel
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
