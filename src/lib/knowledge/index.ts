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
  QuickTip,
  TipCategory,
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
  ANTIPATTERNS,
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

// Conflict Detector
export {
  detectRelationshipConflicts,
  areContradictory,
  isExtension,
} from './conflictDetector';
export type { ConflictInfo } from './conflictDetector';

// Trust Scorer
export {
  calculateReputation,
  calculateInitialConfidence,
  calculateApprovedConfidence,
  applyVoteAdjustment,
  getAutoApprovalLevel,
} from './trustScorer';
export type { ContributorReputation } from './trustScorer';

// User Contributions
export {
  ContributionStore,
  contributionStore,
} from './userContributions';
export type {
  UserContribution,
  ContributionStatus,
  Contributor,
  UserSource,
  AdminReview,
  CommunityVotes,
  ValidationState,
  KnowledgeData,
} from './userContributions';

// Context Enricher
export {
  enrichContext,
  buildKnowledgePromptSection,
} from './contextEnricher';

// RAG Search
export {
  buildSearchIndex,
  searchKnowledge,
  searchByComponent,
  searchByTag,
  getRelatedKnowledge,
} from './ragSearch';
export type {
  SearchableType,
  SearchOptions,
  SearchResult,
  SearchIndex,
} from './ragSearch';

// Source Validator
export {
  validateSourceUrl,
  validateSource,
  validateAllSources,
  getStaleEntries,
  getSourceTypeCoverage,
} from './sourceValidator';
export type {
  ValidationSeverity,
  SourceIssue,
  SourceValidationResult,
  ValidationReport,
} from './sourceValidator';

// Industry Presets
export {
  INDUSTRY_PRESETS,
  getPreset,
  getRequiredComponents,
  checkCompliance,
  getIndustryAntiPatterns,
} from './industryPresets';
export type {
  IndustryType,
  ComplianceRequirement,
  ComplianceRule,
  IndustryPreset,
  IndustryRelationship,
  IndustryAntiPattern,
} from './industryPresets';

// Organization Config
export {
  createOrgConfig,
  validateOrgConfig,
  checkOrgCompliance,
  mergeConfigs,
  EXAMPLE_CONFIGS,
} from './organizationConfig';
export type {
  OrganizationProfile,
  CustomRule,
  ComponentRequirement,
  CustomRelationship,
  NamingConvention,
  OrganizationConfig,
  OrgValidationResult,
  OrgComplianceResult,
} from './organizationConfig';

// Knowledge Graph Visualizer
export {
  buildKnowledgeGraph,
  buildComponentGraph,
  getGraphStats,
  toReactFlowFormat,
} from './graphVisualizer';
export type {
  KGNodeType,
  KGNode,
  KGEdgeType,
  KGEdge,
  KnowledgeGraph,
  GraphOptions,
} from './graphVisualizer';
