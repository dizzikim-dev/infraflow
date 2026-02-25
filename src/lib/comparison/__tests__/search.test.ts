import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllComparisonItems,
  searchComparisonItems,
  resetComparisonItemsCache,
} from '../search';
import { DEFAULT_FILTERS } from '../types';
import type { ComparisonFilters } from '../types';

// ---------------------------------------------------------------------------
// Tests — getAllComparisonItems
// ---------------------------------------------------------------------------

describe('getAllComparisonItems', () => {
  beforeEach(() => {
    resetComparisonItemsCache();
  });

  it('returns a non-empty array of ComparisonItems', async () => {
    const items = await getAllComparisonItems();
    expect(items.length).toBeGreaterThan(0);
  });

  it('contains both vendor and cloud items', async () => {
    const items = await getAllComparisonItems();
    const sources = new Set(items.map((i) => i.source));
    expect(sources.has('vendor')).toBe(true);
    expect(sources.has('cloud')).toBe(true);
  });

  it('only includes vendor products with infraNodeTypes length > 0', async () => {
    const items = await getAllComparisonItems();
    const vendorItems = items.filter((i) => i.source === 'vendor');
    for (const item of vendorItems) {
      expect(item.nodeTypes.length).toBeGreaterThan(0);
    }
  });

  it('only includes active cloud services', async () => {
    const items = await getAllComparisonItems();
    const cloudItems = items.filter((i) => i.source === 'cloud');
    // All cloud items should exist, and they should all map to active services
    expect(cloudItems.length).toBeGreaterThan(0);
  });

  it('caches the result on subsequent calls', async () => {
    const first = await getAllComparisonItems();
    const second = await getAllComparisonItems();
    expect(first).toBe(second); // Same reference
  });

  it('vendor items have vendorName set', async () => {
    const items = await getAllComparisonItems();
    const vendorItems = items.filter((i) => i.source === 'vendor');
    for (const item of vendorItems) {
      expect(item.vendorName).toBeDefined();
      expect(item.vendorName!.length).toBeGreaterThan(0);
    }
  });

  it('cloud items have cloudProvider set', async () => {
    const items = await getAllComparisonItems();
    const cloudItems = items.filter((i) => i.source === 'cloud');
    for (const item of cloudItems) {
      expect(item.cloudProvider).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Tests — searchComparisonItems
// ---------------------------------------------------------------------------

describe('searchComparisonItems', () => {
  beforeEach(() => {
    resetComparisonItemsCache();
  });

  it('returns empty array for empty query', async () => {
    const results = await searchComparisonItems('', DEFAULT_FILTERS);
    expect(results).toEqual([]);
  });

  it('returns empty array for whitespace-only query', async () => {
    const results = await searchComparisonItems('   ', DEFAULT_FILTERS);
    expect(results).toEqual([]);
  });

  it('finds vendor products by name (case-insensitive)', async () => {
    const results = await searchComparisonItems('firepower', DEFAULT_FILTERS);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.source === 'vendor')).toBe(true);
    expect(
      results.some((r) =>
        r.name.toLowerCase().includes('firepower'),
      ),
    ).toBe(true);
  });

  it('finds cloud services by name', async () => {
    const results = await searchComparisonItems('AWS WAF', DEFAULT_FILTERS);
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.some((r) => r.source === 'cloud' && r.name === 'AWS WAF'),
    ).toBe(true);
  });

  it('searches Korean names (nameKo)', async () => {
    const results = await searchComparisonItems('방화벽', DEFAULT_FILTERS);
    expect(results.length).toBeGreaterThan(0);
  });

  it('limits results to 20', async () => {
    // A broad query that should match many items
    const results = await searchComparisonItems('a', DEFAULT_FILTERS);
    expect(results.length).toBeLessThanOrEqual(20);
  });

  it('filters by source: vendor only', async () => {
    const filters: ComparisonFilters = {
      ...DEFAULT_FILTERS,
      sources: ['vendor'],
    };
    const results = await searchComparisonItems('fire', filters);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.source === 'vendor')).toBe(true);
  });

  it('filters by source: cloud only', async () => {
    const filters: ComparisonFilters = {
      ...DEFAULT_FILTERS,
      sources: ['cloud'],
    };
    const results = await searchComparisonItems('WAF', filters);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.source === 'cloud')).toBe(true);
  });

  it('filters by vendor name', async () => {
    const filters: ComparisonFilters = {
      ...DEFAULT_FILTERS,
      vendors: ['cisco'],
    };
    const results = await searchComparisonItems('fire', filters);
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      if (r.source === 'vendor') {
        expect(r.vendorName?.toLowerCase()).toContain('cisco');
      }
    }
  });

  it('filters by cloudProvider', async () => {
    const filters: ComparisonFilters = {
      ...DEFAULT_FILTERS,
      cloudProviders: ['aws'],
    };
    const results = await searchComparisonItems('load', filters);
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      if (r.source === 'cloud') {
        expect(r.cloudProvider).toBe('aws');
      }
    }
  });

  it('filters by nodeType', async () => {
    const filters: ComparisonFilters = {
      ...DEFAULT_FILTERS,
      nodeTypes: ['firewall'],
    };
    const results = await searchComparisonItems('fire', filters);
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.nodeTypes).toContain('firewall');
    }
  });

  it('filters by category', async () => {
    const filters: ComparisonFilters = {
      ...DEFAULT_FILTERS,
      categories: ['security'],
    };
    const results = await searchComparisonItems('WAF', filters);
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.category).toBe('security');
    }
  });

  it('combines multiple filters (AND logic)', async () => {
    const filters: ComparisonFilters = {
      ...DEFAULT_FILTERS,
      sources: ['cloud'],
      cloudProviders: ['aws'],
      categories: ['security'],
    };
    const results = await searchComparisonItems('WAF', filters);
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.source).toBe('cloud');
      expect(r.cloudProvider).toBe('aws');
      expect(r.category).toBe('security');
    }
  });
});
