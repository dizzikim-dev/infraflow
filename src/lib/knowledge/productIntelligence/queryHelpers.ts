/**
 * Product Intelligence — Query Helpers
 *
 * Search and filter functions for the product intelligence catalog.
 * Imports from individual data files to avoid circular dependencies with index.ts.
 */

import type {
  ProductIntelligence,
  PICategory,
  DeploymentPlatform,
  DeploymentProfile,
  IntegrationInfo,
  ScaleUpPath,
} from './types';
import { aiAssistantProducts } from './aiAssistants';
import { aiInferenceProducts } from './aiInference';
import { aiFrameworkProducts } from './aiFrameworks';
import { vectorDbProducts } from './vectorDbs';
import { cloudComputeProducts } from './cloudCompute';
import { integrationProducts } from './integrations';

// ---------------------------------------------------------------------------
// Helper Types
// ---------------------------------------------------------------------------

/** Deployment profile paired with its parent product */
export interface DeploymentProfileWithProduct {
  product: ProductIntelligence;
  profile: DeploymentProfile;
}

/** Integration info paired with its parent product */
export interface IntegrationWithProduct {
  product: ProductIntelligence;
  integration: IntegrationInfo;
}

/** Scale-up path paired with its parent product */
export interface ScaleUpPathWithProduct {
  product: ProductIntelligence;
  path: ScaleUpPath;
}

// ---------------------------------------------------------------------------
// Internal combined array (avoids circular import with index.ts)
// ---------------------------------------------------------------------------

const ALL_PI: ProductIntelligence[] = [
  ...aiAssistantProducts,
  ...aiInferenceProducts,
  ...aiFrameworkProducts,
  ...vectorDbProducts,
  ...cloudComputeProducts,
  ...integrationProducts,
];

// ---------------------------------------------------------------------------
// Query Functions
// ---------------------------------------------------------------------------

/** Filter product intelligence entries by category */
export function getPIByCategory(category: PICategory): ProductIntelligence[] {
  return ALL_PI.filter(p => p.category === category);
}

/** Search product intelligence by name or description (bilingual, case-insensitive) */
export function searchPI(query: string): ProductIntelligence[] {
  const q = query.toLowerCase();
  return ALL_PI.filter(
    p =>
      p.name.toLowerCase().includes(q) ||
      p.nameKo.includes(query) ||
      p.embeddingText.toLowerCase().includes(q) ||
      p.embeddingTextKo.includes(query),
  );
}

/** Find product intelligence entries by productId reference */
export function getPIForProduct(productId: string): ProductIntelligence[] {
  return ALL_PI.filter(p => p.productId === productId);
}

/** Get all deployment profiles for a specific platform */
export function getDeploymentProfiles(
  platform: DeploymentPlatform,
): DeploymentProfileWithProduct[] {
  const results: DeploymentProfileWithProduct[] = [];
  for (const product of ALL_PI) {
    for (const profile of product.deploymentProfiles) {
      if (profile.platform === platform) {
        results.push({ product, profile });
      }
    }
  }
  return results;
}

/** Get integrations for a specific target (case-insensitive partial match) */
export function getIntegrationsFor(target: string): IntegrationWithProduct[] {
  const t = target.toLowerCase();
  const results: IntegrationWithProduct[] = [];
  for (const product of ALL_PI) {
    for (const integration of product.integrations) {
      if (integration.target.toLowerCase().includes(t)) {
        results.push({ product, integration });
      }
    }
  }
  return results;
}

/** Get all scale-up paths across all products */
export function getScaleUpPaths(): ScaleUpPathWithProduct[] {
  const results: ScaleUpPathWithProduct[] = [];
  for (const product of ALL_PI) {
    for (const path of product.scaleUpPaths) {
      results.push({ product, path });
    }
  }
  return results;
}
