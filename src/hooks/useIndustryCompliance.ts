/**
 * useIndustryCompliance Hook
 *
 * Provides industry compliance analysis with gap detection via server-side API.
 * Data processing runs server-side to reduce client bundle size.
 */

import { useState, useCallback, useRef } from 'react';
import type { InfraSpec } from '@/types/infra';
import type { IndustryType, IndustryComplianceReport } from '@/lib/audit/industryCompliance';
import { useFetchAnalysis } from './useFetchAnalysis';

export interface UseIndustryComplianceResult {
  report: IndustryComplianceReport | null;
  selectedIndustry: IndustryType;
  setIndustry: (industry: IndustryType) => void;
  analyze: () => void;
  isAnalyzing: boolean;
}

export function useIndustryCompliance(spec: InfraSpec | null): UseIndustryComplianceResult {
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType>('general');
  const [manualReport, setManualReport] = useState<IndustryComplianceReport | null | undefined>(
    undefined,
  );
  const [isManuallyAnalyzing, setIsManuallyAnalyzing] = useState(false);
  const analyzeRequestIdRef = useRef(0);

  const { result: autoReport, isLoading: isAutoLoading } =
    useFetchAnalysis<IndustryComplianceReport | null>(
      spec,
      {
        endpoint: '/api/analyze/compliance',
        buildBody: () => ({ spec, industry: selectedIndustry }),
        extractResult: (data) => (data.report as IndustryComplianceReport) ?? null,
        defaultResult: null,
      },
      [selectedIndustry],
    );

  const setIndustry = useCallback((industry: IndustryType) => {
    setSelectedIndustry(industry);
    setManualReport(undefined);
  }, []);

  const analyze = useCallback(() => {
    if (!spec) return;

    const currentId = ++analyzeRequestIdRef.current;
    setIsManuallyAnalyzing(true);

    fetch('/api/analyze/compliance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spec, industry: selectedIndustry }),
    })
      .then(res => res.json())
      .then(data => {
        if (currentId !== analyzeRequestIdRef.current) return;
        setManualReport(data.report ?? null);
        setIsManuallyAnalyzing(false);
      })
      .catch(() => {
        if (currentId !== analyzeRequestIdRef.current) return;
        setIsManuallyAnalyzing(false);
      });
  }, [spec, selectedIndustry]);

  return {
    report: manualReport !== undefined ? manualReport : autoReport,
    selectedIndustry,
    setIndustry,
    analyze,
    isAnalyzing: isAutoLoading || isManuallyAnalyzing,
  };
}
