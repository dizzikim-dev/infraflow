'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import type { InfraSpec } from '@/types';
import type { Node, Edge } from '@xyflow/react';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('useDbHistory');
const UPDATE_DEBOUNCE_MS = 3000;

export interface DbHistoryEntry {
  id: string;
  title: string;
  updatedAt: string;
}

export interface FetchedDiagram {
  id: string;
  title: string;
  spec: InfraSpec;
  nodesJson: Node[] | null;
  edgesJson: Edge[] | null;
}

/**
 * DB-backed diagram history for authenticated users.
 * Mirrors useLocalHistory API but persists to PostgreSQL via /api/diagrams.
 *
 * - Creates new diagrams immediately (no debounce)
 * - Updates existing diagrams with 3s debounce
 * - Sidebar entry titles update instantly (before API response)
 */
export function useDbHistory(enabled: boolean, initialActiveId?: string | null) {
  const { status } = useSession();
  const isAuth = enabled && status === 'authenticated';

  const [entries, setEntries] = useState<DbHistoryEntry[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(initialActiveId ?? null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Ref mirrors state to avoid stale closures in setTimeout callbacks
  const activeIdRef = useRef<string | null>(initialActiveId ?? null);
  const creatingRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const setActiveId = useCallback((id: string | null) => {
    activeIdRef.current = id;
    setActiveIdState(id);
  }, []);

  // Sync initialActiveId when it changes (e.g. navigating to /diagram/[id])
  useEffect(() => {
    if (initialActiveId) {
      setActiveId(initialActiveId);
    }
  }, [initialActiveId, setActiveId]);

  // Fetch diagram list
  const fetchList = useCallback(async () => {
    if (!isAuth) return;
    try {
      const res = await fetch('/api/diagrams');
      if (!res.ok) {
        if (res.status !== 401) log.warn('Failed to fetch diagram list');
        return;
      }
      const data = await res.json();
      setEntries(
        (data.diagrams ?? []).map((d: { id: string; title: string; updatedAt: string }) => ({
          id: d.id,
          title: d.title,
          updatedAt: d.updatedAt,
        }))
      );
    } catch {
      log.warn('Diagram list unavailable');
    }
  }, [isAuth]);

  // Fetch on auth state change
  useEffect(() => {
    if (isAuth) {
      setLoading(true);
      fetchList().finally(() => setLoading(false));
    } else {
      setEntries([]);
      setActiveId(null);
    }
  }, [isAuth, fetchList, setActiveId]);

  /** Auto-save: creates immediately, updates with debounce. Sidebar updates instantly. */
  const saveSession = useCallback(
    (spec: InfraSpec, titleArg: string | undefined, nodes: Node[], edges: Edge[]) => {
      if (!isAuth) return;
      const diagramTitle = titleArg || spec.name || spec.description || '새 다이어그램';
      const currentId = activeIdRef.current;

      if (currentId) {
        // ── UPDATE existing ──
        // Instantly update sidebar entry (title + time)
        setEntries(prev => {
          const updated = prev.map(e =>
            e.id === currentId
              ? { ...e, title: diagramTitle, updatedAt: new Date().toISOString() }
              : e
          );
          const entry = updated.find(e => e.id === currentId);
          return entry ? [entry, ...updated.filter(e => e.id !== currentId)] : updated;
        });

        // Debounce the API call
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(async () => {
          setIsSaving(true);
          try {
            const id = activeIdRef.current;
            if (!id) return;
            const res = await fetch(`/api/diagrams/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ spec, nodesJson: nodes, edgesJson: edges, title: diagramTitle }),
            });
            if (res.ok) setLastSavedAt(new Date());
          } catch {
            log.warn('Failed to update diagram');
          } finally {
            setIsSaving(false);
          }
        }, UPDATE_DEBOUNCE_MS);
      } else if (!creatingRef.current) {
        // ── CREATE new (immediate, no debounce) ──
        creatingRef.current = true;
        setIsSaving(true);
        (async () => {
          try {
            const res = await fetch('/api/diagrams', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title: diagramTitle, spec, nodesJson: nodes, edgesJson: edges }),
            });
            if (res.ok) {
              const data = await res.json();
              const newId = data.diagram.id;
              setActiveId(newId);
              setEntries(prev => [
                { id: newId, title: diagramTitle, updatedAt: new Date().toISOString() },
                ...prev,
              ]);
              setLastSavedAt(new Date());
            }
          } catch {
            log.warn('Failed to create diagram');
          } finally {
            creatingRef.current = false;
            setIsSaving(false);
          }
        })();
      }
    },
    [isAuth, setActiveId]
  );

  /** Fetch full diagram data by ID */
  const selectSession = useCallback(
    async (id: string): Promise<FetchedDiagram | null> => {
      try {
        const res = await fetch(`/api/diagrams/${id}`);
        if (!res.ok) return null;
        const data = await res.json();
        setActiveId(id);
        creatingRef.current = false;
        return {
          id: data.diagram.id,
          title: data.diagram.title,
          spec: data.diagram.spec as InfraSpec,
          nodesJson: data.diagram.nodesJson as Node[] | null,
          edgesJson: data.diagram.edgesJson as Edge[] | null,
        };
      } catch {
        log.warn('Failed to fetch diagram');
        return null;
      }
    },
    [setActiveId]
  );

  /** Delete diagram (optimistic) */
  const deleteEntry = useCallback(
    async (id: string) => {
      setEntries(prev => prev.filter(e => e.id !== id));
      if (activeIdRef.current === id) {
        setActiveId(null);
        creatingRef.current = false;
      }
      try {
        await fetch(`/api/diagrams/${id}`, { method: 'DELETE' });
      } catch {
        fetchList(); // Revert on failure
      }
    },
    [setActiveId, fetchList]
  );

  /** Reset for a new diagram session */
  const startNewSession = useCallback(() => {
    setActiveId(null);
    creatingRef.current = false;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
  }, [setActiveId]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  return {
    entries,
    activeId: activeId as string | null,
    loading,
    isSaving,
    lastSavedAt,
    saveSession,
    selectSession,
    deleteEntry,
    startNewSession,
    refreshList: fetchList,
  } as const;
}
