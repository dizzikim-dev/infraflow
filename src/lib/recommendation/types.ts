/**
 * Recommendation Engine — Types
 *
 * Core type definitions for the Layer 3 recommendation engine that
 * matches vendor products to infrastructure specifications.
 */

import type { InfraNodeType } from '@/types/infra';
import type { ProductNode } from '@/lib/knowledge/vendorCatalog/types';

// ---------------------------------------------------------------------------
// Match Score
// ---------------------------------------------------------------------------

/** How well a vendor product matches an infrastructure need */
export interface MatchScore {
  /** Overall match score 0-100 */
  overall: number;
  /** Score breakdown by category */
  breakdown: {
    /** Does the product map to the right InfraNodeType? (0-40) */
    typeMatch: number;
    /** Does the architecture role fit the diagram context? (0-25) */
    architectureRoleFit: number;
    /** How many recommended use cases overlap? (0-20) */
    useCaseOverlap: number;
    /** Does the product have HA features matching the architecture? (0-15) */
    haFeatureMatch: number;
  };
}

// ---------------------------------------------------------------------------
// Product Recommendation
// ---------------------------------------------------------------------------

/** A single product recommendation for a diagram node */
export interface ProductRecommendation {
  /** The matched vendor product */
  product: ProductNode;
  /** Vendor identifier */
  vendorId: string;
  /** Vendor display name */
  vendorName: string;
  /** Breadcrumb path in the vendor catalog */
  path: string[];
  /** Match score details */
  score: MatchScore;
  /** Why this product was recommended (Korean) */
  reasonKo: string;
  /** Why this product was recommended (English) */
  reason: string;
}

// ---------------------------------------------------------------------------
// Node Recommendation
// ---------------------------------------------------------------------------

/** Recommendations grouped by diagram node */
export interface NodeRecommendation {
  /** The diagram node this is for */
  nodeId: string;
  nodeType: InfraNodeType;
  nodeLabel: string;
  /** Ordered list of product recommendations (best first) */
  recommendations: ProductRecommendation[];
}

// ---------------------------------------------------------------------------
// Recommendation Result
// ---------------------------------------------------------------------------

/** Full recommendation result for an InfraSpec */
export interface RecommendationResult {
  /** Recommendations per diagram node */
  nodeRecommendations: NodeRecommendation[];
  /** Total products evaluated */
  totalProductsEvaluated: number;
  /** Total matches found */
  totalMatches: number;
  /** Nodes with no matching products */
  unmatchedNodes: { nodeId: string; nodeType: InfraNodeType; nodeLabel: string }[];
}
