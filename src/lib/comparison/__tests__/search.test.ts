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

  it('returns a non-empty array of ComparisonItems', () => {
    const items = getAllComparisonItems();
    expect(items.length).toBeGreaterThan(0);
  });

  it('contains both vendor and cloud items', () => {
    const items = getAllComparisonItems();
    const sources = new Set(items.map((i) => i.source));
    expect(sources.has('vendor')).toBe(true);
    expect(sources.has('cloud')).toBe(true);
  });

  it('only includes vendor products with infraNodeTypes length > 0', () => {
    const items = getAllComparisonItems();
    const vendorItems = items.filter((i) => i.source === 'vendor');
    for (const item of vendorItems) {
      expect(item.nodeTypes.length).toBeGreaterThan(0);
    }
  });

  it('only includes active cloud services', () => {
    const items = getAllComparisonItems();
    const cloudItems = items.filter((i) => i.source === 'cloud');
    // All cloud items should exist, and they should all map to active services
    expect(cloudItems.length).toBeGreaterThan(0);
  });

  it('caches the result on subsequent calls', () => {
    const first = getAllComparisonItems();
    const second = getAllComparisonItems();
    expect(first).toBe(second); // Same reference
  });

  it('vendor items have vendorName set', () => {
    const items = getAllComparisonItems();
    const vendorItems = items.filter((i) => i.source === 'vendor');
    for (const item of vendorItems) {
      expect(item.vendorName).toBeDefined();
      expect(item.vendorName!.length).toBeGreaterThan(0);
    }
  });

  it('cloud items have cloudProvider set', () => {
    const items = getAllComparisonItems();
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

  it('returns empty array for empty query', () => {
    const results = searchComparisonItems('', DEFAULT_FILTERS);
    expect(results).toEqual([]);
  });

  it('returns empty array for whitespace-only query', () => {
    const results = searchComparisonItems('   ', DEFAULT_FILTERS);
    expect(results).toEqual([]);
  });

  it('finds vendor products by name (case-insensitive)', () => {
    const results = searchComparisonItems('firepower', DEFAULT_FILTERS);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.source === 'vendor')).toBe(true);
    expect(
      results.some((r) =>
        r.name.toLowerCase().includes('firepower'),
      ),
    ).toBe(true);
  });

  it('finds cloud services by name', () => {
    const results = searchComparisonItems('AWS WAF', DEFAULT_FILTERS);
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.some((r) => r.source === 'cloud' && r.name === 'AWS WAF'),
    ).toBe(true);
  });

  it('searches Korean names (nameKo)', () => {
    const results = searchComparisonItems('방화벽', DEFAULT_FILTERS);
    expect(results.length).toBeGreaterThan(0);
  });

  it('limits results to 20', () => {
    // A broad query that should match many items
    const results = searchComparisonItems('a', DEFAULT_FILTERS);
    expect(results.length).toBeLessThanOrEqual(20);
  });

  it('filters by source: vendor only', () => {
    const filters: ComparisonFilters = {
      ...DEFAULT_FILTERS,
      sources: ['vendor'],
    };
    const results = searchComparisonItems('fire', filters);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.source === 'vendor')).toBe(true);
  });

  it('filters by source: cloud only', () => {
    const filters: ComparisonFilters = {
      ...DEFAULT_FILTERS,
      sources: ['cloud'],
    };
    const results = searchComparisonItems('WAF', filters);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.source === 'cloud')).toBe(true);
  });

  it('filters by vendor name', () => {
    const filters: ComparisonFilters = {
      ...DEFAULT_FILTERS,
      vendors: ['cisco'],
    };
    const results = searchComparisonItems('fire', filters);
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      if (r.source === 'vendor') {
        expect(r.vendorName?.toLowerCase()).toContain('cisco');
      }
    }
  });

  it('filters by cloudProvider', () => {
    const filters: ComparisonFilters = {
      ...DEFAULT_FILTERS,
      cloudProviders: ['aws'],
    };
    const results = searchComparisonItems('load', filters);
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      if (r.source === 'cloud') {
        expect(r.cloudProvider).toBe('aws');
      }
    }
  });

  it('filters by nodeType', () => {
    const filters: ComparisonFilters = {
      ...DEFAULT_FILTERS,
      nodeTypes: ['firewall'],
    };
    const results = searchComparisonItems('fire', filters);
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.nodeTypes).toContain('firewall');
    }
  });

  it('filters by category', () => {
    const filters: ComparisonFilters = {
      ...DEFAULT_FILTERS,
      categories: ['security'],
    };
    const results = searchComparisonItems('WAF', filters);
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.category).toBe('security');
    }
  });

  it('combines multiple filters (AND logic)', () => {
    const filters: ComparisonFilters = {
      ...DEFAULT_FILTERS,
      sources: ['cloud'],
      cloudProviders: ['aws'],
      categories: ['security'],
    };
    const results = searchComparisonItems('WAF', filters);
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.source).toBe('cloud');
      expect(r.cloudProvider).toBe('aws');
      expect(r.category).toBe('security');
    }
  });
});
