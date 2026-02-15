/**
 * Vendor Mappings — Storage & Auth Infrastructure Components
 *
 * Covers 10 components:
 *   Storage (6): storage, san-nas, object-storage, backup, cache, elasticsearch
 *   Auth   (4): ldap-ad, sso, mfa, iam
 *
 * Last verified: 2026-02-14
 */

import type { ComponentVendorMap } from './types';

export const dataVendorMappings: ComponentVendorMap[] = [
  // =========================================================================
  // STORAGE COMPONENTS
  // =========================================================================

  // -------------------------------------------------------------------------
  // 1. storage (Generic Block Storage)
  // -------------------------------------------------------------------------
  {
    componentId: 'storage',
    category: 'storage',
    cloud: [
      {
        id: 'VM-storage-aws-001',
        provider: 'aws',
        serviceName: 'Amazon Elastic Block Store (EBS)',
        serviceNameKo: 'Amazon EBS (Elastic Block Store)',
        serviceTier: 'gp3 / io2 / st1',
        pricingModel: 'pay-per-use',
        differentiator:
          'Persistent block storage with up to 256K IOPS on io2 Block Express; snapshot-based backup and cross-AZ replication',
        differentiatorKo:
          'io2 Block Express에서 최대 256K IOPS의 영구 블록 스토리지; 스냅샷 기반 백업 및 교차 AZ 복제',
        docUrl: 'https://docs.aws.amazon.com/ebs/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-storage-azure-001',
        provider: 'azure',
        serviceName: 'Azure Managed Disks',
        serviceNameKo: 'Azure 관리 디스크',
        serviceTier: 'Ultra / Premium SSD v2 / Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Zone-redundant storage with up to 160K IOPS on Ultra Disk; seamless integration with Azure VMs and availability sets',
        differentiatorKo:
          'Ultra Disk에서 최대 160K IOPS의 영역 중복 스토리지; Azure VM 및 가용성 집합과 원활한 통합',
        docUrl: 'https://learn.microsoft.com/en-us/azure/virtual-machines/managed-disks-overview',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-storage-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Persistent Disk',
        serviceNameKo: 'Google 영구 디스크',
        serviceTier: 'pd-balanced / pd-ssd / pd-extreme',
        pricingModel: 'pay-per-use',
        differentiator:
          'Automatic encryption at rest; live resize without downtime; regional persistent disks for HA across zones',
        differentiatorKo:
          '저장 시 자동 암호화; 다운타임 없는 실시간 크기 조정; 영역 간 HA를 위한 지역 영구 디스크',
        docUrl: 'https://cloud.google.com/persistent-disk/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-storage-managed-001',
        vendorName: 'Pure Storage',
        productName: 'Pure Cloud Block Store',
        productNameKo: 'Pure Cloud Block Store',
        pricingModel: 'subscription',
        differentiator:
          'Enterprise block storage delivered as cloud service on AWS/Azure; consistent Purity//FA experience across hybrid environments',
        differentiatorKo:
          'AWS/Azure에서 클라우드 서비스로 제공되는 엔터프라이즈 블록 스토리지; 하이브리드 환경 전반에 걸친 일관된 Purity//FA 경험',
        docUrl: 'https://www.purestorage.com/products/cloud-block-store.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-storage-managed-002',
        vendorName: 'NetApp',
        productName: 'NetApp BlueXP / Cloud Volumes ONTAP',
        productNameKo: 'NetApp BlueXP / Cloud Volumes ONTAP',
        pricingModel: 'subscription',
        differentiator:
          'Enterprise ONTAP data management in AWS/Azure/GCP; unified hybrid cloud storage with data tiering, snapshots, and replication',
        differentiatorKo:
          'AWS/Azure/GCP에서의 엔터프라이즈 ONTAP 데이터 관리; 데이터 티어링, 스냅샷, 복제를 갖춘 통합 하이브리드 클라우드 스토리지',
        docUrl: 'https://docs.netapp.com/us-en/bluexp-cloud-volumes-ontap/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-storage-oss-001',
        projectName: 'Ceph RBD',
        projectNameKo: 'Ceph RBD (블록 디바이스)',
        license: 'LGPL-2.1 / LGPL-3.0',
        description:
          'Distributed block device from Ceph providing thin provisioning, snapshots, and replication for cloud-native block storage',
        descriptionKo:
          'Ceph의 분산 블록 디바이스로 씬 프로비저닝, 스냅샷, 복제를 지원하는 클라우드 네이티브 블록 스토리지',
        docUrl: 'https://docs.ceph.com/en/latest/rbd/',
        githubUrl: 'https://github.com/ceph/ceph',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-storage-oss-002',
        projectName: 'OpenEBS',
        projectNameKo: 'OpenEBS',
        license: 'Apache-2.0',
        description:
          'CNCF sandbox project providing container-attached storage for Kubernetes with multiple storage engines (Mayastor, cStor, Jiva)',
        descriptionKo:
          '다중 스토리지 엔진(Mayastor, cStor, Jiva)을 지원하는 Kubernetes용 컨테이너 연결 스토리지 CNCF 샌드박스 프로젝트',
        docUrl: 'https://openebs.io/docs',
        githubUrl: 'https://github.com/openebs/openebs',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-storage-onprem-001',
        vendorName: 'Dell Technologies',
        productName: 'Dell PowerStore',
        productNameKo: 'Dell PowerStore',
        modelSeries: 'PowerStore 1200T / 3200T / 9200T',
        productTier: 'enterprise',
        targetUseCase:
          'Unified block and file storage with container-based architecture, AppsON capability for running VMs directly on the array',
        targetUseCaseKo:
          '컨테이너 기반 아키텍처의 통합 블록 및 파일 스토리지, 어레이에서 직접 VM 실행이 가능한 AppsON 기능',
        keySpecs: 'End-to-end NVMe, up to 15M IOPS, inline dedup/compression',
        lifecycleStatus: 'active',
        productUrl: 'https://www.dell.com/en-us/dt/storage/powerstore.htm',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-storage-onprem-002',
        vendorName: 'NetApp',
        productName: 'NetApp AFF A-Series',
        productNameKo: 'NetApp AFF A시리즈',
        modelSeries: 'AFF A150 / A250 / A400 / A800 / A900',
        productTier: 'enterprise',
        targetUseCase:
          'All-flash unified storage with ONTAP OS; seamless hybrid cloud extension via Cloud Volumes ONTAP; SnapMirror replication',
        targetUseCaseKo:
          'ONTAP OS 기반 올플래시 통합 스토리지; Cloud Volumes ONTAP를 통한 하이브리드 클라우드 확장; SnapMirror 복제',
        keySpecs: 'Sub-ms latency, millions of IOPS, NVMe/FC support, scale-out to 24 nodes',
        lifecycleStatus: 'active',
        productUrl: 'https://www.netapp.com/data-storage/aff-a-series/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-storage-onprem-003',
        vendorName: 'HPE',
        productName: 'HPE Alletra Storage MP',
        productNameKo: 'HPE Alletra Storage MP',
        modelSeries: 'Alletra MP (successor to Primera)',
        productTier: 'enterprise',
        targetUseCase:
          'Mission-critical enterprise storage with HPE InfoSight AI-driven predictive analytics and 100% data availability guarantee',
        targetUseCaseKo:
          'HPE InfoSight AI 기반 예측 분석 및 100% 데이터 가용성 보장을 갖춘 미션 크리티컬 엔터프라이즈 스토리지',
        keySpecs: 'NVMe, 99.9999% availability, AI-driven ops, federated data mobility',
        lifecycleStatus: 'active',
        productUrl: 'https://www.hpe.com/us/en/storage/alletra.html',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 2. san-nas (SAN/NAS Storage)
  // -------------------------------------------------------------------------
  {
    componentId: 'san-nas',
    category: 'storage',
    cloud: [
      {
        id: 'VM-san-nas-aws-001',
        provider: 'aws',
        serviceName: 'Amazon Elastic File System (EFS)',
        serviceNameKo: 'Amazon EFS (Elastic File System)',
        serviceTier: 'Standard / One Zone / IA',
        pricingModel: 'pay-per-use',
        differentiator:
          'Fully managed NFS file system with elastic scaling; up to 10 GB/s throughput and 500K IOPS; serverless integration with Lambda and ECS',
        differentiatorKo:
          '탄력적 확장이 가능한 완전 관리형 NFS 파일 시스템; 최대 10GB/s 처리량 및 500K IOPS; Lambda, ECS와의 서버리스 통합',
        docUrl: 'https://docs.aws.amazon.com/efs/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-san-nas-aws-002',
        provider: 'aws',
        serviceName: 'Amazon FSx',
        serviceNameKo: 'Amazon FSx',
        serviceTier: 'FSx for NetApp ONTAP / Lustre / Windows / OpenZFS',
        pricingModel: 'pay-per-use',
        differentiator:
          'SAN-like block protocol support via FSx for NetApp ONTAP (iSCSI); high-performance HPC via FSx for Lustre; Windows SMB file shares via FSx for Windows',
        differentiatorKo:
          'FSx for NetApp ONTAP을 통한 SAN 유사 블록 프로토콜 지원(iSCSI); FSx for Lustre를 통한 고성능 HPC; FSx for Windows를 통한 Windows SMB 파일 공유',
        docUrl: 'https://docs.aws.amazon.com/fsx/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-san-nas-azure-001',
        provider: 'azure',
        serviceName: 'Azure Files',
        serviceNameKo: 'Azure Files',
        serviceTier: 'Premium / Transaction Optimized / Hot / Cool',
        pricingModel: 'pay-per-use',
        differentiator:
          'Supports both SMB and NFS protocols; Azure File Sync for hybrid file sharing; up to 100K IOPS on Premium tier',
        differentiatorKo:
          'SMB 및 NFS 프로토콜 모두 지원; 하이브리드 파일 공유를 위한 Azure File Sync; 프리미엄 티어에서 최대 100K IOPS',
        docUrl: 'https://learn.microsoft.com/en-us/azure/storage/files/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-san-nas-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Cloud Filestore',
        serviceNameKo: 'Google Cloud Filestore',
        serviceTier: 'Basic / Zonal / Enterprise',
        pricingModel: 'pay-per-use',
        differentiator:
          'Managed NFS file storage with up to 26 GB/s throughput and 900K IOPS on Zonal tier; GKE-native integration for container workloads',
        differentiatorKo:
          'Zonal 티어에서 최대 26GB/s 처리량과 900K IOPS의 관리형 NFS 파일 스토리지; 컨테이너 워크로드를 위한 GKE 네이티브 통합',
        docUrl: 'https://cloud.google.com/filestore/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-san-nas-managed-001',
        vendorName: 'NetApp',
        productName: 'NetApp Cloud Volumes ONTAP',
        productNameKo: 'NetApp Cloud Volumes ONTAP',
        pricingModel: 'subscription',
        differentiator:
          'Enterprise ONTAP features in the cloud (AWS/Azure/GCP); unified NAS and SAN protocols; SnapMirror, FlexClone, and data tiering',
        differentiatorKo:
          '클라우드(AWS/Azure/GCP)에서의 엔터프라이즈 ONTAP 기능; 통합 NAS 및 SAN 프로토콜; SnapMirror, FlexClone, 데이터 티어링',
        docUrl: 'https://docs.netapp.com/us-en/cloud-volumes-ontap/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-san-nas-oss-001',
        projectName: 'TrueNAS SCALE',
        projectNameKo: 'TrueNAS SCALE',
        license: 'GPL-3.0',
        description:
          'Linux-based NAS platform with ZFS; supports SMB, NFS, iSCSI; built-in Kubernetes and Docker for hyperconverged deployments',
        descriptionKo:
          'ZFS 기반 Linux NAS 플랫폼; SMB, NFS, iSCSI 지원; 하이퍼컨버지드 배포를 위한 내장 Kubernetes 및 Docker',
        docUrl: 'https://www.truenas.com/docs/scale/',
        githubUrl: 'https://github.com/truenas',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-san-nas-oss-002',
        projectName: 'Ceph CephFS',
        projectNameKo: 'Ceph CephFS (파일 시스템)',
        license: 'LGPL-2.1 / LGPL-3.0',
        description:
          'POSIX-compliant distributed file system from Ceph with multi-MDS support; scales to exabytes with no single point of failure',
        descriptionKo:
          '다중 MDS 지원의 POSIX 호환 Ceph 분산 파일 시스템; 단일 장애점 없이 엑사바이트 규모로 확장',
        docUrl: 'https://docs.ceph.com/en/latest/cephfs/',
        githubUrl: 'https://github.com/ceph/ceph',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-san-nas-onprem-001',
        vendorName: 'NetApp',
        productName: 'NetApp FAS / AFF',
        productNameKo: 'NetApp FAS / AFF',
        modelSeries: 'FAS2820 / FAS9500 / AFF A-Series / C-Series',
        productTier: 'enterprise',
        targetUseCase:
          'Unified SAN (FC, iSCSI) and NAS (NFS, SMB) storage with ONTAP; industry-leading data protection with SnapMirror and SnapVault',
        targetUseCaseKo:
          'ONTAP 기반 통합 SAN(FC, iSCSI) 및 NAS(NFS, SMB) 스토리지; SnapMirror, SnapVault로 업계 최고 수준의 데이터 보호',
        keySpecs: 'Scale-out to 24 nodes, FabricPool cloud tiering, inline dedup/compression',
        lifecycleStatus: 'active',
        productUrl: 'https://www.netapp.com/data-storage/fas/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-san-nas-onprem-002',
        vendorName: 'Dell Technologies',
        productName: 'Dell PowerStore',
        productNameKo: 'Dell PowerStore',
        modelSeries: 'PowerStore 500T / 1200T / 3200T / 9200T',
        productTier: 'enterprise',
        targetUseCase:
          'Unified storage with AppsON for running VMs on the array; supports NVMe-oF, FC, iSCSI for SAN and NFS/SMB for NAS',
        targetUseCaseKo:
          '어레이에서 VM 실행을 위한 AppsON 기능의 통합 스토리지; SAN용 NVMe-oF, FC, iSCSI 및 NAS용 NFS/SMB 지원',
        keySpecs: 'Container-based architecture, end-to-end NVMe, ML-driven automation',
        lifecycleStatus: 'active',
        productUrl: 'https://www.dell.com/en-us/dt/storage/powerstore.htm',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-san-nas-onprem-003',
        vendorName: 'Pure Storage',
        productName: 'Pure Storage FlashArray / FlashBlade',
        productNameKo: 'Pure Storage FlashArray / FlashBlade',
        modelSeries: 'FlashArray//X / //XL (SAN) / FlashBlade//S / //E (NAS)',
        productTier: 'enterprise',
        targetUseCase:
          'All-flash SAN (FlashArray) and NAS (FlashBlade) with Evergreen subscription model; DirectFlash technology bypasses SSD firmware',
        targetUseCaseKo:
          '올플래시 SAN(FlashArray)과 NAS(FlashBlade)를 Evergreen 구독 모델로 제공; DirectFlash 기술로 SSD 펌웨어 우회',
        keySpecs: 'FlashArray: up to 300us latency, FlashBlade: 75GB/s throughput, Evergreen//One consumption model',
        lifecycleStatus: 'active',
        productUrl: 'https://www.purestorage.com/products.html',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 3. object-storage
  // -------------------------------------------------------------------------
  {
    componentId: 'object-storage',
    category: 'storage',
    cloud: [
      {
        id: 'VM-object-storage-aws-001',
        provider: 'aws',
        serviceName: 'Amazon S3',
        serviceNameKo: 'Amazon S3 (Simple Storage Service)',
        serviceTier: 'Standard / IA / Glacier / Deep Archive',
        pricingModel: 'pay-per-use',
        differentiator:
          'Industry-standard object storage with 11 nines durability; 3,500 PUT and 5,500 GET per prefix per second; S3 Select and Glacier for cost-optimized archival',
        differentiatorKo:
          '11나인 내구성의 업계 표준 오브젝트 스토리지; 접두사당 초당 3,500 PUT, 5,500 GET; S3 Select 및 Glacier로 비용 최적화 아카이빙',
        docUrl: 'https://docs.aws.amazon.com/s3/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-object-storage-azure-001',
        provider: 'azure',
        serviceName: 'Azure Blob Storage',
        serviceNameKo: 'Azure Blob Storage',
        serviceTier: 'Hot / Cool / Cold / Archive',
        pricingModel: 'pay-per-use',
        differentiator:
          'Supports Block, Append, and Page blobs; ADLS Gen2 for analytics workloads; strong consistency and immutable storage for compliance',
        differentiatorKo:
          'Block, Append, Page Blob 지원; 분석 워크로드를 위한 ADLS Gen2; 규정 준수를 위한 강력한 일관성 및 불변 스토리지',
        docUrl: 'https://learn.microsoft.com/en-us/azure/storage/blobs/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-object-storage-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Cloud Storage',
        serviceNameKo: 'Google Cloud Storage',
        serviceTier: 'Standard / Nearline / Coldline / Archive',
        pricingModel: 'pay-per-use',
        differentiator:
          'Strong global consistency for data and metadata; Autoclass automatic tier management; AI/ML workload optimization with BigQuery and Vertex AI integration',
        differentiatorKo:
          '데이터 및 메타데이터에 대한 강력한 글로벌 일관성; Autoclass 자동 티어 관리; BigQuery, Vertex AI 통합으로 AI/ML 워크로드 최적화',
        docUrl: 'https://cloud.google.com/storage/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-object-storage-managed-001',
        vendorName: 'Backblaze',
        productName: 'Backblaze B2 Cloud Storage',
        productNameKo: 'Backblaze B2 클라우드 스토리지',
        pricingModel: 'pay-per-use',
        differentiator:
          'S3-compatible at $6/TB/month; free egress up to 3x stored data; no minimum storage duration; 10 GB free tier',
        differentiatorKo:
          '$6/TB/월의 S3 호환 스토리지; 저장 데이터의 3배까지 무료 송신; 최소 저장 기간 없음; 10GB 무료 티어',
        docUrl: 'https://www.backblaze.com/docs/cloud-storage',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-object-storage-managed-002',
        vendorName: 'Wasabi',
        productName: 'Wasabi Hot Cloud Storage',
        productNameKo: 'Wasabi 핫 클라우드 스토리지',
        pricingModel: 'pay-per-use',
        differentiator:
          'S3-compatible at $6.99/TB/month; zero egress fees and zero API fees; 90-day minimum retention policy; 11 nines durability',
        differentiatorKo:
          '$6.99/TB/월의 S3 호환 스토리지; 송신 및 API 요금 무료; 90일 최소 보관 정책; 11나인 내구성',
        docUrl: 'https://docs.wasabi.com/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-object-storage-oss-001',
        projectName: 'MinIO',
        projectNameKo: 'MinIO',
        license: 'AGPL-3.0 (Enterprise: commercial)',
        description:
          'High-performance S3-compatible object storage; 325+ GB/s throughput on 32 nodes; Kubernetes-native; simple single-binary deployment',
        descriptionKo:
          '고성능 S3 호환 오브젝트 스토리지; 32노드에서 325+ GB/s 처리량; Kubernetes 네이티브; 단일 바이너리 간편 배포',
        docUrl: 'https://min.io/docs/minio/linux/index.html',
        githubUrl: 'https://github.com/minio/minio',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-object-storage-oss-002',
        projectName: 'Ceph RADOS Gateway (RGW)',
        projectNameKo: 'Ceph RADOS Gateway (RGW)',
        license: 'LGPL-2.1 / LGPL-3.0',
        description:
          'S3 and Swift compatible object storage built on Ceph RADOS; unified storage (block/file/object) from a single cluster; active data scrubbing for bit-rot protection',
        descriptionKo:
          'Ceph RADOS 기반 S3/Swift 호환 오브젝트 스토리지; 단일 클러스터에서 블록/파일/오브젝트 통합 스토리지; 비트 로트 방지를 위한 능동 데이터 스크러빙',
        docUrl: 'https://docs.ceph.com/en/latest/radosgw/',
        githubUrl: 'https://github.com/ceph/ceph',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-object-storage-onprem-001',
        vendorName: 'Dell Technologies',
        productName: 'Dell ECS (Elastic Cloud Storage)',
        productNameKo: 'Dell ECS (Elastic Cloud Storage)',
        modelSeries: 'ECS EX300 / EX500',
        productTier: 'enterprise',
        targetUseCase:
          'Enterprise object storage for unstructured data; S3-compatible API; multi-site geo-replication and compliance retention',
        targetUseCaseKo:
          '비정형 데이터를 위한 엔터프라이즈 오브젝트 스토리지; S3 호환 API; 멀티 사이트 지오 복제 및 규정 준수 보존',
        keySpecs: 'Exabyte-scale, multi-protocol (S3, NFS, HDFS), metadata search',
        lifecycleStatus: 'active',
        productUrl: 'https://www.dell.com/en-us/dt/storage/ecs/index.htm',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-object-storage-onprem-002',
        vendorName: 'NetApp',
        productName: 'NetApp StorageGRID',
        productNameKo: 'NetApp StorageGRID',
        modelSeries: 'SG100 / SG1000 / SG5700 / SG6000',
        productTier: 'enterprise',
        targetUseCase:
          'Software-defined object storage with S3 API; policy-driven ILM for automated data placement; multi-site federation',
        targetUseCaseKo:
          'S3 API 기반 소프트웨어 정의 오브젝트 스토리지; 자동 데이터 배치를 위한 정책 기반 ILM; 멀티 사이트 페더레이션',
        keySpecs: 'Petabyte-scale, FabricPool tiering from ONTAP, WORM compliance',
        lifecycleStatus: 'active',
        productUrl: 'https://www.netapp.com/data-storage/storagegrid/',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 4. backup
  // -------------------------------------------------------------------------
  {
    componentId: 'backup',
    category: 'storage',
    cloud: [
      {
        id: 'VM-backup-aws-001',
        provider: 'aws',
        serviceName: 'AWS Backup',
        serviceNameKo: 'AWS Backup',
        pricingModel: 'pay-per-use',
        differentiator:
          'Centralized backup service across 15+ AWS services; policy-based scheduling with cross-region and cross-account copy; AWS Backup Vault Lock for immutable backups',
        differentiatorKo:
          '15개 이상의 AWS 서비스에 걸친 중앙 집중식 백업; 교차 리전, 교차 계정 복사가 가능한 정책 기반 스케줄링; 불변 백업을 위한 AWS Backup Vault Lock',
        docUrl: 'https://docs.aws.amazon.com/aws-backup/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-backup-azure-001',
        provider: 'azure',
        serviceName: 'Azure Backup',
        serviceNameKo: 'Azure Backup',
        pricingModel: 'pay-per-use',
        differentiator:
          'Agent-based and agentless backup for Azure VMs, SQL, Files, and SAP HANA; MARS agent for on-premises; immutable vaults and soft delete',
        differentiatorKo:
          'Azure VM, SQL, Files, SAP HANA를 위한 에이전트 기반/비에이전트 백업; 온프레미스용 MARS 에이전트; 불변 자격 증명 모음 및 일시 삭제',
        docUrl: 'https://learn.microsoft.com/en-us/azure/backup/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-backup-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Cloud Backup and DR',
        serviceNameKo: 'Google Cloud Backup and DR',
        pricingModel: 'pay-per-use',
        differentiator:
          'Centralized backup for Compute Engine, GKE, Cloud SQL, and AlloyDB; incremental-forever with instant mount for fast recovery; management console integration',
        differentiatorKo:
          'Compute Engine, GKE, Cloud SQL, AlloyDB를 위한 중앙 집중식 백업; 빠른 복구를 위한 영구 증분 및 즉시 마운트; 관리 콘솔 통합',
        docUrl: 'https://cloud.google.com/backup-disaster-recovery/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-backup-managed-001',
        vendorName: 'Veeam',
        productName: 'Veeam Data Cloud',
        productNameKo: 'Veeam 데이터 클라우드',
        pricingModel: 'subscription',
        differentiator:
          'BaaS for Microsoft 365 and Azure; AI-based ransomware threat scanning; immutable backup storage; cross-platform restore capabilities',
        differentiatorKo:
          'Microsoft 365 및 Azure용 BaaS; AI 기반 랜섬웨어 위협 스캔; 불변 백업 스토리지; 교차 플랫폼 복원 기능',
        docUrl: 'https://www.veeam.com/products/cloud/backup-as-a-service.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-backup-managed-002',
        vendorName: 'Druva',
        productName: 'Druva Data Resiliency Cloud',
        productNameKo: 'Druva 데이터 레질리언시 클라우드',
        pricingModel: 'subscription',
        differentiator:
          'Cloud-native SaaS backup with zero-trust architecture; up to 40% cost savings vs on-prem; unified protection for endpoints, SaaS apps, and cloud workloads',
        differentiatorKo:
          '제로 트러스트 아키텍처의 클라우드 네이티브 SaaS 백업; 온프레미스 대비 최대 40% 비용 절감; 엔드포인트, SaaS 앱, 클라우드 워크로드 통합 보호',
        docUrl: 'https://docs.druva.com/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-backup-oss-001',
        projectName: 'Restic',
        projectNameKo: 'Restic',
        license: 'BSD-2-Clause',
        description:
          'Fast, secure, efficient backup program supporting multiple backends (S3, Azure Blob, GCS, local, SFTP); content-addressable dedup and client-side encryption',
        descriptionKo:
          '다중 백엔드(S3, Azure Blob, GCS, 로컬, SFTP)를 지원하는 빠르고 안전하며 효율적인 백업 프로그램; 콘텐츠 주소 기반 중복 제거 및 클라이언트 측 암호화',
        docUrl: 'https://restic.readthedocs.io/',
        githubUrl: 'https://github.com/restic/restic',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-backup-oss-002',
        projectName: 'BorgBackup',
        projectNameKo: 'BorgBackup',
        license: 'BSD-3-Clause',
        description:
          'Deduplicating archiver with compression and encryption; chunk-level dedup for space efficiency; append-only mode for protection against ransomware',
        descriptionKo:
          '압축 및 암호화를 지원하는 중복 제거 아카이버; 공간 효율을 위한 청크 수준 중복 제거; 랜섬웨어 방지를 위한 추가 전용 모드',
        docUrl: 'https://borgbackup.readthedocs.io/',
        githubUrl: 'https://github.com/borgbackup/borg',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-backup-onprem-001',
        vendorName: 'Veeam',
        productName: 'Veeam Data Platform',
        productNameKo: 'Veeam 데이터 플랫폼',
        modelSeries: 'Foundation / Advanced / Premium',
        productTier: 'enterprise',
        targetUseCase:
          'Comprehensive backup and recovery for virtual, physical, and cloud workloads; #1 market share (15.1%); ransomware defense with Threat Hunter and IOC detection',
        targetUseCaseKo:
          '가상, 물리, 클라우드 워크로드를 위한 종합 백업 및 복구; 시장 점유율 1위(15.1%); Threat Hunter 및 IOC 감지로 랜섬웨어 방어',
        keySpecs: 'Instant VM Recovery, SureBackup verification, CDP for near-zero RPO',
        lifecycleStatus: 'active',
        productUrl: 'https://www.veeam.com/products/veeam-data-platform.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-backup-onprem-002',
        vendorName: 'Commvault',
        productName: 'Commvault Cloud',
        productNameKo: 'Commvault Cloud',
        modelSeries: 'Commvault Cloud / HyperScale X',
        productTier: 'enterprise',
        targetUseCase:
          'Enterprise-grade data protection with Cloud Rewind and Cleanroom Recovery; broadest workload coverage (400+ data sources); compliance and e-discovery',
        targetUseCaseKo:
          'Cloud Rewind와 Cleanroom Recovery를 갖춘 엔터프라이즈급 데이터 보호; 400개 이상의 데이터 소스를 지원하는 최광범위 워크로드 커버리지; 규정 준수 및 e디스커버리',
        keySpecs: 'AI-driven automation, hyperscale architecture, zero-loss cyber recovery',
        lifecycleStatus: 'active',
        productUrl: 'https://www.commvault.com/platform',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-backup-onprem-003',
        vendorName: 'Veritas',
        productName: 'Veritas NetBackup',
        productNameKo: 'Veritas NetBackup',
        modelSeries: 'NetBackup 10.x / Flex Scale',
        productTier: 'enterprise',
        targetUseCase:
          'Large-scale enterprise backup with 15% market share; heterogeneous platform support (physical, virtual, cloud, containers); automated compliance reporting',
        targetUseCaseKo:
          '15% 시장 점유율의 대규모 엔터프라이즈 백업; 이기종 플랫폼 지원(물리, 가상, 클라우드, 컨테이너); 자동화된 규정 준수 보고',
        keySpecs: 'Petabyte-scale, RBAC, dedupe at source/target, Flex Scale appliance',
        lifecycleStatus: 'active',
        productUrl: 'https://www.veritas.com/protection/netbackup',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 5. cache
  // -------------------------------------------------------------------------
  {
    componentId: 'cache',
    category: 'storage',
    cloud: [
      {
        id: 'VM-cache-aws-001',
        provider: 'aws',
        serviceName: 'Amazon ElastiCache',
        serviceNameKo: 'Amazon ElastiCache',
        serviceTier: 'Valkey / Redis OSS / Memcached',
        pricingModel: 'pay-per-use',
        differentiator:
          'Managed in-memory cache supporting Valkey, Redis OSS, and Memcached engines; data tiering for cost optimization; Multi-AZ with automatic failover; 21.8% market mindshare',
        differentiatorKo:
          'Valkey, Redis OSS, Memcached 엔진을 지원하는 관리형 인메모리 캐시; 비용 최적화를 위한 데이터 티어링; 자동 장애 조치가 있는 Multi-AZ; 21.8% 시장 점유율',
        docUrl: 'https://docs.aws.amazon.com/elasticache/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-cache-azure-001',
        provider: 'azure',
        serviceName: 'Azure Cache for Redis',
        serviceNameKo: 'Azure Cache for Redis',
        serviceTier: 'Basic / Standard / Premium / Enterprise',
        pricingModel: 'pay-per-use',
        differentiator:
          'Fully managed Redis with active geo-replication on Enterprise tier; Azure AD authentication; RediSearch and RedisJSON module support on Enterprise',
        differentiatorKo:
          'Enterprise 티어에서 액티브 지오 복제가 가능한 완전 관리형 Redis; Azure AD 인증; Enterprise에서 RediSearch, RedisJSON 모듈 지원',
        docUrl: 'https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-cache-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Cloud Memorystore',
        serviceNameKo: 'Google Cloud Memorystore',
        serviceTier: 'Valkey / Redis Cluster / Redis / Memcached',
        pricingModel: 'pay-per-use',
        differentiator:
          'Protocol-compatible with Valkey, Redis Cluster, Redis, and Memcached; 99.99% SLA on Redis Cluster; zero-downtime scaling up to 250 nodes',
        differentiatorKo:
          'Valkey, Redis Cluster, Redis, Memcached와 프로토콜 호환; Redis Cluster에서 99.99% SLA; 250노드까지 무중단 확장',
        docUrl: 'https://cloud.google.com/memorystore/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-cache-managed-001',
        vendorName: 'Redis Ltd.',
        productName: 'Redis Cloud',
        productNameKo: 'Redis Cloud',
        pricingModel: 'subscription',
        differentiator:
          'Fully managed Redis Enterprise on any cloud; Active-Active geo-replication; advanced modules (RediSearch, RedisJSON, RedisTimeSeries, RedisGraph)',
        differentiatorKo:
          '모든 클라우드에서의 완전 관리형 Redis Enterprise; Active-Active 지오 복제; 고급 모듈(RediSearch, RedisJSON, RedisTimeSeries, RedisGraph)',
        docUrl: 'https://redis.io/docs/latest/operate/rc/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-cache-oss-001',
        projectName: 'Redis',
        projectNameKo: 'Redis',
        license: 'AGPL-3.0 (since Redis 8) / RSALv2+SSPLv1 (Redis 7.4)',
        description:
          'The most popular in-memory data structure store; supports strings, hashes, lists, sets, sorted sets, streams; Pub/Sub and Lua scripting',
        descriptionKo:
          '가장 널리 사용되는 인메모리 데이터 구조 저장소; 문자열, 해시, 리스트, 셋, 정렬된 셋, 스트림 지원; Pub/Sub 및 Lua 스크립팅',
        docUrl: 'https://redis.io/docs/',
        githubUrl: 'https://github.com/redis/redis',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-cache-oss-002',
        projectName: 'KeyDB',
        projectNameKo: 'KeyDB',
        license: 'BSD-3-Clause',
        description:
          'Multithreaded Redis fork for high-performance workloads; protocol-compatible drop-in replacement; 1M+ ops/sec; active-replica support',
        descriptionKo:
          '고성능 워크로드를 위한 멀티스레드 Redis 포크; 프로토콜 호환 드롭인 대체; 초당 100만 이상 연산; 액티브 레플리카 지원',
        docUrl: 'https://docs.keydb.dev/',
        githubUrl: 'https://github.com/Snapchat/KeyDB',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-cache-oss-003',
        projectName: 'Memcached',
        projectNameKo: 'Memcached',
        license: 'BSD-3-Clause',
        description:
          'High-performance distributed memory caching system; simple key-value store for small data chunks; used by Facebook, Wikipedia, Twitter at scale',
        descriptionKo:
          '고성능 분산 메모리 캐싱 시스템; 소규모 데이터 청크를 위한 단순 키-값 저장소; Facebook, Wikipedia, Twitter 등에서 대규모로 사용',
        docUrl: 'https://memcached.org/',
        githubUrl: 'https://github.com/memcached/memcached',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-cache-onprem-001',
        vendorName: 'Redis Ltd.',
        productName: 'Redis Enterprise Software',
        productNameKo: 'Redis Enterprise Software (온프레미스)',
        modelSeries: 'Redis Enterprise 7.x',
        productTier: 'enterprise',
        targetUseCase:
          'On-premises in-memory cache/database for enterprises requiring full data sovereignty; Active-Active geo-replication across data centers',
        targetUseCaseKo:
          '완전한 데이터 주권이 필요한 기업용 온프레미스 인메모리 캐시/데이터베이스; 데이터 센터 간 Active-Active 지오 복제',
        keySpecs: 'Auto-tiering (RAM+Flash), 99.999% uptime SLA, CRDT-based conflict-free replication, RediSearch/RedisJSON/RedisTimeSeries modules',
        lifecycleStatus: 'active',
        productUrl: 'https://redis.io/enterprise/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-cache-onprem-002',
        vendorName: 'Hazelcast',
        productName: 'Hazelcast Platform',
        productNameKo: 'Hazelcast Platform (온프레미스)',
        modelSeries: 'Hazelcast Platform 5.x',
        productTier: 'enterprise',
        targetUseCase:
          'Distributed in-memory computing platform for ultra-low-latency caching, stream processing, and real-time computation; Java-native with embedded deployment option',
        targetUseCaseKo:
          '초저지연 캐싱, 스트림 처리, 실시간 컴퓨팅을 위한 분산 인메모리 컴퓨팅 플랫폼; Java 네이티브, 임베디드 배포 옵션',
        keySpecs: 'Near-cache, WAN replication, CP subsystem (Raft), SQL over maps, tiered storage, Jet stream processing engine',
        lifecycleStatus: 'active',
        productUrl: 'https://hazelcast.com/products/hazelcast-platform/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-cache-onprem-003',
        vendorName: 'Memcached Community',
        productName: 'Memcached (Self-hosted)',
        productNameKo: 'Memcached (자체 호스팅)',
        productTier: 'entry',
        targetUseCase:
          'Simple, high-performance in-memory key-value cache for web applications; widely deployed for database query result caching and session storage',
        targetUseCaseKo:
          '웹 애플리케이션용 간단한 고성능 인메모리 키-값 캐시; 데이터베이스 쿼리 결과 캐싱 및 세션 저장에 널리 배포',
        keySpecs: 'Multi-threaded, consistent hashing, slab allocator, UDP/TCP, extstore for SSD-backed storage',
        lifecycleStatus: 'active',
        productUrl: 'https://memcached.org/',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 6. elasticsearch
  // -------------------------------------------------------------------------
  {
    componentId: 'elasticsearch',
    category: 'storage',
    cloud: [
      {
        id: 'VM-elasticsearch-aws-001',
        provider: 'aws',
        serviceName: 'Amazon OpenSearch Service',
        serviceNameKo: 'Amazon OpenSearch Service',
        serviceTier: 'Managed / Serverless',
        pricingModel: 'pay-per-use',
        differentiator:
          'Managed OpenSearch (Elasticsearch fork) with deep AWS integration (IAM, VPC, CloudWatch); serverless option for variable workloads; OpenSearch Dashboards included',
        differentiatorKo:
          'AWS 심층 통합(IAM, VPC, CloudWatch)이 있는 관리형 OpenSearch(Elasticsearch 포크); 가변 워크로드용 서버리스 옵션; OpenSearch 대시보드 포함',
        docUrl: 'https://docs.aws.amazon.com/opensearch-service/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-elasticsearch-azure-001',
        provider: 'azure',
        serviceName: 'Azure AI Search',
        serviceNameKo: 'Azure AI Search (구 Cognitive Search)',
        serviceTier: 'Free / Basic / Standard / Storage Optimized',
        pricingModel: 'pay-per-use',
        differentiator:
          'AI-powered search with built-in cognitive skills (OCR, NER, sentiment); vector search and semantic ranking; integrated with Azure OpenAI Service',
        differentiatorKo:
          '내장 인지 기술(OCR, NER, 감성 분석)이 포함된 AI 기반 검색; 벡터 검색 및 의미 순위; Azure OpenAI Service와 통합',
        docUrl: 'https://learn.microsoft.com/en-us/azure/search/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-elasticsearch-gcp-001',
        provider: 'gcp',
        serviceName: 'Elastic Cloud on GCP',
        serviceNameKo: 'GCP 마켓플레이스의 Elastic Cloud',
        pricingModel: 'subscription',
        differentiator:
          'Official Elasticsearch/Kibana managed service on GCP Marketplace; consolidated GCP billing; all Elastic features including ML, SIEM, and APM',
        differentiatorKo:
          'GCP 마켓플레이스의 공식 Elasticsearch/Kibana 관리형 서비스; GCP 통합 결제; ML, SIEM, APM 등 모든 Elastic 기능 포함',
        docUrl: 'https://www.elastic.co/cloud',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-elasticsearch-managed-001',
        vendorName: 'Elastic',
        productName: 'Elastic Cloud',
        productNameKo: 'Elastic Cloud',
        pricingModel: 'subscription',
        differentiator:
          'Official managed Elasticsearch on AWS/Azure/GCP; 40-140% faster than OpenSearch in complex queries; unified platform for search, observability, and security (SIEM)',
        differentiatorKo:
          'AWS/Azure/GCP의 공식 관리형 Elasticsearch; 복잡한 쿼리에서 OpenSearch보다 40-140% 빠름; 검색, 관측성, 보안(SIEM)을 위한 통합 플랫폼',
        docUrl: 'https://www.elastic.co/guide/en/cloud/current/index.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-elasticsearch-managed-002',
        vendorName: 'Algolia',
        productName: 'Algolia Search',
        productNameKo: 'Algolia 검색',
        pricingModel: 'freemium',
        differentiator:
          'Developer-first search API with sub-50ms results globally; typo tolerance, AI re-ranking, and recommendations; 10K searches/month free tier',
        differentiatorKo:
          '전 세계 50ms 미만 결과의 개발자 우선 검색 API; 오타 허용, AI 재순위, 추천 기능; 월 1만 건 무료 티어',
        docUrl: 'https://www.algolia.com/doc/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-elasticsearch-oss-001',
        projectName: 'OpenSearch',
        projectNameKo: 'OpenSearch',
        license: 'Apache-2.0',
        description:
          'Community-driven Elasticsearch fork under Apache 2.0 license; search, analytics, observability, and security; led by AWS with plugin ecosystem',
        descriptionKo:
          'Apache 2.0 라이선스의 커뮤니티 주도 Elasticsearch 포크; 검색, 분석, 관측성, 보안; AWS 주도의 플러그인 생태계',
        docUrl: 'https://opensearch.org/docs/latest/',
        githubUrl: 'https://github.com/opensearch-project/OpenSearch',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-elasticsearch-oss-002',
        projectName: 'Apache Solr',
        projectNameKo: 'Apache Solr',
        license: 'Apache-2.0',
        description:
          'Mature open-source search platform built on Apache Lucene; full-text search, faceting, and real-time indexing; SolrCloud for distributed mode',
        descriptionKo:
          'Apache Lucene 기반의 성숙한 오픈소스 검색 플랫폼; 전문 검색, 패싯, 실시간 인덱싱; 분산 모드를 위한 SolrCloud',
        docUrl: 'https://solr.apache.org/guide/',
        githubUrl: 'https://github.com/apache/solr',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-elasticsearch-onprem-001',
        vendorName: 'Elastic',
        productName: 'Elastic Stack (Self-Managed)',
        productNameKo: 'Elastic Stack (자체 관리)',
        modelSeries: 'Standard / Gold / Platinum / Enterprise',
        productTier: 'enterprise',
        targetUseCase:
          'Self-managed Elasticsearch, Kibana, Beats, and Logstash deployment; full control over data residency; ML, alerting, and RBAC on paid tiers',
        targetUseCaseKo:
          '자체 관리 Elasticsearch, Kibana, Beats, Logstash 배포; 데이터 상주에 대한 완전한 제어; 유료 티어에서 ML, 알림, RBAC',
        keySpecs: 'Dual license SSPL+Elastic, cluster up to 1000s of nodes, hot-warm-cold architecture',
        lifecycleStatus: 'active',
        productUrl: 'https://www.elastic.co/subscriptions',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // AUTH COMPONENTS
  // =========================================================================

  // -------------------------------------------------------------------------
  // 7. ldap-ad (LDAP / Active Directory)
  // -------------------------------------------------------------------------
  {
    componentId: 'ldap-ad',
    category: 'auth',
    cloud: [
      {
        id: 'VM-ldap-ad-aws-001',
        provider: 'aws',
        serviceName: 'AWS Directory Service for Microsoft AD',
        serviceNameKo: 'AWS Directory Service (Managed Microsoft AD)',
        serviceTier: 'Standard / Enterprise',
        pricingModel: 'pay-per-use',
        differentiator:
          'Managed Microsoft Active Directory with full LDAP read/write support; integrates with AWS SSO, RDS for SQL Server, WorkSpaces; trust relationships with on-premises AD',
        differentiatorKo:
          '완전한 LDAP 읽기/쓰기 지원의 관리형 Microsoft Active Directory; AWS SSO, RDS for SQL Server, WorkSpaces와 통합; 온프레미스 AD와의 트러스트 관계',
        docUrl: 'https://docs.aws.amazon.com/directoryservice/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-ldap-ad-azure-001',
        provider: 'azure',
        serviceName: 'Microsoft Entra Domain Services',
        serviceNameKo: 'Microsoft Entra Domain Services (구 Azure AD DS)',
        pricingModel: 'pay-per-use',
        differentiator:
          'Managed domain services with LDAP, Kerberos, NTLM, and Group Policy support; synchronized with Entra ID; LDAP read operations (write limited)',
        differentiatorKo:
          'LDAP, Kerberos, NTLM, 그룹 정책을 지원하는 관리형 도메인 서비스; Entra ID와 동기화; LDAP 읽기 작업(쓰기 제한)',
        docUrl: 'https://learn.microsoft.com/en-us/entra/identity/domain-services/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-ldap-ad-gcp-001',
        provider: 'gcp',
        serviceName: 'Managed Service for Microsoft Active Directory',
        serviceNameKo: 'GCP Managed Microsoft AD',
        pricingModel: 'pay-per-use',
        differentiator:
          'Hardened, HA Microsoft AD service on GCP; LDAPS support; automated patching and monitoring; federation with on-premises AD via trust',
        differentiatorKo:
          'GCP의 강화된 고가용성 Microsoft AD 서비스; LDAPS 지원; 자동 패치 및 모니터링; 트러스트를 통한 온프레미스 AD 페더레이션',
        docUrl: 'https://cloud.google.com/managed-microsoft-ad/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-ldap-ad-jumpcloud-001',
        vendorName: 'JumpCloud',
        productName: 'JumpCloud Directory Platform',
        productNameKo: 'JumpCloud 디렉토리 플랫폼',
        pricingModel: 'subscription',
        differentiator:
          'Cloud-based directory-as-a-service replacing on-premises LDAP/AD; unified identity management for users, devices, and access across all platforms (Windows, macOS, Linux)',
        differentiatorKo:
          '온프레미스 LDAP/AD를 대체하는 클라우드 기반 디렉토리 서비스; 모든 플랫폼(Windows, macOS, Linux)에서의 사용자, 디바이스, 접근 통합 ID 관리',
        docUrl: 'https://jumpcloud.com/support',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-ldap-ad-foxpass-001',
        vendorName: 'Foxpass',
        productName: 'Foxpass Cloud LDAP/RADIUS',
        productNameKo: 'Foxpass 클라우드 LDAP/RADIUS',
        pricingModel: 'subscription',
        differentiator:
          'Hosted LDAP and RADIUS service for SSH key and password management; syncs with Google Workspace and Okta; simple alternative to self-hosted OpenLDAP',
        differentiatorKo:
          'SSH 키 및 비밀번호 관리를 위한 호스팅 LDAP/RADIUS 서비스; Google Workspace 및 Okta와 동기화; 자체 호스팅 OpenLDAP의 간단한 대안',
        docUrl: 'https://www.foxpass.com/docs',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-ldap-ad-oss-001',
        projectName: 'OpenLDAP',
        projectNameKo: 'OpenLDAP',
        license: 'OpenLDAP Public License',
        description:
          'Feature-rich open-source LDAP directory server; supports replication (syncrepl), overlays, and custom schemas; widely used in Linux environments',
        descriptionKo:
          '기능이 풍부한 오픈소스 LDAP 디렉토리 서버; 복제(syncrepl), 오버레이, 사용자 정의 스키마 지원; Linux 환경에서 널리 사용',
        docUrl: 'https://www.openldap.org/doc/admin26/',
        githubUrl: 'https://git.openldap.org/openldap/openldap',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-ldap-ad-oss-002',
        projectName: 'FreeIPA',
        projectNameKo: 'FreeIPA',
        license: 'GPL-3.0',
        description:
          'Integrated identity management for Linux/UNIX combining 389 Directory Server, MIT Kerberos, SSSD, and Dogtag PKI; centralized authentication and policy',
        descriptionKo:
          '389 Directory Server, MIT Kerberos, SSSD, Dogtag PKI를 결합한 Linux/UNIX 통합 ID 관리; 중앙 집중식 인증 및 정책',
        docUrl: 'https://www.freeipa.org/page/Documentation',
        githubUrl: 'https://github.com/freeipa/freeipa',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-ldap-ad-oss-003',
        projectName: '389 Directory Server',
        projectNameKo: '389 Directory Server',
        license: 'GPL-3.0',
        description:
          'Enterprise-class LDAP server developed by Red Hat; multi-supplier replication, access control, and plug-in architecture; basis for FreeIPA and RHDS',
        descriptionKo:
          'Red Hat이 개발한 엔터프라이즈급 LDAP 서버; 다중 공급자 복제, 접근 제어, 플러그인 아키텍처; FreeIPA 및 RHDS의 기반',
        docUrl: 'https://www.port389.org/docs/389ds/documentation.html',
        githubUrl: 'https://github.com/389ds/389-ds-base',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-ldap-ad-onprem-001',
        vendorName: 'Microsoft',
        productName: 'Microsoft Active Directory',
        productNameKo: 'Microsoft Active Directory',
        modelSeries: 'Windows Server 2022 / 2025',
        productTier: 'enterprise',
        targetUseCase:
          'Industry-standard directory service for Windows environments; Group Policy, Kerberos, NTLM, LDAP; foundation for enterprise identity management',
        targetUseCaseKo:
          'Windows 환경을 위한 산업 표준 디렉토리 서비스; 그룹 정책, Kerberos, NTLM, LDAP; 엔터프라이즈 ID 관리의 기반',
        keySpecs: 'Multi-domain forest, AD Federation Services, AD Certificate Services',
        lifecycleStatus: 'active',
        productUrl: 'https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-ldap-ad-onprem-002',
        vendorName: 'Red Hat',
        productName: 'Red Hat Directory Server',
        productNameKo: 'Red Hat Directory Server',
        modelSeries: 'RHDS 12',
        productTier: 'enterprise',
        targetUseCase:
          'Enterprise LDAP server based on 389 DS with Red Hat support; multi-supplier replication; integration with Red Hat IdM and RHEL identity stack',
        targetUseCaseKo:
          'Red Hat 지원이 포함된 389 DS 기반 엔터프라이즈 LDAP 서버; 다중 공급자 복제; Red Hat IdM 및 RHEL ID 스택과의 통합',
        keySpecs: 'LDAP v3, TLS/SSL, SASL, multi-supplier replication, RHEL certified',
        lifecycleStatus: 'active',
        productUrl: 'https://www.redhat.com/en/technologies/cloud-computing/directory-server',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 8. sso (Single Sign-On)
  // -------------------------------------------------------------------------
  {
    componentId: 'sso',
    category: 'auth',
    cloud: [
      {
        id: 'VM-sso-aws-001',
        provider: 'aws',
        serviceName: 'AWS IAM Identity Center',
        serviceNameKo: 'AWS IAM Identity Center (구 AWS SSO)',
        pricingModel: 'free-tier',
        differentiator:
          'Centralized SSO for all AWS accounts and business applications; SAML 2.0 and OIDC; permission sets for multi-account access; free with AWS',
        differentiatorKo:
          '모든 AWS 계정 및 비즈니스 애플리케이션을 위한 중앙 집중식 SSO; SAML 2.0 및 OIDC; 다중 계정 접근을 위한 권한 세트; AWS에서 무료',
        docUrl: 'https://docs.aws.amazon.com/singlesignon/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-sso-azure-001',
        provider: 'azure',
        serviceName: 'Microsoft Entra ID SSO',
        serviceNameKo: 'Microsoft Entra ID SSO (구 Azure AD SSO)',
        serviceTier: 'Free / P1 / P2',
        pricingModel: 'freemium',
        differentiator:
          'Enterprise SSO with 3,600+ pre-integrated SaaS apps; Conditional Access policies; seamless SSO with on-premises apps via Application Proxy',
        differentiatorKo:
          '3,600개 이상의 사전 통합 SaaS 앱을 지원하는 엔터프라이즈 SSO; 조건부 액세스 정책; Application Proxy를 통한 온프레미스 앱과의 원활한 SSO',
        docUrl: 'https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-sso-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Cloud Identity Platform',
        serviceNameKo: 'Google Cloud Identity Platform',
        pricingModel: 'freemium',
        differentiator:
          'Identity-as-a-Service with SAML, OIDC, and social login; Firebase Authentication integration; multi-tenancy and blocking functions for custom logic',
        differentiatorKo:
          'SAML, OIDC, 소셜 로그인을 지원하는 IDaaS; Firebase Authentication 통합; 커스텀 로직을 위한 멀티 테넌시 및 블로킹 함수',
        docUrl: 'https://cloud.google.com/identity-platform/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-sso-managed-001',
        vendorName: 'Okta',
        productName: 'Okta Workforce Identity',
        productNameKo: 'Okta Workforce Identity',
        pricingModel: 'subscription',
        differentiator:
          'Cloud-native IAM leader with 7,500+ pre-built integrations (OIN); polished UX for fast onboarding; Universal Directory and Adaptive MFA included',
        differentiatorKo:
          '7,500개 이상의 사전 구축 통합(OIN)을 갖춘 클라우드 네이티브 IAM 리더; 빠른 온보딩을 위한 세련된 UX; Universal Directory 및 Adaptive MFA 포함',
        docUrl: 'https://developer.okta.com/docs/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-sso-managed-002',
        vendorName: 'Okta (Auth0)',
        productName: 'Auth0',
        productNameKo: 'Auth0',
        pricingModel: 'freemium',
        differentiator:
          'Developer-first identity platform; social logins, MFA, passwordless; extensible with Actions (serverless hooks); free tier up to 7,500 MAU',
        differentiatorKo:
          '개발자 우선 ID 플랫폼; 소셜 로그인, MFA, 패스워드리스; Actions(서버리스 훅)으로 확장 가능; 7,500 MAU까지 무료',
        docUrl: 'https://auth0.com/docs',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-sso-managed-003',
        vendorName: 'Ping Identity',
        productName: 'PingOne / PingFederate',
        productNameKo: 'PingOne / PingFederate',
        pricingModel: 'subscription',
        differentiator:
          'Hybrid IAM for complex enterprise environments; cloud (PingOne), on-premise, and private cloud deployments; merger with ForgeRock strengthens CIAM capabilities',
        differentiatorKo:
          '복잡한 엔터프라이즈 환경을 위한 하이브리드 IAM; 클라우드(PingOne), 온프레미스, 프라이빗 클라우드 배포; ForgeRock 합병으로 CIAM 역량 강화',
        docUrl: 'https://docs.pingidentity.com/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-sso-oss-001',
        projectName: 'Keycloak',
        projectNameKo: 'Keycloak',
        license: 'Apache-2.0',
        description:
          'CNCF incubating IAM/SSO solution; supports OIDC, OAuth 2.0, SAML 2.0; social login, user federation (LDAP/AD), identity brokering; extensive theme/extension system',
        descriptionKo:
          'CNCF 인큐베이팅 IAM/SSO 솔루션; OIDC, OAuth 2.0, SAML 2.0 지원; 소셜 로그인, 사용자 페더레이션(LDAP/AD), ID 브로커링; 광범위한 테마/확장 시스템',
        docUrl: 'https://www.keycloak.org/documentation',
        githubUrl: 'https://github.com/keycloak/keycloak',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-sso-oss-002',
        projectName: 'Authelia',
        projectNameKo: 'Authelia',
        license: 'Apache-2.0',
        description:
          'Lightweight authentication and authorization server for reverse proxy setups; 2FA (TOTP, WebAuthn), OIDC provider; designed for Nginx, Traefik, and Caddy',
        descriptionKo:
          '리버스 프록시 설정을 위한 경량 인증 및 권한 부여 서버; 2FA(TOTP, WebAuthn), OIDC 프로바이더; Nginx, Traefik, Caddy용으로 설계',
        docUrl: 'https://www.authelia.com/overview/prologue/introduction/',
        githubUrl: 'https://github.com/authelia/authelia',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-sso-onprem-001',
        vendorName: 'Ping Identity',
        productName: 'PingFederate',
        productNameKo: 'PingFederate',
        productTier: 'enterprise',
        targetUseCase: 'On-premise enterprise SSO federation server with SAML, OIDC, WS-Federation for complex hybrid environments',
        targetUseCaseKo: '복잡한 하이브리드 환경을 위한 SAML, OIDC, WS-Federation 지원 온프레미스 엔터프라이즈 SSO 페더레이션 서버',
        keySpecs: 'SAML 2.0, OIDC, OAuth 2.0, WS-Federation; identity bridging; high-throughput transaction processing',
        lifecycleStatus: 'active',
        productUrl: 'https://www.pingidentity.com/en/platform/capabilities/single-sign-on.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-sso-onprem-002',
        vendorName: 'Shibboleth',
        productName: 'Shibboleth Identity Provider',
        productNameKo: 'Shibboleth ID 프로바이더',
        productTier: 'mid-range',
        targetUseCase: 'Academic and research federation SSO; widely deployed in education sector for InCommon and eduGAIN federations',
        targetUseCaseKo: '학술 및 연구 페더레이션 SSO; InCommon 및 eduGAIN 페더레이션에서 교육 부문에 널리 배포',
        keySpecs: 'SAML 2.0, CAS; attribute-based access control; multi-protocol federation',
        lifecycleStatus: 'active',
        productUrl: 'https://shibboleth.atlassian.net/wiki/spaces/IDP5/overview',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 9. mfa (Multi-Factor Authentication)
  // -------------------------------------------------------------------------
  {
    componentId: 'mfa',
    category: 'auth',
    cloud: [
      {
        id: 'VM-mfa-aws-001',
        provider: 'aws',
        serviceName: 'AWS MFA (IAM)',
        serviceNameKo: 'AWS MFA (IAM)',
        pricingModel: 'free-tier',
        differentiator:
          'Built-in MFA for IAM users and root accounts; supports virtual MFA (TOTP apps), hardware TOTP tokens, and FIDO2 security keys; free with IAM',
        differentiatorKo:
          'IAM 사용자 및 루트 계정을 위한 내장 MFA; 가상 MFA(TOTP 앱), 하드웨어 TOTP 토큰, FIDO2 보안 키 지원; IAM에서 무료',
        docUrl: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_mfa.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-mfa-azure-001',
        provider: 'azure',
        serviceName: 'Microsoft Entra MFA',
        serviceNameKo: 'Microsoft Entra MFA (구 Azure MFA)',
        serviceTier: 'Included in P1/P2',
        pricingModel: 'freemium',
        differentiator:
          'Integrated MFA with Conditional Access policies; Microsoft Authenticator push, FIDO2, SMS, voice call; passwordless phone sign-in; number matching to prevent MFA fatigue',
        differentiatorKo:
          '조건부 액세스 정책과 통합된 MFA; Microsoft Authenticator 푸시, FIDO2, SMS, 음성 통화; 패스워드리스 전화 로그인; MFA 피로 방지를 위한 번호 일치',
        docUrl: 'https://learn.microsoft.com/en-us/entra/identity/authentication/concept-mfa-howitworks',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-mfa-gcp-001',
        provider: 'gcp',
        serviceName: 'Google 2-Step Verification',
        serviceNameKo: 'Google 2단계 인증',
        pricingModel: 'free-tier',
        differentiator:
          'Built-in MFA for Google Workspace and GCP accounts; Google Prompt (push), TOTP, FIDO2/Titan Security Key; Advanced Protection Program for high-risk users',
        differentiatorKo:
          'Google Workspace 및 GCP 계정을 위한 내장 MFA; Google 프롬프트(푸시), TOTP, FIDO2/Titan 보안 키; 고위험 사용자를 위한 고급 보호 프로그램',
        docUrl: 'https://support.google.com/accounts/answer/185839',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-mfa-managed-001',
        vendorName: 'Cisco',
        productName: 'Cisco Duo Security',
        productNameKo: 'Cisco Duo Security',
        pricingModel: 'freemium',
        differentiator:
          'Zero-trust MFA with device health verification; push notifications, TOTP, SMS, biometrics, and hardware tokens; free tier up to 10 users; trusted endpoint policies',
        differentiatorKo:
          '디바이스 상태 검증이 포함된 제로 트러스트 MFA; 푸시 알림, TOTP, SMS, 생체인식, 하드웨어 토큰; 10명까지 무료; 신뢰 엔드포인트 정책',
        docUrl: 'https://duo.com/docs',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-mfa-managed-002',
        vendorName: 'RSA',
        productName: 'RSA SecurID',
        productNameKo: 'RSA SecurID',
        pricingModel: 'subscription',
        differentiator:
          'Enterprise MFA with 30+ year track record; hardware and software tokens; centralized credential management for thousands of users; CJIS and FedRAMP compliant',
        differentiatorKo:
          '30년 이상의 실적을 가진 엔터프라이즈 MFA; 하드웨어 및 소프트웨어 토큰; 수천 명의 사용자를 위한 중앙 집중식 자격 증명 관리; CJIS 및 FedRAMP 인증',
        docUrl: 'https://community.rsa.com/t5/securid/ct-p/securid',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-mfa-oss-001',
        projectName: 'privacyIDEA',
        projectNameKo: 'privacyIDEA',
        license: 'AGPL-3.0',
        description:
          'Multi-factor authentication server supporting TOTP, HOTP, FIDO2, push tokens, SMS, email; centralized MFA management with policy engine',
        descriptionKo:
          'TOTP, HOTP, FIDO2, 푸시 토큰, SMS, 이메일을 지원하는 다중 인증 서버; 정책 엔진을 갖춘 중앙 집중식 MFA 관리',
        docUrl: 'https://privacyidea.readthedocs.io/',
        githubUrl: 'https://github.com/privacyidea/privacyidea',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-mfa-oss-002',
        projectName: 'LinOTP',
        projectNameKo: 'LinOTP',
        license: 'AGPL-3.0',
        description:
          'Open-source OTP management system for enterprise two-factor authentication; supports TOTP, HOTP, SMS, email, RADIUS integration',
        descriptionKo:
          '엔터프라이즈 2단계 인증을 위한 오픈소스 OTP 관리 시스템; TOTP, HOTP, SMS, 이메일, RADIUS 통합 지원',
        docUrl: 'https://www.linotp.org/doc/',
        githubUrl: 'https://github.com/LinOTP/LinOTP',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-mfa-onprem-001',
        vendorName: 'Yubico',
        productName: 'YubiKey',
        productNameKo: 'YubiKey',
        modelSeries: 'YubiKey 5 NFC / 5C / 5Ci / Bio / Security Key',
        productTier: 'entry',
        targetUseCase:
          'Phishing-resistant hardware MFA with FIDO2/WebAuthn, PIV, OpenPGP, TOTP; no batteries or network; works across all major platforms and browsers',
        targetUseCaseKo:
          'FIDO2/WebAuthn, PIV, OpenPGP, TOTP를 지원하는 피싱 방지 하드웨어 MFA; 배터리 및 네트워크 불필요; 모든 주요 플랫폼 및 브라우저에서 작동',
        keySpecs: 'FIDO2/U2F, PIV, OpenPGP, TOTP, USB-A/C/Lightning/NFC, IP68 rated',
        lifecycleStatus: 'active',
        productUrl: 'https://www.yubico.com/products/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-mfa-onprem-002',
        vendorName: 'RSA',
        productName: 'RSA SecurID Hardware Appliance',
        productNameKo: 'RSA SecurID 하드웨어 어플라이언스',
        modelSeries: 'RSA SecurID Authentication Manager',
        productTier: 'enterprise',
        targetUseCase:
          'On-premises MFA appliance for high-security environments; centralized token management; VPN, legacy app, and privileged access protection; FIPS 140-2 validated',
        targetUseCaseKo:
          '고보안 환경을 위한 온프레미스 MFA 어플라이언스; 중앙 집중식 토큰 관리; VPN, 레거시 앱, 특권 접근 보호; FIPS 140-2 검증',
        keySpecs: 'Hardware/software tokens, RADIUS, REST API, HA clustering, FIPS 140-2',
        lifecycleStatus: 'active',
        productUrl: 'https://www.rsa.com/products/securid/',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 10. iam (Identity and Access Management)
  // -------------------------------------------------------------------------
  {
    componentId: 'iam',
    category: 'auth',
    cloud: [
      {
        id: 'VM-iam-aws-001',
        provider: 'aws',
        serviceName: 'AWS IAM',
        serviceNameKo: 'AWS IAM (Identity and Access Management)',
        pricingModel: 'free-tier',
        differentiator:
          'Fine-grained access control with JSON policies (up to 6,144 chars); users, groups, roles, and service control policies (SCPs); free for all AWS accounts',
        differentiatorKo:
          'JSON 정책(최대 6,144자)을 통한 세분화된 접근 제어; 사용자, 그룹, 역할, 서비스 제어 정책(SCP); 모든 AWS 계정에서 무료',
        docUrl: 'https://docs.aws.amazon.com/iam/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-iam-azure-001',
        provider: 'azure',
        serviceName: 'Microsoft Entra ID + Azure RBAC',
        serviceNameKo: 'Microsoft Entra ID + Azure RBAC',
        serviceTier: 'Free / P1 / P2 / Governance',
        pricingModel: 'freemium',
        differentiator:
          'Unified identity and RBAC at 4 levels (management group, subscription, resource group, resource); Entra ID for identity + Azure Policy for guardrails; Hybrid Benefit for existing licenses',
        differentiatorKo:
          '4개 수준(관리 그룹, 구독, 리소스 그룹, 리소스)의 통합 ID 및 RBAC; ID를 위한 Entra ID + 가드레일을 위한 Azure Policy; 기존 라이선스를 위한 하이브리드 혜택',
        docUrl: 'https://learn.microsoft.com/en-us/entra/identity/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-iam-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Cloud IAM',
        serviceNameKo: 'Google Cloud IAM',
        pricingModel: 'free-tier',
        differentiator:
          'Hierarchical RBAC (org, folder, project, resource) with predefined and custom roles; Organization Policy for resource constraints; 64 KB policy size limit; free for all GCP projects',
        differentiatorKo:
          '사전 정의 및 사용자 정의 역할이 있는 계층적 RBAC(조직, 폴더, 프로젝트, 리소스); 리소스 제약을 위한 조직 정책; 64KB 정책 크기 제한; 모든 GCP 프로젝트에서 무료',
        docUrl: 'https://cloud.google.com/iam/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-iam-managed-001',
        vendorName: 'Okta',
        productName: 'Okta Identity Governance',
        productNameKo: 'Okta Identity Governance',
        pricingModel: 'subscription',
        differentiator:
          'Cloud-native IAM with SSO, lifecycle management, and access governance; 7,500+ app integrations; Okta Workflows for no-code automation; API Access Management',
        differentiatorKo:
          'SSO, 수명 주기 관리, 접근 거버넌스를 갖춘 클라우드 네이티브 IAM; 7,500개 이상의 앱 통합; 노코드 자동화를 위한 Okta Workflows; API 접근 관리',
        docUrl: 'https://www.okta.com/products/identity-governance/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-iam-managed-002',
        vendorName: 'SailPoint',
        productName: 'SailPoint Identity Security Cloud',
        productNameKo: 'SailPoint Identity Security Cloud',
        pricingModel: 'subscription',
        differentiator:
          'AI-powered identity governance with entitlement management and access certification; Gartner 4.7/5 (730 reviews); compliance-focused with audit trails and SoD enforcement',
        differentiatorKo:
          '엔타이틀먼트 관리 및 접근 인증이 포함된 AI 기반 ID 거버넌스; Gartner 4.7/5(730건 리뷰); 감사 추적 및 SoD 시행으로 규정 준수 중심',
        docUrl: 'https://documentation.sailpoint.com/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-iam-oss-001',
        projectName: 'Keycloak',
        projectNameKo: 'Keycloak',
        license: 'Apache-2.0',
        description:
          'Full-featured IAM with user management, RBAC, fine-grained authorization services, and client scopes; OIDC/OAuth2/SAML; Admin REST API and UI',
        descriptionKo:
          '사용자 관리, RBAC, 세분화된 권한 부여 서비스, 클라이언트 범위를 갖춘 완전한 기능의 IAM; OIDC/OAuth2/SAML; Admin REST API 및 UI',
        docUrl: 'https://www.keycloak.org/documentation',
        githubUrl: 'https://github.com/keycloak/keycloak',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-iam-oss-002',
        projectName: 'Open Policy Agent (OPA)',
        projectNameKo: 'Open Policy Agent (OPA)',
        license: 'Apache-2.0',
        description:
          'CNCF graduated policy engine for unified authorization across the stack; Rego policy language; integrates with Kubernetes, API gateways, Terraform, and microservices',
        descriptionKo:
          '스택 전반에 걸친 통합 권한 부여를 위한 CNCF 졸업 정책 엔진; Rego 정책 언어; Kubernetes, API 게이트웨이, Terraform, 마이크로서비스와 통합',
        docUrl: 'https://www.openpolicyagent.org/docs/latest/',
        githubUrl: 'https://github.com/open-policy-agent/opa',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-iam-onprem-001',
        vendorName: 'CyberArk',
        productName: 'CyberArk Identity Security Platform',
        productNameKo: 'CyberArk Identity Security Platform',
        modelSeries: 'Privilege Cloud / Endpoint Privilege Manager / Workforce Identity',
        productTier: 'enterprise',
        targetUseCase:
          'Privileged access management (PAM) and identity security; credential vaulting, session recording, and just-in-time access; leader in Gartner PAM Magic Quadrant',
        targetUseCaseKo:
          '특권 접근 관리(PAM) 및 ID 보안; 자격 증명 볼트, 세션 기록, JIT 접근; Gartner PAM 매직 쿼드런트 리더',
        keySpecs: 'Digital Vault, PSM, EPM, secrets management, FIPS 140-2 validated',
        lifecycleStatus: 'active',
        productUrl: 'https://www.cyberark.com/products/identity-security-platform/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-iam-onprem-002',
        vendorName: 'IBM',
        productName: 'IBM Security Verify Governance',
        productNameKo: 'IBM Security Verify Governance',
        modelSeries: 'Verify Governance / Verify Privilege Manager',
        productTier: 'enterprise',
        targetUseCase:
          'Identity governance and privileged access management for large enterprises; user lifecycle management, access certification, SoD; integration with mainframe and legacy systems',
        targetUseCaseKo:
          '대기업을 위한 ID 거버넌스 및 특권 접근 관리; 사용자 수명 주기 관리, 접근 인증, SoD; 메인프레임 및 레거시 시스템과의 통합',
        keySpecs: 'Role mining, access certification, SoD, workflow automation, SCIM provisioning',
        lifecycleStatus: 'active',
        productUrl: 'https://www.ibm.com/products/verify-governance',
        lastVerified: '2026-02-14',
      },
    ],
  },
];
