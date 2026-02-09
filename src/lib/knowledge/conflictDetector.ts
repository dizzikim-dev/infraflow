/**
 * Conflict Detector — Infrastructure Knowledge Graph Phase 4
 *
 * Detects conflicts between a new user contribution and existing knowledge.
 * Used during the contribution submission flow to warn users and moderators
 * about potential contradictions, overlaps, or extensions.
 */

import type { ComponentRelationship } from './types';
import { RELATIONSHIPS } from './relationships';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ConflictInfo {
  existingKnowledgeId: string;
  conflictType: 'contradicts' | 'overlaps' | 'extends';
  description: string;
  descriptionKo: string;
  existingConfidence: number;
}

// ---------------------------------------------------------------------------
// Contradiction matrix
// ---------------------------------------------------------------------------
//
//            requires  recommends  conflicts  enhances  protects
// requires      O          -          C          -         -
// recommends    E          O          C          -         -
// conflicts     C          C          O          C         C
// enhances      -          E          C          O         -
// protects      -          -          C          -         O
//
// O = overlaps (same type)
// C = contradicts
// E = extends
// - = no conflict

/** Set of pairs that are contradictory (order-independent) */
const CONTRADICTORY_PAIRS: ReadonlySet<string> = new Set([
  'requires|conflicts',
  'conflicts|requires',
  'recommends|conflicts',
  'conflicts|recommends',
  'protects|conflicts',
  'conflicts|protects',
  'enhances|conflicts',
  'conflicts|enhances',
]);

/** Map of (newType, existingType) pairs that represent an extension */
const EXTENSION_PAIRS: ReadonlySet<string> = new Set([
  'recommends|requires', // recommends extending requires (strengthening)
  'enhances|recommends', // enhances extending recommends
]);

// ---------------------------------------------------------------------------
// Public functions
// ---------------------------------------------------------------------------

/**
 * Check if two relationship types are contradictory.
 *
 * - 'requires' vs 'conflicts' -> true
 * - 'recommends' vs 'conflicts' -> true
 * - 'protects' vs 'conflicts' -> true
 * - 'enhances' vs 'conflicts' -> true
 * - All others -> false
 */
export function areContradictory(typeA: string, typeB: string): boolean {
  return CONTRADICTORY_PAIRS.has(`${typeA}|${typeB}`);
}

/**
 * Check if a new relationship extends an existing one.
 *
 * - 'recommends' extending 'requires' -> true (strengthening)
 * - 'enhances' extending 'recommends' -> true
 * - Same type -> false (that's overlap, not extension)
 */
export function isExtension(newType: string, existingType: string): boolean {
  return EXTENSION_PAIRS.has(`${newType}|${existingType}`);
}

/**
 * Detect conflicts between a new relationship contribution and existing relationships.
 *
 * Rules:
 * 1. Same source-target pair with opposite relationship type
 *    (e.g., new 'requires' vs existing 'conflicts') -> 'contradicts'
 * 2. Same source-target pair with same relationship type -> 'overlaps' (duplicate)
 * 3. Same source-target pair with compatible but different type
 *    (e.g., new 'recommends' extends existing 'requires') -> 'extends'
 *
 * @param newRel - The new relationship being submitted
 * @param existingRelationships - Existing relationships to check against (defaults to RELATIONSHIPS)
 * @returns Array of conflicts found
 */
export function detectRelationshipConflicts(
  newRel: { source: string; target: string; relationshipType: string },
  existingRelationships?: readonly ComponentRelationship[],
): ConflictInfo[] {
  const existing = existingRelationships ?? RELATIONSHIPS;
  const conflicts: ConflictInfo[] = [];

  for (const rel of existing) {
    // Only check relationships with the same source-target pair
    const sameSourceTarget = rel.source === newRel.source && rel.target === newRel.target;
    const reversedSourceTarget = rel.source === newRel.target && rel.target === newRel.source;

    if (!sameSourceTarget && !reversedSourceTarget) {
      continue;
    }

    const newType = newRel.relationshipType;
    const existingType = rel.relationshipType;

    // Check for overlap (same type, same pair)
    if (newType === existingType) {
      conflicts.push({
        existingKnowledgeId: rel.id,
        conflictType: 'overlaps',
        description: `A ${existingType} relationship between ${rel.source} and ${rel.target} already exists (${rel.id})`,
        descriptionKo: `${rel.source}와 ${rel.target} 간의 ${existingType} 관계가 이미 존재합니다 (${rel.id})`,
        existingConfidence: rel.trust.confidence,
      });
      continue;
    }

    // Check for contradiction
    if (areContradictory(newType, existingType)) {
      conflicts.push({
        existingKnowledgeId: rel.id,
        conflictType: 'contradicts',
        description: `New '${newType}' contradicts existing '${existingType}' relationship between ${rel.source} and ${rel.target} (${rel.id})`,
        descriptionKo: `새로운 '${newType}' 관계가 ${rel.source}와 ${rel.target} 간의 기존 '${existingType}' 관계와 모순됩니다 (${rel.id})`,
        existingConfidence: rel.trust.confidence,
      });
      continue;
    }

    // Check for extension
    if (isExtension(newType, existingType)) {
      conflicts.push({
        existingKnowledgeId: rel.id,
        conflictType: 'extends',
        description: `New '${newType}' extends existing '${existingType}' relationship between ${rel.source} and ${rel.target} (${rel.id})`,
        descriptionKo: `새로운 '${newType}' 관계가 ${rel.source}와 ${rel.target} 간의 기존 '${existingType}' 관계를 확장합니다 (${rel.id})`,
        existingConfidence: rel.trust.confidence,
      });
      continue;
    }

    // No conflict for pairs not in the matrix (marked as '-')
  }

  return conflicts;
}
