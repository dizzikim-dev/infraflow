/**
 * Telecom Vendor Mappings
 *
 * Cloud, managed, open-source, and on-premise product mappings
 * for telecom infrastructure components:
 *   central-office, base-station, olt, customer-premise, idc
 *
 * Telecom equipment is predominantly on-premise; cloud mappings
 * are limited to hybrid/edge deployment scenarios.
 *
 * @lastVerified 2026-02-14
 */

import type { ComponentVendorMap } from './types';

export const telecomVendorMappings: ComponentVendorMap[] = [
  // =========================================================================
  // 1. central-office (국사/POP)
  // =========================================================================
  {
    componentId: 'central-office',
    category: 'telecom',
    cloud: [
      {
        id: 'VM-central-office-aws-001',
        provider: 'aws',
        serviceName: 'AWS Outposts',
        serviceNameKo: 'AWS 아웃포스트',
        serviceTier: 'Dedicated',
        pricingModel: 'reserved',
        differentiator:
          'AWS-managed rack deployed in carrier CO facilities; extends full AWS services on-premise with single-digit ms latency to the Region',
        differentiatorKo:
          '통신사 국사에 AWS 관리형 랙을 설치하여 리전과 단일 자릿수 ms 지연으로 완전한 AWS 서비스 확장',
        docUrl: 'https://aws.amazon.com/outposts/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-central-office-azure-001',
        provider: 'azure',
        serviceName: 'Azure Stack Edge',
        serviceNameKo: 'Azure 스택 엣지',
        serviceTier: 'Edge',
        pricingModel: 'subscription',
        differentiator:
          'Azure-managed edge appliance for CO deployments; supports AI inference, IoT, and Azure Arc hybrid management at the network edge',
        differentiatorKo:
          '국사 배치용 Azure 관리형 엣지 어플라이언스; 네트워크 엣지에서 AI 추론, IoT, Azure Arc 하이브리드 관리 지원',
        docUrl:
          'https://azure.microsoft.com/en-us/products/azure-stack/edge/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-central-office-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Distributed Cloud Edge',
        serviceNameKo: 'Google 분산 클라우드 엣지',
        serviceTier: 'Edge',
        pricingModel: 'subscription',
        differentiator:
          'Google-managed infrastructure at the carrier edge; brings GKE and Google AI services to CO locations for low-latency 5G MEC workloads',
        differentiatorKo:
          '통신사 엣지에 Google 관리형 인프라 제공; CO 위치에서 GKE 및 Google AI 서비스로 저지연 5G MEC 워크로드 지원',
        docUrl: 'https://cloud.google.com/distributed-cloud/edge/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-central-office-managed-001',
        vendorName: 'KT',
        productName: 'KT Managed CO Service',
        productNameKo: 'KT 관리형 국사 서비스',
        pricingModel: 'subscription',
        differentiator:
          'Full-stack managed CO operations including power, cooling, routing, and 24/7 NOC monitoring across nationwide Korean POP network',
        differentiatorKo:
          '전국 POP 네트워크에 대한 전원, 냉각, 라우팅 및 24/7 NOC 모니터링을 포함한 풀스택 관리형 국사 운영',
        docUrl: 'https://www.kt.com/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-central-office-managed-002',
        vendorName: 'AT&T',
        productName: 'AT&T Network Edge',
        productNameKo: 'AT&T 네트워크 엣지',
        pricingModel: 'subscription',
        differentiator:
          'Carrier-grade CO and POP infrastructure management with multi-cloud edge compute integration and enterprise SLA guarantees',
        differentiatorKo:
          '멀티 클라우드 엣지 컴퓨팅 통합 및 엔터프라이즈 SLA 보장을 갖춘 캐리어급 국사 및 POP 인프라 관리',
        docUrl: 'https://www.att.com/business/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-central-office-oss-001',
        projectName: 'CORD (Central Office Re-architected as a Datacenter)',
        projectNameKo: 'CORD (데이터센터로 재구성된 국사)',
        license: 'Apache-2.0',
        description:
          'ONF reference design that transforms the CO into a cloud-native datacenter using white-box hardware, disaggregated software, and SDN/NFV. Foundation for SEBA and VOLTHA platforms.',
        descriptionKo:
          'ONF 참조 설계로 화이트박스 하드웨어, 분리형 소프트웨어, SDN/NFV를 활용하여 국사를 클라우드 네이티브 데이터센터로 전환. SEBA 및 VOLTHA 플랫폼의 기반.',
        docUrl: 'https://opennetworking.org/cord/',
        githubUrl: 'https://github.com/opencord',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-central-office-oss-002',
        projectName: 'FRRouting (FRR)',
        projectNameKo: 'FRRouting (FRR)',
        license: 'GPL-2.0',
        description:
          'Open-source IP routing protocol suite for Linux/Unix supporting BGP, OSPF, IS-IS, MPLS, and segment routing. Used in CO white-box router deployments as software routing stack.',
        descriptionKo:
          'BGP, OSPF, IS-IS, MPLS, 세그먼트 라우팅을 지원하는 Linux/Unix용 오픈소스 IP 라우팅 프로토콜 스위트. CO 화이트박스 라우터 배포의 소프트웨어 라우팅 스택으로 사용.',
        docUrl: 'https://docs.frrouting.org/',
        githubUrl: 'https://github.com/FRRouting/frr',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-central-office-nokia-001',
        vendorName: 'Nokia',
        productName: 'Nokia 7750 Service Router',
        productNameKo: 'Nokia 7750 서비스 라우터',
        modelSeries: '7750 SR-1/SR-7/SR-14/SR-s',
        productTier: 'enterprise',
        targetUseCase:
          'Carrier-grade CO/POP core and edge routing with up to 230 Tb/s capacity; deterministic forwarding via FP5 silicon for 5G transport, MPLS, and segment routing',
        targetUseCaseKo:
          '최대 230 Tb/s 용량의 캐리어급 국사/POP 코어 및 엣지 라우팅; 5G 전송, MPLS, 세그먼트 라우팅을 위한 FP5 실리콘 기반 결정론적 포워딩',
        keySpecs:
          'Up to 230 Tb/s FD, 800GE interfaces, FP5 network processor, SR OS',
        lifecycleStatus: 'active',
        productUrl:
          'https://www.nokia.com/networks/ip-networks/7750-service-router/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-central-office-cisco-001',
        vendorName: 'Cisco',
        productName: 'Cisco ASR 9000 Series',
        productNameKo: 'Cisco ASR 9000 시리즈',
        modelSeries: 'ASR 9000/9900/9010',
        productTier: 'enterprise',
        targetUseCase:
          'High-performance CO aggregation and edge routing for 5G, MPLS, and segment routing with Lightspeed+ ASICs; supports programmable QoS and network slicing',
        targetUseCaseKo:
          'Lightspeed+ ASIC 기반 5G, MPLS, 세그먼트 라우팅용 고성능 국사 집선 및 엣지 라우팅; 프로그래밍 가능 QoS 및 네트워크 슬라이싱 지원',
        keySpecs:
          'Lightspeed+ ASICs, up to 160 Tb/s, IOS XR, 400GE line cards',
        lifecycleStatus: 'active',
        productUrl:
          'https://www.cisco.com/c/en/us/products/routers/asr-9000-series-aggregation-services-routers/index.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-central-office-juniper-001',
        vendorName: 'Juniper',
        productName: 'Juniper MX Series',
        productNameKo: 'Juniper MX 시리즈',
        modelSeries: 'MX304/MX10004/MX10008/MX10016',
        productTier: 'enterprise',
        targetUseCase:
          'Universal CO edge and core routing with Trio 6 ASIC; supports 5G transport, BNG, CGNAT, and multi-service edge consolidation in a single chassis',
        targetUseCaseKo:
          'Trio 6 ASIC 기반 범용 국사 엣지 및 코어 라우팅; 단일 섀시에서 5G 전송, BNG, CGNAT, 멀티서비스 엣지 통합 지원',
        keySpecs:
          'Trio 6 ASIC, MX10K LC9600 line card, Junos OS, up to 115.2 Tb/s',
        lifecycleStatus: 'active',
        productUrl:
          'https://www.juniper.net/us/en/products/routers/mx-series.html',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 2. base-station (기지국 gNB/eNB)
  // =========================================================================
  {
    componentId: 'base-station',
    category: 'telecom',
    cloud: [
      {
        id: 'VM-base-station-aws-001',
        provider: 'aws',
        serviceName: 'AWS Integrated Private Wireless',
        serviceNameKo: 'AWS 통합 프라이빗 무선',
        serviceTier: 'Enterprise',
        pricingModel: 'pay-per-use',
        differentiator:
          'CSP-partnered private 5G/LTE service integrating carrier RAN with AWS Outposts, Local Zones, and Snowball Edge; replaces retired AWS Private 5G with carrier-managed model',
        differentiatorKo:
          '통신사 RAN을 AWS Outposts, Local Zones, Snowball Edge와 통합하는 CSP 파트너 프라이빗 5G/LTE 서비스; 폐지된 AWS Private 5G를 캐리어 관리형 모델로 대체',
        docUrl:
          'https://aws.amazon.com/telecom/integrated-private-wireless/',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-base-station-managed-001',
        vendorName: 'SKT',
        productName: 'SKT Managed 5G RAN',
        productNameKo: 'SKT 관리형 5G RAN',
        pricingModel: 'subscription',
        differentiator:
          'End-to-end 5G RAN deployment and managed operations for enterprise private networks in Korea with Samsung and Nokia equipment',
        differentiatorKo:
          'Samsung 및 Nokia 장비를 활용한 한국 내 기업 전용 네트워크용 엔드투엔드 5G RAN 구축 및 관리형 운영',
        docUrl: 'https://www.sktelecom.com/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-base-station-managed-002',
        vendorName: 'Verizon',
        productName: 'Verizon 5G Private Network',
        productNameKo: 'Verizon 5G 프라이빗 네트워크',
        pricingModel: 'subscription',
        differentiator:
          'Fully managed private 5G network service with on-premise or hybrid deployment, dedicated spectrum, and MEC integration for enterprise campus',
        differentiatorKo:
          '온프레미스 또는 하이브리드 배포, 전용 스펙트럼, 엔터프라이즈 캠퍼스용 MEC 통합이 포함된 완전 관리형 프라이빗 5G 네트워크 서비스',
        docUrl:
          'https://www.verizon.com/business/solutions/5g/private-network/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-base-station-oss-001',
        projectName: 'srsRAN Project',
        projectNameKo: 'srsRAN 프로젝트',
        license: 'AGPL-3.0',
        description:
          'Complete open-source O-RAN 5G CU/DU solution from Software Radio Systems; implements full L1/L2/L3 stack with minimal dependencies, optimized for x86 and ARM. Supports 3GPP-compliant gNB with COTS SDR hardware.',
        descriptionKo:
          'Software Radio Systems의 완전한 오픈소스 O-RAN 5G CU/DU 솔루션; 최소 의존성으로 전체 L1/L2/L3 스택 구현, x86 및 ARM 최적화. COTS SDR 하드웨어로 3GPP 호환 gNB 지원.',
        docUrl: 'https://docs.srsran.com/projects/project',
        githubUrl: 'https://github.com/srsran/srsRAN_Project',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-base-station-oss-002',
        projectName: 'OpenAirInterface 5G RAN',
        projectNameKo: 'OpenAirInterface 5G RAN',
        license: 'OAI-CSSL',
        description:
          'Open-source 5G RAN stack providing standard-compliant gNB/eNB implementation on COTS hardware. Supports simulation, prototyping, and end-to-end deployment with CU/DU split architecture under the Duranta project.',
        descriptionKo:
          'COTS 하드웨어에서 표준 호환 gNB/eNB 구현을 제공하는 오픈소스 5G RAN 스택. Duranta 프로젝트 하에서 CU/DU 분리 아키텍처로 시뮬레이션, 프로토타이핑, 엔드투엔드 배포 지원.',
        docUrl: 'https://openairinterface.org/ran/',
        githubUrl: 'https://gitlab.eurecom.fr/oai/openairinterface5g',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-base-station-nokia-001',
        vendorName: 'Nokia',
        productName: 'Nokia AirScale',
        productNameKo: 'Nokia AirScale',
        modelSeries: 'AirScale mMIMO / AirScale Base Station',
        productTier: 'enterprise',
        targetUseCase:
          'Carrier-grade 5G macro gNB with massive MIMO, Single RAN supporting 2G-5G on shared hardware; energy-saving design with 10-year Orange Poland deployment agreement',
        targetUseCaseKo:
          '매시브 MIMO를 갖춘 캐리어급 5G 매크로 gNB, 공유 하드웨어에서 2G-5G를 지원하는 Single RAN; Orange Poland 10년 배포 계약의 에너지 절약 설계',
        keySpecs:
          '64T64R/32T32R mMIMO, multi-band support, ReefShark SoC, Single RAN',
        lifecycleStatus: 'active',
        productUrl:
          'https://www.nokia.com/networks/radio-access/airscale/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-base-station-ericsson-001',
        vendorName: 'Ericsson',
        productName: 'Ericsson AIR Series',
        productNameKo: 'Ericsson AIR 시리즈',
        modelSeries: 'AIR 6449 / AIR 6488 / AIR 6468',
        productTier: 'enterprise',
        targetUseCase:
          'High-capacity 5G NR massive MIMO radio units for mid-band (3.5 GHz) deployments; 64T64R configuration with up to 200 MHz IBW, supporting eMBB and FWA',
        targetUseCaseKo:
          '중대역(3.5 GHz) 배포용 고용량 5G NR 매시브 MIMO 무선 유닛; 최대 200 MHz IBW의 64T64R 구성, eMBB 및 FWA 지원',
        keySpecs:
          'AIR 6449: 64T64R 200MHz IBW, AIR 6488: 64T64R 100MHz IBW 80W, 4G/5G dual-mode',
        lifecycleStatus: 'active',
        productUrl:
          'https://www.ericsson.com/en/portfolio/networks/ericsson-radio-system',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-base-station-samsung-001',
        vendorName: 'Samsung',
        productName: 'Samsung 5G Massive MIMO Radio',
        productNameKo: 'Samsung 5G 매시브 MIMO 라디오',
        modelSeries: '64T64R / 32T32R / Dual-Band mMIMO',
        productTier: 'enterprise',
        targetUseCase:
          'Full 5G RAN portfolio with 64T64R and 32T32R massive MIMO radios; AI-powered Mobility Enhancer boosts beamforming accuracy by 30% for moving users',
        targetUseCaseKo:
          '64T64R 및 32T32R 매시브 MIMO 라디오를 갖춘 5G RAN 풀 포트폴리오; AI 기반 Mobility Enhancer가 이동 사용자의 빔포밍 정확도를 30% 향상',
        keySpecs:
          '64T64R/32T32R mMIMO, Mobility Enhancer AI, dual-band support, O-RAN compliant',
        lifecycleStatus: 'active',
        productUrl:
          'https://www.samsung.com/global/business/networks/products/radio-access/massive-mimo-radio/',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 3. olt (광선로단말 OLT)
  // =========================================================================
  {
    componentId: 'olt',
    category: 'telecom',
    cloud: [],
    managed: [
      {
        id: 'VM-olt-managed-001',
        vendorName: 'KT',
        productName: 'KT Managed FTTH Service',
        productNameKo: 'KT 관리형 FTTH 서비스',
        pricingModel: 'subscription',
        differentiator:
          'Carrier-managed GPON/XGS-PON FTTH infrastructure covering nationwide Korean fiber network with 10G residential broadband rollout',
        differentiatorKo:
          '10G 주거용 브로드밴드 롤아웃을 포함한 전국 한국 광섬유 네트워크의 캐리어 관리형 GPON/XGS-PON FTTH 인프라',
        docUrl: 'https://www.kt.com/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-olt-managed-002',
        vendorName: 'LGU+',
        productName: 'LGU+ Managed Fiber Access',
        productNameKo: 'LGU+ 관리형 광 액세스',
        pricingModel: 'subscription',
        differentiator:
          'End-to-end managed PON access with 10G-PON upgrade path and integrated IPTV/VoIP service delivery across Korean metro and rural areas',
        differentiatorKo:
          '한국 도시 및 농촌 지역에서 10G-PON 업그레이드 경로 및 통합 IPTV/VoIP 서비스 제공이 포함된 엔드투엔드 관리형 PON 액세스',
        docUrl: 'https://www.lguplus.com/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-olt-oss-001',
        projectName: 'VOLTHA (Virtual OLT Hardware Abstraction)',
        projectNameKo: 'VOLTHA (가상 OLT 하드웨어 추상화)',
        license: 'Apache-2.0',
        description:
          'ONF open-source platform that creates a hardware abstraction layer for OLT equipment. Enables multi-vendor OLT management with a unified northbound API, part of the SEBA (SDN-Enabled Broadband Access) stack.',
        descriptionKo:
          'OLT 장비에 대한 하드웨어 추상화 계층을 생성하는 ONF 오픈소스 플랫폼. SEBA(SDN 기반 광대역 액세스) 스택의 일부로, 통합 노스바운드 API를 통한 멀티벤더 OLT 관리를 실현.',
        docUrl: 'https://opennetworking.org/voltha/',
        githubUrl: 'https://github.com/opencord/voltha-go',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-olt-nokia-001',
        vendorName: 'Nokia',
        productName: 'Nokia Lightspan MF',
        productNameKo: 'Nokia Lightspan MF',
        modelSeries: 'Lightspan MF-2 / MF-14',
        productTier: 'enterprise',
        targetUseCase:
          'Industry highest-capacity OLT supporting 25G/50G/100G PON with Quillion chipset; 20% more power-efficient than industry average, designed for decades-long deployment',
        targetUseCaseKo:
          'Quillion 칩셋 기반 업계 최고 용량 OLT로 25G/50G/100G PON 지원; 업계 평균보다 20% 높은 전력 효율, 수십 년 장기 배포 설계',
        keySpecs:
          'Quillion chipset, 25G/50G/100G PON ready, 800Gbps NT, GPON/XGS-PON/NG-PON2, Altiplano management',
        lifecycleStatus: 'active',
        productUrl:
          'https://www.nokia.com/broadband-access/gigabit-fiber/lightspan-mf-fiber-olt/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-olt-calix-001',
        vendorName: 'Calix',
        productName: 'Calix AXOS E9-2',
        productNameKo: 'Calix AXOS E9-2',
        modelSeries: 'E9-2 Intelligent Access Edge',
        productTier: 'enterprise',
        targetUseCase:
          'Intelligent Access OLT converging 100G aggregation, high-density OLT, and subscriber management; AXOS Software-Defined Access with AI-enabled predictive diagnostics',
        targetUseCaseKo:
          '100G 집선, 고밀도 OLT, 가입자 관리를 통합하는 인텔리전트 액세스 OLT; AI 기반 예측 진단을 갖춘 AXOS 소프트웨어 정의 액세스',
        keySpecs:
          '100G aggregation, GPON/XGS-PON/NG-PON2, AXOS SDN-ready, AI diagnostics, modular line cards',
        lifecycleStatus: 'active',
        productUrl:
          'https://www.calix.com/products/platform/intelligent-access/systems/axos-e9-2.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-olt-huawei-001',
        vendorName: 'Huawei',
        productName: 'Huawei SmartAX EA5800',
        productNameKo: 'Huawei SmartAX EA5800',
        modelSeries: 'EA5800-X17 / X15 / X7 / X2',
        productTier: 'enterprise',
        targetUseCase:
          'Distributed-architecture multi-service OLT supporting GPON, XGS-PON, 50G-PON combo; unified platform for FTTH/FTTO/FTTM with one optical network covering all services',
        targetUseCaseKo:
          'GPON, XGS-PON, 50G-PON 콤보를 지원하는 분산 아키텍처 멀티서비스 OLT; 모든 서비스를 하나의 광 네트워크로 커버하는 FTTH/FTTO/FTTM 통합 플랫폼',
        keySpecs:
          'GPON/XGS-PON/50G-PON Combo, distributed architecture, FTTH/FTTO/FTTM, 10GE/2.5GE/GE access',
        lifecycleStatus: 'active',
        productUrl:
          'https://e.huawei.com/en/products/optical-access/ea5800',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-olt-zte-001',
        vendorName: 'ZTE',
        productName: 'ZTE TITAN Series OLT',
        productNameKo: 'ZTE TITAN 시리즈 OLT',
        modelSeries: 'ZXA10 C600 / C650',
        productTier: 'enterprise',
        targetUseCase:
          'First-mover in commercial 10G-PON deployment; integrated 10G GPON + XGS-PON combo OLT enabling seamless legacy and next-gen PON coexistence',
        targetUseCaseKo:
          '상용 10G-PON 배포 선도; 레거시와 차세대 PON의 원활한 공존을 가능하게 하는 통합 10G GPON + XGS-PON 콤보 OLT',
        keySpecs:
          '10G GPON + XGS-PON combo, C600/C650 chassis, high-density PON, SDN-ready',
        lifecycleStatus: 'active',
        productUrl:
          'https://www.zte.com.cn/global/products/fixed-network/',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 4. customer-premise (고객구내 CPE)
  // =========================================================================
  {
    componentId: 'customer-premise',
    category: 'telecom',
    cloud: [
      {
        id: 'VM-customer-premise-aws-001',
        provider: 'aws',
        serviceName: 'AWS Snow Family',
        serviceNameKo: 'AWS Snow 패밀리',
        serviceTier: 'Edge',
        pricingModel: 'pay-per-use',
        differentiator:
          'Ruggedized edge compute devices (Snowcone, Snowball Edge) for customer premise deployments; runs EC2 and Lambda locally in disconnected or constrained environments',
        differentiatorKo:
          '고객 구내 배포용 견고한 엣지 컴퓨팅 디바이스(Snowcone, Snowball Edge); 단절되거나 제약 있는 환경에서 로컬 EC2 및 Lambda 실행',
        docUrl: 'https://aws.amazon.com/snow/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-customer-premise-azure-001',
        provider: 'azure',
        serviceName: 'Azure Stack Edge Mini R',
        serviceNameKo: 'Azure 스택 엣지 Mini R',
        serviceTier: 'Edge',
        pricingModel: 'subscription',
        differentiator:
          'Ultra-portable edge appliance for customer premise and field deployments; supports Azure IoT Edge, AI inference, and hybrid management via Azure Arc',
        differentiatorKo:
          '고객 구내 및 현장 배포용 초소형 엣지 어플라이언스; Azure IoT Edge, AI 추론, Azure Arc 기반 하이브리드 관리 지원',
        docUrl:
          'https://azure.microsoft.com/en-us/products/azure-stack/edge/',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-customer-premise-managed-001',
        vendorName: 'KT',
        productName: 'KT Managed CPE (uCPE)',
        productNameKo: 'KT 관리형 CPE (uCPE)',
        pricingModel: 'subscription',
        differentiator:
          'Universal CPE as-a-service with virtualized network functions (VNFs) including SD-WAN, firewall, and WAN optimization deployed on white-box hardware at customer site',
        differentiatorKo:
          '고객 사이트의 화이트박스 하드웨어에 SD-WAN, 방화벽, WAN 최적화를 포함한 가상 네트워크 기능(VNF)을 배포하는 유니버설 CPE 서비스',
        docUrl: 'https://www.kt.com/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-customer-premise-managed-002',
        vendorName: 'Verizon',
        productName: 'Verizon Managed SD-WAN CPE',
        productNameKo: 'Verizon 관리형 SD-WAN CPE',
        pricingModel: 'subscription',
        differentiator:
          'Fully managed SD-WAN and enterprise CPE service with zero-touch provisioning, centralized policy management, and integrated security across multi-branch deployments',
        differentiatorKo:
          '제로터치 프로비저닝, 중앙 집중식 정책 관리, 멀티 브랜치 배포 전반의 통합 보안을 갖춘 완전 관리형 SD-WAN 및 엔터프라이즈 CPE 서비스',
        docUrl: 'https://www.verizon.com/business/products/networks/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-customer-premise-oss-001',
        projectName: 'OpenWrt',
        projectNameKo: 'OpenWrt',
        license: 'GPL-2.0',
        description:
          'Open-source Linux-based router/CPE firmware supporting over 1,500 devices; provides full routing, firewall, QoS, VPN, and SD-WAN plugin capabilities for customer premise equipment',
        descriptionKo:
          '1,500개 이상 디바이스를 지원하는 오픈소스 Linux 기반 라우터/CPE 펌웨어; 고객 구내 장비용 풀 라우팅, 방화벽, QoS, VPN, SD-WAN 플러그인 기능 제공',
        docUrl: 'https://openwrt.org/',
        githubUrl: 'https://github.com/openwrt/openwrt',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-customer-premise-oss-002',
        projectName: 'VyOS',
        projectNameKo: 'VyOS',
        license: 'GPL-2.0',
        description:
          'Open-source network operating system based on Debian Linux providing enterprise routing, firewall, and VPN functionality. Suitable for virtual CPE (vCPE) and software-defined branch deployments.',
        descriptionKo:
          '엔터프라이즈 라우팅, 방화벽, VPN 기능을 제공하는 Debian Linux 기반 오픈소스 네트워크 운영체제. 가상 CPE(vCPE) 및 소프트웨어 정의 브랜치 배포에 적합.',
        docUrl: 'https://vyos.io/',
        githubUrl: 'https://github.com/vyos/vyos-build',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-customer-premise-cisco-001',
        vendorName: 'Cisco',
        productName: 'Cisco Catalyst 8000 Series',
        productNameKo: 'Cisco Catalyst 8000 시리즈',
        modelSeries: 'C8200 / C8300 / C8500',
        productTier: 'enterprise',
        targetUseCase:
          'Next-gen enterprise SD-WAN edge platform replacing ISR 4000; 2-5x higher IMIX throughput up to 90 Gbps with AES-GCM encryption, integrated Catalyst SD-WAN and security',
        targetUseCaseKo:
          'ISR 4000을 대체하는 차세대 엔터프라이즈 SD-WAN 엣지 플랫폼; AES-GCM 암호화로 최대 90 Gbps의 2-5배 높은 IMIX 처리량, 통합 Catalyst SD-WAN 및 보안',
        keySpecs:
          'Up to 90 Gbps aggregate, AES-GCM, Catalyst SD-WAN, IOS XE, DNA licensing',
        lifecycleStatus: 'active',
        productUrl:
          'https://www.cisco.com/site/us/en/products/networking/sdwan-routers/index.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-customer-premise-fortinet-001',
        vendorName: 'Fortinet',
        productName: 'FortiGate SD-WAN',
        productNameKo: 'FortiGate SD-WAN',
        modelSeries: 'FortiGate 40F / 60F / 100F / 200F',
        productTier: 'mid-range',
        targetUseCase:
          'Security-converged SD-WAN CPE with firewall, IPS, and SD-Branch built into single appliance; hardware-centric approach with FortiASIC for wire-speed threat inspection at the branch',
        targetUseCaseKo:
          '방화벽, IPS, SD-Branch가 단일 어플라이언스에 내장된 보안 통합 SD-WAN CPE; 브랜치에서 와이어 스피드 위협 검사를 위한 FortiASIC 기반 하드웨어 중심 접근',
        keySpecs:
          'FortiASIC, integrated NGFW/IPS/SD-WAN, FortiOS, SD-Branch, zero-touch deployment',
        lifecycleStatus: 'active',
        productUrl:
          'https://www.fortinet.com/products/sd-wan',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-customer-premise-juniper-001',
        vendorName: 'Juniper',
        productName: 'Juniper SRX Series',
        productNameKo: 'Juniper SRX 시리즈',
        modelSeries: 'SRX300 / SRX550 / SRX1500',
        productTier: 'enterprise',
        targetUseCase:
          'Secure gateway CPE family for SD-Branch deployments with AI-driven operations via Mist Cloud; comprehensive SRX and NFX universal CPE portfolio with Junos OS automation',
        targetUseCaseKo:
          'Mist Cloud 기반 AI 운영이 포함된 SD-Branch 배포용 보안 게이트웨이 CPE 제품군; Junos OS 자동화를 갖춘 포괄적 SRX 및 NFX 유니버설 CPE 포트폴리오',
        keySpecs:
          'SRX secure gateway, NFX uCPE, Mist AI, Junos OS, SD-Branch, cloud-managed',
        lifecycleStatus: 'active',
        productUrl:
          'https://www.juniper.net/us/en/products/security/srx-series.html',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 5. idc (IDC/데이터센터)
  // =========================================================================
  {
    componentId: 'idc',
    category: 'telecom',
    cloud: [
      {
        id: 'VM-idc-aws-001',
        provider: 'aws',
        serviceName: 'AWS Outposts',
        serviceNameKo: 'AWS 아웃포스트',
        serviceTier: 'Dedicated',
        pricingModel: 'reserved',
        differentiator:
          'Fully managed AWS infrastructure rack deployed in customer IDC; creates a private AWS micro-region with native VPC, EC2, EBS, and S3 services on-premise',
        differentiatorKo:
          '고객 IDC에 배포되는 완전 관리형 AWS 인프라 랙; 온프레미스에서 네이티브 VPC, EC2, EBS, S3 서비스를 갖춘 프라이빗 AWS 마이크로 리전 구성',
        docUrl: 'https://aws.amazon.com/outposts/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-idc-azure-001',
        provider: 'azure',
        serviceName: 'Azure Stack Hub',
        serviceNameKo: 'Azure 스택 허브',
        serviceTier: 'Dedicated',
        pricingModel: 'reserved',
        differentiator:
          'On-premises Azure extension with full IaaS/PaaS in customer IDC; supports disconnected operation, certified hardware from Dell/HPE/Lenovo, and Azure-consistent API surface',
        differentiatorKo:
          '고객 IDC에서 완전한 IaaS/PaaS를 갖춘 온프레미스 Azure 확장; Dell/HPE/Lenovo 인증 하드웨어, 단절 운영, Azure 일관 API 인터페이스 지원',
        docUrl:
          'https://azure.microsoft.com/en-us/products/azure-stack/hub/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-idc-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Distributed Cloud Hosted',
        serviceNameKo: 'Google 분산 클라우드 호스티드',
        serviceTier: 'Dedicated',
        pricingModel: 'subscription',
        differentiator:
          'Google-managed infrastructure in customer IDC with GKE, Anthos, and Google AI services; Kubernetes-native foundation supporting multi-cloud and air-gapped deployments',
        differentiatorKo:
          '고객 IDC에서 GKE, Anthos, Google AI 서비스를 갖춘 Google 관리형 인프라; 멀티 클라우드 및 에어갭 배포를 지원하는 Kubernetes 네이티브 기반',
        docUrl:
          'https://cloud.google.com/distributed-cloud/hosted/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-idc-managed-001',
        vendorName: 'Equinix',
        productName: 'Equinix International Business Exchange (IBX)',
        productNameKo: 'Equinix IBX 데이터센터',
        pricingModel: 'subscription',
        differentiator:
          'Global colocation leader with 270+ data centers across 77 metros in 36 countries; 500,000+ interconnections, IDC MarketScape Leader 2025-2026, 99.9999% uptime SLA',
        differentiatorKo:
          '36개국 77개 메트로에 270개 이상 데이터센터를 보유한 글로벌 코로케이션 리더; 500,000개 이상 상호연결, IDC MarketScape 2025-2026 리더, 99.9999% 가동률 SLA',
        docUrl: 'https://www.equinix.com/data-centers/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-idc-managed-002',
        vendorName: 'Digital Realty',
        productName: 'Digital Realty PlatformDIGITAL',
        productNameKo: 'Digital Realty PlatformDIGITAL',
        pricingModel: 'subscription',
        differentiator:
          'Hyperscale-ready colocation with 300+ facilities across 25 countries and 45M+ sq ft; large-scale campuses designed for AI and high-density compute workloads',
        differentiatorKo:
          '25개국 300개 이상 시설과 45M+ 평방피트의 하이퍼스케일 지원 코로케이션; AI 및 고밀도 컴퓨팅 워크로드를 위한 대규모 캠퍼스',
        docUrl: 'https://www.digitalrealty.com/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-idc-managed-003',
        vendorName: 'KT',
        productName: 'KT IDC',
        productNameKo: 'KT IDC',
        pricingModel: 'subscription',
        differentiator:
          'Korea largest carrier IDC operator with hyper-scale Gasan IDC (100,000+ servers); AI data center demonstration center with liquid cooling and renewable energy integration',
        differentiatorKo:
          '하이퍼스케일 가산 IDC(100,000+ 서버)를 보유한 한국 최대 통신사 IDC 운영사; 액체 냉각 및 재생 에너지 통합 AI 데이터센터 실증 센터',
        docUrl: 'https://cloud.kt.com/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-idc-managed-004',
        vendorName: 'LG CNS',
        productName: 'LG CNS Data Center',
        productNameKo: 'LG CNS 데이터센터',
        pricingModel: 'subscription',
        differentiator:
          'Managed data center with expert infrastructure staff covering servers, networks, DB, WAS, and security; ITSM-based operations achieving 99.999% capacity utilization',
        differentiatorKo:
          '서버, 네트워크, DB, WAS, 보안을 아우르는 전문 인프라 인력을 갖춘 관리형 데이터센터; ITSM 기반 운영으로 99.999% 가용률 달성',
        docUrl: 'https://www.lgcns.com/en/service/modern-it-infra-on-cloud/data-center',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-idc-oss-001',
        projectName: 'Open Compute Project (OCP)',
        projectNameKo: 'Open Compute Project (OCP)',
        license: 'Various (open hardware)',
        description:
          'Industry consortium (400+ members including Meta, Google, Microsoft) sharing open-source data center designs for servers, racks, power, cooling, and networking. Supports Open Data Center Initiative and AI-focused standards.',
        descriptionKo:
          '서버, 랙, 전원, 냉각, 네트워킹에 대한 오픈소스 데이터센터 설계를 공유하는 산업 컨소시엄(Meta, Google, Microsoft 포함 400+ 회원). Open Data Center Initiative 및 AI 중심 표준 지원.',
        docUrl: 'https://www.opencompute.org/',
        githubUrl: 'https://github.com/opencomputeproject',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-idc-oss-002',
        projectName: 'OpenDCIM',
        projectNameKo: 'OpenDCIM',
        license: 'GPL-3.0',
        description:
          'Open-source data center infrastructure management (DCIM) tool for tracking physical assets, power distribution, cooling, and rack space in IDC facilities.',
        descriptionKo:
          'IDC 시설의 물리 자산, 전력 분배, 냉각, 랙 공간을 추적하기 위한 오픈소스 데이터센터 인프라 관리(DCIM) 도구.',
        docUrl: 'https://www.opendcim.org/',
        githubUrl: 'https://github.com/samilliken/openDCIM',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-idc-vertiv-001',
        vendorName: 'Vertiv',
        productName: 'Vertiv Liebert Power & Cooling',
        productNameKo: 'Vertiv Liebert 전원 및 냉각',
        modelSeries: 'Liebert EXL S1 UPS / CoolCenter / SmartIT Rack',
        productTier: 'enterprise',
        targetUseCase:
          'End-to-end IDC critical infrastructure including UPS (Liebert EXL S1), immersion cooling (CoolCenter 25-240kW/system), and OCP-compliant rack solutions for AI/HPC deployments',
        targetUseCaseKo:
          'UPS(Liebert EXL S1), 침수 냉각(CoolCenter 25-240kW/시스템), AI/HPC 배포용 OCP 호환 랙 솔루션을 포함하는 엔드투엔드 IDC 핵심 인프라',
        keySpecs:
          'Liebert EXL S1 UPS, CoolCenter Immersion 25-240kW, PowerBar Track, SmartIT OCP rack',
        lifecycleStatus: 'active',
        productUrl: 'https://www.vertiv.com/en-us/products/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-idc-schneider-001',
        vendorName: 'Schneider Electric',
        productName: 'Schneider Electric EcoStruxure Data Center',
        productNameKo: 'Schneider Electric EcoStruxure 데이터센터',
        modelSeries: 'Galaxy UPS / InRow Cooling / NetShelter Racks',
        productTier: 'enterprise',
        targetUseCase:
          'Integrated IDC infrastructure platform with Galaxy VX UPS, InRow precision cooling, NetShelter racks, and EcoStruxure IT DCIM software; $240M R&D investment in AI-integrated sustainable solutions',
        targetUseCaseKo:
          'Galaxy VX UPS, InRow 정밀 냉각, NetShelter 랙, EcoStruxure IT DCIM 소프트웨어를 갖춘 통합 IDC 인프라 플랫폼; AI 통합 지속가능 솔루션에 $240M R&D 투자',
        keySpecs:
          'Galaxy VX UPS, InRow DX/RC, NetShelter SX, EcoStruxure IT Expert DCIM',
        lifecycleStatus: 'active',
        productUrl:
          'https://www.se.com/ww/en/work/solutions/for-business/data-centers-and-networks/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-idc-rittal-001',
        vendorName: 'Rittal',
        productName: 'Rittal Data Center Infrastructure',
        productNameKo: 'Rittal 데이터센터 인프라',
        modelSeries: 'TS IT Rack / LCP Cooling / PSM Power',
        productTier: 'mid-range',
        targetUseCase:
          'Modular IDC rack and cooling systems with TS IT server racks, LCP liquid cooling packages, and RiMatrix standardized data center modules for rapid deployment',
        targetUseCaseKo:
          'TS IT 서버 랙, LCP 액체 냉각 패키지, 신속한 배포를 위한 RiMatrix 표준화 데이터센터 모듈을 갖춘 모듈형 IDC 랙 및 냉각 시스템',
        keySpecs:
          'TS IT 42U/47U racks, LCP Inline/DX cooling, RiMatrix S modular DC, PSM power distribution',
        lifecycleStatus: 'active',
        productUrl: 'https://www.rittal.com/en-gb/products/it-infrastructure/',
        lastVerified: '2026-02-14',
      },
    ],
  },
];
