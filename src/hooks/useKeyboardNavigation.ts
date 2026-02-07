import { useCallback, useEffect, useState } from 'react';

export interface KeyboardShortcut {
  key: string;
  modifiers?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  };
  description: string;
  descriptionKo: string;
  category: 'navigation' | 'editing' | 'view' | 'action';
  action: () => void;
}

export interface UseKeyboardNavigationOptions {
  enabled?: boolean;
  shortcuts?: KeyboardShortcut[];
  onHelp?: () => void;
}

export interface UseKeyboardNavigationReturn {
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  shortcuts: KeyboardShortcut[];
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (key: string) => void;
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
}

/**
 * Hook for managing keyboard navigation and shortcuts in the flow canvas.
 * Provides centralized keyboard event handling with accessibility support.
 */
export function useKeyboardNavigation(
  options: UseKeyboardNavigationOptions = {}
): UseKeyboardNavigationReturn {
  const { enabled: initialEnabled = true, shortcuts: initialShortcuts = [], onHelp } = options;

  const [isEnabled, setEnabled] = useState(initialEnabled);
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>(initialShortcuts);
  const [showHelp, setShowHelp] = useState(false);

  // Register a new shortcut
  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts(prev => {
      // Remove existing shortcut with same key combination
      const filtered = prev.filter(s =>
        !(s.key === shortcut.key &&
          JSON.stringify(s.modifiers) === JSON.stringify(shortcut.modifiers))
      );
      return [...filtered, shortcut];
    });
  }, []);

  // Unregister a shortcut by key
  const unregisterShortcut = useCallback((key: string) => {
    setShortcuts(prev => prev.filter(s => s.key !== key));
  }, []);

  // Check if modifiers match
  const checkModifiers = useCallback((
    event: KeyboardEvent,
    modifiers?: KeyboardShortcut['modifiers']
  ) => {
    if (!modifiers) {
      return !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey;
    }

    return (
      (modifiers.ctrl ?? false) === event.ctrlKey &&
      (modifiers.shift ?? false) === event.shiftKey &&
      (modifiers.alt ?? false) === event.altKey &&
      (modifiers.meta ?? false) === event.metaKey
    );
  }, []);

  // Handle keyboard events
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if user is typing in an input or textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Handle help shortcut (? or F1)
      if (event.key === '?' || event.key === 'F1') {
        event.preventDefault();
        if (onHelp) {
          onHelp();
        } else {
          setShowHelp(prev => !prev);
        }
        return;
      }

      // Check for matching shortcuts
      for (const shortcut of shortcuts) {
        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          checkModifiers(event, shortcut.modifiers)
        ) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled, shortcuts, checkModifiers, onHelp]);

  return {
    isEnabled,
    setEnabled,
    shortcuts,
    registerShortcut,
    unregisterShortcut,
    showHelp,
    setShowHelp,
  };
}

// Default shortcuts for the flow canvas
export const defaultCanvasShortcuts: Omit<KeyboardShortcut, 'action'>[] = [
  {
    key: 'Delete',
    description: 'Delete selected element',
    descriptionKo: '선택한 요소 삭제',
    category: 'editing',
  },
  {
    key: 'Backspace',
    description: 'Delete selected element',
    descriptionKo: '선택한 요소 삭제',
    category: 'editing',
  },
  {
    key: 'd',
    modifiers: { ctrl: true },
    description: 'Duplicate selected node',
    descriptionKo: '선택한 노드 복제',
    category: 'editing',
  },
  {
    key: 'z',
    modifiers: { ctrl: true },
    description: 'Undo',
    descriptionKo: '실행 취소',
    category: 'action',
  },
  {
    key: 'z',
    modifiers: { ctrl: true, shift: true },
    description: 'Redo',
    descriptionKo: '다시 실행',
    category: 'action',
  },
  {
    key: 'y',
    modifiers: { ctrl: true },
    description: 'Redo',
    descriptionKo: '다시 실행',
    category: 'action',
  },
  {
    key: 'a',
    modifiers: { ctrl: true },
    description: 'Select all nodes',
    descriptionKo: '모든 노드 선택',
    category: 'navigation',
  },
  {
    key: 'Escape',
    description: 'Clear selection / Close panel',
    descriptionKo: '선택 해제 / 패널 닫기',
    category: 'navigation',
  },
  {
    key: '+',
    modifiers: { ctrl: true },
    description: 'Zoom in',
    descriptionKo: '확대',
    category: 'view',
  },
  {
    key: '-',
    modifiers: { ctrl: true },
    description: 'Zoom out',
    descriptionKo: '축소',
    category: 'view',
  },
  {
    key: '0',
    modifiers: { ctrl: true },
    description: 'Fit view',
    descriptionKo: '화면에 맞추기',
    category: 'view',
  },
  {
    key: 'f',
    modifiers: { ctrl: true },
    description: 'Focus prompt input',
    descriptionKo: '프롬프트 입력에 포커스',
    category: 'navigation',
  },
  {
    key: 't',
    modifiers: { ctrl: true },
    description: 'Open template gallery',
    descriptionKo: '템플릿 갤러리 열기',
    category: 'action',
  },
  {
    key: 'e',
    modifiers: { ctrl: true },
    description: 'Open export panel',
    descriptionKo: '내보내기 패널 열기',
    category: 'action',
  },
  {
    key: '?',
    description: 'Show keyboard shortcuts',
    descriptionKo: '키보드 단축키 보기',
    category: 'navigation',
  },
];

// Helper to format shortcut key for display
export function formatShortcutKey(shortcut: Pick<KeyboardShortcut, 'key' | 'modifiers'>): string {
  const parts: string[] = [];
  const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac');

  if (shortcut.modifiers?.ctrl) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.modifiers?.shift) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  if (shortcut.modifiers?.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }
  if (shortcut.modifiers?.meta) {
    parts.push(isMac ? '⌘' : 'Win');
  }

  // Format special keys
  let keyDisplay = shortcut.key;
  switch (shortcut.key) {
    case 'Delete':
      keyDisplay = isMac ? '⌫' : 'Del';
      break;
    case 'Backspace':
      keyDisplay = isMac ? '⌫' : 'Backspace';
      break;
    case 'Escape':
      keyDisplay = 'Esc';
      break;
    case 'ArrowUp':
      keyDisplay = '↑';
      break;
    case 'ArrowDown':
      keyDisplay = '↓';
      break;
    case 'ArrowLeft':
      keyDisplay = '←';
      break;
    case 'ArrowRight':
      keyDisplay = '→';
      break;
  }

  parts.push(keyDisplay.toUpperCase());

  return parts.join(isMac ? '' : '+');
}
