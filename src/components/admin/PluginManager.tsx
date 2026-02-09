'use client';

/**
 * Plugin Manager Component
 *
 * 플러그인 관리 UI 오케스트레이터
 * - 설치된 플러그인 목록 표시
 * - 플러그인 활성화/비활성화
 * - 탭별 상세 정보 표시
 *
 * Sub-components:
 * - PluginCard: 개별 플러그인 카드 (PluginCard.tsx)
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
import { PluginCard } from './PluginCard';

// ============================================================
// Types
// ============================================================

type TabType = 'plugins' | 'nodes' | 'exporters' | 'panels' | 'themes';

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
          className="w-full px-4 py-2 border border-zinc-600 rounded-lg bg-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4 flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <span
            key={cat}
            className="px-3 py-1 bg-zinc-700 text-zinc-300 rounded-full text-sm"
          >
            {cat}: {nodeConfigs.filter((c) => c.category === cat).length}
          </span>
        ))}
      </div>
      <div className="bg-zinc-800 rounded-lg shadow overflow-hidden border border-zinc-700">
        <table className="min-w-full divide-y divide-zinc-700">
          <thead className="bg-zinc-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">이름</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">카테고리</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">색상</th>
            </tr>
          </thead>
          <tbody className="bg-zinc-800 divide-y divide-zinc-700">
            {filteredConfigs.map((config) => (
              <tr key={config.id} className="hover:bg-zinc-700/50">
                <td className="px-4 py-3 text-sm font-mono text-zinc-200">{config.id}</td>
                <td className="px-4 py-3 text-sm text-zinc-200">{config.name}</td>
                <td className="px-4 py-3 text-sm text-zinc-400">{config.category}</td>
                <td className="px-4 py-3">
                  <span
                    className="inline-block w-6 h-6 rounded border border-zinc-600"
                    style={{ backgroundColor: config.color }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 bg-zinc-800/50 text-sm text-zinc-500">
          총 {filteredConfigs.length}개 노드
        </div>
      </div>
    </div>
  );
}

function ExportersTab() {
  const exporters = useExporters();

  return (
    <div className="bg-zinc-800 rounded-lg shadow overflow-hidden border border-zinc-700">
      <table className="min-w-full divide-y divide-zinc-700">
        <thead className="bg-zinc-800/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">형식</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">이름</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">확장자</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">설명</th>
          </tr>
        </thead>
        <tbody className="bg-zinc-800 divide-y divide-zinc-700">
          {exporters.map((exporter) => (
            <tr key={exporter.format} className="hover:bg-zinc-700/50">
              <td className="px-4 py-3 text-sm font-mono text-zinc-200">{exporter.format}</td>
              <td className="px-4 py-3 text-sm text-zinc-200">{exporter.name}</td>
              <td className="px-4 py-3 text-sm text-zinc-400">.{exporter.fileExtension}</td>
              <td className="px-4 py-3 text-sm text-zinc-400">{exporter.description || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-3 bg-zinc-800/50 text-sm text-zinc-500">
        총 {exporters.length}개 익스포터
      </div>
    </div>
  );
}

function PanelsTab() {
  const panels = usePanels();

  if (panels.length === 0) {
    return (
      <div className="bg-zinc-800 rounded-lg shadow p-8 text-center text-zinc-500 border border-zinc-700">
        등록된 패널이 없습니다.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {panels.map((panel) => (
        <div key={panel.id} className="bg-zinc-800 rounded-lg shadow p-4 border border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{panel.icon}</div>
            <div>
              <h3 className="font-medium text-zinc-100">{panel.title}</h3>
              <p className="text-sm text-zinc-400">위치: {panel.position}</p>
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
      <div className="bg-zinc-800 rounded-lg shadow p-8 text-center text-zinc-500 border border-zinc-700">
        등록된 테마가 없습니다.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {themes.map((theme) => (
        <div key={theme.id} className="bg-zinc-800 rounded-lg shadow overflow-hidden border border-zinc-700">
          <div
            className="h-24"
            style={{ backgroundColor: theme.colors?.background || '#1e293b' }}
          />
          <div className="p-4">
            <h3 className="font-medium text-zinc-100">{theme.name}</h3>
            <p className="text-sm text-zinc-400">ID: {theme.id}</p>
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
            <h1 className="text-2xl font-bold text-zinc-100">플러그인 관리</h1>
            <p className="text-zinc-400 mt-1">
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
          <span className={`flex items-center gap-1 ${status.initialized ? 'text-green-400' : 'text-yellow-400'}`}>
            <span className={`w-2 h-2 rounded-full ${status.initialized ? 'bg-green-500' : 'bg-yellow-500'}`} />
            {status.initialized ? '초기화됨' : '초기화 중'}
          </span>
          <span className="text-zinc-400">
            {plugins.length}개 플러그인 등록됨
          </span>
          <span className="text-zinc-400">
            {states.filter((s) => s.status === 'active').length}개 활성화됨
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-700 mb-6">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 font-medium text-sm border-b-2 transition
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
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
