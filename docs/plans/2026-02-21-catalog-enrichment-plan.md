# Catalog Enrichment Plan — 3-Phase Implementation

> Date: 2026-02-21
> Status: Ready for Implementation
> Prerequisite: `docs/plans/2026-02-21-catalog-field-gap-analysis.md`
> Scope: ProductNode (Vendor) + CloudService (Cloud) 공통 필드 강화

---

## Overview

기존 `relationships.ts` (115개 generic 관계)를 활용하면서, 제품/서비스 레벨의 데이터를 보강하여 InfraFlow의 핵심 유즈케이스(UC-2 연결 매핑, UC-5 필수/선택 판단, UC-6 비교)를 완성한다.

---

## Phase 1: 공통 필드 정렬 (타입 + 스키마)

> 목표: 양쪽 카탈로그의 필드를 대칭으로 맞추고, 비교/기능 표시를 강화

### Task 1-1: CloudService에 벤더 동등 필드 3개 추가

**파일**: `src/lib/knowledge/cloudCatalog/types.ts`

```typescript
// CloudService에 추가할 필드:

/** Supported protocols/APIs for connectivity planning */
supportedProtocols?: string[];
// 예: ['HTTP/HTTPS', 'gRPC', 'WebSocket', 'AMQP', 'MQTT', 'JDBC', 'ODBC']

/** High availability features */
haFeatures?: string[];
// 예: ['Multi-AZ deployment', 'Auto-failover', 'Read Replicas', 'Cross-region replication']

/** Security capabilities beyond basic features */
securityCapabilities?: string[];
// 예: ['Encryption at rest (AES-256)', 'KMS integration', 'VPC isolation', 'IAM fine-grained access']
```

**테스트 업데이트**: `src/lib/knowledge/cloudCatalog/__tests__/types.test.ts`

### Task 1-2: 양쪽 공통 비교 필드 추가

**공통 타입 정의**: `src/lib/knowledge/types.ts` (기존 파일에 추가)

```typescript
/** Operational complexity for comparison */
export type OperationalComplexity = 'simple' | 'moderate' | 'complex';

/** Ecosystem maturity level */
export type EcosystemMaturity = 'emerging' | 'stable' | 'mature';

/** Disaster recovery capabilities */
export interface DisasterRecoveryInfo {
  maxRTOMinutes?: number;
  maxRPOMinutes?: number;
  backupFrequency?: 'continuous' | 'hourly' | 'daily' | 'weekly';
  multiRegionSupported: boolean;
}
```

**ProductNode에 추가**: `src/lib/knowledge/vendorCatalog/types.ts`

```typescript
operationalComplexity?: OperationalComplexity;
ecosystemMaturity?: EcosystemMaturity;
disasterRecovery?: DisasterRecoveryInfo;
```

**CloudService에 추가**: `src/lib/knowledge/cloudCatalog/types.ts`

```typescript
operationalComplexity?: OperationalComplexity;
ecosystemMaturity?: EcosystemMaturity;
disasterRecovery?: DisasterRecoveryInfo;
```

### Task 1-3: 테스트 업데이트

- `src/lib/knowledge/cloudCatalog/__tests__/types.test.ts` — 새 필드 타입 검증
- `src/lib/knowledge/vendorCatalog/__tests__/` — 새 필드 타입 검증

### Task 1-4: Admin 테이블 뷰 업데이트

- `src/app/admin/knowledge/cloud-catalog/table/page.tsx` — 새 컬럼 6개 추가
- `src/app/admin/knowledge/vendor-catalog/table/page.tsx` — 새 컬럼 3개 추가

### Verification

```bash
npx tsc --noEmit && npx vitest run
```

---

## Phase 2: 연결/의존성 필드 (양쪽 공통)

> 목표: 제품/서비스 레벨에서 연결 방향성과 필수/선택 관계를 표현

### Task 2-1: 공통 의존성 타입 정의

**파일**: `src/lib/knowledge/types.ts`

```typescript
/** Component-level companion reference */
export interface CompanionRef {
  /** Target generic component type (e.g., 'firewall', 'load-balancer') */
  componentType: InfraNodeType;
  /** Why this companion is needed */
  reason: string;
  reasonKo: string;
}

/** Required companion — MUST exist for this product/service to function */
export interface RequiredCompanion extends CompanionRef {
  severity: 'critical' | 'high';
  // critical: cannot function without it
  // high: technically works but operationally unacceptable
}

/** Recommended companion — strongly advised for production */
export interface RecommendedCompanion extends CompanionRef {
  severity: 'high' | 'medium';
  // high: best practice, almost always needed
  // medium: nice-to-have, improves quality
}
```

