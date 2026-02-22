/**
 * Recommendation Engine — Types
 *
 * Core type definitions for the Layer 3 recommendation engine that
 * matches vendor products to infrastructure specifications.
 */

import type { InfraNodeType } from '@/types/infra';
import type { ProductNode } from '@/lib/knowledge/vendorCatalog/types';
import type { CloudService, CloudProvider } from '@/lib/knowledge/cloudCatalog/types';

// ---------------------------------------------------------------------------
// Match Score — Base & Variants
// ---------------------------------------------------------------------------

/** Common fields shared by vendor and cloud match scores */
export interface BaseMatchScore {
  /** Overall match score 0-100 */
  overall: number;
  /** Score breakdown by category */
  breakdown: {
    /** Does the product/service map to the right InfraNodeType? (0-40) */
    typeMatch: number;
    /** Does the architecture role fit the diagram context? (0-25) */
    architectureRoleFit: number;
    /** How many recommended use cases overlap? (0-20) */
    useCaseOverlap: number;
  };
}

/** How well a vendor product matches an infrastructure need */
export interface VendorMatchScore extends BaseMatchScore {
  breakdown: BaseMatchScore['breakdown'] & {
    /** Does the product have HA features matching the architecture? (0-15) */
    haFeatureMatch: number;
  };
}

/**
 * @deprecated Use `VendorMatchScore` instead. Kept for backward compatibility.
 */
export type MatchScore = VendorMatchScore;

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

// ---------------------------------------------------------------------------
// Cloud Service Recommendation Types
// ---------------------------------------------------------------------------

/** How well a cloud service matches an infrastructure need */
export interface CloudMatchScore extends BaseMatchScore {
  breakdown: BaseMatchScore['breakdown'] & {
    /** How many compliance frameworks are covered? (0-15) */
    complianceFit: number;
  };
}

/** A single cloud service recommendation for a diagram node */
export interface CloudServiceRecommendation {
  /** The matched cloud service */
  service: CloudService;
  /** Cloud provider */
  provider: CloudProvider;
  /** Match score details */
  score: CloudMatchScore;
  /** Why this service was recommended (English) */
  reason: string;
  /** Why this service was recommended (Korean) */
  reasonKo: string;
}

/** Cloud recommendations grouped by diagram node */
export interface CloudNodeRecommendation {
  /** The diagram node this is for */
  nodeId: string;
  nodeType: InfraNodeType;
  nodeLabel: string;
  /** Ordered list of cloud service recommendations (best first) */
  recommendations: CloudServiceRecommendation[];
}

/** Full cloud recommendation result for an InfraSpec */
export interface CloudRecommendationResult {
  /** Recommendations per diagram node */
  nodeRecommendations: CloudNodeRecommendation[];
  /** Total services evaluated */
  totalServicesEvaluated: number;
  /** Total matches found */
  totalMatches: number;
  /** Nodes with no matching services */
  unmatchedNodes: { nodeId: string; nodeType: InfraNodeType; nodeLabel: string }[];
}
