/**
 * useIndustryCompliance Hook
 *
 * Provides industry compliance analysis with gap detection via server-side API.
 * Data processing runs server-side to reduce client bundle size.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { InfraSpec } from '@/types/infra';
import type { IndustryType, IndustryComplianceReport } from '@/lib/audit/industryCompliance';

export interface UseIndustryComplianceResult {
  report: IndustryComplianceReport | null;
  selectedIndustry: IndustryType;
  setIndustry: (industry: IndustryType) => void;
  analyze: () => void;
  isAnalyzing: boolean;
}

export function useIndustryCompliance(spec: InfraSpec | null): UseIndustryComplianceResult {
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType>('general');
  const [report, setReport] = useState<IndustryComplianceReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!spec || spec.nodes.length === 0) {
      setReport(null);
      return;
    }

    const currentId = ++requestIdRef.current;
    setIsAnalyzing(true);

    fetch('/api/analyze/compliance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spec, industry: selectedIndustry }),
    })
      .then(res => res.json())
      .then(data => {
        if (currentId !== requestIdRef.current) return;
        setReport(data.report ?? null);
        setIsAnalyzing(false);
      })
      .catch(() => {
        if (currentId !== requestIdRef.current) return;
        setIsAnalyzing(false);
      });
  }, [spec, selectedIndustry]);

  const setIndustry = useCallback((industry: IndustryType) => {
    setSelectedIndustry(industry);
  }, []);

  const analyze = useCallback(() => {
    // Trigger re-fetch by incrementing requestId
    requestIdRef.current++;
    setIsAnalyzing(true);
    if (!spec) return;

    fetch('/api/analyze/compliance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spec, industry: selectedIndustry }),
    })
      .then(res => res.json())
      .then(data => {
        setReport(data.report ?? null);
        setIsAnalyzing(false);
      })
      .catch(() => setIsAnalyzing(false));
  }, [spec, selectedIndustry]);

  return { report, selectedIndustry, setIndustry, analyze, isAnalyzing };
}
