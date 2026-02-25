// src/lib/consulting/__tests__/costSensitivity.test.ts
import { describe, it, expect } from 'vitest';
import { analyzeSensitivity, type CostSensitivityResult } from '../costSensitivity';
import type { InfraSpec } from '@/types';

const testSpec: InfraSpec = {
  nodes: [
    { id: 'n1', type: 'load-balancer', label: 'ALB' },
    { id: 'n2', type: 'web-server', label: 'Web' },
    { id: 'n3', type: 'db-server', label: 'DB' },
    { id: 'n4', type: 'cache', label: 'Redis' },
  ],
  connections: [],
};

describe('analyzeSensitivity', () => {
  it('returns 3 scenarios (upper/baseline/lower)', () => {
    const result = analyzeSensitivity(testSpec);
    expect(result.upperBound).toBeDefined();
    expect(result.baseline).toBeDefined();
    expect(result.lowerBound).toBeDefined();
  });

  it('upper >= baseline >= lower', () => {
    const result = analyzeSensitivity(testSpec);
    expect(result.upperBound.totalMonthly).toBeGreaterThanOrEqual(result.baseline.totalMonthly);
    expect(result.baseline.totalMonthly).toBeGreaterThanOrEqual(result.lowerBound.totalMonthly);
  });

  it('identifies sensitive variables', () => {
    const result = analyzeSensitivity(testSpec);
    expect(result.sensitiveVariables.length).toBeGreaterThan(0);
    expect(result.sensitiveVariables[0].variable).toBeDefined();
    expect(result.sensitiveVariables[0].variableKo).toBeDefined();
    expect(result.sensitiveVariables[0].impactPercent).toBeGreaterThan(0);
  });

  it('handles empty spec', () => {
    const result = analyzeSensitivity({ nodes: [], connections: [] });
    expect(result.baseline.totalMonthly).toBe(0);
  });

  it('sorts sensitive variables by impact (highest first)', () => {
    const result = analyzeSensitivity(testSpec);
    for (let i = 1; i < result.sensitiveVariables.length; i++) {
      expect(result.sensitiveVariables[i - 1].impactPercent)
        .toBeGreaterThanOrEqual(result.sensitiveVariables[i].impactPercent);
    }
  });
});
