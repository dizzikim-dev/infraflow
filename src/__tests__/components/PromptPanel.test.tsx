import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptPanel } from '@/components/panels/PromptPanel';

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

describe('PromptPanel', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render textarea', () => {
      render(<PromptPanel onSubmit={mockOnSubmit} />);
      expect(screen.getByPlaceholderText('인프라 아키텍처를 설명해주세요...')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<PromptPanel onSubmit={mockOnSubmit} />);
      expect(screen.getByRole('button', { name: '생성' })).toBeInTheDocument();
    });

    it('should render example prompts', () => {
      render(<PromptPanel onSubmit={mockOnSubmit} />);
      expect(screen.getByText('3티어 웹 아키텍처 보여줘')).toBeInTheDocument();
      expect(screen.getByText('WAF + 로드밸런서 + 웹서버 구조')).toBeInTheDocument();
      expect(screen.getByText('VPN으로 내부망 접속하는 구조')).toBeInTheDocument();
      expect(screen.getByText('쿠버네티스 클러스터 아키텍처')).toBeInTheDocument();
    });

    it('should render hint text', () => {
      render(<PromptPanel onSubmit={mockOnSubmit} />);
      expect(screen.getByText('Enter로 전송 | Shift+Enter로 줄바꿈')).toBeInTheDocument();
    });
  });

  describe('Example prompts', () => {
    it('should fill textarea when example prompt is clicked', async () => {
      const user = userEvent.setup();
      render(<PromptPanel onSubmit={mockOnSubmit} />);

      await user.click(screen.getByText('3티어 웹 아키텍처 보여줘'));

      const textarea = screen.getByPlaceholderText('인프라 아키텍처를 설명해주세요...');
      expect(textarea).toHaveValue('3티어 웹 아키텍처 보여줘');
    });
  });

  describe('Submit behavior', () => {
    it('should call onSubmit when button is clicked with text', async () => {
      const user = userEvent.setup();
      render(<PromptPanel onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText('인프라 아키텍처를 설명해주세요...');
      await user.type(textarea, '테스트 프롬프트');
      await user.click(screen.getByRole('button', { name: '생성' }));

      expect(mockOnSubmit).toHaveBeenCalledWith('테스트 프롬프트');
    });

    it('should clear textarea after submit', async () => {
      const user = userEvent.setup();
      render(<PromptPanel onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText('인프라 아키텍처를 설명해주세요...');
      await user.type(textarea, '테스트 프롬프트');
      await user.click(screen.getByRole('button', { name: '생성' }));

      expect(textarea).toHaveValue('');
    });

    it('should not call onSubmit when text is empty', async () => {
      const user = userEvent.setup();
      render(<PromptPanel onSubmit={mockOnSubmit} />);

      await user.click(screen.getByRole('button', { name: '생성' }));

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should not call onSubmit when text is only whitespace', async () => {
      const user = userEvent.setup();
      render(<PromptPanel onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText('인프라 아키텍처를 설명해주세요...');
      await user.type(textarea, '   ');
      await user.click(screen.getByRole('button', { name: '생성' }));

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should trim whitespace from submitted text', async () => {
      const user = userEvent.setup();
      render(<PromptPanel onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText('인프라 아키텍처를 설명해주세요...');
      await user.type(textarea, '  테스트 프롬프트  ');
      await user.click(screen.getByRole('button', { name: '생성' }));

      expect(mockOnSubmit).toHaveBeenCalledWith('테스트 프롬프트');
    });
  });

  describe('Keyboard shortcuts', () => {
    it('should submit on Enter key', async () => {
      const user = userEvent.setup();
      render(<PromptPanel onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText('인프라 아키텍처를 설명해주세요...');
      await user.type(textarea, '테스트 프롬프트');
      await user.type(textarea, '{Enter}');

      expect(mockOnSubmit).toHaveBeenCalledWith('테스트 프롬프트');
    });

    it('should not submit on Shift+Enter', async () => {
      const user = userEvent.setup();
      render(<PromptPanel onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText('인프라 아키텍처를 설명해주세요...');
      await user.type(textarea, '테스트 프롬프트');
      await user.type(textarea, '{Shift>}{Enter}{/Shift}');

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Loading state', () => {
    it('should disable textarea when loading', () => {
      render(<PromptPanel onSubmit={mockOnSubmit} isLoading={true} />);

      const textarea = screen.getByPlaceholderText('인프라 아키텍처를 설명해주세요...');
      expect(textarea).toBeDisabled();
    });

    it('should disable submit button when loading', () => {
      const { container } = render(<PromptPanel onSubmit={mockOnSubmit} isLoading={true} />);

      // Find the submit button (the one next to textarea, not example prompt buttons)
      const submitButton = container.querySelector('.flex.gap-3 > button');
      expect(submitButton).toBeDisabled();
    });

    it('should not call onSubmit when loading', async () => {
      const { container } = render(<PromptPanel onSubmit={mockOnSubmit} isLoading={true} />);

      const textarea = screen.getByPlaceholderText('인프라 아키텍처를 설명해주세요...');
      expect(textarea).toBeDisabled();

      // Find the submit button
      const submitButton = container.querySelector('.flex.gap-3 > button');
      expect(submitButton).toBeDisabled();
    });

    it('should show loading spinner when loading', () => {
      const { container } = render(<PromptPanel onSubmit={mockOnSubmit} isLoading={true} />);

      // Check for spinner (rotating div with specific classes)
      const spinner = container.querySelector('.border-2.border-white.border-t-transparent.rounded-full');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Button state', () => {
    it('should disable button when textarea is empty', () => {
      render(<PromptPanel onSubmit={mockOnSubmit} />);

      const button = screen.getByRole('button', { name: '생성' });
      expect(button).toBeDisabled();
    });

    it('should enable button when textarea has text', async () => {
      const user = userEvent.setup();
      render(<PromptPanel onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText('인프라 아키텍처를 설명해주세요...');
      await user.type(textarea, '테스트');

      const button = screen.getByRole('button', { name: '생성' });
      expect(button).not.toBeDisabled();
    });
  });
});
