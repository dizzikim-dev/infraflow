'use client';

import { useCallback, useEffect, useState, memo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  NodeTypes,
  EdgeTypes,
  useReactFlow,
  ReactFlowProvider,
  SelectionMode,
  XYPosition,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from '../nodes';
import { edgeTypes } from '../edges';
import { NodeEditingProvider } from '@/hooks/useNodeEditing';
import { useHistory } from '@/hooks/useHistory';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('FlowCanvas');

/** Node category colors for minimap - matches design system node category palette */
const NODE_CATEGORY_COLORS: Record<string, string> = {
  security: '#ef4444',  // Red 500
  network: '#3b82f6',   // Blue 500
  compute: '#22c55e',   // Green 500
  cloud: '#a855f7',     // Purple 500
  storage: '#f59e0b',   // Amber 500
  auth: '#ec4899',      // Pink 500
  telecom: '#14b8a6',   // Teal 500
  wan: '#6366f1',       // Indigo 500
};

const DEFAULT_NODE_COLOR = '#71717a'; // Zinc 500

interface FlowCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  onNodeDataUpdate?: (nodeId: string, field: 'label' | 'description', value: string) => void;
  // Context menu callbacks
  onCanvasContextMenu?: (screenPos: { x: number; y: number }, canvasPos: XYPosition) => void;
  onNodeContextMenu?: (screenPos: { x: number; y: number }, nodeId: string) => void;
  onEdgeContextMenu?: (screenPos: { x: number; y: number }, edgeId: string) => void;
}

const defaultNodes: Node[] = [];
const defaultEdges: Edge[] = [];

// Inner component that can use useReactFlow
const FlowCanvasInner = memo(function FlowCanvasInner({
  initialNodes = defaultNodes,
  initialEdges = defaultEdges,
  onNodesChange: onNodesChangeCallback,
  onEdgesChange: onEdgesChangeCallback,
  onNodeClick,
  onNodeDataUpdate,
  onCanvasContextMenu,
  onNodeContextMenu,
  onEdgeContextMenu,
}: FlowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition } = useReactFlow();

  // Space key tracking: Space held → pan mode, otherwise → selection/drag mode
  const [isSpaceHeld, setIsSpaceHeld] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        // Prevent page scroll when space is pressed on canvas
        if ((e.target as HTMLElement)?.closest('.react-flow')) {
          e.preventDefault();
        }
        setIsSpaceHeld(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpaceHeld(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Use the extracted history hook for undo/redo functionality
  useHistory(nodes, edges, setNodes, setEdges, {
    enableKeyboardShortcuts: true,
  });

  // Sync nodes/edges when initialNodes/initialEdges change from parent
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      log.debug('onConnect called', { source: params.source, target: params.target });
      setEdges((eds) => {
        const newEdges = addEdge({ ...params, type: 'animated' }, eds);
        log.debug('Edges updated', { count: newEdges.length });
        return newEdges;
      });
    },
    [setEdges]
  );

  // Handle canvas context menu (right-click on empty area)
  const handlePaneContextMenu = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      event.preventDefault();
      if (!onCanvasContextMenu) return;

      const screenPos = { x: event.clientX, y: event.clientY };
      const canvasPos = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      onCanvasContextMenu(screenPos, canvasPos);
    },
    [onCanvasContextMenu, screenToFlowPosition]
  );

  // Handle node context menu (right-click on node)
  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      if (!onNodeContextMenu) return;

      const screenPos = { x: event.clientX, y: event.clientY };
      onNodeContextMenu(screenPos, node.id);
    },
    [onNodeContextMenu]
  );

  // Handle edge context menu (right-click on edge)
  const handleEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      if (!onEdgeContextMenu) return;

      const screenPos = { x: event.clientX, y: event.clientY };
      onEdgeContextMenu(screenPos, edge.id);
    },
    [onEdgeContextMenu]
  );

  // Memoize minimap node color function
  const minimapNodeColor = useCallback((node: Node) => {
    const category = node.data?.category as string | undefined;
    return (category && NODE_CATEGORY_COLORS[category]) || DEFAULT_NODE_COLOR;
  }, []);

  return (
    <div className="w-full h-full">
      <NodeEditingProvider onNodeDataUpdate={onNodeDataUpdate}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneContextMenu={handlePaneContextMenu}
          onNodeContextMenu={handleNodeContextMenu}
          onEdgeContextMenu={handleEdgeContextMenu}
          nodeTypes={nodeTypes as NodeTypes}
          edgeTypes={edgeTypes as EdgeTypes}
          fitView
          attributionPosition="bottom-left"
          className={`bg-zinc-900 ${isSpaceHeld ? 'cursor-grab' : ''}`}
          // Default: drag to select, Space+drag: pan
          panOnDrag={isSpaceHeld}
          selectionOnDrag={!isSpaceHeld}
          selectionMode={SelectionMode.Partial}
          panOnScroll={false}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="rgba(255, 255, 255, 0.08)"
          />
          <Controls className="bg-zinc-800 border-zinc-700" />
          <MiniMap
            nodeColor={minimapNodeColor}
            className="bg-zinc-800 border-zinc-700"
          />
        </ReactFlow>
      </NodeEditingProvider>
    </div>
  );
});

// Exported wrapper component with ReactFlowProvider
export const FlowCanvas = memo(function FlowCanvas(props: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
});
