'use client';

import { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatShortcutKey, type KeyboardShortcut } from '@/hooks';

interface KeyboardShortcutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
  language?: 'en' | 'ko';
}

const categoryOrder: KeyboardShortcut['category'][] = ['navigation', 'editing', 'view', 'action'];

const categoryLabels: Record<KeyboardShortcut['category'], { en: string; ko: string }> = {
  navigation: { en: 'Navigation', ko: '탐색' },
  editing: { en: 'Editing', ko: '편집' },
  view: { en: 'View', ko: '보기' },
  action: { en: 'Actions', ko: '기능' },
};

function KeyboardShortcutsPanelComponent({
  isOpen,
  onClose,
  shortcuts,
  language = 'ko',
}: KeyboardShortcutsPanelProps) {
  // Group shortcuts by category
  const groupedShortcuts = useMemo(() => {
    const groups = new Map<KeyboardShortcut['category'], KeyboardShortcut[]>();

    for (const shortcut of shortcuts) {
      const existing = groups.get(shortcut.category) || [];
      groups.set(shortcut.category, [...existing, shortcut]);
    }

    return groups;
  }, [shortcuts]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-title"
            className="
              fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              w-full max-w-lg max-h-[80vh]
              bg-zinc-900/95 backdrop-blur-xl
              border border-zinc-700/50
              rounded-2xl
              shadow-2xl
              z-50
              overflow-hidden
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h2
                id="shortcuts-title"
                className="text-lg font-semibold text-white"
              >
                {language === 'ko' ? '키보드 단축키' : 'Keyboard Shortcuts'}
              </h2>
              <button
                onClick={onClose}
                className="
                  p-2 rounded-lg
                  text-zinc-400 hover:text-white
                  hover:bg-zinc-800
                  transition-colors
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                "
                aria-label={language === 'ko' ? '닫기' : 'Close'}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6">
              <div className="space-y-6">
                {categoryOrder.map((category) => {
                  const categoryShortcuts = groupedShortcuts.get(category);
                  if (!categoryShortcuts || categoryShortcuts.length === 0) return null;

                  return (
                    <section key={category}>
                      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
                        {categoryLabels[category][language]}
                      </h3>
                      <div className="space-y-2">
                        {categoryShortcuts.map((shortcut, index) => (
                          <div
                            key={`${shortcut.key}-${index}`}
                            className="
                              flex items-center justify-between
                              py-2 px-3
                              rounded-lg
                              bg-zinc-800/50
                              hover:bg-zinc-800
                              transition-colors
                            "
                          >
                            <span className="text-sm text-zinc-200">
                              {language === 'ko' ? shortcut.descriptionKo : shortcut.description}
                            </span>
                            <kbd className="
                              px-2 py-1
                              rounded
                              bg-zinc-700
                              text-xs font-mono text-zinc-300
                              border border-zinc-600
                            ">
                              {formatShortcutKey(shortcut)}
                            </kbd>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>

              {/* Footer hint */}
              <div className="mt-6 pt-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 text-center">
                  {language === 'ko'
                    ? '? 또는 F1을 눌러 이 패널을 열거나 닫을 수 있습니다'
                    : 'Press ? or F1 to open or close this panel'}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export const KeyboardShortcutsPanel = memo(KeyboardShortcutsPanelComponent);
