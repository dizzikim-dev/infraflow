/**
 * InfraFlow - Compliance Checker
 *
 * 규정 준수 체크 및 What-if 분석
 */

import type { InfraSpec, InfraNodeType, InfraNodeSpec, ConnectionSpec } from '@/types';

/**
 * Compliance frameworks
 */
export type ComplianceFramework =
  | 'isms-p'      // ISMS-P (한국 정보보호관리체계)
  | 'iso27001'    // ISO 27001
  | 'pci-dss'     // PCI DSS (Payment Card Industry)
  | 'gdpr'        // GDPR (EU 개인정보보호)
  | 'hipaa'       // HIPAA (의료정보)
  | 'k-isms';     // K-ISMS (한국 정보보호관리체계)

/**
 * Compliance check result
 */
export interface ComplianceCheck {
  id: string;
  framework: ComplianceFramework;
  requirement: string;
  description: string;
  status: 'pass' | 'fail' | 'partial' | 'not-applicable';
  details: string;
  remediation?: string;
}

/**
 * Compliance report
 */
export interface ComplianceReport {
  framework: ComplianceFramework;
  frameworkName: string;
  timestamp: string;
  totalChecks: number;
  passed: number;
  failed: number;
  partial: number;
  notApplicable: number;
  score: number; // 0-100
  checks: ComplianceCheck[];
}

/**
 * What-if analysis result
 */
export interface WhatIfResult {
  change: WhatIfChange;
  impacts: WhatIfImpact[];
  riskDelta: number; // -100 to +100, negative = worse
  recommendations: string[];
}

export interface WhatIfChange {
  type: 'add' | 'remove' | 'modify';
  nodeType?: InfraNodeType;
  nodeId?: string;
  description: string;
}

export interface WhatIfImpact {
  category: 'security' | 'availability' | 'compliance' | 'cost';
  severity: 'high' | 'medium' | 'low';
  description: string;
}

/**
 * Framework requirements
 */
