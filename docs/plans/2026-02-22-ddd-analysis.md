# InfraFlow DDD (Domain-Driven Design) 적용 현황 분석

> 분석일: 2026-02-22
> 기준 문서: `docs/context/context_DDD` (AI 코딩에서 DDD가 중요한 이유)

---

## 분석 배경

DDD 핵심 4원칙:
1. **정해진 틀** — AI가 틀을 복사하여 일관된 코드 생성
2. **도메인 단위 분리** — AI가 필요한 도메인만 집중
3. **언어 일치** — 코드 이름 = 비즈니스 언어 → AI 환각 감소
4. **도메인 트리거** — 훅 시스템으로 AI가 관련 코드를 자동 파악

---

## 1. 정해진 틀 (Consistent Patterns) — 9/10

### 도메인 모듈 패턴

모든 도메인 모듈이 동일한 파일 구조를 따름:

```
src/lib/[domain]/
  ├── types.ts       ← 도메인 엔티티 정의
  ├── [feature].ts   ← 비즈니스 로직 (순수 함수)
  ├── index.ts       ← 공개 API (큐레이션된 exports)
  └── __tests__/     ← 테스트 (소스와 동일 위치)
```

적용 도메인: knowledge, consulting, recommendation, export, audit, cost, comparison, activity (8+)

### UI 컴포넌트 패턴

- **PanelContainer + PanelHeader + PanelTabs**: 모든 패널 공유 패턴
- **useXxx 훅**: 비즈니스 로직은 커스텀 훅에, UI는 컴포넌트에 분리

### Export 패턴

```typescript
// 모든 도메인 index.ts가 동일한 패턴:
export type { CoreTypes... } from './types';
export { CONSTANTS } from './types';
export { publicFunction } from './feature';
```

### AI 복제 가이드

새 도메인 X 추가 시:
1. `src/lib/X/types.ts` — 도메인 엔티티 정의
2. `src/lib/X/[featureA].ts` — 비즈니스 로직
3. `src/lib/X/index.ts` — 공개 API (~15개 이하)
4. `src/lib/X/__tests__/[feature].test.ts` — 테스트

---

## 2. 도메인 단위 분리 (Domain Separation) — 9/10

### 3-Layer 아키텍처

| Layer | 도메인 | 파일 수 | 핵심 모듈 |
|-------|--------|---------|----------|
| L1: VISUALIZE | parser, layout, animation, components | 65+ | UnifiedParser, FlowCanvas |
| L2: UNDERSTAND | knowledge (relationships, patterns, antipatterns) | 40+ | Knowledge Graph, enrichContext |
| L3: RECOMMEND | recommendation, consulting | 25+ | matcher/scorer, gapAnalyzer |

### 도메인별 책임 범위

| 도메인 | 파일 수 | 책임 | 공개 API 수 |
|--------|---------|------|------------|
| `lib/knowledge/` | 40 | 온톨로지: 관계, 패턴, 안티패턴, 실패, 벤더/클라우드 카탈로그 | 50+ |
| `lib/consulting/` | 9 | 요구사항 → 패턴 매칭 → 갭 분석 → 비용 비교 | 12 |
| `lib/recommendation/` | 10 | 벤더 & 클라우드 서비스 매칭/스코어링 | 8 |
| `lib/parser/` | 20 | NLP 프롬프트 파싱 → InfraSpec | 15 |
| `lib/export/` | 7 | Spec → Terraform/K8s/PlantUML/PDF | 5 |
| `lib/audit/` | 5 | 컴플라이언스 & 보안 감사 | 4 |
| `lib/cost/` | 6 | 비용 추정 & 비교 | 6 |

### 의존성 방향 (단방향)

```
Parser (L1)
  ↓
Data (infrastructureDB.ts, templates.ts)
  ↓
Knowledge (L2) + Recommendation (L3)
  ↓
Types (src/types/infra.ts) ← Single Source of Truth

순환 참조: 없음
```

### Cross-domain Import 패턴

