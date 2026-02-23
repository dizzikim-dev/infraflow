import { describe, it, expect } from 'vitest';
import { veeamCatalog } from '../../vendors/veeam';
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
// Veeam Catalog -- Data Integrity Tests
// ---------------------------------------------------------------------------

describe('Veeam vendor catalog', () => {
  // -------------------------------------------------------------------------
  // Top-level catalog metadata
  // -------------------------------------------------------------------------
  describe('catalog metadata', () => {
    it('should have correct vendor identity', () => {
      expect(veeamCatalog.vendorId).toBe('veeam');
      expect(veeamCatalog.vendorName).toBe('Veeam Software');
      expect(veeamCatalog.vendorNameKo).toBe('빔 소프트웨어');
      expect(veeamCatalog.headquarters).toBe('Columbus, OH, USA');
    });

    it('should have valid URLs', () => {
      expect(veeamCatalog.website).toBe('https://www.veeam.com');
      expect(veeamCatalog.productPageUrl).toMatch(/^https:\/\//);
      expect(veeamCatalog.crawlSource).toMatch(/^https:\/\//);
    });

    it('should have bilingual depth structure', () => {
      expect(veeamCatalog.depthStructure).toEqual(['category', 'product-line', 'edition']);
      expect(veeamCatalog.depthStructureKo).toEqual(['카테고리', '제품 라인', '에디션']);
      expect(veeamCatalog.depthStructure).toHaveLength(veeamCatalog.depthStructureKo.length);
    });

    it('should have crawl metadata', () => {
      expect(veeamCatalog.lastCrawled).toBe('2026-02-22');
      expect(veeamCatalog.crawlSource).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Stats validation
  // -------------------------------------------------------------------------
  describe('catalog stats', () => {
    it('should have accurate totalProducts count', () => {
      const allNodes = getAllNodes(veeamCatalog.products);
      expect(veeamCatalog.stats.totalProducts).toBe(allNodes.length);
    });

    it('should have accurate maxDepth', () => {
      const actualMax = getMaxDepth(veeamCatalog.products);
      expect(veeamCatalog.stats.maxDepth).toBe(actualMax);
    });

    it('should have accurate categoriesCount', () => {
      expect(veeamCatalog.stats.categoriesCount).toBe(veeamCatalog.products.length);
    });

    it('should match computeStats output', () => {
      const computed = computeStats(veeamCatalog.products);
      expect(veeamCatalog.stats.totalProducts).toBe(computed.totalProducts);
      expect(veeamCatalog.stats.maxDepth).toBe(computed.maxDepth);
      expect(veeamCatalog.stats.categoriesCount).toBe(computed.categoriesCount);
    });

    it('should have 31 total nodes', () => {
      expect(veeamCatalog.stats.totalProducts).toBe(31);
    });

    it('should have maxDepth of 2', () => {
      expect(veeamCatalog.stats.maxDepth).toBe(2);
    });

    it('should have 4 top-level categories', () => {
      expect(veeamCatalog.stats.categoriesCount).toBe(4);
    });
  });

  // -------------------------------------------------------------------------
  // Product tree structure
  // -------------------------------------------------------------------------
  describe('product tree structure', () => {
    it('should have 4 root categories', () => {
      expect(veeamCatalog.products).toHaveLength(4);
      const names = veeamCatalog.products.map((p) => p.name);
      expect(names).toEqual([
        'Data Platform',
        'Cloud & SaaS Protection',
        'Monitoring & Analytics',
        'Cyber Resilience',
      ]);
    });

    it('should have all root nodes at depth 0', () => {
      for (const product of veeamCatalog.products) {
        expect(product.depth).toBe(0);
      }
    });

    it('should have Data Platform with 2 product lines', () => {
      const dp = veeamCatalog.products.find((p) => p.nodeId === 'veeam-data-platform');
      expect(dp).toBeDefined();
      expect(dp!.children).toHaveLength(2);
    });

    it('should have Cloud & SaaS Protection with 5 product lines', () => {
      const cloud = veeamCatalog.products.find((p) => p.nodeId === 'veeam-cloud-saas');
      expect(cloud).toBeDefined();
      expect(cloud!.children).toHaveLength(5);
    });

    it('should have Monitoring & Analytics with 2 product lines', () => {
      const mon = veeamCatalog.products.find((p) => p.nodeId === 'veeam-monitoring-analytics');
      expect(mon).toBeDefined();
      expect(mon!.children).toHaveLength(2);
    });

    it('should have Cyber Resilience with 2 product lines', () => {
      const cyber = veeamCatalog.products.find((p) => p.nodeId === 'veeam-cyber-resilience');
      expect(cyber).toBeDefined();
      expect(cyber!.children).toHaveLength(2);
    });
  });

  // -------------------------------------------------------------------------
  // Node ID uniqueness
  // -------------------------------------------------------------------------
  describe('node ID uniqueness', () => {
    it('should have globally unique nodeIds', () => {
      const allNodes = getAllNodes(veeamCatalog.products);
      const ids = allNodes.map((n) => n.nodeId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all nodeIds prefixed with veeam-', () => {
      const allNodes = getAllNodes(veeamCatalog.products);
      for (const node of allNodes) {
        expect(node.nodeId).toMatch(/^veeam-/);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Bilingual completeness
  // -------------------------------------------------------------------------
  describe('bilingual completeness', () => {
    it('should have non-empty name and nameKo for all nodes', () => {
      const allNodes = getAllNodes(veeamCatalog.products);
      for (const node of allNodes) {
        expect(node.name.length).toBeGreaterThan(0);
        expect(node.nameKo.length).toBeGreaterThan(0);
      }
    });

    it('should have non-empty description and descriptionKo for all nodes', () => {
      const allNodes = getAllNodes(veeamCatalog.products);
      for (const node of allNodes) {
        expect(node.description.length).toBeGreaterThan(0);
        expect(node.descriptionKo.length).toBeGreaterThan(0);
      }
    });

    it('should have depthLabel and depthLabelKo for all nodes', () => {
      const allNodes = getAllNodes(veeamCatalog.products);
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
      const allNodes = getAllNodes(veeamCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).toMatch(/^https:\/\//);
      }
    });

    it('should not have any relative URLs', () => {
      const allNodes = getAllNodes(veeamCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).not.toMatch(/^\/[^/]/);
      }
    });

    it('should use English URLs (not Korean URLs)', () => {
      const allNodes = getAllNodes(veeamCatalog.products);
      const koreanUrls = allNodes.filter((n) => n.sourceUrl.includes('ko_kr') || n.sourceUrl.includes('/kr/ko/'));
      expect(koreanUrls.map((n) => n.nodeId)).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // Depth consistency
  // -------------------------------------------------------------------------
  describe('depth consistency', () => {
    it('should have children with depth exactly parent.depth + 1', () => {
      const allNodes = getAllNodes(veeamCatalog.products);
      for (const node of allNodes) {
        for (const child of node.children) {
          expect(child.depth).toBe(node.depth + 1);
        }
      }
    });

    it('should have leaf nodes with empty children arrays', () => {
      const leaves = getLeafNodes(veeamCatalog.products);
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
      const allNodes = getAllNodes(veeamCatalog.products);
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

      const allNodes = getAllNodes(veeamCatalog.products);
      for (const node of allNodes) {
        if (node.infraNodeTypes) {
          for (const type of node.infraNodeTypes) {
            expect(validTypes.has(type)).toBe(true);
          }
        }
      }
    });

    it('should have infraNodeTypes on all depth 0 and depth 1 nodes', () => {
      const allNodes = getAllNodes(veeamCatalog.products);
      const depth01 = allNodes.filter((n) => n.depth <= 1);
      const withoutTypes = depth01.filter(
        (n) => !n.infraNodeTypes || n.infraNodeTypes.length === 0,
      );
      expect(withoutTypes.map((n) => n.nodeId)).toEqual([]);
    });

    it('should map Data Platform to backup type', () => {
      const node = findNodeById(veeamCatalog.products, 'veeam-data-platform');
      expect(node!.infraNodeTypes).toContain('backup');
    });

    it('should map Cloud & SaaS Protection to backup type', () => {
      const node = findNodeById(veeamCatalog.products, 'veeam-cloud-saas');
      expect(node!.infraNodeTypes).toContain('backup');
    });

    it('should map Kasten by Veeam to backup and kubernetes types', () => {
      const node = findNodeById(veeamCatalog.products, 'veeam-kasten');
      expect(node!.infraNodeTypes).toContain('backup');
      expect(node!.infraNodeTypes).toContain('kubernetes');
    });
  });

  // -------------------------------------------------------------------------
  // Veeam Data Platform deep-dive
  // -------------------------------------------------------------------------
  describe('Veeam Data Platform suite', () => {
    it('should have 3 editions (Foundation, Advanced, Premium)', () => {
      const node = findNodeById(veeamCatalog.products, 'veeam-data-platform-suite');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
      const names = node!.children.map((c) => c.name);
      expect(names).toContain('Veeam Data Platform Foundation');
      expect(names).toContain('Veeam Data Platform Advanced');
      expect(names).toContain('Veeam Data Platform Premium');
    });

    it('should have architectureRole on the suite node', () => {
      const node = findNodeById(veeamCatalog.products, 'veeam-data-platform-suite');
      expect(node!.architectureRole).toBeTruthy();
      expect(node!.architectureRoleKo).toBeTruthy();
    });

    it('should have at least 5 recommendedFor entries', () => {
      const node = findNodeById(veeamCatalog.products, 'veeam-data-platform-suite');
      expect(node!.recommendedFor!.length).toBeGreaterThanOrEqual(5);
      expect(node!.recommendedForKo!.length).toBeGreaterThanOrEqual(5);
    });
  });

  // -------------------------------------------------------------------------
  // Veeam Backup & Replication deep-dive
  // -------------------------------------------------------------------------
  describe('Veeam Backup & Replication', () => {
    it('should have 4 editions', () => {
      const node = findNodeById(veeamCatalog.products, 'veeam-backup-replication');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(4);
    });

    it('should have Community, Standard, Enterprise, Enterprise Plus editions', () => {
      const editions = [
        'veeam-backup-replication-community',
        'veeam-backup-replication-standard',
        'veeam-backup-replication-enterprise',
        'veeam-backup-replication-enterprise-plus',
      ];
      for (const id of editions) {
        const node = findNodeById(veeamCatalog.products, id);
        expect(node).toBeDefined();
        expect(node!.depth).toBe(2);
      }
    });

    it('should have Community Edition as free/perpetual', () => {
      const node = findNodeById(veeamCatalog.products, 'veeam-backup-replication-community');
      expect(node!.licensingModel).toBe('perpetual');
      expect(node!.specs!['Max Workloads']).toBe('10');
    });

    it('should have Enterprise Plus with Scale-Out Backup Repository', () => {
      const node = findNodeById(veeamCatalog.products, 'veeam-backup-replication-enterprise-plus');
      expect(node!.specs!['Scale-Out Backup Repository']).toBe('Supported');
    });
  });

  // -------------------------------------------------------------------------
  // Cloud & SaaS product deep-dive
  // -------------------------------------------------------------------------
  describe('Cloud & SaaS products', () => {
    it('should have Microsoft 365 backup product', () => {
      const node = findNodeById(veeamCatalog.products, 'veeam-backup-m365');
      expect(node).toBeDefined();
      expect(node!.name).toContain('Microsoft 365');
    });

    it('should have Salesforce backup product', () => {
      const node = findNodeById(veeamCatalog.products, 'veeam-backup-salesforce');
      expect(node).toBeDefined();
      expect(node!.name).toContain('Salesforce');
    });

    it('should have AWS backup product', () => {
      const node = findNodeById(veeamCatalog.products, 'veeam-backup-aws');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Cloud-Native');
    });

    it('should have Azure backup product', () => {
      const node = findNodeById(veeamCatalog.products, 'veeam-backup-azure');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Cloud-Native');
    });

    it('should have Google Cloud backup product', () => {
      const node = findNodeById(veeamCatalog.products, 'veeam-backup-gcp');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Cloud-Native');
    });
  });

  // -------------------------------------------------------------------------
  // Monitoring & Analytics deep-dive
  // -------------------------------------------------------------------------
  describe('Monitoring & Analytics products', () => {
    it('should have Veeam ONE', () => {
      const node = findNodeById(veeamCatalog.products, 'veeam-one');
      expect(node).toBeDefined();
      expect(node!.name).toBe('Veeam ONE');
    });

    it('should have Veeam Recovery Orchestrator', () => {
      const node = findNodeById(veeamCatalog.products, 'veeam-recovery-orchestrator');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Disaster Recovery');
    });
  });

  // -------------------------------------------------------------------------
  // Cyber Resilience deep-dive
  // -------------------------------------------------------------------------
  describe('Cyber Resilience products', () => {
    it('should have Veeam Cyber Secure program', () => {
      const node = findNodeById(veeamCatalog.products, 'veeam-cyber-secure');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Ransomware');
    });

    it('should have Kasten K10', () => {
      const node = findNodeById(veeamCatalog.products, 'veeam-kasten-k10');
      expect(node).toBeDefined();
      expect(node!.depth).toBe(2);
      expect(node!.lifecycle).toBe('active');
      expect(node!.formFactor).toBe('container');
    });

    it('should have Kasten K10 with K8s distribution specs', () => {
      const node = findNodeById(veeamCatalog.products, 'veeam-kasten-k10');
      expect(node!.specs).toBeDefined();
      expect(node!.specs!['K8s Distributions']).toContain('EKS');
      expect(node!.specs!['K8s Distributions']).toContain('AKS');
      expect(node!.specs!['K8s Distributions']).toContain('GKE');
      expect(node!.specs!['K8s Distributions']).toContain('OpenShift');
    });
  });

  // -------------------------------------------------------------------------
  // Search functionality
  // -------------------------------------------------------------------------
  describe('search', () => {
    it('should find Veeam products by English name', () => {
      const results = searchNodes(veeamCatalog.products, 'Veeam');
      expect(results.length).toBeGreaterThan(10);
    });

    it('should find products by Korean name (백업)', () => {
      const results = searchNodes(veeamCatalog.products, '백업');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find Kasten products', () => {
      const results = searchNodes(veeamCatalog.products, 'Kasten');
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('should find backup products by keyword', () => {
      const results = searchNodes(veeamCatalog.products, 'backup');
      expect(results.length).toBeGreaterThan(5);
    });

    it('should find node by exact nodeId', () => {
      const node = findNodeById(veeamCatalog.products, 'veeam-data-platform-premium');
      expect(node).toBeDefined();
      expect(node!.name).toBe('Veeam Data Platform Premium');
    });
  });

  // -------------------------------------------------------------------------
  // Leaf node counts
  // -------------------------------------------------------------------------
  describe('leaf node counts', () => {
    it('should match countLeafNodes helper', () => {
      const count = countLeafNodes(veeamCatalog.products);
      const leaves = getLeafNodes(veeamCatalog.products);
      expect(count).toBe(leaves.length);
    });

    it('should have all leaf nodes at depth 2', () => {
      const leaves = getLeafNodes(veeamCatalog.products);
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
      const nodes = getNodesByDepth(veeamCatalog.products, 0);
      expect(nodes).toHaveLength(4);
    });

    it('should have 11 nodes at depth 1', () => {
      const nodes = getNodesByDepth(veeamCatalog.products, 1);
      expect(nodes).toHaveLength(11);
    });

    it('should have 16 nodes at depth 2', () => {
      const nodes = getNodesByDepth(veeamCatalog.products, 2);
      expect(nodes).toHaveLength(16);
    });
  });

  // -------------------------------------------------------------------------
  // Data quality validation
  // -------------------------------------------------------------------------
  describe('data quality validation', () => {
    describe('architecture planning fields', () => {
      it('should have architectureRole and architectureRoleKo pair completeness', () => {
        const allNodes = getAllNodes(veeamCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.architectureRole && !n.architectureRoleKo) ||
            (!n.architectureRole && n.architectureRoleKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor and recommendedForKo pair completeness', () => {
        const allNodes = getAllNodes(veeamCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.recommendedFor && !n.recommendedForKo) ||
            (!n.recommendedFor && n.recommendedForKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor with matching length in recommendedForKo', () => {
        const allNodes = getAllNodes(veeamCatalog.products);
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
        const allNodes = getAllNodes(veeamCatalog.products);
        for (const node of allNodes) {
          if (node.lifecycle) {
            expect(validValues.has(node.lifecycle)).toBe(true);
          }
        }
      });

      it('should have lifecycle set on all leaf nodes', () => {
        const leaves = getLeafNodes(veeamCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.lifecycle).toBeDefined();
        }
      });
    });

    describe('licensing and form factor', () => {
      it('should have licensingModel on all leaf nodes', () => {
        const leaves = getLeafNodes(veeamCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.licensingModel).toBeDefined();
        }
      });

      it('should have formFactor on all leaf nodes', () => {
        const leaves = getLeafNodes(veeamCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.formFactor).toBeDefined();
        }
      });
    });

    describe('specs completeness', () => {
      it('should have specs on all leaf nodes', () => {
        const leaves = getLeafNodes(veeamCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.specs).toBeDefined();
          expect(Object.keys(leaf.specs!).length).toBeGreaterThanOrEqual(5);
        }
      });
    });

    describe('coverage statistics', () => {
      it('should report infraNodeTypes coverage on all depth 0 and 1 nodes', () => {
        const allNodes = getAllNodes(veeamCatalog.products);
        const depth01 = allNodes.filter((n) => n.depth <= 1);
        const depth01WithTypes = depth01.filter(
          (n) => n.infraNodeTypes && n.infraNodeTypes.length > 0,
        );
        expect(depth01WithTypes.length).toBe(depth01.length);
      });

      it('should report architectureRole coverage on all depth 1 nodes', () => {
        const allNodes = getAllNodes(veeamCatalog.products);
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
    it('should have Veeam Data Platform Premium with correct included components', () => {
      const node = findNodeById(veeamCatalog.products, 'veeam-data-platform-premium');
      expect(node).toBeDefined();
      expect(node!.specs!['Included Components']).toContain('Veeam Backup & Replication');
      expect(node!.specs!['Included Components']).toContain('Veeam ONE');
      expect(node!.specs!['Included Components']).toContain('Veeam Recovery Orchestrator');
    });

    it('should have Microsoft 365 backup with pricing tiers', () => {
      const node = findNodeById(veeamCatalog.products, 'veeam-backup-m365-edition');
      expect(node).toBeDefined();
      expect(node!.specs!['Foundation Tier']).toContain('$2.63');
      expect(node!.specs!['Storage']).toBe('Unlimited (included)');
    });

    it('should have AWS backup with comprehensive service list', () => {
      const node = findNodeById(veeamCatalog.products, 'veeam-backup-aws-edition');
      expect(node).toBeDefined();
      expect(node!.specs!['AWS Services']).toContain('EC2');
      expect(node!.specs!['AWS Services']).toContain('RDS');
      expect(node!.specs!['AWS Services']).toContain('S3');
    });

    it('should have Azure backup with SaaS pricing', () => {
      const node = findNodeById(veeamCatalog.products, 'veeam-backup-azure-edition');
      expect(node).toBeDefined();
      expect(node!.specs!['SaaS Pricing']).toContain('$42');
    });

    it('should have Veeam Cyber Secure with financial guarantee', () => {
      const node = findNodeById(veeamCatalog.products, 'veeam-cyber-secure-program');
      expect(node).toBeDefined();
      expect(node!.specs!['Financial Guarantee']).toContain('Ransomware');
    });

    it('should have Kasten K10 as container form factor', () => {
      const node = findNodeById(veeamCatalog.products, 'veeam-kasten-k10');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('container');
      expect(node!.licensingModel).toBe('subscription');
    });
  });
});
