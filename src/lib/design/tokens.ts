// Design Tokens - 색상 팔레트 및 스타일 정의

export const colors = {
  // 카테고리별 메인 색상
  categories: {
    security: {
      primary: '#ef4444',    // red-500
      secondary: '#fecaca',  // red-200
      gradient: 'from-red-500 to-rose-600',
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)',
      glow: '0 0 20px rgba(239, 68, 68, 0.3)',
    },
    network: {
      primary: '#3b82f6',    // blue-500
      secondary: '#bfdbfe',  // blue-200
      gradient: 'from-blue-500 to-indigo-600',
      bg: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.3)',
      glow: '0 0 20px rgba(59, 130, 246, 0.3)',
    },
    compute: {
      primary: '#10b981',    // emerald-500
      secondary: '#a7f3d0',  // emerald-200
      gradient: 'from-emerald-500 to-teal-600',
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.3)',
      glow: '0 0 20px rgba(16, 185, 129, 0.3)',
    },
    cloud: {
      primary: '#8b5cf6',    // violet-500
      secondary: '#ddd6fe',  // violet-200
      gradient: 'from-violet-500 to-purple-600',
      bg: 'rgba(139, 92, 246, 0.1)',
      border: 'rgba(139, 92, 246, 0.3)',
      glow: '0 0 20px rgba(139, 92, 246, 0.3)',
    },
    storage: {
      primary: '#f59e0b',    // amber-500
      secondary: '#fde68a',  // amber-200
      gradient: 'from-amber-500 to-orange-600',
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.3)',
      glow: '0 0 20px rgba(245, 158, 11, 0.3)',
    },
    auth: {
      primary: '#ec4899',    // pink-500
      secondary: '#fbcfe8',  // pink-200
      gradient: 'from-pink-500 to-rose-600',
      bg: 'rgba(236, 72, 153, 0.1)',
      border: 'rgba(236, 72, 153, 0.3)',
      glow: '0 0 20px rgba(236, 72, 153, 0.3)',
    },
    external: {
      primary: '#6b7280',    // gray-500
      secondary: '#e5e7eb',  // gray-200
      gradient: 'from-gray-500 to-slate-600',
      bg: 'rgba(107, 114, 128, 0.1)',
      border: 'rgba(107, 114, 128, 0.3)',
      glow: '0 0 20px rgba(107, 114, 128, 0.3)',
    },
  },

  // Zone 배경 색상
  zones: {
    external: { bg: 'rgba(107, 114, 128, 0.05)', border: 'rgba(107, 114, 128, 0.2)' },
    dmz: { bg: 'rgba(245, 158, 11, 0.05)', border: 'rgba(245, 158, 11, 0.2)' },
    internal: { bg: 'rgba(16, 185, 129, 0.05)', border: 'rgba(16, 185, 129, 0.2)' },
    db: { bg: 'rgba(139, 92, 246, 0.05)', border: 'rgba(139, 92, 246, 0.2)' },
    custom: { bg: 'rgba(59, 130, 246, 0.05)', border: 'rgba(59, 130, 246, 0.2)' },
  },

  // Flow 타입별 색상
  flows: {
    request: '#3b82f6',   // blue
    response: '#10b981',  // green
    sync: '#8b5cf6',      // purple
    blocked: '#ef4444',   // red
    encrypted: '#f59e0b', // amber
  },
};

// 노드 타입 → 카테고리 매핑
export const nodeCategories: Record<string, keyof typeof colors.categories> = {
  // Security
  'firewall': 'security',
  'waf': 'security',
  'ids-ips': 'security',
  'vpn-gateway': 'security',
  'nac': 'security',
  'dlp': 'security',

  // Network
  'router': 'network',
  'switch-l2': 'network',
  'switch-l3': 'network',
  'load-balancer': 'network',
  'sd-wan': 'network',
  'dns': 'network',
  'cdn': 'network',

  // Compute
  'web-server': 'compute',
  'app-server': 'compute',
  'db-server': 'compute',
  'container': 'compute',
  'vm': 'compute',
  'kubernetes': 'compute',

  // Cloud
  'aws-vpc': 'cloud',
  'azure-vnet': 'cloud',
  'gcp-network': 'cloud',
  'private-cloud': 'cloud',

  // Storage
  'san-nas': 'storage',
  'object-storage': 'storage',
  'backup': 'storage',
  'cache': 'storage',
  'storage': 'storage',

  // Auth
  'ldap-ad': 'auth',
  'sso': 'auth',
  'mfa': 'auth',
  'iam': 'auth',

  // External
  'user': 'external',
  'internet': 'external',
};

// 카테고리 가져오기
export function getCategoryForNode(nodeType: string): keyof typeof colors.categories {
  return nodeCategories[nodeType] || 'external';
}

// 카테고리별 색상 가져오기
export function getColorsForNode(nodeType: string) {
  const category = getCategoryForNode(nodeType);
  return colors.categories[category];
}

