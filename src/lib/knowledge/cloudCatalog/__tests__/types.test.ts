/**
 * Cloud Service Catalog - Type & Data Integrity Tests
 */

import { describe, it, expect } from 'vitest';
import { CLOUD_SERVICES, AWS_SERVICES, AZURE_SERVICES, GCP_SERVICES } from '../index';
import type { CloudService } from '../types';

// ---------------------------------------------------------------------------
// Data Integrity
// ---------------------------------------------------------------------------

describe('CLOUD_SERVICES data integrity', () => {
  it('should have at least 60 entries', () => {
    expect(CLOUD_SERVICES.length).toBeGreaterThanOrEqual(60);
  });

  it('merged array equals sum of provider arrays', () => {
    expect(CLOUD_SERVICES.length).toBe(
      AWS_SERVICES.length + AZURE_SERVICES.length + GCP_SERVICES.length,
    );
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

  it('IDs should follow CS-{CATEGORY}-{PROVIDER}-{SEQ} convention', () => {
    for (const svc of CLOUD_SERVICES) {
      expect(svc.id).toMatch(/^CS-[A-Z0-9]+-[A-Z]+-\d{3}$/);
    }
  });
});

// ---------------------------------------------------------------------------
// New Optional Fields Validation
// ---------------------------------------------------------------------------

describe('CloudService optional fields', () => {
  it('existing services without new fields should still be valid', () => {
    // All 70 original services have no new fields — backward compatible
    const service = CLOUD_SERVICES[0];
    expect(service.serviceCategory).toBeUndefined();
    expect(service.architectureRole).toBeUndefined();
    expect(service.recommendedFor).toBeUndefined();
    expect(service.specs).toBeUndefined();
    expect(service.sla).toBeUndefined();
    expect(service.regions).toBeUndefined();
    expect(service.complianceCertifications).toBeUndefined();
    expect(service.integrationsWith).toBeUndefined();
    expect(service.pricingModel).toBeUndefined();
    expect(service.typicalMonthlyCostUsd).toBeUndefined();
    expect(service.deploymentModel).toBeUndefined();
    expect(service.documentationUrl).toBeUndefined();
    expect(service.maxCapacity).toBeUndefined();
  });

  it('enriched services should have bilingual pairs for architecture fields', () => {
    const enriched = CLOUD_SERVICES.filter((s) => s.architectureRole);
    for (const svc of enriched) {
      if (svc.architectureRole) {
        expect(svc.architectureRoleKo).toBeTruthy();
      }
      if (svc.recommendedFor && svc.recommendedFor.length > 0) {
        expect(svc.recommendedForKo).toBeDefined();
        expect(svc.recommendedForKo!.length).toBe(svc.recommendedFor.length);
      }
      if (svc.serviceCategory) {
        expect(svc.serviceCategoryKo).toBeTruthy();
      }
    }
  });

  it('documentationUrl should be valid URL format when present', () => {
    const withUrl = CLOUD_SERVICES.filter((s) => s.documentationUrl);
    for (const svc of withUrl) {
      expect(svc.documentationUrl).toMatch(/^https?:\/\//);
    }
  });

  it('typicalMonthlyCostUsd should be non-negative when present', () => {
    const withCost = CLOUD_SERVICES.filter((s) => s.typicalMonthlyCostUsd != null);
    for (const svc of withCost) {
      expect(svc.typicalMonthlyCostUsd).toBeGreaterThanOrEqual(0);
    }
  });

  it('pricingModel should be a valid enum value when present', () => {
    const validModels = ['pay-as-you-go', 'reserved', 'spot', 'free-tier', 'committed-use', 'subscription'];
    const withModel = CLOUD_SERVICES.filter((s) => s.pricingModel);
    for (const svc of withModel) {
      expect(validModels).toContain(svc.pricingModel);
    }
  });

  it('deploymentModel should be a valid enum value when present', () => {
    const validModels = ['managed', 'serverless', 'self-managed', 'hybrid'];
    const withModel = CLOUD_SERVICES.filter((s) => s.deploymentModel);
    for (const svc of withModel) {
      expect(validModels).toContain(svc.deploymentModel);
    }
  });

  it('complianceCertifications should be non-empty array when present', () => {
    const withCerts = CLOUD_SERVICES.filter((s) => s.complianceCertifications);
    for (const svc of withCerts) {
      expect(svc.complianceCertifications!.length).toBeGreaterThan(0);
    }
  });

  it('recommendedFor should have at least 3 entries when present', () => {
    const withRec = CLOUD_SERVICES.filter((s) => s.recommendedFor);
    for (const svc of withRec) {
      expect(svc.recommendedFor!.length).toBeGreaterThanOrEqual(3);
    }
  });
});
