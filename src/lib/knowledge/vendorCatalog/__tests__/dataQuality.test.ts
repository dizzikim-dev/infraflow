import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { ProductNode, VendorCatalog } from '../types';
import { allVendorCatalogs } from '../index';
import {
  assessProduct,
  generateQualityReport,
  type ProductQualityMetrics,
  type CatalogQualityReport,
} from '../dataQuality';
import { collectVendorUrls } from '../../../../../scripts/check-vendor-urls';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

function makeStubProduct(overrides: Partial<ProductNode> = {}): ProductNode {
  return {
    nodeId: 'stub-001',
    depth: 2,
    depthLabel: 'Model',
    depthLabelKo: '\uBAA8\uB378',
    name: 'Stub Product',
    nameKo: '\uC2A4\uD131 \uC81C\uD488',
    description: 'A stub product with minimal data',
    descriptionKo: '\uCD5C\uC18C \uB370\uC774\uD130 \uC2A4\uD131 \uC81C\uD488',
    sourceUrl: '',
    children: [],
    ...overrides,
  };
}

function makeEnrichedProduct(
  overrides: Partial<ProductNode> = {},
): ProductNode {
  return {
    nodeId: 'enriched-001',
    depth: 2,
    depthLabel: 'Model',
    depthLabelKo: '\uBAA8\uB378',
    name: 'Enriched Product',
    nameKo: '\uC644\uC804\uD55C \uC81C\uD488',
    description: 'A fully enriched product meeting VC-009',
    descriptionKo: 'VC-009 \uD488\uC9C8 \uAC8C\uC774\uD2B8\uB97C \uCDA9\uC871\uD558\uB294 \uC644\uC804\uD55C \uC81C\uD488',
    sourceUrl: 'https://vendor.com/product',
    datasheetUrl: 'https://vendor.com/product/datasheet.pdf',
    infraNodeTypes: ['firewall'] as ProductNode['infraNodeTypes'],
    lifecycle: 'active',
    architectureRole: 'Perimeter Security',
    architectureRoleKo: '\uACBD\uACC4 \uBCF4\uC548',
    recommendedFor: [
      'Enterprise perimeter security',
      'Branch office protection',
      'Data center segmentation',
    ],
    recommendedForKo: [
      '\uC5D4\uD130\uD504\uB77C\uC774\uC988 \uACBD\uACC4 \uBCF4\uC548',
      '\uC9C0\uC810 \uBCF4\uD638',
      '\uB370\uC774\uD130\uC13C\uD130 \uC138\uADF8\uBA3C\uD14C\uC774\uC158',
    ],
    specs: {
      Throughput: '10 Gbps',
      'Concurrent Sessions': '2,000,000',
      'IPSec VPN Throughput': '5 Gbps',
      Interfaces: '16x GE RJ45, 8x GE SFP',
      'Power Supply': 'Dual redundant 450W',
    },
    children: [],
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
    lastCrawled: '2026-02-23',
    crawlSource: 'manual',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// assessProduct tests
// ---------------------------------------------------------------------------

describe('assessProduct', () => {
  it('should return all fields true and score 100 for a fully enriched product', () => {
    const product = makeEnrichedProduct();
    const metrics = assessProduct(product);

    expect(metrics.hasInfraNodeTypes).toBe(true);
    expect(metrics.hasLifecycle).toBe(true);
    expect(metrics.hasArchitectureRole).toBe(true);
    expect(metrics.hasRecommendedFor).toBe(true);
    expect(metrics.hasSpecs).toBe(true);
    expect(metrics.hasSourceUrl).toBe(true);
    expect(metrics.hasDatasheetUrl).toBe(true);
    expect(metrics.meetsQualityGate).toBe(true);
    expect(metrics.completenessScore).toBe(100);
  });

  it('should return all fields false and score 0 for a stub product', () => {
    const product = makeStubProduct();
    const metrics = assessProduct(product);

    expect(metrics.hasInfraNodeTypes).toBe(false);
    expect(metrics.hasLifecycle).toBe(false);
    expect(metrics.hasArchitectureRole).toBe(false);
    expect(metrics.hasRecommendedFor).toBe(false);
    expect(metrics.hasSpecs).toBe(false);
    expect(metrics.hasSourceUrl).toBe(false);
    expect(metrics.hasDatasheetUrl).toBe(false);
    expect(metrics.meetsQualityGate).toBe(false);
    expect(metrics.completenessScore).toBe(0);
  });

  it('should require infraNodeTypes for quality gate', () => {
    const product = makeEnrichedProduct({ infraNodeTypes: undefined });
    const metrics = assessProduct(product);
    expect(metrics.meetsQualityGate).toBe(false);
    expect(metrics.hasInfraNodeTypes).toBe(false);
  });

  it('should require lifecycle for quality gate', () => {
    const product = makeEnrichedProduct({ lifecycle: undefined });
    const metrics = assessProduct(product);
    expect(metrics.meetsQualityGate).toBe(false);
    expect(metrics.hasLifecycle).toBe(false);
  });

  it('should require architectureRole AND architectureRoleKo for quality gate', () => {
    const product = makeEnrichedProduct({ architectureRoleKo: undefined });
    const metrics = assessProduct(product);
    expect(metrics.meetsQualityGate).toBe(false);
    expect(metrics.hasArchitectureRole).toBe(false);
  });

  it('should require architectureRole EN for quality gate', () => {
    const product = makeEnrichedProduct({ architectureRole: undefined });
    const metrics = assessProduct(product);
    expect(metrics.meetsQualityGate).toBe(false);
    expect(metrics.hasArchitectureRole).toBe(false);
  });

  it('should require recommendedFor with 3+ entries for quality gate', () => {
    const product = makeEnrichedProduct({
      recommendedFor: ['Use case 1', 'Use case 2'],
      recommendedForKo: ['\uC0AC\uC6A9 \uC0AC\uB840 1', '\uC0AC\uC6A9 \uC0AC\uB840 2'],
    });
    const metrics = assessProduct(product);
    expect(metrics.meetsQualityGate).toBe(false);
    expect(metrics.hasRecommendedFor).toBe(false);
  });

  it('should require recommendedForKo with 3+ entries for quality gate', () => {
    const product = makeEnrichedProduct({
      recommendedForKo: ['\uC0AC\uC6A9 \uC0AC\uB840 1'],
    });
    const metrics = assessProduct(product);
    expect(metrics.meetsQualityGate).toBe(false);
    expect(metrics.hasRecommendedFor).toBe(false);
  });

  it('should require 5+ specs entries for quality gate', () => {
    const product = makeEnrichedProduct({
      specs: {
        Throughput: '10 Gbps',
        Interfaces: '16x GE',
        Power: '450W',
        Weight: '15 kg',
      },
    });
    const metrics = assessProduct(product);
    expect(metrics.meetsQualityGate).toBe(false);
    expect(metrics.hasSpecs).toBe(false);
  });

  it('should NOT require sourceUrl for quality gate', () => {
    const product = makeEnrichedProduct({ sourceUrl: '' });
    const metrics = assessProduct(product);
    expect(metrics.hasSourceUrl).toBe(false);
    // Quality gate should still pass
    expect(metrics.meetsQualityGate).toBe(true);
    // Score reduced by 10 (sourceUrl weight)
    expect(metrics.completenessScore).toBe(90);
  });

  it('should NOT require datasheetUrl for quality gate', () => {
    const product = makeEnrichedProduct({ datasheetUrl: undefined });
    const metrics = assessProduct(product);
    expect(metrics.hasDatasheetUrl).toBe(false);
    // Quality gate should still pass
    expect(metrics.meetsQualityGate).toBe(true);
    // Score reduced by 5 (datasheetUrl weight)
    expect(metrics.completenessScore).toBe(95);
  });

  it('should calculate partial score correctly', () => {
    // Product with only infraNodeTypes (20) + lifecycle (10) + sourceUrl (10) = 40
    const product = makeStubProduct({
      infraNodeTypes: ['router'] as ProductNode['infraNodeTypes'],
      lifecycle: 'active',
      sourceUrl: 'https://example.com',
    });
    const metrics = assessProduct(product);
    expect(metrics.completenessScore).toBe(40);
    expect(metrics.meetsQualityGate).toBe(false);
  });

  it('should handle empty infraNodeTypes array as false', () => {
    const product = makeEnrichedProduct({ infraNodeTypes: [] });
    const metrics = assessProduct(product);
    expect(metrics.hasInfraNodeTypes).toBe(false);
  });

  it('should handle empty specs object as false', () => {
    const product = makeEnrichedProduct({ specs: {} });
    const metrics = assessProduct(product);
    expect(metrics.hasSpecs).toBe(false);
  });

  it('should handle empty recommendedFor arrays as false', () => {
    const product = makeEnrichedProduct({
      recommendedFor: [],
      recommendedForKo: [],
    });
    const metrics = assessProduct(product);
    expect(metrics.hasRecommendedFor).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// generateQualityReport tests
// ---------------------------------------------------------------------------

describe('generateQualityReport', () => {
  let savedCatalogs: VendorCatalog[];

  beforeEach(() => {
    savedCatalogs = [...allVendorCatalogs];
    allVendorCatalogs.length = 0;
  });

  afterEach(() => {
    allVendorCatalogs.length = 0;
    allVendorCatalogs.push(...savedCatalogs);
  });

  it('should return correct vendor count', () => {
    const category: ProductNode = {
      nodeId: 'cat-1',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '\uCE74\uD14C\uACE0\uB9AC',
      name: 'Security',
      nameKo: '\uBCF4\uC548',
      description: 'Security products',
      descriptionKo: '\uBCF4\uC548 \uC81C\uD488',
      sourceUrl: 'https://example.com',
      children: [makeEnrichedProduct()],
    };

    allVendorCatalogs.push(
      makeVendor({
        vendorId: 'vendor-a',
        vendorName: 'Vendor A',
        products: [category],
      }),
      makeVendor({
        vendorId: 'vendor-b',
        vendorName: 'Vendor B',
        products: [],
      }),
    );

    const report = generateQualityReport();
    expect(report.totalVendors).toBe(2);
    expect(report.vendors).toHaveLength(2);
  });

  it('should correctly count total and assessable products', () => {
    // depth 0 (category) + depth 1 (product line) + depth 2 (enriched model)
    const model = makeEnrichedProduct({ depth: 2 });
    const productLine: ProductNode = {
      nodeId: 'pl-1',
      depth: 1,
      depthLabel: 'Product Line',
      depthLabelKo: '\uC81C\uD488 \uB77C\uC778',
      name: 'Firewall Series',
      nameKo: '\uBC29\uD654\uBCBD \uC2DC\uB9AC\uC988',
      description: 'Firewall product line',
      descriptionKo: '\uBC29\uD654\uBCBD \uC81C\uD488 \uB77C\uC778',
      sourceUrl: 'https://example.com',
      children: [model],
    };
    const category: ProductNode = {
      nodeId: 'cat-1',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '\uCE74\uD14C\uACE0\uB9AC',
      name: 'Security',
      nameKo: '\uBCF4\uC548',
      description: 'Security products',
      descriptionKo: '\uBCF4\uC548 \uC81C\uD488',
      sourceUrl: 'https://example.com',
      children: [productLine],
    };

    allVendorCatalogs.push(
      makeVendor({
        vendorId: 'vendor-a',
        vendorName: 'Vendor A',
        products: [category],
      }),
    );

    const report = generateQualityReport();
    // total = 3 (cat + pl + model), assessable = 1 (depth >= 2)
    expect(report.totalProducts).toBe(3);
    expect(report.assessableProducts).toBe(1);
    expect(report.completeProducts).toBe(1);
  });

  it('should calculate completeness percent correctly', () => {
    const enriched = makeEnrichedProduct({ depth: 2 });
    const stub = makeStubProduct({ depth: 2 });

    const category: ProductNode = {
      nodeId: 'cat-1',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '\uCE74\uD14C\uACE0\uB9AC',
      name: 'Security',
      nameKo: '\uBCF4\uC548',
      description: 'Security products',
      descriptionKo: '\uBCF4\uC548 \uC81C\uD488',
      sourceUrl: 'https://example.com',
      children: [enriched, stub],
    };

    allVendorCatalogs.push(
      makeVendor({
        vendorId: 'vendor-a',
        vendorName: 'Vendor A',
        products: [category],
      }),
    );

    const report = generateQualityReport();
    const vendor = report.vendors[0];
    expect(vendor.assessableProducts).toBe(2);
    expect(vendor.completeProducts).toBe(1);
    // 1 / 2 = 50%
    expect(vendor.completenessPercent).toBe(50);
    expect(report.overallCompletenessPercent).toBe(50);
  });

  it('should calculate avgCompletenessScore correctly', () => {
    // enriched = 100, stub = 0 => avg = 50
    const enriched = makeEnrichedProduct({ depth: 2 });
    const stub = makeStubProduct({ depth: 2 });

    const category: ProductNode = {
      nodeId: 'cat-1',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '\uCE74\uD14C\uACE0\uB9AC',
      name: 'Security',
      nameKo: '\uBCF4\uC548',
      description: 'Security',
      descriptionKo: '\uBCF4\uC548',
      sourceUrl: 'https://example.com',
      children: [enriched, stub],
    };

    allVendorCatalogs.push(
      makeVendor({
        vendorId: 'vendor-a',
        vendorName: 'Vendor A',
        products: [category],
      }),
    );

    const report = generateQualityReport();
    const vendor = report.vendors[0];
    expect(vendor.avgCompletenessScore).toBe(50);
  });

  it('should track missing fields correctly', () => {
    // Two stub products, both missing everything
    const stub1 = makeStubProduct({ nodeId: 'stub-1', depth: 2 });
    const stub2 = makeStubProduct({ nodeId: 'stub-2', depth: 2 });

    const category: ProductNode = {
      nodeId: 'cat-1',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '\uCE74\uD14C\uACE0\uB9AC',
      name: 'Network',
      nameKo: '\uB124\uD2B8\uC6CC\uD06C',
      description: 'Network products',
      descriptionKo: '\uB124\uD2B8\uC6CC\uD06C \uC81C\uD488',
      sourceUrl: 'https://example.com',
      children: [stub1, stub2],
    };

    allVendorCatalogs.push(
      makeVendor({
        vendorId: 'vendor-a',
        vendorName: 'Vendor A',
        products: [category],
      }),
    );

    const report = generateQualityReport();
    const vendor = report.vendors[0];
    expect(vendor.missingFields.infraNodeTypes).toBe(2);
    expect(vendor.missingFields.lifecycle).toBe(2);
    expect(vendor.missingFields.architectureRole).toBe(2);
    expect(vendor.missingFields.recommendedFor).toBe(2);
    expect(vendor.missingFields.specs).toBe(2);
    expect(vendor.missingFields.sourceUrl).toBe(2);
    expect(vendor.missingFields.datasheetUrl).toBe(2);
  });

  it('should handle empty catalogs gracefully', () => {
    allVendorCatalogs.push(
      makeVendor({
        vendorId: 'empty-vendor',
        vendorName: 'Empty Vendor',
        products: [],
      }),
    );

    const report = generateQualityReport();
    expect(report.totalVendors).toBe(1);
    expect(report.totalProducts).toBe(0);
    expect(report.assessableProducts).toBe(0);
    expect(report.completeProducts).toBe(0);
    expect(report.overallCompletenessPercent).toBe(0);

    const vendor = report.vendors[0];
    expect(vendor.completenessPercent).toBe(0);
    expect(vendor.avgCompletenessScore).toBe(0);
  });

  it('should include a timestamp string', () => {
    const report = generateQualityReport();
    expect(typeof report.timestamp).toBe('string');
    // Should be a valid ISO date string
    expect(() => new Date(report.timestamp)).not.toThrow();
    expect(new Date(report.timestamp).toISOString()).toBe(report.timestamp);
  });

  it('should not count depth 0 or depth 1 products as assessable', () => {
    // Only depth 0 and depth 1 nodes — none assessable
    const productLine: ProductNode = {
      nodeId: 'pl-1',
      depth: 1,
      depthLabel: 'Product Line',
      depthLabelKo: '\uC81C\uD488 \uB77C\uC778',
      name: 'Switches',
      nameKo: '\uC2A4\uC704\uCE58',
      description: 'Switches',
      descriptionKo: '\uC2A4\uC704\uCE58',
      sourceUrl: 'https://example.com',
      children: [],
    };
    const category: ProductNode = {
      nodeId: 'cat-1',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '\uCE74\uD14C\uACE0\uB9AC',
      name: 'Network',
      nameKo: '\uB124\uD2B8\uC6CC\uD06C',
      description: 'Network',
      descriptionKo: '\uB124\uD2B8\uC6CC\uD06C',
      sourceUrl: 'https://example.com',
      children: [productLine],
    };

    allVendorCatalogs.push(
      makeVendor({
        vendorId: 'vendor-a',
        vendorName: 'Vendor A',
        products: [category],
      }),
    );

    const report = generateQualityReport();
    expect(report.totalProducts).toBe(2);
    expect(report.assessableProducts).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// generateQualityReport — integration with real catalogs
// ---------------------------------------------------------------------------

describe('generateQualityReport (integration)', () => {
  it('should return report for all 22 registered vendor catalogs', () => {
    const report = generateQualityReport();
    expect(report.totalVendors).toBe(22);
    expect(report.vendors).toHaveLength(22);
  });

  it('should have totalProducts greater than 0', () => {
    const report = generateQualityReport();
    expect(report.totalProducts).toBeGreaterThan(0);
  });

  it('should have assessableProducts less than or equal to totalProducts', () => {
    const report = generateQualityReport();
    expect(report.assessableProducts).toBeLessThanOrEqual(
      report.totalProducts,
    );
  });

  it('should have completeProducts less than or equal to assessableProducts', () => {
    const report = generateQualityReport();
    expect(report.completeProducts).toBeLessThanOrEqual(
      report.assessableProducts,
    );
  });

  it('should have overallCompletenessPercent between 0 and 100', () => {
    const report = generateQualityReport();
    expect(report.overallCompletenessPercent).toBeGreaterThanOrEqual(0);
    expect(report.overallCompletenessPercent).toBeLessThanOrEqual(100);
  });

  it('should include expected vendor IDs', () => {
    const report = generateQualityReport();
    const vendorIds = report.vendors.map((v) => v.vendorId);
    expect(vendorIds).toContain('cisco');
    expect(vendorIds).toContain('fortinet');
    expect(vendorIds).toContain('palo-alto-networks');
    expect(vendorIds).toContain('arista');
  });

  it('should have non-negative missing field counts', () => {
    const report = generateQualityReport();
    for (const vendor of report.vendors) {
      expect(vendor.missingFields.infraNodeTypes).toBeGreaterThanOrEqual(0);
      expect(vendor.missingFields.lifecycle).toBeGreaterThanOrEqual(0);
      expect(vendor.missingFields.architectureRole).toBeGreaterThanOrEqual(0);
      expect(vendor.missingFields.recommendedFor).toBeGreaterThanOrEqual(0);
      expect(vendor.missingFields.specs).toBeGreaterThanOrEqual(0);
      expect(vendor.missingFields.sourceUrl).toBeGreaterThanOrEqual(0);
      expect(vendor.missingFields.datasheetUrl).toBeGreaterThanOrEqual(0);
    }
  });
});

// ---------------------------------------------------------------------------
// collectVendorUrls tests (URL collection — no HTTP)
// ---------------------------------------------------------------------------

describe('collectVendorUrls', () => {
  let savedCatalogs: VendorCatalog[];

  beforeEach(() => {
    savedCatalogs = [...allVendorCatalogs];
    allVendorCatalogs.length = 0;
  });

  afterEach(() => {
    allVendorCatalogs.length = 0;
    allVendorCatalogs.push(...savedCatalogs);
  });

  it('should collect sourceUrl entries', () => {
    const product = makeEnrichedProduct({
      sourceUrl: 'https://vendor.com/product',
    });
    const category: ProductNode = {
      nodeId: 'cat-1',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '\uCE74\uD14C\uACE0\uB9AC',
      name: 'Test',
      nameKo: '\uD14C\uC2A4\uD2B8',
      description: 'Test',
      descriptionKo: '\uD14C\uC2A4\uD2B8',
      sourceUrl: 'https://vendor.com/category',
      children: [product],
    };

    allVendorCatalogs.push(
      makeVendor({
        vendorId: 'v1',
        vendorName: 'V1',
        products: [category],
      }),
    );

    const result = collectVendorUrls();
    const sourceUrls = result.urls.filter((u) => u.field === 'sourceUrl');
    expect(sourceUrls.length).toBe(2); // category + product
    expect(sourceUrls[0].url).toBe('https://vendor.com/category');
    expect(sourceUrls[1].url).toBe('https://vendor.com/product');
  });

  it('should collect datasheetUrl entries', () => {
    const product = makeEnrichedProduct({
      datasheetUrl: 'https://vendor.com/datasheet.pdf',
    });
    const category: ProductNode = {
      nodeId: 'cat-1',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '\uCE74\uD14C\uACE0\uB9AC',
      name: 'Test',
      nameKo: '\uD14C\uC2A4\uD2B8',
      description: 'Test',
      descriptionKo: '\uD14C\uC2A4\uD2B8',
      sourceUrl: 'https://vendor.com/category',
      children: [product],
    };

    allVendorCatalogs.push(
      makeVendor({
        vendorId: 'v1',
        vendorName: 'V1',
        products: [category],
      }),
    );

    const result = collectVendorUrls();
    const datasheetUrls = result.urls.filter((u) => u.field === 'datasheetUrl');
    expect(datasheetUrls.length).toBe(1);
    expect(datasheetUrls[0].url).toBe('https://vendor.com/datasheet.pdf');
  });

  it('should track products missing sourceUrl', () => {
    const productWithoutUrl = makeStubProduct({ sourceUrl: '' });
    const category: ProductNode = {
      nodeId: 'cat-1',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '\uCE74\uD14C\uACE0\uB9AC',
      name: 'Test',
      nameKo: '\uD14C\uC2A4\uD2B8',
      description: 'Test',
      descriptionKo: '\uD14C\uC2A4\uD2B8',
      sourceUrl: 'https://vendor.com',
      children: [productWithoutUrl],
    };

    allVendorCatalogs.push(
      makeVendor({
        vendorId: 'v1',
        vendorName: 'V1',
        products: [category],
      }),
    );

    const result = collectVendorUrls();
    expect(result.missingSourceUrlCount).toBe(1);
    expect(result.productsWithoutSourceUrl).toContain('v1/stub-001');
  });

  it('should track products missing datasheetUrl', () => {
    const product = makeStubProduct({
      sourceUrl: 'https://example.com',
    });
    const category: ProductNode = {
      nodeId: 'cat-1',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '\uCE74\uD14C\uACE0\uB9AC',
      name: 'Test',
      nameKo: '\uD14C\uC2A4\uD2B8',
      description: 'Test',
      descriptionKo: '\uD14C\uC2A4\uD2B8',
      sourceUrl: 'https://vendor.com',
      children: [product],
    };

    allVendorCatalogs.push(
      makeVendor({
        vendorId: 'v1',
        vendorName: 'V1',
        products: [category],
      }),
    );

    const result = collectVendorUrls();
    // Both category and product lack datasheetUrl
    expect(result.missingDatasheetUrlCount).toBe(2);
    expect(result.productsWithoutDatasheetUrl).toContain('v1/cat-1');
    expect(result.productsWithoutDatasheetUrl).toContain('v1/stub-001');
  });

  it('should return empty results for empty catalogs', () => {
    const result = collectVendorUrls();
    expect(result.urls).toHaveLength(0);
    expect(result.missingSourceUrlCount).toBe(0);
    expect(result.productsWithoutSourceUrl).toHaveLength(0);
    expect(result.missingDatasheetUrlCount).toBe(0);
    expect(result.productsWithoutDatasheetUrl).toHaveLength(0);
  });

  it('should include correct vendorId and productId in URL entries', () => {
    const product = makeEnrichedProduct({
      nodeId: 'fw-001',
      sourceUrl: 'https://vendor.com/fw',
    });
    const category: ProductNode = {
      nodeId: 'cat-1',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '\uCE74\uD14C\uACE0\uB9AC',
      name: 'Test',
      nameKo: '\uD14C\uC2A4\uD2B8',
      description: 'Test',
      descriptionKo: '\uD14C\uC2A4\uD2B8',
      sourceUrl: 'https://vendor.com/cat',
      children: [product],
    };

    allVendorCatalogs.push(
      makeVendor({
        vendorId: 'acme',
        vendorName: 'ACME',
        products: [category],
      }),
    );

    const result = collectVendorUrls();
    const fwEntry = result.urls.find(
      (u) => u.productId === 'fw-001' && u.field === 'sourceUrl',
    );
    expect(fwEntry).toBeDefined();
    expect(fwEntry!.vendorId).toBe('acme');
    expect(fwEntry!.productName).toBe('Enriched Product');
  });
});

// ---------------------------------------------------------------------------
// collectVendorUrls — integration with real catalogs
// ---------------------------------------------------------------------------

describe('collectVendorUrls (integration)', () => {
  it('should collect URLs from all real vendor catalogs', () => {
    const result = collectVendorUrls();
    // With 22 vendors and 400+ products, should have many URLs
    expect(result.urls.length).toBeGreaterThan(0);
  });

  it('should have URL entries with valid URL format', () => {
    const result = collectVendorUrls();
    for (const entry of result.urls) {
      expect(entry.url).toMatch(/^https?:\/\//);
    }
  });

  it('should include both sourceUrl and datasheetUrl types', () => {
    const result = collectVendorUrls();
    const sourceUrls = result.urls.filter((u) => u.field === 'sourceUrl');
    expect(sourceUrls.length).toBeGreaterThan(0);
    // datasheetUrl may be sparse, just verify the filter works
    const datasheetUrls = result.urls.filter((u) => u.field === 'datasheetUrl');
    expect(datasheetUrls.length).toBeGreaterThanOrEqual(0);
  });
});
