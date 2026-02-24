# Product Intelligence & RAG 추론 강화 설계문서

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** InfraFlow에 RAG 기반 Product Intelligence 시스템을 구축하여, 복합적인 자연어 질문(예: "OpenClaw를 데스크탑/모바일에 설치하고 Slack 연동, 클라우드 스케일업 추천")에 대해 정확한 인프라 다이어그램을 생성할 수 있도록 LLM 추론을 강화한다.

**Architecture:** ChromaDB 기반 RAG 레이어를 기존 enrichContext() 파이프라인 앞에 추가. 기존 지식 그래프(관계/안티패턴/취약점)는 그대로 유지하면서, Product Intelligence 데이터(배포 프로필, 통합 패턴, 스케일업 경로)를 LLM 컨텍스트에 주입.

**Tech Stack:** ChromaDB (로컬 persistent), OpenAI Embeddings (ada-002), TypeScript, Vitest

---

## 1. 배경 및 동기

### 현재 한계
InfraFlow의 현재 LLM 파이프라인은 키워드 매칭(`extractNodeTypesFromPrompt`)으로 인프라 노드 타입을 추출한 후, `enrichContext()`로 관계/안티패턴/취약점 정보를 주입합니다. 이 방식의 한계:

1. **제품명 인식 불가**: "OpenClaw", "Ollama" 같은 구체적 제품명을 인프라 컴포넌트로 매핑할 수 없음
2. **배포 시나리오 부재**: "데스크탑에 설치", "Termux에서 돌리기" 같은 플랫폼별 배포 요구사항을 이해하지 못함
3. **통합 패턴 부재**: "Slack으로 공유" 같은 서비스 통합이 어떤 인프라 컴포넌트를 필요로 하는지 모름
4. **스케일업 추론 불가**: "클라우드 서버도 추천해줘"에 대해 현재 구성에서 어떤 방향으로 확장해야 하는지 판단 근거 없음

### 목표
- AI/클라우드 제품에 대한 **배포, 통합, 스케일업 지식**을 구조화하여 LLM에 제공
- ChromaDB 기반 **의미론적 검색**으로 사용자 질문과 관련된 제품/시나리오를 정확하게 매칭
- 기존 enrichContext 파이프라인과 **자연스럽게 통합** (기존 기능 영향 없음)

---

## 2. 시스템 아키텍처

### 전체 흐름

```
사용자 질문 (예: "OpenClaw로 AI 비서 만들고, Termux에서도 돌리고, Slack 공유...")
    ↓
[1] Entity Extractor (기존 extractNodeTypesFromPrompt 확장)
    ├─ 인프라 키워드 → InfraNodeType (기존 KEYWORD_ALIASES)
    └─ 제품/서비스 키워드 → Product Intelligence 매칭 (신규)
    ↓
[2] RAG Retriever (신규 — src/lib/rag/)
    ├─ ChromaDB에서 유사도 검색 (topK: 10)
    │   ├─ Collection: ai-software (aiCatalog + PI 확장)
    │   ├─ Collection: cloud-services (cloudCatalog)
    │   └─ Collection: deployment-scenarios (신규 PI 데이터)
    └─ 관련 Product Intelligence 데이터 반환
    ↓
[3] Context Builder (기존 enrichContext 확장)
    ├─ 기존: relationships, violations, suggestions, risks, vulnerabilities
    └─ 신규: productIntelligence, deploymentScenarios, integrationPatterns
    ↓
[4] Prompt Builder (기존 buildKnowledgePromptSection 확장)
    ├─ 기존: 공식 표준, 검증된 실무 가이드, 주의사항, 장애 시나리오, 보안
    └─ 신규: 📦 제품 정보, 🚀 배포 시나리오, 🔗 통합 패턴, ⬆️ 스케일업 경로
    ↓
[5] LLM (기존 Claude/OpenAI — 변경 없음)
    └─ enriched system prompt + 사용자 질문 → InfraSpec 생성
```

