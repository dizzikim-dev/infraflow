/**
 * Industry-Specific Knowledge Presets
 *
 * Pre-configured knowledge packages for 4 industry sectors:
 * - Financial (금융)
 * - Healthcare (의료)
 * - Government (공공)
 * - E-commerce (이커머스)
 *
 * Each preset includes compliance requirements, required components,
 * industry-specific relationships, antipatterns, and best practices.
 */

import type { InfraNodeType } from '@/types/infra';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type IndustryType = 'financial' | 'healthcare' | 'government' | 'ecommerce';

export interface ComplianceRule {
  id: string;
  descriptionKo: string;
  requiredComponents: InfraNodeType[];
  severity: 'critical' | 'high' | 'medium';
}

export interface ComplianceRequirement {
  framework: string;
  frameworkKo: string;
  version: string;
  requirements: ComplianceRule[];
}

export interface IndustryRelationship {
  source: InfraNodeType;
  target: InfraNodeType;
  relationshipType: 'requires' | 'recommends' | 'conflicts';
  reasonKo: string;
  complianceRef?: string;
}

export interface IndustryAntiPattern {
  id: string;
  nameKo: string;
  severityKo: string;
  detectionHintKo: string;
  complianceRef?: string;
}

export interface IndustryPreset {
  id: IndustryType;
  nameKo: string;
  descriptionKo: string;
  compliance: ComplianceRequirement[];
  requiredComponents: InfraNodeType[];
  recommendedComponents: InfraNodeType[];
  additionalRelationships: IndustryRelationship[];
  industryAntiPatterns: IndustryAntiPattern[];
  bestPracticesKo: string[];
}

// ---------------------------------------------------------------------------
// Financial Preset (금융)
// ---------------------------------------------------------------------------

