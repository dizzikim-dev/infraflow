# Edge AI Infrastructure — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add comprehensive AI infrastructure support (14 node types, 25 relationships, 9 patterns, 3 edge flow types, ~40 AI software catalog entries) to InfraFlow, enabling users to visualize and get recommendations for open-source AI deployments from personal devices to enterprise GPU clusters.

**Architecture:** Bottom-up approach — types → infra DB → parser → knowledge graph → catalog. Two new categories (`ai-compute`, `ai-service`) follow existing 4-file sync pattern. AI software catalog (`aiCatalog/`) mirrors `vendorCatalog/` structure but for open-source/commercial AI tools.

**Tech Stack:** TypeScript strict, vitest, existing InfraFlow patterns (SSoT, bilingual, trust metadata)

**Design doc:** `docs/plans/2026-02-24-edge-ai-infrastructure-design.md`

---

### Task 1: Add AI node types to `src/types/infra.ts`

**Files:**
- Modify: `src/types/infra.ts`
- Test: `src/types/__tests__/infra-ai-types.test.ts`

**Step 1: Write the failing test**

Create `src/types/__tests__/infra-ai-types.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import type {
  AIComputeNodeType,
  AIServiceNodeType,
  NodeCategory,
  InfraNodeType,
  EdgeFlowType,
} from '../infra';

describe('AI Infrastructure Types', () => {
  it('should accept ai-compute node types as InfraNodeType', () => {
    const types: InfraNodeType[] = [
      'gpu-server', 'ai-accelerator', 'edge-device',
      'mobile-device', 'ai-cluster', 'model-registry',
    ];
    expect(types).toHaveLength(6);
  });

  it('should accept ai-service node types as InfraNodeType', () => {
    const types: InfraNodeType[] = [
      'inference-engine', 'vector-db', 'ai-gateway',
      'ai-orchestrator', 'embedding-service', 'training-platform',
      'prompt-manager', 'ai-monitor',
    ];
    expect(types).toHaveLength(8);
  });

  it('should include ai-compute and ai-service in NodeCategory', () => {
    const categories: NodeCategory[] = ['ai-compute', 'ai-service'];
    expect(categories).toHaveLength(2);
  });

  it('should include new edge flow types', () => {
    const flows: EdgeFlowType[] = ['inference', 'model-sync', 'embedding'];
    expect(flows).toHaveLength(3);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/types/__tests__/infra-ai-types.test.ts`
Expected: FAIL — `AIComputeNodeType`, `AIServiceNodeType` not exported, new literal types not assignable

**Step 3: Write minimal implementation**

In `src/types/infra.ts`, add after line 12 (after `| 'wan';`):

```typescript
// NodeCategory — add:
  | 'ai-compute'
  | 'ai-service';
```

Add after the WanNodeType block (after line 101):

```typescript
// AI Compute Infrastructure
export type AIComputeNodeType =
  | 'gpu-server'         // GPU 서버 (NVIDIA DGX 등)
  | 'ai-accelerator'     // AI 가속기 (NPU, TPU)
  | 'edge-device'        // 엣지 AI 디바이스 (맥미니, 노트북, Jetson)
  | 'mobile-device'      // 모바일 AI 디바이스 (스마트폰 온디바이스 AI)
  | 'ai-cluster'         // AI 클러스터 (다중 GPU 노드)
  | 'model-registry';    // 모델 레지스트리

// AI Service/Platform
export type AIServiceNodeType =
  | 'inference-engine'   // 추론 엔진 (Ollama, vLLM, TGI)
  | 'vector-db'          // 벡터 DB (ChromaDB, Milvus)
  | 'ai-gateway'         // AI 게이트웨이 (LiteLLM)
  | 'ai-orchestrator'    // AI 오케스트레이터 (LangChain, CrewAI)
  | 'embedding-service'  // 임베딩 서비스
  | 'training-platform'  // 학습 플랫폼 (MLflow, W&B)
  | 'prompt-manager'     // 프롬프트 관리 (LangSmith)
  | 'ai-monitor';        // AI 모니터링 (Evidently)
```

Update `InfraNodeType` union (around line 104) to include:

```typescript
export type InfraNodeType =
  | SecurityNodeType
  | NetworkNodeType
  | ComputeNodeType
  | CloudNodeType
  | StorageNodeType
  | AuthNodeType
  | TelecomNodeType
  | WanNodeType
  | AIComputeNodeType
  | AIServiceNodeType
  | 'user'
  | 'internet'
  | 'zone';
```

Update `EdgeFlowType` (around line 152) to add:

```typescript
  | 'inference'    // 추론 요청/응답 (오렌지, 점선 + ⚡)
  | 'model-sync'   // 모델 동기화/배포 (보라, 양방향 점선)
  | 'embedding';   // 임베딩 데이터 흐름 (시안, 얇은 선)
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/types/__tests__/infra-ai-types.test.ts`
Expected: PASS

**Step 5: Run full verification**

Run: `npx tsc --noEmit && npx vitest run`
Expected: Some existing tests may fail because `InfraComponent.category` union and `categoryColorMap` don't include the new categories yet. That's expected — we fix them in Task 2.

**Step 6: Commit**

```bash
git add src/types/infra.ts src/types/__tests__/infra-ai-types.test.ts
git commit -m "feat: add AI infrastructure type definitions (14 node types, 3 edge flows)"
```

---

### Task 2: Update InfraComponent types and category support

