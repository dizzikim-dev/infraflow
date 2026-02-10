/**
 * KnowledgeDataSource Interface
 *
 * Abstraction layer for knowledge data access.
 * Implementations can read from static TypeScript arrays or from Prisma DB.
 */

import type {
  ComponentRelationship,
  ArchitecturePattern,
  AntiPattern,
  FailureScenario,
  PerformanceProfile,
  VulnerabilityEntry,
} from './types';

/** Filter options for querying knowledge data */
export interface KnowledgeFilter {
  /** Text search across names and descriptions */
  search?: string;
  /** Filter by tag */
  tags?: string[];
  /** Filter by component type */
  component?: string;
  /** Only active records (default true) */
  isActive?: boolean;
}

/** Cloud service representation for the data source */
export interface CloudServiceData {
  id: string;
  provider: 'aws' | 'azure' | 'gcp';
  componentType: string;
  serviceName: string;
  serviceNameKo: string;
  status: 'active' | 'deprecated' | 'preview' | 'end-of-life';
  successor?: string;
  features: string[];
  featuresKo: string[];
  pricingTier: 'free' | 'low' | 'medium' | 'high' | 'enterprise';
}

/**
 * Interface for accessing knowledge data regardless of backing store.
 */
export interface KnowledgeDataSource {
  getRelationships(filters?: KnowledgeFilter): Promise<ComponentRelationship[]>;
  getPatterns(filters?: KnowledgeFilter): Promise<ArchitecturePattern[]>;
  getAntiPatterns(filters?: KnowledgeFilter): Promise<AntiPattern[]>;
  getFailures(filters?: KnowledgeFilter): Promise<FailureScenario[]>;
  getPerformanceProfiles(filters?: KnowledgeFilter): Promise<PerformanceProfile[]>;
  getVulnerabilities(filters?: KnowledgeFilter): Promise<VulnerabilityEntry[]>;
  getCloudServices(filters?: KnowledgeFilter): Promise<CloudServiceData[]>;
}
