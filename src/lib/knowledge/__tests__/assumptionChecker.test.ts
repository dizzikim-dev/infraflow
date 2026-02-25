// src/lib/knowledge/__tests__/assumptionChecker.test.ts
import { describe, it, expect } from 'vitest';
import { checkAssumptions, REQUIRED_ASSUMPTIONS } from '../assumptionChecker';
import type { ProjectProfile } from '@/types/profile';

const makeProfile = (overrides: Partial<ProjectProfile> = {}): ProjectProfile => ({
  id: 'p1', name: 'Test', createdAt: 0, updatedAt: 0,
  industry: 'finance', companySize: 'enterprise',
  ...overrides,
});

describe('REQUIRED_ASSUMPTIONS', () => {
  it('has assumptions for db-server', () => {
    expect(REQUIRED_ASSUMPTIONS['db-server']).toBeDefined();
    expect(REQUIRED_ASSUMPTIONS['db-server'].length).toBeGreaterThan(0);
  });

  it('has assumptions for waf', () => {
    expect(REQUIRED_ASSUMPTIONS['waf']).toBeDefined();
  });

  it('each assumption has required fields', () => {
    for (const [, defs] of Object.entries(REQUIRED_ASSUMPTIONS)) {
      for (const def of defs) {
        expect(def.key).toBeDefined();
        expect(def.label).toBeDefined();
        expect(def.labelKo).toBeDefined();
        expect(['required', 'optional']).toContain(def.priority);
      }
    }
  });
});

describe('checkAssumptions', () => {
  it('returns missing assumptions for node types', () => {
    const result = checkAssumptions(['db-server', 'waf'], null);
    expect(result.length).toBeGreaterThan(0);
  });

  it('filters out assumptions answered by profile', () => {
    const profile = makeProfile({ slaTarget: '99.99', dataClassification: 'confidential' });
    const allResult = checkAssumptions(['db-server'], null);
    const filteredResult = checkAssumptions(['db-server'], profile);
    expect(filteredResult.length).toBeLessThanOrEqual(allResult.length);
  });

  it('returns required before optional', () => {
    const result = checkAssumptions(['db-server'], null);
    const firstOptionalIdx = result.findIndex(a => a.priority === 'optional');
    const lastRequiredIdx = result.findLastIndex(a => a.priority === 'required');
    if (firstOptionalIdx >= 0 && lastRequiredIdx >= 0) {
      expect(firstOptionalIdx).toBeGreaterThan(lastRequiredIdx);
    }
  });

  it('limits to maxQuestions', () => {
    const result = checkAssumptions(['db-server', 'waf', 'load-balancer'], null, { maxQuestions: 3 });
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('deduplicates assumptions across node types', () => {
    // If two node types share an assumption key (e.g., 'compliance'), it appears once
    const result = checkAssumptions(['waf', 'firewall'], null);
    const keys = result.map(a => a.key);
    const uniqueKeys = [...new Set(keys)];
    expect(keys.length).toBe(uniqueKeys.length);
  });

  it('returns empty for unknown node type', () => {
    const result = checkAssumptions(['unknown-type' as never], null);
    expect(result).toEqual([]);
  });
});
