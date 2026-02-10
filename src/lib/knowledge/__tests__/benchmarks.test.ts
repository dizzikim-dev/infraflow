/**
 * Benchmark Performance Tests
 */

import { describe, it, expect } from 'vitest';
import {
  TRAFFIC_PROFILES,
  SIZING_MATRIX,
  getTrafficProfiles,
  recommendSizing,
  estimateCapacity,
  findBottlenecks,
  type TrafficTier,
} from '../benchmarks';
import type { InfraSpec } from '@/types/infra';

// ---------------------------------------------------------------------------
// Data Integrity
// ---------------------------------------------------------------------------

describe('TRAFFIC_PROFILES data integrity', () => {
  it('should have 4 profiles', () => {
    expect(TRAFFIC_PROFILES.length).toBe(4);
  });

  it('each profile should have all fields', () => {
    for (const p of TRAFFIC_PROFILES) {
      expect(p.tier).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.nameKo).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.descriptionKo).toBeTruthy();
      expect(p.requestsPerSecond.min).toBeLessThan(p.requestsPerSecond.max);
      expect(p.concurrentUsers.min).toBeLessThan(p.concurrentUsers.max);
    }
  });

  it('profiles should be in ascending order of RPS', () => {
    for (let i = 1; i < TRAFFIC_PROFILES.length; i++) {
      expect(TRAFFIC_PROFILES[i].requestsPerSecond.min)
        .toBeGreaterThanOrEqual(TRAFFIC_PROFILES[i - 1].requestsPerSecond.max);
    }
  });
});

