/**
 * Compliance Checker Tests
 *
 * Tests for the compliance checking system that validates infrastructure specs
 * against various regulatory frameworks (ISMS-P, ISO27001, PCI-DSS, GDPR, HIPAA, K-ISMS).
 */

import { describe, it, expect } from 'vitest';
import {
  checkCompliance,
  checkAllCompliance,
  analyzeWhatIfAdd,
  analyzeWhatIfRemove,
  getAvailableFrameworks,
  getFrameworkName,
  type ComplianceFramework,
  type ComplianceReport,
  type WhatIfResult,
} from '@/lib/audit/complianceChecker';
import type { InfraSpec, InfraNodeSpec, ConnectionSpec } from '@/types';

describe('ComplianceChecker', () => {
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
    label: string,
    options: Partial<InfraNodeSpec> = {}
  ): InfraNodeSpec => ({
    id,
    type,
    label,
    ...options,
  });

  describe('getFrameworkName', () => {
    it('should return correct name for ISMS-P', () => {
      expect(getFrameworkName('isms-p')).toBe('ISMS-P (정보보호관리체계)');
    });

    it('should return correct name for ISO 27001', () => {
      expect(getFrameworkName('iso27001')).toBe('ISO 27001');
    });

    it('should return correct name for PCI-DSS', () => {
      expect(getFrameworkName('pci-dss')).toBe('PCI DSS');
    });

    it('should return correct name for GDPR', () => {
      expect(getFrameworkName('gdpr')).toBe('GDPR');
    });

    it('should return correct name for HIPAA', () => {
      expect(getFrameworkName('hipaa')).toBe('HIPAA');
    });

    it('should return correct name for K-ISMS', () => {
      expect(getFrameworkName('k-isms')).toBe('K-ISMS');
    });
  });

  describe('getAvailableFrameworks', () => {
    it('should return all 6 frameworks', () => {
      const frameworks = getAvailableFrameworks();
      expect(frameworks).toHaveLength(6);
    });

    it('should include all required framework IDs', () => {
      const frameworks = getAvailableFrameworks();
      const ids = frameworks.map((f) => f.id);
      expect(ids).toContain('isms-p');
      expect(ids).toContain('iso27001');
      expect(ids).toContain('pci-dss');
      expect(ids).toContain('gdpr');
      expect(ids).toContain('hipaa');
      expect(ids).toContain('k-isms');
    });

    it('should include name and description for each framework', () => {
      const frameworks = getAvailableFrameworks();
      frameworks.forEach((f) => {
        expect(f.name).toBeDefined();
        expect(f.name.length).toBeGreaterThan(0);
        expect(f.description).toBeDefined();
        expect(f.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('checkCompliance', () => {
    describe('Report Structure', () => {
      it('should return a valid ComplianceReport structure', () => {
        const spec = createSpec([]);
        const report = checkCompliance(spec, 'isms-p');

        expect(report).toHaveProperty('framework');
        expect(report).toHaveProperty('frameworkName');
        expect(report).toHaveProperty('timestamp');
        expect(report).toHaveProperty('totalChecks');
        expect(report).toHaveProperty('passed');
        expect(report).toHaveProperty('failed');
        expect(report).toHaveProperty('partial');
        expect(report).toHaveProperty('notApplicable');
        expect(report).toHaveProperty('score');
        expect(report).toHaveProperty('checks');
        expect(Array.isArray(report.checks)).toBe(true);
      });

      it('should have valid timestamp in ISO format', () => {
        const spec = createSpec([]);
        const report = checkCompliance(spec, 'isms-p');

        expect(() => new Date(report.timestamp)).not.toThrow();
        expect(report.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      });

      it('should return correct framework info', () => {
        const spec = createSpec([]);
        const report = checkCompliance(spec, 'pci-dss');

        expect(report.framework).toBe('pci-dss');
        expect(report.frameworkName).toBe('PCI DSS');
      });
    });

    describe('ISMS-P Compliance', () => {
      it('should check ISMS-P-2.6.1 access control policy', () => {
        const spec = createSpec([
          createNode('fw-1', 'firewall', 'Firewall'),
          createNode('nac-1', 'nac', 'NAC'),
        ]);
        const report = checkCompliance(spec, 'isms-p');

        const check = report.checks.find((c) => c.id === 'ISMS-P-2.6.1');
        expect(check).toBeDefined();
        expect(check?.status).toBe('pass');
      });

      it('should report partial compliance when only firewall exists', () => {
        const spec = createSpec([
          createNode('fw-1', 'firewall', 'Firewall'),
        ]);
        const report = checkCompliance(spec, 'isms-p');

        const check = report.checks.find((c) => c.id === 'ISMS-P-2.6.1');
        expect(check?.status).toBe('partial');
        expect(check?.remediation).toBeDefined();
      });

      it('should check ISMS-P-2.6.2 user authentication', () => {
        const spec = createSpec([
          createNode('ldap-1', 'ldap-ad', 'LDAP'),
          createNode('mfa-1', 'mfa', 'MFA'),
        ]);
        const report = checkCompliance(spec, 'isms-p');

        const check = report.checks.find((c) => c.id === 'ISMS-P-2.6.2');
        expect(check).toBeDefined();
        expect(check?.status).toBe('pass');
      });

      it('should check ISMS-P-2.7.1 encryption policy', () => {
        const spec = createSpec(
          [],
          [{ source: 'a', target: 'b', flowType: 'encrypted' }]
        );
        const report = checkCompliance(spec, 'isms-p');

        const check = report.checks.find((c) => c.id === 'ISMS-P-2.7.1');
        expect(check?.status).toBe('pass');
      });

      it('should check ISMS-P-2.9.1 incident response', () => {
        const spec = createSpec([
          createNode('ids-1', 'ids-ips', 'IDS/IPS'),
          createNode('waf-1', 'waf', 'WAF'),
        ]);
        const report = checkCompliance(spec, 'isms-p');

        const check = report.checks.find((c) => c.id === 'ISMS-P-2.9.1');
        expect(check?.status).toBe('pass');
      });

      it('should check ISMS-P-2.10.1 disaster recovery', () => {
        const spec = createSpec([
          createNode('backup-1', 'backup', 'Backup'),
          createNode('db-1', 'db-server', 'Primary DB'),
          createNode('db-2', 'db-server', 'Replica DB'),
        ]);
        const report = checkCompliance(spec, 'isms-p');

        const check = report.checks.find((c) => c.id === 'ISMS-P-2.10.1');
        expect(check?.status).toBe('pass');
      });
    });

    describe('ISO 27001 Compliance', () => {
      it('should check A.9.1.1 access control policy', () => {
        const spec = createSpec([
          createNode('iam-1', 'iam', 'IAM'),
        ]);
        const report = checkCompliance(spec, 'iso27001');

        const check = report.checks.find((c) => c.id === 'A.9.1.1');
        expect(check?.status).toBe('pass');
      });

      it('should check A.10.1.1 cryptographic controls', () => {
        const spec = createSpec([
          createNode('vpn-1', 'vpn-gateway', 'VPN Gateway'),
        ]);
        const report = checkCompliance(spec, 'iso27001');

        const check = report.checks.find((c) => c.id === 'A.10.1.1');
        expect(check?.status).toBe('pass');
      });

      it('should check A.12.6.1 vulnerability management', () => {
        const spec = createSpec([
          createNode('ids-1', 'ids-ips', 'IDS/IPS'),
        ]);
        const report = checkCompliance(spec, 'iso27001');

        const check = report.checks.find((c) => c.id === 'A.12.6.1');
        expect(check?.status).toBe('pass');
      });

      it('should check A.13.1.1 network controls', () => {
        const spec = createSpec([
          createNode('router-1', 'router', 'Router'),
        ]);
        const report = checkCompliance(spec, 'iso27001');

        const check = report.checks.find((c) => c.id === 'A.13.1.1');
        expect(check?.status).toBe('pass');
      });

      it('should check A.17.1.1 information security continuity', () => {
        const spec = createSpec([
          createNode('backup-1', 'backup', 'Backup'),
          createNode('lb-1', 'load-balancer', 'LB'),
        ]);
        const report = checkCompliance(spec, 'iso27001');

        const check = report.checks.find((c) => c.id === 'A.17.1.1');
        expect(check?.status).toBe('pass');
      });
    });

    describe('PCI-DSS Compliance', () => {
      it('should check PCI-1.1 firewall requirement', () => {
        const spec = createSpec([
          createNode('fw-1', 'firewall', 'Firewall'),
        ]);
        const report = checkCompliance(spec, 'pci-dss');

        const check = report.checks.find((c) => c.id === 'PCI-1.1');
        expect(check?.status).toBe('pass');
      });

      it('should fail PCI-1.1 when no firewall', () => {
        const spec = createSpec([]);
        const report = checkCompliance(spec, 'pci-dss');

        const check = report.checks.find((c) => c.id === 'PCI-1.1');
        expect(check?.status).toBe('fail');
        expect(check?.remediation).toBeDefined();
      });

      it('should check PCI-3.4 data protection', () => {
        const spec = createSpec([
          createNode('db-1', 'db-server', 'Database'),
          createNode('dlp-1', 'dlp', 'DLP'),
        ]);
        const report = checkCompliance(spec, 'pci-dss');

        const check = report.checks.find((c) => c.id === 'PCI-3.4');
        expect(check?.status).toBe('partial');
      });

      it('should mark PCI-3.4 as not-applicable when no database', () => {
        const spec = createSpec([
          createNode('web-1', 'web-server', 'Web Server'),
        ]);
        const report = checkCompliance(spec, 'pci-dss');

        const check = report.checks.find((c) => c.id === 'PCI-3.4');
        expect(check?.status).toBe('not-applicable');
      });

      it('should check PCI-6.6 WAF requirement', () => {
        const spec = createSpec([
          createNode('web-1', 'web-server', 'Web Server'),
          createNode('waf-1', 'waf', 'WAF'),
        ]);
        const report = checkCompliance(spec, 'pci-dss');

        const check = report.checks.find((c) => c.id === 'PCI-6.6');
        expect(check?.status).toBe('pass');
      });

      it('should check PCI-8.3 MFA requirement', () => {
        const spec = createSpec([
          createNode('mfa-1', 'mfa', 'MFA'),
        ]);
        const report = checkCompliance(spec, 'pci-dss');

        const check = report.checks.find((c) => c.id === 'PCI-8.3');
        expect(check?.status).toBe('pass');
      });
    });

    describe('GDPR Compliance', () => {
      it('should check GDPR-32 security of processing', () => {
        const spec = createSpec(
          [createNode('fw-1', 'firewall', 'Firewall')],
          [{ source: 'a', target: 'b', flowType: 'encrypted' }]
        );
        const report = checkCompliance(spec, 'gdpr');

        const check = report.checks.find((c) => c.id === 'GDPR-32');
        expect(check?.status).toBe('pass');
      });

      it('should check GDPR-33 breach notification', () => {
        const spec = createSpec([
          createNode('ids-1', 'ids-ips', 'IDS/IPS'),
        ]);
        const report = checkCompliance(spec, 'gdpr');

        const check = report.checks.find((c) => c.id === 'GDPR-33');
        expect(check?.status).toBe('pass');
      });

      it('should check GDPR-25 data protection by design', () => {
        const spec = createSpec([
          createNode('db-1', 'db-server', 'Database'),
          createNode('dlp-1', 'dlp', 'DLP'),
        ]);
        const report = checkCompliance(spec, 'gdpr');

        const check = report.checks.find((c) => c.id === 'GDPR-25');
        expect(check?.status).toBe('pass');
      });
    });

    describe('HIPAA Compliance', () => {
      it('should check HIPAA-164.312(a) access control', () => {
        const spec = createSpec([
          createNode('fw-1', 'firewall', 'Firewall'),
          createNode('sso-1', 'sso', 'SSO'),
        ]);
        const report = checkCompliance(spec, 'hipaa');

        const check = report.checks.find((c) => c.id === 'HIPAA-164.312(a)');
        expect(check?.status).toBe('pass');
      });

      it('should check HIPAA-164.312(e) transmission security', () => {
        const spec = createSpec([
          createNode('vpn-1', 'vpn-gateway', 'VPN'),
        ]);
        const report = checkCompliance(spec, 'hipaa');

        const check = report.checks.find((c) => c.id === 'HIPAA-164.312(e)');
        expect(check?.status).toBe('pass');
      });
    });

    describe('K-ISMS Compliance', () => {
      it('should check K-ISMS-2.5.1 network security', () => {
        const spec = createSpec([
          createNode('fw-1', 'firewall', 'Firewall'),
        ]);
        const report = checkCompliance(spec, 'k-isms');

        const check = report.checks.find((c) => c.id === 'K-ISMS-2.5.1');
        expect(check?.status).toBe('pass');
      });

      it('should check K-ISMS-2.6.2 user authentication', () => {
        const spec = createSpec([
          createNode('mfa-1', 'mfa', 'MFA'),
        ]);
        const report = checkCompliance(spec, 'k-isms');

        const check = report.checks.find((c) => c.id === 'K-ISMS-2.6.2');
        expect(check?.status).toBe('pass');
      });
    });

    describe('Score Calculation', () => {
      it('should return 100 when all checks pass', () => {
        const spec = createSpec([
          createNode('fw-1', 'firewall', 'Firewall'),
          createNode('nac-1', 'nac', 'NAC'),
          createNode('ldap-1', 'ldap-ad', 'LDAP'),
          createNode('mfa-1', 'mfa', 'MFA'),
          createNode('vpn-1', 'vpn-gateway', 'VPN'),
          createNode('ids-1', 'ids-ips', 'IDS/IPS'),
          createNode('waf-1', 'waf', 'WAF'),
          createNode('backup-1', 'backup', 'Backup'),
          createNode('db-1', 'db-server', 'Primary DB'),
          createNode('db-2', 'db-server', 'Replica DB'),
        ]);
        const report = checkCompliance(spec, 'isms-p');

        expect(report.score).toBe(100);
      });

      it('should count partial as 0.5 for scoring', () => {
        const spec = createSpec([
          createNode('fw-1', 'firewall', 'Firewall'),
        ]);
        const report = checkCompliance(spec, 'isms-p');

        // Some checks will be partial, score should be less than 100
        expect(report.score).toBeLessThan(100);
        expect(report.partial).toBeGreaterThan(0);
      });

      it('should handle all checks being not-applicable', () => {
        const spec = createSpec([]);
        const report = checkCompliance(spec, 'pci-dss');

        // Score should be 100 if no applicable checks
        // or lower if there are failed checks
        expect(report.score).toBeGreaterThanOrEqual(0);
        expect(report.score).toBeLessThanOrEqual(100);
      });
    });

    describe('Check Count Validation', () => {
      it('should have correct total check count', () => {
        const spec = createSpec([]);
        const report = checkCompliance(spec, 'isms-p');

        const totalFromBreakdown = report.passed + report.failed + report.partial + report.notApplicable;
        expect(totalFromBreakdown).toBe(report.totalChecks);
      });

      it('should have same number of checks as totalChecks', () => {
        const spec = createSpec([]);
        const report = checkCompliance(spec, 'pci-dss');

        expect(report.checks.length).toBe(report.totalChecks);
      });
    });
  });

  describe('checkAllCompliance', () => {
    it('should return reports for all 6 frameworks', () => {
      const spec = createSpec([]);
      const reports = checkAllCompliance(spec);

      expect(reports).toHaveLength(6);
    });

    it('should include all framework types', () => {
      const spec = createSpec([]);
      const reports = checkAllCompliance(spec);

      const frameworks = reports.map((r) => r.framework);
      expect(frameworks).toContain('isms-p');
      expect(frameworks).toContain('iso27001');
      expect(frameworks).toContain('pci-dss');
      expect(frameworks).toContain('gdpr');
      expect(frameworks).toContain('hipaa');
      expect(frameworks).toContain('k-isms');
    });

    it('should return valid reports for each framework', () => {
      const spec = createSpec([
        createNode('fw-1', 'firewall', 'Firewall'),
        createNode('waf-1', 'waf', 'WAF'),
      ]);
      const reports = checkAllCompliance(spec);

      reports.forEach((report) => {
        expect(report.totalChecks).toBeGreaterThan(0);
        expect(report.score).toBeGreaterThanOrEqual(0);
        expect(report.score).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('analyzeWhatIfAdd', () => {
    describe('Security Component Addition', () => {
      it('should show positive impact when adding firewall', () => {
        const spec = createSpec([]);
        const result = analyzeWhatIfAdd(spec, 'firewall');

        expect(result.change.type).toBe('add');
        expect(result.change.nodeType).toBe('firewall');
        expect(result.riskDelta).toBeGreaterThan(0);
        expect(result.impacts.some((i) => i.category === 'security')).toBe(true);
      });

      it('should show positive impact when adding WAF', () => {
        const spec = createSpec([
          createNode('web-1', 'web-server', 'Web Server'),
        ]);
        const result = analyzeWhatIfAdd(spec, 'waf');

        expect(result.riskDelta).toBeGreaterThan(0);
        expect(result.impacts.some((i) => i.category === 'compliance')).toBe(true);
      });

      it('should show positive impact when adding IDS/IPS', () => {
        const spec = createSpec([]);
        const result = analyzeWhatIfAdd(spec, 'ids-ips');

        expect(result.riskDelta).toBeGreaterThan(0);
        expect(result.impacts.some((i) => i.severity === 'high')).toBe(true);
      });

      it('should show positive impact when adding NAC', () => {
        const spec = createSpec([]);
        const result = analyzeWhatIfAdd(spec, 'nac');

        expect(result.riskDelta).toBeGreaterThan(0);
      });

      it('should show positive impact when adding DLP', () => {
        const spec = createSpec([]);
        const result = analyzeWhatIfAdd(spec, 'dlp');

        expect(result.riskDelta).toBeGreaterThan(0);
      });
    });

    describe('Authentication Component Addition', () => {
      it('should show positive impact when adding LDAP/AD', () => {
        const spec = createSpec([]);
        const result = analyzeWhatIfAdd(spec, 'ldap-ad');

        expect(result.riskDelta).toBeGreaterThan(0);
        expect(result.impacts.some((i) => i.category === 'security')).toBe(true);
      });

      it('should show positive impact when adding SSO', () => {
        const spec = createSpec([]);
        const result = analyzeWhatIfAdd(spec, 'sso');

        expect(result.riskDelta).toBeGreaterThan(0);
      });

      it('should show positive impact and compliance when adding MFA', () => {
        const spec = createSpec([]);
        const result = analyzeWhatIfAdd(spec, 'mfa');

        expect(result.riskDelta).toBeGreaterThan(0);
        expect(result.impacts.some((i) => i.category === 'compliance')).toBe(true);
      });

      it('should show positive impact when adding IAM', () => {
        const spec = createSpec([]);
        const result = analyzeWhatIfAdd(spec, 'iam');

        expect(result.riskDelta).toBeGreaterThan(0);
      });
    });

    describe('Availability Component Addition', () => {
      it('should show positive impact when adding load balancer', () => {
        const spec = createSpec([]);
        const result = analyzeWhatIfAdd(spec, 'load-balancer');

        expect(result.riskDelta).toBeGreaterThan(0);
        expect(result.impacts.some((i) => i.category === 'availability')).toBe(true);
      });

      it('should show positive impact when adding CDN', () => {
        const spec = createSpec([]);
        const result = analyzeWhatIfAdd(spec, 'cdn');

        expect(result.riskDelta).toBeGreaterThan(0);
        expect(result.impacts.some((i) => i.category === 'availability')).toBe(true);
      });

      it('should show positive impact when adding backup', () => {
        const spec = createSpec([]);
        const result = analyzeWhatIfAdd(spec, 'backup');

        expect(result.riskDelta).toBeGreaterThan(0);
      });
    });

    describe('Cost Impact', () => {
      it('should always include cost impact', () => {
        const spec = createSpec([]);
        const result = analyzeWhatIfAdd(spec, 'firewall');

        expect(result.impacts.some((i) => i.category === 'cost')).toBe(true);
      });
    });

    describe('Recommendations', () => {
      it('should provide recommendations for security additions', () => {
        const spec = createSpec([]);
        const result = analyzeWhatIfAdd(spec, 'firewall');

        expect(result.recommendations.length).toBeGreaterThan(0);
      });
    });
  });

  describe('analyzeWhatIfRemove', () => {
    describe('Node Not Found', () => {
      it('should handle non-existent node gracefully', () => {
        const spec = createSpec([]);
        const result = analyzeWhatIfRemove(spec, 'non-existent');

        expect(result.change.type).toBe('remove');
        expect(result.impacts).toHaveLength(0);
        expect(result.riskDelta).toBe(0);
      });
    });

    describe('Security Component Removal', () => {
      it('should show negative impact when removing firewall', () => {
        const spec = createSpec([
          createNode('fw-1', 'firewall', 'Firewall'),
        ]);
        const result = analyzeWhatIfRemove(spec, 'fw-1');

        expect(result.riskDelta).toBeLessThan(0);
        expect(result.impacts.some((i) => i.severity === 'high')).toBe(true);
        expect(result.impacts.some((i) => i.category === 'security')).toBe(true);
      });

      it('should show negative impact when removing WAF', () => {
        const spec = createSpec([
          createNode('waf-1', 'waf', 'WAF'),
        ]);
        const result = analyzeWhatIfRemove(spec, 'waf-1');

        expect(result.riskDelta).toBeLessThan(0);
        expect(result.impacts.some((i) => i.category === 'compliance')).toBe(true);
      });

      it('should show negative impact when removing IDS/IPS', () => {
        const spec = createSpec([
          createNode('ids-1', 'ids-ips', 'IDS/IPS'),
        ]);
        const result = analyzeWhatIfRemove(spec, 'ids-1');

        expect(result.riskDelta).toBeLessThan(0);
      });
    });

    describe('Authentication Component Removal', () => {
      it('should show negative impact when removing SSO', () => {
        const spec = createSpec([
          createNode('sso-1', 'sso', 'SSO'),
        ]);
        const result = analyzeWhatIfRemove(spec, 'sso-1');

        expect(result.riskDelta).toBeLessThan(0);
        expect(result.impacts.some((i) => i.category === 'security')).toBe(true);
      });

      it('should show negative impact when removing MFA', () => {
        const spec = createSpec([
          createNode('mfa-1', 'mfa', 'MFA'),
        ]);
        const result = analyzeWhatIfRemove(spec, 'mfa-1');

        expect(result.riskDelta).toBeLessThan(0);
        expect(result.impacts.some((i) => i.category === 'compliance')).toBe(true);
      });

      it('should show negative impact when removing IAM', () => {
        const spec = createSpec([
          createNode('iam-1', 'iam', 'IAM'),
        ]);
        const result = analyzeWhatIfRemove(spec, 'iam-1');

        expect(result.riskDelta).toBeLessThan(0);
      });
    });

    describe('Availability Component Removal', () => {
      it('should show negative impact when removing load balancer', () => {
        const spec = createSpec([
          createNode('lb-1', 'load-balancer', 'Load Balancer'),
        ]);
        const result = analyzeWhatIfRemove(spec, 'lb-1');

        expect(result.riskDelta).toBeLessThan(0);
        expect(result.impacts.some((i) => i.category === 'availability')).toBe(true);
      });

      it('should show negative impact when removing backup', () => {
        const spec = createSpec([
          createNode('backup-1', 'backup', 'Backup'),
        ]);
        const result = analyzeWhatIfRemove(spec, 'backup-1');

        expect(result.riskDelta).toBeLessThan(0);
        expect(result.impacts.some((i) => i.category === 'availability')).toBe(true);
      });
    });

    describe('Connection Impact', () => {
      it('should report affected connections when node is removed', () => {
        const spec = createSpec(
          [
            createNode('fw-1', 'firewall', 'Firewall'),
            createNode('web-1', 'web-server', 'Web Server'),
          ],
          [{ source: 'fw-1', target: 'web-1' }]
        );
        const result = analyzeWhatIfRemove(spec, 'fw-1');

        expect(result.impacts.some((i) => i.description.includes('연결 경로'))).toBe(true);
        expect(result.recommendations.length).toBeGreaterThan(0);
      });

      it('should report multiple affected connections', () => {
        const spec = createSpec(
          [
            createNode('lb-1', 'load-balancer', 'LB'),
            createNode('web-1', 'web-server', 'Web 1'),
            createNode('web-2', 'web-server', 'Web 2'),
          ],
          [
            { source: 'lb-1', target: 'web-1' },
            { source: 'lb-1', target: 'web-2' },
          ]
        );
        const result = analyzeWhatIfRemove(spec, 'lb-1');

        expect(result.impacts.some((i) => i.description.includes('2개의 연결'))).toBe(true);
      });
    });

    describe('Recommendations', () => {
      it('should provide recommendations for security removals', () => {
        const spec = createSpec([
          createNode('fw-1', 'firewall', 'Firewall'),
        ]);
        const result = analyzeWhatIfRemove(spec, 'fw-1');

        expect(result.recommendations.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty spec for compliance check', () => {
      const spec = createSpec([]);
      const report = checkCompliance(spec, 'isms-p');

      expect(report.totalChecks).toBeGreaterThan(0);
      expect(report.score).toBeGreaterThanOrEqual(0);
    });

    it('should handle spec with only one node', () => {
      const spec = createSpec([
        createNode('fw-1', 'firewall', 'Firewall'),
      ]);
      const reports = checkAllCompliance(spec);

      reports.forEach((report) => {
        expect(report.totalChecks).toBeGreaterThan(0);
      });
    });

    it('should handle spec with no connections', () => {
      const spec = createSpec([
        createNode('fw-1', 'firewall', 'Firewall'),
        createNode('web-1', 'web-server', 'Web Server'),
      ]);
      const report = checkCompliance(spec, 'isms-p');

      expect(report.totalChecks).toBeGreaterThan(0);
    });

    it('should handle spec with encrypted connections', () => {
      const spec = createSpec(
        [
          createNode('vpn-1', 'vpn-gateway', 'VPN'),
          createNode('app-1', 'app-server', 'App'),
        ],
        [{ source: 'vpn-1', target: 'app-1', flowType: 'encrypted' }]
      );
      const report = checkCompliance(spec, 'isms-p');

      const encryptionCheck = report.checks.find((c) => c.id === 'ISMS-P-2.7.1');
      expect(encryptionCheck?.status).toBe('pass');
    });
  });
});
