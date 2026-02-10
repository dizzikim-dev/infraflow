/**
 * Knowledge DB 통계 API 엔드포인트
 *
 * GET /api/knowledge/stats - 모든 지식 유형의 카운트 조회
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('KnowledgeAPI:Stats');

/**
 * GET /api/knowledge/stats
 * 모든 지식 유형의 활성 항목 수를 반환
 */
export async function GET() {
  try {
    await requireAdmin();

    const [
      relationships,
      patterns,
      antipatterns,
      failures,
      performance,
      vulnerabilities,
      cloudServices,
      benchmarks,
      industryPresets,
      sources,
    ] = await Promise.all([
      prisma.knowledgeRelationship.count({ where: { isActive: true } }),
      prisma.knowledgePattern.count({ where: { isActive: true } }),
      prisma.knowledgeAntiPattern.count({ where: { isActive: true } }),
      prisma.knowledgeFailure.count({ where: { isActive: true } }),
      prisma.knowledgePerformance.count({ where: { isActive: true } }),
      prisma.knowledgeVulnerability.count({ where: { isActive: true } }),
      prisma.knowledgeCloudService.count({ where: { isActive: true } }),
      prisma.knowledgeBenchmark.count({ where: { isActive: true } }),
      prisma.knowledgeIndustryPreset.count({ where: { isActive: true } }),
      prisma.knowledgeSourceEntry.count({ where: { isActive: true } }),
    ]);

    const total =
      relationships +
      patterns +
      antipatterns +
      failures +
      performance +
      vulnerabilities +
      cloudServices +
      benchmarks +
      industryPresets +
      sources;

    return NextResponse.json({
      relationships,
      patterns,
      antipatterns,
      failures,
      performance,
      vulnerabilities,
      cloudServices,
      benchmarks,
      industryPresets,
      sources,
      total,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('지식 통계 조회 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '지식 통계 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}
