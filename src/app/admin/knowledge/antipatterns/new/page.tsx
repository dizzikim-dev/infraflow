'use client';

import { KnowledgeFormPage, type FormConfig } from '@/components/admin/knowledge';

const config: FormConfig = {
  resourceName: 'antipatterns',
  resourceNameKo: '안티패턴',
  pageTitle: '새 안티패턴 추가',
  pageTitleEdit: '안티패턴 수정',
  buttonColor: 'bg-red-600 hover:bg-red-700',
  mode: 'new',
  useLayout: false,
  sections: [
    { title: '기본 정보', fields: ['antiPatternId', 'name', 'nameKo', 'severity', 'detectionRuleId', 'detectionDescriptionKo'] },
    { title: '문제 및 영향', fields: ['problemKo', 'impactKo', 'solutionKo'] },
    { title: '태그', fields: ['tags'] },
    { title: '신뢰도', fields: ['confidence'] },
  ],
  fields: [
    { key: 'antiPatternId', label: 'AntiPattern ID', type: 'text', required: true, placeholder: 'AP-XXX-001' },
    { key: 'name', label: '이름 (영문)', type: 'text', required: true, placeholder: 'Single Point of Failure' },
    { key: 'nameKo', label: '이름 (한국어)', type: 'text', required: true, placeholder: '단일 장애 지점' },
    { key: 'severity', label: '심각도', type: 'select', defaultValue: 'medium', options: [
      { value: 'critical', label: 'Critical' },
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
    ]},
    { key: 'detectionRuleId', label: 'Detection Rule ID', type: 'text', required: true, placeholder: 'RULE-XXX-001' },
    { key: 'detectionDescriptionKo', label: '탐지 규칙 설명 (한국어)', type: 'textarea', rows: 3, placeholder: '탐지 규칙 설명...' },
    { key: 'problemKo', label: '문제 (한국어)', type: 'textarea', rows: 3, placeholder: '문제 설명...' },
    { key: 'impactKo', label: '영향 (한국어)', type: 'textarea', rows: 3, placeholder: '영향 설명...' },
    { key: 'solutionKo', label: '해결책 (한국어)', type: 'textarea', rows: 3, placeholder: '해결책 설명...' },
    { key: 'tags', label: '태그', type: 'array', defaultValue: [] },
    { key: 'confidence', label: '신뢰도', type: 'simple-confidence', defaultValue: 0.5, min: 0, max: 1, step: 0.05 },
  ],
};

export default function NewAntiPatternPage() {
  return <KnowledgeFormPage config={config} />;
}
