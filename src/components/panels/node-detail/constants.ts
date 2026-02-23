import type { CategoryColors, TabType } from './types';

/** Category-to-color mapping for node badges and feature tags */
export const categoryColors: Record<string, CategoryColors> = {
  security: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
  network: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  compute: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  cloud: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  storage: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  auth: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  telecom: { bg: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-400' },
  wan: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400' },
  external: { bg: 'bg-zinc-500/10', border: 'border-zinc-500/30', text: 'text-zinc-400' },
};

/** Priority-based color classes for policy badges */
export const priorityColors: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

/** Bilingual tier display labels */
export const tierLabels: Record<string, string> = {
  external: '\uc678\ubd80 (External)',
  dmz: 'DMZ',
  internal: '\ub0b4\ubd80\ub9dd (Internal)',
  data: '\ub370\uc774\ud130 (Data)',
};

/** Tab definitions for the tab bar */
export const tabs: { id: TabType; label: string; icon: string }[] = [
  { id: 'overview', label: '\uac1c\uc694', icon: '\ud83d\udccb' },
  { id: 'technical', label: '\uae30\uc220\uc815\ubcf4', icon: '\ud83d\udd27' },
  { id: 'products', label: '\uc81c\ud488', icon: '\ud83c\udfed' },
];
