import { describe, it, expect } from 'vitest';
import {
  calculateReputation,
  calculateInitialConfidence,
  calculateApprovedConfidence,
  applyVoteAdjustment,
  getAutoApprovalLevel,
} from '../trustScorer';

describe('trustScorer', () => {
  describe('calculateReputation', () => {
    it('should calculate basic reputation', () => {
      const rep = calculateReputation({
        approvedCount: 5,
        rejectedCount: 0,
        upvotes: 10,
        downvotes: 0,
      });
      // 5*10 + 10*1 = 60
      expect(rep).toBe(60);
    });

    it('should subtract rejected and downvotes', () => {
      const rep = calculateReputation({
        approvedCount: 3,
        rejectedCount: 2,
        upvotes: 5,
        downvotes: 3,
      });
      // 3*10 - 2*5 + 5*1 - 3*2 = 30 - 10 + 5 - 6 = 19
      expect(rep).toBe(19);
    });

    it('should clamp to 0 minimum', () => {
      const rep = calculateReputation({
        approvedCount: 0,
        rejectedCount: 10,
        upvotes: 0,
        downvotes: 20,
      });
      expect(rep).toBe(0);
    });

    it('should clamp to 100 maximum', () => {
      const rep = calculateReputation({
        approvedCount: 20,
        rejectedCount: 0,
        upvotes: 50,
        downvotes: 0,
      });
      // 20*10 + 50*1 = 250 → clamped to 100
      expect(rep).toBe(100);
    });

    it('should return 0 for new user', () => {
      const rep = calculateReputation({
        approvedCount: 0,
        rejectedCount: 0,
        upvotes: 0,
        downvotes: 0,
      });
      expect(rep).toBe(0);
    });
  });

  describe('calculateInitialConfidence', () => {
    it('should return base confidence for new user with no bonuses', () => {
      const conf = calculateInitialConfidence({
        reputation: 0,
        hasSourceUrls: false,
        isFirsthand: false,
        hasConflicts: false,
      });
      expect(conf).toBe(0.3);
    });

    it('should add reputation bonus', () => {
      const conf = calculateInitialConfidence({
        reputation: 80,
        hasSourceUrls: false,
        isFirsthand: false,
        hasConflicts: false,
      });
      // 0.3 + 80/1000 = 0.3 + 0.08 = 0.38
      expect(conf).toBeCloseTo(0.38);
    });

    it('should add source URL bonus', () => {
      const conf = calculateInitialConfidence({
        reputation: 0,
        hasSourceUrls: true,
        isFirsthand: false,
        hasConflicts: false,
      });
      // 0.3 + 0.05 = 0.35
      expect(conf).toBeCloseTo(0.35);
    });

    it('should add firsthand bonus', () => {
      const conf = calculateInitialConfidence({
        reputation: 0,
        hasSourceUrls: false,
        isFirsthand: true,
        hasConflicts: false,
      });
      // 0.3 + 0.02 = 0.32
      expect(conf).toBeCloseTo(0.32);
    });

    it('should cap at 0.1 when conflicts exist', () => {
      const conf = calculateInitialConfidence({
        reputation: 80,
        hasSourceUrls: true,
        isFirsthand: true,
        hasConflicts: true,
      });
      expect(conf).toBe(0.1);
    });

    it('should not exceed 0.5', () => {
      const conf = calculateInitialConfidence({
        reputation: 100,
        hasSourceUrls: true,
        isFirsthand: true,
        hasConflicts: false,
      });
      // 0.3 + 0.1 + 0.05 + 0.02 = 0.47
      expect(conf).toBeLessThanOrEqual(0.5);
    });

    it('should not go below 0.05', () => {
      const conf = calculateInitialConfidence({
        reputation: 0,
        hasSourceUrls: false,
        isFirsthand: false,
        hasConflicts: true,
      });
      expect(conf).toBeGreaterThanOrEqual(0.05);
    });
  });

  describe('calculateApprovedConfidence', () => {
    it('should return 0.5 base with no sources', () => {
      const conf = calculateApprovedConfidence([]);
      expect(conf).toBe(0.5);
    });

    it('should add NIST source bonus', () => {
      const conf = calculateApprovedConfidence(['nist']);
      // 0.5 + 0.15 = 0.65
      expect(conf).toBe(0.65);
    });

    it('should add vendor source bonus', () => {
      const conf = calculateApprovedConfidence(['vendor']);
      // 0.5 + 0.10 = 0.60
      expect(conf).toBe(0.6);
    });

    it('should take the best bonus from multiple sources', () => {
      const conf = calculateApprovedConfidence(['vendor', 'nist', 'industry']);
      // best is nist: 0.5 + 0.15 = 0.65
      expect(conf).toBe(0.65);
    });

    it('should not exceed 0.65', () => {
      const conf = calculateApprovedConfidence(['rfc', 'nist', 'cis']);
      expect(conf).toBeLessThanOrEqual(0.65);
    });

    it('should not go below 0.5', () => {
      const conf = calculateApprovedConfidence(['user_unverified']);
      expect(conf).toBeGreaterThanOrEqual(0.5);
    });
  });

  describe('applyVoteAdjustment', () => {
    it('should not adjust when net votes <= 5', () => {
      expect(applyVoteAdjustment(0.5, 3, 0)).toBe(0.5);
      expect(applyVoteAdjustment(0.5, 5, 0)).toBe(0.5);
      expect(applyVoteAdjustment(0.5, 5, 1)).toBe(0.5);
    });

    it('should add bonus for net votes above 5', () => {
      // net = 10, effective = 5, bonus = 0.05
      const result = applyVoteAdjustment(0.5, 10, 0);
      expect(result).toBeCloseTo(0.55);
    });

    it('should cap bonus at 0.15', () => {
      // net = 100, effective = 95, bonus = min(0.95, 0.15) = 0.15
      const result = applyVoteAdjustment(0.5, 100, 0);
      expect(result).toBeCloseTo(0.65);
    });

    it('should not exceed 0.8', () => {
      const result = applyVoteAdjustment(0.75, 100, 0);
      expect(result).toBeLessThanOrEqual(0.8);
    });

    it('should not change when net downvotes', () => {
      const result = applyVoteAdjustment(0.5, 0, 10);
      expect(result).toBe(0.5);
    });
  });

  describe('getAutoApprovalLevel', () => {
    it('should not allow auto-approval for reputation 0-20', () => {
      expect(getAutoApprovalLevel(0).canAutoApprove).toBe(false);
      expect(getAutoApprovalLevel(10).canAutoApprove).toBe(false);
      expect(getAutoApprovalLevel(20).canAutoApprove).toBe(false);
    });

    it('should allow tip auto-approval for reputation 21-50', () => {
      const level = getAutoApprovalLevel(30);
      expect(level.canAutoApprove).toBe(true);
      expect(level.allowedTypes).toEqual(['tip']);
      expect(level.autoConfidence).toBe(0.35);
    });

    it('should allow tip+relationship+failure for reputation 51-80', () => {
      const level = getAutoApprovalLevel(60);
      expect(level.canAutoApprove).toBe(true);
      expect(level.allowedTypes).toContain('tip');
      expect(level.allowedTypes).toContain('relationship');
      expect(level.allowedTypes).toContain('failure');
      expect(level.autoConfidence).toBe(0.45);
    });

    it('should allow all types for reputation 81-100 (Trusted)', () => {
      const level = getAutoApprovalLevel(90);
      expect(level.canAutoApprove).toBe(true);
      expect(level.allowedTypes.length).toBeGreaterThanOrEqual(5);
      expect(level.autoConfidence).toBe(0.55);
    });

    it('should handle exact boundary values', () => {
      expect(getAutoApprovalLevel(21).canAutoApprove).toBe(true);
      expect(getAutoApprovalLevel(51).allowedTypes).toContain('relationship');
      expect(getAutoApprovalLevel(81).autoConfidence).toBe(0.55);
    });
  });
});
