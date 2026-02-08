/**
 * DynamicArrayField Component Tests
 *
 * Tests for the dynamic array input field including:
 * - Tag rendering and display
 * - Adding new values
 * - Removing values
 * - Keyboard interaction (Enter key)
 * - Duplicate prevention
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DynamicArrayField from '@/components/admin/DynamicArrayField';

const mockOnChange = vi.fn();

describe('DynamicArrayField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render label', () => {
      render(
        <DynamicArrayField
          label="Test Label"
          values={[]}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('should render required indicator when required', () => {
      render(
        <DynamicArrayField
          label="Required Field"
          values={[]}
          onChange={mockOnChange}
          required
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should not render required indicator when not required', () => {
      render(
        <DynamicArrayField
          label="Optional Field"
          values={[]}
          onChange={mockOnChange}
        />
      );

      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });

    it('should render input field with placeholder', () => {
      render(
        <DynamicArrayField
          label="Test"
          values={[]}
          onChange={mockOnChange}
          placeholder="Enter value..."
        />
      );

      expect(screen.getByPlaceholderText('Enter value...')).toBeInTheDocument();
    });

    it('should render default placeholder when not provided', () => {
      render(
        <DynamicArrayField
          label="Test"
          values={[]}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByPlaceholderText('값을 입력하세요')).toBeInTheDocument();
    });

    it('should render add button', () => {
      render(
        <DynamicArrayField
          label="Test"
          values={[]}
          onChange={mockOnChange}
        />
      );

      // Find the add button (button with + icon)
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should render help text', () => {
      render(
        <DynamicArrayField
          label="Test"
          values={[]}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Enter 키 또는 + 버튼으로 추가')).toBeInTheDocument();
    });
  });

  describe('Value Display', () => {
    it('should render existing values as tags', () => {
      render(
        <DynamicArrayField
          label="Test"
          values={['Value 1', 'Value 2', 'Value 3']}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Value 1')).toBeInTheDocument();
      expect(screen.getByText('Value 2')).toBeInTheDocument();
      expect(screen.getByText('Value 3')).toBeInTheDocument();
    });

    it('should render remove button for each tag', () => {
      render(
        <DynamicArrayField
          label="Test"
          values={['Value 1', 'Value 2']}
          onChange={mockOnChange}
        />
      );

      // Each tag should have a remove button (X icon)
      const tags = screen.getAllByText(/Value/);
      tags.forEach((tag) => {
        const tagContainer = tag.closest('span');
        const removeButton = tagContainer?.querySelector('button');
        expect(removeButton).toBeInTheDocument();
      });
    });

    it('should render empty state when no values', () => {
      render(
        <DynamicArrayField
          label="Test"
          values={[]}
          onChange={mockOnChange}
        />
      );

      // No tags should be rendered
      expect(screen.queryByText(/Value/)).not.toBeInTheDocument();
    });
  });

  describe('Adding Values', () => {
    it('should call onChange when Enter is pressed with valid value', async () => {
      const user = userEvent.setup();
      render(
        <DynamicArrayField
          label="Test"
          values={['Existing']}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText('값을 입력하세요');
      await user.type(input, 'New Value');
      await user.keyboard('{Enter}');

      expect(mockOnChange).toHaveBeenCalledWith(['Existing', 'New Value']);
    });

    it('should call onChange when add button is clicked with valid value', async () => {
      const user = userEvent.setup();
      render(
        <DynamicArrayField
          label="Test"
          values={['Existing']}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText('값을 입력하세요');
      await user.type(input, 'New Value');

      // Find and click the add button
      const buttons = screen.getAllByRole('button');
      const addButton = buttons.find((btn) => btn.textContent === '' && (btn as HTMLButtonElement).type === 'button');
      if (addButton) {
        await user.click(addButton);
      }

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should clear input after adding value', async () => {
      const user = userEvent.setup();
      render(
        <DynamicArrayField
          label="Test"
          values={[]}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText('값을 입력하세요');
      await user.type(input, 'New Value');
      await user.keyboard('{Enter}');

      expect(input).toHaveValue('');
    });

    it('should not add empty value', async () => {
      const user = userEvent.setup();
      render(
        <DynamicArrayField
          label="Test"
          values={['Existing']}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText('값을 입력하세요');
      await user.keyboard('{Enter}');

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should not add whitespace-only value', async () => {
      const user = userEvent.setup();
      render(
        <DynamicArrayField
          label="Test"
          values={['Existing']}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText('값을 입력하세요');
      await user.type(input, '   ');
      await user.keyboard('{Enter}');

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should not add duplicate value', async () => {
      const user = userEvent.setup();
      render(
        <DynamicArrayField
          label="Test"
          values={['Existing']}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText('값을 입력하세요');
      await user.type(input, 'Existing');
      await user.keyboard('{Enter}');

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should trim value before adding', async () => {
      const user = userEvent.setup();
      render(
        <DynamicArrayField
          label="Test"
          values={[]}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText('값을 입력하세요');
      await user.type(input, '  New Value  ');
      await user.keyboard('{Enter}');

      expect(mockOnChange).toHaveBeenCalledWith(['New Value']);
    });
  });

  describe('Removing Values', () => {
    it('should call onChange when remove button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <DynamicArrayField
          label="Test"
          values={['Value 1', 'Value 2', 'Value 3']}
          onChange={mockOnChange}
        />
      );

      // Find and click the remove button for Value 2
      const value2Tag = screen.getByText('Value 2').closest('span');
      const removeButton = value2Tag?.querySelector('button');

      if (removeButton) {
        await user.click(removeButton);
      }

      expect(mockOnChange).toHaveBeenCalledWith(['Value 1', 'Value 3']);
    });

    it('should call onChange with empty array when last value is removed', async () => {
      const user = userEvent.setup();
      render(
        <DynamicArrayField
          label="Test"
          values={['Only Value']}
          onChange={mockOnChange}
        />
      );

      const valueTag = screen.getByText('Only Value').closest('span');
      const removeButton = valueTag?.querySelector('button');

      if (removeButton) {
        await user.click(removeButton);
      }

      expect(mockOnChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Input Behavior', () => {
    it('should update input value when typing', async () => {
      const user = userEvent.setup();
      render(
        <DynamicArrayField
          label="Test"
          values={[]}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText('값을 입력하세요');
      await user.type(input, 'Typing test');

      expect(input).toHaveValue('Typing test');
    });

    it('should prevent form submission on Enter', async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn();

      render(
        <form onSubmit={mockSubmit}>
          <DynamicArrayField
            label="Test"
            values={[]}
            onChange={mockOnChange}
          />
        </form>
      );

      const input = screen.getByPlaceholderText('값을 입력하세요');
      await user.type(input, 'Test');
      await user.keyboard('{Enter}');

      // Form should not be submitted
      expect(mockSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible input', () => {
      render(
        <DynamicArrayField
          label="Test Field"
          values={[]}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText('값을 입력하세요');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should have accessible remove buttons', () => {
      render(
        <DynamicArrayField
          label="Test"
          values={['Value 1']}
          onChange={mockOnChange}
        />
      );

      const removeButtons = screen.getAllByRole('button');
      removeButtons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });

  describe('Styling', () => {
    it('should apply correct styles to tags', () => {
      render(
        <DynamicArrayField
          label="Test"
          values={['Value 1']}
          onChange={mockOnChange}
        />
      );

      const tag = screen.getByText('Value 1').closest('span');
      expect(tag).toHaveClass('bg-blue-100', 'text-blue-800');
    });
  });
});