const COMPLIANCE_REQUIREMENTS: Record<ComplianceFramework, Array<{
  id: string;
  requirement: string;
  description: string;
  check: (spec: InfraSpec) => { status: ComplianceCheck['status']; details: string; remediation?: string };
}>> = {
  'isms-p': [
    {
      id: 'ISMS-P-2.6.1',
      requirement: '접근통제 정책',
      description: '정보시스템에 대한 접근을 통제하기 위한 정책 수립',
      check: (spec) => {
        const hasFirewall = spec.nodes.some((n) => n.type === 'firewall');
        const hasNAC = spec.nodes.some((n) => n.type === 'nac');
        if (hasFirewall && hasNAC) {
          return { status: 'pass', details: '방화벽과 NAC가 구성되어 있습니다.' };
        } else if (hasFirewall) {
          return { status: 'partial', details: '방화벽은 있으나 NAC가 없습니다.', remediation: 'NAC 솔루션 도입 권장' };
        }
        return { status: 'fail', details: '접근통제 장비가 없습니다.', remediation: '방화벽 및 NAC 구성 필요' };
      },
    },
    {
      id: 'ISMS-P-2.6.2',
      requirement: '사용자 인증',
      description: '정보시스템 접근 시 사용자 인증 수행',
      check: (spec) => {
        const hasAuth = spec.nodes.some((n) => ['ldap-ad', 'sso', 'iam'].includes(n.type));
        const hasMFA = spec.nodes.some((n) => n.type === 'mfa');
        if (hasAuth && hasMFA) {
          return { status: 'pass', details: '인증 시스템과 MFA가 구성되어 있습니다.' };
        } else if (hasAuth) {
          return { status: 'partial', details: '인증 시스템은 있으나 MFA가 없습니다.', remediation: 'MFA 도입 권장' };
        }
        return { status: 'fail', details: '인증 시스템이 없습니다.', remediation: '인증/인가 시스템 구성 필요' };
      },
    },
    {
      id: 'ISMS-P-2.7.1',
      requirement: '암호정책',
      description: '개인정보 및 중요정보에 대한 암호화 적용',
      check: (spec) => {
        const hasEncryptedConn = spec.connections.some((c) => c.flowType === 'encrypted');
        const hasVPN = spec.nodes.some((n) => n.type === 'vpn-gateway');
        if (hasEncryptedConn || hasVPN) {
          return { status: 'pass', details: '암호화 통신이 구성되어 있습니다.' };
        }
        return { status: 'partial', details: '암호화 통신 여부를 확인할 수 없습니다.', remediation: 'TLS/VPN 구성 확인 필요' };
      },
    },
    {
      id: 'ISMS-P-2.9.1',
      requirement: '침해사고 대응',
      description: '보안 사고 탐지 및 대응 체계 구축',
      check: (spec) => {
        const hasIDS = spec.nodes.some((n) => n.type === 'ids-ips');
        const hasWAF = spec.nodes.some((n) => n.type === 'waf');
        if (hasIDS && hasWAF) {
          return { status: 'pass', details: 'IDS/IPS와 WAF가 구성되어 있습니다.' };
        } else if (hasIDS || hasWAF) {
          return { status: 'partial', details: '일부 보안 장비만 구성되어 있습니다.', remediation: 'IDS/IPS 및 WAF 모두 구성 권장' };
        }
        return { status: 'fail', details: '보안 모니터링 장비가 없습니다.', remediation: 'IDS/IPS 및 WAF 구성 필요' };
      },
    },
    {
      id: 'ISMS-P-2.10.1',
      requirement: '재해복구',
      description: '재해복구 계획 수립 및 백업 체계 구축',
      check: (spec) => {
        const hasBackup = spec.nodes.some((n) => n.type === 'backup');
        const hasRedundancy = spec.nodes.filter((n) => n.type === 'db-server').length > 1;
        if (hasBackup && hasRedundancy) {
          return { status: 'pass', details: '백업 및 이중화가 구성되어 있습니다.' };
        } else if (hasBackup) {
          return { status: 'partial', details: '백업은 있으나 이중화가 없습니다.', remediation: 'DB 이중화 구성 권장' };
        }
        return { status: 'fail', details: '백업 시스템이 없습니다.', remediation: '백업 및 복구 체계 구축 필요' };
      },
    },
  ],

  'iso27001': [
    {
      id: 'A.9.1.1',
      requirement: 'Access control policy',
      description: 'An access control policy shall be established and maintained',
      check: (spec) => {
        const hasAccessControl = spec.nodes.some((n) =>
          ['firewall', 'nac', 'iam'].includes(n.type)
        );
        if (hasAccessControl) {
          return { status: 'pass', details: 'Access control mechanisms are in place.' };
        }
        return { status: 'fail', details: 'No access control mechanisms found.', remediation: 'Implement access control policy and mechanisms' };
      },
    },
    {
      id: 'A.10.1.1',
      requirement: 'Cryptographic controls',
      description: 'A policy on the use of cryptographic controls shall be developed',
      check: (spec) => {
        const hasEncryption = spec.connections.some((c) => c.flowType === 'encrypted');
        const hasVPN = spec.nodes.some((n) => n.type === 'vpn-gateway');
        if (hasEncryption || hasVPN) {
          return { status: 'pass', details: 'Cryptographic controls are implemented.' };
        }
        return { status: 'partial', details: 'Encryption status unclear.', remediation: 'Verify encryption implementation' };
      },
    },
    {
      id: 'A.12.6.1',
      requirement: 'Management of technical vulnerabilities',
      description: 'Information about technical vulnerabilities shall be obtained',
      check: (spec) => {
        const hasIDS = spec.nodes.some((n) => n.type === 'ids-ips');
        if (hasIDS) {
          return { status: 'pass', details: 'Vulnerability detection system is in place.' };
        }
        return { status: 'fail', details: 'No vulnerability detection system.', remediation: 'Implement IDS/IPS solution' };
      },
    },
    {
      id: 'A.13.1.1',
      requirement: 'Network controls',
      description: 'Networks shall be managed and controlled',
      check: (spec) => {
        const hasNetworkSecurity = spec.nodes.some((n) =>
          ['firewall', 'router', 'switch-l3'].includes(n.type)
        );
        if (hasNetworkSecurity) {
          return { status: 'pass', details: 'Network controls are implemented.' };
        }
        return { status: 'fail', details: 'No network controls found.', remediation: 'Implement network segmentation and controls' };
      },
    },
    {
      id: 'A.17.1.1',
      requirement: 'Information security continuity',
      description: 'Information security continuity shall be planned',
      check: (spec) => {
        const hasBackup = spec.nodes.some((n) => n.type === 'backup');
        const hasLB = spec.nodes.some((n) => n.type === 'load-balancer');
        if (hasBackup && hasLB) {
          return { status: 'pass', details: 'Business continuity measures are in place.' };
        } else if (hasBackup || hasLB) {
          return { status: 'partial', details: 'Partial continuity measures.', remediation: 'Implement full HA and backup' };
        }
        return { status: 'fail', details: 'No continuity measures.', remediation: 'Implement backup and HA solutions' };
      },
    },
  ],

  'pci-dss': [
    {
      id: 'PCI-1.1',
      requirement: 'Install and maintain a firewall',
      description: 'Install and maintain a firewall configuration to protect cardholder data',
      check: (spec) => {
        const hasFirewall = spec.nodes.some((n) => n.type === 'firewall');
        if (hasFirewall) {
          return { status: 'pass', details: 'Firewall is configured.' };
        }
        return { status: 'fail', details: 'No firewall found.', remediation: 'Install and configure firewall' };
      },
    },
    {
      id: 'PCI-3.4',
      requirement: 'Render PAN unreadable',
      description: 'Render PAN unreadable anywhere it is stored',
      check: (spec) => {
        const hasDB = spec.nodes.some((n) => n.type === 'db-server');
        const hasDLP = spec.nodes.some((n) => n.type === 'dlp');
        if (!hasDB) {
          return { status: 'not-applicable', details: 'No database in architecture.' };
        }
        if (hasDLP) {
          return { status: 'partial', details: 'DLP is configured.', remediation: 'Verify data encryption at rest' };
        }
        return { status: 'fail', details: 'Data protection measures not visible.', remediation: 'Implement data encryption' };
      },
    },
    {
      id: 'PCI-6.6',
      requirement: 'Web application firewall',
      description: 'Install a web application firewall in front of web applications',
      check: (spec) => {
        const hasWebServer = spec.nodes.some((n) => n.type === 'web-server');
        const hasWAF = spec.nodes.some((n) => n.type === 'waf');
        if (!hasWebServer) {
          return { status: 'not-applicable', details: 'No web server in architecture.' };
        }
        if (hasWAF) {
          return { status: 'pass', details: 'WAF is configured.' };
        }
        return { status: 'fail', details: 'No WAF protecting web server.', remediation: 'Install WAF' };
      },
    },
    {
      id: 'PCI-8.3',
      requirement: 'Multi-factor authentication',
      description: 'Secure all individual non-console administrative access using MFA',
      check: (spec) => {
        const hasMFA = spec.nodes.some((n) => n.type === 'mfa');
        if (hasMFA) {
          return { status: 'pass', details: 'MFA is configured.' };
        }
        return { status: 'fail', details: 'No MFA configured.', remediation: 'Implement MFA for administrative access' };
      },
    },
  ],

  'gdpr': [
    {
      id: 'GDPR-32',
      requirement: 'Security of processing',
      description: 'Implement appropriate technical measures to ensure security',
      check: (spec) => {
        const hasEncryption = spec.connections.some((c) => c.flowType === 'encrypted');
        const hasFirewall = spec.nodes.some((n) => n.type === 'firewall');
        if (hasEncryption && hasFirewall) {
          return { status: 'pass', details: 'Encryption and access control are in place.' };
        }
        return { status: 'partial', details: 'Partial security measures.', remediation: 'Implement full encryption and access control' };
      },
    },
    {
      id: 'GDPR-33',
      requirement: 'Notification of breaches',
      description: 'Ability to detect and report personal data breaches',
      check: (spec) => {
        const hasIDS = spec.nodes.some((n) => n.type === 'ids-ips');
        if (hasIDS) {
          return { status: 'pass', details: 'Breach detection capability exists.' };
        }
        return { status: 'fail', details: 'No breach detection system.', remediation: 'Implement IDS/IPS for breach detection' };
      },
    },
    {
      id: 'GDPR-25',
      requirement: 'Data protection by design',
      description: 'Implement data protection principles in system design',
      check: (spec) => {
        const hasDLP = spec.nodes.some((n) => n.type === 'dlp');
        const hasDB = spec.nodes.some((n) => n.type === 'db-server');
        if (!hasDB) {
          return { status: 'not-applicable', details: 'No database in architecture.' };
        }
        if (hasDLP) {
          return { status: 'pass', details: 'DLP for data protection is configured.' };
        }
        return { status: 'partial', details: 'Consider DLP implementation.', remediation: 'Implement DLP solution' };
      },
    },
  ],

  'hipaa': [
    {
      id: 'HIPAA-164.312(a)',
      requirement: 'Access Control',
      description: 'Implement technical policies for electronic PHI access',
      check: (spec) => {
        const hasAuth = spec.nodes.some((n) => ['ldap-ad', 'sso', 'iam'].includes(n.type));
        const hasFirewall = spec.nodes.some((n) => n.type === 'firewall');
        if (hasAuth && hasFirewall) {
          return { status: 'pass', details: 'Access control mechanisms are in place.' };
        }
        return { status: 'fail', details: 'Insufficient access controls.', remediation: 'Implement authentication and firewall' };
      },
    },
    {
      id: 'HIPAA-164.312(e)',
      requirement: 'Transmission Security',
      description: 'Implement technical security measures for PHI transmission',
      check: (spec) => {
        const hasEncryption = spec.connections.some((c) => c.flowType === 'encrypted');
        const hasVPN = spec.nodes.some((n) => n.type === 'vpn-gateway');
        if (hasEncryption || hasVPN) {
          return { status: 'pass', details: 'Transmission security is implemented.' };
        }
        return { status: 'fail', details: 'No transmission security visible.', remediation: 'Implement TLS/VPN' };
      },
    },
  ],

  'k-isms': [
    {
      id: 'K-ISMS-2.5.1',
      requirement: '네트워크 보안',
      description: '네트워크에 대한 접근통제 정책 수립',
      check: (spec) => {
        const hasFirewall = spec.nodes.some((n) => n.type === 'firewall');
        if (hasFirewall) {
          return { status: 'pass', details: '방화벽이 구성되어 있습니다.' };
        }
        return { status: 'fail', details: '방화벽이 없습니다.', remediation: '방화벽 구성 필요' };
      },
    },
    {
      id: 'K-ISMS-2.6.2',
      requirement: '사용자 인증',
      description: '정보시스템 접근 시 안전한 인증 수행',
      check: (spec) => {
        const hasAuth = spec.nodes.some((n) => ['ldap-ad', 'sso', 'iam', 'mfa'].includes(n.type));
        if (hasAuth) {
          return { status: 'pass', details: '인증 시스템이 구성되어 있습니다.' };
        }
        return { status: 'fail', details: '인증 시스템이 없습니다.', remediation: '인증 시스템 구성 필요' };
      },
    },
  ],
};

