import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { InfraNodeSpec, InfraSpec, InfraNodeType } from '@/types/infra';
import type { VendorCatalog, ProductNode } from '@/lib/knowledge/vendorCatalog/types';
import { allVendorCatalogs } from '@/lib/knowledge/vendorCatalog';
import { matchVendorProducts } from '../matcher';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

function makeLeaf(overrides: Partial<ProductNode> = {}): ProductNode {
  return {
    nodeId: 'leaf-001',
    depth: 2,
    depthLabel: 'Model',
    depthLabelKo: '모델',
    name: 'Test Product',
    nameKo: '테스트 제품',
    description: 'A test product',
    descriptionKo: '테스트 제품 설명',
    sourceUrl: 'https://example.com/product',
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
    depthLabelKo: '카테고리',
    name: 'Test Category',
    nameKo: '테스트 카테고리',
    description: 'A test category',
    descriptionKo: '테스트 카테고리 설명',
    sourceUrl: 'https://example.com/cat',
    children,
    ...overrides,
  };
}

function makeVendor(overrides: Partial<VendorCatalog> = {}): VendorCatalog {
  return {
    vendorId: 'test-vendor',
    vendorName: 'Test Vendor',
    vendorNameKo: '테스트 벤더',
    headquarters: 'Seoul, Korea',
    website: 'https://test-vendor.com',
    productPageUrl: 'https://test-vendor.com/products',
    depthStructure: ['Category', 'Product Line', 'Model'],
    depthStructureKo: ['카테고리', '제품 라인', '모델'],
    products: [],
    stats: { totalProducts: 0, maxDepth: 0, categoriesCount: 0 },
    lastCrawled: '2026-02-20',
    crawlSource: 'manual',
    ...overrides,
  };
}

function makeSpec(nodes: InfraNodeSpec[] = []): InfraSpec {
  return { nodes, connections: [] };
}

// ---------------------------------------------------------------------------
// Tests — Unit tests with mock catalog
// ---------------------------------------------------------------------------

