/**
 * Source Validator - URL and source validation utility for knowledge entries
 *
 * Provides offline/sync structural validation and staleness detection
 * for knowledge source entries. Does NOT make HTTP requests.
 *
 * Exports:
 * - validateSourceUrl: Validate a single URL format
 * - validateSource: Validate a single KnowledgeSource entry
 * - validateAllSources: Validate all sources across all knowledge entries
 * - getStaleEntries: Find entries not reviewed within maxAgeDays
 * - getSourceTypeCoverage: Count sources by SourceType
 */

import type { KnowledgeSource, KnowledgeEntryBase, SourceType } from './types';
import { RELATIONSHIPS } from './relationships';
import { PATTERNS } from './patterns';
import { ANTIPATTERNS } from './antipatterns';
import { FAILURES } from './failures';
import { PROFILES } from './performance';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface SourceIssue {
  severity: ValidationSeverity;
  code: string;
  message: string;
  messageKo: string;
}

export interface SourceValidationResult {
  sourceTitle: string;
  url?: string;
  isValid: boolean;
  issues: SourceIssue[];
}

export interface ValidationReport {
  totalSources: number;
  validCount: number;
  warningCount: number;
  errorCount: number;
  issues: { entryId: string; entryType: string; source: SourceValidationResult }[];
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Regex for basic URL format validation (http:// or https://) */
const URL_PATTERN = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

/** Regex to detect a valid protocol prefix */
const PROTOCOL_PATTERN = /^https?:\/\//i;

/** Regex to detect double slashes in the path portion (after protocol) */
const DOUBLE_SLASH_IN_PATH = /^https?:\/\/[^/]+\/.*\/\//;

/** Regex to detect a domain with missing TLD (e.g. "http://example" with no dot) */
const MISSING_TLD_PATTERN = /^https?:\/\/[^./]+$/;

/** Known deprecated or defunct domains/paths */
const DEPRECATED_DOMAINS: readonly string[] = Object.freeze([
  'docs.oracle.com/cd/',
  'technet.microsoft.com',
  'msdn.microsoft.com',
]);

/** Milliseconds in one day */
const MS_PER_DAY = 86_400_000;

// ---------------------------------------------------------------------------
// URL Validation
// ---------------------------------------------------------------------------

/**
 * Validate a single URL format (no HTTP request).
 * Checks structure, protocol, common mistakes, and deprecated domains.
 */
export function validateSourceUrl(url: string): SourceIssue[] {
  const issues: SourceIssue[] = [];

  // Empty check
  if (!url || url.trim().length === 0) {
    issues.push({
      severity: 'error',
      code: 'EMPTY_URL',
      message: 'URL is empty',
      messageKo: 'URL이 비어 있습니다',
    });
    return issues;
  }

  // Protocol check
  if (!PROTOCOL_PATTERN.test(url)) {
    issues.push({
      severity: 'error',
      code: 'MISSING_PROTOCOL',
      message: 'URL is missing http:// or https:// protocol',
      messageKo: 'URL에 http:// 또는 https:// 프로토콜이 없습니다',
    });
    return issues;
  }

  // Invalid protocol (e.g. ftp://, file://) is already caught above since
  // we only accept http/https. But let's also catch e.g. "htt://..."
  if (!/^https?:\/\//i.test(url)) {
    issues.push({
      severity: 'error',
      code: 'INVALID_PROTOCOL',
      message: 'URL has an invalid protocol (only http and https are accepted)',
      messageKo: 'URL의 프로토콜이 유효하지 않습니다 (http, https만 허용)',
    });
    return issues;
  }

  // General URL format
  if (!URL_PATTERN.test(url)) {
    issues.push({
      severity: 'error',
      code: 'INVALID_URL_FORMAT',
      message: 'URL format is invalid',
      messageKo: 'URL 형식이 유효하지 않습니다',
    });
    return issues;
  }

  // Missing TLD
  if (MISSING_TLD_PATTERN.test(url)) {
    issues.push({
      severity: 'warning',
      code: 'MISSING_TLD',
      message: 'URL domain appears to be missing a TLD (e.g. .com, .org)',
      messageKo: 'URL 도메인에 TLD(.com, .org 등)가 누락된 것으로 보입니다',
    });
  }

  // Double slashes in path
  if (DOUBLE_SLASH_IN_PATH.test(url)) {
    issues.push({
      severity: 'warning',
      code: 'DOUBLE_SLASH_IN_PATH',
      message: 'URL path contains consecutive slashes (//)',
      messageKo: 'URL 경로에 연속된 슬래시(//)가 포함되어 있습니다',
    });
  }

  // Deprecated domains
  for (const deprecated of DEPRECATED_DOMAINS) {
    if (url.includes(deprecated)) {
      issues.push({
        severity: 'warning',
        code: 'DEPRECATED_DOMAIN',
        message: `URL references a deprecated domain or path: ${deprecated}`,
        messageKo: `URL이 더 이상 사용되지 않는 도메인/경로를 참조합니다: ${deprecated}`,
      });
      break;
    }
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Source Validation
// ---------------------------------------------------------------------------

/**
 * Validate a single KnowledgeSource entry.
 *
 * Checks:
 * - Required fields: type, title, accessedDate
 * - URL format if present
 * - accessedDate not in future
 * - Staleness: warn if accessedDate > 1 year old
 * - Title not empty
 */
export function validateSource(source: KnowledgeSource): SourceValidationResult {
  const issues: SourceIssue[] = [];

  // Title check
  if (!source.title || source.title.trim().length === 0) {
    issues.push({
      severity: 'error',
      code: 'MISSING_TITLE',
      message: 'Source title is missing or empty',
      messageKo: '소스 제목이 누락되었거나 비어 있습니다',
    });
  }

  // Type check
  if (!source.type) {
    issues.push({
      severity: 'error',
      code: 'MISSING_TYPE',
      message: 'Source type is missing',
      messageKo: '소스 유형이 누락되었습니다',
    });
  }

  // accessedDate check
  if (!source.accessedDate || source.accessedDate.trim().length === 0) {
    issues.push({
      severity: 'error',
      code: 'MISSING_ACCESSED_DATE',
      message: 'Source accessedDate is missing',
      messageKo: '소스 접근 일자(accessedDate)가 누락되었습니다',
    });
  } else {
    const accessedTime = new Date(source.accessedDate).getTime();
    const now = Date.now();

    // Future date check
    if (!isNaN(accessedTime) && accessedTime > now) {
      issues.push({
        severity: 'error',
        code: 'FUTURE_ACCESSED_DATE',
        message: `Source accessedDate is in the future: ${source.accessedDate}`,
        messageKo: `소스 접근 일자가 미래입니다: ${source.accessedDate}`,
      });
    }

    // Staleness check (> 1 year / 365 days)
    if (!isNaN(accessedTime)) {
      const daysSinceAccess = (now - accessedTime) / MS_PER_DAY;
      if (daysSinceAccess > 365) {
        issues.push({
          severity: 'warning',
          code: 'STALE_SOURCE',
          message: `Source was last accessed over 1 year ago: ${source.accessedDate}`,
          messageKo: `소스가 1년 이상 전에 마지막으로 접근되었습니다: ${source.accessedDate}`,
        });
      }
    }
  }

  // URL validation (optional field, warn if missing)
  if (!source.url || source.url.trim().length === 0) {
    issues.push({
      severity: 'warning',
      code: 'MISSING_URL',
      message: 'Source URL is not provided',
      messageKo: '소스 URL이 제공되지 않았습니다',
    });
  } else {
    const urlIssues = validateSourceUrl(source.url);
    issues.push(...urlIssues);
  }

  const hasError = issues.some((i) => i.severity === 'error');

  return {
    sourceTitle: source.title || '(untitled)',
    url: source.url,
    isValid: !hasError,
    issues,
  };
}

// ---------------------------------------------------------------------------
// Aggregate Validation
// ---------------------------------------------------------------------------

/**
 * Collect all knowledge entries from all registries.
 */
function getAllEntries(): KnowledgeEntryBase[] {
  return [
    ...(RELATIONSHIPS as unknown as KnowledgeEntryBase[]),
    ...(PATTERNS as unknown as KnowledgeEntryBase[]),
    ...(ANTIPATTERNS as unknown as KnowledgeEntryBase[]),
    ...(FAILURES as unknown as KnowledgeEntryBase[]),
    ...(PROFILES as unknown as KnowledgeEntryBase[]),
  ];
}

/**
 * Validate all sources across all knowledge entries.
 *
 * Iterates through RELATIONSHIPS, PATTERNS, ANTIPATTERNS, FAILURES, PROFILES,
 * collects all trust.sources, validates each source, and generates a summary report.
 */
export function validateAllSources(): ValidationReport {
  const entries = getAllEntries();
  const issuesList: ValidationReport['issues'] = [];
  let totalSources = 0;
  let validCount = 0;
  let warningCount = 0;
  let errorCount = 0;

  for (const entry of entries) {
    if (!entry.trust?.sources) continue;

    for (const source of entry.trust.sources) {
      totalSources++;
      const result = validateSource(source);

      if (result.isValid) {
        validCount++;
      }

      const hasWarnings = result.issues.some((i) => i.severity === 'warning');
      const hasErrors = result.issues.some((i) => i.severity === 'error');

      if (hasWarnings) warningCount++;
      if (hasErrors) errorCount++;

      if (result.issues.length > 0) {
        issuesList.push({
          entryId: entry.id,
          entryType: entry.type,
          source: result,
        });
      }
    }
  }

  return {
    totalSources,
    validCount,
    warningCount,
    errorCount,
    issues: issuesList,
    generatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Staleness Detection
// ---------------------------------------------------------------------------

/**
 * Find entries whose trust.lastReviewedAt exceeds maxAgeDays.
 *
 * @param maxAgeDays - Maximum age in days before an entry is considered stale (default 365)
 * @returns Array of stale entries with their ID, lastReviewed date, and days since review
 */
export function getStaleEntries(
  maxAgeDays: number = 365,
): { entryId: string; lastReviewed: string; daysSinceReview: number }[] {
  const entries = getAllEntries();
  const now = Date.now();
  const results: { entryId: string; lastReviewed: string; daysSinceReview: number }[] = [];

  for (const entry of entries) {
    if (!entry.trust?.lastReviewedAt) continue;

    const reviewedTime = new Date(entry.trust.lastReviewedAt).getTime();
    if (isNaN(reviewedTime)) continue;

    const daysSinceReview = Math.floor((now - reviewedTime) / MS_PER_DAY);

    if (daysSinceReview > maxAgeDays) {
      results.push({
        entryId: entry.id,
        lastReviewed: entry.trust.lastReviewedAt,
        daysSinceReview,
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Source Type Coverage
// ---------------------------------------------------------------------------

/**
 * Count sources by SourceType across all knowledge entries.
 *
 * @returns Record mapping each SourceType to its occurrence count
 */
export function getSourceTypeCoverage(): Record<SourceType, number> {
  const coverage: Record<SourceType, number> = {
    rfc: 0,
    nist: 0,
    cis: 0,
    owasp: 0,
    vendor: 0,
    academic: 0,
    industry: 0,
    user_verified: 0,
    user_unverified: 0,
  };

  const entries = getAllEntries();

  for (const entry of entries) {
    if (!entry.trust?.sources) continue;

    for (const source of entry.trust.sources) {
      if (source.type in coverage) {
        coverage[source.type]++;
      }
    }
  }

  return coverage;
}
