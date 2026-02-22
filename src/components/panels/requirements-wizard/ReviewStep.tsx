/**
 * ReviewStep — Review & submit step for the Requirements Wizard.
 */

import { Pencil } from 'lucide-react';
import type { WizardStep, ConsultingRequirements } from '@/lib/consulting/types';
import {
  type ReviewStepProps,
  ORG_SIZE_OPTIONS,
  INDUSTRY_OPTIONS,
  DATA_VOLUME_OPTIONS,
  TRAFFIC_PATTERN_OPTIONS,
  SECURITY_LEVEL_OPTIONS,
  BUDGET_RANGE_OPTIONS,
  CLOUD_PREFERENCE_OPTIONS,
  findLabel,
} from './types';

// ============================================================
// Review sub-components
// ============================================================

function ReviewSection({
  title,
  titleKo,
  onEdit,
  children,
}: {
  title: string;
  titleKo: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-800/50 rounded-lg p-3 border border-white/5">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-zinc-300">
          {title} <span className="text-zinc-500">({titleKo})</span>
        </h4>
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
          aria-label={`Edit ${title}`}
        >
          <Pencil className="w-3 h-3" />
          Edit
        </button>
      </div>
      <div className="space-y-1 text-xs text-zinc-400">{children}</div>
    </div>
  );
}

function ReviewField({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div className="flex justify-between">
      <span>{label}:</span>
      <span className="text-white">{value || '-'}</span>
    </div>
  );
}

// ============================================================
// Review Step
// ============================================================

export function ReviewStep({ form, goToStep }: ReviewStepProps) {
  return (
    <div className="space-y-3">
      <ReviewSection title="Organization" titleKo="조직 정보" onEdit={() => goToStep('organization')}>
        <ReviewField label="Name" value={form.organizationName || '-'} />
        <ReviewField label="Size" value={findLabel(ORG_SIZE_OPTIONS, form.organizationSize)} />
        <ReviewField label="Industry" value={findLabel(INDUSTRY_OPTIONS, form.industry)} />
      </ReviewSection>

      <ReviewSection title="Scale" titleKo="규모" onEdit={() => goToStep('scale')}>
        <ReviewField label="Total Users" value={form.userCount.toLocaleString()} />
        <ReviewField label="Concurrent" value={form.concurrentUsers.toLocaleString()} />
        <ReviewField label="Data Volume" value={findLabel(DATA_VOLUME_OPTIONS, form.dataVolume)} />
        <ReviewField label="Traffic" value={findLabel(TRAFFIC_PATTERN_OPTIONS, form.trafficPattern)} />
      </ReviewSection>

      <ReviewSection title="Availability" titleKo="가용성" onEdit={() => goToStep('availability')}>
        <ReviewField label="Target" value={`${form.availabilityTarget}%`} />
        <ReviewField label="Max Latency" value={form.maxLatencyMs ? `${form.maxLatencyMs}ms` : '-'} />
        <ReviewField label="RPO" value={form.rpoMinutes ? `${form.rpoMinutes}min` : '-'} />
        <ReviewField label="RTO" value={form.rtoMinutes ? `${form.rtoMinutes}min` : '-'} />
      </ReviewSection>

      <ReviewSection title="Security" titleKo="보안" onEdit={() => goToStep('security')}>
        <ReviewField label="Level" value={findLabel(SECURITY_LEVEL_OPTIONS, form.securityLevel)} />
        <ReviewField
          label="Compliance"
          value={form.complianceFrameworks.length > 0 ? form.complianceFrameworks.join(', ') : '-'}
        />
      </ReviewSection>

      <ReviewSection title="Budget" titleKo="예산" onEdit={() => goToStep('budget')}>
        <ReviewField label="Range" value={findLabel(BUDGET_RANGE_OPTIONS, form.budgetRange)} />
        <ReviewField
          label="Monthly"
          value={form.monthlyBudgetUsd ? `$${form.monthlyBudgetUsd.toLocaleString()}` : '-'}
        />
      </ReviewSection>

      <ReviewSection title="Preferences" titleKo="선호 사항" onEdit={() => goToStep('preferences')}>
        <ReviewField label="Cloud" value={findLabel(CLOUD_PREFERENCE_OPTIONS, form.cloudPreference)} />
        <ReviewField
          label="Vendors"
          value={(form.preferredVendors ?? []).length > 0 ? (form.preferredVendors ?? []).join(', ') : '-'}
        />
        <ReviewField
          label="Existing Infra"
          value={(form.existingInfrastructure ?? []).length > 0 ? (form.existingInfrastructure ?? []).join(', ') : '-'}
        />
      </ReviewSection>
    </div>
  );
}
