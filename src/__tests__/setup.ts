/**
 * Vitest Test Setup
 *
 * Global mocks and configurations for all tests
 */

import '@testing-library/jest-dom/vitest';
import { vi, beforeAll, afterEach, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';

// ============================================================
// Browser API Mocks
// ============================================================

// Mock ResizeObserver
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

// Mock IntersectionObserver
class IntersectionObserverMock {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}
global.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;

// Mock MutationObserver
class MutationObserverMock {
  observe = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}
global.MutationObserver = MutationObserverMock as unknown as typeof MutationObserver;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock window.scroll
Object.defineProperty(window, 'scroll', {
  writable: true,
  value: vi.fn(),
});

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(7),
    getRandomValues: <T extends ArrayBufferView | null>(array: T): T => {
      if (array) {
        const uint8Array = new Uint8Array(array.buffer);
        for (let i = 0; i < uint8Array.length; i++) {
          uint8Array[i] = Math.floor(Math.random() * 256);
        }
      }
      return array;
    },
  },
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', { value: localStorageMock });

// Mock URL.createObjectURL and revokeObjectURL
URL.createObjectURL = vi.fn(() => 'blob:mock-url');
URL.revokeObjectURL = vi.fn();

// Mock HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: [] })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => []),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
})) as unknown as typeof HTMLCanvasElement.prototype.getContext;

// Mock HTMLCanvasElement.prototype.toBlob
HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
  callback(new Blob(['mock'], { type: 'image/png' }));
});

// Mock HTMLCanvasElement.prototype.toDataURL
HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,mock');

// ============================================================
// React Flow Mocks
// ============================================================

vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react');
  return {
    ...actual,
    ReactFlow: vi.fn(({ children }) => children),
    useReactFlow: vi.fn(() => ({
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => []),
      setNodes: vi.fn(),
      setEdges: vi.fn(),
      fitView: vi.fn(),
      zoomIn: vi.fn(),
      zoomOut: vi.fn(),
      getViewport: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
      setViewport: vi.fn(),
      project: vi.fn((pos) => pos),
      screenToFlowPosition: vi.fn((pos) => pos),
    })),
    useNodesState: vi.fn((initialNodes) => {
      const nodes = initialNodes || [];
      return [nodes, vi.fn(), vi.fn()];
    }),
    useEdgesState: vi.fn((initialEdges) => {
      const edges = initialEdges || [];
      return [edges, vi.fn(), vi.fn()];
    }),
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
    Background: vi.fn(() => null),
    Controls: vi.fn(() => null),
    MiniMap: vi.fn(() => null),
    Panel: vi.fn(({ children }) => children),
    ReactFlowProvider: vi.fn(({ children }) => children),
    getBezierPath: vi.fn(() => ['M0,0', 0, 0]),
    getSmoothStepPath: vi.fn(() => ['M0,0', 0, 0]),
    getStraightPath: vi.fn(() => ['M0,0', 0, 0]),
  };
});

// ============================================================
// Framer Motion Mocks
// ============================================================

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: vi.fn(({ children, ...props }) => {
        const { initial, animate, exit, variants, whileHover, whileTap, ...rest } = props;
        return { type: 'div', props: { ...rest, 'data-testid': rest['data-testid'] }, children };
      }),
      span: vi.fn(({ children, ...props }) => {
        const { initial, animate, exit, ...rest } = props;
        return { type: 'span', props: rest, children };
      }),
      button: vi.fn(({ children, ...props }) => {
        const { initial, animate, exit, whileHover, whileTap, ...rest } = props;
        return { type: 'button', props: rest, children };
      }),
      path: vi.fn((props) => ({ type: 'path', props })),
      circle: vi.fn((props) => ({ type: 'circle', props })),
    },
    AnimatePresence: vi.fn(({ children }) => children),
    useAnimation: vi.fn(() => ({
      start: vi.fn(),
      stop: vi.fn(),
      set: vi.fn(),
    })),
    useMotionValue: vi.fn((initial) => ({
      get: () => initial,
      set: vi.fn(),
      on: vi.fn(),
    })),
    useTransform: vi.fn((value, inputRange, outputRange) => ({
      get: () => outputRange?.[0] ?? 0,
    })),
    useSpring: vi.fn((value) => value),
    useInView: vi.fn(() => true),
  };
});

// ============================================================
// Next.js Mocks
// ============================================================

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useParams: vi.fn(() => ({})),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

vi.mock('next/image', () => ({
  default: vi.fn(({ src, alt, ...props }) => ({
    type: 'img',
    props: { src, alt, ...props },
  })),
}));

vi.mock('next/link', () => ({
  default: vi.fn(({ children, href, ...props }) => ({
    type: 'a',
    props: { href, ...props },
    children,
  })),
}));

// ============================================================
// External Library Mocks
// ============================================================

// Mock html2canvas (used for export)
vi.mock('html2canvas', () => ({
  default: vi.fn(() =>
    Promise.resolve({
      toBlob: vi.fn((callback) => callback(new Blob(['mock']))),
      toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
      width: 800,
      height: 600,
    })
  ),
}));

// Mock jspdf (used for PDF export)
vi.mock('jspdf', () => ({
  jsPDF: vi.fn(() => ({
    addImage: vi.fn(),
    addPage: vi.fn(),
    setPage: vi.fn(),
    getNumberOfPages: vi.fn(() => 1),
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    setFillColor: vi.fn(),
    setDrawColor: vi.fn(),
    text: vi.fn(),
    rect: vi.fn(),
    line: vi.fn(),
    output: vi.fn(() => new Blob(['mock pdf'])),
    internal: {
      pageSize: {
        getWidth: vi.fn(() => 210),
        getHeight: vi.fn(() => 297),
      },
    },
    splitTextToSize: vi.fn((text) => [text]),
  })),
}));

// ============================================================
// Console Suppression
// ============================================================

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args: unknown[]) => {
  const message = args[0];
  if (typeof message === 'string') {
    // Suppress known React/library warnings in tests
    if (
      message.includes('ReactFlow') ||
      message.includes('Warning: ReactDOM') ||
      message.includes('Not implemented') ||
      message.includes('act(') ||
      message.includes('Warning: An update to')
    ) {
      return;
    }
  }
  originalConsoleError.apply(console, args);
};

console.warn = (...args: unknown[]) => {
  const message = args[0];
  if (typeof message === 'string') {
    if (
      message.includes('ReactFlow') ||
      message.includes('Framer Motion')
    ) {
      return;
    }
  }
  originalConsoleWarn.apply(console, args);
};

// ============================================================
// Test Lifecycle Hooks
// ============================================================

beforeAll(() => {
  // Reset all mocks before all tests
  vi.clearAllMocks();
});

afterEach(() => {
  // Cleanup DOM after each test
  cleanup();
  // Clear localStorage mock
  localStorageMock.clear();
  // Reset all mocks
  vi.clearAllMocks();
});

afterAll(() => {
  // Restore console
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
