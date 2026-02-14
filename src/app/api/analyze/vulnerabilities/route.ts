import { createAnalyzeRoute } from '@/lib/api/analyzeRouteFactory';
import { getVulnerabilitiesForSpec, getVulnerabilityStats } from '@/lib/knowledge/vulnerabilities';

export const POST = createAnalyzeRoute({
  name: 'Vulnerability',
  handler: (spec) => {
    const vulnerabilities = getVulnerabilitiesForSpec(spec);
    const stats = getVulnerabilityStats(vulnerabilities);
    return { vulnerabilities, stats };
  },
});
