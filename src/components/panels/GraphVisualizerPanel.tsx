'use client';

/**
 * GraphVisualizerPanel
 *
 * Interactive knowledge graph visualization panel.
 * Displays infrastructure component relationships, stats, and detail views
 * using the graphVisualizer data layer.
 *
 * 3 Tabs:
 * - Graph: Grid/list view of nodes grouped by category
 * - Stats: Statistical overview (nodes by category, edges by type, tier distribution)
 * - Detail: Detailed view of a selected node (relationships, patterns, failures, vendor products)
 */

import { useState, useMemo, useCallback } from 'react';
import { Network, BarChart3, Info, Search, Filter, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import type { InfraNodeType } from '@/types/infra';
import {
  buildKnowledgeGraph,
  getNodeDetail,
  type KnowledgeGraphNode,
  type KnowledgeGraph,
  type GraphFilterOptions,
} from '@/lib/knowledge/graphVisualizer';
import { PanelContainer } from './PanelContainer';
import { PanelHeader } from './PanelHeader';
import { PanelTabs } from './PanelTabs';

// ============================================================
// Types
// ============================================================

interface GraphVisualizerPanelProps {
  onClose: () => void;
}

type TabKey = 'graph' | 'stats' | 'detail';

// ============================================================
// Constants
// ============================================================

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  security: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-500' },
  network: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', dot: 'bg-blue-500' },
  compute: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  cloud: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', dot: 'bg-purple-500' },
  storage: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber-500' },
  auth: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400', dot: 'bg-pink-500' },
  telecom: { bg: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-400', dot: 'bg-teal-500' },
  wan: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', dot: 'bg-indigo-500' },
  external: { bg: 'bg-zinc-500/10', border: 'border-zinc-500/30', text: 'text-zinc-400', dot: 'bg-zinc-500' },
};

const CATEGORY_LABELS: Record<string, { en: string; ko: string }> = {
  security: { en: 'Security', ko: '보안' },
  network: { en: 'Network', ko: '네트워크' },
  compute: { en: 'Compute', ko: '컴퓨팅' },
  cloud: { en: 'Cloud', ko: '클라우드' },
  storage: { en: 'Storage', ko: '스토리지' },
  auth: { en: 'Auth', ko: '인증' },
  telecom: { en: 'Telecom', ko: '통신' },
  wan: { en: 'WAN', ko: 'WAN' },
  external: { en: 'External', ko: '외부' },
};

const RELATIONSHIP_TYPE_LABELS: Record<string, { en: string; ko: string; color: string }> = {
  requires: { en: 'Requires', ko: '필수', color: 'text-red-400' },
  recommends: { en: 'Recommends', ko: '권장', color: 'text-blue-400' },
  conflicts: { en: 'Conflicts', ko: '충돌', color: 'text-orange-400' },
  enhances: { en: 'Enhances', ko: '강화', color: 'text-emerald-400' },
  protects: { en: 'Protects', ko: '보호', color: 'text-purple-400' },
};

const STRENGTH_LABELS: Record<string, { en: string; ko: string; color: string }> = {
  mandatory: { en: 'Mandatory', ko: '필수', color: 'bg-red-500/20 text-red-300' },
  strong: { en: 'Strong', ko: '강함', color: 'bg-amber-500/20 text-amber-300' },
  weak: { en: 'Weak', ko: '약함', color: 'bg-zinc-500/20 text-zinc-300' },
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-300',
  high: 'bg-orange-500/20 text-orange-300',
  medium: 'bg-yellow-500/20 text-yellow-300',
  low: 'bg-zinc-500/20 text-zinc-300',
};

function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS.external;
}

// ============================================================
// Component
// ============================================================

