'use client';

/**
 * 컴포넌트 목록 페이지
 */

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ComponentTable, SearchFilter } from '@/components/admin';

interface Policy {
  id: string;
  name: string;
  nameKo: string;
  priority: string;
}

interface Component {
  id: string;
  componentId: string;
  name: string;
  nameKo: string;
  category: string;
  tier: string;
  isActive: boolean;
  policies: Policy[];
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
  data: Component[];
  pagination: Pagination;
}

function ComponentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [components, setComponents] = useState<Component[]>([]);
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

  // URL에서 필터 값 가져오기
  const page = parseInt(searchParams.get('page') || '1');
  const category = searchParams.get('category') || '';
  const tier = searchParams.get('tier') || '';
  const search = searchParams.get('search') || '';

  // 데이터 가져오기
  const fetchComponents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (category) params.set('category', category);
      if (tier) params.set('tier', tier);
      if (search) params.set('search', search);

      const response = await fetch(`/api/components?${params.toString()}`);

      if (!response.ok) {
        throw new Error('데이터를 가져오는데 실패했습니다');
      }

      const data: ApiResponse = await response.json();
      setComponents(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [page, category, tier, search]);

  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  // URL 업데이트 함수
  const updateUrl = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    // 필터 변경 시 페이지를 1로 리셋 (page 변경이 아닌 경우)
    if (!params.page) {
      newParams.set('page', '1');
    }
    router.push(`/admin/components?${newParams.toString()}`);
  };

  // 검색 핸들러
  const handleSearch = (query: string) => {
    updateUrl({ search: query });
  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (newCategory: string) => {
    updateUrl({ category: newCategory });
  };

  // 티어 변경 핸들러
  const handleTierChange = (newTier: string) => {
    updateUrl({ tier: newTier });
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    updateUrl({ page: newPage.toString() });
  };

  // 삭제 핸들러
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/components/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('삭제에 실패했습니다');
      }

      // 목록 새로고침
      fetchComponents();
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다');
    }
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">컴포넌트 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            인프라 컴포넌트 목록 조회 및 관리
          </p>
        </div>
        <Link
          href="/admin/components/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          새 컴포넌트
        </Link>
      </div>

      {/* 검색 및 필터 */}
      <SearchFilter
        onSearch={handleSearch}
        onCategoryChange={handleCategoryChange}
        onTierChange={handleTierChange}
        category={category}
        tier={tier}
        search={search}
      />

      {/* 에러 표시 */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
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
          <svg
            className="animate-spin h-8 w-8 mx-auto text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="mt-4 text-gray-500">데이터를 불러오는 중...</p>
        </div>
      ) : (
        <ComponentTable
          components={components}
          pagination={pagination}
          onPageChange={handlePageChange}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

// Loading fallback component
function ComponentsPageLoading() {
  return (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <svg
        className="animate-spin h-8 w-8 mx-auto text-blue-600"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <p className="mt-4 text-gray-500">로딩 중...</p>
    </div>
  );
}

export default function ComponentsPage() {
  return (
    <Suspense fallback={<ComponentsPageLoading />}>
      <ComponentsPageContent />
    </Suspense>
  );
}
