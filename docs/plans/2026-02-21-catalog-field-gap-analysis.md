# Catalog Field Gap Analysis — Vendor & Cloud

> Date: 2026-02-21
> Status: Analysis Complete
> Scope: ProductNode (Vendor) + CloudService (Cloud) field sufficiency for InfraFlow core use cases

---

## 1. 분석 목적

InfraFlow의 6가지 핵심 유즈케이스에 대해 현재 벤더 카탈로그(416+ 제품)와 클라우드 카탈로그(111 서비스)의 데이터 필드가 충분한지 평가하고, 공통 갭을 도출한다.

## 2. 6가지 핵심 유즈케이스

| # | 유즈케이스 | 설명 |
|---|-----------|------|
| UC-1 | AI 다이어그램 자동생성 | 자연어 → 인프라 다이어그램 자동 구성 |
| UC-2 | 노드 간 연결 매핑 | 어떤 서비스/제품이 어디에 연결되는지 자동 판단 |
| UC-3 | 구간/레이어별 필요 서비스 표시 | 아키텍처 각 구간에 필요한 컴포넌트 추천 |
| UC-4 | 기능/정책 정보 | 제품/서비스의 기능, 보안, 정책 정보 표시 |
| UC-5 | 필수/선택 여부 판단 | 아키텍처에서 이 제품이 필수인지, 선택인지 자동 판단 |
| UC-6 | 제품별 특장점 비교 | 동일 역할 제품 간 객관적 비교 |

## 3. 현재 상태 — 필드별 커버리지

### 3.1 양쪽 모두 잘 되어 있는 필드

| 필드 | Vendor (ProductNode) | Cloud (CloudService) | 지원 UC |
|------|:--------------------:|:--------------------:|---------|
| `architectureRole` / Ko | 채워짐 | 채워짐 | UC-1, UC-3 |
| `recommendedFor` / Ko (3개+) | 채워짐 | 채워짐 | UC-3, UC-6 |
| `specs` | 채워짐 | 채워짐 | UC-4, UC-6 |
| `infraNodeTypes` / `componentType` | 채워짐 | 채워짐 | UC-1, UC-2 |
| `lifecycle` / `status` | 채워짐 | 채워짐 | UC-6 |

### 3.2 벤더에만 있고 클라우드에 없는 필드

| 필드 | Vendor 상태 | Cloud 상태 | 필요성 |
|------|:----------:|:----------:|--------|
| `supportedProtocols` | 채워짐 (OSPF, BGP, VXLAN, EVPN...) | **없음** | 클라우드도 필요 (HTTP, gRPC, AMQP, JDBC...) |
| `haFeatures` | 채워짐 (SSO, NSF, ISSU, GIR...) | **없음** | 클라우드도 필요 (Multi-AZ, Auto-failover...) |
| `securityCapabilities` | 채워짐 (MACsec, ETA, TrustSec...) | **없음** | 클라우드도 필요 (Encryption at rest, KMS...) |
| `formFactor` | 채워짐 | 해당없음 | 클라우드는 물리 장비 아님 |
| `maxThroughput` | 채워짐 | `maxCapacity`로 대체 | 유사 역할 |
| `licensingModel` | 채워짐 | `pricingModel`로 대체 | 유사 역할 |

### 3.3 클라우드에만 있고 벤더에 없는 필드

| 필드 | Cloud 상태 | Vendor 필요성 |
|------|:----------:|--------------|
| `sla` | 채워짐 (99.99% 등) | 벤더는 SLA보다 MTBF/HA가 중요 → 불필요 |
| `complianceCertifications` | 채워짐 | 벤더 제품 자체보다 조직 레벨 → 불필요 |
| `deploymentModel` | 채워짐 | 벤더는 `formFactor`가 이 역할 → 불필요 |
| `pricingTier` | 채워짐 | 벤더는 `pricingInfo`로 충분 → 불필요 |
| `typicalMonthlyCostUsd` | 채워짐 | 벤더는 CAPEX 모델이라 월비용 부적합 → 불필요 |

