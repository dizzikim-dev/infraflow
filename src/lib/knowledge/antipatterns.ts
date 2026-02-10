/**
 * Infrastructure Anti-patterns - Detection and Remediation
 *
 * 22 verified anti-patterns with automated detection functions.
 * Each anti-pattern carries trust metadata with real source citations.
 *
 * Categories:
 * - AP-SEC: Critical security anti-patterns
 * - AP-HA: High availability anti-patterns
 * - AP-PERF: Performance anti-patterns
 * - AP-ARCH: Architecture design anti-patterns
 */

import type { InfraNodeType, InfraSpec, InfraNodeSpec } from '@/types/infra';
import type { AntiPattern } from './types';
import {
  NIST_800_41,
  NIST_800_44,
  NIST_800_53,
  NIST_800_63B,
  NIST_800_77,
  NIST_800_81,
  NIST_800_123,
  NIST_800_144,
  NIST_800_145,
  NIST_800_207,
  OWASP_TOP10,
  OWASP_WSTG,
  AWS_WAF_REL,
  AWS_WAF_SEC,
  AWS_WAF_PERF,
  AWS_WAF_OPS,
  AZURE_CAF,
  GCP_ARCH_FRAMEWORK,
  CNCF_SECURITY,
  CIS_KUBERNETES,
  K8S_DOCS,
  SANS_CIS_TOP20,
  SANS_FIREWALL,
  CIS_V8_12,
  withSection,
} from './sourceRegistry';

// ---------------------------------------------------------------------------
// Internal helper functions
// ---------------------------------------------------------------------------

/** Check if spec contains at least one node of the given type */
function hasNodeType(spec: InfraSpec, type: InfraNodeType): boolean {
  return spec.nodes.some((n) => n.type === type);
}

/** Check if spec contains at least one node from a list of types */
function hasNodeOfCategory(spec: InfraSpec, types: InfraNodeType[]): boolean {
  return spec.nodes.some((n) => types.includes(n.type));
}

/** Check if there is a direct connection between any node of sourceType and any node of targetType */
function isDirectlyConnected(spec: InfraSpec, sourceType: InfraNodeType, targetType: InfraNodeType): boolean {
  const sourceIds = spec.nodes.filter((n) => n.type === sourceType).map((n) => n.id);
  const targetIds = spec.nodes.filter((n) => n.type === targetType).map((n) => n.id);

  return spec.connections.some(
    (c) =>
      (sourceIds.includes(c.source) && targetIds.includes(c.target)) ||
      (sourceIds.includes(c.target) && targetIds.includes(c.source)),
  );
}

/** Get all nodes of a given type */
function getNodesByType(spec: InfraSpec, type: InfraNodeType): InfraNodeSpec[] {
  return spec.nodes.filter((n) => n.type === type);
}

/** Count nodes of a given type */
function countNodesByType(spec: InfraSpec, type: InfraNodeType): number {
  return spec.nodes.filter((n) => n.type === type).length;
}

// Commonly used type groups
const COMPUTE_TYPES: InfraNodeType[] = ['web-server', 'app-server', 'db-server', 'container', 'vm', 'kubernetes'];
const AUTH_TYPES: InfraNodeType[] = ['ldap-ad', 'sso', 'mfa', 'iam'];
const INTERNAL_ONLY_TYPES: InfraNodeType[] = ['ldap-ad', 'san-nas', 'backup', 'cache', 'db-server'];

// ---------------------------------------------------------------------------
// Critical Security Anti-patterns (AP-SEC)
// ---------------------------------------------------------------------------

