import { NextResponse } from 'next/server';
import { createAnalyzeRawRoute } from '@/lib/api/analyzeRouteFactory';
import { getDeprecationWarnings, getCloudServices, compareServices, type CloudProvider } from '@/lib/knowledge/cloudCatalog';
import { isInfraSpec } from '@/types/guards';
import type { InfraNodeType } from '@/types/infra';

export const POST = createAnalyzeRawRoute({
  name: 'Cloud',
  handler: (body) => {
    const { action, spec, componentType, provider } = body;

    if (action === 'deprecations') {
      if (!spec || !isInfraSpec(spec)) {
        return NextResponse.json({ error: 'Invalid spec' }, { status: 400 });
      }
      const deprecationWarnings = getDeprecationWarnings(spec);
      return { deprecationWarnings };
    }

    if (action === 'services' && componentType) {
      const services = getCloudServices(componentType as InfraNodeType, provider as CloudProvider | undefined);
      return { services };
    }

    if (action === 'compare' && componentType) {
      const comparison = compareServices(componentType as InfraNodeType);
      return { comparison };
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  },
});
