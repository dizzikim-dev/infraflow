'use client';

/**
 * 패턴 수정 페이지
 *
 * 기존 패턴 데이터를 편집하는 폼
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  KnowledgePageLayout,
  TrustMetadataEditor,
  JsonFieldEditor,
} from '@/components/admin/knowledge';
import type { TrustMetadataInput } from '@/components/admin/knowledge';
import DynamicArrayField from '@/components/admin/DynamicArrayField';

interface PatternFormData {
  patternId: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  scalability: string;
  complexity: number;
  requiredComponents: { type: string; minCount: number }[];
  optionalComponents: { type: string; benefit: string; benefitKo: string }[];
  bestForKo: string[];
  notSuitableForKo: string[];
  evolvesTo: string[];
  evolvesFrom: string[];
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

export default function EditPatternPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalNameKo, setOriginalNameKo] = useState('');

  const [formData, setFormData] = useState<PatternFormData>({
    patternId: '',
    name: '',
    nameKo: '',
    description: '',
    descriptionKo: '',
    scalability: 'medium',
    complexity: 3,
    requiredComponents: [],
    optionalComponents: [],
    bestForKo: [],
    notSuitableForKo: [],
    evolvesTo: [],
    evolvesFrom: [],
    tags: [],
    trustMetadata: defaultTrustMetadata,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/knowledge/patterns/${id}`);
        if (!response.ok) {
          throw new Error('패턴을 찾을 수 없습니다');
        }
        const data = await response.json();
        setOriginalNameKo(data.nameKo);
        setFormData({
          patternId: data.patternId || '',
          name: data.name || '',
          nameKo: data.nameKo || '',
          description: data.description || '',
          descriptionKo: data.descriptionKo || '',
          scalability: data.scalability || 'medium',
          complexity: data.complexity || 3,
          requiredComponents: data.requiredComponents || [],
          optionalComponents: data.optionalComponents || [],
          bestForKo: data.bestForKo || [],
          notSuitableForKo: data.notSuitableForKo || [],
          evolvesTo: data.evolvesTo || [],
          evolvesFrom: data.evolvesFrom || [],
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

  const updateField = <K extends keyof PatternFormData>(key: K, value: PatternFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/knowledge/patterns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '수정에 실패했습니다');
      }

      router.push(`/admin/knowledge/patterns/${id}`);
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
      title="패턴 수정"
      description={originalNameKo}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pattern ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.patternId}
              onChange={(e) => updateField('patternId', e.target.value)}
              className={inputClasses}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름 (영문) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className={inputClasses}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름 (한국어) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nameKo}
                onChange={(e) => updateField('nameKo', e.target.value)}
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
                rows={3}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">설명 (한국어)</label>
              <textarea
                value={formData.descriptionKo}
                onChange={(e) => updateField('descriptionKo', e.target.value)}
                rows={3}
                className={inputClasses}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">확장성 (Scalability)</label>
              <select
                value={formData.scalability}
                onChange={(e) => updateField('scalability', e.target.value)}
                className={inputClasses}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">복잡도 (1-5)</label>
              <input
                type="number"
                value={formData.complexity}
                onChange={(e) =>
                  updateField('complexity', Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))
                }
                min={1}
                max={5}
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        {/* 구성요소 */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">구성요소</h2>

          <JsonFieldEditor
            label="필수 구성요소 (Required Components)"
            value={formData.requiredComponents}
            onChange={(v) => updateField('requiredComponents', v as { type: string; minCount: number }[])}
            schema="requiredComponents"
          />

          <JsonFieldEditor
            label="선택 구성요소 (Optional Components)"
            value={formData.optionalComponents}
            onChange={(v) =>
              updateField('optionalComponents', v as { type: string; benefit: string; benefitKo: string }[])
            }
            schema="optionalComponents"
          />
        </div>

        {/* 적합성 정보 */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">적합성 정보</h2>

          <DynamicArrayField
            label="적합한 환경 (bestForKo)"
            values={formData.bestForKo}
            onChange={(v) => updateField('bestForKo', v)}
            placeholder="예: 중소규모 웹 서비스"
          />

          <DynamicArrayField
            label="부적합한 환경 (notSuitableForKo)"
            values={formData.notSuitableForKo}
            onChange={(v) => updateField('notSuitableForKo', v)}
            placeholder="예: 대규모 마이크로서비스"
          />
        </div>

        {/* 진화 경로 */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">진화 경로</h2>

          <DynamicArrayField
            label="진화 대상 (Evolves To)"
            values={formData.evolvesTo}
            onChange={(v) => updateField('evolvesTo', v)}
            placeholder="예: PAT-MSA-001"
          />

          <DynamicArrayField
            label="진화 원본 (Evolves From)"
            values={formData.evolvesFrom}
            onChange={(v) => updateField('evolvesFrom', v)}
            placeholder="예: PAT-MONO-001"
          />
        </div>

        {/* 태그 */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">태그</h2>

          <DynamicArrayField
            label="태그"
            values={formData.tags}
            onChange={(v) => updateField('tags', v)}
            placeholder="예: web, 3-tier, traditional"
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
            href={`/admin/knowledge/patterns/${id}`}
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
