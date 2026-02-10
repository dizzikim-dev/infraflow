import { describe, it, expect } from 'vitest';
import { RELATIONSHIPS } from '../relationships';
import { ARCHITECTURE_PATTERNS, detectPatterns } from '../patterns';
import { FAILURE_SCENARIOS } from '../failures';
import type { InfraSpec, InfraNodeType } from '@/types/infra';

// ---------------------------------------------------------------------------
// Helper: valid InfraNodeType set (all categories)
// ---------------------------------------------------------------------------

const ALL_VALID_TYPES: InfraNodeType[] = [
  // Security
  'firewall', 'waf', 'ids-ips', 'vpn-gateway', 'nac', 'dlp',
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
  // Telecom
  'central-office', 'base-station', 'olt', 'customer-premise', 'idc',
  // WAN
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
// 1. Hybrid Relationships (REL-HYB-001 ~ REL-HYB-006)
// ---------------------------------------------------------------------------

describe('Hybrid Relationships', () => {
  const hybridRels = RELATIONSHIPS.filter((r) => r.id.startsWith('REL-HYB-'));

  it('should have exactly 6 hybrid relationships', () => {
    expect(hybridRels).toHaveLength(6);
  });

  it('should have unique IDs from REL-HYB-001 to REL-HYB-006', () => {
    const ids = hybridRels.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(6);
    for (let i = 1; i <= 6; i++) {
      const expectedId = `REL-HYB-${String(i).padStart(3, '0')}`;
      expect(ids).toContain(expectedId);
    }
  });

  it('should have type "relationship" on every entry', () => {
    for (const rel of hybridRels) {
      expect(rel.type).toBe('relationship');
    }
  });

  it('should have valid source and target InfraNodeTypes', () => {
    for (const rel of hybridRels) {
      expect(ALL_VALID_TYPES).toContain(rel.source);
      expect(ALL_VALID_TYPES).toContain(rel.target);
    }
  });

  it('should have valid relationship types', () => {
    const validTypes = ['requires', 'recommends', 'conflicts', 'enhances', 'protects'];
    for (const rel of hybridRels) {
      expect(validTypes).toContain(rel.relationshipType);
    }
  });

  it('should have valid direction values', () => {
    const validDirections = ['upstream', 'downstream', 'bidirectional'];
    for (const rel of hybridRels) {
      expect(validDirections).toContain(rel.direction);
    }
  });

  it('should have bilingual reasons', () => {
    for (const rel of hybridRels) {
      expect(rel.reason).toBeTruthy();
      expect(rel.reasonKo).toBeTruthy();
    }
  });

  it('should have tags with at least "hybrid"', () => {
    for (const rel of hybridRels) {
      expect(rel.tags).toContain('hybrid');
      expect(rel.tags.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('should include private-cloud to public-cloud relationships', () => {
    const pcToAws = hybridRels.find(
      (r) => r.source === 'private-cloud' && r.target === 'aws-vpc',
    );
    expect(pcToAws).toBeDefined();

    const pcToAzure = hybridRels.find(
      (r) => r.source === 'private-cloud' && r.target === 'azure-vnet',
    );
    expect(pcToAzure).toBeDefined();
  });

  it('should include VPN gateway relationships for cloud VPCs', () => {
    const awsToVpn = hybridRels.find(
      (r) => r.source === 'aws-vpc' && r.target === 'vpn-gateway',
    );
    expect(awsToVpn).toBeDefined();

    const azureToVpn = hybridRels.find(
      (r) => r.source === 'azure-vnet' && r.target === 'vpn-gateway',
    );
    expect(azureToVpn).toBeDefined();

    const gcpToVpn = hybridRels.find(
      (r) => r.source === 'gcp-network' && r.target === 'vpn-gateway',
    );
    expect(gcpToVpn).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// 2. Hybrid Failures (FAIL-HYB-001 ~ FAIL-HYB-004)
// ---------------------------------------------------------------------------

describe('Hybrid Failures', () => {
  const hybridFailures = FAILURE_SCENARIOS.filter((f) => f.id.startsWith('FAIL-HYB-'));

  it('should have exactly 4 hybrid failure scenarios', () => {
    expect(hybridFailures).toHaveLength(4);
  });

  it('should have unique IDs from FAIL-HYB-001 to FAIL-HYB-004', () => {
    const ids = hybridFailures.map((f) => f.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(4);
    for (let i = 1; i <= 4; i++) {
      const expectedId = `FAIL-HYB-${String(i).padStart(3, '0')}`;
      expect(ids).toContain(expectedId);
    }
  });

  it('should have type "failure" on every entry', () => {
    for (const f of hybridFailures) {
      expect(f.type).toBe('failure');
    }
  });

  it('should have valid component types', () => {
    for (const f of hybridFailures) {
      expect(ALL_VALID_TYPES).toContain(f.component);
    }
  });

  it('should have valid affectedComponents', () => {
    for (const f of hybridFailures) {
      for (const affected of f.affectedComponents) {
        expect(ALL_VALID_TYPES).toContain(affected);
      }
    }
  });

  it('should have valid impact types', () => {
    const validImpacts = ['service-down', 'degraded', 'data-loss', 'security-breach'];
    for (const f of hybridFailures) {
      expect(validImpacts).toContain(f.impact);
    }
  });

  it('should have valid likelihood levels', () => {
    const validLikelihoods = ['high', 'medium', 'low'];
    for (const f of hybridFailures) {
      expect(validLikelihoods).toContain(f.likelihood);
    }
  });

  it('should have Korean fields', () => {
    for (const f of hybridFailures) {
      expect(f.titleKo).toBeTruthy();
      expect(f.scenarioKo).toBeTruthy();
      expect(f.estimatedMTTR).toBeTruthy();
    }
  });

  it('should have at least 3 prevention and mitigation items', () => {
    for (const f of hybridFailures) {
      expect(f.preventionKo.length).toBeGreaterThanOrEqual(3);
      expect(f.mitigationKo.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('should have tags with at least "hybrid"', () => {
    for (const f of hybridFailures) {
      expect(f.tags).toContain('hybrid');
      expect(f.tags.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('should cover expected failure components', () => {
    const components = hybridFailures.map((f) => f.component);
    expect(components).toContain('vpn-gateway');
    expect(components).toContain('private-cloud');
    expect(components).toContain('dns');
    expect(components).toContain('db-server');
  });
});

// ---------------------------------------------------------------------------
// 3. Hybrid Patterns (PAT-HYB-001 ~ PAT-HYB-002)
// ---------------------------------------------------------------------------

describe('Hybrid Patterns', () => {
  const hybridPatterns = ARCHITECTURE_PATTERNS.filter((p) => p.id.startsWith('PAT-HYB-'));

  it('should have exactly 2 hybrid patterns', () => {
    expect(hybridPatterns).toHaveLength(2);
  });

  it('should have unique IDs PAT-HYB-001 and PAT-HYB-002', () => {
    const ids = hybridPatterns.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(2);
    expect(ids).toContain('PAT-HYB-001');
    expect(ids).toContain('PAT-HYB-002');
  });

  it('should have type "pattern" on every entry', () => {
    for (const pat of hybridPatterns) {
      expect(pat.type).toBe('pattern');
    }
  });

  it('should have valid requiredComponent types', () => {
    for (const pat of hybridPatterns) {
      for (const req of pat.requiredComponents) {
        expect(ALL_VALID_TYPES).toContain(req.type);
        expect(req.minCount).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('should have complexity in valid range (1-5)', () => {
    for (const pat of hybridPatterns) {
      expect(pat.complexity).toBeGreaterThanOrEqual(1);
      expect(pat.complexity).toBeLessThanOrEqual(5);
    }
  });

  it('should have bilingual names and descriptions', () => {
    for (const pat of hybridPatterns) {
      expect(pat.name).toBeTruthy();
      expect(pat.nameKo).toBeTruthy();
      expect(pat.description).toBeTruthy();
      expect(pat.descriptionKo).toBeTruthy();
    }
  });

  it('should have bestForKo and notSuitableForKo', () => {
    for (const pat of hybridPatterns) {
      expect(pat.bestForKo.length).toBeGreaterThanOrEqual(2);
      expect(pat.notSuitableForKo.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('should have valid scalability values', () => {
    const validScalability = ['low', 'medium', 'high', 'auto'];
    for (const pat of hybridPatterns) {
      expect(validScalability).toContain(pat.scalability);
    }
  });

  it('should have tags with at least "hybrid"', () => {
    for (const pat of hybridPatterns) {
      expect(pat.tags).toContain('hybrid');
    }
  });

  it('PAT-HYB-001 (Hybrid Cloud DR) should require private-cloud, backup, vpn-gateway', () => {
    const pat1 = hybridPatterns.find((p) => p.id === 'PAT-HYB-001');
    expect(pat1).toBeDefined();
    expect(pat1!.name).toBe('Hybrid Cloud DR');
    const reqTypes = pat1!.requiredComponents.map((r) => r.type);
    expect(reqTypes).toContain('private-cloud');
    expect(reqTypes).toContain('backup');
    expect(reqTypes).toContain('vpn-gateway');
  });

  it('PAT-HYB-002 (Multi-Cloud Active-Active) should require load-balancer, dns, firewall', () => {
    const pat2 = hybridPatterns.find((p) => p.id === 'PAT-HYB-002');
    expect(pat2).toBeDefined();
    expect(pat2!.name).toBe('Multi-Cloud Active-Active');
    const reqTypes = pat2!.requiredComponents.map((r) => r.type);
    expect(reqTypes).toContain('load-balancer');
    expect(reqTypes).toContain('dns');
    expect(reqTypes).toContain('firewall');
  });

  it('PAT-HYB-001 should evolve to PAT-HYB-002', () => {
    const pat1 = hybridPatterns.find((p) => p.id === 'PAT-HYB-001');
    expect(pat1!.evolvesTo).toContain('PAT-HYB-002');
  });

  it('PAT-HYB-002 should evolve from PAT-HYB-001', () => {
    const pat2 = hybridPatterns.find((p) => p.id === 'PAT-HYB-002');
    expect(pat2!.evolvesFrom).toContain('PAT-HYB-001');
  });

  it('should detect PAT-HYB-001 for matching spec', () => {
    const spec = createSpec(['private-cloud', 'backup', 'vpn-gateway']);
    const detected = detectPatterns(spec);
    const ids = detected.map((p) => p.id);
    expect(ids).toContain('PAT-HYB-001');
  });

  it('should detect PAT-HYB-002 for matching spec', () => {
    const spec = createSpec(['load-balancer', 'dns', 'firewall']);
    const detected = detectPatterns(spec);
    const ids = detected.map((p) => p.id);
    expect(ids).toContain('PAT-HYB-002');
  });

  it('should not detect PAT-HYB-001 when required components are missing', () => {
    const spec = createSpec(['private-cloud', 'backup']); // missing vpn-gateway
    const detected = detectPatterns(spec);
    const ids = detected.map((p) => p.id);
    expect(ids).not.toContain('PAT-HYB-001');
  });
});

// ---------------------------------------------------------------------------
// 4. Trust metadata validation
// ---------------------------------------------------------------------------

describe('Hybrid Trust Metadata', () => {
  const hybridRels = RELATIONSHIPS.filter((r) => r.id.startsWith('REL-HYB-'));
  const hybridFailures = FAILURE_SCENARIOS.filter((f) => f.id.startsWith('FAIL-HYB-'));
  const hybridPatterns = ARCHITECTURE_PATTERNS.filter((p) => p.id.startsWith('PAT-HYB-'));

  it('all hybrid relationships should have confidence > 0', () => {
    for (const rel of hybridRels) {
      expect(rel.trust.confidence).toBeGreaterThan(0);
      expect(rel.trust.confidence).toBeLessThanOrEqual(1.0);
    }
  });

  it('all hybrid relationships should have at least one source', () => {
    for (const rel of hybridRels) {
      expect(rel.trust.sources.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('all hybrid relationships should have lastReviewedAt', () => {
    for (const rel of hybridRels) {
      expect(rel.trust.lastReviewedAt).toBeTruthy();
    }
  });

  it('all hybrid failures should have confidence > 0', () => {
    for (const f of hybridFailures) {
      expect(f.trust.confidence).toBeGreaterThan(0);
      expect(f.trust.confidence).toBeLessThanOrEqual(1.0);
    }
  });

  it('all hybrid failures should have at least one source', () => {
    for (const f of hybridFailures) {
      expect(f.trust.sources.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('all hybrid failures should have lastReviewedAt', () => {
    for (const f of hybridFailures) {
      expect(f.trust.lastReviewedAt).toBeTruthy();
    }
  });

  it('all hybrid patterns should have confidence > 0', () => {
    for (const pat of hybridPatterns) {
      expect(pat.trust.confidence).toBeGreaterThan(0);
      expect(pat.trust.confidence).toBeLessThanOrEqual(1.0);
    }
  });

  it('all hybrid patterns should have at least one source', () => {
    for (const pat of hybridPatterns) {
      expect(pat.trust.sources.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('all hybrid patterns should have lastReviewedAt', () => {
    for (const pat of hybridPatterns) {
      expect(pat.trust.lastReviewedAt).toBeTruthy();
    }
  });
});
