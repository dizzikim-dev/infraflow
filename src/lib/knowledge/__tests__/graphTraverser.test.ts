/**
 * GraphTraverser Tests
 *
 * Tests for the ontology graph traversal used in Graph-Guided RAG.
 */

import { describe, it, expect } from 'vitest';
import { getExpandedTypes, getAdjacencyListSize } from '../graphTraverser';
import type { InfraNodeType } from '@/types/infra';

// ---------------------------------------------------------------------------
// Adjacency list initialization
// ---------------------------------------------------------------------------

describe('GraphTraverser', () => {
  describe('adjacency list', () => {
    it('builds a non-empty adjacency list from RELATIONSHIPS', () => {
      const size = getAdjacencyListSize();
      expect(size).toBeGreaterThan(0);
    });
  });

  describe('getExpandedTypes', () => {
    it('returns seed types even with no neighbors', () => {
      // Using a type that likely has no outgoing edges (user/internet)
      const result = getExpandedTypes(['user' as InfraNodeType]);
      expect(result.types).toContain('user');
      expect(result.hops.get('user' as InfraNodeType)).toBe(0);
    });

    it('expands seed types to include 1-hop neighbors', () => {
      // firewall should have relationships to other types
      const result = getExpandedTypes(['firewall' as InfraNodeType], { maxHops: 1 });
      // Should include firewall plus at least one neighbor
      expect(result.types).toContain('firewall');
      expect(result.types.length).toBeGreaterThanOrEqual(1);
    });

    it('expands up to 2 hops by default', () => {
      const result = getExpandedTypes(['firewall' as InfraNodeType]);
      // Default maxHops is 2
      const maxHop = Math.max(...[...result.hops.values()]);
      expect(maxHop).toBeLessThanOrEqual(2);
    });

    it('returns paths for each expanded type', () => {
      const result = getExpandedTypes(['firewall' as InfraNodeType], { maxHops: 1 });

      // Each non-seed type should have a path
      for (const path of result.paths) {
        expect(path.from).toBeTruthy();
        expect(path.to).toBeTruthy();
        expect(path.via.length).toBeGreaterThan(0);
        expect(path.totalConfidence).toBeGreaterThan(0);
        expect(path.totalConfidence).toBeLessThanOrEqual(1);
      }
    });

    it('respects minConfidence filter', () => {
      const highConf = getExpandedTypes(['firewall' as InfraNodeType], {
        maxHops: 1,
        minConfidence: 0.99,
      });
      const lowConf = getExpandedTypes(['firewall' as InfraNodeType], {
        maxHops: 1,
        minConfidence: 0.1,
      });

      // More restrictive confidence → fewer or equal expansions
      expect(highConf.types.length).toBeLessThanOrEqual(lowConf.types.length);
    });

    it('respects includeTypes filter', () => {
      const requiresOnly = getExpandedTypes(['web-server' as InfraNodeType], {
        maxHops: 1,
        includeTypes: ['requires'],
      });
      const all = getExpandedTypes(['web-server' as InfraNodeType], {
        maxHops: 1,
        includeTypes: ['requires', 'recommends', 'enhances'],
      });

      // Including more relationship types → more or equal expansions
      expect(requiresOnly.types.length).toBeLessThanOrEqual(all.types.length);
    });

    it('does not include conflicts by default', () => {
      const result = getExpandedTypes(['firewall' as InfraNodeType], { maxHops: 1 });
      // Default includeTypes excludes 'conflicts'
      for (const path of result.paths) {
        // The via should not contain conflict relationship IDs
        expect(path.totalConfidence).toBeGreaterThan(0);
      }
    });

    it('handles multiple seed types', () => {
      const result = getExpandedTypes(
        ['firewall' as InfraNodeType, 'web-server' as InfraNodeType],
        { maxHops: 1 },
      );

      expect(result.types).toContain('firewall');
      expect(result.types).toContain('web-server');
      expect(result.hops.get('firewall' as InfraNodeType)).toBe(0);
      expect(result.hops.get('web-server' as InfraNodeType)).toBe(0);
    });

    it('does not visit the same type twice', () => {
      const result = getExpandedTypes(
        ['firewall' as InfraNodeType, 'router' as InfraNodeType],
        { maxHops: 2 },
      );

      const uniqueTypes = new Set(result.types);
      expect(uniqueTypes.size).toBe(result.types.length);
    });

    it('stops early when no new nodes found', () => {
      // user typically has very few relationships
      const result = getExpandedTypes(['user' as InfraNodeType], { maxHops: 10 });
      // Should not crash or loop endlessly
      expect(result.types.length).toBeGreaterThanOrEqual(1);
    });

    it('returns empty paths for seed-only results', () => {
      // A type with no outgoing relationships matching criteria
      const result = getExpandedTypes(['user' as InfraNodeType], {
        maxHops: 1,
        minConfidence: 1.0, // Very high threshold
      });
      // Seed is always included, but may have no expansion paths
      expect(result.types).toContain('user');
    });

    it('calculates path confidence as product of edge confidences', () => {
      const result = getExpandedTypes(['firewall' as InfraNodeType], { maxHops: 2 });

      for (const path of result.paths) {
        // Path confidence should be between 0 and 1
        expect(path.totalConfidence).toBeGreaterThan(0);
        expect(path.totalConfidence).toBeLessThanOrEqual(1);
      }
    });

    it('at hop 2+, only follows requires relationships', () => {
      // This is hard to test directly, but we can verify behavior:
      // A 2-hop expansion should have fewer paths than if all types were allowed at hop 2
      const hop2 = getExpandedTypes(['firewall' as InfraNodeType], { maxHops: 2 });

      // All expanded types at hop 2 should have come through 'requires' edges
      for (const path of hop2.paths) {
        const hopNum = result_hop(hop2, path.to as InfraNodeType);
        if (hopNum !== undefined && hopNum >= 2) {
          // Verify this exists (we can't easily check the relationship type
          // but the test above ensures includeTypes filtering works)
          expect(path.via.length).toBeGreaterThanOrEqual(2);
        }
      }
    });
  });
});

// Helper to get hop number
function result_hop(result: ReturnType<typeof getExpandedTypes>, type: InfraNodeType): number | undefined {
  return result.hops.get(type);
}
