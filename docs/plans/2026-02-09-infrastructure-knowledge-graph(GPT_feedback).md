([Past chat][1])([Past chat][2])([Past chat][1])([Past chat][3])

좋아. 파일 기준으로 보면 지금 DB 체계는 **“프로토타입을 넘어 파일럿 직전”** 단계야.
특히 Phase 4/5에서 파이프라인 핵심 모듈(dataCollector, trustScorer, conflictDetector, contextEnricher, feedbackProcessor)과 조직별 스키마/질의 처리/마이그레이션까지 이미 갖췄고, Neo4j+PostgreSQL+ChromaDB 3중 구조도 명확해.
성과 수치도 개선 폭이 커서(정확도, 정책준수, 만족도) 방향성은 맞아.
원문 파일은 여기서 바로 열어볼 수 있어: [infrastructure-knowledge-graph.md](sandbox:/mnt/data/2026-02-09-infrastructure-knowledge-graph.md)

---

## 1) 지금 설계의 강점과, 다음에 반드시 메꿔야 할 공백

### 강점 (이미 잘한 것)

* **멀티DB 역할 분리**: 그래프(관계/탐색), RDB(정형/히스토리), 벡터(의미검색) 분리가 명확함.
* **품질 루프 존재**: 신뢰도/충돌탐지/피드백 기반 학습 루프가 이미 동작함.
* **조직 적응성**: 팀별 스키마 + 자연어 질의 처리 + 기존 데이터 이관까지 완료.

### 공백 (고도화 시 리스크)

1. **증거(provenance) 표준화 부족**
   현재 “점수 산출은 있음”인데, “왜 그 결론이 나왔는지”를 엔티티/활동/행위자 단위로 추적하는 표준 모델이 있으면 감사/재현성이 크게 올라감. PROV-DM의 엔티티-활동-행위자 구조를 그대로 차용하면 좋음. ([W3C][4])

2. **스키마 검증/진화 체계 미흡 가능성**
   스키마가 빨리 바뀌는 플랫폼에서는 “런타임 데이터 유효성 검사 + 버전 규율”이 핵심인데, 그래프 검증엔 SHACL 같은 명시적 제약 언어가 유용함. ([W3C][5])

3. **정책 집행의 자동화 경계선 정의 필요**
   AI가 “인프라 생성/수정”까지 하므로, 고위험 변경은 반드시 policy-as-code + 승인 게이트가 필요. OPA/Rego + K8s 정책 계층(ValidatingAdmissionPolicy 등) 조합이 현실적임. ([openpolicyagent.org][6])

4. **LLM 보안 위협 대응 체계화 필요**
   Prompt Injection, Output Handling, Supply Chain 등은 플랫폼형 서비스에서 바로 사고 포인트라 OWASP LLM Top 10 v1.1 기준으로 컨트롤 맵을 붙여야 함. ([owasp.org][7])

---

## 2) 내가 추천하는 “다음 버전 DB 청사진” (실무형)

현재 3DB 구조는 유지하고, 그 위에 **Governance 레이어**를 추가하는 게 핵심이야.

### A. 데이터 레이어 (유지 + 강화)

* **PostgreSQL (Source of Truth / Event Store)**

  * raw_event, normalized_event, change_request, approval, audit_log
  * 반드시 `idempotency_key`, `event_hash`, `ingested_at` 포함
* **Neo4j (Operational Knowledge Graph)**

  * Resource, ConfigSnapshot, Policy, Vulnerability, Incident, ChangeSet, Evidence
  * 관계: `DEPENDS_ON`, `EXPOSES`, `AFFECTS`, `VIOLATES`, `MITIGATED_BY`, `DERIVED_FROM`
* **ChromaDB (Semantic Retrieval)**

  * 문서/티켓/런북/정책 텍스트 임베딩
  * `embedding_version`, `source_event_id`, `policy_scope` 메타데이터 필수

### B. 거버넌스 레이어 (신규)

* **Provenance Store**: PROV-DM 매핑

  * `entity_id`, `activity_id`, `agent_id`, `wasGeneratedBy`, `wasDerivedFrom`
