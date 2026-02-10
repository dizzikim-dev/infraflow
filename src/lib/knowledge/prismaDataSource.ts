/**
 * Prisma Data Source — reads knowledge data from PostgreSQL via Prisma.
 *
 * This data source converts Prisma models back to the runtime types
 * expected by the rest of the application. For AntiPattern records,
 * it injects the detection function from the detectionRegistry.
 */

import type { PrismaClient } from '@/generated/prisma';
import type { KnowledgeDataSource, KnowledgeFilter, CloudServiceData } from './dataSource';
import type {
  ComponentRelationship,
  ArchitecturePattern,
  AntiPattern,
  FailureScenario,
  PerformanceProfile,
  VulnerabilityEntry,
  TrustMetadata,
} from './types';
import type { InfraNodeType } from '@/types/infra';
import { getDetectionFunction } from './detectionRegistry';

/** Build Prisma-compatible where clause for common filters */
function buildWhere(filters?: KnowledgeFilter) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = { isActive: filters?.isActive ?? true };

  if (filters?.tags && filters.tags.length > 0) {
    where.tags = { hasSome: filters.tags };
  }

  return where;
}

/** Build OR-based search condition for given field names */
function buildSearchOr(fields: string[], search?: string) {
  if (!search) return undefined;
  return fields.map((field) => ({
    [field]: { contains: search, mode: 'insensitive' as const },
  }));
}

export class PrismaDataSource implements KnowledgeDataSource {
  constructor(private prisma: PrismaClient) {}

  async getRelationships(filters?: KnowledgeFilter): Promise<ComponentRelationship[]> {
    const where = buildWhere(filters);
    const searchOr = buildSearchOr(['reason', 'reasonKo', 'sourceComponent', 'targetComponent'], filters?.search);
    if (searchOr) where.OR = searchOr;
    if (filters?.component) {
      where.OR = [
        { sourceComponent: filters.component },
        { targetComponent: filters.component },
      ];
    }

    const rows = await this.prisma.knowledgeRelationship.findMany({ where });

    return rows.map((r) => ({
      id: r.knowledgeId,
      type: 'relationship' as const,
      source: r.sourceComponent as InfraNodeType,
      target: r.targetComponent as InfraNodeType,
      relationshipType: r.relationshipType as ComponentRelationship['relationshipType'],
      strength: r.strength as ComponentRelationship['strength'],
      direction: r.direction as ComponentRelationship['direction'],
      reason: r.reason,
      reasonKo: r.reasonKo,
      tags: r.tags,
      trust: r.trustMetadata as unknown as TrustMetadata,
    }));
  }

  async getPatterns(filters?: KnowledgeFilter): Promise<ArchitecturePattern[]> {
    const where = buildWhere(filters);
    const searchOr = buildSearchOr(['name', 'nameKo', 'description', 'descriptionKo'], filters?.search);
    if (searchOr) where.OR = searchOr;

    const rows = await this.prisma.knowledgePattern.findMany({ where });

    return rows.map((r) => ({
      id: r.patternId,
      type: 'pattern' as const,
      name: r.name,
      nameKo: r.nameKo,
      description: r.description,
      descriptionKo: r.descriptionKo,
      requiredComponents: r.requiredComponents as ArchitecturePattern['requiredComponents'],
      optionalComponents: r.optionalComponents as ArchitecturePattern['optionalComponents'],
      scalability: r.scalability as ArchitecturePattern['scalability'],
      complexity: r.complexity as ArchitecturePattern['complexity'],
      bestForKo: r.bestForKo,
      notSuitableForKo: r.notSuitableForKo,
      evolvesTo: r.evolvesTo,
      evolvesFrom: r.evolvesFrom,
      tags: r.tags,
      trust: r.trustMetadata as unknown as TrustMetadata,
    }));
  }

  async getAntiPatterns(filters?: KnowledgeFilter): Promise<AntiPattern[]> {
    const where = buildWhere(filters);
    const searchOr = buildSearchOr(['name', 'nameKo', 'problemKo', 'solutionKo'], filters?.search);
    if (searchOr) where.OR = searchOr;

    const rows = await this.prisma.knowledgeAntiPattern.findMany({ where });

    return rows.map((r) => ({
      id: r.antiPatternId,
      type: 'antipattern' as const,
      name: r.name,
      nameKo: r.nameKo,
      severity: r.severity as AntiPattern['severity'],
      detection: getDetectionFunction(r.detectionRuleId) ?? (() => false),
      detectionDescriptionKo: r.detectionDescriptionKo,
      problemKo: r.problemKo,
      impactKo: r.impactKo,
      solutionKo: r.solutionKo,
      tags: r.tags,
      trust: r.trustMetadata as unknown as TrustMetadata,
    }));
  }

