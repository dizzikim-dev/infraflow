import { describe, it, expect } from 'vitest';
import {
  ANTIPATTERNS,
  detectAntiPatterns,
  getAntiPatternsBySeverity,
  getCriticalAntiPatterns,
} from '../antipatterns';
import type { InfraSpec } from '@/types/infra';

// Helper to build specs
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

describe('antipatterns', () => {
  describe('ANTIPATTERNS registry', () => {
    it('should contain at least 20 antipatterns', () => {
      expect(ANTIPATTERNS.length).toBeGreaterThanOrEqual(20);
    });

    it('should have unique IDs', () => {
      const ids = ANTIPATTERNS.map((ap) => ap.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have bilingual names', () => {
      for (const ap of ANTIPATTERNS) {
        expect(ap.name).toBeTruthy();
        expect(ap.nameKo).toBeTruthy();
      }
    });

    it('should have Korean problem/impact/solution descriptions', () => {
      for (const ap of ANTIPATTERNS) {
        expect(ap.problemKo).toBeTruthy();
        expect(ap.impactKo).toBeTruthy();
        expect(ap.solutionKo).toBeTruthy();
        expect(ap.detectionDescriptionKo).toBeTruthy();
      }
    });

    it('should have valid severity on every entry', () => {
      for (const ap of ANTIPATTERNS) {
        expect(['critical', 'high', 'medium']).toContain(ap.severity);
      }
    });

    it('should have detection function on every entry', () => {
      for (const ap of ANTIPATTERNS) {
        expect(typeof ap.detection).toBe('function');
      }
    });

    it('should have trust metadata with sources', () => {
      for (const ap of ANTIPATTERNS) {
        expect(ap.trust.sources.length).toBeGreaterThanOrEqual(1);
        expect(ap.trust.confidence).toBeGreaterThan(0);
      }
    });

    it('should have type "antipattern" on every entry', () => {
      for (const ap of ANTIPATTERNS) {
        expect(ap.type).toBe('antipattern');
      }
    });

    it('should be frozen (immutable)', () => {
      expect(Object.isFrozen(ANTIPATTERNS)).toBe(true);
    });
  });

  describe('severity distribution', () => {
    it('should have critical antipatterns', () => {
      const critical = getAntiPatternsBySeverity('critical');
      expect(critical.length).toBeGreaterThanOrEqual(5);
    });

    it('should have high antipatterns', () => {
      const high = getAntiPatternsBySeverity('high');
      expect(high.length).toBeGreaterThanOrEqual(3);
    });

    it('should have medium antipatterns', () => {
      const medium = getAntiPatternsBySeverity('medium');
      expect(medium.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getCriticalAntiPatterns', () => {
    it('should return same result as getAntiPatternsBySeverity("critical")', () => {
      const critical1 = getCriticalAntiPatterns();
      const critical2 = getAntiPatternsBySeverity('critical');
      expect(critical1).toEqual(critical2);
    });
  });

  describe('detection functions - security', () => {
    it('should detect no firewall (AP-SEC-002)', () => {
      const spec = makeSpec([
        { id: 'ws-1', type: 'web-server', label: 'Web' },
        { id: 'db-1', type: 'db-server', label: 'DB' },
      ]);
      const detected = detectAntiPatterns(spec);
      const ids = detected.map((ap) => ap.id);
      expect(ids).toContain('AP-SEC-002');
    });

    it('should NOT detect no firewall when firewall exists', () => {
      const spec = makeSpec([
        { id: 'fw-1', type: 'firewall', label: 'FW' },
        { id: 'ws-1', type: 'web-server', label: 'Web' },
        { id: 'db-1', type: 'db-server', label: 'DB' },
      ]);
      const detected = detectAntiPatterns(spec);
      const ids = detected.map((ap) => ap.id);
      expect(ids).not.toContain('AP-SEC-002');
    });

    it('should detect web server without WAF (AP-SEC-003)', () => {
      const spec = makeSpec(
        [
          { id: 'inet-1', type: 'internet', label: 'Internet' },
          { id: 'ws-1', type: 'web-server', label: 'Web' },
        ],
        [{ source: 'inet-1', target: 'ws-1' }],
      );
      const detected = detectAntiPatterns(spec);
      const ids = detected.map((ap) => ap.id);
      expect(ids).toContain('AP-SEC-003');
    });

    it('should NOT detect web server without WAF when WAF exists', () => {
      const spec = makeSpec([
        { id: 'inet-1', type: 'internet', label: 'Internet' },
        { id: 'waf-1', type: 'waf', label: 'WAF' },
        { id: 'ws-1', type: 'web-server', label: 'Web' },
      ]);
      const detected = detectAntiPatterns(spec);
      const ids = detected.map((ap) => ap.id);
      expect(ids).not.toContain('AP-SEC-003');
    });

    it('should detect no access control (AP-SEC-007)', () => {
      const spec = makeSpec([
        { id: 'fw-1', type: 'firewall', label: 'FW' },
        { id: 'ws-1', type: 'web-server', label: 'Web' },
        { id: 'db-1', type: 'db-server', label: 'DB' },
      ]);
      const detected = detectAntiPatterns(spec);
      const ids = detected.map((ap) => ap.id);
      expect(ids).toContain('AP-SEC-007');
    });

    it('should NOT detect no access control when IAM exists', () => {
      const spec = makeSpec([
        { id: 'fw-1', type: 'firewall', label: 'FW' },
        { id: 'ws-1', type: 'web-server', label: 'Web' },
        { id: 'iam-1', type: 'iam', label: 'IAM' },
      ]);
      const detected = detectAntiPatterns(spec);
      const ids = detected.map((ap) => ap.id);
      expect(ids).not.toContain('AP-SEC-007');
    });
  });

  describe('detection functions - availability', () => {
    it('should detect no backup for db-server (AP-HA-002)', () => {
      const spec = makeSpec([
        { id: 'db-1', type: 'db-server', label: 'DB' },
        { id: 'fw-1', type: 'firewall', label: 'FW' },
      ]);
      const detected = detectAntiPatterns(spec);
      const ids = detected.map((ap) => ap.id);
      expect(ids).toContain('AP-HA-002');
    });

    it('should NOT detect no backup when backup exists', () => {
      const spec = makeSpec([
        { id: 'db-1', type: 'db-server', label: 'DB' },
        { id: 'backup-1', type: 'backup', label: 'Backup' },
      ]);
      const detected = detectAntiPatterns(spec);
      const ids = detected.map((ap) => ap.id);
      expect(ids).not.toContain('AP-HA-002');
    });
  });

  describe('detection functions - performance', () => {
    it('should detect no caching layer (AP-PERF-001)', () => {
      const spec = makeSpec([
        { id: 'as-1', type: 'app-server', label: 'App' },
        { id: 'db-1', type: 'db-server', label: 'DB' },
      ]);
      const detected = detectAntiPatterns(spec);
      const ids = detected.map((ap) => ap.id);
      expect(ids).toContain('AP-PERF-001');
    });

    it('should NOT detect no caching when cache exists', () => {
      const spec = makeSpec([
        { id: 'as-1', type: 'app-server', label: 'App' },
        { id: 'db-1', type: 'db-server', label: 'DB' },
        { id: 'cache-1', type: 'cache', label: 'Cache' },
      ]);
      const detected = detectAntiPatterns(spec);
      const ids = detected.map((ap) => ap.id);
      expect(ids).not.toContain('AP-PERF-001');
    });

    it('should detect no load balancing with multiple web servers (AP-PERF-003)', () => {
      const spec = makeSpec([
        { id: 'ws-1', type: 'web-server', label: 'Web 1' },
        { id: 'ws-2', type: 'web-server', label: 'Web 2' },
      ]);
      const detected = detectAntiPatterns(spec);
      const ids = detected.map((ap) => ap.id);
      expect(ids).toContain('AP-PERF-003');
    });
  });

  describe('detection functions - architecture', () => {
    it('should detect missing application tier (AP-ARCH-002)', () => {
      const spec = makeSpec([
        { id: 'ws-1', type: 'web-server', label: 'Web' },
        { id: 'db-1', type: 'db-server', label: 'DB' },
      ]);
      const detected = detectAntiPatterns(spec);
      const ids = detected.map((ap) => ap.id);
      expect(ids).toContain('AP-ARCH-002');
    });

    it('should NOT detect missing app tier when app-server exists', () => {
      const spec = makeSpec([
        { id: 'ws-1', type: 'web-server', label: 'Web' },
        { id: 'as-1', type: 'app-server', label: 'App' },
        { id: 'db-1', type: 'db-server', label: 'DB' },
      ]);
      const detected = detectAntiPatterns(spec);
      const ids = detected.map((ap) => ap.id);
      expect(ids).not.toContain('AP-ARCH-002');
    });
  });

  describe('detectAntiPatterns', () => {
    it('should return empty for empty spec', () => {
      const spec = makeSpec([]);
      const detected = detectAntiPatterns(spec);
      expect(detected).toEqual([]);
    });

    it('should detect multiple issues in poorly designed spec', () => {
      const spec = makeSpec([
        { id: 'ws-1', type: 'web-server', label: 'Web' },
        { id: 'db-1', type: 'db-server', label: 'DB' },
        { id: 'inet-1', type: 'internet', label: 'Internet' },
      ]);
      const detected = detectAntiPatterns(spec);
      // Should detect: no firewall, no WAF, no backup, no auth, no app tier, etc.
      expect(detected.length).toBeGreaterThanOrEqual(3);
    });

    it('should detect fewer issues in well-designed spec', () => {
      const spec = makeSpec([
        { id: 'fw-1', type: 'firewall', label: 'FW' },
        { id: 'waf-1', type: 'waf', label: 'WAF' },
        { id: 'lb-1', type: 'load-balancer', label: 'LB' },
        { id: 'ws-1', type: 'web-server', label: 'Web 1' },
        { id: 'ws-2', type: 'web-server', label: 'Web 2' },
        { id: 'as-1', type: 'app-server', label: 'App' },
        { id: 'db-1', type: 'db-server', label: 'DB' },
        { id: 'cache-1', type: 'cache', label: 'Cache' },
        { id: 'backup-1', type: 'backup', label: 'Backup' },
        { id: 'iam-1', type: 'iam', label: 'IAM' },
        { id: 'dns-1', type: 'dns', label: 'DNS' },
      ]);
      const detected = detectAntiPatterns(spec);
      const poorly = detectAntiPatterns(
        makeSpec([
          { id: 'ws-1', type: 'web-server', label: 'Web' },
          { id: 'db-1', type: 'db-server', label: 'DB' },
        ]),
      );
      expect(detected.length).toBeLessThan(poorly.length);
    });

    it('should not throw on any detection function', () => {
      const spec = makeSpec([
        { id: 'ws-1', type: 'web-server', label: 'Web' },
      ]);
      expect(() => detectAntiPatterns(spec)).not.toThrow();
    });
  });
});
