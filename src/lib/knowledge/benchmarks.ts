/**
 * Benchmark Performance Recommendations
 *
 * Traffic-profile-based sizing recommendations, capacity estimation,
 * and bottleneck detection for infrastructure components.
 */

import type { InfraNodeType, InfraSpec } from '@/types/infra';
import type { TrustMetadata, KnowledgeSource } from './types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TrafficTier = 'small' | 'medium' | 'large' | 'enterprise';

export interface TrafficProfile {
  tier: TrafficTier;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  requestsPerSecond: { min: number; max: number };
  concurrentUsers: { min: number; max: number };
}

export interface SizingRecommendation {
  componentType: InfraNodeType;
  recommended: { instanceCount: number; spec: string; specKo: string };
  minimum: { instanceCount: number; spec: string; specKo: string };
  scalingNotes: string;
  scalingNotesKo: string;
  estimatedMonthlyCost?: number;
}

export interface CapacityEstimate {
  currentTier: TrafficTier;
  maxRPS: number;
  bottlenecks: BottleneckInfo[];
  canHandle: Record<TrafficTier, boolean>;
}

export interface BottleneckInfo {
  componentType: InfraNodeType;
  reason: string;
  reasonKo: string;
  maxRPS: number;
  recommendation: string;
  recommendationKo: string;
}

// ---------------------------------------------------------------------------
// Trust helper
// ---------------------------------------------------------------------------

const BENCHMARK_SOURCE: KnowledgeSource = {
  type: 'vendor',
  title: 'Cloud Provider Performance Benchmarks',
  accessedDate: '2026-02-10',
};

const BENCHMARK_TRUST: TrustMetadata = {
  confidence: 0.8,
  sources: [BENCHMARK_SOURCE],
  lastReviewedAt: '2026-02-10',
  upvotes: 0,
  downvotes: 0,
};

// ---------------------------------------------------------------------------
// Traffic Profiles
// ---------------------------------------------------------------------------

export const TRAFFIC_PROFILES: TrafficProfile[] = [
  {
    tier: 'small',
    name: 'Small',
    nameKo: '소규모',
    description: 'Small websites, internal tools, early startups',
    descriptionKo: '소규모 웹사이트, 내부 도구, 초기 스타트업',
    requestsPerSecond: { min: 1, max: 1000 },
    concurrentUsers: { min: 1, max: 500 },
  },
  {
    tier: 'medium',
    name: 'Medium',
    nameKo: '중규모',
    description: 'Growing SaaS, mid-size e-commerce, regional services',
    descriptionKo: '성장하는 SaaS, 중견 전자상거래, 지역 서비스',
    requestsPerSecond: { min: 1000, max: 10000 },
    concurrentUsers: { min: 500, max: 10000 },
  },
  {
    tier: 'large',
    name: 'Large',
    nameKo: '대규모',
    description: 'Enterprise platforms, national services, popular apps',
    descriptionKo: '엔터프라이즈 플랫폼, 전국 서비스, 인기 앱',
    requestsPerSecond: { min: 10000, max: 100000 },
    concurrentUsers: { min: 10000, max: 100000 },
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    nameKo: '엔터프라이즈',
    description: 'Hyperscale platforms, global services, 100K+ RPS',
    descriptionKo: '하이퍼스케일 플랫폼, 글로벌 서비스, 100K+ RPS',
    requestsPerSecond: { min: 100000, max: 1000000 },
    concurrentUsers: { min: 100000, max: 1000000 },
  },
];

// ---------------------------------------------------------------------------
// Sizing Matrix: componentType × trafficTier → recommendation
// ---------------------------------------------------------------------------

interface SizingEntry {
  recommended: { instanceCount: number; spec: string; specKo: string };
  minimum: { instanceCount: number; spec: string; specKo: string };
  scalingNotes: string;
  scalingNotesKo: string;
  estimatedMonthlyCost: number;
  maxRPS: number; // Max RPS this single instance can handle
}

type SizingRow = Record<TrafficTier, SizingEntry>;

