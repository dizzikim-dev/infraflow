import { describe, it, expect } from 'vitest';
import { CrawlRequestSchema, DirectIndexRequestSchema } from '../ragApi';

// ---------------------------------------------------------------------------
// CrawlRequestSchema
// ---------------------------------------------------------------------------

describe('CrawlRequestSchema', () => {
  it('accepts valid crawl request', () => {
    const result = CrawlRequestSchema.safeParse({
      url: 'https://github.com/ollama/ollama',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.url).toBe('https://github.com/ollama/ollama');
      expect(result.data.forceRefresh).toBe(false); // default
    }
  });

  it('accepts request with all optional fields', () => {
    const result = CrawlRequestSchema.safeParse({
      url: 'https://example.com/docs',
      forceRefresh: true,
      tags: ['ai', 'docs'],
      title: 'Example Docs',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.forceRefresh).toBe(true);
      expect(result.data.tags).toEqual(['ai', 'docs']);
      expect(result.data.title).toBe('Example Docs');
    }
  });

  it('rejects missing url', () => {
    const result = CrawlRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects invalid url', () => {
    const result = CrawlRequestSchema.safeParse({ url: 'not-a-url' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('URL');
    }
  });

  it('rejects url exceeding 2048 characters', () => {
    const result = CrawlRequestSchema.safeParse({
      url: `https://example.com/${'a'.repeat(2048)}`,
    });
    expect(result.success).toBe(false);
  });

  it('rejects too many tags', () => {
    const result = CrawlRequestSchema.safeParse({
      url: 'https://example.com',
      tags: Array.from({ length: 11 }, (_, i) => `tag-${i}`),
    });
    expect(result.success).toBe(false);
  });

  it('rejects title exceeding 200 characters', () => {
    const result = CrawlRequestSchema.safeParse({
      url: 'https://example.com',
      title: 'x'.repeat(201),
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// DirectIndexRequestSchema
// ---------------------------------------------------------------------------

describe('DirectIndexRequestSchema', () => {
  it('accepts valid direct index request', () => {
    const result = DirectIndexRequestSchema.safeParse({
      content: 'Some content about Ollama inference engine',
      title: 'Ollama Overview',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toContain('Ollama');
      expect(result.data.title).toBe('Ollama Overview');
    }
  });

  it('accepts request with all optional fields', () => {
    const result = DirectIndexRequestSchema.safeParse({
      content: 'Content here',
      title: 'Title',
      sourceUrl: 'https://example.com',
      tags: ['test'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing content', () => {
    const result = DirectIndexRequestSchema.safeParse({
      title: 'Title',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty content', () => {
    const result = DirectIndexRequestSchema.safeParse({
      content: '',
      title: 'Title',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('콘텐츠');
    }
  });

  it('rejects content exceeding 50KB', () => {
    const result = DirectIndexRequestSchema.safeParse({
      content: 'x'.repeat(51201),
      title: 'Title',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing title', () => {
    const result = DirectIndexRequestSchema.safeParse({
      content: 'Some content',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty title', () => {
    const result = DirectIndexRequestSchema.safeParse({
      content: 'Some content',
      title: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('제목');
    }
  });

  it('rejects invalid sourceUrl', () => {
    const result = DirectIndexRequestSchema.safeParse({
      content: 'Content',
      title: 'Title',
      sourceUrl: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  it('accepts request without sourceUrl', () => {
    const result = DirectIndexRequestSchema.safeParse({
      content: 'Content',
      title: 'Title',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sourceUrl).toBeUndefined();
    }
  });
});
