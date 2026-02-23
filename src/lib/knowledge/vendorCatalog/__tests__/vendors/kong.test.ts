import { describe, it, expect } from 'vitest';
import { kongCatalog } from '../../vendors/kong';
import {
  getAllNodes,
  getLeafNodes,
  getMaxDepth,
  findNodeById,
  getNodesByDepth,
  searchNodes,
  countLeafNodes,
  computeStats,
} from '../../queryHelpers';

// ---------------------------------------------------------------------------
// Kong Inc. Catalog -- Data Integrity Tests
// ---------------------------------------------------------------------------

describe('Kong Inc. vendor catalog', () => {
  // -------------------------------------------------------------------------
  // Top-level catalog metadata
  // -------------------------------------------------------------------------
  describe('catalog metadata', () => {
    it('should have correct vendor identity', () => {
      expect(kongCatalog.vendorId).toBe('kong');
      expect(kongCatalog.vendorName).toBe('Kong Inc.');
      expect(kongCatalog.vendorNameKo).toBe('콩 주식회사');
      expect(kongCatalog.headquarters).toBe('San Francisco, CA, USA');
    });

    it('should have valid URLs', () => {
      expect(kongCatalog.website).toBe('https://konghq.com');
      expect(kongCatalog.productPageUrl).toMatch(/^https:\/\//);
      expect(kongCatalog.crawlSource).toMatch(/^https:\/\//);
    });

    it('should have bilingual depth structure', () => {
      expect(kongCatalog.depthStructure).toEqual(['category', 'product-line', 'edition']);
      expect(kongCatalog.depthStructureKo).toEqual(['카테고리', '제품 라인', '에디션']);
      expect(kongCatalog.depthStructure).toHaveLength(kongCatalog.depthStructureKo.length);
    });

    it('should have crawl metadata', () => {
      expect(kongCatalog.lastCrawled).toBe('2026-02-23');
      expect(kongCatalog.crawlSource).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Stats validation
  // -------------------------------------------------------------------------
  describe('catalog stats', () => {
    it('should have accurate totalProducts count', () => {
      const allNodes = getAllNodes(kongCatalog.products);
      expect(kongCatalog.stats.totalProducts).toBe(allNodes.length);
    });

    it('should have accurate maxDepth', () => {
      const actualMax = getMaxDepth(kongCatalog.products);
      expect(kongCatalog.stats.maxDepth).toBe(actualMax);
    });

    it('should have accurate categoriesCount', () => {
      expect(kongCatalog.stats.categoriesCount).toBe(kongCatalog.products.length);
    });

    it('should match computeStats output', () => {
      const computed = computeStats(kongCatalog.products);
      expect(kongCatalog.stats.totalProducts).toBe(computed.totalProducts);
      expect(kongCatalog.stats.maxDepth).toBe(computed.maxDepth);
      expect(kongCatalog.stats.categoriesCount).toBe(computed.categoriesCount);
    });

    it('should have 19 total nodes', () => {
      expect(kongCatalog.stats.totalProducts).toBe(19);
    });

    it('should have maxDepth of 1', () => {
      expect(kongCatalog.stats.maxDepth).toBe(1);
    });

    it('should have 6 top-level categories', () => {
      expect(kongCatalog.stats.categoriesCount).toBe(6);
    });
  });

  // -------------------------------------------------------------------------
  // Product tree structure
  // -------------------------------------------------------------------------
  describe('product tree structure', () => {
    it('should have 6 root categories', () => {
      expect(kongCatalog.products).toHaveLength(6);
      const names = kongCatalog.products.map((p) => p.name);
      expect(names).toEqual([
        'API Gateway',
        'API Management Platform',
        'Service Mesh',
        'Kubernetes Infrastructure',
        'Developer Tools',
        'Event Gateway',
      ]);
    });

    it('should have all root nodes at depth 0', () => {
      for (const product of kongCatalog.products) {
        expect(product.depth).toBe(0);
      }
    });

    it('should have API Gateway with 3 product lines', () => {
      const node = kongCatalog.products.find((p) => p.nodeId === 'kong-api-gateway');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
    });

    it('should have API Management Platform with 3 product lines', () => {
      const node = kongCatalog.products.find((p) => p.nodeId === 'kong-api-management');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
    });

    it('should have Service Mesh with 2 product lines', () => {
      const node = kongCatalog.products.find((p) => p.nodeId === 'kong-service-mesh');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(2);
    });

    it('should have Kubernetes Infrastructure with 2 product lines', () => {
      const node = kongCatalog.products.find((p) => p.nodeId === 'kong-kubernetes');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(2);
    });

    it('should have Developer Tools with 2 product lines', () => {
      const node = kongCatalog.products.find((p) => p.nodeId === 'kong-developer-tools');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(2);
    });

    it('should have Event Gateway with 1 product line', () => {
      const node = kongCatalog.products.find((p) => p.nodeId === 'kong-event-processing');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(1);
    });
  });

  // -------------------------------------------------------------------------
  // Node ID uniqueness
  // -------------------------------------------------------------------------
  describe('node ID uniqueness', () => {
    it('should have globally unique nodeIds', () => {
      const allNodes = getAllNodes(kongCatalog.products);
      const ids = allNodes.map((n) => n.nodeId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all nodeIds prefixed with kong-', () => {
      const allNodes = getAllNodes(kongCatalog.products);
      for (const node of allNodes) {
        expect(node.nodeId).toMatch(/^kong-/);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Bilingual completeness
  // -------------------------------------------------------------------------
  describe('bilingual completeness', () => {
    it('should have non-empty name and nameKo for all nodes', () => {
      const allNodes = getAllNodes(kongCatalog.products);
      for (const node of allNodes) {
        expect(node.name.length).toBeGreaterThan(0);
        expect(node.nameKo.length).toBeGreaterThan(0);
      }
    });

    it('should have non-empty description and descriptionKo for all nodes', () => {
      const allNodes = getAllNodes(kongCatalog.products);
      for (const node of allNodes) {
        expect(node.description.length).toBeGreaterThan(0);
        expect(node.descriptionKo.length).toBeGreaterThan(0);
      }
    });

    it('should have depthLabel and depthLabelKo for all nodes', () => {
      const allNodes = getAllNodes(kongCatalog.products);
      for (const node of allNodes) {
        expect(node.depthLabel.length).toBeGreaterThan(0);
        expect(node.depthLabelKo.length).toBeGreaterThan(0);
      }
    });
  });

  // -------------------------------------------------------------------------
  // URL validation
  // -------------------------------------------------------------------------
  describe('URL validation', () => {
    it('should have full URLs (https://) for all sourceUrl fields', () => {
      const allNodes = getAllNodes(kongCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).toMatch(/^https:\/\//);
      }
    });

    it('should not have any relative URLs', () => {
      const allNodes = getAllNodes(kongCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).not.toMatch(/^\/[^/]/);
      }
    });

    it('should use English URLs (not Korean URLs)', () => {
      const allNodes = getAllNodes(kongCatalog.products);
      const koreanUrls = allNodes.filter(
        (n) => n.sourceUrl.includes('ko_kr') || n.sourceUrl.includes('/kr/ko/'),
      );
      expect(koreanUrls.map((n) => n.nodeId)).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // Depth consistency
  // -------------------------------------------------------------------------
  describe('depth consistency', () => {
    it('should have children with depth exactly parent.depth + 1', () => {
      const allNodes = getAllNodes(kongCatalog.products);
      for (const node of allNodes) {
        for (const child of node.children) {
          expect(child.depth).toBe(node.depth + 1);
        }
      }
    });

    it('should have leaf nodes with empty children arrays', () => {
      const leaves = getLeafNodes(kongCatalog.products);
      for (const leaf of leaves) {
        expect(leaf.children).toEqual([]);
      }
    });
  });

  // -------------------------------------------------------------------------
  // infraNodeType mapping
  // -------------------------------------------------------------------------
  describe('infraNodeType mapping', () => {
    it('should have infraNodeTypes on category/product-line nodes that map to InfraFlow', () => {
      const allNodes = getAllNodes(kongCatalog.products);
      const withTypes = allNodes.filter(
        (n) => n.infraNodeTypes && n.infraNodeTypes.length > 0,
      );
      expect(withTypes.length).toBeGreaterThan(0);
    });

    it('should have valid InfraNodeType values', () => {
      const validTypes = new Set([
        'firewall', 'waf', 'ids-ips', 'vpn-gateway', 'nac', 'dlp',
        'sase-gateway', 'ztna-broker', 'casb', 'siem', 'soar',
        'cctv-camera', 'nvr', 'video-server', 'access-control',
        'router', 'switch-l2', 'switch-l3', 'load-balancer', 'api-gateway', 'sd-wan', 'dns', 'cdn', 'wireless-ap',
        'web-server', 'app-server', 'db-server', 'container', 'vm', 'kubernetes',
        'kafka', 'rabbitmq', 'prometheus', 'grafana',
        'aws-vpc', 'azure-vnet', 'gcp-network', 'private-cloud',
        'san-nas', 'object-storage', 'backup', 'cache', 'elasticsearch', 'storage',
        'ldap-ad', 'sso', 'mfa', 'iam',
        'user', 'internet', 'zone',
      ]);

      const allNodes = getAllNodes(kongCatalog.products);
      for (const node of allNodes) {
        if (node.infraNodeTypes) {
          for (const type of node.infraNodeTypes) {
            expect(validTypes.has(type)).toBe(true);
          }
        }
      }
    });

    it('should have infraNodeTypes on all depth 0 and depth 1 nodes', () => {
      const allNodes = getAllNodes(kongCatalog.products);
      const depth01 = allNodes.filter((n) => n.depth <= 1);
      const withoutTypes = depth01.filter(
        (n) => !n.infraNodeTypes || n.infraNodeTypes.length === 0,
      );
      expect(withoutTypes.map((n) => n.nodeId)).toEqual([]);
    });

    it('should map API Gateway category to api-gateway and load-balancer', () => {
      const node = findNodeById(kongCatalog.products, 'kong-api-gateway');
      expect(node!.infraNodeTypes).toContain('api-gateway');
      expect(node!.infraNodeTypes).toContain('load-balancer');
    });

    it('should map Kong Gateway OSS to api-gateway type', () => {
      const node = findNodeById(kongCatalog.products, 'kong-gateway-oss');
      expect(node!.infraNodeTypes).toContain('api-gateway');
    });

    it('should map Kong Gateway Enterprise to api-gateway type', () => {
      const node = findNodeById(kongCatalog.products, 'kong-gateway-enterprise');
      expect(node!.infraNodeTypes).toContain('api-gateway');
    });

    it('should map Kong Ingress Controller to load-balancer and api-gateway', () => {
      const node = findNodeById(kongCatalog.products, 'kong-ingress-controller');
      expect(node!.infraNodeTypes).toContain('load-balancer');
      expect(node!.infraNodeTypes).toContain('api-gateway');
    });

    it('should map Kong Mesh to load-balancer and api-gateway', () => {
      const node = findNodeById(kongCatalog.products, 'kong-mesh-enterprise');
      expect(node!.infraNodeTypes).toContain('load-balancer');
      expect(node!.infraNodeTypes).toContain('api-gateway');
    });

    it('should map Event Gateway to api-gateway and kafka', () => {
      const node = findNodeById(kongCatalog.products, 'kong-event-gateway');
      expect(node!.infraNodeTypes).toContain('api-gateway');
      expect(node!.infraNodeTypes).toContain('kafka');
    });

    it('should map Kong Konnect to api-gateway type', () => {
      const node = findNodeById(kongCatalog.products, 'kong-konnect');
      expect(node!.infraNodeTypes).toContain('api-gateway');
    });
  });

  // -------------------------------------------------------------------------
  // Kong Gateway deep-dive
  // -------------------------------------------------------------------------
  describe('Kong Gateway products', () => {
    it('should have Kong Gateway OSS with open-source licensing', () => {
      const node = findNodeById(kongCatalog.products, 'kong-gateway-oss');
      expect(node).toBeDefined();
      expect(node!.licensingModel).toBe('perpetual');
      expect(node!.specs!['Engine']).toContain('NGINX');
    });

    it('should have Kong Gateway Enterprise with subscription licensing', () => {
      const node = findNodeById(kongCatalog.products, 'kong-gateway-enterprise');
      expect(node).toBeDefined();
      expect(node!.licensingModel).toBe('subscription');
      expect(node!.specs!['Throughput']).toContain('50K TPS');
    });

    it('should have Kong Gateway Enterprise with FIPS compliance', () => {
      const node = findNodeById(kongCatalog.products, 'kong-gateway-enterprise');
      expect(node!.specs!['Compliance']).toContain('FIPS 140-2');
      expect(node!.securityCapabilities).toContain('FIPS 140-2 compliance');
    });

    it('should have Kong Gateway Enterprise with 400+ plugins', () => {
      const node = findNodeById(kongCatalog.products, 'kong-gateway-enterprise');
      expect(node!.specs!['Plugins']).toContain('400+');
    });

    it('should have Kong AI Gateway for LLM management', () => {
      const node = findNodeById(kongCatalog.products, 'kong-ai-gateway');
      expect(node).toBeDefined();
      expect(node!.specs!['LLM Providers']).toContain('OpenAI');
      expect(node!.specs!['LLM Providers']).toContain('AWS Bedrock');
      expect(node!.architectureRole).toContain('AI');
    });

    it('should have Kong AI Gateway with semantic caching', () => {
      const node = findNodeById(kongCatalog.products, 'kong-ai-gateway');
      expect(node!.specs!['Semantic Caching']).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Kong Konnect deep-dive
  // -------------------------------------------------------------------------
  describe('Kong Konnect platform', () => {
    it('should have Kong Konnect with SaaS delivery', () => {
      const node = findNodeById(kongCatalog.products, 'kong-konnect');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('cloud');
      expect(node!.licensingModel).toBe('as-a-service');
    });

    it('should have Kong Konnect with multi-cloud support', () => {
      const node = findNodeById(kongCatalog.products, 'kong-konnect');
      expect(node!.specs!['Cloud Regions']).toContain('AWS');
      expect(node!.specs!['Cloud Regions']).toContain('Azure');
      expect(node!.specs!['Cloud Regions']).toContain('GCP');
    });

    it('should have Kong Developer Portal', () => {
      const node = findNodeById(kongCatalog.products, 'kong-developer-portal');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Developer Portal');
    });

    it('should have Kong Service Catalog', () => {
      const node = findNodeById(kongCatalog.products, 'kong-service-catalog');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Service Registry');
    });
  });

  // -------------------------------------------------------------------------
  // Kong Mesh deep-dive
  // -------------------------------------------------------------------------
  describe('Kong Mesh products', () => {
    it('should have Kong Mesh Enterprise with Envoy data plane', () => {
      const node = findNodeById(kongCatalog.products, 'kong-mesh-enterprise');
      expect(node).toBeDefined();
      expect(node!.specs!['Data Plane']).toContain('Envoy');
      expect(node!.specs!['Foundation']).toContain('Kuma');
    });

    it('should have Kong Mesh with mTLS security', () => {
      const node = findNodeById(kongCatalog.products, 'kong-mesh-enterprise');
      expect(node!.securityCapabilities).toContain('Mutual TLS (mTLS) by default');
    });

    it('should have Kuma OSS with CNCF graduated status', () => {
      const node = findNodeById(kongCatalog.products, 'kong-kuma-oss');
      expect(node).toBeDefined();
      expect(node!.specs!['Foundation']).toContain('CNCF');
      expect(node!.licensingModel).toBe('perpetual');
    });

    it('should have Kong Mesh with architectureRole containing Service Mesh', () => {
      const node = findNodeById(kongCatalog.products, 'kong-mesh-enterprise');
      expect(node!.architectureRole).toContain('Service Mesh');
    });
  });

  // -------------------------------------------------------------------------
  // Kubernetes Infrastructure deep-dive
  // -------------------------------------------------------------------------
  describe('Kubernetes Infrastructure products', () => {
    it('should have Kong Ingress Controller', () => {
      const node = findNodeById(kongCatalog.products, 'kong-ingress-controller');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Kubernetes Ingress');
      expect(node!.lifecycle).toBe('active');
    });

    it('should have Kong Ingress Controller with Gateway API support', () => {
      const node = findNodeById(kongCatalog.products, 'kong-ingress-controller');
      expect(node!.specs!['K8s API']).toContain('Gateway API');
    });

    it('should have Kong Gateway Operator', () => {
      const node = findNodeById(kongCatalog.products, 'kong-gateway-operator');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Kubernetes Operator');
      expect(node!.specs!['Gateway API']).toContain('Gateway API v1.0+');
    });
  });

  // -------------------------------------------------------------------------
  // Developer Tools deep-dive
  // -------------------------------------------------------------------------
  describe('Developer Tools products', () => {
    it('should have Kong Insomnia', () => {
      const node = findNodeById(kongCatalog.products, 'kong-insomnia');
      expect(node).toBeDefined();
      expect(node!.specs!['API Design']).toContain('OpenAPI');
      expect(node!.specs!['Compliance']).toContain('SOC 2');
    });

    it('should have Kong Insomnia with REST, GraphQL, gRPC support', () => {
      const node = findNodeById(kongCatalog.products, 'kong-insomnia');
      expect(node!.supportedProtocols).toContain('REST');
      expect(node!.supportedProtocols).toContain('GraphQL');
      expect(node!.supportedProtocols).toContain('gRPC');
    });

    it('should have decK CLI for GitOps configuration', () => {
      const node = findNodeById(kongCatalog.products, 'kong-deck-cli');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Configuration Management');
      expect(node!.licensingModel).toBe('perpetual');
    });
  });

  // -------------------------------------------------------------------------
  // Search functionality
  // -------------------------------------------------------------------------
  describe('search', () => {
    it('should find Kong products by English name', () => {
      const results = searchNodes(kongCatalog.products, 'Kong');
      expect(results.length).toBeGreaterThan(10);
    });

    it('should find products by Korean name (게이트웨이)', () => {
      const results = searchNodes(kongCatalog.products, '게이트웨이');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find gateway products', () => {
      const results = searchNodes(kongCatalog.products, 'Gateway');
      expect(results.length).toBeGreaterThanOrEqual(5);
    });

    it('should find mesh products', () => {
      const results = searchNodes(kongCatalog.products, 'Mesh');
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('should find Kubernetes products by keyword', () => {
      const results = searchNodes(kongCatalog.products, 'Kubernetes');
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('should find node by exact nodeId', () => {
      const node = findNodeById(kongCatalog.products, 'kong-gateway-enterprise');
      expect(node).toBeDefined();
      expect(node!.name).toBe('Kong Gateway Enterprise');
    });
  });

  // -------------------------------------------------------------------------
  // Leaf node counts
  // -------------------------------------------------------------------------
  describe('leaf node counts', () => {
    it('should match countLeafNodes helper', () => {
      const count = countLeafNodes(kongCatalog.products);
      const leaves = getLeafNodes(kongCatalog.products);
      expect(count).toBe(leaves.length);
    });

    it('should have all leaf nodes at depth 1', () => {
      const leaves = getLeafNodes(kongCatalog.products);
      for (const leaf of leaves) {
        expect(leaf.depth).toBe(1);
      }
    });

    it('should have 13 leaf nodes', () => {
      const count = countLeafNodes(kongCatalog.products);
      expect(count).toBe(13);
    });
  });

  // -------------------------------------------------------------------------
  // Depth distribution
  // -------------------------------------------------------------------------
  describe('depth distribution', () => {
    it('should have 6 nodes at depth 0', () => {
      const nodes = getNodesByDepth(kongCatalog.products, 0);
      expect(nodes).toHaveLength(6);
    });

    it('should have 13 nodes at depth 1', () => {
      const nodes = getNodesByDepth(kongCatalog.products, 1);
      expect(nodes).toHaveLength(13);
    });
  });

  // -------------------------------------------------------------------------
  // Data quality validation
  // -------------------------------------------------------------------------
  describe('data quality validation', () => {
    describe('architecture planning fields', () => {
      it('should have architectureRole and architectureRoleKo pair completeness', () => {
        const allNodes = getAllNodes(kongCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.architectureRole && !n.architectureRoleKo) ||
            (!n.architectureRole && n.architectureRoleKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor and recommendedForKo pair completeness', () => {
        const allNodes = getAllNodes(kongCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.recommendedFor && !n.recommendedForKo) ||
            (!n.recommendedFor && n.recommendedForKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor with matching length in recommendedForKo', () => {
        const allNodes = getAllNodes(kongCatalog.products);
        const lengthMismatch = allNodes.filter(
          (n) =>
            n.recommendedFor &&
            n.recommendedForKo &&
            n.recommendedFor.length !== n.recommendedForKo.length,
        );
        expect(lengthMismatch.map((n) => n.nodeId)).toEqual([]);
      });
    });

    describe('lifecycle field', () => {
      it('should have valid lifecycle values when present', () => {
        const validValues = new Set(['active', 'end-of-sale', 'end-of-life']);
        const allNodes = getAllNodes(kongCatalog.products);
        for (const node of allNodes) {
          if (node.lifecycle) {
            expect(validValues.has(node.lifecycle)).toBe(true);
          }
        }
      });

      it('should have lifecycle set on all leaf nodes', () => {
        const leaves = getLeafNodes(kongCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.lifecycle).toBeDefined();
        }
      });

      it('should have all products as active lifecycle', () => {
        const allNodes = getAllNodes(kongCatalog.products);
        const withLifecycle = allNodes.filter((n) => n.lifecycle);
        for (const node of withLifecycle) {
          expect(node.lifecycle).toBe('active');
        }
      });
    });

    describe('licensing and form factor', () => {
      it('should have licensingModel on all leaf nodes', () => {
        const leaves = getLeafNodes(kongCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.licensingModel).toBeDefined();
        }
      });

      it('should have formFactor on all leaf nodes', () => {
        const leaves = getLeafNodes(kongCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.formFactor).toBeDefined();
        }
      });

      it('should have container or cloud formFactor on all leaf nodes', () => {
        const leaves = getLeafNodes(kongCatalog.products);
        for (const leaf of leaves) {
          expect(['container', 'cloud']).toContain(leaf.formFactor);
        }
      });
    });

    describe('specs completeness', () => {
      it('should have specs on all leaf nodes', () => {
        const leaves = getLeafNodes(kongCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.specs).toBeDefined();
          expect(Object.keys(leaf.specs!).length).toBeGreaterThanOrEqual(5);
        }
      });
    });

    describe('coverage statistics', () => {
      it('should report infraNodeTypes coverage on all depth 0 and 1 nodes', () => {
        const allNodes = getAllNodes(kongCatalog.products);
        const depth01 = allNodes.filter((n) => n.depth <= 1);
        const depth01WithTypes = depth01.filter(
          (n) => n.infraNodeTypes && n.infraNodeTypes.length > 0,
        );
        expect(depth01WithTypes.length).toBe(depth01.length);
      });

      it('should report architectureRole coverage on all depth 1 nodes', () => {
        const allNodes = getAllNodes(kongCatalog.products);
        const depth1 = allNodes.filter((n) => n.depth === 1);
        const withRole = depth1.filter((n) => n.architectureRole);
        expect(withRole.length).toBe(depth1.length);
      });
    });
  });

  // -------------------------------------------------------------------------
  // Specific product spot checks
  // -------------------------------------------------------------------------
  describe('specific product spot checks', () => {
    it('should have Kong Gateway OSS with NGINX engine', () => {
      const node = findNodeById(kongCatalog.products, 'kong-gateway-oss');
      expect(node).toBeDefined();
      expect(node!.specs!['Engine']).toContain('NGINX');
      expect(node!.specs!['Throughput']).toContain('50K TPS');
    });

    it('should have Kong Gateway Enterprise with OIDC and SAML security', () => {
      const node = findNodeById(kongCatalog.products, 'kong-gateway-enterprise');
      expect(node).toBeDefined();
      expect(node!.securityCapabilities).toContain('OIDC (OpenID Connect)');
      expect(node!.securityCapabilities).toContain('SAML 2.0');
      expect(node!.securityCapabilities).toContain('Mutual TLS (mTLS)');
    });

    it('should have Kong Konnect with Terraform provider', () => {
      const node = findNodeById(kongCatalog.products, 'kong-konnect');
      expect(node).toBeDefined();
      expect(node!.specs!['Automation']).toContain('Terraform');
    });

    it('should have Kong Mesh with 10,000+ TPS benchmark', () => {
      const node = findNodeById(kongCatalog.products, 'kong-mesh-enterprise');
      expect(node).toBeDefined();
      expect(node!.specs!['Throughput']).toContain('10,000');
    });

    it('should have Kong Ingress Controller with cert-manager integration', () => {
      const node = findNodeById(kongCatalog.products, 'kong-ingress-controller');
      expect(node).toBeDefined();
      expect(node!.specs!['Integration']).toContain('cert-manager');
    });

    it('should have decK CLI with Apache 2.0 license', () => {
      const node = findNodeById(kongCatalog.products, 'kong-deck-cli');
      expect(node).toBeDefined();
      expect(node!.specs!['License']).toContain('Apache 2.0');
    });

    it('should have Kong Event Gateway with Kafka integration', () => {
      const node = findNodeById(kongCatalog.products, 'kong-event-gateway');
      expect(node).toBeDefined();
      expect(node!.specs!['Event Streaming']).toContain('Kafka');
    });

    it('should have Kong Insomnia with 350+ plugins', () => {
      const node = findNodeById(kongCatalog.products, 'kong-insomnia');
      expect(node).toBeDefined();
      expect(node!.specs!['Plugins']).toContain('350+');
    });
  });
});
