/**
 * Vendor Catalog Data Quality Metrics
 *
 * Measures enrichment completeness across all vendor products.
 * Implements VC-009 quality gate validation and generates reports
 * for tracking catalog enrichment progress.
 */

import { allVendorCatalogs } from './index';
import { getAllNodes } from './queryHelpers';
import type { ProductNode } from './types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Quality assessment for a single product node */
export interface ProductQualityMetrics {
  /** Has infraNodeTypes with at least 1 entry */
  hasInfraNodeTypes: boolean;
  /** Has lifecycle set */
  hasLifecycle: boolean;
  /** Has architectureRole (EN + KO) */
  hasArchitectureRole: boolean;
  /** Has recommendedFor with 3+ entries (EN + KO) */
  hasRecommendedFor: boolean;
  /** Has 5+ specs entries */
  hasSpecs: boolean;
  /** Has sourceUrl */
  hasSourceUrl: boolean;
  /** Has datasheetUrl */
  hasDatasheetUrl: boolean;
  /** Meets VC-009 quality gate (all above true except datasheetUrl) */
  meetsQualityGate: boolean;
  /** Completeness score 0-100 */
  completenessScore: number;
}

/** Quality report for a single vendor */
export interface VendorQualityReport {
  vendorId: string;
  vendorName: string;
  totalProducts: number;
  /** Products at depth 2+ (series and deeper) */
  assessableProducts: number;
  /** Products meeting VC-009 quality gate */
  completeProducts: number;
  /** Completeness percentage */
  completenessPercent: number;
  /** Average completeness score across all assessable products */
  avgCompletenessScore: number;
  /** Count of products missing each field */
  missingFields: {
    infraNodeTypes: number;
    lifecycle: number;
    architectureRole: number;
    recommendedFor: number;
    specs: number;
    sourceUrl: number;
    datasheetUrl: number;
  };
}

/** Quality report across the entire catalog */
export interface CatalogQualityReport {
  timestamp: string;
  totalVendors: number;
  totalProducts: number;
  assessableProducts: number;
  completeProducts: number;
  overallCompletenessPercent: number;
  vendors: VendorQualityReport[];
}

// ---------------------------------------------------------------------------
// assessProduct
// ---------------------------------------------------------------------------

/** Assess a single product's quality against VC-009 gate criteria. */
export function assessProduct(product: ProductNode): ProductQualityMetrics {
  const hasInfraNodeTypes = !!(
    product.infraNodeTypes && product.infraNodeTypes.length > 0
  );
  const hasLifecycle = !!product.lifecycle;
  const hasArchitectureRole = !!(
    product.architectureRole && product.architectureRoleKo
  );
  const hasRecommendedFor = !!(
    product.recommendedFor &&
    product.recommendedFor.length >= 3 &&
    product.recommendedForKo &&
    product.recommendedForKo.length >= 3
  );
  const hasSpecs = !!(
    product.specs && Object.keys(product.specs).length >= 5
  );
  const hasSourceUrl = !!product.sourceUrl;
  const hasDatasheetUrl = !!product.datasheetUrl;

  // VC-009: quality gate requires all except datasheetUrl
  const meetsQualityGate =
    hasInfraNodeTypes &&
    hasLifecycle &&
    hasArchitectureRole &&
    hasRecommendedFor &&
    hasSpecs;

  // Weighted completeness score (0-100)
  let score = 0;
  if (hasInfraNodeTypes) score += 20;
  if (hasLifecycle) score += 10;
  if (hasArchitectureRole) score += 20;
  if (hasRecommendedFor) score += 20;
  if (hasSpecs) score += 15;
  if (hasSourceUrl) score += 10;
  if (hasDatasheetUrl) score += 5;

  return {
    hasInfraNodeTypes,
    hasLifecycle,
    hasArchitectureRole,
    hasRecommendedFor,
    hasSpecs,
    hasSourceUrl,
    hasDatasheetUrl,
    meetsQualityGate,
    completenessScore: score,
  };
}

// ---------------------------------------------------------------------------
// generateQualityReport
// ---------------------------------------------------------------------------

/** Generate a quality report across all registered vendor catalogs. */
export function generateQualityReport(): CatalogQualityReport {
  const vendors: VendorQualityReport[] = [];
  let totalProducts = 0;
  let totalAssessable = 0;
  let totalComplete = 0;

  for (const catalog of allVendorCatalogs) {
    const allNodes = getAllNodes(catalog.products);
    // Assess products at depth 2+ (series level and deeper per VC-009)
    const assessable = allNodes.filter((n) => n.depth >= 2);

    const missingFields = {
      infraNodeTypes: 0,
      lifecycle: 0,
      architectureRole: 0,
      recommendedFor: 0,
      specs: 0,
      sourceUrl: 0,
      datasheetUrl: 0,
    };

    let completeCount = 0;
    let totalScore = 0;

    for (const product of assessable) {
      const metrics = assessProduct(product);
      if (metrics.meetsQualityGate) completeCount++;
      totalScore += metrics.completenessScore;

      if (!metrics.hasInfraNodeTypes) missingFields.infraNodeTypes++;
      if (!metrics.hasLifecycle) missingFields.lifecycle++;
      if (!metrics.hasArchitectureRole) missingFields.architectureRole++;
      if (!metrics.hasRecommendedFor) missingFields.recommendedFor++;
      if (!metrics.hasSpecs) missingFields.specs++;
      if (!metrics.hasSourceUrl) missingFields.sourceUrl++;
      if (!metrics.hasDatasheetUrl) missingFields.datasheetUrl++;
    }

    vendors.push({
      vendorId: catalog.vendorId,
      vendorName: catalog.vendorName,
      totalProducts: allNodes.length,
      assessableProducts: assessable.length,
      completeProducts: completeCount,
      completenessPercent:
        assessable.length > 0
          ? Math.round((completeCount / assessable.length) * 100)
          : 0,
      avgCompletenessScore:
        assessable.length > 0 ? Math.round(totalScore / assessable.length) : 0,
      missingFields,
    });

    totalProducts += allNodes.length;
    totalAssessable += assessable.length;
    totalComplete += completeCount;
  }

  return {
    timestamp: new Date().toISOString(),
    totalVendors: vendors.length,
    totalProducts,
    assessableProducts: totalAssessable,
    completeProducts: totalComplete,
    overallCompletenessPercent:
      totalAssessable > 0
        ? Math.round((totalComplete / totalAssessable) * 100)
        : 0,
    vendors,
  };
}
