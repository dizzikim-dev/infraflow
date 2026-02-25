import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock chromadb
// ---------------------------------------------------------------------------

const mockGet = vi.fn();
const mockDelete = vi.fn();
const mockGetOrCreateCollection = vi.fn().mockResolvedValue({
  get: mockGet,
  delete: mockDelete,
});
const mockHeartbeat = vi.fn();

vi.mock('chromadb', () => {
  const MockChromaClient = vi.fn().mockImplementation(function (
    this: {
      heartbeat: typeof mockHeartbeat;
      getOrCreateCollection: typeof mockGetOrCreateCollection;
    },
  ) {
    this.heartbeat = mockHeartbeat;
    this.getOrCreateCollection = mockGetOrCreateCollection;
  });
  return { ChromaClient: MockChromaClient };
});

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { resetChromaClient } from '../../chromaClient';
import { isCached, getCachedContent, invalidateCache, normalizeUrl } from '../fetchCache';

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  resetChromaClient();
  mockHeartbeat.mockReset();
  mockGet.mockReset();
  mockDelete.mockReset();
  mockGetOrCreateCollection.mockClear();
});

// ---------------------------------------------------------------------------
// normalizeUrl
// ---------------------------------------------------------------------------

describe('normalizeUrl', () => {
  it('removes trailing slash', () => {
    expect(normalizeUrl('https://example.com/path/')).toBe('https://example.com/path');
  });

  it('preserves root slash', () => {
    const normalized = normalizeUrl('https://example.com/');
    expect(normalized).toBe('https://example.com/');
  });

  it('removes fragment', () => {
    expect(normalizeUrl('https://example.com/page#section')).toBe('https://example.com/page');
  });

  it('sorts query parameters', () => {
    const result = normalizeUrl('https://example.com/page?b=2&a=1');
    expect(result).toBe('https://example.com/page?a=1&b=2');
  });

  it('returns invalid URL as-is', () => {
    expect(normalizeUrl('not-a-url')).toBe('not-a-url');
  });

  it('lowercases hostname', () => {
    const result = normalizeUrl('https://EXAMPLE.COM/Path');
    expect(result).toContain('example.com');
  });
});

// ---------------------------------------------------------------------------
// isCached
// ---------------------------------------------------------------------------

describe('isCached', () => {
  it('returns false when ChromaDB is unavailable', async () => {
    mockHeartbeat.mockRejectedValue(new Error('Connection refused'));

    const result = await isCached('https://example.com');
    expect(result).toBe(false);
  });

  it('returns false when no matching documents', async () => {
    mockHeartbeat.mockResolvedValue(true);
    mockGet.mockResolvedValue({ ids: [], metadatas: [], documents: [] });

    const result = await isCached('https://example.com');
    expect(result).toBe(false);
  });

  it('returns true when cached and not expired', async () => {
    mockHeartbeat.mockResolvedValue(true);
    mockGet.mockResolvedValue({
      ids: ['ext-12345678'],
      metadatas: [{ fetchedAt: String(Date.now() - 1000) }],
      documents: ['cached content'],
    });

    const result = await isCached('https://example.com');
    expect(result).toBe(true);
  });

  it('returns false when cache entry is expired', async () => {
    mockHeartbeat.mockResolvedValue(true);
    const expiredTime = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
    mockGet.mockResolvedValue({
      ids: ['ext-12345678'],
      metadatas: [{ fetchedAt: String(expiredTime) }],
      documents: ['expired content'],
    });

    const result = await isCached('https://example.com');
    expect(result).toBe(false);
  });

  it('returns false when metadata is missing', async () => {
    mockHeartbeat.mockResolvedValue(true);
    mockGet.mockResolvedValue({
      ids: ['ext-12345678'],
      metadatas: [null],
      documents: ['content'],
    });

    const result = await isCached('https://example.com');
    expect(result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCachedContent
// ---------------------------------------------------------------------------

describe('getCachedContent', () => {
  it('returns null when ChromaDB is unavailable', async () => {
    mockHeartbeat.mockRejectedValue(new Error('Connection refused'));

    const result = await getCachedContent('https://example.com');
    expect(result).toBeNull();
  });

  it('returns cached content when valid', async () => {
    mockHeartbeat.mockResolvedValue(true);
    mockGet.mockResolvedValue({
      ids: ['ext-12345678'],
      metadatas: [{ fetchedAt: String(Date.now() - 1000) }],
      documents: ['cached content'],
    });

    const result = await getCachedContent('https://example.com');
    expect(result).toBe('cached content');
  });

  it('returns null for expired entry', async () => {
    mockHeartbeat.mockResolvedValue(true);
    const expiredTime = Date.now() - (25 * 60 * 60 * 1000);
    mockGet.mockResolvedValue({
      ids: ['ext-12345678'],
      metadatas: [{ fetchedAt: String(expiredTime) }],
      documents: ['expired content'],
    });

    const result = await getCachedContent('https://example.com');
    expect(result).toBeNull();
  });

  it('returns null when no matching documents', async () => {
    mockHeartbeat.mockResolvedValue(true);
    mockGet.mockResolvedValue({ ids: [], metadatas: [], documents: [] });

    const result = await getCachedContent('https://example.com');
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// invalidateCache
// ---------------------------------------------------------------------------

describe('invalidateCache', () => {
  it('returns false when ChromaDB is unavailable', async () => {
    mockHeartbeat.mockRejectedValue(new Error('Connection refused'));

    const result = await invalidateCache('https://example.com');
    expect(result).toBe(false);
  });

  it('deletes matching documents and returns true', async () => {
    mockHeartbeat.mockResolvedValue(true);
    mockGet.mockResolvedValue({
      ids: ['ext-12345678'],
      metadatas: [{ sourceUrl: 'https://example.com' }],
      documents: ['content'],
    });
    mockDelete.mockResolvedValue(undefined);

    const result = await invalidateCache('https://example.com');
    expect(result).toBe(true);
    expect(mockDelete).toHaveBeenCalledWith({ ids: ['ext-12345678'] });
  });

  it('returns false when no matching documents', async () => {
    mockHeartbeat.mockResolvedValue(true);
    mockGet.mockResolvedValue({ ids: [], metadatas: [], documents: [] });

    const result = await invalidateCache('https://example.com');
    expect(result).toBe(false);
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
