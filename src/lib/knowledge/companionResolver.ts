/**
 * Companion Resolver
 *
 * Resolves companion requirements for a product/service by combining:
 * 1. Product/service-level overrides (requiredCompanions, recommendedCompanions)
 * 2. Generic relationships from relationships.ts (fallback)
 *
 * Product-level data takes priority over generic relationships.
 */

import type { InfraNodeType } from '@/types/infra';
import type { RequiredCompanion, RecommendedCompanion, CompanionRef } from './types';
import { RELATIONSHIPS } from './relationships';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ResolvedCompanions {
  required: RequiredCompanion[];
  recommended: RecommendedCompanion[];
  conflicts: CompanionRef[];
}

export interface CompanionOverrides {
  required?: RequiredCompanion[];
  recommended?: RecommendedCompanion[];
  conflicts?: CompanionRef[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Derive companion requirements from the generic relationship graph
 * for a given component type.
 */
function deriveFromRelationships(componentType: InfraNodeType): ResolvedCompanions {
  const required: RequiredCompanion[] = [];
  const recommended: RecommendedCompanion[] = [];
  const conflicts: CompanionRef[] = [];

  for (const rel of RELATIONSHIPS) {
    // Only process relationships where this component is the source
    if (rel.source !== componentType) continue;

    const companion: CompanionRef = {
      componentType: rel.target,
      reason: rel.reason,
      reasonKo: rel.reasonKo,
    };

    switch (rel.relationshipType) {
      case 'requires':
        required.push({
          ...companion,
          severity: rel.strength === 'mandatory' ? 'critical' : 'high',
        });
        break;

      case 'recommends':
      case 'enhances':
      case 'protects':
        recommended.push({
          ...companion,
          severity: rel.strength === 'strong' ? 'high' : 'medium',
        });
        break;

      case 'conflicts':
        conflicts.push(companion);
        break;
    }
  }

  return { required, recommended, conflicts };
}

/**
 * Deduplicate companions by componentType, keeping the first occurrence
 * (product overrides are inserted first, so they take priority).
 */
function dedupeByType<T extends CompanionRef>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.componentType)) return false;
    seen.add(item.componentType);
    return true;
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Resolve companion requirements for a component type.
 *
 * Product/service-level overrides take priority over generic relationships.
 * If no overrides are provided, falls back entirely to the generic graph.
 *
 * @param componentType - The generic InfraNodeType
 * @param overrides - Optional product/service-level companion data
 * @returns Merged and deduplicated companion requirements
 */
export function resolveCompanions(
  componentType: InfraNodeType,
  overrides?: CompanionOverrides,
): ResolvedCompanions {
  const fromGraph = deriveFromRelationships(componentType);

  if (!overrides) {
    return fromGraph;
  }

  // Product overrides first (higher priority), then graph-derived
  return {
    required: dedupeByType([
      ...(overrides.required ?? []),
      ...fromGraph.required,
    ]),
    recommended: dedupeByType([
      ...(overrides.recommended ?? []),
      ...fromGraph.recommended,
    ]),
    conflicts: dedupeByType([
      ...(overrides.conflicts ?? []),
      ...fromGraph.conflicts,
    ]),
  };
}

/**
 * Check which required/recommended companions are missing from a diagram.
 *
 * @param componentType - The component type to check companions for
 * @param presentTypes - Set of component types present in the diagram
 * @param overrides - Optional product/service-level overrides
 * @returns Missing companions grouped by severity
 */
export function findMissingCompanions(
  componentType: InfraNodeType,
  presentTypes: Set<InfraNodeType>,
  overrides?: CompanionOverrides,
): { missingRequired: RequiredCompanion[]; missingRecommended: RecommendedCompanion[] } {
  const resolved = resolveCompanions(componentType, overrides);

  return {
    missingRequired: resolved.required.filter(
      (c) => !presentTypes.has(c.componentType),
    ),
    missingRecommended: resolved.recommended.filter(
      (c) => !presentTypes.has(c.componentType),
    ),
  };
}
