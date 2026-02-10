'use client';

/**
 * 패턴 상세 페이지
 *
 * 단일 인프라 아키텍처 패턴의 상세 정보 표시
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { KnowledgePageLayout, TrustBadge } from '@/components/admin/knowledge';

interface RequiredComponent {
  type: string;
  minCount: number;
}

interface OptionalComponent {
  type: string;
  benefit: string;
  benefitKo: string;
}

interface PatternDetail {
  id: string;
  patternId: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  scalability: string;
  complexity: number;
  requiredComponents: RequiredComponent[];
  optionalComponents: OptionalComponent[];
  bestForKo: string[];
  notSuitableForKo: string[];
  evolvesTo: string[];
  evolvesFrom: string[];
  tags: string[];
  trustMetadata: { confidence: number; sources: { type: string; title: string }[] } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const scalabilityBadgeColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-green-100 text-green-800',
  auto: 'bg-purple-100 text-purple-800',
};

function renderStars(complexity: number) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i < complexity ? 'text-yellow-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export default function PatternDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [pattern, setPattern] = useState<PatternDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/knowledge/patterns/${id}`);
        if (!response.ok) {
          throw new Error('패턴을 찾을 수 없습니다');
        }
        const data = await response.json();
        setPattern(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!pattern) return;
    if (!confirm(`패턴 "${pattern.nameKo}"을(를) 삭제하시겠습니까?`)) return;

    try {
      const response = await fetch(`/api/knowledge/patterns/${pattern.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('삭제에 실패했습니다');
      }

      router.push('/admin/knowledge/patterns');
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <svg className="animate-spin h-8 w-8 mx-auto text-green-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="mt-4 text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (error || !pattern) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">{error || '패턴을 찾을 수 없습니다'}</p>
        <Link href="/admin/knowledge/patterns" className="mt-4 inline-block text-blue-600 hover:underline">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const requiredComponents = (pattern.requiredComponents || []) as RequiredComponent[];
  const optionalComponents = (pattern.optionalComponents || []) as OptionalComponent[];

  return (
    <KnowledgePageLayout
      title={pattern.nameKo}
      description={pattern.name}
      actions={
        <div className="flex gap-3">
          <Link
            href="/admin/knowledge/patterns"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            목록으로
          </Link>
          <Link
            href={`/admin/knowledge/patterns/${pattern.id}/edit`}
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
                <dt className="text-sm font-medium text-gray-500">Pattern ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{pattern.patternId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">확장성</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                      scalabilityBadgeColors[pattern.scalability] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {pattern.scalability}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">복잡도</dt>
                <dd className="mt-1">{renderStars(pattern.complexity)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">상태</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                      pattern.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {pattern.isActive ? '활성' : '비활성'}
                  </span>
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
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{pattern.descriptionKo || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">English</h3>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{pattern.description || '-'}</p>
              </div>
            </div>
          </div>

          {/* 필수 구성요소 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              필수 구성요소 ({requiredComponents.length}개)
            </h2>
            {requiredComponents.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">타입</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      최소 수량
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requiredComponents.map((comp, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2 text-sm font-mono text-gray-900">{comp.type}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{comp.minCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-500">등록된 필수 구성요소가 없습니다.</p>
            )}
          </div>

          {/* 선택 구성요소 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              선택 구성요소 ({optionalComponents.length}개)
            </h2>
            {optionalComponents.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">타입</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      이점 (영문)
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      이점 (한국어)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {optionalComponents.map((comp, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2 text-sm font-mono text-gray-900">{comp.type}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{comp.benefit}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{comp.benefitKo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-500">등록된 선택 구성요소가 없습니다.</p>
            )}
          </div>

          {/* 적합성 정보 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">적합성 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">적합한 환경</h3>
                {(pattern.bestForKo || []).length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {pattern.bestForKo.map((item, i) => (
                      <li key={i} className="text-sm text-gray-900">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">-</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">부적합한 환경</h3>
                {(pattern.notSuitableForKo || []).length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {pattern.notSuitableForKo.map((item, i) => (
                      <li key={i} className="text-sm text-gray-900">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">-</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 진화 경로 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">진화 경로</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Evolves To</h3>
                <div className="flex flex-wrap gap-2">
                  {(pattern.evolvesTo || []).length > 0 ? (
                    pattern.evolvesTo.map((id) => (
                      <span key={id} className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md font-mono">
                        {id}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">-</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Evolves From</h3>
                <div className="flex flex-wrap gap-2">
                  {(pattern.evolvesFrom || []).length > 0 ? (
                    pattern.evolvesFrom.map((id) => (
                      <span key={id} className="inline-flex px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md font-mono">
                        {id}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">-</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 태그 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">태그</h2>
            <div className="flex flex-wrap gap-2">
              {(pattern.tags || []).length > 0 ? (
                pattern.tags.map((tag) => (
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
            {pattern.trustMetadata ? (
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">신뢰도: </span>
                  <TrustBadge confidence={pattern.trustMetadata.confidence} size="md" />
                </div>
                {pattern.trustMetadata.sources && pattern.trustMetadata.sources.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500">소스:</span>
                    <div className="mt-1 space-y-1">
                      {pattern.trustMetadata.sources.map((s, i) => (
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
                <dd className="mt-1 text-xs text-gray-400 font-mono break-all">{pattern.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">생성일</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(pattern.createdAt).toLocaleString('ko-KR')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">수정일</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(pattern.updatedAt).toLocaleString('ko-KR')}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </KnowledgePageLayout>
  );
}
