/**
 * InfraFlow Consulting Module — Shared Types
 *
 * Types for the full consulting workflow:
 * Requirements intake → Pattern matching → Gap analysis → Cost comparison
 */

import type { InfraNodeType, InfraSpec, NodeCategory } from '@/types/infra';
import type { ArchitecturePattern } from '@/lib/knowledge/types';

// ---------------------------------------------------------------------------
// Requirements Intake
// ---------------------------------------------------------------------------

export type OrganizationSize = 'small' | 'medium' | 'large' | 'enterprise';

export type IndustryType =
  | 'financial'
  | 'healthcare'
  | 'government'
  | 'ecommerce'
  | 'education'
  | 'manufacturing'
  | 'general';

export type AvailabilityTarget = 99 | 99.9 | 99.95 | 99.99 | 99.999;

export type SecurityLevel = 'basic' | 'standard' | 'high' | 'critical';

export type BudgetRange = 'low' | 'medium' | 'high' | 'enterprise';

export type CloudPreference =
  | 'on-premise'
  | 'hybrid'
  | 'cloud-native'
  | 'multi-cloud';

export type DataVolume = 'low' | 'medium' | 'high' | 'massive';

export type TrafficPattern = 'steady' | 'bursty' | 'seasonal' | 'unpredictable';

/** Full requirements collected from the intake wizard */
export interface ConsultingRequirements {
  // Organization
  organizationName?: string;
  organizationSize: OrganizationSize;
  industry: IndustryType;

  // Scale
  userCount: number;
  concurrentUsers: number;
  dataVolume: DataVolume;
  trafficPattern: TrafficPattern;

  // Availability & Performance
  availabilityTarget: AvailabilityTarget;
  maxLatencyMs?: number;
  rpoMinutes?: number; // Recovery Point Objective
  rtoMinutes?: number; // Recovery Time Objective

  // Security & Compliance
  securityLevel: SecurityLevel;
  complianceFrameworks: string[];

  // Budget
  budgetRange: BudgetRange;
  monthlyBudgetUsd?: number;

  // Architecture Preferences
  cloudPreference: CloudPreference;
  preferredVendors?: string[];
  existingInfrastructure?: InfraNodeType[];

  // Additional notes
  notes?: string;
}

// ---------------------------------------------------------------------------
// Pattern Matching
// ---------------------------------------------------------------------------

/** Result of matching requirements to an architecture pattern */
export interface PatternMatchResult {
  pattern: ArchitecturePattern;
  matchScore: number; // 0-100
  matchedCriteria: string[];
  matchedCriteriaKo: string[];
  reason: string;
  reasonKo: string;
  suggestedComponents: InfraNodeType[];
  estimatedComplexity: 1 | 2 | 3 | 4 | 5;
}

/** Full output of pattern matching */
export interface PatternMatchOutput {
  requirements: ConsultingRequirements;
  matches: PatternMatchResult[];
  primaryRecommendation: PatternMatchResult | null;
  alternativePatterns: PatternMatchResult[];
  unmatchedRequirements: string[];
  unmatchedRequirementsKo: string[];
}

// ---------------------------------------------------------------------------
// Gap Analysis
// ---------------------------------------------------------------------------

export type GapSeverity = 'critical' | 'high' | 'medium' | 'low';

export type GapType =
  | 'missing'     // Component doesn't exist in current spec
  | 'excess'      // Component is unnecessary for target architecture
  | 'upgrade'     // Component exists but needs enhancement
  | 'security'    // Security gap
  | 'compliance'  // Compliance gap
  | 'performance'; // Performance gap

/** Individual gap item */
export interface GapItem {
  type: GapType;
  severity: GapSeverity;
  component: InfraNodeType;
  category: NodeCategory | 'external' | 'zone';
  description: string;
  descriptionKo: string;
  suggestedAction: string;
  suggestedActionKo: string;
  effort: 'low' | 'medium' | 'high';
  estimatedCostImpact?: 'low' | 'medium' | 'high';
}

/** Full gap analysis result */
export interface GapAnalysisResult {
  currentSpec: InfraSpec;
  targetPattern: ArchitecturePattern | null;
  requirements: ConsultingRequirements | null;
  gaps: GapItem[];
  missingComponents: GapItem[];
  excessComponents: GapItem[];
  upgradeNeeded: GapItem[];
  securityGaps: GapItem[];
  complianceGaps: GapItem[];
  performanceGaps: GapItem[];
  overallScore: number; // 0-100 (100 = fully compliant)
  summary: string;
  summaryKo: string;
}

// ---------------------------------------------------------------------------
// Cost Comparison
// ---------------------------------------------------------------------------

/** Cost estimate for a single product in a vendor's proposal */
export interface ProductCostItem {
  nodeType: InfraNodeType;
  productName: string;
  vendorId: string;
  monthlyCost: number;
  quantity: number;
  tier: string;
  notes?: string;
}

/** One vendor's complete cost proposal */
export interface VendorCostEstimate {
  vendorId: string;
  vendorName: string;
  products: ProductCostItem[];
  totalMonthlyCost: number;
  totalAnnualCost: number;
  coveredNodeTypes: InfraNodeType[];
  uncoveredNodeTypes: InfraNodeType[];
  coveragePercentage: number; // 0-100
}

/** Full cost comparison across vendors */
export interface CostComparisonResult {
  requirements: ConsultingRequirements | null;
  spec: InfraSpec;
  vendorEstimates: VendorCostEstimate[];
  cheapestVendor: string | null;
  bestCoverageVendor: string | null;
  recommendedVendor: string | null;
  recommendedReason: string;
  recommendedReasonKo: string;
  savingsPercentage: number; // Between cheapest and most expensive
}

// ---------------------------------------------------------------------------
// Compliance Report (PDF)
// ---------------------------------------------------------------------------

/** Section in a compliance PDF report */
export interface ComplianceReportSection {
  title: string;
  titleKo: string;
  content: string[];
  contentKo: string[];
  severity?: GapSeverity;
  tables?: ComplianceReportTable[];
}

/** Table in a compliance report */
export interface ComplianceReportTable {
  headers: string[];
  headersKo: string[];
  rows: string[][];
}

/** Full compliance report data (before PDF rendering) */
export interface ComplianceReportData {
  metadata: {
    title: string;
    organization: string;
    industry: IndustryType;
    generatedAt: string;
    frameworks: string[];
  };
  executiveSummary: string;
  executiveSummaryKo: string;
  overallScore: number;
  sections: ComplianceReportSection[];
  gaps: GapItem[];
  recommendations: string[];
  recommendationsKo: string[];
}

// ---------------------------------------------------------------------------
// Wizard Step
// ---------------------------------------------------------------------------

export type WizardStep =
  | 'organization'
  | 'scale'
  | 'availability'
  | 'security'
  | 'budget'
  | 'preferences'
  | 'review';

export const WIZARD_STEPS: WizardStep[] = [
  'organization',
  'scale',
  'availability',
  'security',
  'budget',
  'preferences',
  'review',
];

export const WIZARD_STEP_LABELS: Record<WizardStep, { en: string; ko: string }> = {
  organization: { en: 'Organization', ko: '조직 정보' },
  scale: { en: 'Scale', ko: '규모' },
  availability: { en: 'Availability', ko: '가용성' },
  security: { en: 'Security', ko: '보안' },
  budget: { en: 'Budget', ko: '예산' },
  preferences: { en: 'Preferences', ko: '선호 사항' },
  review: { en: 'Review', ko: '검토' },
};
