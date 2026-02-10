import { describe, it, expect, beforeEach } from 'vitest';
import {
  InMemoryCalibrationStore,
  computeCalibrationData,
} from '@/lib/learning/calibrationStore';
import type { AntiPatternInteraction } from '@/lib/learning/types';

function makeInteraction(
  antiPatternId: string,
  action: 'shown' | 'ignored' | 'fixed',
  id?: string
): AntiPatternInteraction {
  return {
    id: id ?? `int-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    antiPatternId,
    action,
    sessionId: 'test-session',
  };
}

describe('InMemoryCalibrationStore', () => {
  let store: InMemoryCalibrationStore;

  beforeEach(() => {
    store = new InMemoryCalibrationStore();
  });

  it('should save and retrieve interactions', async () => {
    const interaction = makeInteraction('AP-001', 'shown');
    await store.saveInteraction(interaction);

    const all = await store.getInteractions();
    expect(all).toHaveLength(1);
    expect(all[0].antiPatternId).toBe('AP-001');
  });

  it('should filter interactions by antiPatternId', async () => {
    await store.saveInteraction(makeInteraction('AP-001', 'shown', 'i1'));
    await store.saveInteraction(makeInteraction('AP-002', 'shown', 'i2'));
    await store.saveInteraction(makeInteraction('AP-001', 'ignored', 'i3'));

    const ap1 = await store.getInteractions('AP-001');
    expect(ap1).toHaveLength(2);

    const ap2 = await store.getInteractions('AP-002');
    expect(ap2).toHaveLength(1);
  });

  it('should count interactions', async () => {
    expect(await store.count()).toBe(0);
    await store.saveInteraction(makeInteraction('AP-001', 'shown', 'i1'));
    await store.saveInteraction(makeInteraction('AP-001', 'ignored', 'i2'));
    expect(await store.count()).toBe(2);
  });

  it('should clear all interactions', async () => {
    await store.saveInteraction(makeInteraction('AP-001', 'shown', 'i1'));
    await store.saveInteraction(makeInteraction('AP-002', 'shown', 'i2'));
    expect(await store.count()).toBe(2);

    await store.clear();
    expect(await store.count()).toBe(0);
  });

  it('should compute calibration data from interactions', async () => {
    // 15 shown, 10 ignored, 2 fixed for AP-001
    for (let i = 0; i < 15; i++) {
      await store.saveInteraction(makeInteraction('AP-001', 'shown', `s${i}`));
    }
    for (let i = 0; i < 10; i++) {
      await store.saveInteraction(makeInteraction('AP-001', 'ignored', `ig${i}`));
    }
    for (let i = 0; i < 2; i++) {
      await store.saveInteraction(makeInteraction('AP-001', 'fixed', `f${i}`));
    }

    const data = await store.getCalibrationData();
    const ap = data.get('AP-001');
    expect(ap).toBeDefined();
    expect(ap!.totalShown).toBe(15);
    expect(ap!.ignoredCount).toBe(10);
    expect(ap!.fixedCount).toBe(2);
    expect(ap!.ignoreRate).toBeCloseTo(10 / 15);
    expect(ap!.fixRate).toBeCloseTo(2 / 15);
  });

  it('should overwrite interaction with same id', async () => {
    await store.saveInteraction(makeInteraction('AP-001', 'shown', 'same-id'));
    await store.saveInteraction(makeInteraction('AP-001', 'ignored', 'same-id'));

    const all = await store.getInteractions();
    expect(all).toHaveLength(1);
    expect(all[0].action).toBe('ignored');
  });
});

describe('computeCalibrationData', () => {
  it('should return empty map for empty interactions', () => {
    const result = computeCalibrationData([]);
    expect(result.size).toBe(0);
  });

  it('should group interactions by antiPatternId', () => {
    const interactions: AntiPatternInteraction[] = [
      makeInteraction('AP-001', 'shown', 'i1'),
      makeInteraction('AP-002', 'shown', 'i2'),
      makeInteraction('AP-001', 'ignored', 'i3'),
    ];

    const result = computeCalibrationData(interactions);
    expect(result.size).toBe(2);
    expect(result.get('AP-001')).toBeDefined();
    expect(result.get('AP-002')).toBeDefined();
  });

  it('should compute rates correctly for high ignore rate', () => {
    const interactions: AntiPatternInteraction[] = [];

    // 20 shown, 18 ignored, 0 fixed
    for (let i = 0; i < 20; i++) {
      interactions.push(makeInteraction('AP-X', 'shown', `s${i}`));
    }
    for (let i = 0; i < 18; i++) {
      interactions.push(makeInteraction('AP-X', 'ignored', `ig${i}`));
    }

    const result = computeCalibrationData(interactions);
    const ap = result.get('AP-X')!;
    expect(ap.totalShown).toBe(20);
    expect(ap.ignoredCount).toBe(18);
    expect(ap.ignoreRate).toBeCloseTo(0.9);
    expect(ap.fixRate).toBe(0);
  });

  it('should use max of shown and ignored+fixed for totalShown', () => {
    // Edge case: more actions than shown events
    const interactions: AntiPatternInteraction[] = [
      makeInteraction('AP-Y', 'shown', 's1'),
      makeInteraction('AP-Y', 'ignored', 'ig1'),
      makeInteraction('AP-Y', 'ignored', 'ig2'),
      makeInteraction('AP-Y', 'ignored', 'ig3'),
      makeInteraction('AP-Y', 'fixed', 'f1'),
    ];

    const result = computeCalibrationData(interactions);
    const ap = result.get('AP-Y')!;
    // totalShown = max(1 shown, 3 ignored + 1 fixed) = 4
    expect(ap.totalShown).toBe(4);
    expect(ap.ignoreRate).toBeCloseTo(3 / 4);
    expect(ap.fixRate).toBeCloseTo(1 / 4);
  });
});
