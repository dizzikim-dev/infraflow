'use client';

/**
 * Knowledge 제네릭 폼 페이지
 *
 * 모든 Knowledge 엔티티의 생성/수정 폼 페이지 보일러플레이트를 캡슐화:
 * - 상태 관리 (useState for all fields)
 * - 폼 제출 (POST for new, PUT for edit)
 * - 데이터 fetch (edit mode)
 * - 로딩/에러 상태
 * - 섹션별 필드 렌더링
 * - DynamicArrayField, JsonFieldEditor, TrustMetadataEditor 통합
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createLogger } from '@/lib/utils/logger';
import KnowledgePageLayout from './KnowledgePageLayout';
import TrustMetadataEditor from './TrustMetadataEditor';
import JsonFieldEditor from './JsonFieldEditor';
import DynamicArrayField from '../DynamicArrayField';
import type { TrustMetadataInput } from './TrustMetadataEditor';

const log = createLogger('KnowledgeFormPage');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FormFieldConfig {
  /** field name in form data */
  key: string;
  /** Korean label */
  label: string;
  /** field type */
  type: 'text' | 'textarea' | 'select' | 'number' | 'date' | 'array' | 'json' | 'trust-metadata' | 'range' | 'simple-confidence';
  /** required field */
  required?: boolean;
  /** placeholder text */
  placeholder?: string;
  /** options for select */
  options?: { value: string; label: string }[];
  /** grid columns (1, 2, or full row for md:grid-cols-2) */
  gridCols?: 1 | 2 | 'full';
  /** default value */
  defaultValue?: unknown;
  /** transform value before submit (e.g., parseFloat for cvssScore) */
  transformForSubmit?: (value: unknown) => unknown;
  /** transform value from API (e.g., number to string, date to yyyy-mm-dd) */
  transformFromApi?: (value: unknown) => unknown;
  /** JSON schema type for JsonFieldEditor */
  jsonSchema?: string;
  /** range min/max/step */
  min?: number;
  max?: number;
  step?: number;
  /** textarea rows */
  rows?: number;
  /** for simple-confidence: trust source type (default 'user_verified') */
  trustSourceType?: string;
  /** for simple-confidence: trust source title (default 'Admin Dashboard') */
  trustSourceTitle?: string;
}

export interface FormSection {
  /** section title */
  title: string;
  /** field keys in this section */
  fields: string[];
}

export interface FormConfig {
  /** API resource path (e.g., 'vulnerabilities') */
  resourceName: string;
  /** Korean resource name */
  resourceNameKo: string;
  /** page title for new mode */
  pageTitle: string;
  /** page title for edit mode */
  pageTitleEdit: string;
  /** submit button color (tailwind bg class) */
  buttonColor: string;
  /** edit button color (tailwind bg class, defaults to bg-blue-600 hover:bg-blue-700) */
  buttonColorEdit?: string;
  /** mode: new or edit */
  mode: 'new' | 'edit';
  /** sections grouping fields */
  sections: FormSection[];
  /** all field definitions */
  fields: FormFieldConfig[];
  /** cancel link (defaults to /admin/knowledge/{resourceName}) */
  cancelLink?: string;
  /** success redirect (defaults to /admin/knowledge/{resourceName}) */
  successRedirect?: string;
  /** success redirect for edit (defaults to /admin/knowledge/{resourceName}/{id}) */
  successRedirectEdit?: string;
  /** use KnowledgePageLayout (default true) */
  useLayout?: boolean;
  /** page description (for layout) */
  pageDescription?: string;
  /** custom submit data transform (override default) */
  customTransform?: (formData: Record<string, unknown>) => Record<string, unknown>;
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function KnowledgeFormPage({ config }: { config: FormConfig }) {
  const params = useParams();
  const router = useRouter();
  const id = config.mode === 'edit' ? (params.id as string) : undefined;

  const [isLoading, setIsLoading] = useState(config.mode === 'edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalTitle, setOriginalTitle] = useState('');

  // Initialize form data from field defaults
  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    for (const field of config.fields) {
      if (field.defaultValue !== undefined) {
        initial[field.key] = field.defaultValue;
      } else if (field.type === 'array') {
        initial[field.key] = [];
      } else if (field.type === 'json') {
        initial[field.key] = [];
      } else if (field.type === 'trust-metadata') {
        initial[field.key] = defaultTrustMetadata;
      } else if (field.type === 'number' || field.type === 'range') {
        initial[field.key] = field.min ?? 0;
      } else if (field.type === 'date') {
        initial[field.key] = new Date().toISOString().split('T')[0];
      } else {
        initial[field.key] = '';
      }
    }
    return initial;
  });

