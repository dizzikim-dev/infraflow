/**
 * Industry Compliance Module
 *
 * Extends the existing complianceChecker with industry-specific presets
 * and automated gap analysis. Wraps checkCompliance() without modification.
 */

import type { InfraSpec, InfraNodeType } from '@/types/infra';
import { checkCompliance, type ComplianceFramework, type ComplianceReport } from './complianceChecker';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type IndustryType = 'financial' | 'healthcare' | 'government' | 'ecommerce' | 'general';

export type SecurityLevel = 'basic' | 'standard' | 'enhanced' | 'maximum';

export interface IndustryPreset {
  id: IndustryType;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  requiredFrameworks: ComplianceFramework[];
  requiredComponents: InfraNodeType[];
  recommendedComponents: InfraNodeType[];
  minimumSecurityLevel: SecurityLevel;
}

export interface ComplianceGap {
  framework: string;
  frameworkKo: string;
  missingComponents: InfraNodeType[];
  remediation: string;
  remediationKo: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedEffort: string;
  estimatedEffortKo: string;
}

export interface IndustryComplianceReport {
  industry: IndustryType;
  preset: IndustryPreset;
  complianceReports: { framework: ComplianceFramework; report: ComplianceReport }[];
  gaps: ComplianceGap[];
  overallScore: number;
  missingRequired: InfraNodeType[];
  missingRecommended: InfraNodeType[];
}

// ---------------------------------------------------------------------------
// Industry Presets
// ---------------------------------------------------------------------------

const INDUSTRY_PRESETS: Record<IndustryType, IndustryPreset> = {
  financial: {
    id: 'financial',
    name: 'Financial Services',
    nameKo: '금융 서비스',
    description: 'Banking, insurance, and financial institutions requiring strict regulatory compliance.',
    descriptionKo: '은행, 보험 및 금융기관을 위한 엄격한 규제 준수 요구사항.',
    requiredFrameworks: ['isms-p', 'pci-dss'],
    requiredComponents: ['firewall', 'waf', 'ids-ips', 'dlp', 'mfa', 'siem', 'backup'],
    recommendedComponents: ['nac', 'vpn-gateway', 'sase-gateway', 'soar', 'ztna-broker'],
    minimumSecurityLevel: 'maximum',
  },
  healthcare: {
    id: 'healthcare',
    name: 'Healthcare',
    nameKo: '의료/헬스케어',
    description: 'Hospitals, clinics, and healthcare providers handling patient data.',
    descriptionKo: '환자 데이터를 취급하는 병원, 클리닉 및 의료 서비스 제공자.',
    requiredFrameworks: ['hipaa', 'iso27001'],
    requiredComponents: ['firewall', 'vpn-gateway', 'mfa', 'dlp', 'backup'],
    recommendedComponents: ['waf', 'ids-ips', 'nac', 'siem', 'ztna-broker'],
    minimumSecurityLevel: 'enhanced',
  },
  government: {
    id: 'government',
    name: 'Government',
    nameKo: '공공/정부',
    description: 'Government agencies and public sector organizations.',
    descriptionKo: '정부 기관 및 공공 부문 조직.',
    requiredFrameworks: ['isms-p', 'k-isms'],
    requiredComponents: ['firewall', 'nac', 'ids-ips', 'mfa', 'siem'],
    recommendedComponents: ['waf', 'dlp', 'vpn-gateway', 'backup', 'soar'],
    minimumSecurityLevel: 'enhanced',
  },
  ecommerce: {
    id: 'ecommerce',
    name: 'E-Commerce',
    nameKo: '전자상거래',
    description: 'Online retail and e-commerce platforms handling payment data.',
    descriptionKo: '결제 데이터를 처리하는 온라인 소매 및 전자상거래 플랫폼.',
    requiredFrameworks: ['pci-dss', 'gdpr'],
    requiredComponents: ['firewall', 'waf', 'cdn', 'load-balancer', 'mfa'],
    recommendedComponents: ['ids-ips', 'dlp', 'siem', 'backup', 'casb'],
    minimumSecurityLevel: 'standard',
  },
  general: {
    id: 'general',
    name: 'General Enterprise',
    nameKo: '일반 기업',
    description: 'General enterprise IT infrastructure with standard security requirements.',
    descriptionKo: '표준 보안 요구사항을 가진 일반 기업 IT 인프라.',
    requiredFrameworks: ['iso27001'],
    requiredComponents: ['firewall', 'mfa', 'backup'],
    recommendedComponents: ['waf', 'ids-ips', 'vpn-gateway', 'siem'],
    minimumSecurityLevel: 'basic',
  },
};

