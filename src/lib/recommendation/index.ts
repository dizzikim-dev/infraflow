/**
 * Recommendation Engine — Public API
 *
 * Layer 3 module that matches vendor products to infrastructure specifications.
 * Re-exports all public types and functions.
 */

export type {
  MatchScore,
  ProductRecommendation,
  NodeRecommendation,
  RecommendationResult,
} from './types';
export { matchVendorProducts } from './matcher';
export { scoreProduct } from './scorer';
