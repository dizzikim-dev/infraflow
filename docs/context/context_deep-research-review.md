# InfraFlow Deep Research 보고서 대조 분석

> **일자**: 2026-02-21
> **분석 대상**: `context_deep-research-report.md` (ChatGPT 리서치 보고서)
> **분석 방법**: InfraFlow 전체 코드베이스(116개 테스트 파일, 3,499개 테스트 통과) 대조 탐색
> **분석 도구**: Claude Opus 4.6 — 코드 전수 탐색 후 항목별 대조

---

## 1. 전체 요약

| 항목 | 보고서 권고 | 현재 구현 상태 | 판정 |
|------|-----------|---------------|------|
| 온톨로지 (RDF/OWL/SHACL) | 정식 시맨틱 웹 스택 | TypeScript 타입 + Zod 런타임 검증 | 과잉 설계 — 불필요 |
| 그래프 DB (Neptune/Neo4j) | 전용 그래프 DB | 인메모리 TypeScript 배열 | 과잉 설계 — 불필요 |
| 신뢰도/출처 체계 | provenance + confidence | **이미 구현** (40+ 출처, 12종 SourceType) | 충족 |
| 개념/제품 분리 | Capability 중심 매핑 | **이미 구현** (InfraNodeType ↔ ProductNode) | 충족 |
| 관계 모델링 | 물리/논리/정책 분리 | **이미 구현** (5종 RelationType, 115개 관계) | 충족 |
| 5단계 추천 파이프라인 | 요구→패턴→매핑→제약→점수 | **이미 구현** (4개 모듈 완비) | 초과 달성 |
| 다기준 점수화 | 적합성/보안/운영성/비용 | **이미 구현** (4차원 스코어링 2종) | 충족 |
| 결정적 검증 | LLM 외부 검증 | **이미 구현** (3계층 검증) | 충족 |
| RAG (벡터 검색) | 문서 임베딩 + pgvector | 없음 — 규칙 기반 enrichment | 장기 검토 |
| Tool Use 다단계 | ParseIntent→QueryGraph→… | 단일 호출 + 템플릿 폴백 | 중기 검토 |
| OPA Policy as Code | 정책 엔진 분리 | TypeScript 규칙 (200줄) | 과잉 설계 — 불필요 |
| Well-Architected 통합 | 평가 rubric 내장 | 없음 | **수용 가치 있음** |
| 근거/검증 UI 패널 | 3분할 UI | 부분 구현 | **수용 가치 있음** |
| Cytoscape.js | 별도 그래프 뷰 | React Flow로 충분 | 불필요 |
| FlowEvent/IPFIX | 텔레메트리 스키마 | 프로젝트 범위 밖 | 범위 밖 |

**요약**: 보고서 15개 권고 중 **6개 이미 충족, 5개 과잉/불필요, 2개 수용 가치, 2개 장기 참고**.

---

## 2. 이미 구현 완료된 영역 — 코드 증거

### 2.1 신뢰도/출처 체계

보고서는 "Provenance, confidence 0-1, 버전 메타데이터가 필수"라고 권고했다. InfraFlow는 이미 이를 달성하고 있다.

**구현 코드** (`src/lib/knowledge/types.ts`):

```typescript
export type SourceType =
  | 'rfc'           // IETF RFC — confidence 1.0
  | 'nist'          // NIST SP — confidence 0.95
  | 'cis'           // CIS Benchmarks — confidence 0.95
  | 'owasp'         // OWASP — confidence 0.9
  | 'vendor'        // 벤더 공식 문서 — confidence 0.85
  | 'academic'      // 학술 논문 — confidence 0.8
  | 'industry'      // 업계 가이드 — confidence 0.7
  | 'user_verified' // 관리자 검증 기여 — confidence 0.55
  | 'user_unverified'; // 미검증 기여 — confidence 0.3

export interface TrustMetadata {
  confidence: number;          // 0.0 – 1.0
  sources: KnowledgeSource[];  // 최소 1개 필수
  lastReviewedAt: string;
  contributedBy?: string;
  verifiedBy?: string;
  upvotes: number;
  downvotes: number;
  derivedFrom?: string[];               // 파생 출처 ID
  modificationHistory?: ModificationRecord[];  // 변경 이력 (최대 10건)
}

export const BASE_CONFIDENCE: Record<SourceType, number> = {
  rfc: 1.0, nist: 0.95, cis: 0.95, owasp: 0.9,
  vendor: 0.85, academic: 0.8, industry: 0.7,
  user_verified: 0.55, user_unverified: 0.3,
};
```

