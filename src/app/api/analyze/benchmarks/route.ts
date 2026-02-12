import { NextRequest, NextResponse } from 'next/server';
import { recommendSizing, estimateCapacity, findBottlenecks, type TrafficTier } from '@/lib/knowledge/benchmarks';
import { isInfraSpec } from '@/types/guards';
import { validateAnalyzeRequest } from '@/lib/api/analyzeRouteUtils';

export async function POST(request: NextRequest) {
  // CSRF + rate-limit check
  const check = validateAnalyzeRequest(request);
  if (!check.passed) return check.errorResponse!;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const { spec, tier = 'medium' } = body as Record<string, unknown>;

    if (!spec || !isInfraSpec(spec)) {
      return NextResponse.json({ error: 'Invalid spec' }, { status: 400 });
    }

    const recommendations = recommendSizing(spec, tier as TrafficTier);
    const capacity = estimateCapacity(spec);
    const bottlenecks = findBottlenecks(spec);

    return NextResponse.json({ recommendations, capacity, bottlenecks });
  } catch {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
