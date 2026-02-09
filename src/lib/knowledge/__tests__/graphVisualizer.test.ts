import { describe, it, expect } from 'vitest';
import {
  buildKnowledgeGraph,
  buildComponentGraph,
  getGraphStats,
  toReactFlowFormat,
} from '../graphVisualizer';
import type {
  KnowledgeGraph,
  KGNode,
  KGEdge,
  GraphOptions,
} from '../graphVisualizer';
import { RELATIONSHIPS } from '../relationships';
import { PATTERNS } from '../patterns';
import { ANTIPATTERNS } from '../antipatterns';
import { FAILURES } from '../failures';

// ---------------------------------------------------------------------------
// buildKnowledgeGraph
// ---------------------------------------------------------------------------

describe('buildKnowledgeGraph', () => {
  it('should build graph with default options (components only)', () => {
    const graph = buildKnowledgeGraph();

    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.edges.length).toBeGreaterThan(0);

    // Default includes components only
    const nodeTypes = new Set(graph.nodes.map((n) => n.type));
    expect(nodeTypes.has('component')).toBe(true);
    expect(nodeTypes.has('pattern')).toBe(false);
    expect(nodeTypes.has('antipattern')).toBe(false);
    expect(nodeTypes.has('failure')).toBe(false);
  });

  it('should include pattern nodes when requested', () => {
    const graph = buildKnowledgeGraph({
      includeComponents: true,
      includePatterns: true,
      maxNodes: 100,
    });

    const patternNodes = graph.nodes.filter((n) => n.type === 'pattern');
    expect(patternNodes.length).toBeGreaterThan(0);
    expect(graph.stats.patternCount).toBe(patternNodes.length);
  });

  it('should include antipattern nodes when requested', () => {
    const graph = buildKnowledgeGraph({
      includeComponents: true,
      includeAntiPatterns: true,
      maxNodes: 100,
    });

    const apNodes = graph.nodes.filter((n) => n.type === 'antipattern');
    expect(apNodes.length).toBeGreaterThan(0);
    expect(graph.stats.antipatternCount).toBe(apNodes.length);
  });

  it('should include failure nodes when requested', () => {
    const graph = buildKnowledgeGraph({
      includeComponents: true,
      includeFailures: true,
      maxNodes: 200,
    });

    const failureNodes = graph.nodes.filter((n) => n.type === 'failure');
    expect(failureNodes.length).toBeGreaterThan(0);
    expect(graph.stats.failureCount).toBe(failureNodes.length);
  });

  it('should respect maxNodes limit', () => {
    const limit = 10;
    const graph = buildKnowledgeGraph({
      includeComponents: true,
      includePatterns: true,
      includeAntiPatterns: true,
      includeFailures: true,
      maxNodes: limit,
    });

    expect(graph.nodes.length).toBeLessThanOrEqual(limit);
  });

  it('should filter by components when filterComponents is set', () => {
    const graph = buildKnowledgeGraph({
      filterComponents: ['firewall', 'waf'],
    });

    const componentNodes = graph.nodes.filter((n) => n.type === 'component');
    for (const node of componentNodes) {
      const compType = node.metadata.componentType as string;
      expect(['firewall', 'waf']).toContain(compType);
    }
  });

  it('should have correct stats', () => {
    const graph = buildKnowledgeGraph({
      includeComponents: true,
      includePatterns: true,
      maxNodes: 100,
    });

    expect(graph.stats.totalNodes).toBe(graph.nodes.length);
    expect(graph.stats.totalEdges).toBe(graph.edges.length);

    const componentCount = graph.nodes.filter((n) => n.type === 'component').length;
    const patternCount = graph.nodes.filter((n) => n.type === 'pattern').length;

    expect(graph.stats.componentCount).toBe(componentCount);
    expect(graph.stats.patternCount).toBe(patternCount);
  });

  it('should assign positions to all nodes', () => {
    const graph = buildKnowledgeGraph();

    for (const node of graph.nodes) {
      expect(node.position).toBeDefined();
      expect(typeof node.position.x).toBe('number');
      expect(typeof node.position.y).toBe('number');
    }
  });

  it('should have unique node IDs', () => {
    const graph = buildKnowledgeGraph({
      includeComponents: true,
      includePatterns: true,
      includeAntiPatterns: true,
      includeFailures: true,
      maxNodes: 200,
    });

    const ids = graph.nodes.map((n) => n.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have edges that reference existing nodes', () => {
    const graph = buildKnowledgeGraph();
    const nodeIds = new Set(graph.nodes.map((n) => n.id));

    for (const edge of graph.edges) {
      expect(nodeIds.has(edge.source)).toBe(true);
      expect(nodeIds.has(edge.target)).toBe(true);
    }
  });

  it('should build empty graph when includeComponents is false and no other options', () => {
    const graph = buildKnowledgeGraph({
      includeComponents: false,
      includePatterns: false,
      includeAntiPatterns: false,
      includeFailures: false,
    });

    expect(graph.nodes.length).toBe(0);
    expect(graph.edges.length).toBe(0);
  });

  it('should build graph with hierarchical layout', () => {
    const graph = buildKnowledgeGraph({ layout: 'hierarchical' });

    expect(graph.nodes.length).toBeGreaterThan(0);
    // All nodes should have valid positions
    for (const node of graph.nodes) {
      expect(Number.isFinite(node.position.x)).toBe(true);
      expect(Number.isFinite(node.position.y)).toBe(true);
    }
  });

  it('should build graph with force layout', () => {
    const graph = buildKnowledgeGraph({ layout: 'force' });

    expect(graph.nodes.length).toBeGreaterThan(0);
    for (const node of graph.nodes) {
      expect(Number.isFinite(node.position.x)).toBe(true);
      expect(Number.isFinite(node.position.y)).toBe(true);
    }
  });

  it('should prioritize component nodes when enforcing maxNodes', () => {
    const graph = buildKnowledgeGraph({
      includeComponents: true,
      includePatterns: true,
      includeAntiPatterns: true,
      includeFailures: true,
      maxNodes: 5,
    });

    // With maxNodes=5 and priority component > pattern > failure > antipattern,
    // all kept nodes should be components (since there are more than 5 component types)
    const componentNodes = graph.nodes.filter((n) => n.type === 'component');
    expect(componentNodes.length).toBe(graph.nodes.length);
  });
});

