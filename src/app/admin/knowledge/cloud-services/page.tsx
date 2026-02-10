'use client';

/**
 * 클라우드 서비스 관리 목록 페이지
 */

import Link from 'next/link';
import { KnowledgeListPage } from '@/components/admin/knowledge';
import type { ColumnDef, FilterDef, KnowledgeListConfig } from '@/components/admin/knowledge';

interface CloudServiceItem {
  id: string;
  serviceId: string;
  provider: string;
  serviceName: string;
  serviceNameKo: string;
  componentType: string;
  status: string;
  pricingTier: string;
  features: string[];
  featuresKo: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const providerColors: Record<string, string> = {
  aws: 'bg-orange-100 text-orange-800',
  azure: 'bg-blue-100 text-blue-800',
  gcp: 'bg-red-100 text-red-800',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  deprecated: 'bg-red-100 text-red-800',
  preview: 'bg-yellow-100 text-yellow-800',
  end_of_life: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<string, string> = {
  active: '활성',
  deprecated: '지원종료',
  preview: '미리보기',
  end_of_life: 'EOL',
};

const columns: ColumnDef<CloudServiceItem>[] = [
  {
    key: 'serviceId',
    label: '서비스 ID',
    sortable: true,
    render: (item) => (
      <Link
        href={`/admin/knowledge/cloud-services/${item.id}`}
        className="text-blue-600 hover:text-blue-800 font-mono text-xs"
      >
        {item.serviceId}
      </Link>
    ),
  },
  {
    key: 'provider',
    label: '프로바이더',
    render: (item) => (
      <span
        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
          providerColors[item.provider] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {item.provider.toUpperCase()}
      </span>
    ),
  },
  {
    key: 'serviceName',
    label: '서비스명',
    sortable: true,
    render: (item) => (
      <div>
        <div className="font-medium text-gray-900">{item.serviceName}</div>
        <div className="text-xs text-gray-500">{item.serviceNameKo}</div>
      </div>
    ),
  },
  {
    key: 'componentType',
    label: '컴포넌트 타입',
  },
  {
    key: 'status',
    label: '상태',
    render: (item) => (
      <span
        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
          statusColors[item.status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {statusLabels[item.status] || item.status}
      </span>
    ),
  },
  {
    key: 'pricingTier',
    label: '가격 티어',
  },
];

const filters: FilterDef[] = [
  {
    key: 'provider',
    label: '프로바이더',
    options: [
      { value: 'aws', label: 'AWS' },
      { value: 'azure', label: 'Azure' },
      { value: 'gcp', label: 'GCP' },
    ],
  },
  {
    key: 'status',
    label: '상태',
    options: [
      { value: 'active', label: '활성' },
      { value: 'deprecated', label: '지원종료' },
      { value: 'preview', label: '미리보기' },
      { value: 'end_of_life', label: 'EOL' },
    ],
  },
];

const config: KnowledgeListConfig<CloudServiceItem> = {
  entityPath: 'cloud-services',
  title: '클라우드 서비스 관리',
  description: '클라우드 서비스 카탈로그 조회 및 관리',
  addButtonLabel: '새 클라우드 서비스 추가',
  columns,
  filters,
  deleteConfirmMessage: (item) => `클라우드 서비스 "${item.serviceName}"을(를) 삭제하시겠습니까?`,
  emptyMessage: '등록된 클라우드 서비스가 없습니다.',
};

export default function CloudServicesPage() {
  return <KnowledgeListPage<CloudServiceItem> config={config} />;
}