const financialPreset: IndustryPreset = {
  id: 'financial',
  nameKo: '금융',
  descriptionKo:
    '금융권 인프라 아키텍처 프리셋. PCI-DSS, K-ISMS 등 금융 규제 준수를 위한 보안 강화 구성을 제공합니다.',
  compliance: [
    {
      framework: 'PCI-DSS',
      frameworkKo: '결제카드 산업 데이터 보안 표준',
      version: '4.0',
      requirements: [
        {
          id: 'PCI-1.1',
          descriptionKo:
            '카드소유자 데이터 환경(CDE) 주변에 방화벽을 설치하고 유지해야 합니다.',
          requiredComponents: ['firewall'],
          severity: 'critical',
        },
        {
          id: 'PCI-2.1',
          descriptionKo:
            '벤더 제공 기본값(비밀번호 등)을 시스템 구성에 사용하지 않아야 합니다.',
          requiredComponents: ['iam'],
          severity: 'critical',
        },
        {
          id: 'PCI-3.4',
          descriptionKo:
            '저장된 카드소유자 데이터는 암호화, 잘라내기, 마스킹 또는 해싱으로 보호해야 합니다.',
          requiredComponents: ['db-server', 'dlp'],
          severity: 'critical',
        },
        {
          id: 'PCI-6.6',
          descriptionKo:
            '공개 웹 애플리케이션에 WAF를 배치하거나 정기 코드 리뷰를 수행해야 합니다.',
          requiredComponents: ['waf'],
          severity: 'critical',
        },
        {
          id: 'PCI-8.3',
          descriptionKo:
            'CDE에 접근하는 모든 관리 액세스에 다중 인증(MFA)을 적용해야 합니다.',
          requiredComponents: ['mfa'],
          severity: 'critical',
        },
        {
          id: 'PCI-10.1',
          descriptionKo:
            '시스템 구성요소에 대한 모든 접근을 개별 사용자에게 연결하는 감사 추적을 구현해야 합니다.',
          requiredComponents: ['iam', 'ids-ips'],
          severity: 'high',
        },
        {
          id: 'PCI-11.4',
          descriptionKo:
            '네트워크 침입 탐지/방지 시스템(IDS/IPS)을 사용하여 네트워크 트래픽을 모니터링해야 합니다.',
          requiredComponents: ['ids-ips'],
          severity: 'high',
        },
      ],
    },
    {
      framework: 'K-ISMS',
      frameworkKo: '한국 정보보호 관리체계 인증',
      version: '2.0',
      requirements: [
        {
          id: 'ISMS-2.6.1',
          descriptionKo:
            '네트워크 접근 통제 정책을 수립하고 비인가 접근을 차단해야 합니다.',
          requiredComponents: ['firewall', 'nac'],
          severity: 'high',
        },
        {
          id: 'ISMS-2.7.1',
          descriptionKo:
            '개인정보 및 중요정보 유출 방지 대책을 마련해야 합니다.',
          requiredComponents: ['dlp'],
          severity: 'high',
        },
        {
          id: 'ISMS-2.9.1',
          descriptionKo:
            '정보시스템에 대한 백업 정책을 수립하고 정기적으로 백업을 수행해야 합니다.',
          requiredComponents: ['backup'],
          severity: 'high',
        },
      ],
    },
  ],
  requiredComponents: [
    'firewall',
    'waf',
    'ids-ips',
    'dlp',
    'db-server',
    'backup',
    'mfa',
    'iam',
  ],
  recommendedComponents: [
    'nac',
    'vpn-gateway',
    'load-balancer',
    'cache',
    'ldap-ad',
    'sso',
  ],
  additionalRelationships: [
    {
      source: 'db-server',
      target: 'dlp',
      relationshipType: 'requires',
      reasonKo: '카드소유자 데이터가 저장되는 DB는 DLP를 통해 데이터 유출을 방지해야 합니다.',
      complianceRef: 'PCI-DSS 3.4',
    },
    {
      source: 'web-server',
      target: 'waf',
      relationshipType: 'requires',
      reasonKo: '공개 웹 애플리케이션은 WAF를 통해 OWASP Top 10 공격을 방어해야 합니다.',
      complianceRef: 'PCI-DSS 6.6',
    },
    {
      source: 'app-server',
      target: 'mfa',
      relationshipType: 'requires',
      reasonKo: '금융 애플리케이션 서버의 관리 접근에는 반드시 다중 인증이 필요합니다.',
      complianceRef: 'PCI-DSS 8.3',
    },
    {
      source: 'db-server',
      target: 'backup',
      relationshipType: 'requires',
      reasonKo: '금융 거래 데이터는 법적 보존 기간 준수를 위해 정기 백업이 필수입니다.',
      complianceRef: 'K-ISMS 2.9.1',
    },
    {
      source: 'firewall',
      target: 'ids-ips',
      relationshipType: 'recommends',
      reasonKo: '방화벽과 IDS/IPS를 병행 운영하여 네트워크 위협에 대한 심층 방어를 구현합니다.',
      complianceRef: 'PCI-DSS 11.4',
    },
    {
      source: 'load-balancer',
      target: 'waf',
      relationshipType: 'recommends',
      reasonKo: 'L7 로드밸런서 앞단에 WAF를 배치하여 악성 트래픽을 사전 차단합니다.',
      complianceRef: 'PCI-DSS 6.6',
    },
    {
      source: 'cache',
      target: 'db-server',
      relationshipType: 'conflicts',
      reasonKo: '캐시에 카드소유자 데이터를 평문으로 저장하면 PCI-DSS 위반이 됩니다.',
      complianceRef: 'PCI-DSS 3.4',
    },
  ],
  industryAntiPatterns: [
    {
      id: 'FIN-AP-001',
      nameKo: '카드 데이터 평문 저장',
      severityKo: '치명적',
      detectionHintKo:
        'DB 서버에 DLP 또는 암호화 모듈이 연결되지 않은 경우 탐지됩니다.',
      complianceRef: 'PCI-DSS 3.4',
    },
    {
      id: 'FIN-AP-002',
      nameKo: '네트워크 세그멘테이션 부재',
      severityKo: '치명적',
      detectionHintKo:
        'CDE(카드소유자 데이터 환경)와 일반 네트워크 사이에 방화벽이 없는 경우 탐지됩니다.',
      complianceRef: 'PCI-DSS 1.1',
    },
    {
      id: 'FIN-AP-003',
      nameKo: '관리자 단일 인증',
      severityKo: '심각',
      detectionHintKo:
        'CDE 접근 경로에 MFA 구성요소가 없는 경우 탐지됩니다.',
      complianceRef: 'PCI-DSS 8.3',
    },
    {
      id: 'FIN-AP-004',
      nameKo: 'WAF 없는 공개 웹 서비스',
      severityKo: '심각',
      detectionHintKo:
        '인터넷에 노출된 웹 서버 앞단에 WAF가 배치되지 않은 경우 탐지됩니다.',
      complianceRef: 'PCI-DSS 6.6',
    },
    {
      id: 'FIN-AP-005',
      nameKo: '감사 로그 미수집',
      severityKo: '심각',
      detectionHintKo:
        'IDS/IPS 또는 로그 수집 시스템이 아키텍처에 포함되지 않은 경우 탐지됩니다.',
      complianceRef: 'PCI-DSS 10.1',
    },
    {
      id: 'FIN-AP-006',
      nameKo: '백업 전략 부재',
      severityKo: '높음',
      detectionHintKo:
        'DB 서버에 백업 스토리지가 연결되지 않은 경우 탐지됩니다.',
      complianceRef: 'K-ISMS 2.9.1',
    },
  ],
  bestPracticesKo: [
    'CDE(카드소유자 데이터 환경)를 별도의 네트워크 세그먼트로 격리하십시오.',
    '모든 카드소유자 데이터는 AES-256 이상으로 암호화하여 저장하십시오.',
    'CDE 접근 시 다중 인증(MFA)을 필수 적용하십시오.',
    'WAF를 통해 웹 애플리케이션 공격(SQL Injection, XSS 등)을 차단하십시오.',
    'IDS/IPS를 배치하여 네트워크 침입 시도를 실시간 탐지하십시오.',
    'DLP 솔루션으로 카드소유자 데이터의 무단 유출을 방지하십시오.',
    '정기적인 백업 및 복구 테스트를 수행하여 데이터 가용성을 보장하십시오.',
    '모든 시스템 접근에 대한 감사 로그를 최소 1년간 보관하십시오.',
  ],
};

