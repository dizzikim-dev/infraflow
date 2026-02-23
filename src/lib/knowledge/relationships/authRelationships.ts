/**
 * Auth/Zero Trust Relationships (REL-AUTH-030 ~ REL-AUTH-035)
 *
 * SSO, IAM, NAC, VPN, MFA zero trust relationships
 */

import type { ComponentRelationship } from '../types';
import {
  NIST_800_53,
  NIST_800_63B,
  NIST_800_207,
  withSection,
} from '../sourceRegistry';

// ---------------------------------------------------------------------------
// Auth/Zero Trust Relationships (REL-AUTH-030 ~ REL-AUTH-035)
// ---------------------------------------------------------------------------

export const authExtRelationships: ComponentRelationship[] = [
  {
    id: 'REL-AUTH-030',
    type: 'relationship',
    source: 'sso',
    target: 'mfa',
    relationshipType: 'recommends',
    strength: 'strong',
    direction: 'downstream',
    reason: 'SSO should integrate MFA to strengthen authentication beyond single-factor password-based login',
    reasonKo: 'SSO는 단일 요소 비밀번호 인증을 넘어 인증을 강화하기 위해 MFA 통합이 권장됩니다',
    tags: ['auth', 'sso', 'mfa', 'zero-trust'],
    trust: {
      confidence: 0.95,
      sources: [withSection(NIST_800_207, 'Section 3 - Zero Trust Architecture Components')],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'REL-AUTH-031',
    type: 'relationship',
    source: 'iam',
    target: 'ldap-ad',
    relationshipType: 'recommends',
    strength: 'strong',
    direction: 'downstream',
    reason: 'IAM should integrate with directory services for centralized identity management and federation',
    reasonKo: 'IAM은 중앙 ID 관리와 페더레이션을 위해 디렉터리 서비스 통합이 권장됩니다',
    tags: ['auth', 'iam', 'ldap', 'federation'],
    trust: {
      confidence: 0.95,
      sources: [withSection(NIST_800_53, 'IA-2 - Identification and Authentication')],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'REL-AUTH-032',
    type: 'relationship',
    source: 'nac',
    target: 'mfa',
    relationshipType: 'recommends',
    strength: 'strong',
    direction: 'downstream',
    reason: 'NAC should leverage MFA for device and user authentication before granting network access',
    reasonKo: 'NAC는 네트워크 접근 허용 전 디바이스와 사용자 인증을 위해 MFA 활용이 권장됩니다',
    tags: ['auth', 'nac', 'mfa', 'network-access'],
    trust: {
      confidence: 0.85,
      sources: [withSection(NIST_800_207, 'Section 3 - Policy Enforcement Points')],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'REL-AUTH-033',
    type: 'relationship',
    source: 'vpn-gateway',
    target: 'mfa',
    relationshipType: 'requires',
    strength: 'mandatory',
    direction: 'downstream',
    reason: 'VPN gateways must require MFA; password-only VPN access is a critical security gap in zero trust architectures',
    reasonKo: 'VPN 게이트웨이는 MFA 필수입니다. 비밀번호만으로 VPN 접근은 제로 트러스트 아키텍처에서 심각한 보안 갭입니다',
    tags: ['auth', 'vpn', 'mfa', 'zero-trust', 'mandatory'],
    trust: {
      confidence: 0.95,
      sources: [
        withSection(NIST_800_63B, 'Section 4.3 - AAL3 Requirements'),
        withSection(NIST_800_207, 'Section 3 - Zero Trust Access'),
      ],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'REL-AUTH-034',
    type: 'relationship',
    source: 'iam',
    target: 'firewall',
    relationshipType: 'enhances',
    strength: 'strong',
    direction: 'downstream',
    reason: 'IAM identity-aware policies enhance firewall rules by enabling user/role-based traffic filtering',
    reasonKo: 'IAM의 ID 인식 정책은 사용자/역할 기반 트래픽 필터링을 통해 방화벽 규칙을 강화합니다',
    tags: ['auth', 'iam', 'firewall', 'identity-aware'],
    trust: {
      confidence: 0.85,
      sources: [withSection(NIST_800_207, 'Section 4 - Deployment Models')],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
  {
    id: 'REL-AUTH-035',
    type: 'relationship',
    source: 'sso',
    target: 'ldap-ad',
    relationshipType: 'enhances',
    strength: 'strong',
    direction: 'upstream',
    reason: 'SSO enhances directory services by providing seamless cross-application authentication experience',
    reasonKo: 'SSO는 원활한 크로스 애플리케이션 인증 경험을 제공하여 디렉터리 서비스를 강화합니다',
    tags: ['auth', 'sso', 'ldap', 'user-experience'],
    trust: {
      confidence: 0.85,
      sources: [withSection(NIST_800_63B, 'Section 7 - Session Management')],
      upvotes: 0,
      downvotes: 0,
      lastReviewedAt: '2026-02-10',
    },
  },
];
