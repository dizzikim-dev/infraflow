'use client';

/**
 * 취약점 수정 페이지
 *
 * 기존 취약점 데이터를 편집하는 폼
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { KnowledgePageLayout, TrustMetadataEditor } from '@/components/admin/knowledge';
import type { TrustMetadataInput } from '@/components/admin/knowledge';
import DynamicArrayField from '@/components/admin/DynamicArrayField';

interface VulnerabilityFormData {
  vulnId: string;
  cveId: string;
  title: string;
  titleKo: string;
  description: string;
  descriptionKo: string;
  severity: string;
  cvssScore: string;
  affectedComponents: string[];
  mitigation: string;
  mitigationKo: string;
  publishedDate: string;
  references: string[];
  tags: string[];
  trustMetadata: TrustMetadataInput;
}

const defaultTrustMetadata: TrustMetadataInput = {
  confidence: 0.85,
  sources: [
    {
      type: 'user_verified',
      title: 'Admin Dashboard',
      accessedDate: new Date().toISOString().split('T')[0],
    },
  ],
};

export default function EditVulnerabilityPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalTitleKo, setOriginalTitleKo] = useState('');

  const [formData, setFormData] = useState<VulnerabilityFormData>({
    vulnId: '',
    cveId: '',
    title: '',
    titleKo: '',
    description: '',
    descriptionKo: '',
    severity: 'medium',
    cvssScore: '',
    affectedComponents: [],
    mitigation: '',
    mitigationKo: '',
    publishedDate: '',
    references: [],
    tags: [],
    trustMetadata: defaultTrustMetadata,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/knowledge/vulnerabilities/${id}`);
        if (!response.ok) {
          throw new Error('취약점을 찾을 수 없습니다');
        }
        const data = await response.json();
        setOriginalTitleKo(data.titleKo);
        setFormData({
          vulnId: data.vulnId || '',
          cveId: data.cveId || '',
          title: data.title || '',
          titleKo: data.titleKo || '',
          description: data.description || '',
          descriptionKo: data.descriptionKo || '',
          severity: data.severity || 'medium',
          cvssScore: data.cvssScore !== null && data.cvssScore !== undefined ? String(data.cvssScore) : '',
          affectedComponents: data.affectedComponents || [],
          mitigation: data.mitigation || '',
          mitigationKo: data.mitigationKo || '',
          publishedDate: data.publishedDate ? data.publishedDate.split('T')[0] : '',
          references: data.references || [],
          tags: data.tags || [],
          trustMetadata: data.trustMetadata || defaultTrustMetadata,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const updateField = <K extends keyof VulnerabilityFormData>(key: K, value: VulnerabilityFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        cveId: formData.cveId || undefined,
        cvssScore: formData.cvssScore ? parseFloat(formData.cvssScore) : undefined,
        publishedDate: formData.publishedDate || undefined,
      };

      const response = await fetch(`/api/knowledge/vulnerabilities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '수정에 실패했습니다');
      }

      router.push(`/admin/knowledge/vulnerabilities/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses =
    'w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none';

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <svg className="animate-spin h-8 w-8 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="mt-4 text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <KnowledgePageLayout
      title="취약점 수정"
      description={originalTitleKo}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* 기본 정보 */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">기본 정보</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vuln ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.vulnId}
                onChange={(e) => updateField('vulnId', e.target.value)}
                className={inputClasses}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CVE ID (선택)</label>
              <input
                type="text"
                value={formData.cveId}
                onChange={(e) => updateField('cveId', e.target.value)}
                className={inputClasses}
                placeholder="예: CVE-2024-12345"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                제목 (영문) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                className={inputClasses}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                제목 (한국어) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.titleKo}
                onChange={(e) => updateField('titleKo', e.target.value)}
                className={inputClasses}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">설명 (영문)</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={4}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">설명 (한국어)</label>
              <textarea
                value={formData.descriptionKo}
                onChange={(e) => updateField('descriptionKo', e.target.value)}
                rows={4}
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        {/* 심각도 및 점수 */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">심각도</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                심각도 (Severity) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.severity}
                onChange={(e) => updateField('severity', e.target.value)}
                className={inputClasses}
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CVSS 점수 (0-10, 선택)</label>
              <input
                type="number"
                value={formData.cvssScore}
                onChange={(e) => updateField('cvssScore', e.target.value)}
                className={inputClasses}
                placeholder="예: 7.5"
                min={0}
                max={10}
                step={0.1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">발행일</label>
              <input
                type="date"
                value={formData.publishedDate}
                onChange={(e) => updateField('publishedDate', e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        {/* 영향 및 대응 */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">영향 및 대응</h2>

          <DynamicArrayField
            label="영향받는 컴포넌트"
            values={formData.affectedComponents}
            onChange={(v) => updateField('affectedComponents', v)}
            placeholder="예: firewall"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">완화 방안 (영문)</label>
              <textarea
                value={formData.mitigation}
                onChange={(e) => updateField('mitigation', e.target.value)}
                rows={4}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">완화 방안 (한국어)</label>
              <textarea
                value={formData.mitigationKo}
                onChange={(e) => updateField('mitigationKo', e.target.value)}
                rows={4}
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        {/* 참조 및 태그 */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">참조 및 태그</h2>

          <DynamicArrayField
            label="참조 URL"
            values={formData.references}
            onChange={(v) => updateField('references', v)}
            placeholder="예: https://nvd.nist.gov/vuln/detail/CVE-..."
          />

          <DynamicArrayField
            label="태그"
            values={formData.tags}
            onChange={(v) => updateField('tags', v)}
            placeholder="예: firewall, bypass, critical"
          />
        </div>

        {/* 신뢰도 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">신뢰도 메타데이터</h2>
          <TrustMetadataEditor
            value={formData.trustMetadata}
            onChange={(v) => updateField('trustMetadata', v)}
          />
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href={`/admin/knowledge/vulnerabilities/${id}`}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </KnowledgePageLayout>
  );
}
