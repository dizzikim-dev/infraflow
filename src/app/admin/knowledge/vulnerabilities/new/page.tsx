'use client';

/**
 * 새 취약점 생성 페이지
 *
 * 인프라 취약점 생성 폼
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function NewVulnerabilityPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    publishedDate: new Date().toISOString().split('T')[0],
    references: [],
    tags: [],
    trustMetadata: defaultTrustMetadata,
  });

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

      const response = await fetch('/api/knowledge/vulnerabilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '생성에 실패했습니다');
      }

      router.push('/admin/knowledge/vulnerabilities');
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses =
    'w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none';

  return (
    <KnowledgePageLayout
      title="새 취약점 추가"
      description="인프라 취약점을 새로 생성합니다"
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
                placeholder="예: VULN-FW-001"
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
                placeholder="Firewall Rule Bypass"
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
                placeholder="방화벽 규칙 우회"
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
                placeholder="Description in English"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">설명 (한국어)</label>
              <textarea
                value={formData.descriptionKo}
                onChange={(e) => updateField('descriptionKo', e.target.value)}
                rows={4}
                className={inputClasses}
                placeholder="한국어 설명"
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
                placeholder="Mitigation steps..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">완화 방안 (한국어)</label>
              <textarea
                value={formData.mitigationKo}
                onChange={(e) => updateField('mitigationKo', e.target.value)}
                rows={4}
                className={inputClasses}
                placeholder="완화 방안 상세..."
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
            href="/admin/knowledge/vulnerabilities"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </KnowledgePageLayout>
  );
}
