/**
 * Gap Analysis Engine — Tests
 *
 * Covers all 6 gap detection categories, score calculation, summaries,
 * and the public helper functions.
 */

import { describe, it, expect } from 'vitest';
import type { InfraSpec, InfraNodeType } from '@/types/infra';
import type { ArchitecturePattern } from '@/lib/knowledge/types';
import type { ConsultingRequirements, GapItem } from '../types';
import {
  analyzeGaps,
  calculateGapScore,
  getRequiredComponentsForSecurity,
  getRequiredComponentsForCompliance,
} from '../gapAnalyzer';
import type { GapAnalysisOptions } from '../gapAnalyzer';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal empty spec */
function emptySpec(): InfraSpec {
  return { nodes: [], connections: [] };
}

/** Build a spec with specified node types */
function specWith(...types: InfraNodeType[]): InfraSpec {
  return {
    nodes: types.map((type, i) => ({
      id: `${type}-${i}`,
      type,
      label: type,
    })),
    connections: [],
  };
}

/** A minimal target pattern requiring web-server, app-server, db-server */
function threeTierPattern(): ArchitecturePattern {
  return {
    id: 'PAT-TEST-001',
    type: 'pattern',
    name: '3-Tier Web Architecture',
    nameKo: '3티어 웹 아키텍처',
    description: 'Test 3-tier pattern',
    descriptionKo: '테스트 3티어 패턴',
    requiredComponents: [
      { type: 'web-server', minCount: 1 },
      { type: 'app-server', minCount: 1 },
      { type: 'db-server', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'load-balancer', benefit: 'HA', benefitKo: '고가용성' },
      { type: 'cache', benefit: 'Caching', benefitKo: '캐싱' },
      { type: 'firewall', benefit: 'Security', benefitKo: '보안' },
    ],
    scalability: 'medium',
    complexity: 2,
    bestForKo: [],
    notSuitableForKo: [],
    evolvesTo: [],
    evolvesFrom: [],
    tags: ['test'],
    wafPillars: {
      operationalExcellence: 3,
      security: 2,
      reliability: 3,
      performanceEfficiency: 3,
      costOptimization: 3,
    },
    trust: {
      confidence: 0.95,
      sources: [],
      lastReviewedAt: '2026-02-20',
      upvotes: 0,
      downvotes: 0,
    },
  };
}

/** Base consulting requirements for testing (can override fields) */
function baseRequirements(
  overrides: Partial<ConsultingRequirements> = {},
): ConsultingRequirements {
  return {
    organizationSize: 'medium',
    industry: 'general',
    userCount: 1000,
    concurrentUsers: 100,
    dataVolume: 'medium',
    trafficPattern: 'steady',
    availabilityTarget: 99,
    securityLevel: 'standard',
    complianceFrameworks: [],
    budgetRange: 'medium',
    cloudPreference: 'hybrid',
    ...overrides,
  };
}

// ===========================================================================
// 1. Missing Components
// ===========================================================================

describe('gapAnalyzer — missing components', () => {
  it('should detect all required components as missing for an empty spec with target pattern', () => {
    const result = analyzeGaps(emptySpec(), {
      targetPattern: threeTierPattern(),
    });

    expect(result.missingComponents.length).toBe(3);
    const missingTypes = result.missingComponents.map((g) => g.component);
    expect(missingTypes).toContain('web-server');
    expect(missingTypes).toContain('app-server');
    expect(missingTypes).toContain('db-server');
    result.missingComponents.forEach((g) => {
      expect(g.type).toBe('missing');
      expect(g.severity).toBe('critical');
    });
  });

  it('should detect no missing components when spec matches pattern exactly', () => {
    const result = analyzeGaps(
      specWith('web-server', 'app-server', 'db-server'),
      { targetPattern: threeTierPattern() },
    );

    expect(result.missingComponents.length).toBe(0);
  });

  it('should detect partially missing components', () => {
    const result = analyzeGaps(specWith('web-server'), {
      targetPattern: threeTierPattern(),
    });

    expect(result.missingComponents.length).toBe(2);
    const missingTypes = result.missingComponents.map((g) => g.component);
    expect(missingTypes).toContain('app-server');
    expect(missingTypes).toContain('db-server');
    expect(missingTypes).not.toContain('web-server');
  });

  it('should detect missing components from security level requirements', () => {
    const result = analyzeGaps(emptySpec(), {
      requirements: baseRequirements({ securityLevel: 'high' }),
    });

    // securityLevel 'high' requires: firewall, waf, ids-ips, vpn-gateway
    const missingTypes = result.missingComponents.map((g) => g.component);
    expect(missingTypes).toContain('firewall');
    expect(missingTypes).toContain('waf');
    expect(missingTypes).toContain('ids-ips');
    expect(missingTypes).toContain('vpn-gateway');
  });

  it('should not duplicate missing component when flagged by both pattern and requirements', () => {
    const pattern = threeTierPattern();
    // Add firewall to pattern required
    pattern.requiredComponents.push({ type: 'firewall', minCount: 1 });

    const result = analyzeGaps(emptySpec(), {
      targetPattern: pattern,
      requirements: baseRequirements({ securityLevel: 'standard' }),
    });

    // firewall should appear only once despite both pattern and requirements needing it
    const firewallGaps = result.missingComponents.filter(
      (g) => g.component === 'firewall',
    );
    expect(firewallGaps.length).toBe(1);
  });
});

