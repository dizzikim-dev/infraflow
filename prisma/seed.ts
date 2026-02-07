/**
 * Prisma 시드 스크립트
 *
 * 기존 infrastructureDB.ts의 정적 데이터를 PostgreSQL로 마이그레이션합니다.
 * 실행: npx prisma db seed
 */

import { PrismaClient, ComponentCategory, TierType, PolicyPriority, PolicyCategory } from '../src/generated/prisma';
import { infrastructureDB, InfraComponent, PolicyRecommendation } from '../src/lib/data/infrastructureDB';

const prisma = new PrismaClient();

// 문자열을 Prisma enum으로 변환하는 헬퍼 함수들
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

async function main() {
  console.log('🌱 시드 스크립트 시작...\n');

  // 기존 데이터 삭제 (clean slate)
  console.log('🗑️  기존 데이터 삭제 중...');
  await prisma.policyRecommendation.deleteMany();
  await prisma.infraComponent.deleteMany();
  console.log('✅ 기존 데이터 삭제 완료\n');

  // 컴포넌트 데이터 삽입
  const componentIds = Object.keys(infrastructureDB);
  console.log(`📦 ${componentIds.length}개의 컴포넌트를 삽입합니다...\n`);

  let insertedCount = 0;
  let policyCount = 0;

  for (const componentId of componentIds) {
    const component = infrastructureDB[componentId] as InfraComponent;

    try {
      // 컴포넌트 생성
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

      // 정책 추천 데이터 삽입
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

      console.log(`  ✅ ${component.nameKo} (${component.id}) - 정책 ${component.recommendedPolicies?.length || 0}개`);
    } catch (error) {
      console.error(`  ❌ ${component.id} 삽입 실패:`, error);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`🎉 시드 완료!`);
  console.log(`   - 컴포넌트: ${insertedCount}개`);
  console.log(`   - 권장 정책: ${policyCount}개`);
  console.log('='.repeat(50) + '\n');

  // 삽입된 데이터 요약
  const categoryCounts = await prisma.infraComponent.groupBy({
    by: ['category'],
    _count: true,
  });

  console.log('📊 카테고리별 컴포넌트 수:');
  for (const item of categoryCounts) {
    console.log(`   - ${item.category}: ${item._count}개`);
  }

  const tierCounts = await prisma.infraComponent.groupBy({
    by: ['tier'],
    _count: true,
  });

  console.log('\n📊 티어별 컴포넌트 수:');
  for (const item of tierCounts) {
    console.log(`   - ${item.tier}: ${item._count}개`);
  }
}

main()
  .catch((e) => {
    console.error('❌ 시드 스크립트 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