**출처 레지스트리** (`src/lib/knowledge/sourceRegistry.ts`): 40+ 검증된 출처

```
NIST: SP 800-41, 800-44, 800-53, 800-63B, 800-77, 800-81, 800-94, 800-123, 800-144, 800-125, 800-145, 800-207
RFC:  7230, 8446, 1034, 2818, 7540, 3031, 4364, 5036, 7348, 4381
CIS:  Controls V8, V8-12, V8-13, Kubernetes
OWASP: Top 10, WSTG, API Top 10
Cloud: AWS WAF (Rel/Sec/Perf/Ops), Azure CAF, GCP Arch Framework
Telecom: ITU-T G.984, Y.3183, 3GPP TS 23.002, TS 38.401, MEF 4, ETSI NFV-MAN
Vuln: NIST NVD, MITRE CVE, GitHub Advisory
```

> **보고서와의 차이**: 보고서가 추가 언급한 `valid_from/valid_to`, `ontology_version`은 현재 불필요. 벤더 카탈로그의 `lifecycle` 필드와 git 버전 관리가 이 역할을 대체.

---

### 2.2 개념/제품 분리 (Concept vs Product)

보고서는 "Firewall은 개념, 특정 NGFW는 구현. Capability 중심으로 매핑하라"고 권고했다.

**현재 구현 — 2계층 분리**:

```
개념 계층: InfraNodeType (96+ 타입)
    'firewall' | 'switch-l3' | 'load-balancer' | 'waf' | 'siem' | ...
         ↕  infraNodeTypes 매핑 (N:N)
제품 계층: ProductNode (416+ 제품)
    FortiGate 900G → infraNodeTypes: ['firewall']
    Catalyst 9600  → infraNodeTypes: ['switch-l3']
    PA-5400 Series → infraNodeTypes: ['firewall']
```

**ProductNode 구조** (`src/lib/knowledge/vendorCatalog/types.ts`):

```typescript
export interface ProductNode {
  nodeId: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  sourceUrl: string;

  // 개념 매핑 (Concept → Product)
  infraNodeTypes?: InfraNodeType[];

  // 아키텍처 결정 필드 (= 보고서의 "Capability")
  architectureRole?: string;       // 'Campus Core', 'Data Center Edge', ...
  recommendedFor?: string[];       // 사용 사례
  supportedProtocols?: string[];   // 'OSPF', 'BGP', 'VXLAN', ...
  haFeatures?: string[];           // 'SSO', 'NSF', 'ISSU', ...
  securityCapabilities?: string[]; // 'MACsec', 'IPS', 'Sandboxing', ...

  // 제품 분류
  lifecycle?: 'active' | 'end-of-sale' | 'end-of-life';
  replacedBy?: string;
  licensingModel?: 'perpetual' | 'subscription' | 'credit-based' | 'as-a-service';
  maxThroughput?: string;
  formFactor?: 'appliance' | 'chassis' | 'virtual' | 'cloud' | 'container' | 'rugged';

  children: ProductNode[];  // 재귀 트리 구조
}
```

**벤더 카탈로그 규모**:

| 벤더 | 제품 수 | 예시 |
|------|--------|------|
| Cisco | 214 | Catalyst 9000, ASA, Nexus, Meraki |
| Fortinet | 90 | FortiGate, FortiSwitch, FortiAP |
| Palo Alto Networks | 76 | PA-Series, Prisma, Cortex |
| Arista | 50 | 7000/7500 시리즈, CloudVision |
| **합계** | **416+** | |

> **보고서와의 차이**: 보고서는 별도 `Capability` 엔티티를 제안하지만, InfraFlow의 `architectureRole` + `recommendedFor` + `securityCapabilities` + `haFeatures` 조합이 동일한 역할을 수행. 별도 엔티티로 분리하면 데이터 관리 부담만 증가.

---

### 2.3 관계 모델링

보고서는 "물리(connectedTo), 논리(routesTo), 정책(enforcedBy), 운영(observedBy)을 분리하라"고 권고했다.

**현재 구현** (`src/lib/knowledge/relationships.ts` — 2,407줄):

