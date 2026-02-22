/**
 * Vendor Catalog API - All products (flat)
 *
 * GET /api/knowledge/vendor-catalog/all-products
 * Returns every product node across all vendors as a flat array
 * with breadcrumb path and vendor metadata attached.
 */

import { NextResponse } from 'next/server';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';
import { allVendorCatalogs } from '@/lib/knowledge/vendorCatalog';
import { getAllNodes, getNodePath } from '@/lib/knowledge/vendorCatalog/queryHelpers';

const log = createLogger('KnowledgeAPI:VendorCatalogAllProducts');

export interface FlatProduct {
  vendorId: string;
  vendorName: string;
  vendorNameKo: string;
  nodeId: string;
  depth: number;
  depthLabel: string;
  depthLabelKo: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  sourceUrl: string;
  datasheetUrl?: string;
  lifecycle?: string;
  architectureRole?: string;
  architectureRoleKo?: string;
  recommendedFor?: string[];
  recommendedForKo?: string[];
  supportedProtocols?: string[];
  haFeatures?: string[];
  securityCapabilities?: string[];
  infraNodeTypes?: string[];
  specs?: Record<string, string>;
  pricingInfo?: string;
  path: string[];
  pathKo: string[];
  childCount: number;
  operationalComplexity?: string;
  ecosystemMaturity?: string;
  disasterRecovery?: {
    maxRTOMinutes?: number;
    maxRPOMinutes?: number;
    backupFrequency?: string;
    multiRegionSupported: boolean;
  };
}

export async function GET() {
  try {
    await requireAdmin();

    const flatProducts: FlatProduct[] = [];

    for (const vendor of allVendorCatalogs) {
      const allNodes = getAllNodes(vendor.products);

      for (const node of allNodes) {
        const pathNodes = getNodePath(vendor.products, node.nodeId);

        flatProducts.push({
          vendorId: vendor.vendorId,
          vendorName: vendor.vendorName,
          vendorNameKo: vendor.vendorNameKo,
          nodeId: node.nodeId,
          depth: node.depth,
          depthLabel: node.depthLabel,
          depthLabelKo: node.depthLabelKo,
          name: node.name,
          nameKo: node.nameKo,
          description: node.description,
          descriptionKo: node.descriptionKo,
          sourceUrl: node.sourceUrl,
          datasheetUrl: node.datasheetUrl,
          lifecycle: node.lifecycle,
          architectureRole: node.architectureRole,
          architectureRoleKo: node.architectureRoleKo,
          recommendedFor: node.recommendedFor,
          recommendedForKo: node.recommendedForKo,
          supportedProtocols: node.supportedProtocols,
          haFeatures: node.haFeatures,
          securityCapabilities: node.securityCapabilities,
          infraNodeTypes: node.infraNodeTypes,
          specs: node.specs,
          pricingInfo: node.pricingInfo,
          path: pathNodes.map((n) => n.name),
          pathKo: pathNodes.map((n) => n.nameKo),
          childCount: node.children.length,
          operationalComplexity: node.operationalComplexity,
          ecosystemMaturity: node.ecosystemMaturity,
          disasterRecovery: node.disasterRecovery,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: flatProducts,
      total: flatProducts.length,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode },
      );
    }
    log.error('전체 제품 조회 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { success: false, error: '전체 제품 조회에 실패했습니다' },
      { status: 500 },
    );
  }
}
