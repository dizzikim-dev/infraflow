import { describe, it, expect } from 'vitest';
import {
  calibrateSeverity,
  calibrateAntiPatterns,
  computeFalsePositiveRate,
  getSuppressedIds,
  DEFAULT_CALIBRATION_CONFIG,
} from '@/lib/learning/calibrationEngine';
import type { AntiPatternCalibration, CalibrationConfig } from '@/lib/learning/types';
import type { AntiPattern } from '@/lib/knowledge/types';

function makeCal(overrides: Partial<AntiPatternCalibration> = {}): AntiPatternCalibration {
  return {
    antiPatternId: 'AP-TEST',
    totalShown: 0,
    ignoredCount: 0,
    fixedCount: 0,
    ignoreRate: 0,
    fixRate: 0,
    originalSeverity: 'high',
    calibratedSeverity: 'high',
    lastUpdated: new Date().toISOString(),
    ...overrides,
  };
}

function makeAntiPattern(overrides: Partial<AntiPattern> = {}): AntiPattern {
  return {
    id: 'AP-TEST',
    type: 'antipattern',
    name: 'Test Anti-Pattern',
    nameKo: '테스트 안티패턴',
    severity: 'high',
    detection: () => false,
    detectionDescriptionKo: '테스트 탐지',
    problemKo: '테스트 문제',
    impactKo: '테스트 영향',
    solutionKo: '테스트 해결',
    tags: [],
    trust: {
      confidence: 0.9,
      sources: [],
      lastReviewedAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
    },
    ...overrides,
  };
}

// ─── calibrateSeverity ────────────────────────────────────────────────

describe('calibrateSeverity', () => {
  it('should return original severity when no calibration data', () => {
    expect(calibrateSeverity('high', undefined)).toBe('high');
    expect(calibrateSeverity('critical', undefined)).toBe('critical');
    expect(calibrateSeverity('medium', undefined)).toBe('medium');
  });

  it('should return original severity when not enough samples', () => {
    const cal = makeCal({ totalShown: 5, ignoreRate: 0.9 });
    expect(calibrateSeverity('high', cal)).toBe('high');
  });

  it('should downgrade by 1 step when ignoreRate >= 0.7 with enough samples', () => {
    const cal = makeCal({ totalShown: 15, ignoreRate: 0.75 });
    expect(calibrateSeverity('high', cal)).toBe('medium');
    expect(calibrateSeverity('critical', cal)).toBe('high');
  });

  it('should downgrade by 2 steps when ignoreRate >= 0.9 with 2x samples', () => {
    const cal = makeCal({ totalShown: 20, ignoreRate: 0.92 });
    expect(calibrateSeverity('high', cal)).toBe('suppressed');
    expect(calibrateSeverity('critical', cal)).toBe('medium');
  });

  it('should upgrade when fixRate >= 0.5', () => {
    const cal = makeCal({ totalShown: 15, ignoreRate: 0, fixRate: 0.55 });
    expect(calibrateSeverity('medium', cal)).toBe('high');
    expect(calibrateSeverity('high', cal)).toBe('critical');
  });

  it('should prevent critical from going below medium (safety rule)', () => {
    const cal = makeCal({ totalShown: 20, ignoreRate: 0.95 });
    // Without safety, critical -2 = suppressed. With safety, stays at medium.
    expect(calibrateSeverity('critical', cal)).toBe('medium');
  });

  it('should allow high to be suppressed', () => {
    const cal = makeCal({ totalShown: 20, ignoreRate: 0.95 });
    expect(calibrateSeverity('high', cal)).toBe('suppressed');
  });

  it('should allow medium to be suppressed', () => {
    const cal = makeCal({ totalShown: 20, ignoreRate: 0.95 });
    expect(calibrateSeverity('medium', cal)).toBe('suppressed');
  });

  it('should handle combined ignore + fix rates (fix overrides downgrade)', () => {
    // ignoreRate >= 0.7 wants downgrade, but fixRate >= 0.5 wants upgrade
    const cal = makeCal({ totalShown: 15, ignoreRate: 0.72, fixRate: 0.55 });
    // high → medium (downgrade 1) → high (upgrade 1) = high
    expect(calibrateSeverity('high', cal)).toBe('high');
  });

  it('should handle exact threshold values', () => {
    const calExact07 = makeCal({ totalShown: 10, ignoreRate: 0.7 });
    expect(calibrateSeverity('high', calExact07)).toBe('medium');

    const calExact05 = makeCal({ totalShown: 10, fixRate: 0.5 });
    expect(calibrateSeverity('medium', calExact05)).toBe('high');
  });

  it('should not upgrade beyond critical', () => {
    const cal = makeCal({ totalShown: 15, fixRate: 0.8 });
    expect(calibrateSeverity('critical', cal)).toBe('critical');
  });

  it('should respect custom config thresholds', () => {
    const config: CalibrationConfig = {
      minSamplesForCalibration: 5,
      ignoreRateDowngrade1: 0.5,
      ignoreRateDowngrade2: 0.8,
      fixRateUpgrade: 0.3,
      criticalMinSeverity: 'high',
    };

    const cal = makeCal({ totalShown: 6, ignoreRate: 0.55 });
    expect(calibrateSeverity('high', cal, config)).toBe('medium');
  });

  it('should apply custom criticalMinSeverity', () => {
    const config: CalibrationConfig = {
      ...DEFAULT_CALIBRATION_CONFIG,
      criticalMinSeverity: 'high',
    };

    const cal = makeCal({ totalShown: 20, ignoreRate: 0.95 });
    // critical with custom min=high should stop at high
    expect(calibrateSeverity('critical', cal, config)).toBe('high');
  });
});