```typescript
// consulting/gapAnalyzer.ts → knowledge에서 타입만 가져옴
import type { ArchitecturePattern } from '@/lib/knowledge/types';
import { findMissingCompanions } from '@/lib/knowledge/companionResolver';
import { getCategoryForType } from '@/lib/data/infrastructureDB';

// 금지 패턴 (사용하지 않음):
// import * from '@/lib/knowledge'
// import { A, B, C, D, E, ... } from '@/lib/knowledge'
```

---

## 3. 언어 일치 (Ubiquitous Language) — 8/10

### 비즈니스 개념 → 코드 이름 매핑

| 비즈니스 개념 | 코드 이름 | 파일 위치 |
|-------------|----------|----------|
| 인프라 컴포넌트 타입 | `InfraNodeType` | `src/types/infra.ts` |
| 아키텍처 패턴 | `ArchitecturePattern` | `src/lib/knowledge/types.ts` |
| 벤더 제품 | `ProductNode` | `src/lib/knowledge/vendorCatalog/types.ts` |
| 인프라 갭 | `GapItem` | `src/lib/consulting/types.ts` |
| 제품 추천 | `ProductRecommendation` | `src/lib/recommendation/types.ts` |
| 컴플라이언스 위반 | `ComplianceGap` | `src/lib/knowledge/types.ts` |
| 클라우드 서비스 | `CloudService` | `src/lib/knowledge/cloudCatalog/types.ts` |
| 비교 항목 | `ComparisonItem` | `src/lib/comparison/types.ts` |

### 함수명 = 비즈니스 워크플로우

```typescript
// Knowledge Graph 조작
getRelationshipsForComponent()    // 컴포넌트의 관계 조회
detectPatterns()                  // 패턴 탐지
getMandatoryDependencies()        // 필수 의존성 확인

// Consulting 워크플로우
matchRequirementsToPatterns()     // 요구사항 → 패턴 매칭
analyzeGaps()                     // 갭 분석
compareVendorCosts()              // 벤더 비용 비교

// Recommendation 엔진
matchVendorProducts()             // 벤더 제품 매칭
scoreProduct()                    // 제품 점수 산정
matchCloudServices()              // 클라우드 서비스 매칭
```

### 이중언어 패턴 (일관 적용)

```typescript
// 30+ 엔티티에서 field + fieldKo 패턴
interface ArchitecturePattern {
  name: string;           // English
  nameKo: string;         // Korean
  description: string;
  descriptionKo: string;
  reason: string;
  reasonKo: string;
}
```

### 약간의 불일치 (개선 가능)

| 현재 | 개선안 | 이유 |
|------|--------|------|
| `useLocalParser()` vs `usePromptParser()` | 통일 필요 | 둘 다 프롬프트 파싱, 스코프만 다름 |
| `useComparisonMode()` vs `useComparison()` | 통일 필요 | 비교 기능의 네이밍 드리프트 |
| `VendorMatchScore` + deprecated `MatchScore` | `MatchScore` 제거 | 레거시 별칭 불필요 |

---

## 4. 도메인 트리거 (Domain Triggers) — 10/10

### 도메인별 규칙 파일 (`.claude/rules/`)

| 규칙 파일 | 도메인 | 규칙 수 | 역할 |
|----------|--------|---------|------|
| `knowledge-rules.md` | 지식 그래프 | KG-001~008 | 온톨로지 무결성, 패턴 품질 |
| `recommendation-rules.md` | 추천 | REC-001~007 | 스코어링, 벤더 공정성 |
| `vendor-catalog-rules.md` | 벤더 카탈로그 | VC-001~013 | 데이터 완결성, 비교 필드 |
| `cloud-catalog-rules.md` | 클라우드 카탈로그 | CC-001~010 | 서비스 아키텍처 필드 |
| `infra-data-rules.md` | 인프라 데이터 | INFRA-DATA-001~010 | 4파일 동기화 필수 |
| `api-rules.md` | API 라우트 | - | CSRF, 레이트 리미팅 |
| `design-system-rules.md` | UI/컴포넌트 | - | 컬러 토큰, 버튼 스타일 |
| `tdd-rules.md` | 테스트 | - | RED-GREEN-REFACTOR |

