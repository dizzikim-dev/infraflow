/**
 * Companion Resolver Tests
 *
 * Verifies that generic relationship fallback + product-level overrides
 * correctly merge and deduplicate companion requirements.
 */

import { describe, it, expect } from 'vitest';
import { resolveCompanions, findMissingCompanions } from '../companionResolver';
import type { RequiredCompanion, RecommendedCompanion } from '../types';
import type { InfraNodeType } from '@/types/infra';

// ---------------------------------------------------------------------------
// resolveCompanions
// ---------------------------------------------------------------------------

describe('resolveCompanions', () => {
  it('should derive companions from generic relationships for db-server', () => {
    const result = resolveCompanions('db-server');

    // db-server requires firewall (REL-SEC-001)
    const requiresFirewall = result.required.find(
      (c) => c.componentType === 'firewall',
    );
    expect(requiresFirewall).toBeDefined();
    expect(requiresFirewall!.severity).toBe('critical');
  });

  it('should derive recommendations from generic relationships for web-server', () => {
    const result = resolveCompanions('web-server');

    // web-server recommends waf, load-balancer, cdn, dns (from strongRecommendations)
    const compTypes = result.recommended.map((c) => c.componentType);
    expect(compTypes).toContain('waf');
    expect(compTypes).toContain('load-balancer');
  });

  it('should return empty arrays for unknown component type', () => {
    const result = resolveCompanions('unknown-type' as InfraNodeType);
    expect(result.required).toHaveLength(0);
    expect(result.recommended).toHaveLength(0);
    expect(result.conflicts).toHaveLength(0);
  });

  it('should apply product-level overrides with priority', () => {
    const override: RequiredCompanion = {
      componentType: 'siem',
      reason: 'SIEM required for compliance',
      reasonKo: '컴플라이언스를 위한 SIEM 필수',
      severity: 'critical',
    };

    const result = resolveCompanions('db-server', {
      required: [override],
    });

    // Override appears first
    expect(result.required[0].componentType).toBe('siem');
    // Graph-derived still present
    const hasFirewall = result.required.some((c) => c.componentType === 'firewall');
    expect(hasFirewall).toBe(true);
  });

  it('should deduplicate companions by componentType (override wins)', () => {
    const override: RequiredCompanion = {
      componentType: 'firewall',
      reason: 'Custom firewall reason',
      reasonKo: '맞춤 방화벽 이유',
      severity: 'high', // Different severity from graph-derived
    };

    const result = resolveCompanions('db-server', {
      required: [override],
    });

    // Only one firewall entry
    const firewalls = result.required.filter(
      (c) => c.componentType === 'firewall',
    );
    expect(firewalls).toHaveLength(1);
    // Override's value wins
    expect(firewalls[0].severity).toBe('high');
    expect(firewalls[0].reason).toBe('Custom firewall reason');
  });

  it('should handle recommended overrides correctly', () => {
    const override: RecommendedCompanion = {
      componentType: 'cache',
      reason: 'Cache strongly recommended',
      reasonKo: '캐시 강력 추천',
      severity: 'high',
    };

    const result = resolveCompanions('web-server', {
      recommended: [override],
    });

    // Cache override present
    const cacheItem = result.recommended.find(
      (c) => c.componentType === 'cache',
    );
    expect(cacheItem).toBeDefined();
    expect(cacheItem!.reason).toBe('Cache strongly recommended');
  });
});

// ---------------------------------------------------------------------------
// findMissingCompanions
// ---------------------------------------------------------------------------

describe('findMissingCompanions', () => {
  it('should find missing required companions', () => {
    // db-server requires firewall — if firewall is absent, it should be flagged
    const presentTypes = new Set<InfraNodeType>(['db-server', 'switch-l3']);
    const result = findMissingCompanions('db-server', presentTypes);

    const missingFirewall = result.missingRequired.find(
      (c) => c.componentType === 'firewall',
    );
    expect(missingFirewall).toBeDefined();
  });

  it('should not flag companions that are already present', () => {
    const presentTypes = new Set<InfraNodeType>([
      'db-server',
      'firewall',
      'switch-l3',
    ]);
    const result = findMissingCompanions('db-server', presentTypes);

    const missingFirewall = result.missingRequired.find(
      (c) => c.componentType === 'firewall',
    );
    expect(missingFirewall).toBeUndefined();
  });

  it('should find missing recommended companions', () => {
    const presentTypes = new Set<InfraNodeType>(['web-server', 'firewall']);
    const result = findMissingCompanions('web-server', presentTypes);

    // web-server recommends waf, load-balancer — should be missing
    const missingTypes = result.missingRecommended.map((c) => c.componentType);
    expect(missingTypes).toContain('waf');
    expect(missingTypes).toContain('load-balancer');
  });

  it('should use product overrides when provided', () => {
    const override: RequiredCompanion = {
      componentType: 'siem',
      reason: 'SIEM required',
      reasonKo: 'SIEM 필수',
      severity: 'critical',
    };

    const presentTypes = new Set<InfraNodeType>(['db-server', 'firewall']);
    const result = findMissingCompanions('db-server', presentTypes, {
      required: [override],
    });

    // monitoring is missing
    const missingMonitoring = result.missingRequired.find(
      (c) => c.componentType === 'siem',
    );
    expect(missingMonitoring).toBeDefined();
  });

  it('should return empty when all companions are present', () => {
    // Create a set with all possible companion types for web-server
    const result = resolveCompanions('web-server');
    const allTypes = new Set<InfraNodeType>([
      'web-server',
      ...result.required.map((c) => c.componentType),
      ...result.recommended.map((c) => c.componentType),
    ]);

    const missing = findMissingCompanions('web-server', allTypes);
    expect(missing.missingRequired).toHaveLength(0);
    expect(missing.missingRecommended).toHaveLength(0);
  });
});