// ─── calibrateAntiPatterns ─────────────────────────────────────────────

describe('calibrateAntiPatterns', () => {
  it('should return empty array for empty input', () => {
    const result = calibrateAntiPatterns([], new Map());
    expect(result).toEqual([]);
  });

  it('should return uncalibrated results when no calibration data', () => {
    const aps = [makeAntiPattern({ id: 'AP-1', severity: 'high' })];
    const result = calibrateAntiPatterns(aps, new Map());

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('AP-1');
    expect(result[0].originalSeverity).toBe('high');
    expect(result[0].calibratedSeverity).toBe('high');
    expect(result[0].wasCalibrated).toBe(false);
    expect(result[0].ignoreRate).toBe(0);
    expect(result[0].totalShown).toBe(0);
  });

  it('should calibrate severity when data is available', () => {
    const aps = [makeAntiPattern({ id: 'AP-1', severity: 'high' })];
    const calData = new Map([
      ['AP-1', makeCal({
        antiPatternId: 'AP-1',
        totalShown: 15,
        ignoreRate: 0.75,
        ignoredCount: 11,
      })],
    ]);

    const result = calibrateAntiPatterns(aps, calData);
    expect(result).toHaveLength(1);
    expect(result[0].originalSeverity).toBe('high');
    expect(result[0].calibratedSeverity).toBe('medium');
    expect(result[0].wasCalibrated).toBe(true);
  });

  it('should filter out suppressed anti-patterns', () => {
    const aps = [
      makeAntiPattern({ id: 'AP-1', severity: 'high' }),
      makeAntiPattern({ id: 'AP-2', severity: 'medium' }),
    ];
    const calData = new Map([
      ['AP-1', makeCal({
        antiPatternId: 'AP-1',
        totalShown: 20,
        ignoreRate: 0.92,
        ignoredCount: 18,
      })],
    ]);

    const result = calibrateAntiPatterns(aps, calData);
    // AP-1 is suppressed (high -2 = suppressed), so filtered out
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('AP-2');
  });

  it('should preserve nameKo from anti-pattern', () => {
    const aps = [makeAntiPattern({ id: 'AP-1', nameKo: '이중 방화벽 없음' })];
    const result = calibrateAntiPatterns(aps, new Map());
    expect(result[0].nameKo).toBe('이중 방화벽 없음');
  });

  it('should set fixRate from calibration data', () => {
    const aps = [makeAntiPattern({ id: 'AP-1', severity: 'medium' })];
    const calData = new Map([
      ['AP-1', makeCal({
        antiPatternId: 'AP-1',
        totalShown: 15,
        fixRate: 0.6,
        fixedCount: 9,
      })],
    ]);

    const result = calibrateAntiPatterns(aps, calData);
    expect(result[0].fixRate).toBeCloseTo(0.6);
    // medium + fixRate 0.6 → upgraded to high
    expect(result[0].calibratedSeverity).toBe('high');
    expect(result[0].wasCalibrated).toBe(true);
  });
});

