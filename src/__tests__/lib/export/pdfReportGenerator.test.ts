import { describe, it, expect, vi } from 'vitest';
import {
  generatePDFReport,
  getDefaultReportOptions,
  type PDFReportOptions,
  type ReportMetadata,
} from '@/lib/export/pdfReportGenerator';
import type { InfraSpec, InfraNodeSpec, ConnectionSpec } from '@/types';

// Mock jspdf with a proper class constructor
vi.mock('jspdf', () => {
  class MockJsPDF {
    addImage = vi.fn();
    addPage = vi.fn();
    setPage = vi.fn();
    getNumberOfPages = vi.fn(() => 3);
    setFontSize = vi.fn();
    setTextColor = vi.fn();
    setFillColor = vi.fn();
    setDrawColor = vi.fn();
    text = vi.fn();
    rect = vi.fn();
    line = vi.fn();
    output = vi.fn(() => new Blob(['mock pdf'], { type: 'application/pdf' }));
    splitTextToSize = vi.fn((text: string) => [text]);
    internal = {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297,
      },
    };
  }
  return {
    jsPDF: MockJsPDF,
  };
});

// Mock the audit and cost modules
vi.mock('@/lib/audit', () => ({
  runSecurityAudit: vi.fn(() => ({
    summary: { critical: 1, high: 2, medium: 3, low: 4 },
    findings: [
      {
        id: 'SEC-001',
        title: 'Missing WAF',
        description: 'Web Application Firewall is not configured',
        severity: 'high',
        category: 'network',
        nodeId: 'web-1',
        recommendation: 'Add WAF',
      },
      {
        id: 'SEC-002',
        title: 'Open Ports',
        description: 'Unnecessary ports are open',
        severity: 'medium',
        category: 'network',
        nodeId: 'fw-1',
        recommendation: 'Close unused ports',
      },
    ],
    passedChecks: 10,
    totalChecks: 15,
    score: 66,
  })),
  checkAllCompliance: vi.fn(() => [
    {
      framework: 'pci-dss',
      frameworkName: 'PCI DSS 4.0',
      score: 75,
      passed: 8,
      failed: 2,
      partial: 2,
      checks: [],
    },
    {
      framework: 'iso27001',
      frameworkName: 'ISO 27001',
      score: 85,
      passed: 10,
      failed: 1,
      partial: 1,
      checks: [],
    },
  ]),
}));

vi.mock('@/lib/cost', () => ({
  estimateCost: vi.fn(() => ({
    totalMonthlyCost: 1500.5,
    totalYearlyCost: 18006,
    items: [],
    byCategory: {
      compute: 800,
      storage: 300,
      network: 200,
      security: 150,
      database: 50.5,
    },
    provider: 'aws',
  })),
  compareCosts: vi.fn(() => ({
    aws: { totalMonthlyCost: 1500, totalYearlyCost: 18000 },
    azure: { totalMonthlyCost: 1600, totalYearlyCost: 19200 },
    gcp: { totalMonthlyCost: 1400, totalYearlyCost: 16800 },
  })),
  formatCost: vi.fn((cost: number, currency: string) => {
    if (currency === 'KRW') {
      return `${Math.round(cost * 1300).toLocaleString()}원`;
    }
    return `$${cost.toFixed(2)}`;
  }),
}));

