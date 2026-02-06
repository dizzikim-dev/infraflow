import { describe, it, expect } from 'vitest';
import {
  isInfraNodeData,
  isValidTier,
  isValidCategory,
  isValidNodeType,
  isPolicyRule,
  safeGetTier,
  safeGetZone,
} from '@/types/guards';

describe('Type Guards', () => {
  describe('isInfraNodeData', () => {
    it('should return true for valid InfraNodeData', () => {
      const validData = {
        label: 'Test Node',
        nodeType: 'firewall',
        category: 'security',
      };
      expect(isInfraNodeData(validData)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isInfraNodeData(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isInfraNodeData(undefined)).toBe(false);
    });

    it('should return false for missing label', () => {
      const invalidData = {
        nodeType: 'firewall',
        category: 'security',
      };
      expect(isInfraNodeData(invalidData)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(isInfraNodeData('string')).toBe(false);
      expect(isInfraNodeData(123)).toBe(false);
    });
  });

  describe('isValidTier', () => {
    it('should return true for valid tiers', () => {
      expect(isValidTier('external')).toBe(true);
      expect(isValidTier('dmz')).toBe(true);
      expect(isValidTier('internal')).toBe(true);
      expect(isValidTier('data')).toBe(true);
    });

    it('should return false for invalid tiers', () => {
      expect(isValidTier('invalid')).toBe(false);
      expect(isValidTier(null)).toBe(false);
      expect(isValidTier(undefined)).toBe(false);
    });
  });

  describe('isValidCategory', () => {
    it('should return true for valid categories', () => {
      expect(isValidCategory('security')).toBe(true);
      expect(isValidCategory('network')).toBe(true);
      expect(isValidCategory('compute')).toBe(true);
      expect(isValidCategory('storage')).toBe(true);
    });

    it('should return false for invalid categories', () => {
      expect(isValidCategory('invalid')).toBe(false);
    });
  });

  describe('isValidNodeType', () => {
    it('should return true for valid node types', () => {
      expect(isValidNodeType('firewall')).toBe(true);
      expect(isValidNodeType('waf')).toBe(true);
      expect(isValidNodeType('load-balancer')).toBe(true);
      expect(isValidNodeType('web-server')).toBe(true);
    });

    it('should return false for invalid node types', () => {
      expect(isValidNodeType('invalid-type')).toBe(false);
    });
  });

  describe('isPolicyRule', () => {
    it('should return true for valid policy rule', () => {
      const validRule = {
        id: '1',
        name: 'Test Rule',
        type: 'allow',
      };
      expect(isPolicyRule(validRule)).toBe(true);
    });

    it('should return false for invalid policy type', () => {
      const invalidRule = {
        id: '1',
        name: 'Test Rule',
        type: 'invalid',
      };
      expect(isPolicyRule(invalidRule)).toBe(false);
    });
  });

  describe('safeGetTier', () => {
    it('should return tier from valid data', () => {
      const data = {
        label: 'Test',
        nodeType: 'firewall',
        category: 'security',
        tier: 'dmz',
      };
      expect(safeGetTier(data)).toBe('dmz');
    });

    it('should return default "internal" for invalid data', () => {
      expect(safeGetTier(null)).toBe('internal');
      expect(safeGetTier({})).toBe('internal');
    });
  });

  describe('safeGetZone', () => {
    it('should return zone from valid data', () => {
      const data = {
        label: 'Test',
        nodeType: 'firewall',
        category: 'security',
        zone: 'dmz-zone',
      };
      expect(safeGetZone(data)).toBe('dmz-zone');
    });

    it('should return undefined for invalid data', () => {
      expect(safeGetZone(null)).toBeUndefined();
    });
  });
});
