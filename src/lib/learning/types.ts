/**
 * Auto-Learning Infrastructure Types
 *
 * Data models for the feedback collection loop, pattern analysis,
 * and anti-pattern calibration system.
 */

import type { InfraSpec, InfraNodeType } from '@/types/infra';

// ─── Feedback Collection (PR C-1) ─────────────────────────────────────────

/** Source of diagram generation */
export type DiagramSource = 'local-parser' | 'llm-modify' | 'template';

/** A user's placement correction (tier/position change) */
export interface PlacementChange {
  nodeId: string;
  nodeType: InfraNodeType;
  originalTier?: string;
  newTier?: string;
  moved: boolean;
}

/** Structural diff operation for spec comparison */
export interface SpecDiffOperation {
  type: 'add-node' | 'remove-node' | 'modify-node' | 'add-connection' | 'remove-connection' | 'modify-connection';
  nodeId?: string;
  nodeType?: InfraNodeType;
  field?: string;
  oldValue?: unknown;
  newValue?: unknown;
  source?: string;
  target?: string;
}

/** Result of comparing original vs modified spec */
export interface SpecDiff {
  operations: SpecDiffOperation[];
  nodesAdded: number;
  nodesRemoved: number;
  nodesModified: number;
  connectionsAdded: number;
  connectionsRemoved: number;
  placementChanges: PlacementChange[];
}

/** A single feedback record stored in IndexedDB */
export interface FeedbackRecord {
  id: string;
  timestamp: string;
  diagramSource: DiagramSource;
  prompt?: string;
  originalSpec: InfraSpec;
  userModifiedSpec?: InfraSpec;
  userRating?: number;
  specDiff: SpecDiff;
  placementChanges: PlacementChange[];
  patternsDetected: string[];
  antiPatternsDetected: string[];
  antiPatternsIgnored: string[];
  antiPatternsFixed: string[];
  sessionId: string;
}

/** Summary statistics across all feedback */
export interface FeedbackSummary {
  totalRecords: number;
  averageRating: number | null;
  ratingDistribution: Record<number, number>;
  sourceDistribution: Record<DiagramSource, number>;
  totalModifications: number;
  mostCommonChanges: Array<{ type: string; count: number }>;
}

// ─── Usage Analytics (PR C-2) ──────────────────────────────────────────

/** A single usage event */
export interface UsageEvent {
  id: string;
  timestamp: string;
  eventType: 'parse' | 'llm-modify' | 'template';
  prompt?: string;
  success: boolean;
  confidence: number;
  nodeTypes: InfraNodeType[];
  patternIds: string[];
  antiPatternIds: string[];
  sessionId: string;
}

/** Co-occurrence insight: components frequently used together */
export interface CoOccurrenceInsight {
  typeA: InfraNodeType;
  typeB: InfraNodeType;
  coOccurrenceCount: number;
  totalA: number;
  totalB: number;
  confidence: number;
  support: number;
  isExistingRelationship: boolean;
}

/** Pattern usage frequency */
export interface PatternFrequencyInsight {
  patternId: string;
  patternName: string;
  patternNameKo: string;
  count: number;
  averageRating: number | null;
  lastUsed: string;
}

/** Failed prompt analysis */
export interface FailedPromptInsight {
  keyword: string;
  failureCount: number;
  totalAttempts: number;
  failureRate: number;
  samplePrompts: string[];
}

/** Placement correction aggregation */
export interface PlacementCorrection {
  nodeType: InfraNodeType;
  fromTier: string;
  toTier: string;
  count: number;
  correctionRate: number;
}

/** Suggested new relationship based on co-occurrence */
export interface RelationshipSuggestion {
  source: InfraNodeType;
  target: InfraNodeType;
  confidence: number;
  support: number;
  suggestedType: 'recommends' | 'complements';
}

// ─── Anti-Pattern Calibration (PR C-3) ──────────────────────────────────

/** User interaction with an anti-pattern warning */
export interface AntiPatternInteraction {
  id: string;
  timestamp: string;
  antiPatternId: string;
  action: 'shown' | 'ignored' | 'fixed';
  sessionId: string;
}

/** Calibration data for a single anti-pattern */
export interface AntiPatternCalibration {
  antiPatternId: string;
  totalShown: number;
  ignoredCount: number;
  fixedCount: number;
  ignoreRate: number;
  fixRate: number;
  originalSeverity: 'critical' | 'high' | 'medium';
  calibratedSeverity: 'critical' | 'high' | 'medium' | 'suppressed';
  lastUpdated: string;
}

/** Configuration for calibration thresholds */
export interface CalibrationConfig {
  minSamplesForCalibration: number;
  ignoreRateDowngrade1: number;
  ignoreRateDowngrade2: number;
  fixRateUpgrade: number;
  criticalMinSeverity: 'critical' | 'high' | 'medium';
}

/** Anti-pattern with calibrated severity */
export interface CalibratedAntiPattern {
  id: string;
  name: string;
  nameKo: string;
  originalSeverity: 'critical' | 'high' | 'medium';
  calibratedSeverity: 'critical' | 'high' | 'medium' | 'suppressed';
  ignoreRate: number;
  fixRate: number;
  totalShown: number;
  wasCalibrated: boolean;
}
