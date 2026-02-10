/**
 * Shared severity ordering utility.
 *
 * Consolidates duplicated severity/priority sorting logic
 * found across contextEnricher, vulnerabilities, securityAudit, and industryCompliance.
 */

export const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

/**
 * Compare two severity strings for sorting (ascending = most severe first).
 * Unknown severities are sorted after `info`.
 */
export function compareBySeverity(a: string, b: string): number {
  return (SEVERITY_ORDER[a] ?? 9) - (SEVERITY_ORDER[b] ?? 9);
}
