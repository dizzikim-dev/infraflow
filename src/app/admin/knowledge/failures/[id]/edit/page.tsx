'use client';

/**
 * 장애 시나리오 수정 페이지
 */

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormData {
  failureId: string;
  component: string;
  titleKo: string;
  scenarioKo: string;
  impact: string;
  likelihood: string;
  affectedComponents: string[];
  preventionKo: string[];
  mitigationKo: string[];
  estimatedMTTR: string;
  tags: string[];
  confidence: number;
}

export default function EditFailurePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [affectedInput, setAffectedInput] = useState('');
  const [preventionInput, setPreventionInput] = useState('');
  const [mitigationInput, setMitigationInput] = useState('');
  const [formData, setFormData] = useState<FormData>({
    failureId: '',
    component: '',
    titleKo: '',
    scenarioKo: '',
    impact: 'degraded',
    likelihood: 'medium',
    affectedComponents: [],
    preventionKo: [],
    mitigationKo: [],
    estimatedMTTR: '',
    tags: [],
    confidence: 0.5,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/knowledge/failures/${id}`);
        if (!response.ok) throw new Error('데이터를 가져오는데 실패했습니다');
        const result = await response.json();
        const data = result.data || result;
        setFormData({
          failureId: data.failureId || '',
          component: data.component || '',
          titleKo: data.titleKo || '',
          scenarioKo: data.scenarioKo || '',
          impact: data.impact || 'degraded',
          likelihood: data.likelihood || 'medium',
          affectedComponents: data.affectedComponents || [],
          preventionKo: data.preventionKo || [],
          mitigationKo: data.mitigationKo || [],
          estimatedMTTR: data.estimatedMTTR || '',
          tags: data.tags || [],
          confidence: data.trustMetadata?.confidence ?? 0.5,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfidenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, confidence: parseFloat(e.target.value) }));
  };

  const addToArray = (field: keyof FormData, value: string, setter: (v: string) => void) => {
    const trimmed = value.trim();
    if (trimmed && !(formData[field] as string[]).includes(trimmed)) {
      setFormData((prev) => ({ ...prev, [field]: [...(prev[field] as string[]), trimmed] }));
      setter('');
    }
  };

  const removeFromArray = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((item) => item !== value),
    }));
  };

  const handleArrayKeyDown = (
    e: React.KeyboardEvent,
    field: keyof FormData,
    value: string,
    setter: (v: string) => void
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addToArray(field, value, setter);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const today = new Date().toISOString().split('T')[0];
      const payload = {
        ...formData,
        trustMetadata: {
          confidence: formData.confidence,
          source: {
            type: 'user_verified',
            title: 'Admin Dashboard',
            accessedDate: today,
          },
          lastReviewedAt: today,
        },
      };

      const response = await fetch(`/api/knowledge/failures/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '수정에 실패했습니다');
      }

      router.push(`/admin/knowledge/failures/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/admin/knowledge/failures" className="hover:text-blue-600">장애 시나리오 관리</Link>
          <span>/</span>
          <Link href={`/admin/knowledge/failures/${id}`} className="hover:text-blue-600">{formData.failureId}</Link>
          <span>/</span>
          <span>수정</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">장애 시나리오 수정</h1>
        <p className="mt-1 text-sm text-gray-500">{formData.titleKo}</p>
      </div>

      {/* 에러 */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">기본 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Failure ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="failureId"
                value={formData.failureId}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                컴포넌트 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="component"
                value={formData.component}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                제목 (KO) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="titleKo"
                value={formData.titleKo}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">영향</label>
              <select
                name="impact"
                value={formData.impact}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="service_down">서비스 중단 (service_down)</option>
                <option value="degraded">성능 저하 (degraded)</option>
                <option value="data_loss">데이터 손실 (data_loss)</option>
                <option value="security_breach">보안 침해 (security_breach)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">발생 가능성</label>
              <select
                name="likelihood"
                value={formData.likelihood}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="high">높음 (high)</option>
                <option value="medium">중간 (medium)</option>
                <option value="low">낮음 (low)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">예상 MTTR</label>
              <input
                type="text"
                name="estimatedMTTR"
                value={formData.estimatedMTTR}
                onChange={handleChange}
                placeholder="30분, 1시간, 4시간 등"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* 시나리오 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">시나리오</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">시나리오 설명 (KO)</label>
            <textarea
              name="scenarioKo"
              value={formData.scenarioKo}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* 영향받는 컴포넌트 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">영향받는 컴포넌트</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={affectedInput}
              onChange={(e) => setAffectedInput(e.target.value)}
              onKeyDown={(e) => handleArrayKeyDown(e, 'affectedComponents', affectedInput, setAffectedInput)}
              placeholder="컴포넌트 ID 입력 후 Enter 또는 추가 버튼"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
            <button
              type="button"
              onClick={() => addToArray('affectedComponents', affectedInput, setAffectedInput)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
            >
              추가
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.affectedComponents.map((comp) => (
              <span
                key={comp}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
              >
                {comp}
                <button
                  type="button"
                  onClick={() => removeFromArray('affectedComponents', comp)}
                  className="ml-2 text-orange-600 hover:text-orange-900"
                >
                  x
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 예방 조치 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">예방 조치 (KO)</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={preventionInput}
              onChange={(e) => setPreventionInput(e.target.value)}
              onKeyDown={(e) => handleArrayKeyDown(e, 'preventionKo', preventionInput, setPreventionInput)}
              placeholder="예방 조치 입력 후 Enter 또는 추가 버튼"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
            <button
              type="button"
              onClick={() => addToArray('preventionKo', preventionInput, setPreventionInput)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
            >
              추가
            </button>
          </div>
          <div className="space-y-2">
            {formData.preventionKo.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-3 py-2"
              >
                <span className="text-sm text-green-800">{item}</span>
                <button
                  type="button"
                  onClick={() => removeFromArray('preventionKo', item)}
                  className="text-green-600 hover:text-green-900 text-sm"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 완화 조치 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">완화 조치 (KO)</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={mitigationInput}
              onChange={(e) => setMitigationInput(e.target.value)}
              onKeyDown={(e) => handleArrayKeyDown(e, 'mitigationKo', mitigationInput, setMitigationInput)}
              placeholder="완화 조치 입력 후 Enter 또는 추가 버튼"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
            <button
              type="button"
              onClick={() => addToArray('mitigationKo', mitigationInput, setMitigationInput)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
            >
              추가
            </button>
          </div>
          <div className="space-y-2">
            {formData.mitigationKo.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md px-3 py-2"
              >
                <span className="text-sm text-blue-800">{item}</span>
                <button
                  type="button"
                  onClick={() => removeFromArray('mitigationKo', item)}
                  className="text-blue-600 hover:text-blue-900 text-sm"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 태그 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">태그</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => handleArrayKeyDown(e, 'tags', tagInput, setTagInput)}
              placeholder="태그 입력 후 Enter 또는 추가 버튼"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
            <button
              type="button"
              onClick={() => addToArray('tags', tagInput, setTagInput)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
            >
              추가
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeFromArray('tags', tag)}
                  className="ml-2 text-orange-600 hover:text-orange-900"
                >
                  x
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 신뢰도 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">신뢰 메타데이터</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              신뢰도: {formData.confidence.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={formData.confidence}
              onChange={handleConfidenceChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0.0</span>
              <span>0.5</span>
              <span>1.0</span>
            </div>
          </div>
        </div>

        {/* 액션 */}
        <div className="flex justify-end gap-3">
          <Link
            href={`/admin/knowledge/failures/${id}`}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