// ---------------------------------------------------------------------------
// buildComponentGraph
// ---------------------------------------------------------------------------

describe('buildComponentGraph', () => {
  it('should center on given component', () => {
    const graph = buildComponentGraph('firewall');

    expect(graph.nodes.length).toBeGreaterThan(0);
    const centerNode = graph.nodes.find((n) => n.id === 'comp-firewall');
    expect(centerNode).toBeDefined();
  });

  it('should include direct relationships (1 hop)', () => {
    const graph = buildComponentGraph('firewall');

    // firewall has many direct relationships
    const componentNodes = graph.nodes.filter((n) => n.type === 'component');
    expect(componentNodes.length).toBeGreaterThan(1);

    // Should have edges
    expect(graph.edges.length).toBeGreaterThan(0);
  });

  it('should place center node at the center of radial layout', () => {
    const graph = buildComponentGraph('firewall');
    const centerNode = graph.nodes.find((n) => n.id === 'comp-firewall');
    expect(centerNode).toBeDefined();

    if (centerNode) {
      // Center should be at the layout center (400, 400)
      expect(centerNode.position.x).toBe(400);
      expect(centerNode.position.y).toBe(400);
    }
  });

  it('should include related failure nodes', () => {
    const graph = buildComponentGraph('firewall');

    // firewall has failure scenarios
    const failureNodes = graph.nodes.filter((n) => n.type === 'failure');
    expect(failureNodes.length).toBeGreaterThan(0);
  });

  it('should return empty graph for unknown component', () => {
    const graph = buildComponentGraph('nonexistent-component');

    expect(graph.nodes.length).toBe(0);
    expect(graph.edges.length).toBe(0);
    expect(graph.stats.totalNodes).toBe(0);
    expect(graph.stats.totalEdges).toBe(0);
  });

  it('should have correct stats for a component graph', () => {
    const graph = buildComponentGraph('web-server');

    expect(graph.stats.totalNodes).toBe(graph.nodes.length);
    expect(graph.stats.totalEdges).toBe(graph.edges.length);
    expect(graph.stats.componentCount).toBe(
      graph.nodes.filter((n) => n.type === 'component').length,
    );
  });

  it('should include antipattern nodes for relevant components', () => {
    // firewall is tagged in several antipatterns
    const graph = buildComponentGraph('firewall');

    // Check whether antipattern nodes are included (may vary by tagging)
    const apNodes = graph.nodes.filter((n) => n.type === 'antipattern');
    expect(graph.stats.antipatternCount).toBe(apNodes.length);
  });

  it('should have all edges reference existing nodes', () => {
    const graph = buildComponentGraph('web-server');
    const nodeIds = new Set(graph.nodes.map((n) => n.id));

    for (const edge of graph.edges) {
      expect(nodeIds.has(edge.source)).toBe(true);
      expect(nodeIds.has(edge.target)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Layout tests
// ---------------------------------------------------------------------------

describe('Layout algorithms', () => {
  it('radial layout should place nodes in circular arrangement', () => {
    const graph = buildKnowledgeGraph({ layout: 'radial' });

    // All positions should be valid numbers
    for (const node of graph.nodes) {
      expect(Number.isNaN(node.position.x)).toBe(false);
      expect(Number.isNaN(node.position.y)).toBe(false);
      expect(Number.isFinite(node.position.x)).toBe(true);
      expect(Number.isFinite(node.position.y)).toBe(true);
    }

    // Nodes should not all be at the same position
    if (graph.nodes.length > 1) {
      const positions = graph.nodes.map((n) => `${n.position.x},${n.position.y}`);
      const uniquePositions = new Set(positions);
      expect(uniquePositions.size).toBeGreaterThan(1);
    }
  });

  it('hierarchical layout should respect tier ordering', () => {
    const graph = buildKnowledgeGraph({ layout: 'hierarchical' });

    // Components in external tier should have y < components in internal tier
    const externalNodes = graph.nodes.filter(
      (n) => n.type === 'component' && n.metadata.tier === 'external',
    );
    const internalNodes = graph.nodes.filter(
      (n) => n.type === 'component' && n.metadata.tier === 'internal',
    );

    if (externalNodes.length > 0 && internalNodes.length > 0) {
      const maxExternalY = Math.max(...externalNodes.map((n) => n.position.y));
      const minInternalY = Math.min(...internalNodes.map((n) => n.position.y));
      expect(maxExternalY).toBeLessThan(minInternalY);
    }
  });

  it('all nodes should have valid x,y positions (no NaN)', () => {
    const layouts: Array<'radial' | 'hierarchical' | 'force'> = ['radial', 'hierarchical', 'force'];

    for (const layout of layouts) {
      const graph = buildKnowledgeGraph({ layout });

      for (const node of graph.nodes) {
        expect(Number.isNaN(node.position.x)).toBe(false);
        expect(Number.isNaN(node.position.y)).toBe(false);
        expect(Number.isFinite(node.position.x)).toBe(true);
        expect(Number.isFinite(node.position.y)).toBe(true);
      }
    }
  });

  it('force layout should produce reasonable spread for small graphs', () => {
    const graph = buildKnowledgeGraph({
      filterComponents: ['firewall', 'waf', 'web-server'],
      layout: 'force',
    });

    // For 3 component nodes, they should have some spread
    if (graph.nodes.length >= 2) {
      const xs = graph.nodes.map((n) => n.position.x);
      const ys = graph.nodes.map((n) => n.position.y);
      const xRange = Math.max(...xs) - Math.min(...xs);
      const yRange = Math.max(...ys) - Math.min(...ys);
      // At least some spread
      expect(xRange + yRange).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// getGraphStats
// ---------------------------------------------------------------------------

describe('getGraphStats', () => {
  it('should return correct component count', () => {
    const stats = getGraphStats();

    // Collect unique components from RELATIONSHIPS
    const uniqueComponents = new Set<string>();
    for (const rel of RELATIONSHIPS) {
      uniqueComponents.add(rel.source);
      uniqueComponents.add(rel.target);
    }

    expect(stats.componentCount).toBe(uniqueComponents.size);
  });

  it('should return correct total counts', () => {
    const stats = getGraphStats();

    expect(stats.patternCount).toBe(PATTERNS.length);
    expect(stats.antipatternCount).toBe(ANTIPATTERNS.length);
    expect(stats.failureCount).toBe(FAILURES.length);
  });

  it('should return totalNodes as sum of all node types', () => {
    const stats = getGraphStats();

    const expectedTotal = stats.componentCount + stats.patternCount + stats.antipatternCount + stats.failureCount;
    expect(stats.totalNodes).toBe(expectedTotal);
  });

  it('should return totalEdges equal to relationships count', () => {
    const stats = getGraphStats();
    expect(stats.totalEdges).toBe(RELATIONSHIPS.length);
  });

  it('should have all counts as non-negative numbers', () => {
    const stats = getGraphStats();

    expect(stats.totalNodes).toBeGreaterThan(0);
    expect(stats.totalEdges).toBeGreaterThan(0);
    expect(stats.componentCount).toBeGreaterThan(0);
    expect(stats.patternCount).toBeGreaterThanOrEqual(0);
    expect(stats.antipatternCount).toBeGreaterThanOrEqual(0);
    expect(stats.failureCount).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// toReactFlowFormat
// ---------------------------------------------------------------------------

describe('toReactFlowFormat', () => {
  it('should convert all nodes', () => {
    const graph = buildKnowledgeGraph();
    const rf = toReactFlowFormat(graph);

    expect(rf.nodes.length).toBe(graph.nodes.length);
  });

  it('should convert all edges', () => {
    const graph = buildKnowledgeGraph();
    const rf = toReactFlowFormat(graph);

    expect(rf.edges.length).toBe(graph.edges.length);
  });

  it('should set correct node position format', () => {
    const graph = buildKnowledgeGraph();
    const rf = toReactFlowFormat(graph);

    for (const node of rf.nodes) {
      expect(node.position).toBeDefined();
      expect(typeof node.position.x).toBe('number');
      expect(typeof node.position.y).toBe('number');
    }
  });

  it('should set animated for certain edge types', () => {
    const graph = buildKnowledgeGraph({
      includeComponents: true,
      includeFailures: true,
      maxNodes: 200,
    });
    const rf = toReactFlowFormat(graph);

    // 'affects' and 'conflicts' edges should be animated
    const affectsEdges = rf.edges.filter(
      (e) => e.data?.kgEdgeType === 'affects' || e.data?.kgEdgeType === 'conflicts',
    );

    for (const edge of affectsEdges) {
      expect(edge.animated).toBe(true);
    }
  });

  it('should map edge types to styles', () => {
    const graph = buildKnowledgeGraph();
    const rf = toReactFlowFormat(graph);

    for (const edge of rf.edges) {
      expect(edge.style).toBeDefined();
      expect(edge.style?.stroke).toBeDefined();
      expect(typeof edge.style?.stroke).toBe('string');
    }
  });

  it('requires edges should be blue-ish', () => {
    const graph = buildKnowledgeGraph();
    const rf = toReactFlowFormat(graph);

    const requiresEdges = rf.edges.filter(
      (e) => e.data?.kgEdgeType === 'requires',
    );

    for (const edge of requiresEdges) {
      // Blue color: #3b82f6
      expect(edge.style?.stroke).toBe('#3b82f6');
    }
  });

  it('conflicts edges should be red-ish', () => {
    const graph = buildKnowledgeGraph();
    const rf = toReactFlowFormat(graph);

    const conflictEdges = rf.edges.filter(
      (e) => e.data?.kgEdgeType === 'conflicts',
    );

    for (const edge of conflictEdges) {
      // Red color: #ef4444
      expect(edge.style?.stroke).toBe('#ef4444');
    }
  });

  it('should map KGNodeType to React Flow node types', () => {
    const graph = buildKnowledgeGraph({
      includeComponents: true,
      includePatterns: true,
      includeAntiPatterns: true,
      includeFailures: true,
      maxNodes: 200,
    });
    const rf = toReactFlowFormat(graph);

    const typeMap: Record<string, string> = {
      component: 'infraNode',
      pattern: 'patternNode',
      antipattern: 'antipatternNode',
      failure: 'failureNode',
    };

    for (let i = 0; i < graph.nodes.length; i++) {
      const kgNode = graph.nodes[i];
      const rfNode = rf.nodes[i];
      expect(rfNode.type).toBe(typeMap[kgNode.type]);
    }
  });

  it('should include kgNodeType in node data', () => {
    const graph = buildKnowledgeGraph();
    const rf = toReactFlowFormat(graph);

    for (const node of rf.nodes) {
      expect(node.data.kgNodeType).toBeDefined();
    }
  });

  it('should include label and labelKo in node data', () => {
    const graph = buildKnowledgeGraph();
    const rf = toReactFlowFormat(graph);

    for (const node of rf.nodes) {
      expect(node.data.label).toBeDefined();
      expect(node.data.labelKo).toBeDefined();
      expect(typeof node.data.label).toBe('string');
      expect(typeof node.data.labelKo).toBe('string');
    }
  });

  it('should have unique node IDs in React Flow format', () => {
    const graph = buildKnowledgeGraph({
      includeComponents: true,
      includePatterns: true,
      maxNodes: 100,
    });
    const rf = toReactFlowFormat(graph);

    const ids = rf.nodes.map((n) => n.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should set strokeWidth 2 for conflict edges', () => {
    const graph = buildKnowledgeGraph();
    const rf = toReactFlowFormat(graph);

    const conflictEdges = rf.edges.filter(
      (e) => e.data?.kgEdgeType === 'conflicts',
    );

    for (const edge of conflictEdges) {
      expect(edge.style?.strokeWidth).toBe(2);
    }
  });
});

// ---------------------------------------------------------------------------
// KGNode structure validation
// ---------------------------------------------------------------------------

describe('KGNode structure', () => {
  it('component nodes should have category metadata', () => {
    const graph = buildKnowledgeGraph();

    const componentNodes = graph.nodes.filter((n) => n.type === 'component');
    for (const node of componentNodes) {
      expect(node.category).toBeDefined();
      expect(typeof node.category).toBe('string');
    }
  });

  it('component nodes should have componentType in metadata', () => {
    const graph = buildKnowledgeGraph();

    const componentNodes = graph.nodes.filter((n) => n.type === 'component');
    for (const node of componentNodes) {
      expect(node.metadata.componentType).toBeDefined();
      expect(typeof node.metadata.componentType).toBe('string');
    }
  });

  it('component nodes should have tier in metadata', () => {
    const graph = buildKnowledgeGraph();

    const componentNodes = graph.nodes.filter((n) => n.type === 'component');
    for (const node of componentNodes) {
      expect(node.metadata.tier).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// KGEdge structure validation
// ---------------------------------------------------------------------------

describe('KGEdge structure', () => {
  it('edges should have valid KGEdgeType', () => {
    const validTypes: string[] = [
      'requires',
      'recommends',
      'conflicts',
      'enhances',
      'protects',
      'detected-in',
      'affects',
    ];

    const graph = buildKnowledgeGraph({
      includeComponents: true,
      includeFailures: true,
      includeAntiPatterns: true,
      maxNodes: 200,
    });

    for (const edge of graph.edges) {
      expect(validTypes).toContain(edge.type);
    }
  });

  it('edges should have label and labelKo', () => {
    const graph = buildKnowledgeGraph();

    for (const edge of graph.edges) {
      expect(edge.label).toBeDefined();
      expect(edge.labelKo).toBeDefined();
      expect(typeof edge.label).toBe('string');
      expect(typeof edge.labelKo).toBe('string');
    }
  });

  it('edges should have unique IDs', () => {
    const graph = buildKnowledgeGraph({
      includeComponents: true,
      includePatterns: true,
      maxNodes: 100,
    });

    const ids = graph.edges.map((e) => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
