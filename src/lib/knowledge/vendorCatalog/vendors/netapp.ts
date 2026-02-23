/**
 * NetApp -- Full Product Catalog
 *
 * Hierarchical product tree covering All-Flash Storage (AFF A-Series, AFF C-Series),
 * Hybrid Storage (FAS), Object Storage (StorageGRID), Cloud Storage
 * (Cloud Volumes ONTAP, FSx for ONTAP, Azure NetApp Files, Google Cloud NetApp Volumes),
 * and Data Management (BlueXP, SnapCenter, ONTAP).
 *
 * Data sourced from https://www.netapp.com/data-storage/
 * Last crawled: 2026-02-23
 */

import type { VendorCatalog } from '../types';

// ---------------------------------------------------------------------------
// NetApp Product Catalog
// ---------------------------------------------------------------------------

export const netappCatalog: VendorCatalog = {
  vendorId: 'netapp',
  vendorName: 'NetApp',
  vendorNameKo: '넷앱',
  headquarters: 'San Jose, CA, USA',
  website: 'https://www.netapp.com',
  productPageUrl: 'https://www.netapp.com/data-storage/',
  depthStructure: ['category', 'product-line', 'series'],
  depthStructureKo: ['카테고리', '제품 라인', '시리즈'],
  lastCrawled: '2026-02-23',
  crawlSource: 'https://www.netapp.com/data-storage/',
  stats: { totalProducts: 38, maxDepth: 2, categoriesCount: 5 },
  products: [
    // =====================================================================
    // 1. All-Flash Storage
    // =====================================================================
    {
      nodeId: 'netapp-all-flash-storage',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'All-Flash Storage',
      nameKo: '올플래시 스토리지',
      description:
        'NetApp all-flash storage arrays delivering sub-millisecond latency for mission-critical enterprise workloads with unified NAS and SAN support',
      descriptionKo:
        '미션 크리티컬 엔터프라이즈 워크로드를 위한 서브밀리초 레이턴시를 제공하는 NetApp 올플래시 스토리지 어레이 (통합 NAS/SAN 지원)',
      sourceUrl: 'https://www.netapp.com/data-storage/all-flash/',
      infraNodeTypes: ['san-nas', 'storage'],
      children: [
        // ── AFF A-Series (Performance Tier) ──
        {
          nodeId: 'netapp-aff-a-series',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'AFF A-Series',
          nameKo: 'AFF A 시리즈',
          description:
            'Performance-optimized all-flash arrays for latency-sensitive enterprise applications including databases, VDI, and AI/ML workloads',
          descriptionKo:
            '데이터베이스, VDI, AI/ML 워크로드 등 레이턴시에 민감한 엔터프라이즈 애플리케이션을 위한 성능 최적화 올플래시 어레이',
          sourceUrl: 'https://www.netapp.com/data-storage/aff-a-series/',
          infraNodeTypes: ['san-nas', 'storage'],
          architectureRole: 'Primary Storage / Data Center Core',
          architectureRoleKo: '주 스토리지 / 데이터센터 코어',
          recommendedFor: [
            'Mission-critical database workloads (Oracle, SQL Server, SAP HANA)',
            'Virtual desktop infrastructure (VDI) with low-latency requirements',
            'AI/ML training and inference data pipelines',
            'Consolidated enterprise SAN and NAS environments',
            'High-frequency trading and financial analytics',
          ],
          recommendedForKo: [
            '미션 크리티컬 데이터베이스 워크로드 (Oracle, SQL Server, SAP HANA)',
            '저지연 요구사항이 있는 가상 데스크톱 인프라(VDI)',
            'AI/ML 학습 및 추론 데이터 파이프라인',
            '통합 엔터프라이즈 SAN 및 NAS 환경',
            '고빈도 트레이딩 및 금융 분석',
          ],
          supportedProtocols: [
            'NFS',
            'SMB/CIFS',
            'iSCSI',
            'FC',
            'FCoE',
            'NVMe-oF',
            'S3',
            'ONTAP API',
          ],
          haFeatures: [
            'Active-Active controllers',
            'MetroCluster',
            'SnapMirror',
            'SyncMirror',
            'RAID-TEC',
            'Non-disruptive upgrades',
          ],
          securityCapabilities: [
            'AES-256 encryption at rest (NSE/NVE)',
            'Multi-admin verification',
            'SnapLock compliance and enterprise WORM',
            'Autonomous ransomware protection',
            'FIPS 140-2 Level 2 certified SEDs',
            'Role-based access control (RBAC)',
          ],
          children: [
            {
              nodeId: 'netapp-aff-a150',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'AFF A150',
              nameKo: 'AFF A150',
              description:
                'Entry-level all-flash array for small enterprise and remote office deployments with unified protocol support',
              descriptionKo:
                '소규모 엔터프라이즈 및 원격 사무소 배포를 위한 통합 프로토콜 지원 엔트리급 올플래시 어레이',
              sourceUrl: 'https://www.netapp.com/data-storage/aff-a-series/',
              lifecycle: 'active',
              formFactor: 'appliance',
              architectureRole: 'Edge / Remote Office Storage',
              architectureRoleKo: '엣지 / 원격 사무소 스토리지',
              recommendedFor: [
                'Small office and branch office file services',
                'Entry-level virtualization storage',
                'Remote office backup and DR target',
              ],
              recommendedForKo: [
                '소규모 사무소 및 지사 파일 서비스',
                '엔트리급 가상화 스토리지',
                '원격 사무소 백업 및 DR 타겟',
              ],
              specs: {
                'Max IOPS': '150,000 (4K random read)',
                'Max Raw Capacity': '184 TB',
                Controllers: 'Dual Active-Active HA pair',
                'Drive Type': 'NVMe SSD',
                'Network Ports': '10GbE, 25GbE',
                'Host Protocols': 'NFS, SMB/CIFS, iSCSI, FC',
                'Form Factor': '2U rack',
                'Power Supply': 'Dual redundant PSU',
                'Max Drives': '24x NVMe SSD',
              },
              children: [],
            },
            {
              nodeId: 'netapp-aff-a250',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'AFF A250',
              nameKo: 'AFF A250',
              description:
                'Mid-market all-flash array delivering high IOPS density for SMB and mid-size enterprise workloads',
              descriptionKo:
                '중소기업 및 중견 엔터프라이즈 워크로드를 위한 높은 IOPS 밀도를 제공하는 미드마켓 올플래시 어레이',
              sourceUrl: 'https://www.netapp.com/data-storage/aff-a-series/',
              lifecycle: 'active',
              formFactor: 'appliance',
              architectureRole: 'Primary Storage / SMB-Mid Enterprise',
              architectureRoleKo: '주 스토리지 / 중소-중견 엔터프라이즈',
              recommendedFor: [
                'Mid-size enterprise database consolidation',
                'Mixed workload SAN/NAS environments',
                'DevOps and CI/CD pipeline storage',
              ],
              recommendedForKo: [
                '중견 기업 데이터베이스 통합',
                '혼합 워크로드 SAN/NAS 환경',
                'DevOps 및 CI/CD 파이프라인 스토리지',
              ],
              specs: {
                'Max IOPS': '400,000 (4K random read)',
                'Max Raw Capacity': '368 TB',
                Controllers: 'Dual Active-Active HA pair',
                'Drive Type': 'NVMe SSD',
                'Network Ports': '10GbE, 25GbE, 100GbE (optional)',
                'Host Protocols': 'NFS, SMB/CIFS, iSCSI, FC 32Gb, NVMe/FC',
                'Form Factor': '2U rack',
                'Power Supply': 'Dual redundant PSU',
                'Max Drives': '48x NVMe SSD (with shelves)',
              },
              children: [],
            },
            {
              nodeId: 'netapp-aff-a400',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'AFF A400',
              nameKo: 'AFF A400',
              description:
                'Mainstream enterprise all-flash array with high availability and unified multi-protocol support for consolidated workloads',
              descriptionKo:
                '통합 워크로드를 위한 고가용성 및 통합 멀티프로토콜 지원을 제공하는 메인스트림 엔터프라이즈 올플래시 어레이',
              sourceUrl: 'https://www.netapp.com/data-storage/aff-a-series/',
              lifecycle: 'active',
              formFactor: 'appliance',
              architectureRole: 'Primary Storage / Enterprise Core',
              architectureRoleKo: '주 스토리지 / 엔터프라이즈 코어',
              recommendedFor: [
                'Enterprise workload consolidation',
                'Multi-protocol unified storage (NAS + SAN)',
                'SAP HANA and large-scale ERP environments',
              ],
              recommendedForKo: [
                '엔터프라이즈 워크로드 통합',
                '멀티프로토콜 통합 스토리지 (NAS + SAN)',
                'SAP HANA 및 대규모 ERP 환경',
              ],
              specs: {
                'Max IOPS': '800,000 (4K random read)',
                'Max Raw Capacity': '2.1 PB',
                Controllers: 'Dual Active-Active HA pair',
                'Drive Type': 'NVMe SSD',
                'Network Ports': '10GbE, 25GbE, 100GbE, 32Gb FC',
                'Host Protocols': 'NFS, SMB/CIFS, iSCSI, FC 32Gb, NVMe/FC, FCoE',
                'Form Factor': '4U rack (controller + shelf)',
                'Power Supply': 'Dual redundant PSU per controller',
                'Max Drives': '144x NVMe SSD (with expansion shelves)',
              },
              children: [],
            },
            {
              nodeId: 'netapp-aff-a800',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'AFF A800',
              nameKo: 'AFF A800',
              description:
                'High-performance all-flash array with end-to-end NVMe for demanding enterprise and cloud-scale workloads',
              descriptionKo:
                '까다로운 엔터프라이즈 및 클라우드 스케일 워크로드를 위한 엔드투엔드 NVMe 고성능 올플래시 어레이',
              sourceUrl: 'https://www.netapp.com/data-storage/aff-a-series/',
              lifecycle: 'active',
              formFactor: 'appliance',
              architectureRole: 'Primary Storage / High-Performance Tier',
              architectureRoleKo: '주 스토리지 / 고성능 티어',
              recommendedFor: [
                'High-performance database and analytics workloads',
                'AI/ML data pipeline storage with NVMe-oF',
                'Large-scale VDI deployments (5,000+ desktops)',
              ],
              recommendedForKo: [
                '고성능 데이터베이스 및 분석 워크로드',
                'NVMe-oF를 활용한 AI/ML 데이터 파이프라인 스토리지',
                '대규모 VDI 배포 (5,000+ 데스크톱)',
              ],
              specs: {
                'Max IOPS': '1,600,000 (4K random read)',
                'Max Raw Capacity': '4.8 PB',
                Controllers: 'Dual Active-Active HA pair',
                'Drive Type': 'NVMe SSD',
                'Network Ports': '100GbE, 32Gb FC, 25GbE',
                'Host Protocols': 'NFS, SMB/CIFS, iSCSI, FC 32Gb, NVMe/FC, NVMe/TCP, FCoE',
                'Form Factor': '4U rack (controller + shelf)',
                'Power Supply': 'Dual redundant PSU per controller',
                'Max Drives': '240x NVMe SSD (with expansion shelves)',
              },
              children: [],
            },
            {
              nodeId: 'netapp-aff-a900',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'AFF A900',
              nameKo: 'AFF A900',
              description:
                'Mission-critical all-flash array with 2.4M IOPS, end-to-end NVMe, and 100GbE connectivity for the most demanding enterprise workloads',
              descriptionKo:
                '가장 까다로운 엔터프라이즈 워크로드를 위한 240만 IOPS, 엔드투엔드 NVMe, 100GbE 연결성을 갖춘 미션 크리티컬 올플래시 어레이',
              sourceUrl: 'https://www.netapp.com/data-storage/aff-a-series/',
              lifecycle: 'active',
              formFactor: 'appliance',
              maxThroughput: '2.4M IOPS (4K random read)',
              architectureRole: 'Primary Storage / Mission-Critical Tier',
              architectureRoleKo: '주 스토리지 / 미션 크리티컬 티어',
              recommendedFor: [
                'Mission-critical Tier-0 database workloads',
                'Large-scale enterprise storage consolidation',
                'Real-time analytics and in-memory computing backends',
              ],
              recommendedForKo: [
                '미션 크리티컬 Tier-0 데이터베이스 워크로드',
                '대규모 엔터프라이즈 스토리지 통합',
                '실시간 분석 및 인메모리 컴퓨팅 백엔드',
              ],
              specs: {
                'Max IOPS': '2,400,000 (4K random read)',
                'Max Throughput': '300 GB/s',
                'Max Raw Capacity': '7.2 PB',
                Controllers: 'Dual Active-Active HA pair (up to 12-node cluster)',
                'Drive Type': 'NVMe SSD',
                'Network Ports': '100GbE, 32Gb FC, 25GbE',
                'Host Protocols': 'NFS, SMB/CIFS, iSCSI, FC 32Gb, NVMe/FC, NVMe/TCP, FCoE, S3',
                'Form Factor': '4U rack (controller + shelf)',
                'Power Supply': 'Dual redundant 1600W PSU per controller',
                'Max Drives': '240x NVMe SSD (with expansion shelves)',
                'MetroCluster Support': 'IP-based MetroCluster for synchronous DR',
              },
              children: [],
            },
          ],
        },

        // ── AFF C-Series (Capacity Tier) ──
        {
          nodeId: 'netapp-aff-c-series',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'AFF C-Series',
          nameKo: 'AFF C 시리즈',
          description:
            'Capacity-optimized all-flash arrays for large-capacity workloads at lower cost per GB while maintaining enterprise-class data services',
          descriptionKo:
            '엔터프라이즈급 데이터 서비스를 유지하면서 낮은 GB당 비용으로 대용량 워크로드를 위한 용량 최적화 올플래시 어레이',
          sourceUrl: 'https://www.netapp.com/data-storage/aff-c-series/',
          infraNodeTypes: ['san-nas', 'storage'],
          architectureRole: 'Secondary Storage / Capacity Tier',
          architectureRoleKo: '보조 스토리지 / 용량 티어',
          recommendedFor: [
            'Large-capacity data lakes and analytics repositories',
            'Warm data tier with all-flash performance',
            'Cost-effective enterprise file services',
            'Video surveillance and media archive storage',
          ],
          recommendedForKo: [
            '대용량 데이터 레이크 및 분석 리포지토리',
            '올플래시 성능을 갖춘 웜 데이터 티어',
            '비용 효율적 엔터프라이즈 파일 서비스',
            '비디오 감시 및 미디어 아카이브 스토리지',
          ],
          supportedProtocols: [
            'NFS',
            'SMB/CIFS',
            'iSCSI',
            'FC',
            'NVMe-oF',
            'S3',
            'ONTAP API',
          ],
          haFeatures: [
            'Active-Active controllers',
            'MetroCluster',
            'SnapMirror',
            'SyncMirror',
            'RAID-TEC',
            'Non-disruptive upgrades',
          ],
          securityCapabilities: [
            'AES-256 encryption at rest (NSE/NVE)',
            'SnapLock WORM compliance',
            'Autonomous ransomware protection',
            'Multi-admin verification',
          ],
          children: [
            {
              nodeId: 'netapp-aff-c250',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'AFF C250',
              nameKo: 'AFF C250',
              description:
                'Entry capacity-flash array providing cost-effective all-flash storage for mid-size capacity-intensive workloads',
              descriptionKo:
                '중규모 용량 집약 워크로드를 위한 비용 효율적 올플래시 스토리지를 제공하는 엔트리 용량 플래시 어레이',
              sourceUrl: 'https://www.netapp.com/data-storage/aff-c-series/',
              lifecycle: 'active',
              formFactor: 'appliance',
              architectureRole: 'Secondary Storage / Capacity Flash Entry',
              architectureRoleKo: '보조 스토리지 / 용량 플래시 엔트리',
              recommendedFor: [
                'Cost-effective file services consolidation',
                'Warm data tier migration from HDD-based arrays',
                'Secondary backup and DR targets',
              ],
              recommendedForKo: [
                '비용 효율적 파일 서비스 통합',
                'HDD 기반 어레이에서 웜 데이터 티어 마이그레이션',
                '보조 백업 및 DR 타겟',
              ],
              specs: {
                'Max IOPS': '200,000 (4K random read)',
                'Max Raw Capacity': '1.1 PB',
                Controllers: 'Dual Active-Active HA pair',
                'Drive Type': 'QLC NVMe SSD',
                'Network Ports': '10GbE, 25GbE',
                'Host Protocols': 'NFS, SMB/CIFS, iSCSI, FC 32Gb',
                'Form Factor': '2U rack',
                'Power Supply': 'Dual redundant PSU',
                'Cost per GB': 'Lower than AFF A-Series (QLC flash)',
              },
              children: [],
            },
            {
              nodeId: 'netapp-aff-c400',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'AFF C400',
              nameKo: 'AFF C400',
              description:
                'Mid-range capacity-flash array balancing performance and capacity for growing enterprise data environments',
              descriptionKo:
                '성장하는 엔터프라이즈 데이터 환경을 위한 성능과 용량의 균형을 제공하는 중급 용량 플래시 어레이',
              sourceUrl: 'https://www.netapp.com/data-storage/aff-c-series/',
              lifecycle: 'active',
              formFactor: 'appliance',
              architectureRole: 'Secondary Storage / Mid-Range Capacity',
              architectureRoleKo: '보조 스토리지 / 중급 용량',
              recommendedFor: [
                'Enterprise data lake and analytics storage',
                'Large-scale NAS consolidation',
                'Hybrid cloud data tiering targets',
              ],
              recommendedForKo: [
                '엔터프라이즈 데이터 레이크 및 분석 스토리지',
                '대규모 NAS 통합',
                '하이브리드 클라우드 데이터 티어링 타겟',
              ],
              specs: {
                'Max IOPS': '500,000 (4K random read)',
                'Max Raw Capacity': '4.8 PB',
                Controllers: 'Dual Active-Active HA pair',
                'Drive Type': 'QLC NVMe SSD',
                'Network Ports': '10GbE, 25GbE, 100GbE, 32Gb FC',
                'Host Protocols': 'NFS, SMB/CIFS, iSCSI, FC 32Gb, NVMe/FC, FCoE',
                'Form Factor': '4U rack (controller + shelf)',
                'Power Supply': 'Dual redundant PSU per controller',
                'Max Drives': '144x QLC NVMe SSD (with expansion shelves)',
              },
              children: [],
            },
            {
              nodeId: 'netapp-aff-c800',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'AFF C800',
              nameKo: 'AFF C800',
              description:
                'High-capacity all-flash array for large-scale capacity workloads requiring enterprise data services at flash economics',
              descriptionKo:
                '플래시 경제성으로 엔터프라이즈 데이터 서비스를 요구하는 대규모 용량 워크로드를 위한 대용량 올플래시 어레이',
              sourceUrl: 'https://www.netapp.com/data-storage/aff-c-series/',
              lifecycle: 'active',
              formFactor: 'appliance',
              architectureRole: 'Secondary Storage / Large Capacity Flash',
              architectureRoleKo: '보조 스토리지 / 대용량 플래시',
              recommendedFor: [
                'Petabyte-scale unstructured data repositories',
                'Media and entertainment content archives',
                'Large-scale backup target with flash performance',
              ],
              recommendedForKo: [
                '페타바이트급 비정형 데이터 리포지토리',
                '미디어 및 엔터테인먼트 콘텐츠 아카이브',
                '플래시 성능의 대규모 백업 타겟',
              ],
              specs: {
                'Max IOPS': '1,000,000 (4K random read)',
                'Max Raw Capacity': '7.2 PB',
                Controllers: 'Dual Active-Active HA pair',
                'Drive Type': 'QLC NVMe SSD',
                'Network Ports': '100GbE, 25GbE, 32Gb FC',
                'Host Protocols': 'NFS, SMB/CIFS, iSCSI, FC 32Gb, NVMe/FC, NVMe/TCP, FCoE, S3',
                'Form Factor': '4U rack (controller + shelf)',
                'Power Supply': 'Dual redundant PSU per controller',
                'Max Drives': '240x QLC NVMe SSD (with expansion shelves)',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 2. Hybrid Storage
    // =====================================================================
    {
      nodeId: 'netapp-hybrid-storage',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Hybrid Storage',
      nameKo: '하이브리드 스토리지',
      description:
        'NetApp hybrid flash/HDD storage arrays providing flexible, cost-effective unified storage for mixed enterprise workloads',
      descriptionKo:
        '혼합 엔터프라이즈 워크로드를 위한 유연하고 비용 효율적인 통합 스토리지를 제공하는 NetApp 하이브리드 플래시/HDD 스토리지 어레이',
      sourceUrl: 'https://www.netapp.com/data-storage/fas/',
      infraNodeTypes: ['san-nas', 'storage'],
      children: [
        // ── FAS Series ──
        {
          nodeId: 'netapp-fas-series',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'FAS Series',
          nameKo: 'FAS 시리즈',
          description:
            'Hybrid flash/HDD unified storage arrays with SSD caching and HDD capacity for cost-sensitive enterprise and backup workloads',
          descriptionKo:
            '비용에 민감한 엔터프라이즈 및 백업 워크로드를 위한 SSD 캐싱 및 HDD 용량을 갖춘 하이브리드 플래시/HDD 통합 스토리지 어레이',
          sourceUrl: 'https://www.netapp.com/data-storage/fas/',
          infraNodeTypes: ['san-nas', 'storage'],
          architectureRole: 'Secondary Storage / Cost-Effective Tier',
          architectureRoleKo: '보조 스토리지 / 비용 효율 티어',
          recommendedFor: [
            'Cost-effective file and block storage for mixed workloads',
            'Backup and archive target with deduplication',
            'Secondary storage tier with tiered caching',
            'Development and test environments',
          ],
          recommendedForKo: [
            '혼합 워크로드를 위한 비용 효율적 파일 및 블록 스토리지',
            '중복 제거를 지원하는 백업 및 아카이브 타겟',
            '티어드 캐싱을 갖춘 보조 스토리지 티어',
            '개발 및 테스트 환경',
          ],
          supportedProtocols: [
            'NFS',
            'SMB/CIFS',
            'iSCSI',
            'FC',
            'FCoE',
            'S3',
            'ONTAP API',
          ],
          haFeatures: [
            'Active-Active controllers',
            'MetroCluster',
            'SnapMirror',
            'SyncMirror',
            'RAID-DP / RAID-TEC',
            'Non-disruptive upgrades',
          ],
          securityCapabilities: [
            'AES-256 encryption at rest (NSE/NVE)',
            'SnapLock WORM compliance',
            'Autonomous ransomware protection',
            'Multi-admin verification',
          ],
          children: [
            {
              nodeId: 'netapp-fas2820',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'FAS2820',
              nameKo: 'FAS2820',
              description:
                'Entry-level hybrid storage for small and medium businesses with SSD caching and unified protocol support',
              descriptionKo:
                'SSD 캐싱 및 통합 프로토콜 지원을 갖춘 중소기업을 위한 엔트리급 하이브리드 스토리지',
              sourceUrl: 'https://www.netapp.com/data-storage/fas/',
              lifecycle: 'active',
              formFactor: 'appliance',
              architectureRole: 'Edge / SMB Storage',
              architectureRoleKo: '엣지 / 중소기업 스토리지',
              recommendedFor: [
                'Small business file and block storage',
                'Branch office unified storage',
                'Development and test environment storage',
              ],
              recommendedForKo: [
                '소규모 비즈니스 파일 및 블록 스토리지',
                '지사 통합 스토리지',
                '개발 및 테스트 환경 스토리지',
              ],
              specs: {
                'Max Raw Capacity': '1.2 PB',
                Controllers: 'Dual Active-Active HA pair',
                'Drive Type': 'SSD cache + SAS/NL-SAS HDD',
                'Network Ports': '10GbE, 25GbE',
                'Host Protocols': 'NFS, SMB/CIFS, iSCSI, FC 16Gb',
                'Form Factor': '2U rack (integrated storage)',
                'Power Supply': 'Dual redundant PSU',
                'SSD Cache': 'Flash Pool for hot data acceleration',
                'Max Drives': '144 (with expansion shelves)',
              },
              children: [],
            },
            {
              nodeId: 'netapp-fas8300',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'FAS8300',
              nameKo: 'FAS8300',
              description:
                'Mid-range hybrid storage array for enterprise workload consolidation with Flash Pool acceleration',
              descriptionKo:
                'Flash Pool 가속을 갖춘 엔터프라이즈 워크로드 통합을 위한 중급 하이브리드 스토리지 어레이',
              sourceUrl: 'https://www.netapp.com/data-storage/fas/',
              lifecycle: 'active',
              formFactor: 'appliance',
              architectureRole: 'Secondary Storage / Mid-Range Enterprise',
              architectureRoleKo: '보조 스토리지 / 중급 엔터프라이즈',
              recommendedFor: [
                'Enterprise backup and archive infrastructure',
                'Mixed workload consolidation with tiering',
                'Secondary database and email storage',
              ],
              recommendedForKo: [
                '엔터프라이즈 백업 및 아카이브 인프라',
                '티어링을 통한 혼합 워크로드 통합',
                '보조 데이터베이스 및 이메일 스토리지',
              ],
              specs: {
                'Max Raw Capacity': '8.6 PB',
                Controllers: 'Dual Active-Active HA pair',
                'Drive Type': 'SSD cache + SAS/NL-SAS HDD',
                'Network Ports': '10GbE, 25GbE, 100GbE, 32Gb FC',
                'Host Protocols': 'NFS, SMB/CIFS, iSCSI, FC 32Gb, FCoE',
                'Form Factor': '3U rack (controller head)',
                'Power Supply': 'Dual redundant PSU',
                'SSD Cache': 'Flash Pool with intelligent caching',
                'Max Drives': '480 (with expansion shelves)',
              },
              children: [],
            },
            {
              nodeId: 'netapp-fas8700',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'FAS8700',
              nameKo: 'FAS8700',
              description:
                'Enterprise hybrid storage array with high-density SSD caching for demanding secondary and consolidated workloads',
              descriptionKo:
                '까다로운 보조 및 통합 워크로드를 위한 고밀도 SSD 캐싱을 갖춘 엔터프라이즈 하이브리드 스토리지 어레이',
              sourceUrl: 'https://www.netapp.com/data-storage/fas/',
              lifecycle: 'active',
              formFactor: 'appliance',
              architectureRole: 'Secondary Storage / Enterprise',
              architectureRoleKo: '보조 스토리지 / 엔터프라이즈',
              recommendedFor: [
                'Large-scale enterprise backup infrastructure',
                'Data warehouse and analytics secondary storage',
                'Multi-site data replication targets',
              ],
              recommendedForKo: [
                '대규모 엔터프라이즈 백업 인프라',
                '데이터 웨어하우스 및 분석 보조 스토리지',
                '멀티사이트 데이터 복제 타겟',
              ],
              specs: {
                'Max Raw Capacity': '17.2 PB',
                Controllers: 'Dual Active-Active HA pair',
                'Drive Type': 'SSD cache + SAS/NL-SAS HDD',
                'Network Ports': '10GbE, 25GbE, 100GbE, 32Gb FC',
                'Host Protocols': 'NFS, SMB/CIFS, iSCSI, FC 32Gb, FCoE',
                'Form Factor': '3U rack (controller head)',
                'Power Supply': 'Dual redundant PSU',
                'SSD Cache': 'Flash Pool with intelligent caching',
                'Max Drives': '960 (with expansion shelves)',
              },
              children: [],
            },
            {
              nodeId: 'netapp-fas9500',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'FAS9500',
              nameKo: 'FAS9500',
              description:
                'Mission-critical hybrid storage platform with maximum scalability for the largest enterprise data center environments',
              descriptionKo:
                '가장 큰 엔터프라이즈 데이터센터 환경을 위한 최대 확장성을 갖춘 미션 크리티컬 하이브리드 스토리지 플랫폼',
              sourceUrl: 'https://www.netapp.com/data-storage/fas/',
              lifecycle: 'active',
              formFactor: 'appliance',
              maxThroughput: '8.4 PB effective capacity per HA pair',
              architectureRole: 'Primary/Secondary Storage / Mission-Critical Hybrid',
              architectureRoleKo: '주/보조 스토리지 / 미션 크리티컬 하이브리드',
              recommendedFor: [
                'Large enterprise data center consolidation',
                'Mission-critical backup and DR infrastructure',
                'Petabyte-scale archive and compliance storage',
              ],
              recommendedForKo: [
                '대형 엔터프라이즈 데이터센터 통합',
                '미션 크리티컬 백업 및 DR 인프라',
                '페타바이트급 아카이브 및 컴플라이언스 스토리지',
              ],
              specs: {
                'Max Raw Capacity': '28.8 PB',
                Controllers: 'Dual Active-Active HA pair (up to 12-node cluster)',
                'Drive Type': 'SSD cache + SAS/NL-SAS HDD',
                'Network Ports': '100GbE, 25GbE, 32Gb FC',
                'Host Protocols': 'NFS, SMB/CIFS, iSCSI, FC 32Gb, FCoE, S3',
                'Form Factor': '4U rack (controller head)',
                'Power Supply': 'Dual redundant 1600W PSU per controller',
                'SSD Cache': 'Flash Pool with intelligent caching',
                'Max Drives': '1,440 (with expansion shelves)',
                'MetroCluster Support': 'IP-based MetroCluster for synchronous DR',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 3. Object Storage
    // =====================================================================
    {
      nodeId: 'netapp-object-storage',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Object Storage',
      nameKo: '오브젝트 스토리지',
      description:
        'NetApp S3-compatible object storage platform for petabyte-scale unstructured data with policy-driven lifecycle management',
      descriptionKo:
        '정책 기반 수명주기 관리를 갖춘 페타바이트급 비정형 데이터를 위한 NetApp S3 호환 오브젝트 스토리지 플랫폼',
      sourceUrl: 'https://www.netapp.com/data-storage/storagegrid/',
      infraNodeTypes: ['object-storage'],
      children: [
        // ── StorageGRID ──
        {
          nodeId: 'netapp-storagegrid-line',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'StorageGRID',
          nameKo: 'StorageGRID',
          description:
            'Software-defined object storage solution providing S3-compatible API with information lifecycle management and erasure coding',
          descriptionKo:
            '정보 수명주기 관리 및 이레이저 코딩을 갖춘 S3 호환 API를 제공하는 소프트웨어 정의 오브젝트 스토리지 솔루션',
          sourceUrl: 'https://www.netapp.com/data-storage/storagegrid/',
          infraNodeTypes: ['object-storage'],
          architectureRole: 'Object Storage Tier / Data Lake',
          architectureRoleKo: '오브젝트 스토리지 티어 / 데이터 레이크',
          recommendedFor: [
            'Petabyte-scale unstructured data repositories',
            'S3-compatible cloud-native application storage',
            'Medical imaging and DICOM archive (HIPAA compliant)',
            'Multi-site geo-distributed object storage',
          ],
          recommendedForKo: [
            '페타바이트급 비정형 데이터 리포지토리',
            'S3 호환 클라우드 네이티브 애플리케이션 스토리지',
            '의료 영상 및 DICOM 아카이브 (HIPAA 준수)',
            '멀티사이트 지리 분산 오브젝트 스토리지',
          ],
          supportedProtocols: ['S3', 'Swift', 'HTTPS', 'ONTAP API'],
          haFeatures: [
            'Multi-site replication',
            'Erasure coding (up to 22+2)',
            'Automated data repair',
            'Non-disruptive upgrades',
          ],
          securityCapabilities: [
            'AES-256 server-side encryption',
            'S3 Object Lock (WORM compliance)',
            'TLS 1.2+ for data in transit',
            'IAM-compatible access policies',
            'FIPS 140-2 compliance mode',
          ],
          children: [
            {
              nodeId: 'netapp-storagegrid',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'StorageGRID',
              nameKo: 'StorageGRID',
              description:
                'S3-compatible software-defined object storage with petabyte-scale ILM, erasure coding, and multi-site geo-distribution',
              descriptionKo:
                '페타바이트급 ILM, 이레이저 코딩 및 멀티사이트 지리 분산을 갖춘 S3 호환 소프트웨어 정의 오브젝트 스토리지',
              sourceUrl: 'https://www.netapp.com/data-storage/storagegrid/',
              lifecycle: 'active',
              formFactor: 'appliance',
              licensingModel: 'subscription',
              architectureRole: 'Object Storage / Data Lake / Archive',
              architectureRoleKo: '오브젝트 스토리지 / 데이터 레이크 / 아카이브',
              recommendedFor: [
                'S3-compatible petabyte-scale object storage',
                'Multi-site data protection with erasure coding',
                'Compliance and regulatory data archive (SEC 17a-4, HIPAA)',
              ],
              recommendedForKo: [
                'S3 호환 페타바이트급 오브젝트 스토리지',
                '이레이저 코딩을 사용한 멀티사이트 데이터 보호',
                '규정 준수 및 규제 데이터 아카이브 (SEC 17a-4, HIPAA)',
              ],
              specs: {
                'Max Scale': 'Petabytes (no hard limit)',
                'Min Cluster': '3 storage nodes + 1 admin node',
                'Data Protection': 'Erasure coding (up to 22+2) and replication',
                'ILM Engine': 'Policy-driven information lifecycle management',
                'S3 Compatibility': 'Full S3 API including Object Lock, versioning, multipart',
                'Deployment Options': 'Bare metal, VM, container, purpose-built appliance (SGF6112)',
                'Multi-Site': 'Active-active geo-distribution across unlimited sites',
                'Network Ports': '10GbE, 25GbE, 100GbE',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 4. Cloud Storage
    // =====================================================================
    {
      nodeId: 'netapp-cloud-storage',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Cloud Storage',
      nameKo: '클라우드 스토리지',
      description:
        'NetApp cloud-based storage services extending ONTAP data management to public cloud environments (AWS, Azure, GCP)',
      descriptionKo:
        'ONTAP 데이터 관리를 퍼블릭 클라우드 환경(AWS, Azure, GCP)으로 확장하는 NetApp 클라우드 기반 스토리지 서비스',
      sourceUrl: 'https://www.netapp.com/cloud-services/',
      infraNodeTypes: ['san-nas', 'storage'],
      children: [
        // ── Cloud Volumes ONTAP ──
        {
          nodeId: 'netapp-cloud-volumes-ontap',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Cloud Volumes ONTAP',
          nameKo: 'Cloud Volumes ONTAP',
          description:
            'ONTAP data management software deployed as cloud-native instances across AWS, Azure, and GCP for hybrid cloud storage',
          descriptionKo:
            '하이브리드 클라우드 스토리지를 위해 AWS, Azure, GCP에 클라우드 네이티브 인스턴스로 배포되는 ONTAP 데이터 관리 소프트웨어',
          sourceUrl: 'https://www.netapp.com/cloud-services/cloud-volumes-ontap/',
          infraNodeTypes: ['san-nas', 'storage'],
          architectureRole: 'Hybrid Cloud Storage / Cloud Extension',
          architectureRoleKo: '하이브리드 클라우드 스토리지 / 클라우드 확장',
          recommendedFor: [
            'Hybrid cloud data mobility with SnapMirror replication',
            'Cloud-based disaster recovery and business continuity',
            'Dev/test environment storage in public cloud',
            'Cloud data tiering and cost optimization',
          ],
          recommendedForKo: [
            'SnapMirror 복제를 통한 하이브리드 클라우드 데이터 이동성',
            '클라우드 기반 재해 복구 및 비즈니스 연속성',
            '퍼블릭 클라우드의 개발/테스트 환경 스토리지',
            '클라우드 데이터 티어링 및 비용 최적화',
          ],
          supportedProtocols: ['NFS', 'SMB/CIFS', 'iSCSI', 'S3', 'ONTAP API'],
          haFeatures: [
            'HA pair with automated failover',
            'SnapMirror cross-region replication',
            'Cloud-native snapshots',
            'Non-disruptive upgrades',
          ],
          securityCapabilities: [
            'AES-256 encryption at rest',
            'In-transit encryption (TLS)',
            'Cloud KMS integration (AWS KMS, Azure Key Vault, GCP CMEK)',
            'SnapLock WORM compliance',
          ],
          children: [
            {
              nodeId: 'netapp-cvo-aws',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'CVO for AWS',
              nameKo: 'CVO for AWS',
              description:
                'ONTAP data management deployed on AWS EC2 with EBS/S3 tiering for hybrid cloud workloads',
              descriptionKo:
                '하이브리드 클라우드 워크로드를 위해 EBS/S3 티어링으로 AWS EC2에 배포되는 ONTAP 데이터 관리',
              sourceUrl: 'https://www.netapp.com/cloud-services/cloud-volumes-ontap/aws/',
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Cloud Storage / AWS Hybrid Extension',
              architectureRoleKo: '클라우드 스토리지 / AWS 하이브리드 확장',
              recommendedFor: [
                'AWS hybrid cloud storage with on-prem replication',
                'Cloud-based DR for ONTAP environments',
                'AWS dev/test with production-like data management',
              ],
              recommendedForKo: [
                '온프레미스 복제를 포함한 AWS 하이브리드 클라우드 스토리지',
                'ONTAP 환경의 클라우드 기반 DR',
                '프로덕션급 데이터 관리의 AWS 개발/테스트',
              ],
              specs: {
                'Cloud Provider': 'AWS',
                'Max Capacity': '2 PB per node (with data tiering to S3)',
                'Deployment': 'EC2 instances (single-node or HA pair)',
                'Data Tiering': 'Automatic cold data tiering to S3',
                'Host Protocols': 'NFS, SMB/CIFS, iSCSI',
                'SnapMirror': 'Cross-region and on-prem replication',
              },
              children: [],
            },
            {
              nodeId: 'netapp-cvo-azure',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'CVO for Azure',
              nameKo: 'CVO for Azure',
              description:
                'ONTAP data management deployed on Azure VMs with managed disk and Blob tiering for hybrid cloud workloads',
              descriptionKo:
                '하이브리드 클라우드 워크로드를 위해 관리형 디스크 및 Blob 티어링으로 Azure VM에 배포되는 ONTAP 데이터 관리',
              sourceUrl: 'https://www.netapp.com/cloud-services/cloud-volumes-ontap/azure/',
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Cloud Storage / Azure Hybrid Extension',
              architectureRoleKo: '클라우드 스토리지 / Azure 하이브리드 확장',
              recommendedFor: [
                'Azure hybrid cloud storage with on-prem replication',
                'Azure-based DR for ONTAP environments',
                'Azure dev/test with enterprise data management',
              ],
              recommendedForKo: [
                '온프레미스 복제를 포함한 Azure 하이브리드 클라우드 스토리지',
                'ONTAP 환경의 Azure 기반 DR',
                '엔터프라이즈 데이터 관리의 Azure 개발/테스트',
              ],
              specs: {
                'Cloud Provider': 'Azure',
                'Max Capacity': '2 PB per node (with data tiering to Blob)',
                'Deployment': 'Azure VMs (single-node or HA pair)',
                'Data Tiering': 'Automatic cold data tiering to Azure Blob Storage',
                'Host Protocols': 'NFS, SMB/CIFS, iSCSI',
                'SnapMirror': 'Cross-region and on-prem replication',
              },
              children: [],
            },
            {
              nodeId: 'netapp-cvo-gcp',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'CVO for GCP',
              nameKo: 'CVO for GCP',
              description:
                'ONTAP data management deployed on GCP Compute Engine with persistent disk and Cloud Storage tiering',
              descriptionKo:
                '영구 디스크 및 Cloud Storage 티어링으로 GCP Compute Engine에 배포되는 ONTAP 데이터 관리',
              sourceUrl: 'https://www.netapp.com/cloud-services/cloud-volumes-ontap/gcp/',
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Cloud Storage / GCP Hybrid Extension',
              architectureRoleKo: '클라우드 스토리지 / GCP 하이브리드 확장',
              recommendedFor: [
                'GCP hybrid cloud storage with on-prem replication',
                'GCP-based DR for ONTAP environments',
                'GCP dev/test with enterprise data management',
              ],
              recommendedForKo: [
                '온프레미스 복제를 포함한 GCP 하이브리드 클라우드 스토리지',
                'ONTAP 환경의 GCP 기반 DR',
                '엔터프라이즈 데이터 관리의 GCP 개발/테스트',
              ],
              specs: {
                'Cloud Provider': 'GCP',
                'Max Capacity': '2 PB per node (with data tiering to Cloud Storage)',
                'Deployment': 'Compute Engine instances (single-node or HA pair)',
                'Data Tiering': 'Automatic cold data tiering to Google Cloud Storage',
                'Host Protocols': 'NFS, SMB/CIFS, iSCSI',
                'SnapMirror': 'Cross-region and on-prem replication',
              },
              children: [],
            },
          ],
        },

        // ── Amazon FSx for NetApp ONTAP ──
        {
          nodeId: 'netapp-fsx-ontap-line',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Amazon FSx for NetApp ONTAP',
          nameKo: 'Amazon FSx for NetApp ONTAP',
          description:
            'AWS fully managed native ONTAP file system service with automatic infrastructure provisioning and ONTAP data management features',
          descriptionKo:
            '자동 인프라 프로비저닝 및 ONTAP 데이터 관리 기능을 갖춘 AWS 완전 관리형 네이티브 ONTAP 파일 시스템 서비스',
          sourceUrl: 'https://aws.amazon.com/fsx/netapp-ontap/',
          infraNodeTypes: ['san-nas', 'storage'],
          architectureRole: 'Cloud-Managed Storage / AWS Native',
          architectureRoleKo: '클라우드 관리형 스토리지 / AWS 네이티브',
          recommendedFor: [
            'AWS-native enterprise file storage with ONTAP features',
            'Lift-and-shift migration of on-prem ONTAP workloads to AWS',
            'EKS/ECS persistent volume storage',
          ],
          recommendedForKo: [
            'ONTAP 기능을 갖춘 AWS 네이티브 엔터프라이즈 파일 스토리지',
            '온프레미스 ONTAP 워크로드의 AWS 리프트 앤 시프트 마이그레이션',
            'EKS/ECS 영구 볼륨 스토리지',
          ],
          supportedProtocols: ['NFS', 'SMB/CIFS', 'iSCSI', 'ONTAP API'],
          haFeatures: [
            'Multi-AZ HA deployment',
            'Automatic failover',
            'SnapMirror replication',
            'AWS-managed backups',
          ],
          securityCapabilities: [
            'AWS KMS encryption at rest',
            'In-transit encryption',
            'VPC integration',
            'IAM access control',
          ],
          children: [
            {
              nodeId: 'netapp-fsx-ontap',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'FSx for ONTAP',
              nameKo: 'FSx for ONTAP',
              description:
                'AWS-managed NetApp ONTAP file system with multi-protocol access, data tiering, and SnapMirror replication',
              descriptionKo:
                '멀티프로토콜 액세스, 데이터 티어링, SnapMirror 복제를 갖춘 AWS 관리형 NetApp ONTAP 파일 시스템',
              sourceUrl: 'https://aws.amazon.com/fsx/netapp-ontap/',
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'as-a-service',
              architectureRole: 'Cloud-Managed Storage / AWS Managed ONTAP',
              architectureRoleKo: '클라우드 관리형 스토리지 / AWS 관리형 ONTAP',
              recommendedFor: [
                'AWS-native enterprise file services',
                'Container persistent storage (EKS/ECS)',
                'Hybrid cloud data mobility with on-prem ONTAP',
              ],
              recommendedForKo: [
                'AWS 네이티브 엔터프라이즈 파일 서비스',
                '컨테이너 영구 스토리지 (EKS/ECS)',
                '온프레미스 ONTAP과의 하이브리드 클라우드 데이터 이동성',
              ],
              specs: {
                'Cloud Provider': 'AWS (fully managed)',
                'Max Capacity': '192 TiB SSD + auto-tiering to S3',
                'Throughput': 'Up to 4 GB/s per file system',
                'Host Protocols': 'NFS v3/v4.x, SMB 2.x/3.x, iSCSI',
                'Data Tiering': 'Automatic SSD to S3 capacity pool',
                'HA Mode': 'Multi-AZ with automatic failover',
              },
              children: [],
            },
          ],
        },

        // ── Azure NetApp Files ──
        {
          nodeId: 'netapp-azure-netapp-files-line',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Azure NetApp Files',
          nameKo: 'Azure NetApp Files',
          description:
            'Azure-native fully managed NetApp file storage service with bare-metal performance and enterprise NFS/SMB capabilities',
          descriptionKo:
            '베어메탈 성능과 엔터프라이즈 NFS/SMB 기능을 갖춘 Azure 네이티브 완전 관리형 NetApp 파일 스토리지 서비스',
          sourceUrl: 'https://azure.microsoft.com/en-us/products/netapp/',
          infraNodeTypes: ['san-nas', 'storage'],
          architectureRole: 'Cloud-Managed Storage / Azure Native',
          architectureRoleKo: '클라우드 관리형 스토리지 / Azure 네이티브',
          recommendedFor: [
            'Azure-native enterprise file shares (NFS/SMB)',
            'SAP HANA on Azure with high-performance storage',
            'Azure VMware Solution (AVS) datastore',
          ],
          recommendedForKo: [
            'Azure 네이티브 엔터프라이즈 파일 공유 (NFS/SMB)',
            '고성능 스토리지를 갖춘 Azure 기반 SAP HANA',
            'Azure VMware Solution (AVS) 데이터스토어',
          ],
          supportedProtocols: ['NFS', 'SMB/CIFS', 'ONTAP API'],
          haFeatures: [
            'Zone-redundant deployment',
            'Cross-region replication',
            'Azure-managed snapshots',
          ],
          securityCapabilities: [
            'Azure-managed encryption at rest',
            'VNET integration',
            'Azure Active Directory integration',
          ],
          children: [
            {
              nodeId: 'netapp-azure-netapp-files',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'Azure NetApp Files',
              nameKo: 'Azure NetApp Files',
              description:
                'Azure-managed bare-metal NetApp storage delivering sub-millisecond latency NFS/SMB file services',
              descriptionKo:
                '서브밀리초 레이턴시 NFS/SMB 파일 서비스를 제공하는 Azure 관리형 베어메탈 NetApp 스토리지',
              sourceUrl: 'https://azure.microsoft.com/en-us/products/netapp/',
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'as-a-service',
              architectureRole: 'Cloud-Managed Storage / Azure Managed NetApp',
              architectureRoleKo: '클라우드 관리형 스토리지 / Azure 관리형 NetApp',
              recommendedFor: [
                'Azure-native high-performance file services',
                'SAP and Oracle database storage on Azure',
                'Azure VMware Solution external datastore',
              ],
              recommendedForKo: [
                'Azure 네이티브 고성능 파일 서비스',
                'Azure 기반 SAP 및 Oracle 데이터베이스 스토리지',
                'Azure VMware Solution 외부 데이터스토어',
              ],
              specs: {
                'Cloud Provider': 'Azure (fully managed)',
                'Performance Tiers': 'Standard, Premium, Ultra',
                'Max Throughput': 'Up to 4,500 MiB/s (Ultra tier)',
                'Host Protocols': 'NFS v3/v4.1, SMB 2.x/3.x',
                'Data Protection': 'Snapshots, cross-region replication',
                'HA Mode': 'Zone-redundant with automatic failover',
              },
              children: [],
            },
          ],
        },

        // ── Google Cloud NetApp Volumes ──
        {
          nodeId: 'netapp-gcp-netapp-volumes-line',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Google Cloud NetApp Volumes',
          nameKo: 'Google Cloud NetApp Volumes',
          description:
            'GCP-native fully managed NetApp file storage service for enterprise NFS/SMB workloads on Google Cloud',
          descriptionKo:
            'Google Cloud에서 엔터프라이즈 NFS/SMB 워크로드를 위한 GCP 네이티브 완전 관리형 NetApp 파일 스토리지 서비스',
          sourceUrl: 'https://cloud.google.com/netapp/volumes',
          infraNodeTypes: ['san-nas', 'storage'],
          architectureRole: 'Cloud-Managed Storage / GCP Native',
          architectureRoleKo: '클라우드 관리형 스토리지 / GCP 네이티브',
          recommendedFor: [
            'GCP-native enterprise file shares',
            'GKE persistent volume storage',
            'Linux and Windows workload storage on GCP',
          ],
          recommendedForKo: [
            'GCP 네이티브 엔터프라이즈 파일 공유',
            'GKE 영구 볼륨 스토리지',
            'GCP 기반 Linux 및 Windows 워크로드 스토리지',
          ],
          supportedProtocols: ['NFS', 'SMB/CIFS', 'ONTAP API'],
          haFeatures: [
            'Regional high availability',
            'Snapshot-based data protection',
            'Cross-region replication',
          ],
          securityCapabilities: [
            'Google-managed encryption at rest',
            'VPC Service Controls',
            'IAM access control',
          ],
          children: [
            {
              nodeId: 'netapp-gcp-netapp-volumes',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'Google Cloud NetApp Volumes',
              nameKo: 'Google Cloud NetApp Volumes',
              description:
                'GCP-managed NetApp storage service providing enterprise NFS/SMB file services with built-in data protection',
              descriptionKo:
                '내장 데이터 보호 기능을 갖춘 엔터프라이즈 NFS/SMB 파일 서비스를 제공하는 GCP 관리형 NetApp 스토리지 서비스',
              sourceUrl: 'https://cloud.google.com/netapp/volumes',
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'as-a-service',
              architectureRole: 'Cloud-Managed Storage / GCP Managed NetApp',
              architectureRoleKo: '클라우드 관리형 스토리지 / GCP 관리형 NetApp',
              recommendedFor: [
                'GCP-native high-performance NFS/SMB file services',
                'GKE persistent volume provisioning',
                'Hybrid cloud data mobility with on-prem ONTAP',
              ],
              recommendedForKo: [
                'GCP 네이티브 고성능 NFS/SMB 파일 서비스',
                'GKE 영구 볼륨 프로비저닝',
                '온프레미스 ONTAP과의 하이브리드 클라우드 데이터 이동성',
              ],
              specs: {
                'Cloud Provider': 'GCP (fully managed)',
                'Performance Tiers': 'Standard, Premium, Extreme',
                'Max Throughput': 'Up to 4,500 MiB/s (Extreme tier)',
                'Host Protocols': 'NFS v3/v4.1, SMB 2.x/3.x',
                'Data Protection': 'Snapshots, cross-region replication',
                'HA Mode': 'Regional high availability',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 5. Data Management
    // =====================================================================
    {
      nodeId: 'netapp-data-management',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Data Management',
      nameKo: '데이터 관리',
      description:
        'NetApp data management and orchestration software for unified storage operations, backup, and hybrid cloud control',
      descriptionKo:
        '통합 스토리지 운영, 백업 및 하이브리드 클라우드 제어를 위한 NetApp 데이터 관리 및 오케스트레이션 소프트웨어',
      sourceUrl: 'https://www.netapp.com/data-management/',
      infraNodeTypes: ['storage', 'backup'],
      children: [
        // ── BlueXP ──
        {
          nodeId: 'netapp-bluexp-line',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'BlueXP',
          nameKo: 'BlueXP',
          description:
            'Unified hybrid multi-cloud control plane for managing all NetApp storage across on-premises, edge, and cloud environments',
          descriptionKo:
            '온프레미스, 엣지, 클라우드 환경 전반의 모든 NetApp 스토리지를 관리하는 통합 하이브리드 멀티클라우드 컨트롤 플레인',
          sourceUrl: 'https://www.netapp.com/bluexp/',
          infraNodeTypes: ['storage'],
          architectureRole: 'Management Plane / Hybrid Cloud Orchestration',
          architectureRoleKo: '관리 플레인 / 하이브리드 클라우드 오케스트레이션',
          recommendedFor: [
            'Unified management of on-prem and cloud NetApp storage',
            'Hybrid cloud data mobility orchestration',
            'Storage provisioning and lifecycle automation',
          ],
          recommendedForKo: [
            '온프레미스 및 클라우드 NetApp 스토리지 통합 관리',
            '하이브리드 클라우드 데이터 이동성 오케스트레이션',
            '스토리지 프로비저닝 및 수명주기 자동화',
          ],
          supportedProtocols: ['HTTPS', 'ONTAP API', 'REST API'],
          haFeatures: [
            'SaaS-based with 99.9% uptime SLA',
            'Multi-region control plane availability',
          ],
          securityCapabilities: [
            'SSO integration',
            'Role-based access control (RBAC)',
            'Audit logging',
            'OAuth 2.0 authentication',
          ],
          children: [
            {
              nodeId: 'netapp-bluexp',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'NetApp BlueXP',
              nameKo: 'NetApp BlueXP',
              description:
                'SaaS-based unified control plane for discovering, managing, and orchestrating all NetApp storage resources across hybrid multi-cloud',
              descriptionKo:
                '하이브리드 멀티클라우드 전반의 모든 NetApp 스토리지 리소스를 검색, 관리 및 오케스트레이션하는 SaaS 기반 통합 컨트롤 플레인',
              sourceUrl: 'https://www.netapp.com/bluexp/',
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Management / Unified Control Plane',
              architectureRoleKo: '관리 / 통합 컨트롤 플레인',
              recommendedFor: [
                'Centralized NetApp estate management',
                'Hybrid multi-cloud storage orchestration',
                'Automated data protection policy management',
              ],
              recommendedForKo: [
                '중앙 집중식 NetApp 인프라 관리',
                '하이브리드 멀티클라우드 스토리지 오케스트레이션',
                '자동화된 데이터 보호 정책 관리',
              ],
              specs: {
                'Deployment Model': 'SaaS (cloud-hosted)',
                'Managed Resources': 'ONTAP, StorageGRID, CVO, FSx, ANF, GCNV',
                'Capabilities': 'Discover, provision, protect, tier, classify, remediate',
                'Cloud Support': 'AWS, Azure, GCP',
                'API Access': 'REST API with OpenAPI spec',
                'Authentication': 'SSO, OAuth 2.0, RBAC',
              },
              children: [],
            },
          ],
        },

        // ── SnapCenter ──
        {
          nodeId: 'netapp-snapcenter-line',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'SnapCenter',
          nameKo: 'SnapCenter',
          description:
            'Application-consistent data protection and cloning platform for enterprise databases and applications on NetApp storage',
          descriptionKo:
            'NetApp 스토리지 기반 엔터프라이즈 데이터베이스 및 애플리케이션을 위한 애플리케이션 일관성 데이터 보호 및 복제 플랫폼',
          sourceUrl: 'https://www.netapp.com/data-protection/snapcenter/',
          infraNodeTypes: ['backup', 'storage'],
          architectureRole: 'Data Protection / Application-Consistent Backup',
          architectureRoleKo: '데이터 보호 / 애플리케이션 일관성 백업',
          recommendedFor: [
            'Oracle, SQL Server, SAP HANA application-consistent backup',
            'VMware VM backup and recovery with storage snapshots',
            'Database cloning for dev/test environments',
          ],
          recommendedForKo: [
            'Oracle, SQL Server, SAP HANA 애플리케이션 일관성 백업',
            '스토리지 스냅샷을 사용한 VMware VM 백업 및 복구',
            '개발/테스트 환경을 위한 데이터베이스 복제',
          ],
          supportedProtocols: ['ONTAP API', 'REST API', 'PowerShell'],
          haFeatures: [
            'Centralized policy-based scheduling',
            'SnapMirror integration for DR copies',
            'SnapVault for long-term retention',
          ],
          securityCapabilities: [
            'Role-based access control (RBAC)',
            'Active Directory integration',
            'Audit logging and compliance reporting',
          ],
          children: [
            {
              nodeId: 'netapp-snapcenter',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'NetApp SnapCenter',
              nameKo: 'NetApp SnapCenter',
              description:
                'Centralized application-consistent backup and cloning software for Oracle, SQL Server, SAP HANA, and VMware on NetApp ONTAP',
              descriptionKo:
                'NetApp ONTAP 기반 Oracle, SQL Server, SAP HANA, VMware를 위한 중앙 집중식 애플리케이션 일관성 백업 및 복제 소프트웨어',
              sourceUrl: 'https://www.netapp.com/data-protection/snapcenter/',
              lifecycle: 'active',
              formFactor: 'virtual',
              licensingModel: 'perpetual',
              architectureRole: 'Data Protection / Backup & Clone Management',
              architectureRoleKo: '데이터 보호 / 백업 및 복제 관리',
              recommendedFor: [
                'Enterprise database backup (Oracle, SQL, SAP HANA)',
                'VMware vSphere VM backup and instant recovery',
                'Application-level cloning for dev/test',
              ],
              recommendedForKo: [
                '엔터프라이즈 데이터베이스 백업 (Oracle, SQL, SAP HANA)',
                'VMware vSphere VM 백업 및 즉시 복구',
                '개발/테스트를 위한 애플리케이션 수준 복제',
              ],
              specs: {
                'Supported Applications': 'Oracle, SQL Server, SAP HANA, Exchange, SharePoint, VMware',
                'Deployment': 'Windows Server or Linux VM',
                'Policy Engine': 'Centralized scheduling with SLA-based policies',
                'Clone Technology': 'FlexClone (space-efficient, instant)',
                'DR Integration': 'SnapMirror and SnapVault for offsite copies',
                'Max Managed Hosts': 'Unlimited (with SnapCenter Server sizing)',
              },
              children: [],
            },
          ],
        },

        // ── ONTAP ──
        {
          nodeId: 'netapp-ontap-line',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'ONTAP',
          nameKo: 'ONTAP',
          description:
            'NetApp unified storage operating system powering all AFF, FAS, and cloud storage products with enterprise data services',
          descriptionKo:
            '엔터프라이즈 데이터 서비스를 갖추고 모든 AFF, FAS, 클라우드 스토리지 제품을 구동하는 NetApp 통합 스토리지 운영 체제',
          sourceUrl: 'https://www.netapp.com/data-management/ontap-data-management-software/',
          infraNodeTypes: ['storage', 'san-nas'],
          architectureRole: 'Storage OS / Unified Data Fabric',
          architectureRoleKo: '스토리지 OS / 통합 데이터 패브릭',
          recommendedFor: [
            'Unified NAS and SAN storage management',
            'Hybrid cloud data mobility with SnapMirror',
            'Ransomware protection with autonomous detection',
            'Multi-protocol enterprise storage platform',
          ],
          recommendedForKo: [
            '통합 NAS 및 SAN 스토리지 관리',
            'SnapMirror를 통한 하이브리드 클라우드 데이터 이동성',
            '자율 탐지를 통한 랜섬웨어 보호',
            '멀티프로토콜 엔터프라이즈 스토리지 플랫폼',
          ],
          supportedProtocols: [
            'NFS',
            'SMB/CIFS',
            'iSCSI',
            'FC',
            'FCoE',
            'NVMe-oF',
            'S3',
            'ONTAP API',
          ],
          haFeatures: [
            'Active-Active controllers',
            'MetroCluster',
            'SnapMirror',
            'SyncMirror',
            'RAID-TEC',
            'Non-disruptive upgrades',
          ],
          securityCapabilities: [
            'AES-256 encryption at rest (NSE/NVE)',
            'Multi-admin verification',
            'SnapLock WORM compliance',
            'Autonomous ransomware protection (ARP)',
            'FIPS 140-2 certified',
            'Zero Trust security model support',
          ],
          children: [
            {
              nodeId: 'netapp-ontap',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'NetApp ONTAP',
              nameKo: 'NetApp ONTAP',
              description:
                'Industry-leading unified storage OS supporting NFS, SMB, iSCSI, FC, S3, and NVMe-oF with built-in data protection and ransomware defense',
              descriptionKo:
                '내장 데이터 보호 및 랜섬웨어 방어를 갖추고 NFS, SMB, iSCSI, FC, S3, NVMe-oF를 지원하는 업계 최고의 통합 스토리지 OS',
              sourceUrl: 'https://www.netapp.com/data-management/ontap-data-management-software/',
              lifecycle: 'active',
              formFactor: 'appliance',
              licensingModel: 'perpetual',
              architectureRole: 'Storage Operating System / Data Fabric Core',
              architectureRoleKo: '스토리지 운영 체제 / 데이터 패브릭 코어',
              recommendedFor: [
                'Foundation OS for all NetApp AFF/FAS/CVO deployments',
                'Enterprise multi-protocol unified storage',
                'Ransomware detection and automated response',
              ],
              recommendedForKo: [
                '모든 NetApp AFF/FAS/CVO 배포의 기반 OS',
                '엔터프라이즈 멀티프로토콜 통합 스토리지',
                '랜섬웨어 탐지 및 자동 대응',
              ],
              specs: {
                'Supported Protocols': 'NFS v3/v4.x, SMB 2.x/3.x, iSCSI, FC 32Gb, FCoE, NVMe/FC, NVMe/TCP, S3',
                'Max Cluster Size': '24 nodes (12 HA pairs)',
                'Data Services': 'Deduplication, compression, compaction, tiering',
                'Data Protection': 'Snapshot, SnapMirror, SnapVault, MetroCluster, SnapLock',
                'Security': 'ARP (Autonomous Ransomware Protection), NSE, NVE, multi-admin verification',
                'Cloud Integration': 'FabricPool tiering, BlueXP management, CVO parity',
                'API Access': 'ONTAP REST API, ONTAPI (ZAPI legacy)',
              },
              children: [],
            },
          ],
        },
      ],
    },
  ],
};
