import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useComparison } from '../useComparison';
import type { ComparisonItem } from '@/lib/comparison/types';

// ---------------------------------------------------------------------------
// Mock ComparisonItems
// ---------------------------------------------------------------------------

function makeMockItem(id: string, source: 'vendor' | 'cloud' = 'vendor'): ComparisonItem {
  return {
    id,
    source,
    name: `Item ${id}`,
    nameKo: `아이템 ${id}`,
    category: 'security',
    nodeTypes: ['firewall'],
  };
}

const item1 = makeMockItem('item-1');
const item2 = makeMockItem('item-2');
const item3 = makeMockItem('item-3', 'cloud');
const item4 = makeMockItem('item-4');
const item5 = makeMockItem('item-5');

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useComparison', () => {
  // ── Initial state ──

  it('starts with empty items and default filters', () => {
    const { result } = renderHook(() => useComparison());

    expect(result.current.items).toEqual([]);
    expect(result.current.searchQuery).toBe('');
    expect(result.current.canCompare).toBe(false);
    expect(result.current.filters.sources).toEqual([]);
    expect(result.current.filters.vendors).toEqual([]);
    expect(result.current.filters.cloudProviders).toEqual([]);
    expect(result.current.filters.categories).toEqual([]);
    expect(result.current.filters.nodeTypes).toEqual([]);
  });

  // ── addItem ──

  it('adds an item to the basket', () => {
    const { result } = renderHook(() => useComparison());

    act(() => {
      result.current.addItem(item1);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('item-1');
  });

  it('prevents duplicate items', () => {
    const { result } = renderHook(() => useComparison());

    act(() => {
      result.current.addItem(item1);
      result.current.addItem(item1);
    });

    expect(result.current.items).toHaveLength(1);
  });

  it('enforces MAX_COMPARISON_ITEMS (4)', () => {
    const { result } = renderHook(() => useComparison());

    act(() => {
      result.current.addItem(item1);
      result.current.addItem(item2);
      result.current.addItem(item3);
      result.current.addItem(item4);
      result.current.addItem(item5); // 5th item, should be ignored
    });

    expect(result.current.items).toHaveLength(4);
    expect(result.current.items.map((i) => i.id)).toEqual([
      'item-1',
      'item-2',
      'item-3',
      'item-4',
    ]);
  });

  // ── removeItem ──

  it('removes an item by id', () => {
    const { result } = renderHook(() => useComparison());

    act(() => {
      result.current.addItem(item1);
      result.current.addItem(item2);
    });

    act(() => {
      result.current.removeItem('item-1');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('item-2');
  });

  it('no-ops when removing non-existent item', () => {
    const { result } = renderHook(() => useComparison());

    act(() => {
      result.current.addItem(item1);
    });

    act(() => {
      result.current.removeItem('non-existent');
    });

    expect(result.current.items).toHaveLength(1);
  });

  // ── clearAll ──

  it('clears all items', () => {
    const { result } = renderHook(() => useComparison());

    act(() => {
      result.current.addItem(item1);
      result.current.addItem(item2);
      result.current.addItem(item3);
    });

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.canCompare).toBe(false);
  });

  // ── canCompare ──

  it('canCompare is false with 0 items', () => {
    const { result } = renderHook(() => useComparison());
    expect(result.current.canCompare).toBe(false);
  });

  it('canCompare is false with 1 item', () => {
    const { result } = renderHook(() => useComparison());

    act(() => {
      result.current.addItem(item1);
    });

    expect(result.current.canCompare).toBe(false);
  });

  it('canCompare is true with 2+ items', () => {
    const { result } = renderHook(() => useComparison());

    act(() => {
      result.current.addItem(item1);
      result.current.addItem(item2);
    });

    expect(result.current.canCompare).toBe(true);
  });

  // ── setSearchQuery ──

  it('updates search query', () => {
    const { result } = renderHook(() => useComparison());

    act(() => {
      result.current.setSearchQuery('firewall');
    });

    expect(result.current.searchQuery).toBe('firewall');
  });

  // ── searchResults via searchQuery ──

  it('returns search results for a valid query', () => {
    const { result } = renderHook(() => useComparison());

    act(() => {
      result.current.setSearchQuery('firepower');
    });

    // searchResults should be computed from real catalog data
    expect(result.current.searchResults.length).toBeGreaterThan(0);
  });

  it('returns empty search results for empty query', () => {
    const { result } = renderHook(() => useComparison());

    act(() => {
      result.current.setSearchQuery('');
    });

    expect(result.current.searchResults).toEqual([]);
  });

  // ── setFilters ──

  it('updates filters', () => {
    const { result } = renderHook(() => useComparison());

    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        sources: ['cloud'],
      });
    });

    expect(result.current.filters.sources).toEqual(['cloud']);
  });

  it('filters affect search results', () => {
    const { result } = renderHook(() => useComparison());

    // Search for 'WAF' with cloud-only filter
    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        sources: ['cloud'],
      });
      result.current.setSearchQuery('WAF');
    });

    expect(result.current.searchResults.length).toBeGreaterThan(0);
    for (const r of result.current.searchResults) {
      expect(r.source).toBe('cloud');
    }
  });
});
