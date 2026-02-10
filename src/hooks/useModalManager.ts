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
  | 'benchmark';

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
  });

  /**
   * Open a specific modal
   */
  const openModal = useCallback((modal: ModalType) => {
    setModals(prev => ({ ...prev, [modal]: true }));
  }, []);

  /**
   * Close a specific modal
   */
  const closeModal = useCallback((modal: ModalType) => {
    setModals(prev => ({ ...prev, [modal]: false }));
  }, []);

  /**
   * Toggle a specific modal
   */
  const toggleModal = useCallback((modal: ModalType) => {
    setModals(prev => ({ ...prev, [modal]: !prev[modal] }));
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
  };
}
