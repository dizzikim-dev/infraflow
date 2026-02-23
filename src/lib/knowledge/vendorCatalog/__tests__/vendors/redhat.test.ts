import { describe, it, expect } from 'vitest';
import { redhatCatalog } from '../../vendors/redhat';
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
// Red Hat Catalog -- Data Integrity Tests
// ---------------------------------------------------------------------------

describe('Red Hat vendor catalog', () => {
  // -------------------------------------------------------------------------
  // Top-level catalog metadata
  // -------------------------------------------------------------------------
  describe('catalog metadata', () => {
    it('should have correct vendor identity', () => {
      expect(redhatCatalog.vendorId).toBe('red-hat');
      expect(redhatCatalog.vendorName).toBe('Red Hat');
      expect(redhatCatalog.vendorNameKo).toBe('레드햇');
      expect(redhatCatalog.headquarters).toBe('Raleigh, NC, USA');
    });

    it('should have valid URLs', () => {
      expect(redhatCatalog.website).toBe('https://www.redhat.com');
      expect(redhatCatalog.productPageUrl).toMatch(/^https:\/\//);
      expect(redhatCatalog.crawlSource).toMatch(/^https:\/\//);
    });

    it('should have bilingual depth structure', () => {
      expect(redhatCatalog.depthStructure).toEqual(['category', 'product-line', 'edition']);
      expect(redhatCatalog.depthStructureKo).toEqual(['카테고리', '제품 라인', '에디션']);
      expect(redhatCatalog.depthStructure).toHaveLength(redhatCatalog.depthStructureKo.length);
    });

    it('should have crawl metadata', () => {
      expect(redhatCatalog.lastCrawled).toBe('2026-02-22');
      expect(redhatCatalog.crawlSource).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Stats validation
  // -------------------------------------------------------------------------
  describe('catalog stats', () => {
    it('should have accurate totalProducts count', () => {
      const allNodes = getAllNodes(redhatCatalog.products);
      expect(redhatCatalog.stats.totalProducts).toBe(allNodes.length);
    });

    it('should have accurate maxDepth', () => {
      const actualMax = getMaxDepth(redhatCatalog.products);
      expect(redhatCatalog.stats.maxDepth).toBe(actualMax);
    });

    it('should have accurate categoriesCount', () => {
      expect(redhatCatalog.stats.categoriesCount).toBe(redhatCatalog.products.length);
    });

    it('should match computeStats output', () => {
      const computed = computeStats(redhatCatalog.products);
      expect(redhatCatalog.stats.totalProducts).toBe(computed.totalProducts);
      expect(redhatCatalog.stats.maxDepth).toBe(computed.maxDepth);
      expect(redhatCatalog.stats.categoriesCount).toBe(computed.categoriesCount);
    });

    it('should have 32 total nodes', () => {
      expect(redhatCatalog.stats.totalProducts).toBe(32);
    });

    it('should have maxDepth of 2', () => {
      expect(redhatCatalog.stats.maxDepth).toBe(2);
    });

    it('should have 5 top-level categories', () => {
      expect(redhatCatalog.stats.categoriesCount).toBe(5);
    });
  });

  // -------------------------------------------------------------------------
  // Product tree structure
  // -------------------------------------------------------------------------
  describe('product tree structure', () => {
    it('should have 5 root categories', () => {
      expect(redhatCatalog.products).toHaveLength(5);
      const names = redhatCatalog.products.map((p) => p.name);
      expect(names).toEqual([
        'Linux Platform',
        'Cloud & Container Platform',
        'Automation',
        'Storage',
        'Cloud Services',
      ]);
    });

    it('should have all root nodes at depth 0', () => {
      for (const product of redhatCatalog.products) {
        expect(product.depth).toBe(0);
      }
    });

    it('should have Linux Platform with 1 product line', () => {
      const lp = redhatCatalog.products.find((p) => p.nodeId === 'redhat-linux-platform');
      expect(lp).toBeDefined();
      expect(lp!.children).toHaveLength(1);
    });

    it('should have Cloud & Container Platform with 3 product lines', () => {
      const cc = redhatCatalog.products.find((p) => p.nodeId === 'redhat-cloud-container');
      expect(cc).toBeDefined();
      expect(cc!.children).toHaveLength(3);
    });

    it('should have Automation with 2 product lines', () => {
      const auto = redhatCatalog.products.find((p) => p.nodeId === 'redhat-automation');
      expect(auto).toBeDefined();
      expect(auto!.children).toHaveLength(2);
    });

    it('should have Storage with 2 product lines', () => {
      const stor = redhatCatalog.products.find((p) => p.nodeId === 'redhat-storage');
      expect(stor).toBeDefined();
      expect(stor!.children).toHaveLength(2);
    });

    it('should have Cloud Services with 2 product lines', () => {
      const cs = redhatCatalog.products.find((p) => p.nodeId === 'redhat-cloud-services');
      expect(cs).toBeDefined();
      expect(cs!.children).toHaveLength(2);
    });
  });

  // -------------------------------------------------------------------------
  // Node ID uniqueness
  // -------------------------------------------------------------------------
  describe('node ID uniqueness', () => {
    it('should have globally unique nodeIds', () => {
      const allNodes = getAllNodes(redhatCatalog.products);
      const ids = allNodes.map((n) => n.nodeId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all nodeIds prefixed with redhat-', () => {
      const allNodes = getAllNodes(redhatCatalog.products);
      for (const node of allNodes) {
        expect(node.nodeId).toMatch(/^redhat-/);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Bilingual completeness
  // -------------------------------------------------------------------------
  describe('bilingual completeness', () => {
    it('should have non-empty name and nameKo for all nodes', () => {
      const allNodes = getAllNodes(redhatCatalog.products);
      for (const node of allNodes) {
        expect(node.name.length).toBeGreaterThan(0);
        expect(node.nameKo.length).toBeGreaterThan(0);
      }
    });

    it('should have non-empty description and descriptionKo for all nodes', () => {
      const allNodes = getAllNodes(redhatCatalog.products);
      for (const node of allNodes) {
        expect(node.description.length).toBeGreaterThan(0);
        expect(node.descriptionKo.length).toBeGreaterThan(0);
      }
    });

    it('should have depthLabel and depthLabelKo for all nodes', () => {
      const allNodes = getAllNodes(redhatCatalog.products);
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
      const allNodes = getAllNodes(redhatCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).toMatch(/^https:\/\//);
      }
    });

    it('should not have any relative URLs', () => {
      const allNodes = getAllNodes(redhatCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).not.toMatch(/^\/[^/]/);
      }
    });

    it('should use English URLs (not Korean URLs)', () => {
      const allNodes = getAllNodes(redhatCatalog.products);
      const koreanUrls = allNodes.filter((n) => n.sourceUrl.includes('ko_kr') || n.sourceUrl.includes('/kr/ko/'));
      expect(koreanUrls.map((n) => n.nodeId)).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // Depth consistency
  // -------------------------------------------------------------------------
  describe('depth consistency', () => {
    it('should have children with depth exactly parent.depth + 1', () => {
      const allNodes = getAllNodes(redhatCatalog.products);
      for (const node of allNodes) {
        for (const child of node.children) {
          expect(child.depth).toBe(node.depth + 1);
        }
      }
    });

    it('should have leaf nodes with empty children arrays', () => {
      const leaves = getLeafNodes(redhatCatalog.products);
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
      const allNodes = getAllNodes(redhatCatalog.products);
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

      const allNodes = getAllNodes(redhatCatalog.products);
      for (const node of allNodes) {
        if (node.infraNodeTypes) {
          for (const type of node.infraNodeTypes) {
            expect(validTypes.has(type)).toBe(true);
          }
        }
      }
    });

    it('should have infraNodeTypes on all depth 0 and depth 1 nodes', () => {
      const allNodes = getAllNodes(redhatCatalog.products);
      const depth01 = allNodes.filter((n) => n.depth <= 1);
      const withoutTypes = depth01.filter(
        (n) => !n.infraNodeTypes || n.infraNodeTypes.length === 0,
      );
      expect(withoutTypes.map((n) => n.nodeId)).toEqual([]);
    });

    it('should map Linux Platform to server/VM types', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-linux-platform');
      expect(node!.infraNodeTypes).toContain('web-server');
      expect(node!.infraNodeTypes).toContain('app-server');
      expect(node!.infraNodeTypes).toContain('vm');
    });

    it('should map Cloud & Container Platform to kubernetes and container types', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-cloud-container');
      expect(node!.infraNodeTypes).toContain('kubernetes');
      expect(node!.infraNodeTypes).toContain('container');
    });

    it('should map Storage to storage and object-storage types', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-storage');
      expect(node!.infraNodeTypes).toContain('storage');
      expect(node!.infraNodeTypes).toContain('object-storage');
    });

    it('should map OpenShift Container Platform to kubernetes type', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-openshift-container-platform');
      expect(node!.infraNodeTypes).toContain('kubernetes');
      expect(node!.infraNodeTypes).toContain('container');
    });
  });

  // -------------------------------------------------------------------------
  // Red Hat Enterprise Linux deep-dive
  // -------------------------------------------------------------------------
  describe('Red Hat Enterprise Linux suite', () => {
    it('should have 4 editions (Standard, SAP, Edge, AI)', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-enterprise-linux');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(4);
      const names = node!.children.map((c) => c.name);
      expect(names).toContain('Red Hat Enterprise Linux Standard');
      expect(names).toContain('Red Hat Enterprise Linux for SAP Solutions');
      expect(names).toContain('Red Hat Enterprise Linux for Edge');
      expect(names).toContain('Red Hat Enterprise Linux AI');
    });

    it('should have architectureRole on the RHEL product line', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-enterprise-linux');
      expect(node!.architectureRole).toBeTruthy();
      expect(node!.architectureRoleKo).toBeTruthy();
    });

    it('should have at least 5 recommendedFor entries', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-enterprise-linux');
      expect(node!.recommendedFor!.length).toBeGreaterThanOrEqual(5);
      expect(node!.recommendedForKo!.length).toBeGreaterThanOrEqual(5);
    });
  });

  // -------------------------------------------------------------------------
  // OpenShift Container Platform deep-dive
  // -------------------------------------------------------------------------
  describe('OpenShift Container Platform', () => {
    it('should have 3 editions', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-openshift-container-platform');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
    });

    it('should have Self-Managed, Dedicated, and ROSA editions', () => {
      const editions = [
        'redhat-ocp-self-managed',
        'redhat-openshift-dedicated',
        'redhat-rosa',
      ];
      for (const id of editions) {
        const node = findNodeById(redhatCatalog.products, id);
        expect(node).toBeDefined();
        expect(node!.depth).toBe(2);
      }
    });

    it('should have ROSA with AWS-native integration', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-rosa');
      expect(node!.name).toContain('ROSA');
      expect(node!.specs!['Cloud Provider']).toContain('AWS');
    });

    it('should have OpenShift Dedicated with 99.95% SLA', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-openshift-dedicated');
      expect(node!.specs!['SLA']).toContain('99.95%');
    });
  });

  // -------------------------------------------------------------------------
  // Cloud & Container products deep-dive
  // -------------------------------------------------------------------------
  describe('Cloud & Container products', () => {
    it('should have OpenShift Virtualization product', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-openshift-virtualization');
      expect(node).toBeDefined();
      expect(node!.name).toBe('OpenShift Virtualization');
      expect(node!.architectureRole).toContain('VM-on-Kubernetes');
    });

    it('should have OpenShift AI product', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-openshift-ai');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('MLOps');
    });

    it('should have OpenShift AI edition with GPU scheduling', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-openshift-ai-edition');
      expect(node).toBeDefined();
      expect(node!.specs!['GPU Scheduling']).toContain('NVIDIA');
    });

    it('should have OpenShift Virtualization edition with KubeVirt', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-openshift-virt-edition');
      expect(node).toBeDefined();
      expect(node!.specs!['Hypervisor']).toContain('KubeVirt');
    });
  });

  // -------------------------------------------------------------------------
  // Automation deep-dive
  // -------------------------------------------------------------------------
  describe('Automation products', () => {
    it('should have Ansible Automation Platform', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-ansible-automation-platform');
      expect(node).toBeDefined();
      expect(node!.name).toBe('Ansible Automation Platform');
      expect(node!.architectureRole).toContain('IT Automation');
    });

    it('should have Red Hat Satellite', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-satellite');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('System Lifecycle');
    });

    it('should have Ansible Lightspeed with AI capabilities', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-ansible-lightspeed');
      expect(node).toBeDefined();
      expect(node!.name).toContain('Lightspeed');
      expect(node!.specs!['AI Model']).toContain('watsonx');
    });
  });

  // -------------------------------------------------------------------------
  // Storage deep-dive
  // -------------------------------------------------------------------------
  describe('Storage products', () => {
    it('should have OpenShift Data Foundation', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-openshift-data-foundation');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Kubernetes Persistent Storage');
    });

    it('should have Red Hat Ceph Storage', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-ceph-storage');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Software-Defined Storage');
    });

    it('should have ODF edition with Ceph backend', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-odf-edition');
      expect(node).toBeDefined();
      expect(node!.specs!['Storage Backend']).toContain('Ceph');
      expect(node!.formFactor).toBe('container');
    });

    it('should have Ceph Storage edition with exabyte scale', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-ceph-storage-edition');
      expect(node).toBeDefined();
      expect(node!.specs!['Max Scale']).toContain('Exabyte');
    });
  });

  // -------------------------------------------------------------------------
  // Cloud Services deep-dive
  // -------------------------------------------------------------------------
  describe('Cloud Services products', () => {
    it('should have Red Hat OpenShift on IBM Cloud', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-openshift-ibm-cloud');
      expect(node).toBeDefined();
      expect(node!.specs!['Cloud Provider']).toContain('IBM Cloud');
      expect(node!.formFactor).toBe('cloud');
    });

    it('should have Red Hat Developer Hub', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-developer-hub');
      expect(node).toBeDefined();
      expect(node!.specs!['Base Framework']).toContain('Backstage.io');
      expect(node!.formFactor).toBe('container');
    });

    it('should have Advanced Cluster Management', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-acm');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Multi-Cluster');
    });

    it('should have ACM edition with 2,000+ cluster scale', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-acm-edition');
      expect(node).toBeDefined();
      expect(node!.specs!['Scale']).toContain('2,000+');
    });
  });

  // -------------------------------------------------------------------------
  // Search functionality
  // -------------------------------------------------------------------------
  describe('search', () => {
    it('should find OpenShift products by English name', () => {
      const results = searchNodes(redhatCatalog.products, 'OpenShift');
      expect(results.length).toBeGreaterThan(10);
    });

    it('should find products by Korean name (리눅스)', () => {
      const results = searchNodes(redhatCatalog.products, '리눅스');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find Red Hat products', () => {
      const results = searchNodes(redhatCatalog.products, 'Red Hat');
      expect(results.length).toBeGreaterThanOrEqual(10);
    });

    it('should find Ansible products by keyword', () => {
      const results = searchNodes(redhatCatalog.products, 'Ansible');
      expect(results.length).toBeGreaterThanOrEqual(3);
    });

    it('should find storage products by keyword', () => {
      const results = searchNodes(redhatCatalog.products, 'storage');
      expect(results.length).toBeGreaterThanOrEqual(3);
    });

    it('should find node by exact nodeId', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-rhel-ai');
      expect(node).toBeDefined();
      expect(node!.name).toBe('Red Hat Enterprise Linux AI');
    });
  });

  // -------------------------------------------------------------------------
  // Leaf node counts
  // -------------------------------------------------------------------------
  describe('leaf node counts', () => {
    it('should match countLeafNodes helper', () => {
      const count = countLeafNodes(redhatCatalog.products);
      const leaves = getLeafNodes(redhatCatalog.products);
      expect(count).toBe(leaves.length);
    });

    it('should have all leaf nodes at depth 2', () => {
      const leaves = getLeafNodes(redhatCatalog.products);
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
      const nodes = getNodesByDepth(redhatCatalog.products, 0);
      expect(nodes).toHaveLength(5);
    });

    it('should have 10 nodes at depth 1', () => {
      const nodes = getNodesByDepth(redhatCatalog.products, 1);
      expect(nodes).toHaveLength(10);
    });

    it('should have 17 nodes at depth 2', () => {
      const nodes = getNodesByDepth(redhatCatalog.products, 2);
      expect(nodes).toHaveLength(17);
    });
  });

  // -------------------------------------------------------------------------
  // Data quality validation
  // -------------------------------------------------------------------------
  describe('data quality validation', () => {
    describe('architecture planning fields', () => {
      it('should have architectureRole and architectureRoleKo pair completeness', () => {
        const allNodes = getAllNodes(redhatCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.architectureRole && !n.architectureRoleKo) ||
            (!n.architectureRole && n.architectureRoleKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor and recommendedForKo pair completeness', () => {
        const allNodes = getAllNodes(redhatCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.recommendedFor && !n.recommendedForKo) ||
            (!n.recommendedFor && n.recommendedForKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor with matching length in recommendedForKo', () => {
        const allNodes = getAllNodes(redhatCatalog.products);
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
        const allNodes = getAllNodes(redhatCatalog.products);
        for (const node of allNodes) {
          if (node.lifecycle) {
            expect(validValues.has(node.lifecycle)).toBe(true);
          }
        }
      });

      it('should have lifecycle set on all leaf nodes', () => {
        const leaves = getLeafNodes(redhatCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.lifecycle).toBeDefined();
        }
      });
    });

    describe('licensing and form factor', () => {
      it('should have licensingModel on all leaf nodes', () => {
        const leaves = getLeafNodes(redhatCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.licensingModel).toBeDefined();
        }
      });

      it('should have formFactor on all leaf nodes', () => {
        const leaves = getLeafNodes(redhatCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.formFactor).toBeDefined();
        }
      });
    });

    describe('specs completeness', () => {
      it('should have specs on all leaf nodes', () => {
        const leaves = getLeafNodes(redhatCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.specs).toBeDefined();
          expect(Object.keys(leaf.specs!).length).toBeGreaterThanOrEqual(5);
        }
      });
    });

    describe('coverage statistics', () => {
      it('should report infraNodeTypes coverage on all depth 0 and 1 nodes', () => {
        const allNodes = getAllNodes(redhatCatalog.products);
        const depth01 = allNodes.filter((n) => n.depth <= 1);
        const depth01WithTypes = depth01.filter(
          (n) => n.infraNodeTypes && n.infraNodeTypes.length > 0,
        );
        expect(depth01WithTypes.length).toBe(depth01.length);
      });

      it('should report architectureRole coverage on all depth 1 nodes', () => {
        const allNodes = getAllNodes(redhatCatalog.products);
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
    it('should have RHEL Standard with 10-year lifecycle support', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-rhel-standard');
      expect(node).toBeDefined();
      expect(node!.specs!['Lifecycle Support']).toContain('10 years');
      expect(node!.specs!['Security Framework']).toContain('SELinux');
    });

    it('should have RHEL for SAP with HANA certification', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-rhel-sap');
      expect(node).toBeDefined();
      expect(node!.specs!['SAP Certification']).toContain('SAP HANA');
      expect(node!.specs!['Max Memory']).toContain('24 TB');
    });

    it('should have RHEL for Edge with image-based update model', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-rhel-edge');
      expect(node).toBeDefined();
      expect(node!.specs!['Update Model']).toContain('rpm-ostree');
      expect(node!.specs!['Min Resources']).toContain('2 GB');
    });

    it('should have RHEL AI with GPU support and InstructLab', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-rhel-ai');
      expect(node).toBeDefined();
      expect(node!.specs!['GPU Support']).toContain('NVIDIA');
      expect(node!.specs!['AI Toolkit']).toContain('InstructLab');
    });

    it('should have OCP Self-Managed with 2,000 node scale', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-ocp-self-managed');
      expect(node).toBeDefined();
      expect(node!.specs!['Max Nodes']).toContain('2,000');
      expect(node!.specs!['Max Pods']).toContain('150,000');
    });

    it('should have ROSA with AWS PrivateLink integration', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-rosa');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('cloud');
      expect(node!.licensingModel).toBe('subscription');
      expect(node!.specs!['AWS Integration']).toContain('PrivateLink');
    });

    it('should have Ansible Platform with Event-Driven Ansible', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-ansible-platform');
      expect(node).toBeDefined();
      expect(node!.specs!['Core Components']).toContain('Event-Driven Ansible');
      expect(node!.specs!['Execution Model']).toContain('Podman');
    });

    it('should have Satellite with 100,000 host scale', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-satellite-edition');
      expect(node).toBeDefined();
      expect(node!.specs!['Scale']).toContain('100,000');
      expect(node!.specs!['Compliance']).toContain('OpenSCAP');
    });

    it('should have OpenShift on IBM Cloud with 99.99% SLA', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-openshift-ibm-cloud');
      expect(node).toBeDefined();
      expect(node!.specs!['SLA']).toContain('99.99%');
      expect(node!.specs!['Compliance']).toContain('SOC 2');
    });

    it('should have Developer Hub based on Backstage.io', () => {
      const node = findNodeById(redhatCatalog.products, 'redhat-developer-hub');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('container');
      expect(node!.licensingModel).toBe('subscription');
    });
  });
});
