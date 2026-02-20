/**
 * InfraFlow Consulting — Cost Comparison Engine
 *
 * Compares vendor product costs across the vendor catalog for a given
 * InfraSpec. For each vendor, finds matching products per node type,
 * estimates monthly costs based on product tier classification, and
 * produces a full CostComparisonResult with cheapest / best-coverage /
 * recommended vendor analysis.
 */

import type { InfraSpec, InfraNodeType } from '@/types/infra';
import type {
  ConsultingRequirements,
  CostComparisonResult,
  VendorCostEstimate,
  ProductCostItem,
} from './types';
import type { ProductNode } from '@/lib/knowledge/vendorCatalog/types';
import {
  allVendorCatalogs,
  getProductsByNodeType,
} from '@/lib/knowledge/vendorCatalog';

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface CostComparisonOptions {
  /** Filter comparison to specific vendors. Defaults to all. */
  vendorIds?: string[];
  /** Consulting requirements for context (reserved for future scoring). */
  requirements?: ConsultingRequirements;
  /** Include cloud alternative costs from costEstimator (reserved). */
  includeCloudAlternatives?: boolean;
}

// ---------------------------------------------------------------------------
// Pricing Tiers
// ---------------------------------------------------------------------------

/** Estimated monthly costs (USD) by product tier. */
export const PRICING_TIERS: Record<string, { min: number; max: number; typical: number }> = {
  'entry-level': { min: 200, max: 500, typical: 350 },
  'mid-range': { min: 500, max: 2000, typical: 1200 },
  'high-end': { min: 2000, max: 10000, typical: 5000 },
  'enterprise': { min: 10000, max: 50000, typical: 25000 },
  'software': { min: 50, max: 500, typical: 200 },
  'management': { min: 100, max: 1000, typical: 400 },
};

// ---------------------------------------------------------------------------
// Tier Classification
// ---------------------------------------------------------------------------

/**
 * Keyword patterns used to classify a product name into a pricing tier.
 * Evaluated in order — first match wins.
 */
const TIER_KEYWORDS: { pattern: RegExp; tier: string }[] = [
  // Enterprise-class indicators (large chassis / high model numbers)
  { pattern: /\b(9[0-9]{3}|7[0-9]{3})\b/i, tier: 'enterprise' },
  { pattern: /\b(chassis|modular|spine)\b/i, tier: 'enterprise' },

  // High-end indicators
  { pattern: /\b(1[0-9]{3}|2[0-9]{3}|3[0-9]{3}|5[0-9]{3}|6[0-9]{3})\b/i, tier: 'high-end' },
  { pattern: /\b(data[\s-]?center|hyperscale|high[\s-]?end)\b/i, tier: 'high-end' },

  // Mid-range indicators
  { pattern: /\b(1[0-9]{2}F?|2[0-9]{2}F?|3[0-9]{2}F?|4[0-9]{2}F?|5[0-9]{2}F?)\b/i, tier: 'mid-range' },
  { pattern: /\b(mid[\s-]?range|campus|distribution)\b/i, tier: 'mid-range' },

  // Entry-level indicators
  { pattern: /\b([2-9]0F|[2-9][0-9]F)\b/i, tier: 'entry-level' },
  { pattern: /\b(entry|small[\s-]?office|desktop|branch|soho)\b/i, tier: 'entry-level' },

  // Software / virtual indicators
  { pattern: /\b(virtual|vm|cloud|saas|subscription|software|panorama|manager)\b/i, tier: 'software' },

  // Management platform indicators
  { pattern: /\b(management|controller|orchestrat|analyz|monitor)\b/i, tier: 'management' },
];

/**
 * Classify a vendor product into a pricing tier based on its name,
 * description, depth, and specs.
 */
