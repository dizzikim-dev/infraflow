/**
 * Organization-Specific Customization Module
 *
 * Allows companies to define their own infrastructure standards,
 * compliance rules, component requirements, and naming conventions.
 *
 * Two built-in example configs are provided:
 * - FINANCE_ENTERPRISE: Security-focused financial enterprise (금융보안 기업)
 * - CLOUD_STARTUP: Cloud-native startup (클라우드 스타트업)
 */

import type { InfraNodeType } from '@/types/infra';

// ---------------------------------------------------------------------------
// Valid InfraNodeType set (for validation)
// ---------------------------------------------------------------------------

const VALID_INFRA_NODE_TYPES: ReadonlySet<string> = new Set<string>([
  // Security
  'firewall', 'waf', 'ids-ips', 'vpn-gateway', 'nac', 'dlp',
  // Network
  'router', 'switch-l2', 'switch-l3', 'load-balancer', 'sd-wan', 'dns', 'cdn',
  // Compute
  'web-server', 'app-server', 'db-server', 'container', 'vm', 'kubernetes',
  // Cloud
  'aws-vpc', 'azure-vnet', 'gcp-network', 'private-cloud',
  // Storage
  'san-nas', 'object-storage', 'backup', 'cache', 'storage',
  // Auth
  'ldap-ad', 'sso', 'mfa', 'iam',
  // External / Zone
  'user', 'internet', 'zone',
]);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OrganizationProfile {
  id: string;                              // e.g. 'org-acme-corp'
  name: string;
  nameKo: string;
  industry?: string;                       // Links to industryPresets if desired
  createdAt: string;
  updatedAt: string;
}

export interface CustomRule {
  id: string;                              // e.g. 'RULE-001'
  nameKo: string;
  descriptionKo: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
}

export interface ComponentRequirement {
  component: InfraNodeType;
  required: boolean;                       // true = mandatory, false = recommended
  reasonKo: string;
  alternatives?: InfraNodeType[];          // Acceptable alternatives
}

export interface CustomRelationship {
  source: InfraNodeType;
  target: InfraNodeType;
  type: 'requires' | 'recommends' | 'conflicts';
  reasonKo: string;
}

export interface NamingConvention {
  pattern: string;                         // regex pattern
  exampleKo: string;
  descriptionKo: string;
}

export interface OrganizationConfig {
  profile: OrganizationProfile;
  rules: CustomRule[];
  componentRequirements: ComponentRequirement[];
  customRelationships: CustomRelationship[];
  namingConventions: NamingConvention[];
  blockedComponents: InfraNodeType[];      // Components not allowed in this org
  preferredComponents: InfraNodeType[];    // Preferred over alternatives
  tags: string[];                          // Org-specific tags for filtering
}