* **Schema Registry + Validation**

  * 엔티티/관계/이벤트 스키마 버전(semver)
  * 쓰기 전 검증(Shape/Constraint) + 읽기 시 호환성 체크
* **Policy Decision Log**

  * OPA/Rego 결과(allow/deny/warn), 근거 규칙 ID, 리스크 레벨 저장

---

## 3) AI 생성/수정 플랫폼에 맞춘 “실행 안전장치” (가장 중요)

### 변경 실행 4단계 게이트

1. **AI 제안 생성** (자연어 → 변경안/패치안)
2. **정책 평가** (OPA/Rego + 환경 컨텍스트)
3. **리스크 등급화**

   * Low: 자동 반영 가능
   * Medium: 자동 + 사후검토
   * High/Critical: 사람 승인 없으면 차단
4. **적용 + 롤백 토큰 발급**

   * 모든 변경은 `change_set_id`로 추적 가능해야 함

이렇게 하면 “생성형 자동화”의 속도는 살리면서, 운영 사고를 제어할 수 있어.

---

## 4) 관측/평가 체계 (DB 고도화의 실제 성패)

### 필수 텔레메트리

* 수집 지연, 질의 지연, 정책 평가 지연, 벡터 검색 품질, 그래프 경로 정확성
* OpenTelemetry semantic conventions 기반으로 trace/log/metric 속성명을 통일하면 팀 간 디버깅 비용이 크게 줄어듦. ([OpenTelemetry][8])

### 필수 평가 세트

* **Offline Gold Set**: 네트워크/보안/서버/클라우드 대표 시나리오 100~300개
* **Online Feedback**: 사용자 수정/거절 패턴을 데이터 품질 신호로 재학습
* 추천 KPI:

  * Query 정확도: 84% → 90%+
  * 정책준수: 89% → 95%+
  * High-risk 무승인 적용: 0건
  * 롤백 평균 시간: < 5분

(현재 개선 지표가 이미 있으니, 다음 분기는 “정확도”보다 “안전성/재현성” 비중을 더 높이는 게 맞음.)

---

## 5) 90일 실행 로드맵 (바로 적용 가능)

### 0~30일 (기반 고정)

* 온톨로지 v1.0 freeze (엔티티/관계/필수속성 확정)
* Provenance 컬럼/노드 추가 (source, collector_version, evidence_hash)
* 고위험 변경 차단 룰 20개 우선 탑재 (네트워크 ACL, IAM, Public Exposure)

### 31~60일 (품질·보안)

* 정책 평가 파이프라인 OPA 연동
* 스키마 레지스트리 + 마이그레이션 자동검증
  준으로 매핑(프롬프트 주입, 출력 검증, 공급망 등) ([owasp.org][7])

### 61~90일 (확장·운영)

* 스트리밍 기반 수집(Kafka 등) + 재처리 파이프라인
* OpenLineage 스타일 lineage 이벤트(run/job/dataset/facet) 도입으로 “어떤 데이터가 어떤 판단에 사용됐는지” 가시화 ([GitHub][9])
* 운영 대시보드(정확도/안전성/처리량/SLO) 오픈

---

## 6) 프레임워크 정렬(조직 설득용)

실무/감사/경영진 설득을 위해, 내부 문서 체계를 아래처럼 정렬하면 좋아:

* **AI 리스크 운영**: NIST AI RMF (Govern/Map/Measure/Manage) 기준으로 정책·프로세스 매핑 ([NIST][10])
* **보안 개발 프로세스**: NIST SSDF 1.1 체크리스트 반영(개발/배포 수명주기 통제) ([NIST CSRC][11])
* **데이터 신뢰성**: PROV-DM + SHACL 기반 데이터 계보/검증 규칙 ([W3C][4])

---

