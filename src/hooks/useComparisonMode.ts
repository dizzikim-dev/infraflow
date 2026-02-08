'use client';

import { useState, useCallback, useMemo } from 'react';
import { Node, Edge } from '@xyflow/react';
import { InfraSpec, isInfraNodeData } from '@/types';
import { createStateSnapshot } from '@/lib/utils';

export type ComparisonMode = 'before-after' | 'independent';

export interface PanelState {
  label: string;
  spec: InfraSpec | null;
  nodes: Node[];
  edges: Edge[];
}

export interface DiffResult {
  addedNodes: string[];      // Node IDs only in right panel (green)
  removedNodes: string[];    // Node IDs only in left panel (red)
  modifiedNodes: string[];   // Node IDs with different properties (yellow)
  addedEdges: string[];      // Edge IDs only in right
  removedEdges: string[];    // Edge IDs only in left
}

interface ComparisonState {
  isActive: boolean;
  mode: ComparisonMode;
  leftPanel: PanelState;
  rightPanel: PanelState;
  showDiff: boolean;
  syncViewport: boolean;
}

interface UseComparisonModeReturn {
  // State
  isActive: boolean;
  mode: ComparisonMode;
  leftPanel: PanelState;
  rightPanel: PanelState;
  showDiff: boolean;
  syncViewport: boolean;
  diff: DiffResult;

  // Actions
  enterComparisonMode: (currentSpec: InfraSpec | null, currentNodes: Node[], currentEdges: Edge[]) => void;
  exitComparisonMode: () => void;
  setMode: (mode: ComparisonMode) => void;
  toggleDiff: () => void;
  toggleSyncViewport: () => void;
  swapPanels: () => void;
  copyToRight: () => void;
  copyToLeft: () => void;

  // Panel updates
  updateLeftPanel: (spec: InfraSpec | null, nodes: Node[], edges: Edge[]) => void;
  updateRightPanel: (spec: InfraSpec | null, nodes: Node[], edges: Edge[]) => void;
  setLeftLabel: (label: string) => void;
  setRightLabel: (label: string) => void;
}

const emptyPanel: PanelState = {
  label: '',
  spec: null,
  nodes: [],
  edges: [],
};

const initialState: ComparisonState = {
  isActive: false,
  mode: 'before-after',
  leftPanel: { ...emptyPanel, label: '변경 전' },
  rightPanel: { ...emptyPanel, label: '변경 후' },
  showDiff: true,
  syncViewport: false,
};

/**
 * Compute differences between two diagrams
 */
function computeDiff(left: PanelState, right: PanelState): DiffResult {
  const leftNodeIds = new Set(left.nodes.map((n) => n.id));
  const rightNodeIds = new Set(right.nodes.map((n) => n.id));
  const leftEdgeIds = new Set(left.edges.map((e) => e.id));
  const rightEdgeIds = new Set(right.edges.map((e) => e.id));

  // Added nodes: in right but not in left
  const addedNodes = right.nodes
    .filter((n) => !leftNodeIds.has(n.id))
    .map((n) => n.id);

  // Removed nodes: in left but not in right
  const removedNodes = left.nodes
    .filter((n) => !rightNodeIds.has(n.id))
    .map((n) => n.id);

  // Modified nodes: in both but with different properties
  const modifiedNodes: string[] = [];
  left.nodes.forEach((leftNode) => {
    if (rightNodeIds.has(leftNode.id)) {
      const rightNode = right.nodes.find((n) => n.id === leftNode.id);
      if (rightNode && hasNodeChanged(leftNode, rightNode)) {
        modifiedNodes.push(leftNode.id);
      }
    }
  });

  // Added edges
  const addedEdges = right.edges
    .filter((e) => !leftEdgeIds.has(e.id))
    .map((e) => e.id);

  // Removed edges
  const removedEdges = left.edges
    .filter((e) => !rightEdgeIds.has(e.id))
    .map((e) => e.id);

  return {
    addedNodes,
    removedNodes,
    modifiedNodes,
    addedEdges,
    removedEdges,
  };
}

/**
 * Check if a node has changed between versions
 */
function hasNodeChanged(left: Node, right: Node): boolean {
  if (!isInfraNodeData(left.data) || !isInfraNodeData(right.data)) {
    return false;
  }

  const leftData = left.data;
  const rightData = right.data;

  // Compare key properties
  return (
    leftData.label !== rightData.label ||
    leftData.description !== rightData.description ||
    leftData.tier !== rightData.tier ||
    leftData.zone !== rightData.zone
  );
}

/**
 * Deep clone nodes and edges for comparison
 * Wrapper around shared utility for backward compatibility
 */
const clonePanelData = createStateSnapshot;

/**
 * Hook for managing comparison mode state
 */
