import { describe, it, expect } from 'vitest';
import {
  allComponents,
  categoryLabels,
  getComponentsByCategory,
} from '../index';

describe('AI Infrastructure Components', () => {
  const aiComputeTypes = [
    'gpu-server', 'ai-accelerator', 'edge-device',
    'mobile-device', 'ai-cluster', 'model-registry',
  ];
  const aiServiceTypes = [
    'inference-engine', 'vector-db', 'ai-gateway',
    'ai-orchestrator', 'embedding-service', 'training-platform',
    'prompt-manager', 'ai-monitor',
  ];

  it('should include all ai-compute components in allComponents', () => {
    for (const type of aiComputeTypes) {
      expect(allComponents[type]).toBeDefined();
      expect(allComponents[type].category).toBe('ai-compute');
    }
  });

  it('should include all ai-service components in allComponents', () => {
    for (const type of aiServiceTypes) {
      expect(allComponents[type]).toBeDefined();
      expect(allComponents[type].category).toBe('ai-service');
    }
  });

  it('should have bilingual labels for new categories', () => {
    expect(categoryLabels['ai-compute']).toEqual({ en: 'AI Compute', ko: 'AI 컴퓨팅' });
    expect(categoryLabels['ai-service']).toEqual({ en: 'AI Service', ko: 'AI 서비스' });
  });

  it('should return ai-compute components by category', () => {
    const components = getComponentsByCategory('ai-compute');
    expect(Object.keys(components)).toHaveLength(6);
  });

  it('should return ai-service components by category', () => {
    const components = getComponentsByCategory('ai-service');
    expect(Object.keys(components)).toHaveLength(8);
  });

  it('should have bilingual fields on every component', () => {
    for (const type of [...aiComputeTypes, ...aiServiceTypes]) {
      const comp = allComponents[type];
      expect(comp.nameKo).toBeTruthy();
      expect(comp.descriptionKo).toBeTruthy();
      expect(comp.functionsKo.length).toBeGreaterThan(0);
      expect(comp.featuresKo.length).toBeGreaterThan(0);
    }
  });
});
