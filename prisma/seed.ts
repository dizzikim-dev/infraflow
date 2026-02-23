/**
 * Prisma 시드 스크립트
 *
 * 기존 정적 데이터를 PostgreSQL로 마이그레이션합니다.
 * 실행: npx prisma db seed
 */

import {
  PrismaClient,
  ComponentCategory, TierType, PolicyPriority, PolicyCategory, UserRole,
  KnowledgeRelType, KnowledgeStrength, KnowledgeDirection,
  AntiPatternSeverity, FailureImpact, Likelihood, ScalingStrategy,
  VulnSeverity, CloudProvider, ServiceStatus, PricingTier,
  TrafficTier, IndustryType, SecurityLevel, SourceType,
} from '../src/generated/prisma';
import { infrastructureDB, InfraComponent } from '../src/lib/data/infrastructureDB';
import { RELATIONSHIPS } from '../src/lib/knowledge/relationships';
import { PATTERNS } from '../src/lib/knowledge/patterns';
import { ANTI_PATTERNS } from '../src/lib/knowledge/antipatterns';
import { FAILURES } from '../src/lib/knowledge/failures';
import { PERFORMANCE_PROFILES } from '../src/lib/knowledge/performance';
import { VULNERABILITIES } from '../src/lib/knowledge/vulnerabilities';
import { CLOUD_SERVICES } from '../src/lib/knowledge/cloudCatalog';
import { SIZING_MATRIX } from '../src/lib/knowledge/benchmarks';
import { getAllIndustryPresets } from '../src/lib/audit/industryCompliance';
import { ALL_SOURCES } from '../src/lib/knowledge/sourceRegistry';
import type { InputJsonValue } from '../src/generated/prisma/runtime/library';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================
// Enum conversion helpers
// ============================================

function toComponentCategory(category: string): ComponentCategory {
  const map: Record<string, ComponentCategory> = {
    'security': ComponentCategory.security,
    'network': ComponentCategory.network,
    'compute': ComponentCategory.compute,
    'cloud': ComponentCategory.cloud,
    'storage': ComponentCategory.storage,
    'auth': ComponentCategory.auth,
    'external': ComponentCategory.external,
  };
  return map[category] || ComponentCategory.network;
}

function toTierType(tier: string): TierType {
  const map: Record<string, TierType> = {
    'external': TierType.external,
    'dmz': TierType.dmz,
    'internal': TierType.internal,
    'data': TierType.data,
  };
  return map[tier] || TierType.internal;
}

function toPolicyPriority(priority: string): PolicyPriority {
  const map: Record<string, PolicyPriority> = {
    'critical': PolicyPriority.critical,
    'high': PolicyPriority.high,
    'medium': PolicyPriority.medium,
    'low': PolicyPriority.low,
  };
  return map[priority] || PolicyPriority.medium;
}

function toPolicyCategory(category: string): PolicyCategory {
  const map: Record<string, PolicyCategory> = {
    'access': PolicyCategory.access,
    'security': PolicyCategory.security,
    'monitoring': PolicyCategory.monitoring,
    'compliance': PolicyCategory.compliance,
    'performance': PolicyCategory.performance,
  };
  return map[category] || PolicyCategory.security;
}

function toRelType(t: string): KnowledgeRelType {
  const map: Record<string, KnowledgeRelType> = {
    'requires': KnowledgeRelType.requires,
    'recommends': KnowledgeRelType.recommends,
    'conflicts': KnowledgeRelType.conflicts,
    'enhances': KnowledgeRelType.enhances,
    'protects': KnowledgeRelType.protects,
  };
  return map[t] || KnowledgeRelType.recommends;
}

function toStrength(s: string): KnowledgeStrength {
  const map: Record<string, KnowledgeStrength> = {
    'mandatory': KnowledgeStrength.mandatory,
    'strong': KnowledgeStrength.strong,
    'weak': KnowledgeStrength.weak,
  };
  return map[s] || KnowledgeStrength.weak;
}

function toDirection(d: string): KnowledgeDirection {
  const map: Record<string, KnowledgeDirection> = {
    'upstream': KnowledgeDirection.upstream,
    'downstream': KnowledgeDirection.downstream,
    'bidirectional': KnowledgeDirection.bidirectional,
  };
  return map[d] || KnowledgeDirection.bidirectional;
}

