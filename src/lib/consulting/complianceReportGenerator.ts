/**
 * Compliance Report Generator
 *
 * Generates structured ComplianceReportData for infrastructure specs
 * against one or more compliance frameworks. The output is consumed
 * by pdfReportGenerator.ts for actual PDF rendering.
 *
 * Leverages:
 * - analyzeComplianceGap() from industryCompliance.ts
 * - detectAntiPatterns() from antipatterns.ts
 * - checkCompliance() from complianceChecker.ts
 */

import type { InfraSpec, InfraNodeType, NodeCategory } from '@/types/infra';
import type {
  ComplianceReportData,
  ComplianceReportSection,
  ComplianceReportTable,
  GapItem,
  GapSeverity,
  IndustryType,
  ConsultingSecurityLevel,
} from './types';
import { checkCompliance, type ComplianceFramework } from '@/lib/audit/complianceChecker';
import { detectAntiPatterns } from '@/lib/knowledge/antipatterns';
import { getCategoryForType } from '@/lib/data/infrastructureDB';

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface ComplianceReportOptions {
  industry: IndustryType;
  organization: string;
  frameworks: string[]; // 'pci-dss', 'hipaa', 'iso-27001', 'soc2', 'gdpr', 'nist-800-53'
  securityLevel?: ConsultingSecurityLevel;
  includeAntiPatterns?: boolean; // default true
  includeRecommendations?: boolean; // default true
}

// ---------------------------------------------------------------------------
// Framework Data
// ---------------------------------------------------------------------------

interface FrameworkInfo {
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  requiredComponents: InfraNodeType[];
  /** Maps to ComplianceFramework used by complianceChecker, or null if not supported there */
  complianceFrameworkId: ComplianceFramework | null;
}

const FRAMEWORK_DATA: Record<string, FrameworkInfo> = {
  'pci-dss': {
    name: 'PCI-DSS',
    nameKo: 'PCI-DSS',
    description: 'Payment Card Industry Data Security Standard',
    descriptionKo: '결제 카드 산업 데이터 보안 표준',
    requiredComponents: ['firewall', 'waf', 'ids-ips', 'siem', 'dlp', 'mfa', 'vpn-gateway'],
    complianceFrameworkId: 'pci-dss',
  },
  'hipaa': {
    name: 'HIPAA',
    nameKo: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act',
    descriptionKo: '건강보험 이동성 및 책임에 관한 법률',
    requiredComponents: ['firewall', 'vpn-gateway', 'backup', 'siem', 'mfa', 'dlp'],
    complianceFrameworkId: 'hipaa',
  },
  'iso-27001': {
    name: 'ISO 27001',
    nameKo: 'ISO 27001',
    description: 'Information Security Management',
    descriptionKo: '정보 보안 관리 체계',
    requiredComponents: ['firewall', 'ids-ips', 'siem', 'backup', 'mfa', 'dlp'],
    complianceFrameworkId: 'iso27001',
  },
  'soc2': {
    name: 'SOC 2',
    nameKo: 'SOC 2',
    description: 'Service Organization Control 2',
    descriptionKo: '서비스 조직 통제 2',
    requiredComponents: ['firewall', 'siem', 'backup', 'mfa'],
    complianceFrameworkId: null,
  },
  'gdpr': {
    name: 'GDPR',
    nameKo: 'GDPR',
    description: 'General Data Protection Regulation',
    descriptionKo: '일반 데이터 보호 규정 (EU)',
    requiredComponents: ['firewall', 'dlp', 'backup', 'vpn-gateway'],
    complianceFrameworkId: 'gdpr',
  },
  'nist-800-53': {
    name: 'NIST 800-53',
    nameKo: 'NIST 800-53',
    description: 'NIST Security and Privacy Controls',
    descriptionKo: 'NIST 보안 및 개인정보 보호 통제',
    requiredComponents: ['firewall', 'waf', 'ids-ips', 'siem', 'dlp', 'mfa', 'nac', 'soar'],
    complianceFrameworkId: null,
  },
};

// ---------------------------------------------------------------------------
// Security Level Requirements
// ---------------------------------------------------------------------------

