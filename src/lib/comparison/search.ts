/**
 * Unified Comparison Panel — Search
 *
 * Aggregates all vendor products and cloud services into ComparisonItems,
 * then provides filtered search across the unified catalog.
 */

import { getVendorList } from '@/lib/knowledge/vendorCatalog';
import { getAllNodes } from '@/lib/knowledge/vendorCatalog/queryHelpers';
import { CLOUD_SERVICES } from '@/lib/knowledge/cloudCatalog';
import { vendorProductToComparisonItem, cloudServiceToComparisonItem } from './adapters';
import type { ComparisonItem, ComparisonFilters } from './types';

// ---------------------------------------------------------------------------
// Module-level cache
// ---------------------------------------------------------------------------

let cachedItems: ComparisonItem[] | null = null;

// ---------------------------------------------------------------------------
// getAllComparisonItems — flatten vendor + cloud into unified array
// ---------------------------------------------------------------------------

/**
 * Returns all comparable items across vendor products and cloud services.
 * Results are cached in a module-level variable for performance.
 *
 * - Only includes vendor ProductNodes that have `infraNodeTypes` with length > 0
 * - Only includes cloud services with `status === 'active'`
 */
export async function getAllComparisonItems(): Promise<ComparisonItem[]> {
  if (cachedItems) return cachedItems;

  const items: ComparisonItem[] = [];

  // Vendor products
  const catalogs = await getVendorList();
  for (const catalog of catalogs) {
    const allNodes = getAllNodes(catalog.products);
    for (const node of allNodes) {
      if (node.infraNodeTypes && node.infraNodeTypes.length > 0) {
        items.push(vendorProductToComparisonItem(node, catalog.vendorName));
      }
    }
  }

  // Cloud services
  for (const service of CLOUD_SERVICES) {
    if (service.status === 'active') {
      items.push(cloudServiceToComparisonItem(service));
    }
  }

  cachedItems = items;
  return items;
}

// ---------------------------------------------------------------------------
// resetComparisonItemsCache — for testing
// ---------------------------------------------------------------------------

/** Reset the cached items (for testing only). */
export function resetComparisonItemsCache(): void {
  cachedItems = null;
}

// ---------------------------------------------------------------------------
// searchComparisonItems — filtered search
// ---------------------------------------------------------------------------

const MAX_RESULTS = 20;

/**
 * Search comparison items by query string with optional filters.
 *
 * - Returns empty for empty/whitespace-only query
 * - Searches name + nameKo case-insensitive
 * - Applies all non-empty filter arrays (AND logic between filter types)
 * - Returns max 20 results
 */
export async function searchComparisonItems(
  query: string,
  filters: ComparisonFilters,
): Promise<ComparisonItem[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const lower = trimmed.toLowerCase();
  const all = await getAllComparisonItems();

  const filtered = all.filter((item) => {
    // Text match: name or nameKo
    const nameMatch =
      item.name.toLowerCase().includes(lower) ||
      item.nameKo.toLowerCase().includes(lower);
    if (!nameMatch) return false;

    // Source filter
    if (filters.sources.length > 0 && !filters.sources.includes(item.source)) {
      return false;
    }

    // Vendor filter
    if (filters.vendors.length > 0) {
      if (item.source === 'vendor') {
        const vendorKey = item.vendorName?.toLowerCase().replace(/\s+/g, '-') ?? '';
        if (!filters.vendors.some((v) => vendorKey.includes(v))) {
          return false;
        }
      }
      // Cloud items pass through vendor filter (they don't have vendorName)
    }

    // Cloud provider filter
    if (filters.cloudProviders.length > 0) {
      if (item.source === 'cloud') {
        if (!item.cloudProvider || !filters.cloudProviders.includes(item.cloudProvider)) {
          return false;
        }
      }
      // Vendor items pass through cloudProvider filter
    }

    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(item.category)) {
      return false;
    }

    // NodeType filter
    if (filters.nodeTypes.length > 0) {
      const hasMatchingType = item.nodeTypes.some((nt) => filters.nodeTypes.includes(nt));
      if (!hasMatchingType) return false;
    }

    return true;
  });

  return filtered.slice(0, MAX_RESULTS);
}
