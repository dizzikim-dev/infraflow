# Unified Comparison Panel — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a unified comparison panel that lets users freely select vendor products and cloud services for side-by-side comparison with card and table views.

**Architecture:** Adapter pattern converts `ProductNode` and `CloudService` into a shared `ComparisonItem` interface. A `useComparison` hook manages basket state, search, and filters. UI uses existing `PanelContainer/PanelHeader/PanelTabs` pattern with teal (#14b8a6) theme.

**Tech Stack:** TypeScript, React 19, @xyflow/react patterns, vitest, Tailwind CSS, lucide-react

---

## Task 1: Types — ComparisonItem & ComparisonFilters

**Files:**
- Create: `src/lib/comparison/types.ts`

**Step 1: Create the types file**

```typescript
// src/lib/comparison/types.ts
import type { InfraNodeType } from '@/types/infra';
import type { CloudProvider } from '@/lib/knowledge/cloudCatalog/types';
import type {
  OperationalComplexity,
  EcosystemMaturity,
  DisasterRecoveryInfo,
} from '@/lib/knowledge/types';

/** Unified item that can be compared — adapts both ProductNode and CloudService */
export interface ComparisonItem {
  id: string;
  source: 'vendor' | 'cloud';
  name: string;
  nameKo: string;

  // Origin
  vendorName?: string;
  cloudProvider?: CloudProvider;

  // Classification
  category: string;
  nodeTypes: InfraNodeType[];
  architectureRole?: string;
  architectureRoleKo?: string;
  recommendedFor?: string[];

  // Pricing
  estimatedMonthlyCost?: number;
  pricingInfo?: string;
  pricingModel?: string;
  licensingModel?: string;

  // Performance / Capacity
  maxThroughput?: string;
  maxCapacity?: string;
  sla?: string;
  specs?: Record<string, string>;

  // Security
  securityCapabilities?: string[];
  complianceCertifications?: string[];

  // Deployment
  formFactor?: string;
  deploymentModel?: string;

  // Comparison Fields
  supportedProtocols?: string[];
  haFeatures?: string[];
  operationalComplexity?: OperationalComplexity;
  ecosystemMaturity?: EcosystemMaturity;
  disasterRecovery?: DisasterRecoveryInfo;
}

/** Filters for narrowing search results */
export interface ComparisonFilters {
  sources: ('vendor' | 'cloud')[];
  vendors: string[];
  cloudProviders: CloudProvider[];
  categories: string[];
  nodeTypes: InfraNodeType[];
}

/** Maximum number of items in a comparison basket */
export const MAX_COMPARISON_ITEMS = 4;

/** Default empty filters */
export const DEFAULT_FILTERS: ComparisonFilters = {
  sources: [],
  vendors: [],
  cloudProviders: [],
  categories: [],
  nodeTypes: [],
};
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/comparison/types.ts
git commit -m "feat(comparison): add ComparisonItem and ComparisonFilters types"
```

---

## Task 2: Adapters — ProductNode → ComparisonItem, CloudService → ComparisonItem

**Files:**
- Create: `src/lib/comparison/__tests__/adapters.test.ts`
- Create: `src/lib/comparison/adapters.ts`

**Step 1: Write the failing tests**

```typescript
// src/lib/comparison/__tests__/adapters.test.ts
import { describe, it, expect } from 'vitest';
import {
  vendorProductToComparisonItem,
  cloudServiceToComparisonItem,
} from '../adapters';
import type { ProductNode } from '@/lib/knowledge/vendorCatalog/types';
import type { CloudService } from '@/lib/knowledge/cloudCatalog/types';

describe('vendorProductToComparisonItem', () => {
  const product: ProductNode = {
    nodeId: 'cisco-fw-001',
    depth: 2,
    depthLabel: 'Model',
    depthLabelKo: '모델',
    name: 'Firepower 2130',
    nameKo: 'Firepower 2130',
    description: 'Next-gen firewall',
    descriptionKo: '차세대 방화벽',
    sourceUrl: 'https://cisco.com/fp2130',
    infraNodeTypes: ['firewall'],
    specs: { 'Throughput': '5 Gbps', 'Concurrent Sessions': '2M' },
    architectureRole: 'Perimeter Security',
    architectureRoleKo: '경계 보안',
    recommendedFor: ['Enterprise edge', 'Data center', 'Branch office'],
    recommendedForKo: ['엔터프라이즈 엣지', '데이터센터', '지사'],
    supportedProtocols: ['IPSec', 'SSL/TLS'],
    haFeatures: ['Active/Standby', 'Stateful failover'],
    securityCapabilities: ['IPS', 'URL filtering', 'AMP'],
    operationalComplexity: 'medium',
    ecosystemMaturity: 'established',
    licensingModel: 'subscription',
    maxThroughput: '5 Gbps',
    formFactor: 'appliance',
    pricingInfo: '$10,000/year',
    children: [],
  };

  it('should convert source to vendor', () => {
    const item = vendorProductToComparisonItem(product, 'Cisco');
    expect(item.source).toBe('vendor');
    expect(item.vendorName).toBe('Cisco');
    expect(item.cloudProvider).toBeUndefined();
  });

  it('should map id and names', () => {
    const item = vendorProductToComparisonItem(product, 'Cisco');
    expect(item.id).toBe('cisco-fw-001');
    expect(item.name).toBe('Firepower 2130');
    expect(item.nameKo).toBe('Firepower 2130');
  });

  it('should map classification fields', () => {
    const item = vendorProductToComparisonItem(product, 'Cisco');
    expect(item.nodeTypes).toEqual(['firewall']);
    expect(item.architectureRole).toBe('Perimeter Security');
    expect(item.recommendedFor).toEqual(['Enterprise edge', 'Data center', 'Branch office']);
  });

  it('should map pricing fields', () => {
    const item = vendorProductToComparisonItem(product, 'Cisco');
    expect(item.pricingInfo).toBe('$10,000/year');
    expect(item.licensingModel).toBe('subscription');
  });

  it('should map performance fields', () => {
    const item = vendorProductToComparisonItem(product, 'Cisco');
    expect(item.maxThroughput).toBe('5 Gbps');
    expect(item.specs).toEqual({ 'Throughput': '5 Gbps', 'Concurrent Sessions': '2M' });
  });

  it('should map security and deployment fields', () => {
    const item = vendorProductToComparisonItem(product, 'Cisco');
    expect(item.securityCapabilities).toEqual(['IPS', 'URL filtering', 'AMP']);
    expect(item.formFactor).toBe('appliance');
    expect(item.deploymentModel).toBeUndefined();
  });

  it('should map comparison fields', () => {
    const item = vendorProductToComparisonItem(product, 'Cisco');
    expect(item.supportedProtocols).toEqual(['IPSec', 'SSL/TLS']);
    expect(item.haFeatures).toEqual(['Active/Standby', 'Stateful failover']);
    expect(item.operationalComplexity).toBe('medium');
    expect(item.ecosystemMaturity).toBe('established');
  });

  it('should derive category from first infraNodeType', () => {
    const item = vendorProductToComparisonItem(product, 'Cisco');
    expect(item.category).toBe('security');
  });

  it('should handle product with no infraNodeTypes', () => {
    const bare: ProductNode = {
      ...product,
      infraNodeTypes: undefined,
    };
    const item = vendorProductToComparisonItem(bare, 'Cisco');
    expect(item.nodeTypes).toEqual([]);
    expect(item.category).toBe('unknown');
  });
});

describe('cloudServiceToComparisonItem', () => {
  const service: CloudService = {
    id: 'CS-FW-AWS-001',
    provider: 'aws',
    componentType: 'waf',
    serviceName: 'AWS WAF',
    serviceNameKo: 'AWS WAF',
    status: 'active',
    features: ['Rate limiting', 'Geo blocking', 'Bot control'],
    featuresKo: ['속도 제한', '지역 차단', '봇 제어'],
    pricingTier: 'medium',
    trust: {
      confidence: 0.85,
      sources: [{ type: 'vendor', title: 'AWS', url: 'https://aws.amazon.com/waf/', accessedDate: '2026-02-10' }],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
    serviceCategory: 'Security',
    serviceCategoryKo: '보안',
    architectureRole: 'Edge/CDN layer',
    architectureRoleKo: '엣지/CDN 계층',
    recommendedFor: ['Web app protection', 'API security', 'Bot mitigation'],
    recommendedForKo: ['웹앱 보호', 'API 보안', '봇 차단'],
    sla: '99.95%',
    typicalMonthlyCostUsd: 50,
    pricingModel: 'pay-as-you-go',
    deploymentModel: 'managed',
    complianceCertifications: ['SOC 2', 'PCI DSS', 'HIPAA'],
    supportedProtocols: ['HTTP', 'HTTPS', 'WebSocket'],
    haFeatures: ['Multi-AZ', 'Auto-scaling'],
    securityCapabilities: ['OWASP Top 10', 'Custom rules', 'Managed rules'],
    maxCapacity: '10,000 req/sec',
    operationalComplexity: 'low',
    ecosystemMaturity: 'established',
  };

  it('should convert source to cloud', () => {
    const item = cloudServiceToComparisonItem(service);
    expect(item.source).toBe('cloud');
    expect(item.cloudProvider).toBe('aws');
    expect(item.vendorName).toBeUndefined();
  });

  it('should map id and names', () => {
    const item = cloudServiceToComparisonItem(service);
    expect(item.id).toBe('CS-FW-AWS-001');
    expect(item.name).toBe('AWS WAF');
    expect(item.nameKo).toBe('AWS WAF');
  });

  it('should map classification from componentType', () => {
    const item = cloudServiceToComparisonItem(service);
    expect(item.nodeTypes).toEqual(['waf']);
    expect(item.architectureRole).toBe('Edge/CDN layer');
  });

  it('should map pricing fields', () => {
    const item = cloudServiceToComparisonItem(service);
    expect(item.estimatedMonthlyCost).toBe(50);
    expect(item.pricingModel).toBe('pay-as-you-go');
  });

  it('should map security and deployment fields', () => {
    const item = cloudServiceToComparisonItem(service);
    expect(item.securityCapabilities).toEqual(['OWASP Top 10', 'Custom rules', 'Managed rules']);
    expect(item.complianceCertifications).toEqual(['SOC 2', 'PCI DSS', 'HIPAA']);
    expect(item.deploymentModel).toBe('managed');
  });

  it('should map performance fields', () => {
    const item = cloudServiceToComparisonItem(service);
    expect(item.sla).toBe('99.95%');
    expect(item.maxCapacity).toBe('10,000 req/sec');
  });

  it('should derive category from componentType', () => {
    const item = cloudServiceToComparisonItem(service);
    expect(item.category).toBe('security');
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/comparison/__tests__/adapters.test.ts`
Expected: FAIL — module not found

**Step 3: Implement adapters**

```typescript
// src/lib/comparison/adapters.ts
import type { ProductNode } from '@/lib/knowledge/vendorCatalog/types';
import type { CloudService } from '@/lib/knowledge/cloudCatalog/types';
import { getCategoryForType } from '@/lib/data/infrastructureDB';
import type { ComparisonItem } from './types';

/** Convert a vendor ProductNode to a ComparisonItem */
export function vendorProductToComparisonItem(
  product: ProductNode,
  vendorName: string,
): ComparisonItem {
  const nodeTypes = product.infraNodeTypes ?? [];
  const firstType = nodeTypes[0];
  const category = firstType ? getCategoryForType(firstType) ?? 'unknown' : 'unknown';

  return {
    id: product.nodeId,
    source: 'vendor',
    name: product.name,
    nameKo: product.nameKo,
    vendorName,
    category,
    nodeTypes,
    architectureRole: product.architectureRole,
    architectureRoleKo: product.architectureRoleKo,
    recommendedFor: product.recommendedFor,
    pricingInfo: product.pricingInfo,
    licensingModel: product.licensingModel,
    maxThroughput: product.maxThroughput,
    specs: product.specs,
    securityCapabilities: product.securityCapabilities,
    formFactor: product.formFactor,
    supportedProtocols: product.supportedProtocols,
    haFeatures: product.haFeatures,
    operationalComplexity: product.operationalComplexity,
    ecosystemMaturity: product.ecosystemMaturity,
    disasterRecovery: product.disasterRecovery,
    complianceCertifications: undefined,
  };
}

/** Convert a CloudService to a ComparisonItem */
export function cloudServiceToComparisonItem(
  service: CloudService,
): ComparisonItem {
  const category = getCategoryForType(service.componentType) ?? 'unknown';

  return {
    id: service.id,
    source: 'cloud',
    name: service.serviceName,
    nameKo: service.serviceNameKo,
    cloudProvider: service.provider,
    category,
    nodeTypes: [service.componentType],
    architectureRole: service.architectureRole,
    architectureRoleKo: service.architectureRoleKo,
    recommendedFor: service.recommendedFor,
    estimatedMonthlyCost: service.typicalMonthlyCostUsd,
    pricingModel: service.pricingModel,
    sla: service.sla,
    maxCapacity: service.maxCapacity,
    securityCapabilities: service.securityCapabilities,
    complianceCertifications: service.complianceCertifications,
    deploymentModel: service.deploymentModel,
    supportedProtocols: service.supportedProtocols,
    haFeatures: service.haFeatures,
    operationalComplexity: service.operationalComplexity,
    ecosystemMaturity: service.ecosystemMaturity,
    disasterRecovery: service.disasterRecovery,
  };
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/comparison/__tests__/adapters.test.ts`
Expected: All PASS

**Step 5: Full verification**

Run: `npx tsc --noEmit && npx vitest run`
Expected: Clean build, all tests pass

**Step 6: Commit**

```bash
git add src/lib/comparison/adapters.ts src/lib/comparison/__tests__/adapters.test.ts
git commit -m "feat(comparison): add adapters for ProductNode and CloudService to ComparisonItem"
```

---

## Task 3: Search — Unified search across vendor + cloud catalogs

**Files:**
- Create: `src/lib/comparison/__tests__/search.test.ts`
- Create: `src/lib/comparison/search.ts`

**Step 1: Write the failing tests**

```typescript
// src/lib/comparison/__tests__/search.test.ts
import { describe, it, expect } from 'vitest';
import { searchComparisonItems, getAllComparisonItems } from '../search';
import type { ComparisonFilters } from '../types';
import { DEFAULT_FILTERS } from '../types';

describe('getAllComparisonItems', () => {
  it('should return items from both vendor and cloud catalogs', () => {
    const items = getAllComparisonItems();
    const vendors = items.filter(i => i.source === 'vendor');
    const cloud = items.filter(i => i.source === 'cloud');
    expect(vendors.length).toBeGreaterThan(0);
    expect(cloud.length).toBeGreaterThan(0);
  });

  it('should have unique ids', () => {
    const items = getAllComparisonItems();
    const ids = items.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('searchComparisonItems', () => {
  it('should return empty array for empty query with no filters', () => {
    const results = searchComparisonItems('', DEFAULT_FILTERS);
    expect(results).toEqual([]);
  });

  it('should search by name (case-insensitive)', () => {
    const results = searchComparisonItems('firepower', DEFAULT_FILTERS);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(r => r.name.toLowerCase().includes('firepower'))).toBe(true);
  });

  it('should search across both vendor and cloud', () => {
    // Search for something that exists in cloud catalog
    const results = searchComparisonItems('WAF', DEFAULT_FILTERS);
    expect(results.length).toBeGreaterThan(0);
  });

  it('should filter by source', () => {
    const filters: ComparisonFilters = { ...DEFAULT_FILTERS, sources: ['cloud'] };
    const results = searchComparisonItems('WAF', filters);
    expect(results.every(r => r.source === 'cloud')).toBe(true);
  });

  it('should filter by vendor', () => {
    const filters: ComparisonFilters = { ...DEFAULT_FILTERS, vendors: ['cisco'] };
    const results = searchComparisonItems('fire', filters);
    expect(results.every(r => r.vendorName === 'Cisco')).toBe(true);
  });

  it('should filter by cloud provider', () => {
    const filters: ComparisonFilters = { ...DEFAULT_FILTERS, cloudProviders: ['aws'] };
    const results = searchComparisonItems('WAF', filters);
    expect(results.every(r => r.cloudProvider === 'aws')).toBe(true);
  });

  it('should filter by category', () => {
    const filters: ComparisonFilters = { ...DEFAULT_FILTERS, categories: ['security'] };
    const results = searchComparisonItems('fire', filters);
    expect(results.every(r => r.category === 'security')).toBe(true);
  });

  it('should limit results to 20', () => {
    // Use a very broad search
    const results = searchComparisonItems('a', DEFAULT_FILTERS);
    expect(results.length).toBeLessThanOrEqual(20);
  });

  it('should search Korean names too', () => {
    const results = searchComparisonItems('방화벽', DEFAULT_FILTERS);
    // May or may not find results depending on catalog data, but should not throw
    expect(Array.isArray(results)).toBe(true);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/comparison/__tests__/search.test.ts`
Expected: FAIL — module not found

**Step 3: Implement search**

```typescript
// src/lib/comparison/search.ts
import { allVendorCatalogs } from '@/lib/knowledge/vendorCatalog';
import { getAllNodes } from '@/lib/knowledge/vendorCatalog/queryHelpers';
import { CLOUD_SERVICES } from '@/lib/knowledge/cloudCatalog';
import { vendorProductToComparisonItem, cloudServiceToComparisonItem } from './adapters';
import type { ComparisonItem, ComparisonFilters } from './types';

const MAX_RESULTS = 20;

/** Cache: build once, reuse across searches */
let _allItems: ComparisonItem[] | null = null;

/** Get all comparison items from both vendor and cloud catalogs */
export function getAllComparisonItems(): ComparisonItem[] {
  if (_allItems) return _allItems;

  const items: ComparisonItem[] = [];

  // Vendor products (leaf nodes with infraNodeTypes)
  for (const vendor of allVendorCatalogs) {
    const nodes = getAllNodes(vendor.products);
    for (const node of nodes) {
      if (node.infraNodeTypes && node.infraNodeTypes.length > 0) {
        items.push(vendorProductToComparisonItem(node, vendor.vendorName));
      }
    }
  }

  // Cloud services (active only)
  for (const svc of CLOUD_SERVICES) {
    if (svc.status === 'active') {
      items.push(cloudServiceToComparisonItem(svc));
    }
  }

  _allItems = items;
  return items;
}

/** Apply filters to an item — returns true if item passes all filters */
function matchesFilters(item: ComparisonItem, filters: ComparisonFilters): boolean {
  if (filters.sources.length > 0 && !filters.sources.includes(item.source)) {
    return false;
  }
  if (filters.vendors.length > 0) {
    if (item.source !== 'vendor') return false;
    const vendorId = item.vendorName?.toLowerCase().replace(/\s+/g, '-') ?? '';
    if (!filters.vendors.some(v => vendorId.includes(v))) return false;
  }
  if (filters.cloudProviders.length > 0) {
    if (item.source !== 'cloud') return false;
    if (!item.cloudProvider || !filters.cloudProviders.includes(item.cloudProvider)) return false;
  }
  if (filters.categories.length > 0 && !filters.categories.includes(item.category)) {
    return false;
  }
  if (filters.nodeTypes.length > 0) {
    if (!item.nodeTypes.some(nt => filters.nodeTypes.includes(nt))) return false;
  }
  return true;
}

/** Search comparison items by query string and filters */
export function searchComparisonItems(
  query: string,
  filters: ComparisonFilters,
): ComparisonItem[] {
  if (!query.trim()) return [];

  const q = query.toLowerCase().trim();
  const allItems = getAllComparisonItems();

  const results: ComparisonItem[] = [];

  for (const item of allItems) {
    if (results.length >= MAX_RESULTS) break;

    if (!matchesFilters(item, filters)) continue;

    const nameMatch = item.name.toLowerCase().includes(q)
      || item.nameKo.toLowerCase().includes(q);

    if (nameMatch) {
      results.push(item);
    }
  }

  return results;
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/comparison/__tests__/search.test.ts`
Expected: All PASS

**Step 5: Create index file**

```typescript
// src/lib/comparison/index.ts
export type { ComparisonItem, ComparisonFilters } from './types';
export { MAX_COMPARISON_ITEMS, DEFAULT_FILTERS } from './types';
export { vendorProductToComparisonItem, cloudServiceToComparisonItem } from './adapters';
export { searchComparisonItems, getAllComparisonItems } from './search';
```

**Step 6: Full verification**

Run: `npx tsc --noEmit && npx vitest run`
Expected: Clean build, all tests pass

**Step 7: Commit**

```bash
git add src/lib/comparison/
git commit -m "feat(comparison): add unified search across vendor + cloud catalogs"
```

---

## Task 4: useComparison Hook

**Files:**
- Create: `src/hooks/__tests__/useComparison.test.ts`
- Create: `src/hooks/useComparison.ts`

**Step 1: Write the failing tests**

```typescript
// src/hooks/__tests__/useComparison.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useComparison } from '../useComparison';

describe('useComparison', () => {
  const mockItem = (id: string, source: 'vendor' | 'cloud' = 'vendor') => ({
    id,
    source,
    name: `Item ${id}`,
    nameKo: `아이템 ${id}`,
    category: 'security',
    nodeTypes: ['firewall' as const],
  });

  it('should start with empty state', () => {
    const { result } = renderHook(() => useComparison());
    expect(result.current.items).toEqual([]);
    expect(result.current.searchQuery).toBe('');
  });

  it('should add an item', () => {
    const { result } = renderHook(() => useComparison());
    act(() => result.current.addItem(mockItem('a')));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('a');
  });

  it('should not add duplicate items', () => {
    const { result } = renderHook(() => useComparison());
    act(() => result.current.addItem(mockItem('a')));
    act(() => result.current.addItem(mockItem('a')));
    expect(result.current.items).toHaveLength(1);
  });

  it('should not exceed max 4 items', () => {
    const { result } = renderHook(() => useComparison());
    act(() => result.current.addItem(mockItem('a')));
    act(() => result.current.addItem(mockItem('b')));
    act(() => result.current.addItem(mockItem('c')));
    act(() => result.current.addItem(mockItem('d')));
    act(() => result.current.addItem(mockItem('e')));
    expect(result.current.items).toHaveLength(4);
  });

  it('should remove an item', () => {
    const { result } = renderHook(() => useComparison());
    act(() => result.current.addItem(mockItem('a')));
    act(() => result.current.addItem(mockItem('b')));
    act(() => result.current.removeItem('a'));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('b');
  });

  it('should clear all items', () => {
    const { result } = renderHook(() => useComparison());
    act(() => result.current.addItem(mockItem('a')));
    act(() => result.current.addItem(mockItem('b')));
    act(() => result.current.clearAll());
    expect(result.current.items).toEqual([]);
  });

  it('should update search query', () => {
    const { result } = renderHook(() => useComparison());
    act(() => result.current.setSearchQuery('firewall'));
    expect(result.current.searchQuery).toBe('firewall');
  });

  it('should update filters', () => {
    const { result } = renderHook(() => useComparison());
    act(() => result.current.setFilters({ sources: ['cloud'] }));
    expect(result.current.filters.sources).toEqual(['cloud']);
  });

  it('should report canCompare when >= 2 items', () => {
    const { result } = renderHook(() => useComparison());
    expect(result.current.canCompare).toBe(false);
    act(() => result.current.addItem(mockItem('a')));
    expect(result.current.canCompare).toBe(false);
    act(() => result.current.addItem(mockItem('b')));
    expect(result.current.canCompare).toBe(true);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/hooks/__tests__/useComparison.test.ts`
Expected: FAIL — module not found

**Step 3: Implement the hook**

```typescript
// src/hooks/useComparison.ts
'use client';

import { useState, useCallback, useMemo } from 'react';
import { searchComparisonItems } from '@/lib/comparison/search';
import type { ComparisonItem, ComparisonFilters } from '@/lib/comparison/types';
import { MAX_COMPARISON_ITEMS, DEFAULT_FILTERS } from '@/lib/comparison/types';

export function useComparison() {
  const [items, setItems] = useState<ComparisonItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFiltersState] = useState<ComparisonFilters>(DEFAULT_FILTERS);

  const addItem = useCallback((item: ComparisonItem) => {
    setItems(prev => {
      if (prev.length >= MAX_COMPARISON_ITEMS) return prev;
      if (prev.some(i => i.id === item.id)) return prev;
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  const setFilters = useCallback((partial: Partial<ComparisonFilters>) => {
    setFiltersState(prev => ({ ...prev, ...partial }));
  }, []);

  const searchResults = useMemo(
    () => searchComparisonItems(searchQuery, filters),
    [searchQuery, filters],
  );

  const canCompare = items.length >= 2;

  return {
    items,
    searchQuery,
    searchResults,
    filters,
    canCompare,
    addItem,
    removeItem,
    clearAll,
    setSearchQuery,
    setFilters,
  };
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/hooks/__tests__/useComparison.test.ts`
Expected: All PASS

**Step 5: Full verification**

Run: `npx tsc --noEmit && npx vitest run`
Expected: Clean build, all tests pass

**Step 6: Commit**

```bash
git add src/hooks/useComparison.ts src/hooks/__tests__/useComparison.test.ts
git commit -m "feat(comparison): add useComparison hook with basket + search"
```

---

## Task 5: Register in useModalManager

**Files:**
- Modify: `src/hooks/useModalManager.ts`

**Step 1: Add `unifiedComparison` to ModalType and ModalState**

In `src/hooks/useModalManager.ts`:
- Add `'unifiedComparison'` to the `ModalType` union (after `'evidence'`)
- Add `unifiedComparison: false` to the `ModalState` interface default
- Add `'unifiedComparison'` to `ANALYZE_GROUP` array
- Add `unifiedComparison: false` to `closeAllModals`
- Add `showUnifiedComparison: modals.unifiedComparison` convenience boolean

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors (will have errors in EditorPanels but that's ok — we handle that in Task 8)

**Step 3: Commit**

```bash
git add src/hooks/useModalManager.ts
git commit -m "feat(comparison): register unifiedComparison in modal manager"
```

---

## Task 6: ComparisonSearchBar Component

**Files:**
- Create: `src/components/panels/unified-comparison/ComparisonSearchBar.tsx`

**Step 1: Create the search bar component**

Key features:
- Text input with search icon (lucide `Search`)
- Filter chips below: Source (벤더/클라우드), Vendor (Cisco/Fortinet/Palo Alto/Arista), Cloud (AWS/Azure/GCP), Category (Security/Network/Compute/Cloud/Storage/Auth)
- Dropdown results list with "비교에 추가" button per item
- Source badge: cyan for vendor, purple for cloud
- Debounced search (300ms via setTimeout)

Props:
```typescript
interface ComparisonSearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  filters: ComparisonFilters;
  onFiltersChange: (f: Partial<ComparisonFilters>) => void;
  results: ComparisonItem[];
  onAddItem: (item: ComparisonItem) => void;
  selectedIds: Set<string>;
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/components/panels/unified-comparison/ComparisonSearchBar.tsx
git commit -m "feat(comparison): add ComparisonSearchBar with filters and results dropdown"
```

---

## Task 7: ComparisonBasket, ComparisonCards, ComparisonTable Components

**Files:**
- Create: `src/components/panels/unified-comparison/ComparisonBasket.tsx`
- Create: `src/components/panels/unified-comparison/ComparisonCards.tsx`
- Create: `src/components/panels/unified-comparison/ComparisonTable.tsx`

### ComparisonBasket

Selected items displayed as removable chips with source badges.

Props:
```typescript
interface ComparisonBasketProps {
  items: ComparisonItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
}
```

### ComparisonCards

Horizontal card grid. Each card shows: name, source badge, price, architecture role, top specs, security badges, deployment model.

Props:
```typescript
interface ComparisonCardsProps {
  items: ComparisonItem[];
}
```

### ComparisonTable

Row-based comparison table. Columns = items. Rows = comparison fields. Diff highlighting (green for best value).

Props:
```typescript
interface ComparisonTableProps {
  items: ComparisonItem[];
}
```

Comparison rows (in order):
1. Source — vendor/cloud badge
2. Price — estimatedMonthlyCost (lowest = green)
3. SLA — percentage (highest = green)
4. Architecture Role
5. Throughput — maxThroughput / maxCapacity
6. HA Features — list (most = green)
7. Security Capabilities — list (most = green)
8. Protocols — list
9. Compliance — list
10. Deployment Model / Form Factor
11. Operational Complexity — low/medium/high (lowest = green)
12. Ecosystem Maturity

**Step 1: Create all three files**

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/components/panels/unified-comparison/
git commit -m "feat(comparison): add ComparisonBasket, ComparisonCards, ComparisonTable"
```

---

## Task 8: UnifiedComparisonPanel + Integration

**Files:**
- Create: `src/components/panels/unified-comparison/UnifiedComparisonPanel.tsx`
- Modify: `src/components/editor/EditorPanels.tsx`

### UnifiedComparisonPanel

Main panel component that wires everything together:

```typescript
interface UnifiedComparisonPanelProps {
  onClose: () => void;
}
```

Structure:
- `PanelContainer` (widthClass `w-[600px]`)
- `PanelHeader` (icon: `GitCompareArrows` from lucide, iconColor: `text-teal-400`, title: `통합 비교 / Unified Comparison`)
- `ComparisonSearchBar`
- `ComparisonBasket` (if items.length > 0)
- `PanelTabs` with [카드 / Cards] [테이블 / Table] (activeClassName uses teal theme)
- `ComparisonCards` or `ComparisonTable` based on active tab
- Footer with item count + reset button

Uses `useComparison()` hook internally.

### EditorPanels Integration

1. Add dynamic import for `UnifiedComparisonPanel`
2. Add `showUnifiedComparison` prop
3. Add `<AnimatePresence>` block for the panel

**Step 1: Create UnifiedComparisonPanel**

**Step 2: Modify EditorPanels**

Add to imports:
```typescript
const UnifiedComparisonPanel = dynamic(
  () => import('@/components/panels/unified-comparison/UnifiedComparisonPanel').then(mod => ({ default: mod.UnifiedComparisonPanel })),
  { ssr: false }
);
```

Add to `EditorPanelsProps`:
```typescript
showUnifiedComparison: boolean;
```

Add to JSX (after CostComparison):
```typescript
<AnimatePresence>
  {showUnifiedComparison && (
    <UnifiedComparisonPanel
      onClose={() => closeModal('unifiedComparison')}
    />
  )}
</AnimatePresence>
```

**Step 3: Wire up in InfraEditor**

Pass `showUnifiedComparison` prop from `useModalManager` through to `EditorPanels`.

**Step 4: Full verification**

Run: `npx tsc --noEmit && npx vitest run`
Expected: Clean build, all tests pass

**Step 5: Commit**

```bash
git add src/components/panels/unified-comparison/ src/components/editor/EditorPanels.tsx
git commit -m "feat(comparison): add UnifiedComparisonPanel and integrate into EditorPanels"
```

---

## Task 9: Trigger Button in Sidebar/Toolbar

**Files:**
- Modify: `src/components/editor/InfraEditor.tsx` (or sidebar component)

**Step 1: Add a "통합 비교" button**

Find where the other analyze buttons are rendered (vendorComparison, costComparison, etc.) and add a new button:
- Icon: `GitCompareArrows` from lucide-react
- Label: `통합 비교`
- onClick: `openModal('unifiedComparison')`
- Color: teal theme

**Step 2: Full verification**

Run: `npx tsc --noEmit && npx vitest run`
Expected: Clean build, all tests pass

**Step 3: Commit**

```bash
git add src/components/editor/
git commit -m "feat(comparison): add unified comparison trigger button to editor toolbar"
```

---

## Task 10: Final Verification & Cleanup

**Step 1: Run full verification loop**

```bash
npx tsc --noEmit && npx vitest run
```

Expected: Clean build, all tests pass

**Step 2: Test manually in browser**

```bash
npm run dev
```

Open http://localhost:3000, click "통합 비교" button, verify:
- [ ] Panel opens with teal theme
- [ ] Search bar works, shows results from both vendors and cloud
- [ ] Filters narrow results correctly
- [ ] Can add items to basket (max 4)
- [ ] Card view shows side-by-side comparison
- [ ] Table view shows detailed comparison with diff highlighting
- [ ] Can remove items and clear all
- [ ] Panel closes correctly
- [ ] Other panels still work (vendor comparison, cost comparison)

**Step 3: Final commit (if any tweaks needed)**

```bash
git add -A
git commit -m "feat(comparison): unified comparison panel — final polish"
```

---

## Summary

| Task | Description | New Files | Modified Files |
|------|-------------|-----------|----------------|
| 1 | Types | `src/lib/comparison/types.ts` | — |
| 2 | Adapters + tests | `adapters.ts`, `adapters.test.ts` | — |
| 3 | Search + tests | `search.ts`, `search.test.ts`, `index.ts` | — |
| 4 | useComparison hook | `useComparison.ts`, `useComparison.test.ts` | — |
| 5 | Modal registration | — | `useModalManager.ts` |
| 6 | SearchBar component | `ComparisonSearchBar.tsx` | — |
| 7 | Basket + Cards + Table | 3 component files | — |
| 8 | Main panel + integration | `UnifiedComparisonPanel.tsx` | `EditorPanels.tsx` |
| 9 | Trigger button | — | `InfraEditor.tsx` |
| 10 | Verification | — | — |

**Total: ~10 new files, ~3 modified files, ~30 tests**
