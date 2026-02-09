import { describe, it, expect } from 'vitest';
import {
  parseJSONFromText,
  validateLLMResponse,
  toOperations,
  LLMValidationError,
} from '@/lib/parser/responseValidator';

describe('responseValidator', () => {
  describe('parseJSONFromText', () => {
    it('should extract JSON from markdown code block with json tag', () => {
      const text = `Here is the result:
\`\`\`json
{
  "reasoning": "테스트",
  "operations": [{"type": "remove", "target": "fw-1"}]
}
\`\`\``;

      const result = parseJSONFromText(text) as Record<string, unknown>;

      expect(result.reasoning).toBe('테스트');
      expect(result.operations).toHaveLength(1);
    });

    it('should extract JSON from markdown code block without json tag', () => {
      const text = `Response:
\`\`\`
{"reasoning": "test", "operations": []}
\`\`\``;

      const result = parseJSONFromText(text) as Record<string, unknown>;

      expect(result.reasoning).toBe('test');
    });

    it('should extract raw JSON object from text', () => {
      const text = `Some text before {"reasoning": "raw json", "operations": [{"type": "remove", "target": "x"}]} some text after`;

      const result = parseJSONFromText(text) as Record<string, unknown>;

      expect(result.reasoning).toBe('raw json');
    });

    it('should handle nested JSON objects correctly', () => {
      const text = `{"reasoning": "nested", "operations": [{"type": "modify", "target": "fw-1", "data": {"label": "New Label"}}]}`;

      const result = parseJSONFromText(text) as Record<string, unknown>;

      expect(result.reasoning).toBe('nested');
      const ops = result.operations as Array<Record<string, unknown>>;
      expect(ops[0].type).toBe('modify');
    });

    it('should throw LLMValidationError on input with no JSON', () => {
      expect(() => parseJSONFromText('no json here at all')).toThrow(LLMValidationError);
    });

    it('should throw on empty string', () => {
      expect(() => parseJSONFromText('')).toThrow(LLMValidationError);
    });

    it('should handle JSON with special characters in strings', () => {
      const text = '{"reasoning": "value with special chars: @#$%", "operations": [{"type": "remove", "target": "x"}]}';

      const result = parseJSONFromText(text) as Record<string, unknown>;
      expect(result.reasoning).toContain('special chars');
    });
  });

  describe('validateLLMResponse', () => {
    it('should accept a valid response with operations', () => {
      const data = {
        reasoning: '방화벽을 추가합니다',
        operations: [
          {
            type: 'add',
            target: 'firewall',
            data: {
              label: 'New Firewall',
              tier: 'dmz',
            },
          },
        ],
      };

      const result = validateLLMResponse(data);

      expect(result.reasoning).toBe('방화벽을 추가합니다');
      expect(result.operations).toHaveLength(1);
      expect(result.operations[0].type).toBe('add');
    });

    it('should reject response with missing reasoning', () => {
      const data = {
        operations: [{ type: 'remove', target: 'fw-1' }],
      };

      expect(() => validateLLMResponse(data)).toThrow(LLMValidationError);
    });

    it('should reject response with empty reasoning', () => {
      const data = {
        reasoning: '',
        operations: [{ type: 'remove', target: 'fw-1' }],
      };

      expect(() => validateLLMResponse(data)).toThrow(LLMValidationError);
    });

    it('should reject response with empty operations array', () => {
      const data = {
        reasoning: '이유',
        operations: [],
      };

      expect(() => validateLLMResponse(data)).toThrow(LLMValidationError);
    });

    it('should reject response with missing operations', () => {
      const data = {
        reasoning: '이유',
      };

      expect(() => validateLLMResponse(data)).toThrow(LLMValidationError);
    });

    describe('operation type validation', () => {
      it('should validate replace operation schema', () => {
        const data = {
          reasoning: 'test',
          operations: [
            {
              type: 'replace',
              target: 'fw-1',
              data: {
                newType: 'waf',
                label: 'WAF',
                preserveConnections: true,
              },
            },
          ],
        };

        const result = validateLLMResponse(data);
        expect(result.operations[0].type).toBe('replace');
      });

      it('should reject replace with empty target', () => {
        const data = {
          reasoning: 'test',
          operations: [
            {
              type: 'replace',
              target: '',
              data: { newType: 'waf' },
            },
          ],
        };

        expect(() => validateLLMResponse(data)).toThrow(LLMValidationError);
      });

      it('should reject replace with empty newType', () => {
        const data = {
          reasoning: 'test',
          operations: [
            {
              type: 'replace',
              target: 'fw-1',
              data: { newType: '' },
            },
          ],
        };

        expect(() => validateLLMResponse(data)).toThrow(LLMValidationError);
      });

      it('should validate add operation schema', () => {
        const data = {
          reasoning: 'test',
          operations: [
            {
              type: 'add',
              target: 'waf',
              data: {
                label: 'WAF',
                tier: 'dmz',
                afterNode: 'fw-1',
                beforeNode: 'web-1',
              },
            },
          ],
        };

        const result = validateLLMResponse(data);
        expect(result.operations[0].type).toBe('add');
      });

      it('should validate add operation with betweenNodes tuple', () => {
        const data = {
          reasoning: 'test',
          operations: [
            {
              type: 'add',
              target: 'waf',
              data: {
                betweenNodes: ['fw-1', 'web-1'],
              },
            },
          ],
        };

        const result = validateLLMResponse(data);
        expect(result.operations[0].type).toBe('add');
      });

      it('should validate add operation with no data (optional)', () => {
        const data = {
          reasoning: 'test',
          operations: [
            {
              type: 'add',
              target: 'waf',
            },
          ],
        };

        const result = validateLLMResponse(data);
        expect(result.operations[0].type).toBe('add');
      });

      it('should validate remove operation schema', () => {
        const data = {
          reasoning: 'test',
          operations: [
            {
              type: 'remove',
              target: 'fw-1',
            },
          ],
        };

        const result = validateLLMResponse(data);
        expect(result.operations[0].type).toBe('remove');
      });

      it('should reject remove with empty target', () => {
        const data = {
          reasoning: 'test',
          operations: [
            {
              type: 'remove',
              target: '',
            },
          ],
        };

        expect(() => validateLLMResponse(data)).toThrow(LLMValidationError);
      });

      it('should validate modify operation schema', () => {
        const data = {
          reasoning: 'test',
          operations: [
            {
              type: 'modify',
              target: 'fw-1',
              data: {
                label: 'New Label',
                description: 'New Desc',
                tier: 'internal',
              },
            },
          ],
        };

        const result = validateLLMResponse(data);
        expect(result.operations[0].type).toBe('modify');
      });

      it('should reject modify with invalid tier', () => {
        const data = {
          reasoning: 'test',
          operations: [
            {
              type: 'modify',
              target: 'fw-1',
              data: {
                tier: 'invalid-tier',
              },
            },
          ],
        };

        expect(() => validateLLMResponse(data)).toThrow(LLMValidationError);
      });

      it('should validate connect operation schema', () => {
        const data = {
          reasoning: 'test',
          operations: [
            {
              type: 'connect',
              data: {
                source: 'fw-1',
                target: 'web-1',
                flowType: 'request',
                label: 'HTTPS',
              },
            },
          ],
        };

        const result = validateLLMResponse(data);
        expect(result.operations[0].type).toBe('connect');
      });

      it('should reject connect with empty source', () => {
        const data = {
          reasoning: 'test',
          operations: [
            {
              type: 'connect',
              data: {
                source: '',
                target: 'web-1',
              },
            },
          ],
        };

        expect(() => validateLLMResponse(data)).toThrow(LLMValidationError);
      });

      it('should reject connect with invalid flowType', () => {
        const data = {
          reasoning: 'test',
          operations: [
            {
              type: 'connect',
              data: {
                source: 'fw-1',
                target: 'web-1',
                flowType: 'invalid-flow',
              },
            },
          ],
        };

        expect(() => validateLLMResponse(data)).toThrow(LLMValidationError);
      });

      it('should validate disconnect operation schema', () => {
        const data = {
          reasoning: 'test',
          operations: [
            {
              type: 'disconnect',
              data: {
                source: 'fw-1',
                target: 'web-1',
              },
            },
          ],
        };

        const result = validateLLMResponse(data);
        expect(result.operations[0].type).toBe('disconnect');
      });

      it('should reject unknown operation type', () => {
        const data = {
          reasoning: 'test',
          operations: [
            {
              type: 'unknown-op',
              target: 'fw-1',
            },
          ],
        };

        expect(() => validateLLMResponse(data)).toThrow(LLMValidationError);
      });
    });

    it('should validate response with multiple operations', () => {
      const data = {
        reasoning: '보안 강화를 위해 WAF 추가 및 연결',
        operations: [
          { type: 'add', target: 'waf', data: { label: 'WAF' } },
          { type: 'connect', data: { source: 'fw-1', target: 'waf-1' } },
          { type: 'remove', target: 'old-node' },
        ],
      };

      const result = validateLLMResponse(data);
      expect(result.operations).toHaveLength(3);
    });
  });

  describe('toOperations', () => {
    it('should convert validated response to Operation array', () => {
      const response = {
        reasoning: 'test',
        operations: [
          { type: 'remove' as const, target: 'fw-1' },
          {
            type: 'add' as const,
            target: 'waf',
            data: { label: 'WAF' },
          },
        ],
      };

      const ops = toOperations(response);

      expect(ops).toHaveLength(2);
      expect(ops[0].type).toBe('remove');
      expect(ops[1].type).toBe('add');
    });

    it('should preserve all operation fields', () => {
      const response = {
        reasoning: 'test',
        operations: [
          {
            type: 'connect' as const,
            data: {
              source: 'fw-1',
              target: 'web-1',
              flowType: 'encrypted' as const,
              label: 'TLS',
            },
          },
        ],
      };

      const ops = toOperations(response);

      expect(ops[0]).toEqual({
        type: 'connect',
        data: {
          source: 'fw-1',
          target: 'web-1',
          flowType: 'encrypted',
          label: 'TLS',
        },
      });
    });
  });

  describe('LLMValidationError', () => {
    it('should be an instance of Error', () => {
      const err = new LLMValidationError('test error', []);
      expect(err).toBeInstanceOf(Error);
    });

    it('should have correct name', () => {
      const err = new LLMValidationError('test error', []);
      expect(err.name).toBe('LLMValidationError');
    });

    it('should carry error issues', () => {
      const issues = [{ message: 'field missing', path: ['reasoning'], code: 'invalid_type' as const, expected: 'string', received: 'undefined' }];
      const err = new LLMValidationError('test', issues as any);
      expect(err.errors).toHaveLength(1);
    });
  });
});
