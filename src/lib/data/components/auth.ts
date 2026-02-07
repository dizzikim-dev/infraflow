/**
 * Auth Components
 * LDAP/AD, SSO, MFA, IAM
 */

import type { InfraComponent } from './types';

export const authComponents: Record<string, InfraComponent> = {
  'ldap-ad': {
    id: 'ldap-ad',
    name: 'LDAP/AD',
    nameKo: 'LDAP/AD',
    category: 'auth',
    description: 'Directory services that provide centralized authentication and user/group management.',
    descriptionKo: '중앙 집중식 인증 및 사용자/그룹 관리를 제공하는 디렉토리 서비스입니다.',
    functions: [
      'User authentication',
      'Group membership',
      'Directory lookups',
      'Password policies',
      'Certificate services (PKI)',
    ],
    functionsKo: [
      '사용자 인증',
      '그룹 멤버십',
      '디렉토리 조회',
      '비밀번호 정책',
      '인증서 서비스 (PKI)',
    ],
    features: [
      'Kerberos authentication',
      'Group Policy Objects (GPO)',
      'Multi-domain support',
      'Replication',
    ],
    featuresKo: [
      'Kerberos 인증',
      '그룹 정책 개체 (GPO)',
      '다중 도메인 지원',
      '복제',
    ],
    recommendedPolicies: [
      { name: 'LDAPS', nameKo: 'LDAPS 사용', description: 'Use LDAP over SSL (port 636)', priority: 'critical', category: 'security' },
      { name: 'Password Policy', nameKo: '비밀번호 정책', description: 'Enforce strong password requirements', priority: 'critical', category: 'security' },
      { name: 'Account Lockout', nameKo: '계정 잠금', description: 'Lock accounts after failed attempts', priority: 'high', category: 'security' },
    ],
    tier: 'internal',
    ports: ['389', '636', '3268', '3269'],
    protocols: ['LDAP', 'LDAPS', 'Kerberos'],
    vendors: ['Microsoft Active Directory', 'OpenLDAP', 'FreeIPA', '389 Directory'],
  },

  'sso': {
    id: 'sso',
    name: 'SSO',
    nameKo: 'SSO (통합인증)',
    category: 'auth',
    description: 'Single Sign-On service that allows users to authenticate once and access multiple applications.',
    descriptionKo: '사용자가 한 번 인증하면 여러 애플리케이션에 접근할 수 있도록 하는 통합 인증 서비스입니다.',
    functions: [
      'Centralized authentication',
      'Session management',
      'Federation (SAML, OIDC)',
      'Social login integration',
      'Application provisioning',
    ],
    functionsKo: [
      '중앙 집중식 인증',
      '세션 관리',
      '페더레이션 (SAML, OIDC)',
      '소셜 로그인 연동',
      '애플리케이션 프로비저닝',
    ],
    features: [
      'SAML 2.0 support',
      'OAuth 2.0/OIDC',
      'Just-in-time provisioning',
      'Adaptive authentication',
    ],
    featuresKo: [
      'SAML 2.0 지원',
      'OAuth 2.0/OIDC',
      '실시간 프로비저닝',
      '적응형 인증',
    ],
    recommendedPolicies: [
      { name: 'MFA Integration', nameKo: 'MFA 연동', description: 'Require MFA for SSO login', priority: 'critical', category: 'security' },
      { name: 'Session Timeout', nameKo: '세션 타임아웃', description: 'Configure appropriate session timeouts', priority: 'high', category: 'security' },
      { name: 'Access Review', nameKo: '접근 검토', description: 'Regular review of application access', priority: 'medium', category: 'compliance' },
    ],
    tier: 'internal',
    ports: ['443'],
    protocols: ['SAML', 'OAuth 2.0', 'OIDC'],
    vendors: ['Okta', 'Azure AD', 'Ping Identity', 'Auth0', 'Keycloak'],
  },

  'mfa': {
    id: 'mfa',
    name: 'MFA',
    nameKo: 'MFA (다중인증)',
    category: 'auth',
    description: 'Multi-Factor Authentication system that requires multiple forms of verification for user authentication.',
    descriptionKo: '사용자 인증을 위해 여러 형태의 검증을 요구하는 다중 인증 시스템입니다.',
    functions: [
      'TOTP (Time-based OTP)',
      'Push notifications',
      'SMS/Voice verification',
      'Hardware tokens',
      'Biometric authentication',
    ],
    functionsKo: [
      'TOTP (시간 기반 OTP)',
      '푸시 알림',
      'SMS/음성 검증',
      '하드웨어 토큰',
      '생체 인증',
    ],
    features: [
      'Risk-based authentication',
      'Passwordless options',
      'Self-service enrollment',
      'Offline authentication',
    ],
    featuresKo: [
      '위험 기반 인증',
      '비밀번호 없는 인증',
      '셀프 서비스 등록',
      '오프라인 인증',
    ],
    recommendedPolicies: [
      { name: 'Mandatory MFA', nameKo: 'MFA 필수', description: 'Require MFA for all users', priority: 'critical', category: 'security' },
      { name: 'No SMS Fallback', nameKo: 'SMS 비허용', description: 'Prefer app-based over SMS', priority: 'high', category: 'security' },
      { name: 'Recovery Codes', nameKo: '복구 코드', description: 'Provide secure recovery options', priority: 'high', category: 'security' },
    ],
    tier: 'internal',
    protocols: ['TOTP', 'FIDO2', 'WebAuthn'],
    vendors: ['Duo Security', 'Google Authenticator', 'Microsoft Authenticator', 'YubiKey', 'RSA SecurID'],
  },

  'iam': {
    id: 'iam',
    name: 'IAM',
    nameKo: 'IAM (ID/접근관리)',
    category: 'auth',
    description: 'Identity and Access Management system for managing digital identities and access rights.',
    descriptionKo: '디지털 ID와 접근 권한을 관리하는 ID 및 접근 관리 시스템입니다.',
    functions: [
      'Identity lifecycle management',
      'Access provisioning',
      'Role-based access control (RBAC)',
      'Privileged access management',
      'Access certification',
    ],
    functionsKo: [
      'ID 수명주기 관리',
      '접근 프로비저닝',
      '역할 기반 접근 제어 (RBAC)',
      '권한있는 접근 관리',
      '접근 인증',
    ],
    features: [
      'Self-service portal',
      'Workflow automation',
      'Segregation of duties',
      'Audit and compliance reporting',
    ],
    featuresKo: [
      '셀프 서비스 포털',
      '워크플로우 자동화',
      '직무 분리',
      '감사 및 컴플라이언스 리포팅',
    ],
    recommendedPolicies: [
      { name: 'Least Privilege', nameKo: '최소 권한', description: 'Grant minimum required access', priority: 'critical', category: 'access' },
      { name: 'Regular Review', nameKo: '정기 검토', description: 'Quarterly access recertification', priority: 'high', category: 'compliance' },
      { name: 'Separation of Duties', nameKo: '직무 분리', description: 'Enforce SoD policies', priority: 'high', category: 'compliance' },
    ],
    tier: 'internal',
    vendors: ['SailPoint', 'Saviynt', 'IBM Security Verify', 'CyberArk', 'AWS IAM'],
  },
};