// ---------------------------------------------------------------------------
// Priority & Effort Mapping
// ---------------------------------------------------------------------------

const COMPONENT_PRIORITY: Partial<Record<InfraNodeType, 'critical' | 'high' | 'medium' | 'low'>> = {
  'firewall': 'critical',
  'waf': 'high',
  'ids-ips': 'high',
  'mfa': 'critical',
  'siem': 'high',
  'dlp': 'medium',
  'nac': 'medium',
  'vpn-gateway': 'medium',
  'backup': 'high',
  'cdn': 'low',
  'load-balancer': 'medium',
  'sase-gateway': 'medium',
  'ztna-broker': 'medium',
  'soar': 'low',
  'casb': 'medium',
};

const COMPONENT_EFFORT: Partial<Record<InfraNodeType, { en: string; ko: string }>> = {
  'firewall': { en: '1-2 weeks', ko: '1-2주' },
  'waf': { en: '1 week', ko: '1주' },
  'ids-ips': { en: '1-2 weeks', ko: '1-2주' },
  'mfa': { en: '2-3 days', ko: '2-3일' },
  'siem': { en: '2-4 weeks', ko: '2-4주' },
  'dlp': { en: '2-3 weeks', ko: '2-3주' },
  'nac': { en: '1-2 weeks', ko: '1-2주' },
  'vpn-gateway': { en: '1 week', ko: '1주' },
  'backup': { en: '3-5 days', ko: '3-5일' },
  'cdn': { en: '2-3 days', ko: '2-3일' },
  'load-balancer': { en: '3-5 days', ko: '3-5일' },
  'sase-gateway': { en: '2-4 weeks', ko: '2-4주' },
  'ztna-broker': { en: '1-2 weeks', ko: '1-2주' },
  'soar': { en: '3-4 weeks', ko: '3-4주' },
  'casb': { en: '2-3 weeks', ko: '2-3주' },
};

const FRAMEWORK_NAMES_KO: Record<ComplianceFramework, string> = {
  'isms-p': 'ISMS-P',
  'iso27001': 'ISO 27001',
  'pci-dss': 'PCI-DSS',
  'gdpr': 'GDPR',
  'hipaa': 'HIPAA',
  'k-isms': 'K-ISMS',
};

