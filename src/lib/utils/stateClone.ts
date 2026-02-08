/**
 * State Cloning Utilities
 *
 * Common utility functions for creating immutable snapshots of React Flow state.
 * Used by useHistory and useComparisonMode hooks.
 */

import { Node, Edge } from '@xyflow/react';

/**
 * State snapshot interface
 */
export interface StateSnapshot {
  nodes: Node[];
  edges: Edge[];
}

/**
 * Create an immutable snapshot of nodes and edges.
 * Deep clones position and data to prevent reference mutations.
 */
export function createStateSnapshot(nodes: Node[], edges: Edge[]): StateSnapshot {
  return {
    nodes: nodes.map((n) => ({
      ...n,
      data: { ...n.data },
      position: { ...n.position },
    })),
    edges: edges.map((e) => ({
      ...e,
      data: e.data ? { ...e.data } : undefined,
    })),
  };
}

/**
 * Generate a simple hash for state change detection.
 * Useful for debouncing history saves.
 */
export function generateStateHash(nodes: Node[], edges: Edge[]): string {
  const nodesHash = nodes.map((n) => `${n.id}:${n.position.x}:${n.position.y}`).join(',');
  const edgesHash = edges.map((e) => `${e.id}:${e.source}:${e.target}`).join(',');
  return `${nodes.length}-${nodesHash}-${edges.length}-${edgesHash}`;
}
