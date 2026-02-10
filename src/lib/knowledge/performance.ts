/**
 * Infrastructure Performance Profiles
 *
 * 25 performance profiles covering all major infrastructure component types.
 * Each profile provides realistic latency/throughput ranges, scaling strategies,
 * bottleneck indicators, and optimization tips based on industry data.
 *
 * Categories:
 * - PERF-SEC: Security device performance (firewall, WAF, IDS/IPS, VPN, NAC, DLP)
 * - PERF-NET: Network equipment performance (router, switch, LB, SD-WAN, DNS, CDN)
 * - PERF-CMP: Compute/server performance (web, app, DB, container, VM, K8s)
 * - PERF-STR: Storage performance (SAN/NAS, object storage, backup, cache)
 * - PERF-AUTH: Authentication performance (LDAP/AD, SSO, MFA, IAM)
 */

import type { PerformanceProfile } from './types';
import type { InfraNodeType } from '@/types/infra';
import {
  withSection,
  NIST_800_41,
  NIST_800_44,
  NIST_800_53,
  NIST_800_77,
  NIST_800_81,
  NIST_800_94,
  NIST_800_123,
  NIST_800_144,
  NIST_800_145,
  NIST_800_125,
  CIS_V8,
  CIS_V8_12,
  AWS_WAF_PERF,
  AWS_WAF_REL,
  AWS_WAF_SEC,
  AZURE_CAF,
  GCP_ARCH_FRAMEWORK,
  OWASP_TOP10,
  SANS_CIS_TOP20,
  CNCF_SECURITY,
  RFC_3031,
  RFC_4364,
  THREEGPP_38401,
  THREEGPP_23002,
  MEF_4,
  ITU_G984,
  NIST_800_207,
  CIS_V8_13,
} from './sourceRegistry';

// ---------------------------------------------------------------------------
// Security Device Performance — PERF-SEC
// ---------------------------------------------------------------------------

