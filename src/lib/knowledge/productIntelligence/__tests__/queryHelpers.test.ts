/**
 * Product Intelligence - Query Helpers Tests
 *
 * Tests for the PI index (allProductIntelligence) and query helper functions:
 * getPIByCategory, searchPI, getPIForProduct, getDeploymentProfiles,
 * getIntegrationsFor, getScaleUpPaths.
 */

import { describe, it, expect } from 'vitest';
import {
  allProductIntelligence,
  getPIByCategory,
  searchPI,
  getPIForProduct,
  getDeploymentProfiles,
  getIntegrationsFor,
  getScaleUpPaths,
} from '../index';

describe('Product Intelligence Index & Query Helpers', () => {
  // -----------------------------------------------------------------------
  // allProductIntelligence aggregate
  // -----------------------------------------------------------------------

  it('should have at least 30 total entries (6+7+5+5+7+6 = 36)', () => {
    expect(allProductIntelligence.length).toBeGreaterThanOrEqual(30);
  });

  it('should have unique IDs across all products', () => {
    const ids = allProductIntelligence.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('allProductIntelligence should be frozen (immutable)', () => {
    expect(Object.isFrozen(allProductIntelligence)).toBe(true);
  });

  // -----------------------------------------------------------------------
  // getPIByCategory
  // -----------------------------------------------------------------------

  it('getPIByCategory("ai-assistant") should return at least 5', () => {
    const results = getPIByCategory('ai-assistant');
    expect(results.length).toBeGreaterThanOrEqual(5);
    results.forEach(r => expect(r.category).toBe('ai-assistant'));
  });

  it('getPIByCategory("ai-inference") should return at least 6', () => {
    const results = getPIByCategory('ai-inference');
    expect(results.length).toBeGreaterThanOrEqual(6);
    results.forEach(r => expect(r.category).toBe('ai-inference'));
  });

  it('getPIByCategory should return empty array for non-existent category', () => {
    // Cast to any to test invalid category
    const results = getPIByCategory('nonexistent' as never);
    expect(results).toEqual([]);
  });

  // -----------------------------------------------------------------------
  // searchPI
  // -----------------------------------------------------------------------

  it('searchPI("ollama") should return at least 1', () => {
    const results = searchPI('ollama');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some(r => r.name.toLowerCase().includes('ollama'))).toBe(true);
  });

  it('searchPI with Korean text should find results', () => {
    const results = searchPI('올라마');
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it('searchPI("OpenClaw") should return at least 1', () => {
    const results = searchPI('OpenClaw');
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it('searchPI should be case-insensitive', () => {
    const upper = searchPI('OLLAMA');
    const lower = searchPI('ollama');
    expect(upper.length).toBe(lower.length);
    expect(upper.length).toBeGreaterThanOrEqual(1);
  });

  it('searchPI should return empty array for non-matching query', () => {
    const results = searchPI('xyznonexistent12345');
    expect(results).toEqual([]);
  });

  // -----------------------------------------------------------------------
  // getPIForProduct
  // -----------------------------------------------------------------------

  it('getPIForProduct("AI-INF-001") should return array (may be empty)', () => {
    const results = getPIForProduct('AI-INF-001');
    expect(Array.isArray(results)).toBe(true);
  });

  it('getPIForProduct should find products by productId', () => {
    const results = getPIForProduct('ollama');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].productId).toBe('ollama');
  });

  // -----------------------------------------------------------------------
  // getDeploymentProfiles
  // -----------------------------------------------------------------------

  it('getDeploymentProfiles("desktop") should return at least 5', () => {
    const results = getDeploymentProfiles('desktop');
    expect(results.length).toBeGreaterThanOrEqual(5);
    results.forEach(r => {
      expect(r.profile.platform).toBe('desktop');
      expect(r.product).toBeDefined();
    });
  });

  it('getDeploymentProfiles("mobile") should return at least 2', () => {
    const results = getDeploymentProfiles('mobile');
    expect(results.length).toBeGreaterThanOrEqual(2);
    results.forEach(r => expect(r.profile.platform).toBe('mobile'));
  });

  it('getDeploymentProfiles("server") should return at least 10', () => {
    const results = getDeploymentProfiles('server');
    expect(results.length).toBeGreaterThanOrEqual(10);
    results.forEach(r => expect(r.profile.platform).toBe('server'));
  });

  it('getDeploymentProfiles("cloud") should return at least 5', () => {
    const results = getDeploymentProfiles('cloud');
    expect(results.length).toBeGreaterThanOrEqual(5);
    results.forEach(r => expect(r.profile.platform).toBe('cloud'));
  });

  it('getDeploymentProfiles should have product and profile in each result', () => {
    const results = getDeploymentProfiles('server');
    for (const result of results) {
      expect(result.product.id).toBeTruthy();
      expect(result.profile.platform).toBe('server');
      expect(result.profile.infraComponents.length).toBeGreaterThan(0);
    }
  });

  // -----------------------------------------------------------------------
  // getIntegrationsFor
  // -----------------------------------------------------------------------

  it('getIntegrationsFor("slack") should return at least 1 (case-insensitive)', () => {
    const results = getIntegrationsFor('slack');
    expect(results.length).toBeGreaterThanOrEqual(1);
    results.forEach(r => {
      expect(r.integration.target.toLowerCase()).toContain('slack');
      expect(r.product).toBeDefined();
    });
  });

  it('getIntegrationsFor("ollama") should return at least 2', () => {
    const results = getIntegrationsFor('ollama');
    expect(results.length).toBeGreaterThanOrEqual(2);
    results.forEach(r => {
      expect(r.integration.target.toLowerCase()).toContain('ollama');
    });
  });

  it('getIntegrationsFor should return empty for non-matching target', () => {
    const results = getIntegrationsFor('nonexistent-tool-xyz');
    expect(results).toEqual([]);
  });

  // -----------------------------------------------------------------------
  // getScaleUpPaths
  // -----------------------------------------------------------------------

  it('getScaleUpPaths() should return at least 15', () => {
    const results = getScaleUpPaths();
    expect(results.length).toBeGreaterThanOrEqual(15);
    for (const result of results) {
      expect(result.product.id).toBeTruthy();
      expect(result.path.trigger).toBeTruthy();
      expect(result.path.from.length).toBeGreaterThan(0);
      expect(result.path.to.length).toBeGreaterThan(0);
    }
  });

  it('getScaleUpPaths should include cloudServices in each path', () => {
    const results = getScaleUpPaths();
    for (const result of results) {
      expect(result.path.cloudServices.length).toBeGreaterThan(0);
    }
  });

  // -----------------------------------------------------------------------
  // Bilingual fields
  // -----------------------------------------------------------------------

  it('all products should have bilingual name and embeddingText', () => {
    for (const pi of allProductIntelligence) {
      expect(pi.name).toBeTruthy();
      expect(pi.nameKo).toBeTruthy();
      expect(pi.embeddingText).toBeTruthy();
      expect(pi.embeddingTextKo).toBeTruthy();
    }
  });
});
