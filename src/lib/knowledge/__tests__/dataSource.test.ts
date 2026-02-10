/**
 * Knowledge Data Source Tests
 *
 * Tests the StaticDataSource implementation and the factory function.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StaticDataSource } from '../staticDataSource';
import { getKnowledgeSource, resetKnowledgeSource } from '../getKnowledgeSource';

describe('StaticDataSource', () => {
  let ds: StaticDataSource;

  beforeEach(() => {
    ds = new StaticDataSource();
  });

  describe('getRelationships', () => {
    it('should return all relationships without filters', async () => {
      const rels = await ds.getRelationships();
      expect(rels.length).toBeGreaterThan(100);
    });

    it('should filter by component', async () => {
      const rels = await ds.getRelationships({ component: 'firewall' });
      expect(rels.length).toBeGreaterThan(0);
      rels.forEach((r) => {
        expect(r.source === 'firewall' || r.target === 'firewall').toBe(true);
      });
    });

    it('should filter by search', async () => {
      const rels = await ds.getRelationships({ search: 'firewall' });
      expect(rels.length).toBeGreaterThan(0);
    });

    it('should filter by tags', async () => {
      const rels = await ds.getRelationships({ tags: ['security'] });
      rels.forEach((r) => {
        expect(r.tags).toContain('security');
      });
    });
  });

  describe('getPatterns', () => {
    it('should return all patterns without filters', async () => {
      const pats = await ds.getPatterns();
      expect(pats.length).toBeGreaterThan(30);
    });

    it('should filter by search', async () => {
      const pats = await ds.getPatterns({ search: '3-tier' });
      expect(pats.length).toBeGreaterThan(0);
    });
  });

  describe('getAntiPatterns', () => {
    it('should return all anti-patterns without filters', async () => {
      const aps = await ds.getAntiPatterns();
      expect(aps.length).toBeGreaterThan(40);
    });

    it('should filter by search', async () => {
      const aps = await ds.getAntiPatterns({ search: 'database' });
      expect(aps.length).toBeGreaterThan(0);
    });

    it('should have detection functions', async () => {
      const aps = await ds.getAntiPatterns();
      aps.forEach((ap) => {
        expect(typeof ap.detection).toBe('function');
      });
    });
  });

  describe('getFailures', () => {
    it('should return all failures without filters', async () => {
      const fails = await ds.getFailures();
      expect(fails.length).toBeGreaterThan(60);
    });

    it('should filter by component', async () => {
      const fails = await ds.getFailures({ component: 'firewall' });
      expect(fails.length).toBeGreaterThan(0);
      fails.forEach((f) => {
        expect(f.component).toBe('firewall');
      });
    });
  });

  describe('getPerformanceProfiles', () => {
    it('should return all profiles without filters', async () => {
      const profs = await ds.getPerformanceProfiles();
      expect(profs.length).toBeGreaterThan(40);
    });

    it('should filter by component', async () => {
      const profs = await ds.getPerformanceProfiles({ component: 'firewall' });
      expect(profs.length).toBeGreaterThan(0);
      profs.forEach((p) => {
        expect(p.component).toBe('firewall');
      });
    });
  });

  describe('getVulnerabilities', () => {
    it('should return all vulnerabilities without filters', async () => {
      const vulns = await ds.getVulnerabilities();
      expect(vulns.length).toBeGreaterThan(40);
    });

    it('should filter by search', async () => {
      const vulns = await ds.getVulnerabilities({ search: 'SQL' });
      expect(vulns.length).toBeGreaterThan(0);
    });
  });

  describe('getCloudServices', () => {
    it('should return all cloud services without filters', async () => {
      const services = await ds.getCloudServices();
      expect(services.length).toBeGreaterThan(60);
    });

    it('should filter by search', async () => {
      const services = await ds.getCloudServices({ search: 'EC2' });
      expect(services.length).toBeGreaterThan(0);
    });
  });
});

describe('getKnowledgeSource factory', () => {
  afterEach(() => {
    resetKnowledgeSource();
    vi.unstubAllEnvs();
  });

  it('should return StaticDataSource by default', () => {
    const source = getKnowledgeSource();
    expect(source).toBeInstanceOf(StaticDataSource);
  });

  it('should cache the data source', () => {
    const source1 = getKnowledgeSource();
    const source2 = getKnowledgeSource();
    expect(source1).toBe(source2);
  });

  it('should reset cache', () => {
    const source1 = getKnowledgeSource();
    resetKnowledgeSource();
    const source2 = getKnowledgeSource();
    expect(source1).not.toBe(source2);
  });
});