// ---------------------------------------------------------------------------
// Healthcare Preset (의료)
// ---------------------------------------------------------------------------

const healthcarePreset: IndustryPreset = {
  id: 'healthcare',
  nameKo: '의료',
  descriptionKo:
    '의료기관 인프라 아키텍처 프리셋. HIPAA 규정 및 HL7/FHIR 상호운용성 요구사항을 준수하는 보안 구성을 제공합니다.',
  compliance: [
    {
      framework: 'HIPAA',
      frameworkKo: '미국 건강보험 이전과 책임에 관한 법',
      version: '2013 Omnibus Rule',
      requirements: [
        {
          id: 'HIPAA-164.312(a)',
          descriptionKo:
            '전자 보호 건강 정보(ePHI)에 대한 접근을 허가된 사용자로 제한하는 기술적 통제를 구현해야 합니다.',
          requiredComponents: ['iam', 'mfa'],
          severity: 'critical',
        },
        {
          id: 'HIPAA-164.312(c)',
          descriptionKo:
            'ePHI의 무결성을 보호하기 위한 전자적 메커니즘을 구현해야 합니다.',
          requiredComponents: ['db-server', 'backup'],
          severity: 'critical',
        },
        {
          id: 'HIPAA-164.312(d)',
          descriptionKo:
            'ePHI에 접근하는 사람 또는 개체의 신원을 확인하는 절차를 구현해야 합니다.',
          requiredComponents: ['ldap-ad', 'mfa'],
          severity: 'critical',
        },
        {
          id: 'HIPAA-164.312(e)',
          descriptionKo:
            '전자 네트워크를 통해 전송되는 ePHI를 무단 접근으로부터 보호하는 기술적 보안 조치를 구현해야 합니다.',
          requiredComponents: ['vpn-gateway', 'firewall'],
          severity: 'critical',
        },
        {
          id: 'HIPAA-164.308(a)(5)',
          descriptionKo:
            '악성 소프트웨어로부터 보호하기 위한 절차와 보안 사고 모니터링을 구현해야 합니다.',
          requiredComponents: ['ids-ips'],
          severity: 'high',
        },
        {
          id: 'HIPAA-164.310(d)',
          descriptionKo:
            'ePHI를 포함하는 전자 매체의 이동, 재사용 및 폐기에 관한 정책을 수립해야 합니다.',
          requiredComponents: ['dlp', 'backup'],
          severity: 'high',
        },
      ],
    },
    {
      framework: 'HL7-FHIR',
      frameworkKo: 'HL7 FHIR 의료정보 상호운용성 표준',
      version: 'R4',
      requirements: [
        {
          id: 'FHIR-SEC-01',
          descriptionKo:
            'FHIR 리소스 접근 시 OAuth 2.0 기반 인증/인가를 구현해야 합니다.',
          requiredComponents: ['iam', 'sso'],
          severity: 'high',
        },
        {
          id: 'FHIR-SEC-02',
          descriptionKo:
            'FHIR 엔드포인트 간 통신은 TLS 1.2 이상으로 암호화해야 합니다.',
          requiredComponents: ['vpn-gateway'],
          severity: 'high',
        },
        {
          id: 'FHIR-SEC-03',
          descriptionKo:
            'FHIR 감사 로그(AuditEvent 리소스)를 기록하고 보관해야 합니다.',
          requiredComponents: ['db-server'],
          severity: 'medium',
        },
      ],
    },
  ],
  requiredComponents: [
    'firewall',
    'vpn-gateway',
    'db-server',
    'backup',
    'ldap-ad',
    'mfa',
  ],
  recommendedComponents: [
    'waf',
    'ids-ips',
    'dlp',
    'iam',
    'sso',
    'load-balancer',
    'cache',
  ],
  additionalRelationships: [
    {
      source: 'db-server',
      target: 'vpn-gateway',
      relationshipType: 'requires',
      reasonKo: 'ePHI가 저장된 DB 접근 시 VPN을 통한 암호화 통신이 필수입니다.',
      complianceRef: 'HIPAA 164.312(e)',
    },
    {
      source: 'app-server',
      target: 'ldap-ad',
      relationshipType: 'requires',
      reasonKo: '의료 애플리케이션은 LDAP/AD를 통한 중앙 집중식 사용자 인증이 필요합니다.',
      complianceRef: 'HIPAA 164.312(d)',
    },
    {
      source: 'web-server',
      target: 'mfa',
      relationshipType: 'requires',
      reasonKo: 'ePHI에 접근하는 웹 포탈은 다중 인증을 적용해야 합니다.',
      complianceRef: 'HIPAA 164.312(a)',
    },
    {
      source: 'db-server',
      target: 'backup',
      relationshipType: 'requires',
      reasonKo: '환자 데이터의 무결성과 가용성을 위해 정기적인 백업이 필수입니다.',
      complianceRef: 'HIPAA 164.312(c)',
    },
    {
      source: 'app-server',
      target: 'iam',
      relationshipType: 'recommends',
      reasonKo: 'FHIR API 접근 제어를 위해 IAM 기반 역할별 접근 통제를 권장합니다.',
      complianceRef: 'FHIR-SEC-01',
    },
    {
      source: 'db-server',
      target: 'dlp',
      relationshipType: 'recommends',
      reasonKo: 'PHI 데이터 유출 방지를 위해 DLP 솔루션 연동을 권장합니다.',
      complianceRef: 'HIPAA 164.310(d)',
    },
  ],
  industryAntiPatterns: [
    {
      id: 'HC-AP-001',
      nameKo: 'PHI 데이터 비암호화 저장',
      severityKo: '치명적',
      detectionHintKo:
        'DB 서버에 암호화 모듈 또는 VPN이 연결되지 않은 상태로 ePHI가 저장되는 경우 탐지됩니다.',
      complianceRef: 'HIPAA 164.312(e)',
    },
    {
      id: 'HC-AP-002',
      nameKo: 'PHI와 비PHI 데이터 혼합 DB',
      severityKo: '심각',
      detectionHintKo:
        '단일 DB 서버가 PHI와 일반 데이터를 구분 없이 저장하는 구성이 탐지되는 경우입니다.',
      complianceRef: 'HIPAA 164.312(a)',
    },
    {
      id: 'HC-AP-003',
      nameKo: '원격 접속 시 VPN 미사용',
      severityKo: '심각',
      detectionHintKo:
        '외부에서 내부 의료 시스템 접근 경로에 VPN Gateway가 없는 경우 탐지됩니다.',
      complianceRef: 'HIPAA 164.312(e)',
    },
    {
      id: 'HC-AP-004',
      nameKo: '단일 인증으로 ePHI 접근',
      severityKo: '심각',
      detectionHintKo:
        'ePHI 접근 경로에 MFA 구성요소가 포함되지 않은 경우 탐지됩니다.',
      complianceRef: 'HIPAA 164.312(d)',
    },
    {
      id: 'HC-AP-005',
      nameKo: '의료 데이터 백업 부재',
      severityKo: '높음',
      detectionHintKo:
        '환자 데이터 DB에 백업 스토리지가 연결되지 않은 경우 탐지됩니다.',
      complianceRef: 'HIPAA 164.312(c)',
    },
    {
      id: 'HC-AP-006',
      nameKo: '감사 로그 미기록',
      severityKo: '높음',
      detectionHintKo:
        'ePHI 접근에 대한 감사 추적 시스템(IDS/IPS 또는 로그 서버)이 없는 경우 탐지됩니다.',
      complianceRef: 'HIPAA 164.308(a)(5)',
    },
  ],
  bestPracticesKo: [
    'PHI 데이터는 별도의 네트워크 세그먼트에 격리하여 저장하십시오.',
    '모든 ePHI 전송 구간에 TLS 1.2 이상 또는 VPN 암호화를 적용하십시오.',
    'ePHI 접근 시 다중 인증(MFA)을 필수 적용하십시오.',
    'LDAP/AD를 통한 중앙 집중식 사용자 관리 및 역할 기반 접근 제어를 구현하십시오.',
    '환자 데이터에 대한 모든 접근 기록을 최소 6년간 보관하십시오.',
    '정기적인 백업 및 재해 복구 테스트로 데이터 가용성을 보장하십시오.',
    'FHIR API 연동 시 OAuth 2.0 기반 인증/인가를 구현하십시오.',
    'DLP 솔루션을 통해 PHI 데이터의 무단 유출 경로를 차단하십시오.',
  ],
};