// ─── computeFalsePositiveRate ──────────────────────────────────────────

describe('computeFalsePositiveRate', () => {
  it('should return 0 for empty data', () => {
    expect(computeFalsePositiveRate(new Map())).toBe(0);
  });

  it('should compute overall FP rate', () => {
    const calData = new Map([
      ['AP-1', makeCal({ totalShown: 100, ignoredCount: 30 })],
      ['AP-2', makeCal({ totalShown: 50, ignoredCount: 20 })],
    ]);

    // total ignored = 50, total shown = 150 → 50/150 = 0.333
    expect(computeFalsePositiveRate(calData)).toBeCloseTo(50 / 150);
  });

  it('should return 0 when nothing shown', () => {
    const calData = new Map([
      ['AP-1', makeCal({ totalShown: 0, ignoredCount: 0 })],
    ]);
    expect(computeFalsePositiveRate(calData)).toBe(0);
  });

  it('should return 1 when everything ignored', () => {
    const calData = new Map([
      ['AP-1', makeCal({ totalShown: 10, ignoredCount: 10 })],
    ]);
    expect(computeFalsePositiveRate(calData)).toBe(1);
  });
});

// ─── getSuppressedIds ──────────────────────────────────────────────────

describe('getSuppressedIds', () => {
  it('should return empty for no anti-patterns', () => {
    expect(getSuppressedIds([], new Map())).toEqual([]);
  });

  it('should return IDs of suppressed anti-patterns', () => {
    const aps = [
      makeAntiPattern({ id: 'AP-1', severity: 'high' }),
      makeAntiPattern({ id: 'AP-2', severity: 'medium' }),
      makeAntiPattern({ id: 'AP-3', severity: 'critical' }),
    ];
    const calData = new Map([
      ['AP-1', makeCal({ antiPatternId: 'AP-1', totalShown: 20, ignoreRate: 0.95, ignoredCount: 19 })],
      ['AP-2', makeCal({ antiPatternId: 'AP-2', totalShown: 20, ignoreRate: 0.95, ignoredCount: 19 })],
      ['AP-3', makeCal({ antiPatternId: 'AP-3', totalShown: 20, ignoreRate: 0.95, ignoredCount: 19 })],
    ]);

    const suppressed = getSuppressedIds(aps, calData);
    // AP-1 (high → suppressed), AP-2 (medium → suppressed) are suppressed
    // AP-3 (critical → medium, not suppressed due to safety)
    expect(suppressed).toContain('AP-1');
    expect(suppressed).toContain('AP-2');
    expect(suppressed).not.toContain('AP-3');
    expect(suppressed).toHaveLength(2);
  });

  it('should return empty when ignore rate is below threshold', () => {
    const aps = [makeAntiPattern({ id: 'AP-1', severity: 'high' })];
    const calData = new Map([
      ['AP-1', makeCal({ antiPatternId: 'AP-1', totalShown: 15, ignoreRate: 0.5 })],
    ]);

    expect(getSuppressedIds(aps, calData)).toEqual([]);
  });
});
