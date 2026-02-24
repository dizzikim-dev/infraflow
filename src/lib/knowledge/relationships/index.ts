/**
 * Infrastructure Component Relationships
 *
 * Re-exports all relationship categories and provides combined registry + lookup helpers.
 * This is a drop-in replacement for the former monolith relationships.ts.
 */

import type { InfraNodeType } from '@/types/infra';
import type { ComponentRelationship, RelationshipType } from '../types';

import { mandatoryDependencies, strongRecommendations } from './coreDependencies';
import { securityProtections, conflicts } from './securityRelationships';
import { telecomDependencies } from './telecomRelationships';
import { cloudRelationships, cloudNativeRelationships } from './cloudRelationships';
import { k8sRelationships } from './k8sRelationships';
import { authExtRelationships } from './authRelationships';
import { hybridRelationships, saseRelationships } from './hybridRelationships';
import { aiComputeRelationships, aiServiceRelationships, aiCrossRelationships } from './aiRelationships';

// ---------------------------------------------------------------------------
// Combined registry
// ---------------------------------------------------------------------------

/** All verified component relationships */
export const RELATIONSHIPS: readonly ComponentRelationship[] = Object.freeze([
  ...mandatoryDependencies,
  ...strongRecommendations,
  ...securityProtections,
  ...conflicts,
  ...telecomDependencies,
  ...cloudRelationships,
  ...k8sRelationships,
  ...authExtRelationships,
  ...hybridRelationships,
  ...saseRelationships,
  ...cloudNativeRelationships,
  ...aiComputeRelationships,
  ...aiServiceRelationships,
  ...aiCrossRelationships,
]);

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/**
 * Returns all relationships where the given component appears as source or target.
 */
export function getRelationshipsForComponent(type: InfraNodeType): ComponentRelationship[] {
  return RELATIONSHIPS.filter(
    (r) => r.source === type || r.target === type,
  );
}

/**
 * Returns related components with their relationship type and reason.
 * Resolves direction so the returned type is always the "other" component.
 */
export function getRelatedComponents(
  type: InfraNodeType,
): { type: InfraNodeType; relationship: RelationshipType; reason: string }[] {
  const results: { type: InfraNodeType; relationship: RelationshipType; reason: string }[] = [];

  for (const r of RELATIONSHIPS) {
    if (r.source === type) {
      results.push({ type: r.target, relationship: r.relationshipType, reason: r.reason });
    } else if (r.target === type) {
      results.push({ type: r.source, relationship: r.relationshipType, reason: r.reason });
    }
  }

  return results;
}

/**
 * Returns mandatory dependency relationships where the given component is the source.
 * These are components that the given component MUST have in the architecture.
 */
export function getMandatoryDependencies(type: InfraNodeType): ComponentRelationship[] {
  return RELATIONSHIPS.filter(
    (r) => r.source === type && r.relationshipType === 'requires',
  );
}

/**
 * Returns recommendation relationships where the given component is the source.
 * These are components that are strongly suggested alongside the given component.
 */
export function getRecommendations(type: InfraNodeType): ComponentRelationship[] {
  return RELATIONSHIPS.filter(
    (r) => r.source === type && r.relationshipType === 'recommends',
  );
}

/**
 * Returns conflict relationships where the given component is the source.
 * These are component combinations that should be avoided.
 */
export function getConflicts(type: InfraNodeType): ComponentRelationship[] {
  return RELATIONSHIPS.filter(
    (r) => r.source === type && r.relationshipType === 'conflicts',
  );
}
