'use client';

/**
 * 클라우드 서비스 상세 페이지
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface CloudService {
  id: string;
  serviceId: string;
  provider: string;
  serviceName: string;
  serviceNameKo: string;
  componentType: string;
  status: string;
  successor?: string;
  features: string[];
  featuresKo: string[];
  pricingTier: string;
  trustMetadata?: {
    confidence: number;
    source?: { type: string; title: string };
    lastReviewedAt?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const providerBadge: Record<string, string> = {
  aws: 'bg-orange-100 text-orange-800',
  azure: 'bg-blue-100 text-blue-800',
  gcp: 'bg-red-100 text-red-800',
};

const statusBadge: Record<string, { label: string; color: string }> = {
  active: { label: '활성', color: 'bg-green-100 text-green-800' },
  deprecated: { label: '지원종료', color: 'bg-red-100 text-red-800' },
  preview: { label: '미리보기', color: 'bg-yellow-100 text-yellow-800' },
  end_of_life: { label: 'EOL', color: 'bg-gray-100 text-gray-800' },
};

export default function CloudServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [service, setService] = useState<CloudService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/knowledge/cloud-services/${id}`);
        if (!response.ok) {
          throw new Error('데이터를 가져오는데 실패했습니다');
        }
        const data = await response.json();
        setService(data.data || data);
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

  if (error || !service) {
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
            <h1 className="text-2xl font-bold text-gray-900">{service.serviceNameKo}</h1>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${providerBadge[service.provider] || 'bg-gray-100 text-gray-800'}`}>
              {service.provider.toUpperCase()}
            </span>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadge[service.status]?.color || 'bg-gray-100 text-gray-800'}`}>
              {statusBadge[service.status]?.label || service.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">{service.serviceName}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/knowledge/cloud-services"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            목록으로
          </Link>
          <Link
            href={`/admin/knowledge/cloud-services/${service.id}/edit`}
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
                <dt className="text-sm font-medium text-gray-500">서비스 ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{service.serviceId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">프로바이더</dt>
                <dd className="mt-1 text-sm text-gray-900">{service.provider.toUpperCase()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">컴포넌트 타입</dt>
                <dd className="mt-1 text-sm text-gray-900">{service.componentType}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">가격 티어</dt>
                <dd className="mt-1 text-sm text-gray-900">{service.pricingTier}</dd>
              </div>
              {service.successor && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">후속 서비스</dt>
                  <dd className="mt-1 text-sm text-gray-900">{service.successor}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* 기능 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">기능</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">English</h3>
                <ul className="list-disc list-inside space-y-1">
                  {service.features.map((f, i) => (
                    <li key={i} className="text-sm text-gray-900">{f}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">한국어</h3>
                <ul className="list-disc list-inside space-y-1">
                  {service.featuresKo.map((f, i) => (
                    <li key={i} className="text-sm text-gray-900">{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 신뢰도 */}
          {service.trustMetadata && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">신뢰도</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">신뢰도</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">
                    {((service.trustMetadata.confidence ?? 0) * 100).toFixed(0)}%
                  </dd>
                </div>
                {service.trustMetadata.source && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">출처</dt>
                    <dd className="mt-1 text-sm text-gray-900">{service.trustMetadata.source.title}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* 메타 정보 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">메타 정보</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">ID</dt>
                <dd className="mt-1 text-xs text-gray-400 font-mono break-all">{service.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">생성일</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(service.createdAt).toLocaleString('ko-KR')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">수정일</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(service.updatedAt).toLocaleString('ko-KR')}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
