import { NextRequest, NextResponse } from 'next/server';
import { getDeprecationWarnings, getCloudServices, compareServices, type CloudProvider } from '@/lib/knowledge/cloudCatalog';
import { isInfraSpec } from '@/types/guards';
import type { InfraNodeType } from '@/types/infra';
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
    const { spec, action, componentType, provider } = body as Record<string, unknown>;

    if (action === 'deprecations') {
      if (!spec || !isInfraSpec(spec)) {
        return NextResponse.json({ error: 'Invalid spec' }, { status: 400 });
      }
      const deprecationWarnings = getDeprecationWarnings(spec);
      return NextResponse.json({ deprecationWarnings });
    }

    if (action === 'services' && componentType) {
      const services = getCloudServices(componentType as InfraNodeType, provider as CloudProvider | undefined);
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
