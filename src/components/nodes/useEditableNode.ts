'use client';

import { useCallback } from 'react';
import { useNodeId } from '@xyflow/react';
import { useNodeEditingContext } from '@/hooks/useNodeEditing';

/**
 * Hook for making nodes editable
 * Uses React Context to get editing state and callbacks
 * Falls back gracefully if context is not available
 */
export function useEditableNode() {
  const nodeId = useNodeId();

  // Try to get context, but don't error if not available (for backward compatibility)
  let editingContext: ReturnType<typeof useNodeEditingContext> | null = null;
  try {
    editingContext = useNodeEditingContext();
  } catch {
    // Context not available, editing disabled
  }

  const isEditingLabel = editingContext?.editingNodeId === nodeId && editingContext?.editingField === 'label';
  const isEditingDescription = editingContext?.editingNodeId === nodeId && editingContext?.editingField === 'description';

  const onStartEditLabel = useCallback(() => {
    if (nodeId && editingContext?.startEditing) {
      editingContext.startEditing(nodeId, 'label');
    }
  }, [nodeId, editingContext]);

  const onStartEditDescription = useCallback(() => {
    if (nodeId && editingContext?.startEditing) {
      editingContext.startEditing(nodeId, 'description');
    }
  }, [nodeId, editingContext]);

  const onCommitEdit = useCallback((field: 'label' | 'description', value: string) => {
    editingContext?.commitEdit(value);
  }, [editingContext]);

  const onCancelEdit = useCallback(() => {
    editingContext?.cancelEdit();
  }, [editingContext]);

  return {
    isEditingLabel,
    isEditingDescription,
    onStartEditLabel: editingContext ? onStartEditLabel : undefined,
    onStartEditDescription: editingContext ? onStartEditDescription : undefined,
    onCommitEdit: editingContext ? onCommitEdit : undefined,
    onCancelEdit: editingContext ? onCancelEdit : undefined,
  };
}

export default useEditableNode;
