/**
 * Network Core Vendor Mappings — Cloud, managed, open-source, and on-premise
 * product mappings for all 8 core network infrastructure components.
 *
 * Components: router, switch-l2, switch-l3, load-balancer, api-gateway,
 *             sd-wan, dns, cdn
 *
 * Last updated: 2026-02-14
 */

import type { ComponentVendorMap } from './types';

export const networkCoreVendorMappings: ComponentVendorMap[] = [
  // =========================================================================
  // 1. ROUTER
  // =========================================================================
  {
    componentId: 'router',
    category: 'network',
    cloud: [
      {
        id: 'VM-router-aws-001',
        provider: 'aws',
        serviceName: 'AWS Transit Gateway',
        serviceNameKo: 'AWS 트랜짓 게이트웨이',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Hub-and-spoke VPC interconnect with support for thousands of VPCs, VPN, and Direct Connect attachments across regions',
        differentiatorKo:
          '수천 개의 VPC, VPN 및 Direct Connect 연결을 지원하는 허브앤스포크 VPC 상호 연결, 리전 간 피어링 지원',
        docUrl: 'https://docs.aws.amazon.com/vpc/latest/tgw/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-router-azure-001',
        provider: 'azure',
        serviceName: 'Azure Route Server',
        serviceNameKo: 'Azure 라우트 서버',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Managed BGP peering service that simplifies dynamic routing between NVAs and Azure virtual networks with auto route propagation',
        differentiatorKo:
          'NVA와 Azure 가상 네트워크 간 동적 라우팅을 간소화하는 관리형 BGP 피어링 서비스, 자동 경로 전파 지원',
        docUrl: 'https://learn.microsoft.com/en-us/azure/route-server/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-router-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Cloud Router',
        serviceNameKo: 'Google Cloud 라우터',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Fully distributed, software-defined cloud router with dynamic BGP route exchange for VPN and Interconnect links',
        differentiatorKo:
          'VPN 및 Interconnect 링크를 위한 동적 BGP 경로 교환이 가능한 완전 분산형 소프트웨어 정의 클라우드 라우터',
        docUrl: 'https://cloud.google.com/network-connectivity/docs/router',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-router-megaport-001',
        vendorName: 'Megaport',
        productName: 'Megaport Cloud Router (MCR)',
        productNameKo: 'Megaport 클라우드 라우터',
        pricingModel: 'subscription',
        differentiator:
          'Virtual cloud router enabling private Layer 3 connectivity between cloud providers without physical infrastructure',
        differentiatorKo:
          '물리적 인프라 없이 클라우드 제공업체 간 프라이빗 Layer 3 연결을 지원하는 가상 클라우드 라우터',
        docUrl: 'https://docs.megaport.com/mcr/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-router-equinix-001',
        vendorName: 'Equinix',
        productName: 'Equinix Fabric Cloud Router',
        productNameKo: 'Equinix Fabric 클라우드 라우터',
        pricingModel: 'subscription',
        differentiator:
          'On-demand virtual routing across Equinix Fabric with BGP support for multi-cloud and hybrid deployments',
        differentiatorKo:
          'BGP를 지원하는 Equinix Fabric 기반 온디맨드 가상 라우팅, 멀티클라우드 및 하이브리드 배포 지원',
        docUrl: 'https://docs.equinix.com/en-us/Content/Interconnection/FCR/About-FCR.htm',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-router-frrouting-001',
        projectName: 'FRRouting (FRR)',
        projectNameKo: 'FRRouting (FRR)',
        license: 'GPL-2.0',
        description:
          'Internet routing protocol suite for Linux/Unix with BGP, OSPF, IS-IS, RIP, PIM, LDP, and VRRP support; successor to Quagga',
        descriptionKo:
          'BGP, OSPF, IS-IS, RIP, PIM, LDP, VRRP를 지원하는 Linux/Unix용 인터넷 라우팅 프로토콜 스위트; Quagga 후속 프로젝트',
        docUrl: 'https://docs.frrouting.org/',
        githubUrl: 'https://github.com/FRRouting/frr',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-router-bird-001',
        projectName: 'BIRD Internet Routing Daemon',
        projectNameKo: 'BIRD 인터넷 라우팅 데몬',
        license: 'GPL-2.0',
        description:
          'Lightweight routing daemon supporting BGP, OSPF, RIP, and BFD; widely used in IXPs and as Linux route server',
        descriptionKo:
          'BGP, OSPF, RIP, BFD를 지원하는 경량 라우팅 데몬; IXP 및 Linux 라우트 서버에서 널리 사용',
        docUrl: 'https://bird.network.cz/?get_doc',
        githubUrl: 'https://gitlab.nic.cz/labs/bird',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-router-cisco-001',
        vendorName: 'Cisco',
        productName: 'Cisco Catalyst 8000 Series',
        productNameKo: 'Cisco Catalyst 8000 시리즈',
        modelSeries: 'Catalyst 8200/8300/8500',
        productTier: 'enterprise',
        targetUseCase:
          'Enterprise edge routing with SD-WAN, security, and cloud connectivity in a unified platform',
        targetUseCaseKo:
          'SD-WAN, 보안 및 클라우드 연결을 통합한 엔터프라이즈 에지 라우팅 플랫폼',
        keySpecs: 'Up to 20 Gbps throughput, IOS XE, Cisco Silicon One',
        lifecycleStatus: 'active',
        productUrl: 'https://www.cisco.com/site/us/en/products/networking/sdwan-routers/index.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-router-juniper-001',
        vendorName: 'Juniper Networks',
        productName: 'Juniper MX Series',
        productNameKo: 'Juniper MX 시리즈',
        modelSeries: 'MX204/MX304/MX480/MX960',
        productTier: 'enterprise',
        targetUseCase:
          'High-performance universal routing for service providers and large enterprises with custom Memory Bandwidth Engine',
        targetUseCaseKo:
          '커스텀 메모리 대역폭 엔진을 탑재한 서비스 프로바이더 및 대규모 엔터프라이즈용 고성능 유니버설 라우팅',
        keySpecs: 'Up to 80 Tbps capacity, Junos OS, Trio chipset',
        lifecycleStatus: 'active',
        productUrl: 'https://www.juniper.net/us/en/products/routers/mx-series.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-router-arista-001',
        vendorName: 'Arista Networks',
        productName: 'Arista 7280R3 Series',
        productNameKo: 'Arista 7280R3 시리즈',
        modelSeries: '7280R3/7280R3A',
        productTier: 'enterprise',
        targetUseCase:
          'High-density routing for data center, peering, and WAN with deep buffer support and FlexRoute engine',
        targetUseCaseKo:
          '딥 버퍼 및 FlexRoute 엔진을 갖춘 데이터센터, 피어링 및 WAN용 고밀도 라우팅',
        keySpecs: 'Up to 36x 400G ports, Arista EOS, 2M+ routes',
        lifecycleStatus: 'active',
        productUrl: 'https://www.arista.com/en/products/7280r3-series',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 2. SWITCH-L2
  // =========================================================================
  {
    componentId: 'switch-l2',
    category: 'network',
    cloud: [
      {
        id: 'VM-switch-l2-aws-001',
        provider: 'aws',
        serviceName: 'AWS VPC (Virtual Switch Layer)',
        serviceNameKo: 'AWS VPC (가상 스위치 레이어)',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Implicit L2 switching within VPC subnets; no dedicated L2 switch service — handled transparently by the VPC fabric',
        differentiatorKo:
          'VPC 서브넷 내 암시적 L2 스위칭; 별도의 L2 스위치 서비스 없이 VPC 패브릭에서 투명하게 처리',
        docUrl: 'https://docs.aws.amazon.com/vpc/latest/userguide/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-switch-l2-azure-001',
        provider: 'azure',
        serviceName: 'Azure Virtual Network (VNet Switching)',
        serviceNameKo: 'Azure 가상 네트워크 (VNet 스위칭)',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Software-defined L2 connectivity within VNet subnets with NSG integration for microsegmentation',
        differentiatorKo:
          'VNet 서브넷 내 소프트웨어 정의 L2 연결, NSG 통합을 통한 마이크로세그멘테이션 지원',
        docUrl: 'https://learn.microsoft.com/en-us/azure/virtual-network/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-switch-l2-gcp-001',
        provider: 'gcp',
        serviceName: 'Google VPC (Virtual Switching)',
        serviceNameKo: 'Google VPC (가상 스위칭)',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Andromeda SDN-based virtual switching with global VPC spanning all regions without peering',
        differentiatorKo:
          '피어링 없이 모든 리전에 걸친 글로벌 VPC를 지원하는 Andromeda SDN 기반 가상 스위칭',
        docUrl: 'https://cloud.google.com/vpc/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-switch-l2-meraki-001',
        vendorName: 'Cisco Meraki',
        productName: 'Meraki Cloud-Managed Switches',
        productNameKo: 'Meraki 클라우드 관리형 스위치',
        pricingModel: 'subscription',
        differentiator:
          'Zero-touch cloud provisioning with centralized dashboard, automatic firmware updates, and network-wide visibility',
        differentiatorKo:
          '중앙 집중식 대시보드, 자동 펌웨어 업데이트, 네트워크 전체 가시성을 갖춘 제로터치 클라우드 프로비저닝',
        docUrl: 'https://documentation.meraki.com/MS',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-switch-l2-aruba-001',
        vendorName: 'HPE Aruba',
        productName: 'Aruba Central Managed Switches',
        productNameKo: 'Aruba Central 관리형 스위치',
        pricingModel: 'subscription',
        differentiator:
          'AI-powered cloud management with AIOps for proactive troubleshooting and dynamic segmentation',
        differentiatorKo:
          '사전 문제 해결 및 동적 세그멘테이션을 위한 AIOps 기반 AI 클라우드 관리',
        docUrl: 'https://www.arubanetworks.com/products/switches/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-switch-l2-openvswitch-001',
        projectName: 'Open vSwitch (OVS)',
        projectNameKo: 'Open vSwitch (OVS)',
        license: 'Apache 2.0',
        description:
          'Production-grade multilayer virtual switch supporting OpenFlow, VXLAN, GRE, and DPDK for high-performance virtualized environments',
        descriptionKo:
          'OpenFlow, VXLAN, GRE, DPDK를 지원하는 프로덕션급 다계층 가상 스위치, 고성능 가상화 환경에 적합',
        docUrl: 'https://docs.openvswitch.org/en/latest/',
        githubUrl: 'https://github.com/openvswitch/ovs',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-switch-l2-sonic-001',
        projectName: 'SONiC (Software for Open Networking in the Cloud)',
        projectNameKo: 'SONiC (클라우드 오픈 네트워킹 소프트웨어)',
        license: 'Apache 2.0',
        description:
          'Linux-based open NOS originally from Microsoft Azure supporting white-box switches with SAI abstraction layer',
        descriptionKo:
          'Microsoft Azure에서 시작된 SAI 추상화 계층 기반 화이트박스 스위치 지원 Linux 기반 오픈 NOS',
        docUrl: 'https://sonic-net.github.io/SONiC/',
        githubUrl: 'https://github.com/sonic-net/SONiC',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-switch-l2-cisco-001',
        vendorName: 'Cisco',
        productName: 'Cisco Catalyst 9200 Series',
        productNameKo: 'Cisco Catalyst 9200 시리즈',
        modelSeries: 'C9200/C9200L/C9200CX',
        productTier: 'entry',
        targetUseCase:
          'Entry-level and branch access switching with StackWise support and essential security features',
        targetUseCaseKo:
          'StackWise 지원 및 필수 보안 기능을 갖춘 엔트리레벨 및 지사 액세스 스위칭',
        keySpecs: 'Up to 48 ports, 1G/mGig, PoE+, UADP 2.0 ASIC',
        lifecycleStatus: 'active',
        productUrl: 'https://www.cisco.com/site/us/en/products/networking/switches/catalyst-9200-series-switches/index.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-switch-l2-juniper-001',
        vendorName: 'Juniper Networks',
        productName: 'Juniper EX2300 Series',
        productNameKo: 'Juniper EX2300 시리즈',
        modelSeries: 'EX2300-24T/48T/24P/48P/C',
        productTier: 'entry',
        targetUseCase:
          'Compact access-layer switch for branch and campus with Junos OS and Virtual Chassis support',
        targetUseCaseKo:
          'Junos OS 및 Virtual Chassis를 지원하는 지사 및 캠퍼스용 컴팩트 액세스 계층 스위치',
        keySpecs: 'Up to 48 ports, 1G/10G uplink, PoE+, fanless option',
        lifecycleStatus: 'active',
        productUrl: 'https://www.juniper.net/us/en/products/switches/ex-series/ex2300-ethernet-switch.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-switch-l2-arista-001',
        vendorName: 'Arista Networks',
        productName: 'Arista 720XP Series',
        productNameKo: 'Arista 720XP 시리즈',
        modelSeries: '720XP-24ZY2/720XP-48ZC2',
        productTier: 'mid-range',
        targetUseCase:
          'Campus and edge access switching with CloudVision management, 802.3bt PoE, and MACsec encryption',
        targetUseCaseKo:
          'CloudVision 관리, 802.3bt PoE 및 MACsec 암호화를 갖춘 캠퍼스 및 에지 액세스 스위칭',
        keySpecs: 'Up to 48 mGig + 2x 100G uplinks, Arista EOS',
        lifecycleStatus: 'active',
        productUrl: 'https://www.arista.com/en/products/720xp-series',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 3. SWITCH-L3
  // =========================================================================
  {
    componentId: 'switch-l3',
    category: 'network',
    cloud: [
      {
        id: 'VM-switch-l3-aws-001',
        provider: 'aws',
        serviceName: 'AWS VPC Routing (Subnet Routing)',
        serviceNameKo: 'AWS VPC 라우팅 (서브넷 라우팅)',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'VPC route tables with prefix lists and gateway route tables providing L3 routing between subnets and to external networks',
        differentiatorKo:
          '접두사 목록 및 게이트웨이 라우트 테이블을 통한 서브넷 간 및 외부 네트워크 L3 라우팅 제공',
        docUrl: 'https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Route_Tables.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-switch-l3-azure-001',
        provider: 'azure',
        serviceName: 'Azure Virtual Network (UDR / Route Tables)',
        serviceNameKo: 'Azure 가상 네트워크 (UDR / 라우트 테이블)',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'User-Defined Routes for granular L3 traffic control between subnets with NVA and service endpoint support',
        differentiatorKo:
          'NVA 및 서비스 엔드포인트를 지원하는 서브넷 간 세분화된 L3 트래픽 제어용 사용자 정의 라우트',
        docUrl: 'https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-udr-overview',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-switch-l3-gcp-001',
        provider: 'gcp',
        serviceName: 'Google VPC Routing (Custom Routes)',
        serviceNameKo: 'Google VPC 라우팅 (커스텀 라우트)',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Policy-based routing with global VPC allowing L3 routing across all regions without separate peering configuration',
        differentiatorKo:
          '별도의 피어링 설정 없이 전 리전에서 L3 라우팅이 가능한 글로벌 VPC 정책 기반 라우팅',
        docUrl: 'https://cloud.google.com/vpc/docs/routes',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-switch-l3-meraki-001',
        vendorName: 'Cisco Meraki',
        productName: 'Meraki MS390 Cloud-Managed L3 Switches',
        productNameKo: 'Meraki MS390 클라우드 관리형 L3 스위치',
        pricingModel: 'subscription',
        differentiator:
          'Cloud-managed L3 switching with UADP 3.0 ASIC, full OSPF/BGP support, and Meraki dashboard analytics',
        differentiatorKo:
          'UADP 3.0 ASIC, 완전한 OSPF/BGP 지원, Meraki 대시보드 분석을 갖춘 클라우드 관리형 L3 스위칭',
        docUrl: 'https://documentation.meraki.com/MS/MS_Overview_and_Specifications/MS390_Overview',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-switch-l3-aruba-001',
        vendorName: 'HPE Aruba',
        productName: 'Aruba CX 6300/6400 (Central Managed)',
        productNameKo: 'Aruba CX 6300/6400 (Central 관리형)',
        pricingModel: 'subscription',
        differentiator:
          'Programmable AOS-CX with REST API, NAE analytics engine, and VSX active-active redundancy for campus core',
        differentiatorKo:
          'REST API, NAE 분석 엔진, 캠퍼스 코어용 VSX 액티브-액티브 이중화를 갖춘 프로그래밍 가능한 AOS-CX',
        docUrl: 'https://www.arubanetworks.com/products/switches/access/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-switch-l3-cumulus-001',
        projectName: 'NVIDIA Cumulus Linux',
        projectNameKo: 'NVIDIA Cumulus Linux',
        license: 'GPL-2.0 (base)',
        description:
          'Linux-native NOS for white-box switches with full L3 routing (BGP, OSPF), EVPN-VXLAN, and NVUE declarative API',
        descriptionKo:
          'BGP, OSPF, EVPN-VXLAN 및 NVUE 선언형 API를 지원하는 화이트박스 스위치용 Linux 네이티브 NOS',
        docUrl: 'https://docs.nvidia.com/networking-ethernet-software/cumulus-linux-latest/',
        githubUrl: 'https://github.com/CumulusNetworks',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-switch-l3-openvswitch-001',
        projectName: 'Open vSwitch (OVS) with L3 Routing',
        projectNameKo: 'Open vSwitch (OVS) L3 라우팅',
        license: 'Apache 2.0',
        description:
          'OVS combined with FRRouting or Linux routing stack for virtual L3 switching in data center overlay networks',
        descriptionKo:
          '데이터센터 오버레이 네트워크에서 FRRouting 또는 Linux 라우팅 스택과 결합한 가상 L3 스위칭',
        docUrl: 'https://docs.openvswitch.org/en/latest/howto/routing/',
        githubUrl: 'https://github.com/openvswitch/ovs',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-switch-l3-cisco-001',
        vendorName: 'Cisco',
        productName: 'Cisco Catalyst 9300/9400 Series',
        productNameKo: 'Cisco Catalyst 9300/9400 시리즈',
        modelSeries: 'C9300/C9300L/C9400',
        productTier: 'enterprise',
        targetUseCase:
          'Enterprise campus core and distribution with modular uplinks, StackWise Virtual, and SD-Access integration',
        targetUseCaseKo:
          '모듈형 업링크, StackWise Virtual, SD-Access 통합을 갖춘 엔터프라이즈 캠퍼스 코어 및 디스트리뷰션',
        keySpecs: 'Up to 480 Gbps stacking, UADP 3.0, IOS XE, DNA license',
        lifecycleStatus: 'active',
        productUrl: 'https://www.cisco.com/site/us/en/products/networking/switches/catalyst-9300-series-switches/index.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-switch-l3-juniper-001',
        vendorName: 'Juniper Networks',
        productName: 'Juniper EX4400 Series',
        productNameKo: 'Juniper EX4400 시리즈',
        modelSeries: 'EX4400-24T/48F/48T',
        productTier: 'enterprise',
        targetUseCase:
          'Campus aggregation and core switching with Mist AI-driven operations, EVPN-VXLAN, and MACsec',
        targetUseCaseKo:
          'Mist AI 기반 운영, EVPN-VXLAN, MACsec을 갖춘 캠퍼스 어그리게이션 및 코어 스위칭',
        keySpecs: 'Up to 48x 10G + 4x 100G, Junos OS, Virtual Chassis',
        lifecycleStatus: 'active',
        productUrl: 'https://www.juniper.net/us/en/products/switches/ex-series/ex4400-ethernet-switch.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-switch-l3-arista-001',
        vendorName: 'Arista Networks',
        productName: 'Arista 7050X4 Series',
        productNameKo: 'Arista 7050X4 시리즈',
        modelSeries: '7050X4-32C/7050X4-128C',
        productTier: 'enterprise',
        targetUseCase:
          'Data center leaf/spine L3 switching with 400G support, EVPN-VXLAN, and CloudVision-driven automation',
        targetUseCaseKo:
          '400G 지원, EVPN-VXLAN, CloudVision 자동화를 갖춘 데이터센터 리프/스파인 L3 스위칭',
        keySpecs: 'Up to 128x 100G or 32x 400G, Arista EOS, 16 MB buffer',
        lifecycleStatus: 'active',
        productUrl: 'https://www.arista.com/en/products/7050x4-series',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 4. LOAD-BALANCER
  // =========================================================================
  {
    componentId: 'load-balancer',
    category: 'network',
    cloud: [
      {
        id: 'VM-load-balancer-aws-001',
        provider: 'aws',
        serviceName: 'AWS Elastic Load Balancing (ALB/NLB)',
        serviceNameKo: 'AWS Elastic 로드 밸런싱 (ALB/NLB)',
        serviceTier: 'Application / Network',
        pricingModel: 'pay-per-use',
        differentiator:
          'ALB for HTTP/HTTPS L7 with content-based routing; NLB for TCP/UDP L4 with ultra-low latency and static IPs; both auto-scale',
        differentiatorKo:
          '콘텐츠 기반 라우팅의 HTTP/HTTPS L7용 ALB; 초저지연 및 고정 IP의 TCP/UDP L4용 NLB; 둘 다 자동 확장',
        docUrl: 'https://docs.aws.amazon.com/elasticloadbalancing/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-load-balancer-azure-001',
        provider: 'azure',
        serviceName: 'Azure Load Balancer / Application Gateway',
        serviceNameKo: 'Azure 로드 밸런서 / Application Gateway',
        serviceTier: 'Standard / WAF v2',
        pricingModel: 'pay-per-use',
        differentiator:
          'Azure LB for L4 with zone-redundant HA; Application Gateway for L7 with built-in WAF, SSL offloading, and autoscaling',
        differentiatorKo:
          '영역 중복 HA의 L4용 Azure LB; 내장 WAF, SSL 오프로딩, 자동 확장의 L7용 Application Gateway',
        docUrl: 'https://learn.microsoft.com/en-us/azure/load-balancer/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-load-balancer-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Cloud Load Balancing',
        serviceNameKo: 'Google Cloud 로드 밸런싱',
        serviceTier: 'Global / Regional',
        pricingModel: 'pay-per-use',
        differentiator:
          'Truly global L7 load balancing using Google backbone with single anycast IP, automatic multi-region failover, and Cloud Armor integration',
        differentiatorKo:
          '단일 애니캐스트 IP, 자동 멀티리전 장애 조치, Cloud Armor 통합을 갖춘 Google 백본 기반 글로벌 L7 로드 밸런싱',
        docUrl: 'https://cloud.google.com/load-balancing/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-load-balancer-cloudflare-001',
        vendorName: 'Cloudflare',
        productName: 'Cloudflare Load Balancing',
        productNameKo: 'Cloudflare 로드 밸런싱',
        pricingModel: 'subscription',
        differentiator:
          'DNS and HTTP-level global load balancing across 300+ PoPs with health checks, geo-steering, and zero-config failover',
        differentiatorKo:
          '300개 이상의 PoP에서 상태 확인, 지역별 조정, 무설정 장애 조치를 갖춘 DNS 및 HTTP 레벨 글로벌 로드 밸런싱',
        docUrl: 'https://developers.cloudflare.com/load-balancing/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-load-balancer-kemp-001',
        vendorName: 'Progress Kemp',
        productName: 'Kemp LoadMaster',
        productNameKo: 'Kemp LoadMaster',
        pricingModel: 'subscription',
        differentiator:
          'Cost-effective ADC with L4-L7 load balancing, WAF, and GSLB; available as virtual, hardware, or cloud appliance',
        differentiatorKo:
          'L4-L7 로드 밸런싱, WAF, GSLB를 갖춘 비용 효율적인 ADC; 가상, 하드웨어 또는 클라우드 어플라이언스로 제공',
        docUrl: 'https://kemptechnologies.com/loadmaster',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-load-balancer-haproxy-001',
        projectName: 'HAProxy',
        projectNameKo: 'HAProxy',
        license: 'GPL-2.0',
        description:
          'High-performance TCP/HTTP load balancer and reverse proxy used by major internet companies; supports L4/L7, SSL, and health checks',
        descriptionKo:
          '주요 인터넷 기업에서 사용하는 고성능 TCP/HTTP 로드 밸런서 및 리버스 프록시; L4/L7, SSL, 상태 확인 지원',
        docUrl: 'https://docs.haproxy.org/',
        githubUrl: 'https://github.com/haproxy/haproxy',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-load-balancer-envoy-001',
        projectName: 'Envoy Proxy',
        projectNameKo: 'Envoy 프록시',
        license: 'Apache 2.0',
        description:
          'CNCF-graduated L7 proxy and communication bus designed for microservices with advanced observability, service mesh integration, and xDS API',
        descriptionKo:
          '고급 관측성, 서비스 메시 통합, xDS API를 갖춘 마이크로서비스용 CNCF 졸업 L7 프록시 및 통신 버스',
        docUrl: 'https://www.envoyproxy.io/docs/envoy/latest/',
        githubUrl: 'https://github.com/envoyproxy/envoy',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-load-balancer-f5-001',
        vendorName: 'F5 Networks',
        productName: 'F5 BIG-IP Local Traffic Manager (LTM)',
        productNameKo: 'F5 BIG-IP LTM',
        modelSeries: 'i2000/i4000/i5000/i10000/i15000',
        productTier: 'enterprise',
        targetUseCase:
          'Enterprise ADC with advanced L4-L7 traffic management, iRules scripting, SSL offloading, and comprehensive health monitoring',
        targetUseCaseKo:
          '고급 L4-L7 트래픽 관리, iRules 스크립팅, SSL 오프로딩, 포괄적 상태 모니터링을 갖춘 엔터프라이즈 ADC',
        keySpecs: 'Up to 320 Gbps L4 throughput, iRules/iApps, FIPS 140-2',
        lifecycleStatus: 'active',
        productUrl: 'https://www.f5.com/products/big-ip-services/local-traffic-manager',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-load-balancer-citrix-001',
        vendorName: 'Cloud Software Group (Citrix)',
        productName: 'Citrix NetScaler ADC',
        productNameKo: 'Citrix NetScaler ADC',
        modelSeries: 'MPX/SDX/VPX/CPX',
        productTier: 'enterprise',
        targetUseCase:
          'Multi-function ADC with L4-L7 load balancing, GSLB, web app firewall, and application visibility for hybrid environments',
        targetUseCaseKo:
          '하이브리드 환경을 위한 L4-L7 로드 밸런싱, GSLB, 웹 앱 방화벽, 애플리케이션 가시성의 다기능 ADC',
        keySpecs: 'Up to 200 Gbps, TriScale technology, AppFlow analytics',
        lifecycleStatus: 'active',
        productUrl: 'https://www.netscaler.com/platform/adc',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-load-balancer-a10-001',
        vendorName: 'A10 Networks',
        productName: 'A10 Thunder ADC',
        productNameKo: 'A10 Thunder ADC',
        modelSeries: 'Thunder 840/1030/3030/6630/14045',
        productTier: 'enterprise',
        targetUseCase:
          'Carrier-grade ADC with ACOS platform for L4-L7 load balancing, DDoS protection, and TLS/SSL insight',
        targetUseCaseKo:
          'L4-L7 로드 밸런싱, DDoS 방어, TLS/SSL 인사이트를 갖춘 ACOS 플랫폼 기반 통신사급 ADC',
        keySpecs: 'Up to 220 Gbps throughput, ACOS, advanced CGN',
        lifecycleStatus: 'active',
        productUrl: 'https://www.a10networks.com/products/thunder-adc/',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 5. API-GATEWAY
  // =========================================================================
  {
    componentId: 'api-gateway',
    category: 'network',
    cloud: [
      {
        id: 'VM-api-gateway-aws-001',
        provider: 'aws',
        serviceName: 'Amazon API Gateway',
        serviceNameKo: 'Amazon API Gateway',
        serviceTier: 'REST / HTTP / WebSocket',
        pricingModel: 'pay-per-use',
        differentiator:
          'Serverless API management with Lambda integration, request throttling, caching, and native IAM/Cognito authorization',
        differentiatorKo:
          'Lambda 통합, 요청 스로틀링, 캐싱, 네이티브 IAM/Cognito 인가를 갖춘 서버리스 API 관리',
        docUrl: 'https://docs.aws.amazon.com/apigateway/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-api-gateway-azure-001',
        provider: 'azure',
        serviceName: 'Azure API Management',
        serviceNameKo: 'Azure API Management',
        serviceTier: 'Consumption / Developer / Standard / Premium',
        pricingModel: 'pay-per-use',
        differentiator:
          'Full API lifecycle management with developer portal, built-in analytics, policy engine, and multi-region gateway deployment',
        differentiatorKo:
          '개발자 포털, 내장 분석, 정책 엔진, 멀티리전 게이트웨이 배포를 갖춘 전체 API 라이프사이클 관리',
        docUrl: 'https://learn.microsoft.com/en-us/azure/api-management/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-api-gateway-gcp-001',
        provider: 'gcp',
        serviceName: 'Apigee API Management',
        serviceNameKo: 'Apigee API 관리',
        serviceTier: 'Standard / Enterprise',
        pricingModel: 'subscription',
        differentiator:
          'Enterprise API platform with advanced analytics, monetization, developer portal, and AI-powered anomaly detection',
        differentiatorKo:
          '고급 분석, 수익화, 개발자 포털, AI 기반 이상 탐지를 갖춘 엔터프라이즈 API 플랫폼',
        docUrl: 'https://cloud.google.com/apigee/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-api-gateway-kong-001',
        vendorName: 'Kong Inc.',
        productName: 'Kong Konnect',
        productNameKo: 'Kong Konnect',
        pricingModel: 'subscription',
        differentiator:
          'Cloud-hosted API gateway platform with 60+ plugins, service mesh integration, and hybrid deployment support',
        differentiatorKo:
          '60개 이상의 플러그인, 서비스 메시 통합, 하이브리드 배포를 지원하는 클라우드 호스팅 API 게이트웨이 플랫폼',
        docUrl: 'https://docs.konghq.com/konnect/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-api-gateway-mulesoft-001',
        vendorName: 'Salesforce (MuleSoft)',
        productName: 'MuleSoft Anypoint API Manager',
        productNameKo: 'MuleSoft Anypoint API 매니저',
        pricingModel: 'subscription',
        differentiator:
          'Comprehensive integration platform with API design, management, analytics, and enterprise-grade governance in Anypoint Platform',
        differentiatorKo:
          'Anypoint 플랫폼의 API 설계, 관리, 분석, 엔터프라이즈급 거버넌스를 갖춘 포괄적 통합 플랫폼',
        docUrl: 'https://docs.mulesoft.com/api-manager/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-api-gateway-kong-oss-001',
        projectName: 'Kong Gateway (OSS)',
        projectNameKo: 'Kong 게이트웨이 (오픈소스)',
        license: 'Apache 2.0',
        description:
          'Cloud-native API gateway built on NGINX/OpenResty with plugin architecture for auth, rate-limiting, transformations, and logging',
        descriptionKo:
          '인증, 속도 제한, 변환, 로깅을 위한 플러그인 아키텍처를 갖춘 NGINX/OpenResty 기반 클라우드 네이티브 API 게이트웨이',
        docUrl: 'https://docs.konghq.com/gateway/latest/',
        githubUrl: 'https://github.com/Kong/kong',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-api-gateway-tyk-001',
        projectName: 'Tyk Gateway',
        projectNameKo: 'Tyk 게이트웨이',
        license: 'MPL-2.0',
        description:
          'Go-based API gateway with built-in analytics, rate limiting, quotas, versioning, and GraphQL native support',
        descriptionKo:
          '내장 분석, 속도 제한, 할당량, 버저닝, GraphQL 네이티브 지원을 갖춘 Go 기반 API 게이트웨이',
        docUrl: 'https://tyk.io/docs/',
        githubUrl: 'https://github.com/TykTechnologies/tyk',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-api-gateway-f5-001',
        vendorName: 'F5 Networks',
        productName: 'F5 NGINX Plus (API Gateway)',
        productNameKo: 'F5 NGINX Plus (API 게이트웨이)',
        modelSeries: 'NGINX Plus R31+',
        productTier: 'enterprise',
        targetUseCase:
          'High-performance API gateway with rate limiting, JWT validation, and OpenID Connect; acts as both reverse proxy and API gateway',
        targetUseCaseKo:
          '속도 제한, JWT 검증, OpenID Connect를 갖춘 고성능 API 게이트웨이; 리버스 프록시 및 API 게이트웨이 겸용',
        keySpecs: 'Up to millions of RPS, active health checks, dynamic reconfiguration',
        lifecycleStatus: 'active',
        productUrl: 'https://www.nginx.com/products/nginx/api-gateway/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-api-gateway-solo-001',
        vendorName: 'Solo.io',
        productName: 'Gloo Gateway Enterprise',
        productNameKo: 'Gloo 게이트웨이 엔터프라이즈',
        modelSeries: 'Gloo Gateway 2.x',
        productTier: 'enterprise',
        targetUseCase:
          'Kubernetes-native API gateway built on Envoy with Kubernetes Gateway API support, GraphQL, and WAF integration',
        targetUseCaseKo:
          'Kubernetes Gateway API, GraphQL, WAF 통합을 지원하는 Envoy 기반 Kubernetes 네이티브 API 게이트웨이',
        keySpecs: 'Envoy-based, Kubernetes-native, Istio-integrated',
        lifecycleStatus: 'active',
        productUrl: 'https://www.solo.io/products/gloo-gateway/',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 6. SD-WAN
  // =========================================================================
  {
    componentId: 'sd-wan',
    category: 'network',
    cloud: [
      {
        id: 'VM-sd-wan-aws-001',
        provider: 'aws',
        serviceName: 'AWS Cloud WAN',
        serviceNameKo: 'AWS Cloud WAN',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Managed global WAN with centralized network policy, automated segment routing, and Transit Gateway integration across all AWS regions',
        differentiatorKo:
          '중앙 집중식 네트워크 정책, 자동 세그먼트 라우팅, 전 AWS 리전 Transit Gateway 통합을 갖춘 관리형 글로벌 WAN',
        docUrl: 'https://docs.aws.amazon.com/network-manager/latest/cloudwan/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-sd-wan-azure-001',
        provider: 'azure',
        serviceName: 'Azure Virtual WAN',
        serviceNameKo: 'Azure Virtual WAN',
        serviceTier: 'Basic / Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Microsoft-managed hub with automated branch connectivity, VPN/ExpressRoute aggregation, and integrated routing with Azure Firewall',
        differentiatorKo:
          '자동 지사 연결, VPN/ExpressRoute 집계, Azure Firewall 통합 라우팅을 갖춘 Microsoft 관리형 허브',
        docUrl: 'https://learn.microsoft.com/en-us/azure/virtual-wan/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-sd-wan-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Network Connectivity Center',
        serviceNameKo: 'Google 네트워크 연결 센터',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Hub-and-spoke connectivity model leveraging Google backbone for site-to-site and hybrid data transfer with SD-WAN partner integration',
        differentiatorKo:
          'SD-WAN 파트너 통합, 사이트 간 및 하이브리드 데이터 전송을 위한 Google 백본 활용 허브앤스포크 연결 모델',
        docUrl: 'https://cloud.google.com/network-connectivity/docs/network-connectivity-center',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-sd-wan-aryaka-001',
        vendorName: 'Aryaka',
        productName: 'Aryaka Unified SASE',
        productNameKo: 'Aryaka 통합 SASE',
        pricingModel: 'subscription',
        differentiator:
          'Managed SD-WAN-as-a-Service with private global backbone, integrated SASE, and application-aware optimization',
        differentiatorKo:
          '프라이빗 글로벌 백본, 통합 SASE, 애플리케이션 인식 최적화를 갖춘 관리형 SD-WAN 서비스',
        docUrl: 'https://www.aryaka.com/sd-wan-as-a-service/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-sd-wan-cato-001',
        vendorName: 'Cato Networks',
        productName: 'Cato SASE Cloud',
        productNameKo: 'Cato SASE 클라우드',
        pricingModel: 'subscription',
        differentiator:
          'Converged cloud-native SASE platform with global private backbone, built-in FWaaS, CASB, ZTNA, and SD-WAN in a single service',
        differentiatorKo:
          '글로벌 프라이빗 백본, 내장 FWaaS, CASB, ZTNA, SD-WAN을 단일 서비스로 통합한 클라우드 네이티브 SASE 플랫폼',
        docUrl: 'https://www.catonetworks.com/platform/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-sd-wan-flexiwan-001',
        projectName: 'flexiWAN',
        projectNameKo: 'flexiWAN',
        license: 'AGPL-3.0',
        description:
          'Open-source SD-WAN solution with centralized management, traffic steering, VPN tunnels, and application-aware routing',
        descriptionKo:
          '중앙 관리, 트래픽 조정, VPN 터널, 애플리케이션 인식 라우팅을 갖춘 오픈소스 SD-WAN 솔루션',
        docUrl: 'https://docs.flexiwan.com/',
        githubUrl: 'https://github.com/flexiwan',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-sd-wan-cisco-001',
        vendorName: 'Cisco',
        productName: 'Cisco Catalyst SD-WAN (Viptela)',
        productNameKo: 'Cisco Catalyst SD-WAN (Viptela)',
        modelSeries: 'Catalyst 8200/8300/8500 Edge',
        productTier: 'enterprise',
        targetUseCase:
          'Enterprise SD-WAN with application-aware routing, integrated Cisco security stack, and centralized vManage orchestration',
        targetUseCaseKo:
          '애플리케이션 인식 라우팅, 통합 Cisco 보안 스택, 중앙 vManage 오케스트레이션을 갖춘 엔터프라이즈 SD-WAN',
        keySpecs: 'Up to 20 Gbps, IOS XE, ThousandEyes integration',
        lifecycleStatus: 'active',
        productUrl: 'https://www.cisco.com/site/us/en/products/networking/sdwan-routers/index.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-sd-wan-fortinet-001',
        vendorName: 'Fortinet',
        productName: 'FortiGate Secure SD-WAN',
        productNameKo: 'FortiGate Secure SD-WAN',
        modelSeries: 'FortiGate 40F/60F/100F/200F/600F',
        productTier: 'enterprise',
        targetUseCase:
          'Security-first SD-WAN with built-in NGFW, IPS, and application-aware routing on FortiGate; managed via FortiManager',
        targetUseCaseKo:
          'FortiGate 기반 내장 NGFW, IPS, 애플리케이션 인식 라우팅의 보안 우선 SD-WAN; FortiManager로 관리',
        keySpecs: 'Up to 35 Gbps firewall, FortiOS, FortiASIC',
        lifecycleStatus: 'active',
        productUrl: 'https://www.fortinet.com/products/sd-wan',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-sd-wan-vmware-001',
        vendorName: 'Broadcom (VMware)',
        productName: 'VMware VeloCloud SD-WAN',
        productNameKo: 'VMware VeloCloud SD-WAN',
        modelSeries: 'Edge 510/610/620/640/680/840/3800',
        productTier: 'enterprise',
        targetUseCase:
          'Cloud-first SD-WAN with dynamic path optimization, multi-cloud gateways, and zero-touch provisioning for distributed enterprises',
        targetUseCaseKo:
          '동적 경로 최적화, 멀티클라우드 게이트웨이, 제로터치 프로비저닝을 갖춘 분산 엔터프라이즈용 클라우드 중심 SD-WAN',
        keySpecs: 'Up to 10 Gbps, DMPO, cloud gateway network',
        lifecycleStatus: 'active',
        productUrl: 'https://www.vmware.com/products/sd-wan.html',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 7. DNS
  // =========================================================================
  {
    componentId: 'dns',
    category: 'network',
    cloud: [
      {
        id: 'VM-dns-aws-001',
        provider: 'aws',
        serviceName: 'Amazon Route 53',
        serviceNameKo: 'Amazon Route 53',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Highly available DNS with health checks, traffic flow policies, latency/geolocation/failover routing, and deep AWS service integration',
        differentiatorKo:
          '상태 확인, 트래픽 흐름 정책, 지연/지리/장애 조치 라우팅, 심층 AWS 서비스 통합을 갖춘 고가용성 DNS',
        docUrl: 'https://docs.aws.amazon.com/Route53/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-dns-azure-001',
        provider: 'azure',
        serviceName: 'Azure DNS / Azure Traffic Manager',
        serviceNameKo: 'Azure DNS / Azure Traffic Manager',
        serviceTier: 'Public / Private',
        pricingModel: 'pay-per-use',
        differentiator:
          'Authoritative DNS with 100% SLA and RBAC; Traffic Manager adds DNS-based global load balancing with priority/weighted/geographic routing',
        differentiatorKo:
          '100% SLA 및 RBAC를 갖춘 권한 DNS; Traffic Manager는 우선순위/가중치/지리 라우팅의 DNS 기반 글로벌 부하 분산 추가',
        docUrl: 'https://learn.microsoft.com/en-us/azure/dns/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-dns-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Cloud DNS',
        serviceNameKo: 'Google Cloud DNS',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Scalable authoritative DNS powered by Google infrastructure with DNSSEC support, private zones, and forwarding/peering',
        differentiatorKo:
          'DNSSEC 지원, 프라이빗 영역, 포워딩/피어링을 갖춘 Google 인프라 기반 확장 가능한 권한 DNS',
        docUrl: 'https://cloud.google.com/dns/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-dns-cloudflare-001',
        vendorName: 'Cloudflare',
        productName: 'Cloudflare DNS',
        productNameKo: 'Cloudflare DNS',
        pricingModel: 'freemium',
        differentiator:
          'Fastest authoritative DNS (sub-11ms global avg) with free tier, DDoS protection, DNSSEC one-click, and proxy integration',
        differentiatorKo:
          '무료 티어, DDoS 보호, 원클릭 DNSSEC, 프록시 통합을 갖춘 최고 속도의 권한 DNS (글로벌 평균 11ms 미만)',
        docUrl: 'https://developers.cloudflare.com/dns/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-dns-ns1-001',
        vendorName: 'IBM (NS1)',
        productName: 'NS1 Connect',
        productNameKo: 'NS1 Connect',
        pricingModel: 'subscription',
        differentiator:
          'Intelligent DNS with data-driven traffic steering, Filter Chain technology, and API-first design for automation at scale',
        differentiatorKo:
          '데이터 기반 트래픽 조정, Filter Chain 기술, 대규모 자동화를 위한 API 우선 설계의 지능형 DNS',
        docUrl: 'https://www.ibm.com/products/ns1-connect',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-dns-coredns-001',
        projectName: 'CoreDNS',
        projectNameKo: 'CoreDNS',
        license: 'Apache 2.0',
        description:
          'CNCF-graduated DNS server written in Go with plugin-based architecture; default DNS in Kubernetes; supports service discovery, caching, and forwarding',
        descriptionKo:
          '플러그인 기반 아키텍처의 CNCF 졸업 Go 기반 DNS 서버; Kubernetes 기본 DNS; 서비스 디스커버리, 캐싱, 포워딩 지원',
        docUrl: 'https://coredns.io/manual/toc/',
        githubUrl: 'https://github.com/coredns/coredns',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-dns-bind-001',
        projectName: 'BIND 9',
        projectNameKo: 'BIND 9',
        license: 'MPL-2.0',
        description:
          'Industry-standard authoritative and recursive DNS server from ISC; most widely deployed DNS software with full DNSSEC, TSIG, and DLZ support',
        descriptionKo:
          'ISC의 업계 표준 권한 및 재귀 DNS 서버; 완전한 DNSSEC, TSIG, DLZ 지원으로 가장 널리 배포된 DNS 소프트웨어',
        docUrl: 'https://bind9.readthedocs.io/',
        githubUrl: 'https://gitlab.isc.org/isc-projects/bind9',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-dns-infoblox-001',
        vendorName: 'Infoblox',
        productName: 'Infoblox DDI (DNS/DHCP/IPAM)',
        productNameKo: 'Infoblox DDI (DNS/DHCP/IPAM)',
        modelSeries: 'NIOS 2000/4000/8000',
        productTier: 'enterprise',
        targetUseCase:
          'Enterprise DDI with integrated DNS, DHCP, and IP address management; DNS security with threat intelligence and DNS firewall',
        targetUseCaseKo:
          '통합 DNS, DHCP, IP 주소 관리의 엔터프라이즈 DDI; 위협 인텔리전스 및 DNS 방화벽을 통한 DNS 보안',
        keySpecs: 'Up to 1M QPS, BloxOne Threat Defense, Grid architecture',
        lifecycleStatus: 'active',
        productUrl: 'https://www.infoblox.com/products/ddi/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-dns-efficientip-001',
        vendorName: 'EfficientIP',
        productName: 'EfficientIP SOLIDserver DDI',
        productNameKo: 'EfficientIP SOLIDserver DDI',
        modelSeries: 'SOLIDserver',
        productTier: 'enterprise',
        targetUseCase:
          'Comprehensive DDI with DNS Guardian for security, IPAM for hybrid cloud, and API-driven automation for multi-cloud environments',
        targetUseCaseKo:
          '보안을 위한 DNS Guardian, 하이브리드 클라우드 IPAM, 멀티클라우드 환경 API 기반 자동화를 갖춘 종합 DDI',
        keySpecs: 'DNS Guardian, hybrid IPAM, REST API automation',
        lifecycleStatus: 'active',
        productUrl: 'https://www.efficientip.com/products/solidserver-ddi/',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 8. CDN
  // =========================================================================
  {
    componentId: 'cdn',
    category: 'network',
    cloud: [
      {
        id: 'VM-cdn-aws-001',
        provider: 'aws',
        serviceName: 'Amazon CloudFront',
        serviceNameKo: 'Amazon CloudFront',
        serviceTier: 'Standard / Security',
        pricingModel: 'pay-per-use',
        differentiator:
          'Global CDN with 400+ edge locations, deep AWS integration (S3, ALB, Lambda@Edge), real-time logs, and Origin Shield caching layer',
        differentiatorKo:
          '400개 이상의 엣지 로케이션, 심층 AWS 통합(S3, ALB, Lambda@Edge), 실시간 로그, Origin Shield 캐싱 계층의 글로벌 CDN',
        docUrl: 'https://docs.aws.amazon.com/AmazonCloudFront/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-cdn-azure-001',
        provider: 'azure',
        serviceName: 'Azure Front Door / Azure CDN',
        serviceNameKo: 'Azure Front Door / Azure CDN',
        serviceTier: 'Standard / Premium',
        pricingModel: 'pay-per-use',
        differentiator:
          'Global load balancing + CDN with built-in WAF, private link origin support, and intelligent edge caching; Front Door Premium includes managed rules',
        differentiatorKo:
          '내장 WAF, 프라이빗 링크 오리진 지원, 지능형 엣지 캐싱을 갖춘 글로벌 로드 밸런싱 + CDN; Front Door Premium은 관리형 규칙 포함',
        docUrl: 'https://learn.microsoft.com/en-us/azure/frontdoor/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-cdn-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Cloud CDN / Media CDN',
        serviceNameKo: 'Google Cloud CDN / Media CDN',
        serviceTier: 'Standard / Media',
        pricingModel: 'pay-per-use',
        differentiator:
          'Anycast-based CDN leveraging Google global network with Cloud Armor DDoS protection; Media CDN optimized for large-scale video delivery',
        differentiatorKo:
          'Cloud Armor DDoS 보호를 갖춘 Google 글로벌 네트워크 기반 애니캐스트 CDN; Media CDN은 대규모 비디오 전송에 최적화',
        docUrl: 'https://cloud.google.com/cdn/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-cdn-cloudflare-001',
        vendorName: 'Cloudflare',
        productName: 'Cloudflare CDN',
        productNameKo: 'Cloudflare CDN',
        pricingModel: 'freemium',
        differentiator:
          'Massive 300+ PoP network with generous free tier, integrated DDoS/WAF, Workers edge compute, and sub-50ms global TTFB',
        differentiatorKo:
          '300개 이상의 PoP, 관대한 무료 티어, 통합 DDoS/WAF, Workers 엣지 컴퓨팅, 글로벌 50ms 이하 TTFB',
        docUrl: 'https://developers.cloudflare.com/cache/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-cdn-akamai-001',
        vendorName: 'Akamai',
        productName: 'Akamai Connected Cloud (CDN)',
        productNameKo: 'Akamai Connected Cloud (CDN)',
        pricingModel: 'subscription',
        differentiator:
          'Largest CDN with 1,300+ network deployments inside ISPs for 1-2 hop delivery; advanced media delivery, security, and edge compute capabilities',
        differentiatorKo:
          'ISP 내부 1,300개 이상의 네트워크 배포로 1-2홉 전달; 고급 미디어 전송, 보안, 엣지 컴퓨팅 기능',
        docUrl: 'https://techdocs.akamai.com/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-cdn-fastly-001',
        vendorName: 'Fastly',
        productName: 'Fastly CDN',
        productNameKo: 'Fastly CDN',
        pricingModel: 'pay-per-use',
        differentiator:
          'Developer-focused CDN with instant purge (<150ms), Compute@Edge Wasm runtime, VCL config language, and high cache-hit ratios at powerful PoPs',
        differentiatorKo:
          '즉시 퍼지(<150ms), Compute@Edge Wasm 런타임, VCL 구성 언어, 강력한 PoP의 높은 캐시 적중률을 갖춘 개발자 중심 CDN',
        docUrl: 'https://docs.fastly.com/en/guides/about-fastlys-cdn-service',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-cdn-varnish-001',
        projectName: 'Varnish Cache',
        projectNameKo: 'Varnish 캐시',
        license: 'BSD 2-Clause',
        description:
          'High-performance HTTP accelerator and reverse proxy cache with VCL configuration language; widely used as CDN origin shield and edge cache',
        descriptionKo:
          'VCL 구성 언어를 갖춘 고성능 HTTP 가속기 및 리버스 프록시 캐시; CDN 오리진 쉴드 및 엣지 캐시로 널리 사용',
        docUrl: 'https://varnish-cache.org/docs/',
        githubUrl: 'https://github.com/varnishcache/varnish-cache',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-cdn-trafficserver-001',
        projectName: 'Apache Traffic Server',
        projectNameKo: 'Apache Traffic Server',
        license: 'Apache 2.0',
        description:
          'Scalable caching proxy server from Apache Foundation; used by Yahoo, Apple, and Comcast for edge caching and forward/reverse proxy',
        descriptionKo:
          'Apache 재단의 확장 가능한 캐싱 프록시 서버; Yahoo, Apple, Comcast에서 엣지 캐싱 및 포워드/리버스 프록시로 사용',
        docUrl: 'https://trafficserver.apache.org/docs/',
        githubUrl: 'https://github.com/apache/trafficserver',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-cdn-f5-001',
        vendorName: 'F5 Networks',
        productName: 'F5 Distributed Cloud CDN',
        productNameKo: 'F5 Distributed Cloud CDN',
        modelSeries: 'Distributed Cloud Services',
        productTier: 'enterprise',
        targetUseCase:
          'Enterprise CDN with app-layer security, bot defense, and API protection; integrates with BIG-IP for on-premises content delivery',
        targetUseCaseKo:
          '앱 계층 보안, 봇 방어, API 보호를 갖춘 엔터프라이즈 CDN; 온프레미스 콘텐츠 전달을 위한 BIG-IP 통합',
        keySpecs: 'Global PoP network, L7 DDoS, origin cloaking',
        lifecycleStatus: 'active',
        productUrl: 'https://www.f5.com/cloud/products/cdn',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-cdn-limelight-001',
        vendorName: 'Edgio (formerly Limelight)',
        productName: 'Edgio Applications Platform',
        productNameKo: 'Edgio 애플리케이션 플랫폼',
        modelSeries: 'Edgio v7',
        productTier: 'enterprise',
        targetUseCase:
          'Edge-optimized CDN with sub-second site updates, edge-side rendering, and integrated Layer 7 DDoS protection for web applications',
        targetUseCaseKo:
          '1초 미만 사이트 업데이트, 엣지 사이드 렌더링, 웹 애플리케이션용 통합 Layer 7 DDoS 방어의 엣지 최적화 CDN',
        keySpecs: '300+ PoPs, predictive prefetching, serverless scripting',
        lifecycleStatus: 'active',
        productUrl: 'https://edg.io/products/cdn/',
        lastVerified: '2026-02-14',
      },
    ],
  },
];
