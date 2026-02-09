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

// Context Enricher
export {
  enrichContext,
  buildKnowledgePromptSection,
} from './contextEnricher';
