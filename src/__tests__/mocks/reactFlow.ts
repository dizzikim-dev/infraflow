import { vi } from 'vitest';

// Mock React Flow hooks and components
export const mockReactFlow = {
  useReactFlow: vi.fn(() => ({
    getNodes: vi.fn(() => []),
    getEdges: vi.fn(() => []),
    setNodes: vi.fn(),
    setEdges: vi.fn(),
    fitView: vi.fn(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    project: vi.fn((pos) => pos),
    screenToFlowPosition: vi.fn((pos) => pos),
  })),
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => children,
  ReactFlow: vi.fn(({ children }) => children),
  Background: vi.fn(() => null),
  Controls: vi.fn(() => null),
  MiniMap: vi.fn(() => null),
  Handle: vi.fn(() => null),
  Position: {
    Left: 'left',
    Right: 'right',
    Top: 'top',
    Bottom: 'bottom',
  },
  MarkerType: {
    Arrow: 'arrow',
    ArrowClosed: 'arrowclosed',
  },
};

vi.mock('@xyflow/react', () => mockReactFlow);