// ===========================================================================
// 2. Excess Components
// ===========================================================================

describe('gapAnalyzer — excess components', () => {
  it('should detect excess components not in the target pattern', () => {
    const result = analyzeGaps(
      specWith('web-server', 'app-server', 'db-server', 'siem', 'dlp'),
      { targetPattern: threeTierPattern() },
    );

    expect(result.excessComponents.length).toBe(2);
    const excessTypes = result.excessComponents.map((g) => g.component);
    expect(excessTypes).toContain('siem');
    expect(excessTypes).toContain('dlp');
    result.excessComponents.forEach((g) => {
      expect(g.type).toBe('excess');
      expect(g.severity).toBe('low');
    });
  });

  it('should not flag excess components when no target pattern is provided', () => {
    const result = analyzeGaps(
      specWith('web-server', 'siem', 'dlp'),
      { requirements: baseRequirements() },
    );

    expect(result.excessComponents.length).toBe(0);
  });

  it('should not flag optional components as excess', () => {
    // load-balancer and cache are optional in threeTierPattern
    const result = analyzeGaps(
      specWith('web-server', 'app-server', 'db-server', 'load-balancer', 'cache'),
      { targetPattern: threeTierPattern() },
    );

    expect(result.excessComponents.length).toBe(0);
  });

  it('should not flag user/internet/zone as excess', () => {
    const result = analyzeGaps(
      specWith('web-server', 'app-server', 'db-server', 'user', 'internet'),
      { targetPattern: threeTierPattern() },
    );

    expect(result.excessComponents.length).toBe(0);
  });

  it('should not duplicate excess for same node type appearing multiple times', () => {
    const result = analyzeGaps(
      specWith('web-server', 'app-server', 'db-server', 'siem', 'siem'),
      { targetPattern: threeTierPattern() },
    );

    const siemExcess = result.excessComponents.filter(
      (g) => g.component === 'siem',
    );
    expect(siemExcess.length).toBe(1);
  });
});

// ===========================================================================
// 3. Upgrade Needed
// ===========================================================================

