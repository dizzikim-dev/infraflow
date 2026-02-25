import { describe, it, expect } from 'vitest';
import { parseEnhancedLLMResponse } from '../jsonParser';

describe('parseEnhancedLLMResponse', () => {
  it('parses spec-only response (backward compatible)', () => {
    const content = JSON.stringify({
      nodes: [{ id: 'n1', type: 'firewall', label: 'FW' }],
      connections: [],
    });
    const result = parseEnhancedLLMResponse(content);
    expect(result.spec).toBeDefined();
    expect(result.spec?.nodes).toHaveLength(1);
    expect(result.meta).toBeNull();
  });

  it('parses spec + meta response', () => {
    const content = JSON.stringify({
      spec: {
        nodes: [{ id: 'n1', type: 'firewall', label: 'FW' }],
        connections: [],
      },
      meta: {
        summary: '핵심 결론',
        assumptions: ['트래픽 월 10만'],
        options: [
          { name: 'Option A', pros: ['저렴'], cons: ['제한'] },
          { name: 'Option B', pros: ['유연'], cons: ['비쌈'] },
        ],
        tradeoffs: ['비용 vs 유연성'],
        artifacts: ['terraform'],
      },
    });
    const result = parseEnhancedLLMResponse(content);
    expect(result.spec).toBeDefined();
    expect(result.meta).toBeDefined();
    expect(result.meta?.summary).toBe('핵심 결론');
    expect(result.meta?.options).toHaveLength(2);
  });

  it('returns null meta when meta parsing fails', () => {
    const content = JSON.stringify({
      spec: {
        nodes: [{ id: 'n1', type: 'firewall', label: 'FW' }],
        connections: [],
      },
      meta: { summary: 123 }, // invalid type
    });
    const result = parseEnhancedLLMResponse(content);
    expect(result.spec).toBeDefined();
    expect(result.meta).toBeNull(); // graceful degradation
  });

  it('handles malformed JSON gracefully', () => {
    const result = parseEnhancedLLMResponse('not json at all');
    expect(result.spec).toBeNull();
    expect(result.meta).toBeNull();
  });

  it('extracts from markdown code block', () => {
    const content = '```json\n' + JSON.stringify({
      spec: { nodes: [{ id: 'n1', type: 'waf', label: 'WAF' }], connections: [] },
      meta: { summary: 'test', assumptions: [], options: [], tradeoffs: [], artifacts: [] },
    }) + '\n```';
    const result = parseEnhancedLLMResponse(content);
    expect(result.spec).toBeDefined();
    expect(result.meta?.summary).toBe('test');
  });
});
