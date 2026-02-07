'use client';

/**
 * Plugin Hooks
 *
 * 플러그인 시스템 사용을 위한 React 훅 모음
 */

import { useMemo, useCallback } from 'react';
import {
  usePluginContext,
  usePluginContextOptional,
} from '@/contexts/PluginContext';
import type {
  InfraFlowPlugin,
  PluginState,
  NodeExtension,
  ExporterExtension,
  PanelExtension,
  ThemeExtension,
  CategoryStyle,
} from '@/types/plugin';
import type { NodeConfig } from '@/components/nodes/nodeConfig';

// ============================================================
// Main Hook
// ============================================================

/**
 * 플러그인 시스템 전체 접근
 */
export function usePlugins() {
  return usePluginContext();
}

/**
 * 플러그인 시스템 (선택적 접근)
 *
 * PluginProvider 외부에서도 사용 가능
 */
export function usePluginsOptional() {
  return usePluginContextOptional();
}

// ============================================================
// Plugin Management Hooks
// ============================================================

/**
 * 플러그인 목록
 */
export function usePluginList(): {
  plugins: InfraFlowPlugin[];
  states: PluginState[];
  loading: boolean;
  error: string | null;
} {
  const { plugins, pluginStates, loading, error } = usePluginContext();

  return useMemo(
    () => ({
      plugins,
      states: pluginStates,
      loading,
      error,
    }),
    [plugins, pluginStates, loading, error]
  );
}

/**
 * 특정 플러그인 상태
 */
export function usePluginState(pluginId: string): PluginState | undefined {
  const { pluginStates } = usePluginContext();

  return useMemo(
    () => pluginStates.find((state) => state.plugin.metadata.id === pluginId),
    [pluginStates, pluginId]
  );
}

/**
 * 플러그인 관리 액션
 */
export function usePluginActions() {
  const { registerPlugin, activatePlugin, deactivatePlugin, unregisterPlugin } =
    usePluginContext();

  return useMemo(
    () => ({
      register: registerPlugin,
      activate: activatePlugin,
      deactivate: deactivatePlugin,
      unregister: unregisterPlugin,
    }),
    [registerPlugin, activatePlugin, deactivatePlugin, unregisterPlugin]
  );
}

// ============================================================
// Node Extension Hooks
// ============================================================

/**
 * 노드 설정 목록
 */
export function useNodeConfigs(): NodeConfig[] {
  const { nodeConfigs } = usePluginContext();
  return nodeConfigs;
}

/**
 * 특정 노드 설정
 */
export function useNodeConfig(nodeId: string): NodeConfig | undefined {
  const { getNodeConfig } = usePluginContext();
  return useMemo(() => getNodeConfig(nodeId), [getNodeConfig, nodeId]);
}

/**
 * 카테고리별 노드 설정
 */
export function useNodeConfigsByCategory(
  category: NodeConfig['category']
): NodeConfig[] {
  const { nodeConfigs } = usePluginContext();

  return useMemo(
    () => nodeConfigs.filter((config) => config.category === category),
    [nodeConfigs, category]
  );
}

/**
 * 카테고리 스타일
 */
export function useCategoryStyles(): Record<string, CategoryStyle> {
  const { categoryStyles } = usePluginContext();
  return categoryStyles;
}

/**
 * 특정 카테고리 스타일
 */
export function useCategoryStyle(category: string): CategoryStyle | undefined {
  const { categoryStyles } = usePluginContext();
  return useMemo(() => categoryStyles[category], [categoryStyles, category]);
}

// ============================================================
// Exporter Extension Hooks
// ============================================================

/**
 * 익스포터 목록
 */
export function useExporters(): ExporterExtension[] {
  const { exporters } = usePluginContext();
  return exporters;
}

/**
 * 특정 익스포터
 */
export function useExporter(format: string): ExporterExtension | undefined {
  const { getExporter } = usePluginContext();
  return useMemo(() => getExporter(format), [getExporter, format]);
}

/**
 * 지원 내보내기 형식
 */
export function useSupportedExportFormats(): string[] {
  const { supportedExportFormats } = usePluginContext();
  return supportedExportFormats;
}

/**
 * 내보내기 함수
 */
export function useExport() {
  const { getExporter } = usePluginContext();

  const exportToFormat = useCallback(
    (
      format: string,
      spec: Parameters<ExporterExtension['export']>[0],
      options?: Parameters<ExporterExtension['export']>[1]
    ): string | Blob | null => {
      const exporter = getExporter(format);
      if (!exporter) {
        console.error(`[useExport] Exporter not found for format: ${format}`);
        return null;
      }

      try {
        return exporter.export(spec, options);
      } catch (error) {
        console.error(`[useExport] Export failed for format: ${format}`, error);
        return null;
      }
    },
    [getExporter]
  );

  return { exportToFormat };
}

// ============================================================
// Panel Extension Hooks
// ============================================================

/**
 * 패널 목록
 */
export function usePanels(): PanelExtension[] {
  const { panels } = usePluginContext();
  return panels;
}

/**
 * 위치별 패널
 */
export function usePanelsByPosition(
  position: PanelExtension['position']
): PanelExtension[] {
  const { getPanelsByPosition } = usePluginContext();
  return useMemo(
    () => getPanelsByPosition(position),
    [getPanelsByPosition, position]
  );
}

/**
 * 왼쪽 패널
 */
export function useLeftPanels(): PanelExtension[] {
  return usePanelsByPosition('left');
}

/**
 * 오른쪽 패널
 */
export function useRightPanels(): PanelExtension[] {
  return usePanelsByPosition('right');
}

/**
 * 하단 패널
 */
export function useBottomPanels(): PanelExtension[] {
  return usePanelsByPosition('bottom');
}

// ============================================================
// Theme Extension Hooks
// ============================================================

/**
 * 테마 목록
 */
export function useThemes(): ThemeExtension[] {
  const { themes } = usePluginContext();
  return themes;
}

/**
 * 특정 테마
 */
export function useTheme(themeId: string): ThemeExtension | undefined {
  const { getTheme } = usePluginContext();
  return useMemo(() => getTheme(themeId), [getTheme, themeId]);
}

/**
 * 현재 테마
 */
export function useCurrentTheme(): ThemeExtension | null {
  const { currentTheme } = usePluginContext();
  return currentTheme;
}

/**
 * 테마 변경
 */
export function useThemeSwitcher(): {
  currentTheme: ThemeExtension | null;
  themes: ThemeExtension[];
  setTheme: (themeId: string) => void;
} {
  const { currentTheme, themes, setTheme } = usePluginContext();

  return useMemo(
    () => ({
      currentTheme,
      themes,
      setTheme,
    }),
    [currentTheme, themes, setTheme]
  );
}

// ============================================================
// Utility Hooks
// ============================================================

/**
 * 플러그인 시스템 초기화 상태
 */
export function usePluginSystemStatus(): {
  initialized: boolean;
  loading: boolean;
  error: string | null;
} {
  const { initialized, loading, error } = usePluginContext();

  return useMemo(
    () => ({
      initialized,
      loading,
      error,
    }),
    [initialized, loading, error]
  );
}

/**
 * 플러그인 시스템 재초기화
 */
export function usePluginSystemReinitialize(): () => Promise<void> {
  const { reinitialize } = usePluginContext();
  return reinitialize;
}

/**
 * 레지스트리 직접 접근 (고급 사용)
 */
export function usePluginRegistry() {
  const { registry } = usePluginContext();
  return registry;
}
