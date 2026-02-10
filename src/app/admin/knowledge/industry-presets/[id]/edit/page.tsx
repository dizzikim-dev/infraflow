'use client';

/**
 * 산업별 프리셋 수정 페이지
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EditIndustryPresetPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [industryType, setIndustryType] = useState('general');
  const [name, setName] = useState('');
  const [nameKo, setNameKo] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionKo, setDescriptionKo] = useState('');
  const [minimumSecurityLevel, setMinimumSecurityLevel] = useState('standard');
  const [requiredFrameworks, setRequiredFrameworks] = useState<string[]>([]);
  const [requiredComponents, setRequiredComponents] = useState<string[]>([]);
  const [recommendedComponents, setRecommendedComponents] = useState<string[]>([]);

  const [frameworkInput, setFrameworkInput] = useState('');
  const [reqCompInput, setReqCompInput] = useState('');
  const [recCompInput, setRecCompInput] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/knowledge/industry-presets/${id}`);
        if (!response.ok) throw new Error('데이터를 가져오는데 실패했습니다');
        const result = await response.json();
        const data = result.data || result;

        setIndustryType(data.industryType || 'general');
        setName(data.name || '');
        setNameKo(data.nameKo || '');
        setDescription(data.description || '');
        setDescriptionKo(data.descriptionKo || '');
        setMinimumSecurityLevel(data.minimumSecurityLevel || 'standard');
        setRequiredFrameworks(data.requiredFrameworks || []);
        setRequiredComponents(data.requiredComponents || []);
        setRecommendedComponents(data.recommendedComponents || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const addFramework = () => {
    if (frameworkInput.trim()) {
      setRequiredFrameworks([...requiredFrameworks, frameworkInput.trim()]);
      setFrameworkInput('');
    }
  };

  const removeFramework = (index: number) => {
    setRequiredFrameworks(requiredFrameworks.filter((_, i) => i !== index));
  };

  const addReqComp = () => {
    if (reqCompInput.trim()) {
      setRequiredComponents([...requiredComponents, reqCompInput.trim()]);
      setReqCompInput('');
    }
  };

  const removeReqComp = (index: number) => {
    setRequiredComponents(requiredComponents.filter((_, i) => i !== index));
  };

  const addRecComp = () => {
    if (recCompInput.trim()) {
      setRecommendedComponents([...recommendedComponents, recCompInput.trim()]);
      setRecCompInput('');
    }
  };

  const removeRecComp = (index: number) => {
    setRecommendedComponents(recommendedComponents.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const body = {
        industryType,
        name,
        nameKo,
        description,
        descriptionKo,
        minimumSecurityLevel,
        requiredFrameworks,
        requiredComponents,
        recommendedComponents,
      };

      const response = await fetch(`/api/knowledge/industry-presets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '저장에 실패했습니다');
      }

      router.push(`/admin/knowledge/industry-presets/${id}`);
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
        <h1 className="text-2xl font-bold text-gray-900">산업별 프리셋 수정</h1>
        <p className="mt-1 text-sm text-gray-500">
          {nameKo} ({name})
        </p>
      </div>

      {/* 에러 표시 */}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">산업 유형</label>
              <select
                value={industryType}
                onChange={(e) => setIndustryType(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="financial">금융 (Financial)</option>
                <option value="healthcare">의료 (Healthcare)</option>
                <option value="government">공공 (Government)</option>
                <option value="ecommerce">이커머스 (E-commerce)</option>
                <option value="general">일반 (General)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">최소 보안 수준</label>
              <select
                value={minimumSecurityLevel}
                onChange={(e) => setMinimumSecurityLevel(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="enhanced">Enhanced</option>
                <option value="maximum">Maximum</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름 (영문)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름 (한국어)</label>
              <input
                type="text"
                value={nameKo}
                onChange={(e) => setNameKo(e.target.value)}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* 설명 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">설명</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">영문</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">한국어</label>
              <textarea
                value={descriptionKo}
                onChange={(e) => setDescriptionKo(e.target.value)}
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* 필수 프레임워크 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">필수 프레임워크</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={frameworkInput}
              onChange={(e) => setFrameworkInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFramework(); } }}
              placeholder="프레임워크명 입력 후 추가"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
            <button
              type="button"
              onClick={addFramework}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              추가
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {requiredFrameworks.map((f, i) => (
              <span key={i} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {f}
                <button type="button" onClick={() => removeFramework(i)} className="ml-2 text-blue-600 hover:text-blue-900">
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 필수 컴포넌트 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">필수 컴포넌트</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={reqCompInput}
              onChange={(e) => setReqCompInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addReqComp(); } }}
              placeholder="컴포넌트 타입 입력 후 추가"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
            <button
              type="button"
              onClick={addReqComp}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              추가
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {requiredComponents.map((c, i) => (
              <span key={i} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {c}
                <button type="button" onClick={() => removeReqComp(i)} className="ml-2 text-blue-600 hover:text-blue-900">
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 권장 컴포넌트 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">권장 컴포넌트</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={recCompInput}
              onChange={(e) => setRecCompInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRecComp(); } }}
              placeholder="컴포넌트 타입 입력 후 추가"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
            <button
              type="button"
              onClick={addRecComp}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              추가
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendedComponents.map((c, i) => (
              <span key={i} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {c}
                <button type="button" onClick={() => removeRecComp(i)} className="ml-2 text-blue-600 hover:text-blue-900">
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
