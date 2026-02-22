/**
 * Recommendation Engine — Scorer
 *
 * Scores how well a vendor product matches a diagram node.
 * Each scoring dimension has a clear weight and rationale.
 *
 * Scoring breakdown:
 * - typeMatch (0-40): Does the product's infraNodeTypes include the node's type?
 * - architectureRoleFit (0-25): Does the architectureRole match the node's tier/position?
 * - useCaseOverlap (0-20): How many recommendedFor values match the diagram context?
 * - haFeatureMatch (0-15): Does the product have HA features? Bonus for redundancy patterns.
 */

import type { InfraNodeSpec, InfraSpec, InfraNodeType } from '@/types/infra';
import type { ProductNode } from '@/lib/knowledge/vendorCatalog/types';
import type { VendorMatchScore } from './types';
import { getCategoryForType } from '@/lib/data/infrastructureDB';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum points per scoring dimension */
const MAX_TYPE_MATCH = 40;
const MAX_ARCHITECTURE_ROLE_FIT = 25;
const MAX_USE_CASE_OVERLAP = 20;
const MAX_HA_FEATURE_MATCH = 15;

/** Points awarded for partial type match (parent category) */
const PARTIAL_TYPE_MATCH = 20;

/** Points per use case keyword match */
const POINTS_PER_USE_CASE = 5;

/** Base points for having any HA features */
const HA_BASE_POINTS = 10;

/** Bonus points for HA features when redundancy is detected */
const HA_REDUNDANCY_BONUS = 5;

// ---------------------------------------------------------------------------
// Tier-to-role keyword mappings
// ---------------------------------------------------------------------------

/** Maps tier types to architecture role keywords that indicate a good fit */
const TIER_ROLE_KEYWORDS: Record<string, string[]> = {
  external: ['edge', 'perimeter', 'border', 'internet', 'external', 'wan', 'gateway'],
  dmz: ['perimeter', 'dmz', 'edge', 'border', 'front', 'ingress', 'gateway'],
  internal: ['core', 'distribution', 'campus', 'internal', 'aggregation', 'backbone', 'access'],
  data: ['data center', 'data centre', 'datacenter', 'server', 'storage', 'spine', 'leaf', 'top-of-rack', 'tor'],
};

// ---------------------------------------------------------------------------
// Category grouping for partial type match
// ---------------------------------------------------------------------------

/** Maps InfraNodeType categories for partial matching */
const CATEGORY_TYPE_MAP: Record<string, InfraNodeType[]> = {
  security: ['firewall', 'waf', 'ids-ips', 'vpn-gateway', 'nac', 'dlp', 'sase-gateway', 'ztna-broker', 'casb', 'siem', 'soar'],
  network: ['router', 'switch-l2', 'switch-l3', 'load-balancer', 'api-gateway', 'sd-wan', 'dns', 'cdn'],
  compute: ['web-server', 'app-server', 'db-server', 'container', 'vm', 'kubernetes', 'kafka', 'rabbitmq', 'prometheus', 'grafana'],
  cloud: ['aws-vpc', 'azure-vnet', 'gcp-network', 'private-cloud'],
  storage: ['san-nas', 'object-storage', 'backup', 'cache', 'elasticsearch', 'storage'],
  auth: ['ldap-ad', 'sso', 'mfa', 'iam'],
};

// ---------------------------------------------------------------------------
// Scoring Functions
// ---------------------------------------------------------------------------

/**
 * Score how well a vendor product matches a diagram node.
 *
 * @param product - The vendor product to score
 * @param node - The diagram node to match against
 * @param spec - The full infrastructure spec (for context-based scoring)
 * @returns Match score with overall score and breakdown
 */
export function scoreProduct(
  product: ProductNode,
  node: InfraNodeSpec,
  spec: InfraSpec,
): VendorMatchScore {
  const typeMatch = scoreTypeMatch(product, node);
  const architectureRoleFit = scoreArchitectureRoleFit(product, node);
  const useCaseOverlap = scoreUseCaseOverlap(product, spec);
  const haFeatureMatch = scoreHaFeatureMatch(product, spec);

  const overall = typeMatch + architectureRoleFit + useCaseOverlap + haFeatureMatch;

  return {
    overall,
    breakdown: {
      typeMatch,
      architectureRoleFit,
      useCaseOverlap,
      haFeatureMatch,
    },
  };
}

// ---------------------------------------------------------------------------
// Internal scoring functions
// ---------------------------------------------------------------------------

