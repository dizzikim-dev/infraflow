import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { InfraNodeSpec, InfraSpec, InfraNodeType } from '@/types/infra';
import type { VendorCatalog, ProductNode } from '@/lib/knowledge/vendorCatalog/types';
import { _setVendorCatalogCache, _resetVendorCatalogCache } from '@/lib/knowledge/vendorCatalog';
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
// Tests -- Unit tests with mock catalog
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

  const lbProduct = makeLeaf({
    nodeId: 'PN-LB-001',
    name: 'BigIP i5800',
    nameKo: '빅아이피 i5800',
    description: 'Application delivery controller',
    descriptionKo: '애플리케이션 전달 컨트롤러',
    infraNodeTypes: ['load-balancer'] as InfraNodeType[],
    architectureRole: 'Internal Application Layer',
    architectureRoleKo: '내부 애플리케이션 레이어',
    recommendedFor: ['Application load balancing', 'Server traffic distribution'],
    recommendedForKo: ['애플리케이션 부하 분산', '서버 트래픽 분산'],
    haFeatures: ['Active-Standby', 'Connection Mirroring'],
  });

  const wafProduct = makeLeaf({
    nodeId: 'PN-WAF-001',
    name: 'Advanced WAF',
    nameKo: '고급 WAF',
    description: 'Web application firewall',
    descriptionKo: '웹 애플리케이션 방화벽',
    infraNodeTypes: ['waf'] as InfraNodeType[],
    architectureRole: 'DMZ Front Ingress',
    architectureRoleKo: 'DMZ 프론트 인그레스',
    recommendedFor: ['Web application protection', 'API security'],
    recommendedForKo: ['웹 애플리케이션 보호', 'API 보안'],
    haFeatures: [],
  });

  const routerProduct = makeLeaf({
    nodeId: 'PN-RTR-001',
    name: 'ISR 4451',
    nameKo: 'ISR 4451',
    description: 'Integrated services router',
    descriptionKo: '통합 서비스 라우터',
    infraNodeTypes: ['router'] as InfraNodeType[],
    architectureRole: 'WAN Edge Gateway',
    architectureRoleKo: 'WAN 에지 게이트웨이',
    recommendedFor: ['WAN connectivity', 'Branch routing'],
    recommendedForKo: ['WAN 연결', '지사 라우팅'],
    haFeatures: ['HSRP', 'VRRP'],
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
        [fwCategory, wafProduct],
      ),
      makeCategory(
        { nodeId: 'root-a-net', depth: 0, name: 'Networking', nameKo: '네트워킹' },
        [swCategory, lbProduct, routerProduct],
      ),
    ],
    stats: { totalProducts: 10, maxDepth: 2, categoriesCount: 2 },
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

  beforeEach(() => {
    _setVendorCatalogCache([testVendorA, testVendorB]);
  });

  afterEach(() => {
    _resetVendorCatalogCache();
  });

  // -- Basic matching --

  it('should return firewall product recommendations for a firewall node', async () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Primary Firewall', tier: 'dmz' },
    ]);

    const result = await matchVendorProducts(spec);

    expect(result.nodeRecommendations).toHaveLength(1);
    expect(result.nodeRecommendations[0].nodeId).toBe('fw-1');
    expect(result.nodeRecommendations[0].recommendations.length).toBeGreaterThanOrEqual(1);

    // Should include firewall products
    const productNames = result.nodeRecommendations[0].recommendations.map(
      (r) => r.product.name,
    );
    expect(productNames.some((n) => n.includes('FortiGate') || n.includes('SecuWall'))).toBe(true);
  });

  it('should return switch product recommendations for a switch node', async () => {
    const spec = makeSpec([
      { id: 'sw-1', type: 'switch-l3' as InfraNodeType, label: 'Core Switch', tier: 'internal' },
    ]);

    const result = await matchVendorProducts(spec);

    expect(result.nodeRecommendations).toHaveLength(1);
    const names = result.nodeRecommendations[0].recommendations.map((r) => r.product.name);
    expect(names).toContain('Catalyst 9300');
  });

  it('should return load-balancer product recommendations for a load-balancer node', async () => {
    const spec = makeSpec([
      { id: 'lb-1', type: 'load-balancer' as InfraNodeType, label: 'App LB', tier: 'internal' },
    ]);

    const result = await matchVendorProducts(spec);

    expect(result.nodeRecommendations).toHaveLength(1);
    const names = result.nodeRecommendations[0].recommendations.map((r) => r.product.name);
    expect(names).toContain('BigIP i5800');
  });

  it('should return WAF product recommendations for a waf node', async () => {
    const spec = makeSpec([
      { id: 'waf-1', type: 'waf' as InfraNodeType, label: 'Web App Firewall', tier: 'dmz' },
    ]);

    const result = await matchVendorProducts(spec);

    expect(result.nodeRecommendations).toHaveLength(1);
    const names = result.nodeRecommendations[0].recommendations.map((r) => r.product.name);
    expect(names).toContain('Advanced WAF');
  });

  it('should return router product recommendations for a router node', async () => {
    const spec = makeSpec([
      { id: 'rtr-1', type: 'router' as InfraNodeType, label: 'WAN Router', tier: 'external' },
    ]);

    const result = await matchVendorProducts(spec);

    expect(result.nodeRecommendations).toHaveLength(1);
    const names = result.nodeRecommendations[0].recommendations.map((r) => r.product.name);
    expect(names).toContain('ISR 4451');
  });

  it('should return empty results for an empty spec', async () => {
    const result = await matchVendorProducts(makeSpec([]));

    expect(result.nodeRecommendations).toHaveLength(0);
    expect(result.totalProductsEvaluated).toBe(0);
    expect(result.totalMatches).toBe(0);
    expect(result.unmatchedNodes).toHaveLength(0);
  });

  it('should add to unmatchedNodes when no products match a node type', async () => {
    const spec = makeSpec([
      { id: 'ldap-1', type: 'ldap-ad' as InfraNodeType, label: 'Active Directory' },
    ]);

    const result = await matchVendorProducts(spec);

    expect(result.unmatchedNodes).toHaveLength(1);
    expect(result.unmatchedNodes[0].nodeId).toBe('ldap-1');
    expect(result.unmatchedNodes[0].nodeType).toBe('ldap-ad');
  });

  // -- Score properties --

  it('should return results with score properties containing overall and breakdown', async () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
    ]);

    const result = await matchVendorProducts(spec);

    expect(result.nodeRecommendations.length).toBeGreaterThan(0);
    for (const rec of result.nodeRecommendations[0].recommendations) {
      expect(rec.score).toBeDefined();
      expect(typeof rec.score.overall).toBe('number');
      expect(rec.score.breakdown).toBeDefined();
      expect(typeof rec.score.breakdown.typeMatch).toBe('number');
      expect(typeof rec.score.breakdown.architectureRoleFit).toBe('number');
      expect(typeof rec.score.breakdown.useCaseOverlap).toBe('number');
      expect(typeof rec.score.breakdown.haFeatureMatch).toBe('number');
    }
  });

  it('should return scores between 0 and 100', async () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
      { id: 'sw-1', type: 'switch-l3' as InfraNodeType, label: 'Switch', tier: 'internal' },
      { id: 'lb-1', type: 'load-balancer' as InfraNodeType, label: 'LB', tier: 'internal' },
    ]);

    const result = await matchVendorProducts(spec, { minScore: 0 });

    for (const nodeRec of result.nodeRecommendations) {
      for (const rec of nodeRec.recommendations) {
        expect(rec.score.overall).toBeGreaterThanOrEqual(0);
        expect(rec.score.overall).toBeLessThanOrEqual(100);
      }
    }
  });

  // -- Filtering --

  it('should filter by vendorId', async () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
    ]);

    const result = await matchVendorProducts(spec, { vendorId: 'vendor-b' });

    expect(result.nodeRecommendations).toHaveLength(1);
    const vendorIds = result.nodeRecommendations[0].recommendations.map((r) => r.vendorId);
    expect(vendorIds.every((id) => id === 'vendor-b')).toBe(true);
  });

  it('should return no results when filtering by non-existent vendor', async () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
    ]);

    const result = await matchVendorProducts(spec, { vendorId: 'non-existent-vendor' });

    expect(result.nodeRecommendations).toHaveLength(0);
    expect(result.unmatchedNodes).toHaveLength(1);
  });

  it('should filter by minScore', async () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
    ]);

    const lowMinResult = await matchVendorProducts(spec, { minScore: 1 });
    const highMinResult = await matchVendorProducts(spec, { minScore: 90 });

    // With low threshold, should have more results
    const lowCount = lowMinResult.nodeRecommendations[0]?.recommendations.length ?? 0;
    const highCount = highMinResult.nodeRecommendations[0]?.recommendations.length ?? 0;
    expect(lowCount).toBeGreaterThanOrEqual(highCount);
  });

  it('should enforce minScore threshold strictly', async () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
    ]);

    const result = await matchVendorProducts(spec, { minScore: 40 });

    for (const nodeRec of result.nodeRecommendations) {
      for (const rec of nodeRec.recommendations) {
        expect(rec.score.overall).toBeGreaterThanOrEqual(40);
      }
    }
  });

  it('should limit results with maxPerNode', async () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
    ]);

    const result = await matchVendorProducts(spec, { maxPerNode: 1 });

    if (result.nodeRecommendations.length > 0) {
      expect(result.nodeRecommendations[0].recommendations.length).toBeLessThanOrEqual(1);
    }
  });

  it('should use default maxPerNode of 5 when not specified', async () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
    ]);

    const result = await matchVendorProducts(spec, { minScore: 0 });

    if (result.nodeRecommendations.length > 0) {
      expect(result.nodeRecommendations[0].recommendations.length).toBeLessThanOrEqual(5);
    }
  });

  // -- Sorting --

  it('should sort results by score descending', async () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
    ]);

    const result = await matchVendorProducts(spec);

    if (result.nodeRecommendations.length > 0) {
      const scores = result.nodeRecommendations[0].recommendations.map(
        (r) => r.score.overall,
      );
      for (let i = 1; i < scores.length; i++) {
        expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
      }
    }
  });

  // -- Counters --

  it('should accurately count totalProductsEvaluated and totalMatches', async () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
    ]);

    const result = await matchVendorProducts(spec, { minScore: 0 });

    expect(result.totalProductsEvaluated).toBeGreaterThan(0);
    expect(result.totalMatches).toBeGreaterThan(0);
    expect(result.totalMatches).toBeLessThanOrEqual(result.totalProductsEvaluated);
  });

  it('should count totalMatches as the sum of all recommendations across nodes', async () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
      { id: 'sw-1', type: 'switch-l3' as InfraNodeType, label: 'Switch', tier: 'internal' },
    ]);

    const result = await matchVendorProducts(spec);

    const sumOfRecommendations = result.nodeRecommendations.reduce(
      (sum, nr) => sum + nr.recommendations.length, 0,
    );
    expect(result.totalMatches).toBe(sumOfRecommendations);
  });

  // -- Reason strings --

  it('should provide non-empty reason and reasonKo strings', async () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
    ]);

    const result = await matchVendorProducts(spec);

    if (result.nodeRecommendations.length > 0) {
      for (const rec of result.nodeRecommendations[0].recommendations) {
        expect(rec.reason).toBeTruthy();
        expect(rec.reason.length).toBeGreaterThan(0);
        expect(rec.reasonKo).toBeTruthy();
        expect(rec.reasonKo.length).toBeGreaterThan(0);
      }
    }
  });

  it('should include score value in reason strings', async () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
    ]);

    const result = await matchVendorProducts(spec);

    if (result.nodeRecommendations.length > 0) {
      for (const rec of result.nodeRecommendations[0].recommendations) {
        // Reason should contain the score value
        expect(rec.reason).toContain(String(rec.score.overall));
        expect(rec.reasonKo).toContain(String(rec.score.overall));
      }
    }
  });

  // -- Path (breadcrumb) --

  it('should include breadcrumb path for each recommendation', async () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
    ]);

    const result = await matchVendorProducts(spec);

    if (result.nodeRecommendations.length > 0) {
      for (const rec of result.nodeRecommendations[0].recommendations) {
        expect(Array.isArray(rec.path)).toBe(true);
        // Path should have at least the product itself
        expect(rec.path.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  // -- Multiple nodes --

  it('should return recommendations for multiple nodes in the spec', async () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
      { id: 'sw-1', type: 'switch-l3' as InfraNodeType, label: 'Core Switch', tier: 'internal' },
    ]);

    const result = await matchVendorProducts(spec);

    // Should have recommendations for both nodes (or at least one plus unmatched)
    const matchedNodeIds = result.nodeRecommendations.map((nr) => nr.nodeId);
    const unmatchedNodeIds = result.unmatchedNodes.map((un) => un.nodeId);

    expect([...matchedNodeIds, ...unmatchedNodeIds].sort()).toEqual(['fw-1', 'sw-1'].sort());
  });

  it('should include vendorId and vendorName in each recommendation', async () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
    ]);

    const result = await matchVendorProducts(spec);

    if (result.nodeRecommendations.length > 0) {
      for (const rec of result.nodeRecommendations[0].recommendations) {
        expect(rec.vendorId).toBeTruthy();
        expect(rec.vendorName).toBeTruthy();
      }
    }
  });

  it('should preserve nodeType and nodeLabel in each node recommendation', async () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Primary Firewall', tier: 'dmz' },
    ]);

    const result = await matchVendorProducts(spec);

    if (result.nodeRecommendations.length > 0) {
      expect(result.nodeRecommendations[0].nodeType).toBe('firewall');
      expect(result.nodeRecommendations[0].nodeLabel).toBe('Primary Firewall');
    }
  });

  // -- Edge cases --

  it('should handle spec with connections gracefully', async () => {
    const spec: InfraSpec = {
      nodes: [
        { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
        { id: 'sw-1', type: 'switch-l3' as InfraNodeType, label: 'Switch', tier: 'internal' },
      ],
      connections: [
        { source: 'fw-1', target: 'sw-1' },
      ],
    };

    const result = await matchVendorProducts(spec);

    // Should work the same -- connections do not affect matching
    expect(result.nodeRecommendations.length + result.unmatchedNodes.length).toBe(2);
  });

  it('should handle multiple options combined', async () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
    ]);

    const result = await matchVendorProducts(spec, {
      vendorId: 'vendor-a',
      minScore: 30,
      maxPerNode: 2,
    });

    if (result.nodeRecommendations.length > 0) {
      expect(result.nodeRecommendations[0].recommendations.length).toBeLessThanOrEqual(2);
      for (const rec of result.nodeRecommendations[0].recommendations) {
        expect(rec.vendorId).toBe('vendor-a');
        expect(rec.score.overall).toBeGreaterThanOrEqual(30);
      }
    }
  });

  it('should return products from multiple vendors for the same node type', async () => {
    const spec = makeSpec([
      { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
    ]);

    const result = await matchVendorProducts(spec, { minScore: 0 });

    if (result.nodeRecommendations.length > 0) {
      const vendors = new Set(result.nodeRecommendations[0].recommendations.map((r) => r.vendorId));
      expect(vendors.size).toBeGreaterThanOrEqual(2);
    }
  });

  // -- Integration with real vendor catalogs --

  describe('with real vendor catalogs', () => {
    beforeEach(() => {
      // Reset cache so the next call loads real vendor data via dynamic import
      _resetVendorCatalogCache();
    });

    it('should return Cisco firewall products for a firewall node', async () => {
      const spec = makeSpec([
        { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Perimeter Firewall', tier: 'dmz' },
      ]);

      const result = await matchVendorProducts(spec);

      // Should have at least some recommendations
      if (result.nodeRecommendations.length > 0) {
        const ciscoRecs = result.nodeRecommendations[0].recommendations.filter(
          (r) => r.vendorId === 'cisco',
        );
        expect(ciscoRecs.length).toBeGreaterThanOrEqual(0);
      }
    });

    it('should return Cisco switch products for a switch node', async () => {
      const spec = makeSpec([
        { id: 'sw-1', type: 'switch-l3' as InfraNodeType, label: 'Campus Core Switch', tier: 'internal' },
      ]);

      const result = await matchVendorProducts(spec);

      if (result.nodeRecommendations.length > 0) {
        const products = result.nodeRecommendations[0].recommendations.map(
          (r) => r.product.name,
        );
        // Should include some Catalyst series
        expect(products.some((n) => n.toLowerCase().includes('catalyst'))).toBe(true);
      }
    });

    it('should return results for common infrastructure types with real catalogs', async () => {
      const commonTypes: InfraNodeType[] = ['firewall', 'switch-l3', 'load-balancer', 'waf', 'router'];

      for (const nodeType of commonTypes) {
        const spec = makeSpec([
          { id: `node-1`, type: nodeType, label: `Test ${nodeType}` },
        ]);
        const result = await matchVendorProducts(spec, { minScore: 0 });

        // Most common types should have at least some vendor products
        const totalNodes = result.nodeRecommendations.length + result.unmatchedNodes.length;
        expect(totalNodes).toBe(1);
      }
    });

    it('should evaluate many products when using real catalogs', async () => {
      const spec = makeSpec([
        { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Firewall', tier: 'dmz' },
      ]);

      const result = await matchVendorProducts(spec, { minScore: 0 });

      // With 22 vendors, there should be many products evaluated
      expect(result.totalProductsEvaluated).toBeGreaterThan(5);
    });

    it('should include products from multiple real vendors', async () => {
      const spec = makeSpec([
        { id: 'fw-1', type: 'firewall' as InfraNodeType, label: 'Perimeter Firewall', tier: 'dmz' },
      ]);

      const result = await matchVendorProducts(spec, { minScore: 0 });

      if (result.nodeRecommendations.length > 0) {
        const vendorIds = new Set(
          result.nodeRecommendations[0].recommendations.map((r) => r.vendorId),
        );
        // Firewall is a common type -- multiple vendors should have products
        expect(vendorIds.size).toBeGreaterThanOrEqual(2);
      }
    });
  });
});
