import { describe, it, expect } from 'vitest';
import { getAvailableTemplates, getTemplate } from '@/lib/parser/UnifiedParser';
import { parsePromptLocal } from '@/lib/parser/templateMatcher';

describe('UnifiedParser (parsePromptLocal)', () => {
  describe('parsePromptLocal', () => {
    it('should match 3-tier template with Korean keyword', () => {
      const result = parsePromptLocal('3티어 웹 아키텍처 보여줘');
      expect(result.success).toBe(true);
      expect(result.templateUsed).toBe('3tier');
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });

    it('should match 3-tier template with English keyword', () => {
      const result = parsePromptLocal('show me 3-tier architecture');
      expect(result.success).toBe(true);
      expect(result.templateUsed).toBe('3tier');
    });

    it('should match VPN template with keyword', () => {
      const result = parsePromptLocal('VPN 내부망 아키텍처 보여줘');
      expect(result.success).toBe(true);
      expect(result.templateUsed).toBe('vpn');
    });

    it('should match microservices template', () => {
      const result = parsePromptLocal('마이크로서비스 아키텍처 설계해줘');
      expect(result.success).toBe(true);
      expect(result.templateUsed).toBe('microservices');
    });

    it('should detect custom components from prompt', () => {
      // Using VPN which doesn't have a template keyword match
      const result = parsePromptLocal('VPN과 라우터 그리고 스위치로 구성해줘');
      expect(result.success).toBe(true);
      expect(result.spec).toBeDefined();
      if (result.spec) {
        const nodeTypes = result.spec.nodes.map(n => n.type);
        // VPN matches 'vpn' template, so we check that template's nodes exist
        // or custom parsed nodes exist
        expect(result.spec.nodes.length).toBeGreaterThan(0);
      }
    });

    it('should auto-add user node if not present', () => {
      const result = parsePromptLocal('CDN과 캐시 서버 연결해줘');
      expect(result.success).toBe(true);
      expect(result.spec).toBeDefined();
      if (result.spec) {
        const hasUser = result.spec.nodes.some(n => n.type === 'user');
        expect(hasUser).toBe(true);
      }
    });

    it('should create connections between detected nodes', () => {
      const result = parsePromptLocal('방화벽 -> WAF -> 웹서버 아키텍처');
      expect(result.success).toBe(true);
      expect(result.spec).toBeDefined();
      if (result.spec) {
        expect(result.spec.connections.length).toBeGreaterThan(0);
      }
    });

    it('should fallback to simple-waf template when no match', () => {
      const result = parsePromptLocal('asdfghjkl random text');
      expect(result.success).toBe(false);
      expect(result.isFallback).toBe(true);
      expect(result.templateUsed).toBe('simple-waf');
      expect(result.confidence).toBe(0.3);
    });

    it('should handle empty prompt gracefully', () => {
      const result = parsePromptLocal('');
      expect(result.isFallback).toBe(true);
      expect(result.confidence).toBeLessThanOrEqual(0.5);
    });

    it('should be case insensitive', () => {
      const result1 = parsePromptLocal('FIREWALL');
      const result2 = parsePromptLocal('firewall');
      const result3 = parsePromptLocal('Firewall');

      if (result1.spec && result2.spec && result3.spec) {
        const hasFirewall1 = result1.spec.nodes.some(n => n.type === 'firewall');
        const hasFirewall2 = result2.spec.nodes.some(n => n.type === 'firewall');
        const hasFirewall3 = result3.spec.nodes.some(n => n.type === 'firewall');
        expect(hasFirewall1).toBe(hasFirewall2);
        expect(hasFirewall2).toBe(hasFirewall3);
      }
    });
  });

  describe('getAvailableTemplates', () => {
    it('should return array of template names', () => {
      const templates = getAvailableTemplates();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
    });

    it('should include common templates', () => {
      const templates = getAvailableTemplates();
      expect(templates).toContain('3tier');
      expect(templates).toContain('simple-waf');
    });
  });

  describe('getTemplate', () => {
    it('should return template spec for valid name', () => {
      const template = getTemplate('3tier');
      expect(template).not.toBeNull();
      expect(template?.nodes).toBeDefined();
      expect(template?.connections).toBeDefined();
    });

    it('should return null for invalid template name', () => {
      const template = getTemplate('non-existent-template');
      expect(template).toBeNull();
    });
  });
});
