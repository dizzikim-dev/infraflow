/**
 * Product Intelligence - Cloud Compute Products Tests
 *
 * Validates the cloud compute product intelligence data:
 * AWS Lambda, AWS ECS, AWS SageMaker, GCP Cloud Run,
 * GCP Vertex AI, Azure Container Apps, RunPod
 */

import { describe, it, expect } from 'vitest';
import { cloudComputeProducts } from '../cloudCompute';
import type { ProductIntelligence } from '../types';

// ---------------------------------------------------------------------------
// Collection-level validations
// ---------------------------------------------------------------------------

describe('cloudComputeProducts', () => {
  it('should export at least 6 products', () => {
    expect(cloudComputeProducts.length).toBeGreaterThanOrEqual(6);
  });

  it('should have unique IDs across all products', () => {
    const ids = cloudComputeProducts.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have all products in a cloud-* category', () => {
    const validCategories = ['cloud-compute', 'cloud-container', 'cloud-gpu'];
    for (const product of cloudComputeProducts) {
      expect(validCategories).toContain(product.category);
    }
  });

  it('should have non-empty bilingual fields for every product', () => {
    for (const product of cloudComputeProducts) {
      expect(product.name.length).toBeGreaterThan(0);
      expect(product.nameKo.length).toBeGreaterThan(0);
      expect(product.embeddingText.length).toBeGreaterThanOrEqual(20);
      expect(product.embeddingTextKo.length).toBeGreaterThanOrEqual(20);
    }
  });

  it('should have at least 1 deployment profile per product', () => {
    for (const product of cloudComputeProducts) {
      expect(product.deploymentProfiles.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should have non-empty infraComponents in every deployment profile', () => {
    for (const product of cloudComputeProducts) {
      for (const profile of product.deploymentProfiles) {
        expect(profile.infraComponents.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have valid sourceUrl starting with https:// for every product', () => {
    for (const product of cloudComputeProducts) {
      expect(product.sourceUrl).toMatch(/^https:\/\//);
    }
  });

  it('should have at least 1 integration per product', () => {
    for (const product of cloudComputeProducts) {
      expect(product.integrations.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should have at least 1 scale-up path per product', () => {
    for (const product of cloudComputeProducts) {
      expect(product.scaleUpPaths.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should have bilingual fields in all deployment profiles', () => {
    for (const product of cloudComputeProducts) {
      for (const profile of product.deploymentProfiles) {
        expect(profile.installMethod.length).toBeGreaterThan(0);
        expect(profile.installMethodKo.length).toBeGreaterThan(0);
        expect(profile.notes.length).toBeGreaterThan(0);
        expect(profile.notesKo.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have bilingual fields in all integrations', () => {
    for (const product of cloudComputeProducts) {
      for (const integration of product.integrations) {
        expect(integration.description.length).toBeGreaterThan(0);
        expect(integration.descriptionKo.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have bilingual fields in all scale-up paths', () => {
    for (const product of cloudComputeProducts) {
      for (const scaleUp of product.scaleUpPaths) {
        expect(scaleUp.trigger.length).toBeGreaterThan(0);
        expect(scaleUp.triggerKo.length).toBeGreaterThan(0);
        expect(scaleUp.reason.length).toBeGreaterThan(0);
        expect(scaleUp.reasonKo.length).toBeGreaterThan(0);
      }
    }
  });

  it('should follow PI-CLD-NNN ID format', () => {
    for (const product of cloudComputeProducts) {
      expect(product.id).toMatch(/^PI-CLD-\d{3}$/);
    }
  });
});

// ---------------------------------------------------------------------------
// Individual product validations
// ---------------------------------------------------------------------------

describe('AWS Lambda', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = cloudComputeProducts.find((p) => p.name === 'AWS Lambda');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should be in cloud-compute category', () => {
    expect(product.category).toBe('cloud-compute');
  });

  it('should have cloud deployment with app-server and api-gateway', () => {
    const cloud = product.deploymentProfiles.find((p) => p.platform === 'cloud');
    expect(cloud).toBeDefined();
    expect(cloud!.infraComponents).toContain('app-server');
    expect(cloud!.infraComponents).toContain('api-gateway');
  });

  it('should have API Gateway integration', () => {
    const targets = product.integrations.map((i) => i.target);
    expect(targets).toContain('API Gateway');
  });
});

describe('AWS ECS', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = cloudComputeProducts.find((p) => p.name === 'AWS ECS');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should be in cloud-container category', () => {
    expect(product.category).toBe('cloud-container');
  });

  it('should have cloud deployment with container and load-balancer', () => {
    const cloud = product.deploymentProfiles.find((p) => p.platform === 'cloud');
    expect(cloud).toBeDefined();
    expect(cloud!.infraComponents).toContain('container');
    expect(cloud!.infraComponents).toContain('load-balancer');
  });
});

describe('AWS SageMaker', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = cloudComputeProducts.find((p) => p.name === 'AWS SageMaker');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should be in cloud-gpu category', () => {
    expect(product.category).toBe('cloud-gpu');
  });

  it('should have cloud deployment with gpu-server and ai-cluster', () => {
    const cloud = product.deploymentProfiles.find((p) => p.platform === 'cloud');
    expect(cloud).toBeDefined();
    expect(cloud!.infraComponents).toContain('gpu-server');
    expect(cloud!.infraComponents).toContain('ai-cluster');
    expect(cloud!.infraComponents).toContain('model-registry');
    expect(cloud!.infraComponents).toContain('inference-engine');
  });
});

describe('GCP Cloud Run', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = cloudComputeProducts.find((p) => p.name === 'GCP Cloud Run');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should be in cloud-container category', () => {
    expect(product.category).toBe('cloud-container');
  });

  it('should have cloud deployment with container, load-balancer, and api-gateway', () => {
    const cloud = product.deploymentProfiles.find((p) => p.platform === 'cloud');
    expect(cloud).toBeDefined();
    expect(cloud!.infraComponents).toContain('container');
    expect(cloud!.infraComponents).toContain('load-balancer');
    expect(cloud!.infraComponents).toContain('api-gateway');
  });
});

describe('GCP Vertex AI', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = cloudComputeProducts.find((p) => p.name === 'GCP Vertex AI');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should be in cloud-gpu category', () => {
    expect(product.category).toBe('cloud-gpu');
  });

  it('should have cloud deployment with gpu-server and ai-cluster', () => {
    const cloud = product.deploymentProfiles.find((p) => p.platform === 'cloud');
    expect(cloud).toBeDefined();
    expect(cloud!.infraComponents).toContain('gpu-server');
    expect(cloud!.infraComponents).toContain('ai-cluster');
    expect(cloud!.infraComponents).toContain('model-registry');
  });
});

describe('Azure Container Apps', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = cloudComputeProducts.find((p) => p.name === 'Azure Container Apps');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should be in cloud-container category', () => {
    expect(product.category).toBe('cloud-container');
  });

  it('should have cloud deployment with container and load-balancer', () => {
    const cloud = product.deploymentProfiles.find((p) => p.platform === 'cloud');
    expect(cloud).toBeDefined();
    expect(cloud!.infraComponents).toContain('container');
    expect(cloud!.infraComponents).toContain('load-balancer');
  });
});

describe('RunPod', () => {
  let product: ProductIntelligence;

  it('should exist in the collection', () => {
    const found = cloudComputeProducts.find((p) => p.name === 'RunPod');
    expect(found).toBeDefined();
    product = found!;
  });

  it('should be in cloud-gpu category', () => {
    expect(product.category).toBe('cloud-gpu');
  });

  it('should have cloud deployment with gpu-server and inference-engine', () => {
    const cloud = product.deploymentProfiles.find((p) => p.platform === 'cloud');
    expect(cloud).toBeDefined();
    expect(cloud!.infraComponents).toContain('gpu-server');
    expect(cloud!.infraComponents).toContain('inference-engine');
    expect(cloud!.infraComponents).toContain('container');
  });
});
