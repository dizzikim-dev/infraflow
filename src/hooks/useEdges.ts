'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Edge, Node, XYPosition } from '@xyflow/react';
import { InfraNodeType, InfraSpec } from '@/types';
import { ComponentData } from './useNodes';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('useEdges');

export interface UseEdgesReturn {
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  deleteEdge: (edgeId: string) => void;
  reverseEdge: (edgeId: string) => void;
  insertNodeBetween: (
    edgeId: string,
    nodeType: InfraNodeType,
    componentData?: ComponentData,
    addNodeFn?: AddNodeFunction
  ) => string | null;
}

type AddNodeFunction = (
  nodeType: InfraNodeType,
  position: XYPosition,
  componentData?: ComponentData
) => string | null;

interface UseEdgesConfig {
  nodes: Node[];
  onSpecUpdate?: (
    updater: (prevSpec: InfraSpec | null) => InfraSpec | null
  ) => void;
}

/**
 * Hook for managing edge state and CRUD operations
 * Separated from useInfraState for better modularity
 */
export function useEdges(config: UseEdgesConfig): UseEdgesReturn {
  const { nodes, onSpecUpdate } = config;
  const [edges, setEdges] = useState<Edge[]>([]);

  // Keep a ref in sync with edges for synchronous reads (e.g., insertNodeBetween).
  const edgesRef = useRef<Edge[]>(edges);
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  /**
   * Delete an edge
   * Uses functional updater to read current edges, avoiding stale closure over `edges`.
   */
  const deleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((prevEdges) => {
        const edge = prevEdges.find((e) => e.id === edgeId);
        if (!edge) return prevEdges;

        // Update InfraSpec
        onSpecUpdate?.((prevSpec) => {
          if (!prevSpec) return prevSpec;
          return {
            ...prevSpec,
            connections: prevSpec.connections.filter(
              (conn) => !(conn.source === edge.source && conn.target === edge.target)
            ),
          };
        });

        return prevEdges.filter((e) => e.id !== edgeId);
      });
    },
    [onSpecUpdate, setEdges]
  );

  /**
   * Reverse edge direction
   * Uses functional updater to read current edges, avoiding stale closure over `edges`.
   */
  const reverseEdge = useCallback(
    (edgeId: string) => {
      setEdges((prevEdges) => {
        const edge = prevEdges.find((e) => e.id === edgeId);
        if (!edge) return prevEdges;

        // Update InfraSpec
        onSpecUpdate?.((prevSpec) => {
          if (!prevSpec) return prevSpec;
          return {
            ...prevSpec,
            connections: prevSpec.connections.map((conn) => {
              if (conn.source === edge.source && conn.target === edge.target) {
                return { ...conn, source: edge.target, target: edge.source };
              }
              return conn;
            }),
          };
        });

        return prevEdges.map((e) => {
          if (e.id === edgeId) {
            return {
              ...e,
              id: `e_${e.target}_${e.source}`,
              source: e.target,
              target: e.source,
            };
          }
          return e;
        });
      });
    },
    [onSpecUpdate, setEdges]
  );

  /**
   * Insert a node between two nodes (on an edge)
   * Reads the edge from edgesRef for synchronous access without stale closures.
   * Note: `nodes` is still read from the outer closure, which is acceptable since
   * insertNodeBetween is called from synchronous event handlers.
   */
  const insertNodeBetween = useCallback(
    (
      edgeId: string,
      nodeType: InfraNodeType,
      componentData?: ComponentData,
      addNodeFn?: AddNodeFunction
    ): string | null => {
      if (!addNodeFn) {
        log.warn('insertNodeBetween requires addNodeFn');
        return null;
      }

      // Read the edge from the ref for synchronous, always-current access.
      const edge = edgesRef.current.find((e) => e.id === edgeId);
      if (!edge) return null;

      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (!sourceNode || !targetNode) return null;

      // Calculate midpoint position
      const midPosition: XYPosition = {
        x: (sourceNode.position.x + targetNode.position.x) / 2,
        y: (sourceNode.position.y + targetNode.position.y) / 2,
      };

      // Create new node using the provided function
      const newNodeId = addNodeFn(nodeType, midPosition, componentData);
      if (!newNodeId) return null;

      // Remove old edge and add two new ones in a single update
      setEdges((prevEdges) => {
        const newEdge1: Edge = {
          id: `e_${edge.source}_${newNodeId}`,
          source: edge.source,
          target: newNodeId,
          type: 'animated',
        };
        const newEdge2: Edge = {
          id: `e_${newNodeId}_${edge.target}`,
          source: newNodeId,
          target: edge.target,
          type: 'animated',
        };
        return [...prevEdges.filter((e) => e.id !== edgeId), newEdge1, newEdge2];
      });

      // Update InfraSpec connections
      onSpecUpdate?.((prevSpec) => {
        if (!prevSpec) return prevSpec;
        return {
          ...prevSpec,
          connections: [
            ...prevSpec.connections.filter(
              (conn) => !(conn.source === edge.source && conn.target === edge.target)
            ),
            { source: edge.source, target: newNodeId },
            { source: newNodeId, target: edge.target },
          ],
        };
      });

      return newNodeId;
    },
    [nodes, onSpecUpdate, setEdges]
  );

  return {
    edges,
    setEdges,
    deleteEdge,
    reverseEdge,
    insertNodeBetween,
  };
}
