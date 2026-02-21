import { describe, it, expect } from 'vitest';
import { vendorProductToComparisonItem, cloudServiceToComparisonItem } from '../adapters';
import type { ProductNode } from '@/lib/knowledge/vendorCatalog/types';
import type { CloudService } from '@/lib/knowledge/cloudCatalog/types';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockProduct: ProductNode = {
  nodeId: 'cisco-fp-2130',
  depth: 2,
  depthLabel: 'Model',
  depthLabelKo: '모델',
  name: 'Firepower 2130',
  nameKo: '파이어파워 2130',
  description: 'Mid-range firewall appliance',
  descriptionKo: '중급 방화벽 어플라이언스',
  sourceUrl: 'https://cisco.com/fp2130',
  infraNodeTypes: ['firewall'],
  specs: { 'Throughput': '5 Gbps' },
  pricingInfo: '$10,000 MSRP',
  licensingModel: 'subscription',
  maxThroughput: '5 Gbps',
  formFactor: 'appliance',
  architectureRole: 'Perimeter Firewall',
  architectureRoleKo: '경계 방화벽',
  recommendedFor: ['Branch office', 'Small enterprise'],
  supportedProtocols: ['BGP', 'OSPF'],
  haFeatures: ['Active/Standby'],
  securityCapabilities: ['IPS', 'AVC'],
  operationalComplexity: 'moderate',
  ecosystemMaturity: 'mature',
  disasterRecovery: { multiRegionSupported: false },
  children: [],
};

