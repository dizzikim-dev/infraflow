/**
 * GCP Cloud Services - Data Integrity Tests
 */

import { describe, it, expect } from 'vitest';
import { GCP_SERVICES } from '../../providers/gcp';

describe('GCP_SERVICES', () => {
  it('should have at least 35 services', () => {
    expect(GCP_SERVICES.length).toBeGreaterThanOrEqual(35);
  });

  it('all entries should have provider "gcp"', () => {
    for (const svc of GCP_SERVICES) {
      expect(svc.provider).toBe('gcp');
    }
  });

  it('IDs should follow CS-*-GCP-* pattern', () => {
    for (const svc of GCP_SERVICES) {
      expect(svc.id).toMatch(/^CS-[A-Z0-9]+-GCP-\d{3}$/);
    }
  });

  it('should have unique IDs', () => {
    const ids = GCP_SERVICES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should cover key GCP service categories', () => {
    const types = new Set(GCP_SERVICES.map((s) => s.componentType));
    expect(types.has('firewall')).toBe(true);
    expect(types.has('load-balancer')).toBe(true);
    expect(types.has('db-server')).toBe(true);
    expect(types.has('kubernetes')).toBe(true);
    expect(types.has('object-storage')).toBe(true);
  });

  it('every entry should have bilingual fields', () => {
    for (const svc of GCP_SERVICES) {
      expect(svc.serviceNameKo).toBeTruthy();
      expect(svc.featuresKo.length).toBe(svc.features.length);
    }
  });

  it('should have trust metadata', () => {
    for (const svc of GCP_SERVICES) {
      expect(svc.trust.confidence).toBe(0.85);
      expect(svc.trust.sources[0].type).toBe('vendor');
      expect(svc.trust.sources[0].url).toContain('cloud.google.com');
    }
  });

  it('should have no deprecated services', () => {
    const deprecated = GCP_SERVICES.filter((s) => s.status === 'deprecated');
    expect(deprecated.length).toBe(0);
  });
});
