/**
 * AWS Cloud Services - Data Integrity Tests
 */

import { describe, it, expect } from 'vitest';
import { AWS_SERVICES } from '../../providers/aws';

describe('AWS_SERVICES', () => {
  it('should have at least 20 services', () => {
    expect(AWS_SERVICES.length).toBeGreaterThanOrEqual(20);
  });

  it('all entries should have provider "aws"', () => {
    for (const svc of AWS_SERVICES) {
      expect(svc.provider).toBe('aws');
    }
  });

  it('IDs should follow CS-*-AWS-* pattern', () => {
    for (const svc of AWS_SERVICES) {
      expect(svc.id).toMatch(/^CS-[A-Z0-9]+-AWS-\d{3}$/);
    }
  });

  it('should have unique IDs', () => {
    const ids = AWS_SERVICES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should cover key AWS service categories', () => {
    const types = new Set(AWS_SERVICES.map((s) => s.componentType));
    expect(types.has('firewall')).toBe(true);
    expect(types.has('load-balancer')).toBe(true);
    expect(types.has('db-server')).toBe(true);
    expect(types.has('kubernetes')).toBe(true);
    expect(types.has('object-storage')).toBe(true);
  });

  it('every entry should have bilingual fields', () => {
    for (const svc of AWS_SERVICES) {
      expect(svc.serviceNameKo).toBeTruthy();
      expect(svc.featuresKo.length).toBe(svc.features.length);
    }
  });

  it('should have trust metadata', () => {
    for (const svc of AWS_SERVICES) {
      expect(svc.trust.confidence).toBe(0.85);
      expect(svc.trust.sources[0].type).toBe('vendor');
      expect(svc.trust.sources[0].url).toContain('aws.amazon.com');
    }
  });
});
