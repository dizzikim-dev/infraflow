/**
 * Tests for getAllVendorCatalogsAsync — async lazy-loading API.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllVendorCatalogsAsync,
  _resetVendorCatalogCache,
  getVendorList,
} from '../index';

describe('getAllVendorCatalogsAsync', () => {
  beforeEach(() => {
    _resetVendorCatalogCache();
  });

  it('should return an array of VendorCatalog objects', async () => {
    const catalogs = await getAllVendorCatalogsAsync();
    expect(Array.isArray(catalogs)).toBe(true);
    expect(catalogs.length).toBeGreaterThan(0);
  });

  it('should return the same catalogs as getVendorList', async () => {
    const catalogs = await getAllVendorCatalogsAsync();
    const vendorList = await getVendorList();
    expect(catalogs.length).toBe(vendorList.length);
  });

  it('should contain the same vendor IDs as getVendorList', async () => {
    const catalogs = await getAllVendorCatalogsAsync();
    const vendorList = await getVendorList();
    const asyncVendorIds = catalogs.map(c => c.vendorId).sort();
    const listVendorIds = vendorList.map(c => c.vendorId).sort();
    expect(asyncVendorIds).toEqual(listVendorIds);
  });

  it('should return valid VendorCatalog shapes', async () => {
    const catalogs = await getAllVendorCatalogsAsync();
    for (const catalog of catalogs) {
      expect(catalog.vendorId).toBeTruthy();
      expect(catalog.vendorName).toBeTruthy();
      expect(catalog.vendorNameKo).toBeTruthy();
      expect(Array.isArray(catalog.products)).toBe(true);
      expect(catalog.stats).toBeDefined();
    }
  });

  it('should cache the result on subsequent calls', async () => {
    const first = await getAllVendorCatalogsAsync();
    const second = await getAllVendorCatalogsAsync();
    expect(first).toBe(second); // same reference
  });

  it('should return fresh results after cache reset', async () => {
    const first = await getAllVendorCatalogsAsync();
    _resetVendorCatalogCache();
    const second = await getAllVendorCatalogsAsync();
    // Same content but different reference after reset
    expect(second.length).toBe(first.length);
  });

  it('should handle concurrent calls without duplication', async () => {
    // Fire two concurrent calls before either resolves
    const [result1, result2] = await Promise.all([
      getAllVendorCatalogsAsync(),
      getAllVendorCatalogsAsync(),
    ]);
    // Both should resolve to the same reference
    expect(result1).toBe(result2);
    expect(result1.length).toBe(22);
  });

  it('should include cisco vendor', async () => {
    const catalogs = await getAllVendorCatalogsAsync();
    const cisco = catalogs.find(c => c.vendorId === 'cisco');
    expect(cisco).toBeDefined();
    expect(cisco!.vendorName).toBe('Cisco Systems');
  });

  it('should include all 22 vendors', async () => {
    const catalogs = await getAllVendorCatalogsAsync();
    expect(catalogs.length).toBe(22);
  });
});
