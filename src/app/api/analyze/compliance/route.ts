import { createAnalyzeRoute } from '@/lib/api/analyzeRouteFactory';
import { analyzeComplianceGap, type IndustryType } from '@/lib/audit/industryCompliance';

export const POST = createAnalyzeRoute({
  name: 'Compliance',
  handler: (spec, params) => {
    const industry = (params.industry as IndustryType) || 'general';
    const report = analyzeComplianceGap(spec, industry);
    return { report };
  },
});
