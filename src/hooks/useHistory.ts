'use client';

import { useCallback, useRef, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { HISTORY_MAX_SIZE, HISTORY_DEBOUNCE_MS } from '@/lib/constants';

/**
 * History state snapshot
 */
export interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

/**
 * Options for useHistory hook
 */
export interface UseHistoryOptions {
  /** Maximum number of history states to keep */
  maxSize?: number;
  /** Debounce time in ms before saving to history */
  debounceMs?: number;
  /** Enable keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y) */
  enableKeyboardShortcuts?: boolean;
}

/**
 * Return type for useHistory hook
 */
export interface UseHistoryReturn {
  /** Undo to previous state */
  undo: () => void;
  /** Redo to next state */
  redo: () => void;
  /** Manually save current state to history */
  saveToHistory: () => void;
  /** Clear all history */
  clearHistory: () => void;
  /** Check if undo is available */
  canUndo: () => boolean;
  /** Check if redo is available */
  canRedo: () => boolean;
  /** Get current history index */
  historyIndex: number;
  /** Get total history length */
  historyLength: number;
}

/**
 * Hook for managing undo/redo history for nodes and edges
 *
 * @example
 * ```tsx
 * const { undo, redo, saveToHistory, canUndo, canRedo } = useHistory({
 *   nodes,
 *   edges,
 *   setNodes,
 *   setEdges,
 *   enableKeyboardShortcuts: true,
 * });
 * ```
 */
export function useHistory(
  nodes: Node[],
  edges: Edge[],
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void,
  options: UseHistoryOptions = {}
): UseHistoryReturn {
  const {
    maxSize = HISTORY_MAX_SIZE,
    debounceMs = HISTORY_DEBOUNCE_MS,
    enableKeyboardShortcuts = true,
  } = options;

  // History management with refs to avoid re-renders
  const historyRef = useRef<HistoryState[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isUndoRedoRef = useRef<boolean>(false);
  const lastSavedRef = useRef<string>('');

  /**
   * Create an immutable snapshot of current state
   */
  const createSnapshot = useCallback((nodes: Node[], edges: Edge[]): HistoryState => {
    return {
      nodes: nodes.map(n => ({
        ...n,
        data: { ...n.data },
        position: { ...n.position },
      })),
      edges: edges.map(e => ({
        ...e,
        data: e.data ? { ...e.data } : undefined,
      })),
    };
  }, []);

  /**
   * Generate a simple hash for change detection
   */
  const getStateHash = useCallback((nodes: Node[], edges: Edge[]): string => {
    const nodesHash = nodes.map(n => `${n.id}:${n.position.x}:${n.position.y}`).join(',');
    const edgesHash = edges.map(e => `${e.id}:${e.source}:${e.target}`).join(',');
    return `${nodes.length}-${nodesHash}-${edges.length}-${edgesHash}`;
  }, []);

  /**
   * Save current state to history
   */
  const saveToHistory = useCallback(() => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }

    // Skip if state hasn't changed
    const currentHash = getStateHash(nodes, edges);
    if (currentHash === lastSavedRef.current) {
      return;
    }
    lastSavedRef.current = currentHash;

    const currentState = createSnapshot(nodes, edges);

    // Remove any redo states if we're not at the end
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    }

    // Add new state
    historyRef.current.push(currentState);
    historyIndexRef.current = historyRef.current.length - 1;

    // Limit history size
    if (historyRef.current.length > maxSize) {
      historyRef.current.shift();
      historyIndexRef.current--;
    }
  }, [nodes, edges, createSnapshot, getStateHash, maxSize]);

  /**
   * Undo to previous state
   */
  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      isUndoRedoRef.current = true;
      historyIndexRef.current--;
      const prevState = historyRef.current[historyIndexRef.current];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      lastSavedRef.current = getStateHash(prevState.nodes, prevState.edges);
    }
  }, [setNodes, setEdges, getStateHash]);

  /**
   * Redo to next state
   */
  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isUndoRedoRef.current = true;
      historyIndexRef.current++;
      const nextState = historyRef.current[historyIndexRef.current];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      lastSavedRef.current = getStateHash(nextState.nodes, nextState.edges);
    }
  }, [setNodes, setEdges, getStateHash]);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    historyRef.current = [];
    historyIndexRef.current = -1;
    lastSavedRef.current = '';
  }, []);

  /**
   * Check if undo is available
   */
  const canUndo = useCallback(() => {
    return historyIndexRef.current > 0;
  }, []);

  /**
   * Check if redo is available
   */
  const canRedo = useCallback(() => {
    return historyIndexRef.current < historyRef.current.length - 1;
  }, []);

  // Initialize history with initial state
  useEffect(() => {
    if (historyRef.current.length === 0 && (nodes.length > 0 || edges.length > 0)) {
      const initialState = createSnapshot(nodes, edges);
      historyRef.current = [initialState];
      historyIndexRef.current = 0;
      lastSavedRef.current = getStateHash(nodes, edges);
    }
  }, [nodes, edges, createSnapshot, getStateHash]);

  // Save to history when nodes or edges change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (nodes.length > 0 || edges.length > 0) {
        saveToHistory();
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, saveToHistory, debounceMs]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      // Also support Ctrl+Y for redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, enableKeyboardShortcuts]);

  return {
    undo,
    redo,
    saveToHistory,
    clearHistory,
    canUndo,
    canRedo,
    historyIndex: historyIndexRef.current,
    historyLength: historyRef.current.length,
  };
}
