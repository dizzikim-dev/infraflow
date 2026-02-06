import { describe, it, expect } from 'vitest';
import {
  nodeTypePatterns,
  commandPatterns,
  detectNodeType,
  detectAllNodeTypes,
  detectCommandType,
} from '@/lib/parser/patterns';

describe('Parser Patterns', () => {
  describe('nodeTypePatterns', () => {
    it('should have patterns for all major infrastructure components', () => {
      expect(nodeTypePatterns.length).toBeGreaterThan(30);
    });

    it('should have unique types', () => {
      const types = nodeTypePatterns.map(p => p.type);
      const uniqueTypes = new Set(types);
      expect(types.length).toBe(uniqueTypes.size);
    });
  });

  describe('detectNodeType', () => {
    it('should detect firewall from Korean', () => {
      const result = detectNodeType('방화벽 추가해줘');
      expect(result?.type).toBe('firewall');
    });

    it('should detect firewall from English', () => {
      const result = detectNodeType('add firewall');
      expect(result?.type).toBe('firewall');
    });

    it('should detect WAF', () => {
      const result = detectNodeType('WAF');
      expect(result?.type).toBe('waf');
    });

    it('should detect load balancer', () => {
      const result = detectNodeType('로드밸런서');
      expect(result?.type).toBe('load-balancer');
    });

    it('should detect database', () => {
      const result = detectNodeType('데이터베이스');
      expect(result?.type).toBe('db-server');
    });

    it('should return undefined for unknown text', () => {
      const result = detectNodeType('asdfghjkl');
      expect(result).toBeUndefined();
    });
  });

  describe('detectAllNodeTypes', () => {
    it('should detect multiple node types in text', () => {
      const result = detectAllNodeTypes('방화벽, 로드밸런서, 웹서버 구성');
      expect(result.length).toBeGreaterThanOrEqual(3);
      expect(result.some(p => p.type === 'firewall')).toBe(true);
      expect(result.some(p => p.type === 'load-balancer')).toBe(true);
      expect(result.some(p => p.type === 'web-server')).toBe(true);
    });
  });

  describe('detectCommandType', () => {
    it('should detect add command', () => {
      expect(detectCommandType('WAF 추가해줘')).toBe('add');
      expect(detectCommandType('add firewall')).toBe('add');
    });

    it('should detect remove command', () => {
      expect(detectCommandType('방화벽 삭제해줘')).toBe('remove');
      expect(detectCommandType('remove firewall')).toBe('remove');
    });

    it('should detect connect command', () => {
      expect(detectCommandType('서버 연결해줘')).toBe('connect');
    });

    it('should detect query command', () => {
      expect(detectCommandType('방화벽이 뭐야?')).toBe('query');
    });

    it('should default to create for unknown commands', () => {
      expect(detectCommandType('3티어 웹 아키텍처')).toBe('create');
    });
  });
});
