/**
 * Gap Analysis Engine — Consulting Module
 *
 * Analyzes the gap between a user's current infrastructure (InfraSpec)
 * and a target architecture (ArchitecturePattern) or a set of consulting
 * requirements (ConsultingRequirements).
 *
 * Gap categories:
 *  1. Missing components  — required by pattern/requirements but absent
 *  2. Excess components   — present but outside target pattern scope
 *  3. Upgrade needed      — exists but needs HA / replication / scaling
 *  4. Security gaps       — missing security controls for the given level
 *  5. Compliance gaps     — missing components for selected frameworks
 *  6. Performance gaps    — missing components for traffic / data / user scale
 */

import type { InfraNodeType, InfraSpec, NodeCategory } from '@/types/infra';
import type { ArchitecturePattern } from '@/lib/knowledge/types';
import type {
  ConsultingRequirements,
  GapAnalysisResult,
  GapItem,
  GapSeverity,
  GapType,
  ConsultingSecurityLevel,
} from './types';
import { getCategoryForType } from '@/lib/data/infrastructureDB';
import { findMissingCompanions } from '@/lib/knowledge/companionResolver';

// ---------------------------------------------------------------------------
// Public options interface
// ---------------------------------------------------------------------------

export interface GapAnalysisOptions {
  /** If the user selected an architecture pattern */
  targetPattern?: ArchitecturePattern;
  /** If collected from the intake wizard */
  requirements?: ConsultingRequirements;
}

// ---------------------------------------------------------------------------
// Security-level → required component mapping
// ---------------------------------------------------------------------------

const SECURITY_COMPONENT_MAP: Record<ConsultingSecurityLevel, InfraNodeType[]> = {
  basic: ['firewall'],
  standard: ['firewall', 'waf'],
  high: ['firewall', 'waf', 'ids-ips', 'vpn-gateway'],
  critical: ['firewall', 'waf', 'ids-ips', 'vpn-gateway', 'siem', 'dlp', 'nac'],
};

// ---------------------------------------------------------------------------
// Compliance-framework → required component mapping
// ---------------------------------------------------------------------------

const COMPLIANCE_COMPONENT_MAP: Record<string, InfraNodeType[]> = {
  'pci-dss': ['firewall', 'waf', 'ids-ips', 'siem', 'dlp'],
  hipaa: ['firewall', 'vpn-gateway', 'backup', 'siem'],
  'iso-27001': ['firewall', 'ids-ips', 'siem', 'backup'],
  soc2: ['firewall', 'siem', 'backup', 'mfa'],
};

// ---------------------------------------------------------------------------
// Helper: resolve category for GapItem (maps to GapItem.category union)
// ---------------------------------------------------------------------------

function resolveCategoryForGap(
  nodeType: InfraNodeType,
): NodeCategory | 'external' | 'zone' {
  const cat = getCategoryForType(nodeType);
  // getCategoryForType returns NodeCategory | 'external'
  return cat;
}

// ---------------------------------------------------------------------------
// Helper: does the spec contain at least one node of a given type?
// ---------------------------------------------------------------------------

function hasNodeType(spec: InfraSpec, type: InfraNodeType): boolean {
  return spec.nodes.some((n) => n.type === type);
}

function countNodeType(spec: InfraSpec, type: InfraNodeType): number {
  return spec.nodes.filter((n) => n.type === type).length;
}

function currentNodeTypes(spec: InfraSpec): Set<InfraNodeType> {
  return new Set(spec.nodes.map((n) => n.type));
}

// ---------------------------------------------------------------------------
// 1. Missing Components
// ---------------------------------------------------------------------------

