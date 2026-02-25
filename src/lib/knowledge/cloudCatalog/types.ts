/**
 * Cloud Service Catalog - Type Definitions
 *
 * Enhanced CloudService type with architecture-decision fields
 * that mirror vendor catalog patterns for unified recommendation scoring.
 */

import type { InfraNodeType } from '@/types/infra';
import type {
  TrustMetadata,
  OperationalComplexity,
  EcosystemMaturity,
  DisasterRecoveryInfo,
  RequiredCompanion,
  RecommendedCompanion,
  CompanionRef,
} from '../types';

// ---------------------------------------------------------------------------
// Enums / Unions
// ---------------------------------------------------------------------------

export type CloudProvider = 'aws' | 'azure' | 'gcp' | 'ncp' | 'kakao' | 'kt' | 'nhn';
export type ServiceStatus = 'active' | 'deprecated' | 'preview' | 'end-of-life';
export type PricingTier = 'free' | 'low' | 'medium' | 'high' | 'enterprise';
export type CloudPricingModel = 'pay-as-you-go' | 'reserved' | 'spot' | 'free-tier' | 'committed-use' | 'subscription';
export type CloudDeploymentModel = 'managed' | 'serverless' | 'self-managed' | 'hybrid';

// ---------------------------------------------------------------------------
// Core Interface
// ---------------------------------------------------------------------------

export interface CloudService {
  id: string;
  provider: CloudProvider;
  componentType: InfraNodeType;
  serviceName: string;
  serviceNameKo: string;
  status: ServiceStatus;
  successor?: string;
  successorKo?: string;
  features: string[];
  featuresKo: string[];
  pricingTier: PricingTier;
  trust: TrustMetadata;

  // ── Architecture Decision Fields (optional, backward compatible) ──

  /** Service category: 'Compute', 'Networking', 'Security', 'Database', etc. */
  serviceCategory?: string;
  serviceCategoryKo?: string;

  /** Where in the architecture: 'Edge/CDN layer', 'Data tier', etc. */
  architectureRole?: string;
  architectureRoleKo?: string;

  /** Deployment scenarios this service is recommended for (min 3 when populated) */
  recommendedFor?: string[];
  recommendedForKo?: string[];

  /** Key performance metrics */
  specs?: Record<string, string>;

  /** SLA guarantee: '99.99%', '99.95%', etc. */
  sla?: string;

  /** Availability regions: string[] or 'global' */
  regions?: string[] | 'global';

  /** Compliance certifications: ['SOC 2', 'HIPAA', 'PCI DSS', ...] */
  complianceCertifications?: string[];

  /** Related cloud service IDs for integration mapping */
  integrationsWith?: string[];
  integrationsWithKo?: string[];

  /** Pricing model */
  pricingModel?: CloudPricingModel;

  /** Reference monthly cost estimate in USD */
  typicalMonthlyCostUsd?: number;

  /** Deployment model */
  deploymentModel?: CloudDeploymentModel;

  /** Official documentation URL */
  documentationUrl?: string;

  /** Maximum capacity: '100 Gbps', '10M requests/sec', etc. */
  maxCapacity?: string;

  // ── Vendor-Parity Fields (aligns with ProductNode) ──

  /** Supported protocols/APIs for connectivity planning */
  supportedProtocols?: string[];

  /** High availability features */
  haFeatures?: string[];

  /** Security capabilities beyond basic features */
  securityCapabilities?: string[];

  // ── Comparison Fields (shared with ProductNode) ──

  /** Operational complexity for comparison */
  operationalComplexity?: OperationalComplexity;

  /** Ecosystem maturity level */
  ecosystemMaturity?: EcosystemMaturity;

  /** Disaster recovery capabilities */
  disasterRecovery?: DisasterRecoveryInfo;

  // ── Companion Dependencies ──

  /** Components that MUST exist for this service to function */
  requiredCompanions?: RequiredCompanion[];

  /** Components strongly recommended alongside this service */
  recommendedCompanions?: RecommendedCompanion[];

  /** Component types this service conflicts with */
  conflictsWith?: CompanionRef[];
}

// ---------------------------------------------------------------------------
// Supporting Types
// ---------------------------------------------------------------------------

export interface DeprecationWarning {
  service: CloudService;
  urgency: 'critical' | 'high' | 'medium';
  messageKo: string;
}

export interface ServiceComparison {
  componentType: InfraNodeType;
  services: CloudService[];
}

/** Enhanced comparison result with best-of analysis */
export interface EnrichedServiceComparison extends ServiceComparison {
  bestSLA?: { service: CloudService; sla: string };
  cheapest?: { service: CloudService; cost: number };
  mostFeatures?: { service: CloudService; count: number };
}

/** Provider coverage statistics */
export interface ProviderCoverageStats {
  totalServices: number;
  activeServices: number;
  deprecatedServices: number;
  componentTypes: number;
  enrichedServices: number;
}

/** Category summary */
export interface ServiceCategorySummary {
  category: string;
  categoryKo: string;
  count: number;
}

// ---------------------------------------------------------------------------
// Trust Helper
// ---------------------------------------------------------------------------

const VENDOR_TRUST: TrustMetadata = {
  confidence: 0.85,
  sources: [{
    type: 'vendor' as const,
    title: 'Cloud Provider Service Catalog',
    url: 'https://aws.amazon.com/products/',
    accessedDate: '2026-02-10',
  }],
  lastReviewedAt: '2026-02-10',
  upvotes: 0,
  downvotes: 0,
};

/** Generate provider-specific trust metadata */
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
