# InfraFlow 인프라 학습 DB 종합 가이드

> **작성일**: 2026-02-10
> **범위**: 인프라 지식 데이터베이스 구조, AI 적용 방식, 자기학습 보완 플랜

---

## 목차

1. [전체 아키텍처 개요](#1-전체-아키텍처-개요)
2. [Layer 1: 인프라 컴포넌트 DB](#2-layer-1-인프라-컴포넌트-db)
3. [Layer 2: 인프라 지식 그래프 (IKG)](#3-layer-2-인프라-지식-그래프-ikg)
4. [Layer 3: 자연어 파서 패턴](#4-layer-3-자연어-파서-패턴)
5. [AI 적용 파이프라인: 지식이 LLM에 주입되는 과정](#5-ai-적용-파이프라인)
6. [현재 상태 요약 및 수치](#6-현재-상태-요약-및-수치)
7. [자기학습 보완 플랜](#7-자기학습-보완-플랜)

---

## 1. 전체 아키텍처 개요

InfraFlow의 학습 DB는 **3개 레이어**로 구성되어 있으며, 이들이 결합되어 AI가 인프라 아키텍처를 이해하고 생성/검증하는 기반을 형성합니다.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        사용자 자연어 입력                                │
│                  "3티어 웹에 WAF 붙여줘"                                │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  Layer 3: 자연어 파서 패턴 (src/lib/parser/patterns.ts)                  │
│  ─────────────────────────────────────────────────────────────────────── │
│  49개 정규식 패턴 → 한/영 자연어를 InfraNodeType으로 변환                 │
│  "방화벽" → firewall, "WAF" → waf, "3티어" → create 커맨드              │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  Layer 1: 인프라 컴포넌트 DB (src/lib/data/)                             │
│  ─────────────────────────────────────────────────────────────────────── │
│  51개 컴포넌트 × 9개 카테고리 — SSoT (Single Source of Truth)            │
│  각 컴포넌트: 이름, 설명, 기능, 특징, 정책, 티어, 포트/프로토콜/벤더       │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  Layer 2: 인프라 지식 그래프 (src/lib/knowledge/)                        │
│  ─────────────────────────────────────────────────────────────────────── │
│  105개 관계 · 32개 패턴 · 45개 안티패턴 · 64개 장애 시나리오 · 43개 성능  │
│  42개 검증된 출처 (NIST, RFC, CIS, OWASP 등)                            │
│  → enrichContext() + buildKnowledgePromptSection()으로 LLM 프롬프트 주입  │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  AI 출력: 구조화된 인프라 스펙 (InfraSpec)                                │
│  → React Flow 노드/엣지로 변환 → 인터랙티브 다이어그램 렌더링             │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Layer 1: 인프라 컴포넌트 DB

### 2.1 위치 및 구조

```
src/lib/data/
├── infrastructureDB.ts       ← SSoT 메인 파일 (헬퍼 함수 + re-export)
└── components/
    ├── types.ts              ← InfraComponent 인터페이스 정의
    ├── index.ts              ← 전체 컴포넌트 병합 + 조회 함수
    ├── security.ts           ← 보안 장비 6개
    ├── network.ts            ← 네트워크 장비 7개
    ├── compute.ts            ← 컴퓨팅 장비 6개
    ├── cloud.ts              ← 클라우드 서비스 4개
    ├── storage.ts            ← 스토리지 5개
    ├── auth.ts               ← 인증/접근 4개
    ├── external.ts           ← 외부 요소 2개
    ├── telecom.ts            ← 통신 장비 5개
    └── wan.ts                ← WAN/전용회선 12개
```

### 2.2 컴포넌트 데이터 모델

```typescript
interface InfraComponent {
  id: string;                          // 'firewall', 'web-server' 등 (kebab-case)
  name: string;                        // 영문명: "Firewall"
  nameKo: string;                      // 한국어명: "방화벽"
  category: InfraComponentCategory;    // 9개 카테고리 중 하나
  description: string;                 // 영문 설명
  descriptionKo: string;              // 한국어 설명
  functions: string[];                 // 핵심 기능 (최소 3개, 영문)
  functionsKo: string[];              // 핵심 기능 (최소 3개, 한국어)
  features: string[];                  // 특징 (최소 2개, 영문)
  featuresKo: string[];               // 특징 (최소 2개, 한국어)
  recommendedPolicies: PolicyRecommendation[];  // 권장 보안 정책 (최소 2개)
  tier: 'external' | 'dmz' | 'internal' | 'data';  // 네트워크 배치 계층
  ports?: string[];                    // 관련 포트 (선택)
  protocols?: string[];                // 관련 프로토콜 (선택)
  vendors?: string[];                  // 주요 벤더 (선택)
}
```

### 2.3 전체 컴포넌트 목록 (51개)

| 카테고리 | 수량 | 컴포넌트 ID |
|----------|------|------------|
| **Security** (보안) | 6 | `firewall`, `waf`, `ids-ips`, `vpn-gateway`, `nac`, `dlp` |
| **Network** (네트워크) | 7 | `router`, `switch-l2`, `switch-l3`, `load-balancer`, `cdn`, `dns`, `sd-wan` |
| **Compute** (컴퓨팅) | 6 | `web-server`, `app-server`, `db-server`, `container`, `vm`, `kubernetes` |
| **Cloud** (클라우드) | 4 | `aws-vpc`, `azure-vnet`, `gcp-network`, `private-cloud` |
| **Storage** (스토리지) | 5 | `san-nas`, `object-storage`, `cache`, `backup`, `storage` |
| **Auth** (인증) | 4 | `ldap-ad`, `sso`, `mfa`, `iam` |
| **External** (외부) | 2 | `user`, `internet` |
| **Telecom** (통신) | 5 | `central-office`, `base-station`, `olt`, `customer-premise`, `idc` |
| **WAN** (광역망) | 12 | `pe-router`, `p-router`, `mpls-network`, `dedicated-line`, `metro-ethernet`, `corporate-internet`, `vpn-service`, `sd-wan-service`, `private-5g`, `core-network`, `upf`, `ring-network` |

### 2.4 SSoT 헬퍼 함수

`infrastructureDB.ts`에서 제공하는 조회 함수:

| 함수 | 용도 |
|------|------|
| `getCategoryForType(type)` | 타입 → 카테고리 조회 |
| `getTierForType(type)` | 타입 → 네트워크 계층 조회 |
| `getLabelForType(type)` | 타입 → 한국어 표시 이름 조회 |
| `getComponentsByCategory(cat)` | 카테고리별 컴포넌트 필터 |
| `getComponentsByTier(tier)` | 계층별 컴포넌트 필터 |

**핵심 원칙**: 프로젝트 전체에서 카테고리, 티어, 라벨 정보는 반드시 이 DB를 통해 조회합니다. 하드코딩을 금지합니다.

---

## 3. Layer 2: 인프라 지식 그래프 (IKG)

### 3.1 위치 및 구조

```
src/lib/knowledge/
├── index.ts               ← Public API (모든 모듈 re-export)
├── types.ts               ← 핵심 타입 정의 (208줄)
├── sourceRegistry.ts      ← 검증된 출처 40개 (292줄)
├── relationships.ts       ← 컴포넌트 관계 69개 (1,481줄)
├── patterns.ts            ← 아키텍처 패턴 24개 (1,294줄)
├── antipatterns.ts        ← 안티패턴 28개 + 자동 탐지 (967줄)
├── failures.ts            ← 장애 시나리오 43개
├── performance.ts         ← 성능 프로파일 35개
├── contextEnricher.ts     ← 지식→LLM 프롬프트 변환 (410줄)
└── __tests__/             ← 8개 테스트 파일
```

### 3.2 신뢰도 시스템 (Trust System)

모든 지식 항목에는 `TrustMetadata`가 부착되어 출처의 신뢰도를 정량적으로 관리합니다.

```
┌──────────────────────────────────────────────────────────────────┐
│                    신뢰도 계층 구조                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [1.00] RFC (IETF 표준)              ← 최고 신뢰도               │
│  [0.95] NIST SP / CIS Controls       ← 국가/산업 표준            │
│  [0.90] OWASP                        ← 보안 전문 표준            │
│  [0.85] Vendor Docs (AWS/Azure)      ← 벤더 공식 문서            │
│  ─────────────────── 0.85 경계: 공식 표준 ──────────────────────  │
│  [0.80] Academic                     ← 학술 논문                 │
│  [0.70] Industry Guide               ← 산업 가이드               │
│  ─────────────────── 0.50 경계: 최소 포함 기준 ─────────────────  │
│  [0.55] User (Verified)              ← 검증된 사용자 기여         │
│  [0.30] User (Unverified)            ← 미검증 사용자 기여         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

```typescript
interface TrustMetadata {
  confidence: number;              // 0.0~1.0 신뢰도 점수
  sources: KnowledgeSource[];      // 출처 목록 (최소 1개)
  lastReviewedAt: string;          // 마지막 검토일
  contributedBy?: string;          // 기여자 ID
  verifiedBy?: string;             // 검증자 ID
  upvotes: number;                 // 추천 수
  downvotes: number;               // 비추천 수
  derivedFrom?: string[];          // 출처 추적 (provenance)
  modificationHistory?: ModificationRecord[];  // 수정 이력 (최대 10건)
}
```

### 3.3 검증된 출처 레지스트리 (42개)

| 출처 유형 | 수량 | 주요 항목 |
|----------|------|----------|
| **NIST SP** | 10 | 800-41(방화벽), 800-44(웹서버), 800-53(보안통제), 800-63B(인증), 800-77(IPsec), 800-81(DNS), 800-94(IDS), 800-123(서버보안), 800-144(클라우드), 800-125(가상화) |
| **IETF RFC** | 10 | RFC 7230(HTTP/1.1), 8446(TLS 1.3), 1034(DNS), 2818(HTTPS), 7540(HTTP/2), 3031(MPLS), 4364(VPN), 5036(LDP), 7348(VXLAN), 4381(IP Networking) |
| **CIS Controls** | 3 | CIS v8 전체, Control 12(네트워크 인프라), Control 13(모니터링) |
| **OWASP** | 3 | Top 10, WSTG(테스트 가이드), API Security Top 10 |
| **Vendor** | 6 | AWS WAF(신뢰성/보안/성능), Azure CAF, ETSI NFV, KT 5G |
| **Industry** | 3 | SANS/CIS Top 20, CNCF Security, SANS Firewall |
| **ITU** | 2 | G.984(GPON), Y.3183(Network Slicing) |
| **3GPP** | 2 | 23.002(네트워크 아키텍처), 38.401(NG-RAN) |
| **MEF** | 1 | MEF 4(Metro Ethernet) |

### 3.4 컴포넌트 관계 (105개)

컴포넌트 간의 의존성, 권장 조합, 충돌을 정의합니다.

```
관계 유형별 분포:
├── requires (필수 의존)      ── 11개  "DB서버는 반드시 방화벽이 필요"
├── recommends (강력 권장)    ── 18개  "웹서버에 WAF 권장"
├── protects/enhances (보호) ── 12개  "IDS/IPS가 서버를 보호"
├── conflicts (충돌)          ──  9개  "SD-WAN과 전통 라우터 충돌"
├── telecom (통신 관계)       ── 20개  "PE라우터는 P라우터 필요"
├── cloud (클라우드 관계)     ── 12개  "VPC→서브넷, NAT, Security Group"
├── k8s (쿠버네티스 관계)     ──  6개  "K8s→컨테이너, Ingress, RBAC"
├── sase (SASE 관계)          ── 10개  "SASE→ZTNA, CASB, SIEM"
├── auth (인증 관계)          ──  4개  "IAM→SSO, MFA, LDAP"
└── hybrid (하이브리드 관계)  ──  6개  "Cloud↔On-Premise 연동"
                                ─────
                                총 105개 (Phase B 확장 포함)
```

**ID 체계**: `REL-{카테고리}-{번호}` (예: `REL-SEC-001`, `REL-TEL-015`)

**조회 함수**:
- `getMandatoryDependencies(type)` → 반드시 필요한 컴포넌트
- `getRecommendations(type)` → 권장 조합
- `getConflicts(type)` → 충돌하는 조합

### 3.5 아키텍처 패턴 (32개)

```
패턴 카테고리별 분포:
├── Basic (기본)      ── 5개  3티어, 2티어, 모놀리식, 로드밸런싱, DMZ
├── Extended (확장)   ── 5개  MSA, 이벤트기반, API 게이트웨이, DB 클러스터, CDN
├── Security (보안)   ── 8개  제로트러스트, 다계층방어, VPN, 보안웹호스팅, 분리, ZTNA, SASE, SOC
├── Cloud (클라우드)  ── 3개  하이브리드, 클라우드네이티브, 고가용성
├── K8s (쿠버네티스)  ── 3개  Service Mesh, GitOps, Blue-Green Deployment
├── Hybrid (하이브리드) ── 2개  Hybrid Cloud, Multi-Cloud Active-Active
└── Telecom (통신)    ── 6개  단일액세스, 이중액세스, MPLS VPN, 하이브리드WAN, 5G, IDC
                        ─────
                        총 32개 (Phase B 확장 포함)
```

각 패턴의 핵심 구조:
```typescript
interface ArchitecturePattern {
  id: string;                     // "PAT-001"
  nameKo: string;                 // "3티어 웹 아키텍처"
  requiredComponents: [{          // 필수 컴포넌트 + 최소 수량
    type: InfraNodeType;
    minCount: number;
  }];
  optionalComponents: [{          // 선택 컴포넌트 + 이점 설명
    type: InfraNodeType;
    benefitKo: string;
  }];
  complexity: 1 | 2 | 3 | 4 | 5; // 복잡도
  scalability: 'low' | 'medium' | 'high' | 'auto';
  bestForKo: string[];            // 적합한 사용 사례
  notSuitableForKo: string[];     // 부적합한 사용 사례
  evolvesTo?: string[];           // 진화 경로
  evolvesFrom?: string[];         // 이전 패턴
  trust: TrustMetadata;           // 출처 + 신뢰도
}
```

**탐지 함수**: `detectPatterns(spec)` → 현재 다이어그램에서 매칭되는 패턴 목록 반환

### 3.6 안티패턴 (45개) — 자동 탐지 포함

```
안티패턴 카테고리별 분포:
├── Security (보안)    ── 7개  DB 인터넷 노출, 방화벽 없음, WAF 없음 등
├── Network (네트워크) ── 5개  SPOF LB, 평면 네트워크 등
├── Compute (컴퓨팅)   ── 5개  캐시/CDN/LB 미사용 등
├── Cloud (클라우드)   ── 6개  단일 AZ, Public Subnet DB, SG 전체 오픈 등
├── K8s (쿠버네티스)   ── 4개  Privileged Container, 리소스 Limit 미설정 등
├── Auth (인증)        ── 4개  MFA 미적용, IAM 과잉 권한 등
├── SASE               ── 3개  SASE 미통합, ZTNA 미적용 등
├── Telecom            ── 6개  IDC 단일경로, 비이중화 회선 등
└── Storage            ── 5개  백업 없음, DR 없음 등
                        ─────
                        총 45개 (Phase B 확장 포함)
```

**핵심 특징**: 모든 안티패턴에 `detection(spec): boolean` 자동 탐지 함수가 구현되어 있어, 사용자가 다이어그램을 그리면 실시간으로 위반 사항을 감지할 수 있습니다.

```typescript
// 예시: DB가 인터넷에 직접 연결된 경우 탐지
{
  id: 'AP-SEC-001',
  nameKo: 'DB 인터넷 직접 노출',
  severity: 'critical',
  detection: (spec) => {
    return hasNodeType(spec, 'db-server') &&
           isDirectlyConnected(spec, 'db-server', 'internet');
  }
}
```

### 3.7 장애 시나리오 (64개)

```
장애 카테고리별 분포:
├── Network (네트워크)    ── 10개  BGP 장애, DNS 장애, LB 오류 등
├── Security (보안)       ── 11개  방화벽 다운, DDoS, 인증서 만료, SASE 장애 등
├── Compute (컴퓨팅)      ──  8개  서버 과부하, OOM, 컨테이너 크래시 등
├── Cloud (클라우드)      ──  6개  AZ 장애, NAT Gateway SPOF, EBS 고갈 등
├── K8s (쿠버네티스)      ──  4개  Pod CrashLoop, etcd 장애, Ingress 오류 등
├── Data (데이터)         ──  6개  DB 데드락, 스토리지 풀, 캐시 스톰 등
├── Auth (인증)           ──  7개  LDAP 장애, SSO 토큰 만료, MFA 장애 등
├── Hybrid (하이브리드)   ──  4개  VPN 터널 단절, 클라우드 간 연동 장애 등
└── Telecom (통신)        ──  8개  전용회선 절단, 기지국 장애 등
                            ─────
                            총 64개 (Phase B 확장 포함)
```

각 장애 시나리오에 포함되는 정보:
- **영향도** (`impact`): `service-down` / `degraded` / `data-loss` / `security-breach`
- **발생 확률** (`likelihood`): `high` / `medium` / `low`
- **연쇄 영향** (`affectedComponents`): 장애 전파 컴포넌트 목록
- **예방/대응** (`preventionKo` / `mitigationKo`): 구체적 조치 방안
- **복구 시간** (`estimatedMTTR`): 예상 복구 소요 시간

### 3.8 성능 프로파일 (43개)

각 컴포넌트 유형별 기대 성능 범위와 최적화 가이드를 제공합니다.

```typescript
interface PerformanceProfile {
  component: InfraNodeType;
  latencyRange: { min: number; max: number; unit: 'ms' | 'us' };
  throughputRange: { typical: string; max: string };
  scalingStrategy: 'horizontal' | 'vertical' | 'both';
  bottleneckIndicators: string[];       // 병목 징후
  bottleneckIndicatorsKo: string[];
  optimizationTipsKo: string[];         // 최적화 팁
}
```

예시:
| 컴포넌트 | 지연 시간 | 처리량 | 스케일링 |
|----------|----------|--------|---------|
| Firewall | 0.1~2ms | 10Gbps/40Gbps | vertical |
| Load Balancer | 0.5~5ms | 10Gbps/100Gbps | horizontal |
| Web Server | 1~50ms | 1K~50K RPS | horizontal |
| DB Server | 1~100ms | 5K~100K QPS | both |
| Cache (Redis) | 0.1~1ms | 100K~1M OPS | horizontal |

---

## 4. Layer 3: 자연어 파서 패턴

### 4.1 위치

```
src/lib/parser/patterns.ts (365줄)
```

### 4.2 노드 타입 패턴 (49개)

사용자의 한국어/영어 자연어 입력을 `InfraNodeType`으로 변환하는 정규식 패턴입니다.

```typescript
// 패턴 예시
{ pattern: /firewall|방화벽|fw(?!\w)/i,     type: 'firewall',     label: 'Firewall',    labelKo: '방화벽' }
{ pattern: /waf|웹방화벽|web\s*app/i,       type: 'waf',          label: 'WAF',         labelKo: 'WAF' }
{ pattern: /3티어|3-?tier|three.tier/i,     // → create 커맨드 + 3-tier 패턴 매칭 }
```

### 4.3 커맨드 패턴 (8개 명령 유형)

| 커맨드 | 트리거 패턴 (예시) | 동작 |
|--------|-------------------|------|
| `create` | "만들어줘", "생성", "그려줘" | 새 다이어그램 생성 |
| `add` | "추가해줘", "붙여줘", "넣어줘" | 기존 다이어그램에 노드 추가 |
| `remove` | "삭제해줘", "빼줘", "제거" | 노드 제거 |
| `modify` | "변경해줘", "수정", "바꿔줘" | 노드 속성 수정 |
| `connect` | "연결해줘", "붙여줘" | 엣지 추가 |
| `disconnect` | "끊어줘", "분리" | 엣지 제거 |
| `query` | "알려줘", "보여줘", "뭐야" | 정보 조회 |
| `template` | (템플릿 선택) | 사전 정의 템플릿 적용 |

### 4.4 성능 최적화

- **LRU 캐시** (최대 1,000개): 반복 패턴 매칭 결과 캐싱
- **Quick-match 키워드 세트**: 정규식 실행 전 빠른 사전 필터링
- `detectAllNodeTypesOptimized()`: 캐시 + 키워드 필터 결합 최적화 함수

---

## 5. AI 적용 파이프라인

### 5.1 전체 데이터 흐름

사용자 입력이 AI를 거쳐 다이어그램이 되기까지의 전체 과정:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  1단계: 사용자 입력                                                      │
│  ═══════════════                                                        │
│  "3티어 웹에 WAF 붙여줘"                                                │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  2단계: 로컬 파서 (patterns.ts → UnifiedParser)                          │
│  ═══════════════════════════════════════════                             │
│  • detectCommandType("3티어 웹에 WAF 붙여줘")  → "create"               │
│  • detectAllNodeTypes(...)  → [web-server, app-server, db-server, waf]  │
│  • LRU 캐시 히트 시 즉시 반환                                             │
│  • 결과: InfraSpec { nodes: [...], connections: [...] }                  │
│                                                                         │
│  로컬 파싱 성공 시 → 바로 5단계로 이동 (LLM 호출 없음)                    │
│  로컬 파싱 실패 시 → 3단계로 이동 (LLM 호출)                             │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  3단계: 컨텍스트 구축 (contextBuilder.ts)                                │
│  ═══════════════════════════════════════                                 │
│  • buildContext(currentNodes, currentEdges) → DiagramContext             │
│  • 현재 캔버스 상태를 구조화: 노드 목록, 연결 관계, 요약문                 │
│  • 아키텍처 유형 감지 (3-tier, telecom, flat 등)                         │
│  • Telecom 컨텍스트 감지 (WAN/telecom 컴포넌트 존재 시)                  │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  3.5단계: 지식 그래프 강화 (contextEnricher.ts)                           │
│  ═══════════════════════════════════════════                             │
│  • enrichContext(diagramContext, RELATIONSHIPS, {                        │
│      spec, antiPatterns: ANTIPATTERNS, failureScenarios: FAILURES       │
│    })                                                                   │
│  • 결과: EnrichedKnowledge {                                            │
│      relationships: 현재 다이어그램에 관련된 관계들,                       │
│      violations: 탐지된 안티패턴 위반 목록,                               │
│      suggestions: 누락된 필수/권장 컴포넌트,                              │
│      risks: 상위 5개 장애 시나리오,                                       │
│      tips: 퀵팁 (현재 빈 배열)                                           │
│    }                                                                    │
│  • buildKnowledgePromptSection(enriched)                                │
│    → 신뢰도별 계층화된 한국어 가이드 텍스트 생성                           │
│                                                                         │
│  ⚠️ 현재 상태: 모듈 구현 완료, LLM 파이프라인 통합 준비 완료              │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  4단계: LLM 프롬프트 구성 (prompts.ts → /api/modify)                     │
│  ════════════════════════════════════════════════                        │
│                                                                         │
│  System Prompt 구성:                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 역할: "인프라 아키텍처 전문가 AI"                                 │    │
│  │ 사용 가능한 컴포넌트 목록 (51개 타입)                             │    │
│  │ 통신 특화 규칙 (Telecom 컨텍스트 시)                              │    │
│  │ 조작 유형: create/add/remove/modify/connect/disconnect           │    │
│  │ 응답 형식: JSON 스키마 명세                                       │    │
│  │ [지식 그래프 가이드 섹션] ← buildKnowledgePromptSection() 출력    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  User Message 구성: (formatUserMessage)                                 │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ ## 현재 다이어그램 상태                                           │    │
│  │ ### 노드 목록                                                     │    │
│  │ - web-server-1 (web-server): "웹 서버" [dmz]                     │    │
│  │   └ 연결: firewall-1 → [이 노드] → app-server-1                 │    │
│  │ ### 연결 관계                                                     │    │
│  │ - web-server-1 → app-server-1                                    │    │
│  │ ---                                                               │    │
│  │ <user_request>WAF 추가해줘</user_request>                        │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ⚡ XML 태그 이스케이프로 프롬프트 인젝션 방지                             │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  5단계: 응답 처리 및 렌더링                                               │
│  ═══════════════════════════                                            │
│  • jsonParser.ts: LLM 응답에서 JSON 추출                                │
│  • responseValidator.ts: Zod 스키마로 응답 구조 검증                     │
│  • diffApplier.ts: 변경 사항을 기존 다이어그램에 적용                     │
│  • specToFlow(): InfraSpec → React Flow 노드/엣지 변환                  │
│  • 캔버스에 렌더링                                                       │
└──────────────────────────────────────────────────────────────────────────┘
```

### 5.2 지식 그래프 → LLM 프롬프트 변환 예시

`buildKnowledgePromptSection()`이 생성하는 프롬프트 섹션:

```markdown
## 인프라 지식 기반 가이드

### 공식 표준 (반드시 준수)
- [RFC 8446] TLS 1.3 — 웹 서버와 클라이언트 간 암호화 통신 필수
- [NIST SP 800-41] 방화벽 — 기본 차단(Default Deny) 정책 적용 필수
- [CIS v8 Control 13] 네트워크 모니터링 — IDS/IPS 배치 권장

### 검증된 실무 가이드
- [AWS WAF Best Practices] WAF는 로드밸런서 앞단에 배치
- [SANS Firewall Guide] 방화벽 이중화로 SPOF 방지

### ⛔ 주의사항 및 위반 감지
- ❌ 충돌: sd-wan ↔ router (동일 네트워크에서 상충)
- ⚠️ 누락: db-server에는 firewall이 필수 (현재 없음)
- 🔴 안티패턴: DB 인터넷 직접 노출 [AP-SEC-001] — 즉시 개선 필요

### 잠재적 장애 시나리오
1. [FAIL-NET-001] DNS 장애 — 영향: service-down, MTTR: 15분~1시간
2. [FAIL-SEC-003] 인증서 만료 — 영향: service-down, MTTR: 30분

### 우선순위 규칙
1. critical 안티패턴 → 반드시 경고
2. 필수 의존성 누락 → 경고 + 추천
3. 장애 시나리오 → 참고 제공
```

### 5.3 로컬 파싱 vs LLM 파싱

```
┌─────────────────────────┬──────────────────────────┐
│     로컬 파서            │     LLM 파서              │
├─────────────────────────┼──────────────────────────┤
│ 속도: 즉시 (<10ms)      │ 속도: 2~5초              │
│ 비용: 무료              │ 비용: API 호출 비용       │
│ 정확도: 패턴 매칭 한계  │ 정확도: 높은 문맥 이해    │
│ 커버리지: 49개 패턴     │ 커버리지: 모든 자연어     │
│                         │                          │
│ 적합: 단순 명령         │ 적합: 복잡한 수정 요청    │
│ "방화벽 추가해줘"       │ "보안을 강화해줘"         │
│ "3티어 아키텍처"        │ "현재 구조의 문제점 수정" │
└─────────────────────────┴──────────────────────────┘

우선순위: 로컬 파서 먼저 시도 → 실패 시 LLM 폴백
```

---

## 6. 현재 상태 요약 및 수치

### 6.1 데이터 현황 대시보드

| 항목 | 수량 | 상태 |
|------|------|------|
| 인프라 컴포넌트 | 51개 (9 카테고리) | 운영 중 |
| 검증된 출처 | 42개 | 운영 중 |
| 컴포넌트 관계 | 105개 | 운영 중 |
| 아키텍처 패턴 | 32개 | 운영 중 |
| 안티패턴 (자동탐지) | 45개 | 운영 중 |
| 장애 시나리오 | 64개 | 운영 중 |
| 성능 프로파일 | 43개 | 운영 중 |
| 파서 패턴 (정규식) | 49개 | 운영 중 |
| 취약점 DB | 47개 | 운영 중 |
| 클라우드 서비스 카탈로그 | 69개 (AWS/Azure/GCP) | 운영 중 |
| 산업별 컴플라이언스 프리셋 | 5개 | 운영 중 |
| 벤치마크 사이징 매트릭스 | 14 컴포넌트 × 4 티어 | 운영 중 |
| 자동학습 모듈 | 3개 (피드백/분석/보정) | 운영 중 |
| 테스트 케이스 | 2,541개 (전체 프로젝트) | 통과 |

### 6.2 카테고리별 커버리지

```
                    컴포넌트  관계  패턴  안티패턴  장애  성능
Security (보안)       11개   22    8     14      19   9
Network (네트워크)    7개    18    5      5      10   7
Compute (컴퓨팅)      6개    17    8      9      12   6
Cloud (클라우드)      4개    17    5      6       6   4
Storage (스토리지)    5개     7    2      5       6   4
Auth (인증)           4개    11    2      4       7   4
External (외부)       2개     0    0      0       0   0
Telecom (통신)        5개    10    3      3       4   4
WAN (광역망)         12개    10    3      3       4   4
                    ────  ────  ────  ────   ────  ────
합계                 56    105    32    45     64    43

※ Security에 SASE 5개 컴포넌트 포함 (sase-gateway, ztna-broker, casb, siem, soar)
※ Phase B(Cloud/K8s/Auth/SASE/Hybrid) 확장분 반영
```

### 6.3 모듈 통합 상태

#### 완료된 모듈

| 모듈 | 구현 | 통합 | 비고 |
|------|------|------|------|
| Context Enricher | 완료 | **LLM 통합 완료** | route.ts에서 enrichContext() 호출 |
| Knowledge Prompt Builder | 완료 | **LLM 통합 완료** | buildKnowledgePromptSection() → buildSystemPrompt() |
| HealthCheck Panel (안티패턴 감지 UI) | 완료 | **UI 통합 완료** | 실시간 안티패턴 탐지 + 캘리브레이션 |
| Insights Panel (사용 패턴 분석) | 완료 | **UI 통합 완료** | 4탭 분석 대시보드 |
| Vulnerability Panel (취약점 DB) | 완료 | **UI 통합 완료** | 47개 CVE 항목 |
| Cloud Catalog Panel (서비스 카탈로그) | 완료 | **UI 통합 완료** | 69개 AWS/Azure/GCP 서비스 |
| Industry Compliance Panel (컴플라이언스) | 완료 | **UI 통합 완료** | 5개 산업별 프리셋 |
| Benchmark Panel (성능 벤치마크) | 완료 | **UI 통합 완료** | 14 컴포넌트 × 4 티어 사이징 |
| Feedback Loop (자동학습) | 완료 | **UI 통합 완료** | IndexedDB 기반 피드백/분석/보정 |

#### 미착수 모듈 (향후 확장)

| 모듈 | 설계 | 구현 | 비고 |
|------|------|------|------|
| RAG Search (역색인) | 설계문서 있음 | 미착수 | TF-IDF 기반 한/영 검색 |
| User Contributions | 설계문서 있음 | 미착수 | 사용자 기여 관리 |
| Trust Scorer | 설계문서 있음 | 미착수 | 신뢰도 자동 산출 |
| Conflict Detector | 설계문서 있음 | 미착수 | 지식 충돌 탐지 |
| Source Validator | 설계문서 있음 | 미착수 | URL/출처 유효성 검증 |
| Organization Config | 설계문서 있음 | 미착수 | 조직별 맞춤 규칙 |
| Graph Visualizer | 설계문서 있음 | 미착수 | 지식 그래프 시각화 |

---

## 7. 자기학습 보완 플랜

### 7.1 플랜 개요

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     자기학습 보완 로드맵                                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Phase A: 지식 활성화 ✅ 완료 (2026-02-10)                                │
│  ─────────────────────────                                               │
│  기존 구현된 지식 그래프를 LLM 파이프라인에 실제로 연결                     │
│                                                                          │
│  Phase B: 지식 확장 ✅ 완료 (2026-02-10)                                  │
│  ─────────────────────────                                               │
│  Cloud, K8s, Auth/SASE, Hybrid 보강 + 실무 시나리오 추가                  │
│                                                                          │
│  Phase C: 자동학습 인프라 ✅ 완료 (2026-02-10)                             │
│  ─────────────────────────                                               │
│  사용자 피드백 기반 자동 학습 루프 구축                                     │
│                                                                          │
│  Phase D: 외부 지식 연동 ✅ 완료 (2026-02-10)                              │
│  ─────────────────────────                                               │
│  보안 취약점 DB, 클라우드 카탈로그, 컴플라이언스, 벤치마크                  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### Phase A: 지식 활성화 — 기존 DB를 AI에 실제 연결 ✅ 완료

~~현재 가장 큰 갭은 **지식 그래프가 구현되어 있지만 LLM 파이프라인에 실제로 주입되지 않는 것**입니다.~~
→ LLM 파이프라인 통합 완료. enrichContext() → buildKnowledgePromptSection() → route.ts 연결됨.

#### A-1: LLM 프롬프트에 지식 그래프 주입 (P0)
```
파일: src/app/api/modify/route.ts, src/lib/parser/prompts.ts
작업:
  1. /api/modify에서 요청 처리 시 enrichContext() 호출
  2. buildKnowledgePromptSection() 결과를 시스템 프롬프트에 삽입
  3. 안티패턴 위반 시 LLM에게 경고 메시지 포함하도록 지시
효과: LLM이 "방화벽 없는 DB 노출" 같은 위험을 자동 감지하고 경고
```

#### A-2: 로컬 파서에 관계 기반 자동완성 (P1)
```
파일: src/lib/parser/UnifiedParser.ts
작업:
  1. 노드 추가 시 getMandatoryDependencies() 자동 확인
  2. 필수 의존성 누락 시 사용자에게 "방화벽도 추가할까요?" 제안
  3. getConflicts() 확인하여 충돌 조합 경고
효과: LLM 없이도 지식 기반 자동 검증
```

#### A-3: 실시간 안티패턴 감지 UI (P1)
```
파일: 새 컴포넌트 — src/components/panels/HealthCheckPanel.tsx
작업:
  1. 캔버스 변경 시 detectAntiPatterns() 실행
  2. 위반 사항을 사이드 패널에 심각도별 표시
  3. 클릭 시 해결 방안 (solution) 표시
효과: 사용자가 실시간으로 아키텍처 문제를 인식
```

---

### Phase B: 지식 확장 — 부족한 영역 보강 ✅ 완료

#### B-1: 클라우드 네이티브 지식 강화 (P0)
```
현재 갭: Cloud 카테고리에 안티패턴 0개, 장애 시나리오 0개
추가 대상:
  • 안티패턴 6~8개:
    - 단일 AZ 배치 (고가용성 위반)
    - Public Subnet에 DB 배치
    - Security Group 전체 오픈 (0.0.0.0/0)
    - IAM 과잉 권한 (least privilege 위반)
    - VPC Peering 없는 멀티 VPC
    - Auto Scaling 미설정
  • 장애 시나리오 6~8개:
    - AZ 장애 시 서비스 중단
    - NAT Gateway SPOF
    - EBS 볼륨 고갈
    - Lambda Cold Start 지연
  • 성능 프로파일 4개: AWS VPC, Azure VNet, GCP Network, Private Cloud
  • 출처: AWS Well-Architected, Azure CAF, GCP Architecture Framework
```

#### B-2: 컨테이너/K8s 오케스트레이션 심화 (P1)
```
현재 갭: container, kubernetes에 대한 관계가 기본적
추가 대상:
  • 관계 8~10개:
    - kubernetes → container (orchestrates)
    - kubernetes → load-balancer (Ingress)
    - container → cache (sidecar pattern)
    - kubernetes → iam (RBAC/ServiceAccount)
  • 패턴 3개:
    - Service Mesh (Istio/Linkerd)
    - GitOps CI/CD Pipeline
    - Blue-Green/Canary Deployment
  • 안티패턴 4개:
    - Privileged Container
    - 리소스 Limit 미설정
    - Single Replica Deployment
    - PV 없는 Stateful 서비스
  • 출처: CNCF, Kubernetes Official Docs, CIS Kubernetes Benchmark
```

#### B-3: 제로트러스트/SASE 현대 보안 모델 (P1)
```
추가 대상:
  • 새 컴포넌트 4~5개:
    - sase-gateway, ztna-broker, casb, siem, soar
  • 관계 10개: SASE 구성요소 간 의존성
  • 패턴 2개: SASE Architecture, SOC 운영 아키텍처
  • 출처: NIST SP 800-207 (Zero Trust), Gartner SASE, MITRE ATT&CK
```

#### B-4: 멀티클라우드/하이브리드 시나리오 (P2)
```
추가 대상:
  • 관계 6개: Cloud ↔ On-Premise 연동
  • 패턴 2개: 멀티클라우드, 하이브리드 DR
  • 장애 시나리오 4개: 클라우드 간 연동 장애
  • 출처: AWS Outposts, Azure Arc, Google Anthos 문서
```

---

### Phase C: 자동학습 인프라 구축 ✅ 완료

#### C-1: 사용자 피드백 수집 루프 (P0)
```
구현 내용:
  1. 다이어그램 생성 후 "이 결과가 도움이 되었나요?" 평가 UI
  2. 사용자가 수동으로 수정한 부분 → 학습 데이터로 캡처
     - "AI가 WAF를 DMZ에 놓았는데, 사용자가 Internal로 옮겼다"
     → 배치 규칙 피드백으로 기록
  3. 평가 데이터를 로컬 IndexedDB에 저장

데이터 모델:
  {
    originalSpec: InfraSpec,        // AI가 생성한 원본
    userModifiedSpec: InfraSpec,    // 사용자가 수정한 결과
    userRating: 1~5,               // 만족도
    modificationDiff: Operation[],  // 구체적 변경 내역
    timestamp: string
  }
```

#### C-2: 패턴 사용 빈도 분석 (P1)
```
구현 내용:
  1. 어떤 아키텍처 패턴이 가장 많이 사용되는지 추적
  2. 자주 함께 사용되는 컴포넌트 조합 발견
     → 새로운 "recommends" 관계 자동 제안
  3. 자주 실패하는 프롬프트 패턴 분석
     → 파서 패턴 개선 힌트

예시 인사이트:
  "사용자의 80%가 web-server 추가 시 load-balancer도 함께 추가함"
  → recommends 관계 신뢰도 상향 조정
```

#### C-3: 안티패턴 탐지 정확도 자동 보정 (P2)
```
구현 내용:
  1. 안티패턴 경고 후 사용자가 무시한 비율 추적
  2. 높은 무시율 → 심각도 하향 또는 탐지 조건 완화
  3. 사용자가 수동으로 수정한 경우 → 심각도 상향 검토

목표: False Positive 비율 20% 이하 유지
```

---

### Phase D: 외부 지식 연동 ✅ 완료

#### D-1: CVE/보안 취약점 자동 반영 (P1)
```
구현 내용:
  1. 주요 컴포넌트(nginx, Apache, Redis 등)의 CVE 피드 연동
  2. 사용자 다이어그램에 해당 컴포넌트 있으면 경고
  3. NIST NVD API 또는 GitHub Advisory Database 활용

예시:
  "현재 다이어그램의 Redis(cache)에 CVE-2026-XXXX 취약점이 보고되었습니다.
   영향: Remote Code Execution. 권장: 7.2.1 이상으로 업그레이드"
```

#### D-2: 클라우드 서비스 카탈로그 자동 업데이트 (P2)
```
구현 내용:
  1. AWS/Azure/GCP의 서비스 카탈로그 변경 추적
  2. 새로운 서비스 → 컴포넌트 DB에 자동 제안
  3. 서비스 Deprecation → 마이그레이션 권장 알림

예시:
  "AWS에서 Application Load Balancer v2 출시 — 기존 Classic LB 대비
   HTTP/3 지원, 비용 15% 절감. 현재 다이어그램 업그레이드를 권장합니다"
```

#### D-3: 컴플라이언스 프레임워크 자동 매핑 (P2)
```
구현 내용:
  1. ISMS-P, ISO 27001, PCI DSS 등 컴플라이언스 요구사항 DB 구축
  2. 현재 다이어그램 vs 컴플라이언스 갭 분석 자동화
  3. 산업별 프리셋: 금융(전자금융감독규정), 의료(HIPAA), 공공(ISMS-P)

예시:
  "현재 아키텍처 ISMS-P 준수율: 72%
   미충족 항목:
   - 2.6.1 네트워크 접근통제: NAC 미배치 [권장: nac 추가]
   - 2.9.1 로그관리: SIEM 미배치 [권장: siem 추가]"
```

#### D-4: 벤치마크 데이터 기반 성능 추천 (P3)
```
구현 내용:
  1. TPC-C, SPEC CPU, CloudHarmony 등 벤치마크 데이터 연동
  2. 예상 트래픽 기반 컴포넌트 사양 추천
  3. 비용 최적화 제안

예시:
  "현재 트래픽 예상: 10,000 RPS
   권장 구성:
   - Load Balancer: L7 (Application) × 2 (Active-Active)
   - Web Server: 4 vCPU, 8GB RAM × 4대
   - App Server: 8 vCPU, 16GB RAM × 3대
   - Cache: Redis Cluster 3노드
   예상 월 비용: ₩2,400,000 (AWS 기준)"
```

---

### 7.2 우선순위 종합 로드맵

```
┌──────────────────────────────────────────────────────────────────────────┐
│  시간축                                                                  │
│  ═════                                                                   │
│                                                                          │
│  Week 1-2  ┃  Phase A: 지식 활성화                                       │
│            ┃  ┌─────────────────────────────────────────────────────┐    │
│            ┃  │ A-1 LLM 프롬프트 지식 주입 [P0] ████████           │    │
│            ┃  │ A-2 관계 기반 자동완성     [P1]     ██████         │    │
│            ┃  │ A-3 실시간 안티패턴 UI     [P1]       ████████     │    │
│            ┃  └─────────────────────────────────────────────────────┘    │
│            ┃                                                             │
│  Week 3-5  ┃  Phase B: 지식 확장                                         │
│            ┃  ┌─────────────────────────────────────────────────────┐    │
│            ┃  │ B-1 클라우드 네이티브 보강  [P0] ██████████         │    │
│            ┃  │ B-2 K8s 오케스트레이션     [P1]     ██████████     │    │
│            ┃  │ B-3 제로트러스트/SASE      [P1]       ████████     │    │
│            ┃  │ B-4 멀티클라우드           [P2]         ██████     │    │
│            ┃  └─────────────────────────────────────────────────────┘    │
│            ┃                                                             │
│  Week 6-9  ┃  Phase C: 자동학습 인프라                                    │
│            ┃  ┌─────────────────────────────────────────────────────┐    │
│            ┃  │ C-1 사용자 피드백 루프     [P0] ██████████         │    │
│            ┃  │ C-2 패턴 빈도 분석        [P1]     ████████       │    │
│            ┃  │ C-3 탐지 정확도 보정      [P2]       ██████       │    │
│            ┃  └─────────────────────────────────────────────────────┘    │
│            ┃                                                             │
│  Week 10+  ┃  Phase D: 외부 지식 연동                                     │
│            ┃  ┌─────────────────────────────────────────────────────┐    │
│            ┃  │ D-1 CVE 자동 반영         [P1] ████████           │    │
│            ┃  │ D-2 클라우드 카탈로그      [P2]     ██████         │    │
│            ┃  │ D-3 컴플라이언스 매핑      [P2]       ██████       │    │
│            ┃  │ D-4 벤치마크 성능 추천     [P3]         ████       │    │
│            ┃  └─────────────────────────────────────────────────────┘    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 7.3 달성 현황

| 단계 | 달성 목표 | 핵심 지표 | 상태 |
|------|----------|----------|------|
| Phase A | AI가 지식 DB를 실제로 활용 | LLM 프롬프트에 지식 가이드 주입 | ✅ 완료 |
| Phase B | 클라우드/K8s 포함 전 영역 커버 | 안티패턴 45개, 장애 시나리오 64개 | ✅ 완료 |
| Phase C | 사용 패턴 기반 자동 개선 | 피드백 루프 + 캘리브레이션 엔진 | ✅ 완료 |
| Phase D | 외부 지식 연동 | 취약점 47개, 클라우드 69개, 컴플라이언스 5 프리셋 | ✅ 완료 |

---

## 부록: 파일 참조 맵

```
src/
├── lib/
│   ├── data/
│   │   ├── infrastructureDB.ts          ← [Layer 1] SSoT 메인
│   │   └── components/                  ← [Layer 1] 51개 컴포넌트 정의
│   │       ├── types.ts
│   │       ├── security.ts (6)
│   │       ├── network.ts (7)
│   │       ├── compute.ts (6)
│   │       ├── cloud.ts (4)
│   │       ├── storage.ts (5)
│   │       ├── auth.ts (4)
│   │       ├── external.ts (2)
│   │       ├── telecom.ts (5)
│   │       └── wan.ts (12)
│   ├── knowledge/
│   │   ├── types.ts                     ← [Layer 2] 핵심 타입
│   │   ├── sourceRegistry.ts            ← [Layer 2] 40개 출처
│   │   ├── relationships.ts             ← [Layer 2] 69개 관계
│   │   ├── patterns.ts                  ← [Layer 2] 24개 패턴
│   │   ├── antipatterns.ts              ← [Layer 2] 28개 안티패턴
│   │   ├── failures.ts                  ← [Layer 2] 43개 장애
│   │   ├── performance.ts               ← [Layer 2] 35개 성능
│   │   └── contextEnricher.ts           ← [Layer 2→AI] 지식 변환
│   ├── parser/
│   │   ├── patterns.ts                  ← [Layer 3] 49개 NL 패턴
│   │   ├── UnifiedParser.ts             ← 파서 진입점
│   │   ├── intelligentParser.ts         ← LLM 기반 의도 분석
│   │   ├── prompts.ts                   ← LLM 프롬프트 구성
│   │   ├── changeRiskAssessor.ts        ← 변경 위험도 평가
│   │   └── diffApplier.ts              ← 변경사항 적용
│   ├── llm/
│   │   ├── llmParser.ts                 ← LLM API 호출
│   │   ├── providers.ts                 ← Claude/OpenAI 감지
│   │   ├── jsonParser.ts                ← LLM 응답 JSON 파싱
│   │   ├── fallbackTemplates.ts         ← LLM 실패 시 폴백
│   │   └── rateLimitHeaders.ts          ← Rate Limit 헤더
│   └── security/
│       └── llmSecurityControls.ts       ← OWASP LLM Top 10 통제
├── hooks/
│   ├── usePromptParser.ts               ← 파서 훅 (진입점)
│   ├── useLocalParser.ts                ← 로컬 파싱 훅
│   └── useLLMModifier.ts               ← LLM 수정 훅
└── app/api/
    ├── llm/route.ts                     ← LLM API 엔드포인트
    └── modify/route.ts                  ← 다이어그램 수정 API
```

---

*이 문서는 InfraFlow 프로젝트의 인프라 학습 DB 전체 구조와 AI 적용 방식, 향후 자기학습 플랜을 종합적으로 정리한 가이드입니다.*
