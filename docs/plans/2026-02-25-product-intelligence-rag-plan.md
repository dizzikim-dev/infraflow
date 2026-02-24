# Product Intelligence & RAG Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a ChromaDB-based RAG layer that enriches LLM context with Product Intelligence data (deployment profiles, integration patterns, scale-up paths) so InfraFlow can generate accurate infrastructure diagrams from complex AI solution queries.

**Architecture:** New `src/lib/rag/` module provides ChromaDB vector search. New `src/lib/knowledge/productIntelligence/` stores structured PI data. Both integrate into the existing `enrichContext()` → `buildKnowledgePromptSection()` → LLM pipeline with minimal changes to existing code.

**Tech Stack:** ChromaDB (chromadb npm), OpenAI Embeddings (openai npm), TypeScript, Vitest

**Design doc:** `docs/plans/2026-02-25-product-intelligence-rag-design.md`

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install chromadb and openai packages**

Run:
```bash
npm install chromadb openai
```

**Step 2: Verify installation**

Run: `npx tsc --noEmit`
Expected: PASS (no type errors from new packages)

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat(rag): install chromadb and openai dependencies"
```

---

## Task 2: Product Intelligence Types

**Files:**
- Create: `src/lib/knowledge/productIntelligence/types.ts`
- Test: `src/lib/knowledge/productIntelligence/__tests__/types.test.ts`

**Step 1: Write the failing test**

```typescript
// src/lib/knowledge/productIntelligence/__tests__/types.test.ts
import { describe, it, expect } from 'vitest';
import type {
  ProductIntelligence,
  DeploymentProfile,
  IntegrationInfo,
  ScaleUpPath,
  PICategory,
  ResourceRequirements,
} from '../types';

