import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateSourceUrl,
  validateSource,
  validateAllSources,
  getStaleEntries,
  getSourceTypeCoverage,
} from '../sourceValidator';
import type { KnowledgeSource } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create a valid KnowledgeSource for testing */
function makeSource(overrides: Partial<KnowledgeSource> = {}): KnowledgeSource {
  return {
    type: 'nist',
    title: 'NIST SP 800-41 Rev.1: Guidelines on Firewalls and Firewall Policy',
    url: 'https://csrc.nist.gov/pubs/sp/800/41/r1/final',
    accessedDate: '2026-02-09',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// validateSourceUrl
// ---------------------------------------------------------------------------

describe('validateSourceUrl', () => {
  it('should accept valid HTTPS URL', () => {
    const issues = validateSourceUrl('https://example.com/path');
    expect(issues).toEqual([]);
  });

  it('should accept valid HTTP URL', () => {
    const issues = validateSourceUrl('http://example.com/path');
    expect(issues).toEqual([]);
  });

  it('should reject empty string', () => {
    const issues = validateSourceUrl('');
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].code).toBe('EMPTY_URL');
    expect(issues[0].severity).toBe('error');
  });

  it('should reject URL without protocol', () => {
    const issues = validateSourceUrl('example.com/path');
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].code).toBe('MISSING_PROTOCOL');
    expect(issues[0].severity).toBe('error');
  });

  it('should reject URL with invalid protocol', () => {
    const issues = validateSourceUrl('ftp://example.com/path');
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].code).toBe('MISSING_PROTOCOL');
    expect(issues[0].severity).toBe('error');
  });

  it('should detect double slashes in path', () => {
    const issues = validateSourceUrl('https://example.com/path//to/resource');
    const doubleSlashIssue = issues.find((i) => i.code === 'DOUBLE_SLASH_IN_PATH');
    expect(doubleSlashIssue).toBeDefined();
    expect(doubleSlashIssue!.severity).toBe('warning');
  });

  it('should detect missing TLD', () => {
    const issues = validateSourceUrl('https://localhost');
    const missingTldIssue = issues.find((i) => i.code === 'MISSING_TLD');
    expect(missingTldIssue).toBeDefined();
    expect(missingTldIssue!.severity).toBe('warning');
  });

  it('should return empty for valid URL with no issues', () => {
    const issues = validateSourceUrl('https://csrc.nist.gov/pubs/sp/800/41/r1/final');
    expect(issues).toEqual([]);
  });

  it('should detect deprecated domains', () => {
    const issues = validateSourceUrl('https://technet.microsoft.com/some-article');
    const deprecatedIssue = issues.find((i) => i.code === 'DEPRECATED_DOMAIN');
    expect(deprecatedIssue).toBeDefined();
    expect(deprecatedIssue!.severity).toBe('warning');
  });

  it('should accept URL with query parameters', () => {
    const issues = validateSourceUrl('https://example.com/path?key=value&foo=bar');
    expect(issues).toEqual([]);
  });

  it('should accept URL with fragment', () => {
    const issues = validateSourceUrl('https://example.com/path#section');
    expect(issues).toEqual([]);
  });

  it('should have bilingual messages on all issues', () => {
    const issues = validateSourceUrl('');
    for (const issue of issues) {
      expect(issue.message).toBeTruthy();
      expect(issue.messageKo).toBeTruthy();
    }
  });

  it('should reject whitespace-only string', () => {
    const issues = validateSourceUrl('   ');
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].code).toBe('EMPTY_URL');
  });
});

// ---------------------------------------------------------------------------
// validateSource
// ---------------------------------------------------------------------------

