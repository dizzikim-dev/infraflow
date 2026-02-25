/**
 * Answer-level Source Aggregator
 *
 * Transforms raw TracedDocuments + TracedRelationships from the
 * TraceCollector into a deduplicated, ranked, limited set of
 * AggregatedSources for the ReferenceBox UI.
 */

import type { TracedDocument, TracedRelationship } from './types';

export interface AggregatedSource {
  id: string;
  title: string;
  category: string;
  score: number;
  collection: string;
  usedInSteps: ('rag' | 'enrichment' | 'verify' | 'live-augment')[];
}

export interface AnswerEvidence {
  sources: AggregatedSource[];
  verificationBadge: 'pass' | 'warning' | 'fail';
  verificationScore: number;
  openIssues: string[];
  patternsMatched: string[];
}

interface AggregateInput {
  documents: TracedDocument[];
  relationships: TracedRelationship[];
}

interface AggregateOptions {
  limit?: number;
  verificationScore?: number;
  openIssues?: string[];
}

const DEFAULT_LIMIT = 7;

function inferSteps(collection: string): AggregatedSource['usedInSteps'] {
  if (collection === 'EXTERNAL_CONTENT') return ['live-augment'];
  return ['rag'];
}

function scoreToBadge(score: number): 'pass' | 'warning' | 'fail' {
  if (score >= 70) return 'pass';
  if (score >= 50) return 'warning';
  return 'fail';
}

export function aggregateSources(
  input: AggregateInput,
  options: AggregateOptions = {},
): AnswerEvidence {
  const { limit = DEFAULT_LIMIT, verificationScore = 100, openIssues = [] } = options;

  // Dedupe by id
  const seen = new Set<string>();
  const unique: TracedDocument[] = [];
  for (const doc of input.documents) {
    if (!seen.has(doc.id)) {
      seen.add(doc.id);
      unique.push(doc);
    }
  }

  // Rank by score (descending)
  unique.sort((a, b) => b.score - a.score);

  // Limit
  const limited = unique.slice(0, limit);

  // Convert
  const sources: AggregatedSource[] = limited.map(doc => ({
    id: doc.id,
    title: doc.title,
    category: doc.category,
    score: doc.score,
    collection: doc.collection,
    usedInSteps: inferSteps(doc.collection),
  }));

  // Extract pattern names from relationship types
  const patternsMatched = [...new Set(input.relationships.map(r => `${r.source}→${r.target}`))];

  return {
    sources,
    verificationBadge: scoreToBadge(verificationScore),
    verificationScore,
    openIssues,
    patternsMatched,
  };
}
