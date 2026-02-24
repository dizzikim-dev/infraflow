/**
 * Product Intelligence — Public API
 *
 * Re-exports all product intelligence data and query helpers.
 */

export type {
  ProductIntelligence,
  PICategory,
  DeploymentPlatform,
  DeploymentProfile,
  IntegrationMethod,
  IntegrationInfo,
  ScaleUpPath,
  ResourceRequirements,
} from './types';

export type {
  DeploymentProfileWithProduct,
  IntegrationWithProduct,
  ScaleUpPathWithProduct,
} from './queryHelpers';

import type { ProductIntelligence } from './types';
import { aiAssistantProducts } from './aiAssistants';
import { aiInferenceProducts } from './aiInference';
import { aiFrameworkProducts } from './aiFrameworks';
import { vectorDbProducts } from './vectorDbs';
import { cloudComputeProducts } from './cloudCompute';
import { integrationProducts } from './integrations';

/** All product intelligence entries across all categories */
export const allProductIntelligence: readonly ProductIntelligence[] = Object.freeze([
  ...aiAssistantProducts,
  ...aiInferenceProducts,
  ...aiFrameworkProducts,
  ...vectorDbProducts,
  ...cloudComputeProducts,
  ...integrationProducts,
]);

export {
  getPIByCategory,
  searchPI,
  getPIForProduct,
  getDeploymentProfiles,
  getIntegrationsFor,
  getScaleUpPaths,
} from './queryHelpers';
