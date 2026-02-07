'use client';

import React, { useState, useCallback, createContext, useContext, type ReactNode } from 'react';
import { Node } from '@xyflow/react';
import { InfraNodeData } from '@/types';

type EditableField = 'label' | 'description';

interface NodeEditingState {
  editingNodeId: string | null;
  editingField: EditableField | null;
}

interface NodeEditingActions {
  startEditing: (nodeId: string, field: EditableField) => void;
  commitEdit: (value: string) => void;
  cancelEdit: () => void;
  isEditing: (nodeId: string, field: EditableField) => boolean;
}

interface NodeEditingContextValue extends NodeEditingState, NodeEditingActions {
  onNodeDataUpdate?: (nodeId: string, field: EditableField, value: string) => void;
}

// Create context for node editing state
const NodeEditingContext = createContext<NodeEditingContextValue | null>(null);

/**
 * Node editing state management hook
 * Provides state and actions for inline node editing
 */
export function useNodeEditing(
  onNodeDataUpdate?: (nodeId: string, field: EditableField, value: string) => void
) {
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<EditableField | null>(null);

  const startEditing = useCallback((nodeId: string, field: EditableField) => {
    setEditingNodeId(nodeId);
    setEditingField(field);
  }, []);

  const commitEdit = useCallback((value: string) => {
    if (editingNodeId && editingField && onNodeDataUpdate) {
      onNodeDataUpdate(editingNodeId, editingField, value);
    }
    setEditingNodeId(null);
    setEditingField(null);
  }, [editingNodeId, editingField, onNodeDataUpdate]);

  const cancelEdit = useCallback(() => {
    setEditingNodeId(null);
    setEditingField(null);
  }, []);

  const isEditing = useCallback((nodeId: string, field: EditableField) => {
    return editingNodeId === nodeId && editingField === field;
  }, [editingNodeId, editingField]);

  return {
    // State
    editingNodeId,
    editingField,
    // Actions
    startEditing,
    commitEdit,
    cancelEdit,
    isEditing,
    // Callback
    onNodeDataUpdate,
  };
}

/**
 * Provider component for node editing context
 */
export function NodeEditingProvider({
  children,
  onNodeDataUpdate,
}: {
  children: ReactNode;
  onNodeDataUpdate?: (nodeId: string, field: EditableField, value: string) => void;
}) {
  const editing = useNodeEditing(onNodeDataUpdate);

  return (
    <NodeEditingContext.Provider value={editing}>
      {children}
    </NodeEditingContext.Provider>
  );
}

/**
 * Hook to access node editing context
 */
export function useNodeEditingContext() {
  const context = useContext(NodeEditingContext);
  if (!context) {
    throw new Error('useNodeEditingContext must be used within NodeEditingProvider');
  }
  return context;
}

/**
 * Helper to update node data in React Flow nodes array
 */
export function updateNodeInArray(
  nodes: Node[],
  nodeId: string,
  field: EditableField,
  value: string
): Node[] {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      const data = node.data as InfraNodeData;
      return {
        ...node,
        data: {
          ...data,
          [field]: value,
        },
      };
    }
    return node;
  });
}

export type { EditableField, NodeEditingState, NodeEditingActions };
export default useNodeEditing;
