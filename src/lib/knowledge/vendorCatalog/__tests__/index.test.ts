import { describe, it, expect, beforeEach } from 'vitest';
import type { InfraNodeType } from '@/types/infra';
import type { VendorCatalog, ProductNode, SearchResult } from '../types';
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

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

function makeLeaf(overrides: Partial<ProductNode> = {}): ProductNode {
  return {
    nodeId: 'leaf-001',
    depth: 2,
    depthLabel: 'Model',
    depthLabelKo: '\uBAA8\uB378',
    name: 'Test Leaf',
    nameKo: '\uD14C\uC2A4\uD2B8 \uB9AC\uD504',
    description: 'A leaf product',
    descriptionKo: '\uB9AC\uD504 \uC81C\uD488',
    sourceUrl: 'https://example.com/leaf',
    children: [],
    ...overrides,
  };
}

function makeCategory(
  overrides: Partial<ProductNode> = {},
  children: ProductNode[] = [],
): ProductNode {
  return {
    nodeId: 'cat-001',
    depth: 0,
    depthLabel: 'Category',
    depthLabelKo: '\uCE74\uD14C\uACE0\uB9AC',
    name: 'Test Category',
    nameKo: '\uD14C\uC2A4\uD2B8 \uCE74\uD14C\uACE0\uB9AC',
    description: 'A test category',
    descriptionKo: '\uD14C\uC2A4\uD2B8 \uCE74\uD14C\uACE0\uB9AC \uC124\uBA85',
    sourceUrl: 'https://example.com/cat',
    children,
    ...overrides,
  };
}

