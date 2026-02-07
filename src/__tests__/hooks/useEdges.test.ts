import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEdges } from '@/hooks/useEdges';
import { mockNodes, mockEdges } from '../mocks/testData';

describe('useEdges', () => {
  let mockOnSpecUpdate: Mock;

  beforeEach(() => {
    mockOnSpecUpdate = vi.fn();
  });

  describe('initial state', () => {
    it('should start with empty edges array', () => {
      const { result } = renderHook(() =>
        useEdges({ nodes: [], onSpecUpdate: mockOnSpecUpdate })
      );
      expect(result.current.edges).toEqual([]);
    });
  });

  describe('deleteEdge', () => {
    it('should remove an edge by id', () => {
      const { result } = renderHook(() =>
        useEdges({ nodes: mockNodes, onSpecUpdate: mockOnSpecUpdate })
      );

      // Set up initial edges
      act(() => {
        result.current.setEdges([...mockEdges]);
      });

      expect(result.current.edges).toHaveLength(2);

      // Delete the first edge
      act(() => {
        result.current.deleteEdge(mockEdges[0].id);
      });

      expect(result.current.edges).toHaveLength(1);
      expect(result.current.edges[0].id).toBe(mockEdges[1].id);
    });

    it('should call onSpecUpdate when deleting edge', () => {
      const { result } = renderHook(() =>
        useEdges({ nodes: mockNodes, onSpecUpdate: mockOnSpecUpdate })
      );

      act(() => {
        result.current.setEdges([...mockEdges]);
      });

      mockOnSpecUpdate.mockClear();

      act(() => {
        result.current.deleteEdge(mockEdges[0].id);
      });

      expect(mockOnSpecUpdate).toHaveBeenCalled();
    });

    it('should not fail when deleting non-existent edge', () => {
      const { result } = renderHook(() =>
        useEdges({ nodes: mockNodes, onSpecUpdate: mockOnSpecUpdate })
      );

      act(() => {
        result.current.setEdges([...mockEdges]);
      });

      // Should not throw
      act(() => {
        result.current.deleteEdge('non-existent-edge');
      });

      // Edges should remain unchanged
      expect(result.current.edges).toHaveLength(2);
    });
  });

  describe('reverseEdge', () => {
    it('should swap source and target of an edge', () => {
      const { result } = renderHook(() =>
        useEdges({ nodes: mockNodes, onSpecUpdate: mockOnSpecUpdate })
      );

      act(() => {
        result.current.setEdges([...mockEdges]);
      });

      const originalEdge = mockEdges[0];

      act(() => {
        result.current.reverseEdge(originalEdge.id);
      });

      const reversedEdge = result.current.edges.find(
        (e) => e.source === originalEdge.target && e.target === originalEdge.source
      );

      expect(reversedEdge).toBeDefined();
      expect(reversedEdge?.source).toBe(originalEdge.target);
      expect(reversedEdge?.target).toBe(originalEdge.source);
    });

    it('should update edge id when reversing', () => {
      const { result } = renderHook(() =>
        useEdges({ nodes: mockNodes, onSpecUpdate: mockOnSpecUpdate })
      );

      act(() => {
        result.current.setEdges([...mockEdges]);
      });

      const originalEdge = mockEdges[0];
      const expectedNewId = `e_${originalEdge.target}_${originalEdge.source}`;

      act(() => {
        result.current.reverseEdge(originalEdge.id);
      });

      const reversedEdge = result.current.edges.find((e) => e.id === expectedNewId);
      expect(reversedEdge).toBeDefined();
    });

    it('should call onSpecUpdate when reversing edge', () => {
      const { result } = renderHook(() =>
        useEdges({ nodes: mockNodes, onSpecUpdate: mockOnSpecUpdate })
      );

      act(() => {
        result.current.setEdges([...mockEdges]);
      });

      mockOnSpecUpdate.mockClear();

      act(() => {
        result.current.reverseEdge(mockEdges[0].id);
      });

      expect(mockOnSpecUpdate).toHaveBeenCalled();
    });
  });

  describe('insertNodeBetween', () => {
    it('should return null without addNodeFn', () => {
      const { result } = renderHook(() =>
        useEdges({ nodes: mockNodes, onSpecUpdate: mockOnSpecUpdate })
      );

      act(() => {
        result.current.setEdges([...mockEdges]);
      });

      let nodeId: string | null = null;
      act(() => {
        nodeId = result.current.insertNodeBetween(mockEdges[0].id, 'firewall');
      });

      expect(nodeId).toBeNull();
    });

    it('should insert node and create two new edges', () => {
      const mockAddNode = vi.fn().mockReturnValue('new-node-id');

      const { result } = renderHook(() =>
        useEdges({ nodes: mockNodes, onSpecUpdate: mockOnSpecUpdate })
      );

      act(() => {
        result.current.setEdges([...mockEdges]);
      });

      const originalEdge = mockEdges[0];
      const originalEdgeCount = result.current.edges.length;

      act(() => {
        result.current.insertNodeBetween(originalEdge.id, 'firewall', undefined, mockAddNode);
      });

      // Should have one more edge (removed 1, added 2)
      expect(result.current.edges).toHaveLength(originalEdgeCount + 1);

      // Old edge should be removed
      expect(result.current.edges.find((e) => e.id === originalEdge.id)).toBeUndefined();

      // Two new edges should exist
      const newEdge1 = result.current.edges.find(
        (e) => e.source === originalEdge.source && e.target === 'new-node-id'
      );
      const newEdge2 = result.current.edges.find(
        (e) => e.source === 'new-node-id' && e.target === originalEdge.target
      );

      expect(newEdge1).toBeDefined();
      expect(newEdge2).toBeDefined();
    });

    it('should call addNodeFn with midpoint position', () => {
      const mockAddNode = vi.fn().mockReturnValue('new-node-id');

      const { result } = renderHook(() =>
        useEdges({ nodes: mockNodes, onSpecUpdate: mockOnSpecUpdate })
      );

      act(() => {
        result.current.setEdges([...mockEdges]);
      });

      const sourceNode = mockNodes[0];
      const targetNode = mockNodes[1];
      const expectedMidpoint = {
        x: (sourceNode.position.x + targetNode.position.x) / 2,
        y: (sourceNode.position.y + targetNode.position.y) / 2,
      };

      act(() => {
        result.current.insertNodeBetween(mockEdges[0].id, 'waf', undefined, mockAddNode);
      });

      expect(mockAddNode).toHaveBeenCalledWith(
        'waf',
        expectedMidpoint,
        undefined
      );
    });

    it('should return null for non-existent edge', () => {
      const mockAddNode = vi.fn().mockReturnValue('new-node-id');

      const { result } = renderHook(() =>
        useEdges({ nodes: mockNodes, onSpecUpdate: mockOnSpecUpdate })
      );

      act(() => {
        result.current.setEdges([...mockEdges]);
      });

      let nodeId: string | null = null;
      act(() => {
        nodeId = result.current.insertNodeBetween('non-existent', 'firewall', undefined, mockAddNode);
      });

      expect(nodeId).toBeNull();
      expect(mockAddNode).not.toHaveBeenCalled();
    });
  });

  describe('setEdges', () => {
    it('should allow direct edge state updates', () => {
      const { result } = renderHook(() =>
        useEdges({ nodes: mockNodes, onSpecUpdate: mockOnSpecUpdate })
      );

      act(() => {
        result.current.setEdges([
          { id: 'test-edge', source: 'a', target: 'b' },
        ]);
      });

      expect(result.current.edges).toHaveLength(1);
      expect(result.current.edges[0].id).toBe('test-edge');
    });
  });
});