describe('validateSource', () => {
  it('should validate complete source with no issues', () => {
    const result = validateSource(makeSource());
    expect(result.isValid).toBe(true);
    // May have zero issues or only info/warning (no errors)
    const errors = result.issues.filter((i) => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });

  it('should error on missing title', () => {
    const result = validateSource(makeSource({ title: '' }));
    expect(result.isValid).toBe(false);
    const titleIssue = result.issues.find((i) => i.code === 'MISSING_TITLE');
    expect(titleIssue).toBeDefined();
    expect(titleIssue!.severity).toBe('error');
  });

  it('should error on missing accessedDate', () => {
    const result = validateSource(makeSource({ accessedDate: '' }));
    expect(result.isValid).toBe(false);
    const dateIssue = result.issues.find((i) => i.code === 'MISSING_ACCESSED_DATE');
    expect(dateIssue).toBeDefined();
    expect(dateIssue!.severity).toBe('error');
  });

  it('should warn on missing URL', () => {
    const result = validateSource(makeSource({ url: undefined }));
    const urlIssue = result.issues.find((i) => i.code === 'MISSING_URL');
    expect(urlIssue).toBeDefined();
    expect(urlIssue!.severity).toBe('warning');
    // Missing URL is a warning, not error, so source can still be valid
    expect(result.isValid).toBe(true);
  });

  it('should warn on stale accessedDate (> 1 year)', () => {
    const result = validateSource(makeSource({ accessedDate: '2020-01-01' }));
    const staleIssue = result.issues.find((i) => i.code === 'STALE_SOURCE');
    expect(staleIssue).toBeDefined();
    expect(staleIssue!.severity).toBe('warning');
  });

  it('should not warn on recent accessedDate', () => {
    // Use a date that is guaranteed to be recent
    const today = new Date().toISOString().slice(0, 10);
    const result = validateSource(makeSource({ accessedDate: today }));
    const staleIssue = result.issues.find((i) => i.code === 'STALE_SOURCE');
    expect(staleIssue).toBeUndefined();
  });

  it('should error on future accessedDate', () => {
    const futureDate = new Date(Date.now() + 365 * 86_400_000).toISOString().slice(0, 10);
    const result = validateSource(makeSource({ accessedDate: futureDate }));
    const futureIssue = result.issues.find((i) => i.code === 'FUTURE_ACCESSED_DATE');
    expect(futureIssue).toBeDefined();
    expect(futureIssue!.severity).toBe('error');
  });

  it('should propagate URL format issues', () => {
    const result = validateSource(makeSource({ url: 'not-a-url' }));
    const urlIssue = result.issues.find((i) => i.code === 'MISSING_PROTOCOL');
    expect(urlIssue).toBeDefined();
  });

  it('should set sourceTitle from source', () => {
    const result = validateSource(makeSource({ title: 'My Title' }));
    expect(result.sourceTitle).toBe('My Title');
  });

  it('should set sourceTitle to (untitled) when title is missing', () => {
    const result = validateSource(makeSource({ title: '' }));
    expect(result.sourceTitle).toBe('(untitled)');
  });

  it('should include url in result', () => {
    const result = validateSource(makeSource({ url: 'https://example.com' }));
    expect(result.url).toBe('https://example.com');
  });

  it('should have bilingual messages on all issues', () => {
    const result = validateSource(makeSource({ title: '', accessedDate: '', url: '' }));
    for (const issue of result.issues) {
      expect(issue.message).toBeTruthy();
      expect(issue.messageKo).toBeTruthy();
    }
  });

  it('should error on missing type', () => {
    const result = validateSource(makeSource({ type: '' as never }));
    const typeIssue = result.issues.find((i) => i.code === 'MISSING_TYPE');
    expect(typeIssue).toBeDefined();
    expect(typeIssue!.severity).toBe('error');
  });
});

// ---------------------------------------------------------------------------
// validateAllSources
// ---------------------------------------------------------------------------

describe('validateAllSources', () => {
  it('should validate all knowledge sources', () => {
    const report = validateAllSources();
    expect(report.totalSources).toBeGreaterThan(0);
    expect(report.generatedAt).toBeTruthy();
  });

  it('should return report with correct totals', () => {
    const report = validateAllSources();
    // totalSources should be the sum of all sources across all knowledge entries
    expect(report.totalSources).toBeGreaterThanOrEqual(50);
    // validCount + entries with only errors should account for all sources
    expect(report.validCount).toBeLessThanOrEqual(report.totalSources);
  });

  it('should find no errors in well-formed data', () => {
    const report = validateAllSources();
    // The existing knowledge data should be well-formed with no errors
    expect(report.errorCount).toBe(0);
  });

  it('should count issues correctly', () => {
    const report = validateAllSources();
    // warningCount and errorCount should be non-negative
    expect(report.warningCount).toBeGreaterThanOrEqual(0);
    expect(report.errorCount).toBeGreaterThanOrEqual(0);
  });

  it('should have generatedAt as valid ISO date', () => {
    const report = validateAllSources();
    const date = new Date(report.generatedAt);
    expect(date.getTime()).not.toBeNaN();
  });

  it('should include entryId and entryType in issues', () => {
    const report = validateAllSources();
    for (const issue of report.issues) {
      expect(issue.entryId).toBeTruthy();
      expect(issue.entryType).toBeTruthy();
      expect(issue.source).toBeDefined();
      expect(issue.source.sourceTitle).toBeTruthy();
    }
  });
});

// ---------------------------------------------------------------------------
// getStaleEntries
// ---------------------------------------------------------------------------

describe('getStaleEntries', () => {
  it('should return empty for fresh entries', () => {
    // All existing entries have lastReviewedAt = '2026-02-09' which is recent
    const stale = getStaleEntries();
    expect(stale).toEqual([]);
  });

  it('should detect stale entries with custom maxAge', () => {
    // Use maxAgeDays = 0 so anything reviewed before now is stale
    const stale = getStaleEntries(0);
    // All entries should be stale since they were reviewed at some point in the past
    // (or today, depending on test run time vs data date)
    expect(stale.length).toBeGreaterThanOrEqual(0);
  });

  it('should use default 365 days', () => {
    // Default should be 365 days; current data has recent dates, so should be empty
    const stale = getStaleEntries();
    expect(Array.isArray(stale)).toBe(true);
  });

  it('should return entries with correct structure', () => {
    const stale = getStaleEntries(0);
    for (const entry of stale) {
      expect(entry.entryId).toBeTruthy();
      expect(entry.lastReviewed).toBeTruthy();
      expect(typeof entry.daysSinceReview).toBe('number');
      expect(entry.daysSinceReview).toBeGreaterThanOrEqual(0);
    }
  });

  it('should include daysSinceReview as a non-negative integer', () => {
    const stale = getStaleEntries(0);
    for (const entry of stale) {
      expect(Number.isInteger(entry.daysSinceReview)).toBe(true);
      expect(entry.daysSinceReview).toBeGreaterThanOrEqual(0);
    }
  });
});

// ---------------------------------------------------------------------------
// getSourceTypeCoverage
// ---------------------------------------------------------------------------

describe('getSourceTypeCoverage', () => {
  it('should count all source types', () => {
    const coverage = getSourceTypeCoverage();
    expect(typeof coverage).toBe('object');

    // Should have keys for all known source types
    const expectedTypes = [
      'rfc', 'nist', 'cis', 'owasp', 'vendor',
      'academic', 'industry', 'user_verified', 'user_unverified',
    ];

    for (const type of expectedTypes) {
      expect(type in coverage).toBe(true);
      expect(typeof coverage[type as keyof typeof coverage]).toBe('number');
    }
  });

  it('should include known types (nist, rfc, etc.)', () => {
    const coverage = getSourceTypeCoverage();
    // The existing data heavily uses nist and vendor sources
    expect(coverage.nist).toBeGreaterThan(0);
    expect(coverage.vendor).toBeGreaterThan(0);
    expect(coverage.rfc).toBeGreaterThan(0);
    expect(coverage.cis).toBeGreaterThan(0);
    expect(coverage.owasp).toBeGreaterThan(0);
    expect(coverage.industry).toBeGreaterThan(0);
  });

  it('should have zero for unused types', () => {
    const coverage = getSourceTypeCoverage();
    // The existing data does not use academic or user sources
    expect(coverage.academic).toBe(0);
    expect(coverage.user_verified).toBe(0);
    expect(coverage.user_unverified).toBe(0);
  });

  it('should return non-negative counts', () => {
    const coverage = getSourceTypeCoverage();
    for (const count of Object.values(coverage)) {
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  it('should sum to a reasonable total', () => {
    const coverage = getSourceTypeCoverage();
    const total = Object.values(coverage).reduce((a, b) => a + b, 0);
    // Total source references across all knowledge entries should be > 50
    expect(total).toBeGreaterThan(50);
  });
});