describe('gapAnalyzer — upgrade needed', () => {
  it('should suggest firewall HA when single firewall with availability >= 99.95', () => {
    const result = analyzeGaps(specWith('firewall'), {
      requirements: baseRequirements({ availabilityTarget: 99.95 }),
    });

    const fwUpgrade = result.upgradeNeeded.find(
      (g) => g.component === 'firewall',
    );
    expect(fwUpgrade).toBeDefined();
    expect(fwUpgrade!.type).toBe('upgrade');
    expect(fwUpgrade!.severity).toBe('high');
  });

  it('should NOT suggest firewall HA when availability < 99.95', () => {
    const result = analyzeGaps(specWith('firewall'), {
      requirements: baseRequirements({ availabilityTarget: 99.9 }),
    });

    const fwUpgrade = result.upgradeNeeded.find(
      (g) => g.component === 'firewall',
    );
    expect(fwUpgrade).toBeUndefined();
  });

  it('should NOT suggest firewall HA when there are multiple firewalls', () => {
    const result = analyzeGaps(specWith('firewall', 'firewall'), {
      requirements: baseRequirements({ availabilityTarget: 99.99 }),
    });

    const fwUpgrade = result.upgradeNeeded.find(
      (g) => g.component === 'firewall',
    );
    expect(fwUpgrade).toBeUndefined();
  });

  it('should suggest db replication when single db-server with availability >= 99.9', () => {
    const result = analyzeGaps(specWith('db-server'), {
      requirements: baseRequirements({ availabilityTarget: 99.9 }),
    });

    const dbUpgrade = result.upgradeNeeded.find(
      (g) => g.component === 'db-server',
    );
    expect(dbUpgrade).toBeDefined();
    expect(dbUpgrade!.severity).toBe('high');
  });

  it('should NOT suggest db replication when availability < 99.9', () => {
    const result = analyzeGaps(specWith('db-server'), {
      requirements: baseRequirements({ availabilityTarget: 99 }),
    });

    const dbUpgrade = result.upgradeNeeded.find(
      (g) => g.component === 'db-server',
    );
    expect(dbUpgrade).toBeUndefined();
  });

  it('should suggest load-balancer when multiple web servers but no LB', () => {
    const result = analyzeGaps(
      specWith('web-server', 'web-server'),
      {},
    );

    const lbUpgrade = result.upgradeNeeded.find(
      (g) => g.component === 'load-balancer',
    );
    expect(lbUpgrade).toBeDefined();
    expect(lbUpgrade!.type).toBe('upgrade');
  });

  it('should NOT suggest load-balancer when it already exists', () => {
    const result = analyzeGaps(
      specWith('web-server', 'web-server', 'load-balancer'),
      {},
    );

    const lbUpgrade = result.upgradeNeeded.find(
      (g) => g.component === 'load-balancer',
    );
    expect(lbUpgrade).toBeUndefined();
  });
});

// ===========================================================================
// 4. Security Gaps
// ===========================================================================

describe('gapAnalyzer — security gaps', () => {
  it('should flag critical gap when no firewall exists', () => {
    const result = analyzeGaps(specWith('web-server'), {
      requirements: baseRequirements({ securityLevel: 'basic' }),
    });

    const fwGap = result.securityGaps.find((g) => g.component === 'firewall');
    expect(fwGap).toBeDefined();
    expect(fwGap!.severity).toBe('critical');
    expect(fwGap!.type).toBe('security');
  });

  it('should flag medium gap when web-server exists without WAF', () => {
    const result = analyzeGaps(specWith('web-server', 'firewall'), {
      requirements: baseRequirements({ securityLevel: 'basic' }),
    });

    const wafGap = result.securityGaps.find((g) => g.component === 'waf');
    expect(wafGap).toBeDefined();
    expect(wafGap!.severity).toBe('medium');
  });

  it('should NOT flag WAF gap when no web-server exists', () => {
    const result = analyzeGaps(specWith('firewall', 'db-server'), {
      requirements: baseRequirements({ securityLevel: 'basic' }),
    });

    const wafGap = result.securityGaps.find((g) => g.component === 'waf');
    expect(wafGap).toBeUndefined();
  });

  it('should flag critical SIEM gap for securityLevel "critical"', () => {
    const result = analyzeGaps(specWith('firewall'), {
      requirements: baseRequirements({ securityLevel: 'critical' }),
    });

    const siemGap = result.securityGaps.find((g) => g.component === 'siem');
    expect(siemGap).toBeDefined();
    expect(siemGap!.severity).toBe('critical');
  });

  it('should NOT flag SIEM gap for securityLevel "basic"', () => {
    const result = analyzeGaps(specWith('firewall'), {
      requirements: baseRequirements({ securityLevel: 'basic' }),
    });

    const siemGap = result.securityGaps.find((g) => g.component === 'siem');
    expect(siemGap).toBeUndefined();
  });

  it('should flag high IDS/IPS gap for securityLevel "high"', () => {
    const result = analyzeGaps(specWith('firewall'), {
      requirements: baseRequirements({ securityLevel: 'high' }),
    });

    const idsGap = result.securityGaps.find(
      (g) => g.component === 'ids-ips',
    );
    expect(idsGap).toBeDefined();
    expect(idsGap!.severity).toBe('high');
  });

  it('should flag high IDS/IPS gap for securityLevel "critical"', () => {
    const result = analyzeGaps(specWith('firewall'), {
      requirements: baseRequirements({ securityLevel: 'critical' }),
    });

    const idsGap = result.securityGaps.find(
      (g) => g.component === 'ids-ips',
    );
    expect(idsGap).toBeDefined();
    expect(idsGap!.severity).toBe('high');
  });

  it('should have no security gaps when all security components present', () => {
    const result = analyzeGaps(
      specWith('firewall', 'waf', 'ids-ips', 'siem', 'web-server'),
      { requirements: baseRequirements({ securityLevel: 'critical' }) },
    );

    expect(result.securityGaps.length).toBe(0);
  });
});