### 기존 코드 영향 범위

| 파일 | 변경 유형 | 내용 |
|------|----------|------|
| `src/app/api/llm/route.ts` | 수정 | RAG retriever 호출 추가 |
| `src/lib/knowledge/contextEnricher.ts` | 수정 | PI 데이터를 EnrichedKnowledge에 포함 |
| `src/lib/parser/prompts.ts` | 수정 | buildKnowledgePromptSection에 PI 섹션 추가 |
| `src/lib/rag/*` | **신규** | RAG 모듈 전체 |
| `src/lib/knowledge/productIntelligence/*` | **신규** | PI 데이터 및 타입 |

---

## 3. Product Intelligence 스키마

### 핵심 타입

```typescript
// src/lib/knowledge/productIntelligence/types.ts

export interface ProductIntelligence {
  id: string;                              // 'PI-001'
  productId: string;                       // 기존 AI-INF-001 또는 신규 ID
  name: string;
  nameKo: string;
  category: PICategory;
  sourceUrl: string;                       // 공식 사이트/GitHub URL

  // 배포 정보 (핵심 신규 데이터)
  deploymentProfiles: DeploymentProfile[];

  // 통합 정보
  integrations: IntegrationInfo[];

  // 스케일업 경로
  scaleUpPaths: ScaleUpPath[];

  // 임베딩용 텍스트 (RAG 검색에 사용)
  embeddingText: string;
  embeddingTextKo: string;
}

export type PICategory =
  | 'ai-inference'      // Ollama, vLLM, llama.cpp
  | 'ai-assistant'      // OpenClaw, Open WebUI, Jan.ai
  | 'ai-framework'      // LangChain, LlamaIndex
  | 'vector-db'         // ChromaDB, Pinecone, Milvus
  | 'ai-gateway'        // LiteLLM, AI Gateway
  | 'ai-orchestrator'   // Dify, Flowise
  | 'ai-monitor'        // MLflow, Weights & Biases
  | 'cloud-compute'     // AWS Lambda, GCP Cloud Run
  | 'cloud-gpu'         // AWS SageMaker, GCP Vertex AI
  | 'cloud-container'   // ECS, AKS, GKE
  | 'communication'     // Slack, Discord, Teams
  | 'devops';           // GitHub Actions, Docker, K8s

export interface DeploymentProfile {
  platform: 'desktop' | 'mobile' | 'server' | 'edge' | 'cloud';
  os: string[];                           // ['linux', 'macos', 'windows', 'android-termux']
  installMethod: string;                   // 'pip install openclaw', 'docker run ...'
  installMethodKo: string;
  minRequirements: ResourceRequirements;
  infraComponents: InfraNodeType[];        // 이 배포에 필요한 인프라 노드들
  notes: string;
  notesKo: string;
}

export interface ResourceRequirements {
  cpu?: string;                            // '4 cores'
  ram?: string;                            // '16GB'
  vram?: string;                           // '8GB'
  storage?: string;                        // '50GB'
  network?: string;                        // 'broadband'
}

export interface IntegrationInfo {
  target: string;                          // 'slack', 'discord', 'github'
  method: 'webhook' | 'api' | 'plugin' | 'native' | 'mcp';
  infraComponents: InfraNodeType[];        // webhook → api-gateway, load-balancer 등
  protocol?: string;                       // 'HTTPS', 'WebSocket', 'gRPC'
  description: string;
  descriptionKo: string;
}

export interface ScaleUpPath {
  trigger: string;                         // "concurrent users > 100"
  triggerKo: string;                       // "동시 사용자 100명 초과"
  from: InfraNodeType[];                   // 현재 구성
  to: InfraNodeType[];                     // 스케일업 구성
  cloudServices: string[];                 // 추천 클라우드 서비스 ID
  reason: string;
  reasonKo: string;
}
```

### 예시: OpenClaw PI 데이터

