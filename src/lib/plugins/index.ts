/**
 * Plugin System Module
 *
 * InfraFlow 플러그인 시스템 진입점
 */

// Registry
export { PluginRegistry, pluginRegistry } from './registry';

// Core Plugin
export {
  corePlugin,
  coreNodeExtensions,
  coreNodeTypePatterns,
  coreParserExtension,
  coreCategoryStyles,
} from './core-plugin';

// Loader
export {
  PluginLoader,
  pluginLoader,
  loadPlugin,
  loadPlugins,
  loadPluginFromURL,
  type PluginManifest,
  type PluginLoadResult,
  type LoaderOptions,
} from './loader';

// Validator
export {
  validatePlugin,
  validateMetadata,
  validateNodeExtensions,
  validateExporterExtensions,
  validatePanelExtensions,
  validateThemeExtensions,
  validateParserExtension,
  isValidPlugin,
  isValidMetadata,
  type ValidationResult as ValidatorResult,
  type ValidationOptions,
} from './validator';

// Theme Manager
export {
  ThemeManager,
  themeManager,
  applyTheme,
  getCurrentTheme,
  getAllThemes,
  themeColorsToCSSVariables,
  categoryStylesToCSSVariables,
  type ThemeManagerOptions,
} from './themeManager';

// Re-export types
export type {
  InfraFlowPlugin,
  PluginMetadata,
  PluginState,
  PluginStatus,
  NodeExtension,
  ParserExtension,
  ExporterExtension,
  PanelExtension,
  ThemeExtension,
  CategoryStyle,
  NodeTypePattern,
  BaseNodeProps,
  PanelProps,
  ValidationResult,
  RegistryEvent,
  RegistryEventType,
  RegistryEventListener,
} from '@/types/plugin';

/**
 * 플러그인 시스템 초기화
 *
 * 앱 시작 시 호출하여 코어 플러그인 등록 및 활성화
 */
export async function initializePluginSystem(): Promise<void> {
  const { pluginRegistry } = await import('./registry');
  const { corePlugin } = await import('./core-plugin');

  // 코어 플러그인 등록 및 활성화
  if (!pluginRegistry.getPlugin('core')) {
    await pluginRegistry.register(corePlugin);
    await pluginRegistry.activate('core');
  }

  log.info('Initialized with core plugin');
}

/**
 * 플러그인 시스템 상태 확인
 */
export function getPluginSystemStatus(): {
  initialized: boolean;
  corePluginActive: boolean;
  summary: ReturnType<PluginRegistry['getSummary']>;
} {
  const { pluginRegistry } = require('./registry');
  const coreState = pluginRegistry.getPluginState('core');

  return {
    initialized: !!coreState,
    corePluginActive: coreState?.status === 'active',
    summary: pluginRegistry.getSummary(),
  };
}

// Type import for getSummary return type
import type { PluginRegistry } from './registry';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('PluginSystem');
