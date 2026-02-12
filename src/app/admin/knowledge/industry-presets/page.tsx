'use client';

/**
 * 산업별 프리셋 관리 목록 페이지
 */

import Link from 'next/link';
import { KnowledgeListPage } from '@/components/admin/knowledge';
import type { ColumnDef, FilterDef, KnowledgeListConfig } from '@/components/admin/knowledge';
import {
  INDUSTRY_TYPE_COLORS,
  INDUSTRY_TYPE_LABELS,
  SECURITY_LEVEL_COLORS,
  SECURITY_LEVEL_LABELS,
} from '@/lib/admin/badgeThemes';

interface IndustryPresetItem {
  id: string;
  industryType: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  minimumSecurityLevel: string;
  requiredFrameworks: string[];
  requiredComponents: string[];
  recommendedComponents: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const columns: ColumnDef<IndustryPresetItem>[] = [
  {
    key: 'industryType',
    label: '산업 유형',
    render: (item) => (
      <span
        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
          INDUSTRY_TYPE_COLORS[item.industryType] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {INDUSTRY_TYPE_LABELS[item.industryType] || item.industryType}
      </span>
    ),
  },
  {
    key: 'name',
    label: '이름',
    sortable: true,
    render: (item) => (
      <Link
        href={`/admin/knowledge/industry-presets/${item.id}`}
        className="text-blue-600 hover:text-blue-800"
      >
        <div>
          <div className="font-medium">{item.nameKo}</div>
          <div className="text-xs text-gray-500">{item.name}</div>
        </div>
      </Link>
    ),
  },
  {
    key: 'minimumSecurityLevel',
    label: '최소 보안 수준',
    render: (item) => (
      <span
        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
          SECURITY_LEVEL_COLORS[item.minimumSecurityLevel] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {SECURITY_LEVEL_LABELS[item.minimumSecurityLevel] || item.minimumSecurityLevel}
      </span>
    ),
  },
  {
    key: 'requiredFrameworks',
    label: '필수 프레임워크',
    render: (item) => (
      <span className="text-sm text-gray-600">
        {item.requiredFrameworks.length}개
      </span>
    ),
  },
  {
    key: 'requiredComponents',
    label: '필수 컴포넌트',
    render: (item) => (
      <span className="text-sm text-gray-600">
        {item.requiredComponents.length}개
      </span>
    ),
  },
];

const filters: FilterDef[] = [
  {
    key: 'industryType',
    label: '산업 유형',
    options: [
      { value: 'financial', label: '금융' },
      { value: 'healthcare', label: '의료' },
      { value: 'government', label: '공공' },
      { value: 'ecommerce', label: '이커머스' },
      { value: 'general', label: '일반' },
    ],
  },
];

const config: KnowledgeListConfig<IndustryPresetItem> = {
  entityPath: 'industry-presets',
  title: '산업별 프리셋 관리',
  description: '산업별 인프라 프리셋 조회 및 관리',
  addButtonLabel: '새 프리셋 추가',
  columns,
  filters,
  deleteConfirmMessage: (item) => `산업별 프리셋 "${item.nameKo}"을(를) 삭제하시겠습니까?`,
  emptyMessage: '등록된 산업별 프리셋이 없습니다.',
};

export default function IndustryPresetsPage() {
  return <KnowledgeListPage<IndustryPresetItem> config={config} />;
}