```typescript
const openClawPI: ProductIntelligence = {
  id: 'PI-001',
  productId: 'AI-AST-001',
  name: 'OpenClaw',
  nameKo: 'OpenClaw',
  category: 'ai-assistant',
  sourceUrl: 'https://openclaw.ai/',

  deploymentProfiles: [
    {
      platform: 'desktop',
      os: ['linux', 'macos', 'windows'],
      installMethod: 'pip install openclaw',
      installMethodKo: 'pip install openclaw',
      minRequirements: { ram: '8GB', storage: '10GB', cpu: '4 cores' },
      infraComponents: ['app-server'],
      notes: 'Local AI assistant with model management',
      notesKo: '모델 관리 기능이 포함된 로컬 AI 비서',
    },
    {
      platform: 'mobile',
      os: ['android-termux'],
      installMethod: 'pkg install python && pip install openclaw',
      installMethodKo: 'pkg install python && pip install openclaw',
      minRequirements: { ram: '4GB', storage: '5GB' },
      infraComponents: ['edge-device', 'mobile-device'],
      notes: 'Lightweight mode on Termux, limited model support',
      notesKo: 'Termux에서 경량 모드, 제한된 모델 지원',
    },
    {
      platform: 'server',
      os: ['linux'],
      installMethod: 'docker run -p 8080:8080 openclaw/server',
      installMethodKo: 'docker run -p 8080:8080 openclaw/server',
      minRequirements: { ram: '16GB', vram: '8GB', storage: '50GB' },
      infraComponents: ['gpu-server', 'container', 'inference-engine'],
      notes: 'Full server mode with GPU acceleration',
      notesKo: 'GPU 가속을 포함한 전체 서버 모드',
    },
  ],

  integrations: [
    {
      target: 'slack',
      method: 'webhook',
      infraComponents: ['api-gateway'],
      protocol: 'HTTPS',
      description: 'Send AI responses to Slack channels via webhook',
      descriptionKo: 'Webhook을 통해 AI 응답을 Slack 채널로 전송',
    },
    {
      target: 'ollama',
      method: 'api',
      infraComponents: ['inference-engine'],
      protocol: 'HTTP',
      description: 'Use Ollama as backend inference engine',
      descriptionKo: 'Ollama를 백엔드 추론 엔진으로 사용',
    },
  ],

  scaleUpPaths: [
    {
      trigger: 'Team size > 10 or concurrent requests > 50',
      triggerKo: '팀 규모 10명 이상 또는 동시 요청 50개 초과',
      from: ['app-server', 'gpu-server'],
      to: ['ai-cluster', 'load-balancer', 'container', 'kubernetes'],
      cloudServices: ['AWS-CMP-005', 'AWS-CMP-004'],  // SageMaker, ECS
      reason: 'Centralized GPU cluster with load balancing for team access',
      reasonKo: '팀 접근을 위한 중앙집중형 GPU 클러스터와 로드밸런싱',
    },
  ],

  embeddingText: 'OpenClaw AI assistant desktop mobile Termux local LLM model management Slack webhook Ollama backend inference GPU server scale cloud',
  embeddingTextKo: 'OpenClaw AI 비서 데스크탑 모바일 Termux 로컬 LLM 모델 관리 Slack 웹훅 Ollama 백엔드 추론 GPU 서버 스케일 클라우드',
};
```

---

## 4. ChromaDB 연동 설계

### 디렉토리 구조

```
src/lib/rag/
├── types.ts              # RAG 관련 타입 (SearchResult, CollectionConfig)
├── chromaClient.ts       # ChromaDB 연결 및 컬렉션 관리
├── embeddings.ts         # 임베딩 생성 (OpenAI ada-002)
├── indexer.ts            # 카탈로그 데이터 → ChromaDB 인덱싱
├── retriever.ts          # 쿼리 → 유사도 검색 → PI 데이터 반환
├── __tests__/            # 테스트
│   ├── chromaClient.test.ts
│   ├── indexer.test.ts
│   └── retriever.test.ts
└── index.ts              # Public API exports
```

