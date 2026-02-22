/**
 * Shared types and constants for the Knowledge Graph admin page components.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface KnowledgeGraphNode {
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

export interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  relationshipType: 'requires' | 'recommends' | 'conflicts' | 'enhances' | 'protects';
  strength: 'mandatory' | 'strong' | 'weak';
  direction: 'upstream' | 'downstream' | 'bidirectional';
  reason: string;
  reasonKo: string;
}

export interface GraphStats {
  totalNodes: number;
  totalEdges: number;
  byCategory: Record<string, number>;
  byRelationshipType: Record<string, number>;
  byTier: Record<string, number>;
}

export interface GraphApiResponse {
  success: boolean;
  data: {
    nodes: KnowledgeGraphNode[];
    edges: KnowledgeGraphEdge[];
    stats: GraphStats;
  };
  error?: string;
}

export interface NodeDetailData {
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

export interface NodeDetailApiResponse {
  success: boolean;
  data: NodeDetailData;
  error?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
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

export const CATEGORY_HEX: Record<string, string> = {
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

export const CATEGORY_LABELS: Record<string, string> = {
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

export const RELATIONSHIP_COLORS: Record<string, { color: string; label: string }> = {
  requires:   { color: '#3b82f6', label: '필수' },
  recommends: { color: '#22c55e', label: '권장' },
  conflicts:  { color: '#ef4444', label: '충돌' },
  enhances:   { color: '#a855f7', label: '강화' },
  protects:   { color: '#f59e0b', label: '보호' },
};

export const TIER_Y_POSITIONS: Record<string, number> = {
  external: 0,
  dmz: 250,
  internal: 500,
  data: 750,
};

export const TIER_LABELS: Record<string, string> = {
  external: 'External',
  dmz: 'DMZ',
  internal: 'Internal',
  data: 'Data',
};

export const CATEGORY_ICONS: Record<string, string> = {
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

export const ALL_CATEGORIES = ['security', 'network', 'compute', 'cloud', 'storage', 'auth', 'external', 'telecom', 'wan'];
export const ALL_RELATIONSHIP_TYPES = ['requires', 'recommends', 'conflicts', 'enhances', 'protects'];
