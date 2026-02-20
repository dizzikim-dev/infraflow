/**
 * Pattern Matching Engine — Consulting Module
 *
 * Scores architecture patterns against user requirements (0-100) across four dimensions:
 *   1. Scale fitness (0-25)
 *   2. Security fit (0-25)
 *   3. Architecture fit (0-25)
 *   4. Complexity fit (0-25)
 *
 * Produces a primary recommendation, alternatives, and unmatched requirements.
 */

import type { InfraNodeType } from '@/types/infra';
import type { ArchitecturePattern } from '@/lib/knowledge/types';
import { ARCHITECTURE_PATTERNS } from '@/lib/knowledge/patterns';
import type {
  ConsultingRequirements,
  PatternMatchResult,
  PatternMatchOutput,
  OrganizationSize,
  SecurityLevel,
  BudgetRange,
  CloudPreference,
  IndustryType,
} from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRIMARY_THRESHOLD = 50;
const ALTERNATIVE_THRESHOLD = 40;
const MAX_ALTERNATIVES = 4;

/** Security-related component types used for scoring */
const SECURITY_COMPONENTS: InfraNodeType[] = [
  'firewall', 'waf', 'ids-ips', 'vpn-gateway', 'nac', 'dlp',
  'sase-gateway', 'ztna-broker', 'casb', 'siem', 'soar',
];

/** Maps scalability label to a numeric rank for distance-based scoring */
const SCALABILITY_RANK: Record<string, number> = {
  low: 0,
  medium: 1,
  high: 2,
  auto: 3,
};

/** Expected scalability rank by organization size and user count tier */
function getExpectedScalabilityRank(
  orgSize: OrganizationSize,
  userCount: number,
  concurrentUsers: number,
): number {
  // High concurrency always needs high scalability
  if (concurrentUsers > 10_000) return 3;
  if (concurrentUsers > 1_000) return 2;

  // Org-size fallback
  switch (orgSize) {
    case 'enterprise': return 3;
    case 'large': return 2;
    case 'medium': return 1;
    case 'small': return userCount > 1_000 ? 1 : 0;
  }
}

/** Expected complexity ceiling by budget / org size */
function getExpectedComplexityCeiling(
  orgSize: OrganizationSize,
  budget: BudgetRange,
): number {
  const orgComplexity: Record<OrganizationSize, number> = {
    small: 2,
    medium: 3,
    large: 4,
    enterprise: 5,
  };
  const budgetComplexity: Record<BudgetRange, number> = {
    low: 2,
    medium: 3,
    high: 4,
    enterprise: 5,
  };
  return Math.min(orgComplexity[orgSize], budgetComplexity[budget]);
}

// ---------------------------------------------------------------------------
// Scoring functions
// ---------------------------------------------------------------------------

/**
 * Scale fitness (0-25).
 * Compares org size / user counts to pattern scalability.
 */
function scoreScaleFitness(
  requirements: ConsultingRequirements,
  pattern: ArchitecturePattern,
): { score: number; criteria: string[]; criteriaKo: string[] } {
  const expected = getExpectedScalabilityRank(
    requirements.organizationSize,
    requirements.userCount,
    requirements.concurrentUsers,
  );
  const actual = SCALABILITY_RANK[pattern.scalability] ?? 1;
  const distance = Math.abs(expected - actual);

  // Perfect match → 25, 1 step away → 17, 2 → 9, 3 → 0
  let score = Math.max(0, 25 - distance * 8);

  // Bonus: auto scalability covers all sizes
  if (pattern.scalability === 'auto' && expected >= 2) {
    score = 25;
  }

  const criteria: string[] = [];
  const criteriaKo: string[] = [];
  if (score >= 17) {
    criteria.push(`Scalability matches: ${pattern.scalability} for ${requirements.organizationSize} org`);
    criteriaKo.push(`확장성 일치: ${requirements.organizationSize} 조직에 ${pattern.scalability} 확장성`);
  }

  return { score, criteria, criteriaKo };
}

/**
 * Security fit (0-25).
 * Matches security level + compliance frameworks to pattern security components.
 */
