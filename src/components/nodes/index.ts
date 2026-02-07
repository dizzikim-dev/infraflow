/**
 * Node Components Index
 *
 * All node components are generated from NodeFactory using nodeConfig.
 * This provides a single source of truth for node definitions.
 */

// Core exports
export { BaseNode } from './BaseNode';
export { nodeConfigs, getNodeConfig, getNodeConfigsByCategory, nodeConfigMap } from './nodeConfig';
export type { NodeConfig } from './nodeConfig';

// Node Factory - generates all node components
export {
  nodeTypes,
  generatedNodeComponents,
  getNodeComponent,
  // Security Nodes
  FirewallNode,
  WafNode,
  IdsIpsNode,
  VpnGatewayNode,
  NacNode,
  DlpNode,
  // Network Nodes
  RouterNode,
  SwitchL2Node,
  SwitchL3Node,
  LoadBalancerNode,
  SdWanNode,
  DnsNode,
  CdnNode,
  // Compute Nodes
  WebServerNode,
  AppServerNode,
  DbServerNode,
  ContainerNode,
  VmNode,
  KubernetesNode,
  // External Nodes
  UserNode,
  InternetNode,
  // Cloud Nodes
  AwsVpcNode,
  AzureVnetNode,
  // Storage Nodes
  StorageNode,
  CacheNode,
  // Auth Nodes
  LdapNode,
  SsoNode,
} from './NodeFactory';
