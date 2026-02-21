/**
 * Azure Cloud Services - Data Integrity Tests
 */

import { describe, it, expect } from 'vitest';
import { AZURE_SERVICES } from '../../providers/azure';

describe('AZURE_SERVICES', () => {
  it('should have at least 18 services', () => {
    expect(AZURE_SERVICES.length).toBeGreaterThanOrEqual(18);
  });

  it('all entries should have provider "azure"', () => {
    for (const svc of AZURE_SERVICES) {
      expect(svc.provider).toBe('azure');
    }
  });

  it('IDs should follow CS-*-AZ-* pattern', () => {
    for (const svc of AZURE_SERVICES) {
      expect(svc.id).toMatch(/^CS-[A-Z0-9]+-AZ-\d{3}$/);
    }
  });

  it('should have unique IDs', () => {
    const ids = AZURE_SERVICES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should cover key Azure service categories', () => {
    const types = new Set(AZURE_SERVICES.map((s) => s.componentType));
    expect(types.has('firewall')).toBe(true);
    expect(types.has('load-balancer')).toBe(true);
    expect(types.has('db-server')).toBe(true);
    expect(types.has('kubernetes')).toBe(true);
    expect(types.has('object-storage')).toBe(true);
  });

  it('every entry should have bilingual fields', () => {
    for (const svc of AZURE_SERVICES) {
      expect(svc.serviceNameKo).toBeTruthy();
      expect(svc.featuresKo.length).toBe(svc.features.length);
    }
  });

  it('should have trust metadata', () => {
    for (const svc of AZURE_SERVICES) {
      expect(svc.trust.confidence).toBe(0.85);
      expect(svc.trust.sources[0].type).toBe('vendor');
      expect(svc.trust.sources[0].url).toContain('azure.microsoft.com');
    }
  });

  it('should include deprecated Azure AD with successor', () => {
    const azureAD = AZURE_SERVICES.find((s) => s.id === 'CS-IAM-AZ-002');
    expect(azureAD).toBeDefined();
    expect(azureAD!.status).toBe('deprecated');
    expect(azureAD!.successor).toBe('Microsoft Entra ID');
    expect(azureAD!.successorKo).toBe('Microsoft Entra ID');
  });
});
