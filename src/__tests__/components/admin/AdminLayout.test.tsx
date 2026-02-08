/**
 * AdminLayout Component Tests
 *
 * Tests for the admin layout component including:
 * - Sidebar rendering and navigation
 * - Active link highlighting
 * - Sidebar collapse/expand functionality
 * - Responsive behavior
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminLayout from '@/components/admin/AdminLayout';

// Mock next/navigation
const mockPush = vi.fn();
const mockPathname = vi.fn(() => '/admin');

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => mockPathname(),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('AdminLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue('/admin');
  });

  describe('Rendering', () => {
    it('should render children content', () => {
      render(
        <AdminLayout>
          <div data-testid="child-content">Test Content</div>
        </AdminLayout>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render navigation items', () => {
      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      // Check for navigation labels when sidebar is expanded
      expect(screen.getByText('InfraFlow Admin')).toBeInTheDocument();
    });

    it('should render sidebar with correct structure', () => {
      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      // Check for main structural elements - navigation is inside aside
      const sidebar = document.querySelector('aside');
      expect(sidebar).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should render footer link to main application', () => {
      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      expect(screen.getByText('InfraFlow로 돌아가기')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /InfraFlow로 돌아가기/i })).toHaveAttribute(
        'href',
        '/'
      );
    });
  });

  describe('Navigation Links', () => {
    it('should have correct href for dashboard link', () => {
      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      const dashboardLink = screen.getByRole('link', { name: /대시보드/i });
      expect(dashboardLink).toHaveAttribute('href', '/admin');
    });

    it('should have correct href for components management link', () => {
      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      const componentsLink = screen.getByRole('link', { name: /컴포넌트 관리/i });
      expect(componentsLink).toHaveAttribute('href', '/admin/components');
    });

    it('should have correct href for plugins management link', () => {
      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      const pluginsLink = screen.getByRole('link', { name: /플러그인 관리/i });
      expect(pluginsLink).toHaveAttribute('href', '/admin/plugins');
    });
  });

  describe('Active Link Highlighting', () => {
    it('should highlight dashboard link when on /admin', () => {
      mockPathname.mockReturnValue('/admin');
      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      const dashboardLink = screen.getByRole('link', { name: /대시보드/i });
      expect(dashboardLink).toHaveClass('bg-blue-600');
    });

    it('should highlight components link when on /admin/components', () => {
      mockPathname.mockReturnValue('/admin/components');
      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      const componentsLink = screen.getByRole('link', { name: /컴포넌트 관리/i });
      expect(componentsLink).toHaveClass('bg-blue-600');
    });

    it('should highlight components link when on nested components path', () => {
      mockPathname.mockReturnValue('/admin/components/new');
      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      const componentsLink = screen.getByRole('link', { name: /컴포넌트 관리/i });
      expect(componentsLink).toHaveClass('bg-blue-600');
    });

    it('should highlight plugins link when on /admin/plugins', () => {
      mockPathname.mockReturnValue('/admin/plugins');
      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      const pluginsLink = screen.getByRole('link', { name: /플러그인 관리/i });
      expect(pluginsLink).toHaveClass('bg-blue-600');
    });
  });

  describe('Sidebar Toggle', () => {
    it('should toggle sidebar when button is clicked', () => {
      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      // Find the toggle button (the one with SVG path that changes)
      const toggleButton = screen.getAllByRole('button')[0];

      // Initially sidebar should be expanded (w-64)
      const sidebar = document.querySelector('aside');
      expect(sidebar).toHaveClass('w-64');

      // Click to collapse
      fireEvent.click(toggleButton);
      expect(sidebar).toHaveClass('w-20');

      // Click to expand again
      fireEvent.click(toggleButton);
      expect(sidebar).toHaveClass('w-64');
    });

    it('should hide navigation labels when sidebar is collapsed', () => {
      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      // Initially labels should be visible
      expect(screen.getByText('대시보드')).toBeInTheDocument();

      // Collapse sidebar
      const toggleButton = screen.getAllByRole('button')[0];
      fireEvent.click(toggleButton);

      // Labels should still be in DOM but parent may hide them
      // The component conditionally renders labels based on sidebarOpen state
      expect(screen.queryByText('대시보드')).not.toBeInTheDocument();
    });

    it('should hide logo text when sidebar is collapsed', () => {
      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      expect(screen.getByText('InfraFlow Admin')).toBeInTheDocument();

      const toggleButton = screen.getAllByRole('button')[0];
      fireEvent.click(toggleButton);

      expect(screen.queryByText('InfraFlow Admin')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible navigation landmark', () => {
      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should have accessible main content landmark', () => {
      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should have sidebar as aside element', () => {
      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      const sidebar = document.querySelector('aside');
      expect(sidebar).toBeInTheDocument();
    });
  });
});
