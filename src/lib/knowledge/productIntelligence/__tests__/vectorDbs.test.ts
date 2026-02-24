/**
 * Product Intelligence - Vector DB Products Tests
 *
 * Validates the vector database product intelligence data:
 * ChromaDB, Pinecone, Milvus, Weaviate, Qdrant
 */

import { describe, it, expect } from 'vitest';
import { vectorDbProducts } from '../vectorDbs';
import type { ProductIntelligence } from '../types';

// ---------------------------------------------------------------------------
// Collection-level validations
// ---------------------------------------------------------------------------

describe('vectorDbProducts', () => {
  it('should export at least 5 products', () => {
    expect(vectorDbProducts.length).toBeGreaterThanOrEqual(5);
  });

  it('should have unique IDs across all products', () => {
    const ids = vectorDbProducts.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have all products in the vector-db category', () => {
    for (const product of vectorDbProducts) {
      expect(product.category).toBe('vector-db');
    }
  });

  it('should have non-empty bilingual fields for every product', () => {
    for (const product of vectorDbProducts) {
      expect(product.name.length).toBeGreaterThan(0);
      expect(product.nameKo.length).toBeGreaterThan(0);
      expect(product.embeddingText.length).toBeGreaterThanOrEqual(20);
      expect(product.embeddingTextKo.length).toBeGreaterThanOrEqual(20);
    }
  });

  it('should have at least 1 deployment profile per product', () => {
    for (const product of vectorDbProducts) {
      expect(product.deploymentProfiles.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should have non-empty infraComponents in every deployment profile', () => {
    for (const product of vectorDbProducts) {
      for (const profile of product.deploymentProfiles) {
        expect(profile.infraComponents.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have valid sourceUrl starting with https:// for every product', () => {
    for (const product of vectorDbProducts) {
      expect(product.sourceUrl).toMatch(/^https:\/\//);
    }
  });

  it('should have at least 1 integration per product', () => {
    for (const product of vectorDbProducts) {
      expect(product.integrations.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should have at least 1 scale-up path per product', () => {
    for (const product of vectorDbProducts) {
      expect(product.scaleUpPaths.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should have bilingual fields in all deployment profiles', () => {
    for (const product of vectorDbProducts) {
      for (const profile of product.deploymentProfiles) {
        expect(profile.installMethod.length).toBeGreaterThan(0);
        expect(profile.installMethodKo.length).toBeGreaterThan(0);
        expect(profile.notes.length).toBeGreaterThan(0);
        expect(profile.notesKo.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have bilingual fields in all integrations', () => {
    for (const product of vectorDbProducts) {
      for (const integration of product.integrations) {
        expect(integration.description.length).toBeGreaterThan(0);
        expect(integration.descriptionKo.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have bilingual fields in all scale-up paths', () => {
    for (const product of vectorDbProducts) {
      for (const scaleUp of product.scaleUpPaths) {
        expect(scaleUp.trigger.length).toBeGreaterThan(0);
        expect(scaleUp.triggerKo.length).toBeGreaterThan(0);
        expect(scaleUp.reason.length).toBeGreaterThan(0);
        expect(scaleUp.reasonKo.length).toBeGreaterThan(0);
      }
    }
  });

  it('should follow PI-VDB-NNN ID format', () => {
    for (const product of vectorDbProducts) {
      expect(product.id).toMatch(/^PI-VDB-\d{3}$/);
    }
  });

  it('should have vector-db in at least one deployment profile infraComponents', () => {
    for (const product of vectorDbProducts) {
      const allInfra = product.deploymentProfiles.flatMap((p) => p.infraComponents);
      expect(allInfra).toContain('vector-db');
    }
  });
});

// ---------------------------------------------------------------------------
// Individual product validations
// ---------------------------------------------------------------------------

describe('ChromaDB', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = vectorDbProducts.find((p) => p.name === 'ChromaDB');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should have desktop and server deployment profiles', () => {
    const platforms = product.deploymentProfiles.map((p) => p.platform);
    expect(platforms).toContain('desktop');
    expect(platforms).toContain('server');
  });

  it('should have vector-db and app-server in infraComponents', () => {
    const allInfra = product.deploymentProfiles.flatMap((p) => p.infraComponents);
    expect(allInfra).toContain('vector-db');
    expect(allInfra).toContain('app-server');
  });

  it('should have LangChain integration', () => {
    const targets = product.integrations.map((i) => i.target);
    expect(targets).toContain('LangChain');
  });
});

describe('Pinecone', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = vectorDbProducts.find((p) => p.name === 'Pinecone');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should have cloud deployment profile', () => {
    const platforms = product.deploymentProfiles.map((p) => p.platform);
    expect(platforms).toContain('cloud');
  });

  it('should have api-gateway in infraComponents', () => {
    const allInfra = product.deploymentProfiles.flatMap((p) => p.infraComponents);
    expect(allInfra).toContain('api-gateway');
  });
});

describe('Milvus', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = vectorDbProducts.find((p) => p.name === 'Milvus');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should have server deployment with container and kubernetes', () => {
    const server = product.deploymentProfiles.find((p) => p.platform === 'server');
    expect(server).toBeDefined();
    expect(server!.infraComponents).toContain('container');
    expect(server!.infraComponents).toContain('kubernetes');
  });

  it('should have a scale-up path referencing kubernetes', () => {
    const scaleTo = product.scaleUpPaths.flatMap((s) => s.to);
    expect(scaleTo).toContain('kubernetes');
  });
});

describe('Weaviate', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = vectorDbProducts.find((p) => p.name === 'Weaviate');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should have server deployment with container', () => {
    const server = product.deploymentProfiles.find((p) => p.platform === 'server');
    expect(server).toBeDefined();
    expect(server!.infraComponents).toContain('container');
  });

  it('should have api-gateway in infraComponents', () => {
    const allInfra = product.deploymentProfiles.flatMap((p) => p.infraComponents);
    expect(allInfra).toContain('api-gateway');
  });
});

describe('Qdrant', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = vectorDbProducts.find((p) => p.name === 'Qdrant');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should have desktop and server deployment profiles', () => {
    const platforms = product.deploymentProfiles.map((p) => p.platform);
    expect(platforms).toContain('desktop');
    expect(platforms).toContain('server');
  });

  it('should have vector-db and container in infraComponents', () => {
    const allInfra = product.deploymentProfiles.flatMap((p) => p.infraComponents);
    expect(allInfra).toContain('vector-db');
    expect(allInfra).toContain('container');
  });
});