### 컬렉션 구조

| Collection | 소스 데이터 | 예상 문서 수 | Metadata Fields |
|-----------|-----------|-------------|-----------------|
| `infraflow-ai-software` | aiCatalog + PI | ~70개 | category, license, deploymentModel[] |
| `infraflow-cloud-services` | cloudCatalog | 111개 | provider, serviceCategory, architectureRole |
| `infraflow-deployment-scenarios` | PI deploymentProfiles | ~100개 | platform, os[], productName |
| `infraflow-integration-patterns` | PI integrations | ~50개 | target, method, protocol |

### 임베딩 전략

- **모델**: OpenAI `text-embedding-ada-002` (1536차원)
  - 한국어/영어 혼합 지원
  - 저렴 ($0.0001/1K tokens)
  - 대안: `all-MiniLM-L6-v2` (로컬, 384차원) — 오프라인 환경용
- **텍스트 생성**: 각 문서의 핵심 필드를 결합
  ```
  ai-software: name + description + recommendedFor.join(', ') + architectureRole
  cloud-services: name + description + serviceCategory + architectureRole + recommendedFor
  deployment: productName + platform + os.join(', ') + notes + infraComponents
  integration: productName + target + method + description
  ```
- **캐싱**: 임베딩 결과를 로컬 JSON으로 캐시 (재인덱싱 비용 절감)

### ChromaDB 설정

```typescript
// src/lib/rag/chromaClient.ts

const CHROMA_CONFIG = {
  path: process.env.CHROMA_PERSIST_DIR || '.chroma',
  collections: {
    aiSoftware: 'infraflow-ai-software',
    cloudServices: 'infraflow-cloud-services',
    deploymentScenarios: 'infraflow-deployment-scenarios',
    integrationPatterns: 'infraflow-integration-patterns',
  },
  defaultTopK: 10,
  similarityThreshold: 0.7,  // 최소 유사도
};
```

### 검색 API

```typescript
// src/lib/rag/retriever.ts

export interface RAGSearchResult {
  documents: RAGDocument[];
  totalResults: number;
  queryTime: number;      // ms
}

export interface RAGDocument {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  score: number;          // 유사도 점수 (0-1)
  collection: string;     // 어느 컬렉션에서 왔는지
}

/**
 * 사용자 질문으로 관련 PI 데이터를 검색
 */
export async function searchProductIntelligence(
  query: string,
  options?: {
    topK?: number;
    collections?: string[];   // 특정 컬렉션만 검색
    filters?: Record<string, unknown>;  // 메타데이터 필터
  },
): Promise<RAGSearchResult>;
```

---

## 5. 기존 파이프라인 통합

### enrichContext 확장

```typescript
// src/lib/knowledge/contextEnricher.ts — 수정

export interface EnrichedKnowledge {
  // 기존 (변경 없음)
  relationships: ComponentRelationship[];
  violations: AntiPattern[];
  suggestions: ComponentRelationship[];
  risks: FailureScenario[];
  tips: [];
  vulnerabilities?: VulnerabilityEntry[];
  complianceGaps?: ComplianceGap[];

  // 신규
  productIntelligence?: RAGDocument[];      // RAG 검색 결과
}
```

### buildKnowledgePromptSection 확장

```typescript
// src/lib/parser/prompts.ts — 수정

// 기존 섹션들 이후에 PI 섹션 추가:
// 📦 관련 제품 정보 (Product Intelligence)
//   - {productName}: {description}
//     배포: {platform} ({os}) — {installMethod}
//     필요 인프라: {infraComponents}
//
// 🔗 통합 패턴
//   - {productName} ↔ {target}: {method} ({protocol})
//     필요 인프라: {infraComponents}
//
// ⬆️ 스케일업 경로
//   - 조건: {trigger}
//     현재: {from} → 확장: {to}
//     추천 클라우드: {cloudServices}
```

