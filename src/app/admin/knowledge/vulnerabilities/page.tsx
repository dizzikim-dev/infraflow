'use client';

/**
 * 취약점 관리 목록 페이지
 */

import Link from 'next/link';
import {
  KnowledgeListPage,
  SeverityBadge,
} from '@/components/admin/knowledge';
import type { ColumnDef, FilterDef, KnowledgeListConfig } from '@/components/admin/knowledge';

interface VulnerabilityItem {
  id: string;
  vulnId: string;
  cveId: string | null;
  title: string;
  titleKo: string;
  severity: string;
  cvssScore: number | null;
  affectedComponents: string[];
  publishedDate: string | null;
  tags: string[];
  isActive: boolean;
  trustMetadata: { confidence: number } | null;
  createdAt: string;
}

const filters: FilterDef[] = [
  {
    key: 'severity',
    label: '심각도',
    options: [
      { value: 'critical', label: 'Critical' },
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
    ],
  },
];

const columns: ColumnDef<VulnerabilityItem>[] = [
  {
    key: 'vulnId',
    label: 'Vuln ID',
    sortable: true,
    render: (item) => (
      <Link
        href={`/admin/knowledge/vulnerabilities/${item.id}`}
        className="text-blue-600 hover:text-blue-800 font-mono text-xs"
      >
        {item.vulnId}
      </Link>
    ),
  },
  {
    key: 'cveId',
    label: 'CVE ID',
    render: (item) => (
      <span className="font-mono text-xs text-gray-600">{item.cveId || '-'}</span>
    ),
  },
  {
    key: 'title',
    label: '제목',
    sortable: true,
    render: (item) => (
      <div>
        <div className="font-medium text-gray-900 text-sm">{item.titleKo}</div>
        <div className="text-xs text-gray-500">{item.title}</div>
      </div>
    ),
  },
  {
    key: 'severity',
    label: '심각도',
    sortable: true,
    render: (item) => <SeverityBadge severity={item.severity} />,
  },
  {
    key: 'cvssScore',
    label: 'CVSS',
    render: (item) => {
      if (item.cvssScore === null || item.cvssScore === undefined) {
        return <span className="text-gray-400">-</span>;
      }
      const score = item.cvssScore;
      let color = 'text-green-600';
      if (score >= 9.0) color = 'text-red-600';
      else if (score >= 7.0) color = 'text-orange-600';
      else if (score >= 4.0) color = 'text-yellow-600';

      return <span className={`font-semibold text-sm ${color}`}>{score.toFixed(1)}</span>;
    },
  },
  {
    key: 'publishedDate',
    label: '발행일',
    sortable: true,
    render: (item) => (
      <span className="text-sm text-gray-600">
        {item.publishedDate
          ? new Date(item.publishedDate).toLocaleDateString('ko-KR')
          : '-'}
      </span>
    ),
  },
];

const config: KnowledgeListConfig<VulnerabilityItem> = {
  entityPath: 'vulnerabilities',
  title: '취약점 관리',
  description: '인프라 취약점 조회 및 관리',
  addButtonLabel: '새 취약점 추가',
  addButtonColor: 'bg-rose-600 hover:bg-rose-700',
  columns,
  filters,
  deleteConfirmMessage: (item) => `취약점 "${item.titleKo}"을(를) 삭제하시겠습니까?`,
  emptyMessage: '등록된 취약점이 없습니다.',
};

export default function VulnerabilitiesPage() {
  return <KnowledgeListPage<VulnerabilityItem> config={config} />;
}
