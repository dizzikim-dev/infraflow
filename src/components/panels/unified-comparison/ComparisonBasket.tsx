'use client';

/**
 * ComparisonBasket — Horizontal row of selected comparison items.
 *
 * Displays selected items as colored chips with remove capability
 * and a "Clear All" button.
 */

import { X, Trash2 } from 'lucide-react';
import type { ComparisonItem } from '@/lib/comparison/types';
import { MAX_COMPARISON_ITEMS } from '@/lib/comparison/types';

// ============================================================
// Types
// ============================================================

interface ComparisonBasketProps {
  items: ComparisonItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
}

// ============================================================
// Component
// ============================================================

export function ComparisonBasket({
  items,
  onRemoveItem,
  onClearAll,
}: ComparisonBasketProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Item chips */}
      {items.map((item) => {
        const isVendor = item.source === 'vendor';
        return (
          <div
            key={item.id}
            className="flex items-center gap-1.5 bg-zinc-800/50 border border-white/10 rounded-full px-2.5 py-1 text-xs"
          >
            {/* Colored dot */}
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isVendor ? 'bg-cyan-400' : 'bg-purple-400'
              }`}
            />

            {/* Name (truncated) */}
            <span className="text-white max-w-[100px] truncate">
              {item.name}
            </span>

            {/* Vendor / provider label */}
            <span className="text-zinc-500 text-[10px] shrink-0">
              {item.vendorName ?? item.cloudProvider?.toUpperCase() ?? ''}
            </span>

            {/* Remove button */}
            <button
              onClick={() => onRemoveItem(item.id)}
              className="text-zinc-500 hover:text-red-400 transition-colors shrink-0"
              aria-label={`Remove ${item.name}`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}

      {/* Clear All button (only show when 2+ items) */}
      {items.length >= 2 && (
        <button
          onClick={onClearAll}
          className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-red-400 transition-colors px-2 py-1 rounded-full border border-white/5 hover:border-red-500/20"
        >
          <Trash2 className="w-3 h-3" />
          <span>초기화</span>
        </button>
      )}

      {/* Item count */}
      <span className="text-[11px] text-zinc-500 ml-auto shrink-0">
        {items.length}/{MAX_COMPARISON_ITEMS} 선택됨
      </span>
    </div>
  );
}
