'use client';

/**
 * 성능 프로파일 상세 페이지
 *
 * 단일 성능 프로파일의 상세 정보 표시
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { KnowledgePageLayout, TrustBadge } from '@/components/admin/knowledge';

interface LatencyRange {
  min: number;
  max: number;
  unit: string;
}

interface ThroughputRange {
  typical: string;
  max: string;
}

interface PerformanceDetail {
  id: string;
  performanceId: string;
  component: string;
  nameKo: string;
  latencyRange: LatencyRange | null;
  throughputRange: ThroughputRange | null;
  scalingStrategy: string;
  bottleneckIndicators: string[];
  bottleneckIndicatorsKo: string[];
  optimizationTipsKo: string[];
  tags: string[];
  trustMetadata: { confidence: number; sources: { type: string; title: string }[] } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const scalingStrategyColors: Record<string, string> = {
  horizontal: 'bg-blue-100 text-blue-800',
  vertical: 'bg-purple-100 text-purple-800',
  both: 'bg-green-100 text-green-800',
};

export default function PerformanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [profile, setProfile] = useState<PerformanceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/knowledge/performance/${id}`);
        if (!response.ok) {
          throw new Error('성능 프로파일을 찾을 수 없습니다');
        }
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!profile) return;
    if (!confirm(`성능 프로파일 "${profile.nameKo}"을(를) 삭제하시겠습니까?`)) return;

    try {
      const response = await fetch(`/api/knowledge/performance/${profile.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('삭제에 실패했습니다');
      }

      router.push('/admin/knowledge/performance');
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다');
    }
  };

  if (isLoading) {
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

  if (error || !profile) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">{error || '성능 프로파일을 찾을 수 없습니다'}</p>
        <Link href="/admin/knowledge/performance" className="mt-4 inline-block text-blue-600 hover:underline">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const latency = profile.latencyRange as LatencyRange | null;
  const throughput = profile.throughputRange as ThroughputRange | null;

  return (
    <KnowledgePageLayout
      title={profile.nameKo}
      description={`${profile.component} - ${profile.performanceId}`}
      actions={
        <div className="flex gap-3">
          <Link
            href="/admin/knowledge/performance"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            목록으로
          </Link>
          <Link
            href={`/admin/knowledge/performance/${profile.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            수정
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            삭제
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 메인 콘텐츠 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 기본 정보 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">기본 정보</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Performance ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{profile.performanceId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">컴포넌트</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{profile.component}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">스케일링 전략</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                      scalingStrategyColors[profile.scalingStrategy] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {profile.scalingStrategy}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">상태</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                      profile.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {profile.isActive ? '활성' : '비활성'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* 성능 범위 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">성능 범위</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">지연시간 (Latency)</h3>
                {latency ? (
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-900">
                      {latency.min} - {latency.max} <span className="text-sm font-normal text-gray-500">{latency.unit || 'ms'}</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">정보 없음</p>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">처리량 (Throughput)</h3>
                {throughput ? (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">일반:</span> {throughput.typical || '-'}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">최대:</span> {throughput.max || '-'}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">정보 없음</p>
                )}
              </div>
            </div>
          </div>

          {/* 병목 지표 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">병목 지표</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">영문</h3>
                {(profile.bottleneckIndicators || []).length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {profile.bottleneckIndicators.map((item, i) => (
                      <li key={i} className="text-sm text-gray-900">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">-</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">한국어</h3>
                {(profile.bottleneckIndicatorsKo || []).length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {profile.bottleneckIndicatorsKo.map((item, i) => (
                      <li key={i} className="text-sm text-gray-900">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">-</p>
                )}
              </div>
            </div>
          </div>

          {/* 최적화 팁 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">최적화 팁</h2>
            {(profile.optimizationTipsKo || []).length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {profile.optimizationTipsKo.map((tip, i) => (
                  <li key={i} className="text-sm text-gray-900">{tip}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">등록된 최적화 팁이 없습니다.</p>
            )}
          </div>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 태그 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">태그</h2>
            <div className="flex flex-wrap gap-2">
              {(profile.tags || []).length > 0 ? (
                profile.tags.map((tag) => (
                  <span key={tag} className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                    {tag}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">태그 없음</p>
              )}
            </div>
          </div>

          {/* 신뢰도 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">신뢰도 정보</h2>
            {profile.trustMetadata ? (
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">신뢰도: </span>
                  <TrustBadge confidence={profile.trustMetadata.confidence} size="md" />
                </div>
                {profile.trustMetadata.sources && profile.trustMetadata.sources.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500">소스:</span>
                    <div className="mt-1 space-y-1">
                      {profile.trustMetadata.sources.map((s, i) => (
                        <div key={i} className="text-xs text-gray-600">
                          [{s.type}] {s.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">신뢰도 정보 없음</p>
            )}
          </div>

          {/* 메타 정보 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">메타 정보</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">ID</dt>
                <dd className="mt-1 text-xs text-gray-400 font-mono break-all">{profile.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">생성일</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(profile.createdAt).toLocaleString('ko-KR')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">수정일</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(profile.updatedAt).toLocaleString('ko-KR')}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </KnowledgePageLayout>
  );
}
