'use client';

/**
 * Knowledge 제네릭 목록 페이지
 *
 * 모든 Knowledge 엔티티의 목록 페이지 보일러플레이트를 캡슐화:
 * - API fetch + 페이지네이션 + 상태 관리
 * - URL 파라미터 동기화 (검색, 필터, 페이지)
 * - 검색/필터 UI
 * - 에러/로딩/빈 상태
 * - 삭제 처리
 * - Suspense 래퍼
 */

import { useState, useEffect, useCallback, Suspense, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import KnowledgePageLayout from './KnowledgePageLayout';
import KnowledgeSearchFilter from './KnowledgeSearchFilter';
import KnowledgeDataTable from './KnowledgeDataTable';
import type { ColumnDef, FilterDef } from '.';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface KnowledgeListConfig<T> {
  /** API 경로 (e.g. 'relationships', 'patterns') */
  entityPath: string;
  /** 페이지 제목 (한국어) */
  title: string;
  /** 페이지 설명 (한국어) */
  description: string;
  /** 새 항목 추가 버튼 텍스트 */
  addButtonLabel: string;
  /** 새 항목 추가 버튼 색상 (tailwind bg class) */
  addButtonColor?: string;
  /** 테이블 컬럼 정의 */
  columns: ColumnDef<T>[];
  /** 필터 정의 */
  filters?: FilterDef[];
  /** 삭제 확인 메시지 생성 함수 */
  deleteConfirmMessage?: (item: T) => string;
  /** 빈 상태 메시지 */
  emptyMessage?: string;
  /** 검색 플레이스홀더 */
  searchPlaceholder?: string;
  /** 추가 액션 버튼 (선택) */
  extraActions?: ReactNode;
}

// ---------------------------------------------------------------------------
// Inner content component (needs useSearchParams → must be inside Suspense)
// ---------------------------------------------------------------------------

function KnowledgeListContent<T extends { id: string }>({
  config,
}: {
  config: KnowledgeListConfig<T>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<T[]>([]);
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

  // Read URL params
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const filterValues: Record<string, string> = {};
  for (const f of config.filters ?? []) {
    filterValues[f.key] = searchParams.get(f.key) || '';
  }

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);
      for (const [key, value] of Object.entries(filterValues)) {
        if (value) params.set(key, value);
      }

      const response = await fetch(
        `/api/knowledge/${config.entityPath}?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error('데이터를 가져오는데 실패했습니다');
      }

      const result = await response.json();
      setData(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, config.entityPath, ...Object.values(filterValues)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // URL helpers
  const updateUrl = useCallback(
    (params: Record<string, string>) => {
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
      router.push(
        `/admin/knowledge/${config.entityPath}?${newParams.toString()}`,
      );
    },
    [router, searchParams, config.entityPath],
  );

  const handleSearch = useCallback(
    (query: string) => updateUrl({ search: query }),
    [updateUrl],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => updateUrl({ [key]: value }),
    [updateUrl],
  );

  const handlePageChange = useCallback(
    (newPage: number) => updateUrl({ page: newPage.toString() }),
    [updateUrl],
  );

  const handleEdit = useCallback(
    (item: T) =>
      router.push(`/admin/knowledge/${config.entityPath}/${item.id}/edit`),
    [router, config.entityPath],
  );

  const handleDelete = useCallback(
    async (item: T) => {
      const message = config.deleteConfirmMessage
        ? config.deleteConfirmMessage(item)
        : '이 항목을 삭제하시겠습니까?';
      if (!confirm(message)) return;

      try {
        const response = await fetch(
          `/api/knowledge/${config.entityPath}/${item.id}`,
          { method: 'DELETE' },
        );

        if (!response.ok) {
          throw new Error('삭제에 실패했습니다');
        }

        fetchData();
      } catch (err) {
        alert(err instanceof Error ? err.message : '삭제에 실패했습니다');
      }
    },
    [config.entityPath, config.deleteConfirmMessage, fetchData],
  );

  const addButtonColor = config.addButtonColor || 'bg-blue-600 hover:bg-blue-700';

  return (
    <KnowledgePageLayout
      title={config.title}
      description={config.description}
      actions={
        <div className="flex items-center gap-2">
          {config.extraActions}
          <Link
            href={`/admin/knowledge/${config.entityPath}/new`}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${addButtonColor}`}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {config.addButtonLabel}
          </Link>
        </div>
      }
    >
      {config.filters && config.filters.length > 0 && (
        <KnowledgeSearchFilter
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          filters={config.filters}
          values={filterValues}
          search={search}
        />
      )}

      {!config.filters?.length && (
        <KnowledgeSearchFilter
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          filters={[]}
          values={{}}
          search={search}
        />
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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

      <KnowledgeDataTable<T>
        columns={config.columns}
        data={data}
        pagination={pagination}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        emptyMessage={config.emptyMessage || '데이터가 없습니다.'}
      />
    </KnowledgePageLayout>
  );
}

// ---------------------------------------------------------------------------
// Loading fallback
// ---------------------------------------------------------------------------

function ListPageLoading() {
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

// ---------------------------------------------------------------------------
// Exported component (wraps with Suspense)
// ---------------------------------------------------------------------------

export default function KnowledgeListPage<T extends { id: string }>({
  config,
}: {
  config: KnowledgeListConfig<T>;
}) {
  return (
    <Suspense fallback={<ListPageLoading />}>
      <KnowledgeListContent<T> config={config} />
    </Suspense>
  );
}