function scoreSecurityFit(
  requirements: ConsultingRequirements,
  pattern: ArchitecturePattern,
): { score: number; criteria: string[]; criteriaKo: string[] } {
  const criteria: string[] = [];
  const criteriaKo: string[] = [];

  // Collect all component types in the pattern
  const allComponents = [
    ...pattern.requiredComponents.map((c) => c.type),
    ...pattern.optionalComponents.map((c) => c.type),
  ];

  const securityComponentsInPattern = allComponents.filter((c) =>
    SECURITY_COMPONENTS.includes(c as InfraNodeType),
  );
  const securityCount = securityComponentsInPattern.length;

  let score = 0;

  // Score based on security level vs number of security components
  const securityLevelWeights: Record<SecurityLevel, { minExpected: number; weight: number }> = {
    basic: { minExpected: 0, weight: 0.3 },
    standard: { minExpected: 1, weight: 0.5 },
    high: { minExpected: 2, weight: 0.8 },
    critical: { minExpected: 4, weight: 1.0 },
  };

  const { minExpected, weight } = securityLevelWeights[requirements.securityLevel];

  if (requirements.securityLevel === 'critical') {
    // Critical security: more security components = higher score
    score = Math.min(20, securityCount * 4) * weight;
    if (securityCount >= minExpected) {
      criteria.push(`${securityCount} security components meet critical security needs`);
      criteriaKo.push(`${securityCount}개 보안 구성요소가 크리티컬 보안 요구사항 충족`);
    }
  } else if (requirements.securityLevel === 'basic') {
    // Basic: don't penalize simple patterns, but give moderate score to all
    score = securityCount >= minExpected ? 15 : 10;
    // Simple patterns with no security are fine for basic
    if (securityCount === 0) {
      score = 18;
      criteria.push('Simple architecture suitable for basic security needs');
      criteriaKo.push('기본 보안 요구에 적합한 단순 아키텍처');
    }
  } else {
    // Standard/High: proportional to security components
    score = Math.min(20, securityCount * (20 / Math.max(minExpected, 1))) * weight;
    if (securityCount >= minExpected) {
      criteria.push(`Security components match ${requirements.securityLevel} security level`);
      criteriaKo.push(`보안 구성요소가 ${requirements.securityLevel} 보안 수준에 부합`);
    }
  }

  // Compliance framework matching (up to 5 bonus points)
  if (requirements.complianceFrameworks.length > 0) {
    const tags = pattern.tags.map((t) => t.toLowerCase());
    const bestFor = pattern.bestForKo.join(' ').toLowerCase();

    let complianceMatches = 0;
    for (const framework of requirements.complianceFrameworks) {
      const fw = framework.toLowerCase();
      if (
        tags.some((t) => t.includes(fw)) ||
        bestFor.includes(fw) ||
        // Common compliance-to-tag mappings
        (fw === 'hipaa' && (tags.includes('healthcare') || bestFor.includes('의료'))) ||
        (fw === 'pci-dss' && (tags.includes('ecommerce') || bestFor.includes('금융'))) ||
        (fw === 'isms' && (tags.includes('security') || bestFor.includes('규제'))) ||
        (fw === 'iso27001' && tags.includes('security'))
      ) {
        complianceMatches++;
      }
    }

    if (complianceMatches > 0) {
      score += Math.min(5, complianceMatches * 2.5);
      criteria.push(`Compliance frameworks matched: ${complianceMatches}`);
      criteriaKo.push(`준수 프레임워크 일치: ${complianceMatches}개`);
    }
  }

  return { score: Math.min(25, Math.round(score)), criteria, criteriaKo };
}

/**
 * Architecture fit (0-25).
 * Matches cloud preference + industry to pattern characteristics.
 */
function scoreArchitectureFit(
  requirements: ConsultingRequirements,
  pattern: ArchitecturePattern,
): { score: number; criteria: string[]; criteriaKo: string[] } {
  const criteria: string[] = [];
  const criteriaKo: string[] = [];
  let score = 0;

  const tags = pattern.tags.map((t) => t.toLowerCase());

  // Cloud preference matching (0-15)
  const cloudScore = scoreCloudPreference(requirements.cloudPreference, pattern, tags);
  score += cloudScore.score;
  criteria.push(...cloudScore.criteria);
  criteriaKo.push(...cloudScore.criteriaKo);

  // Industry matching (0-10)
  const industryScore = scoreIndustryMatch(requirements.industry, pattern, tags);
  score += industryScore.score;
  criteria.push(...industryScore.criteria);
  criteriaKo.push(...industryScore.criteriaKo);

  return { score: Math.min(25, Math.round(score)), criteria, criteriaKo };
}

