'use client';

/**
 * 관계 목록 페이지
 */

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface TrustMetadata {
  confidence: number;
  source?: {
    type: string;
    title: string;
  };
  lastReviewedAt?: string;
}

interface Relationship {
  id: string;
  knowledgeId: string;
  sourceComponent: string;
  targetComponent: string;
  relationshipType: string;
  strength: string;
  direction: string;
  reason: string;
  reasonKo: string;
  tags: string[];
  trustMetadata: TrustMetadata;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ApiResponse {
  data: Relationship[];
  pagination: Pagination;
}

const relationshipTypeLabels: Record<string, { label: string; color: string }> = {
  requires: { label: '필수', color: 'bg-red-100 text-red-800' },
  recommends: { label: '권장', color: 'bg-blue-100 text-blue-800' },
  conflicts: { label: '충돌', color: 'bg-orange-100 text-orange-800' },
  enhances: { label: '강화', color: 'bg-green-100 text-green-800' },
  protects: { label: '보호', color: 'bg-purple-100 text-purple-800' },
};

const strengthLabels: Record<string, { label: string; color: string }> = {
  mandatory: { label: '필수', color: 'bg-red-100 text-red-800' },
  strong: { label: '강함', color: 'bg-blue-100 text-blue-800' },
  weak: { label: '약함', color: 'bg-gray-100 text-gray-800' },
};

function confidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-green-600';
  if (confidence >= 0.5) return 'text-yellow-600';
  return 'text-red-600';
}

function RelationshipsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = parseInt(searchParams.get('page') || '1');
  const relationshipType = searchParams.get('relationshipType') || '';
  const strength = searchParams.get('strength') || '';
  const search = searchParams.get('search') || '';

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (relationshipType) params.set('relationshipType', relationshipType);
      if (strength) params.set('strength', strength);
      if (search) params.set('search', search);

      const response = await fetch(`/api/knowledge/relationships?${params.toString()}`);

      if (!response.ok) {
        throw new Error('데이터를 가져오는데 실패했습니다');
      }

      const data: ApiResponse = await response.json();
      setRelationships(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [page, relationshipType, strength, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateUrl = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    if (!params.page) {
      newParams.set('page', '1');
    }
    router.push(`/admin/knowledge/relationships?${newParams.toString()}`);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateUrl({ search: formData.get('search') as string });
  };

  const handlePageChange = (newPage: number) => {
    updateUrl({ page: newPage.toString() });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 관계를 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/knowledge/relationships/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('삭제에 실패했습니다');
      }

      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다');
    }
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">관계 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            인프라 컴포넌트 간 관계 목록 조회 및 관리
          </p>
        </div>
        <Link
          href="/admin/knowledge/relationships/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 관계 추가
        </Link>
      </div>

      {/* 검색 및 필터 */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">검색</label>
            <div className="flex gap-2">
              <input
                name="search"
                type="text"
                defaultValue={search}
                placeholder="컴포넌트 ID, 사유 검색..."
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
              >
                검색
              </button>
            </div>
          </form>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">관계 유형</label>
            <select
              value={relationshipType}
              onChange={(e) => updateUrl({ relationshipType: e.target.value })}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="">전체</option>
              <option value="requires">필수 (requires)</option>
              <option value="recommends">권장 (recommends)</option>
              <option value="conflicts">충돌 (conflicts)</option>
              <option value="enhances">강화 (enhances)</option>
              <option value="protects">보호 (protects)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">강도</label>
            <select
              value={strength}
              onChange={(e) => updateUrl({ strength: e.target.value })}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="">전체</option>
              <option value="mandatory">필수 (mandatory)</option>
              <option value="strong">강함 (strong)</option>
              <option value="weak">약함 (weak)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 로딩 */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="animate-spin h-8 w-8 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-gray-500">데이터를 불러오는 중...</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Knowledge ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">소스</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">타겟</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">유형</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">강도</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">방향</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">신뢰도</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {relationships.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    데이터가 없습니다
                  </td>
                </tr>
              ) : (
                relationships.map((rel) => (
                  <tr key={rel.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      <Link href={`/admin/knowledge/relationships/${rel.id}`} className="text-blue-600 hover:underline">
                        {rel.knowledgeId}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rel.sourceComponent}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rel.targetComponent}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${relationshipTypeLabels[rel.relationshipType]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {relationshipTypeLabels[rel.relationshipType]?.label || rel.relationshipType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${strengthLabels[rel.strength]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {strengthLabels[rel.strength]?.label || rel.strength}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rel.direction}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${confidenceColor(rel.trustMetadata?.confidence ?? 0)}`}>
                        {((rel.trustMetadata?.confidence ?? 0) * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link
                        href={`/admin/knowledge/relationships/${rel.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        수정
                      </Link>
                      <button
                        onClick={() => handleDelete(rel.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                전체 {pagination.total}개 중 {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}개
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  이전
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  다음
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PageLoading() {
  return (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <svg className="animate-spin h-8 w-8 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p className="mt-4 text-gray-500">로딩 중...</p>
    </div>
  );
}

export default function RelationshipsPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <RelationshipsPageContent />
    </Suspense>
  );
}