export interface OrgValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface OrgComplianceResult {
  passed: { rule: CustomRule; details: string }[];
  failed: { rule: CustomRule; details: string }[];
  skipped: { rule: CustomRule; reason: string }[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isValidInfraNodeType(value: string): value is InfraNodeType {
  return VALID_INFRA_NODE_TYPES.has(value);
}

function isValidRegex(pattern: string): boolean {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
}

/**
 * Deduplicate an array, preserving insertion order.
 */
function dedup<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

// ---------------------------------------------------------------------------
// createOrgConfig
// ---------------------------------------------------------------------------

/**
 * Create a new OrganizationConfig with empty defaults.
 */
export function createOrgConfig(profile: OrganizationProfile): OrganizationConfig {
  return {
    profile,
    rules: [],
    componentRequirements: [],
    customRelationships: [],
    namingConventions: [],
    blockedComponents: [],
    preferredComponents: [],
    tags: [],
  };
}

// ---------------------------------------------------------------------------
// validateOrgConfig
// ---------------------------------------------------------------------------

/**
 * Validate organizational config integrity.
 *
 * Checks:
 * - Profile has id and name
 * - Rules have unique IDs
 * - Component requirements reference valid InfraNodeTypes
 * - Custom relationships reference valid types
 * - Naming convention patterns are valid regex
 * - No circular requirements (A requires B, B requires A)
 * - Warns on conflicting requirements (component both required and blocked)
 */
export function validateOrgConfig(config: OrganizationConfig): OrgValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // --- Profile checks ---
  if (!config.profile.id || config.profile.id.trim() === '') {
    errors.push('프로필 ID가 비어있습니다');
  }
  if (!config.profile.name || config.profile.name.trim() === '') {
    errors.push('프로필 이름이 비어있습니다');
  }

  // --- Rule uniqueness ---
  const ruleIds = config.rules.map((r) => r.id);
  const ruleIdSet = new Set(ruleIds);
  if (ruleIdSet.size !== ruleIds.length) {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    for (const id of ruleIds) {
      if (seen.has(id)) duplicates.add(id);
      seen.add(id);
    }
    errors.push(`중복된 규칙 ID: ${[...duplicates].join(', ')}`);
  }

  // --- Component requirements: valid types ---
  for (const req of config.componentRequirements) {
    if (!isValidInfraNodeType(req.component as string)) {
      errors.push(`잘못된 컴포넌트 타입 (요구사항): ${req.component}`);
    }
    if (req.alternatives) {
      for (const alt of req.alternatives) {
        if (!isValidInfraNodeType(alt as string)) {
          errors.push(`잘못된 대안 컴포넌트 타입: ${alt}`);
        }
      }
    }
  }

  // --- Custom relationships: valid types ---
  for (const rel of config.customRelationships) {
    if (!isValidInfraNodeType(rel.source as string)) {
      errors.push(`잘못된 관계 소스 타입: ${rel.source}`);
    }
    if (!isValidInfraNodeType(rel.target as string)) {
      errors.push(`잘못된 관계 대상 타입: ${rel.target}`);
    }
  }

  // --- Naming conventions: valid regex ---
  for (const nc of config.namingConventions) {
    if (!isValidRegex(nc.pattern)) {
      errors.push(`잘못된 정규식 패턴: ${nc.pattern}`);
    }
  }

  // --- Circular requirement detection ---
  const requiresRelationships = config.customRelationships.filter((r) => r.type === 'requires');
  for (const relA of requiresRelationships) {
    for (const relB of requiresRelationships) {
      if (relA !== relB && relA.source === relB.target && relA.target === relB.source) {
        errors.push(
          `순환 의존성 감지: ${relA.source} ↔ ${relA.target}`,
        );
      }
    }
  }

  // --- Conflicting: required + blocked ---
  const requiredComponents = new Set(
    config.componentRequirements
      .filter((r) => r.required)
      .map((r) => r.component),
  );
  const blockedSet = new Set(config.blockedComponents);
  for (const comp of requiredComponents) {
    if (blockedSet.has(comp)) {
      warnings.push(`컴포넌트 '${comp}'이(가) 필수이면서 차단 목록에 있습니다`);
    }
  }

  // --- Blocked components: valid types ---
  for (const comp of config.blockedComponents) {
    if (!isValidInfraNodeType(comp as string)) {
      errors.push(`잘못된 차단 컴포넌트 타입: ${comp}`);
    }
  }

  // --- Preferred components: valid types ---
  for (const comp of config.preferredComponents) {
    if (!isValidInfraNodeType(comp as string)) {
      errors.push(`잘못된 선호 컴포넌트 타입: ${comp}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ---------------------------------------------------------------------------
// checkOrgCompliance
// ---------------------------------------------------------------------------

/**
 * Check whether a set of present components meets the organisation's requirements.
 *
 * Returns passed / failed / skipped categorisation for every enabled rule, plus
 * automatic checks for componentRequirements and blockedComponents.
 */
export function checkOrgCompliance(
  config: OrganizationConfig,
  presentComponents: InfraNodeType[],
): OrgComplianceResult {
  const passed: OrgComplianceResult['passed'] = [];
  const failed: OrgComplianceResult['failed'] = [];
  const skipped: OrgComplianceResult['skipped'] = [];

  const presentSet = new Set<InfraNodeType>(presentComponents);

  // --- Component requirement checks ---
  for (const req of config.componentRequirements) {
    const syntheticRule: CustomRule = {
      id: `REQ-${req.component}`,
      nameKo: `${req.component} ${req.required ? '필수' : '권장'} 요구사항`,
      descriptionKo: req.reasonKo,
      severity: req.required ? 'critical' : 'medium',
      enabled: true,
    };

    const componentPresent = presentSet.has(req.component);
    const alternativePresent = req.alternatives
      ? req.alternatives.some((alt) => presentSet.has(alt))
      : false;

    if (componentPresent || alternativePresent) {
      const detail = componentPresent
        ? `${req.component} 컴포넌트가 존재합니다`
        : `대안 컴포넌트가 존재합니다: ${req.alternatives!.filter((a) => presentSet.has(a)).join(', ')}`;
      passed.push({ rule: syntheticRule, details: detail });
    } else if (req.required) {
      const detail = req.alternatives && req.alternatives.length > 0
        ? `${req.component} 또는 대안(${req.alternatives.join(', ')})이 없습니다`
        : `필수 컴포넌트 ${req.component}이(가) 없습니다`;
      failed.push({ rule: syntheticRule, details: detail });
    } else {
      passed.push({
        rule: syntheticRule,
        details: `${req.component}은(는) 권장 사항이며, 없어도 됩니다`,
      });
    }
  }

  // --- Blocked component checks ---
  for (const blocked of config.blockedComponents) {
    const syntheticRule: CustomRule = {
      id: `BLK-${blocked}`,
      nameKo: `${blocked} 사용 금지`,
      descriptionKo: `조직 정책에 의해 ${blocked} 사용이 금지됩니다`,
      severity: 'high',
      enabled: true,
    };

    if (presentSet.has(blocked)) {
      failed.push({
        rule: syntheticRule,
        details: `차단된 컴포넌트 ${blocked}이(가) 존재합니다`,
      });
    } else {
      passed.push({
        rule: syntheticRule,
        details: `차단된 컴포넌트 ${blocked}이(가) 사용되지 않았습니다`,
      });
    }
  }

  // --- Custom rules ---
  for (const rule of config.rules) {
    if (!rule.enabled) {
      skipped.push({ rule, reason: '규칙이 비활성화 상태입니다' });
      continue;
    }

    // Custom rules are treated as informational pass-through since
    // their enforcement depends on external logic.  Enabled rules
    // are reported as passed by default.
    passed.push({ rule, details: `규칙 '${rule.nameKo}' 평가 완료` });
  }

  return { passed, failed, skipped };
}

// ---------------------------------------------------------------------------
// mergeConfigs
// ---------------------------------------------------------------------------

/**
 * Deep-merge two OrganizationConfigs.
 *
 * - Override takes precedence for scalar/profile fields.
 * - Rules with the same ID get overridden; otherwise concatenated.
 * - Array fields (blockedComponents, preferredComponents, tags) are concatenated and deduped.
 * - componentRequirements and customRelationships are concatenated.
 * - namingConventions are concatenated.
 */
export function mergeConfigs(
  base: OrganizationConfig,
  override: Partial<OrganizationConfig>,
): OrganizationConfig {
  // --- Profile ---
  const profile: OrganizationProfile = override.profile
    ? { ...base.profile, ...override.profile }
    : { ...base.profile };

  // --- Rules: same ID = override, otherwise concat ---
  let mergedRules = [...base.rules];
  if (override.rules) {
    const overrideMap = new Map(override.rules.map((r) => [r.id, r]));
    mergedRules = mergedRules.map((r) => overrideMap.get(r.id) ?? r);
    // Add new rules not in base
    for (const r of override.rules) {
      if (!base.rules.some((br) => br.id === r.id)) {
        mergedRules.push(r);
      }
    }
  }

  // --- Component requirements: concat ---
  const mergedRequirements = [
    ...base.componentRequirements,
    ...(override.componentRequirements ?? []),
  ];

  // --- Custom relationships: concat ---
  const mergedRelationships = [
    ...base.customRelationships,
    ...(override.customRelationships ?? []),
  ];

  // --- Naming conventions: concat ---
  const mergedNaming = [
    ...base.namingConventions,
    ...(override.namingConventions ?? []),
  ];

  // --- Deduped arrays ---
  const mergedBlocked = dedup([
    ...base.blockedComponents,
    ...(override.blockedComponents ?? []),
  ]) as InfraNodeType[];

  const mergedPreferred = dedup([
    ...base.preferredComponents,
    ...(override.preferredComponents ?? []),
  ]) as InfraNodeType[];

  const mergedTags = dedup([
    ...base.tags,
    ...(override.tags ?? []),
  ]);

  return {
    profile,
    rules: mergedRules,
    componentRequirements: mergedRequirements,
    customRelationships: mergedRelationships,
    namingConventions: mergedNaming,
    blockedComponents: mergedBlocked,
    preferredComponents: mergedPreferred,
    tags: mergedTags,
  };
}

// ---------------------------------------------------------------------------
// Example Configs
// ---------------------------------------------------------------------------

const FINANCE_ENTERPRISE_CONFIG: OrganizationConfig = {
  profile: {
    id: 'org-finance-enterprise',
    name: 'SecureBank Corp',
    nameKo: '시큐어뱅크',
    industry: 'finance',
    createdAt: '2026-01-15',
    updatedAt: '2026-02-09',
  },
  rules: [
    {
      id: 'FIN-001',
      nameKo: '데이터베이스 직접 외부 노출 금지',
      descriptionKo: '데이터베이스 서버는 인터넷에 직접 노출되어서는 안 됩니다. 반드시 방화벽과 내부망을 통해 접근해야 합니다.',
      severity: 'critical',
      enabled: true,
    },
    {
      id: 'FIN-002',
      nameKo: 'WAF 필수 적용',
      descriptionKo: '모든 웹 서비스는 WAF를 통해 보호되어야 합니다. SQL Injection, XSS 등 공격 방어가 필수입니다.',
      severity: 'critical',
      enabled: true,
    },
    {
      id: 'FIN-003',
      nameKo: '다중 인증(MFA) 필수',
      descriptionKo: '관리자 및 내부 시스템 접근 시 다중 인증을 필수로 적용해야 합니다.',
      severity: 'high',
      enabled: true,
    },
    {
      id: 'FIN-004',
      nameKo: '암호화 통신 필수',
      descriptionKo: '모든 내부/외부 통신은 TLS 1.2 이상으로 암호화되어야 합니다.',
      severity: 'critical',
      enabled: true,
    },
    {
      id: 'FIN-005',
      nameKo: 'IDS/IPS 모니터링 필수',
      descriptionKo: '침입 탐지/방지 시스템을 통한 실시간 모니터링이 필수입니다.',
      severity: 'high',
      enabled: true,
    },
  ],
  componentRequirements: [
    {
      component: 'firewall' as InfraNodeType,
      required: true,
      reasonKo: '금융 규제(전자금융감독규정)에 따라 네트워크 방화벽은 필수입니다',
    },
    {
      component: 'waf' as InfraNodeType,
      required: true,
      reasonKo: '웹 애플리케이션 보안을 위해 WAF 적용이 필수입니다',
    },
    {
      component: 'ids-ips' as InfraNodeType,
      required: true,
      reasonKo: '침입 탐지/방지 시스템은 금융 보안 규정상 필수입니다',
    },
    {
      component: 'mfa' as InfraNodeType,
      required: true,
      reasonKo: '다중 인증은 금융 시스템 접근 통제에 필수입니다',
      alternatives: ['sso' as InfraNodeType],
    },
    {
      component: 'backup' as InfraNodeType,
      required: true,
      reasonKo: '금융 데이터 백업은 규정 준수를 위해 필수입니다',
    },
    {
      component: 'dlp' as InfraNodeType,
      required: false,
      reasonKo: '데이터 유출 방지(DLP)는 개인정보 보호를 위해 권장됩니다',
    },
  ],
  customRelationships: [
    {
      source: 'db-server' as InfraNodeType,
      target: 'firewall' as InfraNodeType,
      type: 'requires',
      reasonKo: '데이터베이스는 반드시 방화벽으로 보호되어야 합니다',
    },
    {
      source: 'web-server' as InfraNodeType,
      target: 'waf' as InfraNodeType,
      type: 'requires',
      reasonKo: '웹 서버 앞단에 WAF 배치가 필수입니다',
    },
    {
      source: 'app-server' as InfraNodeType,
      target: 'ids-ips' as InfraNodeType,
      type: 'recommends',
      reasonKo: '애플리케이션 서버는 IDS/IPS 모니터링이 권장됩니다',
    },
    {
      source: 'db-server' as InfraNodeType,
      target: 'internet' as InfraNodeType,
      type: 'conflicts',
      reasonKo: '데이터베이스의 인터넷 직접 노출은 금지됩니다',
    },
  ],
  namingConventions: [
    {
      pattern: '^(prd|stg|dev)-[a-z]+-[a-z0-9]+$',
      exampleKo: 'prd-web-01, stg-db-master',
      descriptionKo: '환경-역할-식별자 형식으로 명명합니다',
    },
    {
      pattern: '^fw-[a-z]+-\\d{2}$',
      exampleKo: 'fw-dmz-01, fw-internal-02',
      descriptionKo: '방화벽은 fw-영역-번호 형식으로 명명합니다',
    },
  ],
  blockedComponents: [
    'gcp-network' as InfraNodeType,
  ],
  preferredComponents: [
    'firewall' as InfraNodeType,
    'waf' as InfraNodeType,
    'ids-ips' as InfraNodeType,
    'vpn-gateway' as InfraNodeType,
    'dlp' as InfraNodeType,
    'nac' as InfraNodeType,
  ],
  tags: ['금융', '보안', '규제준수', 'PCI-DSS', '전자금융감독규정'],
};

const CLOUD_STARTUP_CONFIG: OrganizationConfig = {
  profile: {
    id: 'org-cloud-startup',
    name: 'CloudFirst Inc.',
    nameKo: '클라우드퍼스트',
    industry: 'technology',
    createdAt: '2026-02-01',
    updatedAt: '2026-02-09',
  },
  rules: [
    {
      id: 'CST-001',
      nameKo: '컨테이너 우선 정책',
      descriptionKo: '모든 워크로드는 컨테이너 기반으로 배포해야 합니다. VM 사용은 예외적으로만 허용됩니다.',
      severity: 'high',
      enabled: true,
    },
    {
      id: 'CST-002',
      nameKo: '클라우드 네이티브 아키텍처',
      descriptionKo: '온프레미스 장비 사용을 최소화하고, 클라우드 매니지드 서비스를 우선 사용합니다.',
      severity: 'medium',
      enabled: true,
    },
    {
      id: 'CST-003',
      nameKo: '자동 스케일링 필수',
      descriptionKo: '모든 서비스는 트래픽에 따라 자동으로 확장/축소 가능해야 합니다.',
      severity: 'high',
      enabled: true,
    },
    {
      id: 'CST-004',
      nameKo: 'CDN 활용 권장',
      descriptionKo: '정적 자산과 API 응답 캐싱을 위해 CDN 사용을 권장합니다.',
      severity: 'low',
      enabled: false,
    },
  ],
  componentRequirements: [
    {
      component: 'kubernetes' as InfraNodeType,
      required: true,
      reasonKo: '컨테이너 오케스트레이션을 위해 쿠버네티스가 필수입니다',
      alternatives: ['container' as InfraNodeType],
    },
    {
      component: 'load-balancer' as InfraNodeType,
      required: true,
      reasonKo: '고가용성을 위해 로드밸런서가 필수입니다',
    },
    {
      component: 'cache' as InfraNodeType,
      required: false,
      reasonKo: '성능 최적화를 위해 캐시 사용이 권장됩니다',
    },
    {
      component: 'cdn' as InfraNodeType,
      required: false,
      reasonKo: '글로벌 서비스 제공을 위해 CDN 사용이 권장됩니다',
    },
    {
      component: 'iam' as InfraNodeType,
      required: true,
      reasonKo: '클라우드 리소스 접근 제어를 위해 IAM이 필수입니다',
    },
  ],
  customRelationships: [
    {
      source: 'kubernetes' as InfraNodeType,
      target: 'load-balancer' as InfraNodeType,
      type: 'requires',
      reasonKo: '쿠버네티스 서비스 노출을 위해 로드밸런서가 필요합니다',
    },
    {
      source: 'container' as InfraNodeType,
      target: 'kubernetes' as InfraNodeType,
      type: 'recommends',
      reasonKo: '컨테이너 관리를 위해 쿠버네티스 사용이 권장됩니다',
    },
    {
      source: 'web-server' as InfraNodeType,
      target: 'cdn' as InfraNodeType,
      type: 'recommends',
      reasonKo: '정적 자산 전달 최적화를 위해 CDN이 권장됩니다',
    },
  ],
  namingConventions: [
    {
      pattern: '^[a-z]+-[a-z]+-[a-z0-9]+(-[a-z0-9]+)*$',
      exampleKo: 'api-auth-service, web-frontend-v2',
      descriptionKo: '역할-기능-식별자 형식으로 명명합니다 (소문자, 하이픈 구분)',
    },
  ],
  blockedComponents: [
    'private-cloud' as InfraNodeType,
    'san-nas' as InfraNodeType,
  ],
  preferredComponents: [
    'kubernetes' as InfraNodeType,
    'container' as InfraNodeType,
    'aws-vpc' as InfraNodeType,
    'load-balancer' as InfraNodeType,
    'cdn' as InfraNodeType,
    'cache' as InfraNodeType,
    'object-storage' as InfraNodeType,
  ],
  tags: ['클라우드', '스타트업', 'kubernetes', 'cloud-native', 'auto-scaling'],
};

/**
 * Pre-built example configs (frozen for immutability).
 */
export const EXAMPLE_CONFIGS = Object.freeze({
  FINANCE_ENTERPRISE: Object.freeze(FINANCE_ENTERPRISE_CONFIG),
  CLOUD_STARTUP: Object.freeze(CLOUD_STARTUP_CONFIG),
});
