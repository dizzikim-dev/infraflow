'use client';

import { KnowledgeFormPage, type FormConfig } from '@/components/admin/knowledge';

const config: FormConfig = {
  resourceName: 'benchmarks',
  resourceNameKo: '벤치마크',
  pageTitle: '새 벤치마크 추가',
  pageTitleEdit: '벤치마크 수정',
  buttonColor: 'bg-blue-600 hover:bg-blue-700',
  mode: 'new',
  useLayout: false,
  sections: [
    { title: '기본 정보', fields: ['componentType', 'trafficTier', 'maxRPS', 'estimatedMonthlyCost'] },
    { title: '권장 사양', fields: ['recommendedInstanceCount', 'recommendedSpec', 'recommendedSpecKo'] },
    { title: '최소 사양', fields: ['minimumInstanceCount', 'minimumSpec', 'minimumSpecKo'] },
    { title: '스케일링 노트', fields: ['scalingNotes', 'scalingNotesKo'] },
    { title: '신뢰도 메타데이터', fields: ['confidence'] },
  ],
  fields: [
    { key: 'componentType', label: '컴포넌트 타입', type: 'text', required: true, placeholder: 'web-server' },
    { key: 'trafficTier', label: '트래픽 티어', type: 'select', defaultValue: 'small', options: [
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' },
      { value: 'enterprise', label: 'Enterprise' },
    ]},
    { key: 'maxRPS', label: 'Max RPS', type: 'number', required: true, defaultValue: 0, transformForSubmit: (v) => parseInt(String(v), 10) || 0 },
    { key: 'estimatedMonthlyCost', label: '월 예상 비용 ($, 선택)', type: 'number', placeholder: '0', transformForSubmit: (v) => v ? parseFloat(String(v)) : undefined },
    { key: 'recommendedInstanceCount', label: '인스턴스 수', type: 'number', required: true, min: 1, defaultValue: 1, transformForSubmit: (v) => parseInt(String(v), 10) || 1 },
    { key: 'recommendedSpec', label: '사양 (영문)', type: 'text', required: true, placeholder: '4 vCPU, 16GB RAM, 100GB SSD', gridCols: 'full' },
    { key: 'recommendedSpecKo', label: '사양 (한국어)', type: 'text', required: true, placeholder: '4 vCPU, 16GB RAM, 100GB SSD', gridCols: 'full' },
    { key: 'minimumInstanceCount', label: '인스턴스 수', type: 'number', required: true, min: 1, defaultValue: 1, transformForSubmit: (v) => parseInt(String(v), 10) || 1 },
    { key: 'minimumSpec', label: '사양 (영문)', type: 'text', required: true, placeholder: '2 vCPU, 8GB RAM, 50GB SSD', gridCols: 'full' },
    { key: 'minimumSpecKo', label: '사양 (한국어)', type: 'text', required: true, placeholder: '2 vCPU, 8GB RAM, 50GB SSD', gridCols: 'full' },
    { key: 'scalingNotes', label: '영문', type: 'textarea', rows: 3, placeholder: 'Scaling notes...' },
    { key: 'scalingNotesKo', label: '한국어', type: 'textarea', rows: 3, placeholder: '스케일링 노트...' },
    { key: 'confidence', label: '신뢰도', type: 'simple-confidence', defaultValue: 0.7, min: 0, max: 1, step: 0.05, trustSourceType: 'admin' },
  ],
};

export default function NewBenchmarkPage() {
  return <KnowledgeFormPage config={config} />;
}
