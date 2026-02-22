/**
 * Shared types and constants for the Requirements Wizard sub-components.
 */

import type {
  ConsultingRequirements,
  WizardStep,
  OrganizationSize,
  IndustryType,
  DataVolume,
  TrafficPattern,
  AvailabilityTarget,
  ConsultingSecurityLevel,
  BudgetRange,
  CloudPreference,
} from '@/lib/consulting/types';
import type { NodeCategory } from '@/types/infra';

// ============================================================
// Types
// ============================================================

/** Validation errors keyed by field name */
export type ValidationErrors = Record<string, string>;

/** Common props for step components that edit form data */
export interface StepFormProps {
  form: ConsultingRequirements;
  errors: ValidationErrors;
  onChange: (patch: Partial<ConsultingRequirements>) => void;
}

/** Props for the review step */
export interface ReviewStepProps {
  form: ConsultingRequirements;
  goToStep: (step: WizardStep) => void;
}

// ============================================================
// Constants — Select Options (bilingual)
// ============================================================

export const ORG_SIZE_OPTIONS: { value: OrganizationSize; en: string; ko: string }[] = [
  { value: 'small', en: 'Small (1-50)', ko: '소규모 (1-50명)' },
  { value: 'medium', en: 'Medium (51-500)', ko: '중규모 (51-500명)' },
  { value: 'large', en: 'Large (501-5000)', ko: '대규모 (501-5000명)' },
  { value: 'enterprise', en: 'Enterprise (5000+)', ko: '엔터프라이즈 (5000+명)' },
];

export const INDUSTRY_OPTIONS: { value: IndustryType; en: string; ko: string }[] = [
  { value: 'financial', en: 'Financial', ko: '금융' },
  { value: 'healthcare', en: 'Healthcare', ko: '의료' },
  { value: 'government', en: 'Government', ko: '공공' },
  { value: 'ecommerce', en: 'E-commerce', ko: '전자상거래' },
  { value: 'education', en: 'Education', ko: '교육' },
  { value: 'manufacturing', en: 'Manufacturing', ko: '제조' },
  { value: 'general', en: 'General', ko: '일반' },
];

export const DATA_VOLUME_OPTIONS: { value: DataVolume; en: string; ko: string }[] = [
  { value: 'low', en: 'Low (< 100GB)', ko: '소량 (< 100GB)' },
  { value: 'medium', en: 'Medium (100GB-1TB)', ko: '중간 (100GB-1TB)' },
  { value: 'high', en: 'High (1TB-10TB)', ko: '대량 (1TB-10TB)' },
  { value: 'massive', en: 'Massive (10TB+)', ko: '초대량 (10TB+)' },
];

export const TRAFFIC_PATTERN_OPTIONS: { value: TrafficPattern; en: string; ko: string }[] = [
  { value: 'steady', en: 'Steady', ko: '안정적' },
  { value: 'bursty', en: 'Bursty', ko: '폭주형' },
  { value: 'seasonal', en: 'Seasonal', ko: '계절적' },
  { value: 'unpredictable', en: 'Unpredictable', ko: '예측 불가' },
];

export const AVAILABILITY_OPTIONS: { value: AvailabilityTarget; en: string; ko: string }[] = [
  { value: 99, en: '99% (~87.6h/yr downtime)', ko: '99% (~87.6시간/년 다운)' },
  { value: 99.9, en: '99.9% (~8.76h/yr)', ko: '99.9% (~8.76시간/년)' },
  { value: 99.95, en: '99.95% (~4.38h/yr)', ko: '99.95% (~4.38시간/년)' },
  { value: 99.99, en: '99.99% (~52.6min/yr)', ko: '99.99% (~52.6분/년)' },
  { value: 99.999, en: '99.999% (~5.26min/yr)', ko: '99.999% (~5.26분/년)' },
];

export const SECURITY_LEVEL_OPTIONS: { value: ConsultingSecurityLevel; en: string; ko: string }[] = [
  { value: 'basic', en: 'Basic', ko: '기본' },
  { value: 'standard', en: 'Standard', ko: '표준' },
  { value: 'high', en: 'High', ko: '높음' },
  { value: 'critical', en: 'Critical', ko: '최고' },
];

export const COMPLIANCE_FRAMEWORKS: { value: string; label: string }[] = [
  { value: 'PCI-DSS', label: 'PCI-DSS' },
  { value: 'HIPAA', label: 'HIPAA' },
  { value: 'ISO 27001', label: 'ISO 27001' },
  { value: 'SOC 2', label: 'SOC 2' },
  { value: 'GDPR', label: 'GDPR' },
  { value: 'NIST 800-53', label: 'NIST 800-53' },
];

export const BUDGET_RANGE_OPTIONS: { value: BudgetRange; en: string; ko: string }[] = [
  { value: 'low', en: 'Low (< $5,000/mo)', ko: '저예산 (< $5,000/월)' },
  { value: 'medium', en: 'Medium ($5K-$20K/mo)', ko: '중간 ($5K-$20K/월)' },
  { value: 'high', en: 'High ($20K-$100K/mo)', ko: '고예산 ($20K-$100K/월)' },
  { value: 'enterprise', en: 'Enterprise ($100K+/mo)', ko: '엔터프라이즈 ($100K+/월)' },
];

export const CLOUD_PREFERENCE_OPTIONS: { value: CloudPreference; en: string; ko: string }[] = [
  { value: 'on-premise', en: 'On-premise', ko: '온프레미스' },
  { value: 'hybrid', en: 'Hybrid', ko: '하이브리드' },
  { value: 'cloud-native', en: 'Cloud Native', ko: '클라우드 네이티브' },
  { value: 'multi-cloud', en: 'Multi-cloud', ko: '멀티 클라우드' },
];

export const VENDOR_OPTIONS: { value: string; en: string; ko: string }[] = [
  { value: 'cisco', en: 'Cisco', ko: 'Cisco' },
  { value: 'fortinet', en: 'Fortinet', ko: 'Fortinet' },
  { value: 'paloalto', en: 'Palo Alto Networks', ko: 'Palo Alto Networks' },
  { value: 'arista', en: 'Arista', ko: 'Arista' },
];

export const INFRA_CATEGORY_OPTIONS: { value: NodeCategory; en: string; ko: string }[] = [
  { value: 'security', en: 'Security', ko: '보안' },
  { value: 'network', en: 'Network', ko: '네트워크' },
  { value: 'compute', en: 'Compute', ko: '컴퓨팅' },
  { value: 'cloud', en: 'Cloud', ko: '클라우드' },
  { value: 'storage', en: 'Storage', ko: '스토리지' },
  { value: 'auth', en: 'Auth', ko: '인증' },
  { value: 'telecom', en: 'Telecom', ko: '통신' },
  { value: 'wan', en: 'WAN', ko: 'WAN' },
];

// ============================================================
// Shared sub-components
// ============================================================

export function FieldLabel({ en, ko }: { en: string; ko: string }) {
  return (
    <label className="block text-sm font-medium text-zinc-300 mb-1.5">
      {en} <span className="text-zinc-500">({ko})</span>
    </label>
  );
}

export function ErrorMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-400 mt-1">{message}</p>;
}

// ============================================================
// Utility functions
// ============================================================

export function findLabel<T extends string>(
  options: { value: T; en: string; ko: string }[],
  value: T,
): string {
  const match = options.find((o) => o.value === value);
  return match ? `${match.en} (${match.ko})` : String(value);
}
