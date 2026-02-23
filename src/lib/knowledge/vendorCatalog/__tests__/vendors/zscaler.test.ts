import { describe, it, expect } from 'vitest';
import { zscalerCatalog } from '../../vendors/zscaler';
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
// Zscaler Catalog -- Data Integrity Tests
// ---------------------------------------------------------------------------

describe('Zscaler vendor catalog', () => {
  // -------------------------------------------------------------------------
  // Top-level catalog metadata
  // -------------------------------------------------------------------------
  describe('catalog metadata', () => {
    it('should have correct vendor identity', () => {
      expect(zscalerCatalog.vendorId).toBe('zscaler');
      expect(zscalerCatalog.vendorName).toBe('Zscaler');
      expect(zscalerCatalog.vendorNameKo).toBe('지스케일러');
      expect(zscalerCatalog.headquarters).toBe('San Jose, CA, USA');
    });

    it('should have valid URLs', () => {
      expect(zscalerCatalog.website).toBe('https://www.zscaler.com');
      expect(zscalerCatalog.productPageUrl).toMatch(/^https:\/\//);
      expect(zscalerCatalog.crawlSource).toMatch(/^https:\/\//);
    });

    it('should have bilingual depth structure', () => {
      expect(zscalerCatalog.depthStructure).toEqual(['category', 'product-line', 'module']);
      expect(zscalerCatalog.depthStructureKo).toEqual(['카테고리', '제품 라인', '모듈']);
      expect(zscalerCatalog.depthStructure).toHaveLength(zscalerCatalog.depthStructureKo.length);
    });

    it('should have crawl metadata', () => {
      expect(zscalerCatalog.lastCrawled).toBe('2026-02-22');
      expect(zscalerCatalog.crawlSource).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Stats validation
  // -------------------------------------------------------------------------
  describe('catalog stats', () => {
    it('should have accurate totalProducts count', () => {
      const allNodes = getAllNodes(zscalerCatalog.products);
      expect(zscalerCatalog.stats.totalProducts).toBe(allNodes.length);
    });

    it('should have accurate maxDepth', () => {
      const actualMax = getMaxDepth(zscalerCatalog.products);
      expect(zscalerCatalog.stats.maxDepth).toBe(actualMax);
    });

    it('should have accurate categoriesCount', () => {
      expect(zscalerCatalog.stats.categoriesCount).toBe(zscalerCatalog.products.length);
    });

    it('should match computeStats output', () => {
      const computed = computeStats(zscalerCatalog.products);
      expect(zscalerCatalog.stats.totalProducts).toBe(computed.totalProducts);
      expect(zscalerCatalog.stats.maxDepth).toBe(computed.maxDepth);
      expect(zscalerCatalog.stats.categoriesCount).toBe(computed.categoriesCount);
    });

    it('should have 32 total nodes', () => {
      expect(zscalerCatalog.stats.totalProducts).toBe(32);
    });

    it('should have maxDepth of 2', () => {
      expect(zscalerCatalog.stats.maxDepth).toBe(2);
    });

    it('should have 4 top-level categories', () => {
      expect(zscalerCatalog.stats.categoriesCount).toBe(4);
    });
  });

  // -------------------------------------------------------------------------
  // Product tree structure
  // -------------------------------------------------------------------------
  describe('product tree structure', () => {
    it('should have 4 root categories', () => {
      expect(zscalerCatalog.products).toHaveLength(4);
      const names = zscalerCatalog.products.map((p) => p.name);
      expect(names).toEqual([
        'Zscaler for Users',
        'Zscaler for Workloads',
        'Zscaler for IoT/OT',
        'Zscaler for Data',
      ]);
    });

    it('should have all root nodes at depth 0', () => {
      for (const product of zscalerCatalog.products) {
        expect(product.depth).toBe(0);
      }
    });

    it('should have Zscaler for Users with 3 product lines', () => {
      const users = zscalerCatalog.products.find((p) => p.nodeId === 'zscaler-for-users');
      expect(users).toBeDefined();
      expect(users!.children).toHaveLength(3);
    });

    it('should have Zscaler for Workloads with 3 product lines', () => {
      const workloads = zscalerCatalog.products.find((p) => p.nodeId === 'zscaler-for-workloads');
      expect(workloads).toBeDefined();
      expect(workloads!.children).toHaveLength(3);
    });

    it('should have Zscaler for IoT/OT with 2 product lines', () => {
      const iot = zscalerCatalog.products.find((p) => p.nodeId === 'zscaler-for-iot-ot');
      expect(iot).toBeDefined();
      expect(iot!.children).toHaveLength(2);
    });

    it('should have Zscaler for Data with 2 product lines', () => {
      const data = zscalerCatalog.products.find((p) => p.nodeId === 'zscaler-for-data');
      expect(data).toBeDefined();
      expect(data!.children).toHaveLength(2);
    });
  });

  // -------------------------------------------------------------------------
  // Node ID uniqueness
  // -------------------------------------------------------------------------
  describe('node ID uniqueness', () => {
    it('should have globally unique nodeIds', () => {
      const allNodes = getAllNodes(zscalerCatalog.products);
      const ids = allNodes.map((n) => n.nodeId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all nodeIds prefixed with zscaler-', () => {
      const allNodes = getAllNodes(zscalerCatalog.products);
      for (const node of allNodes) {
        expect(node.nodeId).toMatch(/^zscaler-/);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Bilingual completeness
  // -------------------------------------------------------------------------
  describe('bilingual completeness', () => {
    it('should have non-empty name and nameKo for all nodes', () => {
      const allNodes = getAllNodes(zscalerCatalog.products);
      for (const node of allNodes) {
        expect(node.name.length).toBeGreaterThan(0);
        expect(node.nameKo.length).toBeGreaterThan(0);
      }
    });

    it('should have non-empty description and descriptionKo for all nodes', () => {
      const allNodes = getAllNodes(zscalerCatalog.products);
      for (const node of allNodes) {
        expect(node.description.length).toBeGreaterThan(0);
        expect(node.descriptionKo.length).toBeGreaterThan(0);
      }
    });

    it('should have depthLabel and depthLabelKo for all nodes', () => {
      const allNodes = getAllNodes(zscalerCatalog.products);
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
      const allNodes = getAllNodes(zscalerCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).toMatch(/^https:\/\//);
      }
    });

    it('should not have any relative URLs', () => {
      const allNodes = getAllNodes(zscalerCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).not.toMatch(/^\/[^/]/);
      }
    });

    it('should use English URLs (not Korean URLs)', () => {
      const allNodes = getAllNodes(zscalerCatalog.products);
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
      const allNodes = getAllNodes(zscalerCatalog.products);
      for (const node of allNodes) {
        for (const child of node.children) {
          expect(child.depth).toBe(node.depth + 1);
        }
      }
    });

    it('should have leaf nodes with empty children arrays', () => {
      const leaves = getLeafNodes(zscalerCatalog.products);
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
      const allNodes = getAllNodes(zscalerCatalog.products);
      const withTypes = allNodes.filter((n) => n.infraNodeTypes && n.infraNodeTypes.length > 0);
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

      const allNodes = getAllNodes(zscalerCatalog.products);
      for (const node of allNodes) {
        if (node.infraNodeTypes) {
          for (const type of node.infraNodeTypes) {
            expect(validTypes.has(type)).toBe(true);
          }
        }
      }
    });

    it('should have infraNodeTypes on all depth 0 and depth 1 nodes', () => {
      const allNodes = getAllNodes(zscalerCatalog.products);
      const depth01 = allNodes.filter((n) => n.depth <= 1);
      const withoutTypes = depth01.filter(
        (n) => !n.infraNodeTypes || n.infraNodeTypes.length === 0,
      );
      expect(withoutTypes.map((n) => n.nodeId)).toEqual([]);
    });

    it('should map Zscaler for Users to sase-gateway and ztna-broker types', () => {
      const node = findNodeById(zscalerCatalog.products, 'zscaler-for-users');
      expect(node!.infraNodeTypes).toContain('sase-gateway');
      expect(node!.infraNodeTypes).toContain('ztna-broker');
    });

    it('should map ZIA to sase-gateway type', () => {
      const node = findNodeById(zscalerCatalog.products, 'zscaler-zia');
      expect(node!.infraNodeTypes).toContain('sase-gateway');
    });

    it('should map ZPA to ztna-broker type', () => {
      const node = findNodeById(zscalerCatalog.products, 'zscaler-zpa');
      expect(node!.infraNodeTypes).toContain('ztna-broker');
    });

    it('should map Zscaler for Data to dlp and casb types', () => {
      const node = findNodeById(zscalerCatalog.products, 'zscaler-for-data');
      expect(node!.infraNodeTypes).toContain('dlp');
      expect(node!.infraNodeTypes).toContain('casb');
    });

    it('should map Zscaler for IoT/OT to nac and ztna-broker types', () => {
      const node = findNodeById(zscalerCatalog.products, 'zscaler-for-iot-ot');
      expect(node!.infraNodeTypes).toContain('nac');
      expect(node!.infraNodeTypes).toContain('ztna-broker');
    });
  });

  // -------------------------------------------------------------------------
  // ZIA product line deep-dive
  // -------------------------------------------------------------------------
  describe('ZIA product line', () => {
    it('should have ZIA with 5 modules', () => {
      const node = findNodeById(zscalerCatalog.products, 'zscaler-zia');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(5);
    });

    it('should have ZIA SWG module', () => {
      const node = findNodeById(zscalerCatalog.products, 'zscaler-zia-swg');
      expect(node).toBeDefined();
      expect(node!.depth).toBe(2);
      expect(node!.lifecycle).toBe('active');
      expect(node!.formFactor).toBe('cloud');
    });

    it('should have ZIA Cloud Firewall module', () => {
      const node = findNodeById(zscalerCatalog.products, 'zscaler-zia-firewall');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('firewall');
    });

    it('should have ZIA Cloud Sandbox module', () => {
      const node = findNodeById(zscalerCatalog.products, 'zscaler-zia-sandbox');
      expect(node).toBeDefined();
      expect(node!.lifecycle).toBe('active');
    });

    it('should have ZIA Data Protection module with DLP and CASB types', () => {
      const node = findNodeById(zscalerCatalog.products, 'zscaler-zia-data-protection');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('dlp');
      expect(node!.infraNodeTypes).toContain('casb');
    });

    it('should have ZIA Browser Isolation module', () => {
      const node = findNodeById(zscalerCatalog.products, 'zscaler-zia-browser-isolation');
      expect(node).toBeDefined();
      expect(node!.lifecycle).toBe('active');
    });
  });

  // -------------------------------------------------------------------------
  // ZPA product line deep-dive
  // -------------------------------------------------------------------------
  describe('ZPA product line', () => {
    it('should have ZPA with 3 modules', () => {
      const node = findNodeById(zscalerCatalog.products, 'zscaler-zpa');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
    });

    it('should have ZPA Application Access module', () => {
      const node = findNodeById(zscalerCatalog.products, 'zscaler-zpa-access');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('ztna-broker');
    });

    it('should have ZPA AppProtection module with WAF type', () => {
      const node = findNodeById(zscalerCatalog.products, 'zscaler-zpa-appprotection');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('waf');
    });

    it('should have ZPA Private Service Edge as virtual form factor', () => {
      const node = findNodeById(zscalerCatalog.products, 'zscaler-zpa-private-service-edge');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('virtual');
    });
  });

  // -------------------------------------------------------------------------
  // ZDX product line deep-dive
  // -------------------------------------------------------------------------
  describe('ZDX product line', () => {
    it('should have ZDX with 2 modules', () => {
      const node = findNodeById(zscalerCatalog.products, 'zscaler-zdx');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(2);
    });

    it('should have ZDX Monitoring module', () => {
      const node = findNodeById(zscalerCatalog.products, 'zscaler-zdx-monitoring');
      expect(node).toBeDefined();
      expect(node!.lifecycle).toBe('active');
    });

    it('should have ZDX Copilot module', () => {
      const node = findNodeById(zscalerCatalog.products, 'zscaler-zdx-copilot');
      expect(node).toBeDefined();
      expect(node!.lifecycle).toBe('active');
    });
  });

  // -------------------------------------------------------------------------
  // Search functionality
  // -------------------------------------------------------------------------
  describe('search', () => {
    it('should find ZIA products by name', () => {
      const results = searchNodes(zscalerCatalog.products, 'ZIA');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find ZPA products by name', () => {
      const results = searchNodes(zscalerCatalog.products, 'ZPA');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find products by Korean name', () => {
      const results = searchNodes(zscalerCatalog.products, '제로 트러스트');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find DLP products', () => {
      const results = searchNodes(zscalerCatalog.products, 'DLP');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find CASB products', () => {
      const results = searchNodes(zscalerCatalog.products, 'CASB');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find deception products', () => {
      const results = searchNodes(zscalerCatalog.products, 'Deception');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find node by exact nodeId', () => {
      const node = findNodeById(zscalerCatalog.products, 'zscaler-zia-swg');
      expect(node).toBeDefined();
      expect(node!.name).toBe('ZIA Secure Web Gateway');
    });
  });

  // -------------------------------------------------------------------------
  // Leaf node counts
  // -------------------------------------------------------------------------
  describe('leaf node counts', () => {
    it('should match countLeafNodes helper', () => {
      const count = countLeafNodes(zscalerCatalog.products);
      const leaves = getLeafNodes(zscalerCatalog.products);
      expect(count).toBe(leaves.length);
    });

    it('should have all leaf nodes at depth 2', () => {
      const leaves = getLeafNodes(zscalerCatalog.products);
      for (const leaf of leaves) {
        expect(leaf.depth).toBe(2);
      }
    });

    it('should have 18 leaf nodes', () => {
      const leaves = getLeafNodes(zscalerCatalog.products);
      expect(leaves).toHaveLength(18);
    });
  });

  // -------------------------------------------------------------------------
  // Depth distribution
  // -------------------------------------------------------------------------
  describe('depth distribution', () => {
    it('should have 4 nodes at depth 0', () => {
      const nodes = getNodesByDepth(zscalerCatalog.products, 0);
      expect(nodes).toHaveLength(4);
    });

    it('should have 10 nodes at depth 1', () => {
      const nodes = getNodesByDepth(zscalerCatalog.products, 1);
      expect(nodes).toHaveLength(10);
    });

    it('should have 18 nodes at depth 2', () => {
      const nodes = getNodesByDepth(zscalerCatalog.products, 2);
      expect(nodes).toHaveLength(18);
    });
  });

  // -------------------------------------------------------------------------
  // Data quality validation
  // -------------------------------------------------------------------------
  describe('data quality validation', () => {
    describe('architecture planning fields', () => {
      it('should have architectureRole and architectureRoleKo pair completeness', () => {
        const allNodes = getAllNodes(zscalerCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.architectureRole && !n.architectureRoleKo) ||
            (!n.architectureRole && n.architectureRoleKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor and recommendedForKo pair completeness', () => {
        const allNodes = getAllNodes(zscalerCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.recommendedFor && !n.recommendedForKo) ||
            (!n.recommendedFor && n.recommendedForKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor with matching length in recommendedForKo', () => {
        const allNodes = getAllNodes(zscalerCatalog.products);
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
        const allNodes = getAllNodes(zscalerCatalog.products);
        for (const node of allNodes) {
          if (node.lifecycle) {
            expect(validValues.has(node.lifecycle)).toBe(true);
          }
        }
      });

      it('should have lifecycle on all depth 2 nodes', () => {
        const depth2 = getNodesByDepth(zscalerCatalog.products, 2);
        const withoutLifecycle = depth2.filter((n) => !n.lifecycle);
        expect(withoutLifecycle.map((n) => n.nodeId)).toEqual([]);
      });
    });

    describe('cloud-native product fields', () => {
      it('should have all leaf nodes with cloud or virtual formFactor', () => {
        const leaves = getLeafNodes(zscalerCatalog.products);
        for (const leaf of leaves) {
          expect(['cloud', 'virtual']).toContain(leaf.formFactor);
        }
      });

      it('should have all leaf nodes with subscription licensing', () => {
        const leaves = getLeafNodes(zscalerCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.licensingModel).toBe('subscription');
        }
      });
    });

    describe('coverage statistics', () => {
      it('should report infraNodeTypes coverage on all depth 0 and 1 nodes', () => {
        const allNodes = getAllNodes(zscalerCatalog.products);
        const depth01 = allNodes.filter((n) => n.depth <= 1);
        const depth01WithTypes = depth01.filter(
          (n) => n.infraNodeTypes && n.infraNodeTypes.length > 0,
        );
        expect(depth01WithTypes.length).toBe(depth01.length);
      });

      it('should report architectureRole coverage', () => {
        const allNodes = getAllNodes(zscalerCatalog.products);
        const withRole = allNodes.filter((n) => n.architectureRole);
        expect(withRole.length).toBeGreaterThan(0);
      });

      it('should have specs on all leaf nodes', () => {
        const leaves = getLeafNodes(zscalerCatalog.products);
        const withoutSpecs = leaves.filter((n) => !n.specs || Object.keys(n.specs).length === 0);
        expect(withoutSpecs.map((n) => n.nodeId)).toEqual([]);
      });
    });
  });

  // -------------------------------------------------------------------------
  // Specific product spot checks
  // -------------------------------------------------------------------------
  describe('specific product spot checks', () => {
    it('should have ZIA SWG with correct data', () => {
      const node = findNodeById(zscalerCatalog.products, 'zscaler-zia-swg');
      expect(node).toBeDefined();
      expect(node!.name).toBe('ZIA Secure Web Gateway');
      expect(node!.specs).toBeDefined();
      expect(node!.specs!['Global Data Centers']).toBe('160+');
    });

    it('should have ZIA Cloud Firewall with firewall type', () => {
      const node = findNodeById(zscalerCatalog.products, 'zscaler-zia-firewall');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('firewall');
      expect(node!.infraNodeTypes).toContain('sase-gateway');
    });

    it('should have Zscaler DLP with correct data', () => {
      const node = findNodeById(zscalerCatalog.products, 'zscaler-dlp');
      expect(node).toBeDefined();
      expect(node!.name).toBe('Zscaler DLP');
      expect(node!.infraNodeTypes).toContain('dlp');
    });

    it('should have Zscaler CASB with correct data', () => {
      const node = findNodeById(zscalerCatalog.products, 'zscaler-casb');
      expect(node).toBeDefined();
      expect(node!.name).toBe('Zscaler CASB');
      expect(node!.infraNodeTypes).toContain('casb');
    });

    it('should have Zscaler Deception with ids-ips type', () => {
      const node = findNodeById(zscalerCatalog.products, 'zscaler-deception-tech');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('ids-ips');
    });

    it('should have Zscaler Privileged Remote Access with correct types', () => {
      const node = findNodeById(zscalerCatalog.products, 'zscaler-privileged-access');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('ztna-broker');
      expect(node!.infraNodeTypes).toContain('vpn-gateway');
    });

    it('should have ZPA Private Service Edge with virtual form factor', () => {
      const node = findNodeById(zscalerCatalog.products, 'zscaler-zpa-private-service-edge');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('virtual');
      expect(node!.licensingModel).toBe('subscription');
    });

    it('should have ZPA AppProtection with WAF capability', () => {
      const node = findNodeById(zscalerCatalog.products, 'zscaler-zpa-appprotection');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('waf');
      expect(node!.infraNodeTypes).toContain('ztna-broker');
    });
  });
});
