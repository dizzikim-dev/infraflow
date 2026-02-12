'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { nanoid } from 'nanoid';
import type { InfraSpec } from '@/types';

const STORAGE_KEY = 'infraflow-local-history';
const MAX_ENTRIES = 50;

export interface LocalHistoryEntry {
  id: string;
  title: string;
  updatedAt: string;
  spec: InfraSpec;
}

function readEntries(): LocalHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeEntries(entries: LocalHistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // Storage full — silently fail
  }
}

export function useLocalHistory() {
  const [entries, setEntries] = useState<LocalHistoryEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  // Track session ID for current editing session
  const sessionIdRef = useRef<string>(nanoid(8));

  // Sync from localStorage on mount (in case other tabs updated)
  useEffect(() => {
    setEntries(readEntries());
  }, []);

  /** Create or update a diagram session in history */
  const saveSession = useCallback((spec: InfraSpec, title?: string) => {
    const id = sessionIdRef.current;
    setEntries(prev => {
      const existing = prev.find(e => e.id === id);
      const entryTitle = title || spec.name || spec.description || extractTitle(spec) || '새 다이어그램';
      const entry: LocalHistoryEntry = {
        id,
        title: entryTitle,
        updatedAt: new Date().toISOString(),
        spec,
      };
      let updated: LocalHistoryEntry[];
      if (existing) {
        // Update in place, move to top
        updated = [entry, ...prev.filter(e => e.id !== id)];
      } else {
        updated = [entry, ...prev];
      }
      writeEntries(updated);
      return updated.slice(0, MAX_ENTRIES);
    });
    setActiveId(id);
  }, []);

  /** Start a new session (for "새 다이어그램" button) */
  const startNewSession = useCallback(() => {
    sessionIdRef.current = nanoid(8);
    setActiveId(null);
  }, []);

  /** Load a past session — sets the active session ID */
  const selectSession = useCallback((id: string): LocalHistoryEntry | null => {
    const entry = entries.find(e => e.id === id) ?? null;
    if (entry) {
      sessionIdRef.current = id;
      setActiveId(id);
    }
    return entry;
  }, [entries]);

  /** Delete an entry */
  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => {
      const updated = prev.filter(e => e.id !== id);
      writeEntries(updated);
      return updated;
    });
    if (activeId === id) {
      sessionIdRef.current = nanoid(8);
      setActiveId(null);
    }
  }, [activeId]);

  return {
    entries,
    activeId,
    saveSession,
    selectSession,
    deleteEntry,
    startNewSession,
  } as const;
}

/** Extract a title from a spec by looking at node types */
function extractTitle(spec: InfraSpec): string | null {
  if (!spec.nodes?.length) return null;
  const names = spec.nodes.slice(0, 3).map(n => n.type.replace(/-/g, ' '));
  return names.join(' + ');
}
