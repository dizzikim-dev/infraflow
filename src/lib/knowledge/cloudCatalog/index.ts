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

// ---------------------------------------------------------------------------
// Async loader — lazy alternative for future migration
// ---------------------------------------------------------------------------

let _cachedCloudServices: CloudService[] | null = null;
let _cloudLoadingPromise: Promise<CloudService[]> | null = null;

/**
 * Load all cloud services asynchronously via dynamic import().
 *
 * Returns a cached result on subsequent calls. This is the lazy-loading
 * alternative to the synchronous `CLOUD_SERVICES` export. Callers that
 * can await should prefer this function to reduce initial bundle size
 * once the migration from sync to async is complete.
 *
 * @deprecated Prefer this over `CLOUD_SERVICES` for new code paths.
 */
export async function getAllCloudServicesAsync(): Promise<CloudService[]> {
  if (_cachedCloudServices) return _cachedCloudServices;
  if (_cloudLoadingPromise) return _cloudLoadingPromise;

  _cloudLoadingPromise = Promise.all([
    import('./providers/aws').then(m => m.AWS_SERVICES),
    import('./providers/azure').then(m => m.AZURE_SERVICES),
    import('./providers/gcp').then(m => m.GCP_SERVICES),
  ]).then(([aws, azure, gcp]) => {
    _cachedCloudServices = [...aws, ...azure, ...gcp];
    _cloudLoadingPromise = null;
    return _cachedCloudServices;
  });

  return _cloudLoadingPromise;
}

/**
 * Reset the async cloud service cache.
 * Intended for testing only.
 * @internal
 */
export function _resetCloudServiceCache(): void {
  _cachedCloudServices = null;
  _cloudLoadingPromise = null;
}

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
