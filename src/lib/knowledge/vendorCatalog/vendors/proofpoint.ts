/**
 * Proofpoint -- Full Product Catalog
 *
 * Hierarchical product tree covering Email Security, Threat Protection,
 * Information Protection, Security Awareness, and Compliance & Archiving.
 *
 * Data sourced from https://www.proofpoint.com/us/products
 * Last crawled: 2026-02-22
 */

import type { VendorCatalog } from '../types';

// ---------------------------------------------------------------------------
// Proofpoint Product Catalog
// ---------------------------------------------------------------------------

export const proofpointCatalog: VendorCatalog = {
  vendorId: 'proofpoint',
  vendorName: 'Proofpoint',
  vendorNameKo: '프루프포인트',
  headquarters: 'Sunnyvale, CA, USA',
  website: 'https://www.proofpoint.com',
  productPageUrl: 'https://www.proofpoint.com/us/products',
  depthStructure: ['category', 'product-line', 'module'],
  depthStructureKo: ['카테고리', '제품 라인', '모듈'],
  lastCrawled: '2026-02-22',
  crawlSource: 'https://www.proofpoint.com/us/products',
  stats: { totalProducts: 35, maxDepth: 2, categoriesCount: 5 },
  products: [
    // =====================================================================
    // 1. Email Security
    // =====================================================================
    {
      nodeId: 'proofpoint-email-security',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Email Security',
      nameKo: '이메일 보안',
      description:
        'Comprehensive email security platform using AI and global threat intelligence to block phishing, BEC, malware, and email fraud with gateway and API deployment options',
      descriptionKo:
        'AI와 글로벌 위협 인텔리전스를 활용하여 피싱, BEC, 악성코드, 이메일 사기를 차단하는 게이트웨이 및 API 배포 옵션을 갖춘 종합 이메일 보안 플랫폼',
      sourceUrl: 'https://www.proofpoint.com/us/products',
      infraNodeTypes: ['waf'],
      children: [
        // -- Proofpoint Email Protection --
        {
          nodeId: 'proofpoint-email-protection',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Proofpoint Email Protection',
          nameKo: 'Proofpoint 이메일 프로텍션',
          description:
            'Core email security gateway providing AI-powered threat detection, spam/malware filtering, and content inspection with API and SEG deployment models',
          descriptionKo:
            'AI 기반 위협 탐지, 스팸/악성코드 필터링, 콘텐츠 검사를 제공하는 API 및 SEG 배포 모델의 핵심 이메일 보안 게이트웨이',
          sourceUrl: 'https://www.proofpoint.com/us/products/email-security-and-protection',
          infraNodeTypes: ['waf'],
          architectureRole: 'Email Security Gateway / Secure Email Gateway',
          architectureRoleKo: '이메일 보안 게이트웨이 / 보안 이메일 게이트웨이',
          recommendedFor: [
            'Enterprise email protection replacing legacy SEG appliances',
            'Microsoft 365 and Google Workspace email security augmentation',
            'BEC and impersonation attack defense for executive communications',
            'Organizations requiring 99.99% threat detection SLA',
            'Hybrid deployment with both gateway and API integration',
          ],
          recommendedForKo: [
            '레거시 SEG 어플라이언스를 대체하는 엔터프라이즈 이메일 보호',
            'Microsoft 365 및 Google Workspace 이메일 보안 강화',
            '임원 커뮤니케이션을 위한 BEC 및 사칭 공격 방어',
            '99.99% 위협 탐지 SLA를 요구하는 조직',
            '게이트웨이 및 API 통합을 갖춘 하이브리드 배포',
          ],
          supportedProtocols: [
            'SMTP', 'SMTPS', 'TLS 1.2/1.3', 'DMARC', 'SPF', 'DKIM',
            'SAML 2.0', 'REST API', 'Microsoft Graph API',
          ],
          haFeatures: [
            'Cloud-native multi-tenant architecture',
            'Global data center redundancy',
            'Automatic failover and load balancing',
            '99.999% service uptime SLA',
          ],
          securityCapabilities: [
            'AI-powered advanced language model threat detection',
            'ML-based behavioral pattern analysis',
            'Relationship graph anomaly detection',
            'Computer vision for image/attachment analysis',
            'Predictive URL sandboxing',
            'BEC and impersonation detection',
            'TOAD/callback phishing detection',
            'QR code threat analysis',
            'Spam and graymail filtering',
            'Content inspection and DLP',
          ],
          children: [
            {
              nodeId: 'proofpoint-email-protection-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Proofpoint Core Email Protection',
              nameKo: 'Proofpoint 핵심 이메일 프로텍션',
              description:
                'Gateway email security with AI-driven spam filtering, malware detection, and content inspection processing over 3.4 trillion emails annually',
              descriptionKo:
                '연간 3.4조 개 이상의 이메일을 처리하는 AI 기반 스팸 필터링, 악성코드 탐지, 콘텐츠 검사를 갖춘 게이트웨이 이메일 보안',
              sourceUrl: 'https://www.proofpoint.com/us/products/email-security-and-protection',
              infraNodeTypes: ['waf'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Email Security Gateway',
              architectureRoleKo: '이메일 보안 게이트웨이',
              recommendedFor: [
                'Primary email threat prevention for enterprises',
                'Replacing on-premises email security appliances',
                'Augmenting Microsoft 365 native email security',
              ],
              recommendedForKo: [
                '엔터프라이즈 주요 이메일 위협 방지',
                '온프레미스 이메일 보안 어플라이언스 교체',
                'Microsoft 365 기본 이메일 보안 강화',
              ],
              securityCapabilities: [
                'AI/ML-powered threat detection',
                'Spam and graymail filtering',
                'Malware and ransomware blocking',
                'URL rewriting and click-time protection',
                'Attachment sandboxing',
              ],
              specs: {
                'Deployment': 'Cloud-native (API or SEG)',
                'Emails Processed': '3.4 trillion+ annually',
                'Threat Detection Rate': '99.99%',
                'AI Engines': 'NexusAI language models, ML, computer vision, relationship graph',
                'Integration': 'Microsoft 365, Google Workspace, SIEM/SOAR',
                'Fortune 100 Coverage': '85 of Fortune 100',
              },
              children: [],
            },
          ],
        },

        // -- Proofpoint Targeted Attack Protection (TAP) --
        {
          nodeId: 'proofpoint-tap',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Proofpoint Targeted Attack Protection (TAP)',
          nameKo: 'Proofpoint 표적 공격 방어 (TAP)',
          description:
            'Advanced threat sandbox platform providing URL defense, attachment defense, and predictive sandboxing to detect zero-day threats and advanced persistent threats',
          descriptionKo:
            '제로데이 위협 및 지능형 지속 위협을 탐지하기 위한 URL 방어, 첨부파일 방어, 예측 샌드박싱을 제공하는 고급 위협 샌드박스 플랫폼',
          sourceUrl: 'https://www.proofpoint.com/us/products/advanced-threat-protection',
          infraNodeTypes: ['waf'],
          architectureRole: 'Advanced Threat Protection / Email Sandbox',
          architectureRoleKo: '고급 위협 방어 / 이메일 샌드박스',
          recommendedFor: [
            'Zero-day and advanced persistent threat detection in email',
            'Executive and VIP targeted attack protection',
            'URL click-time defense for deferred phishing attacks',
            'Attachment sandboxing with evasion detection',
            'Threat intelligence integration with SOC workflows',
          ],
          recommendedForKo: [
            '이메일 내 제로데이 및 지능형 지속 위협 탐지',
            '임원 및 VIP 대상 표적 공격 보호',
            '지연된 피싱 공격에 대한 URL 클릭 시점 방어',
            '회피 탐지를 갖춘 첨부파일 샌드박싱',
            'SOC 워크플로우와 위협 인텔리전스 통합',
          ],
          supportedProtocols: [
            'SMTP', 'SMTPS', 'HTTP/HTTPS', 'TLS 1.2/1.3',
            'REST API', 'Syslog', 'SAML 2.0',
          ],
          haFeatures: [
            'Cloud-native sandbox infrastructure',
            'Multi-stage analysis pipeline',
            'Real-time and deferred analysis modes',
            'Global threat intelligence correlation',
          ],
          securityCapabilities: [
            'Predictive URL sandboxing',
            'Attachment sandboxing with evasion detection',
            'URL click-time rewriting and analysis',
            'Zero-day malware detection',
            'Ransomware and APT identification',
            'Credential phishing detection',
            'Polymorphic threat analysis',
            'Threat intelligence dashboard',
          ],
          children: [
            {
              nodeId: 'proofpoint-tap-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Proofpoint TAP Advanced Sandbox',
              nameKo: 'Proofpoint TAP 고급 샌드박스',
              description:
                'Multi-stage sandbox environment analyzing URLs and attachments with predictive techniques, evasion detection, and real-time threat intelligence feeds',
              descriptionKo:
                '예측 기술, 회피 탐지, 실시간 위협 인텔리전스 피드를 갖춘 URL 및 첨부파일을 분석하는 다단계 샌드박스 환경',
              sourceUrl: 'https://www.proofpoint.com/us/products/advanced-threat-protection',
              infraNodeTypes: ['waf'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Advanced Threat Sandbox',
              architectureRoleKo: '고급 위협 샌드박스',
              recommendedFor: [
                'Detecting zero-day threats missed by signature-based defenses',
                'Analyzing deferred phishing URLs at click time',
                'Protecting against targeted attachment-based attacks',
              ],
              recommendedForKo: [
                '서명 기반 방어를 우회하는 제로데이 위협 탐지',
                '클릭 시점에서 지연된 피싱 URL 분석',
                '표적 첨부파일 기반 공격에 대한 보호',
              ],
              securityCapabilities: [
                'Multi-stage predictive sandboxing',
                'URL rewriting with click-time analysis',
                'Attachment detonation with evasion detection',
                'Credential phishing page detection',
                'Threat intelligence correlation',
              ],
              specs: {
                'Deployment': 'Cloud-native sandbox',
                'Analysis Types': 'URL defense, attachment defense, predictive sandbox',
                'Detection': 'Zero-day, ransomware, APT, polymorphic malware',
                'URL Protection': 'Click-time rewriting and deferred analysis',
                'Integration': 'SIEM, SOAR, TAP dashboard, threat intelligence API',
                'Evasion Detection': 'Anti-sandbox evasion techniques detected',
              },
              children: [],
            },
          ],
        },

        // -- Proofpoint Email Fraud Defense --
        {
          nodeId: 'proofpoint-email-fraud-defense',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Proofpoint Email Fraud Defense',
          nameKo: 'Proofpoint 이메일 사기 방어',
          description:
            'DMARC authentication and domain protection platform preventing email spoofing, brand impersonation, and supply chain fraud with hosted SPF, DKIM, and lookalike domain monitoring',
          descriptionKo:
            '호스팅 SPF, DKIM, 유사 도메인 모니터링을 통해 이메일 스푸핑, 브랜드 사칭, 공급망 사기를 방지하는 DMARC 인증 및 도메인 보호 플랫폼',
          sourceUrl: 'https://www.proofpoint.com/us/products/email-fraud-defense',
          infraNodeTypes: ['waf'],
          architectureRole: 'Email Authentication / DMARC Enforcement',
          architectureRoleKo: '이메일 인증 / DMARC 적용',
          recommendedFor: [
            'DMARC implementation and enforcement across all sending domains',
            'Brand protection against domain spoofing and lookalike attacks',
            'Supplier and third-party email fraud risk assessment',
            'Hosted SPF management overcoming 10-lookup DNS limit',
            'Organizations with complex multi-domain email infrastructure',
          ],
          recommendedForKo: [
            '모든 발송 도메인에 대한 DMARC 구현 및 적용',
            '도메인 스푸핑 및 유사 도메인 공격에 대한 브랜드 보호',
            '공급업체 및 제3자 이메일 사기 위험 평가',
            '10개 조회 DNS 제한을 극복하는 호스팅 SPF 관리',
            '복잡한 다중 도메인 이메일 인프라를 갖춘 조직',
          ],
          supportedProtocols: [
            'DMARC', 'SPF', 'DKIM', 'DNSSEC', 'DNS',
            'SMTP', 'TLS 1.2/1.3', 'BIMI',
          ],
          haFeatures: [
            'Four geographically distributed data centers',
            'Near-instant DNS updates',
            'Fault-tolerant DKIM signing service',
            'Continuous domain monitoring',
          ],
          securityCapabilities: [
            'DMARC policy enforcement (none/quarantine/reject)',
            'Hosted SPF with unlimited DNS lookups',
            'Hosted DKIM key management',
            'Lookalike domain detection (650M+ domains monitored)',
            'Virtual takedown service for malicious domains',
            'Supplier Risk Explorer for third-party fraud assessment',
            'BIMI support for verified brand display',
          ],
          children: [
            {
              nodeId: 'proofpoint-email-fraud-defense-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Proofpoint Email Fraud Defense Platform',
              nameKo: 'Proofpoint 이메일 사기 방어 플랫폼',
              description:
                'Cloud-hosted DMARC, SPF, and DKIM authentication service with domain monitoring, lookalike detection, and supplier risk assessment across 650M+ domains',
              descriptionKo:
                '6억 5천만 개 이상의 도메인에서 도메인 모니터링, 유사 도메인 탐지, 공급업체 위험 평가를 제공하는 클라우드 호스팅 DMARC, SPF, DKIM 인증 서비스',
              sourceUrl: 'https://www.proofpoint.com/us/products/email-fraud-defense',
              infraNodeTypes: ['waf'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Email Authentication & Domain Protection',
              architectureRoleKo: '이메일 인증 및 도메인 보호',
              recommendedFor: [
                'Implementing and enforcing DMARC across enterprise domains',
                'Detecting and taking down lookalike phishing domains',
                'Assessing supplier email fraud risk in supply chain',
              ],
              recommendedForKo: [
                '엔터프라이즈 도메인 전반에 DMARC 구현 및 적용',
                '유사 피싱 도메인 탐지 및 차단',
                '공급망 내 공급업체 이메일 사기 위험 평가',
              ],
              securityCapabilities: [
                'DMARC enforcement with guided implementation',
                'Hosted SPF overcoming DNS lookup limits',
                'Hosted DKIM signing service',
                'Lookalike domain monitoring and takedown',
                'Supplier Risk Explorer',
              ],
              specs: {
                'Deployment': 'Cloud-hosted SaaS',
                'Domains Monitored': '650 million+ via WHOIS',
                'Authentication': 'DMARC, SPF, DKIM, DNSSEC, BIMI',
                'Data Centers': '4 geographically distributed regions',
                'DNS Updates': 'Near-instant propagation',
                'Consultant Support': 'Dedicated DMARC deployment consultant',
              },
              children: [],
            },
          ],
        },

        // -- Proofpoint Adaptive Email Security --
        {
          nodeId: 'proofpoint-adaptive-email-security',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Proofpoint Adaptive Email Security',
          nameKo: 'Proofpoint 적응형 이메일 보안',
          description:
            'AI-based behavioral email defense providing adaptive DLP, contextual warning banners, and integrated suspicious email reporting for human-centric email protection',
          descriptionKo:
            '인간 중심 이메일 보호를 위한 적응형 DLP, 상황 인식 경고 배너, 통합 의심 이메일 신고를 제공하는 AI 기반 행동 이메일 방어',
          sourceUrl: 'https://www.proofpoint.com/us/products/email-security-and-protection',
          infraNodeTypes: ['waf'],
          architectureRole: 'Adaptive Email Threat Defense / Behavioral Email Security',
          architectureRoleKo: '적응형 이메일 위협 방어 / 행동 기반 이메일 보안',
          recommendedFor: [
            'AI-driven behavioral email protection for human-centric threats',
            'Preventing accidental and malicious email data loss',
            'Contextual user coaching with real-time warning banners',
            'Integrated suspicious email reporting workflow',
            'Complementing gateway email security with API-based analysis',
          ],
          recommendedForKo: [
            '인간 중심 위협에 대한 AI 기반 행동 이메일 보호',
            '우발적 및 악의적 이메일 데이터 유출 방지',
            '실시간 경고 배너를 통한 상황별 사용자 코칭',
            '통합 의심 이메일 신고 워크플로우',
            'API 기반 분석으로 게이트웨이 이메일 보안 보완',
          ],
          supportedProtocols: [
            'Microsoft Graph API', 'REST API', 'SAML 2.0',
            'SMTP', 'TLS 1.2/1.3',
          ],
          haFeatures: [
            'Cloud-native API-based architecture',
            'Real-time inline analysis',
            'Automatic policy adaptation based on threat landscape',
          ],
          securityCapabilities: [
            'AI-powered behavioral email analysis',
            'Adaptive email DLP with ML classification',
            'Contextual warning banners for suspicious messages',
            'Integrated suspicious email reporting button',
            'Misdirected email detection',
            'Social engineering pattern recognition',
          ],
          children: [
            {
              nodeId: 'proofpoint-adaptive-email-security-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Proofpoint Adaptive Email DLP',
              nameKo: 'Proofpoint 적응형 이메일 DLP',
              description:
                'Machine learning-based email DLP preventing accidental and malicious data loss with behavioral AI, misdirected email detection, and contextual user coaching',
              descriptionKo:
                '행동 AI, 오발송 이메일 탐지, 상황별 사용자 코칭을 갖춘 우발적 및 악의적 데이터 유출을 방지하는 머신러닝 기반 이메일 DLP',
              sourceUrl: 'https://www.proofpoint.com/us/products/email-security-and-protection',
              infraNodeTypes: ['waf', 'dlp'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Adaptive Email Data Loss Prevention',
              architectureRoleKo: '적응형 이메일 데이터 유출 방지',
              recommendedFor: [
                'Preventing accidental misdirected emails with sensitive data',
                'ML-based email content classification and policy enforcement',
                'Coaching users in real time with contextual warnings',
              ],
              recommendedForKo: [
                '민감 데이터가 포함된 우발적 오발송 이메일 방지',
                'ML 기반 이메일 콘텐츠 분류 및 정책 적용',
                '상황별 경고로 사용자를 실시간 코칭',
              ],
              securityCapabilities: [
                'Behavioral AI email DLP',
                'Misdirected email detection',
                'Contextual warning banners',
                'Integrated reporting workflow',
                'ML content classification',
              ],
              specs: {
                'Deployment': 'Cloud-native API',
                'AI Engine': 'Behavioral AI with ML classification',
                'Integration': 'Microsoft 365, Google Workspace',
                'User Coaching': 'Real-time contextual warning banners',
                'Detection': 'Misdirected email, sensitive data exposure',
                'Reporting': 'Integrated suspicious email reporting button',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 2. Threat Protection
    // =====================================================================
    {
      nodeId: 'proofpoint-threat-protection',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Threat Protection',
      nameKo: '위협 방어',
      description:
        'Automated threat response, intelligence feeds, and web security platform providing SOC-integrated remediation, real-time IP/domain reputation, and web isolation capabilities',
      descriptionKo:
        'SOC 통합 자동 복구, 실시간 IP/도메인 평판, 웹 격리 기능을 제공하는 자동화된 위협 대응, 인텔리전스 피드, 웹 보안 플랫폼',
      sourceUrl: 'https://www.proofpoint.com/us/products',
      infraNodeTypes: ['siem'],
      children: [
        // -- Proofpoint Threat Response Auto-Pull (TRAP) --
        {
          nodeId: 'proofpoint-trap',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Proofpoint Threat Response Auto-Pull (TRAP)',
          nameKo: 'Proofpoint 위협 대응 자동 제거 (TRAP)',
          description:
            'Automated email threat remediation platform that quarantines, removes, and analyzes malicious messages post-delivery across all user mailboxes',
          descriptionKo:
            '모든 사용자 메일함에서 전달 후 악성 메시지를 격리, 제거, 분석하는 자동화된 이메일 위협 복구 플랫폼',
          sourceUrl: 'https://www.proofpoint.com/us/products',
          infraNodeTypes: ['soar'],
          architectureRole: 'Email Threat Remediation / SOAR Integration',
          architectureRoleKo: '이메일 위협 복구 / SOAR 통합',
          recommendedFor: [
            'Automated post-delivery email threat remediation',
            'SOC workflow integration for email incident response',
            'Quarantining malicious emails that bypassed initial scanning',
            'Reducing mean-time-to-respond for email-borne threats',
            'User-reported phishing email investigation and remediation',
          ],
          recommendedForKo: [
            '전달 후 이메일 위협 자동 복구',
            '이메일 인시던트 대응을 위한 SOC 워크플로우 통합',
            '초기 스캐닝을 우회한 악성 이메일 격리',
            '이메일 기반 위협의 평균 대응 시간 단축',
            '사용자 신고 피싱 이메일 조사 및 복구',
          ],
          supportedProtocols: [
            'REST API', 'Microsoft Graph API', 'Syslog',
            'SAML 2.0', 'SMTP',
          ],
          haFeatures: [
            'Cloud-native automated remediation',
            'Real-time threat intelligence integration',
            'Automated quarantine and removal workflows',
          ],
          securityCapabilities: [
            'Automated email quarantine and removal',
            'Post-delivery threat analysis',
            'User-reported email investigation',
            'Forensic message analysis',
            'SIEM/SOAR integration for incident response',
            'Bulk remediation across all mailboxes',
          ],
          children: [
            {
              nodeId: 'proofpoint-trap-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Proofpoint TRAP Automated Remediation',
              nameKo: 'Proofpoint TRAP 자동 복구',
              description:
                'Automated threat response engine that pulls malicious emails from user mailboxes post-delivery, integrating with SIEM/SOAR for coordinated incident response',
              descriptionKo:
                '전달 후 사용자 메일함에서 악성 이메일을 제거하고 SIEM/SOAR와 연동하여 통합 인시던트 대응을 수행하는 자동화된 위협 대응 엔진',
              sourceUrl: 'https://www.proofpoint.com/us/products',
              infraNodeTypes: ['soar'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Automated Email Remediation',
              architectureRoleKo: '자동화된 이메일 복구',
              recommendedFor: [
                'Removing malicious emails from all mailboxes post-delivery',
                'Integrating email remediation with SIEM/SOAR workflows',
                'Reducing SOC workload with automated threat response',
              ],
              recommendedForKo: [
                '전달 후 모든 메일함에서 악성 이메일 제거',
                'SIEM/SOAR 워크플로우와 이메일 복구 통합',
                '자동화된 위협 대응으로 SOC 작업량 감소',
              ],
              securityCapabilities: [
                'Automated email pull and quarantine',
                'Post-delivery forensic analysis',
                'SIEM/SOAR workflow integration',
                'Bulk mailbox remediation',
                'User-reported email triage',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Remediation': 'Automated quarantine, remove, and analyze',
                'Integration': 'SIEM, SOAR, Microsoft 365, Google Workspace',
                'Trigger': 'Automated and user-reported incidents',
                'Response Time': 'Real-time post-delivery remediation',
                'Coverage': 'All user mailboxes across organization',
              },
              children: [],
            },
          ],
        },

        // -- Proofpoint Emerging Threats Intelligence --
        {
          nodeId: 'proofpoint-et-intelligence',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Proofpoint Emerging Threats Intelligence',
          nameKo: 'Proofpoint 이머징 쓰렛 인텔리전스',
          description:
            'Curated threat intelligence feeds providing actionable IP and domain reputation data with 40+ threat categories, confidence scoring, and SIEM/IDS integration',
          descriptionKo:
            '40개 이상의 위협 카테고리, 신뢰도 점수, SIEM/IDS 통합을 갖춘 실행 가능한 IP 및 도메인 평판 데이터를 제공하는 큐레이션된 위협 인텔리전스 피드',
          sourceUrl: 'https://www.proofpoint.com/us/products/et-intelligence',
          infraNodeTypes: ['siem'],
          architectureRole: 'Threat Intelligence Feed / Threat Intelligence Platform',
          architectureRoleKo: '위협 인텔리전스 피드 / 위협 인텔리전스 플랫폼',
          recommendedFor: [
            'Enriching SIEM and IDS/IPS with real-time threat intelligence',
            'IP and domain reputation scoring for perimeter defense',
            'SOC threat hunting with contextual intelligence data',
            'Integrating threat feeds into existing security infrastructure',
            'Proactive threat detection with 40+ threat categories',
          ],
          recommendedForKo: [
            '실시간 위협 인텔리전스로 SIEM 및 IDS/IPS 강화',
            '경계 방어를 위한 IP 및 도메인 평판 점수',
            '상황별 인텔리전스 데이터로 SOC 위협 헌팅',
            '기존 보안 인프라에 위협 피드 통합',
            '40개 이상의 위협 카테고리로 선제적 위협 탐지',
          ],
          supportedProtocols: [
            'REST API', 'Syslog', 'STIX/TAXII',
            'JSON', 'CSV', 'TXT',
          ],
          haFeatures: [
            'Cloud-hosted threat intelligence portal',
            'Hourly feed updates',
            'On-demand historical threat data access',
          ],
          securityCapabilities: [
            '40+ threat categories per IP/domain',
            'Confidence scoring with aggressive aging',
            'Historical metadata and condemnation evidence',
            'Exploit kit identification',
            'Malware sample correlation',
            'Real-time reputation feeds',
          ],
          children: [
            {
              nodeId: 'proofpoint-et-intelligence-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Proofpoint ET Intelligence Feed',
              nameKo: 'Proofpoint ET 인텔리전스 피드',
              description:
                'Actionable IP and domain reputation feeds with 40+ threat categories, hourly updates, confidence scoring, and multi-format SIEM/IDS integration',
              descriptionKo:
                '40개 이상의 위협 카테고리, 매시간 업데이트, 신뢰도 점수, 다중 형식 SIEM/IDS 통합을 갖춘 실행 가능한 IP 및 도메인 평판 피드',
              sourceUrl: 'https://www.proofpoint.com/us/products/et-intelligence',
              infraNodeTypes: ['siem'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Threat Intelligence Feed Service',
              architectureRoleKo: '위협 인텔리전스 피드 서비스',
              recommendedFor: [
                'Feeding SIEM with real-time IP/domain reputation data',
                'Enhancing IDS/IPS rules with threat intelligence context',
                'SOC analyst threat hunting and investigation support',
              ],
              recommendedForKo: [
                '실시간 IP/도메인 평판 데이터로 SIEM 피딩',
                '위협 인텔리전스 컨텍스트로 IDS/IPS 규칙 강화',
                'SOC 분석가 위협 헌팅 및 조사 지원',
              ],
              securityCapabilities: [
                'IP/domain reputation feeds',
                '40+ threat categories',
                'Confidence scoring system',
                'Historical threat metadata',
                'Exploit kit and malware correlation',
              ],
              specs: {
                'Deployment': 'Cloud-hosted portal + feed API',
                'Threat Categories': '40+',
                'Update Frequency': 'Hourly',
                'Feed Formats': 'TXT, CSV, JSON, compressed',
                'SIEM Integration': 'Splunk, QRadar, ArcSight, Anomali',
                'IDS Integration': 'Suricata, Snort, Bro/Zeek format',
              },
              children: [],
            },
          ],
        },

        // -- Proofpoint Web Security --
        {
          nodeId: 'proofpoint-web-security',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Proofpoint Web Security',
          nameKo: 'Proofpoint 웹 보안',
          description:
            'Cloud-based web isolation and filtering platform protecting users from web-borne threats by rendering risky web content in an isolated cloud environment',
          descriptionKo:
            '위험한 웹 콘텐츠를 격리된 클라우드 환경에서 렌더링하여 웹 기반 위협으로부터 사용자를 보호하는 클라우드 기반 웹 격리 및 필터링 플랫폼',
          sourceUrl: 'https://www.proofpoint.com/us/products',
          infraNodeTypes: ['sase-gateway'],
          architectureRole: 'Web Isolation / Cloud Web Security',
          architectureRoleKo: '웹 격리 / 클라우드 웹 보안',
          recommendedFor: [
            'Isolating risky web browsing from endpoints',
            'Protecting users from drive-by download attacks',
            'Securing unmanaged device and BYOD web access',
            'Complementing email security with web threat isolation',
            'Reducing attack surface from uncategorized websites',
          ],
          recommendedForKo: [
            '엔드포인트에서 위험한 웹 브라우징 격리',
            '드라이브 바이 다운로드 공격으로부터 사용자 보호',
            '비관리 기기 및 BYOD 웹 접근 보안',
            '웹 위협 격리로 이메일 보안 보완',
            '미분류 웹사이트로부터의 공격 표면 축소',
          ],
          supportedProtocols: [
            'HTTP/HTTPS', 'TLS 1.2/1.3', 'DNS',
            'SAML 2.0', 'PAC File',
          ],
          haFeatures: [
            'Cloud-native isolation infrastructure',
            'Global data center distribution',
            'Automatic failover between isolation instances',
          ],
          securityCapabilities: [
            'Remote browser isolation (RBI)',
            'Web content filtering',
            'Malicious URL blocking',
            'Document and file isolation',
            'Clipboard and download controls',
            'Phishing site isolation',
          ],
          children: [
            {
              nodeId: 'proofpoint-web-security-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Proofpoint Browser Isolation',
              nameKo: 'Proofpoint 브라우저 격리',
              description:
                'Cloud-based remote browser isolation rendering risky web content in an isolated environment, preventing web-borne malware from reaching user endpoints',
              descriptionKo:
                '격리된 환경에서 위험한 웹 콘텐츠를 렌더링하여 웹 기반 악성코드가 사용자 엔드포인트에 도달하는 것을 방지하는 클라우드 기반 원격 브라우저 격리',
              sourceUrl: 'https://www.proofpoint.com/us/products',
              infraNodeTypes: ['sase-gateway'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Remote Browser Isolation (RBI)',
              architectureRoleKo: '원격 브라우저 격리 (RBI)',
              recommendedFor: [
                'Isolating uncategorized and risky web browsing sessions',
                'Protecting BYOD and unmanaged devices from web threats',
                'Complementing URL filtering with full web isolation',
              ],
              recommendedForKo: [
                '미분류 및 위험한 웹 브라우징 세션 격리',
                'BYOD 및 비관리 기기를 웹 위협으로부터 보호',
                '완전한 웹 격리로 URL 필터링 보완',
              ],
              securityCapabilities: [
                'Remote browser isolation',
                'Document rendering in isolation',
                'Clipboard and download control',
                'Phishing page isolation',
                'Zero-trust web access',
              ],
              specs: {
                'Deployment': 'Cloud-native isolation',
                'Rendering': 'Cloud-based pixel streaming',
                'User Experience': 'Near-native browsing experience',
                'Controls': 'Clipboard, download, upload, print restrictions',
                'Integration': 'Integrates with Proofpoint email URL defense',
                'Protection': 'Drive-by downloads, malicious scripts, phishing sites',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 3. Information Protection
    // =====================================================================
    {
      nodeId: 'proofpoint-information-protection',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Information Protection',
      nameKo: '정보 보호',
      description:
        'Data loss prevention, insider threat management, and cloud app security platform protecting sensitive data across email, cloud, and endpoint channels',
      descriptionKo:
        '이메일, 클라우드, 엔드포인트 채널 전반에서 민감 데이터를 보호하는 데이터 유출 방지, 내부 위협 관리, 클라우드 앱 보안 플랫폼',
      sourceUrl: 'https://www.proofpoint.com/us/products',
      infraNodeTypes: ['dlp'],
      children: [
        // -- Proofpoint Enterprise DLP --
        {
          nodeId: 'proofpoint-enterprise-dlp',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Proofpoint Enterprise DLP',
          nameKo: 'Proofpoint 엔터프라이즈 DLP',
          description:
            'Cloud-native data loss prevention platform detecting and preventing data exfiltration across email, cloud, and endpoint channels with AI-powered classification and behavioral monitoring',
          descriptionKo:
            'AI 기반 분류 및 행동 모니터링을 통해 이메일, 클라우드, 엔드포인트 채널 전반에서 데이터 유출을 탐지하고 방지하는 클라우드 네이티브 데이터 유출 방지 플랫폼',
          sourceUrl: 'https://www.proofpoint.com/us/products/information-protection/enterprise-dlp',
          infraNodeTypes: ['dlp'],
          architectureRole: 'Enterprise Data Loss Prevention (DLP)',
          architectureRoleKo: '엔터프라이즈 데이터 유출 방지 (DLP)',
          recommendedFor: [
            'Multi-channel DLP across email, cloud, and endpoints',
            'AI-powered sensitive data classification including image content',
            'User behavior monitoring for insider threat detection',
            'Regulatory compliance enforcement for PII, PHI, PCI data',
            'Centralized DLP incident management and investigation',
          ],
          recommendedForKo: [
            '이메일, 클라우드, 엔드포인트 전반의 다중 채널 DLP',
            '이미지 콘텐츠를 포함한 AI 기반 민감 데이터 분류',
            '내부 위협 탐지를 위한 사용자 행동 모니터링',
            'PII, PHI, PCI 데이터에 대한 규정 준수 적용',
            '중앙 집중식 DLP 인시던트 관리 및 조사',
          ],
          supportedProtocols: [
            'REST API', 'SMTP', 'HTTPS',
            'SAML 2.0', 'SCIM',
          ],
          haFeatures: [
            'Cloud-native multi-tenant architecture',
            'Lightweight user-mode endpoint agents',
            'Scales to hundreds of thousands of users per tenant',
            'Multi-region data residency options',
          ],
          securityCapabilities: [
            'AI-powered data classification with image analysis',
            'Content-aware DLP across email, cloud, endpoint',
            'User activity monitoring with behavioral analytics',
            'Data lineage tracking across channels',
            'USB device transfer monitoring',
            'Web upload and cloud sync detection',
            'Generative AI prompt detection',
            'Privacy-by-design with data masking',
          ],
          children: [
            {
              nodeId: 'proofpoint-enterprise-dlp-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Proofpoint Enterprise DLP Platform',
              nameKo: 'Proofpoint 엔터프라이즈 DLP 플랫폼',
              description:
                'Unified DLP console with AI classification, behavioral monitoring, and data lineage tracking across email, cloud, and endpoint channels with privacy controls',
              descriptionKo:
                '프라이버시 제어를 갖춘 이메일, 클라우드, 엔드포인트 채널 전반의 AI 분류, 행동 모니터링, 데이터 계보 추적이 포함된 통합 DLP 콘솔',
              sourceUrl: 'https://www.proofpoint.com/us/products/information-protection/enterprise-dlp',
              infraNodeTypes: ['dlp'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Multi-Channel Enterprise DLP',
              architectureRoleKo: '다중 채널 엔터프라이즈 DLP',
              recommendedFor: [
                'Detecting and preventing data exfiltration across all channels',
                'Monitoring user behavior for careless or malicious data handling',
                'Tracking data lineage from origin to destination',
              ],
              recommendedForKo: [
                '모든 채널에서 데이터 유출 탐지 및 방지',
                '부주의하거나 악의적인 데이터 처리에 대한 사용자 행동 모니터링',
                '원본에서 목적지까지 데이터 계보 추적',
              ],
              securityCapabilities: [
                'AI/ML content classification',
                'Multi-channel DLP (email, cloud, endpoint)',
                'User activity monitoring',
                'Data lineage and origin tracking',
                'Privacy controls with data masking',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS with endpoint agent',
                'Channels': 'Email, cloud apps, endpoints (USB, web, sync)',
                'AI Classification': 'Content + image analysis, ML classifiers',
                'Monitoring': 'File activity, app usage, USB, web uploads, GenAI prompts',
                'Integration': 'Microsoft, Okta, Splunk, ServiceNow',
                'Scale': 'Hundreds of thousands of users per tenant',
              },
              children: [],
            },
          ],
        },

        // -- Proofpoint Insider Threat Management --
        {
          nodeId: 'proofpoint-itm',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Proofpoint Insider Threat Management',
          nameKo: 'Proofpoint 내부 위협 관리 (ITM)',
          description:
            'User activity monitoring platform detecting risky insider behavior across endpoints, email, and cloud with timeline visualization, SIEM/SOAR integration, and privacy-by-design controls',
          descriptionKo:
            '타임라인 시각화, SIEM/SOAR 통합, 프라이버시 바이 디자인 제어를 갖추고 엔드포인트, 이메일, 클라우드 전반에서 위험한 내부자 행동을 탐지하는 사용자 활동 모니터링 플랫폼',
          sourceUrl: 'https://www.proofpoint.com/us/products/insider-threat-management',
          infraNodeTypes: ['dlp'],
          architectureRole: 'Insider Threat Detection / User Activity Monitoring',
          architectureRoleKo: '내부 위협 탐지 / 사용자 활동 모니터링',
          recommendedFor: [
            'Detecting careless, malicious, and compromised insider behavior',
            'User activity monitoring across endpoint, email, and cloud',
            'Insider risk investigation with timeline visualization',
            'SIEM/SOAR integration for automated insider threat response',
            'Privacy-compliant monitoring with identity masking',
          ],
          recommendedForKo: [
            '부주의, 악의적, 침해된 내부자 행동 탐지',
            '엔드포인트, 이메일, 클라우드 전반의 사용자 활동 모니터링',
            '타임라인 시각화를 통한 내부 위험 조사',
            '자동화된 내부 위협 대응을 위한 SIEM/SOAR 통합',
            '신원 마스킹을 통한 프라이버시 준수 모니터링',
          ],
          supportedProtocols: [
            'REST API', 'Webhooks', 'Syslog',
            'SAML 2.0', 'SCIM',
          ],
          haFeatures: [
            'Cloud-native multi-channel telemetry',
            'Multi-region data residency (US, Europe, Australia, Japan)',
            'Unified console with consolidated visibility',
          ],
          securityCapabilities: [
            'User activity timeline visualization',
            'Out-of-box alert libraries',
            'Endpoint activity monitoring (file, USB, print, network)',
            'Cloud sync and upload detection',
            'Microsoft Information Protection label recognition',
            'Identity masking for privacy compliance',
            'SIEM/SOAR integration via webhooks',
            'Graduated response controls (monitor to block)',
          ],
          children: [
            {
              nodeId: 'proofpoint-itm-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Proofpoint ITM Platform',
              nameKo: 'Proofpoint ITM 플랫폼',
              description:
                'Insider threat detection platform with user activity timeline, multi-channel telemetry, graduated response controls, and privacy-compliant monitoring',
              descriptionKo:
                '사용자 활동 타임라인, 다중 채널 텔레메트리, 단계별 대응 제어, 프라이버시 준수 모니터링을 갖춘 내부 위협 탐지 플랫폼',
              sourceUrl: 'https://www.proofpoint.com/us/products/insider-threat-management',
              infraNodeTypes: ['dlp'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Insider Threat Detection & Response',
              architectureRoleKo: '내부 위협 탐지 및 대응',
              recommendedFor: [
                'Monitoring user activity for insider risk indicators',
                'Investigating insider incidents with visual timelines',
                'Automating insider threat response with SIEM/SOAR',
              ],
              recommendedForKo: [
                '내부 위험 지표에 대한 사용자 활동 모니터링',
                '시각적 타임라인으로 내부자 인시던트 조사',
                'SIEM/SOAR로 내부 위협 대응 자동화',
              ],
              securityCapabilities: [
                'User activity timeline visualization',
                'Multi-channel telemetry consolidation',
                'Graduated response (monitor, warn, block)',
                'Identity masking and privacy controls',
                'SIEM/SOAR webhook integration',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS with endpoint agent',
                'Channels': 'Endpoint, email, cloud, web',
                'Monitoring': 'File, USB, print, network, cloud sync, screen',
                'Data Residency': 'US, Europe, Australia, Japan',
                'Integration': 'SIEM, SOAR, Microsoft Information Protection',
                'Privacy': 'Identity masking, need-to-know access controls',
              },
              children: [],
            },
          ],
        },

        // -- Proofpoint CASB --
        {
          nodeId: 'proofpoint-casb',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Proofpoint Cloud App Security Broker (CASB)',
          nameKo: 'Proofpoint 클라우드 앱 보안 브로커 (CASB)',
          description:
            'Cloud access security broker providing SaaS threat detection, shadow IT discovery, OAuth app management, and DLP across hundreds of enterprise cloud applications',
          descriptionKo:
            '수백 개의 엔터프라이즈 클라우드 애플리케이션 전반에서 SaaS 위협 탐지, 섀도우 IT 발견, OAuth 앱 관리, DLP를 제공하는 클라우드 접근 보안 브로커',
          sourceUrl: 'https://www.proofpoint.com/us/products/cloud-app-security-broker',
          infraNodeTypes: ['casb'],
          architectureRole: 'Cloud Access Security Broker (CASB)',
          architectureRoleKo: '클라우드 접근 보안 브로커 (CASB)',
          recommendedFor: [
            'SaaS application threat detection and account takeover prevention',
            'Shadow IT discovery and OAuth third-party app risk management',
            'Cloud DLP with unified visibility across email, cloud, and endpoint',
            'Microsoft 365, Google Workspace, and Okta security monitoring',
            'Compliance reporting aligned with MITRE ATT&CK framework',
          ],
          recommendedForKo: [
            'SaaS 애플리케이션 위협 탐지 및 계정 탈취 방지',
            '섀도우 IT 발견 및 OAuth 제3자 앱 위험 관리',
            '이메일, 클라우드, 엔드포인트 전반의 통합 가시성을 갖춘 클라우드 DLP',
            'Microsoft 365, Google Workspace, Okta 보안 모니터링',
            'MITRE ATT&CK 프레임워크에 맞춘 컴플라이언스 보고',
          ],
          supportedProtocols: [
            'REST API', 'OAuth 2.0', 'SAML 2.0',
            'SCIM', 'Microsoft Graph API', 'Google API',
          ],
          haFeatures: [
            'Cloud-native multi-deployment architecture',
            'API connector, adaptive access, and proxy modes',
            'Real-time and out-of-band protection options',
          ],
          securityCapabilities: [
            'Account takeover detection for M365, Google, Okta',
            'Shadow IT and risky OAuth app discovery',
            'Malicious OAuth app remediation',
            'Cloud DLP with ML classification',
            'Credential phishing correlation',
            'MITRE ATT&CK framework reporting',
            'Adaptive access controls without endpoint agents',
            'Real-time cloud proxy protection',
          ],
          children: [
            {
              nodeId: 'proofpoint-casb-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Proofpoint CASB Platform',
              nameKo: 'Proofpoint CASB 플랫폼',
              description:
                'Multi-mode CASB platform with API connectors, adaptive access controls, and cloud proxy for SaaS security, shadow IT discovery, and OAuth app management',
              descriptionKo:
                'SaaS 보안, 섀도우 IT 발견, OAuth 앱 관리를 위한 API 커넥터, 적응형 접근 제어, 클라우드 프록시를 갖춘 다중 모드 CASB 플랫폼',
              sourceUrl: 'https://www.proofpoint.com/us/products/cloud-app-security-broker',
              infraNodeTypes: ['casb'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Cloud Access Security Broker',
              architectureRoleKo: '클라우드 접근 보안 브로커',
              recommendedFor: [
                'Securing SaaS applications with multi-mode deployment',
                'Discovering and managing shadow IT OAuth applications',
                'Preventing account takeover across cloud services',
              ],
              recommendedForKo: [
                '다중 모드 배포로 SaaS 애플리케이션 보안',
                '섀도우 IT OAuth 애플리케이션 발견 및 관리',
                '클라우드 서비스 전반의 계정 탈취 방지',
              ],
              securityCapabilities: [
                'API-based SaaS security monitoring',
                'Adaptive access controls',
                'Cloud proxy for real-time protection',
                'Shadow IT and OAuth app management',
                'Account takeover detection',
              ],
              specs: {
                'Deployment': 'Cloud-native (API, adaptive, proxy modes)',
                'SaaS Coverage': 'Hundreds of enterprise SaaS and IaaS apps',
                'Deployment Modes': 'API connector, adaptive access, cloud proxy',
                'Key Integrations': 'Microsoft 365, Google Workspace, Okta, Salesforce',
                'Reporting': 'MITRE ATT&CK aligned executive reports',
                'DLP Integration': 'Unified with Proofpoint Enterprise DLP',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 4. Security Awareness
    // =====================================================================
    {
      nodeId: 'proofpoint-security-awareness',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Security Awareness',
      nameKo: '보안 인식',
      description:
        'Security awareness training and people risk management platform transforming human behavior through phishing simulation, adaptive training, and risk-based education',
      descriptionKo:
        '피싱 시뮬레이션, 적응형 교육, 위험 기반 교육을 통해 인간 행동을 변화시키는 보안 인식 교육 및 인적 위험 관리 플랫폼',
      sourceUrl: 'https://www.proofpoint.com/us/products',
      infraNodeTypes: ['siem'],
      children: [
        // -- Proofpoint Security Awareness Training (ZenGuide) --
        {
          nodeId: 'proofpoint-zenguide',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Proofpoint Security Awareness Training (ZenGuide)',
          nameKo: 'Proofpoint 보안 인식 교육 (ZenGuide)',
          description:
            'AI-guided security awareness platform with automated phishing simulation, adaptive training pathways, and risk-based education for behavior change',
          descriptionKo:
            '행동 변화를 위한 자동화된 피싱 시뮬레이션, 적응형 교육 경로, 위험 기반 교육을 갖춘 AI 기반 보안 인식 플랫폼',
          sourceUrl: 'https://www.proofpoint.com/us/products/security-awareness-training',
          infraNodeTypes: ['siem'],
          architectureRole: 'Security Awareness Training / Human Risk Management',
          architectureRoleKo: '보안 인식 교육 / 인적 위험 관리',
          recommendedFor: [
            'Enterprise phishing simulation and security awareness training',
            'Risk-based adaptive training for high-risk user groups',
            'AI-guided curriculum with threat-informed simulation recommendations',
            'Measuring and improving organizational security culture',
            'Compliance-driven security training program delivery',
          ],
          recommendedForKo: [
            '엔터프라이즈 피싱 시뮬레이션 및 보안 인식 교육',
            '고위험 사용자 그룹을 위한 위험 기반 적응형 교육',
            '위협 기반 시뮬레이션 추천을 갖춘 AI 기반 커리큘럼',
            '조직 보안 문화 측정 및 개선',
            '컴플라이언스 기반 보안 교육 프로그램 제공',
          ],
          supportedProtocols: [
            'SAML 2.0', 'SCIM', 'REST API',
            'SMTP', 'LTI',
          ],
          haFeatures: [
            'Cloud-native SaaS platform',
            'Multi-language global deployment',
            'WCAG accessibility compliance',
          ],
          securityCapabilities: [
            'AI-guided phishing simulation (Satori agent)',
            'USB, SMS, and email attack simulations',
            'Adaptive risk-based training pathways',
            'Culture surveys and attitude assessments',
            'Nano- and micro-learning content library',
            'Gamified training engagement',
            'Just-in-time contextual coaching',
            'People Risk Explorer integration',
          ],
          children: [
            {
              nodeId: 'proofpoint-zenguide-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Proofpoint ZenGuide Platform',
              nameKo: 'Proofpoint ZenGuide 플랫폼',
              description:
                'Automated security awareness training platform with Satori AI phishing simulation, adaptive pathways, multi-format content, and risk-based learner grouping',
              descriptionKo:
                'Satori AI 피싱 시뮬레이션, 적응형 경로, 다중 형식 콘텐츠, 위험 기반 학습자 그룹화를 갖춘 자동화된 보안 인식 교육 플랫폼',
              sourceUrl: 'https://www.proofpoint.com/us/products/security-awareness-training',
              infraNodeTypes: ['siem'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Security Awareness Training Platform',
              architectureRoleKo: '보안 인식 교육 플랫폼',
              recommendedFor: [
                'Running enterprise-wide phishing simulation campaigns',
                'Delivering risk-based adaptive training to high-risk users',
                'Measuring security culture with surveys and assessments',
              ],
              recommendedForKo: [
                '전사적 피싱 시뮬레이션 캠페인 실행',
                '고위험 사용자에게 위험 기반 적응형 교육 제공',
                '설문조사 및 평가로 보안 문화 측정',
              ],
              securityCapabilities: [
                'Satori AI phishing simulation agent',
                'Multi-vector simulations (phishing, USB, SMS)',
                'Adaptive training pathways',
                'Culture survey assessments',
                'Gamified nano/micro-learning',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Simulation Types': 'Phishing, USB, SMS, culture surveys',
                'AI Engine': 'Satori agent for threat-informed recommendations',
                'Content': 'Nano/micro-learning, multi-language, multi-difficulty',
                'Accessibility': 'WCAG compliant',
                'Integration': 'People Risk Explorer, SAML SSO, SCIM provisioning',
              },
              children: [],
            },
          ],
        },

        // -- Proofpoint Nexus People Risk Explorer --
        {
          nodeId: 'proofpoint-npre',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Proofpoint Nexus People Risk Explorer',
          nameKo: 'Proofpoint Nexus 인적 위험 탐색기',
          description:
            'People-centric risk scoring platform that aggregates threat exposure, vulnerability, privilege, and behavioral data to identify and prioritize highest-risk individuals',
          descriptionKo:
            '위협 노출, 취약성, 권한, 행동 데이터를 집계하여 최고 위험 개인을 식별하고 우선순위를 지정하는 인간 중심 위험 점수 플랫폼',
          sourceUrl: 'https://www.proofpoint.com/us/products',
          infraNodeTypes: ['siem'],
          architectureRole: 'People-Centric Risk Scoring / Human Risk Analytics',
          architectureRoleKo: '인간 중심 위험 점수 / 인적 위험 분석',
          recommendedFor: [
            'Identifying and prioritizing highest-risk users in the organization',
            'Correlating threat exposure with user privilege and behavior',
            'Driving targeted security controls based on people risk scores',
            'Executive reporting on human risk posture',
            'Integration with security awareness training for risk-based targeting',
          ],
          recommendedForKo: [
            '조직 내 최고 위험 사용자 식별 및 우선순위 지정',
            '위협 노출과 사용자 권한 및 행동 상관 분석',
            '인적 위험 점수 기반 표적 보안 제어 적용',
            '인적 위험 태세에 대한 경영진 보고',
            '위험 기반 타겟팅을 위한 보안 인식 교육 통합',
          ],
          supportedProtocols: [
            'REST API', 'SAML 2.0', 'SCIM',
          ],
          haFeatures: [
            'Cloud-native analytics platform',
            'Real-time risk score aggregation',
            'Cross-product data correlation',
          ],
          securityCapabilities: [
            'Multi-dimensional people risk scoring',
            'Threat exposure aggregation (attack, vulnerability, privilege)',
            'Behavioral risk factor analysis',
            'Very Attacked People (VAP) identification',
            'Risk-based adaptive control recommendations',
            'Executive risk posture dashboards',
          ],
          children: [
            {
              nodeId: 'proofpoint-npre-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Proofpoint People Risk Explorer Dashboard',
              nameKo: 'Proofpoint 인적 위험 탐색기 대시보드',
              description:
                'Risk analytics dashboard aggregating attack targeting, vulnerability, privilege, and behavior data to surface and score highest-risk individuals for adaptive security controls',
              descriptionKo:
                '적응형 보안 제어를 위해 공격 타겟팅, 취약성, 권한, 행동 데이터를 집계하여 최고 위험 개인을 표면화하고 점수화하는 위험 분석 대시보드',
              sourceUrl: 'https://www.proofpoint.com/us/products',
              infraNodeTypes: ['siem'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'People Risk Analytics Dashboard',
              architectureRoleKo: '인적 위험 분석 대시보드',
              recommendedFor: [
                'Visualizing organization-wide people risk posture',
                'Identifying Very Attacked People (VAP) for priority protection',
                'Driving adaptive security controls based on risk scores',
              ],
              recommendedForKo: [
                '조직 전체 인적 위험 태세 시각화',
                '우선 보호를 위한 최다 공격 대상(VAP) 식별',
                '위험 점수 기반 적응형 보안 제어 적용',
              ],
              securityCapabilities: [
                'Multi-factor people risk scoring',
                'VAP identification and prioritization',
                'Behavioral risk trend analysis',
                'Executive risk posture reporting',
                'Adaptive control recommendations',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Risk Dimensions': 'Attack targeting, vulnerability, privilege, behavior',
                'Scoring': 'Multi-dimensional people risk score',
                'Reporting': 'Executive dashboards and trend analysis',
                'Integration': 'ZenGuide, TAP, Enterprise DLP, ITM',
                'Analytics': 'VAP identification, risk cohort analysis',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 5. Compliance & Archiving
    // =====================================================================
    {
      nodeId: 'proofpoint-compliance-archiving',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Compliance & Archiving',
      nameKo: '컴플라이언스 및 아카이빙',
      description:
        'Digital communications governance platform providing intelligent archiving, regulatory compliance monitoring, and brand/domain protection for enterprise communications',
      descriptionKo:
        '엔터프라이즈 커뮤니케이션을 위한 지능형 아카이빙, 규정 준수 모니터링, 브랜드/도메인 보호를 제공하는 디지털 커뮤니케이션 거버넌스 플랫폼',
      sourceUrl: 'https://www.proofpoint.com/us/products',
      infraNodeTypes: ['siem'],
      children: [
        // -- Proofpoint Intelligent Archive --
        {
          nodeId: 'proofpoint-archive',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Proofpoint Intelligent Archive',
          nameKo: 'Proofpoint 지능형 아카이브',
          description:
            'Next-generation SaaS archiving platform with PCI DSS compliance, cloud intelligence-powered data insights, e-discovery, and litigation readiness for email, IM, and social communications',
          descriptionKo:
            'PCI DSS 준수, 클라우드 인텔리전스 기반 데이터 인사이트, e-디스커버리, 이메일, IM, 소셜 커뮤니케이션의 소송 준비를 갖춘 차세대 SaaS 아카이빙 플랫폼',
          sourceUrl: 'https://www.proofpoint.com/us/products/archiving-and-compliance',
          infraNodeTypes: ['siem'],
          architectureRole: 'Enterprise Communications Archive / e-Discovery',
          architectureRoleKo: '엔터프라이즈 커뮤니케이션 아카이브 / e-디스커버리',
          recommendedFor: [
            'Enterprise email, IM, and social media archiving',
            'Litigation readiness and e-discovery for legal compliance',
            'Regulatory compliance for financial services (SEC, FINRA)',
            'PCI DSS compliant data retention and governance',
            'Reducing archiving cost with cloud-native SaaS platform',
          ],
          recommendedForKo: [
            '엔터프라이즈 이메일, IM, 소셜 미디어 아카이빙',
            '법적 컴플라이언스를 위한 소송 준비 및 e-디스커버리',
            '금융 서비스 규정 준수 (SEC, FINRA)',
            'PCI DSS 준수 데이터 보존 및 거버넌스',
            '클라우드 네이티브 SaaS 플랫폼으로 아카이빙 비용 절감',
          ],
          supportedProtocols: [
            'REST API', 'SMTP', 'IMAP',
            'SAML 2.0', 'SCIM',
          ],
          haFeatures: [
            'Cloud-native SaaS architecture',
            'PCI DSS certified infrastructure',
            'Multi-region data residency',
            'Immutable archive storage',
          ],
          securityCapabilities: [
            'PCI DSS compliance attestation',
            'Tamper-proof archive storage',
            'Role-based access control',
            'Encryption at rest and in transit',
            'Litigation hold and legal discovery',
            'Regulatory retention policies',
          ],
          children: [
            {
              nodeId: 'proofpoint-archive-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Proofpoint Archive & Discover',
              nameKo: 'Proofpoint 아카이브 및 디스커버',
              description:
                'SaaS archiving and e-discovery platform with PCI DSS compliance, immutable storage, litigation hold, and ML-powered content search across email, IM, voice, and social channels',
              descriptionKo:
                'PCI DSS 준수, 불변 스토리지, 소송 보류, 이메일, IM, 음성, 소셜 채널 전반의 ML 기반 콘텐츠 검색을 갖춘 SaaS 아카이빙 및 e-디스커버리 플랫폼',
              sourceUrl: 'https://www.proofpoint.com/us/products/archiving-and-compliance',
              infraNodeTypes: ['siem'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Cloud Archive & e-Discovery',
              architectureRoleKo: '클라우드 아카이브 및 e-디스커버리',
              recommendedFor: [
                'Archiving enterprise communications for regulatory compliance',
                'Enabling rapid e-discovery for litigation preparedness',
                'Retaining email, IM, social, and voice communications',
              ],
              recommendedForKo: [
                '규정 준수를 위한 엔터프라이즈 커뮤니케이션 아카이빙',
                '소송 준비를 위한 신속한 e-디스커버리 지원',
                '이메일, IM, 소셜, 음성 커뮤니케이션 보존',
              ],
              securityCapabilities: [
                'PCI DSS certified archiving',
                'Immutable and tamper-proof storage',
                'Role-based access and encryption',
                'Litigation hold management',
                'ML-powered content search',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Channels': 'Email, IM, social media, voice, mobile, meetings',
                'Compliance': 'PCI DSS, SEC, FINRA, IIROC, GDPR',
                'Search': 'ML-powered full-text search across all channels',
                'Retention': 'Configurable retention policies with litigation hold',
                'Certifications': 'PCI DSS compliance attestation',
              },
              children: [],
            },
          ],
        },

        // -- Proofpoint Intelligent Compliance --
        {
          nodeId: 'proofpoint-compliance',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Proofpoint Intelligent Compliance',
          nameKo: 'Proofpoint 지능형 컴플라이언스',
          description:
            'Regulatory compliance monitoring platform with ML-powered supervision, automated review, and audit capabilities for SEC, FINRA, and IIROC regulated communications',
          descriptionKo:
            'SEC, FINRA, IIROC 규제 커뮤니케이션을 위한 ML 기반 감독, 자동 검토, 감사 기능을 갖춘 규정 준수 모니터링 플랫폼',
          sourceUrl: 'https://www.proofpoint.com/us/products/archiving-and-compliance',
          infraNodeTypes: ['siem'],
          architectureRole: 'Regulatory Compliance Monitoring / Communication Supervision',
          architectureRoleKo: '규정 준수 모니터링 / 커뮤니케이션 감독',
          recommendedFor: [
            'SEC and FINRA regulatory compliance for financial communications',
            'ML-powered automated content review reducing reviewer fatigue',
            'Supervision of email, social, and collaboration communications',
            'Audit trail and reporting for regulatory examinations',
            'Organizations with complex multi-channel compliance requirements',
          ],
          recommendedForKo: [
            '금융 커뮤니케이션에 대한 SEC 및 FINRA 규정 준수',
            '검토자 피로를 줄이는 ML 기반 자동 콘텐츠 검토',
            '이메일, 소셜, 협업 커뮤니케이션 감독',
            '규제 검사를 위한 감사 추적 및 보고',
            '복잡한 다중 채널 컴플라이언스 요구 사항을 가진 조직',
          ],
          supportedProtocols: [
            'REST API', 'SAML 2.0', 'SCIM',
            'SMTP',
          ],
          haFeatures: [
            'Cloud-native SaaS platform',
            'ML-powered automated review',
            'Configurable supervision policies',
          ],
          securityCapabilities: [
            'ML-powered content supervision and review',
            'Automated low-risk content filtering',
            'SEC, FINRA, IIROC compliance monitoring',
            'Policy-based communication flagging',
            'Audit trail and examination reporting',
            'Multi-channel supervision (email, social, collaboration)',
          ],
          children: [
            {
              nodeId: 'proofpoint-compliance-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Proofpoint Supervision & Automate',
              nameKo: 'Proofpoint 슈퍼비전 및 오토메이트',
              description:
                'ML-powered compliance supervision platform with automated content review, policy-based flagging, and regulatory audit reporting for SEC, FINRA, and IIROC requirements',
              descriptionKo:
                'SEC, FINRA, IIROC 요구사항을 위한 ML 기반 자동 콘텐츠 검토, 정책 기반 플래그, 규제 감사 보고를 갖춘 컴플라이언스 감독 플랫폼',
              sourceUrl: 'https://www.proofpoint.com/us/products/archiving-and-compliance',
              infraNodeTypes: ['siem'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Compliance Supervision & Automated Review',
              architectureRoleKo: '컴플라이언스 감독 및 자동 검토',
              recommendedFor: [
                'Automating regulatory compliance review for financial firms',
                'Reducing reviewer fatigue with ML-powered content filtering',
                'Meeting SEC, FINRA, IIROC supervision requirements',
              ],
              recommendedForKo: [
                '금융 회사의 규정 준수 검토 자동화',
                'ML 기반 콘텐츠 필터링으로 검토자 피로 감소',
                'SEC, FINRA, IIROC 감독 요구사항 충족',
              ],
              securityCapabilities: [
                'ML-powered automated content review',
                'Policy-based communication supervision',
                'Low-risk content auto-filtering',
                'Regulatory audit trail',
                'Multi-channel compliance monitoring',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Channels': 'Email, social media, collaboration, voice, mobile',
                'ML Automation': 'Low-risk content filtering, priority scoring',
                'Compliance': 'SEC Rule 17a-4, FINRA Rules 3110/3120, IIROC',
                'Reporting': 'Audit trail, examination-ready reports',
                'Supervision': 'Policy-based flagging, review workflows',
              },
              children: [],
            },
          ],
        },

        // -- Proofpoint Digital Risk Protection --
        {
          nodeId: 'proofpoint-digital-risk-protection',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Proofpoint Digital Risk Protection',
          nameKo: 'Proofpoint 디지털 위험 보호',
          description:
            'Brand and domain protection platform monitoring digital footprint, detecting impersonation, and protecting against brand abuse across web, social media, and dark web channels',
          descriptionKo:
            '디지털 발자국을 모니터링하고 사칭을 탐지하며 웹, 소셜 미디어, 다크 웹 채널 전반에서 브랜드 남용을 방지하는 브랜드 및 도메인 보호 플랫폼',
          sourceUrl: 'https://www.proofpoint.com/us/products',
          infraNodeTypes: ['siem'],
          architectureRole: 'Digital Risk Protection / Brand Protection',
          architectureRoleKo: '디지털 위험 보호 / 브랜드 보호',
          recommendedFor: [
            'Brand impersonation detection and domain monitoring',
            'Social media account protection and abuse detection',
            'Dark web monitoring for leaked credentials and brand mentions',
            'Digital footprint discovery and attack surface reduction',
            'Proactive takedown of phishing and impersonation sites',
          ],
          recommendedForKo: [
            '브랜드 사칭 탐지 및 도메인 모니터링',
            '소셜 미디어 계정 보호 및 남용 탐지',
            '유출된 자격 증명 및 브랜드 언급에 대한 다크 웹 모니터링',
            '디지털 발자국 발견 및 공격 표면 축소',
            '피싱 및 사칭 사이트의 선제적 차단',
          ],
          supportedProtocols: [
            'REST API', 'HTTPS', 'DNS',
            'SAML 2.0',
          ],
          haFeatures: [
            'Cloud-native monitoring platform',
            'Continuous digital footprint scanning',
            'Automated takedown workflows',
          ],
          securityCapabilities: [
            'Brand impersonation detection',
            'Domain and subdomain monitoring',
            'Social media account protection',
            'Dark web credential monitoring',
            'Phishing site takedown service',
            'Digital footprint discovery',
            'Executive impersonation detection',
          ],
          children: [
            {
              nodeId: 'proofpoint-digital-risk-protection-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Proofpoint Digital Risk Platform',
              nameKo: 'Proofpoint 디지털 위험 플랫폼',
              description:
                'Continuous digital risk monitoring platform detecting brand impersonation, domain abuse, social media threats, and dark web exposure with automated takedown capabilities',
              descriptionKo:
                '브랜드 사칭, 도메인 남용, 소셜 미디어 위협, 다크 웹 노출을 탐지하고 자동 차단 기능을 갖춘 지속적 디지털 위험 모니터링 플랫폼',
              sourceUrl: 'https://www.proofpoint.com/us/products',
              infraNodeTypes: ['siem'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Digital Risk & Brand Protection',
              architectureRoleKo: '디지털 위험 및 브랜드 보호',
              recommendedFor: [
                'Detecting and taking down brand impersonation sites',
                'Monitoring dark web for leaked credentials and brand abuse',
                'Protecting social media presence from account takeover',
              ],
              recommendedForKo: [
                '브랜드 사칭 사이트 탐지 및 차단',
                '유출된 자격 증명 및 브랜드 남용에 대한 다크 웹 모니터링',
                '계정 탈취로부터 소셜 미디어 존재 보호',
              ],
              securityCapabilities: [
                'Brand impersonation site detection',
                'Domain abuse monitoring',
                'Social media threat detection',
                'Dark web exposure monitoring',
                'Automated takedown service',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Monitoring': 'Web, social media, dark web, domains',
                'Detection': 'Brand impersonation, phishing sites, domain abuse',
                'Response': 'Automated takedown workflows',
                'Coverage': 'Global domain, social, and dark web monitoring',
                'Reporting': 'Executive dashboards, threat trend analysis',
              },
              children: [],
            },
          ],
        },
      ],
    },
  ],
};
