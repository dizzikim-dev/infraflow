'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { XYPosition, Node, Edge } from '@xyflow/react';
import { FlowCanvas } from '@/components/shared';
import { Header, EmptyState } from '@/components/layout';
import { PromptPanel } from '@/components/panels';
import { HistorySidebar, SidebarToggle } from '@/components/sidebar';
import {
  CanvasContextMenu,
  NodeContextMenu,
  EdgeContextMenu,
  ComponentPicker,
} from '@/components/contextMenu';
import { EditorPanels } from './EditorPanels';
import { useInfraState, useModalManager, useContextMenu, useComparisonMode, useHistory, type ComponentData } from '@/hooks';
import { useDiagramPersistence } from '@/hooks/useDiagramPersistence';
import { useSidebar } from '@/hooks/useSidebar';
import { useLocalHistory } from '@/hooks/useLocalHistory';
import { useDbHistory } from '@/hooks/useDbHistory';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { InfraNodeType, InfraSpec } from '@/types';
import { isInfraNodeData } from '@/types/guards';

const ComparisonView = dynamic(
  () => import('@/components/comparison/ComparisonView').then(mod => ({ default: mod.ComparisonView })),
  { ssr: false }
);

export interface InfraEditorProps {
  diagramId?: string | null;
  initialSpec?: InfraSpec | null;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  title?: string;
  onTitleChange?: (title: string) => void;
  onFirstSave?: (diagramId: string) => void;
}

