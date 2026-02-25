/**
 * InfraFlow - Cloud Cost Estimator
 *
 * 인프라 아키텍처 기반 클라우드 비용 산출
 */

import type { InfraSpec, InfraNodeType } from '@/types';
import { CLOUD_SERVICES } from '@/lib/knowledge/cloudCatalog';
import type { CloudProvider } from '@/lib/knowledge/cloudCatalog/types';
import { BASE_COSTS } from './costData';

export type CostProvider = CloudProvider | 'onprem';

export interface CostItem {
  nodeId: string;
  nodeType: InfraNodeType;
  label: string;
  provider: CostProvider;
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
  byProvider: Record<CostProvider, number>;
  currency: string;
  generatedAt: string;
}

/**
 * Detect provider from node type
 */
function detectProvider(nodeType: InfraNodeType): CostProvider {
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
    security: ['firewall', 'waf', 'ids-ips', 'vpn-gateway', 'nac', 'dlp', 'sase-gateway', 'ztna-broker', 'casb', 'siem', 'soar'],
    network: ['router', 'switch-l2', 'switch-l3', 'load-balancer', 'sd-wan', 'dns', 'cdn'],
    compute: ['web-server', 'app-server', 'db-server', 'container', 'vm', 'kubernetes'],
    cloud: ['aws-vpc', 'azure-vnet', 'gcp-network', 'private-cloud'],
    storage: ['san-nas', 'object-storage', 'backup', 'cache', 'storage'],
    auth: ['ldap-ad', 'sso', 'mfa', 'iam'],
    external: ['user', 'internet', 'zone'],
    'ai-compute': ['gpu-server', 'ai-accelerator', 'edge-device', 'mobile-device', 'ai-cluster', 'model-registry'],
    'ai-service': ['inference-engine', 'vector-db', 'ai-gateway', 'ai-orchestrator', 'embedding-service', 'training-platform', 'prompt-manager', 'ai-monitor'],
  };

  for (const [category, types] of Object.entries(categories)) {
    if (types.includes(nodeType)) return category;
  }
  return 'other';
}

/**
 * Get cloud service cost from the catalog.
 * Prefers `typicalMonthlyCostUsd` from the cloud catalog over hardcoded BASE_COSTS.
 * Returns undefined if no catalog match is found.
 */
export function getCloudServiceCost(
  nodeType: InfraNodeType,
  provider: CloudProvider,
): { service: string; cost: number; tier: string } | undefined {
  // Find the best matching active service from the catalog
  const matches = CLOUD_SERVICES.filter(
    (s) =>
      s.componentType === nodeType &&
      s.provider === provider &&
      s.status === 'active' &&
      s.typicalMonthlyCostUsd != null,
  );

  if (matches.length === 0) return undefined;

  // Pick the first match (services are ordered by relevance in provider files)
  const svc = matches[0];
  return {
    service: svc.serviceName,
    cost: svc.typicalMonthlyCostUsd!,
    tier: svc.deploymentModel ?? 'Standard',
  };
}

/**
 * Estimate infrastructure cost
 */
export function estimateCost(
  spec: InfraSpec,
  options: {
    provider?: CostProvider;
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
  const byProvider: Record<CostProvider, number> = {
    aws: 0,
    azure: 0,
    gcp: 0,
    ncp: 0,
    kakao: 0,
    kt: 0,
    nhn: 0,
    onprem: 0,
  };

  for (const node of spec.nodes) {
    const nodeType = node.type as InfraNodeType;
    const costData = BASE_COSTS[nodeType];

    if (!costData) continue;

    const provider = detectProvider(nodeType) || defaultProvider;

    // Prefer cloud catalog cost over hardcoded BASE_COSTS
    const catalogCost = provider !== 'onprem'
      ? getCloudServiceCost(nodeType, provider as CloudProvider)
      : undefined;
    const providerCost = catalogCost || (costData as Record<string, { service: string; cost: number; tier: string }>)[provider] || costData.aws;

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
export function compareCosts(spec: InfraSpec): Record<CostProvider, CostBreakdown> {
  const providers: CostProvider[] = ['aws', 'azure', 'gcp', 'ncp', 'kakao', 'kt', 'nhn', 'onprem'];

  return providers.reduce((acc, provider) => {
    acc[provider] = estimateCost(spec, { provider });
    return acc;
  }, {} as Record<CostProvider, CostBreakdown>);
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
