import { describe, it, expect } from 'vitest';
import { parsePromptLocal } from '../templateMatcher';
import { infraTemplates, templateKeywords } from '../templates';

describe('CCTV surveillance template', () => {
  describe('template existence and structure', () => {
    it('should have cctv-surveillance template', () => {
      expect(infraTemplates['cctv-surveillance']).toBeDefined();
    });

    it('should contain cctv-camera nodes', () => {
      const template = infraTemplates['cctv-surveillance'];
      const cctvNodes = template.nodes.filter(n => n.type === 'cctv-camera');
      expect(cctvNodes.length).toBeGreaterThanOrEqual(1);
    });

    it('should contain nvr node', () => {
      const template = infraTemplates['cctv-surveillance'];
      const nvrNodes = template.nodes.filter(n => n.type === 'nvr');
      expect(nvrNodes.length).toBe(1);
    });

    it('should contain video-server node', () => {
      const template = infraTemplates['cctv-surveillance'];
      const vmsNodes = template.nodes.filter(n => n.type === 'video-server');
      expect(vmsNodes.length).toBe(1);
    });

    it('should contain access-control node', () => {
      const template = infraTemplates['cctv-surveillance'];
      const acsNodes = template.nodes.filter(n => n.type === 'access-control');
      expect(acsNodes.length).toBe(1);
    });

    it('should have connections defined', () => {
      const template = infraTemplates['cctv-surveillance'];
      expect(template.connections.length).toBeGreaterThan(0);
    });

    it('should have zones defined', () => {
      const template = infraTemplates['cctv-surveillance'];
      expect(template.zones).toBeDefined();
      expect(template.zones!.length).toBeGreaterThan(0);
    });
  });

  describe('template keyword matching', () => {
    it('should have cctv-surveillance keywords', () => {
      expect(templateKeywords['cctv-surveillance']).toBeDefined();
      expect(templateKeywords['cctv-surveillance']).toContain('cctv');
    });
  });

  describe('prompt matching — core scenario', () => {
    it('should match "CCTV 회선 설치" to cctv-surveillance template', () => {
      const result = parsePromptLocal('CCTV 회선 설치');
      expect(result.success).toBe(true);
      expect(result.templateUsed).toBe('cctv-surveillance');
      expect(result.confidence).toBe(0.8);
      expect(result.isFallback).toBeUndefined();
    });

    it('should NOT produce a fallback for CCTV input', () => {
      const result = parsePromptLocal('CCTV 회선 설치');
      expect(result.isFallback).toBeUndefined();
      expect(result.success).toBe(true);
    });
  });

  describe('prompt matching — Korean variations', () => {
    it.each([
      '씨씨티비 시스템',
      '영상감시 구축',
      '영상관제 시스템',
      '폐쇄회로 설치',
      'cctv 회선',
      '감시 카메라 설치',
      '방범 시스템',
    ])('should match "%s" to cctv-surveillance template', (prompt) => {
      const result = parsePromptLocal(prompt);
      expect(result.success).toBe(true);
      expect(result.templateUsed).toBe('cctv-surveillance');
      expect(result.confidence).toBe(0.8);
    });
  });

  describe('prompt matching — English', () => {
    it('should match "cctv" keyword', () => {
      const result = parsePromptLocal('CCTV surveillance system');
      expect(result.success).toBe(true);
      expect(result.templateUsed).toBe('cctv-surveillance');
    });
  });

  describe('template nodes have correct types', () => {
    it('should have all node types matching InfraNodeType', () => {
      const template = infraTemplates['cctv-surveillance'];
      const validTypes = new Set([
        'cctv-camera', 'nvr', 'video-server', 'access-control',
        'switch-l2', 'storage',
      ]);
      for (const node of template.nodes) {
        expect(validTypes.has(node.type)).toBe(true);
      }
    });
  });
});
