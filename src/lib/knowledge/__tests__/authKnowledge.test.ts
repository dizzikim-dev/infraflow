import { describe, it, expect } from 'vitest';
import { RELATIONSHIPS } from '../relationships';
import { ANTI_PATTERNS, detectAntiPatterns } from '../antipatterns';
import { FAILURE_SCENARIOS } from '../failures';
import { ARCHITECTURE_PATTERNS, detectPatterns } from '../patterns';
import type { InfraSpec, InfraNodeType } from '@/types/infra';

// ---------------------------------------------------------------------------
// Helper: valid InfraNodeType set (same full list as other knowledge tests)
// ---------------------------------------------------------------------------

const ALL_VALID_TYPES: InfraNodeType[] = [
  // Telecom
  'central-office', 'base-station', 'olt', 'customer-premise', 'idc',
  'pe-router', 'p-router', 'mpls-network', 'dedicated-line', 'metro-ethernet',
  'corporate-internet', 'vpn-service', 'sd-wan-service', 'private-5g',
  'core-network', 'upf', 'ring-network',
  // Security
  'firewall', 'waf', 'ids-ips', 'vpn-gateway', 'nac', 'dlp',
  'sase-gateway', 'ztna-broker', 'casb', 'siem', 'soar',
  // Network
  'router', 'switch-l2', 'switch-l3', 'load-balancer', 'sd-wan', 'dns', 'cdn',
  // Compute
  'web-server', 'app-server', 'db-server', 'container', 'vm', 'kubernetes',
  // Cloud
  'aws-vpc', 'azure-vnet', 'gcp-network', 'private-cloud',
  // Storage
  'san-nas', 'object-storage', 'backup', 'cache', 'storage',
  // Auth
  'ldap-ad', 'sso', 'mfa', 'iam',
  // External
  'user', 'internet',
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
// 1. Auth Antipatterns (AP-AUTH-001 ~ AP-AUTH-004)
// ---------------------------------------------------------------------------

describe('Auth Antipatterns', () => {
  const authAPs = ANTI_PATTERNS.filter((ap) => ap.id.startsWith('AP-AUTH-'));

  it('should have exactly 4 auth antipatterns', () => {
    expect(authAPs).toHaveLength(4);
  });

  it('should have unique IDs from AP-AUTH-001 to AP-AUTH-004', () => {
    const ids = authAPs.map((ap) => ap.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(4);
    for (let i = 1; i <= 4; i++) {
      const expectedId = `AP-AUTH-${String(i).padStart(3, '0')}`;
      expect(ids).toContain(expectedId);
    }
  });

  it('should have type "antipattern" on every entry', () => {
    for (const ap of authAPs) {
      expect(ap.type).toBe('antipattern');
    }
  });

  it('should have valid severity levels', () => {
    const validSeverity = ['critical', 'high', 'medium'];
    for (const ap of authAPs) {
      expect(validSeverity).toContain(ap.severity);
    }
  });

  it('should have detection functions', () => {
    for (const ap of authAPs) {
      expect(typeof ap.detection).toBe('function');
    }
  });

  it('should have Korean description fields', () => {
    for (const ap of authAPs) {
      expect(ap.nameKo).toBeTruthy();
      expect(ap.detectionDescriptionKo).toBeTruthy();
      expect(ap.problemKo).toBeTruthy();
      expect(ap.impactKo).toBeTruthy();
      expect(ap.solutionKo).toBeTruthy();
    }
  });

  it('should have trust metadata', () => {
    for (const ap of authAPs) {
      expect(ap.trust.sources.length).toBeGreaterThanOrEqual(1);
      expect(ap.trust.confidence).toBeGreaterThan(0);
    }
  });

  // Detection function tests

  it('AP-AUTH-001 (No MFA): should trigger for [sso] without mfa', () => {
    const specBad = createSpec(['sso']);
    const detected = detectAntiPatterns(specBad);
    expect(detected.map((ap) => ap.id)).toContain('AP-AUTH-001');
  });

  it('AP-AUTH-001 (No MFA): should NOT trigger for [sso, mfa]', () => {
    const specGood = createSpec(['sso', 'mfa']);
    const detected = detectAntiPatterns(specGood);
    expect(detected.map((ap) => ap.id)).not.toContain('AP-AUTH-001');
  });

  it('AP-AUTH-002 (No Internal Access Control): should trigger for [web-server, firewall] without auth types', () => {
    const specBad = createSpec(['web-server', 'firewall']);
    const detected = detectAntiPatterns(specBad);
    expect(detected.map((ap) => ap.id)).toContain('AP-AUTH-002');
  });

  it('AP-AUTH-002 (No Internal Access Control): should NOT trigger for [web-server, firewall, iam]', () => {
    const specGood = createSpec(['web-server', 'firewall', 'iam']);
    const detected = detectAntiPatterns(specGood);
    expect(detected.map((ap) => ap.id)).not.toContain('AP-AUTH-002');
  });

  it('AP-AUTH-003 (No VPN): should trigger for [internet, web-server] without vpn-gateway', () => {
    const specBad = createSpec(['internet', 'web-server']);
    const detected = detectAntiPatterns(specBad);
    expect(detected.map((ap) => ap.id)).toContain('AP-AUTH-003');
  });

  it('AP-AUTH-003 (No VPN): should NOT trigger for [internet, web-server, vpn-gateway]', () => {
    const specGood = createSpec(['internet', 'web-server', 'vpn-gateway']);
    const detected = detectAntiPatterns(specGood);
    expect(detected.map((ap) => ap.id)).not.toContain('AP-AUTH-003');
  });

  it('AP-AUTH-004 (No Central Auth): should trigger for [web-server, app-server] (2+ compute without sso/ldap)', () => {
    const specBad = createSpec(['web-server', 'app-server']);
    const detected = detectAntiPatterns(specBad);
    expect(detected.map((ap) => ap.id)).toContain('AP-AUTH-004');
  });

  it('AP-AUTH-004 (No Central Auth): should NOT trigger for [web-server, app-server, sso]', () => {
    const specGood = createSpec(['web-server', 'app-server', 'sso']);
    const detected = detectAntiPatterns(specGood);
    expect(detected.map((ap) => ap.id)).not.toContain('AP-AUTH-004');
  });
});

// ---------------------------------------------------------------------------
// 2. Auth Failures (FAIL-AUTH-004 ~ FAIL-AUTH-007)
// ---------------------------------------------------------------------------

describe('Auth Failures (Extended)', () => {
  const authExtFailures = FAILURE_SCENARIOS.filter(
    (f) => f.id.startsWith('FAIL-AUTH-') && parseInt(f.id.replace('FAIL-AUTH-', ''), 10) >= 4,
  );

  it('should have exactly 4 extended auth failure scenarios', () => {
    expect(authExtFailures).toHaveLength(4);
  });

  it('should have unique IDs from FAIL-AUTH-004 to FAIL-AUTH-007', () => {
    const ids = authExtFailures.map((f) => f.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(4);
    for (let i = 4; i <= 7; i++) {
      const expectedId = `FAIL-AUTH-${String(i).padStart(3, '0')}`;
      expect(ids).toContain(expectedId);
    }
  });

  it('should have type "failure" on every entry', () => {
    for (const f of authExtFailures) {
      expect(f.type).toBe('failure');
    }
  });

  it('should have valid component types', () => {
    for (const f of authExtFailures) {
      expect(ALL_VALID_TYPES).toContain(f.component);
    }
  });

  it('should have valid affectedComponents', () => {
    for (const f of authExtFailures) {
      for (const affected of f.affectedComponents) {
        expect(ALL_VALID_TYPES).toContain(affected);
      }
    }
  });

  it('should have valid impact types', () => {
    const validImpacts = ['service-down', 'degraded', 'data-loss', 'security-breach'];
    for (const f of authExtFailures) {
      expect(validImpacts).toContain(f.impact);
    }
  });

  it('should have valid likelihood levels', () => {
    const validLikelihoods = ['high', 'medium', 'low'];
    for (const f of authExtFailures) {
      expect(validLikelihoods).toContain(f.likelihood);
    }
  });

  it('should have Korean fields', () => {
    for (const f of authExtFailures) {
      expect(f.titleKo).toBeTruthy();
      expect(f.scenarioKo).toBeTruthy();
      expect(f.estimatedMTTR).toBeTruthy();
    }
  });

  it('should have at least 3 prevention and mitigation items', () => {
    for (const f of authExtFailures) {
      expect(f.preventionKo.length).toBeGreaterThanOrEqual(3);
      expect(f.mitigationKo.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('should have trust metadata', () => {
    for (const f of authExtFailures) {
      expect(f.trust.sources.length).toBeGreaterThanOrEqual(1);
      expect(f.trust.confidence).toBeGreaterThan(0);
    }
  });

  it('should have tags with at least "auth"', () => {
    for (const f of authExtFailures) {
      expect(f.tags).toContain('auth');
    }
  });

  it('should cover expected components (sso, iam, vpn-gateway, nac)', () => {
    const components = authExtFailures.map((f) => f.component);
    expect(components).toContain('sso');
    expect(components).toContain('iam');
    expect(components).toContain('vpn-gateway');
    expect(components).toContain('nac');
  });
});

// ---------------------------------------------------------------------------
// 3. Auth Relationships (REL-AUTH-030 ~ REL-AUTH-035)
// ---------------------------------------------------------------------------

describe('Auth Relationships (Extended)', () => {
  const authExtRels = RELATIONSHIPS.filter((r) => r.id.startsWith('REL-AUTH-03'));

  it('should have exactly 6 auth extended relationships', () => {
    expect(authExtRels).toHaveLength(6);
  });

  it('should have unique IDs from REL-AUTH-030 to REL-AUTH-035', () => {
    const ids = authExtRels.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(6);
    for (let i = 30; i <= 35; i++) {
      const expectedId = `REL-AUTH-${String(i).padStart(3, '0')}`;
      expect(ids).toContain(expectedId);
    }
  });

  it('should have type "relationship" on every entry', () => {
    for (const rel of authExtRels) {
      expect(rel.type).toBe('relationship');
    }
  });

  it('should have valid source and target InfraNodeTypes', () => {
    for (const rel of authExtRels) {
      expect(ALL_VALID_TYPES).toContain(rel.source);
      expect(ALL_VALID_TYPES).toContain(rel.target);
    }
  });

  it('should have trust metadata with at least one source', () => {
    for (const rel of authExtRels) {
      expect(rel.trust).toBeDefined();
      expect(rel.trust.sources.length).toBeGreaterThanOrEqual(1);
      expect(rel.trust.confidence).toBeGreaterThan(0);
      expect(rel.trust.confidence).toBeLessThanOrEqual(1.0);
    }
  });

  it('should have bilingual reasons', () => {
    for (const rel of authExtRels) {
      expect(rel.reason).toBeTruthy();
      expect(rel.reasonKo).toBeTruthy();
    }
  });

  it('should have tags with at least "auth"', () => {
    for (const rel of authExtRels) {
      expect(rel.tags).toContain('auth');
      expect(rel.tags.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('should have valid relationship types', () => {
    const validTypes = ['requires', 'recommends', 'conflicts', 'enhances', 'protects'];
    for (const rel of authExtRels) {
      expect(validTypes).toContain(rel.relationshipType);
    }
  });

  it('should have valid direction values', () => {
    const validDirections = ['upstream', 'downstream', 'bidirectional'];
    for (const rel of authExtRels) {
      expect(validDirections).toContain(rel.direction);
    }
  });

  it('should include key auth dependency chains', () => {
    // SSO -> MFA (recommends)
    const ssoToMfa = authExtRels.find(
      (r) => r.source === 'sso' && r.target === 'mfa',
    );
    expect(ssoToMfa).toBeDefined();
    expect(ssoToMfa!.relationshipType).toBe('recommends');

    // VPN Gateway -> MFA (requires)
    const vpnToMfa = authExtRels.find(
      (r) => r.source === 'vpn-gateway' && r.target === 'mfa',
    );
    expect(vpnToMfa).toBeDefined();
    expect(vpnToMfa!.relationshipType).toBe('requires');

    // IAM -> LDAP/AD (recommends)
    const iamToLdap = authExtRels.find(
      (r) => r.source === 'iam' && r.target === 'ldap-ad',
    );
    expect(iamToLdap).toBeDefined();
    expect(iamToLdap!.relationshipType).toBe('recommends');
  });
});

// ---------------------------------------------------------------------------
// 4. Security Patterns (PAT-SEC-016 ~ PAT-SEC-017)
// ---------------------------------------------------------------------------

describe('Security Patterns (Zero Trust / SASE)', () => {
  const secPatterns = ARCHITECTURE_PATTERNS.filter(
    (p) => p.id === 'PAT-SEC-016' || p.id === 'PAT-SEC-017',
  );

  it('should have exactly 2 security extension patterns', () => {
    expect(secPatterns).toHaveLength(2);
  });

  it('should have unique IDs PAT-SEC-016 and PAT-SEC-017', () => {
    const ids = secPatterns.map((p) => p.id);
    expect(ids).toContain('PAT-SEC-016');
    expect(ids).toContain('PAT-SEC-017');
  });

  it('should have type "pattern" on every entry', () => {
    for (const pat of secPatterns) {
      expect(pat.type).toBe('pattern');
    }
  });

  it('should have valid requiredComponent types', () => {
    for (const pat of secPatterns) {
      for (const req of pat.requiredComponents) {
        expect(ALL_VALID_TYPES).toContain(req.type);
        expect(req.minCount).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('should have complexity in valid range (1-5)', () => {
    for (const pat of secPatterns) {
      expect(pat.complexity).toBeGreaterThanOrEqual(1);
      expect(pat.complexity).toBeLessThanOrEqual(5);
    }
  });

  it('should have bilingual names and descriptions', () => {
    for (const pat of secPatterns) {
      expect(pat.name).toBeTruthy();
      expect(pat.nameKo).toBeTruthy();
      expect(pat.description).toBeTruthy();
      expect(pat.descriptionKo).toBeTruthy();
    }
  });

  it('should have bestForKo and notSuitableForKo', () => {
    for (const pat of secPatterns) {
      expect(pat.bestForKo.length).toBeGreaterThanOrEqual(2);
      expect(pat.notSuitableForKo.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('should have trust metadata with at least one source', () => {
    for (const pat of secPatterns) {
      expect(pat.trust.sources.length).toBeGreaterThanOrEqual(1);
      expect(pat.trust.confidence).toBeGreaterThan(0);
    }
  });

  it('should have valid scalability values', () => {
    const validScalability = ['low', 'medium', 'high', 'auto'];
    for (const pat of secPatterns) {
      expect(validScalability).toContain(pat.scalability);
    }
  });

  it('should have tags with at least "security"', () => {
    for (const pat of secPatterns) {
      expect(pat.tags).toContain('security');
    }
  });

  it('PAT-SEC-016 (Zero Trust) requires firewall, iam, mfa', () => {
    const ztna = secPatterns.find((p) => p.id === 'PAT-SEC-016')!;
    const reqTypes = ztna.requiredComponents.map((c) => c.type);
    expect(reqTypes).toContain('firewall');
    expect(reqTypes).toContain('iam');
    expect(reqTypes).toContain('mfa');
  });

  it('PAT-SEC-017 (SASE) requires sase-gateway, sd-wan, iam', () => {
    const sase = secPatterns.find((p) => p.id === 'PAT-SEC-017')!;
    const reqTypes = sase.requiredComponents.map((c) => c.type);
    expect(reqTypes).toContain('sase-gateway');
    expect(reqTypes).toContain('sd-wan');
    expect(reqTypes).toContain('iam');
  });

  it('should detect PAT-SEC-016 for matching spec', () => {
    const spec = createSpec(['firewall', 'iam', 'mfa']);
    const detected = detectPatterns(spec);
    const ids = detected.map((p) => p.id);
    expect(ids).toContain('PAT-SEC-016');
  });

  it('should detect PAT-SEC-017 for matching spec', () => {
    const spec = createSpec(['sase-gateway', 'sd-wan', 'iam']);
    const detected = detectPatterns(spec);
    const ids = detected.map((p) => p.id);
    expect(ids).toContain('PAT-SEC-017');
  });
});
