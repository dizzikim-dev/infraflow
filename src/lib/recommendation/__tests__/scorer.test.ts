import { describe, it, expect } from 'vitest';
import type { InfraNodeSpec, InfraSpec, InfraNodeType } from '@/types/infra';
import type { ProductNode } from '@/lib/knowledge/vendorCatalog/types';
import { scoreProduct } from '../scorer';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

function makeProduct(overrides: Partial<ProductNode> = {}): ProductNode {
  return {
    nodeId: 'test-product-001',
    depth: 2,
    depthLabel: 'Model',
    depthLabelKo: '모델',
    name: 'Test Product',
    nameKo: '테스트 제품',
    description: 'A test product',
    descriptionKo: '테스트 제품 설명',
    sourceUrl: 'https://example.com/product',
    children: [],
    ...overrides,
  };
}

function makeNode(overrides: Partial<InfraNodeSpec> = {}): InfraNodeSpec {
  return {
    id: 'node-1',
    type: 'firewall' as InfraNodeType,
    label: 'Primary Firewall',
    tier: 'dmz',
    ...overrides,
  };
}

function makeSpec(nodes: InfraNodeSpec[] = []): InfraSpec {
  return {
    nodes: nodes.length > 0 ? nodes : [makeNode()],
    connections: [],
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('scoreProduct', () => {
  // -- typeMatch scoring --

  describe('typeMatch', () => {
    it('should score 40 for exact type match', () => {
      const product = makeProduct({
        infraNodeTypes: ['firewall'] as InfraNodeType[],
      });
      const node = makeNode({ type: 'firewall' });
      const score = scoreProduct(product, node, makeSpec([node]));

      expect(score.breakdown.typeMatch).toBe(40);
    });

    it('should score 0 for no type match and no category match', () => {
      const product = makeProduct({
        infraNodeTypes: ['web-server'] as InfraNodeType[],
      });
      const node = makeNode({ type: 'firewall' });
      const score = scoreProduct(product, node, makeSpec([node]));

      expect(score.breakdown.typeMatch).toBe(0);
    });

    it('should score 20 for same category (partial) match', () => {
      // Both are in the 'security' category
      const product = makeProduct({
        infraNodeTypes: ['waf'] as InfraNodeType[],
      });
      const node = makeNode({ type: 'firewall' });
      const score = scoreProduct(product, node, makeSpec([node]));

      expect(score.breakdown.typeMatch).toBe(20);
    });

    it('should score 40 when product maps to multiple types including the exact type', () => {
      const product = makeProduct({
        infraNodeTypes: ['switch-l2', 'switch-l3'] as InfraNodeType[],
      });
      const node = makeNode({ type: 'switch-l3' });
      const score = scoreProduct(product, node, makeSpec([node]));

      expect(score.breakdown.typeMatch).toBe(40);
    });

    it('should score 0 when product has no infraNodeTypes', () => {
      const product = makeProduct({ infraNodeTypes: undefined });
      const node = makeNode({ type: 'firewall' });
      const score = scoreProduct(product, node, makeSpec([node]));

      expect(score.breakdown.typeMatch).toBe(0);
    });

    it('should score 0 when product has empty infraNodeTypes array', () => {
      const product = makeProduct({ infraNodeTypes: [] });
      const node = makeNode({ type: 'firewall' });
      const score = scoreProduct(product, node, makeSpec([node]));

      expect(score.breakdown.typeMatch).toBe(0);
    });

    it('should score 20 for ids-ips product matching against firewall node (same security category)', () => {
      const product = makeProduct({
        infraNodeTypes: ['ids-ips'] as InfraNodeType[],
      });
      const node = makeNode({ type: 'firewall' });
      const score = scoreProduct(product, node, makeSpec([node]));

      expect(score.breakdown.typeMatch).toBe(20);
    });

    it('should score 20 for network category partial match (router vs switch)', () => {
      const product = makeProduct({
        infraNodeTypes: ['router'] as InfraNodeType[],
      });
      const node = makeNode({ type: 'load-balancer' });
      const score = scoreProduct(product, node, makeSpec([node]));

      expect(score.breakdown.typeMatch).toBe(20);
    });
  });

  // -- architectureRoleFit scoring --

  describe('architectureRoleFit', () => {
    it('should score high when role matches DMZ tier keywords', () => {
      const product = makeProduct({
        infraNodeTypes: ['firewall'] as InfraNodeType[],
        architectureRole: 'Perimeter Edge Firewall',
      });
      const node = makeNode({ type: 'firewall', tier: 'dmz' });
      const score = scoreProduct(product, node, makeSpec([node]));

      // 'perimeter' and 'edge' are both DMZ keywords -> 25 points
      expect(score.breakdown.architectureRoleFit).toBe(25);
    });

    it('should score 15 when role has single tier keyword match', () => {
      const product = makeProduct({
        infraNodeTypes: ['switch-l3'] as InfraNodeType[],
        architectureRole: 'Distribution Layer Switch',
      });
      const node = makeNode({ type: 'switch-l3', tier: 'internal' });
      const score = scoreProduct(product, node, makeSpec([node]));

      // 'distribution' is the only internal keyword -> 15 points
      expect(score.breakdown.architectureRoleFit).toBe(15);
    });

    it('should score 0 when product has no architectureRole', () => {
      const product = makeProduct({
        infraNodeTypes: ['firewall'] as InfraNodeType[],
        architectureRole: undefined,
      });
      const node = makeNode({ type: 'firewall', tier: 'dmz' });
      const score = scoreProduct(product, node, makeSpec([node]));

      expect(score.breakdown.architectureRoleFit).toBe(0);
    });

    it('should score 0 when role does not match any tier keywords', () => {
      const product = makeProduct({
        infraNodeTypes: ['firewall'] as InfraNodeType[],
        architectureRole: 'Special Custom Appliance',
      });
      const node = makeNode({ type: 'firewall', tier: 'dmz' });
      const score = scoreProduct(product, node, makeSpec([node]));

      expect(score.breakdown.architectureRoleFit).toBe(0);
    });

    it('should score based on data tier keywords for data tier', () => {
      const product = makeProduct({
        infraNodeTypes: ['switch-l3'] as InfraNodeType[],
        architectureRole: 'Data Center Spine / Leaf Switch',
      });
      const node = makeNode({ type: 'switch-l3', tier: 'data' });
      const score = scoreProduct(product, node, makeSpec([node]));

      // 'data center' and 'spine' and 'leaf' are data tier keywords -> 25
      expect(score.breakdown.architectureRoleFit).toBe(25);
    });

    it('should default to internal tier when no tier is specified', () => {
      const product = makeProduct({
        infraNodeTypes: ['switch-l3'] as InfraNodeType[],
        architectureRole: 'Core Backbone Switch',
      });
      // No tier specified -- defaults to 'internal'
      const node = makeNode({ type: 'switch-l3', tier: undefined });
      const score = scoreProduct(product, node, makeSpec([node]));

      // 'core' and 'backbone' are internal keywords -> 25
      expect(score.breakdown.architectureRoleFit).toBe(25);
    });

    it('should match external tier keywords', () => {
      const product = makeProduct({
        infraNodeTypes: ['router'] as InfraNodeType[],
        architectureRole: 'Internet Edge WAN Gateway',
      });
      const node = makeNode({ type: 'router', tier: 'external' });
      const score = scoreProduct(product, node, makeSpec([node]));

      // 'internet', 'edge', 'wan', 'gateway' all external keywords -> 25
      expect(score.breakdown.architectureRoleFit).toBe(25);
    });

    it('should be case-insensitive for role matching', () => {
      const product = makeProduct({
        infraNodeTypes: ['firewall'] as InfraNodeType[],
        architectureRole: 'PERIMETER EDGE FIREWALL',
      });
      const node = makeNode({ type: 'firewall', tier: 'dmz' });
      const score = scoreProduct(product, node, makeSpec([node]));

      expect(score.breakdown.architectureRoleFit).toBe(25);
    });
  });

  // -- useCaseOverlap scoring --

  describe('useCaseOverlap', () => {
    it('should score based on keyword overlap with spec node labels and types', () => {
      const product = makeProduct({
        infraNodeTypes: ['firewall'] as InfraNodeType[],
        recommendedFor: [
          'Campus core aggregation',
          'Perimeter firewall deployment',
          'VXLAN fabric spine node',
        ],
      });
      const node = makeNode({ type: 'firewall', label: 'Campus Firewall' });
      const spec = makeSpec([
        node,
        { id: 'n2', type: 'switch-l3' as InfraNodeType, label: 'Core Switch' },
      ]);

      const score = scoreProduct(product, node, spec);
      expect(score.breakdown.useCaseOverlap).toBeGreaterThan(0);
      expect(score.breakdown.useCaseOverlap).toBeLessThanOrEqual(20);
    });

    it('should score 0 when product has no recommendedFor', () => {
      const product = makeProduct({
        infraNodeTypes: ['firewall'] as InfraNodeType[],
        recommendedFor: undefined,
      });
      const node = makeNode();
      const score = scoreProduct(product, node, makeSpec([node]));

      expect(score.breakdown.useCaseOverlap).toBe(0);
    });

    it('should score 0 when product has empty recommendedFor', () => {
      const product = makeProduct({
        infraNodeTypes: ['firewall'] as InfraNodeType[],
        recommendedFor: [],
      });
      const node = makeNode();
      const score = scoreProduct(product, node, makeSpec([node]));

      expect(score.breakdown.useCaseOverlap).toBe(0);
    });

    it('should cap at 20 even with many matches', () => {
      const product = makeProduct({
        infraNodeTypes: ['firewall'] as InfraNodeType[],
        recommendedFor: [
          'Firewall deployment',
          'Campus network protection',
          'Switch interconnection',
          'Router peering',
          'Web server protection',
          'Load balancer integration',
        ],
      });
      const spec = makeSpec([
        { id: 'n1', type: 'firewall' as InfraNodeType, label: 'Firewall' },
        { id: 'n2', type: 'switch-l3' as InfraNodeType, label: 'Campus Switch' },
        { id: 'n3', type: 'router' as InfraNodeType, label: 'Router' },
        { id: 'n4', type: 'web-server' as InfraNodeType, label: 'Web Server' },
        { id: 'n5', type: 'load-balancer' as InfraNodeType, label: 'Load Balancer' },
      ]);
      const node = spec.nodes[0];

      const score = scoreProduct(product, node, spec);
      expect(score.breakdown.useCaseOverlap).toBeLessThanOrEqual(20);
    });

    it('should score 5 per each matching use case', () => {
      // 1 use case with 1 match -> 5 points
      const product = makeProduct({
        infraNodeTypes: ['firewall'] as InfraNodeType[],
        recommendedFor: ['Firewall deployment'],
      });
      const node = makeNode({ type: 'firewall', label: 'FW' });
      const spec = makeSpec([node]);

      const score = scoreProduct(product, node, spec);
      // 'firewall' from type matches 'Firewall deployment'
      expect(score.breakdown.useCaseOverlap).toBe(5);
    });

    it('should match against node type parts split by hyphens', () => {
      const product = makeProduct({
        infraNodeTypes: ['switch-l3'] as InfraNodeType[],
        recommendedFor: ['Switch infrastructure'],
      });
      const node = makeNode({ type: 'switch-l3' as InfraNodeType, label: 'L3 SW' });
      const spec = makeSpec([node]);

      const score = scoreProduct(product, node, spec);
      // 'switch' from splitting 'switch-l3' matches 'Switch infrastructure'
      expect(score.breakdown.useCaseOverlap).toBeGreaterThan(0);
    });
  });

  // -- haFeatureMatch scoring --

  describe('haFeatureMatch', () => {
    it('should score 10 when product has HA features but no redundancy in spec', () => {
      const product = makeProduct({
        infraNodeTypes: ['firewall'] as InfraNodeType[],
        haFeatures: ['SSO (Stateful Switchover)', 'NSF (Non-Stop Forwarding)'],
      });
      const node = makeNode();
      const spec = makeSpec([node]);

      const score = scoreProduct(product, node, spec);
      expect(score.breakdown.haFeatureMatch).toBe(10);
    });

    it('should score 15 when product has HA features and spec has redundancy', () => {
      const product = makeProduct({
        infraNodeTypes: ['firewall'] as InfraNodeType[],
        haFeatures: ['SSO', 'NSF', 'ISSU'],
      });
      const fw1 = makeNode({ id: 'fw-1', type: 'firewall', label: 'Firewall 1' });
      const fw2 = makeNode({ id: 'fw-2', type: 'firewall', label: 'Firewall 2' });
      const spec = makeSpec([fw1, fw2]);

      const score = scoreProduct(product, fw1, spec);
      expect(score.breakdown.haFeatureMatch).toBe(15);
    });

    it('should score 0 when product has no HA features', () => {
      const product = makeProduct({
        infraNodeTypes: ['firewall'] as InfraNodeType[],
        haFeatures: undefined,
      });
      const node = makeNode();
      const score = scoreProduct(product, node, makeSpec([node]));

      expect(score.breakdown.haFeatureMatch).toBe(0);
    });

    it('should score 0 when product has empty HA features', () => {
      const product = makeProduct({
        infraNodeTypes: ['firewall'] as InfraNodeType[],
        haFeatures: [],
      });
      const node = makeNode();
      const score = scoreProduct(product, node, makeSpec([node]));

      expect(score.breakdown.haFeatureMatch).toBe(0);
    });

    it('should detect redundancy from any node type having 2+ instances', () => {
      const product = makeProduct({
        infraNodeTypes: ['load-balancer'] as InfraNodeType[],
        haFeatures: ['Active-Standby'],
      });
      const lb = makeNode({ id: 'lb-1', type: 'load-balancer', label: 'LB' });
      // Redundancy comes from two switches, not two LBs
      const spec = makeSpec([
        lb,
        { id: 'sw-1', type: 'switch-l3' as InfraNodeType, label: 'Switch 1' },
        { id: 'sw-2', type: 'switch-l3' as InfraNodeType, label: 'Switch 2' },
      ]);

      const score = scoreProduct(product, lb, spec);
      // Has HA features (10) + redundancy detected in spec (5) = 15
      expect(score.breakdown.haFeatureMatch).toBe(15);
    });

    it('should not exceed 15 even with many HA features and redundancy', () => {
      const product = makeProduct({
        infraNodeTypes: ['firewall'] as InfraNodeType[],
        haFeatures: ['SSO', 'NSF', 'ISSU', 'GR', 'BFD', 'VRRP'],
      });
      const fw1 = makeNode({ id: 'fw-1', type: 'firewall', label: 'FW 1' });
      const fw2 = makeNode({ id: 'fw-2', type: 'firewall', label: 'FW 2' });
      const fw3 = makeNode({ id: 'fw-3', type: 'firewall', label: 'FW 3' });
      const spec = makeSpec([fw1, fw2, fw3]);

      const score = scoreProduct(product, fw1, spec);
      expect(score.breakdown.haFeatureMatch).toBeLessThanOrEqual(15);
    });
  });

  // -- Overall scoring --

  describe('overall score', () => {
    it('should be the sum of all breakdown values', () => {
      const product = makeProduct({
        infraNodeTypes: ['firewall'] as InfraNodeType[],
        architectureRole: 'Perimeter Edge Firewall',
        recommendedFor: ['Firewall deployment'],
        haFeatures: ['SSO'],
      });
      const node = makeNode({ type: 'firewall', tier: 'dmz' });
      const spec = makeSpec([node]);

      const score = scoreProduct(product, node, spec);
      const expectedOverall =
        score.breakdown.typeMatch +
        score.breakdown.architectureRoleFit +
        score.breakdown.useCaseOverlap +
        score.breakdown.haFeatureMatch;

      expect(score.overall).toBe(expectedOverall);
    });

    it('should be between 0 and 100', () => {
      // Maximum possible: 40 + 25 + 20 + 15 = 100
      const product = makeProduct({
        infraNodeTypes: ['firewall'] as InfraNodeType[],
        architectureRole: 'Perimeter Edge Firewall',
        recommendedFor: [
          'Firewall deployment',
          'Perimeter security',
          'DMZ protection',
          'Edge defense',
        ],
        haFeatures: ['SSO', 'NSF'],
      });
      const fw1 = makeNode({ id: 'fw-1', type: 'firewall', tier: 'dmz' });
      const fw2 = makeNode({ id: 'fw-2', type: 'firewall', tier: 'dmz' });
      const spec = makeSpec([fw1, fw2]);

      const score = scoreProduct(product, fw1, spec);
      expect(score.overall).toBeGreaterThanOrEqual(0);
      expect(score.overall).toBeLessThanOrEqual(100);
    });

    it('should return 0 for a product with no matching attributes', () => {
      const product = makeProduct({
        infraNodeTypes: ['web-server'] as InfraNodeType[],
        architectureRole: undefined,
        recommendedFor: undefined,
        haFeatures: undefined,
      });
      const node = makeNode({ type: 'firewall', tier: 'dmz' });
      const score = scoreProduct(product, node, makeSpec([node]));

      expect(score.overall).toBe(0);
    });

    it('should achieve maximum 100 with perfect match across all dimensions', () => {
      const product = makeProduct({
        infraNodeTypes: ['firewall'] as InfraNodeType[],
        architectureRole: 'Perimeter Edge DMZ Border Ingress Gateway',
        recommendedFor: [
          'Firewall deployment',
          'Perimeter security',
          'DMZ protection',
          'Edge defense',
        ],
        haFeatures: ['SSO', 'NSF', 'ISSU'],
      });
      // Two firewalls for redundancy bonus, plus extra nodes to maximize use case overlap
      const fw1 = makeNode({ id: 'fw-1', type: 'firewall', tier: 'dmz', label: 'Firewall' });
      const fw2 = makeNode({ id: 'fw-2', type: 'firewall', tier: 'dmz', label: 'Secondary' });
      // Additional nodes whose labels/types match recommendedFor keywords
      const spec = makeSpec([
        fw1, fw2,
        { id: 'n3', type: 'router' as InfraNodeType, label: 'Perimeter Router' },
        { id: 'n4', type: 'web-server' as InfraNodeType, label: 'DMZ Web Server' },
        { id: 'n5', type: 'switch-l3' as InfraNodeType, label: 'Edge Switch' },
      ]);

      const score = scoreProduct(product, fw1, spec);
      // typeMatch=40, architectureRoleFit=25, useCaseOverlap=20, haFeatureMatch=15
      expect(score.overall).toBe(100);
    });

    it('should have only typeMatch when other attributes are missing', () => {
      const product = makeProduct({
        infraNodeTypes: ['firewall'] as InfraNodeType[],
        architectureRole: undefined,
        recommendedFor: undefined,
        haFeatures: undefined,
      });
      const node = makeNode({ type: 'firewall', tier: 'dmz' });
      const score = scoreProduct(product, node, makeSpec([node]));

      expect(score.breakdown.typeMatch).toBe(40);
      expect(score.breakdown.architectureRoleFit).toBe(0);
      expect(score.breakdown.useCaseOverlap).toBe(0);
      expect(score.breakdown.haFeatureMatch).toBe(0);
      expect(score.overall).toBe(40);
    });
  });
});