function detectMissingComponents(
  spec: InfraSpec,
  options: GapAnalysisOptions,
): GapItem[] {
  const gaps: GapItem[] = [];
  const nodeTypes = currentNodeTypes(spec);

  // From target pattern
  if (options.targetPattern) {
    for (const req of options.targetPattern.requiredComponents) {
      if (!nodeTypes.has(req.type)) {
        gaps.push({
          type: 'missing',
          severity: 'critical',
          component: req.type,
          category: resolveCategoryForGap(req.type),
          description: `Required component "${req.type}" is missing from the current architecture (needed by pattern "${options.targetPattern.name}").`,
          descriptionKo: `현재 아키텍처에 필수 구성 요소 "${req.type}"이(가) 없습니다 (패턴 "${options.targetPattern.nameKo}" 필수).`,
          suggestedAction: `Add at least ${req.minCount} "${req.type}" node(s) to the architecture.`,
          suggestedActionKo: `아키텍처에 "${req.type}" 노드를 최소 ${req.minCount}개 추가하세요.`,
          effort: 'medium',
          estimatedCostImpact: 'medium',
        });
      }
    }
  }

  // From requirements — security level required components
  if (options.requirements) {
    const requiredByLevel =
      SECURITY_COMPONENT_MAP[options.requirements.securityLevel] ?? [];
    for (const comp of requiredByLevel) {
      if (!nodeTypes.has(comp)) {
        // Only add if not already flagged from pattern
        const alreadyFlagged = gaps.some(
          (g) => g.component === comp && g.type === 'missing',
        );
        if (!alreadyFlagged) {
          gaps.push({
            type: 'missing',
            severity:
              options.requirements.securityLevel === 'critical'
                ? 'high'
                : 'medium',
            component: comp,
            category: resolveCategoryForGap(comp),
            description: `Component "${comp}" is required for security level "${options.requirements.securityLevel}" but is missing.`,
            descriptionKo: `보안 수준 "${options.requirements.securityLevel}"에 필요한 "${comp}" 구성 요소가 없습니다.`,
            suggestedAction: `Add "${comp}" to meet the required security level.`,
            suggestedActionKo: `요구되는 보안 수준을 충족하기 위해 "${comp}"을(를) 추가하세요.`,
            effort: 'medium',
            estimatedCostImpact: 'medium',
          });
        }
      }
    }
  }

  return gaps;
}

// ---------------------------------------------------------------------------
// 2. Excess Components
// ---------------------------------------------------------------------------

function detectExcessComponents(
  spec: InfraSpec,
  options: GapAnalysisOptions,
): GapItem[] {
  if (!options.targetPattern) return [];

  const gaps: GapItem[] = [];

  const requiredTypes = new Set(
    options.targetPattern.requiredComponents.map((c) => c.type),
  );
  const optionalTypes = new Set(
    options.targetPattern.optionalComponents.map((c) => c.type),
  );
  // Structural/external types are never flagged
  const ignoredTypes = new Set<InfraNodeType>([
    'user',
    'internet',
    'zone',
  ]);

  for (const node of spec.nodes) {
    if (ignoredTypes.has(node.type)) continue;
    if (!requiredTypes.has(node.type) && !optionalTypes.has(node.type)) {
      // Avoid duplicates for same type
      const alreadyFlagged = gaps.some(
        (g) => g.component === node.type && g.type === 'excess',
      );
      if (!alreadyFlagged) {
        gaps.push({
          type: 'excess',
          severity: 'low',
          component: node.type,
          category: resolveCategoryForGap(node.type),
          description: `Component "${node.type}" is not part of the target pattern "${options.targetPattern.name}".`,
          descriptionKo: `"${node.type}" 구성 요소는 대상 패턴 "${options.targetPattern.nameKo}"에 포함되지 않습니다.`,
          suggestedAction: `Review whether "${node.type}" is needed — it is outside the target architecture scope.`,
          suggestedActionKo: `"${node.type}"이(가) 필요한지 검토하세요 — 대상 아키텍처 범위를 벗어납니다.`,
          effort: 'low',
          estimatedCostImpact: 'low',
        });
      }
    }
  }

  return gaps;
}

// ---------------------------------------------------------------------------
// 3. Upgrade Needed
// ---------------------------------------------------------------------------

