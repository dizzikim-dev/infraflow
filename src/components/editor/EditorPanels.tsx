'use client';

/**
 * EditorPanels
 *
 * InfraEditor에서 추출한 패널 렌더링 컴포넌트.
 * 14개의 AnimatePresence 패널 블록을 캡슐화.
 */

import { RefObject } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { InfraSpec, AnimationSequence, PolicyRule } from '@/types';
import type { ScenarioType } from '@/lib/animation/flowScenarios';
import type { ModalType } from '@/hooks/useModalManager';
import type { Template } from '@/lib/templates/templateManager';
import type { useFeedback } from '@/hooks/useFeedback';

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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NodeDetail {
  id: string;
  name: string;
  nodeType: string;
  tier: string;
  zone?: string;
  description?: string;
}

interface NodePolicy {
  name: string;
  type: string;
  policies: PolicyRule[];
  position: { x: number; y: number };
}

export interface EditorPanelsProps {
  // Modals
  showScenarioSelector: boolean;
  showAnimationControls: boolean;
  showHealthCheck: boolean;
  showInsights: boolean;
  showVulnerability: boolean;
  showCloudCatalog: boolean;
  showCompliance: boolean;
  showBenchmark: boolean;
  showTemplateGallery: boolean;
  showExportPanel: boolean;
  showSaveDialog: boolean;

  // Data
  currentSpec: InfraSpec | null;
  currentScenario: ScenarioType | null | undefined;
  animationSequence: AnimationSequence | null;
  selectedNodeDetail: NodeDetail | null;
  selectedNodePolicy: NodePolicy | null;
  canvasRef: RefObject<HTMLElement>;
  feedback: ReturnType<typeof useFeedback>;

  // Callbacks
  onScenarioSelect: (type: ScenarioType) => void;
  onTemplateSelect: (template: Template) => void;
  closeModal: (name: ModalType) => void;
  openModal: (name: ModalType) => void;
  setSelectedNodeDetail: (detail: NodeDetail | null) => void;
  setSelectedNodePolicy: (policy: NodePolicy | null) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EditorPanels({
  showScenarioSelector,
  showAnimationControls,
  showHealthCheck,
  showInsights,
  showVulnerability,
  showCloudCatalog,
  showCompliance,
  showBenchmark,
  showTemplateGallery,
  showExportPanel,
  showSaveDialog,
  currentSpec,
  currentScenario,
  animationSequence,
  selectedNodeDetail,
  selectedNodePolicy,
  canvasRef,
  feedback,
  onScenarioSelect,
  onTemplateSelect,
  closeModal,
  openModal,
  setSelectedNodeDetail,
  setSelectedNodePolicy,
}: EditorPanelsProps) {
  return (
    <>
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
            nodeType={selectedNodeDetail.nodeType as import('@/types').InfraNodeType}
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
            canvasRef={canvasRef as RefObject<HTMLElement>}
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
            onSaved={() => {}}
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
    </>
  );
}
