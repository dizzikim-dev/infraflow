# PR-03: Vendor Catalog 비동기 로딩 전환

## Context

`vendorCatalog/index.ts`가 22개 벤더 파일(1,100+ 제품)을 **정적 import**로 모듈 로드 시점에 전부 메모리에 적재합니다. Vercel 1GB 메모리 제한에서 ~200 동시 접속자를 넘으면 OOM 크래시 위험이 있습니다. 또한 클라이언트 번들에도 벤더 데이터가 포함되어 초기 로드 시간이 증가합니다.

이 작업은 **모든 벤더 데이터를 lazy-loading**으로 전환하여 필요할 때만 메모리에 올리고, 이후 캐시하는 구조로 바꿉니다.

## 영향 범위 분석

### Direct 사용 (allVendorCatalogs 직접 참조) — 11 파일
| 파일 | 용도 | 난이도 |
|------|------|--------|
| `vendorCatalog/index.ts` | 핵심 모듈 — 22개 정적 import + 모든 wrapper 함수 | HARD |
| `comparison/search.ts` | 벤더 제품 → ComparisonItem 변환 | EASY |
| `recommendation/matcher.ts` | vendor find() 1회 | EASY |
| `consulting/costComparator.ts` | find() + map() | MEDIUM |
| `VendorComparisonPanel.tsx` | 클라이언트 useMemo 내 사용 | MEDIUM |
| `api/.../all-products/route.ts` | for-of 반복 | EASY |
| `scripts/check-vendor-urls.ts` | for-of 반복 | EASY |
| 테스트 4파일 | array 직접 조작 | MEDIUM |

### Indirect 사용 (wrapper 함수만 사용) — 12 파일
wrapper 함수가 async가 되면 자동으로 영향 받음. 대부분 `await` 추가만 필요.

## 구현 계획 (5 Phase)

### Phase 1: Core Module 리팩터 (`vendorCatalog/index.ts`)

**목표**: 22개 정적 import 제거, 모든 public 함수를 async로 전환

```
변경 전:
import { ciscoCatalog } from './vendors/cisco';  // 22줄 정적 import
export const allVendorCatalogs = [...];           // 즉시 메모리 적재

변경 후:
// 정적 import 0개
// getAllVendorCatalogsAsync()를 유일한 데이터 소스로 사용
async function _ensureLoaded(): Promise<VendorCatalog[]> {
  return getAllVendorCatalogsAsync(); // 이미 캐시 포함
}
```

**구체적 변경**:
1. 22개 정적 import 문 삭제
2. `allVendorCatalogs` const export 삭제
3. 내부 `_ensureLoaded()` 헬퍼 추가 (= `getAllVendorCatalogsAsync()`)
4. 모든 public 함수 async 전환:
   - `getVendorList()` → `async getVendorList()`
   - `getVendor(id)` → `async getVendor(id)`
   - `getProductsByNodeType(type)` → `async getProductsByNodeType(type)`
   - `getProductsForNodeType(type)` → `async getProductsForNodeType(type)`
   - `searchProducts(query, opts)` → `async searchProducts(query, opts)`
   - `getCatalogStats()` → `async getCatalogStats()`
   - `getChildren(vendorId, nodeId)` → `async getChildren(vendorId, nodeId)`
   - `getLeafProducts(vendorId, categoryId)` → `async getLeafProducts(vendorId, categoryId)`
   - `getProductPath(vendorId, nodeId)` → `async getProductPath(vendorId, nodeId)`
5. `buildVendorMap()` → `async buildVendorMap()` (내부 헬퍼)
6. `getAllVendorCatalogsAsync()`에서 `@deprecated` 태그 제거 (이제 primary API)

**파일**: `src/lib/knowledge/vendorCatalog/index.ts`

### Phase 2: Server-side Lib Consumers

각 파일에서 `allVendorCatalogs` 직접 참조를 async wrapper로 교체:

