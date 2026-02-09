import { describe, it, expect } from 'vitest';
import {
  PATTERNS,
  detectPatterns,
  getPatternById,
  getPatternsByComplexity,
} from '../patterns';
import type { InfraSpec } from '@/types/infra';

describe('patterns', () => {
  describe('PATTERNS registry', () => {
    it('should contain at least 15 patterns', () => {
      expect(PATTERNS.length).toBeGreaterThanOrEqual(15);
    });

    it('should have unique IDs', () => {
      const ids = PATTERNS.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have bilingual names and descriptions', () => {
      for (const pattern of PATTERNS) {
        expect(pattern.name).toBeTruthy();
        expect(pattern.nameKo).toBeTruthy();
        expect(pattern.description).toBeTruthy();
        expect(pattern.descriptionKo).toBeTruthy();
      }
    });

    it('should have trust metadata with sources on every entry', () => {
      for (const pattern of PATTERNS) {
        expect(pattern.trust).toBeDefined();
        expect(pattern.trust.sources.length).toBeGreaterThanOrEqual(1);
        expect(pattern.trust.confidence).toBeGreaterThan(0);
      }
    });

    it('should have requiredComponents on every entry', () => {
      for (const pattern of PATTERNS) {
        expect(pattern.requiredComponents.length).toBeGreaterThanOrEqual(1);
        for (const comp of pattern.requiredComponents) {
          expect(comp.type).toBeTruthy();
          expect(comp.minCount).toBeGreaterThanOrEqual(1);
        }
      }
    });

    it('should have valid complexity values (1-5)', () => {
      for (const pattern of PATTERNS) {
        expect(pattern.complexity).toBeGreaterThanOrEqual(1);
        expect(pattern.complexity).toBeLessThanOrEqual(5);
      }
    });

    it('should have type "pattern" on every entry', () => {
      for (const pattern of PATTERNS) {
        expect(pattern.type).toBe('pattern');
      }
    });

    it('should be frozen (immutable)', () => {
      expect(Object.isFrozen(PATTERNS)).toBe(true);
    });

    it('should have tags on every entry', () => {
      for (const pattern of PATTERNS) {
        expect(pattern.tags.length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe('specific patterns', () => {
    it('should include 3-tier web architecture', () => {
      const threeTier = PATTERNS.find((p) => p.id === 'PAT-001');
      expect(threeTier).toBeDefined();
      expect(threeTier!.requiredComponents).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'web-server' }),
          expect.objectContaining({ type: 'app-server' }),
          expect.objectContaining({ type: 'db-server' }),
        ]),
      );
    });

    it('should include defense in depth', () => {
      const did = PATTERNS.find((p) => p.name.toLowerCase().includes('defense'));
      expect(did).toBeDefined();
      expect(did!.complexity).toBeGreaterThanOrEqual(3);
    });

    it('should include zero trust', () => {
      const zt = PATTERNS.find((p) => p.name.toLowerCase().includes('zero trust'));
      expect(zt).toBeDefined();
    });
  });

  describe('detectPatterns', () => {
    it('should detect 3-tier architecture', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'ws-1', type: 'web-server', label: 'Web' },
          { id: 'as-1', type: 'app-server', label: 'App' },
          { id: 'db-1', type: 'db-server', label: 'DB' },
        ],
        connections: [],
      };
      const detected = detectPatterns(spec);
      const ids = detected.map((p) => p.id);
      expect(ids).toContain('PAT-001');
    });

    it('should detect 2-tier but not 3-tier when no app-server', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'ws-1', type: 'web-server', label: 'Web' },
          { id: 'db-1', type: 'db-server', label: 'DB' },
        ],
        connections: [],
      };
      const detected = detectPatterns(spec);
      const ids = detected.map((p) => p.id);
      expect(ids).toContain('PAT-002');
      expect(ids).not.toContain('PAT-001');
    });

    it('should detect load-balanced architecture', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'lb-1', type: 'load-balancer', label: 'LB' },
          { id: 'ws-1', type: 'web-server', label: 'Web 1' },
          { id: 'ws-2', type: 'web-server', label: 'Web 2' },
        ],
        connections: [],
      };
      const detected = detectPatterns(spec);
      const ids = detected.map((p) => p.id);
      expect(ids).toContain('PAT-004');
    });

    it('should return empty for empty spec', () => {
      const spec: InfraSpec = { nodes: [], connections: [] };
      const detected = detectPatterns(spec);
      expect(detected).toEqual([]);
    });

    it('should sort results by complexity ascending', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'fw-1', type: 'firewall', label: 'FW' },
          { id: 'waf-1', type: 'waf', label: 'WAF' },
          { id: 'lb-1', type: 'load-balancer', label: 'LB' },
          { id: 'ws-1', type: 'web-server', label: 'Web 1' },
          { id: 'ws-2', type: 'web-server', label: 'Web 2' },
          { id: 'as-1', type: 'app-server', label: 'App' },
          { id: 'db-1', type: 'db-server', label: 'DB' },
        ],
        connections: [],
      };
      const detected = detectPatterns(spec);
      for (let i = 1; i < detected.length; i++) {
        expect(detected[i].complexity).toBeGreaterThanOrEqual(detected[i - 1].complexity);
      }
    });

    it('should detect multiple patterns for complex architecture', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'fw-1', type: 'firewall', label: 'FW' },
          { id: 'waf-1', type: 'waf', label: 'WAF' },
          { id: 'lb-1', type: 'load-balancer', label: 'LB' },
          { id: 'ws-1', type: 'web-server', label: 'Web 1' },
          { id: 'ws-2', type: 'web-server', label: 'Web 2' },
          { id: 'as-1', type: 'app-server', label: 'App' },
          { id: 'db-1', type: 'db-server', label: 'DB' },
          { id: 'cache-1', type: 'cache', label: 'Cache' },
          { id: 'backup-1', type: 'backup', label: 'Backup' },
        ],
        connections: [],
      };
      const detected = detectPatterns(spec);
      expect(detected.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('getPatternById', () => {
    it('should return pattern for valid ID', () => {
      const pattern = getPatternById('PAT-001');
      expect(pattern).toBeDefined();
      expect(pattern!.id).toBe('PAT-001');
    });

    it('should return undefined for invalid ID', () => {
      const pattern = getPatternById('PAT-999');
      expect(pattern).toBeUndefined();
    });
  });

  describe('getPatternsByComplexity', () => {
    it('should return only patterns at or below specified complexity', () => {
      const simple = getPatternsByComplexity(2);
      expect(simple.length).toBeGreaterThan(0);
      for (const p of simple) {
        expect(p.complexity).toBeLessThanOrEqual(2);
      }
    });

    it('should return all patterns for complexity 5', () => {
      const all = getPatternsByComplexity(5);
      expect(all.length).toBe(PATTERNS.length);
    });

    it('should return empty for complexity 0', () => {
      const none = getPatternsByComplexity(0);
      expect(none).toEqual([]);
    });

    it('should sort by complexity ascending', () => {
      const patterns = getPatternsByComplexity(5);
      for (let i = 1; i < patterns.length; i++) {
        expect(patterns[i].complexity).toBeGreaterThanOrEqual(patterns[i - 1].complexity);
      }
    });
  });

  describe('evolution graph', () => {
    it('should have valid evolvesTo references', () => {
      const allIds = new Set(PATTERNS.map((p) => p.id));
      for (const pattern of PATTERNS) {
        for (const targetId of pattern.evolvesTo) {
          expect(allIds.has(targetId)).toBe(true);
        }
      }
    });

    it('should have valid evolvesFrom references', () => {
      const allIds = new Set(PATTERNS.map((p) => p.id));
      for (const pattern of PATTERNS) {
        for (const sourceId of pattern.evolvesFrom) {
          expect(allIds.has(sourceId)).toBe(true);
        }
      }
    });
  });
});
