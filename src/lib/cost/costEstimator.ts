/**
 * InfraFlow - Cloud Cost Estimator
 *
 * 인프라 아키텍처 기반 클라우드 비용 산출
 */

import type { InfraSpec, InfraNodeType } from '@/types';

export type CloudProvider = 'aws' | 'azure' | 'gcp' | 'onprem';

export interface CostItem {
  nodeId: string;
  nodeType: InfraNodeType;
  label: string;
  provider: CloudProvider;
  service: string;
  tier: string;
  monthlyCost: number;
  hourlyCost: number;
  unit: string;
  notes?: string;
}

export interface CostBreakdown {
  items: CostItem[];
  totalMonthlyCost: number;
  totalYearlyCost: number;
  byCategory: Record<string, number>;
  byProvider: Record<CloudProvider, number>;
  currency: string;
  generatedAt: string;
}

// 기본 비용 데이터 (USD 기준, 월간)
const BASE_COSTS: Record<InfraNodeType, {
  aws: { service: string; cost: number; tier: string };
  azure: { service: string; cost: number; tier: string };
  gcp: { service: string; cost: number; tier: string };
  onprem: { service: string; cost: number; tier: string };
}> = {
  // Security
  firewall: {
    aws: { service: 'AWS Network Firewall', cost: 450, tier: 'Standard' },
    azure: { service: 'Azure Firewall', cost: 912, tier: 'Standard' },
    gcp: { service: 'Cloud Firewall', cost: 0, tier: 'Included' },
    onprem: { service: 'Enterprise Firewall', cost: 500, tier: 'Estimated' },
  },
  waf: {
    aws: { service: 'AWS WAF', cost: 25, tier: 'Basic (5 rules)' },
    azure: { service: 'Azure WAF', cost: 175, tier: 'Standard' },
    gcp: { service: 'Cloud Armor', cost: 200, tier: 'Standard' },
    onprem: { service: 'WAF Appliance', cost: 800, tier: 'Estimated' },
  },
  'ids-ips': {
    aws: { service: 'AWS GuardDuty', cost: 35, tier: 'Standard' },
    azure: { service: 'Azure Defender', cost: 15, tier: 'Per Server' },
    gcp: { service: 'Cloud IDS', cost: 250, tier: 'Standard' },
    onprem: { service: 'IDS/IPS Appliance', cost: 600, tier: 'Estimated' },
  },
  'vpn-gateway': {
    aws: { service: 'AWS VPN', cost: 36.5, tier: 'Standard' },
    azure: { service: 'Azure VPN Gateway', cost: 140, tier: 'VpnGw1' },
    gcp: { service: 'Cloud VPN', cost: 36.5, tier: 'Standard' },
    onprem: { service: 'VPN Appliance', cost: 200, tier: 'Estimated' },
  },
  nac: {
    aws: { service: 'AWS Verified Access', cost: 100, tier: 'Standard' },
    azure: { service: 'Azure AD P2', cost: 9, tier: 'Per User' },
    gcp: { service: 'BeyondCorp', cost: 6, tier: 'Per User' },
    onprem: { service: 'NAC Solution', cost: 300, tier: 'Estimated' },
  },
  dlp: {
    aws: { service: 'Amazon Macie', cost: 100, tier: 'Standard' },
    azure: { service: 'Microsoft Purview', cost: 200, tier: 'Standard' },
    gcp: { service: 'Cloud DLP', cost: 75, tier: 'Standard' },
    onprem: { service: 'DLP Solution', cost: 500, tier: 'Estimated' },
  },

  // Network
  router: {
    aws: { service: 'Transit Gateway', cost: 36.5, tier: 'Per Attachment' },
    azure: { service: 'Virtual WAN Hub', cost: 328.5, tier: 'Standard' },
    gcp: { service: 'Cloud Router', cost: 0, tier: 'Included' },
    onprem: { service: 'Enterprise Router', cost: 150, tier: 'Estimated' },
  },
  'switch-l2': {
    aws: { service: 'VPC (Included)', cost: 0, tier: 'Included' },
    azure: { service: 'VNet (Included)', cost: 0, tier: 'Included' },
    gcp: { service: 'VPC (Included)', cost: 0, tier: 'Included' },
    onprem: { service: 'L2 Switch', cost: 100, tier: 'Estimated' },
  },
  'switch-l3': {
    aws: { service: 'VPC + Route Tables', cost: 0, tier: 'Included' },
    azure: { service: 'VNet + Route Tables', cost: 0, tier: 'Included' },
    gcp: { service: 'VPC Routes', cost: 0, tier: 'Included' },
    onprem: { service: 'L3 Switch', cost: 200, tier: 'Estimated' },
  },
  'load-balancer': {
    aws: { service: 'ALB', cost: 22.5, tier: 'Standard' },
    azure: { service: 'Azure Load Balancer', cost: 18, tier: 'Standard' },
    gcp: { service: 'Cloud Load Balancing', cost: 18, tier: 'Standard' },
    onprem: { service: 'Load Balancer', cost: 300, tier: 'Estimated' },
  },
  'sd-wan': {
    aws: { service: 'AWS Cloud WAN', cost: 100, tier: 'Standard' },
    azure: { service: 'Azure Virtual WAN', cost: 328.5, tier: 'Standard' },
    gcp: { service: 'Network Connectivity Center', cost: 50, tier: 'Standard' },
    onprem: { service: 'SD-WAN Appliance', cost: 400, tier: 'Estimated' },
  },
  dns: {
    aws: { service: 'Route 53', cost: 0.5, tier: 'Per Zone' },
    azure: { service: 'Azure DNS', cost: 0.5, tier: 'Per Zone' },
    gcp: { service: 'Cloud DNS', cost: 0.2, tier: 'Per Zone' },
    onprem: { service: 'DNS Server', cost: 50, tier: 'Estimated' },
  },
  cdn: {
    aws: { service: 'CloudFront', cost: 85, tier: '1TB Transfer' },
    azure: { service: 'Azure CDN', cost: 75, tier: '1TB Transfer' },
    gcp: { service: 'Cloud CDN', cost: 80, tier: '1TB Transfer' },
    onprem: { service: 'CDN Service', cost: 100, tier: 'Estimated' },
  },

  // Compute
  'web-server': {
    aws: { service: 'EC2 t3.medium', cost: 30, tier: 'Standard' },
    azure: { service: 'VM B2s', cost: 30, tier: 'Standard' },
    gcp: { service: 'e2-medium', cost: 25, tier: 'Standard' },
    onprem: { service: 'Web Server', cost: 100, tier: 'Estimated' },
  },
  'app-server': {
    aws: { service: 'EC2 t3.large', cost: 60, tier: 'Standard' },
    azure: { service: 'VM B4ms', cost: 60, tier: 'Standard' },
    gcp: { service: 'e2-standard-4', cost: 97, tier: 'Standard' },
    onprem: { service: 'App Server', cost: 150, tier: 'Estimated' },
  },
  'db-server': {
    aws: { service: 'RDS db.t3.medium', cost: 50, tier: 'Standard' },
    azure: { service: 'Azure SQL', cost: 75, tier: 'Standard S0' },
    gcp: { service: 'Cloud SQL', cost: 52, tier: 'db-f1-micro' },
    onprem: { service: 'DB Server', cost: 200, tier: 'Estimated' },
  },
  container: {
    aws: { service: 'Fargate (2vCPU, 4GB)', cost: 58, tier: 'Standard' },
    azure: { service: 'Container Instances', cost: 45, tier: 'Standard' },
    gcp: { service: 'Cloud Run', cost: 40, tier: 'Standard' },
    onprem: { service: 'Container Host', cost: 100, tier: 'Estimated' },
  },
  vm: {
    aws: { service: 'EC2 t3.medium', cost: 30, tier: 'Standard' },
    azure: { service: 'VM B2s', cost: 30, tier: 'Standard' },
    gcp: { service: 'e2-medium', cost: 25, tier: 'Standard' },
    onprem: { service: 'Virtual Machine', cost: 50, tier: 'Estimated' },
  },
  kubernetes: {
    aws: { service: 'EKS Cluster', cost: 72, tier: 'Standard' },
    azure: { service: 'AKS', cost: 0, tier: 'Free Tier' },
    gcp: { service: 'GKE Autopilot', cost: 72, tier: 'Standard' },
    onprem: { service: 'K8s Cluster', cost: 300, tier: 'Estimated' },
  },

  // Cloud
  'aws-vpc': {
    aws: { service: 'VPC', cost: 0, tier: 'Free' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'N/A', cost: 0, tier: 'N/A' },
  },
  'azure-vnet': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'Virtual Network', cost: 0, tier: 'Free' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'N/A', cost: 0, tier: 'N/A' },
  },
  'gcp-network': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'VPC Network', cost: 0, tier: 'Free' },
    onprem: { service: 'N/A', cost: 0, tier: 'N/A' },
  },
  'private-cloud': {
    aws: { service: 'Outposts', cost: 5000, tier: 'Rack' },
    azure: { service: 'Azure Stack', cost: 4000, tier: 'Hub' },
    gcp: { service: 'Anthos', cost: 500, tier: 'Per Cluster' },
    onprem: { service: 'Private Cloud', cost: 2000, tier: 'Estimated' },
  },

  // Storage
  'san-nas': {
    aws: { service: 'FSx', cost: 230, tier: '1TB' },
    azure: { service: 'Azure Files', cost: 100, tier: '1TB Premium' },
    gcp: { service: 'Filestore', cost: 204, tier: '1TB' },
    onprem: { service: 'SAN/NAS', cost: 500, tier: 'Estimated' },
  },
  'object-storage': {
    aws: { service: 'S3', cost: 23, tier: '1TB Standard' },
    azure: { service: 'Blob Storage', cost: 21, tier: '1TB Hot' },
    gcp: { service: 'Cloud Storage', cost: 20, tier: '1TB Standard' },
    onprem: { service: 'Object Storage', cost: 100, tier: 'Estimated' },
  },
  backup: {
    aws: { service: 'AWS Backup', cost: 50, tier: '1TB' },
    azure: { service: 'Azure Backup', cost: 25, tier: '1TB' },
    gcp: { service: 'Backup Service', cost: 30, tier: '1TB' },
    onprem: { service: 'Backup Solution', cost: 100, tier: 'Estimated' },
  },
  cache: {
    aws: { service: 'ElastiCache Redis', cost: 25, tier: 'cache.t3.micro' },
    azure: { service: 'Azure Cache Redis', cost: 16, tier: 'Basic C0' },
    gcp: { service: 'Memorystore', cost: 35, tier: 'Basic 1GB' },
    onprem: { service: 'Redis Server', cost: 50, tier: 'Estimated' },
  },
  storage: {
    aws: { service: 'EBS gp3', cost: 80, tier: '1TB' },
    azure: { service: 'Managed Disk', cost: 77, tier: '1TB Premium SSD' },
    gcp: { service: 'Persistent Disk', cost: 68, tier: '1TB SSD' },
    onprem: { service: 'Storage', cost: 100, tier: 'Estimated' },
  },

  // Auth
  'ldap-ad': {
    aws: { service: 'AWS Directory Service', cost: 109, tier: 'Standard' },
    azure: { service: 'Azure AD DS', cost: 109, tier: 'Standard' },
    gcp: { service: 'Managed AD', cost: 109, tier: 'Standard' },
    onprem: { service: 'Active Directory', cost: 100, tier: 'Estimated' },
  },
  sso: {
    aws: { service: 'AWS IAM Identity Center', cost: 0, tier: 'Free' },
    azure: { service: 'Azure AD SSO', cost: 0, tier: 'Included' },
    gcp: { service: 'Cloud Identity', cost: 0, tier: 'Free Tier' },
    onprem: { service: 'SSO Solution', cost: 200, tier: 'Estimated' },
  },
  mfa: {
    aws: { service: 'AWS MFA', cost: 0, tier: 'Free' },
    azure: { service: 'Azure MFA', cost: 6, tier: 'Per User' },
    gcp: { service: '2-Step Verification', cost: 0, tier: 'Free' },
    onprem: { service: 'MFA Solution', cost: 100, tier: 'Estimated' },
  },
  iam: {
    aws: { service: 'AWS IAM', cost: 0, tier: 'Free' },
    azure: { service: 'Azure AD', cost: 0, tier: 'Free Tier' },
    gcp: { service: 'Cloud IAM', cost: 0, tier: 'Free' },
    onprem: { service: 'IAM Solution', cost: 150, tier: 'Estimated' },
  },

  // External
  user: {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'N/A', cost: 0, tier: 'N/A' },
  },
  internet: {
    aws: { service: 'Data Transfer Out', cost: 90, tier: '1TB' },
    azure: { service: 'Bandwidth', cost: 87, tier: '1TB' },
    gcp: { service: 'Egress', cost: 120, tier: '1TB' },
    onprem: { service: 'Internet', cost: 100, tier: 'Estimated' },
  },
  zone: {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'N/A', cost: 0, tier: 'N/A' },
  },
  // Telecom
  'central-office': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'Central Office', cost: 5000, tier: 'Estimated' },
  },
  'base-station': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'Base Station (gNB)', cost: 10000, tier: 'Estimated' },
  },
  'olt': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'OLT', cost: 3000, tier: 'Estimated' },
  },
  'customer-premise': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'CPE Router', cost: 500, tier: 'Estimated' },
  },
  'idc': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'IDC Colocation', cost: 2000, tier: 'Monthly' },
  },
  // WAN
  'pe-router': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'PE Router', cost: 8000, tier: 'Estimated' },
  },
  'p-router': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'P Router', cost: 15000, tier: 'Estimated' },
  },
  'mpls-network': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'MPLS Service', cost: 3000, tier: 'Monthly' },
  },
  'dedicated-line': {
    aws: { service: 'Direct Connect', cost: 200, tier: '1Gbps' },
    azure: { service: 'ExpressRoute', cost: 250, tier: '1Gbps' },
    gcp: { service: 'Cloud Interconnect', cost: 220, tier: '1Gbps' },
    onprem: { service: 'Dedicated Line', cost: 500, tier: 'Monthly' },
  },
  'metro-ethernet': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'Metro Ethernet', cost: 400, tier: 'Monthly' },
  },
  'corporate-internet': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'Corporate Internet', cost: 300, tier: 'Monthly' },
  },
  'vpn-service': {
    aws: { service: 'Site-to-Site VPN', cost: 36, tier: 'Per connection' },
    azure: { service: 'VPN Gateway', cost: 138, tier: 'VpnGw1' },
    gcp: { service: 'Cloud VPN', cost: 36, tier: 'Per tunnel' },
    onprem: { service: 'MPLS VPN', cost: 800, tier: 'Monthly' },
  },
  'sd-wan-service': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'Virtual WAN', cost: 250, tier: 'Standard' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'SD-WAN Service', cost: 500, tier: 'Monthly' },
  },
  'private-5g': {
    aws: { service: 'Private 5G', cost: 10000, tier: 'Estimated' },
    azure: { service: 'Private 5G Core', cost: 10000, tier: 'Estimated' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'Private 5G', cost: 15000, tier: 'Monthly' },
  },
  'core-network': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'Mobile Core', cost: 20000, tier: 'Estimated' },
  },
  'upf': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'UPF', cost: 5000, tier: 'Estimated' },
  },
  'ring-network': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'Ring Network', cost: 2000, tier: 'Monthly' },
  },
};