/**
 * Get framework display name
 */
export function getFrameworkName(framework: ComplianceFramework): string {
  const names: Record<ComplianceFramework, string> = {
    'isms-p': 'ISMS-P (정보보호관리체계)',
    'iso27001': 'ISO 27001',
    'pci-dss': 'PCI DSS',
    'gdpr': 'GDPR',
    'hipaa': 'HIPAA',
    'k-isms': 'K-ISMS',
  };
  return names[framework];
}

/**
 * Run compliance check for a specific framework
 */
export function checkCompliance(spec: InfraSpec, framework: ComplianceFramework): ComplianceReport {
  const requirements = COMPLIANCE_REQUIREMENTS[framework];
  const checks: ComplianceCheck[] = [];

  let passed = 0;
  let failed = 0;
  let partial = 0;
  let notApplicable = 0;

  for (const req of requirements) {
    const result = req.check(spec);
    checks.push({
      id: req.id,
      framework,
      requirement: req.requirement,
      description: req.description,
      status: result.status,
      details: result.details,
      remediation: result.remediation,
    });

    switch (result.status) {
      case 'pass':
        passed++;
        break;
      case 'fail':
        failed++;
        break;
      case 'partial':
        partial++;
        break;
      case 'not-applicable':
        notApplicable++;
        break;
    }
  }

  const applicableChecks = passed + failed + partial;
  const score = applicableChecks > 0
    ? Math.round(((passed + partial * 0.5) / applicableChecks) * 100)
    : 100;

  return {
    framework,
    frameworkName: getFrameworkName(framework),
    timestamp: new Date().toISOString(),
    totalChecks: requirements.length,
    passed,
    failed,
    partial,
    notApplicable,
    score,
    checks,
  };
}

