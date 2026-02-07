'use client';

/**
 * Plugin Panel Renderer
 *
 * 플러그인 패널을 동적으로 렌더링하는 컴포넌트
 * - 위치(left/right/bottom)별 패널 그룹화
 * - 패널 접기/펼치기
 * - 패널 순서 정렬
 */

import { useState, useMemo, ComponentType, ReactNode, Suspense } from 'react';
import { usePanelsByPosition, usePanels } from '@/hooks/usePlugins';
import type { PanelExtension, PanelProps } from '@/types/plugin';

// ============================================================
// Types
// ============================================================

export interface PluginPanelRendererProps {
  /** 패널 위치 */
  position: 'left' | 'right' | 'bottom';
  /** 기본 접힘 상태 */
  defaultCollapsed?: boolean;
  /** 최소 너비/높이 */
  minSize?: number;
  /** 최대 너비/높이 */
  maxSize?: number;
  /** 클래스명 */
  className?: string;
}

export interface PanelWrapperProps {
  panel: PanelExtension;
  collapsed: boolean;
  onToggle: () => void;
}

// ============================================================
// Panel Wrapper Component
// ============================================================

function PanelWrapper({ panel, collapsed, onToggle }: PanelWrapperProps) {
  const PanelComponent = panel.component as ComponentType<PanelProps>;

  return (
    <div className="border-b border-gray-700 last:border-b-0">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 transition-colors text-left"
      >
        {panel.icon && (
          <span className="text-gray-400">{panel.icon}</span>
        )}
        <span className="flex-1 text-sm font-medium text-gray-200">
          {panel.title}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            collapsed ? '' : 'rotate-180'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Content */}
      {!collapsed && (
        <div className="p-3 bg-gray-850">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
              </div>
            }
          >
            <PanelComponent panelId={panel.id} />
          </Suspense>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function PluginPanelRenderer({
  position,
  defaultCollapsed = false,
  minSize = 200,
  maxSize = 400,
  className = '',
}: PluginPanelRendererProps) {
  const panels = usePanelsByPosition(position);
  const [collapsedPanels, setCollapsedPanels] = useState<Set<string>>(
    new Set()
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 패널 정렬 (order 기준 - 낮을수록 먼저)
  const sortedPanels = useMemo(() => {
    return [...panels].sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
  }, [panels]);

  // 패널 없으면 렌더링 안 함
  if (panels.length === 0) {
    return null;
  }

  const togglePanel = (panelId: string) => {
    setCollapsedPanels((prev) => {
      const next = new Set(prev);
      if (next.has(panelId)) {
        next.delete(panelId);
      } else {
        next.add(panelId);
      }
      return next;
    });
  };

  const isVertical = position === 'left' || position === 'right';
  const sizeStyle = isVertical
    ? { width: sidebarCollapsed ? 48 : minSize }
    : { height: sidebarCollapsed ? 32 : minSize };

  return (
    <div
      className={`
        flex flex-col bg-gray-900 border-gray-700 transition-all duration-200
        ${position === 'left' ? 'border-r' : ''}
        ${position === 'right' ? 'border-l' : ''}
        ${position === 'bottom' ? 'border-t' : ''}
        ${className}
      `}
      style={sizeStyle}
    >
      {/* Collapse Toggle (for sidebar) */}
      {isVertical && (
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex items-center justify-center h-10 border-b border-gray-700 hover:bg-gray-800 transition-colors"
          title={sidebarCollapsed ? '패널 펼치기' : '패널 접기'}
        >
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${
              (position === 'left' && sidebarCollapsed) ||
              (position === 'right' && !sidebarCollapsed)
                ? 'rotate-180'
                : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Panels */}
      {!sidebarCollapsed && (
        <div className="flex-1 overflow-y-auto">
          {sortedPanels.map((panel) => (
            <PanelWrapper
              key={panel.id}
              panel={panel}
              collapsed={collapsedPanels.has(panel.id)}
              onToggle={() => togglePanel(panel.id)}
            />
          ))}
        </div>
      )}

      {/* Collapsed Icons (for sidebar) */}
      {isVertical && sidebarCollapsed && (
        <div className="flex-1 flex flex-col items-center gap-2 py-2">
          {sortedPanels.map((panel) => (
            <button
              key={panel.id}
              onClick={() => {
                setSidebarCollapsed(false);
                setCollapsedPanels((prev) => {
                  const next = new Set(prev);
                  next.delete(panel.id);
                  return next;
                });
              }}
              className="p-2 rounded hover:bg-gray-800 transition-colors"
              title={panel.title}
            >
              {panel.icon || (
                <div className="w-5 h-5 rounded bg-gray-700" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Position-specific Components
// ============================================================

/**
 * 왼쪽 패널 렌더러
 */
export function LeftPanelRenderer(props: Omit<PluginPanelRendererProps, 'position'>) {
  return <PluginPanelRenderer position="left" {...props} />;
}

/**
 * 오른쪽 패널 렌더러
 */
export function RightPanelRenderer(props: Omit<PluginPanelRendererProps, 'position'>) {
  return <PluginPanelRenderer position="right" {...props} />;
}

/**
 * 하단 패널 렌더러
 */
export function BottomPanelRenderer(props: Omit<PluginPanelRendererProps, 'position'>) {
  return <PluginPanelRenderer position="bottom" {...props} />;
}

// ============================================================
// All Panels Overview Component
// ============================================================

/**
 * 모든 패널 개요 (디버그/관리용)
 */
export function AllPanelsOverview() {
  const allPanels = usePanels();

  const grouped = useMemo(() => {
    const groups: Record<string, PanelExtension[]> = {
      left: [],
      right: [],
      bottom: [],
    };

    for (const panel of allPanels) {
      groups[panel.position]?.push(panel);
    }

    return groups;
  }, [allPanels]);

  return (
    <div className="p-4 bg-gray-900 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">
        등록된 패널 ({allPanels.length}개)
      </h3>

      <div className="grid grid-cols-3 gap-4">
        {(['left', 'right', 'bottom'] as const).map((position) => (
          <div key={position} className="bg-gray-800 p-3 rounded">
            <h4 className="text-sm font-medium text-gray-300 mb-2 capitalize">
              {position} ({grouped[position].length})
            </h4>
            <ul className="space-y-1">
              {grouped[position].map((panel) => (
                <li
                  key={panel.id}
                  className="text-xs text-gray-400 flex items-center gap-1"
                >
                  {panel.icon && (
                    <span className="text-gray-500">{panel.icon}</span>
                  )}
                  {panel.title}
                </li>
              ))}
              {grouped[position].length === 0 && (
                <li className="text-xs text-gray-500 italic">없음</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
