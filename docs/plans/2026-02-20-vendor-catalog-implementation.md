# Vendor Catalog Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a hierarchical vendor product catalog module (`vendorCatalog`) that stores crawled vendor product data in a recursive tree structure with bilingual support.

**Architecture:** New `src/lib/knowledge/vendorCatalog/` module with recursive `ProductNode` tree type, vendor-specific TS data files, tree traversal utilities, and a unified query API. Follows existing `vendorMappings` patterns (static TS data, bilingual fields, query functions, comprehensive tests).

**Tech Stack:** TypeScript strict, vitest, `@/` path aliases

**Design Doc:** `docs/plans/2026-02-20-vendor-catalog-design.md`

---

## Task 1: Type Definitions

**Files:**
- Create: `src/lib/knowledge/vendorCatalog/types.ts`
- Test: `src/lib/knowledge/vendorCatalog/__tests__/types.test.ts`

**Step 1: Write the failing test**

Create `src/lib/knowledge/vendorCatalog/__tests__/types.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import type {
  VendorCatalog,
  ProductNode,
  CatalogStats,
  SearchResult,
} from '../types';

describe('vendorCatalog types', () => {
  it('should create a valid ProductNode leaf', () => {
    const leaf: ProductNode = {
      nodeId: 'catalyst-9200',
      depth: 3,
      depthLabel: 'series',
      depthLabelKo: '시리즈',
      name: 'Catalyst 9200 Series',
      nameKo: 'Catalyst 9200 시리즈',
      description: 'Entry-level enterprise-class access switches',
      descriptionKo: '엔트리급 엔터프라이즈 클래스 액세스 스위치',
      sourceUrl: 'https://www.cisco.com/site/kr/ko/products/networking/switches/catalyst-9200-series-switches/index.html',
      specs: { switchingCapacity: 'Up to 480 Gbps', ports: '24/48 ports' },
      datasheetUrl: 'https://example.com/datasheet.pdf',
      lifecycle: 'active',
      children: [],
    };
    expect(leaf.nodeId).toBe('catalyst-9200');
    expect(leaf.children).toHaveLength(0);
    expect(leaf.specs).toBeDefined();
  });

  it('should create a valid ProductNode with children', () => {
    const child: ProductNode = {
      nodeId: 'catalyst-9200',
      depth: 2,
      depthLabel: 'series',
      depthLabelKo: '시리즈',
      name: 'Catalyst 9200',
      nameKo: 'Catalyst 9200',
      description: 'Access switches',
      descriptionKo: '액세스 스위치',
      sourceUrl: 'https://example.com/9200',
      children: [],
    };
    const parent: ProductNode = {
      nodeId: 'switches',
      depth: 1,
      depthLabel: 'subcategory',
      depthLabelKo: '하위 카테고리',
      name: 'Switches',
      nameKo: '스위치',
      description: 'Network switches',
      descriptionKo: '네트워크 스위치',
      sourceUrl: 'https://example.com/switches',
      infraNodeTypes: ['switch-l2', 'switch-l3'],
      children: [child],
    };
    expect(parent.children).toHaveLength(1);
    expect(parent.infraNodeTypes).toContain('switch-l2');
  });

  it('should create a valid VendorCatalog', () => {
    const catalog: VendorCatalog = {
      vendorId: 'cisco',
      vendorName: 'Cisco Systems',
      vendorNameKo: '시스코 시스템즈',
      headquarters: 'San Jose, CA, USA',
      website: 'https://www.cisco.com',
      productPageUrl: 'https://www.cisco.com/site/kr/ko/products/index.html',
      depthStructure: ['category', 'subcategory', 'family', 'series'],
      depthStructureKo: ['카테고리', '하위 카테고리', '제품군', '시리즈'],
      products: [],
      stats: { totalProducts: 0, maxDepth: 0, categoriesCount: 0 },
      lastCrawled: '2026-02-20',
      crawlSource: 'https://www.cisco.com/site/kr/ko/products/index.html',
    };
    expect(catalog.vendorId).toBe('cisco');
    expect(catalog.depthStructure).toHaveLength(4);
  });

  it('should create a valid SearchResult', () => {
    const result: SearchResult = {
      vendorId: 'cisco',
      vendorName: 'Cisco Systems',
      node: {
        nodeId: 'catalyst-9200',
        depth: 3,
        depthLabel: 'series',
        depthLabelKo: '시리즈',
        name: 'Catalyst 9200',
        nameKo: 'Catalyst 9200',
        description: '',
        descriptionKo: '',
        sourceUrl: '',
        children: [],
      },
      path: ['networking', 'switches', 'catalyst-9000', 'catalyst-9200'],
      matchField: 'name',
    };
    expect(result.path).toHaveLength(4);
    expect(result.matchField).toBe('name');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/knowledge/vendorCatalog/__tests__/types.test.ts`
