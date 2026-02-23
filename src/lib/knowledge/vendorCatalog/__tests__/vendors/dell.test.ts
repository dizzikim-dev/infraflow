import { describe, it, expect } from 'vitest';
import { dellCatalog } from '../../vendors/dell';
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
// Dell Technologies Catalog -- Data Integrity Tests
// ---------------------------------------------------------------------------

describe('Dell Technologies vendor catalog', () => {
  // -------------------------------------------------------------------------
  // Top-level catalog metadata
  // -------------------------------------------------------------------------
  describe('catalog metadata', () => {
    it('should have correct vendor identity', () => {
      expect(dellCatalog.vendorId).toBe('dell-technologies');
      expect(dellCatalog.vendorName).toBe('Dell Technologies');
      expect(dellCatalog.vendorNameKo).toBe('델 테크놀로지스');
      expect(dellCatalog.headquarters).toBe('Round Rock, TX, USA');
    });

    it('should have valid URLs', () => {
      expect(dellCatalog.website).toBe('https://www.dell.com');
      expect(dellCatalog.productPageUrl).toMatch(/^https:\/\//);
      expect(dellCatalog.crawlSource).toMatch(/^https:\/\//);
    });

    it('should have bilingual depth structure', () => {
      expect(dellCatalog.depthStructure).toEqual(['category', 'product-line', 'series']);
      expect(dellCatalog.depthStructureKo).toEqual(['카테고리', '제품 라인', '시리즈']);
      expect(dellCatalog.depthStructure).toHaveLength(dellCatalog.depthStructureKo.length);
    });

    it('should have crawl metadata', () => {
      expect(dellCatalog.lastCrawled).toBe('2026-02-22');
      expect(dellCatalog.crawlSource).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Stats validation
  // -------------------------------------------------------------------------
  describe('catalog stats', () => {
    it('should have accurate totalProducts count', () => {
      const allNodes = getAllNodes(dellCatalog.products);
      expect(dellCatalog.stats.totalProducts).toBe(allNodes.length);
    });

    it('should have accurate maxDepth', () => {
      const actualMax = getMaxDepth(dellCatalog.products);
      expect(dellCatalog.stats.maxDepth).toBe(actualMax);
    });

    it('should have accurate categoriesCount', () => {
      expect(dellCatalog.stats.categoriesCount).toBe(dellCatalog.products.length);
    });

    it('should match computeStats output', () => {
      const computed = computeStats(dellCatalog.products);
      expect(dellCatalog.stats.totalProducts).toBe(computed.totalProducts);
      expect(dellCatalog.stats.maxDepth).toBe(computed.maxDepth);
      expect(dellCatalog.stats.categoriesCount).toBe(computed.categoriesCount);
    });

    it('should have 52 total nodes', () => {
      expect(dellCatalog.stats.totalProducts).toBe(52);
    });

    it('should have maxDepth of 2', () => {
      expect(dellCatalog.stats.maxDepth).toBe(2);
    });

    it('should have 4 top-level categories', () => {
      expect(dellCatalog.stats.categoriesCount).toBe(4);
    });
  });

  // -------------------------------------------------------------------------
  // Product tree structure
  // -------------------------------------------------------------------------
  describe('product tree structure', () => {
    it('should have 4 root categories', () => {
      expect(dellCatalog.products).toHaveLength(4);
      const names = dellCatalog.products.map((p) => p.name);
      expect(names).toEqual([
        'Servers',
        'Storage',
        'Networking',
        'Data Protection',
      ]);
    });

    it('should have all root nodes at depth 0', () => {
      for (const product of dellCatalog.products) {
        expect(product.depth).toBe(0);
      }
    });

    it('should have Servers with 4 product lines', () => {
      const servers = dellCatalog.products.find((p) => p.nodeId === 'dell-servers');
      expect(servers).toBeDefined();
      expect(servers!.children).toHaveLength(4);
    });

    it('should have Storage with 5 product lines', () => {
      const storage = dellCatalog.products.find((p) => p.nodeId === 'dell-storage');
      expect(storage).toBeDefined();
      expect(storage!.children).toHaveLength(5);
    });

    it('should have Networking with 2 product lines', () => {
      const networking = dellCatalog.products.find((p) => p.nodeId === 'dell-networking');
      expect(networking).toBeDefined();
      expect(networking!.children).toHaveLength(2);
    });

    it('should have Data Protection with 2 product lines', () => {
      const dp = dellCatalog.products.find((p) => p.nodeId === 'dell-data-protection');
      expect(dp).toBeDefined();
      expect(dp!.children).toHaveLength(2);
    });
  });

  // -------------------------------------------------------------------------
  // Node ID uniqueness
  // -------------------------------------------------------------------------
  describe('node ID uniqueness', () => {
    it('should have globally unique nodeIds', () => {
      const allNodes = getAllNodes(dellCatalog.products);
      const ids = allNodes.map((n) => n.nodeId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all nodeIds prefixed with dell-', () => {
      const allNodes = getAllNodes(dellCatalog.products);
      for (const node of allNodes) {
        expect(node.nodeId).toMatch(/^dell-/);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Bilingual completeness
  // -------------------------------------------------------------------------
  describe('bilingual completeness', () => {
    it('should have non-empty name and nameKo for all nodes', () => {
      const allNodes = getAllNodes(dellCatalog.products);
      for (const node of allNodes) {
        expect(node.name.length).toBeGreaterThan(0);
        expect(node.nameKo.length).toBeGreaterThan(0);
      }
    });

    it('should have non-empty description and descriptionKo for all nodes', () => {
      const allNodes = getAllNodes(dellCatalog.products);
      for (const node of allNodes) {
        expect(node.description.length).toBeGreaterThan(0);
        expect(node.descriptionKo.length).toBeGreaterThan(0);
      }
    });

    it('should have depthLabel and depthLabelKo for all nodes', () => {
      const allNodes = getAllNodes(dellCatalog.products);
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
      const allNodes = getAllNodes(dellCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).toMatch(/^https:\/\//);
      }
    });

    it('should not have any relative URLs', () => {
      const allNodes = getAllNodes(dellCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).not.toMatch(/^\/[^/]/);
      }
    });

    it('should use English URLs (not Korean URLs)', () => {
      const allNodes = getAllNodes(dellCatalog.products);
      const koreanUrls = allNodes.filter((n) => n.sourceUrl.includes('ko_kr') || n.sourceUrl.includes('/kr/ko/'));
      expect(koreanUrls.map((n) => n.nodeId)).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // Depth consistency
  // -------------------------------------------------------------------------
  describe('depth consistency', () => {
    it('should have children with depth exactly parent.depth + 1', () => {
      const allNodes = getAllNodes(dellCatalog.products);
      for (const node of allNodes) {
        for (const child of node.children) {
          expect(child.depth).toBe(node.depth + 1);
        }
      }
    });

    it('should have leaf nodes with empty children arrays', () => {
      const leaves = getLeafNodes(dellCatalog.products);
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
      const allNodes = getAllNodes(dellCatalog.products);
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

      const allNodes = getAllNodes(dellCatalog.products);
      for (const node of allNodes) {
        if (node.infraNodeTypes) {
          for (const type of node.infraNodeTypes) {
            expect(validTypes.has(type)).toBe(true);
          }
        }
      }
    });

    it('should have infraNodeTypes on all depth 0 and depth 1 nodes', () => {
      const allNodes = getAllNodes(dellCatalog.products);
      const depth01 = allNodes.filter((n) => n.depth <= 1);
      const withoutTypes = depth01.filter(
        (n) => !n.infraNodeTypes || n.infraNodeTypes.length === 0,
      );
      expect(withoutTypes.map((n) => n.nodeId)).toEqual([]);
    });

    it('should map Servers to server types', () => {
      const node = findNodeById(dellCatalog.products, 'dell-servers');
      expect(node!.infraNodeTypes).toContain('web-server');
      expect(node!.infraNodeTypes).toContain('app-server');
      expect(node!.infraNodeTypes).toContain('db-server');
      expect(node!.infraNodeTypes).toContain('vm');
    });

    it('should map Storage to storage types', () => {
      const node = findNodeById(dellCatalog.products, 'dell-storage');
      expect(node!.infraNodeTypes).toContain('san-nas');
      expect(node!.infraNodeTypes).toContain('storage');
    });

    it('should map Networking to switch types', () => {
      const node = findNodeById(dellCatalog.products, 'dell-networking');
      expect(node!.infraNodeTypes).toContain('switch-l2');
      expect(node!.infraNodeTypes).toContain('switch-l3');
    });

    it('should map Data Protection to backup type', () => {
      const node = findNodeById(dellCatalog.products, 'dell-data-protection');
      expect(node!.infraNodeTypes).toContain('backup');
    });

    it('should map PowerSwitch to switch types', () => {
      const node = findNodeById(dellCatalog.products, 'dell-powerswitch');
      expect(node!.infraNodeTypes).toContain('switch-l2');
      expect(node!.infraNodeTypes).toContain('switch-l3');
    });

    it('should map SD-WAN to sd-wan type', () => {
      const node = findNodeById(dellCatalog.products, 'dell-sdwan');
      expect(node!.infraNodeTypes).toContain('sd-wan');
    });

    it('should map ECS to object-storage type', () => {
      const node = findNodeById(dellCatalog.products, 'dell-ecs');
      expect(node!.infraNodeTypes).toContain('object-storage');
    });

    it('should map PowerProtect to backup type', () => {
      const node = findNodeById(dellCatalog.products, 'dell-powerprotect');
      expect(node!.infraNodeTypes).toContain('backup');
    });
  });

  // -------------------------------------------------------------------------
  // PowerEdge Rack Servers deep-dive
  // -------------------------------------------------------------------------
  describe('PowerEdge Rack Servers', () => {
    it('should have 7 rack server series', () => {
      const node = findNodeById(dellCatalog.products, 'dell-poweredge-rack');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(7);
    });

    it('should have PowerEdge R760 with GPU support', () => {
      const node = findNodeById(dellCatalog.products, 'dell-poweredge-r760');
      expect(node).toBeDefined();
      expect(node!.depth).toBe(2);
      expect(node!.lifecycle).toBe('active');
      expect(node!.formFactor).toBe('appliance');
      expect(node!.specs!['Form Factor']).toBe('2U rack');
      expect(node!.specs!['GPU Support']).toContain('GPU');
    });

    it('should have PowerEdge R760 with 2 TB memory and PCIe Gen5', () => {
      const node = findNodeById(dellCatalog.products, 'dell-poweredge-r760');
      expect(node!.specs!['Max Memory']).toContain('2 TB');
      expect(node!.specs!['PCIe Slots']).toContain('Gen5');
    });

    it('should have PowerEdge R660 as 1U dual-socket server', () => {
      const node = findNodeById(dellCatalog.products, 'dell-poweredge-r660');
      expect(node).toBeDefined();
      expect(node!.specs!['Form Factor']).toBe('1U rack');
      expect(node!.specs!.Processor).toContain('2x Intel Xeon');
      expect(node!.maxThroughput).toContain('PCIe Gen5');
    });

    it('should have PowerEdge R860 as 4-socket server', () => {
      const node = findNodeById(dellCatalog.products, 'dell-poweredge-r860');
      expect(node).toBeDefined();
      expect(node!.specs!.Processor).toContain('4x Intel Xeon');
      expect(node!.specs!['Max Memory']).toContain('8 TB');
    });

    it('should have PowerEdge R960 as 4U flagship', () => {
      const node = findNodeById(dellCatalog.products, 'dell-poweredge-r960');
      expect(node).toBeDefined();
      expect(node!.specs!['Form Factor']).toBe('4U rack');
      expect(node!.specs!['Max Memory']).toContain('16 TB');
    });
  });

  // -------------------------------------------------------------------------
  // PowerEdge AI Servers deep-dive
  // -------------------------------------------------------------------------
  describe('PowerEdge AI Servers', () => {
    it('should have 3 AI server series', () => {
      const node = findNodeById(dellCatalog.products, 'dell-poweredge-ai');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
    });

    it('should have XE9680 as flagship 8-GPU AI server', () => {
      const node = findNodeById(dellCatalog.products, 'dell-poweredge-xe9680');
      expect(node).toBeDefined();
      expect(node!.lifecycle).toBe('active');
      expect(node!.specs!.GPUs).toContain('8x NVIDIA');
      expect(node!.specs!['GPU Interconnect']).toContain('NVLink');
      expect(node!.specs!['Form Factor']).toBe('6U rack');
    });

    it('should have XE8640 with liquid cooling support', () => {
      const node = findNodeById(dellCatalog.products, 'dell-poweredge-xe8640');
      expect(node).toBeDefined();
      expect(node!.specs!.GPUs).toContain('4x NVIDIA');
      expect(node!.specs!['Cooling Support']).toContain('liquid cooling');
    });

    it('should have R760xa for AI inference and VDI', () => {
      const node = findNodeById(dellCatalog.products, 'dell-poweredge-r760xa');
      expect(node).toBeDefined();
      expect(node!.specs!.GPUs).toContain('NVIDIA');
      expect(node!.specs!['Form Factor']).toBe('2U rack');
    });

    it('should have architectureRole on AI server product line', () => {
      const node = findNodeById(dellCatalog.products, 'dell-poweredge-ai');
      expect(node!.architectureRole).toContain('AI');
      expect(node!.architectureRoleKo).toContain('AI');
    });

    it('should have at least 5 recommendedFor entries on AI servers', () => {
      const node = findNodeById(dellCatalog.products, 'dell-poweredge-ai');
      expect(node!.recommendedFor!.length).toBeGreaterThanOrEqual(5);
      expect(node!.recommendedForKo!.length).toBeGreaterThanOrEqual(5);
    });
  });

  // -------------------------------------------------------------------------
  // PowerStore deep-dive
  // -------------------------------------------------------------------------
  describe('PowerStore storage', () => {
    it('should have 4 PowerStore models', () => {
      const node = findNodeById(dellCatalog.products, 'dell-powerstore');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(4);
      const names = node!.children.map((c) => c.name);
      expect(names).toContain('PowerStore 1200T');
      expect(names).toContain('PowerStore 3200T');
      expect(names).toContain('PowerStore 5200T');
      expect(names).toContain('PowerStore 9200T');
    });

    it('should have PowerStore 5200T with 2.5M+ IOPS', () => {
      const node = findNodeById(dellCatalog.products, 'dell-powerstore-5200t');
      expect(node).toBeDefined();
      expect(node!.specs!['Max IOPS']).toContain('2,500,000');
      expect(node!.specs!.Controllers).toContain('Active-Active');
    });

    it('should have PowerStore 9200T as flagship with highest IOPS', () => {
      const node = findNodeById(dellCatalog.products, 'dell-powerstore-9200t');
      expect(node).toBeDefined();
      expect(node!.specs!['Max IOPS']).toContain('4,200,000');
      expect(node!.specs!['Raw Capacity']).toContain('9.4 PB');
    });

    it('should have architectureRole on PowerStore', () => {
      const node = findNodeById(dellCatalog.products, 'dell-powerstore');
      expect(node!.architectureRole).toBeTruthy();
      expect(node!.architectureRoleKo).toBeTruthy();
    });

    it('should have at least 5 recommendedFor entries on PowerStore', () => {
      const node = findNodeById(dellCatalog.products, 'dell-powerstore');
      expect(node!.recommendedFor!.length).toBeGreaterThanOrEqual(5);
      expect(node!.recommendedForKo!.length).toBeGreaterThanOrEqual(5);
    });
  });

  // -------------------------------------------------------------------------
  // PowerSwitch deep-dive
  // -------------------------------------------------------------------------
  describe('PowerSwitch networking', () => {
    it('should have 5 PowerSwitch models', () => {
      const node = findNodeById(dellCatalog.products, 'dell-powerswitch');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(5);
    });

    it('should have PowerSwitch Z9664F-ON as 400GbE spine', () => {
      const node = findNodeById(dellCatalog.products, 'dell-z9664f-on');
      expect(node).toBeDefined();
      expect(node!.lifecycle).toBe('active');
      expect(node!.specs!['Switching Capacity']).toBe('51.2 Tbps');
      expect(node!.specs!.Ports).toContain('400GbE');
      expect(node!.specs!.OS).toContain('SONiC');
    });

    it('should have PowerSwitch Z9332F-ON as 1U spine', () => {
      const node = findNodeById(dellCatalog.products, 'dell-z9332f-on');
      expect(node).toBeDefined();
      expect(node!.specs!['Switching Capacity']).toBe('25.6 Tbps');
      expect(node!.specs!['Form Factor']).toBe('1U rack');
    });

    it('should have PowerSwitch S5248F-ON as 25GbE leaf', () => {
      const node = findNodeById(dellCatalog.products, 'dell-s5248f-on');
      expect(node).toBeDefined();
      expect(node!.specs!.Ports).toContain('48x 25GbE');
      expect(node!.maxThroughput).toContain('3.6 Tbps');
    });

    it('should have N3248TE-ON as campus access switch with PoE', () => {
      const node = findNodeById(dellCatalog.products, 'dell-n3248te-on');
      expect(node).toBeDefined();
      expect(node!.specs!.Ports).toContain('48x 1GbE RJ45');
      expect(node!.specs!.PoE).toContain('PoE+');
    });
  });

  // -------------------------------------------------------------------------
  // Data Protection deep-dive
  // -------------------------------------------------------------------------
  describe('Data Protection products', () => {
    it('should have APEX Backup Services as SaaS', () => {
      const node = findNodeById(dellCatalog.products, 'dell-apex-backup-services');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('cloud');
      expect(node!.licensingModel).toBe('subscription');
      expect(node!.architectureRole).toContain('Cloud Backup');
    });

    it('should have Dell PowerProtect Cyber Recovery with air-gap isolation', () => {
      const node = findNodeById(dellCatalog.products, 'dell-dp-cyber-recovery');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Air-Gapped');
      expect(node!.specs!['Isolation Method']).toContain('Air-gapped');
      expect(node!.specs!.Analytics).toContain('CyberSense');
    });

    it('should have PowerProtect DD with deduplication', () => {
      const node = findNodeById(dellCatalog.products, 'dell-powerprotect-dd');
      expect(node).toBeDefined();
      expect(node!.specs!['Dedup Ratio']).toContain('65:1');
      expect(node!.maxThroughput).toContain('68.8 TB/hr');
    });

    it('should have PowerProtect Cyber Recovery (under Storage) with CyberSense', () => {
      const node = findNodeById(dellCatalog.products, 'dell-powerprotect-cyber-recovery');
      expect(node).toBeDefined();
      expect(node!.specs!['Data Sanitization']).toContain('CyberSense');
      expect(node!.specs!['Isolation Method']).toContain('Air-gapped');
    });
  });

  // -------------------------------------------------------------------------
  // PowerScale deep-dive
  // -------------------------------------------------------------------------
  describe('PowerScale NAS', () => {
    it('should have 4 PowerScale models', () => {
      const node = findNodeById(dellCatalog.products, 'dell-powerscale');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(4);
    });

    it('should have F910 as all-flash flagship', () => {
      const node = findNodeById(dellCatalog.products, 'dell-powerscale-f910');
      expect(node).toBeDefined();
      expect(node!.specs!['Throughput per Node']).toContain('39 GB/s');
      expect(node!.specs!['Network Ports']).toContain('100GbE');
    });

    it('should have H700 as hybrid NAS node', () => {
      const node = findNodeById(dellCatalog.products, 'dell-powerscale-h700');
      expect(node).toBeDefined();
      expect(node!.specs!['Cache Tier']).toContain('SSD');
      expect(node!.specs!['Form Factor']).toBe('4U per node');
    });
  });

  // -------------------------------------------------------------------------
  // PowerFlex deep-dive
  // -------------------------------------------------------------------------
  describe('PowerFlex SDS/HCI', () => {
    it('should have 2 PowerFlex form factors', () => {
      const node = findNodeById(dellCatalog.products, 'dell-powerflex');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(2);
    });

    it('should have PowerFlex Rack as fully engineered HCI', () => {
      const node = findNodeById(dellCatalog.products, 'dell-powerflex-rack');
      expect(node).toBeDefined();
      expect(node!.specs!['Max Nodes']).toContain('128');
      expect(node!.specs!['Max Capacity']).toContain('32 PB');
    });

    it('should have PowerFlex Appliance with disaggregated architecture', () => {
      const node = findNodeById(dellCatalog.products, 'dell-powerflex-appliance');
      expect(node).toBeDefined();
      expect(node!.specs!['Storage-Only Nodes']).toBeTruthy();
      expect(node!.specs!['Compute-Only Nodes']).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Modular infrastructure deep-dive
  // -------------------------------------------------------------------------
  describe('PowerEdge Modular', () => {
    it('should have 2 modular products', () => {
      const node = findNodeById(dellCatalog.products, 'dell-poweredge-modular');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(2);
    });

    it('should have MX7000 chassis with 7U form factor', () => {
      const node = findNodeById(dellCatalog.products, 'dell-poweredge-mx7000');
      expect(node).toBeDefined();
      expect(node!.formFactor).toBe('chassis');
      expect(node!.specs!['Chassis Size']).toContain('7U');
      expect(node!.specs!['Compute Slots']).toContain('8 single-width');
    });
  });

  // -------------------------------------------------------------------------
  // Search functionality
  // -------------------------------------------------------------------------
  describe('search', () => {
    it('should find Dell products by English name (PowerEdge)', () => {
      const results = searchNodes(dellCatalog.products, 'PowerEdge');
      expect(results.length).toBeGreaterThan(10);
    });

    it('should find products by Korean name (서버)', () => {
      const results = searchNodes(dellCatalog.products, '서버');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find PowerStore products', () => {
      const results = searchNodes(dellCatalog.products, 'PowerStore');
      expect(results.length).toBeGreaterThanOrEqual(5);
    });

    it('should find storage products by keyword', () => {
      const results = searchNodes(dellCatalog.products, 'storage');
      expect(results.length).toBeGreaterThan(5);
    });

    it('should find switch products by keyword', () => {
      const results = searchNodes(dellCatalog.products, 'switch');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find node by exact nodeId', () => {
      const node = findNodeById(dellCatalog.products, 'dell-poweredge-r760');
      expect(node).toBeDefined();
      expect(node!.name).toBe('PowerEdge R760');
    });
  });

  // -------------------------------------------------------------------------
  // Leaf node counts
  // -------------------------------------------------------------------------
  describe('leaf node counts', () => {
    it('should match countLeafNodes helper', () => {
      const count = countLeafNodes(dellCatalog.products);
      const leaves = getLeafNodes(dellCatalog.products);
      expect(count).toBe(leaves.length);
    });

    it('should have all leaf nodes at depth 1 or depth 2', () => {
      const leaves = getLeafNodes(dellCatalog.products);
      for (const leaf of leaves) {
        expect(leaf.depth).toBeGreaterThanOrEqual(1);
        expect(leaf.depth).toBeLessThanOrEqual(2);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Depth distribution
  // -------------------------------------------------------------------------
  describe('depth distribution', () => {
    it('should have 4 nodes at depth 0', () => {
      const nodes = getNodesByDepth(dellCatalog.products, 0);
      expect(nodes).toHaveLength(4);
    });

    it('should have 13 nodes at depth 1', () => {
      const nodes = getNodesByDepth(dellCatalog.products, 1);
      expect(nodes).toHaveLength(13);
    });

    it('should have 35 nodes at depth 2', () => {
      const nodes = getNodesByDepth(dellCatalog.products, 2);
      expect(nodes).toHaveLength(35);
    });
  });

  // -------------------------------------------------------------------------
  // Data quality validation
  // -------------------------------------------------------------------------
  describe('data quality validation', () => {
    describe('architecture planning fields', () => {
      it('should have architectureRole and architectureRoleKo pair completeness', () => {
        const allNodes = getAllNodes(dellCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.architectureRole && !n.architectureRoleKo) ||
            (!n.architectureRole && n.architectureRoleKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor and recommendedForKo pair completeness', () => {
        const allNodes = getAllNodes(dellCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.recommendedFor && !n.recommendedForKo) ||
            (!n.recommendedFor && n.recommendedForKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor with matching length in recommendedForKo', () => {
        const allNodes = getAllNodes(dellCatalog.products);
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
        const allNodes = getAllNodes(dellCatalog.products);
        for (const node of allNodes) {
          if (node.lifecycle) {
            expect(validValues.has(node.lifecycle)).toBe(true);
          }
        }
      });

      it('should have lifecycle set on all depth 2 leaf nodes', () => {
        const leaves = getLeafNodes(dellCatalog.products);
        const depth2Leaves = leaves.filter((l) => l.depth === 2);
        for (const leaf of depth2Leaves) {
          expect(leaf.lifecycle).toBeDefined();
        }
      });
    });

    describe('licensing and form factor', () => {
      it('should have formFactor on all depth 2 leaf nodes', () => {
        const leaves = getLeafNodes(dellCatalog.products);
        const depth2Leaves = leaves.filter((l) => l.depth === 2);
        for (const leaf of depth2Leaves) {
          expect(leaf.formFactor).toBeDefined();
        }
      });
    });

    describe('specs completeness', () => {
      it('should have specs on all depth 2 leaf nodes', () => {
        const leaves = getLeafNodes(dellCatalog.products);
        const depth2Leaves = leaves.filter((l) => l.depth === 2);
        for (const leaf of depth2Leaves) {
          expect(leaf.specs).toBeDefined();
          expect(Object.keys(leaf.specs!).length).toBeGreaterThanOrEqual(5);
        }
      });
    });

    describe('coverage statistics', () => {
      it('should report infraNodeTypes coverage on all depth 0 and 1 nodes', () => {
        const allNodes = getAllNodes(dellCatalog.products);
        const depth01 = allNodes.filter((n) => n.depth <= 1);
        const depth01WithTypes = depth01.filter(
          (n) => n.infraNodeTypes && n.infraNodeTypes.length > 0,
        );
        expect(depth01WithTypes.length).toBe(depth01.length);
      });

      it('should report architectureRole coverage on all depth 1 nodes', () => {
        const allNodes = getAllNodes(dellCatalog.products);
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
    it('should have PowerEdge T360 as entry-level tower with Intel Xeon E-2400', () => {
      const node = findNodeById(dellCatalog.products, 'dell-poweredge-t360');
      expect(node).toBeDefined();
      expect(node!.specs!.Processor).toContain('Intel Xeon E-2400');
      expect(node!.specs!['Max Memory']).toContain('128 GB');
      expect(node!.specs!['Form Factor']).toBe('Tower');
    });

    it('should have PowerEdge T560 as dual-socket tower with GPU support', () => {
      const node = findNodeById(dellCatalog.products, 'dell-poweredge-t560');
      expect(node).toBeDefined();
      expect(node!.specs!.Processor).toContain('2x Intel Xeon Scalable');
      expect(node!.specs!['GPU Support']).toBeTruthy();
    });

    it('should have PowerEdge R660xs as cost-optimized variant', () => {
      const node = findNodeById(dellCatalog.products, 'dell-poweredge-r660xs');
      expect(node).toBeDefined();
      expect(node!.specs!['Max Memory']).toContain('1 TB');
      expect(node!.specs!['Form Factor']).toBe('1U rack');
    });

    it('should have ECS appliance for exabyte-class object storage', () => {
      const node = findNodeById(dellCatalog.products, 'dell-ecs-appliance');
      expect(node).toBeDefined();
      expect(node!.specs!['Max Capacity']).toContain('Exabyte');
      expect(node!.specs!['Min Cluster']).toBe('4 nodes');
    });

    it('should have PowerProtect DP as integrated data protection appliance', () => {
      const node = findNodeById(dellCatalog.products, 'dell-powerprotect-dp');
      expect(node).toBeDefined();
      expect(node!.specs!.Software).toContain('PPDM');
      expect(node!.specs!['Database Protection']).toContain('Oracle');
    });

    it('should have SD-WAN Edge 600 with IPSec throughput specs', () => {
      const node = findNodeById(dellCatalog.products, 'dell-sdwan-edge-600');
      expect(node).toBeDefined();
      expect(node!.specs!['IPSec Throughput']).toBe('1 Gbps');
      expect(node!.specs!['Form Factor']).toContain('Desktop');
    });

    it('should have SD-WAN Edge 3800 with 10 Gbps IPSec', () => {
      const node = findNodeById(dellCatalog.products, 'dell-sdwan-edge-3800');
      expect(node).toBeDefined();
      expect(node!.specs!['IPSec Throughput']).toBe('10 Gbps');
      expect(node!.specs!['HA Mode']).toBe('Active-Standby');
    });

    it('should have APEX Backup Services with SaaS specs', () => {
      const node = findNodeById(dellCatalog.products, 'dell-apex-backup-services');
      expect(node).toBeDefined();
      expect(node!.specs!['Deployment Model']).toContain('SaaS');
      expect(node!.specs!['Protected Workloads']).toContain('Microsoft 365');
    });

    it('should have XE9680 with up to 640 TFLOPS FP16', () => {
      const node = findNodeById(dellCatalog.products, 'dell-poweredge-xe9680');
      expect(node).toBeDefined();
      expect(node!.maxThroughput).toContain('640 TFLOPS');
      expect(node!.specs!['TDP per GPU']).toContain('700W');
    });

    it('should have MX760c compute sled for MX7000 chassis', () => {
      const node = findNodeById(dellCatalog.products, 'dell-poweredge-mx760c');
      expect(node).toBeDefined();
      expect(node!.specs!['Form Factor']).toContain('compute sled');
      expect(node!.specs!.Networking).toContain('Mezzanine');
    });
  });
});
