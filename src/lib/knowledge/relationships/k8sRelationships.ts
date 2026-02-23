/**
 * Kubernetes Relationships (REL-K8S)
 *
 * Kubernetes cluster, container, and orchestration relationships
 */

import type { ComponentRelationship } from '../types';
import {
  CIS_KUBERNETES,
  AWS_WAF_PERF,
  K8S_DOCS,
  CNCF_SECURITY,
  withSection,
} from '../sourceRegistry';

// ---------------------------------------------------------------------------
// Kubernetes Relationships (REL-K8S-001 ~ REL-K8S-006)
// ---------------------------------------------------------------------------

export const k8sRelationships: ComponentRelationship[] = [
  {
    id: 'REL-K8S-001',
    type: 'relationship',
    source: 'kubernetes',
    target: 'firewall',
    relationshipType: 'recommends',
    strength: 'strong',
    direction: 'upstream',
    reason: 'Kubernetes clusters should be protected by network firewalls at the cluster boundary',
    reasonKo: 'Kubernetes 클러스터는 클러스터 경계에서 네트워크 방화벽으로 보호되어야 합니다',
    tags: ['kubernetes', 'firewall', 'cluster-security'],
    trust: {
      confidence: 0.85,
      sources: [withSection(CIS_KUBERNETES, '5.2 - Pod Security Standards')],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'REL-K8S-002',
    type: 'relationship',
    source: 'kubernetes',
    target: 'iam',
    relationshipType: 'recommends',
    strength: 'strong',
    direction: 'downstream',
    reason: 'Kubernetes should integrate with IAM for RBAC, service account management, and pod identity',
    reasonKo: 'Kubernetes는 RBAC, 서비스 계정 관리, 파드 ID를 위해 IAM 통합이 권장됩니다',
    tags: ['kubernetes', 'iam', 'rbac', 'identity'],
    trust: {
      confidence: 0.85,
      sources: [withSection(CNCF_SECURITY, 'Identity and Access Management')],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'REL-K8S-003',
    type: 'relationship',
    source: 'kubernetes',
    target: 'cache',
    relationshipType: 'recommends',
    strength: 'strong',
    direction: 'downstream',
    reason: 'Kubernetes workloads benefit from external cache (Redis/Memcached) for session storage and data caching',
    reasonKo: 'Kubernetes 워크로드는 세션 저장과 데이터 캐싱을 위해 외부 캐시(Redis/Memcached) 사용이 권장됩니다',
    tags: ['kubernetes', 'cache', 'performance', 'session'],
    trust: {
      confidence: 0.85,
      sources: [withSection(AWS_WAF_PERF, 'Caching Strategy')],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'REL-K8S-004',
    type: 'relationship',
    source: 'kubernetes',
    target: 'dns',
    relationshipType: 'recommends',
    strength: 'strong',
    direction: 'downstream',
    reason: 'Kubernetes requires DNS for service discovery (CoreDNS) and external name resolution',
    reasonKo: 'Kubernetes는 서비스 디스커버리(CoreDNS)와 외부 이름 해석을 위해 DNS가 권장됩니다',
    tags: ['kubernetes', 'dns', 'service-discovery', 'coredns'],
    trust: {
      confidence: 0.85,
      sources: [withSection(K8S_DOCS, 'Service Discovery and DNS')],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'REL-K8S-005',
    type: 'relationship',
    source: 'container',
    target: 'load-balancer',
    relationshipType: 'recommends',
    strength: 'strong',
    direction: 'upstream',
    reason: 'Container workloads need load balancers for external traffic routing and health-check-based failover',
    reasonKo: '컨테이너 워크로드는 외부 트래픽 라우팅과 헬스 체크 기반 페일오버를 위해 로드 밸런서가 권장됩니다',
    tags: ['container', 'load-balancer', 'ingress', 'traffic'],
    trust: {
      confidence: 0.85,
      sources: [withSection(CNCF_SECURITY, 'Ingress and Load Balancing')],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'REL-K8S-006',
    type: 'relationship',
    source: 'container',
    target: 'firewall',
    relationshipType: 'recommends',
    strength: 'strong',
    direction: 'upstream',
    reason: 'Containers should be protected by firewalls with network policies for pod-level traffic control',
    reasonKo: '컨테이너는 파드 수준 트래픽 제어를 위해 네트워크 정책이 적용된 방화벽으로 보호되어야 합니다',
    tags: ['container', 'firewall', 'network-policy', 'security'],
    trust: {
      confidence: 0.85,
      sources: [withSection(CNCF_SECURITY, 'Runtime Security - Network Policies')],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
];
