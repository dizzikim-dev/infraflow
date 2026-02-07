'use client';

import { useState, useCallback } from 'react';
import { Edge, Node, XYPosition } from '@xyflow/react';
import { InfraNodeType, InfraSpec } from '@/types';
import { ComponentData } from './useNodes';

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

  /**
   * Delete an edge
   */
  const deleteEdge = useCallback(
    (edgeId: string) => {
      const edge = edges.find((e) => e.id === edgeId);
      if (!edge) return;

      setEdges((prevEdges) => prevEdges.filter((e) => e.id !== edgeId));

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
    },
    [edges, onSpecUpdate]
  );

  /**
   * Reverse edge direction
   */
  const reverseEdge = useCallback(
    (edgeId: string) => {
      const edge = edges.find((e) => e.id === edgeId);
      if (!edge) return;

      setEdges((prevEdges) =>
        prevEdges.map((e) => {
          if (e.id === edgeId) {
            return {
              ...e,
              id: `e_${e.target}_${e.source}`,
              source: e.target,
              target: e.source,
            };
          }
          return e;
        })
      );

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
    },
    [edges, onSpecUpdate]
  );

  /**
   * Insert a node between two nodes (on an edge)
   */
  const insertNodeBetween = useCallback(
    (
      edgeId: string,
      nodeType: InfraNodeType,
      componentData?: ComponentData,
      addNodeFn?: AddNodeFunction
    ): string | null => {
      if (!addNodeFn) {
        console.warn('insertNodeBetween requires addNodeFn');
        return null;
      }

      const edge = edges.find((e) => e.id === edgeId);
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

      // Remove old edge
      setEdges((prevEdges) => prevEdges.filter((e) => e.id !== edgeId));

      // Create two new edges
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

      setEdges((prevEdges) => [...prevEdges, newEdge1, newEdge2]);

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
    [edges, nodes, onSpecUpdate]
  );

  return {
    edges,
    setEdges,
    deleteEdge,
    reverseEdge,
    insertNodeBetween,
  };
}