const securityAntiPatterns: AntiPattern[] = [
  {
    id: 'AP-SEC-001',
    type: 'antipattern',
    name: 'DB Direct Internet Exposure',
    nameKo: '데이터베이스 인터넷 직접 노출',
    severity: 'critical',
    detection: (spec: InfraSpec): boolean => {
      // db-server directly connected to internet without firewall in between
      if (!hasNodeType(spec, 'db-server') || !hasNodeType(spec, 'internet')) return false;
      return isDirectlyConnected(spec, 'db-server', 'internet');
    },
    detectionDescriptionKo: 'db-server 노드가 internet 노드와 방화벽 없이 직접 연결되어 있는지 검사합니다.',
    problemKo: '데이터베이스가 인터넷에 직접 노출되면 SQL 인젝션, 무차별 대입 공격, 데이터 탈취 등 치명적 보안 위협에 노출됩니다.',
    impactKo: '전체 데이터베이스 침해, 고객 개인정보 유출, 규정 위반 벌금, 기업 신뢰도 치명적 손상이 발생할 수 있습니다.',
    solutionKo: '데이터베이스를 내부 네트워크(data 티어)에 배치하고, 방화벽과 애플리케이션 서버를 통해서만 접근하도록 구성하세요.',
    tags: ['security', 'database', 'internet-exposure', 'critical'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(NIST_800_41, 'Section 2.1 - Network Segmentation'),
        withSection(NIST_800_123, 'Section 5 - Secure Network Configuration'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'AP-SEC-002',
    type: 'antipattern',
    name: 'No Firewall',
    nameKo: '방화벽 부재',
    severity: 'critical',
    detection: (spec: InfraSpec): boolean => {
      // Has compute nodes but no firewall at all
      if (!hasNodeOfCategory(spec, COMPUTE_TYPES)) return false;
      return !hasNodeType(spec, 'firewall');
    },
    detectionDescriptionKo: '컴퓨팅 노드(웹/앱/DB 서버)가 존재하지만 방화벽이 전혀 없는지 검사합니다.',
    problemKo: '방화벽 없이 서버를 운영하면 네트워크 계층의 접근 제어가 전혀 없어 모든 포트와 프로토콜이 무방비 상태입니다.',
    impactKo: '무단 접근, 포트 스캔 기반 공격, 내부 네트워크 침투, 서비스 거부 공격(DDoS)에 무방비로 노출됩니다.',
    solutionKo: '인프라 경계에 방화벽을 배치하고, 기본 차단(Default Deny) 정책을 적용한 후 필요한 트래픽만 허용하세요.',
    tags: ['security', 'firewall', 'perimeter', 'critical'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(NIST_800_41, 'Section 4.1 - Firewall Policy Recommendations'),
        SANS_FIREWALL,
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'AP-SEC-003',
    type: 'antipattern',
    name: 'Web Server Without WAF',
    nameKo: 'WAF 없는 웹 서버',
    severity: 'critical',
    detection: (spec: InfraSpec): boolean => {
      // Has web-server facing internet but no WAF
      if (!hasNodeType(spec, 'web-server')) return false;
      const hasInternet = hasNodeType(spec, 'internet') || hasNodeType(spec, 'user');
      if (!hasInternet) return false;
      return !hasNodeType(spec, 'waf');
    },
    detectionDescriptionKo: '인터넷에 노출된 web-server가 있지만 WAF가 없는지 검사합니다.',
    problemKo: 'WAF 없이 웹 서버를 인터넷에 노출하면 OWASP Top 10 공격(SQL 인젝션, XSS, CSRF 등)에 무방비입니다.',
    impactKo: '웹 애플리케이션 침해, 사용자 세션 탈취, 데이터 유출, 웹사이트 변조가 발생할 수 있습니다.',
    solutionKo: '웹 서버 앞에 WAF를 배치하여 OWASP Top 10 공격을 차단하고, 정기적으로 룰셋을 업데이트하세요.',
    tags: ['security', 'waf', 'web-server', 'owasp'],
    trust: {
      confidence: 0.9,
      sources: [
        OWASP_TOP10,
        withSection(OWASP_WSTG, 'Configuration and Deployment Management'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'AP-SEC-004',
    type: 'antipattern',
    name: 'Internal Services Exposed',
    nameKo: '내부 서비스 인터넷 노출',
    severity: 'critical',
    detection: (spec: InfraSpec): boolean => {
      // ldap-ad, san-nas, or backup directly connected to internet
      if (!hasNodeType(spec, 'internet')) return false;
      return INTERNAL_ONLY_TYPES.some(
        (type) => hasNodeType(spec, type) && isDirectlyConnected(spec, type, 'internet'),
      );
    },
    detectionDescriptionKo: 'LDAP/AD, SAN/NAS, 백업 등 내부 전용 서비스가 인터넷에 직접 연결되어 있는지 검사합니다.',
    problemKo: '디렉터리 서비스, 스토리지, 백업 시스템 등 내부 전용 서비스가 인터넷에 노출되면 핵심 인프라 전체가 위험합니다.',
    impactKo: '자격 증명 탈취, 대규모 데이터 유출, 백업 데이터 랜섬웨어 감염, 전체 인프라 장악이 가능합니다.',
    solutionKo: '내부 서비스는 반드시 내부 네트워크에만 배치하고, 방화벽으로 격리하며, VPN을 통해서만 원격 접근을 허용하세요.',
    tags: ['security', 'internal-services', 'exposure', 'critical'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(NIST_800_53, 'SC-7 - Boundary Protection'),
        withSection(NIST_800_53, 'AC-17 - Remote Access'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'AP-SEC-005',
    type: 'antipattern',
    name: 'No Encryption Gateway',
    nameKo: '암호화 게이트웨이 부재',
    severity: 'critical',
    detection: (spec: InfraSpec): boolean => {
      // Has internet-facing services but no VPN or encrypted connections
      if (!hasNodeType(spec, 'internet')) return false;
      const hasInternetFacing = hasNodeOfCategory(spec, ['web-server', 'app-server', 'load-balancer', 'cdn']);
      if (!hasInternetFacing) return false;
      // Check for VPN gateway or any encrypted flow type
      const hasVpn = hasNodeType(spec, 'vpn-gateway');
      const hasEncryptedFlow = spec.connections.some((c) => c.flowType === 'encrypted');
      return !hasVpn && !hasEncryptedFlow;
    },
    detectionDescriptionKo: '인터넷에 노출된 서비스가 있지만 VPN 게이트웨이나 암호화 연결이 없는지 검사합니다.',
    problemKo: '암호화 없이 인터넷 통신을 하면 중간자 공격(MITM), 패킷 스니핑, 세션 하이재킹에 취약합니다.',
    impactKo: '전송 중 데이터 탈취, 자격 증명 유출, 세션 탈취, 규정 준수 위반이 발생할 수 있습니다.',
    solutionKo: 'VPN 게이트웨이를 배치하거나, 모든 인터넷 통신에 TLS/HTTPS 암호화를 적용하세요.',
    tags: ['security', 'encryption', 'vpn', 'tls'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(NIST_800_77, 'Section 3.2 - VPN Security Architecture'),
        withSection(NIST_800_53, 'SC-8 - Transmission Confidentiality and Integrity'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'AP-SEC-006',
    type: 'antipattern',
    name: 'Unprotected Database',
    nameKo: '보호되지 않은 데이터베이스',
    severity: 'critical',
    detection: (spec: InfraSpec): boolean => {
      // db-server exists but is in DMZ tier instead of data or internal tier
      const dbServers = getNodesByType(spec, 'db-server');
      if (dbServers.length === 0) return false;
      return dbServers.some((db) => db.tier === 'dmz' || db.tier === 'external');
    },
    detectionDescriptionKo: 'db-server가 DMZ 또는 외부 티어에 배치되어 있는지 검사합니다.',
    problemKo: '데이터베이스가 DMZ나 외부 티어에 있으면 공격 표면이 넓어져 직접 공격 대상이 됩니다.',
    impactKo: '데이터베이스 직접 침해, 전체 데이터 유출, 서비스 중단, 복구 비용 급증이 발생합니다.',
    solutionKo: '데이터베이스를 data 또는 internal 티어로 이동하고, 방화벽과 애플리케이션 계층을 통해서만 접근을 허용하세요.',
    tags: ['security', 'database', 'tier-placement', 'segmentation'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(NIST_800_41, 'Section 2.1 - Network Segmentation'),
        withSection(NIST_800_123, 'Section 5 - Secure Network Configuration'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'AP-SEC-007',
    type: 'antipattern',
    name: 'No Access Control',
    nameKo: '접근 제어 부재',
    severity: 'critical',
    detection: (spec: InfraSpec): boolean => {
      // Has compute services but no auth components at all
      if (!hasNodeOfCategory(spec, COMPUTE_TYPES)) return false;
      return !hasNodeOfCategory(spec, AUTH_TYPES);
    },
    detectionDescriptionKo: '컴퓨팅 서비스가 존재하지만 인증/접근 제어 구성요소(LDAP, SSO, MFA, IAM)가 전혀 없는지 검사합니다.',
    problemKo: '인증 및 접근 제어 없이 서비스를 운영하면 누구나 시스템에 접근할 수 있어 보안이 전혀 보장되지 않습니다.',
    impactKo: '무단 시스템 접근, 권한 상승 공격, 내부자 위협 탐지 불가, 감사 추적 불가능이 발생합니다.',
    solutionKo: 'LDAP/AD 기반 중앙 인증을 구축하고, SSO와 MFA를 적용하며, IAM으로 최소 권한 원칙을 시행하세요.',
    tags: ['security', 'access-control', 'authentication', 'authorization'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(NIST_800_63B, 'Section 4 - Authenticator Assurance Levels'),
        withSection(NIST_800_53, 'AC-2 - Account Management'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
];

// ---------------------------------------------------------------------------
// High Availability Anti-patterns (AP-HA)
// ---------------------------------------------------------------------------

const availabilityAntiPatterns: AntiPattern[] = [
  {
    id: 'AP-HA-001',
    type: 'antipattern',
    name: 'Single Point of Failure - Load Balancer',
    nameKo: '단일 장애점 - 로드 밸런서',
    severity: 'high',
    detection: (spec: InfraSpec): boolean => {
      // Only 1 load-balancer for multiple web-servers
      const lbCount = countNodesByType(spec, 'load-balancer');
      const webCount = countNodesByType(spec, 'web-server');
      return lbCount === 1 && webCount >= 2;
    },
    detectionDescriptionKo: '웹 서버가 2대 이상인데 로드 밸런서가 1대뿐인지 검사합니다.',
    problemKo: '단일 로드 밸런서 장애 시 모든 웹 서버가 트래픽을 받을 수 없어 전체 서비스가 중단됩니다.',
    impactKo: '서비스 전면 중단, SLA 위반, 매출 손실, 사용자 이탈이 발생합니다.',
    solutionKo: '로드 밸런서를 Active-Standby 또는 Active-Active 이중화로 구성하고, 헬스 체크와 자동 페일오버를 설정하세요.',
    tags: ['availability', 'load-balancer', 'spof', 'redundancy'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(AWS_WAF_REL, 'Design for Failure - Eliminate Single Points of Failure'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'AP-HA-002',
    type: 'antipattern',
    name: 'No Backup System',
    nameKo: '백업 시스템 부재',
    severity: 'high',
    detection: (spec: InfraSpec): boolean => {
      // Has db-server but no backup node
      if (!hasNodeType(spec, 'db-server')) return false;
      return !hasNodeType(spec, 'backup');
    },
    detectionDescriptionKo: '데이터베이스 서버가 있지만 백업 노드가 없는지 검사합니다.',
    problemKo: '백업 없이 데이터베이스를 운영하면 장애, 랜섬웨어, 인적 오류 시 데이터를 복구할 수 없습니다.',
    impactKo: '영구적 데이터 손실, 서비스 복구 불가, 비즈니스 연속성 붕괴, 규정 위반이 발생합니다.',
    solutionKo: '정기적인 자동 백업을 구성하고, 3-2-1 백업 규칙(3개 사본, 2가지 매체, 1개 오프사이트)을 적용하세요.',
    tags: ['availability', 'backup', 'disaster-recovery', 'data-protection'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(NIST_800_53, 'CP-9 - Information System Backup'),
        withSection(AWS_WAF_REL, 'Data Backup and Recovery'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'AP-HA-003',
    type: 'antipattern',
    name: 'No Disaster Recovery',
    nameKo: '재해 복구 미구성',
    severity: 'high',
    detection: (spec: InfraSpec): boolean => {
      // No backup and no cache for resilience (minimal DR indicators)
      if (spec.nodes.length < 3) return false; // too small to matter
      return !hasNodeType(spec, 'backup') && !hasNodeType(spec, 'cache');
    },
    detectionDescriptionKo: '일정 규모 이상의 인프라에 백업과 캐시가 모두 없어 복원력이 없는지 검사합니다.',
    problemKo: '재해 복구 체계 없이 운영하면 장애 발생 시 서비스 복구에 장시간이 소요되거나 불가능합니다.',
    impactKo: '장시간 서비스 중단, 데이터 손실, 비즈니스 연속성 파괴, 고객 신뢰 상실이 발생합니다.',
    solutionKo: '백업 시스템과 캐시 계층을 추가하고, RTO/RPO를 정의한 재해 복구 계획을 수립하세요.',
    tags: ['availability', 'disaster-recovery', 'resilience', 'business-continuity'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(NIST_800_53, 'CP-2 - Contingency Plan'),
        withSection(AWS_WAF_REL, 'Disaster Recovery Strategies'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'AP-HA-004',
    type: 'antipattern',
    name: 'Single Database',
    nameKo: '단일 데이터베이스 (이중화 없음)',
    severity: 'high',
    detection: (spec: InfraSpec): boolean => {
      // Only 1 db-server with no redundancy for 3+ tier architecture
      const dbCount = countNodesByType(spec, 'db-server');
      const hasMultiTier = hasNodeType(spec, 'web-server') && hasNodeType(spec, 'app-server');
      return dbCount === 1 && hasMultiTier;
    },
    detectionDescriptionKo: '멀티 티어 아키텍처에서 db-server가 1대뿐인지 검사합니다.',
    problemKo: '단일 데이터베이스는 장애 시 전체 애플리케이션이 중단되는 치명적 단일 장애점(SPOF)입니다.',
    impactKo: '데이터베이스 장애 시 전체 서비스 중단, 데이터 정합성 위험, 복구 시간 증가가 발생합니다.',
    solutionKo: 'Primary-Replica 복제 구성 또는 클러스터링을 적용하고, 자동 페일오버를 설정하세요.',
    tags: ['availability', 'database', 'redundancy', 'spof'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(AWS_WAF_REL, 'Design for Failure - Database Redundancy'),
        withSection(AZURE_CAF, 'High Availability Best Practices'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'AP-HA-005',
    type: 'antipattern',
    name: 'No Health Check Path',
    nameKo: '헬스 체크 경로 없음',
    severity: 'high',
    detection: (spec: InfraSpec): boolean => {
      // load-balancer exists but only connected to 1 backend node
      if (!hasNodeType(spec, 'load-balancer')) return false;
      const lbNodes = getNodesByType(spec, 'load-balancer');
      const lbIds = lbNodes.map((n) => n.id);

      // Count backend connections (non-internet, non-firewall, non-waf targets)
      const frontendTypes: InfraNodeType[] = ['internet', 'user', 'firewall', 'waf', 'cdn', 'dns', 'router'];
      const backendConnections = spec.connections.filter((c) => {
        const lbIsSource = lbIds.includes(c.source);
        const lbIsTarget = lbIds.includes(c.target);
        if (!lbIsSource && !lbIsTarget) return false;

        const otherId = lbIsSource ? c.target : c.source;
        const otherNode = spec.nodes.find((n) => n.id === otherId);
        if (!otherNode) return false;
        return !frontendTypes.includes(otherNode.type);
      });

      return backendConnections.length <= 1;
    },
    detectionDescriptionKo: '로드 밸런서가 백엔드 노드 1개 이하에만 연결되어 부하 분산 효과가 없는지 검사합니다.',
    problemKo: '로드 밸런서가 단일 백엔드에만 연결되면 부하 분산과 장애 조치 목적을 달성할 수 없습니다.',
    impactKo: '로드 밸런서가 있어도 고가용성이 보장되지 않으며, 단일 백엔드 장애 시 서비스가 중단됩니다.',
    solutionKo: '최소 2대 이상의 백엔드 서버를 로드 밸런서에 연결하고, 헬스 체크를 구성하세요.',
    tags: ['availability', 'load-balancer', 'health-check', 'failover'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(AWS_WAF_REL, 'Health Checks and Self-Healing'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
];

// ---------------------------------------------------------------------------
// Performance Anti-patterns (AP-PERF)
// ---------------------------------------------------------------------------

const performanceAntiPatterns: AntiPattern[] = [
  {
    id: 'AP-PERF-001',
    type: 'antipattern',
    name: 'No Caching Layer',
    nameKo: '캐시 계층 부재',
    severity: 'medium',
    detection: (spec: InfraSpec): boolean => {
      // Has db-server and app-server but no cache
      if (!hasNodeType(spec, 'db-server')) return false;
      if (!hasNodeType(spec, 'app-server')) return false;
      return !hasNodeType(spec, 'cache');
    },
    detectionDescriptionKo: '데이터베이스와 애플리케이션 서버가 있지만 캐시 노드가 없는지 검사합니다.',
    problemKo: '캐시 없이 모든 요청이 데이터베이스에 직접 전달되면 DB 부하가 급증하고 응답 속도가 저하됩니다.',
    impactKo: '응답 지연 증가, 데이터베이스 과부하, 트래픽 급증 시 서비스 장애, 사용자 경험 악화가 발생합니다.',
    solutionKo: 'Redis 또는 Memcached 기반 캐시 계층을 app-server와 db-server 사이에 배치하세요.',
    tags: ['performance', 'cache', 'database', 'latency'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(AWS_WAF_PERF, 'Caching Strategy'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'AP-PERF-002',
    type: 'antipattern',
    name: 'No CDN',
    nameKo: 'CDN 부재',
    severity: 'medium',
    detection: (spec: InfraSpec): boolean => {
      // Has web-server and internet but no CDN
      if (!hasNodeType(spec, 'web-server')) return false;
      if (!hasNodeType(spec, 'internet') && !hasNodeType(spec, 'user')) return false;
      return !hasNodeType(spec, 'cdn');
    },
    detectionDescriptionKo: '인터넷에 노출된 웹 서버가 있지만 CDN이 없는지 검사합니다.',
    problemKo: 'CDN 없이 웹 서버를 직접 노출하면 모든 정적 콘텐츠 요청이 오리진 서버에 집중되고, 글로벌 사용자 경험이 저하됩니다.',
    impactKo: '느린 페이지 로딩, 서버 대역폭 과다 사용, DDoS 공격 취약성, 글로벌 접근성 저하가 발생합니다.',
    solutionKo: 'CDN을 배치하여 정적 콘텐츠를 엣지에서 제공하고, DDoS 방어와 대역폭 절감 효과를 얻으세요.',
    tags: ['performance', 'cdn', 'web-server', 'latency', 'ddos'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(AWS_WAF_PERF, 'Content Delivery Network'),
        withSection(NIST_800_44, 'Section 9 - Web Server Performance'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'AP-PERF-003',
    type: 'antipattern',
    name: 'No Load Balancing',
    nameKo: '로드 밸런싱 부재',
    severity: 'high',
    detection: (spec: InfraSpec): boolean => {
      // Has 2+ web-servers but no load-balancer
      const webCount = countNodesByType(spec, 'web-server');
      if (webCount < 2) return false;
      return !hasNodeType(spec, 'load-balancer');
    },
    detectionDescriptionKo: '웹 서버가 2대 이상이지만 로드 밸런서가 없는지 검사합니다.',
    problemKo: '복수의 웹 서버가 있는데 로드 밸런서가 없으면 트래픽 분산이 불가능하고 서버 자원을 효율적으로 사용할 수 없습니다.',
    impactKo: '특정 서버에 트래픽 집중, 서버 자원 낭비, 장애 시 자동 전환 불가, 확장성 제약이 발생합니다.',
    solutionKo: '로드 밸런서를 웹 서버 앞에 배치하여 트래픽을 균등 분산하고, 헬스 체크 기반 자동 페일오버를 구성하세요.',
    tags: ['performance', 'load-balancer', 'web-server', 'scalability'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(AWS_WAF_REL, 'Distribute Traffic with Load Balancing'),
        withSection(AWS_WAF_PERF, 'Load Balancing'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'AP-PERF-004',
    type: 'antipattern',
    name: 'Direct DB Connection from Web',
    nameKo: '웹 서버의 DB 직접 연결',
    severity: 'high',
    detection: (spec: InfraSpec): boolean => {
      // web-server directly connected to db-server without app tier
      if (!hasNodeType(spec, 'web-server') || !hasNodeType(spec, 'db-server')) return false;
      if (hasNodeType(spec, 'app-server')) return false;
      return isDirectlyConnected(spec, 'web-server', 'db-server');
    },
    detectionDescriptionKo: 'web-server가 app-server 없이 db-server에 직접 연결되어 있는지 검사합니다.',
    problemKo: '웹 서버가 데이터베이스에 직접 접근하면 비즈니스 로직 분리가 불가능하고 보안 및 성능 문제가 발생합니다.',
    impactKo: '비즈니스 로직 중복, 커넥션 풀 관리 어려움, SQL 인젝션 확대, 수평 확장 제약이 발생합니다.',
    solutionKo: '애플리케이션 서버(app-server)를 중간 계층으로 추가하여 비즈니스 로직을 분리하고, 커넥션 풀링을 관리하세요.',
    tags: ['performance', 'architecture', 'web-server', 'database', 'separation'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(NIST_800_123, 'Section 5 - Application Architecture'),
        OWASP_TOP10,
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'AP-PERF-005',
    type: 'antipattern',
    name: 'No DNS',
    nameKo: 'DNS 부재',
    severity: 'medium',
    detection: (spec: InfraSpec): boolean => {
      // Has CDN or web-server but no DNS node
      if (!hasNodeType(spec, 'cdn') && !hasNodeType(spec, 'web-server')) return false;
      if (!hasNodeType(spec, 'internet') && !hasNodeType(spec, 'user')) return false;
      return !hasNodeType(spec, 'dns');
    },
    detectionDescriptionKo: 'CDN 또는 웹 서버가 인터넷에 노출되어 있지만 DNS 노드가 없는지 검사합니다.',
    problemKo: 'DNS 없이는 도메인 기반 접근이 불가능하고, CDN의 지리적 라우팅이 동작하지 않습니다.',
    impactKo: 'IP 직접 접근만 가능, CDN 지리적 분산 불가, 도메인 기반 보안 정책 적용 불가가 발생합니다.',
    solutionKo: 'DNS 서비스를 추가하고, DNSSEC를 적용하며, CDN 사용 시 CNAME 또는 ALIAS 레코드를 구성하세요.',
    tags: ['performance', 'dns', 'cdn', 'web-server', 'name-resolution'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(NIST_800_81, 'Section 2 - DNS Security Threats'),
        withSection(AWS_WAF_PERF, 'DNS and Traffic Routing'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
];

// ---------------------------------------------------------------------------
// Architecture Design Anti-patterns (AP-ARCH)
// ---------------------------------------------------------------------------

const architectureAntiPatterns: AntiPattern[] = [
  {
    id: 'AP-ARCH-001',
    type: 'antipattern',
    name: 'Flat Network',
    nameKo: '플랫 네트워크 (티어 미분리)',
    severity: 'high',
    detection: (spec: InfraSpec): boolean => {
      // All nodes in same tier, no segmentation
      if (spec.nodes.length < 3) return false;
      const nodesWithTier = spec.nodes.filter((n) => n.tier != null);
      if (nodesWithTier.length === 0) return false;
      const uniqueTiers = new Set(nodesWithTier.map((n) => n.tier));
      return uniqueTiers.size <= 1;
    },
    detectionDescriptionKo: '3개 이상의 노드가 있는데 모든 노드가 동일한 티어에 있어 네트워크 세그먼테이션이 없는지 검사합니다.',
    problemKo: '플랫 네트워크에서는 모든 시스템이 같은 보안 영역에 있어, 하나의 시스템 침해가 전체로 확산됩니다.',
    impactKo: '횡적 이동(Lateral Movement) 공격 용이, 내부 위협 탐지 어려움, 규정 준수 위반이 발생합니다.',
    solutionKo: '네트워크를 외부/DMZ/내부/데이터 티어로 분리하고, 티어 간 방화벽으로 접근을 제어하세요.',
    tags: ['architecture', 'segmentation', 'flat-network', 'lateral-movement'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(NIST_800_41, 'Section 2.1 - Network Segmentation'),
        withSection(CIS_V8_12, '12.2 - Establish and Maintain a Secure Network Architecture'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'AP-ARCH-002',
    type: 'antipattern',
    name: 'Missing Application Tier',
    nameKo: '애플리케이션 티어 누락',
    severity: 'medium',
    detection: (spec: InfraSpec): boolean => {
      // Has web-server and db-server but no app-server
      return hasNodeType(spec, 'web-server') && hasNodeType(spec, 'db-server') && !hasNodeType(spec, 'app-server');
    },
    detectionDescriptionKo: 'web-server와 db-server가 있지만 app-server가 없는지 검사합니다.',
    problemKo: '애플리케이션 티어 없이 웹 서버가 데이터베이스에 직접 접근하면 보안, 확장성, 유지보수에 문제가 생깁니다.',
    impactKo: '비즈니스 로직 분리 불가, API 계층 부재, 마이크로서비스 전환 어려움, 보안 경계 부족이 발생합니다.',
    solutionKo: '웹 서버와 데이터베이스 사이에 애플리케이션 서버를 배치하여 3-티어 아키텍처를 완성하세요.',
    tags: ['architecture', 'multi-tier', 'app-server', 'separation-of-concerns'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(NIST_800_123, 'Section 5 - Application Architecture'),
        withSection(NIST_800_44, 'Section 3 - Web Server Architecture'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'AP-ARCH-003',
    type: 'antipattern',
    name: 'Oversized Architecture',
    nameKo: '과대 아키텍처 (오케스트레이션 부재)',
    severity: 'medium',
    detection: (spec: InfraSpec): boolean => {
      // More than 15 nodes but no kubernetes/container orchestration
      if (spec.nodes.length <= 15) return false;
      return !hasNodeType(spec, 'kubernetes') && !hasNodeType(spec, 'container');
    },
    detectionDescriptionKo: '15개 이상의 노드가 있지만 Kubernetes나 컨테이너 오케스트레이션이 없는지 검사합니다.',
    problemKo: '대규모 인프라를 수동으로 관리하면 운영 복잡도가 급증하고, 배포/스케일링/모니터링이 어려워집니다.',
    impactKo: '운영 비용 급증, 배포 시간 증가, 장애 복구 지연, 일관성 없는 환경 구성이 발생합니다.',
    solutionKo: 'Kubernetes 또는 컨테이너 오케스트레이션을 도입하여 자동화된 배포, 스케일링, 관리를 구현하세요.',
    tags: ['architecture', 'orchestration', 'kubernetes', 'scalability'],
    trust: {
      confidence: 0.7,
      sources: [
        withSection(CNCF_SECURITY, 'Container Orchestration Benefits'),
        withSection(NIST_800_144, 'Section 3 - Cloud Computing Benefits'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'AP-ARCH-004',
    type: 'antipattern',
    name: 'No Network Segmentation',
    nameKo: '네트워크 세그먼테이션 부재',
    severity: 'high',
    detection: (spec: InfraSpec): boolean => {
      // Has compute and storage but all in same tier
      const hasCompute = hasNodeOfCategory(spec, COMPUTE_TYPES);
      const hasStorage = hasNodeOfCategory(spec, ['san-nas', 'object-storage', 'backup', 'cache', 'storage']);
      if (!hasCompute || !hasStorage) return false;

      // Check if compute and storage nodes share the same tier
      const computeNodes = spec.nodes.filter((n) => COMPUTE_TYPES.includes(n.type) && n.tier != null);
      const storageTypes: InfraNodeType[] = ['san-nas', 'object-storage', 'backup', 'cache', 'storage'];
      const storageNodes = spec.nodes.filter((n) => storageTypes.includes(n.type) && n.tier != null);

      if (computeNodes.length === 0 || storageNodes.length === 0) return false;

      const computeTiers = new Set(computeNodes.map((n) => n.tier));
      const storageTiers = new Set(storageNodes.map((n) => n.tier));

      // If all storage is in same tier as compute, there's no segmentation
      return [...storageTiers].every((t) => computeTiers.has(t));
    },
    detectionDescriptionKo: '컴퓨팅 노드와 스토리지 노드가 동일한 티어에 배치되어 세그먼테이션이 없는지 검사합니다.',
    problemKo: '컴퓨팅과 스토리지가 동일 세그먼트에 있으면 컴퓨팅 침해 시 스토리지까지 바로 접근 가능합니다.',
    impactKo: '데이터 유출 위험 증가, 컴퓨팅 침해의 스토리지 확산, 접근 제어 우회 가능성이 높아집니다.',
    solutionKo: '스토리지를 별도의 data 티어에 배치하고, 컴퓨팅 티어와 방화벽으로 분리하세요.',
    tags: ['architecture', 'segmentation', 'storage', 'compute', 'isolation'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(NIST_800_53, 'SC-7 - Boundary Protection'),
        withSection(CIS_V8_12, '12.2 - Secure Network Architecture'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'AP-ARCH-005',
    type: 'antipattern',
    name: 'Monolithic Everything',
    nameKo: '모놀리식 아키텍처 (확장성 없음)',
    severity: 'medium',
    detection: (spec: InfraSpec): boolean => {
      // Single web-server, single app-server, single db-server - no scaling
      const webCount = countNodesByType(spec, 'web-server');
      const appCount = countNodesByType(spec, 'app-server');
      const dbCount = countNodesByType(spec, 'db-server');

      // Must have all three tiers as exactly 1 each
      if (webCount !== 1 || appCount !== 1 || dbCount !== 1) return false;

      // No load balancer, no container, no kubernetes for scaling
      return !hasNodeType(spec, 'load-balancer') &&
             !hasNodeType(spec, 'container') &&
             !hasNodeType(spec, 'kubernetes');
    },
    detectionDescriptionKo: '웹/앱/DB 서버가 각 1대씩만 있고 로드 밸런서, 컨테이너, Kubernetes 등 확장 요소가 없는지 검사합니다.',
    problemKo: '모든 계층이 단일 인스턴스로 구성되면 어느 계층이든 장애 시 전체 서비스가 중단되며, 수평 확장이 불가능합니다.',
    impactKo: '서비스 확장 불가, 단일 장애점 다수 존재, 트래픽 급증 대응 불가, 유지보수 시 다운타임 불가피가 발생합니다.',
    solutionKo: '로드 밸런서를 추가하고, 최소 2대 이상의 웹/앱 서버를 구성하며, 컨테이너화를 고려하세요.',
    tags: ['architecture', 'monolithic', 'scalability', 'spof', 'horizontal-scaling'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(AWS_WAF_REL, 'Design for Failure - Horizontal Scaling'),
        withSection(AZURE_CAF, 'Scalability Best Practices'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
];

// ---------------------------------------------------------------------------
// Cloud Anti-patterns (AP-CLD)
// ---------------------------------------------------------------------------

const CLOUD_TYPES: InfraNodeType[] = ['aws-vpc', 'azure-vnet', 'gcp-network', 'private-cloud'];

const cloudAntiPatterns: AntiPattern[] = [
  {
    id: 'AP-CLD-001',
    type: 'antipattern',
    name: 'Single AZ Deployment',
    nameKo: '단일 AZ 배치',
    severity: 'critical',
    detection: (spec: InfraSpec): boolean => {
      // Cloud VPC exists but no load-balancer for multi-AZ distribution
      if (!hasNodeOfCategory(spec, CLOUD_TYPES)) return false;
      return !hasNodeType(spec, 'load-balancer');
    },
    detectionDescriptionKo: '클라우드 VPC가 존재하지만 다중 AZ 분산을 위한 로드 밸런서가 없는지 검사합니다.',
    problemKo: '단일 가용 영역(AZ)에만 리소스를 배치하면 해당 AZ 장애 시 전체 서비스가 중단됩니다.',
    impactKo: 'AZ 장애 시 전면 서비스 중단, SLA 위반, 데이터 정합성 위험이 발생합니다.',
    solutionKo: '로드 밸런서를 배치하고 최소 2개 이상의 AZ에 리소스를 분산 배치하세요.',
    tags: ['cloud', 'availability-zone', 'single-az', 'critical'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(AWS_WAF_REL, 'Design for Failure - Multi-AZ Deployments'),
        withSection(NIST_800_145, 'Section 2 - Cloud Computing Characteristics'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'AP-CLD-002',
    type: 'antipattern',
    name: 'Public Subnet DB',
    nameKo: 'Public Subnet에 DB 배치',
    severity: 'critical',
    detection: (spec: InfraSpec): boolean => {
      // db-server in cloud environment without firewall protection
      if (!hasNodeType(spec, 'db-server')) return false;
      if (!hasNodeOfCategory(spec, CLOUD_TYPES)) return false;
      return !hasNodeType(spec, 'firewall');
    },
    detectionDescriptionKo: '클라우드 환경에서 db-server가 방화벽 없이 존재하는지 검사합니다.',
    problemKo: '클라우드의 Public Subnet에 데이터베이스를 배치하면 인터넷에서 직접 접근이 가능해 데이터 탈취 위험이 극대화됩니다.',
    impactKo: '전체 데이터베이스 침해, 고객 데이터 유출, 컴플라이언스 위반, 막대한 벌금이 발생할 수 있습니다.',
    solutionKo: '데이터베이스를 Private Subnet으로 이동하고, 보안 그룹과 NACL로 접근을 제한하며, 방화벽을 배치하세요.',
    tags: ['cloud', 'database', 'public-subnet', 'security', 'critical'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(AWS_WAF_SEC, 'Infrastructure Protection - VPC Security'),
        withSection(NIST_800_144, 'Section 4 - Security and Privacy Issues'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'AP-CLD-003',
    type: 'antipattern',
    name: 'Security Group Wide Open',
    nameKo: '보안 그룹 전체 오픈',
    severity: 'high',
    detection: (spec: InfraSpec): boolean => {
      // Cloud + internet but no firewall or WAF
      if (!hasNodeOfCategory(spec, CLOUD_TYPES)) return false;
      if (!hasNodeType(spec, 'internet')) return false;
      return !hasNodeType(spec, 'firewall') && !hasNodeType(spec, 'waf');
    },
    detectionDescriptionKo: '클라우드 환경에 인터넷이 연결되어 있지만 방화벽이나 WAF가 없는지 검사합니다.',
    problemKo: '보안 그룹(Security Group)이 0.0.0.0/0으로 전체 오픈되면 모든 인터넷 트래픽이 인스턴스에 직접 도달합니다.',
    impactKo: '무차별 포트 스캔, 브루트포스 공격, 취약점 익스플로잇에 무방비로 노출됩니다.',
    solutionKo: '최소 권한 원칙에 따라 필요한 포트와 소스 IP만 허용하고, WAF 또는 방화벽을 앞단에 배치하세요.',
    tags: ['cloud', 'security-group', 'wide-open', 'firewall'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(AWS_WAF_SEC, 'Infrastructure Protection - Security Groups'),
        withSection(GCP_ARCH_FRAMEWORK, 'Security - Network Security'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'AP-CLD-004',
    type: 'antipattern',
    name: 'Cloud Without IAM',
    nameKo: 'IAM 없는 클라우드',
    severity: 'high',
    detection: (spec: InfraSpec): boolean => {
      // Cloud VPC exists but no IAM
      if (!hasNodeOfCategory(spec, CLOUD_TYPES)) return false;
      return !hasNodeType(spec, 'iam');
    },
    detectionDescriptionKo: '클라우드 VPC가 존재하지만 IAM이 없는지 검사합니다.',
    problemKo: 'IAM 없이 클라우드를 운영하면 리소스 접근 제어가 불가능하고, 최소 권한 원칙을 적용할 수 없습니다.',
    impactKo: '과도한 권한 부여, 자격 증명 남용, 리소스 무단 생성/삭제, 비용 급증이 발생합니다.',
    solutionKo: 'IAM을 구성하여 역할 기반 접근 제어(RBAC)를 적용하고, 최소 권한 정책을 시행하세요.',
    tags: ['cloud', 'iam', 'access-control', 'least-privilege'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(AWS_WAF_SEC, 'Identity and Access Management'),
        withSection(NIST_800_53, 'AC-2 - Account Management'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'AP-CLD-005',
    type: 'antipattern',
    name: 'No Auto Scaling',
    nameKo: 'Auto Scaling 미설정',
    severity: 'medium',
    detection: (spec: InfraSpec): boolean => {
      // Cloud + compute but no load-balancer (auto-scaling indicator)
      if (!hasNodeOfCategory(spec, CLOUD_TYPES)) return false;
      if (!hasNodeOfCategory(spec, COMPUTE_TYPES)) return false;
      return !hasNodeType(spec, 'load-balancer');
    },
    detectionDescriptionKo: '클라우드에 컴퓨팅 노드가 있지만 로드 밸런서(Auto Scaling 지표)가 없는지 검사합니다.',
    problemKo: 'Auto Scaling 없이 클라우드를 운영하면 트래픽 급증 시 수동 확장이 필요하고, 비용 최적화가 불가능합니다.',
    impactKo: '트래픽 급증 시 서비스 장애, 유휴 시간 과다 비용, 수동 관리 부담이 발생합니다.',
    solutionKo: '로드 밸런서와 Auto Scaling 그룹을 구성하여 트래픽에 따른 자동 확장/축소를 적용하세요.',
    tags: ['cloud', 'auto-scaling', 'compute', 'cost-optimization'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(AWS_WAF_PERF, 'Auto Scaling'),
        withSection(AWS_WAF_OPS, 'Operational Health - Auto Scaling'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'AP-CLD-006',
    type: 'antipattern',
    name: 'Cloud No Monitoring',
    nameKo: '모니터링 없는 클라우드',
    severity: 'high',
    detection: (spec: InfraSpec): boolean => {
      // Cloud + compute but no IDS/IPS (monitoring indicator)
      if (!hasNodeOfCategory(spec, CLOUD_TYPES)) return false;
      if (!hasNodeOfCategory(spec, COMPUTE_TYPES)) return false;
      return !hasNodeType(spec, 'ids-ips');
    },
    detectionDescriptionKo: '클라우드에 컴퓨팅 노드가 있지만 IDS/IPS(모니터링 지표)가 없는지 검사합니다.',
    problemKo: '모니터링 없이 클라우드를 운영하면 보안 위협, 성능 저하, 리소스 이상을 실시간으로 감지할 수 없습니다.',
    impactKo: '보안 침해 탐지 지연, 장애 대응 지연, 비정상 비용 발생 감지 불가가 발생합니다.',
    solutionKo: 'IDS/IPS를 배치하고 클라우드 네이티브 모니터링(CloudWatch, Stackdriver 등)을 구성하세요.',
    tags: ['cloud', 'monitoring', 'ids-ips', 'observability'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(AWS_WAF_OPS, 'Monitoring and Observability'),
        withSection(GCP_ARCH_FRAMEWORK, 'Operational Excellence - Monitoring'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
];

// ---------------------------------------------------------------------------
// Kubernetes/Container Anti-patterns (AP-K8S)
// ---------------------------------------------------------------------------

const k8sAntiPatterns: AntiPattern[] = [
  {
    id: 'AP-K8S-001',
    type: 'antipattern',
    name: 'No Resource Limits',
    nameKo: '리소스 Limit 미설정',
    severity: 'high',
    detection: (spec: InfraSpec): boolean => {
      // kubernetes exists but only 1 container (no resource isolation indicator)
      if (!hasNodeType(spec, 'kubernetes')) return false;
      return countNodesByType(spec, 'container') <= 1;
    },
    detectionDescriptionKo: 'Kubernetes가 있지만 컨테이너가 1개 이하로 리소스 격리가 불충분한지 검사합니다.',
    problemKo: '컨테이너에 CPU/메모리 Limit을 설정하지 않으면 단일 파드가 노드 전체 리소스를 소비하여 다른 워크로드에 영향을 줍니다.',
    impactKo: '노이지 네이버(Noisy Neighbor) 문제, 노드 OOM 킬, 예측 불가능한 성능, 카스케이드 장애가 발생합니다.',
    solutionKo: '모든 컨테이너에 CPU/메모리 requests와 limits를 설정하고, LimitRange와 ResourceQuota를 네임스페이스에 적용하세요.',
    tags: ['kubernetes', 'container', 'resource-limits', 'noisy-neighbor'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(CIS_KUBERNETES, '5.2 - Pod Security Standards'),
        withSection(K8S_DOCS, 'Managing Resources for Containers'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'AP-K8S-002',
    type: 'antipattern',
    name: 'Single Replica',
    nameKo: '단일 레플리카',
    severity: 'high',
    detection: (spec: InfraSpec): boolean => {
      // kubernetes exists but only 1 container
      if (!hasNodeType(spec, 'kubernetes')) return false;
      return countNodesByType(spec, 'container') === 1;
    },
    detectionDescriptionKo: 'Kubernetes 환경에서 컨테이너가 1개뿐인지 검사합니다.',
    problemKo: '단일 레플리카로 운영하면 파드 재시작, 노드 장애, 배포 중 서비스 중단이 발생합니다.',
    impactKo: '배포 시 다운타임, 파드 장애 시 서비스 중단, 롤링 업데이트 불가, SLA 미달이 발생합니다.',
    solutionKo: '최소 2~3개의 레플리카를 유지하고, PodDisruptionBudget을 설정하여 가용성을 보장하세요.',
    tags: ['kubernetes', 'container', 'single-replica', 'availability'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(K8S_DOCS, 'ReplicaSet - Running Multiple Replicas'),
        withSection(CNCF_SECURITY, 'Workload Security'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'AP-K8S-003',
    type: 'antipattern',
    name: 'No Network Policy',
    nameKo: '네트워크 정책 부재',
    severity: 'high',
    detection: (spec: InfraSpec): boolean => {
      // kubernetes exists but no firewall (network policy indicator)
      if (!hasNodeType(spec, 'kubernetes')) return false;
      return !hasNodeType(spec, 'firewall');
    },
    detectionDescriptionKo: 'Kubernetes가 있지만 방화벽(네트워크 정책 지표)이 없는지 검사합니다.',
    problemKo: 'NetworkPolicy 없이 K8s를 운영하면 모든 파드 간 무제한 통신이 가능해 횡적 이동 공격에 취약합니다.',
    impactKo: '파드 간 무차별 접근, 침해된 파드로부터의 횡적 이동, 데이터 유출, 규정 위반이 발생합니다.',
    solutionKo: 'Kubernetes NetworkPolicy를 적용하여 파드 간 통신을 최소 권한으로 제한하고, 방화벽으로 클러스터 경계를 보호하세요.',
    tags: ['kubernetes', 'network-policy', 'firewall', 'lateral-movement'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(CIS_KUBERNETES, '5.2 - Pod Security Standards'),
        withSection(CNCF_SECURITY, 'Runtime Security - Network Policies'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'AP-K8S-004',
    type: 'antipattern',
    name: 'No Registry Security',
    nameKo: '레지스트리 보안 부재',
    severity: 'medium',
    detection: (spec: InfraSpec): boolean => {
      // kubernetes + container but no iam (registry auth indicator)
      if (!hasNodeType(spec, 'kubernetes')) return false;
      if (!hasNodeType(spec, 'container')) return false;
      return !hasNodeType(spec, 'iam');
    },
    detectionDescriptionKo: 'Kubernetes와 컨테이너가 있지만 IAM(레지스트리 인증 지표)이 없는지 검사합니다.',
    problemKo: '컨테이너 레지스트리에 대한 보안 없이 운영하면 악성 이미지 배포, 이미지 변조, 공급망 공격에 취약합니다.',
    impactKo: '악성 컨테이너 이미지 배포, 공급망 공격, 취약한 베이스 이미지 사용, 비인가 이미지 실행이 발생합니다.',
    solutionKo: 'IAM으로 레지스트리 접근을 제어하고, 이미지 서명 검증과 취약점 스캔을 CI/CD 파이프라인에 통합하세요.',
    tags: ['kubernetes', 'container', 'registry', 'supply-chain', 'iam'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(CNCF_SECURITY, 'Supply Chain Security'),
        withSection(CIS_KUBERNETES, '5.2 - Pod Security Standards'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
];

// ---------------------------------------------------------------------------
// Authentication/Zero Trust Anti-patterns (AP-AUTH)
// ---------------------------------------------------------------------------

const authAntiPatterns: AntiPattern[] = [
  {
    id: 'AP-AUTH-001',
    type: 'antipattern',
    name: 'No MFA',
    nameKo: 'MFA 없는 인증',
    severity: 'critical',
    detection: (spec: InfraSpec): boolean => {
      // Has auth (sso or ldap-ad) but no MFA
      if (!hasNodeType(spec, 'sso') && !hasNodeType(spec, 'ldap-ad')) return false;
      return !hasNodeType(spec, 'mfa');
    },
    detectionDescriptionKo: 'SSO 또는 LDAP/AD가 있지만 MFA가 없는지 검사합니다.',
    problemKo: 'MFA 없이 인증을 운영하면 비밀번호만으로 인증이 완료되어 크리덴셜 스터핑, 피싱 공격에 무방비입니다.',
    impactKo: '계정 탈취, 권한 상승, 내부 시스템 무단 접근, 데이터 유출이 발생합니다.',
    solutionKo: '모든 인증 시스템에 MFA를 필수 적용하고, FIDO2/WebAuthn 등 피싱 방지 인증을 도입하세요.',
    tags: ['auth', 'mfa', 'credential-protection', 'critical'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(NIST_800_63B, 'Section 4.2 - AAL2 Requirements'),
        withSection(NIST_800_207, 'Section 3 - Zero Trust Architecture Components'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'AP-AUTH-002',
    type: 'antipattern',
    name: 'No Internal Access Control',
    nameKo: '접근 제어 없는 내부망',
    severity: 'high',
    detection: (spec: InfraSpec): boolean => {
      // Has compute but relies only on perimeter (firewall) without internal auth
      if (!hasNodeOfCategory(spec, COMPUTE_TYPES)) return false;
      if (!hasNodeType(spec, 'firewall')) return false;
      return !hasNodeOfCategory(spec, AUTH_TYPES);
    },
    detectionDescriptionKo: '컴퓨팅 노드와 방화벽이 있지만 인증 구성요소가 없는지 검사합니다.',
    problemKo: '경계 보안(방화벽)만 의존하고 내부 접근 제어가 없으면 경계 돌파 시 내부 자원에 무제한 접근 가능합니다.',
    impactKo: '횡적 이동 공격 용이, 내부자 위협 방어 불가, 제로 트러스트 원칙 위반이 발생합니다.',
    solutionKo: '제로 트러스트 원칙에 따라 내부 서비스에도 인증/인가를 적용하고, 마이크로 세그먼테이션을 구현하세요.',
    tags: ['auth', 'zero-trust', 'internal-security', 'lateral-movement'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(NIST_800_207, 'Section 2 - Zero Trust Basics'),
        withSection(NIST_800_53, 'AC-3 - Access Enforcement'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'AP-AUTH-003',
    type: 'antipattern',
    name: 'No VPN Remote Access',
    nameKo: 'VPN 없는 원격 접근',
    severity: 'high',
    detection: (spec: InfraSpec): boolean => {
      // Has internet-facing services and auth but no VPN
      if (!hasNodeType(spec, 'internet')) return false;
      if (!hasNodeOfCategory(spec, COMPUTE_TYPES)) return false;
      return !hasNodeType(spec, 'vpn-gateway');
    },
    detectionDescriptionKo: '인터넷과 컴퓨팅 노드가 있지만 VPN 게이트웨이가 없는지 검사합니다.',
    problemKo: 'VPN 없이 인터넷에서 내부 시스템에 접근하면 통신이 암호화되지 않고 접근 제어가 불가능합니다.',
    impactKo: '중간자 공격, 세션 하이재킹, 비인가 원격 접근, 데이터 유출이 발생합니다.',
    solutionKo: 'VPN 게이트웨이를 배치하고, MFA와 결합하여 원격 접근을 보호하세요. ZTNA 도입도 고려하세요.',
    tags: ['auth', 'vpn', 'remote-access', 'encryption'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(NIST_800_77, 'Section 3.2 - VPN Security Architecture'),
        withSection(NIST_800_207, 'Section 3 - Zero Trust Access'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'AP-AUTH-004',
    type: 'antipattern',
    name: 'No Central Authentication',
    nameKo: '중앙 인증 부재',
    severity: 'medium',
    detection: (spec: InfraSpec): boolean => {
      // Multiple compute nodes but no SSO or LDAP/AD
      if (spec.nodes.filter((n) => COMPUTE_TYPES.includes(n.type)).length < 2) return false;
      return !hasNodeType(spec, 'sso') && !hasNodeType(spec, 'ldap-ad');
    },
    detectionDescriptionKo: '컴퓨팅 노드가 2개 이상이지만 SSO나 LDAP/AD가 없는지 검사합니다.',
    problemKo: '중앙 인증 시스템 없이 각 서비스마다 개별 인증을 구현하면 일관된 보안 정책 적용이 불가능합니다.',
    impactKo: '비밀번호 관리 복잡, 퇴사자 계정 정리 누락, 감사 추적 불가, 보안 정책 불일치가 발생합니다.',
    solutionKo: 'LDAP/AD 기반 중앙 디렉터리를 구축하고, SSO를 도입하여 단일 인증으로 모든 서비스에 접근하도록 통합하세요.',
    tags: ['auth', 'sso', 'ldap', 'centralized', 'identity-management'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(NIST_800_63B, 'Section 4 - Authenticator Assurance Levels'),
        withSection(NIST_800_53, 'IA-2 - Identification and Authentication'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
];

// ---------------------------------------------------------------------------
// Combined registry
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Telecom Anti-patterns (AP-TEL)
// ---------------------------------------------------------------------------

const telecomAntiPatterns: AntiPattern[] = [
  {
    id: 'AP-TEL-001',
    type: 'antipattern',
    name: 'IDC Single Path',
    nameKo: 'IDC 단일 경로',
    severity: 'critical',
    detection: (spec: InfraSpec): boolean => {
      // IDC exists but central-office count <= 1
      if (!hasNodeType(spec, 'idc')) return false;
      return countNodesByType(spec, 'central-office') <= 1;
    },
    detectionDescriptionKo: 'IDC가 존재하지만 국사(central-office)가 1개 이하인지 검사합니다.',
    problemKo: 'IDC가 단일 국사를 통해서만 연결되면 해당 국사 장애 시 IDC 전체의 외부 연결이 단절됩니다.',
    impactKo: 'IDC 호스팅 서비스 전면 중단, SLA 위반, 고객 서비스 불가, 매출 손실이 발생합니다.',
    solutionKo: '최소 2개 이상의 서로 다른 국사로 이중 접속(Dual Homing)을 구성하고, 링 네트워크를 통해 물리 경로를 이중화하세요.',
    tags: ['telecom', 'idc', 'single-path', 'availability', 'critical'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(NIST_800_41, 'Section 4.2 - Dual-Firewall DMZ'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'AP-TEL-002',
    type: 'antipattern',
    name: 'Non-redundant Dedicated Line',
    nameKo: '전용회선 비이중화',
    severity: 'high',
    detection: (spec: InfraSpec): boolean => {
      // dedicated-line count === 1 AND central-office count === 1
      return countNodesByType(spec, 'dedicated-line') === 1 && countNodesByType(spec, 'central-office') === 1;
    },
    detectionDescriptionKo: '전용회선이 1회선이고 국사가 1개뿐인지 검사합니다.',
    problemKo: '단일 전용회선은 회선 절단 또는 국사 장애 시 기업의 외부 네트워크 연결이 완전히 단절됩니다.',
    impactKo: '전체 WAN 통신 두절, 업무 마비, 원격 서비스 불가, 복구 시 수 시간 소요가 발생합니다.',
    solutionKo: '서로 다른 국사로 연결되는 이중 전용회선을 구성하고, 동적 라우팅(BGP/OSPF)으로 자동 페일오버를 설정하세요.',
    tags: ['telecom', 'dedicated-line', 'non-redundant', 'availability'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(AWS_WAF_REL, 'Design for Failure - Eliminate Single Points of Failure'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'AP-TEL-003',
    type: 'antipattern',
    name: 'WAN Border No Firewall',
    nameKo: 'WAN 경계 방화벽 미설치',
    severity: 'critical',
    detection: (spec: InfraSpec): boolean => {
      // pe-router exists but no firewall
      if (!hasNodeType(spec, 'pe-router')) return false;
      return !hasNodeType(spec, 'firewall');
    },
    detectionDescriptionKo: 'PE 라우터가 존재하지만 방화벽이 없는지 검사합니다.',
    problemKo: 'WAN 경계(PE 라우터)에 방화벽이 없으면 캐리어 네트워크로부터의 비인가 접근이 내부 네트워크에 직접 도달합니다.',
    impactKo: '외부로부터의 무단 접근, 네트워크 공격 직접 노출, 내부 시스템 침해 위험이 발생합니다.',
    solutionKo: 'PE 라우터와 내부 네트워크 사이에 방화벽을 배치하고, 기본 차단(Default Deny) 정책을 적용하세요.',
    tags: ['telecom', 'wan', 'firewall', 'security', 'pe-router', 'critical'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(NIST_800_41, 'Section 4.1 - Firewall Policy Recommendations'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'AP-TEL-004',
    type: 'antipattern',
    name: 'Corporate Internet Only',
    nameKo: '기업인터넷 단독 사용',
    severity: 'medium',
    detection: (spec: InfraSpec): boolean => {
      // corporate-internet exists but no dedicated-line (SLA risk)
      if (!hasNodeType(spec, 'corporate-internet')) return false;
      return !hasNodeType(spec, 'dedicated-line');
    },
    detectionDescriptionKo: '기업인터넷만 존재하고 전용회선이 없는지 검사합니다.',
    problemKo: '기업인터넷만으로 WAN을 구성하면 Best-Effort 품질이므로 SLA 보장이 어렵고, 장애 시 통신사 복구 우선순위가 낮습니다.',
    impactKo: '네트워크 품질 불안정, QoS 미보장, 장애 복구 지연, 미션 크리티컬 업무 지장이 발생합니다.',
    solutionKo: '핵심 업무용 전용회선을 병행 구성하고, SD-WAN으로 트래픽을 지능적으로 분배하세요.',
    tags: ['telecom', 'corporate-internet', 'sla', 'quality', 'availability'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(AWS_WAF_REL, 'Network Connectivity - Redundancy'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'AP-TEL-005',
    type: 'antipattern',
    name: 'Private 5G Without UPF',
    nameKo: '5G 특화망 UPF 미배치',
    severity: 'high',
    detection: (spec: InfraSpec): boolean => {
      // private-5g exists but no upf
      if (!hasNodeType(spec, 'private-5g')) return false;
      return !hasNodeType(spec, 'upf');
    },
    detectionDescriptionKo: '5G 특화망(private-5g)이 존재하지만 UPF가 없는지 검사합니다.',
    problemKo: 'UPF 없이 5G 특화망을 구성하면 모든 데이터가 공용 코어를 거쳐 지연이 증가하고, 로컬 브레이크아웃이 불가능합니다.',
    impactKo: '초저지연 서비스 불가, 데이터 보안 위험 증가, 로컬 데이터 처리 불가, 5G 특화망의 이점 상실이 발생합니다.',
    solutionKo: '로컬 UPF를 배치하여 온프레미스 데이터 라우팅을 구현하고, 필요한 트래픽만 공용 코어로 전달하세요.',
    tags: ['telecom', '5g', 'private-5g', 'upf', 'local-breakout'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(NIST_800_144, 'Section 3 - Cloud Computing Benefits and Concerns'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'AP-TEL-006',
    type: 'antipattern',
    name: 'Wireless-Wired Transition No Security',
    nameKo: '무선-유선 전환점 보안 미비',
    severity: 'high',
    detection: (spec: InfraSpec): boolean => {
      // base-station exists and core-network exists but no firewall
      if (!hasNodeType(spec, 'base-station')) return false;
      if (!hasNodeType(spec, 'core-network')) return false;
      return !hasNodeType(spec, 'firewall');
    },
    detectionDescriptionKo: '기지국과 코어 네트워크가 존재하지만 방화벽이 없는지 검사합니다.',
    problemKo: '무선-유선 전환점(기지국~코어망)에 보안 장비가 없으면 무선 측 공격이 유선 인프라로 직접 전파될 수 있습니다.',
    impactKo: '무선 경유 공격의 내부망 전파, 코어 네트워크 침해, 다른 기지국/서비스 영향 확산이 발생합니다.',
    solutionKo: '기지국과 코어 네트워크 사이에 방화벽을 배치하고, 무선-유선 경계에서 트래픽 검사를 수행하세요.',
    tags: ['telecom', 'base-station', 'core-network', 'firewall', 'wireless-security'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(NIST_800_53, 'SC-7 - Boundary Protection'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
];

// ---------------------------------------------------------------------------
// SASE/SOC Anti-patterns (AP-SASE-001 ~ AP-SASE-003)
// ---------------------------------------------------------------------------

const saseAntiPatterns: AntiPattern[] = [
  {
    id: 'AP-SASE-001',
    type: 'antipattern',
    name: 'SASE without ZTNA',
    nameKo: 'ZTNA 없는 SASE',
    severity: 'high',
    detection: (spec: InfraSpec) =>
      hasNodeType(spec, 'sase-gateway' as InfraNodeType) &&
      !hasNodeType(spec, 'ztna-broker' as InfraNodeType),
    detectionDescriptionKo: 'SASE 게이트웨이가 있지만 ZTNA 브로커가 없는지 검사합니다.',
    problemKo: 'SASE 없이 ZTNA를 구현하지 않으면 네트워크 수준 접근만 제어되고, 애플리케이션 수준의 제로 트러스트 접근 제어가 누락됩니다.',
    impactKo: '과도한 네트워크 노출, 횡적 이동 공격 위험, 리모트 워커의 보안 취약점이 발생합니다.',
    solutionKo: 'ZTNA 브로커를 추가하여 애플리케이션별 접근 제어를 구현하고, VPN 대신 ZTNA 기반 접근으로 전환하세요.',
    tags: ['sase', 'ztna', 'zero-trust', 'access-control'],
    trust: {
      confidence: 0.85,
      sources: [withSection(NIST_800_207, 'Section 3 - Zero Trust Architecture Components')],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'AP-SASE-002',
    type: 'antipattern',
    name: 'SIEM without SOAR',
    nameKo: 'SOAR 없는 SIEM',
    severity: 'medium',
    detection: (spec: InfraSpec) =>
      hasNodeType(spec, 'siem' as InfraNodeType) &&
      !hasNodeType(spec, 'soar' as InfraNodeType),
    detectionDescriptionKo: 'SIEM이 있지만 자동 대응을 위한 SOAR가 없는지 검사합니다.',
    problemKo: 'SIEM만 운영하면 경보 피로(Alert Fatigue)가 발생하고, 수동 대응으로 인해 MTTR이 길어집니다.',
    impactKo: '경보 피로로 인한 중요 이벤트 누락, 느린 사고 대응, 보안 인력 소진이 발생합니다.',
    solutionKo: 'SOAR 플랫폼을 추가하여 반복적인 사고 대응을 자동화하고, 상위 10개 사고 유형에 대한 플레이북을 구성하세요.',
    tags: ['siem', 'soar', 'incident-response', 'automation'],
    trust: {
      confidence: 0.80,
      sources: [withSection(NIST_800_53, 'IR-4 - Incident Handling')],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'AP-SASE-003',
    type: 'antipattern',
    name: 'VPN in Cloud-First Architecture',
    nameKo: '클라우드 우선 환경에서의 VPN 사용',
    severity: 'medium',
    detection: (spec: InfraSpec) =>
      hasNodeType(spec, 'vpn-gateway') &&
      (hasNodeType(spec, 'aws-vpc') || hasNodeType(spec, 'azure-vnet') || hasNodeType(spec, 'gcp-network')) &&
      !hasNodeType(spec, 'ztna-broker' as InfraNodeType) &&
      !hasNodeType(spec, 'sase-gateway' as InfraNodeType),
    detectionDescriptionKo: '클라우드 환경에서 ZTNA/SASE 없이 VPN만 사용하는지 검사합니다.',
    problemKo: '클라우드 우선 환경에서 기존 VPN은 네트워크 전체에 접근을 허용하여 과도한 권한을 부여하고, 클라우드 네이티브 보안 모델과 맞지 않습니다.',
    impactKo: '과도한 네트워크 접근 권한, 횡적 이동 위험, 성능 저하(헤어핀 라우팅), 확장성 제한이 발생합니다.',
    solutionKo: 'ZTNA 브로커 또는 SASE 게이트웨이를 도입하여 애플리케이션 수준의 접근 제어로 전환하세요.',
    tags: ['vpn', 'cloud', 'ztna', 'sase', 'modernization'],
    trust: {
      confidence: 0.85,
      sources: [withSection(NIST_800_207, 'Section 4 - Deployment Models')],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
];

/** All verified anti-patterns (frozen, readonly) */
export const ANTI_PATTERNS: readonly AntiPattern[] = Object.freeze([
  ...securityAntiPatterns,
  ...availabilityAntiPatterns,
  ...performanceAntiPatterns,
  ...architectureAntiPatterns,
  ...cloudAntiPatterns,
  ...k8sAntiPatterns,
  ...authAntiPatterns,
  ...telecomAntiPatterns,
  ...saseAntiPatterns,
]);

/** Public alias used by the knowledge graph index */
export const ANTIPATTERNS = ANTI_PATTERNS;

// ---------------------------------------------------------------------------
// Public helper functions
// ---------------------------------------------------------------------------

/**
 * Runs all anti-pattern detection functions against the given InfraSpec.
 * Returns an array of detected (violated) anti-patterns.
 */
export function detectAntiPatterns(spec: InfraSpec): AntiPattern[] {
  return ANTI_PATTERNS.filter((ap) => {
    try {
      return ap.detection(spec);
    } catch {
      // If a detection function throws, skip it rather than breaking the whole analysis
      return false;
    }
  });
}

/**
 * Returns all anti-patterns of a given severity level.
 */
export function getAntiPatternsBySeverity(severity: 'critical' | 'high' | 'medium'): AntiPattern[] {
  return ANTI_PATTERNS.filter((ap) => ap.severity === severity);
}

/**
 * Shorthand to get all critical anti-patterns.
 */
export function getCriticalAntiPatterns(): AntiPattern[] {
  return getAntiPatternsBySeverity('critical');
}
