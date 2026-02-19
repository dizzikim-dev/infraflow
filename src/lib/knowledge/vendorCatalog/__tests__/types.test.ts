import { describe, it, expect } from 'vitest';
import type {
  ProductNode,
  CatalogStats,
  VendorCatalog,
  SearchResult,
} from '../types';

// ---------------------------------------------------------------------------
// ProductNode — leaf node (no children, with specs)
// ---------------------------------------------------------------------------

describe('ProductNode', () => {
  it('should create a valid leaf ProductNode with specs and no children', () => {
    const leaf: ProductNode = {
      nodeId: 'PN-FW-001',
      depth: 2,
      depthLabel: 'Model',
      depthLabelKo: '모델',
      name: 'FortiGate 60F',
      nameKo: 'FortiGate 60F',
      description: 'Entry-level next-gen firewall for small offices',
      descriptionKo: '소규모 사무실용 차세대 방화벽',
      sourceUrl: 'https://www.fortinet.com/products/next-generation-firewall',
      specs: {
        throughput: '10 Gbps',
        interfaces: '10x GE RJ45',
        formFactor: 'Desktop',
      },
      datasheetUrl: 'https://www.fortinet.com/content/dam/fortinet/assets/data-sheets/fortigate-60f.pdf',
      pricingInfo: 'Starting at $500 MSRP',
      lifecycle: 'active',
      children: [],
    };

    expect(leaf.nodeId).toBe('PN-FW-001');
    expect(leaf.depth).toBe(2);
    expect(leaf.depthLabel).toBe('Model');
    expect(leaf.depthLabelKo).toBe('모델');
    expect(leaf.name).toBe('FortiGate 60F');
    expect(leaf.nameKo).toBe('FortiGate 60F');
    expect(leaf.description).toContain('Entry-level');
    expect(leaf.descriptionKo).toContain('방화벽');
    expect(leaf.sourceUrl).toContain('fortinet.com');
    expect(leaf.specs).toBeDefined();
    expect(leaf.specs!['throughput']).toBe('10 Gbps');
    expect(leaf.specs!['interfaces']).toBe('10x GE RJ45');
    expect(leaf.specs!['formFactor']).toBe('Desktop');
    expect(leaf.datasheetUrl).toContain('.pdf');
    expect(leaf.pricingInfo).toContain('$500');
    expect(leaf.lifecycle).toBe('active');
    expect(leaf.children).toHaveLength(0);
    expect(leaf.infraNodeTypes).toBeUndefined();
  });

  it('should create a ProductNode with children and infraNodeTypes', () => {
    const child1: ProductNode = {
      nodeId: 'PN-FW-002',
      depth: 2,
      depthLabel: 'Model',
      depthLabelKo: '모델',
      name: 'FortiGate 100F',
      nameKo: 'FortiGate 100F',
      description: 'Mid-range firewall for branch offices',
      descriptionKo: '지사용 중급 방화벽',
      sourceUrl: 'https://www.fortinet.com/products/next-generation-firewall',
      lifecycle: 'active',
      children: [],
    };

    const child2: ProductNode = {
      nodeId: 'PN-FW-003',
      depth: 2,
      depthLabel: 'Model',
      depthLabelKo: '모델',
      name: 'FortiGate 200F',
      nameKo: 'FortiGate 200F',
      description: 'Enterprise firewall for campus networks',
      descriptionKo: '캠퍼스 네트워크용 엔터프라이즈 방화벽',
      sourceUrl: 'https://www.fortinet.com/products/next-generation-firewall',
      lifecycle: 'end-of-sale',
      children: [],
    };

    const parent: ProductNode = {
      nodeId: 'PN-FW-CAT-001',
      depth: 1,
      depthLabel: 'Product Line',
      depthLabelKo: '제품군',
      name: 'FortiGate Next-Generation Firewall',
      nameKo: 'FortiGate 차세대 방화벽',
      description: 'Fortinet next-generation firewall product line',
      descriptionKo: 'Fortinet 차세대 방화벽 제품군',
      sourceUrl: 'https://www.fortinet.com/products/next-generation-firewall',
      infraNodeTypes: ['firewall', 'waf'],
      children: [child1, child2],
    };

    expect(parent.nodeId).toBe('PN-FW-CAT-001');
    expect(parent.depth).toBe(1);
    expect(parent.depthLabel).toBe('Product Line');
    expect(parent.depthLabelKo).toBe('제품군');
    expect(parent.infraNodeTypes).toBeDefined();
    expect(parent.infraNodeTypes).toContain('firewall');
    expect(parent.infraNodeTypes).toContain('waf');
    expect(parent.infraNodeTypes).toHaveLength(2);
    expect(parent.children).toHaveLength(2);
    expect(parent.children[0].nodeId).toBe('PN-FW-002');
    expect(parent.children[1].nodeId).toBe('PN-FW-003');
    expect(parent.children[1].lifecycle).toBe('end-of-sale');
    // Optional fields should be undefined when not set
    expect(parent.specs).toBeUndefined();
    expect(parent.datasheetUrl).toBeUndefined();
    expect(parent.pricingInfo).toBeUndefined();
    expect(parent.lifecycle).toBeUndefined();
  });

  it('should support end-of-life lifecycle status', () => {
    const eolNode: ProductNode = {
      nodeId: 'PN-EOL-001',
      depth: 2,
      depthLabel: 'Model',
      depthLabelKo: '모델',
      name: 'FortiGate 50E',
      nameKo: 'FortiGate 50E',
      description: 'Legacy entry-level firewall (discontinued)',
      descriptionKo: '단종된 엔트리급 방화벽',
      sourceUrl: 'https://www.fortinet.com/products',
      lifecycle: 'end-of-life',
      children: [],
    };

    expect(eolNode.lifecycle).toBe('end-of-life');
  });
});

