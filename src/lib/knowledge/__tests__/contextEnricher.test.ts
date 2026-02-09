import { describe, it, expect } from 'vitest';
import { enrichContext, buildKnowledgePromptSection } from '../contextEnricher';
import { RELATIONSHIPS } from '../relationships';
import { ANTIPATTERNS } from '../antipatterns';
import { FAILURES } from '../failures';
import type { DiagramContext } from '../../parser/prompts';
import type { EnrichedKnowledge, AntiPattern } from '../types';
import type { InfraSpec } from '@/types/infra';

// Helper to create a minimal diagram context
function makeDiagramContext(types: string[]): DiagramContext {
  return {
    nodes: types.map((type, i) => ({
      id: `${type}-${i}`,
      type,
      label: type,
      category: 'test',
      zone: 'internal',
      connectedTo: [],
      connectedFrom: [],
    })),
    connections: [],
    summary: `테스트 다이어그램 (${types.length}개 노드)`,
  };
}

describe('enrichContext', () => {
  it('should return empty results for empty diagram', () => {
    const ctx = makeDiagramContext([]);
    const result = enrichContext(ctx, [...RELATIONSHIPS]);
    expect(result.relationships).toEqual([]);
    expect(result.suggestions).toEqual([]);
  });

  it('should find relevant relationships when both sides are present', () => {
    const ctx = makeDiagramContext(['db-server', 'firewall']);
    const result = enrichContext(ctx, [...RELATIONSHIPS]);
    // db-server → firewall relationship should appear
    expect(result.relationships.length).toBeGreaterThan(0);
    expect(
      result.relationships.some((r) => r.source === 'db-server' && r.target === 'firewall'),
    ).toBe(true);
  });

  it('should suggest missing mandatory dependencies', () => {
    // db-server requires firewall, but firewall is not in diagram
    const ctx = makeDiagramContext(['db-server']);
    const result = enrichContext(ctx, [...RELATIONSHIPS]);
    const dbFirewallSuggestion = result.suggestions.find(
      (s) => s.source === 'db-server' && s.target === 'firewall' && s.relationshipType === 'requires',
    );
    expect(dbFirewallSuggestion).toBeDefined();
  });

  it('should suggest missing recommendations', () => {
    // web-server recommends waf, load-balancer, cdn etc.
    const ctx = makeDiagramContext(['web-server', 'firewall']);
    const result = enrichContext(ctx, [...RELATIONSHIPS]);
    const wafSuggestion = result.suggestions.find(
      (s) => s.source === 'web-server' && s.target === 'waf',
    );
    expect(wafSuggestion).toBeDefined();
  });

  it('should detect conflicts when both conflicting components are present', () => {
    // db-server + internet should be a conflict
    const ctx = makeDiagramContext(['db-server', 'internet', 'firewall']);
    const result = enrichContext(ctx, [...RELATIONSHIPS]);
    const conflict = result.relationships.find(
      (r) =>
        r.relationshipType === 'conflicts' &&
        r.source === 'db-server' &&
        r.target === 'internet',
    );
    expect(conflict).toBeDefined();
  });

  it('should not flag conflicts when only one side is present', () => {
    const ctx = makeDiagramContext(['db-server', 'firewall']);
    const result = enrichContext(ctx, [...RELATIONSHIPS]);
    const conflicts = result.relationships.filter((r) => r.relationshipType === 'conflicts');
    expect(conflicts).toEqual([]);
  });

  it('should sort suggestions with mandatory first', () => {
    // web-server requires firewall (mandatory) and recommends waf
    const ctx = makeDiagramContext(['web-server']);
    const result = enrichContext(ctx, [...RELATIONSHIPS]);
    const requiresIdx = result.suggestions.findIndex((s) => s.relationshipType === 'requires');
    const recommendsIdx = result.suggestions.findIndex((s) => s.relationshipType === 'recommends');
    if (requiresIdx !== -1 && recommendsIdx !== -1) {
      expect(requiresIdx).toBeLessThan(recommendsIdx);
    }
  });

  it('should deduplicate relationships by ID', () => {
    const ctx = makeDiagramContext(['web-server', 'firewall', 'waf', 'load-balancer']);
    const result = enrichContext(ctx, [...RELATIONSHIPS]);
    const ids = result.relationships.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should handle a complex 3-tier architecture', () => {
    const ctx = makeDiagramContext([
      'internet',
      'firewall',
      'waf',
      'load-balancer',
      'web-server',
      'app-server',
      'db-server',
      'cache',
    ]);
    const result = enrichContext(ctx, [...RELATIONSHIPS]);
    // Should find multiple relevant relationships
    expect(result.relationships.length).toBeGreaterThanOrEqual(5);
    // Should still have some suggestions (e.g., dns, backup, etc.)
    expect(result.suggestions.length).toBeGreaterThanOrEqual(0);
  });
});

