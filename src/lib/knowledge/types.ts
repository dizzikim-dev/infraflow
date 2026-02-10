/**
 * Infrastructure Knowledge Graph - Core Types
 *
 * All knowledge entries carry source attribution and trust metadata
 * to ensure traceability and reliability of information.
 */

import type { InfraNodeType, InfraSpec } from '@/types/infra';

// ---------------------------------------------------------------------------
// Source & Trust
// ---------------------------------------------------------------------------

/** Knowledge source type — determines base confidence */
export type SourceType =
  | 'rfc'              // IETF RFC documents
  | 'nist'             // NIST Special Publications
  | 'cis'              // CIS Benchmarks / Controls
  | 'owasp'            // OWASP guidelines
  | 'vendor'           // Vendor official docs (AWS, Azure, etc.)
  | 'academic'         // Academic papers, textbooks
  | 'industry'         // Industry guides (SANS, Gartner, etc.)
  | 'user_verified'    // Admin-verified user contribution
  | 'user_unverified'; // Unverified user contribution

/** Individual source reference */
export interface KnowledgeSource {
  type: SourceType;
  title: string;           // e.g. "NIST SP 800-41 Rev.1"
  url?: string;            // e.g. "https://csrc.nist.gov/pubs/sp/800/41/r1/final"
  section?: string;        // e.g. "Section 4.1 - Firewall Policy"
  publishedDate?: string;  // e.g. "2009-09"
  accessedDate: string;    // e.g. "2026-02-09"
}

/** Modification history entry (lightweight provenance) */
export interface ModificationRecord {
  action: 'created' | 'updated' | 'reviewed' | 'voted';
  by: string;               // user ID or 'system'
  at: string;                // ISO timestamp
  reason?: string;
}

/** Trust metadata attached to every knowledge entry */
export interface TrustMetadata {
  confidence: number;          // 0.0 – 1.0
  sources: KnowledgeSource[];  // At least one required
  lastReviewedAt: string;
  contributedBy?: string;      // User ID if user-contributed
  contributedAt?: string;
  verifiedBy?: string;         // Admin ID if verified
  verifiedAt?: string;
  upvotes: number;
  downvotes: number;
  // Lightweight provenance fields (PROV-DM inspired)
  derivedFrom?: string[];              // IDs of knowledge entries this was derived from
  lastModifiedBy?: string;             // Last modifier (user ID or 'system')
  modificationHistory?: ModificationRecord[];  // Recent changes (max 10)
}

/** Base confidence by source type */
export const BASE_CONFIDENCE: Record<SourceType, number> = {
  rfc: 1.0,
  nist: 0.95,
  cis: 0.95,
  owasp: 0.9,
  vendor: 0.85,
  academic: 0.8,
  industry: 0.7,
  user_verified: 0.55,
  user_unverified: 0.3,
};

// ---------------------------------------------------------------------------
// Knowledge Entry Types
// ---------------------------------------------------------------------------

export type KnowledgeType = 'relationship' | 'failure' | 'pattern' | 'antipattern' | 'tip' | 'performance';

/** Base interface for all knowledge entries */
export interface KnowledgeEntryBase {
  id: string;
  type: KnowledgeType;
  tags: string[];
  trust: TrustMetadata;
}

// ---------------------------------------------------------------------------
// Layer 2: Component Relationships
// ---------------------------------------------------------------------------

export type RelationshipType =
  | 'requires'     // Mandatory dependency
  | 'recommends'   // Strongly suggested
  | 'conflicts'    // Should not coexist / dangerous combination
  | 'enhances'     // Improves capability when combined
  | 'protects';    // Security protection relationship

export type RelationshipStrength = 'mandatory' | 'strong' | 'weak';
export type RelationshipDirection = 'upstream' | 'downstream' | 'bidirectional';

export interface ComponentRelationship extends KnowledgeEntryBase {
  type: 'relationship';
  source: InfraNodeType;
  target: InfraNodeType;
  relationshipType: RelationshipType;
  strength: RelationshipStrength;
  direction: RelationshipDirection;
  reason: string;
  reasonKo: string;
}

