import { describe, it, expect } from 'vitest';
import { f5Catalog } from '../../vendors/f5';
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
// F5 Networks Catalog -- Data Integrity Tests
// ---------------------------------------------------------------------------

describe('F5 Networks vendor catalog', () => {
  // -------------------------------------------------------------------------
  // Top-level catalog metadata
  // -------------------------------------------------------------------------
  describe('catalog metadata', () => {
    it('should have correct vendor identity', () => {
      expect(f5Catalog.vendorId).toBe('f5-networks');
      expect(f5Catalog.vendorName).toBe('F5 Networks');
      expect(f5Catalog.vendorNameKo).toBe('F5 네트웍스');
      expect(f5Catalog.headquarters).toBe('Seattle, WA, USA');
    });

    it('should have valid URLs', () => {
      expect(f5Catalog.website).toBe('https://www.f5.com');
      expect(f5Catalog.productPageUrl).toMatch(/^https:\/\//);
      expect(f5Catalog.crawlSource).toMatch(/^https:\/\//);
    });

    it('should have bilingual depth structure', () => {
      expect(f5Catalog.depthStructure).toEqual(['category', 'product-line', 'series']);
      expect(f5Catalog.depthStructureKo).toEqual(['카테고리', '제품 라인', '시리즈']);
      expect(f5Catalog.depthStructure).toHaveLength(f5Catalog.depthStructureKo.length);
    });

    it('should have crawl metadata', () => {
      expect(f5Catalog.lastCrawled).toBe('2026-02-22');
      expect(f5Catalog.crawlSource).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Stats validation
  // -------------------------------------------------------------------------
  describe('catalog stats', () => {
    it('should have accurate totalProducts count', () => {
      const allNodes = getAllNodes(f5Catalog.products);
      expect(f5Catalog.stats.totalProducts).toBe(allNodes.length);
    });

    it('should have accurate maxDepth', () => {
      const actualMax = getMaxDepth(f5Catalog.products);
      expect(f5Catalog.stats.maxDepth).toBe(actualMax);
    });

    it('should have accurate categoriesCount', () => {
      expect(f5Catalog.stats.categoriesCount).toBe(f5Catalog.products.length);
    });

    it('should match computeStats output', () => {
      const computed = computeStats(f5Catalog.products);
      expect(f5Catalog.stats.totalProducts).toBe(computed.totalProducts);
      expect(f5Catalog.stats.maxDepth).toBe(computed.maxDepth);
      expect(f5Catalog.stats.categoriesCount).toBe(computed.categoriesCount);
    });

    it('should have 4 top-level categories', () => {
      expect(f5Catalog.stats.categoriesCount).toBe(4);
    });

    it('should have maxDepth of 2', () => {
      expect(f5Catalog.stats.maxDepth).toBe(2);
    });
  });

  // -------------------------------------------------------------------------
  // Product tree structure
  // -------------------------------------------------------------------------
  describe('product tree structure', () => {
    it('should have 4 root categories', () => {
      expect(f5Catalog.products).toHaveLength(4);
      const names = f5Catalog.products.map((p) => p.name);
      expect(names).toEqual([
        'Application Delivery & Security',
        'NGINX',
        'Distributed Cloud Services',
        'Security',
      ]);
    });

    it('should have all root nodes at depth 0', () => {
      for (const product of f5Catalog.products) {
        expect(product.depth).toBe(0);
      }
    });

    it('should have Application Delivery & Security with 2 product lines', () => {
      const ads = f5Catalog.products.find((p) => p.nodeId === 'f5-app-delivery-security');
      expect(ads).toBeDefined();
      expect(ads!.children).toHaveLength(2);
    });

    it('should have NGINX with 6 product lines', () => {
      const nginx = f5Catalog.products.find((p) => p.nodeId === 'f5-nginx');
      expect(nginx).toBeDefined();
      expect(nginx!.children).toHaveLength(6);
    });

    it('should have Distributed Cloud Services with 6 product lines', () => {
      const dc = f5Catalog.products.find((p) => p.nodeId === 'f5-distributed-cloud');
      expect(dc).toBeDefined();
      expect(dc!.children).toHaveLength(6);
    });

    it('should have Security with 6 product lines', () => {
      const sec = f5Catalog.products.find((p) => p.nodeId === 'f5-security');
      expect(sec).toBeDefined();
      expect(sec!.children).toHaveLength(6);
    });
  });

  // -------------------------------------------------------------------------
  // Node ID uniqueness
  // -------------------------------------------------------------------------
  describe('node ID uniqueness', () => {
    it('should have globally unique nodeIds', () => {
      const allNodes = getAllNodes(f5Catalog.products);
      const ids = allNodes.map((n) => n.nodeId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all nodeIds prefixed with f5-', () => {
      const allNodes = getAllNodes(f5Catalog.products);
      for (const node of allNodes) {
        expect(node.nodeId).toMatch(/^f5-/);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Bilingual completeness
  // -------------------------------------------------------------------------
  describe('bilingual completeness', () => {
    it('should have non-empty name and nameKo for all nodes', () => {
      const allNodes = getAllNodes(f5Catalog.products);
      for (const node of allNodes) {
        expect(node.name.length).toBeGreaterThan(0);
        expect(node.nameKo.length).toBeGreaterThan(0);
      }
    });

    it('should have non-empty description and descriptionKo for all nodes', () => {
      const allNodes = getAllNodes(f5Catalog.products);
      for (const node of allNodes) {
        expect(node.description.length).toBeGreaterThan(0);
        expect(node.descriptionKo.length).toBeGreaterThan(0);
      }
    });

    it('should have depthLabel and depthLabelKo for all nodes', () => {
      const allNodes = getAllNodes(f5Catalog.products);
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
      const allNodes = getAllNodes(f5Catalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).toMatch(/^https:\/\//);
      }
    });

    it('should not have any relative URLs', () => {
      const allNodes = getAllNodes(f5Catalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).not.toMatch(/^\/[^/]/);
      }
    });

    it('should use English URLs (not Korean URLs)', () => {
      const allNodes = getAllNodes(f5Catalog.products);
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
      const allNodes = getAllNodes(f5Catalog.products);
      for (const node of allNodes) {
        for (const child of node.children) {
          expect(child.depth).toBe(node.depth + 1);
        }
      }
    });

    it('should have leaf nodes with empty children arrays', () => {
      const leaves = getLeafNodes(f5Catalog.products);
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
      const allNodes = getAllNodes(f5Catalog.products);
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

      const allNodes = getAllNodes(f5Catalog.products);
      for (const node of allNodes) {
        if (node.infraNodeTypes) {
          for (const type of node.infraNodeTypes) {
            expect(validTypes.has(type)).toBe(true);
          }
        }
      }
    });

    it('should have infraNodeTypes on all depth 0 and depth 1 nodes', () => {
      const allNodes = getAllNodes(f5Catalog.products);
      const depth01 = allNodes.filter((n) => n.depth <= 1);
      const withoutTypes = depth01.filter(
        (n) => !n.infraNodeTypes || n.infraNodeTypes.length === 0,
      );
      expect(withoutTypes.map((n) => n.nodeId)).toEqual([]);
    });

    it('should map Application Delivery & Security to load-balancer and waf', () => {
      const node = findNodeById(f5Catalog.products, 'f5-app-delivery-security');
      expect(node!.infraNodeTypes).toContain('load-balancer');
      expect(node!.infraNodeTypes).toContain('waf');
    });

    it('should map BIG-IP to load-balancer and waf', () => {
      const node = findNodeById(f5Catalog.products, 'f5-bigip');
      expect(node!.infraNodeTypes).toContain('load-balancer');
      expect(node!.infraNodeTypes).toContain('waf');
    });

    it('should map NGINX to load-balancer, api-gateway, and web-server', () => {
      const node = findNodeById(f5Catalog.products, 'f5-nginx');
      expect(node!.infraNodeTypes).toContain('load-balancer');
      expect(node!.infraNodeTypes).toContain('api-gateway');
      expect(node!.infraNodeTypes).toContain('web-server');
    });

    it('should map Distributed Cloud Services to load-balancer, cdn, and waf', () => {
      const node = findNodeById(f5Catalog.products, 'f5-distributed-cloud');
      expect(node!.infraNodeTypes).toContain('load-balancer');
      expect(node!.infraNodeTypes).toContain('cdn');
      expect(node!.infraNodeTypes).toContain('waf');
    });

    it('should map Security category to waf', () => {
      const node = findNodeById(f5Catalog.products, 'f5-security');
      expect(node!.infraNodeTypes).toContain('waf');
    });
  });

  // -------------------------------------------------------------------------
  // BIG-IP series deep-dive
  // -------------------------------------------------------------------------
  describe('BIG-IP product line', () => {
    it('should have BIG-IP with 18 series (iSeries + rSeries + VIPRION + VE)', () => {
      const node = findNodeById(f5Catalog.products, 'f5-bigip');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(18);
    });

    it('should have all 7 iSeries models', () => {
      const iSeriesIds = [
        'f5-bigip-i2600', 'f5-bigip-i4600', 'f5-bigip-i5600',
        'f5-bigip-i7600', 'f5-bigip-i10600', 'f5-bigip-i11600', 'f5-bigip-i15600',
      ];
      for (const id of iSeriesIds) {
        const node = findNodeById(f5Catalog.products, id);
        expect(node).toBeDefined();
        expect(node!.depth).toBe(2);
        expect(node!.lifecycle).toBe('end-of-sale');
      }
    });

    it('should have all 8 rSeries models', () => {
      const rSeriesIds = [
        'f5-bigip-r2600', 'f5-bigip-r4600', 'f5-bigip-r5600', 'f5-bigip-r5900',
        'f5-bigip-r10600', 'f5-bigip-r10900', 'f5-bigip-r12600', 'f5-bigip-r12900',
      ];
      for (const id of rSeriesIds) {
        const node = findNodeById(f5Catalog.products, id);
        expect(node).toBeDefined();
        expect(node!.depth).toBe(2);
        expect(node!.lifecycle).toBe('active');
      }
    });

    it('should have VIPRION B2250 and B4450', () => {
      const viprionIds = ['f5-bigip-viprion-b2250', 'f5-bigip-viprion-b4450'];
      for (const id of viprionIds) {
        const node = findNodeById(f5Catalog.products, id);
        expect(node).toBeDefined();
        expect(node!.depth).toBe(2);
        expect(node!.formFactor).toBe('chassis');
      }
    });

    it('should have BIG-IP Virtual Edition', () => {
      const node = findNodeById(f5Catalog.products, 'f5-bigip-ve');
      expect(node).toBeDefined();
      expect(node!.depth).toBe(2);
      expect(node!.formFactor).toBe('virtual');
      expect(node!.lifecycle).toBe('active');
    });

    it('should have iSeries models with replacedBy pointing to rSeries', () => {
      const node = findNodeById(f5Catalog.products, 'f5-bigip-i2600');
      expect(node!.replacedBy).toBe('f5-bigip-r2600');

      const node2 = findNodeById(f5Catalog.products, 'f5-bigip-i15600');
      expect(node2!.replacedBy).toBe('f5-bigip-r12900');
    });

    it('should have rSeries models with F5OS multi-tenancy info in specs', () => {
      const node = findNodeById(f5Catalog.products, 'f5-bigip-r5900');
      expect(node).toBeDefined();
      expect(node!.specs).toBeDefined();
      expect(node!.specs!['Multi-Tenancy']).toMatch(/F5OS/);
    });
  });

  // -------------------------------------------------------------------------
  // BIG-IP Next deep-dive
  // -------------------------------------------------------------------------
  describe('BIG-IP Next product line', () => {
    it('should have BIG-IP Next with 3 series', () => {
      const node = findNodeById(f5Catalog.products, 'f5-bigip-next');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
    });

    it('should have CNF, SPK, and Access', () => {
      const nextIds = ['f5-bigip-next-cnf', 'f5-bigip-next-spk', 'f5-bigip-next-access'];
      for (const id of nextIds) {
        const node = findNodeById(f5Catalog.products, id);
        expect(node).toBeDefined();
        expect(node!.depth).toBe(2);
        expect(node!.lifecycle).toBe('active');
      }
    });

    it('should have CNF with container form factor', () => {
      const node = findNodeById(f5Catalog.products, 'f5-bigip-next-cnf');
      expect(node!.formFactor).toBe('container');
    });
  });

  // -------------------------------------------------------------------------
  // NGINX deep-dive
  // -------------------------------------------------------------------------
  describe('NGINX product line', () => {
    it('should have NGINX Plus with load-balancer and api-gateway types', () => {
      const node = findNodeById(f5Catalog.products, 'f5-nginx-plus');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('load-balancer');
      expect(node!.infraNodeTypes).toContain('api-gateway');
      expect(node!.lifecycle).toBe('active');
    });

    it('should have NGINX App Protect WAF with waf type', () => {
      const node = findNodeById(f5Catalog.products, 'f5-nginx-app-protect-waf');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('waf');
    });

    it('should have NGINX Ingress Controller with container form factor', () => {
      const node = findNodeById(f5Catalog.products, 'f5-nginx-ingress-controller');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('container');
    });

    it('should have NGINX One with cloud form factor', () => {
      const node = findNodeById(f5Catalog.products, 'f5-nginx-one');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('cloud');
      expect(node!.licensingModel).toBe('as-a-service');
    });

    it('should have NGINX Gateway Fabric', () => {
      const node = findNodeById(f5Catalog.products, 'f5-nginx-gateway-fabric');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('api-gateway');
    });
  });

  // -------------------------------------------------------------------------
  // Distributed Cloud Services deep-dive
  // -------------------------------------------------------------------------
  describe('Distributed Cloud Services', () => {
    it('should have XC WAF with cloud form factor', () => {
      const node = findNodeById(f5Catalog.products, 'f5-xc-waf');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('waf');
      expect(node!.formFactor).toBe('cloud');
    });

    it('should have XC DDoS Protection', () => {
      const node = findNodeById(f5Catalog.products, 'f5-xc-ddos');
      expect(node).toBeDefined();
      expect(node!.lifecycle).toBe('active');
    });

    it('should have XC App Connect', () => {
      const node = findNodeById(f5Catalog.products, 'f5-xc-app-connect');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('cloud');
    });

    it('should have XC DNS with dns type', () => {
      const node = findNodeById(f5Catalog.products, 'f5-xc-dns');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('dns');
    });

    it('should have XC Bot Defense', () => {
      const node = findNodeById(f5Catalog.products, 'f5-xc-bot-defense');
      expect(node).toBeDefined();
      expect(node!.securityCapabilities).toBeDefined();
      expect(node!.securityCapabilities!.length).toBeGreaterThan(0);
    });

    it('should have XC CDN with cdn type', () => {
      const node = findNodeById(f5Catalog.products, 'f5-xc-cdn');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('cdn');
    });
  });

  // -------------------------------------------------------------------------
  // Security category deep-dive
  // -------------------------------------------------------------------------
  describe('Security category', () => {
    it('should have BIG-IP Advanced WAF', () => {
      const node = findNodeById(f5Catalog.products, 'f5-bigip-advanced-waf');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('waf');
      expect(node!.securityCapabilities).toBeDefined();
      expect(node!.securityCapabilities!.length).toBeGreaterThanOrEqual(5);
    });

    it('should have BIG-IP AFM', () => {
      const node = findNodeById(f5Catalog.products, 'f5-bigip-afm');
      expect(node).toBeDefined();
      expect(node!.lifecycle).toBe('active');
    });

    it('should have BIG-IP APM', () => {
      const node = findNodeById(f5Catalog.products, 'f5-bigip-apm');
      expect(node).toBeDefined();
      expect(node!.securityCapabilities).toBeDefined();
    });

    it('should have BIG-IP SSL Orchestrator', () => {
      const node = findNodeById(f5Catalog.products, 'f5-bigip-sslo');
      expect(node).toBeDefined();
      expect(node!.lifecycle).toBe('active');
    });

    it('should have Silverline DDoS Protection', () => {
      const node = findNodeById(f5Catalog.products, 'f5-silverline-ddos');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('cloud');
    });

    it('should have Shape Security', () => {
      const node = findNodeById(f5Catalog.products, 'f5-shape-security');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('cloud');
      expect(node!.licensingModel).toBe('as-a-service');
    });
  });

  // -------------------------------------------------------------------------
  // Search functionality
  // -------------------------------------------------------------------------
  describe('search', () => {
    it('should find BIG-IP products by English name', () => {
      const results = searchNodes(f5Catalog.products, 'BIG-IP');
      expect(results.length).toBeGreaterThan(15);
    });

    it('should find NGINX products by name', () => {
      const results = searchNodes(f5Catalog.products, 'NGINX');
      expect(results.length).toBeGreaterThanOrEqual(6);
    });

    it('should find WAF products', () => {
      const results = searchNodes(f5Catalog.products, 'WAF');
      expect(results.length).toBeGreaterThanOrEqual(3);
    });

    it('should find rSeries products', () => {
      const results = searchNodes(f5Catalog.products, 'rSeries');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find products by Korean description', () => {
      const results = searchNodes(f5Catalog.products, '부하 분산');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find node by exact nodeId', () => {
      const node = findNodeById(f5Catalog.products, 'f5-bigip-r5900');
      expect(node).toBeDefined();
      expect(node!.name).toBe('BIG-IP r5900');
    });
  });

  // -------------------------------------------------------------------------
  // Leaf node counts
  // -------------------------------------------------------------------------
  describe('leaf node counts', () => {
    it('should match countLeafNodes helper', () => {
      const count = countLeafNodes(f5Catalog.products);
      const leaves = getLeafNodes(f5Catalog.products);
      expect(count).toBe(leaves.length);
    });

    it('should have all leaf nodes at depth 1 or 2', () => {
      const leaves = getLeafNodes(f5Catalog.products);
      for (const leaf of leaves) {
        expect(leaf.depth).toBeGreaterThanOrEqual(1);
        expect(leaf.depth).toBeLessThanOrEqual(2);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Depth distribution
  // -------------------------------------------------------------------------
  describe('depth distribution', () => {
    it('should have 4 nodes at depth 0', () => {
      const nodes = getNodesByDepth(f5Catalog.products, 0);
      expect(nodes).toHaveLength(4);
    });

    it('should have 20 nodes at depth 1', () => {
      const nodes = getNodesByDepth(f5Catalog.products, 1);
      expect(nodes).toHaveLength(20);
    });

    it('should have 21 nodes at depth 2', () => {
      const nodes = getNodesByDepth(f5Catalog.products, 2);
      expect(nodes).toHaveLength(21);
    });
  });

  // -------------------------------------------------------------------------
  // Data quality validation
  // -------------------------------------------------------------------------
  describe('data quality validation', () => {
    describe('architecture planning fields', () => {
      it('should have architectureRole and architectureRoleKo pair completeness', () => {
        const allNodes = getAllNodes(f5Catalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.architectureRole && !n.architectureRoleKo) ||
            (!n.architectureRole && n.architectureRoleKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor and recommendedForKo pair completeness', () => {
        const allNodes = getAllNodes(f5Catalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.recommendedFor && !n.recommendedForKo) ||
            (!n.recommendedFor && n.recommendedForKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor with matching length in recommendedForKo', () => {
        const allNodes = getAllNodes(f5Catalog.products);
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
        const allNodes = getAllNodes(f5Catalog.products);
        for (const node of allNodes) {
          if (node.lifecycle) {
            expect(validValues.has(node.lifecycle)).toBe(true);
          }
        }
      });
    });

    describe('coverage statistics', () => {
      it('should report infraNodeTypes coverage on all depth 0 and 1 nodes', () => {
        const allNodes = getAllNodes(f5Catalog.products);
        const depth01 = allNodes.filter((n) => n.depth <= 1);
        const depth01WithTypes = depth01.filter(
          (n) => n.infraNodeTypes && n.infraNodeTypes.length > 0,
        );
        expect(depth01WithTypes.length).toBe(depth01.length);
      });

      it('should report architectureRole coverage', () => {
        const allNodes = getAllNodes(f5Catalog.products);
        const withRole = allNodes.filter((n) => n.architectureRole);
        expect(withRole.length).toBeGreaterThan(0);
      });
    });
  });

  // -------------------------------------------------------------------------
  // Specific product spot checks
  // -------------------------------------------------------------------------
  describe('specific product spot checks', () => {
    it('should have BIG-IP r5900 with correct specs', () => {
      const node = findNodeById(f5Catalog.products, 'f5-bigip-r5900');
      expect(node).toBeDefined();
      expect(node!.name).toBe('BIG-IP r5900');
      expect(node!.specs).toBeDefined();
      expect(node!.specs!['L4 Throughput']).toBe('100 Gbps');
    });

    it('should have BIG-IP r12600 as flagship rSeries with 400 Gbps', () => {
      const node = findNodeById(f5Catalog.products, 'f5-bigip-r12600');
      expect(node).toBeDefined();
      expect(node!.maxThroughput).toBe('400 Gbps');
      expect(node!.specs!['L4 Throughput']).toBe('400 Gbps');
    });

    it('should have VIPRION B4450 with chassis info', () => {
      const node = findNodeById(f5Catalog.products, 'f5-bigip-viprion-b4450');
      expect(node).toBeDefined();
      expect(node!.specs!['Max Aggregate L4']).toMatch(/Tbps/);
    });

    it('should have NGINX Plus with supported protocols', () => {
      const node = findNodeById(f5Catalog.products, 'f5-nginx-plus');
      expect(node).toBeDefined();
      expect(node!.supportedProtocols).toBeDefined();
      expect(node!.supportedProtocols!).toContain('HTTP/HTTPS');
      expect(node!.supportedProtocols!).toContain('gRPC');
    });

    it('should have BIG-IP Advanced WAF with security capabilities', () => {
      const node = findNodeById(f5Catalog.products, 'f5-bigip-advanced-waf');
      expect(node).toBeDefined();
      expect(node!.securityCapabilities).toBeDefined();
      expect(node!.securityCapabilities!.length).toBeGreaterThanOrEqual(5);
    });

    it('should have BIG-IP product line with comprehensive HA features', () => {
      const node = findNodeById(f5Catalog.products, 'f5-bigip');
      expect(node).toBeDefined();
      expect(node!.haFeatures).toBeDefined();
      expect(node!.haFeatures!).toContain('Active-Active clustering');
      expect(node!.haFeatures!).toContain('Active-Standby HA');
      expect(node!.haFeatures!).toContain('Connection mirroring');
    });

    it('should have BIG-IP product line with comprehensive supported protocols', () => {
      const node = findNodeById(f5Catalog.products, 'f5-bigip');
      expect(node).toBeDefined();
      expect(node!.supportedProtocols).toBeDefined();
      expect(node!.supportedProtocols!).toContain('HTTP/HTTPS');
      expect(node!.supportedProtocols!).toContain('SSL/TLS');
      expect(node!.supportedProtocols!).toContain('HTTP/2');
      expect(node!.supportedProtocols!).toContain('gRPC');
      expect(node!.supportedProtocols!).toContain('DNS');
    });
  });
});