// ---------------------------------------------------------------------------
// Government Preset (공공)
// ---------------------------------------------------------------------------

const governmentPreset: IndustryPreset = {
  id: 'government',
  nameKo: '공공',
  descriptionKo:
    '공공기관 인프라 아키텍처 프리셋. FISMA/NIST 800-53 및 개인정보보호법 준수를 위한 강화된 보안 구성을 제공합니다.',
  compliance: [
    {
      framework: 'FISMA-NIST-800-53',
      frameworkKo: 'FISMA / NIST SP 800-53 연방정보보안관리법',
      version: 'Rev.5',
      requirements: [
        {
          id: 'NIST-AC-2',
          descriptionKo:
            '계정 관리: 정보 시스템 계정을 식별, 선택, 할당, 관리, 모니터링해야 합니다.',
          requiredComponents: ['iam', 'ldap-ad'],
          severity: 'critical',
        },
        {
          id: 'NIST-AC-17',
          descriptionKo:
            '원격 접근: 원격 접근 세션에 대한 통제를 수립하고 시행해야 합니다.',
          requiredComponents: ['vpn-gateway', 'mfa'],
          severity: 'critical',
        },
        {
          id: 'NIST-AU-2',
          descriptionKo:
            '감사 이벤트: 정보 시스템이 감사해야 할 이벤트를 결정하고 기록해야 합니다.',
          requiredComponents: ['ids-ips'],
          severity: 'critical',
        },
        {
          id: 'NIST-SC-7',
          descriptionKo:
            '경계 보호: 외부 네트워크 경계와 주요 내부 경계에서 통신을 모니터링하고 통제해야 합니다.',
          requiredComponents: ['firewall', 'ids-ips'],
          severity: 'critical',
        },
        {
          id: 'NIST-SI-4',
          descriptionKo:
            '정보 시스템 모니터링: 비인가 접근, 사용, 변경을 탐지하기 위해 시스템을 모니터링해야 합니다.',
          requiredComponents: ['ids-ips', 'waf'],
          severity: 'high',
        },
        {
          id: 'NIST-IA-2',
          descriptionKo:
            '식별 및 인증: 조직 사용자를 고유하게 식별하고 인증해야 합니다.',
          requiredComponents: ['mfa', 'ldap-ad'],
          severity: 'critical',
        },
      ],
    },
    {
      framework: 'PIPA-KR',
      frameworkKo: '개인정보보호법 (대한민국)',
      version: '2023 개정',
      requirements: [
        {
          id: 'PIPA-29',
          descriptionKo:
            '안전조치의무: 개인정보의 분실, 도난, 유출, 위조, 변조 또는 훼손을 방지하기 위한 기술적 보호조치를 해야 합니다.',
          requiredComponents: ['firewall', 'dlp'],
          severity: 'critical',
        },
        {
          id: 'PIPA-24',
          descriptionKo:
            '접근 통제: 개인정보처리시스템에 대한 접근 권한을 최소한으로 부여하고 관리해야 합니다.',
          requiredComponents: ['nac', 'iam'],
          severity: 'high',
        },
        {
          id: 'PIPA-21',
          descriptionKo:
            '개인정보 파기: 보유 기간이 경과한 개인정보는 지체없이 파기해야 합니다.',
          requiredComponents: ['db-server'],
          severity: 'high',
        },
      ],
    },
  ],
  requiredComponents: [
    'firewall',
    'waf',
    'ids-ips',
    'vpn-gateway',
    'nac',
    'ldap-ad',
    'mfa',
    'iam',
  ],
  recommendedComponents: [
    'dlp',
    'load-balancer',
    'backup',
    'db-server',
    'sso',
  ],
  additionalRelationships: [
    {
      source: 'vpn-gateway',
      target: 'mfa',
      relationshipType: 'requires',
      reasonKo: '공공기관 원격 접근 시 VPN과 MFA를 동시에 적용하여 이중 보안을 구현해야 합니다.',
      complianceRef: 'NIST AC-17',
    },
    {
      source: 'firewall',
      target: 'ids-ips',
      relationshipType: 'requires',
      reasonKo: '공공기관 네트워크 경계에는 방화벽과 IDS/IPS를 모두 배치하여 심층 방어를 구현해야 합니다.',
      complianceRef: 'NIST SC-7',
    },
    {
      source: 'ldap-ad',
      target: 'iam',
      relationshipType: 'requires',
      reasonKo: 'LDAP/AD와 IAM을 연동하여 통합 계정 관리 및 역할 기반 접근 제어를 구현해야 합니다.',
      complianceRef: 'NIST AC-2',
    },
    {
      source: 'web-server',
      target: 'waf',
      relationshipType: 'requires',
      reasonKo: '공공기관 웹 서비스는 WAF를 통해 웹 공격을 차단해야 합니다.',
      complianceRef: 'NIST SI-4',
    },
    {
      source: 'nac',
      target: 'ldap-ad',
      relationshipType: 'recommends',
      reasonKo: 'NAC와 LDAP/AD 연동으로 네트워크 접근 시 사용자 인증을 자동화합니다.',
      complianceRef: 'PIPA-24',
    },
    {
      source: 'db-server',
      target: 'dlp',
      relationshipType: 'recommends',
      reasonKo: '개인정보가 저장된 DB에 DLP를 연동하여 정보 유출을 방지합니다.',
      complianceRef: 'PIPA-29',
    },
  ],
  industryAntiPatterns: [
    {
      id: 'GOV-AP-001',
      nameKo: '비밀 데이터의 공개 네트워크 노출',
      severityKo: '치명적',
      detectionHintKo:
        '기밀 등급 데이터가 저장된 시스템이 인터넷에 직접 연결된 경우 탐지됩니다.',
      complianceRef: 'NIST SC-7',
    },
    {
      id: 'GOV-AP-002',
      nameKo: '접근 통제 감사 로그 미수집',
      severityKo: '치명적',
      detectionHintKo:
        '주요 시스템에 IDS/IPS 또는 로그 관리 시스템이 연결되지 않은 경우 탐지됩니다.',
      complianceRef: 'NIST AU-2',
    },
    {
      id: 'GOV-AP-003',
      nameKo: 'VPN 없는 원격 접근',
      severityKo: '심각',
      detectionHintKo:
        '외부에서 내부 공공 시스템 접근 경로에 VPN Gateway가 없는 경우 탐지됩니다.',
      complianceRef: 'NIST AC-17',
    },
    {
      id: 'GOV-AP-004',
      nameKo: 'NAC 없는 내부 네트워크',
      severityKo: '심각',
      detectionHintKo:
        '내부 네트워크에 NAC 장비가 배치되지 않아 비인가 장치 접속이 가능한 경우 탐지됩니다.',
      complianceRef: 'PIPA-24',
    },
    {
      id: 'GOV-AP-005',
      nameKo: '통합 계정 관리 부재',
      severityKo: '높음',
      detectionHintKo:
        'LDAP/AD 또는 IAM 시스템 없이 각 시스템별 개별 계정 관리를 하는 경우 탐지됩니다.',
      complianceRef: 'NIST AC-2',
    },
    {
      id: 'GOV-AP-006',
      nameKo: '개인정보 유출 방지 미비',
      severityKo: '높음',
      detectionHintKo:
        '개인정보 처리 시스템에 DLP 솔루션이 연결되지 않은 경우 탐지됩니다.',
      complianceRef: 'PIPA-29',
    },
  ],
  bestPracticesKo: [
    '망분리 정책에 따라 업무망과 인터넷망을 물리적 또는 논리적으로 분리하십시오.',
    '모든 원격 접근에 VPN + MFA 이중 인증을 적용하십시오.',
    'NAC를 통해 비인가 장치의 네트워크 접속을 원천 차단하십시오.',
    'LDAP/AD + IAM 통합 계정 관리로 최소 권한 원칙을 적용하십시오.',
    'IDS/IPS를 배치하여 네트워크 경계 및 내부 주요 구간을 모니터링하십시오.',
    '모든 접근 기록에 대한 감사 로그를 3년 이상 보관하십시오.',
    'WAF를 통해 공공 웹 서비스를 웹 공격으로부터 보호하십시오.',
    '개인정보보호법 준수를 위해 DLP 솔루션을 운영하십시오.',
  ],
};

