'use client';

import { memo, useState } from 'react';
import { ContextMenu, MenuItem, MenuDivider, MenuHeader } from './ContextMenu';
import { Plus, Trash2, ArrowRight } from 'lucide-react';

interface EdgeContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  edgeId: string;
  sourceNodeName?: string;
  targetNodeName?: string;
  onClose: () => void;
  onInsertNode: (edgeId: string) => void;
  onDelete: (edgeId: string) => void;
  onReverse?: (edgeId: string) => void;
}

/**
 * Context menu for edge right-click actions
 */
export const EdgeContextMenu = memo(function EdgeContextMenu({
  isOpen,
  position,
  edgeId,
  sourceNodeName,
  targetNodeName,
  onClose,
  onInsertNode,
  onDelete,
  onReverse,
}: EdgeContextMenuProps) {
  const handleAction = (action: (edgeId: string) => void) => {
    action(edgeId);
    onClose();
  };

  const connectionLabel = sourceNodeName && targetNodeName
    ? `${sourceNodeName} → ${targetNodeName}`
    : '연결';

  return (
    <ContextMenu isOpen={isOpen} position={position} onClose={onClose}>
      <div className="px-3 py-2 text-xs text-zinc-400 border-b border-zinc-700 bg-zinc-800/50 flex items-center gap-2">
        <ArrowRight size={12} />
        <span className="truncate max-w-[200px]">{connectionLabel}</span>
      </div>

      <div className="py-1">
        <MenuItem
          icon={<Plus size={14} />}
          label="중간에 노드 삽입"
          onClick={() => handleAction(onInsertNode)}
        />

        {onReverse && (
          <>
            <MenuDivider />
            <MenuItem
              icon={<ArrowRight size={14} className="rotate-180" />}
              label="방향 반전"
              onClick={() => handleAction(onReverse)}
            />
          </>
        )}

        <MenuDivider />

        <MenuItem
          icon={<Trash2 size={14} />}
          label="연결 삭제"
          onClick={() => handleAction(onDelete)}
          danger
        />
      </div>
    </ContextMenu>
  );
});

export default EdgeContextMenu;