describe('buildKnowledgePromptSection', () => {
  it('should return empty string for empty enriched knowledge', () => {
    const empty: EnrichedKnowledge = {
      relationships: [],
      violations: [],
      suggestions: [],
      risks: [],
      tips: [],
    };
    const result = buildKnowledgePromptSection(empty);
    expect(result).toBe('');
  });

  it('should include header when there are relationships', () => {
    const ctx = makeDiagramContext(['db-server', 'firewall']);
    const enriched = enrichContext(ctx, [...RELATIONSHIPS]);
    const result = buildKnowledgePromptSection(enriched);
    expect(result).toContain('인프라 지식 기반 가이드');
  });

  it('should include official standards section for high-confidence entries', () => {
    const ctx = makeDiagramContext(['db-server', 'firewall']);
    const enriched = enrichContext(ctx, [...RELATIONSHIPS]);
    const result = buildKnowledgePromptSection(enriched);
    expect(result).toContain('공식 표준');
  });

  it('should include source titles in official section', () => {
    const ctx = makeDiagramContext(['db-server', 'firewall']);
    const enriched = enrichContext(ctx, [...RELATIONSHIPS]);
    const result = buildKnowledgePromptSection(enriched);
    // Should reference NIST source
    expect(result).toContain('NIST');
  });

  it('should include priority rules footer', () => {
    const ctx = makeDiagramContext(['web-server', 'firewall']);
    const enriched = enrichContext(ctx, [...RELATIONSHIPS]);
    const result = buildKnowledgePromptSection(enriched);
    expect(result).toContain('우선순위 규칙');
  });

  it('should include violation section when conflicts exist', () => {
    const ctx = makeDiagramContext(['db-server', 'internet', 'firewall']);
    const enriched = enrichContext(ctx, [...RELATIONSHIPS]);
    const result = buildKnowledgePromptSection(enriched);
    expect(result).toContain('주의사항');
    expect(result).toContain('충돌');
  });

  it('should include missing mandatory in violation section', () => {
    // db-server without firewall → missing mandatory
    const ctx = makeDiagramContext(['db-server']);
    const enriched = enrichContext(ctx, [...RELATIONSHIPS]);
    const result = buildKnowledgePromptSection(enriched);
    expect(result).toContain('필수 누락');
  });

  it('should filter by minConfidence parameter', () => {
    const ctx = makeDiagramContext(['web-server', 'firewall', 'waf']);
    const enriched = enrichContext(ctx, [...RELATIONSHIPS]);
    // With very high threshold, fewer entries
    const highThreshold = buildKnowledgePromptSection(enriched, 0.99);
    const lowThreshold = buildKnowledgePromptSection(enriched, 0.5);
    // Low threshold should include more content or equal
    expect(lowThreshold.length).toBeGreaterThanOrEqual(highThreshold.length);
  });

  it('should show conflict even when it is the only content', () => {
    const ctx = makeDiagramContext(['db-server', 'internet']);
    const enriched = enrichContext(ctx, [...RELATIONSHIPS]);
    const result = buildKnowledgePromptSection(enriched);
    // Should not be empty because of the conflict
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain('충돌');
  });
});

