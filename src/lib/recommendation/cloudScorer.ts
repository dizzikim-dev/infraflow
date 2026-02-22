/**
 * Recommendation Engine — Cloud Service Scorer
 *
 * Scores how well a cloud service matches a diagram node.
 * Adapted from vendor scorer with cloud-specific dimensions.
 *
 * Scoring breakdown:
 * - typeMatch (0-40): Does the cloud service's componentType match the node's type?
 * - architectureRoleFit (0-25): Does the architectureRole match the node's tier/position?
 * - useCaseOverlap (0-20): How many recommendedFor values match the diagram context?
 * - complianceFit (0-15): How many required compliance frameworks does the service cover?
 */

import type { InfraNodeSpec, InfraSpec, InfraNodeType } from '@/types/infra';
import type { CloudService } from '@/lib/knowledge/cloudCatalog/types';
import type { CloudMatchScore } from './types';
import { getCategoryForType } from '@/lib/data/infrastructureDB';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_TYPE_MATCH = 40;
const MAX_ARCHITECTURE_ROLE_FIT = 25;
const MAX_USE_CASE_OVERLAP = 20;
const MAX_COMPLIANCE_FIT = 15;

const PARTIAL_TYPE_MATCH = 20;
const POINTS_PER_USE_CASE = 5;
const POINTS_PER_FRAMEWORK = 5;

// ---------------------------------------------------------------------------
// Tier-to-role keyword mappings (same as vendor scorer)
// ---------------------------------------------------------------------------

const TIER_ROLE_KEYWORDS: Record<string, string[]> = {
  external: ['edge', 'perimeter', 'border', 'internet', 'external', 'wan', 'gateway', 'cdn'],
  dmz: ['perimeter', 'dmz', 'edge', 'border', 'front', 'ingress', 'gateway'],
  internal: ['core', 'distribution', 'campus', 'internal', 'aggregation', 'backbone', 'access'],
  data: ['data center', 'data centre', 'datacenter', 'server', 'storage', 'spine', 'leaf', 'database', 'data tier'],
};

// ---------------------------------------------------------------------------
// Category grouping for partial type match
// ---------------------------------------------------------------------------

const CATEGORY_TYPE_MAP: Record<string, InfraNodeType[]> = {
  security: ['firewall', 'waf', 'ids-ips', 'vpn-gateway', 'nac', 'dlp', 'sase-gateway', 'ztna-broker', 'casb', 'siem', 'soar'],
  network: ['router', 'switch-l2', 'switch-l3', 'load-balancer', 'api-gateway', 'sd-wan', 'dns', 'cdn'],
  compute: ['web-server', 'app-server', 'db-server', 'container', 'vm', 'kubernetes', 'kafka', 'rabbitmq', 'prometheus', 'grafana'],
  cloud: ['aws-vpc', 'azure-vnet', 'gcp-network', 'private-cloud'],
  storage: ['san-nas', 'object-storage', 'backup', 'cache', 'elasticsearch', 'storage'],
  auth: ['ldap-ad', 'sso', 'mfa', 'iam'],
};

// ---------------------------------------------------------------------------
// Main Scoring Function
// ---------------------------------------------------------------------------

/**
 * Score how well a cloud service matches a diagram node.
 *
 * @param service - The cloud service to score
 * @param node - The diagram node to match against
 * @param spec - The full infrastructure spec (for context-based scoring)
 * @param requiredCompliance - Optional compliance frameworks to check
 * @returns Match score with overall score and breakdown
 */
export function scoreCloudService(
  service: CloudService,
  node: InfraNodeSpec,
  spec: InfraSpec,
  requiredCompliance?: string[],
): CloudMatchScore {
  const typeMatch = scoreTypeMatch(service, node);
  const architectureRoleFit = scoreArchitectureRoleFit(service, node);
  const useCaseOverlap = scoreUseCaseOverlap(service, spec);
  const complianceFit = scoreComplianceFit(service, requiredCompliance);

  const overall = typeMatch + architectureRoleFit + useCaseOverlap + complianceFit;

  return {
    overall,
    breakdown: {
      typeMatch,
      architectureRoleFit,
      useCaseOverlap,
      complianceFit,
    },
  };
}

