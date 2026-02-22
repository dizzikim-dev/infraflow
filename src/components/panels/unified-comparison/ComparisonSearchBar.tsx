'use client';

/**
 * ComparisonSearchBar — Search input with filter chips and results dropdown.
 *
 * Allows users to search across vendor products and cloud services,
 * filter by source/vendor/cloud provider, and add items to the comparison basket.
 */

import { useState, useRef, useCallback } from 'react';
import { Search, Check, Plus } from 'lucide-react';
import type { ComparisonItem, ComparisonFilters } from '@/lib/comparison/types';

// ============================================================
// Types
// ============================================================

interface ComparisonSearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  filters: ComparisonFilters;
  onFiltersChange: (f: Partial<ComparisonFilters>) => void;
  results: ComparisonItem[];
  onAddItem: (item: ComparisonItem) => void;
  selectedIds: Set<string>;
}

// ============================================================
// Constants
// ============================================================

const SOURCE_CHIPS: { value: 'vendor' | 'cloud'; label: string }[] = [
  { value: 'vendor', label: '벤더' },
  { value: 'cloud', label: '클라우드' },
];

const VENDOR_CHIPS = ['Cisco', 'Fortinet', 'Palo Alto', 'Arista'] as const;

const CLOUD_CHIPS: { value: 'aws' | 'azure' | 'gcp'; label: string }[] = [
  { value: 'aws', label: 'AWS' },
  { value: 'azure', label: 'Azure' },
  { value: 'gcp', label: 'GCP' },
];

// ============================================================
// Helpers
// ============================================================

function toggleArrayValue<T>(arr: T[], value: T): T[] {
  return arr.includes(value)
    ? arr.filter((v) => v !== value)
    : [...arr, value];
}

// ============================================================
// Component
// ============================================================

export function ComparisonSearchBar({
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  results,
  onAddItem,
  selectedIds,
}: ComparisonSearchBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFocus = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setDropdownOpen(true);
  }, []);

  const handleBlur = useCallback(() => {
    // Small delay so click events on dropdown items can register
    blurTimeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 200);
  }, []);

  const showVendorChips =
    filters.sources.length === 0 || filters.sources.includes('vendor');
  const showCloudChips =
    filters.sources.length === 0 || filters.sources.includes('cloud');

  return (
    <div className="space-y-2">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="제품 또는 클라우드 서비스 검색..."
          className="w-full pl-9 pr-3 py-2 bg-zinc-800/50 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500/50"
        />

        {/* Results Dropdown */}
        {dropdownOpen && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-white/10 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
            {results.map((item) => {
              const isSelected = selectedIds.has(item.id);
              const isVendor = item.source === 'vendor';

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-3 py-2 hover:bg-zinc-700/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* Source badge */}
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                        isVendor
                          ? 'bg-cyan-500/10 text-cyan-400'
                          : 'bg-purple-500/10 text-purple-400'
                      }`}
                    >
                      {isVendor ? 'Vendor' : 'Cloud'}
                    </span>

                    {/* Name + category */}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-white truncate">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate">
                        {item.category}
                        {item.vendorName && ` - ${item.vendorName}`}
                        {item.cloudProvider && ` - ${item.cloudProvider.toUpperCase()}`}
                      </div>
                    </div>
                  </div>

                  {/* Add / selected button */}
                  {isSelected ? (
                    <span className="flex items-center gap-1 text-[10px] text-teal-400 shrink-0 ml-2">
                      <Check className="w-3.5 h-3.5" />
                      <span>선택됨</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => onAddItem(item)}
                      className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20 transition-colors shrink-0 ml-2"
                    >
                      <Plus className="w-3 h-3" />
                      <span>비교에 추가</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-1.5">
        {/* Source chips */}
        {SOURCE_CHIPS.map((chip) => {
          const isActive = filters.sources.includes(chip.value);
          return (
            <button
              key={chip.value}
              onClick={() =>
                onFiltersChange({
                  sources: toggleArrayValue(filters.sources, chip.value),
                })
              }
              className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors border ${
                isActive
                  ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
                  : 'bg-zinc-800/50 border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              {chip.label}
            </button>
          );
        })}

        {/* Vendor chips */}
        {showVendorChips &&
          VENDOR_CHIPS.map((vendor) => {
            const isActive = filters.vendors.includes(vendor);
            return (
              <button
                key={vendor}
                onClick={() =>
                  onFiltersChange({
                    vendors: toggleArrayValue(filters.vendors, vendor),
                  })
                }
                className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors border ${
                  isActive
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                    : 'bg-zinc-800/50 border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                {vendor}
              </button>
            );
          })}

        {/* Cloud chips */}
        {showCloudChips &&
          CLOUD_CHIPS.map((chip) => {
            const isActive = filters.cloudProviders.includes(chip.value);
            return (
              <button
                key={chip.value}
                onClick={() =>
                  onFiltersChange({
                    cloudProviders: toggleArrayValue(
                      filters.cloudProviders,
                      chip.value,
                    ),
                  })
                }
                className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors border ${
                  isActive
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                    : 'bg-zinc-800/50 border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
      </div>
    </div>
  );
}
