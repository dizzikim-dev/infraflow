import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSessionId, trackActivity } from '../trackActivity';

// ============================================================
// Setup: mock global fetch
// ============================================================

const mockFetch = vi.fn().mockResolvedValue({ ok: true });
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockClear();
});

// ============================================================
// getSessionId
// ============================================================

describe('getSessionId', () => {
  it('should return a consistent 8-character string', () => {
    const id = getSessionId();
    expect(id).toHaveLength(8);
    expect(typeof id).toBe('string');
  });

  it('should return the same value on repeated calls (singleton)', () => {
    const first = getSessionId();
    const second = getSessionId();
    expect(first).toBe(second);
  });
});

// ============================================================
// trackActivity
// ============================================================

describe('trackActivity', () => {
  it('should POST to /api/activity with correct payload shape', async () => {
    await trackActivity('node_add', {
      diagramId: 'diag-123',
      prompt: 'add a firewall',
      detail: { nodeType: 'firewall' },
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/activity');
    expect(options.method).toBe('POST');
    expect(options.headers).toEqual({ 'Content-Type': 'application/json' });

    const body = JSON.parse(options.body);
    expect(body).toEqual({
      type: 'node_add',
      sessionId: getSessionId(),
      diagramId: 'diag-123',
      prompt: 'add a firewall',
      detail: { nodeType: 'firewall' },
    });
  });

  it('should default diagramId to null when not provided', async () => {
    await trackActivity('prompt_submit');

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.diagramId).toBeNull();
  });

  it('should include sessionId of length 8 in every request', async () => {
    await trackActivity('export');
    await trackActivity('diagram_create', { diagramId: 'd-1' });

    for (const call of mockFetch.mock.calls) {
      const body = JSON.parse(call[1].body);
      expect(body.sessionId).toHaveLength(8);
      expect(body.sessionId).toBe(getSessionId());
    }
  });

  it('should NOT throw when fetch rejects (fire-and-forget)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network failure'));

    // Must not throw
    await expect(trackActivity('edge_add')).resolves.toBeUndefined();
  });

  it('should NOT throw when fetch throws synchronously', async () => {
    mockFetch.mockImplementationOnce(() => {
      throw new Error('Sync error');
    });

    await expect(trackActivity('node_delete')).resolves.toBeUndefined();
  });
});