// ---------------------------------------------------------------------------
// Internal scoring functions
// ---------------------------------------------------------------------------

/**
 * Type Match (0-40): Does the cloud service map to the right InfraNodeType?
 * - Exact match: 40 points
 * - Same category match: 20 points
 * - No match: 0 points
 */
function scoreTypeMatch(service: CloudService, node: InfraNodeSpec): number {
  // Exact type match
  if (service.componentType === node.type) {
    return MAX_TYPE_MATCH;
  }

  // Category-level partial match via infrastructureDB
  const nodeCategory = getCategoryForType(node.type);
  const serviceCategory = getCategoryForType(service.componentType);
  if (nodeCategory === serviceCategory && nodeCategory !== 'external') {
    return PARTIAL_TYPE_MATCH;
  }

  // Also check using the CATEGORY_TYPE_MAP
  for (const [, types] of Object.entries(CATEGORY_TYPE_MAP)) {
    if (types.includes(node.type) && types.includes(service.componentType)) {
      return PARTIAL_TYPE_MATCH;
    }
  }

  return 0;
}

/**
 * Architecture Role Fit (0-25): Does the cloud service's architectureRole match
 * the node's tier position?
 */
function scoreArchitectureRoleFit(service: CloudService, node: InfraNodeSpec): number {
  const role = service.architectureRole?.toLowerCase() ?? '';
  if (!role) return 0;

  const tier = node.tier ?? 'internal';
  const keywords = TIER_ROLE_KEYWORDS[tier] ?? [];

  if (keywords.length === 0) return 0;

  let matchCount = 0;
  for (const keyword of keywords) {
    if (role.includes(keyword)) {
      matchCount++;
    }
  }

  if (matchCount === 0) return 0;
  if (matchCount >= 2) return MAX_ARCHITECTURE_ROLE_FIT;
  return 15;
}

/**
 * Use Case Overlap (0-20): How many recommendedFor values match the diagram context?
 * Compares service.recommendedFor keywords against all node labels and types in the spec.
 * Each match = 5 points, maximum 20.
 */
function scoreUseCaseOverlap(service: CloudService, spec: InfraSpec): number {
  const recommendedFor = service.recommendedFor ?? [];
  if (recommendedFor.length === 0) return 0;

  const specKeywords = new Set<string>();
  for (const specNode of spec.nodes) {
    specKeywords.add(specNode.type.toLowerCase());
    for (const part of specNode.type.toLowerCase().split('-')) {
      if (part.length > 2) specKeywords.add(part);
    }
    for (const word of specNode.label.toLowerCase().split(/\s+/)) {
      if (word.length > 2) specKeywords.add(word);
    }
  }

  let matchCount = 0;
  for (const useCase of recommendedFor) {
    const useCaseLower = useCase.toLowerCase();
    for (const keyword of specKeywords) {
      if (useCaseLower.includes(keyword)) {
        matchCount++;
        break;
      }
    }
  }

  return Math.min(matchCount * POINTS_PER_USE_CASE, MAX_USE_CASE_OVERLAP);
}

/**
 * Compliance Fit (0-15): How many required compliance frameworks does the service cover?
 * Each framework match = 5 points, maximum 15.
 * Returns 0 if no compliance requirements are specified.
 */
function scoreComplianceFit(service: CloudService, requiredCompliance?: string[]): number {
  if (!requiredCompliance || requiredCompliance.length === 0) return 0;
  const certs = service.complianceCertifications ?? [];
  if (certs.length === 0) return 0;

  const certsLower = new Set(certs.map((c) => c.toLowerCase()));
  let matchCount = 0;
  for (const framework of requiredCompliance) {
    if (certsLower.has(framework.toLowerCase())) {
      matchCount++;
    }
  }

  return Math.min(matchCount * POINTS_PER_FRAMEWORK, MAX_COMPLIANCE_FIT);
}