function scoreCloudPreference(
  pref: CloudPreference,
  pattern: ArchitecturePattern,
  tags: string[],
): { score: number; criteria: string[]; criteriaKo: string[] } {
  const criteria: string[] = [];
  const criteriaKo: string[] = [];
  let score = 0;

  const hasCloudTag = tags.some((t) =>
    ['cloud-native', 'aws', 'azure', 'gcp', 'cloud', 'cloud-security'].includes(t),
  );
  const hasOnPremTag = tags.some((t) =>
    ['classic', 'layered', 'simple', 'dmz', 'firewall', 'network', 'segmentation'].includes(t),
  );
  const hasHybridTag = tags.some((t) =>
    ['hybrid', 'hybrid-cloud', 'multi-cloud', 'hybrid-wan'].includes(t),
  );

  const allComponents = [
    ...pattern.requiredComponents.map((c) => c.type),
    ...pattern.optionalComponents.map((c) => c.type),
  ];
  const hasCloudComponents = allComponents.some((c) =>
    ['aws-vpc', 'azure-vnet', 'gcp-network', 'kubernetes', 'container'].includes(c),
  );

  switch (pref) {
    case 'cloud-native':
      if (hasCloudTag || hasCloudComponents) {
        score = 15;
        criteria.push('Cloud-native architecture match');
        criteriaKo.push('클라우드 네이티브 아키텍처 일치');
      } else if (hasHybridTag) {
        score = 8;
      } else {
        score = 3;
      }
      break;

    case 'on-premise':
      if (hasOnPremTag && !hasCloudTag) {
        score = 15;
        criteria.push('On-premise architecture match');
        criteriaKo.push('온프레미스 아키텍처 일치');
      } else if (hasHybridTag) {
        score = 8;
      } else if (hasCloudTag) {
        score = 3;
      } else {
        score = 10;
      }
      break;

    case 'hybrid':
      if (hasHybridTag) {
        score = 15;
        criteria.push('Hybrid architecture match');
        criteriaKo.push('하이브리드 아키텍처 일치');
      } else {
        score = 8;
      }
      break;

    case 'multi-cloud':
      if (tags.includes('multi-cloud') || tags.includes('vendor-diversity')) {
        score = 15;
        criteria.push('Multi-cloud architecture match');
        criteriaKo.push('멀티 클라우드 아키텍처 일치');
      } else if (hasCloudTag || hasHybridTag) {
        score = 8;
      } else {
        score = 3;
      }
      break;
  }

  return { score, criteria, criteriaKo };
}

function scoreIndustryMatch(
  industry: IndustryType,
  pattern: ArchitecturePattern,
  tags: string[],
): { score: number; criteria: string[]; criteriaKo: string[] } {
  const criteria: string[] = [];
  const criteriaKo: string[] = [];
  let score = 5; // Base score — most patterns are somewhat applicable

  const bestFor = pattern.bestForKo.join(' ').toLowerCase();
  const allComponents = [
    ...pattern.requiredComponents.map((c) => c.type),
    ...pattern.optionalComponents.map((c) => c.type),
  ];

  switch (industry) {
    case 'financial':
      if (
        tags.includes('security') ||
        bestFor.includes('금융') ||
        allComponents.some((c) => ['siem', 'dlp', 'ids-ips', 'firewall'].includes(c))
      ) {
        score = 10;
        criteria.push('Pattern suitable for financial industry');
        criteriaKo.push('금융 산업에 적합한 패턴');
      }
      break;

    case 'healthcare':
      if (
        tags.includes('security') ||
        bestFor.includes('의료') ||
        allComponents.some((c) => ['dlp', 'iam', 'nac'].includes(c))
      ) {
        score = 10;
        criteria.push('Pattern suitable for healthcare industry');
        criteriaKo.push('의료 산업에 적합한 패턴');
      }
      break;

    case 'government':
      if (
        tags.includes('security') ||
        tags.includes('dmz') ||
        bestFor.includes('공공기관') ||
        bestFor.includes('정부')
      ) {
        score = 10;
        criteria.push('Pattern suitable for government sector');
        criteriaKo.push('정부/공공 부문에 적합한 패턴');
      }
      break;

    case 'ecommerce':
      if (
        tags.includes('web') ||
        tags.includes('cdn') ||
        tags.includes('high-availability') ||
        bestFor.includes('이커머스') ||
        bestFor.includes('전자상거래')
      ) {
        score = 10;
        criteria.push('Pattern suitable for e-commerce');
        criteriaKo.push('이커머스에 적합한 패턴');
      }
      break;

    case 'manufacturing':
      if (
        tags.includes('5g') ||
        tags.includes('iot') ||
        bestFor.includes('팩토리') ||
        bestFor.includes('물류') ||
        bestFor.includes('제조')
      ) {
        score = 10;
        criteria.push('Pattern suitable for manufacturing');
        criteriaKo.push('제조업에 적합한 패턴');
      }
      break;

    case 'education':
      if (
        tags.includes('web') ||
        tags.includes('simple') ||
        tags.includes('cloud-native')
      ) {
        score = 8;
        criteria.push('Pattern suitable for education');
        criteriaKo.push('교육 분야에 적합한 패턴');
      }
      break;

    case 'general':
      // General industry gets moderate scores for all patterns
      score = 6;
      break;
  }

  return { score, criteria, criteriaKo };
}

