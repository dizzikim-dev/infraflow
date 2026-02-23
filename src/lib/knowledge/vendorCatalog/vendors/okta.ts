/**
 * Okta -- Full Product Catalog
 *
 * Hierarchical product tree covering Workforce Identity Cloud, Customer Identity
 * Cloud (Auth0), Identity Governance, and Identity Security categories.
 *
 * Data sourced from https://www.okta.com/products/
 * Last crawled: 2026-02-22
 */

import type { VendorCatalog } from '../types';

// ---------------------------------------------------------------------------
// Okta Product Catalog
// ---------------------------------------------------------------------------

export const oktaCatalog: VendorCatalog = {
  vendorId: 'okta',
  vendorName: 'Okta',
  vendorNameKo: '옥타',
  headquarters: 'San Francisco, CA, USA',
  website: 'https://www.okta.com',
  productPageUrl: 'https://www.okta.com/products/',
  depthStructure: ['category', 'product-line', 'module'],
  depthStructureKo: ['카테고리', '제품 라인', '모듈'],
  lastCrawled: '2026-02-22',
  crawlSource: 'https://www.okta.com/products/',
  stats: { totalProducts: 34, maxDepth: 2, categoriesCount: 4 },
  products: [
    // =====================================================================
    // 1. Workforce Identity Cloud
    // =====================================================================
    {
      nodeId: 'okta-workforce-identity',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Workforce Identity Cloud',
      nameKo: '워크포스 아이덴티티 클라우드',
      description:
        'Cloud-native identity platform securing employee and partner access with SSO, MFA, directory services, lifecycle management, and privileged access',
      descriptionKo:
        'SSO, MFA, 디렉터리 서비스, 라이프사이클 관리, 특권 접근으로 직원 및 파트너 접근을 보호하는 클라우드 네이티브 아이덴티티 플랫폼',
      sourceUrl: 'https://www.okta.com/products/',
      infraNodeTypes: ['sso', 'mfa', 'iam', 'ldap-ad'],
      children: [
        // ── Single Sign-On ──
        {
          nodeId: 'okta-sso-line',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Single Sign-On',
          nameKo: '싱글 사인온',
          description:
            'Enterprise SSO enabling one-click access to 8,000+ cloud and on-premises applications with pre-built integrations',
          descriptionKo:
            '8,000개 이상의 클라우드 및 온프레미스 애플리케이션에 원클릭 접근을 제공하는 엔터프라이즈 SSO',
          sourceUrl: 'https://www.okta.com/products/single-sign-on/',
          infraNodeTypes: ['sso'],
          architectureRole: 'Centralized Authentication / Identity Control Plane',
          architectureRoleKo: '중앙 집중식 인증 / 아이덴티티 제어 플레인',
          recommendedFor: [
            'Enterprise SSO consolidation across cloud and on-premises applications',
            'Eliminating password fatigue and reducing help desk tickets',
            'Zero Trust identity verification for hybrid workforce environments',
            'Centralized access policy enforcement across 8,000+ integrations',
          ],
          recommendedForKo: [
            '클라우드 및 온프레미스 애플리케이션 전체의 엔터프라이즈 SSO 통합',
            '비밀번호 피로 해소 및 헬프데스크 티켓 감소',
            '하이브리드 인력 환경을 위한 제로 트러스트 아이덴티티 검증',
            '8,000개 이상 통합에 걸친 중앙 집중식 접근 정책 적용',
          ],
          supportedProtocols: ['SAML 2.0', 'OIDC', 'OAuth 2.0', 'WS-Federation', 'LDAP', 'RADIUS'],
          haFeatures: [
            '99.99% uptime SLA',
            'Multi-region cloud architecture',
            'Active-active redundancy',
            'Automatic failover',
          ],
          securityCapabilities: [
            'Phishing-resistant authentication flows',
            'Centralized access policy enforcement',
            'Real-time session management',
            'Adaptive risk-based access decisions',
            'Integration with AD, LDAP, and HR systems',
          ],
          children: [
            {
              nodeId: 'okta-sso',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Okta SSO',
              nameKo: 'Okta SSO',
              description:
                'Enterprise single sign-on with 8,000+ pre-built integrations, customizable user dashboard, and centralized IT admin console',
              descriptionKo:
                '8,000개 이상의 사전 구축 통합, 사용자 맞춤 대시보드, 중앙 집중식 IT 관리자 콘솔을 갖춘 엔터프라이즈 싱글 사인온',
              sourceUrl: 'https://www.okta.com/products/single-sign-on/',
              infraNodeTypes: ['sso'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Centralized Authentication / Identity Control Plane',
              architectureRoleKo: '중앙 집중식 인증 / 아이덴티티 제어 플레인',
              recommendedFor: [
                'Enterprise SSO consolidation across cloud and on-premises apps',
                'Hybrid workforce identity management with centralized policy',
                'Reducing credential sprawl and password fatigue for end users',
              ],
              recommendedForKo: [
                '클라우드 및 온프레미스 앱 전체의 엔터프라이즈 SSO 통합',
                '중앙 집중식 정책으로 하이브리드 인력 아이덴티티 관리',
                '최종 사용자를 위한 자격 증명 확산 및 비밀번호 피로 감소',
              ],
              supportedProtocols: ['SAML 2.0', 'OIDC', 'OAuth 2.0', 'WS-Federation', 'LDAP', 'RADIUS'],
              securityCapabilities: [
                'Phishing-resistant authentication',
                'Centralized access policy enforcement',
                'Real-time session management',
                'AD/LDAP/HR system integration',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Pre-Built Integrations': '8,000+',
                'Supported Protocols': 'SAML 2.0, OIDC, OAuth 2.0, WS-Federation',
                'Directory Integration': 'Active Directory, LDAP, HR systems',
                'Uptime SLA': '99.99%',
                'User Dashboard': 'Customizable per-user application portal',
                'Admin Console': 'Centralized IT management console',
              },
              children: [],
            },
          ],
        },
        // ── Multi-Factor Authentication ──
        {
          nodeId: 'okta-mfa-line',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Multi-Factor Authentication',
          nameKo: '다중 인증',
          description:
            'Adaptive, context-aware multi-factor authentication with phishing-resistant factors and device compliance enforcement',
          descriptionKo:
            '피싱 방지 인증 요소 및 디바이스 컴플라이언스 적용을 갖춘 적응형 컨텍스트 인식 다중 인증',
          sourceUrl: 'https://www.okta.com/products/adaptive-multi-factor-authentication/',
          infraNodeTypes: ['mfa'],
          architectureRole: 'Adaptive Authentication / Step-Up Verification',
          architectureRoleKo: '적응형 인증 / 단계별 검증',
          recommendedFor: [
            'Phishing-resistant authentication for enterprise workforce',
            'Context-aware step-up authentication for sensitive operations',
            'Device compliance enforcement with real-time posture checks',
            'Passwordless authentication transition strategies',
          ],
          recommendedForKo: [
            '엔터프라이즈 인력을 위한 피싱 방지 인증',
            '민감한 작업에 대한 컨텍스트 인식 단계별 인증',
            '실시간 상태 확인을 통한 디바이스 컴플라이언스 적용',
            '비밀번호 없는 인증 전환 전략',
          ],
          supportedProtocols: ['FIDO2/WebAuthn', 'TOTP', 'Push Notification', 'SMS', 'Voice', 'Email OTP'],
          haFeatures: [
            '99.99% uptime SLA',
            'Cloud-native multi-region deployment',
            'Automatic failover across regions',
          ],
          securityCapabilities: [
            'Phishing-resistant factors (FastPass, FIDO2, PIV/CAC)',
            'Device compliance enforcement',
            'Contextual risk evaluation (device, network, location, behavior)',
            'ThreatInsight IP reputation integration',
            'Session hijacking mitigation',
          ],
          children: [
            {
              nodeId: 'okta-adaptive-mfa',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Okta Adaptive MFA',
              nameKo: 'Okta 적응형 MFA',
              description:
                'Context-aware, phishing-resistant MFA with device compliance checks, risk-based policies, and support for FIDO2, PIV/CAC, and biometric factors',
              descriptionKo:
                '디바이스 컴플라이언스 검사, 위험 기반 정책, FIDO2, PIV/CAC 및 생체 인증 요소를 지원하는 컨텍스트 인식 피싱 방지 MFA',
              sourceUrl: 'https://www.okta.com/products/adaptive-multi-factor-authentication/',
              infraNodeTypes: ['mfa'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Adaptive Authentication / Step-Up Verification',
              architectureRoleKo: '적응형 인증 / 단계별 검증',
              recommendedFor: [
                'Enterprise phishing-resistant MFA deployment',
                'Context-aware step-up authentication based on risk signals',
                'Device compliance enforcement for managed and unmanaged endpoints',
              ],
              recommendedForKo: [
                '엔터프라이즈 피싱 방지 MFA 배포',
                '위험 신호 기반 컨텍스트 인식 단계별 인증',
                '관리 및 비관리 엔드포인트에 대한 디바이스 컴플라이언스 적용',
              ],
              supportedProtocols: ['FIDO2/WebAuthn', 'TOTP', 'Push Notification', 'SMS', 'Voice', 'Email OTP'],
              securityCapabilities: [
                'Phishing-resistant factors (FIDO2, PIV/CAC, smart cards)',
                'Real-time device compliance posture checks',
                'Contextual risk evaluation (device, network, location, behavior)',
                'ThreatInsight IP reputation blocking',
                'Biometric and step-up authentication',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Phishing-Resistant Factors': 'FIDO2/WebAuthn, PIV/CAC, Okta FastPass',
                'Risk Signals': 'Device, network, location, user behavior, IP reputation',
                'Device Compliance': 'Real-time posture checks for managed/unmanaged devices',
                'MFA Friction Reduction': '~50% reduction in 2nd factor response time',
                'Pre-Built Integrations': '7,000+',
                'Uptime SLA': '99.99%',
              },
              children: [],
            },
            {
              nodeId: 'okta-fastpass',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Okta FastPass',
              nameKo: 'Okta FastPass',
              description:
                'Passwordless, device-bound phishing-resistant authenticator providing seamless zero-trust access across desktop and mobile platforms',
              descriptionKo:
                '데스크탑 및 모바일 플랫폼에서 원활한 제로 트러스트 접근을 제공하는 비밀번호 없는 디바이스 바인딩 피싱 방지 인증자',
              sourceUrl: 'https://www.okta.com/products/adaptive-multi-factor-authentication/',
              infraNodeTypes: ['mfa'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Passwordless Authentication / Device-Bound Credential',
              architectureRoleKo: '비밀번호 없는 인증 / 디바이스 바인딩 자격 증명',
              recommendedFor: [
                'Passwordless authentication replacing passwords enterprise-wide',
                'Phishing-resistant device-bound credential for Zero Trust architectures',
                'Seamless user experience with biometric verification on managed devices',
              ],
              recommendedForKo: [
                '엔터프라이즈 전체에서 비밀번호를 대체하는 비밀번호 없는 인증',
                '제로 트러스트 아키텍처를 위한 피싱 방지 디바이스 바인딩 자격 증명',
                '관리 디바이스에서 생체 인증을 통한 원활한 사용자 경험',
              ],
              securityCapabilities: [
                'Device-bound phishing-resistant credential',
                'Biometric verification (Touch ID, Windows Hello)',
                'Zero Trust device trust integration',
                'Eliminates password-based attack vectors',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS + Okta Verify agent',
                'Authentication Method': 'Device-bound, phishing-resistant credential',
                'Supported Platforms': 'Windows, macOS, iOS, Android',
                'Biometric Support': 'Touch ID, Face ID, Windows Hello',
                'Phishing Resistance': 'Device-bound key eliminates credential theft',
                'User Experience': 'One-tap or biometric verification, no password required',
              },
              children: [],
            },
          ],
        },
        // ── Universal Directory ──
        {
          nodeId: 'okta-directory-line',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Universal Directory',
          nameKo: '유니버설 디렉터리',
          description:
            'Cloud-based centralized identity repository consolidating users, groups, and devices from multiple sources including AD and LDAP',
          descriptionKo:
            'AD 및 LDAP를 포함한 다양한 소스의 사용자, 그룹 및 디바이스를 통합하는 클라우드 기반 중앙 집중식 아이덴티티 저장소',
          sourceUrl: 'https://www.okta.com/products/universal-directory/',
          infraNodeTypes: ['ldap-ad'],
          architectureRole: 'Cloud Directory / Identity Source of Truth',
          architectureRoleKo: '클라우드 디렉터리 / 아이덴티티 소스 오브 트루스',
          recommendedFor: [
            'Centralized cloud directory replacing or extending on-premises AD/LDAP',
            'User profile management with customizable attribute mappings across identity sources',
            'M&A identity consolidation with cross-platform synchronization',
          ],
          recommendedForKo: [
            '온프레미스 AD/LDAP를 대체하거나 확장하는 중앙 집중식 클라우드 디렉터리',
            '아이덴티티 소스 전체에 걸친 사용자 프로필 관리 및 맞춤 속성 매핑',
            'M&A 아이덴티티 통합 및 크로스 플랫폼 동기화',
          ],
          supportedProtocols: ['LDAP', 'SCIM 2.0', 'SAML 2.0', 'OIDC'],
          securityCapabilities: [
            'Unified identity source of truth',
            'Cross-platform identity synchronization',
            'Automated deprovisioning on lifecycle events',
            'Customizable attribute-based access policies',
          ],
          children: [
            {
              nodeId: 'okta-universal-directory',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Okta Universal Directory',
              nameKo: 'Okta 유니버설 디렉터리',
              description:
                'Cloud directory consolidating users, groups, and devices from AD, LDAP, and HR systems into a single source of truth with customizable profile attributes',
              descriptionKo:
                'AD, LDAP 및 HR 시스템의 사용자, 그룹, 디바이스를 맞춤 프로필 속성과 함께 단일 소스 오브 트루스로 통합하는 클라우드 디렉터리',
              sourceUrl: 'https://www.okta.com/products/universal-directory/',
              infraNodeTypes: ['ldap-ad'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Cloud Directory / Identity Source of Truth',
              architectureRoleKo: '클라우드 디렉터리 / 아이덴티티 소스 오브 트루스',
              recommendedFor: [
                'Centralized cloud directory replacing or extending on-premises AD/LDAP',
                'User profile management with customizable attribute mappings',
                'M&A identity consolidation achieving up to 5x faster integration',
              ],
              recommendedForKo: [
                '온프레미스 AD/LDAP를 대체하거나 확장하는 중앙 집중식 클라우드 디렉터리',
                '맞춤 속성 매핑을 통한 사용자 프로필 관리',
                '최대 5배 빠른 통합을 달성하는 M&A 아이덴티티 통합',
              ],
              supportedProtocols: ['LDAP', 'SCIM 2.0', 'SAML 2.0', 'OIDC'],
              securityCapabilities: [
                'Unified identity source of truth',
                'Cross-platform identity synchronization',
                'Automated lifecycle-driven deprovisioning',
                'Customizable attribute-based access policies',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Directory Sources': 'Active Directory, LDAP, HR systems (Workday, etc.)',
                'Profile Management': 'Customizable attribute mappings per source',
                'Integration Speed': 'Up to 5x faster M&A identity consolidation',
                'Cost Savings': 'Avg. $50K/customer by eliminating on-prem ADFS/LDAP maintenance',
                'Synchronization': 'Real-time cross-platform identity sync',
              },
              children: [],
            },
          ],
        },
        // ── Lifecycle Management ──
        {
          nodeId: 'okta-lifecycle-line',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Lifecycle Management',
          nameKo: '라이프사이클 관리',
          description:
            'Automated user provisioning and deprovisioning across joiner, mover, and leaver workflows with 7,000+ application connectors',
          descriptionKo:
            '7,000개 이상의 애플리케이션 커넥터를 통한 입사, 이동, 퇴사 워크플로우의 자동화된 사용자 프로비저닝 및 디프로비저닝',
          sourceUrl: 'https://www.okta.com/products/lifecycle-management/',
          infraNodeTypes: ['iam'],
          architectureRole: 'Identity Lifecycle Automation / Provisioning Engine',
          architectureRoleKo: '아이덴티티 라이프사이클 자동화 / 프로비저닝 엔진',
          recommendedFor: [
            'Automated joiner-mover-leaver workflows for enterprise HR integration',
            'Application provisioning and deprovisioning across 7,000+ connectors',
            'Reducing security gaps from manual provisioning processes',
          ],
          recommendedForKo: [
            '엔터프라이즈 HR 통합을 위한 자동화된 입사-이동-퇴사 워크플로우',
            '7,000개 이상 커넥터의 애플리케이션 프로비저닝 및 디프로비저닝',
            '수동 프로비저닝 프로세스의 보안 격차 감소',
          ],
          supportedProtocols: ['SCIM 2.0', 'SAML 2.0', 'OIDC', 'REST API'],
          securityCapabilities: [
            'Automated deprovisioning on termination events',
            'Date-based and inactivity-based access revocation',
            'Audit trail for all provisioning actions',
            'No-code workflow customization via Okta Workflows',
          ],
          children: [
            {
              nodeId: 'okta-lifecycle-management',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Okta Lifecycle Management',
              nameKo: 'Okta 라이프사이클 관리',
              description:
                'Automated provisioning and deprovisioning engine connecting HR systems with 7,000+ application integrations for seamless joiner-mover-leaver workflows',
              descriptionKo:
                'HR 시스템과 7,000개 이상의 애플리케이션 통합을 연결하여 원활한 입사-이동-퇴사 워크플로우를 제공하는 자동화된 프로비저닝/디프로비저닝 엔진',
              sourceUrl: 'https://www.okta.com/products/lifecycle-management/',
              infraNodeTypes: ['iam'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Identity Lifecycle Automation / Provisioning Engine',
              architectureRoleKo: '아이덴티티 라이프사이클 자동화 / 프로비저닝 엔진',
              recommendedFor: [
                'Automated joiner-mover-leaver workflows with HR system integration',
                'Reducing app onboarding time from weeks to one day',
                'Eliminating security gaps from manual provisioning and deprovisioning',
              ],
              recommendedForKo: [
                'HR 시스템 통합을 통한 자동화된 입사-이동-퇴사 워크플로우',
                '앱 온보딩 시간을 수주에서 하루로 단축',
                '수동 프로비저닝 및 디프로비저닝의 보안 격차 제거',
              ],
              supportedProtocols: ['SCIM 2.0', 'SAML 2.0', 'OIDC', 'REST API'],
              securityCapabilities: [
                'Automated deprovisioning on termination',
                'Date-based and inactivity-based access revocation',
                'Complete audit trail for provisioning events',
                'No-code workflow automation via Okta Workflows',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Application Connectors': '7,000+ via Okta Integration Network',
                'HR System Integration': 'Workday, SAP SuccessFactors, BambooHR, etc.',
                'Provisioning Model': 'Automated joiner, mover, leaver workflows',
                'Integration Time': 'New app integration in ~1 day (vs. weeks/months)',
                'Workflow Engine': 'Okta Workflows (no-code automation)',
                'Audit': 'Programmatic API access for audit data extraction',
              },
              children: [],
            },
          ],
        },
        // ── API Access Management ──
        {
          nodeId: 'okta-api-access-line',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'API Access Management',
          nameKo: 'API 접근 관리',
          description:
            'OAuth 2.0 and OpenID Connect-based API authorization extending Zero Trust architecture to APIs with centralized policy management',
          descriptionKo:
            '중앙 집중식 정책 관리로 제로 트러스트 아키텍처를 API까지 확장하는 OAuth 2.0 및 OpenID Connect 기반 API 인가',
          sourceUrl: 'https://www.okta.com/products/api-access-management/',
          infraNodeTypes: ['api-gateway', 'iam'],
          architectureRole: 'API Authorization Gateway / OAuth 2.0 Authorization Server',
          architectureRoleKo: 'API 인가 게이트웨이 / OAuth 2.0 인가 서버',
          recommendedFor: [
            'Centralized API authorization with OAuth 2.0 policy management',
            'Extending Zero Trust architecture to internal and external APIs',
            'Replacing XML-based API policy configurations with modern identity frameworks',
          ],
          recommendedForKo: [
            'OAuth 2.0 정책 관리를 통한 중앙 집중식 API 인가',
            '내부 및 외부 API까지 제로 트러스트 아키텍처 확장',
            '기존 XML 기반 API 정책 구성을 최신 아이덴티티 프레임워크로 대체',
          ],
          supportedProtocols: ['OAuth 2.0', 'OIDC', 'SAML 2.0', 'REST API'],
          securityCapabilities: [
            'Centralized API authorization policies',
            'Application, user context, and group-based access control',
            'Certified OpenID Connect provider with 12+ key extensions',
            'User-driven and machine-to-machine API authorization',
          ],
          children: [
            {
              nodeId: 'okta-api-access-management',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Okta API Access Management',
              nameKo: 'Okta API 접근 관리',
              description:
                'Certified OpenID Connect provider and OAuth 2.0 authorization server for centralized API security with application, user, and group-based policy management',
              descriptionKo:
                '애플리케이션, 사용자 및 그룹 기반 정책 관리를 통한 중앙 집중식 API 보안을 위한 인증된 OpenID Connect 제공자 및 OAuth 2.0 인가 서버',
              sourceUrl: 'https://www.okta.com/products/api-access-management/',
              infraNodeTypes: ['api-gateway', 'iam'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'API Authorization Gateway / OAuth 2.0 Authorization Server',
              architectureRoleKo: 'API 인가 게이트웨이 / OAuth 2.0 인가 서버',
              recommendedFor: [
                'Centralized API authorization replacing distributed policy enforcement',
                'Zero Trust API security for microservices and partner integrations',
                'OAuth 2.0 policy management reducing XML-based configuration from hours to minutes',
              ],
              recommendedForKo: [
                '분산 정책 적용을 대체하는 중앙 집중식 API 인가',
                '마이크로서비스 및 파트너 통합을 위한 제로 트러스트 API 보안',
                'XML 기반 구성을 수시간에서 수분으로 단축하는 OAuth 2.0 정책 관리',
              ],
              supportedProtocols: ['OAuth 2.0', 'OIDC', 'SAML 2.0', 'REST API'],
              securityCapabilities: [
                'Certified OpenID Connect provider with 12+ key extensions',
                'Application, user context, and group-based access policies',
                'User-driven and machine-to-machine authorization',
                'Centralized API audit and compliance',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Authorization Standard': 'OAuth 2.0, Certified OIDC Provider',
                'OIDC Extensions': '12+ key extensions for simplified OAuth usage',
                'Policy Types': 'Application-based, user context-based, group membership-based',
                'Use Cases': 'User-driven APIs, machine-to-machine (M2M) APIs',
                'Integration Time': 'API integration in ~1 day (vs. over a week)',
              },
              children: [],
            },
          ],
        },
        // ── Privileged Access ──
        {
          nodeId: 'okta-privileged-access-line',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Okta Privileged Access',
          nameKo: 'Okta 특권 접근',
          description:
            'Cloud-native privileged access management unifying SSH/RDP session management, secrets vaulting, and service account governance',
          descriptionKo:
            'SSH/RDP 세션 관리, 시크릿 볼팅, 서비스 계정 거버넌스를 통합하는 클라우드 네이티브 특권 접근 관리',
          sourceUrl: 'https://www.okta.com/products/privileged-access/',
          infraNodeTypes: ['iam'],
          architectureRole: 'Privileged Access Management (PAM) / Infrastructure Access Broker',
          architectureRoleKo: '특권 접근 관리 (PAM) / 인프라 접근 브로커',
          recommendedFor: [
            'Unified PAM for cloud and on-premises infrastructure access',
            'Eliminating static SSH keys and standing privileges',
            'Service account governance with automated credential rotation',
          ],
          recommendedForKo: [
            '클라우드 및 온프레미스 인프라 접근을 위한 통합 PAM',
            '정적 SSH 키 및 상시 권한 제거',
            '자동화된 자격 증명 로테이션을 통한 서비스 계정 거버넌스',
          ],
          supportedProtocols: ['SSH', 'RDP', 'HTTPS', 'REST API'],
          securityCapabilities: [
            'SSH/RDP session recording and auditing',
            'Just-in-time privileged access with time-bound grants',
            'Automated credential discovery and rotation',
            'Multi-step approval workflows with business justification',
            'Non-human identity (NHI) management',
          ],
          children: [
            {
              nodeId: 'okta-privileged-access',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Okta Privileged Access',
              nameKo: 'Okta 특권 접근',
              description:
                'Unified PAM solution for cloud infrastructure with SSH/RDP session management, secrets vaulting, automated credential rotation, and just-in-time access grants',
              descriptionKo:
                'SSH/RDP 세션 관리, 시크릿 볼팅, 자동 자격 증명 로테이션, JIT 접근 부여를 갖춘 클라우드 인프라용 통합 PAM 솔루션',
              sourceUrl: 'https://www.okta.com/products/privileged-access/',
              infraNodeTypes: ['iam'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Privileged Access Management (PAM) / Infrastructure Access Broker',
              architectureRoleKo: '특권 접근 관리 (PAM) / 인프라 접근 브로커',
              recommendedFor: [
                'Eliminating static SSH keys and passwords for infrastructure access',
                'Just-in-time privileged access with multi-step approval workflows',
                'Service account and non-human identity governance with audit trails',
              ],
              recommendedForKo: [
                '인프라 접근을 위한 정적 SSH 키 및 비밀번호 제거',
                '다단계 승인 워크플로우를 통한 JIT 특권 접근',
                '감사 추적을 갖춘 서비스 계정 및 비인간 아이덴티티 거버넌스',
              ],
              supportedProtocols: ['SSH', 'RDP', 'HTTPS', 'REST API'],
              securityCapabilities: [
                'SSH/RDP session recording and compliance auditing',
                'Just-in-time access with time-bound grants',
                'Automated credential discovery and scheduled rotation',
                'Multi-step approval with business justification requirements',
                'Non-human identity (NHI) controls',
                'Integration with Okta System Log for audit',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Session Management': 'SSH and RDP session recording and replay',
                'Credential Management': 'Local password vaulting, automated discovery, scheduled rotation',
                'Access Model': 'Just-in-time, time-bound, approval-based',
                'Approval Workflows': 'Multi-step with business justification',
                'Audit Integration': 'Native Okta System Log integration',
                'CLI Support': 'CLI integration for SSH workflows',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 2. Customer Identity Cloud (Auth0)
    // =====================================================================
    {
      nodeId: 'okta-customer-identity',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Customer Identity Cloud (Auth0)',
      nameKo: '고객 아이덴티티 클라우드 (Auth0)',
      description:
        'Developer-friendly customer identity platform providing authentication, security, and user management for consumer and B2B applications',
      descriptionKo:
        '소비자 및 B2B 애플리케이션을 위한 인증, 보안, 사용자 관리를 제공하는 개발자 친화적 고객 아이덴티티 플랫폼',
      sourceUrl: 'https://auth0.com/features',
      infraNodeTypes: ['sso', 'mfa', 'iam'],
      children: [
        // ── Auth0 Authentication ──
        {
          nodeId: 'okta-auth0-authentication',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Auth0 Authentication',
          nameKo: 'Auth0 인증',
          description:
            'Customizable authentication platform with Universal Login, passwordless options, and enterprise federation for customer-facing applications',
          descriptionKo:
            '고객 대면 애플리케이션을 위한 유니버설 로그인, 비밀번호 없는 옵션, 엔터프라이즈 페더레이션을 갖춘 맞춤형 인증 플랫폼',
          sourceUrl: 'https://auth0.com/features',
          infraNodeTypes: ['sso', 'mfa'],
          architectureRole: 'Customer-Facing Authentication / CIAM',
          architectureRoleKo: '고객 대면 인증 / CIAM',
          recommendedFor: [
            'Customer-facing web and mobile application authentication',
            'B2C and B2B SaaS login experiences with enterprise federation',
            'Passwordless authentication for consumer applications using FIDO2 passkeys',
          ],
          recommendedForKo: [
            '고객 대면 웹 및 모바일 애플리케이션 인증',
            '엔터프라이즈 페더레이션을 갖춘 B2C 및 B2B SaaS 로그인 경험',
            'FIDO2 패스키를 사용한 소비자 애플리케이션용 비밀번호 없는 인증',
          ],
          supportedProtocols: ['OIDC', 'OAuth 2.0', 'SAML 2.0', 'LDAP', 'Social Login'],
          securityCapabilities: [
            'Customizable authentication flows',
            'Enterprise federation (SAML, OIDC)',
            'Social login integration',
            'FIDO2 passkey support',
            'Highly Regulated Identity compliance',
          ],
          children: [
            {
              nodeId: 'okta-auth0-universal-login',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Auth0 Universal Login',
              nameKo: 'Auth0 유니버설 로그인',
              description:
                'Customizable, centralized login page supporting social, enterprise, and passwordless authentication with feature-rich branding capabilities',
              descriptionKo:
                '소셜, 엔터프라이즈, 비밀번호 없는 인증을 지원하는 풍부한 브랜딩 기능의 맞춤형 중앙 집중식 로그인 페이지',
              sourceUrl: 'https://auth0.com/features',
              infraNodeTypes: ['sso'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Customer-Facing Authentication / CIAM Login',
              architectureRoleKo: '고객 대면 인증 / CIAM 로그인',
              recommendedFor: [
                'Centralized customer login for web and mobile applications',
                'Branded authentication experiences with social and enterprise login',
                'Rapid authentication integration for SaaS products',
              ],
              recommendedForKo: [
                '웹 및 모바일 애플리케이션을 위한 중앙 집중식 고객 로그인',
                '소셜 및 엔터프라이즈 로그인을 갖춘 브랜딩된 인증 경험',
                'SaaS 제품을 위한 빠른 인증 통합',
              ],
              supportedProtocols: ['OIDC', 'OAuth 2.0', 'SAML 2.0', 'Social Login'],
              securityCapabilities: [
                'Customizable authentication flows and branding',
                'Enterprise federation (SAML, OIDC)',
                'Social login (Google, Facebook, GitHub, etc.)',
                'Passwordless login options',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Login Methods': 'Social, enterprise federation, passwordless, username/password',
                'Branding': 'Fully customizable login page with feature-rich branding',
                'Federation Protocols': 'SAML 2.0, OIDC, OAuth 2.0',
                'Social Providers': 'Google, Facebook, GitHub, Apple, Microsoft, and more',
                'Uptime SLA': '99.99% (Enterprise plan)',
              },
              children: [],
            },
            {
              nodeId: 'okta-auth0-passkeys',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Auth0 Passkeys',
              nameKo: 'Auth0 패스키',
              description:
                'FIDO2-compliant passwordless authentication using platform and cross-device passkeys for secure, frictionless customer login',
              descriptionKo:
                '안전하고 마찰 없는 고객 로그인을 위한 플랫폼 및 크로스 디바이스 패스키를 사용하는 FIDO2 호환 비밀번호 없는 인증',
              sourceUrl: 'https://auth0.com/features',
              infraNodeTypes: ['mfa'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Passwordless CIAM / FIDO2 Authentication',
              architectureRoleKo: '비밀번호 없는 CIAM / FIDO2 인증',
              recommendedFor: [
                'Passwordless customer authentication using FIDO2 passkeys',
                'Reducing account takeover risk with phishing-resistant credentials',
                'Improving conversion rates by eliminating password friction in consumer apps',
              ],
              recommendedForKo: [
                'FIDO2 패스키를 사용한 비밀번호 없는 고객 인증',
                '피싱 방지 자격 증명으로 계정 탈취 위험 감소',
                '소비자 앱에서 비밀번호 마찰 제거를 통한 전환율 향상',
              ],
              securityCapabilities: [
                'FIDO2/WebAuthn compliant passkeys',
                'Platform passkeys (Touch ID, Face ID, Windows Hello)',
                'Cross-device passkeys with QR code linking',
                'Phishing-resistant by design',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Standard': 'FIDO2/WebAuthn compliant',
                'Passkey Types': 'Platform passkeys, cross-device passkeys',
                'Biometric Support': 'Touch ID, Face ID, Windows Hello',
                'Cross-Device': 'QR code-based device linking',
                'Phishing Resistance': 'Built-in (no phishable credentials)',
              },
              children: [],
            },
          ],
        },
        // ── Auth0 Security ──
        {
          nodeId: 'okta-auth0-security',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Auth0 Security',
          nameKo: 'Auth0 보안',
          description:
            'Identity security layer providing bot detection, breached password protection, and risk-based adaptive MFA for customer applications',
          descriptionKo:
            '고객 애플리케이션을 위한 봇 탐지, 유출 비밀번호 보호, 위험 기반 적응형 MFA를 제공하는 아이덴티티 보안 레이어',
          sourceUrl: 'https://auth0.com/features',
          infraNodeTypes: ['mfa', 'iam'],
          architectureRole: 'CIAM Security Layer / Identity Threat Prevention',
          architectureRoleKo: 'CIAM 보안 레이어 / 아이덴티티 위협 방지',
          recommendedFor: [
            'Bot detection and credential stuffing protection for customer apps',
            'Breached password detection and forced password reset workflows',
            'Risk-based adaptive MFA for consumer-facing identity security',
          ],
          recommendedForKo: [
            '고객 앱을 위한 봇 탐지 및 자격 증명 스터핑 방지',
            '유출 비밀번호 탐지 및 강제 비밀번호 재설정 워크플로우',
            '소비자 대면 아이덴티티 보안을 위한 위험 기반 적응형 MFA',
          ],
          securityCapabilities: [
            'Bot detection and mitigation',
            'Breached password database checks',
            'Credential stuffing protection',
            'Risk-based adaptive MFA',
            'Suspicious IP throttling',
          ],
          children: [
            {
              nodeId: 'okta-auth0-attack-protection',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Auth0 Attack Protection',
              nameKo: 'Auth0 공격 방지',
              description:
                'Identity security suite with bot detection, breached password checks, brute force protection, and suspicious IP throttling for customer-facing applications',
              descriptionKo:
                '고객 대면 애플리케이션을 위한 봇 탐지, 유출 비밀번호 검사, 무차별 대입 방지, 의심 IP 제한을 갖춘 아이덴티티 보안 제품군',
              sourceUrl: 'https://auth0.com/features',
              infraNodeTypes: ['iam'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'CIAM Threat Prevention / Fraud Detection',
              architectureRoleKo: 'CIAM 위협 방지 / 사기 탐지',
              recommendedFor: [
                'Bot detection and automated attack mitigation for consumer apps',
                'Breached password detection with proactive user alerts',
                'Brute force and credential stuffing protection for login endpoints',
              ],
              recommendedForKo: [
                '소비자 앱을 위한 봇 탐지 및 자동화된 공격 완화',
                '사전 사용자 알림을 통한 유출 비밀번호 탐지',
                '로그인 엔드포인트를 위한 무차별 대입 및 자격 증명 스터핑 방지',
              ],
              securityCapabilities: [
                'Bot detection and mitigation',
                'Breached password database checks with proactive alerts',
                'Brute force protection',
                'Suspicious IP throttling',
                'Credential stuffing protection',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Bot Detection': 'Automated bot detection and challenge',
                'Password Security': 'Breached password database checks with proactive alerts',
                'Brute Force': 'Automatic account lockout with configurable thresholds',
                'IP Throttling': 'Suspicious IP address throttling and blocking',
                'Credential Stuffing': 'Automated detection and mitigation',
              },
              children: [],
            },
            {
              nodeId: 'okta-auth0-adaptive-mfa',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Auth0 Adaptive MFA',
              nameKo: 'Auth0 적응형 MFA',
              description:
                'Risk-based step-up multi-factor authentication for customer applications with contextual assessment and flexible factor options',
              descriptionKo:
                '상황별 평가 및 유연한 인증 요소 옵션을 갖춘 고객 애플리케이션용 위험 기반 단계별 다중 인증',
              sourceUrl: 'https://auth0.com/features',
              infraNodeTypes: ['mfa'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'CIAM Adaptive MFA / Risk-Based Step-Up Authentication',
              architectureRoleKo: 'CIAM 적응형 MFA / 위험 기반 단계별 인증',
              recommendedFor: [
                'Risk-based step-up MFA for customer-facing applications',
                'Balancing security with user experience in consumer login flows',
                'Adaptive authentication based on device, location, and behavior context',
              ],
              recommendedForKo: [
                '고객 대면 애플리케이션을 위한 위험 기반 단계별 MFA',
                '소비자 로그인 흐름에서 보안과 사용자 경험의 균형',
                '디바이스, 위치, 행동 컨텍스트 기반 적응형 인증',
              ],
              securityCapabilities: [
                'Risk-based adaptive MFA triggers',
                'Multiple factor options (SMS, email, push, TOTP)',
                'Contextual risk assessment',
                'Step-up authentication for sensitive transactions',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Risk Assessment': 'Contextual evaluation (device, location, behavior)',
                'MFA Factors': 'SMS, email, push notification, TOTP, WebAuthn',
                'Trigger Model': 'Risk-based adaptive triggering',
                'Step-Up Auth': 'Configurable for sensitive transactions',
                'User Experience': 'Minimal friction for low-risk sessions',
              },
              children: [],
            },
          ],
        },
        // ── Auth0 User Management ──
        {
          nodeId: 'okta-auth0-user-management',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Auth0 User Management',
          nameKo: 'Auth0 사용자 관리',
          description:
            'Developer tools for B2B multi-tenant identity management and serverless identity pipeline customization',
          descriptionKo:
            'B2B 멀티테넌트 아이덴티티 관리 및 서버리스 아이덴티티 파이프라인 맞춤화를 위한 개발자 도구',
          sourceUrl: 'https://auth0.com/features',
          infraNodeTypes: ['iam'],
          architectureRole: 'CIAM User Management / B2B Identity Orchestration',
          architectureRoleKo: 'CIAM 사용자 관리 / B2B 아이덴티티 오케스트레이션',
          recommendedFor: [
            'B2B SaaS multi-tenant identity management with per-org configuration',
            'Serverless identity pipeline extensions for custom business logic',
            'Building customized authentication and authorization workflows',
          ],
          recommendedForKo: [
            '조직별 구성을 갖춘 B2B SaaS 멀티테넌트 아이덴티티 관리',
            '맞춤 비즈니스 로직을 위한 서버리스 아이덴티티 파이프라인 확장',
            '맞춤형 인증 및 인가 워크플로우 구축',
          ],
          supportedProtocols: ['OIDC', 'OAuth 2.0', 'SAML 2.0', 'REST API', 'SCIM 2.0'],
          securityCapabilities: [
            'Per-organization authentication policies',
            'Tenant-level branding and configuration',
            'Serverless identity pipeline customization (Actions)',
            'Role-based access control per organization',
          ],
          children: [
            {
              nodeId: 'okta-auth0-organizations',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Auth0 Organizations',
              nameKo: 'Auth0 오가니제이션',
              description:
                'B2B multi-tenant identity management with per-organization login, branding, authentication policies, and member management',
              descriptionKo:
                '조직별 로그인, 브랜딩, 인증 정책 및 멤버 관리를 갖춘 B2B 멀티테넌트 아이덴티티 관리',
              sourceUrl: 'https://auth0.com/features',
              infraNodeTypes: ['iam'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'B2B Multi-Tenant Identity / Organization Management',
              architectureRoleKo: 'B2B 멀티테넌트 아이덴티티 / 조직 관리',
              recommendedFor: [
                'B2B SaaS with per-organization authentication and branding',
                'Enterprise customer onboarding with delegated administration',
                'Multi-tenant identity isolation with organization-level policies',
              ],
              recommendedForKo: [
                '조직별 인증 및 브랜딩을 갖춘 B2B SaaS',
                '위임 관리를 통한 엔터프라이즈 고객 온보딩',
                '조직 수준 정책으로 멀티테넌트 아이덴티티 격리',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Multi-Tenancy': 'Per-organization login, branding, and policies',
                'Member Management': 'Invitation-based with role assignment',
                'Federation': 'Per-org enterprise federation (SAML, OIDC)',
                'Admin Delegation': 'Delegated administration per organization',
                'Branding': 'Organization-level login page customization',
              },
              children: [],
            },
            {
              nodeId: 'okta-auth0-actions',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Auth0 Actions',
              nameKo: 'Auth0 액션',
              description:
                'Serverless identity pipeline extension framework enabling custom JavaScript functions at key identity flow trigger points',
              descriptionKo:
                '주요 아이덴티티 흐름 트리거 포인트에서 맞춤 JavaScript 함수를 가능하게 하는 서버리스 아이덴티티 파이프라인 확장 프레임워크',
              sourceUrl: 'https://auth0.com/features',
              infraNodeTypes: ['iam'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Identity Pipeline Extension / Serverless Identity Logic',
              architectureRoleKo: '아이덴티티 파이프라인 확장 / 서버리스 아이덴티티 로직',
              recommendedFor: [
                'Custom identity flow logic without managing server infrastructure',
                'Extending authentication and authorization with business-specific rules',
                'Integrating third-party services at identity trigger points',
              ],
              recommendedForKo: [
                '서버 인프라 관리 없이 맞춤 아이덴티티 흐름 로직',
                '비즈니스별 규칙으로 인증 및 인가 확장',
                '아이덴티티 트리거 포인트에서 서드파티 서비스 통합',
              ],
              specs: {
                'Deployment': 'Serverless (managed by Auth0)',
                'Runtime': 'Node.js (JavaScript/TypeScript)',
                'Trigger Points': 'Login, registration, password change, M2M token exchange',
                'Execution Model': 'Synchronous pipeline execution',
                'Marketplace': 'Pre-built Actions in Auth0 Marketplace',
                'Secrets Management': 'Built-in secret storage for API keys and tokens',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 3. Identity Governance
    // =====================================================================
    {
      nodeId: 'okta-identity-governance',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Identity Governance',
      nameKo: '아이덴티티 거버넌스',
      description:
        'Access governance platform automating access requests, certifications, and compliance reporting with 600+ native integrations',
      descriptionKo:
        '600개 이상의 네이티브 통합으로 접근 요청, 인증, 컴플라이언스 보고를 자동화하는 접근 거버넌스 플랫폼',
      sourceUrl: 'https://www.okta.com/products/identity-governance/',
      infraNodeTypes: ['iam'],
      children: [
        // ── Okta Identity Governance ──
        {
          nodeId: 'okta-governance-line',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Okta Identity Governance',
          nameKo: 'Okta 아이덴티티 거버넌스',
          description:
            'Integrated governance platform combining access requests, access certifications, and compliance reporting with risk-based Governance Analyzer',
          descriptionKo:
            '접근 요청, 접근 인증, 컴플라이언스 보고를 위험 기반 거버넌스 분석기와 결합한 통합 거버넌스 플랫폼',
          sourceUrl: 'https://www.okta.com/products/identity-governance/',
          infraNodeTypes: ['iam'],
          architectureRole: 'Identity Governance & Administration (IGA) / Compliance Automation',
          architectureRoleKo: '아이덴티티 거버넌스 및 관리 (IGA) / 컴플라이언스 자동화',
          recommendedFor: [
            'Automated access certification campaigns for regulatory compliance',
            'Self-service access request workflows with approval chains',
            'Compliance audit reporting across 600+ native integrations',
            'Risk-based governance decisions with unified risk signals',
          ],
          recommendedForKo: [
            '규정 준수를 위한 자동화된 접근 인증 캠페인',
            '승인 체인을 갖춘 셀프서비스 접근 요청 워크플로우',
            '600개 이상 네이티브 통합 전체의 컴플라이언스 감사 보고',
            '통합 위험 신호를 통한 위험 기반 거버넌스 결정',
          ],
          supportedProtocols: ['SCIM 2.0', 'REST API', 'SAML 2.0', 'OIDC'],
          securityCapabilities: [
            'Periodic access certification campaigns',
            'Risk-based governance decisions (Governance Analyzer)',
            'Self-service access request with approval workflows',
            'Centralized compliance reporting',
            'Inactive user detection and software license optimization',
          ],
          children: [
            {
              nodeId: 'okta-access-requests',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Okta Access Requests',
              nameKo: 'Okta 접근 요청',
              description:
                'Self-service access request workflows with configurable approval chains, time-bound access grants, and complete audit trails',
              descriptionKo:
                '구성 가능한 승인 체인, 시간 제한 접근 부여, 완전한 감사 추적을 갖춘 셀프서비스 접근 요청 워크플로우',
              sourceUrl: 'https://www.okta.com/products/identity-governance/',
              infraNodeTypes: ['iam'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Access Request Management / Self-Service Governance',
              architectureRoleKo: '접근 요청 관리 / 셀프서비스 거버넌스',
              recommendedFor: [
                'Self-service access request workflows reducing IT ticket burden',
                'Time-bound access grants with automatic revocation',
                'Multi-level approval chains for sensitive resource access',
              ],
              recommendedForKo: [
                'IT 티켓 부담을 줄이는 셀프서비스 접근 요청 워크플로우',
                '자동 해제를 갖춘 시간 제한 접근 부여',
                '민감한 리소스 접근을 위한 다단계 승인 체인',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Request Workflow': 'Self-service with configurable approval chains',
                'Access Duration': 'Time-bound grants with automatic revocation',
                'Approval Levels': 'Multi-level approval with escalation',
                'Audit Trail': 'Complete request, approval, and revocation logging',
                'Native Integrations': '600+',
              },
              children: [],
            },
            {
              nodeId: 'okta-access-certifications',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Okta Access Certifications',
              nameKo: 'Okta 접근 인증',
              description:
                'Periodic access review campaigns enabling managers and resource owners to certify or revoke user access for compliance',
              descriptionKo:
                '관리자 및 리소스 소유자가 컴플라이언스를 위해 사용자 접근을 인증하거나 해제할 수 있는 주기적 접근 검토 캠페인',
              sourceUrl: 'https://www.okta.com/products/identity-governance/',
              infraNodeTypes: ['iam'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Access Certification / Periodic Access Review',
              architectureRoleKo: '접근 인증 / 주기적 접근 검토',
              recommendedFor: [
                'Periodic access reviews for SOX, SOC 2, and HIPAA compliance',
                'Manager and resource owner-driven access certification campaigns',
                'Detecting and revoking excess privileges through automated reviews',
              ],
              recommendedForKo: [
                'SOX, SOC 2, HIPAA 규정 준수를 위한 주기적 접근 검토',
                '관리자 및 리소스 소유자 주도 접근 인증 캠페인',
                '자동화된 검토를 통한 과잉 권한 탐지 및 해제',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Campaign Types': 'Manager review, resource owner review, custom campaigns',
                'Review Actions': 'Approve, revoke, reassign',
                'Automation': 'Scheduled campaigns with automated reminders',
                'Compliance Frameworks': 'SOX, SOC 2, HIPAA, GDPR, ISO 27001',
                'Native Integrations': '600+',
              },
              children: [],
            },
            {
              nodeId: 'okta-governance-reports',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Okta Governance Reports',
              nameKo: 'Okta 거버넌스 보고서',
              description:
                'Centralized compliance reporting providing a single source of truth for access across all identity use cases with risk-based analytics',
              descriptionKo:
                '위험 기반 분석과 함께 모든 아이덴티티 사용 사례 전반의 접근에 대한 단일 소스 오브 트루스를 제공하는 중앙 집중식 컴플라이언스 보고',
              sourceUrl: 'https://www.okta.com/products/identity-governance/',
              infraNodeTypes: ['iam'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Compliance Reporting / Governance Analytics',
              architectureRoleKo: '컴플라이언스 보고 / 거버넌스 분석',
              recommendedFor: [
                'Centralized compliance reporting for audit and regulatory requirements',
                'Risk-based governance analytics with unified risk signals',
                'Inactive user detection for software license optimization',
              ],
              recommendedForKo: [
                '감사 및 규정 요구사항을 위한 중앙 집중식 컴플라이언스 보고',
                '통합 위험 신호를 통한 위험 기반 거버넌스 분석',
                '소프트웨어 라이선스 최적화를 위한 비활성 사용자 탐지',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Report Types': 'Access audit, certification status, risk analytics',
                'Governance Analyzer': 'Unified risk signals for governance decisions',
                'License Optimization': 'Inactive user detection and remediation',
                'Data Source': 'Single source of truth across all identity use cases',
                'Native Integrations': '600+',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 4. Identity Security
    // =====================================================================
    {
      nodeId: 'okta-identity-security',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Identity Security',
      nameKo: '아이덴티티 보안',
      description:
        'Identity threat detection and response (ITDR) platform with continuous risk evaluation, session hijacking protection, and IP reputation intelligence',
      descriptionKo:
        '지속적 위험 평가, 세션 하이재킹 방지, IP 평판 인텔리전스를 갖춘 아이덴티티 위협 탐지 및 대응(ITDR) 플랫폼',
      sourceUrl: 'https://www.okta.com/products/identity-threat-protection/',
      infraNodeTypes: ['iam'],
      children: [
        // ── Identity Threat Protection ──
        {
          nodeId: 'okta-threat-protection-line',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Okta Identity Threat Protection',
          nameKo: 'Okta 아이덴티티 위협 방지',
          description:
            'AI-driven continuous identity risk evaluation with real-time threat detection, automated session termination, and third-party security tool integration',
          descriptionKo:
            '실시간 위협 탐지, 자동화된 세션 종료, 서드파티 보안 도구 통합을 갖춘 AI 기반 지속적 아이덴티티 위험 평가',
          sourceUrl: 'https://www.okta.com/products/identity-threat-protection/',
          infraNodeTypes: ['iam'],
          architectureRole: 'Identity Threat Detection & Response (ITDR) / Continuous Risk Evaluation',
          architectureRoleKo: '아이덴티티 위협 탐지 및 대응 (ITDR) / 지속적 위험 평가',
          recommendedFor: [
            'Continuous identity risk evaluation throughout user sessions',
            'Session hijacking and token theft detection with automated response',
            'Integrating identity signals with SIEM, SOAR, and XDR platforms',
            'Real-time threat visualization and security hardening guidance',
          ],
          recommendedForKo: [
            '사용자 세션 전체에 걸친 지속적 아이덴티티 위험 평가',
            '자동 대응을 갖춘 세션 하이재킹 및 토큰 탈취 탐지',
            'SIEM, SOAR, XDR 플랫폼과의 아이덴티티 신호 통합',
            '실시간 위협 시각화 및 보안 강화 가이드',
          ],
          securityCapabilities: [
            'AI-driven continuous risk assessment',
            'Session hijacking detection and termination',
            'Token theft detection',
            'On-demand MFA challenge during active sessions',
            'Third-party security tool signal integration',
            'Intelligent reporting and threat visualization',
          ],
          children: [
            {
              nodeId: 'okta-identity-threat-protection',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Okta Identity Threat Protection with Okta AI',
              nameKo: 'Okta AI를 갖춘 Okta 아이덴티티 위협 방지',
              description:
                'AI-powered continuous identity risk evaluation detecting session hijacking, token theft, and anomalous behavior with automated response actions across all supported applications',
              descriptionKo:
                '모든 지원 애플리케이션에서 세션 하이재킹, 토큰 탈취, 이상 행동을 자동 대응으로 탐지하는 AI 기반 지속적 아이덴티티 위험 평가',
              sourceUrl: 'https://www.okta.com/products/identity-threat-protection/',
              infraNodeTypes: ['iam'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Identity Threat Detection & Response (ITDR) / AI-Driven Risk Engine',
              architectureRoleKo: '아이덴티티 위협 탐지 및 대응 (ITDR) / AI 기반 위험 엔진',
              recommendedFor: [
                'Continuous identity threat detection during active sessions (post-SSO)',
                'Automated session termination across all supported applications on threat detection',
                'Integrating identity risk signals into existing SOC workflows and SIEM/XDR platforms',
              ],
              recommendedForKo: [
                '활성 세션 중 지속적 아이덴티티 위협 탐지 (SSO 이후)',
                '위협 탐지 시 모든 지원 애플리케이션에서 자동 세션 종료',
                '기존 SOC 워크플로우 및 SIEM/XDR 플랫폼에 아이덴티티 위험 신호 통합',
              ],
              securityCapabilities: [
                'AI-driven continuous risk assessment throughout sessions',
                'Session hijacking detection with cross-app termination',
                'Token theft detection and automated response',
                'On-demand MFA challenge during active sessions',
                'Third-party security signal integration',
                'Intelligent reporting and threat visualization',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'AI Engine': 'Okta AI for continuous risk evaluation',
                'Detection': 'Session hijacking, token theft, anomalous behavior',
                'Response Actions': 'Session termination, MFA challenge, read-only access, custom workflows',
                'Integration': 'SIEM, SOAR, XDR, and SaaS application signals',
                'GA Date': 'August 2024',
                'Identity Breach Context': '80%+ of data breaches stem from identity attacks',
              },
              children: [],
            },
          ],
        },
        // ── ThreatInsight ──
        {
          nodeId: 'okta-threatinsight-line',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Okta ThreatInsight',
          nameKo: 'Okta ThreatInsight',
          description:
            'IP reputation and threat intelligence service providing pre-authentication blocking of credential stuffing, password spraying, and suspicious IPs',
          descriptionKo:
            '자격 증명 스터핑, 비밀번호 스프레이, 의심 IP의 사전 인증 차단을 제공하는 IP 평판 및 위협 인텔리전스 서비스',
          sourceUrl: 'https://www.okta.com/products/identity-threat-protection/',
          infraNodeTypes: ['iam'],
          architectureRole: 'Pre-Authentication Threat Intelligence / IP Reputation Service',
          architectureRoleKo: '사전 인증 위협 인텔리전스 / IP 평판 서비스',
          recommendedFor: [
            'Pre-authentication blocking of credential stuffing and password spray attacks',
            'IP reputation-based threat intelligence at the identity layer',
            'Reducing authentication infrastructure load from automated attacks',
          ],
          recommendedForKo: [
            '자격 증명 스터핑 및 비밀번호 스프레이 공격의 사전 인증 차단',
            '아이덴티티 계층에서의 IP 평판 기반 위협 인텔리전스',
            '자동화된 공격으로부터 인증 인프라 부하 감소',
          ],
          securityCapabilities: [
            'IP reputation scoring and blocking',
            'Credential stuffing detection',
            'Password spray attack prevention',
            'Automated suspicious IP blocking',
            'Pre-authentication threat mitigation',
          ],
          children: [
            {
              nodeId: 'okta-threatinsight',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Okta ThreatInsight',
              nameKo: 'Okta ThreatInsight',
              description:
                'IP reputation and credential stuffing protection service that blocks malicious authentication attempts before they reach login endpoints',
              descriptionKo:
                '악의적 인증 시도가 로그인 엔드포인트에 도달하기 전에 차단하는 IP 평판 및 자격 증명 스터핑 방지 서비스',
              sourceUrl: 'https://www.okta.com/products/identity-threat-protection/',
              infraNodeTypes: ['iam'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Pre-Authentication Threat Intelligence / IP Reputation Service',
              architectureRoleKo: '사전 인증 위협 인텔리전스 / IP 평판 서비스',
              recommendedFor: [
                'Pre-authentication blocking of credential stuffing and password spray attacks',
                'IP reputation-based automatic blocking of known malicious actors',
                'Reducing authentication endpoint load from large-scale automated attacks',
              ],
              recommendedForKo: [
                '자격 증명 스터핑 및 비밀번호 스프레이 공격의 사전 인증 차단',
                '알려진 악의적 행위자의 IP 평판 기반 자동 차단',
                '대규모 자동화 공격으로부터 인증 엔드포인트 부하 감소',
              ],
              securityCapabilities: [
                'IP reputation scoring from Okta network intelligence',
                'Credential stuffing detection and blocking',
                'Password spray attack prevention',
                'Automated suspicious IP blocking',
                'Pre-authentication threat mitigation',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Threat Intelligence': 'Okta network-wide IP reputation database',
                'Detection': 'Credential stuffing, password spray, suspicious IP patterns',
                'Response': 'Automatic pre-authentication blocking',
                'Coverage': 'Applied before authentication attempt reaches login',
                'Integration': 'Native integration with Okta Adaptive MFA policies',
              },
              children: [],
            },
          ],
        },
      ],
    },
  ],
};
