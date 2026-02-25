/**
 * Infrastructure Knowledge Graph - Public API
 */

// Core types
export type {
  SourceType,
  KnowledgeSource,
  ModificationRecord,
  TrustMetadata,
  KnowledgeType,
  KnowledgeEntryBase,
  ComponentRelationship,
  RelationshipType,
  RelationshipStrength,
  RelationshipDirection,
  ArchitecturePattern,
  AntiPattern,
  FailureScenario,
  FailureImpact,
  PerformanceProfile,
  EnrichedKnowledge,
} from './types';

export { BASE_CONFIDENCE } from './types';

// Source registry
export {
  ALL_SOURCES,
  isOfficialSource,
  isUserSource,
  withSection,
} from './sourceRegistry';

// Relationships
export {
  RELATIONSHIPS,
  getRelationshipsForComponent,
  getRelatedComponents,
  getMandatoryDependencies,
  getRecommendations,
  getConflicts,
} from './relationships';

// Patterns
export {
  PATTERNS,
  detectPatterns,
  getPatternById,
  getPatternsByComplexity,
} from './patterns';

// Anti-patterns
export {
  ANTI_PATTERNS,
  detectAntiPatterns,
  getAntiPatternsBySeverity,
  getCriticalAntiPatterns,
} from './antipatterns';

// Failure Scenarios
export {
  FAILURES,
  getFailuresForComponent,
  getHighImpactFailures,
  getFailuresByLikelihood,
} from './failures';

// Performance Profiles
export {
  PROFILES,
  getProfileForComponent,
  getProfilesByScaling,
} from './performance';

// Context Enricher
export {
  enrichContext,
  buildKnowledgePromptSection,
} from './contextEnricher';

// Vulnerabilities
export {
  VULNERABILITIES,
  getVulnerabilitiesForType,
  getCriticalVulnerabilities,
  getVulnerabilitiesForSpec,
  getVulnerabilityStats,
} from './vulnerabilities';
export type { VulnerabilityEntry as VulnEntry, CVESeverity } from './vulnerabilities';

// Cloud Catalog
export {
  CLOUD_SERVICES,
  AWS_SERVICES,
  AZURE_SERVICES,
  GCP_SERVICES,
  getCloudServices,
  getDeprecationWarnings,
  compareServices,
  getAlternatives,
  getServicesByDeploymentModel,
  getServicesWithCompliance,
  getIntegrationPartners,
  getServiceCategories,
  getProviderCoverageStats,
  compareServicesEnriched,
} from './cloudCatalog';

// Benchmarks
export {
  TRAFFIC_PROFILES,
  SIZING_MATRIX,
  getTrafficProfiles,
  recommendSizing,
  estimateCapacity,
  findBottlenecks,
} from './benchmarks';

// Graph Visualizer
export {
  buildKnowledgeGraph,
  getNodeDetail,
} from './graphVisualizer';
export type {
  KnowledgeGraph,
  KnowledgeGraphNode,
  KnowledgeGraphEdge,
  KnowledgeGraphStats,
  GraphFilterOptions,
} from './graphVisualizer';

// Vendor Catalog
export {
  getProductsForNodeType,
} from './vendorCatalog';

// Product Intelligence
export {
  allProductIntelligence,
  getPIByCategory,
  searchPI,
  getPIForProduct,
  getDeploymentProfiles,
  getIntegrationsFor,
  getScaleUpPaths,
} from './productIntelligence';
export type {
  ProductIntelligence,
  PICategory,
  DeploymentProfile,
  IntegrationInfo,
  ScaleUpPath,
} from './productIntelligence';
