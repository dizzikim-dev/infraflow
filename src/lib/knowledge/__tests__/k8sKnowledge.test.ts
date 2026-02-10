import { describe, it, expect } from 'vitest';
import { RELATIONSHIPS } from '../relationships';
import { ARCHITECTURE_PATTERNS, detectPatterns } from '../patterns';
import { ANTI_PATTERNS, detectAntiPatterns } from '../antipatterns';
import { FAILURE_SCENARIOS } from '../failures';
import type { InfraSpec, InfraNodeType } from '@/types/infra';

// ---------------------------------------------------------------------------
// Helper: valid InfraNodeType set (all types in the project)
// ---------------------------------------------------------------------------

const ALL_VALID_TYPES: InfraNodeType[] = [
  'firewall', 'waf', 'ids-ips', 'vpn-gateway', 'nac', 'dlp',
  'router', 'switch-l2', 'switch-l3', 'load-balancer', 'sd-wan', 'dns', 'cdn',
  'web-server', 'app-server', 'db-server', 'container', 'vm', 'kubernetes',
  'aws-vpc', 'azure-vnet', 'gcp-network', 'private-cloud',
  'san-nas', 'object-storage', 'backup', 'cache', 'storage',
  'ldap-ad', 'sso', 'mfa', 'iam',
  'user', 'internet',
  'central-office', 'base-station', 'olt', 'customer-premise', 'idc',
  'pe-router', 'p-router', 'mpls-network', 'dedicated-line', 'metro-ethernet',
  'corporate-internet', 'vpn-service', 'sd-wan-service', 'private-5g',
  'core-network', 'upf', 'ring-network',
];

// ---------------------------------------------------------------------------
// Helper: create a minimal InfraSpec
// ---------------------------------------------------------------------------

function createSpec(types: InfraNodeType[]): InfraSpec {
  return {
    nodes: types.map((type, i) => ({
      id: `${type}-${i}`,
      type,
      label: type,
    })),
    connections: [],
  };
}

// ---------------------------------------------------------------------------
// 1. K8s Antipatterns (4)
// ---------------------------------------------------------------------------

