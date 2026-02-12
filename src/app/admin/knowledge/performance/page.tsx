'use client';

/**
 * 성능 프로파일 관리 목록 페이지
 */

import Link from 'next/link';
import { KnowledgeListPage } from '@/components/admin/knowledge';
import type { ColumnDef, FilterDef, KnowledgeListConfig } from '@/components/admin/knowledge';
import { SCALING_STRATEGY_COLORS } from '@/lib/admin/badgeThemes';

interface LatencyRange {
  min: number;
  max: number;
  unit: string;
}

interface ThroughputRange {
  typical: string;
  max: string;
}

interface PerformanceItem {
  id: string;
  performanceId: string;
  component: string;
  nameKo: string;
  latencyRange: LatencyRange | null;
  throughputRange: ThroughputRange | null;
  scalingStrategy: string;
  tags: string[];
  isActive: boolean;
  trustMetadata: { confidence: number } | null;
  createdAt: string;
}

const filters: FilterDef[] = [
  {
    key: 'scalingStrategy',
    label: '스케일링 전략',
    options: [
      { value: 'horizontal', label: 'Horizontal' },
      { value: 'vertical', label: 'Vertical' },
      { value: 'both', label: 'Both' },
    ],
  },
];

function formatLatency(latency: LatencyRange | null): string {
  if (!latency) return '-';
  return `${latency.min}-${latency.max} ${latency.unit || 'ms'}`;
}

const columns: ColumnDef<PerformanceItem>[] = [
  {
    key: 'performanceId',
    label: 'Performance ID',
    sortable: true,
    render: (item) => (
      <Link
        href={`/admin/knowledge/performance/${item.id}`}
        className="text-blue-600 hover:text-blue-800 font-mono text-xs"
      >
        {item.performanceId}
      </Link>
    ),
  },
  {
    key: 'component',
    label: '컴포넌트',
    sortable: true,
    render: (item) => (
      <span className="font-mono text-sm text-gray-900">{item.component}</span>
    ),
  },
  {
    key: 'nameKo',
    label: '이름',
    sortable: true,
    render: (item) => (
      <span className="text-sm text-gray-900">{item.nameKo}</span>
    ),
  },
  {
    key: 'latencyRange',
    label: '지연시간',
    render: (item) => {
      const latency = item.latencyRange as LatencyRange | null;
      return <span className="text-sm text-gray-600 font-mono">{formatLatency(latency)}</span>;
    },
  },
  {
    key: 'throughputRange',
    label: '처리량 (일반)',
    render: (item) => {
      const throughput = item.throughputRange as ThroughputRange | null;
      return (
        <span className="text-sm text-gray-600">
          {throughput?.typical || '-'}
        </span>
      );
    },
  },
  {
    key: 'scalingStrategy',
    label: '스케일링',
    render: (item) => (
      <span
        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
          SCALING_STRATEGY_COLORS[item.scalingStrategy] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {item.scalingStrategy}
      </span>
    ),
  },
  {
    key: 'tags',
    label: '태그',
    render: (item) => (
      <div className="flex flex-wrap gap-1">
        {(item.tags || []).slice(0, 2).map((tag) => (
          <span key={tag} className="inline-flex px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
            {tag}
          </span>
        ))}
        {(item.tags || []).length > 2 && (
          <span className="text-xs text-gray-400">+{item.tags.length - 2}</span>
        )}
      </div>
    ),
  },
];

const config: KnowledgeListConfig<PerformanceItem> = {
  entityPath: 'performance',
  title: '성능 프로파일 관리',
  description: '인프라 컴포넌트 성능 프로파일 조회 및 관리',
  addButtonLabel: '새 성능 프로파일 추가',
  addButtonColor: 'bg-purple-600 hover:bg-purple-700',
  columns,
  filters,
  deleteConfirmMessage: (item) => `성능 프로파일 "${item.nameKo}"을(를) 삭제하시겠습니까?`,
  emptyMessage: '등록된 성능 프로파일이 없습니다.',
};

export default function PerformancePage() {
  return <KnowledgeListPage<PerformanceItem> config={config} />;
}
