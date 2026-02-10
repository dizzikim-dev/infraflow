/**
 * Knowledge Zod Validation Schema Tests
 */

import { describe, it, expect } from 'vitest';
import {
  TrustMetadataSchema,
  CreateRelationshipSchema,
  UpdateRelationshipSchema,
  CreatePatternSchema,
  CreateAntiPatternSchema,
  CreateFailureSchema,
  CreatePerformanceSchema,
  CreateVulnerabilitySchema,
  CreateCloudServiceSchema,
  CreateBenchmarkSchema,
  CreateIndustryPresetSchema,
  CreateSourceEntrySchema,
  KnowledgeListQuerySchema,
  RelationshipQuerySchema,
  AntiPatternQuerySchema,
  FailureQuerySchema,
  LatencyRangeSchema,
  ThroughputRangeSchema,
  RequiredComponentSchema,
  OptionalComponentSchema,
} from '../knowledge';

// Shared valid trust metadata for reuse
const validTrust = {
  confidence: 0.9,
  sources: [{
    type: 'nist' as const,
    title: 'NIST SP 800-41',
    accessedDate: '2026-02-10',
  }],
  lastReviewedAt: '2026-02-10',
  upvotes: 0,
  downvotes: 0,
};

describe('TrustMetadataSchema', () => {
  it('should validate valid trust metadata', () => {
    const result = TrustMetadataSchema.safeParse(validTrust);
    expect(result.success).toBe(true);
  });

  it('should reject confidence out of range', () => {
    expect(TrustMetadataSchema.safeParse({ ...validTrust, confidence: 1.5 }).success).toBe(false);
    expect(TrustMetadataSchema.safeParse({ ...validTrust, confidence: -0.1 }).success).toBe(false);
  });

  it('should require at least one source', () => {
    const result = TrustMetadataSchema.safeParse({ ...validTrust, sources: [] });
    expect(result.success).toBe(false);
  });

  it('should accept optional provenance fields', () => {
    const result = TrustMetadataSchema.safeParse({
      ...validTrust,
      derivedFrom: ['AP-SEC-001'],
      lastModifiedBy: 'admin',
      modificationHistory: [{
        action: 'created',
        by: 'system',
        at: '2026-02-10T00:00:00Z',
      }],
    });
    expect(result.success).toBe(true);
  });
});

