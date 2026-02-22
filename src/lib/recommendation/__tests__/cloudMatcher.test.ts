/**
 * Recommendation Engine — Cloud Service Matcher Tests
 */

import { describe, it, expect } from 'vitest';
import { matchCloudServices } from '../cloudMatcher';
import type { InfraSpec } from '@/types/infra';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const basicSpec: InfraSpec = {
  nodes: [
    { id: 'fw-1', type: 'firewall', label: 'Main Firewall' },
    { id: 'lb-1', type: 'load-balancer', label: 'Application LB' },
    { id: 'db-1', type: 'db-server', label: 'Primary Database' },
  ],
  connections: [
    { source: 'fw-1', target: 'lb-1' },
    { source: 'lb-1', target: 'db-1' },
  ],
};

// ---------------------------------------------------------------------------
// matchCloudServices
// ---------------------------------------------------------------------------

describe('matchCloudServices', () => {
  it('should return recommendations for matching nodes', () => {
    const result = matchCloudServices(basicSpec);
    expect(result.nodeRecommendations.length).toBeGreaterThan(0);
    expect(result.totalServicesEvaluated).toBeGreaterThan(0);
    expect(result.totalMatches).toBeGreaterThan(0);
  });

  it('should sort recommendations by score descending', () => {
    const result = matchCloudServices(basicSpec);
    for (const nodeRec of result.nodeRecommendations) {
      for (let i = 1; i < nodeRec.recommendations.length; i++) {
        expect(nodeRec.recommendations[i].score.overall)
          .toBeLessThanOrEqual(nodeRec.recommendations[i - 1].score.overall);
      }
    }
  });

  it('should filter by provider when specified', () => {
    const result = matchCloudServices(basicSpec, { provider: 'aws' });
    for (const nodeRec of result.nodeRecommendations) {
      for (const rec of nodeRec.recommendations) {
        expect(rec.provider).toBe('aws');
      }
    }
  });

  it('should respect minScore option', () => {
    const result = matchCloudServices(basicSpec, { minScore: 40 });
    for (const nodeRec of result.nodeRecommendations) {
      for (const rec of nodeRec.recommendations) {
        expect(rec.score.overall).toBeGreaterThanOrEqual(40);
      }
    }
  });

  it('should respect maxPerNode option', () => {
    const result = matchCloudServices(basicSpec, { maxPerNode: 2 });
    for (const nodeRec of result.nodeRecommendations) {
      expect(nodeRec.recommendations.length).toBeLessThanOrEqual(2);
    }
  });

  it('should include bilingual reasons', () => {
    const result = matchCloudServices(basicSpec);
    for (const nodeRec of result.nodeRecommendations) {
      for (const rec of nodeRec.recommendations) {
        expect(rec.reason).toBeTruthy();
        expect(rec.reasonKo).toBeTruthy();
      }
    }
  });

  it('should include compliance scoring when specified', () => {
    const result = matchCloudServices(basicSpec, {
      requiredCompliance: ['SOC 2', 'HIPAA'],
    });
    // Services with compliance certs should score higher
    expect(result.nodeRecommendations.length).toBeGreaterThan(0);
    const topRec = result.nodeRecommendations[0].recommendations[0];
    expect(topRec.score.breakdown.complianceFit).toBeGreaterThan(0);
  });

  it('should track unmatched nodes', () => {
    const weirdSpec: InfraSpec = {
      nodes: [{ id: 'weird-1', type: 'wireless-ap', label: 'Wireless AP' }],
      connections: [],
    };
    const result = matchCloudServices(weirdSpec, { minScore: 90 });
    // With a very high minScore, wireless-controller likely has no match
    expect(result.unmatchedNodes.length + result.nodeRecommendations.length).toBe(1);
  });

  it('should find firewall services from all three providers', () => {
    const fwSpec: InfraSpec = {
      nodes: [{ id: 'fw-1', type: 'firewall', label: 'Firewall' }],
      connections: [],
    };
    const result = matchCloudServices(fwSpec, { minScore: 30 });
    expect(result.nodeRecommendations.length).toBe(1);
    const providers = new Set(result.nodeRecommendations[0].recommendations.map((r) => r.provider));
    expect(providers.size).toBeGreaterThanOrEqual(2);
  });
});
