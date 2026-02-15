'use client';

import { KnowledgeFormPage, type FormConfig } from '@/components/admin/knowledge';

const config: FormConfig = {
  resourceName: 'industry-presets',
  resourceNameKo: '산업별 프리셋',
  pageTitle: '새 산업별 프리셋 추가',
  pageTitleEdit: '산업별 프리셋 수정',
  buttonColor: 'bg-indigo-600 hover:bg-indigo-700',
  mode: 'edit',
  useLayout: false,
  sections: [
    { title: '기본 정보', fields: ['industryType', 'name', 'nameKo', 'description', 'descriptionKo', 'minimumSecurityLevel'] },
    { title: '요구사항', fields: ['requiredFrameworks', 'requiredComponents', 'recommendedComponents'] },
  ],
  fields: [
    { key: 'industryType', label: 'Industry Type', type: 'select', options: [
      { value: 'financial', label: 'Financial' },
      { value: 'healthcare', label: 'Healthcare' },
      { value: 'government', label: 'Government' },
      { value: 'ecommerce', label: 'E-commerce' },
      { value: 'general', label: 'General' },
    ]},
    { key: 'name', label: 'Name (영문)', type: 'text', required: true },
    { key: 'nameKo', label: 'Name (한국어)', type: 'text', required: true },
    { key: 'description', label: 'Description (영문)', type: 'textarea', rows: 3 },
    { key: 'descriptionKo', label: 'Description (한국어)', type: 'textarea', rows: 3 },
    { key: 'minimumSecurityLevel', label: 'Minimum Security Level', type: 'select', options: [
      { value: 'basic', label: 'Basic' },
      { value: 'standard', label: 'Standard' },
      { value: 'high', label: 'High' },
      { value: 'critical', label: 'Critical' },
    ]},
    { key: 'requiredFrameworks', label: 'Required Frameworks', type: 'array', placeholder: 'PCI-DSS' },
    { key: 'requiredComponents', label: 'Required Components', type: 'array', placeholder: 'firewall' },
    { key: 'recommendedComponents', label: 'Recommended Components', type: 'array', placeholder: 'waf' },
  ],
};

export default function EditIndustryPresetPage() {
  return <KnowledgeFormPage config={config} />;
}