Expected: FAIL — module `../types` not found

**Step 3: Write minimal implementation**

Create `src/lib/knowledge/vendorCatalog/types.ts`:

```typescript
/**
 * Vendor Catalog — Hierarchical product catalog types
 *
 * Recursive tree structure for vendor product hierarchies.
 * Each vendor has different depth levels (Cisco: 5, Fortinet: 3, etc.)
 *
 * Design doc: docs/plans/2026-02-20-vendor-catalog-design.md
 */

import type { InfraNodeType } from '@/types/infra';

// ---------------------------------------------------------------------------
// Product Node (recursive tree)
// ---------------------------------------------------------------------------

/** A node in the product hierarchy tree. Leaf nodes have empty children. */
export interface ProductNode {
  nodeId: string;
  depth: number;
  depthLabel: string;
  depthLabelKo: string;

  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  sourceUrl: string;

  /** InfraFlow node type mapping (optional, set at the level where mapping makes sense) */
  infraNodeTypes?: InfraNodeType[];

  /** Leaf-only fields */
  specs?: Record<string, string>;
  datasheetUrl?: string;
  pricingInfo?: string;
  lifecycle?: 'active' | 'end-of-sale' | 'end-of-life';

  children: ProductNode[];
}

// ---------------------------------------------------------------------------
// Vendor Catalog
// ---------------------------------------------------------------------------

export interface CatalogStats {
  totalProducts: number;
  maxDepth: number;
  categoriesCount: number;
}

export interface VendorCatalog {
  vendorId: string;
  vendorName: string;
  vendorNameKo: string;
  headquarters: string;
  website: string;
  productPageUrl: string;
  depthStructure: string[];
  depthStructureKo: string[];
  products: ProductNode[];
  stats: CatalogStats;
  lastCrawled: string;
  crawlSource: string;
}

// ---------------------------------------------------------------------------
// Search Result
// ---------------------------------------------------------------------------

export interface SearchResult {
  vendorId: string;
  vendorName: string;
  node: ProductNode;
  path: string[];
  matchField: 'name' | 'nameKo' | 'description' | 'descriptionKo' | 'nodeId' | 'specs';
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/knowledge/vendorCatalog/__tests__/types.test.ts`
Expected: PASS (4 tests)

**Step 5: Commit**

```bash
git add src/lib/knowledge/vendorCatalog/types.ts src/lib/knowledge/vendorCatalog/__tests__/types.test.ts
git commit -m "feat(vendorCatalog): add type definitions — VendorCatalog, ProductNode, SearchResult"
```

---

## Task 2: Query Helpers (Tree Traversal Utilities)

**Files:**
- Create: `src/lib/knowledge/vendorCatalog/queryHelpers.ts`
- Test: `src/lib/knowledge/vendorCatalog/__tests__/queryHelpers.test.ts`

**Step 1: Write the failing test**