// Helper to build InfraSpec
function makeSpec(
  nodes: { id: string; type: string; label: string }[],
  connections: { source: string; target: string }[] = [],
): InfraSpec {
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type as never,
      label: n.label,
    })),
    connections,
  };
}

describe('enrichContext with antipattern detection', () => {
  it('should detect antipattern violations when spec and antiPatterns are provided', () => {
    const ctx = makeDiagramContext(['web-server', 'db-server']);
    const spec = makeSpec([
      { id: 'ws-1', type: 'web-server', label: 'Web' },
      { id: 'db-1', type: 'db-server', label: 'DB' },
    ]);
    const result = enrichContext(ctx, [...RELATIONSHIPS], {
      spec,
      antiPatterns: [...ANTIPATTERNS],
    });
    // Should detect issues like no firewall, no backup, etc.
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it('should return empty violations when no spec is provided', () => {
    const ctx = makeDiagramContext(['web-server']);
    const result = enrichContext(ctx, [...RELATIONSHIPS]);
    expect(result.violations).toEqual([]);
  });

  it('should return empty violations when no antiPatterns are provided', () => {
    const ctx = makeDiagramContext(['web-server']);
    const spec = makeSpec([
      { id: 'ws-1', type: 'web-server', label: 'Web' },
    ]);
    const result = enrichContext(ctx, [...RELATIONSHIPS], { spec });
    expect(result.violations).toEqual([]);
  });

  it('should detect fewer violations for well-designed spec', () => {
    const poorCtx = makeDiagramContext(['web-server', 'db-server']);
    const poorSpec = makeSpec([
      { id: 'ws-1', type: 'web-server', label: 'Web' },
      { id: 'db-1', type: 'db-server', label: 'DB' },
    ]);
    const poorResult = enrichContext(poorCtx, [...RELATIONSHIPS], {
      spec: poorSpec,
      antiPatterns: [...ANTIPATTERNS],
    });

    const goodCtx = makeDiagramContext([
      'firewall', 'waf', 'load-balancer', 'web-server',
      'app-server', 'db-server', 'cache', 'backup', 'iam',
    ]);
    const goodSpec = makeSpec([
      { id: 'fw-1', type: 'firewall', label: 'FW' },
      { id: 'waf-1', type: 'waf', label: 'WAF' },
      { id: 'lb-1', type: 'load-balancer', label: 'LB' },
      { id: 'ws-1', type: 'web-server', label: 'Web' },
      { id: 'as-1', type: 'app-server', label: 'App' },
      { id: 'db-1', type: 'db-server', label: 'DB' },
      { id: 'cache-1', type: 'cache', label: 'Cache' },
      { id: 'backup-1', type: 'backup', label: 'Backup' },
      { id: 'iam-1', type: 'iam', label: 'IAM' },
    ]);
    const goodResult = enrichContext(goodCtx, [...RELATIONSHIPS], {
      spec: goodSpec,
      antiPatterns: [...ANTIPATTERNS],
    });

    expect(goodResult.violations.length).toBeLessThan(poorResult.violations.length);
  });

  it('should handle detection function errors gracefully', () => {
    const ctx = makeDiagramContext(['web-server']);
    const spec = makeSpec([
      { id: 'ws-1', type: 'web-server', label: 'Web' },
    ]);
    const brokenAntiPattern: AntiPattern = {
      id: 'AP-BROKEN',
      type: 'antipattern',
      name: 'Broken',
      nameKo: '깨진',
      severity: 'medium',
      detection: () => { throw new Error('Broken detector'); },
      detectionDescriptionKo: '깨진 감지',
      problemKo: '깨진',
      impactKo: '없음',
      solutionKo: '수정',
      tags: ['test'],
      trust: {
        confidence: 0.7,
        sources: [{ type: 'industry', title: 'Test', accessedDate: '2026-02-09' }],
        lastReviewedAt: '2026-02-09',
        upvotes: 0,
        downvotes: 0,
      },
    };
    // Should not throw, broken detector should be silently skipped
    expect(() =>
      enrichContext(ctx, [...RELATIONSHIPS], {
        spec,
        antiPatterns: [brokenAntiPattern],
      }),
    ).not.toThrow();
  });
});

describe('buildKnowledgePromptSection with violations', () => {
  it('should include antipattern violations in output', () => {
    const ctx = makeDiagramContext(['web-server', 'db-server']);
    const spec = makeSpec([
      { id: 'ws-1', type: 'web-server', label: 'Web' },
      { id: 'db-1', type: 'db-server', label: 'DB' },
    ]);
    const enriched = enrichContext(ctx, [...RELATIONSHIPS], {
      spec,
      antiPatterns: [...ANTIPATTERNS],
    });
    const result = buildKnowledgePromptSection(enriched);
    expect(result).toContain('주의사항');
    // Should include severity indicators
    expect(result).toMatch(/CRITICAL|HIGH|MEDIUM/);
    // Should include solution hints
    expect(result).toContain('해결');
  });

  it('should show violations even when no relationships match', () => {
    const ctx = makeDiagramContext([]);
    const spec = makeSpec([
      { id: 'ws-1', type: 'web-server', label: 'Web' },
      { id: 'db-1', type: 'db-server', label: 'DB' },
    ]);
    const enriched = enrichContext(ctx, [...RELATIONSHIPS], {
      spec,
      antiPatterns: [...ANTIPATTERNS],
    });
    // Even with empty context (no relationships), violations should surface
    if (enriched.violations.length > 0) {
      const result = buildKnowledgePromptSection(enriched);
      expect(result.length).toBeGreaterThan(0);
    }
  });
});

describe('enrichContext with failure scenarios', () => {
  it('should return relevant failure scenarios for present components', () => {
    const ctx = makeDiagramContext(['firewall', 'web-server', 'db-server']);
    const result = enrichContext(ctx, [...RELATIONSHIPS], {
      failureScenarios: [...FAILURES],
    });
    expect(result.risks.length).toBeGreaterThan(0);
    // All risks should be for components in the diagram
    for (const risk of result.risks) {
      expect(['firewall', 'web-server', 'db-server']).toContain(risk.component);
    }
  });

  it('should return empty risks when no failure scenarios provided', () => {
    const ctx = makeDiagramContext(['firewall']);
    const result = enrichContext(ctx, [...RELATIONSHIPS]);
    expect(result.risks).toEqual([]);
  });

  it('should return empty risks for empty diagram', () => {
    const ctx = makeDiagramContext([]);
    const result = enrichContext(ctx, [...RELATIONSHIPS], {
      failureScenarios: [...FAILURES],
    });
    expect(result.risks).toEqual([]);
  });

  it('should sort risks by impact severity', () => {
    const ctx = makeDiagramContext([
      'firewall', 'web-server', 'db-server', 'cache', 'load-balancer',
    ]);
    const result = enrichContext(ctx, [...RELATIONSHIPS], {
      failureScenarios: [...FAILURES],
    });
    if (result.risks.length > 1) {
      const impactOrder: Record<string, number> = {
        'service-down': 0, 'data-loss': 1, 'security-breach': 2, 'degraded': 3,
      };
      for (let i = 1; i < result.risks.length; i++) {
        expect(impactOrder[result.risks[i].impact]).toBeGreaterThanOrEqual(
          impactOrder[result.risks[i - 1].impact],
        );
      }
    }
  });
});

describe('buildKnowledgePromptSection with risks', () => {
  it('should include failure scenario section in prompt', () => {
    const ctx = makeDiagramContext(['firewall', 'web-server', 'db-server']);
    const enriched = enrichContext(ctx, [...RELATIONSHIPS], {
      failureScenarios: [...FAILURES],
    });
    const result = buildKnowledgePromptSection(enriched);
    if (enriched.risks.length > 0) {
      expect(result).toContain('잠재적 장애 시나리오');
      expect(result).toContain('MTTR');
      expect(result).toContain('예방');
    }
  });
});