/**
 * Detect provider from node type
 */
function detectProvider(nodeType: InfraNodeType): CloudProvider {
  if (nodeType.includes('aws')) return 'aws';
  if (nodeType.includes('azure')) return 'azure';
  if (nodeType.includes('gcp')) return 'gcp';
  return 'aws'; // Default to AWS
}

/**
 * Get category from node type
 */
function getCategory(nodeType: InfraNodeType): string {
  const categories: Record<string, string[]> = {
    security: ['firewall', 'waf', 'ids-ips', 'vpn-gateway', 'nac', 'dlp'],
    network: ['router', 'switch-l2', 'switch-l3', 'load-balancer', 'sd-wan', 'dns', 'cdn'],
    compute: ['web-server', 'app-server', 'db-server', 'container', 'vm', 'kubernetes'],
    cloud: ['aws-vpc', 'azure-vnet', 'gcp-network', 'private-cloud'],
    storage: ['san-nas', 'object-storage', 'backup', 'cache', 'storage'],
    auth: ['ldap-ad', 'sso', 'mfa', 'iam'],
    external: ['user', 'internet', 'zone'],
  };

  for (const [category, types] of Object.entries(categories)) {
    if (types.includes(nodeType)) return category;
  }
  return 'other';
}

/**
 * Estimate infrastructure cost
 */
