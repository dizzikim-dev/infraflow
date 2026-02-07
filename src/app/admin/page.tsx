/**
 * Admin 대시보드 페이지
 */

import { prisma } from '@/lib/db/prisma';
import { ComponentCategory, TierType } from '@/generated/prisma';
import Link from 'next/link';

interface CategoryStat {
  category: ComponentCategory;
  _count: number;
}

interface TierStat {
  tier: TierType;
  _count: number;
}

async function getStats() {
  try {
    const [
      totalComponents,
      activeComponents,
      categoryStats,
      tierStats,
      totalPolicies,
    ] = await Promise.all([
      prisma.infraComponent.count(),
      prisma.infraComponent.count({ where: { isActive: true } }),
      prisma.infraComponent.groupBy({
        by: ['category'],
        _count: true,
        where: { isActive: true },
      }),
      prisma.infraComponent.groupBy({
        by: ['tier'],
        _count: true,
        where: { isActive: true },
      }),
      prisma.policyRecommendation.count(),
    ]);

    return {
      totalComponents,
      activeComponents,
      inactiveComponents: totalComponents - activeComponents,
      categoryStats,
      tierStats,
      totalPolicies,
    };
  } catch {
    // DB 연결 실패 시 기본값 반환
    return {
      totalComponents: 0,
      activeComponents: 0,
      inactiveComponents: 0,
      categoryStats: [],
      tierStats: [],
      totalPolicies: 0,
    };
  }
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
  external: '외부',
  dmz: 'DMZ',
  internal: '내부',
  data: '데이터',
};

const categoryColors: Record<string, string> = {
  security: 'text-red-600',
  network: 'text-blue-600',
  compute: 'text-green-600',
  cloud: 'text-purple-600',
  storage: 'text-yellow-600',
  auth: 'text-indigo-600',
  external: 'text-gray-600',
};

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-1 text-sm text-gray-500">
          인프라 컴포넌트 관리 현황
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* 전체 컴포넌트 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">전체 컴포넌트</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalComponents}</p>
            </div>
          </div>
        </div>

        {/* 활성 컴포넌트 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">활성</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeComponents}</p>
            </div>
          </div>
        </div>

        {/* 비활성 컴포넌트 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100 text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">비활성</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.inactiveComponents}</p>
            </div>
          </div>
        </div>

        {/* 권장 정책 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">권장 정책</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalPolicies}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 카테고리별 현황 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">카테고리별 현황</h2>
          <div className="space-y-3">
            {stats.categoryStats.map((stat: CategoryStat) => (
              <div key={stat.category} className="flex items-center justify-between">
                <span className={`text-sm font-medium ${categoryColors[stat.category]}`}>
                  {categoryLabels[stat.category] || stat.category}
                </span>
                <span className="text-sm text-gray-600">{stat._count}개</span>
              </div>
            ))}
            {stats.categoryStats.length === 0 && (
              <p className="text-sm text-gray-500">데이터가 없습니다</p>
            )}
          </div>
        </div>

        {/* 티어별 현황 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">티어별 현황</h2>
          <div className="space-y-3">
            {stats.tierStats.map((stat: TierStat) => (
              <div key={stat.tier} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {tierLabels[stat.tier] || stat.tier}
                </span>
                <span className="text-sm text-gray-600">{stat._count}개</span>
              </div>
            ))}
            {stats.tierStats.length === 0 && (
              <p className="text-sm text-gray-500">데이터가 없습니다</p>
            )}
          </div>
        </div>
      </div>

      {/* 빠른 작업 */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">빠른 작업</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/components"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            컴포넌트 목록
          </Link>
          <Link
            href="/admin/components/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            새 컴포넌트 추가
          </Link>
        </div>
      </div>

      {/* DB 연결 안내 */}
      {stats.totalComponents === 0 && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">데이터베이스 설정 필요</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>데이터가 없습니다. 다음 단계를 수행해주세요:</p>
                <ol className="mt-2 list-decimal list-inside space-y-1">
                  <li>PostgreSQL 데이터베이스 생성</li>
                  <li><code className="bg-yellow-100 px-1 rounded">.env</code> 파일에 DATABASE_URL 설정</li>
                  <li><code className="bg-yellow-100 px-1 rounded">npx prisma migrate dev</code> 실행</li>
                  <li><code className="bg-yellow-100 px-1 rounded">npx prisma db seed</code> 실행</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
