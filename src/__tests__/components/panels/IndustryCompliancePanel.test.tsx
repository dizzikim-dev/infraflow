/**
 * IndustryCompliancePanel Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IndustryCompliancePanel } from '@/components/panels/IndustryCompliancePanel';
import type { InfraSpec } from '@/types/infra';
import { analyzeComplianceGap } from '@/lib/audit/industryCompliance';
import type { IndustryType } from '@/lib/audit/industryCompliance';
import { useState, useCallback } from 'react';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const { initial, animate, exit, ...rest } = props;
      return <div {...rest}>{children as React.ReactNode}</div>;
    },
  },
}));

// Mock hook to bypass fetch — compute data synchronously
vi.mock('@/hooks/useIndustryCompliance', () => ({
  useIndustryCompliance: (spec: InfraSpec | null) => {
    const [selectedIndustry, setSelectedIndustry] = useState<IndustryType>('general');
    const report = spec && spec.nodes.length > 0 ? analyzeComplianceGap(spec, selectedIndustry) : null;
    const setIndustry = useCallback((industry: IndustryType) => setSelectedIndustry(industry), []);
    return { report, selectedIndustry, setIndustry, analyze: () => {}, isAnalyzing: false };
  },
}));

const mockSpec: InfraSpec = {
  nodes: [
    { id: 'fw-1', type: 'firewall', label: 'Firewall' },
    { id: 'mfa-1', type: 'mfa', label: 'MFA' },
    { id: 'web-1', type: 'web-server', label: 'Web Server' },
  ],
  connections: [],
};

describe('IndustryCompliancePanel', () => {
  it('should render panel header', () => {
    const onClose = vi.fn();
    render(<IndustryCompliancePanel spec={mockSpec} onClose={onClose} />);
    expect(screen.getByText('산업별 컴플라이언스')).toBeDefined();
  });

  it('should show empty state when spec is null', () => {
    const onClose = vi.fn();
    render(<IndustryCompliancePanel spec={null} onClose={onClose} />);
    expect(screen.getByText('다이어그램을 먼저 생성해주세요.')).toBeDefined();
  });

  it('should display industry selector buttons', () => {
    const onClose = vi.fn();
    render(<IndustryCompliancePanel spec={mockSpec} onClose={onClose} />);
    expect(screen.getByText('금융 서비스')).toBeDefined();
    expect(screen.getByText('의료/헬스케어')).toBeDefined();
    expect(screen.getByText('공공/정부')).toBeDefined();
    expect(screen.getByText('전자상거래')).toBeDefined();
    expect(screen.getByText('일반 기업')).toBeDefined();
  });

  it('should show overall score', () => {
    const onClose = vi.fn();
    render(<IndustryCompliancePanel spec={mockSpec} onClose={onClose} />);
    expect(screen.getByText('/100')).toBeDefined();
  });

  it('should switch industry when button is clicked', () => {
    const onClose = vi.fn();
    render(<IndustryCompliancePanel spec={mockSpec} onClose={onClose} />);
    fireEvent.click(screen.getByText('금융 서비스'));
    // Should show financial compliance info
    expect(screen.getAllByText(/ISMS-P/i).length).toBeGreaterThan(0);
  });

  it('should show missing required components', () => {
    const onClose = vi.fn();
    render(<IndustryCompliancePanel spec={mockSpec} onClose={onClose} />);
    // Default is general, which requires firewall, mfa, backup
    // mockSpec has firewall and mfa but not backup
    expect(screen.getAllByText('backup').length).toBeGreaterThan(0);
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<IndustryCompliancePanel spec={mockSpec} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('닫기'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should show framework scores', () => {
    const onClose = vi.fn();
    render(<IndustryCompliancePanel spec={mockSpec} onClose={onClose} />);
    // General requires ISO 27001
    expect(screen.getByText('ISO27001')).toBeDefined();
  });
});
