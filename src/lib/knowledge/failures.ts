/**
 * Infrastructure Failure Scenarios (Layer 4)
 *
 * 35 verified failure scenarios covering all infrastructure categories.
 * Each scenario includes impact assessment, prevention/mitigation strategies,
 * and estimated MTTR (Mean Time To Recovery).
 *
 * Categories:
 * - FAIL-NET: Network failures (~10)
 * - FAIL-SEC: Security failures (~8)
 * - FAIL-CMP: Compute failures (~8)
 * - FAIL-DAT: Data/Storage failures (~6)
 * - FAIL-AUTH: Authentication failures (~3)
 */

import type { FailureScenario } from './types';
import type { InfraNodeType } from '@/types/infra';
import {
  withSection,
  NIST_800_41,
  NIST_800_44,
  NIST_800_53,
  NIST_800_94,
  NIST_800_123,
  NIST_800_81,
  NIST_800_77,
  NIST_800_144,
  NIST_800_63B,
  NIST_800_125,
  AWS_WAF_REL,
  AWS_WAF_SEC,
  AWS_WAF_PERF,
  CIS_V8,
  CIS_V8_12,
  SANS_CIS_TOP20,
  CNCF_SECURITY,
  OWASP_TOP10,
  RFC_3031,
  RFC_4364,
  ITU_G984,
  THREEGPP_38401,
  THREEGPP_23002,
  MEF_4,
} from './sourceRegistry';

// ---------------------------------------------------------------------------
// Network Failures (FAIL-NET-001 ~ FAIL-NET-010)
// ---------------------------------------------------------------------------