export function InfraEditor({
  diagramId = null,
  initialSpec = null,
  initialNodes,
  initialEdges,
  title,
  onTitleChange,
  onFirstSave,
}: InfraEditorProps) {
  // Infrastructure state management
  const {
    canvasRef,
    isLoading,
    nodes,
    edges,
    currentSpec,
    lastResult,
    currentScenario,
    animationSequence,
    selectedNodeDetail,
    setSelectedNodeDetail,
    selectedNodePolicy,
    setSelectedNodePolicy,
    handlePromptSubmit,
    handleScenarioSelect,
    handleTemplateSelect,
    handleNodeClick,
    loadFromSpec,
    updateNodeData,
    // State setters
    setNodes,
    setEdges,
    // CRUD operations
    addNode,
    deleteNode,
    duplicateNode,
    insertNodeBetween,
    deleteEdge,
    reverseEdge,
    // LLM Modification
    handleLLMModify,
    llmAvailable,
    // Result management
    setLastResult,
    // Feedback
    feedback,
  } = useInfraState();

  // Undo/Redo history
  const { undo, redo, canUndo, canRedo } = useHistory(nodes, edges, setNodes, setEdges);

  // ── Title state management ──
  // On /diagram/[id] page: `title` + `onTitleChange` are provided by parent
  // On home page (/): we manage title locally
  const [localTitle, setLocalTitle] = useState<string>('');
  const effectiveTitle = title ?? localTitle;

  const handleTitleChange = useCallback((newTitle: string) => {
    if (onTitleChange) {
      onTitleChange(newTitle); // External management (diagram page)
    } else {
      setLocalTitle(newTitle); // Local management (home page)
    }
  }, [onTitleChange]);

  // Load initial spec once on mount
  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current || !initialSpec) return;
    loadedRef.current = true;
    justLoadedRef.current = true; // Don't trigger auto-save for initial load
    loadFromSpec(initialSpec, initialNodes, initialEdges);
  }, [initialSpec, initialNodes, initialEdges, loadFromSpec]);

  // Diagram persistence (auto-save for /diagram/[id] pages)
  const persistence = useDiagramPersistence({
    diagramId,
    spec: currentSpec,
    nodes,
    edges,
  });

  // Ref for prompt textarea focus
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Context menu state management
  const {
    menuState,
    openCanvasMenu,
    openNodeMenu,
    openEdgeMenu,
    closeMenu,
  } = useContextMenu();

  // State for component picker (when inserting node on edge)
  const [insertEdgeId, setInsertEdgeId] = useState<string | null>(null);
  const [insertPosition, setInsertPosition] = useState<{ x: number; y: number } | null>(null);

  // Comparison mode state management
  const comparison = useComparisonMode();

  // Modal state management
  const {
    showTemplateGallery,
    showExportPanel,
    showSaveDialog,
    showScenarioSelector,
    showAnimationControls,
    showHealthCheck,
    showInsights,
    showVulnerability,
    showCloudCatalog,
    showCompliance,
    showBenchmark,
    openModal,
    closeModal,
    toggleModal,
  } = useModalManager();

  // Auth state for hybrid history (localStorage vs DB)
  const { status: sessionStatus } = useSession();
  const isAuthenticated = sessionStatus === 'authenticated';
  const router = useRouter();

  // Sidebar + History
  const sidebar = useSidebar();
  const localHistory = useLocalHistory();
  const dbHistory = useDbHistory(isAuthenticated, diagramId);

  // Unified history entries for sidebar
  const historyEntries = isAuthenticated ? dbHistory.entries : localHistory.entries;
  const historyActiveId = isAuthenticated ? dbHistory.activeId : localHistory.activeId;
  const historyLoading = isAuthenticated ? dbHistory.loading : false;

  // ── Auto-save on spec OR title change ──
  const prevSpecRef = useRef<InfraSpec | null>(null);
  const prevTitleRef = useRef<string>('');
  // Skip auto-save once after selecting/loading an existing diagram
  const justLoadedRef = useRef(false);

  useEffect(() => {
    // Must have actual nodes on canvas (not just stale spec)
    if (!nodes.length) return;
    if (!currentSpec?.nodes?.length) return;

    const specChanged = currentSpec !== prevSpecRef.current;
    // Title change only counts when going from non-empty to non-empty
    // (prevents ghost saves when clearing title via "새 다이어그램")
    const titleChanged = effectiveTitle !== prevTitleRef.current
      && prevTitleRef.current !== ''
      && effectiveTitle !== '';

    if (!specChanged && !titleChanged) return;

    prevSpecRef.current = currentSpec;
    prevTitleRef.current = effectiveTitle;

    // When loading an existing diagram, skip the save (just update refs)
    if (justLoadedRef.current) {
      justLoadedRef.current = false;
      return;
    }

    if (isAuthenticated && !diagramId) {
      dbHistory.saveSession(currentSpec, effectiveTitle || undefined, nodes, edges);
    } else if (!isAuthenticated) {
      localHistory.saveSession(currentSpec, effectiveTitle || undefined);
    }
    // When diagramId is set, useDiagramPersistence handles DB auto-save
  }, [currentSpec, effectiveTitle, isAuthenticated, diagramId, localHistory, dbHistory, nodes, edges]);

  // ── Auto-title from first prompt (GPT-like: first message = thread title) ──
  const wrappedPromptSubmit = useCallback((prompt: string) => {
    if (!effectiveTitle) {
      const autoTitle = prompt.length > 60 ? prompt.slice(0, 57) + '...' : prompt;
      handleTitleChange(autoTitle);
    }
    handlePromptSubmit(prompt);
  }, [effectiveTitle, handleTitleChange, handlePromptSubmit]);

  // Select a diagram from sidebar
  const handleDiagramSelect = useCallback(async (id: string) => {
    // Flag: loading existing diagram — don't trigger auto-save
    justLoadedRef.current = true;
    if (isAuthenticated) {
      const diagram = await dbHistory.selectSession(id);
      if (diagram) {
        loadFromSpec(diagram.spec, diagram.nodesJson ?? undefined, diagram.edgesJson ?? undefined);
        setLocalTitle(diagram.title);
      }
    } else {
      const entry = localHistory.selectSession(id);
      if (entry) {
        loadFromSpec(entry.spec);
        setLocalTitle(entry.title);
      }
    }
  }, [isAuthenticated, dbHistory, localHistory, loadFromSpec]);

  // New diagram from sidebar
  const handleNewDiagram = useCallback(() => {
    if (isAuthenticated) {
      dbHistory.startNewSession();
    } else {
      localHistory.startNewSession();
    }
    // Reset refs to prevent ghost saves (title clear / spec clear triggering auto-save)
    prevSpecRef.current = null;
    prevTitleRef.current = '';
    setLocalTitle('');
    setNodes([]);
    setEdges([]);
    // If on /diagram/[id] page, navigate to home so diagramId clears
    if (diagramId) {
      router.push('/');
    }
  }, [isAuthenticated, dbHistory, localHistory, setNodes, setEdges, diagramId, router]);

  // Delete a diagram from sidebar
  const handleDiagramDelete = useCallback((id: string) => {
    if (isAuthenticated) {
      dbHistory.deleteEntry(id);
    } else {
      localHistory.deleteEntry(id);
    }
  }, [isAuthenticated, dbHistory, localHistory]);

  // Handle scenario selection with modal management
  const onScenarioSelect = useCallback((type: Parameters<typeof handleScenarioSelect>[0]) => {
    handleScenarioSelect(type);
    closeModal('scenarioSelector');
    openModal('animationControls');
  }, [handleScenarioSelect, closeModal, openModal]);

  // Handle template selection with modal management
  const onTemplateSelect = useCallback((template: Parameters<typeof handleTemplateSelect>[0]) => {
    handleTemplateSelect(template);
    closeModal('templateGallery');
    closeModal('animationControls');
  }, [handleTemplateSelect, closeModal]);

  // Fallback handlers: accept fallback spec or dismiss and retry
  const handleAcceptFallback = useCallback((spec: InfraSpec) => {
    loadFromSpec(spec);
  }, [loadFromSpec]);

  const handleDismissFallback = useCallback(() => {
    setLastResult(null);
  }, [setLastResult]);

  // Focus prompt input via ref
  const focusPromptInput = useCallback(() => {
    promptTextareaRef.current?.focus();
  }, []);

  // Context menu handlers
  const handleCanvasContextMenu = useCallback(
    (screenPos: { x: number; y: number }, canvasPos: XYPosition) => {
      openCanvasMenu(screenPos, canvasPos);
    },
    [openCanvasMenu]
  );

  const handleNodeContextMenu = useCallback(
    (screenPos: { x: number; y: number }, nodeId: string) => {
      openNodeMenu(screenPos, nodeId);
    },
    [openNodeMenu]
  );

  const handleEdgeContextMenu = useCallback(
    (screenPos: { x: number; y: number }, edgeId: string) => {
      openEdgeMenu(screenPos, edgeId);
    },
    [openEdgeMenu]
  );

  // Node action handlers for context menu
  const handleEditNode = useCallback((_nodeId: string) => {
    // Inline editing is triggered via double-click on the node.
  }, []);

  const handleViewNodeDetails = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node && isInfraNodeData(node.data)) {
      setSelectedNodeDetail({
        id: node.id,
        name: node.data.label || nodeId,
        nodeType: node.data.nodeType || 'unknown',
        tier: node.data.tier || 'unknown',
        zone: node.data.zone,
        description: node.data.description,
      });
    }
  }, [nodes, setSelectedNodeDetail]);

  // Edge action handlers
  const handleInsertNodeOnEdge = useCallback((edgeId: string) => {
    setInsertEdgeId(edgeId);
    setInsertPosition(menuState.position);
    closeMenu();
  }, [menuState.position, closeMenu]);

  const handleComponentSelectForInsert = useCallback(
    (nodeType: InfraNodeType, componentData: ComponentData) => {
      if (insertEdgeId) {
        insertNodeBetween(insertEdgeId, nodeType, componentData);
        setInsertEdgeId(null);
        setInsertPosition(null);
      }
    },
    [insertEdgeId, insertNodeBetween]
  );

  // Add node handler for canvas context menu
  const handleAddNode = useCallback(
    (nodeType: InfraNodeType, canvasPos: XYPosition, componentData?: ComponentData) => {
      addNode(nodeType, canvasPos, componentData);
    },
    [addNode]
  );

  // Receive node position changes from FlowCanvas (e.g. drag)
  const handleNodesChangeFromCanvas = useCallback((updatedNodes: Node[]) => {
    setNodes(updatedNodes);
  }, [setNodes]);

  // Receive edge changes from FlowCanvas (e.g. new connection)
  const handleEdgesChangeFromCanvas = useCallback((updatedEdges: Edge[]) => {
    setEdges(updatedEdges);
  }, [setEdges]);

  // Enter comparison mode handler
  const handleEnterComparisonMode = useCallback(() => {
    comparison.enterComparisonMode(currentSpec, nodes, edges);
  }, [comparison, currentSpec, nodes, edges]);

  // Pre-compute context menu data to avoid IIFE in JSX
  const nodeMenuName = (() => {
    if (menuState.type === 'node' && menuState.targetId) {
      const node = nodes.find((n) => n.id === menuState.targetId);
      if (node && isInfraNodeData(node.data)) {
        return node.data.label || '';
      }
    }
    return '';
  })();

  const edgeMenuData = (() => {
    if (menuState.type === 'edge' && menuState.targetId) {
      const edge = edges.find((e) => e.id === menuState.targetId);
      const sourceNode = edge ? nodes.find((n) => n.id === edge.source) : undefined;
      const targetNode = edge ? nodes.find((n) => n.id === edge.target) : undefined;
      const sourceLabel = sourceNode && isInfraNodeData(sourceNode.data) ? sourceNode.data.label : '';
      const targetLabel = targetNode && isInfraNodeData(targetNode.data) ? targetNode.data.label : '';
      return { sourceNodeName: sourceLabel || '', targetNodeName: targetLabel || '' };
    }
    return null;
  })();

  const hasNodes = nodes.length > 0;
  const sidebarOpen = sidebar.isOpen;

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-[#0a0a0b]">
      {/* Sidebar Toggle (when sidebar closed) */}
      {!sidebarOpen && (
        <SidebarToggle onClick={sidebar.open} />
      )}

      {/* History Sidebar — localStorage when unauthenticated, DB when authenticated */}
      <AnimatePresence>
        {sidebarOpen && (
          <HistorySidebar
            entries={historyEntries}
            activeId={historyActiveId}
            loading={historyLoading}
            onClose={sidebar.close}
            onSelect={handleDiagramSelect}
            onDelete={handleDiagramDelete}
            onNewDiagram={handleNewDiagram}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <Header
        sidebarOpen={sidebarOpen}
        hasNodes={hasNodes}
        lastResult={lastResult}
        onAnimateClick={() => toggleModal('scenarioSelector')}
        onTemplatesClick={() => openModal('templateGallery')}
        onExportClick={() => openModal('exportPanel')}
        onCompareClick={handleEnterComparisonMode}
        onHealthCheckClick={() => toggleModal('healthCheck')}
        onInsightsClick={() => toggleModal('insights')}
        onVulnerabilityClick={() => toggleModal('vulnerability')}
        onCloudCatalogClick={() => toggleModal('cloudCatalog')}
        onComplianceClick={() => toggleModal('compliance')}
        onBenchmarkClick={() => toggleModal('benchmark')}
        // Undo/Redo
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo()}
        canRedo={canRedo()}
        // Save/title — always show title (effectiveTitle), use DB save status when authenticated
        isSaving={diagramId ? persistence.isSaving : (isAuthenticated ? dbHistory.isSaving : undefined)}
        lastSavedAt={diagramId ? persistence.lastSavedAt : (isAuthenticated ? dbHistory.lastSavedAt : undefined)}
        title={effectiveTitle}
        onTitleChange={handleTitleChange}
      />

      {/* Flow Canvas */}
      <div ref={canvasRef} className="w-full h-full">
        <FlowCanvas
          initialNodes={nodes}
          initialEdges={edges}
          onNodesChange={handleNodesChangeFromCanvas}
          onEdgesChange={handleEdgesChangeFromCanvas}
          onNodeClick={handleNodeClick}
          onNodeDataUpdate={updateNodeData}
          onCanvasContextMenu={handleCanvasContextMenu}
          onNodeContextMenu={handleNodeContextMenu}
          onEdgeContextMenu={handleEdgeContextMenu}
        />
      </div>

      {/* Empty State */}
      {!hasNodes && !isLoading && (
        <EmptyState
          onTemplatesClick={() => openModal('templateGallery')}
          onPromptFocus={focusPromptInput}
        />
      )}

      {/* All Panels (Scenario, Animation, Policy, NodeDetail, Health, etc.) */}
      <EditorPanels
        showScenarioSelector={showScenarioSelector}
        showAnimationControls={showAnimationControls}
        showHealthCheck={showHealthCheck}
        showInsights={showInsights}
        showVulnerability={showVulnerability}
        showCloudCatalog={showCloudCatalog}
        showCompliance={showCompliance}
        showBenchmark={showBenchmark}
        showTemplateGallery={showTemplateGallery}
        showExportPanel={showExportPanel}
        showSaveDialog={showSaveDialog}
        currentSpec={currentSpec}
        currentScenario={currentScenario}
        animationSequence={animationSequence}
        selectedNodeDetail={selectedNodeDetail}
        selectedNodePolicy={selectedNodePolicy}
        canvasRef={canvasRef as React.RefObject<HTMLElement>}
        feedback={feedback}
        onScenarioSelect={onScenarioSelect}
        onTemplateSelect={onTemplateSelect}
        closeModal={closeModal}
        openModal={openModal}
        setSelectedNodeDetail={setSelectedNodeDetail}
        setSelectedNodePolicy={setSelectedNodePolicy}
      />

      {/* Prompt Panel */}
      <PromptPanel
        onSubmit={wrappedPromptSubmit}
        onModify={handleLLMModify}
        isLoading={isLoading}
        hasExistingDiagram={hasNodes}
        lastReasoning={lastResult?.reasoning}
        lastOperations={lastResult?.operations}
        llmAvailable={llmAvailable}
        textareaRef={promptTextareaRef}
        sidebarOpen={sidebarOpen}
        lastResult={lastResult}
        onAcceptFallback={handleAcceptFallback}
        onDismissFallback={handleDismissFallback}
      />

      {/* Comparison View */}
      <ComparisonView
        isActive={comparison.isActive}
        mode={comparison.mode}
        leftPanel={comparison.leftPanel}
        rightPanel={comparison.rightPanel}
        showDiff={comparison.showDiff}
        syncViewport={comparison.syncViewport}
        diff={comparison.diff}
        onExit={comparison.exitComparisonMode}
        onModeChange={comparison.setMode}
        onSwapPanels={comparison.swapPanels}
        onCopyToRight={comparison.copyToRight}
        onCopyToLeft={comparison.copyToLeft}
        onToggleDiff={comparison.toggleDiff}
        onToggleSyncViewport={comparison.toggleSyncViewport}
        onLeftPanelUpdate={comparison.updateLeftPanel}
        onRightPanelUpdate={comparison.updateRightPanel}
        onNodeClick={handleNodeClick}
      />

      {/* Context Menus */}
      {menuState.type === 'canvas' && menuState.canvasPosition && (
        <CanvasContextMenu
          isOpen={menuState.isOpen}
          position={menuState.position}
          canvasPosition={menuState.canvasPosition}
          onClose={closeMenu}
          onAddNode={handleAddNode}
        />
      )}

      {menuState.type === 'node' && menuState.targetId && (
        <NodeContextMenu
          isOpen={menuState.isOpen}
          position={menuState.position}
          nodeId={menuState.targetId}
          nodeName={nodeMenuName}
          onClose={closeMenu}
          onEdit={handleEditNode}
          onDuplicate={duplicateNode}
          onDelete={deleteNode}
          onViewDetails={handleViewNodeDetails}
        />
      )}

      {menuState.type === 'edge' && menuState.targetId && edgeMenuData && (
        <EdgeContextMenu
          isOpen={menuState.isOpen}
          position={menuState.position}
          edgeId={menuState.targetId}
          sourceNodeName={edgeMenuData.sourceNodeName}
          targetNodeName={edgeMenuData.targetNodeName}
          onClose={closeMenu}
          onInsertNode={handleInsertNodeOnEdge}
          onDelete={deleteEdge}
          onReverse={reverseEdge}
        />
      )}

      {/* Component Picker for inserting node on edge */}
      {insertEdgeId && insertPosition && (
        <ComponentPicker
          isOpen={true}
          position={insertPosition}
          onSelect={handleComponentSelectForInsert}
          onClose={() => {
            setInsertEdgeId(null);
            setInsertPosition(null);
          }}
        />
      )}
    </div>
  );
}