### LLM Route 수정

```typescript
// src/app/api/llm/route.ts — 수정

// buildEnrichedSystemPrompt() 안에서:
// 1. 기존: extractNodeTypesFromPrompt(prompt)
// 2. 신규: await searchProductIntelligence(prompt, { topK: 10 })
// 3. 기존: enrichContext(context, RELATIONSHIPS, options)
//    → options에 RAG 결과 포함
// 4. buildKnowledgePromptSection(enriched) → PI 섹션 자동 포함
```

---

## 6. 반자동 크롤러 설계

### 에이전트 정의

```
.claude/agents/product-intelligence-crawler.md

역할: AI/클라우드 제품의 Product Intelligence 데이터를 수집하고 구조화
입력: 제품명 + 공식 URL
출력: ProductIntelligence 타입에 맞는 TypeScript 데이터 파일

크롤링 소스 (우선순위):
1. GitHub README/docs (API: GitHub GraphQL) — 설치 방법, 요구사항
2. 공식 문서 사이트 (WebFetch) — 통합, API, 배포 가이드
3. Docker Hub (API: Hub API v2) — 컨테이너 이미지, 환경 변수
4. PyPI/npm (API: Registry APIs) — 의존성, 지원 Python/Node 버전
```

### 크롤러 워크플로우

```
[1] 제품 리스트 입력
    예: "OpenClaw (https://openclaw.ai/), Open WebUI (https://github.com/open-webui/open-webui)"
    ↓
[2] GitHub README 자동 수집
    - Installation, Quick Start, Requirements 섹션 추출
    - 지원 플랫폼, OS, 하드웨어 요구사항 파싱
    ↓
[3] 공식 문서 크롤링
    - Integration, API, Deployment 페이지 수집
    - 통합 대상(Slack, Discord 등) 및 방법 추출
    ↓
[4] LLM 구조화
    - 수집된 원본 데이터 → ProductIntelligence 타입 초안 생성
    - embeddingText 자동 생성
    ↓
[5] 사람 검수
    - 최소 요구사항 충족 확인 (PI-QG 규칙)
    - infraComponents 매핑 검증
    ↓
[6] 인덱싱
    - 확정된 데이터를 TypeScript 파일로 저장
    - ChromaDB 자동 인덱싱
```

### 품질 게이트 (PI-QG)

| 규칙 | 설명 |
|------|------|
| PI-QG-001 | `deploymentProfiles` 최소 1개 |
| PI-QG-002 | 각 프로필에 `infraComponents` 최소 1개 |
| PI-QG-003 | `embeddingText` + `embeddingTextKo` 비어있지 않음 |
| PI-QG-004 | `installMethod` 실행 가능한 명령어 |
| PI-QG-005 | `sourceUrl` 유효한 URL |
| PI-QG-006 | `name` + `nameKo` 둘 다 존재 (이중언어) |

---

## 7. 단계별 로드맵

### Phase 1: RAG 인프라 + 기존 데이터 벡터화 (2-3일)

**목표**: ChromaDB 동작 확인 + 기존 150개 카탈로그 데이터로 검색 가능

| 작업 | 파일 | 설명 |
|------|------|------|
| 1-1 | `package.json` | chromadb, openai 패키지 설치 |
| 1-2 | `src/lib/rag/types.ts` | RAG 타입 정의 |
| 1-3 | `src/lib/rag/chromaClient.ts` | ChromaDB 클라이언트 래퍼 |
| 1-4 | `src/lib/rag/embeddings.ts` | 임베딩 생성 유틸 |
| 1-5 | `src/lib/rag/indexer.ts` | 카탈로그 → ChromaDB 인덱싱 |
| 1-6 | `src/lib/rag/retriever.ts` | 유사도 검색 API |
| 1-7 | `src/lib/rag/index.ts` | Public exports |
| 1-8 | 테스트 | chromaClient, indexer, retriever 테스트 |
| 1-9 | 인덱싱 스크립트 | aiCatalog 39개 + cloudCatalog 111개 벡터화 |

