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
 *
 * Sub-components are extracted into `./graph-visualizer/`.
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Network } from 'lucide-react';
import type { InfraNodeType } from '@/types/infra';
import {
  buildKnowledgeGraph,
  type KnowledgeGraph,
  type GraphFilterOptions,
} from '@/lib/knowledge/graphVisualizer';
import { PanelContainer } from './PanelContainer';
import { PanelHeader } from './PanelHeader';
import { PanelTabs } from './PanelTabs';
import { filterNodesByQuery, groupNodesByCategory } from './graph-visualizer/types';
import { GraphTab } from './graph-visualizer/GraphControls';
import { StatsTab } from './graph-visualizer/GraphCanvas';
import { DetailTab } from './graph-visualizer/GraphNodeDetail';

// ============================================================
// Types
// ============================================================

interface GraphVisualizerPanelProps {
  onClose: () => void;
}

type TabKey = 'graph' | 'stats' | 'detail';

// ============================================================
// Component
// ============================================================

export function GraphVisualizerPanel({ onClose }: GraphVisualizerPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('graph');
  const [selectedNode, setSelectedNode] = useState<InfraNodeType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Build graph data (async — vendor catalog is lazy-loaded)
  const [graph, setGraph] = useState<KnowledgeGraph>({ nodes: [], edges: [], stats: { totalNodes: 0, totalEdges: 0, byCategory: {}, byRelationshipType: {}, byTier: {} } });

  useEffect(() => {
    let cancelled = false;
    const options: GraphFilterOptions = {
      includeIsolated: true,
      ...(selectedCategories.length > 0 ? { categories: selectedCategories } : {}),
    };
    buildKnowledgeGraph(options).then((result) => {
      if (!cancelled) setGraph(result);
    });
    return () => { cancelled = true; };
  }, [selectedCategories]);

  // Available categories derived from the full graph
  const [allCategories, setAllCategories] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    buildKnowledgeGraph({ includeIsolated: true }).then((fullGraph) => {
      if (!cancelled) setAllCategories(Object.keys(fullGraph.stats.byCategory).sort());
    });
    return () => { cancelled = true; };
  }, []);

  // Filter nodes by search query
  const filteredNodes = useMemo(
    () => filterNodesByQuery(graph.nodes, searchQuery),
    [graph.nodes, searchQuery],
  );

  // Group filtered nodes by category
  const groupedNodes = useMemo(
    () => groupNodesByCategory(filteredNodes),
    [filteredNodes],
  );

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
