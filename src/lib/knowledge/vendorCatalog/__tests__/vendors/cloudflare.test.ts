import { describe, it, expect } from 'vitest';
import { cloudflareCatalog } from '../../vendors/cloudflare';
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
// Cloudflare Catalog -- Data Integrity Tests
// ---------------------------------------------------------------------------

describe('Cloudflare vendor catalog', () => {
  // -------------------------------------------------------------------------
  // Top-level catalog metadata
  // -------------------------------------------------------------------------
  describe('catalog metadata', () => {
    it('should have correct vendor identity', () => {
      expect(cloudflareCatalog.vendorId).toBe('cloudflare');
      expect(cloudflareCatalog.vendorName).toBe('Cloudflare');
      expect(cloudflareCatalog.vendorNameKo).toBe('클라우드플레어');
      expect(cloudflareCatalog.headquarters).toBe('San Francisco, CA, USA');
    });

    it('should have valid URLs', () => {
      expect(cloudflareCatalog.website).toBe('https://www.cloudflare.com');
      expect(cloudflareCatalog.productPageUrl).toMatch(/^https:\/\//);
      expect(cloudflareCatalog.crawlSource).toMatch(/^https:\/\//);
    });

    it('should have bilingual depth structure', () => {
      expect(cloudflareCatalog.depthStructure).toEqual(['category', 'product-line', 'service']);
      expect(cloudflareCatalog.depthStructureKo).toEqual(['카테고리', '제품 라인', '서비스']);
      expect(cloudflareCatalog.depthStructure).toHaveLength(cloudflareCatalog.depthStructureKo.length);
    });

    it('should have crawl metadata', () => {
      expect(cloudflareCatalog.lastCrawled).toBe('2026-02-22');
      expect(cloudflareCatalog.crawlSource).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Stats validation
  // -------------------------------------------------------------------------
  describe('catalog stats', () => {
    it('should have accurate totalProducts count', () => {
      const allNodes = getAllNodes(cloudflareCatalog.products);
      expect(cloudflareCatalog.stats.totalProducts).toBe(allNodes.length);
    });

    it('should have accurate maxDepth', () => {
      const actualMax = getMaxDepth(cloudflareCatalog.products);
      expect(cloudflareCatalog.stats.maxDepth).toBe(actualMax);
    });

    it('should have accurate categoriesCount', () => {
      expect(cloudflareCatalog.stats.categoriesCount).toBe(cloudflareCatalog.products.length);
    });

    it('should match computeStats output', () => {
      const computed = computeStats(cloudflareCatalog.products);
      expect(cloudflareCatalog.stats.totalProducts).toBe(computed.totalProducts);
      expect(cloudflareCatalog.stats.maxDepth).toBe(computed.maxDepth);
      expect(cloudflareCatalog.stats.categoriesCount).toBe(computed.categoriesCount);
    });

    it('should have 54 total nodes', () => {
      expect(cloudflareCatalog.stats.totalProducts).toBe(54);
    });

    it('should have maxDepth of 2', () => {
      expect(cloudflareCatalog.stats.maxDepth).toBe(2);
    });

    it('should have 4 top-level categories', () => {
      expect(cloudflareCatalog.stats.categoriesCount).toBe(4);
    });
  });

  // -------------------------------------------------------------------------
  // Product tree structure
  // -------------------------------------------------------------------------
  describe('product tree structure', () => {
    it('should have 4 root categories', () => {
      expect(cloudflareCatalog.products).toHaveLength(4);
      const names = cloudflareCatalog.products.map((p) => p.name);
      expect(names).toEqual([
        'Application Services',
        'Zero Trust / SASE',
        'Developer Platform',
        'Network Services',
      ]);
    });

    it('should have all root nodes at depth 0', () => {
      for (const product of cloudflareCatalog.products) {
        expect(product.depth).toBe(0);
      }
    });

    it('should have Application Services with 5 product lines', () => {
      const node = cloudflareCatalog.products.find(
        (p) => p.nodeId === 'cloudflare-application-services',
      );
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(5);
    });

    it('should have Zero Trust / SASE with 7 product lines', () => {
      const node = cloudflareCatalog.products.find(
        (p) => p.nodeId === 'cloudflare-zero-trust',
      );
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(7);
    });

    it('should have Developer Platform with 3 product lines', () => {
      const node = cloudflareCatalog.products.find(
        (p) => p.nodeId === 'cloudflare-developer-platform',
      );
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
    });

    it('should have Network Services with 4 product lines', () => {
      const node = cloudflareCatalog.products.find(
        (p) => p.nodeId === 'cloudflare-network-services',
      );
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(4);
    });
  });

  // -------------------------------------------------------------------------
  // Node ID uniqueness
  // -------------------------------------------------------------------------
  describe('node ID uniqueness', () => {
    it('should have globally unique nodeIds', () => {
      const allNodes = getAllNodes(cloudflareCatalog.products);
      const ids = allNodes.map((n) => n.nodeId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all nodeIds prefixed with cloudflare-', () => {
      const allNodes = getAllNodes(cloudflareCatalog.products);
      for (const node of allNodes) {
        expect(node.nodeId).toMatch(/^cloudflare-/);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Bilingual completeness
  // -------------------------------------------------------------------------
  describe('bilingual completeness', () => {
    it('should have non-empty name and nameKo for all nodes', () => {
      const allNodes = getAllNodes(cloudflareCatalog.products);
      for (const node of allNodes) {
        expect(node.name.length).toBeGreaterThan(0);
        expect(node.nameKo.length).toBeGreaterThan(0);
      }
    });

    it('should have non-empty description and descriptionKo for all nodes', () => {
      const allNodes = getAllNodes(cloudflareCatalog.products);
      for (const node of allNodes) {
        expect(node.description.length).toBeGreaterThan(0);
        expect(node.descriptionKo.length).toBeGreaterThan(0);
      }
    });

    it('should have depthLabel and depthLabelKo for all nodes', () => {
      const allNodes = getAllNodes(cloudflareCatalog.products);
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
      const allNodes = getAllNodes(cloudflareCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).toMatch(/^https:\/\//);
      }
    });

    it('should not have any relative URLs', () => {
      const allNodes = getAllNodes(cloudflareCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).not.toMatch(/^\/[^/]/);
      }
    });

    it('should use English URLs (not Korean URLs)', () => {
      const allNodes = getAllNodes(cloudflareCatalog.products);
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
      const allNodes = getAllNodes(cloudflareCatalog.products);
      for (const node of allNodes) {
        for (const child of node.children) {
          expect(child.depth).toBe(node.depth + 1);
        }
      }
    });

    it('should have leaf nodes with empty children arrays', () => {
      const leaves = getLeafNodes(cloudflareCatalog.products);
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
      const allNodes = getAllNodes(cloudflareCatalog.products);
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

      const allNodes = getAllNodes(cloudflareCatalog.products);
      for (const node of allNodes) {
        if (node.infraNodeTypes) {
          for (const type of node.infraNodeTypes) {
            expect(validTypes.has(type)).toBe(true);
          }
        }
      }
    });

    it('should map Application Services to cdn, waf, dns, load-balancer', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-application-services');
      expect(node!.infraNodeTypes).toContain('cdn');
      expect(node!.infraNodeTypes).toContain('waf');
      expect(node!.infraNodeTypes).toContain('dns');
      expect(node!.infraNodeTypes).toContain('load-balancer');
    });

    it('should map Zero Trust / SASE to sase-gateway, ztna-broker, vpn-gateway', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-zero-trust');
      expect(node!.infraNodeTypes).toContain('sase-gateway');
      expect(node!.infraNodeTypes).toContain('ztna-broker');
      expect(node!.infraNodeTypes).toContain('vpn-gateway');
    });

    it('should map Network Services to sd-wan and firewall', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-network-services');
      expect(node!.infraNodeTypes).toContain('sd-wan');
      expect(node!.infraNodeTypes).toContain('firewall');
    });

    it('should map CDN line to cdn type', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-cdn-line');
      expect(node!.infraNodeTypes).toContain('cdn');
    });

    it('should map WAF line to waf type', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-waf-line');
      expect(node!.infraNodeTypes).toContain('waf');
    });

    it('should map DNS line to dns type', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-dns-line');
      expect(node!.infraNodeTypes).toContain('dns');
    });

    it('should map Load Balancing line to load-balancer type', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-lb-line');
      expect(node!.infraNodeTypes).toContain('load-balancer');
    });

    it('should map Access line to ztna-broker type', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-access-line');
      expect(node!.infraNodeTypes).toContain('ztna-broker');
    });

    it('should map Gateway line to sase-gateway type', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-gateway-line');
      expect(node!.infraNodeTypes).toContain('sase-gateway');
    });

    it('should map CASB line to casb type', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-casb-line');
      expect(node!.infraNodeTypes).toContain('casb');
    });

    it('should map DLP line to dlp type', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-dlp-line');
      expect(node!.infraNodeTypes).toContain('dlp');
    });

    it('should map Magic WAN line to sd-wan type', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-magic-wan-line');
      expect(node!.infraNodeTypes).toContain('sd-wan');
    });

    it('should map Magic Firewall line to firewall type', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-magic-firewall-line');
      expect(node!.infraNodeTypes).toContain('firewall');
    });

    it('should map Storage line to object-storage type', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-storage-line');
      expect(node!.infraNodeTypes).toContain('object-storage');
    });

    it('should map Tunnel line to vpn-gateway type', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-tunnel-line');
      expect(node!.infraNodeTypes).toContain('vpn-gateway');
    });
  });

  // -------------------------------------------------------------------------
  // Cloudflare CDN deep-dive
  // -------------------------------------------------------------------------
  describe('Cloudflare CDN', () => {
    it('should have CDN line with 4 services', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-cdn-line');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(4);
    });

    it('should have Cloudflare CDN service with correct specs', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-cdn');
      expect(node).toBeDefined();
      expect(node!.depth).toBe(2);
      expect(node!.specs!['Global PoPs']).toContain('330+');
      expect(node!.specs!['Network Capacity']).toContain('477 Tbps');
    });

    it('should have Argo Smart Routing', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-argo-smart-routing');
      expect(node).toBeDefined();
      expect(node!.specs!['Performance Improvement']).toContain('~30%');
    });

    it('should have Cloudflare Images', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-images');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Media Optimization');
    });

    it('should have Cloudflare Stream', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-stream');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Media Streaming');
    });
  });

  // -------------------------------------------------------------------------
  // WAF deep-dive
  // -------------------------------------------------------------------------
  describe('Cloudflare WAF', () => {
    it('should have WAF line with 4 services', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-waf-line');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(4);
    });

    it('should have WAF service with OWASP rulesets', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-waf');
      expect(node).toBeDefined();
      expect(node!.specs!['Rulesets']).toContain('OWASP');
      expect(node!.specs!['Peak Processing']).toContain('126M+');
    });

    it('should have Advanced Rate Limiting', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-rate-limiting');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('API Protection');
    });

    it('should have Bot Management with threat intelligence', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-bot-management');
      expect(node).toBeDefined();
      expect(node!.specs!['Threat Intelligence']).toContain('215B+');
    });

    it('should have Page Shield for client-side security', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-page-shield');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Client-Side Security');
    });
  });

  // -------------------------------------------------------------------------
  // DNS deep-dive
  // -------------------------------------------------------------------------
  describe('Cloudflare DNS', () => {
    it('should have DNS line with 2 services', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-dns-line');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(2);
    });

    it('should have Cloudflare DNS with 11ms response time', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-dns');
      expect(node).toBeDefined();
      expect(node!.specs!['Average Response Time']).toBe('11ms');
    });

    it('should have 1.1.1.1 public resolver', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-1111');
      expect(node).toBeDefined();
      expect(node!.specs!['DNS Resolver']).toContain('1.1.1.1');
    });
  });

  // -------------------------------------------------------------------------
  // DDoS Protection deep-dive
  // -------------------------------------------------------------------------
  describe('DDoS Protection', () => {
    it('should have DDoS line with 3 services', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-ddos-line');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(3);
    });

    it('should have DDoS Protection with 477 Tbps capacity', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-ddos-protection');
      expect(node).toBeDefined();
      expect(node!.specs!['Network Capacity']).toContain('477 Tbps');
    });

    it('should have Magic Transit for on-prem DDoS protection', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-magic-transit');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Network DDoS Mitigation');
      expect(node!.specs!['Mitigation Time']).toContain('~3 seconds');
    });

    it('should have Spectrum for non-HTTP DDoS protection', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-spectrum');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('L4 Proxy');
    });
  });

  // -------------------------------------------------------------------------
  // Zero Trust products deep-dive
  // -------------------------------------------------------------------------
  describe('Zero Trust products', () => {
    it('should have Cloudflare Access (ZTNA)', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-access');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('ztna-broker');
      expect(node!.architectureRole).toContain('Zero Trust Network Access');
    });

    it('should have Cloudflare Gateway (SWG)', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-gateway');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('sase-gateway');
      expect(node!.specs!['Performance']).toContain('50% faster');
    });

    it('should have Cloudflare Tunnel', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-tunnel');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('vpn-gateway');
      expect(node!.specs!['Connection']).toContain('Outbound-only');
    });

    it('should have Browser Isolation', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-browser-isolation');
      expect(node).toBeDefined();
      expect(node!.specs!['Rendering']).toContain('Network Vector Rendering');
    });

    it('should have CASB', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-casb');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('casb');
      expect(node!.architectureRole).toContain('SaaS Security');
    });

    it('should have DLP', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-dlp');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('dlp');
      expect(node!.specs!['GenAI']).toContain('Prompt and response scanning');
    });

    it('should have Email Security', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-email-security');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Email Security');
    });
  });

  // -------------------------------------------------------------------------
  // Developer Platform deep-dive
  // -------------------------------------------------------------------------
  describe('Developer Platform products', () => {
    it('should have Workers (edge compute)', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-workers');
      expect(node).toBeDefined();
      expect(node!.specs!['Runtime']).toContain('V8 isolates');
      expect(node!.specs!['Cold Start']).toContain('zero');
    });

    it('should have Workers KV (key-value store)', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-workers-kv');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Edge Key-Value Store');
    });

    it('should have Durable Objects (stateful compute)', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-durable-objects');
      expect(node).toBeDefined();
      expect(node!.specs!['Consistency']).toContain('Strong');
    });

    it('should have R2 Object Storage with zero egress fees', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-r2');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('object-storage');
      expect(node!.specs!['Egress Fees']).toContain('$0');
      expect(node!.specs!['API']).toContain('S3-compatible');
    });

    it('should have D1 (serverless SQL database)', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-d1');
      expect(node).toBeDefined();
      expect(node!.specs!['Engine']).toContain('SQLite');
    });

    it('should have Cloudflare Pages (hosting)', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-pages');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Hosting');
    });
  });

  // -------------------------------------------------------------------------
  // Network Services deep-dive
  // -------------------------------------------------------------------------
  describe('Network Services products', () => {
    it('should have Magic WAN (SD-WAN)', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-magic-wan');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('sd-wan');
      expect(node!.architectureRole).toContain('SD-WAN');
    });

    it('should have Magic Firewall (FWaaS)', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-magic-firewall');
      expect(node).toBeDefined();
      expect(node!.infraNodeTypes).toContain('firewall');
      expect(node!.specs!['Type']).toContain('Firewall-as-a-Service');
    });

    it('should have WARP (device agent)', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-warp');
      expect(node).toBeDefined();
      expect(node!.specs!['Tunnel Protocol']).toContain('WireGuard');
    });

    it('should have Network Interconnect', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-network-interconnect');
      expect(node).toBeDefined();
      expect(node!.specs!['Connection Types']).toContain('PNI');
    });
  });

  // -------------------------------------------------------------------------
  // Search functionality
  // -------------------------------------------------------------------------
  describe('search', () => {
    it('should find Cloudflare products by English name', () => {
      const results = searchNodes(cloudflareCatalog.products, 'Cloudflare');
      expect(results.length).toBeGreaterThan(10);
    });

    it('should find products by Korean name (보안)', () => {
      const results = searchNodes(cloudflareCatalog.products, '보안');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find WAF products', () => {
      const results = searchNodes(cloudflareCatalog.products, 'WAF');
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('should find Zero Trust products', () => {
      const results = searchNodes(cloudflareCatalog.products, 'Zero Trust');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find Magic products by keyword', () => {
      const results = searchNodes(cloudflareCatalog.products, 'Magic');
      expect(results.length).toBeGreaterThanOrEqual(3);
    });

    it('should find node by exact nodeId', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-r2');
      expect(node).toBeDefined();
      expect(node!.name).toBe('R2 Object Storage');
    });
  });

  // -------------------------------------------------------------------------
  // Leaf node counts
  // -------------------------------------------------------------------------
  describe('leaf node counts', () => {
    it('should match countLeafNodes helper', () => {
      const count = countLeafNodes(cloudflareCatalog.products);
      const leaves = getLeafNodes(cloudflareCatalog.products);
      expect(count).toBe(leaves.length);
    });

    it('should have all leaf nodes at depth 2', () => {
      const leaves = getLeafNodes(cloudflareCatalog.products);
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
      const nodes = getNodesByDepth(cloudflareCatalog.products, 0);
      expect(nodes).toHaveLength(4);
    });

    it('should have 19 nodes at depth 1', () => {
      const nodes = getNodesByDepth(cloudflareCatalog.products, 1);
      expect(nodes).toHaveLength(19);
    });

    it('should have 31 nodes at depth 2', () => {
      const nodes = getNodesByDepth(cloudflareCatalog.products, 2);
      expect(nodes).toHaveLength(31);
    });
  });

  // -------------------------------------------------------------------------
  // Data quality validation
  // -------------------------------------------------------------------------
  describe('data quality validation', () => {
    describe('architecture planning fields', () => {
      it('should have architectureRole and architectureRoleKo pair completeness', () => {
        const allNodes = getAllNodes(cloudflareCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.architectureRole && !n.architectureRoleKo) ||
            (!n.architectureRole && n.architectureRoleKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor and recommendedForKo pair completeness', () => {
        const allNodes = getAllNodes(cloudflareCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.recommendedFor && !n.recommendedForKo) ||
            (!n.recommendedFor && n.recommendedForKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor with matching length in recommendedForKo', () => {
        const allNodes = getAllNodes(cloudflareCatalog.products);
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
        const allNodes = getAllNodes(cloudflareCatalog.products);
        for (const node of allNodes) {
          if (node.lifecycle) {
            expect(validValues.has(node.lifecycle)).toBe(true);
          }
        }
      });

      it('should have lifecycle set on all leaf nodes', () => {
        const leaves = getLeafNodes(cloudflareCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.lifecycle).toBeDefined();
        }
      });
    });

    describe('licensing and form factor', () => {
      it('should have licensingModel on all leaf nodes', () => {
        const leaves = getLeafNodes(cloudflareCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.licensingModel).toBeDefined();
        }
      });

      it('should have formFactor on all leaf nodes', () => {
        const leaves = getLeafNodes(cloudflareCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.formFactor).toBeDefined();
        }
      });

      it('should have all leaf nodes as cloud formFactor', () => {
        const leaves = getLeafNodes(cloudflareCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.formFactor).toBe('cloud');
        }
      });

      it('should have all leaf nodes with subscription licensingModel', () => {
        const leaves = getLeafNodes(cloudflareCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.licensingModel).toBe('subscription');
        }
      });
    });

    describe('specs completeness', () => {
      it('should have specs on all leaf nodes', () => {
        const leaves = getLeafNodes(cloudflareCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.specs).toBeDefined();
          expect(Object.keys(leaf.specs!).length).toBeGreaterThanOrEqual(5);
        }
      });
    });

    describe('coverage statistics', () => {
      it('should report architectureRole coverage on all depth 1 nodes', () => {
        const allNodes = getAllNodes(cloudflareCatalog.products);
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
    it('should have Cloudflare CDN with 330+ PoPs', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-cdn');
      expect(node).toBeDefined();
      expect(node!.specs!['Global PoPs']).toContain('330+');
      expect(node!.specs!['Protocols']).toContain('HTTP/3');
    });

    it('should have Cloudflare Access with multi-IdP support', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-access');
      expect(node).toBeDefined();
      expect(node!.specs!['Identity Providers']).toContain('SAML');
      expect(node!.specs!['Identity Providers']).toContain('OIDC');
    });

    it('should have R2 with S3-compatible API and zero egress', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-r2');
      expect(node).toBeDefined();
      expect(node!.specs!['API']).toBe('S3-compatible');
      expect(node!.specs!['Egress Fees']).toBe('$0 (zero)');
      expect(node!.specs!['Standard Storage']).toContain('$0.015');
    });

    it('should have Magic WAN with IPsec, GRE, and WireGuard tunnels', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-magic-wan');
      expect(node).toBeDefined();
      expect(node!.specs!['Tunnels']).toContain('IPsec');
      expect(node!.specs!['Tunnels']).toContain('GRE');
      expect(node!.specs!['Tunnels']).toContain('WireGuard');
    });

    it('should have DLP with GenAI scanning', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-dlp');
      expect(node).toBeDefined();
      expect(node!.specs!['GenAI']).toContain('Prompt and response scanning');
      expect(node!.specs!['Labels']).toContain('Microsoft Purview');
    });

    it('should have Magic Transit with BGP Anycast routing', () => {
      const node = findNodeById(cloudflareCatalog.products, 'cloudflare-magic-transit');
      expect(node).toBeDefined();
      expect(node!.specs!['Routing']).toBe('BGP Anycast');
      expect(node!.specs!['Network Capacity']).toContain('477 Tbps');
    });

    it('should have all leaf nodes as cloud formFactor with subscription licensing', () => {
      const leaves = getLeafNodes(cloudflareCatalog.products);
      for (const leaf of leaves) {
        expect(leaf.formFactor).toBe('cloud');
        expect(leaf.licensingModel).toBe('subscription');
      }
    });
  });
});
