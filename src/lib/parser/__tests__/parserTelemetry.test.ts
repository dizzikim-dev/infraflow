import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordTemplateMatch,
  recordComponentMatch,
  recordFallback,
  getParserStats,
  resetParserStats,
} from '../parserTelemetry';
import { parsePromptLocal } from '../templateMatcher';

describe('parserTelemetry', () => {
  beforeEach(() => {
    resetParserStats();
  });

  describe('recordTemplateMatch', () => {
    it('should increment totalParses and templateMatches', () => {
      recordTemplateMatch('3tier-web');
      const stats = getParserStats();
      expect(stats.totalParses).toBe(1);
      expect(stats.templateMatches).toBe(1);
      expect(stats.componentOnlyMatches).toBe(0);
      expect(stats.fallbacks).toBe(0);
    });

    it('should increment correctly on multiple calls', () => {
      recordTemplateMatch('3tier-web');
      recordTemplateMatch('simple-waf');
      recordTemplateMatch('3tier-web');
      const stats = getParserStats();
      expect(stats.totalParses).toBe(3);
      expect(stats.templateMatches).toBe(3);
    });
  });

  describe('recordComponentMatch', () => {
    it('should increment totalParses and componentOnlyMatches', () => {
      recordComponentMatch();
      const stats = getParserStats();
      expect(stats.totalParses).toBe(1);
      expect(stats.componentOnlyMatches).toBe(1);
      expect(stats.templateMatches).toBe(0);
      expect(stats.fallbacks).toBe(0);
    });

    it('should increment correctly on multiple calls', () => {
      recordComponentMatch();
      recordComponentMatch();
      recordComponentMatch();
      const stats = getParserStats();
      expect(stats.totalParses).toBe(3);
      expect(stats.componentOnlyMatches).toBe(3);
    });
  });

  describe('recordFallback', () => {
    it('should increment totalParses and fallbacks', () => {
      recordFallback();
      const stats = getParserStats();
      expect(stats.totalParses).toBe(1);
      expect(stats.fallbacks).toBe(1);
      expect(stats.templateMatches).toBe(0);
      expect(stats.componentOnlyMatches).toBe(0);
    });

    it('should increment correctly on multiple calls', () => {
      recordFallback();
      recordFallback();
      const stats = getParserStats();
      expect(stats.totalParses).toBe(2);
      expect(stats.fallbacks).toBe(2);
    });
  });

  describe('getParserStats', () => {
    it('should return zeros when no events recorded', () => {
      const stats = getParserStats();
      expect(stats.totalParses).toBe(0);
      expect(stats.templateMatches).toBe(0);
      expect(stats.componentOnlyMatches).toBe(0);
      expect(stats.fallbacks).toBe(0);
      expect(stats.fallbackRate).toBe(0);
      expect(stats.topTemplates).toEqual({});
    });

    it('should calculate fallbackRate correctly', () => {
      recordTemplateMatch('3tier-web');
      recordTemplateMatch('simple-waf');
      recordComponentMatch();
      recordFallback();
      const stats = getParserStats();
      // 1 fallback out of 4 total = 25%
      expect(stats.fallbackRate).toBe(25);
    });

    it('should return 100% fallbackRate when all are fallbacks', () => {
      recordFallback();
      recordFallback();
      recordFallback();
      const stats = getParserStats();
      expect(stats.fallbackRate).toBe(100);
    });

    it('should return 0% fallbackRate when no fallbacks', () => {
      recordTemplateMatch('3tier-web');
      recordComponentMatch();
      const stats = getParserStats();
      expect(stats.fallbackRate).toBe(0);
    });
  });

  describe('topTemplates', () => {
    it('should track template names and counts', () => {
      recordTemplateMatch('3tier-web');
      recordTemplateMatch('3tier-web');
      recordTemplateMatch('simple-waf');
      const stats = getParserStats();
      expect(stats.topTemplates['3tier-web']).toBe(2);
      expect(stats.topTemplates['simple-waf']).toBe(1);
    });

    it('should sort by frequency descending', () => {
      recordTemplateMatch('simple-waf');
      recordTemplateMatch('3tier-web');
      recordTemplateMatch('3tier-web');
      recordTemplateMatch('3tier-web');
      recordTemplateMatch('simple-waf');
      const stats = getParserStats();
      const entries = Object.entries(stats.topTemplates);
      expect(entries[0]).toEqual(['3tier-web', 3]);
      expect(entries[1]).toEqual(['simple-waf', 2]);
    });

    it('should be empty when no template matches', () => {
      recordComponentMatch();
      recordFallback();
      const stats = getParserStats();
      expect(stats.topTemplates).toEqual({});
    });
  });

  describe('resetParserStats', () => {
    it('should clear all counters', () => {
      recordTemplateMatch('3tier-web');
      recordComponentMatch();
      recordFallback();
      resetParserStats();
      const stats = getParserStats();
      expect(stats.totalParses).toBe(0);
      expect(stats.templateMatches).toBe(0);
      expect(stats.componentOnlyMatches).toBe(0);
      expect(stats.fallbacks).toBe(0);
      expect(stats.fallbackRate).toBe(0);
      expect(stats.topTemplates).toEqual({});
    });

    it('should allow fresh recording after reset', () => {
      recordTemplateMatch('3tier-web');
      recordTemplateMatch('3tier-web');
      resetParserStats();
      recordTemplateMatch('simple-waf');
      const stats = getParserStats();
      expect(stats.totalParses).toBe(1);
      expect(stats.templateMatches).toBe(1);
      expect(stats.topTemplates).toEqual({ 'simple-waf': 1 });
    });
  });

  describe('integration with parsePromptLocal', () => {
    it('should record a template match when template is recognized', () => {
      parsePromptLocal('3티어 웹 아키텍처');
      const stats = getParserStats();
      expect(stats.templateMatches).toBeGreaterThanOrEqual(1);
      expect(stats.totalParses).toBeGreaterThanOrEqual(1);
      expect(stats.fallbacks).toBe(0);
    });

    it('should record a component match when only components detected', () => {
      parsePromptLocal('방화벽이랑 라우터 연결해줘');
      const stats = getParserStats();
      expect(stats.componentOnlyMatches).toBeGreaterThanOrEqual(1);
      expect(stats.totalParses).toBeGreaterThanOrEqual(1);
      expect(stats.fallbacks).toBe(0);
    });

    it('should record a fallback for unrecognized input', () => {
      parsePromptLocal('알 수 없는 장비 구축');
      const stats = getParserStats();
      expect(stats.fallbacks).toBeGreaterThanOrEqual(1);
      expect(stats.totalParses).toBeGreaterThanOrEqual(1);
    });

    it('should accumulate stats across multiple parsePromptLocal calls', () => {
      parsePromptLocal('3티어 웹 아키텍처');
      parsePromptLocal('방화벽이랑 라우터 연결해줘');
      parsePromptLocal('완전히 새로운 개념');
      const stats = getParserStats();
      expect(stats.totalParses).toBe(3);
      expect(stats.templateMatches).toBe(1);
      expect(stats.componentOnlyMatches).toBe(1);
      expect(stats.fallbacks).toBe(1);
      expect(stats.fallbackRate).toBeCloseTo(33.33, 1);
    });
  });
});
