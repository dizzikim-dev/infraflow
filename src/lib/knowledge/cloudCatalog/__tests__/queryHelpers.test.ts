/**
 * Cloud Service Catalog - Query Helpers Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getCloudServices,
  getDeprecationWarnings,
  compareServices,
  getAlternatives,
  getServicesByDeploymentModel,
  getServicesWithCompliance,
  getIntegrationPartners,
  getServiceCategories,
  getProviderCoverageStats,
  compareServicesEnriched,
  CLOUD_SERVICES,
} from '../index';
import type { InfraSpec } from '@/types/infra';

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

// ---------------------------------------------------------------------------
// getServicesByDeploymentModel
// ---------------------------------------------------------------------------

describe('getServicesByDeploymentModel', () => {
  it('should return serverless services', () => {
    const result = getServicesByDeploymentModel('serverless');
    expect(result.length).toBeGreaterThan(0);
    for (const svc of result) {
      expect(svc.deploymentModel).toBe('serverless');
    }
  });

  it('should filter by provider when specified', () => {
    const result = getServicesByDeploymentModel('managed', 'aws');
    for (const svc of result) {
      expect(svc.provider).toBe('aws');
      expect(svc.deploymentModel).toBe('managed');
    }
  });
});

// ---------------------------------------------------------------------------
// getServicesWithCompliance
// ---------------------------------------------------------------------------

describe('getServicesWithCompliance', () => {
  it('should return services with SOC 2 compliance', () => {
    const result = getServicesWithCompliance(['SOC 2']);
    expect(result.length).toBeGreaterThan(0);
    for (const svc of result) {
      expect(svc.complianceCertifications).toBeDefined();
      expect(svc.complianceCertifications!.some((c) => c.toLowerCase() === 'soc 2')).toBe(true);
    }
  });

  it('should filter by multiple frameworks (any match)', () => {
    const result = getServicesWithCompliance(['SOC 2', 'HIPAA']);
    expect(result.length).toBeGreaterThan(0);
    for (const svc of result) {
      const certsLower = svc.complianceCertifications!.map((c) => c.toLowerCase());
      // At least one of the requested frameworks must be present
      const hasAny = certsLower.includes('soc 2') || certsLower.includes('hipaa');
      expect(hasAny).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// getIntegrationPartners
// ---------------------------------------------------------------------------

describe('getIntegrationPartners', () => {
  it('should return empty for service without integrations', () => {
    const result = getIntegrationPartners('CS-FW-AWS-001');
    expect(result).toEqual([]);
  });

  it('should return empty for unknown service ID', () => {
    const result = getIntegrationPartners('NONEXISTENT');
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getServiceCategories
// ---------------------------------------------------------------------------

describe('getServiceCategories', () => {
  it('should return categories with counts', () => {
    const result = getServiceCategories();
    expect(result.length).toBeGreaterThan(0);
    const categoryNames = result.map((c) => c.category);
    expect(categoryNames).toContain('Security');
    expect(categoryNames).toContain('Networking');
    expect(categoryNames).toContain('Compute');
    for (const cat of result) {
      expect(cat.categoryKo).toBeTruthy();
      expect(cat.count).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// getProviderCoverageStats
// ---------------------------------------------------------------------------

describe('getProviderCoverageStats', () => {
  it('should return stats for all providers', () => {
    const stats = getProviderCoverageStats();
    expect(stats.aws).toBeDefined();
    expect(stats.azure).toBeDefined();
    expect(stats.gcp).toBeDefined();
    expect(stats.ncp).toBeDefined();
    expect(stats.kakao).toBeDefined();
    expect(stats.kt).toBeDefined();
    expect(stats.nhn).toBeDefined();
  });

  it('should have correct total counts', () => {
    const stats = getProviderCoverageStats();
    const total = stats.aws.totalServices + stats.azure.totalServices + stats.gcp.totalServices +
      stats.ncp.totalServices + stats.kakao.totalServices + stats.kt.totalServices + stats.nhn.totalServices;
    expect(total).toBe(CLOUD_SERVICES.length);
  });

  it('should count active and deprecated services correctly', () => {
    const stats = getProviderCoverageStats();
    for (const provider of ['aws', 'azure', 'gcp', 'ncp', 'kakao', 'kt', 'nhn'] as const) {
      expect(stats[provider].activeServices + stats[provider].deprecatedServices)
        .toBeLessThanOrEqual(stats[provider].totalServices);
    }
  });

  it('enrichedServices should be greater than 0 after Phase 3', () => {
    const stats = getProviderCoverageStats();
    expect(stats.aws.enrichedServices).toBeGreaterThan(0);
    expect(stats.azure.enrichedServices).toBeGreaterThan(0);
    expect(stats.gcp.enrichedServices).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// compareServicesEnriched
// ---------------------------------------------------------------------------

describe('compareServicesEnriched', () => {
  it('should include base comparison fields', () => {
    const result = compareServicesEnriched('firewall');
    expect(result.componentType).toBe('firewall');
    expect(result.services.length).toBeGreaterThanOrEqual(2);
  });

  it('should populate mostFeatures for services with features', () => {
    const result = compareServicesEnriched('firewall');
    expect(result.mostFeatures).toBeDefined();
    expect(result.mostFeatures!.count).toBeGreaterThan(0);
  });

  it('bestSLA should be populated for enriched services', () => {
    const result = compareServicesEnriched('firewall');
    expect(result.bestSLA).toBeDefined();
    expect(result.bestSLA!.sla).toBeTruthy();
  });

  it('cheapest should be populated for enriched services', () => {
    const result = compareServicesEnriched('firewall');
    expect(result.cheapest).toBeDefined();
    expect(result.cheapest!.cost).toBeGreaterThanOrEqual(0);
  });
});
