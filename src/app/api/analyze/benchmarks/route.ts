import { NextRequest, NextResponse } from 'next/server';
import { recommendSizing, estimateCapacity, findBottlenecks } from '@/lib/knowledge/benchmarks';
import { isInfraSpec } from '@/types/guards';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { spec, tier = 'medium' } = body;

    if (!spec || !isInfraSpec(spec)) {
      return NextResponse.json({ error: 'Invalid spec' }, { status: 400 });
    }

    const recommendations = recommendSizing(spec, tier);
    const capacity = estimateCapacity(spec);
    const bottlenecks = findBottlenecks(spec);

    return NextResponse.json({ recommendations, capacity, bottlenecks });
  } catch {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