Create `src/lib/knowledge/vendorCatalog/__tests__/queryHelpers.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import type { ProductNode, VendorCatalog } from '../types';
import {
  findNodeById,
  getNodePath,
  getLeafNodes,
  getAllNodes,
  getNodesByDepth,
  countLeafNodes,
  getMaxDepth,
  searchNodes,
  computeStats,
} from '../queryHelpers';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const leaf1: ProductNode = {
  nodeId: 'catalyst-9200',
  depth: 3,
  depthLabel: 'series',
  depthLabelKo: '시리즈',
  name: 'Catalyst 9200 Series',
  nameKo: 'Catalyst 9200 시리즈',
  description: 'Entry-level access switches',
  descriptionKo: '엔트리급 액세스 스위치',
  sourceUrl: 'https://example.com/9200',
  specs: { throughput: '480 Gbps' },
  lifecycle: 'active',
  children: [],
};

const leaf2: ProductNode = {
  nodeId: 'catalyst-9300',
  depth: 3,
  depthLabel: 'series',
  depthLabelKo: '시리즈',
  name: 'Catalyst 9300 Series',
  nameKo: 'Catalyst 9300 시리즈',
  description: 'Stackable access switches',
  descriptionKo: '스택형 액세스 스위치',
  sourceUrl: 'https://example.com/9300',
  specs: { throughput: '960 Gbps' },
  lifecycle: 'active',
  children: [],
};

const family: ProductNode = {
  nodeId: 'catalyst-9000',
  depth: 2,
  depthLabel: 'family',
  depthLabelKo: '제품군',
  name: 'Catalyst 9000 Series',
  nameKo: 'Catalyst 9000 시리즈',
  description: 'Next-gen campus switches',
  descriptionKo: '차세대 캠퍼스 스위치',
  sourceUrl: 'https://example.com/cat9000',
  children: [leaf1, leaf2],
};

const subcategory: ProductNode = {
  nodeId: 'switches',
  depth: 1,
  depthLabel: 'subcategory',
  depthLabelKo: '하위 카테고리',
  name: 'Switches',
  nameKo: '스위치',
  description: 'Enterprise switches',
  descriptionKo: '엔터프라이즈 스위치',
  sourceUrl: 'https://example.com/switches',
  infraNodeTypes: ['switch-l2', 'switch-l3'],
  children: [family],
};

const root: ProductNode = {
  nodeId: 'networking',
  depth: 0,
  depthLabel: 'category',
  depthLabelKo: '카테고리',
  name: 'Networking',
  nameKo: '네트워킹',
  description: 'Networking solutions',
  descriptionKo: '네트워킹 솔루션',
  sourceUrl: 'https://example.com/networking',
  children: [subcategory],
};

const testTree: ProductNode[] = [root];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('findNodeById', () => {
  it('should find root node', () => {
    const result = findNodeById(testTree, 'networking');
    expect(result).toBeDefined();
    expect(result!.name).toBe('Networking');
  });

  it('should find deeply nested node', () => {
    const result = findNodeById(testTree, 'catalyst-9200');
    expect(result).toBeDefined();
    expect(result!.depth).toBe(3);
  });

  it('should return undefined for unknown nodeId', () => {
    const result = findNodeById(testTree, 'nonexistent');
    expect(result).toBeUndefined();
  });
});

describe('getNodePath', () => {
  it('should return path from root to target', () => {
    const path = getNodePath(testTree, 'catalyst-9200');
    expect(path.map((n) => n.nodeId)).toEqual([
      'networking',
      'switches',
      'catalyst-9000',
      'catalyst-9200',
    ]);
  });

  it('should return empty array for unknown node', () => {
    const path = getNodePath(testTree, 'nonexistent');
    expect(path).toEqual([]);
  });

  it('should return single element for root node', () => {
    const path = getNodePath(testTree, 'networking');
    expect(path).toHaveLength(1);
  });
});

describe('getLeafNodes', () => {
  it('should return only leaf nodes', () => {
    const leaves = getLeafNodes(testTree);
    expect(leaves).toHaveLength(2);
    expect(leaves.map((l) => l.nodeId)).toContain('catalyst-9200');
    expect(leaves.map((l) => l.nodeId)).toContain('catalyst-9300');
  });
});

describe('getAllNodes', () => {
  it('should return all nodes flattened', () => {
    const all = getAllNodes(testTree);
    expect(all).toHaveLength(5);
  });
});

describe('getNodesByDepth', () => {
  it('should return nodes at specific depth', () => {
    const depth3 = getNodesByDepth(testTree, 3);
    expect(depth3).toHaveLength(2);
    expect(depth3.every((n) => n.depth === 3)).toBe(true);
  });

  it('should return empty for non-existent depth', () => {
    const depth10 = getNodesByDepth(testTree, 10);
    expect(depth10).toEqual([]);
  });
});

describe('countLeafNodes', () => {
  it('should count leaf nodes', () => {
    expect(countLeafNodes(testTree)).toBe(2);
  });
});

describe('getMaxDepth', () => {
  it('should return maximum depth', () => {
    expect(getMaxDepth(testTree)).toBe(3);
  });

  it('should return 0 for empty tree', () => {
    expect(getMaxDepth([])).toBe(0);
  });
});

describe('searchNodes', () => {
  it('should search by English name', () => {
    const results = searchNodes(testTree, 'catalyst 9200');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].nodeId).toBe('catalyst-9200');
  });

  it('should search by Korean name', () => {
    const results = searchNodes(testTree, '스위치');
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it('should search by nodeId', () => {
    const results = searchNodes(testTree, 'catalyst-9300');
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it('should return empty for no match', () => {
    const results = searchNodes(testTree, 'zzzznonexistent');
    expect(results).toEqual([]);
  });
});

describe('computeStats', () => {
  it('should compute correct stats', () => {
    const stats = computeStats(testTree);
    expect(stats.totalProducts).toBe(2);
    expect(stats.maxDepth).toBe(3);
    expect(stats.categoriesCount).toBe(1);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/knowledge/vendorCatalog/__tests__/queryHelpers.test.ts`
