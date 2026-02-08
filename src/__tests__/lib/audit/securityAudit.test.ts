/**
 * Security Audit Tests
 *
 * Tests for the security audit system that checks infrastructure specs
 * for security vulnerabilities and best practices.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  runSecurityAudit,
  getSeverityColor,
  getSeverityBadge,
  type SecurityAuditResult,
  type AuditFinding,
  type AuditSeverity,
} from '@/lib/audit/securityAudit';
import type { InfraSpec, InfraNodeSpec, ConnectionSpec } from '@/types';

describe('SecurityAudit', () => {
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

  describe('runSecurityAudit', () => {
    describe('Basic Audit Functionality', () => {
      it('should return a valid SecurityAuditResult structure', () => {
        const spec = createSpec([]);
        const result = runSecurityAudit(spec);

        expect(result).toHaveProperty('timestamp');
        expect(result).toHaveProperty('totalNodes');
        expect(result).toHaveProperty('totalConnections');
        expect(result).toHaveProperty('findings');
        expect(result).toHaveProperty('score');
        expect(result).toHaveProperty('summary');
        expect(Array.isArray(result.findings)).toBe(true);
      });

      it('should include specName when provided', () => {
        const spec = createSpec([]);
        const result = runSecurityAudit(spec, 'Test Architecture');

        expect(result.specName).toBe('Test Architecture');
      });

      it('should correctly count nodes and connections', () => {
        const spec = createSpec(
          [
            createNode('fw-1', 'firewall', 'Firewall'),
            createNode('web-1', 'web-server', 'Web Server'),
          ],
          [{ source: 'fw-1', target: 'web-1' }]
        );
        const result = runSecurityAudit(spec);

        expect(result.totalNodes).toBe(2);
        expect(result.totalConnections).toBe(1);
      });

      it('should have a valid timestamp in ISO format', () => {
        const spec = createSpec([]);
        const result = runSecurityAudit(spec);

        expect(() => new Date(result.timestamp)).not.toThrow();
        expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      });
    });

    describe('NET-001: Missing Firewall', () => {
      it('should detect missing firewall when external access exists', () => {
        const spec = createSpec([
          createNode('user-1', 'user', 'User'),
          createNode('web-1', 'web-server', 'Web Server'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'NET-001');
        expect(finding).toBeDefined();
        expect(finding?.severity).toBe('critical');
        expect(finding?.category).toBe('network-security');
      });

      it('should not report missing firewall when firewall exists', () => {
        const spec = createSpec([
          createNode('user-1', 'user', 'User'),
          createNode('fw-1', 'firewall', 'Firewall'),
          createNode('web-1', 'web-server', 'Web Server'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'NET-001');
        expect(finding).toBeUndefined();
      });

      it('should not report missing firewall when WAF exists', () => {
        const spec = createSpec([
          createNode('user-1', 'user', 'User'),
          createNode('waf-1', 'waf', 'WAF'),
          createNode('web-1', 'web-server', 'Web Server'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'NET-001');
        expect(finding).toBeUndefined();
      });

      it('should not report missing firewall when no external access', () => {
        const spec = createSpec([
          createNode('app-1', 'app-server', 'App Server'),
          createNode('db-1', 'db-server', 'Database'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'NET-001');
        expect(finding).toBeUndefined();
      });
    });

    describe('NET-002: Missing WAF for Web Tier', () => {
      it('should detect missing WAF when web server exists', () => {
        const spec = createSpec([
          createNode('web-1', 'web-server', 'Web Server'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'NET-002');
        expect(finding).toBeDefined();
        expect(finding?.severity).toBe('high');
        expect(finding?.affectedNodes).toContain('web-1');
      });

      it('should not report missing WAF when WAF exists', () => {
        const spec = createSpec([
          createNode('waf-1', 'waf', 'WAF'),
          createNode('web-1', 'web-server', 'Web Server'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'NET-002');
        expect(finding).toBeUndefined();
      });
    });

    describe('NET-003: Direct Database Access', () => {
      it('should detect direct database access from external sources', () => {
        const spec = createSpec(
          [
            createNode('user-1', 'user', 'User'),
            createNode('db-1', 'db-server', 'Database'),
          ],
          [{ source: 'user-1', target: 'db-1' }]
        );
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'NET-003');
        expect(finding).toBeDefined();
        expect(finding?.severity).toBe('critical');
        expect(finding?.affectedNodes).toContain('db-1');
        expect(finding?.affectedNodes).toContain('user-1');
      });

      it('should detect direct database access from internet', () => {
        const spec = createSpec(
          [
            createNode('internet-1', 'internet', 'Internet'),
            createNode('db-1', 'db-server', 'Database'),
          ],
          [{ source: 'internet-1', target: 'db-1' }]
        );
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'NET-003');
        expect(finding).toBeDefined();
      });

      it('should not report when database is accessed via app server', () => {
        const spec = createSpec(
          [
            createNode('user-1', 'user', 'User'),
            createNode('app-1', 'app-server', 'App Server'),
            createNode('db-1', 'db-server', 'Database'),
          ],
          [
            { source: 'user-1', target: 'app-1' },
            { source: 'app-1', target: 'db-1' },
          ]
        );
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'NET-003');
        expect(finding).toBeUndefined();
      });
    });

    describe('NET-004: Missing Load Balancer', () => {
      it('should detect missing load balancer when multiple web servers exist', () => {
        const spec = createSpec([
          createNode('web-1', 'web-server', 'Web Server 1'),
          createNode('web-2', 'web-server', 'Web Server 2'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'NET-004');
        expect(finding).toBeDefined();
        expect(finding?.severity).toBe('medium');
        expect(finding?.category).toBe('availability');
      });

      it('should not report when load balancer exists', () => {
        const spec = createSpec([
          createNode('lb-1', 'load-balancer', 'Load Balancer'),
          createNode('web-1', 'web-server', 'Web Server 1'),
          createNode('web-2', 'web-server', 'Web Server 2'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'NET-004');
        expect(finding).toBeUndefined();
      });

      it('should not report when only one web server exists', () => {
        const spec = createSpec([
          createNode('web-1', 'web-server', 'Web Server'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'NET-004');
        expect(finding).toBeUndefined();
      });
    });

    describe('ACC-001: Missing Authentication Layer', () => {
      it('should detect missing authentication when app server exists', () => {
        const spec = createSpec([
          createNode('app-1', 'app-server', 'App Server'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'ACC-001');
        expect(finding).toBeDefined();
        expect(finding?.severity).toBe('high');
        expect(finding?.category).toBe('access-control');
      });

      it('should not report when LDAP/AD exists', () => {
        const spec = createSpec([
          createNode('app-1', 'app-server', 'App Server'),
          createNode('ldap-1', 'ldap-ad', 'LDAP'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'ACC-001');
        expect(finding).toBeUndefined();
      });

      it('should not report when SSO exists', () => {
        const spec = createSpec([
          createNode('web-1', 'web-server', 'Web Server'),
          createNode('sso-1', 'sso', 'SSO'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'ACC-001');
        expect(finding).toBeUndefined();
      });

      it('should not report when IAM exists', () => {
        const spec = createSpec([
          createNode('app-1', 'app-server', 'App Server'),
          createNode('iam-1', 'iam', 'IAM'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'ACC-001');
        expect(finding).toBeUndefined();
      });
    });

    describe('ACC-002: No MFA Configured', () => {
      it('should detect missing MFA when SSO exists', () => {
        const spec = createSpec([
          createNode('sso-1', 'sso', 'SSO'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'ACC-002');
        expect(finding).toBeDefined();
        expect(finding?.severity).toBe('high');
        expect(finding?.affectedNodes).toContain('sso-1');
      });

      it('should detect missing MFA when VPN exists', () => {
        const spec = createSpec([
          createNode('vpn-1', 'vpn-gateway', 'VPN Gateway'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'ACC-002');
        expect(finding).toBeDefined();
        expect(finding?.affectedNodes).toContain('vpn-1');
      });

      it('should not report when MFA exists', () => {
        const spec = createSpec([
          createNode('sso-1', 'sso', 'SSO'),
          createNode('mfa-1', 'mfa', 'MFA'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'ACC-002');
        expect(finding).toBeUndefined();
      });
    });

    describe('DATA-001: Missing Encryption for Data at Rest', () => {
      it('should detect unencrypted database', () => {
        const spec = createSpec([
          createNode('db-1', 'db-server', 'Database'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'DATA-001');
        expect(finding).toBeDefined();
        expect(finding?.severity).toBe('medium');
        expect(finding?.category).toBe('data-protection');
      });

      it('should not report when encryption is mentioned in description', () => {
        const spec = createSpec([
          createNode('db-1', 'db-server', 'Database', {
            description: 'Encrypted at rest with AES-256',
          }),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'DATA-001');
        expect(finding).toBeUndefined();
      });

      it('should detect unencrypted storage', () => {
        const spec = createSpec([
          createNode('storage-1', 'san-nas', 'NAS Storage'),
          createNode('s3-1', 'object-storage', 'S3 Bucket'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'DATA-001');
        expect(finding).toBeDefined();
        expect(finding?.affectedNodes?.length).toBe(2);
      });
    });

    describe('DATA-002: Missing DLP', () => {
      it('should detect missing DLP when database exists', () => {
        const spec = createSpec([
          createNode('db-1', 'db-server', 'Database'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'DATA-002');
        expect(finding).toBeDefined();
        expect(finding?.severity).toBe('low');
      });

      it('should not report when DLP exists', () => {
        const spec = createSpec([
          createNode('db-1', 'db-server', 'Database'),
          createNode('dlp-1', 'dlp', 'DLP'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'DATA-002');
        expect(finding).toBeUndefined();
      });
    });

    describe('DATA-003: Missing Backup', () => {
      it('should detect missing backup when database exists', () => {
        const spec = createSpec([
          createNode('db-1', 'db-server', 'Database'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'DATA-003');
        expect(finding).toBeDefined();
        expect(finding?.severity).toBe('high');
        expect(finding?.category).toBe('availability');
      });

      it('should not report when backup exists', () => {
        const spec = createSpec([
          createNode('db-1', 'db-server', 'Database'),
          createNode('backup-1', 'backup', 'Backup'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'DATA-003');
        expect(finding).toBeUndefined();
      });
    });

    describe('AVAIL-001: Single Point of Failure - Database', () => {
      it('should detect single database as SPOF', () => {
        const spec = createSpec([
          createNode('db-1', 'db-server', 'Database'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'AVAIL-001');
        expect(finding).toBeDefined();
        expect(finding?.severity).toBe('medium');
      });

      it('should not report when multiple databases exist', () => {
        const spec = createSpec([
          createNode('db-1', 'db-server', 'Primary DB'),
          createNode('db-2', 'db-server', 'Replica DB'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'AVAIL-001');
        expect(finding).toBeUndefined();
      });
    });

    describe('AVAIL-002: No CDN for Static Content', () => {
      it('should detect missing CDN when web server and internet exist', () => {
        const spec = createSpec([
          createNode('internet-1', 'internet', 'Internet'),
          createNode('web-1', 'web-server', 'Web Server'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'AVAIL-002');
        expect(finding).toBeDefined();
        expect(finding?.severity).toBe('low');
      });

      it('should not report when CDN exists', () => {
        const spec = createSpec([
          createNode('internet-1', 'internet', 'Internet'),
          createNode('cdn-1', 'cdn', 'CDN'),
          createNode('web-1', 'web-server', 'Web Server'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'AVAIL-002');
        expect(finding).toBeUndefined();
      });
    });

    describe('COMP-001: Missing IDS/IPS', () => {
      it('should detect missing IDS/IPS when firewall exists', () => {
        const spec = createSpec([
          createNode('fw-1', 'firewall', 'Firewall'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'COMP-001');
        expect(finding).toBeDefined();
        expect(finding?.severity).toBe('medium');
        expect(finding?.category).toBe('compliance');
      });

      it('should not report when IDS/IPS exists', () => {
        const spec = createSpec([
          createNode('fw-1', 'firewall', 'Firewall'),
          createNode('ids-1', 'ids-ips', 'IDS/IPS'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'COMP-001');
        expect(finding).toBeUndefined();
      });
    });

    describe('COMP-002: Missing NAC', () => {
      it('should detect missing NAC when internal network exists', () => {
        const spec = createSpec([
          createNode('app-1', 'app-server', 'App Server', { zone: 'internal' }),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'COMP-002');
        expect(finding).toBeDefined();
        expect(finding?.severity).toBe('low');
      });

      it('should not report when NAC exists', () => {
        const spec = createSpec([
          createNode('app-1', 'app-server', 'App Server'),
          createNode('nac-1', 'nac', 'NAC'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'COMP-002');
        expect(finding).toBeUndefined();
      });
    });

    describe('BP-001: Missing Cache Layer', () => {
      it('should suggest cache layer when DB and web app exist', () => {
        const spec = createSpec([
          createNode('web-1', 'web-server', 'Web Server'),
          createNode('db-1', 'db-server', 'Database'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'BP-001');
        expect(finding).toBeDefined();
        expect(finding?.severity).toBe('info');
        expect(finding?.category).toBe('best-practice');
      });

      it('should not report when cache exists', () => {
        const spec = createSpec([
          createNode('web-1', 'web-server', 'Web Server'),
          createNode('cache-1', 'cache', 'Redis Cache'),
          createNode('db-1', 'db-server', 'Database'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'BP-001');
        expect(finding).toBeUndefined();
      });
    });

    describe('BP-002: No DNS Configured', () => {
      it('should suggest DNS when multiple servers exist', () => {
        const spec = createSpec([
          createNode('web-1', 'web-server', 'Web Server 1'),
          createNode('web-2', 'web-server', 'Web Server 2'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'BP-002');
        expect(finding).toBeDefined();
        expect(finding?.severity).toBe('info');
      });

      it('should not report when DNS exists', () => {
        const spec = createSpec([
          createNode('dns-1', 'dns', 'DNS'),
          createNode('web-1', 'web-server', 'Web Server 1'),
          createNode('app-1', 'app-server', 'App Server'),
        ]);
        const result = runSecurityAudit(spec);

        const finding = result.findings.find((f) => f.id === 'BP-002');
        expect(finding).toBeUndefined();
      });
    });

    describe('Score Calculation', () => {
      it('should return 100 when no issues found', () => {
        const spec = createSpec([
          createNode('fw-1', 'firewall', 'Firewall'),
          createNode('waf-1', 'waf', 'WAF'),
          createNode('ids-1', 'ids-ips', 'IDS/IPS'),
          createNode('lb-1', 'load-balancer', 'LB'),
          createNode('cdn-1', 'cdn', 'CDN'),
          createNode('web-1', 'web-server', 'Web'),
          createNode('app-1', 'app-server', 'App'),
          createNode('cache-1', 'cache', 'Cache'),
          createNode('db-1', 'db-server', 'DB', { description: 'Encrypted storage' }),
          createNode('db-2', 'db-server', 'DB Replica', { description: 'Encrypted storage' }),
          createNode('backup-1', 'backup', 'Backup'),
          createNode('dlp-1', 'dlp', 'DLP'),
          createNode('sso-1', 'sso', 'SSO'),
          createNode('mfa-1', 'mfa', 'MFA'),
          createNode('nac-1', 'nac', 'NAC'),
          createNode('dns-1', 'dns', 'DNS'),
        ]);
        const result = runSecurityAudit(spec);

        expect(result.score).toBe(100);
        expect(result.findings.length).toBe(0);
      });

      it('should decrease score for critical findings', () => {
        const spec = createSpec([
          createNode('user-1', 'user', 'User'),
          createNode('db-1', 'db-server', 'Database'),
        ], [{ source: 'user-1', target: 'db-1' }]);
        const result = runSecurityAudit(spec);

        expect(result.score).toBeLessThan(100);
        const criticalFindings = result.findings.filter((f) => f.severity === 'critical');
        expect(criticalFindings.length).toBeGreaterThan(0);
      });

      it('should not return negative score', () => {
        // Create a spec with many vulnerabilities
        const spec = createSpec([
          createNode('user-1', 'user', 'User'),
          createNode('internet-1', 'internet', 'Internet'),
          createNode('web-1', 'web-server', 'Web Server 1'),
          createNode('web-2', 'web-server', 'Web Server 2'),
          createNode('app-1', 'app-server', 'App Server'),
          createNode('db-1', 'db-server', 'Database'),
          createNode('storage-1', 'san-nas', 'Storage'),
          createNode('sso-1', 'sso', 'SSO'),
          createNode('vpn-1', 'vpn-gateway', 'VPN'),
          createNode('fw-1', 'firewall', 'Firewall'),
        ], [
          { source: 'user-1', target: 'db-1' },
        ]);
        const result = runSecurityAudit(spec);

        expect(result.score).toBeGreaterThanOrEqual(0);
      });
    });

    describe('Summary Generation', () => {
      it('should correctly count findings by severity', () => {
        const spec = createSpec([
          createNode('user-1', 'user', 'User'),
          createNode('web-1', 'web-server', 'Web Server'),
        ]);
        const result = runSecurityAudit(spec);

        const summary = result.summary;
        expect(typeof summary.critical).toBe('number');
        expect(typeof summary.high).toBe('number');
        expect(typeof summary.medium).toBe('number');
        expect(typeof summary.low).toBe('number');
        expect(typeof summary.info).toBe('number');
        expect(typeof summary.passed).toBe('number');
      });

      it('should count passed checks correctly', () => {
        const spec = createSpec([
          createNode('fw-1', 'firewall', 'Firewall'),
          createNode('ids-1', 'ids-ips', 'IDS/IPS'),
        ]);
        const result = runSecurityAudit(spec);

        const totalFindings =
          result.summary.critical +
          result.summary.high +
          result.summary.medium +
          result.summary.low +
          result.summary.info;

        expect(totalFindings).toBe(result.findings.length);
        expect(result.summary.passed).toBeGreaterThanOrEqual(0);
      });
    });

    describe('Findings Sorting', () => {
      it('should sort findings by severity (critical first)', () => {
        const spec = createSpec([
          createNode('user-1', 'user', 'User'),
          createNode('web-1', 'web-server', 'Web Server'),
          createNode('db-1', 'db-server', 'Database'),
        ], [{ source: 'user-1', target: 'db-1' }]);
        const result = runSecurityAudit(spec);

        if (result.findings.length >= 2) {
          const severityOrder = ['critical', 'high', 'medium', 'low', 'info'];
          for (let i = 0; i < result.findings.length - 1; i++) {
            const currentOrder = severityOrder.indexOf(result.findings[i].severity);
            const nextOrder = severityOrder.indexOf(result.findings[i + 1].severity);
            expect(currentOrder).toBeLessThanOrEqual(nextOrder);
          }
        }
      });
    });
  });

  describe('getSeverityColor', () => {
    it('should return correct color for critical severity', () => {
      expect(getSeverityColor('critical')).toBe('#DC2626');
    });

    it('should return correct color for high severity', () => {
      expect(getSeverityColor('high')).toBe('#EA580C');
    });

    it('should return correct color for medium severity', () => {
      expect(getSeverityColor('medium')).toBe('#D97706');
    });

    it('should return correct color for low severity', () => {
      expect(getSeverityColor('low')).toBe('#2563EB');
    });

    it('should return correct color for info severity', () => {
      expect(getSeverityColor('info')).toBe('#6B7280');
    });

    it('should return default color for unknown severity', () => {
      const result = getSeverityColor('unknown' as AuditSeverity);
      expect(result).toBe('#6B7280');
    });
  });

  describe('getSeverityBadge', () => {
    it('should return correct badge for critical severity', () => {
      expect(getSeverityBadge('critical')).toBe('Critical');
    });

    it('should return correct badge for high severity', () => {
      expect(getSeverityBadge('high')).toBe('High');
    });

    it('should return correct badge for medium severity', () => {
      expect(getSeverityBadge('medium')).toBe('Medium');
    });

    it('should return correct badge for low severity', () => {
      expect(getSeverityBadge('low')).toBe('Low');
    });

    it('should return correct badge for info severity', () => {
      expect(getSeverityBadge('info')).toBe('Info');
    });

    it('should return Unknown for unknown severity', () => {
      const result = getSeverityBadge('unknown' as AuditSeverity);
      expect(result).toBe('Unknown');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty spec gracefully', () => {
      const spec = createSpec([]);
      const result = runSecurityAudit(spec);

      expect(result.totalNodes).toBe(0);
      expect(result.totalConnections).toBe(0);
      expect(result.score).toBe(100);
    });

    it('should handle spec with only external nodes', () => {
      const spec = createSpec([
        createNode('user-1', 'user', 'User'),
        createNode('internet-1', 'internet', 'Internet'),
      ]);
      const result = runSecurityAudit(spec);

      expect(result.findings.length).toBeGreaterThan(0);
    });

    it('should handle spec with only internal nodes', () => {
      const spec = createSpec([
        createNode('app-1', 'app-server', 'App Server'),
        createNode('db-1', 'db-server', 'Database'),
      ]);
      const result = runSecurityAudit(spec);

      // Should not trigger firewall rule but may trigger other rules
      const firewallFinding = result.findings.find((f) => f.id === 'NET-001');
      expect(firewallFinding).toBeUndefined();
    });

    it('should handle connections in both directions', () => {
      const spec = createSpec(
        [
          createNode('db-1', 'db-server', 'Database'),
          createNode('user-1', 'user', 'User'),
        ],
        [{ source: 'db-1', target: 'user-1' }] // Reverse direction
      );
      const result = runSecurityAudit(spec);

      const finding = result.findings.find((f) => f.id === 'NET-003');
      expect(finding).toBeDefined();
    });
  });
});
