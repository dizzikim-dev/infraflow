'use client';

/**
 * 벤치마크 수정 페이지
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EditBenchmarkPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [componentType, setComponentType] = useState('');
  const [trafficTier, setTrafficTier] = useState('small');
  const [recommendedInstanceCount, setRecommendedInstanceCount] = useState(1);
  const [recommendedSpec, setRecommendedSpec] = useState('');
  const [recommendedSpecKo, setRecommendedSpecKo] = useState('');
  const [minimumInstanceCount, setMinimumInstanceCount] = useState(1);
  const [minimumSpec, setMinimumSpec] = useState('');
  const [minimumSpecKo, setMinimumSpecKo] = useState('');
  const [scalingNotes, setScalingNotes] = useState('');
  const [scalingNotesKo, setScalingNotesKo] = useState('');
  const [estimatedMonthlyCost, setEstimatedMonthlyCost] = useState<string>('');
  const [maxRPS, setMaxRPS] = useState(0);
  const [confidence, setConfidence] = useState(0.7);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/knowledge/benchmarks/${id}`);
        if (!response.ok) throw new Error('데이터를 가져오는데 실패했습니다');
        const result = await response.json();
        const data = result.data || result;

        setComponentType(data.componentType || '');
        setTrafficTier(data.trafficTier || 'small');
        setRecommendedInstanceCount(data.recommendedInstanceCount ?? 1);
        setRecommendedSpec(data.recommendedSpec || '');
        setRecommendedSpecKo(data.recommendedSpecKo || '');
        setMinimumInstanceCount(data.minimumInstanceCount ?? 1);
        setMinimumSpec(data.minimumSpec || '');
        setMinimumSpecKo(data.minimumSpecKo || '');
        setScalingNotes(data.scalingNotes || '');
        setScalingNotesKo(data.scalingNotesKo || '');
        setEstimatedMonthlyCost(
          data.estimatedMonthlyCost !== undefined && data.estimatedMonthlyCost !== null
            ? String(data.estimatedMonthlyCost)
            : ''
        );
        setMaxRPS(data.maxRPS ?? 0);
        setConfidence(data.trustMetadata?.confidence ?? 0.7);
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const body = {
        componentType,
        trafficTier,
        recommendedInstanceCount,
        recommendedSpec,
        recommendedSpecKo,
        minimumInstanceCount,
        minimumSpec,
        minimumSpecKo,
        scalingNotes,
        scalingNotesKo,
        estimatedMonthlyCost: estimatedMonthlyCost ? parseFloat(estimatedMonthlyCost) : undefined,
        maxRPS,
        trustMetadata: {
          confidence,
          source: { type: 'admin', title: 'Admin Dashboard' },
        },
      };

      const response = await fetch(`/api/knowledge/benchmarks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '저장에 실패했습니다');
      }

      router.push(`/admin/knowledge/benchmarks/${id}`);
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
        <h1 className="text-2xl font-bold text-gray-900">벤치마크 수정</h1>
        <p className="mt-1 text-sm text-gray-500">
          {componentType} - {trafficTier}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">컴포넌트 타입</label>
              <input
                type="text"
                value={componentType}
                onChange={(e) => setComponentType(e.target.value)}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">트래픽 티어</label>
              <select
                value={trafficTier}
                onChange={(e) => setTrafficTier(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max RPS</label>
              <input
                type="number"
                value={maxRPS}
                onChange={(e) => setMaxRPS(parseInt(e.target.value) || 0)}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">월 예상 비용 ($, 선택)</label>
              <input
                type="number"
                value={estimatedMonthlyCost}
                onChange={(e) => setEstimatedMonthlyCost(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* 권장 사양 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">권장 사양</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">인스턴스 수</label>
              <input
                type="number"
                value={recommendedInstanceCount}
                onChange={(e) => setRecommendedInstanceCount(parseInt(e.target.value) || 1)}
                min={1}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">사양 (영문)</label>
              <input
                type="text"
                value={recommendedSpec}
                onChange={(e) => setRecommendedSpec(e.target.value)}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">사양 (한국어)</label>
              <input
                type="text"
                value={recommendedSpecKo}
                onChange={(e) => setRecommendedSpecKo(e.target.value)}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* 최소 사양 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">최소 사양</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">인스턴스 수</label>
              <input
                type="number"
                value={minimumInstanceCount}
                onChange={(e) => setMinimumInstanceCount(parseInt(e.target.value) || 1)}
                min={1}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">사양 (영문)</label>
              <input
                type="text"
                value={minimumSpec}
                onChange={(e) => setMinimumSpec(e.target.value)}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">사양 (한국어)</label>
              <input
                type="text"
                value={minimumSpecKo}
                onChange={(e) => setMinimumSpecKo(e.target.value)}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* 스케일링 노트 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">스케일링 노트</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">영문</label>
              <textarea
                value={scalingNotes}
                onChange={(e) => setScalingNotes(e.target.value)}
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">한국어</label>
              <textarea
                value={scalingNotesKo}
                onChange={(e) => setScalingNotesKo(e.target.value)}
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* 신뢰도 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">신뢰도 메타데이터</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              신뢰도: {(confidence * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={confidence}
              onChange={(e) => setConfidence(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
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