**Files:**
- Modify: `src/lib/data/components/types.ts` — add `'ai-compute' | 'ai-service'` to category union
- Modify: `src/lib/data/components/index.ts` — import/export aiCompute + aiService, add to allComponents, categoryLabels, getComponentsByCategory
- Modify: `src/components/nodes/nodeConfig.ts` — add `'ai-compute': 'orange'`, `'ai-service': 'cyan'` to `categoryColorMap` + add 14 node entries to `nodeConfigsRaw`
- Modify: `src/components/panels/node-detail/constants.ts` — add colors for new categories
- Modify: `src/lib/data/infrastructureDB.ts` — import/export new components, update header comment
- Modify: `src/components/edges/AnimatedEdge.tsx` — add 3 new edge flow styles

**Step 1: Write the failing test**

Create `src/lib/data/components/__tests__/ai-components.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  allComponents,
  categoryLabels,
  getComponentsByCategory,
} from '../index';

describe('AI Infrastructure Components', () => {
  const aiComputeTypes = [
    'gpu-server', 'ai-accelerator', 'edge-device',
    'mobile-device', 'ai-cluster', 'model-registry',
  ];
  const aiServiceTypes = [
    'inference-engine', 'vector-db', 'ai-gateway',
    'ai-orchestrator', 'embedding-service', 'training-platform',
    'prompt-manager', 'ai-monitor',
  ];

  it('should include all ai-compute components in allComponents', () => {
    for (const type of aiComputeTypes) {
      expect(allComponents[type]).toBeDefined();
      expect(allComponents[type].category).toBe('ai-compute');
    }
  });

  it('should include all ai-service components in allComponents', () => {
    for (const type of aiServiceTypes) {
      expect(allComponents[type]).toBeDefined();
      expect(allComponents[type].category).toBe('ai-service');
    }
  });

  it('should have bilingual labels for new categories', () => {
    expect(categoryLabels['ai-compute']).toEqual({ en: 'AI Compute', ko: 'AI 컴퓨팅' });
    expect(categoryLabels['ai-service']).toEqual({ en: 'AI Service', ko: 'AI 서비스' });
  });

  it('should return ai-compute components by category', () => {
    const components = getComponentsByCategory('ai-compute');
    expect(Object.keys(components)).toHaveLength(6);
  });

  it('should return ai-service components by category', () => {
    const components = getComponentsByCategory('ai-service');
    expect(Object.keys(components)).toHaveLength(8);
  });

  it('should have bilingual fields on every component', () => {
    for (const type of [...aiComputeTypes, ...aiServiceTypes]) {
      const comp = allComponents[type];
      expect(comp.nameKo).toBeTruthy();
      expect(comp.descriptionKo).toBeTruthy();
      expect(comp.functionsKo.length).toBeGreaterThan(0);
      expect(comp.featuresKo.length).toBeGreaterThan(0);
    }
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/data/components/__tests__/ai-components.test.ts`
Expected: FAIL

**Step 3: Create `src/lib/data/components/aiCompute.ts`**

Full component data for 6 ai-compute nodes. Follow the pattern from `compute.ts`:
- Each entry: `id`, `name`, `nameKo`, `category: 'ai-compute'`, `description`, `descriptionKo`, `functions` (5+), `functionsKo`, `features` (4+), `featuresKo`, `recommendedPolicies` (3+), `tier`, `ports`, `protocols`, `vendors`

Key data:
- `gpu-server`: tier `internal`, vendors ['NVIDIA', 'AMD', 'Intel'], ports ['8080', '443']
- `ai-accelerator`: tier `internal`, vendors ['NVIDIA', 'Google', 'Apple', 'Intel', 'AMD']
- `edge-device`: tier `internal`, vendors ['Apple', 'NVIDIA', 'Raspberry Pi Foundation', 'Intel']
- `mobile-device`: tier `external`, vendors ['Apple', 'Samsung', 'Google', 'Qualcomm']
- `ai-cluster`: tier `data`, vendors ['NVIDIA', 'AMD', 'CoreWeave', 'Lambda']
- `model-registry`: tier `internal`, vendors ['MLflow', 'Hugging Face', 'Weights & Biases']

**Step 4: Create `src/lib/data/components/aiService.ts`**

Full component data for 8 ai-service nodes:
- `inference-engine`: tier `internal`, vendors ['Ollama', 'vLLM', 'TGI', 'llama.cpp', 'LM Studio']
- `vector-db`: tier `data`, vendors ['ChromaDB', 'Pinecone', 'Milvus', 'Weaviate', 'Qdrant']
- `ai-gateway`: tier `dmz`, vendors ['LiteLLM', 'Kong', 'Portkey']
- `ai-orchestrator`: tier `internal`, vendors ['LangChain', 'LlamaIndex', 'CrewAI', 'AutoGen']
- `embedding-service`: tier `internal`, vendors ['SentenceTransformers', 'Cohere', 'Jina']
- `training-platform`: tier `internal`, vendors ['MLflow', 'W&B', 'Hugging Face']
- `prompt-manager`: tier `internal`, vendors ['LangSmith', 'PromptLayer', 'Humanloop']
- `ai-monitor`: tier `internal`, vendors ['Evidently', 'WhyLabs', 'Helicone', 'LangSmith']

**Step 5: Update `src/lib/data/components/types.ts`**

Add `'ai-compute' | 'ai-service'` to the category union on line 10:

```typescript
category: 'security' | 'network' | 'compute' | 'cloud' | 'storage' | 'auth' | 'external' | 'telecom' | 'wan' | 'ai-compute' | 'ai-service';
```

**Step 6: Update `src/lib/data/components/index.ts`**

- Import `aiComputeComponents` from `./aiCompute` and `aiServiceComponents` from `./aiService`
- Spread into `allComponents`
- Export individually
- Add to `categoryLabels`: `'ai-compute': { en: 'AI Compute', ko: 'AI 컴퓨팅' }`, `'ai-service': { en: 'AI Service', ko: 'AI 서비스' }`
- Add cases to `getComponentsByCategory` switch

**Step 7: Update `src/lib/data/infrastructureDB.ts`**