export function GraphVisualizerPanel({ onClose }: GraphVisualizerPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('graph');
  const [selectedNode, setSelectedNode] = useState<InfraNodeType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Build graph data (memoized, pure function — no API call needed)
  const graph = useMemo<KnowledgeGraph>(() => {
    const options: GraphFilterOptions = {
      includeIsolated: true,
      ...(selectedCategories.length > 0 ? { categories: selectedCategories } : {}),
    };
    return buildKnowledgeGraph(options);
  }, [selectedCategories]);

  // Available categories derived from the full graph
  const allCategories = useMemo(() => {
    const fullGraph = buildKnowledgeGraph({ includeIsolated: true });
    return Object.keys(fullGraph.stats.byCategory).sort();
  }, []);

  // Filter nodes by search query
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return graph.nodes;
    const q = searchQuery.toLowerCase();
    return graph.nodes.filter(
      (n) =>
        n.label.toLowerCase().includes(q) ||
        n.labelKo.includes(q) ||
        n.id.toLowerCase().includes(q),
    );
  }, [graph.nodes, searchQuery]);

  // Group filtered nodes by category
  const groupedNodes = useMemo(() => {
    const groups: Record<string, KnowledgeGraphNode[]> = {};
    for (const node of filteredNodes) {
      if (!groups[node.category]) groups[node.category] = [];
      groups[node.category].push(node);
    }
    // Sort nodes within each group by relationship count (descending)
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => b.relationshipCount - a.relationshipCount);
    }
    return groups;
  }, [filteredNodes]);

  // Handle node click — switch to detail tab
  const handleNodeClick = useCallback((nodeType: InfraNodeType) => {
    setSelectedNode(nodeType);
    setActiveTab('detail');
  }, []);

  // Toggle category filter
  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }, []);

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'graph', label: 'Graph', count: graph.stats.totalNodes },
    { key: 'stats', label: 'Stats' },
    { key: 'detail', label: 'Detail' },
  ];

  return (
    <PanelContainer>
      <PanelHeader
        icon={Network}
        iconColor="text-purple-400"
        title="Knowledge Graph"
        onClose={onClose}
      />

      <PanelTabs
        tabs={tabs}
        active={activeTab}
        onChange={setActiveTab}
        activeClassName="text-purple-400 border-b-2 border-purple-400 bg-purple-500/10"
        activeBadgeClassName="bg-purple-500/20 text-purple-300"
      />

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'graph' && (
          <GraphTab
            nodes={filteredNodes}
            groupedNodes={groupedNodes}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategories={selectedCategories}
            allCategories={allCategories}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters((v) => !v)}
            onToggleCategory={toggleCategory}
            onNodeClick={handleNodeClick}
          />
        )}
        {activeTab === 'stats' && <StatsTab graph={graph} />}
        {activeTab === 'detail' && (
          <DetailTab
            selectedNode={selectedNode}
            onNodeClick={handleNodeClick}
            onBack={() => setActiveTab('graph')}
          />
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 px-4 py-3 text-xs text-zinc-400">
        <div className="flex items-center justify-between">
          <span>
            {graph.stats.totalNodes} nodes / {graph.stats.totalEdges} edges
          </span>
          <span className="text-zinc-500">Knowledge Graph v1.0</span>
        </div>
      </div>
    </PanelContainer>
  );
}

// ============================================================
// Graph Tab
// ============================================================

interface GraphTabProps {
  nodes: KnowledgeGraphNode[];
  groupedNodes: Record<string, KnowledgeGraphNode[]>;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategories: string[];
  allCategories: string[];
  showFilters: boolean;
  onToggleFilters: () => void;
  onToggleCategory: (cat: string) => void;
  onNodeClick: (nodeType: InfraNodeType) => void;
}

function GraphTab({
  groupedNodes,
  searchQuery,
  onSearchChange,
  selectedCategories,
  allCategories,
  showFilters,
  onToggleFilters,
  onToggleCategory,
  onNodeClick,
}: GraphTabProps) {
  const categoryKeys = Object.keys(groupedNodes).sort();

  return (
    <div className="p-4 space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search components..."
            className="w-full pl-9 pr-3 py-2 bg-zinc-800/50 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>
        <button
          onClick={onToggleFilters}
          className={`px-3 py-2 rounded-lg border text-sm flex items-center gap-1.5 transition-colors ${
            showFilters || selectedCategories.length > 0
              ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
              : 'bg-zinc-800/50 border-white/10 text-zinc-400 hover:text-white'
          }`}
        >
          <Filter className="w-4 h-4" />
          {selectedCategories.length > 0 && (
            <span className="text-xs bg-purple-500/20 px-1.5 py-0.5 rounded-full">
              {selectedCategories.length}
            </span>
          )}
        </button>
      </div>

      {/* Category Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-1.5">
          {allCategories.map((cat) => {
            const colors = getCategoryColor(cat);
            const labels = CATEGORY_LABELS[cat];
            const isSelected = selectedCategories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => onToggleCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
                  isSelected
                    ? `${colors.bg} ${colors.border} ${colors.text}`
                    : 'bg-zinc-800/50 border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                {labels?.en ?? cat}
              </button>
            );
          })}
        </div>
      )}

      {/* Node Groups by Category */}
      {categoryKeys.length === 0 && (
        <div className="text-center text-zinc-500 py-12">
          <Network className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>No components found.</p>
        </div>
      )}

      {categoryKeys.map((category) => (
        <CategorySection
          key={category}
          category={category}
          nodes={groupedNodes[category]}
          onNodeClick={onNodeClick}
        />
      ))}
    </div>
  );
}

