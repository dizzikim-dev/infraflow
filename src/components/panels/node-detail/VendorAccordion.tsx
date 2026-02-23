'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { ProductNode } from '@/lib/knowledge/vendorCatalog';
import { VENDOR_LOGOS } from '@/lib/design/vendorLogos';

/* ------------------------------------------------------------------ */
/* VendorAccordion — single vendor row with expandable product list    */
/* ------------------------------------------------------------------ */

export interface VendorAccordionProps {
  vendorId: string;
  vendorName: string;
  products: ProductNode[];
  isExpanded: boolean;
  selectedProductId: string | null;
  onToggle: (vendorId: string) => void;
  onProductClick: (product: ProductNode) => void;
  hasProductSelect: boolean;
}

export function VendorAccordion({
  vendorId, vendorName, products, isExpanded,
  selectedProductId, onToggle, onProductClick, hasProductSelect,
}: VendorAccordionProps) {
  const logoPath = VENDOR_LOGOS[vendorId];

  return (
    <div className="rounded-lg border border-zinc-700/40 overflow-hidden">
      <button
        onClick={() => onToggle(vendorId)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-zinc-800/40 hover:bg-zinc-800/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <motion.svg
            animate={{ rotate: isExpanded ? 0 : -90 }}
            transition={{ duration: 0.15 }}
            className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
          {logoPath && <img src={logoPath} alt={vendorName} className="w-5 h-5 object-contain flex-shrink-0" />}
          <span className="text-sm text-zinc-200 font-medium truncate">{vendorName}</span>
        </div>
        <span className="text-[10px] text-zinc-500 flex-shrink-0">{products.length}</span>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden"
          >
            <div className="p-2 space-y-1.5">
              {products.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.nodeId}
                  product={product}
                  isSelected={selectedProductId === product.nodeId}
                  hasProductSelect={hasProductSelect}
                  onClick={() => onProductClick(product)}
                />
              ))}
              {products.length > 8 && (
                <div className="text-center text-xs text-zinc-500 py-1">
                  + {products.length - 8}{'\uac1c \ub354...'}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ProductCard — individual product row inside accordion              */
/* ------------------------------------------------------------------ */

interface ProductCardProps {
  product: ProductNode;
  isSelected: boolean;
  hasProductSelect: boolean;
  onClick: () => void;
}

function ProductCard({ product, isSelected, hasProductSelect, onClick }: ProductCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-2.5 rounded-lg border transition-colors ${
        hasProductSelect ? 'cursor-pointer' : ''
      } ${
        isSelected
          ? 'bg-orange-500/10 border-orange-500/40 ring-1 ring-orange-500/30'
          : 'bg-zinc-800/30 border-zinc-700/30 hover:bg-zinc-800/50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-sm text-white font-medium truncate flex items-center gap-1.5">
            {isSelected && (
              <svg className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span className="truncate">{product.name}</span>
          </div>
          <div className="text-xs text-zinc-400 truncate">{product.nameKo}</div>
        </div>
        {product.lifecycle && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
            product.lifecycle === 'active'
              ? 'bg-green-500/20 text-green-400'
              : product.lifecycle === 'end-of-sale'
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {product.lifecycle}
          </span>
        )}
      </div>

      {product.architectureRoleKo && (
        <div className="mt-1 text-xs text-zinc-500">
          {'\uc5ed\ud560: '}{product.architectureRoleKo}
        </div>
      )}

      {product.recommendedForKo && product.recommendedForKo.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {product.recommendedForKo.slice(0, 3).map((useCase, idx) => (
            <span
              key={idx}
              className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20"
            >
              {useCase}
            </span>
          ))}
        </div>
      )}

      {product.sourceUrl && (
        <a
          href={product.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 text-[10px] text-zinc-500 hover:text-blue-400 transition-colors inline-flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {'\uc81c\ud488 \ud398\uc774\uc9c0 \u2192'}
        </a>
      )}
    </div>
  );
}
