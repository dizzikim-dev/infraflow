import { describe, it, expect } from 'vitest';
import { CREDENTIAL_PATTERNS, PII_PATTERNS, matchPatterns } from '../patterns';

describe('Security Patterns', () => {
  describe('CREDENTIAL_PATTERNS', () => {
    it('detects AWS access key', () => {
      const result = matchPatterns('my key is AKIAIOSFODNN7EXAMPLE');
      expect(result.some(r => r.type === 'aws-key')).toBe(true);
    });

    it('detects OpenAI API key', () => {
      const result = matchPatterns('sk-proj-abc123def456ghi789jkl012mno');
      expect(result.some(r => r.type === 'openai-key')).toBe(true);
    });

    it('detects GitHub PAT', () => {
      // ghp_ + 36 alphanumeric characters
      const result = matchPatterns('ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij');
      expect(result.some(r => r.type === 'github-pat')).toBe(true);
    });

    it('detects GCP API key', () => {
      // AIza + 35 alphanumeric/dash/underscore characters
      const result = matchPatterns('AIzaSyA-abc123_def456-ghi789jkl012mno34');
      expect(result.some(r => r.type === 'gcp-key')).toBe(true);
    });

    it('detects Slack token', () => {
      // Build token dynamically to avoid GitHub push protection false positive
      const prefix = ['xox', 'b'].join('');
      const result = matchPatterns(`${prefix}-123456789-abcdefghij`);
      expect(result.some(r => r.type === 'slack-token')).toBe(true);
    });

    it('exports CREDENTIAL_PATTERNS array with correct types', () => {
      expect(CREDENTIAL_PATTERNS).toBeDefined();
      expect(Array.isArray(CREDENTIAL_PATTERNS)).toBe(true);
      expect(CREDENTIAL_PATTERNS.length).toBe(5);

      const types = CREDENTIAL_PATTERNS.map(p => p.type);
      expect(types).toContain('aws-key');
      expect(types).toContain('gcp-key');
      expect(types).toContain('openai-key');
      expect(types).toContain('github-pat');
      expect(types).toContain('slack-token');
    });
  });

  describe('PII_PATTERNS', () => {
    it('detects password assignment', () => {
      const result = matchPatterns('password=myS3cret!');
      expect(result.some(r => r.type === 'password')).toBe(true);
    });

    it('detects email address', () => {
      const result = matchPatterns('contact user@example.com for info');
      expect(result.some(r => r.type === 'email')).toBe(true);
    });

    it('detects Korean phone number', () => {
      const result = matchPatterns('연락처 010-1234-5678');
      expect(result.some(r => r.type === 'phone-kr')).toBe(true);
    });

    it('detects credit card number', () => {
      const result = matchPatterns('card 4111-1111-1111-1111');
      expect(result.some(r => r.type === 'credit-card')).toBe(true);
    });

    it('exports PII_PATTERNS array with correct types', () => {
      expect(PII_PATTERNS).toBeDefined();
      expect(Array.isArray(PII_PATTERNS)).toBe(true);
      expect(PII_PATTERNS.length).toBe(4);

      const types = PII_PATTERNS.map(p => p.type);
      expect(types).toContain('password');
      expect(types).toContain('email');
      expect(types).toContain('phone-kr');
      expect(types).toContain('credit-card');
    });
  });

  describe('matchPatterns', () => {
    it('returns empty array for safe input', () => {
      expect(matchPatterns('firewall과 WAF를 추가해줘')).toEqual([]);
    });

    it('returns masked snippet', () => {
      const result = matchPatterns('key is sk-proj-abc123def456ghi789jkl012mno');
      expect(result[0].masked).toContain('sk-****');
    });

    it('detects multiple patterns in one string', () => {
      const result = matchPatterns('password=test AKIAIOSFODNN7EXAMPLE');
      expect(result).toHaveLength(2);
    });

    it('returns correct type for each match', () => {
      const result = matchPatterns('password=test AKIAIOSFODNN7EXAMPLE');
      const types = result.map(r => r.type);
      expect(types).toContain('password');
      expect(types).toContain('aws-key');
    });

    it('handles empty string', () => {
      expect(matchPatterns('')).toEqual([]);
    });

    it('supports optional location field in PatternMatch', () => {
      const result = matchPatterns('password=secret123');
      expect(result.length).toBeGreaterThan(0);
      // location is optional, should be undefined by default
      expect(result[0].location).toBeUndefined();
    });

    it('does not false-positive on normal infrastructure text', () => {
      const safeInputs = [
        '3티어 웹 아키텍처에 WAF 추가해줘',
        'Add a load balancer between web and app server',
        '방화벽 추가하고 로드밸런서 연결해줘',
        'VPN Gateway 설정',
        'kubernetes 클러스터 구성',
      ];

      for (const input of safeInputs) {
        expect(matchPatterns(input)).toEqual([]);
      }
    });

    it('detects password with colon separator', () => {
      const result = matchPatterns('pwd: mysecretpassword');
      expect(result.some(r => r.type === 'password')).toBe(true);
    });

    it('detects password with passwd variant', () => {
      const result = matchPatterns('passwd=hunter2');
      expect(result.some(r => r.type === 'password')).toBe(true);
    });
  });
});