const mockCloudService: CloudService = {
  id: 'CS-FW-AWS-001',
  provider: 'aws',
  componentType: 'firewall',
  serviceName: 'AWS Network Firewall',
  serviceNameKo: 'AWS 네트워크 방화벽',
  status: 'active',
  features: ['Stateful inspection', 'IDS/IPS'],
  featuresKo: ['상태 기반 검사', 'IDS/IPS'],
  pricingTier: 'medium',
  trust: {
    confidence: 0.85,
    sources: [{ type: 'vendor', title: 'AWS', accessedDate: '2026-01-01' }],
    lastReviewedAt: '2026-01-01',
    upvotes: 0,
    downvotes: 0,
  },
  architectureRole: 'VPC perimeter protection',
  architectureRoleKo: 'VPC 경계 보호',
  recommendedFor: ['VPC security', 'Compliance workloads'],
  typicalMonthlyCostUsd: 350,
  pricingModel: 'pay-as-you-go',
  sla: '99.99%',
  maxCapacity: '100 Gbps',
  securityCapabilities: ['IPS', 'Stateful'],
  complianceCertifications: ['SOC 2', 'HIPAA'],
  deploymentModel: 'managed',
  supportedProtocols: ['TCP', 'UDP'],
  haFeatures: ['Multi-AZ'],
  operationalComplexity: 'simple',
  ecosystemMaturity: 'mature',
  disasterRecovery: { multiRegionSupported: true },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('vendorProductToComparisonItem', () => {
  it('maps all ProductNode fields to ComparisonItem', () => {
    const item = vendorProductToComparisonItem(mockProduct, 'Cisco');

    expect(item.id).toBe('cisco-fp-2130');
    expect(item.source).toBe('vendor');
    expect(item.name).toBe('Firepower 2130');
    expect(item.nameKo).toBe('파이어파워 2130');
    expect(item.vendorName).toBe('Cisco');
    expect(item.cloudProvider).toBeUndefined();
    expect(item.category).toBe('security');
    expect(item.nodeTypes).toEqual(['firewall']);
    expect(item.architectureRole).toBe('Perimeter Firewall');
    expect(item.architectureRoleKo).toBe('경계 방화벽');
    expect(item.recommendedFor).toEqual(['Branch office', 'Small enterprise']);
    expect(item.pricingInfo).toBe('$10,000 MSRP');
    expect(item.licensingModel).toBe('subscription');
    expect(item.maxThroughput).toBe('5 Gbps');
    expect(item.specs).toEqual({ 'Throughput': '5 Gbps' });
    expect(item.formFactor).toBe('appliance');
    expect(item.securityCapabilities).toEqual(['IPS', 'AVC']);
    expect(item.supportedProtocols).toEqual(['BGP', 'OSPF']);
    expect(item.haFeatures).toEqual(['Active/Standby']);
    expect(item.operationalComplexity).toBe('moderate');
    expect(item.ecosystemMaturity).toBe('mature');
    expect(item.disasterRecovery).toEqual({ multiRegionSupported: false });
    // Cloud-only fields are undefined
    expect(item.estimatedMonthlyCost).toBeUndefined();
    expect(item.sla).toBeUndefined();
    expect(item.complianceCertifications).toBeUndefined();
  });

  it('handles product without infraNodeTypes', () => {
    const product: ProductNode = {
      ...mockProduct,
      infraNodeTypes: undefined,
    };
    const item = vendorProductToComparisonItem(product, 'Cisco');

    expect(item.nodeTypes).toEqual([]);
    expect(item.category).toBe('unknown');
  });

  it('handles product with empty infraNodeTypes', () => {
    const product: ProductNode = {
      ...mockProduct,
      infraNodeTypes: [],
    };
    const item = vendorProductToComparisonItem(product, 'Cisco');

    expect(item.nodeTypes).toEqual([]);
    expect(item.category).toBe('unknown');
  });
});

describe('cloudServiceToComparisonItem', () => {
  it('maps all CloudService fields to ComparisonItem', () => {
    const item = cloudServiceToComparisonItem(mockCloudService);

    expect(item.id).toBe('CS-FW-AWS-001');
    expect(item.source).toBe('cloud');
    expect(item.name).toBe('AWS Network Firewall');
    expect(item.nameKo).toBe('AWS 네트워크 방화벽');
    expect(item.cloudProvider).toBe('aws');
    expect(item.vendorName).toBeUndefined();
    expect(item.category).toBe('security');
    expect(item.nodeTypes).toEqual(['firewall']);
    expect(item.architectureRole).toBe('VPC perimeter protection');
    expect(item.architectureRoleKo).toBe('VPC 경계 보호');
    expect(item.recommendedFor).toEqual(['VPC security', 'Compliance workloads']);
    expect(item.estimatedMonthlyCost).toBe(350);
    expect(item.pricingModel).toBe('pay-as-you-go');
    expect(item.sla).toBe('99.99%');
    expect(item.maxCapacity).toBe('100 Gbps');
    expect(item.securityCapabilities).toEqual(['IPS', 'Stateful']);
    expect(item.complianceCertifications).toEqual(['SOC 2', 'HIPAA']);
    expect(item.deploymentModel).toBe('managed');
    expect(item.supportedProtocols).toEqual(['TCP', 'UDP']);
    expect(item.haFeatures).toEqual(['Multi-AZ']);
    expect(item.operationalComplexity).toBe('simple');
    expect(item.ecosystemMaturity).toBe('mature');
    expect(item.disasterRecovery).toEqual({ multiRegionSupported: true });
    // Vendor-only fields are undefined
    expect(item.pricingInfo).toBeUndefined();
    expect(item.licensingModel).toBeUndefined();
    expect(item.maxThroughput).toBeUndefined();
    expect(item.formFactor).toBeUndefined();
  });

  it('handles cloud service with minimal fields', () => {
    const minimal: CloudService = {
      id: 'CS-LB-GCP-001',
      provider: 'gcp',
      componentType: 'load-balancer',
      serviceName: 'Cloud Load Balancing',
      serviceNameKo: '클라우드 로드 밸런싱',
      status: 'active',
      features: ['Global LB'],
      featuresKo: ['글로벌 LB'],
      pricingTier: 'low',
      trust: {
        confidence: 0.85,
        sources: [{ type: 'vendor', title: 'GCP', accessedDate: '2026-01-01' }],
        lastReviewedAt: '2026-01-01',
        upvotes: 0,
        downvotes: 0,
      },
    };
    const item = cloudServiceToComparisonItem(minimal);

    expect(item.id).toBe('CS-LB-GCP-001');
    expect(item.source).toBe('cloud');
    expect(item.category).toBe('network');
    expect(item.nodeTypes).toEqual(['load-balancer']);
    expect(item.architectureRole).toBeUndefined();
    expect(item.estimatedMonthlyCost).toBeUndefined();
  });
});