네가 만든 현재 구조는 이미 “좋은 골격”이고, 이제 승부는 **(1) provenance, (2) policy gate, (3) schema governance** 3가지를 얼마나 빠르게 제품 기본값으로 녹이느냐야.
원하면 다음 단계로, 네 문서 기준으로 **실제 테이블/노드 스키마 초안(v1.0)**과 **OPA 정책 10개 샘플**까지 바로 뽑아줄게.

[1]: https://chatgpt.com/c/67fa8511-f95c-8012-ab88-5bd7a0ea8435 "VC 투자제안서 틀 작성"
[2]: https://chatgpt.com/c/691c56c7-f1d4-8323-ae3d-f40e6791098f "포트폴리오 구성 방법"
[3]: https://chatgpt.com/c/68c22b9f-1e74-8325-97b5-7224b439cc58 "KT 디지털 플랫폼 수주"
[4]: https://www.w3.org/TR/prov-dm/?utm_source=chatgpt.com "PROV-DM: The PROV Data Model"
[5]: https://www.w3.org/TR/shacl/?utm_source=chatgpt.com "Shapes Constraint Language (SHACL)"
[6]: https://www.openpolicyagent.org/ecosystem/entry/kubernetes-validating-admission "Kubernetes Admission Control | Open Policy Agent"
[7]: https://owasp.org/www-project-top-10-for-large-language-model-applications/?utm_source=chatgpt.com "OWASP Top 10 for Large Language Model Applications | OWASP Foundation"
[8]: https://opentelemetry.io/docs/concepts/semantic-conventions/ "Semantic Conventions | OpenTelemetry"
[9]: https://github.com/OpenLineage/OpenLineage?utm_source=chatgpt.com "GitHub - OpenLineage/OpenLineage: An Open Standard for lineage metadata collection"
[10]: https://www.nist.gov/itl/ai-risk-management-framework/nist-ai-rmf-playbook?utm_source=chatgpt.com "NIST AI RMF Playbook | NIST"
[11]: https://csrc.nist.gov/pubs/sp/800/218/final?utm_source=chatgpt.com "SP 800-218, Secure Software Development Framework (SSDF) Version 1.1: Recommendations for Mitigating the Risk of Software Vulnerabilities | CSRC"

---
---

# Claude Opus 4.6 리뷰: GPT 피드백에 대한 분석 및 개선 계획

> **작성**: Claude Opus 4.6 | 2026-02-09
> **대상**: 위 GPT 피드백 (섹션 1~6)
> **관점**: InfraFlow 코드베이스의 실제 구현을 기준으로 한 사실 기반 평가

---

## A. 전제 오류 분석: GPT가 오해한 부분

GPT는 IKG 설계 문서만 읽고 실제 코드를 확인하지 않은 상태에서 피드백을 작성했습니다.
그 결과 **프로젝트의 성격과 규모를 크게 오인**한 부분이 있습니다.

### A.1 프로젝트 성격 오인

| GPT의 가정 | InfraFlow 실제 |
|-----------|---------------|
| Neo4j + PostgreSQL + ChromaDB 3중 DB 구조 | **인메모리 TypeScript 모듈** (외부 DB 없음) |
| 실제 인프라를 생성/수정하는 프로비저닝 도구 | **다이어그램 시각화 도구** (React Flow 기반) |
| 멀티 사용자 운영 SaaS | **단일 사용자 클라이언트 앱** (Next.js) |
| Kafka 스트리밍, OPA 정책 엔진 필요 | 프론트엔드 앱, API route 2개 (`/api/parse`, `/api/llm`) |

### A.2 존재하지 않는 모듈 언급

GPT가 "이미 갖췄다"고 평가한 모듈 중 실제로 존재하지 않는 것:

- `dataCollector` — 없음
- `feedbackProcessor` — 없음
- "조직별 스키마 마이그레이션" — `organizationConfig.ts`는 인메모리 설정 객체일 뿐
- "자연어 질의 처리" — `ragSearch.ts`는 키워드 기반 인메모리 검색이지 NLQ가 아님

### A.3 성과 수치 오인

GPT가 언급한 "정확도 84%, 정책준수 89%" 등의 수치는 **우리 프로젝트에 존재하지 않는 지표**입니다.
InfraFlow는 아직 이런 정량적 평가 체계를 갖추고 있지 않습니다.

