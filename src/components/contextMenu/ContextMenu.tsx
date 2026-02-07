'use client';

import { memo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Base context menu wrapper component
 * Handles positioning and animation
 */
export const ContextMenu = memo(function ContextMenu({
  isOpen,
  position,
  onClose,
  children,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Adjust position if menu goes off-screen
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = position.x;
    let adjustedY = position.y;

    // Adjust horizontal position if off-screen
    if (position.x + rect.width > viewportWidth) {
      adjustedX = viewportWidth - rect.width - 10;
    }

    // Adjust vertical position if off-screen
    if (position.y + rect.height > viewportHeight) {
      adjustedY = viewportHeight - rect.height - 10;
    }

    if (adjustedX !== position.x || adjustedY !== position.y) {
      menu.style.left = `${adjustedX}px`;
      menu.style.top = `${adjustedY}px`;
    }
  }, [isOpen, position]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          data-context-menu
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          className="fixed z-[100] min-w-[180px] bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden"
          style={{
            left: position.x,
            top: position.y,
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

interface MenuItemProps {
  icon?: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

/**
 * Context menu item component
 */
export const MenuItem = memo(function MenuItem({
  icon,
  label,
  shortcut,
  onClick,
  danger = false,
  disabled = false,
}: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full px-3 py-2 text-left flex items-center gap-3 text-sm
        transition-colors duration-100
        ${disabled
          ? 'text-zinc-500 cursor-not-allowed'
          : danger
            ? 'text-red-400 hover:bg-red-500/20'
            : 'text-zinc-200 hover:bg-zinc-700'
        }
      `}
    >
      {icon && <span className="w-4 h-4 flex items-center justify-center">{icon}</span>}
      <span className="flex-1">{label}</span>
      {shortcut && (
        <span className="text-xs text-zinc-500 ml-2">{shortcut}</span>
      )}
    </button>
  );
});

/**
 * Menu divider component
 */
export const MenuDivider = memo(function MenuDivider() {
  return <div className="h-px bg-zinc-700 my-1" />;
});

/**
 * Menu section header
 */
export const MenuHeader = memo(function MenuHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-1.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">
      {children}
    </div>
  );
});