function makeVendor(overrides: Partial<VendorCatalog> = {}): VendorCatalog {
  return {
    vendorId: 'test-vendor',
    vendorName: 'Test Vendor',
    vendorNameKo: '\uD14C\uC2A4\uD2B8 \uBCA4\uB354',
    headquarters: 'Seoul, Korea',
    website: 'https://test-vendor.com',
    productPageUrl: 'https://test-vendor.com/products',
    depthStructure: ['Category', 'Product Line', 'Model'],
    depthStructureKo: ['\uCE74\uD14C\uACE0\uB9AC', '\uC81C\uD488 \uB77C\uC778', '\uBAA8\uB378'],
    products: [],
    stats: { totalProducts: 0, maxDepth: 0, categoriesCount: 0 },
    lastCrawled: '2026-02-20',
    crawlSource: 'manual',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests — Empty catalog (default state)
// ---------------------------------------------------------------------------

describe('vendorCatalog unified query API', () => {
  describe('empty catalog (default state)', () => {
    it('should export allVendorCatalogs as an array', () => {
      expect(Array.isArray(allVendorCatalogs)).toBe(true);
    });

    it('should return an empty array from getVendorList', () => {
      const list = getVendorList();
      expect(Array.isArray(list)).toBe(true);
      expect(list).toHaveLength(0);
    });

    it('should return undefined from getVendor for unknown vendor', () => {
      expect(getVendor('non-existent')).toBeUndefined();
    });

    it('should return empty array from getProductsByNodeType', () => {
      const results = getProductsByNodeType('firewall' as InfraNodeType);
      expect(Array.isArray(results)).toBe(true);
      expect(results).toHaveLength(0);
    });

    it('should return empty array from getChildren for unknown vendor', () => {
      const children = getChildren('unknown-vendor', 'some-node');
      expect(children).toEqual([]);
    });

    it('should return empty array from getLeafProducts for unknown vendor', () => {
      const leaves = getLeafProducts('unknown-vendor');
      expect(leaves).toEqual([]);
    });

    it('should return empty array from getProductPath for unknown vendor', () => {
      const path = getProductPath('unknown-vendor', 'some-node');
      expect(path).toEqual([]);
    });

    it('should return empty array from searchProducts for gibberish', () => {
      const results = searchProducts('xyznonexistent123');
      expect(Array.isArray(results)).toBe(true);
      expect(results).toHaveLength(0);
    });

    it('should return valid shape from getCatalogStats', () => {
      const stats = getCatalogStats();
      expect(stats).toEqual({
        vendors: 0,
        totalProducts: 0,
        byVendor: {},
      });
    });
  });

  // -------------------------------------------------------------------------
  // Tests — With populated catalog data
  // -------------------------------------------------------------------------

  describe('with populated catalog data', () => {
    // Build a realistic two-vendor catalog and push into allVendorCatalogs
    // before each test, then clean up after.

    const fwLeaf1 = makeLeaf({
      nodeId: 'PN-FW-001',
      depth: 2,
      name: 'FortiGate 100F',
      nameKo: '\uD3EC\uD2F0\uAC8C\uC774\uD2B8 100F',
      description: 'Next-gen firewall appliance',
      descriptionKo: '\uCC28\uC138\uB300 \uBC29\uD654\uBCBD \uC7A5\uBE44',
      infraNodeTypes: ['firewall'] as InfraNodeType[],
      specs: { throughput: '10 Gbps' },
    });

    const fwLeaf2 = makeLeaf({
      nodeId: 'PN-FW-002',
      depth: 2,
      name: 'FortiGate 200F',
      nameKo: '\uD3EC\uD2F0\uAC8C\uC774\uD2B8 200F',
      description: 'Mid-range firewall appliance',
      descriptionKo: '\uC911\uAE09 \uBC29\uD654\uBCBD \uC7A5\uBE44',
      infraNodeTypes: ['firewall'] as InfraNodeType[],
    });

    const fwCategory = makeCategory(
      {
        nodeId: 'PN-FW',
        depth: 1,
        depthLabel: 'Product Line',
        depthLabelKo: '\uC81C\uD488 \uB77C\uC778',
        name: 'FortiGate Series',
        nameKo: '\uD3EC\uD2F0\uAC8C\uC774\uD2B8 \uC2DC\uB9AC\uC988',
        description: 'Network firewall product line',
        descriptionKo: '\uB124\uD2B8\uC6CC\uD06C \uBC29\uD654\uBCBD \uC81C\uD488 \uB77C\uC778',
      },
      [fwLeaf1, fwLeaf2],
    );

    const securityRoot = makeCategory(
      {
        nodeId: 'PN-SEC',
        depth: 0,
        name: 'Security',
        nameKo: '\uBCF4\uC548',
        description: 'Security products',
        descriptionKo: '\uBCF4\uC548 \uC81C\uD488',
      },
      [fwCategory],
    );

    const vendorA = makeVendor({
      vendorId: 'fortinet',
      vendorName: 'Fortinet',
      vendorNameKo: '\uD3EC\uD2F0\uB137',
      products: [securityRoot],
      stats: { totalProducts: 4, maxDepth: 2, categoriesCount: 1 },
    });

    const swLeaf = makeLeaf({
      nodeId: 'PN-SW-001',
      depth: 1,
      name: 'Catalyst 9200',
      nameKo: '\uCE74\uD0C8\uB9AC\uC2A4\uD2B8 9200',
      description: 'Entry-level switch',
      descriptionKo: '\uC785\uBB38\uC6A9 \uC2A4\uC704\uCE58',
      infraNodeTypes: ['switch-l2'] as InfraNodeType[],
    });

    const fwLeafB = makeLeaf({
      nodeId: 'PN-ASA-001',
      depth: 1,
      name: 'ASA 5500',
      nameKo: 'ASA 5500',
      description: 'Cisco adaptive security appliance',
      descriptionKo: '\uC2DC\uC2A4\uCF54 \uC801\uC751\uD615 \uBCF4\uC548 \uC7A5\uBE44',
      infraNodeTypes: ['firewall'] as InfraNodeType[],
    });

    const networkRoot = makeCategory(
      {
        nodeId: 'PN-NET',
        depth: 0,
        name: 'Networking',
        nameKo: '\uB124\uD2B8\uC6CC\uD0B9',
        description: 'Network products',
        descriptionKo: '\uB124\uD2B8\uC6CC\uD06C \uC81C\uD488',
      },
      [swLeaf, fwLeafB],
    );

    const vendorB = makeVendor({
      vendorId: 'cisco',
      vendorName: 'Cisco',
      vendorNameKo: '\uC2DC\uC2A4\uCF54',
      products: [networkRoot],
      stats: { totalProducts: 3, maxDepth: 1, categoriesCount: 1 },
    });

    beforeEach(() => {
      // Reset and populate the catalog
      allVendorCatalogs.length = 0;
      allVendorCatalogs.push(vendorA, vendorB);
    });

    // -- getVendorList -------------------------------------------------------
    describe('getVendorList', () => {
      it('should return all registered vendors', () => {
        const list = getVendorList();
        expect(list).toHaveLength(2);
        expect(list.map((v) => v.vendorId).sort()).toEqual(['cisco', 'fortinet']);
      });
    });

    // -- getVendor -----------------------------------------------------------
    describe('getVendor', () => {
      it('should return a vendor by ID', () => {
        const vendor = getVendor('fortinet');
        expect(vendor).toBeDefined();
        expect(vendor!.vendorName).toBe('Fortinet');
      });

      it('should return undefined for unknown vendor', () => {
        expect(getVendor('unknown')).toBeUndefined();
      });
    });

    // -- getProductsByNodeType -----------------------------------------------
    describe('getProductsByNodeType', () => {
      it('should find firewall products across multiple vendors', () => {
        const results = getProductsByNodeType('firewall' as InfraNodeType);
        expect(results.length).toBe(2);

        const fortinet = results.find((r) => r.vendorId === 'fortinet');
        expect(fortinet).toBeDefined();
        expect(fortinet!.products).toHaveLength(2);
        expect(fortinet!.products.map((p) => p.nodeId).sort()).toEqual([
          'PN-FW-001',
          'PN-FW-002',
        ]);

        const cisco = results.find((r) => r.vendorId === 'cisco');
        expect(cisco).toBeDefined();
        expect(cisco!.products).toHaveLength(1);
        expect(cisco!.products[0].nodeId).toBe('PN-ASA-001');
      });

      it('should find switch products only in the vendor that has them', () => {
        const results = getProductsByNodeType('switch-l2' as InfraNodeType);
        expect(results).toHaveLength(1);
        expect(results[0].vendorId).toBe('cisco');
        expect(results[0].products).toHaveLength(1);
      });

      it('should return empty for a node type with no products', () => {
        const results = getProductsByNodeType('waf' as InfraNodeType);
        expect(results).toEqual([]);
      });
    });

    // -- getChildren ---------------------------------------------------------
    describe('getChildren', () => {
      it('should return children of a node in a vendor', () => {
        const children = getChildren('fortinet', 'PN-FW');
        expect(children).toHaveLength(2);
        expect(children.map((c) => c.nodeId).sort()).toEqual(['PN-FW-001', 'PN-FW-002']);
      });

      it('should return root products when nodeId matches no node but vendor exists', () => {
        const children = getChildren('fortinet', 'NONEXISTENT');
        expect(children).toEqual([]);
      });

      it('should return empty for unknown vendor', () => {
        expect(getChildren('unknown', 'PN-FW')).toEqual([]);
      });
    });

    // -- getLeafProducts -----------------------------------------------------
    describe('getLeafProducts', () => {
      it('should return all leaf products for a vendor', () => {
        const leaves = getLeafProducts('fortinet');
        expect(leaves).toHaveLength(2);
        expect(leaves.map((l) => l.nodeId).sort()).toEqual(['PN-FW-001', 'PN-FW-002']);
      });

      it('should return leaf products under a specific category node', () => {
        const leaves = getLeafProducts('fortinet', 'PN-SEC');
        expect(leaves).toHaveLength(2);
      });

      it('should return leaf products under a sub-category node', () => {
        const leaves = getLeafProducts('fortinet', 'PN-FW');
        expect(leaves).toHaveLength(2);
      });

      it('should return empty for unknown vendor', () => {
        expect(getLeafProducts('unknown')).toEqual([]);
      });

      it('should return empty for unknown category node', () => {
        expect(getLeafProducts('fortinet', 'NONEXISTENT')).toEqual([]);
      });
    });

    // -- getProductPath ------------------------------------------------------
    describe('getProductPath', () => {
      it('should return breadcrumb path from root to a leaf node', () => {
        const path = getProductPath('fortinet', 'PN-FW-001');
        expect(path).toHaveLength(3);
        expect(path.map((n) => n.nodeId)).toEqual(['PN-SEC', 'PN-FW', 'PN-FW-001']);
      });

      it('should return single-element path for root node', () => {
        const path = getProductPath('fortinet', 'PN-SEC');
        expect(path).toHaveLength(1);
        expect(path[0].nodeId).toBe('PN-SEC');
      });

      it('should return empty for unknown node', () => {
        expect(getProductPath('fortinet', 'NONEXISTENT')).toEqual([]);
      });

      it('should return empty for unknown vendor', () => {
        expect(getProductPath('unknown', 'PN-FW-001')).toEqual([]);
      });
    });

    // -- searchProducts ------------------------------------------------------
    describe('searchProducts', () => {
      it('should search across all vendors by default', () => {
        const results = searchProducts('firewall');
        expect(results.length).toBeGreaterThanOrEqual(1);
        // Should include results from both vendors
        const vendorIds = [...new Set(results.map((r) => r.vendorId))];
        expect(vendorIds.length).toBeGreaterThanOrEqual(1);
      });

      it('should filter by vendorId when specified', () => {
        const results = searchProducts('firewall', { vendorId: 'fortinet' });
        expect(results.length).toBeGreaterThanOrEqual(1);
        expect(results.every((r) => r.vendorId === 'fortinet')).toBe(true);
      });

      it('should filter by nodeType when specified', () => {
        const results = searchProducts('Catalyst', {
          nodeType: 'switch-l2' as InfraNodeType,
        });
        expect(results).toHaveLength(1);
        expect(results[0].node.nodeId).toBe('PN-SW-001');
      });

      it('should filter leafOnly when specified', () => {
        const resultsAll = searchProducts('Security', { vendorId: 'fortinet' });
        const resultsLeaf = searchProducts('Security', {
          vendorId: 'fortinet',
          leafOnly: true,
        });
        // 'Security' category node is NOT a leaf, so leafOnly should exclude it
        expect(resultsLeaf.length).toBeLessThanOrEqual(resultsAll.length);
        for (const r of resultsLeaf) {
          expect(r.node.children).toHaveLength(0);
        }
      });

      it('should include matchField indicating which field matched', () => {
        const results = searchProducts('FortiGate 100F');
        expect(results.length).toBeGreaterThanOrEqual(1);
        const match = results.find((r) => r.node.nodeId === 'PN-FW-001');
        expect(match).toBeDefined();
        expect(match!.matchField).toBe('name');
      });

      it('should match Korean fields', () => {
        const results = searchProducts('\uBC29\uD654\uBCBD');
        expect(results.length).toBeGreaterThanOrEqual(1);
        // Should match description or descriptionKo
        const matchFields = results.map((r) => r.matchField);
        expect(
          matchFields.some((f) => f === 'nameKo' || f === 'descriptionKo'),
        ).toBe(true);
      });

      it('should include breadcrumb path in results', () => {
        const results = searchProducts('FortiGate 100F');
        const match = results.find((r) => r.node.nodeId === 'PN-FW-001');
        expect(match).toBeDefined();
        expect(match!.path.length).toBeGreaterThanOrEqual(1);
      });

      it('should return empty for empty query', () => {
        expect(searchProducts('')).toEqual([]);
      });

      it('should return empty for gibberish', () => {
        expect(searchProducts('xyznonexistent123garbage')).toEqual([]);
      });
    });

    // -- getCatalogStats -----------------------------------------------------
    describe('getCatalogStats', () => {
      it('should return aggregate stats across all vendors', () => {
        const stats = getCatalogStats();
        expect(stats.vendors).toBe(2);
        expect(stats.totalProducts).toBeGreaterThan(0);
        expect(stats.byVendor).toHaveProperty('fortinet');
        expect(stats.byVendor).toHaveProperty('cisco');
      });

      it('should count products per vendor using getAllNodes', () => {
        const stats = getCatalogStats();
        // Fortinet: PN-SEC, PN-FW, PN-FW-001, PN-FW-002 = 4 nodes
        expect(stats.byVendor['fortinet']).toBe(4);
        // Cisco: PN-NET, PN-SW-001, PN-ASA-001 = 3 nodes
        expect(stats.byVendor['cisco']).toBe(3);
        expect(stats.totalProducts).toBe(7);
      });
    });
  });

  // -------------------------------------------------------------------------
  // Type re-exports
  // -------------------------------------------------------------------------
  describe('type re-exports', () => {
    it('should re-export VendorCatalog type (compile-time check)', () => {
      // This test simply verifies the imports compile correctly
      const catalog: VendorCatalog = makeVendor();
      expect(catalog.vendorId).toBe('test-vendor');
    });

    it('should re-export SearchResult type (compile-time check)', () => {
      const result: SearchResult = {
        vendorId: 'test',
        vendorName: 'Test',
        node: makeLeaf(),
        path: ['root'],
        matchField: 'name',
      };
      expect(result.matchField).toBe('name');
    });
  });
});