interface ConsultingSecurityLevelRequirement {
  encryption: InfraNodeType[];
  perimeterDefense: InfraNodeType[];
  monitoring: InfraNodeType[];
  accessControl: InfraNodeType[];
}

const SECURITY_LEVEL_REQUIREMENTS: Record<ConsultingSecurityLevel, ConsultingSecurityLevelRequirement> = {
  basic: {
    encryption: ['vpn-gateway'],
    perimeterDefense: ['firewall'],
    monitoring: [],
    accessControl: ['mfa'],
  },
  standard: {
    encryption: ['vpn-gateway'],
    perimeterDefense: ['firewall', 'waf'],
    monitoring: ['siem'],
    accessControl: ['mfa'],
  },
  high: {
    encryption: ['vpn-gateway'],
    perimeterDefense: ['firewall', 'waf', 'ids-ips'],
    monitoring: ['siem'],
    accessControl: ['mfa', 'nac'],
  },
  critical: {
    encryption: ['vpn-gateway'],
    perimeterDefense: ['firewall', 'waf', 'ids-ips', 'dlp'],
    monitoring: ['siem', 'soar'],
    accessControl: ['mfa', 'nac', 'ztna-broker'],
  },
};

// ---------------------------------------------------------------------------
// Component Korean names
// ---------------------------------------------------------------------------

const COMPONENT_NAMES_KO: Partial<Record<InfraNodeType, string>> = {
  'firewall': '방화벽',
  'waf': 'WAF (웹 애플리케이션 방화벽)',
  'ids-ips': 'IDS/IPS (침입탐지/방지)',
  'mfa': 'MFA (다중 인증)',
  'siem': 'SIEM (보안 정보 이벤트 관리)',
  'dlp': 'DLP (데이터 유출 방지)',
  'nac': 'NAC (네트워크 접근 제어)',
  'vpn-gateway': 'VPN 게이트웨이',
  'backup': '백업',
  'soar': 'SOAR (보안 오케스트레이션)',
  'ztna-broker': 'ZTNA 브로커',
  'casb': 'CASB (클라우드 접근 보안 브로커)',
  'sase-gateway': 'SASE 게이트웨이',
};

function getComponentNameKo(type: InfraNodeType): string {
  return COMPONENT_NAMES_KO[type] ?? type;
}

// ---------------------------------------------------------------------------
// Public API: getFrameworkDescription
// ---------------------------------------------------------------------------

export function getFrameworkDescription(framework: string): {
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
} {
  const info = FRAMEWORK_DATA[framework];
  if (!info) {
    return {
      name: framework.toUpperCase(),
      nameKo: framework.toUpperCase(),
      description: `${framework} compliance framework`,
      descriptionKo: `${framework} 컴플라이언스 프레임워크`,
    };
  }
  return {
    name: info.name,
    nameKo: info.nameKo,
    description: info.description,
    descriptionKo: info.descriptionKo,
  };
}

// ---------------------------------------------------------------------------
// Public API: calculateComplianceScore
// ---------------------------------------------------------------------------

export function calculateComplianceScore(spec: InfraSpec, frameworks: string[]): number {
  if (frameworks.length === 0) return 0;

  const presentTypes = new Set(spec.nodes.map((n) => n.type));
  let totalRequired = 0;
  let totalPresent = 0;

  for (const fw of frameworks) {
    const info = FRAMEWORK_DATA[fw];
    if (!info) continue;

    for (const comp of info.requiredComponents) {
      totalRequired++;
      if (presentTypes.has(comp)) {
        totalPresent++;
      }
    }
  }

  if (totalRequired === 0) return 0;
  return Math.round((totalPresent / totalRequired) * 100);
}

// ---------------------------------------------------------------------------
// Public API: getComplianceStatus
// ---------------------------------------------------------------------------

export function getComplianceStatus(
  score: number,
): 'compliant' | 'partially-compliant' | 'non-compliant' {
  if (score >= 80) return 'compliant';
  if (score >= 50) return 'partially-compliant';
  return 'non-compliant';
}

// ---------------------------------------------------------------------------
// Public API: generateComplianceReport
// ---------------------------------------------------------------------------