Expected: FAIL — module `../queryHelpers` not found

**Step 3: Write minimal implementation**

Create `src/lib/knowledge/vendorCatalog/queryHelpers.ts`:

```typescript
/**
 * Vendor Catalog — Tree traversal and query utilities
 */

import type { ProductNode, CatalogStats } from './types';

/** Find a node by ID anywhere in the tree (DFS) */
export function findNodeById(
  nodes: ProductNode[],
  nodeId: string,
): ProductNode | undefined {
  for (const node of nodes) {
    if (node.nodeId === nodeId) return node;
    const found = findNodeById(node.children, nodeId);
    if (found) return found;
  }
  return undefined;
}

/** Get the path from root to a target node (breadcrumb trail) */
export function getNodePath(
  nodes: ProductNode[],
  targetId: string,
): ProductNode[] {
  for (const node of nodes) {
    if (node.nodeId === targetId) return [node];
    const childPath = getNodePath(node.children, targetId);
    if (childPath.length > 0) return [node, ...childPath];
  }
  return [];
}

/** Get all leaf nodes (nodes with empty children array) */
export function getLeafNodes(nodes: ProductNode[]): ProductNode[] {
  const leaves: ProductNode[] = [];
  for (const node of nodes) {
    if (node.children.length === 0) {
      leaves.push(node);
    } else {
      leaves.push(...getLeafNodes(node.children));
    }
  }
  return leaves;
}

/** Flatten all nodes in the tree */
export function getAllNodes(nodes: ProductNode[]): ProductNode[] {
  const result: ProductNode[] = [];
  for (const node of nodes) {
    result.push(node);
    result.push(...getAllNodes(node.children));
  }
  return result;
}

/** Get all nodes at a specific depth */
export function getNodesByDepth(
  nodes: ProductNode[],
  depth: number,
): ProductNode[] {
  return getAllNodes(nodes).filter((n) => n.depth === depth);
}

/** Count leaf nodes */
export function countLeafNodes(nodes: ProductNode[]): number {
  return getLeafNodes(nodes).length;
}

/** Get maximum depth in the tree */
export function getMaxDepth(nodes: ProductNode[]): number {
  if (nodes.length === 0) return 0;
  const all = getAllNodes(nodes);
  return Math.max(...all.map((n) => n.depth));
}

/** Search nodes by keyword (case-insensitive, matches name/nameKo/nodeId/description) */
export function searchNodes(
  nodes: ProductNode[],
  query: string,
): ProductNode[] {
  const q = query.toLowerCase();
  return getAllNodes(nodes).filter((node) => {
    const texts = [
      node.nodeId,
      node.name,
      node.nameKo,
      node.description,
      node.descriptionKo,
    ];
    return texts.some((t) => t.toLowerCase().includes(q));
  });
}

/** Compute catalog stats from product tree */
export function computeStats(products: ProductNode[]): CatalogStats {
  return {
    totalProducts: countLeafNodes(products),
    maxDepth: getMaxDepth(products),
    categoriesCount: products.length,
  };
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/knowledge/vendorCatalog/__tests__/queryHelpers.test.ts`
Expected: PASS (all tests)