| 파일 | 변경 |
|------|------|
| `src/lib/recommendation/matcher.ts` | `allVendorCatalogs.find()` → `(await getVendorList()).find()`, `getProductsByNodeType()` → `await getProductsByNodeType()` |
| `src/lib/consulting/costComparator.ts` | `allVendorCatalogs` 참조 2곳 → `await getVendorList()` |
| `src/lib/comparison/search.ts` | `getAllComparisonItems()` → `async getAllComparisonItems()`, `allVendorCatalogs` 반복 → `await getVendorList()` |
| `src/lib/knowledge/vendorCatalog/dataQuality.ts` | `allVendorCatalogs` 반복 → `await getVendorList()` |
| `src/lib/knowledge/graphVisualizer.ts` | `getProductsByNodeType()` → `await getProductsByNodeType()` |
| `src/lib/knowledge/index.ts` | `getProductsForNodeType` re-export 유지 (이미 async) |
| `scripts/check-vendor-urls.ts` | `allVendorCatalogs` → `await getVendorList()` |

**Cascade**: `matchVendorProducts()` (recommendation), `compareCosts()` (consulting), `searchComparisonItems()` (comparison) 모두 async로 전환됨.

### Phase 3: API Routes

API route handler는 이미 async이므로 `await` 추가만 필요:

| 파일 | 변경 |
|------|------|
| `src/app/api/knowledge/vendor-catalog/route.ts` | `getVendorList()` → `await getVendorList()` |
| `src/app/api/knowledge/vendor-catalog/[vendorId]/route.ts` | `getVendor()` → `await getVendor()` |
| `src/app/api/knowledge/vendor-catalog/all-products/route.ts` | `allVendorCatalogs` → `await getVendorList()` |
| `src/app/api/recommendation/route.ts` | `matchVendorProducts()` → `await matchVendorProducts()` |

### Phase 4: Client Components + Hooks

클라이언트 컴포넌트에서 `useMemo` 내에서 async 함수를 호출할 수 없으므로, **`useVendorData()` 커스텀 훅**을 생성:

**새 파일**: `src/hooks/useVendorData.ts`
```typescript
// 벤더 데이터를 비동기 로딩하는 훅
export function useVendorCatalogs() {
  // state: catalogs, loading
  // useEffect → getAllVendorCatalogsAsync()
  return { catalogs, loading };
}

export function useProductsByNodeType(nodeType: InfraNodeType) {
  // state: products, loading
  // useEffect → getProductsByNodeType(nodeType)
  return { products, loading };
}
```

| 파일 | 변경 |
|------|------|
| `src/components/panels/VendorComparisonPanel.tsx` | `allVendorCatalogs` → `useVendorCatalogs()`, loading state 추가 |
| `src/components/panels/node-detail/ProductsTab.tsx` | `useMemo(() => getProductsByNodeType(...))` → `useProductsByNodeType(nodeType)` |
| `src/components/panels/VendorRecommendationPanel.tsx` | `matchVendorProducts()` 이미 async이면 기존 호출에 await 추가 or 훅 사용 |
| `src/hooks/useEvidence.ts` | `matchVendorProducts()` → async 패턴으로 전환 |
| `src/lib/comparison/search.ts` | `getAllComparisonItems` async → 호출부 `useComparison` 훅에서 비동기 처리 |

### Phase 5: Tests

| 파일 | 변경 |
|------|------|
| `vendorCatalog/__tests__/index.test.ts` | `allVendorCatalogs` 직접 조작 → `getVendorList()` await + `_resetVendorCatalogCache()` |
| `vendorCatalog/__tests__/asyncLoader.test.ts` | `allVendorCatalogs` 비교 → `await getVendorList()` 비교 |
| `vendorCatalog/__tests__/dataQuality.test.ts` | `generateQualityReport()` → `await generateQualityReport()` |
| `recommendation/__tests__/matcher.test.ts` | `allVendorCatalogs` 직접 조작 → mock or `_resetVendorCatalogCache()` |
| `consulting/__tests__/costComparator.test.ts` | 이미 indirect — 자동 적용 |
| `comparison/__tests__/*.test.ts` | `getAllComparisonItems()` → `await getAllComparisonItems()` |

## 실행 순서

```
Phase 1 (Core)     → Phase 2 (Server Libs) → Phase 3 (API Routes)
                                             → Phase 4 (Client)     → Phase 5 (Tests)
```

각 Phase 완료 후 `npx tsc --noEmit && npx vitest run` 검증.

## Verification

1. `npx tsc --noEmit` — 타입 에러 없음
2. `npx vitest run` — 모든 테스트 통과
3. `vendorCatalog/index.ts`에 정적 import 0개 확인
4. `allVendorCatalogs` export가 제거되었는지 확인 (grep)
5. 기존 기능 동작 확인: 벤더 검색, 제품 추천, 비용 비교, 비교 패널
