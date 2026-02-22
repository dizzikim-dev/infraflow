/**
 * Unified Badge Theme Consolidation
 *
 * Centralized Tailwind class maps for badge colors and Korean labels
 * used across both admin pages (light mode) and panel components (dark mode).
 *
 * Light-mode exports: Used by admin knowledge management pages
 * Dark-mode exports: Used by dark-mode panel components
 */

// ═══════════════════════════════════════════════════════════════════════
// LIGHT MODE — Admin pages
// ═══════════════════════════════════════════════════════════════════════

// ─── Severity (antipatterns, vulnerabilities, SeverityBadge) ─────────

export const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-gray-100 text-gray-800',
};

export const SEVERITY_LABELS: Record<string, string> = {
  critical: '심각',
  high: '높음',
  medium: '중간',
  low: '낮음',
};

// ─── Scalability (patterns) ──────────────────────────────────────────

export const SCALABILITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-green-100 text-green-800',
  auto: 'bg-purple-100 text-purple-800',
};

// ─── Impact (failures) ──────────────────────────────────────────────

export const IMPACT_COLORS: Record<string, string> = {
  service_down: 'bg-red-100 text-red-800',
  degraded: 'bg-orange-100 text-orange-800',
  data_loss: 'bg-yellow-100 text-yellow-800',
  security_breach: 'bg-purple-100 text-purple-800',
};

export const IMPACT_LABELS: Record<string, string> = {
  service_down: '서비스 중단',
  degraded: '성능 저하',
  data_loss: '데이터 손실',
  security_breach: '보안 침해',
};

// ─── Likelihood (failures) ──────────────────────────────────────────

export const LIKELIHOOD_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};

export const LIKELIHOOD_LABELS: Record<string, string> = {
  high: '높음',
  medium: '중간',
  low: '낮음',
};

// ─── Traffic Tier (benchmarks) ──────────────────────────────────────

export const TRAFFIC_TIER_COLORS: Record<string, string> = {
  small: 'bg-green-100 text-green-800',
  medium: 'bg-blue-100 text-blue-800',
  large: 'bg-orange-100 text-orange-800',
  enterprise: 'bg-purple-100 text-purple-800',
};

export const TRAFFIC_TIER_LABELS: Record<string, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
  enterprise: 'Enterprise',
};

// ─── Scaling Strategy (performance) ─────────────────────────────────

export const SCALING_STRATEGY_COLORS: Record<string, string> = {
  horizontal: 'bg-blue-100 text-blue-800',
  vertical: 'bg-purple-100 text-purple-800',
  both: 'bg-green-100 text-green-800',
};

// ─── Cloud Provider (cloud-services) ────────────────────────────────

export const PROVIDER_COLORS: Record<string, string> = {
  aws: 'bg-orange-100 text-orange-800',
  azure: 'bg-blue-100 text-blue-800',
  gcp: 'bg-red-100 text-red-800',
};

// ─── Cloud Service Status (cloud-services) ──────────────────────────

export const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  deprecated: 'bg-red-100 text-red-800',
  preview: 'bg-yellow-100 text-yellow-800',
  end_of_life: 'bg-gray-100 text-gray-800',
};

export const STATUS_LABELS: Record<string, string> = {
  active: '활성',
  deprecated: '지원종료',
  preview: '미리보기',
  end_of_life: 'EOL',
};

// ─── Relationship Type (relationships) ──────────────────────────────

export const RELATIONSHIP_TYPE_COLORS: Record<string, string> = {
  requires: 'bg-red-100 text-red-800',
  recommends: 'bg-blue-100 text-blue-800',
  conflicts: 'bg-orange-100 text-orange-800',
  enhances: 'bg-green-100 text-green-800',
  protects: 'bg-purple-100 text-purple-800',
};

export const RELATIONSHIP_TYPE_LABELS: Record<string, string> = {
  requires: '필수',
  recommends: '권장',
  conflicts: '충돌',
  enhances: '강화',
  protects: '보호',
};

// ─── Strength (relationships) ───────────────────────────────────────

export const STRENGTH_COLORS: Record<string, string> = {
  mandatory: 'bg-red-100 text-red-800',
  strong: 'bg-blue-100 text-blue-800',
  weak: 'bg-gray-100 text-gray-800',
};

export const STRENGTH_LABELS: Record<string, string> = {
  mandatory: '필수',
  strong: '강함',
  weak: '약함',
};

// ─── Source Type (sources) ──────────────────────────────────────────

export const SOURCE_TYPE_COLORS: Record<string, string> = {
  rfc: 'bg-blue-100 text-blue-800',
  nist: 'bg-indigo-100 text-indigo-800',
  cis: 'bg-green-100 text-green-800',
  owasp: 'bg-red-100 text-red-800',
  vendor: 'bg-purple-100 text-purple-800',
  academic: 'bg-teal-100 text-teal-800',
  industry: 'bg-amber-100 text-amber-800',
  user_verified: 'bg-emerald-100 text-emerald-800',
  user_unverified: 'bg-gray-100 text-gray-800',
};

