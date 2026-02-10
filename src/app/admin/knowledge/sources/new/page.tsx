'use client';

/**
 * 새 출처 생성 페이지
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewSourcePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sourceId, setSourceId] = useState('');
  const [sourceType, setSourceType] = useState('industry');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [section, setSection] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [accessedDate, setAccessedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const body = {
        sourceId,
        sourceType,
        title,
        url: url || undefined,
        section: section || undefined,
        publishedDate: publishedDate || undefined,
        accessedDate,
      };

      const response = await fetch('/api/knowledge/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '저장에 실패했습니다');
      }

      router.push('/admin/knowledge/sources');
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">새 출처 추가</h1>
        <p className="mt-1 text-sm text-gray-500">
          새로운 지식 데이터 출처를 추가합니다
        </p>
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">출처 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">출처 ID</label>
              <input
                type="text"
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                required
                placeholder="NIST-SP-800-53"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">유형</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="rfc">RFC</option>
                <option value="nist">NIST</option>
                <option value="cis">CIS</option>
                <option value="owasp">OWASP</option>
                <option value="vendor">Vendor</option>
                <option value="academic">Academic</option>
                <option value="industry">Industry</option>
                <option value="user_verified">검증됨 (User Verified)</option>
                <option value="user_unverified">미검증 (User Unverified)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="NIST Special Publication 800-53"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">URL (선택)</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">섹션 (선택)</label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="Section 3.1"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">발행일 (선택)</label>
              <input
                type="date"
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">접근일</label>
              <input
                type="date"
                value={accessedDate}
                onChange={(e) => setAccessedDate(e.target.value)}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
