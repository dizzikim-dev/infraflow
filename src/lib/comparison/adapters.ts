/**
 * Unified Comparison Panel — Adapters
 *
 * Converts vendor ProductNode and cloud CloudService into the unified
 * ComparisonItem shape for cross-catalog comparison.
 */

import type { ProductNode } from '@/lib/knowledge/vendorCatalog/types';
import type { CloudService } from '@/lib/knowledge/cloudCatalog/types';
import { getCategoryForType } from '@/lib/data/infrastructureDB';
import type { ComparisonItem } from './types';

// ---------------------------------------------------------------------------
// Vendor Product → ComparisonItem
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Cloud Service → ComparisonItem
// ---------------------------------------------------------------------------

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
