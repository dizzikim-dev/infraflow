import { NextRequest, NextResponse } from 'next/server';
import { analyzeComplianceGap, type IndustryType } from '@/lib/audit/industryCompliance';
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
    const { spec, industry = 'general' } = body as Record<string, unknown>;

    if (!spec || !isInfraSpec(spec)) {
      return NextResponse.json({ error: 'Invalid spec' }, { status: 400 });
    }

    const report = analyzeComplianceGap(spec, industry as IndustryType);
    return NextResponse.json({ report });
  } catch {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