- Import `aiComputeComponents`, `aiServiceComponents` from `./components`
- Re-export them
- Update header comment to include AI categories
- Add to `categoryIcons` record:
  - `'ai-compute'`: GPU icon SVG path
  - `'ai-service'`: Brain/AI icon SVG path

**Step 8: Update `src/components/nodes/nodeConfig.ts`**

Add to `categoryColorMap` (line 37-41):
```typescript
'ai-compute': 'orange', 'ai-service': 'cyan',
```

Add 14 entries to `nodeConfigsRaw` after the WAN section:
```typescript
// AI Compute
{ id: 'gpu-server', name: 'GPU Server', icon: '🖥️' },
{ id: 'ai-accelerator', name: 'AI Accelerator', icon: '⚡' },
{ id: 'edge-device', name: 'Edge Device', icon: '📱' },
{ id: 'mobile-device', name: 'Mobile Device', icon: '📲' },
{ id: 'ai-cluster', name: 'AI Cluster', icon: '🔧' },
{ id: 'model-registry', name: 'Model Registry', icon: '📋' },
// AI Service
{ id: 'inference-engine', name: 'Inference Engine', icon: '🧠' },
{ id: 'vector-db', name: 'Vector DB', icon: '🔢' },
{ id: 'ai-gateway', name: 'AI Gateway', icon: '🚪' },
{ id: 'ai-orchestrator', name: 'AI Orchestrator', icon: '🎯' },
{ id: 'embedding-service', name: 'Embedding Service', icon: '🔤' },
{ id: 'training-platform', name: 'Training Platform', icon: '🎓' },
{ id: 'prompt-manager', name: 'Prompt Manager', icon: '💬' },
{ id: 'ai-monitor', name: 'AI Monitor', icon: '📊' },
```

**Step 9: Update `src/components/panels/node-detail/constants.ts`**

Add to `categoryColors` (line 4-14):
```typescript
'ai-compute': { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
'ai-service': { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
```

**Step 10: Update `src/components/edges/AnimatedEdge.tsx`**

Add 3 entries to `flowTypeStyles` record:
```typescript
inference: {
  color: '#f97316',
  glowColor: 'rgba(249, 115, 22, 0.4)',
  strokeWidth: 2,
  dashArray: '6,4',
  particleSize: 4,
  speed: 1.8,
},
'model-sync': {
  color: '#8b5cf6',
  glowColor: 'rgba(139, 92, 246, 0.4)',
  strokeWidth: 2,
  dashArray: '4,4',
  particleSize: 3,
  speed: 1,
},
embedding: {
  color: '#06b6d4',
  glowColor: 'rgba(6, 182, 212, 0.4)',
  strokeWidth: 1.5,
  particleSize: 3,
  speed: 1.5,
},
```

**Step 11: Update any other categoryColors references**

Check and update `categoryColors` in:
- `src/components/admin/ComponentTable.tsx:66`
- `src/app/admin/page.tsx:95`
- `src/components/panels/CostEstimatorPanel.tsx:67`

Add the two new categories to each.

**Step 12: Run test to verify it passes**

Run: `npx vitest run src/lib/data/components/__tests__/ai-components.test.ts`
Expected: PASS

**Step 13: Run full verification**

Run: `npx tsc --noEmit && npx vitest run`
Expected: ALL PASS

**Step 14: Commit**

```bash
git add src/lib/data/components/ src/components/nodes/nodeConfig.ts src/components/panels/node-detail/constants.ts src/components/edges/AnimatedEdge.tsx src/lib/data/infrastructureDB.ts src/components/admin/ComponentTable.tsx src/app/admin/page.tsx src/components/panels/CostEstimatorPanel.tsx
git commit -m "feat: add AI infrastructure component data (14 nodes, 3 edge flows, category colors)"
```

---

### Task 3: Add parser patterns for AI nodes

**Files:**
- Modify: `src/lib/parser/patterns.ts` — add ~14 node type patterns
- Modify: `src/lib/parser/templates.ts` — add 3 template specs + keywords
- Test: `src/lib/parser/__tests__/ai-parser-patterns.test.ts`

**Step 1: Write the failing test**

Create `src/lib/parser/__tests__/ai-parser-patterns.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { nodeTypePatterns } from '../patterns';
import { infraTemplates, templateKeywords } from '../templates';

describe('AI Parser Patterns', () => {
  const aiNodeTypes = [
    'gpu-server', 'ai-accelerator', 'edge-device', 'mobile-device',
    'ai-cluster', 'model-registry', 'inference-engine', 'vector-db',
    'ai-gateway', 'ai-orchestrator', 'embedding-service',
    'training-platform', 'prompt-manager', 'ai-monitor',
  ];

  it('should have patterns for all AI node types', () => {
    const patternTypes = nodeTypePatterns.map(p => p.type);
    for (const type of aiNodeTypes) {
      expect(patternTypes).toContain(type);
    }
  });

  it('should match Korean prompts for GPU server', () => {
    const pattern = nodeTypePatterns.find(p => p.type === 'gpu-server');
    expect(pattern).toBeDefined();
    expect(pattern!.pattern.test('GPU 서버')).toBe(true);
    expect(pattern!.pattern.test('gpu server')).toBe(true);
  });

  it('should match Korean prompts for inference engine', () => {
    const pattern = nodeTypePatterns.find(p => p.type === 'inference-engine');
    expect(pattern).toBeDefined();
    expect(pattern!.pattern.test('추론 엔진')).toBe(true);
    expect(pattern!.pattern.test('Ollama')).toBe(true);
    expect(pattern!.pattern.test('vllm')).toBe(true);
  });

  it('should match Korean prompts for vector DB', () => {
    const pattern = nodeTypePatterns.find(p => p.type === 'vector-db');
    expect(pattern).toBeDefined();
    expect(pattern!.pattern.test('벡터 DB')).toBe(true);
    expect(pattern!.pattern.test('ChromaDB')).toBe(true);
  });

  it('should match Korean prompts for edge device', () => {
    const pattern = nodeTypePatterns.find(p => p.type === 'edge-device');
    expect(pattern).toBeDefined();
    expect(pattern!.pattern.test('엣지 디바이스')).toBe(true);
    expect(pattern!.pattern.test('맥미니')).toBe(true);
    expect(pattern!.pattern.test('jetson')).toBe(true);
  });

  it('should have bilingual labels on all AI patterns', () => {
    for (const type of aiNodeTypes) {
      const pattern = nodeTypePatterns.find(p => p.type === type);
      expect(pattern?.labelKo).toBeTruthy();
    }
  });

  // Templates
  it('should have personal-ai template', () => {
    expect(infraTemplates['personal-ai']).toBeDefined();
    expect(infraTemplates['personal-ai'].nodes.length).toBeGreaterThan(0);
  });

  it('should have rag-pipeline template', () => {
    expect(infraTemplates['rag-pipeline']).toBeDefined();
  });

  it('should have enterprise-ai template', () => {
    expect(infraTemplates['enterprise-ai']).toBeDefined();
  });

  it('should have keywords for AI templates', () => {
    expect(templateKeywords['personal-ai']).toBeDefined();
    expect(templateKeywords['rag-pipeline']).toBeDefined();
    expect(templateKeywords['enterprise-ai']).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/parser/__tests__/ai-parser-patterns.test.ts`
