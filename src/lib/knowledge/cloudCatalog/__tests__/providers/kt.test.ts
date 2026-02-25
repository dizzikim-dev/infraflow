/**
 * KT Cloud Services - Data Integrity Tests
 */

import { describe, it, expect } from 'vitest';
import { KT_SERVICES } from '../../providers/kt';

describe('KT_SERVICES', () => {
  it('should have at least 20 services', () => {
    expect(KT_SERVICES.length).toBeGreaterThanOrEqual(20);
  });

  it('all entries should have provider "kt"', () => {
    for (const svc of KT_SERVICES) {
      expect(svc.provider).toBe('kt');
    }
  });

  it('IDs should follow CS-*-KT-* pattern', () => {
    for (const svc of KT_SERVICES) {
      expect(svc.id).toMatch(/^CS-[A-Z0-9]+-KT-\d{3}$/);
    }
  });

  it('should have unique IDs', () => {
    const ids = KT_SERVICES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should cover key KT Cloud service categories', () => {
    const types = new Set(KT_SERVICES.map((s) => s.componentType));
    expect(types.has('web-server')).toBe(true);
    expect(types.has('db-server')).toBe(true);
    expect(types.has('object-storage')).toBe(true);
  });

  it('every entry should have bilingual fields', () => {
    for (const svc of KT_SERVICES) {
      expect(svc.serviceNameKo).toBeTruthy();
      expect(svc.featuresKo.length).toBe(svc.features.length);
    }
  });

  it('should have trust metadata pointing to cloud.kt.com', () => {
    for (const svc of KT_SERVICES) {
      expect(svc.trust.confidence).toBe(0.85);
      expect(svc.trust.sources[0].type).toBe('vendor');
      expect(svc.trust.sources[0].url).toContain('cloud.kt.com');
    }
  });

  it('should have all required fields', () => {
    for (const svc of KT_SERVICES) {
      expect(svc.id).toBeTruthy();
      expect(svc.provider).toBe('kt');
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
