'use client';

/**
 * 장애 시나리오 관리 목록 페이지
 */

import Link from 'next/link';
import {
  KnowledgeListPage,
  TrustBadge,
} from '@/components/admin/knowledge';
import type { ColumnDef, FilterDef, KnowledgeListConfig } from '@/components/admin/knowledge';
import { IMPACT_COLORS, IMPACT_LABELS, LIKELIHOOD_COLORS, LIKELIHOOD_LABELS } from '@/lib/admin/badgeThemes';

interface FailureItem {
  id: string;
  failureId: string;
  component: string;
  titleKo: string;
  scenarioKo: string;
  impact: string;
  likelihood: string;
  affectedComponents: string[];
  preventionKo: string[];
  mitigationKo: string[];
  estimatedMTTR: string;
  tags: string[];
  trustMetadata: { confidence: number } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const columns: ColumnDef<FailureItem>[] = [
  {
    key: 'failureId',
    label: 'Failure ID',
    sortable: true,
    render: (item) => (
      <Link
        href={`/admin/knowledge/failures/${item.id}`}
        className="text-blue-600 hover:text-blue-800 font-mono text-xs"
      >
        {item.failureId}
      </Link>
    ),
  },
  {
    key: 'component',
    label: '컴포넌트',
    sortable: true,
  },
  {
    key: 'titleKo',
    label: '제목',
    width: '200px',
    render: (item) => (
      <span className="text-sm text-gray-900 truncate block max-w-[200px]">
        {item.titleKo}
      </span>
    ),
  },
  {
    key: 'impact',
    label: '영향',
    render: (item) => (
      <span
        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
          IMPACT_COLORS[item.impact] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {IMPACT_LABELS[item.impact] || item.impact}
      </span>
    ),
  },
  {
    key: 'likelihood',
    label: '발생 가능성',
    render: (item) => (
      <span
        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
          LIKELIHOOD_COLORS[item.likelihood] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {LIKELIHOOD_LABELS[item.likelihood] || item.likelihood}
      </span>
    ),
  },
  {
    key: 'estimatedMTTR',
    label: 'MTTR',
    render: (item) => (
      <span className="text-sm text-gray-500">
        {item.estimatedMTTR || '-'}
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
    key: 'impact',
    label: '영향',
    options: [
      { value: 'service_down', label: '서비스 중단 (service_down)' },
      { value: 'degraded', label: '성능 저하 (degraded)' },
      { value: 'data_loss', label: '데이터 손실 (data_loss)' },
      { value: 'security_breach', label: '보안 침해 (security_breach)' },
    ],
  },
  {
    key: 'likelihood',
    label: '발생 가능성',
    options: [
      { value: 'high', label: '높음 (high)' },
      { value: 'medium', label: '중간 (medium)' },
      { value: 'low', label: '낮음 (low)' },
    ],
  },
];

const config: KnowledgeListConfig<FailureItem> = {
  entityPath: 'failures',
  title: '장애 시나리오 관리',
  description: '인프라 장애 시나리오 목록 조회 및 관리',
  addButtonLabel: '새 장애 시나리오 추가',
  addButtonColor: 'bg-orange-600 hover:bg-orange-700',
  columns,
  filters,
  deleteConfirmMessage: (item) => `장애 시나리오 "${item.titleKo}"을(를) 삭제하시겠습니까?`,
  emptyMessage: '등록된 장애 시나리오가 없습니다.',
};

export default function FailuresPage() {
  return <KnowledgeListPage<FailureItem> config={config} />;
}