Expected: FAIL

**Step 3: Add patterns to `src/lib/parser/patterns.ts`**

Add before the closing `];` of `nodeTypePatterns` array (before line 115), after the WAN section:

```typescript
  // AI Compute
  { pattern: /gpu\s*서버|gpu\s*server|nvidia\s*dgx|ai\s*서버/i, type: 'gpu-server', label: 'GPU Server', labelKo: 'GPU 서버' },
  { pattern: /ai\s*가속기|ai\s*accelerat|npu|tpu(?!\w)|neural\s*process/i, type: 'ai-accelerator', label: 'AI Accelerator', labelKo: 'AI 가속기' },
  { pattern: /엣지\s*디바이스|edge\s*device|맥미니|mac\s*mini|jetson|raspberry\s*pi|엣지\s*ai/i, type: 'edge-device', label: 'Edge Device', labelKo: '엣지 디바이스' },
  { pattern: /모바일\s*ai|mobile\s*ai|온디바이스\s*ai|on[-\s]*device\s*ai/i, type: 'mobile-device', label: 'Mobile Device', labelKo: '모바일 디바이스' },
  { pattern: /ai\s*클러스터|ai\s*cluster|gpu\s*클러스터|gpu\s*cluster/i, type: 'ai-cluster', label: 'AI Cluster', labelKo: 'AI 클러스터' },
  { pattern: /모델\s*레지스트리|model\s*registry|모델\s*저장소/i, type: 'model-registry', label: 'Model Registry', labelKo: '모델 레지스트리' },

  // AI Service
  { pattern: /추론\s*엔진|inference\s*engine|ollama|vllm|llama\.cpp|tgi(?!\w)|lm\s*studio|mlx\s*서버|localai/i, type: 'inference-engine', label: 'Inference Engine', labelKo: '추론 엔진' },
  { pattern: /벡터\s*db|vector\s*db|chromadb|pinecone|milvus|weaviate|qdrant|pgvector|faiss/i, type: 'vector-db', label: 'Vector DB', labelKo: '벡터 DB' },
  { pattern: /ai\s*게이트웨이|ai\s*gateway|litellm|ai\s*api\s*라우팅/i, type: 'ai-gateway', label: 'AI Gateway', labelKo: 'AI 게이트웨이' },
  { pattern: /ai\s*오케스트레이터|ai\s*orchestrat|langchain|crewai|autogen|llamaindex/i, type: 'ai-orchestrator', label: 'AI Orchestrator', labelKo: 'AI 오케스트레이터' },
  { pattern: /임베딩\s*서비스|embedding\s*service|sentence\s*transform|임베딩\s*엔진/i, type: 'embedding-service', label: 'Embedding Service', labelKo: '임베딩 서비스' },
  { pattern: /학습\s*플랫폼|training\s*platform|mlflow|weights?\s*(?:&|and)\s*biases|파인\s*튜닝\s*플랫폼/i, type: 'training-platform', label: 'Training Platform', labelKo: '학습 플랫폼' },
  { pattern: /프롬프트\s*관리|prompt\s*manage|langsmith|promptlayer/i, type: 'prompt-manager', label: 'Prompt Manager', labelKo: '프롬프트 관리' },
  { pattern: /ai\s*모니터|ai\s*monitor|모델\s*모니터링|evidently|whylabs|helicone/i, type: 'ai-monitor', label: 'AI Monitor', labelKo: 'AI 모니터링' },
```

**Step 4: Add templates to `src/lib/parser/templates.ts`**

Add 3 new templates to `infraTemplates` object before the closing `};`:

