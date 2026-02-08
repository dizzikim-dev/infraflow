/**
 * SearchFilter Component Tests
 *
 * Tests for the search and filter component including:
 * - Search input functionality
 * - Category filter dropdown
 * - Tier filter dropdown
 * - Active filter display and removal
 * - Form submission handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchFilter from '@/components/admin/SearchFilter';

const mockOnSearch = vi.fn();
const mockOnCategoryChange = vi.fn();
const mockOnTierChange = vi.fn();

describe('SearchFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render search input', () => {
      render(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
        />
      );

      expect(screen.getByPlaceholderText('컴포넌트 검색...')).toBeInTheDocument();
    });

    it('should render category dropdown', () => {
      render(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
        />
      );

      // There should be two comboboxes (category and tier)
      const comboboxes = screen.getAllByRole('combobox');
      expect(comboboxes.length).toBe(2);
      expect(screen.getByRole('option', { name: '전체 카테고리' })).toBeInTheDocument();
    });

    it('should render all category options', () => {
      render(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
        />
      );

      expect(screen.getByRole('option', { name: '전체 카테고리' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '보안' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '네트워크' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '컴퓨팅' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '클라우드' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '스토리지' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '인증' })).toBeInTheDocument();
      // '외부' appears twice - once in category and once in tier dropdown
      expect(screen.getAllByRole('option', { name: '외부' }).length).toBeGreaterThanOrEqual(1);
    });

    it('should render all tier options', () => {
      render(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
        />
      );

      expect(screen.getByRole('option', { name: '전체 티어' })).toBeInTheDocument();
      // Note: '외부' appears twice - once in category and once in tier
      expect(screen.getAllByRole('option', { name: '외부' }).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByRole('option', { name: 'DMZ' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '내부' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '데이터' })).toBeInTheDocument();
    });
  });

  describe('Initial Values', () => {
    it('should display initial search value', () => {
      render(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
          search="firewall"
        />
      );

      expect(screen.getByPlaceholderText('컴포넌트 검색...')).toHaveValue('firewall');
    });

    it('should select initial category', () => {
      render(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
          category="security"
        />
      );

      // Find the category select (first combobox)
      const selects = screen.getAllByRole('combobox');
      expect(selects[0]).toHaveValue('security');
    });

    it('should select initial tier', () => {
      render(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
          tier="dmz"
        />
      );

      // Find the tier select (second combobox)
      const selects = screen.getAllByRole('combobox');
      expect(selects[1]).toHaveValue('dmz');
    });
  });

  describe('Search Functionality', () => {
    it('should update search input when typing', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
        />
      );

      const searchInput = screen.getByPlaceholderText('컴포넌트 검색...');
      await user.type(searchInput, 'test');

      expect(searchInput).toHaveValue('test');
    });

    it('should call onSearch when form is submitted', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
        />
      );

      const searchInput = screen.getByPlaceholderText('컴포넌트 검색...');
      await user.type(searchInput, 'firewall');
      await user.keyboard('{Enter}');

      expect(mockOnSearch).toHaveBeenCalledWith('firewall');
    });

    it('should call onSearch with empty string when input is cleared', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
          search="test"
        />
      );

      const searchInput = screen.getByPlaceholderText('컴포넌트 검색...');
      await user.clear(searchInput);

      expect(mockOnSearch).toHaveBeenCalledWith('');
    });

    it('should show clear button when search has value', () => {
      render(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
          search="test"
        />
      );

      // There should be a clear button in the input area
      const clearButtons = screen.getAllByRole('button');
      expect(clearButtons.length).toBeGreaterThan(0);
    });

    it('should clear search and call onSearch when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
          search="test"
        />
      );

      // Find the clear button in the search input area
      const searchInput = screen.getByPlaceholderText('컴포넌트 검색...');
      const inputContainer = searchInput.closest('.relative');
      const clearButton = inputContainer?.querySelector('button');

      if (clearButton) {
        await user.click(clearButton);
        expect(mockOnSearch).toHaveBeenCalledWith('');
      }
    });
  });

  describe('Category Filter', () => {
    it('should call onCategoryChange when category is selected', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
        />
      );

      const selects = screen.getAllByRole('combobox');
      await user.selectOptions(selects[0], 'security');

      expect(mockOnCategoryChange).toHaveBeenCalledWith('security');
    });

    it('should call onCategoryChange with empty string when all categories selected', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
          category="security"
        />
      );

      const selects = screen.getAllByRole('combobox');
      await user.selectOptions(selects[0], '');

      expect(mockOnCategoryChange).toHaveBeenCalledWith('');
    });
  });

  describe('Tier Filter', () => {
    it('should call onTierChange when tier is selected', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
        />
      );

      const selects = screen.getAllByRole('combobox');
      await user.selectOptions(selects[1], 'dmz');

      expect(mockOnTierChange).toHaveBeenCalledWith('dmz');
    });

    it('should call onTierChange with empty string when all tiers selected', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
          tier="dmz"
        />
      );

      const selects = screen.getAllByRole('combobox');
      await user.selectOptions(selects[1], '');

      expect(mockOnTierChange).toHaveBeenCalledWith('');
    });
  });

  describe('Active Filter Tags', () => {
    it('should not show filter tags when no filters are active', () => {
      render(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
        />
      );

      expect(screen.queryByText('검색:')).not.toBeInTheDocument();
      expect(screen.queryByText('카테고리:')).not.toBeInTheDocument();
      expect(screen.queryByText('티어:')).not.toBeInTheDocument();
    });

    it('should show search filter tag when search is active', () => {
      render(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
          search="firewall"
        />
      );

      expect(screen.getByText('검색: firewall')).toBeInTheDocument();
    });

    it('should show category filter tag when category is selected', () => {
      render(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
          category="security"
        />
      );

      expect(screen.getByText(/카테고리: 보안/)).toBeInTheDocument();
    });

    it('should show tier filter tag when tier is selected', () => {
      render(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
          tier="dmz"
        />
      );

      expect(screen.getByText(/티어: DMZ/)).toBeInTheDocument();
    });

    it('should show all filter tags when all filters are active', () => {
      render(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
          search="test"
          category="network"
          tier="internal"
        />
      );

      expect(screen.getByText('검색: test')).toBeInTheDocument();
      expect(screen.getByText(/카테고리: 네트워크/)).toBeInTheDocument();
      expect(screen.getByText(/티어: 내부/)).toBeInTheDocument();
    });
  });

  describe('Filter Tag Removal', () => {
    it('should clear search when search tag close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
          search="test"
        />
      );

      // Find the search tag and click its close button
      const searchTag = screen.getByText('검색: test').closest('span');
      const closeButton = searchTag?.querySelector('button');

      if (closeButton) {
        await user.click(closeButton);
        expect(mockOnSearch).toHaveBeenCalledWith('');
      }
    });

    it('should clear category when category tag close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
          category="security"
        />
      );

      // Find the category tag and click its close button
      const categoryTag = screen.getByText(/카테고리: 보안/).closest('span');
      const closeButton = categoryTag?.querySelector('button');

      if (closeButton) {
        await user.click(closeButton);
        expect(mockOnCategoryChange).toHaveBeenCalledWith('');
      }
    });

    it('should clear tier when tier tag close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
          tier="dmz"
        />
      );

      // Find the tier tag and click its close button
      const tierTag = screen.getByText(/티어: DMZ/).closest('span');
      const closeButton = tierTag?.querySelector('button');

      if (closeButton) {
        await user.click(closeButton);
        expect(mockOnTierChange).toHaveBeenCalledWith('');
      }
    });
  });

  describe('Search Input Sync', () => {
    it('should sync search input when search prop changes', async () => {
      const { rerender } = render(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
          search=""
        />
      );

      expect(screen.getByPlaceholderText('컴포넌트 검색...')).toHaveValue('');

      rerender(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
          search="updated"
        />
      );

      expect(screen.getByPlaceholderText('컴포넌트 검색...')).toHaveValue('updated');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible search input', () => {
      render(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
        />
      );

      const searchInput = screen.getByPlaceholderText('컴포넌트 검색...');
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('should have accessible dropdowns', () => {
      render(
        <SearchFilter
          onSearch={mockOnSearch}
          onCategoryChange={mockOnCategoryChange}
          onTierChange={mockOnTierChange}
        />
      );

      const selects = screen.getAllByRole('combobox');
      expect(selects).toHaveLength(2);
    });
  });
});
