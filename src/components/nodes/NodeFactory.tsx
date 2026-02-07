'use client';

/**
 * Node Factory
 *
 * Generates React Flow node components from configuration.
 * Supports both static configuration and plugin registry.
 *
 * 플러그인 시스템 지원:
 * - 정적 설정: defaultNodeConfigs 사용 (하위 호환)
 * - 동적 로드: pluginRegistry 사용 (플러그인 시스템)
 */

import { memo, ComponentType, useMemo } from 'react';
import { NodeProps, Node } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { InfraNodeData } from '@/types';
import { useEditableNode } from './useEditableNode';
import { defaultNodeConfigs, NodeConfig, getNodeConfigsFromRegistry } from './nodeConfig';

export type InfraNodeProps = NodeProps<Node<InfraNodeData>>;

/**
 * Creates a memoized node component from configuration
 */
export function createNodeComponent(config: NodeConfig): ComponentType<InfraNodeProps> {
  const NodeComponent = memo(function NodeComponent({ data, selected }: InfraNodeProps) {
    const editProps = useEditableNode();
    return (
      <BaseNode
        data={data}
        icon={config.icon}
        color={config.color}
        selected={selected}
        {...editProps}
      />
    );
  });

  // Set display name for React DevTools
  NodeComponent.displayName = `${config.name.replace(/\s+/g, '')}Node`;

  return NodeComponent;
}

/**
 * 노드 컴포넌트 캐시
 * 동일한 설정에 대해 재생성 방지
 */
const nodeComponentCache = new Map<string, ComponentType<InfraNodeProps>>();

/**
 * 캐시된 노드 컴포넌트 가져오기 또는 생성
 */
export function getOrCreateNodeComponent(config: NodeConfig): ComponentType<InfraNodeProps> {
  const cached = nodeComponentCache.get(config.id);
  if (cached) {
    return cached;
  }

  const component = createNodeComponent(config);
  nodeComponentCache.set(config.id, component);
  return component;
}

/**
 * 설정 배열에서 노드 컴포넌트 맵 생성
 */
function buildNodeComponentsMap(
  configs: NodeConfig[]
): Record<string, ComponentType<InfraNodeProps>> {
  return Object.fromEntries(
    configs.map((config) => [config.id, getOrCreateNodeComponent(config)])
  );
}

/**
 * Generated node components map (기본 설정 기반)
 * Keys are node IDs (e.g., 'firewall', 'web-server')
 * Values are memoized React components
 */
export const generatedNodeComponents: Record<string, ComponentType<InfraNodeProps>> =
  buildNodeComponentsMap(defaultNodeConfigs);

/**
 * 플러그인 레지스트리에서 노드 컴포넌트 맵 가져오기
 *
 * 플러그인 시스템 초기화 후 사용
 */
export function getNodeComponentsFromRegistry(): Record<string, ComponentType<InfraNodeProps>> {
  const configs = getNodeConfigsFromRegistry();
  return buildNodeComponentsMap(configs);
}

/**
 * Node types registry for React Flow
 * Uses the same keys as generatedNodeComponents
 */
export const nodeTypes: Record<string, ComponentType<InfraNodeProps>> = {
  ...generatedNodeComponents,
  // Legacy aliases for backwards compatibility
  webServer: generatedNodeComponents['web-server'],
  appServer: generatedNodeComponents['app-server'],
  dbServer: generatedNodeComponents['db-server'],
};

/**
 * 동적 nodeTypes 가져오기
 *
 * 플러그인 시스템 초기화 후 사용
 * 레지스트리의 모든 노드 포함
 */
export function getDynamicNodeTypes(): Record<string, ComponentType<InfraNodeProps>> {
  const pluginComponents = getNodeComponentsFromRegistry();

  return {
    ...pluginComponents,
    // Legacy aliases for backwards compatibility
    webServer: pluginComponents['web-server'] || generatedNodeComponents['web-server'],
    appServer: pluginComponents['app-server'] || generatedNodeComponents['app-server'],
    dbServer: pluginComponents['db-server'] || generatedNodeComponents['db-server'],
  };
}