```typescript
  // Personal AI Assistant (edge device + Ollama)
  'personal-ai': {
    nodes: [
      { id: 'user', type: 'user', label: 'User' },
      { id: 'edge', type: 'edge-device', label: 'Edge Device (Mac Mini)', zone: 'internal' },
      { id: 'inference', type: 'inference-engine', label: 'Inference Engine (Ollama)', zone: 'internal' },
      { id: 'orchestrator', type: 'ai-orchestrator', label: 'AI Orchestrator', zone: 'internal' },
      { id: 'vectordb', type: 'vector-db', label: 'Vector DB', zone: 'data' },
    ],
    connections: [
      { source: 'user', target: 'orchestrator', flowType: 'request' },
      { source: 'orchestrator', target: 'inference', flowType: 'inference' },
      { source: 'orchestrator', target: 'vectordb', flowType: 'embedding' },
      { source: 'inference', target: 'edge', flowType: 'inference' },
    ],
  },

  // RAG Pipeline
  'rag-pipeline': {
    nodes: [
      { id: 'user', type: 'user', label: 'User' },
      { id: 'apigw', type: 'api-gateway', label: 'API Gateway', zone: 'dmz' },
      { id: 'orchestrator', type: 'ai-orchestrator', label: 'AI Orchestrator', zone: 'internal' },
      { id: 'embedding', type: 'embedding-service', label: 'Embedding Service', zone: 'internal' },
      { id: 'vectordb', type: 'vector-db', label: 'Vector DB', zone: 'data' },
      { id: 'inference', type: 'inference-engine', label: 'Inference Engine', zone: 'internal' },
      { id: 'gpu', type: 'gpu-server', label: 'GPU Server', zone: 'data' },
    ],
    connections: [
      { source: 'user', target: 'apigw', flowType: 'request' },
      { source: 'apigw', target: 'orchestrator', flowType: 'request' },
      { source: 'orchestrator', target: 'embedding', flowType: 'embedding' },
      { source: 'embedding', target: 'vectordb', flowType: 'embedding' },
      { source: 'orchestrator', target: 'inference', flowType: 'inference' },
      { source: 'inference', target: 'gpu', flowType: 'inference' },
    ],
  },

  // Enterprise AI Platform
  'enterprise-ai': {
    nodes: [
      { id: 'user', type: 'user', label: 'User' },
      { id: 'lb', type: 'load-balancer', label: 'Load Balancer', zone: 'dmz' },
      { id: 'aigw', type: 'ai-gateway', label: 'AI Gateway', zone: 'dmz' },
      { id: 'inf1', type: 'inference-engine', label: 'Inference Engine 1', zone: 'internal' },
      { id: 'inf2', type: 'inference-engine', label: 'Inference Engine 2', zone: 'internal' },
      { id: 'cluster', type: 'ai-cluster', label: 'AI Cluster', zone: 'data' },
      { id: 'training', type: 'training-platform', label: 'Training Platform', zone: 'data' },
      { id: 'registry', type: 'model-registry', label: 'Model Registry', zone: 'data' },
      { id: 'monitor', type: 'ai-monitor', label: 'AI Monitor', zone: 'internal' },
      { id: 'prometheus', type: 'prometheus', label: 'Prometheus', zone: 'internal' },
    ],
    connections: [
      { source: 'user', target: 'lb', flowType: 'request' },
      { source: 'lb', target: 'aigw', flowType: 'request' },
      { source: 'aigw', target: 'inf1', flowType: 'inference' },
      { source: 'aigw', target: 'inf2', flowType: 'inference' },
      { source: 'cluster', target: 'training', flowType: 'inference' },
      { source: 'training', target: 'registry', flowType: 'model-sync' },
      { source: 'registry', target: 'inf1', flowType: 'model-sync' },
      { source: 'registry', target: 'inf2', flowType: 'model-sync' },
      { source: 'inf1', target: 'monitor', flowType: 'sync' },
      { source: 'inf2', target: 'monitor', flowType: 'sync' },
      { source: 'monitor', target: 'prometheus', flowType: 'sync' },
    ],
  },
```

Add keywords to `templateKeywords` object:

```typescript
  'personal-ai': ['개인 ai', 'personal ai', 'ollama', '홈랩', 'home lab', '로컬 ai', 'local ai', '맥미니 ai', 'ai 비서', 'ai assistant'],
  'rag-pipeline': ['rag', 'rag 파이프라인', 'rag pipeline', '벡터 검색', 'vector search', '지식 검색', 'knowledge retrieval', 'embedding pipeline', '임베딩 파이프라인'],
  'enterprise-ai': ['엔터프라이즈 ai', 'enterprise ai', 'ai 플랫폼', 'ai platform', 'llm 서빙', 'llm serving', 'gpu 클러스터', 'gpu cluster', 'ai 인프라', 'ai infrastructure'],
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/parser/__tests__/ai-parser-patterns.test.ts`
Expected: PASS

**Step 5: Run full verification**

Run: `npx tsc --noEmit && npx vitest run`
Expected: ALL PASS

**Step 6: Commit**

```bash
git add src/lib/parser/patterns.ts src/lib/parser/templates.ts src/lib/parser/__tests__/ai-parser-patterns.test.ts
git commit -m "feat: add AI parser patterns (14 node types) and 3 templates"
```

---

### Task 4: Add AI relationships to knowledge graph

**Files:**
- Create: `src/lib/knowledge/relationships/aiRelationships.ts`
- Modify: `src/lib/knowledge/relationships/index.ts`
- Modify: `src/lib/knowledge/sourceRegistry.ts` — add AI-relevant sources
- Test: `src/lib/knowledge/relationships/__tests__/aiRelationships.test.ts`

**Step 1: Write the failing test**

