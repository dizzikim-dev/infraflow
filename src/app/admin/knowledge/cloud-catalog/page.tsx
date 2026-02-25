'use client';

/**
 * 클라우드 카탈로그 관리 - 목록 페이지
 *
 * 등록된 클라우드 서비스 카탈로그를 프로바이더별 카드 그리드로 표시하며,
 * 전체 통계와 프로바이더별 요약 정보를 제공합니다.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('CloudCatalogListPage');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProviderDetail {
  totalServices: number;
  activeServices: number;
  deprecatedServices: number;
  componentTypes: number;
  enrichedServices: number;
}

interface CatalogStats {
  total: number;
  byProvider: { aws: number; azure: number; gcp: number; ncp: number; kakao: number; kt: number; nhn: number };
  byCategory: Record<string, number>;
  activeCount: number;
  deprecatedCount: number;
  enrichedCount: number;
  providerDetails: {
    aws: ProviderDetail;
    azure: ProviderDetail;
    gcp: ProviderDetail;
    ncp: ProviderDetail;
    kakao: ProviderDetail;
    kt: ProviderDetail;
    nhn: ProviderDetail;
  };
}

interface ApiResponse {
  success: boolean;
  data: {
    stats: CatalogStats;
  };
  error?: string;
}

// ---------------------------------------------------------------------------
// Provider config
// ---------------------------------------------------------------------------

interface ProviderConfig {
  key: 'aws' | 'azure' | 'gcp' | 'ncp' | 'kakao' | 'kt' | 'nhn';
  name: string;
  nameKo: string;
  accent: string;
  accentBg: string;
  accentText: string;
}

const PROVIDERS: ProviderConfig[] = [
  { key: 'aws', name: 'Amazon Web Services', nameKo: 'AWS', accent: 'border-orange-300', accentBg: 'bg-orange-50', accentText: 'text-orange-700' },
  { key: 'azure', name: 'Microsoft Azure', nameKo: 'Azure', accent: 'border-blue-300', accentBg: 'bg-blue-50', accentText: 'text-blue-700' },
  { key: 'gcp', name: 'Google Cloud Platform', nameKo: 'GCP', accent: 'border-green-300', accentBg: 'bg-green-50', accentText: 'text-green-700' },
  { key: 'ncp', name: 'Naver Cloud Platform', nameKo: 'NCP', accent: 'border-emerald-300', accentBg: 'bg-emerald-50', accentText: 'text-emerald-700' },
  { key: 'kakao', name: 'Kakao Cloud', nameKo: '카카오 클라우드', accent: 'border-yellow-300', accentBg: 'bg-yellow-50', accentText: 'text-yellow-700' },
  { key: 'kt', name: 'KT Cloud', nameKo: 'KT 클라우드', accent: 'border-rose-300', accentBg: 'bg-rose-50', accentText: 'text-rose-700' },
  { key: 'nhn', name: 'NHN Cloud', nameKo: 'NHN 클라우드', accent: 'border-violet-300', accentBg: 'bg-violet-50', accentText: 'text-violet-700' },
];

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

export default function CloudCatalogListPage() {
  const [stats, setStats] = useState<CatalogStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/knowledge/cloud-catalog');
        if (!response.ok) {
          throw new Error('데이터를 가져오는데 실패했습니다');
        }
        const json: ApiResponse = await response.json();
        if (!json.success) {
          throw new Error(json.error || '데이터를 가져오는데 실패했습니다');
        }
        setStats(json.data.stats);
      } catch (err) {
        const message = err instanceof Error ? err.message : '오류가 발생했습니다';
        setError(message);
        log.error('클라우드 카탈로그 조회 실패');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
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
          <h1 className="text-2xl font-bold text-gray-900">클라우드 카탈로그 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            클라우드 서비스 카탈로그 조회 및 관리
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

  if (!stats) return null;

  const enrichedPct = stats.total > 0
    ? Math.round((stats.enrichedCount / stats.total) * 100)
    : 0;

  const categoryCount = Object.keys(stats.byCategory).length;

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
          <h1 className="text-2xl font-bold text-gray-900">클라우드 카탈로그 관리</h1>
        </div>
        <div className="mt-1 flex items-center gap-3">
          <p className="text-sm text-gray-500">
            클라우드 서비스 카탈로그 조회 및 관리
          </p>
          <Link
            href="/admin/knowledge/cloud-catalog/table"
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-cyan-700 bg-cyan-50 rounded-md hover:bg-cyan-100 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            테이블 뷰
          </Link>
        </div>
      </div>

      {/* 전체 통계 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-sm font-medium text-gray-500 mb-4">전체 통계</h2>
        <div className="flex gap-8 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">총 서비스</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{enrichedPct}%</p>
              <p className="text-xs text-gray-500">enriched ({stats.enrichedCount}/{stats.total})</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{categoryCount}</p>
              <p className="text-xs text-gray-500">카테고리</p>
            </div>
          </div>
        </div>
      </div>

      {/* 프로바이더 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PROVIDERS.map((provider) => {
          const detail = stats.providerDetails[provider.key];
          const svcCount = stats.byProvider[provider.key];

          return (
            <div
              key={provider.key}
              className={`bg-white rounded-lg shadow p-6 border-t-4 ${provider.accent}`}
            >
              {/* 프로바이더 이름 */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {provider.nameKo}
                </h3>
                <p className="text-sm text-gray-500">{provider.name}</p>
              </div>

              {/* 통계 */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className={`text-center p-2 ${provider.accentBg} rounded-lg`}>
                  <p className={`text-lg font-bold ${provider.accentText}`}>{svcCount}</p>
                  <p className="text-xs text-gray-500">서비스</p>
                </div>
                <div className={`text-center p-2 ${provider.accentBg} rounded-lg`}>
                  <p className={`text-lg font-bold ${provider.accentText}`}>{detail.componentTypes}</p>
                  <p className="text-xs text-gray-500">컴포넌트 타입</p>
                </div>
                <div className={`text-center p-2 ${provider.accentBg} rounded-lg`}>
                  <p className={`text-lg font-bold ${provider.accentText}`}>{detail.enrichedServices}</p>
                  <p className="text-xs text-gray-500">enriched</p>
                </div>
              </div>

              {/* 상세 정보 */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Active 서비스</span>
                  <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                    {detail.activeServices}
                  </span>
                </div>
                {detail.deprecatedServices > 0 && (
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Deprecated</span>
                    <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                      {detail.deprecatedServices}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-gray-600">
                  <span>Enrichment 비율</span>
                  <span className="text-xs text-gray-500">
                    {svcCount > 0 ? Math.round((detail.enrichedServices / svcCount) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 카테고리 분포 */}
      {Object.keys(stats.byCategory).length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-4">카테고리 분포</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.byCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([category, count]) => (
                <span
                  key={category}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700"
                >
                  {category}
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-gray-200 text-gray-600">
                    {count}
                  </span>
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
