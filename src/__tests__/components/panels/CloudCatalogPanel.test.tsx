/**
 * CloudCatalogPanel Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CloudCatalogPanel } from '@/components/panels/CloudCatalogPanel';
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
    { id: 'lb-1', type: 'load-balancer', label: 'Load Balancer' },
    { id: 'fw-1', type: 'firewall', label: 'Firewall' },
    { id: 'iam-1', type: 'iam', label: 'IAM' },
  ],
  connections: [],
};

describe('CloudCatalogPanel', () => {
  it('should render panel header', () => {
    const onClose = vi.fn();
    render(<CloudCatalogPanel spec={mockSpec} onClose={onClose} />);
    expect(screen.getByText('클라우드 서비스 카탈로그')).toBeDefined();
  });

  it('should show empty state when spec is null', () => {
    const onClose = vi.fn();
    render(<CloudCatalogPanel spec={null} onClose={onClose} />);
    expect(screen.getByText('다이어그램을 먼저 생성해주세요.')).toBeDefined();
  });

  it('should display two tabs', () => {
    const onClose = vi.fn();
    render(<CloudCatalogPanel spec={mockSpec} onClose={onClose} />);
    expect(screen.getByText('Deprecation 경고')).toBeDefined();
    expect(screen.getByText('서비스 카탈로그')).toBeDefined();
  });

  it('should show deprecation warnings', () => {
    const onClose = vi.fn();
    render(<CloudCatalogPanel spec={mockSpec} onClose={onClose} />);
    // AWS CLB is deprecated for load-balancer, Azure AD is deprecated for iam
    expect(screen.getAllByText(/더 이상 사용되지 않습니다/).length).toBeGreaterThan(0);
  });

  it('should switch to catalog tab', () => {
    const onClose = vi.fn();
    render(<CloudCatalogPanel spec={mockSpec} onClose={onClose} />);
    fireEvent.click(screen.getByText('서비스 카탈로그'));
    // Should show provider filter buttons
    expect(screen.getByText('전체')).toBeDefined();
    expect(screen.getAllByText('AWS').length).toBeGreaterThan(0);
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<CloudCatalogPanel spec={mockSpec} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('닫기'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should show footer', () => {
    const onClose = vi.fn();
    render(<CloudCatalogPanel spec={mockSpec} onClose={onClose} />);
    expect(screen.getByText(/AWS, Azure, GCP/)).toBeDefined();
  });
});