Create `src/lib/knowledge/relationships/__tests__/aiRelationships.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { aiComputeRelationships, aiServiceRelationships, aiCrossRelationships } from '../aiRelationships';
import { RELATIONSHIPS } from '../index';

describe('AI Relationships', () => {
  it('should have ai-compute relationships', () => {
    expect(aiComputeRelationships.length).toBeGreaterThanOrEqual(3);
  });

  it('should have ai-service relationships', () => {
    expect(aiServiceRelationships.length).toBeGreaterThanOrEqual(8);
  });

  it('should have cross-category relationships', () => {
    expect(aiCrossRelationships.length).toBeGreaterThanOrEqual(10);
  });

  it('should be included in RELATIONSHIPS registry', () => {
    const aiIds = RELATIONSHIPS.filter(r => r.id.startsWith('REL-AI')).map(r => r.id);
    expect(aiIds.length).toBeGreaterThanOrEqual(20);
  });

  it('should have unique IDs', () => {
    const allAi = [...aiComputeRelationships, ...aiServiceRelationships, ...aiCrossRelationships];
    const ids = allAi.map(r => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should use REL-AI prefix', () => {
    const allAi = [...aiComputeRelationships, ...aiServiceRelationships, ...aiCrossRelationships];
    for (const r of allAi) {
      expect(r.id).toMatch(/^REL-AI-/);
    }
  });

  it('should have bilingual reasons', () => {
    const allAi = [...aiComputeRelationships, ...aiServiceRelationships, ...aiCrossRelationships];
    for (const r of allAi) {
      expect(r.reason).toBeTruthy();
      expect(r.reasonKo).toBeTruthy();
    }
  });

  it('should have trust metadata with sources', () => {
    const allAi = [...aiComputeRelationships, ...aiServiceRelationships, ...aiCrossRelationships];
    for (const r of allAi) {
      expect(r.trust.confidence).toBeGreaterThan(0);
      expect(r.trust.sources.length).toBeGreaterThan(0);
    }
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/knowledge/relationships/__tests__/aiRelationships.test.ts`
Expected: FAIL

**Step 3: Add AI sources to `src/lib/knowledge/sourceRegistry.ts`**

Add new source constants for AI-relevant references:

```typescript
// AI/ML Infrastructure Sources
export const NVIDIA_AI_ENTERPRISE = vendor('NVIDIA AI Enterprise Architecture Guide', 'https://docs.nvidia.com/ai-enterprise/');
export const HUGGINGFACE_DOCS = vendor('Hugging Face Model Serving Documentation', 'https://huggingface.co/docs');
export const MLOPS_COMMUNITY = industry('MLOps Community Best Practices', 'https://ml-ops.org/');
export const NIST_AI_RMF = nist('AI 100-1', 'AI Risk Management Framework', 'https://csrc.nist.gov/pubs/ai/100/1/final', '2023-01');
```

**Step 4: Create `src/lib/knowledge/relationships/aiRelationships.ts`**

Follow the pattern from `cloudRelationships.ts`. ~25 relationships with REL-AI-001 through REL-AI-025. Use `RelationshipType` values from existing types (`requires`, `recommends`, `conflicts`, `enhances`, `protects`). Trust confidence 0.7-0.85 (industry/vendor sources).

**Step 5: Update `src/lib/knowledge/relationships/index.ts`**

Import and spread the three arrays into `RELATIONSHIPS`:

```typescript
import { aiComputeRelationships, aiServiceRelationships, aiCrossRelationships } from './aiRelationships';

// Add to RELATIONSHIPS array:
  ...aiComputeRelationships,
  ...aiServiceRelationships,
  ...aiCrossRelationships,
```

**Step 6: Run test to verify it passes**

Run: `npx vitest run src/lib/knowledge/relationships/__tests__/aiRelationships.test.ts`
Expected: PASS

**Step 7: Run full verification**

Run: `npx tsc --noEmit && npx vitest run`
Expected: ALL PASS

**Step 8: Commit**

```bash
git add src/lib/knowledge/relationships/aiRelationships.ts src/lib/knowledge/relationships/index.ts src/lib/knowledge/sourceRegistry.ts src/lib/knowledge/relationships/__tests__/aiRelationships.test.ts
git commit -m "feat: add 25 AI infrastructure relationships to knowledge graph"
```

---

### Task 5: Add AI architecture patterns

**Files:**
- Create: `src/lib/knowledge/aiPatterns.ts`
- Modify: `src/lib/knowledge/patterns.ts` — import and include AI patterns
- Test: `src/lib/knowledge/__tests__/aiPatterns.test.ts`

**Step 1: Write the failing test**

Create `src/lib/knowledge/__tests__/aiPatterns.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { aiPatterns } from '../aiPatterns';
import { PATTERNS } from '../patterns';

describe('AI Architecture Patterns', () => {
  it('should define 9 AI patterns', () => {
    expect(aiPatterns).toHaveLength(9);
  });

  it('should use PAT-033 through PAT-041 IDs', () => {
    const ids = aiPatterns.map(p => p.id);
    for (let i = 33; i <= 41; i++) {
      expect(ids).toContain(`PAT-0${i}`);
    }
  });

  it('should be included in PATTERNS registry', () => {
    const aiPatternIds = PATTERNS.filter(p => p.id >= 'PAT-033').map(p => p.id);
    expect(aiPatternIds.length).toBe(9);
  });

  it('should have bilingual fields', () => {
    for (const p of aiPatterns) {
      expect(p.nameKo).toBeTruthy();
      expect(p.descriptionKo).toBeTruthy();
      expect(p.bestForKo.length).toBeGreaterThan(0);
      expect(p.notSuitableForKo.length).toBeGreaterThan(0);
    }
  });

  it('should have WAF pillar scores', () => {
    for (const p of aiPatterns) {
      const { wafPillars } = p;
      expect(wafPillars.operationalExcellence).toBeGreaterThanOrEqual(0);
      expect(wafPillars.operationalExcellence).toBeLessThanOrEqual(5);
      expect(wafPillars.security).toBeGreaterThanOrEqual(0);
      expect(wafPillars.costOptimization).toBeGreaterThanOrEqual(0);
    }
  });

  it('should have required components using AI node types', () => {
    for (const p of aiPatterns) {
      expect(p.requiredComponents.length).toBeGreaterThan(0);
      const hasAiType = p.requiredComponents.some(c =>
        ['gpu-server', 'ai-accelerator', 'edge-device', 'mobile-device',
         'ai-cluster', 'model-registry', 'inference-engine', 'vector-db',
         'ai-gateway', 'ai-orchestrator', 'embedding-service',
         'training-platform', 'prompt-manager', 'ai-monitor'].includes(c.type)
      );
      expect(hasAiType).toBe(true);
    }
  });

  it('should have trust metadata', () => {
    for (const p of aiPatterns) {
      expect(p.trust.confidence).toBeGreaterThan(0);
      expect(p.trust.sources.length).toBeGreaterThan(0);
    }
  });

  it('should cover personal, startup, and enterprise scales', () => {
    const tags = aiPatterns.flatMap(p => p.tags);
    expect(tags).toContain('personal');
    expect(tags).toContain('startup');
    expect(tags).toContain('enterprise');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/knowledge/__tests__/aiPatterns.test.ts`