// ---------------------------------------------------------------------------
// Layer 3: Architecture Patterns
// ---------------------------------------------------------------------------

export interface ArchitecturePattern extends KnowledgeEntryBase {
  type: 'pattern';
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  requiredComponents: { type: InfraNodeType; minCount: number }[];
  optionalComponents: { type: InfraNodeType; benefit: string; benefitKo: string }[];
  scalability: 'low' | 'medium' | 'high' | 'auto';
  complexity: 1 | 2 | 3 | 4 | 5;
  bestForKo: string[];
  notSuitableForKo: string[];
  evolvesTo: string[];
  evolvesFrom: string[];
}

// ---------------------------------------------------------------------------
// Layer 3: Anti-patterns
// ---------------------------------------------------------------------------

export interface AntiPattern extends KnowledgeEntryBase {
  type: 'antipattern';
  name: string;
  nameKo: string;
  severity: 'critical' | 'high' | 'medium';
  detection: (spec: InfraSpec) => boolean;
  detectionDescriptionKo: string;
  problemKo: string;
  impactKo: string;
  solutionKo: string;
}

// ---------------------------------------------------------------------------
// Layer 4: Failure Scenarios
// ---------------------------------------------------------------------------

export type FailureImpact = 'service-down' | 'degraded' | 'data-loss' | 'security-breach';

export interface FailureScenario extends KnowledgeEntryBase {
  type: 'failure';
  component: InfraNodeType;
  titleKo: string;
  scenarioKo: string;
  impact: FailureImpact;
  likelihood: 'high' | 'medium' | 'low';
  affectedComponents: InfraNodeType[];
  preventionKo: string[];
  mitigationKo: string[];
  estimatedMTTR: string;
}

// ---------------------------------------------------------------------------
// Quick Tips (easiest user contribution)
// ---------------------------------------------------------------------------

export type TipCategory = 'gotcha' | 'performance' | 'security' | 'cost' | 'operations';

export interface QuickTip extends KnowledgeEntryBase {
  type: 'tip';
  component: InfraNodeType;
  category: TipCategory;
  tipKo: string;
}

// ---------------------------------------------------------------------------
// Layer 4: Performance Profiles
// ---------------------------------------------------------------------------

export interface PerformanceProfile extends KnowledgeEntryBase {
  type: 'performance';
  component: InfraNodeType;
  nameKo: string;
  latencyRange: { min: number; max: number; unit: 'ms' | 'us' };
  throughputRange: { typical: string; max: string };
  scalingStrategy: 'horizontal' | 'vertical' | 'both';
  bottleneckIndicators: string[];
  bottleneckIndicatorsKo: string[];
  optimizationTipsKo: string[];
}

// ---------------------------------------------------------------------------
// Context Enricher output
// ---------------------------------------------------------------------------

export interface EnrichedKnowledge {
  relationships: ComponentRelationship[];
  violations: AntiPattern[];
  suggestions: ComponentRelationship[];
  risks: FailureScenario[];
  tips: QuickTip[];
  vulnerabilities?: VulnerabilityEntry[];
  complianceGaps?: ComplianceGap[];
}

// Re-exported from vulnerabilities.ts and industryCompliance.ts (circular-safe forward references)
// Actual definitions live in their respective modules.
export interface VulnerabilityEntry {
  id: string;
  cveId?: string;
  affectedComponents: InfraNodeType[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  cvssScore?: number;
  title: string;
  titleKo: string;
  description: string;
  descriptionKo: string;
  mitigation: string;
  mitigationKo: string;
  publishedDate: string;
  references: string[];
  trust: TrustMetadata;
}

export interface ComplianceGap {
  framework: string;
  frameworkKo: string;
  missingComponents: InfraNodeType[];
  remediation: string;
  remediationKo: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedEffort: string;
  estimatedEffortKo: string;
}