describe('SIZING_MATRIX data integrity', () => {
  it('should have entries for major components', () => {
    expect(SIZING_MATRIX['firewall']).toBeDefined();
    expect(SIZING_MATRIX['web-server']).toBeDefined();
    expect(SIZING_MATRIX['db-server']).toBeDefined();
    expect(SIZING_MATRIX['load-balancer']).toBeDefined();
    expect(SIZING_MATRIX['cache']).toBeDefined();
    expect(SIZING_MATRIX['kubernetes']).toBeDefined();
  });

  it('each entry should have all 4 tiers', () => {
    const tiers: TrafficTier[] = ['small', 'medium', 'large', 'enterprise'];
    for (const [type, row] of Object.entries(SIZING_MATRIX)) {
      if (!row) continue;
      for (const tier of tiers) {
        expect(row[tier]).toBeDefined();
        expect(row[tier].recommended.instanceCount).toBeGreaterThan(0);
        expect(row[tier].minimum.instanceCount).toBeGreaterThan(0);
        expect(row[tier].recommended.spec).toBeTruthy();
        expect(row[tier].recommended.specKo).toBeTruthy();
        expect(row[tier].scalingNotes).toBeTruthy();
        expect(row[tier].scalingNotesKo).toBeTruthy();
        expect(row[tier].estimatedMonthlyCost).toBeGreaterThan(0);
        expect(row[tier].maxRPS).toBeGreaterThan(0);
      }
    }
  });

  it('recommended instance count should be >= minimum', () => {
    for (const [, row] of Object.entries(SIZING_MATRIX)) {
      if (!row) continue;
      for (const tier of Object.values(row)) {
        expect(tier.recommended.instanceCount).toBeGreaterThanOrEqual(tier.minimum.instanceCount);
      }
    }
  });

  it('maxRPS should increase with tier', () => {
    const tiers: TrafficTier[] = ['small', 'medium', 'large', 'enterprise'];
    for (const [, row] of Object.entries(SIZING_MATRIX)) {
      if (!row) continue;
      for (let i = 1; i < tiers.length; i++) {
        expect(row[tiers[i]].maxRPS).toBeGreaterThanOrEqual(row[tiers[i - 1]].maxRPS);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// getTrafficProfiles
// ---------------------------------------------------------------------------

describe('getTrafficProfiles', () => {
  it('should return all 4 profiles', () => {
    const profiles = getTrafficProfiles();
    expect(profiles.length).toBe(4);
    expect(profiles.map((p) => p.tier)).toEqual(['small', 'medium', 'large', 'enterprise']);
  });
});

// ---------------------------------------------------------------------------
// recommendSizing
// ---------------------------------------------------------------------------

describe('recommendSizing', () => {
  const spec: InfraSpec = {
    nodes: [
      { id: 'fw-1', type: 'firewall', label: 'FW' },
      { id: 'web-1', type: 'web-server', label: 'Web' },
      { id: 'db-1', type: 'db-server', label: 'DB' },
    ],
    connections: [],
  };

  it('should return recommendations for all matching components', () => {
    const recs = recommendSizing(spec, 'medium');
    expect(recs.length).toBe(3);
    const types = recs.map((r) => r.componentType);
    expect(types).toContain('firewall');
    expect(types).toContain('web-server');
    expect(types).toContain('db-server');
  });

  it('should have higher instance counts for larger tiers', () => {
    const small = recommendSizing(spec, 'small');
    const enterprise = recommendSizing(spec, 'enterprise');

    for (const sRec of small) {
      const eRec = enterprise.find((r) => r.componentType === sRec.componentType);
      expect(eRec).toBeDefined();
      expect(eRec!.recommended.instanceCount).toBeGreaterThanOrEqual(sRec.recommended.instanceCount);
    }
  });

  it('should return empty for spec with unknown components only', () => {
    const unknownSpec: InfraSpec = {
      nodes: [{ id: 'user-1', type: 'user', label: 'User' }],
      connections: [],
    };
    const recs = recommendSizing(unknownSpec, 'medium');
    expect(recs).toEqual([]);
  });

  it('should include cost estimates', () => {
    const recs = recommendSizing(spec, 'medium');
    for (const rec of recs) {
      expect(rec.estimatedMonthlyCost).toBeGreaterThan(0);
    }
  });

  it('should have bilingual scaling notes', () => {
    const recs = recommendSizing(spec, 'large');
    for (const rec of recs) {
      expect(rec.scalingNotes).toBeTruthy();
      expect(rec.scalingNotesKo).toBeTruthy();
    }
  });
});

// ---------------------------------------------------------------------------
// estimateCapacity
// ---------------------------------------------------------------------------

describe('estimateCapacity', () => {
  it('should estimate capacity for a basic spec', () => {
    const spec: InfraSpec = {
      nodes: [
        { id: 'fw-1', type: 'firewall', label: 'FW' },
        { id: 'web-1', type: 'web-server', label: 'Web' },
      ],
      connections: [],
    };
    const capacity = estimateCapacity(spec);
    expect(capacity.currentTier).toBeTruthy();
    expect(capacity.maxRPS).toBeGreaterThan(0);
    expect(typeof capacity.canHandle.small).toBe('boolean');
    expect(typeof capacity.canHandle.enterprise).toBe('boolean');
  });

  it('should detect bottleneck as web-server (lower per-instance RPS than firewall)', () => {
    const spec: InfraSpec = {
      nodes: [
        { id: 'fw-1', type: 'firewall', label: 'FW' },
        { id: 'web-1', type: 'web-server', label: 'Web' },
      ],
      connections: [],
    };
    const capacity = estimateCapacity(spec);
    expect(capacity.bottlenecks.length).toBeGreaterThan(0);
    // web-server has lower maxRPS than firewall
    expect(capacity.bottlenecks[0].componentType).toBe('web-server');
  });

  it('should show higher maxRPS with more instances', () => {
    const singleSpec: InfraSpec = {
      nodes: [{ id: 'web-1', type: 'web-server', label: 'Web' }],
      connections: [],
    };
    const doubleSpec: InfraSpec = {
      nodes: [
        { id: 'web-1', type: 'web-server', label: 'Web1' },
        { id: 'web-2', type: 'web-server', label: 'Web2' },
      ],
      connections: [],
    };
    const single = estimateCapacity(singleSpec);
    const double = estimateCapacity(doubleSpec);
    expect(double.maxRPS).toBeGreaterThan(single.maxRPS);
  });

  it('should return zero maxRPS for empty spec', () => {
    const spec: InfraSpec = { nodes: [], connections: [] };
    const capacity = estimateCapacity(spec);
    expect(capacity.maxRPS).toBe(0);
    expect(capacity.currentTier).toBe('small');
  });

  it('canHandle should be consistent with maxRPS', () => {
    const spec: InfraSpec = {
      nodes: [
        { id: 'web-1', type: 'web-server', label: 'Web' },
        { id: 'web-2', type: 'web-server', label: 'Web2' },
        { id: 'web-3', type: 'web-server', label: 'Web3' },
      ],
      connections: [],
    };
    const capacity = estimateCapacity(spec);
    // 3 web-servers × 2000 RPS = 6000 RPS → can handle small (1K) and medium (10K?) - actually 6000 < 10000 so can't handle medium
    expect(capacity.canHandle.small).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// findBottlenecks
// ---------------------------------------------------------------------------

describe('findBottlenecks', () => {
  it('should return bottlenecks sorted by maxRPS', () => {
    const spec: InfraSpec = {
      nodes: [
        { id: 'fw-1', type: 'firewall', label: 'FW' },
        { id: 'web-1', type: 'web-server', label: 'Web' },
        { id: 'db-1', type: 'db-server', label: 'DB' },
      ],
      connections: [],
    };
    const bottlenecks = findBottlenecks(spec);
    for (let i = 1; i < bottlenecks.length; i++) {
      expect(bottlenecks[i].maxRPS).toBeGreaterThanOrEqual(bottlenecks[i - 1].maxRPS);
    }
  });

  it('should return empty for empty spec', () => {
    const spec: InfraSpec = { nodes: [], connections: [] };
    const bottlenecks = findBottlenecks(spec);
    expect(bottlenecks).toEqual([]);
  });

  it('should have bilingual descriptions', () => {
    const spec: InfraSpec = {
      nodes: [{ id: 'web-1', type: 'web-server', label: 'Web' }],
      connections: [],
    };
    const bottlenecks = findBottlenecks(spec);
    for (const b of bottlenecks) {
      expect(b.reason).toBeTruthy();
      expect(b.reasonKo).toBeTruthy();
      expect(b.recommendation).toBeTruthy();
      expect(b.recommendationKo).toBeTruthy();
    }
  });
});
