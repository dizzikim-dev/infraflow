/**
 * Test Utility: renderWithProviders
 *
 * Wraps components with necessary providers for testing
 */

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { vi } from 'vitest';

// ============================================================
// Provider Wrappers
// ============================================================

/**
 * Mock ReactFlow Provider
 */
const MockReactFlowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <div data-testid="react-flow-provider">{children}</div>;
};

/**
 * Mock Animation Provider
 */
const MockAnimationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <div data-testid="animation-provider">{children}</div>;
};

/**
 * Combined providers wrapper
 */
interface ProvidersProps {
  children: ReactNode;
}

const AllProviders: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <MockReactFlowProvider>
      <MockAnimationProvider>
        {children}
      </MockAnimationProvider>
    </MockReactFlowProvider>
  );
};

// ============================================================
// Custom Render Options
// ============================================================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * Initial route for testing (e.g., '/admin/components')
   */
  route?: string;
  /**
   * Whether to include React Flow provider
   */
  withReactFlow?: boolean;
  /**
   * Whether to include Animation provider
   */
  withAnimation?: boolean;
  /**
   * Custom wrapper component
   */
  wrapper?: React.ComponentType<{ children: ReactNode }>;
}

// ============================================================
// Custom Render Function
// ============================================================

/**
 * Custom render function that wraps components with providers
 *
 * @example
 * ```tsx
 * import { renderWithProviders, screen } from '@/__tests__/utils/renderWithProviders';
 *
 * test('renders component', () => {
 *   renderWithProviders(<MyComponent />);
 *   expect(screen.getByText('Hello')).toBeInTheDocument();
 * });
 * ```
 */
function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult & { rerender: (ui: ReactElement) => void } {
  const {
    route = '/',
    withReactFlow = true,
    withAnimation = true,
    wrapper: CustomWrapper,
    ...renderOptions
  } = options;

  // Set up route if provided
  if (route !== '/') {
    window.history.pushState({}, 'Test page', route);
  }

  // Create wrapper based on options
  const Wrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
    let content = <>{children}</>;

    if (withAnimation) {
      content = <MockAnimationProvider>{content}</MockAnimationProvider>;
    }

    if (withReactFlow) {
      content = <MockReactFlowProvider>{content}</MockReactFlowProvider>;
    }

    if (CustomWrapper) {
      content = <CustomWrapper>{content}</CustomWrapper>;
    }

    return content;
  };

  const result = render(ui, { wrapper: Wrapper, ...renderOptions });

  return {
    ...result,
    rerender: (newUi: ReactNode) => result.rerender(
      <Wrapper>{newUi}</Wrapper>
    ),
  };
}

// ============================================================
// Re-export Testing Library
// ============================================================

export * from '@testing-library/react';
export { renderWithProviders };
export { AllProviders };

// ============================================================
// Custom Queries
// ============================================================

/**
 * Query by data-node-type attribute (used in infrastructure nodes)
 */
export function queryByNodeType(
  container: HTMLElement,
  nodeType: string
): HTMLElement | null {
  return container.querySelector(`[data-node-type="${nodeType}"]`);
}

/**
 * Query all by data-node-type attribute
 */
export function queryAllByNodeType(
  container: HTMLElement,
  nodeType: string
): HTMLElement[] {
  return Array.from(container.querySelectorAll(`[data-node-type="${nodeType}"]`));
}

/**
 * Query by data-testid with partial match
 */
export function queryByTestIdPartial(
  container: HTMLElement,
  partialId: string
): HTMLElement | null {
  return container.querySelector(`[data-testid*="${partialId}"]`);
}

// ============================================================
// Mock Data Generators
// ============================================================

/**
 * Generate mock InfraSpec for testing
 */
export function createMockInfraSpec(overrides = {}) {
  return {
    nodes: [
      { id: 'user-1', type: 'user', label: 'User' },
      { id: 'firewall-1', type: 'firewall', label: 'Firewall' },
      { id: 'web-server-1', type: 'web-server', label: 'Web Server' },
    ],
    connections: [
      { source: 'user-1', target: 'firewall-1' },
      { source: 'firewall-1', target: 'web-server-1' },
    ],
    ...overrides,
  };
}

/**
 * Generate mock React Flow Node
 */
export function createMockNode(overrides = {}) {
  return {
    id: `node-${Math.random().toString(36).substr(2, 9)}`,
    type: 'firewall',
    position: { x: 0, y: 0 },
    data: {
      nodeType: 'firewall',
      label: 'Test Node',
      description: 'Test Description',
      zone: 'dmz',
    },
    ...overrides,
  };
}

/**
 * Generate mock React Flow Edge
 */
export function createMockEdge(overrides = {}) {
  return {
    id: `edge-${Math.random().toString(36).substr(2, 9)}`,
    source: 'node-1',
    target: 'node-2',
    type: 'animated',
    animated: true,
    ...overrides,
  };
}

// ============================================================
// Wait Utilities
// ============================================================

/**
 * Wait for a condition to be true
 */
export async function waitForCondition(
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

/**
 * Wait for all promises to settle
 */
export async function flushPromises(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

// ============================================================
// Event Helpers
// ============================================================

/**
 * Simulate a drag event
 */
export function createDragEvent(
  type: string,
  options: { clientX?: number; clientY?: number; dataTransfer?: DataTransfer } = {}
): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, {
    clientX: options.clientX ?? 0,
    clientY: options.clientY ?? 0,
    dataTransfer: options.dataTransfer ?? {
      setData: vi.fn(),
      getData: vi.fn(() => ''),
      dropEffect: 'move',
      effectAllowed: 'all',
    },
  });
  return event;
}

/**
 * Simulate keyboard event
 */
export function createKeyboardEvent(
  type: string,
  key: string,
  options: { ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean; metaKey?: boolean } = {}
): KeyboardEvent {
  return new KeyboardEvent(type, {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  });
}