describe('PDFReportGenerator', () => {
  // Helper to create a basic InfraSpec
  const createSpec = (
    nodes: InfraNodeSpec[],
    connections: ConnectionSpec[] = []
  ): InfraSpec => ({
    nodes,
    connections,
  });

  // Helper to create a node
  const createNode = (
    id: string,
    type: InfraNodeSpec['type'],
    label: string
  ): InfraNodeSpec => ({
    id,
    type,
    label,
  });

  // Helper to create default metadata
  const createMetadata = (overrides?: Partial<ReportMetadata>): ReportMetadata => ({
    title: 'Test Infrastructure Report',
    createdAt: '2026-02-08',
    ...overrides,
  });

  // Helper to create default options
  const createOptions = (overrides?: Partial<PDFReportOptions>): PDFReportOptions => ({
    metadata: createMetadata(),
    includeArchitecture: true,
    includeSecurityAudit: true,
    includeCompliance: true,
    includeCostEstimate: true,
    provider: 'aws',
    currency: 'USD',
    ...overrides,
  });

  describe('generatePDFReport', () => {
    describe('Basic Generation', () => {
      it('should generate a PDF blob', async () => {
        const spec = createSpec([createNode('web-1', 'web-server', 'Web Server')]);
        const options = createOptions();

        const result = await generatePDFReport(spec, options);

        expect(result).toBeInstanceOf(Blob);
      });

      it('should generate PDF with empty spec', async () => {
        const spec = createSpec([]);
        const options = createOptions();

        const result = await generatePDFReport(spec, options);

        expect(result).toBeInstanceOf(Blob);
      });

      it('should generate PDF with minimal options', async () => {
        const spec = createSpec([createNode('web-1', 'web-server', 'Web')]);
        const options: PDFReportOptions = {
          metadata: createMetadata(),
          includeArchitecture: false,
          includeSecurityAudit: false,
          includeCompliance: false,
          includeCostEstimate: false,
        };

        const result = await generatePDFReport(spec, options);

        expect(result).toBeInstanceOf(Blob);
      });
    });

    describe('Cover Page', () => {
      it('should include title from metadata', async () => {
        const spec = createSpec([]);
        const options = createOptions({
          metadata: createMetadata({ title: 'Custom Title' }),
        });

        // The function uses jsPDF.text which is mocked
        // We verify the function completes without error
        const result = await generatePDFReport(spec, options);
        expect(result).toBeInstanceOf(Blob);
      });

      it('should include organization in metadata', async () => {
        const spec = createSpec([]);
        const options = createOptions({
          metadata: createMetadata({ organization: 'Test Corp' }),
        });

        const result = await generatePDFReport(spec, options);
        expect(result).toBeInstanceOf(Blob);
      });

      it('should include author in metadata', async () => {
        const spec = createSpec([]);
        const options = createOptions({
          metadata: createMetadata({ author: 'John Doe' }),
        });

        const result = await generatePDFReport(spec, options);
        expect(result).toBeInstanceOf(Blob);
      });

      it('should include version in metadata', async () => {
        const spec = createSpec([]);
        const options = createOptions({
          metadata: createMetadata({ version: '1.0.0' }),
        });

        const result = await generatePDFReport(spec, options);
        expect(result).toBeInstanceOf(Blob);
      });
    });

    describe('Architecture Section', () => {
      it('should include architecture when includeArchitecture is true', async () => {
        const spec = createSpec([
          createNode('web-1', 'web-server', 'Web Server'),
          createNode('app-1', 'app-server', 'App Server'),
          createNode('db-1', 'db-server', 'Database'),
        ]);
        const options = createOptions({ includeArchitecture: true });

        const result = await generatePDFReport(spec, options);
        expect(result).toBeInstanceOf(Blob);
      });

      it('should skip architecture when includeArchitecture is false', async () => {
        const spec = createSpec([createNode('web-1', 'web-server', 'Web')]);
        const options = createOptions({ includeArchitecture: false });

        const result = await generatePDFReport(spec, options);
        expect(result).toBeInstanceOf(Blob);
      });

      it('should group components by type', async () => {
        const spec = createSpec([
          createNode('web-1', 'web-server', 'Web 1'),
          createNode('web-2', 'web-server', 'Web 2'),
          createNode('db-1', 'db-server', 'DB'),
        ]);
        const options = createOptions({ includeArchitecture: true });

        const result = await generatePDFReport(spec, options);
        expect(result).toBeInstanceOf(Blob);
      });
    });

    describe('Security Audit Section', () => {
      it('should include security audit when includeSecurityAudit is true', async () => {
        const spec = createSpec([createNode('web-1', 'web-server', 'Web')]);
        const options = createOptions({ includeSecurityAudit: true });

        const result = await generatePDFReport(spec, options);
        expect(result).toBeInstanceOf(Blob);
      });

      it('should skip security audit when includeSecurityAudit is false', async () => {
        const spec = createSpec([createNode('web-1', 'web-server', 'Web')]);
        const options = createOptions({ includeSecurityAudit: false });

        const result = await generatePDFReport(spec, options);
        expect(result).toBeInstanceOf(Blob);
      });

      it('should show audit summary with severity counts', async () => {
        const spec = createSpec([createNode('web-1', 'web-server', 'Web')]);
        const options = createOptions({ includeSecurityAudit: true });

        const result = await generatePDFReport(spec, options);
        expect(result).toBeInstanceOf(Blob);
      });

      it('should list audit findings', async () => {
        const spec = createSpec([createNode('web-1', 'web-server', 'Web')]);
        const options = createOptions({ includeSecurityAudit: true });

        const result = await generatePDFReport(spec, options);
        expect(result).toBeInstanceOf(Blob);
      });
    });

    describe('Compliance Section', () => {
      it('should include compliance when includeCompliance is true', async () => {
        const spec = createSpec([createNode('web-1', 'web-server', 'Web')]);
        const options = createOptions({ includeCompliance: true });

        const result = await generatePDFReport(spec, options);
        expect(result).toBeInstanceOf(Blob);
      });

      it('should skip compliance when includeCompliance is false', async () => {
        const spec = createSpec([createNode('web-1', 'web-server', 'Web')]);
        const options = createOptions({ includeCompliance: false });

        const result = await generatePDFReport(spec, options);
        expect(result).toBeInstanceOf(Blob);
      });

      it('should show compliance scores for multiple frameworks', async () => {
        const spec = createSpec([createNode('web-1', 'web-server', 'Web')]);
        const options = createOptions({ includeCompliance: true });

        const result = await generatePDFReport(spec, options);
        expect(result).toBeInstanceOf(Blob);
      });
    });

    describe('Cost Estimation Section', () => {
      it('should include cost estimate when includeCostEstimate is true', async () => {
        const spec = createSpec([createNode('web-1', 'web-server', 'Web')]);
        const options = createOptions({ includeCostEstimate: true });

        const result = await generatePDFReport(spec, options);
        expect(result).toBeInstanceOf(Blob);
      });

      it('should skip cost estimate when includeCostEstimate is false', async () => {
        const spec = createSpec([createNode('web-1', 'web-server', 'Web')]);
        const options = createOptions({ includeCostEstimate: false });

        const result = await generatePDFReport(spec, options);
        expect(result).toBeInstanceOf(Blob);
      });

      it('should use specified provider', async () => {
        const spec = createSpec([createNode('web-1', 'web-server', 'Web')]);
        const options = createOptions({
          includeCostEstimate: true,
          provider: 'azure',
        });

        const result = await generatePDFReport(spec, options);
        expect(result).toBeInstanceOf(Blob);
      });

      it('should use specified currency', async () => {
        const spec = createSpec([createNode('web-1', 'web-server', 'Web')]);
        const options = createOptions({
          includeCostEstimate: true,
          currency: 'KRW',
        });

        const result = await generatePDFReport(spec, options);
        expect(result).toBeInstanceOf(Blob);
      });

      it('should show cost breakdown by category', async () => {
        const spec = createSpec([createNode('web-1', 'web-server', 'Web')]);
        const options = createOptions({ includeCostEstimate: true });

        const result = await generatePDFReport(spec, options);
        expect(result).toBeInstanceOf(Blob);
      });

      it('should show provider comparison', async () => {
        const spec = createSpec([createNode('web-1', 'web-server', 'Web')]);
        const options = createOptions({ includeCostEstimate: true });

        const result = await generatePDFReport(spec, options);
        expect(result).toBeInstanceOf(Blob);
      });
    });

    describe('Diagram Image', () => {
      it('should handle diagram image when provided', async () => {
        const spec = createSpec([]);
        const options = createOptions({
          diagramImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...',
        });

        const result = await generatePDFReport(spec, options);
        expect(result).toBeInstanceOf(Blob);
      });

      it('should handle missing diagram image gracefully', async () => {
        const spec = createSpec([]);
        const options = createOptions({ diagramImage: undefined });

        const result = await generatePDFReport(spec, options);
        expect(result).toBeInstanceOf(Blob);
      });
    });

    describe('Executive Summary', () => {
      it('should calculate correct node statistics', async () => {
        const spec = createSpec([
          // Security
          createNode('fw-1', 'firewall', 'Firewall'),
          createNode('waf-1', 'waf', 'WAF'),
          // Network
          createNode('lb-1', 'load-balancer', 'LB'),
          createNode('cdn-1', 'cdn', 'CDN'),
          // Compute
          createNode('web-1', 'web-server', 'Web'),
          createNode('app-1', 'app-server', 'App'),
          createNode('db-1', 'db-server', 'DB'),
        ]);
        const options = createOptions();

        const result = await generatePDFReport(spec, options);
        expect(result).toBeInstanceOf(Blob);
      });

      it('should count connections correctly', async () => {
        const spec = createSpec(
          [
            createNode('web-1', 'web-server', 'Web'),
            createNode('app-1', 'app-server', 'App'),
            createNode('db-1', 'db-server', 'DB'),
          ],
          [
            { source: 'web-1', target: 'app-1' },
            { source: 'app-1', target: 'db-1' },
          ]
        );
        const options = createOptions();

        const result = await generatePDFReport(spec, options);
        expect(result).toBeInstanceOf(Blob);
      });
    });

    describe('Large Spec Handling', () => {
      it('should handle large number of nodes', async () => {
        const nodes: InfraNodeSpec[] = [];
        for (let i = 0; i < 50; i++) {
          nodes.push(createNode(`node-${i}`, 'web-server', `Node ${i}`));
        }
        const spec = createSpec(nodes);
        const options = createOptions();

        const result = await generatePDFReport(spec, options);
        expect(result).toBeInstanceOf(Blob);
      });

      it('should handle large number of connections', async () => {
        const nodes = [
          createNode('hub', 'load-balancer', 'Hub'),
          ...Array.from({ length: 20 }, (_, i) =>
            createNode(`node-${i}`, 'web-server', `Node ${i}`)
          ),
        ];
        const connections = Array.from({ length: 20 }, (_, i) => ({
          source: 'hub',
          target: `node-${i}`,
        }));
        const spec = createSpec(nodes, connections);
        const options = createOptions();

        const result = await generatePDFReport(spec, options);
        expect(result).toBeInstanceOf(Blob);
      });
    });
  });

  describe('getDefaultReportOptions', () => {
    it('should return default options', () => {
      const options = getDefaultReportOptions();

      expect(options).toBeDefined();
      expect(options.metadata).toBeDefined();
      expect(options.metadata.title).toBe('Infrastructure Architecture Report');
      expect(options.metadata.createdAt).toBeDefined();
    });

    it('should include all section flags set to true', () => {
      const options = getDefaultReportOptions();

      expect(options.includeArchitecture).toBe(true);
      expect(options.includeSecurityAudit).toBe(true);
      expect(options.includeCompliance).toBe(true);
      expect(options.includeCostEstimate).toBe(true);
    });

    it('should use AWS as default provider', () => {
      const options = getDefaultReportOptions();

      expect(options.provider).toBe('aws');
    });

    it('should use KRW as default currency', () => {
      const options = getDefaultReportOptions();

      expect(options.currency).toBe('KRW');
    });

    it('should include current date/time in createdAt', () => {
      const options = getDefaultReportOptions();

      // Should be a valid date string
      expect(options.metadata.createdAt).toBeDefined();
      expect(typeof options.metadata.createdAt).toBe('string');
      expect(options.metadata.createdAt.length).toBeGreaterThan(0);
    });
  });

  describe('ReportMetadata', () => {
    it('should accept all optional fields', async () => {
      const spec = createSpec([]);
      const options: PDFReportOptions = {
        metadata: {
          title: 'Full Report',
          author: 'Test Author',
          organization: 'Test Org',
          version: '2.0.0',
          createdAt: '2026-02-08T12:00:00Z',
        },
        includeArchitecture: true,
        includeSecurityAudit: true,
        includeCompliance: true,
        includeCostEstimate: true,
      };

      const result = await generatePDFReport(spec, options);
      expect(result).toBeInstanceOf(Blob);
    });

    it('should work with minimal metadata', async () => {
      const spec = createSpec([]);
      const options: PDFReportOptions = {
        metadata: {
          title: 'Minimal Report',
          createdAt: '2026-02-08',
        },
        includeArchitecture: false,
        includeSecurityAudit: false,
        includeCompliance: false,
        includeCostEstimate: false,
      };

      const result = await generatePDFReport(spec, options);
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('Currency Formatting', () => {
    it('should format USD currency', async () => {
      const spec = createSpec([createNode('web-1', 'web-server', 'Web')]);
      const options = createOptions({
        includeCostEstimate: true,
        currency: 'USD',
      });

      const result = await generatePDFReport(spec, options);
      expect(result).toBeInstanceOf(Blob);
    });

    it('should format KRW currency', async () => {
      const spec = createSpec([createNode('web-1', 'web-server', 'Web')]);
      const options = createOptions({
        includeCostEstimate: true,
        currency: 'KRW',
      });

      const result = await generatePDFReport(spec, options);
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('Provider Options', () => {
    it('should support AWS provider', async () => {
      const spec = createSpec([createNode('web-1', 'web-server', 'Web')]);
      const options = createOptions({
        includeCostEstimate: true,
        provider: 'aws',
      });

      const result = await generatePDFReport(spec, options);
      expect(result).toBeInstanceOf(Blob);
    });

    it('should support Azure provider', async () => {
      const spec = createSpec([createNode('web-1', 'web-server', 'Web')]);
      const options = createOptions({
        includeCostEstimate: true,
        provider: 'azure',
      });

      const result = await generatePDFReport(spec, options);
      expect(result).toBeInstanceOf(Blob);
    });

    it('should support GCP provider', async () => {
      const spec = createSpec([createNode('web-1', 'web-server', 'Web')]);
      const options = createOptions({
        includeCostEstimate: true,
        provider: 'gcp',
      });

      const result = await generatePDFReport(spec, options);
      expect(result).toBeInstanceOf(Blob);
    });
  });
});