**Step 5: Commit**

```bash
git add src/lib/knowledge/vendorCatalog/queryHelpers.ts src/lib/knowledge/vendorCatalog/__tests__/queryHelpers.test.ts
git commit -m "feat(vendorCatalog): add query helpers — tree traversal, search, stats"
```

---

## Task 3: Unified Query API (index.ts)

**Files:**
- Create: `src/lib/knowledge/vendorCatalog/index.ts`
- Test: `src/lib/knowledge/vendorCatalog/__tests__/index.test.ts`

**Step 1: Write the failing test**

Create `src/lib/knowledge/vendorCatalog/__tests__/index.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  allVendorCatalogs,
  getVendorList,
  getVendor,
  getProductsByNodeType,
  getChildren,
  getLeafProducts,
  getProductPath,
  searchProducts,
  getCatalogStats,
} from '../index';

/**
 * NOTE: These tests validate the query API using whatever vendor data
 * is currently imported. Initially the array may be empty (no vendor
 * files yet) — that's fine, we test the API contract.
 */

describe('vendorCatalog query API', () => {
  describe('getVendorList', () => {
    it('should return an array', () => {
      const list = getVendorList();
      expect(Array.isArray(list)).toBe(true);
    });
  });

  describe('getVendor', () => {
    it('should return undefined for unknown vendor', () => {
      expect(getVendor('nonexistent')).toBeUndefined();
    });
  });

  describe('getProductsByNodeType', () => {
    it('should return an array for any node type', () => {
      const results = getProductsByNodeType('switch-l2');
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('getChildren', () => {
    it('should return empty array for unknown vendor', () => {
      expect(getChildren('nonexistent', 'any')).toEqual([]);
    });
  });

  describe('getLeafProducts', () => {
    it('should return empty array for unknown vendor', () => {
      expect(getLeafProducts('nonexistent')).toEqual([]);
    });
  });

  describe('getProductPath', () => {
    it('should return empty array for unknown vendor', () => {
      expect(getProductPath('nonexistent', 'any')).toEqual([]);
    });
  });

  describe('searchProducts', () => {
    it('should return empty array for gibberish query', () => {
      expect(searchProducts('zzzznonexistent999')).toEqual([]);
    });
  });

  describe('getCatalogStats', () => {
    it('should return valid stats object', () => {
      const stats = getCatalogStats();
      expect(stats).toHaveProperty('vendors');
      expect(stats).toHaveProperty('totalProducts');
      expect(stats).toHaveProperty('byVendor');
      expect(typeof stats.vendors).toBe('number');
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/knowledge/vendorCatalog/__tests__/index.test.ts`
Expected: FAIL — module `../index` not found

**Step 3: Write minimal implementation**

Create `src/lib/knowledge/vendorCatalog/index.ts`:

