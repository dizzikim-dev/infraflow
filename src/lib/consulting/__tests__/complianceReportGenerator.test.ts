import { describe, it, expect } from 'vitest';
import type { InfraSpec } from '@/types/infra';
import type { ComplianceReportOptions } from '../complianceReportGenerator';
import {
  generateComplianceReport,
  getFrameworkDescription,
  calculateComplianceScore,
  getComplianceStatus,
} from '../complianceReportGenerator';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

/** Minimal empty spec — no nodes, no connections */
const emptySpec: InfraSpec = {
  nodes: [],
  connections: [],
};

/** Spec with a full security stack covering all frameworks */
const fullSecuritySpec: InfraSpec = {
  nodes: [
    { id: 'fw-1', type: 'firewall', label: 'Firewall' },
    { id: 'waf-1', type: 'waf', label: 'WAF' },
    { id: 'ids-1', type: 'ids-ips', label: 'IDS/IPS' },
    { id: 'siem-1', type: 'siem', label: 'SIEM' },
    { id: 'dlp-1', type: 'dlp', label: 'DLP' },
    { id: 'mfa-1', type: 'mfa', label: 'MFA' },
    { id: 'vpn-1', type: 'vpn-gateway', label: 'VPN Gateway' },
    { id: 'nac-1', type: 'nac', label: 'NAC' },
    { id: 'backup-1', type: 'backup', label: 'Backup' },
    { id: 'soar-1', type: 'soar', label: 'SOAR' },
    { id: 'ztna-1', type: 'ztna-broker', label: 'ZTNA Broker' },
  ],
  connections: [],
};

/** Partial spec — only firewall and MFA */
const partialSpec: InfraSpec = {
  nodes: [
    { id: 'fw-1', type: 'firewall', label: 'Firewall' },
    { id: 'mfa-1', type: 'mfa', label: 'MFA' },
  ],
  connections: [],
};

/** Financial sector options */
const financialOptions: ComplianceReportOptions = {
  industry: 'financial',
  organization: 'Acme Bank',
  frameworks: ['pci-dss'],
  securityLevel: 'critical',
};

/** Healthcare sector options */
const healthcareOptions: ComplianceReportOptions = {
  industry: 'healthcare',
  organization: 'City Hospital',
  frameworks: ['hipaa'],
  securityLevel: 'high',
};

/** Multi-framework options */
const multiFrameworkOptions: ComplianceReportOptions = {
  industry: 'general',
  organization: 'TechCorp',
  frameworks: ['pci-dss', 'iso-27001', 'gdpr'],
  securityLevel: 'standard',
};

// ---------------------------------------------------------------------------
// Tests: generateComplianceReport
// ---------------------------------------------------------------------------