---

## B. 항목별 평가

### B.1 동의 — 현재 프로젝트에 적용 가치가 있는 제안

| # | GPT 제안 | 동의 근거 | 적용 방향 |
|---|---------|----------|----------|
| 1 | **OWASP LLM Top 10 대응** (섹션 1-4) | LLM API를 실제로 호출하고 있고, prompt injection은 실재하는 위협 | 현재 XML 태그 sanitization을 넘어 체계적 컨트롤 맵 필요 |
| 2 | **출처 추적성 강화** (섹션 1-1, PROV-DM 개념) | 지식 항목의 "왜 이 결론이 나왔는지" 추적은 투명성 핵심 | PROV-DM 전체가 아닌 경량 provenance 필드 확장 |
| 3 | **Offline Gold Set** (섹션 4) | LLM 파이프라인 품질 정량 측정에 필수 | E2E 테스트 시나리오 100개+ 구축 |
| 4 | **다이어그램 변경의 리스크 등급화** (섹션 3 일부) | LLM 수정 결과가 기존 구조를 파괴할 수 있음 | OPA가 아닌 경량 클라이언트 사이드 검증 |

### B.2 부분 동의 — 개념은 유효하나 적용 범위 조정 필요

| # | GPT 제안 | 조정 이유 | 우리 버전 |
|---|---------|----------|----------|
| 5 | **스키마 검증** (섹션 1-2) | SHACL은 RDF/그래프 DB 전용. 우리는 TypeScript | Zod 스키마 + 런타임 validation 강화 |
| 6 | **Policy Decision Log** (섹션 2-B) | OPA/Rego는 과잉이나 판단 로그 자체는 유용 | LLM 응답 + enrichContext 결과를 세션 히스토리에 저장 |
| 7 | **OpenTelemetry** (섹션 4) | 전체 도입은 과잉이나 LLM 호출 추적은 필요 | API route 레벨의 경량 로깅 (latency, token count, error rate) |

### B.3 비동의 — 현재 프로젝트에 맞지 않는 제안

| # | GPT 제안 | 비동의 근거 |
|---|---------|-----------|
| 8 | **Neo4j + PostgreSQL + ChromaDB** (섹션 2-A) | 클라이언트 앱에 3중 DB는 완전한 과잉. 인메모리 구조로 151개 지식 항목이 잘 동작 중 |
| 9 | **Kafka 스트리밍** (섹션 5, 61~90일) | 실시간 데이터 수집이 필요 없는 시각화 도구에 메시지 큐는 불필요 |
| 10 | **OpenLineage 계보 이벤트** (섹션 5) | run/job/dataset/facet 구조는 데이터 파이프라인 도구용. 우리는 해당 없음 |
| 11 | **K8s ValidatingAdmissionPolicy** (섹션 1-3) | 인프라를 프로비저닝하지 않으므로 K8s admission 정책은 적용 대상 아님 |
| 12 | **90일 로드맵 전체** (섹션 5) | 엔터프라이즈 인프라 관리 SaaS의 로드맵이지 우리 프로젝트가 아님 |

---

## C. 반영 개선 계획

위 B.1/B.2에서 동의한 7개 항목을 InfraFlow 규모에 맞게 구체화한 계획입니다.

### Phase 6: IKG 실전 연동 + 품질 안전망

#### PR 6-1: LLM 보안 컨트롤 맵

**근거**: GPT 섹션 1-4 (OWASP LLM Top 10)

현재 상태:
- `prompts.ts`: XML 태그 `<user_request>` 기반 입력 격리
- `responseValidator.ts`: JSON 구조 검증
- API route: Origin 헤더 CSRF 체크, rate limiter

추가 필요:
```
src/lib/security/
├── llmSecurityControls.ts    # OWASP LLM Top 10 매핑
└── __tests__/llmSecurityControls.test.ts
```

