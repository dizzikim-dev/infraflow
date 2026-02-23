import { describe, it, expect } from 'vitest';
import { datadogCatalog } from '../../vendors/datadog';
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
// Datadog Catalog -- Data Integrity Tests
// ---------------------------------------------------------------------------

describe('Datadog vendor catalog', () => {
  // -------------------------------------------------------------------------
  // Top-level catalog metadata
  // -------------------------------------------------------------------------
  describe('catalog metadata', () => {
    it('should have correct vendor identity', () => {
      expect(datadogCatalog.vendorId).toBe('datadog');
      expect(datadogCatalog.vendorName).toBe('Datadog');
      expect(datadogCatalog.vendorNameKo).toBe('데이터독');
      expect(datadogCatalog.headquarters).toBe('New York, NY, USA');
    });

    it('should have valid URLs', () => {
      expect(datadogCatalog.website).toBe('https://www.datadoghq.com');
      expect(datadogCatalog.productPageUrl).toMatch(/^https:\/\//);
      expect(datadogCatalog.crawlSource).toMatch(/^https:\/\//);
    });

    it('should have bilingual depth structure', () => {
      expect(datadogCatalog.depthStructure).toEqual(['category', 'product-line', 'module']);
      expect(datadogCatalog.depthStructureKo).toEqual(['카테고리', '제품 라인', '모듈']);
      expect(datadogCatalog.depthStructure).toHaveLength(datadogCatalog.depthStructureKo.length);
    });

    it('should have crawl metadata', () => {
      expect(datadogCatalog.lastCrawled).toBe('2026-02-22');
      expect(datadogCatalog.crawlSource).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Stats validation
  // -------------------------------------------------------------------------
  describe('catalog stats', () => {
    it('should have accurate totalProducts count', () => {
      const allNodes = getAllNodes(datadogCatalog.products);
      expect(datadogCatalog.stats.totalProducts).toBe(allNodes.length);
    });

    it('should have accurate maxDepth', () => {
      const actualMax = getMaxDepth(datadogCatalog.products);
      expect(datadogCatalog.stats.maxDepth).toBe(actualMax);
    });

    it('should have accurate categoriesCount', () => {
      expect(datadogCatalog.stats.categoriesCount).toBe(datadogCatalog.products.length);
    });

    it('should match computeStats output', () => {
      const computed = computeStats(datadogCatalog.products);
      expect(datadogCatalog.stats.totalProducts).toBe(computed.totalProducts);
      expect(datadogCatalog.stats.maxDepth).toBe(computed.maxDepth);
      expect(datadogCatalog.stats.categoriesCount).toBe(computed.categoriesCount);
    });

    it('should have 41 total nodes', () => {
      expect(datadogCatalog.stats.totalProducts).toBe(41);
    });

    it('should have maxDepth of 2', () => {
      expect(datadogCatalog.stats.maxDepth).toBe(2);
    });

    it('should have 5 top-level categories', () => {
      expect(datadogCatalog.stats.categoriesCount).toBe(5);
    });
  });

  // -------------------------------------------------------------------------
  // Product tree structure
  // -------------------------------------------------------------------------
  describe('product tree structure', () => {
    it('should have 5 root categories', () => {
      expect(datadogCatalog.products).toHaveLength(5);
      const names = datadogCatalog.products.map((p) => p.name);
      expect(names).toEqual([
        'Infrastructure Monitoring',
        'Application Performance',
        'Log Management',
        'Cloud Security',
        'Developer Experience',
      ]);
    });

    it('should have all root nodes at depth 0', () => {
      for (const product of datadogCatalog.products) {
        expect(product.depth).toBe(0);
      }
    });

    it('should have Infrastructure Monitoring with 4 product lines', () => {
      const im = datadogCatalog.products.find((p) => p.nodeId === 'datadog-infrastructure-monitoring');
      expect(im).toBeDefined();
      expect(im!.children).toHaveLength(4);
    });

    it('should have Application Performance with 5 product lines', () => {
      const ap = datadogCatalog.products.find((p) => p.nodeId === 'datadog-application-performance');
      expect(ap).toBeDefined();
      expect(ap!.children).toHaveLength(5);
    });

    it('should have Log Management with 3 product lines', () => {
      const lm = datadogCatalog.products.find((p) => p.nodeId === 'datadog-log-management');
      expect(lm).toBeDefined();
      expect(lm!.children).toHaveLength(3);
    });

    it('should have Cloud Security with 3 product lines', () => {
      const cs = datadogCatalog.products.find((p) => p.nodeId === 'datadog-cloud-security');
      expect(cs).toBeDefined();
      expect(cs!.children).toHaveLength(3);
    });

    it('should have Developer Experience with 3 product lines', () => {
      const de = datadogCatalog.products.find((p) => p.nodeId === 'datadog-developer-experience');
      expect(de).toBeDefined();
      expect(de!.children).toHaveLength(3);
    });
  });

  // -------------------------------------------------------------------------
  // Node ID uniqueness
  // -------------------------------------------------------------------------
  describe('node ID uniqueness', () => {
    it('should have globally unique nodeIds', () => {
      const allNodes = getAllNodes(datadogCatalog.products);
      const ids = allNodes.map((n) => n.nodeId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all nodeIds prefixed with datadog-', () => {
      const allNodes = getAllNodes(datadogCatalog.products);
      for (const node of allNodes) {
        expect(node.nodeId).toMatch(/^datadog-/);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Bilingual completeness
  // -------------------------------------------------------------------------
  describe('bilingual completeness', () => {
    it('should have non-empty name and nameKo for all nodes', () => {
      const allNodes = getAllNodes(datadogCatalog.products);
      for (const node of allNodes) {
        expect(node.name.length).toBeGreaterThan(0);
        expect(node.nameKo.length).toBeGreaterThan(0);
      }
    });

    it('should have non-empty description and descriptionKo for all nodes', () => {
      const allNodes = getAllNodes(datadogCatalog.products);
      for (const node of allNodes) {
        expect(node.description.length).toBeGreaterThan(0);
        expect(node.descriptionKo.length).toBeGreaterThan(0);
      }
    });

    it('should have depthLabel and depthLabelKo for all nodes', () => {
      const allNodes = getAllNodes(datadogCatalog.products);
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
      const allNodes = getAllNodes(datadogCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).toMatch(/^https:\/\//);
      }
    });

    it('should not have any relative URLs', () => {
      const allNodes = getAllNodes(datadogCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).not.toMatch(/^\/[^/]/);
      }
    });

    it('should use English URLs (not Korean URLs)', () => {
      const allNodes = getAllNodes(datadogCatalog.products);
      const koreanUrls = allNodes.filter((n) => n.sourceUrl.includes('ko_kr') || n.sourceUrl.includes('/kr/ko/'));
      expect(koreanUrls.map((n) => n.nodeId)).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // Depth consistency
  // -------------------------------------------------------------------------
  describe('depth consistency', () => {
    it('should have children with depth exactly parent.depth + 1', () => {
      const allNodes = getAllNodes(datadogCatalog.products);
      for (const node of allNodes) {
        for (const child of node.children) {
          expect(child.depth).toBe(node.depth + 1);
        }
      }
    });

    it('should have leaf nodes with empty children arrays', () => {
      const leaves = getLeafNodes(datadogCatalog.products);
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
      const allNodes = getAllNodes(datadogCatalog.products);
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

      const allNodes = getAllNodes(datadogCatalog.products);
      for (const node of allNodes) {
        if (node.infraNodeTypes) {
          for (const type of node.infraNodeTypes) {
            expect(validTypes.has(type)).toBe(true);
          }
        }
      }
    });

    it('should have infraNodeTypes on all depth 0 and depth 1 nodes', () => {
      const allNodes = getAllNodes(datadogCatalog.products);
      const depth01 = allNodes.filter((n) => n.depth <= 1);
      const withoutTypes = depth01.filter(
        (n) => !n.infraNodeTypes || n.infraNodeTypes.length === 0,
      );
      expect(withoutTypes.map((n) => n.nodeId)).toEqual([]);
    });

    it('should map Infrastructure Monitoring to prometheus type', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-infrastructure-monitoring');
      expect(node!.infraNodeTypes).toContain('prometheus');
    });

    it('should map Container Monitoring to kubernetes and container types', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-container-monitoring');
      expect(node!.infraNodeTypes).toContain('kubernetes');
      expect(node!.infraNodeTypes).toContain('container');
    });

    it('should map Cloud SIEM to siem type', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-cloud-siem');
      expect(node!.infraNodeTypes).toContain('siem');
    });

    it('should map ASM to waf type', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-asm');
      expect(node!.infraNodeTypes).toContain('waf');
    });

    it('should map Database Monitoring to db-server type', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-database-monitoring');
      expect(node!.infraNodeTypes).toContain('db-server');
    });

    it('should map Log Management to elasticsearch type', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-log-management');
      expect(node!.infraNodeTypes).toContain('elasticsearch');
    });
  });

  // -------------------------------------------------------------------------
  // Infrastructure Monitoring deep-dive
  // -------------------------------------------------------------------------
  describe('Infrastructure Monitoring category', () => {
    it('should have 4 product lines', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-infrastructure-monitoring');
      expect(node!.children).toHaveLength(4);
      const names = node!.children.map((c) => c.name);
      expect(names).toContain('Infrastructure Monitoring');
      expect(names).toContain('Container Monitoring');
      expect(names).toContain('Network Performance Monitoring');
      expect(names).toContain('Database Monitoring');
    });

    it('should have architectureRole on all product lines', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-infrastructure-monitoring');
      for (const child of node!.children) {
        expect(child.architectureRole).toBeTruthy();
        expect(child.architectureRoleKo).toBeTruthy();
      }
    });

    it('should have at least 3 recommendedFor entries on product lines', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-infrastructure-monitoring');
      for (const child of node!.children) {
        expect(child.recommendedFor!.length).toBeGreaterThanOrEqual(3);
        expect(child.recommendedForKo!.length).toBeGreaterThanOrEqual(3);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Application Performance deep-dive
  // -------------------------------------------------------------------------
  describe('Application Performance category', () => {
    it('should have APM product with distributed tracing', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-apm-module');
      expect(node).toBeDefined();
      expect(node!.specs!['Tracing']).toContain('distributed');
    });

    it('should have Synthetics with multi-protocol API testing', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-synthetics-module');
      expect(node).toBeDefined();
      expect(node!.supportedProtocols).toContain('HTTP/HTTPS');
      expect(node!.supportedProtocols).toContain('gRPC');
      expect(node!.supportedProtocols).toContain('WebSocket');
    });

    it('should have RUM with session replay', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-rum-module');
      expect(node).toBeDefined();
      expect(node!.specs!['Session Replay']).toContain('Pixel-perfect');
    });

    it('should have USM with eBPF technology', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-usm-module');
      expect(node).toBeDefined();
      expect(node!.specs!['Technology']).toContain('eBPF');
    });

    it('should have Continuous Profiler with multi-language support', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-continuous-profiler-module');
      expect(node).toBeDefined();
      expect(node!.specs!['Languages']).toContain('Java');
      expect(node!.specs!['Languages']).toContain('Python');
      expect(node!.specs!['Languages']).toContain('Go');
    });
  });

  // -------------------------------------------------------------------------
  // Log Management deep-dive
  // -------------------------------------------------------------------------
  describe('Log Management category', () => {
    it('should have Log Management with petabyte-scale', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-logs-module');
      expect(node).toBeDefined();
      expect(node!.specs!['Scale']).toContain('petabyte');
    });

    it('should have Cloud SIEM with 800+ detection rules', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-cloud-siem-module');
      expect(node).toBeDefined();
      expect(node!.specs!['Detection Rules']).toContain('800+');
    });

    it('should have Observability Pipelines with Rust engine', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-observability-pipelines-module');
      expect(node).toBeDefined();
      expect(node!.specs!['Engine']).toContain('Rust');
    });
  });

  // -------------------------------------------------------------------------
  // Cloud Security deep-dive
  // -------------------------------------------------------------------------
  describe('Cloud Security category', () => {
    it('should have CSM with 1,000+ detection rules', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-csm-module');
      expect(node).toBeDefined();
      expect(node!.specs!['Detection Rules']).toContain('1,000+');
    });

    it('should have ASM with OWASP API Top 10 protection', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-asm-module');
      expect(node).toBeDefined();
      expect(node!.specs!['Protection']).toContain('OWASP');
    });

    it('should have CWS with eBPF runtime detection', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-cws-module');
      expect(node).toBeDefined();
      expect(node!.specs!['Runtime Detection']).toContain('eBPF');
    });

    it('should have securityCapabilities on all Cloud Security product lines', () => {
      const cs = findNodeById(datadogCatalog.products, 'datadog-cloud-security');
      for (const child of cs!.children) {
        expect(child.securityCapabilities).toBeDefined();
        expect(child.securityCapabilities!.length).toBeGreaterThan(0);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Developer Experience deep-dive
  // -------------------------------------------------------------------------
  describe('Developer Experience category', () => {
    it('should have CI Visibility with pipeline metrics', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-ci-visibility-module');
      expect(node).toBeDefined();
      expect(node!.specs!['Pipeline Metrics']).toContain('Execution time');
    });

    it('should have Software Delivery with DORA metrics', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-software-delivery-module');
      expect(node).toBeDefined();
      expect(node!.specs!['DORA Metrics']).toContain('Deployment frequency');
    });

    it('should have Workflow Automation with 1,750+ actions', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-workflow-automation-module');
      expect(node).toBeDefined();
      expect(node!.specs!['Actions']).toContain('1,750+');
    });
  });

  // -------------------------------------------------------------------------
  // Search functionality
  // -------------------------------------------------------------------------
  describe('search', () => {
    it('should find Datadog products by English name', () => {
      const results = searchNodes(datadogCatalog.products, 'Datadog');
      expect(results.length).toBeGreaterThan(10);
    });

    it('should find products by Korean name (모니터링)', () => {
      const results = searchNodes(datadogCatalog.products, '모니터링');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find SIEM products', () => {
      const results = searchNodes(datadogCatalog.products, 'SIEM');
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('should find APM products by keyword', () => {
      const results = searchNodes(datadogCatalog.products, 'APM');
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('should find node by exact nodeId', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-apm-module');
      expect(node).toBeDefined();
      expect(node!.name).toBe('Datadog APM');
    });
  });

  // -------------------------------------------------------------------------
  // Leaf node counts
  // -------------------------------------------------------------------------
  describe('leaf node counts', () => {
    it('should match countLeafNodes helper', () => {
      const count = countLeafNodes(datadogCatalog.products);
      const leaves = getLeafNodes(datadogCatalog.products);
      expect(count).toBe(leaves.length);
    });

    it('should have all leaf nodes at depth 2', () => {
      const leaves = getLeafNodes(datadogCatalog.products);
      for (const leaf of leaves) {
        expect(leaf.depth).toBe(2);
      }
    });

    it('should have 18 leaf nodes', () => {
      const leaves = getLeafNodes(datadogCatalog.products);
      expect(leaves).toHaveLength(18);
    });
  });

  // -------------------------------------------------------------------------
  // Depth distribution
  // -------------------------------------------------------------------------
  describe('depth distribution', () => {
    it('should have 5 nodes at depth 0', () => {
      const nodes = getNodesByDepth(datadogCatalog.products, 0);
      expect(nodes).toHaveLength(5);
    });

    it('should have 18 nodes at depth 1', () => {
      const nodes = getNodesByDepth(datadogCatalog.products, 1);
      expect(nodes).toHaveLength(18);
    });

    it('should have 18 nodes at depth 2', () => {
      const nodes = getNodesByDepth(datadogCatalog.products, 2);
      expect(nodes).toHaveLength(18);
    });
  });

  // -------------------------------------------------------------------------
  // Data quality validation
  // -------------------------------------------------------------------------
  describe('data quality validation', () => {
    describe('architecture planning fields', () => {
      it('should have architectureRole and architectureRoleKo pair completeness', () => {
        const allNodes = getAllNodes(datadogCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.architectureRole && !n.architectureRoleKo) ||
            (!n.architectureRole && n.architectureRoleKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor and recommendedForKo pair completeness', () => {
        const allNodes = getAllNodes(datadogCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.recommendedFor && !n.recommendedForKo) ||
            (!n.recommendedFor && n.recommendedForKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor with matching length in recommendedForKo', () => {
        const allNodes = getAllNodes(datadogCatalog.products);
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
        const allNodes = getAllNodes(datadogCatalog.products);
        for (const node of allNodes) {
          if (node.lifecycle) {
            expect(validValues.has(node.lifecycle)).toBe(true);
          }
        }
      });

      it('should have lifecycle set on all leaf nodes', () => {
        const leaves = getLeafNodes(datadogCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.lifecycle).toBeDefined();
        }
      });
    });

    describe('licensing and form factor', () => {
      it('should have licensingModel on all leaf nodes', () => {
        const leaves = getLeafNodes(datadogCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.licensingModel).toBeDefined();
        }
      });

      it('should have formFactor on all leaf nodes', () => {
        const leaves = getLeafNodes(datadogCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.formFactor).toBeDefined();
        }
      });

      it('should have all leaf nodes as cloud form factor', () => {
        const leaves = getLeafNodes(datadogCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.formFactor).toBe('cloud');
        }
      });

      it('should have all leaf nodes as subscription licensing', () => {
        const leaves = getLeafNodes(datadogCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.licensingModel).toBe('subscription');
        }
      });
    });

    describe('specs completeness', () => {
      it('should have specs on all leaf nodes', () => {
        const leaves = getLeafNodes(datadogCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.specs).toBeDefined();
          expect(Object.keys(leaf.specs!).length).toBeGreaterThanOrEqual(5);
        }
      });
    });

    describe('coverage statistics', () => {
      it('should report infraNodeTypes coverage on all depth 0 and 1 nodes', () => {
        const allNodes = getAllNodes(datadogCatalog.products);
        const depth01 = allNodes.filter((n) => n.depth <= 1);
        const depth01WithTypes = depth01.filter(
          (n) => n.infraNodeTypes && n.infraNodeTypes.length > 0,
        );
        expect(depth01WithTypes.length).toBe(depth01.length);
      });

      it('should report architectureRole coverage on all depth 1 nodes', () => {
        const allNodes = getAllNodes(datadogCatalog.products);
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
    it('should have Infrastructure Monitoring with 900+ integrations', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-infra-monitoring-module');
      expect(node).toBeDefined();
      expect(node!.specs!['Integrations']).toContain('900+');
    });

    it('should have NPM with NetFlow and SNMP support', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-npm-module');
      expect(node).toBeDefined();
      expect(node!.specs!['Flow Protocols']).toContain('NetFlow');
      expect(node!.specs!['Data Collection']).toContain('SNMP');
    });

    it('should have Cloud SIEM with MITRE ATT&CK mapping', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-cloud-siem-module');
      expect(node).toBeDefined();
      expect(node!.specs!['MITRE ATT&CK']).toContain('Interactive');
    });

    it('should have Observability Pipelines with PII detection', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-observability-pipelines-module');
      expect(node).toBeDefined();
      expect(node!.specs!['Data Governance']).toContain('PII');
    });

    it('should have Workflow Automation with AI generation', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-workflow-automation-module');
      expect(node).toBeDefined();
      expect(node!.specs!['AI Generation']).toContain('Natural language');
    });

    it('should have Database Monitoring with PostgreSQL support', () => {
      const node = findNodeById(datadogCatalog.products, 'datadog-database-monitoring-module');
      expect(node).toBeDefined();
      expect(node!.specs!['Supported Databases']).toContain('PostgreSQL');
    });
  });
});
