/**
 * Vendor Mappings — Unified query API
 *
 * Merges all category-specific vendor mapping data and provides
 * query functions for looking up cloud services, managed alternatives,
 * open-source options, and on-premise products by component type.
 */

import type { InfraNodeType, NodeCategory } from '@/types/infra';
import type {
  ComponentVendorMap,
  CloudProvider,
  CloudServiceMapping,
  ManagedAlternative,
  OpenSourceAlternative,
  OnPremProduct,
  ProductTier,
  ComponentCoverage,
  CoverageMatrix,
} from './types';
import { securityVendorMappings } from './security';
import { networkCoreVendorMappings } from './network-core';
import { networkWanVendorMappings } from './network-wan';
import { computeVendorMappings } from './compute';
import { dataVendorMappings } from './data';
import { telecomVendorMappings } from './telecom';

// ---------------------------------------------------------------------------
// Merged dataset
// ---------------------------------------------------------------------------

export const allVendorMappings: ComponentVendorMap[] = [
  ...securityVendorMappings,
  ...networkCoreVendorMappings,
  ...networkWanVendorMappings,
  ...computeVendorMappings,
  ...dataVendorMappings,
  ...telecomVendorMappings,
];

/** Lookup index: componentId → ComponentVendorMap */
const byComponentId = new Map<string, ComponentVendorMap>(
  allVendorMappings.map((m) => [m.componentId, m]),
);

// ---------------------------------------------------------------------------
// Query functions
// ---------------------------------------------------------------------------

/** Get the full vendor map for a single component */
export function getVendorMap(
  componentId: InfraNodeType,
): ComponentVendorMap | undefined {
  return byComponentId.get(componentId);
}

/** Get cloud service options for a component, optionally filtered by provider */
export function getCloudOptions(
  componentId: InfraNodeType,
  provider?: CloudProvider,
): CloudServiceMapping[] {
  const map = byComponentId.get(componentId);
  if (!map) return [];
  if (provider) return map.cloud.filter((c) => c.provider === provider);
  return map.cloud;
}

/** Get managed/SaaS alternatives for a component */
export function getManagedOptions(
  componentId: InfraNodeType,
): ManagedAlternative[] {
  const map = byComponentId.get(componentId);
  return map?.managed ?? [];
}

/** Get open-source alternatives for a component */
export function getOpenSourceOptions(
  componentId: InfraNodeType,
): OpenSourceAlternative[] {
  const map = byComponentId.get(componentId);
  return map?.openSource ?? [];
}

/** Get on-premise products for a component, optionally filtered by tier */
export function getOnPremOptions(
  componentId: InfraNodeType,
  tier?: ProductTier,
): OnPremProduct[] {
  const map = byComponentId.get(componentId);
  if (!map) return [];
  if (tier) return map.onPremise.filter((p) => p.productTier === tier);
  return map.onPremise;
}

/** Get all vendor maps for a specific category */
export function getByCategory(
  category: NodeCategory | 'external',
): ComponentVendorMap[] {
  return allVendorMappings.filter((m) => m.category === category);
}

/** Search across all vendor mappings by keyword (case-insensitive) */
export function searchVendorMappings(query: string): ComponentVendorMap[] {
  const q = query.toLowerCase();
  return allVendorMappings.filter((m) => {
    const texts = [
      m.componentId,
      ...m.cloud.map((c) => `${c.serviceName} ${c.serviceNameKo}`),
      ...m.managed.map((a) => `${a.productName} ${a.productNameKo} ${a.vendorName}`),
      ...m.openSource.map((o) => `${o.projectName} ${o.projectNameKo}`),
      ...m.onPremise.map((p) => `${p.productName} ${p.productNameKo} ${p.vendorName}`),
    ];
    return texts.some((t) => t.toLowerCase().includes(q));
  });
}

// ---------------------------------------------------------------------------
// Coverage matrix
// ---------------------------------------------------------------------------

function classifyCoverage(m: ComponentVendorMap): ComponentCoverage['status'] {
  const hasCloud = m.cloud.length > 0;
  const hasOnPrem = m.onPremise.length > 0;
  const hasManaged = m.managed.length > 0;
  const hasOss = m.openSource.length > 0;

  if (hasCloud && hasOnPrem && (hasManaged || hasOss)) return 'full';
  if (hasCloud && !hasOnPrem) return 'cloud-only';
  if (!hasCloud && hasOnPrem) return 'on-prem-only';
  if (hasCloud || hasOnPrem || hasManaged || hasOss) return 'partial';
  return 'empty';
}

/** Generate a coverage matrix for all mapped components */
export function getCoverageMatrix(): CoverageMatrix {
  const components: ComponentCoverage[] = allVendorMappings.map((m) => ({
    componentId: m.componentId,
    category: m.category,
    cloudCount: m.cloud.length,
    managedCount: m.managed.length,
    openSourceCount: m.openSource.length,
    onPremCount: m.onPremise.length,
    status: classifyCoverage(m),
  }));

  return {
    total: components.length,
    full: components.filter((c) => c.status === 'full').length,
    partial: components.filter((c) => c.status === 'partial' || c.status === 'cloud-only' || c.status === 'on-prem-only').length,
    empty: components.filter((c) => c.status === 'empty').length,
    components,
    generatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export type {
  ComponentVendorMap,
  CloudServiceMapping,
  ManagedAlternative,
  OpenSourceAlternative,
  OnPremProduct,
  CloudProvider,
  ProductTier,
  LifecycleStatus,
  PricingModel,
  ComponentCoverage,
  CoverageMatrix,
} from './types';
