'use client';

import { useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { XYPosition } from '@xyflow/react';
import { FlowCanvas } from '@/components/shared';
import { Header, EmptyState } from '@/components/layout';
import {
  PromptPanel,
  AnimationControlPanel,
  PolicyOverlay,
  ScenarioSelector,
  TemplateGallery,
  ExportPanel,
  SaveTemplateDialog,
  NodeDetailPanel,
} from '@/components/panels';
import {
  CanvasContextMenu,
  NodeContextMenu,
  EdgeContextMenu,
  ComponentPicker,
} from '@/components/contextMenu';
import { ComparisonView } from '@/components/comparison';
import { useInfraState, useModalManager, useContextMenu, useComparisonMode, type ComponentData } from '@/hooks';
import { InfraNodeType } from '@/types';

export default function Home() {
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
    updateNodeData,
    // CRUD operations
    addNode,
    deleteNode,
    duplicateNode,
    insertNodeBetween,
    deleteEdge,
    reverseEdge,
  } = useInfraState();

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
    openModal,
    closeModal,
    toggleModal,
  } = useModalManager();

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

  // Focus prompt input
  const focusPromptInput = useCallback(() => {
    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (input) input.focus();
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
  const handleEditNode = useCallback((nodeId: string) => {
    // Trigger inline editing - find the node and set edit mode
    // This is handled by double-click, but we can focus the node
    const nodeElement = document.querySelector(`[data-id="${nodeId}"]`);
    if (nodeElement) {
      (nodeElement as HTMLElement).focus();
    }
  }, []);

  const handleViewNodeDetails = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node && node.data) {
      const data = node.data as Record<string, unknown>;
      setSelectedNodeDetail({
        id: node.id,
        name: String(data.label || nodeId),
        nodeType: String(data.nodeType || 'unknown'),
        tier: String(data.tier || 'unknown'),
        zone: data.zone as string | undefined,
        description: data.description as string | undefined,
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

  // Enter comparison mode handler
  const handleEnterComparisonMode = useCallback(() => {
    comparison.enterComparisonMode(currentSpec, nodes, edges);
  }, [comparison, currentSpec, nodes, edges]);

  const hasNodes = nodes.length > 0;

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-[#0a0a0b]">
      {/* Header */}
      <Header
        hasNodes={hasNodes}
        lastResult={lastResult}
        onAnimateClick={() => toggleModal('scenarioSelector')}
        onTemplatesClick={() => openModal('templateGallery')}
        onExportClick={() => openModal('exportPanel')}
        onCompareClick={handleEnterComparisonMode}
      />

      {/* Flow Canvas */}
      <div ref={canvasRef} className="w-full h-full">
        <FlowCanvas
          initialNodes={nodes}
          initialEdges={edges}
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

      {/* Scenario Selector */}
      <AnimatePresence>
        {showScenarioSelector && (
          <ScenarioSelector
            onSelect={onScenarioSelect}
            onClose={() => closeModal('scenarioSelector')}
            currentScenario={currentScenario || undefined}
          />
        )}
      </AnimatePresence>

      {/* Animation Controls */}
      <AnimatePresence>
        {showAnimationControls && animationSequence && (
          <AnimationControlPanel
            sequence={animationSequence}
            onClose={() => closeModal('animationControls')}
          />
        )}
      </AnimatePresence>

      {/* Policy Overlay */}
      <AnimatePresence>
        {selectedNodePolicy && (
          <PolicyOverlay
            nodeName={selectedNodePolicy.name}
            nodeType={selectedNodePolicy.type}
            policies={selectedNodePolicy.policies}
            position={selectedNodePolicy.position}
            onClose={() => setSelectedNodePolicy(null)}
          />
        )}
      </AnimatePresence>

      {/* Node Detail Panel */}
      <AnimatePresence>
        {selectedNodeDetail && (
          <NodeDetailPanel
            nodeId={selectedNodeDetail.id}
            nodeName={selectedNodeDetail.name}
            nodeType={selectedNodeDetail.nodeType as InfraNodeType}
            tier={selectedNodeDetail.tier}
            zone={selectedNodeDetail.zone}
            description={selectedNodeDetail.description}
            onClose={() => setSelectedNodeDetail(null)}
          />
        )}
      </AnimatePresence>

      {/* Template Gallery Modal */}
      <AnimatePresence>
        {showTemplateGallery && (
          <TemplateGallery
            onSelect={onTemplateSelect}
            onClose={() => closeModal('templateGallery')}
            onSaveCurrent={() => {
              closeModal('templateGallery');
              openModal('saveDialog');
            }}
            hasCurrentSpec={!!currentSpec}
          />
        )}
      </AnimatePresence>

      {/* Export Panel Modal */}
      <AnimatePresence>
        {showExportPanel && (
          <ExportPanel
            onClose={() => closeModal('exportPanel')}
            canvasRef={canvasRef as React.RefObject<HTMLElement>}
            currentSpec={currentSpec}
          />
        )}
      </AnimatePresence>

      {/* Save Template Dialog */}
      <AnimatePresence>
        {showSaveDialog && currentSpec && (
          <SaveTemplateDialog
            spec={currentSpec}
            onClose={() => closeModal('saveDialog')}
            onSaved={() => {
              // Optionally refresh or show success message
            }}
          />
        )}
      </AnimatePresence>

      {/* Prompt Panel */}
      <PromptPanel onSubmit={handlePromptSubmit} isLoading={isLoading} />

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
          nodeName={String((nodes.find((n) => n.id === menuState.targetId)?.data as Record<string, unknown>)?.label || '')}
          onClose={closeMenu}
          onEdit={handleEditNode}
          onDuplicate={duplicateNode}
          onDelete={deleteNode}
          onViewDetails={handleViewNodeDetails}
        />
      )}

      {menuState.type === 'edge' && menuState.targetId && (() => {
        const edge = edges.find((e) => e.id === menuState.targetId);
        const sourceNode = edge ? nodes.find((n) => n.id === edge.source) : undefined;
        const targetNode = edge ? nodes.find((n) => n.id === edge.target) : undefined;
        return (
          <EdgeContextMenu
            isOpen={menuState.isOpen}
            position={menuState.position}
            edgeId={menuState.targetId}
            sourceNodeName={String((sourceNode?.data as Record<string, unknown>)?.label || '')}
            targetNodeName={String((targetNode?.data as Record<string, unknown>)?.label || '')}
            onClose={closeMenu}
            onInsertNode={handleInsertNodeOnEdge}
            onDelete={deleteEdge}
            onReverse={reverseEdge}
          />
        );
      })()}

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
