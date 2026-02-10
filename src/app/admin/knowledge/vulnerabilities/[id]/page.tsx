'use client';

/**
 * 취약점 상세 페이지
 *
 * 단일 취약점의 상세 정보 표시
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { KnowledgePageLayout, TrustBadge, SeverityBadge } from '@/components/admin/knowledge';

interface VulnerabilityDetail {
  id: string;
  vulnId: string;
  cveId: string | null;
  title: string;
  titleKo: string;
  description: string;
  descriptionKo: string;
  severity: string;
  cvssScore: number | null;
  affectedComponents: string[];
  mitigation: string;
  mitigationKo: string;
  publishedDate: string | null;
  references: string[];
  tags: string[];
  trustMetadata: { confidence: number; sources: { type: string; title: string }[] } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function CvssScoreDisplay({ score }: { score: number | null }) {
  if (score === null || score === undefined) {
    return <span className="text-gray-400">-</span>;
  }

  let color = 'text-green-600 bg-green-50';
  let label = 'Low';
  if (score >= 9.0) {
    color = 'text-red-600 bg-red-50';
    label = 'Critical';
  } else if (score >= 7.0) {
    color = 'text-orange-600 bg-orange-50';
    label = 'High';
  } else if (score >= 4.0) {
    color = 'text-yellow-600 bg-yellow-50';
    label = 'Medium';
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${color}`}>
      <span className="text-2xl font-bold">{score.toFixed(1)}</span>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

export default function VulnerabilityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [vuln, setVuln] = useState<VulnerabilityDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/knowledge/vulnerabilities/${id}`);
        if (!response.ok) {
          throw new Error('취약점을 찾을 수 없습니다');
        }
        const data = await response.json();
        setVuln(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!vuln) return;
    if (!confirm(`취약점 "${vuln.titleKo}"을(를) 삭제하시겠습니까?`)) return;

    try {
      const response = await fetch(`/api/knowledge/vulnerabilities/${vuln.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('삭제에 실패했습니다');
      }

      router.push('/admin/knowledge/vulnerabilities');
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <svg className="animate-spin h-8 w-8 mx-auto text-rose-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="mt-4 text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (error || !vuln) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">{error || '취약점을 찾을 수 없습니다'}</p>
        <Link href="/admin/knowledge/vulnerabilities" className="mt-4 inline-block text-blue-600 hover:underline">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <KnowledgePageLayout
      title={vuln.titleKo}
      description={vuln.title}
      actions={
        <div className="flex gap-3">
          <Link
            href="/admin/knowledge/vulnerabilities"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            목록으로
          </Link>
          <Link
            href={`/admin/knowledge/vulnerabilities/${vuln.id}/edit`}
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
                <dt className="text-sm font-medium text-gray-500">Vuln ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{vuln.vulnId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">CVE ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{vuln.cveId || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">심각도</dt>
                <dd className="mt-1">
                  <SeverityBadge severity={vuln.severity} size="md" />
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">CVSS 점수</dt>
                <dd className="mt-1">
                  <CvssScoreDisplay score={vuln.cvssScore} />
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">발행일</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {vuln.publishedDate
                    ? new Date(vuln.publishedDate).toLocaleDateString('ko-KR')
                    : '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">상태</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                      vuln.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {vuln.isActive ? '활성' : '비활성'}
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
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{vuln.descriptionKo || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">English</h3>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{vuln.description || '-'}</p>
              </div>
            </div>
          </div>

          {/* 완화 방안 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">완화 방안</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">한국어</h3>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{vuln.mitigationKo || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">English</h3>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{vuln.mitigation || '-'}</p>
              </div>
            </div>
          </div>

          {/* 영향받는 컴포넌트 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              영향받는 컴포넌트 ({(vuln.affectedComponents || []).length}개)
            </h2>
            <div className="flex flex-wrap gap-2">
              {(vuln.affectedComponents || []).length > 0 ? (
                vuln.affectedComponents.map((comp) => (
                  <span
                    key={comp}
                    className="inline-flex px-2 py-1 bg-red-50 text-red-700 text-sm rounded-md font-mono"
                  >
                    {comp}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">영향받는 컴포넌트 없음</p>
              )}
            </div>
          </div>

          {/* 참조 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">참조</h2>
            {(vuln.references || []).length > 0 ? (
              <ul className="space-y-2">
                {vuln.references.map((ref, i) => (
                  <li key={i}>
                    <a
                      href={ref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                    >
                      {ref}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">등록된 참조가 없습니다.</p>
            )}
          </div>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 태그 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">태그</h2>
            <div className="flex flex-wrap gap-2">
              {(vuln.tags || []).length > 0 ? (
                vuln.tags.map((tag) => (
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
            {vuln.trustMetadata ? (
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">신뢰도: </span>
                  <TrustBadge confidence={vuln.trustMetadata.confidence} size="md" />
                </div>
                {vuln.trustMetadata.sources && vuln.trustMetadata.sources.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500">소스:</span>
                    <div className="mt-1 space-y-1">
                      {vuln.trustMetadata.sources.map((s, i) => (
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
                <dd className="mt-1 text-xs text-gray-400 font-mono break-all">{vuln.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">생성일</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(vuln.createdAt).toLocaleString('ko-KR')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">수정일</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(vuln.updatedAt).toLocaleString('ko-KR')}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </KnowledgePageLayout>
  );
}