export function generateComplianceReport(
  spec: InfraSpec,
  options: ComplianceReportOptions,
): ComplianceReportData {
  const includeAntiPatterns = options.includeAntiPatterns ?? true;
  const includeRecommendations = options.includeRecommendations ?? true;
  const securityLevel = options.securityLevel ?? 'standard';

  const overallScore = calculateComplianceScore(spec, options.frameworks);
  const status = getComplianceStatus(overallScore);

  const allGaps: GapItem[] = [];
  const sections: ComplianceReportSection[] = [];

  // 1. Executive Summary
  const executiveSummarySection = buildExecutiveSummarySection(
    overallScore,
    status,
    options,
    allGaps,
  );

  // 2. Framework Analysis Sections
  const frameworkSections = buildFrameworkSections(spec, options.frameworks, allGaps);

  // 3. Anti-Pattern Detection
  let antiPatternSection: ComplianceReportSection | null = null;
  if (includeAntiPatterns) {
    antiPatternSection = buildAntiPatternSection(spec);
  }

  // 4. Security Posture Assessment
  const securityPostureSection = buildSecurityPostureSection(spec, securityLevel);

  // 5. Recommendations
  const { recommendations, recommendationsKo, recommendationSection } =
    buildRecommendations(allGaps, options.frameworks, securityLevel, includeRecommendations);

  // Count gaps by severity for executive summary update
  const gapCounts = countGapsBySeverity(allGaps);

  // Rebuild executive summary with actual gap counts
  const { executiveSummary, executiveSummaryKo, updatedSection } =
    buildExecutiveSummaryText(overallScore, status, gapCounts, options);

  // Assemble sections
  sections.push(updatedSection);
  sections.push(...frameworkSections);
  if (antiPatternSection) {
    sections.push(antiPatternSection);
  }
  sections.push(securityPostureSection);
  if (recommendationSection) {
    sections.push(recommendationSection);
  }

  return {
    metadata: {
      title: `Compliance Report — ${options.organization}`,
      organization: options.organization,
      industry: options.industry,
      generatedAt: new Date().toISOString(),
      frameworks: options.frameworks,
    },
    executiveSummary,
    executiveSummaryKo,
    overallScore,
    sections,
    gaps: allGaps,
    recommendations,
    recommendationsKo,
  };
}

// ---------------------------------------------------------------------------
// Internal: Executive Summary
// ---------------------------------------------------------------------------

function countGapsBySeverity(gaps: GapItem[]): Record<GapSeverity, number> {
  const counts: Record<GapSeverity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const gap of gaps) {
    counts[gap.severity]++;
  }
  return counts;
}

function buildExecutiveSummarySection(
  _score: number,
  _status: string,
  _options: ComplianceReportOptions,
  _gaps: GapItem[],
): ComplianceReportSection {
  // Placeholder — replaced by buildExecutiveSummaryText after gaps are populated
  return {
    title: 'Executive Summary',
    titleKo: '요약 보고서',
    content: [],
    contentKo: [],
  };
}

