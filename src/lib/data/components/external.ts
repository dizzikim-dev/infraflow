/**
 * External Components
 * User, Internet
 */

import type { InfraComponent } from './types';

export const externalComponents: Record<string, InfraComponent> = {
  'user': {
    id: 'user',
    name: 'User',
    nameKo: '사용자',
    category: 'external',
    description: 'End user or client accessing the system through various devices and networks.',
    descriptionKo: '다양한 장치와 네트워크를 통해 시스템에 접근하는 최종 사용자 또는 클라이언트입니다.',
    functions: [
      'System access',
      'Data input/output',
      'Application usage',
    ],
    functionsKo: [
      '시스템 접근',
      '데이터 입/출력',
      '애플리케이션 사용',
    ],
    features: [
      'Multi-device access',
      'Browser-based access',
      'Mobile app access',
    ],
    featuresKo: [
      '다중 장치 접근',
      '브라우저 기반 접근',
      '모바일 앱 접근',
    ],
    recommendedPolicies: [
      { name: 'Strong Auth', nameKo: '강력한 인증', description: 'Require strong authentication', priority: 'critical', category: 'security' },
      { name: 'Session Security', nameKo: '세션 보안', description: 'Secure session management', priority: 'high', category: 'security' },
    ],
    tier: 'external',
  },

  'internet': {
    id: 'internet',
    name: 'Internet',
    nameKo: '인터넷',
    category: 'external',
    description: 'Public internet network representing external connectivity and threats.',
    descriptionKo: '외부 연결 및 위협을 나타내는 공용 인터넷 네트워크입니다.',
    functions: [
      'External connectivity',
      'Public access point',
    ],
    functionsKo: [
      '외부 연결',
      '공용 접근점',
    ],
    features: [
      'Global connectivity',
      'Untrusted network',
    ],
    featuresKo: [
      '글로벌 연결',
      '신뢰할 수 없는 네트워크',
    ],
    recommendedPolicies: [
      { name: 'Perimeter Defense', nameKo: '경계 방어', description: 'Deploy edge security (FW, WAF)', priority: 'critical', category: 'security' },
      { name: 'DDoS Protection', nameKo: 'DDoS 방어', description: 'Enable DDoS mitigation', priority: 'critical', category: 'security' },
    ],
    tier: 'external',
  },
};
