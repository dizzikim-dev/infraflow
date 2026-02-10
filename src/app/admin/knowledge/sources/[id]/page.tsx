'use client';

/**
 * 출처 상세 페이지
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface SourceEntry {
  id: string;
  sourceId: string;
  sourceType: string;
  title: string;
  url?: string;
  section?: string;
  publishedDate?: string;
  accessedDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const sourceTypeBadge: Record<string, { label: string; color: string }> = {
  rfc: { label: 'RFC', color: 'bg-blue-100 text-blue-800' },
  nist: { label: 'NIST', color: 'bg-indigo-100 text-indigo-800' },
  cis: { label: 'CIS', color: 'bg-green-100 text-green-800' },
  owasp: { label: 'OWASP', color: 'bg-red-100 text-red-800' },
  vendor: { label: 'Vendor', color: 'bg-purple-100 text-purple-800' },
  academic: { label: 'Academic', color: 'bg-teal-100 text-teal-800' },
  industry: { label: 'Industry', color: 'bg-amber-100 text-amber-800' },
  user_verified: { label: '검증됨', color: 'bg-emerald-100 text-emerald-800' },
  user_unverified: { label: '미검증', color: 'bg-gray-100 text-gray-800' },
};

export default function SourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [source, setSource] = useState<SourceEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/knowledge/sources/${id}`);
        if (!response.ok) throw new Error('데이터를 가져오는데 실패했습니다');
        const data = await response.json();
        setSource(data.data || data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <svg className="animate-spin h-8 w-8 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="mt-4 text-gray-500">데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !source) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-sm text-red-700">{error || '데이터를 찾을 수 없습니다'}</p>
        <button onClick={() => router.back()} className="mt-4 text-sm text-blue-600 hover:underline">
          뒤로 가기
        </button>
      </div>
    );
  }

  const typeInfo = sourceTypeBadge[source.sourceType];

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{source.title}</h1>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${typeInfo?.color || 'bg-gray-100 text-gray-800'}`}>
              {typeInfo?.label || source.sourceType}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500 font-mono">{source.sourceId}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/knowledge/sources"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            목록으로
          </Link>
          <Link
            href={`/admin/knowledge/sources/${source.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            수정
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 메인 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">출처 정보</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">출처 ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{source.sourceId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">유형</dt>
                <dd className="mt-1 text-sm text-gray-900">{source.sourceType}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">제목</dt>
                <dd className="mt-1 text-sm text-gray-900">{source.title}</dd>
              </div>
              {source.url && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">URL</dt>
                  <dd className="mt-1 text-sm">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {source.url}
                    </a>
                  </dd>
                </div>
              )}
              {source.section && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">섹션</dt>
                  <dd className="mt-1 text-sm text-gray-900">{source.section}</dd>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">발행일</dt>
                  <dd className="mt-1 text-sm text-gray-900">{source.publishedDate || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">접근일</dt>
                  <dd className="mt-1 text-sm text-gray-900">{source.accessedDate}</dd>
                </div>
              </div>
            </dl>
          </div>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">메타 정보</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">ID</dt>
                <dd className="mt-1 text-xs text-gray-400 font-mono break-all">{source.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">생성일</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(source.createdAt).toLocaleString('ko-KR')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">수정일</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(source.updatedAt).toLocaleString('ko-KR')}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
