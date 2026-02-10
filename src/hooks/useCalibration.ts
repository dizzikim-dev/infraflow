'use client';

import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import type { InfraSpec } from '@/types/infra';
import type { CalibratedAntiPattern, AntiPatternInteraction } from '@/lib/learning/types';
import { getCalibrationStore } from '@/lib/learning/calibrationStore';
import {
  calibrateAntiPatterns,
  computeFalsePositiveRate,
  DEFAULT_CALIBRATION_CONFIG,
} from '@/lib/learning/calibrationEngine';
import { detectAntiPatterns } from '@/lib/knowledge';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('useCalibration');

export interface UseCalibrationReturn {
  /** Get anti-patterns with calibrated severities for a spec */
  getCalibratedAntiPatterns: (spec: InfraSpec) => Promise<CalibratedAntiPattern[]>;
  /** Record that an anti-pattern was shown to the user */
  recordShown: (antiPatternId: string) => Promise<void>;
  /** Record that the user ignored an anti-pattern */
  recordIgnored: (antiPatternId: string) => Promise<void>;
  /** Record that the user fixed an anti-pattern */
  recordFixed: (antiPatternId: string) => Promise<void>;
  /** Get the current false positive rate */
  getFalsePositiveRate: () => Promise<number>;
  /** Whether calibration is loading */
  isLoading: boolean;
}

const SESSION_ID = nanoid(8);

/**
 * Hook for anti-pattern calibration.
 *
 * Wraps the calibration engine and store, providing a simple API
 * for the HealthCheckPanel to use calibrated anti-patterns
 * and record user interactions.
 */
export function useCalibration(): UseCalibrationReturn {
  const [isLoading, setIsLoading] = useState(false);

  const recordInteraction = useCallback(
    async (antiPatternId: string, action: 'shown' | 'ignored' | 'fixed') => {
      try {
        const store = getCalibrationStore();
        const interaction: AntiPatternInteraction = {
          id: nanoid(8),
          timestamp: new Date().toISOString(),
          antiPatternId,
          action,
          sessionId: SESSION_ID,
        };
        await store.saveInteraction(interaction);
        log.debug('Recorded interaction', { antiPatternId, action });
      } catch (error) {
        log.error('Failed to record interaction', error instanceof Error ? error : new Error(String(error)));
      }
    },
    []
  );

  const getCalibratedAntiPatterns = useCallback(
    async (spec: InfraSpec): Promise<CalibratedAntiPattern[]> => {
      setIsLoading(true);
      try {
        const store = getCalibrationStore();
        const detected = detectAntiPatterns(spec);
        const calibrationData = await store.getCalibrationData();

        // Enrich calibration data with original severities
        for (const ap of detected) {
          const cal = calibrationData.get(ap.id);
          if (cal) {
            cal.originalSeverity = ap.severity;
          }
        }

        return calibrateAntiPatterns(detected, calibrationData, DEFAULT_CALIBRATION_CONFIG);
      } catch (error) {
        log.error('Failed to get calibrated anti-patterns', error instanceof Error ? error : new Error(String(error)));
        // Fall back to uncalibrated detection
        const detected = detectAntiPatterns(spec);
        return detected.map((ap) => ({
          id: ap.id,
          name: ap.name,
          nameKo: ap.nameKo,
          originalSeverity: ap.severity,
          calibratedSeverity: ap.severity,
          ignoreRate: 0,
          fixRate: 0,
          totalShown: 0,
          wasCalibrated: false,
        }));
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const recordShown = useCallback(
    (antiPatternId: string) => recordInteraction(antiPatternId, 'shown'),
    [recordInteraction]
  );

  const recordIgnored = useCallback(
    (antiPatternId: string) => recordInteraction(antiPatternId, 'ignored'),
    [recordInteraction]
  );

  const recordFixed = useCallback(
    (antiPatternId: string) => recordInteraction(antiPatternId, 'fixed'),
    [recordInteraction]
  );

  const getFalsePositiveRate = useCallback(async (): Promise<number> => {
    try {
      const store = getCalibrationStore();
      const calibrationData = await store.getCalibrationData();
      return computeFalsePositiveRate(calibrationData);
    } catch {
      return 0;
    }
  }, []);

  return {
    getCalibratedAntiPatterns,
    recordShown,
    recordIgnored,
    recordFixed,
    getFalsePositiveRate,
    isLoading,
  };
}