| OWASP LLM 항목 | 현재 상태 | 개선 사항 |
|----------------|----------|----------|
| LLM01: Prompt Injection | XML 태그 격리 있음 | 이중 검증 (입력 sanitize + 출력 schema 검증) |
| LLM02: Insecure Output | responseValidator 있음 | 허용 노드 타입 화이트리스트 강화 |
| LLM03: Training Data Poisoning | 해당 없음 (API 호출만) | — |
| LLM04: Model DoS | rate limiter 있음 | 토큰 수 제한 + 타임아웃 강화 |
| LLM05: Supply Chain | npm audit | 의존성 검사 CI 추가 |
| LLM06: Sensitive Info Disclosure | API 키 서버사이드 | 응답에서 민감 패턴 스캔 |
| LLM07: Insecure Plugin Design | plugin validator 있음 | sandbox 정책 추가 |
| LLM08: Excessive Agency | 다이어그램만 수정 (저위험) | 변경 범위 제한 (maxNodes, maxEdges) |
| LLM09: Overreliance | 출처 표시 시스템 (IKG) | LLM 제안에 항상 신뢰도+출처 병기 |
| LLM10: Model Theft | 해당 없음 (SaaS API) | — |

**산출물**: 10개 항목 대응 현황 매트릭스 + 미비 항목 보완 코드

---

#### PR 6-2: 경량 Provenance 확장

**근거**: GPT 섹션 1-1 (PROV-DM 개념의 경량 적용)

현재 `TrustMetadata`에 이미 있는 것:
- `sources[]` (출처), `confidence` (신뢰도)
- `contributedBy`, `verifiedBy` (행위자)
- `upvotes/downvotes` (커뮤니티 검증)

PROV-DM 3요소를 경량 매핑:

| PROV-DM | 현재 IKG | 추가 필요 |
|---------|---------|----------|
| Entity (엔티티) | `KnowledgeEntryBase.id` | 이미 있음 |
| Activity (활동) | 없음 | `derivedFrom?: string[]` (이 항목이 어떤 항목에서 파생됐는지) |
| Agent (행위자) | `contributedBy`, `verifiedBy` | `lastModifiedBy?: string` 추가 |

```typescript
// types.ts 확장
export interface TrustMetadata {
  // ... 기존 필드 ...
  derivedFrom?: string[];      // 이 항목이 참조/파생된 다른 지식 항목 ID
  lastModifiedBy?: string;     // 마지막 수정자 (사람 or 'system')
  modificationHistory?: {      // 변경 이력 (최근 5건)
    action: 'created' | 'updated' | 'reviewed' | 'voted';
    by: string;
    at: string;
    reason?: string;
  }[];
}
```

**범위**: types.ts 필드 추가 + enrichContext에서 derivedFrom 체인 추적 + 테스트
**비용**: 낮음 (타입 확장 + 선택적 필드)

---

#### PR 6-3: 다이어그램 변경 리스크 등급화

**근거**: GPT 섹션 3 (변경 게이트의 경량 버전)

InfraFlow에서 LLM이 다이어그램을 수정할 때, 변경 내용의 위험도를 자동 평가:

```
src/lib/parser/
├── changeRiskAssessor.ts      # 변경 리스크 평가
└── __tests__/changeRiskAssessor.test.ts
```

```typescript
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ChangeRiskAssessment {
  level: RiskLevel;
  reasons: string[];
  reasonsKo: string[];
  affectedNodes: number;
  removedNodes: number;
  securityImpact: boolean;
  recommendation: 'auto-apply' | 'confirm' | 'review-required';
}

export function assessChangeRisk(
  before: InfraSpec,
  after: InfraSpec,
  knowledge: EnrichedKnowledge,
): ChangeRiskAssessment;
```

리스크 판단 기준:

| 조건 | 리스크 | 권장 |
|------|--------|------|
| 노드 1~2개 추가 | low | auto-apply |
| 노드 5개 이상 변경 | medium | confirm |
| 보안 장비(firewall, waf 등) 삭제 | high | review-required |
| 전체 구조 재구성 (노드 50%+ 변경) | critical | review-required |
| 안티패턴 신규 도입 | high | review-required |
| 필수 관계 위반 (mandatory requires 무시) | high | review-required |

