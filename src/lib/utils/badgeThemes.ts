/**
 * Panel Badge Theme Consolidation (Dark Mode)
 *
 * Centralized Tailwind class maps for badge colors used across
 * dark-mode panel components (VulnerabilityPanel, CloudCatalogPanel,
 * IndustryCompliancePanel, BenchmarkPanel, SecurityAuditResults).
 *
 * NOTE: Admin badge themes (light mode) are in src/lib/admin/badgeThemes.ts.
 * This file covers the dark-mode panel UI only.
 */

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