export function classifyProductTier(product: ProductNode): string {
  const searchText = `${product.name} ${product.description}`;

  // Check keyword patterns
  for (const { pattern, tier } of TIER_KEYWORDS) {
    if (pattern.test(searchText)) {
      return tier;
    }
  }

  // Fallback: use depth as a heuristic
  // depth 0-1 = category/series → mid-range default
  // depth 2   = specific model → entry-level if no other signals
  // depth 3+  = very specific model → entry-level
  if (product.depth >= 2) {
    return 'entry-level';
  }

  return 'mid-range';
}

// ---------------------------------------------------------------------------
// Cost Estimation
// ---------------------------------------------------------------------------

/**
 * Estimate monthly cost (USD) for a single vendor product.
 * Uses the typical cost for the classified pricing tier.
 */
export function estimateProductCost(product: ProductNode): number {
  const tier = classifyProductTier(product);
  const pricing = PRICING_TIERS[tier];
  return pricing ? pricing.typical : PRICING_TIERS['mid-range'].typical;
}

// ---------------------------------------------------------------------------
// Per-Vendor Summary
// ---------------------------------------------------------------------------

/**
 * Build a complete cost estimate for one vendor against a spec.
 * Returns VendorCostEstimate with per-product line items, totals,
 * and coverage metrics.
 */
export function getVendorSummary(
  vendorId: string,
  spec: InfraSpec,
): VendorCostEstimate {
  const vendor = allVendorCatalogs.find((v) => v.vendorId === vendorId);
  const vendorName = vendor?.vendorName ?? vendorId;

  const products: ProductCostItem[] = [];
  const coveredNodeTypes: InfraNodeType[] = [];
  const uncoveredNodeTypes: InfraNodeType[] = [];

  // Deduplicate node types — a spec may have multiple nodes of the same type
  const uniqueNodeTypes = new Map<InfraNodeType, number>();
  for (const node of spec.nodes) {
    uniqueNodeTypes.set(node.type, (uniqueNodeTypes.get(node.type) ?? 0) + 1);
  }

  for (const [nodeType, quantity] of uniqueNodeTypes) {
    // Find matching products from this vendor
    const vendorMatches = getProductsByNodeType(nodeType).filter(
      (vp) => vp.vendorId === vendorId,
    );

    if (vendorMatches.length === 0 || vendorMatches[0].products.length === 0) {
      uncoveredNodeTypes.push(nodeType);
      continue;
    }

    // Pick the best product: prefer leaf nodes (depth >= 2), then first match
    const allProducts = vendorMatches.flatMap((vp) => vp.products);
    const leafProducts = allProducts.filter((p) => p.children.length === 0);
    const bestProduct = leafProducts.length > 0 ? leafProducts[0] : allProducts[0];

    const tier = classifyProductTier(bestProduct);
    const monthlyCost = estimateProductCost(bestProduct);

    products.push({
      nodeType,
      productName: bestProduct.name,
      vendorId,
      monthlyCost,
      quantity,
      tier,
      notes: bestProduct.architectureRole ?? undefined,
    });

    coveredNodeTypes.push(nodeType);
  }

  const totalMonthlyCost = products.reduce(
    (sum, p) => sum + p.monthlyCost * p.quantity,
    0,
  );
  const totalNodeTypes = uniqueNodeTypes.size;
  const coveragePercentage =
    totalNodeTypes > 0
      ? Math.round((coveredNodeTypes.length / totalNodeTypes) * 100)
      : 0;

  return {
    vendorId,
    vendorName,
    products,
    totalMonthlyCost,
    totalAnnualCost: totalMonthlyCost * 12,
    coveredNodeTypes,
    uncoveredNodeTypes,
    coveragePercentage,
  };
}

// ---------------------------------------------------------------------------
// Main Comparison
// ---------------------------------------------------------------------------

/**
 * Compare vendor costs for an entire InfraSpec.
 *
 * For each vendor in the catalog (optionally filtered by `vendorIds`),
 * builds a VendorCostEstimate and then determines:
 * - cheapestVendor (lowest total monthly cost, among vendors with > 0 coverage)
 * - bestCoverageVendor (highest coverage percentage)
 * - recommendedVendor (best composite score: 60% coverage + 40% inverse cost)
 * - savingsPercentage (between cheapest and most expensive)
 */
