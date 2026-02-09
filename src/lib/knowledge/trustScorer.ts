/**
 * Trust Scorer — Infrastructure Knowledge Graph Phase 4
 *
 * Calculates trust / confidence scores for user contributions.
 * Handles reputation tracking, initial confidence assignment,
 * admin approval adjustments, community vote effects,
 * and auto-approval eligibility.
 */

import type { SourceType } from './types';
import { BASE_CONFIDENCE } from './types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Contributor reputation data */
export interface ContributorReputation {
  approvedCount: number;
  rejectedCount: number;
  upvotes: number;
  downvotes: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Clamp a value between min and max (inclusive). */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ---------------------------------------------------------------------------
// Source quality bonus lookup
// ---------------------------------------------------------------------------

/** Bonus for each source type when calculating approved confidence. */
const SOURCE_QUALITY_BONUS: Record<SourceType, number> = {
  rfc: 0.15,
  nist: 0.15,
  cis: 0.13,
  owasp: 0.12,
  vendor: 0.10,
  academic: 0.10,
  industry: 0.08,
  user_verified: 0.05,
  user_unverified: 0.0,
};

// ---------------------------------------------------------------------------
// Public functions
// ---------------------------------------------------------------------------

/**
 * Calculate contributor reputation score (0~100).
 *
 * Formula: (approved x 10) - (rejected x 5) + (upvotes x 1) - (downvotes x 2)
 * Clamped to [0, 100].
 */
export function calculateReputation(rep: ContributorReputation): number {
  const raw =
    rep.approvedCount * 10 -
    rep.rejectedCount * 5 +
    rep.upvotes * 1 -
    rep.downvotes * 2;
  return clamp(raw, 0, 100);
}

/**
 * Calculate initial confidence for a new user contribution.
 *
 * Base: 0.3 (user_unverified)
 * + reputation bonus: reputation / 1000 (max 0.1)
 * + source bonus: if user provides sources with URLs, +0.05
 * + firsthand bonus: if user marks as firsthand experience, +0.02
 *
 * If conflicted (hasConflicts = true): cap at 0.1
 *
 * Clamped to [0.05, 0.5] (user contribution can never start above 0.5)
 */
export function calculateInitialConfidence(options: {
  reputation: number;
  hasSourceUrls: boolean;
  isFirsthand: boolean;
  hasConflicts: boolean;
}): number {
  const base = BASE_CONFIDENCE.user_unverified; // 0.3

  const reputationBonus = Math.min(options.reputation / 1000, 0.1);
  const sourceBonus = options.hasSourceUrls ? 0.05 : 0;
  const firsthandBonus = options.isFirsthand ? 0.02 : 0;

  let confidence = base + reputationBonus + sourceBonus + firsthandBonus;

  // If the contribution has conflicts with existing knowledge, cap heavily
  if (options.hasConflicts) {
    confidence = Math.min(confidence, 0.1);
  }

  return clamp(confidence, 0.05, 0.5);
}

/**
 * Calculate approved confidence after admin review.
 *
 * Base: 0.5 (user_verified)
 * + source quality bonus: up to 0.15 based on source type
 *
 * Takes the maximum source quality bonus from all provided source types.
 *
 * Clamped to [0.5, 0.65]
 */
export function calculateApprovedConfidence(sourceTypes: SourceType[]): number {
  const base = 0.5;

  // Take the best source quality bonus
  let maxSourceBonus = 0;
  for (const st of sourceTypes) {
    const bonus = SOURCE_QUALITY_BONUS[st] ?? 0;
    if (bonus > maxSourceBonus) {
      maxSourceBonus = bonus;
    }
  }

  return clamp(base + maxSourceBonus, 0.5, 0.65);
}

/**
 * Apply community vote adjustments to confidence.
 *
 * Each net upvote (above 5): +0.01 (max total +0.15)
 * Net downvotes: no change (handled by re-review trigger)
 *
 * Max confidence from votes: 0.8
 */
export function applyVoteAdjustment(
  currentConfidence: number,
  upvotes: number,
  downvotes: number,
): number {
  const netVotes = upvotes - downvotes;

  // Only positive net votes above threshold of 5 contribute
  if (netVotes <= 5) {
    return currentConfidence;
  }

  const effectiveVotes = netVotes - 5;
  const voteBonus = Math.min(effectiveVotes * 0.01, 0.15);

  return Math.min(currentConfidence + voteBonus, 0.8);
}

/**
 * Determine auto-approval eligibility based on reputation.
 *
 * reputation 0~20:   no auto-approval
 * reputation 21~50:  auto-approve 'tip' only (confidence 0.35)
 * reputation 51~80:  auto-approve 'tip', 'relationship', 'failure' (confidence 0.45)
 * reputation 81~100: auto-approve all types (confidence 0.55, Trusted Contributor)
 */
export function getAutoApprovalLevel(reputation: number): {
  canAutoApprove: boolean;
  allowedTypes: string[];
  autoConfidence: number;
} {
  if (reputation <= 20) {
    return {
      canAutoApprove: false,
      allowedTypes: [],
      autoConfidence: 0,
    };
  }

  if (reputation <= 50) {
    return {
      canAutoApprove: true,
      allowedTypes: ['tip'],
      autoConfidence: 0.35,
    };
  }

  if (reputation <= 80) {
    return {
      canAutoApprove: true,
      allowedTypes: ['tip', 'relationship', 'failure'],
      autoConfidence: 0.45,
    };
  }

  // reputation 81~100: Trusted Contributor
  return {
    canAutoApprove: true,
    allowedTypes: ['tip', 'relationship', 'failure', 'pattern', 'antipattern', 'performance'],
    autoConfidence: 0.55,
  };
}
