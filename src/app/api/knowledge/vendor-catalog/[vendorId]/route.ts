/**
 * Vendor Catalog API - Single vendor detail
 *
 * GET /api/knowledge/vendor-catalog/[vendorId]
 * Returns the full catalog (including product tree) for a single vendor.
 *
 * Note: Vendor catalog data is static TypeScript (not Prisma).
 * This route is read-only — no CSRF check needed for GET.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';
import { getVendor } from '@/lib/knowledge/vendorCatalog';

const log = createLogger('KnowledgeAPI:VendorCatalogDetail');

/**
 * GET /api/knowledge/vendor-catalog/[vendorId]
 * Returns a single vendor's full catalog including product tree.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  try {
    await requireAdmin();

    const { vendorId } = await params;
    const vendor = getVendor(vendorId);

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: `벤더를 찾을 수 없습니다: ${vendorId}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    log.error('벤더 카탈로그 상세 조회 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { success: false, error: '벤더 카탈로그 상세 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}
