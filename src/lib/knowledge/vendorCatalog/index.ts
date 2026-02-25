/**
 * Vendor Catalog — Unified query API.
 *
 * Provides a single entry point for querying vendor product catalogs.
 * All vendor catalogs are loaded lazily via dynamic import() and cached
 * after first load to minimize memory usage and bundle size.
 */

import type { InfraNodeType } from '@/types/infra';
import type { VendorCatalog, ProductNode, CatalogStats, SearchResult } from './types';
import {
  findNodeById,
  getNodePath,
  getLeafNodes,
  getAllNodes,
  searchNodes,
} from './queryHelpers';

// ---------------------------------------------------------------------------
// Re-export types
// ---------------------------------------------------------------------------

export type { VendorCatalog, ProductNode, CatalogStats, SearchResult } from './types';

// ---------------------------------------------------------------------------
// Async loader — lazy vendor data via dynamic import()
// ---------------------------------------------------------------------------

let _cachedVendorCatalogs: VendorCatalog[] | null = null;
let _vendorLoadingPromise: Promise<VendorCatalog[]> | null = null;

/**
 * Load all vendor catalogs asynchronously via dynamic import().
 *
 * Returns a cached result on subsequent calls. This is the primary
 * data source — all public API functions delegate to this.
 */
export async function getAllVendorCatalogsAsync(): Promise<VendorCatalog[]> {
  if (_cachedVendorCatalogs) return _cachedVendorCatalogs;
  if (_vendorLoadingPromise) return _vendorLoadingPromise;

  _vendorLoadingPromise = Promise.all([
    import('./vendors/cisco').then(m => m.ciscoCatalog),
    import('./vendors/paloalto').then(m => m.paloaltoCatalog),
    import('./vendors/arista').then(m => m.aristaCatalog),
    import('./vendors/fortinet').then(m => m.fortinetCatalog),
    import('./vendors/schneider').then(m => m.schneiderCatalog),
    import('./vendors/veeam').then(m => m.veeamCatalog),
    import('./vendors/dell').then(m => m.dellCatalog),
    import('./vendors/zscaler').then(m => m.zscalerCatalog),
    import('./vendors/f5').then(m => m.f5Catalog),
    import('./vendors/cloudflare').then(m => m.cloudflareCatalog),
    import('./vendors/crowdstrike').then(m => m.crowdstrikeCatalog),
    import('./vendors/infoblox').then(m => m.infobloxCatalog),
    import('./vendors/okta').then(m => m.oktaCatalog),
    import('./vendors/proofpoint').then(m => m.proofpointCatalog),
    import('./vendors/vmware').then(m => m.vmwareCatalog),
    import('./vendors/redhat').then(m => m.redhatCatalog),
    import('./vendors/oracle').then(m => m.oracleCatalog),
    import('./vendors/datadog').then(m => m.datadogCatalog),
    import('./vendors/netapp').then(m => m.netappCatalog),
    import('./vendors/kong').then(m => m.kongCatalog),
    import('./vendors/confluent').then(m => m.confluentCatalog),
    import('./vendors/hpe-aruba').then(m => m.hpeArubaCatalog),
  ]).then(catalogs => {
    _cachedVendorCatalogs = catalogs;
    _vendorLoadingPromise = null;
    return catalogs;
  });

  return _vendorLoadingPromise;
}

/**
 * Reset the async vendor catalog cache.
 * Intended for testing only.
 * @internal
 */
export function _resetVendorCatalogCache(): void {
  _cachedVendorCatalogs = null;
  _vendorLoadingPromise = null;
}

/**
 * Inject vendor catalogs directly into cache.
 * Intended for testing only — allows tests to set mock data.
 * @internal
 */
export function _setVendorCatalogCache(catalogs: VendorCatalog[]): void {
  _cachedVendorCatalogs = catalogs;
  _vendorLoadingPromise = null;
}

// ---------------------------------------------------------------------------
// Internal: load + O(1) vendor lookup by ID
// ---------------------------------------------------------------------------

/** Ensure catalogs are loaded, then return them. */
async function _ensureLoaded(): Promise<VendorCatalog[]> {
  return getAllVendorCatalogsAsync();
}

