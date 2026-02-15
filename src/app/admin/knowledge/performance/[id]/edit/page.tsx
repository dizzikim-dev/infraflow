'use client';

import { KnowledgeFormPage, type FormConfig } from '@/components/admin/knowledge';

const config: FormConfig = {
  resourceName: 'performance',
  resourceNameKo: '성능 프로파일',
  pageTitle: '새 성능 프로파일 추가',
  pageTitleEdit: '성능 프로파일 수정',
  buttonColor: 'bg-purple-600 hover:bg-purple-700',
  mode: 'edit',
  sections: [
    { title: '기본 정보', fields: ['performanceId', 'component', 'nameKo', 'scalingStrategy'] },
    { title: '성능 지표', fields: ['latencyRange', 'throughputRange'] },
    { title: '최적화 정보', fields: ['bottleneckIndicators', 'bottleneckIndicatorsKo', 'optimizationTipsKo'] },
    { title: '태그', fields: ['tags'] },
    { title: '신뢰도 메타데이터', fields: ['trustMetadata'] },
  ],
  fields: [
    { key: 'performanceId', label: 'Performance ID', type: 'text', required: true },
    { key: 'component', label: 'Component', type: 'text', required: true },
    { key: 'nameKo', label: '이름 (한국어)', type: 'text', required: true },
    { key: 'scalingStrategy', label: 'Scaling Strategy', type: 'select', options: [
      { value: 'horizontal', label: 'Horizontal' },
      { value: 'vertical', label: 'Vertical' },
      { value: 'auto', label: 'Auto' },
      { value: 'manual', label: 'Manual' },
    ]},
    { key: 'latencyRange', label: 'Latency Range', type: 'json', jsonSchema: 'latencyRange' },
    { key: 'throughputRange', label: 'Throughput Range', type: 'json', jsonSchema: 'throughputRange' },
    { key: 'bottleneckIndicators', label: 'Bottleneck Indicators (영문)', type: 'array' },
    { key: 'bottleneckIndicatorsKo', label: 'Bottleneck Indicators (한국어)', type: 'array' },
    { key: 'optimizationTipsKo', label: 'Optimization Tips (한국어)', type: 'array' },
    { key: 'tags', label: '태그', type: 'array' },
    { key: 'trustMetadata', label: '신뢰도 메타데이터', type: 'trust-metadata' },
  ],
};

export default function EditPerformancePage() {
  return <KnowledgeFormPage config={config} />;
}