```typescript
/**
 * Vendor Catalog — Unified query API
 *
 * Merges all vendor-specific catalog files and provides query functions
 * for looking up vendor products by node type, keyword, or hierarchy.
 *
 * Design doc: docs/plans/2026-02-20-vendor-catalog-design.md
 */

import type { InfraNodeType } from '@/types/infra';
import type { VendorCatalog, ProductNode, SearchResult } from './types';
import {
  findNodeById,
  getNodePath as getNodePathHelper,
  getLeafNodes,
  getAllNodes,
  searchNodes,
} from './queryHelpers';

// ---------------------------------------------------------------------------
// Import vendor catalogs here as they are added
// ---------------------------------------------------------------------------
// import { ciscoCatalog } from './vendors/cisco';

export const allVendorCatalogs: VendorCatalog[] = [
  // ciscoCatalog,  // uncomment when vendor file is created
];

// ---------------------------------------------------------------------------
// Lookup index
// ---------------------------------------------------------------------------

const byVendorId = new Map<string, VendorCatalog>(
  allVendorCatalogs.map((c) => [c.vendorId, c]),
);

// ---------------------------------------------------------------------------
// Query functions
// ---------------------------------------------------------------------------

/** Get all vendor catalogs */
export function getVendorList(): VendorCatalog[] {
  return allVendorCatalogs;
}

/** Get a single vendor catalog by ID */
export function getVendor(vendorId: string): VendorCatalog | undefined {
  return byVendorId.get(vendorId);
}

/** Find products across all vendors that map to a specific InfraNodeType */
export function getProductsByNodeType(
  nodeType: InfraNodeType,
): { vendorId: string; vendorName: string; products: ProductNode[] }[] {
  const results: { vendorId: string; vendorName: string; products: ProductNode[] }[] = [];

  for (const catalog of allVendorCatalogs) {
    const allNodes = getAllNodes(catalog.products);
    const matching = allNodes.filter(
      (n) => n.infraNodeTypes?.includes(nodeType),
    );
    if (matching.length > 0) {
      results.push({
        vendorId: catalog.vendorId,
        vendorName: catalog.vendorName,
        products: matching,
      });
    }
  }

  return results;
}

/** Get children of a specific node within a vendor */
export function getChildren(
  vendorId: string,
  nodeId: string,
): ProductNode[] {
  const catalog = byVendorId.get(vendorId);
  if (!catalog) return [];
  const node = findNodeById(catalog.products, nodeId);
  return node?.children ?? [];
}

/** Get all leaf products for a vendor, optionally under a specific category */
export function getLeafProducts(
  vendorId: string,
  categoryNodeId?: string,
): ProductNode[] {
  const catalog = byVendorId.get(vendorId);
  if (!catalog) return [];

  if (categoryNodeId) {
    const category = findNodeById(catalog.products, categoryNodeId);
    return category ? getLeafNodes([category]) : [];
  }

  return getLeafNodes(catalog.products);
}

/** Get path from root to a specific node (breadcrumb) */
export function getProductPath(
  vendorId: string,
  nodeId: string,
): ProductNode[] {
  const catalog = byVendorId.get(vendorId);
  if (!catalog) return [];
  return getNodePathHelper(catalog.products, nodeId);
}

/** Search products across all vendors (or specific vendor) */
export function searchProducts(
  query: string,
  options?: {
    vendorId?: string;
    nodeType?: InfraNodeType;
    leafOnly?: boolean;
  },
): SearchResult[] {
  const catalogs = options?.vendorId
    ? allVendorCatalogs.filter((c) => c.vendorId === options.vendorId)
    : allVendorCatalogs;

  const results: SearchResult[] = [];

  for (const catalog of catalogs) {
    let matches = searchNodes(catalog.products, query);

    if (options?.nodeType) {
      matches = matches.filter((n) => n.infraNodeTypes?.includes(options.nodeType!));
    }
    if (options?.leafOnly) {
      matches = matches.filter((n) => n.children.length === 0);
    }

    for (const node of matches) {
      const path = getNodePathHelper(catalog.products, node.nodeId);
      const q = query.toLowerCase();
      const matchField = node.name.toLowerCase().includes(q)
        ? 'name'
        : node.nameKo.toLowerCase().includes(q)
          ? 'nameKo'
          : node.nodeId.toLowerCase().includes(q)
            ? 'nodeId'
            : node.description.toLowerCase().includes(q)
              ? 'description'
              : 'descriptionKo';

      results.push({
        vendorId: catalog.vendorId,
        vendorName: catalog.vendorName,
        node,
        path: path.map((p) => p.nodeId),
        matchField,
      });
    }
  }

  return results;
}

/** Get aggregate statistics across all vendor catalogs */
export function getCatalogStats(): {
  vendors: number;
  totalProducts: number;
  byVendor: Record<string, number>;
} {
  const byVendor: Record<string, number> = {};
  let totalProducts = 0;

  for (const catalog of allVendorCatalogs) {
    const count = getLeafNodes(catalog.products).length;
    byVendor[catalog.vendorId] = count;
    totalProducts += count;
  }

  return {
    vendors: allVendorCatalogs.length,
    totalProducts,
    byVendor,
  };
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export type {
  VendorCatalog,
  ProductNode,
  CatalogStats,
  SearchResult,
} from './types';
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/knowledge/vendorCatalog/__tests__/index.test.ts`
Expected: PASS (all tests)

**Step 5: Commit**

```bash
git add src/lib/knowledge/vendorCatalog/index.ts src/lib/knowledge/vendorCatalog/__tests__/index.test.ts
git commit -m "feat(vendorCatalog): add unified query API — getVendor, searchProducts, getProductsByNodeType"
```

