/**
 * TraceCollector Tests
 *
 * Tests for the reasoning trace collector that captures each pipeline step.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TraceCollector, createTraceCollector } from '../traceCollector';
import type { TracedDocument, TracedRelationship, LiveAugmentResult } from '../types';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const SAMPLE_DOCUMENTS: TracedDocument[] = [
  { id: 'doc-1', collection: 'infraflow-ai-software', score: 0.85, title: 'Ollama', category: 'ai-inference' },
  { id: 'doc-2', collection: 'infraflow-ai-software', score: 0.72, title: 'ChromaDB', category: 'vector-dbs' },
];

const SAMPLE_RELATIONSHIPS: TracedRelationship[] = [
  { id: 'REL-AI-001', source: 'inference-engine', target: 'gpu-server', type: 'requires', confidence: 0.95, reasonKo: '추론 엔진은 GPU 서버가 필요합니다' },
  { id: 'REL-AI-005', source: 'vector-db', target: 'embedding-service', type: 'requires', confidence: 0.9, reasonKo: '벡터 DB는 임베딩 서비스가 필요합니다' },
];

const SAMPLE_AUGMENT_RESULT: LiveAugmentResult = {
  attempted: true,
  success: true,
  documentsIndexed: 2,
  durationMs: 500,
  sourceUrl: 'https://github.com/ollama/ollama',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TraceCollector', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-25T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createTraceCollector', () => {
    it('creates a TraceCollector instance', () => {
      const collector = createTraceCollector('VPN with firewall');
      expect(collector).toBeInstanceOf(TraceCollector);
    });
  });

  describe('initialization', () => {
    it('generates a unique trace ID', () => {
      const c1 = new TraceCollector('query 1');
      const c2 = new TraceCollector('query 2');
      expect(c1.getTraceId()).toMatch(/^trace-/);
      expect(c2.getTraceId()).toMatch(/^trace-/);
      expect(c1.getTraceId()).not.toBe(c2.getTraceId());
    });

    it('records query and timestamp', () => {
      const collector = new TraceCollector('RAG pipeline setup');
      const trace = collector.finalize();
      expect(trace.query).toBe('RAG pipeline setup');
      expect(trace.timestamp).toBe(Date.now());
    });

    it('initializes with default empty values', () => {
      const collector = new TraceCollector('test');
      const trace = collector.finalize();
      expect(trace.extractedNodeTypes).toEqual([]);
      expect(trace.ragSearch.documents).toEqual([]);
      expect(trace.liveAugment.triggered).toBe(false);
      expect(trace.enrichment.relationshipsMatched).toEqual([]);
      expect(trace.llm.provider).toBe('fallback');
      expect(trace.llm.success).toBe(false);
    });
  });

  describe('recordExtraction', () => {
    it('records extracted node types', () => {
      const collector = new TraceCollector('VPN with firewall');
      collector.recordExtraction(['vpn-gateway', 'firewall']);
      const trace = collector.finalize();
      expect(trace.extractedNodeTypes).toEqual(['vpn-gateway', 'firewall']);
    });

    it('handles empty extraction', () => {
      const collector = new TraceCollector('hello world');
      collector.recordExtraction([]);
      const trace = collector.finalize();
      expect(trace.extractedNodeTypes).toEqual([]);
    });
  });

  describe('recordRAGSearch', () => {
    it('records vector search results', () => {
      const collector = new TraceCollector('test');
      collector.recordRAGSearch({
        method: 'vector',
        queryTimeMs: 120,
        totalResults: 2,
        documents: SAMPLE_DOCUMENTS,
        maxScore: 0.85,
        threshold: 0.7,
      });
      const trace = collector.finalize();
      expect(trace.ragSearch.method).toBe('vector');
      expect(trace.ragSearch.totalResults).toBe(2);
      expect(trace.ragSearch.documents).toHaveLength(2);
      expect(trace.ragSearch.maxScore).toBe(0.85);
    });

    it('records keyword fallback search', () => {
      const collector = new TraceCollector('test');
      collector.recordRAGSearch({
        method: 'keyword-fallback',
        queryTimeMs: 5,
        totalResults: 1,
        documents: [SAMPLE_DOCUMENTS[0]],
        maxScore: 0.5,
        threshold: 0.7,
      });
      const trace = collector.finalize();
      expect(trace.ragSearch.method).toBe('keyword-fallback');
    });
  });

  describe('recordLiveAugment', () => {
    it('records triggered augment with result', () => {
      const collector = new TraceCollector('test');
      collector.recordLiveAugment({
        triggered: true,
        reason: 'maxScore 0.31 < threshold 0.5',
        result: SAMPLE_AUGMENT_RESULT,
      });
      const trace = collector.finalize();
      expect(trace.liveAugment.triggered).toBe(true);
      expect(trace.liveAugment.reason).toBe('maxScore 0.31 < threshold 0.5');
      expect(trace.liveAugment.result?.documentsIndexed).toBe(2);
    });

    it('records non-triggered augment', () => {
      const collector = new TraceCollector('test');
      collector.recordLiveAugment({
        triggered: false,
        reason: 'maxScore 0.85 >= threshold 0.5',
      });
      const trace = collector.finalize();
      expect(trace.liveAugment.triggered).toBe(false);
      expect(trace.liveAugment.result).toBeUndefined();
    });
  });

  describe('recordEnrichment', () => {
    it('records enrichment data', () => {
      const collector = new TraceCollector('test');
      collector.recordEnrichment({
        relationshipsMatched: SAMPLE_RELATIONSHIPS,
        relationshipsExcluded: 3,
        suggestionsCount: 5,
        violationsCount: 1,
        risksCount: 2,
        piDocumentsInjected: 4,
        cacheHit: true,
        promptSectionLength: 1500,
      });
      const trace = collector.finalize();
      expect(trace.enrichment.relationshipsMatched).toHaveLength(2);
      expect(trace.enrichment.relationshipsExcluded).toBe(3);
      expect(trace.enrichment.suggestionsCount).toBe(5);
      expect(trace.enrichment.cacheHit).toBe(true);
      expect(trace.enrichment.promptSectionLength).toBe(1500);
    });
  });

  describe('recordLLM', () => {
    it('records successful Claude call', () => {
      const collector = new TraceCollector('test');
      collector.recordLLM({
        provider: 'claude',
        model: 'claude-sonnet-4-5-20250929',
        attempts: 1,
        success: true,
      });
      const trace = collector.finalize();
      expect(trace.llm.provider).toBe('claude');
      expect(trace.llm.model).toBe('claude-sonnet-4-5-20250929');
      expect(trace.llm.attempts).toBe(1);
      expect(trace.llm.success).toBe(true);
    });

    it('records failed OpenAI call with retries', () => {
      const collector = new TraceCollector('test');
      collector.recordLLM({
        provider: 'openai',
        model: 'gpt-4o',
        attempts: 3,
        success: false,
      });
      const trace = collector.finalize();
      expect(trace.llm.provider).toBe('openai');
      expect(trace.llm.attempts).toBe(3);
      expect(trace.llm.success).toBe(false);
    });

    it('records fallback template', () => {
      const collector = new TraceCollector('test');
      collector.recordLLM({
        provider: 'fallback',
        attempts: 0,
        success: true,
      });
      const trace = collector.finalize();
      expect(trace.llm.provider).toBe('fallback');
    });
  });

  describe('recordGraphGuidance', () => {
    it('records graph guidance expansion', () => {
      const collector = new TraceCollector('test');
      collector.recordGraphGuidance({
        enabled: true,
        seedTypes: ['inference-engine'],
        expandedTypes: ['inference-engine', 'gpu-server', 'vector-db'],
        paths: [
          { from: 'inference-engine', to: 'gpu-server', via: ['REL-AI-001'], totalConfidence: 0.95 },
        ],
        expansionMs: 3,
      });
      const trace = collector.finalize();
      expect(trace.graphGuidance?.enabled).toBe(true);
      expect(trace.graphGuidance?.expandedTypes).toHaveLength(3);
      expect(trace.graphGuidance?.paths).toHaveLength(1);
    });
  });

  describe('finalize', () => {
    it('calculates total duration', () => {
      const collector = new TraceCollector('test');
      vi.advanceTimersByTime(250);
      const trace = collector.finalize();
      expect(trace.durationMs).toBe(250);
    });

    it('returns a snapshot (not a reference)', () => {
      const collector = new TraceCollector('test');
      const trace1 = collector.finalize();
      collector.recordExtraction(['firewall']);
      const trace2 = collector.finalize();
      expect(trace1.extractedNodeTypes).toEqual([]);
      expect(trace2.extractedNodeTypes).toEqual(['firewall']);
    });
  });

  describe('buildSummary', () => {
    it('produces a TraceSummary from recorded data', () => {
      const collector = new TraceCollector('test');
      collector.recordRAGSearch({
        method: 'vector',
        queryTimeMs: 100,
        totalResults: 2,
        documents: SAMPLE_DOCUMENTS,
        maxScore: 0.85,
        threshold: 0.7,
      });
      collector.recordEnrichment({
        relationshipsMatched: SAMPLE_RELATIONSHIPS,
        relationshipsExcluded: 1,
        suggestionsCount: 3,
        violationsCount: 0,
        risksCount: 1,
        piDocumentsInjected: 2,
        cacheHit: false,
        promptSectionLength: 800,
      });
      collector.recordLiveAugment({
        triggered: true,
        reason: 'low score',
      });

      const summary = collector.buildSummary();
      expect(summary.ragDocumentsUsed).toBe(2);
      expect(summary.maxScore).toBe(0.85);
      expect(summary.relationshipsMatched).toBe(2);
      expect(summary.liveAugmentTriggered).toBe(true);
      expect(summary.enrichmentCacheHit).toBe(false);
      expect(summary.gapsDetected).toBe(0);
    });

    it('returns zeros for unrecorded data', () => {
      const collector = new TraceCollector('test');
      const summary = collector.buildSummary();
      expect(summary.ragDocumentsUsed).toBe(0);
      expect(summary.maxScore).toBe(0);
      expect(summary.relationshipsMatched).toBe(0);
      expect(summary.liveAugmentTriggered).toBe(false);
    });
  });

  describe('full pipeline scenario', () => {
    it('records a complete trace through all 5 steps', () => {
      const collector = createTraceCollector('RAG pipeline with ChromaDB and Ollama');

      // Step 1
      collector.recordExtraction(['inference-engine', 'vector-db']);

      // Step 2
      collector.recordRAGSearch({
        method: 'vector',
        queryTimeMs: 95,
        totalResults: 2,
        documents: SAMPLE_DOCUMENTS,
        maxScore: 0.85,
        threshold: 0.7,
      });

      // Step 3
      collector.recordLiveAugment({
        triggered: false,
        reason: 'maxScore 0.85 >= threshold 0.5',
      });

      // Step 4
      collector.recordEnrichment({
        relationshipsMatched: SAMPLE_RELATIONSHIPS,
        relationshipsExcluded: 5,
        suggestionsCount: 4,
        violationsCount: 0,
        risksCount: 1,
        piDocumentsInjected: 2,
        cacheHit: false,
        promptSectionLength: 2300,
      });

      // Step 5
      collector.recordLLM({
        provider: 'claude',
        model: 'claude-sonnet-4-5-20250929',
        attempts: 1,
        success: true,
      });

      vi.advanceTimersByTime(500);
      const trace = collector.finalize();

      // Verify all steps present
      expect(trace.id).toMatch(/^trace-/);
      expect(trace.query).toBe('RAG pipeline with ChromaDB and Ollama');
      expect(trace.durationMs).toBe(500);
      expect(trace.extractedNodeTypes).toEqual(['inference-engine', 'vector-db']);
      expect(trace.ragSearch.method).toBe('vector');
      expect(trace.ragSearch.maxScore).toBe(0.85);
      expect(trace.liveAugment.triggered).toBe(false);
      expect(trace.enrichment.relationshipsMatched).toHaveLength(2);
      expect(trace.enrichment.piDocumentsInjected).toBe(2);
      expect(trace.llm.provider).toBe('claude');
      expect(trace.llm.success).toBe(true);

      // Summary
      const summary = collector.buildSummary();
      expect(summary.ragDocumentsUsed).toBe(2);
      expect(summary.maxScore).toBe(0.85);
      expect(summary.relationshipsMatched).toBe(2);
      expect(summary.liveAugmentTriggered).toBe(false);
      expect(summary.enrichmentCacheHit).toBe(false);
    });
  });
});
