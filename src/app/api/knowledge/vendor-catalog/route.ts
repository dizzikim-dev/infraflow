/**
 * Vendor Catalog API - List all vendors with stats
 *
 * GET /api/knowledge/vendor-catalog
 * Returns all vendor catalogs with aggregate statistics.
 *
 * Note: Vendor catalog data is static TypeScript (not Prisma).
 * This route is read-only — no CSRF check needed for GET.
 */

import { NextResponse } from 'next/server';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';
import { getVendorList, getCatalogStats } from '@/lib/knowledge/vendorCatalog';

const log = createLogger('KnowledgeAPI:VendorCatalog');

/**
 * GET /api/knowledge/vendor-catalog
 * Returns list of all vendors with their stats and catalog-wide statistics.
 */
export async function GET() {
  try {
    await requireAdmin();

    const vendorCatalogs = await getVendorList();
    const stats = await getCatalogStats();

    const vendors = vendorCatalogs.map((vendor) => ({
      vendorId: vendor.vendorId,
      vendorName: vendor.vendorName,
      vendorNameKo: vendor.vendorNameKo,
      headquarters: vendor.headquarters,
      website: vendor.website,
      lastCrawled: vendor.lastCrawled,
      crawlSource: vendor.crawlSource,
      stats: vendor.stats,
      depthStructure: vendor.depthStructure,
      depthStructureKo: vendor.depthStructureKo,
      categoriesCount: vendor.products.length,
    }));

    return NextResponse.json({
      success: true,
      data: {
        vendors,
        stats,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    log.error('벤더 카탈로그 목록 조회 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { success: false, error: '벤더 카탈로그 목록 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}
