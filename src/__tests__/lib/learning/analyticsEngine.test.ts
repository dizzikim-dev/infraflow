import { describe, it, expect } from 'vitest';
import {
  analyzeCoOccurrences,
  analyzePatternFrequency,
  analyzeFailedPrompts,
  analyzePlacementCorrections,
  suggestNewRelationships,
} from '@/lib/learning/analyticsEngine';
import type { FeedbackRecord, UsageEvent, CoOccurrenceInsight } from '@/lib/learning/types';
import type { ComponentRelationship } from '@/lib/knowledge/types';

function makeFeedback(overrides: Partial<FeedbackRecord> = {}): FeedbackRecord {
  return {
    id: 'fb-' + Math.random().toString(36).slice(2, 6),
    timestamp: new Date().toISOString(),
    diagramSource: 'local-parser',
    prompt: 'test',
    originalSpec: { nodes: [], connections: [] },
    userRating: 4,
    specDiff: {
      operations: [], nodesAdded: 0, nodesRemoved: 0, nodesModified: 0,
      connectionsAdded: 0, connectionsRemoved: 0, placementChanges: [],
    },
    placementChanges: [],
    patternsDetected: [],
    antiPatternsDetected: [],
    antiPatternsIgnored: [],
    antiPatternsFixed: [],
    sessionId: 'session-1',
    ...overrides,
  };
}

function makeEvent(overrides: Partial<UsageEvent> = {}): UsageEvent {
  return {
    id: 'evt-' + Math.random().toString(36).slice(2, 6),
    timestamp: new Date().toISOString(),
    eventType: 'parse',
    prompt: 'test prompt',
    success: true,
    confidence: 0.9,
    nodeTypes: [],
    patternIds: [],
    antiPatternIds: [],
    sessionId: 'session-1',
    ...overrides,
  };
}

// ─── Co-Occurrence Tests ───────────────────────────────────────────────

describe('analyzeCoOccurrences', () => {
  it('should return empty for no feedbacks', () => {
    expect(analyzeCoOccurrences([])).toEqual([]);
  });

  it('should return empty when below minSupport', () => {
    const feedbacks = [
      makeFeedback({
        originalSpec: {
          nodes: [
            { id: 'fw-1', type: 'firewall', label: 'FW' },
            { id: 'ws-1', type: 'web-server', label: 'Web' },
          ],
          connections: [],
        },
      }),
    ];
    // Default minSupport is 5, only 1 occurrence
    expect(analyzeCoOccurrences(feedbacks)).toEqual([]);
  });

  it('should detect co-occurring components', () => {
    const feedbacks = Array.from({ length: 10 }, () =>
      makeFeedback({
        originalSpec: {
          nodes: [
            { id: 'fw-1', type: 'firewall', label: 'FW' },
            { id: 'ws-1', type: 'web-server', label: 'Web' },
          ],
          connections: [],
        },
      })
    );
    const results = analyzeCoOccurrences(feedbacks, 5, 0.5);
    expect(results).toHaveLength(1);
    expect(results[0].coOccurrenceCount).toBe(10);
    expect(results[0].confidence).toBe(1);
  });

  it('should filter by minConfidence', () => {
    // 8 feedbacks with fw+ws, 2 with fw only
    const feedbacks = [
      ...Array.from({ length: 8 }, () =>
        makeFeedback({
          originalSpec: {
            nodes: [
              { id: 'fw-1', type: 'firewall', label: 'FW' },
              { id: 'ws-1', type: 'web-server', label: 'Web' },
            ],
            connections: [],
          },
        })
      ),
      ...Array.from({ length: 2 }, () =>
        makeFeedback({
          originalSpec: {
            nodes: [{ id: 'fw-1', type: 'firewall', label: 'FW' }],
            connections: [],
          },
        })
      ),
    ];

    // Confidence = 8/10 = 0.8
    const highConf = analyzeCoOccurrences(feedbacks, 5, 0.9);
    expect(highConf).toHaveLength(0);

    const lowConf = analyzeCoOccurrences(feedbacks, 5, 0.7);
    expect(lowConf).toHaveLength(1);
    expect(lowConf[0].confidence).toBe(0.8);
  });

  it('should deduplicate node types within a spec', () => {
    const feedbacks = Array.from({ length: 6 }, () =>
      makeFeedback({
        originalSpec: {
          nodes: [
            { id: 'fw-1', type: 'firewall', label: 'FW1' },
            { id: 'fw-2', type: 'firewall', label: 'FW2' },
            { id: 'ws-1', type: 'web-server', label: 'Web' },
          ],
          connections: [],
        },
      })
    );
    const results = analyzeCoOccurrences(feedbacks, 5, 0.5);
    // Should have 1 pair (firewall+web-server), not count duplicate firewalls
    expect(results).toHaveLength(1);
    expect(results[0].coOccurrenceCount).toBe(6);
  });

  it('should sort by confidence descending', () => {
    const feedbacks = [
      ...Array.from({ length: 10 }, () =>
        makeFeedback({
          originalSpec: {
            nodes: [
              { id: 'fw-1', type: 'firewall', label: 'FW' },
              { id: 'ws-1', type: 'web-server', label: 'Web' },
              { id: 'lb-1', type: 'load-balancer', label: 'LB' },
            ],
            connections: [],
          },
        })
      ),
      ...Array.from({ length: 5 }, () =>
        makeFeedback({
          originalSpec: {
            nodes: [
              { id: 'fw-1', type: 'firewall', label: 'FW' },
              { id: 'ws-1', type: 'web-server', label: 'Web' },
            ],
            connections: [],
          },
        })
      ),
    ];
    const results = analyzeCoOccurrences(feedbacks, 5, 0.5);
    // fw+ws should have higher confidence than fw+lb or ws+lb
    expect(results.length).toBeGreaterThan(0);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].confidence).toBeGreaterThanOrEqual(results[i].confidence);
    }
  });
});