```typescript
export type RelationshipType =
  | 'requires'     // 필수 의존 관계
  | 'recommends'   // 강력 권장
  | 'conflicts'    // 충돌 — 함께 사용 위험
  | 'enhances'     // 결합 시 기능 강화
  | 'protects';    // 보안 보호 관계

export type RelationshipStrength = 'mandatory' | 'strong' | 'weak';
export type RelationshipDirection = 'upstream' | 'downstream' | 'bidirectional';
```

**115개 관계 예시**:

```typescript
{
  id: 'REL-SEC-001',
  source: 'db-server',
  target: 'firewall',
  relationshipType: 'requires',
  strength: 'mandatory',
  direction: 'upstream',
  reason: 'Databases must reside in firewall-protected network segments',
  reasonKo: '데이터베이스는 방화벽으로 보호되는 네트워크 세그먼트에 위치해야 합니다',
  trust: {
    confidence: 0.95,
    sources: [NIST_800_41],
    // ...
  }
}
```

> **보고서와의 차이**: InfraFlow는 물리/논리/정책을 별도 분류하지 않고, **설계(Architecture) 관점**의 관계에 집중. 이는 의도된 선택 — InfraFlow는 케이블/포트 수준이 아닌 아키텍처 설계 도구.

---

### 2.4 5단계 추천 파이프라인 — 초과 달성

보고서는 "요구사항 정규화 → 패턴 후보 → 벤더 매핑 → 제약 필터링 → 다기준 점수화"를 권고했다. InfraFlow는 이를 **4개 모듈로 완전 구현**하고, 보고서에 없는 갭 분석/컴플라이언스 보고서까지 제공한다.

**현재 파이프라인**:

```
ConsultingRequirements (사용자 요구사항)
    ↓
[1] matchRequirementsToPatterns()     ← consulting/patternMatcher.ts
    ├─ 32개 아키텍처 패턴 스코어링
    ├─ 4차원: Scale(0-25) + Security(0-25) + Architecture(0-25) + Complexity(0-25)
    ├─ Primary: 최고점 ≥ 50
    └─ Alternatives: 차상위 4개 (≥ 40)
    ↓
[2] matchVendorProducts()             ← recommendation/matcher.ts
    ├─ 416+ 제품에서 매칭
    ├─ 4차원: Type(0-40) + ArchRole(0-25) + UseCase(0-20) + HA(0-15)
    ├─ 최소 점수 필터링 (≥ 20)
    └─ 노드당 최대 5개 추천
    ↓
[3] analyzeGaps()                     ← consulting/gapAnalyzer.ts
    ├─ 6개 카테고리 갭 탐지:
    │   ├─ missing: 패턴/보안에 필요하지만 없는 컴포넌트
    │   ├─ excess: 패턴 범위 밖의 불필요 컴포넌트
    │   ├─ upgrade: HA/이중화 필요 (예: 단일 방화벽 → HA 페어)
    │   ├─ security: 보안 통제 누락 (방화벽/WAF/IDS 없음)
    │   ├─ compliance: 프레임워크별 누락 (PCI-DSS에 SIEM 없음)
    │   └─ performance: 규모 대비 누락 (10K 사용자에 캐시 없음)
    └─ 심각도: critical | high | medium | low
    ↓
[4] generateComplianceReport()        ← consulting/complianceReportGenerator.ts
    └─ 6개 프레임워크: PCI-DSS, HIPAA, ISO 27001, SOC 2, GDPR, NIST 800-53
```

**보고서에 없는 추가 기능**:
- `costComparator.ts` — 다중 벤더 비용 비교
- `RequirementsWizardPanel` — 7단계 요구사항 수집 위저드 UI
- `CostComparisonPanel` — 3탭 비용 비교 UI

> **판정**: 보고서의 5단계를 초과 달성. 갭 분석, 컴플라이언스 보고서, 비용 비교는 보고서가 언급하지 않은 추가 기능.

---

### 2.5 결정적 검증 (LLM 외부)

보고서는 "검증은 LLM 밖에서 수행해 항상 같은 판정"이라고 강조했다. InfraFlow는 3계층으로 이를 달성.

```
계층 1: 파서 검증 (src/lib/parser/)
    └─ AVAILABLE_COMPONENTS 타입 검증, 명령 분류

계층 2: 지식 검증 (src/lib/parser/specBuilder.ts)
    └─ validateWithKnowledge() → 충돌 감지, 누락 의존성

계층 3: 감사 검증 (src/lib/audit/complianceChecker.ts)
    └─ 6개 프레임워크 체크 + 45개 안티패턴 탐지

모두 순수 함수(deterministic) — LLM 호출 없음
```

