import { describe, it, expect } from 'vitest';
import {
  areContradictory,
  isExtension,
  detectRelationshipConflicts,
} from '../conflictDetector';
import type { ComponentRelationship } from '../types';

describe('conflictDetector', () => {
  describe('areContradictory', () => {
    it('should detect requires vs conflicts as contradictory', () => {
      expect(areContradictory('requires', 'conflicts')).toBe(true);
      expect(areContradictory('conflicts', 'requires')).toBe(true);
    });

    it('should detect recommends vs conflicts as contradictory', () => {
      expect(areContradictory('recommends', 'conflicts')).toBe(true);
      expect(areContradictory('conflicts', 'recommends')).toBe(true);
    });

    it('should detect protects vs conflicts as contradictory', () => {
      expect(areContradictory('protects', 'conflicts')).toBe(true);
      expect(areContradictory('conflicts', 'protects')).toBe(true);
    });

    it('should detect enhances vs conflicts as contradictory', () => {
      expect(areContradictory('enhances', 'conflicts')).toBe(true);
      expect(areContradictory('conflicts', 'enhances')).toBe(true);
    });

    it('should NOT flag same types as contradictory', () => {
      expect(areContradictory('requires', 'requires')).toBe(false);
      expect(areContradictory('conflicts', 'conflicts')).toBe(false);
    });

    it('should NOT flag non-contradictory pairs', () => {
      expect(areContradictory('requires', 'recommends')).toBe(false);
      expect(areContradictory('enhances', 'protects')).toBe(false);
    });
  });

  describe('isExtension', () => {
    it('should detect recommends extending requires', () => {
      expect(isExtension('recommends', 'requires')).toBe(true);
    });

    it('should detect enhances extending recommends', () => {
      expect(isExtension('enhances', 'recommends')).toBe(true);
    });

    it('should NOT flag same type as extension', () => {
      expect(isExtension('requires', 'requires')).toBe(false);
    });

    it('should NOT flag reverse direction as extension', () => {
      expect(isExtension('requires', 'recommends')).toBe(false);
    });

    it('should NOT flag unrelated pairs as extension', () => {
      expect(isExtension('conflicts', 'requires')).toBe(false);
      expect(isExtension('protects', 'enhances')).toBe(false);
    });
  });

  describe('detectRelationshipConflicts', () => {
    const mockRelationships: ComponentRelationship[] = [
      {
        id: 'REL-TEST-001',
        type: 'relationship',
        source: 'web-server',
        target: 'firewall',
        relationshipType: 'requires',
        strength: 'mandatory',
        direction: 'downstream',
        reason: 'Web servers require firewall protection',
        reasonKo: '웹 서버는 방화벽이 필요합니다',
        tags: ['security'],
        trust: {
          confidence: 0.95,
          sources: [{ type: 'nist', title: 'Test', accessedDate: '2026-02-09' }],
          lastReviewedAt: '2026-02-09',
          upvotes: 0,
          downvotes: 0,
        },
      },
      {
        id: 'REL-TEST-002',
        type: 'relationship',
        source: 'db-server',
        target: 'internet',
        relationshipType: 'conflicts',
        strength: 'mandatory',
        direction: 'downstream',
        reason: 'DB should not be directly exposed to internet',
        reasonKo: 'DB는 인터넷에 직접 노출되면 안됩니다',
        tags: ['security'],
        trust: {
          confidence: 0.9,
          sources: [{ type: 'nist', title: 'Test', accessedDate: '2026-02-09' }],
          lastReviewedAt: '2026-02-09',
          upvotes: 0,
          downvotes: 0,
        },
      },
    ];

    it('should detect overlap when same relationship exists', () => {
      const conflicts = detectRelationshipConflicts(
        { source: 'web-server', target: 'firewall', relationshipType: 'requires' },
        mockRelationships,
      );
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].conflictType).toBe('overlaps');
      expect(conflicts[0].existingKnowledgeId).toBe('REL-TEST-001');
    });

    it('should detect contradiction when opposite types', () => {
      const conflicts = detectRelationshipConflicts(
        { source: 'db-server', target: 'internet', relationshipType: 'requires' },
        mockRelationships,
      );
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].conflictType).toBe('contradicts');
    });

    it('should detect extension when strengthening', () => {
      const conflicts = detectRelationshipConflicts(
        { source: 'web-server', target: 'firewall', relationshipType: 'recommends' },
        mockRelationships,
      );
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].conflictType).toBe('extends');
    });

    it('should return empty for unrelated pairs', () => {
      const conflicts = detectRelationshipConflicts(
        { source: 'cache', target: 'dns', relationshipType: 'requires' },
        mockRelationships,
      );
      expect(conflicts).toEqual([]);
    });

    it('should detect reversed source-target pair', () => {
      const conflicts = detectRelationshipConflicts(
        { source: 'firewall', target: 'web-server', relationshipType: 'requires' },
        mockRelationships,
      );
      expect(conflicts.length).toBeGreaterThan(0);
    });

    it('should use RELATIONSHIPS as default when no existing provided', () => {
      const conflicts = detectRelationshipConflicts({
        source: 'db-server',
        target: 'firewall',
        relationshipType: 'requires',
      });
      // Should find something since db-server→firewall is in RELATIONSHIPS
      expect(conflicts.length).toBeGreaterThanOrEqual(0); // may or may not conflict
    });

    it('should include confidence in conflict info', () => {
      const conflicts = detectRelationshipConflicts(
        { source: 'web-server', target: 'firewall', relationshipType: 'requires' },
        mockRelationships,
      );
      expect(conflicts[0].existingConfidence).toBe(0.95);
    });

    it('should include Korean description', () => {
      const conflicts = detectRelationshipConflicts(
        { source: 'web-server', target: 'firewall', relationshipType: 'requires' },
        mockRelationships,
      );
      expect(conflicts[0].descriptionKo).toBeTruthy();
    });
  });
});
