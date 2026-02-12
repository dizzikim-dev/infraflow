'use client';

/**
 * Plugin Context
 *
 * 플러그인 시스템을 React 컴포넌트 트리에 제공하는 Context
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { PluginRegistry, pluginRegistry } from '@/lib/plugins/registry';
import { corePlugin } from '@/lib/plugins/core-plugin';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('PluginContext');
import type {
  InfraFlowPlugin,
  PluginState,
  NodeExtension,
  ExporterExtension,
  PanelExtension,
  ThemeExtension,
  CategoryStyle,
  RegistryEvent,
} from '@/types/plugin';
import type { NodeConfig } from '@/components/nodes/nodeConfig';

// ============================================================
// Context Types
// ============================================================

export interface PluginContextValue {
  /** 레지스트리 인스턴스 */
  registry: PluginRegistry;

  /** 초기화 상태 */
  initialized: boolean;

  /** 로딩 상태 */
  loading: boolean;

  /** 에러 */
  error: string | null;

  // ============================================================
  // Plugin Management
  // ============================================================

  /** 모든 플러그인 */
  plugins: InfraFlowPlugin[];

  /** 플러그인 상태 목록 */
  pluginStates: PluginState[];

  /** 플러그인 등록 */
  registerPlugin: (plugin: InfraFlowPlugin) => Promise<void>;

  /** 플러그인 활성화 */
  activatePlugin: (pluginId: string) => Promise<void>;

  /** 플러그인 비활성화 */
  deactivatePlugin: (pluginId: string) => Promise<void>;

  /** 플러그인 해제 */
  unregisterPlugin: (pluginId: string) => Promise<void>;

  // ============================================================
  // Node Extensions
  // ============================================================

  /** 모든 노드 설정 */
  nodeConfigs: NodeConfig[];

  /** 노드 설정 조회 */
  getNodeConfig: (nodeId: string) => NodeConfig | undefined;

  /** 카테고리 스타일 */
  categoryStyles: Record<string, CategoryStyle>;

  // ============================================================
  // Exporter Extensions
  // ============================================================

  /** 모든 익스포터 */
  exporters: ExporterExtension[];

  /** 익스포터 조회 */
  getExporter: (format: string) => ExporterExtension | undefined;

  /** 지원 형식 목록 */
  supportedExportFormats: string[];

  // ============================================================
  // Panel Extensions
  // ============================================================

  /** 모든 패널 */
  panels: PanelExtension[];

  /** 위치별 패널 */
  getPanelsByPosition: (position: PanelExtension['position']) => PanelExtension[];

  // ============================================================
  // Theme Extensions
  // ============================================================

  /** 모든 테마 */
  themes: ThemeExtension[];

  /** 테마 조회 */
  getTheme: (themeId: string) => ThemeExtension | undefined;

  /** 현재 테마 */
  currentTheme: ThemeExtension | null;

  /** 테마 변경 */
  setTheme: (themeId: string) => void;

  // ============================================================
  // Utility
  // ============================================================

  /** 시스템 재초기화 */
  reinitialize: () => Promise<void>;
}

// ============================================================
// Context
// ============================================================

const PluginContext = createContext<PluginContextValue | null>(null);

// ============================================================
// Provider Props
// ============================================================

export interface PluginProviderProps {
  children: ReactNode;
  /** 자동 초기화 여부 (기본: true) */
  autoInitialize?: boolean;
  /** 추가 플러그인 */
  plugins?: InfraFlowPlugin[];
  /** 기본 테마 ID */
  defaultThemeId?: string;
}

// ============================================================
// Provider Component
// ============================================================

