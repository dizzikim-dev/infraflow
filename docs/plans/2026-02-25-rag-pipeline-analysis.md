# RAG 파이프라인 전체 분석 — 동작 흐름, 관제 가능성, 관측성 갭

> 분석일: 2026-02-25

---

## 1. 전체 데이터 흐름 (Query → LLM Response)

```
사용자 프롬프트 입력
  │
  ▼
POST /api/llm  (src/app/api/llm/route.ts)
  │ Rate Limit → CSRF → Input Validation
  │
  ▼
buildEnrichedSystemPrompt(prompt)
  │
  ├─① extractNodeTypesFromPrompt() → 키워드/에일리어스에서 노드 타입 추출
  │
  ├─② searchProductIntelligence(prompt, { topK: 10, enableLiveAugment: true })
  │     │
  │     ├─ A) ChromaDB 벡터 검색 (사용 가능 시)
  │     │     → generateEmbedding(query) → 5개 컬렉션 순회 검색
  │     │     → score = 1 / (1 + distance), threshold 필터
  │     │
  │     ├─ B) 키워드 폴백 (ChromaDB 불가 시)
  │     │     → 제품명 키워드 매칭
  │     │
  │     └─ C) Live Augment 판정 ← ⚠️ 핵심 결정 지점
  │           maxScore < 0.5 → 트리거!
  │           → extractProductNames(query)
  │           → PRODUCT_GITHUB_URLS 매핑 (12개 제품)
  │           → fetchGitHubReadme() or fetchUrl() (2.5s 타임아웃)
  │           → indexExternalContent() → ChromaDB 저장
  │           → 재검색 (새로 인덱싱된 콘텐츠 포함)
  │
  ├─③ enrichContext(context, RELATIONSHIPS, { antiPatterns, failureScenarios })
  │     → 관계, 제안, 충돌, 리스크 계산
  │     → FIFO 메모이제이션 캐시 (50 entries)
  │
  ├─④ buildKnowledgePromptSection(enriched)
  │     → 마크다운 형식 시스템 프롬프트 섹션 생성
  │
  └─⑤ SYSTEM_PROMPT + 지식 섹션 결합
        │
        ▼
LLM API 호출 (Claude / OpenAI)
  │ 최대 3회 재시도, exponential backoff
  │
  ▼
응답 파싱 → InfraSpec 반환
```

---

## 2. 각 모듈별 현재 로깅/관측 상태

### 2.1 RAG Retriever (`src/lib/rag/retriever.ts`)

| 항목 | 로깅 여부 | 상세 |
|------|-----------|------|
| 벡터 검색 결과 수 | ✅ `log.debug` | count만, 개별 score 미노출 |
| 개별 문서 점수 | ❌ | `doc.score` 존재하지만 로깅 안 됨 |
| 컬렉션별 히트 수 | ❌ | 5개 컬렉션 순회하지만 미집계 |
| maxScore 값 | ❌ | Live Augment 트리거 결정값이지만 미기록 |
| 키워드 폴백 전환 | ❌ | 벡터→키워드 전환이 silent |
| 쿼리 임베딩 | ❌ | 생성 후 폐기 |

### 2.2 Live Augmenter (`src/lib/rag/fetcher/liveAugmenter.ts`)

| 항목 | 로깅 여부 | 상세 |
|------|-----------|------|
| 시도 여부 | ✅ `log.debug` | product, githubUrl |
| 성공/실패 | ✅ `log.debug` | query, documentsIndexed / error |
| 소요 시간 | ✅ 반환값 | `durationMs` in `LiveAugmentResult` |
| **route.ts에서 결과 로깅** | ❌ | `augmentResult` 반환되지만 로깅 안 됨 |

### 2.3 LLM Route (`src/app/api/llm/route.ts`)

| 항목 | 로깅 여부 | 상세 |
|------|-----------|------|
| PI 문서 수 | ✅ `log.debug` | count만 |
| 지식 섹션 길이 | ✅ `log.debug` | sectionLength |
| 재시도 | ✅ `log.warn` | 시도 번호, 에러 |
| **RAG 개별 점수** | ❌ | 미노출 |
| **Live Augment 결과** | ❌ | 미노출 |
| **Enrichment 필터링** | ❌ | 포함/제외 항목 미노출 |2
| **최종 프롬프트** | ❌ | 보안상 미기록 (길이만) |

### 2.4 Context Enricher (`src/lib/knowledge/`)

| 항목 | 로깅 여부 | 상세 |
|------|-----------|------|
| 캐시 히트/미스 | ❌ | silent |
| 신뢰도 필터링 결과 | ❌ | `confidence >= 0.5` 필터링 silent |
| 선택된 관계/제안/충돌 | ❌ | 최종 문자열만 전달 |

### 2.5 Admin RAG Dashboard (신규)

| 항목 | 상태 | 상세 |
|------|------|------|
| ChromaDB 연결 상태 | ✅ | health API |
| 컬렉션별 문서 수 | ✅ | health API |
| 크롤/인덱싱 실행 | ✅ | crawl/index API |
| 외부 콘텐츠 조회/삭제 | ✅ | external-content API |
| **쿼리 검색 테스트** | ❌ | 없음 |
| **검색 결과 점수 확인** | ❌ | 없음 |
| **추론 감사 로그** | ❌ | 없음 |

---

## 3. 핵심 결정 지점의 관측 불가 영역

### 결정 1: 벡터 검색 vs 키워드 폴백

```typescript
// retriever.ts — ChromaDB 실패 시 silent 폴백
let result = await vectorSearch(...);  // 성공/실패 결정이 로깅 안 됨
if (!result) {
  result = keywordFallback(...);       // 어떤 경로 탔는지 알 수 없음
}
```

