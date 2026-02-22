/**
 * GraphNodeDetail — Detailed view of a selected knowledge graph node.
 *
 * Shows relationships, patterns, anti-patterns, failures, performance profile,
 * and vendor products for the selected node.
 */

import { useState } from 'react';
import { Info, ChevronDown, ChevronRight } from 'lucide-react';
import type { InfraNodeType } from '@/types/infra';
import { getNodeDetail } from '@/lib/knowledge/graphVisualizer';
import {
  getCategoryColor,
  RELATIONSHIP_TYPE_LABELS,
  STRENGTH_LABELS,
  SEVERITY_COLORS,
} from './types';

// ============================================================
// Detail Tab
// ============================================================

interface DetailTabProps {
  selectedNode: InfraNodeType | null;
  onNodeClick: (nodeType: InfraNodeType) => void;
  onBack: () => void;
}

export function DetailTab({ selectedNode, onNodeClick, onBack }: DetailTabProps) {
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
