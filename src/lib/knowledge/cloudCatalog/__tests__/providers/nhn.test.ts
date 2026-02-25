/**
 * NHN Cloud Services - Data Integrity Tests
 */

import { describe, it, expect } from 'vitest';
import { NHN_SERVICES } from '../../providers/nhn';

describe('NHN_SERVICES', () => {
  it('should have at least 30 services', () => {
    expect(NHN_SERVICES.length).toBeGreaterThanOrEqual(30);
  });

  it('all entries should have provider "nhn"', () => {
    for (const svc of NHN_SERVICES) {
      expect(svc.provider).toBe('nhn');
    }
  });

  it('IDs should follow CS-*-NHN-* pattern', () => {
    for (const svc of NHN_SERVICES) {
      expect(svc.id).toMatch(/^CS-[A-Z0-9]+-NHN-\d{3}$/);
    }
  });

  it('should have unique IDs', () => {
    const ids = NHN_SERVICES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should cover key NHN Cloud service categories', () => {
    const types = new Set(NHN_SERVICES.map((s) => s.componentType));
    expect(types.has('web-server')).toBe(true);
    expect(types.has('db-server')).toBe(true);
    expect(types.has('object-storage')).toBe(true);
    expect(types.has('kubernetes')).toBe(true);
  });

  it('every entry should have bilingual fields', () => {
    for (const svc of NHN_SERVICES) {
      expect(svc.serviceNameKo).toBeTruthy();
      expect(svc.featuresKo.length).toBe(svc.features.length);
    }
  });

  it('should have trust metadata pointing to nhncloud.com', () => {
    for (const svc of NHN_SERVICES) {
      expect(svc.trust.confidence).toBe(0.85);
      expect(svc.trust.sources[0].type).toBe('vendor');
      expect(svc.trust.sources[0].url).toContain('nhncloud.com');
    }
  });

  it('should have all required fields', () => {
    for (const svc of NHN_SERVICES) {
      expect(svc.id).toBeTruthy();
      expect(svc.provider).toBe('nhn');
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
    const withKorean = NHN_SERVICES.filter((svc) => koreanRegex.test(svc.serviceNameKo));
    expect(withKorean.length).toBeGreaterThanOrEqual(10);
  });
});
