/**
 * PostVerifier Tests
 *
 * Tests for the ontology-based post-verification of LLM output.
 */

import { describe, it, expect, vi } from 'vitest';
import { verifyAgainstOntology } from '../postVerifier';
import type { InfraSpec, InfraNodeType } from '@/types/infra';
import type { ReasoningTrace } from '../types';

// ---------------------------------------------------------------------------
// Mock knowledge relationships
// ---------------------------------------------------------------------------

vi.mock('@/lib/knowledge/relationships', () => ({
  getMandatoryDependencies: vi.fn((type: string) => {
    const deps: Record<string, Array<{ id: string; source: string; target: string; relationshipType: string; reasonKo: string }>> = {
      'inference-engine': [
        { id: 'REL-AI-001', source: 'inference-engine', target: 'gpu-server', relationshipType: 'requires', reasonKo: '추론 엔진은 GPU 서버가 필요합니다' },
      ],
      'vector-db': [
        { id: 'REL-AI-005', source: 'vector-db', target: 'embedding-service', relationshipType: 'requires', reasonKo: '벡터 DB는 임베딩 서비스가 필요합니다' },
      ],
      'web-server': [
        { id: 'REL-001', source: 'web-server', target: 'firewall', relationshipType: 'requires', reasonKo: '웹 서버는 방화벽이 필요합니다' },
      ],
    };
    return deps[type] ?? [];
  }),
  getRecommendations: vi.fn((type: string) => {
    const recs: Record<string, Array<{ id: string; source: string; target: string; relationshipType: string; reasonKo: string }>> = {
      'inference-engine': [
        { id: 'REL-AI-010', source: 'inference-engine', target: 'ai-monitor', relationshipType: 'recommends', reasonKo: 'AI 모니터링 권장' },
      ],
      'web-server': [
        { id: 'REL-020', source: 'web-server', target: 'load-balancer', relationshipType: 'recommends', reasonKo: '로드 밸런서 권장' },
      ],
    };
    return recs[type] ?? [];
  }),
  getConflicts: vi.fn((type: string) => {
    const confs: Record<string, Array<{ id: string; source: string; target: string; relationshipType: string; reasonKo: string }>> = {
      'firewall': [
        { id: 'REL-CONF-001', source: 'firewall', target: 'nac', relationshipType: 'conflicts', reasonKo: '방화벽과 NAC는 충돌할 수 있습니다' },
      ],
    };
    return confs[type] ?? [];
  }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSpec(nodeTypes: string[]): InfraSpec {
  return {
    nodes: nodeTypes.map((type, i) => ({
      id: `node-${i}`,
      type: type as InfraNodeType,
      label: type,
    })),
    connections: [],
    zones: [],
  };
}

function makeTrace(docs: { id: string; title: string; score: number; category: string }[] = []): ReasoningTrace {
  return {
    id: 'trace-test1234',
    query: 'test query',
    timestamp: Date.now(),
    durationMs: 100,
    extractedNodeTypes: [],
    ragSearch: {
      method: 'vector',
      queryTimeMs: 50,
      totalResults: docs.length,
      documents: docs.map(d => ({ ...d, collection: 'infraflow-ai-software' })),
      maxScore: docs.length > 0 ? Math.max(...docs.map(d => d.score)) : 0,
      threshold: 0.7,
    },
    liveAugment: { triggered: false, reason: 'test' },
    enrichment: {
      relationshipsMatched: [],
      relationshipsExcluded: 0,
      suggestionsCount: 0,
      violationsCount: 0,
      risksCount: 0,
      piDocumentsInjected: 0,
      cacheHit: false,
      promptSectionLength: 0,
    },
    llm: { provider: 'claude', attempts: 1, success: true },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('verifyAgainstOntology', () => {
  describe('satisfied relationships', () => {
    it('marks requires as satisfied when target is present', () => {
      const spec = makeSpec(['inference-engine', 'gpu-server']);
      const result = verifyAgainstOntology(spec, makeTrace());

      expect(result.satisfied).toHaveLength(1);
      expect(result.satisfied[0].relationshipId).toBe('REL-AI-001');
      expect(result.satisfied[0].status).toBe('satisfied');
    });

    it('returns 100 score when all requirements are met', () => {
      const spec = makeSpec(['inference-engine', 'gpu-server']);
      const result = verifyAgainstOntology(spec, makeTrace());

      expect(result.verificationScore).toBe(100);
    });
  });

  describe('missing required', () => {
    it('detects missing required component', () => {
      const spec = makeSpec(['inference-engine']); // missing gpu-server
      const result = verifyAgainstOntology(spec, makeTrace());

      expect(result.missingRequired).toHaveLength(1);
      expect(result.missingRequired[0].target).toBe('gpu-server');
      expect(result.missingRequired[0].status).toBe('missing');
    });

    it('lowers verification score for missing requirements', () => {
      const spec = makeSpec(['inference-engine']); // missing gpu-server
      const result = verifyAgainstOntology(spec, makeTrace());

      expect(result.verificationScore).toBe(0); // 0/(0+1) = 0
    });

    it('calculates partial score correctly', () => {
      // web-server requires firewall (present), vector-db requires embedding-service (missing)
      const spec = makeSpec(['web-server', 'firewall', 'vector-db']);
      const result = verifyAgainstOntology(spec, makeTrace());

      // 1 satisfied (firewall), 1 missing (embedding-service) → 50%
      expect(result.verificationScore).toBe(50);
    });
  });

  describe('missing recommended', () => {
    it('detects missing recommended component', () => {
      const spec = makeSpec(['inference-engine', 'gpu-server']); // missing ai-monitor
      const result = verifyAgainstOntology(spec, makeTrace());

      expect(result.missingRecommended).toHaveLength(1);
      expect(result.missingRecommended[0].target).toBe('ai-monitor');
      expect(result.missingRecommended[0].status).toBe('missing');
    });

    it('does not report recommendation when component is present', () => {
      const spec = makeSpec(['inference-engine', 'gpu-server', 'ai-monitor']);
      const result = verifyAgainstOntology(spec, makeTrace());

      expect(result.missingRecommended).toHaveLength(0);
    });
  });

  describe('conflicts', () => {
    it('detects conflicting components', () => {
      const spec = makeSpec(['firewall', 'nac']);
      const result = verifyAgainstOntology(spec, makeTrace());

      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].source).toBe('firewall');
      expect(result.conflicts[0].target).toBe('nac');
      expect(result.conflicts[0].status).toBe('conflict');
    });

    it('does not flag conflict when only one side present', () => {
      const spec = makeSpec(['firewall']); // nac not present
      const result = verifyAgainstOntology(spec, makeTrace());

      expect(result.conflicts).toHaveLength(0);
    });
  });

  describe('unused knowledge', () => {
    it('detects high-score RAG docs not reflected in output', () => {
      const docs = [
        { id: 'doc-1', title: 'ChromaDB', score: 0.85, category: 'vector-dbs' },
      ];
      const spec = makeSpec(['inference-engine', 'gpu-server']); // no vector-db
      const result = verifyAgainstOntology(spec, makeTrace(docs));

      expect(result.unusedKnowledge).toHaveLength(1);
      expect(result.unusedKnowledge[0].title).toBe('ChromaDB');
    });

    it('does not flag docs that match output types', () => {
      const docs = [
        { id: 'doc-1', title: 'inference-engine guide', score: 0.9, category: 'inference-engine' },
      ];
      const spec = makeSpec(['inference-engine', 'gpu-server']);
      const result = verifyAgainstOntology(spec, makeTrace(docs));

      expect(result.unusedKnowledge).toHaveLength(0);
    });

    it('ignores low-score docs', () => {
      const docs = [
        { id: 'doc-1', title: 'ChromaDB', score: 0.5, category: 'vector-dbs' },
      ];
      const spec = makeSpec(['inference-engine', 'gpu-server']);
      const result = verifyAgainstOntology(spec, makeTrace(docs));

      expect(result.unusedKnowledge).toHaveLength(0);
    });
  });

  describe('empty spec', () => {
    it('returns perfect score for empty spec (no requirements)', () => {
      const spec = makeSpec([]);
      const result = verifyAgainstOntology(spec, makeTrace());

      expect(result.verificationScore).toBe(100);
      expect(result.satisfied).toHaveLength(0);
      expect(result.missingRequired).toHaveLength(0);
    });
  });

  describe('multiple types', () => {
    it('checks all types in the spec', () => {
      const spec = makeSpec(['inference-engine', 'gpu-server', 'vector-db', 'embedding-service']);
      const result = verifyAgainstOntology(spec, makeTrace());

      // inference-engine → gpu-server (satisfied)
      // vector-db → embedding-service (satisfied)
      expect(result.satisfied).toHaveLength(2);
      expect(result.missingRequired).toHaveLength(0);
      expect(result.verificationScore).toBe(100);
    });
  });

  describe('full scenario', () => {
    it('produces a complete verification result', () => {
      const docs = [
        { id: 'doc-1', title: 'ChromaDB', score: 0.85, category: 'vector-dbs' },
      ];
      // Has inference-engine (requires gpu-server) but missing gpu-server
      // Has firewall + nac (conflict)
      const spec = makeSpec(['inference-engine', 'firewall', 'nac']);
      const result = verifyAgainstOntology(spec, makeTrace(docs));

      expect(result.satisfied).toHaveLength(0);
      expect(result.missingRequired.length).toBeGreaterThan(0); // gpu-server missing
      expect(result.conflicts.length).toBeGreaterThan(0); // firewall vs nac
      expect(result.unusedKnowledge.length).toBeGreaterThan(0); // ChromaDB unused
      expect(result.missingRecommended.length).toBeGreaterThan(0); // ai-monitor missing
      expect(result.verificationScore).toBeLessThan(100);
    });
  });
});
