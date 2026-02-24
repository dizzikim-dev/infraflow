/**
 * Product Intelligence - Communication & Integration Products Tests
 *
 * Validates the communication/integration product intelligence data:
 * Slack, Discord, GitHub Actions, Microsoft Teams, n8n, Zapier
 */

import { describe, it, expect } from 'vitest';
import { integrationProducts } from '../integrations';
import type { ProductIntelligence } from '../types';

// ---------------------------------------------------------------------------
// Collection-level validations
// ---------------------------------------------------------------------------

describe('integrationProducts', () => {
  it('should export at least 5 products', () => {
    expect(integrationProducts.length).toBeGreaterThanOrEqual(5);
  });

  it('should have unique IDs across all products', () => {
    const ids = integrationProducts.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have all products in communication or devops category', () => {
    const validCategories = ['communication', 'devops'];
    for (const product of integrationProducts) {
      expect(validCategories).toContain(product.category);
    }
  });

  it('should have non-empty bilingual fields for every product', () => {
    for (const product of integrationProducts) {
      expect(product.name.length).toBeGreaterThan(0);
      expect(product.nameKo.length).toBeGreaterThan(0);
      expect(product.embeddingText.length).toBeGreaterThanOrEqual(20);
      expect(product.embeddingTextKo.length).toBeGreaterThanOrEqual(20);
    }
  });

  it('should have at least 1 deployment profile per product', () => {
    for (const product of integrationProducts) {
      expect(product.deploymentProfiles.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should have non-empty infraComponents in every deployment profile', () => {
    for (const product of integrationProducts) {
      for (const profile of product.deploymentProfiles) {
        expect(profile.infraComponents.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have valid sourceUrl starting with https:// for every product', () => {
    for (const product of integrationProducts) {
      expect(product.sourceUrl).toMatch(/^https:\/\//);
    }
  });

  it('should have at least 1 integration per product', () => {
    for (const product of integrationProducts) {
      expect(product.integrations.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should have at least 1 scale-up path per product', () => {
    for (const product of integrationProducts) {
      expect(product.scaleUpPaths.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should have bilingual fields in all deployment profiles', () => {
    for (const product of integrationProducts) {
      for (const profile of product.deploymentProfiles) {
        expect(profile.installMethod.length).toBeGreaterThan(0);
        expect(profile.installMethodKo.length).toBeGreaterThan(0);
        expect(profile.notes.length).toBeGreaterThan(0);
        expect(profile.notesKo.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have bilingual fields in all integrations', () => {
    for (const product of integrationProducts) {
      for (const integration of product.integrations) {
        expect(integration.description.length).toBeGreaterThan(0);
        expect(integration.descriptionKo.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have bilingual fields in all scale-up paths', () => {
    for (const product of integrationProducts) {
      for (const scaleUp of product.scaleUpPaths) {
        expect(scaleUp.trigger.length).toBeGreaterThan(0);
        expect(scaleUp.triggerKo.length).toBeGreaterThan(0);
        expect(scaleUp.reason.length).toBeGreaterThan(0);
        expect(scaleUp.reasonKo.length).toBeGreaterThan(0);
      }
    }
  });

  it('should follow PI-INT-NNN ID format', () => {
    for (const product of integrationProducts) {
      expect(product.id).toMatch(/^PI-INT-\d{3}$/);
    }
  });
});

// ---------------------------------------------------------------------------
// Individual product validations
// ---------------------------------------------------------------------------

describe('Slack', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = integrationProducts.find((p) => p.name === 'Slack');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should be in communication category', () => {
    expect(product.category).toBe('communication');
  });

  it('should have cloud deployment with api-gateway', () => {
    const cloud = product.deploymentProfiles.find((p) => p.platform === 'cloud');
    expect(cloud).toBeDefined();
    expect(cloud!.infraComponents).toContain('api-gateway');
  });

  it('should have webhook integration', () => {
    const webhook = product.integrations.find((i) => i.method === 'webhook');
    expect(webhook).toBeDefined();
  });
});

describe('Discord', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = integrationProducts.find((p) => p.name === 'Discord');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should be in communication category', () => {
    expect(product.category).toBe('communication');
  });

  it('should have cloud deployment with api-gateway', () => {
    const cloud = product.deploymentProfiles.find((p) => p.platform === 'cloud');
    expect(cloud).toBeDefined();
    expect(cloud!.infraComponents).toContain('api-gateway');
  });

  it('should have Bot API integration', () => {
    const targets = product.integrations.map((i) => i.target);
    expect(targets).toContain('Bot API');
  });
});

describe('GitHub Actions', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = integrationProducts.find((p) => p.name === 'GitHub Actions');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should be in devops category', () => {
    expect(product.category).toBe('devops');
  });

  it('should have cloud deployment with container', () => {
    const cloud = product.deploymentProfiles.find((p) => p.platform === 'cloud');
    expect(cloud).toBeDefined();
    expect(cloud!.infraComponents).toContain('container');
  });

  it('should have self-hosted runner deployment option', () => {
    const server = product.deploymentProfiles.find((p) => p.platform === 'server');
    expect(server).toBeDefined();
    expect(server!.infraComponents).toContain('app-server');
  });
});

describe('Microsoft Teams', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = integrationProducts.find((p) => p.name === 'Microsoft Teams');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should be in communication category', () => {
    expect(product.category).toBe('communication');
  });

  it('should have cloud deployment with api-gateway', () => {
    const cloud = product.deploymentProfiles.find((p) => p.platform === 'cloud');
    expect(cloud).toBeDefined();
    expect(cloud!.infraComponents).toContain('api-gateway');
  });

  it('should have webhook integration', () => {
    const webhook = product.integrations.find((i) => i.method === 'webhook');
    expect(webhook).toBeDefined();
  });
});

describe('n8n', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = integrationProducts.find((p) => p.name === 'n8n');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should be in devops category', () => {
    expect(product.category).toBe('devops');
  });

  it('should have server deployment with app-server and container', () => {
    const server = product.deploymentProfiles.find((p) => p.platform === 'server');
    expect(server).toBeDefined();
    expect(server!.infraComponents).toContain('app-server');
    expect(server!.infraComponents).toContain('container');
    expect(server!.infraComponents).toContain('db-server');
  });

  it('should have cloud deployment option', () => {
    const cloud = product.deploymentProfiles.find((p) => p.platform === 'cloud');
    expect(cloud).toBeDefined();
  });
});

describe('Zapier', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = integrationProducts.find((p) => p.name === 'Zapier');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should be in devops category', () => {
    expect(product.category).toBe('devops');
  });

  it('should have cloud deployment with api-gateway', () => {
    const cloud = product.deploymentProfiles.find((p) => p.platform === 'cloud');
    expect(cloud).toBeDefined();
    expect(cloud!.infraComponents).toContain('api-gateway');
  });
});
