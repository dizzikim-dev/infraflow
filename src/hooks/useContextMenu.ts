'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { XYPosition } from '@xyflow/react';

export type ContextMenuType = 'canvas' | 'node' | 'edge' | null;

export interface ContextMenuState {
  isOpen: boolean;
  type: ContextMenuType;
  position: { x: number; y: number };  // Screen position for menu
  targetId?: string;                    // Node or edge ID
  canvasPosition?: XYPosition;          // React Flow canvas coordinates
}

interface UseContextMenuReturn {
  menuState: ContextMenuState;
  openCanvasMenu: (screenPos: { x: number; y: number }, canvasPos: XYPosition) => void;
  openNodeMenu: (screenPos: { x: number; y: number }, nodeId: string) => void;
  openEdgeMenu: (screenPos: { x: number; y: number }, edgeId: string) => void;
  closeMenu: () => void;
}

const initialState: ContextMenuState = {
  isOpen: false,
  type: null,
  position: { x: 0, y: 0 },
};

/**
 * Hook for managing context menu state
 * Handles canvas, node, and edge context menus
 */
export function useContextMenu(): UseContextMenuReturn {
  const [menuState, setMenuState] = useState<ContextMenuState>(initialState);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Open context menu for canvas (right-click on empty area)
  const openCanvasMenu = useCallback(
    (screenPos: { x: number; y: number }, canvasPos: XYPosition) => {
      setMenuState({
        isOpen: true,
        type: 'canvas',
        position: screenPos,
        canvasPosition: canvasPos,
      });
    },
    []
  );

  // Open context menu for node (right-click on node)
  const openNodeMenu = useCallback(
    (screenPos: { x: number; y: number }, nodeId: string) => {
      setMenuState({
        isOpen: true,
        type: 'node',
        position: screenPos,
        targetId: nodeId,
      });
    },
    []
  );

  // Open context menu for edge (right-click on edge)
  const openEdgeMenu = useCallback(
    (screenPos: { x: number; y: number }, edgeId: string) => {
      setMenuState({
        isOpen: true,
        type: 'edge',
        position: screenPos,
        targetId: edgeId,
      });
    },
    []
  );

  // Close context menu
  const closeMenu = useCallback(() => {
    setMenuState(initialState);
  }, []);

  // Close menu on click outside or ESC key
  useEffect(() => {
    if (!menuState.isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      // Check if click is outside the menu
      const target = e.target as HTMLElement;
      if (!target.closest('[data-context-menu]')) {
        closeMenu();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };

    // Delay adding listener to prevent immediate close
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuState.isOpen, closeMenu]);

  return {
    menuState,
    openCanvasMenu,
    openNodeMenu,
    openEdgeMenu,
    closeMenu,
  };
}

export default useContextMenu;
