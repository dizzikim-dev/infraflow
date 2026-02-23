/**
 * Hybrid/Multi-Cloud Failures (FAIL-HYB) + SASE/SOC Failures (FAIL-SASE)
 */

import type { InfraNodeType } from '@/types/infra';
import type { FailureScenario } from '../types';
import {
  withSection,
  NIST_800_53,
  NIST_800_77,
  NIST_800_81,
  NIST_800_207,
  AWS_WAF_REL,
} from '../sourceRegistry';

export const HYBRID_FAILURES: FailureScenario[] = [
  {
    id: 'FAIL-HYB-001',
    type: 'failure',
    component: 'vpn-gateway',
    titleKo: 'Cloud-OnPrem VPN 단절',
    scenarioKo:
      '온프레미스와 클라우드 간 Site-to-Site VPN 터널 장애로 하이브리드 클라우드 통신이 두절됩니다. 온프레미스에서 클라우드 리소스 접근 불가, DR 복제 중단이 발생합니다.',
    impact: 'service-down',
    likelihood: 'medium',
    affectedComponents: ['aws-vpc', 'private-cloud', 'db-server', 'app-server'],
    preventionKo: [
      '이중 VPN 터널(Active-Active)을 구성합니다',
      'Direct Connect/ExpressRoute 전용선을 VPN 백업으로 병행합니다',
      'VPN 터널 상태를 실시간 모니터링하고 자동 재연결을 구성합니다',
    ],
    mitigationKo: [
      '백업 VPN 터널로 자동 페일오버합니다',
      'VPN 터널을 재설정합니다 (IKE rekey)',
      '임시로 인터넷 경유 암호화 통신으로 전환합니다',
    ],
    estimatedMTTR: '5분~30분',
    tags: ['hybrid', 'vpn', 'connectivity', 'onprem-cloud'],
    trust: {
      confidence: 0.95,
      sources: [withSection(NIST_800_77, 'Section 3 - VPN Architecture')],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-HYB-002',
    type: 'failure',
    component: 'private-cloud',
    titleKo: 'DR 전환 실패',
    scenarioKo:
      '재해 복구(DR) 전환 시 데이터 불일치, 네트워크 설정 오류, DNS 전환 실패 등으로 DR 사이트가 정상 동작하지 않습니다. 1차 사이트 장애와 DR 전환 실패가 동시에 발생하여 전면 중단됩니다.',
    impact: 'service-down',
    likelihood: 'low',
    affectedComponents: ['db-server', 'backup', 'dns', 'load-balancer'],
    preventionKo: [
      'DR 전환 테스트를 분기별로 실시합니다',
      'RPO/RTO를 명확히 정의하고 복제 지연을 모니터링합니다',
      'DR 환경의 인프라를 IaC로 관리하여 1차 사이트와 동기화합니다',
    ],
    mitigationKo: [
      'DR 전환 절차를 수동으로 단계별 실행합니다',
      'DNS TTL을 낮추어 빠른 전환을 지원합니다',
      '데이터 정합성을 검증 후 서비스를 개시합니다',
    ],
    estimatedMTTR: '1시간~4시간',
    tags: ['hybrid', 'disaster-recovery', 'failover', 'data-consistency'],
    trust: {
      confidence: 0.85,
      sources: [withSection(AWS_WAF_REL, 'Disaster Recovery Strategies')],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-HYB-003',
    type: 'failure',
    component: 'dns',
    titleKo: '멀티클라우드 DNS 불일치',
    scenarioKo:
      '여러 클라우드 공급자의 DNS 레코드가 동기화되지 않아 서비스 라우팅이 잘못됩니다. 사용자가 비활성 엔드포인트로 라우팅되거나, 특정 리전 사용자만 장애를 겪습니다.',
    impact: 'degraded',
    likelihood: 'medium',
    affectedComponents: ['aws-vpc', 'azure-vnet', 'gcp-network', 'load-balancer'],
    preventionKo: [
      '중앙 DNS 관리 도구(Route53, Cloud DNS 등)를 단일 소스로 사용합니다',
      'DNS 레코드 변경을 IaC로 관리합니다',
      '멀티클라우드 DNS 헬스 체크를 구성합니다',
    ],
    mitigationKo: [
      '잘못된 DNS 레코드를 즉시 수정합니다',
      'DNS 캐시를 플러시하고 TTL을 낮춥니다',
      '영향받는 리전의 트래픽을 정상 엔드포인트로 수동 전환합니다',
    ],
    estimatedMTTR: '10분~1시간',
    tags: ['hybrid', 'dns', 'multi-cloud', 'routing'],
    trust: {
      confidence: 0.85,
      sources: [withSection(NIST_800_81, 'Section 2 - DNS Security')],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-HYB-004',
    type: 'failure',
    component: 'db-server',
    titleKo: '크로스 리전 복제 지연',
    scenarioKo:
      '멀티 리전/멀티 클라우드 간 데이터베이스 복제 지연(Replication Lag)이 증가하여 읽기 복제본의 데이터가 오래됩니다. 지역 간 네트워크 지연, 높은 쓰기 부하가 원인입니다.',
    impact: 'degraded',
    likelihood: 'high',
    affectedComponents: ['app-server', 'cache', 'backup'],
    preventionKo: [
      '복제 지연을 실시간 모니터링하고 임계치 경보를 설정합니다',
      '읽기 트래픽에 적절한 일관성 수준을 설정합니다 (eventual vs strong)',
      '쓰기 부하를 분산하여 복제 부담을 줄입니다',
    ],
    mitigationKo: [
      '읽기 트래픽을 프라이머리로 임시 전환합니다',
      '복제 스트림을 재설정합니다',
      '네트워크 대역폭을 확인하고 복제 전용 경로를 확보합니다',
    ],
    estimatedMTTR: '15분~1시간',
    tags: ['hybrid', 'replication', 'database', 'cross-region'],
    trust: {
      confidence: 0.85,
      sources: [withSection(AWS_WAF_REL, 'Data Replication - Multi-Region')],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
];

// ---------------------------------------------------------------------------
// SASE/SOC Failures (FAIL-SASE-001 ~ FAIL-SASE-003)
// ---------------------------------------------------------------------------

export const SASE_FAILURES: FailureScenario[] = [
  {
    id: 'FAIL-SASE-001',
    type: 'failure',
    titleKo: 'SASE 게이트웨이 PoP 장애',
    scenarioKo: '특정 PoP(Point of Presence)의 장애로 인해 해당 PoP을 통해 접속하던 사용자들의 SASE 서비스가 중단되어 인터넷 접속 및 내부 애플리케이션 접근이 불가능해지는 장애입니다.',
    component: 'sase-gateway' as InfraNodeType,
    impact: 'degraded',
    likelihood: 'medium',
    affectedComponents: ['sase-gateway' as InfraNodeType, 'sd-wan' as InfraNodeType, 'ztna-broker' as InfraNodeType],
    preventionKo: [
      '멀티 PoP 구성으로 단일 장애점 제거',
      'SD-WAN 기반 자동 경로 전환 설정',
      '로컬 브레이크아웃(Direct Internet Access) 폴백 구성',
    ],
    mitigationKo: [
      '자동 PoP 페일오버로 최근접 PoP으로 트래픽 전환',
      'SD-WAN 정책을 통한 트래픽 우회',
      '긴급 시 로컬 인터넷 브레이크아웃 활성화',
    ],
    estimatedMTTR: '5분~30분',
    tags: ['sase', 'pop', 'sd-wan', 'failover'],
    trust: {
      confidence: 0.85,
      sources: [withSection(NIST_800_207, 'Section 4 - Deployment Models')],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-SASE-002',
    type: 'failure',
    titleKo: 'SIEM 로그 수집 과부하',
    scenarioKo: '대량의 보안 이벤트(DDoS 공격, 스캔 활동 등)로 인해 SIEM의 로그 수집 파이프라인이 과부하되어 이벤트 처리 지연이 발생하고, 실시간 위협 탐지 능력이 저하되는 장애입니다.',
    component: 'siem' as InfraNodeType,
    impact: 'degraded',
    likelihood: 'medium',
    affectedComponents: ['siem' as InfraNodeType, 'soar' as InfraNodeType],
    preventionKo: [
      '로그 볼륨 예측 및 용량 계획 수립',
      '로그 사전 필터링 및 우선순위 지정',
      '핫/웜/콜드 스토리지 티어링 구성',
    ],
    mitigationKo: [
      '긴급 로그 필터링으로 중요 이벤트만 수집',
      '백로그 배치 처리로 밀린 로그 소화',
      'SOAR 플레이북으로 자동 대응은 유지하면서 비핵심 로그 지연 처리',
    ],
    estimatedMTTR: '30분~2시간',
    tags: ['siem', 'log-ingestion', 'capacity', 'monitoring'],
    trust: {
      confidence: 0.80,
      sources: [withSection(NIST_800_53, 'AU-4 - Audit Storage Capacity')],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-SASE-003',
    type: 'failure',
    titleKo: 'SOAR 플레이북 연쇄 실패',
    scenarioKo: 'SOAR 플레이북의 외부 도구 연동 실패(API 타임아웃, 인증 만료 등)가 연쇄적으로 후속 플레이북에 영향을 미쳐, 자동 사고 대응이 중단되고 수동 대응으로 전환해야 하는 장애입니다.',
    component: 'soar' as InfraNodeType,
    impact: 'degraded',
    likelihood: 'low',
    affectedComponents: ['soar' as InfraNodeType, 'siem' as InfraNodeType, 'firewall'],
    preventionKo: [
      '플레이북 사전 테스트 환경(샌드박스) 구축',
      '플레이북 실행 타임아웃 및 실패 임계값 설정',
      '수동 승인 필수 단계(Human-in-the-loop) 구성',
    ],
    mitigationKo: [
      '자동 대응 일시 중지 및 수동 모드 전환',
      '실패 플레이북 격리 및 영향 범위 파악',
      '대체 수동 대응 절차(SOP) 즉시 가동',
    ],
    estimatedMTTR: '15분~1시간',
    tags: ['soar', 'playbook', 'automation', 'incident-response'],
    trust: {
      confidence: 0.80,
      sources: [withSection(NIST_800_53, 'IR-4 - Incident Handling')],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
];
