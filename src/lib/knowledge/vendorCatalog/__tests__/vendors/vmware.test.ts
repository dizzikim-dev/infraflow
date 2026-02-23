import { describe, it, expect } from 'vitest';
import { vmwareCatalog } from '../../vendors/vmware';
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
// VMware by Broadcom Catalog -- Data Integrity Tests
// ---------------------------------------------------------------------------

describe('VMware vendor catalog', () => {
  // -------------------------------------------------------------------------
  // Top-level catalog metadata
  // -------------------------------------------------------------------------
  describe('catalog metadata', () => {
    it('should have correct vendor identity', () => {
      expect(vmwareCatalog.vendorId).toBe('vmware');
      expect(vmwareCatalog.vendorName).toBe('VMware by Broadcom');
      expect(vmwareCatalog.vendorNameKo).toBe('VMware (브로드컴)');
      expect(vmwareCatalog.headquarters).toBe('Palo Alto, CA, USA');
    });

    it('should have valid URLs', () => {
      expect(vmwareCatalog.website).toBe('https://www.vmware.com');
      expect(vmwareCatalog.productPageUrl).toMatch(/^https:\/\//);
      expect(vmwareCatalog.crawlSource).toMatch(/^https:\/\//);
    });

    it('should have bilingual depth structure', () => {
      expect(vmwareCatalog.depthStructure).toEqual(['category', 'product-line', 'edition']);
      expect(vmwareCatalog.depthStructureKo).toEqual(['카테고리', '제품 라인', '에디션']);
      expect(vmwareCatalog.depthStructure).toHaveLength(vmwareCatalog.depthStructureKo.length);
    });

    it('should have crawl metadata', () => {
      expect(vmwareCatalog.lastCrawled).toBe('2026-02-22');
      expect(vmwareCatalog.crawlSource).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Stats validation
  // -------------------------------------------------------------------------
  describe('catalog stats', () => {
    it('should have accurate totalProducts count', () => {
      const allNodes = getAllNodes(vmwareCatalog.products);
      expect(vmwareCatalog.stats.totalProducts).toBe(allNodes.length);
    });

    it('should have accurate maxDepth', () => {
      const actualMax = getMaxDepth(vmwareCatalog.products);
      expect(vmwareCatalog.stats.maxDepth).toBe(actualMax);
    });

    it('should have accurate categoriesCount', () => {
      expect(vmwareCatalog.stats.categoriesCount).toBe(vmwareCatalog.products.length);
    });

    it('should match computeStats output', () => {
      const computed = computeStats(vmwareCatalog.products);
      expect(vmwareCatalog.stats.totalProducts).toBe(computed.totalProducts);
      expect(vmwareCatalog.stats.maxDepth).toBe(computed.maxDepth);
      expect(vmwareCatalog.stats.categoriesCount).toBe(computed.categoriesCount);
    });

    it('should have 41 total nodes', () => {
      expect(vmwareCatalog.stats.totalProducts).toBe(41);
    });

    it('should have maxDepth of 2', () => {
      expect(vmwareCatalog.stats.maxDepth).toBe(2);
    });

    it('should have 6 top-level categories', () => {
      expect(vmwareCatalog.stats.categoriesCount).toBe(6);
    });
  });

  // -------------------------------------------------------------------------
  // Product tree structure
  // -------------------------------------------------------------------------
  describe('product tree structure', () => {
    it('should have 6 root categories', () => {
      expect(vmwareCatalog.products).toHaveLength(6);
      const names = vmwareCatalog.products.map((p) => p.name);
      expect(names).toEqual([
        'Cloud Infrastructure',
        'Networking & Security',
        'App Platform',
        'Management & Automation',
        'End-User Computing',
        'Security',
      ]);
    });

    it('should have all root nodes at depth 0', () => {
      for (const product of vmwareCatalog.products) {
        expect(product.depth).toBe(0);
      }
    });

    it('should have Cloud Infrastructure with 3 product lines', () => {
      const ci = vmwareCatalog.products.find((p) => p.nodeId === 'vmware-cloud-infrastructure');
      expect(ci).toBeDefined();
      expect(ci!.children).toHaveLength(3);
    });

    it('should have Networking & Security with 2 product lines', () => {
      const ns = vmwareCatalog.products.find((p) => p.nodeId === 'vmware-networking-security');
      expect(ns).toBeDefined();
      expect(ns!.children).toHaveLength(2);
    });

    it('should have App Platform with 1 product line', () => {
      const ap = vmwareCatalog.products.find((p) => p.nodeId === 'vmware-app-platform');
      expect(ap).toBeDefined();
      expect(ap!.children).toHaveLength(1);
    });

    it('should have Management & Automation with 3 product lines', () => {
      const ma = vmwareCatalog.products.find((p) => p.nodeId === 'vmware-management-automation');
      expect(ma).toBeDefined();
      expect(ma!.children).toHaveLength(3);
    });

    it('should have End-User Computing with 2 product lines', () => {
      const euc = vmwareCatalog.products.find((p) => p.nodeId === 'vmware-end-user-computing');
      expect(euc).toBeDefined();
      expect(euc!.children).toHaveLength(2);
    });

    it('should have Security with 1 product line', () => {
      const sec = vmwareCatalog.products.find((p) => p.nodeId === 'vmware-security');
      expect(sec).toBeDefined();
      expect(sec!.children).toHaveLength(1);
    });
  });

  // -------------------------------------------------------------------------
  // Node ID uniqueness
  // -------------------------------------------------------------------------
  describe('node ID uniqueness', () => {
    it('should have globally unique nodeIds', () => {
      const allNodes = getAllNodes(vmwareCatalog.products);
      const ids = allNodes.map((n) => n.nodeId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all nodeIds prefixed with vmware-', () => {
      const allNodes = getAllNodes(vmwareCatalog.products);
      for (const node of allNodes) {
        expect(node.nodeId).toMatch(/^vmware-/);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Bilingual completeness
  // -------------------------------------------------------------------------
  describe('bilingual completeness', () => {
    it('should have non-empty name and nameKo for all nodes', () => {
      const allNodes = getAllNodes(vmwareCatalog.products);
      for (const node of allNodes) {
        expect(node.name.length).toBeGreaterThan(0);
        expect(node.nameKo.length).toBeGreaterThan(0);
      }
    });

    it('should have non-empty description and descriptionKo for all nodes', () => {
      const allNodes = getAllNodes(vmwareCatalog.products);
      for (const node of allNodes) {
        expect(node.description.length).toBeGreaterThan(0);
        expect(node.descriptionKo.length).toBeGreaterThan(0);
      }
    });

    it('should have depthLabel and depthLabelKo for all nodes', () => {
      const allNodes = getAllNodes(vmwareCatalog.products);
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
      const allNodes = getAllNodes(vmwareCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).toMatch(/^https:\/\//);
      }
    });

    it('should not have any relative URLs', () => {
      const allNodes = getAllNodes(vmwareCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).not.toMatch(/^\/[^/]/);
      }
    });

    it('should use English URLs (not Korean URLs)', () => {
      const allNodes = getAllNodes(vmwareCatalog.products);
      const koreanUrls = allNodes.filter((n) => n.sourceUrl.includes('ko_kr') || n.sourceUrl.includes('/kr/ko/'));
      expect(koreanUrls.map((n) => n.nodeId)).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // Depth consistency
  // -------------------------------------------------------------------------
  describe('depth consistency', () => {
    it('should have children with depth exactly parent.depth + 1', () => {
      const allNodes = getAllNodes(vmwareCatalog.products);
      for (const node of allNodes) {
        for (const child of node.children) {
          expect(child.depth).toBe(node.depth + 1);
        }
      }
    });

    it('should have leaf nodes with empty children arrays', () => {
      const leaves = getLeafNodes(vmwareCatalog.products);
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
      const allNodes = getAllNodes(vmwareCatalog.products);
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

      const allNodes = getAllNodes(vmwareCatalog.products);
      for (const node of allNodes) {
        if (node.infraNodeTypes) {
          for (const type of node.infraNodeTypes) {
            expect(validTypes.has(type)).toBe(true);
          }
        }
      }
    });

    it('should have infraNodeTypes on all depth 0 and depth 1 nodes', () => {
      const allNodes = getAllNodes(vmwareCatalog.products);
      const depth01 = allNodes.filter((n) => n.depth <= 1);
      const withoutTypes = depth01.filter(
        (n) => !n.infraNodeTypes || n.infraNodeTypes.length === 0,
      );
      expect(withoutTypes.map((n) => n.nodeId)).toEqual([]);
    });

    it('should map Cloud Infrastructure to vm and private-cloud types', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-cloud-infrastructure');
      expect(node!.infraNodeTypes).toContain('vm');
      expect(node!.infraNodeTypes).toContain('private-cloud');
    });

    it('should map Networking & Security to switch-l3 and firewall types', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-networking-security');
      expect(node!.infraNodeTypes).toContain('switch-l3');
      expect(node!.infraNodeTypes).toContain('firewall');
    });

    it('should map App Platform to kubernetes and container types', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-app-platform');
      expect(node!.infraNodeTypes).toContain('kubernetes');
      expect(node!.infraNodeTypes).toContain('container');
    });

    it('should map Carbon Black to firewall and ids-ips types', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-carbon-black');
      expect(node!.infraNodeTypes).toContain('firewall');
      expect(node!.infraNodeTypes).toContain('ids-ips');
    });
  });

  // -------------------------------------------------------------------------
  // VMware Cloud Foundation deep-dive
  // -------------------------------------------------------------------------
  describe('VMware Cloud Foundation suite', () => {
    it('should have 2 editions (Standard, Advanced)', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-vcf');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(2);
      const names = node!.children.map((c) => c.name);
      expect(names).toContain('VCF Standard');
      expect(names).toContain('VCF Advanced');
    });

    it('should have architectureRole on the VCF node', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-vcf');
      expect(node!.architectureRole).toBeTruthy();
      expect(node!.architectureRoleKo).toBeTruthy();
    });

    it('should have at least 5 recommendedFor entries', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-vcf');
      expect(node!.recommendedFor!.length).toBeGreaterThanOrEqual(5);
      expect(node!.recommendedForKo!.length).toBeGreaterThanOrEqual(5);
    });
  });

  // -------------------------------------------------------------------------
  // vSphere deep-dive
  // -------------------------------------------------------------------------
  describe('VMware vSphere', () => {
    it('should have 3 editions', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-vsphere');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
    });

    it('should have Standard, Foundation, Enterprise Plus editions', () => {
      const editions = [
        'vmware-vsphere-standard',
        'vmware-vsphere-foundation',
        'vmware-vsphere-enterprise-plus',
      ];
      for (const id of editions) {
        const node = findNodeById(vmwareCatalog.products, id);
        expect(node).toBeDefined();
        expect(node!.depth).toBe(2);
      }
    });

    it('should have Enterprise Plus with DRS and Fault Tolerance', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-vsphere-enterprise-plus');
      expect(node!.specs!['DRS']).toContain('Distributed Resource Scheduler');
      expect(node!.specs!['Fault Tolerance']).toContain('Zero downtime');
    });

    it('should have Standard without DRS', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-vsphere-standard');
      expect(node!.specs!['DRS']).toBe('Not included');
    });
  });

  // -------------------------------------------------------------------------
  // NSX deep-dive
  // -------------------------------------------------------------------------
  describe('VMware NSX products', () => {
    it('should have NSX with 3 editions', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-nsx');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
    });

    it('should have NSX Networking for virtual switching', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-nsx-networking');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('switch-l3');
    });

    it('should have NSX Distributed Firewall for microsegmentation', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-nsx-dfw');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('firewall');
      expect(node!.specs!['Firewall Type']).toContain('Distributed');
    });

    it('should have NSX Advanced Load Balancer (Avi)', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-nsx-alb');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('load-balancer');
      expect(node!.specs!['WAF']).toContain('OWASP');
    });

    it('should have NSX+ as cloud-delivered service', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-nsx-plus');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Multi-Cloud');
    });
  });

  // -------------------------------------------------------------------------
  // Tanzu deep-dive
  // -------------------------------------------------------------------------
  describe('VMware Tanzu products', () => {
    it('should have Tanzu Platform with Kubernetes management', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-tanzu-platform');
      expect(node).toBeDefined();
      expect(node!.specs!['Kubernetes Distributions']).toContain('EKS');
      expect(node!.specs!['Kubernetes Distributions']).toContain('AKS');
      expect(node!.specs!['Kubernetes Distributions']).toContain('GKE');
    });

    it('should have Tanzu Application Service (Cloud Foundry PaaS)', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-tanzu-application-service');
      expect(node).toBeDefined();
      expect(node!.specs!['Platform']).toContain('Cloud Foundry');
    });

    it('should have Tanzu Spring Runtime for enterprise Java', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-tanzu-spring-runtime');
      expect(node).toBeDefined();
      expect(node!.specs!['Frameworks']).toContain('Spring Boot');
    });
  });

  // -------------------------------------------------------------------------
  // Aria suite deep-dive
  // -------------------------------------------------------------------------
  describe('Aria suite products', () => {
    it('should have Aria Operations for monitoring', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-aria-operations');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Monitoring');
    });

    it('should have Aria Operations for Logs', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-aria-operations-logs');
      expect(node).toBeDefined();
      expect(node!.specs!['Ingestion Rate']).toContain('125,000');
    });

    it('should have Aria Automation for IaC', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-aria-automation');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Automation');
    });

    it('should have Aria Guard for ransomware recovery', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-aria-guard');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Ransomware');
    });
  });

  // -------------------------------------------------------------------------
  // End-User Computing deep-dive
  // -------------------------------------------------------------------------
  describe('End-User Computing products', () => {
    it('should have Workspace ONE for endpoint management', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-workspace-one');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Digital Workspace');
    });

    it('should have Workspace ONE UEM with multi-platform support', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-workspace-one-uem');
      expect(node).toBeDefined();
      expect(node!.specs!['Supported Platforms']).toContain('iOS');
      expect(node!.specs!['Supported Platforms']).toContain('Android');
      expect(node!.specs!['Supported Platforms']).toContain('Windows');
    });

    it('should have Workspace ONE Access with SSO protocols', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-workspace-one-access');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('sso');
      expect(node!.specs!['SSO']).toContain('SAML 2.0');
    });

    it('should have Horizon for VDI', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-horizon');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('VDI');
    });

    it('should have Horizon 8 with Blast Extreme protocol', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-horizon-8');
      expect(node).toBeDefined();
      expect(node!.specs!['Display Protocol']).toContain('Blast Extreme');
    });
  });

  // -------------------------------------------------------------------------
  // Carbon Black deep-dive
  // -------------------------------------------------------------------------
  describe('Carbon Black products', () => {
    it('should have Carbon Black Cloud Endpoint with EDR', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-carbon-black-endpoint');
      expect(node).toBeDefined();
      expect(node!.specs!['Protection']).toContain('EDR');
    });

    it('should have Carbon Black Cloud Workload for server protection', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-carbon-black-workload');
      expect(node).toBeDefined();
      expect(node!.specs!['Protection Scope']).toContain('containers');
    });

    it('should have Carbon Black App Control for allowlisting', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-carbon-black-app-control');
      expect(node).toBeDefined();
      expect(node!.specs!['Core Function']).toContain('allowlisting');
      expect(node!.specs!['Compliance']).toContain('PCI-DSS');
    });
  });

  // -------------------------------------------------------------------------
  // Search functionality
  // -------------------------------------------------------------------------
  describe('search', () => {
    it('should find VMware products by English name', () => {
      const results = searchNodes(vmwareCatalog.products, 'VMware');
      expect(results.length).toBeGreaterThan(5);
    });

    it('should find products by Korean name (가상화)', () => {
      const results = searchNodes(vmwareCatalog.products, '가상화');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find NSX products', () => {
      const results = searchNodes(vmwareCatalog.products, 'NSX');
      expect(results.length).toBeGreaterThanOrEqual(4);
    });

    it('should find Tanzu products by keyword', () => {
      const results = searchNodes(vmwareCatalog.products, 'Tanzu');
      expect(results.length).toBeGreaterThanOrEqual(3);
    });

    it('should find node by exact nodeId', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-vsphere-enterprise-plus');
      expect(node).toBeDefined();
      expect(node!.name).toBe('vSphere Enterprise Plus');
    });
  });

  // -------------------------------------------------------------------------
  // Leaf node counts
  // -------------------------------------------------------------------------
  describe('leaf node counts', () => {
    it('should match countLeafNodes helper', () => {
      const count = countLeafNodes(vmwareCatalog.products);
      const leaves = getLeafNodes(vmwareCatalog.products);
      expect(count).toBe(leaves.length);
    });

    it('should have all leaf nodes at depth 2', () => {
      const leaves = getLeafNodes(vmwareCatalog.products);
      for (const leaf of leaves) {
        expect(leaf.depth).toBe(2);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Depth distribution
  // -------------------------------------------------------------------------
  describe('depth distribution', () => {
    it('should have 6 nodes at depth 0', () => {
      const nodes = getNodesByDepth(vmwareCatalog.products, 0);
      expect(nodes).toHaveLength(6);
    });

    it('should have 12 nodes at depth 1', () => {
      const nodes = getNodesByDepth(vmwareCatalog.products, 1);
      expect(nodes).toHaveLength(12);
    });

    it('should have 23 nodes at depth 2', () => {
      const nodes = getNodesByDepth(vmwareCatalog.products, 2);
      expect(nodes).toHaveLength(23);
    });
  });

  // -------------------------------------------------------------------------
  // Data quality validation
  // -------------------------------------------------------------------------
  describe('data quality validation', () => {
    describe('architecture planning fields', () => {
      it('should have architectureRole and architectureRoleKo pair completeness', () => {
        const allNodes = getAllNodes(vmwareCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.architectureRole && !n.architectureRoleKo) ||
            (!n.architectureRole && n.architectureRoleKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor and recommendedForKo pair completeness', () => {
        const allNodes = getAllNodes(vmwareCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.recommendedFor && !n.recommendedForKo) ||
            (!n.recommendedFor && n.recommendedForKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor with matching length in recommendedForKo', () => {
        const allNodes = getAllNodes(vmwareCatalog.products);
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
        const allNodes = getAllNodes(vmwareCatalog.products);
        for (const node of allNodes) {
          if (node.lifecycle) {
            expect(validValues.has(node.lifecycle)).toBe(true);
          }
        }
      });

      it('should have lifecycle set on all leaf nodes', () => {
        const leaves = getLeafNodes(vmwareCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.lifecycle).toBeDefined();
        }
      });
    });

    describe('licensing and form factor', () => {
      it('should have licensingModel on all leaf nodes', () => {
        const leaves = getLeafNodes(vmwareCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.licensingModel).toBeDefined();
        }
      });

      it('should have formFactor on all leaf nodes', () => {
        const leaves = getLeafNodes(vmwareCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.formFactor).toBeDefined();
        }
      });
    });

    describe('specs completeness', () => {
      it('should have specs on all leaf nodes', () => {
        const leaves = getLeafNodes(vmwareCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.specs).toBeDefined();
          expect(Object.keys(leaf.specs!).length).toBeGreaterThanOrEqual(5);
        }
      });
    });

    describe('coverage statistics', () => {
      it('should report infraNodeTypes coverage on all depth 0 and 1 nodes', () => {
        const allNodes = getAllNodes(vmwareCatalog.products);
        const depth01 = allNodes.filter((n) => n.depth <= 1);
        const depth01WithTypes = depth01.filter(
          (n) => n.infraNodeTypes && n.infraNodeTypes.length > 0,
        );
        expect(depth01WithTypes.length).toBe(depth01.length);
      });

      it('should report architectureRole coverage on all depth 1 nodes', () => {
        const allNodes = getAllNodes(vmwareCatalog.products);
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
    it('should have VCF Standard with included components', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-vcf-standard');
      expect(node).toBeDefined();
      expect(node!.specs!['Included Components']).toContain('vSphere');
      expect(node!.specs!['Included Components']).toContain('vSAN');
      expect(node!.specs!['Included Components']).toContain('NSX');
    });

    it('should have VCF Advanced with Aria suite', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-vcf-advanced');
      expect(node).toBeDefined();
      expect(node!.specs!['Included Components']).toContain('Aria');
    });

    it('should have vSAN with encryption and stretched cluster support', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-vsan-enterprise');
      expect(node).toBeDefined();
      expect(node!.specs!['Encryption']).toContain('AES-256');
      expect(node!.specs!['Stretched Cluster']).toContain('Supported');
    });

    it('should have NSX+ as SaaS delivery model', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-nsx-plus-edition');
      expect(node).toBeDefined();
      expect(node!.specs!['Delivery Model']).toContain('SaaS');
      expect(node!.formFactor).toBe('cloud');
    });

    it('should have Aria Automation with Terraform integration', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-aria-automation-edition');
      expect(node).toBeDefined();
      expect(node!.specs!['IaC Engine']).toContain('Terraform');
    });

    it('should have Carbon Black Endpoint as cloud form factor', () => {
      const node = findNodeById(vmwareCatalog.products, 'vmware-carbon-black-endpoint');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('cloud');
      expect(node!.licensingModel).toBe('subscription');
    });
  });
});
