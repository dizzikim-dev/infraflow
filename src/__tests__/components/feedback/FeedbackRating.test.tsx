import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { FeedbackRating } from '@/components/feedback/FeedbackRating';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span {...props}>{children}</span>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('FeedbackRating', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not render when show is false', () => {
    render(
      <FeedbackRating
        show={false}
        onRate={vi.fn()}
        onDismiss={vi.fn()}
        submitted={false}
        showDelay={0}
      />
    );
    expect(screen.queryByTestId('feedback-rating')).not.toBeInTheDocument();
  });

  it('should render after delay', () => {
    vi.useFakeTimers();
    render(
      <FeedbackRating
        show={true}
        onRate={vi.fn()}
        onDismiss={vi.fn()}
        submitted={false}
        showDelay={100}
      />
    );

    expect(screen.queryByTestId('feedback-rating')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(screen.getByTestId('feedback-rating')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('should render immediately with showDelay=0', () => {
    vi.useFakeTimers();
    render(
      <FeedbackRating
        show={true}
        onRate={vi.fn()}
        onDismiss={vi.fn()}
        submitted={false}
        showDelay={0}
      />
    );

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(screen.getByTestId('feedback-rating')).toBeInTheDocument();
    expect(screen.getByText('이 결과가 도움이 되었나요?')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('should render 5 star buttons', () => {
    vi.useFakeTimers();
    render(
      <FeedbackRating
        show={true}
        onRate={vi.fn()}
        onDismiss={vi.fn()}
        submitted={false}
        showDelay={0}
      />
    );

    act(() => {
      vi.advanceTimersByTime(1);
    });

    const stars = screen.getAllByRole('radio');
    expect(stars).toHaveLength(5);
    vi.useRealTimers();
  });

  it('should call onRate when a star is clicked', () => {
    vi.useFakeTimers();
    const onRate = vi.fn();
    render(
      <FeedbackRating
        show={true}
        onRate={onRate}
        onDismiss={vi.fn()}
        submitted={false}
        showDelay={0}
      />
    );

    act(() => {
      vi.advanceTimersByTime(1);
    });

    fireEvent.click(screen.getByLabelText('4점'));
    expect(onRate).toHaveBeenCalledWith(4);
    vi.useRealTimers();
  });

  it('should call onDismiss when close button is clicked', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(
      <FeedbackRating
        show={true}
        onRate={vi.fn()}
        onDismiss={onDismiss}
        submitted={false}
        showDelay={0}
      />
    );

    act(() => {
      vi.advanceTimersByTime(1);
    });

    fireEvent.click(screen.getByLabelText('닫기'));
    expect(onDismiss).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('should show thank you message after submission', () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <FeedbackRating
        show={true}
        onRate={vi.fn()}
        onDismiss={vi.fn()}
        submitted={false}
        showDelay={0}
      />
    );

    act(() => {
      vi.advanceTimersByTime(1);
    });

    rerender(
      <FeedbackRating
        show={true}
        onRate={vi.fn()}
        onDismiss={vi.fn()}
        submitted={true}
        showDelay={0}
      />
    );

    expect(screen.getByText('감사합니다!')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('should auto-hide after timeout', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(
      <FeedbackRating
        show={true}
        onRate={vi.fn()}
        onDismiss={onDismiss}
        submitted={false}
        showDelay={0}
        autoHideTimeout={5000}
      />
    );

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(screen.getByTestId('feedback-rating')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5100);
    });

    expect(onDismiss).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
