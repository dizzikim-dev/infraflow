import { describe, it, expect } from 'vitest';
import { fortinetCatalog } from '../../vendors/fortinet';
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
// Fortinet Catalog — Data Integrity Tests
// ---------------------------------------------------------------------------

describe('Fortinet vendor catalog', () => {
  // -------------------------------------------------------------------------
  // Top-level catalog metadata
  // -------------------------------------------------------------------------
  describe('catalog metadata', () => {
    it('should have correct vendor identity', () => {
      expect(fortinetCatalog.vendorId).toBe('fortinet');
      expect(fortinetCatalog.vendorName).toBe('Fortinet');
      expect(fortinetCatalog.vendorNameKo).toBe('포티넷');
      expect(fortinetCatalog.headquarters).toBe('Sunnyvale, CA, USA');
    });

    it('should have valid URLs', () => {
      expect(fortinetCatalog.website).toBe('https://www.fortinet.com');
      expect(fortinetCatalog.productPageUrl).toMatch(/^https:\/\//);
      expect(fortinetCatalog.crawlSource).toMatch(/^https:\/\//);
    });

    it('should have bilingual depth structure', () => {
      expect(fortinetCatalog.depthStructure).toEqual(['category', 'product-line', 'series']);
      expect(fortinetCatalog.depthStructureKo).toEqual(['카테고리', '제품 라인', '시리즈']);
      expect(fortinetCatalog.depthStructure).toHaveLength(fortinetCatalog.depthStructureKo.length);
    });

    it('should have crawl metadata', () => {
      expect(fortinetCatalog.lastCrawled).toBe('2026-02-20');
      expect(fortinetCatalog.crawlSource).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Stats validation
  // -------------------------------------------------------------------------
  describe('catalog stats', () => {
    it('should have accurate totalProducts count', () => {
      const allNodes = getAllNodes(fortinetCatalog.products);
      expect(fortinetCatalog.stats.totalProducts).toBe(allNodes.length);
    });

    it('should have accurate maxDepth', () => {
      const actualMax = getMaxDepth(fortinetCatalog.products);
      expect(fortinetCatalog.stats.maxDepth).toBe(actualMax);
    });

    it('should have accurate categoriesCount', () => {
      expect(fortinetCatalog.stats.categoriesCount).toBe(fortinetCatalog.products.length);
    });

    it('should match computeStats output', () => {
      const computed = computeStats(fortinetCatalog.products);
      expect(fortinetCatalog.stats.totalProducts).toBe(computed.totalProducts);
      expect(fortinetCatalog.stats.maxDepth).toBe(computed.maxDepth);
      expect(fortinetCatalog.stats.categoriesCount).toBe(computed.categoriesCount);
    });

    it('should have 82 total nodes', () => {
      expect(fortinetCatalog.stats.totalProducts).toBe(82);
    });

    it('should have maxDepth of 2', () => {
      expect(fortinetCatalog.stats.maxDepth).toBe(2);
    });

    it('should have 6 top-level categories', () => {
      expect(fortinetCatalog.stats.categoriesCount).toBe(6);
    });
  });

  // -------------------------------------------------------------------------
  // Product tree structure
  // -------------------------------------------------------------------------
  describe('product tree structure', () => {
    it('should have 6 root categories', () => {
      expect(fortinetCatalog.products).toHaveLength(6);
      const names = fortinetCatalog.products.map((p) => p.name);
      expect(names).toEqual([
        'Network Security',
        'SD-WAN & SASE',
        'Switching & Wireless',
        'Security Operations',
        'Zero Trust & Identity',
        'Management & Analytics',
      ]);
    });

    it('should have all root nodes at depth 0', () => {
      for (const product of fortinetCatalog.products) {
        expect(product.depth).toBe(0);
      }
    });

    it('should have Network Security with 10 product lines', () => {
      const netsec = fortinetCatalog.products.find((p) => p.nodeId === 'fortinet-network-security');
      expect(netsec).toBeDefined();
      expect(netsec!.children).toHaveLength(10);
    });

    it('should have SD-WAN & SASE with 4 product lines', () => {
      const sdwan = fortinetCatalog.products.find((p) => p.nodeId === 'fortinet-sdwan-sase');
      expect(sdwan).toBeDefined();
      expect(sdwan!.children).toHaveLength(4);
    });

    it('should have Switching & Wireless with 2 product lines', () => {
      const sw = fortinetCatalog.products.find((p) => p.nodeId === 'fortinet-switching-wireless');
      expect(sw).toBeDefined();
      expect(sw!.children).toHaveLength(2);
    });

    it('should have Security Operations with 7 product lines', () => {
      const secops = fortinetCatalog.products.find((p) => p.nodeId === 'fortinet-secops');
      expect(secops).toBeDefined();
      expect(secops!.children).toHaveLength(7);
    });

    it('should have Zero Trust & Identity with 6 product lines', () => {
      const zt = fortinetCatalog.products.find((p) => p.nodeId === 'fortinet-zero-trust');
      expect(zt).toBeDefined();
      expect(zt!.children).toHaveLength(6);
    });

    it('should have Management & Analytics with 6 product lines', () => {
      const mgmt = fortinetCatalog.products.find((p) => p.nodeId === 'fortinet-management');
      expect(mgmt).toBeDefined();
      expect(mgmt!.children).toHaveLength(6);
    });
  });

  // -------------------------------------------------------------------------
  // Node ID uniqueness
  // -------------------------------------------------------------------------
  describe('node ID uniqueness', () => {
    it('should have globally unique nodeIds', () => {
      const allNodes = getAllNodes(fortinetCatalog.products);
      const ids = allNodes.map((n) => n.nodeId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all nodeIds prefixed with fortinet-', () => {
      const allNodes = getAllNodes(fortinetCatalog.products);
      for (const node of allNodes) {
        expect(node.nodeId).toMatch(/^fortinet-/);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Bilingual completeness
  // -------------------------------------------------------------------------
  describe('bilingual completeness', () => {
    it('should have non-empty name and nameKo for all nodes', () => {
      const allNodes = getAllNodes(fortinetCatalog.products);
      for (const node of allNodes) {
        expect(node.name.length).toBeGreaterThan(0);
        expect(node.nameKo.length).toBeGreaterThan(0);
      }
    });

    it('should have non-empty description and descriptionKo for all nodes', () => {
      const allNodes = getAllNodes(fortinetCatalog.products);
      for (const node of allNodes) {
        expect(node.description.length).toBeGreaterThan(0);
        expect(node.descriptionKo.length).toBeGreaterThan(0);
      }
    });

    it('should have depthLabel and depthLabelKo for all nodes', () => {
      const allNodes = getAllNodes(fortinetCatalog.products);
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
      const allNodes = getAllNodes(fortinetCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).toMatch(/^https:\/\//);
      }
    });

    it('should not have any relative URLs', () => {
      const allNodes = getAllNodes(fortinetCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).not.toMatch(/^\/[^/]/);
      }
    });

    it('should use English URLs (not Korean URLs)', () => {
      const allNodes = getAllNodes(fortinetCatalog.products);
      const koreanUrls = allNodes.filter((n) => n.sourceUrl.includes('ko_kr') || n.sourceUrl.includes('/kr/ko/'));
      expect(koreanUrls.map((n) => n.nodeId)).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // Depth consistency
  // -------------------------------------------------------------------------
  describe('depth consistency', () => {
    it('should have children with depth exactly parent.depth + 1', () => {
      const allNodes = getAllNodes(fortinetCatalog.products);
      for (const node of allNodes) {
        for (const child of node.children) {
          expect(child.depth).toBe(node.depth + 1);
        }
      }
    });

    it('should have leaf nodes with empty children arrays', () => {
      const leaves = getLeafNodes(fortinetCatalog.products);
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
      const allNodes = getAllNodes(fortinetCatalog.products);
      const withTypes = allNodes.filter((n) => n.infraNodeTypes && n.infraNodeTypes.length > 0);
      expect(withTypes.length).toBeGreaterThan(0);
    });

    it('should have valid InfraNodeType values', () => {
      const validTypes = new Set([
        'firewall', 'waf', 'ids-ips', 'vpn-gateway', 'nac', 'dlp',
        'sase-gateway', 'ztna-broker', 'casb', 'siem', 'soar',
        'router', 'switch-l2', 'switch-l3', 'load-balancer', 'api-gateway', 'sd-wan', 'dns', 'cdn',
        'web-server', 'app-server', 'db-server', 'container', 'vm', 'kubernetes',
        'aws-vpc', 'azure-vnet', 'gcp-network', 'private-cloud',
        'san-nas', 'object-storage', 'backup', 'cache', 'storage',
        'ldap-ad', 'sso', 'mfa', 'iam',
        'user', 'internet', 'zone',
      ]);

      const allNodes = getAllNodes(fortinetCatalog.products);
      for (const node of allNodes) {
        if (node.infraNodeTypes) {
          for (const type of node.infraNodeTypes) {
            expect(validTypes.has(type)).toBe(true);
          }
        }
      }
    });

    it('should have infraNodeTypes on all depth 0 and depth 1 nodes', () => {
      const allNodes = getAllNodes(fortinetCatalog.products);
      const depth01 = allNodes.filter((n) => n.depth <= 1);
      const withoutTypes = depth01.filter(
        (n) => !n.infraNodeTypes || n.infraNodeTypes.length === 0,
      );
      expect(withoutTypes.map((n) => n.nodeId)).toEqual([]);
    });

    it('should map Network Security to firewall and ids-ips types', () => {
      const node = findNodeById(fortinetCatalog.products, 'fortinet-network-security');
      expect(node!.infraNodeTypes).toContain('firewall');
      expect(node!.infraNodeTypes).toContain('ids-ips');
    });

    it('should map FortiGate to firewall type', () => {
      const node = findNodeById(fortinetCatalog.products, 'fortinet-fortigate');
      expect(node!.infraNodeTypes).toContain('firewall');
    });

    it('should map SD-WAN & SASE to sd-wan and sase-gateway types', () => {
      const node = findNodeById(fortinetCatalog.products, 'fortinet-sdwan-sase');
      expect(node!.infraNodeTypes).toContain('sd-wan');
      expect(node!.infraNodeTypes).toContain('sase-gateway');
    });

    it('should map Switching & Wireless to switch types', () => {
      const node = findNodeById(fortinetCatalog.products, 'fortinet-switching-wireless');
      expect(node!.infraNodeTypes).toContain('switch-l2');
      expect(node!.infraNodeTypes).toContain('switch-l3');
    });

    it('should map Security Operations to siem and soar types', () => {
      const node = findNodeById(fortinetCatalog.products, 'fortinet-secops');
      expect(node!.infraNodeTypes).toContain('siem');
      expect(node!.infraNodeTypes).toContain('soar');
    });

    it('should map Zero Trust & Identity to nac and ztna-broker types', () => {
      const node = findNodeById(fortinetCatalog.products, 'fortinet-zero-trust');
      expect(node!.infraNodeTypes).toContain('nac');
      expect(node!.infraNodeTypes).toContain('ztna-broker');
    });
  });

  // -------------------------------------------------------------------------
  // FortiGate series deep-dive
  // -------------------------------------------------------------------------
  describe('FortiGate series', () => {
    it('should have FortiGate with 24 series', () => {
      const node = findNodeById(fortinetCatalog.products, 'fortinet-fortigate');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(24);
    });

    it('should have entry-level FortiGate models (40F, 60F, 70F, 80F, 90G)', () => {
      const entryModels = ['fortinet-fortigate-40f', 'fortinet-fortigate-60f', 'fortinet-fortigate-70f', 'fortinet-fortigate-80f', 'fortinet-fortigate-90g'];
      for (const id of entryModels) {
        const node = findNodeById(fortinetCatalog.products, id);
        expect(node).toBeDefined();
        expect(node!.depth).toBe(2);
      }
    });

    it('should have mid-range FortiGate models (100F, 200F, 400F, 600F)', () => {
      const midModels = ['fortinet-fortigate-100f', 'fortinet-fortigate-200f', 'fortinet-fortigate-400f', 'fortinet-fortigate-600f'];
      for (const id of midModels) {
        const node = findNodeById(fortinetCatalog.products, id);
        expect(node).toBeDefined();
        expect(node!.depth).toBe(2);
      }
    });

    it('should have high-end FortiGate models (1000F, 1800F, 2600F, 3000F, 3700F)', () => {
      const highModels = ['fortinet-fortigate-1000f', 'fortinet-fortigate-1800f', 'fortinet-fortigate-2600f', 'fortinet-fortigate-3000f', 'fortinet-fortigate-3700f'];
      for (const id of highModels) {
        const node = findNodeById(fortinetCatalog.products, id);
        expect(node).toBeDefined();
        expect(node!.depth).toBe(2);
      }
    });

    it('should have data center FortiGate models (4200F, 4400F, 4800F, 6001F, 7081F)', () => {
      const dcModels = ['fortinet-fortigate-4200f', 'fortinet-fortigate-4400f', 'fortinet-fortigate-4800f', 'fortinet-fortigate-6001f', 'fortinet-fortigate-7081f'];
      for (const id of dcModels) {
        const node = findNodeById(fortinetCatalog.products, id);
        expect(node).toBeDefined();
        expect(node!.depth).toBe(2);
      }
    });

    it('should have rugged FortiGate models', () => {
      const ruggedModels = ['fortinet-fortigate-60f-rugged', 'fortinet-fortigate-70f-rugged', 'fortinet-fortigate-80f-3g4g'];
      for (const id of ruggedModels) {
        const node = findNodeById(fortinetCatalog.products, id);
        expect(node).toBeDefined();
        expect(node!.depth).toBe(2);
      }
    });

    it('should have virtual FortiGate models (VM, VMX)', () => {
      const vmModels = ['fortinet-fortigate-vm', 'fortinet-fortigate-vmx'];
      for (const id of vmModels) {
        const node = findNodeById(fortinetCatalog.products, id);
        expect(node).toBeDefined();
        expect(node!.depth).toBe(2);
      }
    });

    it('should have FortiGate 90G with SP5 ASIC spec', () => {
      const node = findNodeById(fortinetCatalog.products, 'fortinet-fortigate-90g');
      expect(node).toBeDefined();
      expect(node!.specs).toBeDefined();
      expect(node!.specs!['ASIC']).toBe('SP5');
    });
  });

  // -------------------------------------------------------------------------
  // FortiSwitch deep-dive
  // -------------------------------------------------------------------------
  describe('FortiSwitch series', () => {
    it('should have FortiSwitch with 8 series', () => {
      const node = findNodeById(fortinetCatalog.products, 'fortinet-fortiswitch');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(8);
    });

    it('should have campus series (100, 200, 400)', () => {
      const campusSeries = ['fortinet-fortiswitch-100-series', 'fortinet-fortiswitch-200-series', 'fortinet-fortiswitch-400-series'];
      for (const id of campusSeries) {
        const node = findNodeById(fortinetCatalog.products, id);
        expect(node).toBeDefined();
      }
    });

    it('should have data center series (1024E, 1048E, 3032E)', () => {
      const dcSeries = ['fortinet-fortiswitch-1024e', 'fortinet-fortiswitch-1048e', 'fortinet-fortiswitch-3032e'];
      for (const id of dcSeries) {
        const node = findNodeById(fortinetCatalog.products, id);
        expect(node).toBeDefined();
      }
    });

    it('should have rugged series (112D-POE, 124D-POE)', () => {
      const ruggedSeries = ['fortinet-fortiswitch-112d-poe', 'fortinet-fortiswitch-124d-poe'];
      for (const id of ruggedSeries) {
        const node = findNodeById(fortinetCatalog.products, id);
        expect(node).toBeDefined();
      }
    });
  });

  // -------------------------------------------------------------------------
  // Search functionality
  // -------------------------------------------------------------------------
  describe('search', () => {
    it('should find FortiGate products by English name', () => {
      const results = searchNodes(fortinetCatalog.products, 'FortiGate');
      expect(results.length).toBeGreaterThan(20);
    });

    it('should find products by Korean name (방화벽)', () => {
      const results = searchNodes(fortinetCatalog.products, '방화벽');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find FortiSwitch products', () => {
      const results = searchNodes(fortinetCatalog.products, 'FortiSwitch');
      expect(results.length).toBeGreaterThan(5);
    });

    it('should find FortiAP products', () => {
      const results = searchNodes(fortinetCatalog.products, 'FortiAP');
      expect(results.length).toBeGreaterThanOrEqual(5);
    });

    it('should find SIEM products', () => {
      const results = searchNodes(fortinetCatalog.products, 'SIEM');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find SOAR products', () => {
      const results = searchNodes(fortinetCatalog.products, 'SOAR');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find node by exact nodeId', () => {
      const node = findNodeById(fortinetCatalog.products, 'fortinet-fortigate-600f');
      expect(node).toBeDefined();
      expect(node!.name).toBe('FortiGate 600F');
    });
  });

  // -------------------------------------------------------------------------
  // Leaf node counts
  // -------------------------------------------------------------------------
  describe('leaf node counts', () => {
    it('should match countLeafNodes helper', () => {
      const count = countLeafNodes(fortinetCatalog.products);
      const leaves = getLeafNodes(fortinetCatalog.products);
      expect(count).toBe(leaves.length);
    });

    it('should have all leaf nodes at depth 1 or 2', () => {
      const leaves = getLeafNodes(fortinetCatalog.products);
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
    it('should have 6 nodes at depth 0', () => {
      const nodes = getNodesByDepth(fortinetCatalog.products, 0);
      expect(nodes).toHaveLength(6);
    });

    it('should have 35 nodes at depth 1', () => {
      const nodes = getNodesByDepth(fortinetCatalog.products, 1);
      expect(nodes).toHaveLength(35);
    });

    it('should have 41 nodes at depth 2', () => {
      const nodes = getNodesByDepth(fortinetCatalog.products, 2);
      expect(nodes).toHaveLength(41);
    });
  });

  // -------------------------------------------------------------------------
  // Data quality validation
  // -------------------------------------------------------------------------
  describe('data quality validation', () => {
    describe('architecture planning fields', () => {
      it('should have architectureRole and architectureRoleKo pair completeness', () => {
        const allNodes = getAllNodes(fortinetCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.architectureRole && !n.architectureRoleKo) ||
            (!n.architectureRole && n.architectureRoleKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor and recommendedForKo pair completeness', () => {
        const allNodes = getAllNodes(fortinetCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.recommendedFor && !n.recommendedForKo) ||
            (!n.recommendedFor && n.recommendedForKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor with matching length in recommendedForKo', () => {
        const allNodes = getAllNodes(fortinetCatalog.products);
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
        const allNodes = getAllNodes(fortinetCatalog.products);
        for (const node of allNodes) {
          if (node.lifecycle) {
            expect(validValues.has(node.lifecycle)).toBe(true);
          }
        }
      });
    });

    describe('coverage statistics', () => {
      it('should report infraNodeTypes coverage on all depth 0 and 1 nodes', () => {
        const allNodes = getAllNodes(fortinetCatalog.products);
        const depth01 = allNodes.filter((n) => n.depth <= 1);
        const depth01WithTypes = depth01.filter(
          (n) => n.infraNodeTypes && n.infraNodeTypes.length > 0,
        );
        expect(depth01WithTypes.length).toBe(depth01.length);
      });

      it('should report architectureRole coverage', () => {
        const allNodes = getAllNodes(fortinetCatalog.products);
        const withRole = allNodes.filter((n) => n.architectureRole);
        expect(withRole.length).toBeGreaterThan(0);
      });
    });
  });

  // -------------------------------------------------------------------------
  // Specific product spot checks
  // -------------------------------------------------------------------------
  describe('specific product spot checks', () => {
    it('should have FortiGate 600F with correct data', () => {
      const node = findNodeById(fortinetCatalog.products, 'fortinet-fortigate-600f');
      expect(node).toBeDefined();
      expect(node!.name).toBe('FortiGate 600F');
      expect(node!.nameKo).toBe('FortiGate 600F');
      expect(node!.specs).toBeDefined();
      expect(node!.specs!['Firewall Throughput']).toBe('80 Gbps');
    });

    it('should have FortiSIEM with correct data', () => {
      const node = findNodeById(fortinetCatalog.products, 'fortinet-fortisiem');
      expect(node).toBeDefined();
      expect(node!.name).toBe('FortiSIEM');
      expect(node!.infraNodeTypes).toContain('siem');
    });

    it('should have FortiSOAR with correct data', () => {
      const node = findNodeById(fortinetCatalog.products, 'fortinet-fortisoar');
      expect(node).toBeDefined();
      expect(node!.name).toBe('FortiSOAR');
      expect(node!.infraNodeTypes).toContain('soar');
    });

    it('should have FortiManager with correct data', () => {
      const node = findNodeById(fortinetCatalog.products, 'fortinet-fortimanager');
      expect(node).toBeDefined();
      expect(node!.name).toBe('FortiManager');
    });

    it('should have FortiSASE with correct data', () => {
      const node = findNodeById(fortinetCatalog.products, 'fortinet-fortisase');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('sase-gateway');
    });

    it('should have FortiNAC with correct data', () => {
      const node = findNodeById(fortinetCatalog.products, 'fortinet-fortinac');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('nac');
    });

    it('should have FortiWeb WAF with sub-models', () => {
      const node = findNodeById(fortinetCatalog.products, 'fortinet-fortiweb');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('waf');
      expect(node!.children).toHaveLength(4);
    });

    it('should have FortiDLP with correct data', () => {
      const node = findNodeById(fortinetCatalog.products, 'fortinet-fortidlp');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('dlp');
    });

    it('should have FortiPAM with correct data', () => {
      const node = findNodeById(fortinetCatalog.products, 'fortinet-fortipam');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('iam');
    });
  });
});
