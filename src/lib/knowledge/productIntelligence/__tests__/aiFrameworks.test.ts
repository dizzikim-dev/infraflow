/**
 * Product Intelligence - AI Framework Products Tests
 *
 * Validates the AI framework product intelligence data:
 * LangChain, LlamaIndex, Haystack, Semantic Kernel, Dify
 */

import { describe, it, expect } from 'vitest';
import { aiFrameworkProducts } from '../aiFrameworks';
import type { ProductIntelligence } from '../types';

// ---------------------------------------------------------------------------
// Collection-level validations
// ---------------------------------------------------------------------------

describe('aiFrameworkProducts', () => {
  it('should export at least 4 products', () => {
    expect(aiFrameworkProducts.length).toBeGreaterThanOrEqual(4);
  });

  it('should have unique IDs across all products', () => {
    const ids = aiFrameworkProducts.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have all products in the ai-framework category', () => {
    for (const product of aiFrameworkProducts) {
      expect(product.category).toBe('ai-framework');
    }
  });

  it('should have non-empty bilingual fields for every product', () => {
    for (const product of aiFrameworkProducts) {
      expect(product.name.length).toBeGreaterThan(0);
      expect(product.nameKo.length).toBeGreaterThan(0);
      expect(product.embeddingText.length).toBeGreaterThanOrEqual(20);
      expect(product.embeddingTextKo.length).toBeGreaterThanOrEqual(20);
    }
  });

  it('should have at least 1 deployment profile per product', () => {
    for (const product of aiFrameworkProducts) {
      expect(product.deploymentProfiles.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should have non-empty infraComponents in every deployment profile', () => {
    for (const product of aiFrameworkProducts) {
      for (const profile of product.deploymentProfiles) {
        expect(profile.infraComponents.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have valid sourceUrl starting with https:// for every product', () => {
    for (const product of aiFrameworkProducts) {
      expect(product.sourceUrl).toMatch(/^https:\/\//);
    }
  });

  it('should have at least 1 integration per product', () => {
    for (const product of aiFrameworkProducts) {
      expect(product.integrations.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should have at least 1 scale-up path per product', () => {
    for (const product of aiFrameworkProducts) {
      expect(product.scaleUpPaths.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should have bilingual fields in all deployment profiles', () => {
    for (const product of aiFrameworkProducts) {
      for (const profile of product.deploymentProfiles) {
        expect(profile.installMethod.length).toBeGreaterThan(0);
        expect(profile.installMethodKo.length).toBeGreaterThan(0);
        expect(profile.notes.length).toBeGreaterThan(0);
        expect(profile.notesKo.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have bilingual fields in all integrations', () => {
    for (const product of aiFrameworkProducts) {
      for (const integration of product.integrations) {
        expect(integration.description.length).toBeGreaterThan(0);
        expect(integration.descriptionKo.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have bilingual fields in all scale-up paths', () => {
    for (const product of aiFrameworkProducts) {
      for (const scaleUp of product.scaleUpPaths) {
        expect(scaleUp.trigger.length).toBeGreaterThan(0);
        expect(scaleUp.triggerKo.length).toBeGreaterThan(0);
        expect(scaleUp.reason.length).toBeGreaterThan(0);
        expect(scaleUp.reasonKo.length).toBeGreaterThan(0);
      }
    }
  });

  it('should follow PI-FW-NNN ID format', () => {
    for (const product of aiFrameworkProducts) {
      expect(product.id).toMatch(/^PI-FW-\d{3}$/);
    }
  });
});

// ---------------------------------------------------------------------------
// Individual product validations
// ---------------------------------------------------------------------------

describe('LangChain', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = aiFrameworkProducts.find((p) => p.name === 'LangChain');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should have desktop and server deployment profiles', () => {
    const platforms = product.deploymentProfiles.map((p) => p.platform);
    expect(platforms).toContain('desktop');
    expect(platforms).toContain('server');
  });

  it('should have ai-orchestrator in infraComponents', () => {
    const allInfra = product.deploymentProfiles.flatMap((p) => p.infraComponents);
    expect(allInfra).toContain('ai-orchestrator');
  });

  it('should have Ollama and OpenAI integrations', () => {
    const targets = product.integrations.map((i) => i.target);
    expect(targets).toContain('Ollama');
    expect(targets).toContain('OpenAI API');
  });

  it('should have a scale-up path referencing kubernetes', () => {
    const scaleTo = product.scaleUpPaths.flatMap((s) => s.to);
    expect(scaleTo).toContain('kubernetes');
  });
});

describe('LlamaIndex', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = aiFrameworkProducts.find((p) => p.name === 'LlamaIndex');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should have ai-orchestrator and vector-db in infraComponents', () => {
    const allInfra = product.deploymentProfiles.flatMap((p) => p.infraComponents);
    expect(allInfra).toContain('ai-orchestrator');
    expect(allInfra).toContain('vector-db');
  });

  it('should have vector DB related integration', () => {
    const targets = product.integrations.map((i) => i.target);
    expect(targets).toContain('ChromaDB');
  });
});

describe('Haystack', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = aiFrameworkProducts.find((p) => p.name === 'Haystack');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should have server deployment with container', () => {
    const server = product.deploymentProfiles.find((p) => p.platform === 'server');
    expect(server).toBeDefined();
    expect(server!.infraComponents).toContain('container');
  });

  it('should have ai-orchestrator in infraComponents', () => {
    const allInfra = product.deploymentProfiles.flatMap((p) => p.infraComponents);
    expect(allInfra).toContain('ai-orchestrator');
  });
});

describe('Semantic Kernel', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = aiFrameworkProducts.find((p) => p.name === 'Semantic Kernel');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should have server deployment with ai-orchestrator', () => {
    const allInfra = product.deploymentProfiles.flatMap((p) => p.infraComponents);
    expect(allInfra).toContain('ai-orchestrator');
  });

  it('should have Azure integration', () => {
    const targets = product.integrations.map((i) => i.target);
    expect(targets).toContain('Azure OpenAI');
  });
});

describe('Dify', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = aiFrameworkProducts.find((p) => p.name === 'Dify');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should have server deployment with web-server and container', () => {
    const server = product.deploymentProfiles.find((p) => p.platform === 'server');
    expect(server).toBeDefined();
    expect(server!.infraComponents).toContain('web-server');
    expect(server!.infraComponents).toContain('container');
  });

  it('should have db-server in infraComponents', () => {
    const allInfra = product.deploymentProfiles.flatMap((p) => p.infraComponents);
    expect(allInfra).toContain('db-server');
  });

  it('should have ai-orchestrator in infraComponents', () => {
    const allInfra = product.deploymentProfiles.flatMap((p) => p.infraComponents);
    expect(allInfra).toContain('ai-orchestrator');
  });
});