describe('generateComplianceReport', () => {
  it('generates report for financial industry with PCI-DSS', () => {
    const report = generateComplianceReport(partialSpec, financialOptions);

    expect(report.metadata.industry).toBe('financial');
    expect(report.metadata.organization).toBe('Acme Bank');
    expect(report.metadata.frameworks).toContain('pci-dss');
    expect(report.sections.length).toBeGreaterThan(0);
  });

  it('generates report for healthcare with HIPAA', () => {
    const report = generateComplianceReport(partialSpec, healthcareOptions);

    expect(report.metadata.industry).toBe('healthcare');
    expect(report.metadata.organization).toBe('City Hospital');
    expect(report.metadata.frameworks).toContain('hipaa');
    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.overallScore).toBeLessThanOrEqual(100);
  });

  it('executive summary includes correct score', () => {
    const report = generateComplianceReport(fullSecuritySpec, financialOptions);

    expect(report.executiveSummary).toContain(`${report.overallScore}/100`);
    expect(report.executiveSummaryKo).toContain(`${report.overallScore}/100`);
  });

  it('framework section has correct number of sub-sections', () => {
    const report = generateComplianceReport(partialSpec, multiFrameworkOptions);

    // Executive Summary + 3 framework sections + Security Posture + Recommendations = 6 minimum
    // Plus possibly Anti-Pattern section (default enabled)
    const frameworkSections = report.sections.filter((s) =>
      s.title.includes('Framework Analysis'),
    );
    expect(frameworkSections).toHaveLength(3); // pci-dss, iso-27001, gdpr
  });

  it('detects missing components as gaps', () => {
    const report = generateComplianceReport(emptySpec, financialOptions);

    expect(report.gaps.length).toBeGreaterThan(0);
    // PCI-DSS requires firewall, waf, ids-ips, siem, dlp, mfa, vpn-gateway — all missing
    expect(report.gaps.length).toBe(7);

    const gapComponents = report.gaps.map((g) => g.component);
    expect(gapComponents).toContain('firewall');
    expect(gapComponents).toContain('waf');
    expect(gapComponents).toContain('mfa');
  });

  it('full-security spec gets compliant status', () => {
    const report = generateComplianceReport(fullSecuritySpec, financialOptions);

    expect(report.overallScore).toBe(100);
    expect(report.executiveSummary).toContain('Compliant');
    expect(report.gaps).toHaveLength(0);
  });

  it('empty spec gets non-compliant status', () => {
    const report = generateComplianceReport(emptySpec, financialOptions);

    expect(report.overallScore).toBe(0);
    expect(report.executiveSummary).toContain('Non-Compliant');
  });

  it('anti-pattern section included when enabled', () => {
    const options = { ...financialOptions, includeAntiPatterns: true };
    const report = generateComplianceReport(partialSpec, options);

    const antiPatternSection = report.sections.find(
      (s) => s.title === 'Anti-Pattern Detection',
    );
    expect(antiPatternSection).toBeDefined();
    expect(antiPatternSection!.titleKo).toBe('안티패턴 탐지');
  });

  it('anti-pattern section excluded when disabled', () => {
    const options = { ...financialOptions, includeAntiPatterns: false };
    const report = generateComplianceReport(partialSpec, options);

    const antiPatternSection = report.sections.find(
      (s) => s.title === 'Anti-Pattern Detection',
    );
    expect(antiPatternSection).toBeUndefined();
  });

  it('recommendations are bilingual', () => {
    const report = generateComplianceReport(emptySpec, financialOptions);

    expect(report.recommendations.length).toBeGreaterThan(0);
    expect(report.recommendationsKo.length).toBeGreaterThan(0);
    expect(report.recommendations.length).toBe(report.recommendationsKo.length);
  });

  it('report metadata populated correctly', () => {
    const report = generateComplianceReport(partialSpec, financialOptions);

    expect(report.metadata.title).toContain('Acme Bank');
    expect(report.metadata.generatedAt).toBeTruthy();
    // generatedAt should be an ISO date string
    expect(() => new Date(report.metadata.generatedAt)).not.toThrow();
  });

  it('recommendations excluded when disabled', () => {
    const options = { ...financialOptions, includeRecommendations: false };
    const report = generateComplianceReport(emptySpec, options);

    expect(report.recommendations).toHaveLength(0);
    expect(report.recommendationsKo).toHaveLength(0);

    const recSection = report.sections.find((s) => s.title === 'Recommendations');
    expect(recSection).toBeUndefined();
  });

  it('includes security posture assessment section', () => {
    const report = generateComplianceReport(partialSpec, financialOptions);

    const securitySection = report.sections.find(
      (s) => s.title === 'Security Posture Assessment',
    );
    expect(securitySection).toBeDefined();
    expect(securitySection!.titleKo).toBe('보안 상태 평가');
    expect(securitySection!.content.some((c) => c.includes('Security Level Target'))).toBe(true);
  });

  it('multiple frameworks combined correctly', () => {
    const report = generateComplianceReport(partialSpec, multiFrameworkOptions);

    // Should have gaps from all three frameworks (deduplicated per section)
    expect(report.gaps.length).toBeGreaterThan(0);

    // Framework sections should exist for each framework
    const frameworkSections = report.sections.filter((s) =>
      s.title.includes('Framework Analysis'),
    );
    expect(frameworkSections).toHaveLength(3);
  });

  it('framework sections have tables with correct headers', () => {
    const report = generateComplianceReport(partialSpec, financialOptions);

    const pciSection = report.sections.find((s) => s.title.includes('PCI-DSS'));
    expect(pciSection).toBeDefined();
    expect(pciSection!.tables).toBeDefined();
    expect(pciSection!.tables!.length).toBeGreaterThan(0);

    const table = pciSection!.tables![0];
    expect(table.headers).toEqual(['Component', 'Requirement', 'Present', 'Status']);
    expect(table.headersKo).toEqual(['컴포넌트', '요구사항', '존재 여부', '상태']);
  });

  it('gap items have correct type field', () => {
    const report = generateComplianceReport(emptySpec, financialOptions);

    for (const gap of report.gaps) {
      expect(gap.type).toBe('compliance');
    }
  });

  it('gap items have effort estimate', () => {
    const report = generateComplianceReport(emptySpec, financialOptions);

    for (const gap of report.gaps) {
      expect(['low', 'medium', 'high']).toContain(gap.effort);
    }
  });

  it('security posture rates domains correctly for full-security spec', () => {
    const report = generateComplianceReport(fullSecuritySpec, {
      ...financialOptions,
      securityLevel: 'standard',
    });

    const securitySection = report.sections.find(
      (s) => s.title === 'Security Posture Assessment',
    );
    expect(securitySection).toBeDefined();
    // All standard requirements should be met, so content should show "Strong"
    const strongCount = securitySection!.content.filter((c) =>
      c.includes('Strong'),
    ).length;
    expect(strongCount).toBeGreaterThanOrEqual(1);
  });

  it('defaults securityLevel to standard if not specified', () => {
    const options: ComplianceReportOptions = {
      industry: 'financial',
      organization: 'Test Org',
      frameworks: ['pci-dss'],
      // securityLevel omitted
    };
    const report = generateComplianceReport(partialSpec, options);

    const securitySection = report.sections.find(
      (s) => s.title === 'Security Posture Assessment',
    );
    expect(securitySection).toBeDefined();
    expect(securitySection!.content.some((c) => c.includes('standard'))).toBe(true);
  });

  it('executive summary content arrays are bilingual', () => {
    const report = generateComplianceReport(partialSpec, financialOptions);

    const execSection = report.sections.find((s) => s.title === 'Executive Summary');
    expect(execSection).toBeDefined();
    expect(execSection!.content.length).toBeGreaterThan(0);
    expect(execSection!.contentKo.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Tests: getFrameworkDescription
// ---------------------------------------------------------------------------

describe('getFrameworkDescription', () => {
  it('returns correct data for pci-dss', () => {
    const desc = getFrameworkDescription('pci-dss');

    expect(desc.name).toBe('PCI-DSS');
    expect(desc.nameKo).toBe('PCI-DSS');
    expect(desc.description).toContain('Payment Card');
    expect(desc.descriptionKo).toContain('결제');
  });

  it('returns correct data for hipaa', () => {
    const desc = getFrameworkDescription('hipaa');

    expect(desc.name).toBe('HIPAA');
    expect(desc.description).toContain('Health Insurance');
  });

  it('returns correct data for iso-27001', () => {
    const desc = getFrameworkDescription('iso-27001');

    expect(desc.name).toBe('ISO 27001');
    expect(desc.description).toContain('Information Security');
  });

  it('returns correct data for soc2', () => {
    const desc = getFrameworkDescription('soc2');

    expect(desc.name).toBe('SOC 2');
    expect(desc.description).toContain('Service Organization');
  });

  it('returns correct data for gdpr', () => {
    const desc = getFrameworkDescription('gdpr');

    expect(desc.name).toBe('GDPR');
    expect(desc.description).toContain('General Data Protection');
  });

  it('returns correct data for nist-800-53', () => {
    const desc = getFrameworkDescription('nist-800-53');

    expect(desc.name).toBe('NIST 800-53');
    expect(desc.description).toContain('NIST');
  });

  it('returns fallback for unknown framework', () => {
    const desc = getFrameworkDescription('unknown-framework');

    expect(desc.name).toBe('UNKNOWN-FRAMEWORK');
    expect(desc.description).toContain('compliance framework');
  });

  it('each framework has correct required components', () => {
    // PCI-DSS
    const pci = getFrameworkDescription('pci-dss');
    expect(pci.name).toBe('PCI-DSS');

    // Validate through calculateComplianceScore — full spec should cover PCI-DSS
    const score = calculateComplianceScore(fullSecuritySpec, ['pci-dss']);
    expect(score).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// Tests: calculateComplianceScore
// ---------------------------------------------------------------------------

describe('calculateComplianceScore', () => {
  it('returns 0-100 range', () => {
    const score = calculateComplianceScore(partialSpec, ['pci-dss']);

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('returns 0 for empty spec', () => {
    const score = calculateComplianceScore(emptySpec, ['pci-dss']);

    expect(score).toBe(0);
  });

  it('returns 100 for full security spec against PCI-DSS', () => {
    const score = calculateComplianceScore(fullSecuritySpec, ['pci-dss']);

    expect(score).toBe(100);
  });

  it('returns 0 for empty frameworks array', () => {
    const score = calculateComplianceScore(fullSecuritySpec, []);

    expect(score).toBe(0);
  });

  it('handles multiple frameworks', () => {
    const score = calculateComplianceScore(partialSpec, ['pci-dss', 'hipaa']);

    // firewall + mfa: 2 present out of 7 (pci-dss) + 6 (hipaa) = 13 required components
    // firewall appears in both, mfa appears in both => 4 present out of 13
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
  });

  it('partial spec gets intermediate score', () => {
    // partialSpec has firewall + mfa
    // PCI-DSS requires 7 components
    const score = calculateComplianceScore(partialSpec, ['pci-dss']);

    expect(score).toBe(Math.round((2 / 7) * 100)); // ~29
  });
});

// ---------------------------------------------------------------------------
// Tests: getComplianceStatus
// ---------------------------------------------------------------------------

describe('getComplianceStatus', () => {
  it('returns compliant for score >= 80', () => {
    expect(getComplianceStatus(80)).toBe('compliant');
    expect(getComplianceStatus(100)).toBe('compliant');
    expect(getComplianceStatus(95)).toBe('compliant');
  });

  it('returns partially-compliant for 50 <= score < 80', () => {
    expect(getComplianceStatus(50)).toBe('partially-compliant');
    expect(getComplianceStatus(79)).toBe('partially-compliant');
    expect(getComplianceStatus(65)).toBe('partially-compliant');
  });

  it('returns non-compliant for score < 50', () => {
    expect(getComplianceStatus(0)).toBe('non-compliant');
    expect(getComplianceStatus(49)).toBe('non-compliant');
    expect(getComplianceStatus(25)).toBe('non-compliant');
  });
});
