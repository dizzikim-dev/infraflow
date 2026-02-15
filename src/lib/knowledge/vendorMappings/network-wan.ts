/**
 * Network WAN Vendor Mappings — Cloud, managed, open-source, and on-premise
 * product mappings for 12 WAN infrastructure components.
 *
 * Components: pe-router, p-router, mpls-network, dedicated-line,
 *             metro-ethernet, corporate-internet, vpn-service,
 *             sd-wan-service, private-5g, core-network, upf, ring-network
 *
 * WAN/carrier equipment is predominantly on-premise; cloud equivalents
 * are limited to transit gateway / interconnect style services.
 *
 * @lastVerified 2026-02-14
 */

import type { ComponentVendorMap } from './types';

export const networkWanVendorMappings: ComponentVendorMap[] = [
  // =========================================================================
  // 1. PE-ROUTER (Provider Edge Router)
  // =========================================================================
  {
    componentId: 'pe-router',
    category: 'wan',
    cloud: [
      {
        id: 'VM-pe-router-aws-001',
        provider: 'aws',
        serviceName: 'AWS Transit Gateway',
        serviceNameKo: 'AWS 트랜짓 게이트웨이',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Regional hub connecting VPCs, VPNs, and Direct Connect gateways; supports inter-region peering and multicast',
        differentiatorKo:
          'VPC, VPN, Direct Connect 게이트웨이를 연결하는 리전 허브; 리전 간 피어링 및 멀티캐스트 지원',
        docUrl: 'https://docs.aws.amazon.com/vpc/latest/tgw/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-pe-router-azure-001',
        provider: 'azure',
        serviceName: 'Azure Virtual WAN Hub',
        serviceNameKo: 'Azure 가상 WAN 허브',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Managed hub-and-spoke topology with automated branch connectivity, integrated ExpressRoute and VPN termination',
        differentiatorKo:
          '자동화된 지사 연결, 통합 ExpressRoute 및 VPN 종단을 제공하는 관리형 허브 앤 스포크 토폴로지',
        docUrl: 'https://learn.microsoft.com/en-us/azure/virtual-wan/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-pe-router-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Cloud Router',
        serviceNameKo: 'Google Cloud 라우터',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Fully distributed, software-defined dynamic routing via BGP for VPC, Interconnect, and Cloud VPN peering',
        differentiatorKo:
          'VPC, Interconnect, Cloud VPN 피어링을 위한 완전 분산 소프트웨어 정의 BGP 동적 라우팅',
        docUrl: 'https://cloud.google.com/network-connectivity/docs/router',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-pe-router-kt-001',
        vendorName: 'KT',
        productName: 'KT Managed PE Router Service',
        productNameKo: 'KT 관리형 PE 라우터 서비스',
        pricingModel: 'subscription',
        differentiator:
          'Carrier-managed PE routing for MPLS VPN and internet peering across the Korean nationwide backbone',
        differentiatorKo:
          '한국 전국 백본의 MPLS VPN 및 인터넷 피어링을 위한 통신사 관리형 PE 라우팅 서비스',
        docUrl: 'https://www.kt.com/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-pe-router-lumen-001',
        vendorName: 'Lumen Technologies',
        productName: 'Lumen Managed Network Edge',
        productNameKo: 'Lumen 관리형 네트워크 엣지',
        pricingModel: 'subscription',
        differentiator:
          'Fully managed PE router service with MPLS, SD-WAN, and security integration at the network edge',
        differentiatorKo:
          '네트워크 엣지에서 MPLS, SD-WAN, 보안 통합을 제공하는 완전 관리형 PE 라우터 서비스',
        docUrl: 'https://www.lumen.com/en-us/networking.html',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-pe-router-frr-001',
        projectName: 'FRRouting (FRR)',
        projectNameKo: 'FRRouting (FRR)',
        license: 'GPL-2.0',
        description:
          'Full-featured open-source routing suite with BGP, OSPF, IS-IS, LDP/MPLS support; backed by NVIDIA, Google, and Netflix',
        descriptionKo:
          'BGP, OSPF, IS-IS, LDP/MPLS 지원의 완전 기능 오픈소스 라우팅 스위트; NVIDIA, Google, Netflix 지원',
        docUrl: 'https://docs.frrouting.org/',
        githubUrl: 'https://github.com/FRRouting/frr',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-pe-router-cisco-001',
        vendorName: 'Cisco',
        productName: 'Cisco ASR 9000 Series',
        productNameKo: 'Cisco ASR 9000 시리즈',
        modelSeries: 'ASR 9000 / ASR 9900',
        productTier: 'enterprise',
        targetUseCase:
          'Service provider edge routing for MPLS, L2/L3 VPN, and 5G transport with up to 160 Tbps capacity',
        targetUseCaseKo:
          'MPLS, L2/L3 VPN, 5G 전송을 위한 서비스 프로바이더 에지 라우팅, 최대 160 Tbps 용량',
        keySpecs: 'Up to 160 Tbps, IOS XR, Segment Routing, custom ASIC, 96% power reduction per Gbps',
        lifecycleStatus: 'active',
        productUrl: 'https://www.cisco.com/c/en/us/products/routers/asr-9000-series-aggregation-services-routers/index.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-pe-router-cisco-002',
        vendorName: 'Cisco',
        productName: 'Cisco NCS 5500 Series',
        productNameKo: 'Cisco NCS 5500 시리즈',
        modelSeries: 'NCS 5500 / NCS 5700',
        productTier: 'enterprise',
        targetUseCase:
          'High-density 100GbE/400GbE edge and peering router with Segment Routing and EVPN',
        targetUseCaseKo:
          '세그먼트 라우팅 및 EVPN 기반 고밀도 100GbE/400GbE 에지 및 피어링 라우터',
        keySpecs: 'Up to 400GbE, IOS XR, 0.3W per Gb, cloud-enhanced automation',
        lifecycleStatus: 'active',
        productUrl: 'https://www.cisco.com/c/en/us/products/routers/network-convergence-system-5500-series/index.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-pe-router-juniper-001',
        vendorName: 'Juniper Networks',
        productName: 'Juniper MX Series',
        productNameKo: 'Juniper MX 시리즈',
        modelSeries: 'MX204 / MX304 / MX10008 / MX2020',
        productTier: 'enterprise',
        targetUseCase:
          'Universal edge router for service provider, data center, and enterprise deployments with SDN and automation',
        targetUseCaseKo:
          '서비스 프로바이더, 데이터센터, 엔터프라이즈 배포를 위한 SDN 및 자동화 기반 유니버설 에지 라우터',
        keySpecs: 'Up to 80 Tbps (MX2020), Junos OS, Trio chipset, QSFP28 100GbE',
        lifecycleStatus: 'active',
        productUrl: 'https://www.juniper.net/us/en/products/routers/mx-series.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-pe-router-nokia-001',
        vendorName: 'Nokia',
        productName: 'Nokia 7750 Service Router',
        productNameKo: 'Nokia 7750 서비스 라우터',
        modelSeries: '7750 SR-s / SR / SR-a / SR-e',
        productTier: 'enterprise',
        targetUseCase:
          'IP edge and core routing for MPLS, VPN, and 5G transport, powered by FP routing silicon and SR OS',
        targetUseCaseKo:
          'FP 라우팅 실리콘 및 SR OS 기반 MPLS, VPN, 5G 전송을 위한 IP 에지 및 코어 라우팅',
        keySpecs: 'Up to 432 Tbps, FP5 silicon, SR OS, multi-service edge',
        lifecycleStatus: 'active',
        productUrl: 'https://www.nokia.com/networks/ip-networks/7750-service-router/',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 2. P-ROUTER (Provider Core Router)
  // =========================================================================
  {
    componentId: 'p-router',
    category: 'wan',
    cloud: [],
    managed: [
      {
        id: 'VM-p-router-att-001',
        vendorName: 'AT&T',
        productName: 'AT&T MPLS Core Transport',
        productNameKo: 'AT&T MPLS 코어 전송',
        pricingModel: 'subscription',
        differentiator:
          'Global carrier backbone with MPLS label switching, providing high-bandwidth core transport across continents',
        differentiatorKo:
          'MPLS 레이블 스위칭 기반 글로벌 캐리어 백본, 대륙 간 고대역 코어 전송 제공',
        docUrl: 'https://www.business.att.com/products/mpls.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-p-router-lumen-001',
        vendorName: 'Lumen Technologies',
        productName: 'Lumen Core Network Services',
        productNameKo: 'Lumen 코어 네트워크 서비스',
        pricingModel: 'subscription',
        differentiator:
          'One of the largest global IP backbone networks with adaptive networking for dynamic bandwidth and low-latency transit',
        differentiatorKo:
          '동적 대역폭 및 저지연 전송을 위한 적응형 네트워킹 기능의 세계 최대 글로벌 IP 백본 네트워크',
        docUrl: 'https://www.lumen.com/en-us/networking.html',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-p-router-frr-001',
        projectName: 'FRRouting (FRR)',
        projectNameKo: 'FRRouting (FRR)',
        license: 'GPL-2.0',
        description:
          'Open-source routing suite with LDP/MPLS, IS-IS, and BGP for lab and non-production core routing scenarios',
        descriptionKo:
          '실험실 및 비프로덕션 코어 라우팅 시나리오를 위한 LDP/MPLS, IS-IS, BGP 오픈소스 라우팅 스위트',
        docUrl: 'https://docs.frrouting.org/',
        githubUrl: 'https://github.com/FRRouting/frr',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-p-router-cisco-001',
        vendorName: 'Cisco',
        productName: 'Cisco NCS 5500 Series',
        productNameKo: 'Cisco NCS 5500 시리즈',
        modelSeries: 'NCS 5500 / NCS 5700',
        productTier: 'enterprise',
        targetUseCase:
          'High-density core and peering router with 100GbE/400GbE port density for massive traffic aggregation',
        targetUseCaseKo:
          '대규모 트래픽 집합을 위한 100GbE/400GbE 포트 밀도의 고밀도 코어 및 피어링 라우터',
        keySpecs: '400GbE, IOS XR, Segment Routing, EVPN, low power per Gb',
        lifecycleStatus: 'active',
        productUrl: 'https://www.cisco.com/c/en/us/products/routers/network-convergence-system-5500-series/index.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-p-router-juniper-001',
        vendorName: 'Juniper Networks',
        productName: 'Juniper PTX Series',
        productNameKo: 'Juniper PTX 시리즈',
        modelSeries: 'PTX10004 / PTX10008 / PTX10016',
        productTier: 'enterprise',
        targetUseCase:
          'Ultra-high-density core and peering router powering the world\'s largest backbone architectures',
        targetUseCaseKo:
          '세계 최대 백본 아키텍처를 구동하는 초고밀도 코어 및 피어링 라우터',
        keySpecs: '400GbE native, Express ASIC, in-line MACsec, Junos OS',
        lifecycleStatus: 'active',
        productUrl: 'https://www.juniper.net/us/en/products/routers/ptx-series.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-p-router-nokia-001',
        vendorName: 'Nokia',
        productName: 'Nokia 7950 XRS',
        productNameKo: 'Nokia 7950 XRS',
        modelSeries: '7950 XRS-20e / XRS-40',
        productTier: 'enterprise',
        targetUseCase:
          'Next-generation core routing for telecom, cable, mobile, and web-scale operators with 5G and cloud scalability',
        targetUseCaseKo:
          '5G 및 클라우드 확장성을 갖춘 통신, 케이블, 모바일, 웹스케일 운영자를 위한 차세대 코어 라우팅',
        keySpecs: 'FP5 silicon, SR OS, 400GbE/800GbE ready, trusted by web-scale operators',
        lifecycleStatus: 'active',
        productUrl: 'https://www.nokia.com/networks/ip-networks/7950-extensible-routing-system/',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 3. MPLS-NETWORK (MPLS 망)
  // =========================================================================
  {
    componentId: 'mpls-network',
    category: 'wan',
    cloud: [
      {
        id: 'VM-mpls-network-aws-001',
        provider: 'aws',
        serviceName: 'AWS Direct Connect',
        serviceNameKo: 'AWS 다이렉트 커넥트',
        serviceTier: 'Dedicated / Hosted',
        pricingModel: 'pay-per-use',
        differentiator:
          'Dedicated private connection from on-premises to AWS; 1/10/100 Gbps ports, bypasses public internet for consistent latency',
        differentiatorKo:
          '온프레미스에서 AWS로의 전용 사설 연결; 1/10/100 Gbps 포트, 퍼블릭 인터넷 우회로 일관된 지연시간',
        docUrl: 'https://docs.aws.amazon.com/directconnect/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-mpls-network-azure-001',
        provider: 'azure',
        serviceName: 'Azure ExpressRoute',
        serviceNameKo: 'Azure 익스프레스라우트',
        serviceTier: 'Standard / Premium',
        pricingModel: 'pay-per-use',
        differentiator:
          'Layer 3 private connectivity to Microsoft cloud with built-in redundancy, SLA-backed, up to 100 Gbps per circuit',
        differentiatorKo:
          '내장 이중화, SLA 보장, 회선당 최대 100 Gbps의 Microsoft 클라우드 Layer 3 사설 연결',
        docUrl: 'https://learn.microsoft.com/en-us/azure/expressroute/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-mpls-network-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Cloud Dedicated Interconnect',
        serviceNameKo: 'Google Cloud 전용 인터커넥트',
        serviceTier: 'Dedicated',
        pricingModel: 'pay-per-use',
        differentiator:
          'Direct physical connection to Google network; 10/100 Gbps links, up to 8x bonding for 80 Gbps aggregate',
        differentiatorKo:
          'Google 네트워크로의 직접 물리 연결; 10/100 Gbps 링크, 최대 8x 본딩으로 80 Gbps 집합 대역폭',
        docUrl: 'https://cloud.google.com/network-connectivity/docs/interconnect',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-mpls-network-kt-001',
        vendorName: 'KT',
        productName: 'KT MPLS VPN Service',
        productNameKo: 'KT MPLS VPN 서비스',
        pricingModel: 'subscription',
        differentiator:
          'Nationwide Korean carrier MPLS VPN with QoS guarantees, multi-CoS, and SLA-backed service delivery',
        differentiatorKo:
          'QoS 보장, 다중 CoS, SLA 기반 서비스 제공의 한국 전국 통신사 MPLS VPN',
        docUrl: 'https://www.kt.com/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-mpls-network-att-001',
        vendorName: 'AT&T',
        productName: 'AT&T MPLS VPN',
        productNameKo: 'AT&T MPLS VPN',
        pricingModel: 'subscription',
        differentiator:
          'Global MPLS VPN service with 6 classes of service, end-to-end SLA, and coverage in 190+ countries',
        differentiatorKo:
          '6단계 서비스 클래스, 종단 간 SLA, 190개국 이상 커버리지의 글로벌 MPLS VPN 서비스',
        docUrl: 'https://www.business.att.com/products/mpls.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-mpls-network-megaport-001',
        vendorName: 'Megaport',
        productName: 'Megaport Virtual Edge (MVE)',
        productNameKo: 'Megaport 가상 엣지 (MVE)',
        pricingModel: 'pay-per-use',
        differentiator:
          'Third-party NaaS platform bridging MPLS, Direct Connect, ExpressRoute, and Interconnect across multi-cloud',
        differentiatorKo:
          '멀티클라우드 간 MPLS, Direct Connect, ExpressRoute, Interconnect를 연결하는 서드파티 NaaS 플랫폼',
        docUrl: 'https://www.megaport.com/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-mpls-network-frr-001',
        projectName: 'FRRouting (FRR)',
        projectNameKo: 'FRRouting (FRR)',
        license: 'GPL-2.0',
        description:
          'Open-source routing daemon supporting LDP, static LSP, and MPLS forwarding on Linux for lab and test environments',
        descriptionKo:
          '실험실 및 테스트 환경을 위한 LDP, 정적 LSP, Linux MPLS 포워딩 지원 오픈소스 라우팅 데몬',
        docUrl: 'https://docs.frrouting.org/',
        githubUrl: 'https://github.com/FRRouting/frr',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-mpls-network-cisco-001',
        vendorName: 'Cisco',
        productName: 'Cisco IOS XR MPLS Platform',
        productNameKo: 'Cisco IOS XR MPLS 플랫폼',
        modelSeries: 'ASR 9000 / NCS 5500',
        productTier: 'enterprise',
        targetUseCase:
          'Carrier-grade MPLS infrastructure with Segment Routing, L2/L3 VPN, Traffic Engineering on IOS XR',
        targetUseCaseKo:
          'IOS XR 기반 세그먼트 라우팅, L2/L3 VPN, 트래픽 엔지니어링의 캐리어급 MPLS 인프라',
        keySpecs: 'IOS XR, SR-MPLS, RSVP-TE, LDP, L3VPN/L2VPN',
        lifecycleStatus: 'active',
        productUrl: 'https://www.cisco.com/c/en/us/products/ios-nx-os-software/ios-xr-software/index.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-mpls-network-juniper-001',
        vendorName: 'Juniper Networks',
        productName: 'Juniper Junos MPLS Platform',
        productNameKo: 'Juniper Junos MPLS 플랫폼',
        modelSeries: 'MX Series / PTX Series',
        productTier: 'enterprise',
        targetUseCase:
          'MPLS network infrastructure with LDP, RSVP, Segment Routing, and L2/L3 VPN services on Junos OS',
        targetUseCaseKo:
          'Junos OS 기반 LDP, RSVP, 세그먼트 라우팅, L2/L3 VPN 서비스의 MPLS 네트워크 인프라',
        keySpecs: 'Junos OS, Trio chipset, LDP/RSVP/SR, extensive VPN support',
        lifecycleStatus: 'active',
        productUrl: 'https://www.juniper.net/documentation/us/en/software/junos/mpls/index.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-mpls-network-nokia-001',
        vendorName: 'Nokia',
        productName: 'Nokia SR OS MPLS Platform',
        productNameKo: 'Nokia SR OS MPLS 플랫폼',
        modelSeries: '7750 SR / 7950 XRS',
        productTier: 'enterprise',
        targetUseCase:
          'Carrier MPLS backbone with FP silicon-based forwarding, SR OS service model, and multi-service VPN',
        targetUseCaseKo:
          'FP 실리콘 기반 포워딩, SR OS 서비스 모델, 다중 서비스 VPN의 캐리어 MPLS 백본',
        keySpecs: 'SR OS, FP silicon, MPLS-TP, SR-MPLS, extensive service mapping',
        lifecycleStatus: 'active',
        productUrl: 'https://www.nokia.com/networks/ip-networks/7750-service-router/',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 4. DEDICATED-LINE (전용회선)
  // =========================================================================
  {
    componentId: 'dedicated-line',
    category: 'wan',
    cloud: [
      {
        id: 'VM-dedicated-line-aws-001',
        provider: 'aws',
        serviceName: 'AWS Direct Connect',
        serviceNameKo: 'AWS 다이렉트 커넥트',
        serviceTier: 'Dedicated',
        pricingModel: 'pay-per-use',
        differentiator:
          'Dedicated 1/10/100 Gbps physical connection to AWS; lowest per-GB pricing among cloud providers at scale',
        differentiatorKo:
          'AWS로의 전용 1/10/100 Gbps 물리 연결; 대규모 사용 시 클라우드 프로바이더 중 최저 GB당 요금',
        docUrl: 'https://docs.aws.amazon.com/directconnect/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-dedicated-line-azure-001',
        provider: 'azure',
        serviceName: 'Azure ExpressRoute',
        serviceNameKo: 'Azure 익스프레스라우트',
        serviceTier: 'Dedicated',
        pricingModel: 'pay-per-use',
        differentiator:
          'Private dedicated circuit with built-in redundant connections, backed by SLA; dual circuits by default',
        differentiatorKo:
          '내장 이중 연결, SLA 보장 사설 전용 회선; 기본적으로 이중 회선 제공',
        docUrl: 'https://learn.microsoft.com/en-us/azure/expressroute/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-dedicated-line-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Cloud Dedicated Interconnect',
        serviceNameKo: 'Google Cloud 전용 인터커넥트',
        serviceTier: 'Dedicated',
        pricingModel: 'pay-per-use',
        differentiator:
          'Physical cross-connect at Google colocation facility; default access to all GCP data centers globally',
        differentiatorKo:
          'Google 코로케이션 시설에서의 물리적 크로스커넥트; 기본적으로 전세계 모든 GCP 데이터센터 접근',
        docUrl: 'https://cloud.google.com/network-connectivity/docs/interconnect',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-dedicated-line-kt-001',
        vendorName: 'KT',
        productName: 'KT Leased Line Service',
        productNameKo: 'KT 전용회선 서비스',
        pricingModel: 'subscription',
        differentiator:
          'Korean nationwide dedicated leased line from 1 Mbps to 10 Gbps with guaranteed bandwidth and 24/7 NOC',
        differentiatorKo:
          '1 Mbps ~ 10 Gbps 보장 대역폭 및 24/7 NOC의 한국 전국 전용회선 서비스',
        docUrl: 'https://www.kt.com/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-dedicated-line-att-001',
        vendorName: 'AT&T',
        productName: 'AT&T Dedicated Internet',
        productNameKo: 'AT&T 전용 인터넷',
        pricingModel: 'subscription',
        differentiator:
          'Symmetric dedicated internet access with SLA-backed performance, speeds from 10 Mbps to 100 Gbps',
        differentiatorKo:
          'SLA 기반 성능 보장, 10 Mbps ~ 100 Gbps 속도의 대칭형 전용 인터넷 접속',
        docUrl: 'https://www.business.att.com/products/dedicated-internet.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-dedicated-line-lumen-001',
        vendorName: 'Lumen Technologies',
        productName: 'Lumen Dedicated Internet Access',
        productNameKo: 'Lumen 전용 인터넷 접속',
        pricingModel: 'subscription',
        differentiator:
          'Fiber-based dedicated internet with DDoS mitigation included and adaptive networking capabilities',
        differentiatorKo:
          'DDoS 완화 포함 및 적응형 네트워킹 기능의 광섬유 기반 전용 인터넷',
        docUrl: 'https://www.lumen.com/en-us/networking/internet.html',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [],
    onPremise: [
      {
        id: 'VM-dedicated-line-cisco-001',
        vendorName: 'Cisco',
        productName: 'Cisco ASR 920 Series',
        productNameKo: 'Cisco ASR 920 시리즈',
        modelSeries: 'ASR 920',
        productTier: 'mid-range',
        targetUseCase:
          'CPE/demarcation router for dedicated line termination with Carrier Ethernet and MPLS support',
        targetUseCaseKo:
          'Carrier Ethernet 및 MPLS 지원의 전용회선 종단 CPE/경계 라우터',
        keySpecs: 'IOS XE, 10GbE, Carrier Ethernet 2.0, low power',
        lifecycleStatus: 'active',
        productUrl: 'https://www.cisco.com/c/en/us/products/routers/asr-920-series-aggregation-services-router/index.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-dedicated-line-juniper-001',
        vendorName: 'Juniper Networks',
        productName: 'Juniper ACX Series',
        productNameKo: 'Juniper ACX 시리즈',
        modelSeries: 'ACX7100 / ACX7509',
        productTier: 'mid-range',
        targetUseCase:
          'Access and aggregation router for metro and WAN edge with IP/MPLS and Carrier Ethernet',
        targetUseCaseKo:
          'IP/MPLS 및 Carrier Ethernet 기반 메트로 및 WAN 에지 접속 및 집합 라우터',
        keySpecs: 'Junos OS Evolved, 1/10/25/100GbE, timing/sync, compact form factor',
        lifecycleStatus: 'active',
        productUrl: 'https://www.juniper.net/us/en/products/routers/acx-series.html',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 5. METRO-ETHERNET (메트로 이더넷)
  // =========================================================================
  {
    componentId: 'metro-ethernet',
    category: 'wan',
    cloud: [
      {
        id: 'VM-metro-ethernet-aws-001',
        provider: 'aws',
        serviceName: 'AWS Direct Connect (Hosted)',
        serviceNameKo: 'AWS 다이렉트 커넥트 (호스팅)',
        serviceTier: 'Hosted',
        pricingModel: 'pay-per-use',
        differentiator:
          'Hosted connections via metro Ethernet partners at 50 Mbps to 10 Gbps for cloud on-ramp',
        differentiatorKo:
          '메트로 이더넷 파트너를 통한 50 Mbps ~ 10 Gbps 호스팅 연결로 클라우드 온램프',
        docUrl: 'https://docs.aws.amazon.com/directconnect/',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-metro-ethernet-kt-001',
        vendorName: 'KT',
        productName: 'KT Metro Ethernet Service',
        productNameKo: 'KT 메트로 이더넷 서비스',
        pricingModel: 'subscription',
        differentiator:
          'Korean carrier metro Ethernet providing L2/L3 connectivity between enterprise sites within a metro area',
        differentiatorKo:
          '도시권 내 기업 사이트 간 L2/L3 연결을 제공하는 한국 통신사 메트로 이더넷',
        docUrl: 'https://www.kt.com/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-metro-ethernet-megaport-001',
        vendorName: 'Megaport',
        productName: 'Megaport Ethernet Service',
        productNameKo: 'Megaport 이더넷 서비스',
        pricingModel: 'pay-per-use',
        differentiator:
          'On-demand NaaS metro Ethernet with global reach across 800+ data centers and multi-cloud connectivity',
        differentiatorKo:
          '800개 이상 데이터센터 및 멀티클라우드 연결의 주문형 NaaS 메트로 이더넷',
        docUrl: 'https://www.megaport.com/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [],
    onPremise: [
      {
        id: 'VM-metro-ethernet-ciena-001',
        vendorName: 'Ciena',
        productName: 'Ciena 3900 Series',
        productNameKo: 'Ciena 3900 시리즈',
        modelSeries: '3926 / 3928 / 3930',
        productTier: 'enterprise',
        targetUseCase:
          'Metro aggregation and demarcation with Carrier Ethernet 2.0, MPLS, and G.8032 ring protection',
        targetUseCaseKo:
          'Carrier Ethernet 2.0, MPLS, G.8032 링 보호 기반 메트로 집합 및 경계 장비',
        keySpecs: 'SAOS, 10GbE/100GbE, OAM, G.8032 ERPS, MEF 3.0 certified',
        lifecycleStatus: 'active',
        productUrl: 'https://www.ciena.com/metro-networks',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-metro-ethernet-adtran-001',
        vendorName: 'ADTRAN',
        productName: 'ADTRAN FSP 150 Series',
        productNameKo: 'ADTRAN FSP 150 시리즈',
        modelSeries: 'FSP 150-XG400 / FSP 150-GE11x',
        productTier: 'mid-range',
        targetUseCase:
          'Metro Ethernet demarcation and aggregation with open optical transport for flexible, multi-tenant networks',
        targetUseCaseKo:
          '유연한 다중 테넌트 네트워크를 위한 개방형 광전송 기반 메트로 이더넷 경계 및 집합 장비',
        keySpecs: 'Carrier Ethernet 2.0, MEF certified, open architecture, SLA assurance',
        lifecycleStatus: 'active',
        productUrl: 'https://www.adtran.com/en/products/open-networking.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-metro-ethernet-nokia-001',
        vendorName: 'Nokia',
        productName: 'Nokia 7210 SAS',
        productNameKo: 'Nokia 7210 SAS',
        modelSeries: '7210 SAS-Mxp / SAS-Sx / SAS-D',
        productTier: 'enterprise',
        targetUseCase:
          'Service access switch for metro Ethernet, mobile backhaul, business VPN, and broadband aggregation',
        targetUseCaseKo:
          '메트로 이더넷, 모바일 백홀, 비즈니스 VPN, 광대역 집합을 위한 서비스 접속 스위치',
        keySpecs: 'SR OS, Segment Routing, IP/MPLS, Carrier Ethernet, G.8032',
        lifecycleStatus: 'active',
        productUrl: 'https://www.nokia.com/networks/ip-networks/7210-service-access-system/',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 6. CORPORATE-INTERNET (기업인터넷 / KORNET)
  // =========================================================================
  {
    componentId: 'corporate-internet',
    category: 'wan',
    cloud: [
      {
        id: 'VM-corporate-internet-aws-001',
        provider: 'aws',
        serviceName: 'AWS Internet Gateway',
        serviceNameKo: 'AWS 인터넷 게이트웨이',
        pricingModel: 'pay-per-use',
        differentiator:
          'Horizontally scaled, redundant VPC component providing internet access; no bandwidth constraints or availability risks',
        differentiatorKo:
          '수평 확장, 이중화된 VPC 인터넷 접속 구성 요소; 대역폭 제약이나 가용성 위험 없음',
        docUrl: 'https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-corporate-internet-azure-001',
        provider: 'azure',
        serviceName: 'Azure NAT Gateway',
        serviceNameKo: 'Azure NAT 게이트웨이',
        pricingModel: 'pay-per-use',
        differentiator:
          'Fully managed outbound internet connectivity with SNAT port management and zone-redundant deployment',
        differentiatorKo:
          'SNAT 포트 관리 및 영역 이중화 배포의 완전 관리형 아웃바운드 인터넷 연결',
        docUrl: 'https://learn.microsoft.com/en-us/azure/nat-gateway/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-corporate-internet-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Cloud NAT',
        serviceNameKo: 'Google Cloud NAT',
        pricingModel: 'pay-per-use',
        differentiator:
          'Software-defined managed network address translation for outbound internet access from private VM instances',
        differentiatorKo:
          '사설 VM 인스턴스의 아웃바운드 인터넷 접속을 위한 소프트웨어 정의 관리형 NAT',
        docUrl: 'https://cloud.google.com/nat/docs/overview',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-corporate-internet-kt-001',
        vendorName: 'KT',
        productName: 'KT KORNET Business Internet',
        productNameKo: 'KT KORNET 기업인터넷',
        pricingModel: 'subscription',
        differentiator:
          'Korea\'s first commercial internet service; dedicated enterprise broadband from 56 Kbps to 10 Gbps with SLA and SME discounts',
        differentiatorKo:
          '한국 최초 상용 인터넷 서비스; 56 Kbps ~ 10 Gbps SLA 보장 기업 전용 브로드밴드, 중소기업 할인',
        docUrl: 'https://www.kt.com/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-corporate-internet-skt-001',
        vendorName: 'SK Broadband',
        productName: 'SK Broadband Business Internet',
        productNameKo: 'SK브로드밴드 기업인터넷',
        pricingModel: 'subscription',
        differentiator:
          'Korean enterprise internet service with dedicated bandwidth, DDoS protection, and 24/7 monitoring',
        differentiatorKo:
          '전용 대역폭, DDoS 보호, 24/7 모니터링의 한국 기업 인터넷 서비스',
        docUrl: 'https://www.skbroadband.com/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-corporate-internet-comcast-001',
        vendorName: 'Comcast Business',
        productName: 'Comcast Business Internet',
        productNameKo: 'Comcast 비즈니스 인터넷',
        pricingModel: 'subscription',
        differentiator:
          'US-based enterprise internet with speeds up to 10 Gbps, static IP options, and integrated SD-WAN',
        differentiatorKo:
          '최대 10 Gbps, 고정 IP 옵션, 통합 SD-WAN의 미국 기반 기업 인터넷',
        docUrl: 'https://business.comcast.com/internet',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [],
    onPremise: [
      {
        id: 'VM-corporate-internet-cisco-001',
        vendorName: 'Cisco',
        productName: 'Cisco ISR 4000 Series',
        productNameKo: 'Cisco ISR 4000 시리즈',
        modelSeries: 'ISR 4221 / 4331 / 4461',
        productTier: 'mid-range',
        targetUseCase:
          'Enterprise branch internet gateway router with integrated security, WAN optimization, and SD-WAN capability',
        targetUseCaseKo:
          '통합 보안, WAN 최적화, SD-WAN 기능의 기업 지사 인터넷 게이트웨이 라우터',
        keySpecs: 'IOS XE, 1-10 Gbps, integrated firewall/VPN, AppX license',
        lifecycleStatus: 'active',
        productUrl: 'https://www.cisco.com/c/en/us/products/routers/4000-series-integrated-services-routers-isr/index.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-corporate-internet-fortinet-001',
        vendorName: 'Fortinet',
        productName: 'FortiGate NGFW (Branch)',
        productNameKo: 'FortiGate NGFW (지사용)',
        modelSeries: 'FortiGate 60F / 80F / 100F',
        productTier: 'mid-range',
        targetUseCase:
          'Integrated internet gateway with NGFW, SD-WAN, and threat protection for enterprise branch offices',
        targetUseCaseKo:
          '기업 지사를 위한 NGFW, SD-WAN, 위협 방어 통합 인터넷 게이트웨이',
        keySpecs: 'FortiOS, SD-WAN, IPS/AV, 1-10 Gbps firewall throughput',
        lifecycleStatus: 'active',
        productUrl: 'https://www.fortinet.com/products/next-generation-firewall',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 7. VPN-SERVICE (VPN 서비스)
  // =========================================================================
  {
    componentId: 'vpn-service',
    category: 'wan',
    cloud: [
      {
        id: 'VM-vpn-service-aws-001',
        provider: 'aws',
        serviceName: 'AWS Site-to-Site VPN',
        serviceNameKo: 'AWS 사이트 간 VPN',
        serviceTier: 'Standard / Accelerated',
        pricingModel: 'pay-per-use',
        differentiator:
          'Managed IPsec VPN tunnels to VPC with optional Global Accelerator for improved performance over internet',
        differentiatorKo:
          '관리형 IPsec VPN 터널, 선택적 Global Accelerator로 인터넷 경유 성능 향상',
        docUrl: 'https://docs.aws.amazon.com/vpn/latest/s2svpn/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-vpn-service-aws-002',
        provider: 'aws',
        serviceName: 'AWS Client VPN',
        serviceNameKo: 'AWS 클라이언트 VPN',
        pricingModel: 'pay-per-use',
        differentiator:
          'Fully managed remote access VPN based on OpenVPN with Active Directory and SAML 2.0 authentication',
        differentiatorKo:
          'Active Directory 및 SAML 2.0 인증 기반 OpenVPN 완전 관리형 원격 접속 VPN',
        docUrl: 'https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-vpn-service-azure-001',
        provider: 'azure',
        serviceName: 'Azure VPN Gateway',
        serviceNameKo: 'Azure VPN 게이트웨이',
        serviceTier: 'Basic / VpnGw1-5',
        pricingModel: 'pay-per-use',
        differentiator:
          'Managed IPsec/IKEv2 VPN gateway with support for BGP, active-active, and zone-redundant configurations',
        differentiatorKo:
          'BGP, 액티브-액티브, 영역 이중화 구성을 지원하는 관리형 IPsec/IKEv2 VPN 게이트웨이',
        docUrl: 'https://learn.microsoft.com/en-us/azure/vpn-gateway/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-vpn-service-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Cloud VPN',
        serviceNameKo: 'Google Cloud VPN',
        serviceTier: 'HA VPN / Classic VPN',
        pricingModel: 'pay-per-use',
        differentiator:
          'HA VPN with 99.99% SLA using two tunnels, supports dynamic routing via BGP with Cloud Router',
        differentiatorKo:
          '두 개 터널을 사용한 99.99% SLA의 HA VPN, Cloud Router 통한 BGP 동적 라우팅 지원',
        docUrl: 'https://cloud.google.com/network-connectivity/docs/vpn',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-vpn-service-nordlayer-001',
        vendorName: 'NordLayer',
        productName: 'NordLayer Business VPN',
        productNameKo: 'NordLayer 비즈니스 VPN',
        pricingModel: 'subscription',
        differentiator:
          'Scalable business VPN with ZTNA, threat protection, and all infrastructure included in per-user pricing from $8/user/month',
        differentiatorKo:
          'ZTNA, 위협 보호, 사용자당 $8/월부터 모든 인프라 포함의 확장형 비즈니스 VPN',
        docUrl: 'https://nordlayer.com/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-vpn-service-checkpoint-001',
        vendorName: 'Check Point',
        productName: 'Check Point SASE (formerly Perimeter 81)',
        productNameKo: 'Check Point SASE (구 Perimeter 81)',
        pricingModel: 'subscription',
        differentiator:
          'Enterprise ZTNA and VPN with Check Point\'s 30+ years of cybersecurity expertise, SDP architecture with WireGuard/OpenVPN tunneling',
        differentiatorKo:
          'Check Point 30년 이상 사이버보안 전문성, WireGuard/OpenVPN 터널링 SDP 아키텍처의 기업용 ZTNA 및 VPN',
        docUrl: 'https://www.checkpoint.com/sase/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-vpn-service-wireguard-001',
        projectName: 'WireGuard',
        projectNameKo: 'WireGuard',
        license: 'GPL-2.0',
        description:
          'Modern, high-performance VPN protocol with ~4,000 lines of kernel code; 57% faster than OpenVPN on average',
        descriptionKo:
          '~4,000줄의 커널 코드로 구현된 현대적 고성능 VPN 프로토콜; OpenVPN 대비 평균 57% 빠른 성능',
        docUrl: 'https://www.wireguard.com/',
        githubUrl: 'https://github.com/WireGuard',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-vpn-service-strongswan-001',
        projectName: 'strongSwan',
        projectNameKo: 'strongSwan',
        license: 'GPL-2.0',
        description:
          'Comprehensive IPsec/IKEv2 implementation for Linux with highest goodput and lowest CPU utilization in benchmarks',
        descriptionKo:
          '벤치마크에서 최고 처리량과 최저 CPU 사용률을 기록한 Linux용 종합 IPsec/IKEv2 구현',
        docUrl: 'https://www.strongswan.org/',
        githubUrl: 'https://github.com/strongswan/strongswan',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-vpn-service-openvpn-001',
        projectName: 'OpenVPN',
        projectNameKo: 'OpenVPN',
        license: 'GPL-2.0',
        description:
          'Mature SSL/TLS VPN with maximum configurability for complex enterprise deployments and legacy system integration',
        descriptionKo:
          '복잡한 기업 배포 및 레거시 시스템 통합을 위한 최대 구성성의 성숙한 SSL/TLS VPN',
        docUrl: 'https://openvpn.net/community-resources/',
        githubUrl: 'https://github.com/OpenVPN/openvpn',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-vpn-service-cisco-001',
        vendorName: 'Cisco',
        productName: 'Cisco AnyConnect / Secure Client',
        productNameKo: 'Cisco AnyConnect / Secure Client',
        modelSeries: 'ASA 5500-X / Firepower',
        productTier: 'enterprise',
        targetUseCase:
          'Enterprise remote access and site-to-site VPN on ASA or Firepower appliances with posture assessment',
        targetUseCaseKo:
          'ASA 또는 Firepower 어플라이언스에서 포스처 평가 기능의 기업 원격 접속 및 사이트 간 VPN',
        keySpecs: 'IPsec/SSL VPN, posture/compliance, MFA integration',
        lifecycleStatus: 'active',
        productUrl: 'https://www.cisco.com/c/en/us/products/security/anyconnect-secure-mobility-client/index.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-vpn-service-paloalto-001',
        vendorName: 'Palo Alto Networks',
        productName: 'Palo Alto GlobalProtect',
        productNameKo: 'Palo Alto GlobalProtect',
        modelSeries: 'PA-Series NGFW',
        productTier: 'enterprise',
        targetUseCase:
          'Enterprise VPN with integrated NGFW inspection, HIP-based access control, and always-on protection',
        targetUseCaseKo:
          '통합 NGFW 검사, HIP 기반 접근 제어, 상시 보호의 기업 VPN',
        keySpecs: 'IPsec/SSL VPN, GlobalProtect agent, HIP checks, PAN-OS',
        lifecycleStatus: 'active',
        productUrl: 'https://www.paloaltonetworks.com/network-security/globalprotect',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 8. SD-WAN-SERVICE (SD-WAN 서비스)
  // =========================================================================
  {
    componentId: 'sd-wan-service',
    category: 'wan',
    cloud: [
      {
        id: 'VM-sd-wan-service-aws-001',
        provider: 'aws',
        serviceName: 'AWS Cloud WAN',
        serviceNameKo: 'AWS 클라우드 WAN',
        pricingModel: 'pay-per-use',
        differentiator:
          'Central dashboard for managing VPN, SD-WAN interconnects, and transit across AWS global backbone',
        differentiatorKo:
          'AWS 글로벌 백본에서 VPN, SD-WAN 인터커넥트, 트랜짓을 관리하는 중앙 대시보드',
        docUrl: 'https://docs.aws.amazon.com/vpc/latest/cloudwan/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-sd-wan-service-azure-001',
        provider: 'azure',
        serviceName: 'Azure Virtual WAN',
        serviceNameKo: 'Azure 가상 WAN',
        serviceTier: 'Basic / Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Automated hub-and-spoke with native SD-WAN partner integration, integrated ExpressRoute and VPN gateways',
        differentiatorKo:
          '네이티브 SD-WAN 파트너 통합, ExpressRoute 및 VPN 게이트웨이 통합의 자동화 허브 앤 스포크',
        docUrl: 'https://learn.microsoft.com/en-us/azure/virtual-wan/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-sd-wan-service-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Network Connectivity Center',
        serviceNameKo: 'Google 네트워크 연결 센터',
        pricingModel: 'pay-per-use',
        differentiator:
          'Hub for managing SD-WAN, VPN, and Interconnect spokes with Google backbone as transit network',
        differentiatorKo:
          'Google 백본을 전송 네트워크로 사용하는 SD-WAN, VPN, Interconnect 스포크 관리 허브',
        docUrl: 'https://cloud.google.com/network-connectivity-center/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-sd-wan-service-cisco-001',
        vendorName: 'Cisco',
        productName: 'Cisco Meraki SD-WAN',
        productNameKo: 'Cisco Meraki SD-WAN',
        pricingModel: 'subscription',
        differentiator:
          'Cloud-managed SD-WAN for mid-sized organizations with zero-touch provisioning and simple dashboard',
        differentiatorKo:
          '제로터치 프로비저닝과 간편한 대시보드의 중간 규모 조직을 위한 클라우드 관리형 SD-WAN',
        docUrl: 'https://meraki.cisco.com/products/sd-wan/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-sd-wan-service-cisco-002',
        vendorName: 'Cisco',
        productName: 'Cisco Catalyst SD-WAN (Viptela)',
        productNameKo: 'Cisco Catalyst SD-WAN (Viptela)',
        pricingModel: 'subscription',
        differentiator:
          'Enterprise SD-WAN with integrated security, ThousandEyes monitoring, cloud on-ramp, and single-vendor SASE option',
        differentiatorKo:
          '통합 보안, ThousandEyes 모니터링, 클라우드 온램프, 단일 벤더 SASE 옵션의 엔터프라이즈 SD-WAN',
        docUrl: 'https://www.cisco.com/c/en/us/solutions/enterprise-networks/sd-wan/index.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-sd-wan-service-vmware-001',
        vendorName: 'Broadcom (VMware)',
        productName: 'VMware VeloCloud SD-WAN',
        productNameKo: 'VMware VeloCloud SD-WAN',
        pricingModel: 'subscription',
        differentiator:
          'Cloud-first SD-WAN with gateway POPs, orchestrator, and 6-year Gartner Magic Quadrant leader status',
        differentiatorKo:
          '게이트웨이 POP, 오케스트레이터, 6년 연속 Gartner 매직 쿼드런트 리더의 클라우드 퍼스트 SD-WAN',
        docUrl: 'https://www.vmware.com/products/sd-wan.html',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-sd-wan-service-flexiwan-001',
        projectName: 'flexiWAN',
        projectNameKo: 'flexiWAN',
        license: 'AGPL-3.0',
        description:
          'World\'s first open-source SD-WAN with management, orchestration, and SD-WAN edge functionality',
        descriptionKo:
          '관리, 오케스트레이션, SD-WAN 에지 기능을 갖춘 세계 최초 오픈소스 SD-WAN',
        docUrl: 'https://flexiwan.com/',
        githubUrl: 'https://github.com/flexiWAN/flexiwan-router',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-sd-wan-service-fortinet-001',
        vendorName: 'Fortinet',
        productName: 'Fortinet Secure SD-WAN',
        productNameKo: 'Fortinet Secure SD-WAN',
        modelSeries: 'FortiGate 40F-3700F',
        productTier: 'enterprise',
        targetUseCase:
          'Converged NGFW + SD-WAN on FortiGate appliances with AI-powered security bundles for single-vendor SASE',
        targetUseCaseKo:
          'FortiGate 어플라이언스에서 AI 기반 보안 번들로 단일 벤더 SASE를 위한 통합 NGFW + SD-WAN',
        keySpecs: 'FortiOS, FortiASIC, zero-touch, multi-cloud on-ramp',
        lifecycleStatus: 'active',
        productUrl: 'https://www.fortinet.com/products/sd-wan',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-sd-wan-service-versa-001',
        vendorName: 'Versa Networks',
        productName: 'Versa Secure SD-WAN',
        productNameKo: 'Versa Secure SD-WAN',
        modelSeries: 'Versa CSG Series',
        productTier: 'enterprise',
        targetUseCase:
          'Full-stack SASE platform with SD-WAN, NGFW, SWG, CASB, and ZTNA in a single software stack',
        targetUseCaseKo:
          'SD-WAN, NGFW, SWG, CASB, ZTNA를 단일 소프트웨어 스택에 통합한 풀스택 SASE 플랫폼',
        keySpecs: 'VOS, single-pass architecture, multi-tenant, MSP-ready',
        lifecycleStatus: 'active',
        productUrl: 'https://versa-networks.com/sase/',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 9. PRIVATE-5G (5G 특화망)
  // =========================================================================
  {
    componentId: 'private-5g',
    category: 'wan',
    cloud: [
      {
        id: 'VM-private-5g-aws-001',
        provider: 'aws',
        serviceName: 'AWS Integrated Private Wireless',
        serviceNameKo: 'AWS 통합 사설 무선',
        pricingModel: 'subscription',
        differentiator:
          'CSP-partnered private 5G/LTE program integrating carrier wireless with AWS Regions, Local Zones, and Outposts (original Private 5G service retired May 2025)',
        differentiatorKo:
          'CSP 파트너십 기반 사설 5G/LTE 프로그램, 캐리어 무선을 AWS 리전, 로컬 존, 아웃포스트와 통합 (기존 Private 5G 서비스 2025년 5월 종료)',
        docUrl: 'https://aws.amazon.com/telecom/integrated-private-wireless/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-private-5g-azure-001',
        provider: 'azure',
        serviceName: 'Azure Private 5G Core',
        serviceNameKo: 'Azure 프라이빗 5G 코어',
        pricingModel: 'pay-per-use',
        differentiator:
          'Azure-managed 5G core deployed on Azure Stack Edge for enterprise private mobile networks with SIM management',
        differentiatorKo:
          'SIM 관리 기능의 기업 사설 모바일 네트워크를 위해 Azure Stack Edge에 배포되는 Azure 관리형 5G 코어',
        docUrl: 'https://learn.microsoft.com/en-us/azure/private-5g-core/',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-private-5g-kt-001',
        vendorName: 'KT',
        productName: 'KT Private 5G Service',
        productNameKo: 'KT 5G 특화망 서비스',
        pricingModel: 'subscription',
        differentiator:
          'Korean carrier-managed private 5G network for smart factory, logistics, and campus deployments',
        differentiatorKo:
          '스마트 팩토리, 물류, 캠퍼스 배포를 위한 한국 통신사 관리형 5G 특화망',
        docUrl: 'https://www.kt.com/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-private-5g-skt-001',
        vendorName: 'SK Telecom',
        productName: 'SK Telecom Private 5G',
        productNameKo: 'SK텔레콤 5G 특화망',
        pricingModel: 'subscription',
        differentiator:
          'Korean MNO private 5G with MEC integration for manufacturing, ports, and enterprise campus use cases',
        differentiatorKo:
          '제조, 항만, 기업 캠퍼스 활용을 위한 MEC 통합 한국 MNO 5G 특화망',
        docUrl: 'https://www.sktelecom.com/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-private-5g-open5gs-001',
        projectName: 'Open5GS',
        projectNameKo: 'Open5GS',
        license: 'AGPL-3.0',
        description:
          'Mature open-source 4G/5G core in C with comprehensive feature set including IMS, SMS, and roaming support; best for enterprise private 5G',
        descriptionKo:
          'IMS, SMS, 로밍 지원의 종합 기능을 갖춘 C 언어 기반 성숙한 오픈소스 4G/5G 코어; 기업 사설 5G에 최적',
        docUrl: 'https://open5gs.org/',
        githubUrl: 'https://github.com/open5gs/open5gs',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-private-5g-free5gc-001',
        projectName: 'free5GC',
        projectNameKo: 'free5GC',
        license: 'Apache-2.0',
        description:
          'Go-based 5G core from NCTU (Taiwan), Linux Foundation member; best for PoC and experimental networks with low resource consumption',
        descriptionKo:
          'NCTU(대만) 개발 Go 기반 5G 코어, 리눅스 재단 회원; 낮은 리소스 소비의 PoC 및 실험 네트워크에 최적',
        docUrl: 'https://free5gc.org/',
        githubUrl: 'https://github.com/free5gc/free5gc',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-private-5g-nokia-001',
        vendorName: 'Nokia',
        productName: 'Nokia Digital Automation Cloud (DAC)',
        productNameKo: 'Nokia 디지털 오토메이션 클라우드 (DAC)',
        productTier: 'enterprise',
        targetUseCase:
          'End-to-end private 5G/LTE solution for industrial automation; ~960 customers and 2,000+ deployments globally (divestiture announced Nov 2025)',
        targetUseCaseKo:
          '산업 자동화를 위한 엔드투엔드 사설 5G/LTE 솔루션; 전세계 ~960 고객, 2,000+ 배포 (2025년 11월 매각 발표)',
        keySpecs: 'E2E private LTE/5G, edge computing, Nokia NDAC platform',
        lifecycleStatus: 'active',
        productUrl: 'https://www.nokia.com/networks/private-wireless/digital-automation-cloud/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-private-5g-ericsson-001',
        vendorName: 'Ericsson',
        productName: 'Ericsson Private 5G',
        productNameKo: 'Ericsson 사설 5G',
        productTier: 'enterprise',
        targetUseCase:
          'Dedicated private 5G for manufacturing, logistics, and energy with industry-leading RAN execution capability',
        targetUseCaseKo:
          '제조, 물류, 에너지를 위한 업계 최고 RAN 실행 역량의 전용 사설 5G',
        keySpecs: 'Ericsson RAN, dual-mode 4G/5G, dedicated spectrum, edge compute',
        lifecycleStatus: 'active',
        productUrl: 'https://www.ericsson.com/en/private-networks',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-private-5g-samsung-001',
        vendorName: 'Samsung',
        productName: 'Samsung Private 5G',
        productNameKo: 'Samsung 사설 5G',
        productTier: 'enterprise',
        targetUseCase:
          'Vertically integrated private 5G with Samsung RAN, core, and management for campus and factory deployments',
        targetUseCaseKo:
          '캠퍼스 및 공장 배포를 위한 Samsung RAN, 코어, 관리 수직 통합 사설 5G',
        keySpecs: 'Samsung vRAN, 5GC, network slicing, enterprise dashboard',
        lifecycleStatus: 'active',
        productUrl: 'https://www.samsung.com/global/business/networks/solutions/private-5g/',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 10. CORE-NETWORK (모바일 코어망)
  // =========================================================================
  {
    componentId: 'core-network',
    category: 'wan',
    cloud: [
      {
        id: 'VM-core-network-azure-001',
        provider: 'azure',
        serviceName: 'Azure Private 5G Core',
        serviceNameKo: 'Azure 프라이빗 5G 코어',
        pricingModel: 'pay-per-use',
        differentiator:
          'Cloud-native 5G core NFs running on Azure Stack Edge for enterprise private mobile core deployments',
        differentiatorKo:
          '기업 사설 모바일 코어 배포를 위해 Azure Stack Edge에서 실행되는 클라우드 네이티브 5G 코어 NF',
        docUrl: 'https://learn.microsoft.com/en-us/azure/private-5g-core/',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-core-network-kt-001',
        vendorName: 'KT',
        productName: 'KT 5G Core Network',
        productNameKo: 'KT 5G 코어망',
        pricingModel: 'subscription',
        differentiator:
          'Korean nationwide carrier 5G SA core with network slicing, edge computing, and CUPS architecture',
        differentiatorKo:
          '네트워크 슬라이싱, 엣지 컴퓨팅, CUPS 아키텍처의 한국 전국 캐리어 5G SA 코어',
        docUrl: 'https://www.kt.com/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-core-network-skt-001',
        vendorName: 'SK Telecom',
        productName: 'SK Telecom 5G Core',
        productNameKo: 'SK텔레콤 5G 코어',
        pricingModel: 'subscription',
        differentiator:
          'Korean MNO 5G SA core with cloud-native NFs, microservices architecture, and service-based interfaces',
        differentiatorKo:
          '클라우드 네이티브 NF, 마이크로서비스 아키텍처, 서비스 기반 인터페이스의 한국 MNO 5G SA 코어',
        docUrl: 'https://www.sktelecom.com/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-core-network-open5gs-001',
        projectName: 'Open5GS',
        projectNameKo: 'Open5GS',
        license: 'AGPL-3.0',
        description:
          'Complete 5G SA core (AMF, SMF, UPF, etc.) in C; best control plane latency, scalable and stable under high user densities',
        descriptionKo:
          'C 언어 완전한 5G SA 코어 (AMF, SMF, UPF 등); 최고 제어 플레인 지연, 높은 사용자 밀도에서 안정적 확장',
        docUrl: 'https://open5gs.org/',
        githubUrl: 'https://github.com/open5gs/open5gs',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-core-network-free5gc-001',
        projectName: 'free5GC',
        projectNameKo: 'free5GC',
        license: 'Apache-2.0',
        description:
          'Go-based 3GPP Release 16/17 5G core; Linux Foundation member, Docker/Helm deployment, lowest resource consumption',
        descriptionKo:
          'Go 기반 3GPP 릴리스 16/17 5G 코어; 리눅스 재단 회원, Docker/Helm 배포, 최저 리소스 소비',
        docUrl: 'https://free5gc.org/',
        githubUrl: 'https://github.com/free5gc/free5gc',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-core-network-nokia-001',
        vendorName: 'Nokia',
        productName: 'Nokia Core Network Solutions',
        productNameKo: 'Nokia 코어 네트워크 솔루션',
        productTier: 'enterprise',
        targetUseCase:
          'Cloud-native 5G SA core with AMF, SMF, UPF, and network slicing for carrier and enterprise deployments',
        targetUseCaseKo:
          '캐리어 및 기업 배포를 위한 AMF, SMF, UPF, 네트워크 슬라이싱의 클라우드 네이티브 5G SA 코어',
        keySpecs: 'Cloud-native NFs, NFVI/CaaS, network slicing, 4G/5G dual mode',
        lifecycleStatus: 'active',
        productUrl: 'https://www.nokia.com/networks/core-networks/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-core-network-ericsson-001',
        vendorName: 'Ericsson',
        productName: 'Ericsson Packet Core',
        productNameKo: 'Ericsson 패킷 코어',
        productTier: 'enterprise',
        targetUseCase:
          'Dual-mode 4G/5G packet core with cloud-native deployment on public cloud (GCP partnership) and on-premise',
        targetUseCaseKo:
          '퍼블릭 클라우드(GCP 파트너십) 및 온프레미스 클라우드 네이티브 배포의 듀얼모드 4G/5G 패킷 코어',
        keySpecs: 'Cloud-native, GCP partnership, 1B+ subscribers managed globally',
        lifecycleStatus: 'active',
        productUrl: 'https://www.ericsson.com/en/core-network',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-core-network-samsung-001',
        vendorName: 'Samsung',
        productName: 'Samsung 5G Core (5GC)',
        productNameKo: 'Samsung 5G 코어 (5GC)',
        productTier: 'enterprise',
        targetUseCase:
          'End-to-end 5G SA core with containerized NFs, service-based architecture, and network slicing',
        targetUseCaseKo:
          '컨테이너화된 NF, 서비스 기반 아키텍처, 네트워크 슬라이싱의 엔드투엔드 5G SA 코어',
        keySpecs: 'Container-native, SBA, network slicing, UPF, AMF, SMF',
        lifecycleStatus: 'active',
        productUrl: 'https://www.samsung.com/global/business/networks/solutions/core-network/',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 11. UPF (5G User Plane Function)
  // =========================================================================
  {
    componentId: 'upf',
    category: 'wan',
    cloud: [],
    managed: [
      {
        id: 'VM-upf-cisco-001',
        vendorName: 'Cisco',
        productName: 'Cisco Ultra Cloud Core UPF',
        productNameKo: 'Cisco Ultra Cloud Core UPF',
        pricingModel: 'subscription',
        differentiator:
          'Cloud-native UPF with packet routing, QoS handling, and external PDU session support for 5G SA deployments',
        differentiatorKo:
          '5G SA 배포를 위한 패킷 라우팅, QoS 처리, 외부 PDU 세션 지원의 클라우드 네이티브 UPF',
        docUrl: 'https://www.cisco.com/c/en/us/products/wireless/ultra-cloud-core-user-plane-function/index.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-upf-mavenir-001',
        vendorName: 'Mavenir',
        productName: 'Mavenir Converged Packet Core UPF',
        productNameKo: 'Mavenir 통합 패킷 코어 UPF',
        pricingModel: 'subscription',
        differentiator:
          'Cloud-native, OpenRAN-aligned UPF with multi-access edge computing support and DPDK acceleration',
        differentiatorKo:
          'OpenRAN 호환 클라우드 네이티브 UPF, 멀티 액세스 엣지 컴퓨팅 지원 및 DPDK 가속',
        docUrl: 'https://www.mavenir.com/portfolio/mavcore/5g-core/user-plane-function/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-upf-open5gs-001',
        projectName: 'Open5GS UPF',
        projectNameKo: 'Open5GS UPF',
        license: 'AGPL-3.0',
        description:
          'User plane function component of Open5GS; GTP-U tunneling and packet forwarding for 5G SA core',
        descriptionKo:
          'Open5GS의 사용자 플레인 기능 컴포넌트; 5G SA 코어를 위한 GTP-U 터널링 및 패킷 포워딩',
        docUrl: 'https://open5gs.org/',
        githubUrl: 'https://github.com/open5gs/open5gs',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-upf-eupf-001',
        projectName: 'eUPF',
        projectNameKo: 'eUPF',
        license: 'Apache-2.0',
        description:
          'eBPF/XDP-based UPF achieving ~9.6 Gbps in both directions; 6-8x faster than Open5GS UPF, 30% faster than UPG-VPP, no userspace context switches',
        descriptionKo:
          '양방향 ~9.6 Gbps 달성 eBPF/XDP 기반 UPF; Open5GS UPF 대비 6-8배, UPG-VPP 대비 30% 빠른 성능, 유저스페이스 컨텍스트 스위치 없음',
        docUrl: 'https://github.com/edgecomllc/eupf',
        githubUrl: 'https://github.com/edgecomllc/eupf',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-upf-nokia-001',
        vendorName: 'Nokia',
        productName: 'Nokia UPF',
        productNameKo: 'Nokia UPF',
        productTier: 'enterprise',
        targetUseCase:
          'High-performance user plane function for carrier 5G core with FP silicon-based packet processing',
        targetUseCaseKo:
          'FP 실리콘 기반 패킷 처리의 캐리어 5G 코어용 고성능 사용자 플레인 기능',
        keySpecs: 'FP silicon, cloud-native, CUPS architecture, GTP-U',
        lifecycleStatus: 'active',
        productUrl: 'https://www.nokia.com/networks/core-networks/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-upf-ericsson-001',
        vendorName: 'Ericsson',
        productName: 'Ericsson UPF',
        productNameKo: 'Ericsson UPF',
        productTier: 'enterprise',
        targetUseCase:
          'Cloud-native UPF deployable on hyperscaler facilities (GCP) and on-premise for distributed edge and core',
        targetUseCaseKo:
          '하이퍼스케일러 시설(GCP) 및 온프레미스에 배포 가능한 분산 엣지 및 코어용 클라우드 네이티브 UPF',
        keySpecs: 'Cloud-native, hyperscaler-ready, CUPS, GTP-U/PDU session',
        lifecycleStatus: 'active',
        productUrl: 'https://www.ericsson.com/en/core-network',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-upf-samsung-001',
        vendorName: 'Samsung',
        productName: 'Samsung 5G UPF',
        productNameKo: 'Samsung 5G UPF',
        productTier: 'enterprise',
        targetUseCase:
          'Containerized user plane function with packet routing, QoS, and edge deployment for Samsung 5GC ecosystem',
        targetUseCaseKo:
          'Samsung 5GC 생태계를 위한 패킷 라우팅, QoS, 엣지 배포의 컨테이너화된 사용자 플레인 기능',
        keySpecs: 'Container-native, Red Hat certified, DPDK, GTP-U',
        lifecycleStatus: 'active',
        productUrl: 'https://www.samsung.com/global/business/networks/solutions/core-network/',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 12. RING-NETWORK (링 네트워크 / 이중화 토폴로지)
  // =========================================================================
  {
    componentId: 'ring-network',
    category: 'wan',
    cloud: [],
    managed: [
      {
        id: 'VM-ring-network-kt-001',
        vendorName: 'KT',
        productName: 'KT Ring Protection Network Service',
        productNameKo: 'KT 링 보호 네트워크 서비스',
        pricingModel: 'subscription',
        differentiator:
          'Carrier-managed G.8032/ERPS ring topology for metro and access networks with sub-50ms failover',
        differentiatorKo:
          '50ms 미만 페일오버의 메트로 및 접속 네트워크용 통신사 관리형 G.8032/ERPS 링 토폴로지',
        docUrl: 'https://www.kt.com/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-ring-network-openvswitch-001',
        projectName: 'Open vSwitch (OVS)',
        projectNameKo: 'Open vSwitch (OVS)',
        license: 'Apache-2.0',
        description:
          'Production-quality virtual switch supporting STP/RSTP for loop prevention in virtualized ring topologies',
        descriptionKo:
          '가상화된 링 토폴로지에서 루프 방지를 위한 STP/RSTP 지원 프로덕션 품질 가상 스위치',
        docUrl: 'https://www.openvswitch.org/',
        githubUrl: 'https://github.com/openvswitch/ovs',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-ring-network-ciena-001',
        vendorName: 'Ciena',
        productName: 'Ciena ERPS Ring Protection',
        productNameKo: 'Ciena ERPS 링 보호',
        modelSeries: '3900 / 5100 Series',
        productTier: 'enterprise',
        targetUseCase:
          'G.8032 Ethernet Ring Protection Switching with sub-50ms failover, loop-free operation, and multi-ring topology support',
        targetUseCaseKo:
          '50ms 미만 페일오버, 루프 프리 운영, 다중 링 토폴로지 지원의 G.8032 이더넷 링 보호 스위칭',
        keySpecs: 'G.8032v2 ERPS, SAOS, MEF certified, multi-ring interconnect',
        lifecycleStatus: 'active',
        productUrl: 'https://www.ciena.com/insights/videos/G-8032-Ethernet-Ring-Protection-Switching-prx.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-ring-network-nokia-001',
        vendorName: 'Nokia',
        productName: 'Nokia G.8032 Ring Protection',
        productNameKo: 'Nokia G.8032 링 보호',
        modelSeries: '7210 SAS / 7750 SR',
        productTier: 'enterprise',
        targetUseCase:
          'Advanced G.8032 Ethernet ring protection with multi-ring/multi-chassis topologies for access and metro networks',
        targetUseCaseKo:
          '접속 및 메트로 네트워크를 위한 다중 링/다중 섀시 토폴로지의 고급 G.8032 이더넷 링 보호',
        keySpecs: 'G.8032v2, SR OS, multi-ring topology, access ring aggregation',
        lifecycleStatus: 'active',
        productUrl: 'https://www.nokia.com/networks/ip-networks/7210-service-access-system/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-ring-network-cisco-001',
        vendorName: 'Cisco',
        productName: 'Cisco REP/ERPS Ring Protection',
        productNameKo: 'Cisco REP/ERPS 링 보호',
        modelSeries: 'Catalyst IE3400 / IE9300 / Catalyst 9000',
        productTier: 'enterprise',
        targetUseCase:
          'Resilient Ethernet Protocol (REP) and G.8032 ERPS for industrial and enterprise ring topologies with 50ms convergence',
        targetUseCaseKo:
          '50ms 수렴의 산업 및 기업 링 토폴로지를 위한 REP(Resilient Ethernet Protocol) 및 G.8032 ERPS',
        keySpecs: 'REP/REP Fast (250ms/50ms), G.8032, IOS XE, industrial/rugged platforms',
        lifecycleStatus: 'active',
        productUrl: 'https://www.cisco.com/c/en/us/support/docs/lan-switching/ethernet/116384-technote-rep-00.html',
        lastVerified: '2026-02-14',
      },
    ],
  },
];