### Task 2-2: 양쪽 타입에 의존성 필드 추가

**ProductNode에 추가**:

```typescript
/** Components that MUST exist for this product to function properly */
requiredCompanions?: RequiredCompanion[];

/** Components strongly recommended alongside this product */
recommendedCompanions?: RecommendedCompanion[];

/** Component types this product conflicts with */
conflictsWith?: CompanionRef[];
```

**CloudService에 추가** (동일):

```typescript
requiredCompanions?: RequiredCompanion[];
recommendedCompanions?: RecommendedCompanion[];
conflictsWith?: CompanionRef[];
```

### Task 2-3: 기존 relationships.ts에서 시드 데이터 자동 생성

relationships.ts의 115개 generic 관계를 활용하여, 제품/서비스 레벨 의존성의 **기본값**을 제공하는 헬퍼 함수:

**파일**: `src/lib/knowledge/companionResolver.ts`

```typescript
/**
 * Resolves companion requirements for a product/service
 * by combining:
 * 1. Product/service-level overrides (requiredCompanions, recommendedCompanions)
 * 2. Generic relationships from relationships.ts (fallback)
 *
 * Product-level data takes priority over generic relationships.
 */
export function resolveCompanions(
  componentType: InfraNodeType,
  productOverrides?: { required?: RequiredCompanion[]; recommended?: RecommendedCompanion[] }
): { required: RequiredCompanion[]; recommended: RecommendedCompanion[] }
```

### Task 2-4: Gap Analyzer 연동

`src/lib/consulting/gapAnalyzer.ts`를 확장하여 의존성 기반 갭 탐지:

- 현재 다이어그램에 `firewall`이 있는데, 그 firewall의 `requiredCompanions`인 `ids-ips`가 없으면 → "필수 컴패니언 누락" 갭 추가

### Task 2-5: 테스트

- `src/lib/knowledge/__tests__/companionResolver.test.ts` — 새 파일
- `src/lib/consulting/__tests__/gapAnalyzer.test.ts` — 의존성 갭 테스트 추가

### Verification

```bash
npx tsc --noEmit && npx vitest run
```

---

## Phase 3: 데이터 채우기

> 목표: 111개 클라우드 서비스 + 416개 벤더 제품의 새 필드를 실제 데이터로 채우기

### Task 3-1: 클라우드 카탈로그 — supportedProtocols, haFeatures, securityCapabilities

**우선순위**: AWS(40) → Azure(34) → GCP(35)

서비스당 채울 필드:

| 필드 | 최소 항목 | 예시 (Amazon RDS) |
|------|----------|------------------|
| `supportedProtocols` | 2개+ | `['MySQL', 'PostgreSQL', 'JDBC', 'ODBC']` |
| `haFeatures` | 2개+ | `['Multi-AZ', 'Read Replicas', 'Auto-failover']` |
| `securityCapabilities` | 2개+ | `['Encryption at rest (AES-256)', 'IAM DB auth', 'VPC isolation']` |

### Task 3-2: 클라우드 카탈로그 — 공통 비교 필드

111개 서비스에 채울 필드:

| 필드 | 예시 (Amazon RDS) |
|------|------------------|
| `operationalComplexity` | `'moderate'` |
| `ecosystemMaturity` | `'mature'` |
| `disasterRecovery` | `{ maxRTOMinutes: 5, maxRPOMinutes: 1, backupFrequency: 'continuous', multiRegionSupported: true }` |

### Task 3-3: 클라우드 카탈로그 — 의존성 필드

111개 서비스 중 주요 서비스부터 채우기:

```typescript
// 예: AWS Lambda
{
  requiredCompanions: [
    { componentType: 'iam', reason: 'Execution role required', reasonKo: '실행 역할 필요', severity: 'critical' },
  ],
  recommendedCompanions: [
    { componentType: 'monitoring', reason: 'CloudWatch for logging', reasonKo: '로깅용 CloudWatch', severity: 'high' },
    { componentType: 'api-gateway', reason: 'HTTP trigger endpoint', reasonKo: 'HTTP 트리거 엔드포인트', severity: 'medium' },
  ],
}
```

### Task 3-4: 벤더 카탈로그 — 공통 비교 필드

