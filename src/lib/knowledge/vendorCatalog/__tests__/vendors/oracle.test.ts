import { describe, it, expect } from 'vitest';
import { oracleCatalog } from '../../vendors/oracle';
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
// Oracle Catalog -- Data Integrity Tests
// ---------------------------------------------------------------------------

describe('Oracle vendor catalog', () => {
  // -------------------------------------------------------------------------
  // Top-level catalog metadata
  // -------------------------------------------------------------------------
  describe('catalog metadata', () => {
    it('should have correct vendor identity', () => {
      expect(oracleCatalog.vendorId).toBe('oracle');
      expect(oracleCatalog.vendorName).toBe('Oracle');
      expect(oracleCatalog.vendorNameKo).toBe('오라클');
      expect(oracleCatalog.headquarters).toBe('Austin, TX, USA');
    });

    it('should have valid URLs', () => {
      expect(oracleCatalog.website).toBe('https://www.oracle.com');
      expect(oracleCatalog.productPageUrl).toMatch(/^https:\/\//);
      expect(oracleCatalog.crawlSource).toMatch(/^https:\/\//);
    });

    it('should have bilingual depth structure', () => {
      expect(oracleCatalog.depthStructure).toEqual(['category', 'product-line', 'edition']);
      expect(oracleCatalog.depthStructureKo).toEqual(['카테고리', '제품 라인', '에디션']);
      expect(oracleCatalog.depthStructure).toHaveLength(oracleCatalog.depthStructureKo.length);
    });

    it('should have crawl metadata', () => {
      expect(oracleCatalog.lastCrawled).toBe('2026-02-22');
      expect(oracleCatalog.crawlSource).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Stats validation
  // -------------------------------------------------------------------------
  describe('catalog stats', () => {
    it('should have accurate totalProducts count', () => {
      const allNodes = getAllNodes(oracleCatalog.products);
      expect(oracleCatalog.stats.totalProducts).toBe(allNodes.length);
    });

    it('should have accurate maxDepth', () => {
      const actualMax = getMaxDepth(oracleCatalog.products);
      expect(oracleCatalog.stats.maxDepth).toBe(actualMax);
    });

    it('should have accurate categoriesCount', () => {
      expect(oracleCatalog.stats.categoriesCount).toBe(oracleCatalog.products.length);
    });

    it('should match computeStats output', () => {
      const computed = computeStats(oracleCatalog.products);
      expect(oracleCatalog.stats.totalProducts).toBe(computed.totalProducts);
      expect(oracleCatalog.stats.maxDepth).toBe(computed.maxDepth);
      expect(oracleCatalog.stats.categoriesCount).toBe(computed.categoriesCount);
    });

    it('should have 40 total nodes', () => {
      expect(oracleCatalog.stats.totalProducts).toBe(40);
    });

    it('should have maxDepth of 2', () => {
      expect(oracleCatalog.stats.maxDepth).toBe(2);
    });

    it('should have 4 top-level categories', () => {
      expect(oracleCatalog.stats.categoriesCount).toBe(4);
    });
  });

  // -------------------------------------------------------------------------
  // Product tree structure
  // -------------------------------------------------------------------------
  describe('product tree structure', () => {
    it('should have 4 root categories', () => {
      expect(oracleCatalog.products).toHaveLength(4);
      const names = oracleCatalog.products.map((p) => p.name);
      expect(names).toEqual([
        'Oracle Database',
        'Engineered Systems',
        'Oracle Cloud Infrastructure',
        'Data Management',
      ]);
    });

    it('should have all root nodes at depth 0', () => {
      for (const product of oracleCatalog.products) {
        expect(product.depth).toBe(0);
      }
    });

    it('should have Oracle Database with 4 product lines', () => {
      const db = oracleCatalog.products.find((p) => p.nodeId === 'oracle-database');
      expect(db).toBeDefined();
      expect(db!.children).toHaveLength(4);
    });

    it('should have Engineered Systems with 1 product line', () => {
      const eng = oracleCatalog.products.find((p) => p.nodeId === 'oracle-engineered-systems');
      expect(eng).toBeDefined();
      expect(eng!.children).toHaveLength(1);
    });

    it('should have OCI with 3 product lines', () => {
      const oci = oracleCatalog.products.find((p) => p.nodeId === 'oracle-cloud-infrastructure');
      expect(oci).toBeDefined();
      expect(oci!.children).toHaveLength(3);
    });

    it('should have Data Management with 3 product lines', () => {
      const dm = oracleCatalog.products.find((p) => p.nodeId === 'oracle-data-management');
      expect(dm).toBeDefined();
      expect(dm!.children).toHaveLength(3);
    });
  });

  // -------------------------------------------------------------------------
  // Node ID uniqueness
  // -------------------------------------------------------------------------
  describe('node ID uniqueness', () => {
    it('should have globally unique nodeIds', () => {
      const allNodes = getAllNodes(oracleCatalog.products);
      const ids = allNodes.map((n) => n.nodeId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all nodeIds prefixed with oracle-', () => {
      const allNodes = getAllNodes(oracleCatalog.products);
      for (const node of allNodes) {
        expect(node.nodeId).toMatch(/^oracle-/);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Bilingual completeness
  // -------------------------------------------------------------------------
  describe('bilingual completeness', () => {
    it('should have non-empty name and nameKo for all nodes', () => {
      const allNodes = getAllNodes(oracleCatalog.products);
      for (const node of allNodes) {
        expect(node.name.length).toBeGreaterThan(0);
        expect(node.nameKo.length).toBeGreaterThan(0);
      }
    });

    it('should have non-empty description and descriptionKo for all nodes', () => {
      const allNodes = getAllNodes(oracleCatalog.products);
      for (const node of allNodes) {
        expect(node.description.length).toBeGreaterThan(0);
        expect(node.descriptionKo.length).toBeGreaterThan(0);
      }
    });

    it('should have depthLabel and depthLabelKo for all nodes', () => {
      const allNodes = getAllNodes(oracleCatalog.products);
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
      const allNodes = getAllNodes(oracleCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).toMatch(/^https:\/\//);
      }
    });

    it('should not have any relative URLs', () => {
      const allNodes = getAllNodes(oracleCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).not.toMatch(/^\/[^/]/);
      }
    });

    it('should use English URLs (not Korean URLs)', () => {
      const allNodes = getAllNodes(oracleCatalog.products);
      const koreanUrls = allNodes.filter((n) => n.sourceUrl.includes('ko_kr') || n.sourceUrl.includes('/kr/ko/'));
      expect(koreanUrls.map((n) => n.nodeId)).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // Depth consistency
  // -------------------------------------------------------------------------
  describe('depth consistency', () => {
    it('should have children with depth exactly parent.depth + 1', () => {
      const allNodes = getAllNodes(oracleCatalog.products);
      for (const node of allNodes) {
        for (const child of node.children) {
          expect(child.depth).toBe(node.depth + 1);
        }
      }
    });

    it('should have leaf nodes with empty children arrays', () => {
      const leaves = getLeafNodes(oracleCatalog.products);
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
      const allNodes = getAllNodes(oracleCatalog.products);
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

      const allNodes = getAllNodes(oracleCatalog.products);
      for (const node of allNodes) {
        if (node.infraNodeTypes) {
          for (const type of node.infraNodeTypes) {
            expect(validTypes.has(type)).toBe(true);
          }
        }
      }
    });

    it('should have infraNodeTypes on all depth 0 and depth 1 nodes', () => {
      const allNodes = getAllNodes(oracleCatalog.products);
      const depth01 = allNodes.filter((n) => n.depth <= 1);
      const withoutTypes = depth01.filter(
        (n) => !n.infraNodeTypes || n.infraNodeTypes.length === 0,
      );
      expect(withoutTypes.map((n) => n.nodeId)).toEqual([]);
    });

    it('should map Oracle Database to db-server type', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-database');
      expect(node!.infraNodeTypes).toContain('db-server');
    });

    it('should map Engineered Systems to db-server and storage types', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-engineered-systems');
      expect(node!.infraNodeTypes).toContain('db-server');
      expect(node!.infraNodeTypes).toContain('storage');
    });

    it('should map OCI to private-cloud type', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-cloud-infrastructure');
      expect(node!.infraNodeTypes).toContain('private-cloud');
    });

    it('should map OKE to kubernetes type', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-oke');
      expect(node!.infraNodeTypes).toContain('kubernetes');
    });

    it('should map OCI Container Instances to container type', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-oci-container-instances');
      expect(node!.infraNodeTypes).toContain('container');
    });
  });

  // -------------------------------------------------------------------------
  // Oracle Database On-Premises deep-dive
  // -------------------------------------------------------------------------
  describe('Oracle Database On-Premises', () => {
    it('should have 3 editions', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-db-on-premises');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
      const names = node!.children.map((c) => c.name);
      expect(names).toContain('Oracle Database 23ai Enterprise Edition');
      expect(names).toContain('Oracle Database 23ai Standard Edition 2');
      expect(names).toContain('Oracle Database Free');
    });

    it('should have architectureRole on the product line node', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-db-on-premises');
      expect(node!.architectureRole).toBeTruthy();
      expect(node!.architectureRoleKo).toBeTruthy();
    });

    it('should have Enterprise Edition with unlimited specs', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-db-23ai-enterprise');
      expect(node!.specs!['Max DB Size']).toBe('Unlimited');
      expect(node!.specs!['Max RAM']).toBe('Unlimited');
      expect(node!.specs!['Max CPUs']).toBe('Unlimited');
    });

    it('should have Standard Edition 2 with 2-socket limit', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-db-23ai-standard');
      expect(node!.specs!['Max Sockets']).toBe('2');
      expect(node!.specs!['Max RAM']).toBe('128 GB');
      expect(node!.specs!['Real Application Clusters (RAC)']).toBe('No');
    });

    it('should have Free Edition with data/resource limits', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-db-free');
      expect(node!.specs!['Max User Data']).toBe('12 GB');
      expect(node!.specs!['Max RAM']).toBe('2 GB');
      expect(node!.specs!['Max CPUs']).toBe('2');
    });
  });

  // -------------------------------------------------------------------------
  // Autonomous Database deep-dive
  // -------------------------------------------------------------------------
  describe('Autonomous Database', () => {
    it('should have 3 editions (ATP, ADW, AJD)', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-autonomous-db');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
    });

    it('should have ATP with auto-scaling specs', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-atp');
      expect(node).toBeDefined();
      expect(node!.specs!['Auto-Scaling']).toContain('Yes');
      expect(node!.specs!['Auto-Patching']).toContain('Yes');
      expect(node!.specs!['Auto-Tuning']).toContain('Yes');
    });

    it('should have ADW with columnar processing', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-adw');
      expect(node).toBeDefined();
      expect(node!.specs!['Columnar Processing']).toContain('Yes');
      expect(node!.specs!['Machine Learning']).toBeTruthy();
    });

    it('should have AJD with MongoDB compatibility', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-ajd');
      expect(node).toBeDefined();
      expect(node!.specs!['MongoDB Compatibility']).toContain('MongoDB API');
      expect(node!.specs!['SODA API']).toBe('Yes');
    });
  });

  // -------------------------------------------------------------------------
  // Exadata deep-dive
  // -------------------------------------------------------------------------
  describe('Exadata', () => {
    it('should have 3 editions', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-exadata');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
    });

    it('should have X10M with performance specs', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-exadata-x10m');
      expect(node).toBeDefined();
      expect(node!.specs!['Performance']).toContain('2x');
      expect(node!.specs!['Max CPU Cores']).toContain('4,608');
      expect(node!.specs!['Networking']).toContain('RDMA');
    });

    it('should have Cloud@Customer with data sovereignty', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-exadata-cloud-at-customer');
      expect(node).toBeDefined();
      expect(node!.specs!['Data Sovereignty']).toContain('never leaves');
      expect(node!.licensingModel).toBe('subscription');
    });

    it('should have Exadata Cloud Service in OCI', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-exadata-cloud-service');
      expect(node).toBeDefined();
      expect(node!.specs!['Deployment']).toContain('OCI');
      expect(node!.formFactor).toBe('cloud');
    });
  });

  // -------------------------------------------------------------------------
  // OCI Compute deep-dive
  // -------------------------------------------------------------------------
  describe('OCI Compute', () => {
    it('should have 3 compute service types', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-oci-compute');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
    });

    it('should have Compute Instances with multi-processor support', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-oci-compute-instances');
      expect(node).toBeDefined();
      expect(node!.specs!['Processors']).toContain('Ampere');
      expect(node!.specs!['Processors']).toContain('AMD EPYC');
      expect(node!.specs!['Processors']).toContain('Intel Xeon');
    });

    it('should have OKE with CNCF-certified Kubernetes', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-oke');
      expect(node).toBeDefined();
      expect(node!.specs!['Kubernetes Version']).toContain('CNCF');
      expect(node!.specs!['Control Plane']).toContain('Free');
    });
  });

  // -------------------------------------------------------------------------
  // OCI Storage deep-dive
  // -------------------------------------------------------------------------
  describe('OCI Storage', () => {
    it('should have 3 storage service types', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-oci-storage');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
    });

    it('should have Object Storage with 11 nines durability', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-oci-object-storage');
      expect(node).toBeDefined();
      expect(node!.specs!['Durability']).toContain('99.999999999%');
      expect(node!.specs!['Max Object Size']).toContain('10 TB');
    });

    it('should have Block Volumes with 700K IOPS', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-oci-block-volumes');
      expect(node).toBeDefined();
      expect(node!.specs!['Max IOPS']).toContain('700,000');
    });

    it('should have File Storage as NFS with 8EB capacity', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-oci-file-storage');
      expect(node).toBeDefined();
      expect(node!.specs!['Protocol']).toBe('NFSv3');
      expect(node!.specs!['Max Capacity']).toContain('8 EB');
      expect(node!.infraNodeTypes).toContain('san-nas');
    });
  });

  // -------------------------------------------------------------------------
  // Data Management deep-dive
  // -------------------------------------------------------------------------
  describe('Data Management', () => {
    it('should have GoldenGate as CDC/replication product', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-goldengate-product');
      expect(node).toBeDefined();
      expect(node!.specs!['CDC Method']).toContain('Log-based');
      expect(node!.specs!['Latency']).toContain('Sub-second');
    });

    it('should have Data Integrator as ETL/ELT product', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-data-integrator-product');
      expect(node).toBeDefined();
      expect(node!.specs!['Architecture']).toContain('E-LT');
    });

    it('should have Analytics Cloud as BI platform', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-analytics-cloud-product');
      expect(node).toBeDefined();
      expect(node!.specs!['Augmented Analytics']).toBeTruthy();
      expect(node!.specs!['NLP']).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Search functionality
  // -------------------------------------------------------------------------
  describe('search', () => {
    it('should find Oracle products by English name', () => {
      const results = searchNodes(oracleCatalog.products, 'Oracle');
      expect(results.length).toBeGreaterThan(10);
    });

    it('should find products by Korean name (데이터베이스)', () => {
      const results = searchNodes(oracleCatalog.products, '데이터베이스');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find Exadata products', () => {
      const results = searchNodes(oracleCatalog.products, 'Exadata');
      expect(results.length).toBeGreaterThanOrEqual(4);
    });

    it('should find autonomous database products', () => {
      const results = searchNodes(oracleCatalog.products, 'autonomous');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find node by exact nodeId', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-db-23ai-enterprise');
      expect(node).toBeDefined();
      expect(node!.name).toBe('Oracle Database 23ai Enterprise Edition');
    });
  });

  // -------------------------------------------------------------------------
  // Leaf node counts
  // -------------------------------------------------------------------------
  describe('leaf node counts', () => {
    it('should match countLeafNodes helper', () => {
      const count = countLeafNodes(oracleCatalog.products);
      const leaves = getLeafNodes(oracleCatalog.products);
      expect(count).toBe(leaves.length);
    });

    it('should have all leaf nodes at depth 2', () => {
      const leaves = getLeafNodes(oracleCatalog.products);
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
      const nodes = getNodesByDepth(oracleCatalog.products, 0);
      expect(nodes).toHaveLength(4);
    });

    it('should have 11 nodes at depth 1', () => {
      const nodes = getNodesByDepth(oracleCatalog.products, 1);
      expect(nodes).toHaveLength(11);
    });

    it('should have 25 nodes at depth 2', () => {
      const nodes = getNodesByDepth(oracleCatalog.products, 2);
      expect(nodes).toHaveLength(25);
    });
  });

  // -------------------------------------------------------------------------
  // Data quality validation
  // -------------------------------------------------------------------------
  describe('data quality validation', () => {
    describe('architecture planning fields', () => {
      it('should have architectureRole and architectureRoleKo pair completeness', () => {
        const allNodes = getAllNodes(oracleCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.architectureRole && !n.architectureRoleKo) ||
            (!n.architectureRole && n.architectureRoleKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor and recommendedForKo pair completeness', () => {
        const allNodes = getAllNodes(oracleCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.recommendedFor && !n.recommendedForKo) ||
            (!n.recommendedFor && n.recommendedForKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor with matching length in recommendedForKo', () => {
        const allNodes = getAllNodes(oracleCatalog.products);
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
        const allNodes = getAllNodes(oracleCatalog.products);
        for (const node of allNodes) {
          if (node.lifecycle) {
            expect(validValues.has(node.lifecycle)).toBe(true);
          }
        }
      });

      it('should have lifecycle set on all leaf nodes', () => {
        const leaves = getLeafNodes(oracleCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.lifecycle).toBeDefined();
        }
      });
    });

    describe('licensing and form factor', () => {
      it('should have licensingModel on all leaf nodes', () => {
        const leaves = getLeafNodes(oracleCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.licensingModel).toBeDefined();
        }
      });

      it('should have formFactor on all leaf nodes', () => {
        const leaves = getLeafNodes(oracleCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.formFactor).toBeDefined();
        }
      });
    });

    describe('specs completeness', () => {
      it('should have specs on all leaf nodes', () => {
        const leaves = getLeafNodes(oracleCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.specs).toBeDefined();
          expect(Object.keys(leaf.specs!).length).toBeGreaterThanOrEqual(5);
        }
      });
    });

    describe('coverage statistics', () => {
      it('should report infraNodeTypes coverage on all depth 0 and 1 nodes', () => {
        const allNodes = getAllNodes(oracleCatalog.products);
        const depth01 = allNodes.filter((n) => n.depth <= 1);
        const depth01WithTypes = depth01.filter(
          (n) => n.infraNodeTypes && n.infraNodeTypes.length > 0,
        );
        expect(depth01WithTypes.length).toBe(depth01.length);
      });

      it('should report architectureRole coverage on all depth 1 nodes', () => {
        const allNodes = getAllNodes(oracleCatalog.products);
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
    it('should have Enterprise Edition with RAC support', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-db-23ai-enterprise');
      expect(node).toBeDefined();
      expect(node!.specs!['Real Application Clusters (RAC)']).toContain('Yes');
      expect(node!.specs!['Partitioning']).toContain('Yes');
      expect(node!.licensingModel).toBe('perpetual');
    });

    it('should have Oracle Database Free as container form factor', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-db-free');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('container');
      expect(node!.licensingModel).toBe('perpetual');
    });

    it('should have MySQL HeatWave with 400x analytics acceleration', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-mysql-heatwave-db');
      expect(node).toBeDefined();
      expect(node!.specs!['Analytics Acceleration']).toContain('400x');
    });

    it('should have MySQL HeatWave Lakehouse with 36+ file formats', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-mysql-heatwave-lakehouse');
      expect(node).toBeDefined();
      expect(node!.specs!['Supported File Formats']).toContain('36+');
    });

    it('should have Exadata X10M as chassis form factor', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-exadata-x10m');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('chassis');
      expect(node!.licensingModel).toBe('perpetual');
    });

    it('should have OCI Load Balancer with 8 Gbps bandwidth', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-oci-load-balancer');
      expect(node).toBeDefined();
      expect(node!.specs!['Max Bandwidth']).toContain('8 Gbps');
    });

    it('should have OCI FastConnect with 100 Gbps option', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-oci-fastconnect');
      expect(node).toBeDefined();
      expect(node!.specs!['Bandwidth Options']).toContain('100 Gbps');
    });

    it('should have GoldenGate with Kafka support', () => {
      const node = findNodeById(oracleCatalog.products, 'oracle-goldengate-product');
      expect(node).toBeDefined();
      expect(node!.supportedProtocols).toContain('Kafka');
      expect(node!.specs!['Supported Targets']).toContain('Kafka');
    });

    it('should have all cloud products with subscription licensing', () => {
      const cloudProducts = [
        'oracle-atp',
        'oracle-adw',
        'oracle-ajd',
        'oracle-exadata-cloud-service',
        'oracle-oci-compute-instances',
        'oracle-oci-container-instances',
        'oracle-oke',
        'oracle-oci-vcn',
        'oracle-oci-load-balancer',
        'oracle-oci-fastconnect',
        'oracle-oci-object-storage',
        'oracle-oci-block-volumes',
        'oracle-oci-file-storage',
        'oracle-analytics-cloud-product',
      ];
      for (const id of cloudProducts) {
        const node = findNodeById(oracleCatalog.products, id);
        expect(node).toBeDefined();
        expect(node!.licensingModel).toBe('subscription');
      }
    });

    it('should have on-premises products with perpetual licensing', () => {
      const onPremProducts = [
        'oracle-db-23ai-enterprise',
        'oracle-db-23ai-standard',
        'oracle-db-free',
        'oracle-exadata-x10m',
        'oracle-nosql-on-premises',
        'oracle-goldengate-product',
        'oracle-data-integrator-product',
      ];
      for (const id of onPremProducts) {
        const node = findNodeById(oracleCatalog.products, id);
        expect(node).toBeDefined();
        expect(node!.licensingModel).toBe('perpetual');
      }
    });
  });
});
