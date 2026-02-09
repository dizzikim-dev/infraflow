/**
 * LLM Call Metrics - Lightweight in-memory metrics for LLM API calls.
 *
 * Uses a ring buffer (max 200 entries) that persists only during the session.
 * Provides summary statistics for monitoring LLM usage patterns.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LLMProvider = 'claude' | 'openai' | 'fallback';

export interface LLMCallMetric {
  timestamp: string;             // ISO timestamp
  provider: LLMProvider;
  model: string;                 // e.g. 'claude-sonnet-4-5-20250929'
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  success: boolean;
  errorType?: string;            // e.g. 'rate_limit', 'timeout', 'validation_failed'
  validationPassed: boolean;     // Did responseValidator accept the output?
  operationCount?: number;       // Number of operations in LLM response
}

export interface LLMMetricsSummary {
  totalCalls: number;
  successCount: number;
  failureCount: number;
  successRate: number;           // 0.0 - 1.0
  avgLatencyMs: number;
  p95LatencyMs: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  fallbackCount: number;
  fallbackRate: number;          // 0.0 - 1.0
  validationPassRate: number;    // 0.0 - 1.0
  providerBreakdown: Record<LLMProvider, number>;
  errorBreakdown: Record<string, number>;
  since: string;                 // ISO timestamp of oldest entry
}

// ---------------------------------------------------------------------------
// Ring Buffer Store
// ---------------------------------------------------------------------------

const MAX_ENTRIES = 200;
const metrics: LLMCallMetric[] = [];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Record a single LLM call metric.
 */
export function recordLLMCall(metric: LLMCallMetric): void {
  metrics.push(metric);
  if (metrics.length > MAX_ENTRIES) {
    metrics.shift();
  }
}

/**
 * Get all recorded metrics, optionally filtered by time range.
 */
export function getLLMMetrics(since?: string): LLMCallMetric[] {
  if (!since) return [...metrics];
  const sinceTime = new Date(since).getTime();
  return metrics.filter(m => new Date(m.timestamp).getTime() >= sinceTime);
}

/**
 * Get summary statistics of all recorded metrics.
 */
export function getLLMSummary(since?: string): LLMMetricsSummary {
  const filtered = getLLMMetrics(since);
  const total = filtered.length;

  if (total === 0) {
    return {
      totalCalls: 0,
      successCount: 0,
      failureCount: 0,
      successRate: 0,
      avgLatencyMs: 0,
      p95LatencyMs: 0,
      totalPromptTokens: 0,
      totalCompletionTokens: 0,
      fallbackCount: 0,
      fallbackRate: 0,
      validationPassRate: 0,
      providerBreakdown: { claude: 0, openai: 0, fallback: 0 },
      errorBreakdown: {},
      since: new Date().toISOString(),
    };
  }

  const successCount = filtered.filter(m => m.success).length;
  const failureCount = total - successCount;
  const fallbackCount = filtered.filter(m => m.provider === 'fallback').length;
  const validationPassCount = filtered.filter(m => m.validationPassed).length;

  // Latency stats
  const latencies = filtered.map(m => m.latencyMs).sort((a, b) => a - b);
  const avgLatencyMs = Math.round(latencies.reduce((s, v) => s + v, 0) / total);
  const p95Index = Math.min(Math.ceil(total * 0.95) - 1, total - 1);
  const p95LatencyMs = latencies[p95Index];

  // Token totals
  const totalPromptTokens = filtered.reduce((s, m) => s + m.promptTokens, 0);
  const totalCompletionTokens = filtered.reduce((s, m) => s + m.completionTokens, 0);

  // Provider breakdown
  const providerBreakdown: Record<LLMProvider, number> = { claude: 0, openai: 0, fallback: 0 };
  for (const m of filtered) {
    providerBreakdown[m.provider]++;
  }

  // Error breakdown
  const errorBreakdown: Record<string, number> = {};
  for (const m of filtered) {
    if (m.errorType) {
      errorBreakdown[m.errorType] = (errorBreakdown[m.errorType] || 0) + 1;
    }
  }

  return {
    totalCalls: total,
    successCount,
    failureCount,
    successRate: successCount / total,
    avgLatencyMs,
    p95LatencyMs,
    totalPromptTokens,
    totalCompletionTokens,
    fallbackCount,
    fallbackRate: fallbackCount / total,
    validationPassRate: validationPassCount / total,
    providerBreakdown,
    errorBreakdown,
    since: filtered[0].timestamp,
  };
}

/**
 * Clear all recorded metrics. Useful for testing.
 */
export function clearLLMMetrics(): void {
  metrics.length = 0;
}

/**
 * Get the current buffer size.
 */
export function getMetricsCount(): number {
  return metrics.length;
}
