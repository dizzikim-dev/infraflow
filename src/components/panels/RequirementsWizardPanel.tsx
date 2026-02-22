'use client';

/**
 * RequirementsWizardPanel — Multi-step wizard for consulting requirements intake.
 *
 * Collects organization, scale, availability, security, budget, and preferences
 * through a 7-step guided flow, then shows a review summary before submission.
 * Follows the same PanelContainer/PanelHeader pattern as other InfraFlow panels.
 *
 * Each wizard step is extracted into its own component under
 * `./requirements-wizard/`. This file serves as the orchestrator.
 */

import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ClipboardList,
  Building2,
  BarChart3,
  Shield,
  Clock,
  Wallet,
  Settings2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { PanelContainer } from './PanelContainer';
import { PanelHeader } from './PanelHeader';
import {
  WIZARD_STEPS,
  WIZARD_STEP_LABELS,
  type WizardStep,
  type ConsultingRequirements,
} from '@/lib/consulting/types';
import type { ValidationErrors } from './requirements-wizard/types';
import { OrgStep } from './requirements-wizard/OrgStep';
import { ScaleStep } from './requirements-wizard/ScaleStep';
import { AvailabilityStep } from './requirements-wizard/AvailabilityStep';
import { SecurityStep } from './requirements-wizard/SecurityStep';
import { BudgetStep } from './requirements-wizard/BudgetStep';
import { PreferencesStep } from './requirements-wizard/PreferencesStep';
import { ReviewStep } from './requirements-wizard/ReviewStep';

// ============================================================
// Types
// ============================================================

interface RequirementsWizardPanelProps {
  show: boolean;
  onClose: () => void;
  onComplete: (requirements: ConsultingRequirements) => void;
  initialRequirements?: Partial<ConsultingRequirements>;
}

// ============================================================
// Constants
// ============================================================

/** Icon per wizard step */
const STEP_ICONS: Record<WizardStep, React.ComponentType<{ className?: string }>> = {
  organization: Building2,
  scale: BarChart3,
  availability: Clock,
  security: Shield,
  budget: Wallet,
  preferences: Settings2,
  review: CheckCircle2,
};

// ============================================================
// Default form state
// ============================================================

function buildDefaultForm(
  initial?: Partial<ConsultingRequirements>,
): ConsultingRequirements {
  return {
    organizationName: initial?.organizationName ?? '',
    organizationSize: initial?.organizationSize ?? 'medium',
    industry: initial?.industry ?? 'general',
    userCount: initial?.userCount ?? 0,
    concurrentUsers: initial?.concurrentUsers ?? 0,
    dataVolume: initial?.dataVolume ?? 'medium',
    trafficPattern: initial?.trafficPattern ?? 'steady',
    availabilityTarget: initial?.availabilityTarget ?? 99.9,
    maxLatencyMs: initial?.maxLatencyMs,
    rpoMinutes: initial?.rpoMinutes,
    rtoMinutes: initial?.rtoMinutes,
    securityLevel: initial?.securityLevel ?? 'standard',
    complianceFrameworks: initial?.complianceFrameworks ?? [],
    budgetRange: initial?.budgetRange ?? 'medium',
    monthlyBudgetUsd: initial?.monthlyBudgetUsd,
    cloudPreference: initial?.cloudPreference ?? 'hybrid',
    preferredVendors: initial?.preferredVendors ?? [],
    existingInfrastructure: initial?.existingInfrastructure ?? [],
    notes: initial?.notes,
  };
}

// ============================================================
// Validation
// ============================================================

function validateStep(step: WizardStep, form: ConsultingRequirements): ValidationErrors {
  const errors: ValidationErrors = {};

  switch (step) {
    case 'organization':
      if (!form.organizationSize) errors.organizationSize = 'Organization size is required (조직 규모 필수)';
      if (!form.industry) errors.industry = 'Industry is required (업종 필수)';
      break;
    case 'scale':
      if (!form.userCount || form.userCount <= 0) errors.userCount = 'User count must be > 0 (사용자 수 > 0 필수)';
      if (!form.concurrentUsers || form.concurrentUsers <= 0) errors.concurrentUsers = 'Concurrent users must be > 0 (동시 접속자 수 > 0 필수)';
      if (form.concurrentUsers > form.userCount) errors.concurrentUsers = 'Cannot exceed total users (전체 사용자 수 초과 불가)';
      break;
    case 'availability':
      if (!form.availabilityTarget) errors.availabilityTarget = 'Availability target is required (가용성 목표 필수)';
      break;
    case 'security':
      if (!form.securityLevel) errors.securityLevel = 'Security level is required (보안 등급 필수)';
      break;
    case 'budget':
      if (!form.budgetRange) errors.budgetRange = 'Budget range is required (예산 범위 필수)';
      break;
    case 'preferences':
      if (!form.cloudPreference) errors.cloudPreference = 'Cloud preference is required (클라우드 선호 필수)';
      break;
    case 'review':
      // No validation on review — all prior steps already validated
      break;
  }

  return errors;
}