// ---------------------------------------------------------------------------
// CatalogStats
// ---------------------------------------------------------------------------

describe('CatalogStats', () => {
  it('should create valid stats', () => {
    const stats: CatalogStats = {
      totalProducts: 156,
      maxDepth: 4,
      categoriesCount: 8,
    };

    expect(stats.totalProducts).toBe(156);
    expect(stats.maxDepth).toBe(4);
    expect(stats.categoriesCount).toBe(8);
  });
});

// ---------------------------------------------------------------------------
// VendorCatalog
// ---------------------------------------------------------------------------

describe('VendorCatalog', () => {
  it('should create a valid VendorCatalog with products', () => {
    const leafProduct: ProductNode = {
      nodeId: 'PN-PA-001',
      depth: 2,
      depthLabel: 'Model',
      depthLabelKo: '모델',
      name: 'PA-440',
      nameKo: 'PA-440',
      description: 'Entry-level ML-powered NGFW',
      descriptionKo: 'ML 기반 엔트리급 차세대 방화벽',
      sourceUrl: 'https://www.paloaltonetworks.com/network-security/next-generation-firewall',
      infraNodeTypes: ['firewall'],
      specs: { throughput: '3.0 Gbps' },
      lifecycle: 'active',
      children: [],
    };

    const categoryProduct: ProductNode = {
      nodeId: 'PN-PA-CAT-001',
      depth: 1,
      depthLabel: 'Product Line',
      depthLabelKo: '제품군',
      name: 'Strata Network Security',
      nameKo: 'Strata 네트워크 보안',
      description: 'Hardware and virtual NGFWs',
      descriptionKo: '하드웨어 및 가상 차세대 방화벽',
      sourceUrl: 'https://www.paloaltonetworks.com/network-security',
      children: [leafProduct],
    };

    const catalog: VendorCatalog = {
      vendorId: 'palo-alto-networks',
      vendorName: 'Palo Alto Networks',
      vendorNameKo: '팔로알토 네트웍스',
      headquarters: 'Santa Clara, CA, USA',
      website: 'https://www.paloaltonetworks.com',
      productPageUrl: 'https://www.paloaltonetworks.com/products',
      depthStructure: ['Category', 'Product Line', 'Model'],
      depthStructureKo: ['카테고리', '제품군', '모델'],
      products: [categoryProduct],
      stats: {
        totalProducts: 42,
        maxDepth: 3,
        categoriesCount: 5,
      },
      lastCrawled: '2026-02-20',
      crawlSource: 'manual',
    };

    expect(catalog.vendorId).toBe('palo-alto-networks');
    expect(catalog.vendorName).toBe('Palo Alto Networks');
    expect(catalog.vendorNameKo).toBe('팔로알토 네트웍스');
    expect(catalog.headquarters).toBe('Santa Clara, CA, USA');
    expect(catalog.website).toContain('paloaltonetworks.com');
    expect(catalog.productPageUrl).toContain('/products');
    expect(catalog.depthStructure).toHaveLength(3);
    expect(catalog.depthStructure[0]).toBe('Category');
    expect(catalog.depthStructureKo).toHaveLength(3);
    expect(catalog.depthStructureKo[0]).toBe('카테고리');
    expect(catalog.products).toHaveLength(1);
    expect(catalog.products[0].nodeId).toBe('PN-PA-CAT-001');
    expect(catalog.products[0].children).toHaveLength(1);
    expect(catalog.products[0].children[0].nodeId).toBe('PN-PA-001');
    expect(catalog.stats.totalProducts).toBe(42);
    expect(catalog.stats.maxDepth).toBe(3);
    expect(catalog.stats.categoriesCount).toBe(5);
    expect(catalog.lastCrawled).toBe('2026-02-20');
    expect(catalog.crawlSource).toBe('manual');
  });
});

