/**
 * Kubernetes Failures (FAIL-K8S-001 ~ FAIL-K8S-004)
 */

import type { FailureScenario } from '../types';
import {
  withSection,
  K8S_DOCS,
  CNCF_SECURITY,
} from '../sourceRegistry';

export const K8S_FAILURES: FailureScenario[] = [
  {
    id: 'FAIL-K8S-001',
    type: 'failure',
    component: 'kubernetes',
    titleKo: 'Control Plane 장애',
    scenarioKo:
      'Kubernetes API 서버, etcd, 스케줄러 등 Control Plane 컴포넌트 장애로 클러스터 관리가 불가능해집니다. 기존 워크로드는 실행 중이지만 새 배포, 스케일링, 복구가 차단됩니다.',
    impact: 'degraded',
    likelihood: 'low',
    affectedComponents: ['container', 'load-balancer', 'app-server'],
    preventionKo: [
      'Control Plane을 다중 노드로 HA 구성합니다 (최소 3 노드)',
      'etcd 클러스터를 정기 백업합니다',
      '관리형 Kubernetes(EKS, GKE, AKS)를 사용하여 Control Plane 관리를 위임합니다',
    ],
    mitigationKo: [
      'etcd 백업으로부터 복구합니다',
      'Control Plane 노드를 재시작하거나 교체합니다',
      '관리형 서비스의 경우 클라우드 공급자 지원을 요청합니다',
    ],
    estimatedMTTR: '15분~2시간',
    tags: ['kubernetes', 'control-plane', 'etcd', 'api-server'],
    trust: {
      confidence: 0.85,
      sources: [withSection(K8S_DOCS, 'Cluster Administration - HA Topology')],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-K8S-002',
    type: 'failure',
    component: 'container',
    titleKo: '이미지 Pull 실패',
    scenarioKo:
      '컨테이너 레지스트리 접근 불가 또는 인증 실패로 파드가 이미지를 Pull하지 못해 ImagePullBackOff 상태에 빠집니다. 신규 배포와 스케일 아웃이 차단됩니다.',
    impact: 'degraded',
    likelihood: 'medium',
    affectedComponents: ['kubernetes', 'app-server'],
    preventionKo: [
      '프라이빗 레지스트리 미러를 구성하여 외부 의존성을 줄입니다',
      'ImagePullSecret을 정기적으로 갱신합니다',
      '핵심 이미지를 클러스터 로컬 레지스트리에 캐시합니다',
    ],
    mitigationKo: [
      '레지스트리 인증 정보(Secret)를 확인하고 갱신합니다',
      '대체 레지스트리로 이미지 소스를 변경합니다',
      '노드의 로컬 이미지 캐시를 활용하여 기존 버전으로 롤백합니다',
    ],
    estimatedMTTR: '5분~30분',
    tags: ['kubernetes', 'container', 'image-pull', 'registry'],
    trust: {
      confidence: 0.85,
      sources: [withSection(CNCF_SECURITY, 'Supply Chain Security - Container Images')],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-K8S-003',
    type: 'failure',
    component: 'kubernetes',
    titleKo: 'PV(Persistent Volume) 고갈',
    scenarioKo:
      '스토리지 클래스의 가용 Persistent Volume이 소진되어 새 PVC(PersistentVolumeClaim)가 Pending 상태에 빠집니다. 상태 저장 워크로드의 배포와 확장이 차단됩니다.',
    impact: 'degraded',
    likelihood: 'medium',
    affectedComponents: ['container', 'db-server', 'cache'],
    preventionKo: [
      'StorageClass에 동적 프로비저닝을 설정합니다',
      'PV 사용률을 모니터링하고 70% 임계치에서 경보를 설정합니다',
      '사용하지 않는 PVC를 정기적으로 정리합니다',
    ],
    mitigationKo: [
      '미사용 PVC를 삭제하여 PV를 회수합니다',
      '스토리지 백엔드의 용량을 확장합니다',
      '긴급한 경우 hostPath 볼륨으로 임시 전환합니다',
    ],
    estimatedMTTR: '15분~1시간',
    tags: ['kubernetes', 'persistent-volume', 'storage', 'capacity'],
    trust: {
      confidence: 0.85,
      sources: [withSection(K8S_DOCS, 'Storage - Persistent Volumes')],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-K8S-004',
    type: 'failure',
    component: 'kubernetes',
    titleKo: '스케줄링 실패',
    scenarioKo:
      '노드 리소스 부족, Taint/Toleration 불일치, Affinity 규칙 충돌 등으로 파드가 스케줄링되지 못하고 Pending 상태에 빠집니다.',
    impact: 'degraded',
    likelihood: 'medium',
    affectedComponents: ['container', 'app-server'],
    preventionKo: [
      'Cluster Autoscaler를 구성하여 노드를 자동 추가합니다',
      'Resource Requests/Limits를 적절히 설정하여 빈 패킹(Bin Packing)을 최적화합니다',
      'PodDisruptionBudget을 설정하여 유지보수 시 가용성을 보장합니다',
    ],
    mitigationKo: [
      '노드를 수동으로 추가합니다',
      '우선순위가 낮은 파드를 축출(Evict)하여 리소스를 확보합니다',
      'Node Affinity/Taint 설정을 검토하고 수정합니다',
    ],
    estimatedMTTR: '5분~30분',
    tags: ['kubernetes', 'scheduling', 'node-resources', 'pending'],
    trust: {
      confidence: 0.85,
      sources: [withSection(K8S_DOCS, 'Scheduling - Resource Management')],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
];
