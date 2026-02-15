'use client';

import { KnowledgeFormPage, type FormConfig } from '@/components/admin/knowledge';

const config: FormConfig = {
  resourceName: 'performance',
  resourceNameKo: '성능 프로파일',
  pageTitle: '새 성능 프로파일 추가',
  pageTitleEdit: '성능 프로파일 수정',
  buttonColor: 'bg-purple-600 hover:bg-purple-700',
  mode: 'new',
  pageDescription: '인프라 컴포넌트의 성능 프로파일을 새로 생성합니다',
  sections: [
    { title: '기본 정보', fields: ['performanceId', 'component', 'nameKo', 'scalingStrategy'] },
    { title: '성능 지표', fields: ['latencyRange', 'throughputRange'] },
    { title: '최적화 정보', fields: ['bottleneckIndicators', 'bottleneckIndicatorsKo', 'optimizationTipsKo'] },
    { title: '태그', fields: ['tags'] },
    { title: '신뢰도 메타데이터', fields: ['trustMetadata'] },
  ],
  fields: [
    { key: 'performanceId', label: 'Performance ID', type: 'text', required: true, placeholder: 'PERF-XXX-001' },
    { key: 'component', label: 'Component', type: 'text', required: true, placeholder: 'firewall' },
    { key: 'nameKo', label: '이름 (한국어)', type: 'text', required: true, placeholder: '방화벽 성능 프로파일' },
    { key: 'scalingStrategy', label: 'Scaling Strategy', type: 'select', defaultValue: 'horizontal', options: [
      { value: 'horizontal', label: 'Horizontal' },
      { value: 'vertical', label: 'Vertical' },
      { value: 'auto', label: 'Auto' },
      { value: 'manual', label: 'Manual' },
    ]},
    { key: 'latencyRange', label: 'Latency Range', type: 'json', jsonSchema: 'latencyRange', defaultValue: { min: 0, max: 0, unit: 'ms' } },
    { key: 'throughputRange', label: 'Throughput Range', type: 'json', jsonSchema: 'throughputRange', defaultValue: { typical: '', max: '' } },
    { key: 'bottleneckIndicators', label: 'Bottleneck Indicators (영문)', type: 'array', defaultValue: [] },
    { key: 'bottleneckIndicatorsKo', label: 'Bottleneck Indicators (한국어)', type: 'array', defaultValue: [] },
    { key: 'optimizationTipsKo', label: 'Optimization Tips (한국어)', type: 'array', defaultValue: [] },
    { key: 'tags', label: '태그', type: 'array', defaultValue: [] },
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

export default function NewPerformancePage() {
  return <KnowledgeFormPage config={config} />;
}
