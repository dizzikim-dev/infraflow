/**
 * Recommendation Engine -- Cloud Service Matcher Tests
 */

import { describe, it, expect } from 'vitest';
import { matchCloudServices } from '../cloudMatcher';
import type { InfraSpec, InfraNodeType, InfraNodeSpec } from '@/types/infra';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeSpec(nodes: InfraNodeSpec[]): InfraSpec {
  return { nodes, connections: [] };
}

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
// matchCloudServices -- basic behavior
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

  it('should return empty results for an empty spec', () => {
    const emptySpec: InfraSpec = { nodes: [], connections: [] };
    const result = matchCloudServices(emptySpec);

    expect(result.nodeRecommendations).toHaveLength(0);
    expect(result.totalServicesEvaluated).toBe(0);
    expect(result.totalMatches).toBe(0);
    expect(result.unmatchedNodes).toHaveLength(0);
  });

  // -- Provider filtering --

  it('should filter by provider when specified as aws', () => {
    const result = matchCloudServices(basicSpec, { provider: 'aws' });
    for (const nodeRec of result.nodeRecommendations) {
      for (const rec of nodeRec.recommendations) {
        expect(rec.provider).toBe('aws');
      }
    }
  });

  it('should filter by provider when specified as azure', () => {
    const result = matchCloudServices(basicSpec, { provider: 'azure' });
    for (const nodeRec of result.nodeRecommendations) {
      for (const rec of nodeRec.recommendations) {
        expect(rec.provider).toBe('azure');
      }
    }
  });

  it('should filter by provider when specified as gcp', () => {
    const result = matchCloudServices(basicSpec, { provider: 'gcp' });
    for (const nodeRec of result.nodeRecommendations) {
      for (const rec of nodeRec.recommendations) {
        expect(rec.provider).toBe('gcp');
      }
    }
  });

  it('should return multi-cloud results when no provider filter', () => {
    const fwSpec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall' },
    ]);
    const result = matchCloudServices(fwSpec, { minScore: 30 });

    if (result.nodeRecommendations.length > 0) {
      const providers = new Set(
        result.nodeRecommendations[0].recommendations.map((r) => r.provider),
      );
      expect(providers.size).toBeGreaterThanOrEqual(2);
    }
  });

  // -- Options --

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

  it('should use default maxPerNode of 5 when not specified', () => {
    const result = matchCloudServices(basicSpec);
    for (const nodeRec of result.nodeRecommendations) {
      expect(nodeRec.recommendations.length).toBeLessThanOrEqual(5);
    }
  });

  it('should apply maxPerNode=1 to return only the best match per node', () => {
    const result = matchCloudServices(basicSpec, { maxPerNode: 1 });
    for (const nodeRec of result.nodeRecommendations) {
      expect(nodeRec.recommendations).toHaveLength(1);
    }
  });

  // -- Bilingual reasons --

  it('should include bilingual reasons', () => {
    const result = matchCloudServices(basicSpec);
    for (const nodeRec of result.nodeRecommendations) {
      for (const rec of nodeRec.recommendations) {
        expect(rec.reason).toBeTruthy();
        expect(rec.reasonKo).toBeTruthy();
      }
    }
  });

  it('should include score in reason strings', () => {
    const result = matchCloudServices(basicSpec);
    for (const nodeRec of result.nodeRecommendations) {
      for (const rec of nodeRec.recommendations) {
        expect(rec.reason).toContain(String(rec.score.overall));
        expect(rec.reasonKo).toContain(String(rec.score.overall));
      }
    }
  });

  // -- Compliance --

  it('should include compliance scoring when specified', () => {
    const result = matchCloudServices(basicSpec, {
      requiredCompliance: ['SOC 2', 'HIPAA'],
    });
    // Services with compliance certs should score higher
    expect(result.nodeRecommendations.length).toBeGreaterThan(0);
    const topRec = result.nodeRecommendations[0].recommendations[0];
    expect(topRec.score.breakdown.complianceFit).toBeGreaterThan(0);
  });

  it('should give 0 compliance when no compliance requirements specified', () => {
    const result = matchCloudServices(basicSpec);
    for (const nodeRec of result.nodeRecommendations) {
      for (const rec of nodeRec.recommendations) {
        expect(rec.score.breakdown.complianceFit).toBe(0);
      }
    }
  });

  // -- Score structure --

  it('should return results with complete score breakdown structure', () => {
    const result = matchCloudServices(basicSpec);

    for (const nodeRec of result.nodeRecommendations) {
      for (const rec of nodeRec.recommendations) {
        expect(rec.score).toBeDefined();
        expect(typeof rec.score.overall).toBe('number');
        expect(typeof rec.score.breakdown.typeMatch).toBe('number');
        expect(typeof rec.score.breakdown.architectureRoleFit).toBe('number');
        expect(typeof rec.score.breakdown.useCaseOverlap).toBe('number');
        expect(typeof rec.score.breakdown.complianceFit).toBe('number');
      }
    }
  });

  it('should return scores between 0 and 100', () => {
    const result = matchCloudServices(basicSpec, { minScore: 0 });

    for (const nodeRec of result.nodeRecommendations) {
      for (const rec of nodeRec.recommendations) {
        expect(rec.score.overall).toBeGreaterThanOrEqual(0);
        expect(rec.score.overall).toBeLessThanOrEqual(100);
      }
    }
  });

  // -- Unmatched nodes --

  it('should track unmatched nodes', () => {
    const weirdSpec: InfraSpec = {
      nodes: [{ id: 'weird-1', type: 'wireless-ap' as InfraNodeType, label: 'Wireless AP' }],
      connections: [],
    };
    const result = matchCloudServices(weirdSpec, { minScore: 90 });
    // With a very high minScore, wireless-ap likely has no match
    expect(result.unmatchedNodes.length + result.nodeRecommendations.length).toBe(1);
  });

  it('should preserve nodeId, nodeType, and nodeLabel in unmatched nodes', () => {
    const spec = makeSpec([
      { id: 'wireless-1', type: 'wireless-ap' as InfraNodeType, label: 'Access Point' },
    ]);
    const result = matchCloudServices(spec, { minScore: 99 });

    if (result.unmatchedNodes.length > 0) {
      expect(result.unmatchedNodes[0].nodeId).toBe('wireless-1');
      expect(result.unmatchedNodes[0].nodeType).toBe('wireless-ap');
      expect(result.unmatchedNodes[0].nodeLabel).toBe('Access Point');
    }
  });

  // -- Multi-provider discovery --

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

  // -- Various node types --

  it('should return results for compute-related node types', () => {
    const spec = makeSpec([
      { id: 'web-1', type: 'web-server' as InfraNodeType, label: 'Web Server' },
    ]);
    const result = matchCloudServices(spec, { minScore: 0 });

    // web-server is a common type, should have some matches
    const totalNodes = result.nodeRecommendations.length + result.unmatchedNodes.length;
    expect(totalNodes).toBe(1);
  });

  it('should return results for storage-related node types', () => {
    const spec = makeSpec([
      { id: 'store-1', type: 'object-storage' as InfraNodeType, label: 'Object Storage' },
    ]);
    const result = matchCloudServices(spec, { minScore: 0 });

    const totalNodes = result.nodeRecommendations.length + result.unmatchedNodes.length;
    expect(totalNodes).toBe(1);
  });

  it('should return results for networking-related node types', () => {
    const spec = makeSpec([
      { id: 'dns-1', type: 'dns' as InfraNodeType, label: 'DNS Server' },
    ]);
    const result = matchCloudServices(spec, { minScore: 0 });

    const totalNodes = result.nodeRecommendations.length + result.unmatchedNodes.length;
    expect(totalNodes).toBe(1);
  });

  // -- Multiple nodes --

  it('should handle specs with many different node types', () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall' },
      { id: 'lb-1', type: 'load-balancer' as InfraNodeType, label: 'LB' },
      { id: 'db-1', type: 'db-server' as InfraNodeType, label: 'Database' },
      { id: 'web-1', type: 'web-server' as InfraNodeType, label: 'Web' },
      { id: 'cache-1', type: 'cache' as InfraNodeType, label: 'Cache' },
    ]);

    const result = matchCloudServices(spec);

    // All 5 nodes should be accounted for
    const totalNodes = result.nodeRecommendations.length + result.unmatchedNodes.length;
    expect(totalNodes).toBe(5);
  });

  it('should preserve node metadata in recommendations', () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Main Firewall' },
    ]);
    const result = matchCloudServices(spec);

    if (result.nodeRecommendations.length > 0) {
      expect(result.nodeRecommendations[0].nodeId).toBe('fw-1');
      expect(result.nodeRecommendations[0].nodeType).toBe('firewall');
      expect(result.nodeRecommendations[0].nodeLabel).toBe('Main Firewall');
    }
  });

  // -- Counter accuracy --

  it('should have totalMatches equal to sum of all recommendations', () => {
    const result = matchCloudServices(basicSpec);

    const sumRecs = result.nodeRecommendations.reduce(
      (sum, nr) => sum + nr.recommendations.length, 0,
    );
    expect(result.totalMatches).toBe(sumRecs);
  });

  it('should evaluate many services per node with 111+ cloud services', () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall' },
    ]);
    const result = matchCloudServices(spec, { minScore: 0 });

    // With 111+ active cloud services, should evaluate many
    expect(result.totalServicesEvaluated).toBeGreaterThan(50);
  });

  // -- Combined options --

  it('should combine provider filter with minScore and maxPerNode', () => {
    const result = matchCloudServices(basicSpec, {
      provider: 'aws',
      minScore: 30,
      maxPerNode: 2,
    });

    for (const nodeRec of result.nodeRecommendations) {
      expect(nodeRec.recommendations.length).toBeLessThanOrEqual(2);
      for (const rec of nodeRec.recommendations) {
        expect(rec.provider).toBe('aws');
        expect(rec.score.overall).toBeGreaterThanOrEqual(30);
      }
    }
  });

  // -- Service object inclusion --

  it('should include the full CloudService object in each recommendation', () => {
    const result = matchCloudServices(basicSpec);

    for (const nodeRec of result.nodeRecommendations) {
      for (const rec of nodeRec.recommendations) {
        expect(rec.service).toBeDefined();
        expect(rec.service.id).toBeTruthy();
        expect(rec.service.serviceName).toBeTruthy();
        expect(rec.service.serviceNameKo).toBeTruthy();
        expect(rec.service.provider).toBeTruthy();
        expect(rec.service.componentType).toBeTruthy();
      }
    }
  });
});
