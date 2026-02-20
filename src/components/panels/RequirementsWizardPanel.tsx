'use client';

/**
 * RequirementsWizardPanel — Multi-step wizard for consulting requirements intake.
 *
 * Collects organization, scale, availability, security, budget, and preferences
 * through a 7-step guided flow, then shows a review summary before submission.
 * Follows the same PanelContainer/PanelHeader pattern as other InfraFlow panels.
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
  Pencil,
} from 'lucide-react';
import { PanelContainer } from './PanelContainer';
import { PanelHeader } from './PanelHeader';
import {
  WIZARD_STEPS,
  WIZARD_STEP_LABELS,
  type WizardStep,
  type ConsultingRequirements,
  type OrganizationSize,
  type IndustryType,
  type DataVolume,
  type TrafficPattern,
  type AvailabilityTarget,
  type SecurityLevel,
  type BudgetRange,
  type CloudPreference,
} from '@/lib/consulting/types';
import type { NodeCategory } from '@/types/infra';

// ============================================================
// Types
// ============================================================

interface RequirementsWizardPanelProps {
  show: boolean;
  onClose: () => void;
  onComplete: (requirements: ConsultingRequirements) => void;
  initialRequirements?: Partial<ConsultingRequirements>;
}

/** Validation errors keyed by field name */
type ValidationErrors = Record<string, string>;

// ============================================================
// Constants — Select Options (bilingual)
// ============================================================

const ORG_SIZE_OPTIONS: { value: OrganizationSize; en: string; ko: string }[] = [
  { value: 'small', en: 'Small (1-50)', ko: '소규모 (1-50명)' },
  { value: 'medium', en: 'Medium (51-500)', ko: '중규모 (51-500명)' },
  { value: 'large', en: 'Large (501-5000)', ko: '대규모 (501-5000명)' },
  { value: 'enterprise', en: 'Enterprise (5000+)', ko: '엔터프라이즈 (5000+명)' },
];

const INDUSTRY_OPTIONS: { value: IndustryType; en: string; ko: string }[] = [
  { value: 'financial', en: 'Financial', ko: '금융' },
  { value: 'healthcare', en: 'Healthcare', ko: '의료' },
  { value: 'government', en: 'Government', ko: '공공' },
  { value: 'ecommerce', en: 'E-commerce', ko: '전자상거래' },
  { value: 'education', en: 'Education', ko: '교육' },
  { value: 'manufacturing', en: 'Manufacturing', ko: '제조' },
  { value: 'general', en: 'General', ko: '일반' },
];

const DATA_VOLUME_OPTIONS: { value: DataVolume; en: string; ko: string }[] = [
  { value: 'low', en: 'Low (< 100GB)', ko: '소량 (< 100GB)' },
  { value: 'medium', en: 'Medium (100GB-1TB)', ko: '중간 (100GB-1TB)' },
  { value: 'high', en: 'High (1TB-10TB)', ko: '대량 (1TB-10TB)' },
  { value: 'massive', en: 'Massive (10TB+)', ko: '초대량 (10TB+)' },
];

const TRAFFIC_PATTERN_OPTIONS: { value: TrafficPattern; en: string; ko: string }[] = [
  { value: 'steady', en: 'Steady', ko: '안정적' },
  { value: 'bursty', en: 'Bursty', ko: '폭주형' },
  { value: 'seasonal', en: 'Seasonal', ko: '계절적' },
  { value: 'unpredictable', en: 'Unpredictable', ko: '예측 불가' },
];

const AVAILABILITY_OPTIONS: { value: AvailabilityTarget; en: string; ko: string }[] = [
  { value: 99, en: '99% (~87.6h/yr downtime)', ko: '99% (~87.6시간/년 다운)' },
  { value: 99.9, en: '99.9% (~8.76h/yr)', ko: '99.9% (~8.76시간/년)' },
  { value: 99.95, en: '99.95% (~4.38h/yr)', ko: '99.95% (~4.38시간/년)' },
  { value: 99.99, en: '99.99% (~52.6min/yr)', ko: '99.99% (~52.6분/년)' },
  { value: 99.999, en: '99.999% (~5.26min/yr)', ko: '99.999% (~5.26분/년)' },
];

const SECURITY_LEVEL_OPTIONS: { value: SecurityLevel; en: string; ko: string }[] = [
  { value: 'basic', en: 'Basic', ko: '기본' },
  { value: 'standard', en: 'Standard', ko: '표준' },
  { value: 'high', en: 'High', ko: '높음' },
  { value: 'critical', en: 'Critical', ko: '최고' },
];

