/**
 * GraphControls — Search bar and category filter controls for the Graph tab.
 */

import { useState } from 'react';
import { Search, Filter, ChevronDown, ChevronRight, ExternalLink, Network } from 'lucide-react';
import type { InfraNodeType } from '@/types/infra';
import type { KnowledgeGraphNode } from '@/lib/knowledge/graphVisualizer';
import { getCategoryColor, CATEGORY_LABELS } from './types';

// ============================================================
// GraphTab (search + filter + node groups)
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

export function GraphTab({
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
