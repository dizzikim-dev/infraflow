import { InfraSpec, InfraNodeSpec, ConnectionSpec, InfraNodeType } from '@/types';

/**
 * Security audit severity levels
 */
export type AuditSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

/**
 * Security audit finding
 */
export interface AuditFinding {
  id: string;
  title: string;
  description: string;
  severity: AuditSeverity;
  category: AuditCategory;
  affectedNodes?: string[];
  recommendation: string;
  references?: string[];
}

/**
 * Audit category
 */
export type AuditCategory =
  | 'network-security'
  | 'access-control'
  | 'data-protection'
  | 'availability'
  | 'compliance'
  | 'best-practice';

/**
 * Security audit result
 */
export interface SecurityAuditResult {
  timestamp: string;
  specName?: string;
  totalNodes: number;
  totalConnections: number;
  findings: AuditFinding[];
  score: number; // 0-100
  summary: AuditSummary;
}

/**
 * Audit summary by severity
 */
export interface AuditSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  passed: number;
}

/**
 * Security rules for auditing
 */
interface SecurityRule {
  id: string;
  title: string;
  check: (spec: InfraSpec) => AuditFinding | null;
}

/**
 * Define security rules
 */
const securityRules: SecurityRule[] = [
  // Network Security Rules
  {
    id: 'NET-001',
    title: 'Missing Firewall',
    check: (spec) => {
      const hasFirewall = spec.nodes.some((n) =>
        ['firewall', 'waf', 'ids-ips'].includes(n.type)
      );
      const hasExternalAccess = spec.nodes.some((n) =>
        ['user', 'internet'].includes(n.type)
      );

      if (!hasFirewall && hasExternalAccess) {
        return {
          id: 'NET-001',
          title: '방화벽 누락',
          description: '외부 접근 경로에 방화벽이 없습니다.',
          severity: 'critical',
          category: 'network-security',
          affectedNodes: spec.nodes.filter((n) =>
            ['user', 'internet'].includes(n.type)
          ).map((n) => n.id),
          recommendation: '외부 트래픽을 필터링하기 위해 방화벽을 추가하세요.',
          references: ['CIS Control 13', 'NIST SP 800-41'],
        };
      }
      return null;
    },
  },
  {
    id: 'NET-002',
    title: 'Missing WAF for Web Tier',
    check: (spec) => {
      const hasWebServer = spec.nodes.some((n) => n.type === 'web-server');
      const hasWAF = spec.nodes.some((n) => n.type === 'waf');

      if (hasWebServer && !hasWAF) {
        return {
          id: 'NET-002',
          title: 'WAF 누락',
          description: '웹 서버가 있지만 WAF(Web Application Firewall)가 없습니다.',
          severity: 'high',
          category: 'network-security',
          affectedNodes: spec.nodes.filter((n) => n.type === 'web-server').map((n) => n.id),
          recommendation: 'SQL Injection, XSS 등의 웹 공격을 방어하기 위해 WAF를 추가하세요.',
          references: ['OWASP Top 10', 'CIS Control 13'],
        };
      }
      return null;
    },
  },
  {
    id: 'NET-003',
    title: 'Direct Database Access',
    check: (spec) => {
      const dbNodes = spec.nodes.filter((n) => n.type === 'db-server');
      const externalNodes = spec.nodes.filter((n) =>
        ['user', 'internet'].includes(n.type)
      );

      for (const db of dbNodes) {
        for (const ext of externalNodes) {
          const directConnection = spec.connections.some(
            (c) =>
              (c.source === ext.id && c.target === db.id) ||
              (c.source === db.id && c.target === ext.id)
          );
          if (directConnection) {
            return {
              id: 'NET-003',
              title: '데이터베이스 직접 접근',
              description: '외부에서 데이터베이스로 직접 연결되어 있습니다.',
              severity: 'critical',
              category: 'network-security',
              affectedNodes: [db.id, ext.id],
              recommendation: '데이터베이스는 내부망에 배치하고 애플리케이션 서버를 통해서만 접근하도록 구성하세요.',
              references: ['CIS Control 12', 'PCI DSS Requirement 1.3'],
            };
          }
        }
      }
      return null;
    },
  },
  {
    id: 'NET-004',
    title: 'Missing Load Balancer',
    check: (spec) => {
      const webServers = spec.nodes.filter((n) => n.type === 'web-server');
      const hasLB = spec.nodes.some((n) => n.type === 'load-balancer');

      if (webServers.length > 1 && !hasLB) {
        return {
          id: 'NET-004',
          title: '로드 밸런서 누락',
          description: '다중 웹 서버가 있지만 로드 밸런서가 없습니다.',
          severity: 'medium',
          category: 'availability',
          affectedNodes: webServers.map((n) => n.id),
          recommendation: '트래픽 분산과 고가용성을 위해 로드 밸런서를 추가하세요.',
          references: ['AWS Well-Architected Framework'],
        };
      }
      return null;
    },
  },

  // Access Control Rules
  {
    id: 'ACC-001',
    title: 'Missing Authentication Layer',
    check: (spec) => {
      const hasAuth = spec.nodes.some((n) =>
        ['ldap-ad', 'sso', 'mfa', 'iam'].includes(n.type)
      );
      const hasAppServer = spec.nodes.some((n) =>
        ['web-server', 'app-server'].includes(n.type)
      );

      if (!hasAuth && hasAppServer) {
        return {
          id: 'ACC-001',
          title: '인증 레이어 누락',
          description: '애플리케이션 서버가 있지만 인증 시스템이 없습니다.',
          severity: 'high',
          category: 'access-control',
          affectedNodes: spec.nodes.filter((n) =>
            ['web-server', 'app-server'].includes(n.type)
          ).map((n) => n.id),
          recommendation: 'LDAP/AD, SSO, 또는 IAM 시스템을 추가하여 인증을 구현하세요.',
          references: ['NIST SP 800-63', 'CIS Control 6'],
        };
      }
      return null;
    },
  },
  {
    id: 'ACC-002',
    title: 'No MFA Configured',
    check: (spec) => {
      const hasMFA = spec.nodes.some((n) => n.type === 'mfa');
      const hasSSO = spec.nodes.some((n) => n.type === 'sso');
      const hasVPN = spec.nodes.some((n) => n.type === 'vpn-gateway');

      if (!hasMFA && (hasSSO || hasVPN)) {
        return {
          id: 'ACC-002',
          title: 'MFA 미설정',
          description: 'SSO 또는 VPN이 있지만 MFA가 구성되어 있지 않습니다.',
          severity: 'high',
          category: 'access-control',
          affectedNodes: spec.nodes.filter((n) =>
            ['sso', 'vpn-gateway'].includes(n.type)
          ).map((n) => n.id),
          recommendation: '강화된 인증을 위해 MFA(Multi-Factor Authentication)를 추가하세요.',
          references: ['NIST SP 800-63B', 'CIS Control 6'],
        };
      }
      return null;
    },
  },

  // Data Protection Rules
  {
    id: 'DATA-001',
    title: 'Missing Encryption for Data at Rest',
    check: (spec) => {
      const storageNodes = spec.nodes.filter((n) =>
        ['db-server', 'storage', 'san-nas', 'object-storage'].includes(n.type)
      );

      // Check if any storage/db node has encryption mentioned in description
      const unencrypted = storageNodes.filter((n) =>
        !n.description?.toLowerCase().includes('encrypt')
      );

      if (unencrypted.length > 0) {
        return {
          id: 'DATA-001',
          title: '저장 데이터 암호화 미확인',
          description: '데이터 저장소에 암호화 설정이 명시되어 있지 않습니다.',
          severity: 'medium',
          category: 'data-protection',
          affectedNodes: unencrypted.map((n) => n.id),
          recommendation: '저장 데이터(Data at Rest)에 대한 암호화를 구성하세요.',
          references: ['PCI DSS Requirement 3.4', 'GDPR Article 32'],
        };
      }
      return null;
    },
  },
  {
    id: 'DATA-002',
    title: 'Missing DLP',
    check: (spec) => {
      const hasDLP = spec.nodes.some((n) => n.type === 'dlp');
      const hasDB = spec.nodes.some((n) => n.type === 'db-server');
      const hasStorage = spec.nodes.some((n) =>
        ['storage', 'san-nas', 'object-storage'].includes(n.type)
      );

      if (!hasDLP && (hasDB || hasStorage)) {
        return {
          id: 'DATA-002',
          title: 'DLP 누락',
          description: '데이터 저장소가 있지만 DLP(Data Loss Prevention)가 없습니다.',
          severity: 'low',
          category: 'data-protection',
          affectedNodes: spec.nodes.filter((n) =>
            ['db-server', 'storage', 'san-nas', 'object-storage'].includes(n.type)
          ).map((n) => n.id),
          recommendation: '민감한 데이터 유출을 방지하기 위해 DLP 솔루션을 고려하세요.',
          references: ['CIS Control 3'],
        };
      }
      return null;
    },
  },
  {
    id: 'DATA-003',
    title: 'Missing Backup',
    check: (spec) => {
      const hasBackup = spec.nodes.some((n) => n.type === 'backup');
      const hasDB = spec.nodes.some((n) => n.type === 'db-server');

      if (!hasBackup && hasDB) {
        return {
          id: 'DATA-003',
          title: '백업 시스템 누락',
          description: '데이터베이스가 있지만 백업 시스템이 없습니다.',
          severity: 'high',
          category: 'availability',
          affectedNodes: spec.nodes.filter((n) => n.type === 'db-server').map((n) => n.id),
          recommendation: '데이터 손실을 방지하기 위해 백업 시스템을 추가하세요.',
          references: ['CIS Control 11', 'ISO 27001 A.12.3'],
        };
      }
      return null;
    },
  },

  // Availability Rules
  {
    id: 'AVAIL-001',
    title: 'Single Point of Failure - Database',
    check: (spec) => {
      const dbServers = spec.nodes.filter((n) => n.type === 'db-server');

      if (dbServers.length === 1) {
        return {
          id: 'AVAIL-001',
          title: '단일 장애점 - 데이터베이스',
          description: '데이터베이스가 하나만 있어 단일 장애점(SPOF)이 됩니다.',
          severity: 'medium',
          category: 'availability',
          affectedNodes: dbServers.map((n) => n.id),
          recommendation: '고가용성을 위해 데이터베이스 복제본 또는 클러스터를 구성하세요.',
          references: ['AWS Well-Architected Framework - Reliability'],
        };
      }
      return null;
    },
  },
  {
    id: 'AVAIL-002',
    title: 'No CDN for Static Content',
    check: (spec) => {
      const hasCDN = spec.nodes.some((n) => n.type === 'cdn');
      const hasWebServer = spec.nodes.some((n) => n.type === 'web-server');
      const hasInternet = spec.nodes.some((n) => n.type === 'internet');

      if (!hasCDN && hasWebServer && hasInternet) {
        return {
          id: 'AVAIL-002',
          title: 'CDN 미사용',
          description: '외부 서비스를 제공하지만 CDN이 없습니다.',
          severity: 'low',
          category: 'availability',
          affectedNodes: spec.nodes.filter((n) => n.type === 'web-server').map((n) => n.id),
          recommendation: '정적 콘텐츠 배포와 DDoS 완화를 위해 CDN을 고려하세요.',
          references: ['AWS CloudFront Best Practices'],
        };
      }
      return null;
    },
  },

  // Compliance Rules
  {
    id: 'COMP-001',
    title: 'Missing IDS/IPS',
    check: (spec) => {
      const hasIDSIPS = spec.nodes.some((n) => n.type === 'ids-ips');
      const hasFirewall = spec.nodes.some((n) => n.type === 'firewall');

      if (!hasIDSIPS && hasFirewall) {
        return {
          id: 'COMP-001',
          title: 'IDS/IPS 누락',
          description: '방화벽은 있지만 침입 탐지/방지 시스템이 없습니다.',
          severity: 'medium',
          category: 'compliance',
          affectedNodes: spec.nodes.filter((n) => n.type === 'firewall').map((n) => n.id),
          recommendation: '네트워크 위협을 탐지하고 차단하기 위해 IDS/IPS를 추가하세요.',
          references: ['PCI DSS Requirement 11.4', 'CIS Control 13'],
        };
      }
      return null;
    },
  },
  {
    id: 'COMP-002',
    title: 'Missing NAC',
    check: (spec) => {
      const hasNAC = spec.nodes.some((n) => n.type === 'nac');
      const hasInternalNetwork = spec.nodes.some((n) =>
        n.zone === 'internal' || ['app-server', 'db-server'].includes(n.type)
      );

      if (!hasNAC && hasInternalNetwork) {
        return {
          id: 'COMP-002',
          title: 'NAC 누락',
          description: '내부 네트워크가 있지만 NAC(Network Access Control)가 없습니다.',
          severity: 'low',
          category: 'compliance',
          affectedNodes: [],
          recommendation: '네트워크 접근 제어를 위해 NAC 솔루션을 고려하세요.',
          references: ['CIS Control 1', '802.1X'],
        };
      }
      return null;
    },
  },

  // Best Practice Rules
  {
    id: 'BP-001',
    title: 'Missing Cache Layer',
    check: (spec) => {
      const hasCache = spec.nodes.some((n) => n.type === 'cache');
      const hasDB = spec.nodes.some((n) => n.type === 'db-server');
      const hasWebApp = spec.nodes.some((n) =>
        ['web-server', 'app-server'].includes(n.type)
      );

      if (!hasCache && hasDB && hasWebApp) {
        return {
          id: 'BP-001',
          title: '캐시 레이어 누락',
          description: '데이터베이스와 애플리케이션 사이에 캐시 레이어가 없습니다.',
          severity: 'info',
          category: 'best-practice',
          affectedNodes: [],
          recommendation: '성능 향상을 위해 Redis, Memcached 등의 캐시를 고려하세요.',
          references: ['AWS ElastiCache Best Practices'],
        };
      }
      return null;
    },
  },
  {
    id: 'BP-002',
    title: 'No DNS Configured',
    check: (spec) => {
      const hasDNS = spec.nodes.some((n) => n.type === 'dns');
      const hasMultipleServers = spec.nodes.filter((n) =>
        ['web-server', 'app-server'].includes(n.type)
      ).length > 1;

      if (!hasDNS && hasMultipleServers) {
        return {
          id: 'BP-002',
          title: 'DNS 구성 누락',
          description: '다중 서버 환경에서 DNS 설정이 없습니다.',
          severity: 'info',
          category: 'best-practice',
          affectedNodes: [],
          recommendation: '서비스 디스커버리와 로드 밸런싱을 위해 DNS를 구성하세요.',
          references: ['AWS Route 53 Best Practices'],
        };
      }
      return null;
    },
  },
];

