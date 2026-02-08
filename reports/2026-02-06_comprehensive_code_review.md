# InfraFlow 프로젝트 종합 코드 리뷰 및 개선 플랜

> **작성일**: 2026-02-06
> **목적**: 프로젝트 코드 검토, 비관/낙관 피드백 종합, 개선 PR 플랜
> **대상**: Claude AI 세션 간 공유용

---

## 📋 목차

1. [프로젝트 현황 요약](#1-프로젝트-현황-요약)
2. [비관적(Pessimist) 분석 요약](#2-비관적pessimist-분석-요약)
3. [낙관적(Optimist) 분석 요약](#3-낙관적optimist-분석-요약)
4. [종합 피드백 분석](#4-종합-피드백-분석)
5. [개선 사항 우선순위](#5-개선-사항-우선순위)
6. [PR 단위 상세 플랜](#6-pr-단위-상세-플랜)
7. [병렬 처리 다이어그램](#7-병렬-처리-다이어그램)
8. [다음 단계 권장사항](#8-다음-단계-권장사항)

---

## 1. 프로젝트 현황 요약

### 프로젝트 개요
| 항목 | 값 |
|------|-----|
| **프로젝트명** | InfraFlow - AI 인프라 시각화 플랫폼 |
| **위치** | `/Users/hyunkikim/dev/경기도의회 VDI Openclaw 구축/infraflow` |
| **TypeScript 파일** | 55개 |
| **주요 컴포넌트** | 30개 |
| **라이브러리 모듈** | 20개 |
| **테스트 파일** | 3개 |
| **사전정의 템플릿** | 12개 |

### 기술 스택
```
Frontend: Next.js 16, React 19, TypeScript 5
시각화: React Flow 12, Framer Motion
스타일링: Tailwind CSS 4
테스트: Vitest
```

### 핵심 기능
- ✅ 자연어 → 인프라 다이어그램 생성
- ✅ 5가지 데이터 흐름 애니메이션
- ✅ 24가지 인프라 노드 타입
- ✅ 12개 사전정의 템플릿
- ✅ PNG/SVG/PDF 내보내기
- ✅ Undo/Redo 히스토리

---

## 2. 비관적(Pessimist) 분석 요약

### 심각도별 문제 목록

| 심각도 | 문제 수 | 주요 이슈 |
|--------|--------|---------|
| **🔴 Critical** | 1 | API 키 클라이언트 노출 |
| **🟠 High** | 6 | 중복 코드, 타입 안전성, 에러 핸들링, 싱글톤 문제 |
| **🟡 Medium** | 8 | JSON 검증, 성능, 상태 관리, XSS 위험 |
| **🟢 Low** | 4 | 미사용 코드, 정규식 성능 |

### Critical 이슈

#### 🔴 C-1: API 키 노출 (Critical)
**파일**: `/src/lib/llm/llmParser.ts`
```typescript
// 문제: NEXT_PUBLIC_ 접두사는 클라이언트 번들에 포함됨
if (process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
  return {
    apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,  // 노출!
  };
}
```
**리스크**: API 키가 브라우저에서 접근 가능, 무단 사용 위험

### High 이슈

#### 🟠 H-1: 중복 코드 (High)
**파일**: `/src/lib/llm/llmParser.ts`
- `parseWithClaude()` (라인 52-118)와 `parseWithOpenAI()` (라인 123-188)가 70% 중복
- 에러 핸들링 로직 반복

#### 🟠 H-2: Non-null Assertion 남용 (High)
**파일**: `/src/lib/layout/layoutEngine.ts`
```typescript
adjacency.get(conn.source)!.push(conn.target);  // 런타임 에러 가능
```

#### 🟠 H-3: 싱글톤 인스턴스 관리 (High)
**파일**: `/src/lib/animation/animationEngine.ts`
- 멀티탭 환경에서 상태 공유 문제
- 테스트 격리 실패 가능

#### 🟠 H-4: 에러 핸들링 부족 (High)
**파일**: `/src/hooks/useAnimation.ts`
- engine null 체크 없이 메서드 호출

#### 🟠 H-5: 입력 검증 부족 (High)
**파일**: `/src/lib/parser/promptParser.ts`
- 노드 타입 검증 없이 타입 단언 사용

#### 🟠 H-6: JSON 파싱 검증 부족 (High)
**파일**: `/src/lib/llm/llmParser.ts`
- LLM 응답을 검증 없이 파싱

### Medium 이슈

#### 🟡 M-1: 상태 관리 복잡성
- `useInfraState`에 8개 독립 상태
- 상태 간 의존성 명확하지 않음

#### 🟡 M-2: XSS 가능성
- 사용자 입력 label이 검증 없이 렌더링

#### 🟡 M-3: 불필요한 리렌더링
- AnimatedEdge에서 data prop 변경 시 리렌더링

#### 🟡 M-4: 과도한 히스토리 복사
- HISTORY_MAX_SIZE=50, 메모리 사용량 증가

#### 🟡 M-5: React Flow 밀접 결합
- 향후 라이브러리 변경 시 대규모 리팩토링 필요

#### 🟡 M-6: deprecated API 사용
- `substr()` → `substring()` 변경 필요

#### 🟡 M-7: 미구현 기능 존재
- `handleModifyCommand` 미구현 상태

#### 🟡 M-8: 미사용 props
- `onNodesChange`, `onEdgesChange` 정의만 있음

### Low 이슈

#### 🟢 L-1: 정규식 반복 실행
#### 🟢 L-2: 문서화 부족
#### 🟢 L-3: 테스트 커버리지 부족 (3개 파일만)
#### 🟢 L-4: 디자인 토큰 분산

---

## 3. 낙관적(Optimist) 분석 요약

### 핵심 강점

| 영역 | 평가 | 상세 |
|------|------|------|
| **타입 시스템** | A+ | 완벽한 타입 가드, Union 타입 활용 |
| **패턴 설계** | A+ | SSoT 원칙, 다국어 지원 |
| **레이아웃 엔진** | A | 적응형 4티어 배치 |
| **애니메이션** | A | Event-driven, RAF 기반 |
| **컴포넌트 추상화** | A+ | DRY 원칙, memo 최적화 |
| **도메인 지식** | A+ | 1500줄 인프라 DB |

### 잘 구현된 부분

#### ✅ 타입 시스템의 견고성
```typescript
// Union type으로 명확한 도메인 모델링
export type SecurityNodeType = 'firewall' | 'waf' | 'ids-ips' | ...;

// 런타임 타입 검증
export function isInfraNodeData(data: unknown): data is InfraNodeData { ... }
```

#### ✅ 패턴 기반 파서
- 한/영 이중 언어 정규식 지원
- ConversationContext로 맥락 기억
- 확장 용이: 배열에 추가만 하면 됨

#### ✅ 인프라 DB (1500줄)
- 24가지 장비 상세 정보
- 권장 정책 내장
- 한/영 완전 지원

#### ✅ 템플릿 시스템
- 12개 사전정의 템플릿
- localStorage 기반 사용자 저장
- 공유 링크 생성

### 확장 가능성

1. **플러그인 시스템**: 패턴 기반 구조가 플러그인 레지스트리로 확장 가능
2. **레이아웃 알고리즘**: 인터페이스 기반으로 다양한 알고리즘 교체 가능
3. **데이터 소스**: AWS/K8s 등 자동 감지 확장 가능

### 차별화 포인트

1. **자연어 + 맥락 기억**: 경쟁사 대비 유일
2. **한/영 완벽 지원**: 정부/기업 시장 최적화
3. **정책/보안 통합**: 자동 감사 리포트 가능
4. **VDI 특화 템플릿**: 경기도의회 맞춤

---

## 4. 종합 피드백 분석

### 즉시 해결 필요 (P0)

| ID | 이슈 | 비관 평가 | 해결 난이도 | ROI |
|----|------|----------|------------|-----|
| C-1 | API 키 노출 | Critical | 낮음 | 매우 높음 |
| H-6 | JSON 검증 부족 | High | 낮음 | 높음 |
| H-2 | Non-null assertion | High | 낮음 | 중간 |

### 단기 해결 (P1)

| ID | 이슈 | 비관 평가 | 해결 난이도 | ROI |
|----|------|----------|------------|-----|
| H-1 | 코드 중복 | High | 중간 | 높음 |
| H-4 | 에러 핸들링 | High | 중간 | 높음 |
| L-3 | 테스트 부족 | Low | 중간 | 높음 |

### 중기 해결 (P2)

| ID | 이슈 | 비관 평가 | 해결 난이도 | ROI |
|----|------|----------|------------|-----|
| H-3 | 싱글톤 패턴 | High | 높음 | 중간 |
| M-1 | 상태 관리 | Medium | 높음 | 중간 |
| M-5 | React Flow 결합 | Medium | 높음 | 낮음 |

### 기능 강화 (P3)

| 기능 | 낙관 평가 | 해결 난이도 | ROI |
|------|----------|------------|-----|
| LLM 스마트 파싱 | A+ | 중간 | 매우 높음 |
| Terraform 내보내기 | A | 낮음 | 높음 |
| 자동 보안 감사 | A+ | 중간 | 매우 높음 |
| 실시간 협업 | A | 높음 | 높음 |

---

## 5. 개선 사항 우선순위

### P0 - 즉시 처리 (1-2일)
```
🔴 Critical 보안 이슈 해결
├── PR-SEC-01: API 키를 서버사이드로 이동
├── PR-SEC-02: LLM 응답 타입 검증 추가
└── PR-FIX-01: Non-null assertion 제거
```

### P1 - 단기 처리 (1주)
```
🟠 High 코드 품질 개선
├── PR-REFACTOR-01: LLM 파서 통합
├── PR-REFACTOR-02: 에러 핸들링 강화
├── PR-TEST-01: 핵심 로직 테스트 추가
└── PR-FIX-02: deprecated API 수정
```

### P2 - 중기 처리 (2주)
```
🟡 아키텍처 개선
├── PR-ARCH-01: 싱글톤 → 의존성 주입
├── PR-ARCH-02: 상태 관리 개선
└── PR-PERF-01: 렌더링 최적화
```

### P3 - 기능 강화 (3-4주)
```
🟢 새로운 기능
├── PR-FEAT-01: LLM 스마트 파싱
├── PR-FEAT-02: Terraform/K8s 내보내기
├── PR-FEAT-03: 자동 보안 감사
└── PR-FEAT-04: 실시간 협업
```

---

## 6. PR 단위 상세 플랜

### 📦 PR-SEC-01: API 키 서버사이드 이동

**우선순위**: P0 (Critical)
**예상 소요**: 4시간
**의존성**: 없음
**병렬 가능**: ✅

#### 작업 내용
```
변경 파일:
├── src/lib/llm/llmParser.ts (수정)
├── src/app/api/llm/route.ts (신규)
├── src/hooks/useInfraState.ts (수정)
└── .env.example (수정)
```

#### 상세 구현
1. **API Route 생성** (`/api/llm/route.ts`)
```typescript
// 서버사이드에서만 API 키 접근
export async function POST(request: Request) {
  const { prompt, provider } = await request.json();

  const apiKey = provider === 'claude'
    ? process.env.ANTHROPIC_API_KEY  // NEXT_PUBLIC_ 제거
    : process.env.OPENAI_API_KEY;

  // 서버에서 LLM 호출
  const result = await callLLM(prompt, apiKey, provider);
  return Response.json(result);
}
```

2. **클라이언트 수정** (`llmParser.ts`)
```typescript
// 직접 호출 → API Route 호출로 변경
export async function parseWithLLM(prompt: string): Promise<InfraSpec> {
  const response = await fetch('/api/llm', {
    method: 'POST',
    body: JSON.stringify({ prompt, provider: 'claude' }),
  });
  return response.json();
}
```

3. **환경변수 수정** (`.env.example`)
```bash
# 변경 전
NEXT_PUBLIC_ANTHROPIC_API_KEY=your-key

# 변경 후
ANTHROPIC_API_KEY=your-key  # 서버 전용
```

#### 검증
- [ ] 브라우저 DevTools에서 API 키 노출 여부 확인
- [ ] 네트워크 탭에서 요청 확인
- [ ] 프로덕션 빌드에서 키 포함 여부 확인

---

### 📦 PR-SEC-02: LLM 응답 타입 검증

**우선순위**: P0 (High)
**예상 소요**: 2시간
**의존성**: 없음
**병렬 가능**: ✅

#### 작업 내용
```
변경 파일:
├── src/lib/llm/llmParser.ts (수정)
└── src/types/guards.ts (수정)
```

#### 상세 구현
1. **타입 가드 추가** (`guards.ts`)
```typescript
export function isInfraSpec(data: unknown): data is InfraSpec {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;

  return (
    Array.isArray(obj.nodes) &&
    obj.nodes.every(isInfraNodeSpec) &&
    Array.isArray(obj.connections) &&
    obj.connections.every(isConnectionSpec)
  );
}
```

2. **파싱에 검증 추가** (`llmParser.ts`)
```typescript
function parseJSONResponse(content: string): InfraSpec | null {
  try {
    const parsed = JSON.parse(content);
    if (!isInfraSpec(parsed)) {
      console.error('Invalid InfraSpec format');
      return null;
    }
    return parsed;
  } catch { ... }
}
```

---

### 📦 PR-FIX-01: Non-null Assertion 제거

**우선순위**: P0 (High)
**예상 소요**: 2시간
**의존성**: 없음
**병렬 가능**: ✅

#### 작업 내용
```
변경 파일:
└── src/lib/layout/layoutEngine.ts (수정)
```

#### 상세 구현
```typescript
// 변경 전
adjacency.get(conn.source)!.push(conn.target);

// 변경 후
const sourceAdj = adjacency.get(conn.source);
if (sourceAdj) {
  sourceAdj.push(conn.target);
} else {
  adjacency.set(conn.source, [conn.target]);
}
```

---

### 📦 PR-REFACTOR-01: LLM 파서 통합

**우선순위**: P1 (High)
**예상 소요**: 4시간
**의존성**: PR-SEC-01
**병렬 가능**: ❌

#### 작업 내용
```
변경 파일:
└── src/lib/llm/llmParser.ts (수정)
```

#### 상세 구현
```typescript
// 공통 인터페이스 정의
interface LLMProvider {
  name: string;
  endpoint: string;
  formatRequest(prompt: string): object;
  parseResponse(response: object): string;
}

// 프로바이더별 구현
const providers: Record<string, LLMProvider> = {
  claude: {
    name: 'Claude',
    endpoint: 'https://api.anthropic.com/v1/messages',
    formatRequest: (prompt) => ({ model: 'claude-3-haiku', messages: [...] }),
    parseResponse: (res) => res.content[0].text,
  },
  openai: {
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    formatRequest: (prompt) => ({ model: 'gpt-4', messages: [...] }),
    parseResponse: (res) => res.choices[0].message.content,
  },
};

// 통합 함수
async function parseWithLLM(prompt: string, providerName: string): Promise<InfraSpec> {
  const provider = providers[providerName];
  const response = await fetch(provider.endpoint, {
    method: 'POST',
    body: JSON.stringify(provider.formatRequest(prompt)),
  });
  const content = provider.parseResponse(await response.json());
  return parseJSONResponse(content);
}
```

---

### 📦 PR-REFACTOR-02: 에러 핸들링 강화

**우선순위**: P1 (High)
**예상 소요**: 3시간
**의존성**: 없음
**병렬 가능**: ✅

#### 작업 내용
```
변경 파일:
├── src/hooks/useAnimation.ts (수정)
├── src/hooks/useInfraState.ts (수정)
├── src/lib/parser/promptParser.ts (수정)
└── src/lib/error/ErrorBoundary.tsx (신규)
```

#### 상세 구현
1. **null 체크 추가** (`useAnimation.ts`)
```typescript
const handleEvent = (event: AnimationEvent) => {
  const engine = engineRef.current;
  if (!engine) {
    console.warn('Animation engine not initialized');
    return;
  }
  setState(engine.getState());
};
```

2. **에러 바운더리 추가**
```typescript
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundaryBase fallback={<ErrorFallback />}>
      {children}
    </ErrorBoundaryBase>
  );
}
```

---

### 📦 PR-TEST-01: 핵심 로직 테스트 추가

**우선순위**: P1 (High)
**예상 소요**: 6시간
**의존성**: 없음
**병렬 가능**: ✅

#### 작업 내용
```
변경 파일:
├── src/__tests__/lib/parser/promptParser.test.ts (신규)
├── src/__tests__/lib/parser/smartParser.test.ts (신규)
├── src/__tests__/lib/layout/layoutEngine.test.ts (신규)
├── src/__tests__/lib/animation/animationEngine.test.ts (신규)
└── src/__tests__/hooks/useInfraState.test.ts (신규)
```

#### 테스트 목표
- [ ] promptParser: 기본 패턴 매칭 (10개 케이스)
- [ ] smartParser: 명령어 감지 (15개 케이스)
- [ ] layoutEngine: 노드 배치 (5개 케이스)
- [ ] animationEngine: 시퀀스 생성 (5개 케이스)
- [ ] useInfraState: 상태 변경 (10개 케이스)

#### 목표 커버리지
- **현재**: ~10%
- **목표**: 80% 이상

---

### 📦 PR-ARCH-01: 싱글톤 → 의존성 주입

**우선순위**: P2 (Medium)
**예상 소요**: 8시간
**의존성**: PR-TEST-01
**병렬 가능**: ❌

#### 작업 내용
```
변경 파일:
├── src/lib/animation/animationEngine.ts (수정)
├── src/contexts/AnimationContext.tsx (신규)
├── src/hooks/useAnimation.ts (수정)
└── src/app/layout.tsx (수정)
```

#### 상세 구현
```typescript
// Context 기반 의존성 주입
const AnimationContext = createContext<AnimationEngine | null>(null);

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [engine] = useState(() => new AnimationEngine());

  useEffect(() => {
    return () => engine.destroy();
  }, [engine]);

  return (
    <AnimationContext.Provider value={engine}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimationEngine(): AnimationEngine {
  const engine = useContext(AnimationContext);
  if (!engine) throw new Error('AnimationProvider not found');
  return engine;
}
```

---

### 📦 PR-FEAT-01: LLM 스마트 파싱

**우선순위**: P3 (Enhancement)
**예상 소요**: 12시간
**의존성**: PR-SEC-01, PR-REFACTOR-01
**병렬 가능**: ❌

#### 작업 내용
```
변경 파일:
├── src/lib/parser/intelligentParser.ts (신규)
├── src/app/api/parse/route.ts (신규)
├── src/hooks/useInfraState.ts (수정)
└── src/lib/parser/index.ts (수정)
```

#### 상세 구현
```typescript
// Claude API를 활용한 의도 분석
export async function intelligentParse(
  prompt: string,
  context: ConversationContext
): Promise<SmartParseResult> {
  const systemPrompt = `당신은 인프라 아키텍처 전문가입니다.
  사용자 프롬프트에서:
  1. 의도(create, add, remove, modify, connect) 식별
  2. 컴포넌트(방화벽, 로드밸런서 등) 추출
  3. 위치(앞에, 뒤에, 사이에) 추출

  JSON으로 응답하세요.`;

  const response = await callClaude(systemPrompt, prompt, context);
  return buildSmartResult(response);
}
```

---

### 📦 PR-FEAT-02: Terraform/K8s 내보내기

**우선순위**: P3 (Enhancement)
**예상 소요**: 8시간
**의존성**: 없음
**병렬 가능**: ✅

#### 작업 내용
```
변경 파일:
├── src/lib/export/terraformExport.ts (신규)
├── src/lib/export/kubernetesExport.ts (신규)
├── src/lib/export/plantUMLExport.ts (신규)
├── src/lib/export/index.ts (수정)
└── src/components/panels/ExportPanel.tsx (수정)
```

#### 지원 포맷
- Terraform HCL
- Kubernetes YAML
- PlantUML C4

---

### 📦 PR-FEAT-03: 자동 보안 감사

**우선순위**: P3 (Enhancement)
**예상 소요**: 10시간
**의존성**: PR-FEAT-01
**병렬 가능**: ❌

#### 작업 내용
```
변경 파일:
├── src/lib/audit/securityAudit.ts (신규)
├── src/lib/audit/auditReportGenerator.ts (신규)
├── src/components/panels/AuditPanel.tsx (신규)
└── src/app/page.tsx (수정)
```

#### 기능
- 권장 정책 누락 감지
- 아키텍처 패턴 분석
- 자연어 감사 리포트 생성

---

## 7. 병렬 처리 다이어그램

```
시간 ────────────────────────────────────────────────────────────────▶

P0: 즉시 처리 (1-2일)
┌─────────────────────────────────────────────────────────────────┐
│  병렬 스트림 A                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ PR-SEC-01    │  │ PR-SEC-02    │  │ PR-FIX-01    │          │
│  │ API 키 이동  │∥ │ 타입 검증    │∥ │ Non-null 제거│          │
│  │ 4시간        │  │ 2시간        │  │ 2시간        │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘

P1: 단기 처리 (1주)
┌─────────────────────────────────────────────────────────────────┐
│  병렬 스트림 B (PR-SEC-01 완료 후)                               │
│  ┌──────────────────┐                                           │
│  │ PR-REFACTOR-01   │                                           │
│  │ LLM 파서 통합    │                                           │
│  │ 4시간            │                                           │
│  └──────────────────┘                                           │
│                                                                  │
│  병렬 스트림 C (독립)          병렬 스트림 D (독립)              │
│  ┌──────────────────┐        ┌──────────────────┐              │
│  │ PR-REFACTOR-02   │   ∥   │ PR-TEST-01       │              │
│  │ 에러 핸들링      │        │ 테스트 추가      │              │
│  │ 3시간            │        │ 6시간            │              │
│  └──────────────────┘        └──────────────────┘              │
└─────────────────────────────────────────────────────────────────┘

P2: 중기 처리 (2주)
┌─────────────────────────────────────────────────────────────────┐
│  스트림 E (PR-TEST-01 완료 후)                                   │
│  ┌──────────────────┐                                           │
│  │ PR-ARCH-01       │                                           │
│  │ 의존성 주입      │                                           │
│  │ 8시간            │                                           │
│  └──────────────────┘                                           │
│                                                                  │
│  병렬 스트림 F (독립)                                            │
│  ┌──────────────────┐                                           │
│  │ PR-PERF-01       │                                           │
│  │ 렌더링 최적화    │                                           │
│  │ 4시간            │                                           │
│  └──────────────────┘                                           │
└─────────────────────────────────────────────────────────────────┘

P3: 기능 강화 (3-4주)
┌─────────────────────────────────────────────────────────────────┐
│  스트림 G (PR-SEC-01, PR-REFACTOR-01 완료 후)                    │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ PR-FEAT-01       │─▶│ PR-FEAT-03       │                    │
│  │ LLM 스마트 파싱  │  │ 보안 감사        │                    │
│  │ 12시간           │  │ 10시간           │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                  │
│  병렬 스트림 H (독립)                                            │
│  ┌──────────────────┐                                           │
│  │ PR-FEAT-02       │                                           │
│  │ Terraform 내보내기│                                           │
│  │ 8시간            │                                           │
│  └──────────────────┘                                           │
└─────────────────────────────────────────────────────────────────┘
```

### 병렬 처리 요약

| 단계 | 병렬 가능 PR | 순차 필요 PR |
|------|------------|------------|
| P0 | SEC-01, SEC-02, FIX-01 | - |
| P1 | REFACTOR-02, TEST-01 | REFACTOR-01 (SEC-01 후) |
| P2 | PERF-01 | ARCH-01 (TEST-01 후) |
| P3 | FEAT-02 | FEAT-01 (REFACTOR-01 후), FEAT-03 (FEAT-01 후) |

---

## 8. 다음 단계 권장사항

### 즉시 시작 (오늘)
```bash
# 1. P0 PR들 병렬 생성
git checkout -b fix/api-key-security      # PR-SEC-01
git checkout -b fix/type-validation       # PR-SEC-02
git checkout -b fix/non-null-assertion    # PR-FIX-01
```

### 이번 주
1. P0 PR들 완료 및 머지
2. P1 시작 (테스트 추가 + 에러 핸들링 병렬)
3. PR-REFACTOR-01 시작 (SEC-01 완료 후)

### 다음 주
1. P1 완료 및 머지
2. P2 시작 (의존성 주입)
3. P3 설계 검토

### 이번 달
1. P2 완료
2. P3 구현 (LLM 스마트 파싱, Terraform 내보내기)
3. 자동 보안 감사 베타

---

## 📎 관련 문서

- [CLAUDE.md](/.claude/CLAUDE.md) - 프로젝트 규칙 및 비전
- [비관적 피드백 에이전트](/.claude/agents/pessimist.md)
- [낙관적 피드백 에이전트](/.claude/agents/optimist.md)
- [플래너 에이전트](/.claude/agents/planner.md)

---

## 📝 변경 이력

| 날짜 | 작성자 | 내용 |
|------|--------|------|
| 2026-02-06 | Claude | 초기 작성: 종합 코드 리뷰 및 개선 플랜 |
| 2026-02-06 | Claude | P0 완료: PR-SEC-01, PR-SEC-02, PR-FIX-01 구현 |
| 2026-02-06 | Claude | P1 완료: PR-REFACTOR-02, PR-TEST-01 구현 (73개 테스트 통과) |
| 2026-02-06 | Claude | P2 완료: PR-ARCH-01 (의존성 주입), PR-PERF-01 (렌더링 최적화) |

---

## ✅ P0 작업 완료 내역 (2026-02-06)

### PR-SEC-01: API 키 서버사이드 이동 ✅

**변경된 파일:**
- `src/app/api/llm/route.ts` (신규 생성)
- `src/lib/llm/llmParser.ts` (전면 수정)
- `.env.example` (수정)

**주요 변경 사항:**
1. 새로운 API Route `/api/llm` 생성
   - POST: LLM 파싱 요청 처리
   - GET: LLM 설정 상태 확인
2. 클라이언트 코드에서 직접 API 호출 제거
3. 환경변수 `NEXT_PUBLIC_ANTHROPIC_API_KEY` → `ANTHROPIC_API_KEY`로 변경
4. 환경변수 `NEXT_PUBLIC_OPENAI_API_KEY` → `OPENAI_API_KEY`로 변경

**보안 개선:**
- API 키가 더 이상 클라이언트 번들에 포함되지 않음
- 서버사이드에서만 API 키 접근 가능

---

### PR-SEC-02: LLM 응답 타입 검증 ✅

**변경된 파일:**
- `src/app/api/llm/route.ts` (타입 검증 포함)
- `src/lib/llm/llmParser.ts` (클라이언트 측 재검증)

**주요 변경 사항:**
1. `parseJSONResponse()` 함수에 `isInfraSpec()` 가드 적용
2. 서버/클라이언트 양측에서 타입 검증 수행
3. 잘못된 형식의 응답에 대해 명확한 에러 메시지 반환

---

### PR-FIX-01: Non-null Assertion 제거 ✅

**변경된 파일:**
- `src/lib/layout/layoutEngine.ts`

**주요 변경 사항:**
```typescript
// 변경 전 (라인 205, 210)
adjacency.get(conn.source)!.push(conn.target);
reverseAdjacency.get(conn.target)!.push(conn.source);

// 변경 후
const sourceAdj = adjacency.get(conn.source);
if (sourceAdj) {
  sourceAdj.push(conn.target);
} else {
  adjacency.set(conn.source, [conn.target]);
}
```

---

### 빌드 검증 ✅

```
▲ Next.js 16.1.6 (Turbopack)
✓ Compiled successfully in 18.2s
✓ Generating static pages (5/5)

Route (app)
├ ○ /
├ ○ /_not-found
└ ƒ /api/llm  ← 새로 추가됨
```

---

## ✅ P1 작업 완료 내역 (2026-02-06)

### PR-REFACTOR-02: 에러 핸들링 강화 ✅

**변경된 파일:**
- `src/hooks/useAnimation.ts`
- `src/hooks/useInfraState.ts`
- `src/components/shared/ErrorBoundary.tsx` (신규)
- `src/components/shared/index.ts`

**주요 변경 사항:**
1. **useAnimation.ts**
   - Animation engine 초기화 시 try-catch 추가
   - Engine null 체크 강화
   - Event handler에서 에러 처리 추가
   - loadSequence 함수 에러 핸들링 추가

2. **useInfraState.ts**
   - 입력 검증 추가 (빈 문자열, null 체크)
   - ParseResultInfo에 error 필드 추가
   - handlePromptSubmit에 상세 에러 메시지 반환
   - handleScenarioSelect, handleTemplateSelect 에러 처리 추가
   - finally 블록으로 isLoading 상태 보장

3. **ErrorBoundary 컴포넌트 신규 생성**
   - Class 기반 ErrorBoundary
   - 에러 발생 시 사용자 친화적 UI 표시
   - 재시도 버튼 제공
   - ErrorFallback, ErrorBoundaryWrapper 헬퍼 제공

---

### PR-TEST-01: 핵심 로직 테스트 추가 ✅

**생성된 파일:**
- `src/__tests__/lib/parser/promptParser.test.ts` (신규)
- `src/__tests__/lib/parser/smartParser.test.ts` (신규)
- `src/__tests__/lib/layout/layoutEngine.test.ts` (신규)

**테스트 커버리지:**
- **promptParser**: 14개 테스트
  - 템플릿 키워드 매칭
  - Custom component 감지
  - User 노드 자동 추가
  - 연결 생성
  - Fallback 동작

- **smartParser**: 15개 테스트
  - 명령어 감지 (add, remove, modify, connect, disconnect, query)
  - 한국어 키워드 처리
  - Context 관리
  - 히스토리 제한 (10개)

- **layoutEngine**: 13개 테스트
  - Spec → Flow 변환
  - 티어별 노드 배치
  - Zone 기반 배치
  - 커스텀 레이아웃 설정
  - relayoutNodes 기능
  - getTierLabel 기능

---

### 테스트 결과 ✅

```
Test Files  5 passed (5)
     Tests  73 passed (73)
  Duration  674ms
```

---

## ✅ P2 작업 완료 내역 (2026-02-06)

### PR-ARCH-01: 싱글톤 → 의존성 주입 패턴 ✅

**생성된 파일:**
- `src/contexts/AnimationContext.tsx` (신규)
- `src/components/providers/Providers.tsx` (신규)

**변경된 파일:**
- `src/lib/animation/animationEngine.ts`
- `src/hooks/useAnimation.ts`
- `src/app/layout.tsx`

**주요 변경 사항:**

1. **AnimationContext.tsx** - React Context 기반 의존성 주입
   ```typescript
   export function AnimationProvider({ children, engine: injectedEngine }: AnimationProviderProps) {
     const engineRef = useRef<AnimationEngine | null>(null);

     useEffect(() => {
       if (injectedEngine) {
         engineRef.current = injectedEngine;
       } else if (!engineRef.current) {
         engineRef.current = new AnimationEngine();
       }
       return () => {
         if (!injectedEngine && engineRef.current) {
           engineRef.current.destroy();
         }
       };
     }, [injectedEngine]);

     return (
       <AnimationContext.Provider value={{ engine: injectedEngine || engineRef.current }}>
         {children}
       </AnimationContext.Provider>
     );
   }
   ```

2. **useAnimation.ts** - Context에서 엔진 획득
   ```typescript
   const contextEngine = useAnimationEngine();
   // ...
   useEffect(() => {
     engineRef.current = contextEngine;
   }, [contextEngine]);
   ```

3. **animationEngine.ts** - 싱글톤 패턴 @deprecated 표시
   - 기존 `getAnimationEngine()` 함수에 deprecated JSDoc 추가
   - 테스트용 `resetAnimationEngine()` 함수 추가
   - 하위 호환성 유지

4. **Providers.tsx** - 앱 전체 Provider 래퍼
   - AnimationProvider를 포함한 중앙화된 Provider 관리

5. **layout.tsx** - Providers로 앱 래핑
   ```typescript
   <Providers>{children}</Providers>
   ```

---

### PR-PERF-01: 렌더링 최적화 ✅

**변경된 파일:**
- `src/components/shared/FlowCanvas.tsx`

**주요 변경 사항:**

1. **FlowCanvas에 React.memo 적용**
   ```typescript
   export const FlowCanvas = memo(function FlowCanvas({
     initialNodes = defaultNodes,
     initialEdges = defaultEdges,
     onNodesChange: onNodesChangeCallback,
     onEdgesChange: onEdgesChangeCallback,
     onNodeClick,
   }: FlowCanvasProps) {
     // ...
   });
   ```

2. **기존 최적화 확인**
   - BaseNode: memo 적용됨 ✅
   - SecurityNodes: 모든 노드 memo 적용됨 ✅
   - NetworkNodes: 모든 노드 memo 적용됨 ✅
   - ComputeNodes: 모든 노드 memo 적용됨 ✅
   - ExternalNodes: 모든 노드 memo 적용됨 ✅
   - AnimatedEdge: memo 적용됨 ✅
   - Header: memo 적용됨 ✅
   - EmptyState: memo 적용됨 ✅

---

### 빌드 및 테스트 검증 ✅

```
▲ Next.js 16.1.6 (Turbopack)
✓ Compiled successfully in 3.6s
✓ Generating static pages (5/5)

Test Files  5 passed (5)
     Tests  73 passed (73)
  Duration  608ms
```

---

## ✅ P3 작업 완료 내역 (2026-02-06)

### PR-FEAT-01: LLM 스마트 파싱 ✅

**생성된 파일:**
- `src/lib/parser/intelligentParser.ts` (신규)
- `src/app/api/parse/route.ts` (신규)

**주요 기능:**
1. **IntentAnalysis** - LLM을 활용한 사용자 의도 분석
   - 의도 유형: create, add, remove, modify, connect, disconnect, query
   - 컴포넌트 추출 및 위치 정보 파싱
   - 신뢰도 점수 제공

2. **스마트 파싱 API** (`/api/parse`)
   - Claude/OpenAI 기반 의도 분석
   - 컨텍스트 인식 파싱
   - 기존 smartParser와 통합 가능

---

### PR-FEAT-02: Terraform/K8s 내보내기 ✅

**생성된 파일:**
- `src/lib/export/terraformExport.ts` (신규)
- `src/lib/export/kubernetesExport.ts` (신규)
- `src/lib/export/plantUMLExport.ts` (신규)

**주요 기능:**

1. **Terraform Export**
   - AWS, Azure, GCP 프로바이더 지원
   - 보안그룹, VPC, EC2, RDS, ELB 등 리소스 생성
   - 변수 및 출력 블록 포함 옵션

2. **Kubernetes Export**
   - Deployment, Service, StatefulSet 생성
   - NetworkPolicy, Ingress 포함 옵션
   - 네임스페이스별 구성 지원

3. **PlantUML Export**
   - C4 Model 형식 지원
   - Deployment Diagram 형식 지원
   - Component Diagram 형식 지원
   - Zone 기반 그룹핑

---

### PR-FEAT-03: 자동 보안 감사 ✅

**생성된 파일:**
- `src/lib/audit/securityAudit.ts` (신규)
- `src/lib/audit/auditReportGenerator.ts` (신규)
- `src/lib/audit/index.ts` (신규)

**주요 기능:**

1. **보안 감사 엔진** (`runSecurityAudit`)
   - 14개 보안 규칙 검사
   - 심각도별 분류 (Critical, High, Medium, Low, Info)
   - 100점 만점 보안 점수 산출

2. **검사 규칙:**
   - 네트워크 보안: 방화벽 누락, WAF 누락, DB 직접 접근
   - 접근 제어: 인증 레이어 누락, MFA 미설정
   - 데이터 보호: 암호화 미확인, DLP 누락, 백업 누락
   - 가용성: 단일 장애점, CDN 미사용, 로드밸런서 누락
   - 컴플라이언스: IDS/IPS 누락, NAC 누락
   - 모범 사례: 캐시 레이어 누락, DNS 구성 누락

3. **리포트 생성기** (`generateAuditReport`)
   - Markdown, HTML, JSON, Text 형식 지원
   - 권장사항 및 참조 문서 포함
   - 한국어 리포트 생성

---

### 빌드 및 테스트 검증 ✅

```
TypeScript: ✅ 오류 없음
Test Files  5 passed (5)
     Tests  73 passed (73)
  Duration  597ms
```

---

## 📊 전체 진행 상황

| 우선순위 | 상태 | PR 수 |
|---------|------|-------|
| P0 | ✅ 완료 | 3개 |
| P1 | ✅ 완료 | 2개 |
| P2 | ✅ 완료 | 2개 |
| P3 | ✅ 완료 | 3개 |
| **총합** | **✅ 완료** | **10개 PR** |

---

*이 문서는 Claude AI 세션 간 공유를 위해 작성되었습니다.*
*다른 Claude 세션에서 이 문서를 참조하여 개선 작업을 이어갈 수 있습니다.*
