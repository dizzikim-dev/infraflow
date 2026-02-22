/**
 * Unified Comparison Panel — Public API
 *
 * Re-exports types, adapters, and search functions for the comparison feature.
 */

// Types
export type { ComparisonItem, ComparisonFilters } from './types';
export { MAX_COMPARISON_ITEMS, DEFAULT_FILTERS } from './types';

// Adapters
export { vendorProductToComparisonItem, cloudServiceToComparisonItem } from './adapters';

// Search
export {
  getAllComparisonItems,
  searchComparisonItems,
  resetComparisonItemsCache,
} from './search';
