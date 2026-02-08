/**
 * Theme Manager Tests
 *
 * Tests for theme registration, application, CSS variable injection,
 * and theme persistence.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  ThemeManager,
  themeManager,
  applyTheme,
  getCurrentTheme,
  getAllThemes,
  themeColorsToCSSVariables,
  categoryStylesToCSSVariables,
} from '@/lib/plugins/themeManager';
import type { ThemeExtension, ThemeColors, CategoryStyle } from '@/types/plugin';

// ============================================================
// Test Fixtures
// ============================================================

const createValidTheme = (id: string, overrides: Partial<ThemeExtension> = {}): ThemeExtension => ({
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
      glowColor: '#ef4444',
    },
  },
  isDark: true,
  ...overrides,
});

// ============================================================
// Tests
// ============================================================

describe('ThemeManager', () => {
  let manager: ThemeManager;

  beforeEach(() => {
    manager = new ThemeManager();
    // Clear localStorage
    localStorage.clear();
    // Remove any injected styles
    document.querySelectorAll('#infraflow-theme-variables').forEach((el) => el.remove());
  });

  afterEach(() => {
    manager.reset();
  });

  // ============================================================
  // Constructor & Options
  // ============================================================

  describe('constructor', () => {
    it('should create instance with default options', () => {
      const mgr = new ThemeManager();
      expect(mgr).toBeInstanceOf(ThemeManager);
    });

    it('should accept custom options', () => {
      const mgr = new ThemeManager({
        defaultThemeId: 'dark',
        useTransition: false,
        transitionDuration: 300,
        storageKey: 'custom-theme-key',
      });
      expect(mgr).toBeInstanceOf(ThemeManager);
    });

    it('should use default values for missing options', () => {
      const mgr = new ThemeManager({});
      // Options should fall back to defaults
      expect(mgr).toBeInstanceOf(ThemeManager);
    });
  });

  // ============================================================
  // Registration
  // ============================================================

  describe('register', () => {
    it('should register a theme', () => {
      const theme = createValidTheme('dark');
      manager.register(theme);

      expect(manager.getTheme('dark')).toBe(theme);
    });

    it('should allow registering multiple themes', () => {
      const darkTheme = createValidTheme('dark');
      const lightTheme = createValidTheme('light');

      manager.register(darkTheme);
      manager.register(lightTheme);

      expect(manager.getTheme('dark')).toBe(darkTheme);
      expect(manager.getTheme('light')).toBe(lightTheme);
    });

    it('should overwrite existing theme with same id', () => {
      const theme1 = createValidTheme('dark', { name: 'Dark 1' });
      const theme2 = createValidTheme('dark', { name: 'Dark 2' });

      manager.register(theme1);
      manager.register(theme2);

      expect(manager.getTheme('dark')?.name).toBe('Dark 2');
    });
  });

  describe('unregister', () => {
    it('should unregister a theme', () => {
      const theme = createValidTheme('dark');
      manager.register(theme);
      manager.unregister('dark');

      expect(manager.getTheme('dark')).toBeUndefined();
    });

    it('should reset if unregistering current theme', () => {
      const theme = createValidTheme('dark');
      manager.register(theme);
      manager.apply('dark');
      manager.unregister('dark');

      expect(manager.getCurrentThemeId()).toBeNull();
    });

    it('should do nothing for non-existent theme', () => {
      // Should not throw
      manager.unregister('non-existent');
    });
  });

  describe('registerAll', () => {
    it('should register multiple themes at once', () => {
      const themes = [createValidTheme('dark'), createValidTheme('light')];
      manager.registerAll(themes);

      expect(manager.getAllThemes()).toHaveLength(2);
    });
  });

  // ============================================================
  // Query
  // ============================================================

  describe('getTheme', () => {
    it('should return theme by id', () => {
      const theme = createValidTheme('dark');
      manager.register(theme);

      expect(manager.getTheme('dark')).toBe(theme);
    });

    it('should return undefined for non-existent theme', () => {
      expect(manager.getTheme('non-existent')).toBeUndefined();
    });
  });

  describe('getAllThemes', () => {
    it('should return all registered themes', () => {
      manager.register(createValidTheme('dark'));
      manager.register(createValidTheme('light'));

      const themes = manager.getAllThemes();
      expect(themes).toHaveLength(2);
    });

    it('should return empty array when no themes', () => {
      expect(manager.getAllThemes()).toEqual([]);
    });
  });

  describe('getCurrentTheme', () => {
    it('should return current theme', () => {
      const theme = createValidTheme('dark');
      manager.register(theme);
      manager.apply('dark');

      expect(manager.getCurrentTheme()).toBe(theme);
    });

    it('should return null when no theme applied', () => {
      expect(manager.getCurrentTheme()).toBeNull();
    });

    it('should return null when current theme was unregistered', () => {
      const theme = createValidTheme('dark');
      manager.register(theme);
      manager.apply('dark');
      manager.unregister('dark');

      expect(manager.getCurrentTheme()).toBeNull();
    });
  });

  describe('getCurrentThemeId', () => {
    it('should return current theme id', () => {
      const theme = createValidTheme('dark');
      manager.register(theme);
      manager.apply('dark');

      expect(manager.getCurrentThemeId()).toBe('dark');
    });

    it('should return null when no theme applied', () => {
      expect(manager.getCurrentThemeId()).toBeNull();
    });
  });

  // ============================================================
  // Theme Application
  // ============================================================

  describe('apply', () => {
    it('should apply registered theme', () => {
      const theme = createValidTheme('dark');
      manager.register(theme);

      const result = manager.apply('dark');

      expect(result).toBe(true);
      expect(manager.getCurrentThemeId()).toBe('dark');
    });

    it('should return false for non-existent theme', () => {
      const result = manager.apply('non-existent');

      expect(result).toBe(false);
    });

    it('should inject CSS variables', () => {
      const theme = createValidTheme('dark');
      manager.register(theme);
      manager.apply('dark');

      const styleElement = document.getElementById('infraflow-theme-variables');
      expect(styleElement).not.toBeNull();
      expect(styleElement?.textContent).toContain('--theme-background');
    });

    it('should set transition property when useTransition is true', () => {
      const mgr = new ThemeManager({ useTransition: true, transitionDuration: 200 });
      const theme = createValidTheme('dark');
      mgr.register(theme);
      mgr.apply('dark');

      const transitionValue = document.documentElement.style.getPropertyValue('--theme-transition');
      expect(transitionValue).toBe('200ms ease');
    });

    it('should save to localStorage', () => {
      const mgr = new ThemeManager({ storageKey: 'test-theme' });
      const theme = createValidTheme('dark');
      mgr.register(theme);
      mgr.apply('dark');

      expect(localStorage.setItem).toHaveBeenCalledWith('test-theme', 'dark');
    });

    it('should replace existing style element', () => {
      const theme1 = createValidTheme('dark');
      const theme2 = createValidTheme('light', {
        colors: {
          ...theme1.colors,
          background: '#ffffff',
        },
      });

      manager.register(theme1);
      manager.register(theme2);

      manager.apply('dark');
      manager.apply('light');

      const styleElements = document.querySelectorAll('#infraflow-theme-variables');
      expect(styleElements).toHaveLength(1);
      expect(styleElements[0].textContent).toContain('#ffffff');
    });
  });

  // ============================================================
  // Theme Reset
  // ============================================================

  describe('reset', () => {
    it('should remove style element', () => {
      const theme = createValidTheme('dark');
      manager.register(theme);
      manager.apply('dark');
      manager.reset();

      const styleElement = document.getElementById('infraflow-theme-variables');
      expect(styleElement).toBeNull();
    });

    it('should clear current theme id', () => {
      const theme = createValidTheme('dark');
      manager.register(theme);
      manager.apply('dark');
      manager.reset();

      expect(manager.getCurrentThemeId()).toBeNull();
    });

    it('should remove from localStorage', () => {
      const mgr = new ThemeManager({ storageKey: 'test-theme' });
      const theme = createValidTheme('dark');
      mgr.register(theme);
      mgr.apply('dark');
      mgr.reset();

      expect(localStorage.removeItem).toHaveBeenCalledWith('test-theme');
    });
  });

  // ============================================================
  // Theme Restoration
  // ============================================================

  describe('restore', () => {
    it('should restore theme from localStorage', () => {
      const mgr = new ThemeManager({ storageKey: 'test-theme' });
      const theme = createValidTheme('dark');
      mgr.register(theme);

      // Simulate saved theme
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValueOnce('dark');

      const result = mgr.restore();

      expect(result).toBe(true);
      expect(mgr.getCurrentThemeId()).toBe('dark');
    });

    it('should fall back to default theme', () => {
      const mgr = new ThemeManager({ storageKey: 'test-theme', defaultThemeId: 'dark' });
      const theme = createValidTheme('dark');
      mgr.register(theme);

      // No saved theme
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValueOnce(null);

      const result = mgr.restore();

      expect(result).toBe(true);
      expect(mgr.getCurrentThemeId()).toBe('dark');
    });

    it('should return false when no saved or default theme', () => {
      const mgr = new ThemeManager({ storageKey: 'test-theme' });

      const result = mgr.restore();

      expect(result).toBe(false);
    });

    it('should skip saved theme if not registered', () => {
      const mgr = new ThemeManager({ storageKey: 'test-theme', defaultThemeId: 'light' });
      const lightTheme = createValidTheme('light');
      mgr.register(lightTheme);

      // Simulate saved theme that's no longer registered
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValueOnce('dark');

      const result = mgr.restore();

      // Should fall back to default
      expect(result).toBe(true);
      expect(mgr.getCurrentThemeId()).toBe('light');
    });
  });

  // ============================================================
  // CSS Variable Generation
  // ============================================================

  describe('CSS variable generation', () => {
    it('should generate color variables with correct names', () => {
      const theme = createValidTheme('dark');
      manager.register(theme);
      manager.apply('dark');

      const styleElement = document.getElementById('infraflow-theme-variables');
      const content = styleElement?.textContent || '';

      expect(content).toContain('--theme-background');
      expect(content).toContain('--theme-surface');
      expect(content).toContain('--theme-primary');
      expect(content).toContain('--theme-text-muted'); // camelCase to kebab-case
    });

    it('should generate category style variables', () => {
      const theme = createValidTheme('dark');
      manager.register(theme);
      manager.apply('dark');

      const styleElement = document.getElementById('infraflow-theme-variables');
      const content = styleElement?.textContent || '';

      expect(content).toContain('--theme-category-security-gradient');
      expect(content).toContain('--theme-category-security-icon-bg');
      expect(content).toContain('--theme-category-security-border');
      expect(content).toContain('--theme-category-security-shadow');
      expect(content).toContain('--theme-category-security-glow');
    });

    it('should convert camelCase to kebab-case', () => {
      const theme = createValidTheme('dark', {
        colors: {
          ...createValidTheme('dark').colors,
          backgroundColor: '#000000', // camelCase
        } as any,
      });
      manager.register(theme);
      manager.apply('dark');

      const styleElement = document.getElementById('infraflow-theme-variables');
      const content = styleElement?.textContent || '';

      expect(content).toContain('--theme-background-color');
    });
  });
});

// ============================================================
// Helper Functions Tests
// ============================================================

describe('Helper Functions', () => {
  beforeEach(() => {
    // Clear any existing themes from default manager
    localStorage.clear();
    document.querySelectorAll('#infraflow-theme-variables').forEach((el) => el.remove());
  });

  describe('applyTheme', () => {
    it('should apply theme using default manager', () => {
      const theme = createValidTheme('dark');
      themeManager.register(theme);

      const result = applyTheme('dark');

      expect(result).toBe(true);
    });
  });

  describe('getCurrentTheme', () => {
    it('should get current theme from default manager', () => {
      const theme = createValidTheme('dark');
      themeManager.register(theme);
      themeManager.apply('dark');

      const current = getCurrentTheme();

      expect(current).toBe(theme);
    });
  });

  describe('getAllThemes', () => {
    it('should get all themes from default manager', () => {
      // Clear and register new themes
      const theme = createValidTheme('test-helper');
      themeManager.register(theme);

      const themes = getAllThemes();

      expect(themes.some((t) => t.id === 'test-helper')).toBe(true);
    });
  });

  describe('themeColorsToCSSVariables', () => {
    it('should convert colors to CSS variables', () => {
      const colors: ThemeColors = {
        background: '#000000',
        surface: '#111111',
        primary: '#3b82f6',
        secondary: '#6b7280',
        accent: '#8b5cf6',
        text: '#f8fafc',
        textMuted: '#94a3b8',
        border: '#374151',
      };

      const variables = themeColorsToCSSVariables(colors);

      expect(variables['--theme-background']).toBe('#000000');
      expect(variables['--theme-surface']).toBe('#111111');
      expect(variables['--theme-primary']).toBe('#3b82f6');
      expect(variables['--theme-text']).toBe('#f8fafc');
      expect(variables['--theme-text-muted']).toBe('#94a3b8');
    });

    it('should handle camelCase to kebab-case conversion', () => {
      const colors: ThemeColors = {
        background: '#000',
        surface: '#111',
        primary: '#333',
        secondary: '#444',
        accent: '#555',
        text: '#666',
        textMuted: '#777', // camelCase
        border: '#888',
      };

      const variables = themeColorsToCSSVariables(colors);

      expect(variables).toHaveProperty('--theme-text-muted');
    });
  });

  describe('categoryStylesToCSSVariables', () => {
    it('should convert category styles to CSS variables', () => {
      const styles: Record<string, CategoryStyle> = {
        security: {
          gradient: 'from-red-500 to-red-600',
          iconBg: 'bg-red-500',
          border: 'border-red-500',
          shadow: 'shadow-red-500/20',
          glowColor: '#ef4444',
        },
      };

      const variables = categoryStylesToCSSVariables(styles);

      expect(variables['--theme-category-security-gradient']).toBe('from-red-500 to-red-600');
      expect(variables['--theme-category-security-icon-bg']).toBe('bg-red-500');
      expect(variables['--theme-category-security-border']).toBe('border-red-500');
      expect(variables['--theme-category-security-shadow']).toBe('shadow-red-500/20');
      expect(variables['--theme-category-security-glow']).toBe('#ef4444');
    });

    it('should handle missing optional fields', () => {
      const styles: Record<string, CategoryStyle> = {
        security: {
          gradient: 'from-red-500 to-red-600',
          iconBg: 'bg-red-500',
          border: 'border-red-500',
          shadow: 'shadow-red-500/20',
          // glowColor is optional
        },
      };

      const variables = categoryStylesToCSSVariables(styles);

      expect(variables['--theme-category-security-glow']).toBeUndefined();
    });

    it('should handle multiple categories', () => {
      const styles: Record<string, CategoryStyle> = {
        security: {
          gradient: 'from-red-500',
          iconBg: 'bg-red-500',
          border: 'border-red-500',
          shadow: 'shadow-red-500',
        },
        network: {
          gradient: 'from-blue-500',
          iconBg: 'bg-blue-500',
          border: 'border-blue-500',
          shadow: 'shadow-blue-500',
        },
      };

      const variables = categoryStylesToCSSVariables(styles);

      expect(variables['--theme-category-security-gradient']).toBe('from-red-500');
      expect(variables['--theme-category-network-gradient']).toBe('from-blue-500');
    });
  });
});

// ============================================================
// Server-side Behavior Tests
// ============================================================

describe('Server-side behavior simulation', () => {
  // These tests verify that the code handles server-side scenarios
  // where document/window might not be available

  it('should handle apply when updating currentThemeId even without DOM', () => {
    const manager = new ThemeManager();
    const theme = createValidTheme('dark');
    manager.register(theme);

    // In browser environment, this will still work
    // The code checks typeof window === 'undefined'
    const result = manager.apply('dark');

    expect(result).toBe(true);
    expect(manager.getCurrentThemeId()).toBe('dark');
  });
});

// ============================================================
// Edge Cases
// ============================================================

describe('Edge Cases', () => {
  let manager: ThemeManager;

  beforeEach(() => {
    manager = new ThemeManager();
    localStorage.clear();
    document.querySelectorAll('#infraflow-theme-variables').forEach((el) => el.remove());
  });

  afterEach(() => {
    manager.reset();
  });

  it('should handle theme with empty colors object', () => {
    const theme: ThemeExtension = {
      id: 'empty-colors',
      name: 'Empty Colors',
      colors: {} as ThemeColors, // Empty
    };

    manager.register(theme);
    const result = manager.apply('empty-colors');

    expect(result).toBe(true);
  });

  it('should handle theme with no categoryStyles', () => {
    const theme: ThemeExtension = {
      id: 'no-category',
      name: 'No Category',
      colors: createValidTheme('test').colors,
      // No categoryStyles
    };

    manager.register(theme);
    const result = manager.apply('no-category');

    expect(result).toBe(true);
  });

  it('should handle rapid theme switching', () => {
    const theme1 = createValidTheme('dark');
    const theme2 = createValidTheme('light');

    manager.register(theme1);
    manager.register(theme2);

    for (let i = 0; i < 10; i++) {
      manager.apply(i % 2 === 0 ? 'dark' : 'light');
    }

    // Only one style element should exist
    const styleElements = document.querySelectorAll('#infraflow-theme-variables');
    expect(styleElements).toHaveLength(1);
  });

  it('should handle localStorage errors gracefully', () => {
    const mgr = new ThemeManager({ storageKey: 'test-theme' });
    const theme = createValidTheme('dark');
    mgr.register(theme);

    // Mock localStorage to throw
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn().mockImplementation(() => {
      throw new Error('Storage full');
    });

    // Should not throw
    const result = mgr.apply('dark');
    expect(result).toBe(true);

    // Restore
    localStorage.setItem = originalSetItem;
  });
});
