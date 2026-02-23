/**
 * Auth Failures (FAIL-AUTH-001 ~ FAIL-AUTH-007)
 *
 * AUTH_FAILURES: core auth failures (LDAP, SSO, IAM)
 * AUTH_EXT_FAILURES: extended auth/SASE failures (SSO outage, IAM propagation, VPN capacity, NAC)
 */

import type { FailureScenario } from '../types';
import {
  withSection,
  NIST_800_53,
  NIST_800_63B,
  NIST_800_77,
} from '../sourceRegistry';

export const AUTH_FAILURES: FailureScenario[] = [
  {
    id: 'FAIL-AUTH-001',
    type: 'failure',
    component: 'ldap-ad',
    titleKo: 'LDAP/Active Directory 장애',
    scenarioKo:
      'LDAP/AD 서버가 하드웨어 고장, 소프트웨어 버그, 또는 DB 손상으로 응답 불가 상태가 됩니다. 모든 인증/인가 요청이 실패하여 사용자 로그인, 그룹 정책 적용, 서비스 간 인증이 전면 중단됩니다.',
    impact: 'service-down',
    likelihood: 'low',
    affectedComponents: ['sso', 'vpn-gateway', 'web-server', 'app-server', 'iam'],
    preventionKo: [
      'AD 도메인 컨트롤러를 최소 2대 이상 이중화하고 서로 다른 사이트에 배치합니다',
      'AD 복제 상태를 실시간 모니터링합니다',
      'LDAP 서버의 정기 백업과 복원 테스트를 수행합니다',
    ],
    mitigationKo: [
      '보조 도메인 컨트롤러로 인증 요청을 전환합니다',
      '로컬 캐시된 자격증명으로 임시 인증을 허용합니다',
      '장애 DC를 격리하고 정상 백업에서 복원합니다',
    ],
    estimatedMTTR: '30분~4시간',
    tags: ['auth', 'ldap', 'active-directory', 'outage', 'authentication'],
    trust: {
      confidence: 0.95,
      sources: [withSection(NIST_800_63B, 'Section 5 - Authenticator and Verifier Requirements')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-AUTH-002',
    type: 'failure',
    component: 'sso',
    titleKo: 'SSO 토큰 만료 연쇄 장애',
    scenarioKo:
      'SSO IdP(Identity Provider) 서버의 시간 동기화 오류 또는 토큰 갱신 서비스 장애로 다수 사용자의 SSO 토큰이 동시에 무효화됩니다. 대량의 재인증 요청이 IdP에 집중되어 인증 서비스 전체가 마비됩니다.',
    impact: 'service-down',
    likelihood: 'medium',
    affectedComponents: ['ldap-ad', 'web-server', 'app-server', 'iam'],
    preventionKo: [
      'NTP 서버를 이중화하고 시간 동기화 상태를 모니터링합니다',
      'SSO 토큰 갱신 서비스를 이중화합니다',
      '토큰 만료 시간을 분산시켜 동시 갱신을 방지합니다',
    ],
    mitigationKo: [
      '토큰 만료 시간을 임시 연장하여 재인증 폭증을 완화합니다',
      'IdP 서버를 수평 확장하여 인증 요청을 분산 처리합니다',
      '폴백으로 로컬 인증을 일시 허용합니다',
    ],
    estimatedMTTR: '15분~2시간',
    tags: ['auth', 'sso', 'token', 'expiry', 'cascade-failure'],
    trust: {
      confidence: 0.85,
      sources: [withSection(NIST_800_63B, 'Section 7 - Session Management')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-AUTH-003',
    type: 'failure',
    component: 'iam',
    titleKo: 'IAM 권한 오설정(Permission Misconfiguration)',
    scenarioKo:
      'IAM 정책의 과도한 권한 부여(over-permissioning) 또는 잘못된 역할 매핑으로 비인가 사용자가 민감한 리소스에 접근합니다. 반대로 권한이 너무 제한되면 정상 업무가 불가능해집니다.',
    impact: 'security-breach',
    likelihood: 'high',
    affectedComponents: ['db-server', 'object-storage', 'app-server', 'web-server'],
    preventionKo: [
      '최소 권한 원칙(Principle of Least Privilege)을 적용합니다',
      'IAM 정책 변경에 코드 리뷰와 승인 절차를 의무화합니다',
      '미사용 권한을 정기적으로 감사하고 제거합니다',
    ],
    mitigationKo: [
      '과도한 권한이 부여된 정책을 즉시 수정합니다',
      '영향받는 계정의 활동 로그를 감사합니다',
      '임시로 해당 역할/사용자의 접근을 제한합니다',
    ],
    estimatedMTTR: '15분~2시간',
    tags: ['auth', 'iam', 'misconfiguration', 'over-permission', 'least-privilege'],
    trust: {
      confidence: 0.95,
      sources: [withSection(NIST_800_53, 'AC-6 - Least Privilege')],
      lastReviewedAt: '2026-02-09',
      upvotes: 0,
      downvotes: 0,
    },
  },
];

export const AUTH_EXT_FAILURES: FailureScenario[] = [
  {
    id: 'FAIL-AUTH-004',
    type: 'failure',
    component: 'sso',
    titleKo: 'SSO 장애 — 전체 인증 불가',
    scenarioKo:
      'SSO(Single Sign-On) 시스템 장애로 연동된 모든 서비스에 대한 인증이 불가능해집니다. SAML/OIDC 토큰 발급이 중단되어 사용자 로그인이 전면 차단됩니다.',
    impact: 'service-down',
    likelihood: 'medium',
    affectedComponents: ['ldap-ad', 'mfa', 'web-server', 'app-server'],
    preventionKo: [
      'SSO 시스템을 Active-Standby 이중화로 구성합니다',
      '각 서비스에 SSO 바이패스 로컬 인증을 비상용으로 준비합니다',
      'SSO 세션 토큰의 유효 기간을 적절히 설정하여 장애 시 캐시된 토큰으로 동작하도록 합니다',
    ],
    mitigationKo: [
      '비상용 로컬 인증 모드를 활성화합니다',
      'Standby SSO 서버로 페일오버합니다',
      '기존 세션 토큰의 유효 기간을 임시 연장합니다',
    ],
    estimatedMTTR: '15분~1시간',
    tags: ['auth', 'sso', 'authentication', 'service-down'],
    trust: {
      confidence: 0.95,
      sources: [withSection(NIST_800_63B, 'Section 7 - Session Management')],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-AUTH-005',
    type: 'failure',
    component: 'iam',
    titleKo: 'IAM 정책 전파 지연',
    scenarioKo:
      'IAM 정책 변경이 모든 엔드포인트에 전파되기까지 지연이 발생하여, 권한 부여/회수가 즉시 적용되지 않습니다. 퇴사자 권한 회수 지연이나 긴급 권한 부여 실패가 발생합니다.',
    impact: 'security-breach',
    likelihood: 'medium',
    affectedComponents: ['aws-vpc', 'azure-vnet', 'app-server', 'db-server'],
    preventionKo: [
      '정책 전파 일관성 모니터링을 구성합니다',
      '긴급 권한 회수는 네트워크 레벨(보안 그룹)에서도 병행합니다',
      '정책 변경 후 검증 자동화를 구현합니다',
    ],
    mitigationKo: [
      '네트워크 레벨에서 해당 사용자/역할의 접근을 즉시 차단합니다',
      '활성 세션을 강제 종료합니다',
      '정책 전파 완료를 수동으로 확인합니다',
    ],
    estimatedMTTR: '5분~30분',
    tags: ['auth', 'iam', 'policy-propagation', 'security'],
    trust: {
      confidence: 0.85,
      sources: [withSection(NIST_800_53, 'AC-2 - Account Management')],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-AUTH-006',
    type: 'failure',
    component: 'vpn-gateway',
    titleKo: 'VPN 동시 접속 폭주',
    scenarioKo:
      '재택근무 급증 등으로 VPN 동시 접속자가 라이센스/용량 한계를 초과하여 신규 연결이 거부됩니다. 원격 근무자의 업무가 전면 차단됩니다.',
    impact: 'degraded',
    likelihood: 'high',
    affectedComponents: ['firewall', 'mfa', 'app-server'],
    preventionKo: [
      'VPN 동시 접속 수를 모니터링하고 80% 임계치에서 경보를 설정합니다',
      '스플릿 터널링을 적용하여 VPN 대역폭 부하를 분산합니다',
      'ZTNA(Zero Trust Network Access)로 VPN 의존도를 줄입니다',
    ],
    mitigationKo: [
      'VPN 라이센스를 긴급 추가합니다',
      '비핵심 사용자를 임시로 ZTNA/웹 기반 접근으로 전환합니다',
      'VPN 게이트웨이를 수평 확장합니다',
    ],
    estimatedMTTR: '30분~2시간',
    tags: ['auth', 'vpn', 'capacity', 'remote-work'],
    trust: {
      confidence: 0.95,
      sources: [withSection(NIST_800_77, 'Section 5 - VPN Performance')],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'FAIL-AUTH-007',
    type: 'failure',
    component: 'nac',
    titleKo: 'NAC 정책 폭주',
    scenarioKo:
      'NAC 서버 과부하로 802.1X 인증 요청 처리가 지연되어 디바이스들이 네트워크에 접속하지 못합니다. 사무실 출근 시간대에 대규모 동시 인증 요청이 집중됩니다.',
    impact: 'degraded',
    likelihood: 'medium',
    affectedComponents: ['switch-l2', 'ldap-ad', 'mfa'],
    preventionKo: [
      'NAC 서버를 이중화하고 로드 밸런싱을 구성합니다',
      '인증 캐시(MAB)를 활용하여 재인증 부하를 줄입니다',
      '피크 시간대 동시 인증 처리 용량을 사전 검증합니다',
    ],
    mitigationKo: [
      'NAC 인증을 임시로 우회(bypass) 모드로 전환합니다',
      '스위치의 게스트 VLAN을 임시 허용합니다',
      'NAC 서버의 리소스를 긴급 확장합니다',
    ],
    estimatedMTTR: '10분~30분',
    tags: ['auth', 'nac', 'capacity', '802.1x'],
    trust: {
      confidence: 0.85,
      sources: [withSection(NIST_800_53, 'AC-3 - Access Enforcement')],
      lastReviewedAt: '2026-02-10',
      upvotes: 0,
      downvotes: 0,
    },
  },
];