function toAntiPatternSeverity(s: string): AntiPatternSeverity {
  const map: Record<string, AntiPatternSeverity> = {
    'critical': AntiPatternSeverity.critical,
    'high': AntiPatternSeverity.high,
    'medium': AntiPatternSeverity.medium,
  };
  return map[s] || AntiPatternSeverity.medium;
}

function toFailureImpact(i: string): FailureImpact {
  // TS types use hyphens, Prisma uses underscores
  const map: Record<string, FailureImpact> = {
    'service-down': FailureImpact.service_down,
    'service_down': FailureImpact.service_down,
    'degraded': FailureImpact.degraded,
    'data-loss': FailureImpact.data_loss,
    'data_loss': FailureImpact.data_loss,
    'security-breach': FailureImpact.security_breach,
    'security_breach': FailureImpact.security_breach,
  };
  return map[i] || FailureImpact.degraded;
}

function toLikelihood(l: string): Likelihood {
  const map: Record<string, Likelihood> = {
    'high': Likelihood.high,
    'medium': Likelihood.medium,
    'low': Likelihood.low,
  };
  return map[l] || Likelihood.medium;
}

function toScalingStrategy(s: string): ScalingStrategy {
  const map: Record<string, ScalingStrategy> = {
    'horizontal': ScalingStrategy.horizontal,
    'vertical': ScalingStrategy.vertical,
    'both': ScalingStrategy.both,
  };
  return map[s] || ScalingStrategy.vertical;
}

function toVulnSeverity(s: string): VulnSeverity {
  const map: Record<string, VulnSeverity> = {
    'critical': VulnSeverity.critical,
    'high': VulnSeverity.high,
    'medium': VulnSeverity.medium,
    'low': VulnSeverity.low,
  };
  return map[s] || VulnSeverity.medium;
}

function toCloudProvider(p: string): CloudProvider {
  const map: Record<string, CloudProvider> = {
    'aws': CloudProvider.aws,
    'azure': CloudProvider.azure,
    'gcp': CloudProvider.gcp,
  };
  return map[p] || CloudProvider.aws;
}

function toServiceStatus(s: string): ServiceStatus {
  const map: Record<string, ServiceStatus> = {
    'active': ServiceStatus.active,
    'deprecated': ServiceStatus.deprecated,
    'preview': ServiceStatus.preview,
    'end-of-life': ServiceStatus.end_of_life,
    'end_of_life': ServiceStatus.end_of_life,
  };
  return map[s] || ServiceStatus.active;
}

function toPricingTier(t: string): PricingTier {
  const map: Record<string, PricingTier> = {
    'free': PricingTier.free,
    'low': PricingTier.low,
    'medium': PricingTier.medium,
    'high': PricingTier.high,
    'enterprise': PricingTier.enterprise,
  };
  return map[t] || PricingTier.medium;
}

function toIndustryType(t: string): IndustryType {
  const map: Record<string, IndustryType> = {
    'financial': IndustryType.financial,
    'healthcare': IndustryType.healthcare,
    'government': IndustryType.government,
    'ecommerce': IndustryType.ecommerce,
    'general': IndustryType.general,
  };
  return map[t] || IndustryType.general;
}

function toSecurityLevel(l: string): SecurityLevel {
  const map: Record<string, SecurityLevel> = {
    'basic': SecurityLevel.basic,
    'standard': SecurityLevel.standard,
    'enhanced': SecurityLevel.enhanced,
    'maximum': SecurityLevel.maximum,
  };
  return map[l] || SecurityLevel.standard;
}

function toSourceType(t: string): SourceType {
  const map: Record<string, SourceType> = {
    'rfc': SourceType.rfc,
    'nist': SourceType.nist,
    'cis': SourceType.cis,
    'owasp': SourceType.owasp,
    'vendor': SourceType.vendor,
    'academic': SourceType.academic,
    'industry': SourceType.industry,
    'user_verified': SourceType.user_verified,
    'user_unverified': SourceType.user_unverified,
  };
  return map[t] || SourceType.industry;
}

