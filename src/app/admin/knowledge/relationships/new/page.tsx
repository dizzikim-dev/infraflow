'use client';

/**
 * 새 관계 생성 페이지
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormData {
  knowledgeId: string;
  sourceComponent: string;
  targetComponent: string;
  relationshipType: string;
  strength: string;
  direction: string;
  reason: string;
  reasonKo: string;
  tags: string[];
  confidence: number;
}

export default function NewRelationshipPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState<FormData>({
    knowledgeId: '',
    sourceComponent: '',
    targetComponent: '',
    relationshipType: 'requires',
    strength: 'strong',
    direction: 'downstream',
    reason: '',
    reasonKo: '',
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

      const response = await fetch('/api/knowledge/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '생성에 실패했습니다');
      }

      router.push('/admin/knowledge/relationships');
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
          <Link href="/admin/knowledge/relationships" className="hover:text-blue-600">관계 관리</Link>
          <span>/</span>
          <span>새 관계 추가</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">새 관계 추가</h1>
        <p className="mt-1 text-sm text-gray-500">인프라 컴포넌트 간 새로운 관계를 생성합니다</p>
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
                Knowledge ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="knowledgeId"
                value={formData.knowledgeId}
                onChange={handleChange}
                required
                placeholder="REL-XXX-001"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                소스 컴포넌트 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sourceComponent"
                value={formData.sourceComponent}
                onChange={handleChange}
                required
                placeholder="firewall"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                타겟 컴포넌트 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="targetComponent"
                value={formData.targetComponent}
                onChange={handleChange}
                required
                placeholder="web-server"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">관계 유형</label>
              <select
                name="relationshipType"
                value={formData.relationshipType}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="requires">requires (필수)</option>
                <option value="recommends">recommends (권장)</option>
                <option value="conflicts">conflicts (충돌)</option>
                <option value="enhances">enhances (강화)</option>
                <option value="protects">protects (보호)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">강도</label>
              <select
                name="strength"
                value={formData.strength}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="mandatory">mandatory (필수)</option>
                <option value="strong">strong (강함)</option>
                <option value="weak">weak (약함)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">방향</label>
              <select
                name="direction"
                value={formData.direction}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="upstream">upstream</option>
                <option value="downstream">downstream</option>
                <option value="bidirectional">bidirectional</option>
              </select>
            </div>
          </div>
        </div>

        {/* 사유 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">사유</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason (EN)</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows={3}
                placeholder="Reason for this relationship..."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">사유 (KO)</label>
              <textarea
                name="reasonKo"
                value={formData.reasonKo}
                onChange={handleChange}
                rows={3}
                placeholder="이 관계의 사유..."
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
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-900"
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
            href="/admin/knowledge/relationships"
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
    </div>
  );
}
