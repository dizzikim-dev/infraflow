/**
 * Architecture Patterns - Infrastructure design patterns with detection logic
 *
 * 18 verified architecture patterns organized by category:
 * - PAT-001 ~ PAT-005: Basic Patterns (foundational architectures)
 * - PAT-006 ~ PAT-010: Extended Patterns (advanced architectures)
 * - PAT-011 ~ PAT-015: Security Patterns (defense-focused)
 * - PAT-016 ~ PAT-018: Cloud Patterns (cloud & hybrid)
 *
 * Each pattern carries trust metadata with real source citations
 * and includes detection logic for matching against InfraSpec.
 */

import type { InfraSpec } from '@/types/infra';
import type { ArchitecturePattern } from './types';
import {
  NIST_800_41,
  NIST_800_44,
  NIST_800_53,
  NIST_800_63B,
  NIST_800_77,
  NIST_800_94,
  NIST_800_123,
  NIST_800_144,
  NIST_800_145,
  NIST_800_125,
  NIST_800_207,
  RFC_7230,
  RFC_7540,
  RFC_3031,
  RFC_4364,
  CIS_V8,
  CIS_V8_12,
  CIS_V8_13,
  CIS_KUBERNETES,
  OWASP_TOP10,
  OWASP_API_TOP10,
  AWS_WAF_REL,
  AWS_WAF_SEC,
  AWS_WAF_PERF,
  AZURE_CAF,
  GCP_ARCH_FRAMEWORK,
  K8S_DOCS,
  CNCF_SECURITY,
  SANS_CIS_TOP20,
  SANS_FIREWALL,
  MEF_4,
  THREEGPP_23002,
  THREEGPP_38401,
  withSection,
} from './sourceRegistry';

// ---------------------------------------------------------------------------
// Basic Patterns (PAT-001 ~ PAT-005)
// ---------------------------------------------------------------------------

