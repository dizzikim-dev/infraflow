import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnimationControlPanel } from '@/components/panels/AnimationControlPanel';
import type { AnimationSequence } from '@/types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

// Mock useAnimation hook
const mockUseAnimation = {
  isPlaying: false,
  currentStepIndex: -1,
  speed: 1,
  play: vi.fn(),
  pause: vi.fn(),
  stop: vi.fn(),
  togglePlay: vi.fn(),
  setSpeed: vi.fn(),
  nextStep: vi.fn(),
  prevStep: vi.fn(),
  loadSequence: vi.fn(),
};

vi.mock('@/hooks/useAnimation', () => ({
  useAnimation: () => mockUseAnimation,
}));

describe('AnimationControlPanel', () => {
  const mockSequence: AnimationSequence = {
    id: 'test-seq',
    name: 'Test Animation',
    steps: [
      { from: 'node-a', to: 'node-b', delay: 0, duration: 500, type: 'request' },
      { from: 'node-b', to: 'node-c', delay: 100, duration: 500, type: 'response' },
      { from: 'node-c', to: 'node-d', delay: 100, duration: 500, type: 'encrypted' },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAnimation.isPlaying = false;
    mockUseAnimation.currentStepIndex = -1;
    mockUseAnimation.speed = 1;
  });

  describe('Rendering', () => {
    it('should render animation name', () => {
      render(<AnimationControlPanel sequence={mockSequence} />);
      expect(screen.getByText('Test Animation')).toBeInTheDocument();
    });

    it('should render default name when no sequence', () => {
      render(<AnimationControlPanel sequence={null} />);
      expect(screen.getByText('Animation')).toBeInTheDocument();
    });

    it('should render step progress', () => {
      render(<AnimationControlPanel sequence={mockSequence} />);
      expect(screen.getByText('Step 0')).toBeInTheDocument();
      expect(screen.getByText('/ 3')).toBeInTheDocument();
    });

    it('should render speed options', () => {
      render(<AnimationControlPanel sequence={mockSequence} />);
      expect(screen.getByText('0.5x')).toBeInTheDocument();
      expect(screen.getByText('1x')).toBeInTheDocument();
      expect(screen.getByText('1.5x')).toBeInTheDocument();
      expect(screen.getByText('2x')).toBeInTheDocument();
    });

    it('should render close button when onClose provided', () => {
      const onClose = vi.fn();
      render(<AnimationControlPanel sequence={mockSequence} onClose={onClose} />);
      expect(screen.getByText('✕')).toBeInTheDocument();
    });
  });

  describe('Controls', () => {
    it('should load sequence and toggle play on first click', () => {
      render(<AnimationControlPanel sequence={mockSequence} />);

      const playButton = screen.getByTitle('Play');
      fireEvent.click(playButton);

      expect(mockUseAnimation.loadSequence).toHaveBeenCalledWith(mockSequence);
      expect(mockUseAnimation.togglePlay).toHaveBeenCalled();
    });

    it('should only toggle play when sequence already loaded', () => {
      mockUseAnimation.currentStepIndex = 0;
      render(<AnimationControlPanel sequence={mockSequence} />);

      const playButton = screen.getByTitle('Play');
      fireEvent.click(playButton);

      expect(mockUseAnimation.loadSequence).not.toHaveBeenCalled();
      expect(mockUseAnimation.togglePlay).toHaveBeenCalled();
    });

    it('should show pause button when playing', () => {
      mockUseAnimation.isPlaying = true;
      render(<AnimationControlPanel sequence={mockSequence} />);

      expect(screen.getByTitle('Pause')).toBeInTheDocument();
    });

    it('should call stop on stop button click', () => {
      mockUseAnimation.currentStepIndex = 0;
      render(<AnimationControlPanel sequence={mockSequence} />);

      const stopButton = screen.getByTitle('Stop');
      fireEvent.click(stopButton);

      expect(mockUseAnimation.stop).toHaveBeenCalled();
    });

    it('should call nextStep on next button click', () => {
      mockUseAnimation.currentStepIndex = 0;
      render(<AnimationControlPanel sequence={mockSequence} />);

      const nextButton = screen.getByTitle('Next Step');
      fireEvent.click(nextButton);

      expect(mockUseAnimation.nextStep).toHaveBeenCalled();
    });

    it('should call prevStep on previous button click', () => {
      mockUseAnimation.currentStepIndex = 1;
      render(<AnimationControlPanel sequence={mockSequence} />);

      const prevButton = screen.getByTitle('Previous Step');
      fireEvent.click(prevButton);

      expect(mockUseAnimation.prevStep).toHaveBeenCalled();
    });

    it('should call setSpeed when speed button clicked', () => {
      render(<AnimationControlPanel sequence={mockSequence} />);

      const speed2xButton = screen.getByText('2x');
      fireEvent.click(speed2xButton);

      expect(mockUseAnimation.setSpeed).toHaveBeenCalledWith(2);
    });

    it('should call onClose when close button clicked', () => {
      const onClose = vi.fn();
      render(<AnimationControlPanel sequence={mockSequence} onClose={onClose} />);

      const closeButton = screen.getByText('✕');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Disabled States', () => {
    it('should disable play button when no sequence', () => {
      render(<AnimationControlPanel sequence={null} />);

      const playButton = screen.getByTitle('Play');
      expect(playButton).toBeDisabled();
    });

    it('should disable previous button at first step', () => {
      mockUseAnimation.currentStepIndex = 0;
      render(<AnimationControlPanel sequence={mockSequence} />);

      const prevButton = screen.getByTitle('Previous Step');
      expect(prevButton).toBeDisabled();
    });

    it('should disable next button at last step', () => {
      mockUseAnimation.currentStepIndex = 2; // Last step (0-indexed)
      render(<AnimationControlPanel sequence={mockSequence} />);

      const nextButton = screen.getByTitle('Next Step');
      expect(nextButton).toBeDisabled();
    });

    it('should disable stop button when not playing', () => {
      mockUseAnimation.currentStepIndex = -1;
      render(<AnimationControlPanel sequence={mockSequence} />);

      const stopButton = screen.getByTitle('Stop');
      expect(stopButton).toBeDisabled();
    });
  });

  describe('Step Info Display', () => {
    it('should show current step info when playing', () => {
      mockUseAnimation.currentStepIndex = 0;
      render(<AnimationControlPanel sequence={mockSequence} />);

      expect(screen.getByText('node-a → node-b')).toBeInTheDocument();
    });

    it('should show step label if present', () => {
      const sequenceWithLabel: AnimationSequence = {
        ...mockSequence,
        steps: [
          { from: 'a', to: 'b', delay: 0, duration: 500, type: 'request', label: 'HTTP Request' },
        ],
      };
      mockUseAnimation.currentStepIndex = 0;

      render(<AnimationControlPanel sequence={sequenceWithLabel} />);

      expect(screen.getByText('HTTP Request')).toBeInTheDocument();
    });

    it('should not show step info when not playing', () => {
      mockUseAnimation.currentStepIndex = -1;
      render(<AnimationControlPanel sequence={mockSequence} />);

      expect(screen.queryByText('node-a → node-b')).not.toBeInTheDocument();
    });
  });
});
