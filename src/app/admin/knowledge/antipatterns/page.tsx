'use client';

/**
 * 안티패턴 관리 목록 페이지
 */

import Link from 'next/link';
import {
  KnowledgeListPage,
  TrustBadge,
} from '@/components/admin/knowledge';
import type { ColumnDef, FilterDef, KnowledgeListConfig } from '@/components/admin/knowledge';

interface AntiPatternItem {
  id: string;
  antiPatternId: string;
  name: string;
  nameKo: string;
  severity: string;
  detectionRuleId: string;
  detectionDescriptionKo: string;
  problemKo: string;
  impactKo: string;
  solutionKo: string;
  tags: string[];
  trustMetadata: { confidence: number } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const severityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-gray-100 text-gray-800',
};

const severityLabels: Record<string, string> = {
  critical: '심각',
  high: '높음',
  medium: '중간',
  low: '낮음',
};

const columns: ColumnDef<AntiPatternItem>[] = [
  {
    key: 'antiPatternId',
    label: 'ID',
    sortable: true,
    render: (item) => (
      <Link
        href={`/admin/knowledge/antipatterns/${item.id}`}
        className="text-blue-600 hover:text-blue-800 font-mono text-xs"
      >
        {item.antiPatternId}
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
    key: 'severity',
    label: '심각도',
    render: (item) => (
      <span
        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
          severityColors[item.severity] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {severityLabels[item.severity] || item.severity}
      </span>
    ),
  },
  {
    key: 'detectionRuleId',
    label: '탐지 규칙',
    render: (item) => (
      <span className="text-sm text-gray-500 font-mono">
        {item.detectionRuleId || '-'}
      </span>
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

const filters: FilterDef[] = [
  {
    key: 'severity',
    label: '심각도',
    options: [
      { value: 'critical', label: '심각 (critical)' },
      { value: 'high', label: '높음 (high)' },
      { value: 'medium', label: '중간 (medium)' },
      { value: 'low', label: '낮음 (low)' },
    ],
  },
];

const config: KnowledgeListConfig<AntiPatternItem> = {
  entityPath: 'antipatterns',
  title: '안티패턴 관리',
  description: '인프라 안티패턴 목록 조회 및 관리',
  addButtonLabel: '새 안티패턴 추가',
  addButtonColor: 'bg-red-600 hover:bg-red-700',
  columns,
  filters,
  deleteConfirmMessage: (item) => `안티패턴 "${item.nameKo}"을(를) 삭제하시겠습니까?`,
  emptyMessage: '등록된 안티패턴이 없습니다.',
};

export default function AntiPatternsPage() {
  return <KnowledgeListPage<AntiPatternItem> config={config} />;
}