export function compareVendorCosts(
  spec: InfraSpec,
  options?: CostComparisonOptions,
): CostComparisonResult {
  const requirements = options?.requirements ?? null;

  // Determine which vendors to evaluate
  const vendorIds = options?.vendorIds
    ? options.vendorIds
    : allVendorCatalogs.map((v) => v.vendorId);

  // Build estimates for each vendor
  const vendorEstimates: VendorCostEstimate[] = vendorIds.map((vid) =>
    getVendorSummary(vid, spec),
  );

  // If there are no nodes or no estimates, return empty result
  if (spec.nodes.length === 0 || vendorEstimates.length === 0) {
    return {
      requirements,
      spec,
      vendorEstimates,
      cheapestVendor: null,
      bestCoverageVendor: null,
      recommendedVendor: null,
      recommendedReason: 'No vendor data available for comparison.',
      recommendedReasonKo: '비교할 벤더 데이터가 없습니다.',
      savingsPercentage: 0,
    };
  }

  // --- Cheapest vendor (only among vendors with at least one covered product)
  const vendorsWithCoverage = vendorEstimates.filter(
    (v) => v.coveragePercentage > 0,
  );

  let cheapestVendor: string | null = null;
  let bestCoverageVendor: string | null = null;

  if (vendorsWithCoverage.length > 0) {
    const sorted = [...vendorsWithCoverage].sort(
      (a, b) => a.totalMonthlyCost - b.totalMonthlyCost,
    );
    cheapestVendor = sorted[0].vendorId;

    const sortedByCoverage = [...vendorEstimates].sort(
      (a, b) => b.coveragePercentage - a.coveragePercentage,
    );
    bestCoverageVendor = sortedByCoverage[0].vendorId;
  }

  // --- Savings percentage
  let savingsPercentage = 0;
  if (vendorsWithCoverage.length >= 2) {
    const costs = vendorsWithCoverage
      .map((v) => v.totalMonthlyCost)
      .sort((a, b) => a - b);
    const cheapest = costs[0];
    const mostExpensive = costs[costs.length - 1];
    if (mostExpensive > 0) {
      savingsPercentage = Math.round(
        ((mostExpensive - cheapest) / mostExpensive) * 100,
      );
    }
  }

  // --- Recommended vendor (composite: 60% coverage + 40% inverse cost)
  let recommendedVendor: string | null = null;
  let recommendedReason = 'No vendor data available for comparison.';
  let recommendedReasonKo = '비교할 벤더 데이터가 없습니다.';

  if (vendorsWithCoverage.length > 0) {
    const maxCost = Math.max(...vendorsWithCoverage.map((v) => v.totalMonthlyCost));

    const scored = vendorsWithCoverage.map((v) => {
      const coverageScore = v.coveragePercentage / 100; // 0-1
      const costScore = maxCost > 0 ? 1 - v.totalMonthlyCost / maxCost : 1;
      const composite = 0.6 * coverageScore + 0.4 * costScore;
      return { vendorId: v.vendorId, vendorName: v.vendorName, composite, coverageScore, costScore };
    });

    scored.sort((a, b) => b.composite - a.composite);
    const best = scored[0];
    recommendedVendor = best.vendorId;

    recommendedReason =
      `${best.vendorName} offers the best balance of product coverage ` +
      `(${Math.round(best.coverageScore * 100)}%) and cost efficiency.`;
    recommendedReasonKo =
      `${best.vendorName}은(는) 제품 커버리지(${Math.round(best.coverageScore * 100)}%)와 ` +
      `비용 효율성의 최적 균형을 제공합니다.`;
  }

  return {
    requirements,
    spec,
    vendorEstimates,
    cheapestVendor,
    bestCoverageVendor,
    recommendedVendor,
    recommendedReason,
    recommendedReasonKo,
    savingsPercentage,
  };
}
