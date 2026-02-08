/**
 * Audit Report Generator Tests
 *
 * Tests for the audit report generation system that creates reports
 * in various formats (Markdown, HTML, JSON, Text).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateAuditReport,
  type ReportFormat,
  type ReportOptions,
} from '@/lib/audit/auditReportGenerator';
import {
  type SecurityAuditResult,
  type AuditFinding,
  type AuditSeverity,
  type AuditSummary,
} from '@/lib/audit/securityAudit';

describe('AuditReportGenerator', () => {
  // Helper to create a mock audit result
  const createMockResult = (options: {
    findings?: AuditFinding[];
    score?: number;
    specName?: string;
    summary?: Partial<AuditSummary>;
  } = {}): SecurityAuditResult => {
    const defaultSummary: AuditSummary = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
      passed: 10,
    };

    const findings = options.findings || [];

    // Calculate summary from findings if not provided
    const calculatedSummary = { ...defaultSummary };
    findings.forEach((f) => {
      calculatedSummary[f.severity]++;
    });
    calculatedSummary.passed = 10 - findings.length;

    return {
      timestamp: '2026-02-08T10:00:00.000Z',
      specName: options.specName,
      totalNodes: 5,
      totalConnections: 4,
      findings,
      score: options.score ?? 100 - findings.length * 10,
      summary: { ...calculatedSummary, ...options.summary },
    };
  };

  // Helper to create a mock finding
  const createMockFinding = (
    id: string,
    severity: AuditSeverity,
    options: Partial<AuditFinding> = {}
  ): AuditFinding => ({
    id,
    title: `Test Finding ${id}`,
    description: `Description for ${id}`,
    severity,
    category: 'network-security',
    recommendation: `Recommendation for ${id}`,
    ...options,
  });

  describe('generateAuditReport - Markdown Format', () => {
    describe('Basic Structure', () => {
      it('should generate valid markdown report', () => {
        const result = createMockResult();
        const report = generateAuditReport(result, { format: 'markdown' });

        expect(report).toContain('# 보안 감사 리포트');
        expect(report).toContain('## 요약');
        expect(report).toContain('보안 점수');
      });

      it('should include timestamp in Korean locale', () => {
        const result = createMockResult();
        const report = generateAuditReport(result, { format: 'markdown' });

        expect(report).toContain('생성 일시:');
      });

      it('should include spec name when provided', () => {
        const result = createMockResult({ specName: 'Test Architecture' });
        const report = generateAuditReport(result, { format: 'markdown' });

        expect(report).toContain('아키텍처: Test Architecture');
      });

      it('should include summary table', () => {
        const result = createMockResult();
        const report = generateAuditReport(result, { format: 'markdown' });

        expect(report).toContain('| 항목 | 값 |');
        expect(report).toContain('| 총 노드 수 | 5 |');
        expect(report).toContain('| 총 연결 수 | 4 |');
      });
    });

    describe('Score Interpretation', () => {
      it('should show excellent score interpretation for 90+', () => {
        const result = createMockResult({ score: 95 });
        const report = generateAuditReport(result, { format: 'markdown' });

        expect(report).toContain('우수');
      });

      it('should show good score interpretation for 70-89', () => {
        const result = createMockResult({ score: 75 });
        const report = generateAuditReport(result, { format: 'markdown' });

        expect(report).toContain('양호');
      });

      it('should show warning score interpretation for 50-69', () => {
        const result = createMockResult({ score: 55 });
        const report = generateAuditReport(result, { format: 'markdown' });

        expect(report).toContain('주의');
      });

      it('should show danger score interpretation for below 50', () => {
        const result = createMockResult({ score: 30 });
        const report = generateAuditReport(result, { format: 'markdown' });

        expect(report).toContain('위험');
      });
    });

    describe('Severity Summary', () => {
      it('should include severity counts with emojis', () => {
        const result = createMockResult({
          summary: { critical: 1, high: 2, medium: 3, low: 1, info: 0, passed: 3 },
        });
        const report = generateAuditReport(result, { format: 'markdown' });

        expect(report).toContain('Critical: 1');
        expect(report).toContain('High: 2');
        expect(report).toContain('Medium: 3');
        expect(report).toContain('Low: 1');
        expect(report).toContain('Info: 0');
        expect(report).toContain('Passed: 3');
      });
    });

    describe('Findings Section', () => {
      it('should include findings when present', () => {
        const result = createMockResult({
          findings: [createMockFinding('NET-001', 'critical')],
        });
        const report = generateAuditReport(result, { format: 'markdown' });

        expect(report).toContain('## 발견된 문제');
        expect(report).toContain('NET-001');
        expect(report).toContain('Test Finding NET-001');
      });

      it('should group findings by severity', () => {
        const result = createMockResult({
          findings: [
            createMockFinding('NET-001', 'critical'),
            createMockFinding('ACC-001', 'high'),
          ],
        });
        const report = generateAuditReport(result, { format: 'markdown' });

        expect(report).toContain('### 🔴 Critical');
        expect(report).toContain('### 🟠 High');
      });

      it('should include affected nodes when present', () => {
        const result = createMockResult({
          findings: [
            createMockFinding('NET-001', 'critical', {
              affectedNodes: ['web-1', 'app-1'],
            }),
          ],
        });
        const report = generateAuditReport(result, { format: 'markdown' });

        expect(report).toContain('**영향받는 노드**: web-1, app-1');
      });

      it('should include recommendations when includeRecommendations is true', () => {
        const result = createMockResult({
          findings: [createMockFinding('NET-001', 'critical')],
        });
        const report = generateAuditReport(result, {
          format: 'markdown',
          includeRecommendations: true,
        });

        expect(report).toContain('**권장사항**:');
        expect(report).toContain('Recommendation for NET-001');
      });

      it('should exclude recommendations when includeRecommendations is false', () => {
        const result = createMockResult({
          findings: [createMockFinding('NET-001', 'critical')],
        });
        const report = generateAuditReport(result, {
          format: 'markdown',
          includeRecommendations: false,
        });

        expect(report).not.toContain('**권장사항**:');
      });

      it('should include references when includeReferences is true', () => {
        const result = createMockResult({
          findings: [
            createMockFinding('NET-001', 'critical', {
              references: ['CIS Control 13', 'NIST SP 800-41'],
            }),
          ],
        });
        const report = generateAuditReport(result, {
          format: 'markdown',
          includeReferences: true,
        });

        expect(report).toContain('**참조**:');
        expect(report).toContain('CIS Control 13');
        expect(report).toContain('NIST SP 800-41');
      });

      it('should exclude references when includeReferences is false', () => {
        const result = createMockResult({
          findings: [
            createMockFinding('NET-001', 'critical', {
              references: ['CIS Control 13'],
            }),
          ],
        });
        const report = generateAuditReport(result, {
          format: 'markdown',
          includeReferences: false,
        });

        expect(report).not.toContain('**참조**:');
      });
    });

    describe('Footer', () => {
      it('should include InfraFlow footer', () => {
        const result = createMockResult();
        const report = generateAuditReport(result, { format: 'markdown' });

        expect(report).toContain('InfraFlow 보안 감사 도구');
      });
    });
  });

  describe('generateAuditReport - HTML Format', () => {
    describe('Basic Structure', () => {
      it('should generate valid HTML', () => {
        const result = createMockResult();
        const report = generateAuditReport(result, { format: 'html' });

        expect(report).toContain('<!DOCTYPE html>');
        expect(report).toContain('<html lang="ko">');
        expect(report).toContain('</html>');
      });

      it('should include proper meta tags', () => {
        const result = createMockResult();
        const report = generateAuditReport(result, { format: 'html' });

        expect(report).toContain('<meta charset="UTF-8">');
        expect(report).toContain('viewport');
      });

      it('should include title', () => {
        const result = createMockResult();
        const report = generateAuditReport(result, { format: 'html' });

        expect(report).toContain('<title>보안 감사 리포트</title>');
      });

      it('should include inline styles', () => {
        const result = createMockResult();
        const report = generateAuditReport(result, { format: 'html' });

        expect(report).toContain('<style>');
        expect(report).toContain('</style>');
      });
    });

    describe('Score Display', () => {
      it('should display score prominently', () => {
        const result = createMockResult({ score: 85 });
        const report = generateAuditReport(result, { format: 'html' });

        expect(report).toContain('85');
        expect(report).toContain('/ 100점');
      });

      it('should use green color for high scores', () => {
        const result = createMockResult({ score: 80 });
        const report = generateAuditReport(result, { format: 'html' });

        expect(report).toContain('#22C55E');
      });

      it('should use yellow color for medium scores', () => {
        const result = createMockResult({ score: 60 });
        const report = generateAuditReport(result, { format: 'html' });

        expect(report).toContain('#EAB308');
      });

      it('should use red color for low scores', () => {
        const result = createMockResult({ score: 40 });
        const report = generateAuditReport(result, { format: 'html' });

        expect(report).toContain('#EF4444');
      });
    });

    describe('Summary Grid', () => {
      it('should include severity counts', () => {
        const result = createMockResult({
          summary: { critical: 2, high: 1, medium: 3, low: 1, info: 0, passed: 3 },
        });
        const report = generateAuditReport(result, { format: 'html' });

        expect(report).toContain('Critical');
        expect(report).toContain('High');
        expect(report).toContain('Medium');
        expect(report).toContain('Low');
        expect(report).toContain('Info');
        expect(report).toContain('Passed');
      });
    });

    describe('Findings Display', () => {
      it('should display findings with proper styling', () => {
        const result = createMockResult({
          findings: [createMockFinding('NET-001', 'critical')],
        });
        const report = generateAuditReport(result, { format: 'html' });

        expect(report).toContain('class="finding critical"');
        expect(report).toContain('NET-001');
      });

      it('should include severity badges', () => {
        const result = createMockResult({
          findings: [createMockFinding('NET-001', 'high')],
        });
        const report = generateAuditReport(result, { format: 'html' });

        expect(report).toContain('class="badge high"');
        expect(report).toContain('High');
      });

      it('should display recommendations in styled box', () => {
        const result = createMockResult({
          findings: [createMockFinding('NET-001', 'critical')],
        });
        const report = generateAuditReport(result, {
          format: 'html',
          includeRecommendations: true,
        });

        expect(report).toContain('class="recommendation"');
        expect(report).toContain('권장사항');
      });

      it('should show no issues message when empty', () => {
        const result = createMockResult({ findings: [] });
        const report = generateAuditReport(result, { format: 'html' });

        expect(report).toContain('발견된 보안 문제가 없습니다');
      });
    });

    describe('Footer', () => {
      it('should include footer', () => {
        const result = createMockResult();
        const report = generateAuditReport(result, { format: 'html' });

        expect(report).toContain('<footer>');
        expect(report).toContain('InfraFlow');
      });
    });
  });

  describe('generateAuditReport - JSON Format', () => {
    it('should generate valid JSON', () => {
      const result = createMockResult();
      const report = generateAuditReport(result, { format: 'json' });

      expect(() => JSON.parse(report)).not.toThrow();
    });

    it('should include all result properties', () => {
      const result = createMockResult({ specName: 'Test', score: 85 });
      const report = generateAuditReport(result, { format: 'json' });
      const parsed = JSON.parse(report);

      expect(parsed.timestamp).toBeDefined();
      expect(parsed.specName).toBe('Test');
      expect(parsed.totalNodes).toBe(5);
      expect(parsed.totalConnections).toBe(4);
      expect(parsed.score).toBe(85);
      expect(parsed.summary).toBeDefined();
      expect(parsed.findings).toBeDefined();
    });

    it('should include findings array', () => {
      const result = createMockResult({
        findings: [createMockFinding('NET-001', 'critical')],
      });
      const report = generateAuditReport(result, { format: 'json' });
      const parsed = JSON.parse(report);

      expect(Array.isArray(parsed.findings)).toBe(true);
      expect(parsed.findings.length).toBe(1);
      expect(parsed.findings[0].id).toBe('NET-001');
    });

    it('should be properly formatted with indentation', () => {
      const result = createMockResult();
      const report = generateAuditReport(result, { format: 'json' });

      expect(report).toContain('\n');
      expect(report).toContain('  '); // 2-space indentation
    });
  });

  describe('generateAuditReport - Text Format', () => {
    describe('Basic Structure', () => {
      it('should generate text report with header', () => {
        const result = createMockResult();
        const report = generateAuditReport(result, { format: 'text' });

        expect(report).toContain('보안 감사 리포트');
        expect(report).toContain('='.repeat(60));
      });

      it('should include timestamp', () => {
        const result = createMockResult();
        const report = generateAuditReport(result, { format: 'text' });

        expect(report).toContain('생성 일시:');
      });

      it('should include score', () => {
        const result = createMockResult({ score: 75 });
        const report = generateAuditReport(result, { format: 'text' });

        expect(report).toContain('보안 점수: 75/100');
      });
    });

    describe('Summary Section', () => {
      it('should include severity summary', () => {
        const result = createMockResult({
          summary: { critical: 1, high: 2, medium: 0, low: 1, info: 0, passed: 6 },
        });
        const report = generateAuditReport(result, { format: 'text' });

        expect(report).toContain('Critical: 1');
        expect(report).toContain('High:     2');
        expect(report).toContain('Passed:   6');
      });
    });

    describe('Findings Section', () => {
      it('should list findings with severity', () => {
        const result = createMockResult({
          findings: [createMockFinding('NET-001', 'critical')],
        });
        const report = generateAuditReport(result, { format: 'text' });

        expect(report).toContain('[CRITICAL] NET-001');
        expect(report).toContain('설명:');
      });

      it('should include recommendations when enabled', () => {
        const result = createMockResult({
          findings: [createMockFinding('NET-001', 'critical')],
        });
        const report = generateAuditReport(result, {
          format: 'text',
          includeRecommendations: true,
        });

        expect(report).toContain('권장사항:');
      });

      it('should exclude recommendations when disabled', () => {
        const result = createMockResult({
          findings: [createMockFinding('NET-001', 'critical')],
        });
        const report = generateAuditReport(result, {
          format: 'text',
          includeRecommendations: false,
        });

        expect(report).not.toContain('권장사항:');
      });
    });
  });

  describe('Default Options', () => {
    it('should use markdown as default format', () => {
      const result = createMockResult();
      const report = generateAuditReport(result);

      expect(report).toContain('# 보안 감사 리포트');
    });

    it('should include recommendations by default', () => {
      const result = createMockResult({
        findings: [createMockFinding('NET-001', 'critical')],
      });
      const report = generateAuditReport(result);

      expect(report).toContain('**권장사항**:');
    });

    it('should include references by default', () => {
      const result = createMockResult({
        findings: [
          createMockFinding('NET-001', 'critical', {
            references: ['CIS Control 13'],
          }),
        ],
      });
      const report = generateAuditReport(result);

      expect(report).toContain('**참조**:');
    });
  });

  describe('Category Labels', () => {
    it('should translate category labels to Korean', () => {
      const result = createMockResult({
        findings: [
          createMockFinding('NET-001', 'critical', {
            category: 'network-security',
          }),
        ],
      });
      const report = generateAuditReport(result, { format: 'markdown' });

      expect(report).toContain('네트워크 보안');
    });

    it('should handle access-control category', () => {
      const result = createMockResult({
        findings: [
          createMockFinding('ACC-001', 'high', {
            category: 'access-control',
          }),
        ],
      });
      const report = generateAuditReport(result, { format: 'markdown' });

      expect(report).toContain('접근 제어');
    });

    it('should handle data-protection category', () => {
      const result = createMockResult({
        findings: [
          createMockFinding('DATA-001', 'medium', {
            category: 'data-protection',
          }),
        ],
      });
      const report = generateAuditReport(result, { format: 'markdown' });

      expect(report).toContain('데이터 보호');
    });

    it('should handle availability category', () => {
      const result = createMockResult({
        findings: [
          createMockFinding('AVAIL-001', 'medium', {
            category: 'availability',
          }),
        ],
      });
      const report = generateAuditReport(result, { format: 'markdown' });

      expect(report).toContain('가용성');
    });

    it('should handle compliance category', () => {
      const result = createMockResult({
        findings: [
          createMockFinding('COMP-001', 'low', {
            category: 'compliance',
          }),
        ],
      });
      const report = generateAuditReport(result, { format: 'markdown' });

      expect(report).toContain('컴플라이언스');
    });

    it('should handle best-practice category', () => {
      const result = createMockResult({
        findings: [
          createMockFinding('BP-001', 'info', {
            category: 'best-practice',
          }),
        ],
      });
      const report = generateAuditReport(result, { format: 'markdown' });

      expect(report).toContain('모범 사례');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty findings array', () => {
      const result = createMockResult({ findings: [] });
      const report = generateAuditReport(result, { format: 'markdown' });

      expect(report).toBeDefined();
      expect(report.length).toBeGreaterThan(0);
      expect(report).not.toContain('## 발견된 문제');
    });

    it('should handle findings without affected nodes', () => {
      const result = createMockResult({
        findings: [createMockFinding('NET-001', 'critical')],
      });
      const report = generateAuditReport(result, { format: 'markdown' });

      expect(report).not.toContain('**영향받는 노드**:');
    });

    it('should handle findings with empty affected nodes', () => {
      const result = createMockResult({
        findings: [
          createMockFinding('NET-001', 'critical', { affectedNodes: [] }),
        ],
      });
      const report = generateAuditReport(result, { format: 'markdown' });

      expect(report).not.toContain('**영향받는 노드**:');
    });

    it('should handle findings without references', () => {
      const result = createMockResult({
        findings: [createMockFinding('NET-001', 'critical')],
      });
      const report = generateAuditReport(result, {
        format: 'markdown',
        includeReferences: true,
      });

      expect(report).not.toContain('**참조**:');
    });

    it('should handle findings with empty references', () => {
      const result = createMockResult({
        findings: [
          createMockFinding('NET-001', 'critical', { references: [] }),
        ],
      });
      const report = generateAuditReport(result, {
        format: 'markdown',
        includeReferences: true,
      });

      expect(report).not.toContain('**참조**:');
    });

    it('should handle result without specName', () => {
      const result = createMockResult();
      const report = generateAuditReport(result, { format: 'markdown' });

      expect(report).not.toContain('아키텍처:');
    });

    it('should handle all severity levels', () => {
      const result = createMockResult({
        findings: [
          createMockFinding('F1', 'critical'),
          createMockFinding('F2', 'high'),
          createMockFinding('F3', 'medium'),
          createMockFinding('F4', 'low'),
          createMockFinding('F5', 'info'),
        ],
      });
      const report = generateAuditReport(result, { format: 'markdown' });

      expect(report).toContain('🔴 Critical');
      expect(report).toContain('🟠 High');
      expect(report).toContain('🟡 Medium');
      expect(report).toContain('🔵 Low');
      expect(report).toContain('⚪ Info');
    });

    it('should handle unknown format gracefully (defaults to markdown)', () => {
      const result = createMockResult();
      const report = generateAuditReport(result, { format: 'unknown' as ReportFormat });

      expect(report).toContain('# 보안 감사 리포트');
    });
  });

  describe('Integration with SecurityAuditResult', () => {
    it('should work with realistic audit result structure', () => {
      const realisticResult: SecurityAuditResult = {
        timestamp: new Date().toISOString(),
        specName: 'Production Infrastructure',
        totalNodes: 15,
        totalConnections: 20,
        findings: [
          {
            id: 'NET-001',
            title: '방화벽 누락',
            description: '외부 접근 경로에 방화벽이 없습니다.',
            severity: 'critical',
            category: 'network-security',
            affectedNodes: ['user-1', 'internet-1'],
            recommendation: '외부 트래픽을 필터링하기 위해 방화벽을 추가하세요.',
            references: ['CIS Control 13', 'NIST SP 800-41'],
          },
          {
            id: 'ACC-001',
            title: '인증 레이어 누락',
            description: '애플리케이션 서버가 있지만 인증 시스템이 없습니다.',
            severity: 'high',
            category: 'access-control',
            affectedNodes: ['web-1', 'app-1'],
            recommendation: 'LDAP/AD, SSO, 또는 IAM 시스템을 추가하여 인증을 구현하세요.',
          },
        ],
        score: 65,
        summary: {
          critical: 1,
          high: 1,
          medium: 0,
          low: 0,
          info: 0,
          passed: 8,
        },
      };

      const mdReport = generateAuditReport(realisticResult, { format: 'markdown' });
      const htmlReport = generateAuditReport(realisticResult, { format: 'html' });
      const jsonReport = generateAuditReport(realisticResult, { format: 'json' });
      const textReport = generateAuditReport(realisticResult, { format: 'text' });

      // Markdown includes specName
      expect(mdReport).toContain('Production Infrastructure');
      // HTML includes timestamp and score
      expect(htmlReport).toContain('보안 감사 리포트');
      expect(htmlReport).toContain('65');
      // JSON includes specName
      expect(JSON.parse(jsonReport).specName).toBe('Production Infrastructure');
      expect(textReport).toBeDefined();
    });
  });
});
