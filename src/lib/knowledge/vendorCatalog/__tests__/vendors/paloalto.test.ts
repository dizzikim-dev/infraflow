import { describe, it, expect } from 'vitest';
import { paloaltoCatalog } from '../../vendors/paloalto';
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
// Palo Alto Networks Catalog — Data Integrity Tests
// ---------------------------------------------------------------------------

describe('Palo Alto Networks vendor catalog', () => {
  // -------------------------------------------------------------------------
  // Top-level catalog metadata
  // -------------------------------------------------------------------------
  describe('catalog metadata', () => {
    it('should have correct vendor identity', () => {
      expect(paloaltoCatalog.vendorId).toBe('palo-alto-networks');
      expect(paloaltoCatalog.vendorName).toBe('Palo Alto Networks');
      expect(paloaltoCatalog.vendorNameKo).toBe('팔로알토 네트웍스');
      expect(paloaltoCatalog.headquarters).toBe('Santa Clara, CA, USA');
    });

    it('should have valid URLs', () => {
      expect(paloaltoCatalog.website).toBe('https://www.paloaltonetworks.com');
      expect(paloaltoCatalog.productPageUrl).toMatch(/^https:\/\//);
      expect(paloaltoCatalog.crawlSource).toMatch(/^https:\/\//);
    });

    it('should have bilingual depth structure', () => {
      expect(paloaltoCatalog.depthStructure).toEqual(['category', 'product-line', 'series']);
      expect(paloaltoCatalog.depthStructureKo).toEqual(['카테고리', '제품 라인', '시리즈']);
      expect(paloaltoCatalog.depthStructure).toHaveLength(paloaltoCatalog.depthStructureKo.length);
    });

    it('should have crawl metadata', () => {
      expect(paloaltoCatalog.lastCrawled).toBe('2026-02-20');
      expect(paloaltoCatalog.crawlSource).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Stats validation
  // -------------------------------------------------------------------------
  describe('catalog stats', () => {
    it('should have accurate totalProducts count', () => {
      const allNodes = getAllNodes(paloaltoCatalog.products);
      expect(paloaltoCatalog.stats.totalProducts).toBe(allNodes.length);
    });

    it('should have accurate maxDepth', () => {
      const actualMax = getMaxDepth(paloaltoCatalog.products);
      expect(paloaltoCatalog.stats.maxDepth).toBe(actualMax);
    });

    it('should have accurate categoriesCount', () => {
      expect(paloaltoCatalog.stats.categoriesCount).toBe(paloaltoCatalog.products.length);
    });

    it('should match computeStats output', () => {
      const computed = computeStats(paloaltoCatalog.products);
      expect(paloaltoCatalog.stats.totalProducts).toBe(computed.totalProducts);
      expect(paloaltoCatalog.stats.maxDepth).toBe(computed.maxDepth);
      expect(paloaltoCatalog.stats.categoriesCount).toBe(computed.categoriesCount);
    });

    it('should have 70 total nodes', () => {
      expect(paloaltoCatalog.stats.totalProducts).toBe(70);
    });

    it('should have maxDepth of 2', () => {
      expect(paloaltoCatalog.stats.maxDepth).toBe(2);
    });

    it('should have 6 top-level categories', () => {
      expect(paloaltoCatalog.stats.categoriesCount).toBe(6);
    });
  });

  // -------------------------------------------------------------------------
  // Product tree structure
  // -------------------------------------------------------------------------
  describe('product tree structure', () => {
    it('should have 6 root categories', () => {
      expect(paloaltoCatalog.products).toHaveLength(6);
      const names = paloaltoCatalog.products.map((p) => p.name);
      expect(names).toEqual([
        'Network Security',
        'SASE & SD-WAN',
        'Cloud Security',
        'Security Operations',
        'Advanced Threat Prevention',
        'Management',
      ]);
    });

    it('should have all root nodes at depth 0', () => {
      for (const product of paloaltoCatalog.products) {
        expect(product.depth).toBe(0);
      }
    });

    it('should have Network Security with 4 product lines', () => {
      const ns = paloaltoCatalog.products.find((p) => p.nodeId === 'pan-network-security');
      expect(ns).toBeDefined();
      expect(ns!.children).toHaveLength(4);
    });

    it('should have SASE & SD-WAN with 3 product lines', () => {
      const sase = paloaltoCatalog.products.find((p) => p.nodeId === 'pan-sase');
      expect(sase).toBeDefined();
      expect(sase!.children).toHaveLength(3);
    });

    it('should have Cloud Security with 2 product lines', () => {
      const cloud = paloaltoCatalog.products.find((p) => p.nodeId === 'pan-cloud-security');
      expect(cloud).toBeDefined();
      expect(cloud!.children).toHaveLength(2);
    });

    it('should have Security Operations with 5 product lines', () => {
      const secops = paloaltoCatalog.products.find((p) => p.nodeId === 'pan-secops');
      expect(secops).toBeDefined();
      expect(secops!.children).toHaveLength(5);
    });

    it('should have Advanced Threat Prevention with 5 product lines', () => {
      const atp = paloaltoCatalog.products.find((p) => p.nodeId === 'pan-threat-prevention');
      expect(atp).toBeDefined();
      expect(atp!.children).toHaveLength(5);
    });

    it('should have Management with 2 product lines', () => {
      const mgmt = paloaltoCatalog.products.find((p) => p.nodeId === 'pan-management');
      expect(mgmt).toBeDefined();
      expect(mgmt!.children).toHaveLength(2);
    });
  });

  // -------------------------------------------------------------------------
  // Node ID uniqueness
  // -------------------------------------------------------------------------
  describe('node ID uniqueness', () => {
    it('should have globally unique nodeIds', () => {
      const allNodes = getAllNodes(paloaltoCatalog.products);
      const ids = allNodes.map((n) => n.nodeId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all nodeIds prefixed with pan-', () => {
      const allNodes = getAllNodes(paloaltoCatalog.products);
      for (const node of allNodes) {
        expect(node.nodeId).toMatch(/^pan-/);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Bilingual completeness
  // -------------------------------------------------------------------------
  describe('bilingual completeness', () => {
    it('should have non-empty name and nameKo for all nodes', () => {
      const allNodes = getAllNodes(paloaltoCatalog.products);
      for (const node of allNodes) {
        expect(node.name.length).toBeGreaterThan(0);
        expect(node.nameKo.length).toBeGreaterThan(0);
      }
    });

    it('should have non-empty description and descriptionKo for all nodes', () => {
      const allNodes = getAllNodes(paloaltoCatalog.products);
      for (const node of allNodes) {
        expect(node.description.length).toBeGreaterThan(0);
        expect(node.descriptionKo.length).toBeGreaterThan(0);
      }
    });

    it('should have depthLabel and depthLabelKo for all nodes', () => {
      const allNodes = getAllNodes(paloaltoCatalog.products);
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
      const allNodes = getAllNodes(paloaltoCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).toMatch(/^https:\/\//);
      }
    });

    it('should not have any relative URLs', () => {
      const allNodes = getAllNodes(paloaltoCatalog.products);
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
      const allNodes = getAllNodes(paloaltoCatalog.products);
      for (const node of allNodes) {
        for (const child of node.children) {
          expect(child.depth).toBe(node.depth + 1);
        }
      }
    });

    it('should have leaf nodes with empty children arrays', () => {
      const leaves = getLeafNodes(paloaltoCatalog.products);
      for (const leaf of leaves) {
        expect(leaf.children).toEqual([]);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Network Security category deep-dive
  // -------------------------------------------------------------------------
  describe('Network Security category', () => {
    it('should have PA-Series with 23 models', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-pa-series');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(23);
      expect(node!.infraNodeTypes).toEqual(['firewall']);
    });

    it('should have VM-Series with 5 models', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-vm-series');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(5);
      expect(node!.infraNodeTypes).toEqual(['firewall']);
    });

    it('should have CN-Series mapped to firewall and kubernetes', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-cn-series');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toEqual(['firewall', 'kubernetes']);
    });

    it('should have Cloud NGFW with 2 variants (AWS and Azure)', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-cloud-ngfw');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(2);
      expect(node!.infraNodeTypes).toContain('firewall');
      expect(node!.infraNodeTypes).toContain('aws-vpc');
    });

    it('should have PA-400 series models (PA-410 through PA-460)', () => {
      const pa400Models = ['pan-pa-410', 'pan-pa-415', 'pan-pa-440', 'pan-pa-445', 'pan-pa-450', 'pan-pa-460'];
      for (const id of pa400Models) {
        const node = findNodeById(paloaltoCatalog.products, id);
        expect(node).toBeDefined();
        expect(node!.depth).toBe(2);
        expect(node!.lifecycle).toBe('active');
      }
    });

    it('should have PA-5400 series models (PA-5410 through PA-5450)', () => {
      const pa5400Models = ['pan-pa-5410', 'pan-pa-5420', 'pan-pa-5430', 'pan-pa-5440', 'pan-pa-5450'];
      for (const id of pa5400Models) {
        const node = findNodeById(paloaltoCatalog.products, id);
        expect(node).toBeDefined();
        expect(node!.depth).toBe(2);
        expect(node!.lifecycle).toBe('active');
      }
    });

    it('should have PA-7500 as the highest-performance model', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-pa-7500');
      expect(node).toBeDefined();
      expect(node!.specs?.['Firewall Throughput']).toBe('1.5 Tbps');
      expect(node!.lifecycle).toBe('active');
    });
  });

  // -------------------------------------------------------------------------
  // SASE & SD-WAN category deep-dive
  // -------------------------------------------------------------------------
  describe('SASE & SD-WAN category', () => {
    it('should have Prisma Access with 2 sub-products', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-prisma-access');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(2);
      expect(node!.infraNodeTypes).toEqual(['sase-gateway']);
    });

    it('should have Prisma SD-WAN with 4 ION appliances', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-prisma-sdwan');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(4);
      expect(node!.infraNodeTypes).toEqual(['sd-wan']);
    });

    it('should have GlobalProtect mapped to vpn-gateway', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-globalprotect');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toEqual(['vpn-gateway']);
    });
  });

  // -------------------------------------------------------------------------
  // Cloud Security category deep-dive
  // -------------------------------------------------------------------------
  describe('Cloud Security category', () => {
    it('should have Prisma Cloud with 4 modules', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-prisma-cloud');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(4);
      expect(node!.infraNodeTypes).toEqual(['private-cloud']);
    });

    it('should have SaaS Security mapped to casb', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-saas-security');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toEqual(['casb']);
    });
  });

  // -------------------------------------------------------------------------
  // Security Operations category deep-dive
  // -------------------------------------------------------------------------
  describe('Security Operations category', () => {
    it('should have Cortex XDR mapped to siem', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-cortex-xdr');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toEqual(['siem']);
    });

    it('should have Cortex XSOAR mapped to soar', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-cortex-xsoar');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toEqual(['soar']);
    });

    it('should have Cortex XSIAM mapped to siem and soar', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-cortex-xsiam');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toEqual(['siem', 'soar']);
    });

    it('should have Cortex Xpanse mapped to siem', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-cortex-xpanse');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toEqual(['siem']);
    });

    it('should have Unit 42 mapped to siem', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-unit42');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toEqual(['siem']);
    });
  });

  // -------------------------------------------------------------------------
  // Advanced Threat Prevention category deep-dive
  // -------------------------------------------------------------------------
  describe('Advanced Threat Prevention category', () => {
    it('should have ATP mapped to ids-ips', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-atp');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toEqual(['ids-ips']);
    });

    it('should have Advanced URL Filtering mapped to waf', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-url-filtering');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toEqual(['waf']);
    });

    it('should have WildFire mapped to ids-ips', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-wildfire');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toEqual(['ids-ips']);
    });

    it('should have DNS Security mapped to dns', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-dns-security');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toEqual(['dns']);
    });

    it('should have IoT Security mapped to nac', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-iot-security');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toEqual(['nac']);
    });
  });

  // -------------------------------------------------------------------------
  // Management category deep-dive
  // -------------------------------------------------------------------------
  describe('Management category', () => {
    it('should have Panorama with 3 deployment options', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-panorama');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
      expect(node!.infraNodeTypes).toEqual(['private-cloud']);
    });

    it('should have Strata Cloud Manager mapped to private-cloud', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-strata-cloud-manager');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toEqual(['private-cloud']);
    });
  });

  // -------------------------------------------------------------------------
  // Search functionality
  // -------------------------------------------------------------------------
  describe('search', () => {
    it('should find PA-Series products by English name', () => {
      const results = searchNodes(paloaltoCatalog.products, 'PA-');
      expect(results.length).toBeGreaterThan(20);
    });

    it('should find products by Korean name', () => {
      const results = searchNodes(paloaltoCatalog.products, '방화벽');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find Cortex products', () => {
      const results = searchNodes(paloaltoCatalog.products, 'Cortex');
      expect(results.length).toBeGreaterThanOrEqual(4);
    });

    it('should find Prisma products', () => {
      const results = searchNodes(paloaltoCatalog.products, 'Prisma');
      expect(results.length).toBeGreaterThanOrEqual(5);
    });

    it('should find WildFire', () => {
      const results = searchNodes(paloaltoCatalog.products, 'WildFire');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find Panorama', () => {
      const results = searchNodes(paloaltoCatalog.products, 'Panorama');
      expect(results.length).toBeGreaterThanOrEqual(3);
    });

    it('should find node by exact nodeId', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-pa-5450');
      expect(node).toBeDefined();
      expect(node!.name).toBe('PA-5450');
    });
  });

  // -------------------------------------------------------------------------
  // Leaf node counts
  // -------------------------------------------------------------------------
  describe('leaf node counts', () => {
    it('should have 57 total leaf nodes', () => {
      const leaves = getLeafNodes(paloaltoCatalog.products);
      expect(leaves).toHaveLength(57);
    });

    it('should match countLeafNodes helper', () => {
      const count = countLeafNodes(paloaltoCatalog.products);
      const leaves = getLeafNodes(paloaltoCatalog.products);
      expect(count).toBe(leaves.length);
    });
  });

  // -------------------------------------------------------------------------
  // InfraNodeType mapping
  // -------------------------------------------------------------------------
  describe('infraNodeType mapping', () => {
    it('should have infraNodeTypes on category/product-line nodes that map to InfraFlow', () => {
      const allNodes = getAllNodes(paloaltoCatalog.products);
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

      const allNodes = getAllNodes(paloaltoCatalog.products);
      for (const node of allNodes) {
        if (node.infraNodeTypes) {
          for (const type of node.infraNodeTypes) {
            expect(validTypes.has(type)).toBe(true);
          }
        }
      }
    });

    it('should map Network Security to firewall type', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-network-security');
      expect(node!.infraNodeTypes).toContain('firewall');
    });

    it('should map SASE category to sase-gateway and sd-wan types', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-sase');
      expect(node!.infraNodeTypes).toContain('sase-gateway');
      expect(node!.infraNodeTypes).toContain('sd-wan');
    });

    it('should map SecOps to siem and soar types', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-secops');
      expect(node!.infraNodeTypes).toContain('siem');
      expect(node!.infraNodeTypes).toContain('soar');
    });
  });

  // -------------------------------------------------------------------------
  // Specific product verification (spot checks)
  // -------------------------------------------------------------------------
  describe('specific product spot checks', () => {
    it('should have PA-410 with correct URL', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-pa-410');
      expect(node).toBeDefined();
      expect(node!.name).toBe('PA-410');
      expect(node!.nameKo).toBe('PA-410');
      expect(node!.sourceUrl).toMatch(/paloaltonetworks\.com/);
    });

    it('should have Cortex XSIAM with correct data', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-cortex-xsiam');
      expect(node).toBeDefined();
      expect(node!.name).toBe('Cortex XSIAM');
      expect(node!.depth).toBe(1);
    });

    it('should have Prisma Access with correct data', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-prisma-access');
      expect(node).toBeDefined();
      expect(node!.name).toBe('Prisma Access');
      expect(node!.infraNodeTypes).toContain('sase-gateway');
    });

    it('should have M-600 Panorama appliance', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-panorama-m-600');
      expect(node).toBeDefined();
      expect(node!.name).toBe('M-600 Appliance');
      expect(node!.specs?.['Managed Firewalls']).toBe('Up to 10,000');
    });

    it('should have ION 9000 SD-WAN appliance', () => {
      const node = findNodeById(paloaltoCatalog.products, 'pan-sdwan-ion-9000');
      expect(node).toBeDefined();
      expect(node!.specs?.['WAN Throughput']).toBe('10 Gbps');
    });
  });

  // -------------------------------------------------------------------------
  // Depth distribution
  // -------------------------------------------------------------------------
  describe('depth distribution', () => {
    it('should have 6 nodes at depth 0', () => {
      const nodes = getNodesByDepth(paloaltoCatalog.products, 0);
      expect(nodes).toHaveLength(6);
    });

    it('should have 21 nodes at depth 1', () => {
      const nodes = getNodesByDepth(paloaltoCatalog.products, 1);
      expect(nodes).toHaveLength(21);
    });

    it('should have 43 nodes at depth 2', () => {
      const nodes = getNodesByDepth(paloaltoCatalog.products, 2);
      expect(nodes).toHaveLength(43);
    });

    it('should have no nodes at depth 3', () => {
      const nodes = getNodesByDepth(paloaltoCatalog.products, 3);
      expect(nodes).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------------
  // Data quality validation
  // -------------------------------------------------------------------------
  describe('data quality validation', () => {
    describe('architecture planning fields', () => {
      it('should have infraNodeTypes on all product line nodes (depth 1)', () => {
        const depth1 = getNodesByDepth(paloaltoCatalog.products, 1);
        const withoutTypes = depth1.filter(
          (n) => !n.infraNodeTypes || n.infraNodeTypes.length === 0,
        );
        expect(withoutTypes.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have architectureRole and architectureRoleKo pair completeness', () => {
        const allNodes = getAllNodes(paloaltoCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.architectureRole && !n.architectureRoleKo) ||
            (!n.architectureRole && n.architectureRoleKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor and recommendedForKo pair completeness', () => {
        const allNodes = getAllNodes(paloaltoCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.recommendedFor && !n.recommendedForKo) ||
            (!n.recommendedFor && n.recommendedForKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor with matching length in recommendedForKo', () => {
        const allNodes = getAllNodes(paloaltoCatalog.products);
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
        const allNodes = getAllNodes(paloaltoCatalog.products);
        for (const node of allNodes) {
          if (node.lifecycle) {
            expect(validValues.has(node.lifecycle)).toBe(true);
          }
        }
      });
    });

    describe('URL quality', () => {
      it('should not have excessive duplicate sourceUrls among leaf nodes', () => {
        const leaves = getLeafNodes(paloaltoCatalog.products);
        const urls = leaves.map((n) => n.sourceUrl);
        const duplicates = urls.filter((url, i) => urls.indexOf(url) !== i);
        const uniqueDuplicates = [...new Set(duplicates)];
        expect(uniqueDuplicates.length).toBeLessThanOrEqual(15);
      });

      it('should use English URLs (not localized)', () => {
        const allNodes = getAllNodes(paloaltoCatalog.products);
        const localizedUrls = allNodes.filter((n) => n.sourceUrl.includes('/ko/'));
        expect(localizedUrls.map((n) => n.nodeId)).toEqual([]);
      });
    });

    describe('coverage statistics', () => {
      it('should report infraNodeTypes coverage on depth 0 and 1 nodes', () => {
        const allNodes = getAllNodes(paloaltoCatalog.products);
        const depth01 = allNodes.filter((n) => n.depth <= 1);
        const depth01WithTypes = depth01.filter(
          (n) => n.infraNodeTypes && n.infraNodeTypes.length > 0,
        );
        expect(depth01WithTypes.length).toBe(depth01.length);
      });

      it('should report architectureRole coverage', () => {
        const allNodes = getAllNodes(paloaltoCatalog.products);
        const withRole = allNodes.filter((n) => n.architectureRole);
        expect(withRole.length).toBeGreaterThan(0);
      });
    });
  });
});
