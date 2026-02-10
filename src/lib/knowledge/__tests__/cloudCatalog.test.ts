/**
 * Cloud Service Catalog Tests
 */

import { describe, it, expect } from 'vitest';
import {
  CLOUD_SERVICES,
  getCloudServices,
  getDeprecationWarnings,
  compareServices,
  getAlternatives,
  type CloudService,
} from '../cloudCatalog';
import type { InfraSpec } from '@/types/infra';

// ---------------------------------------------------------------------------
// Data Integrity
// ---------------------------------------------------------------------------

describe('CLOUD_SERVICES data integrity', () => {
  it('should have at least 60 entries', () => {
    expect(CLOUD_SERVICES.length).toBeGreaterThanOrEqual(60);
  });

  it('should have unique IDs', () => {
    const ids = CLOUD_SERVICES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every entry should have required fields', () => {
    for (const svc of CLOUD_SERVICES) {
      expect(svc.id).toBeTruthy();
      expect(['aws', 'azure', 'gcp']).toContain(svc.provider);
      expect(svc.componentType).toBeTruthy();
      expect(svc.serviceName).toBeTruthy();
      expect(svc.serviceNameKo).toBeTruthy();
      expect(['active', 'deprecated', 'preview', 'end-of-life']).toContain(svc.status);
      expect(svc.features.length).toBeGreaterThan(0);
      expect(svc.featuresKo.length).toBeGreaterThan(0);
      expect(svc.features.length).toBe(svc.featuresKo.length);
      expect(['free', 'low', 'medium', 'high', 'enterprise']).toContain(svc.pricingTier);
      expect(svc.trust).toBeDefined();
      expect(svc.trust.confidence).toBeGreaterThan(0);
    }
  });

  it('all three providers should be represented', () => {
    const providers = new Set(CLOUD_SERVICES.map((s) => s.provider));
    expect(providers.has('aws')).toBe(true);
    expect(providers.has('azure')).toBe(true);
    expect(providers.has('gcp')).toBe(true);
  });

  it('deprecated services should have successor info', () => {
    const deprecated = CLOUD_SERVICES.filter((s) => s.status === 'deprecated');
    expect(deprecated.length).toBeGreaterThan(0);
    for (const svc of deprecated) {
      expect(svc.successor).toBeTruthy();
      expect(svc.successorKo).toBeTruthy();
    }
  });

  it('should cover major component types', () => {
    const types = new Set(CLOUD_SERVICES.map((s) => s.componentType));
    expect(types.has('firewall')).toBe(true);
    expect(types.has('load-balancer')).toBe(true);
    expect(types.has('web-server')).toBe(true);
    expect(types.has('db-server')).toBe(true);
    expect(types.has('kubernetes')).toBe(true);
    expect(types.has('cache')).toBe(true);
    expect(types.has('dns')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getCloudServices
// ---------------------------------------------------------------------------

describe('getCloudServices', () => {
  it('should return all services for a component type', () => {
    const result = getCloudServices('firewall');
    expect(result.length).toBeGreaterThanOrEqual(3);
  });

  it('should filter by provider when specified', () => {
    const result = getCloudServices('firewall', 'aws');
    expect(result.length).toBeGreaterThan(0);
    for (const svc of result) {
      expect(svc.provider).toBe('aws');
    }
  });

  it('should return empty for unknown component type', () => {
    const result = getCloudServices('ring-network');
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getDeprecationWarnings
// ---------------------------------------------------------------------------

describe('getDeprecationWarnings', () => {
  it('should detect deprecated services for matching components', () => {
    const spec: InfraSpec = {
      nodes: [
        { id: 'lb-1', type: 'load-balancer', label: 'LB' },
        { id: 'iam-1', type: 'iam', label: 'IAM' },
      ],
      connections: [],
    };
    const warnings = getDeprecationWarnings(spec);
    expect(warnings.length).toBeGreaterThan(0);
    // AWS Classic LB is deprecated, Azure AD is deprecated
  });

  it('should return empty array for spec with no deprecated services', () => {
    const spec: InfraSpec = {
      nodes: [{ id: 'dns-1', type: 'dns', label: 'DNS' }],
      connections: [],
    };
    const warnings = getDeprecationWarnings(spec);
    expect(warnings).toEqual([]);
  });

  it('should sort by urgency (critical first)', () => {
    const spec: InfraSpec = {
      nodes: [
        { id: 'lb-1', type: 'load-balancer', label: 'LB' },
        { id: 'cdn-1', type: 'cdn', label: 'CDN' },
        { id: 'iam-1', type: 'iam', label: 'IAM' },
      ],
      connections: [],
    };
    const warnings = getDeprecationWarnings(spec);
    if (warnings.length >= 2) {
      const urgencyOrder = { critical: 0, high: 1, medium: 2 };
      for (let i = 1; i < warnings.length; i++) {
        expect(urgencyOrder[warnings[i].urgency]).toBeGreaterThanOrEqual(
          urgencyOrder[warnings[i - 1].urgency],
        );
      }
    }
  });

  it('should include Korean message', () => {
    const spec: InfraSpec = {
      nodes: [{ id: 'lb-1', type: 'load-balancer', label: 'LB' }],
      connections: [],
    };
    const warnings = getDeprecationWarnings(spec);
    for (const w of warnings) {
      expect(w.messageKo).toBeTruthy();
    }
  });
});

// ---------------------------------------------------------------------------
// compareServices
// ---------------------------------------------------------------------------

describe('compareServices', () => {
  it('should return services from multiple providers', () => {
    const comparison = compareServices('firewall');
    expect(comparison.componentType).toBe('firewall');
    const providers = new Set(comparison.services.map((s) => s.provider));
    expect(providers.size).toBeGreaterThanOrEqual(2);
  });

  it('should only return active services', () => {
    const comparison = compareServices('load-balancer');
    for (const svc of comparison.services) {
      expect(svc.status).toBe('active');
    }
  });
});

// ---------------------------------------------------------------------------
// getAlternatives
// ---------------------------------------------------------------------------

describe('getAlternatives', () => {
  it('should return active alternatives for deprecated service', () => {
    const deprecatedService = CLOUD_SERVICES.find(
      (s) => s.status === 'deprecated' && s.componentType === 'load-balancer',
    )!;
    expect(deprecatedService).toBeDefined();
    const alternatives = getAlternatives(deprecatedService);
    expect(alternatives.length).toBeGreaterThan(0);
    for (const alt of alternatives) {
      expect(alt.status).toBe('active');
      expect(alt.provider).toBe(deprecatedService.provider);
    }
  });

  it('should return empty array for active service', () => {
    const activeSvc = CLOUD_SERVICES.find((s) => s.status === 'active')!;
    const alternatives = getAlternatives(activeSvc);
    expect(alternatives).toEqual([]);
  });
});
