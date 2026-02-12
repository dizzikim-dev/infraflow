'use client';

/**
 * 관계 관리 목록 페이지
 */

import Link from 'next/link';
import {
  KnowledgeListPage,
  TrustBadge,
} from '@/components/admin/knowledge';
import type { ColumnDef, FilterDef, KnowledgeListConfig } from '@/components/admin/knowledge';
import {
  RELATIONSHIP_TYPE_COLORS,
  RELATIONSHIP_TYPE_LABELS,
  STRENGTH_COLORS,
  STRENGTH_LABELS,
} from '@/lib/admin/badgeThemes';

interface RelationshipItem {
  id: string;
  knowledgeId: string;
  sourceComponent: string;
  targetComponent: string;
  relationshipType: string;
  strength: string;
  direction: string;
  reason: string;
  reasonKo: string;
  tags: string[];
  trustMetadata: { confidence: number } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const columns: ColumnDef<RelationshipItem>[] = [
  {
    key: 'knowledgeId',
    label: 'Knowledge ID',
    sortable: true,
    render: (item) => (
      <Link
        href={`/admin/knowledge/relationships/${item.id}`}
        className="text-blue-600 hover:text-blue-800 font-mono text-xs"
      >
        {item.knowledgeId}
      </Link>
    ),
  },
  {
    key: 'sourceComponent',
    label: '소스',
    sortable: true,
  },
  {
    key: 'targetComponent',
    label: '타겟',
    sortable: true,
  },
  {
    key: 'relationshipType',
    label: '유형',
    render: (item) => (
      <span
        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
          RELATIONSHIP_TYPE_COLORS[item.relationshipType] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {RELATIONSHIP_TYPE_LABELS[item.relationshipType] || item.relationshipType}
      </span>
    ),
  },
  {
    key: 'strength',
    label: '강도',
    render: (item) => (
      <span
        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
          STRENGTH_COLORS[item.strength] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {STRENGTH_LABELS[item.strength] || item.strength}
      </span>
    ),
  },
  {
    key: 'direction',
    label: '방향',
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
    key: 'relationshipType',
    label: '관계 유형',
    options: [
      { value: 'requires', label: '필수 (requires)' },
      { value: 'recommends', label: '권장 (recommends)' },
      { value: 'conflicts', label: '충돌 (conflicts)' },
      { value: 'enhances', label: '강화 (enhances)' },
      { value: 'protects', label: '보호 (protects)' },
    ],
  },
  {
    key: 'strength',
    label: '강도',
    options: [
      { value: 'mandatory', label: '필수 (mandatory)' },
      { value: 'strong', label: '강함 (strong)' },
      { value: 'weak', label: '약함 (weak)' },
    ],
  },
];

const config: KnowledgeListConfig<RelationshipItem> = {
  entityPath: 'relationships',
  title: '관계 관리',
  description: '인프라 컴포넌트 간 관계 목록 조회 및 관리',
  addButtonLabel: '새 관계 추가',
  columns,
  filters,
  deleteConfirmMessage: (item) => `관계 "${item.knowledgeId}"을(를) 삭제하시겠습니까?`,
  emptyMessage: '등록된 관계가 없습니다.',
};

export default function RelationshipsPage() {
  return <KnowledgeListPage<RelationshipItem> config={config} />;
}
