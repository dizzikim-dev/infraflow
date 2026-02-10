/**
 * Vulnerability Database Tests
 */

import { describe, it, expect } from 'vitest';
import {
  VULNERABILITIES,
  getVulnerabilitiesForType,
  getCriticalVulnerabilities,
  getVulnerabilitiesForSpec,
  getVulnerabilityStats,
  type VulnerabilityEntry,
  type CVESeverity,
} from '../vulnerabilities';
import type { InfraSpec } from '@/types/infra';

// ---------------------------------------------------------------------------
// Data Integrity
// ---------------------------------------------------------------------------

describe('VULNERABILITIES data integrity', () => {
  it('should have at least 40 entries', () => {
    expect(VULNERABILITIES.length).toBeGreaterThanOrEqual(40);
  });

  it('should have unique IDs', () => {
    const ids = VULNERABILITIES.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every entry should have required fields', () => {
    for (const v of VULNERABILITIES) {
      expect(v.id).toBeTruthy();
      expect(v.affectedComponents.length).toBeGreaterThan(0);
      expect(['critical', 'high', 'medium', 'low']).toContain(v.severity);
      expect(v.title).toBeTruthy();
      expect(v.titleKo).toBeTruthy();
      expect(v.description).toBeTruthy();
      expect(v.descriptionKo).toBeTruthy();
      expect(v.mitigation).toBeTruthy();
      expect(v.mitigationKo).toBeTruthy();
      expect(v.publishedDate).toBeTruthy();
      expect(v.trust).toBeDefined();
      expect(v.trust.confidence).toBeGreaterThanOrEqual(0);
      expect(v.trust.confidence).toBeLessThanOrEqual(1);
      expect(v.trust.sources.length).toBeGreaterThan(0);
    }
  });

  it('CVE IDs should follow format when present', () => {
    const withCve = VULNERABILITIES.filter((v) => v.cveId);
    expect(withCve.length).toBeGreaterThan(0);
    for (const v of withCve) {
      expect(v.cveId).toMatch(/^CVE-\d{4}-\d{4,}$/);
    }
  });

  it('CVSS scores should be in valid range when present', () => {
    const withCvss = VULNERABILITIES.filter((v) => v.cvssScore !== undefined);
    for (const v of withCvss) {
      expect(v.cvssScore!).toBeGreaterThanOrEqual(0);
      expect(v.cvssScore!).toBeLessThanOrEqual(10);
    }
  });

  it('should cover all severity levels', () => {
    const severities = new Set(VULNERABILITIES.map((v) => v.severity));
    expect(severities.has('critical')).toBe(true);
    expect(severities.has('high')).toBe(true);
    expect(severities.has('medium')).toBe(true);
  });

  it('should cover major component categories', () => {
    const allTypes = new Set(VULNERABILITIES.flatMap((v) => v.affectedComponents));
    // Security
    expect(allTypes.has('firewall')).toBe(true);
    expect(allTypes.has('waf')).toBe(true);
    expect(allTypes.has('ids-ips')).toBe(true);
    // Compute
    expect(allTypes.has('web-server')).toBe(true);
    expect(allTypes.has('db-server')).toBe(true);
    expect(allTypes.has('kubernetes')).toBe(true);
    // Network
    expect(allTypes.has('load-balancer')).toBe(true);
    expect(allTypes.has('dns')).toBe(true);
    // Cloud
    expect(allTypes.has('aws-vpc')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getVulnerabilitiesForType
// ---------------------------------------------------------------------------

describe('getVulnerabilitiesForType', () => {
  it('should return vulnerabilities for firewall', () => {
    const result = getVulnerabilitiesForType('firewall');
    expect(result.length).toBeGreaterThanOrEqual(3);
    for (const v of result) {
      expect(v.affectedComponents).toContain('firewall');
    }
  });

  it('should return vulnerabilities for kubernetes', () => {
    const result = getVulnerabilitiesForType('kubernetes');
    expect(result.length).toBeGreaterThanOrEqual(2);
    for (const v of result) {
      expect(v.affectedComponents).toContain('kubernetes');
    }
  });

  it('should return empty array for component with no vulnerabilities', () => {
    const result = getVulnerabilitiesForType('sd-wan');
    expect(result).toEqual([]);
  });

  it('should include shared vulnerabilities', () => {
    // container shares vulnerabilities with kubernetes
    const containerVulns = getVulnerabilitiesForType('container');
    const k8sVulns = getVulnerabilitiesForType('kubernetes');
    const shared = containerVulns.filter((cv) => k8sVulns.some((kv) => kv.id === cv.id));
    expect(shared.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// getCriticalVulnerabilities
// ---------------------------------------------------------------------------

describe('getCriticalVulnerabilities', () => {
  it('should return only critical severity entries', () => {
    const result = getCriticalVulnerabilities();
    expect(result.length).toBeGreaterThan(0);
    for (const v of result) {
      expect(v.severity).toBe('critical');
    }
  });

  it('should include known critical CVEs', () => {
    const result = getCriticalVulnerabilities();
    const ids = result.map((v) => v.id);
    expect(ids).toContain('VULN-FW-002'); // PAN-OS CVSS 10.0
  });
});

// ---------------------------------------------------------------------------
// getVulnerabilitiesForSpec
// ---------------------------------------------------------------------------

describe('getVulnerabilitiesForSpec', () => {
  it('should return vulnerabilities for spec with firewall and web-server', () => {
    const spec: InfraSpec = {
      nodes: [
        { id: 'fw-1', type: 'firewall', label: 'FW' },
        { id: 'web-1', type: 'web-server', label: 'Web' },
      ],
      connections: [],
    };
    const result = getVulnerabilitiesForSpec(spec);
    expect(result.length).toBeGreaterThan(0);
    // Should include both firewall and web-server vulns
    const types = new Set(result.flatMap((v) => v.affectedComponents));
    expect(types.has('firewall')).toBe(true);
    expect(types.has('web-server')).toBe(true);
  });

  it('should return empty array for empty spec', () => {
    const spec: InfraSpec = { nodes: [], connections: [] };
    const result = getVulnerabilitiesForSpec(spec);
    expect(result).toEqual([]);
  });

  it('should sort by severity (critical first)', () => {
    const spec: InfraSpec = {
      nodes: [
        { id: 'fw-1', type: 'firewall', label: 'FW' },
        { id: 'dns-1', type: 'dns', label: 'DNS' },
      ],
      connections: [],
    };
    const result = getVulnerabilitiesForSpec(spec);
    const severityOrder: Record<CVESeverity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    for (let i = 1; i < result.length; i++) {
      expect(severityOrder[result[i].severity]).toBeGreaterThanOrEqual(
        severityOrder[result[i - 1].severity],
      );
    }
  });

  it('should not duplicate entries when multiple nodes match same vulnerability', () => {
    const spec: InfraSpec = {
      nodes: [
        { id: 'fw-1', type: 'firewall', label: 'FW1' },
        { id: 'router-1', type: 'router', label: 'Router' },
      ],
      connections: [],
    };
    const result = getVulnerabilitiesForSpec(spec);
    const ids = result.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ---------------------------------------------------------------------------
// getVulnerabilityStats
// ---------------------------------------------------------------------------

describe('getVulnerabilityStats', () => {
  it('should return correct total count', () => {
    const stats = getVulnerabilityStats();
    expect(stats.total).toBe(VULNERABILITIES.length);
  });

  it('should sum to total', () => {
    const stats = getVulnerabilityStats();
    expect(stats.critical + stats.high + stats.medium + stats.low).toBe(stats.total);
  });

  it('should count affected component types', () => {
    const stats = getVulnerabilityStats();
    expect(stats.affectedComponentTypes).toBeGreaterThan(10);
  });

  it('should work with a subset of entries', () => {
    const subset = VULNERABILITIES.filter((v) => v.severity === 'critical');
    const stats = getVulnerabilityStats(subset);
    expect(stats.total).toBe(subset.length);
    expect(stats.critical).toBe(subset.length);
    expect(stats.high).toBe(0);
    expect(stats.medium).toBe(0);
    expect(stats.low).toBe(0);
  });
});
