# Korean CSP Cloud Service Catalog Integration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Korean Cloud Service Provider (CSP) catalogs to InfraFlow with parity to AWS/Azure/GCP structure

**Architecture:** Extend existing `cloudCatalog` module with 4 new Korean providers (Naver Cloud Platform, Kakao Cloud, KT Cloud, NHN Cloud), following flat-structure pattern with Korean-first bilingual support.

**Tech Stack:** TypeScript, Zod schemas, Vitest, Web scraping (WebFetch), Provider adapter pattern

**Research Summary:**
- **Naver Cloud Platform (NCP)**: 170+ services across 16 categories (Compute, Storage, Networking, Database, Security, AI Service, etc.)
- **Kakao Cloud**: GPU instances, VPC/on-premises integration, Public/Private/Installable forms
- **KT Cloud**: IaaS/PaaS/SaaS services across Compute, Storage, DB, Network, Security, AI, CDN categories
- **NHN Cloud**: 200+ services across 25+ categories (specialized in Game, AI, RCS messaging, GPU infrastructure)

---

## Phase 1: Research & Data Collection

### Task 1.1: NCP Service Catalog Data Collection

**Files:**
- Create: `docs/research/2026-02-26-ncp-service-catalog.md`

**Step 1: Extract NCP service catalog**

Use WebFetch to extract structured service data from Naver Cloud Platform.

**Step 2: Document NCP services by category**

Create research document with:
- 16 service categories
- 170+ services mapped to InfraNodeType
- Bilingual names (Korean primary, English translation)
- Architecture roles for each service
- Pricing tier estimates
- SLA information (where available)

**Step 3: Identify InfraNodeType mappings**

Map each NCP service to existing InfraNodeType or flag for new type creation:
- Server → `web-server` / `app-server`
- VPC → `aws-vpc` (will create `ncp-vpc`)
- Cloud DB → `db-server`
- Object Storage → `object-storage`
- Load Balancer → `load-balancer`
- etc.

**Step 4: Commit research**

```bash
git add docs/research/2026-02-26-ncp-service-catalog.md
git commit -m "docs: add NCP service catalog research

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 1.2: Kakao Cloud Service Catalog Data Collection

**Files:**
- Create: `docs/research/2026-02-26-kakao-cloud-service-catalog.md`

**Step 1: Research Kakao Cloud services**

Use WebSearch + WebFetch to gather:
- GPU instance types and pricing
- VPC/network services
- Storage services
- Database offerings
- Security services
- AI/ML services

**Step 2: Document service mappings**

Create structured document with:
- Service categories
- InfraNodeType mappings
- Bilingual service names
- Architecture roles
- Pricing information

**Step 3: Commit research**

```bash
git add docs/research/2026-02-26-kakao-cloud-service-catalog.md
git commit -m "docs: add Kakao Cloud service catalog research

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 1.3: KT Cloud Service Catalog Data Collection

**Files:**
- Create: `docs/research/2026-02-26-kt-cloud-service-catalog.md`

**Step 1: Research KT Cloud services**

Gather comprehensive service data across:
- Compute (IaaS)
- Storage
- Database (DB, WAS)
- Network
- Security (WAF)
- AI
- CDN
- Blockchain/IoT/BigData
- Enterprise
- Management

**Step 2: Document service catalog**

Create structured catalog with InfraNodeType mappings and bilingual metadata.

**Step 3: Commit research**

```bash
git add docs/research/2026-02-26-kt-cloud-service-catalog.md
git commit -m "docs: add KT Cloud service catalog research

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 1.4: NHN Cloud Service Catalog Data Collection

**Files:**
- Create: `docs/research/2026-02-26-nhn-cloud-service-catalog.md`

**Step 1: Research NHN Cloud services**

Focus on NHN's specialized strengths:
- Game services (GamePot, etc.)
- AI/ML services
- GPU infrastructure
- RCS messaging (2026 new service)
- Standard cloud services (Compute, Storage, DB, Network)

**Step 2: Document 200+ services**

Create comprehensive catalog across 25+ categories with InfraNodeType mappings.

**Step 3: Commit research**

```bash
git add docs/research/2026-02-26-nhn-cloud-service-catalog.md
git commit -m "docs: add NHN Cloud service catalog research

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 2: Type System Extension

### Task 2.1: Extend CloudProvider Union Type

**Files:**
- Modify: `src/lib/knowledge/cloudCatalog/types.ts:23`
- Test: `src/lib/knowledge/cloudCatalog/__tests__/types.test.ts`

**Step 1: Write failing test**

```typescript
// src/lib/knowledge/cloudCatalog/__tests__/types.test.ts
describe('Korean CSP Provider Types', () => {
  it('should accept ncp as valid CloudProvider', () => {
    const provider: CloudProvider = 'ncp';
    expect(provider).toBe('ncp');
  });

  it('should accept kakao as valid CloudProvider', () => {
    const provider: CloudProvider = 'kakao';
    expect(provider).toBe('kakao');
  });

  it('should accept kt as valid CloudProvider', () => {
    const provider: CloudProvider = 'kt';
    expect(provider).toBe('kt');
  });

  it('should accept nhn as valid CloudProvider', () => {
    const provider: CloudProvider = 'nhn';
    expect(provider).toBe('nhn');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/knowledge/cloudCatalog/__tests__/types.test.ts`
