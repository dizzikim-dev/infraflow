'use client';

/**
 * Vendor Data Hooks — Async wrappers for lazy-loaded vendor catalog.
 *
 * Since vendor catalogs are now loaded asynchronously, client components
 * cannot use sync calls in useMemo. These hooks manage the async loading
 * with proper state and cleanup.
 */

import { useState, useEffect } from 'react';
import type { InfraNodeType } from '@/types/infra';
import type { VendorCatalog, ProductNode } from '@/lib/knowledge/vendorCatalog';
import {
  getVendorList,
  getProductsByNodeType,
  getCatalogStats,
} from '@/lib/knowledge/vendorCatalog';

// ---------------------------------------------------------------------------
// useVendorCatalogs — load all vendor catalogs
// ---------------------------------------------------------------------------

export function useVendorCatalogs(): {
  catalogs: VendorCatalog[];
  loading: boolean;
} {
  const [catalogs, setCatalogs] = useState<VendorCatalog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getVendorList().then((data) => {
      if (!cancelled) {
        setCatalogs(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  return { catalogs, loading };
}

// ---------------------------------------------------------------------------
// useProductsByNodeType — load products for a specific node type
// ---------------------------------------------------------------------------

export function useProductsByNodeType(
  nodeType: InfraNodeType,
): {
  vendorResults: { vendorId: string; vendorName: string; products: ProductNode[] }[];
  loading: boolean;
} {
  const [vendorResults, setVendorResults] = useState<
    { vendorId: string; vendorName: string; products: ProductNode[] }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProductsByNodeType(nodeType).then((data) => {
      if (!cancelled) {
        setVendorResults(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [nodeType]);

  return { vendorResults, loading };
}

// ---------------------------------------------------------------------------
// useCatalogStats — load catalog statistics
// ---------------------------------------------------------------------------

export function useCatalogStats(): {
  stats: { vendors: number; totalProducts: number; byVendor: Record<string, number> } | null;
  loading: boolean;
} {
  const [stats, setStats] = useState<{
    vendors: number;
    totalProducts: number;
    byVendor: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCatalogStats().then((data) => {
      if (!cancelled) {
        setStats(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  return { stats, loading };
}
