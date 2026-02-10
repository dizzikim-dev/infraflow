import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryFeedbackStore, computeSummary } from '@/lib/learning/feedbackStore';
import type { FeedbackRecord } from '@/lib/learning/types';

function makeFeedback(overrides: Partial<FeedbackRecord> = {}): FeedbackRecord {
  return {
    id: 'fb-' + Math.random().toString(36).slice(2, 6),
    timestamp: new Date().toISOString(),
    diagramSource: 'local-parser',
    prompt: 'test prompt',
    originalSpec: { nodes: [{ id: 'fw-1', type: 'firewall', label: 'FW' }], connections: [] },
    userRating: 4,
    specDiff: {
      operations: [],
      nodesAdded: 0,
      nodesRemoved: 0,
      nodesModified: 0,
      connectionsAdded: 0,
      connectionsRemoved: 0,
      placementChanges: [],
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

describe('InMemoryFeedbackStore', () => {
  let store: InMemoryFeedbackStore;

  beforeEach(() => {
    store = new InMemoryFeedbackStore();
  });

  it('should save and retrieve a record by id', async () => {
    const record = makeFeedback({ id: 'test-1' });
    await store.save(record);
    const retrieved = await store.getById('test-1');
    expect(retrieved).toEqual(record);
  });

  it('should return null for non-existent id', async () => {
    const result = await store.getById('nonexistent');
    expect(result).toBeNull();
  });

  it('should get all records', async () => {
    await store.save(makeFeedback({ id: 'a' }));
    await store.save(makeFeedback({ id: 'b' }));
    await store.save(makeFeedback({ id: 'c' }));
    const all = await store.getAll();
    expect(all).toHaveLength(3);
  });

  it('should filter by session', async () => {
    await store.save(makeFeedback({ id: 'a', sessionId: 's1' }));
    await store.save(makeFeedback({ id: 'b', sessionId: 's2' }));
    await store.save(makeFeedback({ id: 'c', sessionId: 's1' }));
    const s1 = await store.getBySession('s1');
    expect(s1).toHaveLength(2);
    expect(s1.every((r) => r.sessionId === 's1')).toBe(true);
  });

  it('should count records', async () => {
    expect(await store.count()).toBe(0);
    await store.save(makeFeedback({ id: 'a' }));
    await store.save(makeFeedback({ id: 'b' }));
    expect(await store.count()).toBe(2);
  });

  it('should delete a record', async () => {
    await store.save(makeFeedback({ id: 'del-1' }));
    expect(await store.getById('del-1')).not.toBeNull();
    await store.delete('del-1');
    expect(await store.getById('del-1')).toBeNull();
  });

  it('should clear all records', async () => {
    await store.save(makeFeedback({ id: 'a' }));
    await store.save(makeFeedback({ id: 'b' }));
    await store.clear();
    expect(await store.count()).toBe(0);
  });

  it('should update existing record on save with same id', async () => {
    const record = makeFeedback({ id: 'upd-1', userRating: 3 });
    await store.save(record);
    await store.save({ ...record, userRating: 5 });
    const retrieved = await store.getById('upd-1');
    expect(retrieved?.userRating).toBe(5);
  });

  it('should prune oldest records when exceeding 1000', async () => {
    // Save 1005 records with sequential timestamps
    for (let i = 0; i < 1005; i++) {
      await store.save(
        makeFeedback({
          id: `rec-${i.toString().padStart(4, '0')}`,
          timestamp: new Date(2026, 0, 1, 0, 0, i).toISOString(),
        })
      );
    }
    expect(await store.count()).toBe(1000);

    // Oldest records should be pruned
    const oldest = await store.getById('rec-0000');
    expect(oldest).toBeNull();

    // Newest should still exist
    const newest = await store.getById('rec-1004');
    expect(newest).not.toBeNull();
  });

  it('should compute summary', async () => {
    await store.save(makeFeedback({ id: 'a', userRating: 5, diagramSource: 'local-parser' }));
    await store.save(makeFeedback({ id: 'b', userRating: 3, diagramSource: 'llm-modify' }));
    await store.save(makeFeedback({ id: 'c', diagramSource: 'template' }));
    const summary = await store.getSummary();
    expect(summary.totalRecords).toBe(3);
    expect(summary.averageRating).toBeCloseTo(4, 0); // (5+3+4)/3
  });
});

describe('computeSummary', () => {
  it('should handle empty records', () => {
    const summary = computeSummary([]);
    expect(summary.totalRecords).toBe(0);
    expect(summary.averageRating).toBeNull();
    expect(summary.totalModifications).toBe(0);
  });

  it('should compute average rating', () => {
    const records = [
      makeFeedback({ userRating: 5 }),
      makeFeedback({ userRating: 3 }),
      makeFeedback({ userRating: 4 }),
    ];
    const summary = computeSummary(records);
    expect(summary.averageRating).toBe(4);
  });

  it('should compute rating distribution', () => {
    const records = [
      makeFeedback({ userRating: 5 }),
      makeFeedback({ userRating: 5 }),
      makeFeedback({ userRating: 3 }),
    ];
    const summary = computeSummary(records);
    expect(summary.ratingDistribution[5]).toBe(2);
    expect(summary.ratingDistribution[3]).toBe(1);
    expect(summary.ratingDistribution[1]).toBe(0);
  });

  it('should compute source distribution', () => {
    const records = [
      makeFeedback({ diagramSource: 'local-parser' }),
      makeFeedback({ diagramSource: 'local-parser' }),
      makeFeedback({ diagramSource: 'llm-modify' }),
    ];
    const summary = computeSummary(records);
    expect(summary.sourceDistribution['local-parser']).toBe(2);
    expect(summary.sourceDistribution['llm-modify']).toBe(1);
    expect(summary.sourceDistribution['template']).toBe(0);
  });

  it('should compute most common changes', () => {
    const records = [
      makeFeedback({
        specDiff: {
          operations: [
            { type: 'add-node', nodeId: 'a', nodeType: 'firewall' },
            { type: 'add-node', nodeId: 'b', nodeType: 'waf' },
          ],
          nodesAdded: 2, nodesRemoved: 0, nodesModified: 0,
          connectionsAdded: 0, connectionsRemoved: 0, placementChanges: [],
        },
      }),
      makeFeedback({
        specDiff: {
          operations: [
            { type: 'add-node', nodeId: 'c', nodeType: 'firewall' },
            { type: 'remove-node', nodeId: 'd', nodeType: 'waf' },
          ],
          nodesAdded: 1, nodesRemoved: 1, nodesModified: 0,
          connectionsAdded: 0, connectionsRemoved: 0, placementChanges: [],
        },
      }),
    ];
    const summary = computeSummary(records);
    expect(summary.totalModifications).toBe(4);
    expect(summary.mostCommonChanges[0].type).toBe('add-node');
    expect(summary.mostCommonChanges[0].count).toBe(3);
  });

  it('should handle records without ratings', () => {
    const records = [
      makeFeedback({ userRating: undefined }),
      makeFeedback({ userRating: undefined }),
    ];
    const summary = computeSummary(records);
    expect(summary.averageRating).toBeNull();
  });
});
