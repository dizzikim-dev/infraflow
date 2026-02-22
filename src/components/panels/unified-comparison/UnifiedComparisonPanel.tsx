'use client';

/**
 * UnifiedComparisonPanel — Main panel wiring all sub-components together.
 *
 * Integrates ComparisonSearchBar, ComparisonBasket, ComparisonCards,
 * and ComparisonTable into a single side panel with tab switching.
 */

import { useState, useMemo, useCallback } from 'react';
import { GitCompareArrows } from 'lucide-react';
import { PanelContainer } from '../PanelContainer';
import { PanelHeader } from '../PanelHeader';
import { PanelTabs } from '../PanelTabs';
import { ComparisonSearchBar } from './ComparisonSearchBar';
import { ComparisonBasket } from './ComparisonBasket';
import { ComparisonCards } from './ComparisonCards';
import { ComparisonTable } from './ComparisonTable';
import { useComparison } from '@/hooks/useComparison';
import type { ComparisonFilters } from '@/lib/comparison/types';

export function UnifiedComparisonPanel({ onClose }: { onClose: () => void }) {
  const {
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
  } = useComparison();

  const [activeTab, setActiveTab] = useState<'cards' | 'table'>('cards');
  const selectedIds = useMemo(() => new Set(items.map(i => i.id)), [items]);

  // Bridge Partial<ComparisonFilters> from SearchBar to full setFilters
  const handleFiltersChange = useCallback(
    (partial: Partial<ComparisonFilters>) => {
      setFilters({ ...filters, ...partial });
    },
    [filters, setFilters],
  );

  return (
    <PanelContainer widthClass="w-[600px]">
      <PanelHeader
        icon={GitCompareArrows}
        iconColor="text-teal-400"
        title="통합 비교 / Unified Comparison"
        onClose={onClose}
      />

      {/* Search bar — always visible */}
      <div className="px-4 pt-4 pb-2">
        <ComparisonSearchBar
          query={searchQuery}
          onQueryChange={setSearchQuery}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          results={searchResults}
          onAddItem={addItem}
          selectedIds={selectedIds}
        />
      </div>

      {/* Basket — show when items selected */}
      {items.length > 0 && (
        <div className="px-4 pb-2">
          <ComparisonBasket items={items} onRemoveItem={removeItem} onClearAll={clearAll} />
        </div>
      )}

      {/* Tabs — show when can compare (>= 2 items) */}
      {canCompare && (
        <>
          <PanelTabs
            tabs={[
              { key: 'cards' as const, label: '카드 비교 / Cards' },
              { key: 'table' as const, label: '테이블 비교 / Table' },
            ]}
            active={activeTab}
            onChange={setActiveTab}
            activeClassName="text-teal-400 border-b-2 border-teal-400 bg-teal-500/10"
            activeBadgeClassName="bg-teal-500/20 text-teal-300"
          />
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'cards' && <ComparisonCards items={items} />}
            {activeTab === 'table' && <ComparisonTable items={items} />}
          </div>
        </>
      )}

      {/* Empty state when no items or not enough */}
      {!canCompare && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-zinc-500">
            <GitCompareArrows className="w-12 h-12 mx-auto mb-3 opacity-30" />
            {items.length === 0 ? (
              <>
                <p className="text-sm">검색으로 제품이나 클라우드 서비스를 찾아 비교에 추가하세요.</p>
                <p className="text-xs mt-1 text-zinc-600">Search and add products or cloud services to compare.</p>
              </>
            ) : (
              <>
                <p className="text-sm">비교하려면 최소 2개 항목이 필요합니다.</p>
                <p className="text-xs mt-1 text-zinc-600">Add at least 2 items to start comparing.</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-white/10 px-4 py-3 text-xs text-zinc-400 flex items-center justify-between">
        <span>{items.length}개 선택됨 / {items.length} items selected</span>
        {items.length > 0 && (
          <button onClick={clearAll} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            초기화
          </button>
        )}
      </div>
    </PanelContainer>
  );
}