export const SOURCE_TYPE_LABELS: Record<string, string> = {
  rfc: 'RFC',
  nist: 'NIST',
  cis: 'CIS',
  owasp: 'OWASP',
  vendor: 'Vendor',
  academic: 'Academic',
  industry: 'Industry',
  user_verified: '검증됨',
  user_unverified: '미검증',
};

// ─── Industry Type (industry-presets) ───────────────────────────────

export const INDUSTRY_TYPE_COLORS: Record<string, string> = {
  financial: 'bg-blue-100 text-blue-800',
  healthcare: 'bg-green-100 text-green-800',
  government: 'bg-indigo-100 text-indigo-800',
  ecommerce: 'bg-purple-100 text-purple-800',
  general: 'bg-gray-100 text-gray-800',
};

export const INDUSTRY_TYPE_LABELS: Record<string, string> = {
  financial: '금융',
  healthcare: '의료',
  government: '공공',
  ecommerce: '이커머스',
  general: '일반',
};

// ─── Security Level (industry-presets) ──────────────────────────────

export const SECURITY_LEVEL_COLORS: Record<string, string> = {
  basic: 'bg-green-100 text-green-800',
  standard: 'bg-blue-100 text-blue-800',
  enhanced: 'bg-orange-100 text-orange-800',
  maximum: 'bg-red-100 text-red-800',
};

export const SECURITY_LEVEL_LABELS: Record<string, string> = {
  basic: 'Basic',
  standard: 'Standard',
  enhanced: 'Enhanced',
  maximum: 'Maximum',
};

// ═══════════════════════════════════════════════════════════════════════
// DARK MODE — Panel components
// ═══════════════════════════════════════════════════════════════════════

// ─── Severity / Priority / Urgency Badge (icon + className) ──────────
// Used by: VulnerabilityPanel, CloudCatalogPanel (urgency), IndustryCompliancePanel (priority)

export interface SeverityBadgeConfig {
  readonly icon: string;
  readonly badgeClass: string;
}

export const SEVERITY_BADGE: Record<string, SeverityBadgeConfig> = {
  critical: { icon: '\u{1F534}', badgeClass: 'bg-red-500/20 text-red-300' },
  high:     { icon: '\u{1F7E0}', badgeClass: 'bg-orange-500/20 text-orange-300' },
  medium:   { icon: '\u{1F7E1}', badgeClass: 'bg-yellow-500/20 text-yellow-300' },
  low:      { icon: '\u{1F7E2}', badgeClass: 'bg-green-500/20 text-green-300' },
} as const;

// ─── Severity Colors with Border (audit findings) ────────────────────
// Used by: SecurityAuditResults (finding cards with border)

export const PANEL_SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high:     'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low:      'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

// ─── Cloud Service Status Badge ──────────────────────────────────────
// Used by: CloudCatalogPanel (ServiceCard)

export interface StatusBadgeConfig {
  readonly label: string;
  readonly className: string;
}

export const SERVICE_STATUS_BADGE: Record<string, StatusBadgeConfig> = {
  active:        { label: 'Active',     className: 'bg-green-500/20 text-green-300' },
  deprecated:    { label: 'Deprecated', className: 'bg-orange-500/20 text-orange-300' },
  preview:       { label: 'Preview',    className: 'bg-blue-500/20 text-blue-300' },
  'end-of-life': { label: 'EOL',        className: 'bg-red-500/20 text-red-300' },
} as const;

// ─── Cloud Provider Badge ────────────────────────────────────────────
// Used by: CloudCatalogPanel (ProviderBadge)

export interface ProviderBadgeConfig {
  readonly label: string;
  readonly className: string;
}

export const CLOUD_PROVIDER_BADGE: Record<string, ProviderBadgeConfig> = {
  aws:   { label: 'AWS',   className: 'bg-orange-500/10 text-orange-300 border-orange-500/20' },
  azure: { label: 'Azure', className: 'bg-blue-500/10 text-blue-300 border-blue-500/20' },
  gcp:   { label: 'GCP',   className: 'bg-green-500/10 text-green-300 border-green-500/20' },
} as const;

// ─── Traffic Tier Badge ──────────────────────────────────────────────
// Used by: BenchmarkPanel (capacity current tier)

export const TIER_BADGE: Record<string, string> = {
  enterprise: 'bg-purple-500/20 text-purple-300',
  large:      'bg-blue-500/20 text-blue-300',
  medium:     'bg-yellow-500/20 text-yellow-300',
  small:      'bg-zinc-700 text-zinc-300',
} as const;
