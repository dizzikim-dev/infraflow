import { describe, it, expect } from 'vitest';
import {
  allVendorMappings,
  getVendorMap,
  getCloudOptions,
  getManagedOptions,
  getOpenSourceOptions,
  getOnPremOptions,
  getByCategory,
  searchVendorMappings,
  getCoverageMatrix,
} from '../index';
import type { ComponentVendorMap } from '../types';

// ---------------------------------------------------------------------------
// Data integrity tests
// ---------------------------------------------------------------------------

describe('vendorMappings data integrity', () => {
  it('should have mappings for at least 60 components', () => {
    expect(allVendorMappings.length).toBeGreaterThanOrEqual(60);
  });

  it('should have no duplicate componentIds', () => {
    const ids = allVendorMappings.map((m) => m.componentId);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have valid categories on all entries', () => {
    const validCategories = [
      'security', 'network', 'compute', 'cloud',
      'storage', 'auth', 'telecom', 'wan', 'external',
    ];
    for (const m of allVendorMappings) {
      expect(validCategories).toContain(m.category);
    }
  });

  it('should have unique IDs within each component vendor map', () => {
    for (const m of allVendorMappings) {
      const allIds = [
        ...m.cloud.map((c) => c.id),
        ...m.managed.map((a) => a.id),
        ...m.openSource.map((o) => o.id),
        ...m.onPremise.map((p) => p.id),
      ];
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    }
  });

  it('should have VM- prefix on all entry IDs', () => {
    for (const m of allVendorMappings) {
      for (const c of m.cloud) {
        expect(c.id).toMatch(/^VM-/);
      }
      for (const a of m.managed) {
        expect(a.id).toMatch(/^VM-/);
      }
      for (const o of m.openSource) {
        expect(o.id).toMatch(/^VM-/);
      }
      for (const p of m.onPremise) {
        expect(p.id).toMatch(/^VM-/);
      }
    }
  });

  it('should have valid cloud providers', () => {
    const validProviders = ['aws', 'azure', 'gcp'];
    for (const m of allVendorMappings) {
      for (const c of m.cloud) {
        expect(validProviders).toContain(c.provider);
      }
    }
  });

  it('should have lastVerified dates on all cloud entries', () => {
    for (const m of allVendorMappings) {
      for (const c of m.cloud) {
        expect(c.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it('should have Korean name fields populated on all cloud entries', () => {
    for (const m of allVendorMappings) {
      for (const c of m.cloud) {
        expect(c.serviceNameKo.length).toBeGreaterThan(0);
        expect(c.differentiatorKo.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have Korean name fields populated on all managed entries', () => {
    for (const m of allVendorMappings) {
      for (const a of m.managed) {
        expect(a.productNameKo.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have Korean name fields populated on all on-premise entries', () => {
    for (const m of allVendorMappings) {
      for (const p of m.onPremise) {
        expect(p.productNameKo.length).toBeGreaterThan(0);
        expect(p.targetUseCaseKo.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have valid lifecycle status on all on-premise entries', () => {
    const validStatuses = ['active', 'end-of-sale', 'end-of-life'];
    for (const m of allVendorMappings) {
      for (const p of m.onPremise) {
        expect(validStatuses).toContain(p.lifecycleStatus);
      }
    }
  });

  it('should have valid product tiers on all on-premise entries', () => {
    const validTiers = ['entry', 'mid-range', 'enterprise'];
    for (const m of allVendorMappings) {
      for (const p of m.onPremise) {
        expect(validTiers).toContain(p.productTier);
      }
    }
  });

  it('should have non-empty docUrl on all cloud entries', () => {
    for (const m of allVendorMappings) {
      for (const c of m.cloud) {
        expect(c.docUrl.length).toBeGreaterThan(0);
        expect(c.docUrl).toMatch(/^https?:\/\//);
      }
    }
  });

  it('should have non-empty productUrl on all on-premise entries', () => {
    for (const m of allVendorMappings) {
      for (const p of m.onPremise) {
        expect(p.productUrl.length).toBeGreaterThan(0);
        expect(p.productUrl).toMatch(/^https?:\/\//);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Category coverage tests
// ---------------------------------------------------------------------------

describe('vendorMappings category coverage', () => {
  const categories: Array<{ category: string; minCount: number }> = [
    { category: 'security', minCount: 10 },
    { category: 'network', minCount: 6 },
    { category: 'wan', minCount: 10 },
    { category: 'compute', minCount: 8 },
    { category: 'cloud', minCount: 3 },
    { category: 'storage', minCount: 5 },
    { category: 'auth', minCount: 3 },
    { category: 'telecom', minCount: 4 },
  ];

  it.each(categories)(
    'should have at least $minCount components for $category',
    ({ category, minCount }) => {
      const components = getByCategory(category as never);
      expect(components.length).toBeGreaterThanOrEqual(minCount);
    },
  );
});

// ---------------------------------------------------------------------------
// Query function tests
// ---------------------------------------------------------------------------

describe('getVendorMap', () => {
  it('should return vendor map for known component', () => {
    const result = getVendorMap('firewall');
    expect(result).toBeDefined();
    expect(result!.componentId).toBe('firewall');
    expect(result!.category).toBe('security');
  });

  it('should return undefined for unknown component', () => {
    const result = getVendorMap('nonexistent' as never);
    expect(result).toBeUndefined();
  });

  it('should return vendor map with all four arrays', () => {
    const result = getVendorMap('load-balancer');
    expect(result).toBeDefined();
    expect(Array.isArray(result!.cloud)).toBe(true);
    expect(Array.isArray(result!.managed)).toBe(true);
    expect(Array.isArray(result!.openSource)).toBe(true);
    expect(Array.isArray(result!.onPremise)).toBe(true);
  });
});

describe('getCloudOptions', () => {
  it('should return all cloud options for a component', () => {
    const options = getCloudOptions('firewall');
    expect(options.length).toBeGreaterThanOrEqual(2);
  });

  it('should filter by provider', () => {
    const awsOptions = getCloudOptions('firewall', 'aws');
    for (const opt of awsOptions) {
      expect(opt.provider).toBe('aws');
    }
  });

  it('should return empty array for component with no cloud mapping', () => {
    const options = getCloudOptions('cctv-camera');
    expect(options).toEqual([]);
  });

  it('should return empty array for unknown component', () => {
    const options = getCloudOptions('nonexistent' as never);
    expect(options).toEqual([]);
  });
});

describe('getManagedOptions', () => {
  it('should return managed alternatives', () => {
    const options = getManagedOptions('kubernetes');
    expect(options.length).toBeGreaterThanOrEqual(1);
  });
});

describe('getOpenSourceOptions', () => {
  it('should return open-source alternatives', () => {
    const options = getOpenSourceOptions('firewall');
    expect(options.length).toBeGreaterThanOrEqual(1);
    expect(options[0].license.length).toBeGreaterThan(0);
  });
});

describe('getOnPremOptions', () => {
  it('should return on-premise products', () => {
    const options = getOnPremOptions('firewall');
    expect(options.length).toBeGreaterThanOrEqual(2);
  });

  it('should filter by tier', () => {
    const enterprise = getOnPremOptions('firewall', 'enterprise');
    for (const p of enterprise) {
      expect(p.productTier).toBe('enterprise');
    }
  });
});

describe('getByCategory', () => {
  it('should return all security components', () => {
    const security = getByCategory('security');
    expect(security.length).toBeGreaterThanOrEqual(10);
    for (const m of security) {
      expect(m.category).toBe('security');
    }
  });
});

describe('searchVendorMappings', () => {
  it('should find by vendor name', () => {
    const results = searchVendorMappings('Palo Alto');
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it('should find by Korean name', () => {
    const results = searchVendorMappings('방화벽');
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it('should be case-insensitive', () => {
    const upper = searchVendorMappings('CLOUDFLARE');
    const lower = searchVendorMappings('cloudflare');
    expect(upper.length).toBe(lower.length);
  });

  it('should return empty for no match', () => {
    const results = searchVendorMappings('xyznonexistent12345');
    expect(results).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Coverage matrix tests
// ---------------------------------------------------------------------------

describe('getCoverageMatrix', () => {
  it('should produce a valid coverage matrix', () => {
    const matrix = getCoverageMatrix();
    expect(matrix.total).toBe(allVendorMappings.length);
    expect(matrix.full + matrix.partial + matrix.empty).toBe(matrix.total);
    expect(matrix.components.length).toBe(matrix.total);
    expect(matrix.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}/);
  });

  it('should have mostly full or partial coverage', () => {
    const matrix = getCoverageMatrix();
    const coveredPercent = ((matrix.full + matrix.partial) / matrix.total) * 100;
    expect(coveredPercent).toBeGreaterThanOrEqual(90);
  });

  it('should have zero empty components', () => {
    const matrix = getCoverageMatrix();
    expect(matrix.empty).toBe(0);
  });

  it('should have correct counts per component', () => {
    const matrix = getCoverageMatrix();
    for (const c of matrix.components) {
      const map = getVendorMap(c.componentId);
      expect(map).toBeDefined();
      expect(c.cloudCount).toBe(map!.cloud.length);
      expect(c.managedCount).toBe(map!.managed.length);
      expect(c.openSourceCount).toBe(map!.openSource.length);
      expect(c.onPremCount).toBe(map!.onPremise.length);
    }
  });
});

// ---------------------------------------------------------------------------
// Specific component spot checks
// ---------------------------------------------------------------------------

describe('spot checks — well-known components', () => {
  it('firewall should have Palo Alto in on-premise', () => {
    const map = getVendorMap('firewall');
    const paloAlto = map!.onPremise.find((p) =>
      p.vendorName.toLowerCase().includes('palo alto'),
    );
    expect(paloAlto).toBeDefined();
    expect(paloAlto!.lifecycleStatus).toBe('active');
  });

  it('kubernetes should have EKS, AKS, GKE in cloud', () => {
    const map = getVendorMap('kubernetes');
    expect(map!.cloud.length).toBeGreaterThanOrEqual(3);
    const providers = map!.cloud.map((c) => c.provider);
    expect(providers).toContain('aws');
    expect(providers).toContain('azure');
    expect(providers).toContain('gcp');
  });

  it('load-balancer should have HAProxy or Nginx in open-source', () => {
    const map = getVendorMap('load-balancer');
    const ossNames = map!.openSource.map((o) => o.projectName.toLowerCase());
    const hasHAProxy = ossNames.some((n) => n.includes('haproxy'));
    const hasNginx = ossNames.some((n) => n.includes('nginx'));
    const hasEnvoy = ossNames.some((n) => n.includes('envoy'));
    expect(hasHAProxy || hasNginx || hasEnvoy).toBe(true);
  });

  it('cctv-camera should have empty cloud array', () => {
    const map = getVendorMap('cctv-camera');
    expect(map!.cloud).toEqual([]);
    expect(map!.onPremise.length).toBeGreaterThanOrEqual(2);
  });

  it('elasticsearch should have Elastic Cloud in managed', () => {
    const map = getVendorMap('elasticsearch');
    const elastic = map!.managed.find((a) =>
      a.vendorName.toLowerCase().includes('elastic'),
    );
    expect(elastic).toBeDefined();
  });
});
