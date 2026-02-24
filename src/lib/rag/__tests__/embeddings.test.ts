import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock OpenAI — must be declared before imports
// ---------------------------------------------------------------------------

const mockCreate = vi.fn();

vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      embeddings = { create: mockCreate };
    },
  };
});

import {
  generateEmbedding,
  generateEmbeddings,
  buildEmbeddingText,
  EMBEDDING_DIMENSIONS,
} from '../embeddings';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe('EMBEDDING_DIMENSIONS', () => {
  it('is 1536 (ada-002)', () => {
    expect(EMBEDDING_DIMENSIONS).toBe(1536);
  });
});

// ---------------------------------------------------------------------------
// buildEmbeddingText
// ---------------------------------------------------------------------------

describe('buildEmbeddingText', () => {
  it('combines name and description', () => {
    const text = buildEmbeddingText({
      name: 'Ollama',
      description: 'LLM runner',
    });
    expect(text).toContain('Ollama');
    expect(text).toContain('LLM runner');
  });

  it('includes platforms and useCases when provided', () => {
    const text = buildEmbeddingText({
      name: 'TensorRT',
      description: 'GPU inference',
      platforms: ['Linux', 'Windows'],
      useCases: ['inference', 'optimization'],
    });
    expect(text).toContain('TensorRT');
    expect(text).toContain('GPU inference');
    expect(text).toContain('Linux');
    expect(text).toContain('Windows');
    expect(text).toContain('inference');
    expect(text).toContain('optimization');
  });

  it('handles empty platforms and useCases arrays', () => {
    const text = buildEmbeddingText({
      name: 'Test',
      description: 'Desc',
      platforms: [],
      useCases: [],
    });
    expect(text).toContain('Test');
    expect(text).toContain('Desc');
  });
});

// ---------------------------------------------------------------------------
// generateEmbedding — success path
// ---------------------------------------------------------------------------

describe('generateEmbedding', () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it('returns array of length 1536 for a single text', async () => {
    mockCreate.mockResolvedValue({
      data: [{ embedding: new Array(1536).fill(0.1) }],
    });

    const result = await generateEmbedding('test');
    expect(result).toHaveLength(1536);
    expect(result[0]).toBe(0.1);
  });

  it('handles empty text without throwing', async () => {
    mockCreate.mockResolvedValue({
      data: [{ embedding: new Array(1536).fill(0.05) }],
    });

    const result = await generateEmbedding('');
    expect(result).toHaveLength(1536);
    // Verify the API was called with a space (not empty string)
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        input: [' '],
      })
    );
  });
});

// ---------------------------------------------------------------------------
// generateEmbeddings — batch success path
// ---------------------------------------------------------------------------

describe('generateEmbeddings', () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it('returns 2 arrays each of length 1536 for batch input', async () => {
    mockCreate.mockResolvedValue({
      data: [
        { embedding: new Array(1536).fill(0.2) },
        { embedding: new Array(1536).fill(0.3) },
      ],
    });

    const results = await generateEmbeddings(['a', 'b']);
    expect(results).toHaveLength(2);
    expect(results[0]).toHaveLength(1536);
    expect(results[1]).toHaveLength(1536);
    expect(results[0][0]).toBe(0.2);
    expect(results[1][0]).toBe(0.3);
  });

  it('returns empty array for empty input', async () => {
    const results = await generateEmbeddings([]);
    expect(results).toEqual([]);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Fallback on failure — separate mock scope via vi.doMock + dynamic import
// ---------------------------------------------------------------------------

describe('Embedding fallback on failure', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock('openai', () => ({
      default: class MockOpenAIFailing {
        embeddings = {
          create: vi.fn().mockRejectedValue(new Error('API key not configured')),
        };
      },
    }));
  });

  it('should return zero vector on failure for single embedding', async () => {
    const { generateEmbedding: genEmbed } = await import('../embeddings');
    const result = await genEmbed('test');
    expect(result).toHaveLength(1536);
    expect(result.every((v: number) => v === 0)).toBe(true);
  });

  it('should return zero vectors on failure for batch embeddings', async () => {
    const { generateEmbeddings: genEmbeds } = await import('../embeddings');
    const results = await genEmbeds(['a', 'b']);
    expect(results).toHaveLength(2);
    expect(results[0]).toHaveLength(1536);
    expect(results[1]).toHaveLength(1536);
    expect(results[0].every((v: number) => v === 0)).toBe(true);
    expect(results[1].every((v: number) => v === 0)).toBe(true);
  });
});
