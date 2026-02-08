import { describe, it, expect, beforeEach } from 'vitest';
import {
  detectNodeType,
  detectAllNodeTypes,
  detectCommandType,
  clearPatternCache,
  getPatternCacheStats,
  detectAllNodeTypesOptimized,
} from '@/lib/parser/patterns';

describe('Parser Patterns Performance', () => {
  beforeEach(() => {
    // Clear cache before each test to ensure clean state
    clearPatternCache();
  });

  describe('Caching', () => {
    it('should cache results for identical inputs', () => {
      const input = '방화벽과 로드밸런서를 추가해줘';

      // First call - should compute
      const result1 = detectAllNodeTypesOptimized(input);
      const stats1 = getPatternCacheStats();

      // Second call - should hit cache
      const result2 = detectAllNodeTypesOptimized(input);
      const stats2 = getPatternCacheStats();

      expect(result1).toEqual(result2);
      expect(stats2.hits).toBeGreaterThan(stats1.hits);
    });

    it('should cache with normalized input (case insensitive)', () => {
      const input1 = 'FIREWALL';
      const input2 = 'firewall';

      detectAllNodeTypesOptimized(input1);
      const stats1 = getPatternCacheStats();

      detectAllNodeTypesOptimized(input2);
      const stats2 = getPatternCacheStats();

      // Should hit cache since normalized inputs are the same
      expect(stats2.hits).toBeGreaterThan(stats1.hits);
    });

    it('should limit cache size to prevent memory issues', () => {
      const stats = getPatternCacheStats();
      expect(stats.maxSize).toBeGreaterThan(0);
      expect(stats.size).toBeLessThanOrEqual(stats.maxSize);
    });

    it('should allow cache clearing', () => {
      detectAllNodeTypesOptimized('firewall test');
      const stats1 = getPatternCacheStats();
      expect(stats1.size).toBeGreaterThan(0);

      clearPatternCache();
      const stats2 = getPatternCacheStats();
      expect(stats2.size).toBe(0);
      expect(stats2.hits).toBe(0);
      expect(stats2.misses).toBe(0);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should handle large input efficiently', () => {
      // Generate a large input with many components
      const components = [
        'firewall', '방화벽', 'WAF', '웹서버', 'web server',
        'load balancer', '로드밸런서', 'database', '데이터베이스',
        'router', '라우터', 'switch', 'vpn', 'IDS', 'IPS',
      ];
      const largeInput = Array(100).fill(components).flat().join(' ');

      const start = performance.now();
      const result = detectAllNodeTypesOptimized(largeInput);
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(100); // Should complete within 100ms
      expect(result.length).toBeGreaterThan(0);
    });

    it('should benefit from caching on repeated calls', () => {
      const input = '3티어 아키텍처에 방화벽, WAF, 로드밸런서, 웹서버, 앱서버, DB 구성';

      // Warm up - first call computes
      detectAllNodeTypesOptimized(input);

      // Measure cached call
      const iterations = 1000;
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        detectAllNodeTypesOptimized(input);
      }
      const elapsed = performance.now() - start;

      const avgTime = elapsed / iterations;
      expect(avgTime).toBeLessThan(0.1); // Should average less than 0.1ms per call
    });

    it('should have acceptable cache hit ratio for typical usage', () => {
      const prompts = [
        '방화벽 추가',
        '로드밸런서 설정',
        '방화벽 추가', // duplicate
        'WAF 연동',
        '방화벽 추가', // duplicate
        '웹서버 구성',
        'DB 연결',
        '로드밸런서 설정', // duplicate
      ];

      prompts.forEach(p => detectAllNodeTypesOptimized(p));

      const stats = getPatternCacheStats();
      const hitRatio = stats.hits / (stats.hits + stats.misses);

      // Should have some cache hits for duplicate prompts
      expect(hitRatio).toBeGreaterThan(0.2);
    });
  });

  describe('Keyword Pre-filtering', () => {
    it('should detect common keywords efficiently', () => {
      const input = 'firewall';

      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        detectNodeType(input);
      }
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(50); // 1000 iterations should complete quickly
    });

    it('should return quickly for inputs with no matching keywords', () => {
      const input = 'this is a random text with no infrastructure terms xyzzy';

      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        detectAllNodeTypesOptimized(input);
      }
      const elapsed = performance.now() - start;

      // Should be very fast due to early exit on no keywords
      expect(elapsed).toBeLessThan(50);
    });
  });

  describe('Backward Compatibility', () => {
    it('should produce same results as original detectAllNodeTypes', () => {
      const testCases = [
        '방화벽, 로드밸런서, 웹서버 구성',
        'firewall and WAF setup',
        '3티어 아키텍처',
        'database server with cache',
        'VPN gateway',
        '',
        'random text without components',
      ];

      testCases.forEach(input => {
        const original = detectAllNodeTypes(input);
        const optimized = detectAllNodeTypesOptimized(input);

        // Compare by extracting types since the actual pattern objects might differ in reference
        const originalTypes = original.map(p => p.type).sort();
        const optimizedTypes = optimized.map(p => p.type).sort();

        expect(optimizedTypes).toEqual(originalTypes);
      });
    });
  });
});