// ---------------------------------------------------------------------------
// E-commerce Preset (이커머스)
// ---------------------------------------------------------------------------

const ecommercePreset: IndustryPreset = {
  id: 'ecommerce',
  nameKo: '이커머스',
  descriptionKo:
    '이커머스 인프라 아키텍처 프리셋. PCI-DSS 결제 보안 및 전자상거래법 준수와 함께 고가용성/고성능 구성을 제공합니다.',
  compliance: [
    {
      framework: 'PCI-DSS',
      frameworkKo: '결제카드 산업 데이터 보안 표준',
      version: '4.0',
      requirements: [
        {
          id: 'PCI-EC-1.1',
          descriptionKo:
            '결제 처리 환경의 네트워크를 방화벽으로 보호해야 합니다.',
          requiredComponents: ['firewall'],
          severity: 'critical',
        },
        {
          id: 'PCI-EC-6.6',
          descriptionKo:
            '결제 페이지가 포함된 웹 애플리케이션에 WAF를 배치해야 합니다.',
          requiredComponents: ['waf'],
          severity: 'critical',
        },
        {
          id: 'PCI-EC-9.4',
          descriptionKo:
            '결제 데이터 전송 구간을 암호화하고 데이터 무결성을 보장해야 합니다.',
          requiredComponents: ['firewall', 'db-server'],
          severity: 'critical',
        },
      ],
    },
    {
      framework: 'K-ECOMMERCE',
      frameworkKo: '전자상거래 등에서의 소비자보호에 관한 법률',
      version: '2023 개정',
      requirements: [
        {
          id: 'ECL-7',
          descriptionKo:
            '전자상거래 사업자는 소비자의 개인정보를 안전하게 관리해야 합니다.',
          requiredComponents: ['firewall', 'db-server'],
          severity: 'high',
        },
        {
          id: 'ECL-13',
          descriptionKo:
            '거래 기록을 일정 기간 보존하고 소비자가 확인할 수 있도록 해야 합니다.',
          requiredComponents: ['db-server', 'backup'],
          severity: 'high',
        },
        {
          id: 'ECL-21',
          descriptionKo:
            '결제 시스템의 안정성을 확보하고 장애 발생 시 소비자 피해를 최소화해야 합니다.',
          requiredComponents: ['load-balancer', 'backup'],
          severity: 'high',
        },
      ],
    },
  ],
  requiredComponents: [
    'firewall',
    'waf',
    'cdn',
    'load-balancer',
    'cache',
    'db-server',
    'backup',
  ],
  recommendedComponents: [
    'ids-ips',
    'mfa',
    'iam',
    'container',
    'kubernetes',
    'object-storage',
  ],
  additionalRelationships: [
    {
      source: 'cdn',
      target: 'load-balancer',
      relationshipType: 'requires',
      reasonKo: 'CDN은 오리진 서버의 로드밸런서와 연동하여 트래픽을 효율적으로 분배해야 합니다.',
    },
    {
      source: 'load-balancer',
      target: 'cache',
      relationshipType: 'recommends',
      reasonKo: '세션 관리와 핫 데이터 캐싱을 위해 캐시 레이어를 로드밸런서 뒤에 배치합니다.',
    },
    {
      source: 'web-server',
      target: 'waf',
      relationshipType: 'requires',
      reasonKo: '결제 페이지를 포함한 이커머스 웹 서비스는 WAF를 통해 보호해야 합니다.',
      complianceRef: 'PCI-DSS 6.6',
    },
    {
      source: 'db-server',
      target: 'cache',
      relationshipType: 'recommends',
      reasonKo: '상품 카탈로그, 세션 등 읽기 빈도가 높은 데이터는 캐시를 통해 DB 부하를 경감합니다.',
    },
    {
      source: 'db-server',
      target: 'backup',
      relationshipType: 'requires',
      reasonKo: '거래 기록과 소비자 정보를 법적 보존 기간 동안 안전하게 백업해야 합니다.',
      complianceRef: 'ECL-13',
    },
    {
      source: 'load-balancer',
      target: 'web-server',
      relationshipType: 'requires',
      reasonKo: '트래픽 급증(세일, 이벤트)에 대비하여 웹 서버 앞단에 로드밸런서가 필수입니다.',
      complianceRef: 'ECL-21',
    },
  ],
  industryAntiPatterns: [
    {
      id: 'EC-AP-001',
      nameKo: '결제 경로의 단일 장애점(SPOF)',
      severityKo: '치명적',
      detectionHintKo:
        '결제 처리 경로에 로드밸런서 없이 단일 서버만 배치된 경우 탐지됩니다.',
      complianceRef: 'ECL-21',
    },
    {
      id: 'EC-AP-002',
      nameKo: '정적 자산에 CDN 미사용',
      severityKo: '높음',
      detectionHintKo:
        '이미지, CSS, JS 등 정적 자산이 CDN 없이 오리진 서버에서 직접 제공되는 경우 탐지됩니다.',
    },
    {
      id: 'EC-AP-003',
      nameKo: 'WAF 없는 결제 페이지',
      severityKo: '치명적',
      detectionHintKo:
        '결제 기능이 있는 웹 서버 앞단에 WAF가 배치되지 않은 경우 탐지됩니다.',
      complianceRef: 'PCI-DSS 6.6',
    },
    {
      id: 'EC-AP-004',
      nameKo: '캐시 레이어 부재로 인한 DB 과부하',
      severityKo: '높음',
      detectionHintKo:
        '캐시(Redis/Memcached) 없이 모든 읽기 요청이 DB로 직접 전달되는 구조인 경우 탐지됩니다.',
    },
    {
      id: 'EC-AP-005',
      nameKo: '거래 데이터 백업 부재',
      severityKo: '심각',
      detectionHintKo:
        '거래 DB에 백업 스토리지가 연결되지 않은 경우 탐지됩니다.',
      complianceRef: 'ECL-13',
    },
    {
      id: 'EC-AP-006',
      nameKo: '수평 확장 불가 아키텍처',
      severityKo: '높음',
      detectionHintKo:
        '컨테이너/쿠버네티스 없이 단일 서버에 의존하여 트래픽 증가 시 확장이 불가능한 경우 탐지됩니다.',
    },
  ],
  bestPracticesKo: [
    'CDN을 통해 정적 자산을 배포하여 응답 속도를 최적화하십시오.',
    '로드밸런서를 배치하여 트래픽 급증 시에도 서비스 가용성을 보장하십시오.',
    '캐시 레이어(Redis)를 활용하여 DB 부하를 줄이고 응답 시간을 단축하십시오.',
    '결제 페이지에 WAF를 적용하여 카드 정보 탈취 공격을 차단하십시오.',
    '결제 처리 경로에 단일 장애점(SPOF)이 없도록 이중화를 구현하십시오.',
    '거래 기록은 법적 보존 기간(5년)에 맞춰 정기 백업을 수행하십시오.',
    '컨테이너/쿠버네티스를 활용하여 트래픽에 따른 자동 스케일링을 구현하십시오.',
    '세일/이벤트 시 트래픽 급증에 대비한 부하 테스트를 정기적으로 수행하십시오.',
  ],
};