// ─── Pattern Frequency Tests ───────────────────────────────────────────

describe('analyzePatternFrequency', () => {
  const patternLookup = new Map([
    ['PAT-001', { name: '3-Tier', nameKo: '3티어 아키텍처' }],
    ['PAT-002', { name: 'DMZ', nameKo: 'DMZ 아키텍처' }],
  ]);

  it('should return empty for no events', () => {
    expect(analyzePatternFrequency([], [], patternLookup)).toEqual([]);
  });

  it('should count pattern frequencies', () => {
    const events = [
      makeEvent({ patternIds: ['PAT-001'] }),
      makeEvent({ patternIds: ['PAT-001', 'PAT-002'] }),
      makeEvent({ patternIds: ['PAT-001'] }),
    ];
    const results = analyzePatternFrequency(events, [], patternLookup);
    expect(results).toHaveLength(2);
    expect(results[0].patternId).toBe('PAT-001');
    expect(results[0].count).toBe(3);
    expect(results[0].patternNameKo).toBe('3티어 아키텍처');
    expect(results[1].patternId).toBe('PAT-002');
    expect(results[1].count).toBe(1);
  });

  it('should compute average rating from feedback', () => {
    const events = [makeEvent({ patternIds: ['PAT-001'] })];
    const feedbacks = [
      makeFeedback({ patternsDetected: ['PAT-001'], userRating: 5 }),
      makeFeedback({ patternsDetected: ['PAT-001'], userRating: 3 }),
    ];
    const results = analyzePatternFrequency(events, feedbacks, patternLookup);
    expect(results[0].averageRating).toBe(4);
  });

  it('should handle missing pattern in lookup', () => {
    const events = [makeEvent({ patternIds: ['UNKNOWN'] })];
    const results = analyzePatternFrequency(events, [], patternLookup);
    expect(results[0].patternName).toBe('UNKNOWN');
  });

  it('should return null average rating when no ratings', () => {
    const events = [makeEvent({ patternIds: ['PAT-001'] })];
    const feedbacks = [makeFeedback({ patternsDetected: ['PAT-001'], userRating: undefined })];
    const results = analyzePatternFrequency(events, feedbacks, patternLookup);
    expect(results[0].averageRating).toBeNull();
  });

  it('should track lastUsed timestamp', () => {
    const events = [
      makeEvent({ patternIds: ['PAT-001'], timestamp: '2026-01-01T00:00:00Z' }),
      makeEvent({ patternIds: ['PAT-001'], timestamp: '2026-02-10T00:00:00Z' }),
    ];
    const results = analyzePatternFrequency(events, [], patternLookup);
    expect(results[0].lastUsed).toBe('2026-02-10T00:00:00Z');
  });
});

// ─── Failed Prompts Tests ──────────────────────────────────────────────

