'use client';

/**
 * PanelContainer — shared animated side-panel wrapper.
 *
 * Extracts the common motion.div wrapper used by most right-hand panels
 * (BenchmarkPanel, VulnerabilityPanel, CloudCatalogPanel, etc.).
 */

import { motion } from 'framer-motion';

interface PanelContainerProps {
  children: React.ReactNode;
  /** Override the default width class. Defaults to "w-[480px]". */
  widthClass?: string;
}

export function PanelContainer({
  children,
  widthClass = 'w-[480px]',
}: PanelContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={`fixed top-[4.5rem] right-0 h-[calc(100vh-4.5rem)] ${widthClass} bg-zinc-900/95 backdrop-blur-sm border-l border-white/10 z-40 flex flex-col rounded-tl-2xl`}
    >
      {children}
    </motion.div>
  );
}
