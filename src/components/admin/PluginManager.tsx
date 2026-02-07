'use client';

/**
 * Plugin Manager Component
 *
 * 플러그인 관리 UI
 * - 설치된 플러그인 목록 표시
 * - 플러그인 활성화/비활성화
 * - 플러그인 정보 상세 보기
 */

import { useState, useMemo } from 'react';
import {
  usePluginList,
  usePluginActions,
  usePluginSystemStatus,
  usePluginSystemReinitialize,
  useNodeConfigs,
  useExporters,
  usePanels,
  useThemes,
} from '@/hooks/usePlugins';
import type { PluginState } from '@/types/plugin';

// ============================================================
// Types
// ============================================================

type TabType = 'plugins' | 'nodes' | 'exporters' | 'panels' | 'themes';

interface PluginCardProps {
  state: PluginState;
  onActivate: (id: string) => Promise<void>;
  onDeactivate: (id: string) => Promise<void>;
}

// ============================================================
// Plugin Card Component
// ============================================================

function PluginCard({ state, onActivate, onDeactivate }: PluginCardProps) {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { plugin, status, error, loadedAt } = state;
  const { metadata } = plugin;

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (status === 'active') {
        await onDeactivate(metadata.id);
      } else {
        await onActivate(metadata.id);
      }
    } finally {
      setLoading(false);
    }
  };

  const statusColor = {
    installed: 'bg-blue-500',
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
    error: 'bg-red-500',
  }[status];

  const statusText = {
    installed: '설치됨',
    active: '활성',
    inactive: '비활성',
    error: '오류',
  }[status];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">{metadata.name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs text-white ${statusColor}`}>
                {statusText}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{metadata.description}</p>
          </div>
          <button
            onClick={handleToggle}
            disabled={loading || metadata.id === 'core'}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}
              ${metadata.id === 'core' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
              ${status === 'active' && metadata.id !== 'core'
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}
            `}
          >
            {loading ? '처리 중...' : status === 'active' ? '비활성화' : '활성화'}
          </button>
        </div>
      </div>

      {/* Meta Info */}
      <div className="px-4 py-3 bg-gray-50 text-sm">
        <div className="flex flex-wrap gap-4">
          <span className="text-gray-600">
            <strong>버전:</strong> {metadata.version}
          </span>
          {metadata.author && (
            <span className="text-gray-600">
              <strong>제작자:</strong> {metadata.author}
            </span>
          )}
          <span className="text-gray-600">
            <strong>ID:</strong> {metadata.id}
          </span>
        </div>
        {loadedAt && (
          <div className="mt-2 text-gray-500 text-xs">
            로드: {new Date(loadedAt).toLocaleString('ko-KR')}
          </div>
        )}
        {error && (
          <div className="mt-2 text-red-600 text-xs">
            오류: {error}
          </div>
        )}
      </div>

      {/* Expand/Collapse */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition flex items-center justify-center gap-1"
      >
        {expanded ? '접기' : '상세 보기'}
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 py-3 border-t border-gray-200 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">노드 확장</h4>
              <p className="text-gray-500">
                {plugin.nodes?.length || 0}개 노드
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">익스포터</h4>
              <p className="text-gray-500">
                {plugin.exporters?.length || 0}개 형식
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">패널</h4>
              <p className="text-gray-500">
                {plugin.panels?.length || 0}개 패널
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">테마</h4>
              <p className="text-gray-500">
                {plugin.themes?.length || 0}개 테마
              </p>
            </div>
          </div>
          {plugin.parsers && (
            <div className="mt-3">
              <h4 className="font-medium text-gray-700 mb-2">파서 확장</h4>
              <p className="text-gray-500">
                {plugin.parsers.patterns?.length || 0}개 패턴,{' '}
                {Object.keys(plugin.parsers.templates || {}).length}개 템플릿
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Tab Content Components
// ============================================================

function NodesTab() {
  const nodeConfigs = useNodeConfigs();
  const [search, setSearch] = useState('');

  const filteredConfigs = useMemo(() => {
    if (!search) return nodeConfigs;
    const lower = search.toLowerCase();
    return nodeConfigs.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.id.toLowerCase().includes(lower) ||
        c.category.toLowerCase().includes(lower)
    );
  }, [nodeConfigs, search]);

  const categories = useMemo(() => {
    const cats = new Set(nodeConfigs.map((c) => c.category));
    return Array.from(cats);
  }, [nodeConfigs]);

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="노드 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4 flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <span
            key={cat}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
          >
            {cat}: {nodeConfigs.filter((c) => c.category === cat).length}
          </span>
        ))}
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">카테고리</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">색상</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredConfigs.map((config) => (
              <tr key={config.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono text-gray-900">{config.id}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{config.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{config.category}</td>
                <td className="px-4 py-3">
                  <span
                    className="inline-block w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: config.color }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 bg-gray-50 text-sm text-gray-500">
          총 {filteredConfigs.length}개 노드
        </div>
      </div>
    </div>
  );
}

function ExportersTab() {
  const exporters = useExporters();

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">형식</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">확장자</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">설명</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {exporters.map((exporter) => (
            <tr key={exporter.format} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-mono text-gray-900">{exporter.format}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{exporter.name}</td>
              <td className="px-4 py-3 text-sm text-gray-500">.{exporter.fileExtension}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{exporter.description || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-3 bg-gray-50 text-sm text-gray-500">
        총 {exporters.length}개 익스포터
      </div>
    </div>
  );
}

function PanelsTab() {
  const panels = usePanels();

  if (panels.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        등록된 패널이 없습니다.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {panels.map((panel) => (
        <div key={panel.id} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{panel.icon}</div>
            <div>
              <h3 className="font-medium text-gray-900">{panel.title}</h3>
              <p className="text-sm text-gray-500">위치: {panel.position}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ThemesTab() {
  const themes = useThemes();

  if (themes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        등록된 테마가 없습니다.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {themes.map((theme) => (
        <div key={theme.id} className="bg-white rounded-lg shadow overflow-hidden">
          <div
            className="h-24"
            style={{ backgroundColor: theme.colors?.background || '#1e293b' }}
          />
          <div className="p-4">
            <h3 className="font-medium text-gray-900">{theme.name}</h3>
            <p className="text-sm text-gray-500">ID: {theme.id}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function PluginManager() {
  const [activeTab, setActiveTab] = useState<TabType>('plugins');
  const { plugins, states, loading, error } = usePluginList();
  const { activate, deactivate } = usePluginActions();
  const status = usePluginSystemStatus();
  const reinitialize = usePluginSystemReinitialize();
  const [reinitializing, setReinitializing] = useState(false);

  const handleReinitialize = async () => {
    setReinitializing(true);
    try {
      await reinitialize();
    } finally {
      setReinitializing(false);
    }
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'plugins', label: '플러그인' },
    { id: 'nodes', label: '노드' },
    { id: 'exporters', label: '익스포터' },
    { id: 'panels', label: '패널' },
    { id: 'themes', label: '테마' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">플러그인 관리</h1>
            <p className="text-gray-600 mt-1">
              InfraFlow 플러그인 시스템을 관리합니다.
            </p>
          </div>
          <button
            onClick={handleReinitialize}
            disabled={reinitializing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {reinitializing ? '재초기화 중...' : '시스템 재초기화'}
          </button>
        </div>

        {/* Status */}
        <div className="mt-4 flex gap-4 text-sm">
          <span className={`flex items-center gap-1 ${status.initialized ? 'text-green-600' : 'text-yellow-600'}`}>
            <span className={`w-2 h-2 rounded-full ${status.initialized ? 'bg-green-500' : 'bg-yellow-500'}`} />
            {status.initialized ? '초기화됨' : '초기화 중'}
          </span>
          <span className="text-gray-500">
            {plugins.length}개 플러그인 등록됨
          </span>
          <span className="text-gray-500">
            {states.filter((s) => s.status === 'active').length}개 활성화됨
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 font-medium text-sm border-b-2 transition
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {/* Content */}
      {!loading && (
        <div>
          {activeTab === 'plugins' && (
            <div className="grid gap-4">
              {states.map((state) => (
                <PluginCard
                  key={state.plugin.metadata.id}
                  state={state}
                  onActivate={activate}
                  onDeactivate={deactivate}
                />
              ))}
            </div>
          )}
          {activeTab === 'nodes' && <NodesTab />}
          {activeTab === 'exporters' && <ExportersTab />}
          {activeTab === 'panels' && <PanelsTab />}
          {activeTab === 'themes' && <ThemesTab />}
        </div>
      )}
    </div>
  );
}
