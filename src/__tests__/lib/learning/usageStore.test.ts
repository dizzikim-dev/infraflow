import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUsageStore } from '@/lib/learning/usageStore';
import type { UsageEvent } from '@/lib/learning/types';

function makeEvent(overrides: Partial<UsageEvent> = {}): UsageEvent {
  return {
    id: 'evt-' + Math.random().toString(36).slice(2, 6),
    timestamp: new Date().toISOString(),
    eventType: 'parse',
    prompt: 'test prompt',
    success: true,
    confidence: 0.9,
    nodeTypes: ['firewall', 'web-server'],
    patternIds: [],
    antiPatternIds: [],
    sessionId: 'session-1',
    ...overrides,
  };
}

describe('InMemoryUsageStore', () => {
  let store: InMemoryUsageStore;

  beforeEach(() => {
    store = new InMemoryUsageStore();
  });

  it('should save and retrieve events', async () => {
    await store.save(makeEvent({ id: 'a' }));
    await store.save(makeEvent({ id: 'b' }));
    const all = await store.getAll();
    expect(all).toHaveLength(2);
  });

  it('should filter by session', async () => {
    await store.save(makeEvent({ id: 'a', sessionId: 's1' }));
    await store.save(makeEvent({ id: 'b', sessionId: 's2' }));
    await store.save(makeEvent({ id: 'c', sessionId: 's1' }));
    const s1Events = await store.getBySession('s1');
    expect(s1Events).toHaveLength(2);
  });

  it('should count events', async () => {
    expect(await store.count()).toBe(0);
    await store.save(makeEvent({ id: 'a' }));
    expect(await store.count()).toBe(1);
  });

  it('should clear all events', async () => {
    await store.save(makeEvent({ id: 'a' }));
    await store.save(makeEvent({ id: 'b' }));
    await store.clear();
    expect(await store.count()).toBe(0);
  });

  it('should update existing event on save with same id', async () => {
    await store.save(makeEvent({ id: 'a', success: true }));
    await store.save(makeEvent({ id: 'a', success: false }));
    const all = await store.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].success).toBe(false);
  });

  it('should prune oldest events when exceeding 2000', async () => {
    for (let i = 0; i < 2005; i++) {
      await store.save(
        makeEvent({
          id: `evt-${i.toString().padStart(5, '0')}`,
          timestamp: new Date(2026, 0, 1, 0, 0, i).toISOString(),
        })
      );
    }
    expect(await store.count()).toBe(2000);
  });

  it('should handle empty getBySession', async () => {
    const result = await store.getBySession('nonexistent');
    expect(result).toHaveLength(0);
  });

  it('should preserve all event fields', async () => {
    const event = makeEvent({
      id: 'test-full',
      eventType: 'llm-modify',
      prompt: 'WAF 추가해줘',
      success: true,
      confidence: 0.95,
      nodeTypes: ['firewall', 'waf', 'web-server'],
      patternIds: ['PAT-001'],
      antiPatternIds: ['AP-001'],
      sessionId: 'sess-123',
    });
    await store.save(event);
    const all = await store.getAll();
    expect(all[0]).toEqual(event);
  });
});