Expected: FAIL

**Step 3: Create `src/lib/knowledge/aiPatterns.ts`**

9 patterns (PAT-033 to PAT-041) following the `ArchitecturePattern` interface. Include:
- 3 personal: Personal AI Assistant, Home RAG System, Mobile Edge AI
- 3 startup: Self-Hosted LLM Service, RAG Pipeline, AI Agent Platform
- 3 enterprise: Enterprise AI Platform, Edge-Cloud Hybrid AI, Multi-Model Serving

Each with: `requiredComponents`, `optionalComponents`, `scalability`, `complexity`, `bestForKo`, `notSuitableForKo`, `evolvesTo`/`evolvesFrom`, `wafPillars`, `trust` with sources.

**Step 4: Update `src/lib/knowledge/patterns.ts`**

Import `aiPatterns` and include in the exported `PATTERNS` constant. Check how PATTERNS is currently exported — it's likely `Object.freeze([...basicPatterns, ...extendedPatterns, ...])`. Add `...aiPatterns` to the array.

**Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/knowledge/__tests__/aiPatterns.test.ts`
Expected: PASS

**Step 6: Run full verification**

Run: `npx tsc --noEmit && npx vitest run`
Expected: ALL PASS

**Step 7: Commit**

```bash
git add src/lib/knowledge/aiPatterns.ts src/lib/knowledge/patterns.ts src/lib/knowledge/__tests__/aiPatterns.test.ts
git commit -m "feat: add 9 AI architecture patterns (personal/startup/enterprise)"
```

---

### Task 6: Create AI Software Catalog

**Files:**
- Create: `src/lib/knowledge/aiCatalog/types.ts`
- Create: `src/lib/knowledge/aiCatalog/inferenceEngines.ts`
- Create: `src/lib/knowledge/aiCatalog/vectorDatabases.ts`
- Create: `src/lib/knowledge/aiCatalog/orchestrators.ts`
- Create: `src/lib/knowledge/aiCatalog/gateways.ts`
- Create: `src/lib/knowledge/aiCatalog/monitoring.ts`
- Create: `src/lib/knowledge/aiCatalog/embeddingServices.ts`
- Create: `src/lib/knowledge/aiCatalog/trainingPlatforms.ts`
- Create: `src/lib/knowledge/aiCatalog/queryHelpers.ts`
- Create: `src/lib/knowledge/aiCatalog/index.ts`
- Test: `src/lib/knowledge/aiCatalog/__tests__/aiCatalog.test.ts`

**Step 1: Write the failing test**

Create `src/lib/knowledge/aiCatalog/__tests__/aiCatalog.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  allAISoftware,
  getAISoftwareByCategory,
  getAISoftwareForNodeType,
  searchAISoftware,
} from '../index';
import type { AISoftware, AISoftwareCategory } from '../types';

