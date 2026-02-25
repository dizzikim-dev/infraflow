/**
 * Assumption Checker
 *
 * Detects missing constraints for a given set of node types,
 * filters by project profile answers, and returns prioritized questions.
 */

import { REQUIRED_ASSUMPTIONS, type AssumptionDef } from './assumptions';
import type { ProjectProfile } from '@/types/profile';

export { REQUIRED_ASSUMPTIONS } from './assumptions';

interface CheckOptions {
  maxQuestions?: number;
}

export function checkAssumptions(
  nodeTypes: string[],
  profile: ProjectProfile | null,
  options: CheckOptions = {},
): AssumptionDef[] {
  const { maxQuestions = 5 } = options;

  // Gather all assumptions for the given node types
  const seen = new Set<string>();
  const all: AssumptionDef[] = [];

  for (const nodeType of nodeTypes) {
    const defs = REQUIRED_ASSUMPTIONS[nodeType];
    if (!defs) continue;
    for (const def of defs) {
      if (seen.has(def.key)) continue;
      seen.add(def.key);
      all.push(def);
    }
  }

  // Filter out assumptions answered by profile
  const filtered = profile
    ? all.filter(def => {
        if (!def.profileField) return true;
        const value = profile[def.profileField as keyof ProjectProfile];
        if (value === undefined || value === null) return true;
        if (Array.isArray(value) && value.length === 0) return true;
        if (typeof value === 'string' && value === '') return true;
        return false;
      })
    : all;

  // Sort: required first, then optional
  filtered.sort((a, b) => {
    if (a.priority === 'required' && b.priority === 'optional') return -1;
    if (a.priority === 'optional' && b.priority === 'required') return 1;
    return 0;
  });

  // Limit
  return filtered.slice(0, maxQuestions);
}