### 3.4 양쪽 모두 없는 필드 (공통 갭)

| 갭 | 영향 UC | 심각도 | 설명 |
|----|---------|--------|------|
| 연결 방향성 (upstream/downstream) | UC-2 | **Critical** | generic relationships.ts(115개)에는 있지만, 제품/서비스 레벨에선 매핑 없음 |
| 필수/선택 의존성 | UC-5 | **Critical** | "이 제품을 쓰면 반드시 필요한 것" 데이터 양쪽 모두 없음 |
| 운영 복잡도 | UC-6 | Medium | simple/moderate/complex 구분 양쪽 모두 없음 |
| 생태계 성숙도 | UC-6 | Medium | emerging/stable/mature 양쪽 모두 없음 |
| DR 능력 (RTO/RPO) | UC-6 | Medium | 양쪽 모두 없음 |

## 4. 기존 인프라 활용 가능한 부분

### relationships.ts (115개 관계)

Generic 컴포넌트 레벨에서 이미 연결/의존성 모델이 존재:

```
firewall → web-server (requires, upstream)
web-server → load-balancer (recommends, upstream)
vpn-gateway → mfa (recommends, downstream)
db-server → backup (recommends, downstream)
```

각 관계에는 `strength` (mandatory/strong/weak), `direction` (upstream/downstream/bidirectional), trust metadata가 포함.

**문제**: 이 관계는 generic 타입(`firewall`, `web-server`) 간에만 존재. 특정 제품(`FortiGate 600F`)이나 서비스(`AWS Network Firewall`) 레벨로 전파되지 않음.

### Scoring Engine (matcher + scorer)

벤더/클라우드 모두 4차원 스코어링:
- `typeMatch` (0-40): componentType 일치
- `architectureRoleFit` (0-25): 아키텍처 역할 매칭
- `useCaseOverlap` (0-20): recommendedFor 오버랩
- `haFeatureMatch` / `complianceFit` (0-15): 벤더=HA, 클라우드=컴플라이언스

### Gap Analyzer

6가지 갭 탐지: missing/excess/upgrade/security/compliance/performance
- Generic 레벨 체크만 수행 (프로토콜/능력 갭 체크 없음)

## 5. 유즈케이스별 종합 평점

| UC | Vendor | Cloud | 공통 갭 |
|----|:------:|:-----:|---------|
| UC-1 AI 다이어그램 자동생성 | 90 | 90 | - |
| UC-2 노드 간 연결 매핑 | 35 | 25 | 제품/서비스 레벨 연결 데이터 없음 |
| UC-3 구간/레이어별 필요 서비스 | 90 | 95 | - |
| UC-4 기능/정책 정보 | 95 | 75 | 클라우드에 HA/Security 필드 부족 |
| UC-5 필수/선택 여부 판단 | 10 | 0 | 양쪽 모두 의존성 필드 없음 |
| UC-6 제품별 특장점 비교 | 70 | 60 | 운영복잡도/성숙도/DR 없음 |
| **평균** | **65** | **58** | |

## 6. 결론

1. **UC-2, UC-5가 가장 심각한 공통 갭** — 양쪽 모두 연결 방향성과 의존성 데이터가 없음
2. **클라우드 카탈로그에 벤더의 3개 필드를 추가해야 함** — `supportedProtocols`, `haFeatures`, `securityCapabilities`
3. **공통 비교 필드 3개를 양쪽에 추가해야 함** — `operationalComplexity`, `ecosystemMaturity`, `disasterRecovery`
4. **기존 relationships.ts 인프라를 활용하여 제품/서비스 레벨 의존성을 표현해야 함**

---

> 구현 계획: `docs/plans/2026-02-21-catalog-enrichment-plan.md` 참조
