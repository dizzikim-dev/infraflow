import { describe, it, expect } from 'vitest';
import {
  assessChangeRisk,
  getRiskFactors,
  getRecommendation,
} from '../changeRiskAssessor';
import type { InfraSpec } from '@/types/infra';

// ---------------------------------------------------------------------------
// Helper to build InfraSpec concisely
// ---------------------------------------------------------------------------

function makeSpec(
  nodes: { id: string; type: string; label: string; tier?: string }[],
  connections: { source: string; target: string }[] = [],
): InfraSpec {
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type as never,
      label: n.label,
      tier: n.tier as never,
    })),
    connections,
  };
}

// ---------------------------------------------------------------------------
// Reusable specs
// ---------------------------------------------------------------------------

/** A typical 3-tier architecture with security */
const BASE_SPEC = makeSpec(
  [
    { id: 'internet-1', type: 'internet', label: 'Internet', tier: 'external' },
    { id: 'fw-1', type: 'firewall', label: 'Firewall', tier: 'dmz' },
    { id: 'waf-1', type: 'waf', label: 'WAF', tier: 'dmz' },
    { id: 'lb-1', type: 'load-balancer', label: 'Load Balancer', tier: 'dmz' },
    { id: 'web-1', type: 'web-server', label: 'Web Server 1', tier: 'internal' },
    { id: 'web-2', type: 'web-server', label: 'Web Server 2', tier: 'internal' },
    { id: 'app-1', type: 'app-server', label: 'App Server', tier: 'internal' },
    { id: 'db-1', type: 'db-server', label: 'DB Server', tier: 'data' },
    { id: 'backup-1', type: 'backup', label: 'Backup', tier: 'data' },
    { id: 'mfa-1', type: 'mfa', label: 'MFA', tier: 'internal' },
    { id: 'ldap-1', type: 'ldap-ad', label: 'LDAP/AD', tier: 'internal' },
  ],
  [
    { source: 'internet-1', target: 'fw-1' },
    { source: 'fw-1', target: 'waf-1' },
    { source: 'waf-1', target: 'lb-1' },
    { source: 'lb-1', target: 'web-1' },
    { source: 'lb-1', target: 'web-2' },
    { source: 'web-1', target: 'app-1' },
    { source: 'web-2', target: 'app-1' },
    { source: 'app-1', target: 'db-1' },
    { source: 'db-1', target: 'backup-1' },
  ],
);

const EMPTY_SPEC = makeSpec([], []);

// ---------------------------------------------------------------------------
// assessChangeRisk
// ---------------------------------------------------------------------------

