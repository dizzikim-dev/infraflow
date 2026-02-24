# Edge AI Infrastructure — Design Document

> Date: 2026-02-24
> Status: Approved
> Approach: Bottom-Up (nodes → relationships → patterns → catalog)

## Problem

InfraFlow has zero support for AI/ML infrastructure. The industry trend of running open-source AI models on personal devices (Mac Mini, laptops, phones) through enterprise GPU clusters is a massive gap in the platform's coverage. Users cannot visualize, understand, or get recommendations for AI infrastructure.

## Solution

Add comprehensive AI infrastructure support across all three layers:
- **L1 Visualize**: New node types + edge types for AI infra diagrams
- **L2 Understand**: Relationships + architecture patterns for AI infra
- **L3 Recommend**: AI software catalog with ~40 products for recommendations

## New Categories

| Category | Color | Border Class | Description |
|----------|-------|-------------|-------------|
| ai-compute | Orange #f97316 | `border-infra-node-ai-compute` | AI hardware/infra — GPU servers, accelerators, edge devices |
| ai-service | Cyan #06b6d4 | `border-infra-node-ai-service` | AI software/platform — inference engines, vector DBs, orchestrators |

## Node Types

### ai-compute (Hardware/Infrastructure Layer)

| Node Type | Label | Label (Ko) | Description | Scale |
|-----------|-------|------------|-------------|-------|
| `gpu-server` | GPU Server | GPU 서버 | NVIDIA DGX, custom GPU servers | Enterprise |
| `ai-accelerator` | AI Accelerator | AI 가속기 | NPU, TPU, dedicated AI chips | All |
| `edge-device` | Edge AI Device | 엣지 AI 디바이스 | Mac Mini, laptop, Jetson, Raspberry Pi | Personal/Small |
| `mobile-device` | Mobile AI Device | 모바일 AI 디바이스 | Smartphone, tablet (on-device AI) | Personal |
| `ai-cluster` | AI Cluster | AI 클러스터 | Multi-GPU node training/inference cluster | Enterprise |
| `model-registry` | Model Registry | 모델 레지스트리 | Model version management, artifact storage | Organization |

### ai-service (Software/Platform Layer)

| Node Type | Label | Label (Ko) | Description | Examples |
|-----------|-------|------------|-------------|----------|
| `inference-engine` | Inference Engine | 추론 엔진 | Model serving/inference runtime | Ollama, vLLM, TGI, llama.cpp |
| `vector-db` | Vector DB | 벡터 DB | Embedding storage/search | ChromaDB, Pinecone, Milvus |
| `ai-gateway` | AI Gateway | AI 게이트웨이 | AI API routing, load balancing, monitoring | LiteLLM, Kong AI Gateway |
| `ai-orchestrator` | AI Orchestrator | AI 오케스트레이터 | Agent/workflow management | LangChain, CrewAI, AutoGen |
| `embedding-service` | Embedding Service | 임베딩 서비스 | Text/image → vector conversion | SentenceTransformers, CLIP |
| `training-platform` | Training Platform | 학습 플랫폼 | Fine-tuning/training platform | MLflow, Weights & Biases |
| `prompt-manager` | Prompt Manager | 프롬프트 관리 | Prompt versioning/evaluation | LangSmith, PromptLayer |
| `ai-monitor` | AI Monitor | AI 모니터링 | Model performance/drift monitoring | Evidently, WhyLabs |

## Relationships (~25)

### ai-compute internal
- ai-cluster → gpu-server: `contains`
- gpu-server → ai-accelerator: `contains`
- ai-cluster → ai-cluster: `interconnects`

### ai-compute → ai-service
- gpu-server → inference-engine: `hosts`
- edge-device → inference-engine: `hosts`
- mobile-device → inference-engine: `hosts`
- gpu-server → training-platform: `hosts`
- model-registry → inference-engine: `serves_model`

### ai-service internal
- ai-orchestrator → inference-engine: `routes_to`
- ai-orchestrator → vector-db: `queries`
- ai-orchestrator → embedding-service: `calls`
- ai-gateway → inference-engine: `load_balances`
- inference-engine → ai-monitor: `reports_to`
- embedding-service → vector-db: `stores_in`
- training-platform → model-registry: `publishes`
- prompt-manager → ai-orchestrator: `configures`

### Cross-category (ai ↔ existing)
- api-gateway → ai-gateway: `routes_to`
- load-balancer → ai-gateway: `distributes`
- kubernetes → inference-engine: `orchestrates`
- kubernetes → ai-cluster: `manages`
- vector-db → elasticsearch: `syncs_with`
- ai-monitor → prometheus: `exports_to`
- ai-monitor → grafana: `visualizes`
- inference-engine → cache: `utilizes`
- model-registry → object-storage: `stores_in`
- edge-device → wireless-ap: `connects_via`

## Architecture Patterns (9)

### Personal/Home Lab (3)

**Personal AI Assistant**
- Scale: Personal
- Components: edge-device → inference-engine → ai-orchestrator
- Description: Run Ollama on Mac Mini/laptop for personal AI assistant
- Use case: Chat, code assistance, document Q&A

**Home RAG System**
- Scale: Personal
- Components: edge-device → inference-engine + vector-db + embedding-service
- Description: Index personal documents in vector DB, search with local AI
- Use case: Personal knowledge base, note search

**Mobile Edge AI**
- Scale: Personal
- Components: mobile-device → inference-engine ↔ edge-device(fallback)
- Description: On-device AI with home server fallback for heavy tasks
- Use case: Mobile assistant with local privacy

### Startup/SMB (3)