**영향**: 관리자가 특정 쿼리가 벡터 검색을 탔는지, 키워드 폴백을 탔는지 확인 불가.

### 결정 2: Live Augment 트리거 임계값

```typescript
// retriever.ts
const maxScore = Math.max(...scores);  // ← 이 값이 로깅 안 됨!
if (maxScore < 0.5) {                  // 0.5가 FETCH_CACHE_CONFIG.confidenceThreshold
  const augmentResult = await liveAugment(query);  // 결과도 route.ts에서 미로깅
}
```

**영향**: "왜 이 쿼리에서 Live Augment가 트리거되었는가?"를 사후 분석 불가.

### 결정 3: Enrichment 신뢰도 필터

```typescript
// contextEnricher.ts
const filtered = allEntries.filter((e) => e.trust.confidence >= minConfidence);
// 얼마나 많은 항목이 제외되었는지 로깅 안 됨
```

**영향**: 지식 주입 품질 판단 불가 — 좋은 관계가 누락되는지 확인할 수 없음.

### 결정 4: Enrichment 캐시

```typescript
// contextEnricher.ts
const cached = enrichmentCache.get(key);  // silent 히트/미스
```

**영향**: 캐시 효율성 측정 불가.

---

## 4. 데이터 손실 지점 요약

| 데이터 | 생성 위치 | 소실 위치 | 영향 |
|--------|-----------|-----------|------|
| 쿼리 임베딩 벡터 | embeddings.ts | search 후 폐기 | 임베딩 품질 검증 불가 |
| 개별 문서 점수 | retriever.ts vectorSearch | route.ts에서 count만 기록 | 임계값 튜닝 불가 |
| 컬렉션별 히트 수 | retriever.ts 컬렉션 루프 | 미집계 | 컬렉션 최적화 불가 |
| maxScore 트리거 값 | retriever.ts | 미로깅 | Live Augment 디버깅 불가 |
| LiveAugmentResult | liveAugmenter.ts → retriever.ts | route.ts에서 미로깅 | 성공률 추적 불가 |
| 필터링 결정 (포함/제외) | contextEnricher.ts | 미로깅 | 지식 주입 품질 감사 불가 |
| 캐시 히트/미스 | contextEnricher.ts | silent | 캐시 효율 측정 불가 |
| 최종 시스템 프롬프트 | route.ts | 길이만 기록 | 프롬프트 품질 디버깅 불가 |

---

## 5. 현재 관제 가능 vs 불가능

### ✅ 관제 가능 (Admin Dashboard + 로그)

1. ChromaDB 연결 상태 (online/offline)
2. 컬렉션별 문서 수 (5개 컬렉션)
3. 외부 콘텐츠 인덱싱 이력 (제목, URL, 크기, 날짜, 태그)
4. 크롤/인덱싱 실행 및 결과
5. 시스템 설정값 (TTL, threshold, timeout 등)
6. LLM 재시도 횟수 (로그)

### ❌ 관제 불가 (Blind Spots)

1. **실시간 검색 과정** — 어떤 문서가 검색되어 어떤 점수를 받았는지
2. **Live Augment 결정 과정** — maxScore 값, 트리거 여부, 결과
3. **지식 주입 내역** — 어떤 관계/패턴/안티패턴이 LLM에 전달되었는지
4. **벡터 vs 키워드 경로** — 어떤 폴백 경로를 탔는지
5. **쿼리별 감사 이력** — 사용자 쿼리 → RAG 결과 → LLM 출력 연결
6. **임계값 경계 케이스** — 0.49 vs 0.51 같은 borderline 결정

---

## 6. 아키텍처 갭 시각화

```
                  ┌────────────────────────────────────┐
                  │     Admin RAG Dashboard (현재)       │
                  │                                     │
                  │  ✅ Health    ✅ Crawl    ✅ Index   │
                  │  ✅ Content   ✅ Config              │
                  │                                     │
                  │  ❌ Search Test    ❌ Score View     │
                  │  ❌ Augment Log    ❌ Enrichment    │
                  │  ❌ Query Audit    ❌ Prompt Debug   │
                  └────────────────────────────────────┘
                                    │
                          (인덱스 관리만 연결)
                                    │
  사용자 쿼리 ──→ POST /api/llm ──→ RAG Pipeline ──→ LLM ──→ 응답
                        │              │
                        │    ┌─────────┴──────────────────┐
                        │    │ 벡터검색 → 스코어 → 필터링   │ ← 관측 불가
                        │    │ Live Augment 결정 → 실행     │ ← 관측 불가
                        │    │ 지식 주입 → 프롬프트 생성     │ ← 관측 불가
                        │    └────────────────────────────┘
                        │
                        └──→ 응답에 RAG 메타데이터 없음 ← 핵심 문제
```

---

## 7. 개선 권고

### Phase 1: Quick Win (로깅 강화, 비파괴적)

1. **retriever.ts에 maxScore 로깅 추가**
2. **route.ts에 LiveAugmentResult 로깅 추가**
3. **contextEnricher.ts에 필터링 통계 로깅 추가**
4. **LLM 응답에 `ragDebug` 선택적 필드 추가**

### Phase 2: Admin 쿼리 디버그 (새 API)

1. `GET /api/admin/rag/search?q=...` — RAG 검색 테스트 엔드포인트
2. 검색 결과에 점수, 컬렉션, 메타데이터 전체 노출
3. Admin UI에 "쿼리 테스트" 섹션 추가

### Phase 3: 추론 체인 추적 (Reasoning Chain)

1. 쿼리별 추론 감사 로그 (IndexedDB 또는 Redis)
2. 쿼리 → RAG 결과 → Enrichment → LLM 프롬프트 → 응답 연결
3. Admin "쿼리 이력" 대시보드
4. 다단계 검색 (Multi-hop retrieval) 지원
