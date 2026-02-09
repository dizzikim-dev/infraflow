import { describe, it, expect } from 'vitest';
import {
  LLMModifyError,
  ModifyErrorCode,
  isLLMModifyError,
  toLLMModifyError,
} from '@/lib/parser/modifyErrors';

describe('modifyErrors', () => {
  describe('LLMModifyError constructor', () => {
    it('should create error with all properties', () => {
      const error = new LLMModifyError(
        'technical message',
        ModifyErrorCode.API_ERROR,
        'user-facing message',
        true,
        30
      );

      expect(error.message).toBe('technical message');
      expect(error.code).toBe(ModifyErrorCode.API_ERROR);
      expect(error.userMessage).toBe('user-facing message');
      expect(error.recoverable).toBe(true);
      expect(error.retryAfter).toBe(30);
      expect(error.name).toBe('LLMModifyError');
    });

    it('should default recoverable to true', () => {
      const error = new LLMModifyError(
        'msg',
        ModifyErrorCode.UNKNOWN,
        'user msg'
      );

      expect(error.recoverable).toBe(true);
    });

    it('should be an instance of Error', () => {
      const error = new LLMModifyError(
        'msg',
        ModifyErrorCode.UNKNOWN,
        'user msg'
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(LLMModifyError);
    });
  });

  describe('toJSON', () => {
    it('should produce expected structure', () => {
      const error = new LLMModifyError(
        'tech msg',
        ModifyErrorCode.API_RATE_LIMIT,
        'user msg',
        true,
        60
      );

      const json = error.toJSON();

      expect(json).toEqual({
        code: ModifyErrorCode.API_RATE_LIMIT,
        userMessage: 'user msg',
        technicalMessage: 'tech msg',
        retryAfter: 60,
        recoverable: true,
      });
    });

    it('should handle undefined retryAfter', () => {
      const error = new LLMModifyError(
        'tech msg',
        ModifyErrorCode.API_ERROR,
        'user msg',
        true
      );

      const json = error.toJSON();

      expect(json.retryAfter).toBeUndefined();
    });

    it('should include recoverable false', () => {
      const error = new LLMModifyError(
        'msg',
        ModifyErrorCode.API_KEY_MISSING,
        'user msg',
        false
      );

      expect(error.toJSON().recoverable).toBe(false);
    });
  });

  describe('factory methods', () => {
    describe('apiKeyMissing', () => {
      it('should create error with correct code and non-recoverable', () => {
        const error = LLMModifyError.apiKeyMissing();

        expect(error.code).toBe(ModifyErrorCode.API_KEY_MISSING);
        expect(error.recoverable).toBe(false);
        expect(error.message).toContain('ANTHROPIC_API_KEY');
        expect(error.userMessage).toContain('API 키');
      });
    });

    describe('rateLimit', () => {
      it('should create error with default retryAfter of 60', () => {
        const error = LLMModifyError.rateLimit();

        expect(error.code).toBe(ModifyErrorCode.API_RATE_LIMIT);
        expect(error.recoverable).toBe(true);
        expect(error.retryAfter).toBe(60);
        expect(error.userMessage).toContain('60초');
      });

      it('should accept custom retryAfter value', () => {
        const error = LLMModifyError.rateLimit(120);

        expect(error.retryAfter).toBe(120);
        expect(error.userMessage).toContain('120초');
      });
    });

    describe('timeout', () => {
      it('should create error with correct code and recoverable', () => {
        const error = LLMModifyError.timeout();

        expect(error.code).toBe(ModifyErrorCode.API_TIMEOUT);
        expect(error.recoverable).toBe(true);
        expect(error.message).toContain('timed out');
      });
    });

    describe('invalidJson', () => {
      it('should create error with details', () => {
        const error = LLMModifyError.invalidJson('Unexpected token');

        expect(error.code).toBe(ModifyErrorCode.INVALID_JSON);
        expect(error.recoverable).toBe(true);
        expect(error.message).toContain('Unexpected token');
      });

      it('should handle missing details', () => {
        const error = LLMModifyError.invalidJson();

        expect(error.message).toContain('unknown error');
      });
    });

    describe('invalidResponse', () => {
      it('should create error with details', () => {
        const error = LLMModifyError.invalidResponse('missing operations');

        expect(error.code).toBe(ModifyErrorCode.INVALID_RESPONSE);
        expect(error.recoverable).toBe(true);
        expect(error.message).toContain('missing operations');
      });

      it('should handle missing details', () => {
        const error = LLMModifyError.invalidResponse();

        expect(error.message).toContain('unknown error');
      });
    });

    describe('nodeNotFound', () => {
      it('should create error with node ID in messages', () => {
        const error = LLMModifyError.nodeNotFound('firewall-1');

        expect(error.code).toBe(ModifyErrorCode.NODE_NOT_FOUND);
        expect(error.recoverable).toBe(true);
        expect(error.message).toContain('firewall-1');
        expect(error.userMessage).toContain('firewall-1');
      });
    });

    describe('invalidNodeType', () => {
      it('should create error with node type in messages', () => {
        const error = LLMModifyError.invalidNodeType('fake-device');

        expect(error.code).toBe(ModifyErrorCode.INVALID_NODE_TYPE);
        expect(error.recoverable).toBe(true);
        expect(error.message).toContain('fake-device');
        expect(error.userMessage).toContain('fake-device');
      });
    });

    describe('emptyDiagram', () => {
      it('should create error with correct code', () => {
        const error = LLMModifyError.emptyDiagram();

        expect(error.code).toBe(ModifyErrorCode.EMPTY_DIAGRAM);
        expect(error.recoverable).toBe(true);
        expect(error.userMessage).toContain('다이어그램');
      });
    });

    describe('operationFailed', () => {
      it('should create error with details', () => {
        const error = LLMModifyError.operationFailed('node conflict');

        expect(error.code).toBe(ModifyErrorCode.OPERATION_FAILED);
        expect(error.recoverable).toBe(true);
        expect(error.message).toContain('node conflict');
      });

      it('should handle missing details', () => {
        const error = LLMModifyError.operationFailed();

        expect(error.message).toContain('unknown error');
      });
    });

    describe('apiError', () => {
      it('should create error with status code and message', () => {
        const error = LLMModifyError.apiError(500, 'Internal Server Error');

        expect(error.code).toBe(ModifyErrorCode.API_ERROR);
        expect(error.recoverable).toBe(true);
        expect(error.message).toContain('500');
        expect(error.message).toContain('Internal Server Error');
      });

      it('should handle missing message', () => {
        const error = LLMModifyError.apiError(503);

        expect(error.message).toContain('503');
        expect(error.message).toContain('unknown');
      });
    });

    describe('unknown', () => {
      it('should wrap Error instances', () => {
        const original = new Error('original error');
        const error = LLMModifyError.unknown(original);

        expect(error.code).toBe(ModifyErrorCode.UNKNOWN);
        expect(error.recoverable).toBe(true);
        expect(error.message).toBe('original error');
      });

      it('should wrap string errors', () => {
        const error = LLMModifyError.unknown('string error');

        expect(error.message).toBe('string error');
      });

      it('should wrap non-error values', () => {
        const error = LLMModifyError.unknown(42);

        expect(error.message).toBe('42');
      });
    });
  });

  describe('isLLMModifyError', () => {
    it('should return true for LLMModifyError instances', () => {
      const error = new LLMModifyError(
        'msg',
        ModifyErrorCode.UNKNOWN,
        'user msg'
      );

      expect(isLLMModifyError(error)).toBe(true);
    });

    it('should return true for factory-created instances', () => {
      expect(isLLMModifyError(LLMModifyError.timeout())).toBe(true);
      expect(isLLMModifyError(LLMModifyError.apiKeyMissing())).toBe(true);
      expect(isLLMModifyError(LLMModifyError.rateLimit())).toBe(true);
    });

    it('should return false for regular Error', () => {
      expect(isLLMModifyError(new Error('regular'))).toBe(false);
    });

    it('should return false for non-error objects', () => {
      expect(isLLMModifyError({ code: 'UNKNOWN', message: 'fake' })).toBe(false);
    });

    it('should return false for null and undefined', () => {
      expect(isLLMModifyError(null)).toBe(false);
      expect(isLLMModifyError(undefined)).toBe(false);
    });

    it('should return false for primitive values', () => {
      expect(isLLMModifyError('error string')).toBe(false);
      expect(isLLMModifyError(42)).toBe(false);
    });
  });

  describe('toLLMModifyError', () => {
    it('should return the same instance for LLMModifyError', () => {
      const original = LLMModifyError.timeout();
      const result = toLLMModifyError(original);

      expect(result).toBe(original);
    });

    it('should convert Error with "API key" to apiKeyMissing', () => {
      const error = new Error('Missing API key');
      const result = toLLMModifyError(error);

      expect(result.code).toBe(ModifyErrorCode.API_KEY_MISSING);
    });

    it('should convert Error with "rate limit" to rateLimit', () => {
      const error = new Error('rate limit exceeded');
      const result = toLLMModifyError(error);

      expect(result.code).toBe(ModifyErrorCode.API_RATE_LIMIT);
    });

    it('should convert Error with "429" to rateLimit', () => {
      const error = new Error('HTTP 429 Too Many Requests');
      const result = toLLMModifyError(error);

      expect(result.code).toBe(ModifyErrorCode.API_RATE_LIMIT);
    });

    it('should convert Error with "timeout" to timeout', () => {
      const error = new Error('Request timeout');
      const result = toLLMModifyError(error);

      expect(result.code).toBe(ModifyErrorCode.API_TIMEOUT);
    });

    it('should convert Error with "ETIMEDOUT" to timeout', () => {
      const error = new Error('connect ETIMEDOUT');
      const result = toLLMModifyError(error);

      expect(result.code).toBe(ModifyErrorCode.API_TIMEOUT);
    });

    it('should convert unrecognized Error to unknown', () => {
      const error = new Error('something weird happened');
      const result = toLLMModifyError(error);

      expect(result.code).toBe(ModifyErrorCode.UNKNOWN);
      expect(result.message).toBe('something weird happened');
    });

    it('should convert non-Error values to unknown', () => {
      const result = toLLMModifyError('raw string error');

      expect(result.code).toBe(ModifyErrorCode.UNKNOWN);
      expect(result.message).toBe('raw string error');
    });

    it('should convert null to unknown', () => {
      const result = toLLMModifyError(null);

      expect(result.code).toBe(ModifyErrorCode.UNKNOWN);
    });
  });
});