### Phase 2: Product Intelligence 스키마 + 초기 데이터 (3-4일)

**목표**: AI 도구 30개 + 클라우드 시나리오 20개 + 통합 패턴 15개

| 작업 | 파일 | 설명 |
|------|------|------|
| 2-1 | `src/lib/knowledge/productIntelligence/types.ts` | PI 타입 정의 |
| 2-2 | `src/lib/knowledge/productIntelligence/aiAssistants.ts` | OpenClaw, Open WebUI, Jan.ai 등 |
| 2-3 | `src/lib/knowledge/productIntelligence/aiInference.ts` | Ollama, vLLM, llama.cpp 등 |
| 2-4 | `src/lib/knowledge/productIntelligence/aiFrameworks.ts` | LangChain, LlamaIndex 등 |
| 2-5 | `src/lib/knowledge/productIntelligence/vectorDbs.ts` | ChromaDB, Pinecone, Milvus PI |
| 2-6 | `src/lib/knowledge/productIntelligence/cloudCompute.ts` | Lambda, Cloud Run, ECS 등 |
| 2-7 | `src/lib/knowledge/productIntelligence/integrations.ts` | Slack, Discord, GitHub Actions |
| 2-8 | `src/lib/knowledge/productIntelligence/index.ts` | Exports + queryHelpers |
| 2-9 | 테스트 | PI 데이터 무결성 + queryHelpers 테스트 |
| 2-10 | ChromaDB 인덱싱 | PI 데이터 벡터화 추가 |

### Phase 3: 파이프라인 통합 + 테스트 (2-3일)

**목표**: enrichContext → RAG → LLM 프롬프트까지 End-to-End 연결

| 작업 | 파일 | 설명 |
|------|------|------|
| 3-1 | `src/lib/knowledge/contextEnricher.ts` | EnrichedKnowledge에 PI 필드 추가 |
| 3-2 | `src/lib/parser/prompts.ts` | buildKnowledgePromptSection PI 섹션 |
| 3-3 | `src/app/api/llm/route.ts` | RAG retriever 호출 통합 |
| 3-4 | 통합 테스트 | 복합 시나리오 10개 테스트 |
| 3-5 | 성능 테스트 | ChromaDB 쿼리 latency 측정 |
| 3-6 | 폴백 처리 | ChromaDB 없을 때 graceful degradation |

### Phase 4: 크롤러 + 지속적 확장 (이후)

**목표**: 반자동 크롤러로 PI 데이터 지속 확장

| 작업 | 파일 | 설명 |
|------|------|------|
| 4-1 | `.claude/agents/product-intelligence-crawler.md` | 크롤러 에이전트 정의 |
| 4-2 | `.claude/rules/product-intelligence-rules.md` | PI 품질 게이트 규칙 |
| 4-3 | 커뮤니티 크롤링 | 이전 리서치 기반 확장 (98개 소스) |
| 4-4 | 자동 업데이트 | GitHub release 모니터링 → PI 갱신 |

---

## 8. 설계 결정사항 요약

| 결정 | 선택 | 이유 |
|------|------|------|
| 1차 범위 | AI 도구 + 클라우드 통합 | 사용자 시나리오(OpenClaw + 클라우드)를 직접 지원 |
| 데이터 수집 | 반자동 (Crawler + 검수) | 정확도와 확장성 균형 |
| 추론 방식 | RAG 기반 검색 | 대량 데이터 처리 가능, 벡터 DB 활용 |
| 벡터 DB | ChromaDB (로컬) | 외부 의존 최소, 무료, dev 환경 즉시 사용 |
| 접근 방식 | Incremental RAG | 기존 150개 데이터를 바로 활용, 점진적 확장 |

---