---

### 2.6 지식 그래프 → LLM 통합

보고서는 "근거 기반 RAG 생성"을 권고했다. InfraFlow는 RAG 대신 **규칙 기반 컨텍스트 주입**으로 구현.

**현재 파이프라인** (`src/lib/knowledge/contextEnricher.ts`):

```
사용자 프롬프트
    ↓
extractNodeTypesFromPrompt()
    → ['firewall', 'waf', 'load-balancer']
    ↓
enrichContext(context, RELATIONSHIPS, {antiPatterns, failures, vulnerabilities})
    ├─ findRelevantRelationships()    → confidence ≥ 0.5 필터링
    ├─ findSuggestions()              → 누락된 requires/recommends
    ├─ findConflicts()                → conflicts 양쪽 모두 존재 시
    ├─ detectViolations()             → 45개 안티패턴 탐지 함수 실행
    ├─ findRelevantFailures()         → 64개 장애 시나리오 매칭
    └─ filterVulnerabilities()        → 47개 CVE 경고
    ↓
buildKnowledgePromptSection(enriched)
    ├─ 신뢰도별 그룹핑: 공식(≥0.85), 검증(≥0.5), 사용자(<0.5)
    └─ 한국어 프롬프트 섹션 생성
    ↓
시스템 프롬프트에 주입 → LLM 호출
```

**FIFO 캐시**: 50개 엔트리, 정렬된 노드 타입으로 키 생성.

---

## 3. 과잉 설계 판정 — 근거

### 3.1 RDF/OWL/SHACL 정식 온톨로지 — 불필요

| 기준 | RDF/OWL/SHACL | InfraFlow 현재 (TypeScript) |
|------|---------------|---------------------------|
| 타입 안전성 | 런타임만 | **컴파일 타임 + 런타임** (더 강력) |
| 검증 | SHACL shapes | **Zod 스키마 + TypeScript strict** |
| 쿼리 | SPARQL 학습 필요 | **JavaScript Array.filter/find** (즉시 사용) |
| 외부 도구 | Protege, 그래프 DB 필요 | **IDE 자동완성, 리팩토링** |
| 상호운용성 | 높음 (시맨틱 웹) | 낮음 (단일 플랫폼) |
| 학습 곡선 | 높음 (RDF+OWL+SPARQL+SHACL) | **낮음** (TypeScript만) |

**핵심 논점**: RDF/OWL은 **이기종 시스템 간 지식 교환**이 목적. InfraFlow는 단일 Next.js 앱이며, 외부 시스템과 온톨로지를 공유할 계획이 없다. TypeScript 타입 시스템이 컴파일 타임에 더 강력한 보장을 제공.

### 3.2 그래프 DB (Neptune/Neo4j) — 불필요

현재 데이터 규모:
- 115개 관계, 32개 패턴, 45개 안티패턴, 64개 장애, 42개 성능, 47개 취약점
- 416개 벤더 제품
- **합계: ~760개 엔트리**

이 규모에서 `Array.filter()`의 성능은 O(n) ≈ 수십 마이크로초. 그래프 DB의 네트워크 오버헤드 > 인메모리 배열 탐색.

**그래프 DB가 필요해지는 시점**: 관계 10,000+, 동적 CRUD 빈번, 3홉+ 경로 탐색 쿼리 필요 시.

### 3.3 OPA Policy as Code — 불필요

현재 `complianceChecker.ts`의 규칙은 약 200줄 TypeScript. OPA 도입 시:
- Rego 언어 학습 비용
- OPA 서버 운영/배포
- TypeScript ↔ Rego 데이터 변환

**비용 > 이득**. 정책 규칙이 1,000+ 되고, 여러 서비스에서 동일 정책을 공유해야 할 때 재검토.

### 3.4 Cytoscape.js — 불필요

React Flow가 이미 노드/엣지 시각화를 담당. 두 개의 시각화 라이브러리를 유지하면:
- 번들 크기 증가
- 상태 동기화 복잡도
- 학습/유지보수 비용 2배

---

## 4. 수용 가치가 있는 권고사항

### 4.1 Well-Architected Framework 통합