function buildExecutiveSummaryText(
  score: number,
  status: string,
  gapCounts: Record<GapSeverity, number>,
  options: ComplianceReportOptions,
): {
  executiveSummary: string;
  executiveSummaryKo: string;
  updatedSection: ComplianceReportSection;
} {
  const statusLabel =
    status === 'compliant'
      ? 'Compliant'
      : status === 'partially-compliant'
        ? 'Partially Compliant'
        : 'Non-Compliant';

  const statusLabelKo =
    status === 'compliant'
      ? '준수'
      : status === 'partially-compliant'
        ? '부분 준수'
        : '미준수';

  const frameworkList = options.frameworks
    .map((fw) => {
      const info = FRAMEWORK_DATA[fw];
      return info ? info.name : fw.toUpperCase();
    })
    .join(', ');

  const executiveSummary =
    `Overall compliance score: ${score}/100 (${statusLabel}). ` +
    `Assessed against: ${frameworkList}. ` +
    `Gaps found: ${gapCounts.critical} critical, ${gapCounts.high} high, ` +
    `${gapCounts.medium} medium, ${gapCounts.low} low.`;

  const executiveSummaryKo =
    `전체 컴플라이언스 점수: ${score}/100 (${statusLabelKo}). ` +
    `평가 프레임워크: ${frameworkList}. ` +
    `발견된 격차: 심각 ${gapCounts.critical}건, 높음 ${gapCounts.high}건, ` +
    `중간 ${gapCounts.medium}건, 낮음 ${gapCounts.low}건.`;

  const updatedSection: ComplianceReportSection = {
    title: 'Executive Summary',
    titleKo: '요약 보고서',
    content: [
      `Compliance Status: ${statusLabel}`,
      `Overall Score: ${score}/100`,
      `Frameworks Assessed: ${frameworkList}`,
      `Total Gaps: ${gapCounts.critical + gapCounts.high + gapCounts.medium + gapCounts.low}`,
    ],
    contentKo: [
      `컴플라이언스 상태: ${statusLabelKo}`,
      `전체 점수: ${score}/100`,
      `평가 프레임워크: ${frameworkList}`,
      `총 격차: ${gapCounts.critical + gapCounts.high + gapCounts.medium + gapCounts.low}건`,
    ],
  };

  return { executiveSummary, executiveSummaryKo, updatedSection };
}

// ---------------------------------------------------------------------------
// Internal: Framework Analysis
// ---------------------------------------------------------------------------

function buildFrameworkSections(
  spec: InfraSpec,
  frameworks: string[],
  allGaps: GapItem[],
): ComplianceReportSection[] {
  const presentTypes = new Set(spec.nodes.map((n) => n.type));
  const sections: ComplianceReportSection[] = [];

  for (const fw of frameworks) {
    const info = FRAMEWORK_DATA[fw];
    if (!info) continue;

    const met: InfraNodeType[] = [];
    const notMet: InfraNodeType[] = [];
    const tableRows: string[][] = [];

    for (const comp of info.requiredComponents) {
      const present = presentTypes.has(comp);
      const statusStr = present ? 'Present' : 'Missing';

      tableRows.push([comp, 'Required', present ? 'Yes' : 'No', statusStr]);

      if (present) {
        met.push(comp);
      } else {
        notMet.push(comp);

        // Create gap item
        const severity = getGapSeverityForComponent(comp);
        const category = getCategoryForType(comp) as NodeCategory | 'external' | 'zone';

        const gap: GapItem = {
          type: 'compliance',
          severity,
          component: comp,
          category,
          description: `Missing ${comp} required by ${info.name}`,
          descriptionKo: `${info.nameKo} 준수를 위해 ${getComponentNameKo(comp)} 필요`,
          suggestedAction: `Deploy ${comp} to meet ${info.name} requirements`,
          suggestedActionKo: `${info.nameKo} 요구사항 충족을 위해 ${getComponentNameKo(comp)} 배포`,
          effort: getEffortForComponent(comp),
        };
        allGaps.push(gap);
      }
    }

    const table: ComplianceReportTable = {
      headers: ['Component', 'Requirement', 'Present', 'Status'],
      headersKo: ['컴포넌트', '요구사항', '존재 여부', '상태'],
      rows: tableRows,
    };

    // Run complianceChecker for supported frameworks
    let checkerContent: string[] = [];
    let checkerContentKo: string[] = [];
    if (info.complianceFrameworkId) {
      const report = checkCompliance(spec, info.complianceFrameworkId);
      checkerContent = [
        `${info.name} — Checker Score: ${report.score}/100`,
        `Passed: ${report.passed}/${report.totalChecks}, Failed: ${report.failed}, Partial: ${report.partial}`,
      ];
      checkerContentKo = [
        `${info.nameKo} — 점검 점수: ${report.score}/100`,
        `통과: ${report.passed}/${report.totalChecks}, 실패: ${report.failed}, 부분 통과: ${report.partial}`,
      ];
    }

    sections.push({
      title: `${info.name} — Framework Analysis`,
      titleKo: `${info.nameKo} — 프레임워크 분석`,
      content: [
        `${info.name}: ${info.description}`,
        `Requirements met: ${met.length}/${info.requiredComponents.length}`,
        `Missing components: ${notMet.length > 0 ? notMet.join(', ') : 'None'}`,
        ...checkerContent,
      ],
      contentKo: [
        `${info.nameKo}: ${info.descriptionKo}`,
        `충족 요구사항: ${met.length}/${info.requiredComponents.length}`,
        `누락 컴포넌트: ${notMet.length > 0 ? notMet.map(getComponentNameKo).join(', ') : '없음'}`,
        ...checkerContentKo,
      ],
      tables: [table],
    });
  }

  return sections;
}

