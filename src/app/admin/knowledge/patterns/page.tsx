'use client';

/**
 * 패턴 관리 목록 페이지
 *
 * 인프라 아키텍처 패턴 조회, 검색, 필터링
 */

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  KnowledgePageLayout,
  KnowledgeSearchFilter,
  KnowledgeDataTable,
  TrustBadge,
} from '@/components/admin/knowledge';
import type { ColumnDef, FilterDef } from '@/components/admin/knowledge';

interface PatternItem {
  id: string;
  patternId: string;
  name: string;
  nameKo: string;
  scalability: string;
  complexity: number;
  requiredComponents: { type: string; minCount: number }[];
  tags: string[];
  isActive: boolean;
  trustMetadata: { confidence: number } | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const scalabilityBadgeColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-green-100 text-green-800',
  auto: 'bg-purple-100 text-purple-800',
};

const filters: FilterDef[] = [
  {
    key: 'scalability',
    label: '확장성',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'auto', label: 'Auto' },
    ],
  },
];

function renderStars(complexity: number) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < complexity ? 'text-yellow-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

const columns: ColumnDef<PatternItem>[] = [
  {
    key: 'patternId',
    label: 'Pattern ID',
    sortable: true,
    render: (item) => (
      <Link
        href={`/admin/knowledge/patterns/${item.id}`}
        className="text-blue-600 hover:text-blue-800 font-mono text-xs"
      >
        {item.patternId}
      </Link>
    ),
  },
  {
    key: 'name',
    label: '이름',
    sortable: true,
    render: (item) => (
      <div>
        <div className="font-medium text-gray-900">{item.nameKo}</div>
        <div className="text-xs text-gray-500">{item.name}</div>
      </div>
    ),
  },
  {
    key: 'scalability',
    label: '확장성',
    render: (item) => (
      <span
        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
          scalabilityBadgeColors[item.scalability] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {item.scalability}
      </span>
    ),
  },
  {
    key: 'complexity',
    label: '복잡도',
    render: (item) => renderStars(item.complexity),
  },
  {
    key: 'requiredComponents',
    label: '필수 구성요소',
    render: (item) => {
      const components = item.requiredComponents as { type: string; minCount: number }[];
      return (
        <span className="text-sm text-gray-600">
          {Array.isArray(components) ? components.length : 0}개
        </span>
      );
    },
  },
  {
    key: 'tags',
    label: '태그',
    render: (item) => (
      <div className="flex flex-wrap gap-1">
        {(item.tags || []).slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="inline-flex px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
          >
            {tag}
          </span>
        ))}
        {(item.tags || []).length > 3 && (
          <span className="text-xs text-gray-400">+{item.tags.length - 3}</span>
        )}
      </div>
    ),
  },
  {
    key: 'trustMetadata',
    label: '신뢰도',
    render: (item) => {
      const meta = item.trustMetadata as { confidence: number } | null;
      return meta ? <TrustBadge confidence={meta.confidence} /> : <span className="text-gray-400">-</span>;
    },
  },
];

function PatternsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<PatternItem[]>([]);
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
  const scalability = searchParams.get('scalability') || '';

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (scalability) params.set('scalability', scalability);

      const response = await fetch(`/api/knowledge/patterns?${params.toString()}`);

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
  }, [page, search, scalability]);

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
    router.push(`/admin/knowledge/patterns?${newParams.toString()}`);
  };

  const handleSearch = (query: string) => {
    updateUrl({ search: query });
  };

  const handleFilterChange = (key: string, value: string) => {
    updateUrl({ [key]: value });
  };

  const handlePageChange = (newPage: number) => {
    updateUrl({ page: newPage.toString() });
  };

  const handleEdit = (item: PatternItem) => {
    router.push(`/admin/knowledge/patterns/${item.id}/edit`);
  };

  const handleDelete = async (item: PatternItem) => {
    if (!confirm(`패턴 "${item.nameKo}"을(를) 삭제하시겠습니까?`)) return;

    try {
      const response = await fetch(`/api/knowledge/patterns/${item.id}`, {
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
    <KnowledgePageLayout
      title="패턴 관리"
      description="인프라 아키텍처 패턴 조회 및 관리"
      actions={
        <Link
          href="/admin/knowledge/patterns/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 패턴 추가
        </Link>
      }
    >
      <KnowledgeSearchFilter
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        filters={filters}
        values={{ scalability }}
        search={search}
      />

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

      <KnowledgeDataTable<PatternItem>
        columns={columns}
        data={data}
        pagination={pagination}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        emptyMessage="등록된 패턴이 없습니다."
      />
    </KnowledgePageLayout>
  );
}

function PatternsPageLoading() {
  return (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <svg className="animate-spin h-8 w-8 mx-auto text-green-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p className="mt-4 text-gray-500">로딩 중...</p>
    </div>
  );
}

export default function PatternsPage() {
  return (
    <Suspense fallback={<PatternsPageLoading />}>
      <PatternsPageContent />
    </Suspense>
  );
}
