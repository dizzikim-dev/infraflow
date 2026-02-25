import { describe, it, expect } from 'vitest';
import { aggregateSources, type AggregatedSource } from '../sourceAggregator';
import type { TracedDocument, TracedRelationship } from '../types';

const makeDoc = (id: string, score: number, category: string = 'security'): TracedDocument => ({
  id, collection: 'test', score, title: `Doc ${id}`, category,
});

const makeRel = (id: string, source: string, target: string): TracedRelationship => ({
  id, source, target, type: 'requires', confidence: 0.9, reasonKo: '필수',
});

describe('aggregateSources', () => {
  it('deduplicates by document id', () => {
    const docs = [makeDoc('d1', 0.9), makeDoc('d1', 0.8), makeDoc('d2', 0.7)];
    const result = aggregateSources({ documents: docs, relationships: [] });
    expect(result.sources).toHaveLength(2);
  });

  it('ranks by score (highest first)', () => {
    const docs = [makeDoc('d1', 0.5), makeDoc('d2', 0.9), makeDoc('d3', 0.7)];
    const result = aggregateSources({ documents: docs, relationships: [] });
    expect(result.sources[0].id).toBe('d2');
  });

  it('limits to default max (7)', () => {
    const docs = Array.from({ length: 15 }, (_, i) => makeDoc(`d${i}`, 0.9 - i * 0.01));
    const result = aggregateSources({ documents: docs, relationships: [] });
    expect(result.sources.length).toBeLessThanOrEqual(7);
  });

  it('respects custom limit', () => {
    const docs = Array.from({ length: 10 }, (_, i) => makeDoc(`d${i}`, 0.9));
    const result = aggregateSources({ documents: docs, relationships: [] }, { limit: 3 });
    expect(result.sources).toHaveLength(3);
  });

  it('tags usedInSteps based on collection', () => {
    const docs = [
      { ...makeDoc('d1', 0.9), collection: 'PRODUCT_INTELLIGENCE' },
      { ...makeDoc('d2', 0.8), collection: 'EXTERNAL_CONTENT' },
    ];
    const result = aggregateSources({ documents: docs, relationships: [] });
    expect(result.sources[0].usedInSteps).toContain('rag');
    expect(result.sources[1].usedInSteps).toContain('live-augment');
  });

  it('includes verification badge from score', () => {
    const result = aggregateSources(
      { documents: [makeDoc('d1', 0.9)], relationships: [] },
      { verificationScore: 85 },
    );
    expect(result.verificationBadge).toBe('pass');
  });

  it('sets warning badge for low score', () => {
    const result = aggregateSources(
      { documents: [], relationships: [] },
      { verificationScore: 55 },
    );
    expect(result.verificationBadge).toBe('warning');
  });

  it('sets fail badge for very low score', () => {
    const result = aggregateSources(
      { documents: [], relationships: [] },
      { verificationScore: 30 },
    );
    expect(result.verificationBadge).toBe('fail');
  });

  it('includes patternsMatched from relationships', () => {
    const rels = [makeRel('r1', 'firewall', 'waf'), makeRel('r2', 'waf', 'load-balancer')];
    const result = aggregateSources({ documents: [], relationships: rels });
    expect(result.patternsMatched.length).toBeGreaterThan(0);
  });
});
