# Unified Comparison Panel — Design Document

> Date: 2026-02-22
> Status: Approved
> Author: AI + Hyunki

## Problem

현재 InfraFlow의 비교 기능은 사용자가 **비교 대상을 직접 선택할 수 없음**:

- `VendorComparisonPanel`: 노드 타입 선택 → 4개 벤더 전부 표시 (필터링 없음)
- `CostComparisonPanel`: 현재 스펙 기반 → 4개 벤더 전부 자동 비교
- `CostEstimatorPanel`: 클라우드 프로바이더 1개만 선택 (비교 아님)

**사용자 니즈**: "이 제품 vs 저 제품", "Cisco 방화벽 vs AWS WAF", "벤더 A vs 클라우드 B" 같은 자유로운 비교.

## Solution: UnifiedComparisonPanel

기존 패널 시스템(`PanelContainer` + `PanelHeader` + `PanelTabs`) 위에 **하나의 통합 비교 패널**을 추가.

### Approach: Option A — 통합 패널

- 기존 패널 패턴과 일관성 유지 (600px 사이드 패널)
- 검색 + 필터로 비교 대상 자유 선택
- 카드 비교 (간략) + 테이블 비교 (상세)
- 벤더 제품 + 클라우드 서비스 교차 비교 지원

Rejected alternatives:
- Option B (전용 페이지): 다이어그램 컨텍스트 단절
- Option C (하이브리드): 두 레이아웃 관리 복잡도

## Data Model

### ComparisonItem (통합 비교 인터페이스)

벤더 `ProductNode`와 클라우드 `CloudService`를 공통 인터페이스로 통합. 기존 타입은 변경하지 않고 어댑터 패턴 사용.

```typescript
interface ComparisonItem {
  id: string;                          // productNode.nodeId | cloudService.id
  source: 'vendor' | 'cloud';
  name: string;
  nameKo: string;

  // Origin
  vendorName?: string;                 // 'Cisco', 'Fortinet', etc.
  cloudProvider?: CloudProvider;       // 'aws' | 'azure' | 'gcp'

  // Classification
  category: string;                    // NodeCategory
  nodeTypes: InfraNodeType[];
  architectureRole?: string;
  architectureRoleKo?: string;
  recommendedFor?: string[];

  // Pricing
  estimatedMonthlyCost?: number;       // USD monthly
  pricingInfo?: string;
  pricingModel?: string;               // pay-as-you-go, subscription, etc.
  licensingModel?: string;             // perpetual, subscription, credit-based, etc.

  // Performance / Capacity
  maxThroughput?: string;
  maxCapacity?: string;
  sla?: string;
  specs?: Record<string, string>;

  // Security
  securityCapabilities?: string[];
  complianceCertifications?: string[];

  // Deployment
  formFactor?: string;                 // appliance, chassis, virtual, cloud, container
  deploymentModel?: string;            // managed, serverless, self-managed, hybrid

  // Comparison Fields (shared)
  supportedProtocols?: string[];
  haFeatures?: string[];
  operationalComplexity?: OperationalComplexity;
  ecosystemMaturity?: EcosystemMaturity;
  disasterRecovery?: DisasterRecoveryInfo;
}
```

### Adapters

```typescript
// ProductNode → ComparisonItem
function vendorProductToComparisonItem(product: ProductNode, vendorName: string): ComparisonItem

// CloudService → ComparisonItem
function cloudServiceToComparisonItem(service: CloudService): ComparisonItem
```

## UI Architecture

### Component Tree

