/**
 * Node Configuration
 *
 * Centralized configuration for all infrastructure node types.
 * Used by NodeFactory to generate node components dynamically.
 *
 * 이 파일은 하위 호환성을 위해 유지됩니다.
 * 플러그인 시스템 사용 시 pluginRegistry.getAllNodeConfigs()를 사용하세요.
 */

import { NodeCategory, InfraNodeType } from '@/types';
import { createLogger } from '@/lib/utils/logger';
import { getCategoryForType } from '@/lib/data/infrastructureDB';

const logger = createLogger('NodeConfig');

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
// Category → color mapping for node configs
const categoryColorMap: Record<string, string> = {
  security: 'red', network: 'blue', compute: 'green', cloud: 'purple',
  storage: 'amber', auth: 'pink', external: 'gray', telecom: 'teal',
  wan: 'indigo', zone: 'gray',
};

// Raw config data (category is derived from infrastructureDB SSoT)
const nodeConfigsRaw: Array<{ id: string; name: string; icon: string }> = [
  // Security
  { id: 'firewall', name: 'Firewall', icon: '🔥' },
  { id: 'waf', name: 'WAF', icon: '🛡️' },
  { id: 'ids-ips', name: 'IDS/IPS', icon: '👁️' },
  { id: 'vpn-gateway', name: 'VPN Gateway', icon: '🔐' },
  { id: 'nac', name: 'NAC', icon: '🚧' },
  { id: 'dlp', name: 'DLP', icon: '📋' },
  { id: 'sase-gateway', name: 'SASE Gateway', icon: '☁️' },
  { id: 'ztna-broker', name: 'ZTNA Broker', icon: '🔑' },
  { id: 'casb', name: 'CASB', icon: '🔒' },
  { id: 'siem', name: 'SIEM', icon: '📊' },
  { id: 'soar', name: 'SOAR', icon: '⚡' },
  // Physical Security
  { id: 'cctv-camera', name: 'CCTV Camera', icon: '📹' },
  { id: 'nvr', name: 'NVR', icon: '💿' },
  { id: 'video-server', name: 'Video Server', icon: '🖥️' },
  { id: 'access-control', name: 'Access Control', icon: '🚪' },
  // Network
  { id: 'router', name: 'Router', icon: '📡' },
  { id: 'switch-l2', name: 'Switch L2', icon: '🔀' },
  { id: 'switch-l3', name: 'Switch L3', icon: '🔀' },
  { id: 'load-balancer', name: 'Load Balancer', icon: '⚖️' },
  { id: 'api-gateway', name: 'API Gateway', icon: '🚪' },
  { id: 'sd-wan', name: 'SD-WAN', icon: '🌐' },
  { id: 'dns', name: 'DNS', icon: '📖' },
  { id: 'cdn', name: 'CDN', icon: '🌍' },
  // Compute
  { id: 'web-server', name: 'Web Server', icon: '🌐' },
  { id: 'app-server', name: 'App Server', icon: '⚙️' },
  { id: 'db-server', name: 'DB Server', icon: '🗄️' },
  { id: 'container', name: 'Container', icon: '📦' },
  { id: 'vm', name: 'VM', icon: '💻' },
  { id: 'kubernetes', name: 'Kubernetes', icon: '☸️' },
  { id: 'kafka', name: 'Kafka', icon: '📨' },
  { id: 'rabbitmq', name: 'RabbitMQ', icon: '🐰' },
  { id: 'prometheus', name: 'Prometheus', icon: '🔥' },
  { id: 'grafana', name: 'Grafana', icon: '📊' },
  // External
  { id: 'user', name: 'User', icon: '👤' },
  { id: 'internet', name: 'Internet', icon: '🌏' },
  // Cloud
  { id: 'aws-vpc', name: 'AWS VPC', icon: '☁️' },
  { id: 'azure-vnet', name: 'Azure VNet', icon: '☁️' },
  { id: 'gcp-network', name: 'GCP Network', icon: '☁️' },
  { id: 'private-cloud', name: 'Private Cloud', icon: '🏢' },
  // Storage
  { id: 'san-nas', name: 'SAN/NAS', icon: '💽' },
  { id: 'object-storage', name: 'Object Storage', icon: '📦' },
  { id: 'backup', name: 'Backup', icon: '💾' },
  { id: 'storage', name: 'Storage', icon: '💾' },
  { id: 'cache', name: 'Cache', icon: '⚡' },
  { id: 'elasticsearch', name: 'Elasticsearch', icon: '🔍' },
  // Auth
  { id: 'ldap-ad', name: 'LDAP/AD', icon: '🔑' },
  { id: 'ldap', name: 'LDAP', icon: '🔑' }, // 하위호환
  { id: 'sso', name: 'SSO', icon: '🎫' },
  { id: 'mfa', name: 'MFA', icon: '📱' },
  { id: 'iam', name: 'IAM', icon: '👥' },
  // Telecom
  { id: 'central-office', name: 'Central Office', icon: '🏢' },
  { id: 'base-station', name: 'Base Station', icon: '📶' },
  { id: 'olt', name: 'OLT', icon: '💡' },
  { id: 'customer-premise', name: 'Customer Premise', icon: '🏠' },
  { id: 'idc', name: 'IDC', icon: '🏗️' },
  // WAN
  { id: 'pe-router', name: 'PE Router', icon: '🔀' },
  { id: 'p-router', name: 'P Router', icon: '🔁' },
  { id: 'mpls-network', name: 'MPLS Network', icon: '🌐' },
  { id: 'dedicated-line', name: 'Dedicated Line', icon: '🔗' },
  { id: 'metro-ethernet', name: 'Metro Ethernet', icon: '🔌' },
  { id: 'corporate-internet', name: 'Corporate Internet', icon: '🌍' },
  { id: 'vpn-service', name: 'VPN Service', icon: '🔐' },
  { id: 'sd-wan-service', name: 'SD-WAN Service', icon: '☁️' },
  { id: 'private-5g', name: 'Private 5G', icon: '📡' },
  { id: 'core-network', name: 'Core Network', icon: '⚡' },
  { id: 'upf', name: 'UPF', icon: '🔄' },
  { id: 'ring-network', name: 'Ring Network', icon: '⭕' },
  // Zone (special — not in infrastructureDB)
  { id: 'zone', name: 'Zone', icon: '📦' },
];

