'use client';

import { useCallback, useEffect, useRef } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from '../nodes';
import { edgeTypes } from '../edges';
import { HISTORY_MAX_SIZE, HISTORY_DEBOUNCE_MS } from '@/lib/constants';

interface FlowCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
}

const defaultNodes: Node[] = [];
const defaultEdges: Edge[] = [];

// History state type
interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

export function FlowCanvas({
  initialNodes = defaultNodes,
  initialEdges = defaultEdges,
  onNodesChange: onNodesChangeCallback,
  onEdgesChange: onEdgesChangeCallback,
  onNodeClick,
}: FlowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // History management with refs to avoid re-renders
  const historyRef = useRef<HistoryState[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isUndoRedoRef = useRef<boolean>(false);
  const lastSavedRef = useRef<string>('');

  // Create immutable snapshot using immer
  const createSnapshot = useCallback((nodes: Node[], edges: Edge[]): HistoryState => {
    // Deep clone nodes and edges for history
    return {
      nodes: nodes.map(n => ({
        ...n,
        data: { ...n.data },
        position: { ...n.position },
      })),
      edges: edges.map(e => ({
        ...e,
        data: e.data ? { ...e.data } : undefined,
      })),
    };
  }, []);

  // Generate a simple hash for change detection
  const getStateHash = useCallback((nodes: Node[], edges: Edge[]): string => {
    return `${nodes.length}-${nodes.map(n => `${n.id}:${n.position.x}:${n.position.y}`).join(',')}-${edges.length}`;
  }, []);

  // Save current state to history
  const saveToHistory = useCallback(() => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }

    // Skip if state hasn't changed
    const currentHash = getStateHash(nodes, edges);
    if (currentHash === lastSavedRef.current) {
      return;
    }
    lastSavedRef.current = currentHash;

    const currentState = createSnapshot(nodes, edges);

    // Remove any redo states if we're not at the end
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    }

    // Add new state
    historyRef.current.push(currentState);
    historyIndexRef.current = historyRef.current.length - 1;

    // Limit history size
    if (historyRef.current.length > HISTORY_MAX_SIZE) {
      historyRef.current.shift();
      historyIndexRef.current--;
    }
  }, [nodes, edges, createSnapshot, getStateHash]);

  // Undo function
  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      isUndoRedoRef.current = true;
      historyIndexRef.current--;
      const prevState = historyRef.current[historyIndexRef.current];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      lastSavedRef.current = getStateHash(prevState.nodes, prevState.edges);
    }
  }, [setNodes, setEdges, getStateHash]);

  // Redo function
  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isUndoRedoRef.current = true;
      historyIndexRef.current++;
      const nextState = historyRef.current[historyIndexRef.current];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      lastSavedRef.current = getStateHash(nextState.nodes, nextState.edges);
    }
  }, [setNodes, setEdges, getStateHash]);

  // Sync nodes/edges when initialNodes/initialEdges change from parent
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Initialize history with initial state
  useEffect(() => {
    if (historyRef.current.length === 0 && (initialNodes.length > 0 || initialEdges.length > 0)) {
      const initialState = createSnapshot(initialNodes, initialEdges);
      historyRef.current = [initialState];
      historyIndexRef.current = 0;
      lastSavedRef.current = getStateHash(initialNodes, initialEdges);
    }
  }, [initialNodes, initialEdges, createSnapshot, getStateHash]);

  // Save to history when nodes or edges change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (nodes.length > 0 || edges.length > 0) {
        saveToHistory();
      }
    }, HISTORY_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, saveToHistory]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      // Also support Ctrl+Y for redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, type: 'animated' }, eds));
    },
    [setEdges]
  );

  // Memoize minimap node color function
  const minimapNodeColor = useCallback((node: Node) => {
    switch (node.data?.category) {
      case 'security':
        return '#ef4444';
      case 'network':
        return '#3b82f6';
      case 'compute':
        return '#22c55e';
      case 'cloud':
        return '#a855f7';
      case 'storage':
        return '#f59e0b';
      case 'auth':
        return '#ec4899';
      default:
        return '#71717a';
    }
  }, []);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes as NodeTypes}
        edgeTypes={edgeTypes as EdgeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-zinc-900"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#333"
        />
        <Controls className="bg-zinc-800 border-zinc-700" />
        <MiniMap
          nodeColor={minimapNodeColor}
          className="bg-zinc-800 border-zinc-700"
        />
      </ReactFlow>
    </div>
  );
}
