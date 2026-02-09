/**
 * Diagram Persistence Hook
 *
 * Auto-saves diagram state to the server with debouncing.
 * Only active when the user is authenticated and has a diagram ID.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import type { InfraSpec } from '@/types';
import type { Node, Edge } from '@xyflow/react';

interface UseDiagramPersistenceOptions {
  diagramId: string | null;
  spec: InfraSpec | null;
  nodes: Node[];
  edges: Edge[];
  debounceMs?: number;
}

interface UseDiagramPersistenceReturn {
  isSaving: boolean;
  lastSavedAt: Date | null;
  save: () => Promise<void>;
}

export function useDiagramPersistence({
  diagramId,
  spec,
  nodes,
  edges,
  debounceMs = 5000,
}: UseDiagramPersistenceOptions): UseDiagramPersistenceReturn {
  const { data: session } = useSession();
  const isSavingRef = useRef(false);
  const lastSavedAtRef = useRef<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef(false);

  const save = useCallback(async () => {
    if (!diagramId || !session?.user || !spec || isSavingRef.current) return;

    isSavingRef.current = true;
    try {
      const res = await fetch(`/api/diagrams/${diagramId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spec,
          nodesJson: nodes,
          edgesJson: edges,
        }),
      });

      if (res.ok) {
        lastSavedAtRef.current = new Date();
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [diagramId, session?.user, spec, nodes, edges]);

  // Debounced auto-save on changes
  useEffect(() => {
    if (!diagramId || !session?.user || !spec) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      save();
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [diagramId, session?.user, spec, nodes, edges, debounceMs, save]);

  // Save on unmount if pending
  useEffect(() => {
    return () => {
      if (pendingRef.current && timerRef.current) {
        clearTimeout(timerRef.current);
        save();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isSaving: isSavingRef.current,
    lastSavedAt: lastSavedAtRef.current,
    save,
  };
}
