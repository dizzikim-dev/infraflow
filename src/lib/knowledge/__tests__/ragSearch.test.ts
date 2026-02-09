import { describe, it, expect, beforeAll } from 'vitest';
import type { InfraNodeType } from '@/types/infra';
import {
  buildSearchIndex,
  searchKnowledge,
  searchByComponent,
  searchByTag,
  getRelatedKnowledge,
} from '../ragSearch';
import type { SearchIndex, SearchResult, SearchOptions } from '../ragSearch';

describe('ragSearch', () => {
  let index: SearchIndex;

  beforeAll(() => {
    index = buildSearchIndex();
  });

  // -------------------------------------------------------------------------
  // buildSearchIndex
  // -------------------------------------------------------------------------

  describe('buildSearchIndex', () => {
    it('should build index from all knowledge data', () => {
      expect(index).toBeDefined();
      expect(index.size).toBeGreaterThan(0);
      expect(index.entries.size).toBe(index.size);
    });

    it('should include all knowledge types', () => {
      const types = new Set<string>();
      for (const entry of index.entries.values()) {
        types.add(entry.type);
      }
      expect(types.has('relationship')).toBe(true);
      expect(types.has('pattern')).toBe(true);
      expect(types.has('antipattern')).toBe(true);
      expect(types.has('failure')).toBe(true);
      expect(types.has('performance')).toBe(true);
    });

    it('should have a non-empty inverted index', () => {
      expect(index.invertedIndex.size).toBeGreaterThan(0);
    });

    it('should have a non-empty component index', () => {
      expect(index.componentIndex.size).toBeGreaterThan(0);
    });

    it('should have a non-empty tag index', () => {
      expect(index.tagIndex.size).toBeGreaterThan(0);
    });

    it('should index firewall component', () => {
      const firewallIds = index.componentIndex.get('firewall');
      expect(firewallIds).toBeDefined();
      expect(firewallIds!.size).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------------------
  // searchKnowledge
  // -------------------------------------------------------------------------

  describe('searchKnowledge', () => {
    it('should find relationships by English keyword "firewall"', () => {
      const results = searchKnowledge('firewall');
      expect(results.length).toBeGreaterThan(0);
      // At least some results should be about firewall
      const hasFirewall = results.some(
        (r) => r.title.toLowerCase().includes('firewall') || r.tags.includes('firewall'),
      );
      expect(hasFirewall).toBe(true);
    });

    it('should find by Korean keyword "방화벽"', () => {
      const results = searchKnowledge('방화벽');
      expect(results.length).toBeGreaterThan(0);
      // Results should include entries with Korean text about firewalls
      const hasKoreanMatch = results.some(
        (r) => r.titleKo.includes('방화벽') || r.summaryKo.includes('방화벽'),
      );
      expect(hasKoreanMatch).toBe(true);
    });

    it('should find patterns by keyword "3-tier"', () => {
      const results = searchKnowledge('3-tier');
      expect(results.length).toBeGreaterThan(0);
      const hasPattern = results.some((r) => r.type === 'pattern');
      expect(hasPattern).toBe(true);
    });

    it('should find anti-patterns by keyword "database internet"', () => {
      const results = searchKnowledge('database internet exposure');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should filter by type - relationships only', () => {
      const results = searchKnowledge('firewall', {
        types: ['relationship'],
      });
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        expect(r.type).toBe('relationship');
      }
    });

    it('should filter by type - patterns only', () => {
      const results = searchKnowledge('web architecture', {
        types: ['pattern'],
      });
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        expect(r.type).toBe('pattern');
      }
    });

    it('should filter by type - antipattern only', () => {
      const results = searchKnowledge('security', {
        types: ['antipattern'],
      });
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        expect(r.type).toBe('antipattern');
      }
    });

    it('should filter by type - failure only', () => {
      const results = searchKnowledge('firewall', {
        types: ['failure'],
      });
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        expect(r.type).toBe('failure');
      }
    });

    it('should filter by type - performance only', () => {
      const results = searchKnowledge('firewall', {
        types: ['performance'],
      });
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        expect(r.type).toBe('performance');
      }
    });

    it('should filter by components', () => {
      const results = searchKnowledge('security', {
        components: ['waf'],
      });
      expect(results.length).toBeGreaterThan(0);
      // All results should involve WAF
      for (const r of results) {
        const indexed = index.entries.get(r.id);
        expect(indexed).toBeDefined();
        expect(indexed!.components.includes('waf')).toBe(true);
      }
    });

    it('should filter by tags', () => {
      const results = searchKnowledge('network', {
        tags: ['security'],
      });
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        expect(r.tags.includes('security')).toBe(true);
      }
    });

    it('should respect limit', () => {
      const results = searchKnowledge('firewall', { limit: 3 });
      expect(results.length).toBeLessThanOrEqual(3);
    });

    it('should respect minScore', () => {
      const resultsLow = searchKnowledge('firewall', { minScore: 0.01 });
      const resultsHigh = searchKnowledge('firewall', { minScore: 0.9 });
      // Higher minScore should return fewer or equal results
      expect(resultsHigh.length).toBeLessThanOrEqual(resultsLow.length);
      // All high-minScore results should have score >= 0.9
      for (const r of resultsHigh) {
        expect(r.score).toBeGreaterThanOrEqual(0.9);
      }
    });

    it('should return empty for no matches', () => {
      const results = searchKnowledge('xyznonexistent12345');
      expect(results.length).toBe(0);
    });

    it('should return empty for empty query', () => {
      const results = searchKnowledge('');
      expect(results.length).toBe(0);
    });

    it('should return empty for whitespace-only query', () => {
      const results = searchKnowledge('   ');
      expect(results.length).toBe(0);
    });

    it('should rank exact matches higher', () => {
      const results = searchKnowledge('firewall');
      expect(results.length).toBeGreaterThan(1);
      // First result should have score >= second result
      expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
      // The top result should be highly related to firewall
      const topResult = results[0];
      const isFirewallRelated =
        topResult.title.toLowerCase().includes('firewall') ||
        topResult.tags.includes('firewall');
      expect(isFirewallRelated).toBe(true);
    });

    it('should boost by confidence', () => {
      // Search for something present across entries with varying confidence
      const results = searchKnowledge('firewall security');
      expect(results.length).toBeGreaterThan(0);
      // Results should all have a score between 0 and 1
      for (const r of results) {
        expect(r.score).toBeGreaterThanOrEqual(0);
        expect(r.score).toBeLessThanOrEqual(1);
      }
    });

    it('should handle Korean query "로드밸런서"', () => {
      const results = searchKnowledge('로드밸런서');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle mixed Korean/English query', () => {
      const results = searchKnowledge('WAF 보안');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find failure scenarios by Korean keyword "장애"', () => {
      const results = searchKnowledge('장애');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return results sorted by score descending', () => {
      const results = searchKnowledge('firewall');
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });

    it('should have valid score range 0-1 for all results', () => {
      const results = searchKnowledge('security');
      for (const r of results) {
        expect(r.score).toBeGreaterThanOrEqual(0);
        expect(r.score).toBeLessThanOrEqual(1);
      }
    });

    it('should combine type and component filters', () => {
      const results = searchKnowledge('security', {
        types: ['relationship'],
        components: ['firewall'],
      });
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        expect(r.type).toBe('relationship');
      }
    });

    it('should find performance profiles by "성능"', () => {
      const results = searchKnowledge('성능');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------------------
  // searchByComponent
  // -------------------------------------------------------------------------

  describe('searchByComponent', () => {
    it('should return all knowledge for firewall component', () => {
      const results = searchByComponent('firewall' as InfraNodeType);
      expect(results.length).toBeGreaterThan(0);
      // Should include multiple types (relationships, failures, performance, etc.)
      const types = new Set(results.map((r) => r.type));
      expect(types.size).toBeGreaterThan(1);
    });

    it('should return all knowledge for web-server component', () => {
      const results = searchByComponent('web-server' as InfraNodeType);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return results sorted by confidence', () => {
      const results = searchByComponent('firewall' as InfraNodeType);
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].confidence).toBeGreaterThanOrEqual(results[i].confidence);
      }
    });

    it('should return empty for unknown component', () => {
      const results = searchByComponent('nonexistent-component' as InfraNodeType);
      expect(results.length).toBe(0);
    });

    it('should include relationships, failures, and performance for db-server', () => {
      const results = searchByComponent('db-server' as InfraNodeType);
      const types = new Set(results.map((r) => r.type));
      expect(types.has('relationship')).toBe(true);
      expect(types.has('failure')).toBe(true);
      expect(types.has('performance')).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // searchByTag
  // -------------------------------------------------------------------------

  describe('searchByTag', () => {
    it('should return entries with matching tag "security"', () => {
      const results = searchByTag('security');
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        expect(r.tags.includes('security')).toBe(true);
      }
    });

    it('should return entries with matching tag "performance"', () => {
      const results = searchByTag('performance');
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        expect(r.tags.includes('performance')).toBe(true);
      }
    });

    it('should return empty for non-existent tag', () => {
      const results = searchByTag('nonexistenttag12345');
      expect(results.length).toBe(0);
    });

    it('should return results sorted by confidence', () => {
      const results = searchByTag('security');
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].confidence).toBeGreaterThanOrEqual(results[i].confidence);
      }
    });

    it('should handle case-insensitive tags', () => {
      const resultsLower = searchByTag('security');
      const resultsUpper = searchByTag('Security');
      expect(resultsLower.length).toBe(resultsUpper.length);
    });
  });

  // -------------------------------------------------------------------------
  // getRelatedKnowledge
  // -------------------------------------------------------------------------

  describe('getRelatedKnowledge', () => {
    it('should find entries sharing components with REL-SEC-001', () => {
      const results = getRelatedKnowledge('REL-SEC-001');
      expect(results.length).toBeGreaterThan(0);
      // REL-SEC-001 is db-server requires firewall, so related entries
      // should include other entries involving db-server or firewall
    });

    it('should find entries sharing tags', () => {
      const results = getRelatedKnowledge('PAT-001');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty for unknown id', () => {
      const results = getRelatedKnowledge('NONEXISTENT-999');
      expect(results.length).toBe(0);
    });

    it('should not include the source entry itself', () => {
      const results = getRelatedKnowledge('REL-SEC-001');
      const selfIncluded = results.some((r) => r.id === 'REL-SEC-001');
      expect(selfIncluded).toBe(false);
    });

    it('should return results sorted by relevance score descending', () => {
      const results = getRelatedKnowledge('REL-SEC-001');
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });

    it('should find related entries for a failure scenario', () => {
      const results = getRelatedKnowledge('FAIL-NET-001');
      expect(results.length).toBeGreaterThan(0);
      // FAIL-NET-001 is about firewall, so related entries should exist
    });

    it('should find related entries for a performance profile', () => {
      const results = getRelatedKnowledge('PERF-SEC-001');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------------------
  // Lazy initialization
  // -------------------------------------------------------------------------

  describe('lazy initialization', () => {
    it('should work without explicitly calling buildSearchIndex', () => {
      // searchKnowledge should lazily build the index
      const results = searchKnowledge('firewall');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------------------
  // SearchResult structure
  // -------------------------------------------------------------------------

  describe('SearchResult structure', () => {
    it('should have all required fields', () => {
      const results = searchKnowledge('firewall');
      expect(results.length).toBeGreaterThan(0);
      const r = results[0];
      expect(r.id).toBeDefined();
      expect(typeof r.id).toBe('string');
      expect(r.type).toBeDefined();
      expect(typeof r.score).toBe('number');
      expect(r.title).toBeDefined();
      expect(typeof r.title).toBe('string');
      expect(r.titleKo).toBeDefined();
      expect(typeof r.titleKo).toBe('string');
      expect(r.summary).toBeDefined();
      expect(typeof r.summary).toBe('string');
      expect(r.summaryKo).toBeDefined();
      expect(typeof r.summaryKo).toBe('string');
      expect(Array.isArray(r.tags)).toBe(true);
      expect(typeof r.confidence).toBe('number');
      expect(r.entry).toBeDefined();
    });

    it('should have confidence between 0 and 1', () => {
      const results = searchKnowledge('security');
      for (const r of results) {
        expect(r.confidence).toBeGreaterThan(0);
        expect(r.confidence).toBeLessThanOrEqual(1);
      }
    });
  });
});
