'use client';

/**
 * PanelHeader — shared header bar for side-panel components.
 *
 * Renders an icon + title on the left and a close (X) button on the right,
 * with a bottom border. Matches the exact className strings used across
 * BenchmarkPanel, VulnerabilityPanel, CloudCatalogPanel, etc.
 */

import { X } from 'lucide-react';

interface PanelHeaderProps {
  /** Lucide icon component (e.g. Gauge, ShieldAlert, Cloud). */
  icon: React.ComponentType<{ className?: string }>;
  /** Tailwind text-color class for the icon. Defaults to "text-blue-400". */
  iconColor?: string;
  /** Panel title displayed next to the icon. */
  title: string;
  /** Called when the close button is clicked. */
  onClose: () => void;
}

export function PanelHeader({
  icon: Icon,
  iconColor = 'text-blue-400',
  title,
  onClose,
}: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-white/10">
      <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
        aria-label="닫기"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