const COMPONENT_NAMES_KO: Partial<Record<InfraNodeType, string>> = {
  'firewall': '방화벽',
  'waf': 'WAF',
  'ids-ips': 'IDS/IPS',
  'mfa': 'MFA',
  'siem': 'SIEM',
  'dlp': 'DLP',
  'nac': 'NAC',
  'vpn-gateway': 'VPN 게이트웨이',
  'backup': '백업',
  'cdn': 'CDN',
  'load-balancer': '로드 밸런서',
  'sase-gateway': 'SASE 게이트웨이',
  'ztna-broker': 'ZTNA 브로커',
  'soar': 'SOAR',
  'casb': 'CASB',
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Get an industry preset by type */
export function getIndustryPreset(industry: IndustryType): IndustryPreset {
  return INDUSTRY_PRESETS[industry];
}

/** Get all available industry presets */
export function getAllIndustryPresets(): IndustryPreset[] {
  return Object.values(INDUSTRY_PRESETS);
}

/**
 * Analyze compliance gaps for a given spec against an industry preset.
 * Uses the existing checkCompliance() function under the hood.
 */
export function analyzeComplianceGap(spec: InfraSpec, industry: IndustryType): IndustryComplianceReport {
  const preset = INDUSTRY_PRESETS[industry];
  const presentTypes = new Set(spec.nodes.map((n) => n.type));

  // 1. Run compliance checks for each required framework
  const complianceReports: { framework: ComplianceFramework; report: ComplianceReport }[] = [];
  for (const fw of preset.requiredFrameworks) {
    const report = checkCompliance(spec, fw);
    complianceReports.push({ framework: fw, report });
  }

  // 2. Find missing required and recommended components
  const missingRequired = preset.requiredComponents.filter((c) => !presentTypes.has(c));
  const missingRecommended = preset.recommendedComponents.filter((c) => !presentTypes.has(c));

  // 3. Generate compliance gaps
  const gaps = generateGaps(missingRequired, missingRecommended, preset);

  // 4. Calculate overall score
  const overallScore = calculateOverallScore(complianceReports, missingRequired, preset);

  return {
    industry,
    preset,
    complianceReports,
    gaps,
    overallScore,
    missingRequired,
    missingRecommended,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function generateGaps(
  missingRequired: InfraNodeType[],
  missingRecommended: InfraNodeType[],
  preset: IndustryPreset,
): ComplianceGap[] {
  const gaps: ComplianceGap[] = [];

  // Gaps from missing required components
  for (const comp of missingRequired) {
    const compName = COMPONENT_NAMES_KO[comp] ?? comp;
    const priority = COMPONENT_PRIORITY[comp] ?? 'medium';
    const effort = COMPONENT_EFFORT[comp] ?? { en: '1-2 weeks', ko: '1-2주' };

    // Determine which frameworks need this component
    const relatedFrameworks = preset.requiredFrameworks
      .map((fw) => FRAMEWORK_NAMES_KO[fw])
      .join(', ');

    gaps.push({
      framework: relatedFrameworks,
      frameworkKo: relatedFrameworks,
      missingComponents: [comp],
      remediation: `Add ${comp} to meet ${relatedFrameworks} compliance requirements.`,
      remediationKo: `${relatedFrameworks} 컴플라이언스 요구사항을 충족하기 위해 ${compName}을(를) 추가하세요.`,
      priority,
      estimatedEffort: effort.en,
      estimatedEffortKo: effort.ko,
    });
  }

  // Gaps from missing recommended components (lower priority)
  for (const comp of missingRecommended) {
    const compName = COMPONENT_NAMES_KO[comp] ?? comp;
    const effort = COMPONENT_EFFORT[comp] ?? { en: '1-2 weeks', ko: '1-2주' };

    gaps.push({
      framework: `${preset.nameKo} 권장사항`,
      frameworkKo: `${preset.nameKo} 권장사항`,
      missingComponents: [comp],
      remediation: `Consider adding ${comp} to enhance security posture for ${preset.name}.`,
      remediationKo: `${preset.nameKo} 보안 수준 강화를 위해 ${compName} 추가를 고려하세요.`,
      priority: 'low',
      estimatedEffort: effort.en,
      estimatedEffortKo: effort.ko,
    });
  }

  // Sort by priority
  const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return gaps.sort((a, b) => (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9));
}

function calculateOverallScore(
  complianceReports: { framework: ComplianceFramework; report: ComplianceReport }[],
  missingRequired: InfraNodeType[],
  preset: IndustryPreset,
): number {
  if (complianceReports.length === 0) return 0;

  // Average of framework scores
  const avgFrameworkScore =
    complianceReports.reduce((sum, r) => sum + r.report.score, 0) / complianceReports.length;

  // Penalty for missing required components
  const totalRequired = preset.requiredComponents.length;
  const missingCount = missingRequired.length;
  const componentScore = totalRequired > 0 ? ((totalRequired - missingCount) / totalRequired) * 100 : 100;

  // Weighted: 60% framework compliance, 40% component coverage
  return Math.round(avgFrameworkScore * 0.6 + componentScore * 0.4);
}
