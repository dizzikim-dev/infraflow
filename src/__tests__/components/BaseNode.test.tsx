import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BaseNode } from '@/components/nodes/BaseNode';
import { InfraNodeData, NodeCategory } from '@/types';

// Mock @xyflow/react
vi.mock('@xyflow/react', () => ({
  Handle: ({ position, type, id }: any) => (
    <div data-testid={`handle-${type}-${position}`} data-id={id} />
  ),
  Position: { Left: 'left', Right: 'right', Top: 'top', Bottom: 'bottom' },
  useNodeId: () => 'test-node-id',
}));

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

// Mock design utilities
vi.mock('@/lib/design', () => ({
  getColorsForNode: vi.fn(() => ({ primary: '#ff0000', secondary: '#ff6666' })),
  nodeIcons: {
    firewall: 'M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z',
    user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2',
  },
}));

// Mock EditableLabel
vi.mock('@/components/nodes/EditableLabel', () => ({
  EditableLabel: ({ value, isEditing, onStartEdit, onCommit, onCancel, placeholder }: any) => (
    <div data-testid="editable-label" data-is-editing={isEditing}>
      {isEditing ? (
        <input
          data-testid="editable-input"
          defaultValue={value}
          placeholder={placeholder}
          onBlur={(e) => onCommit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onCancel();
            if (e.key === 'Enter') onCommit((e.target as HTMLInputElement).value);
          }}
        />
      ) : (
        <span onClick={onStartEdit}>{value || placeholder}</span>
      )}
    </div>
  ),
}));

describe('BaseNode', () => {
  const mockData: InfraNodeData = {
    label: 'Test Firewall',
    nodeType: 'firewall',
    category: 'security',
    description: 'Test description',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render node with label', () => {
      render(<BaseNode data={mockData} icon="🔥" color="red" />);
      expect(screen.getByText('Test Firewall')).toBeInTheDocument();
    });

    it('should render node with description', () => {
      render(<BaseNode data={mockData} icon="🔥" color="red" />);
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('should render node type', () => {
      render(<BaseNode data={mockData} icon="🔥" color="red" />);
      expect(screen.getByText('firewall')).toBeInTheDocument();
    });

    it('should render all four handles', () => {
      render(<BaseNode data={mockData} icon="🔥" color="red" />);

      expect(screen.getByTestId('handle-target-left')).toBeInTheDocument();
      expect(screen.getByTestId('handle-source-right')).toBeInTheDocument();
      expect(screen.getByTestId('handle-target-top')).toBeInTheDocument();
      expect(screen.getByTestId('handle-source-bottom')).toBeInTheDocument();
    });
  });

  describe('Categories', () => {
    const categories: Array<NodeCategory | 'external' | 'zone'> = [
      'security',
      'network',
      'compute',
      'cloud',
      'storage',
      'auth',
      'external',
      'zone',
    ];

    categories.forEach((category) => {
      it(`should render ${category} category correctly`, () => {
        const data: InfraNodeData = {
          ...mockData,
          category: category as NodeCategory,
        };
        render(<BaseNode data={data} icon="🔥" color="red" />);
        expect(screen.getByText('Test Firewall')).toBeInTheDocument();
      });
    });
  });

  describe('Selection', () => {
    it('should not apply selected styles when not selected', () => {
      const { container } = render(
        <BaseNode data={mockData} icon="🔥" color="red" selected={false} />
      );
      const card = container.querySelector('.border-white\\/60');
      expect(card).toBeNull();
    });

    it('should apply selected styles when selected', () => {
      const { container } = render(
        <BaseNode data={mockData} icon="🔥" color="red" selected={true} />
      );
      const card = container.querySelector('.border-white\\/60');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Policies', () => {
    it('should not show policy indicator when no policies', () => {
      render(<BaseNode data={mockData} icon="🔥" color="red" />);
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('should show policy indicator with count', () => {
      const dataWithPolicies: InfraNodeData = {
        ...mockData,
        policies: [
          { id: 'p1', name: 'Policy 1', type: 'allow' },
          { id: 'p2', name: 'Policy 2', type: 'deny' },
        ],
      };
      render(<BaseNode data={dataWithPolicies} icon="🔥" color="red" />);
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('Editing', () => {
    it('should render EditableLabel when onStartEditLabel is provided', () => {
      const onStartEditLabel = vi.fn();
      render(
        <BaseNode
          data={mockData}
          icon="🔥"
          color="red"
          onStartEditLabel={onStartEditLabel}
        />
      );
      expect(screen.getByTestId('editable-label')).toBeInTheDocument();
    });

    it('should call onCommitEdit when label is edited', () => {
      const onCommitEdit = vi.fn();
      render(
        <BaseNode
          data={mockData}
          icon="🔥"
          color="red"
          isEditingLabel={true}
          onStartEditLabel={() => {}}
          onCommitEdit={onCommitEdit}
          onCancelEdit={() => {}}
        />
      );

      const input = screen.getByTestId('editable-input');
      fireEvent.change(input, { target: { value: 'New Label' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onCommitEdit).toHaveBeenCalledWith('label', 'New Label');
    });

    it('should call onCancelEdit when editing is cancelled', () => {
      const onCancelEdit = vi.fn();
      render(
        <BaseNode
          data={mockData}
          icon="🔥"
          color="red"
          isEditingLabel={true}
          onStartEditLabel={() => {}}
          onCommitEdit={() => {}}
          onCancelEdit={onCancelEdit}
        />
      );

      const input = screen.getByTestId('editable-input');
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(onCancelEdit).toHaveBeenCalled();
    });
  });

  describe('Without description', () => {
    it('should not show description when not provided', () => {
      const dataWithoutDescription: InfraNodeData = {
        label: 'Test Node',
        nodeType: 'firewall',
        category: 'security',
      };
      render(<BaseNode data={dataWithoutDescription} icon="🔥" color="red" />);
      expect(screen.queryByText('Test description')).not.toBeInTheDocument();
    });
  });
});
