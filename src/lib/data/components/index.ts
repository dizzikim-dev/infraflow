/**
 * Infrastructure Components Index
 * Re-exports types and provides category utilities
 */

export * from './types';

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
