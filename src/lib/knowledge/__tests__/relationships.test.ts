import { describe, it, expect } from 'vitest';
import {
  RELATIONSHIPS,
  getRelationshipsForComponent,
  getRelatedComponents,
  getMandatoryDependencies,
  getRecommendations,
  getConflicts,
} from '../relationships';

describe('relationships', () => {
  describe('RELATIONSHIPS registry', () => {
    it('should contain at least 45 relationships', () => {
      expect(RELATIONSHIPS.length).toBeGreaterThanOrEqual(45);
    });

    it('should have unique IDs', () => {
      const ids = RELATIONSHIPS.map((r) => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have trust metadata with at least one source on every entry', () => {
      for (const rel of RELATIONSHIPS) {
        expect(rel.trust).toBeDefined();
        expect(rel.trust.sources.length).toBeGreaterThanOrEqual(1);
        expect(rel.trust.confidence).toBeGreaterThan(0);
        expect(rel.trust.confidence).toBeLessThanOrEqual(1.0);
      }
    });

    it('should have bilingual reasons on every entry', () => {
      for (const rel of RELATIONSHIPS) {
        expect(rel.reason).toBeTruthy();
        expect(rel.reasonKo).toBeTruthy();
      }
    });

    it('should have tags on every entry', () => {
      for (const rel of RELATIONSHIPS) {
        expect(rel.tags.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('should have type "relationship" on every entry', () => {
      for (const rel of RELATIONSHIPS) {
        expect(rel.type).toBe('relationship');
      }
    });

    it('should be frozen (immutable)', () => {
      expect(Object.isFrozen(RELATIONSHIPS)).toBe(true);
    });
  });

  describe('relationship type distribution', () => {
    it('should have requires relationships', () => {
      const requires = RELATIONSHIPS.filter((r) => r.relationshipType === 'requires');
      expect(requires.length).toBeGreaterThanOrEqual(8);
    });

    it('should have recommends relationships', () => {
      const recommends = RELATIONSHIPS.filter((r) => r.relationshipType === 'recommends');
      expect(recommends.length).toBeGreaterThanOrEqual(15);
    });

    it('should have conflicts relationships', () => {
      const conflicts = RELATIONSHIPS.filter((r) => r.relationshipType === 'conflicts');
      expect(conflicts.length).toBeGreaterThanOrEqual(5);
    });

    it('should have protects and enhances relationships', () => {
      const protects = RELATIONSHIPS.filter((r) => r.relationshipType === 'protects');
      const enhances = RELATIONSHIPS.filter((r) => r.relationshipType === 'enhances');
      expect(protects.length).toBeGreaterThanOrEqual(3);
      expect(enhances.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('critical security relationships', () => {
    it('should mark db-server → internet as conflict', () => {
      const dbInternet = RELATIONSHIPS.find(
        (r) => r.source === 'db-server' && r.target === 'internet' && r.relationshipType === 'conflicts',
      );
      expect(dbInternet).toBeDefined();
      expect(dbInternet!.strength).toBe('mandatory');
    });

    it('should mark db-server → firewall as required', () => {
      const dbFirewall = RELATIONSHIPS.find(
        (r) => r.source === 'db-server' && r.target === 'firewall' && r.relationshipType === 'requires',
      );
      expect(dbFirewall).toBeDefined();
    });

    it('should mark web-server → waf as recommended', () => {
      const webWaf = RELATIONSHIPS.find(
        (r) => r.source === 'web-server' && r.target === 'waf' && r.relationshipType === 'recommends',
      );
      expect(webWaf).toBeDefined();
    });
  });

  describe('getRelationshipsForComponent', () => {
    it('should return relationships where component is source', () => {
      const rels = getRelationshipsForComponent('firewall');
      expect(rels.length).toBeGreaterThan(0);
      const asSrc = rels.filter((r) => r.source === 'firewall');
      expect(asSrc.length).toBeGreaterThan(0);
    });

    it('should return relationships where component is target', () => {
      const rels = getRelationshipsForComponent('firewall');
      const asTgt = rels.filter((r) => r.target === 'firewall');
      expect(asTgt.length).toBeGreaterThan(0);
    });

    it('should return empty for unknown component', () => {
      const rels = getRelationshipsForComponent('nonexistent' as never);
      expect(rels).toEqual([]);
    });
  });

  describe('getRelatedComponents', () => {
    it('should return unique related components with relationship info', () => {
      const related = getRelatedComponents('firewall');
      expect(related.length).toBeGreaterThan(0);
      for (const r of related) {
        expect(r.type).toBeTruthy();
        expect(r.relationship).toBeTruthy();
        expect(r.reason).toBeTruthy();
      }
    });
  });

  describe('getMandatoryDependencies', () => {
    it('should return requires relationships for db-server', () => {
      const deps = getMandatoryDependencies('db-server');
      expect(deps.length).toBeGreaterThanOrEqual(1);
      expect(deps.every((d) => d.relationshipType === 'requires')).toBe(true);
      expect(deps.some((d) => d.target === 'firewall')).toBe(true);
    });

    it('should return requires relationships for sso', () => {
      const deps = getMandatoryDependencies('sso');
      expect(deps.some((d) => d.target === 'ldap-ad')).toBe(true);
    });
  });

  describe('getRecommendations', () => {
    it('should return recommends relationships for web-server', () => {
      const recs = getRecommendations('web-server');
      expect(recs.length).toBeGreaterThanOrEqual(2);
      expect(recs.every((r) => r.relationshipType === 'recommends')).toBe(true);
    });
  });

  describe('getConflicts', () => {
    it('should return conflicts for db-server', () => {
      const conflicts = getConflicts('db-server');
      expect(conflicts.length).toBeGreaterThanOrEqual(1);
      expect(conflicts.every((c) => c.relationshipType === 'conflicts')).toBe(true);
      expect(conflicts.some((c) => c.target === 'internet')).toBe(true);
    });

    it('should return conflicts for cache', () => {
      const conflicts = getConflicts('cache');
      expect(conflicts.some((c) => c.target === 'internet')).toBe(true);
    });
  });
});