Expected: FAIL with type errors

**Step 3: Extend CloudProvider type**

```typescript
// src/lib/knowledge/cloudCatalog/types.ts:23
export type CloudProvider = 'aws' | 'azure' | 'gcp' | 'ncp' | 'kakao' | 'kt' | 'nhn';
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/knowledge/cloudCatalog/__tests__/types.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/knowledge/cloudCatalog/types.ts src/lib/knowledge/cloudCatalog/__tests__/types.test.ts
git commit -m "feat(cloud-catalog): add Korean CSP provider types (ncp, kakao, kt, nhn)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2.2: Extend svcTrust Helper for Korean CSPs

**Files:**
- Modify: `src/lib/knowledge/cloudCatalog/types.ts:182-197`
- Test: `src/lib/knowledge/cloudCatalog/__tests__/types.test.ts`

**Step 1: Write failing test**

```typescript
describe('svcTrust() for Korean CSPs', () => {
  it('should generate trust metadata for ncp', () => {
    const trust = svcTrust('ncp');
    expect(trust.sources[0].url).toBe('https://www.ncloud.com/v2/product');
    expect(trust.sources[0].title).toContain('NCP');
  });

  it('should generate trust metadata for kakao', () => {
    const trust = svcTrust('kakao');
    expect(trust.sources[0].url).toBe('https://kakaocloud.com/');
    expect(trust.sources[0].title).toContain('KAKAO');
  });

  it('should generate trust metadata for kt', () => {
    const trust = svcTrust('kt');
    expect(trust.sources[0].url).toBe('https://cloud.kt.com/');
    expect(trust.sources[0].title).toContain('KT');
  });

  it('should generate trust metadata for nhn', () => {
    const trust = svcTrust('nhn');
    expect(trust.sources[0].url).toBe('https://www.nhncloud.com/kr');
    expect(trust.sources[0].title).toContain('NHN');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/knowledge/cloudCatalog/__tests__/types.test.ts -t "svcTrust"`
Expected: FAIL

**Step 3: Extend svcTrust() implementation**

```typescript
// src/lib/knowledge/cloudCatalog/types.ts
export function svcTrust(provider: CloudProvider): TrustMetadata {
  const urls: Record<CloudProvider, string> = {
    aws: 'https://aws.amazon.com/products/',
    azure: 'https://azure.microsoft.com/products/',
    gcp: 'https://cloud.google.com/products',
    ncp: 'https://www.ncloud.com/v2/product',
    kakao: 'https://kakaocloud.com/',
    kt: 'https://cloud.kt.com/',
    nhn: 'https://www.nhncloud.com/kr',
  };
  return {
    ...VENDOR_TRUST,
    sources: [{
      type: 'vendor' as const,
      title: `${provider.toUpperCase()} Service Catalog`,
      url: urls[provider],
      accessedDate: '2026-02-26',
    }],
  };
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/knowledge/cloudCatalog/__tests__/types.test.ts -t "svcTrust"`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/knowledge/cloudCatalog/types.ts src/lib/knowledge/cloudCatalog/__tests__/types.test.ts
git commit -m "feat(cloud-catalog): extend svcTrust() for Korean CSP trust metadata

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 3: Provider Data Files

### Task 3.1: Create NCP Provider Data File

**Files:**
- Create: `src/lib/knowledge/cloudCatalog/providers/ncp.ts`
- Create: `src/lib/knowledge/cloudCatalog/__tests__/providers/ncp.test.ts`

**Step 1: Write failing test**

```typescript
// src/lib/knowledge/cloudCatalog/__tests__/providers/ncp.test.ts
import { describe, it, expect } from 'vitest';
import { NCP_SERVICES } from '../ncp';

describe('NCP Cloud Services', () => {
  it('should export NCP_SERVICES array', () => {
    expect(NCP_SERVICES).toBeDefined();
    expect(Array.isArray(NCP_SERVICES)).toBe(true);
  });

  it('should have at least 30 services', () => {
    expect(NCP_SERVICES.length).toBeGreaterThanOrEqual(30);
  });

  it('should have all required fields', () => {
    NCP_SERVICES.forEach((svc) => {
      expect(svc.id).toMatch(/^CS-[A-Z]+-NCP-\d{3}$/);
      expect(svc.provider).toBe('ncp');
      expect(svc.serviceName).toBeTruthy();
      expect(svc.serviceNameKo).toBeTruthy();
      expect(svc.status).toMatch(/^(active|deprecated|preview|end-of-life)$/);
      expect(svc.features).toBeInstanceOf(Array);
      expect(svc.featuresKo).toBeInstanceOf(Array);
      expect(svc.pricingTier).toMatch(/^(free|low|medium|high|enterprise)$/);
      expect(svc.trust).toBeDefined();
    });
  });

  it('should have bilingual names', () => {
    NCP_SERVICES.forEach((svc) => {
      expect(svc.serviceName).not.toBe(svc.serviceNameKo);
      expect(svc.serviceNameKo).toMatch(/[\u3131-\uD79D]/); // Korean characters
    });
  });

  it('should have valid InfraNodeType mappings', () => {
    NCP_SERVICES.forEach((svc) => {
      expect(svc.componentType).toBeTruthy();
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/knowledge/cloudCatalog/__tests__/providers/ncp.test.ts`
Expected: FAIL with "Cannot find module '../ncp'"

**Step 3: Create NCP provider file with initial services**

```typescript
// src/lib/knowledge/cloudCatalog/providers/ncp.ts
/**
 * Naver Cloud Platform (NCP) Services
 *
 * 170+ services across 16 categories with Korean-first bilingual support.
 */

import type { CloudService } from '../types';
import { svcTrust } from '../types';

const t = svcTrust('ncp');
const certs = ['ISMS-P', 'ISO 27001', 'CSA STAR'];

export const NCP_SERVICES: CloudService[] = [
  // ========== Compute ==========
  {
    id: 'CS-WEB-NCP-001',
    provider: 'ncp',
    componentType: 'web-server',
    serviceName: 'Server',
    serviceNameKo: '서버',
    status: 'active',
    features: ['Flexible instances', 'Auto Scaling', 'High Memory/CPU options', 'GPU support'],
    featuresKo: ['유연한 인스턴스', '오토 스케일링', '고메모리/CPU 옵션', 'GPU 지원'],
    pricingTier: 'low',
    trust: t,
    serviceCategory: 'Compute',
    serviceCategoryKo: '컴퓨팅',
    architectureRole: 'General-purpose compute for web and application hosting',
    architectureRoleKo: '웹 및 애플리케이션 호스팅을 위한 범용 컴퓨팅',
    recommendedFor: ['Web hosting', 'Application servers', 'Development environments', 'Batch processing'],
    recommendedForKo: ['웹 호스팅', '애플리케이션 서버', '개발 환경', '배치 처리'],
    sla: '99.95%',
    deploymentModel: 'self-managed',
    pricingModel: 'pay-as-you-go',
    complianceCertifications: certs,
    regions: ['KR-1', 'KR-2'],
    documentationUrl: 'https://www.ncloud.com/v2/product/compute/server',
    typicalMonthlyCostUsd: 25,
    supportedProtocols: ['HTTP/HTTPS', 'SSH', 'RDP', 'TCP/UDP'],
    haFeatures: ['Auto Scaling', 'Multi-zone placement', 'Init Script'],
    securityCapabilities: ['ACG (Access Control Group)', 'VPC isolation', 'Disk encryption'],
    operationalComplexity: 'moderate',
    ecosystemMaturity: 'mature',
  },

  // ========== Storage ==========
  {
    id: 'CS-OBJ-NCP-001',
    provider: 'ncp',
    componentType: 'object-storage',
    serviceName: 'Object Storage',
    serviceNameKo: '오브젝트 스토리지',
    status: 'active',
    features: ['S3-compatible API', 'Archive class', 'Lifecycle policies', 'CDN integration'],
    featuresKo: ['S3 호환 API', '아카이브 클래스', '라이프사이클 정책', 'CDN 통합'],
    pricingTier: 'low',
    trust: t,
    serviceCategory: 'Storage',
    serviceCategoryKo: '스토리지',
    architectureRole: 'Scalable object storage for unstructured data',
    architectureRoleKo: '비정형 데이터를 위한 확장 가능한 오브젝트 스토리지',
    recommendedFor: ['Backup and archive', 'Static website hosting', 'Media storage', 'Data lakes'],
    recommendedForKo: ['백업 및 아카이브', '정적 웹사이트 호스팅', '미디어 스토리지', '데이터 레이크'],
    sla: '99.9%',
    deploymentModel: 'managed',
    pricingModel: 'pay-as-you-go',
    complianceCertifications: certs,
    regions: ['KR-1', 'KR-2', 'JP', 'SG', 'US'],
    documentationUrl: 'https://www.ncloud.com/v2/product/storage/objectStorage',
    typicalMonthlyCostUsd: 20,
    supportedProtocols: ['S3 API', 'HTTPS'],
    haFeatures: ['Multi-region replication', 'Versioning', '99.999999999% durability'],
    securityCapabilities: ['Server-side encryption', 'Access control policies', 'Bucket policies'],
    operationalComplexity: 'simple',
    ecosystemMaturity: 'mature',
  },

  // ========== Database ==========
  {
    id: 'CS-DB-NCP-001',
    provider: 'ncp',
    componentType: 'db-server',
    serviceName: 'Cloud DB for MySQL',
    serviceNameKo: 'Cloud DB for MySQL',
    status: 'active',
    features: ['Managed MySQL', 'Auto backup', 'Read replicas', 'Automatic failover'],
    featuresKo: ['관리형 MySQL', '자동 백업', '읽기 복제본', '자동 페일오버'],
    pricingTier: 'medium',
    trust: t,
    serviceCategory: 'Database',
    serviceCategoryKo: '데이터베이스',
    architectureRole: 'Managed relational database tier',
    architectureRoleKo: '관리형 관계형 데이터베이스 티어',
    recommendedFor: ['OLTP workloads', 'Web applications', 'E-commerce platforms', 'CMS backends'],
    recommendedForKo: ['OLTP 워크로드', '웹 애플리케이션', '전자상거래 플랫폼', 'CMS 백엔드'],
    sla: '99.95%',
    deploymentModel: 'managed',
    pricingModel: 'pay-as-you-go',
    complianceCertifications: certs,
    regions: ['KR-1', 'KR-2'],
    documentationUrl: 'https://www.ncloud.com/v2/product/database/cloudDbMysql',
    typicalMonthlyCostUsd: 150,
    supportedProtocols: ['MySQL', 'JDBC', 'ODBC'],
    haFeatures: ['Master-standby replication', 'Read replicas', 'Automatic failover'],
    securityCapabilities: ['Encryption at rest', 'VPC isolation', 'SSL/TLS'],
    operationalComplexity: 'moderate',
    ecosystemMaturity: 'mature',
  },

  // ========== Networking ==========
  {
    id: 'CS-LB-NCP-001',
    provider: 'ncp',
    componentType: 'load-balancer',
    serviceName: 'Load Balancer',
    serviceNameKo: '로드 밸런서',
    status: 'active',
    features: ['L4/L7 load balancing', 'Health checks', 'SSL offloading', 'Session persistence'],
    featuresKo: ['L4/L7 로드 밸런싱', '헬스 체크', 'SSL 오프로딩', '세션 지속성'],
    pricingTier: 'low',
    trust: t,
    serviceCategory: 'Networking',
    serviceCategoryKo: '네트워킹',
    architectureRole: 'Application-layer traffic distribution',
    architectureRoleKo: '애플리케이션 계층 트래픽 분산',
    recommendedFor: ['HTTP/HTTPS workloads', 'High availability', 'Multi-server distribution', 'SSL termination'],
    recommendedForKo: ['HTTP/HTTPS 워크로드', '고가용성', '다중 서버 분산', 'SSL 종료'],
    sla: '99.99%',
    deploymentModel: 'managed',
    pricingModel: 'pay-as-you-go',
    complianceCertifications: certs,
    regions: ['KR-1', 'KR-2'],
    documentationUrl: 'https://www.ncloud.com/v2/product/networking/loadBalancer',
    typicalMonthlyCostUsd: 30,
    supportedProtocols: ['HTTP', 'HTTPS', 'TCP', 'UDP'],
    haFeatures: ['Multi-zone deployment', 'Health monitoring', 'Auto-healing'],
    securityCapabilities: ['SSL/TLS termination', 'ACG integration', 'DDoS protection'],
    operationalComplexity: 'moderate',
    ecosystemMaturity: 'mature',
  },

  // ========== AI Services ==========
  {
    id: 'CS-AI-NCP-001',
    provider: 'ncp',
    componentType: 'ai-service',
    serviceName: 'CLOVA Speech Recognition (CSR)',
    serviceNameKo: 'CLOVA 음성 인식',
    status: 'active',
    features: ['Korean/English/Japanese/Chinese support', 'Real-time streaming', 'Custom vocabulary', 'Speaker diarization'],
    featuresKo: ['한국어/영어/일본어/중국어 지원', '실시간 스트리밍', '커스텀 단어장', '화자 분리'],
    pricingTier: 'medium',
    trust: t,
    serviceCategory: 'AI Service',
    serviceCategoryKo: 'AI 서비스',
    architectureRole: 'Speech-to-text API service',
    architectureRoleKo: '음성-텍스트 변환 API 서비스',
    recommendedFor: ['Voice assistants', 'Call center automation', 'Transcription services', 'Voice commands'],
    recommendedForKo: ['음성 비서', '콜센터 자동화', '전사 서비스', '음성 명령'],
    sla: '99.9%',
    deploymentModel: 'managed',
    pricingModel: 'pay-as-you-go',
    complianceCertifications: certs,
    regions: 'global',
    documentationUrl: 'https://www.ncloud.com/v2/product/aiService/clovaSpeech',
    typicalMonthlyCostUsd: 100,
    supportedProtocols: ['REST API', 'WebSocket', 'gRPC'],
    haFeatures: ['Global edge deployment', 'Auto-scaling'],
    securityCapabilities: ['API key authentication', 'HTTPS encryption', 'Data privacy compliance'],
    operationalComplexity: 'simple',
    ecosystemMaturity: 'mature',
  },

  // Add more services following the same pattern...
  // Target: 30-50 core services covering all major categories
];
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/knowledge/cloudCatalog/__tests__/providers/ncp.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/knowledge/cloudCatalog/providers/ncp.ts src/lib/knowledge/cloudCatalog/__tests__/providers/ncp.test.ts
git commit -m "feat(cloud-catalog): add NCP provider with 5 initial services

Initial coverage: Compute, Storage, Database, Networking, AI Services

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 3.2: Create Kakao Cloud Provider Data File

**Files:**
- Create: `src/lib/knowledge/cloudCatalog/providers/kakao.ts`
- Create: `src/lib/knowledge/cloudCatalog/__tests__/providers/kakao.test.ts`

**Step 1: Write failing test**

Follow same test pattern as NCP with Kakao-specific assertions.

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/knowledge/cloudCatalog/__tests__/providers/kakao.test.ts`
Expected: FAIL

**Step 3: Create Kakao provider file**

Start with 5-10 core services (GPU instances, VPC, Object Storage, Database, AI services).

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/knowledge/cloudCatalog/__tests__/providers/kakao.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/knowledge/cloudCatalog/providers/kakao.ts src/lib/knowledge/cloudCatalog/__tests__/providers/kakao.test.ts
git commit -m "feat(cloud-catalog): add Kakao Cloud provider with initial services

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 3.3: Create KT Cloud Provider Data File

**Files:**
- Create: `src/lib/knowledge/cloudCatalog/providers/kt.ts`
- Create: `src/lib/knowledge/cloudCatalog/__tests__/providers/kt.test.ts`

**Step 1-5: Follow same pattern as Tasks 3.1-3.2**

Focus on KT Cloud's IaaS/PaaS/SaaS offerings across major categories.

**Commit message:**
```bash
git commit -m "feat(cloud-catalog): add KT Cloud provider with initial services

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 3.4: Create NHN Cloud Provider Data File

**Files:**
- Create: `src/lib/knowledge/cloudCatalog/providers/nhn.ts`
- Create: `src/lib/knowledge/cloudCatalog/__tests__/providers/nhn.test.ts`

**Step 1-5: Follow same pattern as Tasks 3.1-3.2**

Emphasize NHN's specializations: Game services, GPU infrastructure, RCS messaging.

**Commit message:**
```bash
git commit -m "feat(cloud-catalog): add NHN Cloud provider with initial services

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 4: Module Integration

### Task 4.1: Export Korean CSP Services from Index

**Files:**
- Modify: `src/lib/knowledge/cloudCatalog/index.ts`
- Test: `src/lib/knowledge/cloudCatalog/__tests__/index.test.ts`

**Step 1: Write failing test**

```typescript
// src/lib/knowledge/cloudCatalog/__tests__/index.test.ts
import { NCP_SERVICES, KAKAO_SERVICES, KT_SERVICES, NHN_SERVICES, CLOUD_SERVICES } from '../index';

describe('Korean CSP Service Exports', () => {
  it('should export NCP_SERVICES', () => {
    expect(NCP_SERVICES).toBeDefined();
    expect(NCP_SERVICES.length).toBeGreaterThan(0);
  });

  it('should export KAKAO_SERVICES', () => {
    expect(KAKAO_SERVICES).toBeDefined();
    expect(KAKAO_SERVICES.length).toBeGreaterThan(0);
  });

  it('should export KT_SERVICES', () => {
    expect(KT_SERVICES).toBeDefined();
    expect(KT_SERVICES.length).toBeGreaterThan(0);
  });

  it('should export NHN_SERVICES', () => {
    expect(NHN_SERVICES).toBeDefined();
    expect(NHN_SERVICES.length).toBeGreaterThan(0);
  });

  it('should include Korean CSPs in CLOUD_SERVICES', () => {
    const ncpCount = CLOUD_SERVICES.filter(s => s.provider === 'ncp').length;
    const kakaoCount = CLOUD_SERVICES.filter(s => s.provider === 'kakao').length;
    const ktCount = CLOUD_SERVICES.filter(s => s.provider === 'kt').length;
    const nhnCount = CLOUD_SERVICES.filter(s => s.provider === 'nhn').length;

    expect(ncpCount).toBeGreaterThan(0);
    expect(kakaoCount).toBeGreaterThan(0);
    expect(ktCount).toBeGreaterThan(0);
    expect(nhnCount).toBeGreaterThan(0);

    expect(ncpCount).toBe(NCP_SERVICES.length);
    expect(kakaoCount).toBe(KAKAO_SERVICES.length);
    expect(ktCount).toBe(KT_SERVICES.length);
    expect(nhnCount).toBe(NHN_SERVICES.length);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/knowledge/cloudCatalog/__tests__/index.test.ts`
Expected: FAIL

**Step 3: Add exports to index.ts**

```typescript
// src/lib/knowledge/cloudCatalog/index.ts
export { AWS_SERVICES } from './providers/aws';
export { AZURE_SERVICES } from './providers/azure';
export { GCP_SERVICES } from './providers/gcp';
export { NCP_SERVICES } from './providers/ncp';
export { KAKAO_SERVICES } from './providers/kakao';
export { KT_SERVICES } from './providers/kt';
export { NHN_SERVICES } from './providers/nhn';

export const CLOUD_SERVICES: CloudService[] = [
  ...AWS_SERVICES,
  ...AZURE_SERVICES,
  ...GCP_SERVICES,
  ...NCP_SERVICES,
  ...KAKAO_SERVICES,
  ...KT_SERVICES,
  ...NHN_SERVICES,
];
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/knowledge/cloudCatalog/__tests__/index.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/knowledge/cloudCatalog/index.ts src/lib/knowledge/cloudCatalog/__tests__/index.test.ts
git commit -m "feat(cloud-catalog): integrate Korean CSP services into CLOUD_SERVICES

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 4.2: Update Query Helpers for Korean CSPs

**Files:**
- Modify: `src/lib/knowledge/cloudCatalog/queryHelpers.ts`
- Test: `src/lib/knowledge/cloudCatalog/__tests__/queryHelpers.test.ts`

**Step 1: Write failing test**

```typescript
describe('getServicesByProvider() with Korean CSPs', () => {
  it('should filter NCP services', () => {
    const ncpServices = getServicesByProvider('ncp');
    expect(ncpServices.length).toBeGreaterThan(0);
    expect(ncpServices.every(s => s.provider === 'ncp')).toBe(true);
  });

  it('should filter Kakao services', () => {
    const kakaoServices = getServicesByProvider('kakao');
    expect(kakaoServices.length).toBeGreaterThan(0);
    expect(kakaoServices.every(s => s.provider === 'kakao')).toBe(true);
  });

  it('should filter KT services', () => {
    const ktServices = getServicesByProvider('kt');
    expect(ktServices.length).toBeGreaterThan(0);
    expect(ktServices.every(s => s.provider === 'kt')).toBe(true);
  });

  it('should filter NHN services', () => {
    const nhnServices = getServicesByProvider('nhn');
    expect(nhnServices.length).toBeGreaterThan(0);
    expect(nhnServices.every(s => s.provider === 'nhn')).toBe(true);
  });
});

describe('getProviderCoverageStats() with Korean CSPs', () => {
  it('should calculate NCP stats', () => {
    const stats = getProviderCoverageStats('ncp');
    expect(stats.totalServices).toBeGreaterThan(0);
    expect(stats.activeServices).toBeGreaterThan(0);
  });

  // Similar tests for kakao, kt, nhn
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/knowledge/cloudCatalog/__tests__/queryHelpers.test.ts`
Expected: PASS (query helpers should work automatically with new providers)

**Step 3: Verify no code changes needed**

Since query helpers filter by `provider` field generically, they should already support Korean CSPs.

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/knowledge/cloudCatalog/__tests__/queryHelpers.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/knowledge/cloudCatalog/__tests__/queryHelpers.test.ts
git commit -m "test(cloud-catalog): add Korean CSP coverage to query helper tests

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 5: Recommendation Engine Integration

### Task 5.1: Update Cloud Matcher for Korean CSPs

**Files:**
- Modify: `src/lib/recommendation/cloudMatcher.ts`
- Test: `src/lib/recommendation/__tests__/cloudMatcher.test.ts`

**Step 1: Write failing test**

```typescript
describe('matchCloudServices() with Korean CSPs', () => {
  it('should match NCP services for Korean region preference', () => {
    const spec: InfraSpec = {
      metadata: { /* ... */ },
      nodes: [{
        id: 'node-1',
        type: 'web-server',
        position: { x: 0, y: 0 },
      }],
      edges: [],
    };

    const matches = matchCloudServices(spec, {
      preferredProviders: ['ncp'],
      preferredRegion: 'KR',
    });

    expect(matches.length).toBeGreaterThan(0);
    expect(matches.some(m => m.provider === 'ncp')).toBe(true);
  });

  it('should match across all 7 providers when no preference', () => {
    const spec: InfraSpec = {
      metadata: { /* ... */ },
      nodes: [{
        id: 'node-1',
        type: 'db-server',
        position: { x: 0, y: 0 },
      }],
      edges: [],
    };

    const matches = matchCloudServices(spec);

    const providers = new Set(matches.map(m => m.provider));
    expect(providers.size).toBeGreaterThanOrEqual(4); // AWS, Azure, GCP, + at least 1 Korean CSP
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/recommendation/__tests__/cloudMatcher.test.ts -t "Korean CSPs"`
Expected: PASS (matcher should work automatically since it queries CLOUD_SERVICES)

**Step 3: Verify no code changes needed**

Cloud matcher filters `CLOUD_SERVICES` by `componentType`, which already includes Korean CSPs.

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/recommendation/__tests__/cloudMatcher.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/recommendation/__tests__/cloudMatcher.test.ts
git commit -m "test(recommendation): verify Korean CSP integration in cloud matcher

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 5.2: Extend Cloud Scorer for Korean Region Preferences

**Files:**
- Modify: `src/lib/recommendation/cloudScorer.ts`
- Test: `src/lib/recommendation/__tests__/cloudScorer.test.ts`

**Step 1: Write failing test**

```typescript
describe('scoreCloudService() Korean region scoring', () => {
  it('should boost NCP score for KR region preference', () => {
    const ncpService: CloudService = {
      id: 'CS-WEB-NCP-001',
      provider: 'ncp',
      componentType: 'web-server',
      serviceName: 'Server',
      serviceNameKo: '서버',
      status: 'active',
      features: ['Auto Scaling'],
      featuresKo: ['오토 스케일링'],
      pricingTier: 'low',
      trust: svcTrust('ncp'),
      regions: ['KR-1', 'KR-2'],
    };

    const awsService: CloudService = {
      id: 'CS-WEB-AWS-001',
      provider: 'aws',
      componentType: 'web-server',
      serviceName: 'EC2',
      serviceNameKo: 'EC2',
      status: 'active',
      features: ['Auto Scaling'],
      featuresKo: ['오토 스케일링'],
      pricingTier: 'low',
      trust: svcTrust('aws'),
      regions: 'global',
    };

    const ncpScore = scoreCloudService(ncpService, { type: 'web-server' }, { preferredRegion: 'KR' });
    const awsScore = scoreCloudService(awsService, { type: 'web-server' }, { preferredRegion: 'KR' });

    expect(ncpScore).toBeGreaterThan(awsScore);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/recommendation/__tests__/cloudScorer.test.ts -t "Korean region"`
Expected: FAIL (scorer may not boost Korean CSPs for KR region yet)

**Step 3: Add region scoring logic**

```typescript
// src/lib/recommendation/cloudScorer.ts
function scoreRegionMatch(service: CloudService, options?: CloudMatchOptions): number {
  if (!options?.preferredRegion) return 0.5; // Neutral

  const region = options.preferredRegion.toUpperCase();

  // Exact region match
  if (Array.isArray(service.regions) && service.regions.some(r => r.includes(region))) {
    return 1.0;
  }

  // Global services
  if (service.regions === 'global') {
    return 0.8;
  }

  // Korean CSP boost for Korean region
  if (region === 'KR' && ['ncp', 'kakao', 'kt', 'nhn'].includes(service.provider)) {
    return 0.9;
  }

  // No match
  return 0.3;
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/recommendation/__tests__/cloudScorer.test.ts -t "Korean region"`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/recommendation/cloudScorer.ts src/lib/recommendation/__tests__/cloudScorer.test.ts
git commit -m "feat(recommendation): boost Korean CSP scores for KR region preference

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 6: Admin UI Integration

### Task 6.1: Add Korean CSP Tabs to Cloud Catalog Admin

**Files:**
- Modify: `src/app/admin/knowledge/cloud-catalog/page.tsx`
- Test: Manual UI testing

**Step 1: Update provider tabs**

```typescript
// src/app/admin/knowledge/cloud-catalog/page.tsx
const PROVIDERS = [
  { id: 'all', label: 'All Providers', labelKo: '모든 제공자' },
  { id: 'aws', label: 'AWS', labelKo: 'AWS' },
  { id: 'azure', label: 'Azure', labelKo: 'Azure' },
  { id: 'gcp', label: 'GCP', labelKo: 'GCP' },
  { id: 'ncp', label: 'Naver Cloud', labelKo: '네이버 클라우드' },
  { id: 'kakao', label: 'Kakao Cloud', labelKo: '카카오 클라우드' },
  { id: 'kt', label: 'KT Cloud', labelKo: 'KT 클라우드' },
  { id: 'nhn', label: 'NHN Cloud', labelKo: 'NHN 클라우드' },
] as const;
```

**Step 2: Test UI manually**

Run: `npm run dev`
Navigate: `http://localhost:3000/admin/knowledge/cloud-catalog`
Expected: See 7 provider tabs, Korean CSP services render correctly

**Step 3: Commit**

```bash
git add src/app/admin/knowledge/cloud-catalog/page.tsx
git commit -m "feat(admin): add Korean CSP tabs to cloud catalog admin UI

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 6.2: Update Provider Logo/Badge Components

**Files:**
- Modify: `src/components/admin/CloudServiceCard.tsx` (or similar)
- Create: `public/images/providers/ncp-logo.svg` (if applicable)

**Step 1: Add Korean CSP provider badges**

```typescript
const PROVIDER_COLORS: Record<CloudProvider, string> = {
  aws: 'orange',
  azure: 'blue',
  gcp: 'red',
  ncp: 'green',
  kakao: 'yellow',
  kt: 'red',
  nhn: 'blue',
};

const PROVIDER_LABELS: Record<CloudProvider, string> = {
  aws: 'AWS',
  azure: 'Azure',
  gcp: 'GCP',
  ncp: 'Naver Cloud',
  kakao: 'Kakao Cloud',
  kt: 'KT Cloud',
  nhn: 'NHN Cloud',
};
```

**Step 2: Test badge rendering**

Verify Korean CSP badges display correctly in service cards.

**Step 3: Commit**

```bash
git add src/components/admin/CloudServiceCard.tsx
git commit -m "feat(admin): add Korean CSP provider badges and colors

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 7: Documentation & Rules

### Task 7.1: Update Cloud Catalog Rules

**Files:**
- Modify: `.claude/rules/cloud-catalog-rules.md`

**Step 1: Add Korean CSP providers to CC-005**

```markdown
## CC-005: ID Convention

| Provider | Code |
|----------|------|
| AWS | `AWS` |
| Azure | `AZ` |
| GCP | `GCP` |
| NCP | `NCP` |
| Kakao | `KAKAO` |
| KT | `KT` |
| NHN | `NHN` |
```

**Step 2: Add Korean CSP documentation patterns to CC-006**

```markdown
Patterns:
- AWS: `https://docs.aws.amazon.com/{service}/`
- Azure: `https://learn.microsoft.com/en-us/azure/{service}/`
- GCP: `https://cloud.google.com/{service}/docs/`
- NCP: `https://www.ncloud.com/v2/product/{category}/{service}`
- Kakao: `https://kakaocloud.com/docs/{service}`
- KT: `https://cloud.kt.com/docs/{service}`
- NHN: `https://www.nhncloud.com/kr/service/{category}`
```

**Step 3: Commit**

```bash
git add .claude/rules/cloud-catalog-rules.md
git commit -m "docs(rules): add Korean CSP patterns to cloud catalog rules

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 7.2: Create Korean CSP Integration Documentation

**Files:**
- Create: `docs/reference/korean-csp-integration.md`

**Step 1: Write integration guide**

```markdown
# Korean CSP Integration Guide

## Overview

InfraFlow now supports 4 major Korean Cloud Service Providers (CSPs):

- **Naver Cloud Platform (NCP)**: 170+ services, strong in AI/ML and gaming
- **Kakao Cloud**: GPU infrastructure, VPC/hybrid cloud
- **KT Cloud**: Enterprise IaaS/PaaS/SaaS across all categories
- **NHN Cloud**: 200+ services, specialized in gaming and RCS messaging

## Architecture

Korean CSPs follow the same flat-structure pattern as AWS/Azure/GCP:

```typescript
export const NCP_SERVICES: CloudService[] = [
  {
    id: 'CS-WEB-NCP-001',
    provider: 'ncp',
    componentType: 'web-server',
    serviceName: 'Server',
    serviceNameKo: '서버',
    // ... full CloudService interface
  },
];
```

## Bilingual Support

All Korean CSP services are **Korean-first**:
- Korean names are primary (`serviceNameKo` comes from official docs)
- English names are translations or official English branding

## Region Preferences

When users specify `preferredRegion: 'KR'`, the recommendation scorer boosts Korean CSPs:
- NCP/Kakao/KT/NHN services: +10% score modifier for KR region
- AWS/Azure/GCP global services: Standard scoring

## Adding Services

Follow cloud-catalog-rules.md (CC-001 through CC-010) with Korean CSP-specific patterns.

## Testing

```bash
npx vitest run src/lib/knowledge/cloudCatalog/__tests__/providers/ncp.test.ts
npx vitest run src/lib/recommendation/__tests__/cloudScorer.test.ts -t "Korean"
```
```

**Step 2: Commit**

```bash
git add docs/reference/korean-csp-integration.md
git commit -m "docs: add Korean CSP integration guide

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 8: Data Expansion (Iterative)

### Task 8.1: Expand NCP Services to 30+

**Files:**
- Modify: `src/lib/knowledge/cloudCatalog/providers/ncp.ts`
- Test: `src/lib/knowledge/cloudCatalog/__tests__/providers/ncp.test.ts`

**Step 1: Research additional NCP services**

Use WebFetch + official docs to add:
- Kubernetes Service
- Container Registry
- CDN
- API Gateway
- AI services (Papago, OCR, Chatbot)
- Maps
- VPC
- Security services
- Monitoring

**Step 2: Add 25+ more NCP services**

Target coverage:
- Compute: 3-5 services
- Storage: 3-4 services
- Database: 4-6 services
- Networking: 4-5 services
- AI: 5-8 services
- Security: 3-4 services
- Developer Tools: 2-3 services

**Step 3: Update test assertions**

```typescript
it('should have at least 30 services', () => {
  expect(NCP_SERVICES.length).toBeGreaterThanOrEqual(30);
});
```

**Step 4: Run tests**

Run: `npx vitest run src/lib/knowledge/cloudCatalog/__tests__/providers/ncp.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/knowledge/cloudCatalog/providers/ncp.ts src/lib/knowledge/cloudCatalog/__tests__/providers/ncp.test.ts
git commit -m "feat(cloud-catalog): expand NCP services to 30+ across all categories

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 8.2: Expand Kakao/KT/NHN Services

Follow the same pattern as Task 8.1 for each provider.

**Target service counts:**
- Kakao Cloud: 15-20 services
- KT Cloud: 20-25 services
- NHN Cloud: 30-40 services

**Commit pattern:**
```bash
git commit -m "feat(cloud-catalog): expand {PROVIDER} services to {COUNT}+

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 9: Quality Assurance

### Task 9.1: Run Full Test Suite

**Step 1: Type check**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 2: Unit tests**

Run: `npx vitest run src/lib/knowledge/cloudCatalog`
Expected: All tests pass

**Step 3: Integration tests**

Run: `npx vitest run src/lib/recommendation`
Expected: All tests pass

**Step 4: Admin UI smoke test**

Navigate to cloud catalog admin and verify:
- All 7 provider tabs work
- Korean CSP services display correctly
- Bilingual names render
- Service cards show correct badges

---

### Task 9.2: Coverage Report

**Step 1: Generate coverage**

Run: `npx vitest run --coverage src/lib/knowledge/cloudCatalog`

**Step 2: Verify coverage thresholds**

- Statements: >80%
- Branches: >75%
- Functions: >80%
- Lines: >80%

**Step 3: Document coverage**

Add coverage report to integration guide.

---

### Task 9.3: Final Documentation Review

**Step 1: Update MEMORY.md**

Add Korean CSP integration to project memory:
```markdown
## Cloud Catalog (Enhanced — Korean CSP Integration)
- 7 providers: AWS(41)/Azure(32)/GCP(38)/NCP(30+)/Kakao(15+)/KT(20+)/NHN(30+)
- Korean-first bilingual support
- Region-aware recommendation scoring
- Admin UI: 7-provider tabs
```

**Step 2: Update CLAUDE.md if needed**

No changes expected (existing cloud catalog workflows apply).

**Step 3: Commit final docs**

```bash
git add .claude/projects/-Users-hyunkikim-dev-infraflow/memory/MEMORY.md
git commit -m "docs(memory): add Korean CSP integration summary

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Success Criteria

- [ ] 4 Korean CSP providers added: NCP, Kakao, KT, NHN
- [ ] Each provider has 15-40 services (total 95-135 new services)
- [ ] All services have bilingual names (Korean-first)
- [ ] Recommendation engine supports Korean CSPs
- [ ] Region preference 'KR' boosts Korean CSP scores
- [ ] Admin UI shows all 7 providers
- [ ] All tests pass: `npx tsc --noEmit && npx vitest run`
- [ ] Documentation complete: integration guide + updated rules

---

## Execution Options

**Plan complete and saved to `docs/plans/2026-02-26-korean-csp-integration-plan.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
