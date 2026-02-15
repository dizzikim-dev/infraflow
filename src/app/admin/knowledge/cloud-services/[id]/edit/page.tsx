'use client';

import { KnowledgeFormPage, type FormConfig } from '@/components/admin/knowledge';

const config: FormConfig = {
  resourceName: 'cloud-services',
  resourceNameKo: '클라우드 서비스',
  pageTitle: '새 클라우드 서비스 추가',
  pageTitleEdit: '클라우드 서비스 수정',
  buttonColor: 'bg-blue-600 hover:bg-blue-700',
  mode: 'edit',
  useLayout: false,
  sections: [
    { title: '기본 정보', fields: ['serviceId', 'provider', 'componentType', 'serviceName', 'serviceNameKo', 'status', 'successor'] },
    { title: '기능', fields: ['features', 'featuresKo'] },
    { title: '가격 정보', fields: ['pricingTier'] },
    { title: '신뢰도', fields: ['confidence'] },
  ],
  fields: [
    { key: 'serviceId', label: '서비스 ID', type: 'text', required: true },
    { key: 'provider', label: 'Provider', type: 'select', options: [
      { value: 'aws', label: 'AWS' },
      { value: 'azure', label: 'Azure' },
      { value: 'gcp', label: 'GCP' },
    ]},
    { key: 'componentType', label: 'Component Type', type: 'text', required: true },
    { key: 'serviceName', label: 'Service Name (영문)', type: 'text', required: true },
    { key: 'serviceNameKo', label: 'Service Name (한국어)', type: 'text', required: true },
    { key: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'deprecated', label: 'Deprecated' },
      { value: 'preview', label: 'Preview' },
    ]},
    { key: 'successor', label: 'Successor (선택)', type: 'text', transformForSubmit: (v) => v || undefined },
    { key: 'features', label: 'Features (영문)', type: 'array' },
    { key: 'featuresKo', label: 'Features (한국어)', type: 'array' },
    { key: 'pricingTier', label: 'Pricing Tier', type: 'select', options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'enterprise', label: 'Enterprise' },
    ]},
    { key: 'confidence', label: '신뢰도', type: 'simple-confidence', min: 0, max: 1, step: 0.05, trustSourceType: 'admin' },
  ],
};

export default function EditCloudServicePage() {
  return <KnowledgeFormPage config={config} />;
}
