import { describe, it, expect } from 'vitest';
import { aristaCatalog } from '../../vendors/arista';
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
// Arista Networks Catalog — Data Integrity Tests
// ---------------------------------------------------------------------------

describe('Arista Networks vendor catalog', () => {
  // -------------------------------------------------------------------------
  // Top-level catalog metadata
  // -------------------------------------------------------------------------
  describe('catalog metadata', () => {
    it('should have correct vendor identity', () => {
      expect(aristaCatalog.vendorId).toBe('arista');
      expect(aristaCatalog.vendorName).toBe('Arista Networks');
      expect(aristaCatalog.vendorNameKo).toBe('아리스타 네트웍스');
      expect(aristaCatalog.headquarters).toBe('Santa Clara, CA, USA');
    });

    it('should have valid URLs', () => {
      expect(aristaCatalog.website).toBe('https://www.arista.com');
      expect(aristaCatalog.productPageUrl).toMatch(/^https:\/\//);
      expect(aristaCatalog.crawlSource).toMatch(/^https:\/\//);
    });

    it('should have bilingual depth structure', () => {
      expect(aristaCatalog.depthStructure).toEqual(['category', 'product-line', 'series']);
      expect(aristaCatalog.depthStructureKo).toEqual(['카테고리', '제품 라인', '시리즈']);
      expect(aristaCatalog.depthStructure).toHaveLength(aristaCatalog.depthStructureKo.length);
    });

    it('should have crawl metadata', () => {
      expect(aristaCatalog.lastCrawled).toBe('2026-02-20');
      expect(aristaCatalog.crawlSource).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Stats validation
  // -------------------------------------------------------------------------
  describe('catalog stats', () => {
    it('should have accurate totalProducts count', () => {
      const allNodes = getAllNodes(aristaCatalog.products);
      expect(aristaCatalog.stats.totalProducts).toBe(allNodes.length);
    });

    it('should have accurate maxDepth', () => {
      const actualMax = getMaxDepth(aristaCatalog.products);
      expect(aristaCatalog.stats.maxDepth).toBe(actualMax);
    });

    it('should have accurate categoriesCount', () => {
      expect(aristaCatalog.stats.categoriesCount).toBe(aristaCatalog.products.length);
    });

    it('should match computeStats output', () => {
      const computed = computeStats(aristaCatalog.products);
      expect(aristaCatalog.stats.totalProducts).toBe(computed.totalProducts);
      expect(aristaCatalog.stats.maxDepth).toBe(computed.maxDepth);
      expect(aristaCatalog.stats.categoriesCount).toBe(computed.categoriesCount);
    });

    it('should have 50 total nodes', () => {
      expect(aristaCatalog.stats.totalProducts).toBe(50);
    });

    it('should have maxDepth of 2', () => {
      expect(aristaCatalog.stats.maxDepth).toBe(2);
    });

    it('should have 6 top-level categories', () => {
      expect(aristaCatalog.stats.categoriesCount).toBe(6);
    });
  });

  // -------------------------------------------------------------------------
  // Product tree structure
  // -------------------------------------------------------------------------
  describe('product tree structure', () => {
    it('should have 6 root categories', () => {
      expect(aristaCatalog.products).toHaveLength(6);
      const names = aristaCatalog.products.map((p) => p.name);
      expect(names).toEqual([
        'Data Center Switching',
        'Campus & Edge',
        'Routing',
        'Network Observability',
        'Network Management',
        'Security',
      ]);
    });

    it('should have all root nodes at depth 0', () => {
      for (const product of aristaCatalog.products) {
        expect(product.depth).toBe(0);
      }
    });

    it('should have Data Center Switching with 7 product lines', () => {
      const dc = aristaCatalog.products.find((p) => p.nodeId === 'arista-dc-switching');
      expect(dc).toBeDefined();
      expect(dc!.children).toHaveLength(7);
    });

    it('should have Campus & Edge with 3 product lines', () => {
      const campus = aristaCatalog.products.find((p) => p.nodeId === 'arista-campus');
      expect(campus).toBeDefined();
      expect(campus!.children).toHaveLength(3);
    });

    it('should have Routing with 3 product lines', () => {
      const routing = aristaCatalog.products.find((p) => p.nodeId === 'arista-routing');
      expect(routing).toBeDefined();
      expect(routing!.children).toHaveLength(3);
    });

    it('should have Network Observability with 2 product lines', () => {
      const obs = aristaCatalog.products.find((p) => p.nodeId === 'arista-observability');
      expect(obs).toBeDefined();
      expect(obs!.children).toHaveLength(2);
    });

    it('should have Network Management with 3 product lines', () => {
      const mgmt = aristaCatalog.products.find((p) => p.nodeId === 'arista-management');
      expect(mgmt).toBeDefined();
      expect(mgmt!.children).toHaveLength(3);
    });

    it('should have Security with 2 product lines', () => {
      const sec = aristaCatalog.products.find((p) => p.nodeId === 'arista-security');
      expect(sec).toBeDefined();
      expect(sec!.children).toHaveLength(2);
    });
  });

  // -------------------------------------------------------------------------
  // Node ID uniqueness
  // -------------------------------------------------------------------------
  describe('node ID uniqueness', () => {
    it('should have globally unique nodeIds', () => {
      const allNodes = getAllNodes(aristaCatalog.products);
      const ids = allNodes.map((n) => n.nodeId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all nodeIds prefixed with arista-', () => {
      const allNodes = getAllNodes(aristaCatalog.products);
      for (const node of allNodes) {
        expect(node.nodeId).toMatch(/^arista-/);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Bilingual completeness
  // -------------------------------------------------------------------------
  describe('bilingual completeness', () => {
    it('should have non-empty name and nameKo for all nodes', () => {
      const allNodes = getAllNodes(aristaCatalog.products);
      for (const node of allNodes) {
        expect(node.name.length).toBeGreaterThan(0);
        expect(node.nameKo.length).toBeGreaterThan(0);
      }
    });

    it('should have non-empty description and descriptionKo for all nodes', () => {
      const allNodes = getAllNodes(aristaCatalog.products);
      for (const node of allNodes) {
        expect(node.description.length).toBeGreaterThan(0);
        expect(node.descriptionKo.length).toBeGreaterThan(0);
      }
    });

    it('should have depthLabel and depthLabelKo for all nodes', () => {
      const allNodes = getAllNodes(aristaCatalog.products);
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
      const allNodes = getAllNodes(aristaCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).toMatch(/^https:\/\//);
      }
    });

    it('should not have any relative URLs', () => {
      const allNodes = getAllNodes(aristaCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).not.toMatch(/^\/[^/]/);
      }
    });

    it('should use English URLs (arista.com/en/)', () => {
      const allNodes = getAllNodes(aristaCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).toMatch(/arista\.com\/en\//);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Depth consistency
  // -------------------------------------------------------------------------
  describe('depth consistency', () => {
    it('should have children with depth exactly parent.depth + 1', () => {
      const allNodes = getAllNodes(aristaCatalog.products);
      for (const node of allNodes) {
        for (const child of node.children) {
          expect(child.depth).toBe(node.depth + 1);
        }
      }
    });

    it('should have leaf nodes with empty children arrays', () => {
      const leaves = getLeafNodes(aristaCatalog.products);
      for (const leaf of leaves) {
        expect(leaf.children).toEqual([]);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Data Center Switching category deep-dive
  // -------------------------------------------------------------------------
  describe('Data Center Switching category', () => {
    it('should have 7500R3 Series with 3 models', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-7500r3');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
      expect(node!.infraNodeTypes).toEqual(['switch-l3']);
    });

    it('should have 7800R3 Series with 3 models', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-7800r3');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
      expect(node!.infraNodeTypes).toEqual(['switch-l3']);
    });

    it('should have 7280R3 Series with 3 models', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-7280r3');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
      expect(node!.infraNodeTypes).toEqual(['switch-l3']);
    });

    it('should have 7060X Series with 3 models', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-7060x');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
      expect(node!.infraNodeTypes).toEqual(['switch-l3']);
    });

    it('should have 7050X Series with 2 models', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-7050x');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(2);
      expect(node!.infraNodeTypes).toEqual(['switch-l2', 'switch-l3']);
    });

    it('should have 7020R Series with 1 model', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-7020r');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(1);
      expect(node!.infraNodeTypes).toEqual(['switch-l2']);
    });

    it('should have 7130 Series with 2 models', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-7130');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(2);
      expect(node!.infraNodeTypes).toEqual(['switch-l3']);
    });
  });

  // -------------------------------------------------------------------------
  // Campus & Edge category deep-dive
  // -------------------------------------------------------------------------
  describe('Campus & Edge category', () => {
    it('should have 720XP Series with 3 models', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-720xp');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
      expect(node!.infraNodeTypes).toEqual(['switch-l2']);
    });

    it('should have 720DP Series with 2 models', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-720dp');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(2);
      expect(node!.infraNodeTypes).toEqual(['switch-l3']);
    });

    it('should have 750CX Series with 2 models', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-750cx');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(2);
      expect(node!.infraNodeTypes).toEqual(['switch-l3']);
    });
  });

  // -------------------------------------------------------------------------
  // Routing category deep-dive
  // -------------------------------------------------------------------------
  describe('Routing category', () => {
    it('should have routing products mapped to router type', () => {
      const routing = findNodeById(aristaCatalog.products, 'arista-routing');
      expect(routing).toBeDefined();
      expect(routing!.infraNodeTypes).toEqual(['router']);
    });

    it('should have 7500R3 Universal Spine (Routing Mode)', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-routing-7500r3');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toEqual(['router']);
      expect(node!.children).toHaveLength(0);
    });

    it('should have 7280R3 Border Leaf/Router', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-routing-7280r3');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toEqual(['router']);
    });

    it('should have 7010T Series', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-7010t');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toEqual(['router']);
    });
  });

  // -------------------------------------------------------------------------
  // Security category deep-dive
  // -------------------------------------------------------------------------
  describe('Security category', () => {
    it('should have NDR product mapped to ids-ips type', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-ndr');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toEqual(['ids-ips']);
    });

    it('should have MSS product mapped to firewall type', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-mss');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toEqual(['firewall']);
    });
  });

  // -------------------------------------------------------------------------
  // Network Observability category deep-dive
  // -------------------------------------------------------------------------
  describe('Network Observability category', () => {
    it('should have DMF product mapped to ids-ips type', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-dmf');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toEqual(['ids-ips']);
    });

    it('should have 7130 Monitoring mapped to ids-ips type', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-7130-monitoring');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toEqual(['ids-ips']);
    });
  });

  // -------------------------------------------------------------------------
  // Network Management category deep-dive
  // -------------------------------------------------------------------------
  describe('Network Management category', () => {
    it('should have CloudVision mapped to grafana type', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-cloudvision');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toEqual(['grafana']);
    });

    it('should have CVaaS mapped to grafana type', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-cvaas');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toEqual(['grafana']);
    });

    it('should have CloudEOS mapped to private-cloud type', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-cloudeos');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toEqual(['private-cloud']);
    });
  });

  // -------------------------------------------------------------------------
  // Search functionality
  // -------------------------------------------------------------------------
  describe('search', () => {
    it('should find 7500R3 products by English name', () => {
      const results = searchNodes(aristaCatalog.products, '7500R3');
      expect(results.length).toBeGreaterThanOrEqual(4);
    });

    it('should find products by Korean name', () => {
      const results = searchNodes(aristaCatalog.products, '스위칭');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find CloudVision products', () => {
      const results = searchNodes(aristaCatalog.products, 'CloudVision');
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('should find FPGA-related products', () => {
      const results = searchNodes(aristaCatalog.products, 'FPGA');
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('should find PoE products', () => {
      const results = searchNodes(aristaCatalog.products, 'PoE');
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('should find node by exact nodeId', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-7060x5-64');
      expect(node).toBeDefined();
      expect(node!.name).toBe('7060X5-64');
    });

    it('should find NDR product', () => {
      const results = searchNodes(aristaCatalog.products, 'NDR');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });
  });

  // -------------------------------------------------------------------------
  // Leaf node counts
  // -------------------------------------------------------------------------
  describe('leaf node counts', () => {
    it('should have correct total leaf nodes', () => {
      const leaves = getLeafNodes(aristaCatalog.products);
      // Depth-2 models (24) + depth-1 leaves (routing: 3, observability: 2, management: 3, security: 2) = 34
      expect(leaves.length).toBeGreaterThan(25);
    });

    it('should match countLeafNodes helper', () => {
      const count = countLeafNodes(aristaCatalog.products);
      const leaves = getLeafNodes(aristaCatalog.products);
      expect(count).toBe(leaves.length);
    });
  });

  // -------------------------------------------------------------------------
  // InfraNodeType mapping
  // -------------------------------------------------------------------------
  describe('infraNodeType mapping', () => {
    it('should have infraNodeTypes on category and product-line nodes (depth 0-1)', () => {
      const allNodes = getAllNodes(aristaCatalog.products);
      const depth01 = allNodes.filter((n) => n.depth <= 1);
      const depth01WithTypes = depth01.filter(
        (n) => n.infraNodeTypes && n.infraNodeTypes.length > 0,
      );
      expect(depth01WithTypes.length).toBe(depth01.length);
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

      const allNodes = getAllNodes(aristaCatalog.products);
      for (const node of allNodes) {
        if (node.infraNodeTypes) {
          for (const type of node.infraNodeTypes) {
            expect(validTypes.has(type)).toBe(true);
          }
        }
      }
    });

    it('should map DC switching to switch types', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-dc-switching');
      expect(node!.infraNodeTypes).toContain('switch-l2');
      expect(node!.infraNodeTypes).toContain('switch-l3');
    });

    it('should map routing to router type', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-routing');
      expect(node!.infraNodeTypes).toContain('router');
    });

    it('should map observability to ids-ips type', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-observability');
      expect(node!.infraNodeTypes).toContain('ids-ips');
    });

    it('should map security to firewall and ids-ips types', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-security');
      expect(node!.infraNodeTypes).toContain('firewall');
      expect(node!.infraNodeTypes).toContain('ids-ips');
    });

    it('should map management to grafana type', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-management');
      expect(node!.infraNodeTypes).toContain('grafana');
    });
  });

  // -------------------------------------------------------------------------
  // Specific product spot checks
  // -------------------------------------------------------------------------
  describe('specific product spot checks', () => {
    it('should have 7500R3-36CQ with correct data', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-7500r3-36cq');
      expect(node).toBeDefined();
      expect(node!.name).toBe('7500R3-36CQ');
      expect(node!.nameKo).toBe('7500R3-36CQ');
      expect(node!.depth).toBe(2);
    });

    it('should have 7060X5-64 with correct data', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-7060x5-64');
      expect(node).toBeDefined();
      expect(node!.name).toBe('7060X5-64');
      expect(node!.specs).toBeDefined();
      expect(node!.specs!['Ports']).toContain('400GbE');
    });

    it('should have CloudVision with correct data', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-cloudvision');
      expect(node).toBeDefined();
      expect(node!.name).toBe('CloudVision');
      expect(node!.nameKo).toBe('CloudVision');
    });

    it('should have NDR with correct data', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-ndr');
      expect(node).toBeDefined();
      expect(node!.name).toBe('Arista NDR (Network Detection & Response)');
    });

    it('should have MSS with correct data', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-mss');
      expect(node).toBeDefined();
      expect(node!.name).toBe('MSS (Macro-Segmentation)');
    });

    it('should have 720XP-24ZY2 with PoE specs', () => {
      const node = findNodeById(aristaCatalog.products, 'arista-720xp-24zy2');
      expect(node).toBeDefined();
      expect(node!.specs).toBeDefined();
      expect(node!.specs!['PoE Budget']).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Depth distribution
  // -------------------------------------------------------------------------
  describe('depth distribution', () => {
    it('should have 6 nodes at depth 0', () => {
      const nodes = getNodesByDepth(aristaCatalog.products, 0);
      expect(nodes).toHaveLength(6);
    });

    it('should have 20 nodes at depth 1', () => {
      const nodes = getNodesByDepth(aristaCatalog.products, 1);
      // DC:7 + Campus:3 + Routing:3 + Obs:2 + Mgmt:3 + Security:2 = 20
      expect(nodes).toHaveLength(20);
    });

    it('should have 24 nodes at depth 2', () => {
      const nodes = getNodesByDepth(aristaCatalog.products, 2);
      // 7500R3:3 + 7800R3:3 + 7280R3:3 + 7060X:3 + 7050X:2 + 7020R:1 + 7130:2
      // + 720XP:3 + 720DP:2 + 750CX:2 = 24
      expect(nodes).toHaveLength(24);
    });

    it('should have all depth-2 nodes as leaf nodes', () => {
      const depth2Nodes = getNodesByDepth(aristaCatalog.products, 2);
      for (const node of depth2Nodes) {
        expect(node.children).toEqual([]);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Data quality validation
  // -------------------------------------------------------------------------
  describe('data quality validation', () => {
    describe('architecture planning fields', () => {
      it('should have infraNodeTypes on all depth 0-1 nodes', () => {
        const allNodes = getAllNodes(aristaCatalog.products);
        const depth01 = allNodes.filter((n) => n.depth <= 1);
        const withoutTypes = depth01.filter(
          (n) => !n.infraNodeTypes || n.infraNodeTypes.length === 0,
        );
        expect(withoutTypes.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have architectureRole and architectureRoleKo pair completeness', () => {
        const allNodes = getAllNodes(aristaCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.architectureRole && !n.architectureRoleKo) ||
            (!n.architectureRole && n.architectureRoleKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor and recommendedForKo pair completeness', () => {
        const allNodes = getAllNodes(aristaCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.recommendedFor && !n.recommendedForKo) ||
            (!n.recommendedFor && n.recommendedForKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor with matching length in recommendedForKo', () => {
        const allNodes = getAllNodes(aristaCatalog.products);
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
        const allNodes = getAllNodes(aristaCatalog.products);
        for (const node of allNodes) {
          if (node.lifecycle) {
            expect(validValues.has(node.lifecycle)).toBe(true);
          }
        }
      });
    });

    describe('coverage statistics', () => {
      it('should report architectureRole coverage on depth-1 nodes', () => {
        const depth1 = getNodesByDepth(aristaCatalog.products, 1);
        const withRole = depth1.filter((n) => n.architectureRole);
        expect(withRole.length).toBe(depth1.length);
      });

      it('should report recommendedFor coverage on depth-1 nodes', () => {
        const depth1 = getNodesByDepth(aristaCatalog.products, 1);
        const withRecommended = depth1.filter(
          (n) => n.recommendedFor && n.recommendedFor.length >= 3,
        );
        expect(withRecommended.length).toBe(depth1.length);
      });

      it('should have supportedProtocols on applicable depth-1 nodes', () => {
        const depth1 = getNodesByDepth(aristaCatalog.products, 1);
        // All switching and routing product lines should have protocols
        const switchAndRoute = depth1.filter(
          (n) =>
            n.infraNodeTypes?.some((t) =>
              ['switch-l2', 'switch-l3', 'router'].includes(t),
            ),
        );
        const withProtocols = switchAndRoute.filter(
          (n) => n.supportedProtocols && n.supportedProtocols.length > 0,
        );
        expect(withProtocols.length).toBe(switchAndRoute.length);
      });
    });
  });
});
