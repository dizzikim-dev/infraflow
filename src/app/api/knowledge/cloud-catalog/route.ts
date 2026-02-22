/**
 * Cloud Catalog API - List all cloud services with stats
 *
 * GET /api/knowledge/cloud-catalog
 * Returns all cloud services with aggregate statistics.
 *
 * Note: Cloud catalog data is static TypeScript (not Prisma).
 * This route is read-only — no CSRF check needed for GET.
 */

import { NextResponse } from 'next/server';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';
import {
  CLOUD_SERVICES,
  getServiceCategories,
  getProviderCoverageStats,
} from '@/lib/knowledge/cloudCatalog';

const log = createLogger('KnowledgeAPI:CloudCatalog');

/**
 * GET /api/knowledge/cloud-catalog
 * Returns cloud services with provider stats, category breakdown, and enrichment metrics.
 */
export async function GET() {
  try {
    await requireAdmin();

    const categories = getServiceCategories();
    const providerStats = getProviderCoverageStats();

    const total = CLOUD_SERVICES.length;
    const activeCount = CLOUD_SERVICES.filter((s) => s.status === 'active').length;
    const deprecatedCount = CLOUD_SERVICES.filter(
      (s) => s.status === 'deprecated' || s.status === 'end-of-life',
    ).length;
    const enrichedCount = CLOUD_SERVICES.filter(
      (s) =>
        s.architectureRole &&
        s.recommendedFor &&
        s.recommendedFor.length >= 3 &&
        s.sla,
    ).length;

    const byCategory: Record<string, number> = {};
    for (const cat of categories) {
      byCategory[cat.category] = cat.count;
    }

    return NextResponse.json({
      success: true,
      data: {
        services: CLOUD_SERVICES,
        stats: {
          total,
          byProvider: {
            aws: providerStats.aws.totalServices,
            azure: providerStats.azure.totalServices,
            gcp: providerStats.gcp.totalServices,
          },
          byCategory,
          activeCount,
          deprecatedCount,
          enrichedCount,
          providerDetails: providerStats,
        },
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode },
      );
    }
    log.error('클라우드 카탈로그 목록 조회 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { success: false, error: '클라우드 카탈로그 목록 조회에 실패했습니다' },
      { status: 500 },
    );
  }
}
