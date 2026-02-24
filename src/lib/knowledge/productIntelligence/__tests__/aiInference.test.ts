/**
 * Product Intelligence - AI Inference Engine Products Tests
 *
 * Validates the AI inference product intelligence data:
 * Ollama, vLLM, llama.cpp, TGI, LocalAI, LM Studio, Triton Inference Server
 */

import { describe, it, expect } from 'vitest';
import { aiInferenceProducts } from '../aiInference';
import type { ProductIntelligence } from '../types';

// ---------------------------------------------------------------------------
// Collection-level validations
// ---------------------------------------------------------------------------

describe('aiInferenceProducts', () => {
  it('should export at least 6 products', () => {
    expect(aiInferenceProducts.length).toBeGreaterThanOrEqual(6);
  });

  it('should have unique IDs across all products', () => {
    const ids = aiInferenceProducts.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have all products in the ai-inference category', () => {
    for (const product of aiInferenceProducts) {
      expect(product.category).toBe('ai-inference');
    }
  });

  it('should have non-empty bilingual fields for every product', () => {
    for (const product of aiInferenceProducts) {
      expect(product.name.length).toBeGreaterThan(0);
      expect(product.nameKo.length).toBeGreaterThan(0);
      expect(product.embeddingText.length).toBeGreaterThanOrEqual(20);
      expect(product.embeddingTextKo.length).toBeGreaterThanOrEqual(20);
    }
  });

  it('should have at least 1 deployment profile per product', () => {
    for (const product of aiInferenceProducts) {
      expect(product.deploymentProfiles.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should have non-empty infraComponents in every deployment profile', () => {
    for (const product of aiInferenceProducts) {
      for (const profile of product.deploymentProfiles) {
        expect(profile.infraComponents.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have valid sourceUrl starting with https:// for every product', () => {
    for (const product of aiInferenceProducts) {
      expect(product.sourceUrl).toMatch(/^https:\/\//);
    }
  });

  it('should have at least 1 integration per product', () => {
    for (const product of aiInferenceProducts) {
      expect(product.integrations.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should have at least 1 scale-up path per product', () => {
    for (const product of aiInferenceProducts) {
      expect(product.scaleUpPaths.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should have bilingual fields in all deployment profiles', () => {
    for (const product of aiInferenceProducts) {
      for (const profile of product.deploymentProfiles) {
        expect(profile.installMethod.length).toBeGreaterThan(0);
        expect(profile.installMethodKo.length).toBeGreaterThan(0);
        expect(profile.notes.length).toBeGreaterThan(0);
        expect(profile.notesKo.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have bilingual fields in all integrations', () => {
    for (const product of aiInferenceProducts) {
      for (const integration of product.integrations) {
        expect(integration.description.length).toBeGreaterThan(0);
        expect(integration.descriptionKo.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have bilingual fields in all scale-up paths', () => {
    for (const product of aiInferenceProducts) {
      for (const scaleUp of product.scaleUpPaths) {
        expect(scaleUp.trigger.length).toBeGreaterThan(0);
        expect(scaleUp.triggerKo.length).toBeGreaterThan(0);
        expect(scaleUp.reason.length).toBeGreaterThan(0);
        expect(scaleUp.reasonKo.length).toBeGreaterThan(0);
      }
    }
  });

  it('should follow PI-INF-NNN ID format', () => {
    for (const product of aiInferenceProducts) {
      expect(product.id).toMatch(/^PI-INF-\d{3}$/);
    }
  });
});

// ---------------------------------------------------------------------------
// Individual product validations
// ---------------------------------------------------------------------------

describe('Ollama', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = aiInferenceProducts.find((p) => p.name === 'Ollama');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should have 3 deployment profiles (desktop, server, mobile)', () => {
    const platforms = product.deploymentProfiles.map((p) => p.platform);
    expect(platforms).toContain('desktop');
    expect(platforms).toContain('server');
    expect(platforms).toContain('mobile');
    expect(product.deploymentProfiles).toHaveLength(3);
  });

  it('should have desktop profile with inference-engine and app-server', () => {
    const desktop = product.deploymentProfiles.find((p) => p.platform === 'desktop');
    expect(desktop).toBeDefined();
    expect(desktop!.infraComponents).toContain('inference-engine');
    expect(desktop!.infraComponents).toContain('app-server');
  });

  it('should have server profile with gpu-server', () => {
    const server = product.deploymentProfiles.find((p) => p.platform === 'server');
    expect(server).toBeDefined();
    expect(server!.infraComponents).toContain('gpu-server');
  });

  it('should have Open WebUI and LangChain integrations', () => {
    const targets = product.integrations.map((i) => i.target);
    expect(targets).toContain('Open WebUI');
    expect(targets).toContain('LangChain');
  });

  it('should have a scale-up path referencing load-balancer and gpu-server', () => {
    const scaleTo = product.scaleUpPaths.flatMap((s) => s.to);
    expect(scaleTo).toContain('load-balancer');
    expect(scaleTo).toContain('gpu-server');
  });
});

describe('vLLM', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = aiInferenceProducts.find((p) => p.name === 'vLLM');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should have server deployment with gpu-server and inference-engine', () => {
    const server = product.deploymentProfiles.find((p) => p.platform === 'server');
    expect(server).toBeDefined();
    expect(server!.infraComponents).toContain('gpu-server');
    expect(server!.infraComponents).toContain('inference-engine');
  });

  it('should have cloud deployment profile', () => {
    const cloud = product.deploymentProfiles.find((p) => p.platform === 'cloud');
    expect(cloud).toBeDefined();
    expect(cloud!.infraComponents).toContain('gpu-server');
  });

  it('should have container in infraComponents', () => {
    const allComponents = product.deploymentProfiles.flatMap((p) => p.infraComponents);
    expect(allComponents).toContain('container');
  });
});

describe('llama.cpp', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = aiInferenceProducts.find((p) => p.name === 'llama.cpp');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should have desktop deployment with inference-engine and app-server', () => {
    const desktop = product.deploymentProfiles.find((p) => p.platform === 'desktop');
    expect(desktop).toBeDefined();
    expect(desktop!.infraComponents).toContain('inference-engine');
    expect(desktop!.infraComponents).toContain('app-server');
  });

  it('should have edge deployment with edge-device', () => {
    const edge = product.deploymentProfiles.find((p) => p.platform === 'edge');
    expect(edge).toBeDefined();
    expect(edge!.infraComponents).toContain('edge-device');
  });

  it('should have mobile deployment profile', () => {
    const mobile = product.deploymentProfiles.find((p) => p.platform === 'mobile');
    expect(mobile).toBeDefined();
    expect(mobile!.infraComponents).toContain('mobile-device');
  });
});

describe('Text Generation Inference (TGI)', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = aiInferenceProducts.find((p) => p.name === 'Text Generation Inference (TGI)');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should have server deployment with gpu-server and container', () => {
    const server = product.deploymentProfiles.find((p) => p.platform === 'server');
    expect(server).toBeDefined();
    expect(server!.infraComponents).toContain('gpu-server');
    expect(server!.infraComponents).toContain('container');
  });

  it('should have cloud deployment profile', () => {
    const cloud = product.deploymentProfiles.find((p) => p.platform === 'cloud');
    expect(cloud).toBeDefined();
  });

  it('should have Hugging Face integration', () => {
    const targets = product.integrations.map((i) => i.target);
    expect(targets).toContain('Hugging Face Hub');
  });
});

describe('LocalAI', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = aiInferenceProducts.find((p) => p.name === 'LocalAI');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should have server deployment with container', () => {
    const server = product.deploymentProfiles.find((p) => p.platform === 'server');
    expect(server).toBeDefined();
    expect(server!.infraComponents).toContain('container');
  });

  it('should have desktop deployment with app-server', () => {
    const desktop = product.deploymentProfiles.find((p) => p.platform === 'desktop');
    expect(desktop).toBeDefined();
    expect(desktop!.infraComponents).toContain('app-server');
  });

  it('should have inference-engine in infraComponents', () => {
    const allComponents = product.deploymentProfiles.flatMap((p) => p.infraComponents);
    expect(allComponents).toContain('inference-engine');
  });
});

describe('LM Studio', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = aiInferenceProducts.find((p) => p.name === 'LM Studio');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should have desktop deployment only', () => {
    expect(product.deploymentProfiles).toHaveLength(1);
    expect(product.deploymentProfiles[0].platform).toBe('desktop');
  });

  it('should have app-server and inference-engine in desktop profile', () => {
    const desktop = product.deploymentProfiles[0];
    expect(desktop.infraComponents).toContain('app-server');
    expect(desktop.infraComponents).toContain('inference-engine');
  });
});

describe('Triton Inference Server', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = aiInferenceProducts.find((p) => p.name === 'Triton Inference Server');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should have server deployment with gpu-server and ai-cluster', () => {
    const server = product.deploymentProfiles.find((p) => p.platform === 'server');
    expect(server).toBeDefined();
    expect(server!.infraComponents).toContain('gpu-server');
    expect(server!.infraComponents).toContain('ai-cluster');
  });

  it('should have container in server infraComponents', () => {
    const server = product.deploymentProfiles.find((p) => p.platform === 'server');
    expect(server).toBeDefined();
    expect(server!.infraComponents).toContain('container');
  });

  it('should have cloud deployment profile', () => {
    const cloud = product.deploymentProfiles.find((p) => p.platform === 'cloud');
    expect(cloud).toBeDefined();
    expect(cloud!.infraComponents).toContain('gpu-server');
  });
});
