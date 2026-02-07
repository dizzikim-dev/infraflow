import {
  SecurityAuditResult,
  AuditFinding,
  AuditSeverity,
  getSeverityBadge,
  getSeverityColor,
} from './securityAudit';

/**
 * Report format options
 */
export type ReportFormat = 'markdown' | 'html' | 'json' | 'text';

/**
 * Report options
 */
export interface ReportOptions {
  format: ReportFormat;
  includeRecommendations?: boolean;
  includeReferences?: boolean;
  language?: 'ko' | 'en';
}

/**
 * Generate audit report in specified format
 */
export function generateAuditReport(
  result: SecurityAuditResult,
  options: ReportOptions = { format: 'markdown' }
): string {
  const { format, includeRecommendations = true, includeReferences = true } = options;

  switch (format) {
    case 'markdown':
      return generateMarkdownReport(result, includeRecommendations, includeReferences);
    case 'html':
      return generateHTMLReport(result, includeRecommendations, includeReferences);
    case 'json':
      return JSON.stringify(result, null, 2);
    case 'text':
      return generateTextReport(result, includeRecommendations);
    default:
      return generateMarkdownReport(result, includeRecommendations, includeReferences);
  }
}

/**
 * Generate Markdown report
 */
function generateMarkdownReport(
  result: SecurityAuditResult,
  includeRecommendations: boolean,
  includeReferences: boolean
): string {
  const lines: string[] = [];

  // Header
  lines.push('# 보안 감사 리포트');
  lines.push('');
  lines.push(`생성 일시: ${new Date(result.timestamp).toLocaleString('ko-KR')}`);
  if (result.specName) {
    lines.push(`아키텍처: ${result.specName}`);
  }
  lines.push('');

  // Summary
  lines.push('## 요약');
  lines.push('');
  lines.push(`| 항목 | 값 |`);
  lines.push(`|------|-----|`);
  lines.push(`| 보안 점수 | **${result.score}/100** |`);
  lines.push(`| 총 노드 수 | ${result.totalNodes} |`);
  lines.push(`| 총 연결 수 | ${result.totalConnections} |`);
  lines.push(`| 발견된 문제 | ${result.findings.length} |`);
  lines.push('');

  // Findings by severity
  lines.push('### 심각도별 현황');
  lines.push('');
  lines.push(`- 🔴 Critical: ${result.summary.critical}`);
  lines.push(`- 🟠 High: ${result.summary.high}`);
  lines.push(`- 🟡 Medium: ${result.summary.medium}`);
  lines.push(`- 🔵 Low: ${result.summary.low}`);
  lines.push(`- ⚪ Info: ${result.summary.info}`);
  lines.push(`- ✅ Passed: ${result.summary.passed}`);
  lines.push('');

  // Score interpretation
  lines.push('### 점수 해석');
  lines.push('');
  if (result.score >= 90) {
    lines.push('✅ **우수**: 보안 구성이 잘 되어 있습니다.');
  } else if (result.score >= 70) {
    lines.push('⚠️ **양호**: 일부 개선이 필요합니다.');
  } else if (result.score >= 50) {
    lines.push('⚠️ **주의**: 여러 보안 문제가 발견되었습니다.');
  } else {
    lines.push('🚨 **위험**: 즉각적인 보안 개선이 필요합니다.');
  }
  lines.push('');

  // Detailed findings
  if (result.findings.length > 0) {
    lines.push('## 발견된 문제');
    lines.push('');

    const groupedFindings = groupFindingsBySeverity(result.findings);

    for (const [severity, findings] of Object.entries(groupedFindings)) {
      if (findings.length === 0) continue;

      const emoji = getSeverityEmoji(severity as AuditSeverity);
      lines.push(`### ${emoji} ${getSeverityBadge(severity as AuditSeverity)} (${findings.length})`);
      lines.push('');

      for (const finding of findings) {
        lines.push(`#### ${finding.id}: ${finding.title}`);
        lines.push('');
        lines.push(`**설명**: ${finding.description}`);
        lines.push('');
        lines.push(`**분류**: ${getCategoryLabel(finding.category)}`);
        lines.push('');

        if (finding.affectedNodes && finding.affectedNodes.length > 0) {
          lines.push(`**영향받는 노드**: ${finding.affectedNodes.join(', ')}`);
          lines.push('');
        }

        if (includeRecommendations) {
          lines.push(`**권장사항**: ${finding.recommendation}`);
          lines.push('');
        }

        if (includeReferences && finding.references && finding.references.length > 0) {
          lines.push(`**참조**: ${finding.references.join(', ')}`);
          lines.push('');
        }

        lines.push('---');
        lines.push('');
      }
    }
  }

  // Footer
  lines.push('');
  lines.push('---');
  lines.push('*이 리포트는 InfraFlow 보안 감사 도구로 자동 생성되었습니다.*');

  return lines.join('\n');
}

