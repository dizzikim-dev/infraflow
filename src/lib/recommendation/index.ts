/**
 * Recommendation Engine — Public API
 *
 * Layer 3 module that matches vendor products and cloud services
 * to infrastructure specifications. Re-exports all public types and functions.
 */

// Vendor recommendation
export type {
  BaseMatchScore,
  VendorMatchScore,
  MatchScore, // deprecated alias for VendorMatchScore
  ProductRecommendation,
  NodeRecommendation,
  RecommendationResult,
} from './types';
export { matchVendorProducts } from './matcher';
export { scoreProduct } from './scorer';

// Cloud recommendation
export type {
  CloudMatchScore,
  CloudServiceRecommendation,
  CloudNodeRecommendation,
  CloudRecommendationResult,
} from './types';
export { matchCloudServices } from './cloudMatcher';
export { scoreCloudService } from './cloudScorer';