const NETWORK_FAILURES: FailureScenario[] = [
  {
    id: 'FAIL-NET-001',
    type: 'failure',
    component: 'firewall',
    titleKo: '방화벽 상태 테이블 고갈',
    scenarioKo:
      '대량의 동시 연결(DDoS, SYN Flood 등)로 인해 방화벽의 상태 테이블(session table)이 가득 차서 새로운 연결을 수립할 수 없게 되는 장애. 정상 트래픽까지 차단되어 전체 서비스가 중단될 수 있습니다.',
    impact: 'service-down',
    likelihood: 'medium',
    affectedComponents: ['web-server', 'app-server', 'load-balancer', 'dns'],
    preventionKo: [
      '방화벽 상태 테이블 크기를 모니터링하고 임계치(80%) 경보를 설정합니다',
      'DDoS 방어 솔루션을 방화벽 앞단에 배치합니다',
      '유휴 세션 타임아웃을 적절히 짧게 설정합니다(기본값보다 30~50% 단축)',
    ],
    mitigationKo: [
      '비정상 연결을 식별하여 긴급 차단 정책을 적용합니다',
      '방화벽 바이패스 모드를 활성화하여 핵심 서비스 트래픽만 허용합니다',
      '상태 테이블 크기를 동적으로 확장하거나 HA 페일오버를 트리거합니다',
    ],
    estimatedMTTR: '15분~1시간',
    tags: ['network', 'firewall', 'ddos', 'state-table', 'availability'],
    trust: {
      confidence: 0.95,
      sources: [withSection(NIST_800_41, 'Section 4.1 - Stateful Inspection Firewalls')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-NET-002',
    type: 'failure',
    component: 'dns',
    titleKo: 'DNS 포이즈닝 공격',
    scenarioKo:
      '공격자가 DNS 캐시에 위조된 레코드를 삽입하여 사용자를 악성 서버로 리디렉션시키는 공격. 피싱, 데이터 탈취, 중간자 공격의 진입점이 됩니다.',
    impact: 'security-breach',
    likelihood: 'medium',
    affectedComponents: ['web-server', 'load-balancer', 'cdn'],
    preventionKo: [
      'DNSSEC를 구현하여 DNS 응답의 무결성을 검증합니다',
      'DNS 트래픽을 모니터링하고 비정상 쿼리 패턴을 탐지합니다',
      'DNS 서버 소프트웨어를 최신 버전으로 유지합니다',
    ],
    mitigationKo: [
      '오염된 DNS 캐시를 즉시 플러시합니다',
      '영향받는 도메인의 DNS 레코드를 수동으로 검증하고 복원합니다',
      '임시로 신뢰할 수 있는 외부 DNS 리졸버로 전환합니다',
    ],
    estimatedMTTR: '30분~2시간',
    tags: ['network', 'dns', 'poisoning', 'security', 'dnssec'],
    trust: {
      confidence: 0.95,
      sources: [withSection(NIST_800_81, 'Section 7 - Securing DNS')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-NET-003',
    type: 'failure',
    component: 'dns',
    titleKo: 'DNS 서버 장애',
    scenarioKo:
      'DNS 서버가 하드웨어 고장, 소프트웨어 오류, 또는 DDoS 공격으로 응답 불가 상태가 됩니다. 모든 도메인 이름 해석이 실패하여 사실상 전체 네트워크 서비스가 중단됩니다.',
    impact: 'service-down',
    likelihood: 'low',
    affectedComponents: ['web-server', 'app-server', 'load-balancer', 'cdn', 'vpn-gateway'],
    preventionKo: [
      '이중화된 DNS 서버를 서로 다른 네트워크 세그먼트에 배치합니다',
      'DNS 서버의 헬스체크와 자동 페일오버를 구성합니다',
      '내부 DNS와 외부 DNS를 분리하여 운영합니다',
    ],
    mitigationKo: [
      '보조 DNS 서버로 자동 페일오버를 실행합니다',
      '로컬 DNS 캐시 TTL을 연장하여 캐시된 레코드로 임시 운영합니다',
      '핵심 서비스의 IP를 hosts 파일에 직접 등록합니다',
    ],
    estimatedMTTR: '15분~1시간',
    tags: ['network', 'dns', 'outage', 'availability', 'redundancy'],
    trust: {
      confidence: 0.95,
      sources: [withSection(NIST_800_81, 'Section 5 - DNS Architecture')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-NET-004',
    type: 'failure',
    component: 'load-balancer',
    titleKo: '로드밸런서 헬스체크 실패',
    scenarioKo:
      '로드밸런서의 헬스체크 설정 오류 또는 네트워크 지연으로 정상 서버를 비정상으로 판단하여 트래픽 분배에서 제외합니다. 남은 서버에 트래픽이 집중되어 연쇄 장애가 발생할 수 있습니다.',
    impact: 'degraded',
    likelihood: 'high',
    affectedComponents: ['web-server', 'app-server'],
    preventionKo: [
      '헬스체크 임계값(타임아웃, 재시도 횟수)을 보수적으로 설정합니다',
      '헬스체크 엔드포인트가 실제 서비스 상태를 정확히 반영하도록 구현합니다',
      '헬스체크 결과 변경 시 알림을 설정하여 조기 감지합니다',
    ],
    mitigationKo: [
      '헬스체크 설정을 즉시 검토하고 임계값을 완화합니다',
      '수동으로 서버를 정상 풀에 재등록합니다',
      '헬스체크 방식을 TCP에서 HTTP로 전환하거나 반대로 조정합니다',
    ],
    estimatedMTTR: '5분~30분',
    tags: ['network', 'load-balancer', 'health-check', 'availability'],
    trust: {
      confidence: 0.9,
      sources: [withSection(AWS_WAF_REL, 'Health Checks - Best Practices')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-NET-005',
    type: 'failure',
    component: 'router',
    titleKo: '라우터 크래시 및 라우팅 테이블 손상',
    scenarioKo:
      '라우터의 소프트웨어 버그, 메모리 오버플로우, 또는 잘못된 라우팅 업데이트로 인해 라우터가 비정상 종료됩니다. 라우팅 테이블 손상 시 패킷이 올바른 경로로 전달되지 않아 네트워크 분할이 발생합니다.',
    impact: 'service-down',
    likelihood: 'low',
    affectedComponents: ['firewall', 'switch-l3', 'load-balancer', 'web-server'],
    preventionKo: [
      '라우터 이중화(VRRP/HSRP)를 구성하여 자동 페일오버를 보장합니다',
      '라우팅 프로토콜 변경 전 스테이징 환경에서 검증합니다',
      '라우터 메모리 사용률과 CPU 사용률을 모니터링합니다',
    ],
    mitigationKo: [
      '대기 라우터로 페일오버를 트리거합니다',
      '라우팅 테이블을 마지막 정상 백업으로 복원합니다',
      '정적 라우팅을 임시 적용하여 핵심 경로를 복구합니다',
    ],
    estimatedMTTR: '15분~2시간',
    tags: ['network', 'router', 'crash', 'routing', 'availability'],
    trust: {
      confidence: 0.9,
      sources: [withSection(CIS_V8_12, '12.1 - Ensure Network Infrastructure is Up-to-Date')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-NET-006',
    type: 'failure',
    component: 'switch-l2',
    titleKo: '스위치 루프(브로드캐스트 스톰)',
    scenarioKo:
      'STP(Spanning Tree Protocol) 장애 또는 잘못된 케이블 연결로 L2 스위치 간 루프가 발생합니다. 브로드캐스트 프레임이 무한 순환하여 네트워크 대역폭을 소진하고 전체 세그먼트가 마비됩니다.',
    impact: 'service-down',
    likelihood: 'medium',
    affectedComponents: ['switch-l3', 'router', 'web-server', 'app-server', 'db-server'],
    preventionKo: [
      'STP/RSTP를 올바르게 설정하고 BPDU Guard를 활성화합니다',
      '네트워크 토폴로지 변경 시 루프 검증 절차를 수행합니다',
      '스톰 컨트롤(Storm Control)을 모든 접근 포트에 설정합니다',
    ],
    mitigationKo: [
      '루프를 유발하는 포트를 즉시 비활성화합니다',
      'STP 토폴로지를 수동으로 재수렴시킵니다',
      '영향받는 세그먼트의 스위치를 순차적으로 재시작합니다',
    ],
    estimatedMTTR: '10분~1시간',
    tags: ['network', 'switch', 'loop', 'broadcast-storm', 'stp'],
    trust: {
      confidence: 0.9,
      sources: [withSection(CIS_V8_12, '12.2 - Establish and Maintain a Secure Network Architecture')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-NET-007',
    type: 'failure',
    component: 'cdn',
    titleKo: 'CDN 캐시 포이즈닝',
    scenarioKo:
      '공격자가 CDN 캐시에 악성 콘텐츠를 삽입하여 다수의 사용자에게 변조된 콘텐츠를 전달하는 공격. 캐시 키 조작, Host 헤더 인젝션 등의 기법이 사용되며 광범위한 사용자에게 영향을 미칩니다.',
    impact: 'security-breach',
    likelihood: 'low',
    affectedComponents: ['web-server', 'load-balancer'],
    preventionKo: [
      '캐시 키를 명확히 정의하고 불필요한 헤더를 캐시 키에서 제외합니다',
      'Host 헤더 검증을 오리진 서버에서 수행합니다',
      'CDN에서 콘텐츠 무결성 검증(SRI)을 활성화합니다',
    ],
    mitigationKo: [
      '오염된 캐시를 전체 퍼지(purge)합니다',
      'CDN 바이패스 모드로 전환하여 오리진에서 직접 서비스합니다',
      '캐시 TTL을 최소화하고 오리진 응답을 검증합니다',
    ],
    estimatedMTTR: '30분~2시간',
    tags: ['network', 'cdn', 'cache-poisoning', 'security'],
    trust: {
      confidence: 0.85,
      sources: [withSection(OWASP_TOP10, 'A05:2021 - Security Misconfiguration')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-NET-008',
    type: 'failure',
    component: 'sd-wan',
    titleKo: 'SD-WAN 터널 장애',
    scenarioKo:
      'SD-WAN 오버레이 터널이 ISP 장애, 암호화 키 불일치, 또는 컨트롤러 연결 끊김으로 인해 다운됩니다. 원격 지사와의 통신이 차단되고 백업 경로가 없으면 지사 업무가 완전히 중단됩니다.',
    impact: 'service-down',
    likelihood: 'medium',
    affectedComponents: ['router', 'vpn-gateway', 'firewall'],
    preventionKo: [
      '다중 ISP 회선을 확보하여 터널 이중화를 구성합니다',
      'SD-WAN 컨트롤러를 HA(High Availability) 모드로 운영합니다',
      '터널 상태 모니터링 및 자동 경로 전환을 설정합니다',
    ],
    mitigationKo: [
      '대체 ISP 회선을 통해 터널을 재수립합니다',
      '기존 MPLS 또는 VPN 경로로 긴급 전환합니다',
      'SD-WAN 컨트롤러를 재시작하고 터널 설정을 재배포합니다',
    ],
    estimatedMTTR: '15분~2시간',
    tags: ['network', 'sd-wan', 'tunnel', 'wan', 'connectivity'],
    trust: {
      confidence: 0.85,
      sources: [withSection(AWS_WAF_REL, 'Network Connectivity - Redundancy')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-NET-009',
    type: 'failure',
    component: 'load-balancer',
    titleKo: '로드밸런서 세션 퍼시스턴스 장애',
    scenarioKo:
      '로드밸런서의 세션 어피니티(Sticky Session) 설정 오류로 인해 사용자 세션이 서로 다른 백엔드 서버로 분산됩니다. 장바구니 손실, 로그인 세션 끊김 등 사용자 경험이 심각하게 저하됩니다.',
    impact: 'degraded',
    likelihood: 'high',
    affectedComponents: ['web-server', 'app-server', 'cache'],
    preventionKo: [
      '세션 상태를 서버 외부(Redis, Memcached)에 저장하여 서버 독립적으로 관리합니다',
      '세션 퍼시스턴스 설정을 정기적으로 검증합니다',
      '세션 방식을 쿠키 기반에서 헤더 기반으로 표준화합니다',
    ],
    mitigationKo: [
      '세션 퍼시스턴스 설정을 즉시 검토하고 수정합니다',
      '외부 세션 스토어(Redis)로 긴급 전환합니다',
      '영향받는 사용자에게 재로그인을 안내합니다',
    ],
    estimatedMTTR: '10분~30분',
    tags: ['network', 'load-balancer', 'session', 'persistence', 'user-experience'],
    trust: {
      confidence: 0.85,
      sources: [withSection(AWS_WAF_PERF, 'Session Management - Load Balancing')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-NET-010',
    type: 'failure',
    component: 'switch-l3',
    titleKo: 'L3 스위치 ACL 설정 오류',
    scenarioKo:
      'L3 스위치의 ACL(Access Control List) 규칙이 잘못 구성되어 정상 트래픽이 차단되거나 비인가 트래픽이 허용됩니다. 서비스 중단 또는 보안 위협이 동시에 발생할 수 있습니다.',
    impact: 'degraded',
    likelihood: 'high',
    affectedComponents: ['router', 'firewall', 'web-server', 'app-server'],
    preventionKo: [
      'ACL 변경 시 변경 관리(Change Management) 프로세스를 적용합니다',
      'ACL 규칙을 정기적으로 감사하고 불필요한 규칙을 정리합니다',
      'ACL 변경을 스테이징 환경에서 사전 검증합니다',
    ],
    mitigationKo: [
      '직전 ACL 설정으로 롤백합니다',
      '문제가 되는 ACL 규칙을 즉시 비활성화합니다',
      '트래픽 흐름을 모니터링하여 영향 범위를 확인합니다',
    ],
    estimatedMTTR: '5분~30분',
    tags: ['network', 'switch', 'acl', 'misconfiguration', 'access-control'],
    trust: {
      confidence: 0.9,
      sources: [withSection(NIST_800_53, 'AC-4 - Information Flow Enforcement')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
];

// ---------------------------------------------------------------------------
// Security Failures (FAIL-SEC-001 ~ FAIL-SEC-008)
// ---------------------------------------------------------------------------

const SECURITY_FAILURES: FailureScenario[] = [
  {
    id: 'FAIL-SEC-001',
    type: 'failure',
    component: 'waf',
    titleKo: 'WAF 우회 공격',
    scenarioKo:
      '공격자가 인코딩 변환(이중 URL 인코딩, 유니코드 등), 페이로드 분할, 또는 정규표현식 우회 기법으로 WAF 탐지 규칙을 회피합니다. SQL Injection, XSS 등의 공격이 웹 서버까지 도달합니다.',
    impact: 'security-breach',
    likelihood: 'high',
    affectedComponents: ['web-server', 'app-server', 'db-server'],
    preventionKo: [
      'WAF 규칙을 정기적으로 업데이트하고 신규 공격 패턴에 대응합니다',
      '포지티브 보안 모델(화이트리스트)과 네거티브 모델(블랙리스트)을 병행합니다',
      'WAF 뒤에 추가적인 입력 검증 로직을 애플리케이션 레벨에서 구현합니다',
    ],
    mitigationKo: [
      '탐지된 공격 패턴에 대한 긴급 WAF 규칙을 추가합니다',
      '공격 소스 IP를 차단합니다',
      '웹 애플리케이션의 취약점을 긴급 패치합니다',
    ],
    estimatedMTTR: '1~4시간',
    tags: ['security', 'waf', 'bypass', 'injection', 'web-attack'],
    trust: {
      confidence: 0.9,
      sources: [withSection(OWASP_TOP10, 'A03:2021 - Injection')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-SEC-002',
    type: 'failure',
    component: 'vpn-gateway',
    titleKo: 'VPN 터널 연결 끊김',
    scenarioKo:
      'IKE 재협상 실패, 인증서 만료, 또는 네트워크 불안정으로 VPN 터널이 예기치 않게 해제됩니다. 원격 사용자와 본사 간 암호화 통신이 중단되며, 폴백 없이 평문 통신이 노출될 위험이 있습니다.',
    impact: 'service-down',
    likelihood: 'medium',
    affectedComponents: ['firewall', 'app-server', 'ldap-ad'],
    preventionKo: [
      'IKE 키 재협상 주기와 인증서 만료일을 사전에 관리합니다',
      '이중화된 VPN 게이트웨이를 Active-Standby로 구성합니다',
      'VPN 터널 상태를 실시간 모니터링하고 자동 재연결을 설정합니다',
    ],
    mitigationKo: [
      'VPN 터널을 수동으로 재수립합니다',
      '백업 VPN 게이트웨이로 트래픽을 전환합니다',
      '긴급 시 SSL VPN 또는 ZTNA로 대체 접속 경로를 제공합니다',
    ],
    estimatedMTTR: '10분~1시간',
    tags: ['security', 'vpn', 'tunnel', 'disconnect', 'encryption'],
    trust: {
      confidence: 0.95,
      sources: [withSection(NIST_800_77, 'Section 5 - IPsec VPN Management')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-SEC-003',
    type: 'failure',
    component: 'firewall',
    titleKo: 'TLS/SSL 인증서 만료',
    scenarioKo:
      '방화벽 또는 서비스의 SSL/TLS 인증서가 만료되어 HTTPS 연결이 실패합니다. 브라우저에서 보안 경고가 표시되고, API 통신이 거부되며, 자동화된 시스템 간 연동이 중단됩니다.',
    impact: 'service-down',
    likelihood: 'high',
    affectedComponents: ['web-server', 'load-balancer', 'waf', 'cdn'],
    preventionKo: [
      '인증서 만료 30/14/7일 전 자동 알림을 설정합니다',
      'Let\'s Encrypt 등을 활용한 인증서 자동 갱신을 구성합니다',
      '모든 인증서를 중앙 관리 시스템에서 추적합니다',
    ],
    mitigationKo: [
      '만료된 인증서를 즉시 갱신하거나 교체합니다',
      '임시 자체 서명 인증서로 긴급 복구합니다',
      '인증서 검증을 일시적으로 완화하여 서비스를 유지합니다(최후 수단)',
    ],
    estimatedMTTR: '15분~2시간',
    tags: ['security', 'certificate', 'tls', 'ssl', 'expiry'],
    trust: {
      confidence: 0.9,
      sources: [withSection(NIST_800_53, 'SC-17 - Public Key Infrastructure Certificates')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-SEC-004',
    type: 'failure',
    component: 'ids-ips',
    titleKo: 'IDS/IPS 오탐(False Negative) 및 미탐지',
    scenarioKo:
      'IDS/IPS 시그니처가 최신 공격 패턴을 포함하지 않거나 암호화된 트래픽을 검사하지 못하여 실제 공격을 탐지하지 못합니다. 공격자가 내부 네트워크에 침투한 후에도 경보가 발생하지 않습니다.',
    impact: 'security-breach',
    likelihood: 'medium',
    affectedComponents: ['firewall', 'web-server', 'app-server', 'db-server'],
    preventionKo: [
      'IDS/IPS 시그니처를 최소 주 1회 이상 업데이트합니다',
      'SSL/TLS 복호화 검사를 활성화하여 암호화 트래픽도 분석합니다',
      '행위 기반 탐지(anomaly-based detection)를 시그니처 기반과 병행합니다',
    ],
    mitigationKo: [
      '수동 트래픽 분석으로 침입 여부를 조사합니다',
      '침해 의심 시스템을 네트워크에서 격리합니다',
      '긴급 시그니처를 추가하고 탐지 민감도를 높입니다',
    ],
    estimatedMTTR: '2~8시간',
    tags: ['security', 'ids-ips', 'false-negative', 'detection', 'evasion'],
    trust: {
      confidence: 0.95,
      sources: [withSection(NIST_800_94, 'Section 4 - Types of IDPS Technologies')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-SEC-005',
    type: 'failure',
    component: 'nac',
    titleKo: 'NAC 우회를 통한 비인가 접속',
    scenarioKo:
      '공격자가 MAC 스푸핑, 802.1X 우회, 또는 인가 장비의 네트워크 포트를 물리적으로 점유하여 NAC 통제를 우회합니다. 비인가 장비가 내부 네트워크에 접속하여 횡적 이동(lateral movement)이 가능해집니다.',
    impact: 'security-breach',
    likelihood: 'low',
    affectedComponents: ['switch-l2', 'switch-l3', 'firewall', 'ldap-ad'],
    preventionKo: [
      '802.1X 인증과 MAB(MAC Authentication Bypass)를 조합하여 사용합니다',
      '지속적 단말 상태 평가(Continuous Endpoint Assessment)를 적용합니다',
      '네트워크 세그먼테이션을 통해 비인가 접속의 영향 범위를 제한합니다',
    ],
    mitigationKo: [
      '비인가 장비의 네트워크 포트를 즉시 차단합니다',
      '해당 세그먼트의 모든 장비를 재인증합니다',
      '비인가 장비의 활동 로그를 분석하여 피해 범위를 파악합니다',
    ],
    estimatedMTTR: '30분~2시간',
    tags: ['security', 'nac', 'bypass', 'unauthorized-access', '802.1x'],
    trust: {
      confidence: 0.85,
      sources: [withSection(NIST_800_53, 'AC-17 - Remote Access')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-SEC-006',
    type: 'failure',
    component: 'dlp',
    titleKo: 'DLP 우회를 통한 데이터 유출',
    scenarioKo:
      '내부자 또는 공격자가 DLP 정책을 우회하여 민감 데이터를 외부로 유출합니다. 스테가노그래피, 암호화된 채널, 또는 승인된 클라우드 서비스를 통한 우회 방법이 사용됩니다.',
    impact: 'data-loss',
    likelihood: 'medium',
    affectedComponents: ['firewall', 'web-server', 'db-server'],
    preventionKo: [
      'DLP 정책을 엔드포인트, 네트워크, 클라우드 레벨에서 다층 적용합니다',
      '암호화된 트래픽에 대한 SSL 검사를 수행합니다',
      '데이터 분류 체계를 수립하고 민감 데이터를 태깅합니다',
    ],
    mitigationKo: [
      '유출 경로를 파악하고 즉시 차단합니다',
      '유출된 데이터의 범위와 민감도를 평가합니다',
      '관련 규정에 따라 유출 사고를 보고하고 대응 절차를 시작합니다',
    ],
    estimatedMTTR: '4~24시간',
    tags: ['security', 'dlp', 'data-leak', 'insider-threat', 'exfiltration'],
    trust: {
      confidence: 0.85,
      sources: [withSection(NIST_800_53, 'SC-7 - Boundary Protection')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-SEC-007',
    type: 'failure',
    component: 'waf',
    titleKo: 'WAF 규칙 업데이트 실패로 인한 제로데이 노출',
    scenarioKo:
      'WAF 가상 패치 또는 규칙 업데이트가 제때 적용되지 않아 공개된 취약점(CVE)에 대한 방어가 없는 상태가 지속됩니다. 공격자가 알려진 취약점을 악용하여 웹 서비스를 침해합니다.',
    impact: 'security-breach',
    likelihood: 'medium',
    affectedComponents: ['web-server', 'app-server'],
    preventionKo: [
      'WAF 규칙 자동 업데이트를 활성화하고 업데이트 실패 알림을 설정합니다',
      '보안 공지(Security Advisory)를 모니터링하여 긴급 패치를 조기 적용합니다',
      'WAF 규칙 적용 현황을 주간 보고로 관리합니다',
    ],
    mitigationKo: [
      '해당 취약점에 대한 커스텀 WAF 규칙을 수동으로 추가합니다',
      '취약한 엔드포인트를 임시로 비활성화합니다',
      '웹 서버에 직접 보안 패치를 적용합니다',
    ],
    estimatedMTTR: '1~4시간',
    tags: ['security', 'waf', 'zero-day', 'patching', 'vulnerability'],
    trust: {
      confidence: 0.85,
      sources: [withSection(SANS_CIS_TOP20, 'Control 7 - Continuous Vulnerability Management')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-SEC-008',
    type: 'failure',
    component: 'vpn-gateway',
    titleKo: 'VPN 스플릿 터널링 보안 위반',
    scenarioKo:
      '스플릿 터널링이 설정된 VPN 환경에서 원격 사용자의 로컬 네트워크가 감염되어 VPN을 통해 본사 네트워크로 악성코드가 전파됩니다. 원격 접속 환경이 공격의 진입점이 됩니다.',
    impact: 'security-breach',
    likelihood: 'medium',
    affectedComponents: ['firewall', 'app-server', 'db-server', 'ldap-ad'],
    preventionKo: [
      '풀 터널링(Full Tunneling) 정책을 적용하거나 스플릿 터널링 시 엔드포인트 보안 상태를 검증합니다',
      'VPN 접속 단말의 최소 보안 요건(백신, 패치 수준)을 강제합니다',
      '원격 접속 시 마이크로 세그먼테이션을 적용하여 접근 범위를 제한합니다',
    ],
    mitigationKo: [
      '감염 의심 VPN 세션을 즉시 종료합니다',
      '해당 사용자의 계정을 임시 비활성화하고 단말을 격리합니다',
      '내부 네트워크의 감염 확산 여부를 점검합니다',
    ],
    estimatedMTTR: '1~4시간',
    tags: ['security', 'vpn', 'split-tunneling', 'malware', 'remote-access'],
    trust: {
      confidence: 0.9,
      sources: [withSection(NIST_800_77, 'Section 3.2 - VPN Architecture')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
];

// ---------------------------------------------------------------------------
// Compute Failures (FAIL-CMP-001 ~ FAIL-CMP-008)
// ---------------------------------------------------------------------------

const COMPUTE_FAILURES: FailureScenario[] = [
  {
    id: 'FAIL-CMP-001',
    type: 'failure',
    component: 'web-server',
    titleKo: '웹 서버 메모리 부족(OOM)',
    scenarioKo:
      '급격한 트래픽 증가, 메모리 누수, 또는 대용량 파일 처리로 웹 서버의 가용 메모리가 고갈됩니다. OOM Killer에 의해 프로세스가 강제 종료되거나 극심한 스와핑으로 응답 시간이 수십 초로 증가합니다.',
    impact: 'service-down',
    likelihood: 'high',
    affectedComponents: ['load-balancer', 'app-server'],
    preventionKo: [
      '메모리 사용량을 모니터링하고 80% 임계치에서 경보를 발생시킵니다',
      '요청당 메모리 사용량을 제한하고 대용량 처리는 비동기로 전환합니다',
      'Auto-scaling을 구성하여 트래픽 증가 시 자동으로 인스턴스를 추가합니다',
    ],
    mitigationKo: [
      'OOM 발생 서버를 로드밸런서에서 제외하고 재시작합니다',
      '메모리 누수 프로세스를 식별하여 종료합니다',
      '긴급으로 서버 메모리를 확장하거나 인스턴스를 추가합니다',
    ],
    estimatedMTTR: '5분~30분',
    tags: ['compute', 'web-server', 'oom', 'memory', 'performance'],
    trust: {
      confidence: 0.9,
      sources: [withSection(NIST_800_123, 'Section 6 - Server Availability')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-CMP-002',
    type: 'failure',
    component: 'app-server',
    titleKo: '애플리케이션 서버 스레드 풀 고갈',
    scenarioKo:
      '느린 외부 API 호출, 데이터베이스 응답 지연, 또는 잘못된 동기 처리로 인해 애플리케이션 서버의 스레드 풀이 모두 사용됩니다. 새로운 요청을 처리할 수 없어 요청 큐가 증가하고 타임아웃이 발생합니다.',
    impact: 'service-down',
    likelihood: 'high',
    affectedComponents: ['web-server', 'db-server', 'cache', 'load-balancer'],
    preventionKo: [
      '외부 호출에 타임아웃과 서킷 브레이커 패턴을 적용합니다',
      '스레드 풀 크기를 적절히 설정하고 사용률을 모니터링합니다',
      '비동기 처리를 활용하여 스레드 점유 시간을 최소화합니다',
    ],
    mitigationKo: [
      '느린 외부 연동을 임시 차단하여 스레드를 해제합니다',
      '애플리케이션 서버를 순차적으로 재시작합니다(rolling restart)',
      '스레드 풀 크기를 동적으로 확장합니다',
    ],
    estimatedMTTR: '10분~1시간',
    tags: ['compute', 'app-server', 'thread-pool', 'exhaustion', 'timeout'],
    trust: {
      confidence: 0.9,
      sources: [withSection(AWS_WAF_REL, 'Fault Isolation - Throttling')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-CMP-003',
    type: 'failure',
    component: 'db-server',
    titleKo: '데이터베이스 데드락',
    scenarioKo:
      '복수의 트랜잭션이 서로가 보유한 잠금(lock)을 대기하는 교착 상태에 빠집니다. 관련 쿼리들이 무한 대기 상태에 들어가고 커넥션 풀이 고갈되어 전체 애플리케이션 응답이 중단됩니다.',
    impact: 'degraded',
    likelihood: 'high',
    affectedComponents: ['app-server', 'web-server'],
    preventionKo: [
      '트랜잭션에서 테이블/행 접근 순서를 일관되게 통일합니다',
      '트랜잭션 범위를 최소화하고 장시간 잠금을 피합니다',
      '데드락 탐지 및 자동 롤백 기능을 활성화합니다',
    ],
    mitigationKo: [
      '데드락에 관련된 트랜잭션 중 하나를 강제 종료합니다',
      '데드락 로그를 분석하여 원인 쿼리를 식별합니다',
      '문제가 되는 인덱스를 추가하거나 쿼리를 최적화합니다',
    ],
    estimatedMTTR: '5분~30분',
    tags: ['compute', 'database', 'deadlock', 'transaction', 'locking'],
    trust: {
      confidence: 0.9,
      sources: [withSection(NIST_800_123, 'Section 5 - Server Configuration')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-CMP-004',
    type: 'failure',
    component: 'db-server',
    titleKo: '데이터베이스 복제 지연(Replication Lag)',
    scenarioKo:
      '대량의 쓰기 작업, 네트워크 지연, 또는 슬레이브 서버의 성능 부족으로 마스터-슬레이브 간 데이터 복제가 지연됩니다. 읽기 전용 쿼리가 오래된 데이터를 반환하여 데이터 불일치가 발생합니다.',
    impact: 'degraded',
    likelihood: 'high',
    affectedComponents: ['app-server', 'web-server', 'cache'],
    preventionKo: [
      '복제 지연을 실시간 모니터링하고 임계값(예: 5초) 초과 시 경보를 발생시킵니다',
      '슬레이브 서버의 하드웨어 사양을 마스터와 동일하게 유지합니다',
      '대량 쓰기 작업은 배치로 분할하여 처리합니다',
    ],
    mitigationKo: [
      '읽기 트래픽을 마스터로 임시 전환합니다',
      '복제 지연이 큰 슬레이브를 읽기 풀에서 제외합니다',
      '슬레이브를 재빌드하여 동기화를 복구합니다',
    ],
    estimatedMTTR: '15분~2시간',
    tags: ['compute', 'database', 'replication', 'lag', 'consistency'],
    trust: {
      confidence: 0.9,
      sources: [withSection(AWS_WAF_REL, 'Data Durability - Replication')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-CMP-005',
    type: 'failure',
    component: 'container',
    titleKo: '컨테이너 OOM Kill',
    scenarioKo:
      '컨테이너의 메모리 리밋(limit)을 초과하여 커널의 OOM Killer가 컨테이너 프로세스를 강제 종료합니다. 메모리 리밋이 너무 낮게 설정되었거나 애플리케이션의 메모리 누수로 발생합니다.',
    impact: 'degraded',
    likelihood: 'high',
    affectedComponents: ['kubernetes', 'load-balancer'],
    preventionKo: [
      '컨테이너의 메모리 request/limit을 실제 사용량 기반으로 적절히 설정합니다',
      '메모리 사용량을 모니터링하고 트렌드 분석을 수행합니다',
      '애플리케이션 프로파일링을 통해 메모리 누수를 사전 탐지합니다',
    ],
    mitigationKo: [
      '컨테이너 메모리 리밋을 상향 조정합니다',
      '재시작 정책(restart policy)이 올바르게 설정되었는지 확인합니다',
      '메모리 누수가 있는 경우 수정된 이미지로 재배포합니다',
    ],
    estimatedMTTR: '5분~30분',
    tags: ['compute', 'container', 'oom-kill', 'memory', 'resource-limit'],
    trust: {
      confidence: 0.9,
      sources: [withSection(CNCF_SECURITY, 'Container Runtime Security')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-CMP-006',
    type: 'failure',
    component: 'kubernetes',
    titleKo: 'Kubernetes Pod CrashLoopBackOff',
    scenarioKo:
      'Pod가 시작 직후 반복적으로 크래시하여 CrashLoopBackOff 상태에 빠집니다. 설정 오류, 의존 서비스 미가용, 이미지 호환성 문제, 또는 리소스 부족이 원인이며, 백오프 간격이 점점 늘어나 복구가 지연됩니다.',
    impact: 'service-down',
    likelihood: 'high',
    affectedComponents: ['container', 'load-balancer', 'app-server'],
    preventionKo: [
      '배포 전 스테이징 환경에서 충분한 테스트를 수행합니다',
      'Readiness/Liveness Probe를 적절히 설정합니다',
      'Init Container로 의존 서비스 가용성을 사전 확인합니다',
    ],
    mitigationKo: [
      'kubectl logs로 크래시 원인을 분석합니다',
      '이전 정상 버전으로 롤백합니다(kubectl rollout undo)',
      '리소스 제한을 완화하거나 환경 변수/설정을 수정합니다',
    ],
    estimatedMTTR: '10분~1시간',
    tags: ['compute', 'kubernetes', 'crashloop', 'pod', 'deployment'],
    trust: {
      confidence: 0.9,
      sources: [withSection(CNCF_SECURITY, 'Workload Security - Pod Security')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-CMP-007',
    type: 'failure',
    component: 'vm',
    titleKo: '가상머신 리소스 경합(Resource Contention)',
    scenarioKo:
      '동일 하이퍼바이저 위의 복수 VM이 CPU, 메모리, 디스크 I/O를 과도하게 사용하여 리소스 경합이 발생합니다. "Noisy Neighbor" 현상으로 다른 VM의 성능이 예측 불가능하게 저하됩니다.',
    impact: 'degraded',
    likelihood: 'medium',
    affectedComponents: ['app-server', 'db-server', 'web-server'],
    preventionKo: [
      'VM별 리소스 예약(reservation)을 설정하여 최소 보장 리소스를 확보합니다',
      '핵심 워크로드를 전용 호스트(dedicated host)에 배치합니다',
      'CPU/메모리/디스크 사용률을 호스트 레벨에서 모니터링합니다',
    ],
    mitigationKo: [
      '리소스를 과도하게 사용하는 VM을 다른 호스트로 마이그레이션합니다',
      '문제가 되는 VM의 리소스 할당을 조정합니다',
      '핵심 VM에 리소스 우선순위(priority)를 설정합니다',
    ],
    estimatedMTTR: '15분~1시간',
    tags: ['compute', 'vm', 'resource-contention', 'noisy-neighbor', 'hypervisor'],
    trust: {
      confidence: 0.9,
      sources: [withSection(NIST_800_125, 'Section 4 - VM Security Recommendations')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-CMP-008',
    type: 'failure',
    component: 'web-server',
    titleKo: '웹 서버 Slowloris/Slow HTTP 공격',
    scenarioKo:
      '공격자가 HTTP 요청을 매우 느리게 전송하여 웹 서버의 연결 슬롯을 장시간 점유합니다. 최대 동시 연결 수에 도달하면 정상 사용자의 접속이 거부됩니다. 적은 대역폭으로도 서비스 거부가 가능합니다.',
    impact: 'service-down',
    likelihood: 'medium',
    affectedComponents: ['load-balancer', 'waf'],
    preventionKo: [
      '요청 헤더/바디 수신 타임아웃을 짧게 설정합니다(10~30초)',
      '단일 IP의 동시 연결 수를 제한합니다',
      'WAF에 Slow HTTP 공격 탐지 규칙을 추가합니다',
    ],
    mitigationKo: [
      '공격 IP를 식별하여 차단합니다',
      '웹 서버의 연결 타임아웃을 긴급 단축합니다',
      '리버스 프록시 또는 CDN을 통해 공격 트래픽을 흡수합니다',
    ],
    estimatedMTTR: '15분~1시간',
    tags: ['compute', 'web-server', 'slowloris', 'dos', 'connection-exhaustion'],
    trust: {
      confidence: 0.85,
      sources: [withSection(NIST_800_44, 'Section 8 - Web Server Security')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
];

// ---------------------------------------------------------------------------
// Data/Storage Failures (FAIL-DAT-001 ~ FAIL-DAT-006)
// ---------------------------------------------------------------------------

const DATA_FAILURES: FailureScenario[] = [
  {
    id: 'FAIL-DAT-001',
    type: 'failure',
    component: 'cache',
    titleKo: '캐시 스탬피드(Cache Stampede)',
    scenarioKo:
      '인기 있는 캐시 키가 동시에 만료되면서 대량의 요청이 동시에 원본 데이터베이스로 쏟아지는 현상. DB에 과부하가 발생하여 응답 지연이 급증하고 연쇄적으로 서비스 전체가 느려집니다.',
    impact: 'degraded',
    likelihood: 'high',
    affectedComponents: ['db-server', 'app-server', 'web-server'],
    preventionKo: [
      '캐시 TTL에 랜덤 지터(jitter)를 추가하여 동시 만료를 방지합니다',
      '핫 키에 대해 락(lock) 기반 갱신 방식을 적용합니다(single-flight)',
      '캐시 사전 워밍(pre-warming)을 구현하여 만료 전 갱신합니다',
    ],
    mitigationKo: [
      '임시로 캐시 TTL을 연장하여 동시 만료를 완화합니다',
      'DB 커넥션 풀을 확장하여 급증하는 쿼리를 처리합니다',
      '서킷 브레이커를 활성화하여 DB 과부하를 방지합니다',
    ],
    estimatedMTTR: '5분~30분',
    tags: ['data', 'cache', 'stampede', 'thundering-herd', 'database-overload'],
    trust: {
      confidence: 0.85,
      sources: [withSection(AWS_WAF_PERF, 'Caching - Best Practices')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-DAT-002',
    type: 'failure',
    component: 'cache',
    titleKo: '캐시 이빅션 스톰(Eviction Storm)',
    scenarioKo:
      '캐시 메모리가 가득 차서 대량의 캐시 항목이 짧은 시간 내에 제거(eviction)됩니다. 캐시 히트율이 급격히 하락하면서 원본 스토리지에 대한 부하가 폭증하고 전체 시스템 성능이 저하됩니다.',
    impact: 'degraded',
    likelihood: 'medium',
    affectedComponents: ['db-server', 'app-server'],
    preventionKo: [
      '캐시 메모리 사용률을 모니터링하고 80% 도달 시 경보를 설정합니다',
      '캐시 이빅션 정책(LRU, LFU)을 워크로드에 맞게 최적화합니다',
      '캐시 클러스터를 확장하여 충분한 메모리를 확보합니다',
    ],
    mitigationKo: [
      '캐시 메모리를 긴급 확장합니다',
      '불필요한 캐시 항목을 식별하여 제거하고 공간을 확보합니다',
      '임시로 캐시 TTL을 줄여 메모리 사용을 최적화합니다',
    ],
    estimatedMTTR: '10분~1시간',
    tags: ['data', 'cache', 'eviction', 'memory', 'hit-rate'],
    trust: {
      confidence: 0.85,
      sources: [withSection(AWS_WAF_PERF, 'Caching - Capacity Planning')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-DAT-003',
    type: 'failure',
    component: 'backup',
    titleKo: '백업 데이터 손상',
    scenarioKo:
      '백업 미디어 결함, 전송 오류, 또는 랜섬웨어 감염으로 백업 데이터가 손상되어 복원이 불가능해집니다. 실제 재해 복구 시점에 백업을 사용할 수 없다는 것이 뒤늦게 발견됩니다.',
    impact: 'data-loss',
    likelihood: 'medium',
    affectedComponents: ['db-server', 'san-nas', 'object-storage'],
    preventionKo: [
      '백업 무결성 검증(체크섬)을 정기적으로 수행합니다',
      '3-2-1 백업 규칙(3개 복사, 2개 매체, 1개 오프사이트)을 적용합니다',
      '백업 복원 훈련을 분기별로 실시합니다',
    ],
    mitigationKo: [
      '이전 정상 백업 세트에서 복원합니다',
      '백업 간 차분 데이터를 수동으로 재구성합니다',
      '트랜잭션 로그를 활용하여 데이터 복구를 시도합니다',
    ],
    estimatedMTTR: '2~12시간',
    tags: ['data', 'backup', 'corruption', 'disaster-recovery', 'data-integrity'],
    trust: {
      confidence: 0.95,
      sources: [withSection(NIST_800_53, 'CP-9 - System Backup')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-DAT-004',
    type: 'failure',
    component: 'san-nas',
    titleKo: '스토리지 IOPS 포화',
    scenarioKo:
      'SAN/NAS 스토리지의 IOPS 한계에 도달하여 디스크 I/O 대기 시간이 급증합니다. 데이터베이스 쿼리 지연, 파일 서비스 타임아웃, VM 성능 저하가 연쇄적으로 발생합니다.',
    impact: 'degraded',
    likelihood: 'medium',
    affectedComponents: ['db-server', 'app-server', 'vm', 'backup'],
    preventionKo: [
      'IOPS 사용률을 모니터링하고 70% 도달 시 경보를 설정합니다',
      '핫 데이터를 SSD 티어에 배치하는 자동 티어링을 구성합니다',
      '읽기 캐시(Read Cache)를 활성화하여 디스크 직접 접근을 줄입니다',
    ],
    mitigationKo: [
      'IOPS를 과도하게 소비하는 워크로드를 식별하여 제한합니다',
      '스토리지 캐시를 임시 확장합니다',
      '비핵심 워크로드를 다른 스토리지로 이동합니다',
    ],
    estimatedMTTR: '30분~2시간',
    tags: ['data', 'storage', 'iops', 'saturation', 'performance'],
    trust: {
      confidence: 0.85,
      sources: [withSection(AWS_WAF_PERF, 'Storage - Performance Optimization')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-DAT-005',
    type: 'failure',
    component: 'object-storage',
    titleKo: '오브젝트 스토리지 접근 지연',
    scenarioKo:
      '클라우드 오브젝트 스토리지(S3, Blob 등)의 API 지연 또는 일시적 장애로 파일 업로드/다운로드가 실패합니다. 정적 콘텐츠 서빙, 로그 저장, 데이터 파이프라인 등 의존 서비스가 영향을 받습니다.',
    impact: 'degraded',
    likelihood: 'medium',
    affectedComponents: ['web-server', 'app-server', 'cdn', 'backup'],
    preventionKo: [
      '오브젝트 스토리지 접근에 재시도 로직과 지수 백오프를 적용합니다',
      '핵심 정적 콘텐츠를 CDN에 캐싱하여 직접 접근을 줄입니다',
      '다중 리전 복제를 구성하여 가용성을 높입니다',
    ],
    mitigationKo: [
      'CDN 캐시를 활용하여 오브젝트 스토리지 접근을 최소화합니다',
      '대체 리전의 오브젝트 스토리지로 트래픽을 전환합니다',
      '비필수 파일 작업을 큐에 저장하고 복구 후 재처리합니다',
    ],
    estimatedMTTR: '15분~2시간',
    tags: ['data', 'object-storage', 'latency', 'cloud', 'availability'],
    trust: {
      confidence: 0.85,
      sources: [withSection(NIST_800_144, 'Section 5 - Cloud Storage Security')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-DAT-006',
    type: 'failure',
    component: 'san-nas',
    titleKo: 'SAN/NAS 페일오버 실패',
    scenarioKo:
      'SAN/NAS의 주 컨트롤러 장애 시 이중화된 보조 컨트롤러로의 자동 페일오버가 실패합니다. 페일오버 설정 오류, 동기화 지연, 또는 보조 컨트롤러의 동시 장애가 원인이며, 스토리지 전체 접근이 불가능해집니다.',
    impact: 'service-down',
    likelihood: 'low',
    affectedComponents: ['db-server', 'app-server', 'vm', 'backup'],
    preventionKo: [
      '페일오버 테스트를 정기적으로 수행합니다(최소 분기별)',
      '주/보조 컨트롤러 간 동기화 상태를 지속적으로 모니터링합니다',
      '펌웨어/소프트웨어 버전을 주/보조 동일하게 유지합니다',
    ],
    mitigationKo: [
      '수동으로 보조 컨트롤러를 활성화합니다',
      '스토리지 접근 경로를 수동으로 재구성합니다',
      '벤더 기술 지원에 긴급 연락하여 복구를 요청합니다',
    ],
    estimatedMTTR: '1~4시간',
    tags: ['data', 'storage', 'failover', 'san-nas', 'high-availability'],
    trust: {
      confidence: 0.9,
      sources: [withSection(AWS_WAF_REL, 'Hardware Failures - Storage Redundancy')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
];

// ---------------------------------------------------------------------------
// Auth Failures (FAIL-AUTH-001 ~ FAIL-AUTH-003)
// ---------------------------------------------------------------------------

const AUTH_FAILURES: FailureScenario[] = [
  {
    id: 'FAIL-AUTH-001',
    type: 'failure',
    component: 'ldap-ad',
    titleKo: 'LDAP/Active Directory 장애',
    scenarioKo:
      'LDAP/AD 서버가 하드웨어 고장, 소프트웨어 버그, 또는 DB 손상으로 응답 불가 상태가 됩니다. 모든 인증/인가 요청이 실패하여 사용자 로그인, 그룹 정책 적용, 서비스 간 인증이 전면 중단됩니다.',
    impact: 'service-down',
    likelihood: 'low',
    affectedComponents: ['sso', 'vpn-gateway', 'web-server', 'app-server', 'iam'],
    preventionKo: [
      'AD 도메인 컨트롤러를 최소 2대 이상 이중화하고 서로 다른 사이트에 배치합니다',
      'AD 복제 상태를 실시간 모니터링합니다',
      'LDAP 서버의 정기 백업과 복원 테스트를 수행합니다',
    ],
    mitigationKo: [
      '보조 도메인 컨트롤러로 인증 요청을 전환합니다',
      '로컬 캐시된 자격증명으로 임시 인증을 허용합니다',
      '장애 DC를 격리하고 정상 백업에서 복원합니다',
    ],
    estimatedMTTR: '30분~4시간',
    tags: ['auth', 'ldap', 'active-directory', 'outage', 'authentication'],
    trust: {
      confidence: 0.95,
      sources: [withSection(NIST_800_63B, 'Section 5 - Authenticator and Verifier Requirements')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-AUTH-002',
    type: 'failure',
    component: 'sso',
    titleKo: 'SSO 토큰 만료 연쇄 장애',
    scenarioKo:
      'SSO IdP(Identity Provider) 서버의 시간 동기화 오류 또는 토큰 갱신 서비스 장애로 다수 사용자의 SSO 토큰이 동시에 무효화됩니다. 대량의 재인증 요청이 IdP에 집중되어 인증 서비스 전체가 마비됩니다.',
    impact: 'service-down',
    likelihood: 'medium',
    affectedComponents: ['ldap-ad', 'web-server', 'app-server', 'iam'],
    preventionKo: [
      'NTP 서버를 이중화하고 시간 동기화 상태를 모니터링합니다',
      'SSO 토큰 갱신 서비스를 이중화합니다',
      '토큰 만료 시간을 분산시켜 동시 갱신을 방지합니다',
    ],
    mitigationKo: [
      '토큰 만료 시간을 임시 연장하여 재인증 폭증을 완화합니다',
      'IdP 서버를 수평 확장하여 인증 요청을 분산 처리합니다',
      '폴백으로 로컬 인증을 일시 허용합니다',
    ],
    estimatedMTTR: '15분~2시간',
    tags: ['auth', 'sso', 'token', 'expiry', 'cascade-failure'],
    trust: {
      confidence: 0.85,
      sources: [withSection(NIST_800_63B, 'Section 7 - Session Management')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-AUTH-003',
    type: 'failure',
    component: 'iam',
    titleKo: 'IAM 권한 오설정(Permission Misconfiguration)',
    scenarioKo:
      'IAM 정책의 과도한 권한 부여(over-permissioning) 또는 잘못된 역할 매핑으로 비인가 사용자가 민감한 리소스에 접근합니다. 반대로 권한이 너무 제한되면 정상 업무가 불가능해집니다.',
    impact: 'security-breach',
    likelihood: 'high',
    affectedComponents: ['db-server', 'object-storage', 'app-server', 'web-server'],
    preventionKo: [
      '최소 권한 원칙(Principle of Least Privilege)을 적용합니다',
      'IAM 정책 변경에 코드 리뷰와 승인 절차를 의무화합니다',
      '미사용 권한을 정기적으로 감사하고 제거합니다',
    ],
    mitigationKo: [
      '과도한 권한이 부여된 정책을 즉시 수정합니다',
      '영향받는 계정의 활동 로그를 감사합니다',
      '임시로 해당 역할/사용자의 접근을 제한합니다',
    ],
    estimatedMTTR: '15분~2시간',
    tags: ['auth', 'iam', 'misconfiguration', 'over-permission', 'least-privilege'],
    trust: {
      confidence: 0.95,
      sources: [withSection(NIST_800_53, 'AC-6 - Least Privilege')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
];

// ---------------------------------------------------------------------------
// Telecom Failures (FAIL-TEL-001 ~ FAIL-TEL-008)
// ---------------------------------------------------------------------------

const TELECOM_FAILURES: FailureScenario[] = [
  {
    id: 'FAIL-TEL-001',
    type: 'failure',
    component: 'central-office',
    titleKo: '국사 장애',
    scenarioKo:
      '국사(CO/POP)의 전원 장애, 화재, 수해, 장비 고장 등으로 해당 국사를 경유하는 모든 회선의 서비스가 중단됩니다. 단일 국사를 통해 연결된 모든 고객이 영향을 받으며, 물리적 복구가 필요하여 장시간 서비스 중단이 발생합니다.',
    impact: 'service-down',
    likelihood: 'low',
    affectedComponents: ['dedicated-line', 'pe-router', 'olt', 'base-station'],
    preventionKo: [
      '이중 국사 접속(Dual Homing)으로 단일 국사 장애에 대비합니다',
      '국사 간 링 네트워크를 구성하여 자동 우회 경로를 확보합니다',
      '핵심 고객은 서로 다른 국사에 물리적으로 분리된 회선을 구성합니다',
    ],
    mitigationKo: [
      '이중화된 국사로 트래픽을 자동 전환합니다',
      '통신사에 긴급 장애 신고 및 복구 우선순위를 요청합니다',
      '임시로 모바일(LTE/5G) 백업 회선을 활성화합니다',
    ],
    estimatedMTTR: '4~12시간',
    tags: ['telecom', 'central-office', 'outage', 'physical', 'availability'],
    trust: {
      confidence: 0.85,
      sources: [withSection(MEF_4, 'Metro Ethernet Network Architecture')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-TEL-002',
    type: 'failure',
    component: 'dedicated-line',
    titleKo: '전용회선 절단',
    scenarioKo:
      '건설 공사, 자연재해, 장비 고장 등으로 전용회선이 물리적으로 절단됩니다. 해당 회선을 통한 WAN 통신이 완전히 중단되며, 물리적 복구(광케이블 접속, 장비 교체 등)가 필요합니다.',
    impact: 'service-down',
    likelihood: 'medium',
    affectedComponents: ['customer-premise', 'pe-router', 'central-office'],
    preventionKo: [
      '이중 전용회선을 서로 다른 물리 경로(관로)로 구성합니다',
      '모바일(LTE/5G) 또는 인터넷 기반 백업 회선을 사전 구성합니다',
      '회선 상태 모니터링 및 자동 전환(failover) 장비를 설치합니다',
    ],
    mitigationKo: [
      '백업 회선(이중화 전용회선 또는 인터넷)으로 트래픽을 전환합니다',
      '통신사에 긴급 장애 신고하여 복구 작업을 시작합니다',
      'SD-WAN이 있는 경우 자동으로 대체 경로를 선택합니다',
    ],
    estimatedMTTR: '2~8시간',
    tags: ['telecom', 'dedicated-line', 'cut', 'physical', 'wan'],
    trust: {
      confidence: 0.85,
      sources: [withSection(RFC_4364, 'Section 4 - CE-PE Connection')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-TEL-003',
    type: 'failure',
    component: 'pe-router',
    titleKo: 'PE 라우터 장애',
    scenarioKo:
      'PE(Provider Edge) 라우터의 소프트웨어 버그, 하드웨어 고장, 또는 설정 오류로 인해 해당 PE를 경유하는 모든 VPN/전용회선 서비스가 중단됩니다. 다수의 고객 회선이 동시에 영향을 받습니다.',
    impact: 'service-down',
    likelihood: 'medium',
    affectedComponents: ['dedicated-line', 'vpn-service', 'metro-ethernet', 'central-office'],
    preventionKo: [
      'PE 라우터를 이중화(Active-Standby)로 구성하여 자동 페일오버를 보장합니다',
      '라우터 소프트웨어를 검증된 안정 버전으로 유지합니다',
      '설정 변경 시 변경 관리 프로세스를 적용합니다',
    ],
    mitigationKo: [
      '대기 PE 라우터로 자동 페일오버를 트리거합니다',
      '영향받는 고객 회선을 인접 PE로 임시 이전합니다',
      '라우터 설정을 마지막 정상 백업으로 복원합니다',
    ],
    estimatedMTTR: '1~4시간',
    tags: ['telecom', 'pe-router', 'outage', 'mpls', 'vpn'],
    trust: {
      confidence: 0.95,
      sources: [withSection(RFC_3031, 'Section 2.2 - Label Switching')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-TEL-004',
    type: 'failure',
    component: 'base-station',
    titleKo: '기지국 장애',
    scenarioKo:
      '기지국(gNB/eNB)의 전원 장애, 장비 고장, 또는 백홀 링크 단절로 해당 셀 커버리지 내 모든 무선 단말의 통신이 중단됩니다. 주변 기지국의 커버리지로 일부 보상되지만 품질이 저하됩니다.',
    impact: 'degraded',
    likelihood: 'medium',
    affectedComponents: ['core-network', 'private-5g', 'central-office'],
    preventionKo: [
      '기지국 전원을 UPS/배터리로 이중화합니다',
      '백홀 링크를 이중화(유선+무선 또는 이중 유선)로 구성합니다',
      '셀 간 겹침(overlap)을 충분히 설계하여 단일 기지국 장애 시 주변 셀이 보상합니다',
    ],
    mitigationKo: [
      '주변 기지국의 출력을 높여 커버리지 홀을 최소화합니다',
      '이동식 기지국(COW)을 긴급 배치합니다',
      '백홀 링크를 대체 경로로 복구합니다',
    ],
    estimatedMTTR: '2~6시간',
    tags: ['telecom', 'base-station', '5g', 'radio', 'coverage'],
    trust: {
      confidence: 0.85,
      sources: [withSection(THREEGPP_38401, 'Section 6 - NG-RAN Architecture')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-TEL-005',
    type: 'failure',
    component: 'core-network',
    titleKo: '코어망 장애',
    scenarioKo:
      '모바일 코어 네트워크(5GC/EPC)의 제어 플레인 또는 사용자 플레인 장비 장애로 광범위한 지역의 모바일 서비스가 중단됩니다. AMF, SMF 등 핵심 기능 장애 시 신규 세션 수립이 불가능해집니다.',
    impact: 'service-down',
    likelihood: 'low',
    affectedComponents: ['base-station', 'upf', 'private-5g'],
    preventionKo: [
      '코어 네트워크 기능(NF)을 지리적으로 분산 배치합니다',
      '제어 플레인과 사용자 플레인을 분리(CUPS)하여 독립적 이중화를 구성합니다',
      '코어 NF 상태를 실시간 모니터링하고 자동 페일오버를 설정합니다',
    ],
    mitigationKo: [
      '대기(Standby) 코어 NF로 자동 페일오버를 실행합니다',
      '영향 범위를 특정 지역/서비스로 격리합니다',
      '기존 세션을 유지하면서 신규 세션은 정상 코어로 라우팅합니다',
    ],
    estimatedMTTR: '2~8시간',
    tags: ['telecom', 'core-network', '5g', 'epc', 'control-plane'],
    trust: {
      confidence: 0.85,
      sources: [withSection(THREEGPP_23002, 'Section 4 - Network Architecture')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-TEL-006',
    type: 'failure',
    component: 'upf',
    titleKo: 'UPF 장애',
    scenarioKo:
      'UPF(User Plane Function)의 소프트웨어 오류, 리소스 고갈, 또는 하드웨어 장애로 사용자 데이터 포워딩이 중단됩니다. 해당 UPF를 통과하는 모든 사용자 세션의 데이터 전송이 불가능해집니다.',
    impact: 'service-down',
    likelihood: 'low',
    affectedComponents: ['core-network', 'private-5g', 'idc'],
    preventionKo: [
      'UPF를 Active-Standby 이중화로 구성합니다',
      'UPF 리소스(CPU, 메모리, 세션 수)를 모니터링하고 임계치 경보를 설정합니다',
      '로컬 UPF와 중앙 UPF를 병행 배치하여 장애 영향을 분산합니다',
    ],
    mitigationKo: [
      '대기 UPF로 세션을 전환합니다',
      '영향받는 세션을 다른 UPF 인스턴스로 재할당합니다',
      'UPF를 재시작하고 세션 복구를 수행합니다',
    ],
    estimatedMTTR: '1~2시간',
    tags: ['telecom', 'upf', '5g', 'user-plane', 'data-forwarding'],
    trust: {
      confidence: 0.85,
      sources: [withSection(THREEGPP_23002, 'Section 4 - Network Architecture')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-TEL-007',
    type: 'failure',
    component: 'mpls-network',
    titleKo: 'MPLS 망 장애',
    scenarioKo:
      'MPLS 백본 네트워크의 P 라우터 장애, LDP/RSVP-TE 세션 끊김, 또는 광케이블 절단으로 레이블 스위칭 경로(LSP)가 단절됩니다. 해당 LSP를 사용하는 모든 VPN, 전용회선 서비스가 중단됩니다.',
    impact: 'service-down',
    likelihood: 'low',
    affectedComponents: ['pe-router', 'p-router', 'vpn-service', 'dedicated-line'],
    preventionKo: [
      'MPLS FRR(Fast ReRoute)를 구성하여 50ms 이내 경로 전환을 보장합니다',
      'P 라우터를 이중화하고 다양한 물리 경로를 확보합니다',
      'LDP/RSVP-TE 세션 상태를 모니터링하고 경보를 설정합니다',
    ],
    mitigationKo: [
      'FRR 백업 LSP로 자동 전환을 확인합니다',
      '장애 P 라우터를 우회하는 수동 LSP를 구성합니다',
      '통신사 NOC에 긴급 장애 보고 및 복구를 요청합니다',
    ],
    estimatedMTTR: '2~6시간',
    tags: ['telecom', 'mpls-network', 'lsp', 'backbone', 'p-router'],
    trust: {
      confidence: 0.95,
      sources: [withSection(RFC_3031, 'Section 2.2 - Label Switching')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-TEL-008',
    type: 'failure',
    component: 'ring-network',
    titleKo: '링 네트워크 단절',
    scenarioKo:
      '링 네트워크의 한 구간이 절단되면 트래픽은 자동으로 반대 방향으로 우회합니다. 그러나 두 번째 구간도 동시 장애(double failure)가 발생하면 링이 완전히 분리되어 일부 국사 간 통신이 두절됩니다.',
    impact: 'degraded',
    likelihood: 'medium',
    affectedComponents: ['central-office', 'pe-router', 'dedicated-line'],
    preventionKo: [
      '링 보호 절체(APS: Automatic Protection Switching)를 50ms 이내로 설정합니다',
      '핵심 구간은 이중 링 또는 메시 토폴로지로 구성합니다',
      '링 구간별 광케이블 상태를 실시간 모니터링합니다',
    ],
    mitigationKo: [
      'APS가 정상 동작하여 반대 방향으로 우회하는지 확인합니다',
      '절단 구간의 긴급 복구 작업을 시작합니다',
      '이중 장애 시 임시 직접 연결(점퍼)로 영향 국사를 연결합니다',
    ],
    estimatedMTTR: '50ms~1시간',
    tags: ['telecom', 'ring-network', 'aps', 'protection-switching', 'fiber-cut'],
    trust: {
      confidence: 0.85,
      sources: [withSection(MEF_4, 'Metro Ethernet Network Architecture')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
];

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

/** All failure scenarios, frozen for immutability */
export const FAILURE_SCENARIOS: readonly FailureScenario[] = Object.freeze([
  ...NETWORK_FAILURES,
  ...SECURITY_FAILURES,
  ...COMPUTE_FAILURES,
  ...DATA_FAILURES,
  ...AUTH_FAILURES,
  ...TELECOM_FAILURES,
]);

/** Alias for FAILURE_SCENARIOS */
export const FAILURES = FAILURE_SCENARIOS;

/**
 * Get all failure scenarios that affect a given infrastructure component
 * (either as the primary component or in the affected list).
 */
export function getFailuresForComponent(component: InfraNodeType): FailureScenario[] {
  return FAILURE_SCENARIOS.filter(
    (f) => f.component === component || f.affectedComponents.includes(component),
  );
}

/**
 * Get high-impact failure scenarios — 'service-down' and 'data-loss' only.
 */
export function getHighImpactFailures(): FailureScenario[] {
  return FAILURE_SCENARIOS.filter(
    (f) => f.impact === 'service-down' || f.impact === 'data-loss',
  );
}

/**
 * Get failure scenarios filtered by likelihood level.
 */
export function getFailuresByLikelihood(likelihood: 'high' | 'medium' | 'low'): FailureScenario[] {
  return FAILURE_SCENARIOS.filter((f) => f.likelihood === likelihood);
}
