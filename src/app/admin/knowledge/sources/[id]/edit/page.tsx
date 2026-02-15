'use client';

import { KnowledgeFormPage, type FormConfig } from '@/components/admin/knowledge';

const config: FormConfig = {
  resourceName: 'sources',
  resourceNameKo: '출처',
  pageTitle: '새 출처 추가',
  pageTitleEdit: '출처 수정',
  buttonColor: 'bg-gray-600 hover:bg-gray-700',
  mode: 'edit',
  useLayout: false,
  sections: [
    { title: '출처 정보', fields: ['sourceId', 'sourceType', 'title', 'url', 'section', 'publishedDate', 'accessedDate'] },
  ],
  fields: [
    { key: 'sourceId', label: '출처 ID', type: 'text', required: true },
    { key: 'sourceType', label: '유형', type: 'select', options: [
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
    { key: 'title', label: '제목', type: 'text', required: true },
    { key: 'url', label: 'URL (선택)', type: 'text', transformForSubmit: (v) => v || undefined },
    { key: 'section', label: 'Section (선택)', type: 'text', transformForSubmit: (v) => v || undefined },
    { key: 'publishedDate', label: '발행일 (선택)', type: 'date', transformForSubmit: (v) => v || undefined },
    { key: 'accessedDate', label: '접근일', type: 'date', required: true },
  ],
};

export default function EditSourcePage() {
  return <KnowledgeFormPage config={config} />;
}
