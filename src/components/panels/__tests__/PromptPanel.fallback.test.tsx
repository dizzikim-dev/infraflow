import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PromptPanel } from '../PromptPanel';
import type { ParseResultInfo } from '@/hooks/usePromptParser';
import type { InfraSpec } from '@/types';

// Mock framer-motion to simplify rendering
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...rest } = props;
      return <div {...rest}>{children as React.ReactNode}</div>;
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock template recommender
vi.mock('@/lib/templates/templateRecommender', () => ({
  recommendTemplates: () => [],
}));

const fallbackSpec: InfraSpec = {
  nodes: [
    { id: 'waf-1', type: 'waf', label: 'WAF' },
  ],
  connections: [],
};

const fallbackResult: ParseResultInfo = {
  confidence: 0.3,
  isFallback: true,
  fallbackSpec,
  error: '입력하신 내용을 정확히 인식하지 못했습니다.',
};

describe('PromptPanel fallback warning', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    lastResult: fallbackResult,
    onAcceptFallback: vi.fn(),
    onDismissFallback: vi.fn(),
  };

  it('should render fallback warning banner when isFallback is true', () => {
    render(<PromptPanel {...defaultProps} />);
    expect(screen.getByText('인식 실패')).toBeDefined();
    expect(screen.getByText(/인식하지 못했습니다/)).toBeDefined();
  });

  it('should show supported types hint', () => {
    render(<PromptPanel {...defaultProps} />);
    expect(screen.getByText(/지원 유형/)).toBeDefined();
  });

  it('should render "기본 다이어그램 사용" button', () => {
    render(<PromptPanel {...defaultProps} />);
    expect(screen.getByText('기본 다이어그램 사용')).toBeDefined();
  });

  it('should render "다시 입력" button', () => {
    render(<PromptPanel {...defaultProps} />);
    expect(screen.getByText('다시 입력')).toBeDefined();
  });

  it('should call onAcceptFallback when "기본 다이어그램 사용" is clicked', () => {
    const onAcceptFallback = vi.fn();
    render(<PromptPanel {...defaultProps} onAcceptFallback={onAcceptFallback} />);
    fireEvent.click(screen.getByText('기본 다이어그램 사용'));
    expect(onAcceptFallback).toHaveBeenCalledWith(fallbackSpec);
  });

  it('should call onDismissFallback when "다시 입력" is clicked', () => {
    const onDismissFallback = vi.fn();
    render(<PromptPanel {...defaultProps} onDismissFallback={onDismissFallback} />);
    fireEvent.click(screen.getByText('다시 입력'));
    expect(onDismissFallback).toHaveBeenCalled();
  });

  it('should NOT render fallback banner when isFallback is not set', () => {
    const normalResult: ParseResultInfo = {
      confidence: 0.8,
      templateUsed: '3tier',
    };
    render(<PromptPanel {...defaultProps} lastResult={normalResult} />);
    expect(screen.queryByText('인식 실패')).toBeNull();
  });

  it('should NOT render fallback banner when lastResult is null', () => {
    render(<PromptPanel {...defaultProps} lastResult={null} />);
    expect(screen.queryByText('인식 실패')).toBeNull();
  });
});