const basicPatterns: ArchitecturePattern[] = [
  {
    id: 'PAT-001',
    type: 'pattern',
    name: '3-Tier Web Architecture',
    nameKo: '3티어 웹 아키텍처',
    description:
      'Classic three-tier architecture separating presentation, application logic, and data storage into distinct layers for maintainability and scalability.',
    descriptionKo:
      '프레젠테이션, 애플리케이션 로직, 데이터 저장소를 별도 계층으로 분리하여 유지보수성과 확장성을 확보하는 전통적인 3계층 아키텍처입니다.',
    requiredComponents: [
      { type: 'web-server', minCount: 1 },
      { type: 'app-server', minCount: 1 },
      { type: 'db-server', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'load-balancer', benefit: 'Distributes traffic across web servers for high availability', benefitKo: '웹 서버 간 트래픽 분산으로 고가용성 확보' },
      { type: 'cache', benefit: 'Reduces database load with application-level caching', benefitKo: '애플리케이션 레벨 캐싱으로 DB 부하 감소' },
      { type: 'firewall', benefit: 'Network segmentation between tiers', benefitKo: '계층 간 네트워크 세그멘테이션' },
      { type: 'waf', benefit: 'Web application layer protection', benefitKo: '웹 애플리케이션 계층 보호' },
    ],
    scalability: 'medium',
    complexity: 2,
    bestForKo: [
      '전통적인 웹 애플리케이션',
      '명확한 계층 분리가 필요한 시스템',
      'CRUD 기반 비즈니스 애플리케이션',
      '중소 규모 트래픽 서비스',
    ],
    notSuitableForKo: [
      '실시간 스트리밍 서비스',
      '초대규모 트래픽 처리',
      '마이크로서비스 기반 시스템',
    ],
    evolvesTo: ['PAT-004', 'PAT-006', 'PAT-018'],
    evolvesFrom: ['PAT-002', 'PAT-003'],
    tags: ['web', '3-tier', 'classic', 'layered', 'enterprise'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(NIST_800_123, 'Section 2 - Server Architecture'),
        withSection(NIST_800_44, 'Section 8 - Web Server Architecture'),
        AWS_WAF_REL,
      ],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-002',
    type: 'pattern',
    name: '2-Tier Web Architecture',
    nameKo: '2티어 웹 아키텍처',
    description:
      'Simplified two-tier architecture combining presentation and application logic on the web server, directly connected to a database.',
    descriptionKo:
      '웹 서버에서 프레젠테이션과 애플리케이션 로직을 함께 처리하고, 데이터베이스에 직접 연결하는 간소화된 2계층 아키텍처입니다.',
    requiredComponents: [
      { type: 'web-server', minCount: 1 },
      { type: 'db-server', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'cache', benefit: 'Reduces database query load', benefitKo: 'DB 쿼리 부하 감소' },
      { type: 'firewall', benefit: 'Secures traffic between web and database tiers', benefitKo: '웹-DB 간 트래픽 보안' },
      { type: 'load-balancer', benefit: 'Enables horizontal scaling of web servers', benefitKo: '웹 서버 수평 확장 가능' },
    ],
    scalability: 'low',
    complexity: 1,
    bestForKo: [
      '소규모 웹사이트',
      '프로토타입 및 MVP',
      '간단한 CRUD 애플리케이션',
      '개발/테스트 환경',
    ],
    notSuitableForKo: [
      '복잡한 비즈니스 로직',
      '높은 동시 접속',
      '엔터프라이즈 시스템',
    ],
    evolvesTo: ['PAT-001', 'PAT-004'],
    evolvesFrom: ['PAT-003'],
    tags: ['web', '2-tier', 'simple', 'small-scale'],
    trust: {
      confidence: 0.9,
      sources: [
        withSection(NIST_800_44, 'Section 3 - Web Server Overview'),
        withSection(NIST_800_123, 'Section 2.1 - Simple Server Deployments'),
      ],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-003',
    type: 'pattern',
    name: 'Monolithic Architecture',
    nameKo: '모놀리식 아키텍처',
    description:
      'Single-server architecture where a web server handles all application functions with a local or attached database. Simplest possible deployment.',
    descriptionKo:
      '단일 웹 서버가 모든 애플리케이션 기능을 처리하고, 로컬 또는 연결된 데이터베이스를 사용하는 가장 단순한 배포 형태입니다.',
    requiredComponents: [
      { type: 'web-server', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'db-server', benefit: 'Separates data storage from application server', benefitKo: '애플리케이션 서버와 데이터 저장소 분리' },
      { type: 'firewall', benefit: 'Basic perimeter security', benefitKo: '기본 경계 보안' },
      { type: 'backup', benefit: 'Data recovery capability', benefitKo: '데이터 복구 기능' },
    ],
    scalability: 'low',
    complexity: 1,
    bestForKo: [
      '개인 프로젝트',
      '초기 프로토타입',
      '정적 웹사이트',
      '내부 도구',
    ],
    notSuitableForKo: [
      '프로덕션 서비스',
      '고가용성 요구사항',
      '팀 단위 개발',
    ],
    evolvesTo: ['PAT-002', 'PAT-001'],
    evolvesFrom: [],
    tags: ['monolithic', 'single-server', 'simple', 'prototype'],
    trust: {
      confidence: 0.9,
      sources: [
        withSection(NIST_800_123, 'Section 2 - Server Architecture'),
      ],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-004',
    type: 'pattern',
    name: 'Load-Balanced Architecture',
    nameKo: '로드밸런싱 아키텍처',
    description:
      'Architecture using a load balancer to distribute traffic across multiple web server instances for improved availability and throughput.',
    descriptionKo:
      '로드 밸런서를 사용하여 다수의 웹 서버 인스턴스에 트래픽을 분산시켜 가용성과 처리량을 향상시키는 아키텍처입니다.',
    requiredComponents: [
      { type: 'load-balancer', minCount: 1 },
      { type: 'web-server', minCount: 2 },
    ],
    optionalComponents: [
      { type: 'app-server', benefit: 'Separates business logic from web tier', benefitKo: '웹 티어에서 비즈니스 로직 분리' },
      { type: 'db-server', benefit: 'Persistent data storage', benefitKo: '영구 데이터 저장소' },
      { type: 'cache', benefit: 'Session sharing and response caching', benefitKo: '세션 공유 및 응답 캐싱' },
      { type: 'waf', benefit: 'Application-layer protection before load balancer', benefitKo: '로드 밸런서 전단 애플리케이션 계층 보호' },
    ],
    scalability: 'high',
    complexity: 2,
    bestForKo: [
      '높은 트래픽 웹 서비스',
      '무중단 배포가 필요한 서비스',
      '수평 확장이 필요한 시스템',
      '글로벌 서비스',
    ],
    notSuitableForKo: [
      '단일 사용자 시스템',
      '상태 기반(stateful) 서버',
      '극소규모 트래픽',
    ],
    evolvesTo: ['PAT-006', 'PAT-017', 'PAT-018'],
    evolvesFrom: ['PAT-001', 'PAT-002'],
    tags: ['load-balancer', 'horizontal-scaling', 'high-availability', 'web'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(RFC_7230, 'Section 2.3 - Intermediaries'),
        AWS_WAF_REL,
        AWS_WAF_PERF,
      ],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-005',
    type: 'pattern',
    name: 'DMZ Architecture',
    nameKo: 'DMZ 아키텍처',
    description:
      'Architecture with a demilitarized zone (DMZ) separating public-facing services from internal networks using firewalls and a web application firewall.',
    descriptionKo:
      '방화벽과 WAF를 사용하여 외부 노출 서비스와 내부 네트워크를 DMZ로 분리하는 보안 중심 아키텍처입니다.',
    requiredComponents: [
      { type: 'firewall', minCount: 1 },
      { type: 'waf', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'web-server', benefit: 'Public-facing web services in DMZ', benefitKo: 'DMZ 내 외부 공개 웹 서비스' },
      { type: 'load-balancer', benefit: 'Traffic distribution within DMZ', benefitKo: 'DMZ 내 트래픽 분산' },
      { type: 'ids-ips', benefit: 'Intrusion detection at DMZ boundary', benefitKo: 'DMZ 경계에서 침입 탐지' },
      { type: 'dns', benefit: 'DNS resolution in DMZ', benefitKo: 'DMZ 내 DNS 해석' },
    ],
    scalability: 'medium',
    complexity: 3,
    bestForKo: [
      '외부 서비스 운영 조직',
      '규제 준수가 필요한 환경',
      '공공기관 및 금융권',
      '인터넷 노출 서비스',
    ],
    notSuitableForKo: [
      '내부 전용 시스템',
      '소규모 개발 환경',
      '클라우드 네이티브 환경 (보안 그룹 사용)',
    ],
    evolvesTo: ['PAT-012', 'PAT-014'],
    evolvesFrom: [],
    tags: ['dmz', 'security', 'firewall', 'waf', 'network-segmentation'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(NIST_800_41, 'Section 4 - Firewall Architectures'),
        withSection(NIST_800_53, 'SC-7 - Boundary Protection'),
        SANS_FIREWALL,
      ],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
];

// ---------------------------------------------------------------------------
// Extended Patterns (PAT-006 ~ PAT-010)
// ---------------------------------------------------------------------------

const extendedPatterns: ArchitecturePattern[] = [
  {
    id: 'PAT-006',
    type: 'pattern',
    name: 'Microservices Architecture',
    nameKo: '마이크로서비스 아키텍처',
    description:
      'Distributed architecture decomposing applications into independently deployable services running in containers, orchestrated by Kubernetes.',
    descriptionKo:
      '애플리케이션을 독립적으로 배포 가능한 서비스들로 분해하고, 컨테이너에서 실행하며 Kubernetes로 오케스트레이션하는 분산 아키텍처입니다.',
    requiredComponents: [
      { type: 'kubernetes', minCount: 1 },
      { type: 'container', minCount: 1 },
      { type: 'load-balancer', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'cache', benefit: 'Inter-service caching and message queuing', benefitKo: '서비스 간 캐싱 및 메시지 큐잉' },
      { type: 'dns', benefit: 'Service discovery via internal DNS', benefitKo: '내부 DNS를 통한 서비스 디스커버리' },
      { type: 'waf', benefit: 'API gateway protection', benefitKo: 'API 게이트웨이 보호' },
      { type: 'db-server', benefit: 'Per-service database (database per service pattern)', benefitKo: '서비스별 데이터베이스 (데이터베이스 분리 패턴)' },
    ],
    scalability: 'auto',
    complexity: 4,
    bestForKo: [
      '대규모 팀 분산 개발',
      '독립적 배포 주기',
      '다양한 기술 스택 혼용',
      '클라우드 네이티브 서비스',
    ],
    notSuitableForKo: [
      '소규모 팀 (3명 이하)',
      '단순한 비즈니스 로직',
      '낮은 트래픽 시스템',
    ],
    evolvesTo: ['PAT-017'],
    evolvesFrom: ['PAT-001', 'PAT-004'],
    tags: ['microservices', 'kubernetes', 'container', 'distributed', 'cloud-native'],
    trust: {
      confidence: 0.9,
      sources: [
        CNCF_SECURITY,
        withSection(AWS_WAF_REL, 'Microservices Architecture'),
        withSection(NIST_800_125, 'Section 4 - Virtualization Security'),
      ],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-007',
    type: 'pattern',
    name: 'Event-Driven Architecture',
    nameKo: '이벤트 기반 아키텍처',
    description:
      'Architecture where application servers communicate through asynchronous events using a cache/message broker, with a load balancer for ingress.',
    descriptionKo:
      '캐시/메시지 브로커를 통해 애플리케이션 서버가 비동기 이벤트로 통신하고, 로드 밸런서가 인입 트래픽을 분산하는 아키텍처입니다.',
    requiredComponents: [
      { type: 'app-server', minCount: 1 },
      { type: 'cache', minCount: 1 },
      { type: 'load-balancer', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'db-server', benefit: 'Event store and persistent state', benefitKo: '이벤트 저장소 및 영구 상태 관리' },
      { type: 'container', benefit: 'Containerized event consumers', benefitKo: '컨테이너화된 이벤트 컨슈머' },
      { type: 'web-server', benefit: 'Frontend serving layer', benefitKo: '프론트엔드 서빙 계층' },
    ],
    scalability: 'high',
    complexity: 3,
    bestForKo: [
      '실시간 데이터 처리',
      '비동기 워크플로우',
      '이벤트 소싱 시스템',
      '높은 처리량 요구',
    ],
    notSuitableForKo: [
      '단순 CRUD 애플리케이션',
      '강한 일관성 요구',
      '디버깅 용이성이 중요한 시스템',
    ],
    evolvesTo: ['PAT-006'],
    evolvesFrom: ['PAT-001'],
    tags: ['event-driven', 'async', 'message-broker', 'scalable'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(AWS_WAF_REL, 'Event-Driven Architecture'),
        withSection(AWS_WAF_PERF, 'Asynchronous Processing'),
      ],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-008',
    type: 'pattern',
    name: 'API Gateway Pattern',
    nameKo: 'API 게이트웨이 패턴',
    description:
      'Architecture using a WAF and load balancer as an API gateway in front of application servers, providing centralized request routing, rate limiting, and security.',
    descriptionKo:
      'WAF와 로드 밸런서를 API 게이트웨이로 활용하여 애플리케이션 서버 앞단에서 요청 라우팅, 속도 제한, 보안을 중앙 관리하는 아키텍처입니다.',
    requiredComponents: [
      { type: 'waf', minCount: 1 },
      { type: 'load-balancer', minCount: 1 },
      { type: 'app-server', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'cache', benefit: 'API response caching', benefitKo: 'API 응답 캐싱' },
      { type: 'iam', benefit: 'Centralized API authentication and authorization', benefitKo: '중앙 집중식 API 인증 및 인가' },
      { type: 'dns', benefit: 'API domain routing', benefitKo: 'API 도메인 라우팅' },
    ],
    scalability: 'high',
    complexity: 3,
    bestForKo: [
      'API 기반 서비스',
      'BFF(Backend for Frontend) 패턴',
      '멀티 클라이언트 지원',
      'API 마켓플레이스',
    ],
    notSuitableForKo: [
      '단일 클라이언트 앱',
      'API가 적은 모놀리식',
      '직접 서버 연결이 필요한 시스템',
    ],
    evolvesTo: ['PAT-006'],
    evolvesFrom: ['PAT-001'],
    tags: ['api-gateway', 'waf', 'load-balancer', 'api', 'routing'],
    trust: {
      confidence: 0.9,
      sources: [
        OWASP_API_TOP10,
        withSection(AWS_WAF_SEC, 'API Gateway Security'),
        withSection(RFC_7540, 'Section 8 - HTTP/2 Connection Management'),
      ],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-009',
    type: 'pattern',
    name: 'Database Cluster Pattern',
    nameKo: '데이터베이스 클러스터 패턴',
    description:
      'Architecture focusing on database high availability and performance through clustering, caching layer, and backup strategies.',
    descriptionKo:
      '데이터베이스 클러스터링, 캐시 계층, 백업 전략을 통해 데이터베이스 고가용성과 성능에 중점을 둔 아키텍처입니다.',
    requiredComponents: [
      { type: 'db-server', minCount: 1 },
      { type: 'cache', minCount: 1 },
      { type: 'backup', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'load-balancer', benefit: 'Read replica load distribution', benefitKo: '읽기 복제본 부하 분산' },
      { type: 'san-nas', benefit: 'High-performance shared storage', benefitKo: '고성능 공유 스토리지' },
      { type: 'firewall', benefit: 'Database access control', benefitKo: '데이터베이스 접근 제어' },
    ],
    scalability: 'high',
    complexity: 3,
    bestForKo: [
      '데이터 중심 애플리케이션',
      '높은 읽기/쓰기 부하',
      '데이터 무손실 요구',
      '분석/보고 시스템',
    ],
    notSuitableForKo: [
      '소량 데이터',
      '임시 데이터만 처리',
      '비용 절감이 최우선',
    ],
    evolvesTo: ['PAT-018'],
    evolvesFrom: [],
    tags: ['database', 'cluster', 'cache', 'backup', 'high-availability'],
    trust: {
      confidence: 0.9,
      sources: [
        withSection(NIST_800_123, 'Section 5 - Server Data Protection'),
        withSection(AWS_WAF_REL, 'Data Management'),
      ],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-010',
    type: 'pattern',
    name: 'CDN-Accelerated Pattern',
    nameKo: 'CDN 가속 패턴',
    description:
      'Architecture using a CDN and DNS for global content distribution and accelerated delivery to end users, with web servers as origin.',
    descriptionKo:
      'CDN과 DNS를 활용하여 전 세계에 콘텐츠를 분산 배포하고, 웹 서버를 오리진으로 사용하여 사용자 응답을 가속하는 아키텍처입니다.',
    requiredComponents: [
      { type: 'cdn', minCount: 1 },
      { type: 'dns', minCount: 1 },
      { type: 'web-server', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'waf', benefit: 'CDN-level DDoS protection', benefitKo: 'CDN 레벨 DDoS 방어' },
      { type: 'load-balancer', benefit: 'Origin server load distribution', benefitKo: '오리진 서버 부하 분산' },
      { type: 'object-storage', benefit: 'Static asset storage for CDN origin', benefitKo: 'CDN 오리진용 정적 자산 저장소' },
    ],
    scalability: 'high',
    complexity: 2,
    bestForKo: [
      '글로벌 웹 서비스',
      '미디어/콘텐츠 배포',
      '정적 자산 중심 서비스',
      '지연시간에 민감한 서비스',
    ],
    notSuitableForKo: [
      '내부 네트워크 전용',
      '동적 콘텐츠 100%',
      '단일 리전 서비스',
    ],
    evolvesTo: ['PAT-014', 'PAT-018'],
    evolvesFrom: ['PAT-001'],
    tags: ['cdn', 'dns', 'global', 'performance', 'content-delivery'],
    trust: {
      confidence: 0.9,
      sources: [
        AWS_WAF_PERF,
        withSection(RFC_7230, 'Section 2.3 - Intermediaries'),
        withSection(CIS_V8, 'Content Delivery Best Practices'),
      ],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
];

// ---------------------------------------------------------------------------
// Security Patterns (PAT-011 ~ PAT-015)
// ---------------------------------------------------------------------------

const securityPatterns: ArchitecturePattern[] = [
  {
    id: 'PAT-011',
    type: 'pattern',
    name: 'Zero Trust Architecture',
    nameKo: '제로 트러스트 아키텍처',
    description:
      'Security model where no user or device is trusted by default, enforcing NAC, multi-factor authentication, IAM policies, and micro-segmentation with firewalls.',
    descriptionKo:
      '어떤 사용자나 장치도 기본적으로 신뢰하지 않으며, NAC, 다중 인증, IAM 정책, 방화벽 마이크로세그멘테이션을 적용하는 보안 모델입니다.',
    requiredComponents: [
      { type: 'nac', minCount: 1 },
      { type: 'mfa', minCount: 1 },
      { type: 'iam', minCount: 1 },
      { type: 'firewall', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'ids-ips', benefit: 'Continuous network monitoring for anomalies', benefitKo: '이상 행위 지속 모니터링' },
      { type: 'dlp', benefit: 'Prevents unauthorized data exfiltration', benefitKo: '비인가 데이터 유출 방지' },
      { type: 'vpn-gateway', benefit: 'Encrypted tunnels for remote access', benefitKo: '원격 접속용 암호화 터널' },
      { type: 'sso', benefit: 'Unified identity management', benefitKo: '통합 신원 관리' },
    ],
    scalability: 'high',
    complexity: 5,
    bestForKo: [
      '금융기관',
      '정부/공공기관',
      '원격 근무 환경',
      '규제 준수 (ISMS, ISO 27001)',
      '고보안 요구 환경',
    ],
    notSuitableForKo: [
      '소규모 스타트업',
      '비용 제약이 심한 환경',
      '레거시 시스템 위주',
    ],
    evolvesTo: [],
    evolvesFrom: ['PAT-012', 'PAT-013'],
    tags: ['zero-trust', 'security', 'nac', 'mfa', 'iam', 'micro-segmentation'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(NIST_800_53, 'AC-2 - Account Management, AC-17 - Remote Access'),
        withSection(NIST_800_63B, 'Section 4 - Authenticator Assurance Levels'),
        SANS_CIS_TOP20,
      ],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-012',
    type: 'pattern',
    name: 'Defense in Depth',
    nameKo: '다층 방어 아키텍처',
    description:
      'Layered security architecture deploying multiple security controls (firewall, WAF, IDS/IPS, DLP) at different network layers to protect against diverse threats.',
    descriptionKo:
      '방화벽, WAF, IDS/IPS, DLP 등 다양한 보안 제어를 네트워크 각 계층에 배치하여 다양한 위협에 대응하는 계층적 보안 아키텍처입니다.',
    requiredComponents: [
      { type: 'firewall', minCount: 1 },
      { type: 'waf', minCount: 1 },
      { type: 'ids-ips', minCount: 1 },
      { type: 'dlp', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'nac', benefit: 'Network access enforcement', benefitKo: '네트워크 접근 제어 강제' },
      { type: 'vpn-gateway', benefit: 'Secure encrypted communications', benefitKo: '안전한 암호화 통신' },
      { type: 'iam', benefit: 'Identity-based access policies', benefitKo: '신원 기반 접근 정책' },
    ],
    scalability: 'medium',
    complexity: 4,
    bestForKo: [
      '기업 내부 네트워크',
      '데이터 센터',
      '금융/의료 시스템',
      '규제 준수 환경',
    ],
    notSuitableForKo: [
      '클라우드 네이티브 환경 (보안 서비스 활용)',
      '비용 민감 환경',
      '단순 웹 서비스',
    ],
    evolvesTo: ['PAT-011'],
    evolvesFrom: ['PAT-005'],
    tags: ['defense-in-depth', 'security', 'layered', 'ids-ips', 'dlp'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(NIST_800_53, 'SC-7 - Boundary Protection'),
        withSection(NIST_800_94, 'Section 3 - Types of IDPS Technologies'),
        withSection(CIS_V8_13, '13.3 - Network Intrusion Detection'),
        SANS_CIS_TOP20,
      ],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-013',
    type: 'pattern',
    name: 'VPN Remote Access',
    nameKo: 'VPN 원격 접속 아키텍처',
    description:
      'Secure remote access architecture using VPN gateway with firewall enforcement, multi-factor authentication, and directory service integration.',
    descriptionKo:
      'VPN 게이트웨이를 통해 방화벽 정책을 적용하고, 다중 인증 및 디렉토리 서비스와 연동하여 안전한 원격 접속을 제공하는 아키텍처입니다.',
    requiredComponents: [
      { type: 'vpn-gateway', minCount: 1 },
      { type: 'firewall', minCount: 1 },
      { type: 'mfa', minCount: 1 },
      { type: 'ldap-ad', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'ids-ips', benefit: 'Monitors VPN traffic for threats', benefitKo: 'VPN 트래픽 위협 모니터링' },
      { type: 'nac', benefit: 'Device compliance check before access', benefitKo: '접속 전 장치 준수 여부 확인' },
      { type: 'sso', benefit: 'Single sign-on for VPN and internal apps', benefitKo: 'VPN 및 내부 앱 싱글 사인온' },
    ],
    scalability: 'medium',
    complexity: 3,
    bestForKo: [
      '원격 근무 환경',
      '지점/지사 연결',
      '외부 파트너 접속',
      '재택근무 보안',
    ],
    notSuitableForKo: [
      '내부 네트워크 전용',
      '퍼블릭 서비스',
      '초저지연 요구',
    ],
    evolvesTo: ['PAT-011'],
    evolvesFrom: [],
    tags: ['vpn', 'remote-access', 'mfa', 'ldap', 'security'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(NIST_800_77, 'Section 3 - IPsec VPN Architecture'),
        withSection(NIST_800_63B, 'Section 5 - Authentication Assurance'),
        withSection(NIST_800_53, 'AC-17 - Remote Access'),
      ],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-014',
    type: 'pattern',
    name: 'Secure Web Hosting',
    nameKo: '보안 웹 호스팅 아키텍처',
    description:
      'Production-grade web hosting architecture with layered security: firewall for network protection, WAF for application security, load balancer for distribution, and web servers.',
    descriptionKo:
      '방화벽으로 네트워크 보호, WAF로 애플리케이션 보안, 로드 밸런서로 분산 처리를 적용한 프로덕션 수준의 보안 웹 호스팅 아키텍처입니다.',
    requiredComponents: [
      { type: 'firewall', minCount: 1 },
      { type: 'waf', minCount: 1 },
      { type: 'load-balancer', minCount: 1 },
      { type: 'web-server', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'cdn', benefit: 'Global content acceleration', benefitKo: '글로벌 콘텐츠 가속' },
      { type: 'ids-ips', benefit: 'Intrusion detection at multiple points', benefitKo: '다중 지점 침입 탐지' },
      { type: 'app-server', benefit: 'Separate application logic tier', benefitKo: '별도 애플리케이션 로직 계층' },
      { type: 'db-server', benefit: 'Persistent data storage', benefitKo: '영구 데이터 저장소' },
    ],
    scalability: 'high',
    complexity: 3,
    bestForKo: [
      '프로덕션 웹 서비스',
      '이커머스 플랫폼',
      '공공기관 웹사이트',
      'SaaS 서비스',
    ],
    notSuitableForKo: [
      '개발/테스트 환경',
      '내부 전용 애플리케이션',
      '소규모 블로그',
    ],
    evolvesTo: ['PAT-012', 'PAT-018'],
    evolvesFrom: ['PAT-005', 'PAT-010'],
    tags: ['web-hosting', 'security', 'firewall', 'waf', 'production'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(NIST_800_44, 'Section 9 - Web Server Security Checklist'),
        OWASP_TOP10,
        withSection(NIST_800_41, 'Section 4.2 - Dual-Firewall DMZ'),
        SANS_FIREWALL,
      ],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-015',
    type: 'pattern',
    name: 'Network Segmentation',
    nameKo: '네트워크 세그멘테이션 아키텍처',
    description:
      'Architecture dividing the network into isolated segments using firewalls, L3 switches, and routers to contain threats and control traffic flow.',
    descriptionKo:
      '방화벽, L3 스위치, 라우터를 사용하여 네트워크를 격리된 세그먼트로 분리하고 위협을 차단하며 트래픽 흐름을 제어하는 아키텍처입니다.',
    requiredComponents: [
      { type: 'firewall', minCount: 1 },
      { type: 'switch-l3', minCount: 1 },
      { type: 'router', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'ids-ips', benefit: 'Monitors inter-segment traffic', benefitKo: '세그먼트 간 트래픽 모니터링' },
      { type: 'switch-l2', benefit: 'VLAN-based micro-segmentation', benefitKo: 'VLAN 기반 마이크로세그멘테이션' },
      { type: 'nac', benefit: 'Segment access enforcement', benefitKo: '세그먼트 접근 제어 강제' },
    ],
    scalability: 'medium',
    complexity: 3,
    bestForKo: [
      '기업 내부 네트워크',
      '데이터 센터',
      'IoT 환경 격리',
      '규제 준수 (PCI-DSS 등)',
    ],
    notSuitableForKo: [
      '소규모 단일 네트워크',
      '클라우드 전용 환경',
      '플랫 네트워크 요구',
    ],
    evolvesTo: ['PAT-012', 'PAT-011'],
    evolvesFrom: [],
    tags: ['segmentation', 'network', 'firewall', 'switch', 'router', 'isolation'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(CIS_V8_12, '12.2 - Secure Network Architecture'),
        withSection(NIST_800_41, 'Section 2.1 - Network Layer Firewalling'),
        withSection(NIST_800_53, 'SC-7 - Boundary Protection'),
      ],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
];

// ---------------------------------------------------------------------------
// Cloud Patterns (PAT-016 ~ PAT-018)
// ---------------------------------------------------------------------------

const cloudPatterns: ArchitecturePattern[] = [
  {
    id: 'PAT-016',
    type: 'pattern',
    name: 'Hybrid Cloud Architecture',
    nameKo: '하이브리드 클라우드 아키텍처',
    description:
      'Architecture combining private cloud infrastructure with public cloud (AWS VPC or Azure VNet), connected securely via VPN gateway for workload flexibility.',
    descriptionKo:
      '프라이빗 클라우드와 퍼블릭 클라우드(AWS VPC 또는 Azure VNet)를 VPN 게이트웨이로 안전하게 연결하여 워크로드 유연성을 확보하는 하이브리드 아키텍처입니다.',
    requiredComponents: [
      { type: 'private-cloud', minCount: 1 },
      { type: 'vpn-gateway', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'aws-vpc', benefit: 'AWS public cloud integration', benefitKo: 'AWS 퍼블릭 클라우드 연동' },
      { type: 'azure-vnet', benefit: 'Azure public cloud integration', benefitKo: 'Azure 퍼블릭 클라우드 연동' },
      { type: 'firewall', benefit: 'Cross-cloud traffic filtering', benefitKo: '크로스 클라우드 트래픽 필터링' },
      { type: 'load-balancer', benefit: 'Multi-cloud traffic distribution', benefitKo: '멀티 클라우드 트래픽 분산' },
      { type: 'sd-wan', benefit: 'Optimized WAN connectivity between clouds', benefitKo: '클라우드 간 최적화된 WAN 연결' },
    ],
    scalability: 'high',
    complexity: 4,
    bestForKo: [
      '클라우드 마이그레이션 과도기',
      '데이터 주권 요구사항',
      '재해 복구',
      '클라우드 버스팅',
    ],
    notSuitableForKo: [
      '단일 클라우드 올인',
      '소규모 인프라',
      '네트워크 복잡성 최소화 필요',
    ],
    evolvesTo: ['PAT-017'],
    evolvesFrom: [],
    tags: ['hybrid-cloud', 'private-cloud', 'vpn', 'multi-cloud', 'migration'],
    trust: {
      confidence: 0.9,
      sources: [
        withSection(NIST_800_144, 'Section 3 - Cloud Computing Benefits and Concerns'),
        AZURE_CAF,
        withSection(NIST_800_77, 'Section 5 - VPN Architecture'),
      ],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-017',
    type: 'pattern',
    name: 'Cloud-Native Architecture',
    nameKo: '클라우드 네이티브 아키텍처',
    description:
      'Fully cloud-native architecture using AWS VPC with Kubernetes-orchestrated containers and a load balancer for elastic, scalable deployments.',
    descriptionKo:
      'AWS VPC에서 Kubernetes로 오케스트레이션된 컨테이너와 로드 밸런서를 사용하여 탄력적이고 확장 가능한 배포를 구현하는 완전한 클라우드 네이티브 아키텍처입니다.',
    requiredComponents: [
      { type: 'aws-vpc', minCount: 1 },
      { type: 'kubernetes', minCount: 1 },
      { type: 'container', minCount: 1 },
      { type: 'load-balancer', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'waf', benefit: 'Cloud WAF for application protection', benefitKo: '애플리케이션 보호용 클라우드 WAF' },
      { type: 'cache', benefit: 'Managed caching service (e.g., ElastiCache)', benefitKo: '관리형 캐싱 서비스 (예: ElastiCache)' },
      { type: 'object-storage', benefit: 'Cloud object storage (e.g., S3)', benefitKo: '클라우드 오브젝트 스토리지 (예: S3)' },
      { type: 'cdn', benefit: 'CloudFront content delivery', benefitKo: 'CloudFront 콘텐츠 전송' },
      { type: 'iam', benefit: 'Cloud IAM role-based access', benefitKo: '클라우드 IAM 역할 기반 접근' },
    ],
    scalability: 'auto',
    complexity: 4,
    bestForKo: [
      'SaaS 제품',
      '글로벌 서비스',
      '자동 스케일링 필요',
      '빈번한 배포 주기',
    ],
    notSuitableForKo: [
      '온프레미스 요구사항',
      '클라우드 경험 부족 팀',
      '레거시 시스템 연동 위주',
    ],
    evolvesTo: [],
    evolvesFrom: ['PAT-004', 'PAT-006', 'PAT-016'],
    tags: ['cloud-native', 'aws', 'kubernetes', 'container', 'auto-scaling'],
    trust: {
      confidence: 0.9,
      sources: [
        CNCF_SECURITY,
        withSection(NIST_800_144, 'Section 4 - Cloud Security'),
        AWS_WAF_SEC,
        withSection(AWS_WAF_REL, 'Cloud-Native Architecture'),
      ],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-018',
    type: 'pattern',
    name: 'High Availability Architecture',
    nameKo: '고가용성 아키텍처',
    description:
      'Architecture designed for maximum uptime with load-balanced redundant servers, database replication, backup systems, and caching layers to eliminate single points of failure.',
    descriptionKo:
      '로드 밸런서로 중복 서버를 분산하고, 데이터베이스 복제, 백업, 캐시 계층을 적용하여 단일 장애점을 제거하고 최대 가동 시간을 확보하는 아키텍처입니다.',
    requiredComponents: [
      { type: 'load-balancer', minCount: 1 },
      { type: 'web-server', minCount: 2 },
      { type: 'db-server', minCount: 1 },
      { type: 'backup', minCount: 1 },
      { type: 'cache', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'app-server', benefit: 'Redundant application tier', benefitKo: '이중화된 애플리케이션 계층' },
      { type: 'san-nas', benefit: 'Shared storage for failover', benefitKo: '페일오버를 위한 공유 스토리지' },
      { type: 'firewall', benefit: 'HA firewall pair', benefitKo: '방화벽 이중화 쌍' },
      { type: 'dns', benefit: 'DNS-based failover', benefitKo: 'DNS 기반 페일오버' },
    ],
    scalability: 'high',
    complexity: 4,
    bestForKo: [
      '미션 크리티컬 서비스',
      '99.99% SLA 요구',
      '전자상거래 플랫폼',
      '금융 거래 시스템',
    ],
    notSuitableForKo: [
      '개발/테스트 환경',
      '비용 절감이 최우선',
      '낮은 트래픽 서비스',
    ],
    evolvesTo: ['PAT-017'],
    evolvesFrom: ['PAT-001', 'PAT-004', 'PAT-009', 'PAT-010', 'PAT-014'],
    tags: ['high-availability', 'redundancy', 'failover', 'backup', 'mission-critical'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(AWS_WAF_REL, 'Reliability Pillar - Availability'),
        withSection(NIST_800_123, 'Section 6 - Availability Planning'),
        withSection(CIS_V8, 'Data Recovery and Backup'),
      ],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
];

// ---------------------------------------------------------------------------
// Telecom Patterns (PAT-TEL-001 ~ PAT-TEL-006)
// ---------------------------------------------------------------------------

const telecomPatterns: ArchitecturePattern[] = [
  {
    id: 'PAT-TEL-001',
    type: 'pattern',
    name: 'Enterprise Dedicated Line Single Access',
    nameKo: '기업 전용회선 단일 접속',
    description:
      'Basic enterprise connectivity using a single dedicated line from customer premise through a central office to the carrier PE router, with firewall security at the enterprise boundary.',
    descriptionKo:
      '고객 구내에서 국사를 거쳐 캐리어 PE 라우터까지 단일 전용회선으로 연결하고, 기업 경계에 방화벽을 배치하는 기본 기업 접속 아키텍처입니다.',
    requiredComponents: [
      { type: 'customer-premise', minCount: 1 },
      { type: 'dedicated-line', minCount: 1 },
      { type: 'central-office', minCount: 1 },
      { type: 'pe-router', minCount: 1 },
      { type: 'firewall', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'router', benefit: 'Customer premise routing for multi-subnet environments', benefitKo: '다중 서브넷 환경의 고객 구내 라우팅' },
      { type: 'switch-l3', benefit: 'Internal VLAN routing at customer site', benefitKo: '고객 사이트 내부 VLAN 라우팅' },
    ],
    scalability: 'low',
    complexity: 2,
    bestForKo: [
      '중소기업 단일 사업장',
      '기본적인 WAN 연결이 필요한 환경',
      '비용 효율적인 전용회선 접속',
      '낮은 대역폭 요구사항',
    ],
    notSuitableForKo: [
      '고가용성 요구사항',
      '다지점 연결',
      '실시간 서비스 운영',
    ],
    evolvesTo: ['PAT-TEL-002'],
    evolvesFrom: [],
    tags: ['telecom', 'dedicated-line', 'single-access', 'enterprise', 'wan'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(RFC_4364, 'Section 4 - CE-PE Connection'),
        withSection(NIST_800_41, 'Section 2.1 - Network Segmentation'),
      ],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-TEL-002',
    type: 'pattern',
    name: 'Enterprise Dedicated Line Dual Access',
    nameKo: '기업 전용회선 이중화',
    description:
      'Redundant enterprise connectivity with dual dedicated lines to two separate central offices and PE routers, providing resilience against single link or CO failure.',
    descriptionKo:
      '두 개의 서로 다른 국사 및 PE 라우터로 이중 전용회선을 구성하여 단일 회선 또는 국사 장애에 대한 복원력을 제공하는 이중화 접속 아키텍처입니다.',
    requiredComponents: [
      { type: 'customer-premise', minCount: 1 },
      { type: 'dedicated-line', minCount: 2 },
      { type: 'central-office', minCount: 2 },
      { type: 'pe-router', minCount: 2 },
      { type: 'firewall', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'router', benefit: 'Dynamic routing (BGP/OSPF) for automatic failover', benefitKo: '자동 페일오버를 위한 동적 라우팅(BGP/OSPF)' },
      { type: 'load-balancer', benefit: 'Traffic distribution across dual links', benefitKo: '이중 회선 간 트래픽 분산' },
    ],
    scalability: 'medium',
    complexity: 3,
    bestForKo: [
      '고가용성이 필요한 기업',
      'SLA 99.9% 이상 요구',
      '미션 크리티컬 업무 환경',
      '중견기업 본사',
    ],
    notSuitableForKo: [
      '비용 민감 환경',
      '소규모 사업장',
      '임시/이벤트성 접속',
    ],
    evolvesTo: ['PAT-TEL-004'],
    evolvesFrom: ['PAT-TEL-001'],
    tags: ['telecom', 'dedicated-line', 'dual-access', 'redundancy', 'enterprise'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(RFC_4364, 'Section 4 - CE-PE Connection'),
        withSection(NIST_800_41, 'Section 4.2 - Dual-Firewall DMZ'),
      ],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-TEL-003',
    type: 'pattern',
    name: 'MPLS VPN Hub-Spoke',
    nameKo: 'MPLS VPN 다지점 (Hub-Spoke)',
    description:
      'Multi-site enterprise network using MPLS VPN with hub-spoke topology, where PE routers at each site connect through P router backbone with VPN service overlay.',
    descriptionKo:
      'Hub-Spoke 토폴로지의 MPLS VPN을 사용하여 각 사이트의 PE 라우터가 P 라우터 백본을 통해 VPN 서비스 오버레이로 연결되는 다지점 기업 네트워크입니다.',
    requiredComponents: [
      { type: 'pe-router', minCount: 2 },
      { type: 'p-router', minCount: 1 },
      { type: 'mpls-network', minCount: 1 },
      { type: 'vpn-service', minCount: 1 },
      { type: 'firewall', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'router', benefit: 'CE routing at branch sites', benefitKo: '지사 CE 라우팅' },
      { type: 'ids-ips', benefit: 'WAN traffic inspection for threat detection', benefitKo: 'WAN 트래픽 검사를 통한 위협 탐지' },
    ],
    scalability: 'high',
    complexity: 3,
    bestForKo: [
      '다지점 기업 네트워크',
      '지사 간 안전한 통신',
      'QoS 보장이 필요한 환경',
      '대기업 WAN 백본',
    ],
    notSuitableForKo: [
      '단일 사이트',
      '비용 절감 최우선',
      '인터넷 기반 연결로 충분한 환경',
    ],
    evolvesTo: ['PAT-TEL-004'],
    evolvesFrom: [],
    tags: ['telecom', 'mpls', 'vpn', 'hub-spoke', 'multi-site', 'enterprise'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(RFC_4364, 'Section 2 - BGP/MPLS VPN'),
        withSection(RFC_3031, 'Section 2 - MPLS Architecture'),
      ],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-TEL-004',
    type: 'pattern',
    name: 'Hybrid WAN',
    nameKo: '하이브리드 WAN',
    description:
      'Architecture combining dedicated line WAN with corporate internet and SD-WAN overlay for cost-effective, flexible multi-path connectivity with centralized policy management.',
    descriptionKo:
      '전용회선 WAN과 기업인터넷을 SD-WAN 오버레이로 결합하여 비용 효율적이고 유연한 다중 경로 연결과 중앙 집중식 정책 관리를 제공하는 아키텍처입니다.',
    requiredComponents: [
      { type: 'dedicated-line', minCount: 1 },
      { type: 'corporate-internet', minCount: 1 },
      { type: 'sd-wan-service', minCount: 1 },
      { type: 'firewall', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'pe-router', benefit: 'Dedicated line termination at carrier edge', benefitKo: '캐리어 엣지에서 전용회선 종단' },
      { type: 'waf', benefit: 'Web application protection for internet-facing services', benefitKo: '인터넷 노출 서비스의 웹 애플리케이션 보호' },
      { type: 'ids-ips', benefit: 'Multi-path traffic inspection', benefitKo: '다중 경로 트래픽 검사' },
    ],
    scalability: 'high',
    complexity: 4,
    bestForKo: [
      '비용 최적화가 필요한 다지점 기업',
      'SaaS/클라우드 트래픽 증가 환경',
      '유연한 대역폭 확장 요구',
      '기존 전용회선에서 마이그레이션',
    ],
    notSuitableForKo: [
      '인터넷 품질이 불안정한 지역',
      '극도의 저지연 요구',
      '규제로 인터넷 사용 불가',
    ],
    evolvesTo: [],
    evolvesFrom: ['PAT-TEL-002', 'PAT-TEL-003'],
    tags: ['telecom', 'hybrid-wan', 'sd-wan', 'dedicated-line', 'internet', 'multi-path'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(MEF_4, 'Metro Ethernet Network Architecture'),
        withSection(NIST_800_41, 'Section 2.1 - Network Segmentation'),
      ],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-TEL-005',
    type: 'pattern',
    name: 'Private 5G Network',
    nameKo: '5G 특화망 구성',
    description:
      'Private 5G network architecture with dedicated base station, core network, local UPF for on-premise data routing, connected to an IDC with firewall security.',
    descriptionKo:
      '전용 기지국, 코어 네트워크, 온프레미스 데이터 라우팅을 위한 로컬 UPF를 갖추고 IDC와 방화벽으로 보안을 적용하는 5G 특화망 아키텍처입니다.',
    requiredComponents: [
      { type: 'base-station', minCount: 1 },
      { type: 'core-network', minCount: 1 },
      { type: 'upf', minCount: 1 },
      { type: 'private-5g', minCount: 1 },
      { type: 'idc', minCount: 1 },
      { type: 'firewall', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'ids-ips', benefit: 'Wireless-to-wired transition security monitoring', benefitKo: '무선-유선 전환 보안 모니터링' },
      { type: 'load-balancer', benefit: 'Application traffic distribution at IDC', benefitKo: 'IDC 애플리케이션 트래픽 분산' },
    ],
    scalability: 'high',
    complexity: 4,
    bestForKo: [
      '스마트 팩토리',
      '대규모 물류센터',
      '항만/공항 운영',
      '초저지연 IoT 환경',
    ],
    notSuitableForKo: [
      '소규모 사업장',
      'Wi-Fi로 충분한 환경',
      '초기 투자 비용 제약',
    ],
    evolvesTo: [],
    evolvesFrom: [],
    tags: ['telecom', '5g', 'private-5g', 'iot', 'smart-factory', 'low-latency'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(THREEGPP_23002, 'Section 4 - Network Architecture'),
        withSection(THREEGPP_38401, 'Section 6 - NG-RAN Architecture'),
      ],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-TEL-006',
    type: 'pattern',
    name: 'IDC Dual Homing',
    nameKo: 'IDC 이중화 접속',
    description:
      'IDC connected via ring network to two separate central offices and PE routers for redundant carrier access, with firewall protection at the IDC boundary.',
    descriptionKo:
      'IDC를 링 네트워크를 통해 두 개의 서로 다른 국사 및 PE 라우터에 연결하여 이중화된 캐리어 접속을 구성하고, IDC 경계에 방화벽을 배치하는 아키텍처입니다.',
    requiredComponents: [
      { type: 'idc', minCount: 1 },
      { type: 'ring-network', minCount: 1 },
      { type: 'central-office', minCount: 2 },
      { type: 'pe-router', minCount: 2 },
      { type: 'firewall', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'load-balancer', benefit: 'Multi-path traffic distribution', benefitKo: '다중 경로 트래픽 분산' },
      { type: 'ids-ips', benefit: 'Dual-path traffic inspection', benefitKo: '이중 경로 트래픽 검사' },
    ],
    scalability: 'high',
    complexity: 3,
    bestForKo: [
      'IDC/데이터센터 운영',
      '호스팅 서비스 제공',
      '99.99% 가용성 요구',
      '대규모 기업 데이터센터',
    ],
    notSuitableForKo: [
      '소규모 서버룸',
      '단일 접속으로 충분한 환경',
      '비용 제약이 큰 환경',
    ],
    evolvesTo: [],
    evolvesFrom: [],
    tags: ['telecom', 'idc', 'dual-homing', 'ring-network', 'redundancy', 'high-availability'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(MEF_4, 'Metro Ethernet Network Architecture'),
        withSection(NIST_800_41, 'Section 4.2 - Dual-Firewall DMZ'),
      ],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
];

// ---------------------------------------------------------------------------
// Kubernetes Patterns (PAT-K8S-001 ~ PAT-K8S-002)
// ---------------------------------------------------------------------------

const k8sPatterns: ArchitecturePattern[] = [
  {
    id: 'PAT-K8S-001',
    type: 'pattern',
    name: 'Service Mesh',
    nameKo: '서비스 메시 아키텍처',
    description:
      'A dedicated infrastructure layer for managing service-to-service communication using sidecar proxies, providing observability, traffic management, and security for microservices.',
    descriptionKo:
      '사이드카 프록시를 사용하여 서비스 간 통신을 관리하는 전용 인프라 계층으로, 마이크로서비스에 관찰성, 트래픽 관리, 보안을 제공합니다.',
    requiredComponents: [
      { type: 'kubernetes', minCount: 1 },
      { type: 'container', minCount: 2 },
      { type: 'load-balancer', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'dns', benefit: 'Service discovery and name resolution', benefitKo: '서비스 디스커버리 및 이름 해석' },
      { type: 'cache', benefit: 'Distributed caching for microservices', benefitKo: '마이크로서비스용 분산 캐싱' },
      { type: 'iam', benefit: 'mTLS certificate management and RBAC', benefitKo: 'mTLS 인증서 관리 및 RBAC' },
      { type: 'ids-ips', benefit: 'Network-level threat detection', benefitKo: '네트워크 수준 위협 탐지' },
    ],
    scalability: 'auto',
    complexity: 4,
    bestForKo: [
      '대규모 마이크로서비스 아키텍처 (20+ 서비스)',
      '서비스 간 통신 보안이 중요한 환경',
      '트래픽 라우팅과 A/B 테스트가 필요한 시스템',
      '분산 추적과 관찰성이 필요한 환경',
    ],
    notSuitableForKo: [
      '소규모 모놀리식 애플리케이션',
      '5개 미만의 마이크로서비스',
      '사이드카 오버헤드를 감당할 수 없는 저사양 환경',
    ],
    evolvesTo: [],
    evolvesFrom: ['PAT-006'],
    tags: ['kubernetes', 'service-mesh', 'microservices', 'istio', 'envoy'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(CNCF_SECURITY, 'Service Mesh Architecture'),
        withSection(K8S_DOCS, 'Service Mesh'),
      ],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-K8S-002',
    type: 'pattern',
    name: 'GitOps CI/CD',
    nameKo: 'GitOps CI/CD 파이프라인',
    description:
      'Infrastructure and application deployment managed through Git as single source of truth, with automated reconciliation of desired state in Kubernetes clusters.',
    descriptionKo:
      'Git을 단일 진실 소스(SSoT)로 사용하여 인프라와 애플리케이션 배포를 관리하고, Kubernetes 클러스터의 원하는 상태를 자동으로 조정합니다.',
    requiredComponents: [
      { type: 'kubernetes', minCount: 1 },
      { type: 'container', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'load-balancer', benefit: 'Blue-green and canary deployment traffic routing', benefitKo: '블루-그린 및 카나리 배포 트래픽 라우팅' },
      { type: 'iam', benefit: 'CI/CD pipeline authentication and authorization', benefitKo: 'CI/CD 파이프라인 인증 및 인가' },
      { type: 'firewall', benefit: 'Cluster network policy enforcement', benefitKo: '클러스터 네트워크 정책 적용' },
      { type: 'dns', benefit: 'External DNS for dynamic endpoint management', benefitKo: '동적 엔드포인트 관리를 위한 External DNS' },
    ],
    scalability: 'auto',
    complexity: 3,
    bestForKo: [
      '빈번한 배포가 필요한 애플리케이션',
      '멀티 클러스터 관리 환경',
      '감사 추적과 롤백이 중요한 시스템',
      'DevOps 성숙도가 높은 조직',
    ],
    notSuitableForKo: [
      'Git 기반 워크플로우에 익숙하지 않은 팀',
      '단일 서버 배포 환경',
      '수동 배포 프로세스가 필수인 규정 환경',
    ],
    evolvesTo: [],
    evolvesFrom: ['PAT-007'],
    tags: ['kubernetes', 'gitops', 'cicd', 'argocd', 'flux'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(CNCF_SECURITY, 'Supply Chain Security - GitOps'),
        withSection(CIS_KUBERNETES, '5.2 - Pod Security Standards'),
      ],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-K8S-003',
    type: 'pattern',
    name: 'Blue-Green / Canary Deployment',
    nameKo: '블루-그린 / 카나리 배포',
    description:
      'Deployment strategy that maintains two identical production environments (Blue-Green) or gradually shifts traffic to a new version (Canary), enabling zero-downtime releases and instant rollbacks.',
    descriptionKo:
      '두 개의 동일한 운영 환경을 유지(블루-그린)하거나, 새 버전으로 트래픽을 점진적으로 이동(카나리)하여 무중단 배포와 즉시 롤백을 가능하게 하는 배포 전략입니다.',
    requiredComponents: [
      { type: 'kubernetes', minCount: 1 },
      { type: 'container', minCount: 2 },
      { type: 'load-balancer', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'dns', benefit: 'Weighted DNS routing for traffic splitting', benefitKo: '가중치 DNS 라우팅으로 트래픽 분할' },
      { type: 'iam', benefit: 'Deployment pipeline authorization', benefitKo: '배포 파이프라인 인가' },
      { type: 'cache', benefit: 'Session affinity during migration', benefitKo: '마이그레이션 중 세션 친화성' },
      { type: 'ids-ips', benefit: 'Monitor for anomalies during rollout', benefitKo: '롤아웃 중 이상 징후 모니터링' },
    ],
    scalability: 'auto',
    complexity: 3,
    bestForKo: [
      '무중단 배포가 필수인 프로덕션 서비스',
      '새 버전의 점진적 검증이 필요한 환경',
      'SLA 99.9% 이상 서비스',
      'A/B 테스트와 배포를 결합하려는 팀',
    ],
    notSuitableForKo: [
      '단일 인스턴스로 충분한 개발/스테이징 환경',
      '데이터베이스 스키마 변경이 빈번한 시스템 (별도 전략 필요)',
      '리소스 제약이 있는 환경 (2배 인프라 필요)',
    ],
    evolvesTo: [],
    evolvesFrom: ['PAT-K8S-002'],
    tags: ['kubernetes', 'blue-green', 'canary', 'zero-downtime', 'deployment'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(K8S_DOCS, 'Deployment Strategies'),
        withSection(CNCF_SECURITY, 'Supply Chain Security - Progressive Delivery'),
      ],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
];

// ---------------------------------------------------------------------------
// Security Patterns Extension (PAT-SEC-016 ~ PAT-SEC-018)
// ---------------------------------------------------------------------------

const securityExtPatterns: ArchitecturePattern[] = [
  {
    id: 'PAT-SEC-016',
    type: 'pattern',
    name: 'Zero Trust Network Access',
    nameKo: '제로 트러스트 네트워크 접근',
    description:
      'Security architecture that eliminates implicit trust, requiring continuous verification of every user, device, and connection regardless of network location.',
    descriptionKo:
      '암묵적 신뢰를 제거하고, 네트워크 위치와 관계없이 모든 사용자, 디바이스, 연결에 대해 지속적 검증을 요구하는 보안 아키텍처입니다.',
    requiredComponents: [
      { type: 'firewall', minCount: 1 },
      { type: 'iam', minCount: 1 },
      { type: 'mfa', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'sso', benefit: 'Centralized identity verification', benefitKo: '중앙 집중 ID 검증' },
      { type: 'nac', benefit: 'Device posture assessment and compliance', benefitKo: '디바이스 상태 평가 및 컴플라이언스' },
      { type: 'ids-ips', benefit: 'Continuous threat monitoring and micro-segmentation', benefitKo: '지속적 위협 모니터링 및 마이크로 세그먼테이션' },
      { type: 'vpn-gateway', benefit: 'Encrypted remote access as transitional component', benefitKo: '전환기 구성요소로서의 암호화된 원격 접근' },
    ],
    scalability: 'high',
    complexity: 4,
    bestForKo: [
      '원격/하이브리드 근무 환경',
      '클라우드 네이티브 인프라',
      '높은 보안 요구사항의 금융/의료 조직',
      '멀티 클라우드 환경',
    ],
    notSuitableForKo: [
      '인증 인프라가 전혀 없는 초기 단계',
      '레거시 애플리케이션만 운영하는 환경',
      '보안 팀이 없는 소규모 조직',
    ],
    evolvesTo: [],
    evolvesFrom: ['PAT-012', 'PAT-013'],
    tags: ['security', 'zero-trust', 'ztna', 'identity', 'micro-segmentation'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(NIST_800_207, 'Section 2 - Zero Trust Basics'),
        withSection(NIST_800_207, 'Section 3 - Zero Trust Architecture Components'),
      ],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-SEC-017',
    type: 'pattern',
    name: 'SASE Architecture',
    nameKo: 'SASE 아키텍처',
    description:
      'Secure Access Service Edge combines network security (FWaaS, SWG, CASB) with WAN capabilities (SD-WAN) delivered as a cloud service for distributed enterprise environments.',
    descriptionKo:
      'SASE는 네트워크 보안(FWaaS, SWG, CASB)과 WAN 기능(SD-WAN)을 결합하여 분산 기업 환경에 클라우드 서비스로 제공하는 아키텍처입니다.',
    requiredComponents: [
      { type: 'sase-gateway', minCount: 1 },
      { type: 'sd-wan', minCount: 1 },
      { type: 'iam', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'ztna-broker', benefit: 'Zero Trust application-level access', benefitKo: '제로 트러스트 애플리케이션 수준 접근' },
      { type: 'casb', benefit: 'Cloud application visibility and control', benefitKo: '클라우드 애플리케이션 가시성 및 제어' },
      { type: 'firewall', benefit: 'On-premise firewall for hybrid SASE', benefitKo: '하이브리드 SASE를 위한 온프레미스 방화벽' },
      { type: 'mfa', benefit: 'Strong authentication for SASE access', benefitKo: 'SASE 접근을 위한 강력한 인증' },
      { type: 'dns', benefit: 'DNS-layer security filtering', benefitKo: 'DNS 계층 보안 필터링' },
    ],
    scalability: 'auto',
    complexity: 5,
    bestForKo: [
      '지사/원격 사무실이 많은 분산 기업',
      '클라우드 우선 전략을 채택한 조직',
      'MPLS 회선을 SD-WAN으로 전환하는 기업',
      '글로벌 사용자 접근이 필요한 환경',
    ],
    notSuitableForKo: [
      '단일 사무실 소규모 기업',
      '온프레미스만 운영하는 환경',
      'WAN 연결이 필요 없는 로컬 서비스',
    ],
    evolvesTo: ['PAT-SEC-018'],
    evolvesFrom: ['PAT-015'],
    tags: ['security', 'sase', 'sd-wan', 'zero-trust', 'cloud-security'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(NIST_800_207, 'Section 4 - Deployment Models'),
        withSection(NIST_800_53, 'SC-7 - Boundary Protection'),
      ],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-SEC-018',
    type: 'pattern',
    name: 'SOC Operations Architecture',
    nameKo: 'SOC 운영 아키텍처',
    description:
      'Security Operations Center architecture that integrates SIEM, SOAR, and threat intelligence for centralized security monitoring, incident detection, and automated response.',
    descriptionKo:
      'SIEM, SOAR, 위협 인텔리전스를 통합하여 중앙 집중 보안 모니터링, 사고 탐지 및 자동 대응을 구현하는 보안 운영 센터 아키텍처입니다.',
    requiredComponents: [
      { type: 'siem', minCount: 1 },
      { type: 'firewall', minCount: 1 },
      { type: 'ids-ips', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'soar', benefit: 'Automated incident response and playbooks', benefitKo: '자동 사고 대응 및 플레이북' },
      { type: 'dlp', benefit: 'Data exfiltration detection and log correlation', benefitKo: '데이터 유출 탐지 및 로그 상관분석' },
      { type: 'nac', benefit: 'Network-level containment actions', benefitKo: '네트워크 수준 격리 조치' },
      { type: 'waf', benefit: 'Web attack detection and WAF log analysis', benefitKo: '웹 공격 탐지 및 WAF 로그 분석' },
      { type: 'casb', benefit: 'Cloud security event correlation', benefitKo: '클라우드 보안 이벤트 상관분석' },
    ],
    scalability: 'high',
    complexity: 4,
    bestForKo: [
      '24/7 보안 모니터링이 필요한 조직',
      '규정 준수 감사가 필요한 금융/의료 기업',
      '보안 사고 대응 시간(MTTR) 단축이 필요한 환경',
      '다수의 보안 장비를 통합 관리하는 대규모 조직',
    ],
    notSuitableForKo: [
      '보안 운영 인력이 없는 소규모 기업',
      '보안 장비가 3대 미만인 환경',
      'MSSP 서비스로 대체 가능한 경우',
    ],
    evolvesTo: [],
    evolvesFrom: ['PAT-SEC-017'],
    tags: ['security', 'soc', 'siem', 'soar', 'incident-response', 'monitoring'],
    trust: {
      confidence: 0.90,
      sources: [
        withSection(NIST_800_53, 'AU-6 - Audit Review, Analysis, and Reporting'),
        withSection(CIS_V8_13, 'Network Monitoring and Defense'),
      ],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
];

// ---------------------------------------------------------------------------
// Hybrid/Multi-Cloud Patterns (PAT-HYB-001 ~ PAT-HYB-002)
// ---------------------------------------------------------------------------

const hybridPatterns: ArchitecturePattern[] = [
  {
    id: 'PAT-HYB-001',
    type: 'pattern',
    name: 'Hybrid Cloud DR',
    nameKo: '하이브리드 클라우드 DR',
    description:
      'Disaster recovery architecture that uses public cloud as a DR site for on-premise infrastructure, enabling cost-effective warm/hot standby with automated failover.',
    descriptionKo:
      '온프레미스 인프라의 DR 사이트로 퍼블릭 클라우드를 활용하여 비용 효율적인 웜/핫 대기와 자동 페일오버를 구현하는 재해 복구 아키텍처입니다.',
    requiredComponents: [
      { type: 'private-cloud', minCount: 1 },
      { type: 'backup', minCount: 1 },
      { type: 'vpn-gateway', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'aws-vpc', benefit: 'AWS as DR target with automated recovery', benefitKo: '자동 복구 기능의 AWS DR 대상' },
      { type: 'azure-vnet', benefit: 'Azure Site Recovery integration', benefitKo: 'Azure Site Recovery 통합' },
      { type: 'dns', benefit: 'DNS failover for automatic traffic redirection', benefitKo: '자동 트래픽 리디렉션을 위한 DNS 페일오버' },
      { type: 'load-balancer', benefit: 'Cross-site traffic distribution', benefitKo: '크로스 사이트 트래픽 분산' },
    ],
    scalability: 'high',
    complexity: 4,
    bestForKo: [
      'RPO/RTO가 중요한 미션 크리티컬 시스템',
      '자체 DR 센터 구축 비용이 부담되는 기업',
      '클라우드 마이그레이션 과도기에 있는 조직',
      '규정 준수로 온프레미스 유지가 필요한 환경',
    ],
    notSuitableForKo: [
      '이미 멀티 리전 클라우드 네이티브 아키텍처인 경우',
      '네트워크 지연에 극도로 민감한 실시간 시스템',
      'WAN 대역폭이 데이터 복제를 감당할 수 없는 경우',
    ],
    evolvesTo: ['PAT-HYB-002'],
    evolvesFrom: ['PAT-018'],
    tags: ['hybrid', 'disaster-recovery', 'cloud', 'failover', 'backup'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(AWS_WAF_REL, 'Disaster Recovery Strategies'),
        withSection(NIST_800_145, 'Section 3 - Cloud Deployment Models'),
      ],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-HYB-002',
    type: 'pattern',
    name: 'Multi-Cloud Active-Active',
    nameKo: '멀티 클라우드 Active-Active',
    description:
      'Architecture that distributes workloads across multiple cloud providers simultaneously, eliminating vendor lock-in and providing maximum availability through geographic and provider diversity.',
    descriptionKo:
      '여러 클라우드 공급자에 워크로드를 동시에 분산하여 벤더 종속을 제거하고, 지리적/공급자 다양성을 통해 최대 가용성을 제공하는 아키텍처입니다.',
    requiredComponents: [
      { type: 'load-balancer', minCount: 1 },
      { type: 'dns', minCount: 1 },
      { type: 'firewall', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'aws-vpc', benefit: 'AWS as one of the active cloud sites', benefitKo: 'Active 클라우드 사이트 중 하나로 AWS' },
      { type: 'azure-vnet', benefit: 'Azure as one of the active cloud sites', benefitKo: 'Active 클라우드 사이트 중 하나로 Azure' },
      { type: 'gcp-network', benefit: 'GCP as one of the active cloud sites', benefitKo: 'Active 클라우드 사이트 중 하나로 GCP' },
      { type: 'iam', benefit: 'Cross-cloud identity federation', benefitKo: '크로스 클라우드 ID 페더레이션' },
    ],
    scalability: 'auto',
    complexity: 5,
    bestForKo: [
      '99.99% 이상 가용성이 필요한 글로벌 서비스',
      '벤더 종속 탈피가 필요한 조직',
      '지역별 규정 준수가 필요한 글로벌 기업',
      '특정 클라우드의 장점을 선택적으로 활용하려는 환경',
    ],
    notSuitableForKo: [
      '운영 인력이 제한적인 소규모 팀',
      '단일 리전 서비스',
      '데이터 주권 규정으로 단일 클라우드 사용이 강제되는 경우',
    ],
    evolvesTo: [],
    evolvesFrom: ['PAT-HYB-001', 'PAT-016'],
    tags: ['hybrid', 'multi-cloud', 'active-active', 'vendor-diversity', 'global'],
    trust: {
      confidence: 0.85,
      sources: [
        withSection(NIST_800_145, 'Section 3 - Cloud Deployment Models'),
        withSection(AZURE_CAF, 'Multi-Cloud Strategy'),
      ],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
];

// ---------------------------------------------------------------------------
// Aggregated data
// ---------------------------------------------------------------------------

/**
 * All architecture patterns — frozen readonly array.
 * 30 patterns across 8 categories: Basic, Extended, Security, Cloud, Telecom, K8s, SecurityExt, Hybrid.
 */
export const ARCHITECTURE_PATTERNS: readonly ArchitecturePattern[] = Object.freeze([
  ...basicPatterns,
  ...extendedPatterns,
  ...securityPatterns,
  ...cloudPatterns,
  ...telecomPatterns,
  ...k8sPatterns,
  ...securityExtPatterns,
  ...hybridPatterns,
]);

/** Alias for index.ts compatibility */
export const PATTERNS = ARCHITECTURE_PATTERNS;

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Detects which architecture patterns match the given InfraSpec.
 *
 * A pattern matches if ALL of its requiredComponents exist in the spec
 * with at least the specified minCount.
 *
 * @param spec - The infrastructure specification to analyze
 * @returns Array of matching patterns, sorted by complexity (ascending)
 */
export function detectPatterns(spec: InfraSpec): ArchitecturePattern[] {
  const nodeTypeCounts = new Map<string, number>();

  for (const node of spec.nodes) {
    const count = nodeTypeCounts.get(node.type) ?? 0;
    nodeTypeCounts.set(node.type, count + 1);
  }

  const matched = ARCHITECTURE_PATTERNS.filter((pattern) =>
    pattern.requiredComponents.every(
      (req) => (nodeTypeCounts.get(req.type) ?? 0) >= req.minCount,
    ),
  );

  // Sort by complexity ascending so simpler patterns appear first
  return matched.sort((a, b) => a.complexity - b.complexity);
}

/**
 * Retrieves a pattern by its unique ID.
 *
 * @param id - Pattern ID (e.g. 'PAT-001')
 * @returns The matching pattern or undefined
 */
export function getPatternById(id: string): ArchitecturePattern | undefined {
  return ARCHITECTURE_PATTERNS.find((p) => p.id === id);
}

/**
 * Returns all patterns with complexity at or below the specified maximum.
 *
 * @param max - Maximum complexity level (1-5)
 * @returns Array of patterns sorted by complexity ascending
 */
export function getPatternsByComplexity(max: number): ArchitecturePattern[] {
  return ARCHITECTURE_PATTERNS
    .filter((p) => p.complexity <= max)
    .sort((a, b) => a.complexity - b.complexity);
}