describe('CreateRelationshipSchema', () => {
  const validRelationship = {
    knowledgeId: 'REL-001',
    sourceComponent: 'firewall',
    targetComponent: 'router',
    relationshipType: 'requires' as const,
    strength: 'mandatory' as const,
    direction: 'upstream' as const,
    reason: 'Firewall needs router for traffic routing',
    reasonKo: '방화벽은 트래픽 라우팅을 위해 라우터가 필요합니다',
    tags: ['security', 'network'],
    trustMetadata: validTrust,
  };

  it('should validate valid relationship', () => {
    const result = CreateRelationshipSchema.safeParse(validRelationship);
    expect(result.success).toBe(true);
  });

  it('should reject missing knowledgeId', () => {
    const { knowledgeId: _, ...rest } = validRelationship;
    expect(CreateRelationshipSchema.safeParse(rest).success).toBe(false);
  });

  it('should reject invalid relationship type', () => {
    const result = CreateRelationshipSchema.safeParse({
      ...validRelationship,
      relationshipType: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('should default tags to empty array', () => {
    const { tags: _, ...rest } = validRelationship;
    const result = CreateRelationshipSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
    }
  });
});

describe('UpdateRelationshipSchema', () => {
  it('should allow partial updates', () => {
    const result = UpdateRelationshipSchema.safeParse({
      reason: 'Updated reason',
    });
    expect(result.success).toBe(true);
  });

  it('should accept empty object', () => {
    const result = UpdateRelationshipSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('CreatePatternSchema', () => {
  const validPattern = {
    patternId: 'PAT-001',
    name: '3-Tier Architecture',
    nameKo: '3티어 아키텍처',
    description: 'Standard three-tier web architecture',
    descriptionKo: '표준 3티어 웹 아키텍처',
    requiredComponents: [{ type: 'web-server', minCount: 1 }],
    optionalComponents: [{ type: 'cdn', benefit: 'Faster content delivery', benefitKo: '빠른 콘텐츠 전송' }],
    scalability: 'medium' as const,
    complexity: 2,
    bestForKo: ['소규모 웹 서비스'],
    notSuitableForKo: ['대규모 마이크로서비스'],
    evolvesTo: ['PAT-002'],
    evolvesFrom: [],
    tags: ['web'],
    trustMetadata: validTrust,
  };

  it('should validate valid pattern', () => {
    const result = CreatePatternSchema.safeParse(validPattern);
    expect(result.success).toBe(true);
  });

  it('should reject complexity out of range', () => {
    expect(CreatePatternSchema.safeParse({ ...validPattern, complexity: 0 }).success).toBe(false);
    expect(CreatePatternSchema.safeParse({ ...validPattern, complexity: 6 }).success).toBe(false);
  });

  it('should reject invalid scalability', () => {
    expect(CreatePatternSchema.safeParse({ ...validPattern, scalability: 'ultra' }).success).toBe(false);
  });
});

describe('CreateAntiPatternSchema', () => {
  const validAntiPattern = {
    antiPatternId: 'AP-SEC-001',
    name: 'DB Direct Internet Exposure',
    nameKo: '데이터베이스 인터넷 직접 노출',
    severity: 'critical' as const,
    detectionRuleId: 'AP-SEC-001',
    detectionDescriptionKo: 'DB가 인터넷에 직접 연결됨',
    problemKo: '보안 위험',
    impactKo: '데이터 유출 가능',
    solutionKo: '방화벽 추가',
    tags: ['security'],
    trustMetadata: validTrust,
  };

  it('should validate valid anti-pattern', () => {
    const result = CreateAntiPatternSchema.safeParse(validAntiPattern);
    expect(result.success).toBe(true);
  });

  it('should reject invalid severity', () => {
    const result = CreateAntiPatternSchema.safeParse({ ...validAntiPattern, severity: 'low' });
    expect(result.success).toBe(false);
  });
});

describe('CreateFailureSchema', () => {
  const validFailure = {
    failureId: 'FAIL-FW-001',
    component: 'firewall',
    titleKo: '방화벽 장애',
    scenarioKo: '방화벽이 다운됨',
    impact: 'service_down' as const,
    likelihood: 'medium' as const,
    affectedComponents: ['router', 'web-server'],
    preventionKo: ['이중화 구성'],
    mitigationKo: ['백업 경로 활성화'],
    estimatedMTTR: '30분',
    tags: ['security'],
    trustMetadata: validTrust,
  };

  it('should validate valid failure', () => {
    const result = CreateFailureSchema.safeParse(validFailure);
    expect(result.success).toBe(true);
  });

  it('should reject invalid impact', () => {
    const result = CreateFailureSchema.safeParse({ ...validFailure, impact: 'minor' });
    expect(result.success).toBe(false);
  });
});

describe('CreatePerformanceSchema', () => {
  const validPerformance = {
    performanceId: 'PERF-FW-001',
    component: 'firewall',
    nameKo: '방화벽 성능',
    latencyRange: { min: 0.5, max: 5, unit: 'ms' as const },
    throughputRange: { typical: '1Gbps', max: '10Gbps' },
    scalingStrategy: 'horizontal' as const,
    bottleneckIndicators: ['CPU usage > 80%'],
    bottleneckIndicatorsKo: ['CPU 사용률 80% 초과'],
    optimizationTipsKo: ['패킷 필터링 최적화'],
    tags: ['network'],
    trustMetadata: validTrust,
  };

  it('should validate valid performance profile', () => {
    const result = CreatePerformanceSchema.safeParse(validPerformance);
    expect(result.success).toBe(true);
  });

  it('should reject negative latency', () => {
    const result = CreatePerformanceSchema.safeParse({
      ...validPerformance,
      latencyRange: { min: -1, max: 5, unit: 'ms' },
    });
    expect(result.success).toBe(false);
  });
});

describe('CreateVulnerabilitySchema', () => {
  const validVuln = {
    vulnId: 'VULN-001',
    cveId: 'CVE-2024-12345',
    affectedComponents: ['firewall'],
    severity: 'high' as const,
    cvssScore: 7.5,
    title: 'Firewall Bypass',
    titleKo: '방화벽 우회',
    description: 'A vulnerability allowing...',
    descriptionKo: '취약점으로 인해...',
    mitigation: 'Update firmware',
    mitigationKo: '펌웨어 업데이트',
    publishedDate: '2024-01-01',
    references: ['https://example.com'],
    trustMetadata: validTrust,
  };

  it('should validate valid vulnerability', () => {
    const result = CreateVulnerabilitySchema.safeParse(validVuln);
    expect(result.success).toBe(true);
  });

  it('should allow optional cveId', () => {
    const { cveId: _, ...rest } = validVuln;
    const result = CreateVulnerabilitySchema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  it('should reject CVSS score out of range', () => {
    expect(CreateVulnerabilitySchema.safeParse({ ...validVuln, cvssScore: 11 }).success).toBe(false);
    expect(CreateVulnerabilitySchema.safeParse({ ...validVuln, cvssScore: -1 }).success).toBe(false);
  });

  it('should require at least one affected component', () => {
    const result = CreateVulnerabilitySchema.safeParse({ ...validVuln, affectedComponents: [] });
    expect(result.success).toBe(false);
  });
});

describe('CreateCloudServiceSchema', () => {
  const validService = {
    serviceId: 'aws-ec2',
    provider: 'aws' as const,
    componentType: 'vm',
    serviceName: 'Amazon EC2',
    serviceNameKo: '아마존 EC2',
    status: 'active' as const,
    features: ['Auto Scaling'],
    featuresKo: ['자동 확장'],
    pricingTier: 'medium' as const,
    trustMetadata: validTrust,
  };

  it('should validate valid cloud service', () => {
    const result = CreateCloudServiceSchema.safeParse(validService);
    expect(result.success).toBe(true);
  });

  it('should reject invalid provider', () => {
    const result = CreateCloudServiceSchema.safeParse({ ...validService, provider: 'oracle' });
    expect(result.success).toBe(false);
  });
});

describe('CreateBenchmarkSchema', () => {
  const validBenchmark = {
    componentType: 'web-server',
    trafficTier: 'medium' as const,
    recommendedInstanceCount: 3,
    recommendedSpec: '4 vCPU, 16GB RAM',
    recommendedSpecKo: '4 vCPU, 16GB RAM',
    minimumInstanceCount: 2,
    minimumSpec: '2 vCPU, 8GB RAM',
    minimumSpecKo: '2 vCPU, 8GB RAM',
    scalingNotes: 'Scale horizontally',
    scalingNotesKo: '수평 확장',
    estimatedMonthlyCost: 500,
    maxRPS: 10000,
    trustMetadata: validTrust,
  };

  it('should validate valid benchmark', () => {
    const result = CreateBenchmarkSchema.safeParse(validBenchmark);
    expect(result.success).toBe(true);
  });

  it('should allow optional cost', () => {
    const { estimatedMonthlyCost: _, ...rest } = validBenchmark;
    const result = CreateBenchmarkSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });
});

describe('CreateIndustryPresetSchema', () => {
  it('should validate valid preset', () => {
    const result = CreateIndustryPresetSchema.safeParse({
      industryType: 'financial',
      name: 'Financial Services',
      nameKo: '금융 서비스',
      description: 'Financial industry preset',
      descriptionKo: '금융 산업 프리셋',
      requiredFrameworks: ['PCI-DSS'],
      requiredComponents: ['firewall', 'waf'],
      recommendedComponents: ['ids-ips'],
      minimumSecurityLevel: 'enhanced',
    });
    expect(result.success).toBe(true);
  });
});

describe('CreateSourceEntrySchema', () => {
  it('should validate valid source entry', () => {
    const result = CreateSourceEntrySchema.safeParse({
      sourceId: 'NIST-800-41',
      sourceType: 'nist',
      title: 'NIST SP 800-41 Rev.1',
      url: 'https://csrc.nist.gov/pubs/sp/800/41/r1/final',
      accessedDate: '2026-02-10',
    });
    expect(result.success).toBe(true);
  });

  it('should allow optional URL and section', () => {
    const result = CreateSourceEntrySchema.safeParse({
      sourceId: 'CUSTOM-001',
      sourceType: 'user_verified',
      title: 'Internal Guide',
      accessedDate: '2026-02-10',
    });
    expect(result.success).toBe(true);
  });
});

describe('KnowledgeListQuerySchema', () => {
  it('should use defaults for empty query', () => {
    const result = KnowledgeListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.sortOrder).toBe('desc');
    }
  });

  it('should coerce string values to numbers', () => {
    const result = KnowledgeListQuerySchema.safeParse({
      page: '3',
      limit: '50',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it('should reject page < 1', () => {
    expect(KnowledgeListQuerySchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it('should reject limit > 100', () => {
    expect(KnowledgeListQuerySchema.safeParse({ limit: 101 }).success).toBe(false);
  });
});

describe('RelationshipQuerySchema', () => {
  it('should accept type-specific filters', () => {
    const result = RelationshipQuerySchema.safeParse({
      sourceComponent: 'firewall',
      relationshipType: 'requires',
      strength: 'mandatory',
    });
    expect(result.success).toBe(true);
  });
});

describe('AntiPatternQuerySchema', () => {
  it('should accept severity filter', () => {
    const result = AntiPatternQuerySchema.safeParse({ severity: 'critical' });
    expect(result.success).toBe(true);
  });
});

describe('FailureQuerySchema', () => {
  it('should accept component and impact filters', () => {
    const result = FailureQuerySchema.safeParse({
      component: 'firewall',
      impact: 'service_down',
      likelihood: 'high',
    });
    expect(result.success).toBe(true);
  });
});

describe('Sub-schemas', () => {
  describe('LatencyRangeSchema', () => {
    it('should validate valid latency range', () => {
      expect(LatencyRangeSchema.safeParse({ min: 0, max: 10, unit: 'ms' }).success).toBe(true);
      expect(LatencyRangeSchema.safeParse({ min: 100, max: 500, unit: 'us' }).success).toBe(true);
    });

    it('should reject invalid unit', () => {
      expect(LatencyRangeSchema.safeParse({ min: 0, max: 10, unit: 's' }).success).toBe(false);
    });
  });

  describe('ThroughputRangeSchema', () => {
    it('should validate valid throughput range', () => {
      expect(ThroughputRangeSchema.safeParse({ typical: '1Gbps', max: '10Gbps' }).success).toBe(true);
    });
  });

  describe('RequiredComponentSchema', () => {
    it('should validate valid required component', () => {
      expect(RequiredComponentSchema.safeParse({ type: 'firewall', minCount: 1 }).success).toBe(true);
    });

    it('should reject minCount < 1', () => {
      expect(RequiredComponentSchema.safeParse({ type: 'firewall', minCount: 0 }).success).toBe(false);
    });
  });

  describe('OptionalComponentSchema', () => {
    it('should validate valid optional component', () => {
      const result = OptionalComponentSchema.safeParse({
        type: 'cdn',
        benefit: 'Faster delivery',
        benefitKo: '빠른 전송',
      });
      expect(result.success).toBe(true);
    });
  });
});
