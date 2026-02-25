import { describe, it, expect } from 'vitest';
import { validateInputSafety } from '../inputSafetyCheck';

describe('validateInputSafety', () => {
  it('returns safe for normal prompt', () => {
    const result = validateInputSafety('firewall과 WAF를 추가해줘', 'prompt');
    expect(result.safe).toBe(true);
    expect(result.detectedPatterns).toEqual([]);
  });

  it('detects API key in prompt', () => {
    const result = validateInputSafety('my key AKIAIOSFODNN7EXAMPLE', 'prompt');
    expect(result.safe).toBe(false);
    expect(result.detectedPatterns[0].type).toBe('aws-key');
    expect(result.detectedPatterns[0].location).toBe('prompt');
  });

  it('detects PII in profile', () => {
    const result = validateInputSafety('user@example.com', 'profile');
    expect(result.safe).toBe(false);
    expect(result.detectedPatterns[0].type).toBe('email');
    expect(result.detectedPatterns[0].location).toBe('profile');
  });

  it('provides bilingual warning message', () => {
    const result = validateInputSafety('password=secret123', 'prompt');
    expect(result.warningMessage).toBeDefined();
    expect(result.warningMessageKo).toBeDefined();
  });

  it('detects multiple issues', () => {
    const result = validateInputSafety('password=test key=AKIAIOSFODNN7EXAMPLE', 'prompt');
    expect(result.safe).toBe(false);
    expect(result.detectedPatterns.length).toBeGreaterThanOrEqual(2);
  });
});