/** Convert trust metadata object to Prisma JSON */
function trustToJson(trust?: { confidence: number; sources: unknown[]; upvotes: number; downvotes: number; lastReviewedAt: string }): InputJsonValue {
  if (!trust) {
    return { confidence: 0.5, sources: [], upvotes: 0, downvotes: 0, lastReviewedAt: new Date().toISOString() } as unknown as InputJsonValue;
  }
  return {
    confidence: trust.confidence,
    sources: trust.sources,
    upvotes: trust.upvotes,
    downvotes: trust.downvotes,
    lastReviewedAt: trust.lastReviewedAt,
  } as unknown as InputJsonValue;
}

// ============================================
// Admin accounts
// ============================================

const ADMIN_ACCOUNTS = [
  { name: '김현기', email: 'admin@infraflow.dev', password: 'Admin1234!' },
  { name: '운영관리자', email: 'ops@infraflow.dev', password: 'Ops1234!' },
  { name: '테스트관리자', email: 'test-admin@infraflow.dev', password: 'Test1234!' },
];

async function seedAdminAccounts() {
  console.log('👤 관리자 계정 시드 시작...\n');
  for (const account of ADMIN_ACCOUNTS) {
    const envKey = `ADMIN_PASSWORD_${account.email.split('@')[0].toUpperCase().replace('-', '_')}`;
    const password = process.env[envKey] || account.password;
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: { name: account.name, role: UserRole.ADMIN, passwordHash },
      create: { name: account.name, email: account.email, passwordHash, role: UserRole.ADMIN },
    });
    console.log(`  ✅ ${user.name} (${user.email}) - role: ${user.role}`);
  }
  console.log('');
}

// ============================================
// Infra components
// ============================================

async function seedInfraComponents() {
  console.log('🗑️  기존 컴포넌트 데이터 삭제 중...');
  await prisma.policyRecommendation.deleteMany();
  await prisma.infraComponent.deleteMany();

  const componentIds = Object.keys(infrastructureDB);
  console.log(`📦 ${componentIds.length}개의 컴포넌트를 삽입합니다...\n`);

  let insertedCount = 0;
  let policyCount = 0;

  for (const componentId of componentIds) {
    const component = infrastructureDB[componentId] as InfraComponent;
    try {
      const createdComponent = await prisma.infraComponent.create({
        data: {
          componentId: component.id,
          name: component.name,
          nameKo: component.nameKo,
          category: toComponentCategory(component.category),
          tier: toTierType(component.tier),
          description: component.description,
          descriptionKo: component.descriptionKo,
          functions: component.functions,
          functionsKo: component.functionsKo,
          features: component.features,
          featuresKo: component.featuresKo,
          ports: component.ports || [],
          protocols: component.protocols || [],
          vendors: component.vendors || [],
          isActive: true,
        },
      });
      insertedCount++;

      if (component.recommendedPolicies && component.recommendedPolicies.length > 0) {
        for (const policy of component.recommendedPolicies) {
          await prisma.policyRecommendation.create({
            data: {
              name: policy.name,
              nameKo: policy.nameKo,
              description: policy.description,
              priority: toPolicyPriority(policy.priority),
              category: toPolicyCategory(policy.category),
              componentId: createdComponent.id,
            },
          });
          policyCount++;
        }
      }
      console.log(`  ✅ ${component.nameKo} (${component.id})`);
    } catch (error) {
      console.error(`  ❌ ${component.id} 삽입 실패:`, error);
    }
  }
  console.log(`\n  📊 컴포넌트: ${insertedCount}개, 정책: ${policyCount}개\n`);
}

// ============================================
// Knowledge data seeding
// ============================================

async function seedRelationships() {
  console.log('🔗 관계 데이터 시드 중...');
  await prisma.knowledgeRelationship.deleteMany();
  let count = 0;
  for (const rel of RELATIONSHIPS) {
    try {
      await prisma.knowledgeRelationship.create({
        data: {
          knowledgeId: rel.id,
          sourceComponent: rel.source,
          targetComponent: rel.target,
          relationshipType: toRelType(rel.relationshipType),
          strength: toStrength(rel.strength),
          direction: toDirection(rel.direction),
          reason: rel.reason || '',
          reasonKo: rel.reasonKo || '',
          tags: [...(rel.tags || [])],
          trustMetadata: trustToJson(rel.trust),
        },
      });
      count++;
    } catch (error) {
      console.error(`  ❌ ${rel.id} 실패:`, error instanceof Error ? error.message : error);
    }
  }
  console.log(`  ✅ 관계: ${count}개\n`);
}

