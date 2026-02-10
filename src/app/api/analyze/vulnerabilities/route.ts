import { NextRequest, NextResponse } from 'next/server';
import { getVulnerabilitiesForSpec, getVulnerabilityStats } from '@/lib/knowledge/vulnerabilities';
import { isInfraSpec } from '@/types/guards';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { spec } = body;

    if (!spec || !isInfraSpec(spec)) {
      return NextResponse.json({ error: 'Invalid spec' }, { status: 400 });
    }

    const vulnerabilities = getVulnerabilitiesForSpec(spec);
    const stats = getVulnerabilityStats(vulnerabilities);

    return NextResponse.json({ vulnerabilities, stats });
  } catch {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
