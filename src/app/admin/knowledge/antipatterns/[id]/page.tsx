'use client';

/**
 * 안티패턴 상세 페이지
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

interface AntiPattern {
  id: string;
  antiPatternId: string;
  name: string;
  nameKo: string;
  severity: string;
  detectionRuleId: string;
  detectionDescriptionKo: string;
  problemKo: string;
  impactKo: string;
  solutionKo: string;
  tags: string[];
  trustMetadata: TrustMetadata;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const severityLabels: Record<string, { label: string; color: string }> = {
  critical: { label: '심각', color: 'bg-red-100 text-red-800' },
  high: { label: '높음', color: 'bg-orange-100 text-orange-800' },
  medium: { label: '중간', color: 'bg-yellow-100 text-yellow-800' },
  low: { label: '낮음', color: 'bg-gray-100 text-gray-800' },
};

function confidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-green-600';
  if (confidence >= 0.5) return 'text-yellow-600';
  return 'text-red-600';
}

export default function AntiPatternDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<AntiPattern | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/knowledge/antipatterns/${id}`);
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
    if (!confirm('이 안티패턴을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/knowledge/antipatterns/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('삭제에 실패했습니다');
      router.push('/admin/knowledge/antipatterns');
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
        <Link href="/admin/knowledge/antipatterns" className="mt-4 inline-block text-blue-600 hover:underline">
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
            <Link href="/admin/knowledge/antipatterns" className="hover:text-blue-600">안티패턴 관리</Link>
            <span>/</span>
            <span>{data.antiPatternId}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{data.nameKo}</h1>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${severityLabels[data.severity]?.color || 'bg-gray-100 text-gray-800'}`}>
              {severityLabels[data.severity]?.label || data.severity}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">{data.name}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/knowledge/antipatterns"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            목록으로
          </Link>
          <Link
            href={`/admin/knowledge/antipatterns/${data.id}/edit`}
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
                <dt className="text-sm font-medium text-gray-500">AntiPattern ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{data.antiPatternId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">심각도</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${severityLabels[data.severity]?.color || 'bg-gray-100 text-gray-800'}`}>
                    {severityLabels[data.severity]?.label || data.severity}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">이름 (EN)</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">이름 (KO)</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.nameKo}</dd>
              </div>
              {data.detectionRuleId && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">탐지 규칙 ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">{data.detectionRuleId}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* 상세 설명 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">상세 설명</h2>
            <div className="space-y-4">
              {data.detectionDescriptionKo && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">탐지 설명</h3>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{data.detectionDescriptionKo}</p>
                </div>
              )}
              {data.problemKo && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">문제점</h3>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{data.problemKo}</p>
                </div>
              )}
              {data.impactKo && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">영향</h3>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{data.impactKo}</p>
                </div>
              )}
              {data.solutionKo && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">해결방안</h3>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{data.solutionKo}</p>
                </div>
              )}
            </div>
          </div>

          {/* 태그 */}
          {data.tags && data.tags.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">태그</h2>
              <div className="flex flex-wrap gap-2">
                {data.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
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
