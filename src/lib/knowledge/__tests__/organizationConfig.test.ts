import { describe, it, expect } from 'vitest';
import type { InfraNodeType } from '@/types/infra';
import {
  createOrgConfig,
  validateOrgConfig,
  checkOrgCompliance,
  mergeConfigs,
  EXAMPLE_CONFIGS,
} from '../organizationConfig';
import type {
  OrganizationProfile,
  OrganizationConfig,
  CustomRule,
  ComponentRequirement,
  CustomRelationship,
  NamingConvention,
} from '../organizationConfig';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeProfile(overrides: Partial<OrganizationProfile> = {}): OrganizationProfile {
  return {
    id: 'org-test',
    name: 'Test Org',
    nameKo: '테스트 조직',
    createdAt: '2026-01-01',
    updatedAt: '2026-02-09',
    ...overrides,
  };
}

function makeRule(overrides: Partial<CustomRule> = {}): CustomRule {
  return {
    id: 'RULE-001',
    nameKo: '테스트 규칙',
    descriptionKo: '테스트 규칙 설명',
    severity: 'high',
    enabled: true,
    ...overrides,
  };
}

function makeConfig(overrides: Partial<OrganizationConfig> = {}): OrganizationConfig {
  return {
    ...createOrgConfig(makeProfile()),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// createOrgConfig
// ---------------------------------------------------------------------------

describe('createOrgConfig', () => {
  it('should create config with the provided profile', () => {
    const profile = makeProfile({ id: 'org-acme', name: 'Acme', nameKo: '에이크미' });
    const config = createOrgConfig(profile);
    expect(config.profile).toEqual(profile);
  });

  it('should have empty rules array', () => {
    const config = createOrgConfig(makeProfile());
    expect(config.rules).toEqual([]);
  });

  it('should have empty componentRequirements', () => {
    const config = createOrgConfig(makeProfile());
    expect(config.componentRequirements).toEqual([]);
  });

  it('should have empty customRelationships', () => {
    const config = createOrgConfig(makeProfile());
    expect(config.customRelationships).toEqual([]);
  });

  it('should have empty namingConventions', () => {
    const config = createOrgConfig(makeProfile());
    expect(config.namingConventions).toEqual([]);
  });

  it('should have empty blockedComponents and preferredComponents', () => {
    const config = createOrgConfig(makeProfile());
    expect(config.blockedComponents).toEqual([]);
    expect(config.preferredComponents).toEqual([]);
  });

  it('should have empty tags', () => {
    const config = createOrgConfig(makeProfile());
    expect(config.tags).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// validateOrgConfig
// ---------------------------------------------------------------------------

describe('validateOrgConfig', () => {
  it('should validate a complete valid config', () => {
    const config = makeConfig({
      rules: [makeRule({ id: 'R-001' }), makeRule({ id: 'R-002' })],
      componentRequirements: [
        { component: 'firewall' as InfraNodeType, required: true, reasonKo: '보안 필수' },
      ],
      customRelationships: [
        {
          source: 'web-server' as InfraNodeType,
          target: 'waf' as InfraNodeType,
          type: 'requires',
          reasonKo: 'WAF 필수',
        },
      ],
      namingConventions: [
        { pattern: '^[a-z]+$', exampleKo: 'test', descriptionKo: '소문자만' },
      ],
    });
    const result = validateOrgConfig(config);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should error on missing profile id', () => {
    const config = makeConfig();
    config.profile.id = '';
    const result = validateOrgConfig(config);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('프로필 ID'))).toBe(true);
  });

  it('should error on missing profile name', () => {
    const config = makeConfig();
    config.profile.name = '';
    const result = validateOrgConfig(config);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('프로필 이름'))).toBe(true);
  });

  it('should error on duplicate rule IDs', () => {
    const config = makeConfig({
      rules: [
        makeRule({ id: 'DUP-001' }),
        makeRule({ id: 'DUP-001' }),
      ],
    });
    const result = validateOrgConfig(config);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('중복된 규칙 ID'))).toBe(true);
    expect(result.errors.some((e) => e.includes('DUP-001'))).toBe(true);
  });

  it('should error on invalid component type in requirements', () => {
    const config = makeConfig({
      componentRequirements: [
        {
          component: 'invalid-component' as InfraNodeType,
          required: true,
          reasonKo: '테스트',
        },
      ],
    });
    const result = validateOrgConfig(config);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('잘못된 컴포넌트 타입'))).toBe(true);
  });

  it('should error on invalid alternative component type', () => {
    const config = makeConfig({
      componentRequirements: [
        {
          component: 'firewall' as InfraNodeType,
          required: true,
          reasonKo: '보안 필수',
          alternatives: ['nonexistent-device' as InfraNodeType],
        },
      ],
    });
    const result = validateOrgConfig(config);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('잘못된 대안 컴포넌트'))).toBe(true);
  });

  it('should error on invalid component type in custom relationships', () => {
    const config = makeConfig({
      customRelationships: [
        {
          source: 'bad-source' as InfraNodeType,
          target: 'firewall' as InfraNodeType,
          type: 'requires',
          reasonKo: '테스트',
        },
      ],
    });
    const result = validateOrgConfig(config);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('잘못된 관계 소스 타입'))).toBe(true);
  });

  it('should error on invalid regex in naming convention', () => {
    const config = makeConfig({
      namingConventions: [
        {
          pattern: '[invalid(regex',
          exampleKo: '테스트',
          descriptionKo: '테스트',
        },
      ],
    });
    const result = validateOrgConfig(config);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('잘못된 정규식 패턴'))).toBe(true);
  });

  it('should error on circular requirements', () => {
    const config = makeConfig({
      customRelationships: [
        {
          source: 'firewall' as InfraNodeType,
          target: 'waf' as InfraNodeType,
          type: 'requires',
          reasonKo: 'A → B',
        },
        {
          source: 'waf' as InfraNodeType,
          target: 'firewall' as InfraNodeType,
          type: 'requires',
          reasonKo: 'B → A',
        },
      ],
    });
    const result = validateOrgConfig(config);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('순환 의존성'))).toBe(true);
  });

  it('should warn on conflicting requirements (required + blocked)', () => {
    const config = makeConfig({
      componentRequirements: [
        {
          component: 'firewall' as InfraNodeType,
          required: true,
          reasonKo: '필수',
        },
      ],
      blockedComponents: ['firewall' as InfraNodeType],
    });
    const result = validateOrgConfig(config);
    // It may or may not be valid (errors vs warnings), but should warn
    expect(result.warnings.some((w) => w.includes('firewall'))).toBe(true);
    expect(result.warnings.some((w) => w.includes('필수이면서 차단'))).toBe(true);
  });

  it('should pass for the FINANCE_ENTERPRISE example config', () => {
    const result = validateOrgConfig(EXAMPLE_CONFIGS.FINANCE_ENTERPRISE as OrganizationConfig);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should pass for the CLOUD_STARTUP example config', () => {
    const result = validateOrgConfig(EXAMPLE_CONFIGS.CLOUD_STARTUP as OrganizationConfig);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should error on invalid blocked component type', () => {
    const config = makeConfig({
      blockedComponents: ['not-a-real-type' as InfraNodeType],
    });
    const result = validateOrgConfig(config);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('잘못된 차단 컴포넌트'))).toBe(true);
  });

  it('should error on invalid preferred component type', () => {
    const config = makeConfig({
      preferredComponents: ['fake-component' as InfraNodeType],
    });
    const result = validateOrgConfig(config);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('잘못된 선호 컴포넌트'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// checkOrgCompliance
// ---------------------------------------------------------------------------

describe('checkOrgCompliance', () => {
  it('should pass when all required components are present', () => {
    const config = makeConfig({
      componentRequirements: [
        { component: 'firewall' as InfraNodeType, required: true, reasonKo: '보안 필수' },
        { component: 'waf' as InfraNodeType, required: true, reasonKo: 'WAF 필수' },
      ],
    });
    const result = checkOrgCompliance(config, ['firewall', 'waf', 'web-server'] as InfraNodeType[]);
    expect(result.failed).toHaveLength(0);
    expect(result.passed.length).toBeGreaterThanOrEqual(2);
  });

  it('should fail when required component is missing', () => {
    const config = makeConfig({
      componentRequirements: [
        { component: 'firewall' as InfraNodeType, required: true, reasonKo: '보안 필수' },
        { component: 'ids-ips' as InfraNodeType, required: true, reasonKo: 'IDS 필수' },
      ],
    });
    const result = checkOrgCompliance(config, ['firewall'] as InfraNodeType[]);
    expect(result.failed.length).toBeGreaterThanOrEqual(1);
    expect(result.failed.some((f) => f.rule.id.includes('ids-ips'))).toBe(true);
  });

  it('should pass when an alternative component is present', () => {
    const config = makeConfig({
      componentRequirements: [
        {
          component: 'mfa' as InfraNodeType,
          required: true,
          reasonKo: 'MFA 필수',
          alternatives: ['sso' as InfraNodeType],
        },
      ],
    });
    // mfa is not present, but sso (alternative) is
    const result = checkOrgCompliance(config, ['sso', 'firewall'] as InfraNodeType[]);
    expect(result.failed).toHaveLength(0);
    expect(result.passed.some((p) => p.details.includes('대안'))).toBe(true);
  });

  it('should fail when blocked component is present', () => {
    const config = makeConfig({
      blockedComponents: ['gcp-network' as InfraNodeType],
    });
    const result = checkOrgCompliance(config, ['gcp-network', 'firewall'] as InfraNodeType[]);
    expect(result.failed.length).toBeGreaterThanOrEqual(1);
    expect(result.failed.some((f) => f.details.includes('gcp-network'))).toBe(true);
  });

  it('should skip disabled rules', () => {
    const config = makeConfig({
      rules: [
        makeRule({ id: 'R-DISABLED', enabled: false, nameKo: '비활성 규칙' }),
        makeRule({ id: 'R-ENABLED', enabled: true, nameKo: '활성 규칙' }),
      ],
    });
    const result = checkOrgCompliance(config, [] as InfraNodeType[]);
    expect(result.skipped.length).toBe(1);
    expect(result.skipped[0].rule.id).toBe('R-DISABLED');
    expect(result.passed.some((p) => p.rule.id === 'R-ENABLED')).toBe(true);
  });

  it('should return correct passed/failed/skipped counts', () => {
    const config = makeConfig({
      componentRequirements: [
        { component: 'firewall' as InfraNodeType, required: true, reasonKo: '필수' },
        { component: 'waf' as InfraNodeType, required: true, reasonKo: '필수' },
      ],
      blockedComponents: ['gcp-network' as InfraNodeType],
      rules: [
        makeRule({ id: 'R-ON', enabled: true }),
        makeRule({ id: 'R-OFF', enabled: false }),
      ],
    });
    // firewall present, waf missing, gcp-network not present
    const result = checkOrgCompliance(config, ['firewall'] as InfraNodeType[]);

    // Passed: firewall req + gcp-network block (not present) + R-ON rule
    expect(result.passed.length).toBe(3);
    // Failed: waf req missing
    expect(result.failed.length).toBe(1);
    // Skipped: R-OFF
    expect(result.skipped.length).toBe(1);
  });

  it('should handle recommended (non-required) components gracefully', () => {
    const config = makeConfig({
      componentRequirements: [
        { component: 'cache' as InfraNodeType, required: false, reasonKo: '성능 권장' },
      ],
    });
    // cache is not present, but it is not required
    const result = checkOrgCompliance(config, ['firewall'] as InfraNodeType[]);
    expect(result.failed).toHaveLength(0);
    expect(result.passed.some((p) => p.details.includes('권장'))).toBe(true);
  });

  it('should pass blocked check when blocked component is absent', () => {
    const config = makeConfig({
      blockedComponents: ['private-cloud' as InfraNodeType],
    });
    const result = checkOrgCompliance(config, ['aws-vpc'] as InfraNodeType[]);
    expect(result.failed).toHaveLength(0);
    expect(result.passed.some((p) => p.details.includes('private-cloud'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// mergeConfigs
// ---------------------------------------------------------------------------

describe('mergeConfigs', () => {
  it('should override profile fields', () => {
    const base = makeConfig();
    const override: Partial<OrganizationConfig> = {
      profile: {
        ...base.profile,
        name: 'New Name',
        nameKo: '새 이름',
      },
    };
    const merged = mergeConfigs(base, override);
    expect(merged.profile.name).toBe('New Name');
    expect(merged.profile.nameKo).toBe('새 이름');
    expect(merged.profile.id).toBe(base.profile.id);
  });

  it('should merge rules with same ID overriding', () => {
    const base = makeConfig({
      rules: [
        makeRule({ id: 'R-001', nameKo: '원본 규칙', severity: 'medium' }),
        makeRule({ id: 'R-002', nameKo: '유지 규칙' }),
      ],
    });
    const override: Partial<OrganizationConfig> = {
      rules: [
        makeRule({ id: 'R-001', nameKo: '수정된 규칙', severity: 'critical' }),
        makeRule({ id: 'R-003', nameKo: '새 규칙' }),
      ],
    };
    const merged = mergeConfigs(base, override);

    expect(merged.rules).toHaveLength(3);
    const r001 = merged.rules.find((r) => r.id === 'R-001');
    expect(r001!.nameKo).toBe('수정된 규칙');
    expect(r001!.severity).toBe('critical');
    expect(merged.rules.some((r) => r.id === 'R-002')).toBe(true);
    expect(merged.rules.some((r) => r.id === 'R-003')).toBe(true);
  });

  it('should concatenate and dedup array fields', () => {
    const base = makeConfig({
      tags: ['tag-a', 'tag-b'],
      blockedComponents: ['gcp-network' as InfraNodeType],
      preferredComponents: ['firewall' as InfraNodeType],
    });
    const override: Partial<OrganizationConfig> = {
      tags: ['tag-b', 'tag-c'],
      blockedComponents: ['gcp-network' as InfraNodeType, 'private-cloud' as InfraNodeType],
      preferredComponents: ['firewall' as InfraNodeType, 'waf' as InfraNodeType],
    };
    const merged = mergeConfigs(base, override);

    expect(merged.tags).toEqual(['tag-a', 'tag-b', 'tag-c']);
    expect(merged.blockedComponents).toEqual(['gcp-network', 'private-cloud']);
    expect(merged.preferredComponents).toEqual(['firewall', 'waf']);
  });

  it('should preserve base config when no override fields are provided', () => {
    const base = makeConfig({
      rules: [makeRule({ id: 'R-001' })],
      tags: ['original'],
      blockedComponents: ['gcp-network' as InfraNodeType],
    });
    const merged = mergeConfigs(base, {});

    expect(merged.profile).toEqual(base.profile);
    expect(merged.rules).toEqual(base.rules);
    expect(merged.tags).toEqual(base.tags);
    expect(merged.blockedComponents).toEqual(base.blockedComponents);
  });

  it('should concatenate component requirements', () => {
    const base = makeConfig({
      componentRequirements: [
        { component: 'firewall' as InfraNodeType, required: true, reasonKo: '기본' },
      ],
    });
    const override: Partial<OrganizationConfig> = {
      componentRequirements: [
        { component: 'waf' as InfraNodeType, required: true, reasonKo: '추가' },
      ],
    };
    const merged = mergeConfigs(base, override);
    expect(merged.componentRequirements).toHaveLength(2);
  });

  it('should concatenate custom relationships', () => {
    const base = makeConfig({
      customRelationships: [
        {
          source: 'firewall' as InfraNodeType,
          target: 'waf' as InfraNodeType,
          type: 'recommends',
          reasonKo: '기본 관계',
        },
      ],
    });
    const override: Partial<OrganizationConfig> = {
      customRelationships: [
        {
          source: 'web-server' as InfraNodeType,
          target: 'cdn' as InfraNodeType,
          type: 'recommends',
          reasonKo: '추가 관계',
        },
      ],
    };
    const merged = mergeConfigs(base, override);
    expect(merged.customRelationships).toHaveLength(2);
  });

  it('should concatenate naming conventions', () => {
    const base = makeConfig({
      namingConventions: [
        { pattern: '^[a-z]+$', exampleKo: '테스트', descriptionKo: '기본' },
      ],
    });
    const override: Partial<OrganizationConfig> = {
      namingConventions: [
        { pattern: '^[A-Z]+$', exampleKo: 'TEST', descriptionKo: '추가' },
      ],
    };
    const merged = mergeConfigs(base, override);
    expect(merged.namingConventions).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// EXAMPLE_CONFIGS
// ---------------------------------------------------------------------------

describe('EXAMPLE_CONFIGS', () => {
  it('should have 2 example configs', () => {
    expect(Object.keys(EXAMPLE_CONFIGS)).toHaveLength(2);
    expect(EXAMPLE_CONFIGS.FINANCE_ENTERPRISE).toBeDefined();
    expect(EXAMPLE_CONFIGS.CLOUD_STARTUP).toBeDefined();
  });

  it('should be frozen (immutable)', () => {
    expect(Object.isFrozen(EXAMPLE_CONFIGS)).toBe(true);
    expect(Object.isFrozen(EXAMPLE_CONFIGS.FINANCE_ENTERPRISE)).toBe(true);
    expect(Object.isFrozen(EXAMPLE_CONFIGS.CLOUD_STARTUP)).toBe(true);
  });

  it('enterprise config should require security components', () => {
    const enterprise = EXAMPLE_CONFIGS.FINANCE_ENTERPRISE;
    const requiredComponents = enterprise.componentRequirements
      .filter((r) => r.required)
      .map((r) => r.component);

    expect(requiredComponents).toContain('firewall');
    expect(requiredComponents).toContain('waf');
    expect(requiredComponents).toContain('ids-ips');
  });

  it('enterprise config should have security-related rules', () => {
    const enterprise = EXAMPLE_CONFIGS.FINANCE_ENTERPRISE;
    expect(enterprise.rules.length).toBeGreaterThanOrEqual(3);
    expect(enterprise.rules.some((r) => r.severity === 'critical')).toBe(true);
  });

  it('startup config should prefer cloud components', () => {
    const startup = EXAMPLE_CONFIGS.CLOUD_STARTUP;
    expect(startup.preferredComponents).toContain('kubernetes');
    expect(startup.preferredComponents).toContain('container');
    expect(startup.preferredComponents).toContain('aws-vpc');
  });

  it('startup config should block on-premise components', () => {
    const startup = EXAMPLE_CONFIGS.CLOUD_STARTUP;
    expect(startup.blockedComponents).toContain('private-cloud');
  });

  it('startup config should require kubernetes or container', () => {
    const startup = EXAMPLE_CONFIGS.CLOUD_STARTUP;
    const k8sReq = startup.componentRequirements.find((r) => r.component === 'kubernetes');
    expect(k8sReq).toBeDefined();
    expect(k8sReq!.required).toBe(true);
    expect(k8sReq!.alternatives).toContain('container');
  });

  it('both configs should pass validation', () => {
    const finResult = validateOrgConfig(EXAMPLE_CONFIGS.FINANCE_ENTERPRISE as OrganizationConfig);
    const startupResult = validateOrgConfig(EXAMPLE_CONFIGS.CLOUD_STARTUP as OrganizationConfig);

    expect(finResult.isValid).toBe(true);
    expect(finResult.errors).toHaveLength(0);
    expect(startupResult.isValid).toBe(true);
    expect(startupResult.errors).toHaveLength(0);
  });

  it('both configs should have valid profile data', () => {
    expect(EXAMPLE_CONFIGS.FINANCE_ENTERPRISE.profile.id).toBeTruthy();
    expect(EXAMPLE_CONFIGS.FINANCE_ENTERPRISE.profile.nameKo).toBeTruthy();
    expect(EXAMPLE_CONFIGS.CLOUD_STARTUP.profile.id).toBeTruthy();
    expect(EXAMPLE_CONFIGS.CLOUD_STARTUP.profile.nameKo).toBeTruthy();
  });

  it('both configs should have tags', () => {
    expect(EXAMPLE_CONFIGS.FINANCE_ENTERPRISE.tags.length).toBeGreaterThanOrEqual(2);
    expect(EXAMPLE_CONFIGS.CLOUD_STARTUP.tags.length).toBeGreaterThanOrEqual(2);
  });
});
