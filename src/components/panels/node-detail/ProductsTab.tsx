'use client';

import { useState } from 'react';
import type { InfraNodeType } from '@/types';
import { useProductsByNodeType } from '@/hooks/useVendorData';
import { VendorAccordion } from './VendorAccordion';

interface ProductsTabProps {
  nodeType: InfraNodeType;
  onProductSelect?: (vendorId: string | undefined, cloudProvider: string | undefined, productName: string) => void;
}

export function ProductsTab({ nodeType, onProductSelect }: ProductsTabProps) {
  const [productSearch, setProductSearch] = useState('');
  const [expandedVendors, setExpandedVendors] = useState<Set<string>>(new Set());
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const { vendorResults, loading } = useProductsByNodeType(nodeType);

  const toggleVendor = (vendorId: string) => {
    setExpandedVendors((prev) => {
      const next = new Set(prev);
      if (next.has(vendorId)) next.delete(vendorId);
      else next.add(vendorId);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-zinc-500 animate-pulse">
        벤더 제품 로딩 중...
      </div>
    );
  }

  if (vendorResults.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500">
        {'\uc774 \ucef4\ud3ec\ub10c\ud2b8 \uc720\ud615\uc5d0 \ub9e4\uce6d\ub418\ub294 \ubca4\ub354 \uc81c\ud488\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.'}
      </div>
    );
  }

  const query = productSearch.toLowerCase().trim();

  const filteredResults = vendorResults
    .map(({ vendorId, vendorName, products }) => {
      if (!query) return { vendorId, vendorName, products };
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.nameKo.toLowerCase().includes(query) ||
          vendorName.toLowerCase().includes(query),
      );
      return { vendorId, vendorName, products: filtered };
    })
    .filter((v) => v.products.length > 0);

  const totalCount = filteredResults.reduce((sum, v) => sum + v.products.length, 0);

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
          placeholder={'\uc81c\ud488\uba85 \uac80\uc0c9...'}
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-sm text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-colors"
        />
        {productSearch && (
          <button
            onClick={() => setProductSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Result count */}
      {query && (
        <div className="text-xs text-zinc-500">
          {filteredResults.length}{'\uac1c \ubca4\ub354, '}{totalCount}{'\uac1c \uc81c\ud488'}
        </div>
      )}

      {/* No results */}
      {filteredResults.length === 0 && query && (
        <div className="text-center py-6 text-zinc-500 text-sm">
          &quot;{productSearch}&quot;{'\uc5d0 \ub300\ud55c \uac80\uc0c9 \uacb0\uacfc\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.'}
        </div>
      )}

      {/* Vendor accordion */}
      {filteredResults.map(({ vendorId, vendorName, products }) => (
        <VendorAccordion
          key={vendorId}
          vendorId={vendorId}
          vendorName={vendorName}
          products={products}
          isExpanded={expandedVendors.has(vendorId)}
          selectedProductId={selectedProductId}
          onToggle={toggleVendor}
          onProductClick={(product) => {
            if (!onProductSelect) return;
            const isDeselect = selectedProductId === product.nodeId;
            if (isDeselect) {
              setSelectedProductId(null);
              onProductSelect(undefined, undefined, '');
            } else {
              setSelectedProductId(product.nodeId);
              onProductSelect(vendorId, undefined, product.name);
            }
          }}
          hasProductSelect={!!onProductSelect}
        />
      ))}
    </div>
  );
}
