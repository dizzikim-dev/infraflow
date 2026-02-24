/**
 * Product Intelligence - AI Assistant Products Tests
 *
 * Validates the AI assistant product intelligence data:
 * OpenClaw, Open WebUI, Jan.ai, LobeChat, Anything LLM, LibreChat
 */

import { describe, it, expect } from 'vitest';
import { aiAssistantProducts } from '../aiAssistants';
import type { ProductIntelligence } from '../types';

// ---------------------------------------------------------------------------
// Collection-level validations
// ---------------------------------------------------------------------------

describe('aiAssistantProducts', () => {
  it('should export at least 5 products', () => {
    expect(aiAssistantProducts.length).toBeGreaterThanOrEqual(5);
  });

  it('should have unique IDs across all products', () => {
    const ids = aiAssistantProducts.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have all products in the ai-assistant category', () => {
    for (const product of aiAssistantProducts) {
      expect(product.category).toBe('ai-assistant');
    }
  });

  it('should have non-empty bilingual fields for every product', () => {
    for (const product of aiAssistantProducts) {
      expect(product.name.length).toBeGreaterThan(0);
      expect(product.nameKo.length).toBeGreaterThan(0);
      expect(product.embeddingText.length).toBeGreaterThanOrEqual(20);
      expect(product.embeddingTextKo.length).toBeGreaterThanOrEqual(20);
    }
  });

  it('should have at least 1 deployment profile per product', () => {
    for (const product of aiAssistantProducts) {
      expect(product.deploymentProfiles.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should have non-empty infraComponents in every deployment profile', () => {
    for (const product of aiAssistantProducts) {
      for (const profile of product.deploymentProfiles) {
        expect(profile.infraComponents.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have valid sourceUrl starting with https:// for every product', () => {
    for (const product of aiAssistantProducts) {
      expect(product.sourceUrl).toMatch(/^https:\/\//);
    }
  });

  it('should have at least 1 integration per product', () => {
    for (const product of aiAssistantProducts) {
      expect(product.integrations.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should have at least 1 scale-up path per product', () => {
    for (const product of aiAssistantProducts) {
      expect(product.scaleUpPaths.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should have bilingual fields in all deployment profiles', () => {
    for (const product of aiAssistantProducts) {
      for (const profile of product.deploymentProfiles) {
        expect(profile.installMethod.length).toBeGreaterThan(0);
        expect(profile.installMethodKo.length).toBeGreaterThan(0);
        expect(profile.notes.length).toBeGreaterThan(0);
        expect(profile.notesKo.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have bilingual fields in all integrations', () => {
    for (const product of aiAssistantProducts) {
      for (const integration of product.integrations) {
        expect(integration.description.length).toBeGreaterThan(0);
        expect(integration.descriptionKo.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have bilingual fields in all scale-up paths', () => {
    for (const product of aiAssistantProducts) {
      for (const scaleUp of product.scaleUpPaths) {
        expect(scaleUp.trigger.length).toBeGreaterThan(0);
        expect(scaleUp.triggerKo.length).toBeGreaterThan(0);
        expect(scaleUp.reason.length).toBeGreaterThan(0);
        expect(scaleUp.reasonKo.length).toBeGreaterThan(0);
      }
    }
  });

  it('should follow PI-AST-NNN ID format', () => {
    for (const product of aiAssistantProducts) {
      expect(product.id).toMatch(/^PI-AST-\d{3}$/);
    }
  });
});

// ---------------------------------------------------------------------------
// Individual product validations
// ---------------------------------------------------------------------------

describe('OpenClaw', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = aiAssistantProducts.find((p) => p.name === 'OpenClaw');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should have 3 deployment profiles (desktop, mobile, server)', () => {
    const platforms = product.deploymentProfiles.map((p) => p.platform);
    expect(platforms).toContain('desktop');
    expect(platforms).toContain('mobile');
    expect(platforms).toContain('server');
    expect(product.deploymentProfiles).toHaveLength(3);
  });

  it('should have desktop profile with app-server', () => {
    const desktop = product.deploymentProfiles.find((p) => p.platform === 'desktop');
    expect(desktop).toBeDefined();
    expect(desktop!.infraComponents).toContain('app-server');
  });

  it('should have mobile profile with edge-device and mobile-device', () => {
    const mobile = product.deploymentProfiles.find((p) => p.platform === 'mobile');
    expect(mobile).toBeDefined();
    expect(mobile!.infraComponents).toContain('edge-device');
    expect(mobile!.infraComponents).toContain('mobile-device');
  });

  it('should have server profile with gpu-server, container, inference-engine', () => {
    const server = product.deploymentProfiles.find((p) => p.platform === 'server');
    expect(server).toBeDefined();
    expect(server!.infraComponents).toContain('gpu-server');
    expect(server!.infraComponents).toContain('container');
    expect(server!.infraComponents).toContain('inference-engine');
  });

  it('should have Slack and Ollama integrations', () => {
    const targets = product.integrations.map((i) => i.target);
    expect(targets).toContain('Slack');
    expect(targets).toContain('Ollama');
  });

  it('should have a scale-up path referencing ai-cluster and kubernetes', () => {
    const scaleTo = product.scaleUpPaths.flatMap((s) => s.to);
    expect(scaleTo).toContain('ai-cluster');
    expect(scaleTo).toContain('kubernetes');
    expect(scaleTo).toContain('load-balancer');
  });
});

describe('Open WebUI', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = aiAssistantProducts.find((p) => p.name === 'Open WebUI');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should have server deployment with web-server and container', () => {
    const server = product.deploymentProfiles.find((p) => p.platform === 'server');
    expect(server).toBeDefined();
    expect(server!.infraComponents).toContain('web-server');
    expect(server!.infraComponents).toContain('container');
  });

  it('should have Ollama integration', () => {
    const targets = product.integrations.map((i) => i.target);
    expect(targets).toContain('Ollama');
  });
});

describe('Jan.ai', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = aiAssistantProducts.find((p) => p.name === 'Jan.ai');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should have desktop deployment with app-server', () => {
    const desktop = product.deploymentProfiles.find((p) => p.platform === 'desktop');
    expect(desktop).toBeDefined();
    expect(desktop!.infraComponents).toContain('app-server');
  });
});

describe('LobeChat', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = aiAssistantProducts.find((p) => p.name === 'LobeChat');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should have server deployment with web-server and container', () => {
    const server = product.deploymentProfiles.find((p) => p.platform === 'server');
    expect(server).toBeDefined();
    expect(server!.infraComponents).toContain('web-server');
    expect(server!.infraComponents).toContain('container');
  });
});

describe('Anything LLM', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = aiAssistantProducts.find((p) => p.name === 'Anything LLM');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should have vector-db in server infraComponents', () => {
    const server = product.deploymentProfiles.find((p) => p.platform === 'server');
    expect(server).toBeDefined();
    expect(server!.infraComponents).toContain('vector-db');
  });
});

describe('LibreChat', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = aiAssistantProducts.find((p) => p.name === 'LibreChat');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should have server deployment with web-server and db-server', () => {
    const server = product.deploymentProfiles.find((p) => p.platform === 'server');
    expect(server).toBeDefined();
    expect(server!.infraComponents).toContain('web-server');
    expect(server!.infraComponents).toContain('db-server');
  });
});