// ---------------------------------------------------------------------------
// SearchResult
// ---------------------------------------------------------------------------

describe('SearchResult', () => {
  it('should create a valid SearchResult', () => {
    const matchedNode: ProductNode = {
      nodeId: 'PN-FG-001',
      depth: 2,
      depthLabel: 'Model',
      depthLabelKo: '모델',
      name: 'FortiGate 60F',
      nameKo: 'FortiGate 60F',
      description: 'Entry-level NGFW',
      descriptionKo: '엔트리급 차세대 방화벽',
      sourceUrl: 'https://www.fortinet.com/products/next-generation-firewall',
      infraNodeTypes: ['firewall'],
      lifecycle: 'active',
      children: [],
    };

    const result: SearchResult = {
      vendorId: 'fortinet',
      vendorName: 'Fortinet',
      node: matchedNode,
      path: ['Network Security', 'FortiGate', 'FortiGate 60F'],
      matchField: 'name',
    };

    expect(result.vendorId).toBe('fortinet');
    expect(result.vendorName).toBe('Fortinet');
    expect(result.node.nodeId).toBe('PN-FG-001');
    expect(result.node.infraNodeTypes).toContain('firewall');
    expect(result.path).toHaveLength(3);
    expect(result.path[0]).toBe('Network Security');
    expect(result.path[2]).toBe('FortiGate 60F');
    expect(result.matchField).toBe('name');
  });

  it('should support all matchField values', () => {
    const node: ProductNode = {
      nodeId: 'PN-TEST-001',
      depth: 1,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Test Product',
      nameKo: '테스트 제품',
      description: 'Test description',
      descriptionKo: '테스트 설명',
      sourceUrl: 'https://example.com',
      children: [],
    };

    const matchFields: SearchResult['matchField'][] = [
      'name',
      'nameKo',
      'description',
      'descriptionKo',
      'nodeId',
      'specs',
    ];

    for (const field of matchFields) {
      const result: SearchResult = {
        vendorId: 'test-vendor',
        vendorName: 'Test Vendor',
        node,
        path: ['Test'],
        matchField: field,
      };
      expect(result.matchField).toBe(field);
    }
  });
});
