import { describe, it, expect } from 'vitest';
import { aiPatterns } from '../aiPatterns';
import { PATTERNS } from '../patterns';

describe('AI Architecture Patterns', () => {
  it('should define 9 AI patterns', () => {
    expect(aiPatterns).toHaveLength(9);
  });

  it('should use PAT-033 through PAT-041 IDs', () => {
    const ids = aiPatterns.map(p => p.id);
    for (let i = 33; i <= 41; i++) {
      expect(ids).toContain(`PAT-0${i}`);
    }
  });

  it('should be included in PATTERNS registry', () => {
    const aiPatternIds = aiPatterns.map(p => p.id);
    for (const id of aiPatternIds) {
      expect(PATTERNS.find(p => p.id === id)).toBeDefined();
    }
    expect(aiPatternIds.length).toBe(9);
  });

  it('should have bilingual fields', () => {
    for (const p of aiPatterns) {
      expect(p.nameKo).toBeTruthy();
      expect(p.descriptionKo).toBeTruthy();
      expect(p.bestForKo.length).toBeGreaterThan(0);
      expect(p.notSuitableForKo.length).toBeGreaterThan(0);
    }
  });

  it('should have WAF pillar scores', () => {
    for (const p of aiPatterns) {
      const { wafPillars } = p;
      expect(wafPillars.operationalExcellence).toBeGreaterThanOrEqual(0);
      expect(wafPillars.operationalExcellence).toBeLessThanOrEqual(5);
      expect(wafPillars.security).toBeGreaterThanOrEqual(0);
      expect(wafPillars.costOptimization).toBeGreaterThanOrEqual(0);
    }
  });

  it('should have required components using AI node types', () => {
    for (const p of aiPatterns) {
      expect(p.requiredComponents.length).toBeGreaterThan(0);
      const hasAiType = p.requiredComponents.some(c =>
        ['gpu-server', 'ai-accelerator', 'edge-device', 'mobile-device',
         'ai-cluster', 'model-registry', 'inference-engine', 'vector-db',
         'ai-gateway', 'ai-orchestrator', 'embedding-service',
         'training-platform', 'prompt-manager', 'ai-monitor'].includes(c.type)
      );
      expect(hasAiType).toBe(true);
    }
  });

  it('should have trust metadata', () => {
    for (const p of aiPatterns) {
      expect(p.trust.confidence).toBeGreaterThan(0);
      expect(p.trust.sources.length).toBeGreaterThan(0);
    }
  });

  it('should cover personal, startup, and enterprise scales', () => {
    const tags = aiPatterns.flatMap(p => p.tags);
    expect(tags).toContain('personal');
    expect(tags).toContain('startup');
    expect(tags).toContain('enterprise');
  });
});
