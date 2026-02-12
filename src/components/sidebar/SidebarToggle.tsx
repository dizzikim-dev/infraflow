'use client';

import { PanelLeftOpen } from 'lucide-react';

interface SidebarToggleProps {
  onClick: () => void;
}

export function SidebarToggle({ onClick }: SidebarToggleProps) {
  return (
    <button
      onClick={onClick}
      className="
        fixed top-[22px] left-5 z-[60]
        p-2 rounded-xl
        bg-zinc-900/80 backdrop-blur-xl
        border border-zinc-700/50
        text-zinc-400 hover:text-white
        hover:bg-zinc-800
        shadow-lg shadow-black/30
        transition-all duration-200
      "
      title="사이드바 열기 (Ctrl+B)"
    >
      <PanelLeftOpen className="w-5 h-5" />
    </button>
  );
}
