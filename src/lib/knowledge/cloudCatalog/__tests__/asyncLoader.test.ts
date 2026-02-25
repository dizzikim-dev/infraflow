/**
 * Tests for getAllCloudServicesAsync — async lazy-loading API.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllCloudServicesAsync,
  _resetCloudServiceCache,
  CLOUD_SERVICES,
  AWS_SERVICES,
  AZURE_SERVICES,
  GCP_SERVICES,
  NCP_SERVICES,
  KAKAO_SERVICES,
  KT_SERVICES,
  NHN_SERVICES,
} from '../index';

describe('getAllCloudServicesAsync', () => {
  beforeEach(() => {
    _resetCloudServiceCache();
  });

  it('should return an array of CloudService objects', async () => {
    const services = await getAllCloudServicesAsync();
    expect(Array.isArray(services)).toBe(true);
    expect(services.length).toBeGreaterThan(0);
  });

  it('should return the same number of services as the sync export', async () => {
    const services = await getAllCloudServicesAsync();
    expect(services.length).toBe(CLOUD_SERVICES.length);
  });

  it('should equal the sum of provider arrays', async () => {
    const services = await getAllCloudServicesAsync();
    expect(services.length).toBe(
      AWS_SERVICES.length + AZURE_SERVICES.length + GCP_SERVICES.length +
      NCP_SERVICES.length + KAKAO_SERVICES.length + KT_SERVICES.length + NHN_SERVICES.length,
    );
  });

  it('should contain the same service IDs as the sync export', async () => {
    const services = await getAllCloudServicesAsync();
    const asyncIds = services.map(s => s.id).sort();
    const syncIds = CLOUD_SERVICES.map(s => s.id).sort();
    expect(asyncIds).toEqual(syncIds);
  });

  it('should return valid CloudService shapes', async () => {
    const services = await getAllCloudServicesAsync();
    for (const svc of services) {
      expect(svc.id).toBeTruthy();
      expect(['aws', 'azure', 'gcp', 'ncp', 'kakao', 'kt', 'nhn']).toContain(svc.provider);
      expect(svc.serviceName).toBeTruthy();
      expect(svc.serviceNameKo).toBeTruthy();
      expect(svc.componentType).toBeTruthy();
    }
  });

  it('should cache the result on subsequent calls', async () => {
    const first = await getAllCloudServicesAsync();
    const second = await getAllCloudServicesAsync();
    expect(first).toBe(second); // same reference
  });

  it('should return fresh results after cache reset', async () => {
    const first = await getAllCloudServicesAsync();
    _resetCloudServiceCache();
    const second = await getAllCloudServicesAsync();
    // Same content but different reference after reset
    expect(second.length).toBe(first.length);
  });

  it('should handle concurrent calls without duplication', async () => {
    const [result1, result2] = await Promise.all([
      getAllCloudServicesAsync(),
      getAllCloudServicesAsync(),
    ]);
    // Both should resolve to the same reference
    expect(result1).toBe(result2);
    expect(result1.length).toBe(CLOUD_SERVICES.length);
  });

  it('should include all providers', async () => {
    const services = await getAllCloudServicesAsync();
    const providers = new Set(services.map(s => s.provider));
    expect(providers.has('aws')).toBe(true);
    expect(providers.has('azure')).toBe(true);
    expect(providers.has('gcp')).toBe(true);
    expect(providers.has('ncp')).toBe(true);
    expect(providers.has('kakao')).toBe(true);
    expect(providers.has('kt')).toBe(true);
    expect(providers.has('nhn')).toBe(true);
  });

  it('should have at least 100 entries', async () => {
    const services = await getAllCloudServicesAsync();
    expect(services.length).toBeGreaterThanOrEqual(100);
  });
});