**통합**: `usePromptParser` 훅에서 LLM 응답 적용 전 리스크 평가 → UI에 경고 표시

---

#### PR 6-4: LLM 파이프라인 Gold Set (E2E 품질 벤치마크)

**근거**: GPT 섹션 4 (Offline Gold Set)

```
src/__tests__/e2e/
├── goldSet.ts                 # 100개 테스트 시나리오 정의
├── goldSet.test.ts            # 자동 검증
└── scenarios/
    ├── basic.ts               # 기본 아키텍처 (20개)
    ├── security.ts            # 보안 시나리오 (20개)
    ├── cloud.ts               # 클라우드 아키텍처 (20개)
    ├── modification.ts        # 수정 명령 (20개)
    └── edge-cases.ts          # 엣지 케이스 (20개)
```

각 시나리오:
```typescript
interface GoldSetScenario {
  id: string;
  prompt: string;                    // 사용자 입력
  expectedComponents: InfraNodeType[]; // 반드시 포함해야 할 장비
  forbiddenComponents?: InfraNodeType[]; // 포함하면 안 되는 장비
  expectedConnections?: number;      // 최소 연결 수
  mustDetectPatterns?: string[];     // 감지해야 할 패턴
  mustWarnAntiPatterns?: string[];   // 경고해야 할 안티패턴
  category: 'basic' | 'security' | 'cloud' | 'modification' | 'edge-case';
}
```

**검증 방식**: fallback 파서 (LLM 없이) 기준으로 자동 검증 가능.
LLM 연동 시에는 수동/CI 환경에서 API 키로 실행.

---

#### PR 6-5: Zod 스키마 런타임 검증 강화

**근거**: GPT 섹션 1-2 (스키마 검증, SHACL 대신 Zod)

현재 `responseValidator.ts`에서 LLM 응답의 JSON 구조를 수동으로 검증하고 있으나,
Zod 스키마로 교체하면 타입 안전성 + 런타임 검증이 동시에 보장됨:

```typescript
// responseValidator.ts 내부 개선
import { z } from 'zod';

const LLMResponseSchema = z.object({
  nodes: z.array(z.object({
    id: z.string().min(1),
    type: z.enum([...ALL_INFRA_NODE_TYPES]),
    label: z.string(),
  })),
  edges: z.array(z.object({
    source: z.string(),
    target: z.string(),
  })),
  // ...
});

// userContributions.ts submit() 내부 개선
const QuickTipSchema = z.object({
  id: z.string(),
  type: z.literal('tip'),
  component: z.enum([...ALL_INFRA_NODE_TYPES]),
  category: z.enum(['gotcha', 'performance', 'security', 'cost', 'operations']),
  tipKo: z.string().min(5),
  tags: z.array(z.string()).min(1),
  trust: TrustMetadataSchema,
});
```

**범위**: responseValidator + userContributions의 autoValidate를 Zod 기반으로 교체
**효과**: 수동 if/else 검증 → 선언적 스키마, 에러 메시지 자동 생성

---

#### PR 6-6: LLM 호출 경량 로깅

**근거**: GPT 섹션 4 (텔레메트리, OpenTelemetry 대신 경량 버전)

```typescript
// src/lib/utils/llmMetrics.ts
export interface LLMCallMetric {
  timestamp: string;
  provider: 'claude' | 'openai' | 'fallback';
  model: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  success: boolean;
  errorType?: string;
  riskLevel?: RiskLevel;         // PR 6-3 연동
  validationPassed: boolean;     // responseValidator 결과
}

export function recordLLMCall(metric: LLMCallMetric): void;
export function getLLMMetrics(since?: string): LLMCallMetric[];
export function getLLMSummary(): {
  totalCalls: number;
  successRate: number;
  avgLatencyMs: number;
  fallbackRate: number;
  validationPassRate: number;
};
```

