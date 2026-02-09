/**
 * Infrastructure Knowledge Graph - User Contribution Management
 *
 * Manages user-contributed knowledge entries with an in-memory store.
 * Provides CRUD operations, auto-validation, admin review, and community voting.
 */

import { nanoid } from 'nanoid';
import { z } from 'zod';
import type {
  KnowledgeType,
  ComponentRelationship,
  FailureScenario,
  ArchitecturePattern,
  AntiPattern,
  QuickTip,
} from './types';
import type { ConflictInfo } from './conflictDetector';

export type { ConflictInfo };

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** User-provided source reference */
export interface UserSource {
  description: string;
  url?: string;
  isFirsthand: boolean;
}

/** Contributor profile */
export interface Contributor {
  id: string;
  reputation: number;         // 0~100
  totalContributions: number;
  approvedCount: number;
  rejectedCount: number;
}

/** Contribution status */
export type ContributionStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'conflicted';

/** Admin review decision */
export interface AdminReview {
  reviewerId: string;
  decision: 'approved' | 'rejected' | 'needs_revision';
  comment: string;
  reviewedAt: string;
}

/** Community votes */
export interface CommunityVotes {
  up: number;
  down: number;
  voters: string[];
}

/** Validation state */
export interface ValidationState {
  autoCheckPassed: boolean;
  autoCheckErrors: string[];
  conflicts: ConflictInfo[];
  adminReview?: AdminReview;
  communityVotes: CommunityVotes;
}

/** Knowledge data union */
export type KnowledgeData =
  | ComponentRelationship
  | FailureScenario
  | ArchitecturePattern
  | AntiPattern
  | QuickTip;

/** User contribution entry */
export interface UserContribution {
  id: string;
  knowledgeType: KnowledgeType;
  status: ContributionStatus;
  data: KnowledgeData;
  userSources: UserSource[];
  contributor: Contributor;
  validation: ValidationState;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// KnowledgeType to data type field mapping
// ---------------------------------------------------------------------------

const KNOWLEDGE_TYPE_MAP: Record<string, KnowledgeType> = {
  relationship: 'relationship',
  failure: 'failure',
  pattern: 'pattern',
  antipattern: 'antipattern',
  tip: 'tip',
};

// ---------------------------------------------------------------------------
// Zod Schemas for Auto-validation
// ---------------------------------------------------------------------------

const knowledgeSourceSchema = z.object({
  type: z.string().min(1),
  title: z.string().min(1),
  accessedDate: z.string().min(1),
});

const trustMetadataSchema = z.object({
  confidence: z.number().min(0).max(1),
  sources: z.array(knowledgeSourceSchema).min(1, 'data.trust.sources must contain at least one source'),
  lastReviewedAt: z.string().min(1),
  upvotes: z.number().int().min(0),
  downvotes: z.number().int().min(0),
});

const knowledgeBaseSchema = z.object({
  id: z.string().min(1, 'Missing required field: data.id'),
  type: z.string().min(1, 'Missing required field: data.type'),
  tags: z.array(z.string()).min(1, 'data.tags must contain at least one tag'),
  trust: trustMetadataSchema,
});

// ---------------------------------------------------------------------------
// Auto-validation
// ---------------------------------------------------------------------------

function autoValidate(
  knowledgeType: KnowledgeType,
  data: KnowledgeData,
): { passed: boolean; errors: string[] } {
  // Step 1: Validate base schema shape with Zod
  const result = knowledgeBaseSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map(issue => {
      if (issue.message.startsWith('Missing required field') ||
          issue.message.startsWith('data.')) {
        return issue.message;
      }
      const path = issue.path.join('.');
      if (path === 'trust') return 'Missing required field: data.trust';
      if (path === 'id') return 'Missing required field: data.id';
      if (path === 'type') return 'Missing required field: data.type';
      if (path === 'tags') return 'Missing required field: data.tags';
      return `${path}: ${issue.message}`;
    });
    return { passed: false, errors };
  }

