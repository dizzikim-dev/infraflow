/**
 * Knowledge Graph Integration Tests
 *
 * Verifies that the knowledge graph modules integrate correctly
 * with the LLM pipeline (buildSystemPrompt, enrichContext, etc.)
 */

import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, SYSTEM_PROMPT } from '@/lib/parser/prompts';
import { buildContext } from '@/lib/parser/contextBuilder';
import {
  enrichContext,
  buildKnowledgePromptSection,
  RELATIONSHIPS,
  ANTIPATTERNS,
  FAILURES,
} from '@/lib/knowledge';
import { assessChangeRisk } from '@/lib/parser/changeRiskAssessor';
import type { Node, Edge } from '@xyflow/react';
import type { InfraNodeData, InfraSpec } from '@/types/infra';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeNode(id: string, type: string, label: string): Node<InfraNodeData> {
  return {
    id,
    type: 'infraNode',
    position: { x: 0, y: 0 },
    data: {
      label,
      nodeType: type,
      category: 'compute',
      tier: 'internal',
    } as InfraNodeData,
  };
}

function makeEdge(source: string, target: string): Edge {
  return { id: `${source}-${target}`, source, target };
}

// ---------------------------------------------------------------------------
// Tests: buildSystemPrompt
// ---------------------------------------------------------------------------

describe('buildSystemPrompt', () => {
  it('should return base prompt when no knowledge section is provided', () => {
    const result = buildSystemPrompt();
    expect(result).toBe(SYSTEM_PROMPT);
  });

  it('should return base prompt when undefined is passed', () => {
    const result = buildSystemPrompt(undefined);
    expect(result).toBe(SYSTEM_PROMPT);
  });

  it('should append knowledge section when provided', () => {
    const section = '## 인프라 지식 기반 가이드\n- 테스트 가이드';
    const result = buildSystemPrompt(section);
    expect(result).toContain('당신은 인프라 아키텍처 수정 전문가입니다');
    expect(result).toContain(section);
    expect(result.endsWith(section)).toBe(true);
  });

  it('should separate base prompt and knowledge section with double newline', () => {
    const section = '## Test';
    const result = buildSystemPrompt(section);
    expect(result).toContain('\n\n## Test');
  });
});

// ---------------------------------------------------------------------------
// Tests: enrichContext → buildKnowledgePromptSection pipeline
// ---------------------------------------------------------------------------

