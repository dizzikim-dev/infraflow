/**
 * Unified Comparison Panel — Type Definitions
 *
 * Provides a unified ComparisonItem type that adapts both vendor ProductNode
 * and cloud CloudService into a single comparable shape.
 */

import type { InfraNodeType } from '@/types/infra';
import type { CloudProvider } from '@/lib/knowledge/cloudCatalog/types';
import type {
  OperationalComplexity,
  EcosystemMaturity,
  DisasterRecoveryInfo,
} from '@/lib/knowledge/types';

// ---------------------------------------------------------------------------
// ComparisonItem — unified shape for vendor products and cloud services
// ---------------------------------------------------------------------------

/** Unified item that can be compared — adapts both ProductNode and CloudService */
export interface ComparisonItem {
  id: string;
  source: 'vendor' | 'cloud';
  name: string;
  nameKo: string;
  vendorName?: string;
  cloudProvider?: CloudProvider;
  category: string;
  nodeTypes: InfraNodeType[];
  architectureRole?: string;
  architectureRoleKo?: string;
  recommendedFor?: string[];
  estimatedMonthlyCost?: number;
  pricingInfo?: string;
  pricingModel?: string;
  licensingModel?: string;
  maxThroughput?: string;
  maxCapacity?: string;
  sla?: string;
  specs?: Record<string, string>;
  securityCapabilities?: string[];
  complianceCertifications?: string[];
  formFactor?: string;
  deploymentModel?: string;
  supportedProtocols?: string[];
  haFeatures?: string[];
  operationalComplexity?: OperationalComplexity;
  ecosystemMaturity?: EcosystemMaturity;
  disasterRecovery?: DisasterRecoveryInfo;
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export interface ComparisonFilters {
  sources: ('vendor' | 'cloud')[];
  vendors: string[];
  cloudProviders: CloudProvider[];
  categories: string[];
  nodeTypes: InfraNodeType[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const MAX_COMPARISON_ITEMS = 4;

export const DEFAULT_FILTERS: ComparisonFilters = {
  sources: [],
  vendors: [],
  cloudProviders: [],
  categories: [],
  nodeTypes: [],
};
