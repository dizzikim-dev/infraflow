'use client';

/**
 * 벤치마크 상세 페이지
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Benchmark {
  id: string;
  componentType: string;
  trafficTier: string;
  recommendedInstanceCount: number;
  recommendedSpec: string;
  recommendedSpecKo: string;
  minimumInstanceCount: number;
  minimumSpec: string;
  minimumSpecKo: string;
  scalingNotes: string;
  scalingNotesKo: string;
  estimatedMonthlyCost?: number;
  maxRPS: number;
  trustMetadata?: {
    confidence: number;
    source?: { type: string; title: string };
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const trafficTierBadge: Record<string, { label: string; color: string }> = {
  small: { label: 'Small', color: 'bg-green-100 text-green-800' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  large: { label: 'Large', color: 'bg-orange-100 text-orange-800' },
  enterprise: { label: 'Enterprise', color: 'bg-purple-100 text-purple-800' },
};

export default function BenchmarkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [benchmark, setBenchmark] = useState<Benchmark | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/knowledge/benchmarks/${id}`);
        if (!response.ok) throw new Error('데이터를 가져오는데 실패했습니다');
        const data = await response.json();
        setBenchmark(data.data || data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <svg className="animate-spin h-8 w-8 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="mt-4 text-gray-500">데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !benchmark) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-sm text-red-700">{error || '데이터를 찾을 수 없습니다'}</p>
        <button onClick={() => router.back()} className="mt-4 text-sm text-blue-600 hover:underline">
          뒤로 가기
        </button>
      </div>
    );
  }

  const tierInfo = trafficTierBadge[benchmark.trafficTier];

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{benchmark.componentType}</h1>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${tierInfo?.color || 'bg-gray-100 text-gray-800'}`}>
              {tierInfo?.label || benchmark.trafficTier}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">벤치마크 사양</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/knowledge/benchmarks"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            목록으로
          </Link>
          <Link
            href={`/admin/knowledge/benchmarks/${benchmark.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            수정
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 메인 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 기본 정보 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">기본 정보</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">컴포넌트 타입</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{benchmark.componentType}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">트래픽 티어</dt>
                <dd className="mt-1 text-sm text-gray-900">{benchmark.trafficTier}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Max RPS</dt>
                <dd className="mt-1 text-sm text-gray-900">{benchmark.maxRPS.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">월 예상 비용</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {benchmark.estimatedMonthlyCost !== undefined && benchmark.estimatedMonthlyCost !== null
                    ? `$${benchmark.estimatedMonthlyCost.toLocaleString()}`
                    : '-'}
                </dd>
              </div>
            </dl>
          </div>

          {/* 권장 사양 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">권장 사양</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">인스턴스 수</dt>
                <dd className="mt-1 text-sm text-gray-900">{benchmark.recommendedInstanceCount}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">사양 (영문)</dt>
                <dd className="mt-1 text-sm text-gray-900">{benchmark.recommendedSpec}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">사양 (한국어)</dt>
                <dd className="mt-1 text-sm text-gray-900">{benchmark.recommendedSpecKo}</dd>
              </div>
            </dl>
          </div>

          {/* 최소 사양 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">최소 사양</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">인스턴스 수</dt>
                <dd className="mt-1 text-sm text-gray-900">{benchmark.minimumInstanceCount}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">사양 (영문)</dt>
                <dd className="mt-1 text-sm text-gray-900">{benchmark.minimumSpec}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">사양 (한국어)</dt>
                <dd className="mt-1 text-sm text-gray-900">{benchmark.minimumSpecKo}</dd>
              </div>
            </dl>
          </div>

          {/* 스케일링 노트 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">스케일링 노트</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">English</h3>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{benchmark.scalingNotes}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">한국어</h3>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{benchmark.scalingNotesKo}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {benchmark.trustMetadata && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">신뢰도</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">신뢰도</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">
                    {((benchmark.trustMetadata.confidence ?? 0) * 100).toFixed(0)}%
                  </dd>
                </div>
                {benchmark.trustMetadata.source && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">출처</dt>
                    <dd className="mt-1 text-sm text-gray-900">{benchmark.trustMetadata.source.title}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">메타 정보</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">ID</dt>
                <dd className="mt-1 text-xs text-gray-400 font-mono break-all">{benchmark.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">생성일</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(benchmark.createdAt).toLocaleString('ko-KR')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">수정일</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(benchmark.updatedAt).toLocaleString('ko-KR')}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