### 도메인별 전용 에이전트 (`.claude/agents/`)

| 에이전트 | 도메인 | 트리거 조건 | 출력 |
|---------|--------|-----------|------|
| `infra-data-agent.md` | 인프라 데이터 | 컴포넌트 추가/수정 시 | 4파일 동기화 체크리스트 |
| `vendor-catalog-crawler.md` | 벤더 카탈로그 | 제품 데이터 수집 시 | 아키텍처 중심 필드 추출 |
| `cloud-catalog-crawler.md` | 클라우드 카탈로그 | 클라우드 서비스 크롤링 시 | 서비스 스펙 구조화 |
| `security.md` | 보안 감사 | 컴플라이언스 분석 시 | 위협 매트릭스 + 대응 방안 |
| `design-agent.md` | 디자인 시스템 | UI 구현 시 | 컴포넌트 감사 보고서 |

### YAML 기반 도메인 경로 매핑

```yaml
# .claude/rules/recommendation-rules.md
---
paths:
  - "src/lib/knowledge/**/*.ts"
  - "src/lib/recommendation/**/*.ts"
---
```

AI가 recommendation 관련 파일을 수정할 때, 해당 규칙이 자동으로 컨텍스트에 로드됨.

### 에이전트 출력 규칙

```
모든 에이전트 작업 결과는 반드시 docs/plans/YYYY-MM-DD-<topic>.md에 기록
→ 구두 보고만으로는 불충분
```

---

## 5. Anti-Pattern 분석 — 없음

| 안티패턴 | 상태 | 근거 |
|---------|------|------|
| Utils 덤프 파일 | 없음 | `lib/utils/` 내 7개 파일 각각 단일 책임 |
| God Object | 없음 | 최대 파일이 ~40KB (정당한 복잡성: Terraform/K8s 코드 생성) |
| 순환 참조 | 없음 | 모든 의존성이 단방향 |
| 네임스페이스 누수 | 없음 | knowledge→recommendation만 존재 (역방향 없음) |
| 범용 헬퍼 남용 | 없음 | `helpers.ts` 같은 파일 부재 |

---

## 종합 평가

| 원칙 | 점수 | 핵심 근거 |
|------|------|----------|
| 정해진 틀 | **9/10** | 8+ 도메인이 types→impl→index→tests 동일 패턴 |
| 도메인 분리 | **9/10** | 3-Layer 분리, 순환 참조 없음, 단방향 의존 |
| 언어 일치 | **8/10** | 비즈니스 용어=코드 이름, 이중언어 일관 적용 |
| 도메인 트리거 | **10/10** | 8개 규칙 파일 + 5개 전용 에이전트 |
| **전체** | **9/10** | Enterprise-grade DDD, AI 친화적 구조 |

---

## 개선 제안

### 단기 (Minor)
1. 훅 이름 통일: `useLocalParser` / `usePromptParser` → 명확한 스코프 네이밍
2. 레거시 별칭 제거: deprecated `MatchScore` → `VendorMatchScore`만 유지
3. Parser 도메인 공개 API 정리: 현재 64개 exports → ~15개로 축소

### 중기
4. 벤더 카탈로그 도메인 분리: `knowledge/vendorCatalog/` → 독립 `src/lib/vendor/`로 승격 검토
5. 클라우드 카탈로그 동일 적용: `knowledge/cloudCatalog/` → 독립 `src/lib/cloud/`로 승격 검토
6. 각 도메인별 `README.md` 추가 — AI가 도메인 진입 시 첫 번째로 읽는 파일

### 장기
7. Bounded Context Map 문서화 — 도메인 간 관계를 시각적으로 정리
8. Domain Event 패턴 도입 — 도메인 간 느슨한 결합 강화
