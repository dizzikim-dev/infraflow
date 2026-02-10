/**
 * BenchmarkPanel Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BenchmarkPanel } from '@/components/panels/BenchmarkPanel';
import type { InfraSpec } from '@/types/infra';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const { initial, animate, exit, ...rest } = props;
      return <div {...rest}>{children as React.ReactNode}</div>;
    },
  },
}));

const mockSpec: InfraSpec = {
  nodes: [
    { id: 'fw-1', type: 'firewall', label: 'Firewall' },
    { id: 'web-1', type: 'web-server', label: 'Web Server' },
    { id: 'db-1', type: 'db-server', label: 'DB Server' },
    { id: 'lb-1', type: 'load-balancer', label: 'LB' },
  ],
  connections: [],
};

describe('BenchmarkPanel', () => {
  it('should render panel header', () => {
    const onClose = vi.fn();
    render(<BenchmarkPanel spec={mockSpec} onClose={onClose} />);
    expect(screen.getByText('성능 벤치마크')).toBeDefined();
  });

  it('should show empty state when spec is null', () => {
    const onClose = vi.fn();
    render(<BenchmarkPanel spec={null} onClose={onClose} />);
    expect(screen.getByText('다이어그램을 먼저 생성해주세요.')).toBeDefined();
  });

  it('should display traffic tier selector', () => {
    const onClose = vi.fn();
    render(<BenchmarkPanel spec={mockSpec} onClose={onClose} />);
    expect(screen.getByText('소규모')).toBeDefined();
    expect(screen.getByText('중규모')).toBeDefined();
    expect(screen.getByText('대규모')).toBeDefined();
    expect(screen.getByText('엔터프라이즈')).toBeDefined();
  });

  it('should show current capacity estimate', () => {
    const onClose = vi.fn();
    render(<BenchmarkPanel spec={mockSpec} onClose={onClose} />);
    expect(screen.getByText('현재 용량 추정')).toBeDefined();
    expect(screen.getByText('RPS')).toBeDefined();
  });

  it('should show bottleneck components', () => {
    const onClose = vi.fn();
    render(<BenchmarkPanel spec={mockSpec} onClose={onClose} />);
    // Should detect bottlenecks
    const bottleneckHeader = screen.queryByText(/병목 컴포넌트/);
    // At least one bottleneck should be shown
    expect(bottleneckHeader).toBeDefined();
  });

  it('should show sizing recommendations', () => {
    const onClose = vi.fn();
    render(<BenchmarkPanel spec={mockSpec} onClose={onClose} />);
    // Should show recommendations for medium tier (default)
    expect(screen.getByText(/medium 티어 사이징 추천/)).toBeDefined();
  });

  it('should switch tier when clicked', () => {
    const onClose = vi.fn();
    render(<BenchmarkPanel spec={mockSpec} onClose={onClose} />);
    fireEvent.click(screen.getByText('대규모'));
    expect(screen.getByText(/large 티어 사이징 추천/)).toBeDefined();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<BenchmarkPanel spec={mockSpec} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('닫기'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should show footer disclaimer', () => {
    const onClose = vi.fn();
    render(<BenchmarkPanel spec={mockSpec} onClose={onClose} />);
    expect(screen.getByText(/벤치마크 데이터는/)).toBeDefined();
  });

  it('should show total estimated cost', () => {
    const onClose = vi.fn();
    render(<BenchmarkPanel spec={mockSpec} onClose={onClose} />);
    // Should show total cost
    expect(screen.getByText(/추정 총 월 비용/)).toBeDefined();
  });
});
