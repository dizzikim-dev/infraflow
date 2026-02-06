'use client';

import { useState, useCallback } from 'react';

export type ModalType =
  | 'templateGallery'
  | 'exportPanel'
  | 'saveDialog'
  | 'scenarioSelector'
  | 'animationControls';

interface ModalState {
  templateGallery: boolean;
  exportPanel: boolean;
  saveDialog: boolean;
  scenarioSelector: boolean;
  animationControls: boolean;
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
  };
}