/**
 * Run compliance check for all frameworks
 */
export function checkAllCompliance(spec: InfraSpec): ComplianceReport[] {
  const frameworks: ComplianceFramework[] = ['isms-p', 'iso27001', 'pci-dss', 'gdpr', 'hipaa', 'k-isms'];
  return frameworks.map((f) => checkCompliance(spec, f));
}

/**
 * What-if analysis: simulate adding a component
 */
export function analyzeWhatIfAdd(spec: InfraSpec, nodeType: InfraNodeType): WhatIfResult {
  const impacts: WhatIfImpact[] = [];
  const recommendations: string[] = [];
  let riskDelta = 0;

  // Security impact
  if (['firewall', 'waf', 'ids-ips', 'nac', 'dlp'].includes(nodeType)) {
    impacts.push({
      category: 'security',
      severity: 'high',
      description: `보안 수준 향상: ${nodeType} 추가로 위협 방어 강화`,
    });
    riskDelta += 15;
    recommendations.push('기존 보안 장비와의 연동 정책 수립 필요');
  }

  // Authentication impact
  if (['ldap-ad', 'sso', 'mfa', 'iam'].includes(nodeType)) {
    impacts.push({
      category: 'security',
      severity: 'high',
      description: '인증/인가 강화로 무단 접근 위험 감소',
    });
    riskDelta += 12;
  }

  // Availability impact
  if (['load-balancer', 'cdn', 'backup'].includes(nodeType)) {
    impacts.push({
      category: 'availability',
      severity: 'medium',
      description: '가용성 향상: 장애 대응 능력 강화',
    });
    riskDelta += 8;
  }

  // Cost impact
  impacts.push({
    category: 'cost',
    severity: 'medium',
    description: `인프라 비용 증가 예상 (${nodeType} 추가)`,
  });

  // Compliance impact
  const hasWebServer = spec.nodes.some((n) => n.type === 'web-server');
  if (nodeType === 'waf' && hasWebServer) {
    impacts.push({
      category: 'compliance',
      severity: 'high',
      description: 'PCI DSS 6.6 요구사항 충족',
    });
    riskDelta += 10;
  }

  if (nodeType === 'mfa') {
    impacts.push({
      category: 'compliance',
      severity: 'high',
      description: 'ISMS-P, PCI DSS MFA 요구사항 충족',
    });
    riskDelta += 10;
  }

  return {
    change: {
      type: 'add',
      nodeType,
      description: `${nodeType} 추가`,
    },
    impacts,
    riskDelta,
    recommendations,
  };
}

