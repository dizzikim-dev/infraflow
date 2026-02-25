# Deep Research 보고서 통합 — 설계 문서

> **날짜**: 2026-02-25
> **입력**: GPT Deep Research 보고서 (10 페르소나, 100 질문, 7 카테고리)
> **목표**: 보고서에서 도출된 아이디어를 InfraFlow에 접목하여 답변 품질·신뢰·UX를 강화

---

## 목차

1. [인라인 참조 박스 (Reference Box)](#1-인라인-참조-박스)
2. [프로젝트 프로파일 (Project Profile)](#2-프로젝트-프로파일)
3. [모범답변 구조화 (Structured Response)](#3-모범답변-구조화)
4. [전제·확인 섹션 (Assumption Checker)](#4-전제확인-섹션)
5. [페르소나 적응 (Persona Adaptation)](#5-페르소나-적응)
6. [비용 민감도 분석 (Cost Sensitivity)](#6-비용-민감도-분석)
7. [Input Secret/PII 탐지](#7-input-secretpii-탐지)

---

## 1. 인라인 참조 박스

### 목적

PromptPanel의 응답 영역에 "이 답변의 근거"를 인라인으로 보여주는 접이식 컴포넌트.
EvidencePanel(노드 레벨, 사이드바)과 달리 **응답 레벨**의 신뢰 정보를 제공한다.

### 아키텍처

```
TraceCollector (raw TracedDocument[] + TracedRelationship[])
       │
       ▼
SourceAggregator (공용 util)
  ├─ dedupe: URL 기준 중복 제거
  ├─ rank: sourceType 기준 정렬 (rfc > nist > owasp > vendor > industry > community)
  ├─ limit: 기본 3~7개
  └─ tag: usedInSteps[] ("rag" | "enrichment" | "verify" | "live-augment")
       │
       ▼
AggregatedSource[] → LLM API 응답에 포함
       │
       ▼
ParseResultInfo.answerEvidence
       │
       ▼
ReferenceBox (PromptPanel 하위 컴포넌트)
```

### 데이터 타입

```typescript
/** 정제된 단일 출처 */
interface AggregatedSource {
  id: string;
  title: string;
  url?: string;
  sourceType: string; // rfc, nist, vendor, ...
  confidence: number;
  /** 이 소스가 사용된 파이프라인 단계들 */
  usedInSteps: ('rag' | 'enrichment' | 'verify' | 'live-augment')[];
}

/** 참조 박스에 필요한 응답 레벨 근거 */
interface AnswerEvidence {
  sources: AggregatedSource[];
  /** PostVerifier 결과 배지 */
  verificationBadge: 'pass' | 'warning' | 'fail';
  verificationScore: number;
  /** 미해결 이슈 */
  openIssues: string[];
  /** 사용된 패턴 이름들 */
  patternsMatched: string[];
}
```

### UI 동작

- **접힌 상태 (기본)**: `▸ 참조 출처 (5) · 검증 PASS · 경고 1` — 한 줄
- **펼친 상태**: 3~7개 소스 카드 리스트 (sourceType 배지 + title + usedInSteps 태그)
- **"자세히 보기"**: EvidencePanel 열기 (깊이는 사이드패널이 담당)
- **검증 배지**: PostVerifier score → pass(>=70)/warning(50-69)/fail(<50) 색상 분기

### 신규/수정 파일

| 파일 | 변경 |
|---|---|
| `src/lib/rag/sourceAggregator.ts` | **신규** — dedupe/rank/limit/tag 로직 |
| `src/lib/rag/types.ts` | `AggregatedSource`, `AnswerEvidence` 타입 추가 |
| `src/hooks/usePromptParser.ts` | `ParseResultInfo`에 `answerEvidence` 필드 추가 |
| `src/hooks/useLocalParser.ts` | LLM 응답에서 answerEvidence 전달 |
| `src/lib/llm/llmParser.ts` | `LLMParseResult`에 answerEvidence 추가 |
| `src/app/api/llm/route.ts` | SourceAggregator 호출, 응답에 answerEvidence 포함 |
| `src/components/panels/ReferenceBox.tsx` | **신규** — 접이식 참조 박스 컴포넌트 |
| `src/components/panels/PromptPanel.tsx` | ReferenceBox 삽입 (AI 응답 하단) |
| 테스트: `sourceAggregator.test.ts`, `ReferenceBox.test.tsx` | **신규** |

---

## 2. 프로젝트 프로파일

### 목적

업종·규모·SLA·예산·규제범위를 **프로젝트 단위로 N개** 저장하여, 매 질문에 자동 적용.
RequirementsWizardPanel의 결과를 재사용 가능하게 만든다.

### 데이터 타입

```typescript
interface ProjectProfile {
  id: string;            // nanoid(8)
  name: string;          // "금융권 프로젝트", "스타트업 MVP" 등
  createdAt: number;
  updatedAt: number;

  // 업종·규모
  industry: string;      // 'finance' | 'healthcare' | 'public' | 'ecommerce' | ...
  companySize: string;   // 'startup' | 'smb' | 'enterprise'
  teamSize?: number;

  // 기술 제약
  slaTarget?: string;    // '99.9' | '99.99' | '99.999'
  dataClassification?: string; // 'public' | 'internal' | 'confidential' | 'restricted'
  regulations?: string[];     // ['isms-p', 'pci-dss', 'gdpr', ...]
  cloudPreference?: string;   // 'aws' | 'azure' | 'gcp' | 'multi' | 'on-prem'

  // 예산
  budgetRange?: { min: number; max: number; currency: string };

  // 페르소나 (영역 5와 통합)
  persona?: PersonaPreset;
}

interface ProjectProfileStore {
  version: 1;           // schemaVersion — 마이그레이션 대비
  activeProfileId: string | null;
  profiles: ProjectProfile[];
}
```

### 스토리지 전략

- **Phase 1**: localStorage (`infraflow-profiles` 키)
- **Phase 2 (향후)**: Prisma DB (로그인 사용자별)
- **마이그레이션 브릿지**: Export/Import JSON으로 Phase 1→2 이동 가능

### UX 흐름

1. PromptPanel 상단에 현재 프로파일 표시: `[금융권 프로젝트 ▾]`
2. 클릭 → 프로파일 선택/생성/편집 드롭다운
3. RequirementsWizardPanel 완료 시 → "프로파일로 저장" 버튼
4. 설정 페이지에서 Export/Import JSON

### 운영 포인트

- **schemaVersion**: `version: 1` 필드. 향후 필드 추가/변경 시 `migrateProfileStore(v1→v2)` 함수
- **민감정보 가드**: 저장 시 `validateProfileSafety()` 체크 (API Key/비밀번호/고객실명 패턴)
  + UI에 "API 키, 비밀번호, 고객 실명은 저장하지 마세요" 안내 문구
- **LLM 연결**: `buildEnrichedSystemPrompt()`에 activeProfile 전달 → 맥락 자동 적용

### 신규/수정 파일

| 파일 | 변경 |
|---|---|
| `src/types/profile.ts` | **신규** — ProjectProfile, ProjectProfileStore 타입 |
| `src/hooks/useProjectProfile.ts` | **신규** — localStorage CRUD + Context Provider |
| `src/lib/validations/profile.ts` | **신규** — Zod 스키마 + validateProfileSafety() |
| `src/components/panels/ProfileSelector.tsx` | **신규** — 드롭다운 + 생성/편집/Export/Import |
| `src/components/panels/PromptPanel.tsx` | ProfileSelector 삽입 |
| `src/app/api/llm/route.ts` | 요청에 profile 수신 → system prompt 반영 |
| 테스트: `useProjectProfile.test.ts`, `profile.test.ts` | **신규** |

---

## 3. 모범답변 구조화

### 목적

LLM 응답을 "요약→전제→L1→L2→L3→산출물→Trace" 구조로 강제하여, 일관된 컨설팅 품질 제공.

### 전략: 1-pass + Auto-Repair

```
1-pass 요청: spec + structuredMeta
       │
       ▼ 파싱 성공?
  ┌────┴────┐
  YES       NO
  │         │
  ▼         ▼
구조화 렌더링  fallback 렌더링 (spec만, 메타는 "정보 부족")
              │
              ▼ 필수 필드 N개 이상 누락?
         ┌────┴────┐
         NO        YES (필요 시에만)
         │         │
         ▼         ▼
    그대로 표시  Repair pass (저렴 모델, 짧은 프롬프트)
```

### 스키마 (UI가 필요한 메타를 강제)

```typescript
/** LLM이 spec과 함께 반환하는 구조화 메타 */
interface StructuredResponseMeta {
  /** 3~5줄 핵심 결론 */
  summary: string;
  /** 답변의 전제/가정 (사용자에게 확인 요청) */
  assumptions: string[];
  /** 2~3개 옵션 (최소 2개) */
  options: {
    name: string;
    pros: string[];
    cons: string[];
    estimatedCostRange?: string;
  }[];
  /** 트레이드오프 설명 */
  tradeoffs: string[];
  /** 생성 가능한 산출물 목록 */
  artifacts: ('terraform' | 'kubernetes' | 'checklist' | 'cost-table' | 'compliance-report')[];
}

/** 전체 LLM 응답 (기존 spec + 신규 meta) */
interface EnhancedLLMResponse {
  spec: InfraSpec;                    // 기존 — 필수
  meta?: StructuredResponseMeta;      // 신규 — optional (graceful degradation)
  answerEvidence?: AnswerEvidence;    // 영역 1에서 추가
}
```

### System Prompt 수정

현재 `SYSTEM_PROMPT`의 "Only output valid JSON. No explanations." 부분을 확장:

```
Output a JSON object with two top-level keys:
1. "spec": { nodes, connections, zones }  — REQUIRED
2. "meta": { summary, assumptions, options, tradeoffs, artifacts }  — RECOMMENDED

If you cannot fill all meta fields, include what you can. The spec is mandatory.
```

### 파싱 전략

- `parseJSONFromLLMResponse()` 확장: `spec`은 필수, `meta`는 optional
- `meta` 없거나 파싱 실패 → 기존처럼 spec만 사용 (하위 호환 유지)
- `meta.options`가 2개 미만 → warning 표시 (repair 불필요)

### 신규/수정 파일

| 파일 | 변경 |
|---|---|
| `src/types/structuredResponse.ts` | **신규** — StructuredResponseMeta 타입 |
| `src/lib/llm/jsonParser.ts` | spec + meta 동시 파싱, meta optional fallback |
| `src/lib/llm/responseRepair.ts` | **신규** — 깨진 meta를 저렴 모델로 복구 (on-demand) |
| `src/app/api/llm/route.ts` | SYSTEM_PROMPT 확장, meta 반환 |
| `src/hooks/usePromptParser.ts` | ParseResultInfo에 `responseMeta` 필드 추가 |
| `src/components/panels/StructuredResponseView.tsx` | **신규** — 요약/전제/옵션/트레이드오프 UI |
| `src/components/panels/PromptPanel.tsx` | StructuredResponseView 삽입 |
| 테스트: `jsonParser.test.ts` 확장, `responseRepair.test.ts`, `StructuredResponseView.test.tsx` | 신규/확장 |

---

## 4. 전제·확인 섹션

### 목적

사용자 질문에 빠진 제약조건을 감지하고, 프로파일에서 자동 채워지지 않는 항목만 확인 요청.

### 전략: 규칙 기반 + PostVerifier 연결

```
사용자 프롬프트
       │
       ▼
extractNodeTypesFromPrompt() → nodeTypes[]
       │
       ▼
requiredAssumptions 테이블 조회 (노드 타입/카테고리별)
       │
       ▼
activeProfile에서 이미 답변된 항목 제거
       │
       ▼
PostVerifier.missingRequired와 교차 → 추가 누락 감지
       │
       ▼
필수/선택 분리, 필수만 우선, 최대 3~5개
       │
       ▼
AssumptionPrompt UI (PromptPanel 상단)
```

### requiredAssumptions 테이블

```typescript
/** 노드 타입별 필요한 전제 조건 */
const REQUIRED_ASSUMPTIONS: Record<string, AssumptionDef[]> = {
  'db-server': [
    { key: 'rpo', label: 'RPO (복구 시점)', labelKo: 'RPO (복구 시점 목표)', priority: 'required' },
    { key: 'rto', label: 'RTO (복구 시간)', labelKo: 'RTO (복구 시간 목표)', priority: 'required' },
    { key: 'writeRatio', label: 'Write ratio', labelKo: '쓰기/읽기 비율', priority: 'optional' },
    { key: 'pii', label: 'Contains PII?', labelKo: '개인정보 포함 여부', priority: 'required' },
    { key: 'encryptionAtRest', label: 'Encryption at rest', labelKo: '저장 암호화 필요', priority: 'optional' },
  ],
  'waf': [
    { key: 'trafficRegion', label: 'Traffic region', labelKo: '트래픽 유입 지역', priority: 'required' },
    { key: 'compliance', label: 'Compliance framework', labelKo: '적용 컴플라이언스', priority: 'required' },
    { key: 'threatModel', label: 'Threat model', labelKo: '위협 모델', priority: 'optional' },
  ],
  'load-balancer': [
    { key: 'peakQps', label: 'Peak QPS', labelKo: '피크 초당 요청 수', priority: 'required' },
    { key: 'stickySession', label: 'Sticky sessions?', labelKo: '세션 고정 필요', priority: 'optional' },
  ],
  // ... 주요 노드 타입별 확장
};

interface AssumptionDef {
  key: string;
  label: string;
  labelKo: string;
  priority: 'required' | 'optional';
  /** 프로파일 필드명과 매핑 (자동 채움용) */
  profileField?: keyof ProjectProfile;
}
```

### UX 규칙 (고정)

1. 한 번에 **최대 3~5개**만 표시
2. 프로파일에 이미 답변한 항목은 **스킵**
3. **필수만 우선** 표시, 선택은 "더 보기"로
4. 사용자가 "건너뛰기" 가능 (답변 없이 진행)
5. 답변한 항목은 프로파일에 자동 저장 (다음 질문에서 재사용)

### 신규/수정 파일

| 파일 | 변경 |
|---|---|
| `src/lib/knowledge/assumptions.ts` | **신규** — REQUIRED_ASSUMPTIONS 테이블 |
| `src/lib/knowledge/assumptionChecker.ts` | **신규** — 누락 감지 + 프로파일 필터 + PostVerifier 교차 |
| `src/components/panels/AssumptionPrompt.tsx` | **신규** — 전제 확인 UI (칩/인라인 폼) |
| `src/components/panels/PromptPanel.tsx` | AssumptionPrompt 삽입 (프롬프트 제출 후, 다이어그램 생성 전) |
| `src/hooks/useLocalParser.ts` | 파싱 후 assumptionChecker 호출, 결과를 UI에 전달 |
| 테스트: `assumptionChecker.test.ts`, `AssumptionPrompt.test.tsx` | **신규** |

---

## 5. 페르소나 적응

### 목적

페르소나에 따라 **강조/깊이/용어 수준**을 조절. 사실/구조는 절대 바꾸지 않음.

### 3축 모델

```typescript
interface PersonaPreset {
  id: string;
  name: string;
  nameKo: string;
  /** Depth: 요약 ↔ 디테일 */
  depth: 'summary' | 'standard' | 'detailed';
  /** Focus: 강조 영역 */
  focus: 'cost-schedule' | 'security-compliance' | 'operations-sre' | 'learning';
  /** Tone: 응답 톤 */
  tone: 'consulting' | 'learning';
}

const PERSONA_PRESETS: PersonaPreset[] = [
  { id: 'p1-cto',        name: 'Startup CTO',       nameKo: '스타트업 CTO',    depth: 'standard', focus: 'cost-schedule',       tone: 'consulting' },
  { id: 'p2-consultant',  name: 'SI Consultant',      nameKo: 'SI 컨설턴트',    depth: 'detailed', focus: 'cost-schedule',       tone: 'consulting' },
  { id: 'p3-it-manager',  name: 'SMB IT Manager',     nameKo: '중소기업 IT관리자', depth: 'standard', focus: 'operations-sre',      tone: 'consulting' },
  { id: 'p4-architect',   name: 'Cloud Architect',    nameKo: '클라우드 아키텍트', depth: 'detailed', focus: 'operations-sre',      tone: 'consulting' },
  { id: 'p5-security',    name: 'Security/CISO',      nameKo: '보안/CISO',       depth: 'detailed', focus: 'security-compliance', tone: 'consulting' },
  { id: 'p6-ai-ml',       name: 'AI/ML Engineer',     nameKo: 'AI/ML 엔지니어',  depth: 'detailed', focus: 'operations-sre',      tone: 'consulting' },
  { id: 'p7-sre',         name: 'DevOps/SRE',         nameKo: 'DevOps/SRE',      depth: 'detailed', focus: 'operations-sre',      tone: 'consulting' },
  { id: 'p8-student',     name: 'Student/Educator',   nameKo: '학생/교육자',      depth: 'standard', focus: 'learning',            tone: 'learning'   },
  { id: 'p9-public',      name: 'Public Sector',      nameKo: '공공기관',         depth: 'standard', focus: 'security-compliance', tone: 'consulting' },
  { id: 'p10-msp',        name: 'MSP/Reseller',       nameKo: 'MSP/리셀러',      depth: 'standard', focus: 'cost-schedule',       tone: 'consulting' },
];
```

### System Prompt 분기

`buildEnrichedSystemPrompt()`에 페르소나 지시어 추가:

```typescript
function buildPersonaInstruction(persona: PersonaPreset): string {
  const depthMap = {
    summary: '핵심만 간결하게. 3~5줄 요약 중심.',
    standard: '표준 깊이. 요약 + 핵심 설명 + 다음 단계.',
    detailed: '상세 분석. 트레이드오프, 대안, 운영 고려사항 포함.',
  };
  const focusMap = {
    'cost-schedule': '비용과 일정을 최우선으로 강조.',
    'security-compliance': '보안 통제, 컴플라이언스 증빙, 위험 분석을 최우선으로.',
    'operations-sre': '운영 안정성, 관측성, 장애 대응을 최우선으로.',
    'learning': '개념 설명 중심. 용어를 풀어서 설명하고 예시를 많이 사용.',
  };
  const toneMap = {
    consulting: '전문 컨설턴트 톤. 근거 기반, 비교 분석 중심.',
    learning: '교육자 톤. 친절하게, 단계적으로, 배경지식 없어도 이해 가능하게.',
  };

  return `\n\n[Response Style]\n- Depth: ${depthMap[persona.depth]}\n- Focus: ${focusMap[persona.focus]}\n- Tone: ${toneMap[persona.tone]}\n- IMPORTANT: Facts, architecture, and recommendations do NOT change based on persona. Only emphasis, depth, and terminology change.`;
}
```

### UI

- 프로파일 설정에 "저는 ___입니다" 셀렉터 (PERSONA_PRESETS 드롭다운)
- 고급: 3축 직접 조절 토글 (커스텀 페르소나)
- PromptPanel 하단에 현재 페르소나 표시: `[CTO · 비용/일정 · 표준]`

### 신규/수정 파일

| 파일 | 변경 |
|---|---|
| `src/types/profile.ts` | PersonaPreset 타입 + PERSONA_PRESETS 상수 |
| `src/lib/llm/personaInstruction.ts` | **신규** — buildPersonaInstruction() |
| `src/app/api/llm/route.ts` | persona 수신 → system prompt에 주입 |
| `src/components/panels/ProfileSelector.tsx` | 페르소나 셀렉터 통합 |
| 테스트: `personaInstruction.test.ts` | **신규** |

---

## 6. 비용 민감도 분석

### 목적

E(비용) 유형 질문에서 "입력 부족 → 시나리오 3안으로 흡수"하여 답변 품질 확보.

### 전략

기존 `costComparator`에 민감도 분석 레이어 추가:

```typescript
interface CostSensitivityResult {
  /** 보수적 상한 (peak traffic, no optimization) */
  upperBound: CostEstimate;
  /** 기준안 (stated requirements, standard optimization) */
  baseline: CostEstimate;
  /** 최적화 하한 (RI/Spot, caching, right-sizing) */
  lowerBound: CostEstimate;
  /** 민감 변수 (어떤 입력이 비용에 가장 큰 영향) */
  sensitiveVariables: {
    variable: string;
    variableKo: string;
    impactPercent: number;
  }[];
}
```

### 적용 지점

- `costComparator.ts`에 `analyzeSensitivity()` 함수 추가
- StructuredResponseMeta의 `options[]`에서 비용 범위가 있으면 자동 연결
- CostComparisonPanel에 3안 시나리오 탭 추가

### 신규/수정 파일

| 파일 | 변경 |
|---|---|
| `src/lib/consulting/costSensitivity.ts` | **신규** — analyzeSensitivity() |
| `src/lib/consulting/costComparator.ts` | sensitivity 호출 연결 |
| `src/components/panels/CostComparisonPanel.tsx` | 3안 시나리오 탭 |
| 테스트: `costSensitivity.test.ts` | **신규** |

---

## 7. Input Secret/PII 탐지

### 목적

현재 OUTPUT 측 탐지(5패턴 API key detection)를 INPUT 측으로 확장.
프로파일 저장 + 프롬프트 입력 모두 보호.

### 전략

기존 `validateOutputSafety()` 패턴을 재활용하여 `validateInputSafety()` 생성:

```typescript
interface InputSafetyResult {
  safe: boolean;
  detectedPatterns: {
    type: 'api-key' | 'password' | 'pii-name' | 'pii-email' | 'pii-phone' | 'credit-card';
    location: 'prompt' | 'profile';
    masked: string; // "sk-proj-****..."
  }[];
  /** 사용자에게 보여줄 경고 메시지 */
  warningMessage?: string;
  warningMessageKo?: string;
}
```

### 적용 지점

1. **프롬프트 입력**: PromptPanel에서 제출 전 실시간 체크 (debounce)
2. **프로파일 저장**: `useProjectProfile`의 save 시 체크
3. **Export JSON**: 내보내기 시 한번 더 스캔

### 탐지 패턴 (기존 5 + 신규 4 = 9패턴)

| 패턴 | 기존 | 신규 |
|---|---|---|
| AWS Key (AKIA...) | O | |
| GCP Key (AIza...) | O | |
| OpenAI Key (sk-...) | O | |
| GitHub Token (ghp_...) | O | |
| Slack Token (xoxb-...) | O | |
| 비밀번호 패턴 (password=, pwd=) | | O |
| 이메일 주소 | | O |
| 전화번호 (한국 패턴) | | O |
| 신용카드 번호 | | O |

### 신규/수정 파일

| 파일 | 변경 |
|---|---|
| `src/lib/security/inputSafetyCheck.ts` | **신규** — validateInputSafety() |
| `src/lib/security/llmSecurityControls.ts` | 공통 패턴 추출 (input/output 공유) |
| `src/hooks/useProjectProfile.ts` | 저장 시 inputSafety 체크 |
| `src/components/panels/PromptPanel.tsx` | 입력 시 실시간 경고 (debounce) |
| 테스트: `inputSafetyCheck.test.ts` | **신규** |

---

## 의존 관계 & 구현 순서

```
Phase 1 (기반)
├─ [7] Input Safety ─── 독립, 다른 영역의 기반
├─ [2] Project Profile ─── 독립, 4/5의 전제
└─ [1] Reference Box ─── 독립, 3과 데이터 공유

Phase 2 (핵심)
├─ [5] Persona Adaptation ─── 2에 의존 (프로파일에 persona 필드)
├─ [4] Assumption Checker ─── 2에 의존 (프로파일에서 자동 채움)
└─ [3] Structured Response ─── 1에 의존 (answerEvidence 공유)

Phase 3 (확장)
└─ [6] Cost Sensitivity ─── 3/4에 의존 (structuredMeta의 options, assumptions)
```

### Phase별 요약

| Phase | 영역 | 핵심 산출물 | 예상 테스트 수 |
|---|---|---|---|
| 1 | 7+2+1 | inputSafety, ProfileStore, SourceAggregator, ReferenceBox | ~60 |
| 2 | 5+4+3 | PersonaInstruction, AssumptionChecker, StructuredResponse | ~80 |
| 3 | 6 | CostSensitivity | ~20 |

---

## 검증 기준

모든 영역에 공통 적용:

1. **TypeScript strict**: `npx tsc --noEmit` 통과
2. **테스트**: `npx vitest run` 전체 통과 (기존 6,675 + 신규 ~160)
3. **하위 호환**: 기존 API/컴포넌트가 깨지지 않음 (optional 필드, graceful degradation)
4. **보안**: Input/Output 양방향 탐지 동작
5. **Bilingual**: 모든 신규 UI 텍스트에 한/영 병기
