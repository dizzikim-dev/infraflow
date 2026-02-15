'use client';

import { KnowledgeFormPage, type FormConfig } from '@/components/admin/knowledge';

const config: FormConfig = {
  resourceName: 'sources',
  resourceNameKo: '출처',
  pageTitle: '새 출처 추가',
  pageTitleEdit: '출처 수정',
  buttonColor: 'bg-gray-600 hover:bg-gray-700',
  mode: 'new',
  useLayout: false,
  sections: [
    { title: '출처 정보', fields: ['sourceId', 'sourceType', 'title', 'url', 'section', 'publishedDate', 'accessedDate'] },
  ],
  fields: [
    { key: 'sourceId', label: '출처 ID', type: 'text', required: true, placeholder: 'NIST-SP-800-53' },
    { key: 'sourceType', label: '유형', type: 'select', defaultValue: 'industry', options: [
      { value: 'rfc', label: 'RFC' },
      { value: 'nist', label: 'NIST' },
      { value: 'cis', label: 'CIS' },
      { value: 'owasp', label: 'OWASP' },
      { value: 'vendor', label: 'Vendor' },
      { value: 'industry', label: 'Industry' },
      { value: 'itu', label: 'ITU' },
      { value: '3gpp', label: '3GPP' },
      { value: 'user_verified', label: 'User Verified' },
      { value: 'admin', label: 'Admin' },
    ]},
    { key: 'title', label: '제목', type: 'text', required: true, placeholder: 'Security and Privacy Controls for Information Systems' },
    { key: 'url', label: 'URL (선택)', type: 'text', placeholder: 'https://...', transformForSubmit: (v) => v || undefined },
    { key: 'section', label: 'Section (선택)', type: 'text', placeholder: 'Chapter 3', transformForSubmit: (v) => v || undefined },
    { key: 'publishedDate', label: '발행일 (선택)', type: 'date', transformForSubmit: (v) => v || undefined },
    { key: 'accessedDate', label: '접근일', type: 'date', required: true },
  ],
};

export default function NewSourcePage() {
  return <KnowledgeFormPage config={config} />;
}
