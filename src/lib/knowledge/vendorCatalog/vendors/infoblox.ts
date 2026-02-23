/**
 * Infoblox -- Full Product Catalog
 *
 * Hierarchical product tree covering DDI (DNS, DHCP, IPAM),
 * DNS Security, Network Intelligence, and Reporting & Analytics.
 *
 * Data sourced from https://www.infoblox.com/products/
 * Last crawled: 2026-02-22
 */

import type { VendorCatalog } from '../types';

// ---------------------------------------------------------------------------
// Infoblox Product Catalog
// ---------------------------------------------------------------------------

export const infobloxCatalog: VendorCatalog = {
  vendorId: 'infoblox',
  vendorName: 'Infoblox',
  vendorNameKo: '인포블록스',
  headquarters: 'Santa Clara, CA, USA',
  website: 'https://www.infoblox.com',
  productPageUrl: 'https://www.infoblox.com/products/',
  depthStructure: ['category', 'product-line', 'model'],
  depthStructureKo: ['카테고리', '제품 라인', '모델'],
  lastCrawled: '2026-02-22',
  crawlSource: 'https://www.infoblox.com/products/',
  stats: { totalProducts: 33, maxDepth: 2, categoriesCount: 4 },
  products: [
    // =====================================================================
    // 1. DDI (DNS, DHCP, IPAM)
    // =====================================================================
    {
      nodeId: 'infoblox-ddi',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'DDI (DNS, DHCP, IPAM)',
      nameKo: 'DDI (DNS, DHCP, IPAM)',
      description:
        'Core network services platform providing authoritative DNS, DHCP, and IP address management for enterprise and service provider networks',
      descriptionKo:
        '엔터프라이즈 및 서비스 제공업체 네트워크를 위한 권한 DNS, DHCP, IP 주소 관리를 제공하는 핵심 네트워크 서비스 플랫폼',
      sourceUrl: 'https://www.infoblox.com/products/',
      infraNodeTypes: ['dns'],
      children: [
        // ── BloxOne DDI ──
        {
          nodeId: 'infoblox-bloxone-ddi',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'BloxOne DDI',
          nameKo: 'BloxOne DDI',
          description:
            'Cloud-native DDI platform delivering centralized management of DNS, DHCP, and IPAM across hybrid and multi-cloud environments with zero-touch provisioning',
          descriptionKo:
            '제로터치 프로비저닝을 통해 하이브리드 및 멀티클라우드 환경에서 DNS, DHCP, IPAM을 중앙 관리하는 클라우드 네이티브 DDI 플랫폼',
          sourceUrl: 'https://www.infoblox.com/products/bloxone-ddi/',
          infraNodeTypes: ['dns'],
          architectureRole: 'Cloud-Managed DDI Control Plane',
          architectureRoleKo: '클라우드 관리형 DDI 제어 플레인',
          recommendedFor: [
            'Hybrid and multi-cloud DDI consolidation',
            'Branch office DNS/DHCP with zero-touch provisioning',
            'Cloud-first organizations migrating from on-premises DDI',
            'Centralized DNS management across distributed locations',
            'Automated network service orchestration at scale',
          ],
          recommendedForKo: [
            '하이브리드 및 멀티클라우드 DDI 통합',
            '제로터치 프로비저닝을 통한 지사 DNS/DHCP 운영',
            '온프레미스 DDI에서 마이그레이션하는 클라우드 우선 조직',
            '분산 환경 전체의 중앙 집중식 DNS 관리',
            '대규모 자동화된 네트워크 서비스 오케스트레이션',
          ],
          supportedProtocols: [
            'DNS', 'DNSSEC', 'DoH', 'DoT', 'DHCP', 'DHCPv6',
            'IPAM', 'REST API', 'SNMP', 'Syslog',
          ],
          haFeatures: [
            'Cloud-native multi-region redundancy',
            'Local DNS survivability at edge locations',
            'Automatic failover for distributed deployments',
            'Always-on availability with SaaS architecture',
          ],
          securityCapabilities: [
            'Integrated Infoblox Threat Defense',
            'DNSSEC signing and validation',
            'DNS-layer threat protection',
            'Policy-based access control across locations',
          ],
          children: [
            {
              nodeId: 'infoblox-bloxone-ddi-cloud',
              depth: 2,
              depthLabel: 'Model',
              depthLabelKo: '모델',
              name: 'BloxOne DDI',
              nameKo: 'BloxOne DDI',
              description:
                'Cloud-managed DNS, DHCP, and IPAM service with elastic scaling via VMs, containers, or hardware appliances',
              descriptionKo:
                'VM, 컨테이너 또는 하드웨어 어플라이언스를 통해 탄력적으로 확장 가능한 클라우드 관리형 DNS, DHCP, IPAM 서비스',
              sourceUrl: 'https://www.infoblox.com/products/bloxone-ddi/',
              infraNodeTypes: ['dns'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Cloud-Managed DDI Service',
              architectureRoleKo: '클라우드 관리형 DDI 서비스',
              recommendedFor: [
                'Enterprise hybrid cloud DDI consolidation',
                'Branch offices requiring zero-touch DDI provisioning',
                'Multi-cloud DNS management with centralized control',
              ],
              recommendedForKo: [
                '엔터프라이즈 하이브리드 클라우드 DDI 통합',
                '제로터치 DDI 프로비저닝이 필요한 지사',
                '중앙 제어를 통한 멀티클라우드 DNS 관리',
              ],
              supportedProtocols: [
                'DNS', 'DNSSEC', 'DoH', 'DoT', 'DHCP', 'DHCPv6',
                'IPAM', 'REST API', 'SNMP', 'Syslog',
              ],
              haFeatures: [
                'Cloud-native multi-region redundancy',
                'Local DNS survivability',
                'Automatic failover across regions',
              ],
              specs: {
                'Deployment': 'SaaS (cloud-managed)',
                'Infrastructure Options': 'VMware VM, Docker container, hardware appliance',
                'Provisioning': 'Zero-touch provisioning (ZTP)',
                'Management': 'Centralized cloud portal',
                'Scalability': 'Elastic scaling across locations',
                'API': 'RESTful API for automation',
                'Multi-Cloud': 'AWS, Azure, GCP support',
              },
              children: [],
            },
          ],
        },
        // ── NIOS DDI ──
        {
          nodeId: 'infoblox-nios',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'NIOS DDI',
          nameKo: 'NIOS DDI',
          description:
            'On-premises DDI operating system powering Infoblox Trinzic appliances with integrated DNS, DHCP, IPAM, and Grid technology for high availability',
          descriptionKo:
            '통합 DNS, DHCP, IPAM 및 그리드 기술을 통해 고가용성을 제공하는 Infoblox Trinzic 어플라이언스의 온프레미스 DDI 운영 체제',
          sourceUrl: 'https://www.infoblox.com/products/nios/',
          infraNodeTypes: ['dns'],
          architectureRole: 'On-Premises DDI Infrastructure',
          architectureRoleKo: '온프레미스 DDI 인프라',
          recommendedFor: [
            'Enterprise data center DNS/DHCP/IPAM with hardware appliances',
            'High-performance authoritative and recursive DNS',
            'Regulated environments requiring on-premises DDI',
            'Large-scale IPAM with Grid-based high availability',
            'Service provider DNS infrastructure',
          ],
          recommendedForKo: [
            '하드웨어 어플라이언스 기반 엔터프라이즈 데이터센터 DNS/DHCP/IPAM',
            '고성능 권한 및 재귀 DNS',
            '온프레미스 DDI가 필요한 규제 환경',
            '그리드 기반 고가용성을 갖춘 대규모 IPAM',
            '서비스 제공업체 DNS 인프라',
          ],
          supportedProtocols: [
            'DNS', 'DNSSEC', 'DHCP', 'DHCPv6', 'IPAM',
            'SNMP', 'REST API', 'RPZ', 'Syslog', 'RADIUS',
          ],
          haFeatures: [
            'Active/Passive Grid architecture',
            'Grid Master Candidate for automatic failover',
            'DHCP failover (ISC-compatible)',
            'Anycast DNS for global load distribution',
            'Multi-Grid Manager for distributed deployments',
          ],
          securityCapabilities: [
            'DNSSEC signing and validation',
            'Response Policy Zones (RPZ)',
            'DNS Infrastructure Protection (DDoS defense)',
            'Role-based access control (RBAC)',
            'Encrypted Grid communications (TLS)',
          ],
          children: [
            {
              nodeId: 'infoblox-nios-2205',
              depth: 2,
              depthLabel: 'Model',
              depthLabelKo: '모델',
              name: 'NIOS Trinzic X6 2205',
              nameKo: 'NIOS Trinzic X6 2205',
              description:
                'Entry-level DDI appliance for small offices and branch deployments with integrated DNS, DHCP, and IPAM',
              descriptionKo:
                '소규모 사무실 및 지사 배포를 위한 통합 DNS, DHCP, IPAM 엔트리 레벨 DDI 어플라이언스',
              sourceUrl: 'https://www.infoblox.com/products/infoblox-appliances/',
              infraNodeTypes: ['dns'],
              lifecycle: 'active',
              formFactor: 'appliance',
              licensingModel: 'perpetual',
              architectureRole: 'Branch/Small Office DDI Appliance',
              architectureRoleKo: '지사/소규모 사무실 DDI 어플라이언스',
              recommendedFor: [
                'Small branch office DNS and DHCP services',
                'Entry-level IPAM for up to 1,000 managed objects',
                'Remote sites requiring local DNS resolution',
              ],
              recommendedForKo: [
                '소규모 지사 DNS 및 DHCP 서비스',
                '최대 1,000개 관리 객체를 위한 엔트리 레벨 IPAM',
                '로컬 DNS 확인이 필요한 원격 사이트',
              ],
              haFeatures: [
                'Grid Member with automatic failover',
                'DHCP failover support',
              ],
              specs: {
                'DNS QPS': '50,000',
                'DHCP Leases/sec': '5,000',
                'Managed Objects': '50,000',
                'Form Factor': '1U rackmount',
                'Network Ports': '2x 1GbE RJ45',
                'Power Supply': 'Single 250W AC',
                'Deployment': 'On-premises appliance',
              },
              children: [],
            },
            {
              nodeId: 'infoblox-nios-2210',
              depth: 2,
              depthLabel: 'Model',
              depthLabelKo: '모델',
              name: 'NIOS Trinzic X6 2210',
              nameKo: 'NIOS Trinzic X6 2210',
              description:
                'Mid-range DDI appliance for medium enterprise deployments with enhanced DNS/DHCP performance and IPAM capacity',
              descriptionKo:
                '향상된 DNS/DHCP 성능과 IPAM 용량을 갖춘 중간 규모 엔터프라이즈 배포용 중급 DDI 어플라이언스',
              sourceUrl: 'https://www.infoblox.com/products/infoblox-appliances/',
              infraNodeTypes: ['dns'],
              lifecycle: 'active',
              formFactor: 'appliance',
              licensingModel: 'perpetual',
              architectureRole: 'Mid-Range Enterprise DDI Appliance',
              architectureRoleKo: '중급 엔터프라이즈 DDI 어플라이언스',
              recommendedFor: [
                'Medium enterprise campus DNS and DHCP infrastructure',
                'Regional data center DDI services',
                'Mid-scale IPAM with Grid high availability',
              ],
              recommendedForKo: [
                '중간 규모 엔터프라이즈 캠퍼스 DNS 및 DHCP 인프라',
                '지역 데이터센터 DDI 서비스',
                '그리드 고가용성을 갖춘 중간 규모 IPAM',
              ],
              haFeatures: [
                'Active/Passive Grid Member',
                'Grid Master Candidate',
                'DHCP failover support',
                'Anycast DNS support',
              ],
              specs: {
                'DNS QPS': '150,000',
                'DHCP Leases/sec': '15,000',
                'Managed Objects': '150,000',
                'Form Factor': '1U rackmount',
                'Network Ports': '2x 1GbE RJ45, 2x 10GbE SFP+',
                'Power Supply': 'Redundant 450W AC',
                'Deployment': 'On-premises appliance',
              },
              children: [],
            },
            {
              nodeId: 'infoblox-nios-4010',
              depth: 2,
              depthLabel: 'Model',
              depthLabelKo: '모델',
              name: 'NIOS Trinzic X6 4010',
              nameKo: 'NIOS Trinzic X6 4010',
              description:
                'High-performance DDI appliance for large enterprise and service provider DNS/DHCP/IPAM deployments',
              descriptionKo:
                '대규모 엔터프라이즈 및 서비스 제공업체 DNS/DHCP/IPAM 배포를 위한 고성능 DDI 어플라이언스',
              sourceUrl: 'https://www.infoblox.com/products/infoblox-appliances/',
              infraNodeTypes: ['dns'],
              lifecycle: 'active',
              formFactor: 'appliance',
              licensingModel: 'perpetual',
              architectureRole: 'High-Performance Enterprise DDI Appliance',
              architectureRoleKo: '고성능 엔터프라이즈 DDI 어플라이언스',
              recommendedFor: [
                'Large enterprise data center DDI infrastructure',
                'Service provider authoritative DNS at scale',
                'High-throughput recursive DNS deployments',
              ],
              recommendedForKo: [
                '대규모 엔터프라이즈 데이터센터 DDI 인프라',
                '서비스 제공업체 대규모 권한 DNS',
                '고처리량 재귀 DNS 배포',
              ],
              haFeatures: [
                'Active/Passive Grid Member',
                'Grid Master Candidate',
                'DHCP failover support',
                'Anycast DNS support',
                'Multi-Grid Manager support',
              ],
              specs: {
                'DNS QPS': '500,000',
                'DHCP Leases/sec': '50,000',
                'Managed Objects': '500,000',
                'Form Factor': '1U rackmount',
                'Network Ports': '2x 1GbE RJ45, 4x 10GbE SFP+',
                'Power Supply': 'Redundant 750W AC',
                'Deployment': 'On-premises appliance',
              },
              children: [],
            },
            {
              nodeId: 'infoblox-nios-4030',
              depth: 2,
              depthLabel: 'Model',
              depthLabelKo: '모델',
              name: 'NIOS Trinzic X6 4030',
              nameKo: 'NIOS Trinzic X6 4030',
              description:
                'Top-tier enterprise DDI appliance with maximum DNS QPS and IPAM scale for mission-critical network infrastructure',
              descriptionKo:
                '미션 크리티컬 네트워크 인프라를 위한 최대 DNS QPS 및 IPAM 확장성을 갖춘 최상위 엔터프라이즈 DDI 어플라이언스',
              sourceUrl: 'https://www.infoblox.com/products/infoblox-appliances/',
              infraNodeTypes: ['dns'],
              lifecycle: 'active',
              formFactor: 'appliance',
              licensingModel: 'perpetual',
              architectureRole: 'Mission-Critical Enterprise DDI Appliance',
              architectureRoleKo: '미션 크리티컬 엔터프라이즈 DDI 어플라이언스',
              recommendedFor: [
                'Tier-1 service provider and carrier-grade DNS',
                'Fortune 500 enterprise DDI backbone',
                'Mission-critical environments requiring maximum throughput',
              ],
              recommendedForKo: [
                'Tier-1 서비스 제공업체 및 통신사급 DNS',
                'Fortune 500 엔터프라이즈 DDI 백본',
                '최대 처리량이 필요한 미션 크리티컬 환경',
              ],
              haFeatures: [
                'Active/Passive Grid Member',
                'Grid Master Candidate',
                'DHCP failover support',
                'Anycast DNS support',
                'Multi-Grid Manager support',
                'Hot-standby Grid Master',
              ],
              specs: {
                'DNS QPS': '1,000,000',
                'DHCP Leases/sec': '100,000',
                'Managed Objects': '1,000,000',
                'Form Factor': '2U rackmount',
                'Network Ports': '2x 1GbE RJ45, 4x 10GbE SFP+, 2x 25GbE SFP28',
                'Power Supply': 'Redundant 1000W AC',
                'Deployment': 'On-premises appliance',
              },
              children: [],
            },
            {
              nodeId: 'infoblox-nios-ve',
              depth: 2,
              depthLabel: 'Model',
              depthLabelKo: '모델',
              name: 'NIOS Virtual Edition',
              nameKo: 'NIOS 가상 에디션',
              description:
                'Virtual DDI appliance running NIOS on VMware, Hyper-V, KVM, or cloud platforms for flexible deployment',
              descriptionKo:
                'VMware, Hyper-V, KVM 또는 클라우드 플랫폼에서 NIOS를 실행하는 유연한 배포용 가상 DDI 어플라이언스',
              sourceUrl: 'https://www.infoblox.com/products/nios/',
              infraNodeTypes: ['dns'],
              lifecycle: 'active',
              formFactor: 'virtual',
              licensingModel: 'perpetual',
              architectureRole: 'Virtual DDI Appliance',
              architectureRoleKo: '가상 DDI 어플라이언스',
              recommendedFor: [
                'Virtualized data center DDI without dedicated hardware',
                'Cloud-hosted DNS/DHCP in AWS, Azure, or GCP',
                'Lab and development environments requiring DDI services',
              ],
              recommendedForKo: [
                '전용 하드웨어 없이 가상화된 데이터센터 DDI',
                'AWS, Azure 또는 GCP에서 클라우드 호스팅 DNS/DHCP',
                'DDI 서비스가 필요한 랩 및 개발 환경',
              ],
              haFeatures: [
                'Grid Member with automatic failover',
                'DHCP failover support',
                'Anycast DNS support',
              ],
              specs: {
                'DNS QPS': 'Up to 500,000 (resource-dependent)',
                'DHCP Leases/sec': 'Up to 50,000 (resource-dependent)',
                'Managed Objects': 'Up to 500,000',
                'Hypervisors': 'VMware ESXi, Microsoft Hyper-V, KVM',
                'Cloud Platforms': 'AWS, Azure, GCP',
                'Min vCPU': '2 vCPU',
                'Min Memory': '8 GB RAM',
                'Deployment': 'Virtual appliance (OVA/VHD/QCOW2)',
              },
              children: [],
            },
          ],
        },
        // ── NIOS-X ──
        {
          nodeId: 'infoblox-nios-x',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'NIOS-X as a Service',
          nameKo: 'NIOS-X as a Service',
          description:
            'Next-generation cloud-delivered DDI service combining the reliability of NIOS with cloud-native deployment for hybrid environments',
          descriptionKo:
            'NIOS의 안정성과 클라우드 네이티브 배포를 결합하여 하이브리드 환경을 위한 차세대 클라우드 제공 DDI 서비스',
          sourceUrl: 'https://www.infoblox.com/products/nios-x-as-a-service/',
          infraNodeTypes: ['dns'],
          architectureRole: 'Cloud-Delivered Hybrid DDI Service',
          architectureRoleKo: '클라우드 제공 하이브리드 DDI 서비스',
          recommendedFor: [
            'Organizations modernizing from NIOS to cloud-delivered DDI',
            'Hybrid deployments requiring serverless DDI infrastructure',
            'Rapid DDI deployment without customer-side appliances',
            'Multi-cloud DDI unification with NIOS compatibility',
          ],
          recommendedForKo: [
            'NIOS에서 클라우드 제공 DDI로 현대화하는 조직',
            '서버리스 DDI 인프라가 필요한 하이브리드 배포',
            '고객측 어플라이언스 없이 빠른 DDI 배포',
            'NIOS 호환성을 갖춘 멀티클라우드 DDI 통합',
          ],
          supportedProtocols: [
            'DNS', 'DNSSEC', 'DoH', 'DoT', 'DHCP', 'DHCPv6',
            'IPAM', 'REST API', 'SNMP',
          ],
          haFeatures: [
            'Cloud-native multi-region redundancy',
            'Automatic failover with SaaS architecture',
            'Edge-deployed services close to users',
          ],
          children: [
            {
              nodeId: 'infoblox-nios-x-service',
              depth: 2,
              depthLabel: 'Model',
              depthLabelKo: '모델',
              name: 'NIOS-X as a Service',
              nameKo: 'NIOS-X as a Service',
              description:
                'Infrastructure-free DDI service deploying DNS, DHCP, and IPAM in minutes without customer-side appliances',
              descriptionKo:
                '고객측 어플라이언스 없이 몇 분 내에 DNS, DHCP, IPAM을 배포하는 인프라 불필요 DDI 서비스',
              sourceUrl: 'https://www.infoblox.com/products/nios-x-as-a-service/',
              infraNodeTypes: ['dns'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'as-a-service',
              architectureRole: 'Serverless Cloud DDI Service',
              architectureRoleKo: '서버리스 클라우드 DDI 서비스',
              recommendedFor: [
                'Rapid DDI deployment for new sites and cloud regions',
                'Eliminating on-premises DDI appliance management overhead',
                'Hybrid environments unifying NIOS and cloud DDI',
              ],
              recommendedForKo: [
                '신규 사이트 및 클라우드 리전을 위한 빠른 DDI 배포',
                '온프레미스 DDI 어플라이언스 관리 부담 제거',
                'NIOS와 클라우드 DDI를 통합하는 하이브리드 환경',
              ],
              supportedProtocols: [
                'DNS', 'DNSSEC', 'DoH', 'DoT', 'DHCP', 'DHCPv6',
                'IPAM', 'REST API',
              ],
              haFeatures: [
                'Cloud-native multi-region redundancy',
                'Automatic failover',
                'Edge-deployed services',
              ],
              specs: {
                'Deployment': 'SaaS (infrastructure-free)',
                'Provisioning': 'Minutes (no customer-side appliances)',
                'Architecture': 'Serverless, elastic scaling',
                'NIOS Compatibility': 'Full migration path from NIOS',
                'Multi-Cloud': 'AWS, Azure, GCP support',
                'Management': 'Unified cloud portal',
                'API': 'RESTful API for automation',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 2. DNS Security
    // =====================================================================
    {
      nodeId: 'infoblox-dns-security',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'DNS Security',
      nameKo: 'DNS 보안',
      description:
        'DNS-layer security solutions providing threat detection, protective DNS, DDoS defense, and response policy zone filtering for enterprise networks',
      descriptionKo:
        '엔터프라이즈 네트워크를 위한 위협 탐지, 보호 DNS, DDoS 방어, RPZ 필터링을 제공하는 DNS 계층 보안 솔루션',
      sourceUrl: 'https://www.infoblox.com/products/',
      infraNodeTypes: ['dns'],
      children: [
        // ── BloxOne Threat Defense ──
        {
          nodeId: 'infoblox-bloxone-threat-defense',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'BloxOne Threat Defense',
          nameKo: 'BloxOne Threat Defense',
          description:
            'DNS-layer security platform using predictive threat intelligence to detect and block cyberattacks including phishing, ransomware, and data exfiltration',
          descriptionKo:
            '예측 위협 인텔리전스를 활용하여 피싱, 랜섬웨어, 데이터 유출 등 사이버 공격을 탐지하고 차단하는 DNS 계층 보안 플랫폼',
          sourceUrl: 'https://www.infoblox.com/products/bloxone-threat-defense/',
          infraNodeTypes: ['dns'],
          architectureRole: 'DNS-Layer Protective Security',
          architectureRoleKo: 'DNS 계층 보호 보안',
          recommendedFor: [
            'Enterprise-wide DNS security for hybrid workplaces',
            'Protective DNS blocking malicious domains before connection',
            'Ransomware and data exfiltration prevention at DNS layer',
            'SOC integration with DNS-based threat intelligence',
            'Compliance-driven DNS security (CISA Protective DNS directive)',
          ],
          recommendedForKo: [
            '하이브리드 업무 환경을 위한 전사적 DNS 보안',
            '연결 전 악성 도메인을 차단하는 보호 DNS',
            'DNS 계층에서의 랜섬웨어 및 데이터 유출 방지',
            'DNS 기반 위협 인텔리전스를 통한 SOC 통합',
            '규정 준수 기반 DNS 보안 (CISA 보호 DNS 지침)',
          ],
          supportedProtocols: [
            'DNS', 'DNSSEC', 'DoH', 'DoT', 'RPZ',
            'REST API', 'STIX/TAXII', 'Syslog', 'CEF',
          ],
          haFeatures: [
            'Cloud-native multi-region architecture',
            'Always-on DNS security enforcement',
            'Automatic failover across global PoPs',
          ],
          securityCapabilities: [
            'Predictive threat intelligence (AI/ML-powered)',
            'Malicious domain blocking (phishing, C2, DGA)',
            'Data exfiltration detection via DNS tunneling analysis',
            'Ransomware kill chain disruption',
            'Lookalike domain detection',
            'MITRE ATT&CK mapping',
          ],
          children: [
            {
              nodeId: 'infoblox-btd-business',
              depth: 2,
              depthLabel: 'Model',
              depthLabelKo: '모델',
              name: 'BloxOne Threat Defense Business',
              nameKo: 'BloxOne Threat Defense Business',
              description:
                'DNS security for enterprise offices providing protective DNS with threat intelligence feed integration and policy enforcement',
              descriptionKo:
                '위협 인텔리전스 피드 통합과 정책 적용을 제공하는 엔터프라이즈 사무실용 DNS 보안',
              sourceUrl: 'https://www.infoblox.com/products/bloxone-threat-defense/',
              infraNodeTypes: ['dns'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Office DNS Security / Protective DNS',
              architectureRoleKo: '사무실 DNS 보안 / 보호 DNS',
              recommendedFor: [
                'Enterprise office DNS threat protection',
                'Compliance with CISA Protective DNS requirements',
                'Branch office DNS security without on-site appliances',
              ],
              recommendedForKo: [
                '엔터프라이즈 사무실 DNS 위협 보호',
                'CISA 보호 DNS 요구사항 준수',
                '현장 어플라이언스 없이 지사 DNS 보안',
              ],
              securityCapabilities: [
                'Malicious domain blocking',
                'Threat intelligence feed integration',
                'DNS policy enforcement',
                'Phishing and C2 domain detection',
              ],
              specs: {
                'Deployment': 'Cloud-native (SaaS)',
                'Threat Intelligence': 'Infoblox curated feeds',
                'Policy Enforcement': 'DNS-layer blocking',
                'Integration': 'SIEM, SOAR, firewall via API',
                'Reporting': 'DNS security event dashboard',
              },
              children: [],
            },
            {
              nodeId: 'infoblox-btd-business-cloud',
              depth: 2,
              depthLabel: 'Model',
              depthLabelKo: '모델',
              name: 'BloxOne Threat Defense Business Cloud',
              nameKo: 'BloxOne Threat Defense Business Cloud',
              description:
                'Cloud-optimized DNS security extending protective DNS to remote users, branch offices, and cloud workloads',
              descriptionKo:
                '원격 사용자, 지사, 클라우드 워크로드로 보호 DNS를 확장하는 클라우드 최적화 DNS 보안',
              sourceUrl: 'https://www.infoblox.com/products/bloxone-threat-defense/',
              infraNodeTypes: ['dns'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Cloud DNS Security for Distributed Workforce',
              architectureRoleKo: '분산 인력을 위한 클라우드 DNS 보안',
              recommendedFor: [
                'Remote and hybrid workforce DNS protection',
                'Cloud workload DNS security enforcement',
                'Distributed enterprise with no on-premises security appliances',
              ],
              recommendedForKo: [
                '원격 및 하이브리드 인력 DNS 보호',
                '클라우드 워크로드 DNS 보안 적용',
                '온프레미스 보안 어플라이언스 없는 분산 기업',
              ],
              securityCapabilities: [
                'Cloud-delivered protective DNS',
                'Roaming user DNS security',
                'Cloud workload DNS filtering',
                'Encrypted DNS support (DoH/DoT)',
              ],
              specs: {
                'Deployment': 'Cloud-native (SaaS)',
                'User Coverage': 'Remote, branch, and cloud users',
                'Encrypted DNS': 'DoH and DoT support',
                'Integration': 'Cloud SSO, SIEM, endpoint agents',
                'Policy': 'Location-aware DNS policies',
              },
              children: [],
            },
            {
              nodeId: 'infoblox-btd-advanced',
              depth: 2,
              depthLabel: 'Model',
              depthLabelKo: '모델',
              name: 'BloxOne Threat Defense Advanced',
              nameKo: 'BloxOne Threat Defense Advanced',
              description:
                'AI-powered DNS threat detection with advanced analytics, DNS tunneling detection, lookalike domain analysis, and SOC Insights integration',
              descriptionKo:
                '고급 분석, DNS 터널링 탐지, 유사 도메인 분석, SOC Insights 통합을 갖춘 AI 기반 DNS 위협 탐지',
              sourceUrl: 'https://www.infoblox.com/products/bloxone-threat-defense/',
              infraNodeTypes: ['dns'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Advanced AI-Powered DNS Threat Detection',
              architectureRoleKo: '고급 AI 기반 DNS 위협 탐지',
              recommendedFor: [
                'SOC-integrated DNS threat detection and response',
                'Advanced DNS tunneling and data exfiltration detection',
                'AI-powered threat hunting via DNS telemetry',
              ],
              recommendedForKo: [
                'SOC 통합 DNS 위협 탐지 및 대응',
                '고급 DNS 터널링 및 데이터 유출 탐지',
                'DNS 원격 측정을 통한 AI 기반 위협 헌팅',
              ],
              securityCapabilities: [
                'AI/ML-powered threat detection',
                'DNS tunneling detection',
                'Lookalike domain analysis',
                'Data exfiltration prevention',
                'MITRE ATT&CK integration',
                'SOC Insights correlation',
              ],
              specs: {
                'Deployment': 'Cloud-native (SaaS)',
                'AI/ML': 'Predictive threat intelligence engine',
                'Detection': 'DNS tunneling, DGA, lookalike domains',
                'SOC Integration': 'SOC Insights, SIEM, SOAR',
                'Threat Intel': 'Infoblox TIDE + third-party feeds',
                'Analytics': 'Real-time DNS security analytics dashboard',
              },
              children: [],
            },
          ],
        },
        // ── Advanced DNS Protection ──
        {
          nodeId: 'infoblox-adp',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'DNS Infrastructure Protection',
          nameKo: 'DNS 인프라 보호',
          description:
            'NIOS add-on providing DDoS defense and DNS exploit protection for mission-critical DNS infrastructure',
          descriptionKo:
            '미션 크리티컬 DNS 인프라를 위한 DDoS 방어 및 DNS 악용 방지를 제공하는 NIOS 애드온',
          sourceUrl: 'https://www.infoblox.com/products/dns-infrastructure-protection/',
          infraNodeTypes: ['dns'],
          architectureRole: 'DNS DDoS Defense Layer',
          architectureRoleKo: 'DNS DDoS 방어 계층',
          recommendedFor: [
            'Protecting authoritative DNS servers from volumetric DDoS',
            'Preventing DNS hijacking and cache poisoning attacks',
            'Mission-critical DNS infrastructure availability assurance',
          ],
          recommendedForKo: [
            '볼류메트릭 DDoS로부터 권한 DNS 서버 보호',
            'DNS 하이재킹 및 캐시 포이즈닝 공격 방지',
            '미션 크리티컬 DNS 인프라 가용성 보장',
          ],
          supportedProtocols: ['DNS', 'DNSSEC', 'SNMP', 'Syslog'],
          haFeatures: [
            'Inline protection without DNS service disruption',
            'Adaptive threat intelligence updates',
          ],
          securityCapabilities: [
            'Volumetric DDoS attack mitigation',
            'NXDOMAIN flood protection',
            'DNS hijacking prevention',
            'Cache poisoning defense',
            'DNS amplification attack blocking',
            'Threat Adapt intelligence updates',
          ],
          children: [
            {
              nodeId: 'infoblox-adp-module',
              depth: 2,
              depthLabel: 'Model',
              depthLabelKo: '모델',
              name: 'Infoblox DNS Infrastructure Protection',
              nameKo: 'Infoblox DNS 인프라 보호',
              description:
                'NIOS software module providing inline DDoS defense for DNS servers, blocking volumetric and non-volumetric DNS attacks',
              descriptionKo:
                'DNS 서버를 위한 인라인 DDoS 방어를 제공하는 NIOS 소프트웨어 모듈로 볼류메트릭 및 비볼류메트릭 DNS 공격 차단',
              sourceUrl: 'https://www.infoblox.com/products/dns-infrastructure-protection/',
              infraNodeTypes: ['dns'],
              lifecycle: 'active',
              formFactor: 'appliance',
              licensingModel: 'subscription',
              architectureRole: 'Inline DNS DDoS Defense',
              architectureRoleKo: '인라인 DNS DDoS 방어',
              recommendedFor: [
                'NIOS appliance DDoS protection add-on',
                'Enterprise DNS infrastructure availability assurance',
                'Defense against DNS-specific exploits and floods',
              ],
              recommendedForKo: [
                'NIOS 어플라이언스 DDoS 보호 애드온',
                '엔터프라이즈 DNS 인프라 가용성 보장',
                'DNS 특화 익스플로잇 및 플러드 공격 방어',
              ],
              securityCapabilities: [
                'Volumetric DDoS mitigation',
                'NXDOMAIN flood defense',
                'DNS hijacking prevention',
                'Cache poisoning defense',
              ],
              specs: {
                'Deployment': 'NIOS software add-on',
                'Protection Type': 'Inline DNS traffic inspection',
                'DDoS Defense': 'Volumetric and non-volumetric attacks',
                'Threat Updates': 'Infoblox Threat Adapt intelligence',
                'Attack Types': 'DDoS, NXDOMAIN flood, hijacking, cache poisoning, amplification',
              },
              children: [],
            },
          ],
        },
        // ── DNS Firewall ──
        {
          nodeId: 'infoblox-dns-firewall',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'DNS Firewall',
          nameKo: 'DNS 방화벽',
          description:
            'Response Policy Zone (RPZ)-based DNS filtering engine blocking access to malicious domains at the DNS resolution layer',
          descriptionKo:
            'DNS 확인 계층에서 악성 도메인 접근을 차단하는 RPZ(응답 정책 영역) 기반 DNS 필터링 엔진',
          sourceUrl: 'https://www.infoblox.com/products/',
          infraNodeTypes: ['dns'],
          architectureRole: 'DNS Response Policy Filtering',
          architectureRoleKo: 'DNS 응답 정책 필터링',
          recommendedFor: [
            'RPZ-based malicious domain blocking at DNS layer',
            'Enterprise DNS content filtering and policy enforcement',
            'Integration with threat intelligence feeds for DNS blocking',
          ],
          recommendedForKo: [
            'DNS 계층에서의 RPZ 기반 악성 도메인 차단',
            '엔터프라이즈 DNS 콘텐츠 필터링 및 정책 적용',
            'DNS 차단을 위한 위협 인텔리전스 피드 통합',
          ],
          supportedProtocols: ['DNS', 'DNSSEC', 'RPZ', 'REST API'],
          securityCapabilities: [
            'Response Policy Zone (RPZ) enforcement',
            'Malicious domain blocking',
            'Botnet C2 communication disruption',
            'Threat feed-driven DNS filtering',
          ],
          children: [
            {
              nodeId: 'infoblox-dns-firewall-module',
              depth: 2,
              depthLabel: 'Model',
              depthLabelKo: '모델',
              name: 'Infoblox DNS Firewall',
              nameKo: 'Infoblox DNS 방화벽',
              description:
                'RPZ-based DNS filtering solution blocking malicious domain access using curated and third-party threat intelligence feeds',
              descriptionKo:
                '큐레이팅된 위협 인텔리전스 및 서드파티 피드를 사용하여 악성 도메인 접근을 차단하는 RPZ 기반 DNS 필터링 솔루션',
              sourceUrl: 'https://www.infoblox.com/products/',
              infraNodeTypes: ['dns'],
              lifecycle: 'active',
              formFactor: 'appliance',
              licensingModel: 'subscription',
              architectureRole: 'RPZ-Based DNS Filtering',
              architectureRoleKo: 'RPZ 기반 DNS 필터링',
              recommendedFor: [
                'On-premises DNS-layer malicious domain blocking',
                'RPZ policy enforcement across NIOS Grid',
                'Threat intelligence-driven DNS content filtering',
              ],
              recommendedForKo: [
                '온프레미스 DNS 계층 악성 도메인 차단',
                'NIOS 그리드 전체 RPZ 정책 적용',
                '위협 인텔리전스 기반 DNS 콘텐츠 필터링',
              ],
              securityCapabilities: [
                'RPZ enforcement',
                'Malicious domain blocking',
                'Threat feed integration',
                'Botnet C2 disruption',
              ],
              specs: {
                'Deployment': 'NIOS Grid integration',
                'Filtering Engine': 'Response Policy Zone (RPZ)',
                'Threat Feeds': 'Infoblox curated + third-party RPZ feeds',
                'Policy Actions': 'Block, redirect, log, passthru',
                'Management': 'NIOS Grid Manager console',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 3. Network Intelligence
    // =====================================================================
    {
      nodeId: 'infoblox-network-intelligence',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Network Intelligence',
      nameKo: '네트워크 인텔리전스',
      description:
        'Network automation, discovery, and threat intelligence solutions providing visibility and compliance across multi-vendor infrastructure',
      descriptionKo:
        '멀티벤더 인프라 전반에 가시성과 컴플라이언스를 제공하는 네트워크 자동화, 디스커버리, 위협 인텔리전스 솔루션',
      sourceUrl: 'https://www.infoblox.com/products/',
      infraNodeTypes: ['dns'],
      children: [
        // ── NetMRI ──
        {
          nodeId: 'infoblox-netmri',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'NetMRI',
          nameKo: 'NetMRI',
          description:
            'Multi-vendor network change and configuration management platform providing automated discovery, compliance auditing, and workflow automation',
          descriptionKo:
            '자동화된 디스커버리, 컴플라이언스 감사, 워크플로 자동화를 제공하는 멀티벤더 네트워크 변경 및 구성 관리 플랫폼',
          sourceUrl: 'https://www.infoblox.com/products/netmri/',
          infraNodeTypes: ['dns'],
          architectureRole: 'Network Change and Configuration Management',
          architectureRoleKo: '네트워크 변경 및 구성 관리',
          recommendedFor: [
            'Multi-vendor network configuration compliance auditing',
            'Automated network change management and provisioning',
            'PCI, HIPAA, DISA STIG regulatory compliance enforcement',
            'Network topology discovery and VLAN tracking',
          ],
          recommendedForKo: [
            '멀티벤더 네트워크 구성 컴플라이언스 감사',
            '자동화된 네트워크 변경 관리 및 프로비저닝',
            'PCI, HIPAA, DISA STIG 규제 준수 적용',
            '네트워크 토폴로지 디스커버리 및 VLAN 추적',
          ],
          supportedProtocols: ['SNMP', 'SSH', 'Telnet', 'REST API', 'Syslog', 'RADIUS'],
          children: [
            {
              nodeId: 'infoblox-netmri-appliance',
              depth: 2,
              depthLabel: 'Model',
              depthLabelKo: '모델',
              name: 'Infoblox NetMRI',
              nameKo: 'Infoblox NetMRI',
              description:
                'Virtual appliance for multi-vendor network change/configuration management with automated compliance and provisioning workflows',
              descriptionKo:
                '자동화된 컴플라이언스 및 프로비저닝 워크플로를 갖춘 멀티벤더 네트워크 변경/구성 관리용 가상 어플라이언스',
              sourceUrl: 'https://www.infoblox.com/products/netmri/',
              infraNodeTypes: ['dns'],
              lifecycle: 'active',
              formFactor: 'virtual',
              licensingModel: 'perpetual',
              architectureRole: 'Network Configuration Management Appliance',
              architectureRoleKo: '네트워크 구성 관리 어플라이언스',
              recommendedFor: [
                'Enterprise multi-vendor network compliance management',
                'Automated device provisioning and change workflows',
                'Continuous configuration auditing for regulatory compliance',
              ],
              recommendedForKo: [
                '엔터프라이즈 멀티벤더 네트워크 컴플라이언스 관리',
                '자동화된 장비 프로비저닝 및 변경 워크플로',
                '규제 준수를 위한 지속적 구성 감사',
              ],
              specs: {
                'Deployment': 'Virtual appliance',
                'Multi-Vendor': 'Cisco, Juniper, Arista, HP, Dell, and more',
                'Compliance Frameworks': 'PCI, HIPAA, DISA STIG, CIS',
                'Automation': 'Script-driven provisioning and remediation',
                'Discovery': 'Automatic topology, VLAN, route tracking',
                'Alerts': 'Real-time configuration change notifications',
              },
              children: [],
            },
          ],
        },
        // ── Network Insight ──
        {
          nodeId: 'infoblox-network-insight',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Network Insight',
          nameKo: 'Network Insight',
          description:
            'Real-time network discovery and asset visibility platform identifying every device, IP address, and switch port across on-premises infrastructure',
          descriptionKo:
            '온프레미스 인프라 전반에서 모든 장비, IP 주소, 스위치 포트를 식별하는 실시간 네트워크 디스커버리 및 자산 가시성 플랫폼',
          sourceUrl: 'https://www.infoblox.com/products/network-insight/',
          infraNodeTypes: ['dns'],
          architectureRole: 'Network Discovery and Asset Visibility',
          architectureRoleKo: '네트워크 디스커버리 및 자산 가시성',
          recommendedFor: [
            'Automated network asset discovery and inventory',
            'Rogue device detection and remediation',
            'IP address utilization and capacity planning',
            'IPAM reconciliation with actual network state',
          ],
          recommendedForKo: [
            '자동화된 네트워크 자산 디스커버리 및 인벤토리',
            '비인가 장비 탐지 및 조치',
            'IP 주소 활용도 및 용량 계획',
            '실제 네트워크 상태와 IPAM 조정',
          ],
          supportedProtocols: ['SNMP', 'SSH', 'REST API', 'Syslog', 'NetFlow'],
          children: [
            {
              nodeId: 'infoblox-network-insight-module',
              depth: 2,
              depthLabel: 'Model',
              depthLabelKo: '모델',
              name: 'Infoblox Network Insight',
              nameKo: 'Infoblox Network Insight',
              description:
                'On-premises network discovery module providing real-time asset visibility, rogue device detection, and IPAM reconciliation',
              descriptionKo:
                '실시간 자산 가시성, 비인가 장비 탐지, IPAM 조정을 제공하는 온프레미스 네트워크 디스커버리 모듈',
              sourceUrl: 'https://www.infoblox.com/products/network-insight/',
              infraNodeTypes: ['dns'],
              lifecycle: 'active',
              formFactor: 'appliance',
              licensingModel: 'subscription',
              architectureRole: 'Network Asset Discovery Engine',
              architectureRoleKo: '네트워크 자산 디스커버리 엔진',
              recommendedFor: [
                'Enterprise network asset inventory and discovery',
                'Rogue device identification and switch port control',
                'IPAM accuracy validation against live network',
              ],
              recommendedForKo: [
                '엔터프라이즈 네트워크 자산 인벤토리 및 디스커버리',
                '비인가 장비 식별 및 스위치 포트 제어',
                '라이브 네트워크 대비 IPAM 정확성 검증',
              ],
              specs: {
                'Deployment': 'NIOS-integrated appliance or virtual',
                'Discovery': 'Vendor-agnostic network scanning',
                'Asset Types': 'Devices, IP addresses, switch ports, VLANs',
                'Rogue Detection': 'Automatic unmanaged device alerts',
                'Integration': 'Cisco ISE, NIOS Grid Manager',
                'Scheduling': 'Automated discovery with blackout windows',
              },
              children: [],
            },
          ],
        },
        // ── BloxOne Threat Defense Ecosystem (TIDE & Dossier) ──
        {
          nodeId: 'infoblox-threat-intel',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Threat Intelligence Platform',
          nameKo: '위협 인텔리전스 플랫폼',
          description:
            'DNS-focused threat intelligence collection, normalization, and distribution platform strengthening the entire security stack',
          descriptionKo:
            '전체 보안 스택을 강화하는 DNS 중심 위협 인텔리전스 수집, 정규화, 배포 플랫폼',
          sourceUrl: 'https://www.infoblox.com/products/threat-intelligence/',
          infraNodeTypes: ['dns'],
          architectureRole: 'Threat Intelligence Distribution Hub',
          architectureRoleKo: '위협 인텔리전스 배포 허브',
          recommendedFor: [
            'Multi-source threat intelligence aggregation and normalization',
            'DNS-centric threat data distribution to security stack',
            'Threat investigation and indicator enrichment',
          ],
          recommendedForKo: [
            '멀티 소스 위협 인텔리전스 집계 및 정규화',
            '보안 스택에 대한 DNS 중심 위협 데이터 배포',
            '위협 조사 및 지표 보강',
          ],
          supportedProtocols: ['REST API', 'STIX/TAXII', 'RPZ', 'Syslog', 'CEF'],
          children: [
            {
              nodeId: 'infoblox-tide',
              depth: 2,
              depthLabel: 'Model',
              depthLabelKo: '모델',
              name: 'Infoblox TIDE',
              nameKo: 'Infoblox TIDE',
              description:
                'Threat Intelligence Data Exchange platform aggregating multi-source threat indicators and distributing normalized intelligence to security tools',
              descriptionKo:
                '멀티 소스 위협 지표를 집계하고 정규화된 인텔리전스를 보안 도구에 배포하는 위협 인텔리전스 데이터 교환 플랫폼',
              sourceUrl: 'https://www.infoblox.com/products/threat-intelligence/',
              infraNodeTypes: ['dns'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Threat Intelligence Data Exchange',
              architectureRoleKo: '위협 인텔리전스 데이터 교환',
              recommendedFor: [
                'Aggregating threat feeds from multiple sources into unified format',
                'Distributing threat indicators to firewalls, SIEM, and endpoint tools',
                'DNS-focused threat intelligence for SOC operations',
              ],
              recommendedForKo: [
                '다중 소스의 위협 피드를 통합 형식으로 집계',
                '방화벽, SIEM, 엔드포인트 도구에 위협 지표 배포',
                'SOC 운영을 위한 DNS 중심 위협 인텔리전스',
              ],
              specs: {
                'Deployment': 'Cloud-native (SaaS)',
                'Data Sources': 'Infoblox research + 30+ third-party feeds',
                'Output Formats': 'STIX/TAXII, RPZ, CSV, JSON',
                'Integration': 'SIEM, SOAR, firewall, endpoint via API',
                'Indicators': 'IP, domain, URL, hash, email',
                'Update Frequency': 'Real-time threat feed updates',
              },
              children: [],
            },
            {
              nodeId: 'infoblox-dossier',
              depth: 2,
              depthLabel: 'Model',
              depthLabelKo: '모델',
              name: 'Infoblox Dossier',
              nameKo: 'Infoblox Dossier',
              description:
                'Threat investigation tool providing deep indicator enrichment and contextual analysis for security analysts and SOC teams',
              descriptionKo:
                '보안 분석가 및 SOC 팀을 위한 심층 지표 보강 및 상황 분석을 제공하는 위협 조사 도구',
              sourceUrl: 'https://www.infoblox.com/products/threat-intelligence/',
              infraNodeTypes: ['dns'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Threat Investigation and Indicator Enrichment',
              architectureRoleKo: '위협 조사 및 지표 보강',
              recommendedFor: [
                'SOC analyst threat investigation and triage',
                'Indicator of compromise (IoC) enrichment and context',
                'DNS-based threat research and attribution',
              ],
              recommendedForKo: [
                'SOC 분석가 위협 조사 및 분류',
                '침해 지표(IoC) 보강 및 컨텍스트 분석',
                'DNS 기반 위협 연구 및 귀속',
              ],
              specs: {
                'Deployment': 'Cloud-native (SaaS)',
                'Investigation': 'Multi-source indicator lookup',
                'Enrichment': 'WHOIS, passive DNS, geo, reputation',
                'Indicator Types': 'Domain, IP, URL, email, hash',
                'Integration': 'BloxOne Threat Defense, SIEM, SOAR',
                'API': 'RESTful API for automated lookups',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 4. Reporting & Analytics
    // =====================================================================
    {
      nodeId: 'infoblox-reporting-analytics',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Reporting & Analytics',
      nameKo: '보고 및 분석',
      description:
        'DNS/DHCP/IPAM analytics, reporting dashboards, and AI-driven security event correlation for operational visibility',
      descriptionKo:
        '운영 가시성을 위한 DNS/DHCP/IPAM 분석, 보고 대시보드, AI 기반 보안 이벤트 상관 분석',
      sourceUrl: 'https://www.infoblox.com/products/',
      infraNodeTypes: ['dns'],
      children: [
        // ── Reporting & Analytics ──
        {
          nodeId: 'infoblox-reporting',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Infoblox Reporting & Analytics',
          nameKo: 'Infoblox 보고 및 분석',
          description:
            'Centralized reporting platform providing DNS, DHCP, and IPAM analytics dashboards with automated compliance reporting',
          descriptionKo:
            '자동화된 컴플라이언스 보고와 함께 DNS, DHCP, IPAM 분석 대시보드를 제공하는 중앙 보고 플랫폼',
          sourceUrl: 'https://www.infoblox.com/products/reporting-and-analytics/',
          infraNodeTypes: ['dns'],
          architectureRole: 'DDI Analytics and Compliance Reporting',
          architectureRoleKo: 'DDI 분석 및 컴플라이언스 보고',
          recommendedFor: [
            'DNS/DHCP/IPAM operational analytics and dashboards',
            'Automated compliance reporting for audits',
            'Capacity planning and utilization trending',
          ],
          recommendedForKo: [
            'DNS/DHCP/IPAM 운영 분석 및 대시보드',
            '감사를 위한 자동화된 컴플라이언스 보고',
            '용량 계획 및 활용도 트렌딩',
          ],
          supportedProtocols: ['REST API', 'SNMP', 'Syslog'],
          children: [
            {
              nodeId: 'infoblox-reporting-module',
              depth: 2,
              depthLabel: 'Model',
              depthLabelKo: '모델',
              name: 'Infoblox Reporting',
              nameKo: 'Infoblox 보고',
              description:
                'DDI analytics and reporting appliance providing real-time dashboards, historical trending, and automated compliance reports',
              descriptionKo:
                '실시간 대시보드, 이력 트렌딩, 자동화된 컴플라이언스 보고서를 제공하는 DDI 분석 및 보고 어플라이언스',
              sourceUrl: 'https://www.infoblox.com/products/reporting-and-analytics/',
              infraNodeTypes: ['dns'],
              lifecycle: 'active',
              formFactor: 'appliance',
              licensingModel: 'perpetual',
              architectureRole: 'DDI Reporting and Analytics Engine',
              architectureRoleKo: 'DDI 보고 및 분석 엔진',
              recommendedFor: [
                'Enterprise DDI operational visibility and dashboards',
                'DNS query analytics and trending',
                'DHCP lease utilization reporting',
              ],
              recommendedForKo: [
                '엔터프라이즈 DDI 운영 가시성 및 대시보드',
                'DNS 쿼리 분석 및 트렌딩',
                'DHCP 임대 활용도 보고',
              ],
              specs: {
                'Deployment': 'On-premises appliance or virtual',
                'Dashboards': 'DNS, DHCP, IPAM real-time analytics',
                'Reports': 'Automated compliance and operational reports',
                'Trending': 'Historical data trending and capacity planning',
                'Integration': 'NIOS Grid, syslog, SNMP',
              },
              children: [],
            },
          ],
        },
        // ── SOC Insights ──
        {
          nodeId: 'infoblox-soc-insights',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'SOC Insights',
          nameKo: 'SOC Insights',
          description:
            'AI-driven DNS security analytics platform automatically correlating threat intelligence and asset data to prioritize critical threats for SOC teams',
          descriptionKo:
            '위협 인텔리전스와 자산 데이터를 자동 상관 분석하여 SOC 팀을 위한 중요 위협 우선순위를 지정하는 AI 기반 DNS 보안 분석 플랫폼',
          sourceUrl: 'https://www.infoblox.com/products/soc-insights/',
          infraNodeTypes: ['dns'],
          architectureRole: 'AI-Driven DNS Security Event Correlation',
          architectureRoleKo: 'AI 기반 DNS 보안 이벤트 상관 분석',
          recommendedFor: [
            'SOC alert fatigue reduction via AI-powered event correlation',
            'DNS threat event prioritization and investigation',
            'Automated security insight generation for threat defense',
          ],
          recommendedForKo: [
            'AI 기반 이벤트 상관 분석을 통한 SOC 경보 피로 감소',
            'DNS 위협 이벤트 우선순위 지정 및 조사',
            '위협 방어를 위한 자동화된 보안 인사이트 생성',
          ],
          supportedProtocols: ['REST API', 'Syslog', 'CEF', 'STIX/TAXII'],
          securityCapabilities: [
            'AI/ML-driven event correlation',
            'DNS threat prioritization',
            'Asset-threat context mapping',
            'Automated insight generation',
          ],
          children: [
            {
              nodeId: 'infoblox-soc-insights-module',
              depth: 2,
              depthLabel: 'Model',
              depthLabelKo: '모델',
              name: 'Infoblox SOC Insights',
              nameKo: 'Infoblox SOC Insights',
              description:
                'AI-powered analytics module correlating DNS security events with asset data to surface actionable insights for security operations centers',
              descriptionKo:
                'DNS 보안 이벤트와 자산 데이터를 상관 분석하여 보안 운영 센터에 실행 가능한 인사이트를 제공하는 AI 기반 분석 모듈',
              sourceUrl: 'https://www.infoblox.com/products/soc-insights/',
              infraNodeTypes: ['dns'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'AI-Powered SOC Analytics for DNS Security',
              architectureRoleKo: 'DNS 보안을 위한 AI 기반 SOC 분석',
              recommendedFor: [
                'SOC teams needing automated DNS threat prioritization',
                'Reducing alert fatigue from high-volume DNS security events',
                'Correlating DNS threats with network asset context',
              ],
              recommendedForKo: [
                '자동화된 DNS 위협 우선순위 지정이 필요한 SOC 팀',
                '대용량 DNS 보안 이벤트로 인한 경보 피로 감소',
                'DNS 위협과 네트워크 자산 컨텍스트 상관 분석',
              ],
              securityCapabilities: [
                'AI/ML event correlation',
                'Automated threat prioritization',
                'Asset-threat context enrichment',
                'Actionable insight generation',
              ],
              specs: {
                'Deployment': 'Cloud-native (SaaS)',
                'AI/ML': 'Automated event mining and correlation',
                'Data Sources': 'DNS threat events, asset discovery data',
                'Output': 'Prioritized actionable security insights',
                'Integration': 'BloxOne Threat Defense, SIEM, SOAR',
                'SOC Workflow': 'Automated triage and investigation support',
              },
              children: [],
            },
          ],
        },
      ],
    },
  ],
};
