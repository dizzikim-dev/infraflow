import { describe, it, expect, beforeAll } from 'vitest';
import { wanComponents } from '@/lib/data/components/wan';
import type { InfraComponent } from '@/lib/data/components/types';

const EXPECTED_IDS = [
  'pe-router', 'p-router', 'mpls-network', 'dedicated-line',
  'metro-ethernet', 'corporate-internet', 'vpn-service', 'sd-wan-service',
  'private-5g', 'core-network', 'upf', 'ring-network',
];

describe('WAN Components', () => {
  it('should contain all 12 WAN components', () => {
    expect(Object.keys(wanComponents)).toHaveLength(12);
    for (const id of EXPECTED_IDS) {
      expect(wanComponents[id]).toBeDefined();
    }
  });

  describe.each(EXPECTED_IDS)('Component: %s', (id) => {
    let component: InfraComponent;

    beforeAll(() => {
      component = wanComponents[id];
    });

    it('should have matching id', () => {
      expect(component.id).toBe(id);
    });

    it('should belong to wan category', () => {
      expect(component.category).toBe('wan');
    });

    it('should have English and Korean names', () => {
      expect(component.name).toBeTruthy();
      expect(component.nameKo).toBeTruthy();
    });

    it('should have English and Korean descriptions', () => {
      expect(component.description).toBeTruthy();
      expect(component.descriptionKo).toBeTruthy();
    });

    it('should have at least 3 functions (en/ko)', () => {
      expect(component.functions.length).toBeGreaterThanOrEqual(3);
      expect(component.functionsKo.length).toBeGreaterThanOrEqual(3);
      expect(component.functions.length).toBe(component.functionsKo.length);
    });

    it('should have at least 2 features (en/ko)', () => {
      expect(component.features.length).toBeGreaterThanOrEqual(2);
      expect(component.featuresKo.length).toBeGreaterThanOrEqual(2);
      expect(component.features.length).toBe(component.featuresKo.length);
    });

    it('should have at least 2 recommended policies', () => {
      expect(component.recommendedPolicies.length).toBeGreaterThanOrEqual(2);
      for (const policy of component.recommendedPolicies) {
        expect(policy.name).toBeTruthy();
        expect(policy.nameKo).toBeTruthy();
        expect(policy.description).toBeTruthy();
        expect(['critical', 'high', 'medium', 'low']).toContain(policy.priority);
        expect(['access', 'security', 'monitoring', 'compliance', 'performance']).toContain(policy.category);
      }
    });

    it('should have a valid tier', () => {
      expect(['external', 'dmz', 'internal', 'data']).toContain(component.tier);
    });

    it('should use kebab-case id', () => {
      expect(component.id).toMatch(/^[a-z][a-z0-9-]*$/);
    });
  });

  it('should assign correct tiers per WAN component', () => {
    expect(wanComponents['pe-router'].tier).toBe('dmz');
    expect(wanComponents['p-router'].tier).toBe('internal');
    expect(wanComponents['mpls-network'].tier).toBe('internal');
    expect(wanComponents['dedicated-line'].tier).toBe('dmz');
    expect(wanComponents['metro-ethernet'].tier).toBe('dmz');
    expect(wanComponents['corporate-internet'].tier).toBe('dmz');
    expect(wanComponents['vpn-service'].tier).toBe('internal');
    expect(wanComponents['sd-wan-service'].tier).toBe('dmz');
    expect(wanComponents['private-5g'].tier).toBe('internal');
    expect(wanComponents['core-network'].tier).toBe('internal');
    expect(wanComponents['upf'].tier).toBe('internal');
    expect(wanComponents['ring-network'].tier).toBe('dmz');
  });

  it('should be included in allComponents', async () => {
    const { allComponents } = await import('@/lib/data/components');
    for (const id of EXPECTED_IDS) {
      expect(allComponents[id]).toBeDefined();
      expect(allComponents[id].category).toBe('wan');
    }
  });
});

describe('WAN Parser Patterns', () => {
  it('should detect WAN component types from Korean text', async () => {
    const { detectAllNodeTypes } = await import('@/lib/parser/patterns');

    const testCases = [
      { text: '전용회선', expected: 'dedicated-line' },
      { text: 'PE 라우터', expected: 'pe-router' },
      { text: 'MPLS 망', expected: 'mpls-network' },
      { text: '기업인터넷', expected: 'corporate-internet' },
      { text: '5G 특화망', expected: 'private-5g' },
      { text: '코어망', expected: 'core-network' },
      { text: 'UPF', expected: 'upf' },
      { text: '링 네트워크', expected: 'ring-network' },
    ];

    for (const { text, expected } of testCases) {
      const results = detectAllNodeTypes(text);
      const types = results.map(r => r.type);
      expect(types).toContain(expected);
    }
  });

  it('should detect telecom component types from Korean text', async () => {
    const { detectAllNodeTypes } = await import('@/lib/parser/patterns');

    const testCases = [
      { text: '국사', expected: 'central-office' },
      { text: '기지국', expected: 'base-station' },
      { text: '고객 구내', expected: 'customer-premise' },
      { text: 'IDC', expected: 'idc' },
      { text: 'OLT', expected: 'olt' },
    ];

    for (const { text, expected } of testCases) {
      const results = detectAllNodeTypes(text);
      const types = results.map(r => r.type);
      expect(types).toContain(expected);
    }
  });

  it('should detect telecom/WAN from English text', async () => {
    const { detectAllNodeTypes } = await import('@/lib/parser/patterns');

    const testCases = [
      { text: 'central office', expected: 'central-office' },
      { text: 'base station', expected: 'base-station' },
      { text: 'dedicated line', expected: 'dedicated-line' },
      { text: 'metro ethernet', expected: 'metro-ethernet' },
      { text: 'PE router', expected: 'pe-router' },
      { text: 'provider edge', expected: 'pe-router' },
      { text: 'private 5g', expected: 'private-5g' },
      { text: 'core network', expected: 'core-network' },
    ];

    for (const { text, expected } of testCases) {
      const results = detectAllNodeTypes(text);
      const types = results.map(r => r.type);
      expect(types).toContain(expected);
    }
  });
});

describe('Telecom/WAN SSoT Integration', () => {
  it('should return correct categories from getCategoryForType', async () => {
    const { getCategoryForType } = await import('@/lib/data');

    expect(getCategoryForType('central-office')).toBe('telecom');
    expect(getCategoryForType('base-station')).toBe('telecom');
    expect(getCategoryForType('pe-router')).toBe('wan');
    expect(getCategoryForType('dedicated-line')).toBe('wan');
    expect(getCategoryForType('mpls-network')).toBe('wan');
  });

  it('should return correct tiers from getTierForType', async () => {
    const { getTierForType } = await import('@/lib/data');

    expect(getTierForType('central-office')).toBe('dmz');
    expect(getTierForType('base-station')).toBe('external');
    expect(getTierForType('idc')).toBe('internal');
    expect(getTierForType('pe-router')).toBe('dmz');
    expect(getTierForType('p-router')).toBe('internal');
  });

  it('should return display labels from getLabelForType', async () => {
    const { getLabelForType } = await import('@/lib/data');

    expect(getLabelForType('central-office')).toBe('Central Office');
    expect(getLabelForType('pe-router')).toBe('PE Router');
    expect(getLabelForType('dedicated-line')).toBe('Dedicated Line');
  });
});
