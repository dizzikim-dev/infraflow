import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('KnowledgeDashboard');

interface KnowledgeStats {
  relationships: number;
  patterns: number;
  antipatterns: number;
  failures: number;
  performance: number;
  vulnerabilities: number;
  cloudServices: number;
  benchmarks: number;
  industryPresets: number;
  sources: number;
  unrecognizedQueries: number;
  total: number;
}

interface StatCard {
  label: string;
  labelKo: string;
  count: number;
  href: string;
  color: string;
  iconPath: string;
}

async function getStats(): Promise<KnowledgeStats> {
  try {
    const [
      relationships,
      patterns,
      antipatterns,
      failures,
      performance,
      vulnerabilities,
      cloudServices,
      benchmarks,
      industryPresets,
      sources,
      unrecognizedQueries,
    ] = await Promise.all([
      prisma.knowledgeRelationship.count({ where: { isActive: true } }),
      prisma.knowledgePattern.count({ where: { isActive: true } }),
      prisma.knowledgeAntiPattern.count({ where: { isActive: true } }),
      prisma.knowledgeFailure.count({ where: { isActive: true } }),
      prisma.knowledgePerformance.count({ where: { isActive: true } }),
      prisma.knowledgeVulnerability.count({ where: { isActive: true } }),
      prisma.knowledgeCloudService.count({ where: { isActive: true } }),
      prisma.knowledgeBenchmark.count({ where: { isActive: true } }),
      prisma.knowledgeIndustryPreset.count({ where: { isActive: true } }),
      prisma.knowledgeSourceEntry.count({ where: { isActive: true } }),
      prisma.unrecognizedQuery.count({ where: { isActive: true, isResolved: false } }),
    ]);

    const total = relationships + patterns + antipatterns + failures + performance +
      vulnerabilities + cloudServices + benchmarks + industryPresets + sources;

    return {
      relationships, patterns, antipatterns, failures, performance,
      vulnerabilities, cloudServices, benchmarks, industryPresets, sources,
      unrecognizedQueries, total,
    };
  } catch (error) {
    log.error('Knowledge 통계 조회 실패', error instanceof Error ? error : undefined);
    return {
      relationships: 0, patterns: 0, antipatterns: 0, failures: 0, performance: 0,
      vulnerabilities: 0, cloudServices: 0, benchmarks: 0, industryPresets: 0,
      sources: 0, unrecognizedQueries: 0, total: 0,
    };
  }
}

export default async function KnowledgeDashboardPage() {
  const stats = await getStats();

  const statCards: StatCard[] = [
    {
      label: 'Relationships',
      labelKo: '관계',
      count: stats.relationships,
      href: '/admin/knowledge/relationships',
      color: 'text-blue-600 bg-blue-100',
      iconPath: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
    },
    {
      label: 'Patterns',
      labelKo: '패턴',
      count: stats.patterns,
      href: '/admin/knowledge/patterns',
      color: 'text-green-600 bg-green-100',
      iconPath: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
    },
    {
      label: 'Anti-patterns',
      labelKo: '안티패턴',
      count: stats.antipatterns,
      href: '/admin/knowledge/antipatterns',
      color: 'text-red-600 bg-red-100',
      iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    },
    {
      label: 'Failures',
      labelKo: '장애 시나리오',
      count: stats.failures,
      href: '/admin/knowledge/failures',
      color: 'text-orange-600 bg-orange-100',
      iconPath: 'M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414',
    },
    {
      label: 'Performance',
      labelKo: '성능 프로파일',
      count: stats.performance,
      href: '/admin/knowledge/performance',
      color: 'text-purple-600 bg-purple-100',
      iconPath: 'M13 10V3L4 14h7v7l9-11h-7z',
    },
    {
      label: 'Vulnerabilities',
      labelKo: '취약점',
      count: stats.vulnerabilities,
      href: '/admin/knowledge/vulnerabilities',
      color: 'text-rose-600 bg-rose-100',
      iconPath: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    },
    {
      label: 'Cloud Services',
      labelKo: '클라우드 서비스',
      count: stats.cloudServices,
      href: '/admin/knowledge/cloud-services',
      color: 'text-sky-600 bg-sky-100',
      iconPath: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z',
    },
    {
      label: 'Benchmarks',
      labelKo: '벤치마크',
      count: stats.benchmarks,
      href: '/admin/knowledge/benchmarks',
      color: 'text-teal-600 bg-teal-100',
      iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    },
    {
      label: 'Industry Presets',
      labelKo: '산업별 프리셋',
      count: stats.industryPresets,
      href: '/admin/knowledge/industry-presets',
      color: 'text-indigo-600 bg-indigo-100',
      iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    },
    {
      label: 'Sources',
      labelKo: '출처',
      count: stats.sources,
      href: '/admin/knowledge/sources',
      color: 'text-amber-600 bg-amber-100',
      iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      label: 'Unrecognized',
      labelKo: '미인식 쿼리',
      count: stats.unrecognizedQueries,
      href: '/admin/knowledge/unrecognized-queries',
      color: 'text-yellow-600 bg-yellow-100',
      iconPath: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
  ];

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Knowledge DB 관리</h1>
        <p className="mt-1 text-sm text-gray-500">
          인프라 지식 데이터 ({stats.total}개 항목) 조회 및 관리
        </p>
      </div>

      {/* 통계 카드 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.color}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.iconPath} />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{card.count}</p>
                <p className="text-xs text-gray-500">{card.labelKo}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 빠른 작업 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">빠른 작업</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/knowledge/relationships/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            관계 추가
          </Link>
          <Link
            href="/admin/knowledge/patterns/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            패턴 추가
          </Link>
          <Link
            href="/admin/knowledge/antipatterns/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            안티패턴 추가
          </Link>
          <Link
            href="/admin/knowledge/failures/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
          >
            장애 시나리오 추가
          </Link>
          <Link
            href="/admin/knowledge/vulnerabilities/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700"
          >
            취약점 추가
          </Link>
        </div>
      </div>

      {/* DB 연결 안내 */}
      {stats.total === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex">
            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Knowledge DB가 비어있습니다</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>시드 데이터를 로드하려면 다음 명령을 실행하세요:</p>
                <ol className="mt-2 list-decimal list-inside space-y-1">
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
