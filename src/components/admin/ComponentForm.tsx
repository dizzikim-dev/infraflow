'use client';

/**
 * 컴포넌트 생성/수정 폼
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DynamicArrayField from './DynamicArrayField';

interface Policy {
  id?: string;
  name: string;
  nameKo: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'access' | 'security' | 'monitoring' | 'compliance' | 'performance';
}

interface ComponentData {
  id?: string;
  componentId: string;
  name: string;
  nameKo: string;
  category: string;
  tier: string;
  description: string;
  descriptionKo: string;
  functions: string[];
  functionsKo: string[];
  features: string[];
  featuresKo: string[];
  ports: string[];
  protocols: string[];
  vendors: string[];
  policies?: Policy[];
}

interface ComponentFormProps {
  initialData?: ComponentData;
  mode: 'create' | 'edit';
}

const categoryOptions = [
  { value: 'security', label: '보안' },
  { value: 'network', label: '네트워크' },
  { value: 'compute', label: '컴퓨팅' },
  { value: 'cloud', label: '클라우드' },
  { value: 'storage', label: '스토리지' },
  { value: 'auth', label: '인증' },
  { value: 'external', label: '외부' },
];

const tierOptions = [
  { value: 'external', label: '외부 (External)' },
  { value: 'dmz', label: 'DMZ' },
  { value: 'internal', label: '내부 (Internal)' },
  { value: 'data', label: '데이터 (Data)' },
];

const emptyData: ComponentData = {
  componentId: '',
  name: '',
  nameKo: '',
  category: 'network',
  tier: 'internal',
  description: '',
  descriptionKo: '',
  functions: [],
  functionsKo: [],
  features: [],
  featuresKo: [],
  ports: [],
  protocols: [],
  vendors: [],
};

export default function ComponentForm({ initialData, mode }: ComponentFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ComponentData>(initialData || emptyData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 에러 클리어
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleArrayChange = (field: keyof ComponentData, values: string[]) => {
    setFormData((prev) => ({ ...prev, [field]: values }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.componentId.trim()) {
      newErrors.componentId = '컴포넌트 ID를 입력하세요';
    } else if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(formData.componentId)) {
      newErrors.componentId = 'kebab-case 형식으로 입력하세요 (예: load-balancer)';
    }

    if (!formData.name.trim()) {
      newErrors.name = '영문명을 입력하세요';
    }

    if (!formData.nameKo.trim()) {
      newErrors.nameKo = '한국어명을 입력하세요';
    }

    if (!formData.description.trim()) {
      newErrors.description = '영문 설명을 입력하세요';
    }

    if (!formData.descriptionKo.trim()) {
      newErrors.descriptionKo = '한국어 설명을 입력하세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const url = mode === 'create'
        ? '/api/components'
        : `/api/components/${formData.id}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          componentId: formData.componentId,
          name: formData.name,
          nameKo: formData.nameKo,
          category: formData.category,
          tier: formData.tier,
          description: formData.description,
          descriptionKo: formData.descriptionKo,
          functions: formData.functions,
          functionsKo: formData.functionsKo,
          features: formData.features,
          featuresKo: formData.featuresKo,
          ports: formData.ports,
          protocols: formData.protocols,
          vendors: formData.vendors,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '저장에 실패했습니다');
      }

      const result = await response.json();
      router.push(`/admin/components/${result.id}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : '저장에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 기본 정보 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">기본 정보</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 컴포넌트 ID */}
          <div>
            <label htmlFor="componentId" className="block text-sm font-medium text-gray-700">
              컴포넌트 ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="componentId"
              name="componentId"
              value={formData.componentId}
              onChange={handleChange}
              disabled={mode === 'edit'}
              placeholder="load-balancer"
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.componentId
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              } ${mode === 'edit' ? 'bg-gray-100' : ''}`}
            />
            {errors.componentId && (
              <p className="mt-1 text-sm text-red-600">{errors.componentId}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              kebab-case 형식 (예: load-balancer, web-server)
            </p>
          </div>

          {/* 카테고리 */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 영문명 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              영문명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Load Balancer"
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.name
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* 한국어명 */}
          <div>
            <label htmlFor="nameKo" className="block text-sm font-medium text-gray-700">
              한국어명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nameKo"
              name="nameKo"
              value={formData.nameKo}
              onChange={handleChange}
              placeholder="로드밸런서"
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.nameKo
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
            {errors.nameKo && <p className="mt-1 text-sm text-red-600">{errors.nameKo}</p>}
          </div>

          {/* 티어 */}
          <div className="md:col-span-2">
            <label htmlFor="tier" className="block text-sm font-medium text-gray-700">
              티어 <span className="text-red-500">*</span>
            </label>
            <select
              id="tier"
              name="tier"
              value={formData.tier}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {tierOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 설명 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">설명</h2>

        <div className="space-y-6">
          {/* 영문 설명 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              영문 설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Distributes network traffic across multiple servers..."
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.description
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* 한국어 설명 */}
          <div>
            <label htmlFor="descriptionKo" className="block text-sm font-medium text-gray-700">
              한국어 설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="descriptionKo"
              name="descriptionKo"
              rows={3}
              value={formData.descriptionKo}
              onChange={handleChange}
              placeholder="네트워크 트래픽을 여러 서버에 분산하여..."
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.descriptionKo
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
            {errors.descriptionKo && (
              <p className="mt-1 text-sm text-red-600">{errors.descriptionKo}</p>
            )}
          </div>
        </div>
      </div>

      {/* 기능 및 특징 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">기능 및 특징</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DynamicArrayField
            label="기능 (영문)"
            values={formData.functions}
            onChange={(values) => handleArrayChange('functions', values)}
            placeholder="Traffic distribution..."
          />

          <DynamicArrayField
            label="기능 (한국어)"
            values={formData.functionsKo}
            onChange={(values) => handleArrayChange('functionsKo', values)}
            placeholder="트래픽 분산..."
          />

          <DynamicArrayField
            label="특징 (영문)"
            values={formData.features}
            onChange={(values) => handleArrayChange('features', values)}
            placeholder="L4/L7 load balancing..."
          />

          <DynamicArrayField
            label="특징 (한국어)"
            values={formData.featuresKo}
            onChange={(values) => handleArrayChange('featuresKo', values)}
            placeholder="L4/L7 로드밸런싱..."
          />
        </div>
      </div>

      {/* 기술 정보 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">기술 정보</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DynamicArrayField
            label="포트"
            values={formData.ports}
            onChange={(values) => handleArrayChange('ports', values)}
            placeholder="80, 443..."
          />

          <DynamicArrayField
            label="프로토콜"
            values={formData.protocols}
            onChange={(values) => handleArrayChange('protocols', values)}
            placeholder="HTTP, HTTPS..."
          />

          <DynamicArrayField
            label="벤더"
            values={formData.vendors}
            onChange={(values) => handleArrayChange('vendors', values)}
            placeholder="F5, HAProxy..."
          />
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? '저장 중...' : mode === 'create' ? '생성' : '저장'}
        </button>
      </div>
    </form>
  );
}
