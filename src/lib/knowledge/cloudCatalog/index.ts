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
import { NCP_SERVICES } from './providers/ncp';
import { KAKAO_SERVICES } from './providers/kakao';
import { KT_SERVICES } from './providers/kt';
import { NHN_SERVICES } from './providers/nhn';
import type { CloudService } from './types';

/** Merged cloud service catalog across all providers */
export const CLOUD_SERVICES: CloudService[] = [
  ...AWS_SERVICES,
  ...AZURE_SERVICES,
  ...GCP_SERVICES,
  ...NCP_SERVICES,
  ...KAKAO_SERVICES,
  ...KT_SERVICES,
  ...NHN_SERVICES,
];

// Re-export provider arrays for direct access
export { AWS_SERVICES } from './providers/aws';
export { AZURE_SERVICES } from './providers/azure';
export { GCP_SERVICES } from './providers/gcp';
export { NCP_SERVICES } from './providers/ncp';
export { KAKAO_SERVICES } from './providers/kakao';
export { KT_SERVICES } from './providers/kt';
export { NHN_SERVICES } from './providers/nhn';

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
    import('./providers/ncp').then(m => m.NCP_SERVICES),
    import('./providers/kakao').then(m => m.KAKAO_SERVICES),
    import('./providers/kt').then(m => m.KT_SERVICES),
    import('./providers/nhn').then(m => m.NHN_SERVICES),
  ]).then(([aws, azure, gcp, ncp, kakao, kt, nhn]) => {
    _cachedCloudServices = [...aws, ...azure, ...gcp, ...ncp, ...kakao, ...kt, ...nhn];
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
