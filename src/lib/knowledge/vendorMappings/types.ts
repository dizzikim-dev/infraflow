/**
 * Vendor Mappings — Cloud service, managed alternative, open-source, and on-premise
 * product mappings for all InfraFlow infrastructure components.
 *
 * Supplements cloudCatalog.ts with richer vendor detail including pricing,
 * differentiators, documentation URLs, and lifecycle status.
 */

import type { InfraNodeType, NodeCategory } from '@/types/infra';

// ---------------------------------------------------------------------------
// Provider & Enum Types
// ---------------------------------------------------------------------------

/** Cloud provider identifiers (lowercase to match existing cloudCatalog.ts) */
export type CloudProvider = 'aws' | 'azure' | 'gcp';
// Extensible: 'ncp' | 'kt-cloud' | 'nhn-cloud' | 'oci' etc.

/** Pricing model categories */
export type PricingModel =
  | 'pay-per-use'
  | 'reserved'
  | 'free-tier'
  | 'subscription'
  | 'perpetual-license'
  | 'open-source'
  | 'freemium';

/** Product tier classification */
export type ProductTier = 'entry' | 'mid-range' | 'enterprise';

/** Product lifecycle status */
export type LifecycleStatus = 'active' | 'end-of-sale' | 'end-of-life';

// ---------------------------------------------------------------------------
// Mapping Interfaces
// ---------------------------------------------------------------------------

export interface CloudServiceMapping {
  id: string;
  provider: CloudProvider;
  serviceName: string;
  serviceNameKo: string;
  serviceTier?: string;
  pricingModel: PricingModel;
  differentiator: string;
  differentiatorKo: string;
  docUrl: string;
  lastVerified: string;
}

export interface ManagedAlternative {
  id: string;
  vendorName: string;
  productName: string;
  productNameKo: string;
  pricingModel: PricingModel;
  differentiator: string;
  differentiatorKo: string;
  docUrl: string;
  lastVerified: string;
}

export interface OpenSourceAlternative {
  id: string;
  projectName: string;
  projectNameKo: string;
  license: string;
  description: string;
  descriptionKo: string;
  docUrl: string;
  githubUrl?: string;
  lastVerified: string;
}

export interface OnPremProduct {
  id: string;
  vendorName: string;
  productName: string;
  productNameKo: string;
  modelSeries?: string;
  productTier: ProductTier;
  targetUseCase: string;
  targetUseCaseKo: string;
  keySpecs?: string;
  lifecycleStatus: LifecycleStatus;
  productUrl: string;
  lastVerified: string;
}

export interface ComponentVendorMap {
  componentId: InfraNodeType;
  category: NodeCategory | 'external';
  cloud: CloudServiceMapping[];
  managed: ManagedAlternative[];
  openSource: OpenSourceAlternative[];
  onPremise: OnPremProduct[];
}

// ---------------------------------------------------------------------------
// Coverage Matrix Types
// ---------------------------------------------------------------------------

export interface ComponentCoverage {
  componentId: InfraNodeType;
  category: NodeCategory | 'external';
  cloudCount: number;
  managedCount: number;
  openSourceCount: number;
  onPremCount: number;
  status: 'full' | 'partial' | 'cloud-only' | 'on-prem-only' | 'empty';
}

export interface CoverageMatrix {
  total: number;
  full: number;
  partial: number;
  empty: number;
  components: ComponentCoverage[];
  generatedAt: string;
}
