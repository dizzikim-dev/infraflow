'use client';

/**
 * Knowledge 관리 페이지 공통 레이아웃
 *
 * 제목, 설명, 액션 버튼, 통계 카드, 콘텐츠 영역을 포함
 */

import { ReactNode } from 'react';

interface StatItem {
  label: string;
  value: number | string;
}

interface KnowledgePageLayoutProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  stats?: StatItem[];
  children: ReactNode;
}

const statColors = [
  'bg-blue-50 text-blue-700 border-blue-200',
  'bg-green-50 text-green-700 border-green-200',
  'bg-purple-50 text-purple-700 border-purple-200',
  'bg-orange-50 text-orange-700 border-orange-200',
  'bg-indigo-50 text-indigo-700 border-indigo-200',
  'bg-pink-50 text-pink-700 border-pink-200',
];

export default function KnowledgePageLayout({
  title,
  description,
  actions,
  stats,
  children,
}: KnowledgePageLayoutProps) {
  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>

      {/* 통계 바 */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`rounded-lg border p-4 ${statColors[index % statColors.length]}`}
            >
              <p className="text-xs font-medium opacity-75">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* 콘텐츠 */}
      <div>{children}</div>
    </div>
  );
}
