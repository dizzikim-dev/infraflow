/**
 * Node Configuration
 *
 * Centralized configuration for all infrastructure node types.
 * Used by NodeFactory to generate node components dynamically.
 *
 * 이 파일은 하위 호환성을 위해 유지됩니다.
 * 플러그인 시스템 사용 시 pluginRegistry.getAllNodeConfigs()를 사용하세요.
 */

import { NodeCategory } from '@/types';

export interface NodeConfig {
  /** Unique identifier for the node type (used in nodeTypes registry) */
  id: string;
  /** Display name */
  name: string;
  /** Category for styling */
  category: NodeCategory | 'external' | 'zone';
  /** Legacy color prop (for backwards compatibility) */
  color: string;
  /** Emoji icon (legacy, actual icons from nodeIcons) */
  icon: string;
}

/**
 * 기본 노드 설정 (하위 호환성)
 *
 * 플러그인 시스템 초기화 전에도 사용 가능하도록 유지
 * 플러그인 시스템 초기화 후에는 레지스트리에서 가져옴
 */
export const defaultNodeConfigs: NodeConfig[] = [
  // ============================================================
  // Security Nodes
  // ============================================================
  { id: 'firewall', name: 'Firewall', category: 'security', color: 'red', icon: '🔥' },
  { id: 'waf', name: 'WAF', category: 'security', color: 'red', icon: '🛡️' },
  { id: 'ids-ips', name: 'IDS/IPS', category: 'security', color: 'red', icon: '👁️' },
  { id: 'vpn-gateway', name: 'VPN Gateway', category: 'security', color: 'red', icon: '🔐' },
  { id: 'nac', name: 'NAC', category: 'security', color: 'red', icon: '🚧' },
  { id: 'dlp', name: 'DLP', category: 'security', color: 'red', icon: '📋' },

  // ============================================================
  // Network Nodes
  // ============================================================
  { id: 'router', name: 'Router', category: 'network', color: 'blue', icon: '📡' },
  { id: 'switch-l2', name: 'Switch L2', category: 'network', color: 'blue', icon: '🔀' },
  { id: 'switch-l3', name: 'Switch L3', category: 'network', color: 'blue', icon: '🔀' },
  { id: 'load-balancer', name: 'Load Balancer', category: 'network', color: 'blue', icon: '⚖️' },
  { id: 'sd-wan', name: 'SD-WAN', category: 'network', color: 'blue', icon: '🌐' },
  { id: 'dns', name: 'DNS', category: 'network', color: 'blue', icon: '📖' },
  { id: 'cdn', name: 'CDN', category: 'network', color: 'blue', icon: '🌍' },

  // ============================================================
  // Compute Nodes
  // ============================================================
  { id: 'web-server', name: 'Web Server', category: 'compute', color: 'green', icon: '🌐' },
  { id: 'app-server', name: 'App Server', category: 'compute', color: 'green', icon: '⚙️' },
  { id: 'db-server', name: 'DB Server', category: 'compute', color: 'green', icon: '🗄️' },
  { id: 'container', name: 'Container', category: 'compute', color: 'green', icon: '📦' },
  { id: 'vm', name: 'VM', category: 'compute', color: 'green', icon: '💻' },
  { id: 'kubernetes', name: 'Kubernetes', category: 'compute', color: 'green', icon: '☸️' },

  // ============================================================
  // External Nodes
  // ============================================================
  { id: 'user', name: 'User', category: 'external', color: 'gray', icon: '👤' },
  { id: 'internet', name: 'Internet', category: 'external', color: 'gray', icon: '🌏' },

  // ============================================================
  // Cloud Nodes
  // ============================================================
  { id: 'aws-vpc', name: 'AWS VPC', category: 'cloud', color: 'purple', icon: '☁️' },
  { id: 'azure-vnet', name: 'Azure VNet', category: 'cloud', color: 'purple', icon: '☁️' },
  { id: 'gcp-network', name: 'GCP Network', category: 'cloud', color: 'purple', icon: '☁️' },
  { id: 'private-cloud', name: 'Private Cloud', category: 'cloud', color: 'purple', icon: '🏢' },

  // ============================================================
  // Storage Nodes
  // ============================================================
  { id: 'san-nas', name: 'SAN/NAS', category: 'storage', color: 'amber', icon: '💽' },
  { id: 'object-storage', name: 'Object Storage', category: 'storage', color: 'amber', icon: '📦' },
  { id: 'backup', name: 'Backup', category: 'storage', color: 'amber', icon: '💾' },
  { id: 'storage', name: 'Storage', category: 'storage', color: 'amber', icon: '💾' },
  { id: 'cache', name: 'Cache', category: 'storage', color: 'amber', icon: '⚡' },

  // ============================================================
  // Auth Nodes
  // ============================================================
  { id: 'ldap-ad', name: 'LDAP/AD', category: 'auth', color: 'pink', icon: '🔑' },
  { id: 'ldap', name: 'LDAP', category: 'auth', color: 'pink', icon: '🔑' }, // 하위호환
  { id: 'sso', name: 'SSO', category: 'auth', color: 'pink', icon: '🎫' },
  { id: 'mfa', name: 'MFA', category: 'auth', color: 'pink', icon: '📱' },
  { id: 'iam', name: 'IAM', category: 'auth', color: 'pink', icon: '👥' },

  // ============================================================
  // Zone
  // ============================================================
  { id: 'zone', name: 'Zone', category: 'zone', color: 'gray', icon: '📦' },
];

