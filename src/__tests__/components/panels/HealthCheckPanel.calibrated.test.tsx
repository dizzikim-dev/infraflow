import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HealthCheckPanel } from '@/components/panels/HealthCheckPanel';
import type { InfraSpec } from '@/types/infra';
import type { CalibratedAntiPattern } from '@/lib/learning/types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const filteredProps = Object.fromEntries(
        Object.entries(props).filter(([k]) =>
          !['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap'].includes(k)
        )
      );
      return <div {...filteredProps}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  X: () => <span data-testid="icon-x">X</span>,
  ShieldAlert: () => <span>ShieldAlert</span>,
  Link2: () => <span>Link2</span>,
  Zap: () => <span>Zap</span>,
  AlertTriangle: () => <span>AlertTriangle</span>,
  CheckCircle2: () => <span>CheckCircle2</span>,
}));

// Mock knowledge module
vi.mock('@/lib/knowledge', () => ({
  getMandatoryDependencies: vi.fn().mockReturnValue([]),
  getRecommendations: vi.fn().mockReturnValue([]),
  getFailuresForComponent: vi.fn().mockReturnValue([]),
}));

// Mock calibration data
const mockCalibratedPatterns: CalibratedAntiPattern[] = [
  {
    id: 'AP-001',
    name: 'No Firewall',
    nameKo: '방화벽 없음',
    originalSeverity: 'critical',
    calibratedSeverity: 'critical',
    ignoreRate: 0,
    fixRate: 0,
    totalShown: 0,
    wasCalibrated: false,
  },
  {
    id: 'AP-002',
    name: 'Single DB',
    nameKo: '단일 DB',
    originalSeverity: 'high',
    calibratedSeverity: 'medium',
    ignoreRate: 0.75,
    fixRate: 0,
    totalShown: 15,
    wasCalibrated: true,
  },
];

const mockRecordShown = vi.fn().mockResolvedValue(undefined);
const mockRecordIgnored = vi.fn().mockResolvedValue(undefined);
const mockRecordFixed = vi.fn().mockResolvedValue(undefined);

vi.mock('@/hooks/useCalibration', () => ({
  useCalibration: () => ({
    getCalibratedAntiPatterns: vi.fn().mockResolvedValue(mockCalibratedPatterns),
    recordShown: mockRecordShown,
    recordIgnored: mockRecordIgnored,
    recordFixed: mockRecordFixed,
    getFalsePositiveRate: vi.fn().mockResolvedValue(0.15),
    isLoading: false,
  }),
}));

const makeSpec = (): InfraSpec => ({
  nodes: [
    { id: 'ws-1', type: 'web-server', label: 'Web Server' },
    { id: 'db-1', type: 'db-server', label: 'Database' },
  ],
  connections: [{ source: 'ws-1', target: 'db-1' }],
});

describe('HealthCheckPanel - Calibrated Behavior', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display calibrated anti-patterns', async () => {
    render(<HealthCheckPanel spec={makeSpec()} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText('방화벽 없음')).toBeInTheDocument();
    });
    expect(screen.getByText('단일 DB')).toBeInTheDocument();
  });

  it('should show calibration badge for calibrated items', async () => {
    render(<HealthCheckPanel spec={makeSpec()} onClose={onClose} />);

    await waitFor(() => {
      // AP-002 was calibrated: "원래: HIGH → 조정됨 (무시율 75%)"
      expect(screen.getByText(/원래.*HIGH.*조정됨/)).toBeInTheDocument();
    });
  });

  it('should show ignore and fix buttons', async () => {
    render(<HealthCheckPanel spec={makeSpec()} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('ignore-AP-001')).toBeInTheDocument();
      expect(screen.getByTestId('fix-AP-001')).toBeInTheDocument();
      expect(screen.getByTestId('ignore-AP-002')).toBeInTheDocument();
      expect(screen.getByTestId('fix-AP-002')).toBeInTheDocument();
    });
  });

  it('should remove anti-pattern when ignore button is clicked', async () => {
    render(<HealthCheckPanel spec={makeSpec()} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('ignore-AP-001')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('ignore-AP-001'));

    await waitFor(() => {
      expect(screen.queryByText('방화벽 없음')).not.toBeInTheDocument();
    });
    expect(mockRecordIgnored).toHaveBeenCalledWith('AP-001');
  });

  it('should remove anti-pattern when fix button is clicked', async () => {
    render(<HealthCheckPanel spec={makeSpec()} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('fix-AP-002')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('fix-AP-002'));

    await waitFor(() => {
      expect(screen.queryByText('단일 DB')).not.toBeInTheDocument();
    });
    expect(mockRecordFixed).toHaveBeenCalledWith('AP-002');
  });

  it('should display correct severity level', async () => {
    render(<HealthCheckPanel spec={makeSpec()} onClose={onClose} />);

    await waitFor(() => {
      // AP-001 has calibratedSeverity 'critical'
      expect(screen.getByText('CRITICAL')).toBeInTheDocument();
      // AP-002 has calibratedSeverity 'medium' (was calibrated from high)
      expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    });
  });

  it('should show empty state when no spec provided', () => {
    render(<HealthCheckPanel spec={null} onClose={onClose} />);
    expect(screen.getByText('다이어그램을 먼저 생성해주세요.')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<HealthCheckPanel spec={makeSpec()} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('닫기'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
