/**
 * Recommendation Engine — Cloud Service Matcher
 *
 * Matches cloud services to all nodes in an InfraSpec.
 * Parallels matcher.ts (vendor products) but uses CloudService data.
 */

import type { InfraSpec } from '@/types/infra';
import type { CloudService, CloudProvider } from '@/lib/knowledge/cloudCatalog/types';
import type { CloudServiceRecommendation, CloudNodeRecommendation, CloudRecommendationResult, CloudMatchScore } from './types';
import { CLOUD_SERVICES } from '@/lib/knowledge/cloudCatalog';
import { scoreCloudService } from './cloudScorer';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_MIN_SCORE = 20;
const DEFAULT_MAX_PER_NODE = 5;

// ---------------------------------------------------------------------------
// Reason Builders
// ---------------------------------------------------------------------------

function buildReason(
  serviceName: string,
  score: CloudMatchScore,
): string {
  const parts: string[] = [];

  if (score.breakdown.typeMatch >= 40) {
    parts.push('exact type match');
  } else if (score.breakdown.typeMatch >= 20) {
    parts.push('same category match');
  }

  if (score.breakdown.architectureRoleFit >= 15) {
    parts.push('architecture role fits the tier position');
  }

  if (score.breakdown.useCaseOverlap >= 5) {
    const useCases = Math.floor(score.breakdown.useCaseOverlap / 5);
    parts.push(`${useCases} use case${useCases > 1 ? 's' : ''} overlap with diagram`);
  }

  if (score.breakdown.complianceFit >= 5) {
    const frameworks = Math.floor(score.breakdown.complianceFit / 5);
    parts.push(`${frameworks} compliance framework${frameworks > 1 ? 's' : ''} covered`);
  }

  if (parts.length === 0) {
    return `${serviceName} partially matches the requirements (score: ${score.overall}).`;
  }

  return `${serviceName} recommended: ${parts.join(', ')} (score: ${score.overall}).`;
}

function buildReasonKo(
  serviceNameKo: string,
  score: CloudMatchScore,
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

  if (score.breakdown.complianceFit >= 5) {
    const frameworks = Math.floor(score.breakdown.complianceFit / 5);
    parts.push(`${frameworks}개 컴플라이언스 프레임워크 충족`);
  }

  if (parts.length === 0) {
    return `${serviceNameKo}이(가) 요구사항에 부분적으로 일치합니다 (점수: ${score.overall}).`;
  }

  return `${serviceNameKo} 추천: ${parts.join(', ')} (점수: ${score.overall}).`;
}

// ---------------------------------------------------------------------------
// Main Matching Function
// ---------------------------------------------------------------------------

/**
 * Match cloud services to all nodes in an InfraSpec.
 * Returns recommendations sorted by score (best first).
 *
 * @param spec - The infrastructure specification to match against
 * @param options - Optional filters and compliance requirements
 */
export function matchCloudServices(
  spec: InfraSpec,
  options?: {
    /** Only include services from this provider */
    provider?: CloudProvider;
    /** Minimum match score (0-100) to include */
    minScore?: number;
    /** Maximum recommendations per node */
    maxPerNode?: number;
    /** Required compliance frameworks for scoring */
    requiredCompliance?: string[];
  },
): CloudRecommendationResult {
  const minScore = options?.minScore ?? DEFAULT_MIN_SCORE;
  const maxPerNode = options?.maxPerNode ?? DEFAULT_MAX_PER_NODE;
  const provider = options?.provider;
  const requiredCompliance = options?.requiredCompliance;

  const nodeRecommendations: CloudNodeRecommendation[] = [];
  const unmatchedNodes: CloudRecommendationResult['unmatchedNodes'] = [];
  let totalServicesEvaluated = 0;
  let totalMatches = 0;

  for (const node of spec.nodes) {
    // Get all active services (filter by provider if specified)
    // Score ALL services — the scorer assigns 0 for non-matching types
    const candidates = CLOUD_SERVICES.filter(
      (s) => s.status === 'active' && (!provider || s.provider === provider),
    );

    const recommendations: CloudServiceRecommendation[] = [];

    for (const service of candidates) {
      totalServicesEvaluated++;

      const score = scoreCloudService(service, node, spec, requiredCompliance);

      if (score.overall < minScore) continue;

      recommendations.push({
        service,
        provider: service.provider,
        score,
        reason: buildReason(service.serviceName, score),
        reasonKo: buildReasonKo(service.serviceNameKo, score),
      });
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
    totalServicesEvaluated,
    totalMatches,
    unmatchedNodes,
  };
}