// Derive category from infrastructureDB (SSoT) at module init
export const defaultNodeConfigs: NodeConfig[] = nodeConfigsRaw.map((raw) => {
  const category: NodeConfig['category'] =
    raw.id === 'zone' ? 'zone' : getCategoryForType(raw.id as InfraNodeType);
  return {
    ...raw,
    category,
    color: categoryColorMap[category] || 'gray',
  };
});

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
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { pluginRegistry } = require('@/lib/plugins/registry');
    const configs = pluginRegistry.getAllNodeConfigs();
    return configs.length > 0 ? configs : defaultNodeConfigs;
  } catch (error) {
    logger.debug('Plugin registry unavailable, using default node configs', {
      error: error instanceof Error ? error.message : String(error),
    });
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
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { pluginRegistry } = require('@/lib/plugins/registry');
    const config = pluginRegistry.getNodeConfig(id);
    if (config) return config;
  } catch (error) {
    // 플러그인 시스템 초기화 전 - debug level since this is expected during startup
    logger.debug('Plugin registry not initialized, falling back to defaults', {
      nodeId: id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
  return defaultNodeConfigs.find((config) => config.id === id);
}

/**
 * Get all node configs by category
 */
export function getNodeConfigsByCategory(category: NodeConfig['category']): NodeConfig[] {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { pluginRegistry } = require('@/lib/plugins/registry');
    const configs = pluginRegistry.getNodeConfigsByCategory(category);
    if (configs.length > 0) return configs;
  } catch (error) {
    // 플러그인 시스템 초기화 전 - debug level since this is expected during startup
    logger.debug('Plugin registry not initialized for category lookup', {
      category,
      error: error instanceof Error ? error.message : String(error),
    });
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
