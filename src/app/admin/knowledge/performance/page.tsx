'use client';

/**
 * 성능 프로파일 관리 목록 페이지
 *
 * 인프라 컴포넌트 성능 프로파일 조회, 검색, 필터링
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

interface LatencyRange {
  min: number;
  max: number;
  unit: string;
}

interface ThroughputRange {
  typical: string;
  max: string;
}

interface PerformanceItem {
  id: string;
  performanceId: string;
  component: string;
  nameKo: string;
  latencyRange: LatencyRange | null;
  throughputRange: ThroughputRange | null;
  scalingStrategy: string;
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

const scalingStrategyColors: Record<string, string> = {
  horizontal: 'bg-blue-100 text-blue-800',
  vertical: 'bg-purple-100 text-purple-800',
  both: 'bg-green-100 text-green-800',
};

const filters: FilterDef[] = [
  {
    key: 'scalingStrategy',
    label: '스케일링 전략',
    options: [
      { value: 'horizontal', label: 'Horizontal' },
      { value: 'vertical', label: 'Vertical' },
      { value: 'both', label: 'Both' },
    ],
  },
];

function formatLatency(latency: LatencyRange | null): string {
  if (!latency) return '-';
  return `${latency.min}-${latency.max} ${latency.unit || 'ms'}`;
}

const columns: ColumnDef<PerformanceItem>[] = [
  {
    key: 'performanceId',
    label: 'Performance ID',
    sortable: true,
    render: (item) => (
      <Link
        href={`/admin/knowledge/performance/${item.id}`}
        className="text-blue-600 hover:text-blue-800 font-mono text-xs"
      >
        {item.performanceId}
      </Link>
    ),
  },
  {
    key: 'component',
    label: '컴포넌트',
    sortable: true,
    render: (item) => (
      <span className="font-mono text-sm text-gray-900">{item.component}</span>
    ),
  },
  {
    key: 'nameKo',
    label: '이름',
    sortable: true,
    render: (item) => (
      <span className="text-sm text-gray-900">{item.nameKo}</span>
    ),
  },
  {
    key: 'latencyRange',
    label: '지연시간',
    render: (item) => {
      const latency = item.latencyRange as LatencyRange | null;
      return <span className="text-sm text-gray-600 font-mono">{formatLatency(latency)}</span>;
    },
  },
  {
    key: 'throughputRange',
    label: '처리량 (일반)',
    render: (item) => {
      const throughput = item.throughputRange as ThroughputRange | null;
      return (
        <span className="text-sm text-gray-600">
          {throughput?.typical || '-'}
        </span>
      );
    },
  },
  {
    key: 'scalingStrategy',
    label: '스케일링',
    render: (item) => (
      <span
        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
          scalingStrategyColors[item.scalingStrategy] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {item.scalingStrategy}
      </span>
    ),
  },
  {
    key: 'tags',
    label: '태그',
    render: (item) => (
      <div className="flex flex-wrap gap-1">
        {(item.tags || []).slice(0, 2).map((tag) => (
          <span key={tag} className="inline-flex px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
            {tag}
          </span>
        ))}
        {(item.tags || []).length > 2 && (
          <span className="text-xs text-gray-400">+{item.tags.length - 2}</span>
        )}
      </div>
    ),
  },
];

function PerformancePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<PerformanceItem[]>([]);
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
  const scalingStrategy = searchParams.get('scalingStrategy') || '';

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (scalingStrategy) params.set('scalingStrategy', scalingStrategy);

      const response = await fetch(`/api/knowledge/performance?${params.toString()}`);

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
  }, [page, search, scalingStrategy]);

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
    router.push(`/admin/knowledge/performance?${newParams.toString()}`);
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

  const handleEdit = (item: PerformanceItem) => {
    router.push(`/admin/knowledge/performance/${item.id}/edit`);
  };

  const handleDelete = async (item: PerformanceItem) => {
    if (!confirm(`성능 프로파일 "${item.nameKo}"을(를) 삭제하시겠습니까?`)) return;

    try {
      const response = await fetch(`/api/knowledge/performance/${item.id}`, {
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
      title="성능 프로파일 관리"
      description="인프라 컴포넌트 성능 프로파일 조회 및 관리"
      actions={
        <Link
          href="/admin/knowledge/performance/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 성능 프로파일 추가
        </Link>
      }
    >
      <KnowledgeSearchFilter
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        filters={filters}
        values={{ scalingStrategy }}
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

      <KnowledgeDataTable<PerformanceItem>
        columns={columns}
        data={data}
        pagination={pagination}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        emptyMessage="등록된 성능 프로파일이 없습니다."
      />
    </KnowledgePageLayout>
  );
}

function PerformancePageLoading() {
  return (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <svg className="animate-spin h-8 w-8 mx-auto text-purple-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p className="mt-4 text-gray-500">로딩 중...</p>
    </div>
  );
}

export default function PerformancePage() {
  return (
    <Suspense fallback={<PerformancePageLoading />}>
      <PerformancePageContent />
    </Suspense>
  );
}