// 노드 아이콘 (SVG path)
export const nodeIcons: Record<string, string> = {
  // Security
  'firewall': 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  'waf': 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 01-.67 0C7.5 20.5 4 18 4 13V6a1 1 0 01.5-.87l7-4a1 1 0 011 0l7 4A1 1 0 0120 6v7zM12 8v4m0 4h.01',
  'vpn-gateway': 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4',
  'dlp': 'M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10h.01M15 10h.01M9.5 15a3.5 3.5 0 005 0',

  // Network
  'router': 'M5 12h14M12 5l7 7-7 7',
  'load-balancer': 'M4 4h16v16H4zM4 12h16M12 4v16',
  'dns': 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9',
  'cdn': 'M3 12a9 9 0 1018 0 9 9 0 00-18 0zM3 12h18M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 01-4-9 15.3 15.3 0 014-9z',

  // Compute
  'web-server': 'M4 4h16v12H4zM4 20h16M8 16v4m8-4v4',
  'app-server': 'M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1zM9 9h6m-6 4h6m-6 4h4',
  'db-server': 'M12 2C6.48 2 2 4.69 2 8v8c0 3.31 4.48 6 10 6s10-2.69 10-6V8c0-3.31-4.48-6-10-6zM2 8c0 3.31 4.48 6 10 6s10-2.69 10-6M2 12c0 3.31 4.48 6 10 6s10-2.69 10-6',
  'container': 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z',
  'vm': 'M4 6h16v12H4zM4 9h16M7 6v3m5-3v3m5-3v3',
  'kubernetes': 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',

  // Cloud
  'aws-vpc': 'M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z',
  'cloud': 'M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z',

  // Storage
  'storage': 'M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4',
  'cache': 'M22 12h-4l-3 9L9 3l-3 9H2',

  // Auth
  'ldap-ad': 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  'sso': 'M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5m5 5H3',
  'mfa': 'M12 1a3 3 0 00-3 3v4a3 3 0 006 0V4a3 3 0 00-3-3zM19 10H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2v-8a2 2 0 00-2-2zM12 15v3',

  // External
  'user': 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  'internet': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07',
};

// Tier 색상 (레이아웃/계층 표시용)
export const tierColors: Record<string, { bg: string; border: string; text: string }> = {
  external: {
    bg: 'rgba(107, 114, 128, 0.1)',
    border: 'rgba(107, 114, 128, 0.3)',
    text: '#6b7280',
  },
  dmz: {
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.3)',
    text: '#f59e0b',
  },
  internal: {
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.3)',
    text: '#10b981',
  },
  data: {
    bg: 'rgba(139, 92, 246, 0.1)',
    border: 'rgba(139, 92, 246, 0.3)',
    text: '#8b5cf6',
  },
};

// 우선순위 색상 (보안 감사, 규정 준수 등)
export const priorityColors: Record<string, { bg: string; text: string; border: string }> = {
  critical: {
    bg: 'rgba(239, 68, 68, 0.15)',
    text: '#ef4444',
    border: 'rgba(239, 68, 68, 0.5)',
  },
  high: {
    bg: 'rgba(249, 115, 22, 0.15)',
    text: '#f97316',
    border: 'rgba(249, 115, 22, 0.5)',
  },
  medium: {
    bg: 'rgba(245, 158, 11, 0.15)',
    text: '#f59e0b',
    border: 'rgba(245, 158, 11, 0.5)',
  },
  low: {
    bg: 'rgba(34, 197, 94, 0.15)',
    text: '#22c55e',
    border: 'rgba(34, 197, 94, 0.5)',
  },
  info: {
    bg: 'rgba(59, 130, 246, 0.15)',
    text: '#3b82f6',
    border: 'rgba(59, 130, 246, 0.5)',
  },
};

// 상태 색상 (성공, 실패, 경고 등)
export const statusColors: Record<string, { bg: string; text: string; icon: string }> = {
  success: {
    bg: 'rgba(34, 197, 94, 0.15)',
    text: '#22c55e',
    icon: '✓',
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.15)',
    text: '#ef4444',
    icon: '✕',
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.15)',
    text: '#f59e0b',
    icon: '⚠',
  },
  info: {
    bg: 'rgba(59, 130, 246, 0.15)',
    text: '#3b82f6',
    icon: 'ℹ',
  },
  pending: {
    bg: 'rgba(107, 114, 128, 0.15)',
    text: '#6b7280',
    icon: '○',
  },
};

// Tier 색상 가져오기
export function getTierColor(tier: string) {
  return tierColors[tier] || tierColors.internal;
}

// 우선순위 색상 가져오기
export function getPriorityColor(priority: string) {
  return priorityColors[priority] || priorityColors.info;
}

// 상태 색상 가져오기
export function getStatusColor(status: string) {
  return statusColors[status] || statusColors.info;
}

export default colors;
