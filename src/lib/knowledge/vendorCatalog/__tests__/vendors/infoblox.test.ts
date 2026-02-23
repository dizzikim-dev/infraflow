import { describe, it, expect } from 'vitest';
import { infobloxCatalog } from '../../vendors/infoblox';
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
// Infoblox Catalog -- Data Integrity Tests
// ---------------------------------------------------------------------------

describe('Infoblox vendor catalog', () => {
  // -------------------------------------------------------------------------
  // Top-level catalog metadata
  // -------------------------------------------------------------------------
  describe('catalog metadata', () => {
    it('should have correct vendor identity', () => {
      expect(infobloxCatalog.vendorId).toBe('infoblox');
      expect(infobloxCatalog.vendorName).toBe('Infoblox');
      expect(infobloxCatalog.vendorNameKo).toBe('인포블록스');
      expect(infobloxCatalog.headquarters).toBe('Santa Clara, CA, USA');
    });

    it('should have valid URLs', () => {
      expect(infobloxCatalog.website).toBe('https://www.infoblox.com');
      expect(infobloxCatalog.productPageUrl).toMatch(/^https:\/\//);
      expect(infobloxCatalog.crawlSource).toMatch(/^https:\/\//);
    });

    it('should have bilingual depth structure', () => {
      expect(infobloxCatalog.depthStructure).toEqual(['category', 'product-line', 'model']);
      expect(infobloxCatalog.depthStructureKo).toEqual(['카테고리', '제품 라인', '모델']);
      expect(infobloxCatalog.depthStructure).toHaveLength(infobloxCatalog.depthStructureKo.length);
    });

    it('should have crawl metadata', () => {
      expect(infobloxCatalog.lastCrawled).toBe('2026-02-22');
      expect(infobloxCatalog.crawlSource).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Stats validation
  // -------------------------------------------------------------------------
  describe('catalog stats', () => {
    it('should have accurate totalProducts count', () => {
      const allNodes = getAllNodes(infobloxCatalog.products);
      expect(infobloxCatalog.stats.totalProducts).toBe(allNodes.length);
    });

    it('should have accurate maxDepth', () => {
      const actualMax = getMaxDepth(infobloxCatalog.products);
      expect(infobloxCatalog.stats.maxDepth).toBe(actualMax);
    });

    it('should have accurate categoriesCount', () => {
      expect(infobloxCatalog.stats.categoriesCount).toBe(infobloxCatalog.products.length);
    });

    it('should match computeStats output', () => {
      const computed = computeStats(infobloxCatalog.products);
      expect(infobloxCatalog.stats.totalProducts).toBe(computed.totalProducts);
      expect(infobloxCatalog.stats.maxDepth).toBe(computed.maxDepth);
      expect(infobloxCatalog.stats.categoriesCount).toBe(computed.categoriesCount);
    });

    it('should have 33 total nodes', () => {
      expect(infobloxCatalog.stats.totalProducts).toBe(33);
    });

    it('should have maxDepth of 2', () => {
      expect(infobloxCatalog.stats.maxDepth).toBe(2);
    });

    it('should have 4 top-level categories', () => {
      expect(infobloxCatalog.stats.categoriesCount).toBe(4);
    });
  });

  // -------------------------------------------------------------------------
  // Product tree structure
  // -------------------------------------------------------------------------
  describe('product tree structure', () => {
    it('should have 4 root categories', () => {
      expect(infobloxCatalog.products).toHaveLength(4);
      const names = infobloxCatalog.products.map((p) => p.name);
      expect(names).toEqual([
        'DDI (DNS, DHCP, IPAM)',
        'DNS Security',
        'Network Intelligence',
        'Reporting & Analytics',
      ]);
    });

    it('should have all root nodes at depth 0', () => {
      for (const product of infobloxCatalog.products) {
        expect(product.depth).toBe(0);
      }
    });

    it('should have DDI category with 3 product lines', () => {
      const ddi = infobloxCatalog.products.find((p) => p.nodeId === 'infoblox-ddi');
      expect(ddi).toBeDefined();
      expect(ddi!.children).toHaveLength(3);
    });

    it('should have DNS Security with 3 product lines', () => {
      const sec = infobloxCatalog.products.find((p) => p.nodeId === 'infoblox-dns-security');
      expect(sec).toBeDefined();
      expect(sec!.children).toHaveLength(3);
    });

    it('should have Network Intelligence with 3 product lines', () => {
      const net = infobloxCatalog.products.find((p) => p.nodeId === 'infoblox-network-intelligence');
      expect(net).toBeDefined();
      expect(net!.children).toHaveLength(3);
    });

    it('should have Reporting & Analytics with 2 product lines', () => {
      const rpt = infobloxCatalog.products.find((p) => p.nodeId === 'infoblox-reporting-analytics');
      expect(rpt).toBeDefined();
      expect(rpt!.children).toHaveLength(2);
    });
  });

  // -------------------------------------------------------------------------
  // Node ID uniqueness
  // -------------------------------------------------------------------------
  describe('node ID uniqueness', () => {
    it('should have globally unique nodeIds', () => {
      const allNodes = getAllNodes(infobloxCatalog.products);
      const ids = allNodes.map((n) => n.nodeId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all nodeIds prefixed with infoblox-', () => {
      const allNodes = getAllNodes(infobloxCatalog.products);
      for (const node of allNodes) {
        expect(node.nodeId).toMatch(/^infoblox-/);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Bilingual completeness
  // -------------------------------------------------------------------------
  describe('bilingual completeness', () => {
    it('should have non-empty name and nameKo for all nodes', () => {
      const allNodes = getAllNodes(infobloxCatalog.products);
      for (const node of allNodes) {
        expect(node.name.length).toBeGreaterThan(0);
        expect(node.nameKo.length).toBeGreaterThan(0);
      }
    });

    it('should have non-empty description and descriptionKo for all nodes', () => {
      const allNodes = getAllNodes(infobloxCatalog.products);
      for (const node of allNodes) {
        expect(node.description.length).toBeGreaterThan(0);
        expect(node.descriptionKo.length).toBeGreaterThan(0);
      }
    });

    it('should have depthLabel and depthLabelKo for all nodes', () => {
      const allNodes = getAllNodes(infobloxCatalog.products);
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
      const allNodes = getAllNodes(infobloxCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).toMatch(/^https:\/\//);
      }
    });

    it('should not have any relative URLs', () => {
      const allNodes = getAllNodes(infobloxCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).not.toMatch(/^\/[^/]/);
      }
    });

    it('should use English URLs (not Korean URLs)', () => {
      const allNodes = getAllNodes(infobloxCatalog.products);
      const koreanUrls = allNodes.filter((n) => n.sourceUrl.includes('ko_kr') || n.sourceUrl.includes('/kr/ko/'));
      expect(koreanUrls.map((n) => n.nodeId)).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // Depth consistency
  // -------------------------------------------------------------------------
  describe('depth consistency', () => {
    it('should have children with depth exactly parent.depth + 1', () => {
      const allNodes = getAllNodes(infobloxCatalog.products);
      for (const node of allNodes) {
        for (const child of node.children) {
          expect(child.depth).toBe(node.depth + 1);
        }
      }
    });

    it('should have leaf nodes with empty children arrays', () => {
      const leaves = getLeafNodes(infobloxCatalog.products);
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
      const allNodes = getAllNodes(infobloxCatalog.products);
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

      const allNodes = getAllNodes(infobloxCatalog.products);
      for (const node of allNodes) {
        if (node.infraNodeTypes) {
          for (const type of node.infraNodeTypes) {
            expect(validTypes.has(type)).toBe(true);
          }
        }
      }
    });

    it('should have infraNodeTypes on all depth 0 and depth 1 nodes', () => {
      const allNodes = getAllNodes(infobloxCatalog.products);
      const depth01 = allNodes.filter((n) => n.depth <= 1);
      const withoutTypes = depth01.filter(
        (n) => !n.infraNodeTypes || n.infraNodeTypes.length === 0,
      );
      expect(withoutTypes.map((n) => n.nodeId)).toEqual([]);
    });

    it('should map all DDI products to dns type', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-ddi');
      expect(node!.infraNodeTypes).toContain('dns');
    });

    it('should map DNS Security products to dns type', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-dns-security');
      expect(node!.infraNodeTypes).toContain('dns');
    });
  });

  // -------------------------------------------------------------------------
  // DDI category deep-dive
  // -------------------------------------------------------------------------
  describe('DDI category', () => {
    it('should have BloxOne DDI product line', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-bloxone-ddi');
      expect(node).toBeDefined();
      expect(node!.depth).toBe(1);
      expect(node!.children).toHaveLength(1);
    });

    it('should have NIOS DDI with 5 models', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-nios');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(5);
    });

    it('should have NIOS-X as a Service product line', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-nios-x');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(1);
    });

    it('should have NIOS 2205 as entry-level appliance', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-nios-2205');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('appliance');
      expect(node!.licensingModel).toBe('perpetual');
      expect(node!.specs!['DNS QPS']).toBe('50,000');
    });

    it('should have NIOS 4030 as top-tier appliance', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-nios-4030');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('appliance');
      expect(node!.specs!['DNS QPS']).toBe('1,000,000');
    });

    it('should have NIOS Virtual Edition as virtual form factor', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-nios-ve');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('virtual');
      expect(node!.specs!['Hypervisors']).toContain('VMware');
    });

    it('should have BloxOne DDI as cloud form factor', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-bloxone-ddi-cloud');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('cloud');
      expect(node!.licensingModel).toBe('subscription');
    });

    it('should have NIOS-X as cloud with as-a-service licensing', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-nios-x-service');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('cloud');
      expect(node!.licensingModel).toBe('as-a-service');
    });
  });

  // -------------------------------------------------------------------------
  // DNS Security deep-dive
  // -------------------------------------------------------------------------
  describe('DNS Security category', () => {
    it('should have BloxOne Threat Defense with 3 models', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-bloxone-threat-defense');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
    });

    it('should have BloxOne Threat Defense Business', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-btd-business');
      expect(node).toBeDefined();
      expect(node!.lifecycle).toBe('active');
      expect(node!.formFactor).toBe('cloud');
    });

    it('should have BloxOne Threat Defense Advanced with AI features', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-btd-advanced');
      expect(node).toBeDefined();
      expect(node!.specs!['AI/ML']).toBeTruthy();
      expect(node!.securityCapabilities).toContain('DNS tunneling detection');
    });

    it('should have DNS Infrastructure Protection product', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-adp-module');
      expect(node).toBeDefined();
      expect(node!.specs!['DDoS Defense']).toBeTruthy();
    });

    it('should have DNS Firewall product', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-dns-firewall-module');
      expect(node).toBeDefined();
      expect(node!.specs!['Filtering Engine']).toContain('RPZ');
    });
  });

  // -------------------------------------------------------------------------
  // Network Intelligence deep-dive
  // -------------------------------------------------------------------------
  describe('Network Intelligence category', () => {
    it('should have NetMRI product', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-netmri-appliance');
      expect(node).toBeDefined();
      expect(node!.lifecycle).toBe('active');
      expect(node!.specs!['Compliance Frameworks']).toContain('PCI');
    });

    it('should have Network Insight product', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-network-insight-module');
      expect(node).toBeDefined();
      expect(node!.specs!['Rogue Detection']).toBeTruthy();
    });

    it('should have TIDE threat intelligence', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-tide');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('cloud');
      expect(node!.specs!['Output Formats']).toContain('STIX/TAXII');
    });

    it('should have Dossier investigation tool', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-dossier');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('cloud');
      expect(node!.specs!['Enrichment']).toContain('passive DNS');
    });
  });

  // -------------------------------------------------------------------------
  // Reporting & Analytics deep-dive
  // -------------------------------------------------------------------------
  describe('Reporting & Analytics category', () => {
    it('should have Infoblox Reporting', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-reporting-module');
      expect(node).toBeDefined();
      expect(node!.lifecycle).toBe('active');
      expect(node!.formFactor).toBe('appliance');
    });

    it('should have SOC Insights with AI capabilities', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-soc-insights-module');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('cloud');
      expect(node!.specs!['AI/ML']).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Search functionality
  // -------------------------------------------------------------------------
  describe('search', () => {
    it('should find Infoblox products by English name', () => {
      const results = searchNodes(infobloxCatalog.products, 'Infoblox');
      expect(results.length).toBeGreaterThan(5);
    });

    it('should find products by Korean name (DNS)', () => {
      const results = searchNodes(infobloxCatalog.products, 'DNS');
      expect(results.length).toBeGreaterThanOrEqual(5);
    });

    it('should find NIOS products', () => {
      const results = searchNodes(infobloxCatalog.products, 'NIOS');
      expect(results.length).toBeGreaterThanOrEqual(5);
    });

    it('should find BloxOne products', () => {
      const results = searchNodes(infobloxCatalog.products, 'BloxOne');
      expect(results.length).toBeGreaterThanOrEqual(4);
    });

    it('should find threat defense products', () => {
      const results = searchNodes(infobloxCatalog.products, 'Threat Defense');
      expect(results.length).toBeGreaterThanOrEqual(3);
    });

    it('should find node by exact nodeId', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-nios-4030');
      expect(node).toBeDefined();
      expect(node!.name).toBe('NIOS Trinzic X6 4030');
    });
  });

  // -------------------------------------------------------------------------
  // Leaf node counts
  // -------------------------------------------------------------------------
  describe('leaf node counts', () => {
    it('should match countLeafNodes helper', () => {
      const count = countLeafNodes(infobloxCatalog.products);
      const leaves = getLeafNodes(infobloxCatalog.products);
      expect(count).toBe(leaves.length);
    });

    it('should have all leaf nodes at depth 2', () => {
      const leaves = getLeafNodes(infobloxCatalog.products);
      for (const leaf of leaves) {
        expect(leaf.depth).toBe(2);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Depth distribution
  // -------------------------------------------------------------------------
  describe('depth distribution', () => {
    it('should have 4 nodes at depth 0', () => {
      const nodes = getNodesByDepth(infobloxCatalog.products, 0);
      expect(nodes).toHaveLength(4);
    });

    it('should have 11 nodes at depth 1', () => {
      const nodes = getNodesByDepth(infobloxCatalog.products, 1);
      expect(nodes).toHaveLength(11);
    });

    it('should have 18 nodes at depth 2', () => {
      const nodes = getNodesByDepth(infobloxCatalog.products, 2);
      expect(nodes).toHaveLength(18);
    });
  });

  // -------------------------------------------------------------------------
  // Data quality validation
  // -------------------------------------------------------------------------
  describe('data quality validation', () => {
    describe('architecture planning fields', () => {
      it('should have architectureRole and architectureRoleKo pair completeness', () => {
        const allNodes = getAllNodes(infobloxCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.architectureRole && !n.architectureRoleKo) ||
            (!n.architectureRole && n.architectureRoleKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor and recommendedForKo pair completeness', () => {
        const allNodes = getAllNodes(infobloxCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.recommendedFor && !n.recommendedForKo) ||
            (!n.recommendedFor && n.recommendedForKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor with matching length in recommendedForKo', () => {
        const allNodes = getAllNodes(infobloxCatalog.products);
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
        const allNodes = getAllNodes(infobloxCatalog.products);
        for (const node of allNodes) {
          if (node.lifecycle) {
            expect(validValues.has(node.lifecycle)).toBe(true);
          }
        }
      });

      it('should have lifecycle set on all leaf nodes', () => {
        const leaves = getLeafNodes(infobloxCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.lifecycle).toBeDefined();
        }
      });
    });

    describe('licensing and form factor', () => {
      it('should have licensingModel on all leaf nodes', () => {
        const leaves = getLeafNodes(infobloxCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.licensingModel).toBeDefined();
        }
      });

      it('should have formFactor on all leaf nodes', () => {
        const leaves = getLeafNodes(infobloxCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.formFactor).toBeDefined();
        }
      });
    });

    describe('specs completeness', () => {
      it('should have specs on all leaf nodes', () => {
        const leaves = getLeafNodes(infobloxCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.specs).toBeDefined();
          expect(Object.keys(leaf.specs!).length).toBeGreaterThanOrEqual(5);
        }
      });
    });

    describe('coverage statistics', () => {
      it('should report infraNodeTypes coverage on all depth 0 and 1 nodes', () => {
        const allNodes = getAllNodes(infobloxCatalog.products);
        const depth01 = allNodes.filter((n) => n.depth <= 1);
        const depth01WithTypes = depth01.filter(
          (n) => n.infraNodeTypes && n.infraNodeTypes.length > 0,
        );
        expect(depth01WithTypes.length).toBe(depth01.length);
      });

      it('should report architectureRole coverage on all depth 1 nodes', () => {
        const allNodes = getAllNodes(infobloxCatalog.products);
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
    it('should have NIOS 2205 with entry-level specs', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-nios-2205');
      expect(node).toBeDefined();
      expect(node!.specs!['DNS QPS']).toBe('50,000');
      expect(node!.specs!['DHCP Leases/sec']).toBe('5,000');
      expect(node!.specs!['Managed Objects']).toBe('50,000');
    });

    it('should have NIOS 2210 with mid-range specs', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-nios-2210');
      expect(node).toBeDefined();
      expect(node!.specs!['DNS QPS']).toBe('150,000');
      expect(node!.specs!['Network Ports']).toContain('10GbE');
    });

    it('should have NIOS 4010 with high-performance specs', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-nios-4010');
      expect(node).toBeDefined();
      expect(node!.specs!['DNS QPS']).toBe('500,000');
      expect(node!.specs!['DHCP Leases/sec']).toBe('50,000');
    });

    it('should have NIOS 4030 with top-tier specs', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-nios-4030');
      expect(node).toBeDefined();
      expect(node!.specs!['DNS QPS']).toBe('1,000,000');
      expect(node!.specs!['DHCP Leases/sec']).toBe('100,000');
      expect(node!.specs!['Managed Objects']).toBe('1,000,000');
      expect(node!.specs!['Network Ports']).toContain('25GbE');
    });

    it('should have BloxOne Threat Defense Advanced with DNS tunneling detection', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-btd-advanced');
      expect(node).toBeDefined();
      expect(node!.securityCapabilities).toContain('DNS tunneling detection');
      expect(node!.securityCapabilities).toContain('Lookalike domain analysis');
    });

    it('should have TIDE with STIX/TAXII output', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-tide');
      expect(node).toBeDefined();
      expect(node!.specs!['Output Formats']).toContain('STIX/TAXII');
      expect(node!.specs!['Data Sources']).toContain('third-party');
    });

    it('should have SOC Insights with AI-powered correlation', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-soc-insights-module');
      expect(node).toBeDefined();
      expect(node!.specs!['AI/ML']).toContain('correlation');
      expect(node!.securityCapabilities).toContain('AI/ML event correlation');
    });

    it('should have NetMRI with multi-vendor support', () => {
      const node = findNodeById(infobloxCatalog.products, 'infoblox-netmri-appliance');
      expect(node).toBeDefined();
      expect(node!.specs!['Multi-Vendor']).toContain('Cisco');
      expect(node!.specs!['Multi-Vendor']).toContain('Juniper');
    });
  });
});
