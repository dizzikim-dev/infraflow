'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { XYPosition, Node, Edge } from '@xyflow/react';
import { FlowCanvas } from '@/components/shared';
import { Header, EmptyState } from '@/components/layout';
import { PromptPanel } from '@/components/panels';
import {
  CanvasContextMenu,
  NodeContextMenu,
  EdgeContextMenu,
  ComponentPicker,
} from '@/components/contextMenu';
import { useInfraState, useModalManager, useContextMenu, useComparisonMode, type ComponentData } from '@/hooks';
import { useDiagramPersistence } from '@/hooks/useDiagramPersistence';
import { InfraNodeType, InfraSpec } from '@/types';
import { isInfraNodeData } from '@/types/guards';

// Dynamic imports for conditionally rendered heavy components
const AnimationControlPanel = dynamic(
  () => import('@/components/panels/AnimationControlPanel').then(mod => ({ default: mod.AnimationControlPanel })),
  { ssr: false }
);

const PolicyOverlay = dynamic(
  () => import('@/components/panels/PolicyOverlay').then(mod => ({ default: mod.PolicyOverlay })),
  { ssr: false }
);

const ScenarioSelector = dynamic(
  () => import('@/components/panels/ScenarioSelector').then(mod => ({ default: mod.ScenarioSelector })),
  { ssr: false }
);

const TemplateGallery = dynamic(
  () => import('@/components/panels/TemplateGallery').then(mod => ({ default: mod.TemplateGallery })),
  { ssr: false }
);

const ExportPanel = dynamic(
  () => import('@/components/panels/ExportPanel').then(mod => ({ default: mod.ExportPanel })),
  { ssr: false }
);

const SaveTemplateDialog = dynamic(
  () => import('@/components/panels/SaveTemplateDialog').then(mod => ({ default: mod.SaveTemplateDialog })),
  { ssr: false }
);

const NodeDetailPanel = dynamic(
  () => import('@/components/panels/NodeDetailPanel').then(mod => ({ default: mod.NodeDetailPanel })),
  { ssr: false }
);

const ComparisonView = dynamic(
  () => import('@/components/comparison/ComparisonView').then(mod => ({ default: mod.ComparisonView })),
  { ssr: false }
);

const HealthCheckPanel = dynamic(
  () => import('@/components/panels/HealthCheckPanel').then(mod => ({ default: mod.HealthCheckPanel })),
  { ssr: false }
);

const FeedbackRating = dynamic(
  () => import('@/components/feedback/FeedbackRating').then(mod => ({ default: mod.FeedbackRating })),
  { ssr: false }
);

const InsightsPanel = dynamic(
  () => import('@/components/panels/InsightsPanel').then(mod => ({ default: mod.InsightsPanel })),
  { ssr: false }
);

const VulnerabilityPanel = dynamic(
  () => import('@/components/panels/VulnerabilityPanel').then(mod => ({ default: mod.VulnerabilityPanel })),
  { ssr: false }
);

const CloudCatalogPanel = dynamic(
  () => import('@/components/panels/CloudCatalogPanel').then(mod => ({ default: mod.CloudCatalogPanel })),
  { ssr: false }
);

const IndustryCompliancePanel = dynamic(
  () => import('@/components/panels/IndustryCompliancePanel').then(mod => ({ default: mod.IndustryCompliancePanel })),
  { ssr: false }
);

const BenchmarkPanel = dynamic(
  () => import('@/components/panels/BenchmarkPanel').then(mod => ({ default: mod.BenchmarkPanel })),
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
    // Feedback
    feedback,
  } = useInfraState();

  // Load initial spec once on mount
  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current || !initialSpec) return;
    loadedRef.current = true;
    loadFromSpec(initialSpec, initialNodes, initialEdges);
  }, [initialSpec, initialNodes, initialEdges, loadFromSpec]);

  // Diagram persistence (auto-save)
  const persistence = useDiagramPersistence({
    diagramId,
    spec: currentSpec,
    nodes,
    edges,
  });

  // Save handler for new (unsaved) diagrams
  const [isSavingNew, setIsSavingNew] = useState(false);
  const handleSaveNew = useCallback(async () => {
    if (!currentSpec || isSavingNew) return;
    setIsSavingNew(true);
    try {
      const res = await fetch('/api/diagrams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || '새 다이어그램',
          spec: currentSpec,
          nodesJson: nodes,
          edgesJson: edges,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        onFirstSave?.(data.diagram.id);
      }
    } finally {
      setIsSavingNew(false);
    }
  }, [currentSpec, nodes, edges, title, isSavingNew, onFirstSave]);

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
        onHealthCheckClick={() => toggleModal('healthCheck')}
        onInsightsClick={() => toggleModal('insights')}
        onVulnerabilityClick={() => toggleModal('vulnerability')}
        onCloudCatalogClick={() => toggleModal('cloudCatalog')}
        onComplianceClick={() => toggleModal('compliance')}
        onBenchmarkClick={() => toggleModal('benchmark')}
        // Save/title props
        isSaving={diagramId ? persistence.isSaving : undefined}
        lastSavedAt={diagramId ? persistence.lastSavedAt : undefined}
        title={title}
        onTitleChange={onTitleChange}
        onSave={!diagramId ? handleSaveNew : undefined}
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

      {/* Health Check Panel */}
      <AnimatePresence>
        {showHealthCheck && (
          <HealthCheckPanel
            spec={currentSpec}
            onClose={() => closeModal('healthCheck')}
          />
        )}
      </AnimatePresence>

      {/* Insights Panel */}
      <AnimatePresence>
        {showInsights && (
          <InsightsPanel
            onClose={() => closeModal('insights')}
          />
        )}
      </AnimatePresence>

      {/* Vulnerability Panel */}
      <AnimatePresence>
        {showVulnerability && (
          <VulnerabilityPanel
            spec={currentSpec}
            onClose={() => closeModal('vulnerability')}
          />
        )}
      </AnimatePresence>

      {/* Cloud Catalog Panel */}
      <AnimatePresence>
        {showCloudCatalog && (
          <CloudCatalogPanel
            spec={currentSpec}
            onClose={() => closeModal('cloudCatalog')}
          />
        )}
      </AnimatePresence>

      {/* Industry Compliance Panel */}
      <AnimatePresence>
        {showCompliance && (
          <IndustryCompliancePanel
            spec={currentSpec}
            onClose={() => closeModal('compliance')}
          />
        )}
      </AnimatePresence>

      {/* Benchmark Panel */}
      <AnimatePresence>
        {showBenchmark && (
          <BenchmarkPanel
            spec={currentSpec}
            onClose={() => closeModal('benchmark')}
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

      {/* Feedback Rating */}
      {feedback.isAvailable && (
        <FeedbackRating
          show={feedback.hasPendingFeedback}
          onRate={feedback.submitRating}
          onDismiss={() => {}}
          submitted={feedback.ratingSubmitted}
        />
      )}

      {/* Prompt Panel */}
      <PromptPanel
        onSubmit={handlePromptSubmit}
        onModify={handleLLMModify}
        isLoading={isLoading}
        hasExistingDiagram={hasNodes}
        lastReasoning={lastResult?.reasoning}
        lastOperations={lastResult?.operations}
        llmAvailable={llmAvailable}
        textareaRef={promptTextareaRef}
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
