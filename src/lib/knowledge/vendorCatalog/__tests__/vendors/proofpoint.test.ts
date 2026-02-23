import { describe, it, expect } from 'vitest';
import { proofpointCatalog } from '../../vendors/proofpoint';
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
// Proofpoint Catalog -- Data Integrity Tests
// ---------------------------------------------------------------------------

describe('Proofpoint vendor catalog', () => {
  // -------------------------------------------------------------------------
  // Top-level catalog metadata
  // -------------------------------------------------------------------------
  describe('catalog metadata', () => {
    it('should have correct vendor identity', () => {
      expect(proofpointCatalog.vendorId).toBe('proofpoint');
      expect(proofpointCatalog.vendorName).toBe('Proofpoint');
      expect(proofpointCatalog.vendorNameKo).toBe('프루프포인트');
      expect(proofpointCatalog.headquarters).toBe('Sunnyvale, CA, USA');
    });

    it('should have valid URLs', () => {
      expect(proofpointCatalog.website).toBe('https://www.proofpoint.com');
      expect(proofpointCatalog.productPageUrl).toMatch(/^https:\/\//);
      expect(proofpointCatalog.crawlSource).toMatch(/^https:\/\//);
    });

    it('should have bilingual depth structure', () => {
      expect(proofpointCatalog.depthStructure).toEqual(['category', 'product-line', 'module']);
      expect(proofpointCatalog.depthStructureKo).toEqual(['카테고리', '제품 라인', '모듈']);
      expect(proofpointCatalog.depthStructure).toHaveLength(proofpointCatalog.depthStructureKo.length);
    });

    it('should have crawl metadata', () => {
      expect(proofpointCatalog.lastCrawled).toBe('2026-02-22');
      expect(proofpointCatalog.crawlSource).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Stats validation
  // -------------------------------------------------------------------------
  describe('catalog stats', () => {
    it('should have accurate totalProducts count', () => {
      const allNodes = getAllNodes(proofpointCatalog.products);
      expect(proofpointCatalog.stats.totalProducts).toBe(allNodes.length);
    });

    it('should have accurate maxDepth', () => {
      const actualMax = getMaxDepth(proofpointCatalog.products);
      expect(proofpointCatalog.stats.maxDepth).toBe(actualMax);
    });

    it('should have accurate categoriesCount', () => {
      expect(proofpointCatalog.stats.categoriesCount).toBe(proofpointCatalog.products.length);
    });

    it('should match computeStats output', () => {
      const computed = computeStats(proofpointCatalog.products);
      expect(proofpointCatalog.stats.totalProducts).toBe(computed.totalProducts);
      expect(proofpointCatalog.stats.maxDepth).toBe(computed.maxDepth);
      expect(proofpointCatalog.stats.categoriesCount).toBe(computed.categoriesCount);
    });

    it('should have 35 total nodes', () => {
      expect(proofpointCatalog.stats.totalProducts).toBe(35);
    });

    it('should have maxDepth of 2', () => {
      expect(proofpointCatalog.stats.maxDepth).toBe(2);
    });

    it('should have 5 top-level categories', () => {
      expect(proofpointCatalog.stats.categoriesCount).toBe(5);
    });
  });

  // -------------------------------------------------------------------------
  // Product tree structure
  // -------------------------------------------------------------------------
  describe('product tree structure', () => {
    it('should have 5 root categories', () => {
      expect(proofpointCatalog.products).toHaveLength(5);
      const names = proofpointCatalog.products.map((p) => p.name);
      expect(names).toEqual([
        'Email Security',
        'Threat Protection',
        'Information Protection',
        'Security Awareness',
        'Compliance & Archiving',
      ]);
    });

    it('should have all root nodes at depth 0', () => {
      for (const product of proofpointCatalog.products) {
        expect(product.depth).toBe(0);
      }
    });

    it('should have Email Security with 4 product lines', () => {
      const cat = proofpointCatalog.products.find((p) => p.nodeId === 'proofpoint-email-security');
      expect(cat).toBeDefined();
      expect(cat!.children).toHaveLength(4);
    });

    it('should have Threat Protection with 3 product lines', () => {
      const cat = proofpointCatalog.products.find((p) => p.nodeId === 'proofpoint-threat-protection');
      expect(cat).toBeDefined();
      expect(cat!.children).toHaveLength(3);
    });

    it('should have Information Protection with 3 product lines', () => {
      const cat = proofpointCatalog.products.find((p) => p.nodeId === 'proofpoint-information-protection');
      expect(cat).toBeDefined();
      expect(cat!.children).toHaveLength(3);
    });

    it('should have Security Awareness with 2 product lines', () => {
      const cat = proofpointCatalog.products.find((p) => p.nodeId === 'proofpoint-security-awareness');
      expect(cat).toBeDefined();
      expect(cat!.children).toHaveLength(2);
    });

    it('should have Compliance & Archiving with 3 product lines', () => {
      const cat = proofpointCatalog.products.find((p) => p.nodeId === 'proofpoint-compliance-archiving');
      expect(cat).toBeDefined();
      expect(cat!.children).toHaveLength(3);
    });
  });

  // -------------------------------------------------------------------------
  // Node ID uniqueness
  // -------------------------------------------------------------------------
  describe('node ID uniqueness', () => {
    it('should have globally unique nodeIds', () => {
      const allNodes = getAllNodes(proofpointCatalog.products);
      const ids = allNodes.map((n) => n.nodeId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all nodeIds prefixed with proofpoint-', () => {
      const allNodes = getAllNodes(proofpointCatalog.products);
      for (const node of allNodes) {
        expect(node.nodeId).toMatch(/^proofpoint-/);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Bilingual completeness
  // -------------------------------------------------------------------------
  describe('bilingual completeness', () => {
    it('should have non-empty name and nameKo for all nodes', () => {
      const allNodes = getAllNodes(proofpointCatalog.products);
      for (const node of allNodes) {
        expect(node.name.length).toBeGreaterThan(0);
        expect(node.nameKo.length).toBeGreaterThan(0);
      }
    });

    it('should have non-empty description and descriptionKo for all nodes', () => {
      const allNodes = getAllNodes(proofpointCatalog.products);
      for (const node of allNodes) {
        expect(node.description.length).toBeGreaterThan(0);
        expect(node.descriptionKo.length).toBeGreaterThan(0);
      }
    });

    it('should have depthLabel and depthLabelKo for all nodes', () => {
      const allNodes = getAllNodes(proofpointCatalog.products);
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
      const allNodes = getAllNodes(proofpointCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).toMatch(/^https:\/\//);
      }
    });

    it('should not have any relative URLs', () => {
      const allNodes = getAllNodes(proofpointCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).not.toMatch(/^\/[^/]/);
      }
    });

    it('should use English URLs (not Korean URLs)', () => {
      const allNodes = getAllNodes(proofpointCatalog.products);
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
      const allNodes = getAllNodes(proofpointCatalog.products);
      for (const node of allNodes) {
        for (const child of node.children) {
          expect(child.depth).toBe(node.depth + 1);
        }
      }
    });

    it('should have leaf nodes with empty children arrays', () => {
      const leaves = getLeafNodes(proofpointCatalog.products);
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
      const allNodes = getAllNodes(proofpointCatalog.products);
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

      const allNodes = getAllNodes(proofpointCatalog.products);
      for (const node of allNodes) {
        if (node.infraNodeTypes) {
          for (const type of node.infraNodeTypes) {
            expect(validTypes.has(type)).toBe(true);
          }
        }
      }
    });

    it('should have infraNodeTypes on all depth 0 and depth 1 nodes', () => {
      const allNodes = getAllNodes(proofpointCatalog.products);
      const depth01 = allNodes.filter((n) => n.depth <= 1);
      const withoutTypes = depth01.filter(
        (n) => !n.infraNodeTypes || n.infraNodeTypes.length === 0,
      );
      expect(withoutTypes.map((n) => n.nodeId)).toEqual([]);
    });

    it('should map Email Security category to waf type', () => {
      const node = findNodeById(proofpointCatalog.products, 'proofpoint-email-security');
      expect(node!.infraNodeTypes).toContain('waf');
    });

    it('should map Information Protection category to dlp type', () => {
      const node = findNodeById(proofpointCatalog.products, 'proofpoint-information-protection');
      expect(node!.infraNodeTypes).toContain('dlp');
    });

    it('should map CASB to casb type', () => {
      const node = findNodeById(proofpointCatalog.products, 'proofpoint-casb');
      expect(node!.infraNodeTypes).toContain('casb');
    });

    it('should map TRAP to soar type', () => {
      const node = findNodeById(proofpointCatalog.products, 'proofpoint-trap');
      expect(node!.infraNodeTypes).toContain('soar');
    });
  });

  // -------------------------------------------------------------------------
  // Email Security deep-dive
  // -------------------------------------------------------------------------
  describe('Email Security products', () => {
    it('should have Email Protection product line', () => {
      const node = findNodeById(proofpointCatalog.products, 'proofpoint-email-protection');
      expect(node).toBeDefined();
      expect(node!.depth).toBe(1);
      expect(node!.architectureRole).toContain('Email Security Gateway');
    });

    it('should have TAP product line', () => {
      const node = findNodeById(proofpointCatalog.products, 'proofpoint-tap');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Advanced Threat Protection');
    });

    it('should have Email Fraud Defense product line', () => {
      const node = findNodeById(proofpointCatalog.products, 'proofpoint-email-fraud-defense');
      expect(node).toBeDefined();
      expect(node!.supportedProtocols).toContain('DMARC');
      expect(node!.supportedProtocols).toContain('SPF');
      expect(node!.supportedProtocols).toContain('DKIM');
    });

    it('should have Adaptive Email Security product line', () => {
      const node = findNodeById(proofpointCatalog.products, 'proofpoint-adaptive-email-security');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Adaptive');
    });

    it('should have at least 5 recommendedFor entries on Email Protection', () => {
      const node = findNodeById(proofpointCatalog.products, 'proofpoint-email-protection');
      expect(node!.recommendedFor!.length).toBeGreaterThanOrEqual(5);
      expect(node!.recommendedForKo!.length).toBeGreaterThanOrEqual(5);
    });
  });

  // -------------------------------------------------------------------------
  // Information Protection deep-dive
  // -------------------------------------------------------------------------
  describe('Information Protection products', () => {
    it('should have Enterprise DLP product', () => {
      const node = findNodeById(proofpointCatalog.products, 'proofpoint-enterprise-dlp');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('dlp');
    });

    it('should have ITM product', () => {
      const node = findNodeById(proofpointCatalog.products, 'proofpoint-itm');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Insider Threat');
    });

    it('should have CASB product', () => {
      const node = findNodeById(proofpointCatalog.products, 'proofpoint-casb');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Cloud Access Security Broker');
    });
  });

  // -------------------------------------------------------------------------
  // Security Awareness deep-dive
  // -------------------------------------------------------------------------
  describe('Security Awareness products', () => {
    it('should have ZenGuide product', () => {
      const node = findNodeById(proofpointCatalog.products, 'proofpoint-zenguide');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Security Awareness Training');
    });

    it('should have People Risk Explorer product', () => {
      const node = findNodeById(proofpointCatalog.products, 'proofpoint-npre');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('People-Centric Risk Scoring');
    });
  });

  // -------------------------------------------------------------------------
  // Compliance & Archiving deep-dive
  // -------------------------------------------------------------------------
  describe('Compliance & Archiving products', () => {
    it('should have Intelligent Archive product', () => {
      const node = findNodeById(proofpointCatalog.products, 'proofpoint-archive');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Archive');
    });

    it('should have Intelligent Compliance product', () => {
      const node = findNodeById(proofpointCatalog.products, 'proofpoint-compliance');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Compliance Monitoring');
    });

    it('should have Digital Risk Protection product', () => {
      const node = findNodeById(proofpointCatalog.products, 'proofpoint-digital-risk-protection');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Digital Risk Protection');
    });
  });

  // -------------------------------------------------------------------------
  // Search functionality
  // -------------------------------------------------------------------------
  describe('search', () => {
    it('should find Proofpoint products by English name', () => {
      const results = searchNodes(proofpointCatalog.products, 'Proofpoint');
      expect(results.length).toBeGreaterThan(10);
    });

    it('should find products by Korean name (이메일)', () => {
      const results = searchNodes(proofpointCatalog.products, '이메일');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find DLP products', () => {
      const results = searchNodes(proofpointCatalog.products, 'DLP');
      expect(results.length).toBeGreaterThanOrEqual(3);
    });

    it('should find DMARC products', () => {
      const results = searchNodes(proofpointCatalog.products, 'DMARC');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find node by exact nodeId', () => {
      const node = findNodeById(proofpointCatalog.products, 'proofpoint-tap-module');
      expect(node).toBeDefined();
      expect(node!.name).toContain('TAP');
    });
  });

  // -------------------------------------------------------------------------
  // Leaf node counts
  // -------------------------------------------------------------------------
  describe('leaf node counts', () => {
    it('should match countLeafNodes helper', () => {
      const count = countLeafNodes(proofpointCatalog.products);
      const leaves = getLeafNodes(proofpointCatalog.products);
      expect(count).toBe(leaves.length);
    });

    it('should have all leaf nodes at depth 2', () => {
      const leaves = getLeafNodes(proofpointCatalog.products);
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
      const nodes = getNodesByDepth(proofpointCatalog.products, 0);
      expect(nodes).toHaveLength(5);
    });

    it('should have 15 nodes at depth 1', () => {
      const nodes = getNodesByDepth(proofpointCatalog.products, 1);
      expect(nodes).toHaveLength(15);
    });

    it('should have 15 nodes at depth 2', () => {
      const nodes = getNodesByDepth(proofpointCatalog.products, 2);
      expect(nodes).toHaveLength(15);
    });
  });

  // -------------------------------------------------------------------------
  // Data quality validation
  // -------------------------------------------------------------------------
  describe('data quality validation', () => {
    describe('architecture planning fields', () => {
      it('should have architectureRole and architectureRoleKo pair completeness', () => {
        const allNodes = getAllNodes(proofpointCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.architectureRole && !n.architectureRoleKo) ||
            (!n.architectureRole && n.architectureRoleKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor and recommendedForKo pair completeness', () => {
        const allNodes = getAllNodes(proofpointCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.recommendedFor && !n.recommendedForKo) ||
            (!n.recommendedFor && n.recommendedForKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor with matching length in recommendedForKo', () => {
        const allNodes = getAllNodes(proofpointCatalog.products);
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
        const allNodes = getAllNodes(proofpointCatalog.products);
        for (const node of allNodes) {
          if (node.lifecycle) {
            expect(validValues.has(node.lifecycle)).toBe(true);
          }
        }
      });

      it('should have lifecycle set on all leaf nodes', () => {
        const leaves = getLeafNodes(proofpointCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.lifecycle).toBeDefined();
        }
      });
    });

    describe('licensing and form factor', () => {
      it('should have licensingModel on all leaf nodes', () => {
        const leaves = getLeafNodes(proofpointCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.licensingModel).toBeDefined();
        }
      });

      it('should have formFactor on all leaf nodes', () => {
        const leaves = getLeafNodes(proofpointCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.formFactor).toBeDefined();
        }
      });

      it('should have all products as cloud form factor', () => {
        const leaves = getLeafNodes(proofpointCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.formFactor).toBe('cloud');
        }
      });

      it('should have all products as subscription licensing', () => {
        const leaves = getLeafNodes(proofpointCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.licensingModel).toBe('subscription');
        }
      });
    });

    describe('specs completeness', () => {
      it('should have specs on all leaf nodes', () => {
        const leaves = getLeafNodes(proofpointCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.specs).toBeDefined();
          expect(Object.keys(leaf.specs!).length).toBeGreaterThanOrEqual(5);
        }
      });
    });

    describe('coverage statistics', () => {
      it('should report infraNodeTypes coverage on all depth 0 and 1 nodes', () => {
        const allNodes = getAllNodes(proofpointCatalog.products);
        const depth01 = allNodes.filter((n) => n.depth <= 1);
        const depth01WithTypes = depth01.filter(
          (n) => n.infraNodeTypes && n.infraNodeTypes.length > 0,
        );
        expect(depth01WithTypes.length).toBe(depth01.length);
      });

      it('should report architectureRole coverage on all depth 1 nodes', () => {
        const allNodes = getAllNodes(proofpointCatalog.products);
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
    it('should have Email Protection module with 99.99% detection rate', () => {
      const node = findNodeById(proofpointCatalog.products, 'proofpoint-email-protection-module');
      expect(node).toBeDefined();
      expect(node!.specs!['Threat Detection Rate']).toContain('99.99%');
    });

    it('should have Email Fraud Defense with 650M+ domains monitored', () => {
      const node = findNodeById(proofpointCatalog.products, 'proofpoint-email-fraud-defense-module');
      expect(node).toBeDefined();
      expect(node!.specs!['Domains Monitored']).toContain('650 million');
    });

    it('should have ET Intelligence with 40+ threat categories', () => {
      const node = findNodeById(proofpointCatalog.products, 'proofpoint-et-intelligence-module');
      expect(node).toBeDefined();
      expect(node!.specs!['Threat Categories']).toBe('40+');
    });

    it('should have Enterprise DLP module with multi-channel coverage', () => {
      const node = findNodeById(proofpointCatalog.products, 'proofpoint-enterprise-dlp-module');
      expect(node).toBeDefined();
      expect(node!.specs!['Channels']).toContain('Email');
      expect(node!.specs!['Channels']).toContain('cloud');
      expect(node!.specs!['Channels']).toContain('endpoint');
    });

    it('should have ITM module with multi-region data residency', () => {
      const node = findNodeById(proofpointCatalog.products, 'proofpoint-itm-module');
      expect(node).toBeDefined();
      expect(node!.specs!['Data Residency']).toContain('US');
      expect(node!.specs!['Data Residency']).toContain('Europe');
    });

    it('should have Archive module with PCI DSS compliance', () => {
      const node = findNodeById(proofpointCatalog.products, 'proofpoint-archive-module');
      expect(node).toBeDefined();
      expect(node!.specs!['Compliance']).toContain('PCI DSS');
    });

    it('should have Compliance module with SEC/FINRA coverage', () => {
      const node = findNodeById(proofpointCatalog.products, 'proofpoint-compliance-module');
      expect(node).toBeDefined();
      expect(node!.specs!['Compliance']).toContain('SEC');
      expect(node!.specs!['Compliance']).toContain('FINRA');
    });

    it('should have ZenGuide module with Satori AI agent', () => {
      const node = findNodeById(proofpointCatalog.products, 'proofpoint-zenguide-module');
      expect(node).toBeDefined();
      expect(node!.specs!['AI Engine']).toContain('Satori');
    });

    it('should have CASB module with multi-mode deployment', () => {
      const node = findNodeById(proofpointCatalog.products, 'proofpoint-casb-module');
      expect(node).toBeDefined();
      expect(node!.specs!['Deployment Modes']).toContain('API connector');
      expect(node!.specs!['Deployment Modes']).toContain('cloud proxy');
    });
  });
});