const COMPLIANCE_FRAMEWORKS: { value: string; label: string }[] = [
  { value: 'PCI-DSS', label: 'PCI-DSS' },
  { value: 'HIPAA', label: 'HIPAA' },
  { value: 'ISO 27001', label: 'ISO 27001' },
  { value: 'SOC 2', label: 'SOC 2' },
  { value: 'GDPR', label: 'GDPR' },
  { value: 'NIST 800-53', label: 'NIST 800-53' },
];

const BUDGET_RANGE_OPTIONS: { value: BudgetRange; en: string; ko: string }[] = [
  { value: 'low', en: 'Low (< $5,000/mo)', ko: '저예산 (< $5,000/월)' },
  { value: 'medium', en: 'Medium ($5K-$20K/mo)', ko: '중간 ($5K-$20K/월)' },
  { value: 'high', en: 'High ($20K-$100K/mo)', ko: '고예산 ($20K-$100K/월)' },
  { value: 'enterprise', en: 'Enterprise ($100K+/mo)', ko: '엔터프라이즈 ($100K+/월)' },
];

const CLOUD_PREFERENCE_OPTIONS: { value: CloudPreference; en: string; ko: string }[] = [
  { value: 'on-premise', en: 'On-premise', ko: '온프레미스' },
  { value: 'hybrid', en: 'Hybrid', ko: '하이브리드' },
  { value: 'cloud-native', en: 'Cloud Native', ko: '클라우드 네이티브' },
  { value: 'multi-cloud', en: 'Multi-cloud', ko: '멀티 클라우드' },
];

const VENDOR_OPTIONS: { value: string; en: string; ko: string }[] = [
  { value: 'cisco', en: 'Cisco', ko: 'Cisco' },
  { value: 'fortinet', en: 'Fortinet', ko: 'Fortinet' },
  { value: 'paloalto', en: 'Palo Alto Networks', ko: 'Palo Alto Networks' },
  { value: 'arista', en: 'Arista', ko: 'Arista' },
];

const INFRA_CATEGORY_OPTIONS: { value: NodeCategory; en: string; ko: string }[] = [
  { value: 'security', en: 'Security', ko: '보안' },
  { value: 'network', en: 'Network', ko: '네트워크' },
  { value: 'compute', en: 'Compute', ko: '컴퓨팅' },
  { value: 'cloud', en: 'Cloud', ko: '클라우드' },
  { value: 'storage', en: 'Storage', ko: '스토리지' },
  { value: 'auth', en: 'Auth', ko: '인증' },
  { value: 'telecom', en: 'Telecom', ko: '통신' },
  { value: 'wan', en: 'WAN', ko: 'WAN' },
];

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
// Shared sub-components
// ============================================================

function FieldLabel({ en, ko }: { en: string; ko: string }) {
  return (
    <label className="block text-sm font-medium text-zinc-300 mb-1.5">
      {en} <span className="text-zinc-500">({ko})</span>
    </label>
  );
}

function ErrorMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-400 mt-1">{message}</p>;
}

// ============================================================
// Step Components
// ============================================================

function StepOrganization({
  form,
  errors,
  onChange,
}: {
  form: ConsultingRequirements;
  errors: ValidationErrors;
  onChange: (patch: Partial<ConsultingRequirements>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel en="Organization Name" ko="조직명" />
        <input
          type="text"
          value={form.organizationName ?? ''}
          onChange={(e) => onChange({ organizationName: e.target.value })}
          placeholder="e.g. Acme Corp"
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500/50"
        />
      </div>
      <div>
        <FieldLabel en="Organization Size" ko="조직 규모" />
        <select
          value={form.organizationSize}
          onChange={(e) => onChange({ organizationSize: e.target.value as OrganizationSize })}
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-green-500/50"
        >
          {ORG_SIZE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.en} ({o.ko})
            </option>
          ))}
        </select>
        <ErrorMessage message={errors.organizationSize} />
      </div>
      <div>
        <FieldLabel en="Industry" ko="업종" />
        <select
          value={form.industry}
          onChange={(e) => onChange({ industry: e.target.value as IndustryType })}
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-green-500/50"
        >
          {INDUSTRY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.en} ({o.ko})
            </option>
          ))}
        </select>
        <ErrorMessage message={errors.industry} />
      </div>
    </div>
  );
}

