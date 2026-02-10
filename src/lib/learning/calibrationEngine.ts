/**
 * Calibration Engine — Pure functions for anti-pattern severity adjustment
 *
 * Rules:
 * - ignoreRate >= 0.7 AND totalShown >= 10  → severity -1 step
 * - ignoreRate >= 0.9 AND totalShown >= 20  → severity -2 steps (or suppress)
 * - fixRate >= 0.5 AND totalShown >= 10     → severity maintain/+1 step
 *
 * Safety: critical can only go down to medium (never suppressed)
 */

import type {
  AntiPatternCalibration,
  CalibrationConfig,
  CalibratedAntiPattern,
} from './types';
import type { AntiPattern } from '@/lib/knowledge/types';

// ─── Default Config ────────────────────────────────────────────────────

export const DEFAULT_CALIBRATION_CONFIG: CalibrationConfig = {
  minSamplesForCalibration: 10,
  ignoreRateDowngrade1: 0.7,
  ignoreRateDowngrade2: 0.9,
  fixRateUpgrade: 0.5,
  criticalMinSeverity: 'medium',
};

// ─── Severity Levels ───────────────────────────────────────────────────

type Severity = 'critical' | 'high' | 'medium' | 'suppressed';

const SEVERITY_ORDER: Severity[] = ['critical', 'high', 'medium', 'suppressed'];

function severityIndex(s: Severity): number {
  return SEVERITY_ORDER.indexOf(s);
}

function downgradeSeverity(current: Severity, steps: number): Severity {
  const idx = severityIndex(current);
  const newIdx = Math.min(idx + steps, SEVERITY_ORDER.length - 1);
  return SEVERITY_ORDER[newIdx];
}

function upgradeSeverity(current: Severity, steps: number): Severity {
  const idx = severityIndex(current);
  const newIdx = Math.max(idx - steps, 0);
  return SEVERITY_ORDER[newIdx];
}

// ─── Core Calibration Function ─────────────────────────────────────────

/**
 * Calculate the calibrated severity for a single anti-pattern.
 *
 * @param originalSeverity - The original severity from the knowledge graph
 * @param calibration - Interaction data (ignore/fix rates)
 * @param config - Calibration thresholds
 * @returns Calibrated severity level
 */
export function calibrateSeverity(
  originalSeverity: 'critical' | 'high' | 'medium',
  calibration: AntiPatternCalibration | undefined,
  config: CalibrationConfig = DEFAULT_CALIBRATION_CONFIG
): Severity {
  if (!calibration || calibration.totalShown < config.minSamplesForCalibration) {
    return originalSeverity;
  }

  let severity: Severity = originalSeverity;

  // Check for downgrade (high ignore rate)
  if (
    calibration.ignoreRate >= config.ignoreRateDowngrade2 &&
    calibration.totalShown >= config.minSamplesForCalibration * 2
  ) {
    severity = downgradeSeverity(originalSeverity, 2);
  } else if (calibration.ignoreRate >= config.ignoreRateDowngrade1) {
    severity = downgradeSeverity(originalSeverity, 1);
  }

  // Check for upgrade (high fix rate) — overrides downgrade
  if (calibration.fixRate >= config.fixRateUpgrade) {
    severity = upgradeSeverity(severity, 1);
  }

  // Safety: critical anti-patterns cannot be suppressed
  if (originalSeverity === 'critical') {
    const minIdx = severityIndex(config.criticalMinSeverity as Severity);
    const currentIdx = severityIndex(severity);
    if (currentIdx > minIdx) {
      severity = config.criticalMinSeverity as Severity;
    }
  }

  return severity;
}

// ─── Batch Calibration ─────────────────────────────────────────────────

/**
 * Calibrate a list of detected anti-patterns using interaction data.
 * Returns CalibratedAntiPattern[] with adjusted severities.
 */
export function calibrateAntiPatterns(
  detectedAntiPatterns: AntiPattern[],
  calibrationData: Map<string, AntiPatternCalibration>,
  config: CalibrationConfig = DEFAULT_CALIBRATION_CONFIG
): CalibratedAntiPattern[] {
  return detectedAntiPatterns
    .map((ap) => {
      const calibration = calibrationData.get(ap.id);
      const calibratedSeverity = calibrateSeverity(ap.severity, calibration, config);
      const wasCalibrated = calibratedSeverity !== ap.severity;

      return {
        id: ap.id,
        name: ap.name,
        nameKo: ap.nameKo,
        originalSeverity: ap.severity,
        calibratedSeverity,
        ignoreRate: calibration?.ignoreRate ?? 0,
        fixRate: calibration?.fixRate ?? 0,
        totalShown: calibration?.totalShown ?? 0,
        wasCalibrated,
      };
    })
    .filter((ap) => ap.calibratedSeverity !== 'suppressed');
}

/**
 * Compute the False Positive Rate for the current calibration.
 * FP Rate = total ignored / total shown across all anti-patterns.
 */
export function computeFalsePositiveRate(
  calibrationData: Map<string, AntiPatternCalibration>
): number {
  let totalShown = 0;
  let totalIgnored = 0;

  for (const cal of calibrationData.values()) {
    totalShown += cal.totalShown;
    totalIgnored += cal.ignoredCount;
  }

  return totalShown > 0 ? totalIgnored / totalShown : 0;
}

/**
 * Get suppressed anti-pattern IDs (those with calibrated severity 'suppressed').
 */
export function getSuppressedIds(
  allAntiPatterns: AntiPattern[],
  calibrationData: Map<string, AntiPatternCalibration>,
  config: CalibrationConfig = DEFAULT_CALIBRATION_CONFIG
): string[] {
  return allAntiPatterns
    .filter((ap) => {
      const calibration = calibrationData.get(ap.id);
      const calibratedSeverity = calibrateSeverity(ap.severity, calibration, config);
      return calibratedSeverity === 'suppressed';
    })
    .map((ap) => ap.id);
}