/**
 * What-if analysis: simulate removing a component
 */
export function analyzeWhatIfRemove(spec: InfraSpec, nodeId: string): WhatIfResult {
  const node = spec.nodes.find((n) => n.id === nodeId);
  if (!node) {
    return {
      change: { type: 'remove', nodeId, description: '노드를 찾을 수 없음' },
      impacts: [],
      riskDelta: 0,
      recommendations: [],
    };
  }

  const impacts: WhatIfImpact[] = [];
  const recommendations: string[] = [];
  let riskDelta = 0;

  // Security risk
  if (['firewall', 'waf', 'ids-ips'].includes(node.type)) {
    impacts.push({
      category: 'security',
      severity: 'high',
      description: `심각한 보안 취약점: ${node.label} 제거 시 외부 공격에 노출`,
    });
    riskDelta -= 25;
    recommendations.push('해당 장비 제거 시 대체 보안 솔루션 필수');
  }

  // Auth risk
  if (['ldap-ad', 'sso', 'mfa', 'iam'].includes(node.type)) {
    impacts.push({
      category: 'security',
      severity: 'high',
      description: '인증 체계 약화로 무단 접근 위험 증가',
    });
    riskDelta -= 20;
  }

  // Availability risk
  if (node.type === 'load-balancer') {
    impacts.push({
      category: 'availability',
      severity: 'high',
      description: '단일 장애점(SPOF) 발생 가능',
    });
    riskDelta -= 15;
  }

  if (node.type === 'backup') {
    impacts.push({
      category: 'availability',
      severity: 'high',
      description: '데이터 손실 위험 증가',
    });
    riskDelta -= 20;
  }

  // Connection impact
  const affectedConnections = spec.connections.filter(
    (c) => c.source === nodeId || c.target === nodeId
  );

  if (affectedConnections.length > 0) {
    impacts.push({
      category: 'availability',
      severity: 'medium',
      description: `${affectedConnections.length}개의 연결 경로가 끊어짐`,
    });
    recommendations.push('연결 경로 재구성 필요');
  }

  // Compliance impact
  if (['waf', 'mfa', 'firewall'].includes(node.type)) {
    impacts.push({
      category: 'compliance',
      severity: 'high',
      description: 'ISMS-P, PCI DSS 등 규정 준수 실패 가능',
    });
    riskDelta -= 15;
  }

  return {
    change: {
      type: 'remove',
      nodeId,
      nodeType: node.type as InfraNodeType,
      description: `${node.label} (${node.type}) 제거`,
    },
    impacts,
    riskDelta,
    recommendations,
  };
}

/**
 * Get available frameworks
 */
export function getAvailableFrameworks(): Array<{
  id: ComplianceFramework;
  name: string;
  description: string;
}> {
  return [
    { id: 'isms-p', name: 'ISMS-P', description: '한국 정보보호관리체계' },
    { id: 'k-isms', name: 'K-ISMS', description: '한국 정보보호관리체계 (간소화)' },
    { id: 'iso27001', name: 'ISO 27001', description: '국제 정보보안 표준' },
    { id: 'pci-dss', name: 'PCI DSS', description: '카드결제 보안 표준' },
    { id: 'gdpr', name: 'GDPR', description: 'EU 개인정보보호 규정' },
    { id: 'hipaa', name: 'HIPAA', description: '미국 의료정보 보호법' },
  ];
}
