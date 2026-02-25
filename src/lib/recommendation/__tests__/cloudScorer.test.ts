/**
 * Recommendation Engine -- Cloud Service Scorer Tests
 */

import { describe, it, expect } from 'vitest';
import { scoreCloudService } from '../cloudScorer';
import type { CloudService } from '@/lib/knowledge/cloudCatalog/types';
import { svcTrust } from '@/lib/knowledge/cloudCatalog/types';
import type { InfraSpec, InfraNodeSpec, InfraNodeType } from '@/types/infra';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeService = (overrides: Partial<CloudService>): CloudService => ({
  id: 'CS-TEST-001',
  provider: 'aws',
  componentType: 'firewall',
  serviceName: 'Test Service',
  serviceNameKo: '테스트 서비스',
  status: 'active',
  features: ['Feature 1', 'Feature 2', 'Feature 3'],
  featuresKo: ['기능 1', '기능 2', '기능 3'],
  pricingTier: 'medium',
  trust: svcTrust('aws'),
  ...overrides,
});

const makeNode = (overrides: Partial<InfraNodeSpec>): InfraNodeSpec => ({
  id: 'node-1',
  type: 'firewall',
  label: 'Firewall',
  ...overrides,
});

const makeSpec = (nodes: InfraNodeSpec[]): InfraSpec => ({
  nodes,
  connections: [],
});

// ---------------------------------------------------------------------------
// Type Match (0-40)
// ---------------------------------------------------------------------------