describe('assessChangeRisk', () => {
  it('should return low risk for small safe addition (1-2 nodes added)', () => {
    const after = makeSpec(
      [
        ...BASE_SPEC.nodes,
        { id: 'cache-1', type: 'cache', label: 'Redis Cache', tier: 'internal' },
      ],
      [
        ...BASE_SPEC.connections,
        { source: 'app-1', target: 'cache-1' },
      ],
    );
    const result = assessChangeRisk(BASE_SPEC, after);
    expect(result.level).toBe('low');
    expect(result.recommendation).toBe('auto-apply');
  });

  it('should return medium for moderate changes (5+ nodes) when no antipatterns introduced', () => {
    // Use a base that already has no antipattern-triggering gaps,
    // then add 5 simple nodes that don't introduce antipatterns.
    const bigBase = makeSpec(
      Array.from({ length: 20 }, (_, i) => ({
        id: `node-${i}`,
        type: 'web-server',
        label: `Node ${i}`,
      })),
      [],
    );
    const after = makeSpec(
      [
        ...bigBase.nodes,
        { id: 'new-1', type: 'web-server', label: 'WS Extra 1' },
        { id: 'new-2', type: 'web-server', label: 'WS Extra 2' },
        { id: 'new-3', type: 'web-server', label: 'WS Extra 3' },
        { id: 'new-4', type: 'web-server', label: 'WS Extra 4' },
        { id: 'new-5', type: 'web-server', label: 'WS Extra 5' },
      ],
      [],
    );
    const result = assessChangeRisk(bigBase, after);
    expect(result.level).toBe('medium');
    expect(result.factors.some((f) => f.code === 'MODERATE_CHANGE')).toBe(true);
  });

  it('should return high when security node removed (firewall)', () => {
    const after = makeSpec(
      BASE_SPEC.nodes.filter((n) => n.type !== 'firewall'),
      BASE_SPEC.connections.filter(
        (c) => c.source !== 'fw-1' && c.target !== 'fw-1',
      ),
    );
    const result = assessChangeRisk(BASE_SPEC, after);
    expect(result.level).toBe('high');
    expect(result.factors.some((f) => f.code === 'SECURITY_NODE_REMOVED')).toBe(
      true,
    );
  });

  it('should return high when auth node removed (mfa)', () => {
    const after = makeSpec(
      BASE_SPEC.nodes.filter((n) => n.type !== 'mfa'),
      BASE_SPEC.connections,
    );
    const result = assessChangeRisk(BASE_SPEC, after);
    expect(result.level).toBe('high');
    expect(result.factors.some((f) => f.code === 'AUTH_NODE_REMOVED')).toBe(
      true,
    );
  });

  it('should return critical when >50% nodes changed', () => {
    // Remove 7 out of 11 nodes (>50%)
    const after = makeSpec(
      [
        { id: 'internet-1', type: 'internet', label: 'Internet', tier: 'external' },
        { id: 'web-1', type: 'web-server', label: 'Web Server', tier: 'internal' },
        { id: 'db-1', type: 'db-server', label: 'DB', tier: 'data' },
        // Add some new nodes to reach >50% total change
        { id: 'new-1', type: 'container', label: 'Container 1', tier: 'internal' },
        { id: 'new-2', type: 'container', label: 'Container 2', tier: 'internal' },
        { id: 'new-3', type: 'container', label: 'Container 3', tier: 'internal' },
      ],
      [],
    );
    const result = assessChangeRisk(BASE_SPEC, after);
    expect(result.level).toBe('critical');
    expect(result.factors.some((f) => f.code === 'MASSIVE_CHANGE')).toBe(true);
  });

  it('should return critical when all nodes removed', () => {
    const result = assessChangeRisk(BASE_SPEC, EMPTY_SPEC);
    expect(result.level).toBe('critical');
    expect(result.factors.some((f) => f.code === 'ALL_NODES_REMOVED')).toBe(
      true,
    );
  });

  it('should return critical when internet directly connected to db-server', () => {
    const after = makeSpec(
      [
        ...BASE_SPEC.nodes,
      ],
      [
        ...BASE_SPEC.connections,
        { source: 'internet-1', target: 'db-1' },
      ],
    );
    const result = assessChangeRisk(BASE_SPEC, after);
    expect(result.level).toBe('critical');
    expect(result.factors.some((f) => f.code === 'INTERNET_EXPOSED')).toBe(
      true,
    );
  });

  it('should return high when antipattern introduced in after', () => {
    // Remove WAF from spec with internet + web-server to trigger AP-SEC-003
    const before = makeSpec(
      [
        { id: 'internet-1', type: 'internet', label: 'Internet' },
        { id: 'fw-1', type: 'firewall', label: 'Firewall' },
        { id: 'waf-1', type: 'waf', label: 'WAF' },
        { id: 'web-1', type: 'web-server', label: 'Web Server' },
        { id: 'app-1', type: 'app-server', label: 'App Server' },
        { id: 'db-1', type: 'db-server', label: 'DB Server' },
        { id: 'ldap-1', type: 'ldap-ad', label: 'LDAP' },
        { id: 'backup-1', type: 'backup', label: 'Backup' },
        { id: 'cache-1', type: 'cache', label: 'Cache' },
      ],
      [
        { source: 'internet-1', target: 'fw-1' },
        { source: 'fw-1', target: 'waf-1' },
        { source: 'waf-1', target: 'web-1' },
        { source: 'web-1', target: 'app-1' },
        { source: 'app-1', target: 'db-1' },
      ],
    );

    const after = makeSpec(
      before.nodes.filter((n) => n.type !== 'waf'),
      before.connections.filter(
        (c) => c.source !== 'waf-1' && c.target !== 'waf-1',
      ),
    );

    const result = assessChangeRisk(before, after);
    expect(result.factors.some((f) => f.code === 'ANTIPATTERN_INTRODUCED')).toBe(
      true,
    );
    expect(result.level).toBe('high');
  });

  it('should return high when mandatory dependency broken', () => {
    // SSO requires ldap-ad; remove ldap-ad while keeping sso
    const before = makeSpec(
      [
        { id: 'sso-1', type: 'sso', label: 'SSO' },
        { id: 'ldap-1', type: 'ldap-ad', label: 'LDAP/AD' },
        { id: 'fw-1', type: 'firewall', label: 'Firewall' },
      ],
      [{ source: 'sso-1', target: 'ldap-1' }],
    );

    const after = makeSpec(
      [
        { id: 'sso-1', type: 'sso', label: 'SSO' },
        { id: 'fw-1', type: 'firewall', label: 'Firewall' },
      ],
      [],
    );

    const result = assessChangeRisk(before, after);
    expect(result.factors.some((f) => f.code === 'MANDATORY_DEP_BROKEN')).toBe(
      true,
    );
  });

  it('should return high when backup removed', () => {
    const after = makeSpec(
      BASE_SPEC.nodes.filter((n) => n.type !== 'backup'),
      BASE_SPEC.connections.filter(
        (c) => c.source !== 'backup-1' && c.target !== 'backup-1',
      ),
    );
    const result = assessChangeRisk(BASE_SPEC, after);
    expect(result.factors.some((f) => f.code === 'BACKUP_REMOVED')).toBe(true);
  });

  it('should return medium when redundancy removed (2 to 1 instances)', () => {
    // Remove one of the two web servers
    const after = makeSpec(
      BASE_SPEC.nodes.filter((n) => n.id !== 'web-2'),
      BASE_SPEC.connections.filter(
        (c) => c.source !== 'web-2' && c.target !== 'web-2',
      ),
    );
    const result = assessChangeRisk(BASE_SPEC, after);
    expect(result.factors.some((f) => f.code === 'REDUNDANCY_REMOVED')).toBe(
      true,
    );
  });

  it('should return low for node modification (type unchanged)', () => {
    // Change a label but keep all the same node IDs
    const after = makeSpec(
      BASE_SPEC.nodes.map((n) =>
        n.id === 'web-1' ? { ...n, label: 'Web Server Primary' } : n,
      ),
      BASE_SPEC.connections,
    );
    const result = assessChangeRisk(BASE_SPEC, after);
    expect(result.level).toBe('low');
  });

  it('should handle empty before (new diagram creation)', () => {
    // Build a complete spec that doesn't trigger antipatterns
    const after = makeSpec(
      [
        { id: 'internet-1', type: 'internet', label: 'Internet' },
        { id: 'fw-1', type: 'firewall', label: 'Firewall' },
        { id: 'waf-1', type: 'waf', label: 'WAF' },
        { id: 'web-1', type: 'web-server', label: 'Web Server' },
        { id: 'app-1', type: 'app-server', label: 'App Server' },
        { id: 'db-1', type: 'db-server', label: 'DB Server', tier: 'data' },
        { id: 'ldap-1', type: 'ldap-ad', label: 'LDAP' },
        { id: 'backup-1', type: 'backup', label: 'Backup' },
        { id: 'cache-1', type: 'cache', label: 'Cache' },
        { id: 'san-1', type: 'san-nas', label: 'SAN/NAS', tier: 'data' },
        { id: 'vpn-1', type: 'vpn-gateway', label: 'VPN' },
      ],
      [
        { source: 'internet-1', target: 'fw-1' },
        { source: 'fw-1', target: 'waf-1' },
        { source: 'waf-1', target: 'web-1' },
        { source: 'web-1', target: 'app-1' },
        { source: 'app-1', target: 'db-1' },
      ],
    );
    const result = assessChangeRisk(EMPTY_SPEC, after);
    // New diagram from empty: no removals, no broken deps, no antipatterns
    // but may trigger MODERATE_CHANGE since many nodes added
    expect(result.summary.removedNodes).toBe(0);
    expect(result.summary.addedNodes).toBe(11);
  });

  it('should handle both empty (no change = low risk)', () => {
    const result = assessChangeRisk(EMPTY_SPEC, EMPTY_SPEC);
    expect(result.level).toBe('low');
    expect(result.factors.some((f) => f.code === 'NO_RISK')).toBe(true);
  });

  it('should return highest risk level when multiple factors present', () => {
    // Remove firewall (high), remove all nodes except 2 (>50% = critical)
    const after = makeSpec(
      [
        { id: 'internet-1', type: 'internet', label: 'Internet' },
        { id: 'web-1', type: 'web-server', label: 'Web Server' },
      ],
      [],
    );
    const result = assessChangeRisk(BASE_SPEC, after);
    expect(result.level).toBe('critical');
    expect(result.factors.length).toBeGreaterThan(1);
  });
});

