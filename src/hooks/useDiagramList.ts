'use client';

import { useState, useEffect, useCallback } from 'react';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('useDiagramList');

export interface DiagramSummary {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UseDiagramListReturn {
  diagrams: DiagramSummary[];
  loading: boolean;
  error: string | null;
  deleteDiagram: (id: string) => Promise<void>;
  refreshDiagrams: () => Promise<void>;
}

export function useDiagramList(enabled: boolean): UseDiagramListReturn {
  const [diagrams, setDiagrams] = useState<DiagramSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiagrams = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/diagrams');
      // 401 = not authenticated, 500 = DB likely down — both are non-fatal for sidebar
      if (res.status === 401 || res.status === 500) {
        setDiagrams([]);
        if (res.status === 500) {
          log.warn('Diagram API unavailable (DB may be offline)');
        }
        return;
      }
      if (!res.ok) throw new Error(`Failed to fetch diagrams (${res.status})`);
      const data = await res.json();
      setDiagrams(data.diagrams ?? []);
    } catch (err) {
      // Network failure (e.g. fetch itself throws) — degrade gracefully
      const msg = err instanceof Error ? err.message : 'Unknown error';
      log.warn(`Diagram list unavailable: ${msg}`);
      setDiagrams([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchDiagrams();
  }, [fetchDiagrams]);

  const deleteDiagram = useCallback(async (id: string) => {
    // Optimistic removal
    setDiagrams(prev => prev.filter(d => d.id !== id));
    try {
      const res = await fetch(`/api/diagrams/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        // Revert on failure
        await fetchDiagrams();
      }
    } catch {
      await fetchDiagrams();
    }
  }, [fetchDiagrams]);

  const refreshDiagrams = useCallback(async () => {
    await fetchDiagrams();
  }, [fetchDiagrams]);

  return { diagrams, loading, error, deleteDiagram, refreshDiagrams };
}
