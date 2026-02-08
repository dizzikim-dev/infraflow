/**
 * Plugin Validator Tests
 *
 * Tests for plugin validation including structure, type, and security checks.
 */

import { describe, it, expect } from 'vitest';
import {
  validatePlugin,
  validateMetadata,
  validateNodeExtensions,
  validateExporterExtensions,
  validatePanelExtensions,
  validateThemeExtensions,
  validateParserExtension,
  isValidPlugin,
  isValidMetadata,
} from '@/lib/plugins/validator';
import type {
  InfraFlowPlugin,
  PluginMetadata,
  NodeExtension,
  ExporterExtension,
  PanelExtension,
  ThemeExtension,
  ParserExtension,
} from '@/types/plugin';

// ============================================================
// Test Fixtures
// ============================================================

const createValidMetadata = (): PluginMetadata => ({
  id: 'test-plugin',
  name: 'Test Plugin',
  version: '1.0.0',
  author: 'Test Author',
  description: 'A test plugin',
  license: 'MIT',
  homepage: 'https://example.com',
  dependencies: ['core-plugin'],
});

// Mock icon component for tests
const MockIcon = () => null;

const createValidNodeExtension = (): NodeExtension => ({
  config: {
    id: 'test-node',
    name: 'Test Node',
    category: 'security',
    icon: 'Shield',
    color: '#ff0000',
  },
});

const createValidExporterExtension = (): ExporterExtension => ({
  name: 'Test Exporter',
  format: 'test-format',
  fileExtension: '.test',
  export: () => 'exported content',
});

const createValidPanelExtension = (): PanelExtension => ({
  id: 'test-panel',
  title: 'Test Panel',
  icon: null,
  component: () => null,
  position: 'left',
});

const createValidThemeExtension = (): ThemeExtension => ({
  id: 'test-theme',
  name: 'Test Theme',
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
});

const createValidParserExtension = (): ParserExtension => ({
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
  priority: 10,
});

const createValidPlugin = (): InfraFlowPlugin => ({
  metadata: createValidMetadata(),
  nodes: [createValidNodeExtension()],
  parsers: createValidParserExtension(),
  exporters: [createValidExporterExtension()],
  panels: [createValidPanelExtension()],
  themes: [createValidThemeExtension()],
  onLoad: async () => {},
  onUnload: async () => {},
});

// ============================================================
// Tests
// ============================================================