// ---------------------------------------------------------------------------
// getRiskFactors
// ---------------------------------------------------------------------------

describe('getRiskFactors', () => {
  it('should detect SECURITY_NODE_REMOVED', () => {
    const after = makeSpec(
      BASE_SPEC.nodes.filter((n) => n.type !== 'firewall'),
      BASE_SPEC.connections.filter(
        (c) => c.source !== 'fw-1' && c.target !== 'fw-1',
      ),
    );
    const factors = getRiskFactors(BASE_SPEC, after);
    const secFactor = factors.find((f) => f.code === 'SECURITY_NODE_REMOVED');
    expect(secFactor).toBeDefined();
    expect(secFactor!.level).toBe('high');
  });

  it('should detect AUTH_NODE_REMOVED', () => {
    const after = makeSpec(
      BASE_SPEC.nodes.filter((n) => n.type !== 'ldap-ad'),
      BASE_SPEC.connections,
    );
    const factors = getRiskFactors(BASE_SPEC, after);
    const authFactor = factors.find((f) => f.code === 'AUTH_NODE_REMOVED');
    expect(authFactor).toBeDefined();
    expect(authFactor!.level).toBe('high');
  });

  it('should detect MASSIVE_CHANGE', () => {
    // Remove 8 of 11 nodes, add 3 new = 11 changes / 11 original = 100%
    const after = makeSpec(
      [
        { id: 'internet-1', type: 'internet', label: 'Internet' },
        { id: 'web-1', type: 'web-server', label: 'Web Server' },
        { id: 'db-1', type: 'db-server', label: 'DB Server' },
        { id: 'new-1', type: 'container', label: 'Container 1' },
        { id: 'new-2', type: 'container', label: 'Container 2' },
        { id: 'new-3', type: 'container', label: 'Container 3' },
      ],
      [],
    );
    const factors = getRiskFactors(BASE_SPEC, after);
    expect(factors.some((f) => f.code === 'MASSIVE_CHANGE')).toBe(true);
  });

  it('should detect LARGE_CHANGE', () => {
    // 11 nodes base. Remove 4, add 0 = 4/11 = 36% > 30%
    const after = makeSpec(
      [
        { id: 'internet-1', type: 'internet', label: 'Internet' },
        { id: 'fw-1', type: 'firewall', label: 'Firewall' },
        { id: 'waf-1', type: 'waf', label: 'WAF' },
        { id: 'lb-1', type: 'load-balancer', label: 'LB' },
        { id: 'web-1', type: 'web-server', label: 'Web 1' },
        { id: 'web-2', type: 'web-server', label: 'Web 2' },
        { id: 'app-1', type: 'app-server', label: 'App' },
      ],
      BASE_SPEC.connections.filter(
        (c) =>
          c.source !== 'db-1' &&
          c.target !== 'db-1' &&
          c.source !== 'backup-1' &&
          c.target !== 'backup-1',
      ),
    );
    const factors = getRiskFactors(BASE_SPEC, after);
    expect(factors.some((f) => f.code === 'LARGE_CHANGE')).toBe(true);
  });

  it('should detect MODERATE_CHANGE', () => {
    // Add 5 nodes (no removals) from a 2-node base = 5/2 > 50% so actually MASSIVE
    // Use a bigger base: add 5 nodes to 11-node base = 5 added, 0 removed
    // 5/11 = 45% > 30% = LARGE_CHANGE
    // Instead: add exactly 5 nodes to a 20-node base (5/20 = 25%, < 30%)
    const bigBase = makeSpec(
      Array.from({ length: 20 }, (_, i) => ({
        id: `node-${i}`,
        type: 'web-server',
        label: `Node ${i}`,
      })),
      [],
    );
    const after = makeSpec(
      [
        ...bigBase.nodes,
        { id: 'new-1', type: 'container', label: 'C1' },
        { id: 'new-2', type: 'container', label: 'C2' },
        { id: 'new-3', type: 'container', label: 'C3' },
        { id: 'new-4', type: 'container', label: 'C4' },
        { id: 'new-5', type: 'container', label: 'C5' },
      ],
      [],
    );
    const factors = getRiskFactors(bigBase, after);
    expect(factors.some((f) => f.code === 'MODERATE_CHANGE')).toBe(true);
  });

  it('should detect ANTIPATTERN_INTRODUCED', () => {
    // Before: has firewall. After: no firewall but still has compute = AP-SEC-002
    const before = makeSpec(
      [
        { id: 'fw-1', type: 'firewall', label: 'Firewall' },
        { id: 'web-1', type: 'web-server', label: 'Web Server' },
        { id: 'app-1', type: 'app-server', label: 'App Server' },
        { id: 'db-1', type: 'db-server', label: 'DB Server' },
        { id: 'ldap-1', type: 'ldap-ad', label: 'LDAP' },
        { id: 'backup-1', type: 'backup', label: 'Backup' },
        { id: 'cache-1', type: 'cache', label: 'Cache' },
      ],
      [],
    );
    const after = makeSpec(
      before.nodes.filter((n) => n.type !== 'firewall'),
      [],
    );
    const factors = getRiskFactors(before, after);
    expect(factors.some((f) => f.code === 'ANTIPATTERN_INTRODUCED')).toBe(true);
  });

  it('should detect MANDATORY_DEP_BROKEN', () => {
    // CDN requires DNS. Remove DNS while keeping CDN.
    const before = makeSpec(
      [
        { id: 'cdn-1', type: 'cdn', label: 'CDN' },
        { id: 'dns-1', type: 'dns', label: 'DNS' },
      ],
      [{ source: 'cdn-1', target: 'dns-1' }],
    );
    const after = makeSpec(
      [{ id: 'cdn-1', type: 'cdn', label: 'CDN' }],
      [],
    );
    const factors = getRiskFactors(before, after);
    expect(factors.some((f) => f.code === 'MANDATORY_DEP_BROKEN')).toBe(true);
  });

  it('should detect REDUNDANCY_REMOVED', () => {
    const before = makeSpec(
      [
        { id: 'db-1', type: 'db-server', label: 'DB 1' },
        { id: 'db-2', type: 'db-server', label: 'DB 2' },
      ],
      [],
    );
    const after = makeSpec(
      [{ id: 'db-1', type: 'db-server', label: 'DB 1' }],
      [],
    );
    const factors = getRiskFactors(before, after);
    expect(factors.some((f) => f.code === 'REDUNDANCY_REMOVED')).toBe(true);
  });

  it('should detect BACKUP_REMOVED', () => {
    const before = makeSpec(
      [
        { id: 'backup-1', type: 'backup', label: 'Backup' },
        { id: 'db-1', type: 'db-server', label: 'DB' },
      ],
      [],
    );
    const after = makeSpec(
      [{ id: 'db-1', type: 'db-server', label: 'DB' }],
      [],
    );
    const factors = getRiskFactors(before, after);
    expect(factors.some((f) => f.code === 'BACKUP_REMOVED')).toBe(true);
  });

  it('should detect INTERNET_EXPOSED', () => {
    const before = makeSpec(
      [
        { id: 'internet-1', type: 'internet', label: 'Internet' },
        { id: 'fw-1', type: 'firewall', label: 'Firewall' },
        { id: 'db-1', type: 'db-server', label: 'DB Server' },
      ],
      [
        { source: 'internet-1', target: 'fw-1' },
        { source: 'fw-1', target: 'db-1' },
      ],
    );
    const after = makeSpec(
      [
        { id: 'internet-1', type: 'internet', label: 'Internet' },
        { id: 'fw-1', type: 'firewall', label: 'Firewall' },
        { id: 'db-1', type: 'db-server', label: 'DB Server' },
      ],
      [
        { source: 'internet-1', target: 'fw-1' },
        { source: 'fw-1', target: 'db-1' },
        { source: 'internet-1', target: 'db-1' },
      ],
    );
    const factors = getRiskFactors(before, after);
    expect(factors.some((f) => f.code === 'INTERNET_EXPOSED')).toBe(true);
  });

  it('should return empty factors (only NO_RISK) for identical specs', () => {
    const factors = getRiskFactors(BASE_SPEC, BASE_SPEC);
    expect(factors.length).toBe(1);
    expect(factors[0].code).toBe('NO_RISK');
  });

  it('should return NO_RISK for safe small changes', () => {
    const after = makeSpec(
      [
        ...BASE_SPEC.nodes,
        { id: 'cache-1', type: 'cache', label: 'Cache', tier: 'internal' },
      ],
      BASE_SPEC.connections,
    );
    const factors = getRiskFactors(BASE_SPEC, after);
    expect(factors.some((f) => f.code === 'NO_RISK')).toBe(true);
  });

  it('each factor should have Korean description', () => {
    // Generate multiple factors
    const after = makeSpec(
      [{ id: 'internet-1', type: 'internet', label: 'Internet' }],
      [],
    );
    const factors = getRiskFactors(BASE_SPEC, after);
    for (const factor of factors) {
      expect(factor.descriptionKo).toBeTruthy();
      expect(typeof factor.descriptionKo).toBe('string');
      expect(factor.descriptionKo.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// getRecommendation
// ---------------------------------------------------------------------------

describe('getRecommendation', () => {
  it('should return auto-apply for low', () => {
    const result = getRecommendation('low');
    expect(result.recommendation).toBe('auto-apply');
  });

  it('should return confirm for medium', () => {
    const result = getRecommendation('medium');
    expect(result.recommendation).toBe('confirm');
  });

  it('should return review-required for high', () => {
    const result = getRecommendation('high');
    expect(result.recommendation).toBe('review-required');
  });

  it('should return review-required for critical', () => {
    const result = getRecommendation('critical');
    expect(result.recommendation).toBe('review-required');
  });

  it('should have Korean recommendation text for all levels', () => {
    const levels = ['low', 'medium', 'high', 'critical'] as const;
    for (const level of levels) {
      const result = getRecommendation(level);
      expect(result.recommendationKo).toBeTruthy();
      expect(typeof result.recommendationKo).toBe('string');
      expect(result.recommendationKo.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// summary
// ---------------------------------------------------------------------------

describe('summary', () => {
  it('should count added/removed nodes correctly', () => {
    const after = makeSpec(
      [
        ...BASE_SPEC.nodes.filter((n) => n.id !== 'backup-1'),
        { id: 'cache-1', type: 'cache', label: 'Cache' },
        { id: 'dns-1', type: 'dns', label: 'DNS' },
      ],
      BASE_SPEC.connections.filter(
        (c) => c.source !== 'backup-1' && c.target !== 'backup-1',
      ),
    );
    const result = assessChangeRisk(BASE_SPEC, after);
    expect(result.summary.addedNodes).toBe(2);
    expect(result.summary.removedNodes).toBe(1);
  });

  it('should count added/removed connections correctly', () => {
    const after = makeSpec(BASE_SPEC.nodes, [
      ...BASE_SPEC.connections.filter(
        (c) => !(c.source === 'db-1' && c.target === 'backup-1'),
      ),
      { source: 'web-1', target: 'db-1' },
      { source: 'web-2', target: 'db-1' },
    ]);
    const result = assessChangeRisk(BASE_SPEC, after);
    expect(result.summary.removedConnections).toBe(1);
    expect(result.summary.addedConnections).toBe(2);
    expect(result.summary.totalChanges).toBe(
      result.summary.addedNodes +
        result.summary.removedNodes +
        result.summary.addedConnections +
        result.summary.removedConnections,
    );
  });
});

// ---------------------------------------------------------------------------
// Edge cases and additional coverage
// ---------------------------------------------------------------------------

describe('edge cases', () => {
  it('should detect SECURITY_NODE_REMOVED for waf', () => {
    const after = makeSpec(
      BASE_SPEC.nodes.filter((n) => n.type !== 'waf'),
      BASE_SPEC.connections.filter(
        (c) => c.source !== 'waf-1' && c.target !== 'waf-1',
      ),
    );
    const factors = getRiskFactors(BASE_SPEC, after);
    const wafFactor = factors.find(
      (f) => f.code === 'SECURITY_NODE_REMOVED' && f.details === 'waf',
    );
    expect(wafFactor).toBeDefined();
  });

  it('should detect AUTH_NODE_REMOVED for ldap-ad', () => {
    const after = makeSpec(
      BASE_SPEC.nodes.filter((n) => n.type !== 'ldap-ad'),
      BASE_SPEC.connections,
    );
    const factors = getRiskFactors(BASE_SPEC, after);
    const ldapFactor = factors.find(
      (f) => f.code === 'AUTH_NODE_REMOVED' && f.details === 'ldap-ad',
    );
    expect(ldapFactor).toBeDefined();
  });

  it('should detect INTERNET_EXPOSED for reverse direction (internal -> internet)', () => {
    const before = makeSpec(
      [
        { id: 'internet-1', type: 'internet', label: 'Internet' },
        { id: 'backup-1', type: 'backup', label: 'Backup' },
      ],
      [],
    );
    const after = makeSpec(
      [
        { id: 'internet-1', type: 'internet', label: 'Internet' },
        { id: 'backup-1', type: 'backup', label: 'Backup' },
      ],
      [{ source: 'backup-1', target: 'internet-1' }],
    );
    const factors = getRiskFactors(before, after);
    expect(factors.some((f) => f.code === 'INTERNET_EXPOSED')).toBe(true);
  });

  it('should not flag INTERNET_EXPOSED for pre-existing connections', () => {
    const spec = makeSpec(
      [
        { id: 'internet-1', type: 'internet', label: 'Internet' },
        { id: 'db-1', type: 'db-server', label: 'DB' },
      ],
      [{ source: 'internet-1', target: 'db-1' }],
    );
    // Same before and after -- no new connection
    const factors = getRiskFactors(spec, spec);
    expect(factors.some((f) => f.code === 'INTERNET_EXPOSED')).toBe(false);
  });

  it('should handle new diagram creation from empty state', () => {
    const after = makeSpec(
      [
        { id: 'fw-1', type: 'firewall', label: 'Firewall' },
        { id: 'web-1', type: 'web-server', label: 'Web Server' },
        { id: 'app-1', type: 'app-server', label: 'App Server' },
        { id: 'db-1', type: 'db-server', label: 'DB Server' },
      ],
      [
        { source: 'fw-1', target: 'web-1' },
        { source: 'web-1', target: 'app-1' },
        { source: 'app-1', target: 'db-1' },
      ],
    );
    const result = assessChangeRisk(EMPTY_SPEC, after);
    // No removals, just additions; no MASSIVE_CHANGE because before is empty
    expect(result.summary.addedNodes).toBe(4);
    expect(result.summary.removedNodes).toBe(0);
  });

  it('should correctly assign recommendation based on overall level', () => {
    // Critical scenario
    const result = assessChangeRisk(BASE_SPEC, EMPTY_SPEC);
    expect(result.recommendation).toBe('review-required');
    expect(result.recommendationKo).toContain('검토');
  });

  it('should not produce REDUNDANCY_REMOVED when going from 2 to 0', () => {
    const before = makeSpec(
      [
        { id: 'web-1', type: 'web-server', label: 'Web 1' },
        { id: 'web-2', type: 'web-server', label: 'Web 2' },
      ],
      [],
    );
    const after = makeSpec([], []);
    const factors = getRiskFactors(before, after);
    // Going to 0 is not "1 remaining" -- it's ALL_NODES_REMOVED
    expect(factors.some((f) => f.code === 'REDUNDANCY_REMOVED')).toBe(false);
    expect(factors.some((f) => f.code === 'ALL_NODES_REMOVED')).toBe(true);
  });

  it('totalChanges should include both node and connection changes', () => {
    const after = makeSpec(
      [
        ...BASE_SPEC.nodes,
        { id: 'cache-1', type: 'cache', label: 'Cache' },
      ],
      [
        ...BASE_SPEC.connections,
        { source: 'app-1', target: 'cache-1' },
      ],
    );
    const result = assessChangeRisk(BASE_SPEC, after);
    expect(result.summary.totalChanges).toBe(
      result.summary.addedNodes +
        result.summary.removedNodes +
        result.summary.addedConnections +
        result.summary.removedConnections,
    );
    expect(result.summary.addedNodes).toBe(1);
    expect(result.summary.addedConnections).toBe(1);
    expect(result.summary.removedNodes).toBe(0);
    expect(result.summary.removedConnections).toBe(0);
    expect(result.summary.totalChanges).toBe(2);
  });
});
