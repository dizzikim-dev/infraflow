'use client';

/**
 * 출처 관리 목록 페이지
 */

import Link from 'next/link';
import { KnowledgeListPage } from '@/components/admin/knowledge';
import type { ColumnDef, FilterDef, KnowledgeListConfig } from '@/components/admin/knowledge';
import { SOURCE_TYPE_COLORS, SOURCE_TYPE_LABELS } from '@/lib/admin/badgeThemes';

interface SourceItem {
  id: string;
  sourceId: string;
  sourceType: string;
  title: string;
  url?: string;
  section?: string;
  publishedDate?: string;
  accessedDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function truncateUrl(url: string, max: number): string {
  if (url.length <= max) return url;
  return url.slice(0, max) + '...';
}

const columns: ColumnDef<SourceItem>[] = [
  {
    key: 'sourceId',
    label: '출처 ID',
    sortable: true,
    render: (item) => (
      <Link
        href={`/admin/knowledge/sources/${item.id}`}
        className="text-blue-600 hover:text-blue-800 font-mono text-xs"
      >
        {item.sourceId}
      </Link>
    ),
  },
  {
    key: 'sourceType',
    label: '유형',
    render: (item) => (
      <span
        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
          SOURCE_TYPE_COLORS[item.sourceType] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {SOURCE_TYPE_LABELS[item.sourceType] || item.sourceType}
      </span>
    ),
  },
  {
    key: 'title',
    label: '제목',
    width: '250px',
    render: (item) => (
      <span className="text-sm text-gray-900 truncate block max-w-[250px]">
        {item.title}
      </span>
    ),
  },
  {
    key: 'url',
    label: 'URL',
    width: '200px',
    render: (item) =>
      item.url ? (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm"
          title={item.url}
        >
          {truncateUrl(item.url, 40)}
        </a>
      ) : (
        <span className="text-gray-400">-</span>
      ),
  },
  {
    key: 'publishedDate',
    label: '발행일',
    render: (item) => (
      <span className="text-sm text-gray-500">{item.publishedDate || '-'}</span>
    ),
  },
  {
    key: 'accessedDate',
    label: '접근일',
  },
];

const filters: FilterDef[] = [
  {
    key: 'sourceType',
    label: '출처 유형',
    options: [
      { value: 'rfc', label: 'RFC' },
      { value: 'nist', label: 'NIST' },
      { value: 'cis', label: 'CIS' },
      { value: 'owasp', label: 'OWASP' },
      { value: 'vendor', label: 'Vendor' },
      { value: 'academic', label: 'Academic' },
      { value: 'industry', label: 'Industry' },
      { value: 'user_verified', label: '검증됨 (User Verified)' },
      { value: 'user_unverified', label: '미검증 (User Unverified)' },
    ],
  },
];

const config: KnowledgeListConfig<SourceItem> = {
  entityPath: 'sources',
  title: '출처 관리',
  description: '지식 데이터 출처 목록 조회 및 관리',
  addButtonLabel: '새 출처 추가',
  columns,
  filters,
  deleteConfirmMessage: (item) => `출처 "${item.sourceId}"을(를) 삭제하시겠습니까?`,
  emptyMessage: '등록된 출처가 없습니다.',
};

export default function SourcesPage() {
  return <KnowledgeListPage<SourceItem> config={config} />;
}