```
UnifiedComparisonPanel (PanelContainer, 600px)
│
├── PanelHeader: "통합 비교 / Unified Comparison" (teal theme)
│
├── ComparisonSearchBar
│   ├── Search input (제품명/서비스명 검색)
│   ├── Filter chips: [벤더] [클라우드] [카테고리] [노드타입]
│   └── Search results dropdown
│       ├── Result item — [+ 비교에 추가] button
│       └── Source badge (Cisco | AWS | Fortinet 등)
│
├── ComparisonBasket (selected items, 2~4)
│   ├── Item chip (name + source badge + × remove)
│   └── "비교하기" button (active when ≥2 items)
│
├── PanelTabs: [카드 비교 / Cards] [테이블 비교 / Table]
│
├── ComparisonCards (tab 1)
│   └── Horizontal card grid for each selected item
│       ├── Name + source badge
│       ├── Price (monthly)
│       ├── Architecture role
│       ├── Top 3-4 specs
│       ├── Security capability badges
│       └── Deployment model
│
├── ComparisonTable (tab 2)
│   └── Rows: comparison fields | Item A | Item B | [Item C]
│       ├── Price row (lowest = green highlight)
│       ├── SLA row (highest = green)
│       ├── Throughput row
│       ├── HA features row
│       ├── Security capabilities row
│       ├── Protocols row
│       ├── Compliance row
│       ├── Deployment model row
│       └── Diff highlighting for different values
│
└── Footer: item count + "초기화 / Reset" button
```

### Diff Highlighting Rules

In table view, when values differ across items:
- **Price**: Lowest gets green background
- **SLA**: Highest gets green background
- **Feature count** (HA, security, protocols): Most features = green
- **Identical values**: No highlighting
- **Missing values**: Gray "N/A" badge

### Color Theme

- Primary: Teal (#14b8a6) — distinct from existing panels (cyan=vendor, amber=cost, green=estimator)
- Source badges: Cyan for vendor products, Purple for cloud services

## Hook: useComparison

```typescript
interface UseComparisonReturn {
  // State
  items: ComparisonItem[];         // selected items (max 4)
  searchQuery: string;
  searchResults: ComparisonItem[];
  filters: ComparisonFilters;

  // Actions
  addItem: (item: ComparisonItem) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<ComparisonFilters>) => void;
}

interface ComparisonFilters {
  sources: ('vendor' | 'cloud')[];
  vendors: string[];              // vendorId[]
  cloudProviders: CloudProvider[];
  categories: string[];           // NodeCategory[]
  nodeTypes: InfraNodeType[];
}
```

## Search Behavior

1. User types in search bar → debounced (300ms) search across:
   - All `ProductNode` names (flat via `getAllNodes()`)
   - All `CloudService` names
2. Filter chips narrow results before search
3. Results show source badge + category + matching field highlight
4. "비교에 추가" button appends to basket (max 4)
5. Same item can't be added twice (deduplicate by id)

## File Structure

```
src/
├── lib/comparison/
│   ├── types.ts              # ComparisonItem, ComparisonFilters
│   ├── adapters.ts           # vendorProductToComparisonItem, cloudServiceToComparisonItem
│   ├── search.ts             # searchComparisonItems() — unified search across catalogs
│   └── __tests__/
│       ├── adapters.test.ts
│       └── search.test.ts
├── hooks/
│   └── useComparison.ts      # useComparison hook
├── components/panels/
│   └── unified-comparison/
│       ├── UnifiedComparisonPanel.tsx   # Main panel
│       ├── ComparisonSearchBar.tsx      # Search + filter
│       ├── ComparisonBasket.tsx         # Selected items
│       ├── ComparisonCards.tsx          # Card view tab
│       └── ComparisonTable.tsx          # Table view tab
```

## Integration

- Register `'unifiedComparison'` in `useModalManager`
- Add trigger button in editor toolbar / sidebar
- Existing `VendorComparisonPanel` and `CostComparisonPanel` remain as-is (backward compatible)

## Test Plan

- **Unit tests**: adapters (ProductNode→ComparisonItem, CloudService→ComparisonItem)
- **Unit tests**: search function (query matching, filter application)
- **Unit tests**: useComparison hook (add/remove/clear/filter)
- **Component tests**: Panel rendering, search interaction, tab switching