describe('scoreCloudService -- typeMatch', () => {
  it('should give 40 for exact type match', () => {
    const service = makeService({ componentType: 'firewall' });
    const node = makeNode({ type: 'firewall' });
    const score = scoreCloudService(service, node, makeSpec([node]));
    expect(score.breakdown.typeMatch).toBe(40);
  });

  it('should give 20 for same-category partial match', () => {
    const service = makeService({ componentType: 'waf' });
    const node = makeNode({ type: 'firewall' });
    const score = scoreCloudService(service, node, makeSpec([node]));
    expect(score.breakdown.typeMatch).toBe(20);
  });

  it('should give 0 for completely unrelated types', () => {
    const service = makeService({ componentType: 'dns' });
    const node = makeNode({ type: 'firewall' });
    const score = scoreCloudService(service, node, makeSpec([node]));
    expect(score.breakdown.typeMatch).toBe(0);
  });

  it('should give 20 for ids-ips service with firewall node (same security category)', () => {
    const service = makeService({ componentType: 'ids-ips' });
    const node = makeNode({ type: 'firewall' });
    const score = scoreCloudService(service, node, makeSpec([node]));
    expect(score.breakdown.typeMatch).toBe(20);
  });

  it('should give 20 for network category partial match (load-balancer vs router)', () => {
    const service = makeService({ componentType: 'load-balancer' });
    const node = makeNode({ type: 'router' });
    const score = scoreCloudService(service, node, makeSpec([node]));
    expect(score.breakdown.typeMatch).toBe(20);
  });

  it('should give 20 for storage category partial match (cache vs object-storage)', () => {
    const service = makeService({ componentType: 'cache' });
    const node = makeNode({ type: 'object-storage' });
    const score = scoreCloudService(service, node, makeSpec([node]));
    expect(score.breakdown.typeMatch).toBe(20);
  });

  it('should give 0 for cross-category mismatch (compute vs security)', () => {
    const service = makeService({ componentType: 'web-server' });
    const node = makeNode({ type: 'firewall' });
    const score = scoreCloudService(service, node, makeSpec([node]));
    expect(score.breakdown.typeMatch).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Architecture Role Fit (0-25)
// ---------------------------------------------------------------------------

describe('scoreCloudService -- architectureRoleFit', () => {
  it('should give 25 for multiple tier keyword matches', () => {
    const service = makeService({
      architectureRole: 'VPC perimeter and edge security gateway',
    });
    const node = makeNode({ type: 'firewall', tier: 'external' });
    const score = scoreCloudService(service, node, makeSpec([node]));
    expect(score.breakdown.architectureRoleFit).toBe(25);
  });

  it('should give 15 for single tier keyword match', () => {
    const service = makeService({
      architectureRole: 'Edge layer protection',
    });
    const node = makeNode({ type: 'firewall', tier: 'external' });
    const score = scoreCloudService(service, node, makeSpec([node]));
    expect(score.breakdown.architectureRoleFit).toBe(15);
  });

  it('should give 0 when no architectureRole is set', () => {
    const service = makeService({ architectureRole: undefined });
    const node = makeNode({ type: 'firewall' });
    const score = scoreCloudService(service, node, makeSpec([node]));
    expect(score.breakdown.architectureRoleFit).toBe(0);
  });

  it('should give 0 when role keywords do not match tier', () => {
    const service = makeService({
      architectureRole: 'Data center storage tier',
    });
    const node = makeNode({ type: 'firewall', tier: 'external' });
    const score = scoreCloudService(service, node, makeSpec([node]));
    expect(score.breakdown.architectureRoleFit).toBe(0);
  });

  it('should match data tier keywords', () => {
    const service = makeService({
      architectureRole: 'Data center database spine leaf tier',
    });
    const node = makeNode({ type: 'db-server' as InfraNodeType, tier: 'data' });
    const score = scoreCloudService(service, node, makeSpec([node]));
    expect(score.breakdown.architectureRoleFit).toBe(25);
  });

  it('should default to internal tier when no tier specified', () => {
    const service = makeService({
      architectureRole: 'Core backbone aggregation switch',
    });
    const node = makeNode({ type: 'switch-l3' as InfraNodeType, tier: undefined });
    const score = scoreCloudService(service, node, makeSpec([node]));
    // 'core', 'backbone', 'aggregation' are all internal keywords -> 25
    expect(score.breakdown.architectureRoleFit).toBe(25);
  });

  it('should be case-insensitive for role matching', () => {
    const service = makeService({
      architectureRole: 'PERIMETER EDGE DMZ GATEWAY',
    });
    const node = makeNode({ type: 'firewall', tier: 'dmz' });
    const score = scoreCloudService(service, node, makeSpec([node]));
    expect(score.breakdown.architectureRoleFit).toBe(25);
  });
});

// ---------------------------------------------------------------------------
// Use Case Overlap (0-20)
// ---------------------------------------------------------------------------

describe('scoreCloudService -- useCaseOverlap', () => {
  it('should count keyword matches from recommendedFor', () => {
    const service = makeService({
      recommendedFor: ['VPC perimeter security', 'Compliance environments', 'Firewall management'],
    });
    const node = makeNode({ type: 'firewall', label: 'VPC Firewall' });
    const score = scoreCloudService(service, node, makeSpec([node]));
    // 'firewall' appears in recommendedFor[2] and as node type, 'vpc' in [0] and label
    expect(score.breakdown.useCaseOverlap).toBeGreaterThanOrEqual(5);
  });

  it('should cap at 20 even with many matches', () => {
    const service = makeService({
      recommendedFor: ['Web hosting', 'App deployment', 'Server management', 'HTTP apps', 'Container hosting'],
    });
    const node = makeNode({ type: 'web-server' as InfraNodeType, label: 'Web App Server' });
    const score = scoreCloudService(service, node, makeSpec([node]));
    expect(score.breakdown.useCaseOverlap).toBeLessThanOrEqual(20);
  });

  it('should give 0 when recommendedFor is empty', () => {
    const service = makeService({ recommendedFor: undefined });
    const node = makeNode({ type: 'firewall' });
    const score = scoreCloudService(service, node, makeSpec([node]));
    expect(score.breakdown.useCaseOverlap).toBe(0);
  });

  it('should give 0 when recommendedFor is an empty array', () => {
    const service = makeService({ recommendedFor: [] });
    const node = makeNode({ type: 'firewall' });
    const score = scoreCloudService(service, node, makeSpec([node]));
    expect(score.breakdown.useCaseOverlap).toBe(0);
  });

  it('should award 5 points per matching use case', () => {
    const service = makeService({
      recommendedFor: ['Firewall deployment'],
    });
    const node = makeNode({ type: 'firewall', label: 'FW' });
    const score = scoreCloudService(service, node, makeSpec([node]));
    // 'firewall' from type matches 'Firewall deployment'
    expect(score.breakdown.useCaseOverlap).toBe(5);
  });

  it('should match use case keywords across multiple spec nodes', () => {
    const service = makeService({
      recommendedFor: ['Database workloads', 'Web serving', 'Cache management'],
    });
    const node = makeNode({ type: 'db-server' as InfraNodeType, label: 'Database' });
    const spec = makeSpec([
      node,
      { id: 'web-1', type: 'web-server' as InfraNodeType, label: 'Web Server' },
      { id: 'cache-1', type: 'cache' as InfraNodeType, label: 'Redis Cache' },
    ]);
    const score = scoreCloudService(service, node, spec);
    // Multiple use cases should match
    expect(score.breakdown.useCaseOverlap).toBeGreaterThanOrEqual(10);
  });
});

// ---------------------------------------------------------------------------
// Compliance Fit (0-15)
// ---------------------------------------------------------------------------

describe('scoreCloudService -- complianceFit', () => {
  it('should give 5 per matching compliance framework', () => {
    const service = makeService({
      complianceCertifications: ['SOC 2', 'ISO 27001', 'PCI DSS', 'HIPAA'],
    });
    const node = makeNode({});
    const score = scoreCloudService(
      service, node, makeSpec([node]),
      ['SOC 2', 'HIPAA'],
    );
    expect(score.breakdown.complianceFit).toBe(10);
  });

  it('should cap at 15', () => {
    const service = makeService({
      complianceCertifications: ['SOC 2', 'ISO 27001', 'PCI DSS', 'HIPAA', 'FedRAMP'],
    });
    const node = makeNode({});
    const score = scoreCloudService(
      service, node, makeSpec([node]),
      ['SOC 2', 'ISO 27001', 'PCI DSS', 'HIPAA'],
    );
    expect(score.breakdown.complianceFit).toBe(15);
  });

  it('should give 0 when no compliance requirements specified', () => {
    const service = makeService({
      complianceCertifications: ['SOC 2'],
    });
    const node = makeNode({});
    const score = scoreCloudService(service, node, makeSpec([node]));
    expect(score.breakdown.complianceFit).toBe(0);
  });

  it('should give 0 when service has no certifications', () => {
    const service = makeService({ complianceCertifications: undefined });
    const node = makeNode({});
    const score = scoreCloudService(
      service, node, makeSpec([node]),
      ['SOC 2'],
    );
    expect(score.breakdown.complianceFit).toBe(0);
  });

  it('should be case-insensitive', () => {
    const service = makeService({
      complianceCertifications: ['SOC 2', 'hipaa'],
    });
    const node = makeNode({});
    const score = scoreCloudService(
      service, node, makeSpec([node]),
      ['soc 2', 'HIPAA'],
    );
    expect(score.breakdown.complianceFit).toBe(10);
  });

  it('should give 0 when compliance requirements are an empty array', () => {
    const service = makeService({
      complianceCertifications: ['SOC 2'],
    });
    const node = makeNode({});
    const score = scoreCloudService(
      service, node, makeSpec([node]),
      [],
    );
    expect(score.breakdown.complianceFit).toBe(0);
  });

  it('should give 0 when service certifications are empty array', () => {
    const service = makeService({
      complianceCertifications: [],
    });
    const node = makeNode({});
    const score = scoreCloudService(
      service, node, makeSpec([node]),
      ['SOC 2'],
    );
    expect(score.breakdown.complianceFit).toBe(0);
  });

  it('should give 5 for a single matching framework', () => {
    const service = makeService({
      complianceCertifications: ['SOC 2'],
    });
    const node = makeNode({});
    const score = scoreCloudService(
      service, node, makeSpec([node]),
      ['SOC 2'],
    );
    expect(score.breakdown.complianceFit).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// Overall Score
// ---------------------------------------------------------------------------

describe('scoreCloudService -- overall', () => {
  it('should sum all dimensions', () => {
    const service = makeService({
      componentType: 'firewall',
      architectureRole: 'VPC perimeter and edge gateway',
      recommendedFor: ['Firewall management', 'Security'],
      complianceCertifications: ['SOC 2', 'HIPAA'],
    });
    const node = makeNode({ type: 'firewall', tier: 'external' });
    const score = scoreCloudService(
      service, node, makeSpec([node]),
      ['SOC 2'],
    );
    expect(score.overall).toBe(
      score.breakdown.typeMatch +
      score.breakdown.architectureRoleFit +
      score.breakdown.useCaseOverlap +
      score.breakdown.complianceFit,
    );
  });

  it('should not exceed 100', () => {
    const service = makeService({
      componentType: 'firewall',
      architectureRole: 'VPC perimeter and edge internet gateway',
      recommendedFor: ['Firewall', 'VPC security', 'Perimeter', 'Compliance', 'Network'],
      complianceCertifications: ['SOC 2', 'ISO 27001', 'PCI DSS', 'HIPAA', 'FedRAMP'],
    });
    const node = makeNode({ type: 'firewall', tier: 'external' });
    const score = scoreCloudService(
      service, node, makeSpec([node]),
      ['SOC 2', 'ISO 27001', 'PCI DSS'],
    );
    expect(score.overall).toBeLessThanOrEqual(100);
  });

  it('should return 0 for completely unrelated service', () => {
    const service = makeService({
      componentType: 'web-server',
      architectureRole: undefined,
      recommendedFor: undefined,
      complianceCertifications: undefined,
    });
    const node = makeNode({ type: 'firewall', tier: 'dmz' });
    const score = scoreCloudService(service, node, makeSpec([node]));
    expect(score.overall).toBe(0);
  });

  it('should have only typeMatch when other attributes are missing', () => {
    const service = makeService({
      componentType: 'firewall',
      architectureRole: undefined,
      recommendedFor: undefined,
      complianceCertifications: undefined,
    });
    const node = makeNode({ type: 'firewall' });
    const score = scoreCloudService(service, node, makeSpec([node]));

    expect(score.breakdown.typeMatch).toBe(40);
    expect(score.breakdown.architectureRoleFit).toBe(0);
    expect(score.breakdown.useCaseOverlap).toBe(0);
    expect(score.breakdown.complianceFit).toBe(0);
    expect(score.overall).toBe(40);
  });

  it('should achieve maximum 100 with perfect match across all dimensions', () => {
    const service = makeService({
      componentType: 'firewall',
      architectureRole: 'Perimeter Edge DMZ Border Ingress Gateway',
      recommendedFor: [
        'Firewall deployment',
        'Perimeter security',
        'DMZ protection',
        'Edge defense',
      ],
      complianceCertifications: ['SOC 2', 'HIPAA', 'PCI DSS', 'ISO 27001'],
    });
    const node = makeNode({ type: 'firewall', tier: 'dmz', label: 'Firewall' });
    // Additional nodes whose labels/types match recommendedFor keywords
    const spec = makeSpec([
      node,
      { id: 'n2', type: 'router' as InfraNodeType, label: 'Perimeter Router' },
      { id: 'n3', type: 'web-server' as InfraNodeType, label: 'DMZ Web Server' },
      { id: 'n4', type: 'switch-l3' as InfraNodeType, label: 'Edge Switch' },
    ]);
    const score = scoreCloudService(
      service, node, spec,
      ['SOC 2', 'HIPAA', 'PCI DSS'],
    );
    // typeMatch=40, architectureRoleFit=25, useCaseOverlap=20, complianceFit=15 = 100
    expect(score.overall).toBe(100);
  });
});