/**
 * Calculate security score based on findings
 */
function calculateScore(findings: AuditFinding[]): number {
  const severityWeights: Record<AuditSeverity, number> = {
    critical: 25,
    high: 15,
    medium: 8,
    low: 3,
    info: 1,
  };

  let totalDeduction = 0;
  for (const finding of findings) {
    totalDeduction += severityWeights[finding.severity];
  }

  // Max deduction is 100, score is 100 - deduction
  return Math.max(0, 100 - totalDeduction);
}

/**
 * Generate audit summary
 */
function generateSummary(findings: AuditFinding[], totalChecks: number): AuditSummary {
  const summary: AuditSummary = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
    passed: totalChecks - findings.length,
  };

  for (const finding of findings) {
    summary[finding.severity]++;
  }

  return summary;
}

/**
 * Run security audit on InfraSpec
 */
export function runSecurityAudit(spec: InfraSpec, specName?: string): SecurityAuditResult {
  const findings: AuditFinding[] = [];

  for (const rule of securityRules) {
    const finding = rule.check(spec);
    if (finding) {
      findings.push(finding);
    }
  }

  // Sort by severity
  const severityOrder: Record<AuditSeverity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
    info: 4,
  };

  findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    timestamp: new Date().toISOString(),
    specName,
    totalNodes: spec.nodes.length,
    totalConnections: spec.connections.length,
    findings,
    score: calculateScore(findings),
    summary: generateSummary(findings, securityRules.length),
  };
}

/**
 * Get severity color for display
 */
export function getSeverityColor(severity: AuditSeverity): string {
  switch (severity) {
    case 'critical':
      return '#DC2626'; // red-600
    case 'high':
      return '#EA580C'; // orange-600
    case 'medium':
      return '#D97706'; // amber-600
    case 'low':
      return '#2563EB'; // blue-600
    case 'info':
      return '#6B7280'; // gray-500
    default:
      return '#6B7280';
  }
}

/**
 * Get severity badge
 */
export function getSeverityBadge(severity: AuditSeverity): string {
  switch (severity) {
    case 'critical':
      return 'Critical';
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    case 'low':
      return 'Low';
    case 'info':
      return 'Info';
    default:
      return 'Unknown';
  }
}