/**
 * Generate HTML report
 */
function generateHTMLReport(
  result: SecurityAuditResult,
  includeRecommendations: boolean,
  includeReferences: boolean
): string {
  const scoreColor = result.score >= 70 ? '#22C55E' : result.score >= 50 ? '#EAB308' : '#EF4444';

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>보안 감사 리포트</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
      background: #0a0a0b;
      color: #e4e4e7;
    }
    h1 { color: #fff; border-bottom: 2px solid #3b82f6; padding-bottom: 0.5rem; }
    h2 { color: #fff; margin-top: 2rem; }
    .score-card {
      background: linear-gradient(135deg, #1f1f23, #27272a);
      border-radius: 16px;
      padding: 2rem;
      margin: 1rem 0;
      text-align: center;
    }
    .score { font-size: 4rem; font-weight: bold; color: ${scoreColor}; }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }
    .summary-item {
      background: #27272a;
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
    }
    .summary-item.critical { border-left: 4px solid #DC2626; }
    .summary-item.high { border-left: 4px solid #EA580C; }
    .summary-item.medium { border-left: 4px solid #D97706; }
    .summary-item.low { border-left: 4px solid #2563EB; }
    .summary-item.info { border-left: 4px solid #6B7280; }
    .summary-item.passed { border-left: 4px solid #22C55E; }
    .finding {
      background: #18181b;
      border-radius: 12px;
      padding: 1.5rem;
      margin: 1rem 0;
      border-left: 4px solid;
    }
    .finding.critical { border-color: #DC2626; }
    .finding.high { border-color: #EA580C; }
    .finding.medium { border-color: #D97706; }
    .finding.low { border-color: #2563EB; }
    .finding.info { border-color: #6B7280; }
    .finding h4 { margin: 0 0 1rem 0; color: #fff; }
    .finding p { margin: 0.5rem 0; color: #a1a1aa; }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .badge.critical { background: #DC262622; color: #FCA5A5; }
    .badge.high { background: #EA580C22; color: #FDBA74; }
    .badge.medium { background: #D9770622; color: #FCD34D; }
    .badge.low { background: #2563EB22; color: #93C5FD; }
    .badge.info { background: #6B728022; color: #D1D5DB; }
    .recommendation { background: #1e3a5f; padding: 1rem; border-radius: 8px; margin-top: 1rem; }
    footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #27272a; color: #71717a; font-size: 0.875rem; }
  </style>
</head>
<body>
  <h1>🔒 보안 감사 리포트</h1>
  <p style="color: #71717a;">생성 일시: ${new Date(result.timestamp).toLocaleString('ko-KR')}</p>

  <div class="score-card">
    <div class="score">${result.score}</div>
    <div style="color: #71717a;">/ 100점</div>
  </div>

  <h2>📊 요약</h2>
  <div class="summary-grid">
    <div class="summary-item critical">
      <div style="font-size: 2rem; font-weight: bold;">${result.summary.critical}</div>
      <div style="color: #71717a; font-size: 0.875rem;">Critical</div>
    </div>
    <div class="summary-item high">
      <div style="font-size: 2rem; font-weight: bold;">${result.summary.high}</div>
      <div style="color: #71717a; font-size: 0.875rem;">High</div>
    </div>
    <div class="summary-item medium">
      <div style="font-size: 2rem; font-weight: bold;">${result.summary.medium}</div>
      <div style="color: #71717a; font-size: 0.875rem;">Medium</div>
    </div>
    <div class="summary-item low">
      <div style="font-size: 2rem; font-weight: bold;">${result.summary.low}</div>
      <div style="color: #71717a; font-size: 0.875rem;">Low</div>
    </div>
    <div class="summary-item info">
      <div style="font-size: 2rem; font-weight: bold;">${result.summary.info}</div>
      <div style="color: #71717a; font-size: 0.875rem;">Info</div>
    </div>
    <div class="summary-item passed">
      <div style="font-size: 2rem; font-weight: bold;">${result.summary.passed}</div>
      <div style="color: #71717a; font-size: 0.875rem;">Passed</div>
    </div>
  </div>

  ${result.findings.length > 0 ? `
  <h2>🔍 발견된 문제</h2>
  ${result.findings.map(finding => `
    <div class="finding ${finding.severity}">
      <h4>
        <span class="badge ${finding.severity}">${getSeverityBadge(finding.severity)}</span>
        ${finding.id}: ${finding.title}
      </h4>
      <p><strong>설명:</strong> ${finding.description}</p>
      <p><strong>분류:</strong> ${getCategoryLabel(finding.category)}</p>
      ${finding.affectedNodes && finding.affectedNodes.length > 0 ? `
        <p><strong>영향받는 노드:</strong> ${finding.affectedNodes.join(', ')}</p>
      ` : ''}
      ${includeRecommendations ? `
        <div class="recommendation">
          <strong>💡 권장사항:</strong> ${finding.recommendation}
        </div>
      ` : ''}
      ${includeReferences && finding.references && finding.references.length > 0 ? `
        <p style="font-size: 0.875rem; color: #71717a;"><strong>참조:</strong> ${finding.references.join(', ')}</p>
      ` : ''}
    </div>
  `).join('')}
  ` : '<p>발견된 보안 문제가 없습니다. ✅</p>'}

  <footer>
    이 리포트는 InfraFlow 보안 감사 도구로 자동 생성되었습니다.
  </footer>
</body>
</html>`;
}

/**
 * Generate plain text report
 */
function generateTextReport(
  result: SecurityAuditResult,
  includeRecommendations: boolean
): string {
  const lines: string[] = [];

  lines.push('='.repeat(60));
  lines.push('보안 감사 리포트');
  lines.push('='.repeat(60));
  lines.push('');
  lines.push(`생성 일시: ${new Date(result.timestamp).toLocaleString('ko-KR')}`);
  lines.push(`보안 점수: ${result.score}/100`);
  lines.push('');
  lines.push('-'.repeat(60));
  lines.push('요약');
  lines.push('-'.repeat(60));
  lines.push(`  Critical: ${result.summary.critical}`);
  lines.push(`  High:     ${result.summary.high}`);
  lines.push(`  Medium:   ${result.summary.medium}`);
  lines.push(`  Low:      ${result.summary.low}`);
  lines.push(`  Info:     ${result.summary.info}`);
  lines.push(`  Passed:   ${result.summary.passed}`);
  lines.push('');

  if (result.findings.length > 0) {
    lines.push('-'.repeat(60));
    lines.push('발견된 문제');
    lines.push('-'.repeat(60));
    lines.push('');

    for (const finding of result.findings) {
      lines.push(`[${getSeverityBadge(finding.severity).toUpperCase()}] ${finding.id}: ${finding.title}`);
      lines.push(`  설명: ${finding.description}`);

      if (includeRecommendations) {
        lines.push(`  권장사항: ${finding.recommendation}`);
      }

      lines.push('');
    }
  }

  lines.push('='.repeat(60));

  return lines.join('\n');
}

/**
 * Group findings by severity
 */
function groupFindingsBySeverity(
  findings: AuditFinding[]
): Record<AuditSeverity, AuditFinding[]> {
  const grouped: Record<AuditSeverity, AuditFinding[]> = {
    critical: [],
    high: [],
    medium: [],
    low: [],
    info: [],
  };

  for (const finding of findings) {
    grouped[finding.severity].push(finding);
  }

  return grouped;
}

/**
 * Get emoji for severity
 */
function getSeverityEmoji(severity: AuditSeverity): string {
  switch (severity) {
    case 'critical':
      return '🔴';
    case 'high':
      return '🟠';
    case 'medium':
      return '🟡';
    case 'low':
      return '🔵';
    case 'info':
      return '⚪';
    default:
      return '❓';
  }
}

/**
 * Get category label in Korean
 */
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'network-security': '네트워크 보안',
    'access-control': '접근 제어',
    'data-protection': '데이터 보호',
    'availability': '가용성',
    'compliance': '컴플라이언스',
    'best-practice': '모범 사례',
  };

  return labels[category] || category;
}
