'use client';

/**
 * 벤더 카탈로그 Raw 테이블 뷰
 *
 * 모든 벤더의 전체 제품 데이터를 모든 컬럼 그대로 표시.
 * 검색, 정렬, 필터 기능 제공.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('VendorCatalogTablePage');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FlatProduct {
  vendorId: string;
  vendorName: string;
  vendorNameKo: string;
  nodeId: string;
  depth: number;
  depthLabel: string;
  depthLabelKo: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  sourceUrl: string;
  datasheetUrl?: string;
  lifecycle?: string;
  architectureRole?: string;
  architectureRoleKo?: string;
  recommendedFor?: string[];
  recommendedForKo?: string[];
  supportedProtocols?: string[];
  haFeatures?: string[];
  securityCapabilities?: string[];
  infraNodeTypes?: string[];
  specs?: Record<string, string>;
  pricingInfo?: string;
  path: string[];
  pathKo: string[];
  childCount: number;
}

type SortDir = 'asc' | 'desc';

// ---------------------------------------------------------------------------
// Column definitions — every field in FlatProduct
// ---------------------------------------------------------------------------

interface ColumnDef {
  key: string;
  label: string;
  getValue: (p: FlatProduct) => string | number;
}

const COLUMNS: ColumnDef[] = [
  { key: 'vendorId', label: 'vendorId', getValue: (p) => p.vendorId },
  { key: 'vendorName', label: 'vendorName', getValue: (p) => p.vendorName },
  { key: 'vendorNameKo', label: 'vendorNameKo', getValue: (p) => p.vendorNameKo },
  { key: 'nodeId', label: 'nodeId', getValue: (p) => p.nodeId },
  { key: 'depth', label: 'depth', getValue: (p) => p.depth },
  { key: 'depthLabel', label: 'depthLabel', getValue: (p) => p.depthLabel },
  { key: 'depthLabelKo', label: 'depthLabelKo', getValue: (p) => p.depthLabelKo },
  { key: 'name', label: 'name', getValue: (p) => p.name },
  { key: 'nameKo', label: 'nameKo', getValue: (p) => p.nameKo },
  { key: 'description', label: 'description', getValue: (p) => p.description },
  { key: 'descriptionKo', label: 'descriptionKo', getValue: (p) => p.descriptionKo },
  { key: 'sourceUrl', label: 'sourceUrl', getValue: (p) => p.sourceUrl },
  { key: 'datasheetUrl', label: 'datasheetUrl', getValue: (p) => p.datasheetUrl || '' },
  { key: 'lifecycle', label: 'lifecycle', getValue: (p) => p.lifecycle || '' },
  { key: 'architectureRole', label: 'architectureRole', getValue: (p) => p.architectureRole || '' },
  { key: 'architectureRoleKo', label: 'architectureRoleKo', getValue: (p) => p.architectureRoleKo || '' },
  { key: 'recommendedFor', label: 'recommendedFor', getValue: (p) => p.recommendedFor?.join(' | ') || '' },
  { key: 'recommendedForKo', label: 'recommendedForKo', getValue: (p) => p.recommendedForKo?.join(' | ') || '' },
  { key: 'supportedProtocols', label: 'supportedProtocols', getValue: (p) => p.supportedProtocols?.join(', ') || '' },
  { key: 'haFeatures', label: 'haFeatures', getValue: (p) => p.haFeatures?.join(' | ') || '' },
  { key: 'securityCapabilities', label: 'securityCapabilities', getValue: (p) => p.securityCapabilities?.join(' | ') || '' },
  { key: 'infraNodeTypes', label: 'infraNodeTypes', getValue: (p) => p.infraNodeTypes?.join(', ') || '' },
  { key: 'specs', label: 'specs', getValue: (p) => p.specs ? Object.entries(p.specs).map(([k, v]) => `${k}: ${v}`).join(' | ') : '' },
  { key: 'pricingInfo', label: 'pricingInfo', getValue: (p) => p.pricingInfo || '' },
  { key: 'path', label: 'path', getValue: (p) => p.path.join(' > ') },
  { key: 'pathKo', label: 'pathKo', getValue: (p) => p.pathKo.join(' > ') },
  { key: 'childCount', label: 'childCount', getValue: (p) => p.childCount },
];

const PAGE_SIZE = 50;

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function VendorCatalogTablePage() {
  const [products, setProducts] = useState<FlatProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('nodeId');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(0);

  // ── Fetch ──
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/knowledge/vendor-catalog/all-products');
        if (!res.ok) throw new Error('데이터를 가져오는데 실패했습니다');
        const json = await res.json();
        if (!json.success) throw new Error(json.error || '오류');
        setProducts(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다');
        log.error('전체 제품 테이블 조회 실패');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // ── Filter + Sort ──
  const filtered = useMemo(() => {
    let result = products;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) =>
        COLUMNS.some((col) => String(col.getValue(p)).toLowerCase().includes(q)),
      );
    }

    const col = COLUMNS.find((c) => c.key === sortKey);
    if (col) {
      result = [...result].sort((a, b) => {
        const aVal = col.getValue(a);
        const bVal = col.getValue(b);
        const cmp =
          typeof aVal === 'number' && typeof bVal === 'number'
            ? aVal - bVal
            : String(aVal).localeCompare(String(bVal), 'ko');
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [products, searchQuery, sortKey, sortDir]);

  useEffect(() => { setPage(0); }, [searchQuery, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSort = useCallback(
    (key: string) => {
      if (sortKey === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDir('asc');
      }
    },
    [sortKey],
  );

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <svg className="animate-spin h-8 w-8 mx-auto text-cyan-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="mt-4 text-gray-500">로딩 중...</p>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div>
        <div className="mb-6">
          <Link href="/admin/knowledge/vendor-catalog" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            벤더 카탈로그
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/admin/knowledge/vendor-catalog" className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Raw 테이블</h1>
          <span className="text-sm text-gray-400">{products.length}개 제품 &middot; {COLUMNS.length}개 컬럼</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="전체 컬럼 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap">{filtered.length}건</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="text-xs whitespace-nowrap border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="sticky left-0 z-10 bg-gray-50 px-2 py-2 text-left font-mono text-gray-500 border-b border-r border-gray-200 cursor-pointer hover:bg-gray-100 select-none">#</th>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-2 py-2 text-left font-mono text-gray-500 border-b border-gray-200 cursor-pointer hover:bg-gray-100 select-none"
                  >
                    {col.label}
                    {sortKey === col.key && (
                      <span className="ml-1 text-cyan-600">{sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((p, idx) => (
                <tr key={p.nodeId} className="hover:bg-cyan-50/30 border-b border-gray-100">
                  <td className="sticky left-0 z-10 bg-white px-2 py-1.5 text-gray-400 border-r border-gray-100 font-mono">
                    {page * PAGE_SIZE + idx + 1}
                  </td>
                  {COLUMNS.map((col) => {
                    const val = col.getValue(p);
                    const str = String(val);
                    const isUrl = str.startsWith('http');
                    return (
                      <td key={col.key} className="px-2 py-1.5 text-gray-700 max-w-[400px] truncate" title={str}>
                        {isUrl ? (
                          <a href={str} target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline">{str}</a>
                        ) : (
                          str || <span className="text-gray-300">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length + 1} className="px-4 py-8 text-center text-gray-400">
                    검색 결과 없음
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50">
            <span className="text-xs text-gray-500">
              {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, filtered.length)} / {filtered.length}
            </span>
            <div className="flex gap-1">
              <button onClick={() => setPage(0)} disabled={page === 0} className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-30">&laquo;</button>
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-30">&lsaquo;</button>
              <span className="px-3 py-1 text-xs text-gray-600">{page + 1} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-30">&rsaquo;</button>
              <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-30">&raquo;</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