// ============================================================
// Category Section (collapsible group)
// ============================================================

interface CategorySectionProps {
  category: string;
  nodes: KnowledgeGraphNode[];
  onNodeClick: (nodeType: InfraNodeType) => void;
}

function CategorySection({ category, nodes, onNodeClick }: CategorySectionProps) {
  const [expanded, setExpanded] = useState(true);
  const colors = getCategoryColor(category);
  const labels = CATEGORY_LABELS[category];

  return (
    <div className={`rounded-lg border ${colors.border} overflow-hidden`}>
      {/* Category Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className={`w-full flex items-center justify-between px-3 py-2.5 ${colors.bg} transition-colors hover:brightness-125`}
      >
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
          <span className={`text-sm font-medium ${colors.text}`}>
            {labels?.en ?? category}
          </span>
          <span className={`text-xs ${colors.text} opacity-60`}>
            ({labels?.ko ?? ''})
          </span>
          <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded-full text-zinc-300">
            {nodes.length}
          </span>
        </div>
        {expanded ? (
          <ChevronDown className={`w-4 h-4 ${colors.text}`} />
        ) : (
          <ChevronRight className={`w-4 h-4 ${colors.text}`} />
        )}
      </button>

      {/* Node Cards */}
      {expanded && (
        <div className="p-2 space-y-1.5">
          {nodes.map((node) => (
            <NodeCard
              key={node.id}
              node={node}
              onClick={() => onNodeClick(node.id as InfraNodeType)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Node Card
// ============================================================

interface NodeCardProps {
  node: KnowledgeGraphNode;
  onClick: () => void;
}

function NodeCard({ node, onClick }: NodeCardProps) {
  const colors = getCategoryColor(node.category);

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-2.5 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/60 border border-white/5 hover:border-white/10 transition-colors group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} flex-shrink-0`} />
            <span className="text-sm font-medium text-white truncate">{node.label}</span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5 ml-3.5">{node.labelKo}</p>
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 flex-shrink-0 mt-0.5" />
      </div>

      {/* Annotation Badges */}
      <div className="flex flex-wrap gap-1 mt-2 ml-3.5">
        {node.relationshipCount > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">
            {node.relationshipCount} rels
          </span>
        )}
        {node.patternCount > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
            {node.patternCount} patterns
          </span>
        )}
        {node.antipatternCount > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400">
            {node.antipatternCount} antipatterns
          </span>
        )}
        {node.failureCount > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
            {node.failureCount} failures
          </span>
        )}
        {node.vendorProductCount > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
            {node.vendorProductCount} products
          </span>
        )}
        {node.hasPerformanceProfile && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400">
            perf
          </span>
        )}
      </div>
    </button>
  );
}

// ============================================================
// Stats Tab
// ============================================================

interface StatsTabProps {
  graph: KnowledgeGraph;
}

function StatsTab({ graph }: StatsTabProps) {
  const { stats } = graph;

  // Sort categories by count descending
  const categoryEntries = Object.entries(stats.byCategory).sort(([, a], [, b]) => b - a);
  const maxCategoryCount = categoryEntries.length > 0 ? categoryEntries[0][1] : 1;

  // Sort relationship types by count descending
  const relTypeEntries = Object.entries(stats.byRelationshipType).sort(([, a], [, b]) => b - a);
  const maxRelCount = relTypeEntries.length > 0 ? relTypeEntries[0][1] : 1;

  // Sort tiers by count descending
  const tierEntries = Object.entries(stats.byTier).sort(([, a], [, b]) => b - a);
  const maxTierCount = tierEntries.length > 0 ? tierEntries[0][1] : 1;

  return (
    <div className="p-4 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard
          label="Total Nodes"
          labelKo="전체 노드"
          value={stats.totalNodes}
          color="text-purple-400"
          bgColor="bg-purple-500/10"
        />
        <SummaryCard
          label="Total Edges"
          labelKo="전체 엣지"
          value={stats.totalEdges}
          color="text-blue-400"
          bgColor="bg-blue-500/10"
        />
      </div>

      {/* By Category */}
      <section>
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-purple-400" />
          Category Distribution
          <span className="text-xs text-zinc-500">(by category)</span>
        </h3>
        <div className="space-y-2">
          {categoryEntries.map(([category, count]) => {
            const colors = getCategoryColor(category);
            const labels = CATEGORY_LABELS[category];
            const pct = Math.round((count / maxCategoryCount) * 100);
            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                    <span className="text-xs text-zinc-300">
                      {labels?.en ?? category}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {labels?.ko ?? ''}
                    </span>
                  </div>
                  <span className={`text-xs font-medium ${colors.text}`}>{count}</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${colors.dot}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* By Relationship Type */}
      <section>
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Network className="w-4 h-4 text-blue-400" />
          Relationship Types
          <span className="text-xs text-zinc-500">(by type)</span>
        </h3>
        <div className="space-y-2">
          {relTypeEntries.map(([relType, count]) => {
            const labels = RELATIONSHIP_TYPE_LABELS[relType];
            const pct = Math.round((count / maxRelCount) * 100);
            return (
              <div key={relType}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs ${labels?.color ?? 'text-zinc-300'}`}>
                    {labels?.en ?? relType}
                    <span className="text-[10px] text-zinc-500 ml-1">
                      ({labels?.ko ?? ''})
                    </span>
                  </span>
                  <span className="text-xs font-medium text-zinc-300">{count}</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500/60"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* By Tier */}
      <section>
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400" />
          Tier Distribution
          <span className="text-xs text-zinc-500">(by tier)</span>
        </h3>
        <div className="space-y-2">
          {tierEntries.map(([tier, count]) => {
            const pct = Math.round((count / maxTierCount) * 100);
            return (
              <div key={tier}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-zinc-300 capitalize">{tier}</span>
                  <span className="text-xs font-medium text-amber-400">{count}</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500/60"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ============================================================
// Summary Card
// ============================================================

function SummaryCard({
  label,
  labelKo,
  value,
  color,
  bgColor,
}: {
  label: string;
  labelKo: string;
  value: number;
  color: string;
  bgColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-lg p-3 border border-white/5`}>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-zinc-300 mt-1">{label}</p>
      <p className="text-[10px] text-zinc-500">{labelKo}</p>
    </div>
  );
}

// ============================================================
// Detail Tab
// ============================================================

interface DetailTabProps {
  selectedNode: InfraNodeType | null;
  onNodeClick: (nodeType: InfraNodeType) => void;
  onBack: () => void;
}

function DetailTab({ selectedNode, onNodeClick, onBack }: DetailTabProps) {
  if (!selectedNode) {
    return (
      <div className="p-4 text-center text-zinc-500 py-16">
        <Info className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Select a component from the Graph tab</p>
        <p className="text-xs mt-1">to view detailed knowledge.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 text-sm bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/30 hover:bg-purple-500/20 transition-colors"
        >
          Go to Graph
        </button>
      </div>
    );
  }

  const detail = getNodeDetail(selectedNode);
  const colors = getCategoryColor(detail.node.category);

  return (
    <div className="p-4 space-y-4">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
      >
        <ChevronRight className="w-3 h-3 rotate-180" />
        Back to Graph
      </button>

      {/* Node Header */}
      <div className={`rounded-lg p-4 ${colors.bg} border ${colors.border}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`w-3 h-3 rounded-full ${colors.dot}`} />
          <h3 className="text-base font-semibold text-white">{detail.node.label}</h3>
        </div>
        <p className="text-sm text-zinc-400 ml-5">{detail.node.labelKo}</p>
        <div className="flex flex-wrap gap-2 mt-3 ml-5">
          <span className={`text-[10px] px-2 py-0.5 rounded ${colors.bg} ${colors.text} border ${colors.border}`}>
            {detail.node.category}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/10">
            tier: {detail.node.tier}
          </span>
        </div>
      </div>

      {/* Relationships */}
      <DetailSection title="Relationships" titleKo="관계" count={detail.relationships.length}>
        {detail.relationships.length === 0 ? (
          <p className="text-xs text-zinc-500 py-2">No relationships.</p>
        ) : (
          <div className="space-y-1.5">
            {detail.relationships.map((rel) => {
              const relLabels = RELATIONSHIP_TYPE_LABELS[rel.relationshipType];
              const strengthLabels = STRENGTH_LABELS[rel.strength];
              const isSource = rel.source === selectedNode;
              const otherNode = isSource ? rel.target : rel.source;
              return (
                <button
                  key={rel.id}
                  onClick={() => onNodeClick(otherNode as InfraNodeType)}
                  className="w-full text-left p-2 rounded bg-zinc-800/30 hover:bg-zinc-800/60 border border-white/5 transition-colors"
                >
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${relLabels?.color ?? 'text-zinc-300'} bg-zinc-700/50`}>
                      {relLabels?.en ?? rel.relationshipType}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${strengthLabels?.color ?? ''}`}>
                      {strengthLabels?.en ?? rel.strength}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {isSource ? '->' : '<-'} {otherNode}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">{rel.reasonKo}</p>
                </button>
              );
            })}
          </div>
        )}
      </DetailSection>

      {/* Patterns */}
      <DetailSection title="Patterns" titleKo="아키텍처 패턴" count={detail.patterns.length}>
        {detail.patterns.length === 0 ? (
          <p className="text-xs text-zinc-500 py-2">No related patterns.</p>
        ) : (
          <div className="space-y-1.5">
            {detail.patterns.map((pat) => (
              <div key={pat.id} className="p-2 rounded bg-zinc-800/30 border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white font-medium">{pat.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
                    complexity: {pat.complexity}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{pat.nameKo}</p>
              </div>
            ))}
          </div>
        )}
      </DetailSection>

      {/* Anti-patterns */}
      <DetailSection title="Anti-patterns" titleKo="안티패턴" count={detail.antipatterns.length}>
        {detail.antipatterns.length === 0 ? (
          <p className="text-xs text-zinc-500 py-2">No related anti-patterns.</p>
        ) : (
          <div className="space-y-1.5">
            {detail.antipatterns.map((ap) => (
              <div key={ap.id} className="p-2 rounded bg-zinc-800/30 border border-white/5">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${SEVERITY_COLORS[ap.severity] ?? SEVERITY_COLORS.medium}`}>
                    {ap.severity}
                  </span>
                  <span className="text-xs text-white font-medium">{ap.name}</span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{ap.nameKo}</p>
              </div>
            ))}
          </div>
        )}
      </DetailSection>

      {/* Failures */}
      <DetailSection title="Failure Scenarios" titleKo="장애 시나리오" count={detail.failures.length}>
        {detail.failures.length === 0 ? (
          <p className="text-xs text-zinc-500 py-2">No failure scenarios.</p>
        ) : (
          <div className="space-y-1.5">
            {detail.failures.map((f) => (
              <div key={f.id} className="p-2 rounded bg-zinc-800/30 border border-white/5">
                <p className="text-xs text-white font-medium">{f.titleKo}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                    impact: {f.impact}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">
                    likelihood: {f.likelihood}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </DetailSection>

      {/* Performance Profile */}
      {detail.performanceProfile && (
        <DetailSection title="Performance Profile" titleKo="성능 프로파일" count={1}>
          <div className="p-2 rounded bg-zinc-800/30 border border-white/5 space-y-1.5">
            <p className="text-xs text-white font-medium">{detail.performanceProfile.nameKo}</p>
            <div className="grid grid-cols-1 gap-1">
              <div className="flex justify-between">
                <span className="text-[10px] text-zinc-500">Latency</span>
                <span className="text-[10px] text-cyan-400">{detail.performanceProfile.latencyRange}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] text-zinc-500">Throughput</span>
                <span className="text-[10px] text-emerald-400">{detail.performanceProfile.throughputRange}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] text-zinc-500">Scaling</span>
                <span className="text-[10px] text-amber-400">{detail.performanceProfile.scalingStrategy}</span>
              </div>
            </div>
          </div>
        </DetailSection>
      )}

      {/* Vendor Products */}
      <DetailSection
        title="Vendor Products"
        titleKo="벤더 제품"
        count={detail.vendorProducts.reduce((sum, vp) => sum + vp.products.length, 0)}
      >
        {detail.vendorProducts.length === 0 ? (
          <p className="text-xs text-zinc-500 py-2">No vendor products mapped.</p>
        ) : (
          <div className="space-y-2">
            {detail.vendorProducts.map((vp) => (
              <div key={vp.vendorId} className="p-2 rounded bg-zinc-800/30 border border-white/5">
                <p className="text-xs text-white font-medium mb-1.5">{vp.vendorName}</p>
                <div className="flex flex-wrap gap-1">
                  {vp.products.map((prod) => (
                    <span
                      key={prod.nodeId}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      title={prod.nameKo}
                    >
                      {prod.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </DetailSection>
    </div>
  );
}

// ============================================================
// Detail Section (collapsible)
// ============================================================

function DetailSection({
  title,
  titleKo,
  count,
  children,
}: {
  title: string;
  titleKo: string;
  count: number;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border border-white/5 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{title}</span>
          <span className="text-[10px] text-zinc-500">{titleKo}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded-full text-zinc-300">
            {count}
          </span>
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
          )}
        </div>
      </button>
      {expanded && <div className="p-2">{children}</div>}
    </div>
  );
}
