/**
 * Vulnerability Database - Curated CVE/vulnerability entries for infrastructure components
 *
 * Each entry maps to one or more InfraNodeType and includes severity, CVSS score,
 * bilingual descriptions, mitigation steps, and trust metadata.
 */

import type { InfraNodeType } from '@/types/infra';
import type { TrustMetadata, KnowledgeSource } from './types';
import type { InfraSpec } from '@/types/infra';
import { compareBySeverity } from '@/lib/utils/severity';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CVESeverity = 'critical' | 'high' | 'medium' | 'low';

export interface VulnerabilityEntry {
  id: string;
  cveId?: string;
  affectedComponents: InfraNodeType[];
  severity: CVESeverity;
  cvssScore?: number;
  title: string;
  titleKo: string;
  description: string;
  descriptionKo: string;
  mitigation: string;
  mitigationKo: string;
  publishedDate: string;
  references: string[];
  trust: TrustMetadata;
}

export interface VulnerabilityStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  affectedComponentTypes: number;
}

// ---------------------------------------------------------------------------
// Source helpers
// ---------------------------------------------------------------------------

const NVD_SOURCE: KnowledgeSource = {
  type: 'nist',
  title: 'NIST National Vulnerability Database (NVD)',
  url: 'https://nvd.nist.gov/',
  accessedDate: '2026-02-10',
};

const MITRE_SOURCE: KnowledgeSource = {
  type: 'industry',
  title: 'MITRE CVE Program',
  url: 'https://cve.mitre.org/',
  accessedDate: '2026-02-10',
};

const GHSA_SOURCE: KnowledgeSource = {
  type: 'vendor',
  title: 'GitHub Security Advisories',
  url: 'https://github.com/advisories',
  accessedDate: '2026-02-10',
};

function vulnTrust(confidence: number, sources: KnowledgeSource[] = [NVD_SOURCE]): TrustMetadata {
  return {
    confidence,
    sources,
    lastReviewedAt: '2026-02-10',
    upvotes: 0,
    downvotes: 0,
  };
}

// ---------------------------------------------------------------------------
// Curated Vulnerability Database
// ---------------------------------------------------------------------------

