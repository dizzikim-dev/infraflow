import { describe, it, expect } from 'vitest';
import { oktaCatalog } from '../../vendors/okta';
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
// Okta Catalog -- Data Integrity Tests
// ---------------------------------------------------------------------------

describe('Okta vendor catalog', () => {
  // -------------------------------------------------------------------------
  // Top-level catalog metadata
  // -------------------------------------------------------------------------
  describe('catalog metadata', () => {
    it('should have correct vendor identity', () => {
      expect(oktaCatalog.vendorId).toBe('okta');
      expect(oktaCatalog.vendorName).toBe('Okta');
      expect(oktaCatalog.vendorNameKo).toBe('옥타');
      expect(oktaCatalog.headquarters).toBe('San Francisco, CA, USA');
    });

    it('should have valid URLs', () => {
      expect(oktaCatalog.website).toBe('https://www.okta.com');
      expect(oktaCatalog.productPageUrl).toMatch(/^https:\/\//);
      expect(oktaCatalog.crawlSource).toMatch(/^https:\/\//);
    });

    it('should have bilingual depth structure', () => {
      expect(oktaCatalog.depthStructure).toEqual(['category', 'product-line', 'module']);
      expect(oktaCatalog.depthStructureKo).toEqual(['카테고리', '제품 라인', '모듈']);
      expect(oktaCatalog.depthStructure).toHaveLength(oktaCatalog.depthStructureKo.length);
    });

    it('should have crawl metadata', () => {
      expect(oktaCatalog.lastCrawled).toBe('2026-02-22');
      expect(oktaCatalog.crawlSource).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Stats validation
  // -------------------------------------------------------------------------
  describe('catalog stats', () => {
    it('should have accurate totalProducts count', () => {
      const allNodes = getAllNodes(oktaCatalog.products);
      expect(oktaCatalog.stats.totalProducts).toBe(allNodes.length);
    });

    it('should have accurate maxDepth', () => {
      const actualMax = getMaxDepth(oktaCatalog.products);
      expect(oktaCatalog.stats.maxDepth).toBe(actualMax);
    });

    it('should have accurate categoriesCount', () => {
      expect(oktaCatalog.stats.categoriesCount).toBe(oktaCatalog.products.length);
    });

    it('should match computeStats output', () => {
      const computed = computeStats(oktaCatalog.products);
      expect(oktaCatalog.stats.totalProducts).toBe(computed.totalProducts);
      expect(oktaCatalog.stats.maxDepth).toBe(computed.maxDepth);
      expect(oktaCatalog.stats.categoriesCount).toBe(computed.categoriesCount);
    });

    it('should have 34 total nodes', () => {
      expect(oktaCatalog.stats.totalProducts).toBe(34);
    });

    it('should have maxDepth of 2', () => {
      expect(oktaCatalog.stats.maxDepth).toBe(2);
    });

    it('should have 4 top-level categories', () => {
      expect(oktaCatalog.stats.categoriesCount).toBe(4);
    });
  });

  // -------------------------------------------------------------------------
  // Product tree structure
  // -------------------------------------------------------------------------
  describe('product tree structure', () => {
    it('should have 4 root categories', () => {
      expect(oktaCatalog.products).toHaveLength(4);
      const names = oktaCatalog.products.map((p) => p.name);
      expect(names).toEqual([
        'Workforce Identity Cloud',
        'Customer Identity Cloud (Auth0)',
        'Identity Governance',
        'Identity Security',
      ]);
    });

    it('should have all root nodes at depth 0', () => {
      for (const product of oktaCatalog.products) {
        expect(product.depth).toBe(0);
      }
    });

    it('should have Workforce Identity Cloud with 6 product lines', () => {
      const wic = oktaCatalog.products.find((p) => p.nodeId === 'okta-workforce-identity');
      expect(wic).toBeDefined();
      expect(wic!.children).toHaveLength(6);
    });

    it('should have Customer Identity Cloud with 3 product lines', () => {
      const cic = oktaCatalog.products.find((p) => p.nodeId === 'okta-customer-identity');
      expect(cic).toBeDefined();
      expect(cic!.children).toHaveLength(3);
    });

    it('should have Identity Governance with 1 product line', () => {
      const ig = oktaCatalog.products.find((p) => p.nodeId === 'okta-identity-governance');
      expect(ig).toBeDefined();
      expect(ig!.children).toHaveLength(1);
    });

    it('should have Identity Security with 2 product lines', () => {
      const is_ = oktaCatalog.products.find((p) => p.nodeId === 'okta-identity-security');
      expect(is_).toBeDefined();
      expect(is_!.children).toHaveLength(2);
    });
  });

  // -------------------------------------------------------------------------
  // Node ID uniqueness
  // -------------------------------------------------------------------------
  describe('node ID uniqueness', () => {
    it('should have globally unique nodeIds', () => {
      const allNodes = getAllNodes(oktaCatalog.products);
      const ids = allNodes.map((n) => n.nodeId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all nodeIds prefixed with okta-', () => {
      const allNodes = getAllNodes(oktaCatalog.products);
      for (const node of allNodes) {
        expect(node.nodeId).toMatch(/^okta-/);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Bilingual completeness
  // -------------------------------------------------------------------------
  describe('bilingual completeness', () => {
    it('should have non-empty name and nameKo for all nodes', () => {
      const allNodes = getAllNodes(oktaCatalog.products);
      for (const node of allNodes) {
        expect(node.name.length).toBeGreaterThan(0);
        expect(node.nameKo.length).toBeGreaterThan(0);
      }
    });

    it('should have non-empty description and descriptionKo for all nodes', () => {
      const allNodes = getAllNodes(oktaCatalog.products);
      for (const node of allNodes) {
        expect(node.description.length).toBeGreaterThan(0);
        expect(node.descriptionKo.length).toBeGreaterThan(0);
      }
    });

    it('should have depthLabel and depthLabelKo for all nodes', () => {
      const allNodes = getAllNodes(oktaCatalog.products);
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
      const allNodes = getAllNodes(oktaCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).toMatch(/^https:\/\//);
      }
    });

    it('should not have any relative URLs', () => {
      const allNodes = getAllNodes(oktaCatalog.products);
      for (const node of allNodes) {
        expect(node.sourceUrl).not.toMatch(/^\/[^/]/);
      }
    });

    it('should use English URLs (not Korean URLs)', () => {
      const allNodes = getAllNodes(oktaCatalog.products);
      const koreanUrls = allNodes.filter((n) => n.sourceUrl.includes('ko_kr') || n.sourceUrl.includes('/kr/ko/'));
      expect(koreanUrls.map((n) => n.nodeId)).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // Depth consistency
  // -------------------------------------------------------------------------
  describe('depth consistency', () => {
    it('should have children with depth exactly parent.depth + 1', () => {
      const allNodes = getAllNodes(oktaCatalog.products);
      for (const node of allNodes) {
        for (const child of node.children) {
          expect(child.depth).toBe(node.depth + 1);
        }
      }
    });

    it('should have leaf nodes with empty children arrays', () => {
      const leaves = getLeafNodes(oktaCatalog.products);
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
      const allNodes = getAllNodes(oktaCatalog.products);
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

      const allNodes = getAllNodes(oktaCatalog.products);
      for (const node of allNodes) {
        if (node.infraNodeTypes) {
          for (const type of node.infraNodeTypes) {
            expect(validTypes.has(type)).toBe(true);
          }
        }
      }
    });

    it('should have infraNodeTypes on all depth 0 and depth 1 nodes', () => {
      const allNodes = getAllNodes(oktaCatalog.products);
      const depth01 = allNodes.filter((n) => n.depth <= 1);
      const withoutTypes = depth01.filter(
        (n) => !n.infraNodeTypes || n.infraNodeTypes.length === 0,
      );
      expect(withoutTypes.map((n) => n.nodeId)).toEqual([]);
    });

    it('should map Workforce Identity Cloud to sso, mfa, iam, ldap-ad types', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-workforce-identity');
      expect(node!.infraNodeTypes).toContain('sso');
      expect(node!.infraNodeTypes).toContain('mfa');
      expect(node!.infraNodeTypes).toContain('iam');
      expect(node!.infraNodeTypes).toContain('ldap-ad');
    });

    it('should map Customer Identity Cloud to sso, mfa, iam types', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-customer-identity');
      expect(node!.infraNodeTypes).toContain('sso');
      expect(node!.infraNodeTypes).toContain('mfa');
      expect(node!.infraNodeTypes).toContain('iam');
    });

    it('should map API Access Management to api-gateway and iam types', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-api-access-line');
      expect(node!.infraNodeTypes).toContain('api-gateway');
      expect(node!.infraNodeTypes).toContain('iam');
    });
  });

  // -------------------------------------------------------------------------
  // Workforce Identity deep-dive
  // -------------------------------------------------------------------------
  describe('Workforce Identity Cloud products', () => {
    it('should have SSO product line with 1 module', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-sso-line');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(1);
    });

    it('should have MFA product line with 2 modules (Adaptive MFA, FastPass)', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-mfa-line');
      expect(node).toBeDefined();
      expect(node!.children).toHaveLength(2);
      const names = node!.children.map((c) => c.name);
      expect(names).toContain('Okta Adaptive MFA');
      expect(names).toContain('Okta FastPass');
    });

    it('should have Okta SSO with 8,000+ integrations', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-sso');
      expect(node).toBeDefined();
      expect(node!.specs!['Pre-Built Integrations']).toContain('8,000');
    });

    it('should have Okta Adaptive MFA with phishing-resistant factors', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-adaptive-mfa');
      expect(node).toBeDefined();
      expect(node!.specs!['Phishing-Resistant Factors']).toContain('FIDO2');
    });

    it('should have Okta FastPass as passwordless authenticator', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-fastpass');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Passwordless');
    });

    it('should have Universal Directory with AD/LDAP integration', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-universal-directory');
      expect(node).toBeDefined();
      expect(node!.specs!['Directory Sources']).toContain('Active Directory');
      expect(node!.specs!['Directory Sources']).toContain('LDAP');
    });

    it('should have Lifecycle Management with 7,000+ connectors', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-lifecycle-management');
      expect(node).toBeDefined();
      expect(node!.specs!['Application Connectors']).toContain('7,000');
    });

    it('should have API Access Management with OAuth 2.0', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-api-access-management');
      expect(node).toBeDefined();
      expect(node!.specs!['Authorization Standard']).toContain('OAuth 2.0');
    });

    it('should have Privileged Access with SSH/RDP management', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-privileged-access');
      expect(node).toBeDefined();
      expect(node!.specs!['Session Management']).toContain('SSH');
      expect(node!.specs!['Session Management']).toContain('RDP');
    });
  });

  // -------------------------------------------------------------------------
  // Customer Identity (Auth0) deep-dive
  // -------------------------------------------------------------------------
  describe('Customer Identity Cloud (Auth0) products', () => {
    it('should have Auth0 Universal Login', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-auth0-universal-login');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('CIAM');
    });

    it('should have Auth0 Passkeys with FIDO2 support', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-auth0-passkeys');
      expect(node).toBeDefined();
      expect(node!.specs!['Standard']).toContain('FIDO2');
    });

    it('should have Auth0 Attack Protection with bot detection', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-auth0-attack-protection');
      expect(node).toBeDefined();
      expect(node!.specs!['Bot Detection']).toBeTruthy();
    });

    it('should have Auth0 Organizations for B2B multi-tenancy', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-auth0-organizations');
      expect(node).toBeDefined();
      expect(node!.specs!['Multi-Tenancy']).toContain('Per-organization');
    });

    it('should have Auth0 Actions as serverless pipeline', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-auth0-actions');
      expect(node).toBeDefined();
      expect(node!.specs!['Runtime']).toContain('Node.js');
    });
  });

  // -------------------------------------------------------------------------
  // Identity Governance deep-dive
  // -------------------------------------------------------------------------
  describe('Identity Governance products', () => {
    it('should have Access Requests module', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-access-requests');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Access Request');
    });

    it('should have Access Certifications module', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-access-certifications');
      expect(node).toBeDefined();
      expect(node!.specs!['Compliance Frameworks']).toContain('SOX');
    });

    it('should have Governance Reports module', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-governance-reports');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('Compliance');
    });
  });

  // -------------------------------------------------------------------------
  // Identity Security deep-dive
  // -------------------------------------------------------------------------
  describe('Identity Security products', () => {
    it('should have Identity Threat Protection with Okta AI', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-identity-threat-protection');
      expect(node).toBeDefined();
      expect(node!.architectureRole).toContain('ITDR');
    });

    it('should have ThreatInsight with IP reputation', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-threatinsight');
      expect(node).toBeDefined();
      expect(node!.specs!['Threat Intelligence']).toContain('IP reputation');
    });
  });

  // -------------------------------------------------------------------------
  // Search functionality
  // -------------------------------------------------------------------------
  describe('search', () => {
    it('should find Okta products by English name', () => {
      const results = searchNodes(oktaCatalog.products, 'Okta');
      expect(results.length).toBeGreaterThan(10);
    });

    it('should find products by Korean name (인증)', () => {
      const results = searchNodes(oktaCatalog.products, '인증');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find Auth0 products', () => {
      const results = searchNodes(oktaCatalog.products, 'Auth0');
      expect(results.length).toBeGreaterThanOrEqual(6);
    });

    it('should find SSO products by keyword', () => {
      const results = searchNodes(oktaCatalog.products, 'SSO');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find node by exact nodeId', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-adaptive-mfa');
      expect(node).toBeDefined();
      expect(node!.name).toBe('Okta Adaptive MFA');
    });
  });

  // -------------------------------------------------------------------------
  // Leaf node counts
  // -------------------------------------------------------------------------
  describe('leaf node counts', () => {
    it('should match countLeafNodes helper', () => {
      const count = countLeafNodes(oktaCatalog.products);
      const leaves = getLeafNodes(oktaCatalog.products);
      expect(count).toBe(leaves.length);
    });

    it('should have all leaf nodes at depth 2', () => {
      const leaves = getLeafNodes(oktaCatalog.products);
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
      const nodes = getNodesByDepth(oktaCatalog.products, 0);
      expect(nodes).toHaveLength(4);
    });

    it('should have 12 nodes at depth 1', () => {
      const nodes = getNodesByDepth(oktaCatalog.products, 1);
      expect(nodes).toHaveLength(12);
    });

    it('should have 18 nodes at depth 2', () => {
      const nodes = getNodesByDepth(oktaCatalog.products, 2);
      expect(nodes).toHaveLength(18);
    });
  });

  // -------------------------------------------------------------------------
  // Data quality validation
  // -------------------------------------------------------------------------
  describe('data quality validation', () => {
    describe('architecture planning fields', () => {
      it('should have architectureRole and architectureRoleKo pair completeness', () => {
        const allNodes = getAllNodes(oktaCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.architectureRole && !n.architectureRoleKo) ||
            (!n.architectureRole && n.architectureRoleKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor and recommendedForKo pair completeness', () => {
        const allNodes = getAllNodes(oktaCatalog.products);
        const mismatched = allNodes.filter(
          (n) =>
            (n.recommendedFor && !n.recommendedForKo) ||
            (!n.recommendedFor && n.recommendedForKo),
        );
        expect(mismatched.map((n) => n.nodeId)).toEqual([]);
      });

      it('should have recommendedFor with matching length in recommendedForKo', () => {
        const allNodes = getAllNodes(oktaCatalog.products);
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
        const allNodes = getAllNodes(oktaCatalog.products);
        for (const node of allNodes) {
          if (node.lifecycle) {
            expect(validValues.has(node.lifecycle)).toBe(true);
          }
        }
      });

      it('should have lifecycle set on all leaf nodes', () => {
        const leaves = getLeafNodes(oktaCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.lifecycle).toBeDefined();
        }
      });
    });

    describe('licensing and form factor', () => {
      it('should have licensingModel on all leaf nodes', () => {
        const leaves = getLeafNodes(oktaCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.licensingModel).toBeDefined();
        }
      });

      it('should have formFactor on all leaf nodes', () => {
        const leaves = getLeafNodes(oktaCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.formFactor).toBeDefined();
        }
      });

      it('should have all products as cloud form factor', () => {
        const leaves = getLeafNodes(oktaCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.formFactor).toBe('cloud');
        }
      });

      it('should have all products as subscription licensing', () => {
        const leaves = getLeafNodes(oktaCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.licensingModel).toBe('subscription');
        }
      });
    });

    describe('specs completeness', () => {
      it('should have specs on all leaf nodes', () => {
        const leaves = getLeafNodes(oktaCatalog.products);
        for (const leaf of leaves) {
          expect(leaf.specs).toBeDefined();
          expect(Object.keys(leaf.specs!).length).toBeGreaterThanOrEqual(5);
        }
      });
    });

    describe('coverage statistics', () => {
      it('should report infraNodeTypes coverage on all depth 0 and 1 nodes', () => {
        const allNodes = getAllNodes(oktaCatalog.products);
        const depth01 = allNodes.filter((n) => n.depth <= 1);
        const depth01WithTypes = depth01.filter(
          (n) => n.infraNodeTypes && n.infraNodeTypes.length > 0,
        );
        expect(depth01WithTypes.length).toBe(depth01.length);
      });

      it('should report architectureRole coverage on all depth 1 nodes', () => {
        const allNodes = getAllNodes(oktaCatalog.products);
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
    it('should have Okta SSO with SAML 2.0 and OIDC in supported protocols', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-sso');
      expect(node!.supportedProtocols).toContain('SAML 2.0');
      expect(node!.supportedProtocols).toContain('OIDC');
      expect(node!.supportedProtocols).toContain('OAuth 2.0');
    });

    it('should have Okta Adaptive MFA with 99.99% uptime SLA', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-adaptive-mfa');
      expect(node!.specs!['Uptime SLA']).toContain('99.99%');
    });

    it('should have Auth0 Universal Login with enterprise federation', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-auth0-universal-login');
      expect(node!.specs!['Federation Protocols']).toContain('SAML 2.0');
      expect(node!.specs!['Federation Protocols']).toContain('OIDC');
    });

    it('should have Okta Privileged Access with just-in-time access model', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-privileged-access');
      expect(node!.specs!['Access Model']).toContain('Just-in-time');
    });

    it('should have Identity Threat Protection with AI engine', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-identity-threat-protection');
      expect(node!.specs!['AI Engine']).toContain('Okta AI');
    });

    it('should have Access Certifications with compliance frameworks', () => {
      const node = findNodeById(oktaCatalog.products, 'okta-access-certifications');
      expect(node!.specs!['Compliance Frameworks']).toContain('SOX');
      expect(node!.specs!['Compliance Frameworks']).toContain('SOC 2');
      expect(node!.specs!['Compliance Frameworks']).toContain('HIPAA');
    });
  });
});