/**
 * Complexity fit (0-25).
 * Matches org size + budget to pattern complexity.
 */
function scoreComplexityFit(
  requirements: ConsultingRequirements,
  pattern: ArchitecturePattern,
): { score: number; criteria: string[]; criteriaKo: string[] } {
  const criteria: string[] = [];
  const criteriaKo: string[] = [];

  const ceiling = getExpectedComplexityCeiling(
    requirements.organizationSize,
    requirements.budgetRange,
  );

  const diff = pattern.complexity - ceiling;
  let score: number;

  if (diff === 0) {
    // Perfect match
    score = 25;
    criteria.push(`Complexity ${pattern.complexity} matches ${requirements.organizationSize}/${requirements.budgetRange} budget`);
    criteriaKo.push(`복잡도 ${pattern.complexity}이(가) ${requirements.organizationSize}/${requirements.budgetRange} 예산에 적합`);
  } else if (diff === -1) {
    // Slightly simpler than expected — still good
    score = 22;
    criteria.push('Slightly simpler than maximum budget allows — efficient choice');
    criteriaKo.push('예산 대비 약간 단순 — 효율적인 선택');
  } else if (diff === 1) {
    // Slightly over budget/size
    score = 15;
  } else if (diff < -1) {
    // Significantly simpler
    score = Math.max(5, 20 + diff * 5);
  } else {
    // Significantly over budget/size
    score = Math.max(0, 15 - diff * 5);
  }

  return { score: Math.min(25, Math.round(score)), criteria, criteriaKo };
}

// ---------------------------------------------------------------------------
// Core matching function
// ---------------------------------------------------------------------------

function buildReason(matchResult: PatternMatchResult): { reason: string; reasonKo: string } {
  const p = matchResult.pattern;
  const score = matchResult.matchScore;

  if (score >= 80) {
    return {
      reason: `${p.name} is an excellent match with ${score}/100 score. It aligns well with your scale, security, and architecture requirements.`,
      reasonKo: `${p.nameKo}은(는) ${score}/100 점수로 매우 적합합니다. 규모, 보안, 아키텍처 요구사항에 잘 부합합니다.`,
    };
  } else if (score >= 60) {
    return {
      reason: `${p.name} is a good match with ${score}/100 score. It covers most of your requirements with minor trade-offs.`,
      reasonKo: `${p.nameKo}은(는) ${score}/100 점수로 양호합니다. 대부분의 요구사항을 충족하며 약간의 절충이 있습니다.`,
    };
  } else if (score >= 40) {
    return {
      reason: `${p.name} partially matches with ${score}/100 score. Consider it as an alternative with modifications.`,
      reasonKo: `${p.nameKo}은(는) ${score}/100 점수로 부분적으로 적합합니다. 수정을 가하여 대안으로 고려하세요.`,
    };
  } else {
    return {
      reason: `${p.name} has a low match score of ${score}/100. It may not be suitable for your requirements.`,
      reasonKo: `${p.nameKo}은(는) ${score}/100으로 낮은 점수입니다. 요구사항에 적합하지 않을 수 있습니다.`,
    };
  }
}