416개 제품 중 depth 2+ (시리즈 레벨) 대상:

| 필드 | 예시 (Cisco Catalyst 9600) |
|------|---------------------------|
| `operationalComplexity` | `'complex'` |
| `ecosystemMaturity` | `'mature'` |
| `disasterRecovery` | `{ multiRegionSupported: false }` |

### Task 3-5: 벤더 카탈로그 — 의존성 필드

주요 시리즈 제품부터:

```typescript
// 예: Cisco Catalyst 9600 (Core Switch)
{
  requiredCompanions: [
    { componentType: 'switch-l2', reason: 'Access layer distribution', reasonKo: '접속 계층 분배', severity: 'high' },
  ],
  recommendedCompanions: [
    { componentType: 'firewall', reason: 'Security boundary at core', reasonKo: '코어의 보안 경계', severity: 'high' },
    { componentType: 'ids-ips', reason: 'Deep packet inspection', reasonKo: '심층 패킷 검사', severity: 'medium' },
  ],
}
```

### Task 3-6: 테스트 count 업데이트 및 최종 검증

- 모든 provider 테스트 파일의 count assertion 업데이트
- 새 필드가 채워진 서비스/제품 비율 통계

### Verification

```bash
npx tsc --noEmit && npx vitest run
```

---

## 파일 변경 요약

| Phase | 파일 | 변경 내용 |
|-------|------|----------|
| 1 | `src/lib/knowledge/types.ts` | 공통 타입 추가 (OperationalComplexity, EcosystemMaturity, DisasterRecoveryInfo) |
| 1 | `src/lib/knowledge/cloudCatalog/types.ts` | supportedProtocols, haFeatures, securityCapabilities + 공통 3개 |
| 1 | `src/lib/knowledge/vendorCatalog/types.ts` | 공통 3개 (operationalComplexity, ecosystemMaturity, disasterRecovery) |
| 1 | `src/lib/knowledge/cloudCatalog/__tests__/types.test.ts` | 새 필드 검증 |
| 1 | `src/app/admin/knowledge/cloud-catalog/table/page.tsx` | 새 컬럼 추가 |
| 2 | `src/lib/knowledge/types.ts` | CompanionRef, RequiredCompanion, RecommendedCompanion |
| 2 | `src/lib/knowledge/cloudCatalog/types.ts` | requiredCompanions, recommendedCompanions, conflictsWith |
| 2 | `src/lib/knowledge/vendorCatalog/types.ts` | requiredCompanions, recommendedCompanions, conflictsWith |
| 2 | `src/lib/knowledge/companionResolver.ts` | 새 파일 — generic 관계 + 제품 오버라이드 병합 |
| 2 | `src/lib/knowledge/__tests__/companionResolver.test.ts` | 새 파일 |
| 2 | `src/lib/consulting/gapAnalyzer.ts` | 의존성 기반 갭 탐지 추가 |
| 2 | `src/lib/consulting/__tests__/gapAnalyzer.test.ts` | 의존성 갭 테스트 |
| 3 | `src/lib/knowledge/cloudCatalog/providers/aws.ts` | 40개 서비스 새 필드 데이터 |
| 3 | `src/lib/knowledge/cloudCatalog/providers/azure.ts` | 34개 서비스 새 필드 데이터 |
| 3 | `src/lib/knowledge/cloudCatalog/providers/gcp.ts` | 35개 서비스 새 필드 데이터 |
| 3 | `src/lib/knowledge/vendorCatalog/cisco.ts` | 주요 시리즈 새 필드 데이터 |
| 3 | `src/lib/knowledge/vendorCatalog/fortinet.ts` | 주요 시리즈 새 필드 데이터 |
| 3 | `src/lib/knowledge/vendorCatalog/paloalto.ts` | 주요 시리즈 새 필드 데이터 |
| 3 | `src/lib/knowledge/vendorCatalog/arista.ts` | 주요 시리즈 새 필드 데이터 |
| 3 | 각 __tests__ 파일 | count assertion 업데이트 |

---

## 예상 효과

| UC | Before | After Phase 1 | After Phase 2 | After Phase 3 |
|----|:------:|:-------------:|:-------------:|:-------------:|
| UC-2 연결 매핑 | 30 | 40 | 70 | 85 |
| UC-4 기능/정책 | 85 | 90 | 90 | 95 |
| UC-5 필수/선택 | 5 | 5 | 60 | 85 |
| UC-6 제품 비교 | 65 | 80 | 85 | 90 |
