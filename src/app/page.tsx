'use client';

import { useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
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
import { useInfraState, useModalManager } from '@/hooks';
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
  } = useInfraState();

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
      />

      {/* Flow Canvas */}
      <div ref={canvasRef} className="w-full h-full">
        <FlowCanvas
          initialNodes={nodes}
          initialEdges={edges}
          onNodeClick={handleNodeClick}
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
    </div>
  );
}
