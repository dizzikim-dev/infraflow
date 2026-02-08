'use client';

import { useRef, useCallback, useState } from 'react';
import { Node, Edge, XYPosition } from '@xyflow/react';
import { InfraSpec, InfraNodeType } from '@/types';

// Import specialized hooks
import { useNodes, ComponentData } from './useNodes';
import { useEdges } from './useEdges';
import { usePromptParser, ParseResultInfo } from './usePromptParser';
import { useInfraSelection, SelectedNodeDetail, SelectedNodePolicy } from './useInfraSelection';
import { useAnimationScenario } from './useAnimationScenario';

// Re-export types for backward compatibility
export type { ParseResultInfo, SelectedNodeDetail, SelectedNodePolicy };

/**
 * Main infrastructure state management hook
 * Composes specialized hooks for better modularity and testability
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────┐
 * │                      useInfraState                          │
 * │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
 * │  │  useNodes   │  │  useEdges   │  │  usePromptParser    │ │
 * │  └─────────────┘  └─────────────┘  └─────────────────────┘ │
 * │  ┌─────────────────────┐  ┌─────────────────────────────┐  │
 * │  │  useInfraSelection  │  │  useAnimationScenario       │  │
 * │  └─────────────────────┘  └─────────────────────────────┘  │
 * └─────────────────────────────────────────────────────────────┘
 */
export function useInfraState() {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Central spec state (source of truth)
  const [currentSpec, setCurrentSpec] = useState<InfraSpec | null>(null);

  // Selection hook
  const {
    selectedNodeDetail,
    setSelectedNodeDetail,
    selectedNodePolicy,
    setSelectedNodePolicy,
    handleNodeClick,
    clearSelection,
    updateSelectedNodeDetail,
  } = useInfraSelection();

  // Nodes hook with spec synchronization
  const nodesHook = useNodes({
    onSpecUpdate: setCurrentSpec,
    onEdgesUpdate: (updater) => setEdges(updater as React.SetStateAction<Edge[]>),
    onSelectionClear: (nodeId) => {
      if (selectedNodeDetail?.id === nodeId) {
        setSelectedNodeDetail(null);
      }
      setSelectedNodePolicy(null);
    },
  });
  const { nodes, setNodes, addNode, duplicateNode } = nodesHook;

  // Edges hook with spec synchronization
  const edgesHook = useEdges({
    nodes,
    onSpecUpdate: setCurrentSpec,
  });
  const { edges, setEdges, deleteEdge, reverseEdge } = edgesHook;

  // Animation scenario hook
  const {
    currentScenario,
    animationSequence,
    handleScenarioSelect,
    resetAnimation,
  } = useAnimationScenario({ currentSpec });

  // Prompt parser hook
  const parserHook = usePromptParser({
    currentSpec,
    onNodesUpdate: setNodes,
    onEdgesUpdate: setEdges,
    onSpecUpdate: setCurrentSpec,
    onAnimationReset: resetAnimation,
    onPolicyReset: () => setSelectedNodePolicy(null),
  });
  const { isLoading, lastResult, handlePromptSubmit, handleTemplateSelect, setLastResult } = parserHook;

  /**
   * Update node data and sync selection state
   */
  const updateNodeData = useCallback(
    (nodeId: string, field: 'label' | 'description', value: string) => {
      nodesHook.updateNodeData(nodeId, field, value);
      updateSelectedNodeDetail(nodeId, field, value);
    },
    [nodesHook, updateSelectedNodeDetail]
  );

  /**
   * Insert node between two connected nodes
   */
  const insertNodeBetween = useCallback(
    (
      edgeId: string,
      nodeType: InfraNodeType,
      componentData?: ComponentData
    ): string | null => {
      return edgesHook.insertNodeBetween(edgeId, nodeType, componentData, addNode);
    },
    [edgesHook, addNode]
  );

  /**
   * Clear current diagram
   */
  const clearDiagram = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setCurrentSpec(null);
    setLastResult(null);
    resetAnimation();
    clearSelection();
  }, [setNodes, setEdges, setLastResult, resetAnimation, clearSelection]);

  return {
    // Refs
    canvasRef,

    // Core state
    isLoading,
    nodes,
    edges,
    currentSpec,
    lastResult,

    // State setters (for FlowCanvas)
    setNodes,
    setEdges,

    // Animation state
    currentScenario,
    animationSequence,

    // Selection state
    selectedNodeDetail,
    setSelectedNodeDetail,
    selectedNodePolicy,
    setSelectedNodePolicy,

    // Actions
    handlePromptSubmit,
    handleScenarioSelect,
    handleTemplateSelect,
    handleNodeClick,
    clearDiagram,
    updateNodeData,

    // CRUD operations
    addNode,
    deleteNode: nodesHook.deleteNode,
    duplicateNode,
    insertNodeBetween,
    deleteEdge,
    reverseEdge,
  };
}
