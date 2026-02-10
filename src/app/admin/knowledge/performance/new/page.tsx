'use client';

/**
 * 새 성능 프로파일 생성 페이지
 *
 * 인프라 컴포넌트 성능 프로파일 생성 폼
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  KnowledgePageLayout,
  TrustMetadataEditor,
  JsonFieldEditor,
} from '@/components/admin/knowledge';
import type { TrustMetadataInput } from '@/components/admin/knowledge';
import DynamicArrayField from '@/components/admin/DynamicArrayField';

interface PerformanceFormData {
  performanceId: string;
  component: string;
  nameKo: string;
  latencyRange: { min: number; max: number; unit: 'ms' | 'us' };
  throughputRange: { typical: string; max: string };
  scalingStrategy: string;
  bottleneckIndicators: string[];
  bottleneckIndicatorsKo: string[];
  optimizationTipsKo: string[];
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

export default function NewPerformancePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<PerformanceFormData>({
    performanceId: '',
    component: '',
    nameKo: '',
    latencyRange: { min: 0, max: 0, unit: 'ms' },
    throughputRange: { typical: '', max: '' },
    scalingStrategy: 'horizontal',
    bottleneckIndicators: [],
    bottleneckIndicatorsKo: [],
    optimizationTipsKo: [],
    tags: [],
    trustMetadata: defaultTrustMetadata,
  });

  const updateField = <K extends keyof PerformanceFormData>(key: K, value: PerformanceFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/knowledge/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '생성에 실패했습니다');
      }

      router.push('/admin/knowledge/performance');
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
      title="새 성능 프로파일 추가"
      description="인프라 컴포넌트의 성능 프로파일을 새로 생성합니다"
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
              Performance ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.performanceId}
              onChange={(e) => updateField('performanceId', e.target.value)}
              className={inputClasses}
              placeholder="예: PERF-FW-001"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                컴포넌트 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.component}
                onChange={(e) => updateField('component', e.target.value)}
                className={inputClasses}
                placeholder="예: firewall"
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
                placeholder="예: 방화벽 성능 프로파일"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">스케일링 전략</label>
            <select
              value={formData.scalingStrategy}
              onChange={(e) => updateField('scalingStrategy', e.target.value)}
              className={inputClasses}
            >
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>

        {/* 성능 범위 */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">성능 범위</h2>

          <JsonFieldEditor
            label="지연시간 범위 (Latency Range)"
            value={formData.latencyRange}
            onChange={(v) => updateField('latencyRange', v as { min: number; max: number; unit: 'ms' | 'us' })}
            schema="latencyRange"
          />

          <JsonFieldEditor
            label="처리량 범위 (Throughput Range)"
            value={formData.throughputRange}
            onChange={(v) => updateField('throughputRange', v as { typical: string; max: string })}
            schema="throughputRange"
          />
        </div>

        {/* 병목 지표 */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">병목 지표</h2>

          <DynamicArrayField
            label="병목 지표 (영문)"
            values={formData.bottleneckIndicators}
            onChange={(v) => updateField('bottleneckIndicators', v)}
            placeholder="예: High CPU utilization"
          />

          <DynamicArrayField
            label="병목 지표 (한국어)"
            values={formData.bottleneckIndicatorsKo}
            onChange={(v) => updateField('bottleneckIndicatorsKo', v)}
            placeholder="예: 높은 CPU 사용률"
          />
        </div>

        {/* 최적화 팁 */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">최적화 팁</h2>

          <DynamicArrayField
            label="최적화 팁 (한국어)"
            values={formData.optimizationTipsKo}
            onChange={(v) => updateField('optimizationTipsKo', v)}
            placeholder="예: 연결 풀링 적용"
          />
        </div>

        {/* 태그 */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">태그</h2>

          <DynamicArrayField
            label="태그"
            values={formData.tags}
            onChange={(v) => updateField('tags', v)}
            placeholder="예: security, network"
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
            href="/admin/knowledge/performance"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </KnowledgePageLayout>
  );
}
