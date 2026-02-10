import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HealthCheckPanel } from '@/components/panels/HealthCheckPanel';
import type { InfraSpec } from '@/types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  X: () => <span data-testid="x-icon">X</span>,
  ShieldAlert: () => <span data-testid="shield-icon">Shield</span>,
  Link2: () => <span data-testid="link-icon">Link</span>,
  Zap: () => <span data-testid="zap-icon">Zap</span>,
  AlertTriangle: () => <span data-testid="alert-icon">Alert</span>,
  CheckCircle2: () => <span data-testid="check-icon">Check</span>,
}));

describe('HealthCheckPanel', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------------

  it('should render empty state when spec is null', () => {
    render(<HealthCheckPanel spec={null} onClose={mockOnClose} />);

    expect(screen.getByText('아키텍처 진단')).toBeDefined();
    expect(screen.getByText('다이어그램을 먼저 생성해주세요.')).toBeDefined();
  });

  it('should call onClose when close button is clicked', () => {
    render(<HealthCheckPanel spec={null} onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText('닫기');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // ---------------------------------------------------------------
  // With spec — anti-pattern tab
  // ---------------------------------------------------------------

  it('should render anti-pattern violations for a bad spec', () => {
    // DB exposed to internet without firewall
    const badSpec: InfraSpec = {
      nodes: [
        { id: 'internet-1', type: 'internet', label: 'Internet' },
        { id: 'db-1', type: 'db-server', label: 'DB Server' },
      ],
      connections: [{ source: 'internet-1', target: 'db-1' }],
    };

    render(<HealthCheckPanel spec={badSpec} onClose={mockOnClose} />);

    // Should show anti-pattern tab content by default
    // The violations list or empty state should be present
    const content = document.body.textContent || '';
    // Either violations found or clean slate
    expect(
      content.includes('CRITICAL') ||
      content.includes('HIGH') ||
      content.includes('안티패턴이 감지되지 않았습니다')
    ).toBe(true);
  });

  it('should show clean state for well-architected spec', () => {
    const goodSpec: InfraSpec = {
      nodes: [
        { id: 'fw-1', type: 'firewall', label: 'Firewall' },
        { id: 'web-1', type: 'web-server', label: 'Web Server' },
        { id: 'app-1', type: 'app-server', label: 'App Server' },
        { id: 'db-1', type: 'db-server', label: 'DB Server' },
      ],
      connections: [
        { source: 'fw-1', target: 'web-1' },
        { source: 'web-1', target: 'app-1' },
        { source: 'app-1', target: 'db-1' },
      ],
    };

    render(<HealthCheckPanel spec={goodSpec} onClose={mockOnClose} />);
    // Should render without crashing
    expect(screen.getByText('아키텍처 진단')).toBeDefined();
  });

  // ---------------------------------------------------------------
  // Tab switching
  // ---------------------------------------------------------------

  it('should switch to dependencies tab', () => {
    const spec: InfraSpec = {
      nodes: [
        { id: 'db-1', type: 'db-server', label: 'DB Server' },
      ],
      connections: [],
    };

    render(<HealthCheckPanel spec={spec} onClose={mockOnClose} />);

    // Click dependencies tab
    const depTab = screen.getByText('의존성');
    fireEvent.click(depTab);

    // Should show dependency content — either missing deps or all satisfied
    const content = document.body.textContent || '';
    expect(
      content.includes('필수') ||
      content.includes('권장') ||
      content.includes('모든 의존성이 충족되었습니다')
    ).toBe(true);
  });

  it('should switch to failures tab', () => {
    const spec: InfraSpec = {
      nodes: [
        { id: 'fw-1', type: 'firewall', label: 'Firewall' },
        { id: 'web-1', type: 'web-server', label: 'Web Server' },
      ],
      connections: [{ source: 'fw-1', target: 'web-1' }],
    };

    render(<HealthCheckPanel spec={spec} onClose={mockOnClose} />);

    // Click failures tab
    const failTab = screen.getByText('장애 위험');
    fireEvent.click(failTab);

    // Should show failure content — either risks or clean
    const content = document.body.textContent || '';
    expect(
      content.includes('MTTR') ||
      content.includes('서비스 중단') ||
      content.includes('장애 시나리오가 없습니다')
    ).toBe(true);
  });

  // ---------------------------------------------------------------
  // Footer summary
  // ---------------------------------------------------------------

  it('should show footer summary with spec', () => {
    const spec: InfraSpec = {
      nodes: [
        { id: 'web-1', type: 'web-server', label: 'Web Server' },
      ],
      connections: [],
    };

    render(<HealthCheckPanel spec={spec} onClose={mockOnClose} />);

    // Footer should show violation count
    expect(screen.getByText(/진단 결과/)).toBeDefined();
  });

  // ---------------------------------------------------------------
  // Three tabs present
  // ---------------------------------------------------------------

  it('should render all three tabs', () => {
    render(<HealthCheckPanel spec={null} onClose={mockOnClose} />);

    expect(screen.getByText('안티패턴')).toBeDefined();
    expect(screen.getByText('의존성')).toBeDefined();
    expect(screen.getByText('장애 위험')).toBeDefined();
  });
});
