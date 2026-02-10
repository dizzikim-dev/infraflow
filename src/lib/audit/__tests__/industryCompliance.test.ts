/**
 * Industry Compliance Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getIndustryPreset,
  getAllIndustryPresets,
  analyzeComplianceGap,
  type IndustryType,
  type IndustryComplianceReport,
} from '../industryCompliance';
import type { InfraSpec } from '@/types/infra';

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------

describe('Industry Presets', () => {
  it('should return preset for each industry type', () => {
    const types: IndustryType[] = ['financial', 'healthcare', 'government', 'ecommerce', 'general'];
    for (const type of types) {
      const preset = getIndustryPreset(type);
      expect(preset).toBeDefined();
      expect(preset.id).toBe(type);
      expect(preset.name).toBeTruthy();
      expect(preset.nameKo).toBeTruthy();
      expect(preset.description).toBeTruthy();
      expect(preset.descriptionKo).toBeTruthy();
      expect(preset.requiredFrameworks.length).toBeGreaterThan(0);
      expect(preset.requiredComponents.length).toBeGreaterThan(0);
    }
  });

  it('should return all 5 presets', () => {
    const presets = getAllIndustryPresets();
    expect(presets.length).toBe(5);
  });

  it('financial should require stricter frameworks', () => {
    const preset = getIndustryPreset('financial');
    expect(preset.requiredFrameworks).toContain('isms-p');
    expect(preset.requiredFrameworks).toContain('pci-dss');
    expect(preset.requiredComponents).toContain('siem');
    expect(preset.requiredComponents).toContain('dlp');
    expect(preset.minimumSecurityLevel).toBe('maximum');
  });

  it('healthcare should require HIPAA', () => {
    const preset = getIndustryPreset('healthcare');
    expect(preset.requiredFrameworks).toContain('hipaa');
    expect(preset.requiredComponents).toContain('dlp');
    expect(preset.requiredComponents).toContain('backup');
  });

  it('government should require K-ISMS', () => {
    const preset = getIndustryPreset('government');
    expect(preset.requiredFrameworks).toContain('k-isms');
    expect(preset.requiredComponents).toContain('nac');
    expect(preset.requiredComponents).toContain('siem');
  });

  it('ecommerce should require PCI-DSS', () => {
    const preset = getIndustryPreset('ecommerce');
    expect(preset.requiredFrameworks).toContain('pci-dss');
    expect(preset.requiredComponents).toContain('cdn');
    expect(preset.requiredComponents).toContain('load-balancer');
  });

  it('general should have basic requirements', () => {
    const preset = getIndustryPreset('general');
    expect(preset.requiredFrameworks.length).toBeLessThanOrEqual(2);
    expect(preset.minimumSecurityLevel).toBe('basic');
  });
});

// ---------------------------------------------------------------------------
// analyzeComplianceGap
// ---------------------------------------------------------------------------

describe('analyzeComplianceGap', () => {
  const fullSpec: InfraSpec = {
    nodes: [
      { id: 'fw-1', type: 'firewall', label: 'FW' },
      { id: 'waf-1', type: 'waf', label: 'WAF' },
      { id: 'ids-1', type: 'ids-ips', label: 'IDS' },
      { id: 'dlp-1', type: 'dlp', label: 'DLP' },
      { id: 'mfa-1', type: 'mfa', label: 'MFA' },
      { id: 'siem-1', type: 'siem', label: 'SIEM' },
      { id: 'bk-1', type: 'backup', label: 'Backup' },
      { id: 'nac-1', type: 'nac', label: 'NAC' },
      { id: 'vpn-1', type: 'vpn-gateway', label: 'VPN' },
      { id: 'cdn-1', type: 'cdn', label: 'CDN' },
      { id: 'lb-1', type: 'load-balancer', label: 'LB' },
    ],
    connections: [],
  };

  const minimalSpec: InfraSpec = {
    nodes: [
      { id: 'web-1', type: 'web-server', label: 'Web' },
    ],
    connections: [],
  };

  it('should return a report for financial industry', () => {
    const report = analyzeComplianceGap(fullSpec, 'financial');
    expect(report.industry).toBe('financial');
    expect(report.preset.id).toBe('financial');
    expect(report.complianceReports.length).toBeGreaterThan(0);
    expect(typeof report.overallScore).toBe('number');
    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.overallScore).toBeLessThanOrEqual(100);
  });

  it('should detect missing components for minimal spec', () => {
    const report = analyzeComplianceGap(minimalSpec, 'financial');
    expect(report.missingRequired.length).toBeGreaterThan(0);
    expect(report.missingRequired).toContain('firewall');
    expect(report.missingRequired).toContain('siem');
    expect(report.gaps.length).toBeGreaterThan(0);
  });

  it('should have higher score for full spec vs minimal spec', () => {
    const fullReport = analyzeComplianceGap(fullSpec, 'general');
    const minReport = analyzeComplianceGap(minimalSpec, 'general');
    expect(fullReport.overallScore).toBeGreaterThan(minReport.overallScore);
  });

  it('should sort gaps by priority (critical first)', () => {
    const report = analyzeComplianceGap(minimalSpec, 'financial');
    const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    for (let i = 1; i < report.gaps.length; i++) {
      expect(priorityOrder[report.gaps[i].priority]).toBeGreaterThanOrEqual(
        priorityOrder[report.gaps[i - 1].priority],
      );
    }
  });

  it('should have bilingual gap descriptions', () => {
    const report = analyzeComplianceGap(minimalSpec, 'healthcare');
    for (const gap of report.gaps) {
      expect(gap.remediation).toBeTruthy();
      expect(gap.remediationKo).toBeTruthy();
      expect(gap.frameworkKo).toBeTruthy();
      expect(gap.estimatedEffort).toBeTruthy();
      expect(gap.estimatedEffortKo).toBeTruthy();
    }
  });

  it('should identify missing recommended components separately', () => {
    const report = analyzeComplianceGap(fullSpec, 'financial');
    // fullSpec has most required but may miss some recommended
    const preset = getIndustryPreset('financial');
    const presentTypes = new Set(fullSpec.nodes.map((n) => n.type));
    const expectedMissing = preset.recommendedComponents.filter((c) => !presentTypes.has(c));
    expect(report.missingRecommended).toEqual(expectedMissing);
  });

  it('should include compliance reports for each required framework', () => {
    const report = analyzeComplianceGap(fullSpec, 'ecommerce');
    const preset = getIndustryPreset('ecommerce');
    expect(report.complianceReports.length).toBe(preset.requiredFrameworks.length);
    for (const cr of report.complianceReports) {
      expect(preset.requiredFrameworks).toContain(cr.framework);
      expect(typeof cr.report.score).toBe('number');
    }
  });

  it('should handle all industry types', () => {
    const types: IndustryType[] = ['financial', 'healthcare', 'government', 'ecommerce', 'general'];
    for (const type of types) {
      const report = analyzeComplianceGap(minimalSpec, type);
      expect(report.industry).toBe(type);
      expect(report.overallScore).toBeGreaterThanOrEqual(0);
    }
  });

  it('should give higher score when more required components are present', () => {
    const withFirewall: InfraSpec = {
      nodes: [
        { id: 'fw-1', type: 'firewall', label: 'FW' },
        { id: 'mfa-1', type: 'mfa', label: 'MFA' },
        { id: 'bk-1', type: 'backup', label: 'Backup' },
      ],
      connections: [],
    };
    const withoutFirewall: InfraSpec = {
      nodes: [
        { id: 'web-1', type: 'web-server', label: 'Web' },
      ],
      connections: [],
    };
    const r1 = analyzeComplianceGap(withFirewall, 'general');
    const r2 = analyzeComplianceGap(withoutFirewall, 'general');
    expect(r1.overallScore).toBeGreaterThan(r2.overallScore);
  });

  it('should return empty missing arrays for fully compliant spec', () => {
    // Build a spec with ALL required components for general industry
    const preset = getIndustryPreset('general');
    const nodes = preset.requiredComponents.map((type, i) => ({
      id: `${type}-${i}`,
      type,
      label: type,
    }));
    const compliantSpec: InfraSpec = { nodes, connections: [] };
    const report = analyzeComplianceGap(compliantSpec, 'general');
    expect(report.missingRequired).toEqual([]);
  });
});
