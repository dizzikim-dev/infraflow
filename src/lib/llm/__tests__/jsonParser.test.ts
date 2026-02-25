import { describe, it, expect, vi } from 'vitest';
import { parseJSONFromLLMResponse } from '../jsonParser';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/lib/utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// Use real isInfraSpec — we test JSON parsing with valid InfraSpec shapes
vi.mock('@/types/guards', () => ({
  isInfraSpec: (spec: unknown) => {
    if (!spec || typeof spec !== 'object') return false;
    const obj = spec as Record<string, unknown>;
    return Array.isArray(obj.nodes) && Array.isArray(obj.connections);
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_SPEC = {
  nodes: [{ id: 'fw-1', type: 'firewall', label: 'Firewall' }],
  connections: [{ source: 'fw-1', target: 'web-1' }],
};

describe('jsonParser — parseJSONFromLLMResponse', () => {
  // ---------------------------------------------------------------------------
  // Direct JSON parsing
  // ---------------------------------------------------------------------------
  it('parses valid JSON directly', () => {
    const result = parseJSONFromLLMResponse(JSON.stringify(VALID_SPEC));
    expect(result).not.toBeNull();
    expect(result!.nodes).toHaveLength(1);
    expect(result!.connections).toHaveLength(1);
  });

  it('returns null for empty string', () => {
    const result = parseJSONFromLLMResponse('');
    expect(result).toBeNull();
  });

  it('returns null for plain text with no JSON', () => {
    const result = parseJSONFromLLMResponse('Here is a firewall setup for your network.');
    expect(result).toBeNull();
  });

  it('returns null for valid JSON that is not an InfraSpec', () => {
    const notSpec = { name: 'test', value: 42 };
    const result = parseJSONFromLLMResponse(JSON.stringify(notSpec));
    expect(result).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // Markdown code block extraction
  // ---------------------------------------------------------------------------
  it('parses JSON from markdown ```json code block', () => {
    const content = `Here is the infrastructure:\n\`\`\`json\n${JSON.stringify(VALID_SPEC)}\n\`\`\`\nLet me know if you need changes.`;
    const result = parseJSONFromLLMResponse(content);
    expect(result).not.toBeNull();
    expect(result!.nodes[0].id).toBe('fw-1');
  });

  it('parses JSON from markdown ``` code block without json tag', () => {
    const content = `\`\`\`\n${JSON.stringify(VALID_SPEC)}\n\`\`\``;
    const result = parseJSONFromLLMResponse(content);
    expect(result).not.toBeNull();
    expect(result!.nodes[0].type).toBe('firewall');
  });

  // ---------------------------------------------------------------------------
  // Embedded JSON extraction (object match)
  // ---------------------------------------------------------------------------
  it('extracts JSON object embedded in surrounding text', () => {
    const content = `I recommend the following architecture:\n${JSON.stringify(VALID_SPEC)}\nThis provides good security.`;
    const result = parseJSONFromLLMResponse(content);
    expect(result).not.toBeNull();
    expect(result!.connections).toHaveLength(1);
  });

  // ---------------------------------------------------------------------------
  // Malformed / edge cases
  // ---------------------------------------------------------------------------
  it('returns null for malformed JSON', () => {
    const result = parseJSONFromLLMResponse('{ "nodes": [broken json }');
    expect(result).toBeNull();
  });

  it('returns null for JSON array (not object)', () => {
    const result = parseJSONFromLLMResponse('[1, 2, 3]');
    expect(result).toBeNull();
  });

  it('handles JSON with extra whitespace and newlines', () => {
    const spacedJson = `
    {
      "nodes": [
        { "id": "fw-1", "type": "firewall", "label": "Firewall" }
      ],
      "connections": [
        { "source": "fw-1", "target": "web-1" }
      ]
    }
    `;
    const result = parseJSONFromLLMResponse(spacedJson);
    expect(result).not.toBeNull();
    expect(result!.nodes).toHaveLength(1);
  });

  it('handles spec with empty nodes and connections arrays', () => {
    const emptySpec = { nodes: [], connections: [] };
    const result = parseJSONFromLLMResponse(JSON.stringify(emptySpec));
    expect(result).not.toBeNull();
    expect(result!.nodes).toHaveLength(0);
    expect(result!.connections).toHaveLength(0);
  });

  it('handles spec with multiple nodes and connections', () => {
    const multiSpec = {
      nodes: [
        { id: 'fw-1', type: 'firewall', label: 'Firewall' },
        { id: 'web-1', type: 'web-server', label: 'Web' },
        { id: 'db-1', type: 'db-server', label: 'Database' },
      ],
      connections: [
        { source: 'fw-1', target: 'web-1' },
        { source: 'web-1', target: 'db-1' },
      ],
    };
    const result = parseJSONFromLLMResponse(JSON.stringify(multiSpec));
    expect(result).not.toBeNull();
    expect(result!.nodes).toHaveLength(3);
    expect(result!.connections).toHaveLength(2);
  });
});
