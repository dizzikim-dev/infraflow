import { describe, it, expect } from 'vitest';
import { ciscoCatalog } from '../../vendors/cisco';
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
// Cisco Catalog — Data Integrity Tests
// ---------------------------------------------------------------------------

describe('Cisco vendor catalog', () => {
  // -------------------------------------------------------------------------
  // Top-level catalog metadata
  // -------------------------------------------------------------------------
  describe('catalog metadata', () => {
    it('should have correct vendor identity', () => {
      expect(ciscoCatalog.vendorId).toBe('cisco');
      expect(ciscoCatalog.vendorName).toBe('Cisco Systems');
      expect(ciscoCatalog.vendorNameKo).toBe('시스코 시스템즈');
      expect(ciscoCatalog.headquarters).toBe('San Jose, CA, USA');
    });

    it('should have valid URLs', () => {
      expect(ciscoCatalog.website).toBe('https://www.cisco.com');
      expect(ciscoCatalog.productPageUrl).toMatch(/^https:\/\//);
      expect(ciscoCatalog.crawlSource).toMatch(/^https:\/\//);
    });

    it('should have bilingual depth structure', () => {
      expect(ciscoCatalog.depthStructure).toEqual(['category', 'subcategory', 'series']);
      expect(ciscoCatalog.depthStructureKo).toEqual(['카테고리', '하위 카테고리', '시리즈']);
      expect(ciscoCatalog.depthStructure).toHaveLength(ciscoCatalog.depthStructureKo.length);
    });

    it('should have crawl metadata', () => {
      expect(ciscoCatalog.lastCrawled).toBe('2026-02-20');
      expect(ciscoCatalog.crawlSource).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Stats validation
  // -------------------------------------------------------------------------
  describe('catalog stats', () => {
    it('should have accurate totalProducts count', () => {
      const allNodes = getAllNodes(ciscoCatalog.products);
      expect(ciscoCatalog.stats.totalProducts).toBe(allNodes.length);
    });

    it('should have accurate maxDepth', () => {
      const actualMax = getMaxDepth(ciscoCatalog.products);
      expect(ciscoCatalog.stats.maxDepth).toBe(actualMax);
    });

    it('should have accurate categoriesCount', () => {
      expect(ciscoCatalog.stats.categoriesCount).toBe(ciscoCatalog.products.length);
    });

    it('should match computeStats output', () => {
      const computed = computeStats(ciscoCatalog.products);
      expect(ciscoCatalog.stats.totalProducts).toBe(computed.totalProducts);
      expect(ciscoCatalog.stats.maxDepth).toBe(computed.maxDepth);
      expect(ciscoCatalog.stats.categoriesCount).toBe(computed.categoriesCount);
    });

    it('should have 201 total nodes', () => {
      expect(ciscoCatalog.stats.totalProducts).toBe(201);
    });

    it('should have maxDepth of 3', () => {
      expect(ciscoCatalog.stats.maxDepth).toBe(3);
    });

    it('should have 6 top-level categories', () => {
      expect(ciscoCatalog.stats.categoriesCount).toBe(6);
    });
  });

  // -------------------------------------------------------------------------
  // Product tree structure
  // -------------------------------------------------------------------------
  describe('product tree structure', () => {
    it('should have 6 root categories', () => {
      expect(ciscoCatalog.products).toHaveLength(6);
      const names = ciscoCatalog.products.map((p) => p.name);
      expect(names).toEqual([
        'Networking',
        'Security',
        'Computing',
        'Collaboration',
        'Observability',
        'Network Management',
      ]);
    });

    it('should have all root nodes at depth 0', () => {
      for (const product of ciscoCatalog.products) {
        expect(product.depth).toBe(0);
      }
    });

    it('should have Networking with 7 subcategories', () => {
      const networking = ciscoCatalog.products.find((p) => p.nodeId === 'cisco-networking');
      expect(networking).toBeDefined();
      expect(networking!.children).toHaveLength(7);
    });

    it('should have Security with 4 subcategories', () => {
      const security = ciscoCatalog.products.find((p) => p.nodeId === 'cisco-security');
      expect(security).toBeDefined();
      expect(security!.children).toHaveLength(4);
    });

    it('should have Computing with 4 subcategories', () => {
      const computing = ciscoCatalog.products.find((p) => p.nodeId === 'cisco-computing');
      expect(computing).toBeDefined();
      expect(computing!.children).toHaveLength(4);
    });

    it('should have Collaboration with 4 subcategories', () => {
      const collab = ciscoCatalog.products.find((p) => p.nodeId === 'cisco-collaboration');
      expect(collab).toBeDefined();
      expect(collab!.children).toHaveLength(4);
    });

    it('should have Observability with 5 direct products', () => {
      const obs = ciscoCatalog.products.find((p) => p.nodeId === 'cisco-observability');
      expect(obs).toBeDefined();
      expect(obs!.children).toHaveLength(5);
    });

    it('should have Network Management with 7 direct products', () => {
      const mgmt = ciscoCatalog.products.find((p) => p.nodeId === 'cisco-network-management');
      expect(mgmt).toBeDefined();
      expect(mgmt!.children).toHaveLength(7);
    });
  });

  // -------------------------------------------------------------------------
  // Node ID uniqueness
  // -------------------------------------------------------------------------
  describe('node ID uniqueness', () => {
    it('should have globally unique nodeIds', () => {
      const allNodes = getAllNodes(ciscoCatalog.products);
      const ids = allNodes.map((n) => n.nodeId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all nodeIds prefixed with cisco-', () => {
      const allNodes = getAllNodes(ciscoCatalog.products);
      for (const node of allNodes) {
        expect(node.nodeId).toMatch(/^cisco-/);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Bilingual completeness
  // -------------------------------------------------------------------------
  describe('bilingual completeness', () => {
    it('should have non-empty name and nameKo for all nodes', () => {
      const allNodes = getAllNodes(ciscoCatalog.products);
      for (const node of allNodes) {
        expect(node.name.length).toBeGreaterThan(0);
        expect(node.nameKo.length).toBeGreaterThan(0);
      }
    });

    it('should have non-empty description and descriptionKo for all nodes', () => {
      const allNodes = getAllNodes(ciscoCatalog.products);
      for (const node of allNodes) {
        expect(node.description.length).toBeGreaterThan(0);
        expect(node.descriptionKo.length).toBeGreaterThan(0);
      }
    });

    it('should have depthLabel and depthLabelKo for all nodes', () => {
      const allNodes = getAllNodes(ciscoCatalog.products);
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
      const allNodes = getAllNodes(ciscoCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).toMatch(/^https:\/\//);
      }
    });

    it('should not have any relative URLs', () => {
      const allNodes = getAllNodes(ciscoCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).not.toMatch(/^\/[^/]/);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Depth consistency
  // -------------------------------------------------------------------------
  describe('depth consistency', () => {
    it('should have children with depth exactly parent.depth + 1', () => {
      const allNodes = getAllNodes(ciscoCatalog.products);
      for (const node of allNodes) {
        for (const child of node.children) {
          expect(child.depth).toBe(node.depth + 1);
        }
      }
    });

    it('should have leaf nodes with empty children arrays', () => {
      const leaves = getLeafNodes(ciscoCatalog.products);
      for (const leaf of leaves) {
        expect(leaf.children).toEqual([]);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Networking category deep-dive
  // -------------------------------------------------------------------------
  describe('Networking category', () => {
    it('should have Campus Switches with 19 series', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-campus-switches');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(19);
      expect(node!.infraNodeTypes).toEqual(['switch-l2', 'switch-l3']);
    });

    it('should have Data Center Switches with 9 series', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-dc-switches');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(9);
    });

    it('should have Storage Networking with 4 series', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-storage-networking');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(4);
      expect(node!.infraNodeTypes).toEqual(['san-nas']);
    });

    it('should have Industrial Switches with 14 series', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-industrial-switches');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(14);
    });

    it('should have Routers with 3 sub-subcategories', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-routers');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
      expect(node!.children.map((c) => c.nodeId)).toEqual([
        'cisco-branch-routers',
        'cisco-industrial-routers',
        'cisco-sp-routers',
      ]);
    });

    it('should have Branch Routers with 9 series at depth 3', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-branch-routers');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(9);
      for (const child of node!.children) {
        expect(child.depth).toBe(3);
      }
    });

    it('should have Industrial Routers with 6 series', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-industrial-routers');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(6);
    });

    it('should have Service Provider Routers with 17 series', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-sp-routers');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(17);
    });

    it('should have Wireless with 11 series', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-wireless');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(11);
    });

    it('should have Optical Networking with 5 series', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-optical');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(5);
    });
  });

  // -------------------------------------------------------------------------
  // Security category deep-dive
  // -------------------------------------------------------------------------
  describe('Security category', () => {
    it('should have Firewalls with 10 series', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-firewalls');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(10);
      expect(node!.infraNodeTypes).toEqual(['firewall']);
    });

    it('should have Identity & Access with 5 series', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-identity');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(5);
      expect(node!.infraNodeTypes).toContain('nac');
      expect(node!.infraNodeTypes).toContain('mfa');
    });

    it('should have Threat Protection with 13 series', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-threat-protection');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(13);
    });

    it('should have Security Suites with 6 series', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-security-suites');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(6);
    });
  });

  // -------------------------------------------------------------------------
  // Computing category deep-dive
  // -------------------------------------------------------------------------
  describe('Computing category', () => {
    it('should have Servers with 6 series', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-servers');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(6);
    });

    it('should have Fabric Interconnects with 4 series', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-fabric-interconnects');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(4);
    });

    it('should have Hyperconverged with 1 product', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-hyperconverged');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(1);
    });
  });

  // -------------------------------------------------------------------------
  // Search functionality
  // -------------------------------------------------------------------------
  describe('search', () => {
    it('should find Catalyst products by English name', () => {
      const results = searchNodes(ciscoCatalog.products, 'Catalyst');
      expect(results.length).toBeGreaterThan(10);
    });

    it('should find products by Korean name', () => {
      const results = searchNodes(ciscoCatalog.products, '방화벽');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find Nexus products', () => {
      const results = searchNodes(ciscoCatalog.products, 'Nexus');
      expect(results.length).toBeGreaterThan(5);
    });

    it('should find Meraki products', () => {
      const results = searchNodes(ciscoCatalog.products, 'Meraki');
      expect(results.length).toBeGreaterThanOrEqual(5);
    });

    it('should find UCS products', () => {
      const results = searchNodes(ciscoCatalog.products, 'UCS');
      expect(results.length).toBeGreaterThanOrEqual(5);
    });

    it('should find Webex products', () => {
      const results = searchNodes(ciscoCatalog.products, 'Webex');
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('should find ThousandEyes products', () => {
      const results = searchNodes(ciscoCatalog.products, 'ThousandEyes');
      expect(results.length).toBeGreaterThanOrEqual(3);
    });

    it('should find node by exact nodeId', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-firewall-4200');
      expect(node).toBeDefined();
      expect(node!.name).toBe('Secure Firewall 4200');
    });
  });

  // -------------------------------------------------------------------------
  // Leaf node counts
  // -------------------------------------------------------------------------
  describe('leaf node counts', () => {
    it('should have 173 total leaf nodes', () => {
      const leaves = getLeafNodes(ciscoCatalog.products);
      expect(leaves).toHaveLength(173);
    });

    it('should match countLeafNodes helper', () => {
      const count = countLeafNodes(ciscoCatalog.products);
      const leaves = getLeafNodes(ciscoCatalog.products);
      expect(count).toBe(leaves.length);
    });
  });

  // -------------------------------------------------------------------------
  // InfraNodeType mapping
  // -------------------------------------------------------------------------
  describe('infraNodeType mapping', () => {
    it('should have infraNodeTypes on category/subcategory nodes that map to InfraFlow', () => {
      const allNodes = getAllNodes(ciscoCatalog.products);
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

      const allNodes = getAllNodes(ciscoCatalog.products);
      for (const node of allNodes) {
        if (node.infraNodeTypes) {
          for (const type of node.infraNodeTypes) {
            expect(validTypes.has(type)).toBe(true);
          }
        }
      }
    });

    it('should map firewall subcategory to firewall type', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-firewalls');
      expect(node!.infraNodeTypes).toContain('firewall');
    });

    it('should map campus switches to switch types', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-campus-switches');
      expect(node!.infraNodeTypes).toContain('switch-l2');
      expect(node!.infraNodeTypes).toContain('switch-l3');
    });

    it('should map routers to router and sd-wan types', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-routers');
      expect(node!.infraNodeTypes).toContain('router');
      expect(node!.infraNodeTypes).toContain('sd-wan');
    });

    it('should map storage networking to san-nas type', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-storage-networking');
      expect(node!.infraNodeTypes).toContain('san-nas');
    });
  });

  // -------------------------------------------------------------------------
  // Specific product verification (spot checks)
  // -------------------------------------------------------------------------
  describe('specific product spot checks', () => {
    it('should have Catalyst 9300 with correct URL', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-catalyst-9300');
      expect(node).toBeDefined();
      expect(node!.name).toBe('Catalyst 9300 Series');
      expect(node!.nameKo).toBe('Catalyst 9300 시리즈');
      expect(node!.sourceUrl).toMatch(/catalyst-9300/);
    });

    it('should have Nexus 9000 with correct data', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-nexus-9000');
      expect(node).toBeDefined();
      expect(node!.name).toBe('Nexus 9000 Series');
      expect(node!.depth).toBe(2);
    });

    it('should have ISE with correct data', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-ise');
      expect(node).toBeDefined();
      expect(node!.name).toBe('Identity Services Engine (ISE)');
      expect(node!.descriptionKo).toBe('NAC');
    });

    it('should have Intersight with correct data', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-intersight');
      expect(node).toBeDefined();
      expect(node!.name).toBe('Intersight');
      expect(node!.descriptionKo).toBe('클라우드 운영');
    });

    it('should have Catalyst Center with correct data', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-catalyst-center');
      expect(node).toBeDefined();
      expect(node!.name).toBe('Catalyst Center (DNA Center)');
    });

    it('should have XDR with correct data', () => {
      const node = findNodeById(ciscoCatalog.products, 'cisco-xdr');
      expect(node).toBeDefined();
      expect(node!.descriptionKo).toBe('통합 위협 탐지');
    });
  });

  // -------------------------------------------------------------------------
  // Depth distribution
  // -------------------------------------------------------------------------
  describe('depth distribution', () => {
    it('should have 6 nodes at depth 0', () => {
      const nodes = getNodesByDepth(ciscoCatalog.products, 0);
      expect(nodes).toHaveLength(6);
    });

    it('should have correct count at depth 1', () => {
      const nodes = getNodesByDepth(ciscoCatalog.products, 1);
      // 7 (networking) + 4 (security) + 4 (computing) + 4 (collaboration) + 5 (observability) + 7 (netmgmt) = 31
      expect(nodes).toHaveLength(31);
    });

    it('should have nodes at depth 3 only under routers', () => {
      const depth3Nodes = getNodesByDepth(ciscoCatalog.products, 3);
      expect(depth3Nodes.length).toBe(32); // 9 branch + 6 industrial + 17 SP
      // All depth 3 nodes should be under routers
      for (const node of depth3Nodes) {
        expect(node.children).toEqual([]);
      }
    });
  });
});
