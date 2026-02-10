/**
 * AntiPattern Detection Function Registry
 *
 * Maps antipattern IDs to their detection functions.
 * Detection functions are runtime-only (JavaScript closures) and cannot be serialized to DB.
 * The DB stores only `detectionRuleId`, and this registry resolves it to the actual function.
 */

import type { InfraSpec } from '@/types/infra';
import { ANTI_PATTERNS } from './antipatterns';

// Build ID → detection function map from the existing antipatterns array
const registry = new Map<string, (spec: InfraSpec) => boolean>();

for (const ap of ANTI_PATTERNS) {
  registry.set(ap.id, ap.detection);
}

/**
 * Get the detection function for a given antipattern rule ID.
 * Returns undefined if the ID is not registered.
 */
export function getDetectionFunction(ruleId: string): ((spec: InfraSpec) => boolean) | undefined {
  return registry.get(ruleId);
}

/**
 * Check if a detection rule ID is registered.
 */
export function hasDetectionRule(ruleId: string): boolean {
  return registry.has(ruleId);
}

/**
 * Get all registered detection rule IDs.
 */
export function getAllDetectionRuleIds(): string[] {
  return Array.from(registry.keys());
}

/**
 * Get the total number of registered detection rules.
 */
export function getDetectionRuleCount(): number {
  return registry.size;
}

/**
 * Run a detection rule against a spec.
 * Returns false if the rule ID is not found.
 */
export function runDetection(ruleId: string, spec: InfraSpec): boolean {
  const fn = registry.get(ruleId);
  if (!fn) return false;
  return fn(spec);
}
