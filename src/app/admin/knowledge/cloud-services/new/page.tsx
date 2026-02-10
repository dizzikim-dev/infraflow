'use client';

/**
 * 새 클라우드 서비스 생성 페이지
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewCloudServicePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [serviceId, setServiceId] = useState('');
  const [provider, setProvider] = useState('aws');
  const [componentType, setComponentType] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [serviceNameKo, setServiceNameKo] = useState('');
  const [status, setStatus] = useState('active');
  const [successor, setSuccessor] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [featuresKo, setFeaturesKo] = useState<string[]>([]);
  const [pricingTier, setPricingTier] = useState('medium');
  const [confidence, setConfidence] = useState(0.7);

  const [featureInput, setFeatureInput] = useState('');
  const [featureKoInput, setFeatureKoInput] = useState('');

  const addFeature = () => {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const addFeatureKo = () => {
    if (featureKoInput.trim()) {
      setFeaturesKo([...featuresKo, featureKoInput.trim()]);
      setFeatureKoInput('');
    }
  };

  const removeFeatureKo = (index: number) => {
    setFeaturesKo(featuresKo.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const body = {
        serviceId,
        provider,
        componentType,
        serviceName,
        serviceNameKo,
        status,
        successor: successor || undefined,
        features,
        featuresKo,
        pricingTier,
        trustMetadata: {
          confidence,
          source: { type: 'admin', title: 'Admin Dashboard' },
        },
      };

      const response = await fetch('/api/knowledge/cloud-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '저장에 실패했습니다');
      }

      router.push('/admin/knowledge/cloud-services');
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">새 클라우드 서비스 추가</h1>
        <p className="mt-1 text-sm text-gray-500">
          새로운 클라우드 서비스를 카탈로그에 추가합니다
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
              <label className="block text-sm font-medium text-gray-700 mb-1">서비스 ID</label>
              <input
                type="text"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                required
                placeholder="aws-ec2"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">프로바이더</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="aws">AWS</option>
                <option value="azure">Azure</option>
                <option value="gcp">GCP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">컴포넌트 타입</label>
              <input
                type="text"
                value={componentType}
                onChange={(e) => setComponentType(e.target.value)}
                required
                placeholder="web-server"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">서비스명 (영문)</label>
              <input
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                required
                placeholder="Amazon EC2"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">서비스명 (한국어)</label>
              <input
                type="text"
                value={serviceNameKo}
                onChange={(e) => setServiceNameKo(e.target.value)}
                required
                placeholder="아마존 EC2"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="active">활성 (Active)</option>
                <option value="deprecated">지원종료 (Deprecated)</option>
                <option value="preview">미리보기 (Preview)</option>
                <option value="end_of_life">EOL (End of Life)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">후속 서비스 (선택)</label>
              <input
                type="text"
                value={successor}
                onChange={(e) => setSuccessor(e.target.value)}
                placeholder="후속 서비스 ID"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">가격 티어</label>
              <select
                value={pricingTier}
                onChange={(e) => setPricingTier(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="free">Free</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
        </div>

        {/* 기능 (영문) */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">기능 (영문)</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
              placeholder="기능 입력 후 추가"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
            <button
              type="button"
              onClick={addFeature}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              추가
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {features.map((f, i) => (
              <span key={i} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {f}
                <button type="button" onClick={() => removeFeature(i)} className="ml-2 text-blue-600 hover:text-blue-900">
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 기능 (한국어) */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">기능 (한국어)</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={featureKoInput}
              onChange={(e) => setFeatureKoInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeatureKo(); } }}
              placeholder="기능 입력 후 추가"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
            <button
              type="button"
              onClick={addFeatureKo}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              추가
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {featuresKo.map((f, i) => (
              <span key={i} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {f}
                <button type="button" onClick={() => removeFeatureKo(i)} className="ml-2 text-blue-600 hover:text-blue-900">
                  &times;
                </button>
              </span>
            ))}
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
