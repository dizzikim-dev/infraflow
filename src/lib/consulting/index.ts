/**
 * InfraFlow Consulting Module
 *
 * Full consulting workflow: Requirements → Pattern matching → Gap analysis → Cost comparison
 */

// Types
export type {
  ConsultingRequirements,
  OrganizationSize,
  IndustryType,
  AvailabilityTarget,
  ConsultingSecurityLevel,
  BudgetRange,
  CloudPreference,
  DataVolume,
  TrafficPattern,
  PatternMatchResult,
  PatternMatchOutput,
  GapSeverity,
  GapType,
  GapItem,
  GapAnalysisResult,
  ProductCostItem,
  VendorCostEstimate,
  CostComparisonResult,
  ComplianceReportSection,
  ComplianceReportTable,
  ComplianceReportData,
  WizardStep,
} from './types';

export { WIZARD_STEPS, WIZARD_STEP_LABELS } from './types';

// Pattern matching
export {
  matchRequirementsToPatterns,
  getPatternById,
  getPatternsByCategory,
  suggestComponentsForRequirements,
} from './patternMatcher';

// Gap analysis
export {
  analyzeGaps,
  getRequiredComponentsForSecurity,
  getRequiredComponentsForCompliance,
  calculateGapScore,
} from './gapAnalyzer';

// Cost comparison
export {
  compareVendorCosts,
  classifyProductTier,
  estimateProductCost,
  getVendorSummary,
} from './costComparator';

// Compliance report
export {
  generateComplianceReport,
  getFrameworkDescription,
  calculateComplianceScore,
  getComplianceStatus,
} from './complianceReportGenerator';
