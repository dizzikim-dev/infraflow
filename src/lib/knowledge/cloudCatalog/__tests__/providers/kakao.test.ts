/**
 * Kakao Cloud Services - Data Integrity Tests
 */

import { describe, it, expect } from 'vitest';
import { KAKAO_SERVICES } from '../../providers/kakao';

describe('KAKAO_SERVICES', () => {
  it('should have at least 15 services', () => {
    expect(KAKAO_SERVICES.length).toBeGreaterThanOrEqual(15);
  });

  it('all entries should have provider "kakao"', () => {
    for (const svc of KAKAO_SERVICES) {
      expect(svc.provider).toBe('kakao');
    }
  });

  it('IDs should follow CS-*-KAKAO-* pattern', () => {
    for (const svc of KAKAO_SERVICES) {
      expect(svc.id).toMatch(/^CS-[A-Z0-9]+-KAKAO-\d{3}$/);
    }
  });

  it('should have unique IDs', () => {
    const ids = KAKAO_SERVICES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should cover key Kakao Cloud service categories', () => {
    const types = new Set(KAKAO_SERVICES.map((s) => s.componentType));
    expect(types.has('web-server')).toBe(true);
    expect(types.has('db-server')).toBe(true);
    expect(types.has('object-storage')).toBe(true);
  });

  it('every entry should have bilingual fields', () => {
    for (const svc of KAKAO_SERVICES) {
      expect(svc.serviceNameKo).toBeTruthy();
      expect(svc.featuresKo.length).toBe(svc.features.length);
    }
  });

  it('should have trust metadata pointing to kakaocloud.com', () => {
    for (const svc of KAKAO_SERVICES) {
      expect(svc.trust.confidence).toBe(0.85);
      expect(svc.trust.sources[0].type).toBe('vendor');
      expect(svc.trust.sources[0].url).toContain('kakaocloud.com');
    }
  });

  it('should have all required fields', () => {
    for (const svc of KAKAO_SERVICES) {
      expect(svc.id).toBeTruthy();
      expect(svc.provider).toBe('kakao');
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
});
