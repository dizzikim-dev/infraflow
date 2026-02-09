import { describe, it, expect, beforeEach } from 'vitest';
import { ContributionStore } from '../userContributions';
import type { QuickTip } from '../types';

// Helper to create a valid QuickTip for testing
function makeTestTip(overrides?: Partial<QuickTip>): QuickTip {
  return {
    id: 'tip-test-001',
    type: 'tip',
    component: 'cache',
    category: 'gotcha',
    tipKo: 'Redis는 메모리 부족 시 OOM Killer에 의해 종료될 수 있음',
    tags: ['cache', 'redis', 'memory'],
    trust: {
      confidence: 0.3,
      sources: [{ type: 'user_unverified', title: 'User experience', accessedDate: '2026-02-09' }],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
    ...overrides,
  };
}

function makeContributor(reputation = 0) {
  return {
    id: 'user-001',
    reputation,
    totalContributions: 0,
    approvedCount: 0,
    rejectedCount: 0,
  };
}

describe('ContributionStore', () => {
  let store: ContributionStore;

  beforeEach(() => {
    store = new ContributionStore();
  });

  describe('submit', () => {
    it('should create a contribution with generated ID', () => {
      const contribution = store.submit({
        knowledgeType: 'tip',
        data: makeTestTip(),
        userSources: [],
        contributor: makeContributor(),
      });
      expect(contribution.id).toMatch(/^contrib-/);
      expect(contribution.status).toBe('pending');
    });

    it('should pass auto-validation for valid data', () => {
      const contribution = store.submit({
        knowledgeType: 'tip',
        data: makeTestTip(),
        userSources: [],
        contributor: makeContributor(),
      });
      expect(contribution.validation.autoCheckPassed).toBe(true);
      expect(contribution.validation.autoCheckErrors).toEqual([]);
    });

    it('should fail auto-validation for data without trust', () => {
      const badTip = makeTestTip();
      // @ts-expect-error - intentionally removing trust for test
      delete badTip.trust;
      const contribution = store.submit({
        knowledgeType: 'tip',
        data: badTip,
        userSources: [],
        contributor: makeContributor(),
      });
      expect(contribution.validation.autoCheckPassed).toBe(false);
      expect(contribution.validation.autoCheckErrors.length).toBeGreaterThan(0);
    });

    it('should fail auto-validation for mismatched type', () => {
      const badTip = makeTestTip({ type: 'failure' as never });
      const contribution = store.submit({
        knowledgeType: 'tip',
        data: badTip,
        userSources: [],
        contributor: makeContributor(),
      });
      expect(contribution.validation.autoCheckPassed).toBe(false);
    });

    it('should auto-approve Quick Tip for high-reputation user', () => {
      const contribution = store.submit({
        knowledgeType: 'tip',
        data: makeTestTip(),
        userSources: [],
        contributor: makeContributor(30), // reputation 30 >= 21
      });
      expect(contribution.status).toBe('approved');
    });

    it('should NOT auto-approve Quick Tip for low-reputation user', () => {
      const contribution = store.submit({
        knowledgeType: 'tip',
        data: makeTestTip(),
        userSources: [],
        contributor: makeContributor(10), // reputation 10 < 21
      });
      expect(contribution.status).toBe('pending');
    });

    it('should set timestamps', () => {
      const contribution = store.submit({
        knowledgeType: 'tip',
        data: makeTestTip(),
        userSources: [],
        contributor: makeContributor(),
      });
      expect(contribution.createdAt).toBeTruthy();
      expect(contribution.updatedAt).toBeTruthy();
    });

    it('should increment store size', () => {
      expect(store.size).toBe(0);
      store.submit({
        knowledgeType: 'tip',
        data: makeTestTip(),
        userSources: [],
        contributor: makeContributor(),
      });
      expect(store.size).toBe(1);
    });
  });

  describe('getById', () => {
    it('should return contribution by ID', () => {
      const created = store.submit({
        knowledgeType: 'tip',
        data: makeTestTip(),
        userSources: [],
        contributor: makeContributor(),
      });
      const found = store.getById(created.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(created.id);
    });

    it('should return undefined for non-existent ID', () => {
      const found = store.getById('non-existent');
      expect(found).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return all contributions', () => {
      store.submit({ knowledgeType: 'tip', data: makeTestTip(), userSources: [], contributor: makeContributor() });
      store.submit({ knowledgeType: 'tip', data: makeTestTip(), userSources: [], contributor: makeContributor() });
      expect(store.getAll().length).toBe(2);
    });

    it('should filter by status', () => {
      store.submit({ knowledgeType: 'tip', data: makeTestTip(), userSources: [], contributor: makeContributor(30) }); // auto-approved
      store.submit({ knowledgeType: 'tip', data: makeTestTip(), userSources: [], contributor: makeContributor(0) }); // pending
      const approved = store.getAll({ status: 'approved' });
      const pending = store.getAll({ status: 'pending' });
      expect(approved.length).toBe(1);
      expect(pending.length).toBe(1);
    });

    it('should filter by knowledgeType', () => {
      store.submit({ knowledgeType: 'tip', data: makeTestTip(), userSources: [], contributor: makeContributor() });
      const tips = store.getAll({ knowledgeType: 'tip' });
      expect(tips.length).toBe(1);
      const patterns = store.getAll({ knowledgeType: 'pattern' });
      expect(patterns.length).toBe(0);
    });
  });

  describe('review', () => {
    it('should approve a contribution', () => {
      const created = store.submit({
        knowledgeType: 'tip',
        data: makeTestTip(),
        userSources: [],
        contributor: makeContributor(),
      });
      const reviewed = store.review(created.id, {
        reviewerId: 'admin-001',
        decision: 'approved',
        comment: 'Good tip',
        reviewedAt: new Date().toISOString(),
      });
      expect(reviewed).toBeDefined();
      expect(reviewed!.status).toBe('approved');
      expect(reviewed!.validation.adminReview).toBeDefined();
    });

    it('should reject a contribution', () => {
      const created = store.submit({
        knowledgeType: 'tip',
        data: makeTestTip(),
        userSources: [],
        contributor: makeContributor(),
      });
      const reviewed = store.review(created.id, {
        reviewerId: 'admin-001',
        decision: 'rejected',
        comment: 'Not accurate',
        reviewedAt: new Date().toISOString(),
      });
      expect(reviewed!.status).toBe('rejected');
    });

    it('should request revision', () => {
      const created = store.submit({
        knowledgeType: 'tip',
        data: makeTestTip(),
        userSources: [],
        contributor: makeContributor(),
      });
      const reviewed = store.review(created.id, {
        reviewerId: 'admin-001',
        decision: 'needs_revision',
        comment: 'Please add source',
        reviewedAt: new Date().toISOString(),
      });
      expect(reviewed!.status).toBe('pending');
    });

    it('should return undefined for non-existent ID', () => {
      const result = store.review('non-existent', {
        reviewerId: 'admin-001',
        decision: 'approved',
        comment: '',
        reviewedAt: new Date().toISOString(),
      });
      expect(result).toBeUndefined();
    });
  });

  describe('vote', () => {
    it('should record an upvote', () => {
      const created = store.submit({
        knowledgeType: 'tip',
        data: makeTestTip(),
        userSources: [],
        contributor: makeContributor(),
      });
      const success = store.vote(created.id, 'voter-001', 'up');
      expect(success).toBe(true);
      const updated = store.getById(created.id)!;
      expect(updated.validation.communityVotes.up).toBe(1);
    });

    it('should record a downvote', () => {
      const created = store.submit({
        knowledgeType: 'tip',
        data: makeTestTip(),
        userSources: [],
        contributor: makeContributor(),
      });
      store.vote(created.id, 'voter-001', 'down');
      const updated = store.getById(created.id)!;
      expect(updated.validation.communityVotes.down).toBe(1);
    });

    it('should prevent duplicate votes', () => {
      const created = store.submit({
        knowledgeType: 'tip',
        data: makeTestTip(),
        userSources: [],
        contributor: makeContributor(),
      });
      store.vote(created.id, 'voter-001', 'up');
      const secondVote = store.vote(created.id, 'voter-001', 'up');
      expect(secondVote).toBe(false);
    });

    it('should trigger re-review at 3 downvotes on approved', () => {
      const created = store.submit({
        knowledgeType: 'tip',
        data: makeTestTip(),
        userSources: [],
        contributor: makeContributor(30), // auto-approved
      });
      expect(store.getById(created.id)!.status).toBe('approved');
      store.vote(created.id, 'v1', 'down');
      store.vote(created.id, 'v2', 'down');
      store.vote(created.id, 'v3', 'down');
      expect(store.getById(created.id)!.status).toBe('in_review');
    });

    it('should return false for non-existent contribution', () => {
      expect(store.vote('non-existent', 'voter', 'up')).toBe(false);
    });
  });

  describe('Zod schema validation', () => {
    it('should fail when tags is an empty array', () => {
      const tip = makeTestTip({ tags: [] });
      const contribution = store.submit({
        knowledgeType: 'tip',
        data: tip,
        userSources: [],
        contributor: makeContributor(),
      });
      expect(contribution.validation.autoCheckPassed).toBe(false);
      expect(contribution.validation.autoCheckErrors.some(e => e.includes('tag'))).toBe(true);
    });

    it('should fail when trust.sources is empty array', () => {
      const tip = makeTestTip();
      tip.trust = { ...tip.trust, sources: [] };
      const contribution = store.submit({
        knowledgeType: 'tip',
        data: tip,
        userSources: [],
        contributor: makeContributor(),
      });
      expect(contribution.validation.autoCheckPassed).toBe(false);
      expect(contribution.validation.autoCheckErrors.some(e => e.includes('source'))).toBe(true);
    });

    it('should fail when id is empty string', () => {
      const tip = makeTestTip({ id: '' });
      const contribution = store.submit({
        knowledgeType: 'tip',
        data: tip,
        userSources: [],
        contributor: makeContributor(),
      });
      expect(contribution.validation.autoCheckPassed).toBe(false);
      expect(contribution.validation.autoCheckErrors.some(e => e.includes('id'))).toBe(true);
    });

    it('should fail when confidence is out of range', () => {
      const tip = makeTestTip();
      tip.trust = { ...tip.trust, confidence: 1.5 };
      const contribution = store.submit({
        knowledgeType: 'tip',
        data: tip,
        userSources: [],
        contributor: makeContributor(),
      });
      expect(contribution.validation.autoCheckPassed).toBe(false);
    });
  });

  describe('getPendingQueue', () => {
    it('should return only pending contributions', () => {
      store.submit({ knowledgeType: 'tip', data: makeTestTip(), userSources: [], contributor: makeContributor(30) }); // auto-approved
      store.submit({ knowledgeType: 'tip', data: makeTestTip(), userSources: [], contributor: makeContributor(0) }); // pending
      store.submit({ knowledgeType: 'tip', data: makeTestTip(), userSources: [], contributor: makeContributor(0) }); // pending
      const queue = store.getPendingQueue();
      expect(queue.length).toBe(2);
      for (const c of queue) {
        expect(c.status).toBe('pending');
      }
    });
  });
});
