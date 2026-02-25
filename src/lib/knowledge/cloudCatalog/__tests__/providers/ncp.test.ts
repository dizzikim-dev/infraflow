/**
 * NCP (Naver Cloud Platform) Cloud Services - Data Integrity Tests
 */

import { describe, it, expect } from 'vitest';
import { NCP_SERVICES } from '../../providers/ncp';

describe('NCP_SERVICES', () => {
  it('should have at least 30 services', () => {
    expect(NCP_SERVICES.length).toBeGreaterThanOrEqual(30);
  });

  it('all entries should have provider "ncp"', () => {
    for (const svc of NCP_SERVICES) {
      expect(svc.provider).toBe('ncp');
    }
  });

  it('IDs should follow CS-*-NCP-* pattern', () => {
    for (const svc of NCP_SERVICES) {
      expect(svc.id).toMatch(/^CS-[A-Z0-9]+-NCP-\d{3}$/);
    }
  });

  it('should have unique IDs', () => {
    const ids = NCP_SERVICES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should cover key NCP service categories', () => {
    const types = new Set(NCP_SERVICES.map((s) => s.componentType));
    expect(types.has('web-server')).toBe(true);
    expect(types.has('load-balancer')).toBe(true);
    expect(types.has('db-server')).toBe(true);
    expect(types.has('object-storage')).toBe(true);
  });

  it('every entry should have bilingual fields', () => {
    for (const svc of NCP_SERVICES) {
      expect(svc.serviceNameKo).toBeTruthy();
      expect(svc.featuresKo.length).toBe(svc.features.length);
    }
  });

  it('should have trust metadata pointing to ncloud.com', () => {
    for (const svc of NCP_SERVICES) {
      expect(svc.trust.confidence).toBe(0.85);
      expect(svc.trust.sources[0].type).toBe('vendor');
      expect(svc.trust.sources[0].url).toContain('ncloud.com');
    }
  });

  it('should have all required fields', () => {
    for (const svc of NCP_SERVICES) {
      expect(svc.id).toBeTruthy();
      expect(svc.provider).toBe('ncp');
      expect(svc.serviceName).toBeTruthy();
      expect(svc.serviceNameKo).toBeTruthy();
      expect(svc.status).toMatch(/^(active|deprecated|preview|end-of-life)$/);
      expect(svc.features).toBeInstanceOf(Array);
      expect(svc.features.length).toBeGreaterThanOrEqual(3);
      expect(svc.featuresKo).toBeInstanceOf(Array);
      expect(svc.pricingTier).toMatch(/^(free|low|medium|high|enterprise)$/);
      expect(svc.trust).toBeDefined();
    }
  });

  it('should have Korean serviceNameKo values', () => {
    const koreanRegex = /[\uAC00-\uD7AF]/;
    const withKorean = NCP_SERVICES.filter((svc) => koreanRegex.test(svc.serviceNameKo));
    // Most services should have Korean names (some may keep English brand names)
    expect(withKorean.length).toBeGreaterThanOrEqual(10);
  });
});