  // Fetch data in edit mode
  useEffect(() => {
    if (config.mode === 'edit' && id) {
      async function fetchData() {
        try {
          const response = await fetch(`/api/knowledge/${config.resourceName}/${id}`);
          if (!response.ok) {
            throw new Error(`${config.resourceNameKo}을(를) 찾을 수 없습니다`);
          }
          const data = await response.json();

          // Store original title for page layout
          setOriginalTitle(data.nameKo || data.titleKo || data.name || data.title || '');

          // Transform API data to form data
          const transformed: Record<string, unknown> = {};
          for (const field of config.fields) {
            const apiValue = data[field.key];
            if (apiValue !== undefined && apiValue !== null) {
              if (field.transformFromApi) {
                transformed[field.key] = field.transformFromApi(apiValue);
              } else if (field.type === 'number' || field.type === 'range') {
                // Convert number to string for input fields
                transformed[field.key] = String(apiValue);
              } else if (field.type === 'date' && typeof apiValue === 'string') {
                // Extract yyyy-mm-dd from ISO datetime
                transformed[field.key] = apiValue.split('T')[0];
              } else {
                transformed[field.key] = apiValue;
              }
            } else {
              // Use default value
              transformed[field.key] = formData[field.key];
            }
          }
          setFormData(transformed);
        } catch (err) {
          log.error('Failed to fetch data:', err as Error);
          setError(err instanceof Error ? err.message : '오류가 발생했습니다');
        } finally {
          setIsLoading(false);
        }
      }

      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, config.mode]);

  const updateField = (key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let payload: Record<string, unknown>;

      if (config.customTransform) {
        payload = config.customTransform(formData);
      } else {
        // Default transform: apply field-specific transformations
        payload = { ...formData };
        for (const field of config.fields) {
          if (field.transformForSubmit) {
            payload[field.key] = field.transformForSubmit(formData[field.key]);
          }
        }

        // Auto-construct trustMetadata for simple-confidence fields
        const confidenceField = config.fields.find((f) => f.type === 'simple-confidence');
        if (confidenceField) {
          const today = new Date().toISOString().split('T')[0];
          payload.trustMetadata = {
            confidence: Number(formData[confidenceField.key] ?? 0.5),
            source: {
              type: confidenceField.trustSourceType || 'user_verified',
              title: confidenceField.trustSourceTitle || 'Admin Dashboard',
              accessedDate: today,
            },
            lastReviewedAt: today,
          };
          // Remove the confidence field from payload
          delete payload[confidenceField.key];
        }
      }

      const method = config.mode === 'new' ? 'POST' : 'PUT';
      const url =
        config.mode === 'new'
          ? `/api/knowledge/${config.resourceName}`
          : `/api/knowledge/${config.resourceName}/${id}`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || data.message || `${config.mode === 'new' ? '생성' : '수정'}에 실패했습니다`);
      }

      // Determine success redirect
      let redirectUrl: string;
      if (config.mode === 'new') {
        redirectUrl = config.successRedirect || `/admin/knowledge/${config.resourceName}`;
      } else {
        redirectUrl = config.successRedirectEdit || `/admin/knowledge/${config.resourceName}/${id}`;
      }