function StepScale({
  form,
  errors,
  onChange,
}: {
  form: ConsultingRequirements;
  errors: ValidationErrors;
  onChange: (patch: Partial<ConsultingRequirements>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel en="Total Users" ko="전체 사용자 수" />
        <input
          type="number"
          min={1}
          value={form.userCount || ''}
          onChange={(e) => onChange({ userCount: Number(e.target.value) || 0 })}
          placeholder="e.g. 10000"
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500/50"
        />
        <ErrorMessage message={errors.userCount} />
      </div>
      <div>
        <FieldLabel en="Concurrent Users" ko="동시 접속자 수" />
        <input
          type="number"
          min={1}
          value={form.concurrentUsers || ''}
          onChange={(e) => onChange({ concurrentUsers: Number(e.target.value) || 0 })}
          placeholder="e.g. 1000"
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500/50"
        />
        <ErrorMessage message={errors.concurrentUsers} />
      </div>
      <div>
        <FieldLabel en="Data Volume" ko="데이터 규모" />
        <select
          value={form.dataVolume}
          onChange={(e) => onChange({ dataVolume: e.target.value as DataVolume })}
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-green-500/50"
        >
          {DATA_VOLUME_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.en} ({o.ko})
            </option>
          ))}
        </select>
      </div>
      <div>
        <FieldLabel en="Traffic Pattern" ko="트래픽 패턴" />
        <select
          value={form.trafficPattern}
          onChange={(e) => onChange({ trafficPattern: e.target.value as TrafficPattern })}
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-green-500/50"
        >
          {TRAFFIC_PATTERN_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.en} ({o.ko})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function StepAvailability({
  form,
  errors,
  onChange,
}: {
  form: ConsultingRequirements;
  errors: ValidationErrors;
  onChange: (patch: Partial<ConsultingRequirements>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel en="Availability Target" ko="가용성 목표" />
        <select
          value={form.availabilityTarget}
          onChange={(e) => onChange({ availabilityTarget: Number(e.target.value) as AvailabilityTarget })}
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-green-500/50"
        >
          {AVAILABILITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.en} ({o.ko})
            </option>
          ))}
        </select>
        <ErrorMessage message={errors.availabilityTarget} />
      </div>
      <div>
        <FieldLabel en="Max Latency (ms)" ko="최대 지연시간 (ms)" />
        <input
          type="number"
          min={0}
          value={form.maxLatencyMs ?? ''}
          onChange={(e) => onChange({ maxLatencyMs: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="e.g. 200 (optional)"
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500/50"
        />
      </div>
      <div>
        <FieldLabel en="RPO (minutes)" ko="RPO (분)" />
        <input
          type="number"
          min={0}
          value={form.rpoMinutes ?? ''}
          onChange={(e) => onChange({ rpoMinutes: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="Recovery Point Objective (optional)"
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500/50"
        />
      </div>
      <div>
        <FieldLabel en="RTO (minutes)" ko="RTO (분)" />
        <input
          type="number"
          min={0}
          value={form.rtoMinutes ?? ''}
          onChange={(e) => onChange({ rtoMinutes: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="Recovery Time Objective (optional)"
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500/50"
        />
      </div>
    </div>
  );
}

function StepSecurity({
  form,
  errors,
  onChange,
}: {
  form: ConsultingRequirements;
  errors: ValidationErrors;
  onChange: (patch: Partial<ConsultingRequirements>) => void;
}) {
  const toggleFramework = (fw: string) => {
    const current = form.complianceFrameworks;
    const next = current.includes(fw)
      ? current.filter((f) => f !== fw)
      : [...current, fw];
    onChange({ complianceFrameworks: next });
  };

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel en="Security Level" ko="보안 등급" />
        <select
          value={form.securityLevel}
          onChange={(e) => onChange({ securityLevel: e.target.value as SecurityLevel })}
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-green-500/50"
        >
          {SECURITY_LEVEL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.en} ({o.ko})
            </option>
          ))}
        </select>
        <ErrorMessage message={errors.securityLevel} />
      </div>
      <div>
        <FieldLabel en="Compliance Frameworks" ko="컴플라이언스 프레임워크" />
        <div className="grid grid-cols-2 gap-2 mt-1">
          {COMPLIANCE_FRAMEWORKS.map((fw) => (
            <label
              key={fw.value}
              className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                form.complianceFrameworks.includes(fw.value)
                  ? 'bg-green-500/10 border-green-500/30 text-green-300'
                  : 'bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-700/50'
              }`}
            >
              <input
                type="checkbox"
                checked={form.complianceFrameworks.includes(fw.value)}
                onChange={() => toggleFramework(fw.value)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                  form.complianceFrameworks.includes(fw.value)
                    ? 'bg-green-500 border-green-500'
                    : 'border-zinc-600'
                }`}
              >
                {form.complianceFrameworks.includes(fw.value) && (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                )}
              </div>
              {fw.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepBudget({
  form,
  errors,
  onChange,
}: {
  form: ConsultingRequirements;
  errors: ValidationErrors;
  onChange: (patch: Partial<ConsultingRequirements>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel en="Budget Range" ko="예산 범위" />
        <select
          value={form.budgetRange}
          onChange={(e) => onChange({ budgetRange: e.target.value as BudgetRange })}
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-green-500/50"
        >
          {BUDGET_RANGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.en} ({o.ko})
            </option>
          ))}
        </select>
        <ErrorMessage message={errors.budgetRange} />
      </div>
      <div>
        <FieldLabel en="Monthly Budget (USD)" ko="월 예산 (USD)" />
        <input
          type="number"
          min={0}
          value={form.monthlyBudgetUsd ?? ''}
          onChange={(e) => onChange({ monthlyBudgetUsd: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="e.g. 15000 (optional)"
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500/50"
        />
      </div>
    </div>
  );
}

function StepPreferences({
  form,
  onChange,
}: {
  form: ConsultingRequirements;
  errors: ValidationErrors;
  onChange: (patch: Partial<ConsultingRequirements>) => void;
}) {
  const toggleVendor = (v: string) => {
    const current = form.preferredVendors ?? [];
    const next = current.includes(v) ? current.filter((x) => x !== v) : [...current, v];
    onChange({ preferredVendors: next });
  };

  const toggleCategory = (cat: NodeCategory) => {
    // We store categories as strings in existingInfrastructure for simplicity
    const current = (form.existingInfrastructure ?? []) as string[];
    const next = current.includes(cat)
      ? current.filter((x) => x !== cat)
      : [...current, cat];
    onChange({ existingInfrastructure: next as ConsultingRequirements['existingInfrastructure'] });
  };

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel en="Cloud Preference" ko="클라우드 선호" />
        <select
          value={form.cloudPreference}
          onChange={(e) => onChange({ cloudPreference: e.target.value as CloudPreference })}
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-green-500/50"
        >
          {CLOUD_PREFERENCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.en} ({o.ko})
            </option>
          ))}
        </select>
      </div>
      <div>
        <FieldLabel en="Preferred Vendors" ko="선호 벤더" />
        <div className="grid grid-cols-2 gap-2 mt-1">
          {VENDOR_OPTIONS.map((v) => (
            <label
              key={v.value}
              className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                (form.preferredVendors ?? []).includes(v.value)
                  ? 'bg-green-500/10 border-green-500/30 text-green-300'
                  : 'bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-700/50'
              }`}
            >
              <input
                type="checkbox"
                checked={(form.preferredVendors ?? []).includes(v.value)}
                onChange={() => toggleVendor(v.value)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                  (form.preferredVendors ?? []).includes(v.value)
                    ? 'bg-green-500 border-green-500'
                    : 'border-zinc-600'
                }`}
              >
                {(form.preferredVendors ?? []).includes(v.value) && (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                )}
              </div>
              {v.en}
            </label>
          ))}
        </div>
      </div>
      <div>
        <FieldLabel en="Existing Infrastructure" ko="기존 인프라" />
        <div className="grid grid-cols-2 gap-2 mt-1">
          {INFRA_CATEGORY_OPTIONS.map((cat) => (
            <label
              key={cat.value}
              className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                ((form.existingInfrastructure ?? []) as string[]).includes(cat.value)
                  ? 'bg-green-500/10 border-green-500/30 text-green-300'
                  : 'bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-700/50'
              }`}
            >
              <input
                type="checkbox"
                checked={((form.existingInfrastructure ?? []) as string[]).includes(cat.value)}
                onChange={() => toggleCategory(cat.value)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                  ((form.existingInfrastructure ?? []) as string[]).includes(cat.value)
                    ? 'bg-green-500 border-green-500'
                    : 'border-zinc-600'
                }`}
              >
                {((form.existingInfrastructure ?? []) as string[]).includes(cat.value) && (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                )}
              </div>
              {cat.en} ({cat.ko})
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Review step helpers
// ============================================================

function findLabel<T extends string>(
  options: { value: T; en: string; ko: string }[],
  value: T,
): string {
  const match = options.find((o) => o.value === value);
  return match ? `${match.en} (${match.ko})` : String(value);
}

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

function StepReview({
  form,
  goToStep,
}: {
  form: ConsultingRequirements;
  goToStep: (step: WizardStep) => void;
}) {
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
        return <StepOrganization form={form} errors={errors} onChange={updateForm} />;
      case 'scale':
        return <StepScale form={form} errors={errors} onChange={updateForm} />;
      case 'availability':
        return <StepAvailability form={form} errors={errors} onChange={updateForm} />;
      case 'security':
        return <StepSecurity form={form} errors={errors} onChange={updateForm} />;
      case 'budget':
        return <StepBudget form={form} errors={errors} onChange={updateForm} />;
      case 'preferences':
        return <StepPreferences form={form} errors={errors} onChange={updateForm} />;
      case 'review':
        return <StepReview form={form} goToStep={goToStep} />;
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
