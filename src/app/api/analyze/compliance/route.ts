import { NextRequest, NextResponse } from 'next/server';
import { analyzeComplianceGap } from '@/lib/audit/industryCompliance';
import { isInfraSpec } from '@/types/guards';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { spec, industry = 'general' } = body;

    if (!spec || !isInfraSpec(spec)) {
      return NextResponse.json({ error: 'Invalid spec' }, { status: 400 });
    }

    const report = analyzeComplianceGap(spec, industry);
    return NextResponse.json({ report });
  } catch {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
