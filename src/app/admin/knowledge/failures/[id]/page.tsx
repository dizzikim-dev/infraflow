'use client';

/**
 * 장애 시나리오 상세 페이지
 */

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TrustMetadata {
  confidence: number;
  source?: {
    type: string;
    title: string;
    accessedDate?: string;
  };
  lastReviewedAt?: string;
}

interface Failure {
  id: string;
  failureId: string;
  component: string;
  titleKo: string;
  scenarioKo: string;
  impact: string;
  likelihood: string;
  affectedComponents: string[];
  preventionKo: string[];
  mitigationKo: string[];
  estimatedMTTR: string;
  tags: string[];
  trustMetadata: TrustMetadata;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const impactLabels: Record<string, { label: string; color: string }> = {
  service_down: { label: '서비스 중단', color: 'bg-red-100 text-red-800' },
  degraded: { label: '성능 저하', color: 'bg-orange-100 text-orange-800' },
  data_loss: { label: '데이터 손실', color: 'bg-yellow-100 text-yellow-800' },
  security_breach: { label: '보안 침해', color: 'bg-purple-100 text-purple-800' },
};

const likelihoodLabels: Record<string, { label: string; color: string }> = {
  high: { label: '높음', color: 'bg-red-100 text-red-800' },
  medium: { label: '중간', color: 'bg-yellow-100 text-yellow-800' },
  low: { label: '낮음', color: 'bg-green-100 text-green-800' },
};

function confidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-green-600';
  if (confidence >= 0.5) return 'text-yellow-600';
  return 'text-red-600';
}

export default function FailureDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<Failure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/knowledge/failures/${id}`);
        if (!response.ok) throw new Error('데이터를 가져오는데 실패했습니다');
        const result = await response.json();
        setData(result.data || result);
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('이 장애 시나리오를 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/knowledge/failures/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('삭제에 실패했습니다');
      router.push('/admin/knowledge/failures');
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다');
    }
  };

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

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">{error || '데이터를 찾을 수 없습니다'}</p>
        <Link href="/admin/knowledge/failures" className="mt-4 inline-block text-blue-600 hover:underline">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/admin/knowledge/failures" className="hover:text-blue-600">장애 시나리오 관리</Link>
            <span>/</span>
            <span>{data.failureId}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{data.titleKo}</h1>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${impactLabels[data.impact]?.color || 'bg-gray-100 text-gray-800'}`}>
              {impactLabels[data.impact]?.label || data.impact}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {data.failureId} | {data.component}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/knowledge/failures"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            목록으로
          </Link>
          <Link
            href={`/admin/knowledge/failures/${data.id}/edit`}
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 메인 콘텐츠 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 기본 정보 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">기본 정보</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Failure ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{data.failureId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">컴포넌트</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.component}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">영향</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${impactLabels[data.impact]?.color || 'bg-gray-100 text-gray-800'}`}>
                    {impactLabels[data.impact]?.label || data.impact}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">발생 가능성</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${likelihoodLabels[data.likelihood]?.color || 'bg-gray-100 text-gray-800'}`}>
                    {likelihoodLabels[data.likelihood]?.label || data.likelihood}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">예상 MTTR</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.estimatedMTTR || '-'}</dd>
              </div>
            </dl>
          </div>

          {/* 시나리오 */}
          {data.scenarioKo && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">시나리오</h2>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{data.scenarioKo}</p>
            </div>
          )}

          {/* 영향받는 컴포넌트 */}
          {data.affectedComponents && data.affectedComponents.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                영향받는 컴포넌트 ({data.affectedComponents.length}개)
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.affectedComponents.map((comp, index) => (
                  <span
                    key={index}
                    className="inline-flex px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 예방 조치 */}
          {data.preventionKo && data.preventionKo.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">예방 조치</h2>
              <ul className="space-y-2">
                {data.preventionKo.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-md px-3 py-2"
                  >
                    <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-sm text-green-800">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 완화 조치 */}
          {data.mitigationKo && data.mitigationKo.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">완화 조치</h2>
              <ul className="space-y-2">
                {data.mitigationKo.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-md px-3 py-2"
                  >
                    <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-sm text-blue-800">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 태그 */}
          {data.tags && data.tags.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">태그</h2>
              <div className="flex flex-wrap gap-2">
                {data.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 신뢰 메타데이터 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">신뢰 메타데이터</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">신뢰도</dt>
                <dd className={`mt-1 text-lg font-bold ${confidenceColor(data.trustMetadata?.confidence ?? 0)}`}>
                  {((data.trustMetadata?.confidence ?? 0) * 100).toFixed(0)}%
                </dd>
              </div>
              {data.trustMetadata?.source && (
                <>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">출처 유형</dt>
                    <dd className="mt-1 text-sm text-gray-900">{data.trustMetadata.source.type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">출처 제목</dt>
                    <dd className="mt-1 text-sm text-gray-900">{data.trustMetadata.source.title}</dd>
                  </div>
                </>
              )}
              {data.trustMetadata?.lastReviewedAt && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">최종 검토일</dt>
                  <dd className="mt-1 text-sm text-gray-900">{data.trustMetadata.lastReviewedAt}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* 메타 정보 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">메타 정보</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">ID</dt>
                <dd className="mt-1 text-xs text-gray-400 font-mono break-all">{data.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">상태</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${data.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    {data.isActive ? '활성' : '비활성'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">생성일</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(data.createdAt).toLocaleString('ko-KR')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">수정일</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(data.updatedAt).toLocaleString('ko-KR')}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
