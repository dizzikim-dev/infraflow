'use client';

import { useState, useCallback } from 'react';

export type ModalType =
  | 'templateGallery'
  | 'exportPanel'
  | 'saveDialog'
  | 'scenarioSelector'
  | 'animationControls'
  | 'healthCheck'
  | 'insights'
  | 'vulnerability'
  | 'cloudCatalog'
  | 'compliance'
  | 'benchmark'
  | 'graphVisualizer'
  | 'vendorRecommendation'
  | 'vendorComparison'
  | 'requirementsWizard'
  | 'costComparison'
  | 'evidence';

interface ModalState {
  templateGallery: boolean;
  exportPanel: boolean;
  saveDialog: boolean;
  scenarioSelector: boolean;
  animationControls: boolean;
  healthCheck: boolean;
  insights: boolean;
  vulnerability: boolean;
  cloudCatalog: boolean;
  compliance: boolean;
  benchmark: boolean;
  graphVisualizer: boolean;
  vendorRecommendation: boolean;
  vendorComparison: boolean;
  requirementsWizard: boolean;
  costComparison: boolean;
  evidence: boolean;
}

/**
 * Modal state management hook
 * Centralizes all modal open/close logic
 */
export function useModalManager() {
  const [modals, setModals] = useState<ModalState>({
    templateGallery: false,
    exportPanel: false,
    saveDialog: false,
    scenarioSelector: false,
    animationControls: false,
    healthCheck: false,
    insights: false,
    vulnerability: false,
    cloudCatalog: false,
    compliance: false,
    benchmark: false,
    graphVisualizer: false,
    vendorRecommendation: false,
    vendorComparison: false,
    requirementsWizard: false,
    costComparison: false,
    evidence: false,
  });

  /**
   * Analyze group — only one can be open at a time
   */
  const ANALYZE_GROUP: readonly ModalType[] = [
    'healthCheck', 'insights', 'vulnerability', 'cloudCatalog', 'compliance', 'benchmark', 'graphVisualizer', 'vendorRecommendation', 'vendorComparison', 'requirementsWizard', 'costComparison', 'evidence',
  ];

  /**
   * Open a specific modal.
   * For analyze-group panels, closes any other open analyze panel first.
   */
  const openModal = useCallback((modal: ModalType) => {
    setModals(prev => {
      const next = { ...prev, [modal]: true };
      if (ANALYZE_GROUP.includes(modal)) {
        for (const m of ANALYZE_GROUP) {
          if (m !== modal) next[m] = false;
        }
      }
      return next;
    });
  }, []);

  /**
   * Close a specific modal
   */
  const closeModal = useCallback((modal: ModalType) => {
    setModals(prev => ({ ...prev, [modal]: false }));
  }, []);

  /**
   * Toggle a specific modal.
   * For analyze-group panels, closes any other open analyze panel first.
   */
  const toggleModal = useCallback((modal: ModalType) => {
    setModals(prev => {
      const opening = !prev[modal];
      const next = { ...prev, [modal]: opening };
      if (opening && ANALYZE_GROUP.includes(modal)) {
        for (const m of ANALYZE_GROUP) {
          if (m !== modal) next[m] = false;
        }
      }
      return next;
    });
  }, []);

  /**
   * Close all modals
   */
  const closeAllModals = useCallback(() => {
    setModals({
      templateGallery: false,
      exportPanel: false,
      saveDialog: false,
      scenarioSelector: false,
      animationControls: false,
      healthCheck: false,
      insights: false,
      vulnerability: false,
      cloudCatalog: false,
      compliance: false,
      benchmark: false,
      graphVisualizer: false,
      vendorRecommendation: false,
      vendorComparison: false,
      requirementsWizard: false,
      costComparison: false,
      evidence: false,
    });
  }, []);

  return {
    modals,
    openModal,
    closeModal,
    toggleModal,
    closeAllModals,

    // Convenience booleans for direct access
    showTemplateGallery: modals.templateGallery,
    showExportPanel: modals.exportPanel,
    showSaveDialog: modals.saveDialog,
    showScenarioSelector: modals.scenarioSelector,
    showAnimationControls: modals.animationControls,
    showHealthCheck: modals.healthCheck,
    showInsights: modals.insights,
    showVulnerability: modals.vulnerability,
    showCloudCatalog: modals.cloudCatalog,
    showCompliance: modals.compliance,
    showBenchmark: modals.benchmark,
    showGraphVisualizer: modals.graphVisualizer,
    showVendorRecommendation: modals.vendorRecommendation,
    showVendorComparison: modals.vendorComparison,
    showRequirementsWizard: modals.requirementsWizard,
    showCostComparison: modals.costComparison,
    showEvidence: modals.evidence,
  };
}
