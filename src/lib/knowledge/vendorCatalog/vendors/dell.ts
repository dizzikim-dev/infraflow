/**
 * Dell Technologies -- Full Product Catalog
 *
 * Hierarchical product tree covering Servers (PowerEdge),
 * Storage (PowerStore, PowerScale, PowerFlex, ECS, PowerProtect),
 * Networking (PowerSwitch, SD-WAN), and Data Protection categories.
 *
 * Data sourced from https://www.dell.com/en-us/shop/scc/sc/servers
 * Last crawled: 2026-02-22
 */

import type { VendorCatalog } from '../types';

// ---------------------------------------------------------------------------
// Dell Technologies Product Catalog
// ---------------------------------------------------------------------------

export const dellCatalog: VendorCatalog = {
  vendorId: 'dell-technologies',
  vendorName: 'Dell Technologies',
  vendorNameKo: '델 테크놀로지스',
  headquarters: 'Round Rock, TX, USA',
  website: 'https://www.dell.com',
  productPageUrl: 'https://www.dell.com/en-us/shop/scc/sc/servers',
  depthStructure: ['category', 'product-line', 'series'],
  depthStructureKo: ['카테고리', '제품 라인', '시리즈'],
  lastCrawled: '2026-02-22',
  crawlSource: 'https://www.dell.com/en-us/shop/scc/sc/servers',
  stats: { totalProducts: 52, maxDepth: 2, categoriesCount: 4 },
  products: [
    // =====================================================================
    // 1. Servers
    // =====================================================================
    {
      nodeId: 'dell-servers',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Servers',
      nameKo: '서버',
      description:
        'Dell PowerEdge server portfolio spanning tower, rack, AI-optimized, and modular form factors for enterprise data center and edge deployments',
      descriptionKo:
        '엔터프라이즈 데이터센터 및 엣지 배포를 위한 타워, 랙, AI 최적화, 모듈러 폼팩터를 아우르는 Dell PowerEdge 서버 포트폴리오',
      sourceUrl: 'https://www.dell.com/en-us/shop/scc/sc/servers',
      infraNodeTypes: ['web-server', 'app-server', 'db-server', 'vm'],
      children: [
        // ── PowerEdge Tower Servers ──
        {
          nodeId: 'dell-poweredge-tower',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'PowerEdge Tower Servers',
          nameKo: 'PowerEdge 타워 서버',
          description:
            'Tower-form servers for remote offices, edge sites, and small enterprise environments with low acoustic footprint',
          descriptionKo:
            '원격 사무소, 엣지 사이트, 소규모 엔터프라이즈 환경을 위한 저소음 타워형 서버',
          sourceUrl:
            'https://www.dell.com/en-us/shop/dell-poweredge-tower-servers/sf/poweredge-tower-servers',
          infraNodeTypes: ['web-server', 'app-server', 'db-server', 'vm'],
          architectureRole: 'Edge / Remote Office / Small Enterprise',
          architectureRoleKo: '엣지 / 원격 사무소 / 소규모 엔터프라이즈',
          recommendedFor: [
            'Remote office and branch office deployments',
            'Edge computing with limited rack infrastructure',
            'Small and mid-size enterprise workloads',
            'File and print server consolidation',
          ],
          recommendedForKo: [
            '원격 사무소 및 지사 배포',
            '랙 인프라가 제한적인 엣지 컴퓨팅',
            '중소규모 엔터프라이즈 워크로드',
            '파일 및 프린트 서버 통합',
          ],
          supportedProtocols: [
            'PCIe Gen5',
            'iDRAC9',
            'IPMI 2.0',
            'Redfish',
            'SNMP',
            'NFS',
            'SMB',
          ],
          haFeatures: [
            'Redundant power supplies (optional)',
            'Hot-plug drives',
            'iDRAC remote management',
            'Hardware RAID with battery backup',
          ],
          securityCapabilities: [
            'TPM 2.0',
            'Silicon Root of Trust',
            'Secure Boot',
            'System Lockdown',
            'Chassis Intrusion Detection',
          ],
          children: [
            {
              nodeId: 'dell-poweredge-t360',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerEdge T360',
              nameKo: 'PowerEdge T360',
              description:
                'Entry-level single-socket tower server with Intel Xeon E-2400 for small business workloads',
              descriptionKo:
                '소규모 비즈니스 워크로드를 위한 Intel Xeon E-2400 기반 엔트리급 싱글소켓 타워 서버',
              sourceUrl:
                'https://www.dell.com/en-us/shop/dell-poweredge-servers/poweredge-t360-tower-server/spd/poweredge-t360/pe_t360_tm_vi_vp',
              lifecycle: 'active',
              formFactor: 'appliance',
              architectureRole: 'Edge / Small Business',
              architectureRoleKo: '엣지 / 소규모 비즈니스',
              specs: {
                Processor: 'Intel Xeon E-2400 series (single socket)',
                'Max Memory': '128 GB DDR5 UDIMM',
                'Drive Bays': 'Up to 8x 3.5" or 16x 2.5" hot-plug',
                'PCIe Slots': '4x PCIe Gen5 slots',
                'Network Ports': '2x 1GbE LOM',
                'Power Supply': '1+1 redundant 600W/700W',
                'Form Factor': 'Tower',
                Management: 'iDRAC9 Express/Enterprise',
              },
              children: [],
            },
            {
              nodeId: 'dell-poweredge-t560',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerEdge T560',
              nameKo: 'PowerEdge T560',
              description:
                'Dual-socket tower server with 4th/5th Gen Intel Xeon Scalable for versatile enterprise workloads',
              descriptionKo:
                '다양한 엔터프라이즈 워크로드를 위한 4세대/5세대 Intel Xeon Scalable 듀얼소켓 타워 서버',
              sourceUrl:
                'https://www.dell.com/en-us/shop/dell-poweredge-servers/poweredge-t560-tower-server/spd/poweredge-t560/pe_t560_tm_vi_vp',
              lifecycle: 'active',
              formFactor: 'appliance',
              specs: {
                Processor:
                  '2x Intel Xeon Scalable 4th/5th Gen (up to 64 cores per CPU)',
                'Max Memory': '2 TB DDR5 RDIMM (16 DIMM slots)',
                'Drive Bays': 'Up to 16x 2.5" or 8x 3.5" hot-plug',
                'PCIe Slots': '7x PCIe Gen5 slots',
                'Network Ports': '2x 1GbE LOM + OCP 3.0 slot',
                'Power Supply': '1+1 redundant up to 1400W',
                'Form Factor': 'Tower (convertible to 5U rack)',
                Management: 'iDRAC9 Enterprise',
                'GPU Support': 'Up to 2x single-width or 1x double-width GPU',
              },
              children: [],
            },
          ],
        },

        // ── PowerEdge Rack Servers ──
        {
          nodeId: 'dell-poweredge-rack',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'PowerEdge Rack Servers',
          nameKo: 'PowerEdge 랙 서버',
          description:
            'Rack-optimized servers for enterprise data centers with scalable compute, memory, and I/O for mainstream to mission-critical workloads',
          descriptionKo:
            '메인스트림에서 미션 크리티컬 워크로드까지 확장 가능한 컴퓨팅, 메모리, I/O를 갖춘 엔터프라이즈 데이터센터용 랙 최적화 서버',
          sourceUrl:
            'https://www.dell.com/en-us/shop/dell-poweredge-rack-servers/sf/poweredge-rack-servers',
          infraNodeTypes: ['web-server', 'app-server', 'db-server', 'vm'],
          architectureRole: 'Data Center / Core Compute / Virtualization Host',
          architectureRoleKo:
            '데이터센터 / 코어 컴퓨팅 / 가상화 호스트',
          recommendedFor: [
            'Enterprise data center consolidation',
            'VMware/Hyper-V virtualization hosts',
            'High-performance database servers (OLTP/OLAP)',
            'Cloud-native and containerized application hosting',
            'High-density compute for HPC and analytics',
          ],
          recommendedForKo: [
            '엔터프라이즈 데이터센터 통합',
            'VMware/Hyper-V 가상화 호스트',
            '고성능 데이터베이스 서버 (OLTP/OLAP)',
            '클라우드 네이티브 및 컨테이너 애플리케이션 호스팅',
            'HPC 및 분석을 위한 고밀도 컴퓨팅',
          ],
          supportedProtocols: [
            'PCIe Gen5',
            'iDRAC9',
            'IPMI 2.0',
            'Redfish',
            'SNMP',
            'iSCSI',
            'FC (via HBA)',
            'NVMe-oF',
          ],
          haFeatures: [
            'Redundant hot-plug power supplies',
            'Hot-plug NVMe/SAS/SATA drives',
            'Redundant fans',
            'iDRAC9 remote management with Lifecycle Controller',
            'Hardware RAID with persistent cache',
            'Internal dual SD/M.2 boot',
          ],
          securityCapabilities: [
            'TPM 2.0',
            'Silicon Root of Trust',
            'Secure Boot with UEFI',
            'System Lockdown Mode',
            'Signed firmware updates',
            'Chassis Intrusion Detection',
            'AMD SEV / Intel SGX support (model-dependent)',
          ],
          children: [
            {
              nodeId: 'dell-poweredge-r360',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerEdge R360',
              nameKo: 'PowerEdge R360',
              description:
                '1U single-socket rack server with Intel Xeon E-2400 for entry-level data center deployments',
              descriptionKo:
                '엔트리급 데이터센터 배포를 위한 Intel Xeon E-2400 기반 1U 싱글소켓 랙 서버',
              sourceUrl:
                'https://www.dell.com/en-us/shop/dell-poweredge-servers/poweredge-r360-rack-server/spd/poweredge-r360/pe_r360_tm_vi_vp',
              lifecycle: 'active',
              formFactor: 'appliance',
              specs: {
                Processor: 'Intel Xeon E-2400 series (single socket)',
                'Max Memory': '128 GB DDR5 UDIMM (4 DIMM slots)',
                'Drive Bays': 'Up to 4x 3.5" or 8x 2.5" hot-plug',
                'PCIe Slots': '2x PCIe Gen5',
                'Network Ports': '2x 1GbE LOM',
                'Power Supply': '1+1 redundant 600W',
                'Form Factor': '1U rack',
                Management: 'iDRAC9 Express/Enterprise',
              },
              children: [],
            },
            {
              nodeId: 'dell-poweredge-r660',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerEdge R660',
              nameKo: 'PowerEdge R660',
              description:
                '1U dual-socket mainstream rack server with 4th/5th Gen Intel Xeon Scalable for general-purpose enterprise workloads',
              descriptionKo:
                '범용 엔터프라이즈 워크로드를 위한 4세대/5세대 Intel Xeon Scalable 1U 듀얼소켓 메인스트림 랙 서버',
              sourceUrl:
                'https://www.dell.com/en-us/shop/dell-poweredge-servers/poweredge-r660-rack-server/spd/poweredge-r660/pe_r660_tm_vi_vp',
              lifecycle: 'active',
              formFactor: 'appliance',
              maxThroughput: 'Up to 800 Gbps PCIe Gen5 I/O',
              specs: {
                Processor:
                  '2x Intel Xeon Scalable 4th/5th Gen (up to 64 cores per CPU)',
                'Max Memory': '2 TB DDR5 RDIMM (32 DIMM slots)',
                'Drive Bays':
                  'Up to 10x 2.5" SAS/SATA/NVMe or 8x EDSFF E3.S NVMe',
                'PCIe Slots': '3x PCIe Gen5 + 1x OCP 3.0',
                'Network Ports': '2x 1GbE LOM + OCP 3.0 slot',
                'Power Supply': '1+1 redundant up to 1400W',
                'Form Factor': '1U rack',
                Management: 'iDRAC9 Enterprise',
              },
              children: [],
            },
            {
              nodeId: 'dell-poweredge-r660xs',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerEdge R660xs',
              nameKo: 'PowerEdge R660xs',
              description:
                '1U cost-optimized dual-socket rack server balancing performance and storage density for budget-conscious deployments',
              descriptionKo:
                '비용 효율적 배포를 위해 성능과 스토리지 밀도를 균형 잡은 1U 코스트 최적화 듀얼소켓 랙 서버',
              sourceUrl:
                'https://www.dell.com/en-us/shop/dell-poweredge-servers/poweredge-r660xs-rack-server/spd/poweredge-r660xs/pe_r660xs_tm_vi_vp',
              lifecycle: 'active',
              formFactor: 'appliance',
              specs: {
                Processor:
                  '2x Intel Xeon Scalable 4th/5th Gen (up to 32 cores per CPU)',
                'Max Memory': '1 TB DDR5 RDIMM (16 DIMM slots)',
                'Drive Bays': 'Up to 10x 2.5" or 4x 3.5" hot-plug',
                'PCIe Slots': '3x PCIe Gen5 + 1x OCP 3.0',
                'Network Ports': '2x 1GbE LOM + OCP 3.0 slot',
                'Power Supply': '1+1 redundant up to 1100W',
                'Form Factor': '1U rack',
                Management: 'iDRAC9 Enterprise',
              },
              children: [],
            },
            {
              nodeId: 'dell-poweredge-r760',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerEdge R760',
              nameKo: 'PowerEdge R760',
              description:
                '2U dual-socket mainstream rack server for virtualization, databases, and high-performance applications with GPU support',
              descriptionKo:
                'GPU 지원이 가능한 가상화, 데이터베이스 및 고성능 애플리케이션을 위한 2U 듀얼소켓 메인스트림 랙 서버',
              sourceUrl:
                'https://www.dell.com/en-us/shop/dell-poweredge-servers/poweredge-r760-rack-server/spd/poweredge-r760/pe_r760_tm_vi_vp',
              lifecycle: 'active',
              formFactor: 'appliance',
              maxThroughput: 'Up to 1.12 Tbps PCIe Gen5 I/O',
              specs: {
                Processor:
                  '2x Intel Xeon Scalable 4th/5th Gen (up to 64 cores per CPU)',
                'Max Memory': '2 TB DDR5 RDIMM (32 DIMM slots)',
                'Drive Bays': 'Up to 16x 2.5" or 12x 3.5" hot-plug',
                'PCIe Slots': '8x PCIe Gen5 + 1x OCP 3.0',
                'Network Ports': '2x 1GbE LOM + OCP 3.0 slot',
                'Power Supply': '1+1 redundant up to 2400W',
                'Form Factor': '2U rack',
                Management: 'iDRAC9 Enterprise',
                'GPU Support': 'Up to 4x single-width or 2x double-width GPU',
              },
              children: [],
            },
            {
              nodeId: 'dell-poweredge-r760xs',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerEdge R760xs',
              nameKo: 'PowerEdge R760xs',
              description:
                '2U cost-optimized dual-socket rack server with high storage capacity for value-oriented data center deployments',
              descriptionKo:
                '가치 지향적 데이터센터 배포를 위한 높은 스토리지 용량의 2U 코스트 최적화 듀얼소켓 랙 서버',
              sourceUrl:
                'https://www.dell.com/en-us/shop/dell-poweredge-servers/poweredge-r760xs-rack-server/spd/poweredge-r760xs/pe_r760xs_tm_vi_vp',
              lifecycle: 'active',
              formFactor: 'appliance',
              specs: {
                Processor:
                  '2x Intel Xeon Scalable 4th/5th Gen (up to 32 cores per CPU)',
                'Max Memory': '1 TB DDR5 RDIMM (16 DIMM slots)',
                'Drive Bays': 'Up to 24x 2.5" or 12x 3.5" hot-plug',
                'PCIe Slots': '6x PCIe Gen5 + 1x OCP 3.0',
                'Network Ports': '2x 1GbE LOM + OCP 3.0 slot',
                'Power Supply': '1+1 redundant up to 1400W',
                'Form Factor': '2U rack',
                Management: 'iDRAC9 Enterprise',
              },
              children: [],
            },
            {
              nodeId: 'dell-poweredge-r860',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerEdge R860',
              nameKo: 'PowerEdge R860',
              description:
                '2U 4-socket high-performance rack server for mission-critical databases, ERP, and large-scale virtualization',
              descriptionKo:
                '미션 크리티컬 데이터베이스, ERP 및 대규모 가상화를 위한 2U 4소켓 고성능 랙 서버',
              sourceUrl:
                'https://www.dell.com/en-us/shop/dell-poweredge-servers/poweredge-r860-rack-server/spd/poweredge-r860/pe_r860_tm_vi_vp',
              lifecycle: 'active',
              formFactor: 'appliance',
              specs: {
                Processor:
                  '4x Intel Xeon Scalable 4th/5th Gen (up to 60 cores per CPU)',
                'Max Memory': '8 TB DDR5 RDIMM (64 DIMM slots)',
                'Drive Bays': 'Up to 16x 2.5" NVMe/SAS/SATA',
                'PCIe Slots': '12x PCIe Gen5',
                'Network Ports': '2x 1GbE LOM + OCP 3.0 slot',
                'Power Supply': '1+1 redundant up to 2400W',
                'Form Factor': '2U rack',
                Management: 'iDRAC9 Enterprise',
              },
              children: [],
            },
            {
              nodeId: 'dell-poweredge-r960',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerEdge R960',
              nameKo: 'PowerEdge R960',
              description:
                '4U 4-socket flagship rack server for the most demanding enterprise workloads including SAP HANA, Oracle, and large in-memory databases',
              descriptionKo:
                'SAP HANA, Oracle, 대규모 인메모리 데이터베이스 등 가장 까다로운 엔터프라이즈 워크로드를 위한 4U 4소켓 플래그십 랙 서버',
              sourceUrl:
                'https://www.dell.com/en-us/shop/dell-poweredge-servers/poweredge-r960-rack-server/spd/poweredge-r960/pe_r960_tm_vi_vp',
              lifecycle: 'active',
              formFactor: 'appliance',
              specs: {
                Processor:
                  '4x Intel Xeon Scalable 4th/5th Gen (up to 60 cores per CPU)',
                'Max Memory': '16 TB DDR5 RDIMM (64 DIMM slots)',
                'Drive Bays': 'Up to 24x 2.5" NVMe/SAS/SATA + 8x NVMe',
                'PCIe Slots': '16x PCIe Gen5',
                'Network Ports': '2x 1GbE LOM + OCP 3.0 slot',
                'Power Supply': '2+2 redundant up to 2800W',
                'Form Factor': '4U rack',
                Management: 'iDRAC9 Enterprise',
                'GPU Support': 'Up to 8x single-width or 4x double-width GPU',
              },
              children: [],
            },
          ],
        },

        // ── PowerEdge AI Servers ──
        {
          nodeId: 'dell-poweredge-ai',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'PowerEdge AI Servers',
          nameKo: 'PowerEdge AI 서버',
          description:
            'Purpose-built AI infrastructure servers optimized for GPU-accelerated deep learning, LLM training, generative AI inference, and HPC workloads',
          descriptionKo:
            'GPU 가속 딥러닝, LLM 학습, 생성형 AI 추론, HPC 워크로드에 최적화된 전용 AI 인프라 서버',
          sourceUrl:
            'https://www.dell.com/en-us/shop/dell-poweredge-servers/sf/poweredge-ai-servers',
          infraNodeTypes: ['app-server', 'vm'],
          architectureRole: 'AI/ML Training Cluster / GPU Compute / HPC',
          architectureRoleKo: 'AI/ML 학습 클러스터 / GPU 컴퓨팅 / HPC',
          recommendedFor: [
            'Large language model (LLM) training and fine-tuning',
            'Generative AI inference at scale',
            'High-performance computing (HPC) and scientific simulation',
            'Deep learning and computer vision workloads',
            'GPU-accelerated data analytics',
          ],
          recommendedForKo: [
            '대규모 언어 모델 (LLM) 학습 및 파인튜닝',
            '대규모 생성형 AI 추론',
            '고성능 컴퓨팅 (HPC) 및 과학 시뮬레이션',
            '딥러닝 및 컴퓨터 비전 워크로드',
            'GPU 가속 데이터 분석',
          ],
          supportedProtocols: [
            'PCIe Gen5',
            'NVLink',
            'NVSwitch',
            'InfiniBand NDR 400G',
            'Ethernet 100/200/400GbE',
            'iDRAC9',
            'IPMI 2.0',
            'Redfish',
            'NVMe-oF',
            'GPUDirect RDMA',
          ],
          haFeatures: [
            'Redundant hot-plug power supplies (2+2 / 4+4)',
            'Hot-plug NVMe drives',
            'Redundant fans',
            'iDRAC9 Enterprise remote management',
            'GPU error correction and monitoring',
          ],
          securityCapabilities: [
            'TPM 2.0',
            'Silicon Root of Trust',
            'Secure Boot',
            'System Lockdown Mode',
            'Signed firmware updates',
            'AMD SEV / Intel SGX (CPU-dependent)',
          ],
          children: [
            {
              nodeId: 'dell-poweredge-xe9680',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerEdge XE9680',
              nameKo: 'PowerEdge XE9680',
              description:
                'Flagship 6U 8-GPU AI server supporting NVIDIA H100/H200/B200 for large-scale LLM training and generative AI',
              descriptionKo:
                '대규모 LLM 학습 및 생성형 AI를 위한 NVIDIA H100/H200/B200 지원 플래그십 6U 8-GPU AI 서버',
              sourceUrl:
                'https://www.dell.com/en-us/shop/dell-poweredge-servers/poweredge-xe9680-server/spd/poweredge-xe9680/pe_xe9680_tm_vi_vp',
              lifecycle: 'active',
              formFactor: 'appliance',
              maxThroughput: 'Up to 640 TFLOPS FP16 (8x H100 SXM)',
              specs: {
                Processor: '2x Intel Xeon Scalable 4th/5th Gen',
                'Max Memory': '4 TB DDR5 RDIMM (32 DIMM slots)',
                GPUs: '8x NVIDIA H100/H200/B200 SXM5 (NVLink + NVSwitch)',
                'GPU Interconnect': 'NVLink 4.0 (900 GB/s per GPU)',
                'Drive Bays': 'Up to 8x 2.5" NVMe hot-plug',
                'Network Ports': '2x 1GbE + up to 8x 400GbE or InfiniBand NDR',
                'Power Supply': '4+4 redundant up to 2800W each',
                'Form Factor': '6U rack',
                Management: 'iDRAC9 Enterprise',
                'TDP per GPU': 'Up to 700W',
              },
              children: [],
            },
            {
              nodeId: 'dell-poweredge-xe8640',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerEdge XE8640',
              nameKo: 'PowerEdge XE8640',
              description:
                '4U 4-GPU AI server optimized for mid-scale AI training and inference with direct liquid cooling support',
              descriptionKo:
                '직접 수냉 지원으로 중규모 AI 학습 및 추론에 최적화된 4U 4-GPU AI 서버',
              sourceUrl:
                'https://www.dell.com/en-us/shop/dell-poweredge-servers/poweredge-xe8640-server/spd/poweredge-xe8640/pe_xe8640_tm_vi_vp',
              lifecycle: 'active',
              formFactor: 'appliance',
              maxThroughput: 'Up to 320 TFLOPS FP16 (4x H100 SXM)',
              specs: {
                Processor: '2x Intel Xeon Scalable 4th/5th Gen',
                'Max Memory': '4 TB DDR5 RDIMM (32 DIMM slots)',
                GPUs: '4x NVIDIA H100/H200 SXM5 (NVLink)',
                'GPU Interconnect': 'NVLink 4.0 (900 GB/s per GPU)',
                'Drive Bays': 'Up to 4x 2.5" NVMe hot-plug',
                'Network Ports': '2x 1GbE + up to 4x 400GbE or InfiniBand NDR',
                'Power Supply': '2+2 redundant up to 2400W each',
                'Form Factor': '4U rack',
                Management: 'iDRAC9 Enterprise',
                'Cooling Support': 'Air-cooled or direct liquid cooling (DLC)',
              },
              children: [],
            },
            {
              nodeId: 'dell-poweredge-r760xa',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerEdge R760xa',
              nameKo: 'PowerEdge R760xa',
              description:
                '2U GPU-accelerated server supporting up to 4 double-width GPUs for AI inference, VDI, and visual computing',
              descriptionKo:
                'AI 추론, VDI, 비주얼 컴퓨팅을 위한 최대 4개 더블 와이드 GPU 지원 2U GPU 가속 서버',
              sourceUrl:
                'https://www.dell.com/en-us/shop/dell-poweredge-servers/poweredge-r760xa-rack-server/spd/poweredge-r760xa/pe_r760xa_tm_vi_vp',
              lifecycle: 'active',
              formFactor: 'appliance',
              specs: {
                Processor:
                  '2x Intel Xeon Scalable 4th/5th Gen (up to 64 cores per CPU)',
                'Max Memory': '2 TB DDR5 RDIMM (32 DIMM slots)',
                GPUs: 'Up to 4x double-width GPU (NVIDIA A100/H100/L40S)',
                'Drive Bays':
                  'Up to 6x 2.5" NVMe front + 2x rear hot-plug',
                'PCIe Slots': '9x PCIe Gen5 + 1x OCP 3.0',
                'Network Ports': '2x 1GbE LOM + OCP 3.0 slot',
                'Power Supply': '2+2 redundant up to 2400W',
                'Form Factor': '2U rack',
                Management: 'iDRAC9 Enterprise',
              },
              children: [],
            },
          ],
        },

        // ── PowerEdge Modular ──
        {
          nodeId: 'dell-poweredge-modular',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'PowerEdge Modular',
          nameKo: 'PowerEdge 모듈러',
          description:
            'Modular infrastructure platform with shared chassis for compute, storage, and networking sleds enabling data center simplification',
          descriptionKo:
            '데이터센터 단순화를 위해 컴퓨팅, 스토리지, 네트워킹 슬레드를 공유 섀시에 통합하는 모듈러 인프라 플랫폼',
          sourceUrl:
            'https://www.dell.com/en-us/shop/dell-poweredge-servers/sf/poweredge-modular-infrastructure',
          infraNodeTypes: ['web-server', 'app-server', 'db-server', 'vm'],
          architectureRole:
            'Data Center Core / Converged Infrastructure / Private Cloud',
          architectureRoleKo:
            '데이터센터 코어 / 컨버지드 인프라 / 프라이빗 클라우드',
          recommendedFor: [
            'Converged infrastructure consolidation',
            'High-density compute for private cloud',
            'Dynamic workload environments requiring rapid provisioning',
            'Multi-tenant hosting environments',
          ],
          recommendedForKo: [
            '컨버지드 인프라 통합',
            '프라이빗 클라우드를 위한 고밀도 컴퓨팅',
            '신속한 프로비저닝이 필요한 동적 워크로드 환경',
            '멀티 테넌트 호스팅 환경',
          ],
          supportedProtocols: [
            'PCIe Gen5',
            'Ethernet 25/100GbE',
            'FC 32G',
            'iDRAC9',
            'IPMI 2.0',
            'Redfish',
          ],
          haFeatures: [
            'Redundant chassis management modules',
            'Redundant power supplies and fans',
            'Hot-plug compute sleds',
            'Automated failover via OpenManage',
          ],
          securityCapabilities: [
            'TPM 2.0',
            'Silicon Root of Trust',
            'Secure Boot',
            'System Lockdown Mode',
          ],
          children: [
            {
              nodeId: 'dell-poweredge-mx7000',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerEdge MX7000',
              nameKo: 'PowerEdge MX7000',
              description:
                'Modular chassis platform supporting up to 8 compute sleds with shared networking and storage fabric',
              descriptionKo:
                '최대 8개의 컴퓨팅 슬레드를 공유 네트워킹 및 스토리지 패브릭으로 지원하는 모듈러 섀시 플랫폼',
              sourceUrl:
                'https://www.dell.com/en-us/shop/dell-poweredge-servers/poweredge-mx7000-modular-chassis/spd/poweredge-mx7000',
              lifecycle: 'active',
              formFactor: 'chassis',
              specs: {
                'Chassis Size': '7U enclosure',
                'Compute Slots': 'Up to 8 single-width or 4 double-width sleds',
                Networking: '25/100GbE switching modules (2 slots)',
                Storage: 'Shared SAS storage modules (2 slots)',
                'Power Supply': '6x 3000W hot-plug PSUs (N+N redundancy)',
                Management: 'Dual chassis management modules (CMC)',
                Cooling: 'Redundant hot-plug fan modules',
              },
              children: [],
            },
            {
              nodeId: 'dell-poweredge-mx760c',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerEdge MX760c',
              nameKo: 'PowerEdge MX760c',
              description:
                'Single-width compute sled for MX7000 chassis with dual Intel Xeon Scalable and high memory density',
              descriptionKo:
                'MX7000 섀시용 듀얼 Intel Xeon Scalable과 높은 메모리 밀도를 갖춘 싱글 와이드 컴퓨팅 슬레드',
              sourceUrl:
                'https://www.dell.com/en-us/shop/dell-poweredge-servers/poweredge-mx760c-compute-sled/spd/poweredge-mx760c',
              lifecycle: 'active',
              formFactor: 'appliance',
              specs: {
                Processor:
                  '2x Intel Xeon Scalable 4th/5th Gen (up to 64 cores per CPU)',
                'Max Memory': '2 TB DDR5 RDIMM (32 DIMM slots)',
                'Drive Bays': 'Up to 6x 2.5" SAS/SATA/NVMe',
                Networking:
                  'Mezzanine cards: 2x 25GbE or 2x 32G FC',
                'Form Factor': 'Single-width compute sled',
                Management: 'iDRAC9 Enterprise (via chassis CMC)',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 2. Storage
    // =====================================================================
    {
      nodeId: 'dell-storage',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Storage',
      nameKo: '스토리지',
      description:
        'Dell storage portfolio spanning unified block/file arrays, scale-out NAS, software-defined storage, object storage, and data protection solutions',
      descriptionKo:
        '통합 블록/파일 어레이, 스케일아웃 NAS, 소프트웨어 정의 스토리지, 오브젝트 스토리지, 데이터 보호 솔루션을 아우르는 Dell 스토리지 포트폴리오',
      sourceUrl: 'https://www.dell.com/en-us/shop/scc/sc/storage-products',
      infraNodeTypes: ['san-nas', 'storage', 'object-storage', 'backup'],
      children: [
        // ── PowerStore ──
        {
          nodeId: 'dell-powerstore',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'PowerStore',
          nameKo: 'PowerStore',
          description:
            'Modern unified block and file storage platform with inline deduplication, compression, and programmable automation via AppsON',
          descriptionKo:
            '인라인 중복 제거, 압축, AppsON 기반 프로그래밍 가능 자동화를 갖춘 최신 통합 블록 및 파일 스토리지 플랫폼',
          sourceUrl:
            'https://www.dell.com/en-us/dt/storage/powerstore-storage-appliance.htm',
          infraNodeTypes: ['san-nas', 'storage'],
          architectureRole:
            'Primary Storage / Data Center Core / Hybrid Cloud Storage',
          architectureRoleKo:
            '프라이머리 스토리지 / 데이터센터 코어 / 하이브리드 클라우드 스토리지',
          recommendedFor: [
            'Mixed block and file workloads (SAN + NAS)',
            'VMware/Hyper-V virtualized environments',
            'Database storage (SQL Server, Oracle, SAP HANA)',
            'Cloud-connected hybrid storage tier',
            'Consolidation of legacy SAN/NAS silos',
          ],
          recommendedForKo: [
            '혼합 블록 및 파일 워크로드 (SAN + NAS)',
            'VMware/Hyper-V 가상화 환경',
            '데이터베이스 스토리지 (SQL Server, Oracle, SAP HANA)',
            '클라우드 연결 하이브리드 스토리지 티어',
            '레거시 SAN/NAS 사일로 통합',
          ],
          supportedProtocols: [
            'iSCSI',
            'FC 16/32G',
            'NVMe-oF (FC-NVMe, RoCE)',
            'NFS v3/v4.1',
            'SMB 3.0',
            'VASA',
            'REST API',
          ],
          haFeatures: [
            'Active-Active controller architecture',
            'Non-disruptive upgrades',
            'Metro volume (synchronous replication)',
            'Asynchronous replication',
            'Automated failover and failback',
            'AppsON container integration for data mobility',
          ],
          securityCapabilities: [
            'Data at rest encryption (FIPS 140-2 SEDs)',
            'Data in flight encryption (TLS/IPSec)',
            'Role-based access control (RBAC)',
            'LDAP/AD integration',
            'Audit logging',
            'Secure multi-tenancy',
          ],
          children: [
            {
              nodeId: 'dell-powerstore-1200t',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerStore 1200T',
              nameKo: 'PowerStore 1200T',
              description:
                'Entry-level unified storage appliance for mid-size deployments with up to 96 drives',
              descriptionKo:
                '최대 96개 드라이브를 갖춘 중규모 배포를 위한 엔트리급 통합 스토리지 어플라이언스',
              sourceUrl:
                'https://www.dell.com/en-us/dt/storage/powerstore-storage-appliance.htm',
              lifecycle: 'active',
              formFactor: 'appliance',
              specs: {
                'Raw Capacity': 'Up to 1.2 PB (96 drives)',
                'Max IOPS': '600,000 IOPS (block)',
                Bandwidth: '12 GB/s',
                'Front-End Ports':
                  '4x 25GbE iSCSI or 4x 32G FC per controller',
                Controllers: '2 (Active-Active)',
                'Form Factor': '2U appliance',
                'Data Services':
                  'Inline dedup, compression, thin provisioning',
                Management: 'PowerStore Manager (HTML5)',
              },
              children: [],
            },
            {
              nodeId: 'dell-powerstore-3200t',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerStore 3200T',
              nameKo: 'PowerStore 3200T',
              description:
                'Mid-range unified storage appliance with enhanced IOPS and bandwidth for growing enterprise workloads',
              descriptionKo:
                '성장하는 엔터프라이즈 워크로드를 위한 향상된 IOPS와 대역폭을 갖춘 미드레인지 통합 스토리지 어플라이언스',
              sourceUrl:
                'https://www.dell.com/en-us/dt/storage/powerstore-storage-appliance.htm',
              lifecycle: 'active',
              formFactor: 'appliance',
              specs: {
                'Raw Capacity': 'Up to 2.4 PB (96 drives)',
                'Max IOPS': '1,500,000 IOPS (block)',
                Bandwidth: '25 GB/s',
                'Front-End Ports':
                  '4x 25GbE iSCSI or 4x 32G FC per controller',
                Controllers: '2 (Active-Active)',
                'Form Factor': '2U appliance',
                'Data Services':
                  'Inline dedup, compression, thin provisioning',
                Management: 'PowerStore Manager (HTML5)',
              },
              children: [],
            },
            {
              nodeId: 'dell-powerstore-5200t',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerStore 5200T',
              nameKo: 'PowerStore 5200T',
              description:
                'High-performance unified storage for demanding enterprise databases and virtualization with 2M+ IOPS',
              descriptionKo:
                '200만 이상 IOPS로 까다로운 엔터프라이즈 데이터베이스 및 가상화를 위한 고성능 통합 스토리지',
              sourceUrl:
                'https://www.dell.com/en-us/dt/storage/powerstore-storage-appliance.htm',
              lifecycle: 'active',
              formFactor: 'appliance',
              specs: {
                'Raw Capacity': 'Up to 4.7 PB (96 drives)',
                'Max IOPS': '2,500,000 IOPS (block)',
                Bandwidth: '45 GB/s',
                'Front-End Ports':
                  '4x 25GbE iSCSI or 4x 32G FC per controller',
                Controllers: '2 (Active-Active)',
                'Form Factor': '2U appliance',
                'Data Services':
                  'Inline dedup, compression, thin provisioning, metro volume',
                Management: 'PowerStore Manager (HTML5)',
              },
              children: [],
            },
            {
              nodeId: 'dell-powerstore-9200t',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerStore 9200T',
              nameKo: 'PowerStore 9200T',
              description:
                'Flagship unified storage appliance with highest IOPS and capacity for mission-critical enterprise workloads',
              descriptionKo:
                '미션 크리티컬 엔터프라이즈 워크로드를 위한 최고 IOPS 및 용량의 플래그십 통합 스토리지 어플라이언스',
              sourceUrl:
                'https://www.dell.com/en-us/dt/storage/powerstore-storage-appliance.htm',
              lifecycle: 'active',
              formFactor: 'appliance',
              specs: {
                'Raw Capacity': 'Up to 9.4 PB (96 drives per appliance)',
                'Max IOPS': '4,200,000 IOPS (block)',
                Bandwidth: '75 GB/s',
                'Front-End Ports':
                  '4x 100GbE iSCSI or 4x 32G FC per controller',
                Controllers: '2 (Active-Active)',
                'Form Factor': '2U appliance',
                'Data Services':
                  'Inline dedup, compression, thin provisioning, metro volume',
                Management: 'PowerStore Manager (HTML5)',
              },
              children: [],
            },
          ],
        },

        // ── PowerScale ──
        {
          nodeId: 'dell-powerscale',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'PowerScale',
          nameKo: 'PowerScale',
          description:
            'Scale-out NAS storage platform based on OneFS for unstructured data at petabyte scale with inline data reduction',
          descriptionKo:
            '페타바이트 규모의 비정형 데이터를 인라인 데이터 축소와 함께 지원하는 OneFS 기반 스케일아웃 NAS 스토리지 플랫폼',
          sourceUrl:
            'https://www.dell.com/en-us/dt/storage/powerscale.htm',
          infraNodeTypes: ['san-nas', 'storage'],
          architectureRole: 'Scale-Out NAS / Data Lake / Unstructured Data Tier',
          architectureRoleKo:
            '스케일아웃 NAS / 데이터 레이크 / 비정형 데이터 티어',
          recommendedFor: [
            'Large-scale unstructured data (media, genomics, IoT)',
            'Data lake and analytics staging',
            'Home directory and file share consolidation',
            'AI/ML training data pipelines',
            'Healthcare PACS/VNA image archival',
          ],
          recommendedForKo: [
            '대규모 비정형 데이터 (미디어, 유전체학, IoT)',
            '데이터 레이크 및 분석 스테이징',
            '홈 디렉토리 및 파일 공유 통합',
            'AI/ML 학습 데이터 파이프라인',
            '의료 PACS/VNA 이미지 아카이빙',
          ],
          supportedProtocols: [
            'NFS v3/v4/v4.1',
            'SMB 2.1/3.0/3.1.1',
            'HDFS',
            'S3 (object via gateway)',
            'HTTP/HTTPS',
            'FTP',
            'Swift',
            'REST API',
          ],
          haFeatures: [
            'N+1/N+2/N+3/N+4 data protection',
            'Non-disruptive rolling upgrades',
            'SyncIQ asynchronous replication',
            'SmartPools automated tiering',
            'Self-healing data protection',
          ],
          securityCapabilities: [
            'Data at rest encryption (SEDs)',
            'WORM compliance (SmartLock)',
            'RBAC with zone-based access',
            'Kerberos / LDAP / AD authentication',
            'Audit logging (CEE/Syslog)',
            'NDMP backup integration',
          ],
          children: [
            {
              nodeId: 'dell-powerscale-f910',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerScale F910',
              nameKo: 'PowerScale F910',
              description:
                'All-flash flagship NAS node delivering maximum throughput for AI/ML, media, and performance-intensive unstructured workloads',
              descriptionKo:
                'AI/ML, 미디어 및 성능 집약적 비정형 워크로드를 위해 최대 처리량을 제공하는 올플래시 플래그십 NAS 노드',
              sourceUrl:
                'https://www.dell.com/en-us/dt/storage/powerscale.htm',
              lifecycle: 'active',
              formFactor: 'appliance',
              specs: {
                'Node Capacity': 'Up to 920 TB per node (NVMe SSD)',
                'Max Cluster': 'Up to 252 nodes per cluster',
                'Throughput per Node': '39 GB/s read',
                'Network Ports': '2x 100GbE front-end + 2x 100GbE back-end',
                'Form Factor': '1U per node',
                'Data Reduction': 'Inline compression and deduplication',
                OS: 'OneFS',
              },
              children: [],
            },
            {
              nodeId: 'dell-powerscale-f710',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerScale F710',
              nameKo: 'PowerScale F710',
              description:
                'All-flash mid-tier NAS node balancing performance and density for general enterprise unstructured data',
              descriptionKo:
                '범용 엔터프라이즈 비정형 데이터를 위한 성능과 밀도의 균형을 갖춘 올플래시 미드티어 NAS 노드',
              sourceUrl:
                'https://www.dell.com/en-us/dt/storage/powerscale.htm',
              lifecycle: 'active',
              formFactor: 'appliance',
              specs: {
                'Node Capacity': 'Up to 368 TB per node (NVMe SSD)',
                'Max Cluster': 'Up to 252 nodes per cluster',
                'Throughput per Node': '15 GB/s read',
                'Network Ports': '2x 25GbE front-end + 2x 25GbE back-end',
                'Form Factor': '1U per node',
                'Data Reduction': 'Inline compression and deduplication',
                OS: 'OneFS',
              },
              children: [],
            },
            {
              nodeId: 'dell-powerscale-f210',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerScale F210',
              nameKo: 'PowerScale F210',
              description:
                'Entry-level all-flash NAS node for cost-effective scale-out file storage',
              descriptionKo:
                '비용 효율적인 스케일아웃 파일 스토리지를 위한 엔트리급 올플래시 NAS 노드',
              sourceUrl:
                'https://www.dell.com/en-us/dt/storage/powerscale.htm',
              lifecycle: 'active',
              formFactor: 'appliance',
              specs: {
                'Node Capacity': 'Up to 184 TB per node (SSD)',
                'Max Cluster': 'Up to 252 nodes per cluster',
                'Throughput per Node': '8 GB/s read',
                'Network Ports': '4x 25GbE front-end + 2x 25GbE back-end',
                'Form Factor': '1U per node',
                'Data Reduction': 'Inline compression',
                OS: 'OneFS',
              },
              children: [],
            },
            {
              nodeId: 'dell-powerscale-h700',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerScale H700',
              nameKo: 'PowerScale H700',
              description:
                'Hybrid NAS node with SSD caching and HDD capacity for archive and cost-sensitive unstructured data',
              descriptionKo:
                '아카이브 및 비용 민감한 비정형 데이터를 위한 SSD 캐싱과 HDD 용량을 갖춘 하이브리드 NAS 노드',
              sourceUrl:
                'https://www.dell.com/en-us/dt/storage/powerscale.htm',
              lifecycle: 'active',
              formFactor: 'appliance',
              specs: {
                'Node Capacity': 'Up to 480 TB per node (HDD + SSD cache)',
                'Max Cluster': 'Up to 252 nodes per cluster',
                'Throughput per Node': '6.5 GB/s read',
                'Network Ports': '2x 25GbE front-end + 2x 25GbE back-end',
                'Form Factor': '4U per node',
                'Cache Tier': 'SSD metadata and read caching',
                OS: 'OneFS',
              },
              children: [],
            },
          ],
        },

        // ── PowerFlex ──
        {
          nodeId: 'dell-powerflex',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'PowerFlex',
          nameKo: 'PowerFlex',
          description:
            'Software-defined storage and HCI platform providing block storage at scale with linear performance scaling',
          descriptionKo:
            '선형 성능 확장이 가능한 대규모 블록 스토리지를 제공하는 소프트웨어 정의 스토리지 및 HCI 플랫폼',
          sourceUrl:
            'https://www.dell.com/en-us/dt/storage/powerflex.htm',
          infraNodeTypes: ['san-nas', 'storage'],
          architectureRole:
            'Software-Defined Storage / HCI / Disaggregated Compute+Storage',
          architectureRoleKo:
            '소프트웨어 정의 스토리지 / HCI / 분리형 컴퓨팅+스토리지',
          recommendedFor: [
            'Software-defined infrastructure consolidation',
            'Hyper-converged deployments (compute + storage)',
            'Database-as-a-service (DBaaS) platforms',
            'Private cloud block storage tier',
            'DevOps and container persistent volumes',
          ],
          recommendedForKo: [
            '소프트웨어 정의 인프라 통합',
            '하이퍼 컨버지드 배포 (컴퓨팅 + 스토리지)',
            'Database-as-a-Service (DBaaS) 플랫폼',
            '프라이빗 클라우드 블록 스토리지 티어',
            'DevOps 및 컨테이너 영구 볼륨',
          ],
          supportedProtocols: [
            'iSCSI',
            'NVMe/TCP',
            'NVMe-oF',
            'SDC (ScaleIO Data Client)',
            'CSI (Kubernetes)',
            'REST API',
          ],
          haFeatures: [
            'Mesh-mirror data protection (no RAID)',
            'Non-disruptive scaling',
            'Self-healing rebuild',
            'Dual SDC path redundancy',
            'Automated rebalancing',
          ],
          securityCapabilities: [
            'Data at rest encryption',
            'RBAC',
            'Secure multi-tenancy',
            'Certificate-based authentication',
            'FIPS 140-2 compliant (software)',
          ],
          children: [
            {
              nodeId: 'dell-powerflex-rack',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerFlex Rack',
              nameKo: 'PowerFlex Rack',
              description:
                'Fully engineered rack-scale HCI solution integrating compute, storage, and networking in a validated design',
              descriptionKo:
                '검증된 설계로 컴퓨팅, 스토리지, 네트워킹을 통합한 완전 엔지니어링 랙 스케일 HCI 솔루션',
              sourceUrl:
                'https://www.dell.com/en-us/dt/storage/powerflex.htm',
              lifecycle: 'active',
              formFactor: 'appliance',
              specs: {
                'Max Nodes': 'Up to 128 nodes per cluster',
                'Max Capacity': 'Up to 32 PB per cluster',
                'Performance': 'Linear scaling with each node added',
                'Compute Nodes': 'PowerEdge R-series servers',
                Networking: 'Integrated 25/100GbE switches',
                'Data Protection': 'Mesh-mirror (configurable 1-copy or 2-copy)',
                Management: 'PowerFlex Manager',
              },
              children: [],
            },
            {
              nodeId: 'dell-powerflex-appliance',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerFlex Appliance',
              nameKo: 'PowerFlex Appliance',
              description:
                'Disaggregated HCI appliance allowing independent scaling of compute and storage tiers',
              descriptionKo:
                '컴퓨팅과 스토리지 티어의 독립적 확장이 가능한 분리형 HCI 어플라이언스',
              sourceUrl:
                'https://www.dell.com/en-us/dt/storage/powerflex.htm',
              lifecycle: 'active',
              formFactor: 'appliance',
              specs: {
                'Max Nodes': 'Up to 128 nodes per cluster',
                'Max Capacity': 'Up to 32 PB per cluster',
                'Storage-Only Nodes': 'Dedicated NVMe/SSD storage nodes',
                'Compute-Only Nodes': 'PowerEdge servers (no local storage)',
                Networking: '25/100GbE fabric',
                'Data Protection': 'Mesh-mirror (configurable)',
                Management: 'PowerFlex Manager',
              },
              children: [],
            },
          ],
        },

        // ── ECS (Object Storage) ──
        {
          nodeId: 'dell-ecs',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'ECS',
          nameKo: 'ECS',
          description:
            'Enterprise object storage platform for S3-compatible cloud-scale unstructured data with geo-distributed replication',
          descriptionKo:
            '지리적 분산 복제를 갖춘 S3 호환 클라우드 스케일 비정형 데이터를 위한 엔터프라이즈 오브젝트 스토리지 플랫폼',
          sourceUrl:
            'https://www.dell.com/en-us/dt/storage/ecs/index.htm',
          infraNodeTypes: ['object-storage'],
          architectureRole:
            'Object Storage Tier / Cloud-Native Data Lake / Backup Target',
          architectureRoleKo:
            '오브젝트 스토리지 티어 / 클라우드 네이티브 데이터 레이크 / 백업 대상',
          recommendedFor: [
            'S3-compatible object storage for cloud-native applications',
            'Long-term data retention and compliance archival',
            'Backup-to-object target for PowerProtect',
            'IoT and sensor data ingestion at scale',
            'Multi-site geo-distributed data lake',
          ],
          recommendedForKo: [
            '클라우드 네이티브 애플리케이션을 위한 S3 호환 오브젝트 스토리지',
            '장기 데이터 보존 및 컴플라이언스 아카이빙',
            'PowerProtect 백업 대상 오브젝트 스토리지',
            '대규모 IoT 및 센서 데이터 수집',
            '멀티 사이트 지리적 분산 데이터 레이크',
          ],
          supportedProtocols: [
            'S3',
            'Swift',
            'Atmos',
            'CAS (Centera)',
            'NFS (via access point)',
            'HDFS',
            'REST API',
          ],
          haFeatures: [
            'Geo-distributed replication (multi-site)',
            'Erasure coding',
            'Self-healing data protection',
            'Non-disruptive upgrades',
          ],
          securityCapabilities: [
            'Server-side encryption (SSE-S3)',
            'Bucket-level access policies',
            'WORM / Object Lock',
            'LDAP/AD/Kerberos authentication',
            'TLS in-transit encryption',
          ],
          children: [
            {
              nodeId: 'dell-ecs-appliance',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'Dell ECS',
              nameKo: 'Dell ECS',
              description:
                'Enterprise object storage appliance with scale-out architecture supporting exabyte-class deployments',
              descriptionKo:
                '엑사바이트급 배포를 지원하는 스케일아웃 아키텍처의 엔터프라이즈 오브젝트 스토리지 어플라이언스',
              sourceUrl:
                'https://www.dell.com/en-us/dt/storage/ecs/index.htm',
              lifecycle: 'active',
              formFactor: 'appliance',
              specs: {
                'Max Capacity': 'Exabyte-class (scales linearly)',
                'Min Cluster': '4 nodes',
                'Node Options': 'ECS EX500 (NVMe), EX3000 (HDD)',
                'Object Size': '1 byte to 5 TB per object',
                Replication: 'Cross-site (2+ sites), erasure coding',
                'Form Factor': '2U per node',
                Management: 'ECS Portal / REST API',
              },
              children: [],
            },
          ],
        },

        // ── PowerProtect ──
        {
          nodeId: 'dell-powerprotect',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'PowerProtect',
          nameKo: 'PowerProtect',
          description:
            'Data protection and backup platform including purpose-built backup appliances, integrated appliances, and cyber recovery solutions',
          descriptionKo:
            '전용 백업 어플라이언스, 통합 어플라이언스, 사이버 복구 솔루션을 포함하는 데이터 보호 및 백업 플랫폼',
          sourceUrl:
            'https://www.dell.com/en-us/dt/data-protection/index.htm',
          infraNodeTypes: ['backup'],
          architectureRole:
            'Backup Target / Disaster Recovery / Cyber Recovery Vault',
          architectureRoleKo:
            '백업 대상 / 재해 복구 / 사이버 복구 볼트',
          recommendedFor: [
            'Enterprise backup consolidation',
            'Ransomware-resilient cyber recovery',
            'Disaster recovery with cloud tiering',
            'Long-term data retention with deduplication',
            'VM and database-level backup/restore',
          ],
          recommendedForKo: [
            '엔터프라이즈 백업 통합',
            '랜섬웨어 대응 사이버 복구',
            '클라우드 티어링을 통한 재해 복구',
            '중복 제거를 통한 장기 데이터 보존',
            'VM 및 데이터베이스 수준 백업/복원',
          ],
          supportedProtocols: [
            'DD Boost',
            'NFS',
            'CIFS/SMB',
            'iSCSI (VTL)',
            'FC (VTL)',
            'S3 (cloud tier)',
            'NDMP',
            'REST API',
          ],
          haFeatures: [
            'Active-active HA (Data Domain)',
            'Replication (MTree replication)',
            'Cloud Disaster Recovery',
            'Cyber Recovery Vault (air-gapped)',
            'Automated failover',
          ],
          securityCapabilities: [
            'Data at rest encryption',
            'Data in flight encryption (DD Boost over FC/IP)',
            'Cyber Recovery Vault (air-gapped isolation)',
            'Immutable snapshots / retention lock',
            'RBAC',
            'MFA support',
          ],
          children: [
            {
              nodeId: 'dell-powerprotect-dd',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerProtect DD (Data Domain) Series',
              nameKo: 'PowerProtect DD (Data Domain) 시리즈',
              description:
                'Purpose-built backup appliance with inline deduplication delivering up to 65:1 reduction ratio for enterprise backup consolidation',
              descriptionKo:
                '엔터프라이즈 백업 통합을 위한 최대 65:1 축소 비율의 인라인 중복 제거를 갖춘 전용 백업 어플라이언스',
              sourceUrl:
                'https://www.dell.com/en-us/dt/data-protection/powerprotect-dd-series-appliances/index.htm',
              lifecycle: 'active',
              formFactor: 'appliance',
              maxThroughput: 'Up to 68.8 TB/hr aggregate throughput',
              specs: {
                'Logical Capacity': 'Up to 97.2 PB per system (with dedup)',
                'Dedup Ratio': 'Up to 65:1 average',
                Throughput: 'Up to 68.8 TB/hr aggregate',
                Models: 'DD3300, DD6900, DD9400, DD9900',
                'Cloud Tier': 'S3-compatible (AWS, Azure, GCP)',
                Replication: 'MTree, managed file, directory',
                'Form Factor': '2U-4U depending on model',
                Management: 'Data Domain Management Center / DDMC',
              },
              children: [],
            },
            {
              nodeId: 'dell-powerprotect-dp',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerProtect DP Series',
              nameKo: 'PowerProtect DP 시리즈',
              description:
                'Integrated data protection appliance combining backup software, search, analytics, and DD dedup storage in a single system',
              descriptionKo:
                '백업 소프트웨어, 검색, 분석, DD 중복 제거 스토리지를 단일 시스템에 결합한 통합 데이터 보호 어플라이언스',
              sourceUrl:
                'https://www.dell.com/en-us/dt/data-protection/powerprotect-dp-series-backup-appliance.htm',
              lifecycle: 'active',
              formFactor: 'appliance',
              specs: {
                'Usable Capacity': 'Up to 1 PB (with dedup)',
                Software: 'Integrated PPDM + DD OS',
                'VM Protection': 'VMware, Hyper-V image-level backup',
                'Database Protection': 'Oracle, SQL Server, SAP HANA',
                'Cloud Integration': 'Cloud DR and long-term retention',
                'Form Factor': '2U integrated appliance',
                Management: 'PowerProtect Data Manager (PPDM)',
              },
              children: [],
            },
            {
              nodeId: 'dell-powerprotect-cyber-recovery',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerProtect Cyber Recovery',
              nameKo: 'PowerProtect 사이버 복구',
              description:
                'Air-gapped cyber recovery vault solution isolating critical data from ransomware and cyber attacks with automated workflows',
              descriptionKo:
                '자동화된 워크플로우로 랜섬웨어 및 사이버 공격으로부터 핵심 데이터를 격리하는 에어갭 사이버 복구 볼트 솔루션',
              sourceUrl:
                'https://www.dell.com/en-us/dt/data-protection/cyber-recovery-solution.htm',
              lifecycle: 'active',
              formFactor: 'appliance',
              specs: {
                'Isolation Method': 'Air-gapped vault with operational gap',
                'Data Sanitization': 'CyberSense analytics for corruption detection',
                Automation: 'Automated data copy, lock, and analysis workflows',
                'Integration': 'Requires PowerProtect DD as source',
                'Recovery SLA': 'RPO/RTO configurable per policy',
                Management: 'Cyber Recovery Manager',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 3. Networking
    // =====================================================================
    {
      nodeId: 'dell-networking',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Networking',
      nameKo: '네트워킹',
      description:
        'Dell open networking portfolio including data center switches and SD-WAN edge solutions for modern network fabrics',
      descriptionKo:
        '최신 네트워크 패브릭을 위한 데이터센터 스위치 및 SD-WAN 엣지 솔루션을 포함하는 Dell 오픈 네트워킹 포트폴리오',
      sourceUrl:
        'https://www.dell.com/en-us/dt/networking/index.htm',
      infraNodeTypes: ['switch-l2', 'switch-l3'],
      children: [
        // ── PowerSwitch ──
        {
          nodeId: 'dell-powerswitch',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'PowerSwitch',
          nameKo: 'PowerSwitch',
          description:
            'Open networking switches for data center leaf-spine fabrics, campus aggregation, and enterprise access with OS10 and SONiC support',
          descriptionKo:
            'OS10 및 SONiC 지원으로 데이터센터 리프-스파인 패브릭, 캠퍼스 집선, 엔터프라이즈 액세스를 위한 오픈 네트워킹 스위치',
          sourceUrl:
            'https://www.dell.com/en-us/dt/networking/powerswitch-switches.htm',
          infraNodeTypes: ['switch-l2', 'switch-l3'],
          architectureRole:
            'Data Center Leaf / Spine / Campus Aggregation / Access',
          architectureRoleKo:
            '데이터센터 리프 / 스파인 / 캠퍼스 집선 / 액세스',
          recommendedFor: [
            'Data center leaf-spine VXLAN/EVPN fabric',
            'High-performance 100/400GbE spine switching',
            'Campus and enterprise access layer',
            'Storage network (iSCSI/NVMe-oF) switching',
            'Open networking with SONiC or OS10',
          ],
          recommendedForKo: [
            '데이터센터 리프-스파인 VXLAN/EVPN 패브릭',
            '고성능 100/400GbE 스파인 스위칭',
            '캠퍼스 및 엔터프라이즈 액세스 레이어',
            '스토리지 네트워크 (iSCSI/NVMe-oF) 스위칭',
            'SONiC 또는 OS10 기반 오픈 네트워킹',
          ],
          supportedProtocols: [
            'BGP',
            'OSPF',
            'IS-IS',
            'VXLAN',
            'EVPN',
            'MLAG/VLT',
            'LLDP',
            'LACP',
            'STP/RSTP/MSTP',
            'SNMP',
            'sFlow',
            'PFC/ECN (RoCEv2)',
          ],
          haFeatures: [
            'VLT (Virtual Link Trunking) dual-homing',
            'Redundant power supplies and fans',
            'Non-stop routing (NSR)',
            'Graceful restart',
            'Hot-swappable PSU and fan modules',
          ],
          securityCapabilities: [
            'MACsec (802.1AE)',
            'TACACS+ / RADIUS',
            'ACL (L2/L3/L4)',
            'Port security',
            'DHCP snooping',
            'Dynamic ARP inspection',
            'Storm control',
          ],
          children: [
            {
              nodeId: 'dell-s5248f-on',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerSwitch S5248F-ON',
              nameKo: 'PowerSwitch S5248F-ON',
              description:
                '1U 25/100GbE top-of-rack switch with 48x 25GbE SFP28 and 6x 100GbE QSFP28 for data center leaf deployments',
              descriptionKo:
                '데이터센터 리프 배포를 위한 48x 25GbE SFP28 및 6x 100GbE QSFP28 포트의 1U 25/100GbE 탑 오브 랙 스위치',
              sourceUrl:
                'https://www.dell.com/en-us/dt/networking/powerswitch-switches/s5200-on-series-25-100gbe.htm',
              lifecycle: 'active',
              formFactor: 'appliance',
              maxThroughput: '3.6 Tbps switching capacity',
              specs: {
                'Switching Capacity': '3.6 Tbps',
                'Forwarding Rate': '2.68 Bpps',
                Ports: '48x 25GbE SFP28 + 6x 100GbE QSFP28',
                'MAC Addresses': '256,000',
                'IPv4 Routes': '128,000',
                Latency: '< 1 us cut-through',
                'Form Factor': '1U rack',
                OS: 'OS10 Enterprise / SONiC',
              },
              children: [],
            },
            {
              nodeId: 'dell-s5296f-on',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerSwitch S5296F-ON',
              nameKo: 'PowerSwitch S5296F-ON',
              description:
                '2U high-density 25/100GbE switch with 96x 25GbE SFP28 and 8x 100GbE QSFP28 for large leaf or aggregation deployments',
              descriptionKo:
                '대규모 리프 또는 집선 배포를 위한 96x 25GbE SFP28 및 8x 100GbE QSFP28 포트의 2U 고밀도 25/100GbE 스위치',
              sourceUrl:
                'https://www.dell.com/en-us/dt/networking/powerswitch-switches/s5200-on-series-25-100gbe.htm',
              lifecycle: 'active',
              formFactor: 'appliance',
              maxThroughput: '6.4 Tbps switching capacity',
              specs: {
                'Switching Capacity': '6.4 Tbps',
                'Forwarding Rate': '4.76 Bpps',
                Ports: '96x 25GbE SFP28 + 8x 100GbE QSFP28',
                'MAC Addresses': '256,000',
                'IPv4 Routes': '128,000',
                Latency: '< 1 us cut-through',
                'Form Factor': '2U rack',
                OS: 'OS10 Enterprise / SONiC',
              },
              children: [],
            },
            {
              nodeId: 'dell-z9664f-on',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerSwitch Z9664F-ON',
              nameKo: 'PowerSwitch Z9664F-ON',
              description:
                '2U 400GbE spine/core switch with 64x 400GbE QSFP-DD ports for next-generation data center fabrics and AI networking',
              descriptionKo:
                '차세대 데이터센터 패브릭 및 AI 네트워킹을 위한 64x 400GbE QSFP-DD 포트의 2U 400GbE 스파인/코어 스위치',
              sourceUrl:
                'https://www.dell.com/en-us/dt/networking/powerswitch-switches/z9664f-on-400gbe-switch.htm',
              lifecycle: 'active',
              formFactor: 'appliance',
              maxThroughput: '51.2 Tbps switching capacity',
              specs: {
                'Switching Capacity': '51.2 Tbps',
                'Forwarding Rate': '33.3 Bpps',
                Ports: '64x 400GbE QSFP-DD (breakout to 256x 100GbE)',
                'MAC Addresses': '512,000',
                'IPv4 Routes': '512,000',
                Latency: '< 800 ns cut-through',
                'Form Factor': '2U rack',
                OS: 'OS10 Enterprise / SONiC',
                'Buffer Memory': '132 MB shared packet buffer',
              },
              children: [],
            },
            {
              nodeId: 'dell-z9332f-on',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerSwitch Z9332F-ON',
              nameKo: 'PowerSwitch Z9332F-ON',
              description:
                '1U 100/400GbE spine switch with 32x 400GbE QSFP-DD ports for high-performance data center spine and DCI',
              descriptionKo:
                '고성능 데이터센터 스파인 및 DCI를 위한 32x 400GbE QSFP-DD 포트의 1U 100/400GbE 스파인 스위치',
              sourceUrl:
                'https://www.dell.com/en-us/dt/networking/powerswitch-switches/z9332f-on-100-400gbe-switch.htm',
              lifecycle: 'active',
              formFactor: 'appliance',
              maxThroughput: '25.6 Tbps switching capacity',
              specs: {
                'Switching Capacity': '25.6 Tbps',
                'Forwarding Rate': '16.6 Bpps',
                Ports: '32x 400GbE QSFP-DD + 2x 10GbE SFP+ (mgmt)',
                'MAC Addresses': '256,000',
                'IPv4 Routes': '256,000',
                Latency: '< 800 ns cut-through',
                'Form Factor': '1U rack',
                OS: 'OS10 Enterprise / SONiC',
              },
              children: [],
            },
            {
              nodeId: 'dell-n3248te-on',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'PowerSwitch N3248TE-ON',
              nameKo: 'PowerSwitch N3248TE-ON',
              description:
                '1U 1GbE managed access switch with 48x 1GbE RJ45 and 4x 10GbE SFP+ for campus and enterprise access layer',
              descriptionKo:
                '캠퍼스 및 엔터프라이즈 액세스 레이어를 위한 48x 1GbE RJ45 및 4x 10GbE SFP+ 포트의 1U 1GbE 매니지드 액세스 스위치',
              sourceUrl:
                'https://www.dell.com/en-us/dt/networking/powerswitch-switches/n3200-series-1gbe.htm',
              lifecycle: 'active',
              formFactor: 'appliance',
              maxThroughput: '176 Gbps switching capacity',
              specs: {
                'Switching Capacity': '176 Gbps',
                'Forwarding Rate': '131 Mpps',
                Ports: '48x 1GbE RJ45 + 4x 10GbE SFP+',
                PoE: 'PoE+ (802.3at), up to 740W PoE budget',
                'MAC Addresses': '32,000',
                'IPv4 Routes': '16,000',
                Latency: '< 3 us store-and-forward',
                'Form Factor': '1U rack',
                OS: 'OS10 Enterprise',
              },
              children: [],
            },
          ],
        },

        // ── SD-WAN ──
        {
          nodeId: 'dell-sdwan',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'SD-WAN',
          nameKo: 'SD-WAN',
          description:
            'Software-defined WAN edge appliances for branch and remote office connectivity with centralized orchestration',
          descriptionKo:
            '중앙 집중식 오케스트레이션을 통한 지사 및 원격 사무소 연결을 위한 소프트웨어 정의 WAN 엣지 어플라이언스',
          sourceUrl:
            'https://www.dell.com/en-us/dt/networking/sd-wan.htm',
          infraNodeTypes: ['sd-wan'],
          architectureRole: 'Branch Edge / WAN Edge / SD-WAN CPE',
          architectureRoleKo: '지사 엣지 / WAN 엣지 / SD-WAN CPE',
          recommendedFor: [
            'Branch office WAN connectivity with application-aware routing',
            'Multi-link WAN aggregation (MPLS + broadband + LTE)',
            'Zero-touch provisioning for distributed sites',
            'Centralized SD-WAN orchestration',
          ],
          recommendedForKo: [
            '애플리케이션 인식 라우팅을 통한 지사 WAN 연결',
            '멀티 링크 WAN 집선 (MPLS + 광대역 + LTE)',
            '분산 사이트를 위한 제로 터치 프로비저닝',
            '중앙 집중식 SD-WAN 오케스트레이션',
          ],
          supportedProtocols: [
            'BGP',
            'OSPF',
            'SD-WAN overlay',
            'IPSec',
            'GRE',
            'VXLAN',
            'MPLS',
            'SNMP',
            'Netconf/YANG',
          ],
          haFeatures: [
            'Dual-WAN failover',
            'Application-aware path selection',
            'Automatic VPN failover',
            'Sub-second link failover',
          ],
          securityCapabilities: [
            'Integrated stateful firewall',
            'IPSec VPN (AES-256)',
            'URL filtering',
            'Application control',
            'Segmentation',
          ],
          children: [
            {
              nodeId: 'dell-sdwan-edge-600',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'Dell SD-WAN Edge 600',
              nameKo: 'Dell SD-WAN Edge 600',
              description:
                'Mid-range SD-WAN edge appliance for medium branch offices with 4x GbE and 2x SFP ports',
              descriptionKo:
                '4x GbE 및 2x SFP 포트를 갖춘 중규모 지사용 미드레인지 SD-WAN 엣지 어플라이언스',
              sourceUrl:
                'https://www.dell.com/en-us/dt/networking/sd-wan.htm',
              lifecycle: 'active',
              formFactor: 'appliance',
              specs: {
                'WAN Ports': '2x GbE WAN + 2x SFP WAN',
                'LAN Ports': '4x GbE LAN',
                'IPSec Throughput': '1 Gbps',
                'Concurrent Sessions': '128,000',
                'USB/LTE': 'USB port for LTE dongle failover',
                'Form Factor': 'Desktop/wall-mount',
                Management: 'SD-WAN Orchestrator (centralized)',
              },
              children: [],
            },
            {
              nodeId: 'dell-sdwan-edge-3800',
              depth: 2,
              depthLabel: 'Series',
              depthLabelKo: '시리즈',
              name: 'Dell SD-WAN Edge 3800',
              nameKo: 'Dell SD-WAN Edge 3800',
              description:
                'High-performance SD-WAN edge appliance for large branch and regional hub sites with 10GbE SFP+ uplinks',
              descriptionKo:
                '10GbE SFP+ 업링크를 갖춘 대규모 지사 및 리전 허브 사이트용 고성능 SD-WAN 엣지 어플라이언스',
              sourceUrl:
                'https://www.dell.com/en-us/dt/networking/sd-wan.htm',
              lifecycle: 'active',
              formFactor: 'appliance',
              specs: {
                'WAN Ports': '4x 10GbE SFP+ WAN',
                'LAN Ports': '8x GbE LAN + 2x 10GbE SFP+ LAN',
                'IPSec Throughput': '10 Gbps',
                'Concurrent Sessions': '1,000,000',
                'HA Mode': 'Active-Standby',
                'Form Factor': '1U rack',
                Management: 'SD-WAN Orchestrator (centralized)',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 4. Data Protection
    // =====================================================================
    {
      nodeId: 'dell-data-protection',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Data Protection',
      nameKo: '데이터 보호',
      description:
        'SaaS-based backup services and cyber recovery solutions for comprehensive enterprise data protection across on-premises and cloud',
      descriptionKo:
        '온프레미스 및 클라우드 전반에 걸친 포괄적 엔터프라이즈 데이터 보호를 위한 SaaS 기반 백업 서비스 및 사이버 복구 솔루션',
      sourceUrl:
        'https://www.dell.com/en-us/dt/data-protection/index.htm',
      infraNodeTypes: ['backup'],
      children: [
        {
          nodeId: 'dell-apex-backup-services',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'APEX Backup Services',
          nameKo: 'APEX 백업 서비스',
          description:
            'SaaS-delivered backup service protecting endpoints, Microsoft 365, hybrid workloads, and multi-cloud environments without on-premises infrastructure',
          descriptionKo:
            '온프레미스 인프라 없이 엔드포인트, Microsoft 365, 하이브리드 워크로드, 멀티 클라우드 환경을 보호하는 SaaS 백업 서비스',
          sourceUrl:
            'https://www.dell.com/en-us/dt/apex/backup-services/index.htm',
          infraNodeTypes: ['backup'],
          lifecycle: 'active',
          licensingModel: 'subscription',
          formFactor: 'cloud',
          architectureRole: 'Cloud Backup / SaaS Data Protection',
          architectureRoleKo: '클라우드 백업 / SaaS 데이터 보호',
          recommendedFor: [
            'Microsoft 365 backup (Exchange, OneDrive, SharePoint, Teams)',
            'Endpoint (laptop/desktop) backup',
            'Hybrid and multi-cloud workload protection',
            'Organizations seeking opex-based backup without on-premises appliances',
          ],
          recommendedForKo: [
            'Microsoft 365 백업 (Exchange, OneDrive, SharePoint, Teams)',
            '엔드포인트 (노트북/데스크톱) 백업',
            '하이브리드 및 멀티 클라우드 워크로드 보호',
            '온프레미스 어플라이언스 없이 운영비 기반 백업을 원하는 조직',
          ],
          supportedProtocols: ['REST API', 'HTTPS'],
          haFeatures: [
            'Multi-region cloud redundancy',
            'Automated backup scheduling',
            'Point-in-time recovery',
          ],
          securityCapabilities: [
            'End-to-end encryption (AES-256)',
            'MFA',
            'RBAC',
            'SOC 2 Type II compliant',
            'GDPR compliance support',
          ],
          specs: {
            'Deployment Model': 'SaaS (fully managed)',
            'Protected Workloads':
              'Microsoft 365, endpoints, VMware, Kubernetes, hybrid cloud',
            'Retention Policy': 'Configurable per policy (7 days to unlimited)',
            'Recovery Options':
              'Granular file, VM, mailbox, full system restore',
            Management: 'APEX Console (web-based)',
          },
          children: [],
        },
        {
          nodeId: 'dell-dp-cyber-recovery',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Dell PowerProtect Cyber Recovery',
          nameKo: 'Dell PowerProtect 사이버 복구',
          description:
            'Standalone cyber recovery vault solution providing air-gapped isolation and CyberSense analytics to protect against ransomware and destructive cyber attacks',
          descriptionKo:
            '랜섬웨어 및 파괴적 사이버 공격으로부터 보호하기 위한 에어갭 격리 및 CyberSense 분석을 제공하는 독립형 사이버 복구 볼트 솔루션',
          sourceUrl:
            'https://www.dell.com/en-us/dt/data-protection/cyber-recovery-solution.htm',
          infraNodeTypes: ['backup'],
          lifecycle: 'active',
          formFactor: 'appliance',
          architectureRole: 'Cyber Recovery Vault / Air-Gapped Isolation',
          architectureRoleKo: '사이버 복구 볼트 / 에어갭 격리',
          recommendedFor: [
            'Ransomware-resilient last-resort data recovery',
            'Regulated industry compliance (financial, healthcare, government)',
            'Critical data isolation with automated gap management',
            'Organizations requiring immutable backup copies',
          ],
          recommendedForKo: [
            '랜섬웨어 대응 최후 수단 데이터 복구',
            '규제 산업 컴플라이언스 (금융, 의료, 정부)',
            '자동화된 갭 관리를 통한 핵심 데이터 격리',
            '불변 백업 사본이 필요한 조직',
          ],
          supportedProtocols: ['DD Boost', 'REST API'],
          haFeatures: [
            'Air-gapped operational vault',
            'Automated data copy and lock',
            'CyberSense integrity analytics',
          ],
          securityCapabilities: [
            'Air-gapped network isolation',
            'Immutable data copies (retention lock)',
            'CyberSense ML-based corruption detection',
            'MFA and RBAC',
            'Audit logging',
          ],
          specs: {
            'Isolation Method': 'Air-gapped vault with automated operational gap',
            Analytics: 'CyberSense (ML-based data integrity validation)',
            Automation:
              'Policy-driven data copy, lock, and analysis workflows',
            Integration: 'PowerProtect DD as source, cloud vault option',
            Compliance: 'Supports NIST, Sheltered Harbor, SEC 17a-4',
            Management: 'Cyber Recovery Manager',
          },
          children: [],
        },
      ],
    },
  ],
};
