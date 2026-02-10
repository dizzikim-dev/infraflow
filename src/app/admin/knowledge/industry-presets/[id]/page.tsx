'use client';

/**
 * 산업별 프리셋 상세 페이지
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface IndustryPreset {
  id: string;
  industryType: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  minimumSecurityLevel: string;
  requiredFrameworks: string[];
  requiredComponents: string[];
  recommendedComponents: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const industryTypeBadge: Record<string, { label: string; color: string }> = {
  financial: { label: '금융', color: 'bg-blue-100 text-blue-800' },
  healthcare: { label: '의료', color: 'bg-green-100 text-green-800' },
  government: { label: '공공', color: 'bg-indigo-100 text-indigo-800' },
  ecommerce: { label: '이커머스', color: 'bg-purple-100 text-purple-800' },
  general: { label: '일반', color: 'bg-gray-100 text-gray-800' },
};

const securityLevelBadge: Record<string, { label: string; color: string }> = {
  basic: { label: 'Basic', color: 'bg-green-100 text-green-800' },
  standard: { label: 'Standard', color: 'bg-blue-100 text-blue-800' },
  enhanced: { label: 'Enhanced', color: 'bg-orange-100 text-orange-800' },
  maximum: { label: 'Maximum', color: 'bg-red-100 text-red-800' },
};

export default function IndustryPresetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [preset, setPreset] = useState<IndustryPreset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/knowledge/industry-presets/${id}`);
        if (!response.ok) throw new Error('데이터를 가져오는데 실패했습니다');
        const data = await response.json();
        setPreset(data.data || data);
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

  if (error || !preset) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-sm text-red-700">{error || '데이터를 찾을 수 없습니다'}</p>
        <button onClick={() => router.back()} className="mt-4 text-sm text-blue-600 hover:underline">
          뒤로 가기
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{preset.nameKo}</h1>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${industryTypeBadge[preset.industryType]?.color || 'bg-gray-100 text-gray-800'}`}>
              {industryTypeBadge[preset.industryType]?.label || preset.industryType}
            </span>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${securityLevelBadge[preset.minimumSecurityLevel]?.color || 'bg-gray-100 text-gray-800'}`}>
              {securityLevelBadge[preset.minimumSecurityLevel]?.label || preset.minimumSecurityLevel}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">{preset.name}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/knowledge/industry-presets"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            목록으로
          </Link>
          <Link
            href={`/admin/knowledge/industry-presets/${preset.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            수정
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 메인 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 설명 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">설명</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">English</h3>
                <p className="text-sm text-gray-900">{preset.description}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">한국어</h3>
                <p className="text-sm text-gray-900">{preset.descriptionKo}</p>
              </div>
            </div>
          </div>

          {/* 필수 프레임워크 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              필수 프레임워크 ({preset.requiredFrameworks.length}개)
            </h2>
            {preset.requiredFrameworks.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {preset.requiredFrameworks.map((f, i) => (
                  <span key={i} className="inline-flex px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {f}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">등록된 프레임워크가 없습니다.</p>
            )}
          </div>

          {/* 필수 컴포넌트 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              필수 컴포넌트 ({preset.requiredComponents.length}개)
            </h2>
            {preset.requiredComponents.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {preset.requiredComponents.map((c, i) => (
                  <span key={i} className="inline-flex px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">등록된 필수 컴포넌트가 없습니다.</p>
            )}
          </div>

          {/* 권장 컴포넌트 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              권장 컴포넌트 ({preset.recommendedComponents.length}개)
            </h2>
            {preset.recommendedComponents.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {preset.recommendedComponents.map((c, i) => (
                  <span key={i} className="inline-flex px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">등록된 권장 컴포넌트가 없습니다.</p>
            )}
          </div>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">메타 정보</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">ID</dt>
                <dd className="mt-1 text-xs text-gray-400 font-mono break-all">{preset.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">산업 유형</dt>
                <dd className="mt-1 text-sm text-gray-900">{preset.industryType}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">최소 보안 수준</dt>
                <dd className="mt-1 text-sm text-gray-900">{preset.minimumSecurityLevel}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">생성일</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(preset.createdAt).toLocaleString('ko-KR')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">수정일</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(preset.updatedAt).toLocaleString('ko-KR')}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
