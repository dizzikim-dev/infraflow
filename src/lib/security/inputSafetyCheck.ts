/**
 * Input-side safety validation.
 *
 * Complements the existing OUTPUT-side validateOutputSafety() in llmSecurityControls.ts.
 * Checks prompts and profile data for credentials and PII before processing.
 *
 * @module security/inputSafetyCheck
 */

import { matchPatterns, type PatternMatch } from './patterns';

// ============================================================
// Types
// ============================================================

export interface InputSafetyResult {
  safe: boolean;
  detectedPatterns: PatternMatch[];
  warningMessage?: string;
  warningMessageKo?: string;
}

// ============================================================
// Validation
// ============================================================

/**
 * Validate user input for sensitive data (credentials, PII) before processing.
 *
 * Uses the shared pattern library from `security/patterns` to detect API keys,
 * passwords, email addresses, phone numbers, and credit card numbers.
 *
 * @param input - Text to validate
 * @param location - Where the input originated ('prompt' or 'profile')
 * @returns InputSafetyResult with safe flag, detected patterns, and bilingual warnings
 *
 * @example
 * ```typescript
 * const result = validateInputSafety('firewall과 WAF를 추가해줘', 'prompt');
 * // { safe: true, detectedPatterns: [] }
 *
 * const result = validateInputSafety('my key AKIAIOSFODNN7EXAMPLE', 'prompt');
 * // { safe: false, detectedPatterns: [{ type: 'aws-key', masked: 'AKIA****', location: 'prompt' }], ... }
 * ```
 */
export function validateInputSafety(
  input: string,
  location: 'prompt' | 'profile',
): InputSafetyResult {
  const matches = matchPatterns(input).map(m => ({ ...m, location }));

  if (matches.length === 0) {
    return { safe: true, detectedPatterns: [] };
  }

  const types = matches.map(m => m.type).join(', ');

  return {
    safe: false,
    detectedPatterns: matches,
    warningMessage: `Sensitive data detected (${types}). Please remove before proceeding.`,
    warningMessageKo: `민감한 정보가 감지되었습니다 (${types}). 제거 후 다시 시도하세요.`,
  };
}
