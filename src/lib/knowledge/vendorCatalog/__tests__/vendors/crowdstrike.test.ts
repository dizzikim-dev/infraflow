import { describe, it, expect } from 'vitest';
import { crowdstrikeCatalog } from '../../vendors/crowdstrike';
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
// CrowdStrike Catalog -- Data Integrity Tests
// ---------------------------------------------------------------------------

describe('CrowdStrike vendor catalog', () => {
  // -------------------------------------------------------------------------
  // Top-level catalog metadata
  // -------------------------------------------------------------------------
  describe('catalog metadata', () => {
    it('should have correct vendor identity', () => {
      expect(crowdstrikeCatalog.vendorId).toBe('crowdstrike');
      expect(crowdstrikeCatalog.vendorName).toBe('CrowdStrike');
      expect(crowdstrikeCatalog.vendorNameKo).toBe('크라우드스트라이크');
      expect(crowdstrikeCatalog.headquarters).toBe('Austin, TX, USA');
    });

    it('should have valid URLs', () => {
      expect(crowdstrikeCatalog.website).toBe('https://www.crowdstrike.com');
      expect(crowdstrikeCatalog.productPageUrl).toMatch(/^https:\/\//);
      expect(crowdstrikeCatalog.crawlSource).toMatch(/^https:\/\//);
    });

    it('should have bilingual depth structure', () => {
      expect(crowdstrikeCatalog.depthStructure).toEqual(['category', 'product-line', 'module']);
      expect(crowdstrikeCatalog.depthStructureKo).toEqual(['카테고리', '제품 라인', '모듈']);
      expect(crowdstrikeCatalog.depthStructure).toHaveLength(crowdstrikeCatalog.depthStructureKo.length);
    });

    it('should have crawl metadata', () => {
      expect(crowdstrikeCatalog.lastCrawled).toBe('2026-02-22');
      expect(crowdstrikeCatalog.crawlSource).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Stats validation
  // -------------------------------------------------------------------------
  describe('catalog stats', () => {
    it('should have accurate totalProducts count', () => {
      const allNodes = getAllNodes(crowdstrikeCatalog.products);
      expect(crowdstrikeCatalog.stats.totalProducts).toBe(allNodes.length);
    });

    it('should have accurate maxDepth', () => {
      const actualMax = getMaxDepth(crowdstrikeCatalog.products);
      expect(crowdstrikeCatalog.stats.maxDepth).toBe(actualMax);
    });

    it('should have accurate categoriesCount', () => {
      expect(crowdstrikeCatalog.stats.categoriesCount).toBe(crowdstrikeCatalog.products.length);
    });

    it('should match computeStats output', () => {
      const computed = computeStats(crowdstrikeCatalog.products);
      expect(crowdstrikeCatalog.stats.totalProducts).toBe(computed.totalProducts);
      expect(crowdstrikeCatalog.stats.maxDepth).toBe(computed.maxDepth);
      expect(crowdstrikeCatalog.stats.categoriesCount).toBe(computed.categoriesCount);
    });

    it('should have 32 total nodes', () => {
      expect(crowdstrikeCatalog.stats.totalProducts).toBe(32);
    });

    it('should have maxDepth of 2', () => {
      expect(crowdstrikeCatalog.stats.maxDepth).toBe(2);
    });

    it('should have 5 top-level categories', () => {
      expect(crowdstrikeCatalog.stats.categoriesCount).toBe(5);
    });
  });

  // -------------------------------------------------------------------------
  // Product tree structure
  // -------------------------------------------------------------------------
  describe('product tree structure', () => {
    it('should have 5 root categories', () => {
      expect(crowdstrikeCatalog.products).toHaveLength(5);
      const names = crowdstrikeCatalog.products.map((p) => p.name);
      expect(names).toEqual([
        'Endpoint Security',
        'Cloud Security',
        'Identity Protection',
        'Security Operations',
        'Data Protection',
      ]);
    });

    it('should have all root nodes at depth 0', () => {
      for (const product of crowdstrikeCatalog.products) {
        expect(product.depth).toBe(0);
      }
    });

    it('should have Endpoint Security with 3 product lines', () => {
      const ep = crowdstrikeCatalog.products.find((p) => p.nodeId === 'crowdstrike-endpoint-security');
      expect(ep).toBeDefined();
      expect(ep!.children).toHaveLength(3);
    });

    it('should have Cloud Security with 2 product lines', () => {
      const cloud = crowdstrikeCatalog.products.find((p) => p.nodeId === 'crowdstrike-cloud-security');
      expect(cloud).toBeDefined();
      expect(cloud!.children).toHaveLength(2);
    });

    it('should have Identity Protection with 2 product lines', () => {
      const identity = crowdstrikeCatalog.products.find((p) => p.nodeId === 'crowdstrike-identity-protection');
      expect(identity).toBeDefined();
      expect(identity!.children).toHaveLength(2);
    });

    it('should have Security Operations with 4 product lines', () => {
      const secops = crowdstrikeCatalog.products.find((p) => p.nodeId === 'crowdstrike-security-operations');
      expect(secops).toBeDefined();
      expect(secops!.children).toHaveLength(4);
    });

    it('should have Data Protection with 1 product line', () => {
      const data = crowdstrikeCatalog.products.find((p) => p.nodeId === 'crowdstrike-data-protection');
      expect(data).toBeDefined();
      expect(data!.children).toHaveLength(1);
    });
  });

  // -------------------------------------------------------------------------
  // Node ID uniqueness
  // -------------------------------------------------------------------------
  describe('node ID uniqueness', () => {
    it('should have globally unique nodeIds', () => {
      const allNodes = getAllNodes(crowdstrikeCatalog.products);
      const ids = allNodes.map((n) => n.nodeId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all nodeIds prefixed with crowdstrike-', () => {
      const allNodes = getAllNodes(crowdstrikeCatalog.products);
      for (const node of allNodes) {
        expect(node.nodeId).toMatch(/^crowdstrike-/);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Bilingual completeness
  // -------------------------------------------------------------------------
  describe('bilingual completeness', () => {
    it('should have non-empty name and nameKo for all nodes', () => {
      const allNodes = getAllNodes(crowdstrikeCatalog.products);
      for (const node of allNodes) {
        expect(node.name.length).toBeGreaterThan(0);
        expect(node.nameKo.length).toBeGreaterThan(0);
      }
    });

    it('should have non-empty description and descriptionKo for all nodes', () => {
      const allNodes = getAllNodes(crowdstrikeCatalog.products);
      for (const node of allNodes) {
        expect(node.description.length).toBeGreaterThan(0);
        expect(node.descriptionKo.length).toBeGreaterThan(0);
      }
    });

    it('should have depthLabel and depthLabelKo for all nodes', () => {
      const allNodes = getAllNodes(crowdstrikeCatalog.products);
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
      const allNodes = getAllNodes(crowdstrikeCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).toMatch(/^https:\/\//);
      }
    });

    it('should not have any relative URLs', () => {
      const allNodes = getAllNodes(crowdstrikeCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).not.toMatch(/^\/[^/]/);
      }
    });

    it('should use English URLs (not Korean URLs)', () => {
      const allNodes = getAllNodes(crowdstrikeCatalog.products);
      const koreanUrls = allNodes.filter((n) => n.sourceUrl.includes('ko_kr') || n.sourceUrl.includes('/kr/ko/'));
      expect(koreanUrls.map((n) => n.nodeId)).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // Depth consistency
  // -------------------------------------------------------------------------
  describe('depth consistency', () => {
    it('should have children with depth exactly parent.depth + 1', () => {
      const allNodes = getAllNodes(crowdstrikeCatalog.products);
      for (const node of allNodes) {
        for (const child of node.children) {
          expect(child.depth).toBe(node.depth + 1);
        }
      }
    });

    it('should have leaf nodes with empty children arrays', () => {
      const leaves = getLeafNodes(crowdstrikeCatalog.products);
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
      const allNodes = getAllNodes(crowdstrikeCatalog.products);
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

      const allNodes = getAllNodes(crowdstrikeCatalog.products);
      for (const node of allNodes) {
        if (node.infraNodeTypes) {
          for (const type of node.infraNodeTypes) {
            expect(validTypes.has(type)).toBe(true);
          }
        }
      }
    });

    it('should have infraNodeTypes on all depth 0 and depth 1 nodes', () => {
      const allNodes = getAllNodes(crowdstrikeCatalog.products);
      const depth01 = allNodes.filter((n) => n.depth <= 1);
      const withoutTypes = depth01.filter(
        (n) => !n.infraNodeTypes || n.infraNodeTypes.length === 0,
      );
      expect(withoutTypes.map((n) => n.nodeId)).toEqual([]);
    });

    it('should map Endpoint Security to firewall type', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-endpoint-security');
      expect(node!.infraNodeTypes).toContain('firewall');
    });

    it('should map Cloud Security to kubernetes and container types', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-cloud-security');
      expect(node!.infraNodeTypes).toContain('kubernetes');
      expect(node!.infraNodeTypes).toContain('container');
    });

    it('should map Identity Protection to iam and ldap-ad types', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-identity-protection');
      expect(node!.infraNodeTypes).toContain('iam');
      expect(node!.infraNodeTypes).toContain('ldap-ad');
    });

    it('should map Security Operations to siem and soar types', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-security-operations');
      expect(node!.infraNodeTypes).toContain('siem');
      expect(node!.infraNodeTypes).toContain('soar');
    });

    it('should map Data Protection to dlp type', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-data-protection');
      expect(node!.infraNodeTypes).toContain('dlp');
    });
  });

  // -------------------------------------------------------------------------
  // Endpoint Security deep-dive
  // -------------------------------------------------------------------------
  describe('Endpoint Security products', () => {
    it('should have Falcon Prevent with NGAV module', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-falcon-prevent');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(1);
      expect(node!.architectureRole).toContain('NGAV');
    });

    it('should have Falcon Insight XDR', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-falcon-insight-xdr');
      expect(node).toBeDefined();
      expect(node!.depth).toBe(2);
      expect(node!.architectureRole).toContain('XDR');
    });

    it('should have Falcon Device Control', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-falcon-device-control-module');
      expect(node).toBeDefined();
      expect(node!.depth).toBe(2);
      expect(node!.infraNodeTypes).toContain('dlp');
    });
  });

  // -------------------------------------------------------------------------
  // Cloud Security deep-dive
  // -------------------------------------------------------------------------
  describe('Cloud Security products', () => {
    it('should have Falcon Cloud Security CNAPP', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-falcon-cloud-security-cnapp');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('CNAPP');
    });

    it('should have Falcon Container Security', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-falcon-container-security');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('kubernetes');
      expect(node!.infraNodeTypes).toContain('container');
    });

    it('should have Falcon Horizon CSPM', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-falcon-horizon-cspm');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('CSPM');
    });
  });

  // -------------------------------------------------------------------------
  // Identity Protection deep-dive
  // -------------------------------------------------------------------------
  describe('Identity Protection products', () => {
    it('should have Falcon Identity Threat Detection', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-falcon-itd-module');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Active Directory');
    });

    it('should have Falcon Identity Threat Protection with MFA', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-falcon-itp-module');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('mfa');
    });
  });

  // -------------------------------------------------------------------------
  // Security Operations deep-dive
  // -------------------------------------------------------------------------
  describe('Security Operations products', () => {
    it('should have Falcon LogScale with petabyte-scale specs', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-falcon-logscale');
      expect(node).toBeDefined();
      expect(node!.specs!['Search Speed']).toContain('150x');
      expect(node!.specs!['Scale']).toContain('Petabyte');
    });

    it('should have Falcon Next-Gen SIEM module', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-falcon-next-gen-siem-module');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('siem');
      expect(node!.infraNodeTypes).toContain('soar');
    });

    it('should have Falcon OverWatch managed hunting', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-falcon-overwatch-module');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Managed');
    });

    it('should have Falcon Complete MDR with breach warranty', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-falcon-complete-mdr');
      expect(node).toBeDefined();
      expect(node!.specs!['Warranty']).toContain('Breach prevention');
    });

    it('should have Falcon Spotlight vulnerability management', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-falcon-spotlight');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Vulnerability');
    });

    it('should have Falcon Surface EASM', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-falcon-surface');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('EASM');
    });
  });

  // -------------------------------------------------------------------------
  // Data Protection deep-dive
  // -------------------------------------------------------------------------
  describe('Data Protection products', () => {
    it('should have Falcon Data Protection DLP module', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-falcon-data-protection-module');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('dlp');
      expect(node!.lifecycle).toBe('active');
    });

    it('should have GenAI data protection in specs', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-falcon-data-protection-module');
      expect(node!.specs!['Channels']).toContain('GenAI');
    });
  });

  // -------------------------------------------------------------------------
  // Search functionality
  // -------------------------------------------------------------------------
  describe('search', () => {
    it('should find CrowdStrike products by English name', () => {
      const results = searchNodes(crowdstrikeCatalog.products, 'Falcon');
      expect(results.length).toBeGreaterThan(10);
    });

    it('should find products by Korean name', () => {
      const results = searchNodes(crowdstrikeCatalog.products, '보안');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find SIEM products', () => {
      const results = searchNodes(crowdstrikeCatalog.products, 'SIEM');
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('should find XDR products', () => {
      const results = searchNodes(crowdstrikeCatalog.products, 'XDR');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find node by exact nodeId', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-falcon-logscale');
      expect(node).toBeDefined();
      expect(node!.name).toBe('Falcon LogScale');
    });
  });

  // -------------------------------------------------------------------------
  // Leaf node counts
  // -------------------------------------------------------------------------
  describe('leaf node counts', () => {
    it('should match countLeafNodes helper', () => {
      const count = countLeafNodes(crowdstrikeCatalog.products);
      const leaves = getLeafNodes(crowdstrikeCatalog.products);
      expect(count).toBe(leaves.length);
    });

    it('should have all leaf nodes at depth 2', () => {
      const leaves = getLeafNodes(crowdstrikeCatalog.products);
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
      const nodes = getNodesByDepth(crowdstrikeCatalog.products, 0);
      expect(nodes).toHaveLength(5);
    });

    it('should have 12 nodes at depth 1', () => {
      const nodes = getNodesByDepth(crowdstrikeCatalog.products, 1);
      expect(nodes).toHaveLength(12);
    });

    it('should have 15 nodes at depth 2', () => {
      const nodes = getNodesByDepth(crowdstrikeCatalog.products, 2);
      expect(nodes).toHaveLength(15);
    });
  });

  // -------------------------------------------------------------------------
  // Data quality validation
  // -------------------------------------------------------------------------
  describe('data quality validation', () => {
    describe('architecture planning fields', () => {
      it('should have architectureRole and architectureRoleKo pair completeness', () => {
        const allNodes = getAllNodes(crowdstrikeCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.architectureRole && !n.architectureRoleKo) ||
            (!n.architectureRole && n.architectureRoleKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor and recommendedForKo pair completeness', () => {
        const allNodes = getAllNodes(crowdstrikeCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.recommendedFor && !n.recommendedForKo) ||
            (!n.recommendedFor && n.recommendedForKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor with matching length in recommendedForKo', () => {
        const allNodes = getAllNodes(crowdstrikeCatalog.products);
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
        const allNodes = getAllNodes(crowdstrikeCatalog.products);
        for (const node of allNodes) {
          if (node.lifecycle) {
            expect(validValues.has(node.lifecycle)).toBe(true);
          }
        }
      });

      it('should have lifecycle set on all leaf nodes', () => {
        const leaves = getLeafNodes(crowdstrikeCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.lifecycle).toBeDefined();
        }
      });
    });

    describe('licensing and form factor', () => {
      it('should have licensingModel on all leaf nodes', () => {
        const leaves = getLeafNodes(crowdstrikeCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.licensingModel).toBeDefined();
        }
      });

      it('should have formFactor on all leaf nodes', () => {
        const leaves = getLeafNodes(crowdstrikeCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.formFactor).toBeDefined();
        }
      });

      it('should have all products as cloud form factor', () => {
        const leaves = getLeafNodes(crowdstrikeCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.formFactor).toBe('cloud');
        }
      });

      it('should have all products as subscription licensing', () => {
        const leaves = getLeafNodes(crowdstrikeCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.licensingModel).toBe('subscription');
        }
      });
    });

    describe('specs completeness', () => {
      it('should have specs on all leaf nodes', () => {
        const leaves = getLeafNodes(crowdstrikeCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.specs).toBeDefined();
          expect(Object.keys(leaf.specs!).length).toBeGreaterThanOrEqual(5);
        }
      });
    });

    describe('coverage statistics', () => {
      it('should report infraNodeTypes coverage on all depth 0 and 1 nodes', () => {
        const allNodes = getAllNodes(crowdstrikeCatalog.products);
        const depth01 = allNodes.filter((n) => n.depth <= 1);
        const depth01WithTypes = depth01.filter(
          (n) => n.infraNodeTypes && n.infraNodeTypes.length > 0,
        );
        expect(depth01WithTypes.length).toBe(depth01.length);
      });

      it('should report architectureRole coverage on all depth 1 nodes', () => {
        const allNodes = getAllNodes(crowdstrikeCatalog.products);
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
    it('should have Falcon Prevent with MITRE ATT&CK 100% detection', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-falcon-prevent-ngav');
      expect(node).toBeDefined();
      expect(node!.specs!['MITRE ATT&CK']).toContain('100%');
    });

    it('should have Falcon Insight XDR with third-party data integration', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-falcon-insight-xdr');
      expect(node).toBeDefined();
      expect(node!.specs!['Data Integration']).toContain('10 GB/day');
    });

    it('should have Falcon Cloud Security CNAPP with 90% auto resolution', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-falcon-cloud-security-cnapp');
      expect(node).toBeDefined();
      expect(node!.specs!['Alert Resolution']).toContain('90%');
    });

    it('should have Falcon Container Security with K8s support', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-falcon-container-security');
      expect(node).toBeDefined();
      expect(node!.specs!['Container Platforms']).toContain('EKS');
      expect(node!.specs!['Container Platforms']).toContain('OpenShift');
    });

    it('should have Falcon Complete MDR with 7-minute response time', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-falcon-complete-mdr');
      expect(node).toBeDefined();
      expect(node!.specs!['Response Time']).toContain('7-minute');
    });

    it('should have Falcon LogScale with 50% storage savings', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-falcon-logscale');
      expect(node).toBeDefined();
      expect(node!.specs!['Storage Savings']).toContain('50%');
    });

    it('should have Falcon Data Protection with GenAI channel support', () => {
      const node = findNodeById(crowdstrikeCatalog.products, 'crowdstrike-falcon-data-protection-module');
      expect(node).toBeDefined();
      expect(node!.specs!['Channels']).toContain('GenAI');
      expect(node!.specs!['Compliance']).toContain('GDPR');
    });
  });
});