      router.push(redirectUrl);
    } catch (err) {
      log.error('Form submit failed:', err as Error);
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses =
    'w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none';

  // Loading state for edit mode
  if (isLoading && config.mode === 'edit') {
    const loadingSpinner = (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <svg className="animate-spin h-8 w-8 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="mt-4 text-gray-500">로딩 중...</p>
      </div>
    );

    return config.useLayout !== false ? (
      <KnowledgePageLayout title={config.pageTitleEdit} description={config.pageDescription || ''}>
        {loadingSpinner}
      </KnowledgePageLayout>
    ) : (
      loadingSpinner
    );
  }

  // Render field
  const renderField = (field: FormFieldConfig) => {
    const value = formData[field.key];

    const fieldElement = (() => {
      switch (field.type) {
        case 'text':
          return (
            <input
              type="text"
              value={String(value ?? '')}
              onChange={(e) => updateField(field.key, e.target.value)}
              className={inputClasses}
              placeholder={field.placeholder}
              required={field.required}
            />
          );

        case 'textarea':
          return (
            <textarea
              value={String(value ?? '')}
              onChange={(e) => updateField(field.key, e.target.value)}
              rows={field.rows ?? 4}
              className={inputClasses}
              placeholder={field.placeholder}
              required={field.required}
            />
          );

        case 'select':
          return (
            <select
              value={String(value ?? '')}
              onChange={(e) => updateField(field.key, e.target.value)}
              className={inputClasses}
              required={field.required}
            >
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          );

        case 'number':
          return (
            <input
              type="number"
              value={String(value ?? '')}
              onChange={(e) => updateField(field.key, e.target.value)}
              className={inputClasses}
              placeholder={field.placeholder}
              required={field.required}
              min={field.min}
              max={field.max}
              step={field.step}
            />
          );

        case 'date':
          return (
            <input
              type="date"
              value={String(value ?? '')}
              onChange={(e) => updateField(field.key, e.target.value)}
              className={inputClasses}
              required={field.required}
            />
          );

        case 'array':
          return (
            <DynamicArrayField
              label={field.label}
              values={value as string[]}
              onChange={(v) => updateField(field.key, v)}
              placeholder={field.placeholder}
            />
          );

        case 'json':
          return (
            <JsonFieldEditor
              label={field.label}
              value={value}
              onChange={(v) => updateField(field.key, v)}
              schema={field.jsonSchema as 'requiredComponents' | 'optionalComponents' | 'latencyRange' | 'throughputRange' | 'generic' || 'generic'}
            />
          );

        case 'trust-metadata':
          return (
            <TrustMetadataEditor
              value={value as TrustMetadataInput}
              onChange={(v) => updateField(field.key, v)}
            />
          );

        case 'range':
          return (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-700">
                  {typeof value === 'number' ? value.toFixed(2) : String(value ?? '')}
                </span>
              </div>
              <input
                type="range"
                value={Number(value ?? field.min ?? 0)}
                onChange={(e) => updateField(field.key, parseFloat(e.target.value))}
                min={field.min ?? 0}
                max={field.max ?? 1}
                step={field.step ?? 0.05}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{field.min ?? 0}</span>
                <span>{((field.max ?? 1) / 2).toFixed(1)}</span>
                <span>{field.max ?? 1}</span>
              </div>
            </div>
          );

        case 'simple-confidence':
          return (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}: {typeof value === 'number' ? value.toFixed(2) : String(value ?? '')}
                </label>
              </div>
              <input
                type="range"
                value={Number(value ?? 0.5)}
                onChange={(e) => updateField(field.key, parseFloat(e.target.value))}
                min={field.min ?? 0}
                max={field.max ?? 1}
                step={field.step ?? 0.05}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{field.min ?? 0}</span>
                <span>{((field.max ?? 1) / 2).toFixed(1)}</span>
                <span>{field.max ?? 1}</span>
              </div>
            </div>
          );

        default:
          return null;
      }
    })();

    // Don't wrap array/json/trust-metadata/range/simple-confidence in label (they have their own labels)
    if (['array', 'json', 'trust-metadata', 'range', 'simple-confidence'].includes(field.type)) {
      return fieldElement;
    }

    // Wrap in label + div
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        {fieldElement}
      </div>
    );
  };

  // Render section
  const renderSection = (section: FormSection) => {
    const sectionFields = config.fields.filter((f) => section.fields.includes(f.key));

    return (
      <div key={section.title} className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-medium text-gray-900">{section.title}</h2>

        {sectionFields.map((field) => {
          // Determine grid layout
          const isFullWidth = field.gridCols === 'full' || ['array', 'json', 'trust-metadata', 'range', 'simple-confidence'].includes(field.type);
          const gridColClass = isFullWidth ? 'md:col-span-2' : '';

          return (
            <div key={field.key} className={gridColClass}>
              {renderField(field)}
            </div>
          );
        })}
      </div>
    );
  };

  // Form content
  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {config.sections.map((section) => renderSection(section))}

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3">
        <Link
          href={
            config.cancelLink ||
            (config.mode === 'edit' ? `/admin/knowledge/${config.resourceName}/${id}` : `/admin/knowledge/${config.resourceName}`)
          }
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          취소
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            config.mode === 'edit' ? config.buttonColorEdit || 'bg-blue-600 hover:bg-blue-700' : config.buttonColor
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? '저장 중...' : '저장'}
        </button>
      </div>
    </form>
  );

  // Wrap in layout if enabled
  if (config.useLayout !== false) {
    return (
      <KnowledgePageLayout
        title={config.mode === 'new' ? config.pageTitle : config.pageTitleEdit}
        description={config.mode === 'new' ? config.pageDescription || `${config.resourceNameKo}을(를) 새로 생성합니다` : originalTitle}
      >
        {formContent}
      </KnowledgePageLayout>
    );
  }

  return formContent;
}