function detectUpgradeNeeded(
  spec: InfraSpec,
  options: GapAnalysisOptions,
): GapItem[] {
  const gaps: GapItem[] = [];
  const availability = options.requirements?.availabilityTarget ?? 99;

  // Single firewall with high-availability target
  if (
    hasNodeType(spec, 'firewall') &&
    countNodeType(spec, 'firewall') === 1 &&
    availability >= 99.95
  ) {
    gaps.push({
      type: 'upgrade',
      severity: 'high',
      component: 'firewall',
      category: resolveCategoryForGap('firewall'),
      description:
        'Single firewall detected with availability target >= 99.95%. Upgrade to HA pair recommended.',
      descriptionKo:
        '단일 방화벽이 감지되었으며 가용성 목표가 99.95% 이상입니다. HA 쌍으로 업그레이드를 권장합니다.',
      suggestedAction:
        'Deploy a second firewall in active-passive or active-active HA configuration.',
      suggestedActionKo:
        '두 번째 방화벽을 Active-Passive 또는 Active-Active HA 구성으로 배포하세요.',
      effort: 'high',
      estimatedCostImpact: 'high',
    });
  }

  // Single DB with high availability
  if (
    hasNodeType(spec, 'db-server') &&
    countNodeType(spec, 'db-server') === 1 &&
    availability >= 99.9
  ) {
    gaps.push({
      type: 'upgrade',
      severity: 'high',
      component: 'db-server',
      category: resolveCategoryForGap('db-server'),
      description:
        'Single database server with availability target >= 99.9%. Replication or clustering recommended.',
      descriptionKo:
        '단일 데이터베이스 서버이며 가용성 목표가 99.9% 이상입니다. 복제 또는 클러스터링을 권장합니다.',
      suggestedAction:
        'Add a replica or set up database clustering for high availability.',
      suggestedActionKo:
        '고가용성을 위해 복제본을 추가하거나 데이터베이스 클러스터링을 설정하세요.',
      effort: 'high',
      estimatedCostImpact: 'high',
    });
  }

  // Multiple web servers but no load balancer
  if (
    countNodeType(spec, 'web-server') > 1 &&
    !hasNodeType(spec, 'load-balancer')
  ) {
    gaps.push({
      type: 'upgrade',
      severity: 'medium',
      component: 'load-balancer',
      category: resolveCategoryForGap('load-balancer'),
      description:
        'Multiple web servers detected without a load balancer. Traffic distribution is unmanaged.',
      descriptionKo:
        '로드 밸런서 없이 다수의 웹 서버가 감지되었습니다. 트래픽 분산이 관리되지 않고 있습니다.',
      suggestedAction:
        'Add a load balancer to distribute traffic across web servers.',
      suggestedActionKo:
        '웹 서버 간 트래픽 분산을 위해 로드 밸런서를 추가하세요.',
      effort: 'medium',
      estimatedCostImpact: 'medium',
    });
  }

  return gaps;
}

// ---------------------------------------------------------------------------
// 4. Security Gaps
// ---------------------------------------------------------------------------

function detectSecurityGaps(
  spec: InfraSpec,
  options: GapAnalysisOptions,
): GapItem[] {
  const gaps: GapItem[] = [];
  const level = options.requirements?.securityLevel ?? 'basic';

  // No firewall at all → always critical
  if (!hasNodeType(spec, 'firewall')) {
    gaps.push({
      type: 'security',
      severity: 'critical',
      component: 'firewall',
      category: resolveCategoryForGap('firewall'),
      description:
        'No firewall detected. The architecture has no perimeter defense.',
      descriptionKo:
        '방화벽이 감지되지 않았습니다. 아키텍처에 경계 방어가 없습니다.',
      suggestedAction: 'Deploy a perimeter firewall immediately.',
      suggestedActionKo: '즉시 경계 방화벽을 배포하세요.',
      effort: 'medium',
      estimatedCostImpact: 'medium',
    });
  }

  // Web server without WAF
  if (hasNodeType(spec, 'web-server') && !hasNodeType(spec, 'waf')) {
    gaps.push({
      type: 'security',
      severity: 'medium',
      component: 'waf',
      category: resolveCategoryForGap('waf'),
      description:
        'Web server detected without a WAF. Web application attacks are not mitigated.',
      descriptionKo:
        'WAF 없이 웹 서버가 감지되었습니다. 웹 애플리케이션 공격이 차단되지 않습니다.',
      suggestedAction:
        'Add a Web Application Firewall (WAF) in front of web servers.',
      suggestedActionKo:
        '웹 서버 앞에 웹 애플리케이션 방화벽(WAF)을 추가하세요.',
      effort: 'medium',
      estimatedCostImpact: 'medium',
    });
  }

  // Critical security level without SIEM
  if (level === 'critical' && !hasNodeType(spec, 'siem')) {
    gaps.push({
      type: 'security',
      severity: 'critical',
      component: 'siem',
      category: resolveCategoryForGap('siem'),
      description:
        'Security level "critical" requires SIEM for centralized threat monitoring, but none detected.',
      descriptionKo:
        '보안 수준 "critical"에는 중앙 집중식 위협 모니터링을 위한 SIEM이 필요하지만 감지되지 않았습니다.',
      suggestedAction:
        'Deploy a SIEM solution for log aggregation and threat detection.',
      suggestedActionKo:
        '로그 집계 및 위협 탐지를 위한 SIEM 솔루션을 배포하세요.',
      effort: 'high',
      estimatedCostImpact: 'high',
    });
  }

  // High security level without IDS/IPS
  if (
    (level === 'high' || level === 'critical') &&
    !hasNodeType(spec, 'ids-ips')
  ) {
    gaps.push({
      type: 'security',
      severity: 'high',
      component: 'ids-ips',
      category: resolveCategoryForGap('ids-ips'),
      description: `Security level "${level}" requires IDS/IPS for intrusion detection, but none detected.`,
      descriptionKo: `보안 수준 "${level}"에는 침입 탐지를 위한 IDS/IPS가 필요하지만 감지되지 않았습니다.`,
      suggestedAction:
        'Deploy an IDS/IPS system for network intrusion detection and prevention.',
      suggestedActionKo:
        '네트워크 침입 탐지 및 방지를 위한 IDS/IPS 시스템을 배포하세요.',
      effort: 'medium',
      estimatedCostImpact: 'medium',
    });
  }

  return gaps;
}