export const VULNERABILITIES: VulnerabilityEntry[] = [
  // ---- Firewall (5) ----
  {
    id: 'VULN-FW-001',
    cveId: 'CVE-2023-46805',
    affectedComponents: ['firewall', 'vpn-gateway'],
    severity: 'critical',
    cvssScore: 9.8,
    title: 'Ivanti Connect Secure Authentication Bypass',
    titleKo: 'Ivanti Connect Secure 인증 우회 취약점',
    description: 'Authentication bypass vulnerability in Ivanti Connect Secure and Policy Secure allowing remote unauthenticated access.',
    descriptionKo: 'Ivanti Connect Secure 및 Policy Secure에서 원격 비인증 접근을 허용하는 인증 우회 취약점.',
    mitigation: 'Apply vendor patches immediately. Enable multi-factor authentication. Monitor for indicators of compromise.',
    mitigationKo: '벤더 패치를 즉시 적용하세요. 다중 인증을 활성화하세요. 침해 지표를 모니터링하세요.',
    publishedDate: '2024-01-10',
    references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-46805'],
    trust: vulnTrust(0.95, [NVD_SOURCE, MITRE_SOURCE]),
  },
  {
    id: 'VULN-FW-002',
    cveId: 'CVE-2024-3400',
    affectedComponents: ['firewall'],
    severity: 'critical',
    cvssScore: 10.0,
    title: 'Palo Alto PAN-OS GlobalProtect Command Injection',
    titleKo: 'Palo Alto PAN-OS GlobalProtect 명령 주입 취약점',
    description: 'Command injection vulnerability in GlobalProtect feature of PAN-OS allowing unauthenticated remote code execution.',
    descriptionKo: 'PAN-OS의 GlobalProtect 기능에서 비인증 원격 코드 실행을 허용하는 명령 주입 취약점.',
    mitigation: 'Update PAN-OS to latest version. Apply Threat Prevention signatures. Disable device telemetry if not needed.',
    mitigationKo: 'PAN-OS를 최신 버전으로 업데이트하세요. 위협 방지 시그니처를 적용하세요. 불필요한 디바이스 텔레메트리를 비활성화하세요.',
    publishedDate: '2024-04-12',
    references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-3400'],
    trust: vulnTrust(0.95, [NVD_SOURCE, MITRE_SOURCE]),
  },
  {
    id: 'VULN-FW-003',
    cveId: 'CVE-2023-20198',
    affectedComponents: ['firewall', 'router'],
    severity: 'critical',
    cvssScore: 10.0,
    title: 'Cisco IOS XE Web UI Privilege Escalation',
    titleKo: 'Cisco IOS XE 웹 UI 권한 상승 취약점',
    description: 'Cisco IOS XE web management interface allows unauthorized privilege escalation to create admin accounts.',
    descriptionKo: 'Cisco IOS XE 웹 관리 인터페이스에서 관리자 계정 생성이 가능한 권한 상승 취약점.',
    mitigation: 'Disable HTTP/HTTPS server feature on IOS XE. Apply Cisco patches. Restrict management access to trusted networks.',
    mitigationKo: 'IOS XE의 HTTP/HTTPS 서버 기능을 비활성화하세요. Cisco 패치를 적용하세요. 관리 접근을 신뢰할 수 있는 네트워크로 제한하세요.',
    publishedDate: '2023-10-16',
    references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-20198'],
    trust: vulnTrust(0.95, [NVD_SOURCE, MITRE_SOURCE]),
  },
  {
    id: 'VULN-FW-004',
    affectedComponents: ['firewall'],
    severity: 'high',
    cvssScore: 8.1,
    title: 'Default Firewall Rule Misconfiguration',
    titleKo: '방화벽 기본 규칙 미설정 취약점',
    description: 'Default-allow policies on firewall interfaces can expose internal networks to unauthorized access.',
    descriptionKo: '방화벽 인터페이스의 기본 허용 정책은 내부 네트워크를 비인가 접근에 노출할 수 있습니다.',
    mitigation: 'Implement default-deny policy on all interfaces. Review and audit firewall rules quarterly.',
    mitigationKo: '모든 인터페이스에 기본 차단 정책을 구현하세요. 분기별로 방화벽 규칙을 검토 및 감사하세요.',
    publishedDate: '2024-01-01',
    references: ['https://csrc.nist.gov/pubs/sp/800/41/r1/final'],
    trust: vulnTrust(0.9, [NVD_SOURCE]),
  },
  {
    id: 'VULN-FW-005',
    affectedComponents: ['firewall'],
    severity: 'medium',
    cvssScore: 6.5,
    title: 'Firewall Log Overflow Denial of Service',
    titleKo: '방화벽 로그 오버플로우 서비스 거부',
    description: 'Excessive logging without proper log rotation can fill disk space and disable firewall management.',
    descriptionKo: '적절한 로그 로테이션 없이 과도한 로깅은 디스크 공간을 채워 방화벽 관리를 비활성화할 수 있습니다.',
    mitigation: 'Configure log rotation policies. Use external SIEM for log collection. Set disk usage alerts.',
    mitigationKo: '로그 로테이션 정책을 구성하세요. 외부 SIEM을 사용하여 로그를 수집하세요. 디스크 사용량 알림을 설정하세요.',
    publishedDate: '2024-03-15',
    references: [],
    trust: vulnTrust(0.85),
  },

  // ---- WAF (4) ----
  {
    id: 'VULN-WAF-001',
    cveId: 'CVE-2023-50164',
    affectedComponents: ['waf', 'web-server'],
    severity: 'critical',
    cvssScore: 9.8,
    title: 'Apache Struts File Upload Path Traversal (WAF Bypass)',
    titleKo: 'Apache Struts 파일 업로드 경로 순회 (WAF 우회)',
    description: 'Attackers can bypass WAF rules via crafted file upload parameters leading to remote code execution.',
    descriptionKo: '공격자가 조작된 파일 업로드 매개변수를 통해 WAF 규칙을 우회하여 원격 코드 실행이 가능합니다.',
    mitigation: 'Update WAF signatures. Implement strict input validation on application layer. Deploy defense-in-depth.',
    mitigationKo: 'WAF 시그니처를 업데이트하세요. 애플리케이션 레이어에서 엄격한 입력 검증을 구현하세요. 심층 방어를 배포하세요.',
    publishedDate: '2023-12-07',
    references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-50164'],
    trust: vulnTrust(0.95, [NVD_SOURCE, MITRE_SOURCE]),
  },
  {
    id: 'VULN-WAF-002',
    affectedComponents: ['waf'],
    severity: 'high',
    cvssScore: 7.5,
    title: 'WAF Rule Bypass via HTTP/2 Desync',
    titleKo: 'HTTP/2 Desync을 통한 WAF 규칙 우회',
    description: 'HTTP/2 request smuggling can bypass WAF inspection when the WAF and backend handle protocol downgrade differently.',
    descriptionKo: 'WAF와 백엔드가 프로토콜 다운그레이드를 다르게 처리할 때 HTTP/2 요청 스머글링으로 WAF 검사를 우회할 수 있습니다.',
    mitigation: 'Enable HTTP/2 end-to-end. Configure WAF for HTTP/2 native inspection. Disable HTTP downgrade.',
    mitigationKo: 'HTTP/2 종단간 활성화하세요. WAF에서 HTTP/2 네이티브 검사를 구성하세요. HTTP 다운그레이드를 비활성화하세요.',
    publishedDate: '2024-02-20',
    references: [],
    trust: vulnTrust(0.85),
  },
  {
    id: 'VULN-WAF-003',
    affectedComponents: ['waf'],
    severity: 'medium',
    cvssScore: 5.3,
    title: 'WAF False Negative on Encoded Payloads',
    titleKo: 'WAF 인코딩된 페이로드 미탐지',
    description: 'Multi-encoding (URL + Unicode + Base64) can cause WAF to miss malicious payloads.',
    descriptionKo: '다중 인코딩(URL + 유니코드 + Base64)으로 인해 WAF가 악성 페이로드를 놓칠 수 있습니다.',
    mitigation: 'Enable recursive decoding in WAF. Add multi-encoding detection rules.',
    mitigationKo: 'WAF에서 재귀적 디코딩을 활성화하세요. 다중 인코딩 탐지 규칙을 추가하세요.',
    publishedDate: '2024-05-01',
    references: ['https://owasp.org/www-project-web-security-testing-guide/'],
    trust: vulnTrust(0.85),
  },
  {
    id: 'VULN-WAF-004',
    affectedComponents: ['waf'],
    severity: 'high',
    cvssScore: 8.0,
    title: 'WAF SSL/TLS Inspection Gap',
    titleKo: 'WAF SSL/TLS 검사 공백',
    description: 'WAF cannot inspect encrypted traffic if TLS termination is not properly configured, creating a blind spot.',
    descriptionKo: 'TLS 종단이 올바르게 구성되지 않으면 WAF가 암호화된 트래픽을 검사하지 못하여 사각지대가 생깁니다.',
    mitigation: 'Configure TLS termination at the WAF or load balancer. Use certificate pinning where applicable.',
    mitigationKo: 'WAF 또는 로드 밸런서에서 TLS 종단을 구성하세요. 해당되는 경우 인증서 피닝을 사용하세요.',
    publishedDate: '2024-01-15',
    references: [],
    trust: vulnTrust(0.9),
  },

  // ---- IDS/IPS (3) ----
  {
    id: 'VULN-IDS-001',
    affectedComponents: ['ids-ips'],
    severity: 'high',
    cvssScore: 7.8,
    title: 'IDS Signature Evasion via Packet Fragmentation',
    titleKo: 'IDS 패킷 분할을 통한 시그니처 회피',
    description: 'Fragmented packets can evade IDS/IPS signature-based detection if reassembly is not configured.',
    descriptionKo: '재조립이 구성되지 않은 경우 분할된 패킷이 IDS/IPS 시그니처 기반 탐지를 회피할 수 있습니다.',
    mitigation: 'Enable packet reassembly on IDS/IPS. Configure stream-based inspection. Keep signatures updated.',
    mitigationKo: 'IDS/IPS에서 패킷 재조립을 활성화하세요. 스트림 기반 검사를 구성하세요. 시그니처를 최신 상태로 유지하세요.',
    publishedDate: '2024-02-01',
    references: ['https://csrc.nist.gov/pubs/sp/800/94/final'],
    trust: vulnTrust(0.9, [NVD_SOURCE]),
  },
  {
    id: 'VULN-IDS-002',
    affectedComponents: ['ids-ips'],
    severity: 'medium',
    cvssScore: 6.0,
    title: 'IDS Alert Fatigue from High False Positive Rate',
    titleKo: 'IDS 높은 오탐율로 인한 알림 피로',
    description: 'Poorly tuned IDS rules generate excessive false positives, causing real alerts to be ignored.',
    descriptionKo: '부적절하게 튜닝된 IDS 규칙이 과도한 오탐을 생성하여 실제 알림이 무시될 수 있습니다.',
    mitigation: 'Tune IDS rules for the specific environment. Implement alert correlation. Use SIEM for aggregation.',
    mitigationKo: '특정 환경에 맞게 IDS 규칙을 튜닝하세요. 알림 상관분석을 구현하세요. SIEM을 활용하여 집계하세요.',
    publishedDate: '2024-03-01',
    references: [],
    trust: vulnTrust(0.85),
  },
  {
    id: 'VULN-IDS-003',
    affectedComponents: ['ids-ips'],
    severity: 'critical',
    cvssScore: 9.1,
    title: 'IPS Inline Mode Single Point of Failure',
    titleKo: 'IPS 인라인 모드 단일 장애점',
    description: 'IPS in inline mode without bypass mechanism becomes a single point of failure for all traffic.',
    descriptionKo: '바이패스 메커니즘 없이 인라인 모드로 운영되는 IPS는 모든 트래픽의 단일 장애점이 됩니다.',
    mitigation: 'Configure hardware bypass (fail-open). Deploy IPS in HA pair. Monitor IPS health continuously.',
    mitigationKo: '하드웨어 바이패스(fail-open)를 구성하세요. IPS를 HA 쌍으로 배포하세요. IPS 상태를 지속적으로 모니터링하세요.',
    publishedDate: '2024-01-20',
    references: [],
    trust: vulnTrust(0.9),
  },

  // ---- VPN Gateway (3) ----
  {
    id: 'VULN-VPN-001',
    cveId: 'CVE-2024-21762',
    affectedComponents: ['vpn-gateway'],
    severity: 'critical',
    cvssScore: 9.6,
    title: 'Fortinet FortiOS Out-of-Bounds Write',
    titleKo: 'Fortinet FortiOS 범위 외 쓰기 취약점',
    description: 'Out-of-bounds write vulnerability in FortiOS SSL VPN allowing remote code execution without authentication.',
    descriptionKo: 'FortiOS SSL VPN에서 인증 없이 원격 코드 실행이 가능한 범위 외 쓰기 취약점.',
    mitigation: 'Update FortiOS immediately. Disable SSL VPN if not required. Restrict VPN access by IP.',
    mitigationKo: 'FortiOS를 즉시 업데이트하세요. 불필요한 SSL VPN을 비활성화하세요. IP별로 VPN 접근을 제한하세요.',
    publishedDate: '2024-02-08',
    references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-21762'],
    trust: vulnTrust(0.95, [NVD_SOURCE, MITRE_SOURCE]),
  },
  {
    id: 'VULN-VPN-002',
    affectedComponents: ['vpn-gateway'],
    severity: 'high',
    cvssScore: 7.5,
    title: 'VPN Split Tunneling Data Leakage',
    titleKo: 'VPN 스플릿 터널링 데이터 유출',
    description: 'Split tunneling configuration may allow sensitive data to bypass VPN encryption and leak to the internet.',
    descriptionKo: '스플릿 터널링 구성으로 인해 민감한 데이터가 VPN 암호화를 우회하여 인터넷으로 유출될 수 있습니다.',
    mitigation: 'Use full tunnel mode for sensitive environments. Monitor DNS queries outside the tunnel.',
    mitigationKo: '민감한 환경에서는 풀 터널 모드를 사용하세요. 터널 외부의 DNS 쿼리를 모니터링하세요.',
    publishedDate: '2024-03-10',
    references: ['https://csrc.nist.gov/pubs/sp/800/77/r1/final'],
    trust: vulnTrust(0.9),
  },
  {
    id: 'VULN-VPN-003',
    affectedComponents: ['vpn-gateway'],
    severity: 'medium',
    cvssScore: 5.9,
    title: 'VPN Weak Cipher Suite Configuration',
    titleKo: 'VPN 취약한 암호 스위트 설정',
    description: 'Using deprecated cipher suites (DES, RC4, MD5) weakens VPN encryption and allows potential decryption.',
    descriptionKo: '더 이상 사용되지 않는 암호 스위트(DES, RC4, MD5) 사용은 VPN 암호화를 약화시키고 잠재적 복호화를 허용합니다.',
    mitigation: 'Enforce AES-256-GCM with SHA-384. Disable all deprecated cipher suites. Use IKEv2.',
    mitigationKo: 'AES-256-GCM과 SHA-384를 강제 적용하세요. 모든 더 이상 사용되지 않는 암호 스위트를 비활성화하세요. IKEv2를 사용하세요.',
    publishedDate: '2024-04-01',
    references: [],
    trust: vulnTrust(0.9),
  },

  // ---- Web Server (4) ----
  {
    id: 'VULN-WEB-001',
    cveId: 'CVE-2024-23897',
    affectedComponents: ['web-server', 'app-server'],
    severity: 'critical',
    cvssScore: 9.8,
    title: 'Jenkins CLI Arbitrary File Read',
    titleKo: 'Jenkins CLI 임의 파일 읽기 취약점',
    description: 'Jenkins CLI allows unauthenticated attackers to read arbitrary files on the controller file system.',
    descriptionKo: 'Jenkins CLI를 통해 비인증 공격자가 컨트롤러 파일 시스템의 임의 파일을 읽을 수 있습니다.',
    mitigation: 'Update Jenkins to latest version. Disable CLI if not needed. Restrict network access to Jenkins.',
    mitigationKo: 'Jenkins를 최신 버전으로 업데이트하세요. 불필요한 CLI를 비활성화하세요. Jenkins에 대한 네트워크 접근을 제한하세요.',
    publishedDate: '2024-01-26',
    references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-23897'],
    trust: vulnTrust(0.95, [NVD_SOURCE, GHSA_SOURCE]),
  },
  {
    id: 'VULN-WEB-002',
    affectedComponents: ['web-server'],
    severity: 'high',
    cvssScore: 7.5,
    title: 'Server Information Disclosure via HTTP Headers',
    titleKo: '서버 HTTP 헤더를 통한 정보 노출',
    description: 'Default server headers (Server, X-Powered-By) disclose software versions enabling targeted attacks.',
    descriptionKo: '기본 서버 헤더(Server, X-Powered-By)가 소프트웨어 버전을 노출하여 표적 공격을 가능하게 합니다.',
    mitigation: 'Remove or customize Server and X-Powered-By headers. Use security headers (CSP, HSTS, X-Frame-Options).',
    mitigationKo: 'Server 및 X-Powered-By 헤더를 제거하거나 커스터마이즈하세요. 보안 헤더(CSP, HSTS, X-Frame-Options)를 사용하세요.',
    publishedDate: '2024-01-01',
    references: [],
    trust: vulnTrust(0.85),
  },
  {
    id: 'VULN-WEB-003',
    affectedComponents: ['web-server'],
    severity: 'medium',
    cvssScore: 5.3,
    title: 'Directory Listing Enabled',
    titleKo: '디렉토리 리스팅 활성화',
    description: 'Enabled directory listing exposes file structure and potentially sensitive files to attackers.',
    descriptionKo: '활성화된 디렉토리 리스팅은 파일 구조와 잠재적으로 민감한 파일을 공격자에게 노출합니다.',
    mitigation: 'Disable directory listing in web server configuration. Restrict access to non-public directories.',
    mitigationKo: '웹 서버 구성에서 디렉토리 리스팅을 비활성화하세요. 비공개 디렉토리에 대한 접근을 제한하세요.',
    publishedDate: '2024-02-15',
    references: [],
    trust: vulnTrust(0.85),
  },
  {
    id: 'VULN-WEB-004',
    cveId: 'CVE-2024-27198',
    affectedComponents: ['web-server', 'app-server'],
    severity: 'critical',
    cvssScore: 9.8,
    title: 'JetBrains TeamCity Authentication Bypass',
    titleKo: 'JetBrains TeamCity 인증 우회',
    description: 'Authentication bypass in TeamCity web server allows unauthorized admin access and RCE.',
    descriptionKo: 'TeamCity 웹 서버의 인증 우회로 비인가 관리자 접근 및 원격 코드 실행이 가능합니다.',
    mitigation: 'Update TeamCity immediately. Restrict access to management ports. Enable audit logging.',
    mitigationKo: 'TeamCity를 즉시 업데이트하세요. 관리 포트에 대한 접근을 제한하세요. 감사 로깅을 활성화하세요.',
    publishedDate: '2024-03-04',
    references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-27198'],
    trust: vulnTrust(0.95, [NVD_SOURCE, GHSA_SOURCE]),
  },

  // ---- Database Server (4) ----
  {
    id: 'VULN-DB-001',
    affectedComponents: ['db-server'],
    severity: 'critical',
    cvssScore: 9.1,
    title: 'SQL Injection via Unparameterized Queries',
    titleKo: '비매개변수화 쿼리를 통한 SQL 인젝션',
    description: 'Applications using string concatenation for SQL queries are vulnerable to SQL injection attacks.',
    descriptionKo: 'SQL 쿼리에 문자열 연결을 사용하는 애플리케이션은 SQL 인젝션 공격에 취약합니다.',
    mitigation: 'Use parameterized queries/prepared statements exclusively. Deploy a WAF with SQL injection rules.',
    mitigationKo: '매개변수화된 쿼리/프리페어드 스테이트먼트만 사용하세요. SQL 인젝션 규칙이 포함된 WAF를 배포하세요.',
    publishedDate: '2024-01-01',
    references: ['https://owasp.org/Top10/'],
    trust: vulnTrust(0.95, [NVD_SOURCE, { type: 'owasp', title: 'OWASP Top 10 (2021)', url: 'https://owasp.org/Top10/', accessedDate: '2026-02-10' }]),
  },
  {
    id: 'VULN-DB-002',
    affectedComponents: ['db-server'],
    severity: 'high',
    cvssScore: 8.0,
    title: 'Database Default Credentials',
    titleKo: '데이터베이스 기본 자격 증명 사용',
    description: 'Using default or weak database credentials allows unauthorized data access.',
    descriptionKo: '기본 또는 취약한 데이터베이스 자격 증명 사용은 비인가 데이터 접근을 허용합니다.',
    mitigation: 'Change all default passwords. Enforce strong password policy. Use certificate-based authentication.',
    mitigationKo: '모든 기본 비밀번호를 변경하세요. 강력한 비밀번호 정책을 시행하세요. 인증서 기반 인증을 사용하세요.',
    publishedDate: '2024-01-01',
    references: [],
    trust: vulnTrust(0.9),
  },
  {
    id: 'VULN-DB-003',
    affectedComponents: ['db-server'],
    severity: 'high',
    cvssScore: 7.5,
    title: 'Unencrypted Database Connections',
    titleKo: '암호화되지 않은 데이터베이스 연결',
    description: 'Database connections without TLS expose query data and credentials to network sniffing.',
    descriptionKo: 'TLS 없는 데이터베이스 연결은 쿼리 데이터와 자격 증명을 네트워크 스니핑에 노출합니다.',
    mitigation: 'Enable TLS for all database connections. Use mutual TLS for service-to-service communication.',
    mitigationKo: '모든 데이터베이스 연결에 TLS를 활성화하세요. 서비스 간 통신에 상호 TLS를 사용하세요.',
    publishedDate: '2024-02-01',
    references: [],
    trust: vulnTrust(0.9),
  },
  {
    id: 'VULN-DB-004',
    affectedComponents: ['db-server', 'backup'],
    severity: 'medium',
    cvssScore: 6.5,
    title: 'Database Backup Without Encryption',
    titleKo: '암호화 없는 데이터베이스 백업',
    description: 'Unencrypted database backups stored on disk or transferred over network expose sensitive data.',
    descriptionKo: '디스크에 저장되거나 네트워크를 통해 전송되는 암호화되지 않은 데이터베이스 백업은 민감한 데이터를 노출합니다.',
    mitigation: 'Encrypt all backups at rest and in transit. Verify backup encryption regularly.',
    mitigationKo: '모든 백업을 저장 시 및 전송 중 암호화하세요. 정기적으로 백업 암호화를 확인하세요.',
    publishedDate: '2024-03-01',
    references: [],
    trust: vulnTrust(0.85),
  },

  // ---- Load Balancer (3) ----
  {
    id: 'VULN-LB-001',
    affectedComponents: ['load-balancer'],
    severity: 'high',
    cvssScore: 7.5,
    title: 'Load Balancer Health Check Bypass',
    titleKo: '로드 밸런서 헬스 체크 우회',
    description: 'Attackers can manipulate health check endpoints to route traffic to compromised backends.',
    descriptionKo: '공격자가 헬스 체크 엔드포인트를 조작하여 트래픽을 손상된 백엔드로 라우팅할 수 있습니다.',
    mitigation: 'Use authenticated health check endpoints. Monitor backend health independently. Implement anomaly detection.',
    mitigationKo: '인증된 헬스 체크 엔드포인트를 사용하세요. 백엔드 상태를 독립적으로 모니터링하세요. 이상 탐지를 구현하세요.',
    publishedDate: '2024-04-01',
    references: [],
    trust: vulnTrust(0.85),
  },
  {
    id: 'VULN-LB-002',
    affectedComponents: ['load-balancer'],
    severity: 'medium',
    cvssScore: 5.9,
    title: 'SSL/TLS Certificate Expiry',
    titleKo: 'SSL/TLS 인증서 만료',
    description: 'Expired TLS certificates on load balancers cause service disruption and security warnings.',
    descriptionKo: '로드 밸런서의 만료된 TLS 인증서는 서비스 중단과 보안 경고를 유발합니다.',
    mitigation: 'Use automated certificate renewal (Let\'s Encrypt, ACM). Set expiry monitoring alerts.',
    mitigationKo: '자동화된 인증서 갱신(Let\'s Encrypt, ACM)을 사용하세요. 만료 모니터링 알림을 설정하세요.',
    publishedDate: '2024-01-01',
    references: [],
    trust: vulnTrust(0.85),
  },
  {
    id: 'VULN-LB-003',
    affectedComponents: ['load-balancer'],
    severity: 'high',
    cvssScore: 8.6,
    title: 'Load Balancer DDoS Amplification',
    titleKo: '로드 밸런서 DDoS 증폭',
    description: 'Misconfigured load balancers can amplify DDoS attacks by forwarding malicious traffic to all backends.',
    descriptionKo: '잘못 구성된 로드 밸런서가 악의적인 트래픽을 모든 백엔드로 전달하여 DDoS 공격을 증폭할 수 있습니다.',
    mitigation: 'Implement rate limiting on load balancer. Use DDoS protection services. Configure connection limits.',
    mitigationKo: '로드 밸런서에 속도 제한을 구현하세요. DDoS 방어 서비스를 사용하세요. 연결 제한을 구성하세요.',
    publishedDate: '2024-02-15',
    references: [],
    trust: vulnTrust(0.85),
  },

  // ---- DNS (2) ----
  {
    id: 'VULN-DNS-001',
    affectedComponents: ['dns'],
    severity: 'high',
    cvssScore: 7.5,
    title: 'DNS Cache Poisoning',
    titleKo: 'DNS 캐시 포이즈닝',
    description: 'DNS servers without DNSSEC are vulnerable to cache poisoning attacks redirecting users to malicious sites.',
    descriptionKo: 'DNSSEC이 없는 DNS 서버는 사용자를 악성 사이트로 리디렉션하는 캐시 포이즈닝 공격에 취약합니다.',
    mitigation: 'Implement DNSSEC. Use DNS-over-HTTPS (DoH) or DNS-over-TLS (DoT). Randomize source ports.',
    mitigationKo: 'DNSSEC을 구현하세요. DNS-over-HTTPS(DoH) 또는 DNS-over-TLS(DoT)를 사용하세요. 소스 포트를 무작위화하세요.',
    publishedDate: '2024-01-01',
    references: ['https://csrc.nist.gov/pubs/sp/800/81/2/final'],
    trust: vulnTrust(0.9, [NVD_SOURCE]),
  },
  {
    id: 'VULN-DNS-002',
    affectedComponents: ['dns'],
    severity: 'medium',
    cvssScore: 5.3,
    title: 'DNS Zone Transfer Information Disclosure',
    titleKo: 'DNS 존 전송 정보 노출',
    description: 'Unrestricted DNS zone transfers expose entire domain infrastructure to potential attackers.',
    descriptionKo: '제한되지 않은 DNS 존 전송은 전체 도메인 인프라를 잠재적 공격자에게 노출합니다.',
    mitigation: 'Restrict zone transfers to authorized secondary DNS servers. Use TSIG for zone transfer authentication.',
    mitigationKo: '권한이 있는 보조 DNS 서버로만 존 전송을 제한하세요. 존 전송 인증에 TSIG를 사용하세요.',
    publishedDate: '2024-02-01',
    references: [],
    trust: vulnTrust(0.9),
  },

  // ---- Kubernetes (3) ----
  {
    id: 'VULN-K8S-001',
    cveId: 'CVE-2024-21626',
    affectedComponents: ['kubernetes', 'container'],
    severity: 'critical',
    cvssScore: 8.6,
    title: 'runc Container Escape via fd Leak',
    titleKo: 'runc 컨테이너 이스케이프 (fd 누수)',
    description: 'A file descriptor leak in runc allows container escape to the host system.',
    descriptionKo: 'runc의 파일 디스크립터 누수로 인해 컨테이너에서 호스트 시스템으로 탈출이 가능합니다.',
    mitigation: 'Update runc to 1.1.12+. Use user namespaces. Apply Pod Security Standards.',
    mitigationKo: 'runc를 1.1.12 이상으로 업데이트하세요. 사용자 네임스페이스를 사용하세요. Pod 보안 표준을 적용하세요.',
    publishedDate: '2024-01-31',
    references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-21626'],
    trust: vulnTrust(0.95, [NVD_SOURCE, GHSA_SOURCE]),
  },
  {
    id: 'VULN-K8S-002',
    affectedComponents: ['kubernetes'],
    severity: 'high',
    cvssScore: 8.0,
    title: 'Kubernetes RBAC Misconfiguration',
    titleKo: 'Kubernetes RBAC 잘못된 구성',
    description: 'Overly permissive RBAC roles (cluster-admin) allow lateral movement within the cluster.',
    descriptionKo: '과도하게 허용적인 RBAC 역할(cluster-admin)이 클러스터 내 횡적 이동을 허용합니다.',
    mitigation: 'Apply least-privilege RBAC policies. Audit ClusterRoleBindings regularly. Use namespace isolation.',
    mitigationKo: '최소 권한 RBAC 정책을 적용하세요. ClusterRoleBindings를 정기적으로 감사하세요. 네임스페이스 격리를 사용하세요.',
    publishedDate: '2024-01-15',
    references: ['https://kubernetes.io/docs/concepts/security/'],
    trust: vulnTrust(0.9),
  },
  {
    id: 'VULN-K8S-003',
    affectedComponents: ['kubernetes', 'container'],
    severity: 'high',
    cvssScore: 7.8,
    title: 'Privileged Container Execution',
    titleKo: '특권 컨테이너 실행',
    description: 'Running containers in privileged mode grants full host access, bypassing all container isolation.',
    descriptionKo: '특권 모드에서 컨테이너를 실행하면 모든 컨테이너 격리를 우회하여 전체 호스트 접근이 가능합니다.',
    mitigation: 'Prohibit privileged containers. Use Pod Security Admission. Enable seccomp and AppArmor profiles.',
    mitigationKo: '특권 컨테이너를 금지하세요. Pod Security Admission을 사용하세요. seccomp 및 AppArmor 프로필을 활성화하세요.',
    publishedDate: '2024-02-01',
    references: [],
    trust: vulnTrust(0.9),
  },

  // ---- Cloud (4) ----
  {
    id: 'VULN-CLOUD-001',
    affectedComponents: ['aws-vpc', 'azure-vnet', 'gcp-network'],
    severity: 'high',
    cvssScore: 8.0,
    title: 'Cloud Security Group Overly Permissive Rules',
    titleKo: '클라우드 보안 그룹 과도하게 허용적인 규칙',
    description: 'Security groups with 0.0.0.0/0 ingress rules expose cloud resources to the internet.',
    descriptionKo: '0.0.0.0/0 인그레스 규칙을 가진 보안 그룹은 클라우드 리소스를 인터넷에 노출합니다.',
    mitigation: 'Restrict security group rules to specific IP ranges. Use VPC endpoints for AWS services.',
    mitigationKo: '보안 그룹 규칙을 특정 IP 범위로 제한하세요. AWS 서비스에는 VPC 엔드포인트를 사용하세요.',
    publishedDate: '2024-01-01',
    references: [],
    trust: vulnTrust(0.9),
  },
  {
    id: 'VULN-CLOUD-002',
    affectedComponents: ['aws-vpc', 'azure-vnet', 'gcp-network'],
    severity: 'critical',
    cvssScore: 9.0,
    title: 'Cloud IAM Root/Global Admin Usage',
    titleKo: '클라우드 IAM 루트/글로벌 관리자 사용',
    description: 'Using root or global admin accounts for daily operations increases risk of credential compromise.',
    descriptionKo: '일상 운영에 루트 또는 글로벌 관리자 계정을 사용하면 자격 증명 침해 위험이 증가합니다.',
    mitigation: 'Create individual IAM users. Enable MFA for all accounts. Use temporary credentials (STS).',
    mitigationKo: '개별 IAM 사용자를 생성하세요. 모든 계정에 MFA를 활성화하세요. 임시 자격 증명(STS)을 사용하세요.',
    publishedDate: '2024-01-01',
    references: [],
    trust: vulnTrust(0.9),
  },
  {
    id: 'VULN-CLOUD-003',
    affectedComponents: ['object-storage'],
    severity: 'critical',
    cvssScore: 9.8,
    title: 'Public Cloud Storage Bucket Exposure',
    titleKo: '공개 클라우드 스토리지 버킷 노출',
    description: 'Misconfigured S3/Blob/GCS buckets with public access expose sensitive data.',
    descriptionKo: '공개 접근이 설정된 S3/Blob/GCS 버킷의 잘못된 구성이 민감한 데이터를 노출합니다.',
    mitigation: 'Enable "Block Public Access" settings. Use bucket policies with least-privilege. Enable access logging.',
    mitigationKo: '"공개 접근 차단" 설정을 활성화하세요. 최소 권한 버킷 정책을 사용하세요. 접근 로깅을 활성화하세요.',
    publishedDate: '2024-01-01',
    references: [],
    trust: vulnTrust(0.95),
  },
  {
    id: 'VULN-CLOUD-004',
    affectedComponents: ['aws-vpc', 'azure-vnet', 'gcp-network', 'private-cloud'],
    severity: 'medium',
    cvssScore: 6.5,
    title: 'Cloud Network VPC Peering Misconfiguration',
    titleKo: '클라우드 네트워크 VPC 피어링 잘못된 구성',
    description: 'Unrestricted VPC peering routes can expose private subnets to unintended peer networks.',
    descriptionKo: '제한되지 않은 VPC 피어링 라우팅이 비공개 서브넷을 의도하지 않은 피어 네트워크에 노출할 수 있습니다.',
    mitigation: 'Use specific route tables for VPC peering. Implement network ACLs. Audit peering connections regularly.',
    mitigationKo: 'VPC 피어링에 특정 라우팅 테이블을 사용하세요. 네트워크 ACL을 구현하세요. 피어링 연결을 정기적으로 감사하세요.',
    publishedDate: '2024-02-01',
    references: [],
    trust: vulnTrust(0.85),
  },

  // ---- Authentication (3) ----
  {
    id: 'VULN-AUTH-001',
    affectedComponents: ['ldap-ad', 'sso', 'iam'],
    severity: 'critical',
    cvssScore: 9.0,
    title: 'LDAP Injection Attack',
    titleKo: 'LDAP 인젝션 공격',
    description: 'Unsanitized user input in LDAP queries allows authentication bypass and data exfiltration.',
    descriptionKo: 'LDAP 쿼리에서 살균되지 않은 사용자 입력은 인증 우회 및 데이터 유출을 허용합니다.',
    mitigation: 'Sanitize all LDAP query inputs. Use parameterized LDAP queries. Implement input validation.',
    mitigationKo: '모든 LDAP 쿼리 입력을 살균하세요. 매개변수화된 LDAP 쿼리를 사용하세요. 입력 검증을 구현하세요.',
    publishedDate: '2024-01-01',
    references: [],
    trust: vulnTrust(0.9),
  },
  {
    id: 'VULN-AUTH-002',
    affectedComponents: ['mfa'],
    severity: 'high',
    cvssScore: 7.5,
    title: 'MFA Fatigue Attack (Push Bombing)',
    titleKo: 'MFA 피로 공격 (푸시 폭격)',
    description: 'Repeated MFA push notifications can pressure users into approving unauthorized access.',
    descriptionKo: '반복적인 MFA 푸시 알림이 사용자를 압박하여 비인가 접근을 승인하게 만들 수 있습니다.',
    mitigation: 'Use number matching for MFA push. Implement rate limiting on MFA requests. Alert on anomalous MFA patterns.',
    mitigationKo: 'MFA 푸시에 번호 매칭을 사용하세요. MFA 요청에 속도 제한을 구현하세요. 비정상적인 MFA 패턴에 대해 알림을 설정하세요.',
    publishedDate: '2024-03-01',
    references: [],
    trust: vulnTrust(0.85),
  },
  {
    id: 'VULN-AUTH-003',
    affectedComponents: ['sso'],
    severity: 'high',
    cvssScore: 8.0,
    title: 'SSO Token Hijacking',
    titleKo: 'SSO 토큰 하이재킹',
    description: 'Stolen SSO tokens can grant access to all connected applications without re-authentication.',
    descriptionKo: '탈취된 SSO 토큰은 재인증 없이 모든 연결된 애플리케이션에 접근을 허용할 수 있습니다.',
    mitigation: 'Implement token binding. Use short-lived tokens with refresh rotation. Enable session monitoring.',
    mitigationKo: '토큰 바인딩을 구현하세요. 리프레시 로테이션이 포함된 단기 토큰을 사용하세요. 세션 모니터링을 활성화하세요.',
    publishedDate: '2024-02-15',
    references: [],
    trust: vulnTrust(0.85),
  },

  // ---- SASE/SIEM/SOAR (3) ----
  {
    id: 'VULN-SASE-001',
    affectedComponents: ['sase-gateway', 'ztna-broker'],
    severity: 'high',
    cvssScore: 7.5,
    title: 'SASE Policy Bypass via Split Tunnel',
    titleKo: 'SASE 스플릿 터널을 통한 정책 우회',
    description: 'Split tunnel configurations in SASE can allow traffic to bypass cloud security inspection.',
    descriptionKo: 'SASE의 스플릿 터널 구성으로 인해 트래픽이 클라우드 보안 검사를 우회할 수 있습니다.',
    mitigation: 'Enforce full tunnel mode. Use local internet breakout only for approved SaaS. Monitor split tunnel usage.',
    mitigationKo: '풀 터널 모드를 강제 적용하세요. 승인된 SaaS에만 로컬 인터넷 브레이크아웃을 사용하세요. 스플릿 터널 사용을 모니터링하세요.',
    publishedDate: '2024-04-01',
    references: [],
    trust: vulnTrust(0.85),
  },
  {
    id: 'VULN-SIEM-001',
    affectedComponents: ['siem'],
    severity: 'high',
    cvssScore: 7.0,
    title: 'SIEM Log Ingestion Gap',
    titleKo: 'SIEM 로그 수집 공백',
    description: 'Critical security logs not forwarded to SIEM create visibility gaps in threat detection.',
    descriptionKo: '중요 보안 로그가 SIEM으로 전달되지 않으면 위협 탐지에 가시성 공백이 생깁니다.',
    mitigation: 'Audit log source coverage quarterly. Enable log collection for all security-critical systems. Set up missing log alerts.',
    mitigationKo: '분기별로 로그 소스 범위를 감사하세요. 모든 보안 중요 시스템에서 로그 수집을 활성화하세요. 누락된 로그 알림을 설정하세요.',
    publishedDate: '2024-02-01',
    references: [],
    trust: vulnTrust(0.85),
  },
  {
    id: 'VULN-CASB-001',
    affectedComponents: ['casb'],
    severity: 'medium',
    cvssScore: 6.0,
    title: 'CASB Shadow IT Detection Gap',
    titleKo: 'CASB 섀도우 IT 탐지 공백',
    description: 'CASB may miss unapproved cloud applications accessed via non-standard ports or encrypted channels.',
    descriptionKo: 'CASB가 비표준 포트나 암호화된 채널을 통해 접근하는 미승인 클라우드 애플리케이션을 놓칠 수 있습니다.',
    mitigation: 'Enable SSL inspection. Use API-based CASB alongside proxy-based. Maintain updated cloud app catalog.',
    mitigationKo: 'SSL 검사를 활성화하세요. 프록시 기반과 함께 API 기반 CASB를 사용하세요. 최신 클라우드 앱 카탈로그를 유지하세요.',
    publishedDate: '2024-03-15',
    references: [],
    trust: vulnTrust(0.85),
  },

  // ---- CDN / NAC / DLP (3) ----
  {
    id: 'VULN-CDN-001',
    affectedComponents: ['cdn'],
    severity: 'high',
    cvssScore: 7.5,
    title: 'CDN Cache Poisoning',
    titleKo: 'CDN 캐시 포이즈닝',
    description: 'Attackers can inject malicious content into CDN caches via crafted HTTP headers.',
    descriptionKo: '공격자가 조작된 HTTP 헤더를 통해 CDN 캐시에 악성 콘텐츠를 주입할 수 있습니다.',
    mitigation: 'Normalize cache keys. Use strict cache-control headers. Enable cache key security features.',
    mitigationKo: '캐시 키를 정규화하세요. 엄격한 cache-control 헤더를 사용하세요. 캐시 키 보안 기능을 활성화하세요.',
    publishedDate: '2024-02-01',
    references: [],
    trust: vulnTrust(0.85),
  },
  {
    id: 'VULN-NAC-001',
    affectedComponents: ['nac'],
    severity: 'high',
    cvssScore: 7.5,
    title: 'NAC MAC Address Spoofing Bypass',
    titleKo: 'NAC MAC 주소 스푸핑 우회',
    description: 'NAC policies relying solely on MAC addresses can be bypassed by MAC spoofing.',
    descriptionKo: 'MAC 주소에만 의존하는 NAC 정책은 MAC 스푸핑으로 우회될 수 있습니다.',
    mitigation: 'Combine MAC-based NAC with 802.1X authentication. Use device profiling and posture assessment.',
    mitigationKo: 'MAC 기반 NAC을 802.1X 인증과 결합하세요. 디바이스 프로파일링 및 포스처 평가를 사용하세요.',
    publishedDate: '2024-01-15',
    references: [],
    trust: vulnTrust(0.85),
  },
  {
    id: 'VULN-DLP-001',
    affectedComponents: ['dlp'],
    severity: 'medium',
    cvssScore: 6.0,
    title: 'DLP Evasion via Encrypted Channels',
    titleKo: 'DLP 암호화 채널을 통한 회피',
    description: 'Data can be exfiltrated via encrypted channels that DLP cannot inspect without SSL/TLS termination.',
    descriptionKo: 'SSL/TLS 종단 없이 DLP가 검사할 수 없는 암호화된 채널을 통해 데이터가 유출될 수 있습니다.',
    mitigation: 'Enable SSL/TLS inspection on DLP. Use endpoint DLP agents. Monitor encrypted traffic volumes.',
    mitigationKo: 'DLP에서 SSL/TLS 검사를 활성화하세요. 엔드포인트 DLP 에이전트를 사용하세요. 암호화된 트래픽 볼륨을 모니터링하세요.',
    publishedDate: '2024-03-01',
    references: [],
    trust: vulnTrust(0.85),
  },

  // ---- Cache / Storage (2) ----
  {
    id: 'VULN-CACHE-001',
    affectedComponents: ['cache'],
    severity: 'critical',
    cvssScore: 9.8,
    title: 'Redis Unauthenticated Remote Access',
    titleKo: 'Redis 비인증 원격 접근',
    description: 'Redis instances without authentication or exposed to the internet allow arbitrary data read/write.',
    descriptionKo: '인증 없이 인터넷에 노출된 Redis 인스턴스는 임의 데이터 읽기/쓰기를 허용합니다.',
    mitigation: 'Enable Redis AUTH. Bind to localhost or private network only. Use Redis ACLs for fine-grained access.',
    mitigationKo: 'Redis AUTH를 활성화하세요. 로컬호스트 또는 프라이빗 네트워크에만 바인딩하세요. 세밀한 접근을 위해 Redis ACL을 사용하세요.',
    publishedDate: '2024-01-01',
    references: [],
    trust: vulnTrust(0.9),
  },
  {
    id: 'VULN-STORAGE-001',
    affectedComponents: ['san-nas', 'object-storage', 'storage'],
    severity: 'high',
    cvssScore: 7.5,
    title: 'Storage Encryption at Rest Not Enabled',
    titleKo: '저장소 저장 시 암호화 미활성화',
    description: 'Storage volumes and file systems without encryption at rest expose data if physical access is gained.',
    descriptionKo: '저장 시 암호화가 없는 스토리지 볼륨 및 파일 시스템은 물리적 접근 시 데이터를 노출합니다.',
    mitigation: 'Enable encryption at rest for all storage. Use customer-managed keys (CMK). Verify encryption status.',
    mitigationKo: '모든 스토리지에 저장 시 암호화를 활성화하세요. 고객 관리 키(CMK)를 사용하세요. 암호화 상태를 확인하세요.',
    publishedDate: '2024-01-01',
    references: [],
    trust: vulnTrust(0.9),
  },
];

