'use client';

/**
 * 클라우드 카탈로그 Raw 테이블 뷰
 *
 * 모든 프로바이더의 전체 클라우드 서비스 데이터를 모든 컬럼 그대로 표시.
 * 검색, 정렬, 필터, 페이지네이션 기능 제공.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { CLOUD_SERVICES } from '@/lib/knowledge/cloudCatalog';
import type { CloudService, CloudProvider } from '@/lib/knowledge/cloudCatalog';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortDir = 'asc' | 'desc';

// ---------------------------------------------------------------------------
// Column definitions — every field in CloudService
// ---------------------------------------------------------------------------

interface ColumnDef {
  key: string;
  label: string;
  getValue: (s: CloudService) => string | number;
}

const COLUMNS: ColumnDef[] = [
  { key: 'id', label: 'id', getValue: (s) => s.id },
  { key: 'provider', label: 'provider', getValue: (s) => s.provider },
  { key: 'componentType', label: 'componentType', getValue: (s) => s.componentType },
  { key: 'serviceName', label: 'serviceName', getValue: (s) => s.serviceName },
  { key: 'serviceNameKo', label: 'serviceNameKo', getValue: (s) => s.serviceNameKo },
  { key: 'status', label: 'status', getValue: (s) => s.status },
  { key: 'serviceCategory', label: 'serviceCategory', getValue: (s) => s.serviceCategory ?? '' },
  { key: 'architectureRole', label: 'architectureRole', getValue: (s) => s.architectureRole ?? '' },
  { key: 'recommendedFor', label: 'recommendedFor', getValue: (s) => s.recommendedFor?.join(' | ') ?? '' },
  { key: 'features', label: 'features', getValue: (s) => s.features.join(', ') },
  { key: 'sla', label: 'sla', getValue: (s) => s.sla ?? '' },
  { key: 'deploymentModel', label: 'deploymentModel', getValue: (s) => s.deploymentModel ?? '' },
  { key: 'pricingTier', label: 'pricingTier', getValue: (s) => s.pricingTier },
  { key: 'pricingModel', label: 'pricingModel', getValue: (s) => s.pricingModel ?? '' },
  { key: 'typicalMonthlyCostUsd', label: 'typicalMonthlyCostUsd', getValue: (s) => s.typicalMonthlyCostUsd ?? '' },
  { key: 'complianceCertifications', label: 'complianceCertifications', getValue: (s) => s.complianceCertifications?.join(', ') ?? '' },
  { key: 'documentationUrl', label: 'documentationUrl', getValue: (s) => s.documentationUrl ?? '' },
  { key: 'maxCapacity', label: 'maxCapacity', getValue: (s) => s.maxCapacity ?? '' },
  { key: 'successor', label: 'successor', getValue: (s) => s.successor ?? '' },
  { key: 'supportedProtocols', label: 'supportedProtocols', getValue: (s) => s.supportedProtocols?.join(', ') ?? '' },
  { key: 'haFeatures', label: 'haFeatures', getValue: (s) => s.haFeatures?.join(', ') ?? '' },
  { key: 'securityCapabilities', label: 'securityCapabilities', getValue: (s) => s.securityCapabilities?.join(', ') ?? '' },
  { key: 'operationalComplexity', label: 'operationalComplexity', getValue: (s) => s.operationalComplexity ?? '' },
  { key: 'ecosystemMaturity', label: 'ecosystemMaturity', getValue: (s) => s.ecosystemMaturity ?? '' },
  { key: 'disasterRecovery', label: 'disasterRecovery', getValue: (s) => s.disasterRecovery ? `RTO:${s.disasterRecovery.maxRTOMinutes ?? '-'}m RPO:${s.disasterRecovery.maxRPOMinutes ?? '-'}m ${s.disasterRecovery.multiRegionSupported ? 'Multi-Region' : 'Single-Region'}` : '' },
];

const PAGE_SIZE = 50;

const PROVIDER_OPTIONS: { value: CloudProvider | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'aws', label: 'AWS' },
  { value: 'azure', label: 'Azure' },
  { value: 'gcp', label: 'GCP' },
];

// ---------------------------------------------------------------------------
// Status badge helper
// ---------------------------------------------------------------------------

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-700';
    case 'deprecated':
    case 'end-of-life':
      return 'bg-red-100 text-red-700';
    case 'preview':
      return 'bg-yellow-100 text-yellow-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function CloudCatalogTablePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState<CloudProvider | 'all'>('all');
  const [sortKey, setSortKey] = useState('id');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(0);

  // ── Filter + Sort ──
  const filtered = useMemo(() => {
    let result: CloudService[] = [...CLOUD_SERVICES];

    // Provider filter
    if (providerFilter !== 'all') {
      result = result.filter((s) => s.provider === providerFilter);
    }

    // Text search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) =>
        COLUMNS.some((col) => String(col.getValue(s)).toLowerCase().includes(q)),
      );
    }

    // Sort
    const col = COLUMNS.find((c) => c.key === sortKey);
    if (col) {
      result.sort((a, b) => {
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
  }, [searchQuery, providerFilter, sortKey, sortDir]);

  useEffect(() => { setPage(0); }, [searchQuery, providerFilter, sortKey, sortDir]);

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

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/admin/knowledge/cloud-catalog" className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Raw 테이블</h1>
          <span className="text-sm text-gray-400">{CLOUD_SERVICES.length}개 서비스 &middot; {COLUMNS.length}개 컬럼</span>
        </div>
      </div>

      {/* Search + Filter */}
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
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value as CloudProvider | 'all')}
            className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            {PROVIDER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
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
              {paged.map((s, idx) => (
                <tr key={s.id} className="hover:bg-cyan-50/30 border-b border-gray-100">
                  <td className="sticky left-0 z-10 bg-white px-2 py-1.5 text-gray-400 border-r border-gray-100 font-mono">
                    {page * PAGE_SIZE + idx + 1}
                  </td>
                  {COLUMNS.map((col) => {
                    const val = col.getValue(s);
                    const str = String(val);
                    const isUrl = str.startsWith('http');
                    const isStatus = col.key === 'status';
                    return (
                      <td key={col.key} className="px-2 py-1.5 text-gray-700 max-w-[400px] truncate" title={str}>
                        {isStatus ? (
                          <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full ${statusBadgeClass(str)}`}>
                            {str}
                          </span>
                        ) : isUrl ? (
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