/**
 * Type Match (0-40): Does the product map to the right InfraNodeType?
 * - Exact match: 40 points
 * - Same category match: 20 points
 * - No match: 0 points
 */
function scoreTypeMatch(product: ProductNode, node: InfraNodeSpec): number {
  const productTypes = product.infraNodeTypes ?? [];

  // Exact type match
  if (productTypes.includes(node.type)) {
    return MAX_TYPE_MATCH;
  }

  // Category-level partial match
  const nodeCategory = getCategoryForType(node.type);
  for (const productType of productTypes) {
    const productCategory = getCategoryForType(productType);
    if (productCategory === nodeCategory && nodeCategory !== 'external') {
      return PARTIAL_TYPE_MATCH;
    }
  }

  // Also check using the CATEGORY_TYPE_MAP for types that share a category
  for (const [, types] of Object.entries(CATEGORY_TYPE_MAP)) {
    if (types.includes(node.type)) {
      for (const productType of productTypes) {
        if (types.includes(productType)) {
          return PARTIAL_TYPE_MATCH;
        }
      }
    }
  }

  return 0;
}

/**
 * Architecture Role Fit (0-25): Does the architecture role match the node's tier?
 * Uses heuristic keyword matching between the product's architectureRole
 * and the expected role keywords for the node's tier position.
 */
function scoreArchitectureRoleFit(product: ProductNode, node: InfraNodeSpec): number {
  const role = product.architectureRole?.toLowerCase() ?? '';
  if (!role) return 0;

  const tier = node.tier ?? 'internal';
  const keywords = TIER_ROLE_KEYWORDS[tier] ?? [];

  if (keywords.length === 0) return 0;

  // Count how many tier keywords appear in the architecture role
  let matchCount = 0;
  for (const keyword of keywords) {
    if (role.includes(keyword)) {
      matchCount++;
    }
  }

  if (matchCount === 0) return 0;

  // Scale: 1 match = 15, 2+ matches = 25
  if (matchCount >= 2) return MAX_ARCHITECTURE_ROLE_FIT;
  return 15;
}

/**
 * Use Case Overlap (0-20): How many recommendedFor values match the diagram context?
 * Compares product.recommendedFor keywords against all node labels and types in the spec.
 * Each match = 5 points, maximum 20.
 */
function scoreUseCaseOverlap(product: ProductNode, spec: InfraSpec): number {
  const recommendedFor = product.recommendedFor ?? [];
  if (recommendedFor.length === 0) return 0;

  // Build a set of lowercase keywords from the spec's node labels and types
  const specKeywords = new Set<string>();
  for (const specNode of spec.nodes) {
    // Add the type as-is and split by hyphens
    specKeywords.add(specNode.type.toLowerCase());
    for (const part of specNode.type.toLowerCase().split('-')) {
      if (part.length > 2) specKeywords.add(part);
    }

    // Add label words (split by spaces)
    for (const word of specNode.label.toLowerCase().split(/\s+/)) {
      if (word.length > 2) specKeywords.add(word);
    }
  }

  // Count how many recommendedFor entries overlap with spec keywords
  let matchCount = 0;
  for (const useCase of recommendedFor) {
    const useCaseLower = useCase.toLowerCase();
    for (const keyword of specKeywords) {
      if (useCaseLower.includes(keyword)) {
        matchCount++;
        break; // Count each use case only once
      }
    }
  }

  return Math.min(matchCount * POINTS_PER_USE_CASE, MAX_USE_CASE_OVERLAP);
}

/**
 * HA Feature Match (0-15): Does the product have HA features?
 * - Base 10 points if product has any HA features
 * - +5 bonus if the spec has redundancy patterns (multiple nodes of the same type)
 */
function scoreHaFeatureMatch(product: ProductNode, spec: InfraSpec): number {
  const haFeatures = product.haFeatures ?? [];
  if (haFeatures.length === 0) return 0;

  let score = HA_BASE_POINTS;

  // Check for redundancy patterns: multiple nodes of the same type
  const typeCounts = new Map<string, number>();
  for (const specNode of spec.nodes) {
    typeCounts.set(specNode.type, (typeCounts.get(specNode.type) ?? 0) + 1);
  }

  const hasRedundancy = Array.from(typeCounts.values()).some((count) => count >= 2);
  if (hasRedundancy) {
    score += HA_REDUNDANCY_BONUS;
  }

  return Math.min(score, MAX_HA_FEATURE_MATCH);
}
