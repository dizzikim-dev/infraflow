'use client';

/**
 * 새 안티패턴 생성 페이지
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormData {
  antiPatternId: string;
  name: string;
  nameKo: string;
  severity: string;
  detectionRuleId: string;
  detectionDescriptionKo: string;
  problemKo: string;
  impactKo: string;
  solutionKo: string;
  tags: string[];
  confidence: number;
}

export default function NewAntiPatternPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState<FormData>({
    antiPatternId: '',
    name: '',
    nameKo: '',
    severity: 'medium',
    detectionRuleId: '',
    detectionDescriptionKo: '',
    problemKo: '',
    impactKo: '',
    solutionKo: '',
    tags: [],
    confidence: 0.5,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfidenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, confidence: parseFloat(e.target.value) }));
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
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

      const response = await fetch('/api/knowledge/antipatterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '생성에 실패했습니다');
      }

      router.push('/admin/knowledge/antipatterns');
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
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/admin/knowledge/antipatterns" className="hover:text-blue-600">안티패턴 관리</Link>
          <span>/</span>
          <span>새 안티패턴 추가</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">새 안티패턴 추가</h1>
        <p className="mt-1 text-sm text-gray-500">새로운 인프라 안티패턴을 생성합니다</p>
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
                AntiPattern ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="antiPatternId"
                value={formData.antiPatternId}
                onChange={handleChange}
                required
                placeholder="AP-XXX-001"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                심각도
              </label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="critical">심각 (critical)</option>
                <option value="high">높음 (high)</option>
                <option value="medium">중간 (medium)</option>
                <option value="low">낮음 (low)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name (EN) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Single Point of Failure"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름 (KO) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nameKo"
                value={formData.nameKo}
                onChange={handleChange}
                required
                placeholder="단일 장애점"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                탐지 규칙 ID
              </label>
              <input
                type="text"
                name="detectionRuleId"
                value={formData.detectionRuleId}
                onChange={handleChange}
                placeholder="DET-XXX-001"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* 상세 설명 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">상세 설명</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">탐지 설명 (KO)</label>
              <textarea
                name="detectionDescriptionKo"
                value={formData.detectionDescriptionKo}
                onChange={handleChange}
                rows={3}
                placeholder="이 안티패턴이 어떻게 탐지되는지 설명..."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">문제점 (KO)</label>
              <textarea
                name="problemKo"
                value={formData.problemKo}
                onChange={handleChange}
                rows={3}
                placeholder="이 안티패턴의 문제점..."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">영향 (KO)</label>
              <textarea
                name="impactKo"
                value={formData.impactKo}
                onChange={handleChange}
                rows={3}
                placeholder="이 안티패턴이 미치는 영향..."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">해결방안 (KO)</label>
              <textarea
                name="solutionKo"
                value={formData.solutionKo}
                onChange={handleChange}
                rows={3}
                placeholder="이 안티패턴의 해결방안..."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
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
              onKeyDown={handleTagKeyDown}
              placeholder="태그 입력 후 Enter 또는 추가 버튼"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
            >
              추가
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-red-600 hover:text-red-900"
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
            href="/admin/knowledge/antipatterns"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
