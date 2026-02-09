import { describe, it, expect } from 'vitest';
import { parseJSONFromLLMResponse } from '@/lib/llm/jsonParser';

describe('parseJSONFromLLMResponse', () => {
  const validSpec = {
    nodes: [
      { id: 'user', type: 'user', label: 'User' },
      { id: 'fw', type: 'firewall', label: 'Firewall' },
    ],
    connections: [
      { source: 'user', target: 'fw' },
    ],
  };

  it('should parse direct JSON', () => {
    const result = parseJSONFromLLMResponse(JSON.stringify(validSpec));
    expect(result).toEqual(validSpec);
  });

  it('should parse JSON from markdown code block', () => {
    const content = `Here's the infrastructure:\n\`\`\`json\n${JSON.stringify(validSpec)}\n\`\`\``;
    const result = parseJSONFromLLMResponse(content);
    expect(result).toEqual(validSpec);
  });

  it('should parse JSON from code block without json tag', () => {
    const content = `\`\`\`\n${JSON.stringify(validSpec)}\n\`\`\``;
    const result = parseJSONFromLLMResponse(content);
    expect(result).toEqual(validSpec);
  });

  it('should parse JSON embedded in text', () => {
    const content = `Here is the result:\n${JSON.stringify(validSpec)}\nDone.`;
    const result = parseJSONFromLLMResponse(content);
    expect(result).toEqual(validSpec);
  });

  it('should return null for invalid JSON', () => {
    const result = parseJSONFromLLMResponse('not valid json at all');
    expect(result).toBeNull();
  });

  it('should return null for valid JSON but invalid spec', () => {
    const result = parseJSONFromLLMResponse('{"hello": "world"}');
    expect(result).toBeNull();
  });

  it('should return null for empty string', () => {
    const result = parseJSONFromLLMResponse('');
    expect(result).toBeNull();
  });

  it('should handle spec with zones', () => {
    const specWithZones = {
      ...validSpec,
      zones: [{ id: 'dmz', label: 'DMZ', type: 'dmz' }],
    };
    const result = parseJSONFromLLMResponse(JSON.stringify(specWithZones));
    expect(result).toEqual(specWithZones);
  });
});