/** Build a Map from vendorId -> VendorCatalog for O(1) lookups. */
async function buildVendorMap(): Promise<Map<string, VendorCatalog>> {
  const catalogs = await _ensureLoaded();
  const map = new Map<string, VendorCatalog>();
  for (const vendor of catalogs) {
    map.set(vendor.vendorId, vendor);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Public API (all async)
// ---------------------------------------------------------------------------

/** Get all vendor catalogs. */
export async function getVendorList(): Promise<VendorCatalog[]> {
  return _ensureLoaded();
}

/** Get a single vendor by ID. */
export async function getVendor(vendorId: string): Promise<VendorCatalog | undefined> {
  const map = await buildVendorMap();
  return map.get(vendorId);
}

/**
 * Get a flat array of ProductNodes matching an InfraNodeType across all vendors.
 * Convenience wrapper around getProductsByNodeType that flattens vendor grouping.
 */
export async function getProductsForNodeType(nodeType: InfraNodeType): Promise<ProductNode[]> {
  const byVendor = await getProductsByNodeType(nodeType);
  return byVendor.flatMap(v => v.products);
}

/**
 * Find products mapped to a specific InfraNodeType across all vendors.
 * Returns only vendors that have at least one matching product.
 */
export async function getProductsByNodeType(
  nodeType: InfraNodeType,
): Promise<{ vendorId: string; vendorName: string; products: ProductNode[] }[]> {
  const catalogs = await _ensureLoaded();
  const results: { vendorId: string; vendorName: string; products: ProductNode[] }[] = [];

  for (const vendor of catalogs) {
    const allNodes = getAllNodes(vendor.products);
    const matching = allNodes.filter(
      (node) => node.infraNodeTypes?.includes(nodeType),
    );
    if (matching.length > 0) {
      results.push({
        vendorId: vendor.vendorId,
        vendorName: vendor.vendorName,
        products: matching,
      });
    }
  }

  return results;
}

/** Get children of a node within a vendor's product tree. */
export async function getChildren(vendorId: string, nodeId: string): Promise<ProductNode[]> {
  const map = await buildVendorMap();
  const vendor = map.get(vendorId);
  if (!vendor) return [];

  const node = findNodeById(vendor.products, nodeId);
  if (!node) return [];

  return node.children;
}

/**
 * Get all leaf products for a vendor.
 * Optionally scope to a specific category node.
 */
export async function getLeafProducts(
  vendorId: string,
  categoryNodeId?: string,
): Promise<ProductNode[]> {
  const map = await buildVendorMap();
  const vendor = map.get(vendorId);
  if (!vendor) return [];

  if (categoryNodeId) {
    const node = findNodeById(vendor.products, categoryNodeId);
    if (!node) return [];
    // If the node itself is a leaf, return it
    if (node.children.length === 0) return [node];
    return getLeafNodes(node.children);
  }

  return getLeafNodes(vendor.products);
}

/** Get path from root to a node within a vendor's product tree (breadcrumb). */
export async function getProductPath(
  vendorId: string,
  nodeId: string,
): Promise<ProductNode[]> {
  const map = await buildVendorMap();
  const vendor = map.get(vendorId);
  if (!vendor) return [];

  return getNodePath(vendor.products, nodeId);
}

/**
 * Determine which field matched the search query (case-insensitive).
 * Checks fields in priority order: name, nameKo, nodeId, description, descriptionKo, specs.
 */
function determineMatchField(
  node: ProductNode,
  query: string,
): SearchResult['matchField'] {
  const lower = query.toLowerCase();

  if (node.name.toLowerCase().includes(lower)) return 'name';
  if (node.nameKo.toLowerCase().includes(lower)) return 'nameKo';
  if (node.nodeId.toLowerCase().includes(lower)) return 'nodeId';
  if (node.description.toLowerCase().includes(lower)) return 'description';
  if (node.descriptionKo.toLowerCase().includes(lower)) return 'descriptionKo';

  // Check specs values
  if (node.specs) {
    for (const value of Object.values(node.specs)) {
      if (value.toLowerCase().includes(lower)) return 'specs';
    }
  }

  // Fallback (should not happen if searchNodes already matched)
  return 'name';
}

/**
 * Search across all vendors (or a specific vendor).
 * Supports filtering by vendorId, nodeType, and leafOnly.
 */
export async function searchProducts(
  query: string,
  options?: {
    vendorId?: string;
    nodeType?: InfraNodeType;
    leafOnly?: boolean;
  },
): Promise<SearchResult[]> {
  if (!query) return [];

  const catalogs = await _ensureLoaded();
  const vendors = options?.vendorId
    ? catalogs.filter((v) => v.vendorId === options.vendorId)
    : catalogs;

  const results: SearchResult[] = [];

  for (const vendor of vendors) {
    let matched = searchNodes(vendor.products, query);

    // Filter by nodeType
    if (options?.nodeType) {
      matched = matched.filter(
        (node) => node.infraNodeTypes?.includes(options.nodeType!),
      );
    }

    // Filter leafOnly
    if (options?.leafOnly) {
      matched = matched.filter((node) => node.children.length === 0);
    }

    for (const node of matched) {
      const pathNodes = getNodePath(vendor.products, node.nodeId);
      results.push({
        vendorId: vendor.vendorId,
        vendorName: vendor.vendorName,
        node,
        path: pathNodes.map((n) => n.name),
        matchField: determineMatchField(node, query),
      });
    }
  }

  return results;
}

/**
 * Aggregate stats across all vendor catalogs.
 * Uses getAllNodes to count total products per vendor.
 */
export async function getCatalogStats(): Promise<{
  vendors: number;
  totalProducts: number;
  byVendor: Record<string, number>;
}> {
  const catalogs = await _ensureLoaded();
  const byVendor: Record<string, number> = {};
  let totalProducts = 0;

  for (const vendor of catalogs) {
    const count = getAllNodes(vendor.products).length;
    byVendor[vendor.vendorId] = count;
    totalProducts += count;
  }

  return {
    vendors: catalogs.length,
    totalProducts,
    byVendor,
  };
}
