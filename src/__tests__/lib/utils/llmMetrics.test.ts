import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordLLMCall,
  getLLMMetrics,
  getLLMSummary,
  clearLLMMetrics,
  getMetricsCount,
} from '@/lib/utils/llmMetrics';
import type { LLMCallMetric } from '@/lib/utils/llmMetrics';

function makeMetric(overrides?: Partial<LLMCallMetric>): LLMCallMetric {
  return {
    timestamp: new Date().toISOString(),
    provider: 'claude',
    model: 'claude-sonnet-4-5-20250929',
    promptTokens: 500,
    completionTokens: 200,
    latencyMs: 1200,
    success: true,
    validationPassed: true,
    ...overrides,
  };
}

describe('llmMetrics', () => {
  beforeEach(() => {
    clearLLMMetrics();
  });

  describe('recordLLMCall', () => {
    it('should record a metric', () => {
      recordLLMCall(makeMetric());
      expect(getMetricsCount()).toBe(1);
    });

    it('should record multiple metrics', () => {
      recordLLMCall(makeMetric());
      recordLLMCall(makeMetric());
      recordLLMCall(makeMetric());
      expect(getMetricsCount()).toBe(3);
    });

    it('should enforce ring buffer max size (200)', () => {
      for (let i = 0; i < 210; i++) {
        recordLLMCall(makeMetric({ latencyMs: i }));
      }
      expect(getMetricsCount()).toBe(200);
      // Oldest entries should be removed
      const metrics = getLLMMetrics();
      expect(metrics[0].latencyMs).toBe(10); // First 10 dropped
    });
  });

  describe('getLLMMetrics', () => {
    it('should return all metrics', () => {
      recordLLMCall(makeMetric());
      recordLLMCall(makeMetric());
      expect(getLLMMetrics()).toHaveLength(2);
    });

    it('should return empty array when no metrics', () => {
      expect(getLLMMetrics()).toEqual([]);
    });

    it('should filter by since timestamp', () => {
      const old = new Date('2026-01-01T00:00:00Z').toISOString();
      const recent = new Date('2026-02-09T12:00:00Z').toISOString();
      recordLLMCall(makeMetric({ timestamp: old }));
      recordLLMCall(makeMetric({ timestamp: recent }));

      const filtered = getLLMMetrics('2026-02-01T00:00:00Z');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].timestamp).toBe(recent);
    });

    it('should return a copy (not direct reference)', () => {
      recordLLMCall(makeMetric());
      const result = getLLMMetrics();
      result.push(makeMetric());
      expect(getMetricsCount()).toBe(1); // Original unchanged
    });
  });

  describe('getLLMSummary', () => {
    it('should return zero summary when empty', () => {
      const summary = getLLMSummary();
      expect(summary.totalCalls).toBe(0);
      expect(summary.successRate).toBe(0);
      expect(summary.avgLatencyMs).toBe(0);
      expect(summary.fallbackRate).toBe(0);
    });

    it('should calculate success rate', () => {
      recordLLMCall(makeMetric({ success: true }));
      recordLLMCall(makeMetric({ success: true }));
      recordLLMCall(makeMetric({ success: false, errorType: 'timeout' }));
      const summary = getLLMSummary();
      expect(summary.successCount).toBe(2);
      expect(summary.failureCount).toBe(1);
      expect(summary.successRate).toBeCloseTo(2 / 3);
    });

    it('should calculate average latency', () => {
      recordLLMCall(makeMetric({ latencyMs: 1000 }));
      recordLLMCall(makeMetric({ latencyMs: 2000 }));
      recordLLMCall(makeMetric({ latencyMs: 3000 }));
      const summary = getLLMSummary();
      expect(summary.avgLatencyMs).toBe(2000);
    });

    it('should calculate p95 latency', () => {
      // Add 20 metrics with latencies 100..2000
      for (let i = 1; i <= 20; i++) {
        recordLLMCall(makeMetric({ latencyMs: i * 100 }));
      }
      const summary = getLLMSummary();
      // p95 of 20 items = index 18 (0-based) = 1900
      expect(summary.p95LatencyMs).toBe(1900);
    });

    it('should count total tokens', () => {
      recordLLMCall(makeMetric({ promptTokens: 100, completionTokens: 50 }));
      recordLLMCall(makeMetric({ promptTokens: 200, completionTokens: 80 }));
      const summary = getLLMSummary();
      expect(summary.totalPromptTokens).toBe(300);
      expect(summary.totalCompletionTokens).toBe(130);
    });

    it('should calculate fallback rate', () => {
      recordLLMCall(makeMetric({ provider: 'claude' }));
      recordLLMCall(makeMetric({ provider: 'fallback' }));
      recordLLMCall(makeMetric({ provider: 'fallback' }));
      const summary = getLLMSummary();
      expect(summary.fallbackCount).toBe(2);
      expect(summary.fallbackRate).toBeCloseTo(2 / 3);
    });

    it('should calculate validation pass rate', () => {
      recordLLMCall(makeMetric({ validationPassed: true }));
      recordLLMCall(makeMetric({ validationPassed: true }));
      recordLLMCall(makeMetric({ validationPassed: false }));
      recordLLMCall(makeMetric({ validationPassed: false }));
      const summary = getLLMSummary();
      expect(summary.validationPassRate).toBe(0.5);
    });

    it('should provide provider breakdown', () => {
      recordLLMCall(makeMetric({ provider: 'claude' }));
      recordLLMCall(makeMetric({ provider: 'claude' }));
      recordLLMCall(makeMetric({ provider: 'openai' }));
      recordLLMCall(makeMetric({ provider: 'fallback' }));
      const summary = getLLMSummary();
      expect(summary.providerBreakdown.claude).toBe(2);
      expect(summary.providerBreakdown.openai).toBe(1);
      expect(summary.providerBreakdown.fallback).toBe(1);
    });

    it('should provide error breakdown', () => {
      recordLLMCall(makeMetric({ success: false, errorType: 'timeout' }));
      recordLLMCall(makeMetric({ success: false, errorType: 'timeout' }));
      recordLLMCall(makeMetric({ success: false, errorType: 'rate_limit' }));
      recordLLMCall(makeMetric({ success: true }));
      const summary = getLLMSummary();
      expect(summary.errorBreakdown.timeout).toBe(2);
      expect(summary.errorBreakdown.rate_limit).toBe(1);
    });

    it('should report since timestamp', () => {
      const ts = '2026-02-09T10:00:00Z';
      recordLLMCall(makeMetric({ timestamp: ts }));
      recordLLMCall(makeMetric({ timestamp: '2026-02-09T11:00:00Z' }));
      const summary = getLLMSummary();
      expect(summary.since).toBe(ts);
    });

    it('should filter by since parameter', () => {
      recordLLMCall(makeMetric({ timestamp: '2026-01-01T00:00:00Z', provider: 'openai' }));
      recordLLMCall(makeMetric({ timestamp: '2026-02-09T12:00:00Z', provider: 'claude' }));
      const summary = getLLMSummary('2026-02-01T00:00:00Z');
      expect(summary.totalCalls).toBe(1);
      expect(summary.providerBreakdown.claude).toBe(1);
      expect(summary.providerBreakdown.openai).toBe(0);
    });
  });

  describe('clearLLMMetrics', () => {
    it('should clear all metrics', () => {
      recordLLMCall(makeMetric());
      recordLLMCall(makeMetric());
      expect(getMetricsCount()).toBe(2);
      clearLLMMetrics();
      expect(getMetricsCount()).toBe(0);
      expect(getLLMMetrics()).toEqual([]);
    });
  });

  describe('getMetricsCount', () => {
    it('should return 0 initially', () => {
      expect(getMetricsCount()).toBe(0);
    });

    it('should match number of recorded metrics', () => {
      recordLLMCall(makeMetric());
      recordLLMCall(makeMetric());
      recordLLMCall(makeMetric());
      expect(getMetricsCount()).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('should handle single metric for p95', () => {
      recordLLMCall(makeMetric({ latencyMs: 500 }));
      const summary = getLLMSummary();
      expect(summary.p95LatencyMs).toBe(500);
    });

    it('should handle all failures', () => {
      recordLLMCall(makeMetric({ success: false, errorType: 'timeout' }));
      recordLLMCall(makeMetric({ success: false, errorType: 'timeout' }));
      const summary = getLLMSummary();
      expect(summary.successRate).toBe(0);
      expect(summary.failureCount).toBe(2);
    });

    it('should handle all fallbacks', () => {
      recordLLMCall(makeMetric({ provider: 'fallback' }));
      const summary = getLLMSummary();
      expect(summary.fallbackRate).toBe(1);
    });

    it('should handle mixed providers and errors', () => {
      recordLLMCall(makeMetric({ provider: 'claude', success: true }));
      recordLLMCall(makeMetric({ provider: 'openai', success: false, errorType: 'rate_limit' }));
      recordLLMCall(makeMetric({ provider: 'fallback', success: true }));
      const summary = getLLMSummary();
      expect(summary.totalCalls).toBe(3);
      expect(summary.successRate).toBeCloseTo(2 / 3);
      expect(summary.providerBreakdown.claude).toBe(1);
      expect(summary.providerBreakdown.openai).toBe(1);
      expect(summary.providerBreakdown.fallback).toBe(1);
    });
  });
});
