# Multi-User DB Schema Design

> InfraFlow 다수 유저 운영을 위한 종합 DB 설계

## 1. 현재 상태 (As-Is)

### DB에 저장되는 데이터 (PostgreSQL + Prisma)

| 테이블 | 데이터 | 비고 |
|--------|--------|------|
| `users` | id, name, email, passwordHash, role, image | NextAuth.js 기본 |
| `accounts` | OAuth 연결 (Google, GitHub) | |
| `sessions` | JWT 세션 토큰 | |
| `diagrams` | spec(JSONB), nodesJson, edgesJson, title, thumbnail, isPublic | 유저별 |
| `diagram_versions` | spec, message (최대 10개) | |
| Knowledge 테이블 ×11 | 관계, 패턴, 안티패턴, 장애, 성능, 취약점, 클라우드, 벤치마크, 산업프리셋, 출처, 미인식쿼리 | 공용 |
| `infra_components` | 컴포넌트 카탈로그 + 정책 | 공용 |

### 클라이언트에만 있는 데이터 (IndexedDB / localStorage)

| 저장소 | 키/Store | 데이터 | 문제점 |
|--------|----------|--------|--------|
| IndexedDB | `feedback-records` | 유저 피드백 (rating, spec diff, 패턴) | 서버에 안 남음, 최대 1,000건 |
| IndexedDB | `usage-events` | 파싱/LLM 사용 이력 (prompt, 성공여부, 신뢰도) | 서버에 안 남음, 최대 2,000건 |
| IndexedDB | `antipattern-interactions` | 안티패턴 대응 이력 (shown/ignored/fixed) | 서버에 안 남음 |
| localStorage | `infraflow-templates` | 커스텀 템플릿 (spec 포함) | 기기 바꾸면 사라짐 |
| localStorage | `infraflow-local-history` | 다이어그램 세션 히스토리 | 비로그인용, 제거 예정 |
| localStorage | `infraflow-sidebar-open` | 사이드바 상태 | UI 상태, 서버 불필요 |
| localStorage | `infraflow-theme` | 테마 설정 | 서버 동기화 시 편리 |

---

## 2. 추가 필요 테이블 (To-Be)

### 2-1. 유저 프로필 확장

현재 `users` 테이블에 필드 추가:

```prisma
model User {
  // 기존 필드 유지...

  // 추가 필드
  plan          UserPlan  @default(FREE)    // 요금제
  diagramLimit  Int       @default(10)      // 다이어그램 수 제한
  llmCallsToday Int      @default(0)       // 오늘 LLM 호출 횟수
  llmCallsReset DateTime?                   // 호출 횟수 리셋 시각
  preferences   Json?                       // 테마, 언어 등 설정
  lastActiveAt  DateTime?                   // 마지막 활동 시각

  // 새 관계
  templates    UserTemplate[]
  usageEvents  UsageEvent[]
  feedbacks    FeedbackRecord[]
}

enum UserPlan {
  FREE        // 무료: 다이어그램 10개, LLM 20회/일
  PRO         // 프로: 다이어그램 100개, LLM 200회/일
  ENTERPRISE  // 엔터프라이즈: 무제한
}
```

### 2-2. 사용 이력 (Usage Events)

프롬프트 히스토리 + 파싱/LLM 이용 로그:

```prisma
model UsageEvent {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  eventType  UsageEventType  // parse | llm_modify | template | export
  prompt     String?  @db.Text
  success    Boolean
  confidence Float?           // 파서 신뢰도 0.0-1.0
  nodeTypes  String[]         // 사용된 컴포넌트 유형
  patternIds String[]         // 감지된 패턴
  diagramId  String?          // 관련 다이어그램 (nullable)
  metadata   Json?            // 추가 정보 (모델명, 응답시간 등)
  sessionId  String           // 프론트엔드 세션 ID

  createdAt  DateTime @default(now())

  @@index([userId])
  @@index([eventType])
  @@index([createdAt])
  @@map("usage_events")
}

enum UsageEventType {
  parse
  llm_modify
  template
  export
}
```

### 2-3. 유저 피드백

다이어그램 품질 평가 + 학습 데이터:

```prisma
model FeedbackRecord {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  diagramId  String?
  prompt     String?  @db.Text
  rating     Int?     // 1-5 별점
  specDiff   Json?    // { nodesAdded, nodesRemoved, nodesModified, ... }
  patternsDetected    String[]
  antiPatternsDetected String[]
  antiPatternsIgnored  String[]
  antiPatternsFixed    String[]
  sessionId  String

  createdAt  DateTime @default(now())

  @@index([userId])
  @@index([rating])
  @@index([createdAt])
  @@map("feedback_records")
}
```

### 2-4. 안티패턴 캘리브레이션

유저별 안티패턴 민감도 조정:

```prisma
model AntiPatternInteraction {
  id             String   @id @default(cuid())
  userId         String
  antiPatternId  String   // AP-SEC-001 등
  action         AntiPatternAction  // shown | ignored | fixed
  sessionId      String

  createdAt      DateTime @default(now())

  @@index([userId])
  @@index([antiPatternId])
  @@index([createdAt])
  @@map("antipattern_interactions")
}

enum AntiPatternAction {
  shown
  ignored
  fixed
}
```

