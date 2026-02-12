'use client';

/**
 * 미인식 쿼리 상세/편집 페이지
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { KnowledgePageLayout } from '@/components/admin/knowledge';

interface UnrecognizedQueryDetail {
  id: string;
  query: string;
  confidence: number;
  sessionId: string | null;
  userAgent: string | null;
  isResolved: boolean;
  adminNotes: string | null;
  suggestedType: string | null;
  resolvedAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function UnrecognizedQueryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [item, setItem] = useState<UnrecognizedQueryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Editable fields
  const [adminNotes, setAdminNotes] = useState('');
  const [suggestedType, setSuggestedType] = useState('');
  const [isResolved, setIsResolved] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/knowledge/unrecognized-queries/${id}`);
        if (!response.ok) {
          throw new Error('쿼리를 찾을 수 없습니다');
        }
        const data = await response.json();
        setItem(data);
        setAdminNotes(data.adminNotes || '');
        setSuggestedType(data.suggestedType || '');
        setIsResolved(data.isResolved || false);
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleSave = async () => {
    if (!item) return;
    setIsSaving(true);

    try {
      const response = await fetch(`/api/knowledge/unrecognized-queries/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminNotes: adminNotes || null,
          suggestedType: suggestedType || null,
          isResolved,
        }),
      });

      if (!response.ok) {
        throw new Error('저장에 실패했습니다');
      }

      const updated = await response.json();
      setItem(updated);
      alert('저장되었습니다.');
    } catch (err) {
      alert(err instanceof Error ? err.message : '저장에 실패했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    if (!confirm(`쿼리 "${item.query}"을(를) 삭제하시겠습니까?`)) return;

    try {
      const response = await fetch(`/api/knowledge/unrecognized-queries/${item.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('삭제에 실패했습니다');
      }

      router.push('/admin/knowledge/unrecognized-queries');
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <svg className="animate-spin h-8 w-8 mx-auto text-amber-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="mt-4 text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">{error || '쿼리를 찾을 수 없습니다'}</p>
        <Link href="/admin/knowledge/unrecognized-queries" className="mt-4 inline-block text-blue-600 hover:underline">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <KnowledgePageLayout
      title="미인식 쿼리 상세"
      description={`ID: ${item.id}`}
      actions={
        <div className="flex gap-3">
          <Link
            href="/admin/knowledge/unrecognized-queries"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            목록으로
          </Link>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            삭제
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 메인 콘텐츠 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 쿼리 내용 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">쿼리 내용</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-900 whitespace-pre-wrap font-mono">{item.query}</p>
            </div>
          </div>

          {/* 관리자 메모 (편집 가능) */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">관리자 메모</h2>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="분석 내용이나 조치 사항을 기록하세요..."
            />
          </div>

          {/* 제안 타입 (편집 가능) */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">제안 인프라 타입</h2>
            <input
              type="text"
              value={suggestedType}
              onChange={(e) => setSuggestedType(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 font-mono"
              placeholder="예: cctv-camera, nvr, video-server"
            />
            <p className="mt-1 text-xs text-gray-500">
              이 쿼리가 매칭되어야 할 인프라 타입을 지정하세요 (kebab-case)
            </p>
          </div>

          {/* 해결 상태 (편집 가능) */}
          <div className="bg-white shadow rounded-lg p-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isResolved}
                onChange={(e) => setIsResolved(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900">해결됨으로 표시</span>
            </label>
            {item.resolvedAt && (
              <p className="mt-2 text-xs text-gray-500">
                해결일: {new Date(item.resolvedAt).toLocaleString('ko-KR')}
              </p>
            )}
          </div>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 상태 정보 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">상태 정보</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">신뢰도</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                      item.confidence <= 0.3
                        ? 'text-red-600 bg-red-50'
                        : item.confidence <= 0.5
                          ? 'text-yellow-600 bg-yellow-50'
                          : 'text-green-600 bg-green-50'
                    }`}
                  >
                    {(item.confidence * 100).toFixed(0)}%
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">해결 상태</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                      item.isResolved
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {item.isResolved ? '해결됨' : '미해결'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">활성 상태</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                      item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {item.isActive ? '활성' : '비활성'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* 세션 정보 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">세션 정보</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">세션 ID</dt>
                <dd className="mt-1 text-xs text-gray-600 font-mono break-all">
                  {item.sessionId || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">User Agent</dt>
                <dd className="mt-1 text-xs text-gray-600 break-all">
                  {item.userAgent || '-'}
                </dd>
              </div>
            </dl>
          </div>

          {/* 메타 정보 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">메타 정보</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">ID</dt>
                <dd className="mt-1 text-xs text-gray-400 font-mono break-all">{item.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">생성일</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(item.createdAt).toLocaleString('ko-KR')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">수정일</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(item.updatedAt).toLocaleString('ko-KR')}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </KnowledgePageLayout>
  );
}
