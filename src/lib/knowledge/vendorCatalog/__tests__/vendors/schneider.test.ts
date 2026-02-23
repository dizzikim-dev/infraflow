import { describe, it, expect } from 'vitest';
import { schneiderCatalog } from '../../vendors/schneider';
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
// Schneider Electric Catalog -- Data Integrity Tests
// ---------------------------------------------------------------------------

describe('Schneider Electric vendor catalog', () => {
  // -------------------------------------------------------------------------
  // Top-level catalog metadata
  // -------------------------------------------------------------------------
  describe('catalog metadata', () => {
    it('should have correct vendor identity', () => {
      expect(schneiderCatalog.vendorId).toBe('schneider-electric');
      expect(schneiderCatalog.vendorName).toBe('Schneider Electric');
      expect(schneiderCatalog.vendorNameKo).toBe('슈나이더 일렉트릭');
      expect(schneiderCatalog.headquarters).toBe('Rueil-Malmaison, France');
    });

    it('should have valid URLs', () => {
      expect(schneiderCatalog.website).toBe('https://www.se.com');
      expect(schneiderCatalog.productPageUrl).toMatch(/^https:\/\//);
      expect(schneiderCatalog.crawlSource).toMatch(/^https:\/\//);
    });

    it('should have bilingual depth structure', () => {
      expect(schneiderCatalog.depthStructure).toEqual(['category', 'product-line', 'series']);
      expect(schneiderCatalog.depthStructureKo).toEqual(['카테고리', '제품 라인', '시리즈']);
      expect(schneiderCatalog.depthStructure).toHaveLength(schneiderCatalog.depthStructureKo.length);
    });

    it('should have crawl metadata', () => {
      expect(schneiderCatalog.lastCrawled).toBe('2026-02-22');
      expect(schneiderCatalog.crawlSource).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Stats validation
  // -------------------------------------------------------------------------
  describe('catalog stats', () => {
    it('should have accurate totalProducts count', () => {
      const allNodes = getAllNodes(schneiderCatalog.products);
      expect(schneiderCatalog.stats.totalProducts).toBe(allNodes.length);
    });

    it('should have accurate maxDepth', () => {
      const actualMax = getMaxDepth(schneiderCatalog.products);
      expect(schneiderCatalog.stats.maxDepth).toBe(actualMax);
    });

    it('should have accurate categoriesCount', () => {
      expect(schneiderCatalog.stats.categoriesCount).toBe(schneiderCatalog.products.length);
    });

    it('should match computeStats output', () => {
      const computed = computeStats(schneiderCatalog.products);
      expect(schneiderCatalog.stats.totalProducts).toBe(computed.totalProducts);
      expect(schneiderCatalog.stats.maxDepth).toBe(computed.maxDepth);
      expect(schneiderCatalog.stats.categoriesCount).toBe(computed.categoriesCount);
    });

    it('should have 44 total nodes', () => {
      expect(schneiderCatalog.stats.totalProducts).toBe(44);
    });

    it('should have maxDepth of 2', () => {
      expect(schneiderCatalog.stats.maxDepth).toBe(2);
    });

    it('should have 5 top-level categories', () => {
      expect(schneiderCatalog.stats.categoriesCount).toBe(5);
    });
  });

  // -------------------------------------------------------------------------
  // Product tree structure
  // -------------------------------------------------------------------------
  describe('product tree structure', () => {
    it('should have 5 root categories', () => {
      expect(schneiderCatalog.products).toHaveLength(5);
      const names = schneiderCatalog.products.map((p) => p.name);
      expect(names).toEqual([
        'Uninterruptible Power Supply (UPS)',
        'Power Distribution',
        'Cooling',
        'Racks & Enclosures',
        'Management & Monitoring',
      ]);
    });

    it('should have all root nodes at depth 0', () => {
      for (const product of schneiderCatalog.products) {
        expect(product.depth).toBe(0);
      }
    });

    it('should have UPS with 3 product lines', () => {
      const ups = schneiderCatalog.products.find((p) => p.nodeId === 'schneider-ups');
      expect(ups).toBeDefined();
      expect(ups!.children).toHaveLength(3);
    });

    it('should have Power Distribution with 2 product lines', () => {
      const pd = schneiderCatalog.products.find((p) => p.nodeId === 'schneider-power-distribution');
      expect(pd).toBeDefined();
      expect(pd!.children).toHaveLength(2);
    });

    it('should have Cooling with 3 product lines', () => {
      const cooling = schneiderCatalog.products.find((p) => p.nodeId === 'schneider-cooling');
      expect(cooling).toBeDefined();
      expect(cooling!.children).toHaveLength(3);
    });

    it('should have Racks & Enclosures with 1 product line', () => {
      const racks = schneiderCatalog.products.find((p) => p.nodeId === 'schneider-racks');
      expect(racks).toBeDefined();
      expect(racks!.children).toHaveLength(1);
    });

    it('should have Management & Monitoring with 2 product lines', () => {
      const mgmt = schneiderCatalog.products.find((p) => p.nodeId === 'schneider-management');
      expect(mgmt).toBeDefined();
      expect(mgmt!.children).toHaveLength(2);
    });
  });

  // -------------------------------------------------------------------------
  // Node ID uniqueness
  // -------------------------------------------------------------------------
  describe('node ID uniqueness', () => {
    it('should have globally unique nodeIds', () => {
      const allNodes = getAllNodes(schneiderCatalog.products);
      const ids = allNodes.map((n) => n.nodeId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all nodeIds prefixed with schneider-', () => {
      const allNodes = getAllNodes(schneiderCatalog.products);
      for (const node of allNodes) {
        expect(node.nodeId).toMatch(/^schneider-/);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Bilingual completeness
  // -------------------------------------------------------------------------
  describe('bilingual completeness', () => {
    it('should have non-empty name and nameKo for all nodes', () => {
      const allNodes = getAllNodes(schneiderCatalog.products);
      for (const node of allNodes) {
        expect(node.name.length).toBeGreaterThan(0);
        expect(node.nameKo.length).toBeGreaterThan(0);
      }
    });

    it('should have non-empty description and descriptionKo for all nodes', () => {
      const allNodes = getAllNodes(schneiderCatalog.products);
      for (const node of allNodes) {
        expect(node.description.length).toBeGreaterThan(0);
        expect(node.descriptionKo.length).toBeGreaterThan(0);
      }
    });

    it('should have depthLabel and depthLabelKo for all nodes', () => {
      const allNodes = getAllNodes(schneiderCatalog.products);
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
      const allNodes = getAllNodes(schneiderCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).toMatch(/^https:\/\//);
      }
    });

    it('should not have any relative URLs', () => {
      const allNodes = getAllNodes(schneiderCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).not.toMatch(/^\/[^/]/);
      }
    });

    it('should use English URLs (se.com/us/en/)', () => {
      const allNodes = getAllNodes(schneiderCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).toMatch(/se\.com\/us\/en\//);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Depth consistency
  // -------------------------------------------------------------------------
  describe('depth consistency', () => {
    it('should have children with depth exactly parent.depth + 1', () => {
      const allNodes = getAllNodes(schneiderCatalog.products);
      for (const node of allNodes) {
        for (const child of node.children) {
          expect(child.depth).toBe(node.depth + 1);
        }
      }
    });

    it('should have leaf nodes with empty children arrays', () => {
      const leaves = getLeafNodes(schneiderCatalog.products);
      for (const leaf of leaves) {
        expect(leaf.children).toEqual([]);
      }
    });
  });

  // -------------------------------------------------------------------------
  // UPS category deep-dive
  // -------------------------------------------------------------------------
  describe('UPS category', () => {
    it('should have Smart-UPS with 3 series', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-smart-ups');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
    });

    it('should have Galaxy with 4 series', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-galaxy');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(4);
    });

    it('should have Symmetra with 1 series', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-symmetra');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(1);
    });

    it('should have Smart-UPS SRT with specs', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-smart-ups-srt');
      expect(node).toBeDefined();
      expect(node!.lifecycle).toBe('active');
      expect(node!.specs).toBeDefined();
      expect(node!.specs!['Topology']).toBe('Online double-conversion');
      expect(node!.specs!['Capacity Range']).toBe('1-10 kVA');
    });

    it('should have Galaxy VXL with lithium-ion specs', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-galaxy-vxl');
      expect(node).toBeDefined();
      expect(node!.specs!['Battery Type']).toBe('Lithium-ion');
      expect(node!.specs!['Efficiency']).toContain('99%');
    });

    it('should have Symmetra PX with modular specs', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-symmetra-px');
      expect(node).toBeDefined();
      expect(node!.specs!['Redundancy']).toContain('N+1');
      expect(node!.formFactor).toBe('chassis');
    });
  });

  // -------------------------------------------------------------------------
  // Power Distribution category deep-dive
  // -------------------------------------------------------------------------
  describe('Power Distribution category', () => {
    it('should have Rack PDU with 4 variants', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-rack-pdu');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(4);
    });

    it('should have Busway with 1 series', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-busway');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(1);
    });

    it('should have Switched Rack PDU with per-outlet control', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-switched-rack-pdu');
      expect(node).toBeDefined();
      expect(node!.specs!['Switching']).toContain('Per-outlet');
    });

    it('should have Metered-by-Outlet Rack PDU with billing-grade accuracy', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-metered-by-outlet-rack-pdu');
      expect(node).toBeDefined();
      expect(node!.specs!['Accuracy']).toContain('1%');
    });
  });

  // -------------------------------------------------------------------------
  // Cooling category deep-dive
  // -------------------------------------------------------------------------
  describe('Cooling category', () => {
    it('should have InRow Cooling with 3 series', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-inrow');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
    });

    it('should have Uniflair with 2 series', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-uniflair');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(2);
    });

    it('should have Liquid Cooling with 2 series', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-liquid-cooling');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(2);
    });

    it('should have InRow RC with chilled water cooling', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-inrow-rc');
      expect(node).toBeDefined();
      expect(node!.specs!['Cooling Medium']).toBe('Chilled water');
    });

    it('should have EcoStruxure Liquid Cooling with direct-to-chip method', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-ecostruxure-liquid-cooling');
      expect(node).toBeDefined();
      expect(node!.specs!['Cooling Method']).toContain('Direct-to-chip');
    });
  });

  // -------------------------------------------------------------------------
  // Racks & Enclosures category deep-dive
  // -------------------------------------------------------------------------
  describe('Racks & Enclosures category', () => {
    it('should have NetShelter with 4 series', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-netshelter');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(4);
    });

    it('should have NetShelter SX with 42U/48U specs', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-netshelter-sx');
      expect(node).toBeDefined();
      expect(node!.specs!['Rack Units']).toContain('42U');
      expect(node!.specs!['Rack Units']).toContain('48U');
    });

    it('should have NetShelter CX with noise reduction specs', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-netshelter-cx');
      expect(node).toBeDefined();
      expect(node!.specs!['Noise Reduction']).toContain('40 dBA');
    });
  });

  // -------------------------------------------------------------------------
  // Management & Monitoring category deep-dive
  // -------------------------------------------------------------------------
  describe('Management & Monitoring category', () => {
    it('should have EcoStruxure IT with 2 products', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-ecostruxure-it');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(2);
      expect(node!.infraNodeTypes).toContain('grafana');
    });

    it('should have Network Management Cards with 2 products', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-nmc');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(2);
      expect(node!.infraNodeTypes).toContain('grafana');
    });

    it('should have EcoStruxure IT Expert with subscription licensing', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-ecostruxure-it-expert');
      expect(node).toBeDefined();
      expect(node!.licensingModel).toBe('subscription');
      expect(node!.infraNodeTypes).toContain('grafana');
    });

    it('should have AP9641 with SNMP support', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-ap9641');
      expect(node).toBeDefined();
      expect(node!.specs!['Protocols']).toContain('SNMP');
    });

    it('should have AP9643 with environmental monitoring', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-ap9643');
      expect(node).toBeDefined();
      expect(node!.specs!['Environmental']).toContain('temp/humidity');
    });
  });

  // -------------------------------------------------------------------------
  // Search functionality
  // -------------------------------------------------------------------------
  describe('search', () => {
    it('should find Smart-UPS products by English name', () => {
      const results = searchNodes(schneiderCatalog.products, 'Smart-UPS');
      expect(results.length).toBeGreaterThanOrEqual(4);
    });

    it('should find products by Korean name', () => {
      const results = searchNodes(schneiderCatalog.products, '냉각');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find Galaxy products', () => {
      const results = searchNodes(schneiderCatalog.products, 'Galaxy');
      expect(results.length).toBeGreaterThanOrEqual(5);
    });

    it('should find NetShelter products', () => {
      const results = searchNodes(schneiderCatalog.products, 'NetShelter');
      expect(results.length).toBeGreaterThanOrEqual(5);
    });

    it('should find InRow products', () => {
      const results = searchNodes(schneiderCatalog.products, 'InRow');
      expect(results.length).toBeGreaterThanOrEqual(4);
    });

    it('should find EcoStruxure products', () => {
      const results = searchNodes(schneiderCatalog.products, 'EcoStruxure');
      expect(results.length).toBeGreaterThanOrEqual(3);
    });

    it('should find node by exact nodeId', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-galaxy-vxl');
      expect(node).toBeDefined();
      expect(node!.name).toBe('Galaxy VXL');
    });

    it('should find PDU products', () => {
      const results = searchNodes(schneiderCatalog.products, 'PDU');
      expect(results.length).toBeGreaterThanOrEqual(5);
    });
  });

  // -------------------------------------------------------------------------
  // Leaf node counts
  // -------------------------------------------------------------------------
  describe('leaf node counts', () => {
    it('should have correct total leaf nodes', () => {
      const leaves = getLeafNodes(schneiderCatalog.products);
      expect(leaves.length).toBe(28);
    });

    it('should match countLeafNodes helper', () => {
      const count = countLeafNodes(schneiderCatalog.products);
      const leaves = getLeafNodes(schneiderCatalog.products);
      expect(count).toBe(leaves.length);
    });
  });

  // -------------------------------------------------------------------------
  // Depth distribution
  // -------------------------------------------------------------------------
  describe('depth distribution', () => {
    it('should have 5 nodes at depth 0', () => {
      const nodes = getNodesByDepth(schneiderCatalog.products, 0);
      expect(nodes).toHaveLength(5);
    });

    it('should have 11 nodes at depth 1', () => {
      const nodes = getNodesByDepth(schneiderCatalog.products, 1);
      expect(nodes).toHaveLength(11);
    });

    it('should have 28 nodes at depth 2', () => {
      const nodes = getNodesByDepth(schneiderCatalog.products, 2);
      expect(nodes).toHaveLength(28);
    });

    it('should have all depth-2 nodes as leaf nodes', () => {
      const depth2Nodes = getNodesByDepth(schneiderCatalog.products, 2);
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
      it('should have architectureRole and architectureRoleKo pair completeness', () => {
        const allNodes = getAllNodes(schneiderCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.architectureRole && !n.architectureRoleKo) ||
            (!n.architectureRole && n.architectureRoleKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor and recommendedForKo pair completeness', () => {
        const allNodes = getAllNodes(schneiderCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.recommendedFor && !n.recommendedForKo) ||
            (!n.recommendedFor && n.recommendedForKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor with matching length in recommendedForKo', () => {
        const allNodes = getAllNodes(schneiderCatalog.products);
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
      it('should have lifecycle set on all depth-2 nodes', () => {
        const depth2 = getNodesByDepth(schneiderCatalog.products, 2);
        const withoutLifecycle = depth2.filter((n) => !n.lifecycle);
        expect(withoutLifecycle.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have valid lifecycle values when present', () => {
        const validValues = new Set(['active', 'end-of-sale', 'end-of-life']);
        const allNodes = getAllNodes(schneiderCatalog.products);
        for (const node of allNodes) {
          if (node.lifecycle) {
            expect(validValues.has(node.lifecycle)).toBe(true);
          }
        }
      });
    });

    describe('specs completeness on depth-2 nodes', () => {
      it('should have specs with at least 5 entries on all depth-2 nodes', () => {
        const depth2 = getNodesByDepth(schneiderCatalog.products, 2);
        const lacking = depth2.filter(
          (n) => !n.specs || Object.keys(n.specs).length < 5,
        );
        expect(lacking.map((n) => n.nodeId)).toEqual([]);
      });
    });

    describe('coverage statistics', () => {
      it('should have architectureRole on all depth-1 nodes', () => {
        const depth1 = getNodesByDepth(schneiderCatalog.products, 1);
        const withRole = depth1.filter((n) => n.architectureRole);
        expect(withRole.length).toBe(depth1.length);
      });

      it('should have recommendedFor with min 3 entries on depth-1 nodes', () => {
        const depth1 = getNodesByDepth(schneiderCatalog.products, 1);
        const withRecommended = depth1.filter(
          (n) => n.recommendedFor && n.recommendedFor.length >= 3,
        );
        expect(withRecommended.length).toBe(depth1.length);
      });

      it('should have architectureRole on all depth-2 nodes', () => {
        const depth2 = getNodesByDepth(schneiderCatalog.products, 2);
        const withRole = depth2.filter((n) => n.architectureRole);
        expect(withRole.length).toBe(depth2.length);
      });

      it('should have recommendedFor with min 3 entries on depth-2 nodes', () => {
        const depth2 = getNodesByDepth(schneiderCatalog.products, 2);
        const withRecommended = depth2.filter(
          (n) => n.recommendedFor && n.recommendedFor.length >= 3,
        );
        expect(withRecommended.length).toBe(depth2.length);
      });
    });
  });

  // -------------------------------------------------------------------------
  // Specific product spot checks
  // -------------------------------------------------------------------------
  describe('specific product spot checks', () => {
    it('should have Smart-UPS SRT with correct topology', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-smart-ups-srt');
      expect(node).toBeDefined();
      expect(node!.name).toBe('Smart-UPS SRT');
      expect(node!.depth).toBe(2);
      expect(node!.specs!['Topology']).toBe('Online double-conversion');
    });

    it('should have Galaxy VX with modular design', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-galaxy-vx');
      expect(node).toBeDefined();
      expect(node!.specs!['Modular Design']).toContain('module');
      expect(node!.specs!['Capacity Range']).toBe('500-1500 kVA');
    });

    it('should have Canalis Busway with IP55 protection', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-canalis');
      expect(node).toBeDefined();
      expect(node!.specs!['Protection']).toBe('IP55 rated');
    });

    it('should have InRow RD with refrigerant spec', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-inrow-rd');
      expect(node).toBeDefined();
      expect(node!.specs!['Refrigerant']).toBe('R410A');
    });

    it('should have Rear Door Heat Exchangers with capacity spec', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-rear-door-hx');
      expect(node).toBeDefined();
      expect(node!.specs!['Cooling Capacity']).toContain('32 kW');
    });

    it('should have EcoStruxure IT Advisor with CFD modeling', () => {
      const node = findNodeById(schneiderCatalog.products, 'schneider-ecostruxure-it-advisor');
      expect(node).toBeDefined();
      expect(node!.specs!['Analytics']).toContain('CFD');
    });
  });
});