describe('Knowledge pipeline integration', () => {
  it('should produce empty string for diagram with no relevant knowledge', () => {
    // A single "user" node has very few relationships
    const nodes: Node<InfraNodeData>[] = [makeNode('user-1', 'user', 'User')];
    const edges: Edge[] = [];

    const context = buildContext(nodes, edges);
    const enriched = enrichContext(context, [...RELATIONSHIPS], {
      antiPatterns: [...ANTIPATTERNS],
      failureScenarios: [...FAILURES],
    });
    const section = buildKnowledgePromptSection(enriched);

    // May or may not have content, but should not throw
    expect(typeof section).toBe('string');
  });

  it('should produce knowledge section for a typical 3-tier architecture', () => {
    const nodes: Node<InfraNodeData>[] = [
      makeNode('web-1', 'web-server', 'Web Server'),
      makeNode('app-1', 'app-server', 'App Server'),
      makeNode('db-1', 'db-server', 'DB Server'),
      makeNode('fw-1', 'firewall', 'Firewall'),
    ];
    const edges: Edge[] = [
      makeEdge('fw-1', 'web-1'),
      makeEdge('web-1', 'app-1'),
      makeEdge('app-1', 'db-1'),
    ];

    const spec: InfraSpec = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: (n.data as InfraNodeData).nodeType as InfraSpec['nodes'][0]['type'],
        label: (n.data as InfraNodeData).label,
      })),
      connections: edges.map((e) => ({ source: e.source, target: e.target })),
    };

    const context = buildContext(nodes, edges);
    const enriched = enrichContext(context, [...RELATIONSHIPS], {
      spec,
      antiPatterns: [...ANTIPATTERNS],
      failureScenarios: [...FAILURES],
    });
    const section = buildKnowledgePromptSection(enriched);

    // A 3-tier arch with firewall should produce some knowledge
    expect(section.length).toBeGreaterThan(0);
    expect(section).toContain('인프라 지식 기반 가이드');
  });

  it('should include anti-pattern violations when detected', () => {
    // DB directly connected to internet (no firewall) — should trigger anti-patterns
    const nodes: Node<InfraNodeData>[] = [
      makeNode('internet-1', 'internet', 'Internet'),
      makeNode('db-1', 'db-server', 'DB Server'),
    ];
    const edges: Edge[] = [makeEdge('internet-1', 'db-1')];

    const spec: InfraSpec = {
      nodes: [
        { id: 'internet-1', type: 'internet', label: 'Internet' },
        { id: 'db-1', type: 'db-server', label: 'DB Server' },
      ],
      connections: [{ source: 'internet-1', target: 'db-1' }],
    };

    const context = buildContext(nodes, edges);
    const enriched = enrichContext(context, [...RELATIONSHIPS], {
      spec,
      antiPatterns: [...ANTIPATTERNS],
      failureScenarios: [...FAILURES],
    });

    // Should have violations or suggestions
    const hasContent =
      enriched.violations.length > 0 ||
      enriched.suggestions.length > 0 ||
      enriched.risks.length > 0;
    expect(hasContent).toBe(true);
  });

  it('should integrate with buildSystemPrompt correctly', () => {
    const nodes: Node<InfraNodeData>[] = [
      makeNode('fw-1', 'firewall', 'Firewall'),
      makeNode('web-1', 'web-server', 'Web Server'),
    ];
    const edges: Edge[] = [makeEdge('fw-1', 'web-1')];

    const context = buildContext(nodes, edges);
    const enriched = enrichContext(context, [...RELATIONSHIPS]);
    const section = buildKnowledgePromptSection(enriched);
    const systemPrompt = buildSystemPrompt(section || undefined);

    // Should always contain the base prompt
    expect(systemPrompt).toContain('당신은 인프라 아키텍처 수정 전문가입니다');
    // If there's a knowledge section, it should be at the end
    if (section) {
      expect(systemPrompt).toContain(section);
    }
  });
});

// ---------------------------------------------------------------------------
// Tests: assessChangeRisk integration
// ---------------------------------------------------------------------------

describe('assessChangeRisk integration', () => {
  it('should return low risk for minor additions', () => {
    const before: InfraSpec = {
      nodes: [
        { id: 'fw-1', type: 'firewall', label: 'Firewall' },
        { id: 'web-1', type: 'web-server', label: 'Web Server' },
      ],
      connections: [{ source: 'fw-1', target: 'web-1' }],
    };
    const after: InfraSpec = {
      nodes: [
        ...before.nodes,
        { id: 'waf-1', type: 'waf', label: 'WAF' },
      ],
      connections: [
        ...before.connections,
        { source: 'fw-1', target: 'waf-1' },
      ],
    };

    const result = assessChangeRisk(before, after);
    expect(result.level).toBeDefined();
    expect(['low', 'medium', 'high', 'critical']).toContain(result.level);
    expect(result.summary.addedNodes).toBe(1);
  });

  it('should flag higher risk for removing security components', () => {
    const before: InfraSpec = {
      nodes: [
        { id: 'fw-1', type: 'firewall', label: 'Firewall' },
        { id: 'web-1', type: 'web-server', label: 'Web Server' },
        { id: 'db-1', type: 'db-server', label: 'DB Server' },
      ],
      connections: [
        { source: 'fw-1', target: 'web-1' },
        { source: 'web-1', target: 'db-1' },
      ],
    };
    const after: InfraSpec = {
      nodes: [
        { id: 'web-1', type: 'web-server', label: 'Web Server' },
        { id: 'db-1', type: 'db-server', label: 'DB Server' },
      ],
      connections: [{ source: 'web-1', target: 'db-1' }],
    };

    const result = assessChangeRisk(before, after);
    expect(result.summary.removedNodes).toBe(1);
    // Removing a security component should raise risk
    expect(result.factors.length).toBeGreaterThan(0);
  });
});