async function seedPatterns() {
  console.log('📐 패턴 데이터 시드 중...');
  await prisma.knowledgePattern.deleteMany();
  let count = 0;
  for (const pat of PATTERNS) {
    try {
      await prisma.knowledgePattern.create({
        data: {
          patternId: pat.id,
          name: pat.name,
          nameKo: pat.nameKo,
          description: pat.description || '',
          descriptionKo: pat.descriptionKo || '',
          requiredComponents: (pat.requiredComponents || []) as unknown as InputJsonValue,
          optionalComponents: (pat.optionalComponents || []) as unknown as InputJsonValue,
          scalability: pat.scalability || 'medium',
          complexity: pat.complexity || 3,
          bestForKo: [...(pat.bestForKo || [])],
          notSuitableForKo: [...(pat.notSuitableForKo || [])],
          evolvesTo: [...(pat.evolvesTo || [])],
          evolvesFrom: [...(pat.evolvesFrom || [])],
          tags: [...(pat.tags || [])],
          trustMetadata: trustToJson(pat.trust),
        },
      });
      count++;
    } catch (error) {
      console.error(`  ❌ ${pat.id} 실패:`, error instanceof Error ? error.message : error);
    }
  }
  console.log(`  ✅ 패턴: ${count}개\n`);
}

async function seedAntiPatterns() {
  console.log('⚠️  안티패턴 데이터 시드 중...');
  await prisma.knowledgeAntiPattern.deleteMany();
  let count = 0;
  for (const ap of ANTI_PATTERNS) {
    try {
      // Use the antipattern's own ID as the detection rule ID
      const detectionRuleId = ap.id;
      await prisma.knowledgeAntiPattern.create({
        data: {
          antiPatternId: ap.id,
          name: ap.name,
          nameKo: ap.nameKo,
          severity: toAntiPatternSeverity(ap.severity),
          detectionRuleId,
          detectionDescriptionKo: ap.detectionDescriptionKo || '',
          problemKo: ap.problemKo || '',
          impactKo: ap.impactKo || '',
          solutionKo: ap.solutionKo || '',
          tags: [...(ap.tags || [])],
          trustMetadata: trustToJson(ap.trust),
        },
      });
      count++;
    } catch (error) {
      console.error(`  ❌ ${ap.id} 실패:`, error instanceof Error ? error.message : error);
    }
  }
  console.log(`  ✅ 안티패턴: ${count}개\n`);
}

async function seedFailures() {
  console.log('💥 장애 시나리오 데이터 시드 중...');
  await prisma.knowledgeFailure.deleteMany();
  let count = 0;
  for (const fail of FAILURES) {
    try {
      await prisma.knowledgeFailure.create({
        data: {
          failureId: fail.id,
          component: fail.component,
          titleKo: fail.titleKo,
          scenarioKo: fail.scenarioKo,
          impact: toFailureImpact(fail.impact),
          likelihood: toLikelihood(fail.likelihood),
          affectedComponents: [...(fail.affectedComponents || [])],
          preventionKo: [...(fail.preventionKo || [])],
          mitigationKo: [...(fail.mitigationKo || [])],
          estimatedMTTR: fail.estimatedMTTR || '',
          tags: [...(fail.tags || [])],
          trustMetadata: trustToJson(fail.trust),
        },
      });
      count++;
    } catch (error) {
      console.error(`  ❌ ${fail.id} 실패:`, error instanceof Error ? error.message : error);
    }
  }
  console.log(`  ✅ 장애 시나리오: ${count}개\n`);
}

async function seedPerformance() {
  console.log('⚡ 성능 프로파일 데이터 시드 중...');
  await prisma.knowledgePerformance.deleteMany();
  let count = 0;
  for (const perf of PERFORMANCE_PROFILES) {
    try {
      await prisma.knowledgePerformance.create({
        data: {
          performanceId: perf.id,
          component: perf.component,
          nameKo: perf.nameKo || '',
          latencyRange: (perf.latencyRange || {}) as unknown as InputJsonValue,
          throughputRange: (perf.throughputRange || {}) as unknown as InputJsonValue,
          scalingStrategy: toScalingStrategy(perf.scalingStrategy),
          bottleneckIndicators: [...(perf.bottleneckIndicators || [])],
          bottleneckIndicatorsKo: [...(perf.bottleneckIndicatorsKo || [])],
          optimizationTipsKo: [...(perf.optimizationTipsKo || [])],
          tags: [...(perf.tags || [])],
          trustMetadata: trustToJson(perf.trust),
        },
      });
      count++;
    } catch (error) {
      console.error(`  ❌ ${perf.id} 실패:`, error instanceof Error ? error.message : error);
    }
  }
  console.log(`  ✅ 성능 프로파일: ${count}개\n`);
}

