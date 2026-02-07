import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNodes } from '@/hooks/useNodes';

describe('useNodes', () => {
  let mockOnSpecUpdate: Mock;
  let mockOnEdgesUpdate: Mock;
  let mockOnSelectionClear: Mock;

  beforeEach(() => {
    mockOnSpecUpdate = vi.fn();
    mockOnEdgesUpdate = vi.fn();
    mockOnSelectionClear = vi.fn();
  });

  describe('initial state', () => {
    it('should start with empty nodes array', () => {
      const { result } = renderHook(() => useNodes());
      expect(result.current.nodes).toEqual([]);
    });
  });

  describe('addNode', () => {
    it('should add a node with correct position', () => {
      const { result } = renderHook(() =>
        useNodes({ onSpecUpdate: mockOnSpecUpdate })
      );

      act(() => {
        result.current.addNode('firewall', { x: 100, y: 200 });
      });

      expect(result.current.nodes).toHaveLength(1);
      expect(result.current.nodes[0].position).toEqual({ x: 100, y: 200 });
      expect(result.current.nodes[0].type).toBe('firewall');
    });

    it('should add a node with component data', () => {
      const { result } = renderHook(() =>
        useNodes({ onSpecUpdate: mockOnSpecUpdate })
      );

      const componentData = {
        id: 'firewall',
        name: 'Firewall',
        nameKo: '방화벽',
        category: 'security',
        tier: 'dmz',
      };

      act(() => {
        result.current.addNode('firewall', { x: 0, y: 0 }, componentData);
      });

      expect(result.current.nodes[0].data.label).toBe('방화벽');
      expect(result.current.nodes[0].data.category).toBe('security');
      expect(result.current.nodes[0].data.tier).toBe('dmz');
    });

    it('should call onSpecUpdate when adding a node', () => {
      const { result } = renderHook(() =>
        useNodes({ onSpecUpdate: mockOnSpecUpdate })
      );

      act(() => {
        result.current.addNode('firewall', { x: 0, y: 0 });
      });

      expect(mockOnSpecUpdate).toHaveBeenCalled();
    });

    it('should create new spec if none exists', () => {
      const { result } = renderHook(() =>
        useNodes({ onSpecUpdate: mockOnSpecUpdate })
      );

      act(() => {
        result.current.addNode('firewall', { x: 0, y: 0 });
      });

      // Get the updater function and call it with null
      const updater = mockOnSpecUpdate.mock.calls[0][0];
      const newSpec = updater(null);

      expect(newSpec).toMatchObject({
        name: 'New Diagram',
        nodes: expect.arrayContaining([
          expect.objectContaining({ type: 'firewall' }),
        ]),
        connections: [],
      });
    });
  });

  describe('deleteNode', () => {
    it('should remove a node by id', () => {
      const { result } = renderHook(() =>
        useNodes({
          onSpecUpdate: mockOnSpecUpdate,
          onEdgesUpdate: mockOnEdgesUpdate,
          onSelectionClear: mockOnSelectionClear,
        })
      );

      // Add a node first
      let nodeId: string | null = null;
      act(() => {
        nodeId = result.current.addNode('firewall', { x: 0, y: 0 });
      });

      expect(result.current.nodes).toHaveLength(1);

      // Delete the node
      act(() => {
        if (nodeId) result.current.deleteNode(nodeId);
      });

      expect(result.current.nodes).toHaveLength(0);
    });

    it('should call onEdgesUpdate to remove connected edges', () => {
      const { result } = renderHook(() =>
        useNodes({
          onSpecUpdate: mockOnSpecUpdate,
          onEdgesUpdate: mockOnEdgesUpdate,
        })
      );

      act(() => {
        const nodeId = result.current.addNode('firewall', { x: 0, y: 0 });
        if (nodeId) result.current.deleteNode(nodeId);
      });

      expect(mockOnEdgesUpdate).toHaveBeenCalled();
    });

    it('should call onSelectionClear with deleted node id', () => {
      const { result } = renderHook(() =>
        useNodes({
          onSpecUpdate: mockOnSpecUpdate,
          onSelectionClear: mockOnSelectionClear,
        })
      );

      let nodeId: string | null = null;
      act(() => {
        nodeId = result.current.addNode('firewall', { x: 0, y: 0 });
      });

      act(() => {
        if (nodeId) result.current.deleteNode(nodeId);
      });

      expect(mockOnSelectionClear).toHaveBeenCalledWith(nodeId);
    });
  });

  describe('duplicateNode', () => {
    it('should duplicate a node with offset position', () => {
      const { result } = renderHook(() =>
        useNodes({ onSpecUpdate: mockOnSpecUpdate })
      );

      let nodeId: string | null = null;
      act(() => {
        nodeId = result.current.addNode('firewall', { x: 100, y: 100 });
      });

      act(() => {
        if (nodeId) result.current.duplicateNode(nodeId);
      });

      expect(result.current.nodes).toHaveLength(2);
      expect(result.current.nodes[1].position).toEqual({ x: 150, y: 150 });
    });

    it('should append (복사본) to duplicated node label', () => {
      const { result } = renderHook(() =>
        useNodes({ onSpecUpdate: mockOnSpecUpdate })
      );

      act(() => {
        result.current.addNode('firewall', { x: 0, y: 0 }, {
          id: 'firewall',
          name: 'Firewall',
          nameKo: '방화벽',
          category: 'security',
          tier: 'dmz',
        });
      });

      act(() => {
        const nodeId = result.current.nodes[0].id;
        result.current.duplicateNode(nodeId);
      });

      expect(result.current.nodes[1].data.label).toBe('방화벽 (복사본)');
    });

    it('should return null for non-existent node', () => {
      const { result } = renderHook(() => useNodes());

      let duplicatedId: string | null = null;
      act(() => {
        duplicatedId = result.current.duplicateNode('non-existent');
      });

      expect(duplicatedId).toBeNull();
    });
  });

  describe('updateNodeData', () => {
    it('should update node label', () => {
      const { result } = renderHook(() =>
        useNodes({ onSpecUpdate: mockOnSpecUpdate })
      );

      let nodeId: string | null = null;
      act(() => {
        nodeId = result.current.addNode('firewall', { x: 0, y: 0 });
      });

      act(() => {
        if (nodeId) result.current.updateNodeData(nodeId, 'label', '새 방화벽');
      });

      expect(result.current.nodes[0].data.label).toBe('새 방화벽');
    });

    it('should update node description', () => {
      const { result } = renderHook(() =>
        useNodes({ onSpecUpdate: mockOnSpecUpdate })
      );

      let nodeId: string | null = null;
      act(() => {
        nodeId = result.current.addNode('firewall', { x: 0, y: 0 });
      });

      act(() => {
        if (nodeId) result.current.updateNodeData(nodeId, 'description', '새 설명');
      });

      expect(result.current.nodes[0].data.description).toBe('새 설명');
    });

    it('should call onSpecUpdate when updating node data', () => {
      const { result } = renderHook(() =>
        useNodes({ onSpecUpdate: mockOnSpecUpdate })
      );

      let nodeId: string | null = null;
      act(() => {
        nodeId = result.current.addNode('firewall', { x: 0, y: 0 });
      });

      mockOnSpecUpdate.mockClear();

      act(() => {
        if (nodeId) result.current.updateNodeData(nodeId, 'label', '새 라벨');
      });

      expect(mockOnSpecUpdate).toHaveBeenCalled();
    });
  });

  describe('setNodes', () => {
    it('should allow direct node state updates', () => {
      const { result } = renderHook(() => useNodes());

      act(() => {
        result.current.setNodes([
          {
            id: 'test-1',
            type: 'firewall',
            position: { x: 0, y: 0 },
            data: { label: 'Test', nodeType: 'firewall', category: 'security' },
          },
        ]);
      });

      expect(result.current.nodes).toHaveLength(1);
      expect(result.current.nodes[0].id).toBe('test-1');
    });
  });
});