  // Step 2: Validate type field matches knowledgeType
  const errors: string[] = [];
  const expectedType = KNOWLEDGE_TYPE_MAP[knowledgeType];
  if (result.data.type !== expectedType) {
    errors.push(
      `data.type "${result.data.type}" does not match knowledgeType "${knowledgeType}" (expected "${expectedType}")`,
    );
  }

  return { passed: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// ContributionStore
// ---------------------------------------------------------------------------

export class ContributionStore {
  private contributions: Map<string, UserContribution> = new Map();

  /**
   * Submit a new contribution.
   * Returns the created contribution with ID and validation.
   */
  submit(input: {
    knowledgeType: KnowledgeType;
    data: KnowledgeData;
    userSources: UserSource[];
    contributor: Contributor;
  }): UserContribution {
    const id = `contrib-${nanoid(8)}`;
    const now = new Date().toISOString();

    const { passed, errors } = autoValidate(input.knowledgeType, input.data);

    // Determine initial status
    let status: ContributionStatus = 'pending';

    // Quick Tip auto-approval: tip + reputation >= 21 + autoCheckPassed
    if (
      input.knowledgeType === 'tip' &&
      input.contributor.reputation >= 21 &&
      passed
    ) {
      status = 'approved';
    }

    const contribution: UserContribution = {
      id,
      knowledgeType: input.knowledgeType,
      status,
      data: input.data,
      userSources: input.userSources,
      contributor: input.contributor,
      validation: {
        autoCheckPassed: passed,
        autoCheckErrors: errors,
        conflicts: [],
        communityVotes: {
          up: 0,
          down: 0,
          voters: [],
        },
      },
      createdAt: now,
      updatedAt: now,
    };

    this.contributions.set(id, contribution);
    return contribution;
  }

  /** Get a contribution by ID */
  getById(id: string): UserContribution | undefined {
    return this.contributions.get(id);
  }

  /** Get all contributions, optionally filtered by status, knowledgeType, or contributorId */
  getAll(filter?: {
    status?: ContributionStatus;
    knowledgeType?: KnowledgeType;
    contributorId?: string;
  }): UserContribution[] {
    const results: UserContribution[] = [];

    for (const contribution of this.contributions.values()) {
      if (filter?.status && contribution.status !== filter.status) continue;
      if (filter?.knowledgeType && contribution.knowledgeType !== filter.knowledgeType) continue;
      if (filter?.contributorId && contribution.contributor.id !== filter.contributorId) continue;
      results.push(contribution);
    }

    return results;
  }

  /** Admin review: approve, reject, or request revision */
  review(id: string, review: AdminReview): UserContribution | undefined {
    const contribution = this.contributions.get(id);
    if (!contribution) return undefined;

    contribution.validation.adminReview = review;
    contribution.updatedAt = new Date().toISOString();

    switch (review.decision) {
      case 'approved':
        contribution.status = 'approved';
        break;
      case 'rejected':
        contribution.status = 'rejected';
        break;
      case 'needs_revision':
        contribution.status = 'pending';
        break;
    }

    return contribution;
  }

  /**
   * Vote on a contribution.
   * Returns false if voter already voted or contribution not found.
   */
  vote(id: string, voterId: string, direction: 'up' | 'down'): boolean {
    const contribution = this.contributions.get(id);
    if (!contribution) return false;

    const { communityVotes } = contribution.validation;

    // Prevent duplicate votes
    if (communityVotes.voters.includes(voterId)) return false;

    // Record vote
    if (direction === 'up') {
      communityVotes.up += 1;
    } else {
      communityVotes.down += 1;
    }
    communityVotes.voters.push(voterId);

    // If downvotes >= 3 on an approved contribution, trigger re-review
    if (communityVotes.down >= 3 && contribution.status === 'approved') {
      contribution.status = 'in_review';
    }

    contribution.updatedAt = new Date().toISOString();
    return true;
  }

  /** Get pending contributions for admin review queue */
  getPendingQueue(): UserContribution[] {
    return this.getAll({ status: 'pending' });
  }

  /** Get contribution count */
  get size(): number {
    return this.contributions.size;
  }
}

// ---------------------------------------------------------------------------
// Singleton export
// ---------------------------------------------------------------------------

export const contributionStore = new ContributionStore();