describe('analyzeFailedPrompts', () => {
  it('should return empty for no events', () => {
    expect(analyzeFailedPrompts([])).toEqual([]);
  });

  it('should return empty when below minFailures', () => {
    const events = [
      makeEvent({ prompt: 'VDI 구성', success: false }),
      makeEvent({ prompt: 'VDI 아키텍처', success: false }),
    ];
    // Default minFailures is 3
    expect(analyzeFailedPrompts(events)).toEqual([]);
  });

  it('should detect frequently failing keywords', () => {
    const events = [
      makeEvent({ prompt: 'VDI 구성', success: false }),
      makeEvent({ prompt: 'VDI 아키텍처', success: false }),
      makeEvent({ prompt: 'VDI 인프라', success: false }),
      makeEvent({ prompt: 'VDI 보여줘', success: true }),
    ];
    const results = analyzeFailedPrompts(events, 3);
    expect(results.length).toBeGreaterThan(0);
    const vdiInsight = results.find((r) => r.keyword === 'vdi');
    expect(vdiInsight).toBeDefined();
    expect(vdiInsight!.failureCount).toBe(3);
    expect(vdiInsight!.totalAttempts).toBe(4);
    expect(vdiInsight!.failureRate).toBe(0.75);
  });

  it('should include sample prompts', () => {
    const events = Array.from({ length: 5 }, (_, i) =>
      makeEvent({ prompt: `VDI test ${i}`, success: false })
    );
    const results = analyzeFailedPrompts(events, 3);
    const vdiInsight = results.find((r) => r.keyword === 'vdi');
    expect(vdiInsight).toBeDefined();
    expect(vdiInsight!.samplePrompts.length).toBeGreaterThan(0);
    expect(vdiInsight!.samplePrompts.length).toBeLessThanOrEqual(5);
  });

  it('should filter out stop words', () => {
    const events = Array.from({ length: 5 }, () =>
      makeEvent({ prompt: '해줘', success: false })
    );
    const results = analyzeFailedPrompts(events, 3);
    // '해줘' is a stop word, should be filtered
    expect(results).toHaveLength(0);
  });

  it('should sort by failure rate descending', () => {
    const events = [
      ...Array.from({ length: 5 }, () => makeEvent({ prompt: 'alpha test', success: false })),
      ...Array.from({ length: 3 }, () => makeEvent({ prompt: 'alpha test', success: true })),
      ...Array.from({ length: 4 }, () => makeEvent({ prompt: 'beta check', success: false })),
    ];
    const results = analyzeFailedPrompts(events, 3);
    if (results.length > 1) {
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].failureRate).toBeGreaterThanOrEqual(results[i].failureRate);
      }
    }
  });

  it('should skip events without prompt', () => {
    const events = Array.from({ length: 5 }, () =>
      makeEvent({ prompt: undefined, success: false })
    );
    const results = analyzeFailedPrompts(events, 3);
    expect(results).toHaveLength(0);
  });
});

// ─── Placement Corrections Tests ───────────────────────────────────────

describe('analyzePlacementCorrections', () => {
  it('should return empty for no feedbacks', () => {
    expect(analyzePlacementCorrections([])).toEqual([]);
  });

  it('should return empty when no placement changes', () => {
    const feedbacks = [
      makeFeedback({
        originalSpec: { nodes: [{ id: 'fw-1', type: 'firewall', label: 'FW' }], connections: [] },
        placementChanges: [],
      }),
    ];
    expect(analyzePlacementCorrections(feedbacks)).toEqual([]);
  });

  it('should aggregate placement corrections', () => {
    const feedbacks = [
      makeFeedback({
        originalSpec: { nodes: [{ id: 'fw-1', type: 'firewall', label: 'FW' }], connections: [] },
        placementChanges: [
          { nodeId: 'fw-1', nodeType: 'firewall', originalTier: 'internal', newTier: 'dmz', moved: true },
        ],
      }),
      makeFeedback({
        originalSpec: { nodes: [{ id: 'fw-2', type: 'firewall', label: 'FW2' }], connections: [] },
        placementChanges: [
          { nodeId: 'fw-2', nodeType: 'firewall', originalTier: 'internal', newTier: 'dmz', moved: true },
        ],
      }),
    ];
    const results = analyzePlacementCorrections(feedbacks);
    expect(results).toHaveLength(1);
    expect(results[0].nodeType).toBe('firewall');
    expect(results[0].fromTier).toBe('internal');
    expect(results[0].toTier).toBe('dmz');
    expect(results[0].count).toBe(2);
  });

  it('should skip changes without tier info', () => {
    const feedbacks = [
      makeFeedback({
        originalSpec: { nodes: [{ id: 'fw-1', type: 'firewall', label: 'FW' }], connections: [] },
        placementChanges: [
          { nodeId: 'fw-1', nodeType: 'firewall', moved: true },
        ],
      }),
    ];
    const results = analyzePlacementCorrections(feedbacks);
    expect(results).toHaveLength(0);
  });

  it('should sort by count descending', () => {
    const feedbacks = [
      ...Array.from({ length: 5 }, () =>
        makeFeedback({
          originalSpec: { nodes: [{ id: 'fw-1', type: 'firewall', label: 'FW' }], connections: [] },
          placementChanges: [
            { nodeId: 'fw-1', nodeType: 'firewall', originalTier: 'internal', newTier: 'dmz', moved: true },
          ],
        })
      ),
      ...Array.from({ length: 3 }, () =>
        makeFeedback({
          originalSpec: { nodes: [{ id: 'ws-1', type: 'web-server', label: 'WS' }], connections: [] },
          placementChanges: [
            { nodeId: 'ws-1', nodeType: 'web-server', originalTier: 'dmz', newTier: 'internal', moved: true },
          ],
        })
      ),
    ];
    const results = analyzePlacementCorrections(feedbacks);
    expect(results[0].count).toBeGreaterThanOrEqual(results[1].count);
  });
});

