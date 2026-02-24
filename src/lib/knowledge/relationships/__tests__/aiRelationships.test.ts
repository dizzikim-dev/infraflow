import { describe, it, expect } from 'vitest';
import { aiComputeRelationships, aiServiceRelationships, aiCrossRelationships } from '../aiRelationships';
import { RELATIONSHIPS } from '../index';

describe('AI Relationships', () => {
  it('should have ai-compute relationships', () => {
    expect(aiComputeRelationships.length).toBeGreaterThanOrEqual(3);
  });

  it('should have ai-service relationships', () => {
    expect(aiServiceRelationships.length).toBeGreaterThanOrEqual(8);
  });

  it('should have cross-category relationships', () => {
    expect(aiCrossRelationships.length).toBeGreaterThanOrEqual(10);
  });

  it('should be included in RELATIONSHIPS registry', () => {
    const aiIds = RELATIONSHIPS.filter(r => r.id.startsWith('REL-AI')).map(r => r.id);
    expect(aiIds.length).toBeGreaterThanOrEqual(20);
  });

  it('should have unique IDs', () => {
    const allAi = [...aiComputeRelationships, ...aiServiceRelationships, ...aiCrossRelationships];
    const ids = allAi.map(r => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should use REL-AI prefix', () => {
    const allAi = [...aiComputeRelationships, ...aiServiceRelationships, ...aiCrossRelationships];
    for (const r of allAi) {
      expect(r.id).toMatch(/^REL-AI-/);
    }
  });

  it('should have bilingual reasons', () => {
    const allAi = [...aiComputeRelationships, ...aiServiceRelationships, ...aiCrossRelationships];
    for (const r of allAi) {
      expect(r.reason).toBeTruthy();
      expect(r.reasonKo).toBeTruthy();
    }
  });

  it('should have trust metadata with sources', () => {
    const allAi = [...aiComputeRelationships, ...aiServiceRelationships, ...aiCrossRelationships];
    for (const r of allAi) {
      expect(r.trust.confidence).toBeGreaterThan(0);
      expect(r.trust.sources.length).toBeGreaterThan(0);
    }
  });
});
