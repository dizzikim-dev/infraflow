/**
 * Parser Telemetry — Tracks parsing outcome statistics.
 *
 * In-memory counters for monitoring parser effectiveness.
 * Tracks template matches, component-only matches, and fallback rates.
 */

import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('ParserTelemetry');

export interface ParserStats {
  totalParses: number;
  templateMatches: number;
  componentOnlyMatches: number;
  fallbacks: number;
  /** Percentage of parses that fell back to default template (0-100) */
  fallbackRate: number;
  /** Most frequently matched templates */
  topTemplates: Record<string, number>;
}

// --- Internal state ---

let totalParses = 0;
let templateMatches = 0;
let componentOnlyMatches = 0;
let fallbacks = 0;
const templateCounts: Record<string, number> = {};

// --- Public API ---

/** Record a successful template match */
export function recordTemplateMatch(templateName: string): void {
  totalParses++;
  templateMatches++;
  templateCounts[templateName] = (templateCounts[templateName] || 0) + 1;
  logger.debug('Template match recorded', { templateName, totalParses });
}

/** Record a component-only match (no template, but components detected) */
export function recordComponentMatch(): void {
  totalParses++;
  componentOnlyMatches++;
  logger.debug('Component-only match recorded', { totalParses });
}

/** Record a fallback to default template */
export function recordFallback(): void {
  totalParses++;
  fallbacks++;
  logger.info('Fallback to default template recorded', {
    totalParses,
    fallbacks,
    fallbackRate: totalParses > 0 ? (fallbacks / totalParses) * 100 : 0,
  });
}

/** Get current parser stats */
export function getParserStats(): ParserStats {
  const fallbackRate = totalParses > 0 ? (fallbacks / totalParses) * 100 : 0;

  // Build topTemplates sorted by frequency (descending)
  const sortedEntries = Object.entries(templateCounts).sort(
    ([, a], [, b]) => b - a
  );
  const topTemplates: Record<string, number> = {};
  for (const [name, count] of sortedEntries) {
    topTemplates[name] = count;
  }

  return {
    totalParses,
    templateMatches,
    componentOnlyMatches,
    fallbacks,
    fallbackRate,
    topTemplates,
  };
}

/** Reset all counters (for testing) */
export function resetParserStats(): void {
  totalParses = 0;
  templateMatches = 0;
  componentOnlyMatches = 0;
  fallbacks = 0;
  // Clear templateCounts in-place
  for (const key of Object.keys(templateCounts)) {
    delete templateCounts[key];
  }
  logger.debug('Parser stats reset');
}
