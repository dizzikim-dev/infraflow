/**
 * Security Vendor Mappings — Cloud, managed, open-source, and on-premise
 * product mappings for all 15 security infrastructure components.
 *
 * Components: firewall, waf, ids-ips, vpn-gateway, nac, dlp,
 *             sase-gateway, ztna-broker, casb, siem, soar,
 *             cctv-camera, nvr, video-server, access-control
 *
 * Last updated: 2026-02-14
 */

import type { ComponentVendorMap } from './types';

export const securityVendorMappings: ComponentVendorMap[] = [
  // =========================================================================
  // 1. FIREWALL
  // =========================================================================
  {
    componentId: 'firewall',
    category: 'security',
    cloud: [
      {
        id: 'VM-firewall-aws-001',
        provider: 'aws',
        serviceName: 'AWS Network Firewall',
        serviceNameKo: 'AWS 네트워크 방화벽',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Deep VPC integration with managed rule groups from AWS and partners, stateful inspection and IPS capabilities',
        differentiatorKo:
          'AWS VPC와의 긴밀한 통합, AWS 및 파트너 관리형 규칙 그룹, 상태 기반 검사 및 IPS 기능',
        docUrl: 'https://docs.aws.amazon.com/network-firewall/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-firewall-azure-001',
        provider: 'azure',
        serviceName: 'Azure Firewall',
        serviceNameKo: 'Azure 방화벽',
        serviceTier: 'Premium',
        pricingModel: 'pay-per-use',
        differentiator:
          'Cloud-native stateful firewall with built-in HA, threat intelligence filtering, and IDPS in Premium tier',
        differentiatorKo:
          '내장 고가용성, 위협 인텔리전스 필터링, Premium 티어 IDPS 기능의 클라우드 네이티브 상태 기반 방화벽',
        docUrl: 'https://learn.microsoft.com/en-us/azure/firewall/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-firewall-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Cloud Firewall',
        serviceNameKo: 'Google Cloud 방화벽',
        serviceTier: 'Standard / Plus',
        pricingModel: 'pay-per-use',
        differentiator:
          'Hierarchical firewall policies with Cloud NGFW for advanced threat prevention and TLS inspection',
        differentiatorKo:
          '계층적 방화벽 정책, 고급 위협 방지 및 TLS 검사를 위한 Cloud NGFW 지원',
        docUrl: 'https://cloud.google.com/firewall/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-firewall-cloudflare-001',
        vendorName: 'Cloudflare',
        productName: 'Cloudflare Magic Firewall',
        productNameKo: 'Cloudflare 매직 방화벽',
        pricingModel: 'subscription',
        differentiator:
          'Global edge network with DDoS protection included, packet-level filtering at the network edge',
        differentiatorKo:
          'DDoS 보호 포함 글로벌 엣지 네트워크, 네트워크 엣지에서의 패킷 수준 필터링',
        docUrl: 'https://developers.cloudflare.com/magic-firewall/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-firewall-barracuda-001',
        vendorName: 'Barracuda Networks',
        productName: 'Barracuda CloudGen Firewall',
        productNameKo: 'Barracuda CloudGen 방화벽',
        pricingModel: 'subscription',
        differentiator:
          'Unified cloud-managed firewall with built-in SD-WAN and zero-touch deployment for distributed enterprises',
        differentiatorKo:
          '분산 엔터프라이즈를 위한 내장 SD-WAN과 제로터치 배포 기능의 통합 클라우드 관리 방화벽',
        docUrl: 'https://www.barracuda.com/products/network-protection/cloudgen-firewall',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-firewall-pfsense-001',
        projectName: 'pfSense',
        projectNameKo: 'pfSense',
        license: 'Apache 2.0',
        description:
          'FreeBSD-based firewall/router with web UI, VPN support, and extensive plugin ecosystem',
        descriptionKo:
          'FreeBSD 기반 방화벽/라우터, 웹 UI, VPN 지원 및 광범위한 플러그인 생태계',
        docUrl: 'https://docs.netgate.com/pfsense/en/latest/',
        githubUrl: 'https://github.com/pfsense/pfsense',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-firewall-opnsense-001',
        projectName: 'OPNsense',
        projectNameKo: 'OPNsense',
        license: 'BSD 2-Clause',
        description:
          'FreeBSD-based firewall fork of pfSense with modern UI, weekly security updates, and inline IPS via Suricata',
        descriptionKo:
          'pfSense 포크 기반 FreeBSD 방화벽, 현대적 UI, 주간 보안 업데이트, Suricata 인라인 IPS 지원',
        docUrl: 'https://docs.opnsense.org/',
        githubUrl: 'https://github.com/opnsense/core',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-firewall-paloalto-001',
        vendorName: 'Palo Alto Networks',
        productName: 'PA-Series Next-Generation Firewall',
        productNameKo: 'PA 시리즈 차세대 방화벽',
        modelSeries: 'PA-400, PA-800, PA-3400, PA-5400, PA-7000',
        productTier: 'enterprise',
        targetUseCase:
          'Enterprise perimeter and data center security with advanced threat prevention',
        targetUseCaseKo:
          '고급 위협 방지 기능을 갖춘 엔터프라이즈 경계 및 데이터센터 보안',
        keySpecs:
          'Up to 720 Gbps throughput (PA-7000), App-ID, User-ID, Threat Prevention, WildFire',
        lifecycleStatus: 'active',
        productUrl:
          'https://www.paloaltonetworks.com/network-security/next-generation-firewall',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-firewall-fortinet-001',
        vendorName: 'Fortinet',
        productName: 'FortiGate Next-Generation Firewall',
        productNameKo: 'FortiGate 차세대 방화벽',
        modelSeries: 'FortiGate 40F, 60F, 100F, 600F, 3000F, 4800F',
        productTier: 'enterprise',
        targetUseCase:
          'Security-driven networking with integrated SD-WAN, high performance at competitive price point',
        targetUseCaseKo:
          '통합 SD-WAN을 갖춘 보안 중심 네트워킹, 경쟁력 있는 가격의 고성능',
        keySpecs:
          'Up to 1.2 Tbps throughput (4800F), FortiGuard AI Security Services, built-in SD-WAN',
        lifecycleStatus: 'active',
        productUrl: 'https://www.fortinet.com/products/next-generation-firewall',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-firewall-checkpoint-001',
        vendorName: 'Check Point Software',
        productName: 'Quantum Security Gateway',
        productNameKo: 'Quantum 보안 게이트웨이',
        modelSeries: 'Quantum 6200, 6400, 6600, 6800, 7000, 16000, 26000',
        productTier: 'enterprise',
        targetUseCase:
          'Comprehensive policy control with centralized SmartConsole management and Gaia OS stability',
        targetUseCaseKo:
          '중앙 집중식 SmartConsole 관리 및 Gaia OS 안정성을 갖춘 포괄적 정책 제어',
        keySpecs:
          'Up to 63.5 Gbps threat prevention (26000), ThreatCloud AI, R81+ unified management',
        lifecycleStatus: 'active',
        productUrl:
          'https://www.checkpoint.com/quantum/next-generation-firewall/',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 2. WAF (Web Application Firewall)
  // =========================================================================
  {
    componentId: 'waf',
    category: 'security',
    cloud: [
      {
        id: 'VM-waf-aws-001',
        provider: 'aws',
        serviceName: 'AWS WAF',
        serviceNameKo: 'AWS 웹 애플리케이션 방화벽',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Low false positive rate (6%), native integration with CloudFront, ALB, API Gateway, and AWS Shield for DDoS',
        differentiatorKo:
          '낮은 오탐률(6%), CloudFront, ALB, API Gateway와의 네이티브 통합, DDoS용 AWS Shield 연동',
        docUrl: 'https://docs.aws.amazon.com/waf/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-waf-azure-001',
        provider: 'azure',
        serviceName: 'Azure Web Application Firewall',
        serviceNameKo: 'Azure 웹 애플리케이션 방화벽',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'High detection rate (97.5%), built-in managed rules with Microsoft threat intelligence, Application Gateway and Front Door integration',
        differentiatorKo:
          '높은 탐지율(97.5%), Microsoft 위협 인텔리전스 관리형 규칙, Application Gateway 및 Front Door 통합',
        docUrl:
          'https://learn.microsoft.com/en-us/azure/web-application-firewall/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-waf-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Cloud Armor',
        serviceNameKo: 'Google Cloud Armor',
        serviceTier: 'Standard / Plus',
        pricingModel: 'pay-per-use',
        differentiator:
          'Adaptive protection with ML-based threat detection, full inspection of large payloads, DDoS mitigation at Google scale',
        differentiatorKo:
          'ML 기반 위협 탐지 적응형 보호, 대용량 페이로드 전체 검사, Google 규모의 DDoS 완화',
        docUrl: 'https://cloud.google.com/armor/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-waf-cloudflare-001',
        vendorName: 'Cloudflare',
        productName: 'Cloudflare WAF',
        productNameKo: 'Cloudflare 웹 방화벽',
        pricingModel: 'freemium',
        differentiator:
          'Global anycast network with free tier, managed rulesets, and bot management included',
        differentiatorKo:
          '무료 티어 포함 글로벌 애니캐스트 네트워크, 관리형 규칙셋 및 봇 관리',
        docUrl: 'https://developers.cloudflare.com/waf/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-waf-imperva-001',
        vendorName: 'Imperva',
        productName: 'Imperva Cloud WAF',
        productNameKo: 'Imperva 클라우드 WAF',
        pricingModel: 'subscription',
        differentiator:
          'Industry-leading WAF with advanced bot protection, API security, and DDoS mitigation in a single platform',
        differentiatorKo:
          '고급 봇 보호, API 보안, DDoS 완화 기능을 단일 플랫폼에 통합한 업계 선도 WAF',
        docUrl: 'https://www.imperva.com/products/web-application-firewall-waf/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-waf-akamai-001',
        vendorName: 'Akamai',
        productName: 'Akamai App & API Protector',
        productNameKo: 'Akamai 앱 & API 프로텍터',
        pricingModel: 'subscription',
        differentiator:
          'Largest CDN edge network with adaptive threat intelligence, automated rule tuning, and API discovery',
        differentiatorKo:
          '최대 CDN 엣지 네트워크 기반 적응형 위협 인텔리전스, 자동 규칙 튜닝 및 API 탐지',
        docUrl:
          'https://www.akamai.com/products/app-and-api-protector',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-waf-modsecurity-001',
        projectName: 'ModSecurity',
        projectNameKo: 'ModSecurity',
        license: 'Apache 2.0',
        description:
          'Open-source WAF engine for Apache, Nginx, and IIS with OWASP Core Rule Set (CRS) support',
        descriptionKo:
          'Apache, Nginx, IIS용 오픈소스 WAF 엔진, OWASP Core Rule Set(CRS) 지원',
        docUrl: 'https://www.modsecurity.org/',
        githubUrl: 'https://github.com/owasp-modsecurity/ModSecurity',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-waf-coraza-001',
        projectName: 'Coraza WAF',
        projectNameKo: 'Coraza WAF',
        license: 'Apache 2.0',
        description:
          'Modern Go-based WAF engine compatible with ModSecurity rules and OWASP CRS, designed for cloud-native environments',
        descriptionKo:
          'ModSecurity 규칙 및 OWASP CRS 호환 Go 기반 현대 WAF 엔진, 클라우드 네이티브 환경 설계',
        docUrl: 'https://coraza.io/docs/tutorials/introduction/',
        githubUrl: 'https://github.com/corazawaf/coraza',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-waf-f5-001',
        vendorName: 'F5 Networks',
        productName: 'F5 Advanced WAF (BIG-IP)',
        productNameKo: 'F5 Advanced WAF (BIG-IP)',
        modelSeries: 'BIG-IP i2000, i4000, i5000, i7000, i10000, i15000',
        productTier: 'enterprise',
        targetUseCase:
          'Application security with behavioral analytics, bot defense, and L7 DDoS mitigation for data center deployments',
        targetUseCaseKo:
          '행동 분석, 봇 방어, L7 DDoS 완화 기능의 데이터센터 배포용 애플리케이션 보안',
        keySpecs:
          'Up to 320 Gbps throughput, DataSafe credential protection, proactive bot defense, API protection',
        lifecycleStatus: 'active',
        productUrl: 'https://www.f5.com/products/big-ip-services/advanced-waf',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-waf-imperva-002',
        vendorName: 'Imperva',
        productName: 'Imperva WAF Gateway',
        productNameKo: 'Imperva WAF 게이트웨이',
        modelSeries: 'X2510, X4510, X6510, X8510',
        productTier: 'enterprise',
        targetUseCase:
          'On-premise application security with virtual patching, data masking, and compliance reporting',
        targetUseCaseKo:
          '가상 패칭, 데이터 마스킹, 컴플라이언스 보고를 위한 온프레미스 애플리케이션 보안',
        keySpecs:
          'Up to 10 Gbps throughput, dynamic profiling, ThreatRadar intelligence feeds',
        lifecycleStatus: 'active',
        productUrl:
          'https://www.imperva.com/products/web-application-firewall-waf/',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 3. IDS/IPS (Intrusion Detection/Prevention System)
  // =========================================================================
  {
    componentId: 'ids-ips',
    category: 'security',
    cloud: [
      {
        id: 'VM-ids-ips-aws-001',
        provider: 'aws',
        serviceName: 'Amazon GuardDuty',
        serviceNameKo: 'Amazon GuardDuty',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'ML-powered threat detection for AWS accounts, workloads, and data with threat intelligence integration (detection only, not inline IPS)',
        differentiatorKo:
          'AWS 계정, 워크로드, 데이터를 위한 ML 기반 위협 탐지, 위협 인텔리전스 통합 (탐지 전용, 인라인 IPS 아님)',
        docUrl: 'https://docs.aws.amazon.com/guardduty/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-ids-ips-azure-001',
        provider: 'azure',
        serviceName: 'Azure Firewall Premium IDPS',
        serviceNameKo: 'Azure 방화벽 Premium IDPS',
        serviceTier: 'Premium',
        pricingModel: 'pay-per-use',
        differentiator:
          'Signature-based IDPS built into Azure Firewall Premium with 67,000+ rules and TLS inspection',
        differentiatorKo:
          'Azure Firewall Premium에 내장된 67,000개 이상의 규칙과 TLS 검사 기능의 시그니처 기반 IDPS',
        docUrl:
          'https://learn.microsoft.com/en-us/azure/firewall/premium-features',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-ids-ips-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Cloud IDS',
        serviceNameKo: 'Google Cloud IDS',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Cloud-native network threat detection powered by Palo Alto Networks threat analysis engine',
        differentiatorKo:
          'Palo Alto Networks 위협 분석 엔진 기반 클라우드 네이티브 네트워크 위협 탐지',
        docUrl: 'https://cloud.google.com/intrusion-detection-system/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-ids-ips-crowdstrike-001',
        vendorName: 'CrowdStrike',
        productName: 'CrowdStrike Falcon Insight XDR',
        productNameKo: 'CrowdStrike Falcon Insight XDR',
        pricingModel: 'subscription',
        differentiator:
          'Cloud-native XDR with real-time endpoint and network threat detection, AI-powered threat hunting',
        differentiatorKo:
          '실시간 엔드포인트 및 네트워크 위협 탐지, AI 기반 위협 헌팅의 클라우드 네이티브 XDR',
        docUrl: 'https://www.crowdstrike.com/products/endpoint-security/falcon-insight-xdr/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-ids-ips-trendmicro-001',
        vendorName: 'Trend Micro',
        productName: 'Trend Micro TippingPoint',
        productNameKo: 'Trend Micro TippingPoint',
        pricingModel: 'subscription',
        differentiator:
          'Inline network IPS with Digital Vaccine threat intelligence and zero-day vulnerability filters',
        differentiatorKo:
          'Digital Vaccine 위협 인텔리전스와 제로데이 취약점 필터를 갖춘 인라인 네트워크 IPS',
        docUrl: 'https://www.trendmicro.com/en_us/business/products/network/intrusion-prevention.html',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-ids-ips-suricata-001',
        projectName: 'Suricata',
        projectNameKo: 'Suricata',
        license: 'GPL 2.0',
        description:
          'High-performance IDS/IPS/NSM engine with multi-threading, deep packet inspection, and Lua scripting',
        descriptionKo:
          '멀티스레딩, 심층 패킷 검사, Lua 스크립팅을 갖춘 고성능 IDS/IPS/NSM 엔진',
        docUrl: 'https://docs.suricata.io/en/latest/',
        githubUrl: 'https://github.com/OISF/suricata',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-ids-ips-snort-001',
        projectName: 'Snort',
        projectNameKo: 'Snort',
        license: 'GPL 2.0',
        description:
          'Industry-standard IDS/IPS by Cisco with real-time traffic analysis, protocol analysis, and content matching',
        descriptionKo:
          'Cisco의 업계 표준 IDS/IPS, 실시간 트래픽 분석, 프로토콜 분석, 콘텐츠 매칭',
        docUrl: 'https://www.snort.org/documents',
        githubUrl: 'https://github.com/snort3/snort3',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-ids-ips-paloalto-001',
        vendorName: 'Palo Alto Networks',
        productName: 'Palo Alto Threat Prevention',
        productNameKo: 'Palo Alto 위협 방지',
        productTier: 'enterprise',
        targetUseCase:
          'Inline IPS integrated into PA-Series NGFWs with cloud-delivered security services',
        targetUseCaseKo:
          '클라우드 기반 보안 서비스와 통합된 PA 시리즈 NGFW 인라인 IPS',
        keySpecs:
          'App-ID, Content-ID, WildFire sandboxing, DNS Security, Advanced URL Filtering',
        lifecycleStatus: 'active',
        productUrl:
          'https://www.paloaltonetworks.com/network-security/advanced-threat-prevention',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-ids-ips-cisco-001',
        vendorName: 'Cisco',
        productName: 'Cisco Secure IPS (Firepower)',
        productNameKo: 'Cisco Secure IPS (Firepower)',
        modelSeries: 'Firepower 1000, 2100, 3100, 4200, 9300',
        productTier: 'enterprise',
        targetUseCase:
          'Network IPS with Snort 3 engine, Talos threat intelligence, and encrypted traffic analytics',
        targetUseCaseKo:
          'Snort 3 엔진, Talos 위협 인텔리전스, 암호화 트래픽 분석 기능의 네트워크 IPS',
        keySpecs:
          'Up to 100+ Gbps (9300), Snort 3 IPS, Encrypted Visibility Engine, Talos feeds',
        lifecycleStatus: 'active',
        productUrl:
          'https://www.cisco.com/site/us/en/products/security/firewalls/index.html',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 4. VPN GATEWAY
  // =========================================================================
  {
    componentId: 'vpn-gateway',
    category: 'security',
    cloud: [
      {
        id: 'VM-vpn-gateway-aws-001',
        provider: 'aws',
        serviceName: 'AWS Site-to-Site VPN / Client VPN',
        serviceNameKo: 'AWS 사이트 간 VPN / 클라이언트 VPN',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Managed IPsec VPN with BGP routing support, Transit Gateway integration for multi-VPC, and Client VPN for remote access',
        differentiatorKo:
          'BGP 라우팅 지원 관리형 IPsec VPN, 멀티 VPC용 Transit Gateway 통합, 원격 접속용 Client VPN',
        docUrl: 'https://docs.aws.amazon.com/vpn/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-vpn-gateway-azure-001',
        provider: 'azure',
        serviceName: 'Azure VPN Gateway',
        serviceNameKo: 'Azure VPN 게이트웨이',
        serviceTier: 'VpnGw1 ~ VpnGw5',
        pricingModel: 'pay-per-use',
        differentiator:
          'Unified S2S and P2S VPN service with up to 10 Gbps aggregate throughput, Azure Virtual WAN integration',
        differentiatorKo:
          '최대 10Gbps 집계 처리량, Azure Virtual WAN 통합의 S2S/P2S 통합 VPN 서비스',
        docUrl: 'https://learn.microsoft.com/en-us/azure/vpn-gateway/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-vpn-gateway-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Cloud HA VPN',
        serviceNameKo: 'Google Cloud 고가용성 VPN',
        serviceTier: 'HA VPN',
        pricingModel: 'pay-per-use',
        differentiator:
          'SLA-backed 99.99% availability with dual-tunnel design, BGP dynamic routing, and ECMP support',
        differentiatorKo:
          'SLA 보장 99.99% 가용성, 이중 터널 설계, BGP 동적 라우팅, ECMP 지원',
        docUrl:
          'https://cloud.google.com/network-connectivity/docs/vpn/concepts/overview',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-vpn-gateway-perimeter81-001',
        vendorName: 'Check Point (Perimeter 81)',
        productName: 'Check Point Harmony SASE VPN',
        productNameKo: 'Check Point Harmony SASE VPN',
        pricingModel: 'subscription',
        differentiator:
          'Cloud-managed business VPN with zero-trust network access, multi-site mesh, and agentless access',
        differentiatorKo:
          '제로 트러스트 네트워크 접근, 멀티사이트 메시, 에이전트리스 접근의 클라우드 관리형 비즈니스 VPN',
        docUrl: 'https://sase.checkpoint.com/solutions/business-vpn',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-vpn-gateway-nordlayer-001',
        vendorName: 'NordLayer',
        productName: 'NordLayer Business VPN',
        productNameKo: 'NordLayer 비즈니스 VPN',
        pricingModel: 'subscription',
        differentiator:
          'Easy-to-deploy cloud VPN with smart remote access, network segmentation, and centralized management',
        differentiatorKo:
          '간편한 배포의 클라우드 VPN, 스마트 원격 접속, 네트워크 세분화 및 중앙 관리',
        docUrl: 'https://nordlayer.com/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-vpn-gateway-wireguard-001',
        projectName: 'WireGuard',
        projectNameKo: 'WireGuard',
        license: 'GPL 2.0',
        description:
          'Modern, high-performance VPN protocol with minimal codebase (~4,000 lines), kernel-level performance, and ChaCha20 encryption',
        descriptionKo:
          '최소 코드베이스(약 4,000줄), 커널 수준 성능, ChaCha20 암호화의 현대적 고성능 VPN 프로토콜',
        docUrl: 'https://www.wireguard.com/',
        githubUrl: 'https://github.com/WireGuard',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-vpn-gateway-openvpn-001',
        projectName: 'OpenVPN',
        projectNameKo: 'OpenVPN',
        license: 'GPL 2.0',
        description:
          'Established SSL/TLS VPN with flexible encryption choice, TCP/UDP support, and cross-platform compatibility',
        descriptionKo:
          '유연한 암호화 선택, TCP/UDP 지원, 크로스 플랫폼 호환의 검증된 SSL/TLS VPN',
        docUrl: 'https://openvpn.net/community-resources/',
        githubUrl: 'https://github.com/OpenVPN/openvpn',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-vpn-gateway-cisco-001',
        vendorName: 'Cisco',
        productName: 'Cisco Secure Firewall VPN (AnyConnect)',
        productNameKo: 'Cisco Secure Firewall VPN (AnyConnect)',
        modelSeries: 'ASA 5500-X, Firepower 1000/2100/3100/4200',
        productTier: 'enterprise',
        targetUseCase:
          'Enterprise remote access and site-to-site VPN with Cisco AnyConnect client and multi-factor authentication',
        targetUseCaseKo:
          'Cisco AnyConnect 클라이언트 및 다중 인증을 갖춘 엔터프라이즈 원격 접속 및 사이트 간 VPN',
        keySpecs:
          'IPsec and SSL VPN, AnyConnect Secure Mobility Client, DTLS support, posture assessment',
        lifecycleStatus: 'active',
        productUrl:
          'https://www.cisco.com/site/us/en/products/security/firewalls/index.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-vpn-gateway-paloalto-001',
        vendorName: 'Palo Alto Networks',
        productName: 'Palo Alto GlobalProtect VPN',
        productNameKo: 'Palo Alto GlobalProtect VPN',
        productTier: 'enterprise',
        targetUseCase:
          'Integrated VPN within Palo Alto NGFW for consistent security policy enforcement across remote and branch users',
        targetUseCaseKo:
          '원격 및 지사 사용자 전체에 일관된 보안 정책 적용을 위한 Palo Alto NGFW 통합 VPN',
        keySpecs:
          'IPsec/SSL VPN, HIP (Host Information Profile) checks, always-on VPN, split tunneling',
        lifecycleStatus: 'active',
        productUrl:
          'https://www.paloaltonetworks.com/network-security/globalprotect',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 5. NAC (Network Access Control)
  // =========================================================================
  {
    componentId: 'nac',
    category: 'security',
    cloud: [
      {
        id: 'VM-nac-aws-001',
        provider: 'aws',
        serviceName: 'AWS Network ACLs + Security Groups',
        serviceNameKo: 'AWS 네트워크 ACL + 보안 그룹',
        serviceTier: 'Standard',
        pricingModel: 'free-tier',
        differentiator:
          'Subnet-level (NACL) and instance-level (SG) stateless/stateful access control included with VPC at no extra cost',
        differentiatorKo:
          '서브넷 수준(NACL) 및 인스턴스 수준(SG) 비상태/상태 기반 접근 제어, VPC에 추가 비용 없이 포함',
        docUrl: 'https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-nac-azure-001',
        provider: 'azure',
        serviceName: 'Azure Network Security Groups (NSG)',
        serviceNameKo: 'Azure 네트워크 보안 그룹 (NSG)',
        serviceTier: 'Standard',
        pricingModel: 'free-tier',
        differentiator:
          'Flexible traffic management with application security groups (ASG) and service tags for simplified rule management',
        differentiatorKo:
          '애플리케이션 보안 그룹(ASG) 및 서비스 태그를 통한 유연한 트래픽 관리와 간소화된 규칙 관리',
        docUrl:
          'https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-nac-gcp-001',
        provider: 'gcp',
        serviceName: 'GCP VPC Firewall Rules + BeyondCorp Enterprise',
        serviceNameKo: 'GCP VPC 방화벽 규칙 + BeyondCorp Enterprise',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'VPC firewall rules for network-level access control plus BeyondCorp for zero-trust device and user verification',
        differentiatorKo:
          '네트워크 수준 접근 제어를 위한 VPC 방화벽 규칙 및 제로 트러스트 디바이스/사용자 인증을 위한 BeyondCorp',
        docUrl: 'https://cloud.google.com/firewall/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-nac-forescout-001',
        vendorName: 'Forescout',
        productName: 'Forescout Platform',
        productNameKo: 'Forescout 플랫폼',
        pricingModel: 'subscription',
        differentiator:
          'Agentless device visibility and control across IT, IoT, and OT with automated policy enforcement and up to 40% cost savings vs. competitors',
        differentiatorKo:
          'IT, IoT, OT 전반의 에이전트리스 디바이스 가시성 및 제어, 자동 정책 적용, 경쟁사 대비 최대 40% 비용 절감',
        docUrl: 'https://www.forescout.com/platform/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-nac-portnox-001',
        vendorName: 'Portnox',
        productName: 'Portnox Cloud',
        productNameKo: 'Portnox 클라우드',
        pricingModel: 'subscription',
        differentiator:
          'Cloud-native NAC-as-a-Service with passwordless 802.1X authentication and automated remediation',
        differentiatorKo:
          '패스워드리스 802.1X 인증 및 자동 복구 기능의 클라우드 네이티브 NAC-as-a-Service',
        docUrl: 'https://www.portnox.com/portnox-cloud/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-nac-packetfence-001',
        projectName: 'PacketFence',
        projectNameKo: 'PacketFence',
        license: 'GPL 2.0',
        description:
          'Full-featured open-source NAC with captive portal, 802.1X, BYOD management, inline enforcement, and bandwidth accounting',
        descriptionKo:
          '캡티브 포털, 802.1X, BYOD 관리, 인라인 적용, 대역폭 계정 기능의 완전한 기능 오픈소스 NAC',
        docUrl: 'https://www.packetfence.org/doc/',
        githubUrl: 'https://github.com/inverse-inc/packetfence',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-nac-cisco-001',
        vendorName: 'Cisco',
        productName: 'Cisco Identity Services Engine (ISE)',
        productNameKo: 'Cisco ISE (아이덴티티 서비스 엔진)',
        productTier: 'enterprise',
        targetUseCase:
          'Enterprise NAC with Active Directory integration, 802.1X, profiling, posture assessment, and TrustSec segmentation',
        targetUseCaseKo:
          'Active Directory 통합, 802.1X, 프로파일링, 상태 평가, TrustSec 세분화를 갖춘 엔터프라이즈 NAC',
        keySpecs:
          'Up to 2M endpoints, RADIUS/TACACS+, pxGrid, 802.1X, MAB, context-based access',
        lifecycleStatus: 'active',
        productUrl:
          'https://www.cisco.com/site/us/en/products/security/identity-services-engine/index.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-nac-aruba-001',
        vendorName: 'HPE Aruba Networking',
        productName: 'Aruba ClearPass Policy Manager',
        productNameKo: 'Aruba ClearPass 정책 관리자',
        productTier: 'enterprise',
        targetUseCase:
          'Multi-vendor NAC with intuitive interface, guest access, BYOD onboarding, and up to 100K user capacity',
        targetUseCaseKo:
          '직관적 인터페이스, 게스트 액세스, BYOD 온보딩, 최대 10만 사용자 용량의 멀티벤더 NAC',
        keySpecs:
          'Up to 100,000 users, 802.1X, guest portal, device profiling, OnGuard posture agent',
        lifecycleStatus: 'active',
        productUrl:
          'https://www.arubanetworks.com/products/security/network-access-control/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-nac-fortinet-001',
        vendorName: 'Fortinet',
        productName: 'FortiNAC',
        productNameKo: 'FortiNAC',
        productTier: 'mid-range',
        targetUseCase:
          'IoT-aware NAC with agentless device profiling and tight Fortinet Security Fabric integration',
        targetUseCaseKo:
          '에이전트리스 디바이스 프로파일링 및 Fortinet Security Fabric 통합의 IoT 지원 NAC',
        keySpecs:
          'IoT device profiling, automated threat response, micro-segmentation, 150+ vendor support',
        lifecycleStatus: 'active',
        productUrl: 'https://www.fortinet.com/products/network-access-control',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 6. DLP (Data Loss Prevention)
  // =========================================================================
  {
    componentId: 'dlp',
    category: 'security',
    cloud: [
      {
        id: 'VM-dlp-aws-001',
        provider: 'aws',
        serviceName: 'Amazon Macie',
        serviceNameKo: 'Amazon Macie',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'ML-powered data discovery and classification for S3 with PII detection and compliance monitoring',
        differentiatorKo:
          'S3를 위한 ML 기반 데이터 탐지 및 분류, PII 감지 및 컴플라이언스 모니터링',
        docUrl: 'https://docs.aws.amazon.com/macie/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-dlp-azure-001',
        provider: 'azure',
        serviceName: 'Microsoft Purview Data Loss Prevention',
        serviceNameKo: 'Microsoft Purview 데이터 손실 방지',
        serviceTier: 'E5 / Standalone',
        pricingModel: 'subscription',
        differentiator:
          'Unified DLP across Microsoft 365, Endpoints, and cloud apps with 300+ built-in sensitive info types',
        differentiatorKo:
          'Microsoft 365, 엔드포인트, 클라우드 앱 전반의 통합 DLP, 300개 이상의 민감 정보 유형 내장',
        docUrl:
          'https://learn.microsoft.com/en-us/purview/dlp-learn-about-dlp',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-dlp-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Cloud Sensitive Data Protection (DLP API)',
        serviceNameKo: 'Google Cloud 민감한 데이터 보호 (DLP API)',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'API-first DLP with 150+ infoType detectors, de-identification transforms, and integration with BigQuery and Cloud Storage',
        differentiatorKo:
          '150개 이상의 infoType 감지기, 비식별화 변환, BigQuery 및 Cloud Storage 통합의 API 우선 DLP',
        docUrl: 'https://cloud.google.com/sensitive-data-protection/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-dlp-forcepoint-001',
        vendorName: 'Forcepoint',
        productName: 'Forcepoint DLP',
        productNameKo: 'Forcepoint DLP',
        pricingModel: 'subscription',
        differentiator:
          'Fast deployment with 1,700+ pre-built policy templates for 160+ compliance regions, user behavior analytics',
        differentiatorKo:
          '160개 이상 컴플라이언스 지역용 1,700개 이상의 사전 정책 템플릿, 사용자 행동 분석을 통한 빠른 배포',
        docUrl: 'https://www.forcepoint.com/product/dlp-data-loss-prevention',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-dlp-digitalguardian-001',
        vendorName: 'Fortra (Digital Guardian)',
        productName: 'Digital Guardian DLP',
        productNameKo: 'Digital Guardian DLP',
        pricingModel: 'subscription',
        differentiator:
          'Cloud-powered DLP with lightweight agent covering Windows, macOS, Linux endpoints and network channels',
        differentiatorKo:
          'Windows, macOS, Linux 엔드포인트 및 네트워크 채널을 지원하는 경량 에이전트의 클라우드 기반 DLP',
        docUrl: 'https://www.fortra.com/product-lines/digital-guardian',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-dlp-opendlp-001',
        projectName: 'OpenDLP',
        projectNameKo: 'OpenDLP',
        license: 'GPL 3.0',
        description:
          'Open-source on-premise DLP for scanning databases and file systems to detect sensitive data patterns',
        descriptionKo:
          '데이터베이스 및 파일 시스템에서 민감 데이터 패턴 탐지를 위한 오픈소스 온프레미스 DLP',
        docUrl: 'https://github.com/ezarko/OpenDLP',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-dlp-symantec-001',
        vendorName: 'Broadcom (Symantec)',
        productName: 'Symantec Data Loss Prevention',
        productNameKo: 'Symantec 데이터 손실 방지',
        productTier: 'enterprise',
        targetUseCase:
          'Best-in-class fingerprinting, OCR, and EDM matching for large-scale enterprise data protection',
        targetUseCaseKo:
          '대규모 엔터프라이즈 데이터 보호를 위한 최고 수준의 핑거프린팅, OCR, EDM 매칭',
        keySpecs:
          'Endpoint, network, storage, and cloud DLP modules, 300+ content-aware policies, OCR, EDM, IDM',
        lifecycleStatus: 'active',
        productUrl:
          'https://www.broadcom.com/products/cybersecurity/information-protection/data-loss-prevention',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-dlp-forcepoint-002',
        vendorName: 'Forcepoint',
        productName: 'Forcepoint DLP Appliance',
        productNameKo: 'Forcepoint DLP 어플라이언스',
        productTier: 'enterprise',
        targetUseCase:
          'On-premise DLP with unified policy management, endpoint agent, and network monitoring for regulated industries',
        targetUseCaseKo:
          '규제 산업을 위한 통합 정책 관리, 엔드포인트 에이전트, 네트워크 모니터링의 온프레미스 DLP',
        keySpecs:
          '1,700+ policies, drip DLP detection, incident risk ranking, user behavior analytics',
        lifecycleStatus: 'active',
        productUrl:
          'https://www.forcepoint.com/product/dlp-data-loss-prevention',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 7. SASE GATEWAY
  // =========================================================================
  {
    componentId: 'sase-gateway',
    category: 'security',
    cloud: [
      {
        id: 'VM-sase-gateway-aws-001',
        provider: 'aws',
        serviceName: 'AWS Verified Access',
        serviceNameKo: 'AWS Verified Access',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Zero-trust application access without a VPN, integrating with AWS IAM and third-party identity providers',
        differentiatorKo:
          'VPN 없는 제로 트러스트 애플리케이션 접근, AWS IAM 및 서드파티 ID 제공자 통합',
        docUrl: 'https://docs.aws.amazon.com/verified-access/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-sase-gateway-azure-001',
        provider: 'azure',
        serviceName: 'Microsoft Entra Global Secure Access',
        serviceNameKo: 'Microsoft Entra Global Secure Access',
        serviceTier: 'Standard',
        pricingModel: 'subscription',
        differentiator:
          'Identity-centric SSE/SASE with Microsoft Entra integration, unified traffic forwarding for Microsoft and private apps',
        differentiatorKo:
          'Microsoft Entra 통합 ID 중심 SSE/SASE, Microsoft 및 프라이빗 앱의 통합 트래픽 포워딩',
        docUrl:
          'https://learn.microsoft.com/en-us/entra/global-secure-access/',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-sase-gateway-zscaler-001',
        vendorName: 'Zscaler',
        productName: 'Zscaler Zero Trust Exchange',
        productNameKo: 'Zscaler 제로 트러스트 익스체인지',
        pricingModel: 'subscription',
        differentiator:
          'Largest pure-play cloud security platform with proxy architecture, 150+ data centers, industry standard for large enterprises ($8-15/user/month)',
        differentiatorKo:
          '프록시 아키텍처 기반 최대 순수 클라우드 보안 플랫폼, 150개 이상 데이터센터, 대기업 업계 표준 ($8-15/사용자/월)',
        docUrl: 'https://www.zscaler.com/products',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-sase-gateway-paloalto-001',
        vendorName: 'Palo Alto Networks',
        productName: 'Prisma SASE',
        productNameKo: 'Prisma SASE',
        pricingModel: 'subscription',
        differentiator:
          'Best for hybrid environments requiring deep security inspection and consistency with on-premise PA firewalls ($14-22/user/month)',
        differentiatorKo:
          '심층 보안 검사 및 온프레미스 PA 방화벽과의 일관성이 필요한 하이브리드 환경에 최적 ($14-22/사용자/월)',
        docUrl: 'https://www.paloaltonetworks.com/sase',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-sase-gateway-cato-001',
        vendorName: 'Cato Networks',
        productName: 'Cato SASE Cloud',
        productNameKo: 'Cato SASE 클라우드',
        pricingModel: 'subscription',
        differentiator:
          'Single-vendor SASE with converged networking and security, global private backbone, simplified management',
        differentiatorKo:
          '통합 네트워킹 및 보안의 단일 벤더 SASE, 글로벌 프라이빗 백본, 단순화된 관리',
        docUrl: 'https://www.catonetworks.com/platform/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-sase-gateway-headscale-001',
        projectName: 'Headscale',
        projectNameKo: 'Headscale',
        license: 'BSD 3-Clause',
        description:
          'Self-hosted implementation of Tailscale control server for WireGuard-based mesh VPN (partial SASE component)',
        descriptionKo:
          'WireGuard 기반 메시 VPN을 위한 Tailscale 제어 서버의 자체 호스팅 구현 (부분적 SASE 구성요소)',
        docUrl: 'https://headscale.net/',
        githubUrl: 'https://github.com/juanfont/headscale',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-sase-gateway-fortinet-001',
        vendorName: 'Fortinet',
        productName: 'FortiSASE',
        productNameKo: 'FortiSASE',
        productTier: 'enterprise',
        targetUseCase:
          'Cloud-delivered SASE with FortiGate on-premise integration for consistent security fabric across locations',
        targetUseCaseKo:
          '위치 전반의 일관된 보안 패브릭을 위한 FortiGate 온프레미스 통합 클라우드 제공 SASE',
        keySpecs:
          'ZTNA, SWG, CASB, FWaaS, SD-WAN, FortiGuard AI services, single pane of glass management',
        lifecycleStatus: 'active',
        productUrl: 'https://www.fortinet.com/products/sase',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-sase-gateway-versa-001',
        vendorName: 'Versa Networks',
        productName: 'Versa SASE',
        productNameKo: 'Versa SASE',
        productTier: 'enterprise',
        targetUseCase:
          'Single-stack SASE with integrated SD-WAN, SWG, CASB, ZTNA, and RBI on a single OS (VOS)',
        targetUseCaseKo:
          '단일 OS(VOS)에 SD-WAN, SWG, CASB, ZTNA, RBI를 통합한 단일 스택 SASE',
        keySpecs:
          'Single-pass parallel processing, VOS OS, AI/ML threat detection, multi-tenant architecture',
        lifecycleStatus: 'active',
        productUrl: 'https://versa-networks.com/sase/',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 8. ZTNA BROKER
  // =========================================================================
  {
    componentId: 'ztna-broker',
    category: 'security',
    cloud: [
      {
        id: 'VM-ztna-broker-aws-001',
        provider: 'aws',
        serviceName: 'AWS Verified Access',
        serviceNameKo: 'AWS Verified Access',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Application-level zero-trust access using identity and device posture signals, no VPN required',
        differentiatorKo:
          'ID 및 디바이스 상태 신호를 활용한 애플리케이션 수준 제로 트러스트 접근, VPN 불필요',
        docUrl: 'https://docs.aws.amazon.com/verified-access/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-ztna-broker-azure-001',
        provider: 'azure',
        serviceName: 'Microsoft Entra Private Access',
        serviceNameKo: 'Microsoft Entra Private Access',
        serviceTier: 'Standard',
        pricingModel: 'subscription',
        differentiator:
          'Identity-centric ZTNA replacing legacy VPN with Conditional Access policies and Entra ID integration',
        differentiatorKo:
          '조건부 접근 정책 및 Entra ID 통합으로 레거시 VPN을 대체하는 ID 중심 ZTNA',
        docUrl:
          'https://learn.microsoft.com/en-us/entra/global-secure-access/concept-private-access',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-ztna-broker-gcp-001',
        provider: 'gcp',
        serviceName: 'Google BeyondCorp Enterprise',
        serviceNameKo: 'Google BeyondCorp Enterprise',
        serviceTier: 'Enterprise',
        pricingModel: 'subscription',
        differentiator:
          'Google pioneered zero-trust model with context-aware access, device trust signals, and Chrome integration',
        differentiatorKo:
          'Google이 선도한 제로 트러스트 모델, 컨텍스트 인식 접근, 디바이스 신뢰 신호, Chrome 통합',
        docUrl: 'https://cloud.google.com/beyondcorp-enterprise/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-ztna-broker-zscaler-001',
        vendorName: 'Zscaler',
        productName: 'Zscaler Private Access (ZPA)',
        productNameKo: 'Zscaler Private Access (ZPA)',
        pricingModel: 'subscription',
        differentiator:
          'Inside-out connectivity model that never exposes applications to the internet, app segmentation without network segmentation',
        differentiatorKo:
          '애플리케이션을 인터넷에 노출하지 않는 인사이드-아웃 연결 모델, 네트워크 세분화 없는 앱 세분화',
        docUrl: 'https://www.zscaler.com/products/zscaler-private-access',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-ztna-broker-cloudflare-001',
        vendorName: 'Cloudflare',
        productName: 'Cloudflare Access (Zero Trust)',
        productNameKo: 'Cloudflare Access (제로 트러스트)',
        pricingModel: 'freemium',
        differentiator:
          'Free tier for up to 50 users, global edge network, easy identity provider integration, browser-based SSH/VNC',
        differentiatorKo:
          '50명까지 무료, 글로벌 엣지 네트워크, 간편한 ID 제공자 통합, 브라우저 기반 SSH/VNC',
        docUrl: 'https://developers.cloudflare.com/cloudflare-one/policies/access/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-ztna-broker-pomerium-001',
        projectName: 'Pomerium',
        projectNameKo: 'Pomerium',
        license: 'Apache 2.0',
        description:
          'Identity and context-aware access proxy for zero-trust application access with policy-based authorization',
        descriptionKo:
          '정책 기반 인가를 통한 제로 트러스트 애플리케이션 접근을 위한 ID 및 컨텍스트 인식 접근 프록시',
        docUrl: 'https://www.pomerium.com/docs/',
        githubUrl: 'https://github.com/pomerium/pomerium',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-ztna-broker-paloalto-001',
        vendorName: 'Palo Alto Networks',
        productName: 'Prisma Access ZTNA Connector',
        productNameKo: 'Prisma Access ZTNA 커넥터',
        productTier: 'enterprise',
        targetUseCase:
          'ZTNA 2.0 with continuous trust verification, least-privilege access, and continuous security inspection for all apps',
        targetUseCaseKo:
          '모든 앱에 대한 지속적 신뢰 검증, 최소 권한 접근, 지속적 보안 검사의 ZTNA 2.0',
        keySpecs:
          'ZTNA 2.0, App Connector, continuous trust verification, User-ID and device posture',
        lifecycleStatus: 'active',
        productUrl:
          'https://www.paloaltonetworks.com/sase/ztna',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-ztna-broker-appgate-001',
        vendorName: 'Appgate',
        productName: 'Appgate SDP',
        productNameKo: 'Appgate SDP',
        productTier: 'enterprise',
        targetUseCase:
          'Software-defined perimeter with single-packet authorization (SPA) for zero-trust micro-segmentation',
        targetUseCaseKo:
          '제로 트러스트 마이크로 세분화를 위한 단일 패킷 인가(SPA) 기반 소프트웨어 정의 경계',
        keySpecs:
          'SPA technology, multi-cloud support, dynamic entitlements, device posture checks',
        lifecycleStatus: 'active',
        productUrl: 'https://www.appgate.com/sdp',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 9. CASB (Cloud Access Security Broker)
  // =========================================================================
  {
    componentId: 'casb',
    category: 'security',
    cloud: [
      {
        id: 'VM-casb-aws-001',
        provider: 'aws',
        serviceName: 'AWS CloudTrail + Access Analyzer',
        serviceNameKo: 'AWS CloudTrail + Access Analyzer',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Activity logging and resource access analysis for AWS services (partial CASB functionality for AWS ecosystem)',
        differentiatorKo:
          'AWS 서비스용 활동 로깅 및 리소스 접근 분석 (AWS 에코시스템 부분적 CASB 기능)',
        docUrl: 'https://docs.aws.amazon.com/cloudtrail/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-casb-azure-001',
        provider: 'azure',
        serviceName: 'Microsoft Defender for Cloud Apps',
        serviceNameKo: 'Microsoft Defender for Cloud Apps',
        serviceTier: 'E5 / Standalone',
        pricingModel: 'subscription',
        differentiator:
          'Native CASB with shadow IT discovery (31,000+ SaaS catalog), session controls, and deep Microsoft 365 integration',
        differentiatorKo:
          '31,000개 이상 SaaS 카탈로그 기반 섀도 IT 탐지, 세션 제어, Microsoft 365 심층 통합의 네이티브 CASB',
        docUrl:
          'https://learn.microsoft.com/en-us/defender-cloud-apps/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-casb-gcp-001',
        provider: 'gcp',
        serviceName: 'Google BeyondCorp Enterprise (CASB)',
        serviceNameKo: 'Google BeyondCorp Enterprise (CASB)',
        serviceTier: 'Enterprise',
        pricingModel: 'subscription',
        differentiator:
          'Context-aware CASB functionality with Chrome browser integration for SaaS DLP and threat protection',
        differentiatorKo:
          'SaaS DLP 및 위협 방지를 위한 Chrome 브라우저 통합 컨텍스트 인식 CASB 기능',
        docUrl: 'https://cloud.google.com/beyondcorp-enterprise/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-casb-netskope-001',
        vendorName: 'Netskope',
        productName: 'Netskope CASB',
        productNameKo: 'Netskope CASB',
        pricingModel: 'subscription',
        differentiator:
          'Market-leading CASB with deep data context analysis, unified console for CASB/SWG/ZTNA, and cloud-native DLP ($12-18/user/month)',
        differentiatorKo:
          '심층 데이터 컨텍스트 분석, CASB/SWG/ZTNA 통합 콘솔, 클라우드 네이티브 DLP의 시장 선도 CASB ($12-18/사용자/월)',
        docUrl: 'https://www.netskope.com/products/casb',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-casb-skyhigh-001',
        vendorName: 'Skyhigh Security',
        productName: 'Skyhigh CASB',
        productNameKo: 'Skyhigh CASB',
        pricingModel: 'subscription',
        differentiator:
          'Comprehensive SaaS/IaaS/PaaS protection with advanced DLP, UEBA, and shadow IT discovery (formerly McAfee MVISION Cloud)',
        differentiatorKo:
          '고급 DLP, UEBA, 섀도 IT 탐지를 갖춘 SaaS/IaaS/PaaS 종합 보호 (구 McAfee MVISION Cloud)',
        docUrl: 'https://www.skyhighsecurity.com/products/cloud-access-security-broker.html',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [],
    onPremise: [
      {
        id: 'VM-casb-symantec-001',
        vendorName: 'Broadcom (Symantec)',
        productName: 'Symantec CloudSOC CASB',
        productNameKo: 'Symantec CloudSOC CASB',
        productTier: 'enterprise',
        targetUseCase:
          'On-premise CASB gateway with shadow IT discovery, threat protection, and data compliance for regulated industries',
        targetUseCaseKo:
          '규제 산업을 위한 섀도 IT 탐지, 위협 보호, 데이터 컴플라이언스를 갖춘 온프레미스 CASB 게이트웨이',
        keySpecs:
          'Securlets for sanctioned apps, Gatelets for inline enforcement, DLP integration, UEBA',
        lifecycleStatus: 'active',
        productUrl:
          'https://www.broadcom.com/products/cybersecurity/information-protection/cloud-access-security-broker',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 10. SIEM (Security Information & Event Management)
  // =========================================================================
  {
    componentId: 'siem',
    category: 'security',
    cloud: [
      {
        id: 'VM-siem-aws-001',
        provider: 'aws',
        serviceName: 'AWS Security Hub + Amazon Security Lake',
        serviceNameKo: 'AWS Security Hub + Amazon Security Lake',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Centralized security findings aggregation with OCSF-normalized data lake for cross-account multi-region security posture',
        differentiatorKo:
          'OCSF 정규화 데이터 레이크를 통한 교차 계정 다중 리전 보안 태세의 중앙 집중식 보안 결과 집계',
        docUrl: 'https://docs.aws.amazon.com/securityhub/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-siem-azure-001',
        provider: 'azure',
        serviceName: 'Microsoft Sentinel',
        serviceNameKo: 'Microsoft Sentinel',
        serviceTier: 'Pay-as-you-go / Commitment',
        pricingModel: 'pay-per-use',
        differentiator:
          'Cloud-native SIEM with built-in SOAR, Microsoft threat intelligence, KQL query language, and 300+ data connectors',
        differentiatorKo:
          '내장 SOAR, Microsoft 위협 인텔리전스, KQL 쿼리 언어, 300개 이상 데이터 커넥터의 클라우드 네이티브 SIEM',
        docUrl: 'https://learn.microsoft.com/en-us/azure/sentinel/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-siem-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Security Operations (Chronicle)',
        serviceNameKo: 'Google Security Operations (Chronicle)',
        serviceTier: 'Standard / Enterprise',
        pricingModel: 'subscription',
        differentiator:
          'Petabyte-scale SIEM with 12-month hot data retention, sub-second search, and Google threat intelligence integration',
        differentiatorKo:
          '페타바이트 규모 SIEM, 12개월 핫 데이터 보존, 서브초 검색, Google 위협 인텔리전스 통합',
        docUrl: 'https://cloud.google.com/chronicle/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-siem-splunk-001',
        vendorName: 'Splunk (Cisco)',
        productName: 'Splunk Enterprise Security',
        productNameKo: 'Splunk Enterprise Security',
        pricingModel: 'subscription',
        differentiator:
          'Market-leading SIEM with SPL query language, 2,800+ apps marketplace, and advanced analytics dashboards',
        differentiatorKo:
          'SPL 쿼리 언어, 2,800개 이상 앱 마켓플레이스, 고급 분석 대시보드의 시장 선도 SIEM',
        docUrl: 'https://docs.splunk.com/Documentation/ES',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-siem-elastic-001',
        vendorName: 'Elastic',
        productName: 'Elastic Security (SIEM)',
        productNameKo: 'Elastic Security (SIEM)',
        pricingModel: 'freemium',
        differentiator:
          'Open-core SIEM built on Elasticsearch with free tier, detection rules aligned to MITRE ATT&CK, and ML anomaly detection',
        differentiatorKo:
          'Elasticsearch 기반 오픈코어 SIEM, 무료 티어, MITRE ATT&CK 연계 탐지 규칙, ML 이상 탐지',
        docUrl: 'https://www.elastic.co/security/siem',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-siem-ibm-001',
        vendorName: 'IBM',
        productName: 'IBM QRadar SIEM',
        productNameKo: 'IBM QRadar SIEM',
        pricingModel: 'subscription',
        differentiator:
          'Enterprise SIEM with network flow analysis, offense management, and integrated threat intelligence',
        differentiatorKo:
          '네트워크 플로우 분석, 오펜스 관리, 통합 위협 인텔리전스를 갖춘 엔터프라이즈 SIEM',
        docUrl: 'https://www.ibm.com/products/qradar-siem',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-siem-wazuh-001',
        projectName: 'Wazuh',
        projectNameKo: 'Wazuh',
        license: 'GPL 2.0',
        description:
          'Unified SIEM and XDR platform with log analysis, threat intelligence, compliance management, and intrusion detection',
        descriptionKo:
          '로그 분석, 위협 인텔리전스, 컴플라이언스 관리, 침입 탐지를 갖춘 통합 SIEM 및 XDR 플랫폼',
        docUrl: 'https://documentation.wazuh.com/',
        githubUrl: 'https://github.com/wazuh/wazuh',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-siem-securityonion-001',
        projectName: 'Security Onion',
        projectNameKo: 'Security Onion',
        license: 'GPL 2.0',
        description:
          'Linux distribution for IDS, NSM, and SIEM integrating Suricata, Wazuh, Zeek, and Elasticsearch',
        descriptionKo:
          'Suricata, Wazuh, Zeek, Elasticsearch를 통합한 IDS, NSM, SIEM용 Linux 배포판',
        docUrl: 'https://docs.securityonion.net/',
        githubUrl: 'https://github.com/Security-Onion-Solutions/securityonion',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-siem-splunk-002',
        vendorName: 'Splunk (Cisco)',
        productName: 'Splunk Enterprise (On-Prem)',
        productNameKo: 'Splunk Enterprise (온프레미스)',
        productTier: 'enterprise',
        targetUseCase:
          'On-premise SIEM deployment for organizations requiring data sovereignty or air-gapped environments',
        targetUseCaseKo:
          '데이터 주권 또는 에어갭 환경이 필요한 조직을 위한 온프레미스 SIEM 배포',
        keySpecs:
          'SPL query language, clustered deployment, heavy/universal forwarders, 2,800+ apps',
        lifecycleStatus: 'active',
        productUrl: 'https://www.splunk.com/en_us/products/splunk-enterprise.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-siem-ibm-002',
        vendorName: 'IBM',
        productName: 'IBM QRadar SIEM Appliance',
        productNameKo: 'IBM QRadar SIEM 어플라이언스',
        modelSeries: 'QRadar 3100, 3100B',
        productTier: 'enterprise',
        targetUseCase:
          'Hardware appliance SIEM for regulated environments with network flow analysis and advanced correlation',
        targetUseCaseKo:
          '네트워크 플로우 분석과 고급 상관분석을 갖춘 규제 환경용 하드웨어 어플라이언스 SIEM',
        keySpecs:
          'Up to 50,000 EPS, network flow processing, offense management, X-Force threat intelligence',
        lifecycleStatus: 'active',
        productUrl: 'https://www.ibm.com/products/qradar-siem',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 11. SOAR (Security Orchestration, Automation & Response)
  // =========================================================================
  {
    componentId: 'soar',
    category: 'security',
    cloud: [
      {
        id: 'VM-soar-aws-001',
        provider: 'aws',
        serviceName: 'AWS Security Hub (Automated Response)',
        serviceNameKo: 'AWS Security Hub (자동 대응)',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Automated remediation via EventBridge rules and Lambda functions triggered by Security Hub findings',
        differentiatorKo:
          'Security Hub 결과로 트리거되는 EventBridge 규칙 및 Lambda 함수를 통한 자동 복구',
        docUrl:
          'https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cloudwatch-events.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-soar-azure-001',
        provider: 'azure',
        serviceName: 'Microsoft Sentinel SOAR (Logic Apps)',
        serviceNameKo: 'Microsoft Sentinel SOAR (Logic Apps)',
        serviceTier: 'Standard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Built-in SOAR playbooks powered by Azure Logic Apps with 400+ connectors and automated incident response workflows',
        differentiatorKo:
          '400개 이상 커넥터 및 자동 인시던트 대응 워크플로를 갖춘 Azure Logic Apps 기반 내장 SOAR 플레이북',
        docUrl:
          'https://learn.microsoft.com/en-us/azure/sentinel/automate-responses-with-playbooks',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-soar-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Security Operations SOAR',
        serviceNameKo: 'Google Security Operations SOAR',
        serviceTier: 'Enterprise',
        pricingModel: 'subscription',
        differentiator:
          'Integrated SOAR within Chronicle with playbook builder, case management, and 200+ third-party integrations',
        differentiatorKo:
          '플레이북 빌더, 케이스 관리, 200개 이상 서드파티 통합을 갖춘 Chronicle 통합 SOAR',
        docUrl: 'https://cloud.google.com/chronicle/docs/soar',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-soar-paloalto-001',
        vendorName: 'Palo Alto Networks',
        productName: 'Cortex XSOAR',
        productNameKo: 'Cortex XSOAR',
        pricingModel: 'subscription',
        differentiator:
          'Market-leading SOAR with 700+ integrations, visual playbook editor, War Room collaboration, and marketplace content packs',
        differentiatorKo:
          '700개 이상 통합, 비주얼 플레이북 편집기, War Room 협업, 마켓플레이스 콘텐츠 팩의 시장 선도 SOAR',
        docUrl: 'https://docs-cortex.paloaltonetworks.com/r/Cortex-XSOAR',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-soar-splunk-001',
        vendorName: 'Splunk (Cisco)',
        productName: 'Splunk SOAR',
        productNameKo: 'Splunk SOAR',
        pricingModel: 'subscription',
        differentiator:
          'Tight integration with Splunk data lake, 300+ integrations, 2,800+ automated actions, visual playbook editor',
        differentiatorKo:
          'Splunk 데이터 레이크와의 긴밀한 통합, 300개 이상 통합, 2,800개 이상 자동화 작업, 비주얼 플레이북 편집기',
        docUrl: 'https://docs.splunk.com/Documentation/SOAR',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-soar-swimlane-001',
        vendorName: 'Swimlane',
        productName: 'Swimlane Turbine',
        productNameKo: 'Swimlane Turbine',
        pricingModel: 'subscription',
        differentiator:
          'Low-code automation platform with AI case enrichment, unlimited API integration, and highest vendor support ranking',
        differentiatorKo:
          'AI 케이스 보강, 무제한 API 통합, 최고 벤더 지원 평가의 로우코드 자동화 플랫폼',
        docUrl: 'https://swimlane.com/products/turbine/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-soar-shuffle-001',
        projectName: 'Shuffle',
        projectNameKo: 'Shuffle',
        license: 'AGPL 3.0',
        description:
          'Open-source SOAR with 200+ plug-and-play app integrations, workflow automation, and Wazuh/TheHive connectivity',
        descriptionKo:
          '200개 이상 플러그앤플레이 앱 통합, 워크플로 자동화, Wazuh/TheHive 연동의 오픈소스 SOAR',
        docUrl: 'https://shuffler.io/docs',
        githubUrl: 'https://github.com/Shuffle/Shuffle',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-soar-thehive-001',
        projectName: 'TheHive + Cortex',
        projectNameKo: 'TheHive + Cortex',
        license: 'AGPL 3.0',
        description:
          'Case management (TheHive) with automated observable analysis (Cortex) for incident response workflows',
        descriptionKo:
          '인시던트 대응 워크플로를 위한 케이스 관리(TheHive)와 자동 관찰 항목 분석(Cortex)',
        docUrl: 'https://docs.strangebee.com/',
        githubUrl: 'https://github.com/TheHive-Project/TheHive',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-soar-paloalto-002',
        vendorName: 'Palo Alto Networks',
        productName: 'Cortex XSOAR (On-Prem)',
        productNameKo: 'Cortex XSOAR (온프레미스)',
        productTier: 'enterprise',
        targetUseCase:
          'On-premise SOAR for air-gapped or regulated environments with full playbook and marketplace capabilities',
        targetUseCaseKo:
          '전체 플레이북 및 마켓플레이스 기능을 갖춘 에어갭 또는 규제 환경용 온프레미스 SOAR',
        keySpecs:
          'Docker-based deployment, 700+ integrations, War Room, ML-powered incident classification',
        lifecycleStatus: 'active',
        productUrl: 'https://www.paloaltonetworks.com/cortex/cortex-xsoar',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-soar-ibm-001',
        vendorName: 'IBM',
        productName: 'IBM QRadar SOAR (Resilient)',
        productNameKo: 'IBM QRadar SOAR (Resilient)',
        productTier: 'enterprise',
        targetUseCase:
          'On-premise incident response platform with dynamic playbooks, breach response simulation, and privacy regulation workflows',
        targetUseCaseKo:
          '동적 플레이북, 침해 대응 시뮬레이션, 개인정보 보호 규정 워크플로를 갖춘 온프레미스 인시던트 대응 플랫폼',
        keySpecs:
          'Dynamic playbooks, 300+ integrations, privacy module, MITRE ATT&CK mapping',
        lifecycleStatus: 'active',
        productUrl: 'https://www.ibm.com/products/qradar-soar',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 12. CCTV CAMERA (Physical Security — no cloud equivalents)
  // =========================================================================
  {
    componentId: 'cctv-camera',
    category: 'security',
    cloud: [],
    managed: [
      {
        id: 'VM-cctv-camera-verkada-001',
        vendorName: 'Verkada',
        productName: 'Verkada Cloud-Managed Cameras',
        productNameKo: 'Verkada 클라우드 관리 카메라',
        pricingModel: 'subscription',
        differentiator:
          'Cloud-first cameras with on-device AI analytics, 365-day cloud retention, and centralized management dashboard',
        differentiatorKo:
          '디바이스 내 AI 분석, 365일 클라우드 보관, 중앙 관리 대시보드의 클라우드 퍼스트 카메라',
        docUrl: 'https://www.verkada.com/security-cameras/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-cctv-camera-eagle-001',
        vendorName: 'Eagle Eye Networks',
        productName: 'Eagle Eye Cloud VMS',
        productNameKo: 'Eagle Eye 클라우드 VMS',
        pricingModel: 'subscription',
        differentiator:
          'Open-platform cloud VMS supporting 3,000+ camera models with AI-based smart video search and analytics',
        differentiatorKo:
          '3,000개 이상 카메라 모델 지원 오픈 플랫폼 클라우드 VMS, AI 기반 스마트 영상 검색 및 분석',
        docUrl: 'https://www.een.com/partners/technology-partners/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-cctv-camera-zoneminder-001',
        projectName: 'ZoneMinder',
        projectNameKo: 'ZoneMinder',
        license: 'GPL 2.0',
        description:
          'Open-source video surveillance system with motion detection, recording, and web-based monitoring interface',
        descriptionKo:
          '모션 감지, 녹화, 웹 기반 모니터링 인터페이스를 갖춘 오픈소스 영상 감시 시스템',
        docUrl: 'https://zoneminder.readthedocs.io/',
        githubUrl: 'https://github.com/ZoneMinder/zoneminder',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-cctv-camera-axis-001',
        vendorName: 'Axis Communications',
        productName: 'Axis Network Cameras',
        productNameKo: 'Axis 네트워크 카메라',
        modelSeries: 'P-Series, Q-Series, M-Series, F-Series',
        productTier: 'enterprise',
        targetUseCase:
          'Pioneer of IP surveillance with industrial-grade builds, robust cybersecurity practices, and wide VMS compatibility',
        targetUseCaseKo:
          '산업용 제조, 강력한 사이버보안, 광범위한 VMS 호환성을 갖춘 IP 감시 선구자',
        keySpecs:
          'Up to 4K resolution, Lightfinder 2.0, DLPU analytics, Zipstream compression, AXIS OS',
        lifecycleStatus: 'active',
        productUrl: 'https://www.axis.com/products/network-cameras',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-cctv-camera-hikvision-001',
        vendorName: 'Hikvision',
        productName: 'Hikvision Network Cameras',
        productNameKo: 'Hikvision 네트워크 카메라',
        modelSeries: 'Pro Series, Value Series, Ultra Series, PanoVu',
        productTier: 'mid-range',
        targetUseCase:
          'Global market leader (23% share) with AI-powered analytics for large-scale installations (note: NDAA non-compliant)',
        targetUseCaseKo:
          '대규모 설치를 위한 AI 분석 기반 글로벌 시장 1위(점유율 23%) (참고: NDAA 미준수)',
        keySpecs:
          'Up to 32MP, AcuSense AI, DarkFighter, ColorVu, deep learning algorithms',
        lifecycleStatus: 'active',
        productUrl: 'https://www.hikvision.com/en/products/IP-Products/Network-Cameras/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-cctv-camera-hanwha-001',
        vendorName: 'Hanwha Vision (Samsung)',
        productName: 'Hanwha Wisenet Cameras',
        productNameKo: '한화비전 Wisenet 카메라',
        modelSeries: 'Wisenet X, Wisenet P, Wisenet Q, Wisenet T',
        productTier: 'enterprise',
        targetUseCase:
          'NDAA-compliant enterprise cameras with AI analytics, cyber-hardened firmware, and open platform support',
        targetUseCaseKo:
          'AI 분석, 사이버 보안 강화 펌웨어, 오픈 플랫폼 지원의 NDAA 준수 엔터프라이즈 카메라',
        keySpecs:
          'Up to 8K resolution, AI-based analytics, WiseNet 7 SoC, NDAA compliant, ONVIF Profile S/T/G',
        lifecycleStatus: 'active',
        productUrl: 'https://www.hanwhavision.com/products/',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 13. NVR (Network Video Recorder)
  // =========================================================================
  {
    componentId: 'nvr',
    category: 'security',
    cloud: [],
    managed: [
      {
        id: 'VM-nvr-verkada-001',
        vendorName: 'Verkada',
        productName: 'Verkada Command (Cloud NVR)',
        productNameKo: 'Verkada Command (클라우드 NVR)',
        pricingModel: 'subscription',
        differentiator:
          'Eliminates traditional NVR with cloud-managed on-camera storage and AI-powered search',
        differentiatorKo:
          '카메라 내 저장 및 AI 검색으로 기존 NVR을 대체하는 클라우드 관리형',
        docUrl: 'https://www.verkada.com/command/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-nvr-frigate-001',
        projectName: 'Frigate NVR',
        projectNameKo: 'Frigate NVR',
        license: 'MIT',
        description:
          'Open-source NVR with real-time AI object detection via Google Coral TPU, optimized for home assistant integration',
        descriptionKo:
          'Google Coral TPU 기반 실시간 AI 객체 감지, Home Assistant 통합에 최적화된 오픈소스 NVR',
        docUrl: 'https://docs.frigate.video/',
        githubUrl: 'https://github.com/blakeblackshear/frigate',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-nvr-hikvision-001',
        vendorName: 'Hikvision',
        productName: 'Hikvision NVR Series',
        productNameKo: 'Hikvision NVR 시리즈',
        modelSeries: 'DS-7600NI, DS-7700NI, DS-9600NI, DS-96000NI',
        productTier: 'mid-range',
        targetUseCase:
          'Cost-effective NVR with AI-powered smart search, up to 256 channels, and DeepinMind analytics',
        targetUseCaseKo:
          'AI 스마트 검색, 최대 256채널, DeepinMind 분석을 갖춘 가성비 NVR',
        keySpecs:
          'Up to 256ch, 12MP recording, H.265+, AcuSense, RAID support, NDAA non-compliant',
        lifecycleStatus: 'active',
        productUrl: 'https://www.hikvision.com/en/products/IP-Products/Network-Video-Recorders/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-nvr-axis-001',
        vendorName: 'Axis Communications',
        productName: 'AXIS Camera Station Pro',
        productNameKo: 'AXIS Camera Station Pro',
        productTier: 'enterprise',
        targetUseCase:
          'Enterprise VMS/NVR with server-based recording, multi-site management, and Axis device integration',
        targetUseCaseKo:
          '서버 기반 녹화, 다중 사이트 관리, Axis 장비 통합의 엔터프라이즈 VMS/NVR',
        keySpecs:
          'Up to 250+ cameras, Axis body-worn integration, Smart search, AXIS OS compatibility',
        lifecycleStatus: 'active',
        productUrl: 'https://www.axis.com/products/axis-camera-station-pro',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-nvr-dahua-001',
        vendorName: 'Dahua Technology',
        productName: 'Dahua NVR Series',
        productNameKo: 'Dahua NVR 시리즈',
        modelSeries: 'DHI-NVR4000, DHI-NVR5000, DHI-NVR6000, DHI-IVSS7000',
        productTier: 'mid-range',
        targetUseCase:
          'AI-powered NVR with Full Colour technology, cost-effective for mid-sized deployments',
        targetUseCaseKo:
          'Full Colour 기술 기반 AI NVR, 중규모 배포를 위한 가성비 제품',
        keySpecs:
          'Up to 256ch, WizSense AI, Full Colour, H.265+, SMD Plus, NDAA non-compliant',
        lifecycleStatus: 'active',
        productUrl: 'https://www.dahuasecurity.com/products/productSearch/Network-Video-Recorders',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 14. VIDEO SERVER (VMS — Video Management Server)
  // =========================================================================
  {
    componentId: 'video-server',
    category: 'security',
    cloud: [],
    managed: [
      {
        id: 'VM-video-server-verkada-001',
        vendorName: 'Verkada',
        productName: 'Verkada Command Platform',
        productNameKo: 'Verkada Command 플랫폼',
        pricingModel: 'subscription',
        differentiator:
          'Cloud-native video management with AI analytics, hybrid cloud architecture, and zero NVR requirement',
        differentiatorKo:
          'AI 분석, 하이브리드 클라우드 아키텍처, NVR 불필요의 클라우드 네이티브 영상 관리',
        docUrl: 'https://www.verkada.com/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-video-server-morphean-001',
        vendorName: 'Genetec',
        productName: 'Genetec Security Center SaaS',
        productNameKo: 'Genetec Security Center SaaS',
        pricingModel: 'subscription',
        differentiator:
          'Cloud-enabled architecture for hybrid or fully cloud-managed video alongside access control and LPR',
        differentiatorKo:
          '비디오, 출입 통제, 차량번호 인식의 하이브리드 또는 완전 클라우드 관리를 위한 클라우드 지원 아키텍처',
        docUrl: 'https://www.genetec.com/solutions/all-products/security-center-saas',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-video-server-shinobi-001',
        projectName: 'Shinobi',
        projectNameKo: 'Shinobi',
        license: 'GPL 3.0',
        description:
          'Open-source CCTV solution with multi-monitor support, object detection plugins, and Node.js-based architecture',
        descriptionKo:
          '멀티 모니터 지원, 객체 감지 플러그인, Node.js 기반 아키텍처의 오픈소스 CCTV 솔루션',
        docUrl: 'https://docs.shinobi.video/',
        githubUrl: 'https://gitlab.com/Shinobi-Systems/Shinobi',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-video-server-milestone-001',
        vendorName: 'Milestone Systems',
        productName: 'Milestone XProtect',
        productNameKo: 'Milestone XProtect',
        modelSeries:
          'XProtect Essential+, Express+, Professional+, Expert, Corporate',
        productTier: 'enterprise',
        targetUseCase:
          'Open-platform VMS supporting 150+ camera manufacturers and 10,000+ devices with enterprise-scale recording',
        targetUseCaseKo:
          '150개 이상 카메라 제조사 및 10,000개 이상 장치 지원, 엔터프라이즈 규모 녹화의 오픈 플랫폼 VMS',
        keySpecs:
          'Unlimited cameras (Corporate), open platform, 150+ vendor support, Smart Map, LPR, video analytics marketplace',
        lifecycleStatus: 'active',
        productUrl: 'https://www.milestonesys.com/solutions/platform/video-management-software/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-video-server-genetec-001',
        vendorName: 'Genetec',
        productName: 'Genetec Security Center',
        productNameKo: 'Genetec Security Center',
        productTier: 'enterprise',
        targetUseCase:
          'Unified security platform integrating video, access control, and LPR for airports, municipalities, and data centers',
        targetUseCaseKo:
          '공항, 지자체, 데이터센터를 위한 비디오, 출입 통제, 차량번호 인식 통합 보안 플랫폼',
        keySpecs:
          'Omnicast VMS, Synergis access control, AutoVu LPR, unified dashboard, federation for multi-site',
        lifecycleStatus: 'active',
        productUrl: 'https://www.genetec.com/solutions/all-products/security-center',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-video-server-avigilon-001',
        vendorName: 'Avigilon (Motorola Solutions)',
        productName: 'Avigilon Control Center',
        productNameKo: 'Avigilon Control Center',
        productTier: 'enterprise',
        targetUseCase:
          'AI-enhanced VMS with Appearance Search, unusual motion detection, and high-resolution video analytics',
        targetUseCaseKo:
          'Appearance Search, 비정상 모션 감지, 고해상도 영상 분석의 AI 강화 VMS',
        keySpecs:
          'Appearance Search, Unusual Motion Detection, Facial Recognition, up to 64MP support',
        lifecycleStatus: 'active',
        productUrl: 'https://www.avigilon.com/products/acc',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 15. ACCESS CONTROL (Physical Access Control System)
  // =========================================================================
  {
    componentId: 'access-control',
    category: 'security',
    cloud: [],
    managed: [
      {
        id: 'VM-access-control-brivo-001',
        vendorName: 'Brivo',
        productName: 'Brivo Access',
        productNameKo: 'Brivo Access',
        pricingModel: 'subscription',
        differentiator:
          'Cloud-native access control with mobile credentials, API-first architecture, and multi-site management',
        differentiatorKo:
          '모바일 자격 증명, API 우선 아키텍처, 다중 사이트 관리의 클라우드 네이티브 출입 통제',
        docUrl: 'https://www.brivo.com/products/access-control/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-access-control-kisi-001',
        vendorName: 'Kisi',
        productName: 'Kisi Cloud Access Control',
        productNameKo: 'Kisi 클라우드 출입 통제',
        pricingModel: 'subscription',
        differentiator:
          'Modern cloud access control with smartphone unlock, API integration, and real-time occupancy monitoring',
        differentiatorKo:
          '스마트폰 잠금 해제, API 통합, 실시간 재실 인원 모니터링의 현대적 클라우드 출입 통제',
        docUrl: 'https://www.getkisi.com/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-access-control-esp-rfid-001',
        projectName: 'ESP-RFID',
        projectNameKo: 'ESP-RFID',
        license: 'MIT',
        description:
          'ESP8266-based open-source RFID access control with web interface, suitable for DIY and small-scale deployments',
        descriptionKo:
          'ESP8266 기반 오픈소스 RFID 출입 통제, 웹 인터페이스, DIY 및 소규모 배포에 적합',
        docUrl: 'https://github.com/esprfid/esp-rfid',
        githubUrl: 'https://github.com/esprfid/esp-rfid',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-access-control-hid-001',
        vendorName: 'HID Global',
        productName: 'HID Access Control Solutions',
        productNameKo: 'HID 출입 통제 솔루션',
        modelSeries: 'iCLASS SE, Signo, OMNIKEY, Crescendo',
        productTier: 'enterprise',
        targetUseCase:
          'Enterprise access control with smart card readers, biometric authentication, and mobile credentials for high-security facilities',
        targetUseCaseKo:
          '고보안 시설을 위한 스마트카드 리더, 생체 인증, 모바일 자격 증명의 엔터프라이즈 출입 통제',
        keySpecs:
          'SEOS credential technology, iCLASS SE platform, mobile access, FIDO2 support, OSDP v2',
        lifecycleStatus: 'active',
        productUrl: 'https://www.hidglobal.com/solutions/physical-access-control',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-access-control-honeywell-001',
        vendorName: 'Honeywell (LenelS2)',
        productName: 'LenelS2 OnGuard / NetBox',
        productNameKo: 'LenelS2 OnGuard / NetBox',
        modelSeries: 'OnGuard, OnGuard Cloud, NetBox, Elements',
        productTier: 'enterprise',
        targetUseCase:
          'Large-scale access control for airports, government, and enterprise with 200+ certified integrations via OAAP',
        targetUseCaseKo:
          '공항, 정부, 기업을 위한 대규모 출입 통제, OAAP를 통한 200개 이상의 인증 통합',
        keySpecs:
          'OnGuard unified platform, OpenAccess Alliance 200+ integrations, mobile credentials, visitor management',
        lifecycleStatus: 'active',
        productUrl: 'https://buildings.honeywell.com/us/en/brands/our-brands/lenels2',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-access-control-genetec-001',
        vendorName: 'Genetec',
        productName: 'Genetec Synergis',
        productNameKo: 'Genetec Synergis',
        productTier: 'enterprise',
        targetUseCase:
          'IP-based access control unified with video surveillance in Genetec Security Center for seamless physical security',
        targetUseCaseKo:
          'Genetec Security Center에서 비디오 감시와 통합된 IP 기반 출입 통제, 원활한 물리적 보안',
        keySpecs:
          'Unified Security Center integration, mobile credentials, Synergis Cloud Link controller, Mercury hardware support',
        lifecycleStatus: 'active',
        productUrl: 'https://www.genetec.com/solutions/all-products/synergis',
        lastVerified: '2026-02-14',
      },
    ],
  },
];
