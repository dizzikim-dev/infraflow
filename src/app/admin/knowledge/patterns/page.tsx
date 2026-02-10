'use client';

/**
 * 패턴 관리 목록 페이지
 */

import Link from 'next/link';
import {
  KnowledgeListPage,
  TrustBadge,
} from '@/components/admin/knowledge';
import type { ColumnDef, FilterDef, KnowledgeListConfig } from '@/components/admin/knowledge';

interface PatternItem {
  id: string;
  patternId: string;
  name: string;
  nameKo: string;
  scalability: string;
  complexity: number;
  requiredComponents: { type: string; minCount: number }[];
  tags: string[];
  isActive: boolean;
  trustMetadata: { confidence: number } | null;
  createdAt: string;
}

const scalabilityBadgeColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-green-100 text-green-800',
  auto: 'bg-purple-100 text-purple-800',
};

function renderStars(complexity: number) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < complexity ? 'text-yellow-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

const filters: FilterDef[] = [
  {
    key: 'scalability',
    label: '확장성',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'auto', label: 'Auto' },
    ],
  },
];

const columns: ColumnDef<PatternItem>[] = [
  {
    key: 'patternId',
    label: 'Pattern ID',
    sortable: true,
    render: (item) => (
      <Link
        href={`/admin/knowledge/patterns/${item.id}`}
        className="text-blue-600 hover:text-blue-800 font-mono text-xs"
      >
        {item.patternId}
      </Link>
    ),
  },
  {
    key: 'name',
    label: '이름',
    sortable: true,
    render: (item) => (
      <div>
        <div className="font-medium text-gray-900">{item.nameKo}</div>
        <div className="text-xs text-gray-500">{item.name}</div>
      </div>
    ),
  },
  {
    key: 'scalability',
    label: '확장성',
    render: (item) => (
      <span
        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
          scalabilityBadgeColors[item.scalability] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {item.scalability}
      </span>
    ),
  },
  {
    key: 'complexity',
    label: '복잡도',
    render: (item) => renderStars(item.complexity),
  },
  {
    key: 'requiredComponents',
    label: '필수 구성요소',
    render: (item) => {
      const components = item.requiredComponents as { type: string; minCount: number }[];
      return (
        <span className="text-sm text-gray-600">
          {Array.isArray(components) ? components.length : 0}개
        </span>
      );
    },
  },
  {
    key: 'tags',
    label: '태그',
    render: (item) => (
      <div className="flex flex-wrap gap-1">
        {(item.tags || []).slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="inline-flex px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
          >
            {tag}
          </span>
        ))}
        {(item.tags || []).length > 3 && (
          <span className="text-xs text-gray-400">+{item.tags.length - 3}</span>
        )}
      </div>
    ),
  },
  {
    key: 'trustMetadata',
    label: '신뢰도',
    render: (item) => {
      const meta = item.trustMetadata as { confidence: number } | null;
      return meta ? <TrustBadge confidence={meta.confidence} /> : <span className="text-gray-400">-</span>;
    },
  },
];

const config: KnowledgeListConfig<PatternItem> = {
  entityPath: 'patterns',
  title: '패턴 관리',
  description: '인프라 아키텍처 패턴 조회 및 관리',
  addButtonLabel: '새 패턴 추가',
  addButtonColor: 'bg-green-600 hover:bg-green-700',
  columns,
  filters,
  deleteConfirmMessage: (item) => `패턴 "${item.nameKo}"을(를) 삭제하시겠습니까?`,
  emptyMessage: '등록된 패턴이 없습니다.',
};

export default function PatternsPage() {
  return <KnowledgeListPage<PatternItem> config={config} />;
}