  async getFailures(filters?: KnowledgeFilter): Promise<FailureScenario[]> {
    const where = buildWhere(filters);
    const searchOr = buildSearchOr(['titleKo', 'scenarioKo', 'component'], filters?.search);
    if (searchOr) where.OR = searchOr;
    if (filters?.component) where.component = filters.component;

    const rows = await this.prisma.knowledgeFailure.findMany({ where });

    return rows.map((r) => ({
      id: r.failureId,
      type: 'failure' as const,
      component: r.component as InfraNodeType,
      titleKo: r.titleKo,
      scenarioKo: r.scenarioKo,
      impact: r.impact.replace('_', '-') as FailureScenario['impact'],
      likelihood: r.likelihood as FailureScenario['likelihood'],
      affectedComponents: r.affectedComponents as InfraNodeType[],
      preventionKo: r.preventionKo,
      mitigationKo: r.mitigationKo,
      estimatedMTTR: r.estimatedMTTR,
      tags: r.tags,
      trust: r.trustMetadata as unknown as TrustMetadata,
    }));
  }

  async getPerformanceProfiles(filters?: KnowledgeFilter): Promise<PerformanceProfile[]> {
    const where = buildWhere(filters);
    const searchOr = buildSearchOr(['nameKo', 'component'], filters?.search);
    if (searchOr) where.OR = searchOr;
    if (filters?.component) where.component = filters.component;

    const rows = await this.prisma.knowledgePerformance.findMany({ where });

    return rows.map((r) => ({
      id: r.performanceId,
      type: 'performance' as const,
      component: r.component as InfraNodeType,
      nameKo: r.nameKo,
      latencyRange: r.latencyRange as PerformanceProfile['latencyRange'],
      throughputRange: r.throughputRange as PerformanceProfile['throughputRange'],
      scalingStrategy: r.scalingStrategy as PerformanceProfile['scalingStrategy'],
      bottleneckIndicators: r.bottleneckIndicators,
      bottleneckIndicatorsKo: r.bottleneckIndicatorsKo,
      optimizationTipsKo: r.optimizationTipsKo,
      tags: r.tags,
      trust: r.trustMetadata as unknown as TrustMetadata,
    }));
  }

  async getVulnerabilities(filters?: KnowledgeFilter): Promise<VulnerabilityEntry[]> {
    const where = buildWhere(filters);
    const searchOr = buildSearchOr(['title', 'titleKo', 'description', 'descriptionKo', 'cveId'], filters?.search);
    if (searchOr) where.OR = searchOr;
    if (filters?.component) {
      where.affectedComponents = { has: filters.component };
    }

    const rows = await this.prisma.knowledgeVulnerability.findMany({ where });

    return rows.map((r) => ({
      id: r.vulnId,
      cveId: r.cveId ?? undefined,
      affectedComponents: r.affectedComponents as InfraNodeType[],
      severity: r.severity as VulnerabilityEntry['severity'],
      cvssScore: r.cvssScore ?? undefined,
      title: r.title,
      titleKo: r.titleKo,
      description: r.description,
      descriptionKo: r.descriptionKo,
      mitigation: r.mitigation,
      mitigationKo: r.mitigationKo,
      publishedDate: r.publishedDate,
      references: r.references,
      trust: r.trustMetadata as unknown as TrustMetadata,
    }));
  }

  async getCloudServices(filters?: KnowledgeFilter): Promise<CloudServiceData[]> {
    const where = buildWhere(filters);
    const searchOr = buildSearchOr(['serviceName', 'serviceNameKo', 'componentType'], filters?.search);
    if (searchOr) where.OR = searchOr;
    if (filters?.component) where.componentType = filters.component;

    const rows = await this.prisma.knowledgeCloudService.findMany({ where });

    return rows.map((r) => ({
      id: r.serviceId,
      provider: r.provider as CloudServiceData['provider'],
      componentType: r.componentType,
      serviceName: r.serviceName,
      serviceNameKo: r.serviceNameKo,
      status: r.status.replace('_', '-') as CloudServiceData['status'],
      successor: r.successor ?? undefined,
      features: r.features,
      featuresKo: r.featuresKo,
      pricingTier: r.pricingTier as CloudServiceData['pricingTier'],
    }));
  }
}
