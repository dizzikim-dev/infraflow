/**
 * Shared security detection patterns.
 *
 * Used by both validateOutputSafety (existing) and validateInputSafety (new).
 * Extracted from llmSecurityControls.ts for reuse across input/output validation
 * and profile safety checks.
 *
 * @module security/patterns
 */

// ============================================================
// Types
// ============================================================

export interface PatternMatch {
  /** Pattern type identifier, e.g. 'aws-key', 'email' */
  type: string;
  /** Masked representation of the matched value */
  masked: string;
  /** Where the pattern was found */
  location?: 'prompt' | 'profile';
}

interface PatternDef {
  /** Pattern type identifier */
  type: string;
  /** Regular expression to match (must use global flag) */
  regex: RegExp;
  /** Masked prefix shown instead of the actual value */
  maskPrefix: string;
}

// ============================================================
// Credential Patterns
// ============================================================

/**
 * Patterns for detecting API keys, tokens, and credentials.
 *
 * Matches:
 * - AWS access keys (AKIA...)
 * - GCP API keys (AIza...)
 * - OpenAI API keys (sk-...)
 * - GitHub personal access tokens (ghp_...)
 * - Slack tokens (xox[bpors]-...)
 */
export const CREDENTIAL_PATTERNS: PatternDef[] = [
  { type: 'aws-key',     regex: /AKIA[0-9A-Z]{16}/g,              maskPrefix: 'AKIA****' },
  { type: 'gcp-key',     regex: /AIza[0-9A-Za-z_-]{35}/g,         maskPrefix: 'AIza****' },
  { type: 'openai-key',  regex: /sk-[a-zA-Z0-9_-]{20,}/g,         maskPrefix: 'sk-****' },
  { type: 'github-pat',  regex: /ghp_[a-zA-Z0-9]{36}/g,           maskPrefix: 'ghp_****' },
  { type: 'slack-token',  regex: /xox[bpors]-[a-zA-Z0-9-]+/g,     maskPrefix: 'xox****' },
];

// ============================================================
// PII Patterns
// ============================================================

/**
 * Patterns for detecting personally identifiable information (PII).
 *
 * Matches:
 * - Password assignments (password=, passwd=, pwd=, pwd:)
 * - Email addresses
 * - Korean phone numbers (010-XXXX-XXXX)
 * - Credit card numbers (4 groups of 4 digits)
 */
export const PII_PATTERNS: PatternDef[] = [
  { type: 'password',    regex: /(?:password|passwd|pwd)\s*[=:]\s*\S+/gi,  maskPrefix: 'password=****' },
  { type: 'email',       regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, maskPrefix: '****@****' },
  { type: 'phone-kr',    regex: /01[0-9]-\d{3,4}-\d{4}/g,          maskPrefix: '010-****-****' },
  { type: 'credit-card', regex: /\b(?:\d{4}[- ]?){3}\d{4}\b/g,     maskPrefix: '****-****-****-****' },
];

// ============================================================
// Combined Patterns
// ============================================================

const ALL_PATTERNS: PatternDef[] = [...CREDENTIAL_PATTERNS, ...PII_PATTERNS];

// ============================================================
// Match Function
// ============================================================

/**
 * Scan input text for credential and PII patterns.
 *
 * Returns an array of PatternMatch objects for each detected pattern.
 * Each match includes the pattern type and a masked representation.
 *
 * @param input - Text to scan for sensitive patterns
 * @returns Array of PatternMatch objects (empty if no patterns found)
 *
 * @example
 * ```typescript
 * const matches = matchPatterns('my key is AKIAIOSFODNN7EXAMPLE');
 * // [{ type: 'aws-key', masked: 'AKIA****' }]
 *
 * const safe = matchPatterns('firewall과 WAF를 추가해줘');
 * // []
 * ```
 */
export function matchPatterns(input: string): PatternMatch[] {
  if (!input) return [];

  const matches: PatternMatch[] = [];

  for (const pattern of ALL_PATTERNS) {
    // Reset regex lastIndex for global patterns
    pattern.regex.lastIndex = 0;
    if (pattern.regex.test(input)) {
      matches.push({
        type: pattern.type,
        masked: pattern.maskPrefix,
      });
    }
  }

  return matches;
}