describe('Product Intelligence Types', () => {
  it('should allow valid ProductIntelligence object', () => {
    const pi: ProductIntelligence = {
      id: 'PI-001',
      productId: 'AI-AST-001',
      name: 'TestProduct',
      nameKo: '테스트제품',
      category: 'ai-assistant',
      sourceUrl: 'https://example.com',
      deploymentProfiles: [
        {
          platform: 'desktop',
          os: ['linux', 'macos'],
          installMethod: 'pip install test',
          installMethodKo: 'pip install test',
          minRequirements: { ram: '8GB' },
          infraComponents: ['app-server'],
          notes: 'Test notes',
          notesKo: '테스트 노트',
        },
      ],
      integrations: [
        {
          target: 'slack',
          method: 'webhook',
          infraComponents: ['api-gateway'],
          description: 'Slack integration',
          descriptionKo: 'Slack 통합',
        },
      ],
      scaleUpPaths: [
        {
          trigger: 'users > 100',
          triggerKo: '사용자 100명 초과',
          from: ['app-server'],
          to: ['ai-cluster', 'load-balancer'],
          cloudServices: ['AWS-CMP-005'],
          reason: 'Need GPU cluster',
          reasonKo: 'GPU 클러스터 필요',
        },
      ],
      embeddingText: 'test product desktop linux',
      embeddingTextKo: '테스트 제품 데스크탑 리눅스',
    };

    expect(pi.id).toBe('PI-001');
    expect(pi.deploymentProfiles).toHaveLength(1);
    expect(pi.integrations).toHaveLength(1);
    expect(pi.scaleUpPaths).toHaveLength(1);
  });

  it('should enforce PICategory union type', () => {
    const validCategories: PICategory[] = [
      'ai-inference', 'ai-assistant', 'ai-framework', 'vector-db',
      'ai-gateway', 'ai-orchestrator', 'ai-monitor',
      'cloud-compute', 'cloud-gpu', 'cloud-container',
      'communication', 'devops',
    ];
    expect(validCategories).toHaveLength(12);
  });

  it('should allow optional fields in ResourceRequirements', () => {
    const req: ResourceRequirements = { ram: '16GB' };
    expect(req.cpu).toBeUndefined();
    expect(req.vram).toBeUndefined();
  });

  it('should allow optional protocol in IntegrationInfo', () => {
    const info: IntegrationInfo = {
      target: 'discord',
      method: 'api',
      infraComponents: ['api-gateway'],
      protocol: 'WebSocket',
      description: 'Discord bot',
      descriptionKo: 'Discord 봇',
    };
    expect(info.protocol).toBe('WebSocket');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/knowledge/productIntelligence/__tests__/types.test.ts`
Expected: FAIL — module `../types` not found

**Step 3: Write the implementation**

```typescript
// src/lib/knowledge/productIntelligence/types.ts
/**
 * Product Intelligence — Extended product profiles with deployment,
 * integration, and scale-up information for RAG-based LLM reasoning.
 */

import type { InfraNodeType } from '@/types/infra';

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Resource Requirements
// ---------------------------------------------------------------------------

export interface ResourceRequirements {
  cpu?: string;
  ram?: string;
  vram?: string;
  storage?: string;
  network?: string;
}

// ---------------------------------------------------------------------------
// Deployment Profile
// ---------------------------------------------------------------------------

export type DeploymentPlatform = 'desktop' | 'mobile' | 'server' | 'edge' | 'cloud';

export interface DeploymentProfile {
  platform: DeploymentPlatform;
  os: string[];
  installMethod: string;
  installMethodKo: string;
  minRequirements: ResourceRequirements;
  infraComponents: InfraNodeType[];
  notes: string;
  notesKo: string;
}

// ---------------------------------------------------------------------------
// Integration Info
// ---------------------------------------------------------------------------

export type IntegrationMethod = 'webhook' | 'api' | 'plugin' | 'native' | 'mcp';

export interface IntegrationInfo {
  target: string;
  method: IntegrationMethod;
  infraComponents: InfraNodeType[];
  protocol?: string;
  description: string;
  descriptionKo: string;
}

// ---------------------------------------------------------------------------
// Scale-Up Path
// ---------------------------------------------------------------------------

export interface ScaleUpPath {
  trigger: string;
  triggerKo: string;
  from: InfraNodeType[];
  to: InfraNodeType[];
  cloudServices: string[];
  reason: string;
  reasonKo: string;
}

// ---------------------------------------------------------------------------
// Product Intelligence (main entity)
// ---------------------------------------------------------------------------

export interface ProductIntelligence {
  id: string;
  productId: string;
  name: string;
  nameKo: string;
  category: PICategory;
  sourceUrl: string;
  deploymentProfiles: DeploymentProfile[];
  integrations: IntegrationInfo[];
  scaleUpPaths: ScaleUpPath[];
  embeddingText: string;
  embeddingTextKo: string;
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/knowledge/productIntelligence/__tests__/types.test.ts`
Expected: PASS

**Step 5: Type check**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 6: Commit**

```bash
git add src/lib/knowledge/productIntelligence/types.ts src/lib/knowledge/productIntelligence/__tests__/types.test.ts
git commit -m "feat(pi): add Product Intelligence type definitions"
```

---

## Task 3: AI Assistant PI Data (OpenClaw, Open WebUI, Jan.ai, etc.)

**Files:**
- Create: `src/lib/knowledge/productIntelligence/aiAssistants.ts`
- Test: `src/lib/knowledge/productIntelligence/__tests__/aiAssistants.test.ts`

**Step 1: Write the failing test**

```typescript
// src/lib/knowledge/productIntelligence/__tests__/aiAssistants.test.ts
import { describe, it, expect } from 'vitest';
import { aiAssistantProducts } from '../aiAssistants';

describe('AI Assistant Product Intelligence', () => {
  it('should have at least 5 products', () => {
    expect(aiAssistantProducts.length).toBeGreaterThanOrEqual(5);
  });

  it('should have unique IDs', () => {
    const ids = aiAssistantProducts.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should all be ai-assistant category', () => {
    for (const p of aiAssistantProducts) {
      expect(p.category).toBe('ai-assistant');
    }
  });

  it('should have bilingual fields', () => {
    for (const p of aiAssistantProducts) {
      expect(p.nameKo).toBeTruthy();
      expect(p.embeddingTextKo).toBeTruthy();
    }
  });

  it('should have at least one deployment profile each', () => {
    for (const p of aiAssistantProducts) {
      expect(p.deploymentProfiles.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should have non-empty infraComponents in each deployment profile', () => {
    for (const p of aiAssistantProducts) {
      for (const dp of p.deploymentProfiles) {
        expect(dp.infraComponents.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have valid sourceUrl', () => {
    for (const p of aiAssistantProducts) {
      expect(p.sourceUrl).toMatch(/^https?:\/\//);
    }
  });

  it('should have non-empty embeddingText', () => {
    for (const p of aiAssistantProducts) {
      expect(p.embeddingText.length).toBeGreaterThan(20);
    }
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/knowledge/productIntelligence/__tests__/aiAssistants.test.ts`
Expected: FAIL — module `../aiAssistants` not found

**Step 3: Write the implementation**

Create `src/lib/knowledge/productIntelligence/aiAssistants.ts` with at least 5 AI assistant products: OpenClaw, Open WebUI, Jan.ai, LobeChat, Anything LLM. Each must include:
- At least 1 deployment profile (desktop/mobile/server)
- Integration info (Slack, Ollama, etc.)
- Scale-up paths
- Bilingual fields (English + Korean)
- `embeddingText` combining name + description + platforms + use cases

**Reference data sources:**
- OpenClaw: https://openclaw.ai/ (crawl via WebFetch if needed)
- Open WebUI: https://github.com/open-webui/open-webui
- Jan.ai: https://jan.ai/
- LobeChat: https://github.com/lobehub/lobe-chat
- Anything LLM: https://github.com/Mintplex-Labs/anything-llm

For each product, derive `infraComponents` by mapping deployment requirements to InfraNodeType values using the SSoT at `src/lib/data/infrastructureDB.ts`. Typical mappings:
- Desktop app → `app-server`
- GPU server → `gpu-server`, `inference-engine`
- Docker deployment → `container`
- Mobile/Termux → `edge-device`, `mobile-device`
- Cloud deployment → `ai-cluster`, `kubernetes`, `load-balancer`

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/knowledge/productIntelligence/__tests__/aiAssistants.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/knowledge/productIntelligence/aiAssistants.ts src/lib/knowledge/productIntelligence/__tests__/aiAssistants.test.ts
git commit -m "feat(pi): add AI assistant product intelligence data"
```

---

## Task 4: AI Inference PI Data (Ollama, vLLM, llama.cpp, etc.)

**Files:**
- Create: `src/lib/knowledge/productIntelligence/aiInference.ts`
- Test: `src/lib/knowledge/productIntelligence/__tests__/aiInference.test.ts`

Same test pattern as Task 3 but with `category: 'ai-inference'`. Include at least 6 products: Ollama, vLLM, llama.cpp, TGI (Text Generation Inference), LocalAI, LM Studio.

**Reference:** Existing `src/lib/knowledge/aiCatalog/inferenceEngines.ts` has basic AISoftware data for these — extend with deployment profiles, integration info, and scale-up paths.

**Key deployment profiles to capture:**
- Ollama: desktop (macOS/Linux/Windows), server (Docker), mobile (limited)
- vLLM: server only (CUDA required), cloud (AWS/GCP GPU instances)
- llama.cpp: desktop (all OS, CPU-only possible), edge (Raspberry Pi), mobile (Android/iOS)

**Test structure:** Same as Task 3 but `category: 'ai-inference'`, minimum 6 products.

**Commit:** `git commit -m "feat(pi): add AI inference product intelligence data"`

---

## Task 5: AI Framework & Vector DB PI Data

**Files:**
- Create: `src/lib/knowledge/productIntelligence/aiFrameworks.ts`
- Create: `src/lib/knowledge/productIntelligence/vectorDbs.ts`
- Test: `src/lib/knowledge/productIntelligence/__tests__/aiFrameworks.test.ts`
- Test: `src/lib/knowledge/productIntelligence/__tests__/vectorDbs.test.ts`

**AI Frameworks (at least 4):** LangChain, LlamaIndex, Haystack, Semantic Kernel

**Vector DBs (at least 5):** ChromaDB, Pinecone, Milvus, Weaviate, Qdrant

**Key data to capture:**
- LangChain: pip install, Docker, integrates with dozens of LLMs/vector DBs
- ChromaDB: local (pip), server (Docker), cloud (Chroma Cloud)
- Pinecone: SaaS only, API-based

**Test structure:** Same pattern — unique IDs, bilingual, deployment profiles, infraComponents.

**Commit:** `git commit -m "feat(pi): add AI framework and vector DB product intelligence"`

---

## Task 6: Cloud & Communication PI Data

**Files:**
- Create: `src/lib/knowledge/productIntelligence/cloudCompute.ts`
- Create: `src/lib/knowledge/productIntelligence/integrations.ts`
- Test: `src/lib/knowledge/productIntelligence/__tests__/cloudCompute.test.ts`
- Test: `src/lib/knowledge/productIntelligence/__tests__/integrations.test.ts`

**Cloud Compute (at least 6):** AWS Lambda, AWS ECS, AWS SageMaker, GCP Cloud Run, GCP Vertex AI, Azure Container Apps

Map these to existing cloud services in `src/lib/knowledge/cloudCatalog/`. Use existing service IDs (e.g., `AWS-CMP-005` for SageMaker).

**Communication/Integration Products (at least 5):** Slack, Discord, GitHub Actions, Microsoft Teams, n8n

**Key data for integrations:**
- Slack: webhook (HTTPS), Slack App (API), Bot (WebSocket)
  - `infraComponents`: `api-gateway` for webhook; `app-server` for bot
- Discord: Bot API (WebSocket), webhook (HTTPS)
- GitHub Actions: API trigger (HTTPS), runner (compute)
  - `infraComponents`: `container`, `app-server`

**Test structure:** Same pattern.

**Commit:** `git commit -m "feat(pi): add cloud compute and integration product intelligence"`

---

## Task 7: Product Intelligence Index & Query Helpers

**Files:**
- Create: `src/lib/knowledge/productIntelligence/queryHelpers.ts`
- Create: `src/lib/knowledge/productIntelligence/index.ts`
- Test: `src/lib/knowledge/productIntelligence/__tests__/queryHelpers.test.ts`

**Step 1: Write the failing test**

```typescript
// src/lib/knowledge/productIntelligence/__tests__/queryHelpers.test.ts
import { describe, it, expect } from 'vitest';
import {
  allProductIntelligence,
  getPIByCategory,
  searchPI,
  getPIForProduct,
  getDeploymentProfiles,
  getIntegrationsFor,
  getScaleUpPaths,
} from '../index';

describe('Product Intelligence Query Helpers', () => {
  it('should have at least 25 total PI entries', () => {
    expect(allProductIntelligence.length).toBeGreaterThanOrEqual(25);
  });

  it('should have unique IDs', () => {
    const ids = allProductIntelligence.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should filter by category', () => {
    const assistants = getPIByCategory('ai-assistant');
    expect(assistants.length).toBeGreaterThanOrEqual(5);
    assistants.forEach(p => expect(p.category).toBe('ai-assistant'));
  });

  it('should search by name (English)', () => {
    const results = searchPI('ollama');
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it('should search by name (Korean)', () => {
    const results = searchPI('올라마');
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it('should find PI by productId', () => {
    const results = getPIForProduct('AI-INF-001');
    // At least one PI entry should reference an existing aiCatalog product
    // (may be 0 if productId doesn't match — that's also valid)
    expect(results).toBeInstanceOf(Array);
  });

  it('should get deployment profiles for a platform', () => {
    const desktopProfiles = getDeploymentProfiles('desktop');
    expect(desktopProfiles.length).toBeGreaterThanOrEqual(3);
    desktopProfiles.forEach(dp =>
      expect(dp.profile.platform).toBe('desktop'),
    );
  });

  it('should get integrations for a target', () => {
    const slackIntegrations = getIntegrationsFor('slack');
    expect(slackIntegrations.length).toBeGreaterThanOrEqual(1);
  });

  it('should get scale-up paths', () => {
    const paths = getScaleUpPaths();
    expect(paths.length).toBeGreaterThanOrEqual(3);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/knowledge/productIntelligence/__tests__/queryHelpers.test.ts`
Expected: FAIL — module not found

**Step 3: Write queryHelpers.ts**

```typescript
// src/lib/knowledge/productIntelligence/queryHelpers.ts
import type { ProductIntelligence, PICategory, DeploymentPlatform, DeploymentProfile, IntegrationInfo, ScaleUpPath } from './types';
import { allProductIntelligence } from './index';

export function getPIByCategory(category: PICategory): ProductIntelligence[] {
  return allProductIntelligence.filter(p => p.category === category);
}

export function searchPI(query: string): ProductIntelligence[] {
  const lowerQuery = query.toLowerCase();
  return allProductIntelligence.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.nameKo.includes(query) ||
    p.embeddingText.toLowerCase().includes(lowerQuery) ||
    p.embeddingTextKo.includes(query)
  );
}

export function getPIForProduct(productId: string): ProductIntelligence[] {
  return allProductIntelligence.filter(p => p.productId === productId);
}

export interface DeploymentProfileWithProduct {
  product: ProductIntelligence;
  profile: DeploymentProfile;
}

export function getDeploymentProfiles(platform: DeploymentPlatform): DeploymentProfileWithProduct[] {
  const results: DeploymentProfileWithProduct[] = [];
  for (const p of allProductIntelligence) {
    for (const dp of p.deploymentProfiles) {
      if (dp.platform === platform) {
        results.push({ product: p, profile: dp });
      }
    }
  }
  return results;
}

export interface IntegrationWithProduct {
  product: ProductIntelligence;
  integration: IntegrationInfo;
}

export function getIntegrationsFor(target: string): IntegrationWithProduct[] {
  const lowerTarget = target.toLowerCase();
  const results: IntegrationWithProduct[] = [];
  for (const p of allProductIntelligence) {
    for (const intg of p.integrations) {
      if (intg.target.toLowerCase() === lowerTarget) {
        results.push({ product: p, integration: intg });
      }
    }
  }
  return results;
}

export interface ScaleUpPathWithProduct {
  product: ProductIntelligence;
  path: ScaleUpPath;
}

export function getScaleUpPaths(): ScaleUpPathWithProduct[] {
  const results: ScaleUpPathWithProduct[] = [];
  for (const p of allProductIntelligence) {
    for (const sp of p.scaleUpPaths) {
      results.push({ product: p, path: sp });
    }
  }
  return results;
}
```

**Step 4: Write index.ts**

```typescript
// src/lib/knowledge/productIntelligence/index.ts
export type {
  ProductIntelligence, PICategory, DeploymentProfile, DeploymentPlatform,
  IntegrationInfo, IntegrationMethod, ScaleUpPath, ResourceRequirements,
} from './types';

import type { ProductIntelligence } from './types';
import { aiAssistantProducts } from './aiAssistants';
import { aiInferenceProducts } from './aiInference';
import { aiFrameworkProducts } from './aiFrameworks';
import { vectorDbProducts } from './vectorDbs';
import { cloudComputeProducts } from './cloudCompute';
import { integrationProducts } from './integrations';

export const allProductIntelligence: readonly ProductIntelligence[] = Object.freeze([
  ...aiAssistantProducts,
  ...aiInferenceProducts,
  ...aiFrameworkProducts,
  ...vectorDbProducts,
  ...cloudComputeProducts,
  ...integrationProducts,
]);

export {
  getPIByCategory,
  searchPI,
  getPIForProduct,
  getDeploymentProfiles,
  getIntegrationsFor,
  getScaleUpPaths,
} from './queryHelpers';
export type {
  DeploymentProfileWithProduct,
  IntegrationWithProduct,
  ScaleUpPathWithProduct,
} from './queryHelpers';
```

**Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/knowledge/productIntelligence/__tests__/queryHelpers.test.ts`
Expected: PASS

**Step 6: Run all PI tests**

Run: `npx vitest run src/lib/knowledge/productIntelligence/`
Expected: ALL PASS

**Step 7: Type check**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 8: Commit**

```bash
git add src/lib/knowledge/productIntelligence/queryHelpers.ts src/lib/knowledge/productIntelligence/index.ts src/lib/knowledge/productIntelligence/__tests__/queryHelpers.test.ts
git commit -m "feat(pi): add PI index and query helpers"
```

---

## Task 8: RAG Types & ChromaDB Client

**Files:**
- Create: `src/lib/rag/types.ts`
- Create: `src/lib/rag/chromaClient.ts`
- Test: `src/lib/rag/__tests__/chromaClient.test.ts`

**Step 1: Write the failing test**

```typescript
// src/lib/rag/__tests__/chromaClient.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { RAGCollectionConfig, RAGConfig } from '../types';

// Note: ChromaDB tests mock the actual client to avoid requiring a running ChromaDB server.
// Integration tests with real ChromaDB are in a separate test file.

describe('RAG Types', () => {
  it('should define RAGConfig with required fields', () => {
    const config: RAGConfig = {
      persistDirectory: '.chroma',
      embeddingModel: 'text-embedding-ada-002',
      defaultTopK: 10,
      similarityThreshold: 0.7,
    };
    expect(config.defaultTopK).toBe(10);
  });

  it('should define collection configs', () => {
    const collection: RAGCollectionConfig = {
      name: 'infraflow-ai-software',
      description: 'AI software products',
      metadataFields: ['category', 'license'],
    };
    expect(collection.name).toContain('infraflow');
  });
});

describe('ChromaDB Client', () => {
  it('should export getChromaClient function', async () => {
    const { getChromaClient } = await import('../chromaClient');
    expect(getChromaClient).toBeInstanceOf(Function);
  });

  it('should export COLLECTIONS constant', async () => {
    const { COLLECTIONS } = await import('../chromaClient');
    expect(COLLECTIONS.aiSoftware).toBe('infraflow-ai-software');
    expect(COLLECTIONS.cloudServices).toBe('infraflow-cloud-services');
    expect(COLLECTIONS.deploymentScenarios).toBe('infraflow-deployment-scenarios');
    expect(COLLECTIONS.integrationPatterns).toBe('infraflow-integration-patterns');
  });

  it('should export isChromaAvailable function', async () => {
    const { isChromaAvailable } = await import('../chromaClient');
    expect(isChromaAvailable).toBeInstanceOf(Function);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/rag/__tests__/chromaClient.test.ts`
Expected: FAIL — modules not found

**Step 3: Write types.ts**

```typescript
// src/lib/rag/types.ts
/**
 * RAG (Retrieval-Augmented Generation) Types
 */

export interface RAGConfig {
  persistDirectory: string;
  embeddingModel: string;
  defaultTopK: number;
  similarityThreshold: number;
}

export interface RAGCollectionConfig {
  name: string;
  description: string;
  metadataFields: string[];
}

export interface RAGDocument {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  score: number;
  collection: string;
}

export interface RAGSearchResult {
  documents: RAGDocument[];
  totalResults: number;
  queryTimeMs: number;
}

export interface RAGSearchOptions {
  topK?: number;
  collections?: string[];
  filters?: Record<string, unknown>;
  similarityThreshold?: number;
}
```

**Step 4: Write chromaClient.ts**

```typescript
// src/lib/rag/chromaClient.ts
/**
 * ChromaDB Client — Connection management and collection configuration.
 *
 * Provides a singleton ChromaDB client with graceful degradation
 * when ChromaDB is not available (dev mode without ChromaDB server).
 */

import { createLogger } from '@/lib/utils/logger';

const log = createLogger('ChromaClient');

export const COLLECTIONS = {
  aiSoftware: 'infraflow-ai-software',
  cloudServices: 'infraflow-cloud-services',
  deploymentScenarios: 'infraflow-deployment-scenarios',
  integrationPatterns: 'infraflow-integration-patterns',
} as const;

export const RAG_CONFIG = {
  persistDirectory: process.env.CHROMA_PERSIST_DIR || '.chroma',
  embeddingModel: 'text-embedding-ada-002',
  defaultTopK: 10,
  similarityThreshold: 0.7,
};

let chromaClientInstance: unknown = null;
let chromaAvailable: boolean | null = null;

/**
 * Get or create a ChromaDB client instance.
 * Returns null if ChromaDB is not available.
 */
export async function getChromaClient(): Promise<unknown> {
  if (chromaClientInstance) return chromaClientInstance;

  try {
    const { ChromaClient } = await import('chromadb');
    chromaClientInstance = new ChromaClient();
    chromaAvailable = true;
    log.debug('ChromaDB client initialized');
    return chromaClientInstance;
  } catch (error) {
    chromaAvailable = false;
    log.warn('ChromaDB not available, RAG features disabled', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Check if ChromaDB is available without creating a connection.
 */
export async function isChromaAvailable(): Promise<boolean> {
  if (chromaAvailable !== null) return chromaAvailable;
  const client = await getChromaClient();
  return client !== null;
}

/**
 * Reset client (for testing).
 */
export function resetChromaClient(): void {
  chromaClientInstance = null;
  chromaAvailable = null;
}
```

**Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/rag/__tests__/chromaClient.test.ts`
Expected: PASS

**Step 6: Type check**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 7: Commit**

```bash
git add src/lib/rag/types.ts src/lib/rag/chromaClient.ts src/lib/rag/__tests__/chromaClient.test.ts
git commit -m "feat(rag): add RAG types and ChromaDB client wrapper"
```

---

## Task 9: Embedding Generator

**Files:**
- Create: `src/lib/rag/embeddings.ts`
- Test: `src/lib/rag/__tests__/embeddings.test.ts`

**Step 1: Write the failing test**

```typescript
// src/lib/rag/__tests__/embeddings.test.ts
import { describe, it, expect, vi } from 'vitest';
import { generateEmbedding, generateEmbeddings, buildEmbeddingText } from '../embeddings';

// Mock OpenAI to avoid actual API calls
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    embeddings: {
      create: vi.fn().mockResolvedValue({
        data: [{ embedding: new Array(1536).fill(0.1) }],
      }),
    },
  })),
}));

describe('Embedding Generator', () => {
  it('should generate embedding for a single text', async () => {
    const result = await generateEmbedding('test text');
    expect(result).toHaveLength(1536);
  });

  it('should generate embeddings for multiple texts', async () => {
    const results = await generateEmbeddings(['text1', 'text2']);
    expect(results).toHaveLength(2);
  });

  it('should build embedding text from PI data', () => {
    const text = buildEmbeddingText({
      name: 'Ollama',
      description: 'Local LLM runner',
      platforms: ['desktop', 'server'],
      useCases: ['inference', 'development'],
    });
    expect(text).toContain('Ollama');
    expect(text).toContain('Local LLM runner');
    expect(text).toContain('desktop');
    expect(text).toContain('inference');
  });

  it('should handle empty text gracefully', async () => {
    const result = await generateEmbedding('');
    expect(result).toHaveLength(1536);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/rag/__tests__/embeddings.test.ts`
Expected: FAIL

**Step 3: Write embeddings.ts**

```typescript
// src/lib/rag/embeddings.ts
/**
 * Embedding Generator — Creates vector embeddings for RAG search.
 *
 * Uses OpenAI's text-embedding-ada-002 model by default.
 * Falls back gracefully when OpenAI API key is not configured.
 */

import { createLogger } from '@/lib/utils/logger';

const log = createLogger('Embeddings');

const EMBEDDING_MODEL = 'text-embedding-ada-002';
const EMBEDDING_DIMENSION = 1536;

/**
 * Generate embedding for a single text.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const results = await generateEmbeddings([text]);
  return results[0];
}

/**
 * Generate embeddings for multiple texts (batch).
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const OpenAI = (await import('openai')).default;
    const client = new OpenAI();

    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: texts.map(t => t || ' '), // OpenAI requires non-empty input
    });

    return response.data.map(d => d.embedding);
  } catch (error) {
    log.warn('Embedding generation failed, returning zero vectors', {
      error: error instanceof Error ? error.message : String(error),
    });
    // Return zero vectors as fallback (enables graceful degradation)
    return texts.map(() => new Array(EMBEDDING_DIMENSION).fill(0));
  }
}

/**
 * Build embedding text from structured product data.
 * Combines key fields into a single searchable string.
 */
export function buildEmbeddingText(data: {
  name: string;
  description: string;
  platforms?: string[];
  useCases?: string[];
}): string {
  const parts = [data.name, data.description];
  if (data.platforms?.length) parts.push(data.platforms.join(' '));
  if (data.useCases?.length) parts.push(data.useCases.join(' '));
  return parts.join(' ');
}
```

**Step 4: Run test**

Run: `npx vitest run src/lib/rag/__tests__/embeddings.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/rag/embeddings.ts src/lib/rag/__tests__/embeddings.test.ts
git commit -m "feat(rag): add embedding generator with OpenAI ada-002"
```

---

## Task 10: RAG Indexer

**Files:**
- Create: `src/lib/rag/indexer.ts`
- Test: `src/lib/rag/__tests__/indexer.test.ts`

The indexer converts existing catalog data (aiCatalog, cloudCatalog) and PI data into ChromaDB documents.

**Key functions:**
- `indexAISoftware()` — Converts `allAISoftware` → ChromaDB documents
- `indexCloudServices()` — Converts `CLOUD_SERVICES` → ChromaDB documents
- `indexProductIntelligence()` — Converts PI data → deployment/integration documents
- `indexAll()` — Runs all indexing jobs

**Test approach:** Mock ChromaDB client and verify correct document structure is passed to `collection.add()`.

**Commit:** `git commit -m "feat(rag): add catalog data indexer for ChromaDB"`

---

## Task 11: RAG Retriever

**Files:**
- Create: `src/lib/rag/retriever.ts`
- Test: `src/lib/rag/__tests__/retriever.test.ts`

**Key function:**

```typescript
export async function searchProductIntelligence(
  query: string,
  options?: RAGSearchOptions,
): Promise<RAGSearchResult>
```

**Implementation:**
1. Generate embedding for query text
2. Search across configured collections (ai-software, cloud-services, deployment-scenarios, integration-patterns)
3. Merge results by score, apply similarity threshold
4. Return top-K documents with metadata

**Graceful degradation:** When ChromaDB is not available, fall back to simple keyword search against `allProductIntelligence` using the existing `searchPI()` function. This ensures InfraFlow works without ChromaDB running.

**Test approach:** Mock ChromaDB collection.query() and verify correct query parameters and result transformation.

**Commit:** `git commit -m "feat(rag): add RAG retriever with graceful fallback"`

---

## Task 12: RAG Public API

**Files:**
- Create: `src/lib/rag/index.ts`
- Test: `src/lib/rag/__tests__/index.test.ts`

```typescript
// src/lib/rag/index.ts
export type { RAGConfig, RAGCollectionConfig, RAGDocument, RAGSearchResult, RAGSearchOptions } from './types';
export { COLLECTIONS, RAG_CONFIG, isChromaAvailable } from './chromaClient';
export { generateEmbedding, buildEmbeddingText } from './embeddings';
export { indexAll, indexAISoftware, indexCloudServices, indexProductIntelligence } from './indexer';
export { searchProductIntelligence } from './retriever';
```

**Test:** Import all exports and verify they are functions/objects.

**Also run full test suite:**

Run: `npx vitest run src/lib/rag/`
Expected: ALL PASS

**Commit:** `git commit -m "feat(rag): add public API index"`

---

## Task 13: Integrate RAG into enrichContext Pipeline

**Files:**
- Modify: `src/lib/knowledge/types.ts:265-273` — Add `productIntelligence` field to `EnrichedKnowledge`
- Modify: `src/lib/knowledge/contextEnricher.ts:176-275` — Add PI section to `buildKnowledgePromptSection`
- Test: Update `src/lib/knowledge/__tests__/contextEnricher.test.ts`

**Step 1: Add productIntelligence to EnrichedKnowledge**

In `src/lib/knowledge/types.ts`, add after line 272 (before the closing `}`):

```typescript
  /** Product Intelligence data from RAG search (optional) */
  productIntelligence?: import('../rag/types').RAGDocument[];
```

**Step 2: Add PI section builder to contextEnricher.ts**

Add a new internal helper `buildProductIntelligenceLines(enriched)` that formats RAG documents into the prompt section. Add the new section to `buildKnowledgePromptSection()` after the compliance gap section:

```typescript
// After buildComplianceGapLines section in buildKnowledgePromptSection:
const piLines = buildProductIntelligenceLines(enriched);
if (piLines.length > 0) {
  sections.push('### 📦 관련 제품 & 배포 정보');
  for (const line of piLines) {
    sections.push(line);
  }
  sections.push('');
}
```

The `buildProductIntelligenceLines` function should:
- Format each RAG document's content as a bullet point
- Include metadata (collection source, score)
- Limit to top 10 to avoid prompt bloat

**Step 3: Write test for new PI section**

```typescript
it('should include PI section when productIntelligence is provided', () => {
  const enriched: EnrichedKnowledge = {
    relationships: [],
    violations: [],
    suggestions: [],
    risks: [],
    tips: [],
    productIntelligence: [
      {
        id: 'test-1',
        content: 'OpenClaw: desktop AI assistant with Ollama backend',
        metadata: { category: 'ai-assistant' },
        score: 0.92,
        collection: 'infraflow-ai-software',
      },
    ],
  };
  const result = buildKnowledgePromptSection(enriched);
  expect(result).toContain('관련 제품');
  expect(result).toContain('OpenClaw');
});
```

**Step 4: Run tests**

Run: `npx vitest run src/lib/knowledge/__tests__/contextEnricher.test.ts`
Expected: ALL PASS

**Step 5: Type check**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 6: Commit**

```bash
git add src/lib/knowledge/types.ts src/lib/knowledge/contextEnricher.ts src/lib/knowledge/__tests__/contextEnricher.test.ts
git commit -m "feat(rag): integrate Product Intelligence into enrichContext pipeline"
```

---

## Task 14: Integrate RAG into LLM Route

**Files:**
- Modify: `src/app/api/llm/route.ts:211-260` — Add RAG search to `buildEnrichedSystemPrompt`
- Test: `src/app/api/llm/__tests__/route.test.ts` (existing — add new tests)

**Step 1: Modify buildEnrichedSystemPrompt to call RAG**

Change `buildEnrichedSystemPrompt` from sync to async. Add RAG search call before enrichContext:

```typescript
export async function buildEnrichedSystemPrompt(prompt: string): Promise<string> {
  try {
    const nodeTypes = extractNodeTypesFromPrompt(prompt);

    // NEW: RAG search for Product Intelligence
    let piDocuments: RAGDocument[] = [];
    try {
      const { searchProductIntelligence } = await import('@/lib/rag');
      const ragResult = await searchProductIntelligence(prompt, { topK: 10 });
      piDocuments = ragResult.documents;
    } catch (ragError) {
      log.debug('RAG search skipped (ChromaDB not available)', {
        error: ragError instanceof Error ? ragError.message : String(ragError),
      });
    }

    // ... existing DiagramContext building ...

    const enriched = enrichContext(context, [...RELATIONSHIPS], {
      antiPatterns: [...ANTI_PATTERNS],
      failureScenarios: [...FAILURES],
    });

    // Inject PI documents into enriched result
    if (piDocuments.length > 0) {
      (enriched as { productIntelligence?: RAGDocument[] }).productIntelligence = piDocuments;
    }

    // ... rest is same ...
  }
}
```

**Step 2: Update callers — the POST handler calls `await buildEnrichedSystemPrompt(prompt)`**

Change line ~486: `const enrichedPrompt = buildEnrichedSystemPrompt(prompt)` → `const enrichedPrompt = await buildEnrichedSystemPrompt(prompt)`

**Step 3: Add tests**

```typescript
it('should work without ChromaDB (graceful degradation)', async () => {
  // Existing tests should still pass — RAG is optional
  const result = buildEnrichedSystemPrompt('firewall and VPN setup');
  // If async, await it
  const prompt = await result;
  expect(prompt).toContain('firewall');
});
```

**Step 4: Run ALL tests to ensure no regressions**

Run: `npx tsc --noEmit && npx vitest run`
Expected: ALL PASS — this is critical since we're modifying the core LLM pipeline

**Step 5: Commit**

```bash
git add src/app/api/llm/route.ts src/app/api/llm/__tests__/route.test.ts
git commit -m "feat(rag): integrate RAG search into LLM route"
```

---

## Task 15: AVAILABLE_COMPONENTS Update

**Files:**
- Modify: `src/lib/parser/prompts.ts:8-20` — Add ai-compute and ai-service categories to AVAILABLE_COMPONENTS

**Step 1: Add AI categories**

```typescript
export const AVAILABLE_COMPONENTS: Record<string, InfraNodeType[]> = {
  // ... existing categories ...
  'ai-compute': ['gpu-server', 'ai-accelerator', 'edge-device', 'mobile-device', 'ai-cluster', 'model-registry'],
  'ai-service': ['inference-engine', 'vector-db', 'ai-gateway', 'ai-orchestrator', 'embedding-service', 'training-platform', 'prompt-manager', 'ai-monitor'],
};
```

This ensures the LLM knows about AI node types when generating infrastructure specs.

**Step 2: Update KEYWORD_ALIASES in route.ts**

Add AI-relevant keywords to the alias map in `src/app/api/llm/route.ts`:

```typescript
// Add to KEYWORD_ALIASES:
ollama: 'inference-engine',
vllm: 'inference-engine',
'llama.cpp': 'inference-engine',
gpu: 'gpu-server',
chromadb: 'vector-db',
pinecone: 'vector-db',
langchain: 'ai-orchestrator',
llamaindex: 'ai-orchestrator',
mlflow: 'ai-monitor',
slack: 'api-gateway',    // Slack integration needs API gateway
discord: 'api-gateway',
termux: 'mobile-device',
```

**Step 3: Run tests**

Run: `npx tsc --noEmit && npx vitest run`
Expected: ALL PASS

**Step 4: Commit**

```bash
git add src/lib/parser/prompts.ts src/app/api/llm/route.ts
git commit -m "feat: add AI node types to AVAILABLE_COMPONENTS and keyword aliases"
```

---

## Task 16: Knowledge Index Export Update

**Files:**
- Modify: `src/lib/knowledge/index.ts` — Add PI exports

**Step 1: Add exports**

Add to the end of `src/lib/knowledge/index.ts`:

```typescript
// Product Intelligence
export {
  allProductIntelligence,
  getPIByCategory,
  searchPI,
  getPIForProduct,
  getDeploymentProfiles,
  getIntegrationsFor,
  getScaleUpPaths,
} from './productIntelligence';
export type {
  ProductIntelligence,
  PICategory,
  DeploymentProfile,
  IntegrationInfo,
  ScaleUpPath,
} from './productIntelligence';
```

**Step 2: Run tests**

Run: `npx tsc --noEmit && npx vitest run`
Expected: ALL PASS

**Step 3: Commit**

```bash
git add src/lib/knowledge/index.ts
git commit -m "feat: export Product Intelligence from knowledge index"
```

---

## Task 17: Full Verification & Documentation

**Files:**
- Modify: `docs/INFRASTRUCTURE_COMPONENTS.md` — Add Product Intelligence section
- Create: `.claude/rules/product-intelligence-rules.md` — PI quality rules

**Step 1: Full verification**

Run:
```bash
npx tsc --noEmit && npx vitest run
```
Expected: ALL PASS. If any test fails, fix it before proceeding.

**Step 2: Count new tests**

Run: `npx vitest run --reporter=verbose 2>&1 | grep -c "✓"`

Document the count.

**Step 3: Update INFRASTRUCTURE_COMPONENTS.md**

Add a new section for Product Intelligence / RAG features.

**Step 4: Create PI quality rules**

```markdown
# Product Intelligence Rules

## PI-001: Required Fields
Every ProductIntelligence entry must have: id, productId, name, nameKo, category, sourceUrl, deploymentProfiles (≥1), embeddingText, embeddingTextKo.

## PI-002: Deployment Profile Completeness
Each DeploymentProfile must have: platform, os (≥1), installMethod, infraComponents (≥1).

## PI-003: Bilingual Requirement
All user-facing strings must have English and Korean versions.

## PI-004: InfraComponent Validity
All infraComponents values must be valid InfraNodeType values from infrastructureDB.

## PI-005: EmbeddingText Quality
embeddingText must combine: product name + description + key platforms + primary use cases. Minimum 20 characters.

## PI-006: Source URL
sourceUrl must be a valid URL (https:// preferred) pointing to official product page or repository.
```

**Step 5: Commit**

```bash
git add docs/INFRASTRUCTURE_COMPONENTS.md .claude/rules/product-intelligence-rules.md
git commit -m "docs: add Product Intelligence rules and documentation"
```

---

## Summary

| Task | Description | Est. Steps | Files |
|------|-------------|-----------|-------|
| 1 | Install dependencies | 3 | package.json |
| 2 | PI types | 6 | types.ts, types.test.ts |
| 3 | AI Assistant data | 5 | aiAssistants.ts, test |
| 4 | AI Inference data | 5 | aiInference.ts, test |
| 5 | AI Framework + Vector DB data | 5 | aiFrameworks.ts, vectorDbs.ts, tests |
| 6 | Cloud + Communication data | 5 | cloudCompute.ts, integrations.ts, tests |
| 7 | PI index + query helpers | 8 | queryHelpers.ts, index.ts, test |
| 8 | RAG types + ChromaDB client | 7 | types.ts, chromaClient.ts, test |
| 9 | Embedding generator | 5 | embeddings.ts, test |
| 10 | RAG indexer | 5 | indexer.ts, test |
| 11 | RAG retriever | 5 | retriever.ts, test |
| 12 | RAG public API | 3 | index.ts, test |
| 13 | Integrate RAG into enrichContext | 6 | types.ts, contextEnricher.ts, test |
| 14 | Integrate RAG into LLM route | 5 | route.ts, test |
| 15 | AVAILABLE_COMPONENTS + aliases | 4 | prompts.ts, route.ts |
| 16 | Knowledge index exports | 3 | index.ts |
| 17 | Verification + documentation | 5 | docs, rules |

**Total: ~85 steps across 17 tasks**
**New files: ~20**
**Modified files: ~6**
**Expected new tests: ~100+**
