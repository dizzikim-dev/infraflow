/**
 * Cloud Service Catalog - Query Helpers
 *
 * Existing helpers preserved unchanged + new architecture-decision helpers.
 */

import type { InfraNodeType, InfraSpec } from '@/types/infra';
import type {
  CloudService,
  CloudProvider,
  CloudDeploymentModel,
  DeprecationWarning,
  ServiceComparison,
  EnrichedServiceComparison,
  ProviderCoverageStats,
  ServiceCategorySummary,
} from './types';
import { AWS_SERVICES } from './providers/aws';
import { AZURE_SERVICES } from './providers/azure';
import { GCP_SERVICES } from './providers/gcp';

/** Internal merged reference — avoids circular import with index.ts */
const ALL_SERVICES: CloudService[] = [
  ...AWS_SERVICES,
  ...AZURE_SERVICES,
  ...GCP_SERVICES,
];

// ---------------------------------------------------------------------------
// Existing Helpers (preserved API)
// ---------------------------------------------------------------------------

/** Get all cloud services for a specific component type */
export function getCloudServices(componentType: InfraNodeType, provider?: CloudProvider): CloudService[] {
  return ALL_SERVICES.filter(
    (s) => s.componentType === componentType && (!provider || s.provider === provider),
  );
}

/** Get deprecation warnings for services used in a spec */
export function getDeprecationWarnings(spec: InfraSpec): DeprecationWarning[] {
  const types = new Set(spec.nodes.map((n) => n.type));
  const warnings: DeprecationWarning[] = [];

  for (const svc of ALL_SERVICES) {
    if (!types.has(svc.componentType)) continue;
    if (svc.status === 'end-of-life') {
      warnings.push({
        service: svc,
        urgency: 'critical',
        messageKo: `${svc.serviceNameKo}은(는) 서비스가 종료되었습니다. ${svc.successorKo ? `${svc.successorKo}(으)로 마이그레이션하세요.` : '대체 서비스를 검토하세요.'}`,
      });
    } else if (svc.status === 'deprecated') {
      warnings.push({
        service: svc,
        urgency: 'high',
        messageKo: `${svc.serviceNameKo}은(는) 더 이상 사용되지 않습니다. ${svc.successorKo ? `${svc.successorKo}(으)로 전환을 권장합니다.` : '대체 서비스를 검토하세요.'}`,
      });
    }
  }

  return warnings.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2 };
    return order[a.urgency] - order[b.urgency];
  });
}

/** Compare services across providers for a given component type */
export function compareServices(componentType: InfraNodeType): ServiceComparison {
  const services = ALL_SERVICES.filter(
    (s) => s.componentType === componentType && s.status === 'active',
  );
  return { componentType, services };
}

/** Get alternative services for a deprecated service */
export function getAlternatives(service: CloudService): CloudService[] {
  if (service.status === 'active') return [];
  return ALL_SERVICES.filter(
    (s) =>
      s.provider === service.provider &&
      s.componentType === service.componentType &&
      s.status === 'active' &&
      s.id !== service.id,
  );
}

// ---------------------------------------------------------------------------
// New Helpers
// ---------------------------------------------------------------------------

/** Get services filtered by deployment model */
export function getServicesByDeploymentModel(
  model: CloudDeploymentModel,
  provider?: CloudProvider,
): CloudService[] {
  return ALL_SERVICES.filter(
    (s) =>
      s.deploymentModel === model &&
      s.status === 'active' &&
      (!provider || s.provider === provider),
  );
}

/** Get services that hold specific compliance certifications */
export function getServicesWithCompliance(
  frameworks: string[],
  provider?: CloudProvider,
): CloudService[] {
  const lower = frameworks.map((f) => f.toLowerCase());
  return ALL_SERVICES.filter(
    (s) =>
      s.status === 'active' &&
      (!provider || s.provider === provider) &&
      s.complianceCertifications?.some((c) => lower.includes(c.toLowerCase())),
  );
}

/** Get cloud services that integrate with a given service */
export function getIntegrationPartners(serviceId: string): CloudService[] {
  const target = ALL_SERVICES.find((s) => s.id === serviceId);
  if (!target?.integrationsWith?.length) return [];
  const partnerIds = new Set(target.integrationsWith);
  return ALL_SERVICES.filter((s) => partnerIds.has(s.id));
}

/** Get distinct service categories with counts */
export function getServiceCategories(): ServiceCategorySummary[] {
  const map = new Map<string, { categoryKo: string; count: number }>();
  for (const svc of ALL_SERVICES) {
    if (!svc.serviceCategory) continue;
    const existing = map.get(svc.serviceCategory);
    if (existing) {
      existing.count++;
    } else {
      map.set(svc.serviceCategory, {
        categoryKo: svc.serviceCategoryKo ?? svc.serviceCategory,
        count: 1,
      });
    }
  }
  return Array.from(map.entries()).map(([category, { categoryKo, count }]) => ({
    category,
    categoryKo,
    count,
  }));
}

/** Get coverage statistics per provider */
export function getProviderCoverageStats(): Record<CloudProvider, ProviderCoverageStats> {
  const providers: CloudProvider[] = ['aws', 'azure', 'gcp'];
  const result = {} as Record<CloudProvider, ProviderCoverageStats>;

  for (const p of providers) {
    const services = ALL_SERVICES.filter((s) => s.provider === p);
    const active = services.filter((s) => s.status === 'active');
    const deprecated = services.filter((s) => s.status === 'deprecated' || s.status === 'end-of-life');
    const types = new Set(services.map((s) => s.componentType));
    const enriched = services.filter(
      (s) => s.architectureRole && s.recommendedFor && s.recommendedFor.length >= 3 && s.sla,
    );
    result[p] = {
      totalServices: services.length,
      activeServices: active.length,
      deprecatedServices: deprecated.length,
      componentTypes: types.size,
      enrichedServices: enriched.length,
    };
  }

  return result;
}

/** Enhanced comparison with best-of analysis */
export function compareServicesEnriched(componentType: InfraNodeType): EnrichedServiceComparison {
  const base = compareServices(componentType);
  const result: EnrichedServiceComparison = { ...base };

  // Find best SLA
  const withSLA = base.services.filter((s) => s.sla);
  if (withSLA.length > 0) {
    const best = withSLA.reduce((a, b) => {
      const aVal = parseFloat(a.sla!.replace('%', ''));
      const bVal = parseFloat(b.sla!.replace('%', ''));
      return bVal > aVal ? b : a;
    });
    result.bestSLA = { service: best, sla: best.sla! };
  }

  // Find cheapest
  const withCost = base.services.filter((s) => s.typicalMonthlyCostUsd != null);
  if (withCost.length > 0) {
    const cheapest = withCost.reduce((a, b) =>
      a.typicalMonthlyCostUsd! <= b.typicalMonthlyCostUsd! ? a : b,
    );
    result.cheapest = { service: cheapest, cost: cheapest.typicalMonthlyCostUsd! };
  }

  // Find most features
  if (base.services.length > 0) {
    const most = base.services.reduce((a, b) =>
      a.features.length >= b.features.length ? a : b,
    );
    result.mostFeatures = { service: most, count: most.features.length };
  }

  return result;
}
