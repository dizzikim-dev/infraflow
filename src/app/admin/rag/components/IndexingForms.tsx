'use client';

/**
 * CrawlForm + IndexForm — URL 크롤 및 직접 인덱싱 폼
 */

import { useState } from 'react';

// ---------------------------------------------------------------------------
// Crawl Form
// ---------------------------------------------------------------------------

export function CrawlForm({ onSuccess }: { onSuccess: () => void }) {
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');
  const [forceRefresh, setForceRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/rag/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          forceRefresh,
          tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const msg = data.cached
          ? '이미 캐시된 콘텐츠입니다'
          : `크롤 완료: ${data.title || url} (${data.contentLength} bytes)`;
        setResult({ success: true, message: msg });
        setUrl('');
        setTags('');
        setForceRefresh(false);
        onSuccess();
      } else {
        setResult({ success: false, message: data.error || '크롤 실패' });
      }
    } catch (err) {
      setResult({ success: false, message: err instanceof Error ? err.message : '오류 발생' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">URL 크롤</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="crawl-url" className="block text-sm font-medium text-gray-700 mb-1">URL</label>
          <input
            id="crawl-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/ollama/ollama"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="crawl-tags" className="block text-sm font-medium text-gray-700 mb-1">
            태그 (콤마 구분)
          </label>
          <input
            id="crawl-tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="ai, inference, llm"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="crawl-force"
            type="checkbox"
            checked={forceRefresh}
            onChange={(e) => setForceRefresh(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="crawl-force" className="text-sm text-gray-700">강제 새로고침</label>
        </div>
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? '크롤 중...' : '크롤 실행'}
        </button>
      </form>
      {result && (
        <div className={`mt-3 p-3 rounded-lg text-sm ${
          result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {result.message}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Direct Index Form
// ---------------------------------------------------------------------------

export function IndexForm({ onSuccess }: { onSuccess: () => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/rag/index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          sourceUrl: sourceUrl.trim() || undefined,
          tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ success: true, message: `인덱싱 완료: ${data.title} (${data.contentLength} bytes)` });
        setTitle('');
        setContent('');
        setSourceUrl('');
        setTags('');
        onSuccess();
      } else {
        setResult({ success: false, message: data.error || '인덱싱 실패' });
      }
    } catch (err) {
      setResult({ success: false, message: err instanceof Error ? err.message : '오류 발생' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">직접 인덱싱</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="idx-title" className="block text-sm font-medium text-gray-700 mb-1">제목</label>
          <input
            id="idx-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="콘텐츠 제목"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="idx-content" className="block text-sm font-medium text-gray-700 mb-1">내용</label>
          <textarea
            id="idx-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="인덱싱할 텍스트 내용..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="idx-url" className="block text-sm font-medium text-gray-700 mb-1">
            출처 URL (선택)
          </label>
          <input
            id="idx-url"
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://example.com/docs"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="idx-tags" className="block text-sm font-medium text-gray-700 mb-1">
            태그 (콤마 구분)
          </label>
          <input
            id="idx-tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="ai, vector-db"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !title.trim() || !content.trim()}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? '인덱싱 중...' : '인덱싱 실행'}
        </button>
      </form>
      {result && (
        <div className={`mt-3 p-3 rounded-lg text-sm ${
          result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {result.message}
        </div>
      )}
    </div>
  );
}
