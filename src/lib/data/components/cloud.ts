/**
 * Cloud Components
 * AWS VPC, Azure VNet, GCP Network, Private Cloud
 */

import type { InfraComponent } from './types';

export const cloudComponents: Record<string, InfraComponent> = {
  'aws-vpc': {
    id: 'aws-vpc',
    name: 'AWS VPC',
    nameKo: 'AWS VPC',
    category: 'cloud',
    description: 'Amazon Virtual Private Cloud providing isolated cloud resources within AWS.',
    descriptionKo: 'AWS 내에서 격리된 클라우드 리소스를 제공하는 Amazon 가상 프라이빗 클라우드입니다.',
    functions: [
      'Network isolation',
      'Subnet management',
      'Route table configuration',
      'Internet/NAT gateway',
      'VPC peering',
    ],
    functionsKo: [
      '네트워크 격리',
      '서브넷 관리',
      '라우트 테이블 구성',
      '인터넷/NAT 게이트웨이',
      'VPC 피어링',
    ],
    features: [
      'Security groups',
      'Network ACLs',
      'VPC endpoints',
      'Transit Gateway',
    ],
    featuresKo: [
      '보안 그룹',
      '네트워크 ACL',
      'VPC 엔드포인트',
      '트랜짓 게이트웨이',
    ],
    recommendedPolicies: [
      { name: 'Private Subnets', nameKo: '프라이빗 서브넷', description: 'Place workloads in private subnets', priority: 'critical', category: 'security' },
      { name: 'Security Groups', nameKo: '보안 그룹', description: 'Use least-privilege security groups', priority: 'critical', category: 'access' },
      { name: 'VPC Flow Logs', nameKo: 'VPC 플로우 로그', description: 'Enable VPC flow logs', priority: 'high', category: 'monitoring' },
    ],
    tier: 'internal',
    vendors: ['AWS'],
  },

  'azure-vnet': {
    id: 'azure-vnet',
    name: 'Azure VNet',
    nameKo: 'Azure VNet',
    category: 'cloud',
    description: 'Azure Virtual Network providing isolated network environment in Microsoft Azure.',
    descriptionKo: 'Microsoft Azure에서 격리된 네트워크 환경을 제공하는 Azure 가상 네트워크입니다.',
    functions: [
      'Network isolation',
      'Subnet segmentation',
      'Route tables',
      'VNet peering',
      'Service endpoints',
    ],
    functionsKo: [
      '네트워크 격리',
      '서브넷 분할',
      '라우트 테이블',
      'VNet 피어링',
      '서비스 엔드포인트',
    ],
    features: [
      'Network Security Groups',
      'Application Security Groups',
      'Azure Firewall integration',
      'ExpressRoute support',
    ],
    featuresKo: [
      '네트워크 보안 그룹',
      '애플리케이션 보안 그룹',
      'Azure Firewall 연동',
      'ExpressRoute 지원',
    ],
    recommendedPolicies: [
      { name: 'NSG Rules', nameKo: 'NSG 규칙', description: 'Configure NSG rules per subnet', priority: 'critical', category: 'security' },
      { name: 'Private Endpoints', nameKo: '프라이빗 엔드포인트', description: 'Use private endpoints for PaaS', priority: 'high', category: 'security' },
      { name: 'DDoS Protection', nameKo: 'DDoS 보호', description: 'Enable Azure DDoS Protection', priority: 'high', category: 'security' },
    ],
    tier: 'internal',
    vendors: ['Microsoft Azure'],
  },

  'gcp-network': {
    id: 'gcp-network',
    name: 'GCP Network',
    nameKo: 'GCP 네트워크',
    category: 'cloud',
    description: 'Google Cloud Platform VPC providing global network infrastructure.',
    descriptionKo: '글로벌 네트워크 인프라를 제공하는 Google Cloud Platform VPC입니다.',
    functions: [
      'Global VPC',
      'Subnet management',
      'Cloud NAT',
      'Cloud Router',
      'Shared VPC',
    ],
    functionsKo: [
      '글로벌 VPC',
      '서브넷 관리',
      'Cloud NAT',
      'Cloud Router',
      '공유 VPC',
    ],
    features: [
      'Firewall rules',
      'Private Google Access',
      'VPC Service Controls',
      'Cloud Interconnect',
    ],
    featuresKo: [
      '방화벽 규칙',
      '프라이빗 Google 접근',
      'VPC 서비스 제어',
      'Cloud Interconnect',
    ],
    recommendedPolicies: [
      { name: 'Firewall Rules', nameKo: '방화벽 규칙', description: 'Use target tags for firewall rules', priority: 'critical', category: 'security' },
      { name: 'Private Access', nameKo: '프라이빗 접근', description: 'Enable Private Google Access', priority: 'high', category: 'security' },
      { name: 'VPC Logging', nameKo: 'VPC 로깅', description: 'Enable VPC flow logs', priority: 'high', category: 'monitoring' },
    ],
    tier: 'internal',
    vendors: ['Google Cloud Platform'],
  },

  'private-cloud': {
    id: 'private-cloud',
    name: 'Private Cloud',
    nameKo: '프라이빗 클라우드',
    category: 'cloud',
    description: 'On-premises or dedicated cloud infrastructure providing cloud capabilities with full control.',
    descriptionKo: '완전한 제어가 가능한 클라우드 기능을 제공하는 온프레미스 또는 전용 클라우드 인프라입니다.',
    functions: [
      'Self-service provisioning',
      'Resource pooling',
      'Virtualization',
      'Automated management',
      'Multi-tenancy',
    ],
    functionsKo: [
      '셀프 서비스 프로비저닝',
      '리소스 풀링',
      '가상화',
      '자동화된 관리',
      '멀티 테넌시',
    ],
    features: [
      'Full data sovereignty',
      'Custom security controls',
      'Hardware customization',
      'Regulatory compliance',
    ],
    featuresKo: [
      '완전한 데이터 주권',
      '커스텀 보안 제어',
      '하드웨어 커스터마이징',
      '규제 준수',
    ],
    recommendedPolicies: [
      { name: 'Security Hardening', nameKo: '보안 강화', description: 'Harden all cloud components', priority: 'critical', category: 'security' },
      { name: 'Access Control', nameKo: '접근 제어', description: 'Implement RBAC for cloud management', priority: 'critical', category: 'access' },
      { name: 'Regular Audits', nameKo: '정기 감사', description: 'Conduct security audits', priority: 'high', category: 'compliance' },
    ],
    tier: 'internal',
    vendors: ['VMware vCloud', 'OpenStack', 'Microsoft Azure Stack', 'Nutanix'],
  },
};