// ---------------------------------------------------------------------------
// 5. Compliance Gaps
// ---------------------------------------------------------------------------

function detectComplianceGaps(
  spec: InfraSpec,
  options: GapAnalysisOptions,
): GapItem[] {
  const gaps: GapItem[] = [];
  const frameworks = options.requirements?.complianceFrameworks ?? [];

  for (const framework of frameworks) {
    const requiredComponents = COMPLIANCE_COMPONENT_MAP[framework];
    if (!requiredComponents) continue;

    for (const comp of requiredComponents) {
      if (!hasNodeType(spec, comp)) {
        gaps.push({
          type: 'compliance',
          severity: framework === 'pci-dss' ? 'critical' : 'high',
          component: comp,
          category: resolveCategoryForGap(comp),
          description: `Compliance framework "${framework}" requires "${comp}" but it is missing.`,
          descriptionKo: `컴플라이언스 프레임워크 "${framework}"에서 요구하는 "${comp}"이(가) 없습니다.`,
          suggestedAction: `Add "${comp}" to meet ${framework} compliance requirements.`,
          suggestedActionKo: `${framework} 컴플라이언스 요구사항을 충족하기 위해 "${comp}"을(를) 추가하세요.`,
          effort: 'medium',
          estimatedCostImpact: 'medium',
        });
      }
    }
  }

  return gaps;
}

// ---------------------------------------------------------------------------
// 6. Performance Gaps
// ---------------------------------------------------------------------------