**현재 없는 것**: AWS/Azure/GCP Well-Architected의 품질 축(pillar)을 추천 점수에 반영하는 메커니즘.

**구현 방안**:
- 패턴에 Well-Architected pillar 태그 부여
- 현재 4차원 스코어링에 "Well-Architected 적합도" 차원 추가
- 예: hub-spoke 패턴 → `reliability: high, security: high, cost: medium, ops-excellence: high`

**우선순위**: 중 (Layer 3 강화 시)

### 4.2 근거/검증 통합 UI 패널

**현재 없는 것**: 노드 선택 시 "왜 이 구성인가" + 출처 링크 + 검증 결과를 한눈에 보여주는 패널.

**현재 상태**:
- 추천 근거는 `buildReason()`/`buildReasonKo()`로 텍스트 생성하지만 별도 패널 없음
- 안티패턴 경고, 컴플라이언스 체크 존재하나 통합 뷰 없음

**구현 방안**:
- 오른쪽 인스펙터에 "근거" 탭 추가
- 하단에 "검증 결과" 패널 (통과/실패/경고 요약)
- 출처 링크(`sourceUrl`) 직접 연결

**우선순위**: 중-높 (사용자 신뢰 구축에 핵심)

---

## 5. 장기 검토 항목

### 5.1 RAG (벡터 검색)

**현재**: 규칙 기반 컨텍스트 주입 (결정적, 빠름, 디버깅 용이)
**RAG가 유용해지는 시점**:
- 벤더 데이터시트/RFC 원문 등 **비정형 문서** 검색 필요 시
- 지식 그래프 데이터가 1,000+ 넘어 규칙 기반 필터링이 비효율적일 때
- "왜 이 구성인가?" 같은 자유 형식 **설명/근거 검색** 요구 시

### 5.2 Tool Use 다단계 오케스트레이션

**현재**: 단일 LLM 호출 (레이턴시/비용 최소)
**다단계가 유용해지는 시점**:
- LLM이 지식 그래프를 **명시적으로 쿼리**하여 환각 감소 필요 시
- 대화형 컨설팅 모드 ("자유 대화로 설계를 반복 수정") 개발 시
- 각 단계의 중간 결과를 **감사 로그**로 남겨야 할 때

---

## 6. 보고서의 부정확하거나 범위 밖인 항목

### 6.1 Mermaid 하이브리드 — 이미 초과 달성
> 보고서: "Mermaid로 빠른 생성, React Flow로 정밀 편집"

InfraFlow는 React Flow 기반 캔버스 + PlantUML/Mermaid **export**를 제공. Mermaid를 중간 표현으로 쓰는 것은 불필요한 변환 단계.

### 6.2 FlowEvent/IPFIX 정규화 — 프로젝트 범위 밖
> 보고서: "IPFIX/NetFlow/sFlow의 공통 필드를 FlowEvent 스키마로"

InfraFlow는 **설계 도구**이지 **모니터링/텔레메트리 도구가 아니다.** IKG 설계 문서의 비(非)목표에 "실시간 모니터링/장애 대응 시스템"이 명시되어 있음.

### 6.3 학습 로드맵 — 개인 역량 개발 관점
> 보고서: "CCNA 기초 → 클라우드 네트워킹 → YANG/OpenConfig"

플랫폼 구현과 직접 관련 없는 개인 학습 가이드. 참고 자료로만 활용.

---

## 7. 보고서의 실질적 기여

비판에도 불구하고 이 보고서가 제공하는 **활용 가치**:

### 7.1 공식 참고 링크 모음
`sourceRegistry.ts` 확장 시 활용 가능:
- Well-Architected 3사 (AWS/Azure/GCP)
- RFC 1918, 8200, 4271, 7348, 7011, 7950
- NIST CSF 2.0, SP 800-207
- OpenConfig, NetBox (향후 SoT 연동 시)

### 7.2 매핑 테이블
벤더 카탈로그 확장 시 참고:
- Transit Hub → AWS Transit Gateway, Azure Virtual WAN
- Hub-Spoke → Azure Hub-Spoke Reference
- NetworkPolicy → Kubernetes CNI

### 7.3 리스크 관리 체크리스트
프로덕션 배포 전 점검 항목:
- 벤더 편향 방지: Capability 중심 매핑 (이미 적용)
- 문서 드리프트: `lifecycle` 필드 + 정기 재검증 (부분 적용)
- 민감정보 마스킹: LLM 전송 전 토폴로지 익명화 (미구현 — 배포 시 필요)

