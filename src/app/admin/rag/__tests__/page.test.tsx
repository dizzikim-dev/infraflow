import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminRAGPage from '../page';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn().mockReturnValue({ push: vi.fn(), replace: vi.fn() }),
  usePathname: vi.fn().mockReturnValue('/admin/rag'),
}));

// ---------------------------------------------------------------------------
// Mock fetch responses
// ---------------------------------------------------------------------------

const mockHealthResponse = {
  success: true,
  data: {
    connected: true,
    collections: [
      { name: 'infraflow-ai-software', count: 10 },
      { name: 'infraflow-external-content', count: 5 },
    ],
    totalDocuments: 15,
    config: {
      maxBytes: 51200,
      ttlSeconds: 86400,
      confidenceThreshold: 0.5,
      timeoutMs: 2500,
      embeddingModel: 'text-embedding-ada-002',
      defaultTopK: 10,
      similarityThreshold: 0.7,
    },
  },
};

const mockExternalContentResponse = {
  success: true,
  data: {
    items: [
      {
        id: 'ext-abc1',
        title: 'Ollama',
        sourceUrl: 'https://github.com/ollama/ollama',
        sourceType: 'github-readme',
        fetchedAt: 1700000000000,
        contentLength: 5000,
        tags: ['ai', 'llm'],
        contentPreview: 'Run LLMs locally...',
      },
      {
        id: 'ext-abc2',
        title: 'ChromaDB Docs',
        sourceUrl: 'https://chromadb.dev',
        sourceType: 'web-page',
        fetchedAt: 1700000001000,
        contentLength: 3000,
        tags: ['vector-db'],
        contentPreview: 'ChromaDB is an open-source...',
      },
    ],
    total: 2,
    limit: 20,
    offset: 0,
  },
};

let fetchCallCount: number;

function setupFetch(overrides?: Partial<{
  health: object;
  externalContent: object;
}>) {
  fetchCallCount = 0;
  const healthRes = overrides?.health ?? mockHealthResponse;
  const contentRes = overrides?.externalContent ?? mockExternalContentResponse;

  global.fetch = vi.fn().mockImplementation((url: string) => {
    fetchCallCount++;
    if (url.includes('/api/admin/rag/health')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(healthRes),
      });
    }
    if (url.includes('/api/admin/rag/external-content')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(contentRes),
      });
    }
    if (url.includes('/api/admin/rag/crawl')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, title: 'Test', contentLength: 100 }),
      });
    }
    if (url.includes('/api/admin/rag/index')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, title: 'Indexed', contentLength: 200 }),
      });
    }
    return Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ success: false, error: 'Not found' }),
    });
  });
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  setupFetch();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AdminRAGPage', () => {
  it('renders loading skeleton initially', () => {
    // Make fetch hang to see skeleton
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<AdminRAGPage />);

    // Skeleton has animate-pulse elements
    const pulses = document.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThan(0);
  });

  it('renders health card with ChromaDB status', async () => {
    render(<AdminRAGPage />);

    await waitFor(() => {
      expect(screen.getByText('ChromaDB 상태')).toBeDefined();
    });

    expect(screen.getByText('Online')).toBeDefined();
    expect(screen.getByText('15')).toBeDefined(); // total documents
  });

  it('renders collection counts', async () => {
    render(<AdminRAGPage />);

    await waitFor(() => {
      expect(screen.getByText('infraflow-ai-software')).toBeDefined();
    });

    expect(screen.getByText('infraflow-external-content')).toBeDefined();
  });

  it('renders system config', async () => {
    render(<AdminRAGPage />);

    await waitFor(() => {
      expect(screen.getByText('시스템 설정')).toBeDefined();
    });

    expect(screen.getByText('text-embedding-ada-002')).toBeDefined();
    expect(screen.getByText('50KB')).toBeDefined();
    expect(screen.getByText('24시간')).toBeDefined();
  });

  it('renders crawl and index forms', async () => {
    render(<AdminRAGPage />);

    await waitFor(() => {
      expect(screen.getByText('URL 크롤')).toBeDefined();
    });

    expect(screen.getByText('직접 인덱싱')).toBeDefined();
  });

  it('renders external content table', async () => {
    render(<AdminRAGPage />);

    await waitFor(() => {
      expect(screen.getByText('외부 콘텐츠 (2)')).toBeDefined();
    });

    expect(screen.getByText('Ollama')).toBeDefined();
    expect(screen.getByText('ChromaDB Docs')).toBeDefined();
  });

  it('displays source type badges', async () => {
    render(<AdminRAGPage />);

    await waitFor(() => {
      expect(screen.getByText('GitHub')).toBeDefined();
    });

    expect(screen.getByText('Web')).toBeDefined();
  });

  it('shows error state when health fails', async () => {
    setupFetch({
      health: { success: false, error: 'Connection refused' },
    });

    render(<AdminRAGPage />);

    await waitFor(() => {
      expect(screen.getByText('오류 발생')).toBeDefined();
    });

    expect(screen.getByText('Connection refused')).toBeDefined();
  });

  it('shows Offline when ChromaDB disconnected', async () => {
    setupFetch({
      health: {
        success: true,
        data: {
          ...mockHealthResponse.data,
          connected: false,
          collections: [],
          totalDocuments: 0,
        },
      },
    });

    render(<AdminRAGPage />);

    await waitFor(() => {
      expect(screen.getByText('Offline')).toBeDefined();
    });
  });

  it('shows empty state when no external content', async () => {
    setupFetch({
      externalContent: { success: true, data: { items: [], total: 0, limit: 20, offset: 0 } },
    });

    render(<AdminRAGPage />);

    await waitFor(() => {
      expect(screen.getByText('인덱싱된 외부 콘텐츠가 없습니다')).toBeDefined();
    });
  });

  it('displays tags on content items', async () => {
    render(<AdminRAGPage />);

    await waitFor(() => {
      expect(screen.getByText('ai')).toBeDefined();
    });

    expect(screen.getByText('llm')).toBeDefined();
    expect(screen.getByText('vector-db')).toBeDefined();
  });

  it('renders page header and description', async () => {
    render(<AdminRAGPage />);

    await waitFor(() => {
      expect(screen.getByText('RAG 관리')).toBeDefined();
    });
  });

  it('has refresh button for health', async () => {
    render(<AdminRAGPage />);

    await waitFor(() => {
      expect(screen.getByText('새로고침')).toBeDefined();
    });
  });

  it('renders crawl form with URL input', async () => {
    render(<AdminRAGPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('URL')).toBeDefined();
    });

    expect(screen.getByText('크롤 실행')).toBeDefined();
  });

  it('renders index form with title and content', async () => {
    render(<AdminRAGPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('제목')).toBeDefined();
    });

    expect(screen.getByLabelText('내용')).toBeDefined();
    expect(screen.getByText('인덱싱 실행')).toBeDefined();
  });
});
