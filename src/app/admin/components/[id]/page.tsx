/**
 * 컴포넌트 상세 페이지
 */

import { prisma } from '@/lib/db/prisma';
import { PolicyRecommendation } from '@/generated/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

const categoryLabels: Record<string, string> = {
  security: '보안',
  network: '네트워크',
  compute: '컴퓨팅',
  cloud: '클라우드',
  storage: '스토리지',
  auth: '인증',
  external: '외부',
};

const tierLabels: Record<string, string> = {
  external: '외부 (External)',
  dmz: 'DMZ',
  internal: '내부 (Internal)',
  data: '데이터 (Data)',
};

const priorityLabels: Record<string, { label: string; color: string }> = {
  critical: { label: '필수', color: 'bg-red-100 text-red-800' },
  high: { label: '높음', color: 'bg-orange-100 text-orange-800' },
  medium: { label: '중간', color: 'bg-yellow-100 text-yellow-800' },
  low: { label: '낮음', color: 'bg-gray-100 text-gray-800' },
};

const policyCategoryLabels: Record<string, string> = {
  access: '접근 제어',
  security: '보안',
  monitoring: '모니터링',
  compliance: '컴플라이언스',
  performance: '성능',
};

async function getComponent(id: string) {
  const component = await prisma.infraComponent.findUnique({
    where: { id },
    include: {
      policies: {
        orderBy: { priority: 'asc' },
      },
    },
  });

  if (!component) {
    // componentId로도 시도
    const componentById = await prisma.infraComponent.findUnique({
      where: { componentId: id },
      include: {
        policies: {
          orderBy: { priority: 'asc' },
        },
      },
    });

    return componentById;
  }

  return component;
}

export default async function ComponentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const component = await getComponent(id);

  if (!component) {
    notFound();
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{component.nameKo}</h1>
            {!component.isActive && (
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-500">
                비활성
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">{component.name}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/components"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            목록으로
          </Link>
          <Link
            href={`/admin/components/${component.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            수정
          </Link>
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
                <dt className="text-sm font-medium text-gray-500">컴포넌트 ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{component.componentId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">카테고리</dt>
                <dd className="mt-1 text-sm text-gray-900">{categoryLabels[component.category]}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">티어</dt>
                <dd className="mt-1 text-sm text-gray-900">{tierLabels[component.tier]}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">생성일</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(component.createdAt).toLocaleDateString('ko-KR')}
                </dd>
              </div>
            </dl>
          </div>

          {/* 설명 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">설명</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">한국어</h3>
                <p className="text-sm text-gray-900">{component.descriptionKo}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">English</h3>
                <p className="text-sm text-gray-900">{component.description}</p>
              </div>
            </div>
          </div>

          {/* 기능 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">주요 기능</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">한국어</h3>
                <ul className="list-disc list-inside space-y-1">
                  {component.functionsKo.map((fn: string, index: number) => (
                    <li key={index} className="text-sm text-gray-900">{fn}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">English</h3>
                <ul className="list-disc list-inside space-y-1">
                  {component.functions.map((fn: string, index: number) => (
                    <li key={index} className="text-sm text-gray-900">{fn}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 특징 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">특징</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">한국어</h3>
                <ul className="list-disc list-inside space-y-1">
                  {component.featuresKo.map((feature: string, index: number) => (
                    <li key={index} className="text-sm text-gray-900">{feature}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">English</h3>
                <ul className="list-disc list-inside space-y-1">
                  {component.features.map((feature: string, index: number) => (
                    <li key={index} className="text-sm text-gray-900">{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 권장 정책 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              권장 정책 ({component.policies.length}개)
            </h2>
            {component.policies.length > 0 ? (
              <div className="space-y-4">
                {component.policies.map((policy: PolicyRecommendation) => (
                  <div
                    key={policy.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{policy.nameKo}</span>
                        <span className="text-sm text-gray-500">({policy.name})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            priorityLabels[policy.priority]?.color || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {priorityLabels[policy.priority]?.label || policy.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          {policyCategoryLabels[policy.category] || policy.category}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{policy.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">등록된 정책이 없습니다.</p>
            )}
          </div>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 기술 정보 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">기술 정보</h2>
            <div className="space-y-4">
              {component.ports.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">포트</h3>
                  <div className="flex flex-wrap gap-2">
                    {component.ports.map((port: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-md"
                      >
                        {port}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {component.protocols.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">프로토콜</h3>
                  <div className="flex flex-wrap gap-2">
                    {component.protocols.map((protocol: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                      >
                        {protocol}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {component.vendors.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">벤더</h3>
                  <div className="flex flex-wrap gap-2">
                    {component.vendors.map((vendor: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md"
                      >
                        {vendor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {component.ports.length === 0 &&
                component.protocols.length === 0 &&
                component.vendors.length === 0 && (
                  <p className="text-sm text-gray-500">기술 정보가 없습니다.</p>
                )}
            </div>
          </div>

          {/* 메타 정보 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">메타 정보</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">ID</dt>
                <dd className="mt-1 text-xs text-gray-400 font-mono break-all">
                  {component.id}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">생성일</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(component.createdAt).toLocaleString('ko-KR')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">수정일</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(component.updatedAt).toLocaleString('ko-KR')}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
