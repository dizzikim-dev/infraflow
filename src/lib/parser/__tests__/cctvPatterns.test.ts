import { describe, it, expect } from 'vitest';
import { detectNodeType, detectAllNodeTypes } from '../patterns';
import { getCategoryForType, getTierForType } from '@/lib/data/infrastructureDB';

describe('CCTV / Physical Security patterns', () => {
  describe('cctv-camera', () => {
    it.each([
      'CCTV',
      'cctv',
      '씨씨티비',
      '폐쇄회로',
      '감시 카메라',
      '방범 카메라',
      '보안 카메라',
    ])('should detect "%s" as cctv-camera', (input) => {
      const result = detectNodeType(input);
      expect(result).toBeDefined();
      expect(result!.type).toBe('cctv-camera');
    });

    it('should have category security', () => {
      expect(getCategoryForType('cctv-camera')).toBe('security');
    });

    it('should have tier internal', () => {
      expect(getTierForType('cctv-camera')).toBe('internal');
    });
  });

  describe('nvr', () => {
    it.each([
      'NVR',
      'nvr',
      '네트워크 비디오 레코더',
      '영상 녹화',
    ])('should detect "%s" as nvr', (input) => {
      const result = detectNodeType(input);
      expect(result).toBeDefined();
      expect(result!.type).toBe('nvr');
    });

    it('should have category security', () => {
      expect(getCategoryForType('nvr')).toBe('security');
    });
  });

  describe('video-server', () => {
    it.each([
      'VMS',
      'vms',
      '영상 관제',
      '비디오 관리',
      'video management',
    ])('should detect "%s" as video-server', (input) => {
      const result = detectNodeType(input);
      expect(result).toBeDefined();
      expect(result!.type).toBe('video-server');
    });
  });

  describe('access-control', () => {
    it.each([
      '출입 통제',
      '출입 관리',
      'access control system',
      '카드 리더',
    ])('should detect "%s" as access-control', (input) => {
      const result = detectNodeType(input);
      expect(result).toBeDefined();
      expect(result!.type).toBe('access-control');
    });

    it('should have category security', () => {
      expect(getCategoryForType('access-control')).toBe('security');
    });
  });

  describe('multiple component detection', () => {
    it('should detect CCTV and NVR in a combined prompt', () => {
      const results = detectAllNodeTypes('CCTV 카메라와 NVR을 연결');
      const types = results.map(r => r.type);
      expect(types).toContain('cctv-camera');
      expect(types).toContain('nvr');
    });
  });
});
