'use client';

import { KnowledgeFormPage, type FormConfig } from '@/components/admin/knowledge';

const config: FormConfig = {
  resourceName: 'vulnerabilities',
  resourceNameKo: '취약점',
  pageTitle: '새 취약점 추가',
  pageTitleEdit: '취약점 수정',
  buttonColor: 'bg-rose-600 hover:bg-rose-700',
  mode: 'edit',
  sections: [
    { title: '기본 정보', fields: ['vulnId', 'cveId', 'title', 'titleKo', 'description', 'descriptionKo'] },
    { title: '심각도', fields: ['severity', 'cvssScore', 'publishedDate'] },
    { title: '영향 및 대응', fields: ['affectedComponents', 'mitigation', 'mitigationKo'] },
    { title: '참조 및 태그', fields: ['references', 'tags'] },
    { title: '신뢰도 메타데이터', fields: ['trustMetadata'] },
  ],
  fields: [
    { key: 'vulnId', label: 'Vuln ID', type: 'text', required: true },
    { key: 'cveId', label: 'CVE ID (선택)', type: 'text', placeholder: '예: CVE-2024-12345', transformForSubmit: (v) => v || undefined },
    { key: 'title', label: '제목 (영문)', type: 'text', required: true },
    { key: 'titleKo', label: '제목 (한국어)', type: 'text', required: true },
    { key: 'description', label: '설명 (영문)', type: 'textarea' },
    { key: 'descriptionKo', label: '설명 (한국어)', type: 'textarea' },
    { key: 'severity', label: '심각도 (Severity)', type: 'select', required: true, options: [
      { value: 'critical', label: 'Critical' },
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
    ]},
    { key: 'cvssScore', label: 'CVSS 점수 (0-10, 선택)', type: 'number', min: 0, max: 10, step: 0.1, transformForSubmit: (v) => v ? parseFloat(String(v)) : undefined },
    { key: 'publishedDate', label: '발행일', type: 'date', transformForSubmit: (v) => v || undefined },
    { key: 'affectedComponents', label: '영향받는 컴포넌트', type: 'array', placeholder: '예: firewall' },
    { key: 'mitigation', label: '완화 방안 (영문)', type: 'textarea' },
    { key: 'mitigationKo', label: '완화 방안 (한국어)', type: 'textarea' },
    { key: 'references', label: '참조 URL', type: 'array', placeholder: '예: https://nvd.nist.gov/vuln/detail/CVE-...' },
    { key: 'tags', label: '태그', type: 'array', placeholder: '예: firewall, bypass, critical' },
    { key: 'trustMetadata', label: '신뢰도 메타데이터', type: 'trust-metadata' },
  ],
};

export default function EditVulnerabilityPage() {
  return <KnowledgeFormPage config={config} />;
}