/**
 * Match consulting requirements to architecture patterns.
 *
 * Scores each of the 30+ patterns across four dimensions and returns
 * a primary recommendation, alternatives, and unmatched requirements.
 */
export function matchRequirementsToPatterns(
  requirements: ConsultingRequirements,
): PatternMatchOutput {
  const matches: PatternMatchResult[] = [];

  for (const pattern of ARCHITECTURE_PATTERNS) {
    const scale = scoreScaleFitness(requirements, pattern);
    const security = scoreSecurityFit(requirements, pattern);
    const architecture = scoreArchitectureFit(requirements, pattern);
    const complexity = scoreComplexityFit(requirements, pattern);

    const totalScore = scale.score + security.score + architecture.score + complexity.score;

    const matchedCriteria = [
      ...scale.criteria,
      ...security.criteria,
      ...architecture.criteria,
      ...complexity.criteria,
    ];
    const matchedCriteriaKo = [
      ...scale.criteriaKo,
      ...security.criteriaKo,
      ...architecture.criteriaKo,
      ...complexity.criteriaKo,
    ];

    const suggestedComponents = suggestComponentsForPattern(pattern);

    const result: PatternMatchResult = {
      pattern,
      matchScore: totalScore,
      matchedCriteria,
      matchedCriteriaKo,
      reason: '', // Will be set below
      reasonKo: '',
      suggestedComponents,
      estimatedComplexity: pattern.complexity,
    };

    const { reason, reasonKo } = buildReason(result);
    result.reason = reason;
    result.reasonKo = reasonKo;

    matches.push(result);
  }

  // Sort by score descending
  matches.sort((a, b) => b.matchScore - a.matchScore);

  // Primary recommendation
  const primaryRecommendation =
    matches.length > 0 && matches[0].matchScore >= PRIMARY_THRESHOLD
      ? matches[0]
      : null;

  // Alternatives (skip primary, take next up to MAX_ALTERNATIVES)
  const startIdx = primaryRecommendation ? 1 : 0;
  const alternativePatterns = matches
    .slice(startIdx)
    .filter((m) => m.matchScore >= ALTERNATIVE_THRESHOLD)
    .slice(0, MAX_ALTERNATIVES);

  // Unmatched requirements
  const { unmatchedRequirements, unmatchedRequirementsKo } =
    detectUnmatchedRequirements(requirements, primaryRecommendation, alternativePatterns);

  return {
    requirements,
    matches,
    primaryRecommendation,
    alternativePatterns,
    unmatchedRequirements,
    unmatchedRequirementsKo,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function suggestComponentsForPattern(pattern: ArchitecturePattern): InfraNodeType[] {
  const components = new Set<InfraNodeType>();
  for (const c of pattern.requiredComponents) {
    components.add(c.type);
  }
  for (const c of pattern.optionalComponents) {
    components.add(c.type);
  }
  return [...components];
}

function detectUnmatchedRequirements(
  requirements: ConsultingRequirements,
  primary: PatternMatchResult | null,
  alternatives: PatternMatchResult[],
): { unmatchedRequirements: string[]; unmatchedRequirementsKo: string[] } {
  const unmatched: string[] = [];
  const unmatchedKo: string[] = [];

  if (!primary) {
    unmatched.push('No pattern scores above the primary recommendation threshold');
    unmatchedKo.push('주요 추천 기준을 넘는 패턴이 없습니다');
  }

  // Check if security requirements are fully met
  if (requirements.securityLevel === 'critical') {
    const bestMatch = primary ?? alternatives[0];
    if (bestMatch) {
      const allComponents = [
        ...bestMatch.pattern.requiredComponents.map((c) => c.type),
        ...bestMatch.pattern.optionalComponents.map((c) => c.type),
      ];
      const secCount = allComponents.filter((c) =>
        SECURITY_COMPONENTS.includes(c as InfraNodeType),
      ).length;
      if (secCount < 4) {
        unmatched.push('Critical security level requires additional security components beyond the matched pattern');
        unmatchedKo.push('크리티컬 보안 수준은 매칭된 패턴 외 추가 보안 구성요소가 필요합니다');
      }
    }
  }

  // Check availability target
  if (requirements.availabilityTarget >= 99.99) {
    const bestMatch = primary ?? alternatives[0];
    if (bestMatch && !bestMatch.pattern.tags.includes('high-availability') && !bestMatch.pattern.tags.includes('redundancy')) {
      unmatched.push(`Availability target of ${requirements.availabilityTarget}% may require additional HA components`);
      unmatchedKo.push(`${requirements.availabilityTarget}% 가용성 목표를 위해 추가 HA 구성요소가 필요할 수 있습니다`);
    }
  }

  // Check compliance frameworks
  if (requirements.complianceFrameworks.length > 0 && !primary) {
    unmatched.push(`Compliance frameworks (${requirements.complianceFrameworks.join(', ')}) need manual validation`);
    unmatchedKo.push(`컴플라이언스 프레임워크 (${requirements.complianceFrameworks.join(', ')})의 수동 검증이 필요합니다`);
  }

  return { unmatchedRequirements: unmatched, unmatchedRequirementsKo: unmatchedKo };
}

// ---------------------------------------------------------------------------
// Exported helper functions
// ---------------------------------------------------------------------------

/**
 * Retrieve a pattern by ID.
 */
export function getPatternById(id: string): ArchitecturePattern | undefined {
  return ARCHITECTURE_PATTERNS.find((p) => p.id === id);
}

/**
 * Get all patterns that have a given tag/category in their tags array.
 */
export function getPatternsByCategory(category: string): ArchitecturePattern[] {
  const lower = category.toLowerCase();
  return ARCHITECTURE_PATTERNS.filter((p) =>
    p.tags.some((t) => t.toLowerCase() === lower),
  );
}

/**
 * Suggest infrastructure components based on consulting requirements.
 *
 * Analyzes security level, cloud preference, industry, and scale to produce
 * a flat list of recommended InfraNodeType values.
 */
export function suggestComponentsForRequirements(
  requirements: ConsultingRequirements,
): InfraNodeType[] {
  const components = new Set<InfraNodeType>();

  // --- Security-driven suggestions ---
  switch (requirements.securityLevel) {
    case 'critical':
      components.add('firewall');
      components.add('waf');
      components.add('ids-ips');
      components.add('siem');
      components.add('soar');
      components.add('dlp');
      components.add('nac');
      components.add('mfa');
      components.add('iam');
      break;
    case 'high':
      components.add('firewall');
      components.add('waf');
      components.add('ids-ips');
      components.add('iam');
      components.add('mfa');
      break;
    case 'standard':
      components.add('firewall');
      components.add('waf');
      components.add('iam');
      break;
    case 'basic':
      components.add('firewall');
      break;
  }

  // --- Cloud preference-driven suggestions ---
  switch (requirements.cloudPreference) {
    case 'cloud-native':
      components.add('kubernetes');
      components.add('container');
      components.add('load-balancer');
      components.add('aws-vpc');
      break;
    case 'hybrid':
      components.add('private-cloud');
      components.add('vpn-gateway');
      components.add('load-balancer');
      break;
    case 'multi-cloud':
      components.add('load-balancer');
      components.add('dns');
      components.add('firewall');
      break;
    case 'on-premise':
      components.add('web-server');
      components.add('app-server');
      components.add('db-server');
      break;
  }

  // --- Scale-driven suggestions ---
  if (requirements.concurrentUsers > 1_000 || requirements.organizationSize === 'enterprise') {
    components.add('load-balancer');
    components.add('cache');
    components.add('cdn');
  }
  if (requirements.concurrentUsers > 10_000) {
    components.add('kubernetes');
    components.add('container');
  }

  // --- Industry-driven suggestions ---
  switch (requirements.industry) {
    case 'financial':
      components.add('siem');
      components.add('dlp');
      components.add('backup');
      break;
    case 'healthcare':
      components.add('dlp');
      components.add('backup');
      components.add('iam');
      break;
    case 'ecommerce':
      components.add('cdn');
      components.add('cache');
      components.add('load-balancer');
      components.add('waf');
      break;
    case 'manufacturing':
      // IoT/5G related
      break;
    case 'government':
      components.add('nac');
      components.add('ids-ips');
      break;
  }

  // --- Availability-driven suggestions ---
  if (requirements.availabilityTarget >= 99.99) {
    components.add('load-balancer');
    components.add('backup');
    components.add('dns');
  }

  // --- Data volume suggestions ---
  if (requirements.dataVolume === 'high' || requirements.dataVolume === 'massive') {
    components.add('db-server');
    components.add('cache');
    components.add('object-storage');
  }

  return [...components];
}