// ============================================================
// Main Component
// ============================================================

export function RequirementsWizardPanel({
  show,
  onClose,
  onComplete,
  initialRequirements,
}: RequirementsWizardPanelProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [form, setForm] = useState<ConsultingRequirements>(() =>
    buildDefaultForm(initialRequirements),
  );
  const [errors, setErrors] = useState<ValidationErrors>({});

  const currentStep = WIZARD_STEPS[currentStepIndex];

  const updateForm = useCallback((patch: Partial<ConsultingRequirements>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    // Clear errors for fields being edited
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch)) {
        delete next[key];
      }
      return next;
    });
  }, []);

  const goToStep = useCallback((step: WizardStep) => {
    const idx = WIZARD_STEPS.indexOf(step);
    if (idx >= 0) setCurrentStepIndex(idx);
  }, []);

  const canGoBack = currentStepIndex > 0;
  const canGoForward = currentStepIndex < WIZARD_STEPS.length - 1;
  const isReview = currentStep === 'review';

  const handleNext = useCallback(() => {
    const stepErrors = validateStep(currentStep, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    if (canGoForward) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [currentStep, form, canGoForward]);

  const handleBack = useCallback(() => {
    if (canGoBack) {
      setErrors({});
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [canGoBack]);

  const handleSubmit = useCallback(() => {
    onComplete(form);
  }, [form, onComplete]);

  /** Which step content to render */
  const stepContent = useMemo(() => {
    switch (currentStep) {
      case 'organization':
        return <OrgStep form={form} errors={errors} onChange={updateForm} />;
      case 'scale':
        return <ScaleStep form={form} errors={errors} onChange={updateForm} />;
      case 'availability':
        return <AvailabilityStep form={form} errors={errors} onChange={updateForm} />;
      case 'security':
        return <SecurityStep form={form} errors={errors} onChange={updateForm} />;
      case 'budget':
        return <BudgetStep form={form} errors={errors} onChange={updateForm} />;
      case 'preferences':
        return <PreferencesStep form={form} errors={errors} onChange={updateForm} />;
      case 'review':
        return <ReviewStep form={form} goToStep={goToStep} />;
      default:
        return null;
    }
  }, [currentStep, form, errors, updateForm, goToStep]);

  if (!show) return null;

  return (
    <PanelContainer widthClass="w-[600px]">
      <PanelHeader
        icon={ClipboardList}
        iconColor="text-green-400"
        title="Requirements Intake (요구사항 수집)"
        onClose={onClose}
      />

      {/* Step Indicator */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          {WIZARD_STEPS.map((step, idx) => {
            const StepIcon = STEP_ICONS[step];
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;
            return (
              <div key={step} className="flex items-center">
                {/* Step circle */}
                <button
                  onClick={() => {
                    // Allow jumping to completed steps or the current step
                    if (idx <= currentStepIndex) {
                      setCurrentStepIndex(idx);
                    }
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-green-500 text-white'
                      : isCompleted
                        ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                        : 'bg-zinc-800 text-zinc-500 border border-white/10'
                  }`}
                  aria-label={`${WIZARD_STEP_LABELS[step].en} (${WIZARD_STEP_LABELS[step].ko})`}
                  title={`${WIZARD_STEP_LABELS[step].en} (${WIZARD_STEP_LABELS[step].ko})`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <StepIcon className="w-4 h-4" />
                  )}
                </button>
                {/* Connecting line */}
                {idx < WIZARD_STEPS.length - 1 && (
                  <div
                    className={`w-4 sm:w-6 h-0.5 mx-0.5 ${
                      idx < currentStepIndex ? 'bg-green-500/40' : 'bg-zinc-700'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
        {/* Current step label */}
        <div className="mt-2 text-center">
          <span className="text-sm font-medium text-white">
            {WIZARD_STEP_LABELS[currentStep].en}
          </span>
          <span className="text-sm text-zinc-500 ml-1.5">
            ({WIZARD_STEP_LABELS[currentStep].ko})
          </span>
          <span className="text-xs text-zinc-600 ml-2">
            {currentStepIndex + 1}/{WIZARD_STEPS.length}
          </span>
        </div>
      </div>

      {/* Step Content — animated transitions */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {stepContent}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="border-t border-white/10 px-4 py-3 flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={!canGoBack}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            canGoBack
              ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              : 'bg-zinc-800/30 text-zinc-600 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Back (이전)
        </button>

        {isReview ? (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-6 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-500 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Submit (제출)
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-500 transition-colors"
          >
            Next (다음)
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </PanelContainer>
  );
}
