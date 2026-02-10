/**
 * Usage Store — Tracks diagram generation/modification events
 *
 * Same IndexedDB database as feedbackStore ('infraflow-learning'),
 * separate object store ('usage-events').
 */

import type { UsageEvent } from './types';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('UsageStore');

const DB_NAME = 'infraflow-learning';
const DB_VERSION = 1;
const USAGE_STORE = 'usage-events';
const MAX_EVENTS = 2000;

// ─── Adapter Interface ─────────────────────────────────────────────────

export interface UsageStoreAdapter {
  save(event: UsageEvent): Promise<void>;
  getAll(): Promise<UsageEvent[]>;
  getBySession(sessionId: string): Promise<UsageEvent[]>;
  count(): Promise<number>;
  clear(): Promise<void>;
}

// ─── IndexedDB Implementation ──────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // Feedback store (created in feedbackStore.ts but may not exist yet)
      if (!db.objectStoreNames.contains('feedback-records')) {
        const feedbackStore = db.createObjectStore('feedback-records', { keyPath: 'id' });
        feedbackStore.createIndex('timestamp', 'timestamp', { unique: false });
        feedbackStore.createIndex('sessionId', 'sessionId', { unique: false });
        feedbackStore.createIndex('diagramSource', 'diagramSource', { unique: false });
      }
      // Usage store
      if (!db.objectStoreNames.contains(USAGE_STORE)) {
        const store = db.createObjectStore(USAGE_STORE, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('sessionId', 'sessionId', { unique: false });
        store.createIndex('eventType', 'eventType', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

class IndexedDBUsageStore implements UsageStoreAdapter {
  async save(event: UsageEvent): Promise<void> {
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(USAGE_STORE, 'readwrite');
        const store = tx.objectStore(USAGE_STORE);
        store.put(event);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      await this.pruneIfNeeded(db);
      db.close();
    } catch (error) {
      log.error('Failed to save usage event', error instanceof Error ? error : new Error(String(error)));
    }
  }

  async getAll(): Promise<UsageEvent[]> {
    try {
      const db = await openDB();
      const result = await new Promise<UsageEvent[]>((resolve, reject) => {
        const tx = db.transaction(USAGE_STORE, 'readonly');
        const store = tx.objectStore(USAGE_STORE);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      db.close();
      return result;
    } catch (error) {
      log.error('Failed to get usage events', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async getBySession(sessionId: string): Promise<UsageEvent[]> {
    const all = await this.getAll();
    return all.filter((e) => e.sessionId === sessionId);
  }

  async count(): Promise<number> {
    try {
      const db = await openDB();
      const result = await new Promise<number>((resolve, reject) => {
        const tx = db.transaction(USAGE_STORE, 'readonly');
        const store = tx.objectStore(USAGE_STORE);
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
        const tx = db.transaction(USAGE_STORE, 'readwrite');
        const store = tx.objectStore(USAGE_STORE);
        store.clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      db.close();
    } catch (error) {
      log.error('Failed to clear usage events', error instanceof Error ? error : new Error(String(error)));
    }
  }

  private async pruneIfNeeded(db: IDBDatabase): Promise<void> {
    const count = await new Promise<number>((resolve, reject) => {
      const tx = db.transaction(USAGE_STORE, 'readonly');
      const store = tx.objectStore(USAGE_STORE);
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (count <= MAX_EVENTS) return;

    const toDelete = count - MAX_EVENTS;
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(USAGE_STORE, 'readwrite');
      const store = tx.objectStore(USAGE_STORE);
      const index = store.index('timestamp');
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
}

// ─── In-Memory Implementation ──────────────────────────────────────────

export class InMemoryUsageStore implements UsageStoreAdapter {
  private events: Map<string, UsageEvent> = new Map();

  async save(event: UsageEvent): Promise<void> {
    this.events.set(event.id, event);
    if (this.events.size > MAX_EVENTS) {
      const sorted = [...this.events.entries()].sort(
        (a, b) => a[1].timestamp.localeCompare(b[1].timestamp)
      );
      const toDelete = this.events.size - MAX_EVENTS;
      for (let i = 0; i < toDelete; i++) {
        this.events.delete(sorted[i][0]);
      }
    }
  }

  async getAll(): Promise<UsageEvent[]> {
    return [...this.events.values()];
  }

  async getBySession(sessionId: string): Promise<UsageEvent[]> {
    return [...this.events.values()].filter((e) => e.sessionId === sessionId);
  }

  async count(): Promise<number> {
    return this.events.size;
  }

  async clear(): Promise<void> {
    this.events.clear();
  }
}

// ─── Singleton ─────────────────────────────────────────────────────────

function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

export function createUsageStore(): UsageStoreAdapter {
  if (isIndexedDBAvailable()) {
    return new IndexedDBUsageStore();
  }
  log.warn('IndexedDB not available for usage store, using in-memory');
  return new InMemoryUsageStore();
}

let _instance: UsageStoreAdapter | null = null;

export function getUsageStore(): UsageStoreAdapter {
  if (!_instance) {
    _instance = createUsageStore();
  }
  return _instance;
}

export function resetUsageStore(): void {
  _instance = null;
}
