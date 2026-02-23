import { describe, it, expect } from 'vitest';
import { netappCatalog } from '../../vendors/netapp';
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
// NetApp Catalog -- Data Integrity Tests
// ---------------------------------------------------------------------------

describe('NetApp vendor catalog', () => {
  // -------------------------------------------------------------------------
  // Top-level catalog metadata
  // -------------------------------------------------------------------------
  describe('catalog metadata', () => {
    it('should have correct vendor identity', () => {
      expect(netappCatalog.vendorId).toBe('netapp');
      expect(netappCatalog.vendorName).toBe('NetApp');
      expect(netappCatalog.vendorNameKo).toBe('넷앱');
      expect(netappCatalog.headquarters).toBe('San Jose, CA, USA');
    });

    it('should have valid URLs', () => {
      expect(netappCatalog.website).toBe('https://www.netapp.com');
      expect(netappCatalog.productPageUrl).toMatch(/^https:\/\//);
      expect(netappCatalog.crawlSource).toMatch(/^https:\/\//);
    });

    it('should have bilingual depth structure', () => {
      expect(netappCatalog.depthStructure).toEqual(['category', 'product-line', 'series']);
      expect(netappCatalog.depthStructureKo).toEqual(['카테고리', '제품 라인', '시리즈']);
      expect(netappCatalog.depthStructure).toHaveLength(netappCatalog.depthStructureKo.length);
    });

    it('should have crawl metadata', () => {
      expect(netappCatalog.lastCrawled).toBe('2026-02-23');
      expect(netappCatalog.crawlSource).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Stats validation
  // -------------------------------------------------------------------------
  describe('catalog stats', () => {
    it('should have accurate totalProducts count', () => {
      const allNodes = getAllNodes(netappCatalog.products);
      expect(netappCatalog.stats.totalProducts).toBe(allNodes.length);
    });

    it('should have accurate maxDepth', () => {
      const actualMax = getMaxDepth(netappCatalog.products);
      expect(netappCatalog.stats.maxDepth).toBe(actualMax);
    });

    it('should have accurate categoriesCount', () => {
      expect(netappCatalog.stats.categoriesCount).toBe(netappCatalog.products.length);
    });

    it('should match computeStats output', () => {
      const computed = computeStats(netappCatalog.products);
      expect(netappCatalog.stats.totalProducts).toBe(computed.totalProducts);
      expect(netappCatalog.stats.maxDepth).toBe(computed.maxDepth);
      expect(netappCatalog.stats.categoriesCount).toBe(computed.categoriesCount);
    });

    it('should have 38 total nodes', () => {
      expect(netappCatalog.stats.totalProducts).toBe(38);
    });

    it('should have maxDepth of 2', () => {
      expect(netappCatalog.stats.maxDepth).toBe(2);
    });

    it('should have 5 top-level categories', () => {
      expect(netappCatalog.stats.categoriesCount).toBe(5);
    });
  });

  // -------------------------------------------------------------------------
  // Product tree structure
  // -------------------------------------------------------------------------
  describe('product tree structure', () => {
    it('should have 5 root categories', () => {
      expect(netappCatalog.products).toHaveLength(5);
      const names = netappCatalog.products.map((p) => p.name);
      expect(names).toEqual([
        'All-Flash Storage',
        'Hybrid Storage',
        'Object Storage',
        'Cloud Storage',
        'Data Management',
      ]);
    });

    it('should have all root nodes at depth 0', () => {
      for (const product of netappCatalog.products) {
        expect(product.depth).toBe(0);
      }
    });

    it('should have All-Flash Storage with 2 product lines', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-all-flash-storage');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(2);
    });

    it('should have Hybrid Storage with 1 product line', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-hybrid-storage');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(1);
    });

    it('should have Object Storage with 1 product line', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-object-storage');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(1);
    });

    it('should have Cloud Storage with 4 product lines', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-cloud-storage');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(4);
    });

    it('should have Data Management with 3 product lines', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-data-management');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
    });
  });

  // -------------------------------------------------------------------------
  // Node ID uniqueness
  // -------------------------------------------------------------------------
  describe('node ID uniqueness', () => {
    it('should have globally unique nodeIds', () => {
      const allNodes = getAllNodes(netappCatalog.products);
      const ids = allNodes.map((n) => n.nodeId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all nodeIds prefixed with netapp-', () => {
      const allNodes = getAllNodes(netappCatalog.products);
      for (const node of allNodes) {
        expect(node.nodeId).toMatch(/^netapp-/);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Bilingual completeness
  // -------------------------------------------------------------------------
  describe('bilingual completeness', () => {
    it('should have non-empty name and nameKo for all nodes', () => {
      const allNodes = getAllNodes(netappCatalog.products);
      for (const node of allNodes) {
        expect(node.name.length).toBeGreaterThan(0);
        expect(node.nameKo.length).toBeGreaterThan(0);
      }
    });

    it('should have non-empty description and descriptionKo for all nodes', () => {
      const allNodes = getAllNodes(netappCatalog.products);
      for (const node of allNodes) {
        expect(node.description.length).toBeGreaterThan(0);
        expect(node.descriptionKo.length).toBeGreaterThan(0);
      }
    });

    it('should have depthLabel and depthLabelKo for all nodes', () => {
      const allNodes = getAllNodes(netappCatalog.products);
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
      const allNodes = getAllNodes(netappCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).toMatch(/^https:\/\//);
      }
    });

    it('should not have any relative URLs', () => {
      const allNodes = getAllNodes(netappCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).not.toMatch(/^\/[^/]/);
      }
    });

    it('should use English URLs (not Korean URLs)', () => {
      const allNodes = getAllNodes(netappCatalog.products);
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
      const allNodes = getAllNodes(netappCatalog.products);
      for (const node of allNodes) {
        for (const child of node.children) {
          expect(child.depth).toBe(node.depth + 1);
        }
      }
    });

    it('should have leaf nodes with empty children arrays', () => {
      const leaves = getLeafNodes(netappCatalog.products);
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
      const allNodes = getAllNodes(netappCatalog.products);
      const withTypes = allNodes.filter(
        (n) => n.infraNodeTypes && n.infraNodeTypes.length > 0,
      );
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

      const allNodes = getAllNodes(netappCatalog.products);
      for (const node of allNodes) {
        if (node.infraNodeTypes) {
          for (const type of node.infraNodeTypes) {
            expect(validTypes.has(type)).toBe(true);
          }
        }
      }
    });

    it('should have infraNodeTypes on all depth 0 and depth 1 nodes', () => {
      const allNodes = getAllNodes(netappCatalog.products);
      const depth01 = allNodes.filter((n) => n.depth <= 1);
      const withoutTypes = depth01.filter(
        (n) => !n.infraNodeTypes || n.infraNodeTypes.length === 0,
      );
      expect(withoutTypes.map((n) => n.nodeId)).toEqual([]);
    });

    it('should map All-Flash Storage to san-nas and storage types', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-all-flash-storage');
      expect(node!.infraNodeTypes).toContain('san-nas');
      expect(node!.infraNodeTypes).toContain('storage');
    });

    it('should map Hybrid Storage to san-nas and storage types', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-hybrid-storage');
      expect(node!.infraNodeTypes).toContain('san-nas');
      expect(node!.infraNodeTypes).toContain('storage');
    });

    it('should map Object Storage to object-storage type', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-object-storage');
      expect(node!.infraNodeTypes).toContain('object-storage');
    });

    it('should map Cloud Storage to san-nas and storage types', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-cloud-storage');
      expect(node!.infraNodeTypes).toContain('san-nas');
      expect(node!.infraNodeTypes).toContain('storage');
    });

    it('should map Data Management to storage and backup types', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-data-management');
      expect(node!.infraNodeTypes).toContain('storage');
      expect(node!.infraNodeTypes).toContain('backup');
    });
  });

  // -------------------------------------------------------------------------
  // AFF A-Series deep-dive
  // -------------------------------------------------------------------------
  describe('AFF A-Series', () => {
    it('should have 5 AFF A-Series models', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-aff-a-series');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(5);
      const names = node!.children.map((c) => c.name);
      expect(names).toContain('AFF A150');
      expect(names).toContain('AFF A250');
      expect(names).toContain('AFF A400');
      expect(names).toContain('AFF A800');
      expect(names).toContain('AFF A900');
    });

    it('should have AFF A900 with 2.4M IOPS', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-aff-a900');
      expect(node).toBeDefined();
      expect(node!.specs!['Max IOPS']).toContain('2,400,000');
      expect(node!.maxThroughput).toContain('2.4M IOPS');
    });

    it('should have AFF A900 with NVMe/FC and 100GbE support', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-aff-a900');
      expect(node!.specs!['Host Protocols']).toContain('NVMe/FC');
      expect(node!.specs!['Network Ports']).toContain('100GbE');
    });

    it('should have AFF A800 with high-performance specs', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-aff-a800');
      expect(node).toBeDefined();
      expect(node!.specs!['Max IOPS']).toContain('1,600,000');
      expect(node!.specs!['Max Raw Capacity']).toContain('4.8 PB');
    });

    it('should have AFF A150 as entry-level all-flash', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-aff-a150');
      expect(node).toBeDefined();
      expect(node!.lifecycle).toBe('active');
      expect(node!.formFactor).toBe('appliance');
      expect(node!.specs!['Form Factor']).toBe('2U rack');
    });

    it('should have architectureRole on AFF A-Series product line', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-aff-a-series');
      expect(node!.architectureRole).toContain('Primary Storage');
      expect(node!.architectureRoleKo).toBeTruthy();
    });

    it('should have at least 5 recommendedFor entries on AFF A-Series', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-aff-a-series');
      expect(node!.recommendedFor!.length).toBeGreaterThanOrEqual(5);
      expect(node!.recommendedForKo!.length).toBeGreaterThanOrEqual(5);
    });

    it('should have HA features on AFF A-Series', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-aff-a-series');
      expect(node!.haFeatures).toContain('Active-Active controllers');
      expect(node!.haFeatures).toContain('MetroCluster');
      expect(node!.haFeatures).toContain('SnapMirror');
    });

    it('should have security capabilities on AFF A-Series', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-aff-a-series');
      expect(node!.securityCapabilities!.length).toBeGreaterThanOrEqual(4);
    });
  });

  // -------------------------------------------------------------------------
  // AFF C-Series deep-dive
  // -------------------------------------------------------------------------
  describe('AFF C-Series', () => {
    it('should have 3 AFF C-Series models', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-aff-c-series');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
    });

    it('should have AFF C800 as large capacity flash', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-aff-c800');
      expect(node).toBeDefined();
      expect(node!.specs!['Max IOPS']).toContain('1,000,000');
      expect(node!.specs!['Drive Type']).toContain('QLC');
    });

    it('should have architectureRole referencing capacity tier', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-aff-c-series');
      expect(node!.architectureRole).toContain('Capacity');
      expect(node!.architectureRoleKo).toContain('용량');
    });
  });

  // -------------------------------------------------------------------------
  // FAS Series deep-dive
  // -------------------------------------------------------------------------
  describe('FAS Series', () => {
    it('should have 4 FAS models', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-fas-series');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(4);
      const names = node!.children.map((c) => c.name);
      expect(names).toContain('FAS2820');
      expect(names).toContain('FAS8300');
      expect(names).toContain('FAS8700');
      expect(names).toContain('FAS9500');
    });

    it('should have FAS9500 as mission-critical hybrid', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-fas9500');
      expect(node).toBeDefined();
      expect(node!.specs!['Max Raw Capacity']).toContain('28.8 PB');
      expect(node!.specs!['MetroCluster Support']).toBeTruthy();
    });

    it('should have FAS2820 as entry-level hybrid', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-fas2820');
      expect(node).toBeDefined();
      expect(node!.lifecycle).toBe('active');
      expect(node!.formFactor).toBe('appliance');
      expect(node!.specs!['SSD Cache']).toContain('Flash Pool');
    });

    it('should have architectureRole on FAS Series', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-fas-series');
      expect(node!.architectureRole).toContain('Secondary Storage');
      expect(node!.architectureRoleKo).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // StorageGRID deep-dive
  // -------------------------------------------------------------------------
  describe('StorageGRID', () => {
    it('should have StorageGRID as S3-compatible object storage', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-storagegrid');
      expect(node).toBeDefined();
      expect(node!.lifecycle).toBe('active');
      expect(node!.specs!['S3 Compatibility']).toContain('S3 API');
      expect(node!.specs!['Data Protection']).toContain('Erasure coding');
    });

    it('should have ILM engine for lifecycle management', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-storagegrid');
      expect(node!.specs!['ILM Engine']).toContain('lifecycle management');
    });

    it('should have petabyte-scale capacity', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-storagegrid');
      expect(node!.specs!['Max Scale']).toContain('Petabytes');
    });
  });

  // -------------------------------------------------------------------------
  // Cloud Storage deep-dive
  // -------------------------------------------------------------------------
  describe('Cloud Storage', () => {
    it('should have CVO for AWS with S3 tiering', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-cvo-aws');
      expect(node).toBeDefined();
      expect(node!.lifecycle).toBe('active');
      expect(node!.formFactor).toBe('cloud');
      expect(node!.specs!['Cloud Provider']).toBe('AWS');
      expect(node!.specs!['Data Tiering']).toContain('S3');
    });

    it('should have CVO for Azure with Blob tiering', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-cvo-azure');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('cloud');
      expect(node!.specs!['Cloud Provider']).toBe('Azure');
      expect(node!.specs!['Data Tiering']).toContain('Blob');
    });

    it('should have CVO for GCP with Cloud Storage tiering', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-cvo-gcp');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('cloud');
      expect(node!.specs!['Cloud Provider']).toBe('GCP');
    });

    it('should have FSx for ONTAP as AWS-managed', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-fsx-ontap');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('cloud');
      expect(node!.licensingModel).toBe('as-a-service');
      expect(node!.specs!['Cloud Provider']).toContain('AWS');
    });

    it('should have Azure NetApp Files as Azure-managed', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-azure-netapp-files');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('cloud');
      expect(node!.licensingModel).toBe('as-a-service');
      expect(node!.specs!['Cloud Provider']).toContain('Azure');
    });

    it('should have Google Cloud NetApp Volumes as GCP-managed', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-gcp-netapp-volumes');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('cloud');
      expect(node!.licensingModel).toBe('as-a-service');
      expect(node!.specs!['Cloud Provider']).toContain('GCP');
    });
  });

  // -------------------------------------------------------------------------
  // Data Management deep-dive
  // -------------------------------------------------------------------------
  describe('Data Management', () => {
    it('should have BlueXP as unified control plane', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-bluexp');
      expect(node).toBeDefined();
      expect(node!.lifecycle).toBe('active');
      expect(node!.formFactor).toBe('cloud');
      expect(node!.specs!['Deployment Model']).toContain('SaaS');
    });

    it('should have SnapCenter for application-consistent backup', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-snapcenter');
      expect(node).toBeDefined();
      expect(node!.lifecycle).toBe('active');
      expect(node!.specs!['Supported Applications']).toContain('Oracle');
      expect(node!.specs!['Clone Technology']).toContain('FlexClone');
    });

    it('should have ONTAP as unified storage OS', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-ontap');
      expect(node).toBeDefined();
      expect(node!.lifecycle).toBe('active');
      expect(node!.specs!['Supported Protocols']).toContain('NVMe/FC');
      expect(node!.specs!['Supported Protocols']).toContain('S3');
    });

    it('should have ONTAP with ransomware protection', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-ontap');
      expect(node!.specs!['Security']).toContain('Autonomous Ransomware Protection');
    });
  });

  // -------------------------------------------------------------------------
  // Leaf node counts
  // -------------------------------------------------------------------------
  describe('leaf node counts', () => {
    it('should match countLeafNodes helper', () => {
      const count = countLeafNodes(netappCatalog.products);
      const leaves = getLeafNodes(netappCatalog.products);
      expect(count).toBe(leaves.length);
    });

    it('should have all leaf nodes at depth 2', () => {
      const leaves = getLeafNodes(netappCatalog.products);
      for (const leaf of leaves) {
        expect(leaf.depth).toBe(2);
      }
    });

    it('should have 22 leaf nodes', () => {
      const leaves = getLeafNodes(netappCatalog.products);
      expect(leaves).toHaveLength(22);
    });
  });

  // -------------------------------------------------------------------------
  // Depth distribution
  // -------------------------------------------------------------------------
  describe('depth distribution', () => {
    it('should have 5 nodes at depth 0', () => {
      const nodes = getNodesByDepth(netappCatalog.products, 0);
      expect(nodes).toHaveLength(5);
    });

    it('should have 11 nodes at depth 1', () => {
      const nodes = getNodesByDepth(netappCatalog.products, 1);
      expect(nodes).toHaveLength(11);
    });

    it('should have 22 nodes at depth 2', () => {
      const nodes = getNodesByDepth(netappCatalog.products, 2);
      expect(nodes).toHaveLength(22);
    });
  });

  // -------------------------------------------------------------------------
  // Data quality validation
  // -------------------------------------------------------------------------
  describe('data quality validation', () => {
    describe('architecture planning fields', () => {
      it('should have architectureRole and architectureRoleKo pair completeness', () => {
        const allNodes = getAllNodes(netappCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.architectureRole && !n.architectureRoleKo) ||
            (!n.architectureRole && n.architectureRoleKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor and recommendedForKo pair completeness', () => {
        const allNodes = getAllNodes(netappCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.recommendedFor && !n.recommendedForKo) ||
            (!n.recommendedFor && n.recommendedForKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor with matching length in recommendedForKo', () => {
        const allNodes = getAllNodes(netappCatalog.products);
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
        const allNodes = getAllNodes(netappCatalog.products);
        for (const node of allNodes) {
          if (node.lifecycle) {
            expect(validValues.has(node.lifecycle)).toBe(true);
          }
        }
      });

      it('should have lifecycle set on all depth 2 leaf nodes', () => {
        const leaves = getLeafNodes(netappCatalog.products);
        const depth2Leaves = leaves.filter((l) => l.depth === 2);
        for (const leaf of depth2Leaves) {
          expect(leaf.lifecycle).toBeDefined();
        }
      });
    });

    describe('licensing and form factor', () => {
      it('should have formFactor on all depth 2 leaf nodes', () => {
        const leaves = getLeafNodes(netappCatalog.products);
        const depth2Leaves = leaves.filter((l) => l.depth === 2);
        for (const leaf of depth2Leaves) {
          expect(leaf.formFactor).toBeDefined();
        }
      });
    });

    describe('specs completeness', () => {
      it('should have specs on all depth 2 leaf nodes', () => {
        const leaves = getLeafNodes(netappCatalog.products);
        const depth2Leaves = leaves.filter((l) => l.depth === 2);
        for (const leaf of depth2Leaves) {
          expect(leaf.specs).toBeDefined();
          expect(Object.keys(leaf.specs!).length).toBeGreaterThanOrEqual(5);
        }
      });
    });

    describe('coverage statistics', () => {
      it('should report infraNodeTypes coverage on all depth 0 and 1 nodes', () => {
        const allNodes = getAllNodes(netappCatalog.products);
        const depth01 = allNodes.filter((n) => n.depth <= 1);
        const depth01WithTypes = depth01.filter(
          (n) => n.infraNodeTypes && n.infraNodeTypes.length > 0,
        );
        expect(depth01WithTypes.length).toBe(depth01.length);
      });

      it('should report architectureRole coverage on all depth 1 nodes', () => {
        const allNodes = getAllNodes(netappCatalog.products);
        const depth1 = allNodes.filter((n) => n.depth === 1);
        const withRole = depth1.filter((n) => n.architectureRole);
        expect(withRole.length).toBe(depth1.length);
      });
    });
  });

  // -------------------------------------------------------------------------
  // Search functionality
  // -------------------------------------------------------------------------
  describe('search', () => {
    it('should find NetApp products by English name (AFF)', () => {
      const results = searchNodes(netappCatalog.products, 'AFF');
      expect(results.length).toBeGreaterThanOrEqual(8);
    });

    it('should find products by Korean name (스토리지)', () => {
      const results = searchNodes(netappCatalog.products, '스토리지');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find ONTAP products', () => {
      const results = searchNodes(netappCatalog.products, 'ONTAP');
      expect(results.length).toBeGreaterThanOrEqual(5);
    });

    it('should find storage products by keyword', () => {
      const results = searchNodes(netappCatalog.products, 'storage');
      expect(results.length).toBeGreaterThan(5);
    });

    it('should find cloud products by keyword', () => {
      const results = searchNodes(netappCatalog.products, 'cloud');
      expect(results.length).toBeGreaterThanOrEqual(3);
    });

    it('should find node by exact nodeId', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-aff-a900');
      expect(node).toBeDefined();
      expect(node!.name).toBe('AFF A900');
    });
  });

  // -------------------------------------------------------------------------
  // Specific product spot checks
  // -------------------------------------------------------------------------
  describe('specific product spot checks', () => {
    it('should have AFF A400 with multi-protocol support', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-aff-a400');
      expect(node).toBeDefined();
      expect(node!.specs!['Host Protocols']).toContain('NVMe/FC');
      expect(node!.specs!['Host Protocols']).toContain('NFS');
      expect(node!.specs!['Host Protocols']).toContain('iSCSI');
    });

    it('should have AFF C250 with QLC NVMe SSDs', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-aff-c250');
      expect(node).toBeDefined();
      expect(node!.specs!['Drive Type']).toContain('QLC');
    });

    it('should have FAS8300 with Flash Pool caching', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-fas8300');
      expect(node).toBeDefined();
      expect(node!.specs!['SSD Cache']).toContain('Flash Pool');
      expect(node!.specs!['Max Raw Capacity']).toContain('8.6 PB');
    });

    it('should have FAS8700 with enterprise-grade capacity', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-fas8700');
      expect(node).toBeDefined();
      expect(node!.specs!['Max Raw Capacity']).toContain('17.2 PB');
    });

    it('should have BlueXP managing all NetApp resources', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-bluexp');
      expect(node).toBeDefined();
      expect(node!.specs!['Managed Resources']).toContain('ONTAP');
      expect(node!.specs!['Managed Resources']).toContain('StorageGRID');
      expect(node!.specs!['Managed Resources']).toContain('CVO');
    });

    it('should have SnapCenter with database and VMware support', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-snapcenter');
      expect(node).toBeDefined();
      expect(node!.specs!['Supported Applications']).toContain('SAP HANA');
      expect(node!.specs!['Supported Applications']).toContain('VMware');
    });

    it('should have ONTAP with 24-node cluster support', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-ontap');
      expect(node).toBeDefined();
      expect(node!.specs!['Max Cluster Size']).toContain('24 nodes');
    });

    it('should have CVO for all three cloud providers', () => {
      const aws = findNodeById(netappCatalog.products, 'netapp-cvo-aws');
      const azure = findNodeById(netappCatalog.products, 'netapp-cvo-azure');
      const gcp = findNodeById(netappCatalog.products, 'netapp-cvo-gcp');
      expect(aws).toBeDefined();
      expect(azure).toBeDefined();
      expect(gcp).toBeDefined();
      expect(aws!.licensingModel).toBe('subscription');
      expect(azure!.licensingModel).toBe('subscription');
      expect(gcp!.licensingModel).toBe('subscription');
    });

    it('should have StorageGRID with multi-site geo-distribution', () => {
      const node = findNodeById(netappCatalog.products, 'netapp-storagegrid');
      expect(node).toBeDefined();
      expect(node!.specs!['Multi-Site']).toContain('geo-distribution');
      expect(node!.licensingModel).toBe('subscription');
    });
  });
});
