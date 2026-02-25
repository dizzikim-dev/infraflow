/**
 * Reasoning Trace Collector
 *
 * Captures each step of the RAG → Enrichment → LLM pipeline to produce
 * a full ReasoningTrace. Designed for minimal-intrusion integration:
 * each pipeline stage calls a `.record*()` method, then `.finalize()`
 * produces the complete trace.
 */

import { nanoid } from 'nanoid';
import type {
  ReasoningTrace,
  TracedDocument,
  TracedRelationship,
  TraceSummary,
  LiveAugmentResult,
  TypePath,
} from './types';
import { aggregateSources, type AnswerEvidence } from './sourceAggregator';

// ---------------------------------------------------------------------------
// TraceCollector class
// ---------------------------------------------------------------------------

export class TraceCollector {
  private readonly startTime: number;
  private readonly trace: ReasoningTrace;

  constructor(query: string) {
    this.startTime = Date.now();
    this.trace = {
      id: `trace-${nanoid(8)}`,
      query,
      timestamp: this.startTime,
      durationMs: 0,
      extractedNodeTypes: [],
      ragSearch: {
        method: 'vector',
        queryTimeMs: 0,
        totalResults: 0,
        documents: [],
        maxScore: 0,
        threshold: 0,
      },
      liveAugment: {
        triggered: false,
        reason: 'not evaluated',
      },
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
      llm: {
        provider: 'fallback',
        attempts: 0,
        success: false,
      },
    };
  }

  /** Step 1: Record node types extracted from the prompt */
  recordExtraction(nodeTypes: string[]): void {
    this.trace.extractedNodeTypes = nodeTypes;
  }

  /** Step 2: Record RAG search results */
  recordRAGSearch(params: {
    method: 'vector' | 'keyword-fallback';
    queryTimeMs: number;
    totalResults: number;
    documents: TracedDocument[];
    maxScore: number;
    threshold: number;
  }): void {
    this.trace.ragSearch = params;
  }

  /** Step 3: Record live augment decision */
  recordLiveAugment(params: {
    triggered: boolean;
    reason: string;
    result?: LiveAugmentResult;
  }): void {
    this.trace.liveAugment = params;
  }

  /** Step 4: Record knowledge enrichment results */
  recordEnrichment(params: {
    relationshipsMatched: TracedRelationship[];
    relationshipsExcluded: number;
    suggestionsCount: number;
    violationsCount: number;
    risksCount: number;
    piDocumentsInjected: number;
    cacheHit: boolean;
    promptSectionLength: number;
  }): void {
    this.trace.enrichment = params;
  }

  /** Step 5: Record LLM call outcome */
  recordLLM(params: {
    provider: 'claude' | 'openai' | 'fallback';
    model?: string;
    attempts: number;
    success: boolean;
  }): void {
    this.trace.llm = params;
  }

  /** Phase 3: Record graph guidance expansion */
  recordGraphGuidance(params: {
    enabled: boolean;
    seedTypes: string[];
    expandedTypes: string[];
    paths: TypePath[];
    expansionMs: number;
  }): void {
    this.trace.graphGuidance = params;
  }

  /** Get the trace ID before finalization */
  getTraceId(): string {
    return this.trace.id;
  }

  /** Produce a lightweight summary for the LLM response */
  buildSummary(): TraceSummary {
    return {
      ragDocumentsUsed: this.trace.ragSearch.totalResults,
      maxScore: this.trace.ragSearch.maxScore,
      relationshipsMatched: this.trace.enrichment.relationshipsMatched.length,
      gapsDetected: 0, // populated after post-verification in Phase 2
      liveAugmentTriggered: this.trace.liveAugment.triggered,
      enrichmentCacheHit: this.trace.enrichment.cacheHit,
    };
  }

  /** Produce answer-level evidence for the ReferenceBox */
  buildEvidence(verificationScore?: number): AnswerEvidence {
    return aggregateSources(
      {
        documents: this.trace.ragSearch.documents,
        relationships: this.trace.enrichment.relationshipsMatched,
      },
      {
        verificationScore: verificationScore ?? 100,
        openIssues: [],
      },
    );
  }

  /** Finalize and return the complete trace */
  finalize(): ReasoningTrace {
    this.trace.durationMs = Date.now() - this.startTime;
    return { ...this.trace };
  }
}

/** Factory function for creating a trace collector */
export function createTraceCollector(query: string): TraceCollector {
  return new TraceCollector(query);
}
