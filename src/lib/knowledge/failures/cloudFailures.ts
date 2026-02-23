/**
 * Cloud Failures (FAIL-CLD-001 ~ FAIL-CLD-006)
 */

import type { FailureScenario } from '../types';
import {
  withSection,
  AWS_WAF_REL,
  AWS_WAF_SEC,
  AWS_WAF_OPS,
  AZURE_CAF,
  GCP_ARCH_FRAMEWORK,
} from '../sourceRegistry';

export const CLOUD_FAILURES: FailureScenario[] = [
  {
    id: 'FAIL-CLD-001',
    type: 'failure',
    component: 'aws-vpc',
    titleKo: 'AZ(가용 영역) 장애',
    scenarioKo:
      '특정 가용 영역(Availability Zone)의 전원, 냉각, 네트워크 장애로 해당 AZ에 배치된 모든 리소스가 중단됩니다. 단일 AZ에만 배치된 서비스는 전면 중단됩니다.',
    impact: 'service-down',
    likelihood: 'low',
    affectedComponents: ['web-server', 'app-server', 'db-server', 'load-balancer'],
    preventionKo: [
      '최소 2개 이상의 AZ에 리소스를 분산 배치합니다',
      'Multi-AZ 로드 밸런서를 사용하여 자동 페일오버를 구성합니다',
      'RDS Multi-AZ 배포 등 관리형 서비스의 다중 AZ 옵션을 활용합니다',
    ],
    mitigationKo: [
      '다른 AZ로 트래픽을 자동 전환합니다',
      '영향받는 AZ의 인스턴스를 다른 AZ에서 재시작합니다',
      'DNS 기반 장애 조치로 가용한 리전으로 전환합니다',
    ],
    estimatedMTTR: '10분~2시간',
    tags: ['cloud', 'availability-zone', 'aws', 'service-down'],
    trust: {
      confidence: 0.85,
      sources: [withSection(AWS_WAF_REL, 'Design for Failure - Multi-AZ')],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-CLD-002',
    type: 'failure',
    component: 'aws-vpc',
    titleKo: 'NAT 게이트웨이 SPOF',
    scenarioKo:
      '단일 NAT 게이트웨이 장애 시 Private Subnet의 모든 아웃바운드 인터넷 통신이 두절됩니다. 소프트웨어 업데이트, 외부 API 호출, 라이센스 인증 등이 불가능해집니다.',
    impact: 'degraded',
    likelihood: 'medium',
    affectedComponents: ['app-server', 'container', 'kubernetes'],
    preventionKo: [
      '각 AZ마다 NAT 게이트웨이를 배치하여 이중화합니다',
      'NAT 게이트웨이 CloudWatch 메트릭을 모니터링합니다',
      '중요 아웃바운드 통신에 VPC Endpoint를 사용하여 NAT 의존성을 줄입니다',
    ],
    mitigationKo: [
      '다른 AZ의 NAT 게이트웨이로 라우팅 테이블을 수정합니다',
      '영향받는 서브넷의 라우팅을 임시로 변경합니다',
      '긴급한 경우 인스턴스를 Public Subnet으로 임시 이동합니다',
    ],
    estimatedMTTR: '5분~30분',
    tags: ['cloud', 'nat', 'spof', 'networking'],
    trust: {
      confidence: 0.85,
      sources: [withSection(AWS_WAF_REL, 'NAT Gateway - High Availability')],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-CLD-003',
    type: 'failure',
    component: 'azure-vnet',
    titleKo: 'VPC 피어링 장애',
    scenarioKo:
      'VPC/VNet 피어링 연결 장애로 피어링된 네트워크 간 통신이 두절됩니다. 마이크로서비스 간 통신, 공유 서비스 접근이 불가능해집니다.',
    impact: 'degraded',
    likelihood: 'low',
    affectedComponents: ['app-server', 'db-server', 'load-balancer'],
    preventionKo: [
      '피어링 연결 상태를 모니터링하고 이상 시 경보를 설정합니다',
      'Transit Gateway/Hub를 통한 중앙 집중식 연결로 관리 복잡도를 줄입니다',
      '핵심 서비스 간에는 피어링 대신 PrivateLink를 사용합니다',
    ],
    mitigationKo: [
      '피어링을 삭제하고 재생성합니다',
      '임시로 VPN 연결을 통한 우회 경로를 구성합니다',
      '영향받는 서비스를 같은 VPC 내로 임시 이동합니다',
    ],
    estimatedMTTR: '10분~1시간',
    tags: ['cloud', 'vpc-peering', 'networking', 'azure'],
    trust: {
      confidence: 0.85,
      sources: [withSection(AZURE_CAF, 'Network Topology - Hub and Spoke')],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-CLD-004',
    type: 'failure',
    component: 'iam',
    titleKo: 'IAM 정책 잠금(Lockout)',
    scenarioKo:
      '잘못된 IAM 정책 변경으로 관리자를 포함한 모든 사용자가 클라우드 리소스에 접근 불가능해집니다. API 호출 실패, 서비스 배포 중단이 연쇄적으로 발생합니다.',
    impact: 'service-down',
    likelihood: 'medium',
    affectedComponents: ['aws-vpc', 'azure-vnet', 'gcp-network', 'app-server'],
    preventionKo: [
      'IAM 정책 변경 시 반드시 시뮬레이션/테스트를 수행합니다',
      '비상 접근용 Break-Glass 계정을 별도 보관합니다',
      'IaC(Terraform 등)로 IAM 정책을 관리하여 롤백을 가능하게 합니다',
    ],
    mitigationKo: [
      'Break-Glass 계정으로 접근하여 정책을 복원합니다',
      'CLI/API를 통해 직접 정책을 수정합니다',
      '클라우드 공급자 지원팀에 긴급 요청합니다',
    ],
    estimatedMTTR: '15분~2시간',
    tags: ['cloud', 'iam', 'lockout', 'access-control'],
    trust: {
      confidence: 0.85,
      sources: [withSection(AWS_WAF_SEC, 'Identity and Access Management')],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-CLD-005',
    type: 'failure',
    component: 'gcp-network',
    titleKo: '서브넷 IP 고갈',
    scenarioKo:
      '서브넷의 가용 IP 주소가 모두 소진되어 새 인스턴스, 컨테이너, ENI를 생성할 수 없게 됩니다. Auto Scaling, 배포, 장애 복구가 모두 차단됩니다.',
    impact: 'degraded',
    likelihood: 'medium',
    affectedComponents: ['container', 'kubernetes', 'app-server', 'load-balancer'],
    preventionKo: [
      '서브넷 IP 사용률을 모니터링하고 70% 임계치에서 경보를 설정합니다',
      'CIDR 블록을 충분히 크게 설계합니다 (/16 이상 VPC, /24 이상 서브넷)',
      '사용하지 않는 ENI, EIP를 정기적으로 정리합니다',
    ],
    mitigationKo: [
      '보조 CIDR 블록을 VPC에 추가합니다',
      '새 서브넷을 생성하고 라우팅을 구성합니다',
      '미사용 리소스의 네트워크 인터페이스를 즉시 해제합니다',
    ],
    estimatedMTTR: '15분~1시간',
    tags: ['cloud', 'subnet', 'ip-exhaustion', 'networking'],
    trust: {
      confidence: 0.85,
      sources: [withSection(GCP_ARCH_FRAMEWORK, 'Networking - VPC Design')],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-CLD-006',
    type: 'failure',
    component: 'private-cloud',
    titleKo: '클라우드 서비스 할당량 초과',
    scenarioKo:
      '클라우드 서비스 할당량(Quota) 초과로 새 리소스 생성이 실패합니다. Auto Scaling, CI/CD 배포, 재해 복구 시 리소스 프로비저닝이 차단됩니다.',
    impact: 'degraded',
    likelihood: 'medium',
    affectedComponents: ['container', 'vm', 'kubernetes', 'app-server'],
    preventionKo: [
      '주요 서비스 할당량 사용률을 정기 모니터링합니다',
      '할당량 80% 도달 시 사전에 증가를 요청합니다',
      '미사용 리소스를 정기적으로 정리하여 할당량을 확보합니다',
    ],
    mitigationKo: [
      '긴급 할당량 증가를 요청합니다',
      '미사용 리소스를 즉시 해제합니다',
      '다른 리전으로 리소스를 분산 배치합니다',
    ],
    estimatedMTTR: '30분~4시간',
    tags: ['cloud', 'quota', 'resource-limit', 'scaling'],
    trust: {
      confidence: 0.85,
      sources: [withSection(AWS_WAF_OPS, 'Service Quotas and Limits')],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
];