describe('K8s Antipatterns', () => {
  const k8sAPs = ANTI_PATTERNS.filter((ap) => ap.id.startsWith('AP-K8S-'));

  it('should have exactly 4 K8s anti-patterns', () => {
    expect(k8sAPs).toHaveLength(4);
  });

  it('should have unique IDs from AP-K8S-001 to AP-K8S-004', () => {
    const ids = k8sAPs.map((ap) => ap.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(4);
    for (let i = 1; i <= 4; i++) {
      const expectedId = `AP-K8S-${String(i).padStart(3, '0')}`;
      expect(ids).toContain(expectedId);
    }
  });

  it('should have type "antipattern" on every entry', () => {
    for (const ap of k8sAPs) {
      expect(ap.type).toBe('antipattern');
    }
  });

  it('should have valid severity levels', () => {
    const validSeverity = ['critical', 'high', 'medium'];
    for (const ap of k8sAPs) {
      expect(validSeverity).toContain(ap.severity);
    }
  });

  it('should have detection functions', () => {
    for (const ap of k8sAPs) {
      expect(typeof ap.detection).toBe('function');
    }
  });

  it('should have Korean description fields', () => {
    for (const ap of k8sAPs) {
      expect(ap.nameKo).toBeTruthy();
      expect(ap.detectionDescriptionKo).toBeTruthy();
      expect(ap.problemKo).toBeTruthy();
      expect(ap.impactKo).toBeTruthy();
      expect(ap.solutionKo).toBeTruthy();
    }
  });

  it('should have trust metadata', () => {
    for (const ap of k8sAPs) {
      expect(ap.trust.sources.length).toBeGreaterThanOrEqual(1);
      expect(ap.trust.confidence).toBeGreaterThan(0);
    }
  });

  // Detection function tests

  it('AP-K8S-001: should detect for [kubernetes] only (no container)', () => {
    const specBad = createSpec(['kubernetes']);
    const detected = detectAntiPatterns(specBad);
    const ids = detected.map((ap) => ap.id);
    expect(ids).toContain('AP-K8S-001');
  });

  it('AP-K8S-001: should NOT detect when kubernetes has 2+ containers', () => {
    const specGood = createSpec(['kubernetes', 'container', 'container']);
    const detected = detectAntiPatterns(specGood);
    const ids = detected.map((ap) => ap.id);
    expect(ids).not.toContain('AP-K8S-001');
  });

  it('AP-K8S-002: should detect for [kubernetes, container] (exactly 1 container)', () => {
    const specBad = createSpec(['kubernetes', 'container']);
    const detected = detectAntiPatterns(specBad);
    const ids = detected.map((ap) => ap.id);
    expect(ids).toContain('AP-K8S-002');
  });

  it('AP-K8S-002: should NOT detect for [kubernetes, container, container]', () => {
    const specGood = createSpec(['kubernetes', 'container', 'container']);
    const detected = detectAntiPatterns(specGood);
    const ids = detected.map((ap) => ap.id);
    expect(ids).not.toContain('AP-K8S-002');
  });

  it('AP-K8S-003: should detect for [kubernetes] without firewall', () => {
    const specBad = createSpec(['kubernetes']);
    const detected = detectAntiPatterns(specBad);
    const ids = detected.map((ap) => ap.id);
    expect(ids).toContain('AP-K8S-003');
  });

  it('AP-K8S-003: should NOT detect for [kubernetes, firewall]', () => {
    const specGood = createSpec(['kubernetes', 'firewall']);
    const detected = detectAntiPatterns(specGood);
    const ids = detected.map((ap) => ap.id);
    expect(ids).not.toContain('AP-K8S-003');
  });

  it('AP-K8S-004: should detect for [kubernetes, container] without iam', () => {
    const specBad = createSpec(['kubernetes', 'container']);
    const detected = detectAntiPatterns(specBad);
    const ids = detected.map((ap) => ap.id);
    expect(ids).toContain('AP-K8S-004');
  });

  it('AP-K8S-004: should NOT detect for [kubernetes, container, iam]', () => {
    const specGood = createSpec(['kubernetes', 'container', 'iam']);
    const detected = detectAntiPatterns(specGood);
    const ids = detected.map((ap) => ap.id);
    expect(ids).not.toContain('AP-K8S-004');
  });
});

// ---------------------------------------------------------------------------
// 2. K8s Failures (4)
// ---------------------------------------------------------------------------

describe('K8s Failures', () => {
  const k8sFailures = FAILURE_SCENARIOS.filter((f) => f.id.startsWith('FAIL-K8S-'));

  it('should have exactly 4 K8s failure scenarios', () => {
    expect(k8sFailures).toHaveLength(4);
  });

  it('should have unique IDs from FAIL-K8S-001 to FAIL-K8S-004', () => {
    const ids = k8sFailures.map((f) => f.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(4);
    for (let i = 1; i <= 4; i++) {
      const expectedId = `FAIL-K8S-${String(i).padStart(3, '0')}`;
      expect(ids).toContain(expectedId);
    }
  });

  it('should have type "failure" on every entry', () => {
    for (const f of k8sFailures) {
      expect(f.type).toBe('failure');
    }
  });

  it('should have valid component types', () => {
    for (const f of k8sFailures) {
      expect(ALL_VALID_TYPES).toContain(f.component);
    }
  });

  it('should have valid affectedComponents', () => {
    for (const f of k8sFailures) {
      for (const affected of f.affectedComponents) {
        expect(ALL_VALID_TYPES).toContain(affected);
      }
    }
  });

  it('should have valid impact types', () => {
    const validImpacts = ['service-down', 'degraded', 'data-loss', 'security-breach'];
    for (const f of k8sFailures) {
      expect(validImpacts).toContain(f.impact);
    }
  });

  it('should have valid likelihood levels', () => {
    const validLikelihoods = ['high', 'medium', 'low'];
    for (const f of k8sFailures) {
      expect(validLikelihoods).toContain(f.likelihood);
    }
  });

  it('should have Korean fields', () => {
    for (const f of k8sFailures) {
      expect(f.titleKo).toBeTruthy();
      expect(f.scenarioKo).toBeTruthy();
      expect(f.estimatedMTTR).toBeTruthy();
    }
  });

  it('should have at least 3 prevention and mitigation items', () => {
    for (const f of k8sFailures) {
      expect(f.preventionKo.length).toBeGreaterThanOrEqual(3);
      expect(f.mitigationKo.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('should have trust metadata', () => {
    for (const f of k8sFailures) {
      expect(f.trust.sources.length).toBeGreaterThanOrEqual(1);
      expect(f.trust.confidence).toBeGreaterThan(0);
    }
  });

  it('should have tags with at least "kubernetes"', () => {
    for (const f of k8sFailures) {
      expect(f.tags).toContain('kubernetes');
    }
  });

  it('should cover expected components', () => {
    const components = k8sFailures.map((f) => f.component);
    expect(components).toContain('kubernetes');
    expect(components).toContain('container');
  });
});

// ---------------------------------------------------------------------------
// 3. K8s Relationships (6)
// ---------------------------------------------------------------------------

describe('K8s Relationships', () => {
  const k8sRels = RELATIONSHIPS.filter((r) => r.id.startsWith('REL-K8S-'));

  it('should have exactly 6 K8s relationships', () => {
    expect(k8sRels).toHaveLength(6);
  });

  it('should have unique IDs from REL-K8S-001 to REL-K8S-006', () => {
    const ids = k8sRels.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(6);
    for (let i = 1; i <= 6; i++) {
      const expectedId = `REL-K8S-${String(i).padStart(3, '0')}`;
      expect(ids).toContain(expectedId);
    }
  });

  it('should have type "relationship" on every entry', () => {
    for (const rel of k8sRels) {
      expect(rel.type).toBe('relationship');
    }
  });

  it('should have valid source and target InfraNodeTypes', () => {
    for (const rel of k8sRels) {
      expect(ALL_VALID_TYPES).toContain(rel.source);
      expect(ALL_VALID_TYPES).toContain(rel.target);
    }
  });

  it('should have trust metadata with at least one source', () => {
    for (const rel of k8sRels) {
      expect(rel.trust).toBeDefined();
      expect(rel.trust.sources.length).toBeGreaterThanOrEqual(1);
      expect(rel.trust.confidence).toBeGreaterThan(0);
      expect(rel.trust.confidence).toBeLessThanOrEqual(1.0);
    }
  });

  it('should have bilingual reasons', () => {
    for (const rel of k8sRels) {
      expect(rel.reason).toBeTruthy();
      expect(rel.reasonKo).toBeTruthy();
    }
  });

  it('should have tags with at least "kubernetes" or "container"', () => {
    for (const rel of k8sRels) {
      const hasK8sTag = rel.tags.includes('kubernetes') || rel.tags.includes('container');
      expect(hasK8sTag).toBe(true);
      expect(rel.tags.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('should have valid relationship types', () => {
    const validTypes = ['requires', 'recommends', 'conflicts', 'enhances', 'protects'];
    for (const rel of k8sRels) {
      expect(validTypes).toContain(rel.relationshipType);
    }
  });

  it('should have valid direction values', () => {
    const validDirections = ['upstream', 'downstream', 'bidirectional'];
    for (const rel of k8sRels) {
      expect(validDirections).toContain(rel.direction);
    }
  });

  it('should include kubernetes-to-firewall recommendation', () => {
    const k8sToFw = k8sRels.find(
      (r) => r.source === 'kubernetes' && r.target === 'firewall',
    );
    expect(k8sToFw).toBeDefined();
    expect(k8sToFw!.relationshipType).toBe('recommends');
  });

  it('should include container-to-load-balancer recommendation', () => {
    const containerToLb = k8sRels.find(
      (r) => r.source === 'container' && r.target === 'load-balancer',
    );
    expect(containerToLb).toBeDefined();
    expect(containerToLb!.relationshipType).toBe('recommends');
  });
});

// ---------------------------------------------------------------------------
// 4. K8s Patterns (2)
// ---------------------------------------------------------------------------

describe('K8s Patterns', () => {
  const k8sPatterns = ARCHITECTURE_PATTERNS.filter((p) => p.id.startsWith('PAT-K8S-'));

  it('should have exactly 3 K8s patterns', () => {
    expect(k8sPatterns).toHaveLength(3);
  });

  it('should have unique IDs PAT-K8S-001 through PAT-K8S-003', () => {
    const ids = k8sPatterns.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(3);
    expect(ids).toContain('PAT-K8S-001');
    expect(ids).toContain('PAT-K8S-002');
    expect(ids).toContain('PAT-K8S-003');
  });

  it('should have type "pattern" on every entry', () => {
    for (const pat of k8sPatterns) {
      expect(pat.type).toBe('pattern');
    }
  });

  it('should have valid requiredComponent types', () => {
    for (const pat of k8sPatterns) {
      for (const req of pat.requiredComponents) {
        expect(ALL_VALID_TYPES).toContain(req.type);
        expect(req.minCount).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('should have complexity in valid range (1-5)', () => {
    for (const pat of k8sPatterns) {
      expect(pat.complexity).toBeGreaterThanOrEqual(1);
      expect(pat.complexity).toBeLessThanOrEqual(5);
    }
  });

  it('should have bilingual names and descriptions', () => {
    for (const pat of k8sPatterns) {
      expect(pat.name).toBeTruthy();
      expect(pat.nameKo).toBeTruthy();
      expect(pat.description).toBeTruthy();
      expect(pat.descriptionKo).toBeTruthy();
    }
  });

  it('should have bestForKo and notSuitableForKo', () => {
    for (const pat of k8sPatterns) {
      expect(pat.bestForKo.length).toBeGreaterThanOrEqual(2);
      expect(pat.notSuitableForKo.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('should have trust metadata with at least one source', () => {
    for (const pat of k8sPatterns) {
      expect(pat.trust.sources.length).toBeGreaterThanOrEqual(1);
      expect(pat.trust.confidence).toBeGreaterThan(0);
    }
  });

  it('should have valid scalability values', () => {
    const validScalability = ['low', 'medium', 'high', 'auto'];
    for (const pat of k8sPatterns) {
      expect(validScalability).toContain(pat.scalability);
    }
  });

  it('should have tags with at least "kubernetes"', () => {
    for (const pat of k8sPatterns) {
      expect(pat.tags).toContain('kubernetes');
    }
  });

  it('PAT-K8S-001 (Service Mesh) should require kubernetes, 2+ containers, and load-balancer', () => {
    const pat1 = k8sPatterns.find((p) => p.id === 'PAT-K8S-001');
    expect(pat1).toBeDefined();

    const reqTypes = pat1!.requiredComponents.map((r) => r.type);
    expect(reqTypes).toContain('kubernetes');
    expect(reqTypes).toContain('container');
    expect(reqTypes).toContain('load-balancer');

    const containerReq = pat1!.requiredComponents.find((r) => r.type === 'container');
    expect(containerReq!.minCount).toBeGreaterThanOrEqual(2);
  });

  it('should detect PAT-K8S-001 for matching spec', () => {
    const spec = createSpec([
      'kubernetes', 'container', 'container', 'load-balancer',
    ]);
    const detected = detectPatterns(spec);
    const ids = detected.map((p) => p.id);
    expect(ids).toContain('PAT-K8S-001');
  });

  it('should NOT detect PAT-K8S-001 when missing load-balancer', () => {
    const spec = createSpec(['kubernetes', 'container', 'container']);
    const detected = detectPatterns(spec);
    const ids = detected.map((p) => p.id);
    expect(ids).not.toContain('PAT-K8S-001');
  });

  it('should NOT detect PAT-K8S-001 when only 1 container', () => {
    const spec = createSpec(['kubernetes', 'container', 'load-balancer']);
    const detected = detectPatterns(spec);
    const ids = detected.map((p) => p.id);
    expect(ids).not.toContain('PAT-K8S-001');
  });
});