// ─── Relationship Suggestion Tests ─────────────────────────────────────

describe('suggestNewRelationships', () => {
  it('should return empty for no co-occurrences', () => {
    expect(suggestNewRelationships([], [])).toEqual([]);
  });

  it('should filter out existing relationships', () => {
    const coOccurrences: CoOccurrenceInsight[] = [
      {
        typeA: 'firewall',
        typeB: 'web-server',
        coOccurrenceCount: 10,
        totalA: 10,
        totalB: 10,
        confidence: 1,
        support: 10,
        isExistingRelationship: false,
      },
    ];
    const existing: ComponentRelationship[] = [
      {
        id: 'REL-001',
        type: 'relationship',
        source: 'firewall',
        target: 'web-server',
        relationshipType: 'protects',
        strength: 'strong',
        direction: 'downstream',
        reason: 'test',
        reasonKo: 'test',
        tags: [],
        trust: { confidence: 1, sources: [], lastReviewedAt: '', upvotes: 0, downvotes: 0 },
      },
    ];
    const suggestions = suggestNewRelationships(coOccurrences, existing);
    expect(suggestions).toHaveLength(0);
    expect(coOccurrences[0].isExistingRelationship).toBe(true);
  });

  it('should suggest new relationships', () => {
    const coOccurrences: CoOccurrenceInsight[] = [
      {
        typeA: 'siem',
        typeB: 'soar',
        coOccurrenceCount: 8,
        totalA: 10,
        totalB: 8,
        confidence: 0.8,
        support: 8,
        isExistingRelationship: false,
      },
    ];
    const suggestions = suggestNewRelationships(coOccurrences, []);
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].source).toBe('siem');
    expect(suggestions[0].target).toBe('soar');
    expect(suggestions[0].suggestedType).toBe('recommends');
  });

  it('should use complements for lower confidence', () => {
    const coOccurrences: CoOccurrenceInsight[] = [
      {
        typeA: 'dns',
        typeB: 'cdn',
        coOccurrenceCount: 6,
        totalA: 10,
        totalB: 8,
        confidence: 0.6,
        support: 6,
        isExistingRelationship: false,
      },
    ];
    const suggestions = suggestNewRelationships(coOccurrences, []);
    expect(suggestions[0].suggestedType).toBe('complements');
  });

  it('should sort suggestions by confidence descending', () => {
    const coOccurrences: CoOccurrenceInsight[] = [
      {
        typeA: 'dns',
        typeB: 'cdn',
        coOccurrenceCount: 6,
        totalA: 10,
        totalB: 8,
        confidence: 0.6,
        support: 6,
        isExistingRelationship: false,
      },
      {
        typeA: 'siem',
        typeB: 'soar',
        coOccurrenceCount: 9,
        totalA: 10,
        totalB: 9,
        confidence: 0.9,
        support: 9,
        isExistingRelationship: false,
      },
    ];
    const suggestions = suggestNewRelationships(coOccurrences, []);
    expect(suggestions[0].confidence).toBeGreaterThan(suggestions[1].confidence);
  });
});
