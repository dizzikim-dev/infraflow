/**
 * Static Data Source — reads from existing TypeScript arrays.
 *
 * This is the default data source that wraps the existing hardcoded
 * knowledge data. It ensures backward compatibility: no behavior change
 * unless KNOWLEDGE_SOURCE=db is explicitly set.
 */

import type { KnowledgeDataSource, KnowledgeFilter, CloudServiceData } from './dataSource';
import type {
  ComponentRelationship,
  ArchitecturePattern,
  AntiPattern,
  FailureScenario,
  PerformanceProfile,
  VulnerabilityEntry,
} from './types';
import { COMPONENT_RELATIONSHIPS } from './relationships';
import { ARCHITECTURE_PATTERNS } from './patterns';
import { ANTI_PATTERNS } from './antipatterns';
import { FAILURE_SCENARIOS } from './failures';
import { PERFORMANCE_PROFILES } from './performance';
import { VULNERABILITIES } from './vulnerabilities';
import { CLOUD_SERVICES } from './cloudCatalog';

/**
 * Generic tag filter — checks if any of the filter tags appear in the entry's tags.
 */
function matchesTags(entryTags: string[], filterTags?: string[]): boolean {
  if (!filterTags || filterTags.length === 0) return true;
  return filterTags.some((t) => entryTags.includes(t));
}

/**
 * Generic text search — case-insensitive match against arbitrary string fields.
 */
function matchesSearch(fields: (string | undefined)[], search?: string): boolean {
  if (!search) return true;
  const lower = search.toLowerCase();
  return fields.some((f) => f?.toLowerCase().includes(lower));
}

export class StaticDataSource implements KnowledgeDataSource {
  async getRelationships(filters?: KnowledgeFilter): Promise<ComponentRelationship[]> {
    let data = [...COMPONENT_RELATIONSHIPS];

    if (filters?.search) {
      data = data.filter((r) =>
        matchesSearch([r.reason, r.reasonKo, r.source, r.target], filters.search),
      );
    }
    if (filters?.tags) {
      data = data.filter((r) => matchesTags(r.tags, filters.tags));
    }
    if (filters?.component) {
      data = data.filter(
        (r) => r.source === filters.component || r.target === filters.component,
      );
    }
    return data;
  }

  async getPatterns(filters?: KnowledgeFilter): Promise<ArchitecturePattern[]> {
    let data = [...ARCHITECTURE_PATTERNS];

    if (filters?.search) {
      data = data.filter((p) =>
        matchesSearch([p.name, p.nameKo, p.description, p.descriptionKo], filters.search),
      );
    }
    if (filters?.tags) {
      data = data.filter((p) => matchesTags(p.tags, filters.tags));
    }
    return data;
  }

  async getAntiPatterns(filters?: KnowledgeFilter): Promise<AntiPattern[]> {
    let data = [...ANTI_PATTERNS];

    if (filters?.search) {
      data = data.filter((ap) =>
        matchesSearch([ap.name, ap.nameKo, ap.problemKo, ap.solutionKo], filters.search),
      );
    }
    if (filters?.tags) {
      data = data.filter((ap) => matchesTags(ap.tags, filters.tags));
    }
    return data;
  }

  async getFailures(filters?: KnowledgeFilter): Promise<FailureScenario[]> {
    let data = [...FAILURE_SCENARIOS];

    if (filters?.search) {
      data = data.filter((f) =>
        matchesSearch([f.titleKo, f.scenarioKo, f.component], filters.search),
      );
    }
    if (filters?.tags) {
      data = data.filter((f) => matchesTags(f.tags, filters.tags));
    }
    if (filters?.component) {
      data = data.filter((f) => f.component === filters.component);
    }
    return data;
  }

  async getPerformanceProfiles(filters?: KnowledgeFilter): Promise<PerformanceProfile[]> {
    let data = [...PERFORMANCE_PROFILES];

    if (filters?.search) {
      data = data.filter((p) =>
        matchesSearch([p.nameKo, p.component], filters.search),
      );
    }
    if (filters?.tags) {
      data = data.filter((p) => matchesTags(p.tags, filters.tags));
    }
    if (filters?.component) {
      data = data.filter((p) => p.component === filters.component);
    }
    return data;
  }

  async getVulnerabilities(filters?: KnowledgeFilter): Promise<VulnerabilityEntry[]> {
    let data = [...VULNERABILITIES];

    if (filters?.search) {
      data = data.filter((v) =>
        matchesSearch([v.title, v.titleKo, v.description, v.descriptionKo, v.cveId], filters.search),
      );
    }
    if (filters?.component) {
      data = data.filter((v) =>
        v.affectedComponents.includes(filters.component as VulnerabilityEntry['affectedComponents'][number]),
      );
    }
    return data;
  }

  async getCloudServices(filters?: KnowledgeFilter): Promise<CloudServiceData[]> {
    let data: CloudServiceData[] = CLOUD_SERVICES.map((s) => ({
      id: s.id ?? `${s.provider}-${s.serviceName.toLowerCase().replace(/\s+/g, '-')}`,
      provider: s.provider,
      componentType: s.componentType,
      serviceName: s.serviceName,
      serviceNameKo: s.serviceNameKo,
      status: s.status,
      successor: s.successor,
      features: s.features,
      featuresKo: s.featuresKo,
      pricingTier: s.pricingTier,
    }));

    if (filters?.search) {
      data = data.filter((s) =>
        matchesSearch([s.serviceName, s.serviceNameKo, s.componentType], filters.search),
      );
    }
    if (filters?.component) {
      data = data.filter((s) => s.componentType === filters.component);
    }
    return data;
  }
}
