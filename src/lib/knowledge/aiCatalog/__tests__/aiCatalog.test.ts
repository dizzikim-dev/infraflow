import { describe, it, expect } from 'vitest';
import {
  allAISoftware,
  getAISoftwareByCategory,
  getAISoftwareForNodeType,
  searchAISoftware,
} from '../index';
import type { AISoftwareCategory } from '../types';

describe('AI Software Catalog', () => {
  it('should have ~40 total products', () => {
    expect(allAISoftware.length).toBeGreaterThanOrEqual(35);
    expect(allAISoftware.length).toBeLessThanOrEqual(50);
  });

  it('should have all required categories', () => {
    const categories = new Set(allAISoftware.map(s => s.category));
    const expected: AISoftwareCategory[] = [
      'inference', 'vector-db', 'orchestrator', 'gateway',
      'monitoring', 'embedding', 'training', 'prompt-mgmt',
    ];
    for (const cat of expected) {
      expect(categories.has(cat)).toBe(true);
    }
  });

  it('should have unique IDs', () => {
    const ids = allAISoftware.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have bilingual fields', () => {
    for (const sw of allAISoftware) {
      expect(sw.nameKo).toBeTruthy();
      expect(sw.descriptionKo).toBeTruthy();
    }
  });

  it('should have valid infraNodeTypes', () => {
    for (const sw of allAISoftware) {
      expect(sw.infraNodeTypes.length).toBeGreaterThan(0);
    }
  });

  it('should filter by category', () => {
    const engines = getAISoftwareByCategory('inference');
    expect(engines.length).toBeGreaterThanOrEqual(6);
    engines.forEach(e => expect(e.category).toBe('inference'));
  });

  it('should find software for node type', () => {
    const results = getAISoftwareForNodeType('inference-engine');
    expect(results.length).toBeGreaterThanOrEqual(6);
  });

  it('should search by name', () => {
    const results = searchAISoftware('ollama');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].name.toLowerCase()).toContain('ollama');
  });

  it('should search by Korean name', () => {
    const results = searchAISoftware('올라마');
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it('should have inference engines with 8 products', () => {
    const engines = getAISoftwareByCategory('inference');
    expect(engines.length).toBe(8);
  });

  it('should have vector databases with 7 products', () => {
    const vdbs = getAISoftwareByCategory('vector-db');
    expect(vdbs.length).toBe(7);
  });

  it('should have 5 orchestrators', () => {
    const orcs = getAISoftwareByCategory('orchestrator');
    expect(orcs.length).toBe(5);
  });

  it('should have 4 gateways', () => {
    const gws = getAISoftwareByCategory('gateway');
    expect(gws.length).toBe(4);
  });

  it('should have 5 monitoring tools', () => {
    const mons = getAISoftwareByCategory('monitoring');
    expect(mons.length).toBe(5);
  });

  it('should have 4 embedding services', () => {
    const embs = getAISoftwareByCategory('embedding');
    expect(embs.length).toBe(4);
  });

  it('should have 4 training platforms', () => {
    const trns = getAISoftwareByCategory('training');
    expect(trns.length).toBe(4);
  });

  it('should have 2 prompt management tools', () => {
    const pmts = getAISoftwareByCategory('prompt-mgmt');
    expect(pmts.length).toBe(2);
  });

  it('should find monitoring tools for ai-monitor node type', () => {
    const results = getAISoftwareForNodeType('ai-monitor');
    // 5 monitoring tools + MLflow also maps to ai-monitor
    expect(results.length).toBeGreaterThanOrEqual(5);
  });

  it('should find prompt managers for prompt-manager node type', () => {
    const results = getAISoftwareForNodeType('prompt-manager');
    // 2 prompt-mgmt tools + LangSmith also maps to prompt-manager
    expect(results.length).toBeGreaterThanOrEqual(3);
  });

  it('should find embedding services for embedding-service node type', () => {
    const results = getAISoftwareForNodeType('embedding-service');
    expect(results.length).toBe(4);
  });

  it('should find training platforms for training-platform node type', () => {
    const results = getAISoftwareForNodeType('training-platform');
    // 4 training platforms + MLflow also maps to training-platform
    expect(results.length).toBeGreaterThanOrEqual(5);
  });

  it('should return empty array for non-matching search', () => {
    const results = searchAISoftware('xyznonexistent');
    expect(results).toEqual([]);
  });

  it('should have valid documentation URLs', () => {
    for (const sw of allAISoftware) {
      expect(sw.documentationUrl).toMatch(/^https?:\/\//);
    }
  });

  it('should have at least 3 recommended use cases per product', () => {
    for (const sw of allAISoftware) {
      expect(sw.recommendedFor.length).toBeGreaterThanOrEqual(3);
      expect(sw.recommendedForKo.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('allAISoftware should be frozen (immutable)', () => {
    expect(Object.isFrozen(allAISoftware)).toBe(true);
  });
});
