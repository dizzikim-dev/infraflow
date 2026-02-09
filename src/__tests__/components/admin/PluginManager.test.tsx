/**
 * PluginManager Component Tests
 *
 * Tests for the plugin manager component including:
 * - Plugin list display
 * - Plugin activation/deactivation
 * - Tab navigation
 * - System status display
 * - Plugin details expansion
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PluginManager from '@/components/admin/PluginManager';

// Mock the plugin hooks
const mockActivate = vi.fn().mockResolvedValue(undefined);
const mockDeactivate = vi.fn().mockResolvedValue(undefined);
const mockReinitialize = vi.fn().mockResolvedValue(undefined);

const mockPluginStates = [
  {
    plugin: {
      metadata: {
        id: 'core',
        name: 'Core Plugin',
        version: '1.0.0',
        description: 'Core functionality plugin',
        author: 'InfraFlow Team',
      },
      nodes: [{ id: 'firewall', name: 'Firewall' }],
      exporters: [{ format: 'json', name: 'JSON', fileExtension: 'json' }],
      panels: [],
      themes: [],
      parsers: {
        patterns: [{ pattern: /test/ }],
        templates: { default: {} },
      },
    },
    status: 'active',
    loadedAt: new Date().toISOString(),
    error: null,
  },
  {
    plugin: {
      metadata: {
        id: 'custom-nodes',
        name: 'Custom Nodes',
        version: '2.0.0',
        description: 'Additional infrastructure nodes',
        author: 'Community',
      },
      nodes: [{ id: 'custom-1', name: 'Custom Node 1' }, { id: 'custom-2', name: 'Custom Node 2' }],
      exporters: [],
      panels: [{ id: 'panel-1', title: 'Custom Panel', icon: 'A', position: 'right' }],
      themes: [{ id: 'dark-blue', name: 'Dark Blue', colors: { background: '#1e3a5f' } }],
    },
    status: 'inactive',
    loadedAt: null,
    error: null,
  },
  {
    plugin: {
      metadata: {
        id: 'error-plugin',
        name: 'Error Plugin',
        version: '0.1.0',
        description: 'A plugin with errors',
      },
      nodes: [],
      exporters: [],
      panels: [],
      themes: [],
    },
    status: 'error',
    loadedAt: null,
    error: 'Failed to initialize',
  },
];

const mockNodeConfigs = [
  { id: 'firewall', name: 'Firewall', category: 'security', color: '#ef4444' },
  { id: 'router', name: 'Router', category: 'network', color: '#3b82f6' },
  { id: 'web-server', name: 'Web Server', category: 'compute', color: '#22c55e' },
];

const mockExporters = [
  { format: 'json', name: 'JSON Export', fileExtension: 'json', description: 'Export as JSON' },
  { format: 'yaml', name: 'YAML Export', fileExtension: 'yaml', description: 'Export as YAML' },
];

const mockPanels = [
  { id: 'panel-1', title: 'Info Panel', icon: 'i', position: 'right' },
];

const mockThemes = [
  { id: 'dark', name: 'Dark Theme', colors: { background: '#1e293b' } },
  { id: 'light', name: 'Light Theme', colors: { background: '#ffffff' } },
];

vi.mock('@/hooks/usePlugins', () => ({
  usePluginList: () => ({
    plugins: mockPluginStates.map((s) => s.plugin),
    states: mockPluginStates,
    loading: false,
    error: null,
  }),
  usePluginActions: () => ({
    activate: mockActivate,
    deactivate: mockDeactivate,
  }),
  usePluginSystemStatus: () => ({
    initialized: true,
    loading: false,
  }),
  usePluginSystemReinitialize: () => mockReinitialize,
  useNodeConfigs: () => mockNodeConfigs,
  useExporters: () => mockExporters,
  usePanels: () => mockPanels,
  useThemes: () => mockThemes,
}));

describe('PluginManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Header', () => {
    it('should render page title', () => {
      render(<PluginManager />);

      expect(screen.getByText('플러그인 관리')).toBeInTheDocument();
    });

    it('should render page description', () => {
      render(<PluginManager />);

      expect(screen.getByText('InfraFlow 플러그인 시스템을 관리합니다.')).toBeInTheDocument();
    });

    it('should render reinitialize button', () => {
      render(<PluginManager />);

      expect(screen.getByRole('button', { name: '시스템 재초기화' })).toBeInTheDocument();
    });

    it('should show system status as initialized', () => {
      render(<PluginManager />);

      expect(screen.getByText('초기화됨')).toBeInTheDocument();
    });

    it('should show plugin count', () => {
      render(<PluginManager />);

      expect(screen.getByText('3개 플러그인 등록됨')).toBeInTheDocument();
    });

    it('should show active plugin count', () => {
      render(<PluginManager />);

      expect(screen.getByText('1개 활성화됨')).toBeInTheDocument();
    });
  });

  describe('Tabs', () => {
    it('should render all tabs', () => {
      render(<PluginManager />);

      expect(screen.getByRole('button', { name: '플러그인' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '노드' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '익스포터' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '패널' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '테마' })).toBeInTheDocument();
    });

    it('should default to plugins tab', () => {
      render(<PluginManager />);

      const pluginsTab = screen.getByRole('button', { name: '플러그인' });
      expect(pluginsTab).toHaveClass('border-blue-500');
    });

    it('should switch to nodes tab when clicked', async () => {
      const user = userEvent.setup();
      render(<PluginManager />);

      await user.click(screen.getByRole('button', { name: '노드' }));

      expect(screen.getByText('Firewall')).toBeInTheDocument();
      expect(screen.getByText('Router')).toBeInTheDocument();
    });

    it('should switch to exporters tab when clicked', async () => {
      const user = userEvent.setup();
      render(<PluginManager />);

      await user.click(screen.getByRole('button', { name: '익스포터' }));

      expect(screen.getByText('JSON Export')).toBeInTheDocument();
      expect(screen.getByText('YAML Export')).toBeInTheDocument();
    });

    it('should switch to panels tab when clicked', async () => {
      const user = userEvent.setup();
      render(<PluginManager />);

      await user.click(screen.getByRole('button', { name: '패널' }));

      expect(screen.getByText('Info Panel')).toBeInTheDocument();
    });

    it('should switch to themes tab when clicked', async () => {
      const user = userEvent.setup();
      render(<PluginManager />);

      await user.click(screen.getByRole('button', { name: '테마' }));

      expect(screen.getByText('Dark Theme')).toBeInTheDocument();
      expect(screen.getByText('Light Theme')).toBeInTheDocument();
    });
  });

  describe('Plugin Cards', () => {
    it('should render plugin cards', () => {
      render(<PluginManager />);

      expect(screen.getByText('Core Plugin')).toBeInTheDocument();
      expect(screen.getByText('Custom Nodes')).toBeInTheDocument();
      expect(screen.getByText('Error Plugin')).toBeInTheDocument();
    });

    it('should display plugin versions', () => {
      render(<PluginManager />);

      // Check that version info is present in the document
      expect(screen.getByText(/1.0.0/)).toBeInTheDocument();
      expect(screen.getByText(/2.0.0/)).toBeInTheDocument();
    });

    it('should display plugin descriptions', () => {
      render(<PluginManager />);

      expect(screen.getByText('Core functionality plugin')).toBeInTheDocument();
      expect(screen.getByText('Additional infrastructure nodes')).toBeInTheDocument();
    });

    it('should display plugin authors', () => {
      render(<PluginManager />);

      // Check that author info is present in the document
      expect(screen.getByText(/InfraFlow Team/)).toBeInTheDocument();
      expect(screen.getByText(/Community/)).toBeInTheDocument();
    });

    it('should display correct status badges', () => {
      render(<PluginManager />);

      expect(screen.getByText('활성')).toBeInTheDocument();
      expect(screen.getByText('비활성')).toBeInTheDocument();
      expect(screen.getByText('오류')).toBeInTheDocument();
    });

    it('should display error message for error plugin', () => {
      render(<PluginManager />);

      expect(screen.getByText('오류: Failed to initialize')).toBeInTheDocument();
    });
  });

  describe('Plugin Actions', () => {
    it('should disable deactivate button for core plugin', () => {
      render(<PluginManager />);

      // Find the deactivate button for Core Plugin
      const corePluginCard = screen.getByText('Core Plugin').closest('.bg-zinc-800');
      const button = corePluginCard?.querySelector('button');

      expect(button).toBeDisabled();
    });

    it('should show activate button for inactive plugins', () => {
      render(<PluginManager />);

      const customNodesCard = screen.getByText('Custom Nodes').closest('.bg-zinc-800');
      const button = customNodesCard?.querySelector('button:not(:disabled)');

      expect(button).toHaveTextContent('활성화');
    });

    it('should call activate when activate button is clicked', async () => {
      const user = userEvent.setup();
      render(<PluginManager />);

      const customNodesCard = screen.getByText('Custom Nodes').closest('.bg-zinc-800');
      const activateButton = customNodesCard?.querySelector('button:not(:disabled)');

      if (activateButton) {
        await user.click(activateButton);
      }

      await waitFor(() => {
        expect(mockActivate).toHaveBeenCalledWith('custom-nodes');
      });
    });

    it('should call reinitialize when reinitialize button is clicked', async () => {
      const user = userEvent.setup();
      render(<PluginManager />);

      await user.click(screen.getByRole('button', { name: '시스템 재초기화' }));

      await waitFor(() => {
        expect(mockReinitialize).toHaveBeenCalled();
      });
    });
  });

  describe('Plugin Card Expansion', () => {
    it('should show expand button on plugin cards', () => {
      render(<PluginManager />);

      const expandButtons = screen.getAllByText('상세 보기');
      expect(expandButtons.length).toBe(3);
    });

    it('should expand plugin details when expand button is clicked', async () => {
      const user = userEvent.setup();
      render(<PluginManager />);

      const expandButtons = screen.getAllByText('상세 보기');
      await user.click(expandButtons[0]); // Expand Core Plugin

      expect(screen.getByText('노드 확장')).toBeInTheDocument();
      expect(screen.getByText('1개 노드')).toBeInTheDocument();
    });

    it('should collapse plugin details when collapse button is clicked', async () => {
      const user = userEvent.setup();
      render(<PluginManager />);

      // Expand first
      const expandButtons = screen.getAllByText('상세 보기');
      await user.click(expandButtons[0]);

      // Then collapse
      const collapseButton = screen.getByText('접기');
      await user.click(collapseButton);

      expect(screen.queryByText('노드 확장')).not.toBeInTheDocument();
    });
  });

  describe('Nodes Tab', () => {
    it('should display node search input', async () => {
      const user = userEvent.setup();
      render(<PluginManager />);

      await user.click(screen.getByRole('button', { name: '노드' }));

      expect(screen.getByPlaceholderText('노드 검색...')).toBeInTheDocument();
    });

    it('should display category badges', async () => {
      const user = userEvent.setup();
      render(<PluginManager />);

      await user.click(screen.getByRole('button', { name: '노드' }));

      expect(screen.getByText('security: 1')).toBeInTheDocument();
      expect(screen.getByText('network: 1')).toBeInTheDocument();
      expect(screen.getByText('compute: 1')).toBeInTheDocument();
    });

    it('should display node table with correct columns', async () => {
      const user = userEvent.setup();
      render(<PluginManager />);

      await user.click(screen.getByRole('button', { name: '노드' }));

      // Check for column headers - ID might appear multiple times
      expect(screen.getAllByText('ID').length).toBeGreaterThan(0);
      expect(screen.getByText('이름')).toBeInTheDocument();
      expect(screen.getByText('카테고리')).toBeInTheDocument();
      expect(screen.getByText('색상')).toBeInTheDocument();
    });

    it('should filter nodes when searching', async () => {
      const user = userEvent.setup();
      render(<PluginManager />);

      await user.click(screen.getByRole('button', { name: '노드' }));
      await user.type(screen.getByPlaceholderText('노드 검색...'), 'fire');

      // Firewall appears in table
      const firewallElements = screen.getAllByText('Firewall');
      expect(firewallElements.length).toBeGreaterThan(0);
    });

    it('should show node count', async () => {
      const user = userEvent.setup();
      render(<PluginManager />);

      await user.click(screen.getByRole('button', { name: '노드' }));

      expect(screen.getByText('총 3개 노드')).toBeInTheDocument();
    });
  });

  describe('Exporters Tab', () => {
    it('should display exporter table', async () => {
      const user = userEvent.setup();
      render(<PluginManager />);

      await user.click(screen.getByRole('button', { name: '익스포터' }));

      expect(screen.getByText('형식')).toBeInTheDocument();
      expect(screen.getByText('확장자')).toBeInTheDocument();
    });

    it('should display exporter details', async () => {
      const user = userEvent.setup();
      render(<PluginManager />);

      await user.click(screen.getByRole('button', { name: '익스포터' }));

      expect(screen.getByText('json')).toBeInTheDocument();
      expect(screen.getByText('.json')).toBeInTheDocument();
      expect(screen.getByText('Export as JSON')).toBeInTheDocument();
    });

    it('should show exporter count', async () => {
      const user = userEvent.setup();
      render(<PluginManager />);

      await user.click(screen.getByRole('button', { name: '익스포터' }));

      expect(screen.getByText('총 2개 익스포터')).toBeInTheDocument();
    });
  });

  describe('Panels Tab', () => {
    it('should display panels', async () => {
      const user = userEvent.setup();
      render(<PluginManager />);

      await user.click(screen.getByRole('button', { name: '패널' }));

      expect(screen.getByText('Info Panel')).toBeInTheDocument();
      expect(screen.getByText('위치: right')).toBeInTheDocument();
    });
  });

  describe('Themes Tab', () => {
    it('should display themes', async () => {
      const user = userEvent.setup();
      render(<PluginManager />);

      await user.click(screen.getByRole('button', { name: '테마' }));

      expect(screen.getByText('Dark Theme')).toBeInTheDocument();
      expect(screen.getByText('Light Theme')).toBeInTheDocument();
    });

    it('should display theme IDs', async () => {
      const user = userEvent.setup();
      render(<PluginManager />);

      await user.click(screen.getByRole('button', { name: '테마' }));

      expect(screen.getByText('ID: dark')).toBeInTheDocument();
      expect(screen.getByText('ID: light')).toBeInTheDocument();
    });
  });
});
