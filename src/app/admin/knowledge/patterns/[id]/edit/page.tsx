'use client';

import { KnowledgeFormPage, type FormConfig } from '@/components/admin/knowledge';

const config: FormConfig = {
  resourceName: 'patterns',
  resourceNameKo: '패턴',
  pageTitle: '새 패턴 추가',
  pageTitleEdit: '패턴 수정',
  buttonColor: 'bg-green-600 hover:bg-green-700',
  mode: 'edit',
  sections: [
    { title: '기본 정보', fields: ['patternId', 'name', 'nameKo', 'description', 'descriptionKo', 'scalability', 'complexity'] },
    { title: '구성요소', fields: ['requiredComponents', 'optionalComponents'] },
    { title: '적합성 정보', fields: ['bestForKo', 'notSuitableForKo'] },
    { title: '진화 경로', fields: ['evolvesTo', 'evolvesFrom'] },
    { title: '태그', fields: ['tags'] },
    { title: '신뢰도 메타데이터', fields: ['trustMetadata'] },
  ],
  fields: [
    { key: 'patternId', label: 'Pattern ID', type: 'text', required: true },
    { key: 'name', label: '이름 (영문)', type: 'text', required: true },
    { key: 'nameKo', label: '이름 (한국어)', type: 'text', required: true },
    { key: 'description', label: '설명 (영문)', type: 'textarea', rows: 3 },
    { key: 'descriptionKo', label: '설명 (한국어)', type: 'textarea', rows: 3 },
    { key: 'scalability', label: '확장성 (Scalability)', type: 'select', options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'auto', label: 'Auto' },
    ]},
    { key: 'complexity', label: '복잡도 (1-5)', type: 'number', min: 1, max: 5, transformForSubmit: (v) => Math.min(5, Math.max(1, parseInt(String(v), 10) || 1)) },
    { key: 'requiredComponents', label: '필수 구성요소 (Required Components)', type: 'json', jsonSchema: 'requiredComponents' },
    { key: 'optionalComponents', label: '선택 구성요소 (Optional Components)', type: 'json', jsonSchema: 'optionalComponents' },
    { key: 'bestForKo', label: '적합한 환경 (bestForKo)', type: 'array', placeholder: '예: 중소규모 웹 서비스' },
    { key: 'notSuitableForKo', label: '부적합한 환경 (notSuitableForKo)', type: 'array', placeholder: '예: 대규모 마이크로서비스' },
    { key: 'evolvesTo', label: '진화 대상 (Evolves To)', type: 'array', placeholder: '예: PAT-MSA-001' },
    { key: 'evolvesFrom', label: '진화 원본 (Evolves From)', type: 'array', placeholder: '예: PAT-MONO-001' },
    { key: 'tags', label: '태그', type: 'array', placeholder: '예: web, 3-tier, traditional' },
    { key: 'trustMetadata', label: '신뢰도 메타데이터', type: 'trust-metadata' },
  ],
};

export default function EditPatternPage() {
  return <KnowledgeFormPage config={config} />;
}