export const SIZING_MATRIX: Partial<Record<InfraNodeType, SizingRow>> = {
  'firewall': {
    small: { recommended: { instanceCount: 1, spec: '2 vCPU / 4GB RAM', specKo: '2 vCPU / 4GB RAM' }, minimum: { instanceCount: 1, spec: '1 vCPU / 2GB RAM', specKo: '1 vCPU / 2GB RAM' }, scalingNotes: 'Single instance sufficient', scalingNotesKo: '단일 인스턴스로 충분', estimatedMonthlyCost: 200, maxRPS: 5000 },
    medium: { recommended: { instanceCount: 2, spec: '4 vCPU / 8GB RAM', specKo: '4 vCPU / 8GB RAM' }, minimum: { instanceCount: 1, spec: '4 vCPU / 8GB RAM', specKo: '4 vCPU / 8GB RAM' }, scalingNotes: 'HA pair recommended', scalingNotesKo: 'HA 쌍 권장', estimatedMonthlyCost: 600, maxRPS: 20000 },
    large: { recommended: { instanceCount: 2, spec: '8 vCPU / 16GB RAM', specKo: '8 vCPU / 16GB RAM' }, minimum: { instanceCount: 2, spec: '4 vCPU / 8GB RAM', specKo: '4 vCPU / 8GB RAM' }, scalingNotes: 'Active-active or active-passive HA', scalingNotesKo: '액티브-액티브 또는 액티브-패시브 HA', estimatedMonthlyCost: 1500, maxRPS: 80000 },
    enterprise: { recommended: { instanceCount: 4, spec: '16 vCPU / 32GB RAM', specKo: '16 vCPU / 32GB RAM' }, minimum: { instanceCount: 2, spec: '16 vCPU / 32GB RAM', specKo: '16 vCPU / 32GB RAM' }, scalingNotes: 'Clustered deployment with load distribution', scalingNotesKo: '로드 분산을 통한 클러스터 배포', estimatedMonthlyCost: 4000, maxRPS: 300000 },
  },
  'waf': {
    small: { recommended: { instanceCount: 1, spec: 'Managed WAF (basic)', specKo: '관리형 WAF (기본)' }, minimum: { instanceCount: 1, spec: 'Managed WAF', specKo: '관리형 WAF' }, scalingNotes: 'Cloud-managed WAF sufficient', scalingNotesKo: '클라우드 관리형 WAF로 충분', estimatedMonthlyCost: 100, maxRPS: 10000 },
    medium: { recommended: { instanceCount: 1, spec: 'Managed WAF (standard)', specKo: '관리형 WAF (표준)' }, minimum: { instanceCount: 1, spec: 'Managed WAF', specKo: '관리형 WAF' }, scalingNotes: 'Enable bot protection', scalingNotesKo: '봇 보호 활성화', estimatedMonthlyCost: 300, maxRPS: 50000 },
    large: { recommended: { instanceCount: 2, spec: 'Dedicated WAF appliance', specKo: '전용 WAF 어플라이언스' }, minimum: { instanceCount: 1, spec: 'Managed WAF (premium)', specKo: '관리형 WAF (프리미엄)' }, scalingNotes: 'Multi-region WAF deployment', scalingNotesKo: '멀티 리전 WAF 배포', estimatedMonthlyCost: 1000, maxRPS: 200000 },
    enterprise: { recommended: { instanceCount: 4, spec: 'Distributed WAF cluster', specKo: '분산 WAF 클러스터' }, minimum: { instanceCount: 2, spec: 'Dedicated WAF appliance', specKo: '전용 WAF 어플라이언스' }, scalingNotes: 'Edge WAF with origin protection', scalingNotesKo: '엣지 WAF + 오리진 보호', estimatedMonthlyCost: 3000, maxRPS: 500000 },
  },
  'load-balancer': {
    small: { recommended: { instanceCount: 1, spec: 'Cloud LB (basic)', specKo: '클라우드 LB (기본)' }, minimum: { instanceCount: 1, spec: 'Cloud LB', specKo: '클라우드 LB' }, scalingNotes: 'Single LB sufficient', scalingNotesKo: '단일 LB로 충분', estimatedMonthlyCost: 30, maxRPS: 10000 },
    medium: { recommended: { instanceCount: 2, spec: 'Cloud LB (standard)', specKo: '클라우드 LB (표준)' }, minimum: { instanceCount: 1, spec: 'Cloud LB (standard)', specKo: '클라우드 LB (표준)' }, scalingNotes: 'Multi-AZ deployment', scalingNotesKo: '멀티 AZ 배포', estimatedMonthlyCost: 100, maxRPS: 50000 },
    large: { recommended: { instanceCount: 2, spec: 'Global LB', specKo: '글로벌 LB' }, minimum: { instanceCount: 2, spec: 'Regional LB', specKo: '리전 LB' }, scalingNotes: 'Cross-region load balancing', scalingNotesKo: '교차 리전 로드 밸런싱', estimatedMonthlyCost: 300, maxRPS: 200000 },
    enterprise: { recommended: { instanceCount: 4, spec: 'Global anycast LB', specKo: '글로벌 애니캐스트 LB' }, minimum: { instanceCount: 2, spec: 'Global LB', specKo: '글로벌 LB' }, scalingNotes: 'Anycast + DNS-based global routing', scalingNotesKo: '애니캐스트 + DNS 기반 글로벌 라우팅', estimatedMonthlyCost: 800, maxRPS: 1000000 },
  },
  'web-server': {
    small: { recommended: { instanceCount: 2, spec: '2 vCPU / 4GB RAM', specKo: '2 vCPU / 4GB RAM' }, minimum: { instanceCount: 1, spec: '2 vCPU / 4GB RAM', specKo: '2 vCPU / 4GB RAM' }, scalingNotes: 'At least 2 for availability', scalingNotesKo: '가용성을 위해 최소 2대', estimatedMonthlyCost: 60, maxRPS: 2000 },
    medium: { recommended: { instanceCount: 4, spec: '4 vCPU / 8GB RAM', specKo: '4 vCPU / 8GB RAM' }, minimum: { instanceCount: 2, spec: '4 vCPU / 8GB RAM', specKo: '4 vCPU / 8GB RAM' }, scalingNotes: 'Auto-scaling group', scalingNotesKo: '오토 스케일링 그룹', estimatedMonthlyCost: 240, maxRPS: 8000 },
    large: { recommended: { instanceCount: 8, spec: '8 vCPU / 16GB RAM', specKo: '8 vCPU / 16GB RAM' }, minimum: { instanceCount: 4, spec: '8 vCPU / 16GB RAM', specKo: '8 vCPU / 16GB RAM' }, scalingNotes: 'Multi-AZ with auto-scaling', scalingNotesKo: '멀티 AZ + 오토 스케일링', estimatedMonthlyCost: 800, maxRPS: 50000 },
    enterprise: { recommended: { instanceCount: 20, spec: '16 vCPU / 32GB RAM', specKo: '16 vCPU / 32GB RAM' }, minimum: { instanceCount: 10, spec: '16 vCPU / 32GB RAM', specKo: '16 vCPU / 32GB RAM' }, scalingNotes: 'Containerized + Kubernetes auto-scaling', scalingNotesKo: '컨테이너화 + Kubernetes 오토 스케일링', estimatedMonthlyCost: 4000, maxRPS: 300000 },
  },
  'app-server': {
    small: { recommended: { instanceCount: 2, spec: '2 vCPU / 4GB RAM', specKo: '2 vCPU / 4GB RAM' }, minimum: { instanceCount: 1, spec: '2 vCPU / 4GB RAM', specKo: '2 vCPU / 4GB RAM' }, scalingNotes: 'Stateless design for scaling', scalingNotesKo: '확장을 위한 무상태 설계', estimatedMonthlyCost: 60, maxRPS: 1500 },
    medium: { recommended: { instanceCount: 4, spec: '4 vCPU / 16GB RAM', specKo: '4 vCPU / 16GB RAM' }, minimum: { instanceCount: 2, spec: '4 vCPU / 8GB RAM', specKo: '4 vCPU / 8GB RAM' }, scalingNotes: 'Horizontal scaling with session affinity', scalingNotesKo: '세션 어피니티와 수평 확장', estimatedMonthlyCost: 320, maxRPS: 6000 },
    large: { recommended: { instanceCount: 8, spec: '8 vCPU / 32GB RAM', specKo: '8 vCPU / 32GB RAM' }, minimum: { instanceCount: 4, spec: '8 vCPU / 16GB RAM', specKo: '8 vCPU / 16GB RAM' }, scalingNotes: 'Pod-based auto-scaling in K8s', scalingNotesKo: 'K8s Pod 기반 오토 스케일링', estimatedMonthlyCost: 1200, maxRPS: 40000 },
    enterprise: { recommended: { instanceCount: 20, spec: '16 vCPU / 64GB RAM', specKo: '16 vCPU / 64GB RAM' }, minimum: { instanceCount: 10, spec: '16 vCPU / 32GB RAM', specKo: '16 vCPU / 32GB RAM' }, scalingNotes: 'Microservices + service mesh', scalingNotesKo: '마이크로서비스 + 서비스 메시', estimatedMonthlyCost: 5000, maxRPS: 200000 },
  },
  'db-server': {
    small: { recommended: { instanceCount: 1, spec: '2 vCPU / 8GB RAM / 100GB SSD', specKo: '2 vCPU / 8GB RAM / 100GB SSD' }, minimum: { instanceCount: 1, spec: '2 vCPU / 4GB RAM / 50GB SSD', specKo: '2 vCPU / 4GB RAM / 50GB SSD' }, scalingNotes: 'Single instance with daily backups', scalingNotesKo: '일일 백업을 갖춘 단일 인스턴스', estimatedMonthlyCost: 100, maxRPS: 3000 },
    medium: { recommended: { instanceCount: 2, spec: '4 vCPU / 32GB RAM / 500GB SSD', specKo: '4 vCPU / 32GB RAM / 500GB SSD' }, minimum: { instanceCount: 1, spec: '4 vCPU / 16GB RAM / 200GB SSD', specKo: '4 vCPU / 16GB RAM / 200GB SSD' }, scalingNotes: 'Primary + read replica', scalingNotesKo: '프라이머리 + 읽기 복제본', estimatedMonthlyCost: 500, maxRPS: 15000 },
    large: { recommended: { instanceCount: 3, spec: '16 vCPU / 128GB RAM / 2TB SSD', specKo: '16 vCPU / 128GB RAM / 2TB SSD' }, minimum: { instanceCount: 2, spec: '8 vCPU / 64GB RAM / 1TB SSD', specKo: '8 vCPU / 64GB RAM / 1TB SSD' }, scalingNotes: 'Multi-AZ + read replicas + connection pooling', scalingNotesKo: '멀티 AZ + 읽기 복제본 + 커넥션 풀링', estimatedMonthlyCost: 2000, maxRPS: 50000 },
    enterprise: { recommended: { instanceCount: 5, spec: '64 vCPU / 512GB RAM / 10TB NVMe', specKo: '64 vCPU / 512GB RAM / 10TB NVMe' }, minimum: { instanceCount: 3, spec: '32 vCPU / 256GB RAM / 5TB NVMe', specKo: '32 vCPU / 256GB RAM / 5TB NVMe' }, scalingNotes: 'Sharding + global replication', scalingNotesKo: '샤딩 + 글로벌 복제', estimatedMonthlyCost: 8000, maxRPS: 200000 },
  },
  'cache': {
    small: { recommended: { instanceCount: 1, spec: '2 vCPU / 4GB RAM', specKo: '2 vCPU / 4GB RAM' }, minimum: { instanceCount: 1, spec: '1 vCPU / 2GB RAM', specKo: '1 vCPU / 2GB RAM' }, scalingNotes: 'Single Redis node', scalingNotesKo: '단일 Redis 노드', estimatedMonthlyCost: 50, maxRPS: 50000 },
    medium: { recommended: { instanceCount: 2, spec: '4 vCPU / 16GB RAM', specKo: '4 vCPU / 16GB RAM' }, minimum: { instanceCount: 1, spec: '2 vCPU / 8GB RAM', specKo: '2 vCPU / 8GB RAM' }, scalingNotes: 'Redis Cluster with failover', scalingNotesKo: '페일오버를 갖춘 Redis 클러스터', estimatedMonthlyCost: 200, maxRPS: 200000 },
    large: { recommended: { instanceCount: 6, spec: '8 vCPU / 32GB RAM', specKo: '8 vCPU / 32GB RAM' }, minimum: { instanceCount: 3, spec: '4 vCPU / 16GB RAM', specKo: '4 vCPU / 16GB RAM' }, scalingNotes: 'Redis Cluster with sharding', scalingNotesKo: '샤딩을 갖춘 Redis 클러스터', estimatedMonthlyCost: 800, maxRPS: 1000000 },
    enterprise: { recommended: { instanceCount: 12, spec: '16 vCPU / 64GB RAM', specKo: '16 vCPU / 64GB RAM' }, minimum: { instanceCount: 6, spec: '8 vCPU / 32GB RAM', specKo: '8 vCPU / 32GB RAM' }, scalingNotes: 'Multi-region cache with local reads', scalingNotesKo: '로컬 읽기를 갖춘 멀티 리전 캐시', estimatedMonthlyCost: 3000, maxRPS: 5000000 },
  },
  'dns': {
    small: { recommended: { instanceCount: 1, spec: 'Managed DNS', specKo: '관리형 DNS' }, minimum: { instanceCount: 1, spec: 'Managed DNS', specKo: '관리형 DNS' }, scalingNotes: 'Cloud DNS handles all traffic', scalingNotesKo: '클라우드 DNS가 모든 트래픽 처리', estimatedMonthlyCost: 5, maxRPS: 1000000 },
    medium: { recommended: { instanceCount: 1, spec: 'Managed DNS (premium)', specKo: '관리형 DNS (프리미엄)' }, minimum: { instanceCount: 1, spec: 'Managed DNS', specKo: '관리형 DNS' }, scalingNotes: 'Add health check routing', scalingNotesKo: '상태 확인 라우팅 추가', estimatedMonthlyCost: 25, maxRPS: 1000000 },
    large: { recommended: { instanceCount: 1, spec: 'Managed DNS + Traffic Manager', specKo: '관리형 DNS + 트래픽 관리자' }, minimum: { instanceCount: 1, spec: 'Managed DNS (premium)', specKo: '관리형 DNS (프리미엄)' }, scalingNotes: 'Geo-routing + latency-based routing', scalingNotesKo: '지오 라우팅 + 지연 기반 라우팅', estimatedMonthlyCost: 100, maxRPS: 1000000 },
    enterprise: { recommended: { instanceCount: 1, spec: 'Global DNS + DDoS protection', specKo: '글로벌 DNS + DDoS 보호' }, minimum: { instanceCount: 1, spec: 'Managed DNS + Traffic Manager', specKo: '관리형 DNS + 트래픽 관리자' }, scalingNotes: 'Multi-provider DNS for resilience', scalingNotesKo: '복원력을 위한 멀티 프로바이더 DNS', estimatedMonthlyCost: 300, maxRPS: 1000000 },
  },
  'cdn': {
    small: { recommended: { instanceCount: 1, spec: 'CDN (basic tier)', specKo: 'CDN (기본 티어)' }, minimum: { instanceCount: 1, spec: 'CDN', specKo: 'CDN' }, scalingNotes: 'Minimal edge locations', scalingNotesKo: '최소 엣지 로케이션', estimatedMonthlyCost: 20, maxRPS: 50000 },
    medium: { recommended: { instanceCount: 1, spec: 'CDN (standard)', specKo: 'CDN (표준)' }, minimum: { instanceCount: 1, spec: 'CDN (basic)', specKo: 'CDN (기본)' }, scalingNotes: 'Enable compression + caching headers', scalingNotesKo: '압축 + 캐싱 헤더 활성화', estimatedMonthlyCost: 100, maxRPS: 200000 },
    large: { recommended: { instanceCount: 1, spec: 'CDN (premium + WAF)', specKo: 'CDN (프리미엄 + WAF)' }, minimum: { instanceCount: 1, spec: 'CDN (standard)', specKo: 'CDN (표준)' }, scalingNotes: 'Full edge computing + security', scalingNotesKo: '풀 엣지 컴퓨팅 + 보안', estimatedMonthlyCost: 500, maxRPS: 1000000 },
    enterprise: { recommended: { instanceCount: 1, spec: 'Multi-CDN + edge compute', specKo: '멀티 CDN + 엣지 컴퓨트' }, minimum: { instanceCount: 1, spec: 'CDN (premium)', specKo: 'CDN (프리미엄)' }, scalingNotes: 'Multi-CDN strategy with DNS failover', scalingNotesKo: 'DNS 페일오버를 갖춘 멀티 CDN 전략', estimatedMonthlyCost: 2000, maxRPS: 10000000 },
  },
  'kubernetes': {
    small: { recommended: { instanceCount: 3, spec: '2 vCPU / 4GB RAM nodes', specKo: '2 vCPU / 4GB RAM 노드' }, minimum: { instanceCount: 2, spec: '2 vCPU / 4GB RAM nodes', specKo: '2 vCPU / 4GB RAM 노드' }, scalingNotes: 'Minimum viable K8s cluster', scalingNotesKo: '최소 K8s 클러스터', estimatedMonthlyCost: 150, maxRPS: 5000 },
    medium: { recommended: { instanceCount: 5, spec: '4 vCPU / 16GB RAM nodes', specKo: '4 vCPU / 16GB RAM 노드' }, minimum: { instanceCount: 3, spec: '4 vCPU / 8GB RAM nodes', specKo: '4 vCPU / 8GB RAM 노드' }, scalingNotes: 'Node auto-scaling + HPA', scalingNotesKo: '노드 오토 스케일링 + HPA', estimatedMonthlyCost: 500, maxRPS: 30000 },
    large: { recommended: { instanceCount: 10, spec: '8 vCPU / 32GB RAM nodes', specKo: '8 vCPU / 32GB RAM 노드' }, minimum: { instanceCount: 6, spec: '8 vCPU / 16GB RAM nodes', specKo: '8 vCPU / 16GB RAM 노드' }, scalingNotes: 'Multi-AZ + cluster auto-scaler', scalingNotesKo: '멀티 AZ + 클러스터 오토 스케일러', estimatedMonthlyCost: 2000, maxRPS: 150000 },
    enterprise: { recommended: { instanceCount: 30, spec: '16 vCPU / 64GB RAM nodes', specKo: '16 vCPU / 64GB RAM 노드' }, minimum: { instanceCount: 15, spec: '16 vCPU / 32GB RAM nodes', specKo: '16 vCPU / 32GB RAM 노드' }, scalingNotes: 'Multi-cluster + federation', scalingNotesKo: '멀티 클러스터 + 페더레이션', estimatedMonthlyCost: 10000, maxRPS: 500000 },
  },
  'ids-ips': {
    small: { recommended: { instanceCount: 1, spec: 'Cloud IDS (basic)', specKo: '클라우드 IDS (기본)' }, minimum: { instanceCount: 1, spec: 'Cloud IDS', specKo: '클라우드 IDS' }, scalingNotes: 'Managed IDS sufficient', scalingNotesKo: '관리형 IDS로 충분', estimatedMonthlyCost: 100, maxRPS: 5000 },
    medium: { recommended: { instanceCount: 2, spec: '4 vCPU / 8GB RAM', specKo: '4 vCPU / 8GB RAM' }, minimum: { instanceCount: 1, spec: '4 vCPU / 8GB RAM', specKo: '4 vCPU / 8GB RAM' }, scalingNotes: 'Inline IPS with bypass', scalingNotesKo: '바이패스를 갖춘 인라인 IPS', estimatedMonthlyCost: 400, maxRPS: 20000 },
    large: { recommended: { instanceCount: 2, spec: '8 vCPU / 16GB RAM', specKo: '8 vCPU / 16GB RAM' }, minimum: { instanceCount: 2, spec: '4 vCPU / 8GB RAM', specKo: '4 vCPU / 8GB RAM' }, scalingNotes: 'HA pair with hardware bypass', scalingNotesKo: '하드웨어 바이패스를 갖춘 HA 쌍', estimatedMonthlyCost: 1000, maxRPS: 60000 },
    enterprise: { recommended: { instanceCount: 4, spec: '16 vCPU / 32GB RAM', specKo: '16 vCPU / 32GB RAM' }, minimum: { instanceCount: 2, spec: '16 vCPU / 32GB RAM', specKo: '16 vCPU / 32GB RAM' }, scalingNotes: 'Distributed IPS across segments', scalingNotesKo: '세그먼트에 분산된 IPS', estimatedMonthlyCost: 3000, maxRPS: 200000 },
  },
  'siem': {
    small: { recommended: { instanceCount: 1, spec: 'Cloud SIEM (5GB/day)', specKo: '클라우드 SIEM (5GB/일)' }, minimum: { instanceCount: 1, spec: 'Cloud SIEM (1GB/day)', specKo: '클라우드 SIEM (1GB/일)' }, scalingNotes: 'Cloud-managed SIEM', scalingNotesKo: '클라우드 관리형 SIEM', estimatedMonthlyCost: 200, maxRPS: 1000 },
    medium: { recommended: { instanceCount: 1, spec: 'Cloud SIEM (50GB/day)', specKo: '클라우드 SIEM (50GB/일)' }, minimum: { instanceCount: 1, spec: 'Cloud SIEM (20GB/day)', specKo: '클라우드 SIEM (20GB/일)' }, scalingNotes: 'Add log forwarding from all sources', scalingNotesKo: '모든 소스에서 로그 전달 추가', estimatedMonthlyCost: 1000, maxRPS: 5000 },
    large: { recommended: { instanceCount: 3, spec: '16 vCPU / 64GB RAM (500GB/day)', specKo: '16 vCPU / 64GB RAM (500GB/일)' }, minimum: { instanceCount: 1, spec: 'Cloud SIEM (200GB/day)', specKo: '클라우드 SIEM (200GB/일)' }, scalingNotes: 'SIEM cluster with hot/warm storage', scalingNotesKo: '핫/웜 스토리지를 갖춘 SIEM 클러스터', estimatedMonthlyCost: 5000, maxRPS: 20000 },
    enterprise: { recommended: { instanceCount: 5, spec: '32 vCPU / 128GB RAM (2TB/day)', specKo: '32 vCPU / 128GB RAM (2TB/일)' }, minimum: { instanceCount: 3, spec: '16 vCPU / 64GB RAM (1TB/day)', specKo: '16 vCPU / 64GB RAM (1TB/일)' }, scalingNotes: 'Multi-tier SIEM with data lake', scalingNotesKo: '데이터 레이크를 갖춘 멀티 티어 SIEM', estimatedMonthlyCost: 20000, maxRPS: 50000 },
  },
  'vpn-gateway': {
    small: { recommended: { instanceCount: 1, spec: 'Cloud VPN (basic)', specKo: '클라우드 VPN (기본)' }, minimum: { instanceCount: 1, spec: 'Cloud VPN', specKo: '클라우드 VPN' }, scalingNotes: 'Single tunnel for remote access', scalingNotesKo: '원격 접근을 위한 단일 터널', estimatedMonthlyCost: 50, maxRPS: 3000 },
    medium: { recommended: { instanceCount: 2, spec: 'HA VPN (2 tunnels)', specKo: 'HA VPN (2 터널)' }, minimum: { instanceCount: 1, spec: 'Cloud VPN (standard)', specKo: '클라우드 VPN (표준)' }, scalingNotes: 'Dual tunnel for HA', scalingNotesKo: 'HA를 위한 이중 터널', estimatedMonthlyCost: 150, maxRPS: 10000 },
    large: { recommended: { instanceCount: 2, spec: 'HA VPN + Direct Connect', specKo: 'HA VPN + 전용선' }, minimum: { instanceCount: 2, spec: 'HA VPN (4 tunnels)', specKo: 'HA VPN (4 터널)' }, scalingNotes: 'VPN + Direct Connect hybrid', scalingNotesKo: 'VPN + 전용선 하이브리드', estimatedMonthlyCost: 500, maxRPS: 30000 },
    enterprise: { recommended: { instanceCount: 4, spec: 'SD-WAN + VPN mesh', specKo: 'SD-WAN + VPN 메시' }, minimum: { instanceCount: 2, spec: 'HA VPN + Direct Connect', specKo: 'HA VPN + 전용선' }, scalingNotes: 'SD-WAN overlay with VPN backup', scalingNotesKo: 'VPN 백업을 갖춘 SD-WAN 오버레이', estimatedMonthlyCost: 2000, maxRPS: 100000 },
  },
  'object-storage': {
    small: { recommended: { instanceCount: 1, spec: 'Cloud storage (100GB)', specKo: '클라우드 스토리지 (100GB)' }, minimum: { instanceCount: 1, spec: 'Cloud storage (50GB)', specKo: '클라우드 스토리지 (50GB)' }, scalingNotes: 'Standard tier sufficient', scalingNotesKo: '표준 티어로 충분', estimatedMonthlyCost: 5, maxRPS: 5000 },
    medium: { recommended: { instanceCount: 1, spec: 'Cloud storage (1TB)', specKo: '클라우드 스토리지 (1TB)' }, minimum: { instanceCount: 1, spec: 'Cloud storage (500GB)', specKo: '클라우드 스토리지 (500GB)' }, scalingNotes: 'Lifecycle policies for cost optimization', scalingNotesKo: '비용 최적화를 위한 수명주기 정책', estimatedMonthlyCost: 25, maxRPS: 20000 },
    large: { recommended: { instanceCount: 1, spec: 'Cloud storage (10TB)', specKo: '클라우드 스토리지 (10TB)' }, minimum: { instanceCount: 1, spec: 'Cloud storage (5TB)', specKo: '클라우드 스토리지 (5TB)' }, scalingNotes: 'Multi-region replication', scalingNotesKo: '멀티 리전 복제', estimatedMonthlyCost: 200, maxRPS: 100000 },
    enterprise: { recommended: { instanceCount: 1, spec: 'Cloud storage (100TB+)', specKo: '클라우드 스토리지 (100TB+)' }, minimum: { instanceCount: 1, spec: 'Cloud storage (50TB)', specKo: '클라우드 스토리지 (50TB)' }, scalingNotes: 'Global distribution with CDN', scalingNotesKo: 'CDN을 갖춘 글로벌 배포', estimatedMonthlyCost: 1500, maxRPS: 500000 },
  },
};