export function estimateCost(
  spec: InfraSpec,
  options: {
    provider?: CloudProvider;
    currency?: 'USD' | 'KRW';
    multiplier?: number; // For HA, scaling, etc.
  } = {}
): CostBreakdown {
  const {
    provider: defaultProvider = 'aws',
    currency = 'USD',
    multiplier = 1,
  } = options;

  const exchangeRate = currency === 'KRW' ? 1350 : 1;
  const items: CostItem[] = [];
  const byCategory: Record<string, number> = {};
  const byProvider: Record<CloudProvider, number> = {
    aws: 0,
    azure: 0,
    gcp: 0,
    onprem: 0,
  };

  for (const node of spec.nodes) {
    const nodeType = node.type as InfraNodeType;
    const costData = BASE_COSTS[nodeType];

    if (!costData) continue;

    const provider = detectProvider(nodeType) || defaultProvider;
    const providerCost = costData[provider] || costData.aws;

    if (providerCost.cost === 0 && providerCost.tier === 'N/A') continue;

    const monthlyCost = providerCost.cost * multiplier * exchangeRate;
    const hourlyCost = monthlyCost / 730; // Average hours per month

    const item: CostItem = {
      nodeId: node.id,
      nodeType,
      label: node.label,
      provider,
      service: providerCost.service,
      tier: providerCost.tier,
      monthlyCost,
      hourlyCost,
      unit: currency,
    };

    items.push(item);

    // Aggregate by category
    const category = getCategory(nodeType);
    byCategory[category] = (byCategory[category] || 0) + monthlyCost;

    // Aggregate by provider
    byProvider[provider] += monthlyCost;
  }

  const totalMonthlyCost = items.reduce((sum, item) => sum + item.monthlyCost, 0);

  return {
    items,
    totalMonthlyCost,
    totalYearlyCost: totalMonthlyCost * 12,
    byCategory,
    byProvider,
    currency,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Format cost for display
 */
export function formatCost(amount: number, currency: string = 'USD'): string {
  if (currency === 'KRW') {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Generate cost comparison between providers
 */
export function compareCosts(spec: InfraSpec): Record<CloudProvider, CostBreakdown> {
  const providers: CloudProvider[] = ['aws', 'azure', 'gcp', 'onprem'];

  return providers.reduce((acc, provider) => {
    acc[provider] = estimateCost(spec, { provider });
    return acc;
  }, {} as Record<CloudProvider, CostBreakdown>);
}

/**
 * Export cost breakdown to CSV
 */
export function exportCostToCSV(breakdown: CostBreakdown): string {
  const headers = ['Node ID', 'Label', 'Type', 'Provider', 'Service', 'Tier', 'Monthly Cost', 'Hourly Cost'];
  const rows = breakdown.items.map((item) => [
    item.nodeId,
    item.label,
    item.nodeType,
    item.provider,
    item.service,
    item.tier,
    formatCost(item.monthlyCost, breakdown.currency),
    formatCost(item.hourlyCost, breakdown.currency),
  ]);

  // Add totals
  rows.push([]);
  rows.push(['', '', '', '', '', 'Total Monthly', formatCost(breakdown.totalMonthlyCost, breakdown.currency), '']);
  rows.push(['', '', '', '', '', 'Total Yearly', formatCost(breakdown.totalYearlyCost, breakdown.currency), '']);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