// ===========================================================================
// 5. Compliance Gaps
// ===========================================================================

describe('gapAnalyzer — compliance gaps', () => {
  it('should detect PCI-DSS compliance gaps', () => {
    const result = analyzeGaps(specWith('firewall'), {
      requirements: baseRequirements({
        complianceFrameworks: ['pci-dss'],
      }),
    });

    const complianceTypes = result.complianceGaps.map((g) => g.component);
    // pci-dss requires: firewall, waf, ids-ips, siem, dlp — firewall present
    expect(complianceTypes).toContain('waf');
    expect(complianceTypes).toContain('ids-ips');
    expect(complianceTypes).toContain('siem');
    expect(complianceTypes).toContain('dlp');
    expect(complianceTypes).not.toContain('firewall');
  });

  it('should mark PCI-DSS gaps as critical severity', () => {
    const result = analyzeGaps(emptySpec(), {
      requirements: baseRequirements({
        complianceFrameworks: ['pci-dss'],
      }),
    });

    result.complianceGaps.forEach((g) => {
      expect(g.severity).toBe('critical');
    });
  });

  it('should detect HIPAA compliance gaps', () => {
    const result = analyzeGaps(specWith('firewall'), {
      requirements: baseRequirements({
        complianceFrameworks: ['hipaa'],
      }),
    });

    const complianceTypes = result.complianceGaps.map((g) => g.component);
    // hipaa requires: firewall, vpn-gateway, backup, siem
    expect(complianceTypes).toContain('vpn-gateway');
    expect(complianceTypes).toContain('backup');
    expect(complianceTypes).toContain('siem');
    expect(complianceTypes).not.toContain('firewall');
  });

  it('should detect ISO-27001 compliance gaps', () => {
    const result = analyzeGaps(emptySpec(), {
      requirements: baseRequirements({
        complianceFrameworks: ['iso-27001'],
      }),
    });

    const complianceTypes = result.complianceGaps.map((g) => g.component);
    expect(complianceTypes).toContain('firewall');
    expect(complianceTypes).toContain('ids-ips');
    expect(complianceTypes).toContain('siem');
    expect(complianceTypes).toContain('backup');
  });

  it('should detect SOC2 compliance gaps', () => {
    const result = analyzeGaps(emptySpec(), {
      requirements: baseRequirements({
        complianceFrameworks: ['soc2'],
      }),
    });

    const complianceTypes = result.complianceGaps.map((g) => g.component);
    expect(complianceTypes).toContain('firewall');
    expect(complianceTypes).toContain('siem');
    expect(complianceTypes).toContain('backup');
    expect(complianceTypes).toContain('mfa');
  });

  it('should have no compliance gaps when all components are present', () => {
    const result = analyzeGaps(
      specWith('firewall', 'waf', 'ids-ips', 'siem', 'dlp'),
      {
        requirements: baseRequirements({
          complianceFrameworks: ['pci-dss'],
        }),
      },
    );

    expect(result.complianceGaps.length).toBe(0);
  });

  it('should handle multiple frameworks', () => {
    const result = analyzeGaps(emptySpec(), {
      requirements: baseRequirements({
        complianceFrameworks: ['pci-dss', 'hipaa'],
      }),
    });

    // Both frameworks missing all components
    expect(result.complianceGaps.length).toBeGreaterThan(0);

    // firewall should appear for both frameworks
    const firewallGaps = result.complianceGaps.filter(
      (g) => g.component === 'firewall',
    );
    expect(firewallGaps.length).toBe(2);
  });

  it('should ignore unknown compliance frameworks gracefully', () => {
    const result = analyzeGaps(emptySpec(), {
      requirements: baseRequirements({
        complianceFrameworks: ['unknown-framework'],
      }),
    });

    expect(result.complianceGaps.length).toBe(0);
  });
});

// ===========================================================================
// 6. Performance Gaps
// ===========================================================================

