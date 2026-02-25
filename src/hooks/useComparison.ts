'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ComparisonItem, ComparisonFilters } from '@/lib/comparison/types';
import { MAX_COMPARISON_ITEMS, DEFAULT_FILTERS } from '@/lib/comparison/types';
import { searchComparisonItems } from '@/lib/comparison/search';

// ---------------------------------------------------------------------------
// useComparison — manages comparison basket, search, and filters
// ---------------------------------------------------------------------------

export interface UseComparisonReturn {
  /** Items currently in the comparison basket (max 4) */
  items: ComparisonItem[];
  /** Current search query string */
  searchQuery: string;
  /** Search results computed from query + filters */
  searchResults: ComparisonItem[];
  /** Current filter state */
  filters: ComparisonFilters;
  /** Whether comparison is possible (>= 2 items) */
  canCompare: boolean;
  /** Add an item to the basket (no-op if full or duplicate) */
  addItem: (item: ComparisonItem) => void;
  /** Remove an item by id */
  removeItem: (id: string) => void;
  /** Clear all items from the basket */
  clearAll: () => void;
  /** Update the search query */
  setSearchQuery: (query: string) => void;
  /** Update filters */
  setFilters: (filters: ComparisonFilters) => void;
}

export function useComparison(): UseComparisonReturn {
  const [items, setItems] = useState<ComparisonItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ComparisonFilters>(DEFAULT_FILTERS);

  const canCompare = items.length >= 2;

  const [searchResults, setSearchResults] = useState<ComparisonItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    searchComparisonItems(searchQuery, filters).then((results) => {
      if (!cancelled) setSearchResults(results);
    });
    return () => { cancelled = true; };
  }, [searchQuery, filters]);

  const addItem = useCallback((item: ComparisonItem) => {
    setItems((prev) => {
      if (prev.length >= MAX_COMPARISON_ITEMS) return prev;
      if (prev.some((existing) => existing.id === item.id)) return prev;
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  return {
    items,
    searchQuery,
    searchResults,
    filters,
    canCompare,
    addItem,
    removeItem,
    clearAll,
    setSearchQuery,
    setFilters,
  };
}