export function useComparisonMode(): UseComparisonModeReturn {
  const [state, setState] = useState<ComparisonState>(initialState);

  // Enter comparison mode with current diagram as starting point
  const enterComparisonMode = useCallback(
    (currentSpec: InfraSpec | null, currentNodes: Node[], currentEdges: Edge[]) => {
      const cloned = clonePanelData(currentNodes, currentEdges);

      setState({
        isActive: true,
        mode: 'before-after',
        leftPanel: {
          label: '변경 전',
          spec: currentSpec ? { ...currentSpec } : null,
          nodes: cloned.nodes,
          edges: cloned.edges,
        },
        rightPanel: {
          label: '변경 후',
          spec: currentSpec ? { ...currentSpec } : null,
          nodes: clonePanelData(currentNodes, currentEdges).nodes,
          edges: clonePanelData(currentNodes, currentEdges).edges,
        },
        showDiff: true,
        syncViewport: false,
      });
    },
    []
  );

  // Exit comparison mode
  const exitComparisonMode = useCallback(() => {
    setState(initialState);
  }, []);

  // Set comparison mode type
  const setMode = useCallback((mode: ComparisonMode) => {
    setState((prev) => ({
      ...prev,
      mode,
      leftPanel: mode === 'independent'
        ? { ...prev.leftPanel, label: '아키텍처 A' }
        : { ...prev.leftPanel, label: '변경 전' },
      rightPanel: mode === 'independent'
        ? { ...prev.rightPanel, label: '아키텍처 B' }
        : { ...prev.rightPanel, label: '변경 후' },
    }));
  }, []);

  // Toggle diff visualization
  const toggleDiff = useCallback(() => {
    setState((prev) => ({ ...prev, showDiff: !prev.showDiff }));
  }, []);

  // Toggle viewport synchronization
  const toggleSyncViewport = useCallback(() => {
    setState((prev) => ({ ...prev, syncViewport: !prev.syncViewport }));
  }, []);

  // Swap left and right panels
  const swapPanels = useCallback(() => {
    setState((prev) => ({
      ...prev,
      leftPanel: { ...prev.rightPanel },
      rightPanel: { ...prev.leftPanel },
    }));
  }, []);

  // Copy left panel to right
  const copyToRight = useCallback(() => {
    setState((prev) => {
      const cloned = clonePanelData(prev.leftPanel.nodes, prev.leftPanel.edges);
      return {
        ...prev,
        rightPanel: {
          ...prev.rightPanel,
          spec: prev.leftPanel.spec ? { ...prev.leftPanel.spec } : null,
          nodes: cloned.nodes,
          edges: cloned.edges,
        },
      };
    });
  }, []);

  // Copy right panel to left
  const copyToLeft = useCallback(() => {
    setState((prev) => {
      const cloned = clonePanelData(prev.rightPanel.nodes, prev.rightPanel.edges);
      return {
        ...prev,
        leftPanel: {
          ...prev.leftPanel,
          spec: prev.rightPanel.spec ? { ...prev.rightPanel.spec } : null,
          nodes: cloned.nodes,
          edges: cloned.edges,
        },
      };
    });
  }, []);

  // Update left panel
  const updateLeftPanel = useCallback(
    (spec: InfraSpec | null, nodes: Node[], edges: Edge[]) => {
      setState((prev) => ({
        ...prev,
        leftPanel: {
          ...prev.leftPanel,
          spec,
          nodes,
          edges,
        },
      }));
    },
    []
  );

  // Update right panel
  const updateRightPanel = useCallback(
    (spec: InfraSpec | null, nodes: Node[], edges: Edge[]) => {
      setState((prev) => ({
        ...prev,
        rightPanel: {
          ...prev.rightPanel,
          spec,
          nodes,
          edges,
        },
      }));
    },
    []
  );

  // Set panel labels
  const setLeftLabel = useCallback((label: string) => {
    setState((prev) => ({
      ...prev,
      leftPanel: { ...prev.leftPanel, label },
    }));
  }, []);

  const setRightLabel = useCallback((label: string) => {
    setState((prev) => ({
      ...prev,
      rightPanel: { ...prev.rightPanel, label },
    }));
  }, []);

  // Compute diff between panels
  const diff = useMemo(
    () => computeDiff(state.leftPanel, state.rightPanel),
    [state.leftPanel, state.rightPanel]
  );

  return {
    // State
    isActive: state.isActive,
    mode: state.mode,
    leftPanel: state.leftPanel,
    rightPanel: state.rightPanel,
    showDiff: state.showDiff,
    syncViewport: state.syncViewport,
    diff,

    // Actions
    enterComparisonMode,
    exitComparisonMode,
    setMode,
    toggleDiff,
    toggleSyncViewport,
    swapPanels,
    copyToRight,
    copyToLeft,

    // Panel updates
    updateLeftPanel,
    updateRightPanel,
    setLeftLabel,
    setRightLabel,
  };
}

export default useComparisonMode;
