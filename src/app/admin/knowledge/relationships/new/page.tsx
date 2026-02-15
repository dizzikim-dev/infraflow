'use client';

import { KnowledgeFormPage, type FormConfig } from '@/components/admin/knowledge';

const config: FormConfig = {
  resourceName: 'relationships',
  resourceNameKo: '관계',
  pageTitle: '새 관계 추가',
  pageTitleEdit: '관계 수정',
  buttonColor: 'bg-blue-600 hover:bg-blue-700',
  mode: 'new',
  useLayout: false,
  sections: [
    { title: '기본 정보', fields: ['knowledgeId', 'sourceComponent', 'targetComponent', 'relationshipType', 'strength', 'direction'] },
    { title: '사유', fields: ['reason', 'reasonKo'] },
    { title: '태그', fields: ['tags'] },
    { title: '신뢰 메타데이터', fields: ['confidence'] },
  ],
  fields: [
    { key: 'knowledgeId', label: 'Knowledge ID', type: 'text', required: true, placeholder: 'REL-XXX-001' },
    { key: 'sourceComponent', label: '소스 컴포넌트', type: 'text', required: true, placeholder: 'firewall' },
    { key: 'targetComponent', label: '타겟 컴포넌트', type: 'text', required: true, placeholder: 'web-server' },
    { key: 'relationshipType', label: '관계 유형', type: 'select', defaultValue: 'requires', options: [
      { value: 'requires', label: 'requires (필수)' },
      { value: 'recommends', label: 'recommends (권장)' },
      { value: 'conflicts', label: 'conflicts (충돌)' },
      { value: 'enhances', label: 'enhances (강화)' },
      { value: 'protects', label: 'protects (보호)' },
    ]},
    { key: 'strength', label: '강도', type: 'select', defaultValue: 'strong', options: [
      { value: 'mandatory', label: 'mandatory (필수)' },
      { value: 'strong', label: 'strong (강함)' },
      { value: 'weak', label: 'weak (약함)' },
    ]},
    { key: 'direction', label: '방향', type: 'select', defaultValue: 'downstream', options: [
      { value: 'upstream', label: 'upstream' },
      { value: 'downstream', label: 'downstream' },
      { value: 'bidirectional', label: 'bidirectional' },
    ]},
    { key: 'reason', label: 'Reason (EN)', type: 'textarea', rows: 3, placeholder: 'Reason for this relationship...' },
    { key: 'reasonKo', label: '사유 (KO)', type: 'textarea', rows: 3, placeholder: '이 관계의 사유...' },
    { key: 'tags', label: '태그', type: 'array', defaultValue: [] },
    { key: 'confidence', label: '신뢰도', type: 'simple-confidence', defaultValue: 0.5, min: 0, max: 1, step: 0.05 },
  ],
};

export default function NewRelationshipPage() {
  return <KnowledgeFormPage config={config} />;
}
