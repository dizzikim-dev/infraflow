/**
 * Shared types, constants, and utilities for the GraphVisualizer sub-components.
 */

import type { KnowledgeGraphNode } from '@/lib/knowledge/graphVisualizer';

// ============================================================
// Constants
// ============================================================

export const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
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

export const CATEGORY_LABELS: Record<string, { en: string; ko: string }> = {
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

export const RELATIONSHIP_TYPE_LABELS: Record<string, { en: string; ko: string; color: string }> = {
  requires: { en: 'Requires', ko: '필수', color: 'text-red-400' },
  recommends: { en: 'Recommends', ko: '권장', color: 'text-blue-400' },
  conflicts: { en: 'Conflicts', ko: '충돌', color: 'text-orange-400' },
  enhances: { en: 'Enhances', ko: '강화', color: 'text-emerald-400' },
  protects: { en: 'Protects', ko: '보호', color: 'text-purple-400' },
};

export const STRENGTH_LABELS: Record<string, { en: string; ko: string; color: string }> = {
  mandatory: { en: 'Mandatory', ko: '필수', color: 'bg-red-500/20 text-red-300' },
  strong: { en: 'Strong', ko: '강함', color: 'bg-amber-500/20 text-amber-300' },
  weak: { en: 'Weak', ko: '약함', color: 'bg-zinc-500/20 text-zinc-300' },
};

export const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-300',
  high: 'bg-orange-500/20 text-orange-300',
  medium: 'bg-yellow-500/20 text-yellow-300',
  low: 'bg-zinc-500/20 text-zinc-300',
};

// ============================================================
// Utility functions
// ============================================================

export function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS.external;
}

// ============================================================
// Data preparation (non-React)
// ============================================================

/** Group nodes by category and sort within each group by relationship count descending. */
export function groupNodesByCategory(
  nodes: KnowledgeGraphNode[],
): Record<string, KnowledgeGraphNode[]> {
  const groups: Record<string, KnowledgeGraphNode[]> = {};
  for (const node of nodes) {
    if (!groups[node.category]) groups[node.category] = [];
    groups[node.category].push(node);
  }
  // Sort nodes within each group by relationship count (descending)
  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => b.relationshipCount - a.relationshipCount);
  }
  return groups;
}

/** Filter nodes by search query (matches label, labelKo, or id). */
export function filterNodesByQuery(
  nodes: KnowledgeGraphNode[],
  query: string,
): KnowledgeGraphNode[] {
  if (!query.trim()) return nodes;
  const q = query.toLowerCase();
  return nodes.filter(
    (n) =>
      n.label.toLowerCase().includes(q) ||
      n.labelKo.includes(q) ||
      n.id.toLowerCase().includes(q),
  );
}
