'use client';

import { KnowledgeFormPage, type FormConfig } from '@/components/admin/knowledge';

const config: FormConfig = {
  resourceName: 'patterns',
  resourceNameKo: '패턴',
  pageTitle: '새 패턴 추가',
  pageTitleEdit: '패턴 수정',
  buttonColor: 'bg-green-600 hover:bg-green-700',
  mode: 'new',
  pageDescription: '인프라 아키텍처 패턴을 새로 생성합니다',
  sections: [
    { title: '기본 정보', fields: ['patternId', 'name', 'nameKo', 'description', 'descriptionKo', 'scalability', 'complexity'] },
    { title: '구성요소', fields: ['requiredComponents', 'optionalComponents'] },
    { title: '적합성 정보', fields: ['bestForKo', 'notSuitableForKo'] },
    { title: '진화 경로', fields: ['evolvesTo', 'evolvesFrom'] },
    { title: '태그', fields: ['tags'] },
    { title: '신뢰도 메타데이터', fields: ['trustMetadata'] },
  ],
  fields: [
    { key: 'patternId', label: 'Pattern ID', type: 'text', required: true, placeholder: '예: PAT-3TIER-001' },
    { key: 'name', label: '이름 (영문)', type: 'text', required: true, placeholder: '3-Tier Web Architecture' },
    { key: 'nameKo', label: '이름 (한국어)', type: 'text', required: true, placeholder: '3티어 웹 아키텍처' },
    { key: 'description', label: '설명 (영문)', type: 'textarea', rows: 3, placeholder: 'Description in English' },
    { key: 'descriptionKo', label: '설명 (한국어)', type: 'textarea', rows: 3, placeholder: '한국어 설명' },
    { key: 'scalability', label: '확장성 (Scalability)', type: 'select', defaultValue: 'medium', options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'auto', label: 'Auto' },
    ]},
    { key: 'complexity', label: '복잡도 (1-5)', type: 'number', defaultValue: 3, min: 1, max: 5, transformForSubmit: (v) => Math.min(5, Math.max(1, parseInt(String(v), 10) || 1)) },
    { key: 'requiredComponents', label: '필수 구성요소 (Required Components)', type: 'json', jsonSchema: 'requiredComponents', defaultValue: [] },
    { key: 'optionalComponents', label: '선택 구성요소 (Optional Components)', type: 'json', jsonSchema: 'optionalComponents', defaultValue: [] },
    { key: 'bestForKo', label: '적합한 환경 (bestForKo)', type: 'array', placeholder: '예: 중소규모 웹 서비스', defaultValue: [] },
    { key: 'notSuitableForKo', label: '부적합한 환경 (notSuitableForKo)', type: 'array', placeholder: '예: 대규모 마이크로서비스', defaultValue: [] },
    { key: 'evolvesTo', label: '진화 대상 (Evolves To)', type: 'array', placeholder: '예: PAT-MSA-001', defaultValue: [] },
    { key: 'evolvesFrom', label: '진화 원본 (Evolves From)', type: 'array', placeholder: '예: PAT-MONO-001', defaultValue: [] },
    { key: 'tags', label: '태그', type: 'array', placeholder: '예: web, 3-tier, traditional', defaultValue: [] },
    {
      key: 'trustMetadata',
      label: '신뢰도 메타데이터',
      type: 'trust-metadata',
      defaultValue: {
        confidence: 0.85,
        sources: [
          {
            type: 'user_verified',
            title: 'Admin Dashboard',
            accessedDate: new Date().toISOString().split('T')[0],
          },
        ],
      }
    },
  ],
};

export default function NewPatternPage() {
  return <KnowledgeFormPage config={config} />;
}