describe('Plugin Validator', () => {
  // ============================================================
  // validatePlugin
  // ============================================================

  describe('validatePlugin', () => {
    it('should validate a valid plugin', () => {
      const plugin = createValidPlugin();
      const result = validatePlugin(plugin);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-object plugin', () => {
      const result = validatePlugin(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Plugin must be an object');
    });

    it('should reject undefined plugin', () => {
      const result = validatePlugin(undefined);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Plugin must be an object');
    });

    it('should reject primitive values', () => {
      expect(validatePlugin('string').valid).toBe(false);
      expect(validatePlugin(123).valid).toBe(false);
      expect(validatePlugin(true).valid).toBe(false);
    });

    it('should validate metadata when not skipped', () => {
      const plugin = { metadata: { id: 123 } }; // Invalid id type
      const result = validatePlugin(plugin);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('metadata.id is required and must be a string');
    });

    it('should skip metadata validation when specified', () => {
      const plugin = { metadata: { id: 123 } }; // Invalid id type
      const result = validatePlugin(plugin, { skip: ['metadata'] });

      // Should not have metadata errors
      expect(result.errors.filter((e) => e.includes('metadata'))).toHaveLength(0);
    });

    it('should validate nodes when present', () => {
      const plugin = {
        metadata: createValidMetadata(),
        nodes: 'not-an-array',
      };
      const result = validatePlugin(plugin);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('nodes must be an array');
    });

    it('should skip nodes validation when specified', () => {
      const plugin = {
        metadata: createValidMetadata(),
        nodes: 'not-an-array',
      };
      const result = validatePlugin(plugin, { skip: ['nodes'] });

      expect(result.errors.filter((e) => e.includes('nodes'))).toHaveLength(0);
    });

    it('should validate exporters when present', () => {
      const plugin = {
        metadata: createValidMetadata(),
        exporters: 'not-an-array',
      };
      const result = validatePlugin(plugin);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('exporters must be an array');
    });

    it('should validate panels when present', () => {
      const plugin = {
        metadata: createValidMetadata(),
        panels: 'not-an-array',
      };
      const result = validatePlugin(plugin);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('panels must be an array');
    });

    it('should validate themes when present', () => {
      const plugin = {
        metadata: createValidMetadata(),
        themes: 'not-an-array',
      };
      const result = validatePlugin(plugin);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('themes must be an array');
    });

    it('should validate parsers when present', () => {
      const plugin = {
        metadata: createValidMetadata(),
        parsers: 'not-an-object',
      };
      const result = validatePlugin(plugin);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('parsers must be an object');
    });

    it('should validate onLoad is a function', () => {
      const plugin = {
        metadata: createValidMetadata(),
        onLoad: 'not-a-function',
      };
      const result = validatePlugin(plugin);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('onLoad must be a function');
    });

    it('should validate onUnload is a function', () => {
      const plugin = {
        metadata: createValidMetadata(),
        onUnload: 'not-a-function',
      };
      const result = validatePlugin(plugin);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('onUnload must be a function');
    });

    it('should warn when plugin has no extensions', () => {
      const plugin = {
        metadata: createValidMetadata(),
      };
      const result = validatePlugin(plugin);

      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('Plugin has no extensions');
    });

    describe('strict mode', () => {
      it('should fail validation with warnings in strict mode', () => {
        const plugin = {
          metadata: createValidMetadata(),
        };
        const result = validatePlugin(plugin, { strict: true });

        expect(result.valid).toBe(false);
        expect(result.warnings.length).toBeGreaterThan(0);
      });

      it('should pass validation without warnings in strict mode', () => {
        const plugin = createValidPlugin();
        const result = validatePlugin(plugin, { strict: true });

        expect(result.valid).toBe(true);
      });
    });
  });

  // ============================================================
  // validateMetadata
  // ============================================================

  describe('validateMetadata', () => {
    it('should validate valid metadata', () => {
      const metadata = createValidMetadata();
      const result = validateMetadata(metadata);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-object metadata', () => {
      const result = validateMetadata(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Metadata is required and must be an object');
    });

    describe('id validation', () => {
      it('should require id', () => {
        const metadata = { name: 'Test', version: '1.0.0' };
        const result = validateMetadata(metadata);

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('metadata.id is required and must be a string');
      });

      it('should require id to be a string', () => {
        const metadata = { id: 123, name: 'Test', version: '1.0.0' };
        const result = validateMetadata(metadata);

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('metadata.id is required and must be a string');
      });

      it('should require lowercase letters, numbers, and hyphens only', () => {
        const metadata = { id: 'Test_Plugin!', name: 'Test', version: '1.0.0' };
        const result = validateMetadata(metadata);

        expect(result.valid).toBe(false);
        expect(result.errors).toContain(
          'metadata.id must contain only lowercase letters, numbers, and hyphens'
        );
      });

      it('should accept valid id with lowercase and hyphens', () => {
        const metadata = { id: 'my-plugin-123', name: 'Test', version: '1.0.0' };
        const result = validateMetadata(metadata);

        expect(result.errors.filter((e) => e.includes('lowercase'))).toHaveLength(0);
      });

      it('should require id length between 2 and 50', () => {
        const shortId = { id: 'a', name: 'Test', version: '1.0.0' };
        const longId = { id: 'a'.repeat(51), name: 'Test', version: '1.0.0' };

        expect(validateMetadata(shortId).errors).toContain(
          'metadata.id must be between 2 and 50 characters'
        );
        expect(validateMetadata(longId).errors).toContain(
          'metadata.id must be between 2 and 50 characters'
        );
      });
    });

    describe('name validation', () => {
      it('should require name', () => {
        const metadata = { id: 'test', version: '1.0.0' };
        const result = validateMetadata(metadata);

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('metadata.name is required and must be a string');
      });

      it('should require name to be a string', () => {
        const metadata = { id: 'test', name: 123, version: '1.0.0' };
        const result = validateMetadata(metadata);

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('metadata.name is required and must be a string');
      });
    });

    describe('version validation', () => {
      it('should require version', () => {
        const metadata = { id: 'test', name: 'Test' };
        const result = validateMetadata(metadata);

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('metadata.version is required and must be a string');
      });

      it('should warn for non-semver version', () => {
        const metadata = { id: 'test', name: 'Test', version: 'v1' };
        const result = validateMetadata(metadata);

        expect(result.warnings).toContain(
          'metadata.version should follow semantic versioning (e.g., 1.0.0)'
        );
      });

      it('should accept valid semver version', () => {
        const metadata = { id: 'test', name: 'Test', version: '1.2.3' };
        const result = validateMetadata(metadata);

        expect(result.warnings.filter((w) => w.includes('semantic'))).toHaveLength(0);
      });

      it('should accept semver with prerelease', () => {
        const metadata = { id: 'test', name: 'Test', version: '1.0.0-alpha.1' };
        const result = validateMetadata(metadata);

        expect(result.warnings.filter((w) => w.includes('semantic'))).toHaveLength(0);
      });
    });

    describe('optional field validation', () => {
      it('should validate author is string if provided', () => {
        const metadata = { ...createValidMetadata(), author: 123 };
        const result = validateMetadata(metadata);

        expect(result.errors).toContain('metadata.author must be a string');
      });

      it('should validate description is string if provided', () => {
        const metadata = { ...createValidMetadata(), description: 123 };
        const result = validateMetadata(metadata);

        expect(result.errors).toContain('metadata.description must be a string');
      });

      it('should validate license is string if provided', () => {
        const metadata = { ...createValidMetadata(), license: 123 };
        const result = validateMetadata(metadata);

        expect(result.errors).toContain('metadata.license must be a string');
      });

      it('should validate homepage is string if provided', () => {
        const metadata = { ...createValidMetadata(), homepage: 123 };
        const result = validateMetadata(metadata);

        expect(result.errors).toContain('metadata.homepage must be a string');
      });

      it('should warn for invalid homepage URL', () => {
        const metadata = { ...createValidMetadata(), homepage: 'not-a-url' };
        const result = validateMetadata(metadata);

        expect(result.warnings).toContain('metadata.homepage should be a valid URL');
      });

      it('should accept valid homepage URL', () => {
        const metadata = { ...createValidMetadata(), homepage: 'https://example.com' };
        const result = validateMetadata(metadata);

        expect(result.warnings.filter((w) => w.includes('URL'))).toHaveLength(0);
      });

      it('should validate dependencies is array if provided', () => {
        const metadata = { ...createValidMetadata(), dependencies: 'not-an-array' };
        const result = validateMetadata(metadata);

        expect(result.errors).toContain('metadata.dependencies must be an array');
      });

      it('should validate dependencies contains only strings', () => {
        const metadata = { ...createValidMetadata(), dependencies: ['valid', 123] };
        const result = validateMetadata(metadata);

        expect(result.errors).toContain('metadata.dependencies must contain only strings');
      });
    });
  });

  // ============================================================
  // validateNodeExtensions
  // ============================================================

  describe('validateNodeExtensions', () => {
    it('should validate valid node extensions', () => {
      const nodes = [createValidNodeExtension()];
      const result = validateNodeExtensions(nodes);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-array nodes', () => {
      const result = validateNodeExtensions('not-an-array');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('nodes must be an array');
    });

    it('should require config', () => {
      const nodes = [{}];
      const result = validateNodeExtensions(nodes);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('nodes[0].config is required');
    });

    it('should require config.id', () => {
      const nodes = [{ config: { name: 'Test', category: 'security', icon: null, color: '#fff' } }];
      const result = validateNodeExtensions(nodes);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('nodes[0].config.id is required');
    });

    it('should require config.name', () => {
      const nodes = [{ config: { id: 'test', category: 'security', icon: null, color: '#fff' } }];
      const result = validateNodeExtensions(nodes);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('nodes[0].config.name is required');
    });

    it('should require config.category', () => {
      const nodes = [{ config: { id: 'test', name: 'Test', icon: null, color: '#fff' } }];
      const result = validateNodeExtensions(nodes);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('nodes[0].config.category is required');
    });

    it('should require config.icon', () => {
      const nodes = [{ config: { id: 'test', name: 'Test', category: 'security', color: '#fff' } }];
      const result = validateNodeExtensions(nodes);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('nodes[0].config.icon is required');
    });

    it('should require config.color', () => {
      const nodes = [{ config: { id: 'test', name: 'Test', category: 'security', icon: null } }];
      const result = validateNodeExtensions(nodes);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('nodes[0].config.color is required');
    });

    it('should validate multiple nodes', () => {
      const nodes = [
        createValidNodeExtension(),
        { config: {} }, // Invalid
      ];
      const result = validateNodeExtensions(nodes);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('nodes[1]'))).toBe(true);
    });
  });

  // ============================================================
  // validateExporterExtensions
  // ============================================================

  describe('validateExporterExtensions', () => {
    it('should validate valid exporter extensions', () => {
      const exporters = [createValidExporterExtension()];
      const result = validateExporterExtensions(exporters);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-array exporters', () => {
      const result = validateExporterExtensions('not-an-array');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('exporters must be an array');
    });

    it('should require name', () => {
      const exporters = [{ format: 'test', fileExtension: '.test', export: () => '' }];
      const result = validateExporterExtensions(exporters);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('exporters[0].name is required');
    });

    it('should require format', () => {
      const exporters = [{ name: 'Test', fileExtension: '.test', export: () => '' }];
      const result = validateExporterExtensions(exporters);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('exporters[0].format is required');
    });

    it('should require fileExtension', () => {
      const exporters = [{ name: 'Test', format: 'test', export: () => '' }];
      const result = validateExporterExtensions(exporters);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('exporters[0].fileExtension is required');
    });

    it('should require export function', () => {
      const exporters = [{ name: 'Test', format: 'test', fileExtension: '.test' }];
      const result = validateExporterExtensions(exporters);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('exporters[0].export must be a function');
    });

    it('should reject duplicate formats', () => {
      const exporters = [
        createValidExporterExtension(),
        { ...createValidExporterExtension(), name: 'Another' }, // Same format
      ];
      const result = validateExporterExtensions(exporters);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('duplicated'))).toBe(true);
    });
  });

  // ============================================================
  // validatePanelExtensions
  // ============================================================

  describe('validatePanelExtensions', () => {
    it('should validate valid panel extensions', () => {
      const panels = [createValidPanelExtension()];
      const result = validatePanelExtensions(panels);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-array panels', () => {
      const result = validatePanelExtensions('not-an-array');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('panels must be an array');
    });

    it('should require id', () => {
      const panels = [{ title: 'Test', position: 'left', component: () => null }];
      const result = validatePanelExtensions(panels);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('panels[0].id is required');
    });

    it('should require title', () => {
      const panels = [{ id: 'test', position: 'left', component: () => null }];
      const result = validatePanelExtensions(panels);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('panels[0].title is required');
    });

    it('should require valid position', () => {
      const panels = [{ id: 'test', title: 'Test', position: 'invalid', component: () => null }];
      const result = validatePanelExtensions(panels);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("panels[0].position must be 'left', 'right', or 'bottom'");
    });

    it('should accept valid positions', () => {
      const positions = ['left', 'right', 'bottom'] as const;

      for (const position of positions) {
        const panels = [{ ...createValidPanelExtension(), position }];
        const result = validatePanelExtensions(panels);

        expect(result.errors.filter((e) => e.includes('position'))).toHaveLength(0);
      }
    });

    it('should require component', () => {
      const panels = [{ id: 'test', title: 'Test', position: 'left' }];
      const result = validatePanelExtensions(panels);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('panels[0].component is required');
    });

    it('should reject duplicate ids', () => {
      const panels = [createValidPanelExtension(), createValidPanelExtension()]; // Same id
      const result = validatePanelExtensions(panels);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('duplicated'))).toBe(true);
    });
  });

  // ============================================================
  // validateThemeExtensions
  // ============================================================

  describe('validateThemeExtensions', () => {
    it('should validate valid theme extensions', () => {
      const themes = [createValidThemeExtension()];
      const result = validateThemeExtensions(themes);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-array themes', () => {
      const result = validateThemeExtensions('not-an-array');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('themes must be an array');
    });

    it('should require id', () => {
      const themes = [
        {
          name: 'Test',
          colors: createValidThemeExtension().colors,
        },
      ];
      const result = validateThemeExtensions(themes);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('themes[0].id is required');
    });

    it('should require name', () => {
      const themes = [
        {
          id: 'test',
          colors: createValidThemeExtension().colors,
        },
      ];
      const result = validateThemeExtensions(themes);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('themes[0].name is required');
    });

    it('should require colors', () => {
      const themes = [{ id: 'test', name: 'Test' }];
      const result = validateThemeExtensions(themes);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('themes[0].colors is required and must be an object');
    });

    it('should reject duplicate ids', () => {
      const themes = [createValidThemeExtension(), createValidThemeExtension()]; // Same id
      const result = validateThemeExtensions(themes);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('duplicated'))).toBe(true);
    });
  });

  // ============================================================
  // validateParserExtension
  // ============================================================

  describe('validateParserExtension', () => {
    it('should validate valid parser extension', () => {
      const parser = createValidParserExtension();
      const result = validateParserExtension(parser);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-object parser', () => {
      const result = validateParserExtension(null);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('parsers must be an object');
    });

    it('should validate patterns array', () => {
      const parser = { patterns: 'not-an-array' };
      const result = validateParserExtension(parser);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('parsers.patterns must be an array');
    });

    it('should require pattern to be RegExp', () => {
      const parser = {
        patterns: [{ pattern: 'not-regexp', type: 'test', label: 'Test' }],
      };
      const result = validateParserExtension(parser);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('parsers.patterns[0].pattern must be a RegExp');
    });

    it('should require pattern type', () => {
      const parser = {
        patterns: [{ pattern: /test/i, label: 'Test' }],
      };
      const result = validateParserExtension(parser);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('parsers.patterns[0].type is required');
    });

    it('should require pattern label', () => {
      const parser = {
        patterns: [{ pattern: /test/i, type: 'test' }],
      };
      const result = validateParserExtension(parser);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('parsers.patterns[0].label is required');
    });

    it('should validate templates object', () => {
      const parser = { templates: 'not-an-object' };
      const result = validateParserExtension(parser);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('parsers.templates must be an object');
    });

    it('should validate commandHandler is function', () => {
      const parser = { commandHandler: 'not-a-function' };
      const result = validateParserExtension(parser);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('parsers.commandHandler must be a function');
    });

    it('should warn when parser has no patterns, templates, or commandHandler', () => {
      const parser = {};
      const result = validateParserExtension(parser);

      expect(result.warnings).toContain(
        'parsers should have at least one of: patterns, templates, commandHandler'
      );
    });

    it('should not warn when parser has patterns', () => {
      const parser = {
        patterns: [{ pattern: /test/i, type: 'test', label: 'Test' }],
      };
      const result = validateParserExtension(parser);

      expect(result.warnings.filter((w) => w.includes('at least one'))).toHaveLength(0);
    });

    it('should not warn when parser has templates', () => {
      const parser = {
        templates: { test: { nodes: [], connections: [] } },
      };
      const result = validateParserExtension(parser);

      expect(result.warnings.filter((w) => w.includes('at least one'))).toHaveLength(0);
    });

    it('should not warn when parser has commandHandler', () => {
      const parser = {
        commandHandler: () => null,
      };
      const result = validateParserExtension(parser);

      expect(result.warnings.filter((w) => w.includes('at least one'))).toHaveLength(0);
    });
  });

  // ============================================================
  // Type Guards
  // ============================================================

  describe('isValidPlugin', () => {
    it('should return true for valid plugin', () => {
      const plugin = createValidPlugin();
      expect(isValidPlugin(plugin)).toBe(true);
    });

    it('should return false for invalid plugin', () => {
      expect(isValidPlugin(null)).toBe(false);
      expect(isValidPlugin({})).toBe(false);
      expect(isValidPlugin({ metadata: {} })).toBe(false);
    });
  });

  describe('isValidMetadata', () => {
    it('should return true for valid metadata', () => {
      const metadata = createValidMetadata();
      expect(isValidMetadata(metadata)).toBe(true);
    });

    it('should return false for invalid metadata', () => {
      expect(isValidMetadata(null)).toBe(false);
      expect(isValidMetadata({})).toBe(false);
      expect(isValidMetadata({ id: 'test' })).toBe(false);
    });
  });
});
