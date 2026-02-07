import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlowCanvas } from '@/components/shared/FlowCanvas';
import { Node, Edge } from '@xyflow/react';

// Mock @xyflow/react
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react');
  return {
    ...actual,
    ReactFlow: ({ children, nodes, edges, ...props }: any) => (
      <div data-testid="react-flow" data-nodes={JSON.stringify(nodes)} data-edges={JSON.stringify(edges)}>
        {children}
      </div>
    ),
    ReactFlowProvider: ({ children }: any) => <div data-testid="react-flow-provider">{children}</div>,
    Background: () => <div data-testid="background" />,
    Controls: () => <div data-testid="controls" />,
    MiniMap: () => <div data-testid="minimap" />,
    useNodesState: (initialNodes: Node[]) => [initialNodes, vi.fn(), vi.fn()],
    useEdgesState: (initialEdges: Edge[]) => [initialEdges, vi.fn(), vi.fn()],
    useReactFlow: () => ({
      screenToFlowPosition: vi.fn((pos) => pos),
    }),
    addEdge: vi.fn((params, edges) => [...edges, params]),
    Position: { Left: 'left', Right: 'right', Top: 'top', Bottom: 'bottom' },
    Handle: () => null,
    BackgroundVariant: { Dots: 'dots' },
  };
});

// Mock hooks
vi.mock('@/hooks/useHistory', () => ({
  useHistory: vi.fn(),
}));

vi.mock('@/hooks/useNodeEditing', () => ({
  NodeEditingProvider: ({ children }: any) => <div data-testid="node-editing-provider">{children}</div>,
}));

// Mock node and edge types
vi.mock('@/components/nodes', () => ({
  nodeTypes: {},
}));

vi.mock('@/components/edges', () => ({
  edgeTypes: {},
}));

describe('FlowCanvas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with ReactFlowProvider', () => {
      render(<FlowCanvas />);
      expect(screen.getByTestId('react-flow-provider')).toBeInTheDocument();
    });

    it('should render ReactFlow component', () => {
      render(<FlowCanvas />);
      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });

    it('should render Background component', () => {
      render(<FlowCanvas />);
      expect(screen.getByTestId('background')).toBeInTheDocument();
    });

    it('should render Controls component', () => {
      render(<FlowCanvas />);
      expect(screen.getByTestId('controls')).toBeInTheDocument();
    });

    it('should render MiniMap component', () => {
      render(<FlowCanvas />);
      expect(screen.getByTestId('minimap')).toBeInTheDocument();
    });

    it('should render NodeEditingProvider', () => {
      render(<FlowCanvas />);
      expect(screen.getByTestId('node-editing-provider')).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('should pass initial nodes to ReactFlow', () => {
      const initialNodes: Node[] = [
        { id: 'node-1', type: 'firewall', position: { x: 0, y: 0 }, data: { label: 'Firewall' } },
      ];

      render(<FlowCanvas initialNodes={initialNodes} />);

      const reactFlow = screen.getByTestId('react-flow');
      expect(reactFlow.getAttribute('data-nodes')).toBe(JSON.stringify(initialNodes));
    });

    it('should pass initial edges to ReactFlow', () => {
      const initialEdges: Edge[] = [
        { id: 'edge-1', source: 'node-1', target: 'node-2' },
      ];

      render(<FlowCanvas initialEdges={initialEdges} />);

      const reactFlow = screen.getByTestId('react-flow');
      expect(reactFlow.getAttribute('data-edges')).toBe(JSON.stringify(initialEdges));
    });

    it('should use empty arrays as default for nodes and edges', () => {
      render(<FlowCanvas />);

      const reactFlow = screen.getByTestId('react-flow');
      expect(reactFlow.getAttribute('data-nodes')).toBe('[]');
      expect(reactFlow.getAttribute('data-edges')).toBe('[]');
    });
  });

  describe('Callbacks', () => {
    it('should accept onNodesChange callback', () => {
      const onNodesChange = vi.fn();
      render(<FlowCanvas onNodesChange={onNodesChange} />);
      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });

    it('should accept onEdgesChange callback', () => {
      const onEdgesChange = vi.fn();
      render(<FlowCanvas onEdgesChange={onEdgesChange} />);
      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });

    it('should accept onNodeClick callback', () => {
      const onNodeClick = vi.fn();
      render(<FlowCanvas onNodeClick={onNodeClick} />);
      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });

    it('should accept context menu callbacks', () => {
      const onCanvasContextMenu = vi.fn();
      const onNodeContextMenu = vi.fn();
      const onEdgeContextMenu = vi.fn();

      render(
        <FlowCanvas
          onCanvasContextMenu={onCanvasContextMenu}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeContextMenu={onEdgeContextMenu}
        />
      );

      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });
  });
});
