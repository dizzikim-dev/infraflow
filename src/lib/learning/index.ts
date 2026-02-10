/**
 * Auto-Learning Infrastructure — Public API
 */

// Types
export type {
  DiagramSource,
  PlacementChange,
  SpecDiffOperation,
  SpecDiff,
  FeedbackRecord,
  FeedbackSummary,
  UsageEvent,
  CoOccurrenceInsight,
  PatternFrequencyInsight,
  FailedPromptInsight,
  PlacementCorrection,
  RelationshipSuggestion,
  AntiPatternInteraction,
  AntiPatternCalibration,
  CalibrationConfig,
  CalibratedAntiPattern,
} from './types';

// Feedback Store
export {
  type FeedbackStoreAdapter,
  InMemoryFeedbackStore,
  createFeedbackStore,
  getFeedbackStore,
  resetFeedbackStore,
  computeSummary,
} from './feedbackStore';

// Spec Differ
export {
  computeSpecDiff,
  hasSignificantChanges,
  computeModificationScore,
} from './specDiffer';

// Usage Store
export {
  type UsageStoreAdapter,
  InMemoryUsageStore,
  createUsageStore,
  getUsageStore,
  resetUsageStore,
} from './usageStore';

// Analytics Engine
export {
  analyzeCoOccurrences,
  analyzePatternFrequency,
  analyzeFailedPrompts,
  analyzePlacementCorrections,
  suggestNewRelationships,
} from './analyticsEngine';

// Calibration Store
export {
  type CalibrationStoreAdapter,
  InMemoryCalibrationStore,
  createCalibrationStore,
  getCalibrationStore,
  resetCalibrationStore,
  computeCalibrationData,
} from './calibrationStore';

// Calibration Engine
export {
  calibrateSeverity,
  calibrateAntiPatterns,
  computeFalsePositiveRate,
  getSuppressedIds,
  DEFAULT_CALIBRATION_CONFIG,
} from './calibrationEngine';
