// Export all node components
export { BaseNode } from './BaseNode';

// Security Nodes
export {
  FirewallNode,
  WafNode,
  IdsIpsNode,
  VpnGatewayNode,
  NacNode,
  DlpNode,
} from './SecurityNodes';

// Network Nodes
export {
  RouterNode,
  SwitchL2Node,
  SwitchL3Node,
  LoadBalancerNode,
  SdWanNode,
  DnsNode,
  CdnNode,
} from './NetworkNodes';

// Compute Nodes
export {
  WebServerNode,
  AppServerNode,
  DbServerNode,
  ContainerNode,
  VmNode,
  KubernetesNode,
} from './ComputeNodes';

// External & Other Nodes
export {
  UserNode,
  InternetNode,
  AwsVpcNode,
  AzureVnetNode,
  StorageNode,
  CacheNode,
  LdapNode,
  SsoNode,
} from './ExternalNodes';

// Node Types Registry for React Flow
import { FirewallNode, WafNode, IdsIpsNode, VpnGatewayNode, NacNode, DlpNode } from './SecurityNodes';
import { RouterNode, SwitchL2Node, SwitchL3Node, LoadBalancerNode, SdWanNode, DnsNode, CdnNode } from './NetworkNodes';
import { WebServerNode, AppServerNode, DbServerNode, ContainerNode, VmNode, KubernetesNode } from './ComputeNodes';
import { UserNode, InternetNode, AwsVpcNode, AzureVnetNode, StorageNode, CacheNode, LdapNode, SsoNode } from './ExternalNodes';

export const nodeTypes = {
  // Security
  firewall: FirewallNode,
  waf: WafNode,
  'ids-ips': IdsIpsNode,
  'vpn-gateway': VpnGatewayNode,
  nac: NacNode,
  dlp: DlpNode,

  // Network
  router: RouterNode,
  'switch-l2': SwitchL2Node,
  'switch-l3': SwitchL3Node,
  'load-balancer': LoadBalancerNode,
  'sd-wan': SdWanNode,
  dns: DnsNode,
  cdn: CdnNode,

  // Compute
  webServer: WebServerNode,
  appServer: AppServerNode,
  dbServer: DbServerNode,
  container: ContainerNode,
  vm: VmNode,
  kubernetes: KubernetesNode,

  // External
  user: UserNode,
  internet: InternetNode,

  // Cloud
  'aws-vpc': AwsVpcNode,
  'azure-vnet': AzureVnetNode,

  // Storage
  storage: StorageNode,
  cache: CacheNode,

  // Auth
  ldap: LdapNode,
  sso: SsoNode,
};