export function PluginProvider({
  children,
  autoInitialize = true,
  plugins: additionalPlugins = [],
  defaultThemeId,
}: PluginProviderProps) {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentThemeId, setCurrentThemeId] = useState<string | null>(defaultThemeId ?? null);

  // 싱글톤 레지스트리를 state로 래핑 → React deps에 안전하게 포함 가능
  const [registry] = useState(() => pluginRegistry);

  // 상태 변경 추적용
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // ============================================================
  // Initialization
  // ============================================================

  const initialize = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 코어 플러그인 등록 및 활성화
      if (!registry.getPlugin('core')) {
        await registry.register(corePlugin);
        await registry.activate('core');
      }

      // 추가 플러그인 등록 및 활성화
      for (const plugin of additionalPlugins) {
        if (!registry.getPlugin(plugin.metadata.id)) {
          await registry.register(plugin);
          await registry.activate(plugin.metadata.id);
        }
      }

      setInitialized(true);
      setUpdateTrigger((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize plugin system');
      log.error('Plugin system initialization failed', err instanceof Error ? err : undefined);
    } finally {
      setLoading(false);
    }
  }, [additionalPlugins, registry]);

  useEffect(() => {
    if (autoInitialize && !initialized) {
      initialize();
    }
  }, [autoInitialize, initialize, initialized]);

  // ============================================================
  // Event Listener
  // ============================================================

  useEffect(() => {
    const unsubscribe = registry.addEventListener((event: RegistryEvent) => {
      // 상태 변경 시 리렌더링 트리거
      setUpdateTrigger((prev) => prev + 1);

      // 에러 이벤트 처리
      if (event.type === 'plugin:error') {
        const errData = event.data as Record<string, unknown> | undefined;
        const errValue = errData?.error;
        log.error(`Plugin error: ${event.pluginId}`, errValue instanceof Error ? errValue : undefined);
      }
    });

    return unsubscribe;
  }, [registry]);

  // ============================================================
  // Plugin Management
  // ============================================================

  const registerPlugin = useCallback(async (plugin: InfraFlowPlugin) => {
    await registry.register(plugin);
    await registry.activate(plugin.metadata.id);
  }, [registry]);

  const activatePlugin = useCallback(async (pluginId: string) => {
    await registry.activate(pluginId);
  }, [registry]);

  const deactivatePlugin = useCallback(async (pluginId: string) => {
    await registry.deactivate(pluginId);
  }, [registry]);

  const unregisterPlugin = useCallback(async (pluginId: string) => {
    await registry.unregister(pluginId);
  }, [registry]);

  const reinitialize = useCallback(async () => {
    PluginRegistry.resetInstance();
    await initialize();
  }, [initialize]);

  // ============================================================
  // Memoized Values
  // ============================================================

  // updateTrigger + registry를 dependency array로 사용하여 레지스트리 변경 시 재계산
  const plugins = useMemo(
    () => registry.getAllPlugins(),
    [registry, updateTrigger]
  );

  const pluginStates = useMemo(
    () => registry.getAllPluginStates(),
    [registry, updateTrigger]
  );

  const nodeConfigs = useMemo(
    () => registry.getAllNodeConfigs(),
    [registry, updateTrigger]
  );

  const getNodeConfig = useCallback(
    (nodeId: string) => registry.getNodeConfig(nodeId),
    [registry, updateTrigger]
  );

  const categoryStyles = useMemo(
    () => registry.getCategoryStyles(),
    [registry, updateTrigger]
  );

  const exporters = useMemo(
    () => registry.getAllExporters(),
    [registry, updateTrigger]
  );

  const getExporter = useCallback(
    (format: string) => registry.getExporter(format),
    [registry, updateTrigger]
  );

  const supportedExportFormats = useMemo(
    () => registry.getSupportedExportFormats(),
    [registry, updateTrigger]
  );

  const panels = useMemo(
    () => registry.getAllPanels(),
    [registry, updateTrigger]
  );

  const getPanelsByPosition = useCallback(
    (position: PanelExtension['position']) => registry.getPanelsByPosition(position),
    [registry, updateTrigger]
  );

  const themes = useMemo(
    () => registry.getAllThemes(),
    [registry, updateTrigger]
  );

  const getTheme = useCallback(
    (themeId: string) => registry.getTheme(themeId),
    [registry, updateTrigger]
  );

  const currentTheme = useMemo(() => {
    if (!currentThemeId) return null;
    return registry.getTheme(currentThemeId) ?? null;
  }, [registry, currentThemeId, updateTrigger]);

  const setTheme = useCallback((themeId: string) => {
    setCurrentThemeId(themeId);
  }, []);

  // ============================================================
  // Context Value
  // ============================================================

  const value = useMemo<PluginContextValue>(
    () => ({
      registry,
      initialized,
      loading,
      error,

      // Plugin Management
      plugins,
      pluginStates,
      registerPlugin,
      activatePlugin,
      deactivatePlugin,
      unregisterPlugin,

      // Node Extensions
      nodeConfigs,
      getNodeConfig,
      categoryStyles,

      // Exporter Extensions
      exporters,
      getExporter,
      supportedExportFormats,

      // Panel Extensions
      panels,
      getPanelsByPosition,

      // Theme Extensions
      themes,
      getTheme,
      currentTheme,
      setTheme,

      // Utility
      reinitialize,
    }),
    [
      initialized,
      loading,
      error,
      plugins,
      pluginStates,
      registerPlugin,
      activatePlugin,
      deactivatePlugin,
      unregisterPlugin,
      nodeConfigs,
      getNodeConfig,
      categoryStyles,
      exporters,
      getExporter,
      supportedExportFormats,
      panels,
      getPanelsByPosition,
      themes,
      getTheme,
      currentTheme,
      setTheme,
      reinitialize,
    ]
  );

  return (
    <PluginContext.Provider value={value}>
      {children}
    </PluginContext.Provider>
  );
}

// ============================================================
// Hook
// ============================================================

/**
 * 플러그인 컨텍스트 사용
 *
 * @throws PluginProvider 외부에서 사용 시 에러
 */
export function usePluginContext(): PluginContextValue {
  const context = useContext(PluginContext);
  if (!context) {
    throw new Error('usePluginContext must be used within a PluginProvider');
  }
  return context;
}

/**
 * 플러그인 컨텍스트 (선택적)
 *
 * PluginProvider 외부에서도 사용 가능 (null 반환)
 */
export function usePluginContextOptional(): PluginContextValue | null {
  return useContext(PluginContext);
}
