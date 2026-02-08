/**
 * Plugin Registry Tests
 *
 * Tests for the central plugin registry that manages plugin lifecycle,
 * extension caching, and event system.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PluginRegistry } from '@/lib/plugins/registry';
import type {
  InfraFlowPlugin,
  NodeExtension,
  ParserExtension,
  ExporterExtension,
  PanelExtension,
  ThemeExtension,
  RegistryEvent,
} from '@/types/plugin';
import type { NodeConfig } from '@/components/nodes/nodeConfig';

// ============================================================
// Test Fixtures
// ============================================================

const createMockNodeConfig = (id: string): NodeConfig => ({
  id,
  name: `Test ${id}`,
  category: 'security',
  icon: 'Shield',
  color: '#ff0000',
});

const createMockNodeExtension = (id: string): NodeExtension => ({
  config: createMockNodeConfig(id),
  categoryStyle: {
    gradient: 'from-red-500 to-red-600',
    iconBg: 'bg-red-500',
    border: 'border-red-500',
    shadow: 'shadow-red-500/20',
  },
});

const createMockParserExtension = (priority = 0): ParserExtension => ({
  patterns: [
    {
      pattern: /test-pattern/i,
      type: 'test-node',
      label: 'Test Node',
      labelKo: '테스트 노드',
    },
  ],
  templates: {
    'test-template': {
      nodes: [],
      connections: [],
    },
  },
  priority,
});

const createMockExporterExtension = (format: string): ExporterExtension => ({
  name: `${format} Exporter`,
  format,
  fileExtension: `.${format}`,
  export: () => `exported as ${format}`,
});

const createMockPanelExtension = (id: string): PanelExtension => ({
  id,
  title: `Panel ${id}`,
  icon: null,
  component: () => null,
  position: 'left',
  order: 100,
});

const createMockThemeExtension = (id: string): ThemeExtension => ({
  id,
  name: `Theme ${id}`,
  colors: {
    background: '#000000',
    surface: '#111111',
    primary: '#3b82f6',
    secondary: '#6b7280',
    accent: '#8b5cf6',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    border: '#374151',
  },
  categoryStyles: {
    security: {
      gradient: 'from-red-500 to-red-600',
      iconBg: 'bg-red-500',
      border: 'border-red-500',
      shadow: 'shadow-red-500/20',
    },
  },
});

const createMockPlugin = (
  id: string,
  options: {
    nodes?: NodeExtension[];
    parsers?: ParserExtension;
    exporters?: ExporterExtension[];
    panels?: PanelExtension[];
    themes?: ThemeExtension[];
    dependencies?: string[];
    onLoad?: () => Promise<void>;
    onUnload?: () => Promise<void>;
    onConfigChange?: (config: Record<string, unknown>) => void;
  } = {}
): InfraFlowPlugin => ({
  metadata: {
    id,
    name: `Test Plugin ${id}`,
    version: '1.0.0',
    dependencies: options.dependencies,
  },
  nodes: options.nodes,
  parsers: options.parsers,
  exporters: options.exporters,
  panels: options.panels,
  themes: options.themes,
  onLoad: options.onLoad,
  onUnload: options.onUnload,
  onConfigChange: options.onConfigChange,
});

// ============================================================
// Tests
// ============================================================

describe('PluginRegistry', () => {
  let registry: PluginRegistry;

  beforeEach(() => {
    // Reset singleton for each test
    PluginRegistry.resetInstance();
    registry = PluginRegistry.getInstance();
  });

  // ============================================================
  // Singleton Pattern
  // ============================================================

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = PluginRegistry.getInstance();
      const instance2 = PluginRegistry.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should reset instance for testing', () => {
      const instance1 = PluginRegistry.getInstance();
      PluginRegistry.resetInstance();
      const instance2 = PluginRegistry.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  // ============================================================
  // Plugin Registration
  // ============================================================

  describe('register', () => {
    it('should register valid plugin', async () => {
      const plugin = createMockPlugin('test-plugin');
      await registry.register(plugin);

      expect(registry.getPlugin('test-plugin')).toBe(plugin);
    });

    it('should throw on duplicate plugin', async () => {
      const plugin = createMockPlugin('test-plugin');
      await registry.register(plugin);

      await expect(registry.register(plugin)).rejects.toThrow(
        "Plugin 'test-plugin' is already registered"
      );
    });

    it('should check dependencies', async () => {
      const pluginWithDep = createMockPlugin('dependent-plugin', {
        dependencies: ['missing-dep'],
      });

      await expect(registry.register(pluginWithDep)).rejects.toThrow(
        "Plugin 'dependent-plugin' depends on 'missing-dep' which is not registered"
      );
    });

    it('should allow registration with satisfied dependencies', async () => {
      const depPlugin = createMockPlugin('dep-plugin');
      const pluginWithDep = createMockPlugin('dependent-plugin', {
        dependencies: ['dep-plugin'],
      });

      await registry.register(depPlugin);
      await registry.register(pluginWithDep);

      expect(registry.getPlugin('dependent-plugin')).toBeDefined();
    });

    it('should emit plugin:registered event', async () => {
      const listener = vi.fn();
      registry.addEventListener(listener);

      const plugin = createMockPlugin('test-plugin');
      await registry.register(plugin);

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'plugin:registered',
          pluginId: 'test-plugin',
        })
      );
    });

    it('should set initial status to installed', async () => {
      const plugin = createMockPlugin('test-plugin');
      await registry.register(plugin);

      const state = registry.getPluginState('test-plugin');
      expect(state?.status).toBe('installed');
    });
  });

  // ============================================================
  // Plugin Activation
  // ============================================================

  describe('activate', () => {
    it('should activate registered plugin', async () => {
      const plugin = createMockPlugin('test-plugin');
      await registry.register(plugin);
      await registry.activate('test-plugin');

      const state = registry.getPluginState('test-plugin');
      expect(state?.status).toBe('active');
    });

    it('should throw on unregistered plugin', async () => {
      await expect(registry.activate('unknown-plugin')).rejects.toThrow(
        "Plugin 'unknown-plugin' is not registered"
      );
    });

    it('should call onLoad hook', async () => {
      const onLoad = vi.fn().mockResolvedValue(undefined);
      const plugin = createMockPlugin('test-plugin', { onLoad });

      await registry.register(plugin);
      await registry.activate('test-plugin');

      expect(onLoad).toHaveBeenCalled();
    });

    it('should handle onLoad error', async () => {
      const onLoad = vi.fn().mockRejectedValue(new Error('Load failed'));
      const plugin = createMockPlugin('test-plugin', { onLoad });

      await registry.register(plugin);
      await expect(registry.activate('test-plugin')).rejects.toThrow('Load failed');

      const state = registry.getPluginState('test-plugin');
      expect(state?.status).toBe('error');
      expect(state?.error).toBe('Load failed');
    });

    it('should emit plugin:activated event', async () => {
      const listener = vi.fn();
      const plugin = createMockPlugin('test-plugin');

      await registry.register(plugin);
      registry.addEventListener(listener);
      await registry.activate('test-plugin');

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'plugin:activated',
          pluginId: 'test-plugin',
        })
      );
    });

    it('should emit plugin:error event on failure', async () => {
      const listener = vi.fn();
      const onLoad = vi.fn().mockRejectedValue(new Error('Load failed'));
      const plugin = createMockPlugin('test-plugin', { onLoad });

      await registry.register(plugin);
      registry.addEventListener(listener);

      try {
        await registry.activate('test-plugin');
      } catch {
        // Expected
      }

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'plugin:error',
          pluginId: 'test-plugin',
          data: { error: 'Load failed' },
        })
      );
    });

    it('should skip if already active', async () => {
      const onLoad = vi.fn().mockResolvedValue(undefined);
      const plugin = createMockPlugin('test-plugin', { onLoad });

      await registry.register(plugin);
      await registry.activate('test-plugin');
      await registry.activate('test-plugin'); // Second call

      expect(onLoad).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // Plugin Deactivation
  // ============================================================

  describe('deactivate', () => {
    it('should deactivate active plugin', async () => {
      const plugin = createMockPlugin('test-plugin');
      await registry.register(plugin);
      await registry.activate('test-plugin');
      await registry.deactivate('test-plugin');

      const state = registry.getPluginState('test-plugin');
      expect(state?.status).toBe('inactive');
    });

    it('should throw on unregistered plugin', async () => {
      await expect(registry.deactivate('unknown-plugin')).rejects.toThrow(
        "Plugin 'unknown-plugin' is not registered"
      );
    });

    it('should call onUnload hook', async () => {
      const onUnload = vi.fn().mockResolvedValue(undefined);
      const plugin = createMockPlugin('test-plugin', { onUnload });

      await registry.register(plugin);
      await registry.activate('test-plugin');
      await registry.deactivate('test-plugin');

      expect(onUnload).toHaveBeenCalled();
    });

    it('should emit plugin:deactivated event', async () => {
      const listener = vi.fn();
      const plugin = createMockPlugin('test-plugin');

      await registry.register(plugin);
      await registry.activate('test-plugin');
      registry.addEventListener(listener);
      await registry.deactivate('test-plugin');

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'plugin:deactivated',
          pluginId: 'test-plugin',
        })
      );
    });

    it('should skip if not active', async () => {
      const onUnload = vi.fn().mockResolvedValue(undefined);
      const plugin = createMockPlugin('test-plugin', { onUnload });

      await registry.register(plugin);
      await registry.deactivate('test-plugin'); // Not activated yet

      expect(onUnload).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // Plugin Unregistration
  // ============================================================

  describe('unregister', () => {
    it('should unregister plugin', async () => {
      const plugin = createMockPlugin('test-plugin');
      await registry.register(plugin);
      await registry.unregister('test-plugin');

      expect(registry.getPlugin('test-plugin')).toBeUndefined();
    });

    it('should deactivate before unregistering if active', async () => {
      const onUnload = vi.fn().mockResolvedValue(undefined);
      const plugin = createMockPlugin('test-plugin', { onUnload });

      await registry.register(plugin);
      await registry.activate('test-plugin');
      await registry.unregister('test-plugin');

      expect(onUnload).toHaveBeenCalled();
    });

    it('should emit plugin:unregistered event', async () => {
      const listener = vi.fn();
      const plugin = createMockPlugin('test-plugin');

      await registry.register(plugin);
      registry.addEventListener(listener);
      await registry.unregister('test-plugin');

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'plugin:unregistered',
          pluginId: 'test-plugin',
        })
      );
    });

    it('should do nothing for unregistered plugin', async () => {
      // Should not throw
      await registry.unregister('unknown-plugin');
    });
  });

  // ============================================================
  // Plugin Queries
  // ============================================================

  describe('getPlugin', () => {
    it('should return plugin if registered', async () => {
      const plugin = createMockPlugin('test-plugin');
      await registry.register(plugin);

      expect(registry.getPlugin('test-plugin')).toBe(plugin);
    });

    it('should return undefined if not registered', () => {
      expect(registry.getPlugin('unknown-plugin')).toBeUndefined();
    });
  });

  describe('getPluginState', () => {
    it('should return plugin state', async () => {
      const plugin = createMockPlugin('test-plugin');
      await registry.register(plugin);

      const state = registry.getPluginState('test-plugin');
      expect(state).toBeDefined();
      expect(state?.plugin).toBe(plugin);
      expect(state?.status).toBe('installed');
    });
  });

  describe('getAllPlugins', () => {
    it('should return all plugins', async () => {
      const plugin1 = createMockPlugin('plugin-1');
      const plugin2 = createMockPlugin('plugin-2');

      await registry.register(plugin1);
      await registry.register(plugin2);

      const plugins = registry.getAllPlugins();
      expect(plugins).toHaveLength(2);
      expect(plugins).toContain(plugin1);
      expect(plugins).toContain(plugin2);
    });

    it('should return empty array when no plugins', () => {
      expect(registry.getAllPlugins()).toEqual([]);
    });
  });

  describe('getActivePlugins', () => {
    it('should return only active plugins', async () => {
      const plugin1 = createMockPlugin('plugin-1');
      const plugin2 = createMockPlugin('plugin-2');

      await registry.register(plugin1);
      await registry.register(plugin2);
      await registry.activate('plugin-1');
      // plugin-2 is not activated

      const activePlugins = registry.getActivePlugins();
      expect(activePlugins).toHaveLength(1);
      expect(activePlugins).toContain(plugin1);
    });
  });

  // ============================================================
  // Node Extensions
  // ============================================================

  describe('getExtensions', () => {
    describe('node extensions', () => {
      it('should return node extensions from active plugins', async () => {
        const nodeExt = createMockNodeExtension('test-node');
        const plugin = createMockPlugin('test-plugin', { nodes: [nodeExt] });

        await registry.register(plugin);
        await registry.activate('test-plugin');

        const extension = registry.getNodeExtension('test-node');
        expect(extension).toBe(nodeExt);
      });

      it('should not return extensions from inactive plugins', async () => {
        const nodeExt = createMockNodeExtension('test-node');
        const plugin = createMockPlugin('test-plugin', { nodes: [nodeExt] });

        await registry.register(plugin);
        // Not activated

        const extension = registry.getNodeExtension('test-node');
        expect(extension).toBeUndefined();
      });

      it('should return all node configs', async () => {
        const nodeExt1 = createMockNodeExtension('node-1');
        const nodeExt2 = createMockNodeExtension('node-2');
        const plugin = createMockPlugin('test-plugin', { nodes: [nodeExt1, nodeExt2] });

        await registry.register(plugin);
        await registry.activate('test-plugin');

        const configs = registry.getAllNodeConfigs();
        expect(configs).toHaveLength(2);
      });

      it('should return node configs by category', async () => {
        const securityNode = createMockNodeExtension('security-node');
        const plugin = createMockPlugin('test-plugin', { nodes: [securityNode] });

        await registry.register(plugin);
        await registry.activate('test-plugin');

        const securityConfigs = registry.getNodeConfigsByCategory('security');
        expect(securityConfigs).toHaveLength(1);
        expect(securityConfigs[0].id).toBe('security-node');
      });
    });

    describe('parser extensions', () => {
      it('should return parser extensions', async () => {
        const parserExt = createMockParserExtension();
        const plugin = createMockPlugin('test-plugin', { parsers: parserExt });

        await registry.register(plugin);
        await registry.activate('test-plugin');

        const parsers = registry.getParserExtensions();
        expect(parsers).toHaveLength(1);
        expect(parsers[0]).toBe(parserExt);
      });

      it('should sort parser extensions by priority', async () => {
        const lowPriorityParser = createMockParserExtension(0);
        const highPriorityParser = createMockParserExtension(10);

        const plugin1 = createMockPlugin('plugin-1', { parsers: lowPriorityParser });
        const plugin2 = createMockPlugin('plugin-2', { parsers: highPriorityParser });

        await registry.register(plugin1);
        await registry.register(plugin2);
        await registry.activate('plugin-1');
        await registry.activate('plugin-2');

        const parsers = registry.getParserExtensions();
        expect(parsers[0].priority).toBe(10);
        expect(parsers[1].priority).toBe(0);
      });

      it('should return all patterns', async () => {
        const parserExt = createMockParserExtension();
        const plugin = createMockPlugin('test-plugin', { parsers: parserExt });

        await registry.register(plugin);
        await registry.activate('test-plugin');

        const patterns = registry.getAllPatterns();
        expect(patterns).toHaveLength(1);
        expect(patterns[0].type).toBe('test-node');
      });

      it('should return all templates', async () => {
        const parserExt = createMockParserExtension();
        const plugin = createMockPlugin('test-plugin', { parsers: parserExt });

        await registry.register(plugin);
        await registry.activate('test-plugin');

        const templates = registry.getAllTemplates();
        expect(templates['test-template']).toBeDefined();
      });
    });

    describe('exporter extensions', () => {
      it('should return exporter by format', async () => {
        const exporterExt = createMockExporterExtension('terraform');
        const plugin = createMockPlugin('test-plugin', { exporters: [exporterExt] });

        await registry.register(plugin);
        await registry.activate('test-plugin');

        const exporter = registry.getExporter('terraform');
        expect(exporter).toBe(exporterExt);
      });

      it('should return all exporters', async () => {
        const exporterExt1 = createMockExporterExtension('terraform');
        const exporterExt2 = createMockExporterExtension('kubernetes');
        const plugin = createMockPlugin('test-plugin', {
          exporters: [exporterExt1, exporterExt2],
        });

        await registry.register(plugin);
        await registry.activate('test-plugin');

        const exporters = registry.getAllExporters();
        expect(exporters).toHaveLength(2);
      });

      it('should return supported export formats', async () => {
        const exporterExt1 = createMockExporterExtension('terraform');
        const exporterExt2 = createMockExporterExtension('kubernetes');
        const plugin = createMockPlugin('test-plugin', {
          exporters: [exporterExt1, exporterExt2],
        });

        await registry.register(plugin);
        await registry.activate('test-plugin');

        const formats = registry.getSupportedExportFormats();
        expect(formats).toContain('terraform');
        expect(formats).toContain('kubernetes');
      });
    });

    describe('panel extensions', () => {
      it('should return panel by id', async () => {
        const panelExt = createMockPanelExtension('test-panel');
        const plugin = createMockPlugin('test-plugin', { panels: [panelExt] });

        await registry.register(plugin);
        await registry.activate('test-plugin');

        const panel = registry.getPanel('test-panel');
        expect(panel).toBe(panelExt);
      });

      it('should return all panels', async () => {
        const panelExt1 = createMockPanelExtension('panel-1');
        const panelExt2 = createMockPanelExtension('panel-2');
        const plugin = createMockPlugin('test-plugin', {
          panels: [panelExt1, panelExt2],
        });

        await registry.register(plugin);
        await registry.activate('test-plugin');

        const panels = registry.getAllPanels();
        expect(panels).toHaveLength(2);
      });

      it('should return panels by position', async () => {
        const leftPanel: PanelExtension = { ...createMockPanelExtension('left-panel'), position: 'left' };
        const rightPanel: PanelExtension = { ...createMockPanelExtension('right-panel'), position: 'right' };
        const plugin = createMockPlugin('test-plugin', {
          panels: [leftPanel, rightPanel],
        });

        await registry.register(plugin);
        await registry.activate('test-plugin');

        const leftPanels = registry.getPanelsByPosition('left');
        expect(leftPanels).toHaveLength(1);
        expect(leftPanels[0].id).toBe('left-panel');
      });

      it('should sort panels by order', async () => {
        const panel1: PanelExtension = { ...createMockPanelExtension('panel-1'), position: 'left', order: 200 };
        const panel2: PanelExtension = { ...createMockPanelExtension('panel-2'), position: 'left', order: 100 };
        const plugin = createMockPlugin('test-plugin', {
          panels: [panel1, panel2],
        });

        await registry.register(plugin);
        await registry.activate('test-plugin');

        const panels = registry.getPanelsByPosition('left');
        expect(panels[0].id).toBe('panel-2'); // order: 100
        expect(panels[1].id).toBe('panel-1'); // order: 200
      });
    });

    describe('theme extensions', () => {
      it('should return theme by id', async () => {
        const themeExt = createMockThemeExtension('dark-theme');
        const plugin = createMockPlugin('test-plugin', { themes: [themeExt] });

        await registry.register(plugin);
        await registry.activate('test-plugin');

        const theme = registry.getTheme('dark-theme');
        expect(theme).toBe(themeExt);
      });

      it('should return all themes', async () => {
        const theme1 = createMockThemeExtension('theme-1');
        const theme2 = createMockThemeExtension('theme-2');
        const plugin = createMockPlugin('test-plugin', {
          themes: [theme1, theme2],
        });

        await registry.register(plugin);
        await registry.activate('test-plugin');

        const themes = registry.getAllThemes();
        expect(themes).toHaveLength(2);
      });
    });

    describe('cache extensions', () => {
      it('should cache extensions after first access', async () => {
        const nodeExt = createMockNodeExtension('test-node');
        const plugin = createMockPlugin('test-plugin', { nodes: [nodeExt] });

        await registry.register(plugin);
        await registry.activate('test-plugin');

        // First call rebuilds cache
        const extension1 = registry.getNodeExtension('test-node');
        // Second call uses cache
        const extension2 = registry.getNodeExtension('test-node');

        expect(extension1).toBe(extension2);
      });

      it('should invalidate cache when plugin is activated', async () => {
        const nodeExt1 = createMockNodeExtension('node-1');
        const nodeExt2 = createMockNodeExtension('node-2');
        const plugin1 = createMockPlugin('plugin-1', { nodes: [nodeExt1] });
        const plugin2 = createMockPlugin('plugin-2', { nodes: [nodeExt2] });

        await registry.register(plugin1);
        await registry.activate('plugin-1');

        let configs = registry.getAllNodeConfigs();
        expect(configs).toHaveLength(1);

        await registry.register(plugin2);
        await registry.activate('plugin-2');

        configs = registry.getAllNodeConfigs();
        expect(configs).toHaveLength(2);
      });
    });
  });

  // ============================================================
  // Category Styles
  // ============================================================

  describe('getCategoryStyles', () => {
    it('should return category styles from node extensions', async () => {
      const nodeExt = createMockNodeExtension('test-node');
      const plugin = createMockPlugin('test-plugin', { nodes: [nodeExt] });

      await registry.register(plugin);
      await registry.activate('test-plugin');

      const styles = registry.getCategoryStyles();
      expect(styles['security']).toBeDefined();
      expect(styles['security'].gradient).toBe('from-red-500 to-red-600');
    });

    it('should return category styles from theme extensions', async () => {
      const themeExt = createMockThemeExtension('test-theme');
      const plugin = createMockPlugin('test-plugin', { themes: [themeExt] });

      await registry.register(plugin);
      await registry.activate('test-plugin');

      const styles = registry.getCategoryStyles();
      expect(styles['security']).toBeDefined();
    });

    it('should return specific category style', async () => {
      const nodeExt = createMockNodeExtension('test-node');
      const plugin = createMockPlugin('test-plugin', { nodes: [nodeExt] });

      await registry.register(plugin);
      await registry.activate('test-plugin');

      const style = registry.getCategoryStyle('security');
      expect(style).toBeDefined();
      expect(style?.border).toBe('border-red-500');
    });
  });

  // ============================================================
  // Event System
  // ============================================================

  describe('addEventListener', () => {
    it('should add event listener', async () => {
      const listener = vi.fn();
      registry.addEventListener(listener);

      const plugin = createMockPlugin('test-plugin');
      await registry.register(plugin);

      expect(listener).toHaveBeenCalled();
    });

    it('should return unsubscribe function', async () => {
      const listener = vi.fn();
      const unsubscribe = registry.addEventListener(listener);

      unsubscribe();

      const plugin = createMockPlugin('test-plugin');
      await registry.register(plugin);

      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle listener errors gracefully', async () => {
      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const normalListener = vi.fn();

      registry.addEventListener(errorListener);
      registry.addEventListener(normalListener);

      const plugin = createMockPlugin('test-plugin');
      await registry.register(plugin);

      // Should continue to other listeners
      expect(normalListener).toHaveBeenCalled();
    });
  });

  // ============================================================
  // Utility Methods
  // ============================================================

  describe('updatePluginConfig', () => {
    it('should update plugin config', async () => {
      const plugin = createMockPlugin('test-plugin');
      await registry.register(plugin);

      registry.updatePluginConfig('test-plugin', { key: 'value' });

      const config = registry.getPluginConfig('test-plugin');
      expect(config?.key).toBe('value');
    });

    it('should throw for unregistered plugin', () => {
      expect(() => registry.updatePluginConfig('unknown', {})).toThrow(
        "Plugin 'unknown' is not registered"
      );
    });

    it('should call onConfigChange hook', async () => {
      const onConfigChange = vi.fn();
      const plugin = createMockPlugin('test-plugin', { onConfigChange });

      await registry.register(plugin);
      registry.updatePluginConfig('test-plugin', { key: 'value' });

      expect(onConfigChange).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'value' })
      );
    });

    it('should merge config updates', async () => {
      const plugin = createMockPlugin('test-plugin');
      await registry.register(plugin);

      registry.updatePluginConfig('test-plugin', { key1: 'value1' });
      registry.updatePluginConfig('test-plugin', { key2: 'value2' });

      const config = registry.getPluginConfig('test-plugin');
      expect(config?.key1).toBe('value1');
      expect(config?.key2).toBe('value2');
    });
  });

  describe('getSummary', () => {
    it('should return registry summary', async () => {
      const nodeExt = createMockNodeExtension('test-node');
      const exporterExt = createMockExporterExtension('terraform');
      const panelExt = createMockPanelExtension('test-panel');
      const themeExt = createMockThemeExtension('test-theme');

      const plugin = createMockPlugin('test-plugin', {
        nodes: [nodeExt],
        exporters: [exporterExt],
        panels: [panelExt],
        themes: [themeExt],
      });

      await registry.register(plugin);
      await registry.activate('test-plugin');

      const summary = registry.getSummary();
      expect(summary.totalPlugins).toBe(1);
      expect(summary.activePlugins).toBe(1);
      expect(summary.totalNodes).toBe(1);
      expect(summary.totalExporters).toBe(1);
      expect(summary.totalPanels).toBe(1);
      expect(summary.totalThemes).toBe(1);
    });

    it('should return zero counts for empty registry', () => {
      const summary = registry.getSummary();
      expect(summary.totalPlugins).toBe(0);
      expect(summary.activePlugins).toBe(0);
    });
  });
});