// ---------------------------------------------------------------------------
// Registry & Exports
// ---------------------------------------------------------------------------

export const INDUSTRY_PRESETS: Readonly<Record<IndustryType, IndustryPreset>> =
  Object.freeze({
    financial: financialPreset,
    healthcare: healthcarePreset,
    government: governmentPreset,
    ecommerce: ecommercePreset,
  });

/** Get a preset by industry type */
export function getPreset(industry: IndustryType): IndustryPreset {
  return INDUSTRY_PRESETS[industry];
}

/** Get required components for an industry */
export function getRequiredComponents(industry: IndustryType): InfraNodeType[] {
  return INDUSTRY_PRESETS[industry].requiredComponents;
}

/**
 * Check compliance for a given industry against a list of present components.
 * Returns passed and failed compliance rules.
 */
export function checkCompliance(
  industry: IndustryType,
  presentComponents: InfraNodeType[],
): { passed: ComplianceRule[]; failed: ComplianceRule[] } {
  const preset = INDUSTRY_PRESETS[industry];
  const present = new Set(presentComponents);
  const passed: ComplianceRule[] = [];
  const failed: ComplianceRule[] = [];

  for (const compliance of preset.compliance) {
    for (const rule of compliance.requirements) {
      const allPresent = rule.requiredComponents.every((c) => present.has(c));
      if (allPresent) {
        passed.push(rule);
      } else {
        failed.push(rule);
      }
    }
  }

  return { passed, failed };
}

/** Get industry-specific antipatterns */
export function getIndustryAntiPatterns(
  industry: IndustryType,
): IndustryAntiPattern[] {
  return INDUSTRY_PRESETS[industry].industryAntiPatterns;
}
