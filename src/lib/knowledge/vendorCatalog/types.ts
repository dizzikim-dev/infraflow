/**
 * Vendor Catalog — Hierarchical vendor product data in recursive tree structures.
 *
 * Stores complete product hierarchies (Category > Product Line > Model)
 * for infrastructure vendors with bilingual (Korean/English) support.
 */

import type { InfraNodeType } from '@/types/infra';
import type {
  OperationalComplexity,
  EcosystemMaturity,
  DisasterRecoveryInfo,
  RequiredCompanion,
  RecommendedCompanion,
  CompanionRef,
} from '../types';

// ---------------------------------------------------------------------------
// Product Tree Node
// ---------------------------------------------------------------------------

/** Recursive tree node representing a product or product category */
export interface ProductNode {
  /** Unique identifier for this node (e.g., 'PN-FW-001') */
  nodeId: string;
  /** Depth level in the tree (0 = root category) */
  depth: number;
  /** Label for this depth level (e.g., 'Category', 'Product Line', 'Model') */
  depthLabel: string;
  /** Korean label for this depth level */
  depthLabelKo: string;
  /** Product or category name */
  name: string;
  /** Korean product or category name */
  nameKo: string;
  /** Description of the product or category */
  description: string;
  /** Korean description */
  descriptionKo: string;
  /** Source URL for the product page */
  sourceUrl: string;
  /** InfraFlow node types this product maps to */
  infraNodeTypes?: InfraNodeType[];
  /** Technical specifications (key-value pairs) */
  specs?: Record<string, string>;
  /** URL to the product datasheet */
  datasheetUrl?: string;
  /** Pricing information summary */
  pricingInfo?: string;
  /** Product lifecycle status */
  lifecycle?: 'active' | 'end-of-sale' | 'end-of-life';

  // ── Architecture Planning Fields ──

  /** Recommended architecture role (e.g., 'Campus Core', 'Distribution', 'Access Layer') */
  architectureRole?: string;
  /** Korean architecture role */
  architectureRoleKo?: string;
  /** Recommended deployment use cases */
  recommendedFor?: string[];
  /** Korean recommended use cases */
  recommendedForKo?: string[];
  /** Supported network protocols (for connectivity planning) */
  supportedProtocols?: string[];
  /** High availability features (SSO, NSF, ISSU, etc.) */
  haFeatures?: string[];
  /** Security capabilities (MACsec, ETA, TrustSec, etc.) */
  securityCapabilities?: string[];

  // ── Product Lifecycle & Classification Fields ──

  /** nodeId of the replacement product (for EOL products, e.g., 'pan-pa-3400') */
  replacedBy?: string;
  /** Licensing model for procurement planning */
  licensingModel?: 'perpetual' | 'subscription' | 'credit-based' | 'as-a-service';
  /** Maximum throughput for performance tier matching (e.g., '520 Gbps', '25.6 Tbps') */
  maxThroughput?: string;
  /** Physical form factor for deployment environment filtering */
  formFactor?: 'appliance' | 'chassis' | 'virtual' | 'cloud' | 'container' | 'rugged';

  // ── Comparison Fields (shared with CloudService) ──

  /** Operational complexity for comparison */
  operationalComplexity?: OperationalComplexity;

  /** Ecosystem maturity level */
  ecosystemMaturity?: EcosystemMaturity;

  /** Disaster recovery capabilities */
  disasterRecovery?: DisasterRecoveryInfo;

  // ── Companion Dependencies ──

  /** Components that MUST exist for this product to function */
  requiredCompanions?: RequiredCompanion[];

  /** Components strongly recommended alongside this product */
  recommendedCompanions?: RecommendedCompanion[];

  /** Component types this product conflicts with */
  conflictsWith?: CompanionRef[];

  /** Child nodes (sub-categories or models) */
  children: ProductNode[];
}

// ---------------------------------------------------------------------------
// Catalog Statistics
// ---------------------------------------------------------------------------

/** Aggregate statistics for a vendor catalog */
export interface CatalogStats {
  /** Total number of product nodes across all depths */
  totalProducts: number;
  /** Maximum depth of the product tree */
  maxDepth: number;
  /** Number of top-level categories */
  categoriesCount: number;
}

// ---------------------------------------------------------------------------
// Vendor Catalog
// ---------------------------------------------------------------------------

/** Complete vendor product catalog with hierarchical product tree */
export interface VendorCatalog {
  /** Unique vendor identifier (kebab-case, e.g., 'palo-alto-networks') */
  vendorId: string;
  /** Vendor display name */
  vendorName: string;
  /** Korean vendor name */
  vendorNameKo: string;
  /** Vendor headquarters location */
  headquarters: string;
  /** Vendor main website URL */
  website: string;
  /** URL to the vendor's product listing page */
  productPageUrl: string;
  /** Labels for each depth level (e.g., ['Category', 'Product Line', 'Model']) */
  depthStructure: string[];
  /** Korean labels for each depth level */
  depthStructureKo: string[];
  /** Root-level product nodes (top of the tree) */
  products: ProductNode[];
  /** Aggregate catalog statistics */
  stats: CatalogStats;
  /** ISO date string of the last crawl/update */
  lastCrawled: string;
  /** Source of the crawl data (e.g., 'manual', 'web-crawler') */
  crawlSource: string;
}

// ---------------------------------------------------------------------------
// Search Result
// ---------------------------------------------------------------------------

/** Result returned when searching across vendor catalogs */
export interface SearchResult {
  /** Vendor identifier the result belongs to */
  vendorId: string;
  /** Vendor display name */
  vendorName: string;
  /** The matched ProductNode */
  node: ProductNode;
  /** Breadcrumb path from root to the matched node */
  path: string[];
  /** Which field matched the search query */
  matchField: 'name' | 'nameKo' | 'description' | 'descriptionKo' | 'nodeId' | 'specs';
}