// ---------------------------------------------------------------------------
// Query Helpers
// ---------------------------------------------------------------------------

/** Get all traffic profiles */
export function getTrafficProfiles(): TrafficProfile[] {
  return TRAFFIC_PROFILES;
}

/** Get sizing recommendations for a spec at a given traffic tier */
export function recommendSizing(spec: InfraSpec, tier: TrafficTier): SizingRecommendation[] {
  const types = new Set(spec.nodes.map((n) => n.type));
  const recommendations: SizingRecommendation[] = [];

  for (const type of types) {
    const row = SIZING_MATRIX[type];
    if (!row) continue;
    const entry = row[tier];
    recommendations.push({
      componentType: type,
      recommended: entry.recommended,
      minimum: entry.minimum,
      scalingNotes: entry.scalingNotes,
      scalingNotesKo: entry.scalingNotesKo,
      estimatedMonthlyCost: entry.estimatedMonthlyCost,
    });
  }

  return recommendations;
}

/** Estimate current architecture capacity */
export function estimateCapacity(spec: InfraSpec): CapacityEstimate {
  const types = new Set(spec.nodes.map((n) => n.type));
  const typeCounts = new Map<InfraNodeType, number>();
  for (const node of spec.nodes) {
    typeCounts.set(node.type, (typeCounts.get(node.type) ?? 0) + 1);
  }

  // Find the bottleneck (component with lowest maxRPS per instance × count)
  let minTotalRPS = Infinity;
  const bottlenecks: BottleneckInfo[] = [];

  for (const [type, count] of typeCounts) {
    const row = SIZING_MATRIX[type];
    if (!row) continue;

    // Use 'small' tier's maxRPS as baseline per instance
    const perInstanceRPS = row.small.maxRPS;
    const totalRPS = perInstanceRPS * count;

    if (totalRPS < minTotalRPS) {
      minTotalRPS = totalRPS;
    }
  }

  // Find components that are bottlenecks (within 2x of the minimum)
  for (const [type, count] of typeCounts) {
    const row = SIZING_MATRIX[type];
    if (!row) continue;

    const perInstanceRPS = row.small.maxRPS;
    const totalRPS = perInstanceRPS * count;

    if (totalRPS <= minTotalRPS * 2) {
      bottlenecks.push({
        componentType: type,
        reason: `Limited to ~${totalRPS.toLocaleString()} RPS with ${count} instance(s)`,
        reasonKo: `${count}개 인스턴스로 약 ${totalRPS.toLocaleString()} RPS 제한`,
        maxRPS: totalRPS,
        recommendation: `Scale to ${Math.ceil(count * 2)} instances or upgrade specs`,
        recommendationKo: `${Math.ceil(count * 2)}개 인스턴스로 확장하거나 사양 업그레이드`,
      });
    }
  }

  // Sort bottlenecks by maxRPS (lowest first)
  bottlenecks.sort((a, b) => a.maxRPS - b.maxRPS);

  // Determine current tier based on maxRPS
  const effectiveRPS = minTotalRPS === Infinity ? 0 : minTotalRPS;
  const currentTier = determineTier(effectiveRPS);

  return {
    currentTier,
    maxRPS: effectiveRPS,
    bottlenecks,
    canHandle: {
      small: effectiveRPS >= 1000,
      medium: effectiveRPS >= 10000,
      large: effectiveRPS >= 100000,
      enterprise: effectiveRPS >= 1000000,
    },
  };
}

/** Find bottleneck components in the architecture */
export function findBottlenecks(spec: InfraSpec): BottleneckInfo[] {
  return estimateCapacity(spec).bottlenecks;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function determineTier(maxRPS: number): TrafficTier {
  if (maxRPS >= 100000) return 'enterprise';
  if (maxRPS >= 10000) return 'large';
  if (maxRPS >= 1000) return 'medium';
  return 'small';
}
