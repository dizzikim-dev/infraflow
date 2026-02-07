/**
 * Infrastructure Components Index
 * Re-exports types and combines all category components
 */

export * from './types';

// Import category components
import { securityComponents } from './security';
import { networkComponents } from './network';
import { computeComponents } from './compute';
import { cloudComponents } from './cloud';
import { storageComponents } from './storage';
import { authComponents } from './auth';
import { externalComponents } from './external';
import type { InfraComponent } from './types';

// Combined all components
export const allComponents: Record<string, InfraComponent> = {
  ...securityComponents,
  ...networkComponents,
  ...computeComponents,
  ...cloudComponents,
  ...storageComponents,
  ...authComponents,
  ...externalComponents,
};

// Export individual category components
export {
  securityComponents,
  networkComponents,
  computeComponents,
  cloudComponents,
  storageComponents,
  authComponents,
  externalComponents,
};

// Category labels for UI
export const categoryLabels: Record<string, { en: string; ko: string }> = {
  security: { en: 'Security', ko: '보안' },
  network: { en: 'Network', ko: '네트워크' },
  compute: { en: 'Compute', ko: '컴퓨팅' },
  cloud: { en: 'Cloud', ko: '클라우드' },
  storage: { en: 'Storage', ko: '스토리지' },
  auth: { en: 'Auth', ko: '인증' },
  external: { en: 'External', ko: '외부' },
};

// Tier labels for UI
export const tierLabels: Record<string, { en: string; ko: string }> = {
  external: { en: 'External', ko: '외부' },
  dmz: { en: 'DMZ', ko: 'DMZ' },
  internal: { en: 'Internal', ko: '내부' },
  data: { en: 'Data', ko: '데이터' },
};

// Get components by category
export function getComponentsByCategory(category: InfraComponent['category']): Record<string, InfraComponent> {
  switch (category) {
    case 'security':
      return securityComponents;
    case 'network':
      return networkComponents;
    case 'compute':
      return computeComponents;
    case 'cloud':
      return cloudComponents;
    case 'storage':
      return storageComponents;
    case 'auth':
      return authComponents;
    case 'external':
      return externalComponents;
    default:
      return {};
  }
}

// Get components by tier
export function getComponentsByTier(tier: InfraComponent['tier']): InfraComponent[] {
  return Object.values(allComponents).filter(c => c.tier === tier);
}
