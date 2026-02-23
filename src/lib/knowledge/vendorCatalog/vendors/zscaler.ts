/**
 * Zscaler -- Full Product Catalog
 *
 * Hierarchical product tree covering Zscaler for Users, Zscaler for Workloads,
 * Zscaler for IoT/OT, and Zscaler for Data categories.
 *
 * Data sourced from https://www.zscaler.com/products
 * Last crawled: 2026-02-22
 */

import type { VendorCatalog } from '../types';

// ---------------------------------------------------------------------------
// Zscaler Product Catalog
// ---------------------------------------------------------------------------

export const zscalerCatalog: VendorCatalog = {
  vendorId: 'zscaler',
  vendorName: 'Zscaler',
  vendorNameKo: '지스케일러',
  headquarters: 'San Jose, CA, USA',
  website: 'https://www.zscaler.com',
  productPageUrl: 'https://www.zscaler.com/products',
  depthStructure: ['category', 'product-line', 'module'],
  depthStructureKo: ['카테고리', '제품 라인', '모듈'],
  lastCrawled: '2026-02-22',
  crawlSource: 'https://www.zscaler.com/products',
  stats: { totalProducts: 32, maxDepth: 2, categoriesCount: 4 },
  products: [
    // =====================================================================
    // 1. Zscaler for Users
    // =====================================================================
    {
      nodeId: 'zscaler-for-users',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Zscaler for Users',
      nameKo: '사용자를 위한 Zscaler',
      description:
        'Cloud-native security platform protecting users with secure internet access, zero trust private access, and digital experience monitoring',
      descriptionKo:
        '안전한 인터넷 접속, 제로 트러스트 프라이빗 액세스, 디지털 경험 모니터링으로 사용자를 보호하는 클라우드 네이티브 보안 플랫폼',
      sourceUrl: 'https://www.zscaler.com/products',
      infraNodeTypes: ['sase-gateway', 'ztna-broker'],
      children: [
        // ── Zscaler Internet Access (ZIA) ──
        {
          nodeId: 'zscaler-zia',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Zscaler Internet Access (ZIA)',
          nameKo: 'Zscaler 인터넷 액세스 (ZIA)',
          description:
            'The world\'s most deployed Security Service Edge (SSE), providing cloud-native SWG, firewall, sandbox, DLP, and CASB with full TLS/SSL inspection at scale',
          descriptionKo:
            '세계에서 가장 많이 배포된 보안 서비스 에지(SSE), 클라우드 네이티브 SWG, 방화벽, 샌드박스, DLP, CASB를 완전한 TLS/SSL 검사와 함께 제공',
          sourceUrl: 'https://www.zscaler.com/products/zscaler-internet-access',
          infraNodeTypes: ['sase-gateway'],
          architectureRole: 'Security Service Edge / Cloud SWG',
          architectureRoleKo: '보안 서비스 에지 / 클라우드 SWG',
          recommendedFor: [
            'Enterprise secure internet access replacing on-premises proxies and SWGs',
            'Full TLS/SSL inspection at scale for encrypted traffic visibility',
            'Cloud-first organizations eliminating traditional perimeter firewalls',
            'Branch office direct-to-internet connectivity with inline security',
            'Remote and hybrid workforce protection with consistent security policies',
          ],
          recommendedForKo: [
            '온프레미스 프록시 및 SWG를 대체하는 엔터프라이즈 보안 인터넷 접속',
            '암호화된 트래픽 가시성을 위한 대규모 TLS/SSL 검사',
            '기존 경계 방화벽을 제거하는 클라우드 우선 조직',
            '인라인 보안이 적용된 지사 직접 인터넷 연결',
            '일관된 보안 정책으로 원격 및 하이브리드 인력 보호',
          ],
          supportedProtocols: [
            'HTTP/HTTPS', 'TLS 1.2/1.3', 'DNS', 'FTP',
            'SMTP', 'ICMP', 'TCP/UDP (all ports)',
            'GRE Tunnel', 'IPSec Tunnel', 'PAC File',
            'SAML 2.0', 'SCIM',
          ],
          haFeatures: [
            '99.999% uptime SLA',
            '160+ globally distributed data centers',
            'Active-active cloud architecture',
            'Automatic failover across data centers',
            'Local internet breakout with redundant tunnels',
            'Always-on inline inspection with no single point of failure',
          ],
          securityCapabilities: [
            'Secure Web Gateway (SWG) with AI-powered URL filtering',
            'Cloud Firewall (L3-L7 firewall-as-a-service)',
            'Cloud Sandbox with zero-day quarantine',
            'Intrusion Prevention System (IPS)',
            'Advanced Threat Protection (ATP)',
            'DNS Security filtering',
            'AI-powered phishing detection',
            'Browser Isolation (remote browser)',
            'Data Loss Prevention (DLP) with EDM/IDM',
            'Cloud Access Security Broker (CASB)',
            'SSL/TLS deep inspection at scale',
            'Single Scan Multi-Action engine',
            'MITRE ATT&CK mapping',
          ],
          children: [
            {
              nodeId: 'zscaler-zia-swg',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'ZIA Secure Web Gateway',
              nameKo: 'ZIA 보안 웹 게이트웨이',
              description:
                'AI-powered URL and content filtering with full TLS/SSL inspection, replacing on-premises SWG appliances',
              descriptionKo:
                'AI 기반 URL 및 콘텐츠 필터링과 완전한 TLS/SSL 검사를 제공하여 온프레미스 SWG 어플라이언스를 대체',
              sourceUrl: 'https://www.zscaler.com/products/zscaler-internet-access',
              infraNodeTypes: ['sase-gateway'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Cloud Secure Web Gateway',
              architectureRoleKo: '클라우드 보안 웹 게이트웨이',
              recommendedFor: [
                'Replacing on-premises proxy and SWG appliances',
                'Enforcing acceptable use policies for web access',
                'Protecting users from web-based threats with AI-powered filtering',
              ],
              recommendedForKo: [
                '온프레미스 프록시 및 SWG 어플라이언스 교체',
                '웹 접속에 대한 사용 정책 적용',
                'AI 기반 필터링으로 웹 기반 위협으로부터 사용자 보호',
              ],
              securityCapabilities: [
                'AI-powered URL filtering',
                'Content inspection and categorization',
                'Full TLS/SSL inspection at scale',
                'Malicious content blocking',
                'Bandwidth control and QoS',
              ],
              specs: {
                'Deployment': 'Cloud-native (no appliance)',
                'Global Data Centers': '160+',
                'Daily Transactions': '500 billion+',
                'TLS/SSL Inspection': 'Full inline inspection at scale',
                'Filtering': 'AI-powered URL and content filtering',
              },
              children: [],
            },
            {
              nodeId: 'zscaler-zia-firewall',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'ZIA Cloud Firewall',
              nameKo: 'ZIA 클라우드 방화벽',
              description:
                'Layer 3-7 firewall-as-a-service providing full next-gen firewall capabilities in the cloud without on-premises hardware',
              descriptionKo:
                '온프레미스 하드웨어 없이 클라우드에서 완전한 차세대 방화벽 기능을 제공하는 L3-L7 서비스형 방화벽',
              sourceUrl: 'https://www.zscaler.com/products/zscaler-internet-access',
              infraNodeTypes: ['sase-gateway', 'firewall'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Cloud Next-Gen Firewall / FWaaS',
              architectureRoleKo: '클라우드 차세대 방화벽 / FWaaS',
              recommendedFor: [
                'Replacing branch and perimeter firewall appliances',
                'Consistent L3-L7 firewall policy across all locations',
                'Securing all ports and protocols for remote users',
              ],
              recommendedForKo: [
                '지사 및 경계 방화벽 어플라이언스 교체',
                '모든 위치에서 일관된 L3-L7 방화벽 정책 적용',
                '원격 사용자를 위한 모든 포트 및 프로토콜 보안',
              ],
              securityCapabilities: [
                'Stateful firewall (L3-L4)',
                'Application-aware firewall (L7)',
                'IPS with botnet and zero-day protection',
                'DNS security filtering',
                'Granular policy by user, group, location, and application',
              ],
              specs: {
                'Deployment': 'Cloud-native (no appliance)',
                'Layers': 'L3-L7',
                'IPS': 'Inline intrusion prevention',
                'DNS Security': 'Malicious domain filtering',
                'Policy Granularity': 'User, group, location, application',
              },
              children: [],
            },
            {
              nodeId: 'zscaler-zia-sandbox',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'ZIA Cloud Sandbox',
              nameKo: 'ZIA 클라우드 샌드박스',
              description:
                'Inline cloud sandbox with AI-powered zero-day threat analysis, quarantining unknown files before delivery',
              descriptionKo:
                'AI 기반 제로데이 위협 분석이 포함된 인라인 클라우드 샌드박스로 미확인 파일을 전달 전 격리',
              sourceUrl: 'https://www.zscaler.com/products/zscaler-internet-access',
              infraNodeTypes: ['sase-gateway'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Cloud Malware Analysis / Sandbox',
              architectureRoleKo: '클라우드 악성코드 분석 / 샌드박스',
              recommendedFor: [
                'Zero-day and advanced threat detection in real time',
                'Quarantine-first approach for unknown file types',
                'Complementing antivirus with behavioral analysis',
              ],
              recommendedForKo: [
                '실시간 제로데이 및 고급 위협 탐지',
                '미확인 파일 유형에 대한 격리 우선 접근',
                '행위 분석을 통한 안티바이러스 보완',
              ],
              securityCapabilities: [
                'AI/ML-powered file analysis',
                'Zero-day threat quarantine',
                'Patient zero detection',
                'Inline and out-of-band analysis',
                'Ransomware and APT detection',
              ],
              specs: {
                'Deployment': 'Cloud-native (no appliance)',
                'Analysis': 'AI/ML-powered behavioral analysis',
                'Mode': 'Inline quarantine before delivery',
                'Threat Types': 'Zero-day, ransomware, APT, polymorphic malware',
                'Integration': 'Feeds threat intel back to ZIA inline engine',
              },
              children: [],
            },
            {
              nodeId: 'zscaler-zia-data-protection',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'ZIA Data Protection',
              nameKo: 'ZIA 데이터 보호',
              description:
                'Inline DLP and CASB module protecting data in motion across web, SaaS, and email channels with EDM, IDM, and OCR',
              descriptionKo:
                '웹, SaaS, 이메일 채널 전반에서 EDM, IDM, OCR을 활용해 이동 중인 데이터를 보호하는 인라인 DLP 및 CASB 모듈',
              sourceUrl: 'https://www.zscaler.com/products/zscaler-internet-access',
              infraNodeTypes: ['dlp', 'casb'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Cloud Data Protection / Inline DLP + CASB',
              architectureRoleKo: '클라우드 데이터 보호 / 인라인 DLP + CASB',
              recommendedFor: [
                'Protecting sensitive data across all cloud channels',
                'Shadow IT discovery and SaaS risk management',
                'Compliance enforcement for PII, PHI, and financial data',
              ],
              recommendedForKo: [
                '모든 클라우드 채널에서 민감 데이터 보호',
                '섀도우 IT 발견 및 SaaS 리스크 관리',
                'PII, PHI, 금융 데이터에 대한 컴플라이언스 적용',
              ],
              securityCapabilities: [
                'Exact Data Match (EDM)',
                'Indexed Document Matching (IDM)',
                'Optical Character Recognition (OCR)',
                'ML-powered data classification',
                'Inline and API-based CASB',
                'Shadow IT discovery',
                'SaaS tenant restrictions',
              ],
              specs: {
                'Deployment': 'Cloud-native (no appliance)',
                'DLP Methods': 'EDM, IDM, OCR, ML classification',
                'CASB Modes': 'Inline (forward proxy) and API (out-of-band)',
                'Channels': 'Web, email, SaaS, endpoint, BYOD',
                'Compliance': 'PII, PHI, PCI-DSS, GDPR, HIPAA',
              },
              children: [],
            },
            {
              nodeId: 'zscaler-zia-browser-isolation',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'ZIA Browser Isolation',
              nameKo: 'ZIA 브라우저 격리',
              description:
                'AI-powered remote browser isolation streaming pixel-rendered content to endpoints, preventing web-based threats from reaching user devices',
              descriptionKo:
                '픽셀 렌더링된 콘텐츠를 엔드포인트에 스트리밍하는 AI 기반 원격 브라우저 격리로 웹 기반 위협이 사용자 디바이스에 도달하는 것을 방지',
              sourceUrl: 'https://www.zscaler.com/products/zscaler-internet-access',
              infraNodeTypes: ['sase-gateway'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Cloud Remote Browser Isolation (RBI)',
              architectureRoleKo: '클라우드 원격 브라우저 격리 (RBI)',
              recommendedFor: [
                'Isolating risky web browsing from endpoints',
                'Secure access to uncategorized or suspicious websites',
                'BYOD and unmanaged device web access protection',
              ],
              recommendedForKo: [
                '엔드포인트로부터 위험한 웹 브라우징 격리',
                '미분류 또는 의심스러운 웹사이트에 대한 안전한 접속',
                'BYOD 및 비관리 디바이스 웹 접속 보호',
              ],
              securityCapabilities: [
                'Remote browser isolation (pixel streaming)',
                'Document and file isolation',
                'Clipboard control',
                'Upload/download restrictions',
                'Near-native user experience',
              ],
              specs: {
                'Deployment': 'Cloud-native (no appliance)',
                'Rendering': 'Pixel-based streaming',
                'User Experience': 'Near-native browsing experience',
                'Integration': 'Integrated with ZIA SWG policies',
                'Controls': 'Clipboard, upload, download, print restrictions',
              },
              children: [],
            },
          ],
        },

        // ── Zscaler Private Access (ZPA) ──
        {
          nodeId: 'zscaler-zpa',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Zscaler Private Access (ZPA)',
          nameKo: 'Zscaler 프라이빗 액세스 (ZPA)',
          description:
            'The world\'s most deployed ZTNA solution providing seamless zero trust connectivity with AI-powered user-to-app segmentation, replacing legacy VPNs',
          descriptionKo:
            'AI 기반 사용자-앱 세그멘테이션으로 원활한 제로 트러스트 연결을 제공하며 레거시 VPN을 대체하는 세계에서 가장 많이 배포된 ZTNA 솔루션',
          sourceUrl: 'https://www.zscaler.com/products/zscaler-private-access',
          infraNodeTypes: ['ztna-broker', 'vpn-gateway'],
          architectureRole: 'Zero Trust Network Access Broker',
          architectureRoleKo: '제로 트러스트 네트워크 액세스 브로커',
          recommendedFor: [
            'Replacing legacy VPN infrastructure with zero trust app access',
            'Secure access to private applications without network-level access',
            'Hybrid and multi-cloud application access for remote workforce',
            'Reducing lateral movement risk by eliminating network exposure',
            'Partner and third-party extranet application access',
          ],
          recommendedForKo: [
            '레거시 VPN 인프라를 제로 트러스트 앱 접속으로 대체',
            '네트워크 수준 접속 없이 프라이빗 애플리케이션에 안전하게 접속',
            '원격 인력을 위한 하이브리드 및 멀티클라우드 애플리케이션 접속',
            '네트워크 노출 제거로 횡적 이동 위험 감소',
            '파트너 및 서드파티 엑스트라넷 애플리케이션 접속',
          ],
          supportedProtocols: [
            'HTTPS', 'TLS 1.2/1.3', 'TCP (all ports)',
            'UDP (all ports)', 'RDP', 'SSH', 'VNC',
            'SAML 2.0', 'SCIM', 'OIDC',
          ],
          haFeatures: [
            '99.999% uptime SLA',
            'Active-active cloud broker architecture',
            'Private Service Edge for local survivability',
            'Automatic app connector failover',
            'Business continuity during cloud outages',
          ],
          securityCapabilities: [
            'Inside-out connectivity (no inbound ports)',
            'AI-powered app segmentation',
            'Per-session micro-tunnels',
            'User-to-app isolation (no network access)',
            'AppProtection (inline L7 inspection)',
            'Advanced threat protection (ransomware, zero-day)',
            'Identity and context-based access policies',
          ],
          children: [
            {
              nodeId: 'zscaler-zpa-access',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'ZPA Application Access',
              nameKo: 'ZPA 애플리케이션 액세스',
              description:
                'Core ZTNA module brokering direct user-to-app connections without network access, using AI-powered app discovery and segmentation',
              descriptionKo:
                'AI 기반 앱 검색 및 세그멘테이션을 사용하여 네트워크 접속 없이 직접 사용자-앱 연결을 중개하는 핵심 ZTNA 모듈',
              sourceUrl: 'https://www.zscaler.com/products/zscaler-private-access',
              infraNodeTypes: ['ztna-broker'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Zero Trust Application Broker',
              architectureRoleKo: '제로 트러스트 애플리케이션 브로커',
              recommendedFor: [
                'Direct user-to-app connectivity replacing VPN tunnels',
                'AI-powered application discovery and automatic segmentation',
                'Hybrid and multi-cloud private application access',
              ],
              recommendedForKo: [
                'VPN 터널을 대체하는 직접 사용자-앱 연결',
                'AI 기반 애플리케이션 검색 및 자동 세그멘테이션',
                '하이브리드 및 멀티클라우드 프라이빗 애플리케이션 접속',
              ],
              securityCapabilities: [
                'Inside-out connectivity (zero inbound ports)',
                'AI-powered app discovery and segmentation',
                'Identity-based micro-segmentation',
                'Context-aware access policies',
                'Per-session micro-tunnels',
              ],
              specs: {
                'Deployment': 'Cloud-native (no appliance)',
                'Architecture': 'Broker-based inside-out connectivity',
                'Segmentation': 'AI-powered user-to-app segmentation',
                'Protocols': 'TCP/UDP all ports, RDP, SSH, VNC',
                'Identity': 'SAML 2.0, OIDC, SCIM integration',
              },
              children: [],
            },
            {
              nodeId: 'zscaler-zpa-appprotection',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'ZPA AppProtection',
              nameKo: 'ZPA 앱프로텍션',
              description:
                'Inline Layer 7 application security inspecting traffic to private apps, protecting against web attacks and identity-based threats',
              descriptionKo:
                '프라이빗 앱으로의 트래픽을 검사하여 웹 공격 및 ID 기반 위협으로부터 보호하는 인라인 L7 애플리케이션 보안',
              sourceUrl: 'https://www.zscaler.com/products/zscaler-private-access',
              infraNodeTypes: ['ztna-broker', 'waf'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Inline Application Security for Private Apps',
              architectureRoleKo: '프라이빗 앱을 위한 인라인 애플리케이션 보안',
              recommendedFor: [
                'Protecting private web applications from OWASP Top 10 attacks',
                'Inline Layer 7 inspection for private application traffic',
                'Identity-based threat detection for internal applications',
              ],
              recommendedForKo: [
                'OWASP Top 10 공격으로부터 프라이빗 웹 애플리케이션 보호',
                '프라이빗 애플리케이션 트래픽에 대한 인라인 L7 검사',
                '내부 애플리케이션에 대한 ID 기반 위협 탐지',
              ],
              securityCapabilities: [
                'Layer 7 inline traffic inspection',
                'Web attack protection (SQLi, XSS, CSRF)',
                'Identity attack detection',
                'Cloud-native proxy architecture',
                'Zero-day and ransomware prevention',
              ],
              specs: {
                'Deployment': 'Cloud-native (no appliance)',
                'Inspection': 'Inline Layer 7 (cloud proxy)',
                'Protection': 'OWASP Top 10, identity attacks, zero-day',
                'Architecture': 'Integrated with ZPA broker',
                'Mode': 'Always-on inline inspection',
              },
              children: [],
            },
            {
              nodeId: 'zscaler-zpa-private-service-edge',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'ZPA Private Service Edge',
              nameKo: 'ZPA 프라이빗 서비스 에지',
              description:
                'On-premises ZTNA broker for local survivability, enforcing zero trust policies locally when cloud connectivity is unavailable',
              descriptionKo:
                '클라우드 연결이 불가능할 때 로컬에서 제로 트러스트 정책을 적용하는 온프레미스 ZTNA 브로커',
              sourceUrl: 'https://www.zscaler.com/products/zscaler-private-access',
              infraNodeTypes: ['ztna-broker'],
              lifecycle: 'active',
              formFactor: 'virtual',
              licensingModel: 'subscription',
              architectureRole: 'On-Premises ZTNA Broker / Local Survivability',
              architectureRoleKo: '온프레미스 ZTNA 브로커 / 로컬 생존성',
              recommendedFor: [
                'On-premises ZTNA enforcement for data sovereignty requirements',
                'Local survivability when cloud connectivity is disrupted',
                'Low-latency access to on-premises applications',
              ],
              recommendedForKo: [
                '데이터 주권 요구사항을 위한 온프레미스 ZTNA 적용',
                '클라우드 연결 중단 시 로컬 생존성 보장',
                '온프레미스 애플리케이션에 대한 저지연 접속',
              ],
              securityCapabilities: [
                'Local ZTNA policy enforcement',
                'Inside-out connectivity',
                'Identity-based access control',
                'Automatic sync with cloud policies',
              ],
              specs: {
                'Deployment': 'Virtual appliance (on-premises)',
                'Architecture': 'Local ZTNA broker with cloud sync',
                'Survivability': 'Continues operation during cloud outages',
                'Form Factor': 'VM on ESXi, KVM, Hyper-V, or public cloud',
                'Policy Sync': 'Automatic bidirectional sync with ZPA cloud',
              },
              children: [],
            },
          ],
        },

        // ── Zscaler Digital Experience (ZDX) ──
        {
          nodeId: 'zscaler-zdx',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Zscaler Digital Experience (ZDX)',
          nameKo: 'Zscaler 디지털 경험 (ZDX)',
          description:
            'End-to-end digital experience monitoring platform providing AI-powered root cause analysis across devices, networks, and applications',
          descriptionKo:
            '디바이스, 네트워크, 애플리케이션 전반에서 AI 기반 근본 원인 분석을 제공하는 엔드투엔드 디지털 경험 모니터링 플랫폼',
          sourceUrl: 'https://www.zscaler.com/products/zscaler-digital-experience',
          infraNodeTypes: ['prometheus', 'grafana'],
          architectureRole: 'Digital Experience Monitoring (DEM)',
          architectureRoleKo: '디지털 경험 모니터링 (DEM)',
          recommendedFor: [
            'Monitoring end-user digital experience across the entire service delivery path',
            'AI-powered root cause analysis for performance issues',
            'UCaaS monitoring for Teams, Zoom, and Webex',
            'ISP performance and network path visibility',
          ],
          recommendedForKo: [
            '전체 서비스 제공 경로에서 최종 사용자 디지털 경험 모니터링',
            '성능 문제에 대한 AI 기반 근본 원인 분석',
            'Teams, Zoom, Webex에 대한 UCaaS 모니터링',
            'ISP 성능 및 네트워크 경로 가시성',
          ],
          children: [
            {
              nodeId: 'zscaler-zdx-monitoring',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'ZDX Monitoring',
              nameKo: 'ZDX 모니터링',
              description:
                'End-to-end digital experience monitoring tracking performance across devices, Wi-Fi, networks, and applications with 52% faster MTTR',
              descriptionKo:
                '디바이스, Wi-Fi, 네트워크, 애플리케이션 전반의 성능을 추적하여 MTTR을 52% 단축하는 엔드투엔드 디지털 경험 모니터링',
              sourceUrl: 'https://www.zscaler.com/products/zscaler-digital-experience',
              infraNodeTypes: ['prometheus'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Digital Experience Monitoring',
              architectureRoleKo: '디지털 경험 모니터링',
              recommendedFor: [
                'End-to-end user experience monitoring across the service delivery path',
                'ISP and network path performance tracking',
                'UCaaS quality monitoring (Teams, Zoom, Webex)',
              ],
              recommendedForKo: [
                '서비스 제공 경로 전반의 엔드투엔드 사용자 경험 모니터링',
                'ISP 및 네트워크 경로 성능 추적',
                'UCaaS 품질 모니터링 (Teams, Zoom, Webex)',
              ],
              specs: {
                'Deployment': 'Cloud-native (Client Connector agent)',
                'MTTR Improvement': '52% faster mean time to resolution',
                'Downtime Reduction': '20% fewer work hours lost',
                'Monitoring Scope': 'Device, Wi-Fi, network, application',
                'UCaaS Support': 'Microsoft Teams, Zoom, Webex',
              },
              children: [],
            },
            {
              nodeId: 'zscaler-zdx-copilot',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'ZDX Copilot',
              nameKo: 'ZDX 코파일럿',
              description:
                'AI-powered assistant enabling natural language investigation of performance issues with automated root cause analysis and self-service guidance',
              descriptionKo:
                '자동화된 근본 원인 분석과 셀프 서비스 가이드를 통해 성능 문제를 자연어로 조사할 수 있는 AI 기반 어시스턴트',
              sourceUrl: 'https://www.zscaler.com/products/zscaler-digital-experience',
              infraNodeTypes: ['grafana'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'AI-Powered IT Operations Assistant',
              architectureRoleKo: 'AI 기반 IT 운영 어시스턴트',
              recommendedFor: [
                'Natural language investigation of digital experience issues',
                'Automated root cause isolation across devices, networks, and apps',
                'Self-service IT troubleshooting for end users',
              ],
              recommendedForKo: [
                '디지털 경험 문제의 자연어 기반 조사',
                '디바이스, 네트워크, 앱 전반의 자동화된 근본 원인 분리',
                '최종 사용자를 위한 셀프 서비스 IT 문제 해결',
              ],
              specs: {
                'Deployment': 'Cloud-native (integrated with ZDX)',
                'AI Engine': 'Natural language query processing',
                'Root Cause Analysis': 'Automated multi-layer isolation',
                'Self-Service': 'User-facing guidance for controllable issues',
                'Integration': 'ServiceNow, API-based ticket automation',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 2. Zscaler for Workloads
    // =====================================================================
    {
      nodeId: 'zscaler-for-workloads',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Zscaler for Workloads',
      nameKo: '워크로드를 위한 Zscaler',
      description:
        'Zero trust security platform for cloud workloads providing secure connectivity, posture management, and microsegmentation',
      descriptionKo:
        '안전한 연결, 보안 태세 관리, 마이크로세그멘테이션을 제공하는 클라우드 워크로드용 제로 트러스트 보안 플랫폼',
      sourceUrl: 'https://www.zscaler.com/products',
      infraNodeTypes: ['sase-gateway'],
      children: [
        // ── Workload Communications ──
        {
          nodeId: 'zscaler-workload-communications',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Workload Communications',
          nameKo: '워크로드 커뮤니케이션',
          description:
            'Zero trust connectivity for cloud workloads securing east-west and egress traffic across multi-cloud environments',
          descriptionKo:
            '멀티클라우드 환경에서 동-서 및 이그레스 트래픽을 보호하는 클라우드 워크로드용 제로 트러스트 연결',
          sourceUrl: 'https://www.zscaler.com/products',
          infraNodeTypes: ['sase-gateway'],
          architectureRole: 'Cloud Workload Zero Trust Connectivity',
          architectureRoleKo: '클라우드 워크로드 제로 트러스트 연결',
          recommendedFor: [
            'Securing workload-to-workload communication in multi-cloud',
            'Replacing traditional east-west firewalls in cloud environments',
            'Zero trust egress control for cloud workloads',
          ],
          recommendedForKo: [
            '멀티클라우드에서 워크로드 간 통신 보안',
            '클라우드 환경의 기존 동-서 방화벽 대체',
            '클라우드 워크로드를 위한 제로 트러스트 이그레스 제어',
          ],
          children: [
            {
              nodeId: 'zscaler-workload-comms',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Zscaler Workload Communications',
              nameKo: 'Zscaler 워크로드 커뮤니케이션',
              description:
                'Cloud-native zero trust connectivity for workloads, securing ingress, egress, and east-west traffic without network-level access',
              descriptionKo:
                '네트워크 수준 접속 없이 인그레스, 이그레스, 동-서 트래픽을 보호하는 클라우드 네이티브 워크로드용 제로 트러스트 연결',
              sourceUrl: 'https://www.zscaler.com/products',
              infraNodeTypes: ['sase-gateway'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Cloud Workload Security Gateway',
              architectureRoleKo: '클라우드 워크로드 보안 게이트웨이',
              recommendedFor: [
                'Multi-cloud workload connectivity with inline security',
                'Eliminating east-west attack surface in cloud environments',
                'Secure egress for cloud workloads without NAT gateways',
              ],
              recommendedForKo: [
                '인라인 보안이 적용된 멀티클라우드 워크로드 연결',
                '클라우드 환경에서 동-서 공격 표면 제거',
                'NAT 게이트웨이 없이 클라우드 워크로드의 안전한 이그레스',
              ],
              securityCapabilities: [
                'Zero trust workload-to-workload segmentation',
                'Inline traffic inspection',
                'Identity-based workload policies',
                'Cloud egress security',
              ],
              specs: {
                'Deployment': 'Cloud-native (agentless and agent-based)',
                'Cloud Platforms': 'AWS, Azure, GCP',
                'Traffic Types': 'Ingress, egress, east-west',
                'Architecture': 'Zero trust proxy for workloads',
                'Integration': 'Kubernetes, VMs, serverless',
              },
              children: [],
            },
          ],
        },

        // ── Posture Control ──
        {
          nodeId: 'zscaler-posture-control',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Posture Control',
          nameKo: '포스처 컨트롤',
          description:
            'Cloud-Native Application Protection Platform (CNAPP) providing CSPM, CIEM, and IaC scanning for multi-cloud environments',
          descriptionKo:
            '멀티클라우드 환경을 위한 CSPM, CIEM, IaC 스캐닝을 제공하는 클라우드 네이티브 애플리케이션 보호 플랫폼(CNAPP)',
          sourceUrl: 'https://www.zscaler.com/products',
          infraNodeTypes: ['sase-gateway'],
          architectureRole: 'Cloud Security Posture Management (CNAPP)',
          architectureRoleKo: '클라우드 보안 태세 관리 (CNAPP)',
          recommendedFor: [
            'Multi-cloud security posture monitoring and remediation',
            'Cloud identity and entitlement management (CIEM)',
            'Infrastructure-as-code security scanning',
          ],
          recommendedForKo: [
            '멀티클라우드 보안 태세 모니터링 및 교정',
            '클라우드 ID 및 권한 관리 (CIEM)',
            'IaC(Infrastructure-as-Code) 보안 스캐닝',
          ],
          children: [
            {
              nodeId: 'zscaler-posture-control-cnapp',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Zscaler Posture Control',
              nameKo: 'Zscaler 포스처 컨트롤',
              description:
                'Unified CNAPP platform combining CSPM, CIEM, IaC scanning, and vulnerability management for comprehensive cloud security posture',
              descriptionKo:
                'CSPM, CIEM, IaC 스캐닝, 취약점 관리를 결합한 통합 CNAPP 플랫폼으로 포괄적인 클라우드 보안 태세 관리',
              sourceUrl: 'https://www.zscaler.com/products',
              infraNodeTypes: ['sase-gateway'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'CNAPP / CSPM / CIEM',
              architectureRoleKo: 'CNAPP / CSPM / CIEM',
              recommendedFor: [
                'Cloud misconfiguration detection and auto-remediation',
                'Excessive cloud permission and entitlement management',
                'Infrastructure-as-code security scanning in CI/CD pipelines',
              ],
              recommendedForKo: [
                '클라우드 잘못된 구성 탐지 및 자동 교정',
                '과도한 클라우드 권한 및 자격 관리',
                'CI/CD 파이프라인의 IaC 보안 스캐닝',
              ],
              securityCapabilities: [
                'Cloud Security Posture Management (CSPM)',
                'Cloud Infrastructure Entitlement Management (CIEM)',
                'IaC security scanning (Terraform, CloudFormation)',
                'Vulnerability management',
                'Compliance benchmarking (CIS, SOC 2, PCI-DSS)',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Cloud Platforms': 'AWS, Azure, GCP',
                'Capabilities': 'CSPM, CIEM, IaC scanning, vulnerability management',
                'Compliance': 'CIS Benchmarks, SOC 2, PCI-DSS, HIPAA, GDPR',
                'Integration': 'CI/CD pipelines, Terraform, CloudFormation',
              },
              children: [],
            },
          ],
        },

        // ── Workload Segmentation ──
        {
          nodeId: 'zscaler-workload-segmentation',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Workload Segmentation',
          nameKo: '워크로드 세그멘테이션',
          description:
            'Identity-based microsegmentation for cloud and data center workloads, eliminating lateral movement without network changes',
          descriptionKo:
            '네트워크 변경 없이 횡적 이동을 제거하는 클라우드 및 데이터센터 워크로드용 ID 기반 마이크로세그멘테이션',
          sourceUrl: 'https://www.zscaler.com/products',
          infraNodeTypes: ['sase-gateway'],
          architectureRole: 'Workload Microsegmentation',
          architectureRoleKo: '워크로드 마이크로세그멘테이션',
          recommendedFor: [
            'Microsegmentation without network changes or firewall rules',
            'Eliminating lateral movement in data center and cloud workloads',
            'Identity-based workload isolation and zero trust enforcement',
          ],
          recommendedForKo: [
            '네트워크 변경이나 방화벽 규칙 없는 마이크로세그멘테이션',
            '데이터센터 및 클라우드 워크로드에서 횡적 이동 제거',
            'ID 기반 워크로드 격리 및 제로 트러스트 적용',
          ],
          children: [
            {
              nodeId: 'zscaler-workload-seg',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Zscaler Workload Segmentation',
              nameKo: 'Zscaler 워크로드 세그멘테이션',
              description:
                'Software-based microsegmentation using cryptographic identity to isolate workloads, requiring no network changes or firewall rules',
              descriptionKo:
                '암호화 ID를 사용하여 워크로드를 격리하며 네트워크 변경이나 방화벽 규칙이 필요 없는 소프트웨어 기반 마이크로세그멘테이션',
              sourceUrl: 'https://www.zscaler.com/products',
              infraNodeTypes: ['sase-gateway'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Identity-Based Microsegmentation',
              architectureRoleKo: 'ID 기반 마이크로세그멘테이션',
              recommendedFor: [
                'Microsegmentation for hybrid cloud and data center workloads',
                'Eliminating lateral movement without network redesign',
                'Cryptographic identity-based workload-to-workload policies',
              ],
              recommendedForKo: [
                '하이브리드 클라우드 및 데이터센터 워크로드를 위한 마이크로세그멘테이션',
                '네트워크 재설계 없이 횡적 이동 제거',
                '암호화 ID 기반 워크로드 간 정책',
              ],
              securityCapabilities: [
                'Cryptographic workload identity',
                'Software-defined microsegmentation',
                'Application dependency mapping',
                'Policy simulation before enforcement',
                'No network changes required',
              ],
              specs: {
                'Deployment': 'Software agent on workloads',
                'Identity': 'Cryptographic workload identity',
                'Platforms': 'Bare metal, VMs, containers, Kubernetes',
                'Mapping': 'Automatic application dependency discovery',
                'Enforcement': 'Policy simulation and real-time enforcement',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 3. Zscaler for IoT/OT
    // =====================================================================
    {
      nodeId: 'zscaler-for-iot-ot',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Zscaler for IoT/OT',
      nameKo: 'IoT/OT를 위한 Zscaler',
      description:
        'AI-powered IoT/OT security platform providing device visibility, classification, and secure privileged remote access for industrial environments',
      descriptionKo:
        '산업 환경을 위한 디바이스 가시성, 분류, 안전한 특권 원격 접속을 제공하는 AI 기반 IoT/OT 보안 플랫폼',
      sourceUrl: 'https://www.zscaler.com/products',
      infraNodeTypes: ['nac', 'ztna-broker'],
      children: [
        // ── IoT Device Visibility ──
        {
          nodeId: 'zscaler-iot-visibility',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'IoT Device Visibility',
          nameKo: 'IoT 디바이스 가시성',
          description:
            'AI-powered IoT device discovery, classification, and risk assessment without deploying additional sensors or agents',
          descriptionKo:
            '추가 센서나 에이전트 배포 없이 AI 기반 IoT 디바이스 검색, 분류, 위험 평가',
          sourceUrl: 'https://www.zscaler.com/products',
          infraNodeTypes: ['nac'],
          architectureRole: 'IoT Device Discovery & Classification',
          architectureRoleKo: 'IoT 디바이스 검색 및 분류',
          recommendedFor: [
            'IoT device inventory and shadow IoT discovery',
            'Device risk assessment and classification',
            'IoT traffic segmentation policy enforcement',
          ],
          recommendedForKo: [
            'IoT 디바이스 인벤토리 및 섀도우 IoT 발견',
            '디바이스 위험 평가 및 분류',
            'IoT 트래픽 세그멘테이션 정책 적용',
          ],
          children: [
            {
              nodeId: 'zscaler-iot-device-visibility',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Zscaler IoT Device Visibility',
              nameKo: 'Zscaler IoT 디바이스 가시성',
              description:
                'AI/ML-powered device fingerprinting and classification discovering all IoT devices without deploying sensors, with automatic segmentation policy recommendations',
              descriptionKo:
                '센서 배포 없이 모든 IoT 디바이스를 검색하고 자동 세그멘테이션 정책 권장사항을 제공하는 AI/ML 기반 디바이스 핑거프린팅 및 분류',
              sourceUrl: 'https://www.zscaler.com/products',
              infraNodeTypes: ['nac'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'IoT/OT Device Visibility & Classification',
              architectureRoleKo: 'IoT/OT 디바이스 가시성 및 분류',
              recommendedFor: [
                'Discovering and classifying all IoT devices on the network',
                'Shadow IoT detection without additional sensors',
                'Automated IoT segmentation policy recommendations',
              ],
              recommendedForKo: [
                '네트워크의 모든 IoT 디바이스 검색 및 분류',
                '추가 센서 없이 섀도우 IoT 탐지',
                '자동화된 IoT 세그멘테이션 정책 권장',
              ],
              securityCapabilities: [
                'AI/ML device fingerprinting',
                'Automatic device classification',
                'Risk scoring per device',
                'Segmentation policy recommendations',
                'Shadow IoT discovery',
              ],
              specs: {
                'Deployment': 'Cloud-native (no sensors required)',
                'Discovery': 'AI/ML-powered device fingerprinting',
                'Classification': 'Automatic device type classification',
                'Risk Assessment': 'Per-device risk scoring',
                'Integration': 'Integrated with ZIA and ZPA policies',
              },
              children: [],
            },
          ],
        },

        // ── Privileged Remote Access ──
        {
          nodeId: 'zscaler-privileged-remote-access',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Privileged Remote Access',
          nameKo: '특권 원격 접속',
          description:
            'Zero trust privileged access for OT/IoT environments enabling secure remote support for industrial systems without VPN or jump servers',
          descriptionKo:
            'VPN이나 점프 서버 없이 산업 시스템에 대한 안전한 원격 지원을 가능하게 하는 OT/IoT 환경을 위한 제로 트러스트 특권 접속',
          sourceUrl: 'https://www.zscaler.com/products',
          infraNodeTypes: ['ztna-broker', 'vpn-gateway'],
          architectureRole: 'Privileged Remote Access for OT/IoT',
          architectureRoleKo: 'OT/IoT를 위한 특권 원격 접속',
          recommendedFor: [
            'Secure remote access to OT/ICS/SCADA systems',
            'Replacing VPN and jump servers for privileged sessions',
            'Third-party vendor access to industrial systems',
          ],
          recommendedForKo: [
            'OT/ICS/SCADA 시스템에 대한 안전한 원격 접속',
            '특권 세션을 위한 VPN 및 점프 서버 대체',
            '산업 시스템에 대한 서드파티 벤더 접속',
          ],
          children: [
            {
              nodeId: 'zscaler-privileged-access',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Zscaler Privileged Remote Access',
              nameKo: 'Zscaler 특권 원격 접속',
              description:
                'Browser-based zero trust privileged access for RDP, SSH, and VNC sessions to OT/IoT systems with session recording and least-privilege controls',
              descriptionKo:
                '세션 녹화 및 최소 권한 제어가 적용된 OT/IoT 시스템에 대한 RDP, SSH, VNC 세션을 위한 브라우저 기반 제로 트러스트 특권 접속',
              sourceUrl: 'https://www.zscaler.com/products',
              infraNodeTypes: ['ztna-broker', 'vpn-gateway'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Zero Trust Privileged Access for OT/IoT',
              architectureRoleKo: 'OT/IoT를 위한 제로 트러스트 특권 접속',
              recommendedFor: [
                'Secure remote access to SCADA, ICS, and OT systems',
                'Session recording and audit trail for privileged access',
                'Third-party vendor access with time-bound, least-privilege controls',
              ],
              recommendedForKo: [
                'SCADA, ICS, OT 시스템에 대한 안전한 원격 접속',
                '특권 접속에 대한 세션 녹화 및 감사 추적',
                '시간 제한, 최소 권한 제어가 적용된 서드파티 벤더 접속',
              ],
              securityCapabilities: [
                'Browser-based privileged access (no VPN)',
                'Session recording and playback',
                'Least-privilege and time-bound access',
                'Multi-factor authentication',
                'Approval workflows',
              ],
              specs: {
                'Deployment': 'Cloud-native (browser-based)',
                'Protocols': 'RDP, SSH, VNC',
                'Session Recording': 'Full session recording and playback',
                'Access Control': 'Time-bound, least-privilege, MFA',
                'Architecture': 'Inside-out connectivity (no inbound ports)',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 4. Zscaler for Data
    // =====================================================================
    {
      nodeId: 'zscaler-for-data',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Zscaler for Data',
      nameKo: '데이터를 위한 Zscaler',
      description:
        'Comprehensive data protection platform with unified DLP, CASB, and deception technology for detecting and preventing data loss and insider threats',
      descriptionKo:
        '데이터 유출 및 내부자 위협을 탐지하고 방지하기 위한 통합 DLP, CASB, 디셉션 기술이 포함된 포괄적인 데이터 보호 플랫폼',
      sourceUrl: 'https://www.zscaler.com/products',
      infraNodeTypes: ['dlp', 'casb'],
      children: [
        // ── Data Protection ──
        {
          nodeId: 'zscaler-data-protection',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Data Protection',
          nameKo: '데이터 보호',
          description:
            'Unified data protection combining DLP and CASB to protect sensitive data across web, email, SaaS, endpoint, and BYOD channels',
          descriptionKo:
            '웹, 이메일, SaaS, 엔드포인트, BYOD 채널 전반에서 민감 데이터를 보호하기 위해 DLP와 CASB를 결합한 통합 데이터 보호',
          sourceUrl: 'https://www.zscaler.com/products',
          infraNodeTypes: ['dlp', 'casb'],
          architectureRole: 'Cloud Data Protection (DLP + CASB)',
          architectureRoleKo: '클라우드 데이터 보호 (DLP + CASB)',
          recommendedFor: [
            'Centralized DLP policy across all data channels',
            'Shadow IT discovery and SaaS application governance',
            'Compliance enforcement for regulated data (PII, PHI, PCI)',
          ],
          recommendedForKo: [
            '모든 데이터 채널에 대한 중앙 집중식 DLP 정책',
            '섀도우 IT 발견 및 SaaS 애플리케이션 거버넌스',
            '규제 데이터 (PII, PHI, PCI)에 대한 컴플라이언스 적용',
          ],
          children: [
            {
              nodeId: 'zscaler-dlp',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Zscaler DLP',
              nameKo: 'Zscaler DLP',
              description:
                'Cloud-native data loss prevention with Exact Data Match, Indexed Document Matching, OCR, and ML-powered classification across all channels',
              descriptionKo:
                '모든 채널에서 정확한 데이터 매칭, 인덱스 문서 매칭, OCR, ML 기반 분류를 제공하는 클라우드 네이티브 데이터 유출 방지',
              sourceUrl: 'https://www.zscaler.com/products/data-loss-prevention',
              infraNodeTypes: ['dlp'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Cloud Data Loss Prevention',
              architectureRoleKo: '클라우드 데이터 유출 방지',
              recommendedFor: [
                'Unified DLP policy across web, email, endpoint, SaaS, and cloud',
                'ML-powered sensitive data discovery and classification',
                'Exact Data Match for PII/PHI with minimal false positives',
              ],
              recommendedForKo: [
                '웹, 이메일, 엔드포인트, SaaS, 클라우드 전반의 통합 DLP 정책',
                'ML 기반 민감 데이터 검색 및 분류',
                '최소 오탐률의 PII/PHI 정확한 데이터 매칭',
              ],
              securityCapabilities: [
                'Exact Data Match (EDM)',
                'Indexed Document Matching (IDM)',
                'Optical Character Recognition (OCR)',
                'ML-powered data classification',
                'Endpoint DLP',
                'Email DLP',
                'BYOD data protection',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Detection Methods': 'EDM, IDM, OCR, ML classification, regex',
                'Channels': 'Web, email, SaaS, endpoint, BYOD, private apps',
                'Data Types': 'PII, PHI, PCI, intellectual property',
                'Compliance': 'GDPR, HIPAA, PCI-DSS, SOX, GLBA',
              },
              children: [],
            },
            {
              nodeId: 'zscaler-casb',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Zscaler CASB',
              nameKo: 'Zscaler CASB',
              description:
                'Multi-mode Cloud Access Security Broker providing inline and API-based SaaS security, shadow IT discovery, and tenant restriction controls',
              descriptionKo:
                '인라인 및 API 기반 SaaS 보안, 섀도우 IT 발견, 테넌트 제한 제어를 제공하는 멀티모드 클라우드 접속 보안 브로커',
              sourceUrl: 'https://www.zscaler.com/products',
              infraNodeTypes: ['casb'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Cloud Access Security Broker (CASB)',
              architectureRoleKo: '클라우드 접속 보안 브로커 (CASB)',
              recommendedFor: [
                'SaaS application security and governance',
                'Shadow IT discovery and unsanctioned app control',
                'Tenant restriction and data sharing controls for SaaS',
              ],
              recommendedForKo: [
                'SaaS 애플리케이션 보안 및 거버넌스',
                '섀도우 IT 발견 및 비인가 앱 제어',
                'SaaS에 대한 테넌트 제한 및 데이터 공유 제어',
              ],
              securityCapabilities: [
                'Inline CASB (forward proxy)',
                'API-based CASB (out-of-band)',
                'Shadow IT discovery and risk scoring',
                'SaaS tenant restrictions',
                'Data sharing controls',
                'Malware detection in SaaS',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Modes': 'Inline (forward proxy) + API (out-of-band)',
                'SaaS Coverage': 'Thousands of SaaS applications',
                'Shadow IT': 'Automatic discovery and risk scoring',
                'Integration': 'API integration with major SaaS platforms',
              },
              children: [],
            },
          ],
        },

        // ── Deception Technology ──
        {
          nodeId: 'zscaler-deception',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Deception Technology',
          nameKo: '디셉션 기술',
          description:
            'Deception-based threat detection deploying realistic decoys across endpoints, networks, Active Directory, and cloud to detect advanced threats and lateral movement',
          descriptionKo:
            '엔드포인트, 네트워크, Active Directory, 클라우드 전반에 실제와 같은 미끼를 배포하여 고급 위협 및 횡적 이동을 탐지하는 디셉션 기반 위협 탐지',
          sourceUrl: 'https://www.zscaler.com/products/deception-technology',
          infraNodeTypes: ['ids-ips'],
          architectureRole: 'Deception-Based Threat Detection',
          architectureRoleKo: '디셉션 기반 위협 탐지',
          recommendedFor: [
            'Detecting lateral movement and insider threats with near-zero false positives',
            'Advanced persistent threat (APT) detection via decoys and honeypots',
            'Augmenting SIEM/SOAR with high-fidelity deception alerts',
          ],
          recommendedForKo: [
            '거의 제로 오탐률로 횡적 이동 및 내부자 위협 탐지',
            '미끼 및 허니팟을 통한 APT(지능형 지속 위협) 탐지',
            '고충실도 디셉션 알림으로 SIEM/SOAR 보강',
          ],
          children: [
            {
              nodeId: 'zscaler-deception-tech',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Zscaler Deception',
              nameKo: 'Zscaler 디셉션',
              description:
                'Enterprise deception platform deploying realistic decoy domains, databases, servers, credentials, and breadcrumbs to detect APTs, ransomware, and insider threats with near-zero false positives',
              descriptionKo:
                '실제와 같은 미끼 도메인, 데이터베이스, 서버, 자격 증명, 브레드크럼을 배포하여 거의 제로 오탐률로 APT, 랜섬웨어, 내부자 위협을 탐지하는 엔터프라이즈 디셉션 플랫폼',
              sourceUrl: 'https://www.zscaler.com/products/deception-technology',
              infraNodeTypes: ['ids-ips'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Deception-Based Threat Detection / Honeypot Platform',
              architectureRoleKo: '디셉션 기반 위협 탐지 / 허니팟 플랫폼',
              recommendedFor: [
                'Detecting advanced persistent threats with realistic decoys',
                'Lateral movement detection across endpoint, network, and AD',
                'Ransomware early detection with high-fidelity alerts',
              ],
              recommendedForKo: [
                '실제와 같은 미끼로 고급 지속 위협 탐지',
                '엔드포인트, 네트워크, AD 전반의 횡적 이동 탐지',
                '고충실도 알림을 통한 랜섬웨어 조기 탐지',
              ],
              securityCapabilities: [
                'Realistic decoy deployment (domains, DBs, servers, credentials)',
                'Endpoint breadcrumb lures',
                'Active Directory deception',
                'Cloud workload decoys',
                'IoT/OT device decoys',
                'Near-zero false positive alerts',
                'APT and ransomware detection',
                'Lateral movement interception',
              ],
              specs: {
                'Deployment': 'Cloud-managed, distributed decoys',
                'Decoy Types': 'Domains, databases, servers, credentials, files',
                'Coverage': 'Endpoints, network, Active Directory, cloud, IoT/OT',
                'Detection': 'APT, ransomware, insider threats, lateral movement',
                'False Positives': 'Near-zero (only real attackers trigger decoys)',
              },
              children: [],
            },
          ],
        },
      ],
    },
  ],
};