### 2-5. 커스텀 템플릿

유저가 저장한 템플릿 (현재 localStorage):

```prisma
model UserTemplate {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  name        String
  description String?  @db.Text
  category    String   // web | security | cloud | network | container | telecom | custom
  icon        String   @default("📋")
  spec        Json     // InfraSpec
  tags        String[]
  isPublic    Boolean  @default(false)  // 공개 템플릿 여부

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([category])
  @@index([isPublic])
  @@map("user_templates")
}
```

### 2-6. LLM 사용량 추적

일별 API 호출 관리:

```prisma
model LlmUsage {
  id         String   @id @default(cuid())
  userId     String
  date       String   // YYYY-MM-DD 형식
  callCount  Int      @default(0)
  tokenCount Int      @default(0)  // 총 토큰 사용량

  @@unique([userId, date])
  @@index([userId])
  @@map("llm_usage")
}
```

---

## 3. 유저별 제한 (Rate Limiting & Quotas)

| 플랜 | 다이어그램 | LLM 호출/일 | 커스텀 템플릿 | 버전 히스토리 |
|------|----------|-------------|-------------|-------------|
| FREE | 10개 | 20회 | 5개 | 최근 3개 |
| PRO | 100개 | 200회 | 50개 | 최근 10개 |
| ENTERPRISE | 무제한 | 무제한 | 무제한 | 무제한 |

### 적용 위치

| 체크포인트 | 위치 | 방법 |
|-----------|------|------|
| 다이어그램 생성 | `POST /api/diagrams` | `diagrams.count(userId)` vs `user.diagramLimit` |
| LLM 호출 | `POST /api/llm/route.ts` | `llm_usage` 테이블 조회 |
| 템플릿 저장 | `POST /api/templates` | `user_templates.count(userId)` vs 플랜 제한 |

---

## 4. 관리자 대시보드 데이터

기존 `/admin` 라우트에 추가할 페이지:

| 페이지 | 데이터 소스 | 표시 내용 |
|--------|-----------|----------|
| `/admin/users` | `users` + `diagrams` count | 전체 유저 목록, 플랜, 다이어그램 수, 마지막 활동 |
| `/admin/analytics` | `usage_events` | 일별 사용량, 인기 프롬프트, 성공률, 활성 유저 |
| `/admin/feedback` | `feedback_records` | 평균 별점, 자주 수정되는 패턴, 개선 포인트 |
| `/admin/llm-usage` | `llm_usage` | 일별/유저별 LLM 사용량, 비용 추정 |

---

## 5. 마이그레이션 전략

### Phase A: 스키마 추가 (DB만)
1. Prisma 스키마에 새 테이블 추가
2. `npx prisma migrate dev` 실행
3. User 모델에 `plan`, `preferences`, `lastActiveAt` 필드 추가

### Phase B: API 라우트 추가
1. `POST /api/usage-events` — 사용 이벤트 기록
2. `POST /api/feedback` — 피드백 제출
3. `GET/POST /api/templates` — 커스텀 템플릿 CRUD
4. `GET /api/llm-usage` — 사용량 조회
5. 기존 LLM route에 사용량 체크 미들웨어 추가

### Phase C: 클라이언트 마이그레이션
1. IndexedDB 어댑터에 "서버 업로드" 옵션 추가
2. 로그인 시 IndexedDB → API로 일괄 전송
3. 이후 직접 API로 기록 (IndexedDB는 오프라인 버퍼로만 사용)

### Phase D: 관리자 대시보드
1. `/admin/users` 페이지 추가
2. `/admin/analytics` 페이지 추가
3. 기존 admin 레이아웃에 네비게이션 추가

---

## 6. 전체 ERD (요약)

```
User ─┬─ Diagram ──── DiagramVersion
      ├─ UserTemplate
      ├─ UsageEvent
      ├─ FeedbackRecord
      ├─ AntiPatternInteraction
      ├─ LlmUsage
      └─ Account/Session (NextAuth)

Knowledge (공용, 유저 무관)
  ├─ KnowledgeRelationship
  ├─ KnowledgePattern
  ├─ KnowledgeAntiPattern
  ├─ KnowledgeFailure
  ├─ KnowledgePerformance
  ├─ KnowledgeVulnerability
  ├─ KnowledgeCloudService
  ├─ KnowledgeBenchmark
  ├─ KnowledgeIndustryPreset
  └─ KnowledgeSourceEntry
```

---

## 7. 보안 고려사항

| 항목 | 방안 |
|------|------|
| 프롬프트 로깅 | `usage_events.prompt`에 민감정보 마스킹 필요 (API key 패턴 제거) |
| 스펙 저장 | `diagrams.spec`에 IP/비밀번호 포함 가능 → 경고 표시 |
| GDPR 삭제 | User 삭제 시 CASCADE로 모든 관련 데이터 삭제 |
| 접근 제어 | 모든 API에서 `userId === session.user.id` 확인 |
| 관리자 접근 | `role === ADMIN`만 `/admin/*` 및 전체 데이터 조회 가능 |
| 사용량 조작 | `llm_usage` 업데이트는 서버 사이드에서만 (클라이언트 불가) |