/**
 * 노드 설정 배열
 *
 * 플러그인 시스템 초기화 여부와 관계없이 사용 가능
 * - 초기화 전: defaultNodeConfigs 반환
 * - 초기화 후: 레지스트리에서 동적으로 가져옴
 */
export const nodeConfigs: NodeConfig[] = defaultNodeConfigs;

/**
 * 플러그인 레지스트리에서 노드 설정 가져오기
 *
 * 플러그인 시스템 초기화 후 사용 권장
 */
export function getNodeConfigsFromRegistry(): NodeConfig[] {
  try {
    // 동적 import로 순환 의존성 방지
    const { pluginRegistry } = require('@/lib/plugins/registry');
    const configs = pluginRegistry.getAllNodeConfigs();
    return configs.length > 0 ? configs : defaultNodeConfigs;
  } catch {
    return defaultNodeConfigs;
  }
}

/**
 * Get node config by ID
 *
 * 플러그인 레지스트리에서 먼저 찾고, 없으면 기본 설정에서 찾음
 */
export function getNodeConfig(id: string): NodeConfig | undefined {
  try {
    const { pluginRegistry } = require('@/lib/plugins/registry');
    const config = pluginRegistry.getNodeConfig(id);
    if (config) return config;
  } catch {
    // 플러그인 시스템 초기화 전
  }
  return defaultNodeConfigs.find((config) => config.id === id);
}

/**
 * Get all node configs by category
 */
export function getNodeConfigsByCategory(category: NodeConfig['category']): NodeConfig[] {
  try {
    const { pluginRegistry } = require('@/lib/plugins/registry');
    const configs = pluginRegistry.getNodeConfigsByCategory(category);
    if (configs.length > 0) return configs;
  } catch {
    // 플러그인 시스템 초기화 전
  }
  return defaultNodeConfigs.filter((config) => config.category === category);
}

/**
 * Map of node ID to config for quick lookup
 */
export const nodeConfigMap: Record<string, NodeConfig> = Object.fromEntries(
  defaultNodeConfigs.map((config) => [config.id, config])
);

/**
 * 플러그인 레지스트리 기반 노드 설정 맵 가져오기
 */
export function getNodeConfigMapFromRegistry(): Record<string, NodeConfig> {
  const configs = getNodeConfigsFromRegistry();
  return Object.fromEntries(configs.map((config) => [config.id, config]));
}
