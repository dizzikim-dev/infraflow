import { describe, it, expect } from 'vitest';
import { hpeArubaCatalog } from '../../vendors/hpe-aruba';
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
// HPE Aruba Networking Catalog -- Data Integrity Tests
// ---------------------------------------------------------------------------

describe('HPE Aruba Networking vendor catalog', () => {
  // -------------------------------------------------------------------------
  // Top-level catalog metadata
  // -------------------------------------------------------------------------
  describe('catalog metadata', () => {
    it('should have correct vendor identity', () => {
      expect(hpeArubaCatalog.vendorId).toBe('hpe-aruba');
      expect(hpeArubaCatalog.vendorName).toBe('HPE Aruba Networking');
      expect(hpeArubaCatalog.vendorNameKo).toBe('HPE 아루바 네트워킹');
      expect(hpeArubaCatalog.headquarters).toBe('San Jose, CA, USA');
    });

    it('should have valid URLs', () => {
      expect(hpeArubaCatalog.website).toBe('https://www.arubanetworks.com');
      expect(hpeArubaCatalog.productPageUrl).toMatch(/^https:\/\//);
      expect(hpeArubaCatalog.crawlSource).toMatch(/^https:\/\//);
    });

    it('should have bilingual depth structure', () => {
      expect(hpeArubaCatalog.depthStructure).toEqual(['category', 'product-line', 'series']);
      expect(hpeArubaCatalog.depthStructureKo).toEqual(['카테고리', '제품 라인', '시리즈']);
      expect(hpeArubaCatalog.depthStructure).toHaveLength(hpeArubaCatalog.depthStructureKo.length);
    });

    it('should have crawl metadata', () => {
      expect(hpeArubaCatalog.lastCrawled).toBe('2026-02-23');
      expect(hpeArubaCatalog.crawlSource).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Stats validation
  // -------------------------------------------------------------------------
  describe('catalog stats', () => {
    it('should have accurate totalProducts count', () => {
      const allNodes = getAllNodes(hpeArubaCatalog.products);
      expect(hpeArubaCatalog.stats.totalProducts).toBe(allNodes.length);
    });

    it('should have accurate maxDepth', () => {
      const actualMax = getMaxDepth(hpeArubaCatalog.products);
      expect(hpeArubaCatalog.stats.maxDepth).toBe(actualMax);
    });

    it('should have accurate categoriesCount', () => {
      expect(hpeArubaCatalog.stats.categoriesCount).toBe(hpeArubaCatalog.products.length);
    });

    it('should match computeStats output', () => {
      const computed = computeStats(hpeArubaCatalog.products);
      expect(hpeArubaCatalog.stats.totalProducts).toBe(computed.totalProducts);
      expect(hpeArubaCatalog.stats.maxDepth).toBe(computed.maxDepth);
      expect(hpeArubaCatalog.stats.categoriesCount).toBe(computed.categoriesCount);
    });

    it('should have 38 total nodes', () => {
      expect(hpeArubaCatalog.stats.totalProducts).toBe(38);
    });

    it('should have maxDepth of 2', () => {
      expect(hpeArubaCatalog.stats.maxDepth).toBe(2);
    });

    it('should have 5 top-level categories', () => {
      expect(hpeArubaCatalog.stats.categoriesCount).toBe(5);
    });
  });

  // -------------------------------------------------------------------------
  // Product tree structure
  // -------------------------------------------------------------------------
  describe('product tree structure', () => {
    it('should have 5 root categories', () => {
      expect(hpeArubaCatalog.products).toHaveLength(5);
      const names = hpeArubaCatalog.products.map((p) => p.name);
      expect(names).toEqual([
        'Wireless',
        'Switching',
        'Network Security',
        'Servers',
        'Storage',
      ]);
    });

    it('should have all root nodes at depth 0', () => {
      for (const product of hpeArubaCatalog.products) {
        expect(product.depth).toBe(0);
      }
    });

    it('should have Wireless with 2 product lines', () => {
      const wireless = hpeArubaCatalog.products.find((p) => p.nodeId === 'hpe-aruba-wireless');
      expect(wireless).toBeDefined();
      expect(wireless!.children).toHaveLength(2);
    });

    it('should have Switching with 1 product line', () => {
      const switching = hpeArubaCatalog.products.find((p) => p.nodeId === 'hpe-aruba-switching');
      expect(switching).toBeDefined();
      expect(switching!.children).toHaveLength(1);
    });

    it('should have Network Security with 2 product lines', () => {
      const security = hpeArubaCatalog.products.find((p) => p.nodeId === 'hpe-aruba-network-security');
      expect(security).toBeDefined();
      expect(security!.children).toHaveLength(2);
    });

    it('should have Servers with 2 product lines', () => {
      const servers = hpeArubaCatalog.products.find((p) => p.nodeId === 'hpe-aruba-servers');
      expect(servers).toBeDefined();
      expect(servers!.children).toHaveLength(2);
    });

    it('should have Storage with 1 product line', () => {
      const storage = hpeArubaCatalog.products.find((p) => p.nodeId === 'hpe-aruba-storage');
      expect(storage).toBeDefined();
      expect(storage!.children).toHaveLength(1);
    });
  });

  // -------------------------------------------------------------------------
  // Node ID uniqueness
  // -------------------------------------------------------------------------
  describe('node ID uniqueness', () => {
    it('should have globally unique nodeIds', () => {
      const allNodes = getAllNodes(hpeArubaCatalog.products);
      const ids = allNodes.map((n) => n.nodeId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all nodeIds prefixed with hpe-aruba-', () => {
      const allNodes = getAllNodes(hpeArubaCatalog.products);
      for (const node of allNodes) {
        expect(node.nodeId).toMatch(/^hpe-aruba-/);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Bilingual completeness
  // -------------------------------------------------------------------------
  describe('bilingual completeness', () => {
    it('should have non-empty name and nameKo for all nodes', () => {
      const allNodes = getAllNodes(hpeArubaCatalog.products);
      for (const node of allNodes) {
        expect(node.name.length).toBeGreaterThan(0);
        expect(node.nameKo.length).toBeGreaterThan(0);
      }
    });

    it('should have non-empty description and descriptionKo for all nodes', () => {
      const allNodes = getAllNodes(hpeArubaCatalog.products);
      for (const node of allNodes) {
        expect(node.description.length).toBeGreaterThan(0);
        expect(node.descriptionKo.length).toBeGreaterThan(0);
      }
    });

    it('should have depthLabel and depthLabelKo for all nodes', () => {
      const allNodes = getAllNodes(hpeArubaCatalog.products);
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
      const allNodes = getAllNodes(hpeArubaCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).toMatch(/^https:\/\//);
      }
    });

    it('should not have any relative URLs', () => {
      const allNodes = getAllNodes(hpeArubaCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).not.toMatch(/^\/[^/]/);
      }
    });

    it('should use English URLs (not Korean URLs)', () => {
      const allNodes = getAllNodes(hpeArubaCatalog.products);
      const koreanUrls = allNodes.filter((n) => n.sourceUrl.includes('ko_kr') || n.sourceUrl.includes('/kr/ko/'));
      expect(koreanUrls.map((n) => n.nodeId)).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // Depth consistency
  // -------------------------------------------------------------------------
  describe('depth consistency', () => {
    it('should have children with depth exactly parent.depth + 1', () => {
      const allNodes = getAllNodes(hpeArubaCatalog.products);
      for (const node of allNodes) {
        for (const child of node.children) {
          expect(child.depth).toBe(node.depth + 1);
        }
      }
    });

    it('should have leaf nodes with empty children arrays', () => {
      const leaves = getLeafNodes(hpeArubaCatalog.products);
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
      const allNodes = getAllNodes(hpeArubaCatalog.products);
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

      const allNodes = getAllNodes(hpeArubaCatalog.products);
      for (const node of allNodes) {
        if (node.infraNodeTypes) {
          for (const type of node.infraNodeTypes) {
            expect(validTypes.has(type)).toBe(true);
          }
        }
      }
    });

    it('should have infraNodeTypes on all depth 0 and depth 1 nodes', () => {
      const allNodes = getAllNodes(hpeArubaCatalog.products);
      const depth01 = allNodes.filter((n) => n.depth <= 1);
      const withoutTypes = depth01.filter(
        (n) => !n.infraNodeTypes || n.infraNodeTypes.length === 0,
      );
      expect(withoutTypes.map((n) => n.nodeId)).toEqual([]);
    });

    it('should map Wireless to wireless-ap type', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-wireless');
      expect(node!.infraNodeTypes).toContain('wireless-ap');
    });

    it('should map Switching to switch-l2 and switch-l3 types', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-switching');
      expect(node!.infraNodeTypes).toContain('switch-l2');
      expect(node!.infraNodeTypes).toContain('switch-l3');
    });

    it('should map Network Security to nac type', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-network-security');
      expect(node!.infraNodeTypes).toContain('nac');
    });

    it('should map Servers to server types', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-servers');
      expect(node!.infraNodeTypes).toContain('web-server');
      expect(node!.infraNodeTypes).toContain('app-server');
    });

    it('should map Storage to san-nas and storage types', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-storage');
      expect(node!.infraNodeTypes).toContain('san-nas');
      expect(node!.infraNodeTypes).toContain('storage');
    });

    it('should map EdgeConnect to sd-wan type', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-edgeconnect');
      expect(node!.infraNodeTypes).toContain('sd-wan');
    });
  });

  // -------------------------------------------------------------------------
  // Wireless deep-dive
  // -------------------------------------------------------------------------
  describe('Wireless products', () => {
    it('should have 5 access points', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-access-points');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(5);
    });

    it('should have AP-735 as Wi-Fi 7 flagship', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-ap-735');
      expect(node).toBeDefined();
      expect(node!.specs!['Wi-Fi Standard']).toContain('Wi-Fi 7');
      expect(node!.specs!['Max Data Rate']).toContain('18.4 Gbps');
      expect(node!.maxThroughput).toBe('18.4 Gbps');
    });

    it('should have AP-655 as Wi-Fi 6E tri-band', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-ap-655');
      expect(node).toBeDefined();
      expect(node!.specs!['Radio Bands']).toContain('tri-band');
      expect(node!.maxThroughput).toBe('3.9 Gbps');
    });

    it('should have AP-567 as outdoor rugged with IP67', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-ap-567');
      expect(node).toBeDefined();
      expect(node!.specs!['IP Rating']).toBe('IP67');
      expect(node!.formFactor).toBe('rugged');
    });

    it('should have 2 controllers', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-controllers');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(2);
    });

    it('should have 9200 Series Gateway with 40 Gbps throughput', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-9200-gateway');
      expect(node).toBeDefined();
      expect(node!.maxThroughput).toBe('40 Gbps');
      expect(node!.specs!['Firewall Throughput']).toBe('40 Gbps');
    });
  });

  // -------------------------------------------------------------------------
  // Switching deep-dive
  // -------------------------------------------------------------------------
  describe('Switching products', () => {
    it('should have 6 CX switch models', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-cx-switching');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(6);
    });

    it('should have CX 6200 as access layer switch', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-cx-6200');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Access');
    });

    it('should have CX 6400 as modular campus core', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-cx-6400');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('chassis');
      expect(node!.specs!['Switching Capacity']).toBe('7.68 Tbps');
    });

    it('should have CX 10000 with stateful firewall at line rate', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-cx-10000');
      expect(node).toBeDefined();
      expect(node!.specs!['Stateful Firewall Throughput']).toContain('800 Gbps');
      expect(node!.specs!['DPU']).toContain('Pensando');
    });

    it('should have CX 8360 as DC spine with 100/400GbE', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-cx-8360');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Spine');
      expect(node!.specs!['Port Configuration']).toContain('400GbE');
    });

    it('should have EVPN-VXLAN support on DC switches', () => {
      const cx8100 = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-cx-8100');
      const cx8360 = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-cx-8360');
      const cx10000 = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-cx-10000');
      expect(cx8100!.supportedProtocols).toContain('EVPN-VXLAN');
      expect(cx8360!.supportedProtocols).toContain('EVPN-VXLAN');
      expect(cx10000!.supportedProtocols).toContain('EVPN-VXLAN');
    });
  });

  // -------------------------------------------------------------------------
  // Network Security deep-dive
  // -------------------------------------------------------------------------
  describe('Network Security products', () => {
    it('should have ClearPass with 3 products', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-clearpass');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
    });

    it('should have ClearPass Policy Manager as core NAC', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-clearpass-policy-manager');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Access Control');
      expect(node!.specs!['Max Endpoints']).toContain('500,000');
    });

    it('should have EdgeConnect with 2 products', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-edgeconnect');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(2);
    });

    it('should have EdgeConnect Enterprise as SD-WAN appliance', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-edgeconnect-enterprise');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('SD-WAN');
      expect(node!.maxThroughput).toBe('10 Gbps');
    });

    it('should have EdgeConnect Microbranch for small sites', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-edgeconnect-microbranch');
      expect(node).toBeDefined();
      expect(node!.maxThroughput).toBe('500 Mbps');
    });
  });

  // -------------------------------------------------------------------------
  // Servers deep-dive
  // -------------------------------------------------------------------------
  describe('Server products', () => {
    it('should have ProLiant with 4 models', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-proliant');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(4);
    });

    it('should have DL380 Gen11 as most popular model', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-proliant-dl380-gen11');
      expect(node).toBeDefined();
      expect(node!.specs!['PCIe Slots']).toContain('8x PCIe Gen5');
      expect(node!.specs!['Max Memory']).toContain('32 DIMM');
    });

    it('should have DL560 Gen11 as 4-socket mission-critical', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-proliant-dl560-gen11');
      expect(node).toBeDefined();
      expect(node!.specs!['Processor']).toContain('4x');
      expect(node!.specs!['Max Memory']).toContain('64 DIMM');
    });

    it('should have ML350 Gen11 as tower server', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-proliant-ml350-gen11');
      expect(node).toBeDefined();
      expect(node!.specs!['Form Factor']).toContain('Tower');
    });

    it('should have Synergy with 1 frame model', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-synergy');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(1);
    });

    it('should have Synergy 12000 as chassis form factor', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-synergy-12000');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('chassis');
    });
  });

  // -------------------------------------------------------------------------
  // Storage deep-dive
  // -------------------------------------------------------------------------
  describe('Storage products', () => {
    it('should have Alletra with 2 products', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-alletra');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(2);
    });

    it('should have Alletra MP as unified multi-protocol', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-alletra-mp');
      expect(node).toBeDefined();
      expect(node!.specs!['Protocols']).toContain('Block');
      expect(node!.specs!['Protocols']).toContain('File');
      expect(node!.specs!['Protocols']).toContain('Object');
      expect(node!.licensingModel).toBe('as-a-service');
    });

    it('should have Alletra Storage Server as software-defined', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-alletra-storage-server');
      expect(node).toBeDefined();
      expect(node!.specs!['Platform']).toContain('ProLiant');
    });
  });

  // -------------------------------------------------------------------------
  // Search functionality
  // -------------------------------------------------------------------------
  describe('search', () => {
    it('should find products by English name (Aruba)', () => {
      const results = searchNodes(hpeArubaCatalog.products, 'Aruba');
      expect(results.length).toBeGreaterThan(10);
    });

    it('should find products by Korean name (아루바)', () => {
      const results = searchNodes(hpeArubaCatalog.products, '아루바');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find CX switches', () => {
      const results = searchNodes(hpeArubaCatalog.products, 'CX');
      expect(results.length).toBeGreaterThanOrEqual(7);
    });

    it('should find ProLiant servers', () => {
      const results = searchNodes(hpeArubaCatalog.products, 'ProLiant');
      expect(results.length).toBeGreaterThanOrEqual(5);
    });

    it('should find node by exact nodeId', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-cx-10000');
      expect(node).toBeDefined();
      expect(node!.name).toBe('Aruba CX 10000');
    });
  });

  // -------------------------------------------------------------------------
  // Leaf node counts
  // -------------------------------------------------------------------------
  describe('leaf node counts', () => {
    it('should match countLeafNodes helper', () => {
      const count = countLeafNodes(hpeArubaCatalog.products);
      const leaves = getLeafNodes(hpeArubaCatalog.products);
      expect(count).toBe(leaves.length);
    });

    it('should have all leaf nodes at depth 2', () => {
      const leaves = getLeafNodes(hpeArubaCatalog.products);
      for (const leaf of leaves) {
        expect(leaf.depth).toBe(2);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Depth distribution
  // -------------------------------------------------------------------------
  describe('depth distribution', () => {
    it('should have 5 nodes at depth 0', () => {
      const nodes = getNodesByDepth(hpeArubaCatalog.products, 0);
      expect(nodes).toHaveLength(5);
    });

    it('should have 8 nodes at depth 1', () => {
      const nodes = getNodesByDepth(hpeArubaCatalog.products, 1);
      expect(nodes).toHaveLength(8);
    });

    it('should have 25 nodes at depth 2', () => {
      const nodes = getNodesByDepth(hpeArubaCatalog.products, 2);
      expect(nodes).toHaveLength(25);
    });
  });

  // -------------------------------------------------------------------------
  // Data quality validation
  // -------------------------------------------------------------------------
  describe('data quality validation', () => {
    describe('architecture planning fields', () => {
      it('should have architectureRole and architectureRoleKo pair completeness', () => {
        const allNodes = getAllNodes(hpeArubaCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.architectureRole && !n.architectureRoleKo) ||
            (!n.architectureRole && n.architectureRoleKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor and recommendedForKo pair completeness', () => {
        const allNodes = getAllNodes(hpeArubaCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.recommendedFor && !n.recommendedForKo) ||
            (!n.recommendedFor && n.recommendedForKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor with matching length in recommendedForKo', () => {
        const allNodes = getAllNodes(hpeArubaCatalog.products);
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
        const allNodes = getAllNodes(hpeArubaCatalog.products);
        for (const node of allNodes) {
          if (node.lifecycle) {
            expect(validValues.has(node.lifecycle)).toBe(true);
          }
        }
      });

      it('should have lifecycle set on all leaf nodes', () => {
        const leaves = getLeafNodes(hpeArubaCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.lifecycle).toBeDefined();
        }
      });
    });

    describe('licensing and form factor', () => {
      it('should have licensingModel on all leaf nodes', () => {
        const leaves = getLeafNodes(hpeArubaCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.licensingModel).toBeDefined();
        }
      });

      it('should have formFactor on all leaf nodes', () => {
        const leaves = getLeafNodes(hpeArubaCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.formFactor).toBeDefined();
        }
      });
    });

    describe('specs completeness', () => {
      it('should have specs on all leaf nodes with at least 5 entries', () => {
        const leaves = getLeafNodes(hpeArubaCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.specs).toBeDefined();
          expect(Object.keys(leaf.specs!).length).toBeGreaterThanOrEqual(5);
        }
      });
    });

    describe('coverage statistics', () => {
      it('should report infraNodeTypes coverage on all depth 0 and 1 nodes', () => {
        const allNodes = getAllNodes(hpeArubaCatalog.products);
        const depth01 = allNodes.filter((n) => n.depth <= 1);
        const depth01WithTypes = depth01.filter(
          (n) => n.infraNodeTypes && n.infraNodeTypes.length > 0,
        );
        expect(depth01WithTypes.length).toBe(depth01.length);
      });

      it('should report architectureRole coverage on all depth 1 nodes', () => {
        const allNodes = getAllNodes(hpeArubaCatalog.products);
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
    it('should have AP-735 as Wi-Fi 7 with MLO support', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-ap-735');
      expect(node).toBeDefined();
      expect(node!.specs!['MLO Support']).toContain('Multi-Link Operation');
    });

    it('should have CX 6300 with VSX support', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-cx-6300');
      expect(node).toBeDefined();
      expect(node!.specs!['VSX']).toContain('active-active');
    });

    it('should have CX 10000 with Pensando DPU', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-cx-10000');
      expect(node).toBeDefined();
      expect(node!.specs!['DPU']).toContain('Pensando');
      expect(node!.maxThroughput).toBe('6.4 Tbps');
    });

    it('should have Alletra MP with 99.9999% availability', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-alletra-mp');
      expect(node).toBeDefined();
      expect(node!.specs!['Availability']).toContain('99.9999%');
    });

    it('should have ClearPass Policy Manager supporting 500k endpoints', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-clearpass-policy-manager');
      expect(node).toBeDefined();
      expect(node!.specs!['Max Endpoints']).toContain('500,000');
    });

    it('should have ProLiant DL360 Gen11 as 1U rack server', () => {
      const node = findNodeById(hpeArubaCatalog.products, 'hpe-aruba-proliant-dl360-gen11');
      expect(node).toBeDefined();
      expect(node!.specs!['Form Factor']).toContain('1U');
    });
  });
});
