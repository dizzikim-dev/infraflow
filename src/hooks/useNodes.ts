'use client';

import { useState, useCallback } from 'react';
import { Node, XYPosition } from '@xyflow/react';
import { nanoid } from 'nanoid';
import { InfraNodeType, InfraNodeData, InfraSpec, isInfraNodeData } from '@/types';

export interface UseNodesReturn {
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  addNode: (
    nodeType: InfraNodeType,
    position: XYPosition,
    componentData?: ComponentData
  ) => string | null;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => string | null;
  updateNodeData: (
    nodeId: string,
    field: 'label' | 'description',
    value: string
  ) => void;
}

export interface ComponentData {
  id: string;
  name: string;
  nameKo: string;
  category: string;
  tier: string;
  icon?: string;
}

interface UseNodesConfig {
  onSpecUpdate?: (
    updater: (prevSpec: InfraSpec | null) => InfraSpec | null
  ) => void;
  onEdgesUpdate?: (
    updater: (prevEdges: unknown[]) => unknown[]
  ) => void;
  onSelectionClear?: (nodeId: string) => void;
}

/**
 * Map category string to valid CategoryType
 */
function getCategoryType(
  cat?: string
): 'security' | 'network' | 'compute' | 'cloud' | 'storage' | 'auth' | 'external' | 'zone' {
  const validCategories = ['security', 'network', 'compute', 'cloud', 'storage', 'auth', 'external', 'zone'];
  return validCategories.includes(cat || '')
    ? (cat as 'security' | 'network' | 'compute' | 'cloud' | 'storage' | 'auth' | 'external' | 'zone')
    : 'compute';
}

/**
 * Map tier string to valid TierType
 */
function getTierType(t?: string): 'external' | 'dmz' | 'internal' | 'data' | undefined {
  const validTiers = ['external', 'dmz', 'internal', 'data'];
  return validTiers.includes(t || '')
    ? (t as 'external' | 'dmz' | 'internal' | 'data')
    : 'internal';
}

/**
 * Hook for managing node state and CRUD operations
 * Separated from useInfraState for better modularity
 */
export function useNodes(config: UseNodesConfig = {}): UseNodesReturn {
  const { onSpecUpdate, onEdgesUpdate, onSelectionClear } = config;
  const [nodes, setNodes] = useState<Node[]>([]);

  /**
   * Add a new node at the specified position
   */
  const addNode = useCallback(
    (
      nodeType: InfraNodeType,
      position: XYPosition,
      componentData?: ComponentData
    ): string | null => {
      const nodeId = `${nodeType}_${nanoid(6)}`;

      // Create node data
      const nodeData: InfraNodeData = {
        label: componentData?.nameKo || nodeType,
        nodeType,
        category: getCategoryType(componentData?.category),
        tier: getTierType(componentData?.tier),
        description: '',
      };

      // Create React Flow node
      const newNode: Node = {
        id: nodeId,
        type: nodeType,
        position,
        data: nodeData,
      };

      setNodes((prevNodes) => [...prevNodes, newNode]);

      // Update InfraSpec
      onSpecUpdate?.((prevSpec) => {
        if (!prevSpec) {
          // Create new spec if none exists
          return {
            name: 'New Diagram',
            description: '',
            nodes: [
              {
                id: nodeId,
                type: nodeType,
                label: nodeData.label,
                tier: nodeData.tier,
              },
            ],
            connections: [],
          };
        }
        return {
          ...prevSpec,
          nodes: [
            ...prevSpec.nodes,
            {
              id: nodeId,
              type: nodeType,
              label: nodeData.label,
              tier: nodeData.tier,
            },
          ],
        };
      });

      return nodeId;
    },
    [onSpecUpdate]
  );

  /**
   * Delete a node and its connected edges
   */
  const deleteNode = useCallback(
    (nodeId: string) => {
      // Remove edges connected to this node
      onEdgesUpdate?.((prevEdges) =>
        (prevEdges as { source: string; target: string }[]).filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId
        )
      );

      // Remove the node
      setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId));

      // Update InfraSpec
      onSpecUpdate?.((prevSpec) => {
        if (!prevSpec) return prevSpec;
        return {
          ...prevSpec,
          nodes: prevSpec.nodes.filter((node) => node.id !== nodeId),
          connections: prevSpec.connections.filter(
            (conn) => conn.source !== nodeId && conn.target !== nodeId
          ),
        };
      });

      // Clear selection if deleted node was selected
      onSelectionClear?.(nodeId);
    },
    [onSpecUpdate, onEdgesUpdate, onSelectionClear]
  );

  /**
   * Duplicate a node at an offset position
   */
  const duplicateNode = useCallback(
    (nodeId: string): string | null => {
      const sourceNode = nodes.find((n) => n.id === nodeId);
      if (!sourceNode || !isInfraNodeData(sourceNode.data)) return null;

      const newId = `${sourceNode.data.nodeType}_${nanoid(6)}`;
      const offset = 50;

      const newNode: Node = {
        ...sourceNode,
        id: newId,
        position: {
          x: sourceNode.position.x + offset,
          y: sourceNode.position.y + offset,
        },
        data: {
          ...sourceNode.data,
          label: `${sourceNode.data.label} (복사본)`,
        },
        selected: false,
      };

      setNodes((prevNodes) => [...prevNodes, newNode]);

      // Update InfraSpec
      onSpecUpdate?.((prevSpec) => {
        if (!prevSpec) return prevSpec;
        const sourceSpecNode = prevSpec.nodes.find((n) => n.id === nodeId);
        if (!sourceSpecNode) return prevSpec;

        return {
          ...prevSpec,
          nodes: [
            ...prevSpec.nodes,
            {
              ...sourceSpecNode,
              id: newId,
              label: `${sourceSpecNode.label} (복사본)`,
            },
          ],
        };
      });

      return newId;
    },
    [nodes, onSpecUpdate]
  );

  /**
   * Update node data (label, description, etc.)
   * Updates both React Flow state and InfraSpec
   */
  const updateNodeData = useCallback(
    (nodeId: string, field: 'label' | 'description', value: string) => {
      // Update React Flow nodes
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                [field]: value,
              },
            };
          }
          return node;
        })
      );

      // Update InfraSpec (source of truth)
      onSpecUpdate?.((prevSpec) => {
        if (!prevSpec) return prevSpec;
        return {
          ...prevSpec,
          nodes: prevSpec.nodes.map((node) => {
            if (node.id === nodeId) {
              return {
                ...node,
                [field]: value,
              };
            }
            return node;
          }),
        };
      });
    },
    [onSpecUpdate]
  );

  return {
    nodes,
    setNodes,
    addNode,
    deleteNode,
    duplicateNode,
    updateNodeData,
  };
}
