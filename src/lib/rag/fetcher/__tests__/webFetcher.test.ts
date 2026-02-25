import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchUrl, htmlToText, contentHash } from '../webFetcher';

// ---------------------------------------------------------------------------
// Mock global.fetch
// ---------------------------------------------------------------------------

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// htmlToText
// ---------------------------------------------------------------------------

describe('htmlToText', () => {
  it('strips script and style tags', () => {
    const html = '<html><head><style>body { color: red; }</style></head><body><script>alert("xss")</script>Hello</body></html>';
    expect(htmlToText(html)).toBe('Hello');
  });

  it('strips HTML tags', () => {
    expect(htmlToText('<p>Hello <b>World</b></p>')).toBe('Hello World');
  });

  it('replaces block elements with newlines', () => {
    const html = '<p>First</p><p>Second</p>';
    const result = htmlToText(html);
    expect(result).toContain('First');
    expect(result).toContain('Second');
    expect(result).toContain('\n');
  });

  it('handles br tags', () => {
    const result = htmlToText('Line 1<br/>Line 2<br>Line 3');
    expect(result).toContain('Line 1');
    expect(result).toContain('Line 2');
    expect(result).toContain('Line 3');
  });

  it('decodes HTML entities', () => {
    const result = htmlToText('&amp; &lt; &gt; &quot; &#39; &nbsp;');
    expect(result).toContain('&');
    expect(result).toContain('<');
    expect(result).toContain('>');
    expect(result).toContain('"');
    expect(result).toContain("'");
  });

  it('removes HTML comments', () => {
    expect(htmlToText('Hello <!-- comment --> World')).toBe('Hello World');
  });

  it('normalizes whitespace', () => {
    expect(htmlToText('  Hello   World  ')).toBe('Hello World');
  });

  it('collapses excessive newlines', () => {
    const html = '<p>A</p>\n\n\n\n<p>B</p>';
    const result = htmlToText(html);
    expect(result).not.toMatch(/\n{3,}/);
  });

  it('returns empty string for empty input', () => {
    expect(htmlToText('')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// contentHash
// ---------------------------------------------------------------------------

describe('contentHash', () => {
  it('returns an 8-character hex string', () => {
    const hash = contentHash('hello world');
    expect(hash).toMatch(/^[0-9a-f]{8}$/);
  });

  it('returns same hash for same content', () => {
    expect(contentHash('test')).toBe(contentHash('test'));
  });

  it('returns different hash for different content', () => {
    expect(contentHash('test1')).not.toBe(contentHash('test2'));
  });

  it('handles empty string', () => {
    const hash = contentHash('');
    expect(hash).toMatch(/^[0-9a-f]{8}$/);
  });
});

// ---------------------------------------------------------------------------
// fetchUrl
// ---------------------------------------------------------------------------

describe('fetchUrl', () => {
  it('fetches and returns plain text content', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'text/plain' }),
      text: () => Promise.resolve('Hello World'),
    });

    const result = await fetchUrl('https://example.com/test.txt');

    expect(result.content).toBe('Hello World');
    expect(result.contentLength).toBe(11);
    expect(result.contentHash).toMatch(/^[0-9a-f]{8}$/);
    expect(result.url).toBe('https://example.com/test.txt');
  });

  it('converts HTML to text', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'text/html; charset=utf-8' }),
      text: () => Promise.resolve('<html><body><p>Hello</p></body></html>'),
    });

    const result = await fetchUrl('https://example.com');

    expect(result.content).toBe('Hello');
    expect(result.contentType).toContain('text/html');
  });

  it('truncates content at maxBytes', async () => {
    const longContent = 'A'.repeat(100_000);
    mockFetch.mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'text/plain' }),
      text: () => Promise.resolve(longContent),
    });

    const result = await fetchUrl('https://example.com', { maxBytes: 1000 });

    expect(result.content).toHaveLength(1000);
    expect(result.contentLength).toBe(1000);
  });

  it('throws on HTTP error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    await expect(fetchUrl('https://example.com/missing')).rejects.toThrow('HTTP 404');
  });

  it('passes abort signal for timeout', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'text/plain' }),
      text: () => Promise.resolve('content'),
    });

    await fetchUrl('https://example.com', { timeoutMs: 5000 });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it('sets User-Agent header', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'text/plain' }),
      text: () => Promise.resolve('content'),
    });

    await fetchUrl('https://example.com');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({
        headers: expect.objectContaining({
          'User-Agent': 'InfraFlow-RAG/1.0',
        }),
      }),
    );
  });

  it('handles missing content-type header', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      headers: new Headers(),
      text: () => Promise.resolve('<p>Hello</p>'),
    });

    const result = await fetchUrl('https://example.com');

    // Default content type is text/html, so HTML should be stripped
    expect(result.content).toBe('Hello');
  });
});
