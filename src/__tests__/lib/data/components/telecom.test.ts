import { describe, it, expect, beforeAll } from 'vitest';
import { telecomComponents } from '@/lib/data/components/telecom';
import type { InfraComponent } from '@/lib/data/components/types';

const EXPECTED_IDS = ['central-office', 'base-station', 'olt', 'customer-premise', 'idc'];

describe('Telecom Components', () => {
  it('should contain all 5 telecom components', () => {
    expect(Object.keys(telecomComponents)).toHaveLength(5);
    for (const id of EXPECTED_IDS) {
      expect(telecomComponents[id]).toBeDefined();
    }
  });

  describe.each(EXPECTED_IDS)('Component: %s', (id) => {
    let component: InfraComponent;

    beforeAll(() => {
      component = telecomComponents[id];
    });

    it('should have matching id', () => {
      expect(component.id).toBe(id);
    });

    it('should belong to telecom category', () => {
      expect(component.category).toBe('telecom');
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

  it('should assign correct tiers per telecom component', () => {
    expect(telecomComponents['central-office'].tier).toBe('dmz');
    expect(telecomComponents['base-station'].tier).toBe('external');
    expect(telecomComponents['olt'].tier).toBe('dmz');
    expect(telecomComponents['customer-premise'].tier).toBe('external');
    expect(telecomComponents['idc'].tier).toBe('internal');
  });
});
