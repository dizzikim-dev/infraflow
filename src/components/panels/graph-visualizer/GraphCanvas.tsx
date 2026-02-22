/**
 * GraphCanvas — Statistics overview tab for the Graph Visualizer.
 *
 * Displays summary cards and bar charts for category, relationship type,
 * and tier distributions.
 */

import { Network, BarChart3, Info } from 'lucide-react';
import type { KnowledgeGraph } from '@/lib/knowledge/graphVisualizer';
import { getCategoryColor, CATEGORY_LABELS, RELATIONSHIP_TYPE_LABELS } from './types';

// ============================================================
// Stats Tab
// ============================================================

interface StatsTabProps {
  graph: KnowledgeGraph;
}

export function StatsTab({ graph }: StatsTabProps) {
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