// ---------------------------------------------------------------------------
// Internal: Anti-Pattern Detection
// ---------------------------------------------------------------------------

function buildAntiPatternSection(spec: InfraSpec): ComplianceReportSection {
  const detected = detectAntiPatterns(spec);

  if (detected.length === 0) {
    return {
      title: 'Anti-Pattern Detection',
      titleKo: '안티패턴 탐지',
      content: ['No anti-patterns detected in the current architecture.'],
      contentKo: ['현재 아키텍처에서 안티패턴이 탐지되지 않았습니다.'],
    };
  }

  const rows: string[][] = detected.map((ap) => [
    ap.name,
    ap.severity,
    ap.impactKo,
    ap.solutionKo,
  ]);

  const table: ComplianceReportTable = {
    headers: ['Anti-Pattern', 'Severity', 'Impact', 'Remediation'],
    headersKo: ['안티패턴', '심각도', '영향', '개선 방안'],
    rows,
  };

  return {
    title: 'Anti-Pattern Detection',
    titleKo: '안티패턴 탐지',
    content: [
      `${detected.length} anti-pattern(s) detected.`,
      ...detected.map(
        (ap) => `[${ap.severity.toUpperCase()}] ${ap.name}: ${ap.solutionKo}`,
      ),
    ],
    contentKo: [
      `${detected.length}개의 안티패턴이 탐지되었습니다.`,
      ...detected.map(
        (ap) => `[${ap.severity.toUpperCase()}] ${ap.nameKo}: ${ap.solutionKo}`,
      ),
    ],
    tables: [table],
  };
}

// ---------------------------------------------------------------------------
// Internal: Security Posture Assessment
// ---------------------------------------------------------------------------

function buildSecurityPostureSection(
  spec: InfraSpec,
  securityLevel: ConsultingSecurityLevel,
): ComplianceReportSection {
  const presentTypes = new Set(spec.nodes.map((n) => n.type));
  const requirements = SECURITY_LEVEL_REQUIREMENTS[securityLevel];

  const securityComponents = spec.nodes.filter(
    (n) => getCategoryForType(n.type) === 'security',
  );

  const assessDomain = (
    label: string,
    labelKo: string,
    required: InfraNodeType[],
  ): { en: string; ko: string; rating: string } => {
    if (required.length === 0) {
      return {
        en: `${label}: N/A (no requirements for ${securityLevel} level)`,
        ko: `${labelKo}: 해당 없음 (${securityLevel} 레벨 요구사항 없음)`,
        rating: 'N/A',
      };
    }
    const present = required.filter((c) => presentTypes.has(c));
    const ratio = present.length / required.length;
    let rating: string;
    if (ratio >= 1) rating = 'Strong';
    else if (ratio >= 0.5) rating = 'Moderate';
    else rating = 'Weak';

    return {
      en: `${label}: ${rating} (${present.length}/${required.length} components)`,
      ko: `${labelKo}: ${rating === 'Strong' ? '강함' : rating === 'Moderate' ? '보통' : '약함'} (${present.length}/${required.length} 컴포넌트)`,
      rating,
    };
  };

  const encryption = assessDomain('Encryption', '암호화', requirements.encryption);
  const perimeter = assessDomain('Perimeter Defense', '경계 방어', requirements.perimeterDefense);
  const monitoring = assessDomain('Monitoring', '모니터링', requirements.monitoring);
  const accessControl = assessDomain('Access Control', '접근 제어', requirements.accessControl);

  return {
    title: 'Security Posture Assessment',
    titleKo: '보안 상태 평가',
    content: [
      `Security Level Target: ${securityLevel}`,
      `Security components present: ${securityComponents.length}`,
      encryption.en,
      perimeter.en,
      monitoring.en,
      accessControl.en,
    ],
    contentKo: [
      `보안 수준 목표: ${securityLevel}`,
      `보안 컴포넌트 수: ${securityComponents.length}개`,
      encryption.ko,
      perimeter.ko,
      monitoring.ko,
      accessControl.ko,
    ],
  };
}