describe('AI Software Catalog', () => {
  it('should have ~40 total products', () => {
    expect(allAISoftware.length).toBeGreaterThanOrEqual(35);
    expect(allAISoftware.length).toBeLessThanOrEqual(50);
  });

  it('should have all required categories', () => {
    const categories = new Set(allAISoftware.map(s => s.category));
    const expected: AISoftwareCategory[] = [
      'inference', 'vector-db', 'orchestrator', 'gateway',
      'monitoring', 'embedding', 'training', 'prompt-mgmt',
    ];
    for (const cat of expected) {
      expect(categories.has(cat)).toBe(true);
    }
  });

  it('should have unique IDs', () => {
    const ids = allAISoftware.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have bilingual fields', () => {
    for (const sw of allAISoftware) {
      expect(sw.nameKo).toBeTruthy();
      expect(sw.descriptionKo).toBeTruthy();
    }
  });

  it('should have valid infraNodeTypes', () => {
    for (const sw of allAISoftware) {
      expect(sw.infraNodeTypes.length).toBeGreaterThan(0);
    }
  });

  it('should filter by category', () => {
    const engines = getAISoftwareByCategory('inference');
    expect(engines.length).toBeGreaterThanOrEqual(6);
    engines.forEach(e => expect(e.category).toBe('inference'));
  });

  it('should find software for node type', () => {
    const results = getAISoftwareForNodeType('inference-engine');
    expect(results.length).toBeGreaterThanOrEqual(6);
  });

  it('should search by name', () => {
    const results = searchAISoftware('ollama');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].name.toLowerCase()).toContain('ollama');
  });

  it('should have inference engines with 8 products', () => {
    const engines = getAISoftwareByCategory('inference');
    expect(engines.length).toBe(8);
  });

  it('should have vector databases with 7 products', () => {
    const vdbs = getAISoftwareByCategory('vector-db');
    expect(vdbs.length).toBe(7);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/knowledge/aiCatalog/__tests__/aiCatalog.test.ts`
Expected: FAIL

**Step 3: Create type definitions (`types.ts`)**

```typescript
import type { AIServiceNodeType } from '@/types/infra';

export type AISoftwareCategory =
  | 'inference'
  | 'vector-db'
  | 'orchestrator'
  | 'gateway'
  | 'monitoring'
  | 'embedding'
  | 'training'
  | 'prompt-mgmt';

export type LicenseType = 'open-source' | 'commercial' | 'freemium';
export type DeploymentModel = 'local' | 'server' | 'cloud' | 'edge';
export type MaturityLevel = 'emerging' | 'growing' | 'mature';
export type CommunitySize = 'small' | 'medium' | 'large';

export interface AISoftware {
  id: string;
  name: string;
  nameKo: string;
  category: AISoftwareCategory;
  license: LicenseType;
  infraNodeTypes: AIServiceNodeType[];
  architectureRole: string;
  architectureRoleKo: string;
  recommendedFor: string[];
  recommendedForKo: string[];
  supportedModels?: string[];
  supportedHardware?: string[];
  deploymentModel: DeploymentModel[];
  minRequirements?: { ram?: string; vram?: string; storage?: string };
  operationalComplexity: 'low' | 'medium' | 'high';
  communitySize: CommunitySize;
  maturity: MaturityLevel;
  documentationUrl: string;
  description: string;
  descriptionKo: string;
}
```

**Step 4: Create all category files**

Each file exports a `const` array of `AISoftware[]`. Follow the product counts from the design doc:
- `inferenceEngines.ts`: 8 (Ollama, vLLM, TGI, llama.cpp, LM Studio, MLX, LocalAI, TensorRT-LLM)
- `vectorDatabases.ts`: 7 (ChromaDB, Pinecone, Milvus, Weaviate, Qdrant, pgvector, FAISS)
- `orchestrators.ts`: 5 (LangChain, LlamaIndex, CrewAI, AutoGen, Haystack)
- `gateways.ts`: 4 (LiteLLM, Kong AI, Portkey, OpenRouter)
- `monitoring.ts`: 5 (LangSmith, MLflow, Evidently, WhyLabs, Helicone)
- `embeddingServices.ts`: 4 (SentenceTransformers, CLIP, Nomic Embed, Jina Embeddings)
- `trainingPlatforms.ts`: 4 (Hugging Face Hub, W&B, Axolotl, Unsloth)

IDs: `AI-INF-001`, `AI-VDB-001`, `AI-ORC-001`, `AI-GW-001`, `AI-MON-001`, `AI-EMB-001`, `AI-TRN-001`

**Step 5: Create `queryHelpers.ts`**

```typescript
import type { AISoftware, AISoftwareCategory } from './types';
import type { AIServiceNodeType } from '@/types/infra';
import { allAISoftware } from './index';

export function getAISoftwareByCategory(category: AISoftwareCategory): AISoftware[] {
  return allAISoftware.filter(s => s.category === category);
}

export function getAISoftwareForNodeType(nodeType: AIServiceNodeType): AISoftware[] {
  return allAISoftware.filter(s => s.infraNodeTypes.includes(nodeType));
}

export function searchAISoftware(query: string): AISoftware[] {
  const q = query.toLowerCase();
  return allAISoftware.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.nameKo.includes(q) ||
    s.description.toLowerCase().includes(q) ||
    s.descriptionKo.includes(q)
  );
}
```

**Step 6: Create `index.ts`**

Combine all arrays into `allAISoftware` and re-export types + query helpers.

**Step 7: Run test to verify it passes**

Run: `npx vitest run src/lib/knowledge/aiCatalog/__tests__/aiCatalog.test.ts`
Expected: PASS

**Step 8: Run full verification**

Run: `npx tsc --noEmit && npx vitest run`
Expected: ALL PASS

**Step 9: Commit**

```bash
git add src/lib/knowledge/aiCatalog/
git commit -m "feat: add AI software catalog (~40 products across 8 categories)"
```

---

### Task 7: Update docs and final verification

**Files:**
- Modify: `docs/INFRASTRUCTURE_COMPONENTS.md` — add AI Compute and AI Service sections

**Step 1: Update documentation**

Add two new sections to `docs/INFRASTRUCTURE_COMPONENTS.md`:
- Section for AI Compute (6 components)
- Section for AI Service (8 components)
- Update the summary table and version number

Follow the existing format (Korean descriptions, features table, vendor list, tier assignment).

**Step 2: Run final full verification**

Run: `npx tsc --noEmit && npx vitest run`
Expected: ALL PASS (151+ test files, 5,521+ tests)

**Step 3: Commit**

```bash
git add docs/INFRASTRUCTURE_COMPONENTS.md
git commit -m "docs: add AI infrastructure components documentation"
```

---

### Task 8: Update MEMORY.md

**Files:**
- Modify: `/Users/hyunkikim/.claude/projects/-Users-hyunkikim-dev-infraflow/memory/MEMORY.md`

Update with:
- New node counts (14 AI nodes, 10 categories total)
- AI catalog stats
- 9 new architecture patterns (total 41)
- 25 new relationships (total ~140)
- 3 new edge flow types (total 11)

---

## Summary

| Task | What | New Files | Modified Files | Tests |
|------|------|-----------|----------------|-------|
| 1 | Type definitions | 1 test | 1 | ~4 |
| 2 | InfraDB + colors + nodeConfig + edges | 2 data + 1 test | ~7 | ~7 |
| 3 | Parser patterns + templates | 1 test | 2 | ~10 |
| 4 | Knowledge relationships | 1 data + 1 test | 2 | ~8 |
| 5 | Architecture patterns | 1 data + 1 test | 1 | ~8 |
| 6 | AI software catalog | ~10 new + 1 test | 0 | ~10 |
| 7 | Documentation | 0 | 1 | 0 |
| 8 | Memory update | 0 | 1 | 0 |
| **Total** | | **~18 new** | **~15 modified** | **~47 tests** |
