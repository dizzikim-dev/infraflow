import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EvidencePanel } from '../EvidencePanel';
import type { InfraSpec } from '@/types/infra';

// Mock framer-motion to simplify rendering
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const {
        initial, animate, exit, transition,
        whileHover, whileTap, ...rest
      } = props;
      return <div {...rest}>{children as React.ReactNode}</div>;
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ============================================================
// Fixtures
// ============================================================

const baseSpec: InfraSpec = {
  nodes: [
    { id: 'node-0', type: 'firewall', label: 'Firewall' },
    { id: 'node-1', type: 'router', label: 'Router' },
    { id: 'node-2', type: 'switch-l2', label: 'Switch' },
  ],
  connections: [],
};

const defaultProps = {
  nodeId: 'node-0',
  nodeType: 'firewall' as const,
  nodeLabel: 'Firewall',
  spec: baseSpec,
  onClose: vi.fn(),
};

// ============================================================
// Tests
// ============================================================

describe('EvidencePanel', () => {
  it('renders 4 tabs', () => {
    render(<EvidencePanel {...defaultProps} />);

    expect(screen.getByText('연결 관계')).toBeDefined();
    expect(screen.getByText('제품 추천')).toBeDefined();
    expect(screen.getByText('검증')).toBeDefined();
    expect(screen.getByText('근거')).toBeDefined();
  });

  it('renders header with node label', () => {
    render(<EvidencePanel {...defaultProps} />);

    expect(screen.getByText('Evidence')).toBeDefined();
    expect(screen.getByText('Firewall (firewall)')).toBeDefined();
  });

  it('shows empty state when nodeId is null', () => {
    render(<EvidencePanel {...defaultProps} nodeId={null} />);

    expect(screen.getByText('노드를 선택하면 근거 정보가 표시됩니다.')).toBeDefined();
  });

  it('switches tabs on click', () => {
    render(<EvidencePanel {...defaultProps} />);

    // Click recommendations tab
    fireEvent.click(screen.getByText('제품 추천'));
    // The recommendations tab content should render (empty state or items)
    // Since we clicked the tab, it should be active
    const recTab = screen.getByText('제품 추천');
    expect(recTab.closest('button')?.className).toContain('emerald');
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<EvidencePanel {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders footer summary with vendor count', () => {
    render(<EvidencePanel {...defaultProps} />);

    // Footer should contain "relationships", "products", and "vendors" text
    expect(screen.getByText(/relationships/)).toBeDefined();
    expect(screen.getByText(/products/)).toBeDefined();
    expect(screen.getByText(/vendors/)).toBeDefined();
  });

  it('shows view toggle when recommendations tab is active', () => {
    render(<EvidencePanel {...defaultProps} />);

    // Switch to recommendations tab
    fireEvent.click(screen.getByText('제품 추천'));

    // View toggle should exist
    expect(screen.getByText(/점수순/)).toBeDefined();
    expect(screen.getByText(/벤더별 비교/)).toBeDefined();
  });
});
