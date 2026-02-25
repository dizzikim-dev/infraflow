import { describe, it, expect } from 'vitest';
import { FALLBACK_TEMPLATES, matchFallbackTemplate } from '../fallbackTemplates';

describe('fallbackTemplates', () => {
  // ---------------------------------------------------------------------------
  // FALLBACK_TEMPLATES constant
  // ---------------------------------------------------------------------------
  describe('FALLBACK_TEMPLATES', () => {
    it('contains all expected template keys', () => {
      expect(FALLBACK_TEMPLATES).toHaveProperty('3tier');
      expect(FALLBACK_TEMPLATES).toHaveProperty('web-secure');
      expect(FALLBACK_TEMPLATES).toHaveProperty('vdi');
      expect(FALLBACK_TEMPLATES).toHaveProperty('telecom');
      expect(FALLBACK_TEMPLATES).toHaveProperty('default');
    });

    it('has exactly 5 templates', () => {
      expect(Object.keys(FALLBACK_TEMPLATES)).toHaveLength(5);
    });

    it('every template has nodes and connections arrays', () => {
      for (const [key, template] of Object.entries(FALLBACK_TEMPLATES)) {
        expect(Array.isArray(template.nodes), `${key} should have nodes array`).toBe(true);
        expect(Array.isArray(template.connections), `${key} should have connections array`).toBe(true);
        expect(template.nodes.length, `${key} should have at least 1 node`).toBeGreaterThan(0);
        expect(template.connections.length, `${key} should have at least 1 connection`).toBeGreaterThan(0);
      }
    });

    it('every node has id, type, and label', () => {
      for (const [key, template] of Object.entries(FALLBACK_TEMPLATES)) {
        for (const node of template.nodes) {
          expect(node.id, `node in ${key} missing id`).toBeDefined();
          expect(node.type, `node in ${key} missing type`).toBeDefined();
          expect(node.label, `node in ${key} missing label`).toBeDefined();
        }
      }
    });

    it('every connection has source and target', () => {
      for (const [key, template] of Object.entries(FALLBACK_TEMPLATES)) {
        for (const conn of template.connections) {
          expect(conn.source, `conn in ${key} missing source`).toBeDefined();
          expect(conn.target, `conn in ${key} missing target`).toBeDefined();
        }
      }
    });

    it('3tier template contains load-balancer, web-server, app-server, db-server', () => {
      const types = FALLBACK_TEMPLATES['3tier'].nodes.map(n => n.type);
      expect(types).toContain('load-balancer');
      expect(types).toContain('web-server');
      expect(types).toContain('app-server');
      expect(types).toContain('db-server');
    });

    it('web-secure template contains firewall and waf', () => {
      const types = FALLBACK_TEMPLATES['web-secure'].nodes.map(n => n.type);
      expect(types).toContain('firewall');
      expect(types).toContain('waf');
    });

    it('vdi template contains vpn-gateway and ldap-ad', () => {
      const types = FALLBACK_TEMPLATES['vdi'].nodes.map(n => n.type);
      expect(types).toContain('vpn-gateway');
      expect(types).toContain('ldap-ad');
    });

    it('telecom template contains pe-router and dedicated-line', () => {
      const types = FALLBACK_TEMPLATES['telecom'].nodes.map(n => n.type);
      expect(types).toContain('pe-router');
      expect(types).toContain('dedicated-line');
    });
  });

  // ---------------------------------------------------------------------------
  // matchFallbackTemplate
  // ---------------------------------------------------------------------------
  describe('matchFallbackTemplate', () => {
    // VDI matching
    it('matches VDI template for "vdi" keyword', () => {
      const result = matchFallbackTemplate('Set up a VDI environment');
      expect(result).toBe(FALLBACK_TEMPLATES['vdi']);
    });

    it('matches VDI template for Korean "가상데스크톱" keyword', () => {
      const result = matchFallbackTemplate('가상데스크톱 환경 구성');
      expect(result).toBe(FALLBACK_TEMPLATES['vdi']);
    });

    // 3-tier matching
    it('matches 3tier template for "3-tier" keyword', () => {
      const result = matchFallbackTemplate('Build a 3-tier architecture');
      expect(result).toBe(FALLBACK_TEMPLATES['3tier']);
    });

    it('matches 3tier template for "three tier" keyword', () => {
      const result = matchFallbackTemplate('Deploy a three tier web app');
      expect(result).toBe(FALLBACK_TEMPLATES['3tier']);
    });

    it('matches 3tier template for Korean "3티어" keyword', () => {
      const result = matchFallbackTemplate('3티어 아키텍처 구축');
      expect(result).toBe(FALLBACK_TEMPLATES['3tier']);
    });

    // Web-secure matching
    it('matches web-secure template for "waf" keyword', () => {
      const result = matchFallbackTemplate('Add a WAF to the setup');
      expect(result).toBe(FALLBACK_TEMPLATES['web-secure']);
    });

    it('matches web-secure template for "secure" keyword', () => {
      const result = matchFallbackTemplate('I need a secure web setup');
      expect(result).toBe(FALLBACK_TEMPLATES['web-secure']);
    });

    it('matches web-secure template for Korean "보안" keyword', () => {
      const result = matchFallbackTemplate('보안 웹 아키텍처 설계');
      expect(result).toBe(FALLBACK_TEMPLATES['web-secure']);
    });

    // Telecom matching
    it('matches telecom template for "전용회선" keyword', () => {
      const result = matchFallbackTemplate('전용회선 구간 설계');
      expect(result).toBe(FALLBACK_TEMPLATES['telecom']);
    });

    it('matches telecom template for "dedicated line" keyword', () => {
      const result = matchFallbackTemplate('Set up a dedicated line connection');
      expect(result).toBe(FALLBACK_TEMPLATES['telecom']);
    });

    it('matches telecom template for "mpls" keyword', () => {
      const result = matchFallbackTemplate('Configure MPLS network');
      expect(result).toBe(FALLBACK_TEMPLATES['telecom']);
    });

    it('matches telecom template for "국사" keyword', () => {
      const result = matchFallbackTemplate('국사 연결 구성');
      expect(result).toBe(FALLBACK_TEMPLATES['telecom']);
    });

    it('matches telecom template for "5g 특화" keyword', () => {
      const result = matchFallbackTemplate('5g 특화 네트워크 구성');
      expect(result).toBe(FALLBACK_TEMPLATES['telecom']);
    });

    it('matches telecom template for "idc 이중화" keyword', () => {
      const result = matchFallbackTemplate('idc 이중화 아키텍처');
      expect(result).toBe(FALLBACK_TEMPLATES['telecom']);
    });

    // Default fallback
    it('returns default template for unrecognized prompt', () => {
      const result = matchFallbackTemplate('random infrastructure stuff');
      expect(result).toBe(FALLBACK_TEMPLATES['default']);
    });

    it('returns default template for empty prompt', () => {
      const result = matchFallbackTemplate('');
      expect(result).toBe(FALLBACK_TEMPLATES['default']);
    });

    // Case insensitivity
    it('matching is case-insensitive', () => {
      expect(matchFallbackTemplate('VDI SETUP')).toBe(FALLBACK_TEMPLATES['vdi']);
      expect(matchFallbackTemplate('WAF protection')).toBe(FALLBACK_TEMPLATES['web-secure']);
      expect(matchFallbackTemplate('Three Tier App')).toBe(FALLBACK_TEMPLATES['3tier']);
    });

    // Priority: VDI > 3tier > web-secure > telecom > default
    it('VDI keyword takes priority when combined with secure keyword', () => {
      // VDI check comes first in the code
      const result = matchFallbackTemplate('secure VDI environment');
      expect(result).toBe(FALLBACK_TEMPLATES['vdi']);
    });
  });
});
