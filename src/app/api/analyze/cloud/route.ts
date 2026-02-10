import { NextRequest, NextResponse } from 'next/server';
import { getDeprecationWarnings, getCloudServices, compareServices } from '@/lib/knowledge/cloudCatalog';
import { isInfraSpec } from '@/types/guards';
import type { InfraNodeType } from '@/types/infra';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { spec, action, componentType, provider } = body;

    if (action === 'deprecations') {
      if (!spec || !isInfraSpec(spec)) {
        return NextResponse.json({ error: 'Invalid spec' }, { status: 400 });
      }
      const deprecationWarnings = getDeprecationWarnings(spec);
      return NextResponse.json({ deprecationWarnings });
    }

    if (action === 'services' && componentType) {
      const services = getCloudServices(componentType as InfraNodeType, provider);
      return NextResponse.json({ services });
    }

    if (action === 'compare' && componentType) {
      const comparison = compareServices(componentType as InfraNodeType);
      return NextResponse.json({ comparison });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
