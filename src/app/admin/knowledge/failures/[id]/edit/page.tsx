'use client';

import { KnowledgeFormPage, type FormConfig } from '@/components/admin/knowledge';

const config: FormConfig = {
  resourceName: 'failures',
  resourceNameKo: '장애 시나리오',
  pageTitle: '새 장애 시나리오 추가',
  pageTitleEdit: '장애 시나리오 수정',
  buttonColor: 'bg-orange-600 hover:bg-orange-700',
  mode: 'edit',
  useLayout: false,
  sections: [
    { title: '기본 정보', fields: ['failureId', 'component', 'titleKo', 'scenarioKo', 'impact', 'likelihood'] },
    { title: '영향 및 대응', fields: ['affectedComponents', 'preventionKo', 'mitigationKo', 'estimatedMTTR'] },
    { title: '태그', fields: ['tags'] },
    { title: '신뢰도', fields: ['confidence'] },
  ],
  fields: [
    { key: 'failureId', label: 'Failure ID', type: 'text', required: true },
    { key: 'component', label: 'Component', type: 'text', required: true },
    { key: 'titleKo', label: '제목 (한국어)', type: 'text', required: true },
    { key: 'scenarioKo', label: '시나리오 (한국어)', type: 'textarea', rows: 4 },
    { key: 'impact', label: '영향도', type: 'select', options: [
      { value: 'critical', label: 'critical (심각)' },
      { value: 'degraded', label: 'degraded (성능저하)' },
      { value: 'partial', label: 'partial (부분장애)' },
      { value: 'minor', label: 'minor (경미)' },
    ]},
    { key: 'likelihood', label: '발생 가능성', type: 'select', options: [
      { value: 'high', label: 'high (높음)' },
      { value: 'medium', label: 'medium (중간)' },
      { value: 'low', label: 'low (낮음)' },
    ]},
    { key: 'affectedComponents', label: '영향받는 컴포넌트', type: 'array' },
    { key: 'preventionKo', label: '예방책 (한국어)', type: 'array' },
    { key: 'mitigationKo', label: '완화 방안 (한국어)', type: 'array' },
    { key: 'estimatedMTTR', label: 'Estimated MTTR', type: 'text' },
    { key: 'tags', label: '태그', type: 'array' },
    { key: 'confidence', label: '신뢰도', type: 'simple-confidence', min: 0, max: 1, step: 0.05 },
  ],
};

export default function EditFailurePage() {
  return <KnowledgeFormPage config={config} />;
}