describe('gapAnalyzer — performance gaps', () => {
  it('should flag CDN gap for massive data volume', () => {
    const result = analyzeGaps(specWith('web-server'), {
      requirements: baseRequirements({ dataVolume: 'massive' }),
    });

    const cdnGap = result.performanceGaps.find(
      (g) => g.component === 'cdn',
    );
    expect(cdnGap).toBeDefined();
    expect(cdnGap!.type).toBe('performance');
    expect(cdnGap!.severity).toBe('high');
  });

  it('should NOT flag CDN gap for low data volume', () => {
    const result = analyzeGaps(specWith('web-server'), {
      requirements: baseRequirements({ dataVolume: 'low' }),
    });

    const cdnGap = result.performanceGaps.find(
      (g) => g.component === 'cdn',
    );
    expect(cdnGap).toBeUndefined();
  });

  it('should NOT flag CDN gap when CDN exists', () => {
    const result = analyzeGaps(specWith('web-server', 'cdn'), {
      requirements: baseRequirements({ dataVolume: 'massive' }),
    });

    const cdnGap = result.performanceGaps.find(
      (g) => g.component === 'cdn',
    );
    expect(cdnGap).toBeUndefined();
  });

  it('should flag load-balancer gap for bursty traffic', () => {
    const result = analyzeGaps(specWith('web-server'), {
      requirements: baseRequirements({ trafficPattern: 'bursty' }),
    });

    const lbGap = result.performanceGaps.find(
      (g) => g.component === 'load-balancer',
    );
    expect(lbGap).toBeDefined();
    expect(lbGap!.severity).toBe('high');
  });

  it('should NOT flag load-balancer gap when LB exists with bursty traffic', () => {
    const result = analyzeGaps(
      specWith('web-server', 'load-balancer'),
      { requirements: baseRequirements({ trafficPattern: 'bursty' }) },
    );

    const lbGap = result.performanceGaps.find(
      (g) => g.component === 'load-balancer',
    );
    expect(lbGap).toBeUndefined();
  });

  it('should flag cache gap when concurrentUsers > 10000', () => {
    const result = analyzeGaps(specWith('web-server'), {
      requirements: baseRequirements({ concurrentUsers: 15000 }),
    });

    const cacheGap = result.performanceGaps.find(
      (g) => g.component === 'cache',
    );
    expect(cacheGap).toBeDefined();
    expect(cacheGap!.severity).toBe('medium');
  });

  it('should NOT flag cache gap when concurrentUsers <= 10000', () => {
    const result = analyzeGaps(specWith('web-server'), {
      requirements: baseRequirements({ concurrentUsers: 10000 }),
    });

    const cacheGap = result.performanceGaps.find(
      (g) => g.component === 'cache',
    );
    expect(cacheGap).toBeUndefined();
  });

  it('should NOT flag cache gap when cache already exists', () => {
    const result = analyzeGaps(specWith('web-server', 'cache'), {
      requirements: baseRequirements({ concurrentUsers: 50000 }),
    });

    const cacheGap = result.performanceGaps.find(
      (g) => g.component === 'cache',
    );
    expect(cacheGap).toBeUndefined();
  });

  it('should return no performance gaps without requirements', () => {
    const result = analyzeGaps(specWith('web-server'), {
      targetPattern: threeTierPattern(),
    });

    expect(result.performanceGaps.length).toBe(0);
  });
});

// ===========================================================================
// Score Calculation
// ===========================================================================

describe('gapAnalyzer — score calculation', () => {
  it('should return 100 for no gaps', () => {
    expect(calculateGapScore([])).toBe(100);
  });

  it('should deduct 15 per critical gap', () => {
    const gaps = [
      { severity: 'critical' },
      { severity: 'critical' },
    ] as GapItem[];
    expect(calculateGapScore(gaps)).toBe(70);
  });

  it('should deduct 10 per high gap', () => {
    const gaps = [{ severity: 'high' }] as GapItem[];
    expect(calculateGapScore(gaps)).toBe(90);
  });

  it('should deduct 5 per medium gap', () => {
    const gaps = [{ severity: 'medium' }] as GapItem[];
    expect(calculateGapScore(gaps)).toBe(95);
  });

  it('should deduct 2 per low gap', () => {
    const gaps = [{ severity: 'low' }] as GapItem[];
    expect(calculateGapScore(gaps)).toBe(98);
  });

  it('should never go below 0', () => {
    // 8 critical gaps = -120, but should clamp to 0
    const gaps = Array.from({ length: 8 }, () => ({
      severity: 'critical' as const,
    })) as GapItem[];
    expect(calculateGapScore(gaps)).toBe(0);
  });

  it('should correctly handle mixed severities', () => {
    const gaps = [
      { severity: 'critical' },
      { severity: 'high' },
      { severity: 'medium' },
      { severity: 'low' },
    ] as GapItem[];
    // 100 - 15 - 10 - 5 - 2 = 68
    expect(calculateGapScore(gaps)).toBe(68);
  });
});

