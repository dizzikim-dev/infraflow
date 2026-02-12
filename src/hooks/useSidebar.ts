'use client';

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'infraflow-sidebar-open';

function getInitialState(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Default to OPEN if never set (first visit)
    return stored === null ? true : stored === 'true';
  } catch {
    return true;
  }
}

export function useSidebar() {
  const [isOpen, setIsOpen] = useState(getInitialState);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(isOpen));
    } catch {
      // ignore
    }
  }, [isOpen]);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  // Ctrl/Cmd+B keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return { isOpen, toggle, open, close } as const;
}