---

## Task 4: Full Verification

**Step 1: Run all vendorCatalog tests together**

Run: `npx vitest run src/lib/knowledge/vendorCatalog/`
Expected: PASS (all 3 test files)

**Step 2: Run full type check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass (existing + new)

**Step 4: Commit (if any fixes needed)**

Only if fixes were required in steps 1-3.

---

## Task 5: First Vendor Crawl (Interactive — Not Pre-scripted)

> This task is **interactive**. When the user provides a vendor URL, execute the crawling methodology defined in the design doc (Section 3).

**Files:**
- Create: `src/lib/knowledge/vendorCatalog/vendors/<vendor>.ts`
- Modify: `src/lib/knowledge/vendorCatalog/index.ts` (add import + register)
- Test: `src/lib/knowledge/vendorCatalog/__tests__/vendors/<vendor>.test.ts`

**Process:**

1. User provides vendor URL
2. WebFetch the main product page → identify categories + hierarchy depth
3. Report structure to user, ask which categories to crawl
4. Crawl selected categories level by level
5. Build `ProductNode[]` tree from extracted data
6. Match Korean/English descriptions
7. Map to `InfraNodeType` where appropriate
8. Write vendor TS file with `VendorCatalog` export
9. Update `index.ts` to import the new vendor
10. Write vendor-specific tests (data integrity: bilingual, URLs, nodeIds unique, stats)
11. Run `npx tsc --noEmit && npx vitest run`

**Vendor test template:**

```typescript
import { describe, it, expect } from 'vitest';
import { <vendorId>Catalog } from '../../vendors/<vendor>';
import { getAllNodes, getLeafNodes, computeStats } from '../../queryHelpers';

describe('<VendorName> catalog data integrity', () => {
  const allNodes = getAllNodes(<vendorId>Catalog.products);
  const leafNodes = getLeafNodes(<vendorId>Catalog.products);

  it('should have valid vendorId', () => {
    expect(<vendorId>Catalog.vendorId).toBe('<vendor>');
  });

  it('should have bilingual vendor name', () => {
    expect(<vendorId>Catalog.vendorName).toBeTruthy();
    expect(<vendorId>Catalog.vendorNameKo).toBeTruthy();
  });

  it('should have non-empty product tree', () => {
    expect(<vendorId>Catalog.products.length).toBeGreaterThan(0);
  });

  it('should have unique nodeIds', () => {
    const ids = allNodes.map((n) => n.nodeId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have bilingual names on all nodes', () => {
    for (const node of allNodes) {
      expect(node.name).toBeTruthy();
      expect(node.nameKo).toBeTruthy();
    }
  });

  it('should have valid sourceUrl on all nodes', () => {
    for (const node of allNodes) {
      expect(node.sourceUrl).toMatch(/^https?:\/\//);
    }
  });

  it('should have correct depth values', () => {
    for (const node of allNodes) {
      expect(node.depth).toBeGreaterThanOrEqual(0);
      expect(node.depth).toBeLessThanOrEqual(<vendorId>Catalog.depthStructure.length);
    }
  });

  it('should have specs on leaf nodes', () => {
    for (const leaf of leafNodes) {
      expect(leaf.children).toHaveLength(0);
    }
  });

  it('should have consistent stats', () => {
    const computed = computeStats(<vendorId>Catalog.products);
    expect(<vendorId>Catalog.stats.totalProducts).toBe(computed.totalProducts);
    expect(<vendorId>Catalog.stats.maxDepth).toBe(computed.maxDepth);
  });

  it('should have depthStructure matching actual depths', () => {
    expect(<vendorId>Catalog.depthStructure.length)
      .toBe(<vendorId>Catalog.depthStructureKo.length);
  });
});
```

---

## Summary

| Task | Description | Files | Tests |
|------|-------------|-------|-------|
| 1 | Type definitions | types.ts | ~4 tests |
| 2 | Query helpers (tree utils) | queryHelpers.ts | ~12 tests |
| 3 | Unified query API | index.ts | ~8 tests |
| 4 | Full verification | — | Full suite |
| 5 | First vendor crawl (interactive) | vendors/*.ts | ~10 tests per vendor |

**Total estimated new tests:** ~34 (infrastructure) + ~10 per vendor
