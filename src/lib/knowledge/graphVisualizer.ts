/**
 * Knowledge Graph Data Layer
 *
 * Builds a complete knowledge graph from all infrastructure knowledge data.
 * Provides typed graph structures (nodes, edges, stats) for visualization
 * and API consumption. Pure TypeScript — no React dependencies.
 *
 * Data sources:
 * - RELATIONSHIPS: Component relationships (~105)
 * - PATTERNS: Architecture patterns (~33)
 * - ANTI_PATTERNS: Anti-patterns with detection (~45)
 * - FAILURES: Failure scenarios (~64)
 * - PROFILES: Performance profiles (~38)
 * - vendorCatalog: Vendor product mappings
 */

import type { InfraNodeType } from '@/types/infra';
import type {
  ComponentRelationship,
  ArchitecturePattern,
  AntiPattern,
  FailureScenario,
  PerformanceProfile,
  RelationshipType,
} from './types';
import { RELATIONSHIPS } from './relationships';
import { PATTERNS } from './patterns';
import { ANTI_PATTERNS } from './antipatterns';
import { FAILURES } from './failures';
import { PROFILES } from './performance';
import { infrastructureDB, getCategoryForType, getTierForType, getLabelForType } from '@/lib/data/infrastructureDB';
import { getProductsByNodeType } from '@/lib/knowledge/vendorCatalog';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface KnowledgeGraphNode {
  id: string; // InfraNodeType
  label: string; // English label from infrastructureDB
  labelKo: string; // Korean label
  category: string; // security, network, compute, etc.
  tier: string; // external, dmz, internal, data
  // Annotation counts
  patternCount: number; // How many patterns include this component
  antipatternCount: number; // How many antipatterns reference this component
  failureCount: number; // How many failure scenarios for this component
  hasPerformanceProfile: boolean;
  vendorProductCount: number; // Products mapped to this InfraNodeType across all vendors
  // Relationship summary
  relationshipCount: number;
}

export interface KnowledgeGraphEdge {
  id: string; // relationship ID
  source: string; // InfraNodeType
  target: string;
  relationshipType: RelationshipType;
  strength: 'mandatory' | 'strong' | 'weak';
  direction: 'upstream' | 'downstream' | 'bidirectional';
  reason: string;
  reasonKo: string;
}

export interface KnowledgeGraphStats {
  totalNodes: number;
  totalEdges: number;
  byCategory: Record<string, number>;
  byRelationshipType: Record<string, number>;
  byTier: Record<string, number>;
}

export interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  stats: KnowledgeGraphStats;
}

