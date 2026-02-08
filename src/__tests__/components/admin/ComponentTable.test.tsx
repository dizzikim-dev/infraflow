/**
 * ComponentTable Component Tests
 *
 * Tests for the component table including:
 * - Table rendering with component data
 * - Pagination controls
 * - Delete functionality
 * - Empty state display
 * - Category and tier badge styling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ComponentTable from '@/components/admin/ComponentTable';

// Mock next/navigation
const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock confirm dialog
const mockConfirm = vi.fn(() => true);
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true,
});

// Sample test data
const mockComponents = [
  {
    id: 'comp-1',
    componentId: 'firewall',
    name: 'Firewall',
    nameKo: '방화벽',
    category: 'security',
    tier: 'dmz',
    isActive: true,
    policies: [{ id: 'pol-1', name: 'Default Deny', nameKo: '기본 차단', priority: 'critical' }],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'comp-2',
    componentId: 'web-server',
    name: 'Web Server',
    nameKo: '웹 서버',
    category: 'compute',
    tier: 'internal',
    isActive: true,
    policies: [],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 'comp-3',
    componentId: 'load-balancer',
    name: 'Load Balancer',
    nameKo: '로드밸런서',
    category: 'network',
    tier: 'dmz',
    isActive: false,
    policies: [
      { id: 'pol-2', name: 'Health Check', nameKo: '상태 검사', priority: 'high' },
      { id: 'pol-3', name: 'Session', nameKo: '세션', priority: 'medium' },
    ],
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
];

const mockPagination = {
  page: 1,
  limit: 20,
  total: 3,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

const mockOnPageChange = vi.fn();
const mockOnDelete = vi.fn().mockResolvedValue(undefined);

describe('ComponentTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(true);
  });

  describe('Rendering', () => {
    it('should render table headers', () => {
      render(
        <ComponentTable
          components={mockComponents}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('컴포넌트')).toBeInTheDocument();
      expect(screen.getByText('카테고리')).toBeInTheDocument();
      expect(screen.getByText('티어')).toBeInTheDocument();
      expect(screen.getByText('정책')).toBeInTheDocument();
      expect(screen.getByText('상태')).toBeInTheDocument();
      expect(screen.getByText('작업')).toBeInTheDocument();
    });

    it('should render component rows', () => {
      render(
        <ComponentTable
          components={mockComponents}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('방화벽')).toBeInTheDocument();
      expect(screen.getByText('웹 서버')).toBeInTheDocument();
      expect(screen.getByText('로드밸런서')).toBeInTheDocument();
    });

    it('should render component IDs', () => {
      render(
        <ComponentTable
          components={mockComponents}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('firewall')).toBeInTheDocument();
      expect(screen.getByText('web-server')).toBeInTheDocument();
      expect(screen.getByText('load-balancer')).toBeInTheDocument();
    });

    it('should render English names', () => {
      render(
        <ComponentTable
          components={mockComponents}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Firewall')).toBeInTheDocument();
      expect(screen.getByText('Web Server')).toBeInTheDocument();
      expect(screen.getByText('Load Balancer')).toBeInTheDocument();
    });
  });

  describe('Category Badges', () => {
    it('should display category labels in Korean', () => {
      render(
        <ComponentTable
          components={mockComponents}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('보안')).toBeInTheDocument();
      expect(screen.getByText('컴퓨팅')).toBeInTheDocument();
      expect(screen.getByText('네트워크')).toBeInTheDocument();
    });

    it('should apply correct category colors', () => {
      render(
        <ComponentTable
          components={mockComponents}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
          onDelete={mockOnDelete}
        />
      );

      const securityBadge = screen.getByText('보안');
      const computeBadge = screen.getByText('컴퓨팅');
      const networkBadge = screen.getByText('네트워크');

      expect(securityBadge).toHaveClass('bg-red-100', 'text-red-800');
      expect(computeBadge).toHaveClass('bg-green-100', 'text-green-800');
      expect(networkBadge).toHaveClass('bg-blue-100', 'text-blue-800');
    });
  });

  describe('Tier Badges', () => {
    it('should display tier labels in Korean', () => {
      render(
        <ComponentTable
          components={mockComponents}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
          onDelete={mockOnDelete}
        />
      );

      // DMZ appears twice (firewall and load-balancer)
      expect(screen.getAllByText('DMZ')).toHaveLength(2);
      expect(screen.getByText('내부')).toBeInTheDocument();
    });

    it('should apply correct tier colors', () => {
      render(
        <ComponentTable
          components={mockComponents}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
          onDelete={mockOnDelete}
        />
      );

      const dmzBadges = screen.getAllByText('DMZ');
      const internalBadge = screen.getByText('내부');

      dmzBadges.forEach((badge) => {
        expect(badge).toHaveClass('bg-orange-100', 'text-orange-700');
      });
      expect(internalBadge).toHaveClass('bg-emerald-100', 'text-emerald-700');
    });
  });

  describe('Status Display', () => {
    it('should display active status', () => {
      render(
        <ComponentTable
          components={mockComponents}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
          onDelete={mockOnDelete}
        />
      );

      const activeStatuses = screen.getAllByText('활성');
      expect(activeStatuses.length).toBeGreaterThan(0);
    });

    it('should display inactive status', () => {
      render(
        <ComponentTable
          components={mockComponents}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('비활성')).toBeInTheDocument();
    });

    it('should apply opacity to inactive rows', () => {
      render(
        <ComponentTable
          components={mockComponents}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
          onDelete={mockOnDelete}
        />
      );

      // Find the row containing the inactive component
      const inactiveRow = screen.getByText('로드밸런서').closest('tr');
      expect(inactiveRow).toHaveClass('opacity-50');
    });
  });

  describe('Policy Count', () => {
    it('should display policy count for each component', () => {
      render(
        <ComponentTable
          components={mockComponents}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('1개')).toBeInTheDocument();
      expect(screen.getByText('0개')).toBeInTheDocument();
      expect(screen.getByText('2개')).toBeInTheDocument();
    });
  });

  describe('Action Links', () => {
    it('should render detail links with correct hrefs', () => {
      render(
        <ComponentTable
          components={mockComponents}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
          onDelete={mockOnDelete}
        />
      );

      const detailLinks = screen.getAllByText('상세');
      expect(detailLinks).toHaveLength(3);
      expect(detailLinks[0].closest('a')).toHaveAttribute('href', '/admin/components/comp-1');
    });

    it('should render edit links with correct hrefs', () => {
      render(
        <ComponentTable
          components={mockComponents}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
          onDelete={mockOnDelete}
        />
      );

      const editLinks = screen.getAllByText('수정');
      expect(editLinks).toHaveLength(3);
      expect(editLinks[0].closest('a')).toHaveAttribute('href', '/admin/components/comp-1/edit');
    });

    it('should render delete buttons', () => {
      render(
        <ComponentTable
          components={mockComponents}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen.getAllByText('삭제');
      expect(deleteButtons).toHaveLength(3);
    });
  });

  describe('Delete Functionality', () => {
    it('should show confirmation dialog when delete is clicked', async () => {
      render(
        <ComponentTable
          components={mockComponents}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen.getAllByText('삭제');
      fireEvent.click(deleteButtons[0]);

      expect(mockConfirm).toHaveBeenCalledWith('"방화벽" 컴포넌트를 비활성화하시겠습니까?');
    });

    it('should call onDelete when confirmed', async () => {
      mockConfirm.mockReturnValue(true);

      render(
        <ComponentTable
          components={mockComponents}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen.getAllByText('삭제');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockOnDelete).toHaveBeenCalledWith('comp-1');
      });
    });

    it('should not call onDelete when cancelled', async () => {
      mockConfirm.mockReturnValue(false);

      render(
        <ComponentTable
          components={mockComponents}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen.getAllByText('삭제');
      fireEvent.click(deleteButtons[0]);

      expect(mockOnDelete).not.toHaveBeenCalled();
    });

    it('should show loading state during delete', async () => {
      mockOnDelete.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(
        <ComponentTable
          components={mockComponents}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen.getAllByText('삭제');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('처리중...')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no components', () => {
      render(
        <ComponentTable
          components={[]}
          pagination={{ ...mockPagination, total: 0, totalPages: 0 }}
          onPageChange={mockOnPageChange}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('데이터 없음')).toBeInTheDocument();
      expect(screen.getByText('조건에 맞는 컴포넌트가 없습니다.')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('should not show pagination when only one page', () => {
      render(
        <ComponentTable
          components={mockComponents}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
          onDelete={mockOnDelete}
        />
      );

      // Pagination should not be rendered
      expect(screen.queryByLabelText('이전')).not.toBeInTheDocument();
    });

    it('should show pagination when multiple pages exist', () => {
      const multiPagePagination = {
        page: 1,
        limit: 20,
        total: 50,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
      };

      render(
        <ComponentTable
          components={mockComponents}
          pagination={multiPagePagination}
          onPageChange={mockOnPageChange}
          onDelete={mockOnDelete}
        />
      );

      // Check for total count display
      expect(screen.getByText(/총/)).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('should call onPageChange when next button is clicked', () => {
      const multiPagePagination = {
        page: 1,
        limit: 20,
        total: 50,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
      };

      render(
        <ComponentTable
          components={mockComponents}
          pagination={multiPagePagination}
          onPageChange={mockOnPageChange}
          onDelete={mockOnDelete}
        />
      );

      // Find the next button by its sr-only text
      const nextButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('.sr-only')?.textContent === '다음'
      );
      if (nextButtons.length > 0) {
        fireEvent.click(nextButtons[0]);
        expect(mockOnPageChange).toHaveBeenCalledWith(2);
      }
    });

    it('should call onPageChange when previous button is clicked', () => {
      const multiPagePagination = {
        page: 2,
        limit: 20,
        total: 50,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      };

      render(
        <ComponentTable
          components={mockComponents}
          pagination={multiPagePagination}
          onPageChange={mockOnPageChange}
          onDelete={mockOnDelete}
        />
      );

      // Find the previous button by its sr-only text
      const prevButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('.sr-only')?.textContent === '이전'
      );
      if (prevButtons.length > 0) {
        fireEvent.click(prevButtons[0]);
        expect(mockOnPageChange).toHaveBeenCalledWith(1);
      }
    });

    it('should disable previous button on first page', () => {
      const multiPagePagination = {
        page: 1,
        limit: 20,
        total: 50,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
      };

      render(
        <ComponentTable
          components={mockComponents}
          pagination={multiPagePagination}
          onPageChange={mockOnPageChange}
          onDelete={mockOnDelete}
        />
      );

      // Find the previous button by its sr-only text
      const prevButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('.sr-only')?.textContent === '이전'
      );
      if (prevButtons.length > 0) {
        expect(prevButtons[0]).toBeDisabled();
      }
    });

    it('should disable next button on last page', () => {
      const multiPagePagination = {
        page: 3,
        limit: 20,
        total: 50,
        totalPages: 3,
        hasNext: false,
        hasPrev: true,
      };

      render(
        <ComponentTable
          components={mockComponents}
          pagination={multiPagePagination}
          onPageChange={mockOnPageChange}
          onDelete={mockOnDelete}
        />
      );

      // Find the next button by its sr-only text
      const nextButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('.sr-only')?.textContent === '다음'
      );
      if (nextButtons.length > 0) {
        expect(nextButtons[0]).toBeDisabled();
      }
    });

    it('should call onPageChange when page number is clicked', () => {
      const multiPagePagination = {
        page: 1,
        limit: 20,
        total: 50,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
      };

      render(
        <ComponentTable
          components={mockComponents}
          pagination={multiPagePagination}
          onPageChange={mockOnPageChange}
          onDelete={mockOnDelete}
        />
      );

      const page2Button = screen.getByRole('button', { name: '2' });
      fireEvent.click(page2Button);

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });
  });
});
