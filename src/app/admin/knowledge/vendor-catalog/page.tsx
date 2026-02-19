'use client';

/**
 * 벤더 카탈로그 관리 - 목록 페이지
 *
 * 등록된 벤더 카탈로그 목록을 카드 그리드로 표시하며,
 * 전체 통계와 개별 벤더 요약 정보를 제공합니다.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('VendorCatalogListPage');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VendorStats {
  totalProducts: number;
  maxDepth: number;
  categoriesCount: number;
}

interface VendorSummary {
  vendorId: string;
  vendorName: string;
  vendorNameKo: string;
  headquarters: string;
  website: string;
  lastCrawled: string;
  crawlSource: string;
  stats: VendorStats;
  depthStructure: string[];
  depthStructureKo: string[];
  categoriesCount: number;
}

interface OverallStats {
  vendors: number;
  totalProducts: number;
  byVendor: Record<string, number>;
}

interface ApiResponse {
  success: boolean;
  data: {
    vendors: VendorSummary[];
    stats: OverallStats;
  };
  error?: string;
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow p-6 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function VendorCatalogListPage() {
  const [vendors, setVendors] = useState<VendorSummary[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVendors() {
      try {
        const response = await fetch('/api/knowledge/vendor-catalog');
        if (!response.ok) {
          throw new Error('데이터를 가져오는데 실패했습니다');
        }
        const json: ApiResponse = await response.json();
        if (!json.success) {
          throw new Error(json.error || '데이터를 가져오는데 실패했습니다');
        }
        setVendors(json.data.vendors);
        setOverallStats(json.data.stats);
      } catch (err) {
        const message = err instanceof Error ? err.message : '오류가 발생했습니다';
        setError(message);
        log.error('벤더 카탈로그 목록 조회 실패');
      } finally {
        setIsLoading(false);
      }
    }
    fetchVendors();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div>
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        </div>
        <div className="bg-white rounded-lg shadow p-6 mb-8 animate-pulse">
          <div className="flex gap-8">
            <div className="h-12 bg-gray-200 rounded w-32" />
            <div className="h-12 bg-gray-200 rounded w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">벤더 카탈로그 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            인프라 벤더 제품 카탈로그 조회 및 관리
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">오류 발생</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Link
            href="/admin/knowledge"
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">벤더 카탈로그 관리</h1>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          인프라 벤더 제품 카탈로그 조회 및 관리
        </p>
      </div>

      {/* 전체 통계 */}
      {overallStats && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-sm font-medium text-gray-500 mb-4">전체 통계</h2>
          <div className="flex gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-100 text-cyan-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{overallStats.vendors}</p>
                <p className="text-xs text-gray-500">등록 벤더</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-100 text-teal-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{overallStats.totalProducts}</p>
                <p className="text-xs text-gray-500">총 제품 수</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 벤더 카드 그리드 */}
      {vendors.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-gray-500">등록된 벤더 카탈로그가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <Link
              key={vendor.vendorId}
              href={`/admin/knowledge/vendor-catalog/${vendor.vendorId}`}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition group"
            >
              {/* 벤더 이름 */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-cyan-600 transition">
                  {vendor.vendorNameKo}
                </h3>
                <p className="text-sm text-gray-500">{vendor.vendorName}</p>
              </div>

              {/* 통계 */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-900">{vendor.stats.totalProducts}</p>
                  <p className="text-xs text-gray-500">제품</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-900">{vendor.stats.categoriesCount}</p>
                  <p className="text-xs text-gray-500">카테고리</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-900">{vendor.stats.maxDepth}</p>
                  <p className="text-xs text-gray-500">최대 깊이</p>
                </div>
              </div>

              {/* 메타 정보 */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{vendor.headquarters}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {new Date(vendor.lastCrawled).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-cyan-100 text-cyan-700">
                    {vendor.crawlSource.includes('http') ? 'web-crawler' : vendor.crawlSource}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
