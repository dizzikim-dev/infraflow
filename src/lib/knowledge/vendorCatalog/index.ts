/**
 * Vendor Catalog — Unified query API.
 *
 * Provides a single entry point for querying vendor product catalogs.
 * All vendor catalogs are merged into `allVendorCatalogs` and can be
 * queried by vendor, node type, keyword, etc.
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
// Vendor catalog registry
// ---------------------------------------------------------------------------

// Vendor data files
import { ciscoCatalog } from './vendors/cisco';
import { paloaltoCatalog } from './vendors/paloalto';
import { aristaCatalog } from './vendors/arista';
import { fortinetCatalog } from './vendors/fortinet';
import { schneiderCatalog } from './vendors/schneider';
import { veeamCatalog } from './vendors/veeam';
import { dellCatalog } from './vendors/dell';
import { zscalerCatalog } from './vendors/zscaler';
import { f5Catalog } from './vendors/f5';
import { cloudflareCatalog } from './vendors/cloudflare';
import { crowdstrikeCatalog } from './vendors/crowdstrike';
import { infobloxCatalog } from './vendors/infoblox';
import { oktaCatalog } from './vendors/okta';
import { proofpointCatalog } from './vendors/proofpoint';
import { vmwareCatalog } from './vendors/vmware';
import { redhatCatalog } from './vendors/redhat';
import { oracleCatalog } from './vendors/oracle';
import { datadogCatalog } from './vendors/datadog';
import { netappCatalog } from './vendors/netapp';
import { kongCatalog } from './vendors/kong';
import { confluentCatalog } from './vendors/confluent';
import { hpeArubaCatalog } from './vendors/hpe-aruba';

/** Merged array of all vendor catalogs (eagerly loaded). */
export const allVendorCatalogs: VendorCatalog[] = [
  ciscoCatalog,
  paloaltoCatalog,
  aristaCatalog,
  fortinetCatalog,
  schneiderCatalog,
  veeamCatalog,
  dellCatalog,
  zscalerCatalog,
  f5Catalog,
  cloudflareCatalog,
  crowdstrikeCatalog,
  infobloxCatalog,
  oktaCatalog,
  proofpointCatalog,
  vmwareCatalog,
  redhatCatalog,
  oracleCatalog,
  datadogCatalog,
  netappCatalog,
  confluentCatalog,
  kongCatalog,
  hpeArubaCatalog,
];

// ---------------------------------------------------------------------------
// Async loader — lazy alternative for future migration
// ---------------------------------------------------------------------------

let _cachedVendorCatalogs: VendorCatalog[] | null = null;
let _vendorLoadingPromise: Promise<VendorCatalog[]> | null = null;

/**
 * Load all vendor catalogs asynchronously via dynamic import().
 *
 * Returns a cached result on subsequent calls. This is the lazy-loading
 * alternative to the synchronous `allVendorCatalogs` export. Callers that
 * can await should prefer this function to reduce initial bundle size
 * once the migration from sync to async is complete.
 *
 * @deprecated Prefer this over `allVendorCatalogs` for new code paths.
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

// ---------------------------------------------------------------------------
// Internal: O(1) vendor lookup by ID
// ---------------------------------------------------------------------------

/**
 * Build a Map from vendorId -> VendorCatalog for O(1) lookups.
 * Rebuilt on every call to account for runtime mutations to allVendorCatalogs.
 */
function buildVendorMap(): Map<string, VendorCatalog> {
  const map = new Map<string, VendorCatalog>();
  for (const vendor of allVendorCatalogs) {
    map.set(vendor.vendorId, vendor);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Get all vendor catalogs. */
export function getVendorList(): VendorCatalog[] {
  return allVendorCatalogs;
}

/** Get a single vendor by ID. */
export function getVendor(vendorId: string): VendorCatalog | undefined {
  return buildVendorMap().get(vendorId);
}

/**
 * Get a flat array of ProductNodes matching an InfraNodeType across all vendors.
 * Convenience wrapper around getProductsByNodeType that flattens vendor grouping.
 */
export function getProductsForNodeType(nodeType: InfraNodeType): ProductNode[] {
  return getProductsByNodeType(nodeType).flatMap(v => v.products);
}

/**
 * Find products mapped to a specific InfraNodeType across all vendors.
 * Returns only vendors that have at least one matching product.
 */
export function getProductsByNodeType(
  nodeType: InfraNodeType,
): { vendorId: string; vendorName: string; products: ProductNode[] }[] {
  const results: { vendorId: string; vendorName: string; products: ProductNode[] }[] = [];

  for (const vendor of allVendorCatalogs) {
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
export function getChildren(vendorId: string, nodeId: string): ProductNode[] {
  const vendor = buildVendorMap().get(vendorId);
  if (!vendor) return [];

  const node = findNodeById(vendor.products, nodeId);
  if (!node) return [];

  return node.children;
}

/**
 * Get all leaf products for a vendor.
 * Optionally scope to a specific category node.
 */
export function getLeafProducts(
  vendorId: string,
  categoryNodeId?: string,
): ProductNode[] {
  const vendor = buildVendorMap().get(vendorId);
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
export function getProductPath(
  vendorId: string,
  nodeId: string,
): ProductNode[] {
  const vendor = buildVendorMap().get(vendorId);
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
export function searchProducts(
  query: string,
  options?: {
    vendorId?: string;
    nodeType?: InfraNodeType;
    leafOnly?: boolean;
  },
): SearchResult[] {
  if (!query) return [];

  const vendors = options?.vendorId
    ? allVendorCatalogs.filter((v) => v.vendorId === options.vendorId)
    : allVendorCatalogs;

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
export function getCatalogStats(): {
  vendors: number;
  totalProducts: number;
  byVendor: Record<string, number>;
} {
  const byVendor: Record<string, number> = {};
  let totalProducts = 0;

  for (const vendor of allVendorCatalogs) {
    const count = getAllNodes(vendor.products).length;
    byVendor[vendor.vendorId] = count;
    totalProducts += count;
  }

  return {
    vendors: allVendorCatalogs.length,
    totalProducts,
    byVendor,
  };
}
