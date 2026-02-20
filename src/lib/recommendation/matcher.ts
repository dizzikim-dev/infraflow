/**
 * Recommendation Engine — Matcher
 *
 * Core matching function that matches vendor products to all nodes
 * in an InfraSpec. Delegates scoring to scorer.ts and returns
 * recommendations sorted by score (best first).
 */

import type { InfraSpec } from '@/types/infra';
import type {
  RecommendationResult,
  NodeRecommendation,
  ProductRecommendation,
} from './types';
import { getProductsByNodeType } from '@/lib/knowledge/vendorCatalog';
import { getNodePath } from '@/lib/knowledge/vendorCatalog/queryHelpers';
import { allVendorCatalogs } from '@/lib/knowledge/vendorCatalog';
import { scoreProduct } from './scorer';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_MIN_SCORE = 20;
const DEFAULT_MAX_PER_NODE = 5;

// ---------------------------------------------------------------------------
// Reason Builders
// ---------------------------------------------------------------------------

/**
 * Build English reason string explaining why a product was recommended.
 */
function buildReason(
  productName: string,
  score: ProductRecommendation['score'],
): string {
  const parts: string[] = [];

  if (score.breakdown.typeMatch >= 40) {
    parts.push(`exact type match`);
  } else if (score.breakdown.typeMatch >= 20) {
    parts.push(`same category match`);
  }

  if (score.breakdown.architectureRoleFit >= 15) {
    parts.push(`architecture role fits the tier position`);
  }

  if (score.breakdown.useCaseOverlap >= 5) {
    const useCases = Math.floor(score.breakdown.useCaseOverlap / 5);
    parts.push(`${useCases} use case${useCases > 1 ? 's' : ''} overlap with diagram`);
  }

  if (score.breakdown.haFeatureMatch >= 10) {
    parts.push(`has HA features`);
  }

  if (parts.length === 0) {
    return `${productName} partially matches the requirements (score: ${score.overall}).`;
  }

  return `${productName} recommended: ${parts.join(', ')} (score: ${score.overall}).`;
}

/**
 * Build Korean reason string explaining why a product was recommended.
 */
function buildReasonKo(
  productNameKo: string,
  score: ProductRecommendation['score'],
): string {
  const parts: string[] = [];

  if (score.breakdown.typeMatch >= 40) {
    parts.push('정확한 타입 일치');
  } else if (score.breakdown.typeMatch >= 20) {
    parts.push('동일 카테고리 일치');
  }

  if (score.breakdown.architectureRoleFit >= 15) {
    parts.push('아키텍처 역할이 티어 위치에 적합');
  }

  if (score.breakdown.useCaseOverlap >= 5) {
    const useCases = Math.floor(score.breakdown.useCaseOverlap / 5);
    parts.push(`${useCases}개 사용 사례가 다이어그램과 일치`);
  }

  if (score.breakdown.haFeatureMatch >= 10) {
    parts.push('HA 기능 보유');
  }

  if (parts.length === 0) {
    return `${productNameKo}이(가) 요구사항에 부분적으로 일치합니다 (점수: ${score.overall}).`;
  }

  return `${productNameKo} 추천: ${parts.join(', ')} (점수: ${score.overall}).`;
}

// ---------------------------------------------------------------------------
// Main Matching Function
// ---------------------------------------------------------------------------

/**
 * Match vendor products to all nodes in an InfraSpec.
 * Returns recommendations sorted by score (best first).
 *
 * @param spec - The infrastructure specification to match against
 * @param options - Optional filters
 */
export function matchVendorProducts(
  spec: InfraSpec,
  options?: {
    /** Only include products from this vendor */
    vendorId?: string;
    /** Minimum match score (0-100) to include */
    minScore?: number;
    /** Maximum recommendations per node */
    maxPerNode?: number;
  },
): RecommendationResult {
  const minScore = options?.minScore ?? DEFAULT_MIN_SCORE;
  const maxPerNode = options?.maxPerNode ?? DEFAULT_MAX_PER_NODE;
  const vendorFilter = options?.vendorId;

  const nodeRecommendations: NodeRecommendation[] = [];
  const unmatchedNodes: RecommendationResult['unmatchedNodes'] = [];
  let totalProductsEvaluated = 0;
  let totalMatches = 0;

  for (const node of spec.nodes) {
    // Get products matching this node type across all vendors
    let vendorProducts = getProductsByNodeType(node.type);

    // Apply vendor filter if specified
    if (vendorFilter) {
      vendorProducts = vendorProducts.filter((vp) => vp.vendorId === vendorFilter);
    }

    const recommendations: ProductRecommendation[] = [];

    for (const { vendorId, vendorName, products } of vendorProducts) {
      // Get the vendor catalog for path lookup
      const vendorCatalog = allVendorCatalogs.find((v) => v.vendorId === vendorId);

      for (const product of products) {
        totalProductsEvaluated++;

        // Score the product against this node
        const score = scoreProduct(product, node, spec);

        // Apply minimum score filter
        if (score.overall < minScore) continue;

        // Build breadcrumb path
        const pathNodes = vendorCatalog
          ? getNodePath(vendorCatalog.products, product.nodeId)
          : [];
        const path = pathNodes.map((n) => n.name);

        recommendations.push({
          product,
          vendorId,
          vendorName,
          path,
          score,
          reason: buildReason(product.name, score),
          reasonKo: buildReasonKo(product.nameKo, score),
        });
      }
    }

    // Sort by score descending
    recommendations.sort((a, b) => b.score.overall - a.score.overall);

    // Apply maxPerNode limit
    const limited = recommendations.slice(0, maxPerNode);
    totalMatches += limited.length;

    if (limited.length > 0) {
      nodeRecommendations.push({
        nodeId: node.id,
        nodeType: node.type,
        nodeLabel: node.label,
        recommendations: limited,
      });
    } else {
      unmatchedNodes.push({
        nodeId: node.id,
        nodeType: node.type,
        nodeLabel: node.label,
      });
    }
  }

  return {
    nodeRecommendations,
    totalProductsEvaluated,
    totalMatches,
    unmatchedNodes,
  };
}
