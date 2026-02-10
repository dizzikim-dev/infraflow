'use client';

/**
 * 취약점 관리 목록 페이지
 *
 * 인프라 취약점 조회, 검색, 필터링
 */

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  KnowledgePageLayout,
  KnowledgeSearchFilter,
  KnowledgeDataTable,
  SeverityBadge,
} from '@/components/admin/knowledge';
import type { ColumnDef, FilterDef } from '@/components/admin/knowledge';

interface VulnerabilityItem {
  id: string;
  vulnId: string;
  cveId: string | null;
  title: string;
  titleKo: string;
  severity: string;
  cvssScore: number | null;
  affectedComponents: string[];
  publishedDate: string | null;
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

const filters: FilterDef[] = [
  {
    key: 'severity',
    label: '심각도',
    options: [
      { value: 'critical', label: 'Critical' },
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
    ],
  },
];

const columns: ColumnDef<VulnerabilityItem>[] = [
  {
    key: 'vulnId',
    label: 'Vuln ID',
    sortable: true,
    render: (item) => (
      <Link
        href={`/admin/knowledge/vulnerabilities/${item.id}`}
        className="text-blue-600 hover:text-blue-800 font-mono text-xs"
      >
        {item.vulnId}
      </Link>
    ),
  },
  {
    key: 'cveId',
    label: 'CVE ID',
    render: (item) => (
      <span className="font-mono text-xs text-gray-600">{item.cveId || '-'}</span>
    ),
  },
  {
    key: 'title',
    label: '제목',
    sortable: true,
    render: (item) => (
      <div>
        <div className="font-medium text-gray-900 text-sm">{item.titleKo}</div>
        <div className="text-xs text-gray-500">{item.title}</div>
      </div>
    ),
  },
  {
    key: 'severity',
    label: '심각도',
    sortable: true,
    render: (item) => <SeverityBadge severity={item.severity} />,
  },
  {
    key: 'cvssScore',
    label: 'CVSS',
    render: (item) => {
      if (item.cvssScore === null || item.cvssScore === undefined) {
        return <span className="text-gray-400">-</span>;
      }
      const score = item.cvssScore;
      let color = 'text-green-600';
      if (score >= 9.0) color = 'text-red-600';
      else if (score >= 7.0) color = 'text-orange-600';
      else if (score >= 4.0) color = 'text-yellow-600';

      return <span className={`font-semibold text-sm ${color}`}>{score.toFixed(1)}</span>;
    },
  },
  {
    key: 'publishedDate',
    label: '발행일',
    sortable: true,
    render: (item) => (
      <span className="text-sm text-gray-600">
        {item.publishedDate
          ? new Date(item.publishedDate).toLocaleDateString('ko-KR')
          : '-'}
      </span>
    ),
  },
];

function VulnerabilitiesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<VulnerabilityItem[]>([]);
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
  const severity = searchParams.get('severity') || '';

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (severity) params.set('severity', severity);

      const response = await fetch(`/api/knowledge/vulnerabilities?${params.toString()}`);

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
  }, [page, search, severity]);

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
    router.push(`/admin/knowledge/vulnerabilities?${newParams.toString()}`);
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

  const handleEdit = (item: VulnerabilityItem) => {
    router.push(`/admin/knowledge/vulnerabilities/${item.id}/edit`);
  };

  const handleDelete = async (item: VulnerabilityItem) => {
    if (!confirm(`취약점 "${item.titleKo}"을(를) 삭제하시겠습니까?`)) return;

    try {
      const response = await fetch(`/api/knowledge/vulnerabilities/${item.id}`, {
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
      title="취약점 관리"
      description="인프라 취약점 조회 및 관리"
      actions={
        <Link
          href="/admin/knowledge/vulnerabilities/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 취약점 추가
        </Link>
      }
    >
      <KnowledgeSearchFilter
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        filters={filters}
        values={{ severity }}
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

      <KnowledgeDataTable<VulnerabilityItem>
        columns={columns}
        data={data}
        pagination={pagination}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        emptyMessage="등록된 취약점이 없습니다."
      />
    </KnowledgePageLayout>
  );
}

function VulnerabilitiesPageLoading() {
  return (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <svg className="animate-spin h-8 w-8 mx-auto text-rose-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p className="mt-4 text-gray-500">로딩 중...</p>
    </div>
  );
}

export default function VulnerabilitiesPage() {
  return (
    <Suspense fallback={<VulnerabilitiesPageLoading />}>
      <VulnerabilitiesPageContent />
    </Suspense>
  );
}