/**
 * Get a specific node component by ID
 *
 * 레지스트리와 정적 설정 모두에서 검색
 */
export function getNodeComponent(nodeId: string): ComponentType<InfraNodeProps> | undefined {
  // 캐시에서 먼저 찾기
  const cached = nodeComponentCache.get(nodeId);
  if (cached) {
    return cached;
  }

  // 정적 설정에서 찾기
  const staticComponent = generatedNodeComponents[nodeId] || nodeTypes[nodeId];
  if (staticComponent) {
    return staticComponent;
  }

  // 레지스트리에서 설정 찾아서 생성
  try {
    const configs = getNodeConfigsFromRegistry();
    const config = configs.find((c) => c.id === nodeId);
    if (config) {
      return getOrCreateNodeComponent(config);
    }
  } catch {
    // 플러그인 시스템 초기화 전
  }

  return undefined;
}

/**
 * React Hook: 동적 nodeTypes
 *
 * 플러그인 시스템 변경 시 자동 업데이트
 */
export function useNodeTypes(): Record<string, ComponentType<InfraNodeProps>> {
  return useMemo(() => {
    try {
      return getDynamicNodeTypes();
    } catch {
      return nodeTypes;
    }
  }, []);
}

/**
 * 컴포넌트 캐시 초기화
 *
 * 플러그인 재로드 시 사용
 */
export function clearNodeComponentCache(): void {
  nodeComponentCache.clear();
}

// ============================================================
// Named Exports for Direct Import (Backwards Compatibility)
// ============================================================

// Security Nodes
export const FirewallNode = generatedNodeComponents['firewall'];
export const WafNode = generatedNodeComponents['waf'];
export const IdsIpsNode = generatedNodeComponents['ids-ips'];
export const VpnGatewayNode = generatedNodeComponents['vpn-gateway'];
export const NacNode = generatedNodeComponents['nac'];
export const DlpNode = generatedNodeComponents['dlp'];

// Network Nodes
export const RouterNode = generatedNodeComponents['router'];
export const SwitchL2Node = generatedNodeComponents['switch-l2'];
export const SwitchL3Node = generatedNodeComponents['switch-l3'];
export const LoadBalancerNode = generatedNodeComponents['load-balancer'];
export const SdWanNode = generatedNodeComponents['sd-wan'];
export const DnsNode = generatedNodeComponents['dns'];
export const CdnNode = generatedNodeComponents['cdn'];

// Compute Nodes
export const WebServerNode = generatedNodeComponents['web-server'];
export const AppServerNode = generatedNodeComponents['app-server'];
export const DbServerNode = generatedNodeComponents['db-server'];
export const ContainerNode = generatedNodeComponents['container'];
export const VmNode = generatedNodeComponents['vm'];
export const KubernetesNode = generatedNodeComponents['kubernetes'];

// External Nodes
export const UserNode = generatedNodeComponents['user'];
export const InternetNode = generatedNodeComponents['internet'];

// Cloud Nodes
export const AwsVpcNode = generatedNodeComponents['aws-vpc'];
export const AzureVnetNode = generatedNodeComponents['azure-vnet'];
export const GcpNetworkNode = generatedNodeComponents['gcp-network'];
export const PrivateCloudNode = generatedNodeComponents['private-cloud'];

// Storage Nodes
export const SanNasNode = generatedNodeComponents['san-nas'];
export const ObjectStorageNode = generatedNodeComponents['object-storage'];
export const BackupNode = generatedNodeComponents['backup'];
export const StorageNode = generatedNodeComponents['storage'];
export const CacheNode = generatedNodeComponents['cache'];

// Auth Nodes
export const LdapAdNode = generatedNodeComponents['ldap-ad'];
export const LdapNode = generatedNodeComponents['ldap'];
export const SsoNode = generatedNodeComponents['sso'];
export const MfaNode = generatedNodeComponents['mfa'];
export const IamNode = generatedNodeComponents['iam'];

// Zone
export const ZoneNode = generatedNodeComponents['zone'];