async function seedVulnerabilities() {
  console.log('🔒 취약점 데이터 시드 중...');
  await prisma.knowledgeVulnerability.deleteMany();
  let count = 0;
  for (const vuln of VULNERABILITIES) {
    try {
      await prisma.knowledgeVulnerability.create({
        data: {
          vulnId: vuln.id,
          cveId: vuln.cveId || null,
          affectedComponents: [...(vuln.affectedComponents || [])],
          severity: toVulnSeverity(vuln.severity),
          cvssScore: vuln.cvssScore ?? null,
          title: vuln.title,
          titleKo: vuln.titleKo,
          description: vuln.description,
          descriptionKo: vuln.descriptionKo,
          mitigation: vuln.mitigation,
          mitigationKo: vuln.mitigationKo,
          publishedDate: vuln.publishedDate || '',
          references: [...(vuln.references || [])],
          trustMetadata: trustToJson(vuln.trust),
        },
      });
      count++;
    } catch (error) {
      console.error(`  ❌ ${vuln.id} 실패:`, error instanceof Error ? error.message : error);
    }
  }
  console.log(`  ✅ 취약점: ${count}개\n`);
}

async function seedCloudServices() {
  console.log('☁️  클라우드 서비스 데이터 시드 중...');
  await prisma.knowledgeCloudService.deleteMany();
  let count = 0;
  for (const svc of CLOUD_SERVICES) {
    try {
      await prisma.knowledgeCloudService.create({
        data: {
          serviceId: svc.id,
          provider: toCloudProvider(svc.provider),
          componentType: svc.componentType,
          serviceName: svc.serviceName,
          serviceNameKo: svc.serviceNameKo || svc.serviceName,
          status: toServiceStatus(svc.status),
          successor: svc.successor || null,
          features: [...(svc.features || [])],
          featuresKo: [...(svc.featuresKo || [])],
          pricingTier: toPricingTier(svc.pricingTier),
          trustMetadata: trustToJson(svc.trust),
        },
      });
      count++;
    } catch (error) {
      console.error(`  ❌ ${svc.id} 실패:`, error instanceof Error ? error.message : error);
    }
  }
  console.log(`  ✅ 클라우드 서비스: ${count}개\n`);
}

async function seedBenchmarks() {
  console.log('📊 벤치마크 데이터 시드 중...');
  await prisma.knowledgeBenchmark.deleteMany();
  let count = 0;
  const tiers: TrafficTier[] = [TrafficTier.small, TrafficTier.medium, TrafficTier.large, TrafficTier.enterprise];
  const tierNames = ['small', 'medium', 'large', 'enterprise'] as const;

  for (const [componentType, sizingRow] of Object.entries(SIZING_MATRIX)) {
    if (!sizingRow) continue;
    for (let i = 0; i < tierNames.length; i++) {
      const tierName = tierNames[i];
      const entry = sizingRow[tierName];
      if (!entry) continue;
      try {
        await prisma.knowledgeBenchmark.create({
          data: {
            componentType,
            trafficTier: tiers[i],
            recommendedInstanceCount: entry.recommended.instanceCount,
            recommendedSpec: entry.recommended.spec,
            recommendedSpecKo: entry.recommended.specKo || entry.recommended.spec,
            minimumInstanceCount: entry.minimum.instanceCount,
            minimumSpec: entry.minimum.spec,
            minimumSpecKo: entry.minimum.specKo || entry.minimum.spec,
            scalingNotes: entry.scalingNotes,
            scalingNotesKo: entry.scalingNotesKo || entry.scalingNotes,
            estimatedMonthlyCost: entry.estimatedMonthlyCost ?? null,
            maxRPS: entry.maxRPS,
            trustMetadata: {
              confidence: 0.8,
              sources: [],
              upvotes: 0,
              downvotes: 0,
              lastReviewedAt: '2026-02-10',
            } as unknown as InputJsonValue,
          },
        });
        count++;
      } catch (error) {
        console.error(`  ❌ ${componentType}/${tierName} 실패:`, error instanceof Error ? error.message : error);
      }
    }
  }
  console.log(`  ✅ 벤치마크: ${count}개\n`);
}

