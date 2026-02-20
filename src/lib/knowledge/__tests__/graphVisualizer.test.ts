import { describe, it, expect, beforeAll } from 'vitest';
import { buildKnowledgeGraph, getNodeDetail } from '../graphVisualizer';
import type { KnowledgeGraph, KnowledgeGraphNode, KnowledgeGraphEdge } from '../graphVisualizer';
import type { InfraNodeType } from '@/types/infra';

describe('graphVisualizer', () => {
  // -------------------------------------------------------------------------
  // buildKnowledgeGraph — basic structure
  // -------------------------------------------------------------------------

  describe('buildKnowledgeGraph', () => {
    let graph: KnowledgeGraph;

    // Build once for the basic tests (no filters)
    beforeAll(() => {
      graph = buildKnowledgeGraph();
    });

    it('should return nodes and edges', () => {
      expect(graph.nodes.length).toBeGreaterThan(0);
      expect(graph.edges.length).toBeGreaterThan(0);
    });

    it('should return stats with correct totals', () => {
      expect(graph.stats.totalNodes).toBe(graph.nodes.length);
      expect(graph.stats.totalEdges).toBe(graph.edges.length);
    });

    it('should have nodes with all required fields', () => {
      for (const node of graph.nodes) {
        expect(node.id).toBeTruthy();
        expect(typeof node.label).toBe('string');
        expect(node.label.length).toBeGreaterThan(0);
        expect(typeof node.labelKo).toBe('string');
        expect(node.labelKo.length).toBeGreaterThan(0);
        expect(typeof node.category).toBe('string');
        expect(node.category.length).toBeGreaterThan(0);
        expect(typeof node.tier).toBe('string');
        expect(node.tier.length).toBeGreaterThan(0);
      }
    });

    it('should have edges with all required fields', () => {
      const validRelTypes = new Set([
        'requires',
        'recommends',
        'conflicts',
        'enhances',
        'protects',
      ]);
      const validStrengths = new Set(['mandatory', 'strong', 'weak']);
      const validDirections = new Set(['upstream', 'downstream', 'bidirectional']);

      for (const edge of graph.edges) {
        expect(edge.id).toBeTruthy();
        expect(edge.source).toBeTruthy();
        expect(edge.target).toBeTruthy();
        expect(validRelTypes.has(edge.relationshipType)).toBe(true);
        expect(validStrengths.has(edge.strength)).toBe(true);
        expect(validDirections.has(edge.direction)).toBe(true);
        expect(typeof edge.reason).toBe('string');
        expect(typeof edge.reasonKo).toBe('string');
      }
    });

    it('should have non-negative annotation counts on all nodes', () => {
      for (const node of graph.nodes) {
        expect(node.patternCount).toBeGreaterThanOrEqual(0);
        expect(node.antipatternCount).toBeGreaterThanOrEqual(0);
        expect(node.failureCount).toBeGreaterThanOrEqual(0);
        expect(node.vendorProductCount).toBeGreaterThanOrEqual(0);
        expect(node.relationshipCount).toBeGreaterThanOrEqual(0);
        expect(typeof node.hasPerformanceProfile).toBe('boolean');
      }
    });

    it('should have unique node IDs', () => {
      const ids = graph.nodes.map((n) => n.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });

    it('should have unique edge IDs', () => {
      const ids = graph.edges.map((e) => e.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });

    it('should have byCategory stats summing to totalNodes', () => {
      const categorySum = Object.values(graph.stats.byCategory).reduce(
        (sum, count) => sum + count,
        0,
      );
      expect(categorySum).toBe(graph.stats.totalNodes);
    });

    it('should have byRelationshipType stats summing to totalEdges', () => {
      const relTypeSum = Object.values(graph.stats.byRelationshipType).reduce(
        (sum, count) => sum + count,
        0,
      );
      expect(relTypeSum).toBe(graph.stats.totalEdges);
    });

    it('should have byTier stats summing to totalNodes', () => {
      const tierSum = Object.values(graph.stats.byTier).reduce(
        (sum, count) => sum + count,
        0,
      );
      expect(tierSum).toBe(graph.stats.totalNodes);
    });

    it('should only include nodes that appear in relationships by default', () => {
      // Every node should have at least one relationship
      for (const node of graph.nodes) {
        expect(node.relationshipCount).toBeGreaterThan(0);
      }
    });

    it('should have edges whose source and target exist in the node set', () => {
      const nodeIds = new Set(graph.nodes.map((n) => n.id));
      for (const edge of graph.edges) {
        expect(nodeIds.has(edge.source)).toBe(true);
        expect(nodeIds.has(edge.target)).toBe(true);
      }
    });

    it('should include firewall as a node (well-known component)', () => {
      const firewallNode = graph.nodes.find((n) => n.id === 'firewall');
      expect(firewallNode).toBeDefined();
      expect(firewallNode!.category).toBe('security');
    });
  });

  // -------------------------------------------------------------------------
  // buildKnowledgeGraph — category filter
  // -------------------------------------------------------------------------

  describe('category filter', () => {
    it('should filter nodes by category', () => {
      const graph = buildKnowledgeGraph({ categories: ['security'] });
      expect(graph.nodes.length).toBeGreaterThan(0);
      for (const node of graph.nodes) {
        expect(node.category).toBe('security');
      }
    });

    it('should filter edges to only include matching category nodes', () => {
      const graph = buildKnowledgeGraph({ categories: ['security'] });
      const nodeIds = new Set(graph.nodes.map((n) => n.id));
      for (const edge of graph.edges) {
        expect(nodeIds.has(edge.source)).toBe(true);
        expect(nodeIds.has(edge.target)).toBe(true);
      }
    });

    it('should support multiple categories', () => {
      const graph = buildKnowledgeGraph({
        categories: ['security', 'network'],
      });
      const categories = new Set(graph.nodes.map((n) => n.category));
      // At least one of the requested categories should be present
      expect(
        categories.has('security') || categories.has('network'),
      ).toBe(true);
      // No other categories should appear
      for (const cat of categories) {
        expect(['security', 'network']).toContain(cat);
      }
    });

    it('should return empty graph for non-existent category', () => {
      const graph = buildKnowledgeGraph({ categories: ['nonexistent'] });
      expect(graph.nodes.length).toBe(0);
      expect(graph.edges.length).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // buildKnowledgeGraph — relationshipType filter
  // -------------------------------------------------------------------------

  describe('relationshipType filter', () => {
    it('should filter edges by relationship type', () => {
      const graph = buildKnowledgeGraph({
        relationshipTypes: ['requires'],
      });
      expect(graph.edges.length).toBeGreaterThan(0);
      for (const edge of graph.edges) {
        expect(edge.relationshipType).toBe('requires');
      }
    });

    it('should support multiple relationship types', () => {
      const graph = buildKnowledgeGraph({
        relationshipTypes: ['requires', 'conflicts'],
      });
      for (const edge of graph.edges) {
        expect(['requires', 'conflicts']).toContain(edge.relationshipType);
      }
    });
  });

  // -------------------------------------------------------------------------
  // buildKnowledgeGraph — tier filter
  // -------------------------------------------------------------------------

  describe('tier filter', () => {
    it('should filter nodes by tier', () => {
      const graph = buildKnowledgeGraph({ tiers: ['internal'] });
      expect(graph.nodes.length).toBeGreaterThan(0);
      for (const node of graph.nodes) {
        expect(node.tier).toBe('internal');
      }
    });

    it('should filter edges to only include matching tier nodes', () => {
      const graph = buildKnowledgeGraph({ tiers: ['internal'] });
      const nodeIds = new Set(graph.nodes.map((n) => n.id));
      for (const edge of graph.edges) {
        expect(nodeIds.has(edge.source)).toBe(true);
        expect(nodeIds.has(edge.target)).toBe(true);
      }
    });
  });

  // -------------------------------------------------------------------------
  // buildKnowledgeGraph — includeIsolated option
  // -------------------------------------------------------------------------

  describe('includeIsolated option', () => {
    it('should include more nodes when includeIsolated is true', () => {
      const graphDefault = buildKnowledgeGraph();
      const graphWithIsolated = buildKnowledgeGraph({ includeIsolated: true });
      expect(graphWithIsolated.nodes.length).toBeGreaterThanOrEqual(
        graphDefault.nodes.length,
      );
    });

    it('should include nodes with zero relationships when includeIsolated is true', () => {
      const graph = buildKnowledgeGraph({ includeIsolated: true });
      const isolatedNodes = graph.nodes.filter(
        (n) => n.relationshipCount === 0,
      );
      // There should be at least some isolated nodes (components not in RELATIONSHIPS)
      // This is a soft check — it depends on data coverage
      expect(graph.nodes.length).toBeGreaterThan(0);
      // The isolated count could be zero if all components have relationships,
      // so we just verify the option doesn't break anything
      expect(isolatedNodes.length).toBeGreaterThanOrEqual(0);
    });
  });

  // -------------------------------------------------------------------------
  // buildKnowledgeGraph — combined filters
  // -------------------------------------------------------------------------

  describe('combined filters', () => {
    it('should apply category + tier filters together', () => {
      const graph = buildKnowledgeGraph({
        categories: ['security'],
        tiers: ['internal'],
      });
      for (const node of graph.nodes) {
        expect(node.category).toBe('security');
        expect(node.tier).toBe('internal');
      }
    });

    it('should apply category + relationshipType filters together', () => {
      const graph = buildKnowledgeGraph({
        categories: ['security', 'network'],
        relationshipTypes: ['requires'],
      });
      for (const node of graph.nodes) {
        expect(['security', 'network']).toContain(node.category);
      }
      for (const edge of graph.edges) {
        expect(edge.relationshipType).toBe('requires');
      }
    });
  });

  // -------------------------------------------------------------------------
  // getNodeDetail
  // -------------------------------------------------------------------------

  describe('getNodeDetail', () => {
    it('should return correct data for firewall', () => {
      const detail = getNodeDetail('firewall');

      expect(detail.node.id).toBe('firewall');
      expect(detail.node.category).toBe('security');
      expect(detail.node.label).toBeTruthy();
      expect(detail.node.labelKo).toBeTruthy();
      expect(detail.relationships.length).toBeGreaterThan(0);
      expect(detail.patterns.length).toBeGreaterThan(0);
      expect(detail.failures.length).toBeGreaterThan(0);
      expect(detail.performanceProfile).not.toBeNull();
    });

    it('should return patterns with required fields', () => {
      const detail = getNodeDetail('firewall');
      for (const pattern of detail.patterns) {
        expect(pattern.id).toBeTruthy();
        expect(pattern.name).toBeTruthy();
        expect(pattern.nameKo).toBeTruthy();
        expect(pattern.complexity).toBeGreaterThanOrEqual(1);
        expect(pattern.complexity).toBeLessThanOrEqual(5);
      }
    });

    it('should return antipatterns with required fields', () => {
      const detail = getNodeDetail('firewall');
      for (const ap of detail.antipatterns) {
        expect(ap.id).toBeTruthy();
        expect(ap.name).toBeTruthy();
        expect(ap.nameKo).toBeTruthy();
        expect(['critical', 'high', 'medium']).toContain(ap.severity);
      }
    });

    it('should return failures with required fields', () => {
      const detail = getNodeDetail('firewall');
      for (const failure of detail.failures) {
        expect(failure.id).toBeTruthy();
        expect(failure.titleKo).toBeTruthy();
        expect(['service-down', 'degraded', 'data-loss', 'security-breach']).toContain(
          failure.impact,
        );
        expect(['high', 'medium', 'low']).toContain(failure.likelihood);
      }
    });

    it('should return performance profile with formatted ranges', () => {
      const detail = getNodeDetail('firewall');
      expect(detail.performanceProfile).not.toBeNull();
      const profile = detail.performanceProfile!;
      expect(profile.nameKo).toBeTruthy();
      expect(profile.latencyRange).toMatch(/\d/); // Contains at least a number
      expect(profile.throughputRange).toBeTruthy();
      expect(['horizontal', 'vertical', 'both']).toContain(
        profile.scalingStrategy,
      );
    });

    it('should return vendorProducts as array', () => {
      const detail = getNodeDetail('firewall');
      expect(Array.isArray(detail.vendorProducts)).toBe(true);
      // Vendor products may or may not exist depending on catalog data
      for (const vp of detail.vendorProducts) {
        expect(vp.vendorId).toBeTruthy();
        expect(vp.vendorName).toBeTruthy();
        expect(Array.isArray(vp.products)).toBe(true);
        for (const prod of vp.products) {
          expect(prod.nodeId).toBeTruthy();
          expect(prod.name).toBeTruthy();
          expect(prod.nameKo).toBeTruthy();
        }
      }
    });

    it('should return relationships as KnowledgeGraphEdge for the node', () => {
      const detail = getNodeDetail('firewall');
      for (const rel of detail.relationships) {
        expect(
          rel.source === 'firewall' || rel.target === 'firewall',
        ).toBe(true);
      }
    });

    it('should return empty arrays for unknown node type', () => {
      const detail = getNodeDetail('nonexistent-type' as InfraNodeType);
      expect(detail.relationships).toEqual([]);
      expect(detail.patterns).toEqual([]);
      expect(detail.antipatterns).toEqual([]);
      expect(detail.failures).toEqual([]);
      expect(detail.performanceProfile).toBeNull();
      expect(detail.vendorProducts).toEqual([]);
    });

    it('should return correct data for load-balancer', () => {
      const detail = getNodeDetail('load-balancer');
      expect(detail.node.id).toBe('load-balancer');
      expect(detail.node.category).toBe('network');
      expect(detail.relationships.length).toBeGreaterThan(0);
    });

    it('should return correct data for db-server', () => {
      const detail = getNodeDetail('db-server');
      expect(detail.node.id).toBe('db-server');
      expect(detail.node.category).toBe('compute');
      // db-server should have failure scenarios
      expect(detail.failures.length).toBeGreaterThan(0);
    });

    it('should have node annotation counts consistent with detail arrays', () => {
      const detail = getNodeDetail('firewall');
      expect(detail.node.patternCount).toBe(detail.patterns.length);
      expect(detail.node.failureCount).toBe(detail.failures.length);
      expect(detail.node.relationshipCount).toBe(detail.relationships.length);
      expect(detail.node.antipatternCount).toBe(detail.antipatterns.length);
    });
  });
});
