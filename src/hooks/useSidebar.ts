'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

const STORAGE_KEY = 'infraflow-sidebar-open';

export function useSidebar() {
  // Always start with true (open) for consistent SSR/client hydration
  const [isOpen, setIsOpen] = useState(true);
  const hydrated = useRef(false);

  // After hydration, sync with localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null && stored !== 'true') {
        setIsOpen(false); // eslint-disable-line react-hooks/set-state-in-effect
      }
    } catch {
      // ignore
    }
    hydrated.current = true;
  }, []);

  // Persist to localStorage (skip the initial hydration sync)
  useEffect(() => {
    if (!hydrated.current) return;
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