async function seedIndustryPresets() {
  console.log('🏭 산업별 프리셋 데이터 시드 중...');
  await prisma.knowledgeIndustryPreset.deleteMany();
  const presets = getAllIndustryPresets();
  let count = 0;
  for (const preset of presets) {
    try {
      await prisma.knowledgeIndustryPreset.create({
        data: {
          industryType: toIndustryType(preset.id),
          name: preset.name,
          nameKo: preset.nameKo,
          description: preset.description,
          descriptionKo: preset.descriptionKo,
          requiredFrameworks: [...preset.requiredFrameworks],
          requiredComponents: [...preset.requiredComponents],
          recommendedComponents: [...preset.recommendedComponents],
          minimumSecurityLevel: toSecurityLevel(preset.minimumSecurityLevel),
        },
      });
      count++;
    } catch (error) {
      console.error(`  ❌ ${preset.id} 실패:`, error instanceof Error ? error.message : error);
    }
  }
  console.log(`  ✅ 산업별 프리셋: ${count}개\n`);
}

async function seedSources() {
  console.log('📚 출처 데이터 시드 중...');
  await prisma.knowledgeSourceEntry.deleteMany();
  let count = 0;
  for (let i = 0; i < ALL_SOURCES.length; i++) {
    const src = ALL_SOURCES[i];
    // Generate a stable sourceId from index and title
    const sourceId = `SRC-${String(i + 1).padStart(3, '0')}`;
    try {
      await prisma.knowledgeSourceEntry.create({
        data: {
          sourceId,
          sourceType: toSourceType(src.type),
          title: src.title,
          url: src.url || null,
          section: src.section || null,
          publishedDate: src.publishedDate || null,
          accessedDate: src.accessedDate,
        },
      });
      count++;
    } catch (error) {
      console.error(`  ❌ ${sourceId} 실패:`, error instanceof Error ? error.message : error);
    }
  }
  console.log(`  ✅ 출처: ${count}개\n`);
}

// ============================================
// Main
// ============================================

async function main() {
  console.log('🌱 시드 스크립트 시작...\n');
  console.log('=' .repeat(50));

  // Phase 0: Admin accounts
  await seedAdminAccounts();

  // Phase 1: Infra components
  await seedInfraComponents();

  // Phase 2: Knowledge DB
  console.log('📖 Knowledge DB 시드 시작...\n');
  await seedRelationships();
  await seedPatterns();
  await seedAntiPatterns();
  await seedFailures();
  await seedPerformance();
  await seedVulnerabilities();
  await seedCloudServices();
  await seedBenchmarks();
  await seedIndustryPresets();
  await seedSources();

  // Summary
  console.log('=' .repeat(50));
  console.log('🎉 시드 완료!\n');

  const counts = await Promise.all([
    prisma.infraComponent.count(),
    prisma.policyRecommendation.count(),
    prisma.knowledgeRelationship.count(),
    prisma.knowledgePattern.count(),
    prisma.knowledgeAntiPattern.count(),
    prisma.knowledgeFailure.count(),
    prisma.knowledgePerformance.count(),
    prisma.knowledgeVulnerability.count(),
    prisma.knowledgeCloudService.count(),
    prisma.knowledgeBenchmark.count(),
    prisma.knowledgeIndustryPreset.count(),
    prisma.knowledgeSourceEntry.count(),
  ]);

  const labels = [
    '컴포넌트', '정책', '관계', '패턴', '안티패턴', '장애 시나리오',
    '성능 프로파일', '취약점', '클라우드 서비스', '벤치마크', '산업별 프리셋', '출처',
  ];

  let total = 0;
  for (let i = 0; i < counts.length; i++) {
    console.log(`  ${labels[i]}: ${counts[i]}개`);
    total += counts[i];
  }
  console.log(`\n  합계: ${total}개`);
  console.log('=' .repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ 시드 스크립트 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
