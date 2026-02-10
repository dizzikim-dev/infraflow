import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCalibration } from '@/hooks/useCalibration';
import type { InfraSpec } from '@/types/infra';

// Mock calibration store
const mockSaveInteraction = vi.fn().mockResolvedValue(undefined);
const mockGetCalibrationData = vi.fn().mockResolvedValue(new Map());

vi.mock('@/lib/learning/calibrationStore', () => ({
  getCalibrationStore: () => ({
    saveInteraction: mockSaveInteraction,
    getCalibrationData: mockGetCalibrationData,
    getInteractions: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    clear: vi.fn().mockResolvedValue(undefined),
  }),
}));

// Mock knowledge module
vi.mock('@/lib/knowledge', () => ({
  detectAntiPatterns: vi.fn().mockReturnValue([
    {
      id: 'AP-001',
      type: 'antipattern',
      name: 'No Firewall',
      nameKo: '방화벽 없음',
      severity: 'critical',
      detection: () => true,
      detectionDescriptionKo: '방화벽 없음 탐지',
      problemKo: '보안 취약',
      impactKo: '침입 위험',
      solutionKo: '방화벽 추가',
      tags: [],
      trust: { confidence: 0.9, sources: [], lastReviewedAt: '', upvotes: 0, downvotes: 0 },
    },
    {
      id: 'AP-002',
      type: 'antipattern',
      name: 'Single Point of Failure',
      nameKo: '단일 장애점',
      severity: 'high',
      detection: () => true,
      detectionDescriptionKo: '단일 장애점 탐지',
      problemKo: '이중화 없음',
      impactKo: '장애 전파',
      solutionKo: '이중화 구성',
      tags: [],
      trust: { confidence: 0.9, sources: [], lastReviewedAt: '', upvotes: 0, downvotes: 0 },
    },
  ]),
}));

const makeSpec = (): InfraSpec => ({
  nodes: [
    { id: 'ws-1', type: 'web-server', label: 'Web' },
  ],
  connections: [],
});

describe('useCalibration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCalibrationData.mockResolvedValue(new Map());
  });

  it('should return all expected methods', () => {
    const { result } = renderHook(() => useCalibration());

    expect(result.current.getCalibratedAntiPatterns).toBeDefined();
    expect(result.current.recordShown).toBeDefined();
    expect(result.current.recordIgnored).toBeDefined();
    expect(result.current.recordFixed).toBeDefined();
    expect(result.current.getFalsePositiveRate).toBeDefined();
    expect(typeof result.current.isLoading).toBe('boolean');
  });

  it('should return calibrated anti-patterns for a spec', async () => {
    const { result } = renderHook(() => useCalibration());

    let patterns: Awaited<ReturnType<typeof result.current.getCalibratedAntiPatterns>> = [];
    await act(async () => {
      patterns = await result.current.getCalibratedAntiPatterns(makeSpec());
    });

    expect(patterns).toHaveLength(2);
    expect(patterns[0].id).toBe('AP-001');
    expect(patterns[0].originalSeverity).toBe('critical');
    expect(patterns[0].calibratedSeverity).toBe('critical');
    expect(patterns[0].wasCalibrated).toBe(false);
  });

  it('should record shown interaction', async () => {
    const { result } = renderHook(() => useCalibration());

    await act(async () => {
      await result.current.recordShown('AP-001');
    });

    expect(mockSaveInteraction).toHaveBeenCalledWith(
      expect.objectContaining({
        antiPatternId: 'AP-001',
        action: 'shown',
      })
    );
  });

  it('should record ignored interaction', async () => {
    const { result } = renderHook(() => useCalibration());

    await act(async () => {
      await result.current.recordIgnored('AP-002');
    });

    expect(mockSaveInteraction).toHaveBeenCalledWith(
      expect.objectContaining({
        antiPatternId: 'AP-002',
        action: 'ignored',
      })
    );
  });

  it('should record fixed interaction', async () => {
    const { result } = renderHook(() => useCalibration());

    await act(async () => {
      await result.current.recordFixed('AP-001');
    });

    expect(mockSaveInteraction).toHaveBeenCalledWith(
      expect.objectContaining({
        antiPatternId: 'AP-001',
        action: 'fixed',
      })
    );
  });

  it('should return false positive rate', async () => {
    const { result } = renderHook(() => useCalibration());

    let fpRate = -1;
    await act(async () => {
      fpRate = await result.current.getFalsePositiveRate();
    });

    // With empty calibration data, FP rate = 0
    expect(fpRate).toBe(0);
  });

  it('should fall back to uncalibrated on store error', async () => {
    mockGetCalibrationData.mockRejectedValueOnce(new Error('DB Error'));

    const { result } = renderHook(() => useCalibration());

    let patterns: Awaited<ReturnType<typeof result.current.getCalibratedAntiPatterns>> = [];
    await act(async () => {
      patterns = await result.current.getCalibratedAntiPatterns(makeSpec());
    });

    // Should still return anti-patterns with uncalibrated severities
    expect(patterns).toHaveLength(2);
    expect(patterns[0].wasCalibrated).toBe(false);
    expect(patterns[0].calibratedSeverity).toBe('critical');
  });

  it('should apply calibration when data exists', async () => {
    const calData = new Map([
      ['AP-002', {
        antiPatternId: 'AP-002',
        totalShown: 15,
        ignoredCount: 12,
        fixedCount: 0,
        ignoreRate: 0.8,
        fixRate: 0,
        originalSeverity: 'high' as const,
        calibratedSeverity: 'high' as const,
        lastUpdated: new Date().toISOString(),
      }],
    ]);
    mockGetCalibrationData.mockResolvedValue(calData);

    const { result } = renderHook(() => useCalibration());

    let patterns: Awaited<ReturnType<typeof result.current.getCalibratedAntiPatterns>> = [];
    await act(async () => {
      patterns = await result.current.getCalibratedAntiPatterns(makeSpec());
    });

    // AP-002 should be downgraded from high to medium (ignoreRate 0.8 >= 0.7)
    const ap002 = patterns.find((p) => p.id === 'AP-002');
    expect(ap002).toBeDefined();
    expect(ap002!.originalSeverity).toBe('high');
    expect(ap002!.calibratedSeverity).toBe('medium');
    expect(ap002!.wasCalibrated).toBe(true);
  });

  it('should handle getFalsePositiveRate error gracefully', async () => {
    mockGetCalibrationData.mockRejectedValueOnce(new Error('DB Error'));

    const { result } = renderHook(() => useCalibration());

    let fpRate = -1;
    await act(async () => {
      fpRate = await result.current.getFalsePositiveRate();
    });

    expect(fpRate).toBe(0);
  });
});
