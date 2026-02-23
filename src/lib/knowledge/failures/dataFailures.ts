/**
 * Data/Storage Failures (FAIL-DAT-001 ~ FAIL-DAT-006)
 */

import type { FailureScenario } from '../types';
import {
  withSection,
  NIST_800_53,
  NIST_800_144,
  AWS_WAF_REL,
  AWS_WAF_PERF,
} from '../sourceRegistry';

export const DATA_FAILURES: FailureScenario[] = [
  {
    id: 'FAIL-DAT-001',
    type: 'failure',
    component: 'cache',
    titleKo: '캐시 스탬피드(Cache Stampede)',
    scenarioKo:
      '인기 있는 캐시 키가 동시에 만료되면서 대량의 요청이 동시에 원본 데이터베이스로 쏟아지는 현상. DB에 과부하가 발생하여 응답 지연이 급증하고 연쇄적으로 서비스 전체가 느려집니다.',
    impact: 'degraded',
    likelihood: 'high',
    affectedComponents: ['db-server', 'app-server', 'web-server'],
    preventionKo: [
      '캐시 TTL에 랜덤 지터(jitter)를 추가하여 동시 만료를 방지합니다',
      '핫 키에 대해 락(lock) 기반 갱신 방식을 적용합니다(single-flight)',
      '캐시 사전 워밍(pre-warming)을 구현하여 만료 전 갱신합니다',
    ],
    mitigationKo: [
      '임시로 캐시 TTL을 연장하여 동시 만료를 완화합니다',
      'DB 커넥션 풀을 확장하여 급증하는 쿼리를 처리합니다',
      '서킷 브레이커를 활성화하여 DB 과부하를 방지합니다',
    ],
    estimatedMTTR: '5분~30분',
    tags: ['data', 'cache', 'stampede', 'thundering-herd', 'database-overload'],
    trust: {
      confidence: 0.85,
      sources: [withSection(AWS_WAF_PERF, 'Caching - Best Practices')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-DAT-002',
    type: 'failure',
    component: 'cache',
    titleKo: '캐시 이빅션 스톰(Eviction Storm)',
    scenarioKo:
      '캐시 메모리가 가득 차서 대량의 캐시 항목이 짧은 시간 내에 제거(eviction)됩니다. 캐시 히트율이 급격히 하락하면서 원본 스토리지에 대한 부하가 폭증하고 전체 시스템 성능이 저하됩니다.',
    impact: 'degraded',
    likelihood: 'medium',
    affectedComponents: ['db-server', 'app-server'],
    preventionKo: [
      '캐시 메모리 사용률을 모니터링하고 80% 도달 시 경보를 설정합니다',
      '캐시 이빅션 정책(LRU, LFU)을 워크로드에 맞게 최적화합니다',
      '캐시 클러스터를 확장하여 충분한 메모리를 확보합니다',
    ],
    mitigationKo: [
      '캐시 메모리를 긴급 확장합니다',
      '불필요한 캐시 항목을 식별하여 제거하고 공간을 확보합니다',
      '임시로 캐시 TTL을 줄여 메모리 사용을 최적화합니다',
    ],
    estimatedMTTR: '10분~1시간',
    tags: ['data', 'cache', 'eviction', 'memory', 'hit-rate'],
    trust: {
      confidence: 0.85,
      sources: [withSection(AWS_WAF_PERF, 'Caching - Capacity Planning')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-DAT-003',
    type: 'failure',
    component: 'backup',
    titleKo: '백업 데이터 손상',
    scenarioKo:
      '백업 미디어 결함, 전송 오류, 또는 랜섬웨어 감염으로 백업 데이터가 손상되어 복원이 불가능해집니다. 실제 재해 복구 시점에 백업을 사용할 수 없다는 것이 뒤늦게 발견됩니다.',
    impact: 'data-loss',
    likelihood: 'medium',
    affectedComponents: ['db-server', 'san-nas', 'object-storage'],
    preventionKo: [
      '백업 무결성 검증(체크섬)을 정기적으로 수행합니다',
      '3-2-1 백업 규칙(3개 복사, 2개 매체, 1개 오프사이트)을 적용합니다',
      '백업 복원 훈련을 분기별로 실시합니다',
    ],
    mitigationKo: [
      '이전 정상 백업 세트에서 복원합니다',
      '백업 간 차분 데이터를 수동으로 재구성합니다',
      '트랜잭션 로그를 활용하여 데이터 복구를 시도합니다',
    ],
    estimatedMTTR: '2~12시간',
    tags: ['data', 'backup', 'corruption', 'disaster-recovery', 'data-integrity'],
    trust: {
      confidence: 0.95,
      sources: [withSection(NIST_800_53, 'CP-9 - System Backup')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-DAT-004',
    type: 'failure',
    component: 'san-nas',
    titleKo: '스토리지 IOPS 포화',
    scenarioKo:
      'SAN/NAS 스토리지의 IOPS 한계에 도달하여 디스크 I/O 대기 시간이 급증합니다. 데이터베이스 쿼리 지연, 파일 서비스 타임아웃, VM 성능 저하가 연쇄적으로 발생합니다.',
    impact: 'degraded',
    likelihood: 'medium',
    affectedComponents: ['db-server', 'app-server', 'vm', 'backup'],
    preventionKo: [
      'IOPS 사용률을 모니터링하고 70% 도달 시 경보를 설정합니다',
      '핫 데이터를 SSD 티어에 배치하는 자동 티어링을 구성합니다',
      '읽기 캐시(Read Cache)를 활성화하여 디스크 직접 접근을 줄입니다',
    ],
    mitigationKo: [
      'IOPS를 과도하게 소비하는 워크로드를 식별하여 제한합니다',
      '스토리지 캐시를 임시 확장합니다',
      '비핵심 워크로드를 다른 스토리지로 이동합니다',
    ],
    estimatedMTTR: '30분~2시간',
    tags: ['data', 'storage', 'iops', 'saturation', 'performance'],
    trust: {
      confidence: 0.85,
      sources: [withSection(AWS_WAF_PERF, 'Storage - Performance Optimization')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-DAT-005',
    type: 'failure',
    component: 'object-storage',
    titleKo: '오브젝트 스토리지 접근 지연',
    scenarioKo:
      '클라우드 오브젝트 스토리지(S3, Blob 등)의 API 지연 또는 일시적 장애로 파일 업로드/다운로드가 실패합니다. 정적 콘텐츠 서빙, 로그 저장, 데이터 파이프라인 등 의존 서비스가 영향을 받습니다.',
    impact: 'degraded',
    likelihood: 'medium',
    affectedComponents: ['web-server', 'app-server', 'cdn', 'backup'],
    preventionKo: [
      '오브젝트 스토리지 접근에 재시도 로직과 지수 백오프를 적용합니다',
      '핵심 정적 콘텐츠를 CDN에 캐싱하여 직접 접근을 줄입니다',
      '다중 리전 복제를 구성하여 가용성을 높입니다',
    ],
    mitigationKo: [
      'CDN 캐시를 활용하여 오브젝트 스토리지 접근을 최소화합니다',
      '대체 리전의 오브젝트 스토리지로 트래픽을 전환합니다',
      '비필수 파일 작업을 큐에 저장하고 복구 후 재처리합니다',
    ],
    estimatedMTTR: '15분~2시간',
    tags: ['data', 'object-storage', 'latency', 'cloud', 'availability'],
    trust: {
      confidence: 0.85,
      sources: [withSection(NIST_800_144, 'Section 5 - Cloud Storage Security')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-DAT-006',
    type: 'failure',
    component: 'san-nas',
    titleKo: 'SAN/NAS 페일오버 실패',
    scenarioKo:
      'SAN/NAS의 주 컨트롤러 장애 시 이중화된 보조 컨트롤러로의 자동 페일오버가 실패합니다. 페일오버 설정 오류, 동기화 지연, 또는 보조 컨트롤러의 동시 장애가 원인이며, 스토리지 전체 접근이 불가능해집니다.',
    impact: 'service-down',
    likelihood: 'low',
    affectedComponents: ['db-server', 'app-server', 'vm', 'backup'],
    preventionKo: [
      '페일오버 테스트를 정기적으로 수행합니다(최소 분기별)',
      '주/보조 컨트롤러 간 동기화 상태를 지속적으로 모니터링합니다',
      '펌웨어/소프트웨어 버전을 주/보조 동일하게 유지합니다',
    ],
    mitigationKo: [
      '수동으로 보조 컨트롤러를 활성화합니다',
      '스토리지 접근 경로를 수동으로 재구성합니다',
      '벤더 기술 지원에 긴급 연락하여 복구를 요청합니다',
    ],
    estimatedMTTR: '1~4시간',
    tags: ['data', 'storage', 'failover', 'san-nas', 'high-availability'],
    trust: {
      confidence: 0.9,
      sources: [withSection(AWS_WAF_REL, 'Hardware Failures - Storage Redundancy')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
];
