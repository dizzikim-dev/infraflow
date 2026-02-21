/**
 * Cloud Service Catalog - Public API
 *
 * Re-exports types, merges provider arrays, and exposes all query helpers.
 * Import path: @/lib/knowledge/cloudCatalog
 */

// Types
export type {
  CloudProvider,
  CloudService,
  CloudPricingModel,
  CloudDeploymentModel,
  ServiceStatus,
  PricingTier,
  DeprecationWarning,
  ServiceComparison,
  EnrichedServiceComparison,
  ProviderCoverageStats,
  ServiceCategorySummary,
} from './types';
export { svcTrust } from './types';

// Provider data
import { AWS_SERVICES } from './providers/aws';
import { AZURE_SERVICES } from './providers/azure';
import { GCP_SERVICES } from './providers/gcp';
import type { CloudService } from './types';

/** Merged cloud service catalog across all providers */
export const CLOUD_SERVICES: CloudService[] = [
  ...AWS_SERVICES,
  ...AZURE_SERVICES,
  ...GCP_SERVICES,
];

// Re-export provider arrays for direct access
export { AWS_SERVICES } from './providers/aws';
export { AZURE_SERVICES } from './providers/azure';
export { GCP_SERVICES } from './providers/gcp';

// Query helpers
export {
  getCloudServices,
  getDeprecationWarnings,
  compareServices,
  getAlternatives,
  getServicesByDeploymentModel,
  getServicesWithCompliance,
  getIntegrationPartners,
  getServiceCategories,
  getProviderCoverageStats,
  compareServicesEnriched,
} from './queryHelpers';
