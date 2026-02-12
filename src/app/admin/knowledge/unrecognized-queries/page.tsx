'use client';

/**
 * 미인식 쿼리 관리 목록 페이지
 */

import Link from 'next/link';
import {
  KnowledgeListPage,
} from '@/components/admin/knowledge';
import type { ColumnDef, FilterDef, KnowledgeListConfig } from '@/components/admin/knowledge';

interface UnrecognizedQueryItem {
  id: string;
  query: string;
  confidence: number;
  sessionId: string | null;
  isResolved: boolean;
  adminNotes: string | null;
  suggestedType: string | null;
  isActive: boolean;
  createdAt: string;
}

const filters: FilterDef[] = [
  {
    key: 'isResolved',
    label: '해결 상태',
    options: [
      { value: 'true', label: '해결됨' },
      { value: 'false', label: '미해결' },
    ],
  },
];

const columns: ColumnDef<UnrecognizedQueryItem>[] = [
  {
    key: 'query',
    label: '쿼리',
    sortable: true,
    render: (item) => (
      <Link
        href={`/admin/knowledge/unrecognized-queries/${item.id}`}
        className="text-blue-600 hover:text-blue-800 text-sm"
      >
        <div className="max-w-xs truncate">{item.query}</div>
      </Link>
    ),
  },
  {
    key: 'confidence',
    label: '신뢰도',
    sortable: true,
    render: (item) => {
      const score = item.confidence;
      let color = 'text-green-600 bg-green-50';
      if (score <= 0.3) {
        color = 'text-red-600 bg-red-50';
      } else if (score <= 0.5) {
        color = 'text-yellow-600 bg-yellow-50';
      }
      return (
        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${color}`}>
          {(score * 100).toFixed(0)}%
        </span>
      );
    },
  },
  {
    key: 'isResolved',
    label: '상태',
    render: (item) => (
      <span
        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
          item.isResolved
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}
      >
        {item.isResolved ? '해결됨' : '미해결'}
      </span>
    ),
  },
  {
    key: 'suggestedType',
    label: '제안 타입',
    render: (item) => (
      <span className="text-sm text-gray-600 font-mono">
        {item.suggestedType || '-'}
      </span>
    ),
  },
  {
    key: 'createdAt',
    label: '등록일',
    sortable: true,
    render: (item) => (
      <span className="text-sm text-gray-600">
        {new Date(item.createdAt).toLocaleDateString('ko-KR')}
      </span>
    ),
  },
];

const config: KnowledgeListConfig<UnrecognizedQueryItem> = {
  entityPath: 'unrecognized-queries',
  title: '미인식 쿼리 관리',
  description: '인식 실패한 사용자 쿼리 조회 및 분석',
  addButtonLabel: '쿼리 직접 추가',
  addButtonColor: 'bg-amber-600 hover:bg-amber-700',
  columns,
  filters,
  deleteConfirmMessage: (item) => `쿼리 "${item.query}"을(를) 삭제하시겠습니까?`,
  emptyMessage: '미인식 쿼리가 없습니다.',
};

export default function UnrecognizedQueriesPage() {
  return <KnowledgeListPage<UnrecognizedQueryItem> config={config} />;
}
