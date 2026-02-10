'use client';

/**
 * 산업별 프리셋 목록 페이지
 */

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface IndustryPreset {
  id: string;
  industryType: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  minimumSecurityLevel: string;
  requiredFrameworks: string[];
  requiredComponents: string[];
  recommendedComponents: string[];
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
  data: IndustryPreset[];
  pagination: Pagination;
}

const industryTypeBadge: Record<string, { label: string; color: string }> = {
  financial: { label: '금융', color: 'bg-blue-100 text-blue-800' },
  healthcare: { label: '의료', color: 'bg-green-100 text-green-800' },
  government: { label: '공공', color: 'bg-indigo-100 text-indigo-800' },
  ecommerce: { label: '이커머스', color: 'bg-purple-100 text-purple-800' },
  general: { label: '일반', color: 'bg-gray-100 text-gray-800' },
};

const securityLevelBadge: Record<string, { label: string; color: string }> = {
  basic: { label: 'Basic', color: 'bg-green-100 text-green-800' },
  standard: { label: 'Standard', color: 'bg-blue-100 text-blue-800' },
  enhanced: { label: 'Enhanced', color: 'bg-orange-100 text-orange-800' },
  maximum: { label: 'Maximum', color: 'bg-red-100 text-red-800' },
};

function IndustryPresetsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [presets, setPresets] = useState<IndustryPreset[]>([]);
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
  const search = searchParams.get('search') || '';

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);

      const response = await fetch(`/api/knowledge/industry-presets?${params.toString()}`);

      if (!response.ok) {
        throw new Error('데이터를 가져오는데 실패했습니다');
      }

      const data: ApiResponse = await response.json();
      setPresets(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

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
    router.push(`/admin/knowledge/industry-presets?${newParams.toString()}`);
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
    if (!confirm('이 산업별 프리셋을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/knowledge/industry-presets/${id}`, {
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
          <h1 className="text-2xl font-bold text-gray-900">산업별 프리셋 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            산업별 인프라 프리셋 조회 및 관리
          </p>
        </div>
        <Link
          href="/admin/knowledge/industry-presets/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 프리셋 추가
        </Link>
      </div>

      {/* 검색 */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">검색</label>
            <div className="flex gap-2">
              <input
                name="search"
                type="text"
                defaultValue={search}
                placeholder="프리셋 이름, 산업 유형 검색..."
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
              >
                검색
              </button>
            </div>
          </div>
        </form>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">산업 유형</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름 (한국어)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">최소 보안 수준</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">필수 프레임워크</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">필수 컴포넌트</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {presets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    데이터가 없습니다
                  </td>
                </tr>
              ) : (
                presets.map((preset) => (
                  <tr key={preset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${industryTypeBadge[preset.industryType]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {industryTypeBadge[preset.industryType]?.label || preset.industryType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <Link href={`/admin/knowledge/industry-presets/${preset.id}`} className="text-blue-600 hover:underline">
                        {preset.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{preset.nameKo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${securityLevelBadge[preset.minimumSecurityLevel]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {securityLevelBadge[preset.minimumSecurityLevel]?.label || preset.minimumSecurityLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {preset.requiredFrameworks.length}개
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {preset.requiredComponents.length}개
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link
                        href={`/admin/knowledge/industry-presets/${preset.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        수정
                      </Link>
                      <button
                        onClick={() => handleDelete(preset.id)}
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

export default function IndustryPresetsPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <IndustryPresetsPageContent />
    </Suspense>
  );
}
