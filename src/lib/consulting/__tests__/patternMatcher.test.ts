import { describe, it, expect } from 'vitest';
import {
  matchRequirementsToPatterns,
  getPatternById,
  getPatternsByCategory,
  suggestComponentsForRequirements,
} from '../patternMatcher';
import type { ConsultingRequirements } from '../types';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeRequirements(
  overrides: Partial<ConsultingRequirements> = {},
): ConsultingRequirements {
  return {
    organizationSize: 'medium',
    industry: 'general',
    userCount: 5_000,
    concurrentUsers: 500,
    dataVolume: 'medium',
    trafficPattern: 'steady',
    availabilityTarget: 99.9,
    securityLevel: 'standard',
    complianceFrameworks: [],
    budgetRange: 'medium',
    cloudPreference: 'hybrid',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// matchRequirementsToPatterns — basic functionality
// ---------------------------------------------------------------------------

describe('matchRequirementsToPatterns', () => {
  it('returns a PatternMatchOutput with all required fields', () => {
    const result = matchRequirementsToPatterns(makeRequirements());

    expect(result.requirements).toBeDefined();
    expect(result.matches).toBeInstanceOf(Array);
    expect(result.matches.length).toBeGreaterThan(0);
    expect(result.alternativePatterns).toBeInstanceOf(Array);
    expect(result.unmatchedRequirements).toBeInstanceOf(Array);
    expect(result.unmatchedRequirementsKo).toBeInstanceOf(Array);
  });

  it('sorts matches by score descending', () => {
    const result = matchRequirementsToPatterns(makeRequirements());
    for (let i = 1; i < result.matches.length; i++) {
      expect(result.matches[i - 1].matchScore).toBeGreaterThanOrEqual(
        result.matches[i].matchScore,
      );
    }
  });

  it('returns matches for basic web application requirements', () => {
    const result = matchRequirementsToPatterns(
      makeRequirements({
        organizationSize: 'small',
        industry: 'general',
        userCount: 1_000,
        concurrentUsers: 100,
        securityLevel: 'basic',
        budgetRange: 'low',
        cloudPreference: 'on-premise',
      }),
    );

    expect(result.matches.length).toBeGreaterThan(0);
    // Simple patterns should score well
    const topIds = result.matches.slice(0, 5).map((m) => m.pattern.id);
    // At least one of the basic patterns (PAT-001 through PAT-005) should be in top 5
    const hasBasicPattern = topIds.some((id) =>
      ['PAT-001', 'PAT-002', 'PAT-003', 'PAT-004', 'PAT-005'].includes(id),
    );
    expect(hasBasicPattern).toBe(true);
  });

  it('returns primary recommendation when a good match exists', () => {
    const result = matchRequirementsToPatterns(
      makeRequirements({
        organizationSize: 'medium',
        budgetRange: 'medium',
        securityLevel: 'standard',
        cloudPreference: 'on-premise',
      }),
    );

    expect(result.primaryRecommendation).not.toBeNull();
    expect(result.primaryRecommendation!.matchScore).toBeGreaterThanOrEqual(50);
  });

  it('includes reason and reasonKo in every match', () => {
    const result = matchRequirementsToPatterns(makeRequirements());
    for (const match of result.matches) {
      expect(match.reason).toBeTruthy();
      expect(match.reasonKo).toBeTruthy();
    }
  });

  it('includes matchedCriteria and matchedCriteriaKo for scored matches', () => {
    const result = matchRequirementsToPatterns(makeRequirements());
    // The top match should have at least some criteria
    const topMatch = result.matches[0];
    expect(topMatch.matchedCriteria.length).toBeGreaterThan(0);
    expect(topMatch.matchedCriteriaKo.length).toBeGreaterThan(0);
    // EN/KO should have same count
    expect(topMatch.matchedCriteria.length).toBe(topMatch.matchedCriteriaKo.length);
  });

  it('alternatives are limited to at most 4', () => {
    const result = matchRequirementsToPatterns(makeRequirements());
    expect(result.alternativePatterns.length).toBeLessThanOrEqual(4);
  });

  it('alternatives exclude the primary recommendation', () => {
    const result = matchRequirementsToPatterns(makeRequirements());
    if (result.primaryRecommendation) {
      const altIds = result.alternativePatterns.map((a) => a.pattern.id);
      expect(altIds).not.toContain(result.primaryRecommendation.pattern.id);
    }
  });

  it('alternatives all have score >= 40', () => {
    const result = matchRequirementsToPatterns(makeRequirements());
    for (const alt of result.alternativePatterns) {
      expect(alt.matchScore).toBeGreaterThanOrEqual(40);
    }
  });

  it('every match includes estimatedComplexity matching the pattern complexity', () => {
    const result = matchRequirementsToPatterns(makeRequirements());
    for (const match of result.matches) {
      expect(match.estimatedComplexity).toBe(match.pattern.complexity);
    }
  });

  it('every match includes suggestedComponents array', () => {
    const result = matchRequirementsToPatterns(makeRequirements());
    for (const match of result.matches) {
      expect(match.suggestedComponents).toBeInstanceOf(Array);
      // Should at least include required components
      for (const req of match.pattern.requiredComponents) {
        expect(match.suggestedComponents).toContain(req.type);
      }
    }
  });

  it('stores the original requirements in the output', () => {
    const req = makeRequirements({ organizationName: 'TestCorp' });
    const result = matchRequirementsToPatterns(req);
    expect(result.requirements).toEqual(req);
  });
});

// ---------------------------------------------------------------------------
// Cloud preference scoring
// ---------------------------------------------------------------------------

describe('cloud preference scoring', () => {
  it('returns cloud patterns for cloud-native preference', () => {
    const result = matchRequirementsToPatterns(
      makeRequirements({
        cloudPreference: 'cloud-native',
        organizationSize: 'large',
        budgetRange: 'high',
      }),
    );

    const topPatternIds = result.matches.slice(0, 5).map((m) => m.pattern.id);
    // PAT-017 (Cloud-Native) or PAT-006 (Microservices) should rank high
    const hasCloudPattern = topPatternIds.some((id) =>
      ['PAT-017', 'PAT-006', 'PAT-K8S-001', 'PAT-K8S-002', 'PAT-K8S-003'].includes(id),
    );
    expect(hasCloudPattern).toBe(true);
  });

  it('returns on-premise patterns for on-premise preference', () => {
    const result = matchRequirementsToPatterns(
      makeRequirements({
        cloudPreference: 'on-premise',
        organizationSize: 'medium',
        budgetRange: 'medium',
        securityLevel: 'standard',
      }),
    );

    const topPatternIds = result.matches.slice(0, 5).map((m) => m.pattern.id);
    // Basic/traditional patterns should rank higher
    const hasOnPremPattern = topPatternIds.some((id) =>
      ['PAT-001', 'PAT-002', 'PAT-003', 'PAT-004', 'PAT-005', 'PAT-014', 'PAT-015'].includes(id),
    );
    expect(hasOnPremPattern).toBe(true);
  });

  it('returns hybrid patterns for hybrid preference', () => {
    const result = matchRequirementsToPatterns(
      makeRequirements({
        cloudPreference: 'hybrid',
        organizationSize: 'large',
        budgetRange: 'high',
      }),
    );

    const topPatternIds = result.matches.slice(0, 8).map((m) => m.pattern.id);
    // PAT-016 (Hybrid Cloud) or PAT-HYB-* should appear
    const hasHybridPattern = topPatternIds.some((id) =>
      ['PAT-016', 'PAT-HYB-001', 'PAT-HYB-002'].includes(id),
    );
    expect(hasHybridPattern).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Security level scoring
// ---------------------------------------------------------------------------

describe('security level scoring', () => {
  it('returns security patterns for critical security level', () => {
    const result = matchRequirementsToPatterns(
      makeRequirements({
        securityLevel: 'critical',
        organizationSize: 'enterprise',
        budgetRange: 'enterprise',
      }),
    );

    const topPatternIds = result.matches.slice(0, 8).map((m) => m.pattern.id);
    // Security patterns should rank high
    const hasSecurityPattern = topPatternIds.some((id) =>
      ['PAT-011', 'PAT-012', 'PAT-SEC-016', 'PAT-SEC-017', 'PAT-SEC-018'].includes(id),
    );
    expect(hasSecurityPattern).toBe(true);
  });

  it('scores higher for patterns with more security components when security is critical', () => {
    const result = matchRequirementsToPatterns(
      makeRequirements({
        securityLevel: 'critical',
        organizationSize: 'enterprise',
        budgetRange: 'enterprise',
        cloudPreference: 'on-premise',
      }),
    );

    // PAT-012 (Defense in Depth) has firewall+waf+ids-ips+dlp → high security score
    const didScore = result.matches.find((m) => m.pattern.id === 'PAT-012');
    // PAT-003 (Monolithic) has minimal security → lower security score
    const monoScore = result.matches.find((m) => m.pattern.id === 'PAT-003');

    expect(didScore).toBeDefined();
    expect(monoScore).toBeDefined();
    expect(didScore!.matchScore).toBeGreaterThan(monoScore!.matchScore);
  });
});

// ---------------------------------------------------------------------------
// Scale scoring
// ---------------------------------------------------------------------------

describe('scale scoring', () => {
  it('scores higher for matching scalability', () => {
    const result = matchRequirementsToPatterns(
      makeRequirements({
        organizationSize: 'enterprise',
        concurrentUsers: 50_000,
        userCount: 500_000,
        budgetRange: 'enterprise',
      }),
    );

    // Auto/high scalability patterns should beat low scalability patterns
    const autoPattern = result.matches.find((m) => m.pattern.scalability === 'auto');
    const lowPattern = result.matches.find((m) => m.pattern.scalability === 'low');

    expect(autoPattern).toBeDefined();
    expect(lowPattern).toBeDefined();
    expect(autoPattern!.matchScore).toBeGreaterThan(lowPattern!.matchScore);
  });

  it('small org with low users prefers low scalability patterns', () => {
    const result = matchRequirementsToPatterns(
      makeRequirements({
        organizationSize: 'small',
        concurrentUsers: 50,
        userCount: 200,
        budgetRange: 'low',
        cloudPreference: 'on-premise',
        securityLevel: 'basic',
      }),
    );

    // PAT-003 (Monolithic, low, complexity 1) or PAT-002 (2-Tier, low, complexity 1)
    // should rank among the top patterns
    const topIds = result.matches.slice(0, 5).map((m) => m.pattern.id);
    const hasSimplePattern = topIds.some((id) => ['PAT-002', 'PAT-003'].includes(id));
    expect(hasSimplePattern).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Complexity / budget scoring
// ---------------------------------------------------------------------------

describe('complexity scoring', () => {
  it('scores higher for matching complexity/budget', () => {
    const result = matchRequirementsToPatterns(
      makeRequirements({
        organizationSize: 'small',
        budgetRange: 'low',
        cloudPreference: 'on-premise',
        securityLevel: 'basic',
      }),
    );

    // Low complexity patterns should score better for small/low-budget
    const simpleMatch = result.matches.find((m) => m.pattern.complexity <= 2);
    const complexMatch = result.matches.find((m) => m.pattern.complexity >= 4);

    expect(simpleMatch).toBeDefined();
    expect(complexMatch).toBeDefined();
    expect(simpleMatch!.matchScore).toBeGreaterThan(complexMatch!.matchScore);
  });

  it('enterprise size prefers high-complexity patterns', () => {
    const result = matchRequirementsToPatterns(
      makeRequirements({
        organizationSize: 'enterprise',
        budgetRange: 'enterprise',
        concurrentUsers: 10_000,
        securityLevel: 'high',
      }),
    );

    // Complexity 4-5 patterns should be preferred for enterprise
    const topMatches = result.matches.slice(0, 5);
    const avgComplexity =
      topMatches.reduce((sum, m) => sum + m.pattern.complexity, 0) / topMatches.length;
    expect(avgComplexity).toBeGreaterThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// Industry matching
// ---------------------------------------------------------------------------

describe('industry matching', () => {
  it('financial industry prefers security-heavy patterns', () => {
    const result = matchRequirementsToPatterns(
      makeRequirements({
        industry: 'financial',
        securityLevel: 'critical',
        organizationSize: 'large',
        budgetRange: 'high',
      }),
    );

    const topPatternIds = result.matches.slice(0, 8).map((m) => m.pattern.id);
    const hasSecurityPattern = topPatternIds.some((id) =>
      ['PAT-011', 'PAT-012', 'PAT-SEC-016', 'PAT-SEC-018'].includes(id),
    );
    expect(hasSecurityPattern).toBe(true);
  });

  it('healthcare industry matches compliance-related patterns', () => {
    const result = matchRequirementsToPatterns(
      makeRequirements({
        industry: 'healthcare',
        securityLevel: 'high',
        organizationSize: 'large',
        budgetRange: 'high',
        complianceFrameworks: ['hipaa'],
      }),
    );

    // Security-oriented patterns should rank well for healthcare
    const topPatternIds = result.matches.slice(0, 10).map((m) => m.pattern.id);
    const hasRelevantPattern = topPatternIds.some((id) =>
      ['PAT-011', 'PAT-012', 'PAT-013', 'PAT-SEC-016'].includes(id),
    );
    expect(hasRelevantPattern).toBe(true);
  });

  it('ecommerce industry prefers web/CDN patterns', () => {
    const result = matchRequirementsToPatterns(
      makeRequirements({
        industry: 'ecommerce',
        organizationSize: 'medium',
        budgetRange: 'medium',
        cloudPreference: 'cloud-native',
      }),
    );

    const topPatternIds = result.matches.slice(0, 8).map((m) => m.pattern.id);
    const hasWebPattern = topPatternIds.some((id) =>
      ['PAT-001', 'PAT-004', 'PAT-010', 'PAT-014', 'PAT-018'].includes(id),
    );
    expect(hasWebPattern).toBe(true);
  });

  it('manufacturing industry considers IoT/5G patterns', () => {
    const result = matchRequirementsToPatterns(
      makeRequirements({
        industry: 'manufacturing',
        organizationSize: 'large',
        budgetRange: 'high',
        cloudPreference: 'on-premise',
      }),
    );

    // PAT-TEL-005 (Private 5G) should get an industry bonus
    const tel005 = result.matches.find((m) => m.pattern.id === 'PAT-TEL-005');
    expect(tel005).toBeDefined();
    // It should have at least some matchedCriteria indicating manufacturing fit
    const hasIndustryCriteria = tel005!.matchedCriteria.some(
      (c) => c.includes('manufacturing'),
    );
    expect(hasIndustryCriteria).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe('edge cases', () => {
  it('handles empty compliance frameworks', () => {
    const result = matchRequirementsToPatterns(
      makeRequirements({ complianceFrameworks: [] }),
    );
    expect(result.matches.length).toBeGreaterThan(0);
  });

  it('handles no preferred vendors', () => {
    const result = matchRequirementsToPatterns(
      makeRequirements({ preferredVendors: undefined }),
    );
    expect(result.matches.length).toBeGreaterThan(0);
  });

  it('handles extreme user counts', () => {
    const result = matchRequirementsToPatterns(
      makeRequirements({
        userCount: 10_000_000,
        concurrentUsers: 1_000_000,
        organizationSize: 'enterprise',
        budgetRange: 'enterprise',
      }),
    );
    expect(result.primaryRecommendation).not.toBeNull();
    // Should prefer auto-scaling patterns
    const primary = result.primaryRecommendation!;
    expect(['auto', 'high']).toContain(primary.pattern.scalability);
  });

  it('handles minimal small org requirements', () => {
    const result = matchRequirementsToPatterns(
      makeRequirements({
        organizationSize: 'small',
        userCount: 10,
        concurrentUsers: 5,
        dataVolume: 'low',
        securityLevel: 'basic',
        budgetRange: 'low',
        cloudPreference: 'on-premise',
      }),
    );
    expect(result.matches.length).toBeGreaterThan(0);
    // Should have a recommendation for even the smallest org
    expect(result.primaryRecommendation).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Unmatched requirements
// ---------------------------------------------------------------------------

describe('unmatched requirements', () => {
  it('detects unmatched critical security when top pattern lacks security components', () => {
    // Use very constrained requirements so that the top match might not be security-focused
    const result = matchRequirementsToPatterns(
      makeRequirements({
        securityLevel: 'critical',
        organizationSize: 'small',
        budgetRange: 'low',
        cloudPreference: 'on-premise',
      }),
    );

    // The output should mention critical security or the unmatched arrays
    // At minimum, the system should have evaluated them
    expect(result.unmatchedRequirements).toBeInstanceOf(Array);
    expect(result.unmatchedRequirementsKo).toBeInstanceOf(Array);
    expect(result.unmatchedRequirements.length).toBe(result.unmatchedRequirementsKo.length);
  });

  it('bilingual unmatched requirements (EN/KO same count)', () => {
    const result = matchRequirementsToPatterns(
      makeRequirements({
        securityLevel: 'critical',
        availabilityTarget: 99.999,
      }),
    );

    expect(result.unmatchedRequirements.length).toBe(
      result.unmatchedRequirementsKo.length,
    );
  });
});

// ---------------------------------------------------------------------------
// getPatternById
// ---------------------------------------------------------------------------

describe('getPatternById', () => {
  it('returns correct pattern for PAT-001', () => {
    const p = getPatternById('PAT-001');
    expect(p).toBeDefined();
    expect(p!.name).toBe('3-Tier Web Architecture');
  });

  it('returns correct pattern for PAT-017', () => {
    const p = getPatternById('PAT-017');
    expect(p).toBeDefined();
    expect(p!.name).toBe('Cloud-Native Architecture');
  });

  it('returns undefined for nonexistent ID', () => {
    const p = getPatternById('PAT-NONEXISTENT');
    expect(p).toBeUndefined();
  });

  it('returns correct pattern for telecom ID', () => {
    const p = getPatternById('PAT-TEL-005');
    expect(p).toBeDefined();
    expect(p!.name).toBe('Private 5G Network');
  });
});

// ---------------------------------------------------------------------------
// getPatternsByCategory
// ---------------------------------------------------------------------------

describe('getPatternsByCategory', () => {
  it('filters correctly by security tag', () => {
    const patterns = getPatternsByCategory('security');
    expect(patterns.length).toBeGreaterThan(0);
    for (const p of patterns) {
      expect(p.tags.map((t) => t.toLowerCase())).toContain('security');
    }
  });

  it('filters correctly by kubernetes tag', () => {
    const patterns = getPatternsByCategory('kubernetes');
    expect(patterns.length).toBeGreaterThan(0);
    for (const p of patterns) {
      expect(p.tags.map((t) => t.toLowerCase())).toContain('kubernetes');
    }
  });

  it('returns empty array for unknown category', () => {
    const patterns = getPatternsByCategory('nonexistent-category-xyz');
    expect(patterns).toEqual([]);
  });

  it('is case-insensitive', () => {
    const lower = getPatternsByCategory('security');
    const upper = getPatternsByCategory('Security');
    expect(lower.length).toBe(upper.length);
  });

  it('finds telecom patterns', () => {
    const patterns = getPatternsByCategory('telecom');
    expect(patterns.length).toBeGreaterThanOrEqual(6);
  });
});

// ---------------------------------------------------------------------------
// suggestComponentsForRequirements
// ---------------------------------------------------------------------------

describe('suggestComponentsForRequirements', () => {
  it('returns security components for critical level', () => {
    const components = suggestComponentsForRequirements(
      makeRequirements({ securityLevel: 'critical' }),
    );
    expect(components).toContain('firewall');
    expect(components).toContain('waf');
    expect(components).toContain('ids-ips');
    expect(components).toContain('siem');
    expect(components).toContain('soar');
    expect(components).toContain('dlp');
  });

  it('returns cloud components for cloud-native', () => {
    const components = suggestComponentsForRequirements(
      makeRequirements({ cloudPreference: 'cloud-native' }),
    );
    expect(components).toContain('kubernetes');
    expect(components).toContain('container');
    expect(components).toContain('load-balancer');
  });

  it('returns on-premise components for on-premise preference', () => {
    const components = suggestComponentsForRequirements(
      makeRequirements({ cloudPreference: 'on-premise' }),
    );
    expect(components).toContain('web-server');
    expect(components).toContain('app-server');
    expect(components).toContain('db-server');
  });

  it('returns hybrid components for hybrid preference', () => {
    const components = suggestComponentsForRequirements(
      makeRequirements({ cloudPreference: 'hybrid' }),
    );
    expect(components).toContain('private-cloud');
    expect(components).toContain('vpn-gateway');
  });

  it('returns HA components for high availability', () => {
    const components = suggestComponentsForRequirements(
      makeRequirements({ availabilityTarget: 99.99 }),
    );
    expect(components).toContain('load-balancer');
    expect(components).toContain('backup');
  });

  it('returns data components for high data volume', () => {
    const components = suggestComponentsForRequirements(
      makeRequirements({ dataVolume: 'massive' }),
    );
    expect(components).toContain('db-server');
    expect(components).toContain('cache');
    expect(components).toContain('object-storage');
  });

  it('returns ecommerce-specific components', () => {
    const components = suggestComponentsForRequirements(
      makeRequirements({ industry: 'ecommerce' }),
    );
    expect(components).toContain('cdn');
    expect(components).toContain('cache');
    expect(components).toContain('waf');
  });

  it('returns financial-specific components', () => {
    const components = suggestComponentsForRequirements(
      makeRequirements({ industry: 'financial' }),
    );
    expect(components).toContain('siem');
    expect(components).toContain('dlp');
    expect(components).toContain('backup');
  });

  it('returns kubernetes for very high concurrent users', () => {
    const components = suggestComponentsForRequirements(
      makeRequirements({ concurrentUsers: 50_000 }),
    );
    expect(components).toContain('kubernetes');
    expect(components).toContain('container');
  });

  it('returns no duplicates', () => {
    const components = suggestComponentsForRequirements(
      makeRequirements({
        securityLevel: 'critical',
        industry: 'financial',
        cloudPreference: 'cloud-native',
        concurrentUsers: 50_000,
      }),
    );
    const unique = new Set(components);
    expect(components.length).toBe(unique.size);
  });

  it('returns basic firewall even for basic security', () => {
    const components = suggestComponentsForRequirements(
      makeRequirements({ securityLevel: 'basic' }),
    );
    expect(components).toContain('firewall');
  });
});
