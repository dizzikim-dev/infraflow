'use client';

import { memo } from 'react';
import { ContextMenu, MenuItem, MenuDivider } from './ContextMenu';
import { Copy, Trash2, Edit3, Eye, Link2, Layers } from 'lucide-react';

interface NodeContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  nodeId: string;
  nodeName?: string;
  onClose: () => void;
  onEdit: (nodeId: string) => void;
  onDuplicate: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onViewDetails: (nodeId: string) => void;
  onConnectFrom?: (nodeId: string) => void;
  onBringToFront?: (nodeId: string) => void;
}

/**
 * Context menu for node right-click actions
 */
export const NodeContextMenu = memo(function NodeContextMenu({
  isOpen,
  position,
  nodeId,
  nodeName,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onViewDetails,
  onConnectFrom,
  onBringToFront,
}: NodeContextMenuProps) {
  const handleAction = (action: (nodeId: string) => void) => {
    action(nodeId);
    onClose();
  };

  return (
    <ContextMenu isOpen={isOpen} position={position} onClose={onClose}>
      {nodeName && (
        <div className="px-3 py-2 text-xs text-zinc-400 border-b border-zinc-700 bg-zinc-800/50">
          {nodeName}
        </div>
      )}

      <div className="py-1">
        <MenuItem
          icon={<Edit3 size={14} />}
          label="이름 편집"
          shortcut="더블클릭"
          onClick={() => handleAction(onEdit)}
        />
        <MenuItem
          icon={<Eye size={14} />}
          label="상세 보기"
          onClick={() => handleAction(onViewDetails)}
        />

        <MenuDivider />

        <MenuItem
          icon={<Copy size={14} />}
          label="복제"
          shortcut="Ctrl+D"
          onClick={() => handleAction(onDuplicate)}
        />
        {onConnectFrom && (
          <MenuItem
            icon={<Link2 size={14} />}
            label="연결 시작"
            onClick={() => handleAction(onConnectFrom)}
          />
        )}
        {onBringToFront && (
          <MenuItem
            icon={<Layers size={14} />}
            label="맨 앞으로"
            onClick={() => handleAction(onBringToFront)}
          />
        )}

        <MenuDivider />

        <MenuItem
          icon={<Trash2 size={14} />}
          label="삭제"
          shortcut="Delete"
          onClick={() => handleAction(onDelete)}
          danger
        />
      </div>
    </ContextMenu>
  );
});

export default NodeContextMenu;