// ---------------------------------------------------------------------------
// Query Helpers
// ---------------------------------------------------------------------------

/** Get all vulnerabilities affecting a specific component type */
export function getVulnerabilitiesForType(type: InfraNodeType): VulnerabilityEntry[] {
  return VULNERABILITIES.filter((v) => v.affectedComponents.includes(type));
}

/** Get all critical severity vulnerabilities */
export function getCriticalVulnerabilities(): VulnerabilityEntry[] {
  return VULNERABILITIES.filter((v) => v.severity === 'critical');
}

/** Get all vulnerabilities relevant to a given InfraSpec */
export function getVulnerabilitiesForSpec(spec: InfraSpec): VulnerabilityEntry[] {
  const types = new Set(spec.nodes.map((n) => n.type));
  const seen = new Set<string>();
  const result: VulnerabilityEntry[] = [];

  for (const v of VULNERABILITIES) {
    if (seen.has(v.id)) continue;
    if (v.affectedComponents.some((c) => types.has(c))) {
      seen.add(v.id);
      result.push(v);
    }
  }

  // Sort: critical first, then high, medium, low
  return result.sort((a, b) => compareBySeverity(a.severity, b.severity));
}

/** Get aggregate vulnerability statistics */
export function getVulnerabilityStats(entries?: VulnerabilityEntry[]): VulnerabilityStats {
  const vulns = entries ?? VULNERABILITIES;
  const affectedTypes = new Set(vulns.flatMap((v) => v.affectedComponents));
  return {
    total: vulns.length,
    critical: vulns.filter((v) => v.severity === 'critical').length,
    high: vulns.filter((v) => v.severity === 'high').length,
    medium: vulns.filter((v) => v.severity === 'medium').length,
    low: vulns.filter((v) => v.severity === 'low').length,
    affectedComponentTypes: affectedTypes.size,
  };
}