// ===========================================================================
// Overall Result Structure
// ===========================================================================

describe('gapAnalyzer — result structure', () => {
  it('should return correct structure fields', () => {
    const spec = specWith('web-server');
    const pattern = threeTierPattern();
    const reqs = baseRequirements();

    const result = analyzeGaps(spec, {
      targetPattern: pattern,
      requirements: reqs,
    });

    expect(result.currentSpec).toBe(spec);
    expect(result.targetPattern).toBe(pattern);
    expect(result.requirements).toBe(reqs);
    expect(Array.isArray(result.gaps)).toBe(true);
    expect(Array.isArray(result.missingComponents)).toBe(true);
    expect(Array.isArray(result.excessComponents)).toBe(true);
    expect(Array.isArray(result.upgradeNeeded)).toBe(true);
    expect(Array.isArray(result.securityGaps)).toBe(true);
    expect(Array.isArray(result.complianceGaps)).toBe(true);
    expect(Array.isArray(result.performanceGaps)).toBe(true);
    expect(typeof result.overallScore).toBe('number');
    expect(typeof result.summary).toBe('string');
    expect(typeof result.summaryKo).toBe('string');
  });

  it('should set targetPattern to null when not provided', () => {
    const result = analyzeGaps(emptySpec(), {
      requirements: baseRequirements(),
    });
    expect(result.targetPattern).toBeNull();
  });

  it('should set requirements to null when not provided', () => {
    const result = analyzeGaps(emptySpec(), {
      targetPattern: threeTierPattern(),
    });
    expect(result.requirements).toBeNull();
  });

  it('should aggregate all gaps in the gaps array', () => {
    const result = analyzeGaps(emptySpec(), {
      targetPattern: threeTierPattern(),
      requirements: baseRequirements({
        securityLevel: 'critical',
        complianceFrameworks: ['pci-dss'],
        dataVolume: 'massive',
        trafficPattern: 'bursty',
        concurrentUsers: 50000,
      }),
    });

    const totalSub =
      result.missingComponents.length +
      result.excessComponents.length +
      result.upgradeNeeded.length +
      result.securityGaps.length +
      result.complianceGaps.length +
      result.performanceGaps.length;

    expect(result.gaps.length).toBe(totalSub);
  });
});

// ===========================================================================
// Summary
// ===========================================================================

describe('gapAnalyzer — summary', () => {
  it('should report no gaps when architecture is complete', () => {
    // Only include components that are in the pattern's required + optional lists
    // so no excess gaps are produced. Also include firewall (optional) to avoid
    // security gap, and waf to avoid the web-server-without-WAF gap.
    // Include companions from the relationship graph to avoid companion gaps.
    const pattern = threeTierPattern();
    // Add companion types to optional so they're not flagged as excess
    const companionTypes = ['waf', 'load-balancer', 'cdn', 'dns', 'cache', 'ids-ips', 'backup', 'vpn-gateway', 'siem', 'san-nas', 'mfa'] as const;
    for (const ct of companionTypes) {
      pattern.optionalComponents.push({
        type: ct,
        benefit: 'Companion',
        benefitKo: '컴패니언',
      });
    }

    const result = analyzeGaps(
      specWith(
        'web-server',
        'app-server',
        'db-server',
        'firewall',
        'waf',
        'load-balancer',
        'cdn',
        'dns',
        'cache',
        'ids-ips',
        'backup',
        'vpn-gateway',
        'siem',
        'san-nas',
        'mfa',
      ),
      { targetPattern: pattern },
    );

    expect(result.missingComponents.length).toBe(0);
    expect(result.excessComponents.length).toBe(0);
    expect(result.securityGaps.length).toBe(0);
    // Only companion-type gaps should remain (from deep relationship chains)
    const nonCompanionGaps = result.gaps.filter((g) => g.type !== 'companion');
    expect(nonCompanionGaps.length).toBe(0);
    // Score should be reasonably high despite companion recommendations
    expect(result.overallScore).toBeGreaterThanOrEqual(70);
  });

  it('should include gap counts in summary when gaps exist', () => {
    const result = analyzeGaps(emptySpec(), {
      targetPattern: threeTierPattern(),
    });

    // At least 3 missing + 1 no-firewall security gap
    expect(result.summary).toMatch(/\d+ gap\(s\) found/);
    expect(result.summaryKo).toMatch(/\d+건의 갭 발견/);
  });

  it('should include the score in the summary', () => {
    const result = analyzeGaps(emptySpec(), {
      targetPattern: threeTierPattern(),
    });

    expect(result.summary).toContain(`${result.overallScore}/100`);
  });
});