const SECURITY_PROFILES: PerformanceProfile[] = [
  {
    id: 'PERF-SEC-001',
    type: 'performance',
    component: 'firewall',
    nameKo: '방화벽 성능 프로파일',
    latencyRange: { min: 0.1, max: 5, unit: 'ms' },
    throughputRange: { typical: '1~10 Gbps', max: '40 Gbps' },
    scalingStrategy: 'vertical',
    bottleneckIndicators: [
      'Connection table exhaustion (>80% concurrent session limit)',
      'Deep packet inspection CPU saturation above 70%',
      'Logging I/O bottleneck during high traffic bursts',
    ],
    bottleneckIndicatorsKo: [
      '연결 테이블 소진 (동시 세션 한계의 80% 초과)',
      '심층 패킷 검사 CPU 포화도 70% 이상',
      '대량 트래픽 발생 시 로깅 I/O 병목',
    ],
    optimizationTipsKo: [
      '불필요한 규칙 제거 및 규칙 순서 최적화 (자주 매칭되는 규칙을 상위에 배치)',
      'DPI 필요 없는 트래픽에 대해 세션 기반 바이패스 적용',
      '로그 전송을 비동기 syslog/SIEM 연동으로 오프로드',
    ],
    tags: ['security', 'firewall', 'performance', 'throughput'],
    trust: {
      confidence: 0.9,
      sources: [
        withSection(NIST_800_41, 'Section 4.1 - Firewall Performance Considerations'),
        withSection(AWS_WAF_PERF, 'Network Firewall Performance'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-SEC-002',
    type: 'performance',
    component: 'waf',
    nameKo: 'WAF 성능 프로파일',
    latencyRange: { min: 1, max: 10, unit: 'ms' },
    throughputRange: { typical: '1~5 Gbps', max: '20 Gbps' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [
      'Regex rule evaluation CPU spike during complex payload inspection',
      'SSL/TLS termination overhead consuming >60% of capacity',
      'False positive rate increase under high request volume',
    ],
    bottleneckIndicatorsKo: [
      '복잡한 페이로드 검사 시 정규식 규칙 평가 CPU 급증',
      'SSL/TLS 종료 오버헤드가 용량의 60% 이상 소비',
      '높은 요청량에서 오탐지율 증가',
    ],
    optimizationTipsKo: [
      '정규식 규칙 수를 최소화하고 사전 필터링(IP 화이트리스트) 적용',
      'SSL 오프로딩을 별도 로드밸런서로 분리하여 WAF 부담 감소',
      '수평 확장(클러스터링)을 통해 처리량 병렬 분산',
    ],
    tags: ['security', 'waf', 'performance', 'web-application'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(OWASP_TOP10, 'WAF Deployment Best Practices'),
        withSection(AWS_WAF_PERF, 'WAF Rule Optimization'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-SEC-003',
    type: 'performance',
    component: 'ids-ips',
    nameKo: 'IDS/IPS 성능 프로파일',
    latencyRange: { min: 0.5, max: 8, unit: 'ms' },
    throughputRange: { typical: '1~10 Gbps', max: '40 Gbps' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [
      'Signature database size causing memory pressure (>4GB rule sets)',
      'Inline IPS mode packet drop rate exceeding 0.1% under load',
      'Alert storm during DDoS or scanning events saturating management plane',
    ],
    bottleneckIndicatorsKo: [
      '시그니처 데이터베이스 크기로 인한 메모리 압박 (4GB 이상 규칙셋)',
      '인라인 IPS 모드에서 부하 시 패킷 드롭율 0.1% 초과',
      'DDoS 또는 스캐닝 이벤트 시 알림 폭주로 관리 플레인 포화',
    ],
    optimizationTipsKo: [
      '사용하지 않는 시그니처 비활성화 및 환경에 맞는 규칙셋만 로드',
      '트래픽 미러링(TAP) 기반 IDS와 인라인 IPS를 역할 분리하여 운영',
      '이벤트 상관분석을 SIEM으로 오프로드하여 관리 플레인 부하 경감',
    ],
    tags: ['security', 'ids-ips', 'performance', 'intrusion-detection'],
    trust: {
      confidence: 0.9,
      sources: [
        withSection(NIST_800_94, 'Section 5 - IDPS Performance'),
        withSection(SANS_CIS_TOP20, 'Control 13 - Network Monitoring'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-SEC-004',
    type: 'performance',
    component: 'vpn-gateway',
    nameKo: 'VPN 게이트웨이 성능 프로파일',
    latencyRange: { min: 5, max: 50, unit: 'ms' },
    throughputRange: { typical: '500 Mbps~5 Gbps', max: '20 Gbps' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [
      'Encryption/decryption CPU saturation during peak tunnel count',
      'Concurrent tunnel count exceeding hardware crypto accelerator capacity',
    ],
    bottleneckIndicatorsKo: [
      '피크 터널 수에서 암호화/복호화 CPU 포화',
      '동시 터널 수가 하드웨어 암호화 가속기 용량 초과',
    ],
    optimizationTipsKo: [
      'AES-NI 하드웨어 가속 지원 장비 사용으로 암호화 오버헤드 감소',
      'Split tunneling 적용으로 불필요한 트래픽의 VPN 통과 방지',
      '여러 VPN 게이트웨이를 로드밸런서 뒤에 배치하여 수평 확장',
    ],
    tags: ['security', 'vpn', 'performance', 'encryption'],
    trust: {
      confidence: 0.9,
      sources: [
        withSection(NIST_800_77, 'Section 5.3 - IPsec VPN Performance'),
        withSection(AWS_WAF_PERF, 'VPN Connection Performance'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-SEC-005',
    type: 'performance',
    component: 'nac',
    nameKo: 'NAC 성능 프로파일',
    latencyRange: { min: 10, max: 200, unit: 'ms' },
    throughputRange: { typical: '1K~10K auth/s', max: '50K auth/s' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [
      'RADIUS/TACACS+ authentication queue depth exceeding threshold',
      'Posture assessment scan time causing login delays >5 seconds',
    ],
    bottleneckIndicatorsKo: [
      'RADIUS/TACACS+ 인증 대기열 깊이 임계값 초과',
      '포스처 평가 스캔 시간으로 인한 로그인 지연 5초 초과',
    ],
    optimizationTipsKo: [
      '인증 캐싱(토큰 TTL)을 적용하여 반복 인증 요청 감소',
      'NAC 서버를 사이트별로 분산 배치하여 인증 지연 최소화',
    ],
    tags: ['security', 'nac', 'performance', 'authentication'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(NIST_800_53, 'AC-17 - Remote Access'),
        withSection(CIS_V8, 'Control 1 - Inventory and Control of Enterprise Assets'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-SEC-006',
    type: 'performance',
    component: 'dlp',
    nameKo: 'DLP 성능 프로파일',
    latencyRange: { min: 5, max: 100, unit: 'ms' },
    throughputRange: { typical: '500 Mbps~2 Gbps', max: '10 Gbps' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [
      'Content inspection engine CPU saturation during large file transfers',
      'Pattern matching backlog queue growth exceeding buffer limits',
    ],
    bottleneckIndicatorsKo: [
      '대용량 파일 전송 시 콘텐츠 검사 엔진 CPU 포화',
      '패턴 매칭 백로그 대기열이 버퍼 한계 초과',
    ],
    optimizationTipsKo: [
      '파일 유형별 선별 검사(화이트리스트) 적용으로 불필요한 스캔 감소',
      '엔드포인트 DLP와 네트워크 DLP를 계층적으로 분리하여 부하 분산',
    ],
    tags: ['security', 'dlp', 'performance', 'data-protection'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(NIST_800_53, 'SC-7 - Boundary Protection'),
        withSection(SANS_CIS_TOP20, 'Control 3 - Data Protection'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
];

// ---------------------------------------------------------------------------
// Network Equipment Performance — PERF-NET
// ---------------------------------------------------------------------------

const NETWORK_PROFILES: PerformanceProfile[] = [
  {
    id: 'PERF-NET-001',
    type: 'performance',
    component: 'router',
    nameKo: '라우터 성능 프로파일',
    latencyRange: { min: 0.05, max: 2, unit: 'ms' },
    throughputRange: { typical: '10~100 Gbps', max: '400 Gbps' },
    scalingStrategy: 'vertical',
    bottleneckIndicators: [
      'Routing table convergence time exceeding SLA during topology change',
      'Control plane CPU >80% from BGP/OSPF update storms',
    ],
    bottleneckIndicatorsKo: [
      '토폴로지 변경 시 라우팅 테이블 수렴 시간이 SLA 초과',
      'BGP/OSPF 업데이트 폭주로 컨트롤 플레인 CPU 80% 초과',
    ],
    optimizationTipsKo: [
      'ECMP(Equal-Cost Multi-Path) 설정으로 경로 다중화 및 부하 분산',
      'Route summarization 적용으로 라우팅 테이블 크기 감소',
      '하드웨어 ASIC 기반 포워딩 사용으로 소프트웨어 처리 최소화',
    ],
    tags: ['network', 'router', 'performance', 'routing'],
    trust: {
      confidence: 0.9,
      sources: [
        withSection(CIS_V8_12, '12.2 - Secure Network Architecture'),
        withSection(AWS_WAF_PERF, 'Network Performance Optimization'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-NET-002',
    type: 'performance',
    component: 'switch-l2',
    nameKo: 'L2 스위치 성능 프로파일',
    latencyRange: { min: 1, max: 10, unit: 'us' },
    throughputRange: { typical: '10~100 Gbps', max: '400 Gbps' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [
      'MAC address table overflow causing flooding on all ports',
      'Spanning Tree reconvergence causing temporary traffic blackhole',
    ],
    bottleneckIndicatorsKo: [
      'MAC 주소 테이블 오버플로로 인한 전 포트 플러딩',
      'Spanning Tree 재수렴으로 인한 일시적 트래픽 블랙홀',
    ],
    optimizationTipsKo: [
      'VLAN 세분화로 브로드캐스트 도메인 크기를 제한',
      'RSTP(Rapid Spanning Tree) 또는 MSTP 사용으로 수렴 시간 단축',
    ],
    tags: ['network', 'switch', 'performance', 'layer2'],
    trust: {
      confidence: 0.9,
      sources: [
        withSection(CIS_V8_12, '12.2 - Secure Network Architecture'),
        withSection(AWS_WAF_PERF, 'Network Layer Performance'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-NET-003',
    type: 'performance',
    component: 'switch-l3',
    nameKo: 'L3 스위치 성능 프로파일',
    latencyRange: { min: 5, max: 50, unit: 'us' },
    throughputRange: { typical: '10~100 Gbps', max: '400 Gbps' },
    scalingStrategy: 'vertical',
    bottleneckIndicators: [
      'ACL processing overhead increasing latency under complex rule sets',
      'Inter-VLAN routing CPU utilization spike during broadcast storms',
    ],
    bottleneckIndicatorsKo: [
      '복잡한 ACL 규칙셋에서 처리 오버헤드로 지연 증가',
      '브로드캐스트 스톰 시 VLAN 간 라우팅 CPU 사용량 급증',
    ],
    optimizationTipsKo: [
      'ACL 규칙을 TCAM에 적합한 개수로 최적화 (하드웨어 한계 확인)',
      'Storm control 설정으로 브로드캐스트/멀티캐스트 트래픽 제한',
    ],
    tags: ['network', 'switch', 'performance', 'layer3'],
    trust: {
      confidence: 0.9,
      sources: [
        withSection(CIS_V8_12, '12.2 - Secure Network Architecture'),
        withSection(AWS_WAF_PERF, 'Network Performance'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-NET-004',
    type: 'performance',
    component: 'load-balancer',
    nameKo: '로드밸런서 성능 프로파일',
    latencyRange: { min: 0.5, max: 2, unit: 'ms' },
    throughputRange: { typical: '10~50 Gbps', max: '100 Gbps' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [
      'Connection table exhaustion at >1M concurrent connections',
      'SSL/TLS handshake throughput degradation under burst traffic',
      'Health check probe timeout causing premature backend removal',
    ],
    bottleneckIndicatorsKo: [
      '동시 연결 100만 이상에서 연결 테이블 소진',
      '버스트 트래픽에서 SSL/TLS 핸드셰이크 처리량 저하',
      '헬스 체크 프로브 타임아웃으로 백엔드 조기 제거',
    ],
    optimizationTipsKo: [
      'DSR(Direct Server Return) 모드 사용으로 응답 트래픽 바이패스',
      'SSL 세션 재사용(Session Resumption) 활성화로 핸드셰이크 부하 감소',
      '가중치 기반 라운드 로빈으로 백엔드 성능 차이 보상',
    ],
    tags: ['network', 'load-balancer', 'performance', 'throughput'],
    trust: {
      confidence: 0.9,
      sources: [
        withSection(AWS_WAF_PERF, 'Elastic Load Balancing Performance'),
        withSection(AWS_WAF_REL, 'Load Balancing Best Practices'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-NET-005',
    type: 'performance',
    component: 'sd-wan',
    nameKo: 'SD-WAN 성능 프로파일',
    latencyRange: { min: 5, max: 100, unit: 'ms' },
    throughputRange: { typical: '500 Mbps~5 Gbps', max: '20 Gbps' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [
      'Overlay tunnel encryption overhead degrading WAN throughput >15%',
      'Path selection oscillation causing jitter spikes on latency-sensitive traffic',
    ],
    bottleneckIndicatorsKo: [
      '오버레이 터널 암호화 오버헤드로 WAN 처리량 15% 이상 저하',
      '경로 선택 진동으로 지연 민감 트래픽의 지터 급증',
    ],
    optimizationTipsKo: [
      'QoS 정책으로 음성/영상 트래픽 우선순위 보장',
      'WAN 최적화(중복 제거, 압축) 적용으로 유효 대역폭 증가',
      'Breakout 정책으로 클라우드 트래픽을 로컬 인터넷으로 직접 라우팅',
    ],
    tags: ['network', 'sd-wan', 'performance', 'wan-optimization'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(AWS_WAF_PERF, 'Network Performance Optimization'),
        withSection(CIS_V8_12, '12.2 - Secure Network Architecture'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-NET-006',
    type: 'performance',
    component: 'dns',
    nameKo: 'DNS 성능 프로파일',
    latencyRange: { min: 1, max: 50, unit: 'ms' },
    throughputRange: { typical: '10K~100K QPS', max: '1M QPS' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [
      'Cache miss ratio exceeding 40% causing recursive query overload',
      'DNS amplification attack saturating upstream bandwidth',
    ],
    bottleneckIndicatorsKo: [
      '캐시 미스율 40% 초과로 재귀 쿼리 과부하',
      'DNS 증폭 공격으로 업스트림 대역폭 포화',
    ],
    optimizationTipsKo: [
      '캐시 TTL 최적화 및 프리페칭으로 캐시 적중률 향상',
      'Anycast DNS 배포로 지리적 지연 최소화 및 DDoS 내성 강화',
      'DNSSEC 검증을 전용 리졸버에서 수행하여 권한 서버 부하 분리',
    ],
    tags: ['network', 'dns', 'performance', 'resolution'],
    trust: {
      confidence: 0.9,
      sources: [
        withSection(NIST_800_81, 'Section 7 - DNS Performance and Availability'),
        withSection(AWS_WAF_PERF, 'DNS Performance'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-NET-007',
    type: 'performance',
    component: 'cdn',
    nameKo: 'CDN 성능 프로파일',
    latencyRange: { min: 5, max: 50, unit: 'ms' },
    throughputRange: { typical: '10~100 Gbps', max: '1 Tbps' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [
      'Cache hit ratio below 80% causing excessive origin pulls',
      'Edge node saturation in specific geographic regions during events',
    ],
    bottleneckIndicatorsKo: [
      '캐시 적중률 80% 미만으로 오리진 과다 요청 발생',
      '이벤트 기간 특정 지역 엣지 노드 포화',
    ],
    optimizationTipsKo: [
      '캐시 키 정규화 및 Vary 헤더 최적화로 캐시 적중률 향상',
      'Origin Shield(중간 캐시 계층) 활용으로 오리진 부하 감소',
      '정적/동적 콘텐츠 분리 서빙으로 캐시 효율 극대화',
    ],
    tags: ['network', 'cdn', 'performance', 'caching', 'edge'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(AWS_WAF_PERF, 'Content Delivery Performance'),
        withSection(NIST_800_44, 'Section 9 - Web Content Delivery'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
];

// ---------------------------------------------------------------------------
// Compute/Server Performance — PERF-CMP
// ---------------------------------------------------------------------------

const COMPUTE_PROFILES: PerformanceProfile[] = [
  {
    id: 'PERF-CMP-001',
    type: 'performance',
    component: 'web-server',
    nameKo: '웹 서버 성능 프로파일',
    latencyRange: { min: 10, max: 100, unit: 'ms' },
    throughputRange: { typical: '1K~10K req/s', max: '50K req/s' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [
      'Worker/thread pool exhaustion under concurrent connection surge',
      'Static file serving competing with dynamic request processing for I/O',
      'Memory pressure from keep-alive connections exceeding available RAM',
    ],
    bottleneckIndicatorsKo: [
      '동시 연결 급증 시 워커/스레드 풀 소진',
      '정적 파일 서빙이 동적 요청 처리와 I/O 경합',
      'Keep-alive 연결이 가용 RAM 초과하여 메모리 압박',
    ],
    optimizationTipsKo: [
      '정적 파일을 CDN으로 오프로드하여 웹 서버는 동적 요청에 집중',
      '이벤트 기반 서버(Nginx, Node.js)로 C10K 문제 해결',
      'HTTP/2 멀티플렉싱 활성화로 연결 수 감소 및 효율 향상',
    ],
    tags: ['compute', 'web-server', 'performance', 'http'],
    trust: {
      confidence: 0.9,
      sources: [
        withSection(NIST_800_44, 'Section 8 - Web Server Performance'),
        withSection(AWS_WAF_PERF, 'Compute Optimization'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-CMP-002',
    type: 'performance',
    component: 'app-server',
    nameKo: '앱 서버 성능 프로파일',
    latencyRange: { min: 20, max: 200, unit: 'ms' },
    throughputRange: { typical: '500~5K req/s', max: '20K req/s' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [
      'Garbage collection pauses exceeding 100ms (JVM-based servers)',
      'Thread pool starvation from blocking I/O calls to downstream services',
      'Memory leak causing gradual response time degradation over days',
    ],
    bottleneckIndicatorsKo: [
      'GC 일시 정지가 100ms 초과 (JVM 기반 서버)',
      '다운스트림 서비스 블로킹 I/O 호출로 스레드 풀 고갈',
      '메모리 누수로 인한 시간 경과에 따른 응답 시간 점진적 악화',
    ],
    optimizationTipsKo: [
      '비동기 I/O(Reactive) 패턴 적용으로 스레드 효율 향상',
      '커넥션 풀링 및 서킷 브레이커 패턴으로 다운스트림 장애 격리',
      'JVM 힙 크기 및 GC 알고리즘 튜닝 (G1GC 또는 ZGC 사용 권장)',
    ],
    tags: ['compute', 'app-server', 'performance', 'application'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(NIST_800_123, 'Section 5 - Server Performance Management'),
        withSection(AWS_WAF_PERF, 'Application Performance'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-CMP-003',
    type: 'performance',
    component: 'db-server',
    nameKo: '데이터베이스 서버 성능 프로파일',
    latencyRange: { min: 1, max: 50, unit: 'ms' },
    throughputRange: { typical: '5K~50K QPS', max: '200K QPS' },
    scalingStrategy: 'both',
    bottleneckIndicators: [
      'Query execution plan regression causing full table scans',
      'Lock contention on hot rows/tables exceeding wait threshold',
      'Buffer pool hit ratio dropping below 95%',
    ],
    bottleneckIndicatorsKo: [
      '쿼리 실행 계획 퇴보로 인한 전체 테이블 스캔 발생',
      '핫 로우/테이블의 잠금 경합이 대기 임계값 초과',
      '버퍼 풀 적중률 95% 미만으로 하락',
    ],
    optimizationTipsKo: [
      '읽기 복제본(Read Replica) 구성으로 읽기 부하 수평 분산',
      '인덱스 최적화 및 쿼리 플랜 모니터링으로 비효율 쿼리 제거',
      '커넥션 풀링(PgBouncer, ProxySQL) 사용으로 연결 오버헤드 감소',
    ],
    tags: ['compute', 'db-server', 'performance', 'database', 'query'],
    trust: {
      confidence: 0.9,
      sources: [
        withSection(NIST_800_123, 'Section 5 - Server Security and Performance'),
        withSection(AWS_WAF_PERF, 'Database Performance Optimization'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-CMP-004',
    type: 'performance',
    component: 'container',
    nameKo: '컨테이너 성능 프로파일',
    latencyRange: { min: 1, max: 20, unit: 'ms' },
    throughputRange: { typical: '1K~20K req/s', max: '100K req/s' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [
      'Container OOM kills due to memory limit misconfiguration',
      'CPU throttling from aggressive cgroup limits affecting p99 latency',
    ],
    bottleneckIndicatorsKo: [
      '메모리 제한 설정 오류로 인한 컨테이너 OOM Kill 발생',
      'cgroup CPU 제한이 과도하여 p99 지연 영향',
    ],
    optimizationTipsKo: [
      '리소스 요청(request)과 제한(limit)을 실측 기반으로 설정',
      '멀티스테이지 빌드 및 경량 베이스 이미지로 시작 시간 단축',
      'HPA(Horizontal Pod Autoscaler)로 부하 기반 자동 스케일링 구성',
    ],
    tags: ['compute', 'container', 'performance', 'docker'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(CNCF_SECURITY, 'Container Runtime Performance'),
        withSection(NIST_800_125, 'Section 4 - Virtualization Performance'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-CMP-005',
    type: 'performance',
    component: 'vm',
    nameKo: '가상머신 성능 프로파일',
    latencyRange: { min: 5, max: 50, unit: 'ms' },
    throughputRange: { typical: '500~5K req/s', max: '30K req/s' },
    scalingStrategy: 'both',
    bottleneckIndicators: [
      'Hypervisor CPU overcommit ratio >4:1 causing steal time increase',
      'Virtual disk I/O contention on shared storage backend',
    ],
    bottleneckIndicatorsKo: [
      '하이퍼바이저 CPU 오버커밋 비율 4:1 초과로 steal time 증가',
      '공유 스토리지 백엔드에서 가상 디스크 I/O 경합',
    ],
    optimizationTipsKo: [
      'NUMA 인식 VM 배치로 메모리 접근 지연 최소화',
      'SR-IOV 또는 DPDK 사용으로 네트워크 가상화 오버헤드 제거',
      'CPU/메모리 핫 애드 지원 활용으로 무중단 수직 확장',
    ],
    tags: ['compute', 'vm', 'performance', 'virtualization'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(NIST_800_125, 'Section 4 - Full Virtualization Performance'),
        withSection(AWS_WAF_PERF, 'Compute Right-Sizing'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-CMP-006',
    type: 'performance',
    component: 'kubernetes',
    nameKo: 'Kubernetes 클러스터 성능 프로파일',
    latencyRange: { min: 2, max: 30, unit: 'ms' },
    throughputRange: { typical: '5K~50K req/s', max: '500K req/s' },
    scalingStrategy: 'both',
    bottleneckIndicators: [
      'etcd latency exceeding 100ms causing API server slowdown',
      'kube-proxy iptables rule count >5000 degrading service routing',
      'Pod scheduling latency >10s due to resource fragmentation',
    ],
    bottleneckIndicatorsKo: [
      'etcd 지연이 100ms 초과하여 API 서버 성능 저하',
      'kube-proxy iptables 규칙 수 5000건 초과로 서비스 라우팅 성능 저하',
      '리소스 단편화로 Pod 스케줄링 지연 10초 초과',
    ],
    optimizationTipsKo: [
      'etcd 전용 SSD 디스크 사용 및 주기적 디프래그먼테이션 실행',
      'IPVS 모드 전환으로 대규모 서비스 라우팅 성능 향상',
      'Pod Disruption Budget 및 Priority Class 설정으로 스케줄링 최적화',
    ],
    tags: ['compute', 'kubernetes', 'performance', 'orchestration'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(CNCF_SECURITY, 'Kubernetes Cluster Performance'),
        withSection(AWS_WAF_PERF, 'Container Orchestration Performance'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
];

// ---------------------------------------------------------------------------
// Storage Performance — PERF-STR
// ---------------------------------------------------------------------------

const STORAGE_PROFILES: PerformanceProfile[] = [
  {
    id: 'PERF-STR-001',
    type: 'performance',
    component: 'san-nas',
    nameKo: 'SAN/NAS 스토리지 성능 프로파일',
    latencyRange: { min: 0.1, max: 5, unit: 'ms' },
    throughputRange: { typical: '1~10 GB/s', max: '50 GB/s' },
    scalingStrategy: 'both',
    bottleneckIndicators: [
      'Storage array queue depth saturation causing I/O wait spike',
      'FC/iSCSI fabric congestion during backup window overlap',
    ],
    bottleneckIndicatorsKo: [
      '스토리지 어레이 큐 깊이 포화로 I/O 대기 급증',
      '백업 윈도우 겹침 시 FC/iSCSI 패브릭 혼잡',
    ],
    optimizationTipsKo: [
      'SSD 티어링(자동 계층화)으로 핫 데이터 고속 디스크 배치',
      '멀티패스 I/O 설정으로 경로 이중화 및 대역폭 집계',
      '백업 스케줄을 업무 시간 외로 분리하여 I/O 경합 방지',
    ],
    tags: ['storage', 'san-nas', 'performance', 'block-storage'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(AWS_WAF_PERF, 'Storage Performance Optimization'),
        withSection(NIST_800_123, 'Section 5 - Storage Performance'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-STR-002',
    type: 'performance',
    component: 'object-storage',
    nameKo: '오브젝트 스토리지 성능 프로파일',
    latencyRange: { min: 10, max: 200, unit: 'ms' },
    throughputRange: { typical: '1~10 GB/s', max: '100 GB/s' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [
      'Small object overhead (high PUT/GET per-request latency for <1KB objects)',
      'Listing operations on buckets with >100K objects causing timeout',
    ],
    bottleneckIndicatorsKo: [
      '소형 객체 오버헤드 (1KB 미만 객체의 높은 PUT/GET 요청 지연)',
      '10만 개 이상 객체 버킷의 목록 조회 타임아웃',
    ],
    optimizationTipsKo: [
      '소형 파일을 묶어서(batching) 전송하거나 압축하여 요청 수 감소',
      '접두사(prefix) 기반 파티셔닝으로 목록 조회 성능 향상',
      '멀티파트 업로드 사용으로 대용량 파일 전송 병렬화',
    ],
    tags: ['storage', 'object-storage', 'performance', 's3'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(AWS_WAF_PERF, 'Object Storage Performance'),
        withSection(NIST_800_144, 'Section 4 - Cloud Storage Performance'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-STR-003',
    type: 'performance',
    component: 'backup',
    nameKo: '백업 시스템 성능 프로파일',
    latencyRange: { min: 50, max: 500, unit: 'ms' },
    throughputRange: { typical: '500 MB/s~5 GB/s', max: '20 GB/s' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [
      'Backup window overrun exceeding RPO/RTO requirements',
      'Deduplication index size exceeding available memory causing disk spillover',
    ],
    bottleneckIndicatorsKo: [
      '백업 윈도우 초과로 RPO/RTO 요구사항 미충족',
      '중복제거 인덱스 크기가 가용 메모리 초과하여 디스크 스필오버',
    ],
    optimizationTipsKo: [
      '증분/차등 백업 전략으로 전체 백업 빈도 감소',
      '소스 측 중복제거로 네트워크 전송량 감소',
      '백업 대상별 병렬 스트림 수를 조절하여 네트워크/스토리지 경합 방지',
    ],
    tags: ['storage', 'backup', 'performance', 'data-protection'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(NIST_800_123, 'Section 5 - Backup and Recovery'),
        withSection(AWS_WAF_REL, 'Backup and Recovery Best Practices'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-STR-004',
    type: 'performance',
    component: 'cache',
    nameKo: '캐시(Redis/Memcached) 성능 프로파일',
    latencyRange: { min: 50, max: 500, unit: 'us' },
    throughputRange: { typical: '100K~500K ops/s', max: '1M ops/s' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [
      'Key eviction rate spike indicating memory pressure',
      'Slow log entries from O(N) commands (KEYS, SORT) blocking event loop',
      'Hot key concentration causing single-shard overload in cluster mode',
    ],
    bottleneckIndicatorsKo: [
      '키 제거율 급증은 메모리 압박을 의미',
      'O(N) 명령(KEYS, SORT)이 이벤트 루프를 차단하여 느린 로그 발생',
      '핫 키 집중으로 클러스터 모드에서 단일 샤드 과부하',
    ],
    optimizationTipsKo: [
      'maxmemory-policy를 allkeys-lru로 설정하여 메모리 관리 자동화',
      'SCAN 명령으로 KEYS 대체, 파이프라인으로 라운드트립 감소',
      'Redis Cluster 사용 시 해시태그로 관련 키를 같은 샤드에 배치',
    ],
    tags: ['storage', 'cache', 'performance', 'redis', 'in-memory'],
    trust: {
      confidence: 0.9,
      sources: [
        withSection(AWS_WAF_PERF, 'In-Memory Caching Performance'),
        withSection(AWS_WAF_REL, 'Caching Best Practices'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
];

// ---------------------------------------------------------------------------
// Authentication Performance — PERF-AUTH
// ---------------------------------------------------------------------------

const AUTH_PROFILES: PerformanceProfile[] = [
  {
    id: 'PERF-AUTH-001',
    type: 'performance',
    component: 'ldap-ad',
    nameKo: 'LDAP/Active Directory 성능 프로파일',
    latencyRange: { min: 5, max: 100, unit: 'ms' },
    throughputRange: { typical: '1K~10K auth/s', max: '50K auth/s' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [
      'LDAP search response time >200ms on large directory trees (>100K entries)',
      'Replication lag between domain controllers exceeding 30 seconds',
    ],
    bottleneckIndicatorsKo: [
      '대규모 디렉토리 트리(10만 항목 이상)에서 LDAP 검색 응답 시간 200ms 초과',
      '도메인 컨트롤러 간 복제 지연 30초 초과',
    ],
    optimizationTipsKo: [
      '인덱싱되지 않은 속성에 대한 검색 필터 제거 및 인덱스 추가',
      '사이트별 도메인 컨트롤러 배치로 인증 지연 최소화',
      'LDAP 커넥션 풀링 사용으로 바인드/언바인드 오버헤드 감소',
    ],
    tags: ['auth', 'ldap', 'active-directory', 'performance'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(NIST_800_53, 'IA-2 - Identification and Authentication'),
        withSection(AWS_WAF_SEC, 'Identity Management'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-AUTH-002',
    type: 'performance',
    component: 'sso',
    nameKo: 'SSO 성능 프로파일',
    latencyRange: { min: 50, max: 500, unit: 'ms' },
    throughputRange: { typical: '500~5K auth/s', max: '20K auth/s' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [
      'Token validation latency exceeding 100ms due to JWKS endpoint delay',
      'Session store (database/Redis) becoming bottleneck during login surges',
    ],
    bottleneckIndicatorsKo: [
      'JWKS 엔드포인트 지연으로 토큰 검증 지연 100ms 초과',
      '로그인 급증 시 세션 스토어(DB/Redis) 병목 발생',
    ],
    optimizationTipsKo: [
      'JWKS 공개키 로컬 캐싱으로 토큰 검증 지연 제거',
      'Stateless JWT 토큰 사용으로 세션 스토어 의존성 제거',
      'SSO 서버 인스턴스를 수평 확장하고 세션 공유를 Redis 클러스터로 처리',
    ],
    tags: ['auth', 'sso', 'performance', 'token'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(NIST_800_53, 'IA-8 - Identification and Authentication (Non-Organizational Users)'),
        withSection(AWS_WAF_PERF, 'Authentication Performance'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-AUTH-003',
    type: 'performance',
    component: 'mfa',
    nameKo: 'MFA 성능 프로파일',
    latencyRange: { min: 100, max: 3000, unit: 'ms' },
    throughputRange: { typical: '100~1K auth/s', max: '10K auth/s' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [
      'SMS/push notification delivery delay exceeding 10 seconds',
      'TOTP time synchronization drift causing false rejections',
    ],
    bottleneckIndicatorsKo: [
      'SMS/푸시 알림 전달 지연 10초 초과',
      'TOTP 시간 동기화 오차로 인한 오거부 발생',
    ],
    optimizationTipsKo: [
      'FIDO2/WebAuthn 기반 하드웨어 키로 네트워크 의존성 제거 및 즉시 인증',
      '대체 MFA 채널(SMS 대신 앱 기반 TOTP)로 전달 지연 감소',
      'MFA 캐싱(신뢰 디바이스 등록)으로 반복 인증 빈도 감소',
    ],
    tags: ['auth', 'mfa', 'performance', 'multi-factor'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(NIST_800_53, 'IA-2(1) - Multi-Factor Authentication'),
        withSection(AWS_WAF_SEC, 'Multi-Factor Authentication'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-AUTH-004',
    type: 'performance',
    component: 'iam',
    nameKo: 'IAM 성능 프로파일',
    latencyRange: { min: 10, max: 200, unit: 'ms' },
    throughputRange: { typical: '1K~10K eval/s', max: '100K eval/s' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [
      'Policy evaluation time exceeding 50ms with >500 attached policies',
      'Role assumption chain depth causing cascading latency',
    ],
    bottleneckIndicatorsKo: [
      '500개 이상 연결 정책에서 정책 평가 시간 50ms 초과',
      '역할 위임 체인 깊이로 인한 지연 연쇄',
    ],
    optimizationTipsKo: [
      '정책 수를 최소화하고 관리형 정책 대신 인라인 정책 사용 지양',
      '권한 경계(Permission Boundary) 사용으로 정책 평가 범위 축소',
      'IAM 결과를 로컬 캐싱하여 반복 평가 지연 제거',
    ],
    tags: ['auth', 'iam', 'performance', 'policy-evaluation'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(NIST_800_53, 'AC-2 - Account Management'),
        withSection(AWS_WAF_SEC, 'IAM Best Practices'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
];

// ---------------------------------------------------------------------------
// Telecom Performance — PERF-TEL
// ---------------------------------------------------------------------------

const TELECOM_PROFILES: PerformanceProfile[] = [
  {
    id: 'PERF-TEL-001',
    type: 'performance',
    component: 'dedicated-line',
    nameKo: '전용회선 성능 프로파일',
    latencyRange: { min: 1, max: 5, unit: 'ms' },
    throughputRange: { typical: '100 Mbps~10 Gbps', max: '100 Gbps' },
    scalingStrategy: 'vertical',
    bottleneckIndicators: [
      'Bandwidth utilization exceeding 80% causing queueing delay',
      'Physical layer errors (CRC, frame errors) indicating cable degradation',
    ],
    bottleneckIndicatorsKo: [
      '대역폭 사용률 80% 초과로 인한 큐잉 지연 발생',
      '물리 계층 오류(CRC, 프레임 오류)로 케이블 열화 징후',
    ],
    optimizationTipsKo: [
      'QoS 정책을 적용하여 핵심 트래픽 우선순위를 보장',
      '대역폭 부족 시 회선 증속 또는 Link Aggregation 적용',
      '정기적인 회선 품질 측정으로 열화를 사전 감지',
    ],
    tags: ['telecom', 'dedicated-line', 'performance', 'wan'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(RFC_4364, 'Section 4 - CE-PE Connection'),
        withSection(MEF_4, 'Metro Ethernet Network Architecture'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-TEL-002',
    type: 'performance',
    component: 'pe-router',
    nameKo: 'PE 라우터 성능 프로파일',
    latencyRange: { min: 0.1, max: 1, unit: 'ms' },
    throughputRange: { typical: '10~100 Gbps', max: '400 Gbps' },
    scalingStrategy: 'vertical',
    bottleneckIndicators: [
      'VRF table size causing control plane CPU >70% during route updates',
      'MPLS label stack depth exceeding hardware forwarding capacity',
      'BGP session flapping from excessive route advertisements',
    ],
    bottleneckIndicatorsKo: [
      'VRF 테이블 크기로 경로 업데이트 시 컨트롤 플레인 CPU 70% 초과',
      'MPLS 레이블 스택 깊이가 하드웨어 포워딩 용량 초과',
      '과도한 경로 광고로 인한 BGP 세션 플래핑',
    ],
    optimizationTipsKo: [
      'Route reflector를 사용하여 BGP 피어링 수를 줄이고 컨트롤 플레인 부하 감소',
      'VRF별 경로 제한(maximum routes)을 설정하여 테이블 폭증 방지',
      '하드웨어 ASIC 기반 MPLS 포워딩을 사용하여 소프트웨어 처리 최소화',
    ],
    tags: ['telecom', 'pe-router', 'performance', 'mpls', 'bgp'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(RFC_4364, 'Section 4.3 - VRF'),
        withSection(RFC_3031, 'Section 2.2 - Label Switching'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-TEL-003',
    type: 'performance',
    component: 'p-router',
    nameKo: 'P 라우터 성능 프로파일',
    latencyRange: { min: 0.05, max: 0.5, unit: 'ms' },
    throughputRange: { typical: '100 Gbps~1 Tbps', max: '10 Tbps' },
    scalingStrategy: 'vertical',
    bottleneckIndicators: [
      'Line card buffer overflow during micro-burst traffic patterns',
      'ECMP hash imbalance causing uneven link utilization across backbone paths',
    ],
    bottleneckIndicatorsKo: [
      '마이크로 버스트 트래픽 패턴에서 라인 카드 버퍼 오버플로',
      'ECMP 해시 불균형으로 백본 경로 간 링크 사용률 불균등',
    ],
    optimizationTipsKo: [
      '대용량 버퍼 라인 카드(Deep Buffer)를 사용하여 마이크로 버스트 흡수',
      'ECMP 해시 알고리즘을 5-tuple 기반으로 최적화하여 부하 균등 분산',
      'Segment Routing(SR) 도입으로 LDP 대비 라벨 관리 단순화',
    ],
    tags: ['telecom', 'p-router', 'performance', 'mpls', 'backbone'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(RFC_3031, 'Section 2.2 - Label Switching'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-TEL-004',
    type: 'performance',
    component: 'base-station',
    nameKo: '기지국 성능 프로파일',
    latencyRange: { min: 1, max: 10, unit: 'ms' },
    throughputRange: { typical: '1~20 Gbps', max: '100 Gbps' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [
      'Cell throughput degradation when connected UE count exceeds capacity',
      'Interference from adjacent cells reducing SINR below acceptable threshold',
      'Backhaul bandwidth insufficient for fronthaul traffic during peak hours',
    ],
    bottleneckIndicatorsKo: [
      '접속 단말 수가 용량 초과 시 셀 처리량 저하',
      '인접 셀 간섭으로 SINR이 허용 임계값 이하로 감소',
      '피크 시간 프론트홀 트래픽에 비해 백홀 대역폭 부족',
    ],
    optimizationTipsKo: [
      '셀 분할(Cell Split)로 셀당 단말 수를 줄이고 용량 증대',
      'Massive MIMO 및 빔포밍 기술 적용으로 주파수 효율 향상',
      '백홀 링크를 10GE 이상으로 증속하여 프론트홀 트래픽 수용',
    ],
    tags: ['telecom', 'base-station', 'performance', '5g', 'radio'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(THREEGPP_38401, 'Section 6 - NG-RAN Architecture'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-TEL-005',
    type: 'performance',
    component: 'central-office',
    nameKo: '국사 성능 프로파일',
    latencyRange: { min: 0.5, max: 2, unit: 'ms' },
    throughputRange: { typical: '100 Gbps+', max: '10 Tbps' },
    scalingStrategy: 'vertical',
    bottleneckIndicators: [
      'Cross-connect capacity exhaustion limiting new circuit provisioning',
      'Power/cooling capacity constraining equipment expansion',
    ],
    bottleneckIndicatorsKo: [
      '교차 연결(Cross-connect) 용량 소진으로 신규 회선 프로비저닝 제한',
      '전력/냉각 용량 제약으로 장비 확장 불가',
    ],
    optimizationTipsKo: [
      'ODF(광 분배 프레임) 관리를 자동화하여 교차 연결 효율 향상',
      '고밀도 장비로 교체하여 물리 공간 대비 용량 극대화',
      '전력 효율 높은 장비 도입으로 전력/냉각 제약 완화',
    ],
    tags: ['telecom', 'central-office', 'performance', 'facility'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(MEF_4, 'Metro Ethernet Network Architecture'),
        withSection(ITU_G984, 'GPON Architecture'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-TEL-006',
    type: 'performance',
    component: 'upf',
    nameKo: 'UPF 성능 프로파일',
    latencyRange: { min: 0.1, max: 1, unit: 'ms' },
    throughputRange: { typical: '10~100 Gbps', max: '400 Gbps' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [
      'PDU session count exceeding per-UPF capacity causing session setup failures',
      'GTP-U tunnel encapsulation/decapsulation CPU saturation',
    ],
    bottleneckIndicatorsKo: [
      'PDU 세션 수가 UPF당 용량 초과로 세션 수립 실패 발생',
      'GTP-U 터널 캡슐화/역캡슐화 CPU 포화',
    ],
    optimizationTipsKo: [
      'UPF 인스턴스를 수평 확장하고 SMF에서 부하 분산',
      'DPDK/SR-IOV 사용으로 패킷 처리 가속',
      'UL CL(Uplink Classifier) 기반 로컬 브레이크아웃으로 코어 트래픽 감소',
    ],
    tags: ['telecom', 'upf', 'performance', '5g', 'user-plane'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(THREEGPP_23002, 'Section 4 - Network Architecture'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-TEL-007',
    type: 'performance',
    component: 'core-network',
    nameKo: '코어 네트워크 성능 프로파일',
    latencyRange: { min: 1, max: 5, unit: 'ms' },
    throughputRange: { typical: '100 Gbps+', max: '1 Tbps' },
    scalingStrategy: 'both',
    bottleneckIndicators: [
      'AMF/SMF processing delay exceeding 50ms during session storm events',
      'NRF service discovery latency impacting inter-NF communication',
      'Database backend (UDR) query latency increasing under subscriber load',
    ],
    bottleneckIndicatorsKo: [
      '세션 폭증 이벤트 시 AMF/SMF 처리 지연 50ms 초과',
      'NRF 서비스 디스커버리 지연으로 NF 간 통신 영향',
      '가입자 부하에서 데이터베이스 백엔드(UDR) 쿼리 지연 증가',
    ],
    optimizationTipsKo: [
      '코어 NF를 클라우드 네이티브(CNF)로 구성하여 탄력적 확장',
      'NRF 캐싱을 적용하여 서비스 디스커버리 지연 제거',
      'UDR을 인메모리 데이터베이스로 구성하여 쿼리 지연 최소화',
    ],
    tags: ['telecom', 'core-network', 'performance', '5g', 'control-plane'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(THREEGPP_23002, 'Section 4 - Network Architecture'),
        withSection(THREEGPP_38401, 'Section 6 - NG-RAN Architecture'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
  {
    id: 'PERF-TEL-008',
    type: 'performance',
    component: 'mpls-network',
    nameKo: 'MPLS 네트워크 성능 프로파일',
    latencyRange: { min: 2, max: 10, unit: 'ms' },
    throughputRange: { typical: '100 Gbps+', max: '10 Tbps' },
    scalingStrategy: 'vertical',
    bottleneckIndicators: [
      'LSP path calculation overhead during topology change events',
      'Label space exhaustion on high-density PE routers (>100K labels)',
      'Traffic engineering tunnel sub-optimal path selection after link failure',
    ],
    bottleneckIndicatorsKo: [
      '토폴로지 변경 이벤트 시 LSP 경로 계산 오버헤드',
      '고밀도 PE 라우터에서 레이블 공간 고갈 (10만 레이블 초과)',
      '링크 장애 후 트래픽 엔지니어링 터널의 비최적 경로 선택',
    ],
    optimizationTipsKo: [
      'Segment Routing 도입으로 LDP 대비 상태 관리 부하를 대폭 감소',
      'TE 터널에 CSPF(Constrained SPF)를 적용하여 최적 경로 유지',
      'FRR(Fast ReRoute)를 모든 LSP에 설정하여 50ms 이내 경로 전환 보장',
    ],
    tags: ['telecom', 'mpls-network', 'performance', 'backbone', 'lsp'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(RFC_3031, 'Section 2.2 - Label Switching'),
        withSection(RFC_4364, 'Section 2 - BGP/MPLS VPN'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-09',
    },
  },
];

// ---------------------------------------------------------------------------
// Cloud Performance Profiles — PERF-CLD
// ---------------------------------------------------------------------------

const CLOUD_PROFILES: PerformanceProfile[] = [
  {
    id: 'PERF-CLD-001',
    type: 'performance',
    component: 'aws-vpc',
    nameKo: 'AWS VPC 성능 프로파일',
    latencyRange: { min: 0.5, max: 5, unit: 'ms' },
    throughputRange: { typical: '10~25 Gbps', max: '100 Gbps' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [
      'NAT Gateway throughput limits under high outbound traffic',
      'VPC peering bandwidth saturation between regions',
      'Security group rule evaluation overhead with 200+ rules',
    ],
    bottleneckIndicatorsKo: [
      '높은 아웃바운드 트래픽 시 NAT 게이트웨이 처리량 한계',
      '리전 간 VPC 피어링 대역폭 포화',
      '200개 이상 보안 그룹 규칙 평가 오버헤드',
    ],
    optimizationTipsKo: [
      '각 AZ에 NAT 게이트웨이를 분산 배치하여 처리량을 분산합니다',
      'AWS PrivateLink를 사용하여 VPC 피어링 대역폭 부하를 줄입니다',
      '보안 그룹 규칙을 최적화하고 프리픽스 리스트를 활용합니다',
    ],
    tags: ['cloud', 'aws', 'vpc', 'performance'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(AWS_WAF_PERF, 'VPC Networking Performance'),
        withSection(NIST_800_145, 'Cloud Computing Characteristics'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'PERF-CLD-002',
    type: 'performance',
    component: 'azure-vnet',
    nameKo: 'Azure VNet 성능 프로파일',
    latencyRange: { min: 0.5, max: 5, unit: 'ms' },
    throughputRange: { typical: '10~30 Gbps', max: '100 Gbps' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [
      'Azure Firewall throughput limits during TLS inspection',
      'VNet gateway SKU bandwidth cap for hybrid connectivity',
      'NSG flow log processing delay under high traffic volume',
    ],
    bottleneckIndicatorsKo: [
      'TLS 검사 시 Azure Firewall 처리량 한계',
      '하이브리드 연결 시 VNet 게이트웨이 SKU 대역폭 상한',
      '고트래픽 시 NSG 흐름 로그 처리 지연',
    ],
    optimizationTipsKo: [
      'Azure Firewall Premium SKU로 업그레이드하여 처리량을 확보합니다',
      'ExpressRoute를 VPN 대신 사용하여 일관된 대역폭을 확보합니다',
      'NSG 규칙을 간소화하고 ASG(Application Security Group)를 활용합니다',
    ],
    tags: ['cloud', 'azure', 'vnet', 'performance'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(AZURE_CAF, 'Performance - Network Optimization'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'PERF-CLD-003',
    type: 'performance',
    component: 'gcp-network',
    nameKo: 'GCP Network 성능 프로파일',
    latencyRange: { min: 0.3, max: 3, unit: 'ms' },
    throughputRange: { typical: '10~32 Gbps', max: '100 Gbps' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [
      'Cloud NAT port allocation exhaustion for high-connection workloads',
      'Shared VPC cross-project routing complexity increasing latency',
      'Firewall rule evaluation overhead in large-scale deployments',
    ],
    bottleneckIndicatorsKo: [
      '고연결 워크로드에서 Cloud NAT 포트 할당 고갈',
      '공유 VPC 교차 프로젝트 라우팅 복잡성으로 인한 지연 증가',
      '대규모 배포에서 방화벽 규칙 평가 오버헤드',
    ],
    optimizationTipsKo: [
      'Cloud NAT의 최소 포트 수를 워크로드에 맞게 조정합니다',
      'VPC 서비스 컨트롤을 사용하여 보안과 성능을 동시에 최적화합니다',
      '계층적 방화벽 정책을 사용하여 규칙 평가를 최적화합니다',
    ],
    tags: ['cloud', 'gcp', 'network', 'performance'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(GCP_ARCH_FRAMEWORK, 'Performance - Network'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'PERF-CLD-004',
    type: 'performance',
    component: 'private-cloud',
    nameKo: '프라이빗 클라우드 성능 프로파일',
    latencyRange: { min: 0.1, max: 2, unit: 'ms' },
    throughputRange: { typical: '10~40 Gbps', max: '100 Gbps' },
    scalingStrategy: 'both',
    bottleneckIndicators: [
      'Hypervisor CPU overcommit ratio exceeding 4:1 causing contention',
      'Storage I/O saturation under mixed read/write workloads',
      'Internal network bandwidth saturation during VM live migration',
    ],
    bottleneckIndicatorsKo: [
      '하이퍼바이저 CPU 오버커밋 비율 4:1 초과로 인한 경합',
      '혼합 읽기/쓰기 워크로드에서 스토리지 I/O 포화',
      'VM 라이브 마이그레이션 중 내부 네트워크 대역폭 포화',
    ],
    optimizationTipsKo: [
      'CPU 오버커밋 비율을 워크로드 특성에 맞게 조정합니다 (일반 3:1, 고성능 1:1)',
      '올플래시 스토리지로 I/O 성능을 확보하고 스토리지 QoS를 적용합니다',
      '라이브 마이그레이션 전용 네트워크를 분리합니다',
    ],
    tags: ['cloud', 'private-cloud', 'performance', 'hypervisor'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(NIST_800_125, 'Section 4 - Virtualization Performance'),
        withSection(NIST_800_144, 'Section 3 - Cloud Computing Characteristics'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
];

// ---------------------------------------------------------------------------
// SASE/SOC Performance — PERF-SASE
// ---------------------------------------------------------------------------

const SASE_PROFILES: PerformanceProfile[] = [
  {
    id: 'PERF-SASE-001',
    type: 'performance',
    component: 'sase-gateway' as InfraNodeType,
    nameKo: 'SASE 게이트웨이 성능 프로파일',
    latencyRange: { min: 5, max: 50, unit: 'ms' },
    throughputRange: { typical: '1~10 Gbps', max: '100 Gbps (global aggregate)' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [
      'SSL/TLS inspection throughput saturation',
      'PoP capacity utilization above 80%',
      'Increased latency from distant PoP routing',
    ],
    bottleneckIndicatorsKo: [
      'SSL/TLS 검사 처리량 포화',
      'PoP 용량 사용률 80% 초과',
      '원거리 PoP 라우팅으로 인한 지연 증가',
    ],
    optimizationTipsKo: [
      '지역별 PoP 활용으로 최근접 접속점 확보',
      'SSL 검사 예외 규칙으로 신뢰 트래픽 바이패스',
      'SD-WAN QoS 정책으로 중요 트래픽 우선 처리',
    ],
    tags: ['sase', 'gateway', 'ssl-inspection', 'pop'],
    trust: {
      confidence: 0.85,
      sources: [withSection(NIST_800_207, 'Section 4 - Deployment Models')],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'PERF-SASE-002',
    type: 'performance',
    component: 'siem' as InfraNodeType,
    nameKo: 'SIEM 성능 프로파일',
    latencyRange: { min: 100, max: 5000, unit: 'ms' },
    throughputRange: { typical: '10K~100K EPS', max: '1M EPS (enterprise)' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [
      'Log ingestion queue depth increasing',
      'Search/query response time exceeding 30 seconds',
      'Storage IOPS saturation',
      'Correlation rule processing lag',
    ],
    bottleneckIndicatorsKo: [
      '로그 수집 큐 깊이 증가',
      '검색/쿼리 응답 시간 30초 초과',
      '스토리지 IOPS 포화',
      '상관분석 규칙 처리 지연',
    ],
    optimizationTipsKo: [
      '핫/웜/콜드 스토리지 티어링으로 비용 최적화',
      '로그 사전 필터링으로 불필요한 이벤트 제거',
      '인덱싱 전략 최적화로 검색 성능 개선',
      '상관분석 규칙 주기적 튜닝으로 False Positive 감소',
    ],
    tags: ['siem', 'log-ingestion', 'correlation', 'monitoring'],
    trust: {
      confidence: 0.85,
      sources: [withSection(CIS_V8_13, 'Network Monitoring and Defense')],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'PERF-SASE-003',
    type: 'performance',
    component: 'soar' as InfraNodeType,
    nameKo: 'SOAR 성능 프로파일',
    latencyRange: { min: 500, max: 30000, unit: 'ms' },
    throughputRange: { typical: '100~1K playbook runs/hour', max: '10K playbook runs/hour' },
    scalingStrategy: 'vertical',
    bottleneckIndicators: [
      'Playbook execution queue backlog',
      'API rate limits from integrated tools',
      'Memory exhaustion from parallel playbook runs',
    ],
    bottleneckIndicatorsKo: [
      '플레이북 실행 큐 백로그',
      '연동 도구의 API 속도 제한',
      '병렬 플레이북 실행으로 인한 메모리 고갈',
    ],
    optimizationTipsKo: [
      '플레이북 동시 실행 수 제한으로 리소스 보호',
      '외부 도구 API 호출 캐싱 및 배치 처리',
      '단순 반복 플레이북과 복잡 조사 플레이북 분리 운영',
    ],
    tags: ['soar', 'playbook', 'automation', 'incident-response'],
    trust: {
      confidence: 0.80,
      sources: [withSection(NIST_800_53, 'IR-4 - Incident Handling')],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
];

// ---------------------------------------------------------------------------
// Aggregated export
// ---------------------------------------------------------------------------

export const PERFORMANCE_PROFILES: readonly PerformanceProfile[] = Object.freeze([
  ...SECURITY_PROFILES,
  ...NETWORK_PROFILES,
  ...COMPUTE_PROFILES,
  ...STORAGE_PROFILES,
  ...AUTH_PROFILES,
  ...TELECOM_PROFILES,
  ...CLOUD_PROFILES,
  ...SASE_PROFILES,
]);

/** Alias for convenience */
export const PROFILES = PERFORMANCE_PROFILES;

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

/**
 * Get the performance profile for a specific infrastructure component.
 * Returns undefined if no profile exists for the given component type.
 */
export function getProfileForComponent(component: InfraNodeType): PerformanceProfile | undefined {
  return PERFORMANCE_PROFILES.find(p => p.component === component);
}

/**
 * Get all performance profiles that use a given scaling strategy.
 */
export function getProfilesByScaling(
  strategy: 'horizontal' | 'vertical' | 'both',
): PerformanceProfile[] {
  return PERFORMANCE_PROFILES.filter(p => p.scalingStrategy === strategy);
}
