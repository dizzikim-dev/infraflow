'use client';

/**
 * 벤치마크 관리 목록 페이지
 */

import Link from 'next/link';
import { KnowledgeListPage } from '@/components/admin/knowledge';
import type { ColumnDef, FilterDef, KnowledgeListConfig } from '@/components/admin/knowledge';

interface BenchmarkItem {
  id: string;
  componentType: string;
  trafficTier: string;
  recommendedInstanceCount: number;
  recommendedSpec: string;
  recommendedSpecKo: string;
  minimumInstanceCount: number;
  minimumSpec: string;
  minimumSpecKo: string;
  scalingNotes: string;
  scalingNotesKo: string;
  estimatedMonthlyCost?: number;
  maxRPS: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const trafficTierColors: Record<string, string> = {
  small: 'bg-green-100 text-green-800',
  medium: 'bg-blue-100 text-blue-800',
  large: 'bg-orange-100 text-orange-800',
  enterprise: 'bg-purple-100 text-purple-800',
};

const trafficTierLabels: Record<string, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
  enterprise: 'Enterprise',
};

function formatCost(cost?: number): string {
  if (cost === undefined || cost === null) return '-';
  return `$${cost.toLocaleString()}`;
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max) + '...';
}

const columns: ColumnDef<BenchmarkItem>[] = [
  {
    key: 'componentType',
    label: '컴포넌트 타입',
    sortable: true,
    render: (item) => (
      <Link
        href={`/admin/knowledge/benchmarks/${item.id}`}
        className="text-blue-600 hover:text-blue-800 font-mono text-xs"
      >
        {item.componentType}
      </Link>
    ),
  },
  {
    key: 'trafficTier',
    label: '트래픽 티어',
    render: (item) => (
      <span
        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
          trafficTierColors[item.trafficTier] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {trafficTierLabels[item.trafficTier] || item.trafficTier}
      </span>
    ),
  },
  {
    key: 'recommendedSpec',
    label: '권장 사양',
    width: '200px',
    render: (item) => (
      <span className="text-sm text-gray-500" title={item.recommendedSpec}>
        {truncate(item.recommendedSpec, 30)}
      </span>
    ),
  },
  {
    key: 'minimumSpec',
    label: '최소 사양',
    width: '200px',
    render: (item) => (
      <span className="text-sm text-gray-500" title={item.minimumSpec}>
        {truncate(item.minimumSpec, 30)}
      </span>
    ),
  },
  {
    key: 'maxRPS',
    label: 'Max RPS',
    sortable: true,
    render: (item) => (
      <span className="text-sm text-gray-900">
        {item.maxRPS.toLocaleString()}
      </span>
    ),
  },
  {
    key: 'estimatedMonthlyCost',
    label: '월 예상 비용',
    sortable: true,
    render: (item) => (
      <span className="text-sm text-gray-900">
        {formatCost(item.estimatedMonthlyCost)}
      </span>
    ),
  },
];

const filters: FilterDef[] = [
  {
    key: 'trafficTier',
    label: '트래픽 티어',
    options: [
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' },
      { value: 'enterprise', label: 'Enterprise' },
    ],
  },
];

const config: KnowledgeListConfig<BenchmarkItem> = {
  entityPath: 'benchmarks',
  title: '벤치마크 관리',
  description: '인프라 컴포넌트 벤치마크 사양 조회 및 관리',
  addButtonLabel: '새 벤치마크 추가',
  columns,
  filters,
  deleteConfirmMessage: (item) => `벤치마크 "${item.componentType} / ${item.trafficTier}"을(를) 삭제하시겠습니까?`,
  emptyMessage: '등록된 벤치마크가 없습니다.',
};

export default function BenchmarksPage() {
  return <KnowledgeListPage<BenchmarkItem> config={config} />;
}
