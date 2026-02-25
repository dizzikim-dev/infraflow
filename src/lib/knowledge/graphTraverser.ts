/**
 * Graph Traverser Module
 *
 * Builds an adjacency list from the ontology relationships and provides
 * N-hop neighbor expansion for Graph-Guided RAG. Given seed InfraNodeTypes,
 * traverses the relationship graph to find related types that should
 * also be included in RAG search queries.
 *
 * Reuses: RELATIONSHIPS from src/lib/knowledge/relationships/index.ts
 */

import type { InfraNodeType } from '@/types/infra';
import type { RelationshipType, RelationshipStrength } from './types';
import type { ExpandedTypeResult, TypePath } from '@/lib/rag/types';
import { RELATIONSHIPS } from './relationships';

// ---------------------------------------------------------------------------
// Adjacency List (built once on module load)
// ---------------------------------------------------------------------------

interface AdjacencyEntry {
  target: InfraNodeType;
  relationshipType: RelationshipType;
  strength: RelationshipStrength;
  confidence: number;
  relationshipId: string;
}

/** Adjacency list: source → list of neighbors */
const adjacencyList = new Map<InfraNodeType, AdjacencyEntry[]>();

// Build adjacency list from all relationships
for (const rel of RELATIONSHIPS) {
  // Forward direction: source → target
  if (!adjacencyList.has(rel.source)) {
    adjacencyList.set(rel.source, []);
  }
  adjacencyList.get(rel.source)!.push({
    target: rel.target,
    relationshipType: rel.relationshipType,
    strength: rel.strength,
    confidence: rel.trust.confidence,
    relationshipId: rel.id,
  });

  // Reverse direction for bidirectional relationships
  if (rel.direction === 'bidirectional') {
    if (!adjacencyList.has(rel.target)) {
      adjacencyList.set(rel.target, []);
    }
    adjacencyList.get(rel.target)!.push({
      target: rel.source,
      relationshipType: rel.relationshipType,
      strength: rel.strength,
      confidence: rel.trust.confidence,
      relationshipId: rel.id,
    });
  }
}

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface GraphTraversalOptions {
  /** Maximum hops from seed types (default: 2) */
  maxHops?: number;
  /** Minimum confidence to follow an edge (default: 0.5) */
  minConfidence?: number;
  /** Relationship types to follow (default: requires, recommends, enhances) */
  includeTypes?: RelationshipType[];
}

const DEFAULT_OPTIONS: Required<GraphTraversalOptions> = {
  maxHops: 2,
  minConfidence: 0.5,
  includeTypes: ['requires', 'recommends', 'enhances'],
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Expand seed types by traversing the ontology graph up to N hops.
 *
 * At hop 1, follows all includeTypes. At hop 2+, only follows 'requires'
 * to avoid exponential expansion.
 *
 * @param seedTypes - Starting node types from prompt extraction
 * @param options - Traversal configuration
 * @returns Expanded types with paths and hop distances
 */
export function getExpandedTypes(
  seedTypes: InfraNodeType[],
  options?: GraphTraversalOptions,
): ExpandedTypeResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const visited = new Set<InfraNodeType>(seedTypes);
  const hops = new Map<InfraNodeType, number>();
  const paths: TypePath[] = [];

  // Initialize seeds at hop 0
  for (const seed of seedTypes) {
    hops.set(seed, 0);
  }

  // BFS expansion
  let frontier = new Set<InfraNodeType>(seedTypes);

  for (let hop = 1; hop <= opts.maxHops; hop++) {
    const nextFrontier = new Set<InfraNodeType>();

    // At hop 2+, restrict to 'requires' only to avoid explosion
    const allowedTypes = hop === 1
      ? opts.includeTypes
      : opts.includeTypes.filter(t => t === 'requires');

    for (const current of frontier) {
      const neighbors = adjacencyList.get(current) ?? [];

      for (const neighbor of neighbors) {
        // Skip already visited
        if (visited.has(neighbor.target)) continue;

        // Filter by relationship type
        if (!allowedTypes.includes(neighbor.relationshipType)) continue;

        // Filter by confidence
        if (neighbor.confidence < opts.minConfidence) continue;

        // Calculate path confidence (product of edge confidences)
        const parentPath = paths.find(p => p.to === current);
        const parentConfidence = parentPath?.totalConfidence ?? 1.0;
        const pathConfidence = parentConfidence * neighbor.confidence;

        // Add to results
        visited.add(neighbor.target);
        hops.set(neighbor.target, hop);
        nextFrontier.add(neighbor.target);

        paths.push({
          from: current,
          to: neighbor.target,
          via: [...(parentPath?.via ?? []), neighbor.relationshipId],
          totalConfidence: pathConfidence,
        });
      }
    }

    frontier = nextFrontier;

    // If no new nodes found, stop early
    if (frontier.size === 0) break;
  }

  return {
    types: [...visited],
    paths,
    hops,
  };
}

/**
 * Get the adjacency list size (for testing/debugging).
 */
export function getAdjacencyListSize(): number {
  return adjacencyList.size;
}