**Self-Hosted LLM Service**
- Scale: Startup/SMB
- Components: gpu-server → inference-engine → ai-gateway → api-gateway
- Description: Self-hosted LLM API using vLLM/TGI
- Use case: Customer-facing AI features, internal tools

**RAG Pipeline**
- Scale: Startup/SMB
- Components: embedding-service → vector-db ← ai-orchestrator → inference-engine
- Description: Knowledge-based AI response system
- Use case: Customer support, documentation search

**AI Agent Platform**
- Scale: Startup/SMB
- Components: ai-orchestrator → inference-engine[] + vector-db + prompt-manager
- Description: Multi-agent automation platform
- Use case: Workflow automation, data processing

### Enterprise (3)

**Enterprise AI Platform**
- Scale: Enterprise
- Components: ai-cluster → training-platform → model-registry → inference-engine → ai-gateway
- Description: Full GPU cluster + model pipeline
- Use case: Organization-wide AI platform

**Edge-Cloud Hybrid AI**
- Scale: Enterprise
- Components: edge-device[] → ai-gateway ↔ ai-cluster(cloud)
- Description: Edge inference + cloud training/complex inference
- Use case: IoT AI, retail AI, manufacturing

**Multi-Model Serving**
- Scale: Enterprise
- Components: ai-gateway → inference-engine[] (different models) + ai-monitor
- Description: Multiple model simultaneous serving with routing
- Use case: A/B testing, model specialization

### Pattern Scoring
Each pattern scored on 5 dimensions (same as existing patterns):
- scale (0-20), security (0-20), architecture (0-20), complexity (0-20), waf (0-20)

## AI Software Catalog (~40 products)

### Location
```
src/lib/knowledge/aiCatalog/
├── types.ts
├── index.ts
├── inferenceEngines.ts    # 8 products
├── vectorDatabases.ts     # 7 products
├── orchestrators.ts       # 5 products
├── gateways.ts            # 4 products
├── monitoring.ts          # 5 products
├── embeddingServices.ts   # 4 products
├── trainingPlatforms.ts   # 4 products
└── queryHelpers.ts
```

### AISoftware Type

```typescript
interface AISoftware {
  id: string;
  name: string;
  nameKo: string;
  category: 'inference' | 'vector-db' | 'orchestrator' | 'gateway'
           | 'monitoring' | 'embedding' | 'training' | 'prompt-mgmt';
  license: 'open-source' | 'commercial' | 'freemium';
  infraNodeTypes: AIServiceNodeType[];
  architectureRole: string;
  recommendedFor: string[];
  supportedModels?: string[];
  supportedHardware?: string[];
  deploymentModel: ('local' | 'server' | 'cloud' | 'edge')[];
  minRequirements?: { ram?: string; vram?: string; storage?: string };
  operationalComplexity: 'low' | 'medium' | 'high';
  communitySize: 'small' | 'medium' | 'large';
  maturity: 'emerging' | 'growing' | 'mature';
  documentationUrl: string;
  description: string;
  descriptionKo: string;
}
```

### Initial Products

| Category | Count | Key Products |
|----------|-------|-------------|
| Inference Engines | 8 | Ollama, vLLM, TGI, llama.cpp, LM Studio, MLX, LocalAI, TensorRT-LLM |
| Vector DBs | 7 | ChromaDB, Pinecone, Milvus, Weaviate, Qdrant, pgvector, FAISS |
| Orchestrators | 5 | LangChain, LlamaIndex, CrewAI, AutoGen, Haystack |
| AI Gateways | 4 | LiteLLM, Kong AI, Portkey, OpenRouter |
| Monitoring | 5 | LangSmith, MLflow, Evidently, WhyLabs, Helicone |
| Embedding | 4 | SentenceTransformers, CLIP, Nomic Embed, Jina Embeddings |
| Training | 4 | Hugging Face Hub, W&B, Axolotl, Unsloth |
| Prompt Mgmt | 3 | LangSmith, PromptLayer, Humanloop |

## New Edge/Flow Types

| Type | Color | Style | Description |
|------|-------|-------|-------------|
| `inference` | #f97316 (Orange) | Forward dashed + ⚡ | Inference request/response |
| `model-sync` | #8b5cf6 (Purple) | Bidirectional dotted | Model sync/deployment |
| `embedding` | #06b6d4 (Cyan) | Forward thin | Embedding data flow |

## Parser Patterns

New natural language patterns to recognize:
- "맥미니에 Ollama로 AI 서버 만들어줘"
- "GPU 서버 2대로 vLLM 추론 서비스 구성"
- "RAG 파이프라인 구성해줘 - ChromaDB + LangChain + Ollama"
- "엣지-클라우드 하이브리드 AI 아키텍처"
- "개인 AI 어시스턴트 홈랩 세팅"
- "엔터프라이즈 LLM 서빙 플랫폼"

## Out of Scope (YAGNI)

- Real-time model performance monitoring dashboard
- Model benchmark auto-execution
- Actual Ollama/vLLM integration (InfraFlow is a diagramming/consulting tool)
- GPU price comparison (hardware prices too volatile)

## Implementation Steps (Bottom-Up)

| Step | Content | Files |
|------|---------|-------|
| 1 | ai-compute + ai-service category/node types (4-file sync) | ~8 |
| 2 | InfraDB node data + colors/icons | ~5 |
| 3 | Parser patterns + template matching | ~4 |
| 4 | Knowledge relationships (~25) | ~3 |
| 5 | AI architecture patterns (9) | ~3 |
| 6 | AI catalog (~40 products) | ~10 (new) |
| 7 | Recommendation engine extension | ~4 |
| 8 | Edge/Flow types (3) | ~4 |
| 9 | Tests for all above | ~10+ |