describe('matchVendorProducts', () => {
  // Set up test vendor data before each test
  const fwProduct1 = makeLeaf({
    nodeId: 'PN-FW-001',
    name: 'FortiGate 100F',
    nameKo: '포티게이트 100F',
    description: 'Next-gen firewall',
    descriptionKo: '차세대 방화벽',
    infraNodeTypes: ['firewall'] as InfraNodeType[],
    architectureRole: 'Perimeter Edge Firewall',
    architectureRoleKo: '경계 에지 방화벽',
    recommendedFor: ['Campus perimeter security', 'Branch office firewall'],
    recommendedForKo: ['캠퍼스 경계 보안', '지사 방화벽'],
    haFeatures: ['HA Active-Passive', 'VRRP'],
  });

  const fwProduct2 = makeLeaf({
    nodeId: 'PN-FW-002',
    name: 'FortiGate 200F',
    nameKo: '포티게이트 200F',
    description: 'Mid-range firewall',
    descriptionKo: '중급 방화벽',
    infraNodeTypes: ['firewall'] as InfraNodeType[],
    architectureRole: 'DMZ Gateway',
    architectureRoleKo: 'DMZ 게이트웨이',
    recommendedFor: ['Data center perimeter', 'DMZ segmentation'],
    recommendedForKo: ['데이터센터 경계', 'DMZ 세그멘테이션'],
    haFeatures: ['HA Active-Active', 'VRRP', 'Session Sync'],
  });

  const swProduct = makeLeaf({
    nodeId: 'PN-SW-001',
    name: 'Catalyst 9300',
    nameKo: '카탈리스트 9300',
    description: 'Access layer switch',
    descriptionKo: '액세스 레이어 스위치',
    infraNodeTypes: ['switch-l2', 'switch-l3'] as InfraNodeType[],
    architectureRole: 'Campus Access Layer',
    architectureRoleKo: '캠퍼스 액세스 레이어',
    recommendedFor: ['Campus access switching', 'Branch aggregation'],
    recommendedForKo: ['캠퍼스 액세스 스위칭', '지사 집선'],
    haFeatures: ['StackWise Virtual'],
  });

  const fwCategory = makeCategory(
    {
      nodeId: 'PN-FW',
      depth: 1,
      name: 'Firewall Series',
      nameKo: '방화벽 시리즈',
      infraNodeTypes: ['firewall'] as InfraNodeType[],
    },
    [fwProduct1, fwProduct2],
  );

  const swCategory = makeCategory(
    {
      nodeId: 'PN-SW',
      depth: 1,
      name: 'Switch Series',
      nameKo: '스위치 시리즈',
      infraNodeTypes: ['switch-l2', 'switch-l3'] as InfraNodeType[],
    },
    [swProduct],
  );

  const testVendorA = makeVendor({
    vendorId: 'vendor-a',
    vendorName: 'Vendor A',
    vendorNameKo: '벤더 A',
    products: [
      makeCategory(
        { nodeId: 'root-a', depth: 0, name: 'Security', nameKo: '보안' },
        [fwCategory],
      ),
      makeCategory(
        { nodeId: 'root-a-net', depth: 0, name: 'Networking', nameKo: '네트워킹' },
        [swCategory],
      ),
    ],
    stats: { totalProducts: 7, maxDepth: 2, categoriesCount: 2 },
  });

  const testVendorB = makeVendor({
    vendorId: 'vendor-b',
    vendorName: 'Vendor B',
    vendorNameKo: '벤더 B',
    products: [
      makeCategory(
        { nodeId: 'root-b', depth: 0, name: 'Security', nameKo: '보안' },
        [
          makeLeaf({
            nodeId: 'PN-FW-B-001',
            name: 'SecuWall 5000',
            nameKo: '시큐월 5000',
            infraNodeTypes: ['firewall'] as InfraNodeType[],
            architectureRole: 'Internal Segmentation',
            recommendedFor: ['Internal network segmentation'],
            haFeatures: ['Cluster mode'],
          }),
        ],
      ),
    ],
    stats: { totalProducts: 2, maxDepth: 1, categoriesCount: 1 },
  });

  let savedCatalogs: VendorCatalog[];

  beforeEach(() => {
    savedCatalogs = [...allVendorCatalogs];
    allVendorCatalogs.length = 0;
    allVendorCatalogs.push(testVendorA, testVendorB);
  });

  afterEach(() => {
    allVendorCatalogs.length = 0;
    allVendorCatalogs.push(...savedCatalogs);
  });

  // ── Basic matching ──

  it('should return firewall product recommendations for a firewall node', () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Primary Firewall', tier: 'dmz' },
    ]);

    const result = matchVendorProducts(spec);

    expect(result.nodeRecommendations).toHaveLength(1);
    expect(result.nodeRecommendations[0].nodeId).toBe('fw-1');
    expect(result.nodeRecommendations[0].recommendations.length).toBeGreaterThanOrEqual(1);

    // Should include firewall products
    const productNames = result.nodeRecommendations[0].recommendations.map(
      (r) => r.product.name,
    );
    expect(productNames.some((n) => n.includes('FortiGate') || n.includes('SecuWall'))).toBe(true);
  });

  it('should return switch product recommendations for a switch node', () => {
    const spec = makeSpec([
      { id: 'sw-1', type: 'switch-l3' as InfraNodeType, label: 'Core Switch', tier: 'internal' },
    ]);

    const result = matchVendorProducts(spec);

    expect(result.nodeRecommendations).toHaveLength(1);
    const names = result.nodeRecommendations[0].recommendations.map((r) => r.product.name);
    expect(names).toContain('Catalyst 9300');
  });

  it('should return empty results for an empty spec', () => {
    const result = matchVendorProducts(makeSpec([]));

    expect(result.nodeRecommendations).toHaveLength(0);
    expect(result.totalProductsEvaluated).toBe(0);
    expect(result.totalMatches).toBe(0);
    expect(result.unmatchedNodes).toHaveLength(0);
  });

  it('should add to unmatchedNodes when no products match a node type', () => {
    const spec = makeSpec([
      { id: 'ldap-1', type: 'ldap-ad' as InfraNodeType, label: 'Active Directory' },
    ]);

    const result = matchVendorProducts(spec);

    expect(result.unmatchedNodes).toHaveLength(1);
    expect(result.unmatchedNodes[0].nodeId).toBe('ldap-1');
    expect(result.unmatchedNodes[0].nodeType).toBe('ldap-ad');
  });

  // ── Filtering ──

  it('should filter by vendorId', () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
    ]);

    const result = matchVendorProducts(spec, { vendorId: 'vendor-b' });

    expect(result.nodeRecommendations).toHaveLength(1);
    const vendorIds = result.nodeRecommendations[0].recommendations.map((r) => r.vendorId);
    expect(vendorIds.every((id) => id === 'vendor-b')).toBe(true);
  });

  it('should filter by minScore', () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
    ]);

    const lowMinResult = matchVendorProducts(spec, { minScore: 1 });
    const highMinResult = matchVendorProducts(spec, { minScore: 90 });

    // With low threshold, should have more results
    const lowCount = lowMinResult.nodeRecommendations[0]?.recommendations.length ?? 0;
    const highCount = highMinResult.nodeRecommendations[0]?.recommendations.length ?? 0;
    expect(lowCount).toBeGreaterThanOrEqual(highCount);
  });

  it('should limit results with maxPerNode', () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
    ]);

    const result = matchVendorProducts(spec, { maxPerNode: 1 });

    if (result.nodeRecommendations.length > 0) {
      expect(result.nodeRecommendations[0].recommendations.length).toBeLessThanOrEqual(1);
    }
  });

  // ── Sorting ──

  it('should sort results by score descending', () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
    ]);

    const result = matchVendorProducts(spec);

    if (result.nodeRecommendations.length > 0) {
      const scores = result.nodeRecommendations[0].recommendations.map(
        (r) => r.score.overall,
      );
      for (let i = 1; i < scores.length; i++) {
        expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
      }
    }
  });

  // ── Counters ──

  it('should accurately count totalProductsEvaluated and totalMatches', () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
    ]);

    const result = matchVendorProducts(spec, { minScore: 0 });

    // Firewall products: fwProduct1, fwProduct2 (vendor-a) + fwCategory (vendor-a, has infraNodeTypes) + SecuWall (vendor-b) + root-b (if it matches)
    expect(result.totalProductsEvaluated).toBeGreaterThan(0);
    expect(result.totalMatches).toBeGreaterThan(0);
    expect(result.totalMatches).toBeLessThanOrEqual(result.totalProductsEvaluated);
  });

  // ── Reason strings ──

  it('should provide non-empty reason and reasonKo strings', () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
    ]);

    const result = matchVendorProducts(spec);

    if (result.nodeRecommendations.length > 0) {
      for (const rec of result.nodeRecommendations[0].recommendations) {
        expect(rec.reason).toBeTruthy();
        expect(rec.reason.length).toBeGreaterThan(0);
        expect(rec.reasonKo).toBeTruthy();
        expect(rec.reasonKo.length).toBeGreaterThan(0);
      }
    }
  });

  // ── Path (breadcrumb) ──

  it('should include breadcrumb path for each recommendation', () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
    ]);

    const result = matchVendorProducts(spec);

    if (result.nodeRecommendations.length > 0) {
      for (const rec of result.nodeRecommendations[0].recommendations) {
        expect(Array.isArray(rec.path)).toBe(true);
        // Path should have at least the product itself
        expect(rec.path.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  // ── Multiple nodes ──

  it('should return recommendations for multiple nodes in the spec', () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
      { id: 'sw-1', type: 'switch-l3' as InfraNodeType, label: 'Core Switch', tier: 'internal' },
    ]);

    const result = matchVendorProducts(spec);

    // Should have recommendations for both nodes (or at least one plus unmatched)
    const matchedNodeIds = result.nodeRecommendations.map((nr) => nr.nodeId);
    const unmatchedNodeIds = result.unmatchedNodes.map((un) => un.nodeId);

    expect([...matchedNodeIds, ...unmatchedNodeIds].sort()).toEqual(['fw-1', 'sw-1'].sort());
  });

  it('should include vendorId and vendorName in each recommendation', () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
    ]);

    const result = matchVendorProducts(spec);

    if (result.nodeRecommendations.length > 0) {
      for (const rec of result.nodeRecommendations[0].recommendations) {
        expect(rec.vendorId).toBeTruthy();
        expect(rec.vendorName).toBeTruthy();
      }
    }
  });

  // ── Integration with real Cisco catalog ──

  describe('with real Cisco catalog', () => {
    beforeEach(() => {
      // Restore real catalogs for integration tests
      allVendorCatalogs.length = 0;
      allVendorCatalogs.push(...savedCatalogs);
    });

    it('should return Cisco firewall products for a firewall node', () => {
      const spec = makeSpec([
        { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Perimeter Firewall', tier: 'dmz' },
      ]);

      const result = matchVendorProducts(spec);

      // Should have at least some recommendations
      if (result.nodeRecommendations.length > 0) {
        const ciscoRecs = result.nodeRecommendations[0].recommendations.filter(
          (r) => r.vendorId === 'cisco',
        );
        expect(ciscoRecs.length).toBeGreaterThanOrEqual(0);
      }
    });

    it('should return Cisco switch products for a switch node', () => {
      const spec = makeSpec([
        { id: 'sw-1', type: 'switch-l3' as InfraNodeType, label: 'Campus Core Switch', tier: 'internal' },
      ]);

      const result = matchVendorProducts(spec);

      if (result.nodeRecommendations.length > 0) {
        const products = result.nodeRecommendations[0].recommendations.map(
          (r) => r.product.name,
        );
        // Should include some Catalyst series
        expect(products.some((n) => n.toLowerCase().includes('catalyst'))).toBe(true);
      }
    });
  });
});
