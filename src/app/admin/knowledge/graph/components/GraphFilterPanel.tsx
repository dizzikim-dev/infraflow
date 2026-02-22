/**
 * GraphFilterPanel — Filter sidebar for the Knowledge Graph admin page.
 *
 * Provides category filters, relationship type filters, and options
 * for the graph visualization.
 */

import {
  type GraphStats,
  CATEGORY_HEX,
  CATEGORY_LABELS,
  RELATIONSHIP_COLORS,
  ALL_CATEGORIES,
  ALL_RELATIONSHIP_TYPES,
} from './types';

// ---------------------------------------------------------------------------
// Filter Sidebar Component
// ---------------------------------------------------------------------------

interface FilterSidebarProps {
  categories: Set<string>;
  relationshipTypes: Set<string>;
  includeIsolated: boolean;
  stats: GraphStats | null;
  isCollapsed: boolean;
  onToggleCategory: (category: string) => void;
  onToggleRelationshipType: (type: string) => void;
  onToggleIncludeIsolated: () => void;
  onToggleCollapsed: () => void;
}

export function GraphFilterPanel({
  categories,
  relationshipTypes,
  includeIsolated,
  stats,
  isCollapsed,
  onToggleCategory,
  onToggleRelationshipType,
  onToggleIncludeIsolated,
  onToggleCollapsed,
}: FilterSidebarProps) {
  if (isCollapsed) {
    return (
      <div className="w-10 bg-white border-r border-gray-200 flex flex-col items-center pt-2">
        <button
          onClick={onToggleCollapsed}
          className="p-1.5 rounded hover:bg-gray-100 transition text-gray-500"
          title="필터 패널 열기"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">필터</h3>
        <button
          onClick={onToggleCollapsed}
          className="p-1 rounded hover:bg-gray-100 transition text-gray-400"
          title="필터 패널 닫기"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Stats summary */}
      {stats && (
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex gap-4 text-xs text-gray-600">
            <div>
              <span className="font-bold text-gray-900 text-sm">{stats.totalNodes}</span>
              <span className="ml-1">컴포넌트</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">{stats.totalEdges}</span>
              <span className="ml-1">관계</span>
            </div>
          </div>
        </div>
      )}

      {/* Category filters */}
      <div className="px-4 py-3 border-b border-gray-100">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          카테고리
        </h4>
        <div className="space-y-1.5">
          {ALL_CATEGORIES.map((cat) => {
            const color = CATEGORY_HEX[cat] || '#6b7280';
            return (
              <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={categories.has(cat)}
                  onChange={() => onToggleCategory(cat)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-700 group-hover:text-gray-900">
                  {CATEGORY_LABELS[cat] || cat}
                </span>
                {stats?.byCategory[cat] != null && (
                  <span className="ml-auto text-[10px] text-gray-400">
                    {stats.byCategory[cat]}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Relationship type filters */}
      <div className="px-4 py-3 border-b border-gray-100">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          관계 유형
        </h4>
        <div className="space-y-1.5">
          {ALL_RELATIONSHIP_TYPES.map((type) => {
            const config = RELATIONSHIP_COLORS[type];
            return (
              <label key={type} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={relationshipTypes.has(type)}
                  onChange={() => onToggleRelationshipType(type)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-xs text-gray-700 group-hover:text-gray-900">
                  {config.label}
                </span>
                {stats?.byRelationshipType[type] != null && (
                  <span className="ml-auto text-[10px] text-gray-400">
                    {stats.byRelationshipType[type]}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Options */}
      <div className="px-4 py-3">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          옵션
        </h4>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeIsolated}
            onChange={onToggleIncludeIsolated}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
          />
          <span className="text-xs text-gray-700">고립된 노드 포함</span>
        </label>
      </div>
    </div>
  );
}
