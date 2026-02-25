import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReferenceBox } from '../ReferenceBox';
import type { AnswerEvidence } from '@/lib/rag/sourceAggregator';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const { initial, animate, exit, transition, ...rest } = props;
      return <div {...rest}>{children as React.ReactNode}</div>;
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockEvidence: AnswerEvidence = {
  sources: [
    { id: 's1', title: 'AWS Well-Architected', category: 'cloud', score: 0.95, collection: 'PI', usedInSteps: ['rag'] },
    { id: 's2', title: 'OWASP Top 10', category: 'security', score: 0.9, collection: 'PI', usedInSteps: ['rag', 'verify'] },
    { id: 's3', title: 'Cisco Firewall Guide', category: 'vendor', score: 0.8, collection: 'PI', usedInSteps: ['enrichment'] },
  ],
  verificationBadge: 'pass',
  verificationScore: 85,
  openIssues: [],
  patternsMatched: ['firewall→waf'],
};

describe('ReferenceBox', () => {
  it('renders collapsed summary by default', () => {
    render(<ReferenceBox evidence={mockEvidence} />);
    expect(screen.getByText(/참조 출처/)).toBeDefined();
    expect(screen.getByText(/3/)).toBeDefined(); // source count
    expect(screen.getByText(/PASS/i)).toBeDefined();
  });

  it('expands on click to show source list', () => {
    render(<ReferenceBox evidence={mockEvidence} />);
    fireEvent.click(screen.getByText(/참조 출처/));
    expect(screen.getByText('AWS Well-Architected')).toBeDefined();
    expect(screen.getByText('OWASP Top 10')).toBeDefined();
    expect(screen.getByText('Cisco Firewall Guide')).toBeDefined();
  });

  it('shows usedInSteps tags', () => {
    render(<ReferenceBox evidence={mockEvidence} />);
    fireEvent.click(screen.getByText(/참조 출처/));
    expect(screen.getAllByText('rag').length).toBeGreaterThanOrEqual(1);
  });

  it('shows warning badge when verification is warning', () => {
    const warningEvidence = { ...mockEvidence, verificationBadge: 'warning' as const, verificationScore: 55 };
    render(<ReferenceBox evidence={warningEvidence} />);
    expect(screen.getByText(/WARNING/i)).toBeDefined();
  });

  it('calls onOpenEvidence when "자세히 보기" clicked', () => {
    const onOpen = vi.fn();
    render(<ReferenceBox evidence={mockEvidence} onOpenEvidence={onOpen} />);
    fireEvent.click(screen.getByText(/참조 출처/));
    fireEvent.click(screen.getByText(/자세히 보기/));
    expect(onOpen).toHaveBeenCalled();
  });

  it('renders nothing when evidence is null', () => {
    const { container } = render(<ReferenceBox evidence={null} />);
    expect(container.firstChild).toBeNull();
  });
});