function detectPerformanceGaps(
  spec: InfraSpec,
  options: GapAnalysisOptions,
): GapItem[] {
  const gaps: GapItem[] = [];
  if (!options.requirements) return gaps;

  const { dataVolume, trafficPattern, concurrentUsers } = options.requirements;

  // Massive data volume without CDN
  if (dataVolume === 'massive' && !hasNodeType(spec, 'cdn')) {
    gaps.push({
      type: 'performance',
      severity: 'high',
      component: 'cdn',
      category: resolveCategoryForGap('cdn'),
      description:
        'Massive data volume without a CDN. Content delivery will be slow for distributed users.',
      descriptionKo:
        'CDN 없이 대용량 데이터를 처리합니다. 분산된 사용자에 대한 콘텐츠 전송이 느려집니다.',
      suggestedAction:
        'Deploy a CDN for edge caching and efficient content delivery.',
      suggestedActionKo:
        '엣지 캐싱 및 효율적인 콘텐츠 전달을 위해 CDN을 배포하세요.',
      effort: 'medium',
      estimatedCostImpact: 'medium',
    });
  }

  // Bursty traffic without load balancer
  if (trafficPattern === 'bursty' && !hasNodeType(spec, 'load-balancer')) {
    gaps.push({
      type: 'performance',
      severity: 'high',
      component: 'load-balancer',
      category: resolveCategoryForGap('load-balancer'),
      description:
        'Bursty traffic pattern without a load balancer. Traffic spikes may overwhelm servers.',
      descriptionKo:
        '로드 밸런서 없이 버스트 트래픽 패턴입니다. 트래픽 급증 시 서버가 과부하될 수 있습니다.',
      suggestedAction:
        'Add a load balancer to handle traffic spikes gracefully.',
      suggestedActionKo:
        '트래픽 급증을 원활하게 처리하기 위해 로드 밸런서를 추가하세요.',
      effort: 'medium',
      estimatedCostImpact: 'medium',
    });
  }

  // High concurrent users without cache
  if (concurrentUsers > 10000 && !hasNodeType(spec, 'cache')) {
    gaps.push({
      type: 'performance',
      severity: 'medium',
      component: 'cache',
      category: resolveCategoryForGap('cache'),
      description:
        'Over 10,000 concurrent users without a cache layer. Database will be a bottleneck.',
      descriptionKo:
        '캐시 레이어 없이 10,000명 이상의 동시 사용자를 처리합니다. 데이터베이스가 병목이 됩니다.',
      suggestedAction:
        'Add a caching layer (Redis, Memcached) to offload the database.',
      suggestedActionKo:
        '데이터베이스 부하를 줄이기 위해 캐시 레이어(Redis, Memcached)를 추가하세요.',
      effort: 'low',
      estimatedCostImpact: 'low',
    });
  }

  return gaps;
}

// ---------------------------------------------------------------------------
// 7. Companion Gaps (from relationship graph + product/service overrides)
// ---------------------------------------------------------------------------

function detectCompanionGaps(
  spec: InfraSpec,
  _options: GapAnalysisOptions,
): GapItem[] {
  const gaps: GapItem[] = [];
  const nodeTypes = currentNodeTypes(spec);
  const flaggedPairs = new Set<string>(); // avoid duplicates: "source→target"

  for (const type of nodeTypes) {
    const missing = findMissingCompanions(type, nodeTypes);

    for (const req of missing.missingRequired) {
      const key = `${type}→${req.componentType}`;
      if (flaggedPairs.has(key)) continue;
      flaggedPairs.add(key);

      gaps.push({
        type: 'companion',
        severity: req.severity === 'critical' ? 'critical' : 'high',
        component: req.componentType,
        category: resolveCategoryForGap(req.componentType),
        description: `"${type}" requires "${req.componentType}": ${req.reason}`,
        descriptionKo: `"${type}"에 "${req.componentType}"이(가) 필수입니다: ${req.reasonKo}`,
        suggestedAction: `Add "${req.componentType}" to support "${type}".`,
        suggestedActionKo: `"${type}"을(를) 지원하기 위해 "${req.componentType}"을(를) 추가하세요.`,
        effort: 'medium',
        estimatedCostImpact: 'medium',
      });
    }

    for (const rec of missing.missingRecommended) {
      const key = `${type}→${rec.componentType}`;
      if (flaggedPairs.has(key)) continue;
      flaggedPairs.add(key);

      gaps.push({
        type: 'companion',
        severity: rec.severity === 'high' ? 'medium' : 'low',
        component: rec.componentType,
        category: resolveCategoryForGap(rec.componentType),
        description: `"${type}" recommends "${rec.componentType}": ${rec.reason}`,
        descriptionKo: `"${type}"에 "${rec.componentType}"을(를) 권장합니다: ${rec.reasonKo}`,
        suggestedAction: `Consider adding "${rec.componentType}" alongside "${type}".`,
        suggestedActionKo: `"${type}"과(와) 함께 "${rec.componentType}" 추가를 고려하세요.`,
        effort: 'low',
        estimatedCostImpact: 'low',
      });
    }
  }

  return gaps;
}

// ---------------------------------------------------------------------------
// Score calculation
// ---------------------------------------------------------------------------

const SEVERITY_DEDUCTIONS: Record<GapSeverity, number> = {
  critical: 15,
  high: 10,
  medium: 5,
  low: 2,
};

/**
 * Calculate an overall architecture gap score (0-100).
 * Starts at 100 and deducts per gap based on severity.
 */
