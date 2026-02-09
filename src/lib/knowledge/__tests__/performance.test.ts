import { describe, it, expect } from 'vitest';
import {
  PROFILES,
  getProfileForComponent,
  getProfilesByScaling,
} from '../performance';

describe('performance profiles', () => {
  describe('PROFILES registry', () => {
    it('should contain at least 20 profiles', () => {
      expect(PROFILES.length).toBeGreaterThanOrEqual(20);
    });

    it('should have unique IDs', () => {
      const ids = PROFILES.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique component types', () => {
      const components = PROFILES.map((p) => p.component);
      const uniqueComponents = new Set(components);
      expect(uniqueComponents.size).toBe(components.length);
    });

    it('should have type "performance" on every entry', () => {
      for (const p of PROFILES) {
        expect(p.type).toBe('performance');
      }
    });

    it('should have Korean name on every entry', () => {
      for (const p of PROFILES) {
        expect(p.nameKo).toBeTruthy();
      }
    });

    it('should have valid latency range on every entry', () => {
      for (const p of PROFILES) {
        expect(p.latencyRange.min).toBeGreaterThanOrEqual(0);
        expect(p.latencyRange.max).toBeGreaterThan(p.latencyRange.min);
        expect(['ms', 'us']).toContain(p.latencyRange.unit);
      }
    });

    it('should have throughput range on every entry', () => {
      for (const p of PROFILES) {
        expect(p.throughputRange.typical).toBeTruthy();
        expect(p.throughputRange.max).toBeTruthy();
      }
    });

    it('should have valid scaling strategy on every entry', () => {
      for (const p of PROFILES) {
        expect(['horizontal', 'vertical', 'both']).toContain(p.scalingStrategy);
      }
    });

    it('should have bottleneck indicators on every entry', () => {
      for (const p of PROFILES) {
        expect(p.bottleneckIndicators.length).toBeGreaterThanOrEqual(2);
        expect(p.bottleneckIndicatorsKo.length).toBeGreaterThanOrEqual(2);
        expect(p.bottleneckIndicators.length).toBe(p.bottleneckIndicatorsKo.length);
      }
    });

    it('should have optimization tips on every entry', () => {
      for (const p of PROFILES) {
        expect(p.optimizationTipsKo.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('should have trust metadata with sources', () => {
      for (const p of PROFILES) {
        expect(p.trust.sources.length).toBeGreaterThanOrEqual(1);
        expect(p.trust.confidence).toBeGreaterThan(0);
      }
    });

    it('should be frozen (immutable)', () => {
      expect(Object.isFrozen(PROFILES)).toBe(true);
    });
  });

  describe('category distribution', () => {
    it('should have security profiles (PERF-SEC)', () => {
      const sec = PROFILES.filter((p) => p.id.startsWith('PERF-SEC'));
      expect(sec.length).toBeGreaterThanOrEqual(3);
    });

    it('should have network profiles (PERF-NET)', () => {
      const net = PROFILES.filter((p) => p.id.startsWith('PERF-NET'));
      expect(net.length).toBeGreaterThanOrEqual(3);
    });

    it('should have compute profiles (PERF-CMP)', () => {
      const cmp = PROFILES.filter((p) => p.id.startsWith('PERF-CMP'));
      expect(cmp.length).toBeGreaterThanOrEqual(3);
    });

    it('should have storage profiles (PERF-STR)', () => {
      const str = PROFILES.filter((p) => p.id.startsWith('PERF-STR'));
      expect(str.length).toBeGreaterThanOrEqual(2);
    });

    it('should have auth profiles (PERF-AUTH)', () => {
      const auth = PROFILES.filter((p) => p.id.startsWith('PERF-AUTH'));
      expect(auth.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getProfileForComponent', () => {
    it('should return profile for firewall', () => {
      const profile = getProfileForComponent('firewall');
      expect(profile).toBeDefined();
      expect(profile!.component).toBe('firewall');
    });

    it('should return profile for db-server', () => {
      const profile = getProfileForComponent('db-server');
      expect(profile).toBeDefined();
      expect(profile!.component).toBe('db-server');
    });

    it('should return profile for cache', () => {
      const profile = getProfileForComponent('cache');
      expect(profile).toBeDefined();
      // Cache uses microseconds (us) for its sub-millisecond latency
      expect(profile!.latencyRange.unit).toBe('us');
    });

    it('should return undefined for zone', () => {
      const profile = getProfileForComponent('zone');
      expect(profile).toBeUndefined();
    });
  });

  describe('getProfilesByScaling', () => {
    it('should return horizontal scaling profiles', () => {
      const horizontal = getProfilesByScaling('horizontal');
      expect(horizontal.length).toBeGreaterThan(0);
      for (const p of horizontal) {
        expect(p.scalingStrategy).toBe('horizontal');
      }
    });

    it('should return vertical scaling profiles', () => {
      const vertical = getProfilesByScaling('vertical');
      expect(vertical.length).toBeGreaterThan(0);
      for (const p of vertical) {
        expect(p.scalingStrategy).toBe('vertical');
      }
    });

    it('should cover all profiles across strategies', () => {
      const h = getProfilesByScaling('horizontal');
      const v = getProfilesByScaling('vertical');
      const b = getProfilesByScaling('both');
      expect(h.length + v.length + b.length).toBe(PROFILES.length);
    });
  });
});
