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
  const {
    nodes,
    setNodes,
    addNode,
    deleteNode: deleteNodeBase,
    duplicateNode,
    updateNodeData: updateNodeDataBase,
  } = useNodes({
    onSpecUpdate: setCurrentSpec,
    onEdgesUpdate: (updater) => setEdges(updater as React.SetStateAction<Edge[]>),
    onSelectionClear: (nodeId) => {
      if (selectedNodeDetail?.id === nodeId) {
        setSelectedNodeDetail(null);
      }
      setSelectedNodePolicy(null);
    },
  });

  // Edges hook with spec synchronization
  const {
    edges,
    setEdges,
    deleteEdge,
    reverseEdge,
    insertNodeBetween: insertNodeBetweenBase,
  } = useEdges({
    nodes,
    onSpecUpdate: setCurrentSpec,
  });

  // Animation scenario hook
  const {
    currentScenario,
    animationSequence,
    handleScenarioSelect,
    resetAnimation,
  } = useAnimationScenario({ currentSpec });

  // Prompt parser hook
  const {
    isLoading,
    lastResult,
    handlePromptSubmit,
    handleTemplateSelect: handleTemplateSelectBase,
    setLastResult,
  } = usePromptParser({
    currentSpec,
    onNodesUpdate: setNodes,
    onEdgesUpdate: setEdges,
    onSpecUpdate: setCurrentSpec,
    onAnimationReset: resetAnimation,
    onPolicyReset: () => setSelectedNodePolicy(null),
  });

  /**
   * Wrapper for deleteNode that clears selection
   */
  const deleteNode = useCallback(
    (nodeId: string) => {
      deleteNodeBase(nodeId);
    },
    [deleteNodeBase]
  );

  /**
   * Wrapper for updateNodeData that also updates selection
   */
  const updateNodeData = useCallback(
    (nodeId: string, field: 'label' | 'description', value: string) => {
      updateNodeDataBase(nodeId, field, value);
      updateSelectedNodeDetail(nodeId, field, value);
    },
    [updateNodeDataBase, updateSelectedNodeDetail]
  );

  /**
   * Wrapper for insertNodeBetween that passes addNode
   */
  const insertNodeBetween = useCallback(
    (
      edgeId: string,
      nodeType: InfraNodeType,
      componentData?: ComponentData
    ): string | null => {
      return insertNodeBetweenBase(edgeId, nodeType, componentData, addNode);
    },
    [insertNodeBetweenBase, addNode]
  );

  /**
   * Wrapper for handleTemplateSelect that resets animation
   */
  const handleTemplateSelect = useCallback(
    (template: Parameters<typeof handleTemplateSelectBase>[0]) => {
      handleTemplateSelectBase(template);
    },
    [handleTemplateSelectBase]
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
    deleteNode,
    duplicateNode,
    insertNodeBetween,
    deleteEdge,
    reverseEdge,
  };
}
