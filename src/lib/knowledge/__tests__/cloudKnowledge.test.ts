import { describe, it, expect } from 'vitest';
import { RELATIONSHIPS } from '../relationships';
import { ANTI_PATTERNS, detectAntiPatterns } from '../antipatterns';
import { FAILURE_SCENARIOS } from '../failures';
import { PERFORMANCE_PROFILES } from '../performance';
import { ALL_SOURCES } from '../sourceRegistry';
import type { InfraSpec, InfraNodeType } from '@/types/infra';

// ---------------------------------------------------------------------------
// Helper: valid InfraNodeType set (all known types)
// ---------------------------------------------------------------------------

const CLOUD_TYPES: InfraNodeType[] = [
  'aws-vpc', 'azure-vnet', 'gcp-network', 'private-cloud',
];

const ALL_VALID_TYPES: InfraNodeType[] = [
  'central-office', 'base-station', 'olt', 'customer-premise', 'idc',
  'pe-router', 'p-router', 'mpls-network', 'dedicated-line', 'metro-ethernet',
  'corporate-internet', 'vpn-service', 'sd-wan-service', 'private-5g',
  'core-network', 'upf', 'ring-network',
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
// 1. Cloud Sources
// ---------------------------------------------------------------------------

describe('Cloud Sources in Registry', () => {
  it('should include AWS_WAF_OPS in ALL_SOURCES', () => {
    const titles = ALL_SOURCES.map((s) => s.title);
    expect(titles.some((t) => t.includes('Operational Excellence Pillar'))).toBe(true);
  });

  it('should include GCP_ARCH_FRAMEWORK in ALL_SOURCES', () => {
    const titles = ALL_SOURCES.map((s) => s.title);
    expect(titles.some((t) => t.includes('Google Cloud Architecture Framework'))).toBe(true);
  });

  it('should include NIST_800_145 in ALL_SOURCES', () => {
    const titles = ALL_SOURCES.map((s) => s.title);
    expect(titles.some((t) => t.includes('800-145'))).toBe(true);
  });

  it('should include CIS_KUBERNETES in ALL_SOURCES', () => {
    const titles = ALL_SOURCES.map((s) => s.title);
    expect(titles.some((t) => t.includes('CIS Kubernetes'))).toBe(true);
  });

  it('should include K8S_DOCS in ALL_SOURCES', () => {
    const titles = ALL_SOURCES.map((s) => s.title);
    expect(titles.some((t) => t.includes('Kubernetes Official Documentation'))).toBe(true);
  });

  it('should include NIST_800_207 in ALL_SOURCES', () => {
    const titles = ALL_SOURCES.map((s) => s.title);
    expect(titles.some((t) => t.includes('800-207'))).toBe(true);
  });

  it('all cloud sources should have accessedDate', () => {
    const cloudSources = ALL_SOURCES.filter(
      (s) => s.title.includes('Operational Excellence') ||
             s.title.includes('Google Cloud Architecture') ||
             s.title.includes('800-145') ||
             s.title.includes('CIS Kubernetes') ||
             s.title.includes('Kubernetes Official') ||
             s.title.includes('800-207'),
    );
    expect(cloudSources.length).toBe(6);
    for (const source of cloudSources) {
      expect(source.accessedDate).toBe('2026-02-09');
    }
  });
});

// ---------------------------------------------------------------------------
// 2. Cloud Anti-patterns (AP-CLD)
// ---------------------------------------------------------------------------

describe('Cloud Anti-patterns', () => {
  const cloudAPs = ANTI_PATTERNS.filter((ap) => ap.id.startsWith('AP-CLD-'));

  it('should have exactly 6 cloud anti-patterns', () => {
    expect(cloudAPs).toHaveLength(6);
  });

  it('should have unique IDs from AP-CLD-001 to AP-CLD-006', () => {
    const ids = cloudAPs.map((ap) => ap.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(6);
    for (let i = 1; i <= 6; i++) {
      const expectedId = `AP-CLD-${String(i).padStart(3, '0')}`;
      expect(ids).toContain(expectedId);
    }
  });

  it('should have type "antipattern" on every entry', () => {
    for (const ap of cloudAPs) {
      expect(ap.type).toBe('antipattern');
    }
  });

  it('should have valid severity levels', () => {
    const validSeverity = ['critical', 'high', 'medium'];
    for (const ap of cloudAPs) {
      expect(validSeverity).toContain(ap.severity);
    }
  });

  it('should have detection functions', () => {
    for (const ap of cloudAPs) {
      expect(typeof ap.detection).toBe('function');
    }
  });

  it('should have Korean description fields', () => {
    for (const ap of cloudAPs) {
      expect(ap.nameKo).toBeTruthy();
      expect(ap.detectionDescriptionKo).toBeTruthy();
      expect(ap.problemKo).toBeTruthy();
      expect(ap.impactKo).toBeTruthy();
      expect(ap.solutionKo).toBeTruthy();
    }
  });

  it('should have trust metadata', () => {
    for (const ap of cloudAPs) {
      expect(ap.trust.sources.length).toBeGreaterThanOrEqual(1);
      expect(ap.trust.confidence).toBeGreaterThan(0);
      expect(ap.trust.confidence).toBeLessThanOrEqual(1.0);
    }
  });

  // Detection function tests
  it('AP-CLD-001: should detect Single AZ (cloud without load-balancer)', () => {
    const specBad = createSpec(['aws-vpc']);
    const specGood = createSpec(['aws-vpc', 'load-balancer']);
    expect(detectAntiPatterns(specBad).map((ap) => ap.id)).toContain('AP-CLD-001');
    expect(detectAntiPatterns(specGood).map((ap) => ap.id)).not.toContain('AP-CLD-001');
  });

  it('AP-CLD-002: should detect Public Subnet DB (cloud + db without firewall)', () => {
    const specBad = createSpec(['aws-vpc', 'db-server']);
    const specGood = createSpec(['aws-vpc', 'db-server', 'firewall']);
    expect(detectAntiPatterns(specBad).map((ap) => ap.id)).toContain('AP-CLD-002');
    expect(detectAntiPatterns(specGood).map((ap) => ap.id)).not.toContain('AP-CLD-002');
  });

  it('AP-CLD-003: should detect SG Wide Open (cloud + internet without fw/waf)', () => {
    const specBad = createSpec(['aws-vpc', 'internet']);
    const specGood = createSpec(['aws-vpc', 'internet', 'firewall']);
    expect(detectAntiPatterns(specBad).map((ap) => ap.id)).toContain('AP-CLD-003');
    expect(detectAntiPatterns(specGood).map((ap) => ap.id)).not.toContain('AP-CLD-003');
  });

  it('AP-CLD-004: should detect Cloud Without IAM', () => {
    const specBad = createSpec(['gcp-network']);
    const specGood = createSpec(['gcp-network', 'iam']);
    expect(detectAntiPatterns(specBad).map((ap) => ap.id)).toContain('AP-CLD-004');
    expect(detectAntiPatterns(specGood).map((ap) => ap.id)).not.toContain('AP-CLD-004');
  });

  it('AP-CLD-005: should detect No Auto Scaling (cloud + compute without LB)', () => {
    const specBad = createSpec(['azure-vnet', 'web-server']);
    const specGood = createSpec(['azure-vnet', 'web-server', 'load-balancer']);
    expect(detectAntiPatterns(specBad).map((ap) => ap.id)).toContain('AP-CLD-005');
    expect(detectAntiPatterns(specGood).map((ap) => ap.id)).not.toContain('AP-CLD-005');
  });

  it('AP-CLD-006: should detect No Monitoring (cloud + compute without ids-ips)', () => {
    const specBad = createSpec(['aws-vpc', 'app-server']);
    const specGood = createSpec(['aws-vpc', 'app-server', 'ids-ips']);
    expect(detectAntiPatterns(specBad).map((ap) => ap.id)).toContain('AP-CLD-006');
    expect(detectAntiPatterns(specGood).map((ap) => ap.id)).not.toContain('AP-CLD-006');
  });
});

// ---------------------------------------------------------------------------
// 3. Cloud Failures (FAIL-CLD)
// ---------------------------------------------------------------------------

describe('Cloud Failures', () => {
  const cloudFailures = FAILURE_SCENARIOS.filter((f) => f.id.startsWith('FAIL-CLD-'));

  it('should have exactly 6 cloud failure scenarios', () => {
    expect(cloudFailures).toHaveLength(6);
  });

  it('should have unique IDs from FAIL-CLD-001 to FAIL-CLD-006', () => {
    const ids = cloudFailures.map((f) => f.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(6);
    for (let i = 1; i <= 6; i++) {
      const expectedId = `FAIL-CLD-${String(i).padStart(3, '0')}`;
      expect(ids).toContain(expectedId);
    }
  });

  it('should have type "failure" on every entry', () => {
    for (const f of cloudFailures) {
      expect(f.type).toBe('failure');
    }
  });

  it('should have valid component types', () => {
    for (const f of cloudFailures) {
      expect(ALL_VALID_TYPES).toContain(f.component);
    }
  });

  it('should have valid affectedComponents', () => {
    for (const f of cloudFailures) {
      for (const affected of f.affectedComponents) {
        expect(ALL_VALID_TYPES).toContain(affected);
      }
    }
  });

  it('should have valid impact types', () => {
    const validImpacts = ['service-down', 'degraded', 'data-loss', 'security-breach'];
    for (const f of cloudFailures) {
      expect(validImpacts).toContain(f.impact);
    }
  });

  it('should have valid likelihood levels', () => {
    const validLikelihoods = ['high', 'medium', 'low'];
    for (const f of cloudFailures) {
      expect(validLikelihoods).toContain(f.likelihood);
    }
  });

  it('should have Korean fields', () => {
    for (const f of cloudFailures) {
      expect(f.titleKo).toBeTruthy();
      expect(f.scenarioKo).toBeTruthy();
      expect(f.estimatedMTTR).toBeTruthy();
    }
  });

  it('should have at least 3 prevention and mitigation items', () => {
    for (const f of cloudFailures) {
      expect(f.preventionKo.length).toBeGreaterThanOrEqual(3);
      expect(f.mitigationKo.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('should have trust metadata', () => {
    for (const f of cloudFailures) {
      expect(f.trust.sources.length).toBeGreaterThanOrEqual(1);
      expect(f.trust.confidence).toBeGreaterThan(0);
      expect(f.trust.confidence).toBeLessThanOrEqual(1.0);
    }
  });

  it('should have tags with at least "cloud"', () => {
    for (const f of cloudFailures) {
      expect(f.tags).toContain('cloud');
    }
  });

  it('should cover expected cloud components', () => {
    const components = cloudFailures.map((f) => f.component);
    expect(components).toContain('aws-vpc');
    expect(components).toContain('azure-vnet');
    expect(components).toContain('gcp-network');
    expect(components).toContain('private-cloud');
    expect(components).toContain('iam');
  });
});

// ---------------------------------------------------------------------------
// 4. Cloud Relationships (REL-CLD-001 ~ REL-CLD-008)
// ---------------------------------------------------------------------------

describe('Cloud Relationships', () => {
  const cloudRels = RELATIONSHIPS.filter(
    (r) => r.id.startsWith('REL-CLD-') &&
           parseInt(r.id.replace('REL-CLD-', ''), 10) >= 1 &&
           parseInt(r.id.replace('REL-CLD-', ''), 10) <= 8,
  );

  it('should have exactly 8 cloud relationships (REL-CLD-001~008)', () => {
    expect(cloudRels).toHaveLength(8);
  });

  it('should have unique IDs from REL-CLD-001 to REL-CLD-008', () => {
    const ids = cloudRels.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(8);
    for (let i = 1; i <= 8; i++) {
      const expectedId = `REL-CLD-${String(i).padStart(3, '0')}`;
      expect(ids).toContain(expectedId);
    }
  });

  it('should have type "relationship" on every entry', () => {
    for (const rel of cloudRels) {
      expect(rel.type).toBe('relationship');
    }
  });

  it('should have valid source and target InfraNodeTypes', () => {
    for (const rel of cloudRels) {
      expect(ALL_VALID_TYPES).toContain(rel.source);
      expect(ALL_VALID_TYPES).toContain(rel.target);
    }
  });

  it('should have trust metadata with at least one source', () => {
    for (const rel of cloudRels) {
      expect(rel.trust).toBeDefined();
      expect(rel.trust.sources.length).toBeGreaterThanOrEqual(1);
      expect(rel.trust.confidence).toBeGreaterThan(0);
      expect(rel.trust.confidence).toBeLessThanOrEqual(1.0);
    }
  });

  it('should have bilingual reasons', () => {
    for (const rel of cloudRels) {
      expect(rel.reason).toBeTruthy();
      expect(rel.reasonKo).toBeTruthy();
    }
  });

  it('should have tags with at least "cloud"', () => {
    for (const rel of cloudRels) {
      expect(rel.tags).toContain('cloud');
      expect(rel.tags.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('should have valid relationship types', () => {
    const validTypes = ['requires', 'recommends', 'conflicts', 'enhances', 'protects'];
    for (const rel of cloudRels) {
      expect(validTypes).toContain(rel.relationshipType);
    }
  });

  it('should have valid direction values', () => {
    const validDirections = ['upstream', 'downstream', 'bidirectional'];
    for (const rel of cloudRels) {
      expect(validDirections).toContain(rel.direction);
    }
  });

  it('should include all cloud provider VPCs requiring firewall', () => {
    const awsToFw = cloudRels.find(
      (r) => r.source === 'aws-vpc' && r.target === 'firewall',
    );
    expect(awsToFw).toBeDefined();
    expect(awsToFw!.relationshipType).toBe('requires');

    const azureToFw = cloudRels.find(
      (r) => r.source === 'azure-vnet' && r.target === 'firewall',
    );
    expect(azureToFw).toBeDefined();
    expect(azureToFw!.relationshipType).toBe('requires');

    const gcpToFw = cloudRels.find(
      (r) => r.source === 'gcp-network' && r.target === 'firewall',
    );
    expect(gcpToFw).toBeDefined();
    expect(gcpToFw!.relationshipType).toBe('requires');
  });

  it('should include cloud to load-balancer recommendation', () => {
    const awsToLb = cloudRels.find(
      (r) => r.source === 'aws-vpc' && r.target === 'load-balancer',
    );
    expect(awsToLb).toBeDefined();
    expect(awsToLb!.relationshipType).toBe('recommends');
  });

  it('should include private-cloud relationships', () => {
    const pcRels = cloudRels.filter((r) => r.source === 'private-cloud');
    expect(pcRels.length).toBeGreaterThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// 5. Cloud Performance Profiles (PERF-CLD)
// ---------------------------------------------------------------------------

describe('Cloud Performance Profiles', () => {
  const cloudProfiles = PERFORMANCE_PROFILES.filter((p) => p.id.startsWith('PERF-CLD-'));

  it('should have exactly 4 cloud performance profiles', () => {
    expect(cloudProfiles).toHaveLength(4);
  });

  it('should have unique IDs from PERF-CLD-001 to PERF-CLD-004', () => {
    const ids = cloudProfiles.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(4);
    for (let i = 1; i <= 4; i++) {
      const expectedId = `PERF-CLD-${String(i).padStart(3, '0')}`;
      expect(ids).toContain(expectedId);
    }
  });

  it('should have type "performance" on every entry', () => {
    for (const p of cloudProfiles) {
      expect(p.type).toBe('performance');
    }
  });

  it('should have valid component types matching cloud types', () => {
    for (const p of cloudProfiles) {
      expect(ALL_VALID_TYPES).toContain(p.component);
      expect(CLOUD_TYPES).toContain(p.component);
    }
  });

  it('should have latency ranges', () => {
    for (const p of cloudProfiles) {
      expect(p.latencyRange.min).toBeGreaterThanOrEqual(0);
      expect(p.latencyRange.max).toBeGreaterThan(p.latencyRange.min);
      expect(['ms', 'us']).toContain(p.latencyRange.unit);
    }
  });

  it('should have throughput ranges', () => {
    for (const p of cloudProfiles) {
      expect(p.throughputRange.typical).toBeTruthy();
      expect(p.throughputRange.max).toBeTruthy();
    }
  });

  it('should have valid scaling strategies', () => {
    const validStrategies = ['horizontal', 'vertical', 'both'];
    for (const p of cloudProfiles) {
      expect(validStrategies).toContain(p.scalingStrategy);
    }
  });

  it('should have bottleneck indicators (both en and ko)', () => {
    for (const p of cloudProfiles) {
      expect(p.bottleneckIndicators.length).toBeGreaterThanOrEqual(2);
      expect(p.bottleneckIndicatorsKo.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('should have Korean optimization tips', () => {
    for (const p of cloudProfiles) {
      expect(p.optimizationTipsKo.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('should have trust metadata', () => {
    for (const p of cloudProfiles) {
      expect(p.trust.sources.length).toBeGreaterThanOrEqual(1);
      expect(p.trust.confidence).toBeGreaterThan(0);
      expect(p.trust.confidence).toBeLessThanOrEqual(1.0);
    }
  });

  it('should have tags with at least "cloud"', () => {
    for (const p of cloudProfiles) {
      expect(p.tags).toContain('cloud');
    }
  });

  it('should cover all four cloud types', () => {
    const components = cloudProfiles.map((p) => p.component);
    expect(components).toContain('aws-vpc');
    expect(components).toContain('azure-vnet');
    expect(components).toContain('gcp-network');
    expect(components).toContain('private-cloud');
  });
});

// ---------------------------------------------------------------------------
// 6. Integration: Total Counts After Cloud Extension
// ---------------------------------------------------------------------------

describe('Knowledge Graph Total Counts After Cloud Extension', () => {
  it('should have >= 77 total relationships (69 telecom + 8 cloud)', () => {
    expect(RELATIONSHIPS.length).toBeGreaterThanOrEqual(77);
  });

  it('should have >= 34 total anti-patterns (28 telecom + 6 cloud)', () => {
    expect(ANTI_PATTERNS.length).toBeGreaterThanOrEqual(34);
  });

  it('should have >= 49 total failure scenarios (43 telecom + 6 cloud)', () => {
    expect(FAILURE_SCENARIOS.length).toBeGreaterThanOrEqual(49);
  });

  it('should have >= 39 total performance profiles (35 telecom + 4 cloud)', () => {
    expect(PERFORMANCE_PROFILES.length).toBeGreaterThanOrEqual(39);
  });

  it('should have >= 46 total sources', () => {
    expect(ALL_SOURCES.length).toBeGreaterThanOrEqual(46);
  });
});
