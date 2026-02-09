import { describe, it, expect } from 'vitest';
import { RELATIONSHIPS } from '../relationships';
import { ARCHITECTURE_PATTERNS, detectPatterns } from '../patterns';
import { ANTI_PATTERNS, detectAntiPatterns } from '../antipatterns';
import { FAILURE_SCENARIOS } from '../failures';
import { PERFORMANCE_PROFILES } from '../performance';
import { ALL_SOURCES } from '../sourceRegistry';
import type { InfraSpec, InfraNodeType } from '@/types/infra';

// ---------------------------------------------------------------------------
// Helper: valid InfraNodeType set (telecom + wan types from PR-1)
// ---------------------------------------------------------------------------

const VALID_TELECOM_TYPES: InfraNodeType[] = [
  'central-office', 'base-station', 'olt', 'customer-premise', 'idc',
  'pe-router', 'p-router', 'mpls-network', 'dedicated-line', 'metro-ethernet',
  'corporate-internet', 'vpn-service', 'sd-wan-service', 'private-5g',
  'core-network', 'upf', 'ring-network',
];

const ALL_VALID_TYPES: InfraNodeType[] = [
  ...VALID_TELECOM_TYPES,
  'firewall', 'waf', 'ids-ips', 'vpn-gateway', 'nac', 'dlp',
  'router', 'switch-l2', 'switch-l3', 'load-balancer', 'sd-wan', 'dns', 'cdn',
  'web-server', 'app-server', 'db-server', 'container', 'vm', 'kubernetes',
  'aws-vpc', 'azure-vnet', 'gcp-network', 'private-cloud',
  'san-nas', 'object-storage', 'backup', 'cache', 'storage',
  'ldap-ad', 'sso', 'mfa', 'iam',
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
// 1. Telecom Relationships (20)
// ---------------------------------------------------------------------------

describe('Telecom Relationships', () => {
  const telecomRels = RELATIONSHIPS.filter((r) => r.id.startsWith('REL-TEL-'));

  it('should have exactly 20 telecom relationships', () => {
    expect(telecomRels).toHaveLength(20);
  });

  it('should have unique IDs from REL-TEL-001 to REL-TEL-020', () => {
    const ids = telecomRels.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(20);
    for (let i = 1; i <= 20; i++) {
      const expectedId = `REL-TEL-${String(i).padStart(3, '0')}`;
      expect(ids).toContain(expectedId);
    }
  });

  it('should have type "relationship" on every entry', () => {
    for (const rel of telecomRels) {
      expect(rel.type).toBe('relationship');
    }
  });

  it('should have valid source and target InfraNodeTypes', () => {
    for (const rel of telecomRels) {
      expect(ALL_VALID_TYPES).toContain(rel.source);
      expect(ALL_VALID_TYPES).toContain(rel.target);
    }
  });

  it('should have trust metadata with at least one source', () => {
    for (const rel of telecomRels) {
      expect(rel.trust).toBeDefined();
      expect(rel.trust.sources.length).toBeGreaterThanOrEqual(1);
      expect(rel.trust.confidence).toBeGreaterThan(0);
      expect(rel.trust.confidence).toBeLessThanOrEqual(1.0);
    }
  });

  it('should have bilingual reasons', () => {
    for (const rel of telecomRels) {
      expect(rel.reason).toBeTruthy();
      expect(rel.reasonKo).toBeTruthy();
    }
  });

  it('should have tags with at least "telecom"', () => {
    for (const rel of telecomRels) {
      expect(rel.tags).toContain('telecom');
      expect(rel.tags.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('should have valid relationship types', () => {
    const validTypes = ['requires', 'recommends', 'conflicts', 'enhances', 'protects'];
    for (const rel of telecomRels) {
      expect(validTypes).toContain(rel.relationshipType);
    }
  });

  it('should have valid direction values', () => {
    const validDirections = ['upstream', 'downstream', 'bidirectional'];
    for (const rel of telecomRels) {
      expect(validDirections).toContain(rel.direction);
    }
  });

  it('should include key telecom dependency chains', () => {
    // dedicated-line -> pe-router -> p-router chain
    const dlToPe = telecomRels.find(
      (r) => r.source === 'dedicated-line' && r.target === 'pe-router',
    );
    expect(dlToPe).toBeDefined();
    expect(dlToPe!.relationshipType).toBe('requires');

    const peToPr = telecomRels.find(
      (r) => r.source === 'pe-router' && r.target === 'p-router',
    );
    expect(peToPr).toBeDefined();
    expect(peToPr!.relationshipType).toBe('requires');
  });

  it('should include 5G dependency chains', () => {
    // base-station -> core-network -> upf -> idc
    const bsToCn = telecomRels.find(
      (r) => r.source === 'base-station' && r.target === 'core-network',
    );
    expect(bsToCn).toBeDefined();

    const cnToUpf = telecomRels.find(
      (r) => r.source === 'core-network' && r.target === 'upf',
    );
    expect(cnToUpf).toBeDefined();

    const upfToIdc = telecomRels.find(
      (r) => r.source === 'upf' && r.target === 'idc',
    );
    expect(upfToIdc).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// 2. Telecom Patterns (6)
// ---------------------------------------------------------------------------

describe('Telecom Patterns', () => {
  const telecomPatterns = ARCHITECTURE_PATTERNS.filter((p) => p.id.startsWith('PAT-TEL-'));

  it('should have exactly 6 telecom patterns', () => {
    expect(telecomPatterns).toHaveLength(6);
  });

  it('should have unique IDs from PAT-TEL-001 to PAT-TEL-006', () => {
    const ids = telecomPatterns.map((p) => p.id);
    for (let i = 1; i <= 6; i++) {
      const expectedId = `PAT-TEL-${String(i).padStart(3, '0')}`;
      expect(ids).toContain(expectedId);
    }
  });

  it('should have type "pattern" on every entry', () => {
    for (const pat of telecomPatterns) {
      expect(pat.type).toBe('pattern');
    }
  });

  it('should have valid requiredComponent types', () => {
    for (const pat of telecomPatterns) {
      for (const req of pat.requiredComponents) {
        expect(ALL_VALID_TYPES).toContain(req.type);
        expect(req.minCount).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('should have complexity in valid range (1-5)', () => {
    for (const pat of telecomPatterns) {
      expect(pat.complexity).toBeGreaterThanOrEqual(1);
      expect(pat.complexity).toBeLessThanOrEqual(5);
    }
  });

  it('should have bilingual names and descriptions', () => {
    for (const pat of telecomPatterns) {
      expect(pat.name).toBeTruthy();
      expect(pat.nameKo).toBeTruthy();
      expect(pat.description).toBeTruthy();
      expect(pat.descriptionKo).toBeTruthy();
    }
  });

  it('should have bestForKo and notSuitableForKo', () => {
    for (const pat of telecomPatterns) {
      expect(pat.bestForKo.length).toBeGreaterThanOrEqual(2);
      expect(pat.notSuitableForKo.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('should have trust metadata with at least one source', () => {
    for (const pat of telecomPatterns) {
      expect(pat.trust.sources.length).toBeGreaterThanOrEqual(1);
      expect(pat.trust.confidence).toBeGreaterThan(0);
    }
  });

  it('should have valid scalability values', () => {
    const validScalability = ['low', 'medium', 'high', 'auto'];
    for (const pat of telecomPatterns) {
      expect(validScalability).toContain(pat.scalability);
    }
  });

  it('should have tags with at least "telecom"', () => {
    for (const pat of telecomPatterns) {
      expect(pat.tags).toContain('telecom');
    }
  });

  it('PAT-TEL-001 should evolve to PAT-TEL-002', () => {
    const pat1 = telecomPatterns.find((p) => p.id === 'PAT-TEL-001');
    expect(pat1!.evolvesTo).toContain('PAT-TEL-002');
  });

  it('PAT-TEL-002 should evolve to PAT-TEL-004', () => {
    const pat2 = telecomPatterns.find((p) => p.id === 'PAT-TEL-002');
    expect(pat2!.evolvesTo).toContain('PAT-TEL-004');
  });

  it('should detect PAT-TEL-001 for matching spec', () => {
    const spec = createSpec([
      'customer-premise', 'dedicated-line', 'central-office', 'pe-router', 'firewall',
    ]);
    const detected = detectPatterns(spec);
    const ids = detected.map((p) => p.id);
    expect(ids).toContain('PAT-TEL-001');
  });

  it('should detect PAT-TEL-005 for Private 5G spec', () => {
    const spec = createSpec([
      'base-station', 'core-network', 'upf', 'private-5g', 'idc', 'firewall',
    ]);
    const detected = detectPatterns(spec);
    const ids = detected.map((p) => p.id);
    expect(ids).toContain('PAT-TEL-005');
  });
});

// ---------------------------------------------------------------------------
// 3. Telecom Anti-patterns (6)
// ---------------------------------------------------------------------------

describe('Telecom Anti-patterns', () => {
  const telecomAPs = ANTI_PATTERNS.filter((ap) => ap.id.startsWith('AP-TEL-'));

  it('should have exactly 6 telecom anti-patterns', () => {
    expect(telecomAPs).toHaveLength(6);
  });

  it('should have unique IDs from AP-TEL-001 to AP-TEL-006', () => {
    const ids = telecomAPs.map((ap) => ap.id);
    for (let i = 1; i <= 6; i++) {
      const expectedId = `AP-TEL-${String(i).padStart(3, '0')}`;
      expect(ids).toContain(expectedId);
    }
  });

  it('should have type "antipattern" on every entry', () => {
    for (const ap of telecomAPs) {
      expect(ap.type).toBe('antipattern');
    }
  });

  it('should have valid severity levels', () => {
    const validSeverity = ['critical', 'high', 'medium'];
    for (const ap of telecomAPs) {
      expect(validSeverity).toContain(ap.severity);
    }
  });

  it('should have detection functions', () => {
    for (const ap of telecomAPs) {
      expect(typeof ap.detection).toBe('function');
    }
  });

  it('should have Korean description fields', () => {
    for (const ap of telecomAPs) {
      expect(ap.nameKo).toBeTruthy();
      expect(ap.detectionDescriptionKo).toBeTruthy();
      expect(ap.problemKo).toBeTruthy();
      expect(ap.impactKo).toBeTruthy();
      expect(ap.solutionKo).toBeTruthy();
    }
  });

  it('should have trust metadata', () => {
    for (const ap of telecomAPs) {
      expect(ap.trust.sources.length).toBeGreaterThanOrEqual(1);
      expect(ap.trust.confidence).toBeGreaterThan(0);
    }
  });

  // Detection function tests
  it('AP-TEL-001: should detect IDC single path', () => {
    const specBad = createSpec(['idc', 'central-office']);
    const specGood = createSpec(['idc', 'central-office', 'central-office']);
    const detected = detectAntiPatterns(specBad);
    const ids = detected.map((ap) => ap.id);
    expect(ids).toContain('AP-TEL-001');

    const detectedGood = detectAntiPatterns(specGood);
    const idsGood = detectedGood.map((ap) => ap.id);
    expect(idsGood).not.toContain('AP-TEL-001');
  });

  it('AP-TEL-002: should detect non-redundant dedicated line', () => {
    const specBad = createSpec(['dedicated-line', 'central-office']);
    const specGood = createSpec(['dedicated-line', 'dedicated-line', 'central-office', 'central-office']);
    const detected = detectAntiPatterns(specBad);
    expect(detected.map((ap) => ap.id)).toContain('AP-TEL-002');

    const detectedGood = detectAntiPatterns(specGood);
    expect(detectedGood.map((ap) => ap.id)).not.toContain('AP-TEL-002');
  });

  it('AP-TEL-003: should detect WAN border without firewall', () => {
    const specBad = createSpec(['pe-router']);
    const specGood = createSpec(['pe-router', 'firewall']);
    expect(detectAntiPatterns(specBad).map((ap) => ap.id)).toContain('AP-TEL-003');
    expect(detectAntiPatterns(specGood).map((ap) => ap.id)).not.toContain('AP-TEL-003');
  });

  it('AP-TEL-004: should detect corporate internet only', () => {
    const specBad = createSpec(['corporate-internet']);
    const specGood = createSpec(['corporate-internet', 'dedicated-line']);
    expect(detectAntiPatterns(specBad).map((ap) => ap.id)).toContain('AP-TEL-004');
    expect(detectAntiPatterns(specGood).map((ap) => ap.id)).not.toContain('AP-TEL-004');
  });

  it('AP-TEL-005: should detect private 5G without UPF', () => {
    const specBad = createSpec(['private-5g']);
    const specGood = createSpec(['private-5g', 'upf']);
    expect(detectAntiPatterns(specBad).map((ap) => ap.id)).toContain('AP-TEL-005');
    expect(detectAntiPatterns(specGood).map((ap) => ap.id)).not.toContain('AP-TEL-005');
  });

  it('AP-TEL-006: should detect wireless-wired transition without security', () => {
    const specBad = createSpec(['base-station', 'core-network']);
    const specGood = createSpec(['base-station', 'core-network', 'firewall']);
    expect(detectAntiPatterns(specBad).map((ap) => ap.id)).toContain('AP-TEL-006');
    expect(detectAntiPatterns(specGood).map((ap) => ap.id)).not.toContain('AP-TEL-006');
  });
});

// ---------------------------------------------------------------------------
// 4. Telecom Failures (8)
// ---------------------------------------------------------------------------

describe('Telecom Failures', () => {
  const telecomFailures = FAILURE_SCENARIOS.filter((f) => f.id.startsWith('FAIL-TEL-'));

  it('should have exactly 8 telecom failure scenarios', () => {
    expect(telecomFailures).toHaveLength(8);
  });

  it('should have unique IDs from FAIL-TEL-001 to FAIL-TEL-008', () => {
    const ids = telecomFailures.map((f) => f.id);
    for (let i = 1; i <= 8; i++) {
      const expectedId = `FAIL-TEL-${String(i).padStart(3, '0')}`;
      expect(ids).toContain(expectedId);
    }
  });

  it('should have type "failure" on every entry', () => {
    for (const f of telecomFailures) {
      expect(f.type).toBe('failure');
    }
  });

  it('should have valid component types', () => {
    for (const f of telecomFailures) {
      expect(ALL_VALID_TYPES).toContain(f.component);
    }
  });

  it('should have valid affectedComponents', () => {
    for (const f of telecomFailures) {
      for (const affected of f.affectedComponents) {
        expect(ALL_VALID_TYPES).toContain(affected);
      }
    }
  });

  it('should have valid impact types', () => {
    const validImpacts = ['service-down', 'degraded', 'data-loss', 'security-breach'];
    for (const f of telecomFailures) {
      expect(validImpacts).toContain(f.impact);
    }
  });

  it('should have valid likelihood levels', () => {
    const validLikelihoods = ['high', 'medium', 'low'];
    for (const f of telecomFailures) {
      expect(validLikelihoods).toContain(f.likelihood);
    }
  });

  it('should have Korean fields', () => {
    for (const f of telecomFailures) {
      expect(f.titleKo).toBeTruthy();
      expect(f.scenarioKo).toBeTruthy();
      expect(f.estimatedMTTR).toBeTruthy();
    }
  });

  it('should have at least 3 prevention and mitigation items', () => {
    for (const f of telecomFailures) {
      expect(f.preventionKo.length).toBeGreaterThanOrEqual(3);
      expect(f.mitigationKo.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('should have trust metadata', () => {
    for (const f of telecomFailures) {
      expect(f.trust.sources.length).toBeGreaterThanOrEqual(1);
      expect(f.trust.confidence).toBeGreaterThan(0);
    }
  });

  it('should have tags with at least "telecom"', () => {
    for (const f of telecomFailures) {
      expect(f.tags).toContain('telecom');
    }
  });

  it('should cover expected components', () => {
    const components = telecomFailures.map((f) => f.component);
    expect(components).toContain('central-office');
    expect(components).toContain('dedicated-line');
    expect(components).toContain('pe-router');
    expect(components).toContain('base-station');
    expect(components).toContain('core-network');
    expect(components).toContain('upf');
    expect(components).toContain('mpls-network');
    expect(components).toContain('ring-network');
  });
});

// ---------------------------------------------------------------------------
// 5. Telecom Performance Profiles (8)
// ---------------------------------------------------------------------------

describe('Telecom Performance Profiles', () => {
  const telecomProfiles = PERFORMANCE_PROFILES.filter((p) => p.id.startsWith('PERF-TEL-'));

  it('should have exactly 8 telecom performance profiles', () => {
    expect(telecomProfiles).toHaveLength(8);
  });

  it('should have unique IDs from PERF-TEL-001 to PERF-TEL-008', () => {
    const ids = telecomProfiles.map((p) => p.id);
    for (let i = 1; i <= 8; i++) {
      const expectedId = `PERF-TEL-${String(i).padStart(3, '0')}`;
      expect(ids).toContain(expectedId);
    }
  });

  it('should have type "performance" on every entry', () => {
    for (const p of telecomProfiles) {
      expect(p.type).toBe('performance');
    }
  });

  it('should have valid component types', () => {
    for (const p of telecomProfiles) {
      expect(ALL_VALID_TYPES).toContain(p.component);
    }
  });

  it('should have latency ranges', () => {
    for (const p of telecomProfiles) {
      expect(p.latencyRange.min).toBeGreaterThanOrEqual(0);
      expect(p.latencyRange.max).toBeGreaterThan(p.latencyRange.min);
      expect(['ms', 'us']).toContain(p.latencyRange.unit);
    }
  });

  it('should have throughput ranges', () => {
    for (const p of telecomProfiles) {
      expect(p.throughputRange.typical).toBeTruthy();
      expect(p.throughputRange.max).toBeTruthy();
    }
  });

  it('should have valid scaling strategies', () => {
    const validStrategies = ['horizontal', 'vertical', 'both'];
    for (const p of telecomProfiles) {
      expect(validStrategies).toContain(p.scalingStrategy);
    }
  });

  it('should have bottleneck indicators (both en and ko)', () => {
    for (const p of telecomProfiles) {
      expect(p.bottleneckIndicators.length).toBeGreaterThanOrEqual(2);
      expect(p.bottleneckIndicatorsKo.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('should have Korean optimization tips', () => {
    for (const p of telecomProfiles) {
      expect(p.optimizationTipsKo.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('should have trust metadata', () => {
    for (const p of telecomProfiles) {
      expect(p.trust.sources.length).toBeGreaterThanOrEqual(1);
      expect(p.trust.confidence).toBeGreaterThan(0);
    }
  });

  it('should have tags with at least "telecom"', () => {
    for (const p of telecomProfiles) {
      expect(p.tags).toContain('telecom');
    }
  });

  it('should cover expected components', () => {
    const components = telecomProfiles.map((p) => p.component);
    expect(components).toContain('dedicated-line');
    expect(components).toContain('pe-router');
    expect(components).toContain('p-router');
    expect(components).toContain('base-station');
    expect(components).toContain('central-office');
    expect(components).toContain('upf');
    expect(components).toContain('core-network');
    expect(components).toContain('mpls-network');
  });
});

// ---------------------------------------------------------------------------
// 6. Source Registry - Telecom Sources
// ---------------------------------------------------------------------------

describe('Telecom Sources in Registry', () => {
  it('should include RFC telecom sources in ALL_SOURCES', () => {
    const titles = ALL_SOURCES.map((s) => s.title);
    expect(titles.some((t) => t.includes('RFC 3031'))).toBe(true);
    expect(titles.some((t) => t.includes('RFC 4364'))).toBe(true);
    expect(titles.some((t) => t.includes('RFC 5036'))).toBe(true);
    expect(titles.some((t) => t.includes('RFC 7348'))).toBe(true);
    expect(titles.some((t) => t.includes('RFC 4381'))).toBe(true);
  });

  it('should include ITU sources in ALL_SOURCES', () => {
    const titles = ALL_SOURCES.map((s) => s.title);
    expect(titles.some((t) => t.includes('ITU-T G.984'))).toBe(true);
    expect(titles.some((t) => t.includes('ITU-T Y.3183'))).toBe(true);
  });

  it('should include 3GPP sources in ALL_SOURCES', () => {
    const titles = ALL_SOURCES.map((s) => s.title);
    expect(titles.some((t) => t.includes('3GPP 23.002'))).toBe(true);
    expect(titles.some((t) => t.includes('3GPP 38.401'))).toBe(true);
  });

  it('should include MEF and vendor sources in ALL_SOURCES', () => {
    const titles = ALL_SOURCES.map((s) => s.title);
    expect(titles.some((t) => t.includes('MEF 4'))).toBe(true);
    expect(titles.some((t) => t.includes('ETSI'))).toBe(true);
    expect(titles.some((t) => t.includes('KT 5G'))).toBe(true);
  });

  it('all telecom sources should have accessedDate', () => {
    const telecomSources = ALL_SOURCES.filter(
      (s) => s.title.includes('RFC 3031') ||
             s.title.includes('ITU-T') ||
             s.title.includes('3GPP') ||
             s.title.includes('MEF') ||
             s.title.includes('ETSI') ||
             s.title.includes('KT 5G'),
    );
    for (const source of telecomSources) {
      expect(source.accessedDate).toBe('2026-02-09');
    }
  });
});

// ---------------------------------------------------------------------------
// 7. Integration: Total Counts
// ---------------------------------------------------------------------------

describe('Knowledge Graph Total Counts After Telecom Extension', () => {
  it('should have >= 69 total relationships (49 existing + 20 telecom)', () => {
    expect(RELATIONSHIPS.length).toBeGreaterThanOrEqual(69);
  });

  it('should have >= 24 total patterns (18 existing + 6 telecom)', () => {
    expect(ARCHITECTURE_PATTERNS.length).toBeGreaterThanOrEqual(24);
  });

  it('should have >= 28 total anti-patterns (22 existing + 6 telecom)', () => {
    expect(ANTI_PATTERNS.length).toBeGreaterThanOrEqual(28);
  });

  it('should have >= 43 total failure scenarios (35 existing + 8 telecom)', () => {
    expect(FAILURE_SCENARIOS.length).toBeGreaterThanOrEqual(43);
  });

  it('should have >= 35 total performance profiles (27 existing + 8 telecom)', () => {
    expect(PERFORMANCE_PROFILES.length).toBeGreaterThanOrEqual(35);
  });

  it('should have >= 40 total sources', () => {
    expect(ALL_SOURCES.length).toBeGreaterThanOrEqual(40);
  });
});
