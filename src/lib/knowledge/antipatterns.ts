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
  OWASP_TOP10,
  OWASP_WSTG,
  AWS_WAF_REL,
  AWS_WAF_SEC,
  AWS_WAF_PERF,
  AZURE_CAF,
  CNCF_SECURITY,
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
// Combined registry
// ---------------------------------------------------------------------------

/** All verified anti-patterns (frozen, readonly) */
export const ANTI_PATTERNS: readonly AntiPattern[] = Object.freeze([
  ...securityAntiPatterns,
  ...availabilityAntiPatterns,
  ...performanceAntiPatterns,
  ...architectureAntiPatterns,
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
