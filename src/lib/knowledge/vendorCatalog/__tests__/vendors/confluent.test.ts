import { describe, it, expect } from 'vitest';
import { confluentCatalog } from '../../vendors/confluent';
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
// Confluent Catalog -- Data Integrity Tests
// ---------------------------------------------------------------------------

describe('Confluent vendor catalog', () => {
  // -------------------------------------------------------------------------
  // Top-level catalog metadata
  // -------------------------------------------------------------------------
  describe('catalog metadata', () => {
    it('should have correct vendor identity', () => {
      expect(confluentCatalog.vendorId).toBe('confluent');
      expect(confluentCatalog.vendorName).toBe('Confluent');
      expect(confluentCatalog.vendorNameKo).toBe('컨플루언트');
      expect(confluentCatalog.headquarters).toBe('Mountain View, CA, USA');
    });

    it('should have valid URLs', () => {
      expect(confluentCatalog.website).toBe('https://www.confluent.io');
      expect(confluentCatalog.productPageUrl).toMatch(/^https:\/\//);
      expect(confluentCatalog.crawlSource).toMatch(/^https:\/\//);
    });

    it('should have bilingual depth structure', () => {
      expect(confluentCatalog.depthStructure).toEqual(['category', 'product-line', 'edition']);
      expect(confluentCatalog.depthStructureKo).toEqual(['카테고리', '제품 라인', '에디션']);
      expect(confluentCatalog.depthStructure).toHaveLength(confluentCatalog.depthStructureKo.length);
    });

    it('should have crawl metadata', () => {
      expect(confluentCatalog.lastCrawled).toBe('2026-02-23');
      expect(confluentCatalog.crawlSource).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Stats validation
  // -------------------------------------------------------------------------
  describe('catalog stats', () => {
    it('should have accurate totalProducts count', () => {
      const allNodes = getAllNodes(confluentCatalog.products);
      expect(confluentCatalog.stats.totalProducts).toBe(allNodes.length);
    });

    it('should have accurate maxDepth', () => {
      const actualMax = getMaxDepth(confluentCatalog.products);
      expect(confluentCatalog.stats.maxDepth).toBe(actualMax);
    });

    it('should have accurate categoriesCount', () => {
      expect(confluentCatalog.stats.categoriesCount).toBe(confluentCatalog.products.length);
    });

    it('should match computeStats output', () => {
      const computed = computeStats(confluentCatalog.products);
      expect(confluentCatalog.stats.totalProducts).toBe(computed.totalProducts);
      expect(confluentCatalog.stats.maxDepth).toBe(computed.maxDepth);
      expect(confluentCatalog.stats.categoriesCount).toBe(computed.categoriesCount);
    });

    it('should have 29 total nodes', () => {
      expect(confluentCatalog.stats.totalProducts).toBe(29);
    });

    it('should have maxDepth of 2', () => {
      expect(confluentCatalog.stats.maxDepth).toBe(2);
    });

    it('should have 4 top-level categories', () => {
      expect(confluentCatalog.stats.categoriesCount).toBe(4);
    });
  });

  // -------------------------------------------------------------------------
  // Product tree structure
  // -------------------------------------------------------------------------
  describe('product tree structure', () => {
    it('should have 4 root categories', () => {
      expect(confluentCatalog.products).toHaveLength(4);
      const names = confluentCatalog.products.map((p) => p.name);
      expect(names).toEqual([
        'Confluent Cloud',
        'Confluent Platform',
        'Data Streaming',
        'Stream Sharing',
      ]);
    });

    it('should have all root nodes at depth 0', () => {
      for (const product of confluentCatalog.products) {
        expect(product.depth).toBe(0);
      }
    });

    it('should have Confluent Cloud with 3 product lines', () => {
      const cloud = confluentCatalog.products.find((p) => p.nodeId === 'confluent-cloud');
      expect(cloud).toBeDefined();
      expect(cloud!.children).toHaveLength(3);
    });

    it('should have Confluent Platform with 2 product lines', () => {
      const platform = confluentCatalog.products.find((p) => p.nodeId === 'confluent-platform');
      expect(platform).toBeDefined();
      expect(platform!.children).toHaveLength(2);
    });

    it('should have Data Streaming with 4 product lines', () => {
      const streaming = confluentCatalog.products.find((p) => p.nodeId === 'confluent-data-streaming');
      expect(streaming).toBeDefined();
      expect(streaming!.children).toHaveLength(4);
    });

    it('should have Stream Sharing with 2 product lines', () => {
      const sharing = confluentCatalog.products.find((p) => p.nodeId === 'confluent-stream-sharing-category');
      expect(sharing).toBeDefined();
      expect(sharing!.children).toHaveLength(2);
    });
  });

  // -------------------------------------------------------------------------
  // Node ID uniqueness
  // -------------------------------------------------------------------------
  describe('node ID uniqueness', () => {
    it('should have globally unique nodeIds', () => {
      const allNodes = getAllNodes(confluentCatalog.products);
      const ids = allNodes.map((n) => n.nodeId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all nodeIds prefixed with confluent-', () => {
      const allNodes = getAllNodes(confluentCatalog.products);
      for (const node of allNodes) {
        expect(node.nodeId).toMatch(/^confluent-/);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Bilingual completeness
  // -------------------------------------------------------------------------
  describe('bilingual completeness', () => {
    it('should have non-empty name and nameKo for all nodes', () => {
      const allNodes = getAllNodes(confluentCatalog.products);
      for (const node of allNodes) {
        expect(node.name.length).toBeGreaterThan(0);
        expect(node.nameKo.length).toBeGreaterThan(0);
      }
    });

    it('should have non-empty description and descriptionKo for all nodes', () => {
      const allNodes = getAllNodes(confluentCatalog.products);
      for (const node of allNodes) {
        expect(node.description.length).toBeGreaterThan(0);
        expect(node.descriptionKo.length).toBeGreaterThan(0);
      }
    });

    it('should have depthLabel and depthLabelKo for all nodes', () => {
      const allNodes = getAllNodes(confluentCatalog.products);
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
      const allNodes = getAllNodes(confluentCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).toMatch(/^https:\/\//);
      }
    });

    it('should not have any relative URLs', () => {
      const allNodes = getAllNodes(confluentCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).not.toMatch(/^\/[^/]/);
      }
    });

    it('should use English URLs (not Korean URLs)', () => {
      const allNodes = getAllNodes(confluentCatalog.products);
      const koreanUrls = allNodes.filter((n) => n.sourceUrl.includes('ko_kr') || n.sourceUrl.includes('/kr/ko/'));
      expect(koreanUrls.map((n) => n.nodeId)).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // Depth consistency
  // -------------------------------------------------------------------------
  describe('depth consistency', () => {
    it('should have children with depth exactly parent.depth + 1', () => {
      const allNodes = getAllNodes(confluentCatalog.products);
      for (const node of allNodes) {
        for (const child of node.children) {
          expect(child.depth).toBe(node.depth + 1);
        }
      }
    });

    it('should have leaf nodes with empty children arrays', () => {
      const leaves = getLeafNodes(confluentCatalog.products);
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
      const allNodes = getAllNodes(confluentCatalog.products);
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

      const allNodes = getAllNodes(confluentCatalog.products);
      for (const node of allNodes) {
        if (node.infraNodeTypes) {
          for (const type of node.infraNodeTypes) {
            expect(validTypes.has(type)).toBe(true);
          }
        }
      }
    });

    it('should have infraNodeTypes on all depth 0 and depth 1 nodes', () => {
      const allNodes = getAllNodes(confluentCatalog.products);
      const depth01 = allNodes.filter((n) => n.depth <= 1);
      const withoutTypes = depth01.filter(
        (n) => !n.infraNodeTypes || n.infraNodeTypes.length === 0,
      );
      expect(withoutTypes.map((n) => n.nodeId)).toEqual([]);
    });

    it('should map all categories to kafka type', () => {
      for (const category of confluentCatalog.products) {
        expect(category.infraNodeTypes).toContain('kafka');
      }
    });

    it('should map Confluent for Kubernetes to kafka and kubernetes types', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-for-kubernetes');
      expect(node!.infraNodeTypes).toContain('kafka');
      expect(node!.infraNodeTypes).toContain('kubernetes');
    });
  });

  // -------------------------------------------------------------------------
  // Cloud Clusters deep-dive
  // -------------------------------------------------------------------------
  describe('Cloud Clusters', () => {
    it('should have 4 cluster editions (Basic, Standard, Enterprise, Dedicated)', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-cloud-clusters');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(4);
      const names = node!.children.map((c) => c.name);
      expect(names).toContain('Basic Cluster');
      expect(names).toContain('Standard Cluster');
      expect(names).toContain('Enterprise Cluster');
      expect(names).toContain('Dedicated Cluster');
    });

    it('should have Basic Cluster with 99.5% SLA', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-cloud-basic');
      expect(node).toBeDefined();
      expect(node!.specs!['SLA']).toContain('99.5%');
      expect(node!.specs!['Availability Zone']).toBe('Single-AZ');
    });

    it('should have Standard Cluster with multi-AZ and RBAC', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-cloud-standard');
      expect(node).toBeDefined();
      expect(node!.specs!['Availability Zone']).toBe('Multi-AZ');
      expect(node!.specs!['RBAC']).toBe('Supported');
      expect(node!.specs!['SLA']).toContain('99.99%');
    });

    it('should have Enterprise Cluster with mandatory private networking', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-cloud-enterprise');
      expect(node).toBeDefined();
      expect(node!.specs!['Private Networking']).toContain('Mandatory');
      expect(node!.specs!['Access Transparency']).toBe('Supported');
    });

    it('should have Dedicated Cluster with CKU-based scaling', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-cloud-dedicated');
      expect(node).toBeDefined();
      expect(node!.specs!['Scaling Model']).toContain('CKU');
      expect(node!.specs!['SLA']).toContain('99.99%');
      expect(node!.specs!['Cluster Linking']).toContain('Source and destination');
    });

    it('should have architectureRole on the cluster product line', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-cloud-clusters');
      expect(node!.architectureRole).toBeTruthy();
      expect(node!.architectureRoleKo).toBeTruthy();
    });

    it('should have at least 5 recommendedFor entries on cluster product line', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-cloud-clusters');
      expect(node!.recommendedFor!.length).toBeGreaterThanOrEqual(5);
      expect(node!.recommendedForKo!.length).toBeGreaterThanOrEqual(5);
    });
  });

  // -------------------------------------------------------------------------
  // Stream Processing deep-dive
  // -------------------------------------------------------------------------
  describe('Stream Processing', () => {
    it('should have Confluent Cloud for Apache Flink', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-cloud-flink');
      expect(node).toBeDefined();
      expect(node!.name).toContain('Flink');
      expect(node!.specs!['Pricing Unit']).toContain('CFU');
    });

    it('should have Flink with SQL support', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-cloud-flink');
      expect(node!.specs!['SQL Support']).toContain('DDL');
      expect(node!.specs!['SQL Support']).toContain('JOIN');
    });
  });

  // -------------------------------------------------------------------------
  // Confluent Platform deep-dive
  // -------------------------------------------------------------------------
  describe('Confluent Platform', () => {
    it('should have self-managed platform edition', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-platform-edition');
      expect(node).toBeDefined();
      expect(node!.specs!['Included Components']).toContain('Kafka Brokers');
      expect(node!.specs!['Included Components']).toContain('Schema Registry');
      expect(node!.specs!['Included Components']).toContain('ksqlDB');
      expect(node!.specs!['Included Components']).toContain('Control Center');
    });

    it('should have platform with virtual form factor', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-platform-edition');
      expect(node!.formFactor).toBe('virtual');
      expect(node!.licensingModel).toBe('subscription');
    });

    it('should have Confluent for Kubernetes with container form factor', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-for-kubernetes');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('container');
      expect(node!.specs!['Managed Components']).toContain('Kafka');
      expect(node!.specs!['Rolling Upgrades']).toContain('Zero');
    });

    it('should have CFK with Helm and CRD deployment', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-for-kubernetes');
      expect(node!.specs!['Deployment Model']).toContain('Helm');
      expect(node!.specs!['Deployment Model']).toContain('CRD');
    });
  });

  // -------------------------------------------------------------------------
  // Data Streaming services deep-dive
  // -------------------------------------------------------------------------
  describe('Data Streaming services', () => {
    it('should have Schema Registry service', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-schema-registry-service');
      expect(node).toBeDefined();
      expect(node!.specs!['Supported Formats']).toContain('Avro');
      expect(node!.specs!['Supported Formats']).toContain('Protobuf');
      expect(node!.specs!['Supported Formats']).toContain('JSON Schema');
    });

    it('should have ksqlDB service', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-ksqldb-service');
      expect(node).toBeDefined();
      expect(node!.specs!['Data Abstractions']).toContain('Streams');
      expect(node!.specs!['Data Abstractions']).toContain('Tables');
    });

    it('should have Cluster Linking service', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-cluster-linking-service');
      expect(node).toBeDefined();
      expect(node!.specs!['Consumer Offset Sync']).toBe('Supported');
      expect(node!.specs!['Hybrid Support']).toContain('On-premises');
    });

    it('should have Stream Governance service', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-stream-governance-service');
      expect(node).toBeDefined();
      expect(node!.specs!['Stream Lineage']).toBeTruthy();
      expect(node!.specs!['Stream Catalog']).toBeTruthy();
      expect(node!.specs!['Stream Quality']).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Stream Sharing deep-dive
  // -------------------------------------------------------------------------
  describe('Stream Sharing products', () => {
    it('should have Stream Sharing service', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-stream-sharing-service');
      expect(node).toBeDefined();
      expect(node!.specs!['Throughput Limit']).toContain('10 MB/s');
      expect(node!.specs!['Sharing Method']).toContain('Email');
    });

    it('should have Tableflow service', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-tableflow-service');
      expect(node).toBeDefined();
      expect(node!.specs!['Output Formats']).toContain('Iceberg');
      expect(node!.specs!['Output Formats']).toContain('Delta Lake');
    });

    it('should have Tableflow with catalog integrations', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-tableflow-service');
      expect(node!.specs!['Catalog Integrations']).toContain('AWS Glue');
      expect(node!.specs!['Catalog Integrations']).toContain('Databricks Unity Catalog');
      expect(node!.specs!['Catalog Integrations']).toContain('Snowflake Open Catalog');
    });
  });

  // -------------------------------------------------------------------------
  // Search functionality
  // -------------------------------------------------------------------------
  describe('search', () => {
    it('should find Confluent products by English name', () => {
      const results = searchNodes(confluentCatalog.products, 'Confluent');
      expect(results.length).toBeGreaterThan(5);
    });

    it('should find products by Korean name (클러스터)', () => {
      const results = searchNodes(confluentCatalog.products, '클러스터');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find Kafka-related products', () => {
      const results = searchNodes(confluentCatalog.products, 'Kafka');
      expect(results.length).toBeGreaterThanOrEqual(3);
    });

    it('should find Flink products', () => {
      const results = searchNodes(confluentCatalog.products, 'Flink');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find Schema Registry products', () => {
      const results = searchNodes(confluentCatalog.products, 'Schema Registry');
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('should find node by exact nodeId', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-cloud-dedicated');
      expect(node).toBeDefined();
      expect(node!.name).toBe('Dedicated Cluster');
    });
  });

  // -------------------------------------------------------------------------
  // Leaf node counts
  // -------------------------------------------------------------------------
  describe('leaf node counts', () => {
    it('should match countLeafNodes helper', () => {
      const count = countLeafNodes(confluentCatalog.products);
      const leaves = getLeafNodes(confluentCatalog.products);
      expect(count).toBe(leaves.length);
    });

    it('should have all leaf nodes at depth 2', () => {
      const leaves = getLeafNodes(confluentCatalog.products);
      for (const leaf of leaves) {
        expect(leaf.depth).toBe(2);
      }
    });

    it('should have 14 leaf nodes', () => {
      const leaves = getLeafNodes(confluentCatalog.products);
      expect(leaves).toHaveLength(14);
    });
  });

  // -------------------------------------------------------------------------
  // Depth distribution
  // -------------------------------------------------------------------------
  describe('depth distribution', () => {
    it('should have 4 nodes at depth 0', () => {
      const nodes = getNodesByDepth(confluentCatalog.products, 0);
      expect(nodes).toHaveLength(4);
    });

    it('should have 11 nodes at depth 1', () => {
      const nodes = getNodesByDepth(confluentCatalog.products, 1);
      expect(nodes).toHaveLength(11);
    });

    it('should have 14 nodes at depth 2', () => {
      const nodes = getNodesByDepth(confluentCatalog.products, 2);
      expect(nodes).toHaveLength(14);
    });
  });

  // -------------------------------------------------------------------------
  // Data quality validation
  // -------------------------------------------------------------------------
  describe('data quality validation', () => {
    describe('architecture planning fields', () => {
      it('should have architectureRole and architectureRoleKo pair completeness', () => {
        const allNodes = getAllNodes(confluentCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.architectureRole && !n.architectureRoleKo) ||
            (!n.architectureRole && n.architectureRoleKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor and recommendedForKo pair completeness', () => {
        const allNodes = getAllNodes(confluentCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.recommendedFor && !n.recommendedForKo) ||
            (!n.recommendedFor && n.recommendedForKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor with matching length in recommendedForKo', () => {
        const allNodes = getAllNodes(confluentCatalog.products);
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
        const allNodes = getAllNodes(confluentCatalog.products);
        for (const node of allNodes) {
          if (node.lifecycle) {
            expect(validValues.has(node.lifecycle)).toBe(true);
          }
        }
      });

      it('should have lifecycle set on all leaf nodes', () => {
        const leaves = getLeafNodes(confluentCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.lifecycle).toBeDefined();
        }
      });
    });

    describe('licensing and form factor', () => {
      it('should have licensingModel on all leaf nodes', () => {
        const leaves = getLeafNodes(confluentCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.licensingModel).toBeDefined();
        }
      });

      it('should have formFactor on all leaf nodes', () => {
        const leaves = getLeafNodes(confluentCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.formFactor).toBeDefined();
        }
      });

      it('should have all cloud products with cloud form factor', () => {
        const cloudLeaves = [
          'confluent-cloud-basic', 'confluent-cloud-standard',
          'confluent-cloud-enterprise', 'confluent-cloud-dedicated',
          'confluent-cloud-flink', 'confluent-cloud-connectors-managed',
        ];
        for (const id of cloudLeaves) {
          const node = findNodeById(confluentCatalog.products, id);
          expect(node!.formFactor).toBe('cloud');
        }
      });

      it('should have all products with subscription licensing', () => {
        const leaves = getLeafNodes(confluentCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.licensingModel).toBe('subscription');
        }
      });
    });

    describe('specs completeness', () => {
      it('should have specs on all leaf nodes', () => {
        const leaves = getLeafNodes(confluentCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.specs).toBeDefined();
          expect(Object.keys(leaf.specs!).length).toBeGreaterThanOrEqual(5);
        }
      });
    });

    describe('coverage statistics', () => {
      it('should report infraNodeTypes coverage on all depth 0 and 1 nodes', () => {
        const allNodes = getAllNodes(confluentCatalog.products);
        const depth01 = allNodes.filter((n) => n.depth <= 1);
        const depth01WithTypes = depth01.filter(
          (n) => n.infraNodeTypes && n.infraNodeTypes.length > 0,
        );
        expect(depth01WithTypes.length).toBe(depth01.length);
      });

      it('should report architectureRole coverage on all depth 1 nodes', () => {
        const allNodes = getAllNodes(confluentCatalog.products);
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
    it('should have Cloud Connectors with 200+ connector count', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-cloud-connectors-managed');
      expect(node).toBeDefined();
      expect(node!.specs!['Connector Count']).toContain('200+');
      expect(node!.specs!['Connector Types']).toContain('Source');
      expect(node!.specs!['Connector Types']).toContain('Sink');
    });

    it('should have Platform with KRaft support', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-platform-edition');
      expect(node!.specs!['Consensus Mode']).toContain('KRaft');
    });

    it('should have Platform with tiered storage', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-platform-edition');
      expect(node!.specs!['Tiered Storage']).toContain('Supported');
    });

    it('should have ksqlDB with stream and table abstractions', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-ksqldb-service');
      expect(node!.specs!['JOIN Support']).toContain('Stream-Stream');
      expect(node!.specs!['JOIN Support']).toContain('Stream-Table');
      expect(node!.specs!['Windowing']).toContain('Tumbling');
    });

    it('should have Tableflow with CDC and BYOS', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-tableflow-service');
      expect(node!.specs!['CDC Materialization']).toBe('Supported');
      expect(node!.specs!['Storage Options']).toContain('Bring Your Own Storage');
    });

    it('should have Cluster Linking with hybrid support', () => {
      const node = findNodeById(confluentCatalog.products, 'confluent-cluster-linking-service');
      expect(node!.specs!['Hybrid Support']).toContain('On-premises to Confluent Cloud');
    });
  });
});
