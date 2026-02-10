/**
 * Calibration Store — Tracks anti-pattern interaction data
 *
 * Uses IndexedDB ('infraflow-learning' DB, 'antipattern-interactions' store).
 * Adapter pattern for testability.
 */

import type { AntiPatternInteraction, AntiPatternCalibration } from './types';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('CalibrationStore');

const DB_NAME = 'infraflow-learning';
const DB_VERSION = 2;
const INTERACTION_STORE = 'antipattern-interactions';

// ─── Adapter Interface ─────────────────────────────────────────────────

export interface CalibrationStoreAdapter {
  saveInteraction(interaction: AntiPatternInteraction): Promise<void>;
  getInteractions(antiPatternId?: string): Promise<AntiPatternInteraction[]>;
  getCalibrationData(): Promise<Map<string, AntiPatternCalibration>>;
  count(): Promise<number>;
  clear(): Promise<void>;
}

// ─── IndexedDB Implementation ──────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // Ensure previous stores exist (v1 stores)
      if (!db.objectStoreNames.contains('feedback-records')) {
        const feedbackStore = db.createObjectStore('feedback-records', { keyPath: 'id' });
        feedbackStore.createIndex('timestamp', 'timestamp', { unique: false });
        feedbackStore.createIndex('sessionId', 'sessionId', { unique: false });
        feedbackStore.createIndex('diagramSource', 'diagramSource', { unique: false });
      }
      if (!db.objectStoreNames.contains('usage-events')) {
        const usageStore = db.createObjectStore('usage-events', { keyPath: 'id' });
        usageStore.createIndex('timestamp', 'timestamp', { unique: false });
        usageStore.createIndex('sessionId', 'sessionId', { unique: false });
        usageStore.createIndex('eventType', 'eventType', { unique: false });
      }
      // v2: Add anti-pattern interactions store
      if (!db.objectStoreNames.contains(INTERACTION_STORE)) {
        const store = db.createObjectStore(INTERACTION_STORE, { keyPath: 'id' });
        store.createIndex('antiPatternId', 'antiPatternId', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

class IndexedDBCalibrationStore implements CalibrationStoreAdapter {
  async saveInteraction(interaction: AntiPatternInteraction): Promise<void> {
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(INTERACTION_STORE, 'readwrite');
        const store = tx.objectStore(INTERACTION_STORE);
        store.put(interaction);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      db.close();
    } catch (error) {
      log.error('Failed to save interaction', error instanceof Error ? error : new Error(String(error)));
    }
  }

  async getInteractions(antiPatternId?: string): Promise<AntiPatternInteraction[]> {
    try {
      const db = await openDB();
      const result = await new Promise<AntiPatternInteraction[]>((resolve, reject) => {
        const tx = db.transaction(INTERACTION_STORE, 'readonly');
        const store = tx.objectStore(INTERACTION_STORE);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      db.close();
      if (antiPatternId) {
        return result.filter((i) => i.antiPatternId === antiPatternId);
      }
      return result;
    } catch (error) {
      log.error('Failed to get interactions', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async getCalibrationData(): Promise<Map<string, AntiPatternCalibration>> {
    const interactions = await this.getInteractions();
    return computeCalibrationData(interactions);
  }

  async count(): Promise<number> {
    try {
      const db = await openDB();
      const result = await new Promise<number>((resolve, reject) => {
        const tx = db.transaction(INTERACTION_STORE, 'readonly');
        const store = tx.objectStore(INTERACTION_STORE);
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      db.close();
      return result;
    } catch (error) {
      return 0;
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(INTERACTION_STORE, 'readwrite');
        const store = tx.objectStore(INTERACTION_STORE);
        store.clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      db.close();
    } catch (error) {
      log.error('Failed to clear interactions', error instanceof Error ? error : new Error(String(error)));
    }
  }
}

// ─── In-Memory Implementation ──────────────────────────────────────────

export class InMemoryCalibrationStore implements CalibrationStoreAdapter {
  private interactions: Map<string, AntiPatternInteraction> = new Map();

  async saveInteraction(interaction: AntiPatternInteraction): Promise<void> {
    this.interactions.set(interaction.id, interaction);
  }

  async getInteractions(antiPatternId?: string): Promise<AntiPatternInteraction[]> {
    const all = [...this.interactions.values()];
    if (antiPatternId) {
      return all.filter((i) => i.antiPatternId === antiPatternId);
    }
    return all;
  }

  async getCalibrationData(): Promise<Map<string, AntiPatternCalibration>> {
    return computeCalibrationData([...this.interactions.values()]);
  }

  async count(): Promise<number> {
    return this.interactions.size;
  }

  async clear(): Promise<void> {
    this.interactions.clear();
  }
}

// ─── Shared Computation ────────────────────────────────────────────────

/**
 * Compute calibration data from raw interactions.
 * Groups by antiPatternId and calculates ignore/fix rates.
 */
export function computeCalibrationData(
  interactions: AntiPatternInteraction[]
): Map<string, AntiPatternCalibration> {
  const grouped = new Map<string, AntiPatternInteraction[]>();

  for (const i of interactions) {
    const existing = grouped.get(i.antiPatternId) || [];
    existing.push(i);
    grouped.set(i.antiPatternId, existing);
  }

  const result = new Map<string, AntiPatternCalibration>();

  for (const [apId, items] of grouped) {
    const shown = items.filter((i) => i.action === 'shown').length;
    const ignored = items.filter((i) => i.action === 'ignored').length;
    const fixed = items.filter((i) => i.action === 'fixed').length;

    // totalShown is shown + ignored + fixed (shown is the initial display,
    // ignored/fixed are the follow-up actions)
    const totalShown = Math.max(shown, ignored + fixed);

    result.set(apId, {
      antiPatternId: apId,
      totalShown,
      ignoredCount: ignored,
      fixedCount: fixed,
      ignoreRate: totalShown > 0 ? ignored / totalShown : 0,
      fixRate: totalShown > 0 ? fixed / totalShown : 0,
      originalSeverity: 'medium', // Will be enriched by calibration engine
      calibratedSeverity: 'medium',
      lastUpdated: items[items.length - 1]?.timestamp || new Date().toISOString(),
    });
  }

  return result;
}

// ─── Singleton ─────────────────────────────────────────────────────────

function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

export function createCalibrationStore(): CalibrationStoreAdapter {
  if (isIndexedDBAvailable()) {
    return new IndexedDBCalibrationStore();
  }
  log.warn('IndexedDB not available for calibration store, using in-memory');
  return new InMemoryCalibrationStore();
}

let _instance: CalibrationStoreAdapter | null = null;

export function getCalibrationStore(): CalibrationStoreAdapter {
  if (!_instance) {
    _instance = createCalibrationStore();
  }
  return _instance;
}

export function resetCalibrationStore(): void {
  _instance = null;
}
