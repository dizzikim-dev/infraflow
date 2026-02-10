/**
 * useIndustryCompliance Hook
 *
 * Provides industry compliance analysis with gap detection.
 */

import { useState, useMemo, useCallback } from 'react';
import type { InfraSpec } from '@/types/infra';
import {
  analyzeComplianceGap,
  type IndustryType,
  type IndustryComplianceReport,
} from '@/lib/audit/industryCompliance';

export interface UseIndustryComplianceResult {
  report: IndustryComplianceReport | null;
  selectedIndustry: IndustryType;
  setIndustry: (industry: IndustryType) => void;
  analyze: () => void;
  isAnalyzing: boolean;
}

export function useIndustryCompliance(spec: InfraSpec | null): UseIndustryComplianceResult {
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType>('general');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const report = useMemo(() => {
    if (!spec || spec.nodes.length === 0) return null;
    return analyzeComplianceGap(spec, selectedIndustry);
  }, [spec, selectedIndustry]);

  const analyze = useCallback(() => {
    // Trigger re-analysis (report is already reactive via useMemo)
    setIsAnalyzing(true);
    // Simulate brief analysis delay for UX
    setTimeout(() => setIsAnalyzing(false), 100);
  }, []);

  const setIndustry = useCallback((industry: IndustryType) => {
    setSelectedIndustry(industry);
  }, []);

  return {
    report,
    selectedIndustry,
    setIndustry,
    analyze,
    isAnalyzing,
  };
}
