/**
 * Detection Registry Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getDetectionFunction,
  hasDetectionRule,
  getAllDetectionRuleIds,
  getDetectionRuleCount,
  runDetection,
} from '../detectionRegistry';
import { ANTI_PATTERNS } from '../antipatterns';
import type { InfraSpec } from '@/types/infra';

describe('detectionRegistry', () => {
  describe('registry initialization', () => {
    it('should register all antipattern detection functions', () => {
      expect(getDetectionRuleCount()).toBe(ANTI_PATTERNS.length);
    });

    it('should have all antipattern IDs registered', () => {
      const ruleIds = getAllDetectionRuleIds();
      for (const ap of ANTI_PATTERNS) {
        expect(ruleIds).toContain(ap.id);
      }
    });
  });

  describe('getDetectionFunction', () => {
    it('should return a function for valid rule IDs', () => {
      const fn = getDetectionFunction('AP-SEC-001');
      expect(fn).toBeTypeOf('function');
    });

    it('should return undefined for unknown rule IDs', () => {
      const fn = getDetectionFunction('UNKNOWN-001');
      expect(fn).toBeUndefined();
    });
  });

  describe('hasDetectionRule', () => {
    it('should return true for registered IDs', () => {
      expect(hasDetectionRule('AP-SEC-001')).toBe(true);
      expect(hasDetectionRule('AP-HA-001')).toBe(true);
    });

    it('should return false for unregistered IDs', () => {
      expect(hasDetectionRule('FAKE-001')).toBe(false);
    });
  });

  describe('runDetection', () => {
    const emptySpec: InfraSpec = { nodes: [], connections: [] };

    it('should return false for unknown rule IDs', () => {
      expect(runDetection('UNKNOWN', emptySpec)).toBe(false);
    });

    it('should execute detection function and return result', () => {
      // AP-SEC-001 checks for db-server directly connected to internet
      // Empty spec should return false (no db-server, no internet)
      expect(runDetection('AP-SEC-001', emptySpec)).toBe(false);
    });

    it('should detect anti-pattern when conditions are met', () => {
      // AP-SEC-001: DB direct internet exposure
      const unsafeSpec: InfraSpec = {
        nodes: [
          { id: 'db-1', type: 'db-server', label: 'DB' },
          { id: 'inet-1', type: 'internet', label: 'Internet' },
        ],
        connections: [
          { source: 'db-1', target: 'inet-1', label: 'direct' },
        ],
      };
      expect(runDetection('AP-SEC-001', unsafeSpec)).toBe(true);
    });
  });

  describe('getAllDetectionRuleIds', () => {
    it('should return an array of strings', () => {
      const ids = getAllDetectionRuleIds();
      expect(Array.isArray(ids)).toBe(true);
      expect(ids.length).toBeGreaterThan(0);
      ids.forEach((id) => expect(typeof id).toBe('string'));
    });

    it('should include known antipattern IDs', () => {
      const ids = getAllDetectionRuleIds();
      expect(ids).toContain('AP-SEC-001');
      expect(ids).toContain('AP-HA-001');
      expect(ids).toContain('AP-PERF-001');
      expect(ids).toContain('AP-ARCH-001');
    });
  });
});