export function calculateGapScore(gaps: GapItem[]): number {
  let score = 100;
  for (const gap of gaps) {
    score -= SEVERITY_DEDUCTIONS[gap.severity];
  }
  return Math.max(0, score);
}

// ---------------------------------------------------------------------------
// Summary generation
// ---------------------------------------------------------------------------

function generateSummary(
  gaps: GapItem[],
  score: number,
): { summary: string; summaryKo: string } {
  const criticalCount = gaps.filter((g) => g.severity === 'critical').length;
  const highCount = gaps.filter((g) => g.severity === 'high').length;
  const totalGaps = gaps.length;

  if (totalGaps === 0) {
    return {
      summary:
        'Your architecture fully meets the target requirements. No gaps detected.',
      summaryKo:
        '아키텍처가 목표 요구사항을 완전히 충족합니다. 감지된 갭이 없습니다.',
    };
  }

  // Build severity breakdown
  const severityParts: string[] = [];
  const severityPartsKo: string[] = [];
  if (criticalCount > 0) {
    severityParts.push(`${criticalCount} critical`);
    severityPartsKo.push(`심각 ${criticalCount}건`);
  }
  if (highCount > 0) {
    severityParts.push(`${highCount} high`);
    severityPartsKo.push(`높음 ${highCount}건`);
  }
  const mediumCount = gaps.filter((g) => g.severity === 'medium').length;
  if (mediumCount > 0) {
    severityParts.push(`${mediumCount} medium`);
    severityPartsKo.push(`중간 ${mediumCount}건`);
  }
  const lowCount = gaps.filter((g) => g.severity === 'low').length;
  if (lowCount > 0) {
    severityParts.push(`${lowCount} low`);
    severityPartsKo.push(`낮음 ${lowCount}건`);
  }

  const coveragePercent = score;

  const summary = `Your architecture scores ${coveragePercent}/100. ${totalGaps} gap(s) found: ${severityParts.join(', ')}.`;
  const summaryKo = `아키텍처 점수: ${coveragePercent}/100. ${totalGaps}건의 갭 발견: ${severityPartsKo.join(', ')}.`;

  return { summary, summaryKo };
}

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/**
 * Get the list of required infrastructure components for a given security level.
 */
export function getRequiredComponentsForSecurity(
  level: ConsultingSecurityLevel,
): InfraNodeType[] {
  return [...(SECURITY_COMPONENT_MAP[level] ?? [])];
}

/**
 * Get the list of required infrastructure components for a compliance framework.
 */
export function getRequiredComponentsForCompliance(
  framework: string,
): InfraNodeType[] {
  return [...(COMPLIANCE_COMPONENT_MAP[framework] ?? [])];
}

// ---------------------------------------------------------------------------
// Main analysis function
// ---------------------------------------------------------------------------

/**
 * Analyze gaps between the current infrastructure spec and the target
 * architecture / consulting requirements.
 */
export function analyzeGaps(
  currentSpec: InfraSpec,
  options: GapAnalysisOptions = {},
): GapAnalysisResult {
  const missingComponents = detectMissingComponents(currentSpec, options);
  const excessComponents = detectExcessComponents(currentSpec, options);
  const upgradeNeeded = detectUpgradeNeeded(currentSpec, options);
  const securityGaps = detectSecurityGaps(currentSpec, options);
  const complianceGaps = detectComplianceGaps(currentSpec, options);
  const performanceGaps = detectPerformanceGaps(currentSpec, options);
  const companionGaps = detectCompanionGaps(currentSpec, options);

  const allGaps: GapItem[] = [
    ...missingComponents,
    ...excessComponents,
    ...upgradeNeeded,
    ...securityGaps,
    ...complianceGaps,
    ...performanceGaps,
    ...companionGaps,
  ];

  const overallScore = calculateGapScore(allGaps);
  const { summary, summaryKo } = generateSummary(allGaps, overallScore);

  return {
    currentSpec,
    targetPattern: options.targetPattern ?? null,
    requirements: options.requirements ?? null,
    gaps: allGaps,
    missingComponents,
    excessComponents,
    upgradeNeeded,
    securityGaps,
    complianceGaps,
    performanceGaps,
    companionGaps,
    overallScore,
    summary,
    summaryKo,
  };
}