export interface GraphFilterOptions {
  categories?: string[]; // Filter nodes by category
  relationshipTypes?: RelationshipType[];
  tiers?: string[];
  includeIsolated?: boolean; // Include nodes with 0 relationships (default: false)
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Count how many patterns include a given component type */
function countPatternsForType(nodeType: InfraNodeType): number {
  return (PATTERNS as readonly ArchitecturePattern[]).filter((p) => {
    const requiredTypes = p.requiredComponents.map((c) => c.type);
    const optionalTypes = p.optionalComponents.map((c) => c.type);
    return requiredTypes.includes(nodeType) || optionalTypes.includes(nodeType);
  }).length;
}

/** Count how many antipatterns reference a component type via tags */
function countAntipatternsForType(nodeType: InfraNodeType): number {
  return (ANTI_PATTERNS as readonly AntiPattern[]).filter((ap) =>
    ap.tags.includes(nodeType),
  ).length;
}

/** Count how many failure scenarios target a component type */
function countFailuresForType(nodeType: InfraNodeType): number {
  return (FAILURES as readonly FailureScenario[]).filter(
    (f) => f.component === nodeType,
  ).length;
}

/** Check if a performance profile exists for this component type */
function hasProfile(nodeType: InfraNodeType): boolean {
  return (PROFILES as readonly PerformanceProfile[]).some(
    (p) => p.component === nodeType,
  );
}

/** Count vendor products mapped to this node type */
function countVendorProducts(nodeType: InfraNodeType): number {
  const results = getProductsByNodeType(nodeType);
  return results.reduce((sum, r) => sum + r.products.length, 0);
}

/** Count relationships (as source or target) for a node type */
function countRelationshipsForType(
  nodeType: string,
  relationships: readonly ComponentRelationship[],
): number {
  return relationships.filter(
    (r) => r.source === nodeType || r.target === nodeType,
  ).length;
}

/** Build a KnowledgeGraphNode from an InfraNodeType */
function buildNode(
  nodeType: InfraNodeType,
  relationships: readonly ComponentRelationship[],
): KnowledgeGraphNode {
  const info = infrastructureDB[nodeType];
  return {
    id: nodeType,
    label: getLabelForType(nodeType),
    labelKo: info?.nameKo ?? nodeType,
    category: getCategoryForType(nodeType),
    tier: getTierForType(nodeType),
    patternCount: countPatternsForType(nodeType),
    antipatternCount: countAntipatternsForType(nodeType),
    failureCount: countFailuresForType(nodeType),
    hasPerformanceProfile: hasProfile(nodeType),
    vendorProductCount: countVendorProducts(nodeType),
    relationshipCount: countRelationshipsForType(nodeType, relationships),
  };
}

/** Build a KnowledgeGraphEdge from a ComponentRelationship */
function buildEdge(rel: ComponentRelationship): KnowledgeGraphEdge {
  return {
    id: rel.id,
    source: rel.source,
    target: rel.target,
    relationshipType: rel.relationshipType,
    strength: rel.strength,
    direction: rel.direction,
    reason: rel.reason,
    reasonKo: rel.reasonKo,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build complete knowledge graph from all knowledge data.
 *
 * By default, only nodes that appear in at least one relationship are included.
 * Set `includeIsolated: true` to also include infrastructure components with
 * no relationships.
 */
export function buildKnowledgeGraph(options?: GraphFilterOptions): KnowledgeGraph {
  const allRelationships = RELATIONSHIPS as readonly ComponentRelationship[];

  // 1. Filter edges by relationship type if requested
  let filteredEdges = [...allRelationships];
  if (options?.relationshipTypes && options.relationshipTypes.length > 0) {
    const allowedTypes = new Set(options.relationshipTypes);
    filteredEdges = filteredEdges.filter((r) => allowedTypes.has(r.relationshipType));
  }

  // 2. Collect unique node types from filtered relationships
  const relatedNodeTypes = new Set<string>();
  for (const rel of filteredEdges) {
    relatedNodeTypes.add(rel.source);
    relatedNodeTypes.add(rel.target);
  }

  // 3. If includeIsolated, add all component types from infrastructureDB
  let allNodeTypes = new Set(relatedNodeTypes);
  if (options?.includeIsolated) {
    for (const key of Object.keys(infrastructureDB)) {
      allNodeTypes.add(key);
    }
  }

  // 4. Apply category filter
  if (options?.categories && options.categories.length > 0) {
    const allowedCategories = new Set(options.categories);
    allNodeTypes = new Set(
      [...allNodeTypes].filter((nt) => {
        const category = getCategoryForType(nt as InfraNodeType);
        return allowedCategories.has(category);
      }),
    );

    // Also filter edges: both source and target must be in the node set
    filteredEdges = filteredEdges.filter(
      (r) => allNodeTypes.has(r.source) && allNodeTypes.has(r.target),
    );
  }

  // 5. Apply tier filter
  if (options?.tiers && options.tiers.length > 0) {
    const allowedTiers = new Set(options.tiers);
    allNodeTypes = new Set(
      [...allNodeTypes].filter((nt) => {
        const tier = getTierForType(nt as InfraNodeType);
        return allowedTiers.has(tier);
      }),
    );

    // Filter edges again
    filteredEdges = filteredEdges.filter(
      (r) => allNodeTypes.has(r.source) && allNodeTypes.has(r.target),
    );
  }

  // 6. Build nodes
  const nodes: KnowledgeGraphNode[] = [...allNodeTypes].map((nt) =>
    buildNode(nt as InfraNodeType, filteredEdges),
  );

  // 7. Build edges (only those whose source and target are in the node set)
  const edges: KnowledgeGraphEdge[] = filteredEdges
    .filter((r) => allNodeTypes.has(r.source) && allNodeTypes.has(r.target))
    .map(buildEdge);

  // 8. Compute stats
  const byCategory: Record<string, number> = {};
  const byTier: Record<string, number> = {};
  for (const node of nodes) {
    byCategory[node.category] = (byCategory[node.category] ?? 0) + 1;
    byTier[node.tier] = (byTier[node.tier] ?? 0) + 1;
  }

  const byRelationshipType: Record<string, number> = {};
  for (const edge of edges) {
    byRelationshipType[edge.relationshipType] =
      (byRelationshipType[edge.relationshipType] ?? 0) + 1;
  }

  return {
    nodes,
    edges,
    stats: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      byCategory,
      byRelationshipType,
      byTier,
    },
  };
}

/**
 * Get detailed knowledge for a specific infrastructure node type.
 *
 * Aggregates relationships, patterns, antipatterns (by tag match),
 * failure scenarios, performance profile, and vendor product mappings.
 */
export function getNodeDetail(nodeType: InfraNodeType): {
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
} {
  const allRelationships = RELATIONSHIPS as readonly ComponentRelationship[];

  // Build node
  const node = buildNode(nodeType, allRelationships);

  // Relationships for this node
  const relationships = allRelationships
    .filter((r) => r.source === nodeType || r.target === nodeType)
    .map(buildEdge);

  // Patterns that include this component (required or optional)
  const patterns = (PATTERNS as readonly ArchitecturePattern[])
    .filter((p) => {
      const requiredTypes = p.requiredComponents.map((c) => c.type);
      const optionalTypes = p.optionalComponents.map((c) => c.type);
      return requiredTypes.includes(nodeType) || optionalTypes.includes(nodeType);
    })
    .map((p) => ({
      id: p.id,
      name: p.name,
      nameKo: p.nameKo,
      complexity: p.complexity,
    }));

  // Antipatterns that reference this component via tags
  const antipatterns = (ANTI_PATTERNS as readonly AntiPattern[])
    .filter((ap) => ap.tags.includes(nodeType))
    .map((ap) => ({
      id: ap.id,
      name: ap.name,
      nameKo: ap.nameKo,
      severity: ap.severity,
    }));

  // Failure scenarios for this component
  const failures = (FAILURES as readonly FailureScenario[])
    .filter((f) => f.component === nodeType)
    .map((f) => ({
      id: f.id,
      titleKo: f.titleKo,
      impact: f.impact,
      likelihood: f.likelihood,
    }));

  // Performance profile
  const profile = (PROFILES as readonly PerformanceProfile[]).find(
    (p) => p.component === nodeType,
  );
  const performanceProfile = profile
    ? {
        nameKo: profile.nameKo,
        latencyRange: `${profile.latencyRange.min}–${profile.latencyRange.max} ${profile.latencyRange.unit}`,
        throughputRange: `${profile.throughputRange.typical} (max: ${profile.throughputRange.max})`,
        scalingStrategy: profile.scalingStrategy,
      }
    : null;

  // Vendor products
  const vendorResults = getProductsByNodeType(nodeType);
  const vendorProducts = vendorResults.map((vr) => ({
    vendorId: vr.vendorId,
    vendorName: vr.vendorName,
    products: vr.products.map((p) => ({
      nodeId: p.nodeId,
      name: p.name,
      nameKo: p.nameKo,
    })),
  }));

  return {
    node,
    relationships,
    patterns,
    antipatterns,
    failures,
    performanceProfile,
    vendorProducts,
  };
}
