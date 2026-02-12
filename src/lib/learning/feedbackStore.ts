/**
 * Feedback Store — IndexedDB wrapper for learning data
 *
 * Uses native IndexedDB with Promise wrapper.
 * DB name: 'infraflow-learning', version 2
 * Stores: 'feedback-records'
 *
 * Adapter pattern: FeedbackStoreAdapter interface allows
 * in-memory implementation for testing.
 */

import type { FeedbackRecord, FeedbackSummary } from './types';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('FeedbackStore');

const DB_NAME = 'infraflow-learning';
const DB_VERSION = 2;
const FEEDBACK_STORE = 'feedback-records';
const MAX_RECORDS = 1000;

// ─── Adapter Interface ─────────────────────────────────────────────────

export interface FeedbackStoreAdapter {
  save(record: FeedbackRecord): Promise<void>;
  getById(id: string): Promise<FeedbackRecord | null>;
  getAll(): Promise<FeedbackRecord[]>;
  getBySession(sessionId: string): Promise<FeedbackRecord[]>;
  count(): Promise<number>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
  getSummary(): Promise<FeedbackSummary>;
}

// ─── IndexedDB Implementation ──────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(FEEDBACK_STORE)) {
        const store = db.createObjectStore(FEEDBACK_STORE, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('sessionId', 'sessionId', { unique: false });
        store.createIndex('diagramSource', 'diagramSource', { unique: false });
      }
      // v1 stores (may be created by other modules)
      if (!db.objectStoreNames.contains('usage-events')) {
        const usageStore = db.createObjectStore('usage-events', { keyPath: 'id' });
        usageStore.createIndex('timestamp', 'timestamp', { unique: false });
        usageStore.createIndex('sessionId', 'sessionId', { unique: false });
        usageStore.createIndex('eventType', 'eventType', { unique: false });
      }
      // v2 store
      if (!db.objectStoreNames.contains('antipattern-interactions')) {
        const apStore = db.createObjectStore('antipattern-interactions', { keyPath: 'id' });
        apStore.createIndex('antiPatternId', 'antiPatternId', { unique: false });
        apStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function txRequest<T>(
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const request = fn(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function txGetAll(db: IDBDatabase, storeName: string): Promise<FeedbackRecord[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Prune oldest records when over MAX_RECORDS (LRU) */
async function pruneIfNeeded(db: IDBDatabase): Promise<void> {
  const count = await txRequest(db, FEEDBACK_STORE, 'readonly', (store) => store.count());
  if (count <= MAX_RECORDS) return;

  const toDelete = count - MAX_RECORDS;
  const tx = db.transaction(FEEDBACK_STORE, 'readwrite');
  const store = tx.objectStore(FEEDBACK_STORE);
  const index = store.index('timestamp');

  return new Promise((resolve, reject) => {
    const request = index.openCursor();
    let deleted = 0;

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor && deleted < toDelete) {
        cursor.delete();
        deleted++;
        cursor.continue();
      } else {
        resolve();
      }
    };
    request.onerror = () => reject(request.error);
  });
}

class IndexedDBFeedbackStore implements FeedbackStoreAdapter {
  async save(record: FeedbackRecord): Promise<void> {
    try {
      const db = await openDB();
      await txRequest(db, FEEDBACK_STORE, 'readwrite', (store) => store.put(record));
      await pruneIfNeeded(db);
      db.close();
    } catch (error) {
      log.error('Failed to save feedback record', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async getById(id: string): Promise<FeedbackRecord | null> {
    try {
      const db = await openDB();
      const result = await txRequest(db, FEEDBACK_STORE, 'readonly', (store) => store.get(id));
      db.close();
      return result ?? null;
    } catch (error) {
      log.error('Failed to get feedback record', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  async getAll(): Promise<FeedbackRecord[]> {
    try {
      const db = await openDB();
      const records = await txGetAll(db, FEEDBACK_STORE);
      db.close();
      return records;
    } catch (error) {
      log.error('Failed to get all feedback records', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async getBySession(sessionId: string): Promise<FeedbackRecord[]> {
    try {
      const db = await openDB();
      const all = await txGetAll(db, FEEDBACK_STORE);
      db.close();
      return all.filter((r) => r.sessionId === sessionId);
    } catch (error) {
      log.error('Failed to get session feedback', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async count(): Promise<number> {
    try {
      const db = await openDB();
      const result = await txRequest(db, FEEDBACK_STORE, 'readonly', (store) => store.count());
      db.close();
      return result;
    } catch (error) {
      log.error('Failed to count records', error instanceof Error ? error : new Error(String(error)));
      return 0;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const db = await openDB();
      await txRequest(db, FEEDBACK_STORE, 'readwrite', (store) => store.delete(id));
      db.close();
    } catch (error) {
      log.error('Failed to delete record', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await openDB();
      await txRequest(db, FEEDBACK_STORE, 'readwrite', (store) => store.clear());
      db.close();
    } catch (error) {
      log.error('Failed to clear records', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async getSummary(): Promise<FeedbackSummary> {
    const records = await this.getAll();
    return computeSummary(records);
  }
}

// ─── In-Memory Implementation (for testing) ────────────────────────────

export class InMemoryFeedbackStore implements FeedbackStoreAdapter {
  private records: Map<string, FeedbackRecord> = new Map();

  async save(record: FeedbackRecord): Promise<void> {
    this.records.set(record.id, record);
    // LRU pruning
    if (this.records.size > MAX_RECORDS) {
      const sorted = [...this.records.entries()].sort(
        (a, b) => a[1].timestamp.localeCompare(b[1].timestamp)
      );
      const toDelete = this.records.size - MAX_RECORDS;
      for (let i = 0; i < toDelete; i++) {
        this.records.delete(sorted[i][0]);
      }
    }
  }

  async getById(id: string): Promise<FeedbackRecord | null> {
    return this.records.get(id) ?? null;
  }

  async getAll(): Promise<FeedbackRecord[]> {
    return [...this.records.values()];
  }

  async getBySession(sessionId: string): Promise<FeedbackRecord[]> {
    return [...this.records.values()].filter((r) => r.sessionId === sessionId);
  }

  async count(): Promise<number> {
    return this.records.size;
  }

  async delete(id: string): Promise<void> {
    this.records.delete(id);
  }

  async clear(): Promise<void> {
    this.records.clear();
  }

  async getSummary(): Promise<FeedbackSummary> {
    return computeSummary([...this.records.values()]);
  }
}

// ─── Shared Summary Computation ────────────────────────────────────────

export function computeSummary(records: FeedbackRecord[]): FeedbackSummary {
  const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const sourceDistribution: Record<string, number> = {
    'local-parser': 0,
    'llm-modify': 0,
    'template': 0,
  };
  const changeCounts: Record<string, number> = {};

  let ratingSum = 0;
  let ratingCount = 0;
  let totalModifications = 0;

  for (const record of records) {
    // Rating
    if (record.userRating != null) {
      ratingDistribution[record.userRating] = (ratingDistribution[record.userRating] || 0) + 1;
      ratingSum += record.userRating;
      ratingCount++;
    }

    // Source
    sourceDistribution[record.diagramSource] = (sourceDistribution[record.diagramSource] || 0) + 1;

    // Modifications
    if (record.specDiff) {
      const ops = record.specDiff.operations;
      totalModifications += ops.length;
      for (const op of ops) {
        changeCounts[op.type] = (changeCounts[op.type] || 0) + 1;
      }
    }
  }

  const mostCommonChanges = Object.entries(changeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalRecords: records.length,
    averageRating: ratingCount > 0 ? ratingSum / ratingCount : null,
    ratingDistribution,
    sourceDistribution: sourceDistribution as Record<string, number> as FeedbackSummary['sourceDistribution'],
    totalModifications,
    mostCommonChanges,
  };
}

// ─── Singleton Export ──────────────────────────────────────────────────

/** Check if IndexedDB is available */
function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

/** Create the appropriate store implementation */
export function createFeedbackStore(): FeedbackStoreAdapter {
  if (isIndexedDBAvailable()) {
    return new IndexedDBFeedbackStore();
  }
  log.warn('IndexedDB not available, using in-memory store');
  return new InMemoryFeedbackStore();
}

/** Default singleton instance */
let _instance: FeedbackStoreAdapter | null = null;

export function getFeedbackStore(): FeedbackStoreAdapter {
  if (!_instance) {
    _instance = createFeedbackStore();
  }
  return _instance;
}

/** Reset singleton (for testing) */
export function resetFeedbackStore(): void {
  _instance = null;
}
