'use client';

import { memo, useState } from 'react';
import { XYPosition } from '@xyflow/react';
import { ContextMenu, MenuItem, MenuDivider } from './ContextMenu';
import { ComponentPicker } from './ComponentPicker';
import { Plus, Undo2, Redo2, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import type { InfraNodeType } from '@/types';
import type { ComponentData } from '@/hooks/useNodes';

interface CanvasContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  canvasPosition: XYPosition;
  onClose: () => void;
  onAddNode: (nodeType: InfraNodeType, canvasPosition: XYPosition, componentData?: ComponentData) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

/**
 * Context menu for canvas right-click (empty area)
 */
export const CanvasContextMenu = memo(function CanvasContextMenu({
  isOpen,
  position,
  canvasPosition,
  onClose,
  onAddNode,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onFitView,
  canUndo = true,
  canRedo = false,
}: CanvasContextMenuProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleAddNodeClick = () => {
    setShowPicker(true);
  };

  const handleComponentSelect = (nodeType: InfraNodeType, componentData: ComponentData) => {
    onAddNode(nodeType, canvasPosition, componentData);
    setShowPicker(false);
    onClose();
  };

  const handlePickerClose = () => {
    setShowPicker(false);
  };

  if (showPicker) {
    return (
      <ComponentPicker
        isOpen={true}
        position={position}
        onSelect={handleComponentSelect}
        onClose={() => {
          handlePickerClose();
          onClose();
        }}
      />
    );
  }

  return (
    <ContextMenu isOpen={isOpen} position={position} onClose={onClose}>
      <div className="py-1">
        <MenuItem
          icon={<Plus size={14} />}
          label="노드 추가"
          onClick={handleAddNodeClick}
        />

        <MenuDivider />

        {onUndo && (
          <MenuItem
            icon={<Undo2 size={14} />}
            label="실행 취소"
            shortcut="Ctrl+Z"
            onClick={() => {
              onUndo();
              onClose();
            }}
            disabled={!canUndo}
          />
        )}
        {onRedo && (
          <MenuItem
            icon={<Redo2 size={14} />}
            label="다시 실행"
            shortcut="Ctrl+Y"
            onClick={() => {
              onRedo();
              onClose();
            }}
            disabled={!canRedo}
          />
        )}

        <MenuDivider />

        {onZoomIn && (
          <MenuItem
            icon={<ZoomIn size={14} />}
            label="확대"
            shortcut="Ctrl++"
            onClick={() => {
              onZoomIn();
              onClose();
            }}
          />
        )}
        {onZoomOut && (
          <MenuItem
            icon={<ZoomOut size={14} />}
            label="축소"
            shortcut="Ctrl+-"
            onClick={() => {
              onZoomOut();
              onClose();
            }}
          />
        )}
        {onFitView && (
          <MenuItem
            icon={<Maximize2 size={14} />}
            label="전체 보기"
            onClick={() => {
              onFitView();
              onClose();
            }}
          />
        )}
      </div>
    </ContextMenu>
  );
});

export default CanvasContextMenu;