**저장**: 인메모리 (최근 100건 링 버퍼). 브라우저 세션 동안만 유지.
**통합**: `/api/llm` route에서 자동 기록.

---

### 실행 우선순위

```
우선순위 ─────────────────────────────────────────────▶

높음 (즉시)                     중간                      낮음 (여유시)
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ PR 6-3           │  │ PR 6-1           │  │ PR 6-2           │
│ 변경 리스크 등급화 │  │ LLM 보안 컨트롤 맵│  │ Provenance 확장   │
│ (LLM 수정 안전성) │  │ (OWASP 매핑)     │  │ (derivedFrom 등) │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ PR 6-5           │  │ PR 6-4           │  │ PR 6-6           │
│ Zod 스키마 강화   │  │ Gold Set 100개   │  │ LLM 호출 메트릭   │
│ (런타임 검증)     │  │ (품질 벤치마크)   │  │ (경량 로깅)       │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

### 요약

GPT 피드백 12개 항목 중:
- **4개 동의** (LLM 보안, 출처 추적, Gold Set, 리스크 등급화)
- **3개 부분 동의** (스키마 검증→Zod, 판단 로그→세션 히스토리, 텔레메트리→경량 로깅)
- **5개 비동의** (3중 DB, Kafka, OpenLineage, K8s Admission, 90일 로드맵)

동의/부분 동의 7개를 InfraFlow 규모에 맞게 **6개 PR**로 구체화.
핵심은 GPT가 제안한 "엔터프라이즈 인프라" 솔루션을 **"클라이언트 사이드 시각화 앱"** 규모로 축소 적용하는 것.

---

## Phase 6 실행 결과

> 실행일: 2026-02-09

### 완료된 PR

| PR | 모듈 | 테스트 | 상태 |
|----|------|--------|------|
| **PR 6-1** | `src/lib/security/llmSecurityControls.ts` | 66 tests | **완료** |
| **PR 6-2** | `src/lib/knowledge/types.ts` (provenance 확장) | 기존 테스트 통과 | **완료** |
| **PR 6-3** | `src/lib/parser/changeRiskAssessor.ts` | 43 tests | **완료** |
| **PR 6-4** | `src/__tests__/benchmarks/goldSet.test.ts` | 100 tests | **완료** |
| **PR 6-5** | `src/lib/knowledge/userContributions.ts` (Zod 마이그레이션) | 27 tests | **완료** |
| **PR 6-6** | `src/lib/utils/llmMetrics.ts` | 25 tests | **완료** |

### 주요 구현 내용

**PR 6-1 — OWASP LLM Top 10 보안 컨트롤 맵**
- OWASP LLM Top 10 v1.1 전체 10개 항목 매핑
- sanitizeUserInput() — 프롬프트 인젝션 방지
- validateOutputSafety() — LLM 출력 보안 검사
- runSecurityAudit() — 보안 상태 점수화 (0-100)

**PR 6-2 — 경량 Provenance**
- TrustMetadata에 derivedFrom, lastModifiedBy, modificationHistory 필드 추가
- PROV-DM 영감 받은 경량 구현

**PR 6-3 — 변경 리스크 등급화**
- assessChangeRisk(before, after) → low/medium/high/critical
- 12개 리스크 팩터 감지 (보안노드 삭제, SPOF, 안티패턴 도입 등)
- IKG 안티패턴 + 필수 의존성 연동

**PR 6-5 — Zod 런타임 검증**
- userContributions.ts autoValidate: if/else → Zod 스키마
- confidence 범위(0-1), 소스 최소 1개 등 구조적 검증 강화
- responseValidator.ts는 이미 Zod 사용 확인 → 중복 방지

**PR 6-6 — LLM 메트릭 로깅**
- Ring buffer (max 200) 인메모리 메트릭
- 성공률, 평균/p95 지연, 토큰 합계, fallback률, 검증 통과율
- providerBreakdown, errorBreakdown 통계

### 전체 테스트 현황

```
Phase 6 완료 후: 59 test files, 1,907 tests (all passing)
TypeScript: clean (no errors)
```
