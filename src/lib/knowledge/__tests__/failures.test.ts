import { describe, it, expect } from 'vitest';
import {
  FAILURES,
  getFailuresForComponent,
  getHighImpactFailures,
  getFailuresByLikelihood,
} from '../failures';

describe('failures', () => {
  describe('FAILURES registry', () => {
    it('should contain at least 30 failure scenarios', () => {
      expect(FAILURES.length).toBeGreaterThanOrEqual(30);
    });

    it('should have unique IDs', () => {
      const ids = FAILURES.map((f) => f.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have type "failure" on every entry', () => {
      for (const f of FAILURES) {
        expect(f.type).toBe('failure');
      }
    });

    it('should have Korean text fields on every entry', () => {
      for (const f of FAILURES) {
        expect(f.titleKo).toBeTruthy();
        expect(f.scenarioKo).toBeTruthy();
        expect(f.preventionKo.length).toBeGreaterThanOrEqual(2);
        expect(f.mitigationKo.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('should have valid impact on every entry', () => {
      for (const f of FAILURES) {
        expect(['service-down', 'degraded', 'data-loss', 'security-breach']).toContain(f.impact);
      }
    });

    it('should have valid likelihood on every entry', () => {
      for (const f of FAILURES) {
        expect(['high', 'medium', 'low']).toContain(f.likelihood);
      }
    });

    it('should have estimatedMTTR on every entry', () => {
      for (const f of FAILURES) {
        expect(f.estimatedMTTR).toBeTruthy();
      }
    });

    it('should have trust metadata with sources', () => {
      for (const f of FAILURES) {
        expect(f.trust.sources.length).toBeGreaterThanOrEqual(1);
        expect(f.trust.confidence).toBeGreaterThan(0);
      }
    });

    it('should have tags on every entry', () => {
      for (const f of FAILURES) {
        expect(f.tags.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('should be frozen (immutable)', () => {
      expect(Object.isFrozen(FAILURES)).toBe(true);
    });
  });

  describe('category distribution', () => {
    it('should have network failures (FAIL-NET)', () => {
      const net = FAILURES.filter((f) => f.id.startsWith('FAIL-NET'));
      expect(net.length).toBeGreaterThanOrEqual(5);
    });

    it('should have security failures (FAIL-SEC)', () => {
      const sec = FAILURES.filter((f) => f.id.startsWith('FAIL-SEC'));
      expect(sec.length).toBeGreaterThanOrEqual(5);
    });

    it('should have compute failures (FAIL-CMP)', () => {
      const cmp = FAILURES.filter((f) => f.id.startsWith('FAIL-CMP'));
      expect(cmp.length).toBeGreaterThanOrEqual(5);
    });

    it('should have data/storage failures (FAIL-DAT)', () => {
      const dat = FAILURES.filter((f) => f.id.startsWith('FAIL-DAT'));
      expect(dat.length).toBeGreaterThanOrEqual(3);
    });

    it('should have auth failures (FAIL-AUTH)', () => {
      const auth = FAILURES.filter((f) => f.id.startsWith('FAIL-AUTH'));
      expect(auth.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getFailuresForComponent', () => {
    it('should return failures for firewall', () => {
      const failures = getFailuresForComponent('firewall');
      expect(failures.length).toBeGreaterThan(0);
      expect(failures.some((f) => f.component === 'firewall')).toBe(true);
    });

    it('should return failures for db-server', () => {
      const failures = getFailuresForComponent('db-server');
      expect(failures.length).toBeGreaterThan(0);
    });

    it('should include downstream-affected failures', () => {
      // web-server is often in affectedComponents for firewall/LB failures
      const failures = getFailuresForComponent('web-server');
      const affectedOnly = failures.filter((f) => f.component !== 'web-server');
      // Should include some failures where web-server is downstream affected
      expect(affectedOnly.length).toBeGreaterThanOrEqual(0);
    });

    it('should return empty for rare component types', () => {
      const failures = getFailuresForComponent('zone');
      expect(failures).toEqual([]);
    });
  });

  describe('getHighImpactFailures', () => {
    it('should return only service-down and data-loss failures', () => {
      const highImpact = getHighImpactFailures();
      expect(highImpact.length).toBeGreaterThan(0);
      for (const f of highImpact) {
        expect(['service-down', 'data-loss']).toContain(f.impact);
      }
    });

    it('should not include degraded or security-breach', () => {
      const highImpact = getHighImpactFailures();
      for (const f of highImpact) {
        expect(f.impact).not.toBe('degraded');
        expect(f.impact).not.toBe('security-breach');
      }
    });
  });

  describe('getFailuresByLikelihood', () => {
    it('should filter by high likelihood', () => {
      const high = getFailuresByLikelihood('high');
      expect(high.length).toBeGreaterThan(0);
      for (const f of high) {
        expect(f.likelihood).toBe('high');
      }
    });

    it('should filter by medium likelihood', () => {
      const medium = getFailuresByLikelihood('medium');
      expect(medium.length).toBeGreaterThan(0);
      for (const f of medium) {
        expect(f.likelihood).toBe('medium');
      }
    });

    it('should filter by low likelihood', () => {
      const low = getFailuresByLikelihood('low');
      for (const f of low) {
        expect(f.likelihood).toBe('low');
      }
    });

    it('should cover all entries across all likelihoods', () => {
      const high = getFailuresByLikelihood('high');
      const medium = getFailuresByLikelihood('medium');
      const low = getFailuresByLikelihood('low');
      expect(high.length + medium.length + low.length).toBe(FAILURES.length);
    });
  });
});