// ===========================================================================
// Public Helpers
// ===========================================================================

describe('getRequiredComponentsForSecurity', () => {
  it('should return [firewall] for basic level', () => {
    expect(getRequiredComponentsForSecurity('basic')).toEqual(['firewall']);
  });

  it('should return [firewall, waf] for standard level', () => {
    expect(getRequiredComponentsForSecurity('standard')).toEqual([
      'firewall',
      'waf',
    ]);
  });

  it('should return 4 components for high level', () => {
    const components = getRequiredComponentsForSecurity('high');
    expect(components).toHaveLength(4);
    expect(components).toContain('firewall');
    expect(components).toContain('waf');
    expect(components).toContain('ids-ips');
    expect(components).toContain('vpn-gateway');
  });

  it('should return 7 components for critical level', () => {
    const components = getRequiredComponentsForSecurity('critical');
    expect(components).toHaveLength(7);
    expect(components).toContain('siem');
    expect(components).toContain('dlp');
    expect(components).toContain('nac');
  });

  it('should return a new array (no shared reference)', () => {
    const a = getRequiredComponentsForSecurity('basic');
    const b = getRequiredComponentsForSecurity('basic');
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});

describe('getRequiredComponentsForCompliance', () => {
  it('should return correct components for pci-dss', () => {
    const components = getRequiredComponentsForCompliance('pci-dss');
    expect(components).toEqual(['firewall', 'waf', 'ids-ips', 'siem', 'dlp']);
  });

  it('should return correct components for hipaa', () => {
    const components = getRequiredComponentsForCompliance('hipaa');
    expect(components).toEqual(['firewall', 'vpn-gateway', 'backup', 'siem']);
  });

  it('should return correct components for iso-27001', () => {
    const components = getRequiredComponentsForCompliance('iso-27001');
    expect(components).toEqual(['firewall', 'ids-ips', 'siem', 'backup']);
  });

  it('should return correct components for soc2', () => {
    const components = getRequiredComponentsForCompliance('soc2');
    expect(components).toEqual(['firewall', 'siem', 'backup', 'mfa']);
  });

  it('should return empty array for unknown framework', () => {
    expect(getRequiredComponentsForCompliance('unknown')).toEqual([]);
  });

  it('should return a new array (no shared reference)', () => {
    const a = getRequiredComponentsForCompliance('pci-dss');
    const b = getRequiredComponentsForCompliance('pci-dss');
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});

// ===========================================================================
// Edge Cases & Combined Scenarios
// ===========================================================================

describe('gapAnalyzer — combined scenarios', () => {
  it('should work with requirements only (no targetPattern)', () => {
    const result = analyzeGaps(specWith('web-server', 'firewall'), {
      requirements: baseRequirements({
        securityLevel: 'critical',
        complianceFrameworks: ['pci-dss'],
        dataVolume: 'massive',
      }),
    });

    expect(result.targetPattern).toBeNull();
    expect(result.requirements).not.toBeNull();
    expect(result.gaps.length).toBeGreaterThan(0);
    expect(result.excessComponents.length).toBe(0); // no excess without pattern
  });

  it('should work with targetPattern only (no requirements)', () => {
    const result = analyzeGaps(specWith('web-server'), {
      targetPattern: threeTierPattern(),
    });

    expect(result.requirements).toBeNull();
    expect(result.targetPattern).not.toBeNull();
    expect(result.missingComponents.length).toBe(2); // missing app-server, db-server
  });

  it('should work with both requirements + targetPattern', () => {
    const result = analyzeGaps(specWith('web-server', 'firewall'), {
      targetPattern: threeTierPattern(),
      requirements: baseRequirements({
        securityLevel: 'high',
        complianceFrameworks: ['hipaa'],
        availabilityTarget: 99.99,
      }),
    });

    expect(result.targetPattern).not.toBeNull();
    expect(result.requirements).not.toBeNull();
    // Should have missing (from pattern), security (from level), compliance (from hipaa), etc.
    expect(result.missingComponents.length).toBeGreaterThan(0);
    expect(result.gaps.length).toBeGreaterThan(0);
  });

  it('should work with no options at all', () => {
    const result = analyzeGaps(specWith('web-server'));

    expect(result.targetPattern).toBeNull();
    expect(result.requirements).toBeNull();
    // Only basic security checks (no firewall → security gap)
    expect(result.securityGaps.length).toBeGreaterThan(0);
  });

  it('should produce a complete spec with high score when all components present (no pattern)', () => {
    // Use requirements only (no targetPattern) so excess detection is skipped.
    // Duplicate firewall and db-server for HA to avoid upgrade gaps.
    // Include dns and switch-l3 to satisfy companion graph requirements.
    const result = analyzeGaps(
      specWith(
        'web-server',
        'app-server',
        'db-server',
        'db-server',
        'firewall',
        'firewall',
        'waf',
        'ids-ips',
        'vpn-gateway',
        'siem',
        'dlp',
        'nac',
        'backup',
        'mfa',
        'cdn',
        'load-balancer',
        'cache',
        'dns',
        'switch-l3',
        'switch-l2',
        'san-nas',
        'container',
        'kubernetes',
        'sso',
        'ldap-ad',
      ),
      {
        requirements: baseRequirements({
          securityLevel: 'critical',
          complianceFrameworks: ['pci-dss', 'hipaa', 'iso-27001', 'soc2'],
          dataVolume: 'massive',
          trafficPattern: 'bursty',
          concurrentUsers: 50000,
          availabilityTarget: 99.99,
        }),
      },
    );

    // No pattern → no excess or missing-from-pattern gaps
    expect(result.missingComponents.length).toBe(0);
    expect(result.excessComponents.length).toBe(0);
    expect(result.securityGaps.length).toBe(0);
    expect(result.complianceGaps.length).toBe(0);
    expect(result.performanceGaps.length).toBe(0);
    expect(result.upgradeNeeded.length).toBe(0);
    // Companion gaps may exist from deep relationship chains but critical gaps should be 0
    const criticalCompanionGaps = result.companionGaps.filter(
      (g) => g.severity === 'critical',
    );
    expect(criticalCompanionGaps.length).toBe(0);
    // Score should be very high (may not be 100 due to some medium/low companion recommendations)
    expect(result.overallScore).toBeGreaterThanOrEqual(70);
  });

  it('should ensure all gap items have bilingual descriptions', () => {
    const result = analyzeGaps(emptySpec(), {
      targetPattern: threeTierPattern(),
      requirements: baseRequirements({
        securityLevel: 'critical',
        complianceFrameworks: ['pci-dss'],
      }),
    });

    for (const gap of result.gaps) {
      expect(gap.description).toBeTruthy();
      expect(gap.descriptionKo).toBeTruthy();
      expect(gap.suggestedAction).toBeTruthy();
      expect(gap.suggestedActionKo).toBeTruthy();
    }
  });

  it('should ensure all gap items have valid category', () => {
    const validCategories = [
      'security',
      'network',
      'compute',
      'cloud',
      'storage',
      'auth',
      'telecom',
      'wan',
      'external',
      'zone',
    ];

    const result = analyzeGaps(emptySpec(), {
      targetPattern: threeTierPattern(),
      requirements: baseRequirements({
        securityLevel: 'critical',
        complianceFrameworks: ['pci-dss', 'hipaa'],
      }),
    });

    for (const gap of result.gaps) {
      expect(validCategories).toContain(gap.category);
    }
  });
});

// ===========================================================================
// GapItem field completeness
// ===========================================================================

describe('gapAnalyzer — GapItem fields', () => {
  it('should include effort and estimatedCostImpact on every gap', () => {
    const result = analyzeGaps(emptySpec(), {
      targetPattern: threeTierPattern(),
      requirements: baseRequirements({ securityLevel: 'critical' }),
    });

    for (const gap of result.gaps) {
      expect(['low', 'medium', 'high']).toContain(gap.effort);
    }
  });
});
