/**
 * Vendor Recommendation API Route
 *
 * POST /api/recommendation — Match vendor products to an infrastructure specification.
 * Returns scored product recommendations for each node in the diagram.
 *
 * GET /api/recommendation — Status endpoint describing the recommendation engine.
 */

import { NextRequest, NextResponse } from 'next/server';
import { matchVendorProducts } from '@/lib/recommendation';
import { validateAnalyzeRequest, checkRequestSize, ANALYZE_RATE_LIMIT } from '@/lib/api/analyzeRouteUtils';
import { createLogger } from '@/lib/utils/logger';
import { z } from 'zod';

const log = createLogger('Recommendation API');

// ---------------------------------------------------------------------------
// Zod Schema
// ---------------------------------------------------------------------------

const RecommendationRequestSchema = z.object({
  spec: z.object({
    nodes: z.array(z.object({
      id: z.string(),
      type: z.string(),
      label: z.string(),
      tier: z.string().optional(),
      zone: z.string().optional(),
    })),
    connections: z.array(z.object({
      source: z.string(),
      target: z.string(),
      flowType: z.string().optional(),
      label: z.string().optional(),
    })).optional().default([]),
    zones: z.array(z.any()).optional(),
  }),
  vendorId: z.string().optional(),
  minScore: z.number().min(0).max(100).optional(),
  maxPerNode: z.number().min(1).max(20).optional(),
});

// ---------------------------------------------------------------------------
// POST Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // Check request size (50KB default)
  const sizeError = checkRequestSize(request);
  if (sizeError) return sizeError;

  // CSRF + rate-limit check (use ANALYZE_RATE_LIMIT — moderate, same as other analysis endpoints)
  const check = await validateAnalyzeRequest(request, ANALYZE_RATE_LIMIT);
  if (!check.passed) return check.errorResponse!;

  // Parse JSON body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  // Validate with Zod
  const parsed = RecommendationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid request body',
        details: parsed.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      },
      { status: 400 },
    );
  }

  const { spec, vendorId, minScore, maxPerNode } = parsed.data;

  try {
    // Cast spec to InfraSpec — Zod has validated the shape
    const result = matchVendorProducts(
      spec as Parameters<typeof matchVendorProducts>[0],
      { vendorId, minScore, maxPerNode },
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    log.error(
      'Recommendation matching failed',
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json(
      { success: false, error: 'Recommendation matching failed' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// GET Handler — Status endpoint
// ---------------------------------------------------------------------------

export async function GET() {
  return NextResponse.json({
    available: true,
    description: 'Vendor product recommendation engine',
    usage: 'POST with { spec: InfraSpec } to get product recommendations',
  });
}
