/**
 * Recommendation Engine — Cloud Service Scorer Tests
 */

import { describe, it, expect } from 'vitest';
import { scoreCloudService } from '../cloudScorer';
import type { CloudService } from '@/lib/knowledge/cloudCatalog/types';
import { svcTrust } from '@/lib/knowledge/cloudCatalog/types';
import type { InfraSpec, InfraNodeSpec } from '@/types/infra';

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

describe('scoreCloudService — typeMatch', () => {
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
});

// ---------------------------------------------------------------------------
// Architecture Role Fit (0-25)
// ---------------------------------------------------------------------------

describe('scoreCloudService — architectureRoleFit', () => {
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
});

// ---------------------------------------------------------------------------
// Use Case Overlap (0-20)
// ---------------------------------------------------------------------------

describe('scoreCloudService — useCaseOverlap', () => {
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
    const node = makeNode({ type: 'web-server', label: 'Web App Server' });
    const score = scoreCloudService(service, node, makeSpec([node]));
    expect(score.breakdown.useCaseOverlap).toBeLessThanOrEqual(20);
  });

  it('should give 0 when recommendedFor is empty', () => {
    const service = makeService({ recommendedFor: undefined });
    const node = makeNode({ type: 'firewall' });
    const score = scoreCloudService(service, node, makeSpec([node]));
    expect(score.breakdown.useCaseOverlap).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Compliance Fit (0-15)
// ---------------------------------------------------------------------------

describe('scoreCloudService — complianceFit', () => {
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
});

// ---------------------------------------------------------------------------
// Overall Score
// ---------------------------------------------------------------------------

describe('scoreCloudService — overall', () => {
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
});
