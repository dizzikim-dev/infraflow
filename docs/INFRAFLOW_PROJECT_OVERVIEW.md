# InfraFlow 프로젝트 종합 문서

> **최종 업데이트**: 2026-02-11
> **버전**: Phase A~D 완료, 코드 리뷰 Phase 1~3 완료, Phase 4 진행 중
> **코드베이스**: 419 소스 파일, ~143K LOC, 92 테스트 파일, 2,595 테스트

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택 및 아키텍처](#2-기술-스택-및-아키텍처)
3. [디렉토리 구조](#3-디렉토리-구조)
4. [데이터셋 총 정리](#4-데이터셋-총-정리)
5. [파서 및 LLM 파이프라인](#5-파서-및-llm-파이프라인)
6. [User Flow 상세](#6-user-flow-상세)
7. [기능 구현 현황](#7-기능-구현-현황)
8. [테스트 현황](#8-테스트-현황)
9. [고도화 로드맵](#9-고도화-로드맵)

---

## 1. 프로젝트 개요

InfraFlow는 **자연어 프롬프트 한 줄로 인프라 아키텍처 다이어그램을 생성**하는 AI 기반 시각화 플랫폼입니다.

```
사용자: "3티어 웹 아키텍처에 WAF 붙여줘"
     ↓
┌─────────────────────────────────────────────────┐
│  [User] → [WAF] → [LB] → [Web] → [App] → [DB] │
│   외부      DMZ     DMZ    내부    내부    데이터  │
│  애니메이션 흐름 표시 + 보안 정책 오버레이          │
└─────────────────────────────────────────────────┘
```

### 핵심 기능
- **자연어 → 다이어그램**: 한국어/영어 프롬프트로 인프라 생성
- **LLM 기반 수정**: "WAF 추가해줘", "방화벽 앞에 IDS 넣어줘" 등 자연어 편집
- **지식 그래프**: 105개 관계, 45개 안티패턴, 64개 장애 시나리오 기반 분석
- **실시간 애니메이션**: 데이터 흐름 시뮬레이션 + 정책 오버레이
- **다이어그램 비교**: 변경 전/후 Side-by-Side 비교 + 차이점 하이라이트
- **다양한 내보내기**: PNG, SVG, PDF, JSON, PlantUML, Terraform, Kubernetes YAML

---

## 2. 기술 스택 및 아키텍처

### 기술 스택

| 영역 | 기술 | 버전 | 용도 |
|------|------|------|------|
| **프레임워크** | Next.js | 16 | SSR + App Router |
| **UI** | React | 19 | 컴포넌트 |
| **다이어그램** | @xyflow/react | 최신 | 노드/엣지 캔버스 |
| **애니메이션** | framer-motion | 12+ | UI 전환 + 흐름 |
| **상태** | React Hooks | - | 합성 훅 패턴 |
| **검증** | Zod | 4 | 스키마 검증 |
| **인증** | NextAuth.js | v5 beta | JWT + OAuth |
| **DB** | Prisma + PostgreSQL | - | ORM + 영속화 |
| **테스트** | Vitest + Playwright | - | 단위/E2E |
| **스타일** | Tailwind CSS | - | 유틸리티 CSS |
| **LLM** | Claude / GPT | - | 프롬프트 해석 |

### 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                   │
│                                                                         │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────────────────────┐  │
│  │  Header  │    │  PromptPanel │    │       InfraEditor            │  │
│  │ (13 버튼) │    │ (생성/수정)   │    │  ┌──────────────────────┐   │  │
│  └──────────┘    └──────┬───────┘    │  │    FlowCanvas        │   │  │
│                         │            │  │  (React Flow 캔버스)   │   │  │
│                         ▼            │  └──────────────────────┘   │  │
│               ┌─────────────────┐    │  ┌──────────────────────┐   │  │
│               │  useInfraState  │◀──▶│  │  13개 패널 (동적 로드) │   │  │
│               │  ├ useNodes     │    │  │  HealthCheck, CVE,    │   │  │
│               │  ├ useEdges     │    │  │  Cloud, Compliance,   │   │  │
│               │  ├ useParser    │    │  │  Benchmark, Export... │   │  │
│               │  ├ useSelection │    │  └──────────────────────┘   │  │
│               │  └ useAnimation │    └──────────────────────────────┘  │
│               └────────┬────────┘                                      │
│                        │                                                │
├────────────────────────┼────────────────────────────────────────────────┤
│                        ▼            BACKEND                             │
│               ┌─────────────────┐                                      │
│               │  API Routes     │                                      │
│               │  /api/modify    │──▶ LLM (Claude/GPT)                  │
│               │  /api/diagrams  │──▶ Prisma (PostgreSQL)               │
│               │  /api/knowledge │──▶ Knowledge API                     │
│               │  /api/auth      │──▶ NextAuth.js                       │
│               └─────────────────┘                                      │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                           DATA LAYER                                    │
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐ │
│  │Infrastructure│  │  Knowledge  │  │   Learning   │  │   Prisma     │ │
│  │     DB       │  │   Graph     │  │   System     │  │   (Auth,     │ │
│  │  56 컴포넌트  │  │  400+ 항목  │  │  IndexedDB   │  │   Diagram)  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Hook 합성 구조

```
useInfraState (오케스트레이터)
├── useNodes — 노드 CRUD, 스펙 동기화
├── useEdges — 엣지 CRUD, 스펙 동기화
├── usePromptParser (합성 훅)
│   ├── useParserContext — 대화 컨텍스트 관리
│   ├── useLocalParser — 로컬 파싱 (패턴 + 템플릿)
│   └── useLLMModifier — LLM API 호출 + 결과 적용
├── useInfraSelection — 노드/정책 선택 상태
├── useAnimationScenario — 애니메이션 시나리오 관리
└── useFeedback — 사용자 피드백 수집
```

---

## 3. 디렉토리 구조

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # 홈 (빈 에디터)
│   ├── layout.tsx                # 루트 레이아웃 (PluginProvider)
│   ├── auth/
│   │   ├── login/page.tsx        # 로그인 (OAuth + Credentials)
│   │   └── register/page.tsx     # 회원가입
│   ├── dashboard/page.tsx        # 다이어그램 목록
│   ├── diagram/[id]/page.tsx     # 다이어그램 편집 (저장된)
│   ├── admin/
│   │   ├── page.tsx              # 관리자 대시보드
│   │   ├── users/                # 사용자 관리 (목록, 상세)
│   │   ├── components/           # 인프라 컴포넌트 CRUD
│   │   ├── plugins/              # 플러그인 관리
│   │   └── knowledge/            # 지식 DB 관리 (10개 엔티티 × CRUD)
│   └── api/
│       ├── modify/route.ts       # LLM 다이어그램 수정 API
│       ├── parse/route.ts        # 프롬프트 파싱 API
│       ├── diagrams/             # 다이어그램 CRUD API
│       ├── knowledge/            # 지식 DB API (21 라우트)
│       └── auth/                 # NextAuth.js 인증 API
│
├── components/
│   ├── editor/
│   │   ├── InfraEditor.tsx       # 메인 에디터 (632줄, 15+ 패널 관리)
│   │   └── FlowCanvas.tsx        # React Flow 캔버스
│   ├── nodes/
│   │   ├── BaseNode.tsx          # 범용 노드 컴포넌트 (카테고리별 색상)
│   │   ├── nodeConfig.ts         # 노드 스타일 설정
│   │   └── nodeIcons.ts          # 24개 SVG 아이콘
│   ├── edges/
│   │   └── AnimatedEdge.tsx      # 흐름 유형별 애니메이션 엣지
│   ├── panels/                   # 13개 기능 패널 (모두 동적 로드)
│   │   ├── PromptPanel.tsx       # 프롬프트 입력 (생성/수정 모드)
│   │   ├── HealthCheckPanel.tsx  # 안티패턴 + 의존성 + 장애 분석
│   │   ├── VulnerabilityPanel.tsx # 47개 CVE 취약점
│   │   ├── CloudCatalogPanel.tsx  # 70개 클라우드 서비스
│   │   ├── IndustryCompliancePanel.tsx # 5개 산업 규정
│   │   ├── BenchmarkPanel.tsx    # 14×4 사이징 매트릭스
│   │   ├── InsightsPanel.tsx     # 사용 빈도 분석 (4탭)
│   │   ├── TemplateGallery.tsx   # 20+ 템플릿 갤러리
│   │   ├── ExportPanel.tsx       # PNG/SVG/PDF/JSON 내보내기
│   │   ├── ScenarioSelector.tsx  # 12+ 애니메이션 시나리오
│   │   ├── AnimationControlPanel.tsx # 재생/정지/속도 제어
│   │   ├── PolicyOverlay.tsx     # 정책 오버레이 (노드 호버)
│   │   └── NodeDetailPanel.tsx   # 노드 상세 정보
│   ├── comparison/               # 다이어그램 비교 모드
│   ├── context-menu/             # 캔버스/노드/엣지 우클릭 메뉴
│   └── layout/
│       ├── Header.tsx            # 툴바 (13개 액션 버튼)
│       └── EmptyState.tsx        # 빈 상태 UI
│
├── hooks/                        # 26개 커스텀 훅
│   ├── useInfraState.ts          # 메인 오케스트레이터
│   ├── useNodes.ts / useEdges.ts # 노드/엣지 상태
│   ├── usePromptParser.ts        # 파서 합성 훅
│   ├── useLocalParser.ts         # 로컬 패턴 파싱
│   ├── useLLMModifier.ts         # LLM API 호출
│   ├── useHistory.ts             # Undo/Redo (연결됨)
│   ├── useAnimation.ts           # 흐름 애니메이션
│   ├── useDiagramPersistence.ts  # 자동 저장
│   ├── useFeedback.ts            # 피드백 수집
│   ├── useAnalytics.ts           # 사용 분석
│   ├── useCalibration.ts         # 안티패턴 보정
│   ├── useVulnerabilities.ts     # 취약점 (API fetch)
│   ├── useBenchmark.ts           # 벤치마크 (API fetch)
│   ├── useCloudCatalog.ts        # 클라우드 카탈로그 (API fetch)
│   └── useIndustryCompliance.ts  # 산업 규정 (API fetch)
│
├── lib/
│   ├── data/                     # 인프라 컴포넌트 DB (SSoT)
│   │   ├── infrastructureDB.ts   # 메인 진입점 + 헬퍼 함수
│   │   └── components/           # 9개 카테고리별 데이터 파일
│   ├── knowledge/                # 지식 그래프 (400+ 항목)
│   │   ├── types.ts              # 타입 정의
│   │   ├── relationships.ts      # 105개 관계
│   │   ├── patterns.ts           # 32개 아키텍처 패턴
│   │   ├── antipatterns.ts       # 45개 안티패턴 (탐지 함수 포함)
│   │   ├── failures.ts           # 64개 장애 시나리오
│   │   ├── performance.ts        # 43개 성능 프로파일
│   │   ├── vulnerabilities.ts    # 47개 CVE 취약점
│   │   ├── cloudCatalog.ts       # 67개 클라우드 서비스
│   │   ├── benchmarks.ts         # 14×4 사이징 매트릭스
│   │   ├── sourceRegistry.ts     # 48개 검증된 출처
│   │   ├── contextEnricher.ts    # LLM 프롬프트 지식 강화
│   │   └── index.ts              # 배럴 export
│   ├── parser/                   # 파싱 파이프라인
│   │   ├── UnifiedParser.ts      # 진입점 (7개 명령어 라우팅)
│   │   ├── patterns.ts           # 60+ 정규식 패턴 (한/영)
│   │   ├── templates.ts          # 키워드 → 템플릿 매칭
│   │   ├── templateMatcher.ts    # 템플릿 검색 로직
│   │   ├── componentDetector.ts  # 컴포넌트 감지 + 스펙 생성
│   │   ├── specBuilder.ts        # 스펙 빌더 (명령어별 핸들러)
│   │   ├── intelligentParser.ts  # LLM 기반 인텐트 분석
│   │   ├── contextBuilder.ts     # 캔버스 → DiagramContext 변환
│   │   ├── prompts.ts            # LLM 시스템/사용자 프롬프트
│   │   ├── responseValidator.ts  # LLM 응답 JSON 파싱 + Zod 검증
│   │   ├── diffApplier.ts        # Operation → InfraSpec 적용
│   │   └── changeRiskAssessor.ts # 변경 위험도 평가
│   ├── llm/                      # LLM 공통 모듈
│   │   ├── providers.ts          # Claude/GPT 프로바이더
│   │   ├── jsonParser.ts         # JSON 추출 유틸
│   │   ├── rateLimitHeaders.ts   # Rate limit 헤더 관리
│   │   └── fallbackTemplates.ts  # LLM 실패 시 폴백
│   ├── security/                 # 보안
│   │   └── llmSecurityControls.ts # OWASP LLM Top 10 (파이프라인 연결됨)
│   ├── learning/                 # 자동 학습 시스템
│   │   ├── types.ts              # 타입 정의
│   │   ├── feedbackStore.ts      # IndexedDB 피드백 저장
│   │   ├── usageStore.ts         # IndexedDB 사용 이벤트
│   │   ├── calibrationStore.ts   # IndexedDB 보정 데이터
│   │   ├── analyticsEngine.ts    # 빈도 분석 + 공통 발생
│   │   ├── calibrationEngine.ts  # 안티패턴 심각도 보정
│   │   └── specDiffer.ts         # 스펙 차이 비교
│   ├── templates/                # 템플릿 시스템
│   │   ├── templateManager.ts    # 20개 빌트인 + 커스텀 CRUD
│   │   └── templateRecommender.ts # 프롬프트 기반 추천 (연결됨)
│   ├── layout/
│   │   └── layoutEngine.ts       # 티어 기반 자동 배치
│   ├── export/                   # 내보내기
│   │   ├── exportUtils.ts        # PNG/SVG/PDF (동적 import)
│   │   ├── pdfReportGenerator.ts # PDF 리포트
│   │   ├── plantUMLExport.ts     # PlantUML C4 다이어그램
│   │   ├── terraformExport.ts    # Terraform HCL
│   │   └── kubernetesExport.ts   # Kubernetes YAML
│   ├── animation/                # 애니메이션 엔진
│   ├── audit/                    # 보안 감사 + 규정 준수
│   │   ├── securityAudit.ts      # 보안 감사 로직
│   │   ├── complianceChecker.ts  # 규정 준수 검사
│   │   └── industryCompliance.ts # 산업별 프리셋 (5개)
│   ├── plugins/                  # 플러그인 시스템
│   ├── auth/                     # NextAuth.js 설정
│   ├── design/                   # 디자인 토큰
│   ├── middleware/               # Rate Limiter
│   └── utils/                    # 유틸리티
│       ├── logger.ts             # 구조화된 로거
│       ├── retry.ts              # 재시도 (LLM API 연결됨)
│       ├── llmMetrics.ts         # LLM 메트릭 (API 연결됨)
│       └── severity.ts           # 심각도 정렬 상수
│
├── types/
│   ├── infra.ts                  # InfraNodeType, InfraSpec, 등
│   ├── guards.ts                 # 런타임 타입 가드
│   ├── plugin.ts                 # 플러그인 타입
│   └── index.ts                  # 배럴 export
│
└── middleware.ts                 # 라우트 보호 (/dashboard, /admin)
```

---

## 4. 데이터셋 총 정리

### 4.1 인프라 컴포넌트 DB (SSoT)

**위치**: `src/lib/data/`
**총 컴포넌트**: 56개, 9개 카테고리

| 카테고리 | 수량 | 노드 타입 | 색상 |
|----------|------|-----------|------|
| **Security** | 11 | firewall, waf, ids-ips, vpn-gateway, nac, dlp, sase-gateway, ztna-broker, casb, siem, soar | Red |
| **Network** | 7 | router, switch-l2, switch-l3, load-balancer, dns, cdn, sd-wan | Blue |
| **Compute** | 6 | web-server, app-server, db-server, cache, container, kubernetes | Green |
| **Cloud** | 4 | aws-vpc, azure-vnet, gcp-network, private-cloud | Purple |
| **Storage** | 5 | san-nas, object-storage, backup, storage | Amber |
| **Auth** | 4 | ldap-ad, sso, mfa, iam | Pink |
| **External** | 2 | user, internet | Gray |
| **Telecom** | 4 | central-office, base-station, olt, customer-premise 외 | Teal |
| **WAN** | 13 | pe-router, p-router, mpls-network, dedicated-line, metro-ethernet 외 | Indigo |

#### 컴포넌트 데이터 구조
```typescript
interface InfraComponent {
  id: string;                       // kebab-case (예: 'load-balancer')
  name: string;                     // 영문명
  nameKo: string;                   // 한국어명
  category: NodeCategory;           // 카테고리
  tier: TierType;                   // 'external' | 'dmz' | 'internal' | 'data'
  description: string;              // 영문 설명
  descriptionKo: string;            // 한국어 설명
  functions: string[];              // 기능 목록 (최소 3개)
  functionsKo: string[];            // 한국어 기능 목록
  features: string[];               // 특징 (최소 2개)
  featuresKo: string[];
  recommendedPolicies: PolicyRecommendation[];  // 최소 2개
  ports?: number[];
  protocols?: string[];
  vendors?: string[];
}
```

#### 접근 패턴
```typescript
// SSoT 헬퍼 (tokens.ts, nodeConfig.ts도 이를 사용)
getCategoryForType('firewall')  // → 'security'
getTierForType('firewall')      // → 'dmz'
getLabelForType('firewall')     // → '방화벽'
```

---

### 4.2 지식 그래프 (Knowledge Graph)

**위치**: `src/lib/knowledge/`
**총 항목**: 400+

#### 관계 (Relationships) — 105개

```typescript
interface ComponentRelationship {
  id: string;                        // 'REL-SEC-001'
  source: InfraNodeType;
  target: InfraNodeType;
  relationshipType: 'requires' | 'recommends' | 'conflicts' | 'enhances' | 'protects';
  strength: 'mandatory' | 'strong' | 'weak';
  direction: 'upstream' | 'downstream' | 'bidirectional';
  reason: string; reasonKo: string;
  trust: TrustMetadata;
}
```

| 카테고리 | 수량 | 예시 |
|----------|------|------|
| REL-SEC (보안) | ~20 | firewall → router (requires, mandatory) |
| REL-NET (네트워크) | ~15 | load-balancer → web-server (requires) |
| REL-CMP (컴퓨팅) | ~10 | kubernetes → container (requires) |
| REL-SASE | 10 | sase-gateway → ztna-broker (enhances) |
| REL-CLD (클라우드) | ~12 | aws-vpc → load-balancer (recommends) |
| REL-AUTH (인증) | ~10 | sso → ldap-ad (requires) |
| 기타 | ~28 | 충돌, 하이브리드, K8s |

#### 아키텍처 패턴 (Patterns) — 32개

```typescript
interface ArchitecturePattern {
  id: string;                        // 'PAT-001'
  name: string; nameKo: string;
  requiredComponents: { type: InfraNodeType; minCount: number }[];
  optionalComponents: { type: InfraNodeType; benefit: string }[];
  complexity: 1 | 2 | 3 | 4 | 5;
  scalability: 'low' | 'medium' | 'high' | 'auto';
  evolvesTo?: string[];              // 패턴 진화 그래프
  trust: TrustMetadata;
}
```

| 분류 | 수량 | 예시 |
|------|------|------|
| 기본 | 5 | 3-Tier, 2-Tier, Microservices, Load Balanced |
| 확장 | 5 | API Gateway, CDN, Event-Driven |
| 보안 | 7 | Zero Trust, ZTNA, SASE, SOC, Defense-in-Depth |
| 클라우드 | 3 | Hybrid Cloud, Multi-Cloud, Serverless |
| 텔레콤 | 6 | Ring, Dual Homing, Metro Ethernet |
| K8s | 3 | Service Mesh, GitOps, Blue-Green |
| 하이브리드 | 2 | Hybrid WAN, Multi-Site DR |

#### 안티패턴 (Anti-Patterns) — 45개

```typescript
interface AntiPattern {
  id: string;                        // 'AP-SEC-001'
  name: string; nameKo: string;
  severity: 'critical' | 'high' | 'medium';
  detection: (spec: InfraSpec) => boolean;  // 자동 탐지 함수
  detectionDescriptionKo: string;
  problemKo: string; impactKo: string; solutionKo: string;
  trust: TrustMetadata;
}
```

| 분류 | 수량 | 심각도 분포 |
|------|------|------------|
| AP-SEC (보안) | ~12 | Critical: 4, High: 5, Medium: 3 |
| AP-HA (고가용성) | ~8 | Critical: 2, High: 4, Medium: 2 |
| AP-PERF (성능) | ~6 | High: 3, Medium: 3 |
| AP-ARCH (아키텍처) | ~5 | High: 3, Medium: 2 |
| AP-SASE | 3 | High: 2, Medium: 1 |
| AP-CLD (클라우드) | 6 | High: 3, Medium: 3 |
| AP-K8S | 4 | High: 2, Medium: 2 |
| AP-AUTH (인증) | 4 | Critical: 1, High: 2, Medium: 1 |

#### 장애 시나리오 (Failures) — 64개

```typescript
interface FailureScenario {
  id: string;                        // 'FAIL-NET-001'
  component: InfraNodeType;
  titleKo: string; scenarioKo: string;
  impact: 'service-down' | 'degraded' | 'data-loss' | 'security-breach';
  likelihood: 'high' | 'medium' | 'low';
  affectedComponents: InfraNodeType[];
  preventionKo: string[]; mitigationKo: string[];
  estimatedMTTR: string;             // "15분~1시간"
  trust: TrustMetadata;
}
```

#### 성능 프로파일 (Performance) — 43개

| 컴포넌트 | 지연시간 | 처리량 | 스케일링 |
|----------|---------|--------|---------|
| firewall | 0.1-5ms | 10Gbps | horizontal |
| load-balancer | 0.5-2ms | 100Gbps | horizontal |
| web-server | 5-50ms | 10K RPS | horizontal |
| db-server | 1-100ms | 5K TPS | vertical |
| cache (Redis) | 0.1-1ms | 100K RPS | horizontal |
| kubernetes | 1-10ms | 50K pods | both |

#### 외부 지식 (Phase D)

| 데이터 | 수량 | 접근 방식 |
|--------|------|----------|
| **취약점** (vulnerabilities.ts) | 47 CVE | API fetch (서버 사이드 이동 완료) |
| **클라우드 서비스** (cloudCatalog.ts) | 67 AWS/Azure/GCP | API fetch |
| **산업 규정** (industryCompliance.ts) | 5 프리셋 | API fetch |
| **벤치마크** (benchmarks.ts) | 14×4 = 56 | API fetch |

#### 출처 레지스트리 (Sources) — 48개

| 유형 | 수량 | 신뢰도 | 예시 |
|------|------|--------|------|
| RFC | 7 | 1.0 | RFC 7230, 7540, 3031 |
| NIST | 12 | 0.95 | SP 800-41, 53, 207 |
| CIS | 4 | 0.95 | CIS V8, K8s Benchmark |
| OWASP | 3 | 0.9 | Top 10, API Security |
| 벤더 | 6 | 0.85 | AWS Well-Architected |
| 산업 | 6 | 0.7 | SANS, CNCF |
| 텔레콤 | 4 | 0.95 | ITU-T, 3GPP, MEF |

---

### 4.3 학습 시스템 (Auto-Learning)

**위치**: `src/lib/learning/`
**저장소**: IndexedDB `infraflow-learning`

| 스토어 | DB 버전 | 용도 | 수집 시점 |
|--------|---------|------|----------|
| feedback-records | v1 | 사용자 평점, 수정 이력 | 피드백 위젯 클릭 시 |
| usage-events | v1 | 파싱/템플릿/LLM 이벤트 | 파싱 완료 시 |
| antipattern-interactions | v2 | 안티패턴 무시/수정 추적 | HealthCheck 패널 조작 시 |

#### 수집 데이터
```typescript
FeedbackRecord {
  userRating: 1-5,
  originalSpec, userModifiedSpec,
  specDiff: SpecDiff,
  placementChanges: PlacementChange[],
  patternsDetected, antiPatternsDetected, antiPatternsIgnored, antiPatternsFixed
}

UsageEvent {
  eventType: 'parse' | 'llm-modify' | 'template',
  success: boolean, confidence: number,
  nodeTypes: InfraNodeType[]
}
```

#### 분석 결과
- **패턴 빈도**: 가장 많이 사용되는 패턴 순위
- **공통 발생**: 함께 사용되는 컴포넌트 쌍 (예: WAF + CDN → 85% 공통 사용)
- **실패 프롬프트**: 파싱 실패 빈도가 높은 키워드
- **보정된 심각도**: 무시율 ≥ 70% → 심각도 1단계 하향

---

### 4.4 템플릿 시스템

**위치**: `src/lib/templates/`
**빌트인 템플릿**: 20개

| 카테고리 | 수량 | 예시 |
|----------|------|------|
| web | 3 | 3-tier, simple-waf, api-gateway |
| security | 2 | zero-trust, vpn |
| cloud | 3 | hybrid, multi-cloud |
| container | 2 | k8s, microservices |
| telecom | 5 | dedicated-line, mpls-vpn, 5g-private |
| network | 2 | hybrid-wan, idc-dual |
| custom | 3 | vdi-openclaw, assembly-vdi, network-separation-llm |

#### 커스텀 템플릿
- 사용자가 현재 다이어그램을 템플릿으로 저장 가능
- TemplateGallery → "현재 다이어그램 저장" 버튼
- `templateManager.ts`의 `saveTemplate()` / `deleteTemplate()` 사용

---

### 4.5 Prisma 스키마

**위치**: `prisma/schema.prisma` (592줄)

| 모델 | 용도 | 주요 필드 |
|------|------|----------|
| User | 사용자 | email, role (USER/ADMIN), password |
| Account | OAuth 계정 | provider, providerAccountId |
| Session | 세션 | sessionToken, expires |
| Diagram | 다이어그램 | title, spec (JSON), nodesJson, edgesJson |
| DiagramVersion | 버전 히스토리 | diagramId, version, spec |
| InfraComponent | 인프라 컴포넌트 | type, category, tier, policies (JSON) |
| KnowledgeRelationship | 지식 관계 | source, target, relationshipType |
| KnowledgePattern | 아키텍처 패턴 | components (JSON), complexity |
| KnowledgeAntiPattern | 안티패턴 | severity, detection (JSON) |
| KnowledgeFailure | 장애 시나리오 | impact, likelihood, mttr |
| KnowledgePerformance | 성능 프로파일 | latency, throughput |
| KnowledgeVulnerability | 취약점 | cveId, cvssScore, severity |
| KnowledgeCloudService | 클라우드 서비스 | provider, status, pricing |
| KnowledgeBenchmark | 벤치마크 | component, tier, sizing |

---

## 5. 파서 및 LLM 파이프라인

### 전체 흐름

```
사용자 프롬프트
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│                  2-Path 아키텍처                              │
│                                                              │
│  Path A: 로컬 파싱 (빠름, 규칙 기반)                          │
│  ──────────────────────────────────                          │
│  1. 프롬프트 정규화 (소문자, 트림)                            │
│  2. 템플릿 키워드 매칭 (60+ 키워드셋)                         │
│     → 일치: confidence 0.8, 템플릿 스펙 반환                 │
│  3. 컴포넌트 직접 감지 (60+ 정규식 패턴)                      │
│     → 감지: confidence 0.5, 순차 연결 스펙 생성               │
│  4. 폴백: simple-waf 템플릿, confidence 0.3                  │
│                                                              │
│  Path B: LLM 수정 (느림, 지능형)                              │
│  ──────────────────────────────                              │
│  1. 캔버스 상태 → DiagramContext 변환                         │
│  2. 시스템 프롬프트 구성 (보안 규칙 + 컴포넌트 목록)           │
│  3. 사용자 메시지 구성 (노드 목록 + <user_request>)           │
│  4. [선택] 지식 그래프 강화 (충돌/안티패턴 정보)              │
│  5. LLM API 호출 (Claude/GPT, 30초 타임아웃)                 │
│  6. JSON 응답 추출 + Zod 검증                                │
│  7. Operation 적용 (add/remove/modify/replace/connect)        │
│  8. 변경 위험도 평가                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
InfraSpec → specToFlow() → React Flow 노드/엣지 → 캔버스 렌더링
```

### LLM 지원 Operation 타입

| Operation | 설명 | 예시 |
|-----------|------|------|
| `add` | 노드 추가 + 위치 지정 | "WAF 추가해줘" → add waf (beforeNode: lb) |
| `remove` | 노드 삭제 + 연결 정리 | "캐시 삭제" → remove cache-xxx |
| `modify` | 라벨/설명/티어 변경 | "DB 이름 바꿔" → modify db-xxx |
| `replace` | 노드 타입 교체 (연결 보존) | "VM을 K8s로 교체" → replace vm → kubernetes |
| `connect` | 엣지 생성 | "WAF와 LB 연결" → connect waf → lb |
| `disconnect` | 엣지 삭제 | "연결 해제" → disconnect waf → lb |

### 보안 레이어

```
1. Prompt Injection 방지 (OWASP LLM01)
   └─ <user_request> XML 태그로 입력 격리
   └─ < > 문자 이스케이프

2. Output Validation (OWASP LLM02)
   └─ Zod 스키마 기반 응답 검증
   └─ 위험한 operation 차단

3. Rate Limiting
   └─ 사용자별 분당 호출 제한

4. CSRF
   └─ Origin 헤더 검증
```

---

## 6. User Flow 상세

### 6.1 메인 사용자 여정 (5가지)

#### Journey 1: 프롬프트로 새 다이어그램 생성

```
/ (홈)
 ↓ 빈 InfraEditor 표시
 ↓ PromptPanel에서 모드 = "생성"
 ↓ 프롬프트 입력: "3티어 웹 아키텍처에 WAF 붙여줘"
 ↓ Enter 또는 "생성" 버튼 클릭
 ↓ 로컬 파싱: 템플릿 키워드 "3-tier" 매칭 → 3-tier 템플릿 로드
 ↓ 캔버스에 다이어그램 렌더링 (User→WAF→LB→Web→App→DB)
 ↓ Header "저장" 버튼 → DB에 다이어그램 저장
 ↓ /diagram/[id]로 리다이렉트 (이후 자동 저장)
```

#### Journey 2: LLM으로 기존 다이어그램 수정

```
/diagram/[id] (저장된 다이어그램)
 ↓ PromptPanel 모드 = "수정" (다이어그램 존재 + LLM 사용 가능)
 ↓ "방화벽 앞에 IDS 넣어줘" 입력
 ↓ POST /api/modify 호출
 ↓ LLM이 Operation 생성: { type: 'add', target: 'ids-ips', beforeNode: 'firewall' }
 ↓ diffApplier가 스펙에 적용
 ↓ 캔버스 업데이트 (IDS 노드가 방화벽 앞에 삽입)
 ↓ 자동 저장
```

#### Journey 3: 애니메이션 재생

```
/diagram/[id]
 ↓ Header "애니메이트" 버튼
 ↓ ScenarioSelector 모달 (12+ 시나리오, 3 카테고리)
   ├── 기본: 사용자 요청 → DB, 응답 흐름, 인증 흐름
   ├── 장애: 방화벽 다운, DB 장애, DDoS
   └── 성능: 캐시 히트/미스, 부하 분산
 ↓ 시나리오 선택 → AnimationControlPanel 열림
 ↓ Play/Pause/Step/Speed 제어
 ↓ 노드 호버 → PolicyOverlay 표시
```

#### Journey 4: 다이어그램 분석 (HealthCheck)

```
/diagram/[id]
 ↓ Header "진단" 버튼
 ↓ HealthCheckPanel 열림 (3탭)
   ├── 안티패턴 탭: 현재 다이어그램의 안티패턴 탐지 결과
   │   └─ 각 항목: 심각도(보정됨), 문제, 영향, 해결책
   │   └─ "무시" / "수정함" 버튼 → 보정 시스템 피드백
   ├── 의존성 탭: 필수/권장 관계 누락 체크
   │   └─ "firewall에는 router가 필수입니다"
   └── 장애 탭: 잠재적 장애 시나리오
       └─ MTTR, 영향 범위, 예방/완화 조치
```

#### Journey 5: 다이어그램 비교

```
/diagram/[id]
 ↓ 다이어그램 수정 (LLM 또는 수동)
 ↓ Header "비교" 버튼 (보라색)
 ↓ ComparisonView: 좌측(원본) vs 우측(수정본)
 ↓ "차이점 표시" → 추가/삭제/변경 노드 하이라이트
 ↓ "좌우 교체", "뷰포트 동기화" 기능
 ↓ "나가기" → 단일 뷰 복귀
```

### 6.2 사용자 역할별 접근 권한

| 기능 | 비로그인 | 일반 사용자 | 관리자 |
|------|---------|------------|--------|
| 다이어그램 생성 (홈) | O | O | O |
| 프롬프트 파싱 | O | O | O |
| LLM 수정 | O (API 키 필요) | O | O |
| 다이어그램 저장 | X → 로그인 유도 | O | O |
| 대시보드 | X | O | O |
| 모든 패널 | O | O | O |
| 관리자 대시보드 | X | X | O |
| 컴포넌트 CRUD | X | X | O |
| 사용자 관리 | X | X | O |
| 지식 DB CRUD | X | X | O |

### 6.3 페이지 라우트 맵

```
/                           → 홈 (빈 에디터)
/auth/login                 → 로그인
/auth/register              → 회원가입
/dashboard                  → 다이어그램 목록 [보호]
/diagram/[id]               → 다이어그램 편집 [보호]
/admin                      → 관리자 대시보드 [관리자]
/admin/users                → 사용자 목록 [관리자]
/admin/users/[id]           → 사용자 상세 [관리자]
/admin/components           → 컴포넌트 목록 [관리자]
/admin/components/new       → 컴포넌트 생성 [관리자]
/admin/components/[id]      → 컴포넌트 상세 [관리자]
/admin/components/[id]/edit → 컴포넌트 편집 [관리자]
/admin/plugins              → 플러그인 관리 [관리자]
/admin/knowledge            → 지식 DB 대시보드 [관리자]
/admin/knowledge/[entity]/*  → 10개 엔티티 × CRUD [관리자]
```

---

## 7. 기능 구현 현황

### 완전 구현 (100%)

| 기능 | 구현 파일 | 상태 |
|------|----------|------|
| 다이어그램 생성/편집/삭제 | InfraEditor, FlowCanvas | 완전 구현 |
| 56개 노드 타입 렌더링 | BaseNode, nodeConfig, nodeIcons | 완전 구현 |
| 프롬프트 파싱 (로컬) | UnifiedParser, patterns, templates | 완전 구현 |
| LLM 기반 수정 | /api/modify, useLLMModifier | 완전 구현 |
| 13개 기능 패널 | panels/*.tsx | 완전 구현 |
| 애니메이션 시스템 | ScenarioSelector, AnimationControlPanel | 완전 구현 |
| 다이어그램 비교 | ComparisonView, ComparisonPanel | 완전 구현 |
| Undo/Redo | useHistory → InfraEditor | 완전 구현 |
| 자동 저장 | useDiagramPersistence | 완전 구현 |
| 인라인 편집 | EditableLabel | 완전 구현 |
| 컨텍스트 메뉴 | CanvasContextMenu, NodeContextMenu, EdgeContextMenu | 완전 구현 |
| 내보내기 (PNG/SVG/PDF/JSON) | ExportPanel, exportUtils | 완전 구현 |
| 내보내기 (PlantUML/Terraform/K8s) | plantUMLExport, terraformExport, k8sExport | 완전 구현 |
| 템플릿 시스템 (20+ 빌트인) | TemplateGallery, templateManager | 완전 구현 |
| 인증 (OAuth + Credentials) | NextAuth.js v5 | 완전 구현 |
| 관리자 대시보드 | /admin/* | 완전 구현 |
| 지식 DB CRUD | /admin/knowledge/* | 완전 구현 |
| 피드백 수집 | FeedbackRating, feedbackStore | 완전 구현 |
| 사용 분석 | InsightsPanel, analyticsEngine | 완전 구현 |
| 안티패턴 보정 | HealthCheckPanel, calibrationEngine | 완전 구현 |
| 보안 컨트롤 | llmSecurityControls (파이프라인 연결됨) | 완전 구현 |
| LLM 재시도 | retry.ts → useLLMModifier | 완전 구현 |
| LLM 메트릭 | llmMetrics.ts → /api/modify | 완전 구현 |
| 템플릿 추천 | templateRecommender → PromptPanel | 완전 구현 |

### 미연결 패널 (구현됨, UI 비연결)

| 패널 | 파일 | 상태 |
|------|------|------|
| ConversationPanel | ConversationPanel.tsx | 구현됨, Header에 버튼 없음 |
| WhatIfSimulator | WhatIfSimulator.tsx | 구현됨, Header에 버튼 없음 |
| SecurityAuditPanel | SecurityAuditPanel.tsx | 구현됨, Header에 버튼 없음 |
| CostEstimatorPanel | CostEstimatorPanel.tsx | 구현됨, BenchmarkPanel이 대체 |
| ReportExportPanel | ReportExportPanel.tsx | 구현됨, ExportPanel이 대체 |

### 미구현 (설계만 존재)

| 기능 | 설계 문서 | 상태 |
|------|----------|------|
| IKG Phase 5 (RAG Search) | infrastructure-knowledge-graph.md | 설계 완료, 미구현 |
| IKG Phase 5 (Trust Scorer) | 상동 | 설계 완료, 미구현 |
| IKG Phase 5 (Conflict Detector) | 상동 | 설계 완료, 미구현 |
| IKG Phase 5 (Graph Visualizer) | 상동 | 설계 완료, 미구현 |
| IKG Phase 5 (Org Config) | 상동 | 설계 완료, 미구현 |
| 실시간 협업 편집 | 없음 | 미설계 |
| 다이어그램 버전 히스토리 UI | Prisma 스키마 존재 | DB 모델만 존재 |

---

## 8. 테스트 현황

### 현재 상태
- **테스트 파일**: 92개
- **총 테스트**: 2,595개
- **통과율**: 100% (92/92 파일)
- **프레임워크**: Vitest + happy-dom
- **실행**: `npx vitest run`

### 테스트 분포

| 영역 | 파일 수 | 테스트 수 | 주요 내용 |
|------|---------|----------|----------|
| Knowledge Graph | 16 | ~562 | 관계, 패턴, 안티패턴, 장애 데이터 무결성 |
| Parser | 12 | ~350 | 프롬프트 파싱, 패턴 매칭, 스펙 빌더 |
| Learning | 6 | ~149 | 피드백, 분석, 보정 |
| Security | 2 | ~66 | LLM 보안 컨트롤 |
| Benchmarks | 1 | ~100 | Gold Set 100 파싱 벤치마크 |
| Export | 4 | ~80 | PlantUML, Terraform, K8s, PDF |
| Components | 8 | ~120 | BaseNode, Header, 패널 |
| Hooks | 6 | ~100 | useNodes, useEdges, useHistory |
| Utils | 6 | ~80 | retry, logger, severity |
| Admin | 5 | ~50 | 컴포넌트 폼, KnowledgeListPage |
| 기타 | 26 | ~538 | API 라우트, 타입 가드, 레이아웃 |

### E2E 테스트

- **프레임워크**: Playwright
- **파일**: `e2e/` 디렉토리 (home, diagram, export, admin)
- **상태**: Phase 4에서 확장 진행 중

---

## 9. 고도화 로드맵

### 단기 (현재 진행 중)

| 항목 | 상태 | 내용 |
|------|------|------|
| E2E 테스트 확장 | 진행 중 (Phase 4) | 핵심 사용자 플로우 Playwright 테스트 |
| MEMORY.md 정리 | 진행 중 (Phase 4) | Phase 5 모듈 상태 정확화 |

### 중기 (1-2주)

| 항목 | 우선순위 | 기대 효과 |
|------|----------|----------|
| **AI 아키텍처 리뷰 패널** | P1 | contextEnricher 기반 종합 분석 리포트 UI |
| **학습 시스템 활성화** | P1 | 보정 결과를 파서/추천에 자동 반영 |
| **미연결 패널 정리** | P2 | ConversationPanel, WhatIf 중 필요한 것 연결 또는 삭제 |
| **다이어그램 버전 히스토리 UI** | P2 | DiagramVersion 모델 활용, 버전 비교 |
| **InfraEditor 분할** | P2 | 632줄 God 컴포넌트 → 패널 관리자 + 캔버스 관리자 분리 |

### 장기 (1개월+)

| 항목 | 우선순위 | 기대 효과 |
|------|----------|----------|
| **IKG Phase 5 구현** | P2 | RAG 검색, 신뢰 점수, 충돌 탐지, 그래프 시각화 |
| **실시간 협업** | P3 | Yjs/Liveblocks 기반 다중 사용자 편집 |
| **Export 확장** | P3 | Mermaid.js, Draw.io XML, Pulumi |
| **Storybook** | P3 | 22개 패널 컴포넌트 시각적 개발 환경 |
| **아키텍처 점수** | P2 | 안티패턴 + 규정 + 의존성 기반 종합 점수 |

### 테스트 강화 계획

| 영역 | 현재 | 목표 | 우선순위 |
|------|------|------|----------|
| E2E (핵심 플로우) | ~4 시나리오 | 10+ 시나리오 | P1 |
| InfraEditor 통합 테스트 | 0 | 5+ 테스트 | P1 |
| Hook 테스트 (21개 미테스트) | 6/26 훅 | 15/26 훅 | P2 |
| API 라우트 테스트 (Knowledge) | 3/35 라우트 | 15/35 라우트 | P2 |
| 시각적 회귀 테스트 | 0 | Storybook + Chromatic | P3 |

---

## 부록: 빠른 참조

### 자주 사용하는 명령어

```bash
# 개발 서버
npm run dev

# 테스트
npx vitest run                    # 전체 테스트
npx vitest run src/__tests__/lib  # 특정 디렉토리
npx tsc --noEmit                  # 타입 체크

# E2E
npx playwright test               # 전체 E2E
npx playwright test --ui          # UI 모드

# 빌드
npm run build
```

### 핵심 파일 경로

```
에디터:        src/components/editor/InfraEditor.tsx
캔버스:        src/components/editor/FlowCanvas.tsx
파서:          src/lib/parser/UnifiedParser.ts
LLM API:       src/app/api/modify/route.ts
레이아웃:      src/lib/layout/layoutEngine.ts
지식 그래프:   src/lib/knowledge/
인프라 DB:     src/lib/data/infrastructureDB.ts
타입:          src/types/infra.ts
프롬프트:      src/lib/parser/prompts.ts
디자인 토큰:   src/lib/design/tokens.ts
```

---

*이 문서는 InfraFlow 프로젝트의 종합 현황을 기록합니다.*
*다른 Claude 세션에서도 이를 참조하여 프로젝트를 이해하고 작업을 이어갈 수 있습니다.*
*2026-02-11 작성*