## 9. 사용자 시나리오 예시

### 입력
> "OpenClaw를 기반으로 데스크탑/노트북에 설치해서 AI 비서를 만들기도 하고, 모바일의 Termux 설치 후 OpenClaw를 넣어서 핸드폰이 자체적으로 돌아갈 수 있게끔 한 이후에, 각자의 작업을 서로 슬랙을 통해서 공유하고 피드백 받는 구조를 만들고 싶고, 만약에 거기에 어떤 클라우드 서버 환경을 넣는다면 어떤 구조가 되면 좋을지 추천해줘"

### RAG 검색 결과
1. **ai-software**: OpenClaw PI (배포: desktop, mobile-termux, server)
2. **deployment-scenarios**: desktop→app-server, termux→edge-device
3. **integration-patterns**: Slack webhook → api-gateway
4. **cloud-services**: AWS SageMaker, GCP Vertex AI, ECS

### LLM에 주입되는 컨텍스트 (예시)

```markdown
## 📦 관련 제품 정보

### OpenClaw (AI 비서)
- **데스크탑 배포**: Linux/macOS/Windows, `pip install openclaw`
  - 필요 인프라: app-server
  - 최소 요구: RAM 8GB, 저장소 10GB
- **모바일 배포 (Termux)**: Android, `pkg install python && pip install openclaw`
  - 필요 인프라: edge-device, mobile-device
  - 최소 요구: RAM 4GB, 저장소 5GB
- **서버 배포**: Linux, `docker run openclaw/server`
  - 필요 인프라: gpu-server, container, inference-engine
  - 최소 요구: RAM 16GB, VRAM 8GB

## 🔗 통합 패턴
- OpenClaw ↔ Slack: webhook (HTTPS)
  - 필요 인프라: api-gateway
- OpenClaw ↔ Ollama: API (HTTP)
  - 필요 인프라: inference-engine

## ⬆️ 스케일업 경로
- 조건: 팀 10명 이상 또는 동시 요청 50개 초과
- 현재: app-server, gpu-server
- 확장: ai-cluster, load-balancer, container, kubernetes
- 추천 클라우드: AWS SageMaker, AWS ECS
```

### 기대 출력 (InfraSpec)
- **Zone 1 (Desktop)**: app-server → inference-engine(OpenClaw)
- **Zone 2 (Mobile)**: edge-device + mobile-device → inference-engine(OpenClaw-lite)
- **Zone 3 (Cloud)**: ai-cluster + load-balancer + kubernetes
- **Integration**: api-gateway ↔ Slack (webhook)
- **Sync**: desktop ↔ mobile ↔ cloud (model-sync edge type)

---

## 10. 참고문서

- `docs/plans/__2026-02-22-community-crawling-research.md` — 커뮤니티 크롤링 기술 가이드
- `docs/plans/__2026-02-22-community-kb-strategy.md` — 커뮤니티 KB 전략
- `docs/plans/__2026-02-22-community-source-catalog.md` — 98개 커뮤니티 소스 카탈로그
- `docs/plans/2026-02-24-edge-ai-infrastructure-design.md` — Edge AI 인프라 설계문서

---

## 11. 향후 확장 계획

Phase 4 이후 커뮤니티 데이터 통합 확장:

1. **커뮤니티 Q&A 크롤링**: StackOverflow, Reddit, GitHub Discussions에서 AI/인프라 관련 Q&A 수집
2. **벤더 포럼 크롤링**: Cisco, AWS, Cloudflare 등 공식 포럼에서 배포 사례 수집
3. **한국 커뮤니티**: 클리앙, GeekNews, OKKY 등에서 한국어 AI 구축 사례 수집
4. **자동 학습 루프**: 사용자 피드백(기존 learning 모듈) → PI 데이터 품질 개선
5. **Trust System 연동**: 커뮤니티 데이터에 confidence 점수 부여 (기존 BASE_CONFIDENCE 확장)
