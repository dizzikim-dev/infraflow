'use client';

import { useState, useCallback } from 'react';
import { Node } from '@xyflow/react';
import { PolicyRule, isInfraNodeData, safeGetTier } from '@/types';

export interface SelectedNodeDetail {
  id: string;
  name: string;
  nodeType: string;
  tier: string;
  zone?: string;
  description?: string;
}

export interface SelectedNodePolicy {
  name: string;
  type: string;
  policies: PolicyRule[];
  position: { x: number; y: number };
}

export interface UseInfraSelectionReturn {
  selectedNodeDetail: SelectedNodeDetail | null;
  setSelectedNodeDetail: React.Dispatch<React.SetStateAction<SelectedNodeDetail | null>>;
  selectedNodePolicy: SelectedNodePolicy | null;
  setSelectedNodePolicy: React.Dispatch<React.SetStateAction<SelectedNodePolicy | null>>;
  handleNodeClick: (event: React.MouseEvent, node: Node) => void;
  clearSelection: () => void;
  updateSelectedNodeDetail: (nodeId: string, field: string, value: string) => void;
}

/**
 * Hook for managing node selection state
 * Handles detail panel and policy overlay
 */
export function useInfraSelection(): UseInfraSelectionReturn {
  const [selectedNodeDetail, setSelectedNodeDetail] = useState<SelectedNodeDetail | null>(null);
  const [selectedNodePolicy, setSelectedNodePolicy] = useState<SelectedNodePolicy | null>(null);

  /**
   * Handle node click - show detail panel and policy overlay
   */
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (!isInfraNodeData(node.data)) {
      console.warn('Invalid node data:', node.id);
      return;
    }

    const data = node.data;

    // Show node detail panel
    setSelectedNodeDetail({
      id: node.id,
      name: data.label,
      nodeType: data.nodeType,
      tier: safeGetTier(data),
      zone: data.zone,
      description: data.description,
    });

    // If node has policies, also show policy overlay
    if (data.policies && data.policies.length > 0) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setSelectedNodePolicy({
        name: data.label,
        type: data.nodeType,
        policies: data.policies,
        position: {
          x: rect.left + rect.width / 2,
          y: rect.top,
        },
      });
    }
  }, []);

  /**
   * Clear all selection state
   */
  const clearSelection = useCallback(() => {
    setSelectedNodeDetail(null);
    setSelectedNodePolicy(null);
  }, []);

  /**
   * Update selected node detail when node data changes
   */
  const updateSelectedNodeDetail = useCallback(
    (nodeId: string, field: string, value: string) => {
      setSelectedNodeDetail((prev) => {
        if (prev && prev.id === nodeId) {
          if (field === 'label') {
            return { ...prev, name: value };
          } else if (field === 'description') {
            return { ...prev, description: value };
          }
        }
        return prev;
      });
    },
    []
  );

  return {
    selectedNodeDetail,
    setSelectedNodeDetail,
    selectedNodePolicy,
    setSelectedNodePolicy,
    handleNodeClick,
    clearSelection,
    updateSelectedNodeDetail,
  };
}