### 7.4 UI 흐름도
현재 파이프라인 설명 자료로 재활용 가능:
```
Intent 파싱 → 지식 기반 분석 → 검증 → 추천 + 근거 제시
```

---

## 8. InfraFlow 현재 아키텍처 전체 구조

```
src/
├── types/infra.ts                    # 96+ InfraNodeType, InfraSpec 정의
├── lib/
│   ├── parser/                       # Layer 1: 자연어 → InfraSpec
│   │   ├── UnifiedParser.ts          # 통합 파서 (템플릿 우선 + LLM 폴백)
│   │   ├── templateMatcher.ts        # 규칙 기반 패턴 매칭
│   │   ├── componentDetector.ts      # 정규식 기반 컴포넌트 추출
│   │   └── patterns.ts              # 130+ 파싱 패턴
│   ├── knowledge/                    # Layer 2: 지식 그래프
│   │   ├── types.ts                  # TrustMetadata, SourceType, RelationType
│   │   ├── relationships.ts          # 115개 관계 (2,407줄)
│   │   ├── patterns.ts               # 32개 아키텍처 패턴 (1,699줄)
│   │   ├── antipatterns.ts           # 45개 안티패턴 (1,456줄)
│   │   ├── failures.ts               # 64개 장애 시나리오
│   │   ├── performance.ts            # 42개 성능 프로파일
│   │   ├── vulnerabilities.ts        # 47개 CVE
│   │   ├── cloudCatalog.ts           # 67개 클라우드 서비스
│   │   ├── sourceRegistry.ts         # 40+ 검증 출처
│   │   ├── contextEnricher.ts        # 지식 → LLM 프롬프트 주입
│   │   └── vendorCatalog/            # 벤더 제품 카탈로그
│   │       ├── types.ts              # ProductNode 인터페이스
│   │       ├── vendors/cisco.ts      # 214개 제품
│   │       ├── vendors/fortinet.ts   # 90개 제품
│   │       ├── vendors/paloalto.ts   # 76개 제품
│   │       └── vendors/arista.ts     # 50개 제품
│   ├── recommendation/               # Layer 3: 추천 엔진
│   │   ├── matcher.ts                # 벤더 제품 매칭
│   │   └── scorer.ts                 # 4차원 스코어링 (type/role/useCase/HA)
│   ├── consulting/                   # Layer 3: 컨설팅 워크플로우
│   │   ├── patternMatcher.ts         # 요구사항 → 패턴 매칭 (4차원)
│   │   ├── gapAnalyzer.ts            # 6카테고리 갭 분석
│   │   ├── complianceReportGenerator.ts  # 6개 프레임워크 보고서
│   │   └── costComparator.ts         # 다중 벤더 비용 비교
│   ├── audit/                        # 감사/검증
│   │   └── complianceChecker.ts      # 결정적 규칙 기반 검증
│   ├── export/                       # 내보내기
│   │   ├── terraformExport.ts        # Terraform HCL 생성
│   │   ├── kubernetesExport.ts       # K8s YAML 생성
│   │   └── plantUMLExport.ts         # PlantUML/Mermaid 생성
│   └── llm/                          # LLM 연동
│       └── prompts.ts                # 시스템 프롬프트 빌더
├── app/api/llm/route.ts              # LLM API (Claude/OpenAI 폴백)
└── components/                       # React Flow 기반 UI
```

**테스트**: 116개 파일, 3,499개 테스트, 모두 통과
**타입 체크**: TypeScript strict, clean build

---

## 9. 최종 결론

InfraFlow는 ChatGPT 리서치 보고서가 권고한 핵심 아키텍처의 **대부분을 이미 구현**하고 있으며, 일부는 **초과 달성**했다. 보고서가 제안하는 정식 시맨틱 웹 스택(RDF/OWL/SHACL), 그래프 DB, OPA는 현재 프로젝트 규모와 단일 플랫폼 특성에 비해 **과잉 설계**다.

**수용할 것**: Well-Architected 통합, 근거/검증 UI
**참고할 것**: 공식 링크 모음, 리스크 체크리스트
**무시할 것**: RDF/OWL/SHACL, Neptune/Neo4j, OPA, Cytoscape.js, FlowEvent/IPFIX
