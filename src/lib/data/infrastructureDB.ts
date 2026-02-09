/**
 * Infrastructure Component Database
 * Main entry point for infrastructure component data
 *
 * Components are organized into category-specific modules:
 * - security.ts: Firewall, WAF, IDS/IPS, VPN Gateway, NAC, DLP
 * - network.ts: Router, Switch, Load Balancer, DNS, CDN, SD-WAN
 * - compute.ts: Web Server, App Server, DB Server, Container, VM, Kubernetes
 * - cloud.ts: AWS VPC, Azure VNet, GCP Network, Private Cloud
 * - storage.ts: Storage, SAN/NAS, Object Storage, Cache, Backup
 * - auth.ts: LDAP/AD, SSO, MFA, IAM
 * - external.ts: User, Internet
 */

import {
  allComponents,
  securityComponents,
  networkComponents,
  computeComponents,
  cloudComponents,
  storageComponents,
  authComponents,
  externalComponents,
  categoryLabels,
  tierLabels,
  getComponentsByCategory,
  getComponentsByTier,
} from './components';

// Re-export types for backward compatibility
export type { InfraComponent, PolicyRecommendation, InfraComponentCategory, InfraComponentTier } from './components/types';

// Main export - all components combined
export const infrastructureDB = allComponents;

// Re-export category-specific components
export {
  securityComponents,
  networkComponents,
  computeComponents,
  cloudComponents,
  storageComponents,
  authComponents,
  externalComponents,
};

// Re-export utility functions and labels
export {
  categoryLabels,
  tierLabels,
  getComponentsByCategory,
  getComponentsByTier,
};

// Category icons (SVG paths for Lucide icons)
export const categoryIcons: Record<string, string> = {
  security: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  network: 'M5 12h14M12 5l7 7-7 7',
  compute: 'M4 4h16v12H4zM4 20h16M8 16v4m8-4v4',
  cloud: 'M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z',
  storage: 'M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4',
  auth: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z',
  external: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
};

// Tier order for layout
export const tierOrder = ['external', 'dmz', 'internal', 'data'] as const;

// Tier information with colors
export const tierInfo: Record<string, { name: string; nameKo: string; color: string }> = {
  external: { name: 'External', nameKo: '외부', color: '#6b7280' },
  dmz: { name: 'DMZ', nameKo: 'DMZ', color: '#f59e0b' },
  internal: { name: 'Internal', nameKo: '내부망', color: '#10b981' },
  data: { name: 'Data', nameKo: '데이터', color: '#8b5cf6' },
};

// --- SSoT Helper Functions ---
// These derive category, tier, and label from infrastructureDB to avoid duplication.

import type { InfraNodeType, NodeCategory, TierType } from '@/types';

/** Get category for a node type from infrastructureDB (SSoT) */
export function getCategoryForType(type: InfraNodeType): NodeCategory | 'external' {
  const info = infrastructureDB[type];
  return (info?.category as NodeCategory | 'external') || 'external';
}

/** Get tier for a node type from infrastructureDB (SSoT) */
export function getTierForType(type: InfraNodeType): TierType {
  const info = infrastructureDB[type];
  return (info?.tier as TierType) || 'internal';
}

/** Get display label for a node type from infrastructureDB (SSoT) */
export function getLabelForType(type: InfraNodeType): string {
  const info = infrastructureDB[type];
  return info?.name || type.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default infrastructureDB;