// ---------------------------------------------------------------------------
// Internal: Recommendations
// ---------------------------------------------------------------------------

interface RecommendationEntry {
  en: string;
  ko: string;
  effort: 'low' | 'medium' | 'high';
  priority: number; // lower = higher priority
}

function buildRecommendations(
  gaps: GapItem[],
  frameworks: string[],
  securityLevel: ConsultingSecurityLevel,
  includeRecommendations: boolean,
): {
  recommendations: string[];
  recommendationsKo: string[];
  recommendationSection: ComplianceReportSection | null;
} {
  if (!includeRecommendations) {
    return { recommendations: [], recommendationsKo: [], recommendationSection: null };
  }

  const entries: RecommendationEntry[] = [];

  // Deduplicate gap components
  const seenComponents = new Set<InfraNodeType>();

  // From gaps — prioritized by severity
  for (const gap of gaps) {
    if (seenComponents.has(gap.component)) continue;
    seenComponents.add(gap.component);

    const priorityMap: Record<GapSeverity, number> = {
      critical: 1,
      high: 2,
      medium: 3,
      low: 4,
    };

    entries.push({
      en: `[${gap.effort.toUpperCase()}] ${gap.suggestedAction}`,
      ko: `[${gap.effort === 'low' ? '낮음' : gap.effort === 'medium' ? '중간' : '높음'}] ${gap.suggestedActionKo}`,
      effort: gap.effort,
      priority: priorityMap[gap.severity],
    });
  }

  // Sort by priority
  entries.sort((a, b) => a.priority - b.priority);

  const recommendations = entries.map((e) => e.en);
  const recommendationsKo = entries.map((e) => e.ko);

  const recommendationSection: ComplianceReportSection = {
    title: 'Recommendations',
    titleKo: '권고 사항',
    content: recommendations.length > 0
      ? recommendations
      : ['No additional recommendations. Current architecture meets all assessed requirements.'],
    contentKo: recommendationsKo.length > 0
      ? recommendationsKo
      : ['추가 권고 사항이 없습니다. 현재 아키텍처가 평가된 모든 요구사항을 충족합니다.'],
  };

  return { recommendations, recommendationsKo, recommendationSection };
}

// ---------------------------------------------------------------------------
// Internal: Helpers
// ---------------------------------------------------------------------------

function getGapSeverityForComponent(comp: InfraNodeType): GapSeverity {
  const severityMap: Partial<Record<InfraNodeType, GapSeverity>> = {
    'firewall': 'critical',
    'mfa': 'critical',
    'waf': 'high',
    'ids-ips': 'high',
    'siem': 'high',
    'dlp': 'medium',
    'nac': 'medium',
    'vpn-gateway': 'medium',
    'backup': 'high',
    'soar': 'low',
    'ztna-broker': 'medium',
    'casb': 'medium',
    'sase-gateway': 'medium',
  };
  return severityMap[comp] ?? 'medium';
}

function getEffortForComponent(comp: InfraNodeType): 'low' | 'medium' | 'high' {
  const effortMap: Partial<Record<InfraNodeType, 'low' | 'medium' | 'high'>> = {
    'firewall': 'medium',
    'mfa': 'low',
    'waf': 'medium',
    'ids-ips': 'medium',
    'siem': 'high',
    'dlp': 'high',
    'nac': 'medium',
    'vpn-gateway': 'medium',
    'backup': 'low',
    'soar': 'high',
    'ztna-broker': 'medium',
    'casb': 'high',
    'sase-gateway': 'high',
  };
  return effortMap[comp] ?? 'medium';
}
